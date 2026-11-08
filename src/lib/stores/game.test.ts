import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { serviceSave } from '../test/fixtures';
import { createInitialSave, SAVE_KEY } from '../game/storage';
import {
	advanceDay,
	brew,
	decline,
	finishService,
	game,
	initGame,
	nextCustomer,
	recovered
} from './game';

function stockOf(id: string): number {
	return get(game).stock.find((entry) => entry.elementId === id)?.units ?? 0;
}

beforeEach(() => {
	localStorage.clear();
	initGame(42, serviceSave());
});

describe('game store', () => {
	it('boots with a customer waiting', () => {
		expect(get(game).activeVisitId).toBe('widow-lamp');
		expect(get(recovered)).toBe(false);
	});

	it('brews a clean potion, pays, raises reputation, and records it', () => {
		const before = get(game);
		brew(['H', 'Na', 'Cu']);
		const after = get(game);

		expect(after.lastResult?.kind).toBe('clean');
		expect(after.coins).toBe(before.coins + 24);
		expect(after.reputation).toBe(before.reputation + 1);
		expect(after.discovered.map((potion) => potion.name)).toEqual(["Widow's Lamp"]);
		expect(stockOf('H')).toBe(1);
		expect(stockOf('Na')).toBe(1);
		expect(stockOf('Cu')).toBe(1);
		expect(after.servedVisitIds).toContain('widow-lamp');
	});

	it('allows only one brew per customer', () => {
		brew(['H', 'Na', 'Cu']);
		const once = get(game);
		brew(['H', 'Na', 'Cu']);
		expect(get(game)).toEqual(once);
	});

	it('consumes ingredients on a mismatched brew without lowering reputation', () => {
		brew(['H', 'O', 'Ag']);
		const after = get(game);
		expect(after.lastResult?.kind).toBe('decline');
		expect(after.lastResult?.pay).toBe(0);
		expect(after.coins).toBe(40);
		expect(after.reputation).toBe(5);
		expect(stockOf('H')).toBe(1);
		expect(stockOf('O')).toBe(0);
		expect(stockOf('Ag')).toBe(0);
		expect(after.discovered).toEqual([]);
	});

	it('politely declining consumes nothing', () => {
		const before = get(game);
		decline();
		const after = get(game);
		expect(after.stock).toEqual(before.stock);
		expect(after.coins).toBe(before.coins);
		expect(after.reputation).toBe(before.reputation);
		expect(after.lastResult?.line).toMatch(/thank you for trying/i);
		expect(after.servedVisitIds).toContain('widow-lamp');
	});

	it('brings the next visitor, then settles into a quiet day when the shelf runs out', () => {
		brew(['H', 'Na', 'Cu']);
		nextCustomer();
		expect(get(game).activeVisitId).toBe('baker-lantern');
		expect(get(game).lastResult).toBeNull();

		brew(['O', 'Na', 'Cu']);
		expect(get(game).lastResult?.kind).toBe('clean');
		nextCustomer();
		expect(get(game).activeVisitId).toBeNull();
		expect(get(game).quietDay).toBe(true);

		finishService();
		expect(get(game).phase).toBe('market');
	});

	it('serves exactly three visitors, never repeats one, and then reaches the evening', () => {
		localStorage.clear();
		initGame(42, createInitialSave(42));

		for (let served = 0; served < 3; served++) {
			expect(get(game).servedToday).toBe(served);
			expect(get(game).activeVisitId).not.toBeNull();
			decline();
			expect(get(game).lastResult).not.toBeNull();
			nextCustomer();
		}

		const state = get(game);
		expect(state.servedToday).toBe(3);
		expect(new Set(state.servedVisitIds).size).toBe(3);
		expect(state.phase).toBe('market');
		expect(state.activeVisitId).toBeNull();
	});

	it('reproduces the next visitor after a reload from the stored RNG state', () => {
		decline();
		nextCustomer();
		const chosen = get(game).activeVisitId;
		const rngState = get(game).rngState;

		initGame(99);

		expect(get(game).activeVisitId).toBe(chosen);
		expect(get(game).rngState).toBe(rngState);
	});

	it('opens the next day after the evening without forgetting served visits', () => {
		localStorage.clear();
		initGame(42, createInitialSave(42));
		decline();
		nextCustomer();
		decline();
		nextCustomer();
		decline();
		nextCustomer();
		expect(get(game).phase).toBe('market');

		const served = [...get(game).servedVisitIds];
		advanceDay();
		const next = get(game);
		expect(next.day).toBe(2);
		expect(next.phase).toBe('service');
		expect(next.servedToday).toBe(0);
		expect(next.activeVisitId).not.toBeNull();
		expect(next.servedVisitIds).toEqual(expect.arrayContaining(served));
	});

	it('persists and restores the exact customer, stock, coins, reputation, and phase', () => {
		brew(['H', 'Na', 'Cu']);
		const brewed = get(game);
		const stored = JSON.parse(localStorage.getItem(SAVE_KEY) ?? '{}');
		expect(stored.coins).toBe(brewed.coins);

		initGame(99);
		const restored = get(game);
		expect(restored.activeVisitId).toBe('widow-lamp');
		expect(restored.phase).toBe('service');
		expect(restored.stock).toEqual(brewed.stock);
		expect(restored.coins).toBe(brewed.coins);
		expect(restored.reputation).toBe(brewed.reputation);
		expect(restored.lastResult).toEqual(brewed.lastResult);
	});
});
