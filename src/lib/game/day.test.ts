import { describe, expect, it } from 'vitest';
import { VISITS_PER_DAY } from '../data/chapters';
import { saveFixture } from '../test/fixtures';
import { beginServiceDay, endDay, endService } from './day';
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

	it('moves to the evening placeholder and clears the active visit', () => {
		const evening = endService(saveFixture({ servedToday: 3, activeVisitId: 'widow-lamp' }));
		expect(evening.phase).toBe('market');
		expect(evening.activeVisitId).toBeNull();
		expect(evening.lastResult).toBeNull();
		expect(evening.servedToday).toBe(3);
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

	it('changes chapter at the right dawns', () => {
		expect(endDay(saveFixture({ day: 7, chapter: 1, phase: 'market' })).chapter).toBe(2);
		expect(endDay(saveFixture({ day: 14, chapter: 2, phase: 'market' })).chapter).toBe(3);
	});

	it('reproduces the same day from the same seed and day', () => {
		const a = beginServiceDay(saveFixture({ day: 9, chapter: 2, servedVisitIds: [] }), 9);
		const b = beginServiceDay(saveFixture({ day: 9, chapter: 2, servedVisitIds: [] }), 9);
		expect(a.activeVisitId).toBe(b.activeVisitId);
		expect(a.rngState).toBe(b.rngState);
	});

	it('stops at a non-ending placeholder on the last night', () => {
		const last = endDay(saveFixture({ day: 21, chapter: 3, phase: 'market' }));
		expect(last.day).toBe(21);
		expect(last.phase).toBe('chapterEnd');
		expect(last.activeVisitId).toBeNull();
	});
});
