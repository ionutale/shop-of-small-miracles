# 08 — Access for everyone

- **Type:** AFK
- **Labels:** `ready-for-agent`, `a11y`
- **User stories:** US8
- **Blocked by:** [Issue 07 — Installable and offline](07-installable-offline.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Task 14

## What to build

Make the shop playable without a mouse or sight. Shelf, cauldron, market, book, and journal are keyboard-operable; focus is visible and returns after dialogs; brew results and payments are announced politely; tags are labeled text; contrast is at least 4.5:1; targets are at least 44 px.

Axe reports zero violations on Shop, Market, Book, Journal, and Settings.

## Acceptance criteria

- [ ] A keyboard-only player can serve the first customer and reach the ending.
- [ ] Focus is trapped in dialogs and restored on close.
- [ ] Live regions announce brew results, payments, and rent setbacks once.
- [ ] Axe reports zero violations on all five screens.
- [ ] No interaction is hover-only; 360 px targets are at least 44 px.
- [ ] Tests, svelte-check, and e2e pass.

## Blocked by

[Issue 07 — Installable and offline](07-installable-offline.md)
