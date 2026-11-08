import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { CHOICES } from '../data/choices';
import { ENDINGS } from '../data/endings';
import { saveFixture } from '../test/fixtures';
import { chooseStoryOption, dismissMorning, game, initGame } from '../stores/game';
import { applyChoice, endingFor, selectEnding } from './story';

beforeEach(() => localStorage.clear());

describe('endingFor', () => {
	it('selects all three endings', () => {
		expect(
			endingFor({
				reputation: 8,
				relationships: { widow: 7, merchant: 7, apprentice: 7 },
				flags: ['keptTheChair'],
				setbacks: 0
			}).id
		).toBe('last-miracle');
		expect(
			endingFor({
				reputation: 6,
				relationships: { widow: 3, merchant: 3, apprentice: 3 },
				flags: [],
				setbacks: 0
			}).id
		).toBe('shop-endures');
		expect(
			endingFor({
				reputation: 4,
				relationships: { widow: 3, merchant: 3, apprentice: 3 },
				flags: ['closedTheShop'],
				setbacks: 0
			}).id
		).toBe('quiet-closing');
	});

	it('treats repeated setbacks as a quiet closing, not a game over', () => {
		expect(
			endingFor({
				reputation: 8,
				relationships: { widow: 7, merchant: 7, apprentice: 7 },
				flags: ['keptTheChair'],
				setbacks: 2
			}).id
		).toBe('quiet-closing');
	});

	it('requires the chair, high reputation, and every friendship for the last miracle', () => {
		const base = {
			reputation: 8,
			relationships: { widow: 7, merchant: 7, apprentice: 7 },
			flags: [] as string[],
			setbacks: 0
		};

		expect(endingFor(base).id).toBe('shop-endures');
		expect(endingFor({ ...base, flags: ['keptTheChair'], reputation: 6 }).id).toBe('shop-endures');
		expect(
			endingFor({
				...base,
				flags: ['keptTheChair'],
				relationships: { widow: 7, merchant: 7, apprentice: 5 }
			}).id
		).toBe('shop-endures');
	});
});

describe('applyChoice', () => {
	it('applies an authored option once and refuses a repeat', () => {
		const save = saveFixture({ day: 3, morningSeenDay: 0 });

		const once = applyChoice(save, 'd3-mend-cart');
		expect(once.relationships.merchant).toBe(2);
		expect(once.choices).toContain('d3-mend-cart');

		expect(applyChoice(once, 'd3-mend-cart')).toEqual(once);
	});

	it('refuses an option from another day', () => {
		const save = saveFixture({ day: 4 });

		expect(applyChoice(save, 'd3-mend-cart')).toEqual(save);
	});

	it('marks the widow kindness and the read letter as story flags', () => {
		expect(applyChoice(saveFixture({ day: 6 }), 'd6-new-wick').flags).toContain('helpedWidow');
		expect(applyChoice(saveFixture({ day: 13 }), 'd13-read-letter').flags).toContain(
			'readTheLetter'
		);
	});

	it('keeps relationships inside their 0–10 bounds', () => {
		const save = saveFixture({
			day: 10,
			relationships: { widow: 0, merchant: 10, apprentice: 0 }
		});

		expect(applyChoice(save, 'd10-warm-stove').relationships.merchant).toBe(10);
	});
});

describe('the authored arc', () => {
	it('ships three distinct endings', () => {
		expect(ENDINGS).toHaveLength(3);
		expect(new Set(ENDINGS.map((ending) => ending.id)).size).toBe(3);
		for (const ending of ENDINGS) {
			expect(ending.title.length).toBeGreaterThan(0);
			expect(ending.epilogue.length).toBeGreaterThan(0);
		}
	});

	it('reaches the last miracle by taking every kind choice', () => {
		let save = saveFixture({ day: 1, reputation: 5, morningSeenDay: 0 });

		for (const choice of CHOICES) {
			save = applyChoice({ ...save, day: choice.day }, choice.options[0].id);
		}

		expect(save.relationships.widow).toBeGreaterThanOrEqual(6);
		expect(save.relationships.merchant).toBeGreaterThanOrEqual(6);
		expect(save.relationships.apprentice).toBeGreaterThanOrEqual(6);
		expect(save.reputation).toBeGreaterThanOrEqual(7);
		expect(save.flags).toContain('keptTheChair');
		expect(selectEnding({ ...save, day: 21 }).id).toBe('last-miracle');
	});

	it('reaches a quiet closing from the day-20 close choice', () => {
		const closed = applyChoice(saveFixture({ day: 20 }), 'd20-close-tomorrow');

		expect(closed.flags).toContain('closedTheShop');
		expect(selectEnding({ ...closed, day: 21 }).id).toBe('quiet-closing');
	});

	it('ends with the shop enduring when the player simply keeps going', () => {
		expect(selectEnding(saveFixture({ day: 21, reputation: 5 })).id).toBe('shop-endures');
	});
});

describe('morning choices in the store', () => {
	it('records the chosen option, dismisses the morning, and survives a reload', () => {
		initGame(42, saveFixture({ day: 3, morningSeenDay: 0 }));

		chooseStoryOption('d3-mend-cart');

		expect(get(game).morningSeenDay).toBe(0);
		expect(get(game).choices).toContain('d3-mend-cart');

		initGame(42);

		expect(get(game).choices).toContain('d3-mend-cart');
		expect(get(game).relationships.merchant).toBe(2);
		expect(get(game).morningSeenDay).toBe(0);

		dismissMorning();

		expect(get(game).morningSeenDay).toBe(3);
	});

	it('dismisses a quiet morning without changing the day or phase', () => {
		initGame(42, saveFixture({ day: 3, morningSeenDay: 0 }));

		dismissMorning();

		expect(get(game).morningSeenDay).toBe(3);
		expect(get(game).day).toBe(3);
		expect(get(game).phase).toBe('service');
	});
});
