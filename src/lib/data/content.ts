import type { ContentBundle } from '../types';
import { CHAPTERS } from './chapters';
import { CHARACTERS } from './characters';
import { ELEMENTS } from './elements';
import { POTIONS } from './potions';
import { UPGRADES } from './upgrades';

/**
 * The complete authored bundle used by the validator and the offline shop.
 * Endings are filled in by the later story slice.
 */
export const CONTENT: ContentBundle = {
	elements: ELEMENTS,
	potions: POTIONS,
	characters: CHARACTERS,
	chapters: CHAPTERS,
	upgrades: UPGRADES,
	endings: []
};
