import type { ChapterRecord } from '../types';

export const TOTAL_DAYS = 21;
export const VISITS_PER_DAY = 3;
export const DAYS_PER_CHAPTER = 7;

export const CHAPTERS: readonly ChapterRecord[] = [
	{
		number: 1,
		title: 'The Widow’s Lamp',
		rent: 40,
		beats: {
			1: 'A letter arrives under the door, still sealed with the old alchemist’s wax. The shop has been waiting for you.',
			2: 'The town wakes slowly. Someone has swept your step in the night and left no name.',
			3: 'The salt merchant’s cart stops at the corner, and the whole street smells of the road.',
			4: 'A child draws a lamp on your shutter in chalk. It has too many rays, and you leave it.',
			5: 'The landlord’s apprentice counts the lamps on the lane and writes the numbers in a small book.',
			6: 'The widow’s lamp is still burning on her windowsill. You can see it from the shop.',
			7: 'The rent is due at dusk. The landlord’s man comes with an empty ledger and a patient face.'
		},
		recurring: [
			{ characterId: 'widow', days: [1] },
			{ characterId: 'merchant', days: [3] },
			{ characterId: 'apprentice', days: [5] }
		]
	},
	{
		number: 2,
		title: 'The Salt Road',
		rent: 80,
		beats: {
			8: 'The widow comes back with a bundle of letters tied in string. She does not say what she wants.',
			9: 'The salt road is busy and the lower town is coughing. The shop feels smaller than it did.',
			10: 'The salt merchant returns with mud to the knee and a story he does not finish.',
			11: 'The schoolteacher asks whether you have heard the children counting the days until the thaw.',
			12: 'The apprentice brings a jar of clean water from the lower town and leaves it by the door.',
			13: 'A letter with no signature asks what the old alchemist’s last miracle was for.',
			14: 'The rent is due at dusk. The ledger has more names in it than last time.'
		},
		recurring: [
			{ characterId: 'widow', days: [8] },
			{ characterId: 'merchant', days: [10] },
			{ characterId: 'apprentice', days: [12] }
		]
	},
	{
		number: 3,
		title: 'The Last Miracle',
		rent: 120,
		beats: {
			15: 'The widow sits in the chair by the stove and does not speak for a long time.',
			16: 'The salt merchant has stopped selling salt. He stands outside the shop and watches the road.',
			17: 'The merchant brings a small wooden box and asks you to keep it until morning.',
			18: 'The lower town is quieter. Someone has painted the shutters blue, as if for a festival.',
			19: 'The apprentice puts the old alchemist’s chair back in the corner and asks you to look at it.',
			20: 'The landlord’s man comes early. He says the choice can wait one more day.',
			21: 'The last day. The shop is full of small lights, and the ledger is almost finished.'
		},
		recurring: [
			{ characterId: 'widow', days: [15] },
			{ characterId: 'merchant', days: [17] },
			{ characterId: 'apprentice', days: [19] }
		]
	}
];

export function chapterNumberForDay(day: number): 1 | 2 | 3 {
	if (day <= 7) return 1;
	if (day <= 14) return 2;
	return 3;
}

export function chapterForDay(day: number): ChapterRecord {
	return CHAPTERS[chapterNumberForDay(day) - 1];
}

export function beatForDay(day: number): string {
	return chapterForDay(day).beats[day] ?? '';
}

export function rentDueOn(day: number): number | null {
	if (day === 7) return 40;
	if (day === 14) return 80;
	if (day === 21) return 120;
	return null;
}

export function isRentDay(day: number): boolean {
	return rentDueOn(day) !== null;
}
