import type { CharacterRecord, VisitRecord } from '../types';

export const CHARACTERS: readonly CharacterRecord[] = [
	{
		id: 'widow',
		name: 'The Widow',
		portraitSeed: 12,
		visits: [
			{
				id: 'widow-lamp',
				characterId: 'widow',
				chapter: 1,
				request:
					'My husband’s lamp went out last winter, and every light since has burned too hot. I need something warm. Something gentle.',
				tags: ['Warm', 'Light'],
				cleanLine: 'It does not burn. It only warms. Thank you, alchemist.',
				sideEffectLine: 'It glows, but it is too bright for my eyes. I will keep it covered.',
				declineLine: 'No. That is not light. But thank you for trying.'
			}
		]
	},
	{
		id: 'bakers-boy',
		name: 'The Baker’s Boy',
		portraitSeed: 27,
		visits: [
			{
				id: 'baker-lantern',
				characterId: 'bakers-boy',
				chapter: 1,
				request:
					'The lane home has no lamps. I need something bright enough to see by, but warm enough to hold.',
				tags: ['Bright', 'Warm'],
				cleanLine: 'It is like carrying a summer evening in my pocket.',
				sideEffectLine: 'It hisses a little. But I can see the whole lane.',
				declineLine: 'I will manage in the dark. Goodnight.'
			}
		]
	}
];

export const VISITS: readonly VisitRecord[] = CHARACTERS.flatMap((character) => character.visits);

const VISIT_BY_ID = new Map(VISITS.map((visit) => [visit.id, visit]));
const CHARACTER_BY_ID = new Map(CHARACTERS.map((character) => [character.id, character]));

export function visitById(id: string | null): VisitRecord | null {
	if (!id) return null;
	return VISIT_BY_ID.get(id) ?? null;
}

export function characterById(id: string): CharacterRecord | null {
	return CHARACTER_BY_ID.get(id) ?? null;
}
