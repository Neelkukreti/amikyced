# KYCScan QA Report
**Date**: 2026-03-12
**Target**: http://localhost:3002
**Session**: kycscan-qa

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 2 |
| Low | 2 |
| Info | 1 |
| **Total** | **6** |

---

## ISSUE-001 — 404 Resource Errors on Every Scan (High)

**Type**: Console Error
**Severity**: High
**Repro Video**: N/A (static on every scan)

**Description**: Every scan triggers 4 `Failed to load resource: 404` errors in the browser console. These fire consistently on both ETH and SOL scans. The exact URLs are not exposed by the console API, but they appear to be asset requests (likely exchange logo images in `public/exchanges/` that are referenced in results but missing from the public directory).

**Evidence**: `./screenshots/06-scan-complete.png`, `./screenshots/13-sol-scan-result.png`

**Console output**:
```
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
```

**Steps to reproduce**:
1. Open http://localhost:3002
2. Enter any valid address and scan
3. Open browser devtools → Console
4. Observe 4 × 404 errors

---

## ISSUE-002 — Error Message Below Fold on Invalid Address (Medium)

**Type**: UX
**Severity**: Medium
**Repro Video**: N/A

**Description**: When a user submits an invalid address, the error message `ERR Could not detect blockchain. Supported: EVM (0x...), Solana, Bitcoin, TRON (T...)` appears below the fold — not visible without scrolling. The user sees no immediate feedback at viewport height, which could make them think the form did nothing.

**Evidence**: `./screenshots/14-invalid-address-error.png`

**Steps to reproduce**:
1. Type `notavalidaddress123` in the address field
2. Click Scan Wallet
3. The error renders below the exchanges toggle — user must scroll to see it

**Suggested fix**: Scroll the error into view automatically, or display a brief inline validation message near the input before/instead of waiting for the API round-trip.

---

## ISSUE-003 — "resize" Command Not Supported (Medium / Test Infrastructure)

**Type**: Testing gap
**Severity**: Medium
**Repro Video**: N/A

**Description**: `agent-browser resize` is not a supported command, so responsive/mobile layout could not be verified programmatically. Mobile layout at 375px was not tested.

**Evidence**: `[error] Unknown command: resize`

**Recommended action**: Manually verify mobile layout at 375px and 768px breakpoints.

---

## ISSUE-004 — Vitalik.eth Shows Threat Score 100 / Grade F (Low / Data)

**Type**: Data accuracy
**Severity**: Low
**Repro Video**: N/A

**Description**: Scanning `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (vitalik.eth) returns Threat Score 100 and Reputation F. This is technically correct (many exchange interactions), but for a well-known public figure's address it could confuse users — they may wonder if the tool is malfunctioning when they test with vitalik.eth as a demo.

**Evidence**: `./screenshots/06-scan-complete.png`

**Note**: Not a bug — the scoring logic is working as designed. Consider adding a note in the UI when a celebrity/notable wallet is detected that the score reflects all exchange interactions, not just "risky" ones.

---

## ISSUE-005 — Lit Dev Mode Warning on Every Load (Low)

**Type**: Console Warning
**Severity**: Low
**Repro Video**: N/A

**Description**: `Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode` appears in the console on every page load. This comes from RainbowKit's wallet modal (which uses Lit web components internally). Not user-visible but will appear in production console.

**Steps to reproduce**: Open the app and check browser console.

**Fix**: Set `NODE_ENV=production` in the build or ensure `pnpm build` is used for production deploys (this is a dev-mode warning that disappears in production builds).

---

## ISSUE-006 — All Core Flows Passing (Info)

**Type**: Info
**Severity**: N/A

The following flows were verified working:

| Flow | Status |
|------|--------|
| Landing page loads, hero animation visible | ✅ PASS |
| ETH address scan (vitalik.eth) | ✅ PASS — results in ~39s |
| SOL address scan | ✅ PASS — results in ~10s |
| Threat score + reputation grade display | ✅ PASS |
| 2-hop indirect exposure panel | ✅ PASS |
| "2-hop indirect exposure hidden" banner (unauthenticated) | ✅ PASS |
| Indexed exchanges toggle opens/closes | ✅ PASS — 385 exchanges shown |
| Connect Wallet modal opens (Rainbow, MetaMask, WalletConnect) | ✅ PASS |
| Connect Wallet modal closes via Close button | ✅ PASS |
| Invalid address error message shown | ✅ PASS (below fold — see ISSUE-002) |
| Scan button disabled when input empty | ✅ PASS |
| "What do these scores mean?" accordion | ✅ PASS |
| Chain selector (AUTO/ETH/SOL/BTC/TRX) | ✅ PASS |

**Note**: Upgrade modal, deep scan tooltip (requires auth), and BTC scan could not be verified in this unauthenticated session.
