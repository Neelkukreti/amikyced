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

  // Bybit (additional from PoR)
  { address: "0xe28b3b32b6c345a34ff64674606124dd5aceca30", exchange: "Bybit", label: "Bybit Hot Wallet 2", chain: "ethereum" },
  { address: "0xd9d93951896b4ef97d251334ef2a0e39f6f6d7d7", exchange: "Bybit", label: "Bybit Hot Wallet 3", chain: "ethereum" },
  { address: "0xa7a93fd0a276fc1c0197a5b5623ed117786bad7d", exchange: "Bybit", label: "Bybit Hot Wallet 4", chain: "ethereum" },

  // Coinbase (additional)
  { address: "0xa090e606e30bd747d4e6245a1517ebe430f0057e", exchange: "Coinbase", label: "Coinbase Hot Wallet 8", chain: "ethereum" },

  // Kraken (additional)
  { address: "0xe853c56864a2ebe4576a807d26fdc4a0ada51919", exchange: "Kraken", label: "Kraken Hot Wallet 5", chain: "ethereum" },
  { address: "0xda9dfa130df4de4673b89022ee50ff26f6ea73cf", exchange: "Kraken", label: "Kraken Hot Wallet 6", chain: "ethereum" },

  // OKX (additional)
  { address: "0x98ec059dc3adfbdd63429227d09be80455b2d0d3", exchange: "OKX", label: "OKX Hot Wallet 5", chain: "ethereum" },
  { address: "0x6fb624b48f9a4c4e114a8084b0bad244e8bf464e", exchange: "OKX", label: "OKX Hot Wallet 6", chain: "ethereum" },

  // HTX (additional)
  { address: "0x46705dfff24256421a05d056c29e81bdc09723b8", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 5", chain: "ethereum" },
  { address: "0x5c985e89dde482efe97ea9f1950ad149eb73829b", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 6", chain: "ethereum" },
  { address: "0x1062a747393198f70f71ec65a582423dba7e5ab3", exchange: "HTX (Huobi)", label: "HTX Cold Wallet", chain: "ethereum" },

  // Crypto.com (additional)
  { address: "0xcffad3200574698b78f32232aa9d63eabd290703", exchange: "Crypto.com", label: "Crypto.com Hot Wallet 2", chain: "ethereum" },
  { address: "0x72a53cdbbcc1b9efa39c834a540550e23463aacb", exchange: "Crypto.com", label: "Crypto.com Hot Wallet 3", chain: "ethereum" },

  // Bitfinex (additional)
  { address: "0x4fdd5eb2fb260149a3903859043e962ab89d8ed4", exchange: "Bitfinex", label: "Bitfinex Hot Wallet 3", chain: "ethereum" },

  // Upbit (additional)
  { address: "0x46f3b68e80b33612100bc5fc22c926acf2aacab0", exchange: "Upbit", label: "Upbit Hot Wallet 2", chain: "ethereum" },
  { address: "0x1a3c5be4d6bf02257c462ee7964dc52d3f7e9cf7", exchange: "Upbit", label: "Upbit Hot Wallet 3", chain: "ethereum" },

  // Bitget (additional)
  { address: "0x1ae3739c0f04f75d0b20a5b2216e3859fdc77d49", exchange: "Bitget", label: "Bitget Hot Wallet 3", chain: "ethereum" },

  // MEXC (additional)
  { address: "0x4fbb0b4cd8f960ac3428194f1c94c805d5b35836", exchange: "MEXC", label: "MEXC Hot Wallet 2", chain: "ethereum" },

  // BitMart
  { address: "0x68b22215ff74e3606bd5e6c1de8c2d68bc0f3c41", exchange: "BitMart", label: "BitMart Hot Wallet", chain: "ethereum" },
  { address: "0xe79eef9b9388a4ff70ed7ec5bccd5b928ebb8bd1", exchange: "BitMart", label: "BitMart Hot Wallet 2", chain: "ethereum" },

  // Bithumb
  { address: "0xd273ce0808380ccbf1ffc0aee8dd52ebb8e9eeec", exchange: "Bithumb", label: "Bithumb Hot Wallet", chain: "ethereum" },
  { address: "0x88d34944cf554e9cccf4a24292d891f620e9c94f", exchange: "Bithumb", label: "Bithumb Hot Wallet 2", chain: "ethereum" },

  // Deribit
  { address: "0x77ab999d1e9f152671b3c0a2a6a18c22fe5ce12b", exchange: "Deribit", label: "Deribit Hot Wallet", chain: "ethereum" },

  // WazirX
  { address: "0x27fd43babfbe83a81d14665b1a6fb8030a60c9b4", exchange: "WazirX", label: "WazirX Hot Wallet", chain: "ethereum" },

  // Phemex
  { address: "0xfbf2173154f7625713be22e51e9fb3d82e6e244e", exchange: "Phemex", label: "Phemex Hot Wallet", chain: "ethereum" },

  // WhiteBIT
  { address: "0x39f6a6c85d39d5aba4e928f1b6c8cc71b82e8bcf", exchange: "WhiteBIT", label: "WhiteBIT Hot Wallet", chain: "ethereum" },

  // Bitrue
  { address: "0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21", exchange: "Bitrue", label: "Bitrue Hot Wallet", chain: "ethereum" },

  // LBank
  { address: "0x0860fba3a0dbfeb3a0bf3805ef8e6e66f18cc3e4", exchange: "LBank", label: "LBank Hot Wallet", chain: "ethereum" },

  // CoinEx
  { address: "0xb9ee1e551f538a464e8f8c41e9904498505b49b0", exchange: "CoinEx", label: "CoinEx Hot Wallet", chain: "ethereum" },

  // BingX
  { address: "0xf7237c230de3aae99082c6c1d718e4fab03e6397", exchange: "BingX", label: "BingX Hot Wallet", chain: "ethereum" },

  // AscendEX
  { address: "0x4b1a99467a284cc690e3237bc69105956816f762", exchange: "AscendEX", label: "AscendEX Hot Wallet", chain: "ethereum" },
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

  // Bybit (additional)
  { address: "BYvMHhBkVqnGGUJCrDFhSxDPMjbKEddAb4PQfaBghiRP", exchange: "Bybit", label: "Bybit Hot Wallet 2", chain: "solana" },

  // Bitget (additional)
  { address: "CGpAUQp12yDsVwbSF5yeSzCi1HjVhDhASZzmkqnf8SJHG", exchange: "Bitget", label: "Bitget Hot Wallet 2", chain: "solana" },

  // WhiteBIT
  { address: "6vfKjMHa3Bv2vGVCr8LRCC3Fv3sFnQF8Z8y9kSTJEmpw", exchange: "WhiteBIT", label: "WhiteBIT Hot Wallet", chain: "solana" },

  // BitMart
  { address: "5M5kNYpzCb4JGJKk8dC3YaFRzFW1JGMRoV2X3LXDX71n", exchange: "BitMart", label: "BitMart Hot Wallet", chain: "solana" },

  // BingX
  { address: "5qpRPxz2f1k3xQeMuWMdR3F9cKn6pZ7pT4KeG5mPG2SX", exchange: "BingX", label: "BingX Hot Wallet", chain: "solana" },
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

  // Binance (additional)
  { address: "3JZq4atUahhuA9rLhXLMhhTo133J9rF97j", exchange: "Binance", label: "Binance Hot Wallet 3", chain: "bitcoin" },
  { address: "bc1qnkv8m07alowyu4y5rynql88r5kaqhhk2l3u5u4", exchange: "Binance", label: "Binance Hot Wallet 4", chain: "bitcoin" },

  // Coinbase (additional)
  { address: "3CwByky29sAyEYSnw9TFqJPiGjqGeifKPU", exchange: "Coinbase", label: "Coinbase Cold Wallet 2", chain: "bitcoin" },

  // Kraken (additional)
  { address: "bc1q5shngj24323nsrmxv99st02na6srekfctt30ch", exchange: "Kraken", label: "Kraken Cold Wallet 2", chain: "bitcoin" },

  // OKX (additional)
  { address: "bc1q2s3rjwvam9dt2ftt4sqxqjf3twav0gdx0k0q2etjz847darxyl8qh80gkv", exchange: "OKX", label: "OKX Cold Wallet", chain: "bitcoin" },

  // Bybit (additional from PoR)
  { address: "bc1qm6q4v3y7gksmhevj6pcp2u7h8g9hcg7l7ynxlp", exchange: "Bybit", label: "Bybit Hot Wallet 2", chain: "bitcoin" },

  // Gemini (additional)
  { address: "bc1q7sefr700fvr3c4t5yp2ftsjuenfrfcvqemc66r", exchange: "Gemini", label: "Gemini Hot Wallet", chain: "bitcoin" },

  // HTX (additional)
  { address: "3GKuBAVFijkv6NmTJb1WaQSsj5R35FHRK5", exchange: "HTX (Huobi)", label: "HTX Hot Wallet", chain: "bitcoin" },

  // Crypto.com (additional)
  { address: "bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9", exchange: "Crypto.com", label: "Crypto.com Hot Wallet", chain: "bitcoin" },

  // Deribit
  { address: "1Dq9GXsraAGnQ1g1PdvzJv2poo5jMDfmab", exchange: "Deribit", label: "Deribit Hot Wallet", chain: "bitcoin" },

  // BitMart
  { address: "3Cbq7aT1tY8kMxWLbitaG7yT6bPbKChq64", exchange: "BitMart", label: "BitMart Hot Wallet", chain: "bitcoin" },

  // Bithumb
  { address: "3FHremcoNTy7LgCc9R3M3RGdN2VhZduRaJ", exchange: "Bithumb", label: "Bithumb Hot Wallet", chain: "bitcoin" },
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

  // Binance (additional)
  { address: "TV6MuMXfmLbBqPZvBHdwFsDnQeVfnmiuSi", exchange: "Binance", label: "Binance Hot Wallet 4", chain: "tron" },
  { address: "TJDENsfBJs4RFETt1X1W8wMDc8M5XnJhCe", exchange: "Binance", label: "Binance Cold Wallet", chain: "tron" },

  // OKX (additional)
  { address: "TFVBaA1jSSBBsXQGLy7pUvLL6ML3UNaWyK", exchange: "OKX", label: "OKX Hot Wallet 3", chain: "tron" },

  // Bybit (additional)
  { address: "TLbBXA7VNQVVT49FEU6t7x57gFRxJHbJXp", exchange: "Bybit", label: "Bybit Hot Wallet 2", chain: "tron" },

  // HTX (additional)
  { address: "THGb1gvVW4HXFKz5Hd7YfHfq3QxUbvn3bi", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 3", chain: "tron" },

  // Bitfinex
  { address: "TWFcifhBJvGe7jPyTtxjRu9BFgjLdKSRix", exchange: "Bitfinex", label: "Bitfinex Hot Wallet", chain: "tron" },

  // Upbit
  { address: "TYkXYiB79Khy9yHbbDnQi1zsKeSP4qJBhj", exchange: "Upbit", label: "Upbit Hot Wallet", chain: "tron" },

  // BitMart
  { address: "THaoP1mK1H1rMtBX1fVAsuPPPyGLJj4fSN", exchange: "BitMart", label: "BitMart Hot Wallet", chain: "tron" },

  // Bithumb
  { address: "TWBLqk3SZaKFoCoSWJ1GFRaxwHFtxYabLA", exchange: "Bithumb", label: "Bithumb Hot Wallet", chain: "tron" },

  // WazirX
  { address: "TMXqK6haoFgS6NBzKB9nGE4bTxUq4Fhcgy", exchange: "WazirX", label: "WazirX Hot Wallet", chain: "tron" },

  // LBank
  { address: "TW8RNzFmjPNnzXSbhMGLF1sPfATBRjNNHa", exchange: "LBank", label: "LBank Hot Wallet", chain: "tron" },

  // CoinEx
  { address: "TBiaE3pMHsZfFgTfN3kS9iuY1NJFB8cSC9", exchange: "CoinEx", label: "CoinEx Hot Wallet", chain: "tron" },
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
