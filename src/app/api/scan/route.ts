import { NextRequest, NextResponse } from "next/server";
import { scanAddress, detectChain } from "@/lib/scanner";
import type { Chain } from "@/lib/cex-addresses";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, chain } = body as { address?: string; chain?: Chain };

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

    const result = await scanAddress(trimmed, detectedChain);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
