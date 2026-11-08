import { describe, expect, it } from 'vitest';
import { CHARACTERS } from './characters';
import { ELEMENTS } from './elements';
import { POTIONS } from './potions';
import { TAGS } from './tags';

describe('tags', () => {
	it('ships all eighteen essence tags', () => {
		expect(TAGS).toHaveLength(18);
		expect(new Set(TAGS).size).toBe(18);
	});
});

describe('elements', () => {
	it('ships six valid elements with distinct primary/secondary pairs', () => {
		expect(ELEMENTS).toHaveLength(6);
		const pairs = new Set<string>();
		for (const element of ELEMENTS) {
			expect(TAGS).toContain(element.primary);
			expect(TAGS).toContain(element.secondary);
			expect(element.primary).not.toBe(element.secondary);
			expect(element.price).toBeGreaterThanOrEqual(2);
			expect(element.price).toBeLessThanOrEqual(6);
			pairs.add(`${element.primary}+${element.secondary}`);
		}
		expect(pairs.size).toBe(6);
	});

	it('has unique symbols and numbers', () => {
		expect(new Set(ELEMENTS.map((element) => element.symbol)).size).toBe(6);
		expect(new Set(ELEMENTS.map((element) => element.number)).size).toBe(6);
	});
});

describe('potions', () => {
	it('ships two named potions with unique tag pairs', () => {
		expect(POTIONS).toHaveLength(2);
		const keys = POTIONS.map((potion) => [...potion.tags].sort().join('+'));
		expect(new Set(keys).size).toBe(2);
		for (const potion of POTIONS) {
			for (const tag of potion.tags) expect(TAGS).toContain(tag);
			expect(potion.name.length).toBeGreaterThan(0);
			expect(potion.effect.length).toBeGreaterThan(0);
		}
	});
});

describe('characters', () => {
	it('has two authored visits with exactly two desired tags each', () => {
		const visits = CHARACTERS.flatMap((character) => character.visits);
		expect(visits).toHaveLength(2);
		for (const visit of visits) {
			expect(visit.tags).toHaveLength(2);
			for (const tag of visit.tags) expect(TAGS).toContain(tag);
		}
	});
});
