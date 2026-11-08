# 04 — The recipe book and journal

- **Type:** AFK
- **Labels:** `ready-for-agent`, `book`
- **User stories:** US4
- **Blocked by:** [Issue 02 — Full days, full cast](02-full-days-full-cast.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Task 10

## What to build

Give the shop a memory. The recipe book records every brewed potion: named potions show their title, tag pair, effect prose, and discovery day; unknown combinations get generated descriptive names in an "Unfiled" section. Filter by tag and search.

The journal holds chapter recaps, the three recurring characters, relationship hints, and the previous alchemist’s letters. It is a story log, not a quest list.

## Acceptance criteria

- [ ] Every brew is recorded once; identical tag sets do not duplicate.
- [ ] Named potions show title, tags, effect, and day.
- [ ] Unknown combinations receive a stable generated name.
- [ ] Book filter and search work on discovered entries only.
- [ ] The journal reflects chapter, relationships, and collected letters.
- [ ] Tests and svelte-check pass; the work is committed.

## Blocked by

[Issue 02 — Full days, full cast](02-full-days-full-cast.md)
