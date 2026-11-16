# Shop Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add thirteen keepsake badges backed by a career ledger that survives reset, awarded automatically and shown in the Journal.

**Architecture:** `data/badges.ts` defines badge metadata; `game/badges.ts` holds pure evaluation and `syncBadges`. `SaveState` gains `records` and `badges`; the store updates records on brew/decline/ending and syncs badges before autosave. `Journal.svelte` renders earned and locked entries from the save.

**Tech Stack:** SvelteKit 3 + Svelte 5 + TypeScript, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-shop-badges-design.md`

## Global Constraints

- Badges are pure keepsakes: no bonuses, currency, or balance changes.
- Awards are idempotent and persisted; reset preserves `records` and `badges`.
- Legacy saves backfill empty records/badges, with no retro-award.
- No new navigation tab; the Journal hosts the collection.
- Existing 216 unit and 32 e2e tests stay green; 44 px and axe unchanged.
- Commit after every task.

## Review Focus

1. Reset must preserve the career ledger and badges while clearing the run.
2. Ending records must be written once, even with fallback `chapterEnd` saves.
3. Badge sync must be idempotent and must not loop or double-save through the store subscription.
4. Locked badges must never be hidden, and earned/locked must read clearly to screen readers.
5. A corrupt save recovering fresh must not crash or show phantom badges.

---

### Task 1: Schema, records, and backfill

**Files:**
- Modify: `src/lib/types.ts`, `src/lib/game/storage.ts`, `src/lib/test/fixtures.ts`, `src/lib/stores/game.ts`
- Test: `src/lib/game/storage.test.ts`

**Interfaces:**
- Produces: `SaveState.records: { cleanBrews: number; served: number; namedSeen: string[]; endings: SaveState['records']['endings']; chairEndings: number }` and `SaveState.badges: { id: string; day: number }[]`; new saves zeroed; legacy saves backfilled zero/empty; `resetGame` preserves both.

- [x] **Step 1: Failing test** — parse a save without `records`/`badges` and expect `{ cleanBrews: 0, served: 0, namedSeen: [], endings: [] }` and `[]`; assert a fresh initial save has the same, and `resetGame` keeps seeded values.
- [x] **Step 2: Run and confirm failure** — `pnpm vitest run src/lib/game/storage.test.ts`.
- [x] **Step 3: Implement** the types, `createInitialSave`, `parseSave` backfill, fixture defaults, and reset preservation.
- [x] **Step 4: Verify** — storage + store tests pass.
- [x] **Step 5: Commit** — `feat: add a career ledger to the save`.

---

### Task 2: Badge definitions and pure evaluation

**Files:**
- Create: `src/lib/data/badges.ts`, `src/lib/game/badges.ts`, `src/lib/game/badges.test.ts`

**Interfaces:**
- Produces: `BadgeId` union, `BadgeRecord { id; title; flavor; hint }`, `BADGES`, `earnedBadgeIds(save): BadgeId[]`, `syncBadges(save): SaveState` (same object when nothing new).

- [x] **Step 1: Failing test** — first clean brew earns `first-light`; 10 clean brews earns `long-bench`; all 24 named seen earns `whole-book`; each relationship ≥8 and all ≥6 earns their badges; `endings` containing an id earns the ending badge; `keptTheChair` + ending earns `chair-keeper`; sync called twice adds no duplicates.
- [x] **Step 2: Run and confirm failure**.
- [x] **Step 3: Implement** the 13 metadata records and pure predicates against `records`, current `relationships`, and `flags`.
- [x] **Step 4: Verify** — `pnpm vitest run src/lib/game/badges.test.ts`.
- [x] **Step 5: Commit** — `feat: define the keepsake badges and evaluation`.

---

### Task 3: Store instrumentation and persistence

**Files:**
- Modify: `src/lib/stores/game.ts`
- Test: `src/lib/stores/game.test.ts`

**Interfaces:**
- Consumes: `syncBadges`.
- Produces: records updated by `brew` (served +1, clean +1, named seen), `decline` (served +1), and `leaveRentScene` (ending id once); subscription syncs badges before saving.

- [x] **Step 1: Failing test** — a clean brew increments `records.cleanBrews`, `served`, adds the named potion, and awards `first-light`; a decline increments `served` only; `leaveRentScene` on a day-21 save records the ending once; reload keeps badges.
- [x] **Step 2: Run and confirm failure**.
- [x] **Step 3: Implement** — update records in the three actions; in the subscription, `const synced = syncBadges(state); if (synced !== state) game.set(synced); else saveGame(state);` with the existing `ready` guard.
- [x] **Step 4: Verify** — store tests plus storage round-trip.
- [x] **Step 5: Commit** — `feat: award badges from the shop store`.

---

### Task 4: Journal section

**Files:**
- Modify: `src/lib/components/Journal.svelte`
- Create: `src/lib/components/badges.test.ts`

**Interfaces:**
- Consumes: `BADGES`, `game` (`badges`, `records`).

- [x] **Step 1: Failing test** — render `Journal` with one earned `{ id: 'first-light', day: 2 }` and expect “Small honors”, `1 / 13`, the earned title and `earned day 2`; expect a locked badge's title and hint, and no false “earned” marker.
- [x] **Step 2: Run and confirm failure**.
- [x] **Step 3: Implement** — a “Small honors” section above the letters: header count, earned entries with flavor/day, locked entries with hint and muted style, list semantics, no new interaction.
- [x] **Step 4: Verify** — badge component test, axe/44 px e2e still green.
- [x] **Step 5: Commit** — `feat: show badges in the journal`.

---

### Task 5: Regression, deploy, docs

- [x] **Step 1** — `pnpm validate && pnpm check && pnpm lint && pnpm test && pnpm build && pnpm check:bundle && pnpm e2e`.
- [x] **Step 2** — Browser at 390×844: fresh save shows locked badges; a clean brew awards and displays First Light; reset keeps it.
- [x] **Step 3** — README: document the career ledger, badge collection, and reset behaviour.
- [x] **Step 4** — `pnpm deploy`, push, confirm CI.

## Self-Review

- Every badge in the spec table has a predicate and a test line (Task 2).
- Reset/legacy/corrupt paths are Task 1 + Task 3.
- Subscription loop risk covered by the same-object `syncBadges` rule and an idempotence test.
- Journal accessibility is list text with no interactive additions (Task 4).
