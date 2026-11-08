# A Shop of Small Miracles — Design

Date: 2026-11-07
Status: awaiting human approval
Scope: Game C of three independent games. Mendeleev's Mess (A) and Critical Mass (B) are out of scope.

## 1. Intent

A storybook shop sim about an alchemist in a small, cold town. Customers arrive with small problems; the player brews small miracles by combining three periodic-table elements, each carrying an essence. There is no chemistry here: elements are magical ingredients, and the potion is judged by the essences it carries.

The game is warm and melancholic. Rent is real, reputation matters, and some endings ache, but the shop never closes because the player failed a level. Twenty-one days, three chapters, recurring faces, and a quiet mystery about the previous alchemist's last miracle.

It is deliberately unlike its siblings: Mendeleev's Mess is comic discovery, Critical Mass is tense sci-fi strategy, and this is slow folklore about people, stock, and small kindnesses.

## 2. Goals, non-goals, anti-goals

### Goals

- Deliver a complete 2–3 hour story across three chapters and 21 days.
- Make brewing a deduction of essences, not memorization of fixed recipes.
- Make customers feel like people, not order tickets.
- Keep stakes soft: setbacks change the story, never end the game.
- Reward attention to tags, stock, and regulars with better endings.
- Ship a mobile-first installable PWA with offline saves.
- Use a distinct SvelteKit stack and a book-like visual language.

### Non-goals

- No real chemistry, compounds, or element-to-element forging.
- No combat, timers, or reflex challenges.
- No hard fail or game-over screen.
- No backend, accounts, trading, or multiplayer.
- No connection to the other two games.
- No procedural story generation; the arc is authored.

### Anti-goals

- It must not become a spreadsheet shop with a story bolted on.
- It must not punish experimentation with permanent loss.
- It must not treat the elements as a trivia quiz.
- It must not look like the neon lab or the notebook; it is candlelight and paper.

## 3. Decisions already made

- Name: **A Shop of Small Miracles**. Project folder: `shop-of-small-miracles`.
- Genre: narrative alchemy shop with soft stakes.
- Crafting: three ingredients, essence tags, customer tag matching.
- Day: morning story → three customers → evening market.
- Tone: melancholic folklore, all-ages.
- Stakes: rent and reputation cause story setbacks, never game over.
- Scope: three chapters, 21 days, ~30 characters and 63 visits, ~24 named potions, ~30 elements, 12 upgrades, multiple endings.
- Platform: mobile-first PWA.
- Stack: SvelteKit + Svelte 5, adapter-static, `@vite-pwa/sveltekit`, Fontsource fonts.

## 4. Approaches considered

### Crafting

| Approach | Trade-off | Verdict |
|---|---|---|
| Essence tags | Deduction, customer fit, distinct from A's hidden recipes; needs tag clarity in UI | **Chosen** |
| Exact hidden recipes | Familiar Doodle loop; too close to Game A, and memorization replaces judgment | Rejected |
| Spatial brewing map | Tactile and visual; heavy UI and less storybook pace | Rejected |

### Stakes

| Approach | Trade-off | Verdict |
|---|---|---|
| Soft stakes, no game over | Keeps the cozy promise; failure still has weight | **Chosen** |
| Hard fail and restart | Tension, but breaks the melancholic slice-of-life tone | Rejected |
| No fail at all | Pure cozy; rent and reputation stop meaning anything | Rejected |

### Stack

| Approach | Trade-off | Verdict |
|---|---|---|
| SvelteKit PWA | Small runtime, excellent transitions, static deploy; third framework across the family | **Chosen** |
| Other framework PWA | Reuses familiar tooling; larger runtime and a second framework | Rejected |
| Vanilla TypeScript | Lightest; hand-built screens and state for a story-heavy game | Rejected |

## 5. Core loop

### Day structure

