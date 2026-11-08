# A Shop of Small Miracles — Issue Queue

Nine vertical-slice issues, published locally in dependency order. Each is a tracer bullet that cuts through data, logic, UI, persistence, and tests, and is demoable on its own.

- **Spec:** [Design doc](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md)
- **Tracker:** local markdown (no tracker configured).

| # | Issue | Type | Blocked by | Stories |
|---|-------|------|------------|---------|
| 01 | [Open the shop](01-open-the-shop.md) | AFK | — | US1, US9 |
| 02 | [Full days, full cast](02-full-days-full-cast.md) | AFK | [01](01-open-the-shop.md) | US2 |
| 03 | [The evening ledger](03-evening-ledger.md) | AFK | [02](02-full-days-full-cast.md) | US3 |
| 04 | [The recipe book and journal](04-book-and-journal.md) | AFK | [02](02-full-days-full-cast.md) | US4 |
| 05 | [The last miracle](05-last-miracle.md) | AFK | [03](03-evening-ledger.md), [04](04-book-and-journal.md) | US5, US10 |
| 06 | [Candlelight and comfort](06-candlelight-comfort.md) | AFK | [05](05-last-miracle.md) | US7 |
| 07 | [Installable and offline](07-installable-offline.md) | AFK | [06](06-candlelight-comfort.md) | US6 |
| 08 | [Access for everyone](08-access-for-everyone.md) | AFK | [07](07-installable-offline.md) | US8 |
| 09 | [Ship hardening](09-ship-hardening.md) | AFK | [08](08-access-for-everyone.md) | US1–US10 |

## User stories

- **US1** — Serve a customer by brewing three ingredients.
- **US2** — Run a full 21-day shop with a recurring cast.
- **US3** — Buy stock and upgrades and keep rent paid.
- **US4** — Revisit discoveries and the shop journal.
- **US5** — Reach one of three endings.
- **US6** — Install the shop and play offline.
- **US7** — Control sound and motion, and reset safely.
- **US8** — Play with a keyboard or screen reader.
- **US9** — Return later and resume exactly.
- **US10** — Watch the previous alchemist’s story unfold.

## Working notes

- Publish order: 01 → 02 → 03/04 → 05 → 06 → 07 → 08 → 09.
- Slices 03 and 04 are independent once 02 lands.
- All nine are AFK: tone, content rules, and soft stakes are settled.
- The issue body is behavioral. The plan task linked in each header carries exact files, interfaces, tests, and commands.
- Binding rules: 30 elements, 63 visits, 3 ingredients, stock-aware customers, no game over, no unwinnable request.
- Do not implement ahead of a failing test in the linked plan task.
