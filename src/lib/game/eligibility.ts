import type { ElementRecord, StockEntry, Tag, VisitRecord } from '../types';

/**
 * A request is presentable only if three units on the shelf can supply both
 * desired tags. The same element may fill more than one slot.
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