1. **Morning:** a story beat, letter, or visitor. May present a choice that sets a flag.
2. **Service:** three customers, one at a time, drawn from the chapter's pool. A customer is eligible only if the current shelf can source both desired tags with enough units for a three-ingredient brew; if no eligible customer exists, the day becomes a **quiet day** (a short story beat, no sale, no penalty). Each request is written in plain, often indirect language, plus two desired essence tags.
3. **Brewing:** the player selects three ingredients from stock. The cauldron previews the resulting tags, potency, and likely side effects. Confirm commits the ingredients. Brewing consumes one unit of each ingredient.
4. **Serving:** if both desired tags are present, the customer accepts. Extra distinct tags beyond the two cause a side effect and reduce payment. A missing tag means the customer politely declines.
5. **Evening market:** buy elements from the day's rotating offer, then buy at most one shop upgrade.
6. **Night:** autosave. Next morning.

Each customer allows **one brew**. The preview is exact, so a mismatch is a deliberate experiment, not a trick: the customer declines, the ingredients are consumed, and reputation does not fall. The missed sale is the cost. The player may also **politely decline** before brewing; no ingredients are consumed and no penalty applies, but no sale is made. The Apprentice upgrade refunds the ingredients of one mismatched brew per day.

### Customer eligibility and the quiet day

- The engine filters the chapter pool to visits whose two desired tags can each be sourced by at least one element on the current shelf, with at least three usable units in total.
- If no visit is eligible, the day runs as a quiet day: one short story beat, no customer, no reputation change, and the evening market still opens.
- This is a hard invariant: an unwinnable request is never presented.

### Seeded days

- The 21-day manifest is authored: chapter beats, recurring-character days, rent days, and story choices are fixed.
- Non-arc customer visits and the evening market are drawn with a seeded PRNG stored in the save. The same seed and day reproduce the same offers and visitors.
- Market offers are generated for the evening after service; customer eligibility uses only the shelf, never a market that has not happened yet.

### Essence tags

- Every element has one **primary** tag and one **secondary** flavor tag. Only primary tags define the potion.
- There are 18 tags: Light, Still, Warm, Cold, Sharp, Soft, Heavy, Dreaming, Bitter, Bright, Bound, Ground, Spark, Calm, Cleanse, Radiant, Grief, Hollow.
- A potion's tags are the distinct primary tags of its three ingredients, in order of addition.
- The same element may be used twice or three times if stock has the units.
- Because a potion uses three ingredients and requests name two tags, a clean brew necessarily doubles one tag. That is intended: the extra ingredient is what makes the miracle clean.
- If two or three ingredients share a primary tag, that tag is **potent**: it still counts once, but adds value and a warmer reaction.
- Customer requests name two tags. The prose is the personality; the two tag chips are the actual contract and are always visible.
- Matching both tags succeeds. Extra distinct tags trigger one side effect each, drawn from the tag's small table, reduce payment by 30%, and add a line of story flavor. Missing a tag fails.
- A potion with both tags and no extras is a **clean** brew: full pay, +1 reputation, and a better customer line.
- Unknown tag combinations are legal. The recipe book records them with a generated descriptive name ("a warm, dreamless draught"); 24 named potions cover the story's important requests.

### Stock, money, and reputation

- Each element has units in stock. Shelf capacity starts at 30 units and can be upgraded.
- Each brew consumes 1 unit of each of its three ingredients.
- The evening market offers 8 elements from a rotating pool, each with a price (2–6 coins) and a daily supply (1–3 units). Buying is optional.
- A sale pays: base 12 + 4 per matched tag + 4 for potency − 3 per extra tag, modified by reputation. Minimum 5 coins.
- Reputation starts at 5/10. Clean brews and story kindness raise it; rejections, side effects, and missed rent lower it. Reputation adjusts tips by ±20% and gates a few story lines.
- **Rent** is due at the end of each chapter: 40, 80, 120 coins.
- Missing rent is a **setback**, not a game over: the landlord takes an upgrade or a shelf slot, reputation drops 2, coins are set to 10, and a story branch opens. The shop continues.

