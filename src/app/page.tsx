"use client";

import { useState } from "react";

type Chain = "ethereum" | "solana" | "bitcoin" | "tron";

interface CexInteraction {
  exchange: string;
  label: string;
  direction: "sent" | "received";
  txHash: string;
  timestamp?: string;
  amount?: string;
  counterparty: string;
  indirect?: boolean;
}

interface IndirectExposure {
  intermediaryAddress: string;
  exchange: string;
  label: string;
  direction: "sent" | "received";
  confidence: "high" | "medium";
}

interface ScanResult {
  address: string;
  chain: Chain;
  isKyced: boolean;
  riskScore: number;
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  interactions: CexInteraction[];
  indirectExposures: IndirectExposure[];
  exchangesSeen: string[];
  totalInteractions: number;
  scanDuration: number;
  error?: string;
}

const CHAIN_INFO: Record<Chain, { name: string; color: string; icon: string }> = {
  ethereum: { name: "Ethereum / EVM", color: "#627EEA", icon: "ETH" },
  solana: { name: "Solana", color: "#9945FF", icon: "SOL" },
  bitcoin: { name: "Bitcoin", color: "#F7931A", icon: "BTC" },
  tron: { name: "TRON", color: "#FF0013", icon: "TRX" },
};

const RISK_COLORS = {
  none: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  low: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  medium: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  critical: { bg: "bg-red-600/20", text: "text-red-500", border: "border-red-600/50" },
};

const EXPLORER_URLS: Record<Chain, { tx: string; addr: string }> = {
  ethereum: { tx: "https://etherscan.io/tx/", addr: "https://etherscan.io/address/" },
  solana: { tx: "https://solscan.io/tx/", addr: "https://solscan.io/account/" },
  bitcoin: { tx: "https://mempool.space/tx/", addr: "https://mempool.space/address/" },
  tron: { tx: "https://tronscan.org/#/transaction/", addr: "https://tronscan.org/#/address/" },
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [chainOverride, setChainOverride] = useState<Chain | "auto">("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          chain: chainOverride === "auto" ? undefined : chainOverride,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scan failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight">
            AMI<span className="text-red-500">KYC</span>ED
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Check if a wallet has ever interacted with a centralized exchange
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Input Section */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Paste wallet address (0x..., T..., bc1..., or Solana)"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 font-mono"
            />
            <select
              value={chainOverride}
              onChange={(e) => setChainOverride(e.target.value as Chain | "auto")}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-300 focus:outline-none"
            >
              <option value="auto">Auto-detect</option>
              <option value="ethereum">Ethereum / EVM</option>
              <option value="solana">Solana</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="tron">TRON</option>
            </select>
            <button
              onClick={handleScan}
              disabled={loading || !address.trim()}
              className="rounded-xl bg-red-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning...
                </span>
              ) : (
                "Scan"
              )}
            </button>
          </div>

          {/* Chain badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(CHAIN_INFO).map(([key, info]) => (
              <span
                key={key}
                className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400"
              >
                {info.icon} {info.name}
              </span>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Risk Score Card */}
            <div
              className={`rounded-2xl border ${RISK_COLORS[result.riskLevel].border} ${RISK_COLORS[result.riskLevel].bg} p-8`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-400">KYC Exposure</p>
                  <p className={`mt-1 text-4xl font-bold ${RISK_COLORS[result.riskLevel].text}`}>
                    {result.isKyced ? "EXPOSED" : "CLEAN"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">Risk Score</p>
                  <p className={`text-5xl font-bold ${RISK_COLORS[result.riskLevel].text}`}>
                    {result.riskScore}
                  </p>
                  <p className={`text-sm font-medium uppercase ${RISK_COLORS[result.riskLevel].text}`}>
                    {result.riskLevel}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    result.riskScore >= 80
                      ? "bg-red-500"
                      : result.riskScore >= 60
                        ? "bg-red-400"
                        : result.riskScore >= 35
                          ? "bg-orange-400"
                          : result.riskScore > 0
                            ? "bg-yellow-400"
                            : "bg-emerald-400"
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Chain" value={CHAIN_INFO[result.chain]?.name ?? result.chain} />
              <StatCard label="CEX Interactions" value={result.totalInteractions.toString()} />
              <StatCard label="Exchanges Found" value={result.exchangesSeen.length.toString()} />
              <StatCard label="Scan Time" value={`${(result.scanDuration / 1000).toFixed(1)}s`} />
            </div>

            {/* Exchange Breakdown */}
            {result.exchangesSeen.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-semibold text-white">Exchanges Detected</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {result.exchangesSeen.map((ex) => {
                    const count = result.interactions.filter((i) => i.exchange === ex).length;
                    const sent = result.interactions.filter(
                      (i) => i.exchange === ex && i.direction === "sent"
                    ).length;
                    const received = result.interactions.filter(
                      (i) => i.exchange === ex && i.direction === "received"
                    ).length;
                    return (
                      <div
                        key={ex}
                        className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
                      >
                        <p className="text-sm font-semibold text-white">{ex}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {count} tx{count !== 1 ? "s" : ""} &middot;{" "}
                          {sent > 0 && (
                            <span className="text-red-400">{sent} sent </span>
                          )}
                          {received > 0 && (
                            <span className="text-emerald-400">{received} received</span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Indirect Exposure */}
            {result.indirectExposures && result.indirectExposures.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
                <h3 className="text-lg font-semibold text-amber-400">
                  Indirect Exposure Detected (2-hop)
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  These addresses interacted with your wallet AND with known CEX hot wallets — likely personal exchange deposit addresses.
                </p>
                <div className="mt-4 space-y-2">
                  {result.indirectExposures.map((exp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-zinc-800/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400">
                          2H
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {exp.exchange}{" "}
                            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                              exp.confidence === "high"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}>
                              {exp.confidence} confidence
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 font-mono">
                            {exp.intermediaryAddress.slice(0, 16)}...{exp.intermediaryAddress.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`${EXPLORER_URLS[result.chain].addr}${exp.intermediaryAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                      >
                        View Address
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Log */}
            {result.interactions.length > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-lg font-semibold text-white">
                  Transaction History ({result.totalInteractions})
                </h3>
                <div className="mt-4 space-y-2">
                  {result.interactions.map((ix, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            ix.indirect
                              ? "bg-amber-500/10 text-amber-400"
                              : ix.direction === "sent"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {ix.indirect ? "2H" : ix.direction === "sent" ? "OUT" : "IN"}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {ix.exchange}{" "}
                            <span className="text-xs text-zinc-500">({ix.label})</span>
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            {ix.timestamp && (
                              <span>{new Date(ix.timestamp).toLocaleDateString()}</span>
                            )}
                            {ix.amount && <span>&middot; {ix.amount}</span>}
                          </div>
                        </div>
                      </div>
                      <a
                        href={`${EXPLORER_URLS[result.chain].tx}${ix.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                      >
                        View TX
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scan error */}
            {result.error && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4 text-sm text-yellow-400">
                Note: {result.error}
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-16 border-t border-zinc-800/50 pt-8 text-center text-xs text-zinc-600">
          <p>
            AMIKYCED scans on-chain transaction history against a database of{" "}
            <span className="text-zinc-400">165+</span> known CEX wallet addresses across{" "}
            <span className="text-zinc-400">25+ exchanges</span>. Includes 2-hop indirect exposure detection.
          </p>
          <p className="mt-2">
            Supports Ethereum, Solana, Bitcoin, and TRON.
            No data is stored. All scans are ephemeral.
          </p>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
