import { get, writable } from 'svelte/store';
import { VISITS, visitById } from '../data/characters';
import { ELEMENTS } from '../data/elements';
import { namePotion } from '../data/potions';
import type { BrewOutcome, SaveState } from '../types';
import { brewTags, canBrew, consume, judgeBrew } from '../game/brew';
import { eligibleVisits } from '../game/eligibility';
import { pickIndex } from '../game/rng';
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

	const outcome = judgeBrew(brewTags(ids, ELEMENTS), visit, current.reputation, []);
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
		stock: consume(current.stock, ids),
		coins: current.coins + outcome.pay,
		reputation: clamp(current.reputation + outcome.reputationDelta, 0, 10),
		discovered,
		servedToday: current.servedToday + 1,
		servedVisitIds: [...current.servedVisitIds, visit.id],
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

/** Clears the result and presents the next solvable visitor, or a quiet day. */
export function nextCustomer(): void {
	const current = get(game);
	if (!current.lastResult) return;

	const candidates = eligibleVisits(current.stock, VISITS, ELEMENTS, current.servedVisitIds);
	if (candidates.length === 0) {
		game.set({
			...current,
			activeVisitId: null,
			quietDay: true,
			lastResult: null,
			phase: 'service'
		});
		return;
	}

	const step = pickIndex(current.rngState, candidates.length);
	const visit = candidates[step.index];

	game.set({
		...current,
		activeVisitId: visit.id,
		quietDay: false,
		lastResult: null,
		rngState: step.state,
		phase: 'service'
	});
}

export function resetGame(seed = 42): void {
	initGame(seed, createInitialSave(seed));
}
