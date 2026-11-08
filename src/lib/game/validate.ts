import { TAGS } from '../data/tags';
import { TOTAL_DAYS, VISITS_PER_DAY } from '../data/chapters';
import type { ContentBundle, ElementRecord, Tag } from '../types';

export interface ValidationResult {
	ok: boolean;
	errors: string[];
}

export interface ValidateOptions {
	/** Enforce the launch content counts, the 21-day manifest, and its rent days. */
	full?: boolean;
}

const TAG_SET = new Set<Tag>(TAGS);

function isTag(value: unknown): value is Tag {
	return typeof value === 'string' && TAG_SET.has(value as Tag);
}

/**
 * A visit is reachable when three units can cover both requested primaries.
 * This is the authoring-time promise; the runtime shelf check is stricter
 * because it also cares about the units actually in stock.
 */
function canFormTags(tags: readonly Tag[], elements: readonly ElementRecord[]): boolean {
	if (tags.length !== 2 || new Set(tags).size !== 2) return false;
	const wanted = new Set(tags);

	function search(slot: number, covered: Set<Tag>): boolean {
		if (slot === 3) return [...wanted].every((tag) => covered.has(tag));

		for (const element of elements) {
			const next = new Set(covered);
			next.add(element.primary);
			if (search(slot + 1, next)) return true;
		}

		return false;
	}

	return search(0, new Set());
}

