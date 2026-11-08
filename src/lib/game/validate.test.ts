import { describe, expect, it } from 'vitest';
import { CONTENT } from '../data/content';
import { VISITS } from '../data/characters';
import type { ContentBundle, ElementRecord, Tag, VisitRecord } from '../types';
import { validateContent } from './validate';

function element(number: number, symbol: string, primary: Tag, secondary: Tag): ElementRecord {
	return { id: symbol, number, symbol, name: symbol, primary, secondary, price: 3 };
}

function visit(id: string, tags: [Tag, Tag]): VisitRecord {
	return {
		id,
		characterId: 'c1',
		chapter: 1,
		request: 'A small kindness.',
		tags,
		cleanLine: 'Thank you.',
		sideEffectLine: 'Oh.',
		declineLine: 'Perhaps not.'
	};
}

const tinyContent: ContentBundle = {
	elements: [element(1, 'H', 'Light', 'Warm'), element(8, 'O', 'Bright', 'Cold')],
	potions: [{ id: 'p1', name: 'Lamplight', tags: ['Light', 'Bright'], effect: 'A steady glow.' }],
	characters: [
		{ id: 'c1', name: 'A neighbour', portraitSeed: 1, visits: [visit('v1', ['Light', 'Bright'])] }
	],
	chapters: [
		{
			number: 1,
			title: 'The Lamp',
			rent: 40,
			beats: {
				1: 'A letter.',
				2: 'A letter.',
				3: 'A letter.',
				4: 'A letter.',
				5: 'A letter.',
				6: 'A letter.',
				7: 'A letter.'
			},
			recurring: []
		}
	],
	upgrades: [],
	endings: []
};

describe('validateContent', () => {
	it('accepts a coherent small bundle', () => {
		expect(validateContent(tinyContent)).toEqual({ ok: true, errors: [] });
	});

	it('accepts the full shipped content and proves the content counts', () => {
		const result = validateContent(CONTENT, { full: true });
		expect(result.errors).toEqual([]);
		expect(result.ok).toBe(true);
		expect(CONTENT.elements).toHaveLength(30);
		expect(CONTENT.potions).toHaveLength(24);
		expect(CONTENT.characters).toHaveLength(30);
		expect(VISITS).toHaveLength(63);
		expect(CONTENT.upgrades).toHaveLength(12);
	});

	it('rejects a potion with an unknown tag', () => {
		const broken = {
			...tinyContent,
			potions: [{ ...tinyContent.potions[0], tags: ['Light', 'Nope'] }]
		};
		expect(validateContent(broken as unknown as ContentBundle).ok).toBe(false);
	});

	it('rejects a visit with fewer than two distinct tags', () => {
		const broken = {
			...tinyContent,
			characters: [
				{
					...tinyContent.characters[0],
					visits: [{ ...tinyContent.characters[0].visits[0], tags: ['Light'] }]
				}
			]
		};
		expect(validateContent(broken as unknown as ContentBundle).ok).toBe(false);
	});

	it('rejects a request whose tags cannot be brewed from any three units', () => {
		const broken = {
			...tinyContent,
			characters: [
				{
					...tinyContent.characters[0],
					visits: [{ ...tinyContent.characters[0].visits[0], tags: ['Light', 'Grief'] }]
				}
			]
		};
		const result = validateContent(broken as unknown as ContentBundle);
		expect(result.ok).toBe(false);
		expect(result.errors.join('\n')).toMatch(/cannot be brewed/i);
	});

	it('rejects the full content when a visit is missing', () => {
		const broken: ContentBundle = {
			...CONTENT,
			characters: CONTENT.characters.map((character, index) =>
				index === 0 ? { ...character, visits: character.visits.slice(1) } : character
			)
		};
		const result = validateContent(broken, { full: true });
		expect(result.ok).toBe(false);
		expect(result.errors.join('\n')).toMatch(/visit/i);
	});

	it('rejects an element table that leaves an essence unused', () => {
		const broken: ContentBundle = {
			...CONTENT,
			elements: CONTENT.elements.filter((element) => element.primary !== 'Grief')
		};
		const result = validateContent(broken, { full: true });
		expect(result.ok).toBe(false);
		expect(result.errors.join('\n')).toMatch(/Grief/);
	});
});
