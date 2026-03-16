import { NextRequest, NextResponse } from "next/server";

const g = globalThis as typeof globalThis & {
  __scanAnalytics?: {
    totalScans: number;
    uniqueAddresses: Set<string>;
    uniqueIps: Set<string>;
    firstScanAt?: string;
    scansPerHour: Record<string, number>;
  };
};

/** GET /api/analytics?secret=xxx — view scan usage stats */
export async function GET(req: NextRequest) {
  const syncSecret = process.env.SYNC_SECRET || "";
  const secret = req.nextUrl.searchParams.get("secret");
  if (!syncSecret || secret !== syncSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analytics = g.__scanAnalytics;
  if (!analytics) {
    return NextResponse.json({
      totalScans: 0,
      uniqueAddresses: 0,
      uniqueIps: 0,
      instanceUpSince: null,
      scansPerHour: {},
    });
  }

  return NextResponse.json({
    totalScans: analytics.totalScans,
    uniqueAddresses: analytics.uniqueAddresses.size,
    uniqueIps: analytics.uniqueIps.size,
    instanceUpSince: analytics.firstScanAt || null,
    scansPerHour: analytics.scansPerHour,
  });
}
