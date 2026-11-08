# 03 — The evening ledger

- **Type:** AFK
- **Labels:** `ready-for-agent`, `economy`
- **User stories:** US3
- **Blocked by:** [Issue 02 — Full days, full cast](02-full-days-full-cast.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Tasks 6–7, 10 (rent/market)

## What to build

Make the shop survive. After service, the evening market offers eight elements at prices and daily supplies. The player buys stock within shelf capacity, then may buy exactly one of twelve upgrades.

At the end of each chapter, rent is due. Missing it is a setback, never a game over: the landlord takes an upgrade or shelf space, reputation drops 2, coins are set to 10, and a story branch opens. The shop continues.

## Acceptance criteria

- [ ] Market offers are eight unique elements, seeded and capped by daily supply.
- [ ] Purchases respect coins and shelf capacity.
- [ ] Exactly one upgrade is purchasable per evening; effects apply immediately.
- [ ] Rent lands on days 7, 14, and 21.
- [ ] A shortfall produces the setback, not an ending or a game-over state.
- [ ] Seeded market generation is identical after resume.
- [ ] Tests and svelte-check pass; the work is committed.

## Blocked by

[Issue 02 — Full days, full cast](02-full-days-full-cast.md)
