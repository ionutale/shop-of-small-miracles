import { describe, expect, it } from 'vitest';
import { VISITS_PER_DAY, rentDueOn } from '../data/chapters';
import { saveFixture } from '../test/fixtures';
import { beginServiceDay, continueAfterRent, endDay, endService, payRent } from './day';
import { dayRngState } from './rng';

describe('day transitions', () => {
	it('opens a day with three visitors allowed and the fixed first visitor', () => {
		const opened = beginServiceDay(saveFixture({ day: 1, chapter: 1 }));
		expect(VISITS_PER_DAY).toBe(3);
		expect(opened.phase).toBe('service');
		expect(opened.servedToday).toBe(0);
		expect(opened.activeVisitId).toBe('widow-lamp');
		expect(opened.quietDay).toBe(false);
		expect(opened.rngState).toBe(dayRngState(42, 1));
	});

	it('opens the evening with eight unique offers and does not reroll them', () => {
		const evening = endService(saveFixture({ servedToday: 3, activeVisitId: 'widow-lamp' }));
		expect(evening.phase).toBe('market');
		expect(evening.activeVisitId).toBeNull();
		expect(evening.lastResult).toBeNull();
		expect(evening.market).toHaveLength(8);
		expect(new Set(evening.market.map((offer) => offer.elementId)).size).toBe(8);

		const again = endService(evening);
		expect(again.market).toEqual(evening.market);
	});

	it('adds the stillroom offer after the upgrade is owned', () => {
		const evening = endService(
			saveFixture({ servedToday: 3, upgrades: ['stillroom'], market: [] })
		);
		expect(evening.market).toHaveLength(9);
	});

	it('advances to the next day and resets the daily count without forgetting who was served', () => {
		const served = saveFixture({
			day: 1,
			chapter: 1,
			phase: 'market',
			servedToday: 3,
			servedVisitIds: ['widow-lamp', 'baker-lantern', 'merchant-salt']
		});
		const next = endDay(served);
		expect(next.day).toBe(2);
		expect(next.chapter).toBe(1);
		expect(next.phase).toBe('service');
		expect(next.servedToday).toBe(0);
		expect(next.servedVisitIds).toEqual(
			expect.arrayContaining(['widow-lamp', 'baker-lantern', 'merchant-salt'])
		);
		expect(next.activeVisitId).not.toBe('widow-lamp');
		expect(next.activeVisitId).not.toBe('baker-lantern');
	});

	it('stops at the rent scene on days 7, 14, and 21 instead of crossing the chapter', () => {
		for (const [day, chapter] of [
			[7, 1],
			[14, 2],
			[21, 3]
		] as const) {
			const closing = endDay(saveFixture({ day, chapter, phase: 'market' }));
			expect(closing.day).toBe(day);
			expect(closing.chapter).toBe(chapter);
			expect(closing.phase).toBe('chapterEnd');
			expect(closing.rentOutcome).toBeNull();
			expect(rentDueOn(closing.day)).not.toBeNull();
		}
	});

	it('reproduces the same day from the same seed and day', () => {
		const a = beginServiceDay(saveFixture({ day: 9, chapter: 2, servedVisitIds: [] }), 9);
		const b = beginServiceDay(saveFixture({ day: 9, chapter: 2, servedVisitIds: [] }), 9);
		expect(a.activeVisitId).toBe(b.activeVisitId);
		expect(a.rngState).toBe(b.rngState);
	});
});

describe('rent', () => {
	it('deducts the rent and advances to the next chapter and day', () => {
		const paid = payRent(
			saveFixture({ day: 7, chapter: 1, phase: 'chapterEnd', coins: 100, reputation: 5 })
		);

		expect(paid.coins).toBe(60);
		expect(paid.day).toBe(8);
		expect(paid.chapter).toBe(2);
		expect(paid.phase).toBe('service');
		expect(paid.rentOutcome?.kind).toBe('paid');
		expect(paid.rentOutcome?.taken).toBeNull();
		expect(paid.phase).not.toBe('ending');
	});

	it('applies the reputation upgrade when a new chapter starts', () => {
		const paid = payRent(
			saveFixture({
				day: 7,
				chapter: 1,
				phase: 'chapterEnd',
				coins: 100,
				reputation: 5,
				upgrades: ['reputation']
			})
		);
		expect(paid.reputation).toBe(6);
	});

	it('makes a shortfall a setback and still opens the next day', () => {
		const short = payRent(
			saveFixture({
				day: 7,
				chapter: 1,
				phase: 'chapterEnd',
				coins: 0,
				reputation: 5,
				upgrades: ['shelf'],
				shelfCapacity: 40
			})
		);

		expect(short.setbacks).toBe(1);
		expect(short.coins).toBe(10);
		expect(short.reputation).toBe(3);
		expect(short.upgrades).toEqual([]);
		expect(short.shelfCapacity).toBe(30);
		expect(short.day).toBe(8);
		expect(short.chapter).toBe(2);
		expect(short.phase).toBe('service');
		expect(short.flags).toContain('rentMissed');
		expect(short.rentOutcome?.kind).toBe('shortfall');
		expect(short.rentOutcome?.message).toMatch(/shelf/i);
		expect(short.phase).not.toBe('ending');
	});

	it('closes the final ledger on day 21 without an ending or a game over', () => {
		const final = payRent(
			saveFixture({ day: 21, chapter: 3, phase: 'chapterEnd', coins: 200, reputation: 5 })
		);

		expect(final.coins).toBe(80);
		expect(final.day).toBe(21);
		expect(final.phase).toBe('chapterEnd');
		expect(final.flags).toContain('ledgerClosed');
		expect(final.rentOutcome?.kind).toBe('paid');
		expect(final.phase).not.toBe('ending');

		const closed = continueAfterRent(final);
		expect(closed.rentOutcome).toBeNull();
		expect(closed.phase).toBe('chapterEnd');
	});

	it('clears the rent result once the player continues', () => {
		const paid = payRent(
			saveFixture({ day: 7, chapter: 1, phase: 'chapterEnd', coins: 100, reputation: 5 })
		);
		const continued = continueAfterRent(paid);

		expect(continued.rentOutcome).toBeNull();
		expect(continued.day).toBe(8);
		expect(continued.phase).toBe('service');
	});
});
