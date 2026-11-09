import { ELEMENTS } from '../data/elements';
import { rentDueOn } from '../data/chapters';
import { ownedUpgrades, upgradeById, ownsUpgrade } from '../data/upgrades';
import type { MarketOffer, SaveState, StockEntry } from '../types';
import { pickIndex } from './rng';

export const BASE_SHELF_CAPACITY = 30;
export const MARKET_OFFERS = 8;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function shelfUnits(stock: readonly StockEntry[]): number {
	return stock.reduce((total, entry) => total + entry.units, 0);
}

export interface GeneratedMarket {
	offers: MarketOffer[];
	rngState: number;
}

/**
 * Eight unique elements from a slowly rotating pool. The state is derived from
 * the save seed and day by the caller, so the same day always opens the same
 * stalls and a reload never rerolls a market the player has already seen.
 */
export function generateMarket(
	rngState: number,
	chapter: 1 | 2 | 3,
	day: number,
	upgrades: readonly string[] = []
): GeneratedMarket {
	const count = MARKET_OFFERS + (ownsUpgrade(upgrades, 'stillroom') ? 1 : 0);
	const offset = ((chapter - 1) * 10 + (day - 1)) % ELEMENTS.length;
	const pool = [...ELEMENTS.slice(offset), ...ELEMENTS.slice(0, offset)];
	const offers: MarketOffer[] = [];
	let state = rngState;

	for (let index = 0; index < count && pool.length > 0; index++) {
		const picked = pickIndex(state, pool.length);
		state = picked.state;
		const [element] = pool.splice(picked.index, 1);

		const supply = pickIndex(state, 3);
		state = supply.state;

		const priceShift = pickIndex(state, 3);
		state = priceShift.state;

		offers.push({
			elementId: element.id,
			units: supply.index + 1,
			price: clamp(element.price + priceShift.index - 1, 2, 6)
		});
	}

	return { offers, rngState: state };
}

/** The market ledger rounds the discount down, so every coin is visible. */
export function offerPrice(offer: MarketOffer, upgrades: readonly string[]): number {
	return ownsUpgrade(upgrades, 'market-ledger')
		? Math.max(1, Math.floor(offer.price * 0.9))
		: offer.price;
}

function addUnits(stock: readonly StockEntry[], elementId: string, units: number): StockEntry[] {
	const existing = stock.find((entry) => entry.elementId === elementId);
	if (!existing) return [...stock.map((entry) => ({ ...entry })), { elementId, units }];
	return stock.map((entry) =>
		entry.elementId === elementId ? { ...entry, units: entry.units + units } : { ...entry }
	);
}

/**
 * Buys one day's unit of an offer. Capacity is a hard ceiling: a bonus unit
 * from the glass jars fills the last space but never spills over the shelf.
 */
export function buyStock(save: SaveState, offerIndex: number): SaveState {
	if (save.phase !== 'market') return save;

	const offer = save.market[offerIndex];
	if (!offer || offer.units <= 0) return save;

	const price = offerPrice(offer, save.upgrades);
	if (save.coins < price) return save;

	const room = save.shelfCapacity - shelfUnits(save.stock);
	if (room <= 0) return save;

	const bonus = ownsUpgrade(save.upgrades, 'glass-jars') ? 2 : 0;
	const added = Math.min(1 + bonus, room);

	return {
		...save,
		coins: save.coins - price,
		stock: addUnits(save.stock, offer.elementId, added),
		market: save.market.map((entry, index) =>
			index === offerIndex ? { ...entry, units: entry.units - 1 } : entry
		)
	};
}

/**
 * At most one upgrade per evening. The purchase is rejected loudly in the pure
 * engine; the store swallows the rejection so a stale tap cannot break the shop.
 */
export function buyUpgrade(save: SaveState, upgradeId: string): SaveState {
	if (save.phase !== 'market') {
		throw new Error('Upgrades are sold only in the evening market.');
	}

	const upgrade = upgradeById(upgradeId);
	if (!upgrade) throw new Error(`Unknown upgrade: ${upgradeId}`);
	if (save.upgrades.includes(upgradeId)) {
		throw new Error(`The shop already owns ${upgrade.name}.`);
	}
	if (save.upgradeBoughtToday) {
		throw new Error('Only one upgrade may be bought per evening.');
	}
	if (save.coins < upgrade.cost) {
		throw new Error(`The shop cannot afford ${upgrade.name}.`);
	}

	let next: SaveState = {
		...save,
		coins: save.coins - upgrade.cost,
		upgrades: [...save.upgrades, upgrade.id],
		upgradeBoughtToday: true
	};

	if (upgrade.id === 'shelf') {
		next = { ...next, shelfCapacity: next.shelfCapacity + 10 };
	}
	if (upgrade.id === 'reputation') {
		next = { ...next, reputation: clamp(next.reputation + 1, 0, 10) };
	}
	if (upgrade.id === 'empty-chair' && !next.flags.includes('keptTheChair')) {
		next = { ...next, flags: [...next.flags, 'keptTheChair'] };
	}

	return next;
}

/**
 * Soft stakes in practice: the landlord takes the most expensive upgrade, or
 * one shelf unit if there is nothing left to take. The shop always continues.
 */
export function applyRentShortfall(save: SaveState): SaveState {
	const owned = ownedUpgrades(save.upgrades)
		.filter((upgrade) => upgrade.id !== 'empty-chair')
		.sort((a, b) => b.cost - a.cost);
	let upgrades = [...save.upgrades];
	let shelfCapacity = save.shelfCapacity;
	let taken: string;

	const removed = owned[0];
	if (removed) {
		upgrades = upgrades.filter((id) => id !== removed.id);
		if (removed.id === 'shelf') shelfCapacity = Math.max(1, shelfCapacity - 10);
		taken = `the ${removed.name}`;
	} else if (shelfCapacity > 1) {
		const before = shelfCapacity;
		shelfCapacity -= 1;
		taken = `one shelf unit (capacity ${before} → ${shelfCapacity})`;
	} else {
		taken = 'nothing, because the shelves were already bare';
	}

	const flags = save.flags.includes('rentMissed') ? save.flags : [...save.flags, 'rentMissed'];

	return {
		...save,
		coins: 10,
		reputation: clamp(save.reputation - 2, 0, 10),
		setbacks: save.setbacks + 1,
		upgrades,
		shelfCapacity,
		flags,
		rentOutcome: {
			kind: 'shortfall',
			rent: rentDueOn(save.day) ?? 0,
			coinsAfter: 10,
			taken,
			message: `The landlord takes ${taken}. Reputation falls by 2, and you are left with 10 coins. The shop stays open.`
		}
	};
}
