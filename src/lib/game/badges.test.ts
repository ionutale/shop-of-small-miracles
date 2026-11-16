import { describe, expect, it } from 'vitest';
import { BADGES } from '../data/badges';
import { saveFixture } from '../test/fixtures';
import { earnedBadgeIds, syncBadges } from './badges';

const ALL_NAMED = Array.from({ length: 24 }, (_, index) => `potion-${index + 1}`);

function earned(save: Parameters<typeof earnedBadgeIds>[0]): string[] {
	return [...earnedBadgeIds(save)];
}

describe('badges', () => {
	it('ships thirteen unique, ordered keepsakes', () => {
		expect(BADGES.map((badge) => badge.id)).toEqual([
			'first-light',
			'open-for-business',
			'long-bench',
			'paper-trail',
			'whole-book',
			'widows-friend',
			'salt-and-company',
			'apprentices-trust',
			'three-chairs',
			'shop-endures',
			'last-miracle',
			'quiet-closing',
			'chair-keeper'
		]);

		for (const badge of BADGES) {
			expect(badge.title.length).toBeGreaterThan(0);
			expect(badge.flavor.length).toBeGreaterThan(0);
			expect(badge.hint.length).toBeGreaterThan(0);
		}
	});

	it('earns First Light on the first clean brew', () => {
		expect(earned(saveFixture())).not.toContain('first-light');
		expect(
			earned(saveFixture({ records: { cleanBrews: 1, served: 0, namedSeen: [], endings: [] } }))
		).toContain('first-light');
	});

	it('earns Open for Business at fifty visitors served', () => {
		const records = { cleanBrews: 0, served: 49, namedSeen: [], endings: [] };

		expect(earned(saveFixture({ records }))).not.toContain('open-for-business');
		expect(earned(saveFixture({ records: { ...records, served: 50 } }))).toContain(
			'open-for-business'
		);
	});

	it('earns The Long Bench at ten clean brews', () => {
		const records = { cleanBrews: 9, served: 0, namedSeen: [], endings: [] };

		expect(earned(saveFixture({ records }))).not.toContain('long-bench');
		expect(earned(saveFixture({ records: { ...records, cleanBrews: 10 } }))).toContain(
			'long-bench'
		);
	});

	it('earns Paper Trail and The Whole Book at five and twenty-four named potions', () => {
		const seen = (count: number) => ({
			cleanBrews: 0,
			served: 0,
			namedSeen: ALL_NAMED.slice(0, count),
			endings: []
		});

		expect(earned(saveFixture({ records: seen(4) }))).not.toContain('paper-trail');
		expect(earned(saveFixture({ records: seen(5) }))).toContain('paper-trail');
		expect(earned(saveFixture({ records: seen(23) }))).not.toContain('whole-book');
		expect(earned(saveFixture({ records: seen(24) }))).toContain('whole-book');
	});

	it('earns each friendship badge at a relationship of eight', () => {
		const at = (arc: 'widow' | 'merchant' | 'apprentice', value: number) =>
			earned(
				saveFixture({ relationships: { widow: 0, merchant: 0, apprentice: 0, [arc]: value } })
			);

		expect(at('widow', 7)).not.toContain('widows-friend');
		expect(at('widow', 8)).toContain('widows-friend');
		expect(at('merchant', 7)).not.toContain('salt-and-company');
		expect(at('merchant', 8)).toContain('salt-and-company');
		expect(at('apprentice', 7)).not.toContain('apprentices-trust');
		expect(at('apprentice', 8)).toContain('apprentices-trust');
	});

	it('earns Three Chairs only when all three relationships reach six', () => {
		expect(
			earned(saveFixture({ relationships: { widow: 6, merchant: 6, apprentice: 5 } }))
		).not.toContain('three-chairs');
		expect(
			earned(saveFixture({ relationships: { widow: 6, merchant: 6, apprentice: 6 } }))
		).toContain('three-chairs');
	});

	it('earns an ending badge for each recorded ending', () => {
		const withEndings = (endings: ('shop-endures' | 'last-miracle' | 'quiet-closing')[]) =>
			earned(saveFixture({ records: { cleanBrews: 0, served: 0, namedSeen: [], endings } }));

		expect(withEndings([])).not.toContain('shop-endures');
		expect(withEndings(['shop-endures'])).toContain('shop-endures');
		expect(withEndings(['last-miracle'])).toContain('last-miracle');
		expect(withEndings(['quiet-closing'])).toContain('quiet-closing');
	});

	it('earns Chair Keeper only for an ending reached with the chair kept', () => {
		const records = {
			cleanBrews: 0,
			served: 0,
			namedSeen: [],
			endings: ['shop-endures' as const]
		};

		expect(earned(saveFixture({ flags: ['keptTheChair'], records }))).toContain('chair-keeper');
		expect(
			earned(
				saveFixture({
					flags: ['keptTheChair'],
					records: { ...records, endings: [] }
				})
			)
		).not.toContain('chair-keeper');
		expect(earned(saveFixture({ flags: [], records }))).not.toContain('chair-keeper');
	});

	it('lists every earned badge in definition order', () => {
		const save = saveFixture({
			flags: ['keptTheChair'],
			relationships: { widow: 8, merchant: 8, apprentice: 8 },
			records: {
				cleanBrews: 10,
				served: 50,
				namedSeen: ALL_NAMED,
				endings: ['shop-endures', 'last-miracle', 'quiet-closing']
			}
		});

		expect(earnedBadgeIds(save)).toEqual(BADGES.map((badge) => badge.id));
	});

	it('syncBadges appends the new badges with the current day', () => {
		const save = saveFixture({
			day: 12,
			records: { cleanBrews: 1, served: 0, namedSeen: [], endings: [] }
		});
		const synced = syncBadges(save);

		expect(synced).not.toBe(save);
		expect(synced.badges).toEqual([{ id: 'first-light', day: 12 }]);
		expect(save.badges).toEqual([]);
	});

	it('syncBadges is idempotent and returns the same object when nothing is new', () => {
		const save = saveFixture({
			records: { cleanBrews: 1, served: 0, namedSeen: [], endings: [] }
		});
		const once = syncBadges(save);
		const twice = syncBadges(once);

		expect(twice).toBe(once);
		expect(twice.badges).toEqual([{ id: 'first-light', day: 1 }]);
	});

	it('syncBadges never revokes a badge whose condition has lapsed', () => {
		const earnedSave = saveFixture({
			relationships: { widow: 8, merchant: 0, apprentice: 0 }
		});
		const once = syncBadges(earnedSave);
		const lapsed = { ...once, relationships: { widow: 0, merchant: 0, apprentice: 0 } };

		expect(syncBadges(lapsed)).toBe(lapsed);
		expect(lapsed.badges.map((badge) => badge.id)).toContain('widows-friend');
	});

	it('syncBadges keeps earlier badges ahead of later ones', () => {
		const save = saveFixture({
			badges: [{ id: 'first-light', day: 2 }],
			records: { cleanBrews: 10, served: 0, namedSeen: [], endings: [] }
		});

		expect(syncBadges(save).badges).toEqual([
			{ id: 'first-light', day: 2 },
			{ id: 'long-bench', day: 1 }
		]);
	});
});
