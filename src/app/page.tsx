"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "@/hooks/useSession";

// const WalletButton = dynamic(() => import("@/components/WalletButton"), { ssr: false }); // Wallet connect disabled
// const UpgradeModal = dynamic(() => import("@/components/UpgradeModal"), { ssr: false }); // Monetization hidden

type Chain = "ethereum" | "solana" | "bitcoin" | "tron";

type EntityType = "cex" | "celebrity" | "sanctions" | "rugpull" | "smartmoney" | "fund" | "government" | "protocol";

interface CexInteraction {
  exchange: string;
  label: string;
  direction: "sent" | "received";
  txHash: string;
  timestamp?: string;
  amount?: string;
  counterparty: string;
  indirect?: boolean;
  suspected?: boolean;
  entityType?: EntityType;
}

const ENTITY_TYPE_CONFIG: Record<EntityType, { label: string; color: string; badgeColor: string; icon: string }> = {
  cex:        { label: "Exchange",    color: "text-[var(--threat)]",  badgeColor: "bg-[var(--threat)]/10 text-[var(--threat)] border-[var(--threat)]/20",   icon: "EX" },
  celebrity:  { label: "Celebrity",   color: "text-[var(--info)]",    badgeColor: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20",         icon: "VIP" },
  sanctions:  { label: "Sanctioned",  color: "text-[var(--threat)]",  badgeColor: "bg-[var(--threat)]/15 text-[var(--threat)] border-[var(--threat)]/25",   icon: "SAN" },
  rugpull:    { label: "Hack/Rug",    color: "text-[var(--caution)]", badgeColor: "bg-[var(--caution)]/10 text-[var(--caution)] border-[var(--caution)]/20", icon: "RUG" },
  smartmoney: { label: "Smart Money", color: "text-[var(--info)]",    badgeColor: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20",         icon: "SM" },
  fund:       { label: "Fund/MM",     color: "text-[var(--info)]",    badgeColor: "bg-[var(--info)]/10 text-[var(--info)] border-[var(--info)]/20",         icon: "FND" },
  government: { label: "Government",  color: "text-[var(--caution)]", badgeColor: "bg-[var(--caution)]/10 text-[var(--caution)] border-[var(--caution)]/20", icon: "GOV" },
  protocol:   { label: "Protocol",    color: "text-[var(--safe)]",    badgeColor: "bg-[var(--safe)]/10 text-[var(--safe)] border-[var(--safe)]/20",         icon: "PRO" },
};

interface IndirectExposure {
  intermediaryAddress: string;
  exchange: string;
  label: string;
  direction: "sent" | "received";
  confidence: "high" | "medium";
}

type ReputationGrade = "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

interface ScanResult {
  address: string;
  chain: Chain;
  isKyced: boolean;
  riskScore: number;
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  reputationScore: number;
  reputationGrade: ReputationGrade;
  interactions: CexInteraction[];
  indirectExposures: IndirectExposure[];
  exchangesSeen: string[];
  totalInteractions: number;
  scanDuration: number;
  celebrityConnections: string[];
  error?: string;
}

const GRADE_CONFIG: Record<ReputationGrade, { color: string; bg: string }> = {
  "A+": { color: "text-[var(--safe)]",    bg: "bg-[var(--safe)]/8" },
  "A":  { color: "text-[var(--safe)]",    bg: "bg-[var(--safe)]/8" },
  "B+": { color: "text-[var(--safe)]",    bg: "bg-[var(--safe)]/6" },
  "B":  { color: "text-[var(--caution)]", bg: "bg-[var(--caution)]/6" },
  "C":  { color: "text-[var(--caution)]", bg: "bg-[var(--caution)]/8" },
  "D":  { color: "text-[var(--threat)]",  bg: "bg-[var(--threat)]/8" },
  "F":  { color: "text-[var(--threat)]",  bg: "bg-[var(--threat)]/10" },
};

const CHAIN_INFO: Record<Chain, { name: string; color: string; icon: string }> = {
  ethereum: { name: "Ethereum", color: "#627EEA", icon: "⟠" },
  solana: { name: "Solana", color: "#9945FF", icon: "◎" },
  bitcoin: { name: "Bitcoin", color: "#F7931A", icon: "₿" },
  tron: { name: "TRON", color: "#FF0013", icon: "◆" },
};

const RISK_CONFIG = {
  none:     { color: "text-[var(--safe)]",    bg: "bg-[var(--safe)]",    border: "border-[var(--safe)]/20",    glow: "glow-safe" },
  low:      { color: "text-[var(--caution)]", bg: "bg-[var(--caution)]", border: "border-[var(--caution)]/20", glow: "" },
  medium:   { color: "text-[var(--caution)]", bg: "bg-[var(--caution)]", border: "border-[var(--caution)]/25", glow: "" },
  high:     { color: "text-[var(--threat)]",  bg: "bg-[var(--threat)]",  border: "border-[var(--threat)]/25",  glow: "glow-threat" },
  critical: { color: "text-[var(--threat)]",  bg: "bg-[var(--threat)]",  border: "border-[var(--threat)]/35",  glow: "glow-threat" },
};

const EXPLORER_URLS: Record<Chain, { tx: string; addr: string }> = {
  ethereum: { tx: "https://etherscan.io/tx/", addr: "https://etherscan.io/address/" },
  solana: { tx: "https://solscan.io/tx/", addr: "https://solscan.io/account/" },
  bitcoin: { tx: "https://mempool.space/tx/", addr: "https://mempool.space/address/" },
  tron: { tx: "https://tronscan.org/#/transaction/", addr: "https://tronscan.org/#/address/" },
};

interface ExchangeStat {
  exchange: string;
  addresses: number;
  chains: string[];
}

interface StatsData {
  exchanges: ExchangeStat[];
  suspected: ExchangeStat[];
  celebrities: ExchangeStat[];
  sanctions: ExchangeStat[];
  rugpulls: ExchangeStat[];
  smartMoney: ExchangeStat[];
  government: ExchangeStat[];
  protocols: ExchangeStat[];
  chains: { total: number; suspected: number; celebrities: number; sanctions: number; rugpulls: number; smartMoney: number; government: number; protocols: number; totalLabeled: number };
}

const CHAIN_ICONS: Record<string, string> = {
  ethereum: "⟠",
  solana: "◎",
  bitcoin: "₿",
  tron: "◆",
};

const AVAILABLE_LOGOS = new Set([
  "binance","bingx","bitfinex","bitflyer","bitget","bithumb","bitmart","bitstamp",
  "bitvavo","blockchain-com","bybit","celsius","coinbase","coindcx","coinex",
  "coinone","crypto-com","deribit","digifinex","ftx","gate-io","gemini","htx-huobi-",
  "korbit","kraken","kucoin","lbank","luno","mexc","okx","paribu","poloniex",
  "robinhood","upbit","voyager","wazirx","whitebit","wintermute","zebpay",
]);

function exchangeLogoUrl(name: string): string | null {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  return AVAILABLE_LOGOS.has(slug) ? `/exchanges/${slug}.png` : null;
}

function ExchangeLogo({ name, size = 16 }: { name: string; size?: number }) {
  const [error, setError] = useState(false);
  const src = exchangeLogoUrl(name);
  if (error || !src) return null;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="rounded-sm shrink-0 opacity-80"
      onError={() => setError(true)}
    />
  );
}

/* ── Decorative corner brackets ── */
function Corners({ color = "var(--accent)", opacity = 0.35, size = 12 }: { color?: string; opacity?: number; size?: number }) {
  const s = `${size}px`;
  const border = `1px solid ${color}`;
  return (
    <>
      <span style={{ position: "absolute", top: -1, left: -1, width: s, height: s, borderTop: border, borderLeft: border, opacity }} />
      <span style={{ position: "absolute", top: -1, right: -1, width: s, height: s, borderTop: border, borderRight: border, opacity }} />
      <span style={{ position: "absolute", bottom: -1, left: -1, width: s, height: s, borderBottom: border, borderLeft: border, opacity }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: s, height: s, borderBottom: border, borderRight: border, opacity }} />
    </>
  );
}

