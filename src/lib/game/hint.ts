import type { ElementRecord, StockEntry, Tag } from '../types';

interface Candidate {
	id: string;
	primary: Tag;
	units: number;
}

/**
 * Find three in-stock elements whose primary essences cover both requested tags
 * with exactly one doubled. Distinct elements are preferred; a single element
 * can fill two slots when its stock allows. Returns null when impossible.
 */
export function suggestBrew(
	stock: readonly StockEntry[],
	tags: readonly [Tag, Tag],
	elements: readonly ElementRecord[]
): string[] | null {
	const wanted = new Set(tags);
	if (wanted.size !== 2) return null;

	const byId = new Map(elements.map((element) => [element.id, element]));
	const available: Candidate[] = stock
		.map((entry) => {
			const element = byId.get(entry.elementId);
			return element && entry.units > 0
				? { id: element.id, primary: element.primary, units: entry.units }
				: null;
		})
		.filter((candidate): candidate is Candidate => candidate !== null);

	const fits = (ids: readonly string[]): boolean => {
		const needed = new Map<string, number>();
		for (const id of ids) needed.set(id, (needed.get(id) ?? 0) + 1);
		for (const [id, count] of needed) {
			const candidate = available.find((entry) => entry.id === id);
			if (!candidate || candidate.units < count) return false;
		}
		const primaries = new Set(ids.map((id) => available.find((entry) => entry.id === id)!.primary));
		return primaries.size === 2 && [...wanted].every((tag) => primaries.has(tag));
	};

	for (let a = 0; a < available.length; a += 1) {
		for (let b = a + 1; b < available.length; b += 1) {
			for (let c = b + 1; c < available.length; c += 1) {
				const ids = [available[a].id, available[b].id, available[c].id];
				if (fits(ids)) return ids;
			}
		}
	}

	for (let a = 0; a < available.length; a += 1) {
		for (let b = 0; b < available.length; b += 1) {
			if (b === a) continue;
			const ids = [available[a].id, available[a].id, available[b].id];
			if (fits(ids)) return ids;
		}
	}

	return null;
}
