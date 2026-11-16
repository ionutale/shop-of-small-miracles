# Shop badges — design

**Date:** 2026-11-16
**Status:** shipped

## Intent

Give returning players a quiet reason to explore the shop's breadth — endings, relationships, named potions, and clean brewing — without turning the cozy run into a score chase. Badges are pure keepsakes: no bonuses, no currency, no balance changes.

## Goals

- Thirteen collectible badges spanning one-run achievements and career milestones.
- A small career ledger that survives reset: clean brews, visitors served, named potions seen, endings seen, earned badges.
- Show earned badges with flavor and day, and locked badges with a hint, in the Journal.
- Badge awards are automatic, idempotent, and persisted after reload and reset.

## Non-goals

- XP, levels, scores, leaderboards, streaks, or gameplay perks.
- New navigation tabs or modal interruptions.
- Rewarding the same event twice or backfilling badges for actions taken before this feature.

## Badge set

| Badge | Earned when |
|---|---|
| First Light | First clean brew |
| Open for Business | 50 visitors served (career) |
| The Long Bench | 10 clean brews (career) |
| Paper Trail | 5 named potions seen (career) |
| The Whole Book | All 24 named potions seen (career) |
| The Widow's Friend | Widow relationship ≥ 8 in the current run |
| Salt and Company | Merchant relationship ≥ 8 |
| The Apprentice's Trust | Apprentice relationship ≥ 8 |
| Three Chairs | All three relationships ≥ 6 in the same run |
| The Shop Endures | Reach that ending |
| The Last Miracle | Reach that ending |
| A Quiet Closing | Reach that ending |
| Chair Keeper | Reach an ending with `keptTheChair` |

Thirteen badges ship in this version.

## Data

`SaveState` gains:

```ts
records: {
  cleanBrews: number;
  served: number;
  namedSeen: string[];
  endings: EndingRecord['id'][];
  chairEndings: number;
};
badges: { id: string; day: number }[];
```

- New saves: zeroed records, empty badges.
- Legacy saves: backfill zero/empty; earned badges begin from this version (no retro-award).
- `resetGame` keeps `records` and `badges`, preserving career progress and the collection.
- Corrupt-save recovery starts both empty.
- `badges` stores `string` ids so parsing tolerates unknown values; `BADGES` narrows them at render time.

## Behavior

- `brew()` increments `served`, increments `cleanBrews` on a clean outcome, and adds the named potion (if any) to `namedSeen`.
- `decline()` increments `served`.
- Reaching the ending records the selected ending id once.
- `chairEndings` increments once, only when a newly recorded ending has `keptTheChair`; a repeated or fallback ending record does not increment it.
- A pure `syncBadges(save)` adds every newly satisfied badge with the current day; it is idempotent and called from the store subscription before autosave.
- Badge evaluation reads only the save; no timers, randomness, or network.

## Journal

A new “Small honors” section above the letters:

- Header with `earned / total`.
- Earned: title, flavor line, `earned day N`.
- Locked: title and hint (e.g. “Brew a clean potion”), visually muted, never hidden.
- Keyboard/screen-reader list semantics; no new interaction.

## Testing

- Pure badge evaluation for each condition and idempotent sync.
- Store: clean brew, decline, named potion, ending record, reload persistence, reset preservation.
- Journal: earned and locked rendering, counts.
- Regression: existing 216 unit / 32 e2e stay green; axe and 44 px unaffected.

## Approaches

1. **Career ledger in the save + pure sync (chosen).** Small schema addition, one pure module, automatic awards in the existing subscription. Reset preserves the ledger.
2. **Separate localStorage key.** Isolates badges from save recovery, but adds a second storage contract and cross-browser import/export work; rejected for scope.
3. **Derive badges from the current run only.** No schema change, but endings/24-potion badges become impossible across resets; rejected because it contradicts “collectible”.
