import { CHAPTERS } from '../data/chapters';
import { characterById, VISITS } from '../data/characters';
import { ELEMENTS } from '../data/elements';
import type { ElementRecord, StockEntry, Tag, VisitRecord } from '../types';
import { pickIndex } from './rng';

/**
 * A request is presentable only if three units on the shelf can supply both
 * desired tags. The same element may fill more than one slot, but every slot
 * must carry one of the requested essences so the brew can be clean.
 */
export function canSatisfyTags(
	stock: readonly StockEntry[],
	tags: readonly Tag[],
	elements: readonly ElementRecord[]
): boolean {
	const wanted = new Set(tags);
	const sources = elements.filter((element) => wanted.has(element.primary));
	const remaining = new Map(
		sources.map((element) => [
			element.id,
			stock.find((entry) => entry.elementId === element.id)?.units ?? 0
		])
	);

	function search(slot: number, covered: Set<Tag>): boolean {
		if (slot === 3) return [...wanted].every((tag) => covered.has(tag));

		for (const source of sources) {
			const units = remaining.get(source.id) ?? 0;
			if (units === 0) continue;

			remaining.set(source.id, units - 1);
			const next = new Set(covered);
			next.add(source.primary);
			const found = search(slot + 1, next);
			remaining.set(source.id, units);
			if (found) return true;
		}

		return false;
	}

	return search(0, new Set());
}

/** Keeps the hard promise: the shop never presents an unwinnable request. */
export function eligibleVisits(
	stock: readonly StockEntry[],
	visits: readonly VisitRecord[],
	elements: readonly ElementRecord[],
	servedVisitIds: readonly string[] = []
): VisitRecord[] {
	return visits.filter(
		(visit) => !servedVisitIds.includes(visit.id) && canSatisfyTags(stock, visit.tags, elements)
	);
}

const SCHEDULED_BY_DAY = new Map<number, VisitRecord>();
const SCHEDULED_DAY_BY_VISIT = new Map<string, number>();

for (const chapter of CHAPTERS) {
	for (const recurring of chapter.recurring) {
		const character = characterById(recurring.characterId);
		if (!character) continue;
		const visit = character.visits.find((candidate) => candidate.chapter === chapter.number);
		if (!visit) continue;
		for (const day of recurring.days) {
			SCHEDULED_BY_DAY.set(day, visit);
			SCHEDULED_DAY_BY_VISIT.set(visit.id, day);
		}
	}
}

export function scheduledVisitForDay(day: number): VisitRecord | null {
	return SCHEDULED_BY_DAY.get(day) ?? null;
}

export function isScheduledForAnotherDay(visitId: string, day: number): boolean {
	const scheduledDay = SCHEDULED_DAY_BY_VISIT.get(visitId);
	return scheduledDay !== undefined && scheduledDay !== day;
}

export interface PickVisitInput {
	stock: readonly StockEntry[];
	chapter: 1 | 2 | 3;
	day: number;
	servedVisitIds?: readonly string[];
	rngState: number;
	visits?: readonly VisitRecord[];
	elements?: readonly ElementRecord[];
}

export interface PickVisitResult {
	visit: VisitRecord | null;
	rngState: number;
	quietDay: boolean;
}

/**
 * Chooses one visit for a day. A fixed recurring visit wins when it is stocked;
 * otherwise the chapter pool is filtered by the current shelf, the day's other
 * reserved visits, and everyone already served. No candidates means a quiet day.
 */
export function pickVisit({
	stock,
	chapter,
	day,
	servedVisitIds = [],
	rngState,
	visits = VISITS,
	elements = ELEMENTS
}: PickVisitInput): PickVisitResult {
	const served = new Set(servedVisitIds);
	const scheduled = scheduledVisitForDay(day);

	if (
		scheduled &&
		scheduled.chapter === chapter &&
		!served.has(scheduled.id) &&
		canSatisfyTags(stock, scheduled.tags, elements)
	) {
		return { visit: scheduled, rngState, quietDay: false };
	}

	const candidates = visits.filter(
		(visit) =>
			visit.chapter === chapter &&
			!served.has(visit.id) &&
			!isScheduledForAnotherDay(visit.id, day) &&
			canSatisfyTags(stock, visit.tags, elements)
	);

	if (candidates.length === 0) {
		return { visit: null, rngState, quietDay: true };
	}

	const step = pickIndex(rngState, candidates.length);
	return { visit: candidates[step.index], rngState: step.state, quietDay: false };
}
