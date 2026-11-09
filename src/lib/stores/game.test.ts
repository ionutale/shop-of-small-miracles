import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { serviceSave } from '../test/fixtures';
import { createInitialSave, SAVE_KEY } from '../game/storage';
import { generateMarket } from '../game/economy';
import {
	advanceDay,
	brew,
	buyMarketOffer,
	decline,
	finishService,
	game,
	initGame,
	leaveRentScene,
	nextCustomer,
	purchaseUpgrade,
	recovered,
	settleRent,
	swapCustomer
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

	it('files an identical tag set only once', () => {
		initGame(
			42,
			serviceSave({ discovered: [{ tags: ['Light', 'Warm'], name: "Widow's Lamp", day: 1 }] })
		);

		brew(['H', 'Na', 'Cu']);

		expect(get(game).discovered).toHaveLength(1);
		expect(get(game).discovered[0].day).toBe(1);
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
		expect(after.discovered.map((potion) => potion.name)).toEqual([
			'a light, bright, still draught'
		]);
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

	it('buys market stock and restores the same offers after reload', () => {
		const offers = generateMarket(7, 1, 2).offers;
		initGame(
			42,
			serviceSave({
				phase: 'market',
				day: 2,
				coins: 100,
				market: offers,
				stock: [],
				upgradeBoughtToday: false
			})
		);
		const offer = get(game).market[0];

		buyMarketOffer(0);
		const bought = get(game);
		expect(bought.coins).toBe(100 - offer.price);
		expect(bought.stock.find((entry) => entry.elementId === offer.elementId)?.units).toBe(1);
		expect(bought.market[0].units).toBe(offer.units - 1);

		const storedOffers = bought.market;
		initGame(99);
		expect(get(game).market).toEqual(storedOffers);
	});

	it('applies exactly one upgrade per evening and remembers it after reload', () => {
		initGame(42, serviceSave({ phase: 'market', coins: 300, market: [], upgrades: [] }));

		purchaseUpgrade('shelf');
		expect(get(game).upgrades).toEqual(['shelf']);
		expect(get(game).shelfCapacity).toBe(40);

		purchaseUpgrade('market-ledger');
		expect(get(game).upgrades).toEqual(['shelf']);

		initGame(99);
		expect(get(game).upgrades).toEqual(['shelf']);
		expect(get(game).shelfCapacity).toBe(40);
		expect(get(game).upgradeBoughtToday).toBe(true);
	});

	it('pays rent through the store and continues into the next chapter', () => {
		initGame(
			42,
			serviceSave({ day: 7, chapter: 1, phase: 'chapterEnd', coins: 100, reputation: 5 })
		);

		settleRent();
		const paid = get(game);
		expect(paid.coins).toBe(60);
		expect(paid.day).toBe(8);
		expect(paid.chapter).toBe(2);
		expect(paid.phase).toBe('service');
		expect(paid.rentOutcome?.kind).toBe('paid');

		leaveRentScene();
		expect(get(game).rentOutcome).toBeNull();
		expect(get(game).phase).toBe('service');
	});

	it('turns a rent shortfall into a setback and keeps the shop open', () => {
		initGame(
			42,
			serviceSave({
				day: 7,
				chapter: 1,
				phase: 'chapterEnd',
				coins: 0,
				reputation: 5,
				upgrades: ['brass-scales'],
				shelfCapacity: 30
			})
		);

		settleRent();
		const setback = get(game);
		expect(setback.setbacks).toBe(1);
		expect(setback.coins).toBe(10);
		expect(setback.reputation).toBe(3);
		expect(setback.upgrades).toEqual([]);
		expect(setback.day).toBe(8);
		expect(setback.phase).toBe('service');
		expect(setback.rentOutcome?.kind).toBe('shortfall');
		expect(setback.rentOutcome?.message).toMatch(/brass scales/i);

		leaveRentScene();
		expect(get(game).phase).toBe('service');
		expect(get(game).rentOutcome).toBeNull();
	});

	it('applies the brass scales and old sign to a clean brew', () => {
		initGame(42, serviceSave({ upgrades: ['brass-scales', 'old-sign'] }));
		brew(['H', 'Na', 'Cu']);
		expect(get(game).lastResult?.pay).toBe(29);
	});

	it('refunds one mismatched brew a day with the apprentice', () => {
		initGame(42, serviceSave({ upgrades: ['apprentice'] }));
		brew(['H', 'O', 'Ag']);
		const after = get(game);

		expect(after.lastResult?.kind).toBe('decline');
		expect(after.stock.find((entry) => entry.elementId === 'H')?.units).toBe(2);
		expect(after.stock.find((entry) => entry.elementId === 'O')?.units).toBe(1);
		expect(after.apprenticeUsedToday).toBe(true);
		expect(after.lastResult?.line).toMatch(/apprentice/i);
	});

	it('adds a warm-stove reputation on the first clean brew of the day', () => {
		initGame(42, serviceSave({ upgrades: ['warm-stove'], reputation: 5 }));
		brew(['H', 'Na', 'Cu']);
		const after = get(game);

		expect(after.reputation).toBe(7);
		expect(after.warmStoveUsedToday).toBe(true);
	});

	it('lets the ledger swap the next visitor once a day', () => {
		initGame(
			42,
			serviceSave({
				upgrades: ['ledger'],
				activeVisitId: 'widow-lamp',
				stock: [
					{ elementId: 'H', units: 3 },
					{ elementId: 'Na', units: 3 },
					{ elementId: 'Cu', units: 3 },
					{ elementId: 'O', units: 3 },
					{ elementId: 'Ag', units: 3 },
					{ elementId: 'Cl', units: 3 }
				]
			})
		);
		const before = get(game).activeVisitId;

		swapCustomer();
		const after = get(game);
		expect(after.activeVisitId).not.toBe(before);
		expect(after.swappedToday).toBe(true);

		const swapped = after.activeVisitId;
		swapCustomer();
		expect(get(game).activeVisitId).toBe(swapped);
	});
});
