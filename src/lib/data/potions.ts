import type { PotionRecord } from '../types';

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
