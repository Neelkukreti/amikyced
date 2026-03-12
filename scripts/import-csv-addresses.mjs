#!/usr/bin/env node
/**
 * import-csv-addresses.mjs
 *
 * Reads three CSV source files of CEX wallet addresses, deduplicates against
 * the existing cex-addresses.ts database, prints stats, and generates a
 * TypeScript snippet that can be appended to the arrays in cex-addresses.ts.
 *
 * Usage:  node scripts/import-csv-addresses.mjs
 */

import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ── File paths ────────────────────────────────────────────────────────────────

const CSV_MANUAL  = "/Users/neel/Downloads/for KYCSCan/cex-dex-wallets-manual.csv";
const CSV_INDIAN  = "/Users/neel/Downloads/for KYCSCan/indian-exchanges.csv";
const CSV_GITHUB  = "/Users/neel/Downloads/for KYCSCan/wallet-scraper-github.csv";

const CEX_ADDRESSES_TS = path.join(PROJECT_ROOT, "src/lib/cex-addresses.ts");
const OUTPUT_SNIPPET   = path.join(PROJECT_ROOT, "data/import-snippet.ts");

// ── Blockchain mapping ────────────────────────────────────────────────────────

const CHAIN_MAP = {
  ethereum:           "ethereum",
  ethereum_and_evm:   "ethereum",
  bsc:                "ethereum",
  polygon:            "ethereum",
  arbitrum:           "ethereum",
  optimism:           "ethereum",
  avalanche:          "ethereum",
  solana:             "solana",
  bitcoin:            "bitcoin",
  tron:               "tron",
};

/**
 * Normalise a raw blockchain field from CSV into our Chain type.
 * Returns null if unrecognised.
 */
function mapChain(raw) {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return CHAIN_MAP[key] ?? null;
}

/**
 * Normalise an address for dedup comparison.
 * EVM (0x…) and Tron (T…) are lowercased; Solana and Bitcoin are case-sensitive.
 */
function normaliseAddress(addr, chain) {
  if (!addr) return "";
  const trimmed = addr.trim();
  if (chain === "ethereum" || chain === "tron") return trimmed.toLowerCase();
  return trimmed;
}

// ── Step 1: Extract existing addresses from cex-addresses.ts ──────────────────

function extractExistingAddresses() {
  const src = fs.readFileSync(CEX_ADDRESSES_TS, "utf-8");
  const existing = new Set();

  // Match every `address: "..."` in the file
  const regex = /address:\s*"([^"]+)"/g;
  let m;
  while ((m = regex.exec(src)) !== null) {
    const addr = m[1];
    // EVM addresses start with 0x, Tron with T — lowercase those
    if (addr.startsWith("0x") || addr.startsWith("T")) {
      existing.add(addr.toLowerCase());
    } else {
      existing.add(addr); // BTC/Solana — preserve case
    }
  }

  console.log(`[existing] Extracted ${existing.size} addresses from cex-addresses.ts`);
  return existing;
}

// ── Step 2: CSV parsing helpers ───────────────────────────────────────────────

/**
 * Parse a single CSV line, respecting quoted fields that may contain commas.
 */
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Stream-parse a CSV file line-by-line and call `filterFn(row)` for each data
 * row.  If the filter returns true, the row is collected and returned.
 *
 * Row object keys: address, type, exchange_name, blockchain, confidence_score,
 *                  sources, verification_method, first_seen, labels
 */
async function readCSV(filePath, filterFn) {
  const results = [];
  const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    if (!line.trim()) continue;

    const fields = parseCSVLine(line);

    if (!headers) {
      headers = fields.map((h) => h.toLowerCase().replace(/\s+/g, "_"));
      continue;
    }

    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = fields[i] ?? "";
    }

    if (filterFn(row)) {
      results.push(row);
    }
  }

  return results;
}

// ── Step 3: Read & filter each CSV ───────────────────────────────────────────

async function loadManualCSV() {
  const rows = await readCSV(CSV_MANUAL, (row) => {
    const t = (row.type || "").toLowerCase();
    return t === "cex" || t === "cex_wallet";
  });
  console.log(`[manual]   ${rows.length} CEX rows accepted`);
  return rows;
}

async function loadIndianCSV() {
  const rows = await readCSV(CSV_INDIAN, () => true);
  console.log(`[indian]   ${rows.length} rows accepted (all)`);
  return rows;
}

async function loadGitHubCSV() {
  let total = 0;
  const rows = await readCSV(CSV_GITHUB, (row) => {
    total++;
    const t = (row.type || "").toLowerCase();
    const score = parseFloat(row.confidence_score || "0");
    return t === "cex_wallet" && score >= 85;
  });
  console.log(`[github]   ${rows.length} CEX rows accepted out of ${total} total`);
  return rows;
}

// ── Step 4: Merge, deduplicate, bucket ────────────────────────────────────────

