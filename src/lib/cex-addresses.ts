/**
 * Known CEX wallet addresses across chains.
 * Sources: Etherscan labels, Arkham Intelligence, Solscan, blockchain explorers.
 *
 * Each exchange has hot wallets (high-volume, frequent txs) and deposit/withdrawal addresses.
 * This is a curated subset — production would use a database with 10K+ addresses.
 */

export interface CexAddress {
  address: string;
  exchange: string;
  label: string; // e.g. "Binance Hot Wallet 1"
  chain: Chain;
}

export type Chain = "ethereum" | "solana" | "bitcoin" | "tron";

// ═══════════════════════════════════════════════════════════════
//  ETHEREUM / EVM addresses (also valid on BSC, Polygon, Arb)
// ═══════════════════════════════════════════════════════════════

const EVM_CEX: CexAddress[] = [
  // Binance
  { address: "0x28c6c06298d514db089934071355e5743bf21d60", exchange: "Binance", label: "Binance Hot Wallet", chain: "ethereum" },
  { address: "0x21a31ee1afc51d94c2efccaa2092ad1028285549", exchange: "Binance", label: "Binance Hot Wallet 2", chain: "ethereum" },
  { address: "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", exchange: "Binance", label: "Binance Hot Wallet 3", chain: "ethereum" },
  { address: "0x56eddb7aa87536c09ccc2793473599fd21a8b17f", exchange: "Binance", label: "Binance Hot Wallet 4", chain: "ethereum" },
  { address: "0x9696f59e4d72e237be84ffd425dcad154bf96976", exchange: "Binance", label: "Binance Hot Wallet 5", chain: "ethereum" },
  { address: "0xf977814e90da44bfa03b6295a0616a897441acec", exchange: "Binance", label: "Binance Cold Wallet", chain: "ethereum" },
  { address: "0x5a52e96bacdabb82fd05763e25335261b270efcb", exchange: "Binance", label: "Binance Hot Wallet 6", chain: "ethereum" },
  { address: "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8", exchange: "Binance", label: "Binance Cold Wallet 2", chain: "ethereum" },
  { address: "0x8894e0a0c962cb723c1ef8a1b4bdddb8c8b7ec68", exchange: "Binance", label: "Binance Hot Wallet 7", chain: "ethereum" },
  { address: "0xab83d182f3485cf1d6ccdd34c7cfef95b4c08da4", exchange: "Binance", label: "Binance Hot Wallet 8", chain: "ethereum" },
  { address: "0x4976a4a02f38326660d17bf34b431dc6e2eb2327", exchange: "Binance", label: "Binance Hot Wallet 9", chain: "ethereum" },
  { address: "0x3c783c21a0383057d128bae431894a5c19f9cf06", exchange: "Binance", label: "Binance Hot Wallet 10", chain: "ethereum" },
  { address: "0xe2fc31f816a9b94326492132018c3aecc4a93ae1", exchange: "Binance", label: "Binance Hot Wallet 11", chain: "ethereum" },

  // Coinbase
  { address: "0x71660c4005ba85c37ccec55d0c4493e66fe775d3", exchange: "Coinbase", label: "Coinbase Hot Wallet", chain: "ethereum" },
  { address: "0x503828976d22510aad0201ac7ec88293211d23da", exchange: "Coinbase", label: "Coinbase Hot Wallet 2", chain: "ethereum" },
  { address: "0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740", exchange: "Coinbase", label: "Coinbase Hot Wallet 3", chain: "ethereum" },
  { address: "0x3cd751e6b0078be393132286c442345e68ff0aaa", exchange: "Coinbase", label: "Coinbase Hot Wallet 4", chain: "ethereum" },
  { address: "0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511", exchange: "Coinbase", label: "Coinbase Hot Wallet 5", chain: "ethereum" },
  { address: "0xeb2629a2734e272bcc07bda959863f316f4bd4cf", exchange: "Coinbase", label: "Coinbase Hot Wallet 6", chain: "ethereum" },
  { address: "0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43", exchange: "Coinbase", label: "Coinbase Commerce", chain: "ethereum" },
  { address: "0x77134cbc06cb00b44112f4ce8baefd41eee96d2b", exchange: "Coinbase", label: "Coinbase Hot Wallet 7", chain: "ethereum" },

  // Kraken
  { address: "0x2910543af39aba0cd09dbb2d50200b3e800a63d2", exchange: "Kraken", label: "Kraken Hot Wallet", chain: "ethereum" },
  { address: "0x267be1c1d684f78cb4f6a176c4911b741e4ffdc0", exchange: "Kraken", label: "Kraken Hot Wallet 2", chain: "ethereum" },
  { address: "0xfa52274dd61e1643d2205169732f29114bc240b3", exchange: "Kraken", label: "Kraken Hot Wallet 3", chain: "ethereum" },
  { address: "0xae2d4617c862309a3d75a0ffb358c7a5009c673f", exchange: "Kraken", label: "Kraken Hot Wallet 4", chain: "ethereum" },
  { address: "0x53d284357ec70ce289d6d64134dfac8e511c8a3d", exchange: "Kraken", label: "Kraken Cold Wallet", chain: "ethereum" },

  // OKX
  { address: "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b", exchange: "OKX", label: "OKX Hot Wallet", chain: "ethereum" },
  { address: "0x236f9f97e0e62388479bf9e5ba4889e46b0273c3", exchange: "OKX", label: "OKX Hot Wallet 2", chain: "ethereum" },
  { address: "0xa7efae728d2936e78bda97dc267687568dd593f3", exchange: "OKX", label: "OKX Hot Wallet 3", chain: "ethereum" },
  { address: "0x5041ed759dd4afc3a72b8192c143f72f4724081a", exchange: "OKX", label: "OKX Hot Wallet 4", chain: "ethereum" },

  // Bybit
  { address: "0xf89d7b9c864f589bbf53a82105107622b35eaa40", exchange: "Bybit", label: "Bybit Hot Wallet", chain: "ethereum" },
  { address: "0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4", exchange: "Bybit", label: "Bybit Cold Wallet", chain: "ethereum" },

  // KuCoin
  { address: "0xd6216fc19db775df9774a6e33526131da7d19a2c", exchange: "KuCoin", label: "KuCoin Hot Wallet", chain: "ethereum" },
  { address: "0xeb30d04f37361f83fe7a0739c50ccf9e1bfa6f14", exchange: "KuCoin", label: "KuCoin Hot Wallet 2", chain: "ethereum" },
  { address: "0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91", exchange: "KuCoin", label: "KuCoin Hot Wallet 3", chain: "ethereum" },

  // Gate.io
  { address: "0x0d0707963952f2fba59dd06f2b425ace40b492fe", exchange: "Gate.io", label: "Gate.io Hot Wallet", chain: "ethereum" },
  { address: "0x1c4b70a3968436b9a0a9cf5205c787eb81bb558c", exchange: "Gate.io", label: "Gate.io Hot Wallet 2", chain: "ethereum" },

  // Gemini
  { address: "0xd24400ae8bfebb18ca49be86258a3c749cf46853", exchange: "Gemini", label: "Gemini Hot Wallet", chain: "ethereum" },
  { address: "0x6fc82a5fe25a5cdb58bc74600a40a69c065263f8", exchange: "Gemini", label: "Gemini Hot Wallet 2", chain: "ethereum" },
  { address: "0x07ee55aa48bb72dcc6e9d78256648910de513eca", exchange: "Gemini", label: "Gemini Cold Wallet", chain: "ethereum" },

  // Bitfinex
  { address: "0x1151314c646ce4e0efd76d1af4760ae66a9fe30f", exchange: "Bitfinex", label: "Bitfinex Hot Wallet", chain: "ethereum" },
  { address: "0x742d35cc6634c0532925a3b844bc9e7595f2bd3e", exchange: "Bitfinex", label: "Bitfinex Hot Wallet 2", chain: "ethereum" },
  { address: "0x876eabf441b2ee5b5b0554fd502a8e0600950cfa", exchange: "Bitfinex", label: "Bitfinex Cold Wallet", chain: "ethereum" },

  // Huobi / HTX
  { address: "0xab5c66752a9e8167967685f1450532fb96d5d24f", exchange: "HTX (Huobi)", label: "HTX Hot Wallet", chain: "ethereum" },
  { address: "0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 2", chain: "ethereum" },
  { address: "0xe93381fb4c4f14bda253907b18fad305d799cee7", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 3", chain: "ethereum" },
  { address: "0x18709e89bd403f470088abdacebe86cc60dda12e", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 4", chain: "ethereum" },

  // Crypto.com
  { address: "0x6262998ced04146fa42253a5c0af90ca02dfd2a3", exchange: "Crypto.com", label: "Crypto.com Hot Wallet", chain: "ethereum" },
  { address: "0x46340b20830761efd32832a74d7169b29feb9758", exchange: "Crypto.com", label: "Crypto.com Cold Wallet", chain: "ethereum" },

  // Upbit
  { address: "0x390de26d772d2e2005c6d1d24afc902bae37a4bb", exchange: "Upbit", label: "Upbit Hot Wallet", chain: "ethereum" },
  { address: "0xba826fec90cefdf6706858e5fbafcb27a290fbe5", exchange: "Upbit", label: "Upbit Cold Wallet", chain: "ethereum" },

  // Bitget
  { address: "0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689", exchange: "Bitget", label: "Bitget Hot Wallet", chain: "ethereum" },
  { address: "0x5bdf85216ec1e38d6458c870992a69e38e03f7ef", exchange: "Bitget", label: "Bitget Hot Wallet 2", chain: "ethereum" },

  // MEXC
  { address: "0x75e89d5979e4f6fba9f97c104c2f0afb3f1dcb88", exchange: "MEXC", label: "MEXC Hot Wallet", chain: "ethereum" },

  // Bitstamp
  { address: "0x00bdb5699745f5b860228c8f939abf1b9ae374ed", exchange: "Bitstamp", label: "Bitstamp Hot Wallet", chain: "ethereum" },

  // Robinhood
  { address: "0x40b38765696e3d5d8d9d834d8aad4bb6e418e489", exchange: "Robinhood", label: "Robinhood Hot Wallet", chain: "ethereum" },
];

// ═══════════════════════════════════════════════════════════════
//  SOLANA addresses
// ═══════════════════════════════════════════════════════════════

const SOLANA_CEX: CexAddress[] = [
  // Binance
  { address: "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9", exchange: "Binance", label: "Binance Hot Wallet", chain: "solana" },
  { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", exchange: "Binance", label: "Binance Hot Wallet 2", chain: "solana" },
  { address: "2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S", exchange: "Binance", label: "Binance Hot Wallet 3", chain: "solana" },

  // Coinbase
  { address: "H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS", exchange: "Coinbase", label: "Coinbase Hot Wallet", chain: "solana" },
  { address: "GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE", exchange: "Coinbase", label: "Coinbase Hot Wallet 2", chain: "solana" },
  { address: "2AQdpHJ2JpcEgPiATUXjQxA8QmafFegfQwSLWSprPicm", exchange: "Coinbase", label: "Coinbase Prime", chain: "solana" },

  // Kraken
  { address: "FWznbcNXWQuHTawe9RxvQ2LdCENssh12dsznf4RiWB5e", exchange: "Kraken", label: "Kraken Hot Wallet", chain: "solana" },

  // OKX
  { address: "5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD", exchange: "OKX", label: "OKX Hot Wallet", chain: "solana" },

  // Bybit
  { address: "AC5RDfQFmDS1deWZos921JfqscXdByf6BKHAbXh2LBvF", exchange: "Bybit", label: "Bybit Hot Wallet", chain: "solana" },

  // KuCoin
  { address: "BmFdpraQhkiDQE6SnfG5PVddTtR3N6GFwpiSBczNE1Mb", exchange: "KuCoin", label: "KuCoin Hot Wallet", chain: "solana" },

  // Gate.io
  { address: "u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w", exchange: "Gate.io", label: "Gate.io Hot Wallet", chain: "solana" },

  // Huobi/HTX
  { address: "88xTWZMeKfiTgbfEmPLdsUCQcZinwUfk25MGANFKX4MG", exchange: "HTX (Huobi)", label: "HTX Hot Wallet", chain: "solana" },

  // Crypto.com
  { address: "AobVSwdW9BbpMdJvTqeCN4hPAmh4rHm7vwLnQ5ATbo3v", exchange: "Crypto.com", label: "Crypto.com Hot Wallet", chain: "solana" },

  // Bitget
  { address: "A77HErFpMNFnRnPBJxr78kRYiHbWMEwvRJ9pLfDBqVP5", exchange: "Bitget", label: "Bitget Hot Wallet", chain: "solana" },

  // MEXC
  { address: "ASTyfSima4LLAdDgoFGkgqoKowG1LZFDr9fAQrg7iaJZ", exchange: "MEXC", label: "MEXC Hot Wallet", chain: "solana" },
];

// ═══════════════════════════════════════════════════════════════
//  BITCOIN addresses
// ═══════════════════════════════════════════════════════════════

const BTC_CEX: CexAddress[] = [
  // Binance
  { address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo", exchange: "Binance", label: "Binance Cold Wallet", chain: "bitcoin" },
  { address: "3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb", exchange: "Binance", label: "Binance Hot Wallet", chain: "bitcoin" },
  { address: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h", exchange: "Binance", label: "Binance Hot Wallet 2", chain: "bitcoin" },
  { address: "1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s", exchange: "Binance", label: "Binance Cold Wallet 2", chain: "bitcoin" },
  { address: "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97", exchange: "Binance", label: "Binance Cold Wallet 3", chain: "bitcoin" },

  // Coinbase
  { address: "3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS", exchange: "Coinbase", label: "Coinbase Cold Wallet", chain: "bitcoin" },
  { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", exchange: "Coinbase", label: "Coinbase Hot Wallet", chain: "bitcoin" },
  { address: "3FHNBLobJnbCTFTVakh5TXnC6XfQ38Majo", exchange: "Coinbase", label: "Coinbase Prime", chain: "bitcoin" },

  // Kraken
  { address: "3AfP7PKdGBap7CUQ2vdqnhFGBCZeMfNqEm", exchange: "Kraken", label: "Kraken Cold Wallet", chain: "bitcoin" },
  { address: "bc1qnpzzqjzet8gd5gl8l6gzhuc4s9gg8gnx00ynsl", exchange: "Kraken", label: "Kraken Hot Wallet", chain: "bitcoin" },

  // Bitfinex
  { address: "3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r", exchange: "Bitfinex", label: "Bitfinex Cold Wallet", chain: "bitcoin" },
  { address: "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97", exchange: "Bitfinex", label: "Bitfinex Cold Wallet 2", chain: "bitcoin" },

  // OKX
  { address: "3LtzAKzwNq8FPLqRgcwBkp5DvSBt8g6MUB", exchange: "OKX", label: "OKX Hot Wallet", chain: "bitcoin" },

  // Bybit
  { address: "bc1qjysjfd9t9aspttpjqzv68k0ydpe7pvyd5v6gqj", exchange: "Bybit", label: "Bybit Hot Wallet", chain: "bitcoin" },

  // Gemini
  { address: "3FWgagjt6CXRG5GNjsJTFE8RKiGnjJuEW4", exchange: "Gemini", label: "Gemini Cold Wallet", chain: "bitcoin" },

  // Bitstamp
  { address: "3P3QsMVK89JBNqZQv5zMAKG8FK3kJM4rjt", exchange: "Bitstamp", label: "Bitstamp Hot Wallet", chain: "bitcoin" },

  // Robinhood
  { address: "bc1q7t9fxfaakmtk8pj7pzczylmr5enrk0v5v0gghg", exchange: "Robinhood", label: "Robinhood Cold Wallet", chain: "bitcoin" },
];

// ═══════════════════════════════════════════════════════════════
//  TRON (TRX) addresses
// ═══════════════════════════════════════════════════════════════

const TRON_CEX: CexAddress[] = [
  // Binance
  { address: "TDqSquXBgUCLYvYC4XZgrprLK589dkhSCf", exchange: "Binance", label: "Binance Hot Wallet", chain: "tron" },
  { address: "TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb", exchange: "Binance", label: "Binance Hot Wallet 2", chain: "tron" },
  { address: "TNaRAoLUyYEV2uF7GUrzSjRQTU8v5ZJ5VR", exchange: "Binance", label: "Binance Hot Wallet 3", chain: "tron" },

  // OKX
  { address: "TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW", exchange: "OKX", label: "OKX Hot Wallet", chain: "tron" },
  { address: "TAzsQ9Gx8eqFNFSKbeXrbi45CuVPHzA8wr", exchange: "OKX", label: "OKX Hot Wallet 2", chain: "tron" },

  // Bybit
  { address: "TQooBH9VoWoEFPJwHFwmXD4RX5jxiNFnAM", exchange: "Bybit", label: "Bybit Hot Wallet", chain: "tron" },

  // KuCoin
  { address: "TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4", exchange: "KuCoin", label: "KuCoin Hot Wallet", chain: "tron" },

  // Huobi/HTX
  { address: "TRXYZsLEaGaDeKx7h41MZaWqfBk9EVdfzs", exchange: "HTX (Huobi)", label: "HTX Hot Wallet", chain: "tron" },
  { address: "TNVWHrqLGirmnmbNdPCmXNTBXTJn1CJWKK", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 2", chain: "tron" },

  // Gate.io
  { address: "TDJkiELABYjRVrmuFJoGqv9YPCnUqBBFqr", exchange: "Gate.io", label: "Gate.io Hot Wallet", chain: "tron" },

  // Crypto.com
  { address: "TCczwqYMYrjMfQLznrCVYrJQn9J7Z1BJdK", exchange: "Crypto.com", label: "Crypto.com Hot Wallet", chain: "tron" },

  // Bitget
  { address: "TXNaHB3WFrmfSahZDKRN9qQFhGcrjWWfu3", exchange: "Bitget", label: "Bitget Hot Wallet", chain: "tron" },

  // MEXC
  { address: "TFyrmB3UsqF4VhVyqfVhAuxGAa25APWBGQ", exchange: "MEXC", label: "MEXC Hot Wallet", chain: "tron" },

  // Poloniex
  { address: "TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS", exchange: "Poloniex", label: "Poloniex Hot Wallet", chain: "tron" },

  // Sun.io / JustLend (semi-CEX)
  { address: "TKcEU8ekq2ZoFzLSGFYCUY6aocJBX9X31b", exchange: "Poloniex", label: "Poloniex Hot Wallet 2", chain: "tron" },
];

// ═══════════════════════════════════════════════════════════════
//  Combined lookup
// ═══════════════════════════════════════════════════════════════

const ALL_CEX_ADDRESSES = [...EVM_CEX, ...SOLANA_CEX, ...BTC_CEX, ...TRON_CEX];

// Build lookup maps for O(1) matching
const evmMap = new Map<string, CexAddress>();
EVM_CEX.forEach((a) => evmMap.set(a.address.toLowerCase(), a));

const solanaMap = new Map<string, CexAddress>();
SOLANA_CEX.forEach((a) => solanaMap.set(a.address, a));

const btcMap = new Map<string, CexAddress>();
BTC_CEX.forEach((a) => btcMap.set(a.address, a));

const tronMap = new Map<string, CexAddress>();
TRON_CEX.forEach((a) => tronMap.set(a.address, a));

export function lookupCex(address: string, chain: Chain): CexAddress | null {
  switch (chain) {
    case "ethereum":
      return evmMap.get(address.toLowerCase()) ?? null;
    case "solana":
      return solanaMap.get(address) ?? null;
    case "bitcoin":
      return btcMap.get(address) ?? null;
    case "tron":
      return tronMap.get(address) ?? null;
  }
}

export function getAllCexForChain(chain: Chain): CexAddress[] {
  return ALL_CEX_ADDRESSES.filter((a) => a.chain === chain);
}

export function getExchangeList(): string[] {
  return [...new Set(ALL_CEX_ADDRESSES.map((a) => a.exchange))].sort();
}

export const CHAIN_STATS = {
  ethereum: { count: EVM_CEX.length, exchanges: [...new Set(EVM_CEX.map((a) => a.exchange))].length },
  solana: { count: SOLANA_CEX.length, exchanges: [...new Set(SOLANA_CEX.map((a) => a.exchange))].length },
  bitcoin: { count: BTC_CEX.length, exchanges: [...new Set(BTC_CEX.map((a) => a.exchange))].length },
  tron: { count: TRON_CEX.length, exchanges: [...new Set(TRON_CEX.map((a) => a.exchange))].length },
  total: ALL_CEX_ADDRESSES.length,
};
