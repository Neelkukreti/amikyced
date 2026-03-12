"use client";

import { useState, useEffect, useCallback } from "react";

interface Usage {
  plan: "free" | "pro";
  deepScansUsed: number;
  totalScansToday: number;
  deepScansLimit: number;
  totalScansLimit: number;
}

interface Session {
  address: string | null;
  authenticated: boolean;
  loading: boolean;
  usage: Usage | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  anonScansUsed: number;
  incrementAnonScan: () => void;
}

export function useSession(): Session {
  const [address, setAddress] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [anonScansUsed, setAnonScansUsed] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setAuthenticated(data.authenticated);
      setAddress(data.address || null);
      setUsage(data.usage || null);
    } catch {
      setAuthenticated(false);
      setAddress(null);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    setAddress(null);
    setUsage(null);
  }, []);

  const incrementAnonScan = useCallback(() => {
    const next = anonScansUsed + 1;
    setAnonScansUsed(next);
    try { localStorage.setItem("kycscan_anon_scans", String(next)); } catch {}
  }, [anonScansUsed]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kycscan_anon_scans");
      if (stored) setAnonScansUsed(Number(stored));
    } catch {}
    refresh();
  }, [refresh]);

  return { address, authenticated, loading, usage, refresh, logout, anonScansUsed, incrementAnonScan };
}
