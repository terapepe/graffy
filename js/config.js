/**
 * GRAFFY — Frontend configuration
 * ------------------------------------------------------------------
 * Edit this file directly on GitHub to change contract addresses,
 * networks, links and API endpoints. No rebuild needed.
 *
 * NOTE: Season parameters (Minimum Holding, Upload Fee, Voting Fee,
 * USD reference price...) are NOT configured here on purpose.
 * They are set by the Admin per season and served by the backend /
 * smart contract. Never hardcode them in the frontend.
 */
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

  /**
   * $GRAFFY token contract address (CA) on Robinhood Chain.
   * Leave "" until deployed — UI will show "TBA".
   */
  token: {
    address: "0x5eE3b32f5D229626ec1A7755fDEe5137ae3336ea",
  },

  /** Smart contracts (fill in after deployment). */
  contracts: {
    // Season / voting contract on Robinhood Chain.
    voting: "",
  },

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
