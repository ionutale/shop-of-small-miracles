# 07 — Installable and offline

- **Type:** AFK
- **Labels:** `ready-for-agent`, `pwa`
- **User stories:** US6
- **Blocked by:** [Issue 06 — Candlelight and comfort](06-candlelight-comfort.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Task 13

## What to build

Ship the installable PWA. The manifest supplies the name, parchment theme, standalone display, and 192/512 icons. The service worker precaches the shell, fonts, icons, and content. After one online load the shop opens offline and resumes the exact day.

A new version shows a refresh prompt instead of reloading mid-service.

## Acceptance criteria

- [ ] The manifest is linked and exposes 192×192 and 512×512 icons.
- [ ] Installability passes.
- [ ] An offline reload after one online load opens the game.
- [ ] The update prompt appears for a waiting worker and refreshes on demand.
- [ ] Fonts and icons load from cache with no CDN.
- [ ] The PWA e2e test passes.

## Blocked by

[Issue 06 — Candlelight and comfort](06-candlelight-comfort.md)
