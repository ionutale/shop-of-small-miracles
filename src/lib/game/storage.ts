import { VISITS } from '../data/characters';
import { ELEMENTS } from '../data/elements';
import type { BrewOutcome, Phase, SaveState } from '../types';
import { eligibleVisits } from './eligibility';

export const SAVE_KEY = 'small-miracles:save:v1';

const PHASES: readonly Phase[] = ['morning', 'service', 'market', 'chapterEnd', 'ending'];

const STARTING_STOCK = [
	{ elementId: 'H', units: 3 },
	{ elementId: 'O', units: 2 },
	{ elementId: 'Na', units: 3 },
	{ elementId: 'Cu', units: 3 },
	{ elementId: 'K', units: 2 },
	{ elementId: 'Ag', units: 2 }
];

function defaultStorage(): Storage | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}

export function createInitialSave(seed = 42): SaveState {
	const stock = STARTING_STOCK.map((entry) => ({ ...entry }));
	const firstVisit = eligibleVisits(stock, VISITS, ELEMENTS)[0] ?? null;

	return {
		version: 1,
		seed,
		rngState: seed >>> 0,
		day: 1,
		chapter: 1,
		phase: 'service',
		coins: 40,
		reputation: 5,
		setbacks: 0,
		stock,
		discovered: [],
		flags: [],
		relationships: { widow: 0, merchant: 0, apprentice: 0 },
		servedToday: 0,
		servedVisitIds: [],
		activeVisitId: firstVisit?.id ?? null,
		quietDay: !firstVisit,
		market: [],
		upgrades: [],
		settings: { sound: true, reduceMotion: false },
		introSeen: true,
		lastResult: null
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isBrewOutcome(value: unknown): value is BrewOutcome {
	return isRecord(value) && typeof value.kind === 'string' && Array.isArray(value.tags);
}

/**
 * Accepts only a version-1 save with a plausible day and phase, then backfills
 * fields added by later slices so an older save never crashes the shop.
 */
export function parseSave(raw: string | null): SaveState | null {
	if (!raw) return null;

	let value: unknown;
	try {
		value = JSON.parse(raw);
	} catch {
		return null;
	}

	if (!isRecord(value)) return null;
	if (value.version !== 1) return null;
	if (!Number.isInteger(value.day) || (value.day as number) < 1 || (value.day as number) > 21) {
		return null;
	}
	if (typeof value.phase !== 'string' || !PHASES.includes(value.phase as Phase)) return null;
	if (!Number.isInteger(value.chapter) || ![1, 2, 3].includes(value.chapter as number)) {
		return null;
	}
	if (!Array.isArray(value.stock)) return null;
	if (typeof value.coins !== 'number' || typeof value.reputation !== 'number') return null;

	const base = createInitialSave(typeof value.seed === 'number' ? value.seed : 42);
	const settings = isRecord(value.settings) ? value.settings : {};
	const relationships = isRecord(value.relationships) ? value.relationships : {};

	return {
		...base,
		...value,
		version: 1,
		chapter: value.chapter as 1 | 2 | 3,
		phase: value.phase as Phase,
		stock: value.stock as SaveState['stock'],
		discovered: Array.isArray(value.discovered)
			? (value.discovered as SaveState['discovered'])
			: [],
		flags: Array.isArray(value.flags) ? (value.flags as string[]) : [],
		relationships: {
			widow: typeof relationships.widow === 'number' ? relationships.widow : 0,
			merchant: typeof relationships.merchant === 'number' ? relationships.merchant : 0,
			apprentice: typeof relationships.apprentice === 'number' ? relationships.apprentice : 0
		},
		servedVisitIds: Array.isArray(value.servedVisitIds) ? (value.servedVisitIds as string[]) : [],
		market: Array.isArray(value.market) ? (value.market as SaveState['market']) : [],
		upgrades: Array.isArray(value.upgrades) ? (value.upgrades as string[]) : [],
		settings: {
			sound: typeof settings.sound === 'boolean' ? settings.sound : true,
			reduceMotion: typeof settings.reduceMotion === 'boolean' ? settings.reduceMotion : false
		},
		lastResult: isBrewOutcome(value.lastResult) ? value.lastResult : null
	};
}

export function loadSave(
	seed = 42,
	storage: Storage | null = defaultStorage()
): { save: SaveState; recovered: boolean } {
	if (!storage) return { save: createInitialSave(seed), recovered: false };

	let raw: string | null;
	try {
		raw = storage.getItem(SAVE_KEY);
	} catch {
		return { save: createInitialSave(seed), recovered: false };
	}

	if (!raw) return { save: createInitialSave(seed), recovered: false };

	const parsed = parseSave(raw);
	if (!parsed) return { save: createInitialSave(seed), recovered: true };

	return { save: parsed, recovered: false };
}

export function saveGame(save: SaveState, storage: Storage | null = defaultStorage()): boolean {
	if (!storage) return false;
	try {
		storage.setItem(SAVE_KEY, JSON.stringify(save));
		return true;
	} catch {
		return false;
	}
}
