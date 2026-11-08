import { describe, expect, it } from 'vitest';
import { ELEMENTS } from '../data/elements';
import { VISITS, visitById } from '../data/characters';
import { canSatisfyTags, eligibleVisits, pickVisit } from './eligibility';

const stock = (pairs: [string, number][]) =>
	pairs.map(([elementId, units]) => ({ elementId, units }));

const fullStock = ELEMENTS.map((element) => ({ elementId: element.id, units: 9 }));

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

	it('filters visits that the shelf cannot support and excludes served visits', () => {
		const stocked = stock([
			['H', 1],
			['Na', 1],
			['Cu', 1]
		]);
		const eligible = eligibleVisits(stocked, VISITS, ELEMENTS);
		expect(eligible.map((visit) => visit.id)).toContain('widow-lamp');
		expect(eligible.map((visit) => visit.id)).not.toContain('butcher-cold');

		const after = eligibleVisits(stocked, VISITS, ELEMENTS, ['widow-lamp']);
		expect(after.map((visit) => visit.id)).not.toContain('widow-lamp');
	});

	it('returns a quiet day when nothing is eligible', () => {
		const result = pickVisit({
			stock: [],
			chapter: 1,
			day: 1,
			servedVisitIds: [],
			rngState: 7
		});
		expect(result.quietDay).toBe(true);
		expect(result.visit).toBeNull();
	});

	it('is deterministic for the same state and never rerolls on resume', () => {
		const input = {
			stock: fullStock,
			chapter: 1 as const,
			day: 2,
			servedVisitIds: ['widow-lamp', 'merchant-salt', 'apprentice-lamp'],
			rngState: 12345
		};
		const first = pickVisit(input);
		const second = pickVisit(input);
		expect(first).toEqual(second);
		expect(first.visit).not.toBeNull();
	});

	it('never returns an ineligible visit', () => {
		for (const day of [1, 2, 8, 9, 15, 16]) {
			const chapter = day <= 7 ? 1 : day <= 14 ? 2 : 3;
			const result = pickVisit({
				stock: fullStock,
				chapter,
				day,
				servedVisitIds: [],
				rngState: 7
			});
			expect(result.visit).not.toBeNull();
			expect(canSatisfyTags(fullStock, result.visit!.tags, ELEMENTS)).toBe(true);
		}
	});

	it('presents the fixed recurring visit on its scheduled day', () => {
		const days: [number, string][] = [
			[1, 'widow-lamp'],
			[3, 'merchant-salt'],
			[5, 'apprentice-lamp'],
			[8, 'widow-letters'],
			[10, 'merchant-road'],
			[12, 'apprentice-hands'],
			[15, 'widow-chair'],
			[17, 'merchant-home'],
			[19, 'apprentice-chair']
		];

		for (const [day, expected] of days) {
			const chapter = day <= 7 ? 1 : day <= 14 ? 2 : 3;
			const result = pickVisit({
				stock: fullStock,
				chapter,
				day,
				servedVisitIds: [],
				rngState: 999
			});
			expect(result.visit?.id).toBe(expected);
		}
	});

	it('does not offer another day’s recurring visit from the random pool', () => {
		const reserved = new Set(['merchant-salt', 'apprentice-lamp', 'widow-lamp']);
		for (let rngState = 1; rngState < 40; rngState++) {
			const result = pickVisit({
				stock: fullStock,
				chapter: 1,
				day: 2,
				servedVisitIds: ['widow-lamp'],
				rngState
			});
			expect(reserved.has(result.visit?.id ?? '')).toBe(false);
		}
	});

	it('falls back to a solvable random visit when a recurring visit is not stocked', () => {
		const result = pickVisit({
			stock: stock([
				['Ca', 3],
				['Si', 3]
			]),
			chapter: 1,
			day: 1,
			servedVisitIds: [],
			rngState: 7
		});
		expect(result.visit?.id).not.toBe('widow-lamp');
		expect(result.quietDay).toBe(false);
	});

	it('resolves visits by id', () => {
		expect(visitById('widow-lamp')?.characterId).toBe('widow');
		expect(visitById('not-a-visit')).toBeNull();
	});
});
