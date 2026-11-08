/**
 * The previous alchemist's letters, left in the shop for whoever came next.
 * Each letter is collected once its day arrives; the journal shows the rest as
 * still sealed.
 */
export interface LetterRecord {
	id: string;
	/** The day the letter becomes readable. */
	day: number;
	title: string;
	body: string;
}

export const LETTERS: readonly LetterRecord[] = [
	{
		id: 'the-shop-and-the-chair',
		day: 1,
		title: 'The shop and the chair',
		body: 'If you are reading this, the shop is yours. The kettle is behind the counter, the ledger is in the drawer, and the chair by the stove is not for sale. Brew what people ask for, and if you cannot, say so kindly. The town remembers kindness longer than coin. — A.'
	},
	{
		id: 'on-rent-and-rain',
		day: 7,
		title: 'On rent and rain',
		body: 'The landlord is not cruel, only punctual. Pay him when the week turns, and if you cannot, let him take something small. A shelf can be rebuilt. Trust takes longer. — A.'
	},
	{
		id: 'the-last-miracle',
		day: 14,
		title: 'The last miracle',
		body: 'They will ask you what my last miracle was. I have hidden the answer in the shop, where the light falls at the end of the day. Do not look for it too hard. Some answers arrive while you are making tea. — A.'
	},
	{
		id: 'what-the-shop-is-for',
		day: 20,
		title: 'What the shop is for',
		body: 'By now you know the work: three ingredients, one careful wish, and a door that stays open after dark. Whatever you decide about the shop tomorrow, decide it kindly. I was proud of this place. I would be proud of what you make of it. — A.'
	}
] as const;

/** Letters whose day has arrived. Order is the authored order. */
export function lettersUpTo(day: number): LetterRecord[] {
	return LETTERS.filter((letter) => letter.day <= day);
}
