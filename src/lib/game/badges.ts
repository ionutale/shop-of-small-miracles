import { BADGES } from '../data/badges';
import type { BadgeId } from '../data/badges';
import type { ArcId, SaveState } from '../types';

const ARCS: readonly ArcId[] = ['widow', 'merchant', 'apprentice'];

function relationship(save: SaveState, arc: ArcId): number {
	return save.relationships[arc] ?? 0;
}

function hasEnding(save: SaveState, id: SaveState['records']['endings'][number]): boolean {
	return save.records.endings.includes(id);
}

/**
 * Every badge condition reads only the save: no timers, randomness, or network.
 * Badges are never revoked, so a lapsed relationship does not unelect an honor.
 */
const CONDITIONS: Record<BadgeId, (save: SaveState) => boolean> = {
	'first-light': (save) => save.records.cleanBrews >= 1,
	'open-for-business': (save) => save.records.served >= 50,
	'long-bench': (save) => save.records.cleanBrews >= 10,
	'paper-trail': (save) => save.records.namedSeen.length >= 5,
	'whole-book': (save) => save.records.namedSeen.length >= 24,
	'widows-friend': (save) => relationship(save, 'widow') >= 8,
	'salt-and-company': (save) => relationship(save, 'merchant') >= 8,
	'apprentices-trust': (save) => relationship(save, 'apprentice') >= 8,
	'three-chairs': (save) => ARCS.every((arc) => relationship(save, arc) >= 6),
	'shop-endures': (save) => hasEnding(save, 'shop-endures'),
	'last-miracle': (save) => hasEnding(save, 'last-miracle'),
	'quiet-closing': (save) => hasEnding(save, 'quiet-closing'),
	'chair-keeper': (save) => save.flags.includes('keptTheChair') && save.records.endings.length > 0
};

/** Every badge whose condition currently holds, in definition order. */
export function earnedBadgeIds(save: SaveState): BadgeId[] {
	return BADGES.filter((badge) => CONDITIONS[badge.id](save)).map((badge) => badge.id);
}

/**
 * Appends newly earned badges with the current day. Returns the same object
 * when there is nothing new, so the store subscription can skip autosave.
 */
export function syncBadges(save: SaveState): SaveState {
	const owned = new Set(save.badges.map((badge) => badge.id));
	const gained = earnedBadgeIds(save).filter((id) => !owned.has(id));
	if (gained.length === 0) return save;

	return {
		...save,
		badges: [...save.badges, ...gained.map((id) => ({ id, day: save.day }))]
	};
}
