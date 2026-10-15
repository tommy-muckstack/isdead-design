# Parity QA — making an IsDead app look identical to the app it clones

Goal: landing page, login/signup, and in-app screens are visually and structurally the same as the original, with
feature parity. Never copy logos, brand marks, photos, proprietary art or proprietary fonts: recreate them in an
original style (same size, position, colour role). Brand-specific copy gets original wording; layout/structure matches.

Tooling: `/workspace/isdead-design/scripts/` (`npm i` once there). Outputs go to `/workspace/isdead-shots/parity/<app>/`.

## 0. Setup (once per app)
1. Copy `parity/calendly.json` to `parity/<app>.json`. Fill `pages[]`: `{name, orig, clone, full, origMust?, actions?}`.
2. Check the original for A/B tests (view it in 3 fresh contexts; look at `statsig`, `optimizely`, `launchdarkly` calls).
   If it flips, capture a storageState that yields the variant you are matching (`origStorage`) and use `origMust`
   (text that must be present) as a retry guard. Mobile UAs sometimes get a different variant — document it.
3. Logged-in originals: ask the parent to dispatch a computerUse capture (shared desktop, existing logins only) or use
   an existing `origStorage`. Never sign up for originals yourself.

## 1. Capture + diff
```
node scripts/parity.mjs --config parity/<app>.json --viewports 1440x900,390x844 --out /workspace/isdead-shots/parity/<app>/iter
# fast clone-only loop (reuse original shots):  add  --reuse-orig   |  one page:  --only login
# ad hoc without a config: --orig https://x.com --clone http://localhost:3000/app --pages /,/login
```
Per page+viewport: `<page>-<w>-orig.png`, `-clone.png`, `-sbs.png` (side by side), `-diff.png`, and `report.md/json` with
a score (0–100): content-normalised pixel diff + coarse blurred similarity, minus height-ratio and horizontal overflow
penalties; 0 if the clone returns ≥400. Dev-overlay, Intercom and cookie banners are hidden, animations disabled.

## 2. Measure, don't eyeball
`node scripts/extract-styles.mjs <url> out.json` dumps computed style + rect for key elements (nav, hero, buttons, h1/h2,
cards, footer). `node scripts/sections.mjs <url>` lists top-level section tops/heights. Compare orig vs clone numbers:
section tops within ±10px, page height within ±2%, font sizes/weights/line-heights, radii, colours, paddings.
`scripts/sbs.py` / `crop.py` crop stacked or side-by-side slices for review (use a fresh filename every view).

## 3. Checklist per page (tick each)
- [ ] Announcement banner (height, colour, text style, dismiss button)
- [ ] Nav: height, logo position, link set + dropdown carets, right-side buttons (login outline, CTA filled), mobile menu
- [ ] Hero: container (card/radius/gradient), headline size/weight/line breaks, subcopy, CTAs, hero art
- [ ] Every section in order: heading, copy length, art, cards/tiles, carousels, logos strip, stats, CTA band
- [ ] Footer: columns, link counts, legal row, social icons
- [ ] Login: provider buttons (order, style), email-first flow, password step, forgot password, signup link, legal text
- [ ] Signup: same plus perks column, "no credit card" copy, error states
- [ ] Pricing: toggle, plan cards (popular highlight), compare table, FAQ
- [ ] Public product surfaces (booking page, share links, profile)
- [ ] In-app: sidebar/topbar, each core screen, empty/loaded states, modals, settings
- [ ] Mobile 390px: no horizontal overflow, menu, stacking order, tap targets
- [ ] Typography: closest OFL font; adjust sizes where the lookalike is wider/narrower
- [ ] Colour tokens, radii, shadows, focus rings, hover states
- [ ] Favicon/title/metadata
- [ ] Feature parity: every original capability exists and works (note gaps explicitly in the report)

## 4. Fix loop
1. Biggest score gap first: landing → login → core app screens.
2. Fix in the app repo (`marketing.css`-style scoped stylesheet; don't edit shared design tokens without coordinating).
3. `npx tsc --noEmit`, unit tests, e2e. Update e2e selectors that depended on old copy.
4. Commit small focused changes (`git pull --rebase` first). Push to `main` only where authorized; wait for deploy,
   then re-capture the live URL and attach before/after side-by-sides.

## 5. Report
Per-app table: page × viewport score, before → after, known deviations (A/B variant, proprietary art, unsupported
provider, copy differences). Link `before/` and `after/` sbs images.
