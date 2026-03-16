import axios from "axios";
import { lookupCex, lookupSuspectedCex, lookupAny, type Chain, type CexAddress, type EntityType } from "./cex-addresses";
import { lookupUserSubmission } from "./submission-store";

export interface CexInteraction {
  exchange: string;
  label: string;
  direction: "sent" | "received";
  txHash: string;
  timestamp?: string;
  amount?: string;
  counterparty: string;
  indirect?: boolean;   // true if detected via 2-hop analysis
  suspected?: boolean;  // true if from suspected (unconfirmed) CEX list
  entityType?: EntityType; // "cex" | "celebrity" | "sanctions" | "rugpull" | "smartmoney" | "fund" | "government" | "protocol"
  chainId?: number;     // EVM chain ID for correct explorer links
}

export interface IndirectExposure {
  intermediaryAddress: string;
  exchange: string;
  label: string;
  direction: "sent" | "received"; // intermediary's direction with the CEX
  confidence: "high" | "medium"; // high = multiple CEX txs, medium = single
  // Transaction details between the scanned wallet and the intermediary
  userTxHash?: string;
  userTxAmount?: string;
  userTxDirection?: "sent" | "received"; // user's direction with the intermediary
  userTxTimestamp?: string;
}

export type ReputationGrade = "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

