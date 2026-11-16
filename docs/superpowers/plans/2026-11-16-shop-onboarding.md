# Shop Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a persistent goal bar, a one-time first-day coach, and a pure brew-suggestion helper so new players know the 21-day/rent goal and the first three taps.

**Architecture:** Two small Svelte components (`GoalBar`, `FirstDayCoach`) read the existing store; a pure `suggestBrew` helper finds a valid starting trio; `ShopScreen` composes them and passes a highlight list to `IngredientShelf`. A new `tutorialDone` save field (backfilled true) makes the coach one-time.

**Tech Stack:** SvelteKit 3 + Svelte 5 + TypeScript, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-shop-onboarding-design.md`

## Global Constraints

- Mobile-first at 360 px; all controls ≥ 44 px; no blocking modals.
- Coach copy must stay warm and non-instructional in tone, never scolding.
- Existing 31 e2e and 198 unit tests must stay green.
- `tutorialDone` backfills `true` for older saves; new saves/resets start `false`.
- No save version bump; existing backfill pattern.
- Commit after every task.

## Review Focus

1. A returning save must never show the coach — `tutorialDone` backfill and reset behaviour.
2. A player who declines or brews wrong must still be able to finish/dismiss the coach.
3. Suggestions must be valid for the actual stock, including duplicate-element uses.
4. The coach must not cover or block the cauldron, shelf, or result controls.
5. The goal bar must stay readable and correct on rent days and the ending.

---

### Task 1: Pure brew suggestion helper

**Files:**
- Create: `src/lib/game/hint.ts`, `src/lib/game/hint.test.ts`

**Interfaces:**
- Produces: `suggestBrew(stock: readonly StockEntry[], tags: readonly [Tag, Tag], elements: readonly ElementRecord[]): string[] | null` — three element ids whose primaries cover both tags with one doubled; `null` when impossible.

- [x] **Step 1: Write the failing test**

```ts
const ids = suggestBrew(saveFixture().stock, ['Warm', 'Light'], ELEMENTS)!;
expect(ids).toHaveLength(3);
const primaries = ids.map((id) => ELEMENTS.find((e) => e.id === id)!.primary);
expect(new Set(primaries)).toEqual(new Set(['Warm', 'Light']));
expect(suggestBrew(saveFixture().stock, ['Grief', 'Hollow'], ELEMENTS)).toBeNull();
```

- [x] **Step 2: Run and confirm failure**

Run: `pnpm vitest run src/lib/game/hint.test.ts`
Expected: FAIL (module not found).

- [x] **Step 3: Implement** — iterate in-stock ids in data order, try each ordered triple respecting units, return the first whose primary set equals the two tags with exactly one repeat; prefer three distinct ids when available.

- [x] **Step 4: Verify** — `pnpm vitest run src/lib/game/hint.test.ts` → PASS.

- [x] **Step 5: Commit** — `feat: add a pure brew suggestion helper`.

---

### Task 2: Save field and store action

**Files:**
- Modify: `src/lib/types.ts`, `src/lib/game/storage.ts`, `src/lib/test/fixtures.ts`, `src/lib/stores/game.ts`
- Test: `src/lib/game/storage.test.ts`

**Interfaces:**
- Produces: `SaveState.tutorialDone: boolean`; `dismissTutorial(): void`; new saves `false`, parsed legacy saves `true`, test fixture default `true`.

- [x] **Step 1: Failing test** — delete `tutorialDone` from a serialized initial save, parse it, expect `true`; `createInitialSave(42).tutorialDone` is `false`.
- [x] **Step 2: Run and confirm failure** — `pnpm vitest run src/lib/game/storage.test.ts`.
- [x] **Step 3: Implement** — add the field, backfill in `parseSave`, add store action that sets it and autosaves.
- [x] **Step 4: Verify** — storage + store tests pass.
- [x] **Step 5: Commit** — `feat: track one-time tutorial completion in the save`.

---

### Task 3: Goal bar

**Files:**
- Create: `src/lib/components/GoalBar.svelte`, `src/lib/components/goal.test.ts`
- Modify: `src/lib/components/ShopScreen.svelte`

**Interfaces:**
- Consumes: `game` store, `chapterForDay`, `rentDueOn`, `TOTAL_DAYS`, `VISITS_PER_DAY`.
- Produces: `data-testid="goal-bar"` with text `Day N of 21`, a rent countdown (`Rent in N days` / `Rent due today` / `The last ledger is closed`), and `Visitors N of 3` (hidden when `phase === 'ending'`).

- [x] **Step 1: Failing test** — render `GoalBar` with fixtures for day 1 (`Rent in 6 days`), day 7 (`Rent due today`), and ending (no Visitors).
- [x] **Step 2: Run and confirm failure**.
- [x] **Step 3: Implement** the component and mount it under the shop status block, above the morning card.
- [x] **Step 4: Verify** goal tests + `pnpm check`.
- [x] **Step 5: Commit** — `feat: show the day, rent, and visitor goal bar`.

---

### Task 4: First-day coach and shelf highlight

**Files:**
- Create: `src/lib/components/FirstDayCoach.svelte`, `src/lib/components/coach.test.ts`
- Modify: `src/lib/components/ShopScreen.svelte`, `src/lib/components/IngredientShelf.svelte`

**Interfaces:**
- Coach props: `{ customerName: string; tags: [Tag, Tag]; slots: readonly string[]; result: BrewOutcome | null; suggested: string[] | null; onDismiss: () => void }`.
- `IngredientShelf` gains `suggestedIds?: readonly string[]`; matching cards get a soft `suggested` ring, no behavior change.
- `ShopScreen` shows the coach only when `!$game.tutorialDone && $game.day === 1 && $game.phase === 'service'`; it passes `suggestedBrew` only while no result.

- [x] **Step 1: Failing test** — render `ShopScreen` with `serviceSave({ tutorialDone: false })`: coach shows the Widow + `Warm + Light` and names Hydrogen/Sodium/Copper; click those three, coach says press Brew; brew, coach shows the clean result; click Next visitor, coach disappears and `tutorialDone` is true. Add a dismiss-button test.
- [x] **Step 2: Run and confirm failure**.
- [x] **Step 3: Implement** the three steps from store props; mark `tutorialDone` on dismiss and when `nextCustomer`/`finishService` runs on day 1 after a result.
- [x] **Step 4: Verify** coach + shop tests, `pnpm check`.
- [x] **Step 5: Commit** — `feat: guide the first customer with a one-time coach`.

---

### Task 5: Title copy and documentation

**Files:**
- Modify: `src/lib/components/TitleScreen.svelte`, `README.md`

**Interfaces:** none.

- [x] **Step 1: Update the title lede** to the 21-day/rent goal and add the rule line: “A potion is three ingredients; their main essences must cover the customer’s two tags.”
- [x] **Step 2: README** — note the goal bar, first-day coach, and that returning saves skip it.
- [x] **Step 3: Verify** — page test still finds the shop heading; `pnpm lint`.
- [x] **Step 4: Commit** — `docs: explain the shop goal on the title and in the README`.

---

### Task 6: Full regression

- [x] **Step 1** — `pnpm validate && pnpm check && pnpm lint && pnpm test && pnpm build && pnpm check:bundle && pnpm e2e`
- [x] **Step 2** — Browser check at 390×844: new game shows the goal bar and coach; existing seeded save shows the goal bar but no coach; coach does not cover Brew or Next.
- [x] **Step 3** — Commit any fixes, then deploy with `pnpm deploy` and push.

## Self-Review

- Goal bar: Task 3. Coach + highlight: Task 4. Suggestion helper: Task 1. One-time save: Task 2. Title/Help copy: Task 5. Regression/deploy: Task 6.
- Review Focus lines each have an owning test: backfill Task 2, decline/dismiss Task 4, valid suggestions Task 1, non-blocking Task 4, rent/ending Task 3.
- Interfaces match: `suggestBrew(stock, tags, elements)`, `suggestedIds`, `tutorialDone`.