### Chapters, story, and endings

- **Chapter 1 — The Widow's Lamp (days 1–7):** establishing the shop; a widow asks for light that does not burn. Introduces the previous alchemist's empty chair.
- **Chapter 2 — The Salt Road (days 8–14):** a traveling salt merchant, a sickness in the lower town, and the first sign that the last miracle was not a kindness.
- **Chapter 3 — The Last Miracle (days 15–21):** the truth about the previous alchemist, a final request from a recurring character, and a choice about what the shop is for.
- Recurring characters: the widow, the salt merchant, and the landlord's apprentice. Each has a relationship value raised or lowered by choices.
- **Endings (3):**
  - **The Shop Endures** — stable reputation and rent paid; bittersweet, quiet, warm.
  - **The Last Miracle** — high relationships and the mystery resolved with compassion; the fullest ending.
  - **A Quiet Closing** — repeated setbacks, or choosing to close on day 20; melancholic, not punitive.
- The day-20 choice sets `closedTheShop`. The run still reaches the day-21 ending scene; there is no early termination and no extra phase. Endings are selected by reputation, three relationship values, and the story flags (including `closedTheShop`). No ending is labeled "bad"; the ending screen names what the shop chose to be.

### First run

- A short letter from the previous alchemist, then a guided first customer wanting **Warm + Light**.
- The starting stock contains the exact three ingredients for a clean first brew, so the tutorial teaches tags without a pop-up lecture.

## 6. Content

### Elements (~30)

Real elements as magical ingredients, each with a primary and secondary tag. Examples:

| Element | Primary | Secondary |
|---|---|---|
| H Hydrogen | Light | Volatile |
| He Helium | Still | Hollow |
| C Carbon | Ground | Deep |
| N Nitrogen | Dreaming | Sharp |
| O Oxygen | Bright | Breath |
| Na Sodium | Warm | Salt |
| Mg Magnesium | Calm | White |
| Si Silicon | Still | Bound |
| S Sulfur | Sharp | Brimstone |
| Cl Chlorine | Cleanse | Bitter |
| K Potassium | Spark | Warm |
| Ca Calcium | Bound | White |
| Fe Iron | Heavy | Ground |
| Cu Copper | Warm | Conduct |
| Ag Silver | Still | Moon |
| Sn Tin | Soft | Weight |
| I Iodine | Cleanse | Sharp |
| Hg Mercury | Dreaming | Quicksilver |
| Au Gold | Radiant | Bound |
| Pb Lead | Heavy | Grief |
| … | … | … |

- Exactly 30 elements at launch.
- Each primary tag must be used by at least one element; every element must have a distinct primary/secondary pair.
- Elements are bought, not discovered. The pleasure is choosing them, not unlocking them.

### Named potions (~24)

- A named potion is a tag pair with a title and a short effect description, e.g.:
  - **Lamplight** — Bright + Warm: a steady glow that does not burn.
  - **Hush** — Still + Dreaming: sleep without dreams.
  - **Salt Tears** — Grief + Cleanse: crying that helps.
  - **Iron Promise** — Heavy + Bound: a vow that holds.
  - **Green Quiet** — Calm + Ground: the body remembers peace.
- Customers in the story ask for the named effects; the prose points at the tags without naming them outright.
- Unknown combinations still brew and can satisfy a request; the book gives them generated names.

### Customers (~30 characters, 63 visits)

- 3 per day × 21 days = 63 visit slots. The cast is ~30 characters; about a third return for a second or third visit with a different request. Reusing a face is intentional, but a repeat visit always has new prose and tags.
- Data is characters → visits. Each visit has request prose, two desired tags, a clean-brew line, a side-effect line, a decline line, and an optional story flag. The character owns name, portrait recipe, and arc metadata.
- Three recurring characters have fixed appearance days so their arcs land; other visits are drawn from the chapter pool.
- Customer writing rules: melancholic folklore, all-ages, no cruelty, no gore, no moralizing. Requests are concrete and human.

