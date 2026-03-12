import { NextResponse } from "next/server";
import { getExchangeStats, CHAIN_STATS, SUSPECTED_CEX, CELEBRITY_WALLETS, SANCTIONS_WALLETS, RUGPULL_WALLETS, SMART_MONEY_WALLETS, GOVERNMENT_WALLETS, PROTOCOL_WALLETS } from "@/lib/cex-addresses";

function groupByExchange(wallets: { exchange: string; chain: string }[]) {
  return [...new Set(wallets.map((a) => a.exchange))].map((exchange) => {
    const addrs = wallets.filter((a) => a.exchange === exchange);
    return { exchange, addresses: addrs.length, chains: [...new Set(addrs.map((a) => a.chain))].sort() };
  }).sort((a, b) => b.addresses - a.addresses);
}

export async function GET() {
  return NextResponse.json({
    exchanges: getExchangeStats(),
    suspected: groupByExchange(SUSPECTED_CEX),
    celebrities: groupByExchange(CELEBRITY_WALLETS),
    sanctions: groupByExchange(SANCTIONS_WALLETS),
    rugpulls: groupByExchange(RUGPULL_WALLETS),
    smartMoney: groupByExchange([...SMART_MONEY_WALLETS]),
    government: groupByExchange(GOVERNMENT_WALLETS),
    protocols: groupByExchange(PROTOCOL_WALLETS),
    chains: CHAIN_STATS,
  });
}
