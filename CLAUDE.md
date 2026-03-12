# KYCScan — CEX Exposure Scanner

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 (no config file — uses CSS @theme)
- Axios for API calls
- No component library — all custom components

## Project Structure
- `src/app/page.tsx` — Single-page app (client component)
- `src/app/api/scan/route.ts` — POST endpoint for scanning
- `src/lib/scanner.ts` — Chain scanners (EVM, Solana, BTC, TRON)
- `src/lib/cex-addresses.ts` — CEX address database with O(1) lookup maps
- `.env.local` — ETHERSCAN_API_KEY

## Commands
- `pnpm dev` — Start dev server (port 3002)
- `pnpm build` — Production build
- `pnpm lint` — ESLint

## Design System
- Dark-only theme: bg #0a0a0a, text #ededed
- Accent: red-500/red-600 (brand), amber for warnings/indirect
- Cards: rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6
- Inputs: rounded-xl border-zinc-700 bg-zinc-800
- Buttons: rounded-xl bg-red-600 hover:bg-red-500
- Font: Geist Sans (UI) + Geist Mono (addresses, hashes)
- Risk colors: emerald (none), yellow (low), orange (medium), red (high/critical)

## Code Conventions
- Single page.tsx — all UI in one client component
- Types duplicated in page.tsx (client) and scanner.ts (server) — no shared imports
- Scanner functions return ScanResult, buildResult() computes risk scoring
- CEX addresses stored as flat arrays, compiled into Maps at module load
- Etherscan V2 API with Blockscout fallback for EVM