/* ── Status dot ── */
function StatusDot({ active = true }: { active?: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: "var(--accent)" }} />}
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: active ? "var(--accent)" : "var(--tertiary)" }} />
    </span>
  );
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [chainOverride, setChainOverride] = useState<Chain | "auto">("auto");
  const [loading, setLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [result, setResult] = useState<(ScanResult & { deep?: boolean; authRequired?: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [isIndia, setIsIndia] = useState(false);
  const [submitAddr, setSubmitAddr] = useState("");
  const [submitExchange, setSubmitExchange] = useState("");
  const [submitOther, setSubmitOther] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitMsg, setSubmitMsg] = useState("");
  const session = useSession();
  // session.refresh is already stable (useCallback with no deps in useSession)
  // Wrapping in another useCallback with `session` as dep would recreate it every render,
  // causing WalletButton's effect to re-fire mid-signing and trigger a second signature prompt.
  const onAuthSuccess = session.refresh;

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
    try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; setIsIndia(tz === "Asia/Calcutta" || tz === "Asia/Kolkata"); } catch {}
  }, []);

  useEffect(() => {
    if (result) {
      const t = setTimeout(() => setShowResult(true), 50);
      return () => clearTimeout(t);
    }
    setShowResult(false);
  }, [result]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { setError(null); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleScan() {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowResult(false);
    setScanPhase(0);

    const phaseTimers = [
      setTimeout(() => setScanPhase(1), 800),
      setTimeout(() => setScanPhase(2), 2200),
      setTimeout(() => setScanPhase(3), 4000),
      setTimeout(() => setScanPhase(4), 6000),
    ];

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          chain: chainOverride === "auto" ? undefined : chainOverride,
          deep: true,
        }),
      });
      const data = await res.json();
      phaseTimers.forEach(clearTimeout);
      if (!res.ok) {
        if (data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
          setError(`Wait ${data.cooldownRemaining}s before scanning again`);
        } else if (data.limitReached) {
          setError(`Daily limit reached. ${data.error}`);
        } else {
          setError(data.error || "Scan failed");
        }
      } else {
        setResult(data);
        if (!session.authenticated) session.incrementAnonScan();
      }
    } catch {
      phaseTimers.forEach(clearTimeout);
      setError("Network error — please try again");
    } finally {
      setLoading(false);
      setScanPhase(0);
    }
  }

  const risk = result ? RISK_CONFIG[result.riskLevel] : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--ink)" }}>

      {/* ── Top accent rule ── */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--accent) 30%, var(--accent) 70%, transparent)", opacity: 0.5 }} />

      {/* ══════════════════════════════════════
          NAV
         ══════════════════════════════════════ */}
      <nav style={{ borderBottom: "1px solid var(--edge)" }}>
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">

          {/* Wordmark */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <StatusDot active={!loading} />
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, letterSpacing: "0.1em" }}>
                <span style={{ color: "var(--accent)" }}>KYC</span>
                <span style={{ color: "var(--primary)" }}>_SCAN</span>
              </span>
            </div>
            <span className="hidden sm:flex items-center gap-2" style={{ borderLeft: "1px solid var(--edge)", paddingLeft: 16 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--secondary)" }}>CEX Exposure Scanner</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {stats && (
              <span className="hidden sm:block" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--secondary)" }}>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>{stats.chains.totalLabeled.toLocaleString()}</span> indexed
              </span>
            )}
            {session.authenticated && session.usage && (() => {
              const used = session.usage.totalScansToday;
              const limit = session.usage.totalScansLimit;
              const pct = limit === Infinity ? 0 : Math.min(1, used / limit);
              const barColor = pct < 0.5 ? "var(--safe)" : pct < 0.8 ? "var(--caution)" : "var(--threat)";
              return (
                <div className="hidden sm:flex items-center gap-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
                    <div style={{ width: 60, height: 4, background: "var(--edge-strong)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct * 100}%`, height: "100%", background: barColor, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--secondary)" }}>
                    {limit === Infinity ? `${used}/∞` : `${used}/${limit}`}
                  </span>
                  {/* Monetization UI hidden — re-enable when payments are live */}
                </div>
              );
            })()}
            {/* WalletButton disabled — re-enable when auth is needed */}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* ══════════════════════════════════════
            HERO — idle state
           ══════════════════════════════════════ */}
        {!result && !loading && (
          <section className="pt-16 pb-10 sm:pt-20 sm:pb-14 flex flex-col items-center text-center w-full" style={{ position: "relative" }}>

            {/* ── Animated background ── */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <svg width="900" height="700" viewBox="0 0 900 700" fill="none" className="hero-bg-svg" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.9 }}>
                {/* Pulsing rings */}
                <circle cx="450" cy="340" r="160" stroke="rgba(0,185,255,0.06)" strokeWidth="1" className="animate-ring-1" />
                <circle cx="450" cy="340" r="240" stroke="rgba(0,185,255,0.04)" strokeWidth="1" className="animate-ring-2" />
                <circle cx="450" cy="340" r="320" stroke="rgba(0,185,255,0.025)" strokeWidth="1" style={{ animation: "ring-expand 12s ease-in-out infinite 2s" }} />

                {/* Radar sweep line */}
                <g style={{ transformOrigin: "450px 340px" }} className="animate-scan">
                  <line x1="450" y1="340" x2="450" y2="140" stroke="url(#sweepGrad)" strokeWidth="1.5" />
                  <circle cx="450" cy="340" r="200" stroke="rgba(0,200,255,0.07)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                </g>

                {/* Orbit paths (dashed rings) */}
                <circle cx="450" cy="340" r="180" stroke="rgba(0,185,255,0.05)" strokeWidth="0.5" strokeDasharray="3 6" />
                <circle cx="450" cy="340" r="260" stroke="rgba(0,185,255,0.04)" strokeWidth="0.5" strokeDasharray="2 8" />
                <circle cx="450" cy="340" r="340" stroke="rgba(0,185,255,0.03)" strokeWidth="0.5" strokeDasharray="1 10" />

                {/* Orbiting nodes */}
                <g style={{ transformOrigin: "450px 340px" }} className="animate-orbit-1">
                  <circle cx="450" cy="160" r="5" fill="var(--threat)" opacity="0.7" />
                  <circle cx="450" cy="160" r="9" fill="var(--threat)" opacity="0.12" />
                </g>
                <g style={{ transformOrigin: "450px 340px" }} className="animate-orbit-1" >
                  <circle cx="450" cy="160" r="3.5" fill="var(--accent)" opacity="0.6" style={{ animationDelay: "-6s" }} />
                </g>
                <g style={{ transformOrigin: "450px 340px" }} className="animate-orbit-2">
                  <circle cx="450" cy="80" r="4" fill="var(--caution)" opacity="0.65" />
                  <circle cx="450" cy="80" r="8" fill="var(--caution)" opacity="0.1" />
                </g>
                <g style={{ transformOrigin: "450px 340px", animation: "orbit-2 28s linear infinite -8s" }}>
                  <circle cx="450" cy="80" r="3" fill="var(--safe)" opacity="0.5" />
                </g>
                <g style={{ transformOrigin: "450px 340px" }} className="animate-orbit-3">
                  <circle cx="450" cy="0" r="5" fill="var(--accent)" opacity="0.4" />
                  <circle cx="450" cy="0" r="10" fill="var(--accent)" opacity="0.07" />
                </g>
                <g style={{ transformOrigin: "450px 340px", animation: "orbit-3 40s linear infinite -15s reverse" }}>
                  <circle cx="450" cy="0" r="3" fill="var(--threat)" opacity="0.45" />
                </g>

                {/* Static connection lines from center to outer nodes */}
                {[30, 95, 155, 215, 280, 340].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const r1 = 80, r2 = [150, 200, 170, 220, 160, 190][i];
                  return (
                    <line key={i}
                      x1={450 + r1 * Math.cos(rad)} y1={340 + r1 * Math.sin(rad)}
                      x2={450 + r2 * Math.cos(rad)} y2={340 + r2 * Math.sin(rad)}
                      stroke="rgba(0,185,255,0.12)" strokeWidth="0.75"
                      strokeDasharray="3 4"
                      style={{ animation: `dash-flow ${2 + i * 0.4}s linear infinite` }}
                    />
                  );
                })}

                {/* Static peripheral nodes */}
                {[
                  { angle: 30,  r: 150, size: 4,   color: "rgba(0,185,255,0.5)",   delay: "0s" },
                  { angle: 95,  r: 200, size: 3.5, color: "rgba(255,61,61,0.55)",  delay: "0.8s" },
                  { angle: 155, r: 170, size: 5,   color: "rgba(0,232,150,0.45)",  delay: "1.4s" },
                  { angle: 215, r: 220, size: 3,   color: "rgba(0,185,255,0.4)",   delay: "2s" },
                  { angle: 280, r: 160, size: 4.5, color: "rgba(255,170,0,0.5)",   delay: "0.4s" },
                  { angle: 340, r: 190, size: 3.5, color: "rgba(0,185,255,0.45)",  delay: "1.8s" },
                ].map(({ angle, r, size, color, delay }, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 450 + r * Math.cos(rad);
                  const y = 340 + r * Math.sin(rad);
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={size} fill={color} style={{ animation: `float-node ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: delay }} />
                      <circle cx={x} cy={y} r={size * 2.5} fill={color} opacity="0.08" style={{ animation: `float-node ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: delay }} />
                    </g>
                  );
                })}

                {/* Center crosshair */}
                <g style={{ animation: "glow-pulse 4s ease-in-out infinite" }}>
                  <circle cx="450" cy="340" r="18" stroke="rgba(0,200,255,0.3)" strokeWidth="1" fill="rgba(0,200,255,0.04)" />
                  <circle cx="450" cy="340" r="4" fill="rgba(0,200,255,0.6)" />
                  <line x1="430" y1="340" x2="442" y2="340" stroke="rgba(0,200,255,0.5)" strokeWidth="1" />
                  <line x1="458" y1="340" x2="470" y2="340" stroke="rgba(0,200,255,0.5)" strokeWidth="1" />
                  <line x1="450" y1="320" x2="450" y2="332" stroke="rgba(0,200,255,0.5)" strokeWidth="1" />
                  <line x1="450" y1="348" x2="450" y2="360" stroke="rgba(0,200,255,0.5)" strokeWidth="1" />
                </g>

                <defs>
                  <linearGradient id="sweepGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(0,200,255,0)" />
                    <stop offset="100%" stopColor="rgba(0,200,255,0.4)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Eyebrow label */}
            <div className="animate-fade-in mb-6 flex items-center gap-3" style={{ position: "relative", zIndex: 1 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--edge-strong)", borderRadius: 20, padding: "5px 14px", background: "rgba(0,200,255,0.05)", fontFamily: "var(--font-display)", fontSize: 13, color: "var(--accent)", letterSpacing: "0.04em" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", opacity: 0.8 }} />
                Wallet Exposure Scanner
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up" style={{ fontSize: "clamp(2.2rem, 6vw, 4.2rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, maxWidth: 700, position: "relative", zIndex: 1 }}>
              Can Govt Track Your
              <br />
              <span style={{ color: "var(--accent)", position: "relative", display: "inline-block" }}>
                Crypto Wallet?
                <svg style={{ position: "absolute", bottom: -4, left: 0, width: "100%", height: 3 }} viewBox="0 0 100 3" preserveAspectRatio="none">
                  <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                </svg>
              </span>
            </h1>

            <p className="animate-fade-in-up stagger-1 mt-5" style={{ color: "var(--secondary)", maxWidth: 480, lineHeight: 1.7, fontSize: 16, position: "relative", zIndex: 1 }}>
              Detect connections to KYC-linked exchanges, sanctioned entities, and known identities across Ethereum, Arbitrum, BSC, Polygon, Optimism &amp; Base.
            </p>

            {/* ── Search form ── */}
            <div className="animate-fade-in-up stagger-2 mt-10 w-full max-w-3xl" style={{ position: "relative", zIndex: 1 }}>
              <div className="relative" style={{ position: "relative" }}>
                <Corners opacity={0.3} size={14} />
                <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 12, background: "var(--surface-0)", padding: 6 }}>

                  {/* Address label */}
                  <div className="px-2 pt-1 pb-2 flex items-center gap-2">
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 500, color: "var(--secondary)" }}>Wallet address</span>
                    <div style={{ flex: 1, height: 1, background: "var(--edge)" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 500, color: "var(--secondary)" }}>Chain</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading && handleScan()}
                        placeholder="0x..."
                        aria-label="Wallet address"
                        style={{
                          width: "100%",
                          background: "var(--surface-2)",
                          border: "1px solid var(--edge)",
                          borderRadius: 8,
                          padding: "13px 16px 13px 40px",
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          color: "var(--primary)",
                          outline: "none",
                          transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "var(--edge-focus)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "var(--edge)"; }}
                      />
                    </div>

                    <select
                      value={chainOverride}
                      onChange={(e) => setChainOverride(e.target.value as Chain | "auto")}
                      aria-label="Chain selection"
                      style={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--edge)",
                        borderRadius: 8,
                        padding: "13px 14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--secondary)",
                        cursor: "pointer",
                        outline: "none",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <option value="auto">AUTO</option>
                      <option value="ethereum">EVM</option>
                      <option value="solana" disabled>SOL (soon)</option>
                      <option value="bitcoin" disabled>BTC (soon)</option>
                      <option value="tron" disabled>TRX (soon)</option>
                    </select>

                    <button
                      onClick={handleScan}
                      disabled={!address.trim() || cooldown > 0}
                      style={{
                        background: address.trim() && cooldown <= 0 ? "var(--accent)" : "var(--surface-2)",
                        border: "1px solid " + (address.trim() && cooldown <= 0 ? "var(--accent)" : "var(--edge)"),
                        borderRadius: 8,
                        padding: "13px 28px",
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: 14,
                        letterSpacing: "0.03em",
                        color: address.trim() && cooldown <= 0 ? "var(--ink)" : "var(--tertiary)",
                        cursor: address.trim() && cooldown <= 0 ? "pointer" : "not-allowed",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                      }}
                      aria-label="Scan wallet exposure"
                    >
                      {cooldown > 0 ? `${cooldown}s` : "Scan Wallet"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chain pills */}
              <div className="animate-fade-in stagger-3 mt-5 flex items-center justify-center gap-6 chain-pills">
                {Object.entries(CHAIN_INFO).map(([, info]) => (
                  <span key={info.name} className="flex items-center gap-1.5" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--secondary)" }}>
                    <span style={{ color: info.color, fontSize: 14 }}>{info.icon}</span>
                    {info.name}
                  </span>
                ))}
              </div>

              {/* Privacy note */}
              <p className="animate-fade-in stagger-4 mt-3 flex items-center justify-center gap-1.5" style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--tertiary)" }}>
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                No wallet data stored · All scans ephemeral
              </p>
            </div>

            {/* Stats toggle */}
            {stats && (
              <div className="mt-10 flex flex-col items-center w-full max-w-2xl" style={{ zIndex: 1 }}>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-2 transition-colors"
                  style={{ fontFamily: "var(--font-display)", fontSize: 13, color: showStats ? "var(--accent)" : "var(--secondary)" }}
                  aria-label="Toggle wallet database"
                >
                  <svg className={`h-3 w-3 transition-transform ${showStats ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 12 12">
                    <path d="M4 2l6 4-6 4z" />
                  </svg>
                  Scanning {stats.chains.totalLabeled.toLocaleString()} labeled wallets
                </button>

                {showStats && (
                  <div className="mt-4 w-full animate-fade-in-up" style={{ border: "1px solid var(--edge-strong)", borderRadius: 12, background: "var(--surface-0)", padding: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--primary)" }}>Indexed Exchanges</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--secondary)" }}>{stats.exchanges.length} total</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {stats.exchanges.slice(0, 12).map((ex) => (
                        <div key={ex.exchange} style={{ border: "1px solid var(--edge)", borderRadius: 8, background: "var(--surface-1)", padding: "8px 12px", transition: "border-color 0.15s" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--edge-strong)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--edge)"; }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5" style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 500, color: "var(--primary)" }}>
                              <ExchangeLogo name={ex.exchange} size={13} />
                              {ex.exchange}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", background: "rgba(0,200,255,0.08)", padding: "2px 6px", borderRadius: 4 }}>{ex.addresses}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {stats.exchanges.length > 12 && (
                      <p className="mt-3 text-center" style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--secondary)" }}>
                        +{stats.exchanges.length - 12} more exchanges
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════
            SCAN ANIMATION
           ══════════════════════════════════════ */}
        {loading && (
          <section className="pt-12 pb-8 sm:pt-16 animate-fade-in">

            {/* Locked address bar */}
            <div className="mx-auto max-w-2xl mb-10">
              <div style={{ border: "1px solid var(--edge)", borderRadius: 12, background: "var(--surface-0)", padding: 8, opacity: 0.5 }}>
                <div className="flex items-center gap-3 px-3">
                  <svg className="h-4 w-4 shrink-0" style={{ color: "var(--tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--primary)", padding: "10px 0" }}>{address}</span>
                </div>
              </div>
            </div>

            {/* Scan terminal */}
            <div className="mx-auto max-w-2xl relative">
              <Corners opacity={0.25} size={16} />
              <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 16, background: "var(--surface-0)", padding: "28px 16px", overflow: "hidden" }} className="sm:!p-[40px_32px]">

                {/* Sweeping gradient */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(180deg, rgba(0,200,255,0.03) 0%, transparent 100%)",
                }} />

                <div className="flex flex-col items-center">

                  {/* Target reticle */}
                  <div style={{ position: "relative", width: 88, height: 88 }}>
                    {/* Outer ring */}
                    <svg style={{ position: "absolute", inset: 0, animation: "reticle-spin 8s linear infinite" }} viewBox="0 0 88 88" fill="none">
                      <circle cx="44" cy="44" r="40" stroke="var(--accent)" strokeWidth="0.75" strokeDasharray="6 4" opacity="0.3" />
                    </svg>
                    {/* Mid ring */}
                    <svg style={{ position: "absolute", inset: 10, animation: "reticle-spin-reverse 5s linear infinite" }} viewBox="0 0 68 68" fill="none">
                      <circle cx="34" cy="34" r="30" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 6" opacity="0.4" />
                    </svg>
                    {/* Crosshair lines */}
                    <svg style={{ position: "absolute", inset: 0 }} viewBox="0 0 88 88" fill="none">
                      <line x1="44" y1="4" x2="44" y2="20" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
                      <line x1="44" y1="68" x2="44" y2="84" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
                      <line x1="4" y1="44" x2="20" y2="44" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
                      <line x1="68" y1="44" x2="84" y2="44" stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
                      <circle cx="44" cy="44" r="5" stroke="var(--accent)" strokeWidth="1.5" opacity="0.8" />
                      <circle cx="44" cy="44" r="1.5" fill="var(--accent)" />
                    </svg>
                    {/* Ping */}
                    <div style={{
                      position: "absolute", inset: "50%", transform: "translate(-50%, -50%)",
                      width: 12, height: 12,
                    }}>
                      <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--accent)", opacity: 0.2 }} />
                    </div>
                  </div>

                  {/* Address */}
                  <p className="mt-4" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", opacity: 0.9, letterSpacing: "0.06em" }}>
                    {address.slice(0, 8)}···{address.slice(-6)}
                  </p>

                  {/* Nodes grid */}
                  <div className="relative mt-10 w-full">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: -44 }}>
                      {[0,1,2,3,4,5,6,7,8,9].map((i) => {
                        const col = i % 5;
                        const row = Math.floor(i / 5);
                        const x = ((col + 0.5) / 5) * 100;
                        const y = row === 0 ? 28 : 72;
                        return (
                          <line key={i} x1="50%" y1="0" x2={`${x}%`} y2={`${y}%`}
                            stroke="var(--edge-strong)" strokeWidth="1"
                            style={{ opacity: scanPhase >= Math.floor(i / 3) ? 0.35 : 0, transition: "opacity 0.6s", transitionDelay: `${i * 0.12}s` }}
                          />
                        );
                      })}
                    </svg>

                    <div className="grid grid-cols-5 gap-x-3 gap-y-5 relative scan-nodes-grid">
                      {[
                        { label: "wallet",   icon: "W", color: "var(--tertiary)",  glow: false, phase: 0 },
                        { label: "contract", icon: "C", color: "var(--tertiary)",  glow: false, phase: 0 },
                        { label: "wallet",   icon: "W", color: "var(--tertiary)",  glow: false, phase: 1 },
                        { label: "DEX",      icon: "D", color: "var(--safe)",      glow: false, phase: 1 },
                        { label: "wallet",   icon: "W", color: "var(--tertiary)",  glow: false, phase: 1 },
                        { label: "bridge",   icon: "B", color: "#818cf8",          glow: false, phase: 2 },
                        { label: "exchange", icon: "E", color: "var(--threat)",    glow: true,  phase: 2 },
                        { label: "wallet",   icon: "W", color: "var(--tertiary)",  glow: false, phase: 2 },
                        { label: "exchange", icon: "E", color: "var(--threat)",    glow: true,  phase: 3 },
                        { label: "flagged",  icon: "!",  color: "var(--caution)",  glow: true,  phase: 3 },
                      ].map((node, i) => (
                        <div key={i} className="flex flex-col items-center"
                          style={{
                            opacity: scanPhase >= node.phase ? 1 : 0,
                            transform: scanPhase >= node.phase ? "scale(1) translateY(0)" : "scale(0.5) translateY(14px)",
                            transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                            transitionDelay: `${i * 0.1}s`,
                          }}
                        >
                          <div style={{
                            width: 44, height: 44, borderRadius: "50%",
                            border: `1.5px solid ${node.color}`,
                            background: `color-mix(in srgb, ${node.color} 8%, transparent)`,
                            boxShadow: node.glow ? `0 0 16px color-mix(in srgb, ${node.color} 40%, transparent)` : "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                            color: node.color,
                          }}>
                            {node.icon}
                          </div>
                          <span className="mt-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: node.color, letterSpacing: "0.06em" }}>{node.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scan log */}
                  <div className="mt-10 w-full max-w-sm">
                    <div style={{ border: "1px solid var(--edge)", borderRadius: 8, background: "var(--ink)", padding: "14px 16px" }}>
                      <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: "1px solid var(--edge)" }}>
                        <StatusDot active />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--accent)" }}>SIGNAL TRACE ACTIVE</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { text: "Resolving address chain...",         phase: 0 },
                          { text: "Mapping wallet cluster...",          phase: 1 },
                          { text: "Cross-referencing exchange index...", phase: 2 },
                          { text: "Detecting KYC-linked addresses...",  phase: 3 },
                          { text: "Calculating exposure score...",      phase: 4 },
                        ].map((log, i) => (
                          <div key={i} className="flex items-center gap-2"
                            style={{
                              opacity: scanPhase >= log.phase ? 1 : 0.2,
                              transform: scanPhase >= log.phase ? "translateX(0)" : "translateX(-6px)",
                              transition: "all 0.3s",
                              transitionDelay: `${i * 0.08}s`,
                            }}
                          >
                            {scanPhase === log.phase ? (
                              <span className="shrink-0 h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                            ) : scanPhase > log.phase ? (
                              <svg className="shrink-0 h-3 w-3" style={{ color: "var(--safe)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="shrink-0 h-1.5 w-1.5 rounded-full" style={{ background: "var(--faint)" }} />
                            )}
                            <span style={{
                              fontFamily: "var(--font-mono)", fontSize: 12,
                              color: scanPhase > log.phase ? "var(--secondary)" : scanPhase === log.phase ? "var(--primary)" : "var(--tertiary)",
                            }}>
                              {log.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3" style={{ height: 2, borderRadius: 2, background: "var(--edge)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2, background: "var(--accent)",
                        width: `${Math.min((scanPhase + 1) * 20, 100)}%`,
                        transition: "width 0.7s ease-out",
                        boxShadow: "0 0 8px var(--accent)",
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Compact search bar when result is showing ── */}
        {result && !loading && (
          <div className="pt-6 pb-2">
            <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 10, background: "var(--surface-0)", padding: 6 }}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--tertiary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleScan()}
                    placeholder="Enter wallet address..."
                    aria-label="Wallet address"
                    style={{
                      width: "100%", background: "var(--surface-1)",
                      border: "1px solid var(--edge)", borderRadius: 7,
                      padding: "11px 16px 11px 40px",
                      fontFamily: "var(--font-mono)", fontSize: 14,
                      color: "var(--primary)", outline: "none",
                    }}
                  />
                </div>
                <select
                  value={chainOverride}
                  onChange={(e) => setChainOverride(e.target.value as Chain | "auto")}
                  aria-label="Chain selection"
                  style={{
                    background: "var(--surface-1)", border: "1px solid var(--edge)",
                    borderRadius: 7, padding: "11px 14px",
                    fontFamily: "var(--font-mono)", fontSize: 13,
                    color: "var(--secondary)", cursor: "pointer", outline: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  <option value="auto">AUTO</option>
                  <option value="ethereum">EVM</option>
                  <option value="solana" disabled>SOL (soon)</option>
                  <option value="bitcoin" disabled>BTC (soon)</option>
                  <option value="tron" disabled>TRX (soon)</option>
                </select>
                <button
                  onClick={handleScan}
                  disabled={!address.trim() || cooldown > 0}
                  style={{
                    background: cooldown > 0 ? "var(--surface-2)" : "var(--accent)",
                    border: "1px solid " + (cooldown > 0 ? "var(--edge)" : "var(--accent)"),
                    borderRadius: 7, padding: "11px 22px",
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                    letterSpacing: "0.08em",
                    color: cooldown > 0 ? "var(--caution)" : "var(--ink)",
                    cursor: cooldown > 0 ? "not-allowed" : "pointer",
                    opacity: address.trim() && cooldown <= 0 ? 1 : 0.4,
                  }}
                  aria-label="Scan wallet"
                >
                  {cooldown > 0 ? `${cooldown}s` : "RESCAN"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage bar */}
        {session.authenticated && session.usage && (
          <div className="mt-3 flex items-center justify-end gap-3">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)", display: "flex", alignItems: "center", gap: 5 }}>
              {session.usage.deepScansLimit - session.usage.deepScansUsed}/{session.usage.deepScansLimit} deep scans
              <span
                title="Deep scan = 2-hop analysis. Checks not just your wallet's direct interactions, but also the wallets you transacted with — catching indirect exposure to exchanges, mixers, or flagged entities."
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 16, height: 16, borderRadius: "50%",
                  border: "1px solid var(--edge)", color: "var(--tertiary)",
                  fontSize: 11, fontWeight: 700, cursor: "help", flexShrink: 0,
                  fontFamily: "var(--font-display)",
                }}
              >?</span>
            </span>
            <span style={{ color: "var(--tertiary)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)" }}>
              {session.usage.totalScansLimit - session.usage.totalScansToday}/{session.usage.totalScansLimit} total
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 animate-fade-in-up" style={{
            border: cooldown > 0 ? "1px solid rgba(255,170,0,0.25)" : "1px solid rgba(255,61,61,0.25)",
            borderRadius: 8,
            background: cooldown > 0 ? "rgba(255,170,0,0.05)" : "rgba(255,61,61,0.05)",
            padding: "14px 18px",
            fontFamily: "var(--font-mono)", fontSize: 13,
            color: cooldown > 0 ? "var(--caution)" : "var(--threat)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cooldown > 0 ? (
                <>
                  <span style={{ fontWeight: 700, letterSpacing: "0.1em", fontSize: 12 }}>COOLDOWN</span>
                  <span>Wait {cooldown}s before scanning again</span>
                  <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 18, fontFamily: "var(--font-display)", color: "var(--caution)" }}>{cooldown}s</span>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 700, letterSpacing: "0.1em", fontSize: 12 }}>ERR</span>
                  <span>{error}</span>
                </>
              )}
            </div>
            {/* Upgrade CTA hidden — re-enable when payments are live */}
          </div>
        )}

        {/* ══════════════════════════════════════
            RESULTS
           ══════════════════════════════════════ */}
        {result && (
          <div className={`mt-8 space-y-4 transition-all duration-500 ${showResult ? "opacity-100" : "opacity-0"}`}>

            {/* ── Intelligence Assessment header ── */}
            <div className="flex items-center gap-3 py-1">
              <div style={{ height: 1, width: 24, background: "var(--accent)", opacity: 0.5 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--accent)" }}>Intelligence Assessment</span>
              <div style={{ flex: 1, height: 1, background: "var(--edge)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--secondary)" }}>{new Date().toISOString().split("T")[0]}</span>
            </div>

            {/* ── Hero result card ── */}
            <div className="relative overflow-hidden" style={{
              border: `1px solid`,
              borderColor: risk!.border.replace("border-", "").replace("[", "").replace("]", ""),
              borderRadius: 14,
              background: "var(--surface-0)",
            }}>
              <Corners color={result.isKyced ? "var(--threat)" : "var(--safe)"} opacity={0.4} size={16} />

              {/* Top accent bar */}
              <div style={{
                height: 2,
                background: result.isKyced
                  ? "linear-gradient(90deg, var(--threat), rgba(255,61,61,0.2))"
                  : "linear-gradient(90deg, var(--safe), rgba(0,232,150,0.2))",
              }} />

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

                  {/* Left: verdict */}
                  <div className="animate-fade-in-up">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--secondary)" }}>KYC Exposure Status</span>
                    <div className={`mt-3 score-reveal ${risk!.color}`} style={{ fontSize: "clamp(3rem,8vw,5rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                      {result.isKyced ? "EXPOSED" : "CLEAN"}
                    </div>
                    <p className="mt-2" style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)" }}>
                      {result.address.slice(0, 10)}···{result.address.slice(-8)}
                    </p>
                  </div>

                  {/* Right: scores */}
                  <div className="animate-fade-in-up stagger-1 flex gap-8 shrink-0">
                    <div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--secondary)" }}>Threat Score</span>
                      <div className={`mt-2 score-reveal tabular-nums ${risk!.color}`} style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 700, lineHeight: 1 }}>
                        {result.riskScore}
                      </div>
                      <span className="intel-label" style={{
                        color: "var(--ink)", background: `var(--${result.riskLevel === "none" ? "safe" : result.riskLevel === "low" || result.riskLevel === "medium" ? "caution" : "threat"})`,
                        padding: "2px 8px", borderRadius: 3, marginTop: 6, display: "inline-block",
                        opacity: 0.9,
                      }}>{result.riskLevel.toUpperCase()}</span>
                    </div>
                    <div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--secondary)" }}>Reputation</span>
                      <div className={`mt-2 score-reveal ${GRADE_CONFIG[result.reputationGrade]?.color || "text-zinc-400"}`} style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 700, lineHeight: 1, animationDelay: "0.25s" }}>
                        {result.reputationGrade}
                      </div>
                      <span className="intel-label" style={{ color: "var(--tertiary)" }}>{result.reputationScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Risk bar */}
                <div className="mt-7" style={{ height: 3, borderRadius: 3, background: "var(--edge)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${Math.max(result.riskScore, 2)}%`,
                    transition: "width 1s ease-out",
                    background: result.riskScore > 60 ? "var(--threat)" : result.riskScore > 25 ? "var(--caution)" : "var(--safe)",
                    boxShadow: `0 0 8px ${result.riskScore > 60 ? "var(--threat)" : result.riskScore > 25 ? "var(--caution)" : "var(--safe)"}`,
                  }} />
                </div>

                {/* Scores explainer */}
                <details className="mt-5 group">
                  <summary className="cursor-pointer flex items-center gap-1.5 transition-colors" style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)" }}>
                    <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    What do these scores mean?
                  </summary>
                  <div className="mt-3 animate-fade-in" style={{ border: "1px solid var(--edge)", borderRadius: 8, background: "var(--surface-1)", padding: "14px 16px" }}>
                    <p style={{ fontSize: 14, color: "var(--secondary)", lineHeight: 1.6, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--primary)" }}>Threat Score (0–100)</span> — Measures KYC-linked or risky activity. 0 = no detected exchange interactions. Higher = more exposure to exchanges, sanctioned entities, or hacked protocols.
                    </p>
                    <p style={{ fontSize: 14, color: "var(--secondary)", lineHeight: 1.6, marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, color: "var(--primary)" }}>Reputation Grade (A+ to F)</span> — Overall wallet health. A+ = clean. Lower grades = connections to flagged addresses.
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {[["A+/A","var(--safe)","Clean"],["B+","#4ade80","Mostly clean"],["B","var(--caution)","Some exposure"],["C","#fb923c","Moderate risk"],["D/F","var(--threat)","High risk"]].map(([g,c,l]) => (
                        <span key={g} className="intel-label" style={{ color: "var(--tertiary)" }}>
                          <span style={{ fontWeight: 700, color: c }}>{g}</span> = {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            </div>

            {/* ── Auth-required banner (wallet connect disabled) ── */}
            {result.authRequired && (
              <div className="animate-fade-in-up" style={{ border: "1px solid rgba(255,170,0,0.25)", borderRadius: 12, background: "rgba(255,170,0,0.04)", padding: 18 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--caution)" }}>2-hop indirect exposure hidden</p>
                <p className="mt-1" style={{ fontSize: 13, color: "var(--secondary)", fontFamily: "var(--font-mono)" }}>
                  Full 2-hop analysis is available for authenticated users. Coming soon.
                </p>
              </div>
            )}

            {/* ── Sanctions warning ── */}
            {result.interactions.some((i) => i.entityType === "sanctions") && (
              <div className="animate-fade-in-up" style={{ border: "2px solid rgba(255,61,61,0.4)", borderRadius: 12, background: "rgba(255,20,20,0.07)", padding: 18 }}>
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 22 }}>⛔</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--threat)" }}>OFAC Sanctions Exposure Detected</p>
                    <p className="mt-1" style={{ fontSize: 13, color: "rgba(255,140,140,0.85)", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
                      This wallet has interacted with OFAC-sanctioned addresses (Tornado Cash, Lazarus Group, etc.).
                      May affect centralized service access and compliance systems.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Rug pull warning ── */}
            {result.interactions.some((i) => i.entityType === "rugpull") && (
              <div className="animate-fade-in-up" style={{ border: "1px solid rgba(255,140,0,0.3)", borderRadius: 12, background: "rgba(255,100,0,0.05)", padding: 18 }}>
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 22 }}>💀</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--caution)" }}>Hack/Rug Pull Exposure Detected</p>
                    <p className="mt-1" style={{ fontSize: 13, color: "rgba(255,180,80,0.85)", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
                      This wallet has interacted with addresses linked to known hacks or rug pulls.
                      Funds from these sources may be flagged by compliance systems.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Celebrity / degrees of separation ── */}
            {(result.celebrityConnections?.length > 0 || result.interactions.some((i) => i.entityType === "celebrity")) && (() => {
              const directCelebs = [...new Set(result.interactions.filter((i) => i.entityType === "celebrity" && !i.indirect).map((i) => i.exchange))];
              const indirectCelebs = [...new Set(result.interactions.filter((i) => i.entityType === "celebrity" && i.indirect).map((i) => i.exchange))];
              const allCelebs = [...new Set([...directCelebs, ...indirectCelebs, ...(result.celebrityConnections || [])])];
              const minDegree = directCelebs.length > 0 ? 1 : 2;
              return (
                <div className="animate-fade-in-up" style={{ border: "1px solid rgba(167,139,250,0.25)", borderRadius: 12, background: "rgba(139,92,246,0.05)", padding: 18 }}>
                  <div className="flex items-start gap-3">
                    <span style={{ fontSize: 22 }}>⭐</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#c4b5fd" }}>
                        {minDegree === 1 ? "Direct" : `${minDegree} Degrees of`} Separation from Notable Wallets
                      </p>
                      <p className="mt-1" style={{ fontSize: 13, color: "rgba(196,181,253,0.8)", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
                        On-chain connections to notable wallets detected. 1 hop = direct tx. 2 hops = through intermediary.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {allCelebs.map((name) => {
                          const isDirect = directCelebs.includes(name);
                          return (
                            <span key={name} className="flex items-center gap-1.5" style={{
                              border: `1px solid ${isDirect ? "rgba(167,139,250,0.3)" : "rgba(167,139,250,0.15)"}`,
                              borderRadius: 6, padding: "5px 10px",
                              background: isDirect ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.05)",
                              fontSize: 14, fontWeight: 600,
                              color: isDirect ? "#c4b5fd" : "rgba(196,181,253,0.7)",
                            }}>
                              <ExchangeLogo name={name} size={13} />
                              {name}
                              <span className="intel-label" style={{
                                background: isDirect ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.1)",
                                padding: "1px 5px", borderRadius: 3,
                                color: isDirect ? "#c4b5fd" : "rgba(196,181,253,0.5)",
                              }}>{isDirect ? "1 hop" : "2 hops"}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-in-up stagger-2">
              <Stat label="Chain" value={CHAIN_INFO[result.chain]?.name ?? result.chain} icon={CHAIN_INFO[result.chain]?.icon} />
              <Stat label="Interactions" value={result.totalInteractions.toString()} />
              <Stat label="Entities" value={result.exchangesSeen.length.toString()} />
              <Stat label="Scan Time" value={`${(result.scanDuration / 1000).toFixed(1)}s`} />
            </div>

            {/* ── Entities detected ── */}
            {result.exchangesSeen.length > 0 && (
              <div className="animate-fade-in-up stagger-3" style={{ border: "1px solid var(--edge)", borderRadius: 12, background: "var(--surface-0)", padding: "20px 24px" }}>
                <SectionTitle>Entities Detected</SectionTitle>
                <p className="mt-2 mb-4" style={{ fontSize: 14, color: "var(--secondary)", lineHeight: 1.5 }}>
                  Known wallets your address interacted with.{" "}
                  <span style={{ color: "var(--threat)" }}>↑</span> = you sent,{" "}
                  <span style={{ color: "var(--safe)" }}>↓</span> = you received.
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.exchangesSeen.map((ex) => {
                    const exInteractions = result.interactions.filter((i) => i.exchange === ex || i.exchange === ex.replace(" (indirect)", ""));
                    const count = exInteractions.length;
                    const sent = exInteractions.filter((i) => i.direction === "sent").length;
                    const received = exInteractions.filter((i) => i.direction === "received").length;
                    const isIndirect = ex.includes("(indirect)");
                    const etype = exInteractions.find((i) => i.entityType)?.entityType || "cex";
                    const etConfig = ENTITY_TYPE_CONFIG[etype];
                    const assetTotals: Record<string, number> = {};
                    for (const ix of exInteractions) {
                      if (!ix.amount) continue;
                      const parts = ix.amount.match(/^([\d.]+)\s+(.+)$/);
                      if (parts) {
                        const val = parseFloat(parts[1]);
                        const asset = parts[2];
                        if (!isNaN(val)) assetTotals[asset] = (assetTotals[asset] || 0) + val;
                      }
                    }
                    const topAssets = Object.entries(assetTotals).sort((a, b) => b[1] - a[1]).slice(0, 2);
                    return (
                      <div key={ex} style={{
                        border: `1px solid ${isIndirect ? "rgba(255,170,0,0.2)" : "var(--edge-strong)"}`,
                        borderRadius: 8, padding: "10px 14px",
                        background: isIndirect ? "rgba(255,170,0,0.04)" : "var(--surface-1)",
                      }}>
                        <p className="flex items-center gap-1.5" style={{
                          fontSize: 13, fontWeight: 600,
                          color: isIndirect ? "var(--caution)" : etype !== "cex" ? etConfig.color.replace("text-[", "").replace("]", "") : "var(--primary)",
                        }}>
                          <ExchangeLogo name={ex.replace(" (indirect)", "")} size={15} />
                          {ex}
                          {etype !== "cex" && (
                            <span className="intel-label" style={{
                              border: "1px solid currentColor", borderRadius: 3, padding: "1px 5px", opacity: 0.8,
                            }}>{etConfig.label}</span>
                          )}
                        </p>
                        <p className="mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--secondary)" }}>
                          {count} tx{count !== 1 ? "s" : ""}
                          {sent > 0 && <span style={{ color: "var(--threat)", marginLeft: 6 }}>↑{sent}</span>}
                          {received > 0 && <span style={{ color: "var(--safe)", marginLeft: 4 }}>↓{received}</span>}
                        </p>
                        {topAssets.length > 0 && (
                          <p className="mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--primary)" }}>
                            {topAssets.map(([asset, total], i) => (
                              <span key={asset}>
                                {i > 0 && <span style={{ color: "var(--tertiary)" }}> · </span>}
                                {total % 1 === 0 ? total : total < 0.01 ? total.toFixed(4) : total.toFixed(2)}{" "}
                                <span style={{ color: "var(--secondary)" }}>{asset}</span>
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Indirect exposure (2-hop) ── */}
            {result.indirectExposures && result.indirectExposures.length > 0 && (
              <div className="animate-fade-in-up stagger-4" style={{ border: "1px solid rgba(255,170,0,0.2)", borderRadius: 12, background: "rgba(255,170,0,0.03)", padding: "20px 24px" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 4, background: "rgba(255,170,0,0.15)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--caution)" }}>2</span>
                  <SectionTitle className="text-amber-400">Indirect Exposure (2-hop)</SectionTitle>
                </div>

                <details className="mb-5 group" open>
                  <summary className="cursor-pointer flex items-center gap-1.5 transition-colors" style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--caution)" }}>
                    <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    What does 2-hop indirect exposure mean?
                  </summary>
                  <div className="mt-3 animate-fade-in" style={{ border: "1px solid rgba(255,170,0,0.12)", borderRadius: 8, background: "rgba(255,170,0,0.04)", padding: "14px 16px" }}>
                    <p style={{ fontSize: 14, color: "var(--secondary)", lineHeight: 1.6, marginBottom: 8 }}>
                      Your wallet didn&apos;t directly interact with an exchange — but someone you transacted with did. This is <span style={{ color: "var(--caution)", fontWeight: 600 }}>&quot;2-hop&quot;</span>: 2 steps to reach the exchange.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 13, fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                      <span style={{ border: "1px solid var(--edge-strong)", borderRadius: 5, padding: "4px 8px", color: "var(--primary)", background: "var(--surface-1)" }}>Your Wallet</span>
                      <span style={{ color: "var(--caution)" }}>→ hop 1 →</span>
                      <span style={{ border: "1px solid rgba(255,170,0,0.2)", borderRadius: 5, padding: "4px 8px", color: "var(--caution)", background: "rgba(255,170,0,0.05)" }}>Middleman</span>
                      <span style={{ color: "var(--threat)" }}>→ hop 2 →</span>
                      <span style={{ border: "1px solid rgba(255,61,61,0.2)", borderRadius: 5, padding: "4px 8px", color: "var(--threat)", background: "rgba(255,61,61,0.05)" }}>Exchange</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--secondary)" }}>
                      <span style={{ color: "var(--caution)", fontWeight: 600 }}>Confidence:</span> &quot;High&quot; = middleman has 5+ exchange txs. &quot;Medium&quot; = 2–4 txs.
                    </p>
                  </div>
                </details>

                <div className="space-y-4">
                  {result.indirectExposures.map((exp, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-0">
                        <div className="exposure-box" style={{ width: 120, flexShrink: 0 }}>
                          <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 8, background: "var(--surface-1)", padding: "8px 10px", textAlign: "center" }}>
                            <div className="intel-label" style={{ color: "var(--secondary)", marginBottom: 2 }}>You</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--primary)" }}>
                              {result.address.slice(0, 6)}···{result.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 40 }}>
                          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, var(--edge-strong), rgba(255,170,0,0.4))", position: "relative" }}>
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,170,0,0.3))", animation: "hopPulse 2s ease-in-out infinite", animationDelay: `${i * 0.3}s` }} />
                          </div>
                          <svg style={{ flexShrink: 0, width: 10, height: 10, color: "rgba(255,170,0,0.5)", marginLeft: -2 }} viewBox="0 0 12 12" fill="currentColor"><path d="M2 6l7-4v8z" /></svg>
                        </div>
                        <div className="exposure-box" style={{ width: 120, flexShrink: 0 }}>
                          <a href={`${EXPLORER_URLS[result.chain].addr}${exp.intermediaryAddress}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: "block", border: "1px solid rgba(255,170,0,0.25)", borderRadius: 8, background: "rgba(255,170,0,0.05)", padding: "8px 10px", textAlign: "center", textDecoration: "none", transition: "all 0.15s" }}
                            aria-label={`View intermediary ${exp.intermediaryAddress.slice(0, 8)}`}
                          >
                            <div className="intel-label" style={{ color: "rgba(255,170,0,0.7)", marginBottom: 2 }}>Hop 1</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--caution)" }}>
                              {exp.intermediaryAddress.slice(0, 6)}···{exp.intermediaryAddress.slice(-4)}
                            </div>
                          </a>
                        </div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 40 }}>
                          <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, rgba(255,170,0,0.4), rgba(255,61,61,0.5))", position: "relative" }}>
                            <div style={{ position: "absolute", inset: 0, animation: "hopPulse 2s ease-in-out infinite", animationDelay: `${i * 0.3 + 0.5}s` }} />
                          </div>
                          <svg style={{ flexShrink: 0, width: 10, height: 10, color: "rgba(255,61,61,0.5)", marginLeft: -2 }} viewBox="0 0 12 12" fill="currentColor"><path d="M2 6l7-4v8z" /></svg>
                        </div>
                        <div className="exposure-box" style={{ width: 120, flexShrink: 0 }}>
                          <div style={{ border: "1px solid rgba(255,61,61,0.25)", borderRadius: 8, background: "rgba(255,61,61,0.05)", padding: "8px 10px", textAlign: "center" }}>
                            <div className="intel-label" style={{ color: "rgba(255,61,61,0.7)", marginBottom: 2 }}>{exp.exchange}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--threat)" }}>{exp.label}</div>
                            <span className="intel-label" style={{
                              display: "inline-block", marginTop: 4,
                              background: exp.confidence === "high" ? "rgba(255,61,61,0.12)" : "rgba(255,170,0,0.12)",
                              color: exp.confidence === "high" ? "var(--threat)" : "var(--caution)",
                              padding: "1px 6px", borderRadius: 3,
                            }}>{exp.confidence} conf</span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-center intel-label" style={{ color: "var(--tertiary)" }}>
                        intermediary {exp.direction === "sent" ? "deposits to" : "withdraws from"} {exp.exchange}
                      </p>
                    </div>
                  ))}
                </div>

                {result.interactions.filter(i => !i.indirect).length > 0 && (
                  <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,170,0,0.1)" }}>
                    <div className="intel-label mb-3" style={{ color: "var(--secondary)" }}>Direct (1-hop) connections</div>
                    {result.interactions.filter(i => !i.indirect).slice(0, 5).map((ix, i) => (
                      <div key={i} className="flex items-center gap-0 mb-3">
                        <div className="exposure-box" style={{ width: 120, flexShrink: 0 }}>
                          <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 8, background: "var(--surface-1)", padding: "6px 8px", textAlign: "center" }}>
                            <div className="intel-label" style={{ color: "var(--secondary)" }}>You</div>
                          </div>
                        </div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 60 }}>
                          <div style={{ flex: 1, height: 2, background: ix.direction === "sent" ? "linear-gradient(90deg, var(--edge-strong), rgba(255,61,61,0.5))" : "linear-gradient(90deg, rgba(0,232,150,0.5), var(--edge-strong))" }} />
                          <svg style={{ flexShrink: 0, width: 10, height: 10, color: ix.direction === "sent" ? "rgba(255,61,61,0.5)" : "rgba(0,232,150,0.5)", marginLeft: -2 }} viewBox="0 0 12 12" fill="currentColor"><path d="M2 6l7-4v8z" /></svg>
                        </div>
                        <div className="exposure-box" style={{ width: 120, flexShrink: 0 }}>
                          <div style={{ border: "1px solid rgba(255,61,61,0.2)", borderRadius: 8, background: "rgba(255,61,61,0.04)", padding: "6px 8px", textAlign: "center" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--threat)" }}>{ix.exchange}</div>
                            <div className="intel-label" style={{ color: "var(--secondary)" }}>{ix.label}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Exposure map (direct only) ── */}
            {(!result.indirectExposures || result.indirectExposures.length === 0) && result.interactions.length > 0 && (
              <div className="animate-fade-in-up stagger-4" style={{ border: "1px solid var(--edge)", borderRadius: 12, background: "var(--surface-0)", padding: "20px 24px" }}>
                <SectionTitle>Exposure Map</SectionTitle>
                <p className="mt-2 mb-5" style={{ fontSize: 14, color: "var(--secondary)", lineHeight: 1.5 }}>
                  Direct transactions to known entities.{" "}
                  <span style={{ color: "var(--threat)" }}>Red arrows</span> = sent funds.{" "}
                  <span style={{ color: "var(--safe)" }}>Green arrows</span> = received funds.
                </p>
                <div className="space-y-3">
                  {result.interactions.slice(0, 8).map((ix, i) => (
                    <div key={i} className="flex items-center gap-0">
                      <div className="exposure-box" style={{ width: 130, flexShrink: 0 }}>
                        <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 8, background: "var(--surface-1)", padding: "8px 10px", textAlign: "center" }}>
                          <div className="intel-label" style={{ color: "var(--secondary)", marginBottom: 1 }}>You</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--primary)" }}>
                            {result.address.slice(0, 6)}···{result.address.slice(-4)}
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 60, position: "relative" }}>
                        <div style={{ flex: 1, height: 2, background: ix.direction === "sent" ? "linear-gradient(90deg, var(--edge-strong), rgba(255,61,61,0.5))" : "linear-gradient(90deg, rgba(0,232,150,0.5), var(--edge-strong))", position: "relative" }}>
                          <div style={{ position: "absolute", inset: 0, opacity: 0.4, animation: "hopPulse 2.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
                        </div>
                        {ix.direction === "sent" ? (
                          <svg style={{ flexShrink: 0, width: 10, height: 10, color: "rgba(255,61,61,0.55)", marginLeft: -2 }} viewBox="0 0 12 12" fill="currentColor"><path d="M2 6l7-4v8z" /></svg>
                        ) : (
                          <svg style={{ flexShrink: 0, width: 10, height: 10, color: "rgba(0,232,150,0.55)", transform: "rotate(180deg)" }} viewBox="0 0 12 12" fill="currentColor"><path d="M2 6l7-4v8z" /></svg>
                        )}
                        {ix.amount && (
                          <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: -18, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--secondary)", background: "var(--surface-0)", padding: "0 4px", whiteSpace: "nowrap" }}>
                            {ix.amount}
                          </span>
                        )}
                      </div>
                      <div className="exposure-box" style={{ width: 130, flexShrink: 0 }}>
                        <div style={{ border: "1px solid rgba(255,61,61,0.2)", borderRadius: 8, background: "rgba(255,61,61,0.04)", padding: "8px 10px", textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--threat)" }}>{ix.exchange}</div>
                          <div className="intel-label" style={{ color: "var(--secondary)" }}>{ix.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Transaction log ── */}
            {result.interactions.length > 0 && (
              <div className="animate-fade-in-up stagger-5" style={{ border: "1px solid var(--edge)", borderRadius: 12, background: "var(--surface-0)", padding: "20px 24px" }}>
                <div className="flex items-center gap-2 mb-4">
                  <SectionTitle>Transaction Log</SectionTitle>
                  <span className="intel-label" style={{ background: "var(--surface-1)", padding: "2px 8px", borderRadius: 4, color: "var(--secondary)" }}>
                    {result.totalInteractions}
                  </span>
                </div>
                <div className="space-y-1">
                  {result.interactions.map((ix, i) => {
                    const etype = ix.entityType || "cex";
                    const etConfig = ENTITY_TYPE_CONFIG[etype];
                    const badgeText = ix.indirect ? "2H" : ix.suspected ? "?" : etype !== "cex" ? etConfig.icon : ix.direction === "sent" ? "OUT" : "IN";
                    const badgeBg = ix.indirect ? "rgba(255,170,0,0.1)" : ix.suspected ? "rgba(167,139,250,0.1)" : etype !== "cex" ? undefined : ix.direction === "sent" ? "rgba(255,61,61,0.08)" : "rgba(0,232,150,0.08)";
                    const badgeColor = ix.indirect ? "var(--caution)" : ix.suspected ? "#c4b5fd" : etype !== "cex" ? undefined : ix.direction === "sent" ? "var(--threat)" : "var(--safe)";
                    return (
                      <div key={i} className="group flex items-center justify-between tx-row"
                        style={{ borderRadius: 7, border: "1px solid transparent", padding: "10px 12px", transition: "all 0.12s", cursor: "default" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--edge)"; (e.currentTarget as HTMLElement).style.background = "var(--surface-1)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                          <span style={{
                            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                            width: 30, height: 30, borderRadius: 5,
                            background: badgeBg, color: badgeColor,
                            fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                          }}>{badgeText}</span>
                          <ExchangeLogo name={ix.exchange} size={16} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, color: "var(--primary)" }}>
                              <span style={{ fontWeight: 600 }}>{ix.exchange}</span>
                              <span style={{ marginLeft: 6, fontSize: 13, color: "var(--secondary)" }}>{ix.label}</span>
                              {etype !== "cex" && !ix.suspected && (
                                <span className="intel-label" style={{
                                  marginLeft: 6, border: "1px solid currentColor", borderRadius: 3, padding: "1px 4px",
                                  color: etConfig.color.replace("text-[","").replace("]","").replace("var(--","var(--"),
                                  opacity: 0.8,
                                }}>{etConfig.label}</span>
                              )}
                              {ix.suspected && ix.label?.startsWith("Community:") && (
                                <span className="intel-label" style={{ marginLeft: 6, background: "rgba(99,102,241,0.12)", color: "#818cf8", padding: "1px 5px", borderRadius: 3 }}>community</span>
                              )}
                              {ix.suspected && !ix.label?.startsWith("Community:") && (
                                <span className="intel-label" style={{ marginLeft: 6, background: "rgba(167,139,250,0.12)", color: "#c4b5fd", padding: "1px 5px", borderRadius: 3 }}>suspected</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--secondary)", marginTop: 2 }}>
                              {ix.timestamp && <span>{new Date(ix.timestamp).toLocaleDateString()}</span>}
                              {ix.amount && (
                                <span style={{ fontWeight: 600, color: ix.direction === "sent" ? "var(--threat)" : "var(--safe)" }}>
                                  {ix.direction === "sent" ? "−" : "+"}{ix.amount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {ix.txHash && (
                          <a href={`${EXPLORER_URLS[result.chain].tx}${ix.txHash}`} target="_blank" rel="noopener noreferrer"
                            className="intel-label shrink-0 ml-3 transition-colors"
                            style={{ border: "1px solid transparent", borderRadius: 5, padding: "4px 8px", color: "var(--tertiary)", textDecoration: "none" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--edge)"; (e.currentTarget as HTMLElement).style.color = "var(--secondary)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--tertiary)"; }}
                            aria-label={`View transaction ${ix.txHash.slice(0, 8)}`}
                          >TX →</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scan warning */}
            {result.error && (
              <div style={{ border: "1px solid rgba(255,170,0,0.15)", borderRadius: 8, background: "rgba(255,170,0,0.04)", padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: 14, color: "rgba(255,170,0,0.75)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, letterSpacing: "0.1em", fontSize: 12 }}>WARN</span>
                {result.error}
              </div>
            )}
          </div>
        )}

        {/* ── India Fedha Academy promo ── */}
        {isIndia && result && (
          <div className="mt-6 animate-fade-in-up" style={{
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%)",
            padding: "18px 22px",
          }}>
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "rgb(129,140,248)", fontFamily: "var(--font-display)" }}>
                  🎓 Learn Crypto for Free
                </p>
                <p className="mt-1" style={{ fontSize: 14, color: "var(--secondary)", lineHeight: 1.6 }}>
                  Master crypto trading, DeFi, and blockchain fundamentals with <span style={{ fontWeight: 600, color: "rgb(165,180,252)" }}>Fedha Academy</span> — free courses built for Indian investors.
                </p>
              </div>
              <a
                href="https://fedhaacademy.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink: 0,
                  border: "1px solid rgba(99,102,241,0.4)",
                  borderRadius: 8,
                  background: "rgba(99,102,241,0.1)",
                  padding: "10px 20px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "rgb(129,140,248)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                Start Learning →
              </a>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            SUBMIT ADDRESS
           ══════════════════════════════════════ */}
        <div className="mt-16" style={{ borderTop: "1px solid var(--edge)", paddingTop: 32 }}>
          <details className="group">
            <summary className="cursor-pointer flex items-center gap-2 transition-colors" style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--secondary)" }}>
              <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              Know an exchange wallet? Help us expand the database
            </summary>
            <div className="mt-4 animate-fade-in" style={{ border: "1px solid var(--edge-strong)", borderRadius: 12, background: "var(--surface-0)", padding: 20 }}>
              <p className="mb-4" style={{ fontSize: 13, color: "var(--secondary)", lineHeight: 1.6 }}>
                Submit a wallet address you believe belongs to an exchange. It will appear in scan results as a community-submitted address.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={submitAddr}
                  onChange={(e) => setSubmitAddr(e.target.value)}
                  placeholder="0x..."
                  aria-label="Wallet address to submit"
                  style={{
                    flex: 2, background: "var(--surface-2)", border: "1px solid var(--edge)",
                    borderRadius: 8, padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 13,
                    color: "var(--primary)", outline: "none",
                  }}
                />
                <select
                  value={submitExchange}
                  onChange={(e) => setSubmitExchange(e.target.value)}
                  aria-label="Exchange name"
                  style={{
                    flex: 1, background: "var(--surface-2)", border: "1px solid var(--edge)",
                    borderRadius: 8, padding: "10px 14px", fontFamily: "var(--font-display)", fontSize: 13,
                    color: submitExchange ? "var(--primary)" : "var(--tertiary)", outline: "none",
                    appearance: "none", WebkitAppearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
                  }}
                >
                  <option value="" disabled>Select exchange</option>
                  {[
                    "Binance", "Coinbase", "Kraken", "OKX", "Bybit", "KuCoin", "Gate.io",
                    "Gemini", "Bitfinex", "HTX (Huobi)", "Crypto.com", "Bitstamp", "Bitget",
                    "MEXC", "BingX", "Deribit", "Phemex", "Pionex", "BitMart", "LBank",
                    "AscendEX", "Poloniex", "ProBit", "Toobit", "WhiteBIT", "DigiFinex",
                    "CoinEx", "Hotbit", "Bitrue", "Bitvavo", "Luno",
                    "WazirX", "CoinDCX", "ZebPay", "Coinhako",
                    "Upbit", "Bithumb", "Coinone", "Korbit", "Paribu",
                    "BTCTurk", "Independent Reserve", "BitFlyer",
                    "Robinhood", "Blockchain.com", "BlockFi", "Voyager",
                  ].map((ex) => <option key={ex} value={ex}>{ex}</option>)}
                  <option value="__other__">Other...</option>
                </select>
                {submitExchange === "__other__" && (
                  <input
                    type="text"
                    value={submitOther}
                    onChange={(e) => setSubmitOther(e.target.value)}
                    placeholder="Exchange name"
                    aria-label="Other exchange name"
                    maxLength={50}
                    style={{
                      flex: 1, background: "var(--surface-2)", border: "1px solid var(--edge)",
                      borderRadius: 8, padding: "10px 14px", fontFamily: "var(--font-display)", fontSize: 13,
                      color: "var(--primary)", outline: "none",
                    }}
                  />
                )}
                <button
                  disabled={!submitAddr.trim() || (!submitExchange || (submitExchange === "__other__" && !submitOther.trim())) || submitStatus === "loading"}
                  onClick={async () => {
                    const exchangeName = submitExchange === "__other__" ? submitOther.trim() : submitExchange;
                    setSubmitStatus("loading");
                    setSubmitMsg("");
                    try {
                      const res = await fetch("/api/submit", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ address: submitAddr.trim(), exchange: exchangeName }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setSubmitStatus("error");
                        setSubmitMsg(data.error || "Submission failed");
                      } else {
                        setSubmitStatus("success");
                        setSubmitMsg("Submitted! This address will now appear in scan results.");
                        setSubmitAddr("");
                        setSubmitExchange("");
                        setSubmitOther("");
                        setTimeout(() => setSubmitStatus("idle"), 5000);
                      }
                    } catch {
                      setSubmitStatus("error");
                      setSubmitMsg("Network error — please try again");
                    }
                  }}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--edge-strong)",
                    borderRadius: 8, padding: "10px 18px",
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
                    color: submitAddr.trim() && (submitExchange && (submitExchange !== "__other__" || submitOther.trim())) ? "var(--accent)" : "var(--tertiary)",
                    cursor: submitAddr.trim() && (submitExchange && (submitExchange !== "__other__" || submitOther.trim())) ? "pointer" : "not-allowed",
                    whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                >
                  {submitStatus === "loading" ? "..." : "Submit"}
                </button>
              </div>
              {submitMsg && (
                <p className="mt-3" style={{
                  fontSize: 13, fontFamily: "var(--font-mono)",
                  color: submitStatus === "success" ? "var(--safe)" : "var(--threat)",
                }}>
                  {submitMsg}
                </p>
              )}
            </div>
          </details>
        </div>

        <div className="mt-8 pb-8" />

      </main>

      {/* UpgradeModal hidden — re-enable when payments are live
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => { setShowUpgrade(false); session.refresh(); }}
        />
      )}
      */}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="relative" style={{ border: "1px solid var(--edge)", borderRadius: 10, background: "var(--surface-0)", padding: "16px 18px" }}>
      <Corners opacity={0.2} size={8} />
      <p className="intel-label" style={{ color: "var(--tertiary)" }}>{label}</p>
      <p className="mt-2" style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={className} style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: className ? undefined : "var(--secondary)" }}>
      {children}
    </h3>
  );
}