### Upgrades (12)

- **Shelf:** +10 stock capacity.
- **Market ledger:** 10% discount.
- **Brass scales:** +2 coins per clean brew.
- **Reputation:** start each chapter +1 (cap 10).
- **Stillroom:** one extra market offer slot.
- **Cauldron:** preview side effects before brewing (already standard; this upgrade reveals the generated potion name).
- **Ledger:** once per day, swap the next customer for another eligible visit.
- **Warm stove:** +1 reputation on the first clean brew each day.
- **Apprentice:** once per day, the ingredients of a mismatched brew are refunded.
- **Glass jars:** +2 units per market purchase.
- **Old sign:** +10% tips.
- **The empty chair:** story upgrade; unlocks a final scene and the best ending path.
- At most one upgrade per evening.

### Story flags and relationships

- Flags: `helpedWidow`, `readTheLetter`, `saltDebt`, `keptTheChair`, `closedTheShop`.
- Relationships: widow, merchant, apprentice (0–10).
- Endings read reputation, relationships, and flags; no hidden score.

## 7. Screens and interaction

### Title and save

- Title: shop sign, candle, "Continue" if a save exists, "New game", "Settings".
- One save slot; no accounts.

### Morning

- A letter or story card on parchment. Tap to continue. Choices appear as wax-sealed buttons; choices set flags or relationships.

### Shop (primary)

- **Top:** day, chapter, coins, reputation.
- **Customer:** ink portrait, name, request prose, two tag chips, and a "politely decline" action.
- **Cauldron:** three ingredient slots; tap an element from the shelf, tap a slot or add directly; clear slots.
- **Preview:** resulting distinct tags, potency, side effects, estimated pay. Confirm brew.
- **Result:** customer line, payment, reputation change, side effect vignette. A mismatch gets a kindly decline line, not a failure buzzer.
- **Quiet day:** when no visit is eligible, a short story beat replaces the customer queue; the market still opens.
- **Next customer** or **Evening** when all three are served.

### Shelf and market

- Shelf: elements in stock, with units and tags. Filter by tag; tap for a detail card.
- Market: 8 offers, prices, daily supply, buy buttons; stock capacity shown. Then one upgrade.
- Upgrade list: 12 cards, cost, effect, one-line flavor; locked if unaffordable.

### Recipe book

- Named potions discovered, tag pairs, effect prose, and the combination that first produced them.
- Unknown generated potions appear in a separate "Unfiled" section.
- Search/filter by tag.

### Journal

- Chapter recap, recurring characters, relationship hints, and the previous alchemist's letters.
- No quest log; the story is the log.

### Chapter end and endings

- Rent scene, setback or paid, chapter card, next chapter.
- Ending screen: a final page, the three relationship lines, and "The shop chose to be…" with a short epilogue. New game plus? No; a chapter select for endings is acceptable if flagged.

### Settings and help

- Sound, reduced motion, install guidance, reset all progress (two-step), about.
- Help: tags, clean brew, potency, side effects, rent, soft stakes.

## 8. Visual system

- **Surface:** parchment `#F0E2C4`, ink `#3B2A1A`, brass `#B08A4F`, deep green `#3E4A3A`, burgundy `#6E2F3A`, candle glow `#E8B86A`.
- **Paper:** subtle fiber texture, deckled edges, faint ruled lines only in the recipe book.
- **Cards:** pressed-flower borders, serif labels, small ink icons for tags.
- **Typography:** self-hosted `Cormorant Garamond` for prose and `Caveat` for handwriting; numbers in `Cormorant`. Fontsource, OFL, no CDN.
- **Motion:** page turns, candle flicker, steam curls, wax seals pressing. Slow, 250–500 ms. Reduced motion removes flicker, steam, and page travel.
- **Audio:** procedural WebAudio only: paper, glass, a low room tone, a soft chime on a clean brew. No music files in v1. Mute toggle.
- **Art pipeline:** no commissioned illustrations. Portraits are SVG ink silhouettes assembled from seeded face, hair, and prop parts in an `InkPortrait` component; tag icons are 18 inline SVGs; paper, deckled edges, borders, candle, and wax seals are CSS/SVG. This keeps the look consistent and the scope finite.
- **Accessibility:** tags are never color-only; text contrast ≥ 4.5:1; 44 px targets; keyboard selection; live announcements for brew results and payments.

