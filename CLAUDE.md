# KYCScan (amikyced) — CEX Exposure Scanner

## Live
- **URL**: https://amikyced.vercel.app
- **Repo**: https://github.com/Neelkukreti/amikyced (private, main branch)

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 (no config file — uses CSS @theme)
- Axios for API calls
- No component library — all custom components
- Vercel (Hobby plan) for hosting

## Project Structure
```
src/app/
  page.tsx                — Single-page app (client component, ~1500 lines)
  layout.tsx              — Root layout, viewport meta, fonts
  globals.css             — CSS variables, mobile @media queries
  api/
    scan/route.ts         — POST: scan a wallet address (main endpoint)
    submit/route.ts       — POST: community address submission
    submissions/route.ts  — GET: export submissions (secret-protected)
    analytics/route.ts    — GET: in-memory scan analytics (secret-protected)
    stats/route.ts        — GET: exchange database stats
    auth/                 — nonce, verify, session, logout (wallet auth)
    payment/              — create, status (upgrade flow)
    upgrade/route.ts      — POST: apply payment to upgrade plan

src/lib/
    scanner.ts            — Chain scanners (EVM active, SOL/BTC/TRON disabled)
    cex-addresses.ts      — CEX address database with O(1) lookup maps (~400+ addresses)
    submission-store.ts   — Community submissions: in-memory Map + /tmp JSON backup
    usage-store.ts        — Rate limiting: per-wallet + per-IP, plan-based cooldowns
    auth.ts               — HMAC session cookies

scripts/
    sync-submissions.sh   — Pull submissions from Vercel → Light's Mac
    merge-submissions.sh  — Review & merge verified submissions into cex-addresses.ts
```

## Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `ETHERSCAN_API_KEY` | Vercel + .env.local | Etherscan V2 API (all EVM chains) |
| `SESSION_SECRET` | Vercel + .env.local | HMAC signing for auth cookies |
| `SYNC_SECRET` | Vercel + .env.local | Protects /api/submissions and /api/analytics |

Secret value: `kycscan-sync-9e53595b6d3c3f40`

## Commands
- `pnpm dev` — Start dev server (port 3002)
- `pnpm build` — Production build
- `pnpm lint` — ESLint
- `SYNC_SECRET=kycscan-sync-9e53595b6d3c3f40 ./scripts/sync-submissions.sh` — Sync submissions to Light's Mac
- `./scripts/merge-submissions.sh` — Review community submissions for merging

## Supported Chains
- **Active**: Ethereum, Arbitrum, BSC, Polygon, Optimism, Base (all via Etherscan V2)
- **Disabled** (incomplete data): Solana, Bitcoin, TRON
- Toggle in `scanner.ts` → `DISABLED_CHAINS` array

## Scanning Pipeline
1. User enters address → `detectChain()` identifies chain type
2. `isChainSupported()` gates disabled chains
3. EVM scan: fetch native txs + ERC-20 transfers across 6 chains in parallel (batches of 3)
4. `isDustOrPhishing()` filters: zero-value, dust, address poisoning, phishing airdrops
5. Match counterparties against: confirmed CEX → suspected CEX → any labeled → community submissions
6. 2-hop analysis: check top 10 counterparties for CEX interactions (deep scan)
7. `buildResult()` computes risk score, reputation grade, celebrity connections

## Phishing Filters (scanner.ts)
- Zero-value transactions → always filtered
- Token transfers < 1.0 units → filtered (catches sub-$1 spam)
- Native receives < 0.001 ETH → filtered (dust attacks)
- Received `transferFrom` with < $10 value → filtered (address poisoning)
- Failed transactions (isError=1) → filtered

## Rate Limiting
| Plan | Scans/day | Deep scans/day | Cooldown |
|------|-----------|----------------|----------|
| Free | 5 | 3 | 30s |
| Basic | 20 | 10 | 10s |
| Pro | Unlimited | Unlimited | None |
- Anonymous: IP-based, 10/day, 5s cooldown, first scan gets deep results
- Per-IP deep scan limit: 5/day

## Community Submissions
- Users submit suspected exchange addresses via dropdown (45+ exchanges + "Other")
- Stored in-memory (globalThis.__submissionMap) + /tmp JSON on Vercel
- Ephemeral on Vercel (lost on cold start) — sync to Light's Mac for persistence
- Light's Mac storage: `~/.openclaw/workspace/amikyced-submissions/submissions.json`
- Rate limited: 5/day per IP, 30s cooldown

## Analytics
- In-memory counters on scan route (globalThis.__scanAnalytics)
- Tracks: total scans, unique addresses, unique IPs, scans per hour
- Query: `curl "https://amikyced.vercel.app/api/analytics?secret=kycscan-sync-9e53595b6d3c3f40"`
- Resets on Vercel cold start

## India-Specific
- Timezone detection (Asia/Kolkata) shows Fedha Academy promo after scan results
- CryptoITR ad disabled (code removed, comment placeholder remains)

## Design System
- Dark-only theme: bg #0a0a0a, text #ededed
- CSS variables: --primary, --secondary, --tertiary, --accent, --safe, --caution, --threat
- Accent: red-500/red-600 (brand), amber for warnings/indirect
- Font: Geist Sans (UI) + Geist Mono (addresses, hashes), Bebas Neue (display)
- Risk colors: emerald (none), yellow (low), orange (medium), red (high/critical)
- Mobile-optimized with @media queries in globals.css

## Code Conventions
- Single page.tsx — all UI in one client component
- Types duplicated in page.tsx (client) and scanner.ts (server) — no shared imports
- Scanner functions return ScanResult, buildResult() computes risk scoring
- CEX addresses stored as flat arrays, compiled into Maps at module load
- Etherscan V2 API with Blockscout fallback for EVM
- Vercel serverless: /tmp for ephemeral writes, globalThis for in-memory persistence

## Known Limitations
- Analytics reset on Vercel cold starts (no persistent analytics DB)
- Community submissions ephemeral on Vercel (need manual sync via scripts)
- Only 200 most recent txs per chain scanned (Etherscan API limit)
- 2-hop analysis limited to top 10 counterparties (rate limit friendly)
- No persistent database — all state is in-memory or /tmp
