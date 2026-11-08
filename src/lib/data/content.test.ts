import { describe, expect, it } from 'vitest';
import { CHAPTERS, TOTAL_DAYS, beatForDay, chapterNumberForDay, rentDueOn } from './chapters';
import { CHARACTERS, VISITS } from './characters';
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
	it('ships thirty valid elements with distinct primary/secondary pairs', () => {
		expect(ELEMENTS).toHaveLength(30);
		const pairs = new Set<string>();
		for (const element of ELEMENTS) {
			expect(TAGS).toContain(element.primary);
			expect(TAGS).toContain(element.secondary);
			expect(element.primary).not.toBe(element.secondary);
			expect(element.price).toBeGreaterThanOrEqual(2);
			expect(element.price).toBeLessThanOrEqual(6);
			pairs.add(`${element.primary}+${element.secondary}`);
		}
		expect(pairs.size).toBe(30);
	});

	it('has unique ids, symbols, and atomic numbers', () => {
		expect(new Set(ELEMENTS.map((element) => element.id)).size).toBe(30);
		expect(new Set(ELEMENTS.map((element) => element.symbol)).size).toBe(30);
		expect(new Set(ELEMENTS.map((element) => element.number)).size).toBe(30);
	});

	it('uses every essence as a primary tag somewhere on the shelf', () => {
		const primaries = new Set(ELEMENTS.map((element) => element.primary));
		for (const tag of TAGS) expect(primaries).toContain(tag);
	});
});

describe('potions', () => {
	it('ships twenty-four named potions with unique tag pairs', () => {
		expect(POTIONS).toHaveLength(24);
		const keys = POTIONS.map((potion) => [...potion.tags].sort().join('+'));
		expect(new Set(keys).size).toBe(24);
		for (const potion of POTIONS) {
			expect(new Set(potion.tags).size).toBe(2);
			for (const tag of potion.tags) expect(TAGS).toContain(tag);
			expect(potion.name.length).toBeGreaterThan(0);
			expect(potion.effect.length).toBeGreaterThan(0);
		}
	});
});

describe('characters and visits', () => {
	it('ships thirty characters and sixty-three unique visits', () => {
		expect(CHARACTERS).toHaveLength(30);
		expect(VISITS).toHaveLength(63);
		expect(new Set(VISITS.map((visit) => visit.id)).size).toBe(63);
		expect(new Set(CHARACTERS.map((character) => character.id)).size).toBe(30);
	});

	it('gives every visit exactly two distinct valid tags and a chapter', () => {
		for (const visit of VISITS) {
			expect(visit.tags).toHaveLength(2);
			expect(new Set(visit.tags).size).toBe(2);
			for (const tag of visit.tags) expect(TAGS).toContain(tag);
			expect([1, 2, 3]).toContain(visit.chapter);
			expect(visit.request.length).toBeGreaterThan(0);
			expect(visit.cleanLine.length).toBeGreaterThan(0);
			expect(visit.sideEffectLine.length).toBeGreaterThan(0);
			expect(visit.declineLine.length).toBeGreaterThan(0);
		}
	});

	it('keeps every character to one, two, or three visits', () => {
		for (const character of CHARACTERS) {
			expect(character.visits.length).toBeGreaterThanOrEqual(1);
			expect(character.visits.length).toBeLessThanOrEqual(3);
			for (const visit of character.visits) expect(visit.characterId).toBe(character.id);
		}
	});

	it('stocks exactly twenty-one visits in each chapter', () => {
		for (const chapter of [1, 2, 3]) {
			expect(VISITS.filter((visit) => visit.chapter === chapter)).toHaveLength(21);
		}
	});
});

describe('the twenty-one day manifest', () => {
	it('ships three chapters with seven beats each covering every global day', () => {
		expect(CHAPTERS).toHaveLength(3);
		for (const chapter of CHAPTERS) {
			expect(Object.keys(chapter.beats)).toHaveLength(7);
		}
		for (let day = 1; day <= TOTAL_DAYS; day++) {
			expect(beatForDay(day).length).toBeGreaterThan(0);
			expect(chapterNumberForDay(day)).toBe(day <= 7 ? 1 : day <= 14 ? 2 : 3);
		}
	});

	it('charges rent on days 7, 14, and 21 only', () => {
		expect(CHAPTERS.map((chapter) => chapter.rent)).toEqual([40, 80, 120]);
		for (let day = 1; day <= TOTAL_DAYS; day++) {
			if (day === 7) expect(rentDueOn(day)).toBe(40);
			else if (day === 14) expect(rentDueOn(day)).toBe(80);
			else if (day === 21) expect(rentDueOn(day)).toBe(120);
			else expect(rentDueOn(day)).toBeNull();
		}
	});

	it('places the three recurring arcs on fixed days in every chapter', () => {
		const arcs = CHAPTERS.flatMap((chapter) =>
			chapter.recurring.map((recurring) => ({ ...recurring, chapter: chapter.number }))
		);
		expect(arcs.map((arc) => arc.characterId).sort()).toEqual(
			[
				'apprentice',
				'apprentice',
				'apprentice',
				'merchant',
				'merchant',
				'merchant',
				'widow',
				'widow',
				'widow'
			].sort()
		);
		for (const arc of arcs) {
			expect(arc.days).toHaveLength(1);
			expect(arc.days[0]).toBeGreaterThanOrEqual((arc.chapter - 1) * 7 + 1);
			expect(arc.days[0]).toBeLessThanOrEqual(arc.chapter * 7);
		}
	});
});
