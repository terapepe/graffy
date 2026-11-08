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

  token: {
    address: "0x3F7eFe5de35039f2D717F93E053e301d69A00087",
    sol: "",
  },

  /** Smart contracts (fill in after deployment). */
  contracts: {
    // Season / voting contract on Robinhood Chain.
    voting: "",
  },

  /**
   * Site mode:
   *  "single" = only singleNetwork (Robinhood) is shown
   *  "multi"  = all networks below (Robinhood, Solana, Base, BSC)
   */
  mode: "single",
  singleNetwork: "robinhood",

  primaryNetwork: "robinhood",

  networks: {
    robinhood: {
      name: "Robinhood Chain",
      short: "Robinhood",
      type: "evm",
      primary: true,
      chainId: 4663,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
      explorer: "https://robinhoodchain.blockscout.com",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      uniswapChain: "robinhood",
      color: "#CCFF00",
      icon: "assets/networks/robinhood.svg",
    },
    // Extra networks (multi mode). CA comes from token.address (EVM) / token.sol (Solana).
    solana: {
      name: "Solana",
      short: "Solana",
      type: "solana",
      rpcUrls: ["https://api.mainnet-beta.solana.com"],
      explorer: "https://solscan.io",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      explorerAddrPath: "/account/",
      buyName: "Jupiter",
      buyUrl: "https://jup.ag/swap/SOL-{ca}",
      color: "#9945FF",
      icon: "assets/networks/solana.svg",
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
      uniswapChain: "base",
      color: "#0052FF",
      icon: "assets/networks/base.svg",
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
      buyName: "PancakeSwap",
      buyUrl: "https://pancakeswap.finance/swap?chain=bsc&inputCurrency=BNB&outputCurrency={ca}",
      color: "#F0B90B",
      icon: "assets/networks/bsc.svg",
    },
  },

  uniswap: {
    base: "https://app.uniswap.org/swap",
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
