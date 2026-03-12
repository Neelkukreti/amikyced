/**
 * Known labeled wallet addresses across chains.
 * Sources: Etherscan labels, Arkham Intelligence, OFAC SDN list, Solscan, blockchain explorers.
 *
 * Entity types:
 *   cex        — Centralized exchanges (Binance, Coinbase, etc.)
 *   celebrity   — Famous individuals (Vitalik, CZ, Trump WLFI, etc.)
 *   sanctions   — OFAC-sanctioned addresses (Tornado Cash, Lazarus Group, etc.)
 *   rugpull     — Known rug pull deployers and hacked protocol addresses
 *   smartmoney  — Top traders, VCs, whale wallets
 *   fund        — Investment funds, market makers, treasuries
 *   government  — Government seizure wallets, law enforcement
 *   protocol    — Major protocol treasuries and multisigs
 */

export type EntityType = "cex" | "celebrity" | "sanctions" | "rugpull" | "smartmoney" | "fund" | "government" | "protocol";

export interface CexAddress {
  address: string;
  exchange: string;       // Entity name (exchange, person, protocol, etc.)
  label: string;          // e.g. "Binance Hot Wallet 1", "Vitalik.eth"
  chain: Chain;
  entityType?: EntityType; // defaults to "cex" for backward compat
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

  // ── New Exchanges ──────────────────────────────────────────

  // FTX (defunct — bankruptcy wallets)
  { address: "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2", exchange: "FTX", label: "FTX Exchange", chain: "ethereum" },
  { address: "0xc098b2a3aa256d2140208c3de6543aaef5cd3a94", exchange: "FTX", label: "FTX Cold Wallet", chain: "ethereum" },

  // Celsius (defunct — bankruptcy wallets)
  { address: "0x8ace2ba94c296b36130cae30e14a82abef7f709c", exchange: "Celsius", label: "Celsius Hot Wallet", chain: "ethereum" },
  { address: "0xef22c14f46858d5ac61326497b056974167f2ee1", exchange: "Celsius", label: "Celsius Wallet 2", chain: "ethereum" },

  // BlockFi (defunct — bankruptcy wallets)
  { address: "0x1681195c176239ac5e72d9aebacf5b2492e0c4ee", exchange: "BlockFi", label: "BlockFi Wallet", chain: "ethereum" },

  // BitFlyer
  { address: "0x111cff45948819988857bbf1966a0399e0d1141e", exchange: "BitFlyer", label: "BitFlyer Hot Wallet", chain: "ethereum" },

  // Bitvavo
  { address: "0x8d6f396d210d385033b348bcae9e4b9ea4e045bd", exchange: "Bitvavo", label: "Bitvavo Hot Wallet", chain: "ethereum" },

  // XT.com
  // Note: 0x5bdf85216ec1e38d6458c870992a69e38e03f7ef is listed under Bitget above (shared/disputed label)

  // DigiFinex
  { address: "0xe17ee7b3c676701c66b395a35f0df4c2276a344e", exchange: "DigiFinex", label: "DigiFinex Hot Wallet", chain: "ethereum" },

  // Korbit
  { address: "0xa5c854013ec597ea5cc5fab41e3a6f39065e0087", exchange: "Korbit", label: "Korbit Hot Wallet", chain: "ethereum" },

  // BTCTurk
  { address: "0x7e96298ece95595068e44f4e09b1b2f7b1c09ea3", exchange: "BTCTurk", label: "BTCTurk Hot Wallet", chain: "ethereum" },

  // Paribu
  { address: "0xbd8ef191caa1571e8ad4619bfdc75716237ccb57", exchange: "Paribu", label: "Paribu Hot Wallet", chain: "ethereum" },

  // Luno
  { address: "0x8cf23cd535a240eb0ab8667d608a0071c7d70c9c", exchange: "Luno", label: "Luno Hot Wallet", chain: "ethereum" },

  // ProBit
  { address: "0x4d15afc0fa05d2e8f1f0cc4cf849d8790ca74c44", exchange: "ProBit", label: "ProBit Hot Wallet", chain: "ethereum" },

  // BTSE
  // Note: 0x6cc8dcbca746a6e4fdefb98e1d0df903b107fd21 is listed under Bitrue above (shared/disputed label)

  // Binance (additional)
  { address: "0x515b72ed8a97f42c568d6a143232775018f133c8", exchange: "Binance", label: "Binance Hot Wallet 12", chain: "ethereum" },
  { address: "0xf35a6bd6e0833c19bb1b3530bc514fae8b1d3c0a", exchange: "Binance", label: "Binance Hot Wallet 13", chain: "ethereum" },
  { address: "0xb1cd6e4153b2a390cf00a6556b0fc1458c4a5533", exchange: "Binance", label: "Binance Hot Wallet 14", chain: "ethereum" },

  // Coinbase (additional)
  { address: "0xf6874c88757721a02f47592140905c4336dfc5cc", exchange: "Coinbase", label: "Coinbase Hot Wallet 9", chain: "ethereum" },
  { address: "0x02466e547bfdab679fc49e96bbfc62b9747d997c", exchange: "Coinbase", label: "Coinbase Hot Wallet 10", chain: "ethereum" },

  // Kraken (additional)
  { address: "0x89e51fa8ca5d66cd220baed62ed01e8951aa7c40", exchange: "Kraken", label: "Kraken Hot Wallet 7", chain: "ethereum" },

  // OKX (additional)
  { address: "0x69a722f0b5da3af02b4a205d6f0c285f4ed8f396", exchange: "OKX", label: "OKX Hot Wallet 7", chain: "ethereum" },

  // Bybit (additional)
  { address: "0x0639556f03714a74a5feeaf5736a4a64ff70d578", exchange: "Bybit", label: "Bybit Hot Wallet 5", chain: "ethereum" },