function processRows(allRows, existingSet) {
  // Map chain → exchange → address[]
  const buckets = {
    ethereum: {},
    solana:   {},
    bitcoin:  {},
    tron:     {},
  };

  let skippedChain = 0;
  let skippedDup = 0;
  const newAddressSet = new Set(); // track within-import duplicates too

  for (const row of allRows) {
    const chain = mapChain(row.blockchain);
    if (!chain) {
      skippedChain++;
      continue;
    }

    const rawAddr = (row.address || "").trim();
    if (!rawAddr) continue;

    const normAddr = normaliseAddress(rawAddr, chain);
    if (existingSet.has(normAddr) || newAddressSet.has(`${chain}:${normAddr}`)) {
      skippedDup++;
      continue;
    }

    newAddressSet.add(`${chain}:${normAddr}`);

    const exchange = (row.exchange_name || "Unknown").trim();
    if (!buckets[chain][exchange]) {
      buckets[chain][exchange] = [];
    }

    // Store the canonical (display) address — lowercase for EVM/TRON
    const displayAddr = chain === "ethereum" || chain === "tron"
      ? rawAddr.toLowerCase()
      : rawAddr;

    buckets[chain][exchange].push({
      address: displayAddr,
      exchange,
      chain,
      label: row.labels || "",
      sources: row.sources || "",
    });
  }

  console.log(`\n[dedup]    Skipped ${skippedDup} duplicates (already in DB or duplicate in CSVs)`);
  console.log(`[dedup]    Skipped ${skippedChain} rows with unrecognised chain\n`);
  return buckets;
}

// ── Step 5: Print stats ──────────────────────────────────────────────────────

function printStats(buckets) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  NEW ADDRESSES BY CHAIN / EXCHANGE");
  console.log("═══════════════════════════════════════════════════════");

  let grandTotal = 0;

  for (const chain of ["ethereum", "solana", "bitcoin", "tron"]) {
    const exchanges = buckets[chain];
    const exchangeNames = Object.keys(exchanges).sort();
    if (exchangeNames.length === 0) continue;

    let chainTotal = 0;
    console.log(`\n  ${chain.toUpperCase()}`);
    console.log(`  ${"─".repeat(50)}`);
    for (const ex of exchangeNames) {
      const count = exchanges[ex].length;
      chainTotal += count;
      console.log(`    ${ex.padEnd(35)} ${String(count).padStart(5)}`);
    }
    console.log(`  ${"─".repeat(50)}`);
    console.log(`    ${"CHAIN TOTAL".padEnd(35)} ${String(chainTotal).padStart(5)}`);
    grandTotal += chainTotal;
  }

  console.log(`\n═══════════════════════════════════════════════════════`);
  console.log(`  GRAND TOTAL NEW ADDRESSES: ${grandTotal}`);
  console.log(`═══════════════════════════════════════════════════════\n`);
}

// ── Step 6: Generate TypeScript snippet ──────────────────────────────────────

function generateSnippet(buckets) {
  const lines = [];

  lines.push("/**");
  lines.push(" * Auto-generated import snippet — paste into cex-addresses.ts");
  lines.push(` * Generated: ${new Date().toISOString()}`);
  lines.push(" *");
  lines.push(" * Append the entries below into the appropriate arrays:");
  lines.push(" *   EVM_CEX      — chain: \"ethereum\"");
  lines.push(" *   SOLANA_CEX   — chain: \"solana\"");
  lines.push(" *   BTC_CEX      — chain: \"bitcoin\"");
  lines.push(" *   TRON_CEX     — chain: \"tron\"");
  lines.push(" */");
  lines.push("");

  const arrayNameMap = {
    ethereum: "EVM_CEX",
    solana:   "SOLANA_CEX",
    bitcoin:  "BTC_CEX",
    tron:     "TRON_CEX",
  };

  for (const chain of ["ethereum", "solana", "bitcoin", "tron"]) {
    const exchanges = buckets[chain];
    const exchangeNames = Object.keys(exchanges).sort();
    if (exchangeNames.length === 0) continue;

    lines.push(`// ── Append to ${arrayNameMap[chain]} ${"─".repeat(50 - arrayNameMap[chain].length)}`);
    lines.push("");

    for (const ex of exchangeNames) {
      lines.push(`  // ${ex}`);
      const addrs = exchanges[ex];

      for (let i = 0; i < addrs.length; i++) {
        const a = addrs[i];
        // Build a sensible label
        let label = a.label;
        if (!label) {
          label = addrs.length === 1
            ? `${ex} Wallet`
            : `${ex} Wallet ${i + 1}`;
        }

        // Escape any quotes in the label
        label = label.replace(/"/g, '\\"');

        lines.push(
          `  { address: "${a.address}", exchange: "${a.exchange.replace(/"/g, '\\"')}", label: "${label}", chain: "${a.chain}" },`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║   KYCScan CSV Address Import                         ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");

  // 1. Load existing addresses
  const existingSet = extractExistingAddresses();

  // 2. Load & filter all three CSVs
  const [manualRows, indianRows, githubRows] = await Promise.all([
    loadManualCSV(),
    loadIndianCSV(),
    loadGitHubCSV(),
  ]);

  const allRows = [...manualRows, ...indianRows, ...githubRows];
  console.log(`\n[total]    ${allRows.length} candidate rows from all sources`);

  // 3. Deduplicate against existing DB and map chains
  const buckets = processRows(allRows, existingSet);

  // 4. Print stats
  printStats(buckets);

  // 5. Generate TypeScript snippet
  const snippet = generateSnippet(buckets);

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_SNIPPET);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_SNIPPET, snippet, "utf-8");
  console.log(`[output]   TypeScript snippet written to: ${OUTPUT_SNIPPET}`);
  console.log("           Review the snippet, then paste entries into cex-addresses.ts\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
