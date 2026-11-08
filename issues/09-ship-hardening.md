# 09 — Ship hardening

- **Type:** AFK
- **Labels:** `ready-for-agent`, `qa`
- **User stories:** US1–US10
- **Blocked by:** [Issue 08 — Access for everyone](08-access-for-everyone.md)
- **Spec:** [A Shop of Small Miracles design](../docs/superpowers/specs/2026-11-07-shop-of-small-miracles-design.md)
- **Plan:** [Implementation plan](../docs/superpowers/plans/2026-11-07-shop-of-small-miracles.md) — Task 15

## What to build

Close the loop. Add the regression e2e suite: first customer, mid-day resume, chapter shortfall, all three endings from seeded saves, offline reload, and a keyboard-only brew.

Enforce the 180 KB gzip initial-JS budget. Write the README: run, test, svelte-check, validate, build, preview, e2e, content authoring, the eligibility invariant, the soft-stakes rule, and static deployment.

## Acceptance criteria

- [ ] The full e2e suite passes, including resume, offline, endings, and keyboard.
- [ ] The bundle budget check passes at or below 180 KB gzip.
- [ ] The README covers run, test, validate, build, deploy, and content authoring.
- [ ] `pnpm validate && pnpm check && pnpm test && pnpm build && pnpm check:bundle && pnpm e2e` all pass.

## Blocked by

[Issue 08 — Access for everyone](08-access-for-everyone.md)
