import type { ContentBundle } from '../types';
import { CHAPTERS } from './chapters';
import { CHARACTERS } from './characters';
import { ELEMENTS } from './elements';
import { POTIONS } from './potions';

/**
 * The complete authored bundle used by the validator and the offline shop.
 * Upgrades and endings are filled in by the later economy and story slices.
 */
export const CONTENT: ContentBundle = {
	elements: ELEMENTS,
	potions: POTIONS,
	characters: CHARACTERS,
	chapters: CHAPTERS,
	upgrades: [],
	endings: []
};
