---
name: verify
description: Build, launch, and drive Field Calc (CRA React app) to verify changes at the browser surface.
---

# Verifying Field Calc locally

## Launch

```bash
BROWSER=none PORT=3000 npx react-scripts start   # run in background; ready when curl localhost:3000 → 200
```

- Boots in ~10–20s. `proxy: http://localhost:3001` (server.js) exists but the calculator tabs don't need it.
- Do NOT deploy; local only.

## Drive (headless Chromium via Playwright)

- Playwright is NOT a project dep. Browsers are already cached at
  `~/Library/Caches/ms-playwright` (chromium-1228); install just the npm
  package into a scratch dir: `npm init -y && npm install playwright`.
- Verify at phone viewport `390×844` first — this app is mobile-first.
- Tabs: `getByRole('tab', { name: 'Tape Calc' | 'Systems' | 'Square Check' })`.
  Tab panels are `#tabpanel-<n>`; panels unmount when hidden (state resets on
  tab switch — expected app-wide behavior, not a bug).
- Big readouts use the custom Typography variant class
  `.MuiTypography-numericLarge`.
- Useful input ids: `#spindle-length-input` (Systems), `#square-check-leg-a`,
  `#square-check-leg-b`, `#square-check-measured` (Square Check).
- Layout invariant worth asserting: `document.body.scrollHeight <= window.innerHeight`
  at 390×844 (viewport-locked design, see DESIGN_DECISIONS.md Task F).

## Gotchas

- Key screenshots taken immediately after a tap catch the 60ms background
  transition (a disabled `=` can look orange for one frame) — wait ~100ms or
  read computed styles before calling it a bug. Same for the FRAC overlay's
  150ms fade.
- TapeCalc key selectors: `getByRole('button', { name: 'fractions', exact: true })`
  (plain `fractions` also matches "close fractions"); ops by name
  `divide|multiply|subtract|add`; equals = `calculate`; unit chip =
  `cycle display unit`.
- The viewport lock depends on tab labels staying on ONE line (theme pins
  Tabs to 52px + 1px border) — if a new tab label wraps at 390px, the
  TapeCalc card overflows and the page scrolls. Assert the lock after any
  tab/nav change.

- Console 403 for `https://kit.fontawesome.com/88d11f9c92.js` on every load —
  pre-existing (index.html), ignore.
- Pre-existing red test: `Systems.test.js › uses alternate branch when landing
  on a spindle` — fails on clean HEAD too (documented in DESIGN_DECISIONS.md).
- Length input formats accepted everywhere: `10`, `10 1/2`, `3-1/2`, `12'`,
  `6' 3 1/2"`, decimals like `10.5` (see `src/utils/measure.js parseLength`).
