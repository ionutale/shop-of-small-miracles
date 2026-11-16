import { describe, expect, it } from 'vitest';
import { ELEMENTS } from '../data/elements';
import { saveFixture } from '../test/fixtures';
import { suggestBrew } from './hint';

const primaryOf = (id: string) => ELEMENTS.find((element) => element.id === id)!.primary;

describe('suggestBrew', () => {
	it('finds three in-stock essences that cover both tags with one doubled', () => {
		const ids = suggestBrew(saveFixture().stock, ['Warm', 'Light'], ELEMENTS);

		expect(ids).not.toBeNull();
		expect(ids).toHaveLength(3);
		const primaries = ids!.map(primaryOf);
		expect(new Set(primaries)).toEqual(new Set(['Warm', 'Light']));
		expect(primaries.filter((tag) => tag === 'Warm')).toHaveLength(2);
	});

	it('returns three distinct elements for the starting widow brew', () => {
		expect(suggestBrew(saveFixture().stock, ['Warm', 'Light'], ELEMENTS)).toEqual([
			'H',
			'Na',
			'Cu'
		]);
	});

	it('respects available units', () => {
		const stock = [
			{ elementId: 'H', units: 1 },
			{ elementId: 'Na', units: 1 }
		];

		expect(suggestBrew(stock, ['Warm', 'Light'], ELEMENTS)).toBeNull();
	});

	it('can reuse one element when its units allow it', () => {
		const stock = [
			{ elementId: 'H', units: 1 },
			{ elementId: 'Na', units: 3 }
		];

		expect(suggestBrew(stock, ['Warm', 'Light'], ELEMENTS)).toEqual(['Na', 'Na', 'H']);
	});

	it('returns null when the shelf cannot cover the tags', () => {
		expect(suggestBrew(saveFixture().stock, ['Grief', 'Hollow'], ELEMENTS)).toBeNull();
	});

	it('returns null unless exactly two distinct tags are requested', () => {
		expect(suggestBrew(saveFixture().stock, ['Warm', 'Warm'], ELEMENTS)).toBeNull();
	});
});
