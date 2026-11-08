import { get, writable } from 'svelte/store';
import { VISITS_PER_DAY } from '../data/chapters';
import { visitById } from '../data/characters';
import { ELEMENTS } from '../data/elements';
import { namePotion } from '../data/potions';
import { ownedUpgrades } from '../data/upgrades';
import type { BrewOutcome, SaveState } from '../types';
import { brewTags, canBrew, consume, judgeBrew } from '../game/brew';
import { buyStock as buyStockState, buyUpgrade as buyUpgradeState } from '../game/economy';
import {
	continueAfterRent as continueAfterRentState,
	endDay as endDayState,
	endService as endServiceState,
	payRent as payRentState
} from '../game/day';
import { pickVisit } from '../game/eligibility';
import { createInitialSave, loadSave, saveGame, SAVE_KEY } from '../game/storage';

export { SAVE_KEY };

export const game = writable<SaveState>(createInitialSave());
export const recovered = writable(false);

let ready = false;

game.subscribe((state) => {
	if (ready) saveGame(state);
});

export function initGame(seed = 42, overrides: Partial<SaveState> = {}): void {
	const loaded = loadSave(seed);
	const state: SaveState = {
		...loaded.save,
		...overrides,
		settings: { ...loaded.save.settings, ...(overrides.settings ?? {}) },
		relationships: { ...loaded.save.relationships, ...(overrides.relationships ?? {}) }
	};

	ready = true;
	game.set(state);
	recovered.set(loaded.recovered);
	saveGame(state);
}

function potionKey(tags: readonly string[]): string {
	return [...tags].sort().join('+');
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/** One brew per customer. The result stays visible until the next visitor. */
export function brew(ids: readonly string[]): void {
	const current = get(game);
	const visit = visitById(current.activeVisitId);
	if (!visit || current.quietDay || current.lastResult) return;
	if (!canBrew(current.stock, ids)) return;

	let outcome: BrewOutcome = judgeBrew(
		brewTags(ids, ELEMENTS),
		visit,
		current.reputation,
		ownedUpgrades(current.upgrades)
	);
	let stock = consume(current.stock, ids);
	let apprenticeUsedToday = current.apprenticeUsedToday;
	let warmStoveUsedToday = current.warmStoveUsedToday;

	if (
		outcome.kind === 'decline' &&
		current.upgrades.includes('apprentice') &&
		!apprenticeUsedToday
	) {
		apprenticeUsedToday = true;
		stock = current.stock.map((entry) => ({ ...entry }));
		outcome = {
			...outcome,
			refunded: true,
			line: `${outcome.line} Your apprentice quietly returns the ingredients to the shelf.`
		};
	}

	if (outcome.kind === 'clean' && current.upgrades.includes('warm-stove') && !warmStoveUsedToday) {
		warmStoveUsedToday = true;
		outcome = { ...outcome, reputationDelta: outcome.reputationDelta + 1 };
	}

	const key = potionKey(outcome.tags);
	const alreadyFiled = current.discovered.some((potion) => potionKey(potion.tags) === key);
	const discovered =
		outcome.kind === 'decline' || alreadyFiled
			? current.discovered
			: [
					...current.discovered,
					{
						tags: outcome.tags,
						name: outcome.potionName ?? namePotion(outcome.tags),
						day: current.day
					}
				];

	game.set({
		...current,
		stock,
		coins: current.coins + outcome.pay,
		reputation: clamp(current.reputation + outcome.reputationDelta, 0, 10),
		discovered,
		servedToday: current.servedToday + 1,
		servedVisitIds: [...current.servedVisitIds, visit.id],
		apprenticeUsedToday,
		warmStoveUsedToday,
		lastResult: outcome
	});
}

/** The player chooses not to brew. Nothing is consumed and no one is blamed. */
export function decline(): void {
	const current = get(game);
	const visit = visitById(current.activeVisitId);
	if (!visit || current.lastResult) return;

	const outcome: BrewOutcome = {
		kind: 'decline',
		tags: [],
		potency: null,
		matched: [],
		extras: [],
		pay: 0,
		reputationDelta: 0,
		line: visit.declineLine,
		potionName: null
	};

	game.set({
		...current,
		servedToday: current.servedToday + 1,
		servedVisitIds: [...current.servedVisitIds, visit.id],
		lastResult: outcome
	});
}

/** Clears the result and presents the next solvable visitor, or the evening. */
export function nextCustomer(): void {
	const current = get(game);
	if (!current.lastResult) return;

	if (current.servedToday >= VISITS_PER_DAY) {
		game.set(endServiceState(current));
		return;
	}

	const picked = pickVisit({
		stock: current.stock,
		chapter: current.chapter,
		day: current.day,
		servedVisitIds: current.servedVisitIds,
		rngState: current.rngState
	});

	if (!picked.visit) {
		game.set({
			...current,
			activeVisitId: null,
			quietDay: true,
			lastResult: null,
			rngState: picked.rngState,
			phase: 'service'
		});
		return;
	}

	game.set({
		...current,
		activeVisitId: picked.visit.id,
		quietDay: false,
		lastResult: null,
		rngState: picked.rngState,
		phase: 'service'
	});
}

/** Closes service early: a quiet day still goes on to the evening. */
export function finishService(): void {
	const current = get(game);
	if (current.phase !== 'service') return;
	game.set(endServiceState(current));
}

/** Closes the shop and opens the next service day. */
export function advanceDay(): void {
	const current = get(game);
	if (current.phase !== 'market') return;
	game.set(endDayState(current));
}

/** Buys one unit from an evening-market stall. */
export function buyMarketOffer(index: number): void {
	const current = get(game);
	if (current.phase !== 'market') return;
	game.set(buyStockState(current, index));
}

/** At most one upgrade a night; an impossible tap leaves the ledger untouched. */
export function purchaseUpgrade(upgradeId: string): void {
	const current = get(game);
	if (current.phase !== 'market') return;
	try {
		game.set(buyUpgradeState(current, upgradeId));
	} catch {
		// The button state and the engine agree; a stale tap is simply ignored.
	}
}

/** The appointment ledger swaps the waiting visitor once a day. */
export function swapCustomer(): void {
	const current = get(game);
	const visit = visitById(current.activeVisitId);
	if (
		current.phase !== 'service' ||
		current.lastResult ||
		current.swappedToday ||
		!current.upgrades.includes('ledger') ||
		!visit
	) {
		return;
	}

	const picked = pickVisit({
		stock: current.stock,
		chapter: current.chapter,
		day: current.day,
		servedVisitIds: [...current.servedVisitIds, visit.id],
		rngState: current.rngState
	});

	if (!picked.visit) return;

	game.set({
		...current,
		activeVisitId: picked.visit.id,
		rngState: picked.rngState,
		swappedToday: true
	});
}

/** Pays or misses the rent; the outcome page stays until it is dismissed. */
export function settleRent(): void {
	const current = get(game);
	if (current.rentOutcome) return;
	game.set(payRentState(current));
}

/** Dismisses the paid-or-setback page and shows the next morning. */
export function leaveRentScene(): void {
	game.set(continueAfterRentState(get(game)));
}

export function resetGame(seed = 42): void {
	initGame(seed, createInitialSave(seed));
}