export function validateContent(
	content: ContentBundle,
	options: ValidateOptions = {}
): ValidationResult {
	const errors: string[] = [];
	const { elements, potions, characters, chapters, upgrades, endings } = content;

	// Elements
	const elementIds = new Set<string>();
	const symbols = new Set<string>();
	const numbers = new Set<number>();
	const elementPairs = new Set<string>();

	for (const element of elements) {
		if (elementIds.has(element.id)) errors.push(`duplicate element id: ${element.id}`);
		elementIds.add(element.id);

		if (symbols.has(element.symbol)) errors.push(`duplicate element symbol: ${element.symbol}`);
		symbols.add(element.symbol);

		if (numbers.has(element.number)) errors.push(`duplicate atomic number: ${element.number}`);
		numbers.add(element.number);

		if (!isTag(element.primary)) {
			errors.push(`element ${element.id} has an unknown primary tag: ${String(element.primary)}`);
		}
		if (!isTag(element.secondary)) {
			errors.push(
				`element ${element.id} has an unknown secondary tag: ${String(element.secondary)}`
			);
		}
		if (element.primary === element.secondary) {
			errors.push(`element ${element.id} repeats its secondary tag as its primary`);
		}

		const pair = `${element.primary}+${element.secondary}`;
		if (elementPairs.has(pair)) errors.push(`duplicate element tag pair: ${pair}`);
		elementPairs.add(pair);

		if (!Number.isInteger(element.price) || element.price < 2 || element.price > 6) {
			errors.push(`element ${element.id} has an out-of-range price: ${element.price}`);
		}
	}

	if (options.full) {
		for (const tag of TAGS) {
			if (!elements.some((element) => element.primary === tag)) {
				errors.push(`no element carries the ${tag} essence`);
			}
		}
	}

	// Potions
	const potionPairs = new Set<string>();
	for (const potion of potions) {
		if (potion.tags.length !== 2 || new Set(potion.tags).size !== 2) {
			errors.push(`potion ${potion.id} must name two distinct tags`);
		}
		for (const tag of potion.tags) {
			if (!isTag(tag)) errors.push(`potion ${potion.id} has an unknown tag: ${String(tag)}`);
		}
		const key = [...potion.tags].sort().join('+');
		if (potionPairs.has(key)) errors.push(`duplicate potion tag pair: ${key}`);
		potionPairs.add(key);
		if (!potion.name.trim()) errors.push(`potion ${potion.id} has no name`);
		if (!potion.effect.trim()) errors.push(`potion ${potion.id} has no effect`);
	}

	// Characters and visits
	const characterIds = new Set<string>();
	const visitIds = new Set<string>();
	let visitCount = 0;

	for (const character of characters) {
		if (characterIds.has(character.id)) errors.push(`duplicate character id: ${character.id}`);
		characterIds.add(character.id);

		if (!character.name.trim()) errors.push(`character ${character.id} has no name`);
		if (!Number.isInteger(character.portraitSeed)) {
			errors.push(`character ${character.id} has no integer portrait seed`);
		}
		if (character.visits.length < 1 || character.visits.length > 3) {
			errors.push(`character ${character.id} must have between one and three visits`);
		}

		for (const visit of character.visits) {
			visitCount += 1;
			if (visitIds.has(visit.id)) errors.push(`duplicate visit id: ${visit.id}`);
			visitIds.add(visit.id);

			if (visit.characterId !== character.id) {
				errors.push(`visit ${visit.id} is filed under the wrong character`);
			}
			if (![1, 2, 3].includes(visit.chapter)) {
				errors.push(`visit ${visit.id} has an invalid chapter`);
			}
			if (visit.tags.length !== 2 || new Set(visit.tags).size !== 2) {
				errors.push(`visit ${visit.id} must request two distinct tags`);
			}
			for (const tag of visit.tags) {
				if (!isTag(tag)) errors.push(`visit ${visit.id} has an unknown tag: ${String(tag)}`);
			}
			if (!canFormTags(visit.tags, elements)) {
				errors.push(
					`visit ${visit.id} asks for ${visit.tags.join(' + ')}, which cannot be brewed from three units on the shelf`
				);
			}
			if (!visit.request.trim()) errors.push(`visit ${visit.id} has no request prose`);
			if (!visit.cleanLine.trim()) errors.push(`visit ${visit.id} has no clean-brew line`);
			if (!visit.sideEffectLine.trim()) errors.push(`visit ${visit.id} has no side-effect line`);
			if (!visit.declineLine.trim()) errors.push(`visit ${visit.id} has no decline line`);
		}
	}

	// Chapters and the day manifest
	const chapterNumbers = new Set<number>();
	for (const chapter of chapters) {
		if (chapterNumbers.has(chapter.number)) {
			errors.push(`duplicate chapter number: ${chapter.number}`);
		}
		chapterNumbers.add(chapter.number);
		if (!chapter.title.trim()) errors.push(`chapter ${chapter.number} has no title`);
		if (!Number.isInteger(chapter.rent) || chapter.rent <= 0) {
			errors.push(`chapter ${chapter.number} has no positive rent`);
		}

		const firstDay = (chapter.number - 1) * 7 + 1;
		for (let day = firstDay; day < firstDay + 7; day++) {
			const beat = chapter.beats[day];
			if (typeof beat !== 'string' || !beat.trim()) {
				errors.push(`chapter ${chapter.number} has no story beat for day ${day}`);
			}
		}

		for (const recurring of chapter.recurring) {
			if (!characterIds.has(recurring.characterId)) {
				errors.push(
					`chapter ${chapter.number} schedules an unknown character: ${recurring.characterId}`
				);
			}
			for (const day of recurring.days) {
				if (day < firstDay || day >= firstDay + 7) {
					errors.push(
						`chapter ${chapter.number} schedules ${recurring.characterId} outside its week: ${day}`
					);
				}
			}
		}
	}

	if (options.full) {
		if (elements.length !== 30) errors.push(`expected 30 elements, found ${elements.length}`);
		if (potions.length !== 24) errors.push(`expected 24 named potions, found ${potions.length}`);
		if (characters.length !== 30) errors.push(`expected 30 characters, found ${characters.length}`);
		if (visitCount !== 63) errors.push(`expected 63 visits, found ${visitCount}`);
		if (chapters.length !== 3) errors.push(`expected 3 chapters, found ${chapters.length}`);
		if (visitCount !== TOTAL_DAYS * VISITS_PER_DAY) {
			errors.push(`the manifest expects ${TOTAL_DAYS * VISITS_PER_DAY} visit slots`);
		}
		for (const chapter of chapters) {
			const inChapter = characters.reduce(
				(total, character) =>
					total + character.visits.filter((visit) => visit.chapter === chapter.number).length,
				0
			);
			if (inChapter !== 7 * VISITS_PER_DAY) {
				errors.push(
					`chapter ${chapter.number} needs ${7 * VISITS_PER_DAY} visits, found ${inChapter}`
				);
			}
		}

		const rentDays = chapters.map((chapter) => ({
			day: chapter.number * 7,
			rent: chapter.rent
		}));
		const expectedRents: Record<number, number> = { 7: 40, 14: 80, 21: 120 };
		for (const { day, rent } of rentDays) {
			if (expectedRents[day] !== rent) {
				errors.push(`rent day ${day} should be ${expectedRents[day]}, found ${rent}`);
			}
		}

		const arcs = new Set(
			chapters.flatMap((chapter) => chapter.recurring.map((r) => r.characterId))
		);
		if (arcs.size !== 3) errors.push(`expected 3 recurring arcs, found ${arcs.size}`);
	}

	// Upgrades and endings are optional during the content-only slice.
	const upgradeIds = new Set<string>();
	for (const upgrade of upgrades) {
		if (upgradeIds.has(upgrade.id)) errors.push(`duplicate upgrade id: ${upgrade.id}`);
		upgradeIds.add(upgrade.id);
		if (!upgrade.name.trim()) errors.push(`upgrade ${upgrade.id} has no name`);
		if (!Number.isInteger(upgrade.cost) || upgrade.cost <= 0) {
			errors.push(`upgrade ${upgrade.id} has no positive cost`);
		}
		if (!upgrade.effect.trim()) errors.push(`upgrade ${upgrade.id} has no effect`);
	}
	if (options.full && upgrades.length !== 12) {
		errors.push(`expected 12 upgrades, found ${upgrades.length}`);
	}
	for (const ending of endings) {
		if (!ending.title.trim()) errors.push(`ending ${ending.id} has no title`);
		if (!ending.epilogue.trim()) errors.push(`ending ${ending.id} has no epilogue`);
	}

	return { ok: errors.length === 0, errors };
}

/** Convenience for tests and tools that want the launch-content contract. */
export function validateFullContent(content: ContentBundle): ValidationResult {
	return validateContent(content, { full: true });
}
