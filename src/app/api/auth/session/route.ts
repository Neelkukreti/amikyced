import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getUsage, getActivePlan } from "@/lib/usage-store";

const LIMITS = {
  free:  { scans: 5,        deepScans: 3  },
  basic: { scans: 20,       deepScans: 10 },
  pro:   { scans: Infinity, deepScans: Infinity },
};

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false });
  }
  const session = verifySessionCookie(sessionCookie);
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  const usage = getUsage(session.address);
  const plan = getActivePlan(usage);
  const limits = LIMITS[plan];
  return NextResponse.json({
    authenticated: true,
    address: session.address,
    usage: {
      plan,
      deepScansUsed: usage.free_deep_scans_used,
      totalScansToday: usage.total_scans_today,
      deepScansLimit: limits.deepScans,
      totalScansLimit: limits.scans,
    },
  });
}