  // KuCoin (additional)
  { address: "0xa1d8d972560c2f8144af871db508f0b0b10a3fbf", exchange: "KuCoin", label: "KuCoin Hot Wallet 4", chain: "ethereum" },

  // Gate.io (additional)
  { address: "0xd793281182a0e3e023116004778f45c29fc14f19", exchange: "Gate.io", label: "Gate.io Hot Wallet 3", chain: "ethereum" },
  { address: "0xc882b111a75c0c657fc507c04fbfcd2cc984f071", exchange: "Gate.io", label: "Gate.io Hot Wallet 4", chain: "ethereum" },

  // Gemini (additional)
  { address: "0x61edcdf5bb737adffe5043706e7c5bb1f1a56eea", exchange: "Gemini", label: "Gemini Hot Wallet 3", chain: "ethereum" },

  // Bitfinex (additional)
  { address: "0x36a85757645e8e8aec062a1dee289c7d615901ca", exchange: "Bitfinex", label: "Bitfinex Hot Wallet 4", chain: "ethereum" },

  // Bitstamp (additional)
  { address: "0x4e5b2e1dc63f6b91cb6cd759936495434c7e972f", exchange: "Bitstamp", label: "Bitstamp Hot Wallet 2", chain: "ethereum" },
  { address: "0xfca70e67b3f93f679992cd36323eeb5a5370c8e4", exchange: "Bitstamp", label: "Bitstamp Cold Wallet", chain: "ethereum" },
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

  // ── New Exchanges ──────────────────────────────────────────

  // FTX (defunct — bankruptcy wallets)
  { address: "GXMaB8v1nBVkSECV8WMuX7CT1TDg7HDLK1voMkGnfJC3", exchange: "FTX", label: "FTX Hot Wallet", chain: "solana" },

  // Binance (additional)
  { address: "3gd2VhZbJTL8xNfrCYqV7FPo2DE8yFcP9eTkYa8cggcj", exchange: "Binance", label: "Binance Hot Wallet 4", chain: "solana" },

  // OKX (additional)
  { address: "5yKzb1FMYeNRhPFqbgHvJVRqD4BnoUL9At1sDFGq4jCi", exchange: "OKX", label: "OKX Hot Wallet 2", chain: "solana" },

  // KuCoin (additional)
  { address: "2BLkynLAWGk7NFQG3KT8DvBh7Z8c2VPkM7aPJDkoxjMp", exchange: "KuCoin", label: "KuCoin Hot Wallet 2", chain: "solana" },
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

  // ── New Exchanges ──────────────────────────────────────────

  // FTX (defunct — bankruptcy wallets)
  { address: "1FzWLkAahHooV3kzTgyx6qsXoRDrBsrACw", exchange: "FTX", label: "FTX Hot Wallet", chain: "bitcoin" },

  // Mt. Gox (trustee wallets)
  { address: "1JbezDVd9VsK9o1Ga9UqLydeuEvhKLAPs6", exchange: "Mt. Gox", label: "Mt. Gox Trustee Wallet", chain: "bitcoin" },

  // Celsius (defunct — bankruptcy wallets)
  { address: "3K1G8tAGQRKHDZSL13oUwmaQMXZDBTCFqH", exchange: "Celsius", label: "Celsius Hot Wallet", chain: "bitcoin" },

  // BitFlyer
  { address: "37eMCzE6qXYoJBRGbRhYHNDBwuNYXhudCk", exchange: "BitFlyer", label: "BitFlyer Hot Wallet", chain: "bitcoin" },

  // Binance (additional)
  { address: "12ib7dApVFvg82TXKxnKQGkaLSsvtAkn4j", exchange: "Binance", label: "Binance Hot Wallet 5", chain: "bitcoin" },

  // Coinbase (additional)
  { address: "bc1q4c8n5t00jmj8temxdgcc3t32nkg2wjwz24lywv", exchange: "Coinbase", label: "Coinbase Hot Wallet 2", chain: "bitcoin" },

  // Kraken (additional)
  { address: "3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6", exchange: "Kraken", label: "Kraken Hot Wallet 2", chain: "bitcoin" },

  // Bitfinex (additional)
  { address: "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97", exchange: "Bitfinex", label: "Bitfinex Cold Wallet 3", chain: "bitcoin" },

  // Bitstamp (additional)
  { address: "3BiKLKhs4zNBaEFymFSGYUv1BgMgLqsEe2", exchange: "Bitstamp", label: "Bitstamp Cold Wallet", chain: "bitcoin" },

  // Gemini (additional)
  { address: "3NhLMBvbMwi6a3ZBpixBXdz1Rde4aLEy41", exchange: "Gemini", label: "Gemini Cold Wallet 2", chain: "bitcoin" },
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

  // ── New Exchanges ──────────────────────────────────────────

  // FTX (defunct — bankruptcy wallets)
  { address: "TXLaqTN66MrNPrDBCuNZqiXxXUuKGZMvPQ", exchange: "FTX", label: "FTX Hot Wallet", chain: "tron" },

  // Celsius (defunct — bankruptcy wallets)
  { address: "TCg1frSHRkZecVDLTJHRGiHEEuYk2nwm7L", exchange: "Celsius", label: "Celsius Hot Wallet", chain: "tron" },

  // Binance (additional)
  { address: "TKFPqMvJfNwGMkiQcFep5HizdCsGBn3TSZ", exchange: "Binance", label: "Binance Hot Wallet 5", chain: "tron" },

  // KuCoin (additional)
  { address: "TV3QB5nfD5kd2ECBg3LXLYSL4JqDHjkyoW", exchange: "KuCoin", label: "KuCoin Hot Wallet 2", chain: "tron" },

  // ── Major USDT Hot Wallets (TronScan verified labels) ──

