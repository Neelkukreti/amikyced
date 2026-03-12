"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Stage = "plan" | "currency" | "creating" | "waiting" | "confirming" | "verifying" | "success" | "error";

interface PaymentInfo {
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  plan: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "$4.99",
    period: "/ 30 days",
    color: "#8ab8d4",
    borderColor: "rgba(138,184,212,0.3)",
    bgColor: "rgba(138,184,212,0.04)",
    features: ["20 scans / day", "10 deep scans / day"],
    missing: ["Unlimited access"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/ 30 days",
    color: "#00c8ff",
    borderColor: "rgba(0,200,255,0.3)",
    bgColor: "rgba(0,200,255,0.05)",
    features: ["Unlimited scans", "Unlimited deep scans", "Priority access"],
    missing: [],
    highlight: true,
  },
];

const CURRENCIES = [
  { id: "usdttrc20",  label: "USDT", network: "TRX",  color: "#26A17B" },
  { id: "usdteth",    label: "USDT", network: "ETH",  color: "#627EEA" },
  { id: "usdtbsc",    label: "USDT", network: "BSC",  color: "#F3BA2F" },
  { id: "usdtarbone", label: "USDT", network: "ARB",  color: "#28A0F0" },
  { id: "usdcbsc",    label: "USDC", network: "BSC",  color: "#2775CA" },
];

function Corners({ opacity = 0.35, size = 12 }: { opacity?: number; size?: number }) {
  const s = `${size}px`;
  const b = `1px solid var(--accent)`;
  return (
    <>
      <span style={{ position: "absolute", top: -1, left: -1, width: s, height: s, borderTop: b, borderLeft: b, opacity }} />
      <span style={{ position: "absolute", top: -1, right: -1, width: s, height: s, borderTop: b, borderRight: b, opacity }} />
      <span style={{ position: "absolute", bottom: -1, left: -1, width: s, height: s, borderBottom: b, borderLeft: b, opacity }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: s, height: s, borderBottom: b, borderRight: b, opacity }} />
    </>
  );
}

