# 01 — Open the shop

- **Type:** AFK
- **Labels:** `ready-for-agent`, `skeleton`
- **User stories:** US1, US9
- **Blocked by:** None — can start immediately
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Tasks 1–3 (subsets), 6, 8, 9

## What to build

Ship a walking skeleton through every layer. A mobile SvelteKit SPA opens on a candlelit shop with one customer, a shelf of six elements, a three-slot cauldron, and a tag preview. Select three ingredients, brew, read the customer’s line, take the coins, and serve the next visitor. Reload and the shop is exactly where it was.

The content set is deliberately small: six elements and two potions. The next slices replace it with the full cast and the full day.

The core rules are real from this slice: potion tags are the distinct primary tags of the three ingredients, one tag is doubled for potency, a clean brew pays, and a mismatched brew consumes ingredients and ends the visit politely.

## Acceptance criteria

- [ ] A cold start serves one customer by tap alone in under 60 seconds.
- [ ] Three ingredients produce the correct distinct tags and potency.
- [ ] A clean brew pays, raises reputation by 1, and records the potion.
- [ ] A mismatched brew consumes ingredients, ends the visit, and does not lower reputation.
- [ ] Politely declining consumes nothing.
- [ ] Reload restores the same customer, stock, coins, and phase.
- [ ] Tests, svelte-check, and the smoke build pass; the work is committed.

## Blocked by

None — can start immediately