export interface ScanResult {
  address: string;
  chain: Chain;
  isKyced: boolean;
  riskScore: number; // 0-100
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  reputationScore: number; // 0-100 (higher = better)
  reputationGrade: ReputationGrade;
  interactions: CexInteraction[];
  indirectExposures: IndirectExposure[];
  exchangesSeen: string[];
  totalInteractions: number;
  scanDuration: number;
  celebrityConnections: string[]; // Names of celebrities detected (direct or 2-hop)
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
//  EVM: fetch transaction list for any address (reused for 2-hop)
// ═══════════════════════════════════════════════════════════════

type TxRow = { from: string; to: string; hash: string; timeStamp: string; value: string; tokenSymbol?: string; tokenDecimal?: string; isError?: string; functionName?: string; chainId?: number };

// ═══════════════════════════════════════════════════════════════
//  Dust / spam / phishing filter — skip fake & irrelevant txs
// ═══════════════════════════════════════════════════════════════

const DUST_THRESHOLD_ETH = 0.001;  // ~$3 — skip dust native transfers
const DUST_THRESHOLD_TOKEN = 1.0;  // Skip sub-$1 token transfers (phishing/dust)

// Detect scam/phishing tokens by their name — legit tokens don't contain URLs or promo text
const PHISHING_TOKEN_RE = /\b(visit|claim|swap|access|redeem|activate|airdrop)\b|https?:\/\/|\.(xyz|com|io|gg|app|net|org|co|finance|exchange)\b|www\./i;
const MAX_LEGIT_SYMBOL_LENGTH = 20; // Real token symbols are short (BTC, USDT, WETH, etc.)

function isPhishingTokenName(symbol: string | undefined): boolean {
  if (!symbol) return false;
  // Legit symbols don't contain spaces or URLs
  if (symbol.length > MAX_LEGIT_SYMBOL_LENGTH && symbol.includes(" ")) return true;
  return PHISHING_TOKEN_RE.test(symbol);
}

function isDustOrPhishing(tx: TxRow, walletAddress: string): boolean {
  // Skip failed transactions
  if (tx.isError === "1") return true;
  // Skip contract creation (no "to" address)
  if (!tx.to) return true;
  // Skip zero-value calls (contract interactions, not real transfers)
  if (tx.value === "0") return true;

  const addr = walletAddress.toLowerCase();
  const isReceived = tx.to?.toLowerCase() === addr;

  // Token transfers
  if (tx.tokenSymbol && tx.tokenDecimal) {
    // Scam tokens embed URLs/promo text in the token name (e.g. "Visit getrez.xyz to swap to USDT")
    if (isPhishingTokenName(tx.tokenSymbol)) return true;

    const decimals = Number(tx.tokenDecimal);
    const val = Number(tx.value) / Math.pow(10, decimals);

    // Zero or negligible token amount = phishing/address poisoning
    if (val < DUST_THRESHOLD_TOKEN) return true;

    // Address poisoning: unsolicited received token transfer via transferFrom
    // Scammers call transferFrom(victim, lookalike, 0) to pollute tx history
    if (isReceived && tx.functionName && tx.functionName.includes("transferFrom") && val < 10) return true;

    return false;
  }

  // Native ETH/BNB/MATIC
  const ethValue = Number(tx.value) / 1e18;

  // Unsolicited tiny native receives are likely dust attacks
  if (isReceived && ethValue < DUST_THRESHOLD_ETH) return true;

  // For sent txs, use a lower threshold (user intentionally sent)
  if (!isReceived && ethValue < 0.0001) return true;

  return false;
}

// EVM chains to scan (Etherscan V2 supports all via chainid param)
const EVM_CHAINS = [
  { chainId: 1, name: "ETH Mainnet", nativeSymbol: "ETH", decimals: 18 },
  { chainId: 42161, name: "Arbitrum", nativeSymbol: "ETH", decimals: 18 },
  { chainId: 56, name: "BSC", nativeSymbol: "BNB", decimals: 18 },
  { chainId: 137, name: "Polygon", nativeSymbol: "MATIC", decimals: 18 },
  { chainId: 10, name: "Optimism", nativeSymbol: "ETH", decimals: 18 },
  { chainId: 8453, name: "Base", nativeSymbol: "ETH", decimals: 18 },
];

async function fetchEvmTxListForChain(
  address: string,
  chainId: number,
  nativeSymbol: string,
  apiKey: string
): Promise<TxRow[]> {
  const txList: TxRow[] = [];

  if (!apiKey) return txList;

  // Fetch native transactions
  try {
    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=200&sort=desc&apikey=${apiKey}`;
    const { data } = await axios.get(url, { timeout: 15000 });
    if (data.status === "1" && Array.isArray(data.result)) {
      for (const tx of data.result) {
        tx.tokenSymbol = nativeSymbol;
        tx.chainId = chainId;
        txList.push(tx);
      }
    }
  } catch {
    // Skip failed chain
  }

  // Fetch ERC-20 token transfers
  try {
    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=200&sort=desc&apikey=${apiKey}`;
    const { data } = await axios.get(url, { timeout: 15000 });
    if (data.status === "1" && Array.isArray(data.result)) {
      for (const tx of data.result) {
        tx.chainId = chainId;
        txList.push(tx);
      }
    }
  } catch {
    // Skip failed token fetch
  }

  return txList;
}

async function fetchEvmTxList(address: string): Promise<TxRow[]> {
  const apiKey = process.env.ETHERSCAN_API_KEY || "";
  let allTxs: TxRow[] = [];

  if (apiKey) {
    // Scan all EVM chains in parallel batches of 3 (rate limit: 5 calls/sec, each chain = 2 calls)
    for (let i = 0; i < EVM_CHAINS.length; i += 3) {
      const batch = EVM_CHAINS.slice(i, i + 3);
      const results = await Promise.allSettled(
        batch.map((chain) =>
          fetchEvmTxListForChain(address, chain.chainId, chain.nativeSymbol, apiKey)
        )
      );
      for (const r of results) {
        if (r.status === "fulfilled") {
          allTxs.push(...r.value);
        }
      }
      // Small delay between batches to respect rate limits
      if (i + 3 < EVM_CHAINS.length) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }

  // Blockscout fallback only if we got nothing (no API key or all chains empty)
  if (allTxs.length === 0) {
    try {
      const url = `https://eth.blockscout.com/api/v2/addresses/${address}/transactions`;
      const { data } = await axios.get(url, { timeout: 15000 });
      if (data.items && Array.isArray(data.items)) {
        allTxs = data.items.map((tx: { from: { hash: string }; to: { hash: string }; hash: string; timestamp: string; value: string }) => ({
          from: tx.from?.hash || "",
          to: tx.to?.hash || "",
          hash: tx.hash,
          timeStamp: tx.timestamp ? String(Math.floor(new Date(tx.timestamp).getTime() / 1000)) : "0",
          value: tx.value || "0",
        }));
      }
    } catch {
      // Blockscout fallback failed
    }
  }

  return allTxs;
}

// ═══════════════════════════════════════════════════════════════
//  2-hop indirect exposure checker (EVM only for now)
//  Checks if counterparties themselves interact with known CEX wallets
// ═══════════════════════════════════════════════════════════════

interface CounterpartyInfo {
  address: string;
  txHash: string;
  amount: string;
  direction: "sent" | "received"; // user's direction with this counterparty
  timestamp?: string;
}

async function checkIndirectExposureEvm(
  counterparties: CounterpartyInfo[],
  chain: Chain
): Promise<IndirectExposure[]> {
  if (chain !== "ethereum") return []; // Only EVM supported for now

  const exposures: IndirectExposure[] = [];
  const checked = new Set<string>();

  // Limit to top 10 unique counterparties to avoid rate limits
  const toCheck = counterparties.filter((cp) => {
    if (checked.has(cp.address)) return false;
    // Skip if it's already a known CEX address
    if (lookupCex(cp.address, "ethereum")) return false;
    // Skip if it's any known labeled entity (protocol routers, bridges, etc. generate false 2-hop hits)
    if (lookupAny(cp.address, "ethereum")) return false;
    checked.add(cp.address);
    return true;
  }).slice(0, 10);

  // Check counterparties in batches of 3 (rate limit friendly)
  for (let i = 0; i < toCheck.length; i += 3) {
    const batch = toCheck.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map(async (cpInfo) => {
        try {
          const txList = await fetchEvmTxList(cpInfo.address);
          let cexHits = 0;
          let lastExchange = "";
          let lastLabel = "";
          let lastDirection: "sent" | "received" = "sent";

          for (const tx of txList.slice(0, 100)) {
            const from = tx.from?.toLowerCase();
            const to = tx.to?.toLowerCase();
            const cp = cpInfo.address.toLowerCase();

            if (from === cp && to) {
              const match = lookupCex(to, "ethereum");
              if (match) {
                cexHits++;
                lastExchange = match.exchange;
                lastLabel = match.label;
                lastDirection = "sent";
              }
            }
            if (to === cp && from) {
              const match = lookupCex(from, "ethereum");
              if (match) {
                cexHits++;
                lastExchange = match.exchange;
                lastLabel = match.label;
                lastDirection = "received";
              }
            }
          }

          // Require at least 2 CEX hits to avoid false positives from single interactions
          if (cexHits >= 2) {
            return {
              intermediaryAddress: cpInfo.address,
              exchange: lastExchange,
              label: lastLabel,
              direction: lastDirection,
              confidence: cexHits >= 5 ? "high" : "medium",
              userTxHash: cpInfo.txHash,
              userTxAmount: cpInfo.amount,
              userTxDirection: cpInfo.direction,
              userTxTimestamp: cpInfo.timestamp,
            } as IndirectExposure;
          }
          return null;
        } catch {
          return null;
        }
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        exposures.push(r.value);
      }
    }

    // Small delay between batches to respect rate limits
    if (i + 3 < toCheck.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return exposures;
}

// ═══════════════════════════════════════════════════════════════
//  EVM Scanner (Etherscan API - free tier: 5 calls/sec)
// ═══════════════════════════════════════════════════════════════

async function scanEvm(address: string): Promise<ScanResult> {
  const start = Date.now();
  const interactions: CexInteraction[] = [];
  const counterparties: CounterpartyInfo[] = [];

  try {
    const txList = await fetchEvmTxList(address);

    // Track seen exchange+direction combos to deduplicate repeated hits
    const seenInteractions = new Set<string>();

    for (const tx of txList) {
      // Skip dust/spam/phishing transactions
      if (isDustOrPhishing(tx, address)) continue;

      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();
      const addr = address.toLowerCase();

      // Format amount from tx (handles both native and token transfers)
      const formatAmount = (tx: TxRow): string => {
        if (tx.tokenSymbol && tx.tokenDecimal) {
          const decimals = Number(tx.tokenDecimal);
          const val = Number(tx.value) / Math.pow(10, decimals);
          return val.toFixed(decimals > 6 ? 4 : 2) + " " + tx.tokenSymbol;
        }
        // Use the native symbol tagged by fetchEvmTxListForChain (ETH/BNB/MATIC/etc.)
        const nativeSymbol = tx.tokenSymbol || "ETH";
        return (Number(tx.value) / 1e18).toFixed(4) + " " + nativeSymbol;
      };

      const addInteraction = (entry: CexAddress, dir: "sent" | "received", cp: string, isSuspected = false) => {
        // Cap at 5 interactions per exchange+direction to reduce noise
        const key = `${entry.exchange}:${dir}`;
        const count = [...seenInteractions].filter(k => k === key).length;
        if (count >= 5) return;
        seenInteractions.add(key);
        interactions.push({
          exchange: entry.exchange, label: entry.label, direction: dir,
          txHash: tx.hash, timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
          amount: formatAmount(tx), counterparty: cp,
          ...(isSuspected && { suspected: true }),
          entityType: entry.entityType || "cex",
          chainId: tx.chainId,
        });
      };

      // Check if we sent TO a known wallet
      if (from === addr && to) {
        const match = lookupCex(to, "ethereum");
        const suspected = !match ? lookupSuspectedCex(to, "ethereum") : null;
        const anyMatch = !match && !suspected ? lookupAny(to, "ethereum") : null;
        const userSub = !match && !suspected && !anyMatch ? lookupUserSubmission(to, "ethereum") : null;

        if (match) {
          addInteraction(match, "sent", to);
        } else if (suspected) {
          addInteraction(suspected, "sent", to, true);
        } else if (anyMatch) {
          addInteraction(anyMatch, "sent", to);
        } else if (userSub) {
          addInteraction(userSub, "sent", to, true);
        } else {
          counterparties.push({
            address: to, txHash: tx.hash, amount: formatAmount(tx), direction: "sent",
            timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : undefined,
          });
        }
      }

      // Check if we received FROM a known wallet
      if (to === addr && from) {
        const match = lookupCex(from, "ethereum");
        const suspected = !match ? lookupSuspectedCex(from, "ethereum") : null;
        const anyMatch = !match && !suspected ? lookupAny(from, "ethereum") : null;
        const userSub = !match && !suspected && !anyMatch ? lookupUserSubmission(from, "ethereum") : null;
        if (match) {
          addInteraction(match, "received", from);
        } else if (suspected) {
          addInteraction(suspected, "received", from, true);
        } else if (anyMatch) {
          addInteraction(anyMatch, "received", from);
        } else if (userSub) {
          addInteraction(userSub, "received", from, true);
        } else {
          counterparties.push({
            address: from, txHash: tx.hash, amount: formatAmount(tx), direction: "received",
            timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : undefined,
          });
        }
      }
    }

    // 2-hop: check if non-CEX counterparties interact with CEX wallets
    const indirectExposures = await checkIndirectExposureEvm(counterparties, "ethereum");

    // Add indirect interactions to the list with the indirect flag
    for (const exp of indirectExposures) {
      interactions.push({
        exchange: exp.exchange,
        label: `Indirect via ${exp.intermediaryAddress.slice(0, 8)}...`,
        direction: exp.direction,
        txHash: "",
        counterparty: exp.intermediaryAddress,
        indirect: true,
      });
    }

    return buildResult(address, "ethereum", interactions, Date.now() - start, undefined, indirectExposures);
  } catch (err) {
    return buildResult(address, "ethereum", interactions, Date.now() - start, getErrorMessage(err));
  }
}

// ═══════════════════════════════════════════════════════════════
//  Solana Scanner (public RPC / Solana FM API)
// ═══════════════════════════════════════════════════════════════

async function scanSolana(address: string): Promise<ScanResult> {
  const start = Date.now();
  const interactions: CexInteraction[] = [];

  try {
    // Use Solana RPC to get recent signatures
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const { data } = await axios.post(
      rpcUrl,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [address, { limit: 200 }],
      },
      { timeout: 15000 }
    );

    if (data.result && Array.isArray(data.result)) {
      // For each signature, get the transaction to find counterparties
      const sigs = data.result.slice(0, 50); // Limit to 50 to avoid rate limits

      for (const sig of sigs) {
        try {
          const txRes = await axios.post(
            rpcUrl,
            {
              jsonrpc: "2.0",
              id: 1,
              method: "getTransaction",
              params: [sig.signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }],
            },
            { timeout: 10000 }
          );

          const tx = txRes.data.result;
          if (!tx?.transaction?.message?.accountKeys) continue;

          const accounts = tx.transaction.message.accountKeys.map(
            (k: { pubkey: string } | string) => (typeof k === "string" ? k : k.pubkey)
          );

          for (const acc of accounts) {
            if (acc === address) continue;
            const match = lookupCex(acc, "solana") || lookupAny(acc, "solana");
            if (match) {
              const isSender = accounts[0] === address;
              interactions.push({
                exchange: match.exchange,
                label: match.label,
                direction: isSender ? "sent" : "received",
                txHash: sig.signature,
                timestamp: sig.blockTime
                  ? new Date(sig.blockTime * 1000).toISOString()
                  : undefined,
                counterparty: acc,
                entityType: match.entityType || "cex",
              });
              break; // One match per tx is enough
            }
          }
        } catch {
          // Skip failed tx fetches
        }
      }
    }

    return buildResult(address, "solana", interactions, Date.now() - start);
  } catch (err) {
    return buildResult(address, "solana", interactions, Date.now() - start, getErrorMessage(err));
  }
}

// ═══════════════════════════════════════════════════════════════
//  Bitcoin Scanner (Blockchain.info API)
// ═══════════════════════════════════════════════════════════════

async function scanBitcoin(address: string): Promise<ScanResult> {
  const start = Date.now();
  const interactions: CexInteraction[] = [];

  try {
    const url = `https://blockchain.info/rawaddr/${address}?limit=200`;
    const { data } = await axios.get(url, { timeout: 15000 });

    if (data.txs && Array.isArray(data.txs)) {
      for (const tx of data.txs) {
        // Check inputs (addresses that sent to this tx)
        for (const input of tx.inputs || []) {
          const inputAddr = input.prev_out?.addr;
          if (!inputAddr || inputAddr === address) continue;
          const match = lookupCex(inputAddr, "bitcoin") || lookupAny(inputAddr, "bitcoin");
          if (match) {
            interactions.push({
              exchange: match.exchange, label: match.label, direction: "received",
              txHash: tx.hash, timestamp: tx.time ? new Date(tx.time * 1000).toISOString() : undefined,
              amount: input.prev_out.value ? (input.prev_out.value / 1e8).toFixed(8) + " BTC" : undefined,
              counterparty: inputAddr, entityType: match.entityType || "cex",
            });
          }
        }

        // Check outputs (addresses that received from this tx)
        for (const output of tx.out || []) {
          const outputAddr = output.addr;
          if (!outputAddr || outputAddr === address) continue;
          const match = lookupCex(outputAddr, "bitcoin") || lookupAny(outputAddr, "bitcoin");
          if (match) {
            const isSender = tx.inputs?.some(
              (inp: { prev_out?: { addr?: string } }) => inp.prev_out?.addr === address
            );
            if (isSender) {
              interactions.push({
                exchange: match.exchange, label: match.label, direction: "sent",
                txHash: tx.hash, timestamp: tx.time ? new Date(tx.time * 1000).toISOString() : undefined,
                amount: output.value ? (output.value / 1e8).toFixed(8) + " BTC" : undefined,
                counterparty: outputAddr, entityType: match.entityType || "cex",
              });
            }
          }
        }
      }
    }

    return buildResult(address, "bitcoin", interactions, Date.now() - start);
  } catch (err) {
    return buildResult(address, "bitcoin", interactions, Date.now() - start, getErrorMessage(err));
  }
}

// ═══════════════════════════════════════════════════════════════
//  TRON Scanner (Tronscan API)
// ═══════════════════════════════════════════════════════════════

async function scanTron(address: string): Promise<ScanResult> {
  const start = Date.now();
  const interactions: CexInteraction[] = [];
  const seenKeys = new Set<string>();

  const addHit = (match: CexAddress, dir: "sent" | "received", txHash: string, ts: number | undefined, amount: string | undefined, cp: string) => {
    const key = `${match.exchange}:${dir}`;
    const count = [...seenKeys].filter(k => k === key).length;
    if (count >= 5) return;
    seenKeys.add(key);
    interactions.push({
      exchange: match.exchange, label: match.label, direction: dir,
      txHash, timestamp: ts ? new Date(ts).toISOString() : undefined,
      amount, counterparty: cp, entityType: match.entityType || "cex",
    });
  };

  try {
    // Fetch both normal transactions AND TRC-20 transfers in parallel
    const [normalRes, trc20Res] = await Promise.allSettled([
      axios.get(`https://apilist.tronscanapi.com/api/transaction?sort=-timestamp&count=true&limit=200&start=0&address=${address}`, { timeout: 15000 }),
      axios.get(`https://apilist.tronscanapi.com/api/contract/events?sort=-timestamp&count=true&limit=200&start=0&address=${address}`, { timeout: 15000 }),
    ]);

    // ── Normal TRX transactions ──
    if (normalRes.status === "fulfilled" && normalRes.value.data?.data) {
      for (const tx of normalRes.value.data.data) {
        const from = tx.ownerAddress;
        const ts = tx.timestamp;

        // For TRC-20 calls (contractType 31), the real recipient is in trigger_info
        if (tx.contractType === 31 && tx.trigger_info?.parameter?._to) {
          const realTo = tx.trigger_info.parameter._to;
          const rawValue = tx.trigger_info.parameter._value;
          // Get token info from contractInfo or trigger_info
          const contractAddr = tx.trigger_info.contract_address;
          const tokenInfo = tx.contractInfo?.[contractAddr];
          const tokenName = tokenInfo?.tag1 || tokenInfo?.name || "Token";
          const isUsdt = tokenName.includes("USDT") || tokenName.includes("Tether");
          const decimals = isUsdt ? 6 : 6; // Most TRC-20 tokens are 6 decimals
          const tokenAmount = rawValue ? (Number(rawValue) / Math.pow(10, decimals)).toFixed(2) + " " + (isUsdt ? "USDT" : tokenName) : undefined;

          if (from === address) {
            const match = lookupCex(realTo, "tron") || lookupAny(realTo, "tron");
            if (match) addHit(match, "sent", tx.hash, ts, tokenAmount, realTo);
          } else if (realTo === address) {
            const match = lookupCex(from, "tron") || lookupAny(from, "tron");
            if (match) addHit(match, "received", tx.hash, ts, tokenAmount, from);
          }
        } else {
          // Plain TRX transfer
          const to = tx.toAddress || tx.contractData?.to_address;
          const trxAmount = tx.amount && tx.amount > 0 ? (tx.amount / 1e6).toFixed(2) + " TRX" : undefined;

          if (from === address && to) {
            const match = lookupCex(to, "tron") || lookupAny(to, "tron");
            if (match) addHit(match, "sent", tx.hash, ts, trxAmount, to);
          }
          if (to === address && from) {
            const match = lookupCex(from, "tron") || lookupAny(from, "tron");
            if (match) addHit(match, "received", tx.hash, ts, trxAmount, from);
          }
        }
      }
    }

    // ── TRC-20 token transfer events (catches transfers the normal endpoint misses) ──
    if (trc20Res.status === "fulfilled" && trc20Res.value.data?.data) {
      for (const evt of trc20Res.value.data.data) {
        if (evt.event_name !== "Transfer") continue;
        const from = evt.result?.from || evt.result?.[0];
        const to = evt.result?.to || evt.result?.[1];
        const rawValue = evt.result?.value || evt.result?.[2];
        const tokenName = evt.tokenInfo?.tokenAbbr || evt.contract_address_tag || "Token";
        const decimals = evt.tokenInfo?.tokenDecimal || 6;
        const amount = rawValue ? (Number(rawValue) / Math.pow(10, decimals)).toFixed(2) + " " + tokenName : undefined;
        const txHash = evt.transaction_id || evt.event_id || "";
        const ts = evt.block_timestamp;

        // Skip if we already have this tx from the normal endpoint
        if (txHash && interactions.some(i => i.txHash === txHash)) continue;

        if (from === address && to) {
          const match = lookupCex(to, "tron") || lookupAny(to, "tron");
          if (match) addHit(match, "sent", txHash, ts, amount, to);
        }
        if (to === address && from) {
          const match = lookupCex(from, "tron") || lookupAny(from, "tron");
          if (match) addHit(match, "received", txHash, ts, amount, from);
        }
      }
    }

    return buildResult(address, "tron", interactions, Date.now() - start);
  } catch (err) {
    return buildResult(address, "tron", interactions, Date.now() - start, getErrorMessage(err));
  }
}

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

function buildResult(
  address: string,
  chain: Chain,
  interactions: CexInteraction[],
  duration: number,
  error?: string,
  indirectExposures: IndirectExposure[] = []
): ScanResult {
  const directInteractions = interactions.filter((i) => !i.indirect);
  const indirectInteractions = interactions.filter((i) => i.indirect);

  // Deduplicate by exchange
  const exchangesSeen = [...new Set(directInteractions.map((i) => i.exchange))];
  const totalInteractions = directInteractions.length;

  // Risk scoring — entity-type-aware
  let riskScore = 0;
  const cexInteractions = directInteractions.filter((i) => !i.entityType || i.entityType === "cex");
  const sanctionsHits = directInteractions.filter((i) => i.entityType === "sanctions");
  const rugpullHits = directInteractions.filter((i) => i.entityType === "rugpull");

  // CEX exposure risk (traditional scoring)
  if (cexInteractions.length > 0) riskScore += 30;
  if (cexInteractions.length > 5) riskScore += 20;
  if (cexInteractions.length > 20) riskScore += 15;
  if (exchangesSeen.length > 1) riskScore += 15;
  if (exchangesSeen.length > 3) riskScore += 10;
  if (cexInteractions.some((i) => i.direction === "sent")) riskScore += 10;

  // Sanctions exposure — CRITICAL risk
  if (sanctionsHits.length > 0) riskScore += 40;
  if (sanctionsHits.length > 3) riskScore += 20;

  // Rug pull / hack exposure
  if (rugpullHits.length > 0) riskScore += 25;
  if (rugpullHits.length > 3) riskScore += 15;

  // Indirect exposure adds risk even when no direct CEX interaction found
  if (indirectExposures.length > 0) {
    riskScore += 15;
    if (indirectExposures.some((e) => e.confidence === "high")) riskScore += 10;
    if (indirectExposures.length > 3) riskScore += 5;
  }

  riskScore = Math.min(100, riskScore);

  let riskLevel: ScanResult["riskLevel"] = "none";
  if (riskScore >= 80) riskLevel = "critical";
  else if (riskScore >= 60) riskLevel = "high";
  else if (riskScore >= 35) riskLevel = "medium";
  else if (riskScore > 0) riskLevel = "low";

  // Reputation score: inverse of risk, boosted by positive signals
  let reputationScore = 100 - riskScore;
  // Bonus for smart money / fund connections
  const smartMoneyHits = directInteractions.filter((i) => i.entityType === "smartmoney" || i.entityType === "fund");
  if (smartMoneyHits.length > 0) reputationScore = Math.min(100, reputationScore + 5);
  // Bonus for protocol interactions (active DeFi user)
  const protocolHits = directInteractions.filter((i) => i.entityType === "protocol");
  if (protocolHits.length > 0) reputationScore = Math.min(100, reputationScore + 5);
  // Penalty for sanctions (double-dip with risk already, but ensure F grade)
  if (sanctionsHits.length > 0) reputationScore = Math.max(0, reputationScore - 20);
  reputationScore = Math.max(0, Math.min(100, reputationScore));

  let reputationGrade: ReputationGrade = "A+";
  if (reputationScore >= 95) reputationGrade = "A+";
  else if (reputationScore >= 85) reputationGrade = "A";
  else if (reputationScore >= 75) reputationGrade = "B+";
  else if (reputationScore >= 65) reputationGrade = "B";
  else if (reputationScore >= 50) reputationGrade = "C";
  else if (reputationScore >= 30) reputationGrade = "D";
  else reputationGrade = "F";

  // Celebrity connections
  const celebrityConnections = [
    ...new Set([
      ...directInteractions.filter((i) => i.entityType === "celebrity").map((i) => i.exchange),
      ...indirectExposures.filter((e) => {
        // Check if intermediary connects to a celebrity (from the label)
        const match = lookupAny(e.intermediaryAddress, chain);
        return match?.entityType === "celebrity";
      }).map((e) => e.exchange),
    ]),
  ];

  // Include indirect exchanges in exchangesSeen
  const allExchangesSeen = [
    ...new Set([
      ...exchangesSeen,
      ...indirectExposures.map((e) => `${e.exchange} (indirect)`),
    ]),
  ];

  return {
    address,
    chain,
    isKyced: totalInteractions > 0 || indirectExposures.length > 0,
    riskScore,
    riskLevel,
    reputationScore,
    reputationGrade,
    interactions: [...directInteractions, ...indirectInteractions].slice(0, 50),
    indirectExposures,
    exchangesSeen: allExchangesSeen,
    totalInteractions: totalInteractions + indirectInteractions.length,
    scanDuration: duration,
    celebrityConnections,
    error,
  };
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") return "Request timed out";
    if (err.response?.status === 429) return "Rate limited — try again in a minute";
    return err.message;
  }
  return err instanceof Error ? err.message : "Unknown error";
}

// ═══════════════════════════════════════════════════════════════
//  Chain detection + main entry point
// ═══════════════════════════════════════════════════════════════

// Disabled chains — incomplete data, re-enable when ready
const DISABLED_CHAINS: Chain[] = ["solana", "bitcoin", "tron"];

export function detectChain(address: string): Chain | null {
  // EVM: 0x + 40 hex chars
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "ethereum";

  // Bitcoin: check BEFORE Solana since BTC addresses overlap with base58 range
  // Starts with 1, 3 (legacy/segwit) or bc1 (bech32)
  if (/^(1|3)[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address)) return "bitcoin";
  if (/^bc1[a-zA-HJ-NP-Z0-9]{25,89}$/.test(address)) return "bitcoin";

  // TRON: starts with T, 34 chars, base58
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return "tron";

  // Solana: base58, 32-44 chars (checked last since it's the broadest pattern)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return "solana";

  return null;
}

export function isChainSupported(chain: Chain): boolean {
  return !DISABLED_CHAINS.includes(chain);
}

export async function scanAddress(address: string, chain?: Chain): Promise<ScanResult> {
  const detectedChain = chain || detectChain(address);
  if (!detectedChain) {
    return {
      address,
      chain: "ethereum",
      isKyced: false,
      riskScore: 0,
      riskLevel: "none",
      reputationScore: 100,
      reputationGrade: "A+",
      interactions: [],
      indirectExposures: [],
      exchangesSeen: [],
      totalInteractions: 0,
      scanDuration: 0,
      celebrityConnections: [],
      error: "Could not detect chain. Please select manually.",
    };
  }

  if (!isChainSupported(detectedChain)) {
    return {
      address,
      chain: detectedChain,
      isKyced: false,
      riskScore: 0,
      riskLevel: "none",
      reputationScore: 100,
      reputationGrade: "A+",
      interactions: [],
      indirectExposures: [],
      exchangesSeen: [],
      totalInteractions: 0,
      scanDuration: 0,
      celebrityConnections: [],
      error: `${detectedChain.charAt(0).toUpperCase() + detectedChain.slice(1)} scanning is temporarily disabled while we expand our address database. EVM chains are fully supported.`,
    };
  }

  switch (detectedChain) {
    case "ethereum":
      return scanEvm(address);
    case "solana":
      return scanSolana(address);
    case "bitcoin":
      return scanBitcoin(address);
    case "tron":
      return scanTron(address);
  }
}
