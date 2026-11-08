import { chapterNumberForDay, isRentDay, rentDueOn, TOTAL_DAYS } from '../data/chapters';
import { ownsUpgrade } from '../data/upgrades';
import type { SaveState } from '../types';
import { applyRentShortfall, generateMarket } from './economy';
import { pickVisit } from './eligibility';
import { dayRngState } from './rng';

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * Opens a service day. The day's RNG is derived from the save seed and day, so
 * the same save always opens with the same visitors; the advanced state is then
 * persisted through the day. The nightly ledger flags reset here.
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
		upgradeBoughtToday: false,
		swappedToday: false,
		apprenticeUsedToday: false,
		warmStoveUsedToday: false,
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

/**
 * End of service. The evening market is generated once from the seed and day
 * and then persisted, so a reload during the evening keeps the same stalls.
 */
export function endService(save: SaveState): SaveState {
	const market =
		save.market.length > 0
			? save.market
			: generateMarket(dayRngState(save.seed, save.day), save.chapter, save.day, save.upgrades)
					.offers;

	return {
		...save,
		phase: 'market',
		activeVisitId: null,
		lastResult: null,
		market,
		rentOutcome: null
	};
}

/**
 * Closes the evening. Rent days pause at the chapter-end ledger; every other
 * night opens the next service day. The final day stops at the ledger too,
 * until the story slice writes its ending.
 */
export function endDay(save: SaveState): SaveState {
	if (isRentDay(save.day) || save.day >= TOTAL_DAYS) {
		return {
			...save,
			phase: 'chapterEnd',
			activeVisitId: null,
			quietDay: false,
			lastResult: null,
			market: [],
			rentOutcome: null
		};
	}

	return beginServiceDay(
		{
			...save,
			day: save.day + 1,
			market: [],
			lastResult: null,
			rentOutcome: null
		},
		save.day + 1
	);
}

/**
 * Pays the rent for the current chapter. Missing it is a setback, never a game
 * over: the shop applies the landlord's price and still opens the next day.
 * The outcome stays in the save so the rent scene can name what was taken.
 */
export function payRent(save: SaveState): SaveState {
	const rent = rentDueOn(save.day);
	if (rent === null || save.rentOutcome) return save;

	const settled: SaveState =
		save.coins >= rent
			? {
					...save,
					coins: save.coins - rent,
					rentOutcome: {
						kind: 'paid',
						rent,
						coinsAfter: save.coins - rent,
						taken: null,
						message: `Rent paid: ${rent} coins. The ledger is clear.`
					}
				}
			: applyRentShortfall(save);

	if (settled.day >= TOTAL_DAYS) {
		return {
			...settled,
			phase: 'chapterEnd',
			activeVisitId: null,
			quietDay: false,
			market: [],
			flags: settled.flags.includes('ledgerClosed')
				? settled.flags
				: [...settled.flags, 'ledgerClosed']
		};
	}

	const nextDay = settled.day + 1;
	const carried: SaveState = {
		...settled,
		day: nextDay,
		reputation: ownsUpgrade(settled.upgrades, 'reputation')
			? clamp(settled.reputation + 1, 0, 10)
			: settled.reputation
	};

	return beginServiceDay(carried, nextDay);
}

/**
 * Dismisses the paid-or-setback page. The final ledger opens the ending; every
 * other night is already showing the next service day behind the page.
 */
export function continueAfterRent(save: SaveState): SaveState {
	if (!save.rentOutcome) return save;
	const cleared: SaveState = { ...save, rentOutcome: null };
	if (cleared.day >= TOTAL_DAYS && cleared.flags.includes('ledgerClosed')) {
		return { ...cleared, phase: 'ending' };
	}
	return cleared;
}
