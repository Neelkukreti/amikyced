import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

const NP_API = "https://api.nowpayments.io/v1";
const NP_KEY = process.env.NOWPAYMENTS_API_KEY || "";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? verifySessionCookie(sessionCookie) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const paymentId = req.nextUrl.searchParams.get("id");
  if (!paymentId) return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });

  const res = await fetch(`${NP_API}/payment/${paymentId}`, {
    headers: { "x-api-key": NP_KEY },
  });

  if (!res.ok) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  const data = await res.json();
  return NextResponse.json({ status: data.payment_status, paymentId: data.payment_id });
}
