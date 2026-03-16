import { NextRequest, NextResponse } from "next/server";
import { scanAddress, detectChain, isChainSupported } from "@/lib/scanner";
import type { ScanResult } from "@/lib/scanner";
import type { Chain } from "@/lib/cex-addresses";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";
import { canScan, recordScan, canScanIp, recordScanIp } from "@/lib/usage-store";

// In-process scan cache: address+chain → result, TTL 10 min
const g = globalThis as typeof globalThis & {
  __scanCache?: Map<string, { result: unknown; ts: number }>;
  __scanAnalytics?: { totalScans: number; uniqueAddresses: Set<string>; uniqueIps: Set<string>; firstScanAt?: string; scansPerHour: Record<string, number> };
};
if (!g.__scanCache) g.__scanCache = new Map();
if (!g.__scanAnalytics) g.__scanAnalytics = { totalScans: 0, uniqueAddresses: new Set(), uniqueIps: new Set(), scansPerHour: {} };
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

    // 2-hop deep scan is always enabled for everyone
    const deep = true;

    if (isAuthenticated && session) {
      const check = canScan(session.address, deep);
      if (!check.allowed) {
        return NextResponse.json(
          { error: check.reason, limitReached: true, cooldownRemaining: check.cooldownRemaining },
          { status: 429 }
        );
      }
    }

    // Run scan (with cache)
    const cacheKey = `${trimmed.toLowerCase()}:${detectedChain}`;
    const cached = getCached(cacheKey) as ScanResult | null;
    const result: ScanResult = cached ? structuredClone(cached) : await scanAddress(trimmed, detectedChain);
    if (!cached) setCached(cacheKey, result);

    // 2-hop data is always included — no stripping needed

    // Track analytics (in-memory, survives within warm instance)
    const analytics = g.__scanAnalytics!;
    analytics.totalScans++;
    analytics.uniqueAddresses.add(trimmed.toLowerCase());
    analytics.uniqueIps.add(ip);
    if (!analytics.firstScanAt) analytics.firstScanAt = new Date().toISOString();
    const hourKey = new Date().toISOString().slice(0, 13); // "2026-03-16T18"
    analytics.scansPerHour[hourKey] = (analytics.scansPerHour[hourKey] || 0) + 1;

    // Record usage
    recordScanIp(ip, deep);
    if (isAuthenticated && session) {
      recordScan(session.address, trimmed, detectedChain, deep);
    }

    // Build response
    const res = NextResponse.json({
      ...result,
      deep,
      authRequired: false,
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
  } catch (err) {
    console.error("Scan API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
