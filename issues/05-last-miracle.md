# 05 — The last miracle

- **Type:** AFK
- **Labels:** `ready-for-agent`, `story`
- **User stories:** US5, US10
- **Blocked by:** [Issue 03 — The evening ledger](03-evening-ledger.md), [Issue 04 — The recipe book and journal](04-book-and-journal.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Task 11

## What to build

Deliver the authored arc. Morning scenes carry chapter beats and choices that set flags and relationships without blocking the shop. The day-20 choice can set closedTheShop; the run still reaches the day-21 ending scene.

All three endings are reachable and distinct: The Shop Endures, The Last Miracle, and A Quiet Closing. The ending screen names what the shop chose to be and shows the three relationship lines.

## Acceptance criteria

- [ ] Morning scenes play on every authored day and never block service.
- [ ] Choices set flags/relationships and persist across reload.
- [ ] The day-20 close choice reaches A Quiet Closing without early termination.
- [ ] All three endings are reachable; conditions are deterministic.
- [ ] Ending screens are keyboard and screen-reader accessible.
- [ ] Tests and svelte-check pass; the work is committed.

## Blocked by

[Issue 03 — The evening ledger](03-evening-ledger.md), [Issue 04 — The recipe book and journal](04-book-and-journal.md)
