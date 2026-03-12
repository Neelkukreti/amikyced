import { NextRequest, NextResponse } from "next/server";
import { scanAddress, detectChain } from "@/lib/scanner";
import type { Chain } from "@/lib/cex-addresses";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";
import { canScan, recordScan, canScanIp, canDeepScanIp, recordScanIp } from "@/lib/usage-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, chain, deep: requestDeep } = body as {
      address?: string;
      chain?: Chain;
      deep?: boolean;
    };

    if (!address || typeof address !== "string" || address.trim().length < 10) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const trimmed = address.trim();
    const detectedChain = chain || detectChain(trimmed);

    if (!detectedChain) {
      return NextResponse.json(
        { error: "Could not detect blockchain. Supported: EVM (0x...), Solana, Bitcoin, TRON (T...)" },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    // IP-level rate limit (applies to everyone)
    const ipCheck = canScanIp(ip);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: ipCheck.reason, limitReached: true },
        { status: 429 }
      );
    }

    // Auth check
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = sessionCookie ? verifySessionCookie(sessionCookie) : null;
    const isAuthenticated = !!session;

    // Determine if deep scan (2-hop) is allowed
    let deep = requestDeep !== false; // default true

    if (isAuthenticated && session) {
      const check = canScan(session.address, deep);
      if (!check.allowed) {
        return NextResponse.json(
          { error: check.reason, limitReached: true },
          { status: 429 }
        );
      }
      // Also check IP-level deep limit
      if (deep && !canDeepScanIp(ip)) {
        deep = false;
      }
    } else {
      // Anonymous: first scan gets full results, subsequent strip 2-hop
      // Check both cookie AND IP-based tracking
      const anonCount = Number(req.cookies.get("kycscan_anon")?.value || "0");
      if (anonCount > 0 || !canDeepScanIp(ip)) {
        deep = false;
      }
    }

    // Run scan
    const result = await scanAddress(trimmed, detectedChain);

    // Strip 2-hop data if not a deep scan
    if (!deep) {
      result.indirectExposures = [];
      result.interactions = result.interactions.filter((i) => !i.indirect);
      // Recalculate totals
      result.exchangesSeen = result.exchangesSeen.filter((e) => !e.includes("(indirect)"));
      result.totalInteractions = result.interactions.length;
    }

    // Record usage
    recordScanIp(ip, deep);
    if (isAuthenticated && session) {
      recordScan(session.address, trimmed, detectedChain, deep);
    }

    // Build response
    const res = NextResponse.json({
      ...result,
      deep,
      authRequired: !isAuthenticated && !deep,
    });

    // Increment anonymous scan counter
    if (!isAuthenticated) {
      const anonCount = Number(req.cookies.get("kycscan_anon")?.value || "0");
      res.cookies.set("kycscan_anon", String(anonCount + 1), {
        httpOnly: true,
        maxAge: 86400,
        path: "/",
      });
    }

    return res;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
