import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import type { SaveState } from '../types';
import { memoryStorage, serviceSave } from '../test/fixtures';
import { game, initGame, resetGame } from '../stores/game';
import { dayRngState } from './rng';
import { createInitialSave, loadSave, parseSave, saveGame, SAVE_KEY } from './storage';

const EMPTY_RECORDS: SaveState['records'] = {
	cleanBrews: 0,
	served: 0,
	namedSeen: [],
	endings: [],
	chairEndings: 0
};
const SEEDED_RECORDS: SaveState['records'] = {
	cleanBrews: 3,
	served: 12,
	namedSeen: ["Widow's Lamp"],
	endings: ['quiet-closing'],
	chairEndings: 1
};

describe('storage', () => {
	it('creates a day-one shop with a stocked shelf and the fixed first visitor waiting', () => {
		const save = createInitialSave(42);
		expect(save.version).toBe(1);
		expect(save.day).toBe(1);
		expect(save.phase).toBe('service');
		expect(save.coins).toBe(40);
		expect(save.reputation).toBe(5);
		expect(save.stock).toHaveLength(10);
		expect(save.servedToday).toBe(0);
		expect(save.activeVisitId).toBe('widow-lamp');
		expect(save.quietDay).toBe(false);
		expect(save.rngState).toBe(dayRngState(42, 1));
	});

	it('round-trips through storage', () => {
		const storage = memoryStorage();
		const save = createInitialSave(42);
		expect(saveGame(save, storage)).toBe(true);
		expect(loadSave(99, storage)).toEqual({ save, recovered: false });
	});

	it('recovers from corrupt JSON with a fresh save', () => {
		const storage = memoryStorage();
		storage.setItem(SAVE_KEY, '{bad');
		const loaded = loadSave(99, storage);
		expect(loaded.recovered).toBe(true);
		expect(loaded.save.activeVisitId).toBe('widow-lamp');
	});

	it('rejects wrong versions', () => {
		expect(parseSave(JSON.stringify({ version: 2 }))).toBeNull();
	});

	it('rejects an impossible day or phase', () => {
		expect(parseSave(JSON.stringify({ ...createInitialSave(1), day: 0 }))).toBeNull();
		expect(parseSave(JSON.stringify({ ...createInitialSave(1), phase: 'dreaming' }))).toBeNull();
	});

	it('preserves the RNG state across a round-trip', () => {
		const storage = memoryStorage();
		const save = { ...createInitialSave(42), rngState: 12345 };
		saveGame(save, storage);
		expect(loadSave(1, storage).save.rngState).toBe(12345);
	});

	it('starts with thirty units of shelf space and a clean evening ledger', () => {
		const save = createInitialSave(42);
		expect(save.shelfCapacity).toBe(30);
		expect(save.upgradeBoughtToday).toBe(false);
		expect(save.rentOutcome).toBeNull();
		expect(save.swappedToday).toBe(false);
		expect(save.apprenticeUsedToday).toBe(false);
		expect(save.warmStoveUsedToday).toBe(false);
	});

	it('backfills shelf capacity for an older save that owns the shelf upgrade', () => {
		const legacy = { ...createInitialSave(42), upgrades: ['shelf'] } as Record<string, unknown>;
		delete legacy.shelfCapacity;
		delete legacy.upgradeBoughtToday;

		const parsed = parseSave(JSON.stringify(legacy));
		expect(parsed?.shelfCapacity).toBe(40);
		expect(parsed?.upgradeBoughtToday).toBe(false);
	});

	it('starts a new save with the first-day coach available', () => {
		expect(createInitialSave(42).tutorialDone).toBe(false);
	});

	it('backfills tutorial completion for an older save', () => {
		const legacy = { ...createInitialSave(42) } as Record<string, unknown>;
		delete legacy.tutorialDone;

		expect(parseSave(JSON.stringify(legacy))?.tutorialDone).toBe(true);
	});

	it('backfills the morning and story fields for an older save', () => {
		const legacy = { ...createInitialSave(42) } as Record<string, unknown>;
		delete legacy.morningSeenDay;
		delete legacy.choices;

		const parsed = parseSave(JSON.stringify(legacy));
		expect(parsed?.morningSeenDay).toBe(0);
		expect(parsed?.choices).toEqual([]);
	});

	it('round-trips the evening market and rent result', () => {
		const storage = memoryStorage();
		const save = {
			...createInitialSave(42),
			phase: 'market' as const,
			market: [{ elementId: 'H', units: 2, price: 3 }],
			rentOutcome: {
				kind: 'paid' as const,
				rent: 40,
				coinsAfter: 60,
				taken: null,
				message: 'Rent paid.'
			}
		};
		saveGame(save, storage);
		const loaded = loadSave(1, storage).save;

		expect(loaded.market).toEqual(save.market);
		expect(loaded.rentOutcome).toEqual(save.rentOutcome);
	});

	it('starts a new career ledger empty', () => {
		const save = createInitialSave(42);

		expect(save.records).toEqual(EMPTY_RECORDS);
		expect(save.badges).toEqual([]);
	});

	it('backfills an empty career ledger for an older save', () => {
		const legacy = { ...createInitialSave(42) } as Record<string, unknown>;
		delete legacy.records;
		delete legacy.badges;

		const parsed = parseSave(JSON.stringify(legacy));

		expect(parsed?.records).toEqual(EMPTY_RECORDS);
		expect(parsed?.badges).toEqual([]);
	});

	it('drops unusable career entries instead of trusting them', () => {
		const damaged = {
			...createInitialSave(42),
			records: {
				cleanBrews: -2,
				served: 'many',
				namedSeen: ["Widow's Lamp", 7],
				endings: ['quiet-closing', 3],
				chairEndings: -4
			},
			badges: [{ id: 'first-light', day: 2 }, { id: 5, day: 1 }, 'nope']
		};

		const parsed = parseSave(JSON.stringify(damaged));

		expect(parsed?.records).toEqual({
			cleanBrews: 0,
			served: 0,
			namedSeen: ["Widow's Lamp"],
			endings: ['quiet-closing'],
			chairEndings: 0
		});
		expect(parsed?.badges).toEqual([{ id: 'first-light', day: 2 }]);
	});

	it('keeps the career ledger and badges across a reset', () => {
		localStorage.clear();
		initGame(42, serviceSave({ records: SEEDED_RECORDS, badges: [{ id: 'first-light', day: 2 }] }));
		// The stored save may predate the ledger; the live career is what reset keeps.
		saveGame(createInitialSave(42), localStorage);

		resetGame();

		expect(get(game).records).toEqual(SEEDED_RECORDS);
		// Seeding the ledger also earns its keepsakes, alongside the kept first-light.
		expect(get(game).badges).toEqual([
			{ id: 'first-light', day: 2 },
			{ id: 'quiet-closing', day: 1 },
			{ id: 'chair-keeper', day: 1 }
		]);
		expect(get(game).day).toBe(1);
		expect(get(game).flags).toEqual([]);
	});
});