## 9. PWA, storage, offline

- SvelteKit with `adapter-static` and an SPA fallback; the game is client-rendered, no server.
- `@vite-pwa/sveltekit` for manifest, icons, service worker, and update prompt.
- Manifest: name, short name, parchment theme `#F0E2C4`, standalone, portrait, 192/512 icons, maskable.
- Offline after first load: all screens, fonts, icons, and content cached.
- Save key: `small-miracles:save:v1` in localStorage.
- Save shape: version, seed, RNG state, day, chapter, phase, coins, reputation, rent setbacks, shelf stock, discovered potions, flags, relationships, active visit id, served-today list, quiet-day flag, market offers, upgrades, settings, story position.
- Autosave after every customer, brew, purchase, and phase change; resume restores the exact day and phase.
- Corrupt save: start a fresh save with a visible notice; never crash.
- Reset all progress is two-step and separate from closing the current day.

## 10. Architecture

- **Pure engine** in `src/lib/game/`, no Svelte:
  - `brew(stock, ingredientIds)`, `evaluatePotion(tags, request)`, `pricePotion(...)`, `serveCustomer(...)`, `advanceDay(...)`, `buyStock(...)`, `buyUpgrade(...)`, `selectEnding(...)`.
  - `createRun(seed)`, `nextRandom(state)`, `eligibleVisits(stock, chapter)`, `generateMarket(rng, chapter)`, and a persisted RNG state.
  - Tag rules, potency, side effects, pay, reputation, rent, eligibility, and ending selection are pure functions with data-driven tables.
- **Data:** `elements.ts`, `tags.ts`, `potions.ts`, `characters.ts` (with nested visits), `chapters.ts`, `upgrades.ts`, `endings.ts`, `sideEffects.ts`.
- **State:** Svelte 5 runes in a `GameStore` class, or a writable store with pure reducers; persistence through `storage.ts`.
- **Routing:** one game route (`/`) with phase components: `Morning`, `Shop`, `Market`, `ChapterEnd`, `Ending`, plus `/settings` or a modal. Since SSR is off and the app is static, no server load functions.
- **Components:** `CustomerCard`, `InkPortrait`, `TagChip`, `TagIcon`, `Cauldron`, `IngredientShelf`, `BrewPreview`, `QuietDay`, `Market`, `RecipeBook`, `Journal`, `RentScene`, `EndingPage`, `PwaUpdate`.
- **Fonts:** `@fontsource/cormorant-garamond`, `@fontsource/caveat`.
- **No** backend, database, auth, or state library beyond Svelte stores.

## 11. Validation and testing

### Content validator

- 30 elements, unique ids/symbols, valid primary/secondary tags, every tag used at least once.
- 24 named potions, unique tag pairs, valid tags, non-empty prose.
- 30 characters and 63 visits; every visit has exactly two desired tags; fixed recurring days are covered; every visit’s tags are representable by at least one element.
- 12 upgrades, valid costs/effects; 3 endings with reachable conditions.
- All story flags referenced by at least one choice and one ending.

### Engine unit tests (Vitest)

