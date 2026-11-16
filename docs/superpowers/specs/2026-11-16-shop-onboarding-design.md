# Shop onboarding — design

**Date:** 2026-11-16
**Status:** proposed

## Intent

New players understand the shop's mood but not its objective or first action. The game never states that the run lasts 21 days, that rent is due at chapter ends, or that three ingredients' **primary** essences must cover the customer's two tags with one doubled (required). This adds a calm, non-blocking layer that states the goal and walks the first customer, without turning the shop into a wizard.

## Goals

- State the 21-day/rent/ending goal on the title and in a persistent in-shop bar.
- Explain the first customer's three taps in context: choose three essences, brew, read the result.
- Highlight the correct three shelf cards for the first customer only.
- Disappear permanently once the player finishes or dismisses the coach; never return for existing saves.
- Keep every existing flow and e2e path playable.

## Non-goals

- Blocking tutorial mode, modal wizard, or forced step order.
- Hints for later customers or hidden recipes.
- Redesigning the shelf, market, story, or endings.

## Approaches

1. **Layered onboarding (chosen).** A `GoalBar` under the day stats, a `FirstDayCoach` card above service, a pure `suggestBrew` helper for the suggested trio, and clearer title copy. Non-blocking; the coach advances from store state.
2. **Goal bar only.** Cheapest, but leaves the first three taps unexplained.
3. **Blocking wizard.** Rejected: against the shop's quiet, player-led tone and would break every e2e flow.

## Behaviour

### Goal bar

Always visible in the shop, under the day stats:

`Day 3 of 21 · Chapter 1 · Rent in 4 days · Visitors 1 of 3`

- Rent countdown to the next of days 7/14/21; “Rent due today” on those days; after day 21 “The last ledger is closed”.
- Visitors hidden on the ending screen (existing rule). Uses existing chapter/rent helpers.

### First-day coach

Visible only when `tutorialDone === false`, day 1, service phase, and the first customer is present. Three steps derived from local shop state:

1. **Pick three** (fewer than 3 slots): “The Widow asks for Warm + Light. Three ingredients brew a potion from their main essences; one can be doubled. Try Hydrogen, Sodium and Copper.” Suggested cards get a soft ring.
2. **Brew** (3 slots, no result): “Three essences are in the cauldron. Press Brew.”
3. **Read it** (result present): on a clean brew, “That is a clean miracle: full pay and reputation up. Press Next visitor.” On a miss, “That was a gentle no. The ingredients were spent; try Hydrogen, Sodium and Copper.” On a decline, “Declining costs nothing; try the brew when you are ready.”

The card has a quiet **Hide guide** action that sets `tutorialDone`. Choosing Next visitor or Evening after the first result also marks it done. It never blocks the shop.

### Hint helper

`suggestBrew(stock, visitTags, elements)` returns three element ids whose primaries cover both tags with one doubled (required), preferring distinct elements and in-stock units; `null` when impossible. Pure, tested, reusable.

### Save

New field `tutorialDone: boolean`. New saves and resets start `false`. `parseSave` backfills `true` for older saves so returning players are not tutored. No version bump; same backfill pattern as other fields.

### Title

Replace the generic lede with: “Keep the shop for 21 days. Serve three visitors a day, pay the rent, and choose what the shop becomes.” Add one line: “A potion is three ingredients; their main essences must cover the customer’s two tags.”

## Parts

- `src/lib/game/hint.ts` + test.
- `src/lib/components/GoalBar.svelte`, `FirstDayCoach.svelte` + tests.
- `ShopScreen.svelte`: mount coach above service, goal bar under stats; pass `suggestedIds` while coaching.
- `IngredientShelf.svelte`: optional `suggestedIds` prop and a soft highlight class.
- `TitleScreen.svelte`: new lede + rules line.
- Store: `dismissTutorial` action; save field/backfill.
- README/help: mention the goal bar and coach.

## Verification

- Unit: hint determinism/validity; goal bar states; coach steps and dismissal; save backfill.
- e2e: first customer still works after the coach; existing 31 tests stay green; a11y/44 px unchanged.
- `pnpm validate && pnpm check && pnpm lint && pnpm test && pnpm build && pnpm check:bundle && pnpm e2e`.
