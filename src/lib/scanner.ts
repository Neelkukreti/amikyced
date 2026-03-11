import axios from "axios";
import { lookupCex, type Chain, type CexAddress } from "./cex-addresses";

export interface CexInteraction {
  exchange: string;
  label: string;
  direction: "sent" | "received";
  txHash: string;
  timestamp?: string;
  amount?: string;
  counterparty: string;
  indirect?: boolean; // true if detected via 2-hop analysis
}

export interface IndirectExposure {
  intermediaryAddress: string;
  exchange: string;
  label: string;
  direction: "sent" | "received"; // intermediary's direction with the CEX
  confidence: "high" | "medium"; // high = multiple CEX txs, medium = single
}

export interface ScanResult {
  address: string;
  chain: Chain;
  isKyced: boolean;
  riskScore: number; // 0-100
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  interactions: CexInteraction[];
  indirectExposures: IndirectExposure[];
  exchangesSeen: string[];
  totalInteractions: number;
  scanDuration: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
//  EVM: fetch transaction list for any address (reused for 2-hop)
// ═══════════════════════════════════════════════════════════════

type TxRow = { from: string; to: string; hash: string; timeStamp: string; value: string };

async function fetchEvmTxList(address: string): Promise<TxRow[]> {
  const apiKey = process.env.ETHERSCAN_API_KEY || "";
  let txList: TxRow[] = [];

  if (apiKey) {
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=500&sort=desc&apikey=${apiKey}`;
    const { data } = await axios.get(url, { timeout: 15000 });
    if (data.status === "1" && Array.isArray(data.result)) {
      txList = data.result;
    }
  }

  if (txList.length === 0) {
    const url = `https://eth.blockscout.com/api/v2/addresses/${address}/transactions`;
    const { data } = await axios.get(url, { timeout: 15000 });
    if (data.items && Array.isArray(data.items)) {
      txList = data.items.map((tx: { from: { hash: string }; to: { hash: string }; hash: string; timestamp: string; value: string }) => ({
        from: tx.from?.hash || "",
        to: tx.to?.hash || "",
        hash: tx.hash,
        timeStamp: tx.timestamp ? String(Math.floor(new Date(tx.timestamp).getTime() / 1000)) : "0",
        value: tx.value || "0",
      }));
    }
  }

  return txList;
}

// ═══════════════════════════════════════════════════════════════
//  2-hop indirect exposure checker (EVM only for now)
//  Checks if counterparties themselves interact with known CEX wallets
// ═══════════════════════════════════════════════════════════════

async function checkIndirectExposureEvm(
  counterparties: string[],
  chain: Chain
): Promise<IndirectExposure[]> {
  if (chain !== "ethereum") return []; // Only EVM supported for now

  const exposures: IndirectExposure[] = [];
  const checked = new Set<string>();

  // Limit to top 10 unique counterparties to avoid rate limits
  const toCheck = counterparties.filter((addr) => {
    if (checked.has(addr)) return false;
    // Skip if it's already a known CEX address
    if (lookupCex(addr, "ethereum")) return false;
    checked.add(addr);
    return true;
  }).slice(0, 10);

  // Check counterparties in batches of 3 (rate limit friendly)
  for (let i = 0; i < toCheck.length; i += 3) {
    const batch = toCheck.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map(async (counterparty) => {
        try {
          const txList = await fetchEvmTxList(counterparty);
          let cexHits = 0;
          let lastExchange = "";
          let lastLabel = "";
          let lastDirection: "sent" | "received" = "sent";

          for (const tx of txList.slice(0, 100)) {
            const from = tx.from?.toLowerCase();
            const to = tx.to?.toLowerCase();
            const cp = counterparty.toLowerCase();

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

          if (cexHits > 0) {
            return {
              intermediaryAddress: counterparty,
              exchange: lastExchange,
              label: lastLabel,
              direction: lastDirection,
              confidence: cexHits >= 3 ? "high" : "medium",
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
  const counterparties: string[] = [];

  try {
    const txList = await fetchEvmTxList(address);

    for (const tx of txList) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();
      const addr = address.toLowerCase();

      // Check if we sent TO a CEX
      if (from === addr && to) {
        const match = lookupCex(to, "ethereum");
        if (match) {
          interactions.push({
            exchange: match.exchange,
            label: match.label,
            direction: "sent",
            txHash: tx.hash,
            timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
            amount: (Number(tx.value) / 1e18).toFixed(4) + " ETH",
            counterparty: to,
          });
        } else {
          counterparties.push(to);
        }
      }

      // Check if we received FROM a CEX
      if (to === addr && from) {
        const match = lookupCex(from, "ethereum");
        if (match) {
          interactions.push({
            exchange: match.exchange,
            label: match.label,
            direction: "received",
            txHash: tx.hash,
            timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
            amount: (Number(tx.value) / 1e18).toFixed(4) + " ETH",
            counterparty: from,
          });
        } else {
          counterparties.push(from);
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
            const match = lookupCex(acc, "solana");
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
          const match = lookupCex(inputAddr, "bitcoin");
          if (match) {
            interactions.push({
              exchange: match.exchange,
              label: match.label,
              direction: "received",
              txHash: tx.hash,
              timestamp: tx.time ? new Date(tx.time * 1000).toISOString() : undefined,
              amount: input.prev_out.value ? (input.prev_out.value / 1e8).toFixed(8) + " BTC" : undefined,
              counterparty: inputAddr,
            });
          }
        }

        // Check outputs (addresses that received from this tx)
        for (const output of tx.out || []) {
          const outputAddr = output.addr;
          if (!outputAddr || outputAddr === address) continue;
          const match = lookupCex(outputAddr, "bitcoin");
          if (match) {
            // If our address is in inputs, we sent to this CEX
            const isSender = tx.inputs?.some(
              (inp: { prev_out?: { addr?: string } }) => inp.prev_out?.addr === address
            );
            if (isSender) {
              interactions.push({
                exchange: match.exchange,
                label: match.label,
                direction: "sent",
                txHash: tx.hash,
                timestamp: tx.time ? new Date(tx.time * 1000).toISOString() : undefined,
                amount: output.value ? (output.value / 1e8).toFixed(8) + " BTC" : undefined,
                counterparty: outputAddr,
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

  try {
    const url = `https://apilist.tronscanapi.com/api/transaction?sort=-timestamp&count=true&limit=200&start=0&address=${address}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    if (data.data && Array.isArray(data.data)) {
      for (const tx of data.data) {
        const from = tx.ownerAddress || tx.contractData?.owner_address;
        const to = tx.toAddress || tx.contractData?.to_address;

        if (from === address && to) {
          const match = lookupCex(to, "tron");
          if (match) {
            interactions.push({
              exchange: match.exchange,
              label: match.label,
              direction: "sent",
              txHash: tx.hash,
              timestamp: tx.timestamp ? new Date(tx.timestamp).toISOString() : undefined,
              amount: tx.amount ? (tx.amount / 1e6).toFixed(2) + " TRX" : undefined,
              counterparty: to,
            });
          }
        }

        if (to === address && from) {
          const match = lookupCex(from, "tron");
          if (match) {
            interactions.push({
              exchange: match.exchange,
              label: match.label,
              direction: "received",
              txHash: tx.hash,
              timestamp: tx.timestamp ? new Date(tx.timestamp).toISOString() : undefined,
              amount: tx.amount ? (tx.amount / 1e6).toFixed(2) + " TRX" : undefined,
              counterparty: from,
            });
          }
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

  // Risk scoring
  let riskScore = 0;
  if (totalInteractions > 0) riskScore += 30; // Any direct interaction = base risk
  if (totalInteractions > 5) riskScore += 20;
  if (totalInteractions > 20) riskScore += 15;
  if (exchangesSeen.length > 1) riskScore += 15; // Multiple exchanges
  if (exchangesSeen.length > 3) riskScore += 10;
  if (directInteractions.some((i) => i.direction === "sent")) riskScore += 10; // Deposited to CEX

  // Indirect exposure adds risk even when no direct CEX interaction found
  if (indirectExposures.length > 0) {
    riskScore += 15; // Base indirect risk
    if (indirectExposures.some((e) => e.confidence === "high")) riskScore += 10;
    if (indirectExposures.length > 3) riskScore += 5;
  }

  riskScore = Math.min(100, riskScore);

  let riskLevel: ScanResult["riskLevel"] = "none";
  if (riskScore >= 80) riskLevel = "critical";
  else if (riskScore >= 60) riskLevel = "high";
  else if (riskScore >= 35) riskLevel = "medium";
  else if (riskScore > 0) riskLevel = "low";

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
    interactions: [...directInteractions, ...indirectInteractions].slice(0, 50),
    indirectExposures,
    exchangesSeen: allExchangesSeen,
    totalInteractions: totalInteractions + indirectInteractions.length,
    scanDuration: duration,
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

export async function scanAddress(address: string, chain?: Chain): Promise<ScanResult> {
  const detectedChain = chain || detectChain(address);
  if (!detectedChain) {
    return {
      address,
      chain: "ethereum",
      isKyced: false,
      riskScore: 0,
      riskLevel: "none",
      interactions: [],
      indirectExposures: [],
      exchangesSeen: [],
      totalInteractions: 0,
      scanDuration: 0,
      error: "Could not detect chain. Please select manually.",
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
