import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { consumeNonce } from "@/lib/nonce-store";
import { createSessionCookie, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { message, signature } = await req.json();
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature }, { suppressExceptions: true });

    if (!result.success) {
      console.error("[auth/verify] SIWE verification failed:", result.error);
      return NextResponse.json({ error: "Invalid signature", detail: result.error?.type }, { status: 401 });
    }

    const { data } = result;
    if (!consumeNonce(data.nonce)) {
      console.error("[auth/verify] Nonce invalid or expired:", data.nonce);
      return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 401 });
    }

    const cookie = createSessionCookie(data.address);
    const res = NextResponse.json({ address: data.address.toLowerCase(), ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[auth/verify] Unexpected error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });
  }
}
