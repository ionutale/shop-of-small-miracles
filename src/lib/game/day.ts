import { chapterNumberForDay, TOTAL_DAYS } from '../data/chapters';
import type { SaveState } from '../types';
import { pickVisit } from './eligibility';
import { dayRngState } from './rng';

/**
 * Opens a service day. The day's RNG is derived from the save seed and day, so
 * the same save always opens with the same visitors; the advanced state is then
 * persisted through the day.
 */
export function beginServiceDay(save: SaveState, day = save.day): SaveState {
	const chapter = chapterNumberForDay(day);
	const rngState = dayRngState(save.seed, day);

	const base: SaveState = {
		...save,
		day,
		chapter,
		phase: 'service',
		servedToday: 0,
		activeVisitId: null,
		quietDay: false,
		lastResult: null,
		market: [],
		rngState
	};

	const picked = pickVisit({
		stock: base.stock,
		chapter,
		day,
		servedVisitIds: base.servedVisitIds,
		rngState
	});

	return {
		...base,
		activeVisitId: picked.visit?.id ?? null,
		quietDay: picked.quietDay,
		rngState: picked.rngState
	};
}

/** End of service. The evening market belongs to a later slice. */
export function endService(save: SaveState): SaveState {
	return {
		...save,
		phase: 'market',
		activeVisitId: null,
		lastResult: null
	};
}

/**
 * Closes the day. A quiet day still reaches the evening, and the last night
 * stops at a non-ending placeholder until the story slice writes its endings.
 */
export function endDay(save: SaveState): SaveState {
	if (save.day >= TOTAL_DAYS) {
		return {
			...save,
			phase: 'chapterEnd',
			activeVisitId: null,
			quietDay: false,
			lastResult: null,
			market: []
		};
	}

	return beginServiceDay({ ...save, day: save.day + 1 }, save.day + 1);
}
