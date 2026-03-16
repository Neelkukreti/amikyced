import { NextRequest, NextResponse } from "next/server";
import { scanAddress, detectChain, isChainSupported } from "@/lib/scanner";
import type { ScanResult } from "@/lib/scanner";
import type { Chain } from "@/lib/cex-addresses";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";
import { canScan, recordScan, canScanIp, canDeepScanIp, recordScanIp } from "@/lib/usage-store";

// In-process scan cache: address+chain → result, TTL 10 min
const g = globalThis as typeof globalThis & { __scanCache?: Map<string, { result: unknown; ts: number }> };
if (!g.__scanCache) g.__scanCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function getCached(key: string) {
  const entry = g.__scanCache!.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { g.__scanCache!.delete(key); return null; }
  return entry.result;
}
function setCached(key: string, result: unknown) {
  if (g.__scanCache!.size > 500) {
    const oldest = [...g.__scanCache!.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    g.__scanCache!.delete(oldest[0]);
  }
  g.__scanCache!.set(key, { result, ts: Date.now() });
}

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
        { error: "Could not detect blockchain. Currently supported: EVM chains (0x...)" },
        { status: 400 }
      );
    }

    if (!isChainSupported(detectedChain)) {
      return NextResponse.json(
        { error: `${detectedChain.charAt(0).toUpperCase() + detectedChain.slice(1)} scanning is coming soon. Currently only EVM chains are supported.` },
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
        { error: ipCheck.reason, limitReached: true, cooldownRemaining: ipCheck.cooldownRemaining },
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
          { error: check.reason, limitReached: true, cooldownRemaining: check.cooldownRemaining },
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

    // Run scan (with cache)
    const cacheKey = `${trimmed.toLowerCase()}:${detectedChain}`;
    const cached = getCached(cacheKey) as ScanResult | null;
    const result: ScanResult = cached ? structuredClone(cached) : await scanAddress(trimmed, detectedChain);
    if (!cached) setCached(cacheKey, result);

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
