import fs from "fs";
import path from "path";
import type { CexAddress, Chain } from "./cex-addresses";

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

interface UserSubmission {
  address: string;
  exchange: string;
  chain: Chain;
  submittedAt: string;
  ip: string;
}

interface IpUsage {
  count_today: number;
  last_reset_date: string;
  last_submit_at?: number;
}

interface Store {
  submissions: UserSubmission[];
  ips: Record<string, IpUsage>;
}

const MAX_PER_IP_PER_DAY = 5;
const COOLDOWN_MS = 30_000;

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function readStore(): Store {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) return { submissions: [], ips: {} };
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return { submissions: [], ips: {} };
  }
}

function writeStore(store: Store) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch {
    // Silently fail on write errors (read-only filesystem edge cases)
  }
}

// In-memory map for O(1) lookup during scans
const g = globalThis as typeof globalThis & { __submissionMap?: Map<string, UserSubmission> };
if (!g.__submissionMap) {
  g.__submissionMap = new Map();
  // Populate from disk on cold start
  try {
    const store = readStore();
    for (const s of store.submissions) {
      g.__submissionMap.set(s.address.toLowerCase(), s);
    }
  } catch { /* ignore */ }
}

export function canSubmit(ip: string): { allowed: boolean; reason?: string; cooldownRemaining?: number } {
  const store = readStore();
  if (!store.ips[ip]) {
    store.ips[ip] = { count_today: 0, last_reset_date: today() };
  }
  const usage = store.ips[ip];
  if (usage.last_reset_date !== today()) {
    usage.count_today = 0;
    usage.last_reset_date = today();
  }

  if (usage.last_submit_at) {
    const elapsed = Date.now() - usage.last_submit_at;
    if (elapsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return { allowed: false, reason: `Please wait ${remaining}s before submitting again.`, cooldownRemaining: remaining };
    }
  }

  if (usage.count_today >= MAX_PER_IP_PER_DAY) {
    return { allowed: false, reason: "Daily submission limit reached (5/day). Try again tomorrow." };
  }

  return { allowed: true };
}

export function addSubmission(address: string, exchange: string, chain: Chain, ip: string): boolean {
  const key = address.toLowerCase();

  // Deduplicate
  if (g.__submissionMap!.has(key)) return false;

  const store = readStore();
  const submission: UserSubmission = {
    address: key,
    exchange: exchange.trim(),
    chain,
    submittedAt: new Date().toISOString(),
    ip,
  };

  store.submissions.push(submission);
  if (store.submissions.length > 1000) store.submissions = store.submissions.slice(-1000);

  // Update IP usage
  if (!store.ips[ip]) store.ips[ip] = { count_today: 0, last_reset_date: today() };
  if (store.ips[ip].last_reset_date !== today()) {
    store.ips[ip].count_today = 0;
    store.ips[ip].last_reset_date = today();
  }
  store.ips[ip].count_today++;
  store.ips[ip].last_submit_at = Date.now();

  writeStore(store);
  g.__submissionMap!.set(key, submission);
  return true;
}

export function lookupUserSubmission(address: string, chain: Chain): CexAddress | null {
  const entry = g.__submissionMap!.get(address.toLowerCase());
  if (!entry || entry.chain !== chain) return null;
  return {
    address: entry.address,
    exchange: entry.exchange,
    label: `Community: ${entry.exchange}`,
    chain: entry.chain,
    entityType: "cex",
  };
}

export function getSubmissionCount(): number {
  return g.__submissionMap!.size;
}

export function getAllSubmissions() {
  return [...g.__submissionMap!.values()];
}
