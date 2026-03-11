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
}

export interface ScanResult {
  address: string;
  chain: Chain;
  isKyced: boolean;
  riskScore: number; // 0-100
  riskLevel: "none" | "low" | "medium" | "high" | "critical";
  interactions: CexInteraction[];
  exchangesSeen: string[];
  totalInteractions: number;
  scanDuration: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
//  EVM Scanner (Etherscan API - free tier: 5 calls/sec)
// ═══════════════════════════════════════════════════════════════

async function scanEvm(address: string): Promise<ScanResult> {
  const start = Date.now();
  const interactions: CexInteraction[] = [];
  const apiKey = process.env.ETHERSCAN_API_KEY || "";

  try {
    // Try Etherscan V2 first (requires API key), fallback to Blockscout
    let txList: { from: string; to: string; hash: string; timeStamp: string; value: string }[] = [];

    if (apiKey) {
      const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=500&sort=desc&apikey=${apiKey}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      if (data.status === "1" && Array.isArray(data.result)) {
        txList = data.result;
      }
    }

    // Fallback: Blockscout (free, no key needed)
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
        }
      }
    }

    return buildResult(address, "ethereum", interactions, Date.now() - start);
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
  error?: string
): ScanResult {
  // Deduplicate by exchange
  const exchangesSeen = [...new Set(interactions.map((i) => i.exchange))];
  const totalInteractions = interactions.length;

  // Risk scoring
  let riskScore = 0;
  if (totalInteractions > 0) riskScore += 30; // Any interaction = base risk
  if (totalInteractions > 5) riskScore += 20;
  if (totalInteractions > 20) riskScore += 15;
  if (exchangesSeen.length > 1) riskScore += 15; // Multiple exchanges
  if (exchangesSeen.length > 3) riskScore += 10;
  if (interactions.some((i) => i.direction === "sent")) riskScore += 10; // Deposited to CEX (stronger KYC signal)

  riskScore = Math.min(100, riskScore);

  let riskLevel: ScanResult["riskLevel"] = "none";
  if (riskScore >= 80) riskLevel = "critical";
  else if (riskScore >= 60) riskLevel = "high";
  else if (riskScore >= 35) riskLevel = "medium";
  else if (riskScore > 0) riskLevel = "low";

  return {
    address,
    chain,
    isKyced: totalInteractions > 0,
    riskScore,
    riskLevel,
    interactions: interactions.slice(0, 50), // Cap results
    exchangesSeen,
    totalInteractions,
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
