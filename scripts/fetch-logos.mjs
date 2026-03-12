#!/usr/bin/env node
/**
 * Fetch exchange logos from CoinGecko's exchange API
 * Saves PNGs to public/exchanges/{slug}.png
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/exchanges");

// Map our exchange names to CoinGecko exchange IDs
const EXCHANGE_MAP = {
  "Binance": "binance",
  "Coinbase": "gdax",
  "Kraken": "kraken",
  "OKX": "okex",
  "Bybit": "bybit_spot",
  "KuCoin": "kucoin",
  "Gate.io": "gate",
  "Bitfinex": "bitfinex",
  "Gemini": "gemini",
  "Bitstamp": "bitstamp",
  "HTX (Huobi)": "huobi",
  "Crypto.com": "crypto_com",
  "Bitget": "bitget",
  "MEXC": "mxc",
  "Upbit": "upbit",
  "Bithumb": "bithumb",
  "BitMart": "bitmart",
  "BingX": "bingx",
  "Poloniex": "poloniex",
  "WhiteBIT": "whitebit",
  "CoinEx": "coinex",
  "LBank": "lbank",
  "Deribit": "deribit",
  "Robinhood": null, // Not on CoinGecko
  "FTX": null, // Defunct
  "Mt. Gox": null, // Defunct
  "Celsius": null, // Defunct
  "BlockFi": null, // Defunct
  "BitFlyer": "bitflyer",
  "Bitvavo": "bitvavo",
  "DigiFinex": "digifinex",
  "Korbit": "korbit",
  "BTCTurk": "btcturk",
  "Paribu": "paribu",
  "Luno": "luno",
  "ProBit": "probit",
  "WazirX": "wazirx",
  // Suspected
  "Wintermute": null,
  "Jump Trading": null,
  "Alameda Research": null,
  "Voyager": null,
  "Hotbit": null,
  "Blockchain.com": null,
  "Coinone": null,
  "CoinDCX": null,
  "ZebPay": null,
  "Coinhako": null,
  "Independent Reserve": null,
  "Toobit": null,
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchExchangeLogo(geckoId, slug) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/exchanges/${geckoId}`);
    if (!res.ok) {
      console.log(`  [SKIP] ${slug}: CoinGecko returned ${res.status}`);
      return false;
    }
    const data = await res.json();
    const imageUrl = data.image;
    if (!imageUrl) {
      console.log(`  [SKIP] ${slug}: No image URL`);
      return false;
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      console.log(`  [SKIP] ${slug}: Image fetch failed ${imgRes.status}`);
      return false;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const ext = imageUrl.includes(".png") ? "png" : imageUrl.includes(".svg") ? "svg" : "png";
    const outPath = path.join(OUT_DIR, `${slug}.${ext}`);
    fs.writeFileSync(outPath, buffer);
    console.log(`  [OK] ${slug} (${(buffer.length / 1024).toFixed(1)}KB)`);
    return true;
  } catch (err) {
    console.log(`  [ERR] ${slug}: ${err.message}`);
    return false;
  }
}

// Fallback: try fetching favicon from exchange domain
const DOMAIN_MAP = {
  "Robinhood": "robinhood.com",
  "FTX": "ftx.com",
  "Wintermute": "wintermute.com",
  "Blockchain.com": "blockchain.com",
  "Coinone": "coinone.co.kr",
  "CoinDCX": "coindcx.com",
  "ZebPay": "zebpay.com",
  "WazirX": "wazirx.com",
  "KuCoin": "kucoin.com",
  "Gate.io": "gate.io",
  "Bitfinex": "bitfinex.com",
  "Gemini": "gemini.com",
  "Bitstamp": "bitstamp.net",
  "HTX (Huobi)": "htx.com",
  "Crypto.com": "crypto.com",
  "Bitget": "bitget.com",
  "MEXC": "mexc.com",
  "Upbit": "upbit.com",
  "Bithumb": "bithumb.com",
  "BitMart": "bitmart.com",
  "BingX": "bingx.com",
  "Poloniex": "poloniex.com",
  "WhiteBIT": "whitebit.com",
  "CoinEx": "coinex.com",
  "LBank": "lbank.com",
  "Deribit": "deribit.com",
  "BitFlyer": "bitflyer.com",
  "Bitvavo": "bitvavo.com",
  "DigiFinex": "digifinex.com",
  "Korbit": "korbit.co.kr",
  "BTCTurk": "btcturk.com",
  "Paribu": "paribu.com",
  "Luno": "luno.com",
  "ProBit": "probit.com",
  "Celsius": "celsius.network",
  "Voyager": "investvoyager.com",
};

async function fetchFavicon(domain, slug) {
  try {
    // Use Google's favicon service
    const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 100) return false; // Too small, probably a default icon
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.png`), buffer);
    console.log(`  [OK] ${slug} (favicon, ${(buffer.length / 1024).toFixed(1)}KB)`);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("Fetching exchange logos...\n");

  const results = { ok: 0, skip: 0, err: 0 };

  for (const [name, geckoId] of Object.entries(EXCHANGE_MAP)) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const outFile = path.join(OUT_DIR, `${slug}.png`);

    // Skip if already downloaded
    if (fs.existsSync(outFile)) {
      console.log(`  [CACHED] ${slug}`);
      results.ok++;
      continue;
    }

    if (geckoId) {
      const ok = await fetchExchangeLogo(geckoId, slug);
      if (ok) {
        results.ok++;
      } else if (DOMAIN_MAP[name]) {
        // Fallback to favicon
        const ok2 = await fetchFavicon(DOMAIN_MAP[name], slug);
        results[ok2 ? "ok" : "skip"]++;
      } else {
        results.skip++;
      }
      await sleep(7000); // CoinGecko free tier
    } else if (DOMAIN_MAP[name]) {
      const ok = await fetchFavicon(DOMAIN_MAP[name], slug);
      results[ok ? "ok" : "skip"]++;
    } else {
      console.log(`  [SKIP] ${slug}: No source configured`);
      results.skip++;
    }
  }

  console.log(`\nDone: ${results.ok} downloaded, ${results.skip} skipped`);

  // Generate the mapping file
  const logos = {};
  const files = fs.readdirSync(OUT_DIR);
  for (const file of files) {
    if (!file.endsWith(".png") && !file.endsWith(".svg")) continue;
    const slug = file.replace(/\.(png|svg)$/, "");
    logos[slug] = `/exchanges/${file}`;
  }

  // Find mapping from exchange name to slug
  const nameToSlug = {};
  for (const name of Object.keys(EXCHANGE_MAP)) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    if (logos[slug]) {
      nameToSlug[name] = logos[slug];
    }
  }

  const mapPath = path.join(OUT_DIR, "index.json");
  fs.writeFileSync(mapPath, JSON.stringify(nameToSlug, null, 2));
  console.log(`\nWrote logo map to public/exchanges/index.json (${Object.keys(nameToSlug).length} entries)`);
}

main().catch(console.error);
