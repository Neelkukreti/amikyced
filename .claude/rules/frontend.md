---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
---

# Frontend Design Rules

## Layout
- Dark-only. Never add light mode or light backgrounds
- Max width: max-w-4xl mx-auto px-6
- Section spacing: space-y-6 between result cards
- Cards: rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6

## Colors (Tailwind classes only)
- Background: bg-[#0a0a0a] (page), bg-zinc-900/50 (cards), bg-zinc-800 (inputs)
- Borders: border-zinc-800 (default), border-zinc-700 (inputs)
- Text: text-white (headings), text-zinc-400 (secondary), text-zinc-500 (muted)
- Accent: text-red-500 / bg-red-600 (primary action)
- Risk: emerald-400 (clean), yellow-400 (low), orange-400 (medium), red-400 (high), red-500 (critical)
- Indirect/warning: amber-400/amber-500

## Typography
- Headings: font-semibold or font-bold, text-white
- Body: text-sm text-zinc-400
- Wallet addresses & hashes: font-mono text-xs
- Labels: text-xs text-zinc-500

## Interactive Elements
- Buttons: rounded-xl px-8 py-3 text-sm font-semibold
- Primary: bg-red-600 hover:bg-red-500 text-white
- Disabled: disabled:opacity-40 disabled:cursor-not-allowed
- Links/badges: rounded-lg border border-zinc-700 px-3 py-1 text-xs hover:border-zinc-500
- Inputs: rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30

## Patterns
- Direction badges: IN = emerald, OUT = red, 2H = amber
- Stat cards: rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3
- Risk bar: h-3 rounded-full bg-zinc-800 with colored fill
- Transaction rows: flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 px-4 py-3
- Loading: animate-spin SVG spinner inside button