import type { Tag } from '../types';

export const TAGS: readonly Tag[] = [
	'Light',
	'Still',
	'Warm',
	'Cold',
	'Sharp',
	'Soft',
	'Heavy',
	'Dreaming',
	'Bitter',
	'Bright',
	'Bound',
	'Ground',
	'Spark',
	'Calm',
	'Cleanse',
	'Radiant',
	'Grief',
	'Hollow'
] as const;

export const TAG_LABELS: Record<Tag, string> = {
	Light: 'Light',
	Still: 'Still',
	Warm: 'Warm',
	Cold: 'Cold',
	Sharp: 'Sharp',
	Soft: 'Soft',
	Heavy: 'Heavy',
	Dreaming: 'Dreaming',
	Bitter: 'Bitter',
	Bright: 'Bright',
	Bound: 'Bound',
	Ground: 'Ground',
	Spark: 'Spark',
	Calm: 'Calm',
	Cleanse: 'Cleanse',
	Radiant: 'Radiant',
	Grief: 'Grief',
	Hollow: 'Hollow'
};

export const TAG_GLYPHS: Record<Tag, string> = {
	Light: '✦',
	Still: '◌',
	Warm: '♨',
	Cold: '❄',
	Sharp: '⌁',
	Soft: '❋',
	Heavy: '⚖',
	Dreaming: '☾',
	Bitter: '✧',
	Bright: '☀',
	Bound: '⛓',
	Ground: '⛰',
	Spark: '⚡',
	Calm: '≈',
	Cleanse: '✚',
	Radiant: '✺',
	Grief: '♡',
	Hollow: '◯'
};
