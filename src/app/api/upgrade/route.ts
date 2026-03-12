import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";
import { upgradePlan } from "@/lib/usage-store";

const NP_API = "https://api.nowpayments.io/v1";
const NP_KEY = process.env.NOWPAYMENTS_API_KEY || "";

const FINISHED_STATUSES = new Set(["finished", "confirmed", "sending"]);

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? verifySessionCookie(sessionCookie) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentId, plan = "pro" } = await req.json().catch(() => ({}));
  if (!paymentId || typeof paymentId !== "string") {
    return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
  }
  if (plan !== "basic" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!NP_KEY) return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });

  // Verify server-to-server with NOWPayments — never trust client-reported status
  const npRes = await fetch(`${NP_API}/payment/${paymentId}`, {
    headers: { "x-api-key": NP_KEY },
  });

  if (!npRes.ok) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const payment = await npRes.json();

  if (!FINISHED_STATUSES.has(payment.payment_status)) {
    return NextResponse.json(
      { error: `Payment not complete yet (status: ${payment.payment_status})` },
      { status: 400 }
    );
  }

  const ok = upgradePlan(session.address, String(paymentId), plan as "basic" | "pro");
  if (!ok) return NextResponse.json({ error: "Payment already applied" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
