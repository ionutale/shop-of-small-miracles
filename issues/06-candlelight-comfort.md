# 06 — Candlelight and comfort

- **Type:** AFK
- **Labels:** `ready-for-agent`, `art`
- **User stories:** US7
- **Blocked by:** [Issue 05 — The last miracle](05-last-miracle.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Tasks 12, 10 (settings)

## What to build

Make the shop feel like candlelight and paper. Generate deterministic ink portraits from a character seed; draw eighteen inline tag icons; add parchment fiber, deckled edges, wax seals, candle glow, page turns, and steam. No commissioned art and no external images.

Sound is procedural WebAudio only: paper, glass, a low room tone, and a soft chime on a clean brew. Settings control sound and reduced motion, offer install guidance, and reset progress in two steps.

## Acceptance criteria

- [ ] InkPortrait is deterministic for a seed and uses no external images.
- [ ] All 18 tags have a labeled icon, never color-only.
- [ ] Reduced motion removes flicker, steam, and page travel.
- [ ] Sound is procedural, mutable, and never throws when disabled.
- [ ] Settings persist; reset is two-step.
- [ ] Tests and svelte-check pass; the work is committed.

## Blocked by

[Issue 05 — The last miracle](05-last-miracle.md)
