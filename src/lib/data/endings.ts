import type { EndingRecord } from '../types';

/**
 * The three endings. Each one names what the shop chose to be; none is framed
 * as a failure. `story.ts` decides which one applies from reputation,
 * relationships, flags, and setbacks.
 */
export const ENDINGS: readonly EndingRecord[] = [
	{
		id: 'shop-endures',
		title: 'The Shop Endures',
		epilogue:
			'The rent was paid, the lamp stayed lit, and the town learned the sound of your bell. Some miracles are small enough to fit in a pocket. You keep the shop. Most mornings, that is miracle enough.'
	},
	{
		id: 'last-miracle',
		title: 'The Last Miracle',
		epilogue:
			'You keep the chair by the stove, and the three who love you keep coming back to it. What the old alchemist did last was not a grand spell; it was a promise that someone would still be here. You make that promise again, quietly, every morning.'
	},
	{
		id: 'quiet-closing',
		title: 'A Quiet Closing',
		epilogue:
			'You take the sign down before the thaw and leave the key under the mat for whoever comes next. The town does not blame you. The lamp in the window goes out slowly, and nothing about it is a failure.'
	}
] as const;

export const ENDING_BY_ID: ReadonlyMap<string, EndingRecord> = new Map(
	ENDINGS.map((ending) => [ending.id, ending])
);
