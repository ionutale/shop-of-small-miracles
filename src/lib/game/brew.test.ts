import { SIDE_EFFECTS } from '../data/sideEffects';
import { describe, expect, it } from 'vitest';
import { ELEMENTS } from '../data/elements';
import { tinyVisit } from '../test/fixtures';
import { brewTags, canBrew, consume, judgeBrew } from './brew';

const visit = tinyVisit(['Light', 'Bright']);

describe('brew', () => {
	it('collects distinct primary tags in order and marks potency', () => {
		expect(brewTags(['H', 'H', 'O'], ELEMENTS)).toEqual({
			tags: ['Light', 'Bright'],
			potency: 'Light'
		});
		expect(brewTags(['Na', 'Cu', 'H'], ELEMENTS)).toEqual({
			tags: ['Warm', 'Light'],
			potency: 'Warm'
		});
	});

	it('has no potency when all three primaries differ', () => {
		expect(brewTags(['H', 'O', 'Ag'], ELEMENTS)).toEqual({
			tags: ['Light', 'Bright', 'Still'],
			potency: null
		});
	});

	it('requires three available units and permits duplicates', () => {
		expect(
			canBrew(
				[
					{ elementId: 'H', units: 2 },
					{ elementId: 'O', units: 1 }
				],
				['H', 'H', 'O']
			)
		).toBe(true);
		expect(
			canBrew(
				[
					{ elementId: 'H', units: 1 },
					{ elementId: 'O', units: 1 }
				],
				['H', 'H', 'O']
			)
		).toBe(false);
		expect(canBrew([{ elementId: 'H', units: 3 }], ['H', 'H'])).toBe(false);
	});

	it('consumes exactly one unit per slot and never goes below zero', () => {
		expect(
			consume(
				[
					{ elementId: 'H', units: 2 },
					{ elementId: 'O', units: 1 }
				],
				['H', 'H', 'O']
			)
		).toEqual([
			{ elementId: 'H', units: 0 },
			{ elementId: 'O', units: 0 }
		]);
	});

	it('judges a clean brew, a side effect, and a decline', () => {
		expect(judgeBrew({ tags: ['Light', 'Bright'], potency: 'Light' }, visit, 5, []).kind).toBe(
			'clean'
		);
		expect(
			judgeBrew({ tags: ['Light', 'Bright', 'Dreaming'], potency: null }, visit, 5, []).kind
		).toBe('sideEffect');
		expect(judgeBrew({ tags: ['Light'], potency: null }, visit, 5, []).kind).toBe('decline');
	});

	it('pays less for side effects and more for a good reputation', () => {
		const clean = judgeBrew({ tags: ['Light', 'Bright'], potency: 'Light' }, visit, 8, []);
		const messy = judgeBrew({ tags: ['Light', 'Bright', 'Dreaming'], potency: null }, visit, 8, []);
		const declined = judgeBrew({ tags: ['Light'], potency: null }, visit, 8, []);

		expect(clean.pay).toBeGreaterThan(messy.pay);
		expect(clean.reputationDelta).toBe(1);
		expect(messy.reputationDelta).toBe(-1);
		expect(declined.reputationDelta).toBe(0);
		expect(declined.pay).toBe(0);
	});

	it('adds a side-effect line for every extra essence', () => {
		const outcome = judgeBrew(
			{ tags: ['Warm', 'Bright', 'Still'], potency: null },
			tinyVisit(['Warm', 'Bright']),
			5,
			[]
		);

		expect(outcome.kind).toBe('sideEffect');
		expect(outcome.extras).toEqual(['Still']);
		expect(outcome.line).toContain(SIDE_EFFECTS.Still[0]);
	});

	it('names the potion a clean brew produces', () => {
		expect(
			judgeBrew({ tags: ['Warm', 'Bright'], potency: 'Warm' }, tinyVisit(['Warm', 'Bright']), 5, [])
				.potionName
		).toBe('Lamplight');
		expect(
			judgeBrew({ tags: ['Light', 'Warm'], potency: 'Warm' }, tinyVisit(['Light', 'Warm']), 5, [])
				.potionName
		).toBe("Widow's Lamp");
		expect(
			judgeBrew({ tags: ['Light', 'Bright', 'Still'], potency: null }, visit, 5, []).potionName
		).toBe('a light, bright, still draught');
	});
});
