#!/usr/bin/env node
/**
 * CEX Address Discovery Script
 *
 * Strategy:
 * 1. For each known CEX hot wallet, fetch recent transactions via Etherscan
 * 2. Find high-volume counterparties (addresses that send/receive from CEX frequently)
 * 3. Cross-check if those counterparties are already in our database
 * 4. New high-volume addresses → added to discovered.json for review
 * 5. Optionally auto-merge into cex-addresses.ts
 *
 * Also scrapes Etherscan's label pages for newly labeled addresses.
 *
 * Usage:
 *   node scripts/discover-addresses.mjs              # discover only
 *   node scripts/discover-addresses.mjs --merge      # discover + merge into codebase
 *   node scripts/discover-addresses.mjs --dry-run    # show what would be found
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const DISCOVERED_FILE = path.join(DATA_DIR, "discovered.json");
const CEX_ADDRESSES_FILE = path.join(PROJECT_ROOT, "src/lib/cex-addresses.ts");
const LOG_FILE = path.join(DATA_DIR, "discovery.log");

// Load API key from .env.local
const envPath = path.join(PROJECT_ROOT, ".env.local");
let ETHERSCAN_API_KEY = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/ETHERSCAN_API_KEY=(.+)/);
  if (match) ETHERSCAN_API_KEY = match[1].trim();
}

if (!ETHERSCAN_API_KEY) {
  console.error("ERROR: ETHERSCAN_API_KEY not found in .env.local");
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const AUTO_MERGE = args.includes("--merge");

// ─── Known seed addresses (top CEX hot wallets to monitor) ────────────────
const SEED_WALLETS = [
  // Binance
  { address: "0x28c6c06298d514db089934071355e5743bf21d60", exchange: "Binance" },
  { address: "0x21a31ee1afc51d94c2efccaa2092ad1028285549", exchange: "Binance" },
  // Coinbase
  { address: "0x71660c4005ba85c37ccec55d0c4493e66fe775d3", exchange: "Coinbase" },
  { address: "0x503828976d22510aad0201ac7ec88293211d23da", exchange: "Coinbase" },
  // Kraken
  { address: "0x2910543af39aba0cd09dbb2d50200b3e800a63d2", exchange: "Kraken" },
  // OKX
  { address: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b", exchange: "OKX" },
  // Bybit
  { address: "0xf89d7b9c864f589bbf53a82105107622b35eaa40", exchange: "Bybit" },
  { address: "0xd9d93951896b4ef97d251334ef2a0e39f6f6d7d7", exchange: "Bybit" },
  // KuCoin
  { address: "0xd6216fc19db775df9774a6e33526131da7d19a2c", exchange: "KuCoin" },
  // Gate.io
  { address: "0x0d0707963952f2fba59dd06f2b425ace40b492fe", exchange: "Gate.io" },
  // Bitfinex
  { address: "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa", exchange: "Bitfinex" },
  // HTX (Huobi)
  { address: "0x46340b20830761efd32832a74d7169b29feb9758", exchange: "HTX (Huobi)" },
  // Crypto.com
  { address: "0x6262998ced04146fa42253a5c0af90ca02dfd2a3", exchange: "Crypto.com" },
  // Gemini
  { address: "0xd24400ae8bfebb18ca49be86258a3c749cf46853", exchange: "Gemini" },
];

// Etherscan V2 chains to scan
// Note: Base (8453) and Optimism (10) require paid Etherscan API
const CHAINS = [
  { chainId: 1, name: "Ethereum" },
  { chainId: 42161, name: "Arbitrum" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  if (!DRY_RUN) {
    fs.appendFileSync(LOG_FILE, line + "\n");
  }
}

async function etherscanFetch(params) {
  const url = new URL("https://api.etherscan.io/v2/api");
  url.searchParams.set("apikey", ETHERSCAN_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Etherscan HTTP ${res.status}`);
  const data = await res.json();
  if (data.status === "0" && data.message === "NOTOK") {
    throw new Error(`Etherscan API error: ${data.result}`);
  }
  return data;
}

// Load existing addresses from cex-addresses.ts for dedup
function loadExistingAddresses() {
  const content = fs.readFileSync(CEX_ADDRESSES_FILE, "utf-8");
  const addresses = new Set();
  const regex = /address:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    addresses.add(match[1].toLowerCase());
  }
  return addresses;
}

// Load previously discovered addresses
function loadDiscovered() {
  if (!fs.existsSync(DISCOVERED_FILE)) return { addresses: [], lastRun: null };
  return JSON.parse(fs.readFileSync(DISCOVERED_FILE, "utf-8"));
}

function saveDiscovered(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DISCOVERED_FILE, JSON.stringify(data, null, 2));
}

// ─── Core Discovery ──────────────────────────────────────────────────────

async function discoverFromSeedWallet(seed, chainId, existingAddrs) {
  const discovered = [];

  try {
    // Fetch recent normal transactions
    const txData = await etherscanFetch({
      chainid: chainId,
      module: "account",
      action: "txlist",
      address: seed.address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 200, // last 200 txs
      sort: "desc",
    });

    if (!Array.isArray(txData.result)) return discovered;

    // Count counterparty frequency
    const counterpartyCount = new Map();
    for (const tx of txData.result) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();
      const counterparty = from === seed.address.toLowerCase() ? to : from;
      if (!counterparty || counterparty === seed.address.toLowerCase()) continue;

      const entry = counterpartyCount.get(counterparty) || { count: 0, totalValue: 0n, directions: new Set() };
      entry.count++;
      entry.totalValue += BigInt(tx.value || "0");
      entry.directions.add(from === seed.address.toLowerCase() ? "sent" : "received");
      counterpartyCount.set(counterparty, entry);
    }

    // Also check token transfers
    await sleep(250); // Rate limit
    const tokenData = await etherscanFetch({
      chainid: chainId,
      module: "account",
      action: "tokentx",
      address: seed.address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 200,
      sort: "desc",
    });

    if (Array.isArray(tokenData.result)) {
      for (const tx of tokenData.result) {
        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();
        const counterparty = from === seed.address.toLowerCase() ? to : from;
        if (!counterparty || counterparty === seed.address.toLowerCase()) continue;

        const entry = counterpartyCount.get(counterparty) || { count: 0, totalValue: 0n, directions: new Set() };
        entry.count++;
        counterpartyCount.set(counterparty, entry);
      }
    }

    // Known token contracts and routers to skip
    const SKIP_ADDRS = new Set([
      "0x0000000000000000000000000000000000000000",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
      "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2 Router
      "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3 Router
      "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", // Uniswap V3 Router 2
      "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad", // Uniswap Universal Router
      "0x1111111254eeb25477b68fb85ed929f73a960582", // 1inch Router
      "0xdef1c0ded9bec7f1a1670819833240f027b25eff", // 0x Exchange
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // USDC (Arb)
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC.e (Arb)
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT (Arb)
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // WETH (Arb)
    ]);

    // Filter: high-volume counterparties (5+ interactions) that aren't in our DB
    for (const [addr, stats] of counterpartyCount) {
      if (stats.count >= 5 && !existingAddrs.has(addr)) {
        // Skip known tokens, routers, and zero address
        if (SKIP_ADDRS.has(addr)) continue;

        discovered.push({
          address: addr,
          exchange: seed.exchange,
          label: `Discovered: ${seed.exchange} Linked Wallet`,
          chain: "ethereum",
          interactions: stats.count,
          directions: [...stats.directions],
          discoveredFrom: seed.address,
          chainId,
          discoveredAt: new Date().toISOString(),
          confidence: stats.count >= 20 ? "high" : stats.count >= 10 ? "medium" : "low",
        });
      }
    }
  } catch (err) {
    log(`  Error scanning ${seed.exchange} (${seed.address.slice(0, 10)}...) on chain ${chainId}: ${err.message}`);
  }

  return discovered;
}

// ─── Etherscan Label Scraping ────────────────────────────────────────────

async function fetchEtherscanLabels() {
  // Etherscan has a public label cloud — we can check specific exchange label pages
  // Note: This is rate-limited and may not always work
  const labelExchanges = [
    "binance", "coinbase", "kraken", "okx", "bybit",
    "kucoin", "gate-io", "bitfinex", "gemini", "bitstamp",
  ];

  const discovered = [];

  for (const exchange of labelExchanges) {
    try {
      const url = `https://etherscan.io/accounts/label/${exchange}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      if (!res.ok) continue;

      const html = await res.text();
      // Extract addresses from the HTML table
      const addrRegex = /0x[a-fA-F0-9]{40}/g;
      let match;
      while ((match = addrRegex.exec(html)) !== null) {
        discovered.push({
          address: match[0].toLowerCase(),
          exchange: exchange.charAt(0).toUpperCase() + exchange.slice(1).replace("-", "."),
          source: "etherscan-label",
        });
      }

      await sleep(2000); // Be respectful to Etherscan
    } catch {
      // Silently skip — label pages may block automated access
    }
  }

  return discovered;
}

// ─── Main ────────────────────────────────────────────────────────────────

async function main() {
  log("=== KYCScan CEX Address Discovery ===");
  log(`Mode: ${DRY_RUN ? "DRY RUN" : AUTO_MERGE ? "DISCOVER + MERGE" : "DISCOVER ONLY"}`);

  const existingAddrs = loadExistingAddresses();
  log(`Existing database: ${existingAddrs.size} addresses`);

  const allDiscovered = [];

  // Phase 1: Discover from seed wallets
  log("\n--- Phase 1: Seed Wallet Analysis ---");
  for (const seed of SEED_WALLETS) {
    for (const chain of CHAINS) {
      log(`Scanning ${seed.exchange} (${seed.address.slice(0, 10)}...) on ${chain.name}...`);
      const found = await discoverFromSeedWallet(seed, chain.chainId, existingAddrs);
      if (found.length > 0) {
        log(`  Found ${found.length} new addresses`);
        allDiscovered.push(...found);
      }
      await sleep(300); // Rate limit between calls
    }
  }

  // Phase 2: Etherscan label pages
  log("\n--- Phase 2: Etherscan Label Check ---");
  const labelAddrs = await fetchEtherscanLabels();
  const newFromLabels = labelAddrs.filter((a) => !existingAddrs.has(a.address.toLowerCase()));
  if (newFromLabels.length > 0) {
    log(`Found ${newFromLabels.length} new addresses from Etherscan labels`);
    for (const addr of newFromLabels) {
      allDiscovered.push({
        address: addr.address,
        exchange: addr.exchange,
        label: `Label: ${addr.exchange} Wallet`,
        chain: "ethereum",
        confidence: "high", // Etherscan labels are reliable
        source: "etherscan-label",
        discoveredAt: new Date().toISOString(),
      });
    }
  }

  // Deduplicate
  const seen = new Set();
  const unique = allDiscovered.filter((a) => {
    const key = a.address.toLowerCase();
    if (seen.has(key) || existingAddrs.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by confidence and interaction count
  unique.sort((a, b) => {
    const confOrder = { high: 0, medium: 1, low: 2 };
    const confDiff = (confOrder[a.confidence] || 2) - (confOrder[b.confidence] || 2);
    if (confDiff !== 0) return confDiff;
    return (b.interactions || 0) - (a.interactions || 0);
  });

  log(`\n=== Results: ${unique.length} new addresses discovered ===`);

  if (unique.length === 0) {
    log("No new addresses found.");
    return;
  }

  // Display results
  for (const addr of unique.slice(0, 30)) {
    log(`  [${addr.confidence}] ${addr.exchange}: ${addr.address} (${addr.interactions || "?"} txs)`);
  }
  if (unique.length > 30) {
    log(`  ... and ${unique.length - 30} more`);
  }

  if (DRY_RUN) {
    log("\nDry run — nothing saved.");
    return;
  }

  // Save discovered addresses
  const prevDiscovered = loadDiscovered();
  const mergedAddrs = [...(prevDiscovered.addresses || [])];

  for (const addr of unique) {
    if (!mergedAddrs.some((a) => a.address.toLowerCase() === addr.address.toLowerCase())) {
      mergedAddrs.push(addr);
    }
  }

  saveDiscovered({
    addresses: mergedAddrs,
    lastRun: new Date().toISOString(),
    totalDiscovered: mergedAddrs.length,
    lastRunNew: unique.length,
  });
  log(`Saved ${mergedAddrs.length} total discovered addresses to data/discovered.json`);

  // Auto-merge high-confidence addresses into cex-addresses.ts
  if (AUTO_MERGE) {
    const highConf = unique.filter((a) => a.confidence === "high" && a.interactions >= 20);
    if (highConf.length > 0) {
      log(`\nAuto-merging ${highConf.length} high-confidence addresses...`);
      mergeIntoCexAddresses(highConf);
      log("Merged successfully. Run 'pnpm build' to verify.");
    } else {
      log("\nNo high-confidence addresses to auto-merge. Review data/discovered.json manually.");
    }
  }

  log("\nDone.");
}

// ─── Merge into cex-addresses.ts ─────────────────────────────────────────

function mergeIntoCexAddresses(addresses) {
  let content = fs.readFileSync(CEX_ADDRESSES_FILE, "utf-8");

  // Group by confirmed vs suspected
  const confirmed = addresses.filter((a) => a.source === "etherscan-label");
  const suspected = addresses.filter((a) => a.source !== "etherscan-label");

  // Add confirmed to EVM_CEX array (before the closing bracket)
  if (confirmed.length > 0) {
    const evmInsertPoint = content.indexOf("];\n\n// ═══════════════════════════════════════════════════════════════\n//  SOLANA");
    if (evmInsertPoint > 0) {
      const newEntries = confirmed
        .map((a) => `  { address: "${a.address}", exchange: "${a.exchange}", label: "${a.label}", chain: "ethereum" },`)
        .join("\n");
      content = content.slice(0, evmInsertPoint) +
        `\n  // ── Auto-discovered ${new Date().toISOString().split("T")[0]} ──\n${newEntries}\n` +
        content.slice(evmInsertPoint);
    }
  }

  // Add suspected to SUSPECTED_CEX array
  if (suspected.length > 0) {
    const suspectedInsertPoint = content.lastIndexOf("];\n\n// ═══════════════════════════════════════════════════════════════\n//  Combined");
    if (suspectedInsertPoint > 0) {
      const newEntries = suspected
        .map((a) => `  { address: "${a.address}", exchange: "${a.exchange}", label: "Suspected: ${a.exchange} Linked (auto)", chain: "ethereum" },`)
        .join("\n");
      content = content.slice(0, suspectedInsertPoint) +
        `\n  // ── Auto-discovered ${new Date().toISOString().split("T")[0]} ──\n${newEntries}\n` +
        content.slice(suspectedInsertPoint);
    }
  }

  fs.writeFileSync(CEX_ADDRESSES_FILE, content);
}

main().catch((err) => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
