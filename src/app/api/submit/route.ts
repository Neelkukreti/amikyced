import { NextRequest, NextResponse } from "next/server";
import { detectChain } from "@/lib/scanner";
import { lookupCex, lookupSuspectedCex, lookupAny } from "@/lib/cex-addresses";
import { canSubmit, addSubmission } from "@/lib/submission-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, exchange } = body as { address?: string; exchange?: string };

    if (!address || typeof address !== "string" || address.trim().length < 10) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    if (!exchange || typeof exchange !== "string" || exchange.trim().length < 1 || exchange.trim().length > 50) {
      return NextResponse.json({ error: "Exchange name required (1-50 characters)" }, { status: 400 });
    }

    const trimmed = address.trim();
    const chain = detectChain(trimmed);

    if (!chain) {
      return NextResponse.json({ error: "Could not detect chain. Please enter a valid EVM address (0x...)." }, { status: 400 });
    }

    // Check if already in our database
    const existing = lookupCex(trimmed, chain) || lookupSuspectedCex(trimmed, chain) || lookupAny(trimmed, chain);
    if (existing) {
      return NextResponse.json({ error: `This address is already in our database as ${existing.exchange}.` }, { status: 409 });
    }

    // Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    const check = canSubmit(ip);
    if (!check.allowed) {
      return NextResponse.json({ error: check.reason, cooldownRemaining: check.cooldownRemaining }, { status: 429 });
    }

    const added = addSubmission(trimmed, exchange.trim(), chain, ip);
    if (!added) {
      return NextResponse.json({ error: "This address has already been submitted." }, { status: 409 });
    }

    return NextResponse.json({ success: true, chain });
  } catch (err) {
    console.error("Submit API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
