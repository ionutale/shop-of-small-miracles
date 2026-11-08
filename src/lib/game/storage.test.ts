import { describe, expect, it } from 'vitest';
import { memoryStorage } from '../test/fixtures';
import { createInitialSave, loadSave, parseSave, saveGame, SAVE_KEY } from './storage';

describe('storage', () => {
	it('creates a day-one shop with six ingredients and a visitor waiting', () => {
		const save = createInitialSave(42);
		expect(save.version).toBe(1);
		expect(save.day).toBe(1);
		expect(save.phase).toBe('service');
		expect(save.coins).toBe(40);
		expect(save.reputation).toBe(5);
		expect(save.stock).toHaveLength(6);
		expect(save.activeVisitId).toBe('widow-lamp');
		expect(save.quietDay).toBe(false);
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
});