function Spinner({ size = 36 }: { size?: number }) {
  return (
    <>
      <style>{`@keyframes np-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: size, height: size, border: "2.5px solid var(--edge-strong)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "np-spin 1s linear infinite", flexShrink: 0 }} />
    </>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      style={{ background: copied ? "rgba(0,232,150,0.1)" : "rgba(0,200,255,0.08)", border: `1px solid ${copied ? "rgba(0,232,150,0.3)" : "var(--edge-strong)"}`, borderRadius: 8, padding: "6px 14px", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: copied ? "var(--safe)" : "var(--accent)", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" as const }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function UpgradeModal({ onClose, onSuccess }: Props) {
  const [stage, setStage] = useState<Stage>("plan");
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const verifyAndUpgrade = useCallback(async (paymentId: string, plan: string) => {
    stopPolling();
    setStage("verifying");
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStage("success");
        onSuccess();
      } else {
        setErrorMsg(data.error || "Upgrade failed");
        setStage("error");
      }
    } catch {
      setErrorMsg("Network error");
      setStage("error");
    }
  }, [stopPolling, onSuccess]);

  const startPolling = useCallback((paymentId: string, plan: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?id=${paymentId}`);
        const data = await res.json().catch(() => ({}));
        if (data.status === "confirming" || data.status === "partially_paid") setStage("confirming");
        if (data.status === "finished" || data.status === "confirmed" || data.status === "sending") {
          await verifyAndUpgrade(paymentId, plan);
        }
        if (data.status === "failed" || data.status === "expired") {
          stopPolling();
          setErrorMsg(`Payment ${data.status}`);
          setStage("error");
        }
      } catch { /* ignore poll errors */ }
    }, 10000);
  }, [stopPolling, verifyAndUpgrade]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  async function handleCreate() {
    if (!selectedCurrency) return;
    setStage("creating");
    setErrorMsg("");
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payCurrency: selectedCurrency, plan: selectedPlan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.payAddress) {
        setErrorMsg(data.error || "Failed to generate payment address");
        setStage("error");
        return;
      }
      setPayment(data);
      setStage("waiting");
      startPolling(data.paymentId, data.plan);
    } catch {
      setErrorMsg("Network error");
      setStage("error");
    }
  }

  const planInfo = PLANS.find(p => p.id === selectedPlan);
  const currencyInfo = CURRENCIES.find(c => c.id === selectedCurrency);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(2,4,8,0.88)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{ position: "relative", background: "var(--surface-0)", border: "1px solid var(--edge-strong)", borderRadius: 16, width: "100%", maxWidth: 480, padding: "32px 28px", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <Corners opacity={0.4} size={14} />
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "var(--secondary)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "2px 6px" }}>×</button>

        {/* ── PLAN SELECTION ── */}
        {stage === "plan" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--primary)", margin: "0 0 4px" }}>Upgrade your plan</h2>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--secondary)", margin: "0 0 24px" }}>30 days · Pay with USDT or USDC · No subscription</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{ border: `1px solid ${selectedPlan === plan.id ? plan.borderColor : "var(--edge)"}`, background: selectedPlan === plan.id ? plan.bgColor : "var(--surface-1)", borderRadius: 12, padding: "16px 14px", cursor: "pointer", textAlign: "left" as const, transition: "all 0.15s", position: "relative" as const }}
                >
                  {plan.highlight && (
                    <span style={{ position: "absolute", top: -1, right: 12, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: plan.color, background: "var(--surface-0)", padding: "2px 6px", borderRadius: "0 0 6px 6px", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>BEST VALUE</span>
                  )}
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: selectedPlan === plan.id ? plan.color : "var(--primary)", margin: "0 0 4px" }}>{plan.name}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: plan.color, margin: "0 0 12px", lineHeight: 1 }}>
                    {plan.price} <span style={{ fontSize: 11, color: "var(--tertiary)", fontWeight: 400 }}>{plan.period}</span>
                  </p>
                  {plan.features.map(f => (
                    <p key={f} style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--secondary)", margin: "0 0 5px", display: "flex", gap: 5, alignItems: "center" }}>
                      <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>
                      {f}
                      {f.toLowerCase().includes("deep scan") && (
                        <span
                          title="Deep scan = 2-hop analysis. Checks not just your wallet's direct interactions, but also the wallets you transacted with — catching indirect exposure to exchanges, mixers, or flagged entities."
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 13, height: 13, borderRadius: "50%",
                            border: `1px solid ${plan.color}66`, color: "var(--tertiary)",
                            fontSize: 8, fontWeight: 700, cursor: "help", flexShrink: 0,
                          }}
                        >?</span>
                      )}
                    </p>
                  ))}
                  {plan.missing.map(f => (
                    <p key={f} style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--tertiary)", margin: "0 0 5px", display: "flex", gap: 5 }}>
                      <span>—</span>{f}
                    </p>
                  ))}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStage("currency")}
              style={{ display: "block", width: "100%", height: 48, background: planInfo?.color || "var(--accent)", border: "none", borderRadius: 12, fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}
            >
              Continue with {planInfo?.name} — {planInfo?.price}
            </button>
          </div>
        )}

        {/* ── CURRENCY SELECTION ── */}
        {stage === "currency" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <button onClick={() => setStage("plan")} style={{ background: "none", border: "none", color: "var(--secondary)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>←</button>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--primary)", margin: 0 }}>Select currency</h2>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--secondary)", margin: "2px 0 0" }}>{planInfo?.name} plan · {planInfo?.price} / 30 days</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {CURRENCIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCurrency(c.id)}
                  style={{ border: `1px solid ${selectedCurrency === c.id ? c.color : "var(--edge)"}`, background: selectedCurrency === c.id ? `${c.color}18` : "var(--surface-1)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.12s" }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: selectedCurrency === c.id ? c.color : "var(--primary)" }}>{c.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: selectedCurrency === c.id ? c.color : "var(--tertiary)", border: `1px solid ${selectedCurrency === c.id ? c.color + "55" : "var(--edge)"}`, borderRadius: 4, padding: "1px 5px" }}>{c.network}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCreate}
              disabled={!selectedCurrency}
              style={{ display: "block", width: "100%", height: 48, background: selectedCurrency ? (planInfo?.color || "var(--accent)") : "var(--surface-2)", border: "none", borderRadius: 12, fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: selectedCurrency ? "var(--ink)" : "var(--tertiary)", cursor: selectedCurrency ? "pointer" : "not-allowed", transition: "all 0.15s" }}
            >
              Generate Payment Address
            </button>
          </div>
        )}

        {/* ── CREATING ── */}
        {stage === "creating" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "20px 0" }}>
            <Spinner />
            <p style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--secondary)", margin: 0 }}>Generating address...</p>
          </div>
        )}

        {/* ── WAITING / CONFIRMING ── */}
        {(stage === "waiting" || stage === "confirming") && payment && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              {stage === "confirming" && <Spinner size={20} />}
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                  {stage === "confirming" ? "Payment detected!" : "Send payment"}
                </h3>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "var(--secondary)", margin: "3px 0 0" }}>
                  {stage === "confirming" ? "Waiting for confirmations..." : `${planInfo?.name} plan · ${planInfo?.price} / 30 days`}
                </p>
              </div>
            </div>

            <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 10, background: "var(--surface-1)", padding: "14px 16px", marginBottom: 10 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tertiary)", margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Amount to send</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
                  {payment.payAmount} <span style={{ fontSize: 12, color: "var(--secondary)" }}>{currencyInfo?.label} ({currencyInfo?.network})</span>
                </span>
                <CopyButton text={String(payment.payAmount)} />
              </div>
            </div>

            <div style={{ border: "1px solid var(--edge-strong)", borderRadius: 10, background: "var(--surface-1)", padding: "14px 16px", marginBottom: 16 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--tertiary)", margin: "0 0 6px", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Payment address</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)", wordBreak: "break-all" as const, lineHeight: 1.5 }}>{payment.payAddress}</span>
                <CopyButton text={payment.payAddress} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Spinner size={14} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "var(--tertiary)" }}>Checking for payment every 10s...</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--tertiary)", margin: 0, lineHeight: 1.6 }}>
              Send only {currencyInfo?.label} on {currencyInfo?.network} network. Wrong network = lost funds. 1 hour payment window.
            </p>
          </div>
        )}

        {/* ── VERIFYING ── */}
        {stage === "verifying" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "20px 0" }}>
            <Spinner />
            <p style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--secondary)", margin: 0 }}>Verifying payment...</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {stage === "success" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,232,150,0.1)", border: "2px solid rgba(0,232,150,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "var(--safe)" }}>✓</div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--primary)", margin: "0 0 8px" }}>
                You&apos;re now on {planInfo?.name}!
              </h3>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--secondary)", margin: 0 }}>30 days activated. Start scanning.</p>
            </div>
            <button onClick={onClose} style={{ height: 44, padding: "0 32px", background: "rgba(0,232,150,0.1)", border: "1px solid rgba(0,232,150,0.3)", borderRadius: 10, fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "var(--safe)", cursor: "pointer" }}>
              Start scanning
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {stage === "error" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "16px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,61,61,0.1)", border: "2px solid rgba(255,61,61,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "var(--threat)" }}>✕</div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--primary)", margin: "0 0 8px" }}>Payment failed</h3>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--threat)", margin: 0 }}>{errorMsg}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setStage("plan"); setPayment(null); setErrorMsg(""); }} style={{ height: 40, padding: "0 20px", background: "rgba(0,200,255,0.08)", border: "1px solid var(--accent)", borderRadius: 10, fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "var(--accent)", cursor: "pointer" }}>Try again</button>
              <button onClick={onClose} style={{ height: 40, padding: "0 20px", background: "none", border: "1px solid var(--edge)", borderRadius: 10, fontFamily: "var(--font-display)", fontSize: 13, color: "var(--secondary)", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
