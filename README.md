# A Shop of Small Miracles

A storybook shop sim about brewing small kindnesses for a cold town. Three primary essences go into the cauldron; customers ask for two tags without naming them; rent is real and none of the three endings is a failure. Mobile-first SvelteKit PWA, offline after the first load, local saves.

## Run it

```bash
pnpm install
pnpm exec playwright install   # once, for the e2e suite
pnpm dev                       # http://localhost:5173
```

The game is client-rendered (`ssr = false`) and builds to a static site with `@sveltejs/adapter-static` and `200.html` as the SPA fallback.

## Verify it

```bash
pnpm test          # unit + component tests (Vitest, Testing Library)
pnpm e2e           # Playwright suite against the built app
pnpm check         # svelte-check
pnpm lint          # prettier --check + eslint
pnpm validate      # content invariants (elements, tags, visits, chapters)
pnpm build         # static build in build/
pnpm preview       # serve the production build
pnpm check:bundle  # 180 KB gzip budget for initial JS
pnpm pwa:assets    # regenerate icons from static/favicon.svg
pnpm deploy        # build and deploy to Cloudflare Workers
```

`pnpm test:e2e` and `pnpm e2e` both run Playwright; the configured web server builds the app and serves the production preview itself. The suite covers the first customer, mid-day resume, rent setbacks, all three endings, the PWA/offline reload, keyboard-only play, 44 px targets, and axe audits of Shop, Market, Book, Journal, and Settings.

## Content authoring

All content is typed data under `src/lib/data/` and validated by `pnpm validate`.

- **Elements** live in `elements.ts`: 30 records with a primary and secondary essence, a price, and a distinct pair. Only the primary essence brews.
- **Essences** live in `tags.ts`: 18 tags. Every primary tag appears on the shelf; tags are always shown as text plus an inline icon, never colour alone.
- **Potions** live in `potions.ts`: 24 named tag pairs with effect prose. Unknown pairs still brew and get a generated name in the recipe book's Unfiled section.
- **Customers** live in `characters.ts`: 30 characters and 63 visits. Each visit has request prose, exactly two desired tags, clean/side-effect/decline lines, and a chapter. Three recurring arcs have fixed days in `chapters.ts`.
- **Chapters** live in `chapters.ts`: 21 days, 7-day chapters, rent on days 7/14/21, and a beat for every day.
- **Upgrades** live in `upgrades.ts`: 12 upgrades, at most one bought per evening.
- **Story choices** live in `choices.ts`: one authored choice per chosen morning; the first option is the kind path. Flags are limited to the authored set.
- **Endings** live in `endings.ts`: The Shop Endures, The Last Miracle, and A Quiet Closing. `game/story.ts` decides from reputation, relationships, flags, and setbacks.

Run `pnpm validate` after editing content. It checks element, potion, character, visit, upgrade, and ending counts and uniqueness; tag validity; that every visit's two tags are reachable from three shelf units; chapter and rent coverage; choice days and flags; and relationship bounds.

### The eligibility invariant

Customers are stock-aware. A visit is only offered when the current shelf can actually produce both of its requested tags from three ingredients, so no request is ever unwinnable. If no eligible visit remains, the day becomes a **quiet day**: a short beat, no penalty, and the market still opens. The seeded RNG state is stored in the save, so the same seed and day reproduce the same visitors and market offers after a reload.

### Soft stakes

There is no game-over state. Missing rent is a setback: the landlord takes the most expensive upgrade or one unit of shelf capacity, reputation drops by 2, coins are set to 10, and the setback is recorded toward the ending. The shop always continues, and a quiet closing is still framed as a choice rather than a punishment. No ending is labelled "bad".

## Saving

Progress lives in `localStorage` under `small-miracles:save:v1`. Every customer, brew, purchase, and phase change autosaves. A save that cannot be parsed (wrong version, impossible day, malformed fields) falls back to a fresh day-one shop with a dismissible recovery notice. Reset progress is two-step and keeps the sound and reduced-motion settings.

## PWA and offline

The manifest and service worker are generated during `pnpm build`; the icon PNGs are generated once by `pnpm pwa:assets` and copied into the build. After one online load the shop opens offline and resumes the exact day. A new build shows a "A new page is ready" prompt instead of reloading mid-service. Install guidance lives in Settings, with an install button when the browser offers one. To regenerate icons after changing `static/favicon.svg`:

```bash
pnpm pwa:assets
```

The icon config (parchment maskable/apple backgrounds) is in `pwa-assets.config.ts`; rerun `pnpm pwa:assets` whenever `static/favicon.svg` changes.

## CI

GitHub Actions runs the full gate on every push and pull request: `validate`, `check`, `lint`, `test`, `build`, `check:bundle`, and `e2e` (Chromium). The workflow is `.github/workflows/ci.yml`.

On a push to `master`, the deploy job runs when these repository secrets exist:

- `CLOUDFLARE_API_TOKEN` — a token with **Workers Scripts: Edit** (and account read) for this account.
- `CLOUDFLARE_ACCOUNT_ID` — `f4f10fe90a6523c4c7702edfe15e14cc`.

Add them under **Settings → Secrets and variables → Actions**. Without them the deploy step is skipped and CI still verifies the app.

## Deploy

The shop runs on Cloudflare Workers static assets. `pnpm deploy` builds the app, mirrors `200.html` to `index.html` (Workers serves `/` from `index.html`), and runs `wrangler deploy` with `wrangler.jsonc`.

Live at:

- https://shop-of-small-miracles.alexionutale.workers.dev
- https://shop-of-small-miracles.aiu-media.com

`wrangler.jsonc` sets `assets.not_found_handling: "single-page-application"`, so unknown routes fall back to the shell. The service worker precaches `/` as the navigation shell; a host without the SPA fallback would break first install. Any static host works the same way — serve `build/` and rewrite `/` to `200.html` (or `index.html` after the copy). No server, database, accounts, or API keys.

## Accessibility

The game is playable by keyboard and screen reader: native buttons and inputs, visible focus rings, focus contained in the reset dialog and restored on close, a persistent polite live region for brew results, payments, and rent outcomes, reduced-motion support (setting or OS preference), 44 px targets, and 4.5:1 text contrast. `e2e/a11y.spec.ts` runs axe on every screen and a tab-driven playthrough.
