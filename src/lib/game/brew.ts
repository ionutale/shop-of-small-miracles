import { namePotion } from '../data/potions';
import type {
	BrewOutcome,
	ElementRecord,
	StockEntry,
	Tag,
	UpgradeRecord,
	VisitRecord
} from '../types';

export interface BrewResult {
	tags: Tag[];
	potency: Tag | null;
}

function elementMap(elements: readonly ElementRecord[]): Map<string, ElementRecord> {
	return new Map(elements.map((element) => [element.id, element]));
}

/** Distinct primary tags in order of addition; a repeated tag is potent. */
export function brewTags(ids: readonly string[], elements: readonly ElementRecord[]): BrewResult {
	const byId = elementMap(elements);
	const primaries: Tag[] = [];
	const counts = new Map<Tag, number>();

	for (const id of ids) {
		const element = byId.get(id);
		if (!element) continue;
		primaries.push(element.primary);
		counts.set(element.primary, (counts.get(element.primary) ?? 0) + 1);
	}

	const tags = [...new Set(primaries)];
	const potency = tags.find((tag) => (counts.get(tag) ?? 0) > 1) ?? null;
	return { tags, potency };
}

export function canBrew(stock: readonly StockEntry[], ids: readonly string[]): boolean {
	if (ids.length !== 3) return false;
	const needed = new Map<string, number>();
	for (const id of ids) needed.set(id, (needed.get(id) ?? 0) + 1);

	for (const [id, count] of needed) {
		const entry = stock.find((item) => item.elementId === id);
		if (!entry || entry.units < count) return false;
	}
	return true;
}

/** Consumes exactly one unit per slot, keeping empty entries at zero. */
export function consume(stock: readonly StockEntry[], ids: readonly string[]): StockEntry[] {
	const needed = new Map<string, number>();
	for (const id of ids) needed.set(id, (needed.get(id) ?? 0) + 1);

	return stock.map((entry) => ({
		...entry,
		units: Math.max(0, entry.units - (needed.get(entry.elementId) ?? 0))
	}));
}

function payFor(
	kind: 'clean' | 'sideEffect',
	matched: number,
	potency: Tag | null,
	extras: number,
	reputation: number
): number {
	const base = 12 + 4 * matched + (potency ? 4 : 0) - 3 * extras;
	const reputationFactor = 1 + (reputation - 5) * 0.04;
	const sideEffectFactor = kind === 'sideEffect' ? 0.7 : 1;
	return Math.max(5, Math.round(base * reputationFactor * sideEffectFactor));
}

/**
 * A clean brew needs both requested tags and nothing else. Extra distinct tags
 * still serve the customer, but the miracle is muddy: less pay, one less
 * reputation. A missing tag is a polite decline: no pay, no reputation loss.
 */
export function judgeBrew(
	result: BrewResult,
	visit: VisitRecord,
	reputation: number,
	upgrades: readonly UpgradeRecord[] = []
): BrewOutcome {
	const matched = visit.tags.filter((tag) => result.tags.includes(tag));
	const extras = result.tags.filter((tag) => !visit.tags.includes(tag));

	if (matched.length < visit.tags.length) {
		return {
			kind: 'decline',
			tags: result.tags,
			potency: result.potency,
			matched,
			extras,
			pay: 0,
			reputationDelta: 0,
			line: visit.declineLine,
			potionName: null
		};
	}

	const kind = extras.length === 0 ? 'clean' : 'sideEffect';
	const owned = new Set(upgrades.map((upgrade) => upgrade.id));
	let pay = payFor(kind, matched.length, result.potency, extras.length, reputation);
	if (kind === 'clean' && owned.has('brass-scales')) pay += 2;
	if (owned.has('old-sign')) pay = Math.round(pay * 1.1);

	return {
		kind,
		tags: result.tags,
		potency: result.potency,
		matched,
		extras,
		pay: Math.max(5, pay),
		reputationDelta: kind === 'clean' ? 1 : -1,
		line: kind === 'clean' ? visit.cleanLine : visit.sideEffectLine,
		potionName: namePotion(result.tags)
	};
}
