import type { PotionRecord, Tag } from '../types';

export const POTIONS: readonly PotionRecord[] = [
	{
		id: 'lamplight',
		name: 'Lamplight',
		tags: ['Bright', 'Warm'],
		effect: 'A steady glow that does not burn.'
	},
	{
		id: 'widows-lamp',
		name: "Widow's Lamp",
		tags: ['Light', 'Warm'],
		effect: 'A small light that warms the hands and asks nothing of the heart.'
	}
];

const KEY = (tags: readonly Tag[]) => [...tags].sort().join('+');

const POTION_BY_TAGS = new Map(POTIONS.map((potion) => [KEY(potion.tags), potion]));

/**
 * Named potions win; anything else gets the shop's descriptive, lower-case name.
 * The recipe book records both, but only named potions appear in the story ledger.
 */
export function namePotion(tags: readonly Tag[]): string {
	const distinct = [...new Set(tags)];
	if (distinct.length === 2) {
		const named = POTION_BY_TAGS.get(KEY(distinct));
		if (named) return named.name;
	}
	const words = distinct.map((tag) => tag.toLowerCase()).join(', ');
	return `a ${words} draught`;
}