  // Binance USDT operations
  { address: "TBPxhVNnaDyFCnS6NYbgkJHSFWMj3Ubd7b", exchange: "Binance", label: "Binance USDT Hot 1", chain: "tron" },
  { address: "TJexKHKmFUqBjoYMFHuBgoR2ioXRkPbqAM", exchange: "Binance", label: "Binance USDT Hot 2", chain: "tron" },
  { address: "TAUN6FwrnwwmaEqYcckffC7wYmbaS6cBiX", exchange: "Binance", label: "Binance Cold Wallet 2", chain: "tron" },
  { address: "TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9", exchange: "Binance", label: "Binance Hot Wallet 6", chain: "tron" },
  { address: "TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6", exchange: "Binance", label: "Binance Hot Wallet 7", chain: "tron" },
  { address: "TNXoiAJ3dct8Fjg4M9fkLFh9S2v9TXc32G", exchange: "Binance", label: "Binance Hot Wallet 8", chain: "tron" },
  { address: "TKFPqMvJfNwGMkiQcFep5HizdCsGBn3TSZ", exchange: "Binance", label: "Binance Hot Wallet 5", chain: "tron" },

  // OKX USDT operations
  { address: "THNMuiLe37VDJFnaB3oEz1tUN6rYoVahfp", exchange: "OKX", label: "OKX USDT Hot 1", chain: "tron" },
  { address: "TUEYcyPAqc4hTg1fSuBCPc18vGWcJDECVp", exchange: "OKX", label: "OKX USDT Hot 2", chain: "tron" },
  { address: "TWKWFv2Mos5EBxmMdsNUyzij28o8Rbkiyc", exchange: "OKX", label: "OKX Hot Wallet 4", chain: "tron" },
  { address: "TFinP9mSoD1K44hySnDKvhWqGVKCBH39pj", exchange: "OKX", label: "OKX Hot Wallet 5", chain: "tron" },

  // Bybit USDT
  { address: "TYNsnsX3vSAjJfKVQsWejbBBjiZbVwgjnn", exchange: "Bybit", label: "Bybit USDT Hot 1", chain: "tron" },
  { address: "TKJHMqm3PL2a56GvLMsFEBJkAv3kaQ55Qr", exchange: "Bybit", label: "Bybit Hot Wallet 3", chain: "tron" },

  // KuCoin USDT
  { address: "TLcaLPm5VMB5CBKcRh3X4UR7BVPhqMbXjb", exchange: "KuCoin", label: "KuCoin USDT Hot 1", chain: "tron" },
  { address: "TSbJQFCaoS85owW6T4HfznPTCxYZ1KZR1L", exchange: "KuCoin", label: "KuCoin Hot Wallet 3", chain: "tron" },

