# GRAFFY — Frontend

Static frontend (HTML/CSS/vanilla JS, no build step) for the GRAFFY street-art voting seasons.

- Main network: **Robinhood Chain** (Chain ID 4663). Secondary: **BSC, Base, Ethereum** (same CA) and **Solana**.
- Multi-network wallet login: EVM wallets (EIP-6963 / MetaMask, Rabby…) with auto network switch/add, Solana wallets (Phantom, Solflare, Backpack).
- "Buy $GRAFFY" popup → Uniswap per network.
- X: [@GraffyCoin](https://x.com/GraffyCoin)

## Run

Any static server, e.g. `python3 -m http.server` then open `http://localhost:8000`. Also works on GitHub Pages.

## Configure (edit on GitHub)

All settings live in [`js/config.js`](js/config.js):

| Key | Purpose |
|---|---|
| `token.evmAddress` | CA shared by Robinhood, BSC, Base, Ethereum |
| `token.solanaAddress` | Solana mint address |
| `networks.<id>.tokenAddress` | Optional per-network override |
| `networks.<id>.rpcUrls / explorer / uniswapChain` | Network settings |
| `contracts.voting` | Season/voting contract (primary network) |
| `api.baseUrl` | Backend base URL |
| `adminWallets` | Wallets that see the Admin form (backend must re-verify) |
| `social.x` | X link |

Season parameters (Minimum Holding to Submit, Upload Fee, Minimum Holding to Vote, Voting Fee, USD reference price) are **not** in the frontend. They come from the backend/contract per season and are locked once a season starts.

Network icons are in `assets/networks/*.svg` — replace with official brand-kit SVGs (same filenames) if desired.

## Test mode (`api.mode: "seed"`)

Until the backend is live, the site runs on test data:
- `data/seed.json` — Season 1 "Concrete Canvas" (Nov 2 → Nov 8, 2026, UTC+7), 20 artworks (`assets/seed/*.svg`), 200 vote records. Totals, prize pool, ranking and tie-breaks are all computed from the vote records.
- Admin wallet (`adminWallets`) can create new seasons from `#/admin` after signing a message. In test mode they are stored in that browser's localStorage only. A new season must start after the running one ends (parameters of a live season are locked).
- A "TEST SEASON" banner is shown. Set `api.mode: "live"` to switch to the real API.

## Data rules

The UI never renders demo data. Everything comes from the API or on-chain reads (token supply/balance via JSON-RPC). When the API is unreachable, empty states and a "Backend not connected" banner are shown.

## Backend API contract (to implement)

All responses JSON, either the object directly or `{ "data": ... }`. Token amounts are **decimal strings in whole tokens** (e.g. `"100000000"`).

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/season/current` | `Season` |
| GET | `/seasons` | `{ items: Season[] }` |
| GET | `/seasons/{id}` | `Season` |
| GET | `/seasons/{id}/leaderboard?limit=` | `{ items: Artwork[] }` sorted by rank |
| GET | `/seasons/{id}/artworks?sort=votes\|newest&q=` | `{ items: Artwork[], total }` |
| GET | `/seasons/{id}/transparency` | `Transparency` |
| POST | `/artworks` | multipart (after on-chain upload fee) |
| POST | `/admin/seasons` | season config; headers `X-Wallet`, `X-Signature`, `X-Message` (base64) |

```ts
Season {
  id, name, startDate, endDate,               // ISO dates
  submissionStatus, votingStatus,             // "scheduled" | "open" | "closed"
  minHoldingToSubmit, uploadFee, minHoldingToVote, votingFee,
  usdPrice?,                                  // USD per token, display only
  locked,                                     // params locked
  totalValidVotes, totalPrizePool, totalArtworks, totalArtists,
  winners?: { rank, title, artist, wallet, amount, txHash }[],
  prizeDistributionStatus                     // "pending" | "distributed" ...
}
Artwork { id, rank, title, artist, wallet, image, validVotes, reachedAt, createdAt }
Transparency {
  totalPrizePool, prizeDistributionStatus, feeReceiptsTotal,
  feeReceipts: { from, artworkId, artworkTitle, amount, txHash, timestamp }[],
  distributions: { rank, wallet, amount, txHash, timestamp }[]
}
```

Prize split shown in UI: Top 1 50% · Top 2 30% · Top 3 20% of `totalPrizePool` (100% of on-chain voting fees). Ranking = valid votes only; tie → earlier `reachedAt` wins.

## Structure

```
index.html
css/style.css
js/config.js   # editable settings
js/utils.js    # formatting, BigInt-safe token math
js/api.js      # backend client
js/chain.js    # networks, Uniswap links, on-chain reads
js/wallet.js   # EVM + Solana login
js/views.js    # pages & modals
js/app.js      # router & shell
assets/
```
