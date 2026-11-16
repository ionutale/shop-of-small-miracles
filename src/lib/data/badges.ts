/**
 * The keepsakes a career can collect. Badges are honors only: no bonuses, no
 * currency, and nothing here changes how the shop plays.
 */
export type BadgeId =
	| 'first-light'
	| 'open-for-business'
	| 'long-bench'
	| 'paper-trail'
	| 'whole-book'
	| 'widows-friend'
	| 'salt-and-company'
	| 'apprentices-trust'
	| 'three-chairs'
	| 'shop-endures'
	| 'last-miracle'
	| 'quiet-closing'
	| 'chair-keeper';

export interface BadgeRecord {
	id: BadgeId;
	title: string;
	/** Shown once the badge is earned. */
	flavor: string;
	/** Shown while the badge is still locked. */
	hint: string;
}

export const BADGES: readonly BadgeRecord[] = [
	{
		id: 'first-light',
		title: 'First Light',
		flavor:
			'The first potion that came out exactly as asked. The lamp seemed a little brighter after.',
		hint: 'Brew a clean potion.'
	},
	{
		id: 'open-for-business',
		title: 'Open for Business',
		flavor:
			'Fifty doors opened, fifty times the bell above them rang. The shop is a habit now, in the best way.',
		hint: 'Serve fifty visitors.'
	},
	{
		id: 'long-bench',
		title: 'The Long Bench',
		flavor: 'Ten careful brews in. The counter has worn itself to the shape of your elbows.',
		hint: 'Brew ten clean potions.'
	},
	{
		id: 'paper-trail',
		title: 'Paper Trail',
		flavor: 'Five names written in the ledger, each one a recipe the shop now knows by heart.',
		hint: 'Discover five named potions.'
	},
	{
		id: 'whole-book',
		title: 'The Whole Book',
		flavor:
			'Every name in the old alchemist’s book, brewed at least once. The margins are yours now.',
		hint: 'Discover all twenty-four named potions.'
	},
	{
		id: 'widows-friend',
		title: "The Widow's Friend",
		flavor: 'She no longer knocks before coming in. That is the whole honor.',
		hint: 'Earn the widow’s trust.'
	},
	{
		id: 'salt-and-company',
		title: 'Salt and Company',
		flavor: 'The merchant saves you the good jars now, and pretends it is only business.',
		hint: 'Earn the merchant’s trust.'
	},
	{
		id: 'apprentices-trust',
		title: "The Apprentice's Trust",
		flavor: 'The apprentice asks before they take the ingredients, and listens for the answer.',
		hint: 'Earn the apprentice’s trust.'
	},
	{
		id: 'three-chairs',
		title: 'Three Chairs',
		flavor:
			'Three people who could sit by the stove at once, if they ever came on the same evening.',
		hint: 'Be trusted by all three regulars.'
	},
	{
		id: 'shop-endures',
		title: 'The Shop Endures',
		flavor: 'The rent was paid and the lamp stayed lit. Most mornings, that is miracle enough.',
		hint: 'Reach an ending where the shop endures.'
	},
	{
		id: 'last-miracle',
		title: 'The Last Miracle',
		flavor: 'You kept the chair by the stove, and the three who love you kept coming back to it.',
		hint: 'Reach the last miracle.'
	},
	{
		id: 'quiet-closing',
		title: 'A Quiet Closing',
		flavor:
			'The sign came down before the thaw. The town did not blame you, and nothing about it was a failure.',
		hint: 'Reach a quiet closing.'
	},
	{
		id: 'chair-keeper',
		title: 'Chair Keeper',
		flavor:
			'Whatever the shop chose to become, the chair by the stove stayed. Some things are not for sale.',
		hint: 'Reach an ending with the chair kept.'
	}
];
