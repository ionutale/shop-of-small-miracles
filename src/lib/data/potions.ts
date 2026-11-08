import type { PotionRecord, Tag } from '../types';

/**
 * The named potions the shop can produce. A named potion is a tag pair with a
 * title and a small effect; unknown pairs still brew and get a descriptive name
 * from `namePotion`.
 */
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
	},
	{
		id: 'hush',
		name: 'Hush',
		tags: ['Still', 'Dreaming'],
		effect: 'Sleep without dreams, and a morning that arrives gently.'
	},
	{
		id: 'salt-tears',
		name: 'Salt Tears',
		tags: ['Grief', 'Cleanse'],
		effect: 'Crying that helps, and a face that feels washed afterwards.'
	},
	{
		id: 'iron-promise',
		name: 'Iron Promise',
		tags: ['Heavy', 'Bound'],
		effect: 'A vow that holds even when no one is watching.'
	},
	{
		id: 'green-quiet',
		name: 'Green Quiet',
		tags: ['Calm', 'Ground'],
		effect: 'The body remembers peace, and the ground remembers the body.'
	},
	{
		id: 'first-frost',
		name: 'First Frost',
		tags: ['Cold', 'Still'],
		effect: 'A held breath of winter, sharp at the edges and quiet in the middle.'
	},
	{
		id: 'ember-tea',
		name: 'Ember Tea',
		tags: ['Warm', 'Spark'],
		effect: 'Courage in the chest, and warm hands to go with it.'
	},
	{
		id: 'copper-courage',
		name: 'Copper Courage',
		tags: ['Warm', 'Bound'],
		effect: 'A hand that does not shake when it reaches for the latch.'
	},
	{
		id: 'silver-hush',
		name: 'Silver Hush',
		tags: ['Still', 'Radiant'],
		effect: 'A silence full of light, like a room after snow.'
	},
	{
		id: 'bitter-truth',
		name: 'Bitter Truth',
		tags: ['Bitter', 'Sharp'],
		effect: 'A clear, unwelcome word that is better said than swallowed.'
	},
	{
		id: 'hollow-bell',
		name: 'Hollow Bell',
		tags: ['Hollow', 'Grief'],
		effect: 'A sound for empty rooms, and a room that listens back.'
	},
	{
		id: 'paper-lantern',
		name: 'Paper Lantern',
		tags: ['Light', 'Ground'],
		effect: 'A light that stays where it is put, even in a wind.'
	},
	{
		id: 'dreamless',
		name: 'Dreamless',
		tags: ['Dreaming', 'Hollow'],
		effect: 'A night with no visitors, and a morning with no debts.'
	},
	{
		id: 'needle-rain',
		name: 'Needle Rain',
		tags: ['Sharp', 'Cold'],
		effect: 'Precision that bites, and a clean line through the fog.'
	},
	{
		id: 'soft-landing',
		name: 'Soft Landing',
		tags: ['Soft', 'Ground'],
		effect: 'A fall that forgets itself before it reaches the floor.'
	},
	{
		id: 'clean-window',
		name: 'Clean Window',
		tags: ['Cleanse', 'Light'],
		effect: 'A room that forgives the winter and lets the day in.'
	},
	{
		id: 'old-ember',
		name: 'Old Ember',
		tags: ['Warm', 'Grief'],
		effect: 'Warmth that remembers, and a chair that is still a chair.'
	},
	{
		id: 'salt-road',
		name: 'Salt Road',
		tags: ['Ground', 'Bitter'],
		effect: 'A journey that keeps its shape underfoot.'
	},
	{
		id: 'bright-thread',
		name: 'Bright Thread',
		tags: ['Bright', 'Bound'],
		effect: 'A promise you can see from across a room.'
	},
	{
		id: 'quiet-snow',
		name: 'Quiet Snow',
		tags: ['Cold', 'Soft'],
		effect: 'Silence you can hold in both hands.'
	},
	{
		id: 'lantern-heart',
		name: 'Lantern Heart',
		tags: ['Light', 'Radiant'],
		effect: 'A small, steady hope that does not ask to be believed.'
	},
	{
		id: 'deep-breath',
		name: 'Deep Breath',
		tags: ['Calm', 'Still'],
		effect: 'The body settles, and the room grows a little larger.'
	},
	{
		id: 'bell-of-return',
		name: 'Bell of Return',
		tags: ['Hollow', 'Warm'],
		effect: 'A sound that calls someone home without telling them to hurry.'
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