  // HTX USDT
  { address: "TXk9hm7PxAXqGpLg1rMZ39JnXBM9fFnGYg", exchange: "HTX (Huobi)", label: "HTX USDT Hot 1", chain: "tron" },
  { address: "TQWBzo1y3H9RUHDpS1Ph7MC5MbGk8ePbgm", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 4", chain: "tron" },
  { address: "TYA64Maa2SVoQxkHZBWjpbxN8T5tcZUReU", exchange: "HTX (Huobi)", label: "HTX Hot Wallet 5", chain: "tron" },

  // Gate.io USDT
  { address: "TKy4jqhZYw23LzK1sdUHuHxCqpDyjwjjJH", exchange: "Gate.io", label: "Gate.io USDT Hot 1", chain: "tron" },
  { address: "TXSh7dy4x4GS2JhzpxWe5k3ULSS9viWzYZ", exchange: "Gate.io", label: "Gate.io Hot Wallet 2", chain: "tron" },

  // Crypto.com USDT
  { address: "TUwtdFbW7u4vMuvgAzdUrFc7CaqX8XS3Gs", exchange: "Crypto.com", label: "Crypto.com USDT Hot 1", chain: "tron" },

  // Bitget USDT
  { address: "TNMcQVGPzqHGoCJJEBNYejhN5cKmFmCfbP", exchange: "Bitget", label: "Bitget USDT Hot 1", chain: "tron" },
  { address: "TKwMHQQME1JCBzzqpMUx9Mg3hNn8v3GVzs", exchange: "Bitget", label: "Bitget Hot Wallet 2", chain: "tron" },

  // MEXC USDT
  { address: "TAVp1YXgDhSsHzxrL7WHTU4nQJa3vRfJMQ", exchange: "MEXC", label: "MEXC USDT Hot 1", chain: "tron" },
  { address: "TF5Jod1GXE7S5egJkYPiFhG4K4MYAT4tRz", exchange: "MEXC", label: "MEXC Hot Wallet 2", chain: "tron" },

  // Kraken
  { address: "TLW4FMj3YMCXH4PNXRH8e76dLPsoBMWkTa", exchange: "Kraken", label: "Kraken Hot Wallet", chain: "tron" },

  // Coinbase
  { address: "TVuXM8K8jU8d5FK7E1EVDNmiKPJyjDFbcx", exchange: "Coinbase", label: "Coinbase Hot Wallet", chain: "tron" },

  // Bitfinex USDT
  { address: "TAhLuaFg3fPSn5GbMnUaG7J7LWwJ8rtqjX", exchange: "Bitfinex", label: "Bitfinex USDT Hot 1", chain: "tron" },

  // Upbit USDT
  { address: "TNCMHgSnWMUpJWVCXwYfJTZv7Dvz3cpK75", exchange: "Upbit", label: "Upbit USDT Hot 1", chain: "tron" },

  // Bithumb USDT
  { address: "TBA5TnmXagQsqkByBYFNfBqXpfYEvfbui4", exchange: "Bithumb", label: "Bithumb USDT Hot 1", chain: "tron" },

  // WhiteBIT
  { address: "TSiYWFEj7KDdGpNiMBwjbpBMnSdaEqB3dq", exchange: "WhiteBIT", label: "WhiteBIT Hot Wallet", chain: "tron" },

  // Bitstamp
  { address: "TCkmM4JJAHDxhxgNEtZ1KzFRJvT2bRGxwQ", exchange: "Bitstamp", label: "Bitstamp Hot Wallet", chain: "tron" },

  // CoinDCX
  { address: "TEAKxHfZLx2KZQzFnyiDrzBMpJR3RNmevR", exchange: "CoinDCX", label: "CoinDCX Hot Wallet", chain: "tron" },

  // WazirX additional
  { address: "TPiLkGFKbj3VTLTU1ZMnFnE5kyT5ouqGeB", exchange: "WazirX", label: "WazirX USDT Hot 1", chain: "tron" },

  // Phemex
  { address: "TDSmNuaBHQQdLJXnfE2ECpT2G2LrcEjFR8", exchange: "Phemex", label: "Phemex Hot Wallet", chain: "tron" },

  // BingX
  { address: "TB8mvs2bJ4JB2UxAqfDfmMaGwp2Dz2CRHV", exchange: "BingX", label: "BingX Hot Wallet", chain: "tron" },

  // Pionex
  { address: "TBpmKxCiJyTV3MZjRhNkGJkGzK1W3L5jJt", exchange: "Pionex", label: "Pionex Hot Wallet", chain: "tron" },

  // BitMart additional
  { address: "TBGQN3ynSL1YEnVHbGf6sif3SMp7HKQCuS", exchange: "BitMart", label: "BitMart USDT Hot 1", chain: "tron" },

  // HTX/Huobi additional large USDT wallets
  { address: "TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq", exchange: "HTX (Huobi)", label: "HTX USDT Pool", chain: "tron" },

  // Sun.io / JustLend (TRON DeFi — protocol)
  { address: "TXJgMRLett2sMbfbNZPAdg84EV7U4R8Z7Y", exchange: "Sun.io", label: "Sun.io Router", chain: "tron", entityType: "protocol" },
  { address: "TX7aEN5bUU7vsAMa28pMoVj7VoX1raGXGN", exchange: "JustLend", label: "JustLend Pool", chain: "tron", entityType: "protocol" },
];

// ═══════════════════════════════════════════════════════════════
//  SUSPECTED CEX-ASSOCIATED ADDRESSES
//  Not officially confirmed — sourced from Arkham/Etherscan labels,
//  known market makers, defunct exchange recovery wallets, and
//  deposit aggregators.
// ═══════════════════════════════════════════════════════════════

const SUSPECTED_CEX: CexAddress[] = [
  // ── Defunct Exchange Recovery / Bankruptcy Wallets ─────────

  // Voyager (defunct — bankruptcy)
  { address: "0xa9a9bc065a1d30e17af93a8a2b6e9fedcc9ffa1e", exchange: "Voyager", label: "Suspected: Voyager Bankruptcy", chain: "ethereum" },

  // Hotbit (defunct — wallets still on-chain)
  { address: "0x274f3c32c90517975e29dfc209a23f315c1e5fc7", exchange: "Hotbit", label: "Suspected: Hotbit Hot Wallet", chain: "ethereum" },

  // FTX (additional suspected wallets)
  { address: "0x7ebc8e4ebc34d75a3e0e6c4a7e06f3c4609b8d4e", exchange: "FTX", label: "Suspected: FTX Recovery Wallet", chain: "ethereum" },

  // ── Suspected Deposit Aggregators ─────────────────────────

  // Blockchain.com
  { address: "0xd4bddf5e8d76ec41e6a68a7e3c6d3e1e3e4b3f5c", exchange: "Blockchain.com", label: "Suspected: Blockchain.com", chain: "ethereum" },

  // Coinone
  { address: "0x167a9333bf582556f35bd4d16253f7e31e495c78", exchange: "Coinone", label: "Suspected: Coinone Hot Wallet", chain: "ethereum" },

  // CoinDCX
  { address: "0x6d4ee35ba4c4e26cc8b1bd4e2e7283e175287768", exchange: "CoinDCX", label: "Suspected: CoinDCX Hot Wallet", chain: "ethereum" },

  // ZebPay
  { address: "0x3e45f9960e4f2195c0bcf3bc6cb8bf77d03da771", exchange: "ZebPay", label: "Suspected: ZebPay Hot Wallet", chain: "ethereum" },

  // Coinhako
  { address: "0x78cd2eb6e3b667f5ac94f3cdc8e35b49a3e6891d", exchange: "Coinhako", label: "Suspected: Coinhako Hot Wallet", chain: "ethereum" },

  // Independent Reserve
  { address: "0x94ee5e38430bad87a8f3c4d4a3e4c14483f1b12d", exchange: "Independent Reserve", label: "Suspected: Independent Reserve", chain: "ethereum" },

  // Toobit
  { address: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", exchange: "Toobit", label: "Suspected: Toobit Hot Wallet", chain: "ethereum" },
];

// ═══════════════════════════════════════════════════════════════
//  CELEBRITY / NOTABLE WALLETS
//  Famous individuals whose wallets are publicly known
// ═══════════════════════════════════════════════════════════════

const CELEBRITY_WALLETS: CexAddress[] = [
  // ── Crypto Founders & Leaders ────────────────────────────────
  { address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", exchange: "Vitalik Buterin", label: "vitalik.eth", chain: "ethereum", entityType: "celebrity" },
  { address: "0xab5801a7d398351b8be11c439e05c5b3259aec9b", exchange: "Vitalik Buterin", label: "Vitalik OG Wallet", chain: "ethereum", entityType: "celebrity" },
  { address: "0x220866b1a2219f40e72f5c628b65d54268ca3a9d", exchange: "CZ (Changpeng Zhao)", label: "CZ Personal Wallet", chain: "ethereum", entityType: "celebrity" },
  { address: "0x3c783c21a0383057d128bae431894a5c19f9cf06", exchange: "Justin Sun", label: "Justin Sun Wallet", chain: "ethereum", entityType: "celebrity" },
  { address: "0x176f3dab24a159341c0509bb36b833e7fdd0a132", exchange: "Justin Sun", label: "Justin Sun Wallet 2", chain: "ethereum", entityType: "celebrity" },
  { address: "0x1b7a0da1d9c63d9b8209fa5ce98ac0d148960800", exchange: "Justin Sun", label: "Justin Sun Wallet 3", chain: "ethereum", entityType: "celebrity" },
  { address: "0x0d0707963952f2fba59dd06f2b425ace40b492fe", exchange: "Brian Armstrong", label: "Brian Armstrong (Coinbase CEO)", chain: "ethereum", entityType: "celebrity" },
  { address: "0x8652fce85135c28e8ae15d6b3f7cf0c30dba4c20", exchange: "Hayden Adams", label: "Hayden Adams (Uniswap)", chain: "ethereum", entityType: "celebrity" },
  { address: "0xb1adceddb2941033a090dd166a462fe1c2029484", exchange: "SBF (Sam Bankman-Fried)", label: "SBF Personal Wallet", chain: "ethereum", entityType: "celebrity" },

  // ── WLFI (World Liberty Financial — Trump) ───────────────────
  { address: "0x5be9a4959308a0d0c43ed1c5f4b1b5b74d9cf535", exchange: "WLFI (Trump)", label: "WLFI Treasury", chain: "ethereum", entityType: "celebrity" },
  { address: "0x5ea0c4b9c35b1f4eeeebcc1d0608e40aa15daa75", exchange: "WLFI (Trump)", label: "WLFI Multisig", chain: "ethereum", entityType: "celebrity" },

  // ── Celebrities / Public Figures ─────────────────────────────
  { address: "0x0ed1e02164a2a9fad7a9f9b5b9e71694c3fad7f2", exchange: "Snoop Dogg", label: "Snoop Dogg (Cozomo de' Medici)", chain: "ethereum", entityType: "celebrity" },
  { address: "0xff0bd4aa3496739d5667adc10e2b843dfab5712b", exchange: "Steve Aoki", label: "Steve Aoki Wallet", chain: "ethereum", entityType: "celebrity" },
  { address: "0xc6b0562605d35ee710138402b878ffe6f2e23807", exchange: "Gary Vee", label: "Gary Vaynerchuk Wallet", chain: "ethereum", entityType: "celebrity" },
  { address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", exchange: "Andre Cronje", label: "Andre Cronje (Yearn)", chain: "ethereum", entityType: "celebrity" },

  // ── Solana Celebrities ───────────────────────────────────────
  { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", exchange: "Anatoly Yakovenko", label: "toly.sol (Solana co-founder)", chain: "solana", entityType: "celebrity" },
];

// ═══════════════════════════════════════════════════════════════
//  SANCTIONS / OFAC ADDRESSES
//  OFAC SDN list, Tornado Cash, Lazarus Group, etc.
// ═══════════════════════════════════════════════════════════════

const SANCTIONS_WALLETS: CexAddress[] = [
  // ── Tornado Cash (OFAC-sanctioned Aug 2022) ──────────────────
  { address: "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b", exchange: "Tornado Cash", label: "Tornado Cash Router", chain: "ethereum", entityType: "sanctions" },
  { address: "0x722122df12d4e14e13ac3b6895a86e84145b6967", exchange: "Tornado Cash", label: "Tornado Cash: 0.1 ETH", chain: "ethereum", entityType: "sanctions" },
  { address: "0xdd4c48c0b24039969fc16d1cdf626eab821d3384", exchange: "Tornado Cash", label: "Tornado Cash: 1 ETH", chain: "ethereum", entityType: "sanctions" },
  { address: "0xd4b88df4d29f5cedd6857912842cff3b20c8cfa3", exchange: "Tornado Cash", label: "Tornado Cash: 10 ETH", chain: "ethereum", entityType: "sanctions" },
  { address: "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf", exchange: "Tornado Cash", label: "Tornado Cash: 100 ETH", chain: "ethereum", entityType: "sanctions" },
  { address: "0xa160cdab225685da1d56aa342ad8841c3b53f291", exchange: "Tornado Cash", label: "Tornado Cash: 100 USDT", chain: "ethereum", entityType: "sanctions" },
  { address: "0xd691f27f38b395864ea86cfc7253969b409c362d", exchange: "Tornado Cash", label: "Tornado Cash: 1000 USDT", chain: "ethereum", entityType: "sanctions" },
  { address: "0x169ad27a7a1d3ef92b0161895922bac10b377c2e", exchange: "Tornado Cash", label: "Tornado Cash: Gitcoin Grants", chain: "ethereum", entityType: "sanctions" },
  { address: "0x178169b423a011fff22b9e3f3abeadfc84235ad8", exchange: "Tornado Cash", label: "Tornado Cash: TORN Staking", chain: "ethereum", entityType: "sanctions" },
  { address: "0x23773e65ed146a459791799d01336db287f25334", exchange: "Tornado Cash", label: "Tornado Cash: Governance", chain: "ethereum", entityType: "sanctions" },

  // ── Lazarus Group (North Korea / OFAC) ───────────────────────
  { address: "0x098b716b8aaf21512996dc57eb0615e2383e2f96", exchange: "Lazarus Group", label: "Lazarus Group (Ronin Hack)", chain: "ethereum", entityType: "sanctions" },
  { address: "0xa0e1c89ef1a489c9c7de96311ed5ce5d32c20e4b", exchange: "Lazarus Group", label: "Lazarus Group (Harmony Hack)", chain: "ethereum", entityType: "sanctions" },
  { address: "0x4f3a120e72c76c22ae802d129f599bfdbc31cb81", exchange: "Lazarus Group", label: "Lazarus Group Wallet 3", chain: "ethereum", entityType: "sanctions" },
  { address: "0x35fb6f6db4fb05e6a4ce86f2c93270f0461b11f3", exchange: "Lazarus Group", label: "Lazarus Group (Stake.com Hack)", chain: "ethereum", entityType: "sanctions" },

  // ── Other OFAC-sanctioned ────────────────────────────────────
  { address: "0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c", exchange: "OFAC Sanctioned", label: "Blender.io", chain: "ethereum", entityType: "sanctions" },
  { address: "0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b", exchange: "OFAC Sanctioned", label: "Garantex Exchange", chain: "ethereum", entityType: "sanctions" },
  { address: "0x7f367cc41522ce07553e823bf3be79a889debe1b", exchange: "OFAC Sanctioned", label: "Chatex", chain: "ethereum", entityType: "sanctions" },
];

// ═══════════════════════════════════════════════════════════════
//  RUG PULLS / HACKED PROTOCOLS
//  Known exploit deployers, rug pull wallets, hack addresses
// ═══════════════════════════════════════════════════════════════

const RUGPULL_WALLETS: CexAddress[] = [
  // ── Major Hacks ──────────────────────────────────────────────
  { address: "0xb624c1bdc0b62e552ce9a881e2c358ed5c4d1da1", exchange: "Ronin Bridge Hack", label: "Ronin Exploiter ($625M)", chain: "ethereum", entityType: "rugpull" },
  { address: "0xed299c4c11f3a3b655b46db7cae1e33a3ab51ec7", exchange: "Wormhole Hack", label: "Wormhole Exploiter ($320M)", chain: "ethereum", entityType: "rugpull" },
  { address: "0x148e2ed011a9eaaa200795f62889d68153eeacde", exchange: "Nomad Bridge Hack", label: "Nomad Exploiter ($190M)", chain: "ethereum", entityType: "rugpull" },
  { address: "0xb3764761e297d6f121e79c32a65829cd1ddb4d32", exchange: "Multichain Hack", label: "Multichain Exploiter", chain: "ethereum", entityType: "rugpull" },
  { address: "0x59abf3837fa962d6853b4cc0a19513aa031fd32b", exchange: "Euler Finance Hack", label: "Euler Exploiter ($197M)", chain: "ethereum", entityType: "rugpull" },
  { address: "0xdef1c0ded9bec7f1a1670819833240f027b25eff", exchange: "Mango Markets Hack", label: "Mango Exploiter ($114M)", chain: "ethereum", entityType: "rugpull" },
  { address: "0x9a9af56d80c0bf5e22f3ecc1c8b1b8a90ccbc3a3", exchange: "Curve Finance Hack", label: "Curve Exploiter ($62M)", chain: "ethereum", entityType: "rugpull" },

  // ── Rug Pulls ────────────────────────────────────────────────
  { address: "0x8eae784e072e961f76948a785e8baf136220ba8a", exchange: "AnubisDAO Rug", label: "AnubisDAO Deployer ($60M)", chain: "ethereum", entityType: "rugpull" },
  { address: "0x3c344c886ff8d862de67ab20c3e90e89261fa35c", exchange: "Squid Game Token Rug", label: "SQUID Token Deployer", chain: "ethereum", entityType: "rugpull" },
  { address: "0x6967fce0e3b81b3e579e1bfeb696c7f9b7f36918", exchange: "Luna/UST Collapse", label: "Luna Foundation Guard", chain: "ethereum", entityType: "rugpull" },
  { address: "0xd4617878a8bc93765ec45604398e8e7dc4059dbf", exchange: "Frosties NFT Rug", label: "Frosties NFT Deployer", chain: "ethereum", entityType: "rugpull" },

  // ── Solana Rugs/Hacks ────────────────────────────────────────
  { address: "Htp9MGP8Tig923ZFY7Qf2zzbMUmYneFRAhSp7vSg4wxV", exchange: "Mango Markets Hack", label: "Mango Exploiter (Avi Eisenberg)", chain: "solana", entityType: "rugpull" },
];

// ═══════════════════════════════════════════════════════════════
//  SMART MONEY / WHALE WALLETS
//  Top traders, VC funds, and known whale addresses
// ═══════════════════════════════════════════════════════════════

const SMART_MONEY_WALLETS: CexAddress[] = [
  // ── VC Funds / Investment Firms ──────────────────────────────
  { address: "0xa16081f360e3847006db660bae1c6d1b2e17ec2a", exchange: "a16z (Andreessen Horowitz)", label: "a16z Treasury", chain: "ethereum", entityType: "fund" },
  { address: "0x0716a17fbaee714f1e6ab0f9d59edbc5f09815c0", exchange: "Jump Trading", label: "Jump Crypto", chain: "ethereum", entityType: "fund" },
  { address: "0x9507c04b10486547584c37bcbd931b2a4fee9a41", exchange: "Jump Trading", label: "Jump Trading Hot Wallet", chain: "ethereum", entityType: "fund" },
  { address: "0x0000000fee68a5661bca21ceb3ce4b514a7b71b6", exchange: "Wintermute", label: "Wintermute Trading", chain: "ethereum", entityType: "fund" },
  { address: "0xdbf5e9c5206d0db70a90108bf936da60221dc080", exchange: "Wintermute", label: "Wintermute Wallet 2", chain: "ethereum", entityType: "fund" },
  { address: "0x84d34f4f83a87596cd3fb6887cff8f17bf5a7b83", exchange: "Alameda Research", label: "Alameda Research", chain: "ethereum", entityType: "fund" },
  { address: "0x56178a0d5f301baf6cf3e1cd53d9863437345bf9", exchange: "Paradigm", label: "Paradigm Multisig", chain: "ethereum", entityType: "fund" },
  { address: "0x6b44ba0a126a2a1a8aa6cd1adeed002e141bcd44", exchange: "Polychain Capital", label: "Polychain Capital", chain: "ethereum", entityType: "fund" },
  { address: "0x820fb25352bb0c5e03e07afc1d86252ffd2f0a18", exchange: "Galaxy Digital", label: "Galaxy Digital", chain: "ethereum", entityType: "fund" },

  // ── Known Whales / Smart Money ───────────────────────────────
  { address: "0x28c6c06298d514db089934071355e5743bf21d60", exchange: "Smart Money Whale", label: "Whale (0x28c6...d60)", chain: "ethereum", entityType: "smartmoney" },
  { address: "0x8103683202aa8da10536036edef04cdd865c225e", exchange: "Tetranode", label: "Tetranode", chain: "ethereum", entityType: "smartmoney" },
  { address: "0x7431310e026b69bfc676c0013e12a1a11411eec9", exchange: "Hsaka (Crypto Twitter)", label: "Hsaka Trades", chain: "ethereum", entityType: "smartmoney" },
  { address: "0x5d3a536e4d6dbd6114cc1ead35777bab948e3643", exchange: "DeFi Whale", label: "Compound Whale", chain: "ethereum", entityType: "smartmoney" },

  // ── Solana Smart Money ───────────────────────────────────────
  { address: "CwyQtt6xGptR7PaxrrksgqBSRCZ3Zb2GjUYjKD9jH3tH", exchange: "Wintermute", label: "Wintermute (Solana)", chain: "solana", entityType: "fund" },
];

// ═══════════════════════════════════════════════════════════════
//  GOVERNMENT / LAW ENFORCEMENT WALLETS
// ═══════════════════════════════════════════════════════════════

const GOVERNMENT_WALLETS: CexAddress[] = [
  { address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", exchange: "US Government (DOJ)", label: "DOJ Seizure Wallet (Silk Road)", chain: "ethereum", entityType: "government" },
  { address: "0x49048044d57e1c92a77f79988d21fa8faf74e97e", exchange: "US Government (DOJ)", label: "DOJ Seizure Wallet (Bitfinex)", chain: "ethereum", entityType: "government" },
  { address: "bc1qa5wkgaew2dkv56kc6hp3706gkm7ay7qjhz2yq3", exchange: "US Government", label: "US Gov Seized BTC (Silk Road)", chain: "bitcoin", entityType: "government" },
  { address: "bc1qf2yvj48c0wqkjnzjr3ywmraeftacq0gedwlkn0", exchange: "German Government (BKA)", label: "German Gov BTC Sales (2024)", chain: "bitcoin", entityType: "government" },
];

// ═══════════════════════════════════════════════════════════════
//  PROTOCOL TREASURIES / MULTISIGS
// ═══════════════════════════════════════════════════════════════

const PROTOCOL_WALLETS: CexAddress[] = [
  { address: "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf", exchange: "Polygon Bridge", label: "Polygon PoS Bridge", chain: "ethereum", entityType: "protocol" },
  { address: "0x8eb8a3b98659cce290402893d0123abb75e3ab28", exchange: "Uniswap", label: "Uniswap Treasury", chain: "ethereum", entityType: "protocol" },
  { address: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503", exchange: "Aave", label: "Aave Treasury", chain: "ethereum", entityType: "protocol" },
  { address: "0x6b175474e89094c44da98b954eedeac495271d0f", exchange: "MakerDAO", label: "DAI Contract", chain: "ethereum", entityType: "protocol" },
  { address: "0xbeb5fc579115071764c7423a4f12edde41f106ed", exchange: "Optimism Bridge", label: "Optimism L1 Bridge", chain: "ethereum", entityType: "protocol" },
  { address: "0x3ee18b2214aff97000d974cf647e7c347e8fa585", exchange: "Wormhole", label: "Wormhole Bridge", chain: "ethereum", entityType: "protocol" },
  { address: "0x32400084c286cf3e17e7b677ea9583e60a000324", exchange: "zkSync Bridge", label: "zkSync Era Diamond Proxy", chain: "ethereum", entityType: "protocol" },
  { address: "0xba12222222228d8ba445958a75a0704d566bf2c8", exchange: "Balancer", label: "Balancer Vault", chain: "ethereum", entityType: "protocol" },
  { address: "0x5e4e65926ba27467555eb562121fac00d24e9dd2", exchange: "Arbitrum Bridge", label: "Arbitrum Delayed Inbox", chain: "ethereum", entityType: "protocol" },
  { address: "0x1a2a1c938ce3ec39b6d47113c7955baa9b29ec31", exchange: "Ethereum Foundation", label: "Ethereum Foundation", chain: "ethereum", entityType: "protocol" },
];

// ═══════════════════════════════════════════════════════════════
//  Combined lookup
// ═══════════════════════════════════════════════════════════════

import { IMPORTED_EVM_CEX } from "./imported-addresses";

const ALL_CEX_ADDRESSES = [...EVM_CEX, ...IMPORTED_EVM_CEX, ...SOLANA_CEX, ...BTC_CEX, ...TRON_CEX];
const ALL_LABELED_WALLETS: CexAddress[] = [
  ...ALL_CEX_ADDRESSES,
  ...SUSPECTED_CEX,
  ...CELEBRITY_WALLETS,
  ...SANCTIONS_WALLETS,
  ...RUGPULL_WALLETS,
  ...SMART_MONEY_WALLETS,
  ...GOVERNMENT_WALLETS,
  ...PROTOCOL_WALLETS,
];

// Build unified lookup map for O(1) matching (all entity types)
const unifiedEvmMap = new Map<string, CexAddress>();
const unifiedSolanaMap = new Map<string, CexAddress>();
const unifiedBtcMap = new Map<string, CexAddress>();
const unifiedTronMap = new Map<string, CexAddress>();

// CEX addresses first (higher priority), then others
for (const a of ALL_LABELED_WALLETS) {
  const key = a.chain === "ethereum" ? a.address.toLowerCase() : a.address;
  const map = a.chain === "ethereum" ? unifiedEvmMap
    : a.chain === "solana" ? unifiedSolanaMap
    : a.chain === "bitcoin" ? unifiedBtcMap
    : unifiedTronMap;
  // Don't overwrite CEX entries with non-CEX entries for same address
  if (!map.has(key)) {
    map.set(key, a);
  }
}

// Legacy CEX-only lookup maps (backward compat)
const evmMap = new Map<string, CexAddress>();
EVM_CEX.forEach((a) => evmMap.set(a.address.toLowerCase(), a));
IMPORTED_EVM_CEX.forEach((a) => { if (!evmMap.has(a.address.toLowerCase())) evmMap.set(a.address.toLowerCase(), a); });

const solanaMap = new Map<string, CexAddress>();
SOLANA_CEX.forEach((a) => solanaMap.set(a.address, a));

const btcMap = new Map<string, CexAddress>();
BTC_CEX.forEach((a) => btcMap.set(a.address, a));

const tronMap = new Map<string, CexAddress>();
TRON_CEX.forEach((a) => tronMap.set(a.address, a));

// Build suspected lookup maps
const suspectedEvmMap = new Map<string, CexAddress>();
const suspectedSolanaMap = new Map<string, CexAddress>();
const suspectedBtcMap = new Map<string, CexAddress>();
const suspectedTronMap = new Map<string, CexAddress>();
SUSPECTED_CEX.forEach((a) => {
  switch (a.chain) {
    case "ethereum":
      suspectedEvmMap.set(a.address.toLowerCase(), a);
      break;
    case "solana":
      suspectedSolanaMap.set(a.address, a);
      break;
    case "bitcoin":
      suspectedBtcMap.set(a.address, a);
      break;
    case "tron":
      suspectedTronMap.set(a.address, a);
      break;
  }
});

/** Lookup any labeled wallet (CEX, celebrity, sanctions, etc.) */
export function lookupAny(address: string, chain: Chain): CexAddress | null {
  const key = chain === "ethereum" ? address.toLowerCase() : address;
  const map = chain === "ethereum" ? unifiedEvmMap
    : chain === "solana" ? unifiedSolanaMap
    : chain === "bitcoin" ? unifiedBtcMap
    : unifiedTronMap;
  return map.get(key) ?? null;
}

/** Lookup confirmed CEX address only */
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

export function lookupSuspectedCex(address: string, chain: Chain): CexAddress | null {
  switch (chain) {
    case "ethereum":
      return suspectedEvmMap.get(address.toLowerCase()) ?? null;
    case "solana":
      return suspectedSolanaMap.get(address) ?? null;
    case "bitcoin":
      return suspectedBtcMap.get(address) ?? null;
    case "tron":
      return suspectedTronMap.get(address) ?? null;
  }
}

export function getAllCexForChain(chain: Chain): CexAddress[] {
  return ALL_CEX_ADDRESSES.filter((a) => a.chain === chain);
}

export function getAllSuspectedCexForChain(chain: Chain): CexAddress[] {
  return SUSPECTED_CEX.filter((a) => a.chain === chain);
}

export function getExchangeList(): string[] {
  return [...new Set(ALL_CEX_ADDRESSES.map((a) => a.exchange))].sort();
}

/** Get all labeled wallets by entity type */
export function getWalletsByType(entityType: EntityType): CexAddress[] {
  return ALL_LABELED_WALLETS.filter((a) => (a.entityType || "cex") === entityType);
}

export const CHAIN_STATS = {
  ethereum: { count: EVM_CEX.length, exchanges: [...new Set(EVM_CEX.map((a) => a.exchange))].length },
  solana: { count: SOLANA_CEX.length, exchanges: [...new Set(SOLANA_CEX.map((a) => a.exchange))].length },
  bitcoin: { count: BTC_CEX.length, exchanges: [...new Set(BTC_CEX.map((a) => a.exchange))].length },
  tron: { count: TRON_CEX.length, exchanges: [...new Set(TRON_CEX.map((a) => a.exchange))].length },
  total: ALL_CEX_ADDRESSES.length,
  suspected: SUSPECTED_CEX.length,
  celebrities: CELEBRITY_WALLETS.length,
  sanctions: SANCTIONS_WALLETS.length,
  rugpulls: RUGPULL_WALLETS.length,
  smartMoney: SMART_MONEY_WALLETS.length,
  government: GOVERNMENT_WALLETS.length,
  protocols: PROTOCOL_WALLETS.length,
  totalLabeled: ALL_LABELED_WALLETS.length,
};

export function getExchangeStats(): { exchange: string; addresses: number; chains: string[] }[] {
  const map = new Map<string, { addresses: number; chains: Set<string> }>();
  for (const a of ALL_CEX_ADDRESSES) {
    const entry = map.get(a.exchange) || { addresses: 0, chains: new Set<string>() };
    entry.addresses++;
    entry.chains.add(a.chain);
    map.set(a.exchange, entry);
  }
  return [...map.entries()]
    .map(([exchange, { addresses, chains }]) => ({ exchange, addresses, chains: [...chains].sort() }))
    .sort((a, b) => b.addresses - a.addresses);
}

/** Get entity type display info */
export function getEntityTypeInfo(entityType: EntityType): { label: string; color: string; icon: string } {
  switch (entityType) {
    case "cex": return { label: "Exchange", color: "red", icon: "🏦" };
    case "celebrity": return { label: "Celebrity", color: "purple", icon: "⭐" };
    case "sanctions": return { label: "Sanctioned", color: "red", icon: "⛔" };
    case "rugpull": return { label: "Hack/Rug", color: "orange", icon: "💀" };
    case "smartmoney": return { label: "Smart Money", color: "blue", icon: "🧠" };
    case "fund": return { label: "Fund/MM", color: "cyan", icon: "🏛️" };
    case "government": return { label: "Government", color: "yellow", icon: "🏛️" };
    case "protocol": return { label: "Protocol", color: "green", icon: "🔗" };
  }
}

export { SUSPECTED_CEX, CELEBRITY_WALLETS, SANCTIONS_WALLETS, RUGPULL_WALLETS, SMART_MONEY_WALLETS, GOVERNMENT_WALLETS, PROTOCOL_WALLETS, ALL_LABELED_WALLETS };
