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
