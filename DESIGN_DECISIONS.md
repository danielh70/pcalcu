# Design decisions — black + orange overhaul

One line per decision. Running log in execution order.

## Task A — theme.js + Button override

- **Primary orange**: `#F57C00` (DeWalt/tool-brand midrange; #FF6B00 too loud, #E65100 loses punch on phone).
- **Secondary**: `#2E2E2E` — 20 units above paper `#1A1A1A`, real surface separation on OLED instead of "same color, slightly wrong."
- **Background split**: `default #0E0E0F` (not pure black — pure black looks OLED-cheap and shows every smudge) / `paper #1A1A1A` one notch lighter.
- **Error red**: `#E53935` — cool red, distinct from primary orange at a glance.
- **Disabled state**: decoupled from primary — desaturated grey (`#2E2E2E` bg + white@50% text = 4.65:1). Dimming orange over near-black gave 1.36:1 (fails AA).
- **Typography**: Inter 400/500/600/700 sans, Roboto Mono 400/500/700 numeric. Custom `numericLarge/numeric/numericSmall` variants registered so readouts render identically across TapeCalc and Systems.
- **Shadow strategy**: elevation via contrast (brighter paper + hairline 8% white border). Hover/focus uses orange-tinted halo, not blur. Real shadows reserved for menus/dialogs.
- **Button min-height**: 44px contained-primary (Apple HIG), 40px everything else (a row of 3+ buttons at 44 each turns any panel into a wall of chunky rectangles).
- **Button text-transform**: `none`. Industrial brands don't need to shout in all caps.

## Task B — App shell

- **AppBar**: `background.default #0E0E0F` (not `primary`). Chrome, not a colored ribbon — the orange lives on accents, not backgrounds.
- **Logo mark**: monoline tape measure (body rect + spool hub + tongue + 4 tick marks) in orange — picked tape over level bubble because TapeCalc is the primary feature; ticks signal "measurement app" in one glance.
- **Tab indicator**: 3px (up from MUI default 2px) in primary orange with top-corner radius — legible outdoors, and the rounded top reads less like a ruler underline.
- **Tab selected state**: white text + weight-700 bold; inactive tabs stay at `text.secondary` for clear hierarchy without icons or chips.
- **Double-border removed**: the explicit `<Divider>` under `<Tabs>` got dropped — the new `MuiTabs` override owns its own `borderBottom`, and stacking both looked like a seam.
- **Card surface**: `background.paper #1A1A1A` with 1px `divider` border, 10px radius, no shadow. Elevation via contrast (paper vs default), not blur.
- **Card radius**: 10px. 8px reads too utilitarian against the rest, 14px reads too consumer-app; 10px splits the difference and matches the 8px button radius without repeating it.
- **index.css cleaned**: body background/font now owned by `CssBaseline` + theme; removing the light-grey body background that was fighting the dark theme.

## Task C — Systems tab

- **Section overline**: added a single "SPINDLE SPACING" overline above the form — the tab is "Systems" (plural) and needed one word of framing. Rolled back an h3 "Gap between spindles" that duplicated the result label.
- **Input font**: `Roboto Mono` on the `OutlinedInput.input`. Fractions like `7 7/8` are numerics — sans for the label, mono for the value.
- **Input border**: 1px `divider` default → `alpha(white, 0.20)` on hover → 2px `primary.main` on focus → `error.main` on error. Focus is intentionally bold; field must be findable at a glance on a sunny site.
- **Button hierarchy**: `Go` = contained-primary, size `large` (48px), full-width. `Reset` = text button, size `small`, centered below — deliberately smaller so the primary action is unmistakable.
- **Reset colour**: moved off `color="error"` (red) → `color="primary"`. Reset isn't destructive in a dangerous-data sense, and red competes with the error helper text when input is invalid.
- **Result**: `numericLarge` variant (Roboto Mono 500, scales 2.25rem → 2.75rem), rendered in primary-orange when populated, in `text.disabled` for the `—` placeholder. Orange on the answer is the payoff for the whole screen.
- **Divider above the readout**: thin `divider` line to split input/action from output. Cheaper than nesting a second Paper and reads clearly.
- **Helper text**: preserved exactly — empty when valid, error message when invalid. No added placeholder copy; that would have been a content change dressed as a visual one.
- **Kept as-is**: `id='spindle-length-input'`, `name='length'`, `label='Length'`, button labels `Go` / `Reset`, result rendered as plain text; all computation, state, and handlers unchanged.
- **Bug I introduced and fixed**: changed the "Gap:" label to "Gap" mid-edit — broke `App.test.js` which asserts `/gap:/i`. Restored the colon; test back to green. Lesson: "preserve every label" includes punctuation.

## Task D — Panel tab (interpreted as PostLevel.js)

- **Ambiguity call**: user said `Panel.js`, no such file exists. Only candidate is `PostLevel.js` — commented out of `App.js`. Treated as Panel; did NOT re-enable in App (would be a routing change beyond visual scope). If wrong target, ping and I'll rework.
- **Diagram palette**: replaced hard-coded `#2e7d32` / `#424242` / `#bdbdbd` with `primary.main` / `text.secondary` / `divider`. Orange now marks the base/reference post — consistent with "orange = the answer" elsewhere in the app.
- **Diagram dot grid**: inverted from `rgba(0,0,0,0.07)` dots on light grey to `rgba(255,255,255,0.06)` dots on `background.default`. Same density, reads as engineering paper rather than a CAD printout.
- **Table header**: moved from `grey.100` to `secondary.main` (#2E2E2E) — solid industrial band, not a washed tint. Zebra rows at white@2.5% so striping is felt, not seen.
- **Cut-list "Cut At" column**: styled in `primary.main` bold. The reading and extra columns are neutral; the cut length is the thing the carpenter actually wants — payoff column gets the colour.
- **Post label style**: flipped from sentence-case body text to uppercase overline-ish caption (0.75rem, letter-spaced, `text.secondary`) to match the rest of the new type system.
- **Action hierarchy**: Go = contained-primary size-large full-width, Reset = small text button below — matching Systems exactly. Upload Photo / Add Post = outlined-primary pair, full-width on mobile, side-by-side on sm+.
- **Remove-row IconButton**: now shows `error.main` only on hover (muted `text.secondary` at rest) — destructive affordance without visual noise at idle.
- **Target height inputs**: kept side-by-side at 110px each (slight bump from 90 for Roboto Mono legibility); number inputs inherit mono font from the global MuiOutlinedInput override.
- **Pin number font**: switched to Roboto Mono — "1" / "2" / "3" on circles are numerics and should match the readout typography.

## Task E — TapeCalc orange alignment

- **Two colour swaps** in `TapeCalc.css`: `#f5a623` → `#F57C00` (operator text + pressed background), `#d4891a` → `#D96C00` (pressed-active darker state). Preserves the same light/dark relationship; nothing else in TapeCalc touched.

## Task F — TapeCalc viewport-locked layout

- **Lock mechanism**: card gets `height` (not `min-height`) = `100dvh` minus fixed chrome, with a `100vh` fallback line above it. Mobile chrome = 110px (AppBar 56 toolbar + 1 border = 57, Tabs 52 + 1 border = 53 — measured in-browser; `min-height: 52` doesn't absorb the border when the Tab items are exactly 52); desktop = 258px (adds .App/panel paddings + card margins). Numbers are safe because the theme pins Toolbar/Tabs heights explicitly. Verified pixel-exact via Playwright: body scrollHeight == innerHeight at 390×844 and 1280×900.
- **Breakpoint alignment**: the new height rules use `599.98px / 600px` instead of the file's legacy `600/601` split so they flip exactly where MUI's `sm` breakpoint bumps the Toolbar to 64px — at precisely 600px wide the old split would have been 8px off.
- **Removed `minHeight: 100vh` from `<main>`**: body background is owned by CssBaseline, and TopNav sits *outside* main, so 100vh on main guaranteed ~57px of page scroll on every tab — part of the original bug.
- **Flex order**: history tape (`flex: 1 1 84px`, scrolls internally) → display (`flex-shrink: 0`) → keypad (`flex-shrink: 0`, pinned). The tape wrap now renders even when empty so the keypad stays pinned to the bottom.
- **History min-height is a flex-basis, not a hard min**: spec asked for "~2 entries min", but a hard 84px min plus the 44px key floors clips the = key on short viewports (iPhone SE with Safari chrome ≈ 553px tall). `flex: 1 1 84px; min-height: 0` prefers ~2 rows and yields gracefully — the tape stays usable because it scrolls.
- **Tape direction flipped to oldest→newest** (newest at bottom, adjacent to the display) — matches the adding-machine tape metaphor; short tapes bottom-anchor via `margin-top: auto`. Auto-scroll pins to bottom via a `useEffect` on `history`. Storage stays newest-first (reducer/localStorage/tests untouched); only the render reverses.
- **Key compression**: `min-height: clamp(floor, Xdvh, cap)` with a vh fallback line — num/action/FRAC 44→70px @7.5dvh, operators 44→54px @7dvh, equals 44→58px @7.5dvh, quick-fracs 40→50px @6.5dvh. Floors: 44px primary / 40px secondary per spec.
- **Extreme-short escape hatch**: below 520px viewport height (phone landscape) even the floors can't fit, so `.tc-calc` gets `overflow-y: auto` — the *tab* scrolls internally; the page stays locked. The display also compresses (min 80→56px) below 620px.
- **Landscape phones are width-desktop, height-tiny**: an 844×390 phone hits the `min-width: 600` branch, whose 530px card floor forced page scroll. Added `(min-width: 600px) and (max-height: 520px)`: strip .App/panel padding (scoped via `.App:has(.tab-content-card--tapecalc)` + an sx max-height override on the TabPanel), pin the card to `100dvh − 134px`, and let the internal scroll take over. Verified: page locked, = reachable by scrolling inside the calc.
- **Desktop card**: locked between `min-height: 530px` (below that the content floor doesn't fit and the page may scroll) and `max-height: 780px` (above that keys grow comically on tall monitors).
- **= disabled state**: replaced `opacity: .35` (blended to ~2.1:1 against the keypad — the flagged illegibility was real) with explicit `#9e9e9e` on `#3f3f43` ≈ 3.9:1 — passes WCAG large-text 3:1 while still reading as muted. Only `=` ever disables; no other keypad key has a disabled state.
- **Safe-area padding moved** from `.tc-calc` to `.tc-keypad` as `calc(6px + env(safe-area-inset-bottom))` (8px desktop), and mirrored on the FRAC overlay so its buttons don't extend into the home-indicator zone.
- **100vh audit**: the only remaining `100vh` usages are the intentional fallback lines directly above their `100dvh` counterparts.
- **Flagged, not fixed (out of scope)**:
  - `.tc-eq` teal `#2a7c8c` and the steel-blue `#3a4a5c`/`#a8c4e0` quick/FRAC keys predate the orange rebrand — TapeCalc's accents are still off-palette.
  - `#ff3b30` (iOS system red) on `.tc-clear`, `.tc-main--error`, confirm-clear — not the theme error `#E53935`.
  - `Frame.js` and the `.frame` block in App.css are dead while PostLevel is commented out; `src/logo.svg` is an unused CRA leftover.
  - `fraction.js` is imported in 4 files but not declared in package.json (only `fraction@0.2.0` is, which nothing imports) — it resolves via a transitive install today; fragile.
  - Pre-existing test failure (also fails on clean HEAD): `Systems.test.js` › "uses alternate branch when landing on a spindle" (expected `1 3/8`, got `3 9/16`).

## Task G — Square Check tab

- **Parsing/formatting reused, not rewritten**: all input goes through `parseLength`, rounding through `closestSixteenth`, display through `formatLength(…, { unit: 'auto' })` — so `6' 3 1/2`, `20'`, `45 3/4` all work identically to the rest of the app, and diagonals ≥ 12" auto-display as feet + inches.
- **Deviation compares against the *rounded* target, not the exact root**: the carpenter reads the displayed target (rounded to 1/16") off the screen and pulls a tape to it — if their measurement matches what the app told them, it must say "Square," not "1/16 off" because of sub-1/16 float dust. Tested explicitly with the 1-1-√2 case.
- **Zero-length legs rejected**: `parseLength('0')` is valid input elsewhere, but a 0" leg makes a degenerate triangle, so the calc functions throw `Invalid length` and the field shows the standard error helper.
- **Live calculation, no Go button**: three fields, pure derivation, nothing destructive — results update as you type (per-field validation errors only show once the field is non-empty). Kept the small centered text `Reset` from the Systems pattern.
- **Legs side-by-side**: Leg A / Leg B share one row so target + measured stay above the fold on a 390×844 phone; measured diagonal gets its own full-width row since it's the longest value you'll type.
- **Diagram**: single inline SVG (~10 elements), legs in `text.secondary`, diagonal C in `primary.main` — orange marks the answer, consistent with the rest of the app. `aria-hidden` since the labels A/B/C are decorative; the TextFields carry the real names.
- **Square = MUI default `success.main` green + CheckCircle icon**; off-square deviation renders in `error.main` red (`5/16" too long`). Theme defines no success colour, so this leans on MUI's dark-mode default (#66bb6a) rather than adding a palette entry for one state.
- **Deviation string is one template literal** (`` `${deviation}" too ${status}` ``), not JSX fragments — keeps it a single DOM text node so tests (and screen readers) see one phrase.
- **Test filename**: spec suggested `SquareCheck_test.js`; repo convention is `*.test.js` (Systems.test.js, TapeCalc.test.js) and CRA's jest only picks up that pattern, so it's `SquareCheck.test.js`.
- **Tab plumbing only in App.js**: new import + `<Tab>` + `<TabPanel index={2}>` in the standard `tab-content-card`; Systems, TapeCalc, and the commented-out PostLevel block untouched. Nothing needed disabling, so no TEMPORARILY DISABLED markers were added.
- **Suite status**: 84 passed / 1 failed — the failure is the pre-existing Systems spindle-branch test documented in Task F, unaffected by this change.

## Task H1 — iOS smart punctuation fix (measure.js)

- **Fixed at the parser, not per-field**: `parseLength` normalizes ‘ ’ ′ → `'` and “ ” ″ → `"` before parsing, so every consumer (TapeCalc, Systems, Square Check, future) is covered at once. Unicode prime/double-prime included because they're the *semantically correct* feet/inch marks — some keyboards emit them deliberately.
- **Normalization happens before validation**, so `12’’` still throws exactly like `12''` — smart quotes get no more leniency than straight ones (tested).
- **Belt-and-suspenders on fields**: `autoCorrect="off" autoCapitalize="none" spellCheck={false}` added to the Square Check leg inputs via a shared `LENGTH_INPUT_PROPS`. NOT added to the Systems length field — Systems is off-limits per task rules; the parser-level fix covers it regardless.
- **Tests live in TapeCalc.test.js** with the rest of the parseLength coverage (measure.js has no dedicated test file; parser tests have always ridden along there).

## Task H2 — Square Check simplification

- **Measured-diagonal + deviation UI disabled, not deleted**: state, memo, imports, and JSX are commented out with TEMPORARILY DISABLED markers; `checkSquare` stays exported (pure, harmless) so re-enabling is an uncomment, not a rewrite. Its tests are `describe.skip`/`test.skip` with the same marker.
- **Added a live test** asserting the measured-diagonal input is NOT rendered — so the disabled state is itself pinned by a test.
- **Spacing**: card gap 2.5 → 3 and diagram 170 → 190px wide so the shorter card doesn't feel hollow.

## Task H3 — TapeCalc redesign (mobile-first overhaul)

**Diagnosis of the old layout:** operators sat in a horizontal row at the *top* of the keypad — the single hardest one-thumb reach on a phone; every calculation forced a trip to the far corner. Six stacked key rows squeezed key heights. The skin was off-brand (Task F flagged it): iOS-gray `#505055` keys, steel-blue `#3a4a5c` fraction keys, teal `#2a7c8c` equals, iOS-red `#ff3b30`. Unit cycling (tap the result) was undiscoverable. The empty tape was a dead black band on first launch.

**What was deliberately preserved** (validated, per spec): the reducer state machine and all ACTIONS, FRAC flip-panel paradigm, quick-frac strip membership (`'` `1/2` `1/4` `3/4` `1/8`), history tape with localStorage raw-fraction persistence, recall rows, two-tap clear-history, keyboard input, viewport-locked flex layout (tape grows/scrolls → display fixed → keypad pinned with safe-area), 44/40px floors, and the whole test contract (aria-labels, testids).

- **Operator column, not operator row**: ÷ × − + now run down the right edge (iOS-calculator convention) where the right thumb rests. Digits go 7-8-9 top (desk/iOS calculator muscle memory, not phone-dial) in a 4-column grid: three digit columns + op column.
- **Bottom-corner priorities**: FRAC moved to the bottom-left of the grid — it's the app's signature key and was buried mid-row; ⌫ sits next to 0. Final row is `[C][===== = =====]` — C gets a real key (error recovery) at the corner, = gets 3 columns of width at the absolute bottom where the thumb naturally lands, never below the fold.
- **Fraction-family color**: everything fraction-related (quick fracs, FRAC key, overlay grid) wears a warm orange-tinted surface (`rgba(245,124,0,.12)` + `#FFB35C` text) replacing the off-palette steel blue — "fractions are the point" now reads at a glance, and it's derived from brand orange rather than a new hue.
- **Orange = the answer, here too**: the main readout turns `#F57C00` in the result phase (white while typing, `#E53935` theme red on error — replacing iOS `#ff3b30` everywhere in the tab). `=` is the only filled-orange key (matches containedPrimary), so the eye path is *type → orange = → orange answer*.
- **Unit chip**: a small bordered pill (IN / FT-IN / DEC) appears beside the result when cycling is available and taps through the same cycle — making the previously invisible tap-to-cycle featurediscoverable. It's a separate button so the result element's text (asserted by tests) stays clean.
- **Tape empty state**: one muted line ("Results land here — tap a line to reuse it") replaces the dead black band and teaches recall for free.
- **Keyboard**: added `'` → FOOT_MARK to the existing key map.
- **Styling approach — considered and rejected bringing in Tailwind/styled-components**: a keypad is the one place raw CSS beats everything — no ripple/emotion overhead on rapid taps, trivial `clamp()` sizing, zero bundle cost. TapeCalc stays plain CSS; Systems/Square Check stay MUI; brand tokens are shared by value. No new dependency.
- **Old skin preserved, not deleted**: nested `/* */` comments make commenting out a whole CSS file impossible, so the previous skin moved verbatim to `TapeCalc.legacy.css` (TEMPORARILY DISABLED header, not imported, excluded from the bundle) for rollback.
- **Card background** in App.css aligned `#1c1c1e` → `#1A1A1A` (theme paper) — the last surface that wasn't on-palette.
- **Geometry check** (390×844, chrome 110px → 734px card): utility strip clamp(40,6.5dvh,50) + 4 grid rows clamp(44,7.5dvh,70) + equals clamp(48,7.5dvh,58) + gaps/padding ≈ 360px keypad, display ≥ 80px, leaving ~290px of tape (~7 entries) — one row *more* tape than the old six-row keypad. Short-viewport escape hatches (max-height 520/620) carried over unchanged.

**Found during Playwright verification (fixed):**

- **Tab-label wrap broke the viewport lock**: with three tabs at 390px, "Square Check" wrapped to two lines, pushing the Tabs bar past the 53px the locked card subtracts → 14px of page scroll on the TapeCalc tab. Fix in theme.js `MuiTab`: side padding 16 → 10px + `whiteSpace: 'nowrap'`. Verified back to scrollHeight == innerHeight at 390×844 and 382/390 in landscape (calc scrolls internally there, = reachable).
- **Stale operator highlight**: `pendingOp` survives EQUALS by design (reducer untouched), so `+` stayed filled-orange next to a finished result — much louder in the new skin than the old. `aria-pressed` now also requires `phase !== 'result'`; test added.
- **Error message amputation**: "Division by zero" rendered as "ivision by zero" — `overflow: hidden` clips *before* `transform: scale()`, so the shrink-to-fit scale can't rescue text wider than the box (latent in the old skin too). Errors now skip the scale and get a fixed 1.375rem via `.tc-main--error`.
- **Transient screenshot artifact, not a bug**: keys screenshotted immediately after a tap show the 60ms background transition (e.g. a still-orange disabled `=`); computed styles confirmed correct.