- Potion tags are the distinct primary tags of the chosen ingredients, in order.
- Potency when two or three ingredients share a primary tag.
- Clean brew: both tags, no extras, full pay, +1 reputation.
- Side effect: extras reduce pay and add a side-effect record.
- Missing tag: the customer declines, ingredients are consumed, and reputation does not change. Politely declining before brewing consumes nothing.
- One brew per customer; the Apprentice refund restores exactly one mismatched brew per day.
- Customer eligibility: every presented visit is solvable from current stock; no eligible visit produces a quiet day.
- Seeded RNG: the same seed and day reproduce the same visits and market offers; save/resume does not reroll.
- Market generation produces valid offers within the chapter pool and respects daily supply.
- Ingredient stock is consumed exactly once per brew; buying respects capacity.
- Reputation modifies pay within bounds.
- Rent due at chapter end; shortfall triggers the setback and not a game over.
- Ending selection covers all three endings, including `closedTheShop`, and no combination is unreachable.
- Save/load round-trip and corrupt-save recovery.

### Component tests (Testing Library for Svelte)

- Select three ingredients, preview tags, confirm; result and payment appear.
- Clear slots returns ingredients to the shelf without consuming.
- A mismatched brew ends the visit without reputation loss; politely declining consumes nothing.
- A quiet day renders its story beat and still opens the market.
- `InkPortrait` produces the same SVG parts for the same character seed.
- Market purchase updates coins, stock, and capacity.
- Upgrade purchase applies exactly one upgrade per evening.
- Recipe book records a new combination and named potion.
- Rent scene branches on paid/shortfall.
- Keyboard flow: tab shelf, select, tab cauldron, confirm.

### E2E (Playwright, 390×844)

- First guided customer is served in under 60 seconds.
- Reload mid-day restores the same customer, stock, and phase.
- A shortfall at chapter end shows a setback, not a game over.
- Offline reload works after first load.
- All three endings are reachable from seeded saves.
- Axe: zero violations on shop, market, book, settings.

### Performance

- Initial JS ≤ 180 KB gzip (SvelteKit should sit well under).
- Page transitions do not block input; fonts self-hosted and preloaded.

## 12. Success criteria

- A new player serves the first customer with only the in-fiction request and tag chips.
- Tags are always legible; every brew result can be explained by the three chosen ingredients.
- No customer decline feels arbitrary; the preview states side effects and pay, and no unwinnable request is ever shown.
- Rent shortfall changes the story and is never a game over.
- All three endings are reachable and clearly distinct.
- Reload restores the exact day, phase, and customer.
- The app installs, runs offline, and resumes.
- The game reads as candlelight and paper, not neon or notebook.

## 13. Left to the builder

- Final 30-element tag table, 24 potion names, and customer prose.
- Exact prices, rents, reputation thresholds, and ending conditions (one tuning file).
- Side-effect tables per tag.
- Chapter beats and recurring-character schedules.
- Whether the recipe book hints at undiscovered named potions.
- Svelte 5 store shape and the decision between runes and writable stores.
- Deployment host (static files).

## 14. Risks

- **Tag clarity:** a deduction game can feel arbitrary if tags are hidden. Mitigation: chips on every customer request and a preview that always shows the exact tags and pay.
- **Unwinnable visits:** stock can run dry. Mitigation: runtime eligibility filtering and the quiet-day fallback, tested as a hard invariant.
- **Art scope:** 30 portraits and 18 icons could balloon. Mitigation: seeded SVG portrait parts and inline tag icons, no commissioned art.
- **Soft stakes feeling weightless:** setbacks must cost something visible. Mitigation: rent takes an upgrade or shelf slot and opens a story branch.
- **Content volume:** 30 customers and 21 days need writing. Mitigation: reusable customer structures with authored prose, and a validator for tag coverage.
- **SvelteKit PWA complexity:** service worker and static fallback can fight. Mitigation: SPA mode, `adapter-static`, one route, and an early offline smoke test.
- **Tone drift:** melancholic can become dreary. Mitigation: small warmth in every customer, no cruelty, and endings that are sad but not punishing.
