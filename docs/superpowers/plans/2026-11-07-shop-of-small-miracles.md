# A Shop of Small Miracles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first SvelteKit PWA where the player runs an alchemist's shop for 21 days, brewing three-ingredient potions from essence-tagged elements and serving melancholic customers.

**Architecture:** Pure TypeScript game engine (seeded RNG, tag brewing, eligibility, economy, story) behind a thin Svelte store. SvelteKit renders one client-side game route; static adapter plus `@vite-pwa/sveltekit` deliver the installable app. Content is data, validated by tests.

**Tech Stack:** SvelteKit 2 + Svelte 5 + TypeScript, `@sveltejs/adapter-static`, `@vite-pwa/sveltekit`, Fontsource, Vitest + Testing Library for Svelte, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md`

## Global Constraints

- Work in `/Users/ionutale/developer-playground/shop-of-small-miracles`. Use `pnpm`; Node ≥ 20.
- SvelteKit SPA: `ssr = false`, `adapter-static` with `fallback: '200.html'`.
- 21 days, 3 chapters, 30 elements, 24 named potions, 30 characters / 63 visits, 12 upgrades, 3 endings.
- Brewing uses exactly 3 ingredients; the same element may be used more than once when stock allows.
- Soft stakes only: rent shortfall is a setback, never a game over.
- No unwinnable request: customers are stock-aware; no eligible visit becomes a quiet day.
- All-ages melancholic folklore; no cruelty, gore, or moralizing.
- Mobile-first at 360 px; every flow works by tap and by keyboard.
- Self-hosted fonts only. All art is CSS/SVG generated; no commissioned illustrations.
- Save key: `small-miracles:save:v1`; offline after first load.
- Initial JS ≤ 180 KB gzip.
- Commit after every task.

## Review Focus

1. **Unwinnable customer requests** — eligibility must be proven from current stock; empty eligibility becomes a quiet day, never a dead visit. *Task 5.*
2. **One-brew semantics** — a mismatched brew consumes ingredients and ends the visit without reputation loss; polite decline consumes nothing; Apprentice refunds once. *Task 6.*
3. **Seeded determinism on resume** — the same seed and day reproduce visitors and market offers; reload must not reroll. *Tasks 2, 7, 8.*
4. **Rent shortfall is a setback** — it takes an upgrade or shelf space, drops reputation, and opens a story branch; the run continues. *Tasks 6, 10.*
5. **Ending reachability** — all three endings, including `closedTheShop`, are reachable and distinct. *Task 11.*
6. **Corrupt save recovery** — a fresh save with a visible notice, never a crash. *Task 8.*

## File Map

| Path | Responsibility |
|---|---|
| `src/lib/types.ts` | Shared types and save shape |
| `src/lib/data/tags.ts` | 18 essence tags and display metadata |
| `src/lib/data/elements.ts` | 30 elements, primary/secondary tags, prices |
| `src/lib/data/potions.ts` | 24 named potions |
| `src/lib/data/sideEffects.ts` | Side-effect tables per tag |
| `src/lib/data/characters.ts` | 30 characters, 63 visits |
| `src/lib/data/chapters.ts` | 21-day manifest, rents, recurring days |
| `src/lib/data/upgrades.ts` | 12 upgrades |
| `src/lib/data/endings.ts` | 3 endings and conditions |
| `src/lib/game/rng.ts` | Seeded Mulberry32 |
| `src/lib/game/validate.ts` | Content validator |
| `src/lib/game/brew.ts` | Tags, potency, judgment, pay |
| `src/lib/game/eligibility.ts` | Stock-aware visit selection, quiet day |
| `src/lib/game/economy.ts` | Market, stock, upgrades, rent |
| `src/lib/game/day.ts` | Phase transitions, chapters |
| `src/lib/game/story.ts` | Flags, relationships, ending selection |
| `src/lib/game/storage.ts` | Save/load/parse/reset |
| `src/lib/stores/game.ts` | Writable save store + actions |
| `src/lib/components/*` | Screens and UI pieces |
| `src/lib/styles/*` | Parchment tokens, type, paper |
| `src/test/setup.ts` | Jest-dom setup |
| `scripts/validate-content.ts` `scripts/check-bundle.mjs` | CLI checks |
| `e2e/*.spec.ts` | Playwright flows |

---

### Task 1: Scaffold, SvelteKit SPA, fonts, and smoke test

**Files:**
- Create: `package.json`, `vite.config.ts`, `src/routes/+layout.ts`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/routes/page.test.ts`, `src/test/setup.ts`, `src/lib/styles/base.css`, `playwright.config.ts`, `src/app.html`
- Keep: existing `docs/` folder

**Interfaces:**
- Consumes: nothing
- Produces: a running SvelteKit SPA with `pnpm test`, `pnpm check`, `pnpm e2e`

- [ ] **Step 1: Scaffold and install**

```bash
cd /Users/ionutale/developer-playground/shop-of-small-miracles
git init
pnpm dlx sv create . --template minimal --types ts \
  --add vitest="usages:unit,component" playwright="demo:no" \
  sveltekit-adapter="adapter:static" prettier eslint \
  --install pnpm --no-dir-check
pnpm add @fontsource/cormorant-garamond @fontsource/caveat
pnpm add -D vite-node @testing-library/svelte @testing-library/jest-dom jsdom
pnpm exec playwright install chromium
```

- [ ] **Step 2: Configure SPA and test harness**

`src/routes/+layout.ts`:

```ts
export const ssr = false
export const prerender = false
```

`vite.config.ts` (merge with the scaffolded config):

```ts
import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { svelteTesting } from '@testing-library/svelte/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    sveltekit({ adapter: adapter({ fallback: '200.html' }) }),
    svelteTesting(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
  },
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
  webServer: {
    command: 'pnpm build && pnpm preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 3: Write the failing smoke test**

`src/routes/page.test.ts`:

```ts
import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import Page from './+page.svelte'

describe('title', () => {
  it('renders the shop name', () => {
    render(Page)
    expect(screen.getByRole('heading', { name: /a shop of small miracles/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run it and confirm failure**

Run: `pnpm vitest run src/routes/page.test.ts`
Expected: FAIL — no heading.

- [ ] **Step 5: Implement the minimal page and styles**

`src/routes/+page.svelte`:

```svelte
<h1>A Shop of Small Miracles</h1>
```

`src/lib/styles/base.css`: parchment `#F0E2C4`, ink `#3B2A1A`, `Cormorant Garamond` body, `Caveat` handwriting. Import both Fontsource packages and the stylesheet from `+layout.svelte`.

- [ ] **Step 6: Verify and commit**

Run: `pnpm vitest run src/routes/page.test.ts && pnpm check`
Expected: pass.

```bash
git add -A
git commit -m "chore: scaffold SvelteKit SPA with test harness"
```

---

### Task 2: Types, tags, seeded RNG, validator, fixtures

**Files:**
- Create: `src/lib/types.ts`, `src/lib/data/tags.ts`, `src/lib/game/rng.ts`, `src/lib/game/validate.ts`, `src/lib/game/validate.test.ts`, `src/lib/test/fixtures.ts`

**Interfaces:**
- Consumes: nothing
- Produces: all shared types; `TAGS`; `nextRandom(state)`, `pickIndex(state, length)`; `validateContent(content)`; test factories

- [ ] **Step 1: Write the types**

`src/lib/types.ts`:

```ts
export type Tag =
  | 'Light' | 'Still' | 'Warm' | 'Cold' | 'Sharp' | 'Soft' | 'Heavy' | 'Dreaming' | 'Bitter'
  | 'Bright' | 'Bound' | 'Ground' | 'Spark' | 'Calm' | 'Cleanse' | 'Radiant' | 'Grief' | 'Hollow'

export type Phase = 'morning' | 'service' | 'market' | 'chapterEnd' | 'ending'
export type ArcId = 'widow' | 'merchant' | 'apprentice'

export interface ElementRecord {
  id: string
  number: number
  symbol: string
  name: string
  primary: Tag
  secondary: Tag
  price: number
}

export interface PotionRecord {
  id: string
  name: string
  tags: [Tag, Tag]
  effect: string
}

export interface VisitRecord {
  id: string
  characterId: string
  request: string
  tags: [Tag, Tag]
  cleanLine: string
  sideEffectLine: string
  declineLine: string
  flags?: string[]
}

export interface CharacterRecord {
  id: string
  name: string
  portraitSeed: number
  visits: VisitRecord[]
}

export interface ChapterRecord {
  number: 1 | 2 | 3
  title: string
  rent: number
  beats: Record<number, string>
  recurring: { characterId: string; days: number[] }[]
}

export interface UpgradeRecord {
  id: string
  name: string
  description: string
  cost: number
  effect: string
}

export interface EndingRecord {
  id: 'shop-endures' | 'last-miracle' | 'quiet-closing'
  title: string
  epilogue: string
}

export interface StockEntry { elementId: string; units: number }
export interface MarketOffer { elementId: string; units: number; price: number }
export interface DiscoveredPotion { tags: Tag[]; name: string; day: number }

export interface SaveState {
  version: 1
  seed: number
  rngState: number
  day: number
  chapter: 1 | 2 | 3
  phase: Phase
  coins: number
  reputation: number
  setbacks: number
  stock: StockEntry[]
  discovered: DiscoveredPotion[]
  flags: string[]
  relationships: Record<ArcId, number>
  servedToday: number
  activeVisitId: string | null
  quietDay: boolean
  market: MarketOffer[]
  upgrades: string[]
  settings: { sound: boolean; reduceMotion: boolean }
  introSeen: boolean
}

export interface ContentBundle {
  elements: readonly ElementRecord[]
  potions: readonly PotionRecord[]
  characters: readonly CharacterRecord[]
  chapters: readonly ChapterRecord[]
  upgrades: readonly UpgradeRecord[]
  endings: readonly EndingRecord[]
}
```

- [ ] **Step 2: Write tags and RNG tests**

`src/lib/game/rng.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { nextRandom, pickIndex } from './rng'

describe('rng', () => {
  it('is deterministic for a seed', () => {
    expect(nextRandom(42)).toEqual(nextRandom(42))
  })

  it('advances and stays in range', () => {
    let state = 7
    const values: number[] = []
    for (let i = 0; i < 20; i++) {
      const step = nextRandom(state)
      state = step.state
      values.push(step.value)
      expect(step.value).toBeGreaterThanOrEqual(0)
      expect(step.value).toBeLessThan(1)
    }
    expect(new Set(values).size).toBeGreaterThan(1)
  })

  it('picks indices inside the range and advances the state', () => {
    const a = pickIndex(9, 5)
    expect(a.index).toBeGreaterThanOrEqual(0)
    expect(a.index).toBeLessThan(5)
    expect(a.state).not.toBe(9)
  })
})
```

- [ ] **Step 3: Write the failing validator tests**

`src/lib/test/fixtures.ts`:

```ts
import type { ContentBundle, ElementRecord, SaveState, Tag, VisitRecord } from '../types'

export function element(number: number, symbol: string, primary: Tag, secondary: Tag): ElementRecord {
  return { id: symbol, number, symbol, name: symbol, primary, secondary, price: 3 }
}

export function visit(id: string, tags: [Tag, Tag]): VisitRecord {
  return {
    id, characterId: 'c1', request: 'A small kindness.', tags,
    cleanLine: 'Thank you.', sideEffectLine: 'Oh.', declineLine: 'Perhaps not.',
  }
}

export function tinyVisit(tags: [Tag, Tag]): VisitRecord {
  return visit('visit-1', tags)
}

export function saveFixture(overrides: Partial<SaveState> = {}): SaveState {
  return {
    version: 1,
    seed: 42,
    rngState: 7,
    day: 1,
    chapter: 1,
    phase: 'service',
    coins: 40,
    reputation: 5,
    setbacks: 0,
    stock: [{ elementId: 'H', units: 2 }, { elementId: 'O', units: 1 }],
    discovered: [],
    flags: [],
    relationships: { widow: 0, merchant: 0, apprentice: 0 },
    servedToday: 0,
    activeVisitId: 'visit-1',
    quietDay: false,
    market: [],
    upgrades: [],
    settings: { sound: true, reduceMotion: false },
    introSeen: true,
    ...overrides,
  }
}

export function serviceSave(overrides: Partial<SaveState> = {}): SaveState {
  return saveFixture({ phase: 'service', activeVisitId: 'visit-1', quietDay: false, ...overrides })
}

export const tinyContent: ContentBundle = {
  elements: [element(1, 'H', 'Light', 'Warm'), element(8, 'O', 'Bright', 'Cold')],
  potions: [{ id: 'p1', name: 'Lamplight', tags: ['Light', 'Bright'], effect: 'A steady glow.' }],
  characters: [{ id: 'c1', name: 'A neighbour', portraitSeed: 1, visits: [visit('v1', ['Light', 'Bright'])] }],
  chapters: [{ number: 1, title: 'The Lamp', rent: 40, beats: { 1: 'A letter.' }, recurring: [] }],
  upgrades: [{ id: 'shelf', name: 'Shelf', description: 'More stock.', cost: 30, effect: 'shelf+10' }],
  endings: [{ id: 'shop-endures', title: 'The Shop Endures', epilogue: 'It stays open.' }],
}
```

`src/lib/game/validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { tinyContent } from '../test/fixtures'
import { validateContent } from './validate'

describe('validateContent', () => {
  it('accepts a coherent bundle', () => {
    expect(validateContent(tinyContent)).toEqual({ ok: true, errors: [] })
  })

  it('rejects a potion with an unknown tag', () => {
    const broken = { ...tinyContent, potions: [{ ...tinyContent.potions[0], tags: ['Light', 'Nope'] }] }
    expect(validateContent(broken as any).ok).toBe(false)
  })

  it('rejects a visit with fewer than two tags', () => {
    const broken = { ...tinyContent, characters: [{ ...tinyContent.characters[0], visits: [{ ...tinyContent.characters[0].visits[0], tags: ['Light'] }] }] }
    expect(validateContent(broken as any).ok).toBe(false)
  })
})
```

- [ ] **Step 4: Run and confirm failure**

Run: `pnpm vitest run src/lib/game/rng.test.ts src/lib/game/validate.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 5: Implement tags, RNG, validator**

- `tags.ts`: `TAGS: readonly Tag[]` with all 18 values, plus `TAG_LABELS` and a display glyph key.
- `rng.ts`: Mulberry32; `nextRandom(state)` returns `{ value, state }`; `pickIndex(state, length)` returns `{ index, state }`.
- `validate.ts`: `validateContent(content): { ok: boolean; errors: string[] }`. Checks element ids/numbers unique, valid tags, price 1–9; potion tag pairs valid and unique; each character has 1–3 visits; each visit has exactly 2 valid tags; 3 chapters with rents; 12 upgrades at full content; 3 endings; every tag used by at least one element.

- [ ] **Step 6: Verify and commit**

Run: `pnpm vitest run src/lib/game/rng.test.ts src/lib/game/validate.test.ts && pnpm check`
Expected: pass.

```bash
git add -A
git commit -m "feat: add types, tags, seeded RNG, and content validator"
```

---

### Task 3: Elements 1–15 and potions 1–12

**Files:**
- Create: `src/lib/data/elements.ts` (15 records), `src/lib/data/potions.ts` (12 records), `src/lib/data/content.test.ts`

**Interfaces:**
- Consumes: `ElementRecord`, `PotionRecord`, `Tag`
- Produces: `ELEMENTS_BATCH_1`, `POTIONS_BATCH_1`

- [ ] **Step 1: Author the first half**

Elements: 15 real elements with the primary/secondary tag table from the design. Examples: H Light/Volatile→use a real tag for secondary (Warm); He Still/Hollow; C Ground/Dreaming; N Dreaming/Sharp; O Bright/Calm; Na Warm/Spark; Mg Calm/Still; Si Still/Bound; S Sharp/Bitter; Cl Cleanse/Sharp; K Spark/Warm; Ca Bound/Ground; Fe Heavy/Ground; Cu Warm/Radiant; Ag Still/Hollow.

Rules: primary and secondary are different; prices 2–6; each primary tag appears at least once across the full 30.

Potions: 12 named tag pairs, e.g. Lamplight (Bright, Warm), Hush (Still, Dreaming), Salt Tears (Grief, Cleanse), Iron Promise (Heavy, Bound), Green Quiet (Calm, Ground), First Frost (Cold, Still), Ember Tea (Warm, Spark), Widow's Light (Light, Grief), Copper Courage (Warm, Bound), Silver Hush (Still, Radiant), Bitter Truth (Bitter, Sharp), Hollow Bell (Hollow, Grief).

- [ ] **Step 2: Write the failing batch tests**

```ts
import { describe, expect, it } from 'vitest'
import { TAGS } from './tags'
import { ELEMENTS_BATCH_1 } from './elements'
import { POTIONS_BATCH_1 } from './potions'

describe('batch 1', () => {
  it('ships 15 valid elements', () => {
    expect(ELEMENTS_BATCH_1).toHaveLength(15)
    for (const e of ELEMENTS_BATCH_1) {
      expect(TAGS).toContain(e.primary)
      expect(TAGS).toContain(e.secondary)
      expect(e.primary).not.toBe(e.secondary)
    }
  })

  it('ships 12 unique potion pairs', () => {
    expect(POTIONS_BATCH_1).toHaveLength(12)
    const keys = POTIONS_BATCH_1.map((p) => [...p.tags].sort().join('+'))
    expect(new Set(keys).size).toBe(12)
  })
})
```

- [ ] **Step 3: Run and confirm failure**

Run: `pnpm vitest run src/lib/data/content.test.ts`
Expected: FAIL.

- [ ] **Step 4: Author and pass**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add elements 1-15 and potions 1-12"
```

---

### Task 4: Elements 16–30, potions 13–24, side effects

**Files:**
- Modify: `src/lib/data/elements.ts`, `src/lib/data/potions.ts`, `src/lib/data/content.test.ts`
- Create: `src/lib/data/sideEffects.ts`

**Interfaces:**
- Consumes: batch 1 types
- Produces: `ELEMENTS` (30), `POTIONS` (24), `SIDE_EFFECTS: Record<Tag, readonly string[]>`

- [ ] **Step 1: Finish the content**

Add elements 16–30 (Sn, I, Hg, Au, Pb, and five more real elements) with distinct primary/secondary pairs. Add potions 13–24 covering the remaining named effects. Add `SIDE_EFFECTS` with 1–2 short melancholy/funny lines per tag.

- [ ] **Step 2: Update the final tests**

```ts
it('ships 30 elements and 24 named potions', () => {
  expect(ELEMENTS).toHaveLength(30)
  expect(POTIONS).toHaveLength(24)
  expect(new Set(ELEMENTS.map((e) => e.primary)).size).toBe(18)
})

it('has a side-effect line for every tag', () => {
  for (const tag of TAGS) expect(SIDE_EFFECTS[tag].length).toBeGreaterThan(0)
})
```

- [ ] **Step 3: Extend the content tests**

Run the validator against the full element/potion set. The full bundle is not available until Task 5, so this task tests elements, potions, tags, and side effects directly.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run src/lib/data/content.test.ts`
Expected: 30 elements, 24 potions, every tag covered, side effects present.

```bash
git add -A
git commit -m "feat: complete element and potion content with side effects"
```

---

### Task 5: Characters, chapters, eligibility, and quiet days

**Files:**
- Create: `src/lib/data/characters.ts`, `src/lib/data/chapters.ts`, `src/lib/game/eligibility.ts`, `src/lib/game/eligibility.test.ts`, `scripts/validate-content.ts`
- Modify: `src/lib/data/content.test.ts`, `package.json` (add `validate` script)

**Interfaces:**
- Consumes: `CHARACTERS`, `CHAPTERS`, `ELEMENTS`, `nextRandom`
- Produces:
  - `CHARACTERS: readonly CharacterRecord[]` (30 characters, 63 visits)
  - `CHAPTERS: readonly ChapterRecord[]` (3)
  - `canSatisfyTags(stock, tags, elements): boolean`
  - `pickVisit({ stock, chapter, servedVisitIds, rngState }): { visit: VisitRecord | null; rngState: number; quietDay: boolean }`
  - `pnpm validate`

- [ ] **Step 1: Author characters and chapters**

- 30 characters; 63 visits; a third of characters have 2–3 visits with distinct prose/tags.
- Three arc characters: widow, merchant, apprentice, with fixed days across chapters.
- 21-day manifest: chapter beats keyed by global day numbers (1–7, 8–14, 15–21), rent 40/80/120 at days 7/14/21, recurring days.
- Every visit’s two tags must be representable by the 30-element set.

- [ ] **Step 2: Write the failing eligibility tests**

```ts
import { describe, expect, it } from 'vitest'
import { ELEMENTS } from '../data/elements'
import { canSatisfyTags, pickVisit } from './eligibility'

const stock = (pairs: [string, number][]) => pairs.map(([elementId, units]) => ({ elementId, units }))

describe('eligibility', () => {
  it('requires three usable units and both tags', () => {
    expect(canSatisfyTags(stock([['H', 2], ['O', 1]]), ['Light', 'Bright'], ELEMENTS)).toBe(true)
    expect(canSatisfyTags(stock([['H', 1], ['O', 1]]), ['Light', 'Bright'], ELEMENTS)).toBe(false)
    expect(canSatisfyTags(stock([['H', 3]]), ['Light', 'Bright'], ELEMENTS)).toBe(false)
  })

  it('returns a quiet day when nothing is eligible', () => {
    const result = pickVisit({ stock: [], chapter: 1, servedVisitIds: [], rngState: 7 })
    expect(result.quietDay).toBe(true)
    expect(result.visit).toBeNull()
  })

  it('never returns an ineligible visit', () => {
    const result = pickVisit({ stock: stock([['H', 2], ['O', 1]]), chapter: 1, servedVisitIds: [], rngState: 7 })
    expect(result.visit?.tags).toEqual(expect.any(Array))
  })
})
```

- [ ] **Step 3: Run and confirm failure**

Run: `pnpm vitest run src/lib/game/eligibility.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement eligibility**

`canSatisfyTags` performs a 3-slot backtracking search over elements whose primary tag is one of the requested tags, respecting stock counts and allowing duplicates. It succeeds only when every requested tag appears at least once among the three slots.

`pickVisit` filters chapter visits by `canSatisfyTags`, excludes `servedVisitIds`, and uses `pickIndex` to choose. No candidates → quiet day.

- [ ] **Step 5: Extend content tests and validate**

```ts
it('ships 30 characters and 63 visits', () => {
  expect(CHARACTERS).toHaveLength(30)
  expect(CHARACTERS.reduce((n, c) => n + c.visits.length, 0)).toBe(63)
  expect(new Set(CHARACTERS.flatMap((c) => c.visits.map((v) => v.id))).size).toBe(63)
})

it('covers every day of all three chapters', () => {
  expect(CHAPTERS).toHaveLength(3)
  for (const c of CHAPTERS) expect(Object.keys(c.beats)).toHaveLength(7)
})
```

Add `scripts/validate-content.ts` now that the full bundle exists: it imports `ELEMENTS`, `POTIONS`, `CHARACTERS`, `CHAPTERS`, `UPGRADES`, `ENDINGS`, runs `validateContent`, prints `30 elements, 24 potions, 63 visits`, and exits non-zero on errors. Add `"validate": "vite-node scripts/validate-content.ts"`.

- [ ] **Step 6: Verify and commit**

Run: `pnpm validate && pnpm vitest run src/lib/game/eligibility.test.ts src/lib/data/content.test.ts`
Expected: pass.

```bash
git add -A
git commit -m "feat: add characters, chapters, and stock-aware visit eligibility"
```

---

### Task 6: Brew engine, judgment, pay, and setbacks

**Files:**
- Create: `src/lib/game/brew.ts`, `src/lib/game/brew.test.ts`, `src/lib/game/economy.ts` (rent/setback only in this task)

**Interfaces:**
- Consumes: `ElementRecord`, `VisitRecord`, `StockEntry`, `SIDE_EFFECTS`
- Produces:
  - `brewTags(elementIds, elements): { tags: Tag[]; potency: Tag | null }`
  - `canBrew(stock, elementIds): boolean`
  - `consume(stock, elementIds): StockEntry[]`
  - `judgeBrew(result, visit, reputation, upgrades): BrewOutcome`
  - `applyRentShortfall(save): SaveState`

- [ ] **Step 1: Write the failing brew tests**

```ts
import { describe, expect, it } from 'vitest'
import { ELEMENTS } from '../data/elements'
import { brewTags, canBrew, consume, judgeBrew } from './brew'
import { tinyVisit } from '../test/fixtures'

const visit = tinyVisit(['Light', 'Bright'])

describe('brew', () => {
  it('collects distinct primary tags and marks potency', () => {
    expect(brewTags(['H', 'H', 'O'], ELEMENTS)).toEqual({ tags: ['Light', 'Bright'], potency: 'Light' })
  })

  it('requires three available units and permits duplicates', () => {
    expect(canBrew([{ elementId: 'H', units: 2 }, { elementId: 'O', units: 1 }], ['H', 'H', 'O'])).toBe(true)
    expect(canBrew([{ elementId: 'H', units: 1 }, { elementId: 'O', units: 1 }], ['H', 'H', 'O'])).toBe(false)
  })

  it('consumes exactly one unit per slot', () => {
    expect(consume([{ elementId: 'H', units: 2 }, { elementId: 'O', units: 1 }], ['H', 'H', 'O']))
      .toEqual([{ elementId: 'H', units: 0 }, { elementId: 'O', units: 0 }])
  })

  it('judges a clean brew, a side effect, and a decline', () => {
    expect(judgeBrew({ tags: ['Light', 'Bright'], potency: 'Light' }, visit, 5, []).kind).toBe('clean')
    expect(judgeBrew({ tags: ['Light', 'Bright', 'Dreaming'], potency: null }, visit, 5, []).kind).toBe('sideEffect')
    expect(judgeBrew({ tags: ['Light'], potency: null }, visit, 5, []).kind).toBe('decline')
  })

  it('pays less for side effects and more for reputation', () => {
    const clean = judgeBrew({ tags: ['Light', 'Bright'], potency: 'Light' }, visit, 8, [])
    const messy = judgeBrew({ tags: ['Light', 'Bright', 'Dreaming'], potency: null }, visit, 8, [])
    expect(clean.pay).toBeGreaterThan(messy.pay)
    expect(clean.reputationDelta).toBe(1)
    expect(messy.reputationDelta).toBe(-1)
    expect(judgeBrew({ tags: ['Light'], potency: null }, visit, 8, []).reputationDelta).toBe(0)
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run src/lib/game/brew.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

- `brewTags`: map ids to elements, take primaries in order, deduplicate preserving order; `potency` is the tag with count > 1 (or null).
- `judgeBrew`: clean = both visit tags present and no extras; sideEffect = both present + extras; decline otherwise. Pay formula: `base 12 + 4 × matched + 4 if potency − 3 × extras`, then `Math.round(pay × (1 + (reputation − 5) × 0.04))`, side-effect multiplier 0.7, floor 5. Clean +1 rep, sideEffect −1, decline 0.
- `applyRentShortfall`: coins 10, reputation −2, setbacks +1, remove the most expensive owned upgrade (or one shelf unit if none), set flag `rentMissed`; never sets a game-over state.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run src/lib/game/brew.test.ts`
Expected: pass.

```bash
git add -A
git commit -m "feat: add essence brewing, judgment, pay, and rent setbacks"
```

---

### Task 7: Economy, market, upgrades, and day transitions

**Files:**
- Create: `src/lib/game/economy.ts` (market/buy/upgrade additions), `src/lib/game/day.ts`, `src/lib/game/day.test.ts`

**Interfaces:**
- Consumes: `nextRandom`, `pickIndex`, `ELEMENTS`, `UPGRADES`, `CHAPTERS`
- Produces:
  - `generateMarket(rngState, chapter, day): { offers: MarketOffer[]; rngState: number }`
  - `buyStock(save, offerIndex): SaveState`
  - `buyUpgrade(save, upgradeId): SaveState`
  - `endService(save): SaveState`
  - `endDay(save): SaveState`
  - `payRent(save): SaveState`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest'
import { buyUpgrade, generateMarket } from './economy'
import { endService, payRent } from './day'
import { saveFixture } from '../test/fixtures'

describe('market and day', () => {
  it('generates deterministic, unique offers', () => {
    const a = generateMarket(7, 1, 1)
    const b = generateMarket(7, 1, 1)
    expect(a).toEqual(b)
    expect(a.offers).toHaveLength(8)
    expect(new Set(a.offers.map((o) => o.elementId)).size).toBe(8)
  })

  it('moves to market at end of service', () => {
    const next = endService(saveFixture({ servedToday: 3 }))
    expect(next.phase).toBe('market')
    expect(next.market).toHaveLength(8)
  })

  it('allows one upgrade per evening and respects coins', () => {
    const buy = buyUpgrade(saveFixture({ coins: 100, phase: 'market' }), 'shelf')
    expect(buy.upgrades).toContain('shelf')
    expect(() => buyUpgrade(buy, 'stove')).toThrow()
  })

  it('charges rent at chapter end and opens a setback when short', () => {
    const short = payRent(saveFixture({ coins: 0, day: 7, chapter: 1 }))
    expect(short.setbacks).toBe(1)
    expect(short.coins).toBe(10)
    expect(short.reputation).toBe(3)
    expect(short.phase).not.toBe('ending')
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run src/lib/game/day.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

- Market: 8 unique elements from the chapter's allowed pool, 1–3 units, price = element price ±1; seeded.
- Buying: coins ≥ price, shelf capacity not exceeded, offer removed/units reduced.
- Upgrades: one per evening, cost, owned once, apply effects (shelf +10, discount 10%, clean bonus, etc.) through data strings.
- Day phases: morning → service (3 customers) → market → next day. Days 7/14/21 → chapterEnd → payRent → next chapter or ending.
- `endDay` increments day, resets servedToday/quietDay, sets phase morning, and applies chapter transitions.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run src/lib/game/day.test.ts`
Expected: pass.

```bash
git add -A
git commit -m "feat: add market, stock, upgrades, and day transitions"
```

---

### Task 8: Save, load, corrupt recovery, and game store

**Files:**
- Create: `src/lib/game/storage.ts`, `src/lib/game/storage.test.ts`, `src/lib/stores/game.ts`, `src/lib/stores/game.test.ts`

**Interfaces:**
- Consumes: `SaveState`, engine functions
- Produces:
  - `SAVE_KEY = 'small-miracles:save:v1'`
  - `createInitialSave(seed): SaveState`
  - `parseSave(raw): SaveState | null`
  - `loadSave(seed, storage?): { save; recovered }`
  - `saveGame(save, storage?): boolean`
  - `game: Writable<SaveState>`, `initGame(seed?, overrides?)`, and actions `brew(ids)`, `decline()`, `buyStock(i)`, `buyUpgrade(id)`, `endService()`, `endDay()`

- [ ] **Step 1: Write the failing storage tests**

```ts
import { describe, expect, it } from 'vitest'
import { createInitialSave, loadSave, parseSave, saveGame, SAVE_KEY } from './storage'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() { return map.size },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  }
}

describe('storage', () => {
  it('round-trips', () => {
    const storage = memoryStorage()
    const save = createInitialSave(42)
    expect(saveGame(save, storage)).toBe(true)
    expect(loadSave(99, storage)).toEqual({ save, recovered: false })
  })

  it('recovers from corrupt JSON', () => {
    const storage = memoryStorage()
    storage.setItem(SAVE_KEY, '{bad')
    expect(loadSave(99, storage).recovered).toBe(true)
  })

  it('rejects wrong versions', () => {
    expect(parseSave(JSON.stringify({ version: 2 }))).toBeNull()
  })

  it('preserves the RNG state across a round-trip', () => {
    const storage = memoryStorage()
    const save = { ...createInitialSave(42), rngState: 12345 }
    saveGame(save, storage)
    expect(loadSave(1, storage).save.rngState).toBe(12345)
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run src/lib/game/storage.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement storage and store**

- `createInitialSave`: day 1, chapter 1, phase morning, coins 40, reputation 5, setbacks 0, starting stock, seed/rngState, relationships 0, settings, `introSeen: false`.
- `parseSave`: version 1, day 1–21, valid phase/chapter, arrays present; otherwise null. Backfill defaults where safe.
- `loadSave`: corrupt → initial + recovered true.
- `saveGame`: try/catch, boolean.
- Store: `writable` save; actions call pure engine functions and autosave; `initGame` loads once. Export `get`-friendly store for tests.

- [ ] **Step 4: Write the failing store test**

```ts
import { get } from 'svelte/store'
import { describe, expect, it } from 'vitest'
import { brew, game, initGame } from './game'
import { SAVE_KEY } from '../game/storage'
import { serviceSave } from '../test/fixtures'

it('brews through the store and persists', () => {
  localStorage.clear()
  initGame(42, serviceSave())
  const before = get(game)
  brew(['H', 'H', 'O'])
  const after = get(game)
  expect(after.stock).not.toEqual(before.stock)
  expect(JSON.parse(localStorage.getItem(SAVE_KEY)!).day).toBe(1)
})
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm vitest run src/lib/game/storage.test.ts src/lib/stores/game.test.ts`
Expected: pass.

```bash
git add -A
git commit -m "feat: add versioned save, recovery, and game store"
```

---

### Task 9: Shop screen — customer, cauldron, shelf, service

**Files:**
- Create: `src/lib/components/CustomerCard.svelte`, `TagChip.svelte`, `Cauldron.svelte`, `IngredientShelf.svelte`, `BrewPreview.svelte`, `ShopScreen.svelte`, `QuietDay.svelte`, `src/lib/components/shop.test.ts`
- Modify: `src/routes/+page.svelte`

**Interfaces:**
- Consumes: `game` store, `ELEMENTS`, `canBrew`, `brewTags`, `judgeBrew`
- Produces: full service flow: choose three, preview, brew, result, decline, quiet day

- [ ] **Step 1: Write the failing component tests**

```ts
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import ShopScreen from './ShopScreen.svelte'
import { initGame } from '../stores/game'
import { CHARACTERS } from '../data/characters'
import { ELEMENTS } from '../data/elements'
import { canSatisfyTags } from '../game/eligibility'
import { serviceSave } from '../test/fixtures'

function seedService(overrides = {}) {
  const stock = serviceSave().stock
  const eligible = CHARACTERS.flatMap((c) => c.visits).find((v) => canSatisfyTags(stock, v.tags, ELEMENTS))!
  initGame(42, serviceSave({ activeVisitId: eligible.id, ...overrides }))
}

beforeEach(() => { localStorage.clear(); seedService() })

describe('shop', () => {
  it('shows the customer request and two tag chips', () => {
    render(ShopScreen)
    expect(screen.getByTestId('customer-request')).toBeInTheDocument()
    expect(screen.getAllByTestId('tag-chip')).toHaveLength(2)
  })

  it('selects three ingredients, previews, and brews', async () => {
    render(ShopScreen)
    const h = screen.getAllByRole('button', { name: /hydrogen/i })
    await userEvent.click(h[0]); await userEvent.click(h[0])
    await userEvent.click(screen.getByRole('button', { name: /oxygen/i }))
    expect(screen.getByRole('button', { name: /brew/i })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: /brew/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/.+/)
  })

  it('lets the player decline without consuming stock', async () => {
    render(ShopScreen)
    await userEvent.click(screen.getByRole('button', { name: /politely decline/i }))
    expect(screen.getByText(/next customer|evening/i)).toBeInTheDocument()
  })

  it('shows a quiet day when no visit is eligible', () => {
    initGame(42, serviceSave({ stock: [], quietDay: true, activeVisitId: null }))
    render(ShopScreen)
    expect(screen.getByText(/quiet day/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /evening/i })).toBeInTheDocument()
  })
})
```

Replace the quiet-day test with a seeded empty-stock save and assert the quiet-day copy and market button.

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run src/lib/components/shop.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

- `TagChip`: label + glyph, `data-testid="tag-chip"`, never color-only.
- `CustomerCard`: ink portrait placeholder, name, prose, tags, decline button.
- `IngredientShelf`: stock cards with units, disabled when 0; filter by tag.
- `Cauldron`: three slots; tap shelf → next empty slot; tap slot → remove; duplicate allowed.
- `BrewPreview`: distinct tags, potency, side effects, estimated pay; Brew button disabled until 3.
- `ShopScreen`: uses the store; on brew, calls `brew(ids)`, shows result line, payment, rep change; next customer; after 3, evening.
- `QuietDay`: story beat and an Evening button.
- Mobile layout: customer top, cauldron middle, shelf bottom; 44 px targets.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run src/lib/components/shop.test.ts`
Expected: pass.

```bash
git add -A
git commit -m "feat: add shop service flow with brewing and quiet days"
```

---

### Task 10: Market, upgrades, rent, recipe book, and journal

**Files:**
- Create: `MarketScreen.svelte`, `UpgradeCard.svelte`, `RentScene.svelte`, `RecipeBook.svelte`, `Journal.svelte`, `Settings.svelte`, `src/lib/components/meta.test.ts`
- Modify: `ShopScreen.svelte`, `src/routes/+page.svelte`

**Interfaces:**
- Consumes: store actions, `POTIONS`, `UPGRADES`, `CHAPTERS`
- Produces: evening economy, chapter rent, recipe book, journal

- [ ] **Step 1: Write the failing tests**

```ts
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { get } from 'svelte/store'
import MarketScreen from './MarketScreen.svelte'
import RecipeBook from './RecipeBook.svelte'
import RentScene from './RentScene.svelte'
import Settings from './Settings.svelte'
import { game, initGame } from '../stores/game'
import { saveFixture } from '../test/fixtures'
import { generateMarket } from '../game/economy'
import { POTIONS } from '../data/potions'

beforeEach(() => localStorage.clear())

it('buys stock and updates coins', async () => {
  const offers = generateMarket(7, 1, 1).offers
  initGame(42, saveFixture({ phase: 'market', coins: 100, market: offers, stock: [] }))
  render(MarketScreen)
  const before = get(game).coins
  await userEvent.click(screen.getAllByRole('button', { name: /buy/i })[0])
  expect(get(game).coins).toBeLessThan(before)
})

it('allows one upgrade per evening', async () => {
  initGame(42, saveFixture({ phase: 'market', coins: 300, market: [], stock: [] }))
  render(MarketScreen)
  await userEvent.click(screen.getAllByRole('button', { name: /buy upgrade/i })[0])
  for (const button of screen.getAllByRole('button', { name: /buy upgrade/i })) {
    expect(button).toBeDisabled()
  }
})

it('records a brewed potion in the recipe book', () => {
  const potion = POTIONS[0]
  initGame(42, saveFixture({ discovered: [{ tags: potion.tags, name: potion.name, day: 2 }] }))
  render(RecipeBook)
  expect(screen.getByText(potion.name)).toBeInTheDocument()
  expect(screen.getByText(potion.effect)).toBeInTheDocument()
})

it('shows a rent setback instead of a game over', async () => {
  initGame(42, saveFixture({ phase: 'chapterEnd', day: 7, chapter: 1, coins: 0 }))
  render(RentScene)
  await userEvent.click(screen.getByRole('button', { name: /pay rent/i }))
  expect(await screen.findByText(/setback|shortfall/i)).toBeInTheDocument()
})

it('persists the sound toggle', async () => {
  initGame(42, saveFixture())
  render(Settings)
  await userEvent.click(screen.getByRole('checkbox', { name: /sound/i }))
  expect(get(game).settings.sound).toBe(false)
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run src/lib/components/meta.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

- Market: offers, prices, units, capacity; buy buttons; then upgrade grid; one upgrade per evening; Evening continues.
- RentScene: coins, rent, paid/shortfall branches; setback copy names what was taken; continue.
- RecipeBook: named potions, tag pairs, effect prose, discovery day; unfiled generated names; tag filter.
- Journal: chapter recap, relationships, letters; no quest log.
- Settings: sound and reduced motion toggles, install guidance, reset all progress (two-step), about. No tracker.
- Navigation: tabs or a bottom bar for Shop, Book, Journal, Settings.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run src/lib/components/meta.test.ts`
Expected: pass.

```bash
git add -A
git commit -m "feat: add market, upgrades, rent, book, and journal"
```

---

### Task 11: Story, flags, day-20 choice, and endings

**Files:**
- Create: `src/lib/game/story.ts`, `src/lib/game/story.test.ts`, `src/lib/data/endings.ts`, `TitleScreen.svelte`, `MorningScene.svelte`, `EndingPage.svelte`, `src/lib/components/story.test.ts`

**Interfaces:**
- Consumes: `CHAPTERS`, `SaveState`, `EndingRecord`
- Produces:
  - `applyChoice(save, choiceId): SaveState`
  - `endingFor(metrics: { reputation; relationships; flags; setbacks }): EndingRecord`
  - `selectEnding(save): EndingRecord`
  - title, morning, and ending screens

- [ ] **Step 1: Write the failing tests**

```ts
import { endingFor } from './story'

it('selects all three endings', () => {
  expect(endingFor({ reputation: 8, relationships: { widow: 7, merchant: 7, apprentice: 7 }, flags: ['keptTheChair'], setbacks: 0 }).id).toBe('last-miracle')
  expect(endingFor({ reputation: 6, relationships: { widow: 3, merchant: 3, apprentice: 3 }, flags: [], setbacks: 0 }).id).toBe('shop-endures')
  expect(endingFor({ reputation: 4, relationships: { widow: 3, merchant: 3, apprentice: 3 }, flags: ['closedTheShop'], setbacks: 0 }).id).toBe('quiet-closing')
})
```

`src/lib/components/story.test.ts` renders `TitleScreen` with and without a save (asserting Continue/New game) and renders `EndingPage` for each ending (asserting its title).

- [ ] **Step 2: Run and confirm failure**

Run: `pnpm vitest run src/lib/game/story.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

- Title screen: shop sign, Continue when a save exists, New game with confirmation, and a Settings link.
- Morning scenes from chapter beats, with choice buttons that call `applyChoice` and set flags/relationships.
- Day-20 choice sets `closedTheShop`; the run still reaches day 21.
- `endingFor` order: quiet-closing if `closedTheShop` or setbacks ≥ 2; last-miracle if reputation ≥ 7 and all relationships ≥ 6 and `keptTheChair`; otherwise shop-endures.
- Ending page with epilogue, relationship lines, and new game.
- All three endings must be reachable from authored choices; add a content test.

- [ ] **Step 4: Verify and commit**

Run: `pnpm vitest run src/lib/game/story.test.ts src/lib/components/story.test.ts`
Expected: pass.

```bash
git add -A
git commit -m "feat: add story choices and three reachable endings"
```

---

### Task 12: Generated art, parchment polish, and responsive layout

**Files:**
- Create: `src/lib/components/InkPortrait.svelte`, `TagIcon.svelte`, `src/lib/components/art.test.ts`, `src/lib/game/sound.ts`, `src/lib/game/sound.test.ts`, `src/lib/styles/paper.css`
- Modify: all screens for the visual system

**Interfaces:**
- Consumes: `portraitSeed`, `Tag`
- Produces: seeded SVG portraits, 18 tag icons, paper/candle/deckle styling

- [ ] **Step 1: Write the failing portrait test**

```ts
it('is deterministic for a character seed', () => {
  const { container: a } = render(InkPortrait, { props: { seed: 12 } })
  const { container: b } = render(InkPortrait, { props: { seed: 12 } })
  expect(a.innerHTML).toBe(b.innerHTML)
})
```

- [ ] **Step 2: Implement**

- `InkPortrait`: deterministic SVG parts (face shape, hair, hat/glasses/shawl) selected by a small seeded PRNG; ink stroke style; decorative frame.
- `TagIcon`: 18 inline SVG glyphs, each with a text label beside it.
- `sound.ts`: procedural WebAudio only — paper turn, glass clink, soft room tone, clean-brew chime. Lazy AudioContext, mute setting, never throws. Test with a fake context that disabled sound does not construct one.
- Paper: fiber texture via CSS gradients/SVG filter, deckled edges, wax seals, candle glow; no external images.
- Slow page-turn and steam transitions; honor reduced motion.
- Wide-screen layout: two-page spread; keep 360 px intact.

- [ ] **Step 3: Verify**

Run: `pnpm vitest run src/lib/components/art.test.ts && pnpm check`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add generated portraits, tag icons, and parchment polish"
```

---

### Task 13: PWA, icons, offline, and update prompt

**Files:**
- Create: `static/favicon.svg`, `src/lib/components/PwaUpdate.svelte`, `e2e/pwa.spec.ts`
- Modify: `vite.config.ts`, `src/routes/+layout.svelte`, `src/app.d.ts`

**Interfaces:**
- Consumes: built app
- Produces: installable manifest, icons, service worker, offline reload, update prompt

- [ ] **Step 1: Install and write the failing test**

```bash
pnpm add -D @vite-pwa/sveltekit @vite-pwa/assets-generator vite-plugin-pwa
```

`e2e/pwa.spec.ts`: load `/`, assert a manifest link and 192/512 icons; wait for `navigator.serviceWorker.ready`; reload; go offline; reload; assert the title; restore online. Use `new URL(href, page.url())` for the manifest fetch.

- [ ] **Step 2: Configure**

`vite.config.ts` adds:

```ts
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

// plugins: [sveltekit(), svelteTesting(), SvelteKitPWA({
//   registerType: 'prompt',
//   pwaAssets: { preset: 'minimal-2023', image: 'static/favicon.svg', overrideManifestIcons: true },
//   manifest: { name: 'A Shop of Small Miracles', short_name: 'Small Miracles',
//     description: 'Brew small miracles in a candlelit shop.',
//     theme_color: '#F0E2C4', background_color: '#F0E2C4', display: 'standalone',
//     orientation: 'portrait', start_url: '/', scope: '/' },
//   workbox: { globPatterns: ['client/**/*.{js,css,html,svg,png,ico,woff2}'] },
//   kit: { includeVersionFile: true },
// })]
```

- `PwaUpdate.svelte` uses `useRegisterSW` from `virtual:pwa-register/svelte`; shows "A new page is ready" with Refresh/Later.
- `static/favicon.svg`: candle-and-mortar mark on parchment.
- `src/app.d.ts`: reference `vite-plugin-pwa/svelte` types.

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm e2e e2e/pwa.spec.ts`
Expected: manifest/icons present; offline reload works.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add installable PWA with offline cache and update prompt"
```

---

### Task 14: Accessibility and keyboard flows

**Files:**
- Modify: components and styles
- Create: `e2e/a11y.spec.ts`

- [ ] **Step 1: Install and write the failing tests**

```bash
pnpm add -D @axe-core/playwright
```

Audit Shop, Market, Book, Journal, Settings with `AxeBuilder`; expect zero violations. Keyboard: tab to the shelf, select three ingredients, brew, open the book, and reach the ending via a seeded save.

- [ ] **Step 2: Fix**

- Native buttons/inputs; visible focus rings.
- Tag chips expose their label in text, not color alone.
- Cauldron slots are buttons with labels; live region announces brew results and payments.
- Focus returns after dialogs; 44 px minimum; contrast ≥ 4.5:1.
- Reduced motion honors the OS and the setting.

- [ ] **Step 3: Verify and commit**

Run: `pnpm e2e e2e/a11y.spec.ts`
Expected: pass.

```bash
git add -A
git commit -m "fix: complete keyboard, focus, and contrast accessibility"
```

---

### Task 15: Regression, budget, and README

**Files:**
- Create: `e2e/game.spec.ts`, `scripts/check-bundle.mjs`, `README.md`
- Modify: `package.json`

- [ ] **Step 1: Write the regression e2e**

- First guided customer served in under 60 seconds.
- Reload mid-day restores the same customer, stock, phase, and RNG state.
- A chapter-end shortfall shows a setback, not a game over.
- All three endings from seeded saves.
- Offline reload.
- Keyboard-only brew.

- [ ] **Step 2: Bundle budget**

`scripts/check-bundle.mjs` recursively sums gzipped JS under `build/_app/` and fails above 180 KB. Add `"check:bundle": "node scripts/check-bundle.mjs"`.

- [ ] **Step 3: README**

Explain the game, `pnpm dev`, `pnpm test`, `pnpm check`, `pnpm validate`, `pnpm build`, `pnpm preview`, `pnpm e2e`, content authoring (elements, tags, visits), the eligibility invariant, the soft-stakes rule, and static deployment.

- [ ] **Step 4: Final verification**

```bash
pnpm validate
pnpm check
pnpm test
pnpm build
pnpm check:bundle
pnpm e2e
```

Expected: content valid; svelte-check, tests, build, budget, and e2e all pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add regression suite, bundle budget, and README"
```

---

## Self-Review Notes

- **Spec coverage:** 30 elements and 24 potions (3–4), 63 visits and chapters (5), brewing/potency/pay (6), economy/rent (7), save/resume (8), shop UI (9), market/book/journal (10), story/endings (11), generated art (12), PWA (13), accessibility (14), regression/budget (15).
- **Review Focus mapping:** unwinnable requests → 5; one-brew/refund → 6; seeded resume → 2, 7, 8; rent setback → 6, 10; endings → 11; corrupt save → 8.
- **Type consistency:** `SaveState` is defined once in Task 2 and used unchanged; `BrewResult`/`BrewOutcome` and `MarketOffer` names match across engine, store, and UI tasks.
- **Soft stakes:** no function in the plan returns a game-over state; rent shortfall always returns a modified save.
