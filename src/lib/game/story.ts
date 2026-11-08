import { choiceForOption, choicesForDay } from '../data/choices';
import { ENDING_BY_ID, ENDINGS } from '../data/endings';
import type { ArcId, EndingRecord, SaveState } from '../types';

const ARCS: readonly ArcId[] = ['widow', 'merchant', 'apprentice'];

export interface EndingMetrics {
	reputation: number;
	relationships: Record<ArcId, number>;
	flags: readonly string[];
	setbacks: number;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * Ending order is fixed: a closing (chosen or forced by two setbacks), then the
 * full miracle, then the quiet endurance. No branch is a failure state.
 */
export function endingFor(metrics: EndingMetrics): EndingRecord {
	if (metrics.flags.includes('closedTheShop') || metrics.setbacks >= 2) {
		return ENDING_BY_ID.get('quiet-closing')!;
	}
	const allFriends = ARCS.every((arc) => (metrics.relationships[arc] ?? 0) >= 6);
	if (metrics.reputation >= 7 && allFriends && metrics.flags.includes('keptTheChair')) {
		return ENDING_BY_ID.get('last-miracle')!;
	}
	return ENDING_BY_ID.get('shop-endures')!;
}

/** The ending the current save has earned. Deterministic from saved metrics. */
export function selectEnding(save: SaveState): EndingRecord {
	return endingFor({
		reputation: save.reputation,
		relationships: save.relationships,
		flags: save.flags,
		setbacks: save.setbacks
	});
}

/** The morning card for this save, if the day has not been opened yet. */
export function morningDue(save: SaveState): boolean {
	return save.phase === 'service' && save.morningSeenDay < save.day;
}

/** The authored choice or choices on this save's day. */
export function morningChoices(save: SaveState): ReturnType<typeof choicesForDay> {
	return choicesForDay(save.day);
}

/**
 * Apply one authored option. The option must belong to the save's current day
 * and can only be taken once. Flags are deduplicated; relationships and
 * reputation are clamped to their 0–10 bounds.
 */
export function applyChoice(save: SaveState, optionId: string): SaveState {
	const found = choiceForOption(optionId);
	if (!found || found.choice.day !== save.day) return save;
	if (save.choices.includes(optionId)) return save;

	const effects = found.option.effects;
	const relationships: Record<ArcId, number> = { ...save.relationships };
	for (const arc of ARCS) {
		const delta = effects.relationships?.[arc] ?? 0;
		relationships[arc] = clamp(relationships[arc] + delta, 0, 10);
	}

	const flags = [...save.flags];
	for (const flag of effects.flags ?? []) {
		if (!flags.includes(flag)) flags.push(flag);
	}

	return {
		...save,
		relationships,
		flags,
		reputation: clamp(save.reputation + (effects.reputation ?? 0), 0, 10),
		choices: [...save.choices, optionId]
	};
}

export { ENDINGS };
