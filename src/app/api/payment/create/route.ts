import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

const NP_API = "https://api.nowpayments.io/v1";
const NP_KEY = process.env.NOWPAYMENTS_API_KEY || "";

const SUPPORTED_CURRENCIES: Record<string, string> = {
  usdttrc20:  "USDT (TRX)",
  usdteth:    "USDT (ETH)",
  usdtbsc:    "USDT (BSC)",
  usdtarbone: "USDT (ARB)",
  usdcbsc:    "USDC (BSC)",
};

const PLAN_PRICES: Record<string, number> = {
  basic: 4.99,
  pro:   9,
};

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  pro:   "Pro",
};

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? verifySessionCookie(sessionCookie) : null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!NP_KEY) return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });

  const { payCurrency, plan = "pro" } = await req.json().catch(() => ({}));
  if (!payCurrency || !SUPPORTED_CURRENCIES[payCurrency]) {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  }
  if (!PLAN_PRICES[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const body = {
    price_amount: PLAN_PRICES[plan],
    price_currency: "usd",
    pay_currency: payCurrency,
    order_id: `${plan}-${session.address.slice(0, 10)}-${Date.now()}`,
    order_description: `KYCScan ${PLAN_LABELS[plan]} — 30 days`,
  };

  const res = await fetch(`${NP_API}/payment`, {
    method: "POST",
    headers: {
      "x-api-key": NP_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[payment/create] NOWPayments error:", err);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({
    paymentId: data.payment_id,
    payAddress: data.pay_address,
    payAmount: data.pay_amount,
    payCurrency: data.pay_currency,
    status: data.payment_status,
    plan,
  });
}
