# 02 — Full days, full cast

- **Type:** AFK
- **Labels:** `ready-for-agent`, `content`
- **User stories:** US2
- **Blocked by:** [Issue 01 — Open the shop](01-open-the-shop.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Tasks 3–5, 7, 9

## What to build

Replace the skeleton content with the real shop. Thirty elements, twenty-four named potions, thirty characters and sixty-three visits, and a 21-day manifest with three chapters, rents, recurring characters, and story beats.

Customers are stock-aware: a visit is offered only if the current shelf can source both desired tags with three usable units. If nothing is eligible, the day becomes a quiet day with a story beat and no penalty. Three customers are served per day, then the shop moves to evening.

Random selection is seeded and stored in the save; the same seed and day reproduce the same visitors.

## Acceptance criteria

- [ ] 30 elements, 24 potions, 30 characters, and 63 unique visits validate.
- [ ] Every day has a story beat; rents land on days 7, 14, and 21.
- [ ] No unwinnable request is ever shown; empty eligibility becomes a quiet day.
- [ ] Three customers are served per day, with no visit repeated in a day.
- [ ] Seeded selection reproduces the same visitors on resume.
- [ ] The full content validator passes.
- [ ] Tests and svelte-check pass; the work is committed.

## Blocked by

[Issue 01 — Open the shop](01-open-the-shop.md)
