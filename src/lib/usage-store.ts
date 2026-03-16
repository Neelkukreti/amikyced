import fs from "fs";
import path from "path";

// Vercel serverless has read-only filesystem except /tmp
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "usage.json");

export type Plan = "free" | "basic" | "pro";

const PLAN_LIMITS: Record<Plan, { scans: number; deepScans: number }> = {
  free:  { scans: 5,        deepScans: 3  },
  basic: { scans: 20,       deepScans: 10 },
  pro:   { scans: Infinity, deepScans: Infinity },
};

/** Minimum milliseconds between scans per plan */
const PLAN_COOLDOWNS: Record<Plan, number> = {
  free:  30_000,  // 30 seconds
  basic: 10_000,  // 10 seconds
  pro:   0,       // none
};

interface ScanEntry {
  address: string;
  chain: string;
  deep: boolean;
  timestamp: string;
}

interface UserUsage {
  wallet_address: string;
  plan: Plan;
  free_deep_scans_used: number;
  total_scans_today: number;
  last_reset_date: string;
  scans: ScanEntry[];
  pro_expires_at?: string;
  used_payment_ids?: string[];
  last_scan_at?: number;
}

interface IpUsage {
  total_scans_today: number;
  deep_scans_today: number;
  last_reset_date: string;
  last_scan_at?: number;
}

interface Store {
  users: Record<string, UserUsage>;
  ips: Record<string, IpUsage>;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function readStore(): Store {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return { users: {}, ips: {} };
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { users: {}, ips: {} };
  }
}

function writeStore(store: Store) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function getOrCreateUser(store: Store, wallet: string): UserUsage {
  const key = wallet.toLowerCase();
  if (!store.users[key]) {
    store.users[key] = {
      wallet_address: key,
      plan: "free",
      free_deep_scans_used: 0,
      total_scans_today: 0,
      last_reset_date: today(),
      scans: [],
    };
  }
  const user = store.users[key];
  if (user.last_reset_date !== today()) {
    user.free_deep_scans_used = 0;
    user.total_scans_today = 0;
    user.last_reset_date = today();
  }
  return user;
}

/** Returns the currently active plan, accounting for expiry. */
export function getActivePlan(user: UserUsage): Plan {
  if (!user.plan || user.plan === "free") return "free";
  if (user.pro_expires_at && Date.now() >= new Date(user.pro_expires_at).getTime()) return "free";
  return user.plan;
}

/** Kept for backward-compat with session route. */
export function isProActive(user: UserUsage): boolean {
  return getActivePlan(user) === "pro";
}

export function canScan(wallet: string, deep: boolean): { allowed: boolean; reason?: string; cooldownRemaining?: number } {
  const store = readStore();
  const user = getOrCreateUser(store, wallet);
  const plan = getActivePlan(user);
  const limits = PLAN_LIMITS[plan];
  const cooldown = PLAN_COOLDOWNS[plan];

  // Cooldown check
  if (cooldown > 0 && user.last_scan_at) {
    const elapsed = Date.now() - user.last_scan_at;
    if (elapsed < cooldown) {
      const remaining = Math.ceil((cooldown - elapsed) / 1000);
      return { allowed: false, reason: `Please wait ${remaining}s before scanning again.`, cooldownRemaining: remaining };
    }
  }

  if (user.total_scans_today >= limits.scans) {
    const cap = limits.scans === Infinity ? "unlimited" : String(limits.scans);
    return { allowed: false, reason: `Daily scan limit reached (${cap}/day on ${plan}). Upgrade for more.` };
  }
  if (deep && user.free_deep_scans_used >= limits.deepScans) {
    const cap = limits.deepScans === Infinity ? "unlimited" : String(limits.deepScans);
    return { allowed: false, reason: `Deep scan limit reached (${cap}/day on ${plan}). Upgrade for more.` };
  }
  return { allowed: true };
}

export function upgradePlan(wallet: string, paymentId: string, plan: "basic" | "pro" = "pro"): boolean {
  const store = readStore();
  const user = getOrCreateUser(store, wallet);
  const normalizedId = paymentId.toLowerCase();

  if (!user.used_payment_ids) user.used_payment_ids = [];
  if (user.used_payment_ids.includes(normalizedId)) return false;

  user.plan = plan;

  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (user.pro_expires_at && now < new Date(user.pro_expires_at).getTime()) {
    user.pro_expires_at = new Date(new Date(user.pro_expires_at).getTime() + thirtyDays).toISOString();
  } else {
    user.pro_expires_at = new Date(now + thirtyDays).toISOString();
  }

  user.used_payment_ids.push(normalizedId);
  if (user.used_payment_ids.length > 50) user.used_payment_ids = user.used_payment_ids.slice(-50);

  writeStore(store);
  return true;
}

export function recordScan(wallet: string, targetAddress: string, chain: string, deep: boolean): UserUsage {
  const store = readStore();
  const user = getOrCreateUser(store, wallet);
  user.total_scans_today++;
  user.last_scan_at = Date.now();
  if (deep) user.free_deep_scans_used++;
  user.scans.push({ address: targetAddress, chain, deep, timestamp: new Date().toISOString() });
  if (user.scans.length > 100) user.scans = user.scans.slice(-100);
  writeStore(store);
  return user;
}

export function getUsage(wallet: string): UserUsage {
  const store = readStore();
  return getOrCreateUser(store, wallet);
}

// --- IP-based rate limiting ---

const IP_DAILY_LIMIT = 10;
const IP_DEEP_DAILY_LIMIT = 5;
const IP_COOLDOWN_MS = 5_000; // 5 seconds between scans per IP

function getOrCreateIp(store: Store, ip: string): IpUsage {
  if (!store.ips) store.ips = {};
  if (!store.ips[ip]) {
    store.ips[ip] = { total_scans_today: 0, deep_scans_today: 0, last_reset_date: today() };
  }
  const ipUsage = store.ips[ip];
  if (ipUsage.last_reset_date !== today()) {
    ipUsage.total_scans_today = 0;
    ipUsage.deep_scans_today = 0;
    ipUsage.last_reset_date = today();
  }
  return ipUsage;
}

export function canScanIp(ip: string): { allowed: boolean; reason?: string; cooldownRemaining?: number } {
  const store = readStore();
  const ipUsage = getOrCreateIp(store, ip);

  // IP cooldown check
  if (ipUsage.last_scan_at) {
    const elapsed = Date.now() - ipUsage.last_scan_at;
    if (elapsed < IP_COOLDOWN_MS) {
      const remaining = Math.ceil((IP_COOLDOWN_MS - elapsed) / 1000);
      return { allowed: false, reason: `Please wait ${remaining}s before scanning again.`, cooldownRemaining: remaining };
    }
  }

  if (ipUsage.total_scans_today >= IP_DAILY_LIMIT) {
    return { allowed: false, reason: "Daily IP scan limit reached. Connect a wallet or try again tomorrow." };
  }
  return { allowed: true };
}

export function canDeepScanIp(ip: string): boolean {
  const store = readStore();
  const ipUsage = getOrCreateIp(store, ip);
  return ipUsage.deep_scans_today < IP_DEEP_DAILY_LIMIT;
}

export function recordScanIp(ip: string, deep: boolean) {
  const store = readStore();
  const ipUsage = getOrCreateIp(store, ip);
  ipUsage.total_scans_today++;
  ipUsage.last_scan_at = Date.now();
  if (deep) ipUsage.deep_scans_today++;
  writeStore(store);
}
