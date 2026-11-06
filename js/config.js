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
    decimals: 18,              // ERC-20 decimals on EVM networks
  },

  social: {
    x: "https://x.com/graffy",
    xHandle: "@graffy",
  },

  /**
   * Token contract addresses (CA).
   * Robinhood (main), BSC, Base and Ethereum share the SAME CA.
   * Solana uses its own mint address.
   * Leave "" until deployed — UI will show "TBA".
   * To override a single EVM network, set networks.<id>.tokenAddress.
   */
  token: {
    evmAddress: "",
    solanaAddress: "",
  },

  /** Smart contracts (fill in after deployment). */
  contracts: {
    // Season / voting contract lives on the primary network.
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
      tokenAddress: "", // optional override
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
      uniswapChain: "bnb",
      color: "#F3BA2F",
      icon: "assets/networks/bsc.svg",
      tokenAddress: "",
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
      color: "#2F6BFF",
      icon: "assets/networks/base.svg",
      tokenAddress: "",
    },
    ethereum: {
      name: "Ethereum",
      short: "Ethereum",
      type: "evm",
      chainId: 1,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://ethereum-rpc.publicnode.com"],
      explorer: "https://etherscan.io",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      uniswapChain: "ethereum",
      color: "#8C9BFF",
      icon: "assets/networks/ethereum.svg",
      tokenAddress: "",
    },
    solana: {
      name: "Solana",
      short: "Solana",
      type: "solana",
      rpcUrls: ["https://api.mainnet-beta.solana.com"],
      explorer: "https://solscan.io",
      explorerToken: "/token/",
      explorerTx: "/tx/",
      uniswapChain: "solana",
      color: "#B26BFF",
      icon: "assets/networks/solana.svg",
      tokenAddress: "",
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
