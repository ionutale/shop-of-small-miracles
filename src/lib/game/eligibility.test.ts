import { describe, expect, it } from 'vitest';
import { ELEMENTS } from '../data/elements';
import { VISITS } from '../data/characters';
import { canSatisfyTags, eligibleVisits } from './eligibility';

const stock = (pairs: [string, number][]) =>
	pairs.map(([elementId, units]) => ({ elementId, units }));

describe('eligibility', () => {
	it('requires three usable units and both tags', () => {
		expect(
			canSatisfyTags(
				stock([
					['H', 2],
					['O', 1]
				]),
				['Light', 'Bright'],
				ELEMENTS
			)
		).toBe(true);
		expect(
			canSatisfyTags(
				stock([
					['H', 1],
					['O', 1]
				]),
				['Light', 'Bright'],
				ELEMENTS
			)
		).toBe(false);
		expect(canSatisfyTags(stock([['H', 3]]), ['Light', 'Bright'], ELEMENTS)).toBe(false);
	});

	it('allows the same element in more than one slot', () => {
		expect(
			canSatisfyTags(
				stock([
					['H', 1],
					['Na', 2]
				]),
				['Light', 'Warm'],
				ELEMENTS
			)
		).toBe(true);
	});

	it('filters visits that the shelf cannot support', () => {
		const eligible = eligibleVisits(
			stock([
				['H', 1],
				['Na', 1],
				['Cu', 1]
			]),
			VISITS,
			ELEMENTS
		);
		expect(eligible.map((visit) => visit.id)).toEqual(['widow-lamp']);
	});

	it('excludes already served visits', () => {
		const stocked = stock([
			['H', 1],
			['O', 1],
			['Na', 1],
			['Cu', 1]
		]);
		const eligible = eligibleVisits(stocked, VISITS, ELEMENTS, ['widow-lamp']);
		expect(eligible.map((visit) => visit.id)).toEqual(['baker-lantern']);
	});
});
