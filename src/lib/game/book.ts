import type { DiscoveredPotion, Tag } from '../types';
import { namedPotionFor } from '../data/potions';

export interface BookEntry extends DiscoveredPotion {
	/** Named potions have an authored effect; everything else is unfiled. */
	named: boolean;
}

/** Turn the save's discovery log into recipe-book entries, named first. */
export function bookEntries(discovered: readonly DiscoveredPotion[]): BookEntry[] {
	return discovered
		.map((potion) => ({
			...potion,
			tags: [...potion.tags],
			named: namedPotionFor(potion.tags) !== null
		}))
		.sort((a, b) => {
			if (a.named !== b.named) return a.named ? -1 : 1;
			return a.day - b.day || a.name.localeCompare(b.name);
		});
}

/**
 * Filter the book by a free-text search and one essence. Only the entries passed
 * in are searched, so undiscovered potions can never leak through.
 */
export function filterBook(
	entries: readonly BookEntry[],
	query: string,
	tag: Tag | null
): BookEntry[] {
	const needle = query.trim().toLowerCase();
	return entries.filter((entry) => {
		if (tag && !entry.tags.includes(tag)) return false;
		if (!needle) return true;
		return (
			entry.name.toLowerCase().includes(needle) ||
			entry.tags.some((entryTag) => entryTag.toLowerCase().includes(needle))
		);
	});
}

/**
 * A short, non-numeric hint for the journal. Relationship values are 0–10; the
 * hint is the only place the player sees them outside choices.
 */
export function relationshipHint(value: number): string {
	if (value >= 9) return 'They no longer knock. The chair by the stove is theirs.';
	if (value >= 6) return 'They speak to you the way people speak to an old friend.';
	if (value >= 3) return 'They have begun to expect the light in your window.';
	return 'A face you are still learning.';
}
