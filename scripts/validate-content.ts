import { CHAPTERS, TOTAL_DAYS, VISITS_PER_DAY } from '../src/lib/data/chapters';
import { CONTENT } from '../src/lib/data/content';
import { validateContent } from '../src/lib/game/validate';

const result = validateContent(CONTENT, { full: true });
const visits = CONTENT.characters.reduce((total, character) => total + character.visits.length, 0);

const summary = [
	`${CONTENT.elements.length} elements`,
	`${CONTENT.potions.length} named potions`,
	`${CONTENT.characters.length} characters`,
	`${visits} visits`,
	`${CHAPTERS.length} chapters`,
	`${TOTAL_DAYS} days`,
	`${VISITS_PER_DAY} visitors a day`
].join(', ');

if (!result.ok) {
	console.error(`Content invalid: ${summary}`);
	for (const error of result.errors) console.error(`  - ${error}`);
	process.exit(1);
}

console.log(`Content valid: ${summary}.`);
console.log('Every visit names two tags reachable from three shelf units.');
