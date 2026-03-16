# KYCScan Design System

## Direction
- **Personality:** Data & Analysis + Precision
- **Domain:** Blockchain intelligence, forensics, tracing, exposure analysis
- **Foundation:** Cool (slate-blue undertone)
- **Depth:** Borders-only — no box-shadows, no glows
- **Signature:** The trace line connecting wallet nodes

## Tokens

### Spacing
Base: 4px
Scale: 4, 8, 12, 16, 24, 32, 48, 64
→ Tailwind: p-1, p-2, p-3, p-4, p-6, p-8, p-12, p-16

### Surfaces (dark mode — higher = lighter)
- `--ink`:        #09090f  (level 0 — page background)
- `--surface-0`:  #0e0e16  (level 1 — cards, sections)
- `--surface-1`:  #13131d  (level 2 — raised cards, dropdowns)
- `--surface-2`:  #181824  (level 3 — inputs, inset controls)

### Text
- `--primary`:    #e8e8f0  (headlines, values, emphasis)
- `--secondary`:  #a8a8be  (body text, descriptions)
- `--tertiary`:   #70708a  (labels, captions, metadata)
- `--faint`:      #50506a  (disabled, decorative)

### Borders
- `--edge`:        rgba(255, 255, 255, 0.06)  (default — barely visible)
- `--edge-strong`: rgba(255, 255, 255, 0.10)  (hover, emphasis)
- `--edge-focus`:  rgba(255, 60, 80, 0.35)    (focus rings, active)

### Semantic (color = meaning, never decorative)
- `--threat`:   #ef4444  (danger: sanctions, critical risk, sent funds)
- `--caution`:  #f59e0b  (warning: indirect exposure, suspected, medium risk)
- `--safe`:     #34d399  (clean: no risk, received funds, good reputation)
- `--info`:     #60a5fa  (neutral info: smart money, protocols, links)
- `--accent`:   #ff3350  (brand: CTA buttons, logo highlight)

### Radius
Scale: 4px (inputs, badges) → 8px (cards, sections) → 12px (modals, hero)
→ Tailwind: rounded, rounded-lg, rounded-xl

### Typography
- Headlines: font-sans, font-bold (not black), tracking-tight
- Body: font-sans, font-normal, text-sm (14px)
- Labels: font-sans, font-medium, text-xs (12px), uppercase tracking-wide
- Data: font-mono, tabular-nums, text-sm (14px)
- Sizes used: 12, 14, 16, 20, 24, 36 (6 levels max)

## Animation
- Micro (hover, focus): 150ms ease-out
- Entry (cards, sections): 200ms ease-out
- Data reveal (scores): 400ms cubic-bezier(0.16, 1, 0.3, 1)
- No bounce. No spring. No glow pulse. This is intelligence software.

## Patterns

### Card
border border-[var(--edge)] bg-[var(--surface-0)] rounded-lg p-4
hover: border-[var(--edge-strong)]
No shadow. No transform.

### Stat
border border-[var(--edge)] bg-[var(--surface-0)] rounded-lg p-4
Label: text-xs font-medium uppercase tracking-wide text-[var(--tertiary)]
Value: text-lg font-semibold text-[var(--primary)] tabular-nums

### Input
bg-[var(--surface-2)] border border-[var(--edge)] rounded-lg
px-4 py-3 text-sm font-mono text-[var(--primary)]
focus: border-[var(--edge-focus)] outline-none

### Button Primary
bg-[var(--accent)] text-white rounded-lg px-6 py-3
text-sm font-semibold
hover: brightness-110
disabled: opacity-40

### Badge
rounded border px-1.5 py-0.5 text-[11px] font-medium
Color from semantic tokens based on meaning

## Decisions
| Decision | Choice | Rejected | Why |
|----------|--------|----------|-----|
| Depth | Borders-only | Shadows, glows | Intelligence tool = technical, precise |
| Emoji badges | Remove | Keep emoji in badges | Emoji = playful. Entity types use text labels |
| Noise overlay | Remove | Keep SVG noise | Adds texture but screams "AI-generated" |
| bg-mesh gradient | Remove | Keep radial gradients | Decorative, not meaningful |
| Glitch animation | Remove | Keep on logo | Gimmick. Logo should be still and confident |
| Card hover lift | Remove | Keep translateY(-1px) | Movement without purpose. Borders shift on hover instead |
| Score font-black | font-bold | font-black (900) | Black weight screams; bold is confident |
| Max width | max-w-6xl | max-w-7xl, max-w-5xl | 6xl (1152px) balances density with readability |
