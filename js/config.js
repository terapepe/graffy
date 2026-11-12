window.GRAFFY_CONFIG = {
  project: {
    name: "GRAFFY",
    ticker: "$GRAFFY",
    tagline: "Spray. Vote. Win.",
    totalSupply: "1000000000", // fixed total supply (display only)
    decimals: 18,              // fallback; real value read on-chain
  },

  social: {
    x: "https://x.com/GraffyCoin",
    xHandle: "@GraffyCoin",
  },

  /** $GRAFFY CA: address = shared by all EVM networks (Robinhood, Base, BSC) · sol = Solana mint.
   *  A network can override with its own `ca` below. */
  token: {
    address: "0x2468d4b9eda3eb4a9b0463be89c76ae95d7a7faf",
    sol: "",
  },

  /** Smart contracts (fill in after deployment). */
  contracts: {
    // Season / voting contract on Robinhood Chain.
    voting: "",
  },

  /**
   * Site mode:
   *  "single" = only singleNetwork is shown (robinhood | solana | base | bsc) — it is also the main network
   *  "multi"  = always all 4 networks, ordered by multiOrder; voting/upload use primaryNetwork
   */
  mode: "single",
  singleNetwork: "robinhood",
  multiOrder: ["solana", "robinhood", "base", "bsc"],
  primaryNetwork: "robinhood",

  networks: {
    robinhood: {
      name: "Robinhood Chain",
      short: "Robinhood",
      type: "evm",
      chainId: 4663,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
      explorer: "https://robinhoodchain.blockscout.com",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      color: "#CCFF00",
      tagline: "Fast, low-fee L2 built for trading",
      icon: "assets/networks/robinhood.svg",
      ca: "",
    },
    solana: {
      name: "Solana",
      short: "Solana",
      type: "solana",
      rpcUrls: ["https://api.mainnet-beta.solana.com"],
      explorer: "https://solscan.io",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      explorerAddrPath: "/account/",
      color: "#9945FF",
      tagline: "Lightning-fast and meme-native",
      icon: "assets/networks/solana.svg",
      ca: "",
    },
    base: {
      name: "Base",
      short: "Base",
      type: "evm",
      chainId: 8453,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://mainnet.base.org"],
      explorer: "https://basescan.org",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      color: "#0052FF",
      tagline: "Onchain with the Base community",
      icon: "assets/networks/base.svg",
      ca: "",
    },
    bsc: {
      name: "BNB Smart Chain",
      short: "BSC",
      type: "evm",
      chainId: 56,
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      rpcUrls: ["https://bsc-dataseed.bnbchain.org"],
      explorer: "https://bscscan.com",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      color: "#F0B90B",
      tagline: "Degen energy on BNB Smart Chain",
      icon: "assets/networks/bsc.svg",
      ca: "",
    },
  },

  /**
   * Backend API (PHP, to be built). All data on the site comes from here
   * or from on-chain reads. If the API is unreachable the UI shows
   * empty states — no placeholder/demo data is ever rendered.
   */
  api: {
    // "seed" = local TEST data (data/seed.json + admin seasons saved in this browser)
    // "live" = real backend at baseUrl. Switch to "live" once the PHP API is up.
    mode: "seed",
    seedUrl: "data/seed.json",
    baseUrl: "/api",
    endpoints: {
      currentSeason: "/season/current",
      seasons: "/seasons",
      season: "/seasons/{id}",
      leaderboard: "/seasons/{id}/leaderboard",
      artworks: "/seasons/{id}/artworks",
      transparency: "/seasons/{id}/transparency",
      submitArtwork: "/artworks",
      adminSaveSeason: "/admin/seasons",
    },
    timeoutMs: 8000,
  },

  /** Wallets allowed to see the Admin form (backend must re-verify). */
  adminWallets: ["0xB3c29d9D0e45d9988ad04527580aD03c52671364"],
};
