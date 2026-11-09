import { describe, expect, it } from 'vitest';
import { UPGRADES } from '../data/upgrades';
import { saveFixture } from '../test/fixtures';
import {
	applyRentShortfall,
	buyStock,
	buyUpgrade,
	generateMarket,
	offerPrice,
	shelfUnits
} from './economy';

const marketOf = (save = saveFixture({ phase: 'market', coins: 200, market: [], stock: [] })) => {
	const generated = generateMarket(save.rngState, save.chapter, save.day);
	return { ...save, market: generated.offers };
};

describe('the evening market', () => {
	it('offers eight unique elements with daily supplies and prices', () => {
		const generated = generateMarket(7, 1, 1);
		expect(generated.offers).toHaveLength(8);
		expect(new Set(generated.offers.map((offer) => offer.elementId)).size).toBe(8);
		for (const offer of generated.offers) {
			expect(Number.isInteger(offer.units)).toBe(true);
			expect(offer.units).toBeGreaterThanOrEqual(1);
			expect(offer.units).toBeLessThanOrEqual(3);
			expect(offer.price).toBeGreaterThanOrEqual(2);
			expect(offer.price).toBeLessThanOrEqual(6);
		}
	});

	it('reproduces the same offers for the same seed, chapter, and day', () => {
		expect(generateMarket(7, 1, 3)).toEqual(generateMarket(7, 1, 3));
		expect(generateMarket(7, 1, 3).offers).not.toEqual(generateMarket(7, 1, 4).offers);
	});

	it('adds one extra offer when the stillroom is owned', () => {
		expect(generateMarket(7, 1, 1, ['stillroom']).offers).toHaveLength(9);
	});

	it('shows a lower price when the market ledger is owned', () => {
		expect(offerPrice({ elementId: 'H', units: 1, price: 4 }, [])).toBe(4);
		expect(offerPrice({ elementId: 'H', units: 1, price: 4 }, ['market-ledger'])).toBe(3);
	});
});

describe('buying stock', () => {
	it('deducts coins, adds units, and consumes one unit of daily supply', () => {
		const save = marketOf();
		const offer = save.market[0];
		const bought = buyStock(save, 0);

		expect(bought.coins).toBe(save.coins - offer.price);
		expect(bought.market[0].units).toBe(offer.units - 1);
		expect(bought.stock.find((entry) => entry.elementId === offer.elementId)?.units).toBe(1);
	});

	it('refuses a purchase that costs more than the purse', () => {
		const save = marketOf(saveFixture({ phase: 'market', coins: 0, market: [] }));
		expect(buyStock(save, 0)).toEqual(save);
	});

	it('refuses a purchase that would overflow the shelf', () => {
		const save = marketOf(
			saveFixture({
				phase: 'market',
				coins: 200,
				market: [],
				shelfCapacity: 30,
				stock: [{ elementId: 'H', units: 30 }]
			})
		);
		expect(buyStock(save, 0)).toEqual(save);
		expect(shelfUnits(save.stock)).toBe(30);
	});

	it('refuses a sold-out offer and leaves the market intact', () => {
		const save = marketOf();
		const soldOut = {
			...save,
			market: save.market.map((offer, index) => (index === 0 ? { ...offer, units: 0 } : offer))
		};
		expect(buyStock(soldOut, 0)).toEqual(soldOut);
	});

	it('adds two bonus units with glass jars', () => {
		const save = marketOf(
			saveFixture({
				phase: 'market',
				coins: 200,
				market: [],
				stock: [],
				upgrades: ['glass-jars']
			})
		);
		const offer = save.market[0];
		const bought = buyStock(save, 0);

		expect(bought.stock.find((entry) => entry.elementId === offer.elementId)?.units).toBe(3);
		expect(bought.market[0].units).toBe(offer.units - 1);
	});

	it('charges the discounted price when the market ledger is owned', () => {
		const save = marketOf(
			saveFixture({ phase: 'market', coins: 200, market: [], upgrades: ['market-ledger'] })
		);
		const price = offerPrice(save.market[0], ['market-ledger']);
		const bought = buyStock(save, 0);
		expect(bought.coins).toBe(save.coins - price);
	});
});

describe('buying upgrades', () => {
	it('ships twelve upgrades with positive costs and effects', () => {
		expect(UPGRADES).toHaveLength(12);
		for (const upgrade of UPGRADES) {
			expect(upgrade.cost).toBeGreaterThan(0);
			expect(upgrade.effect.length).toBeGreaterThan(0);
		}
	});

	it('buys one upgrade, charges its cost, and applies the shelf immediately', () => {
		const shelf = UPGRADES.find((upgrade) => upgrade.id === 'shelf')!;
		const bought = buyUpgrade(saveFixture({ phase: 'market', coins: 200 }), 'shelf');

		expect(bought.upgrades).toContain('shelf');
		expect(bought.coins).toBe(200 - shelf.cost);
		expect(bought.shelfCapacity).toBe(40);
		expect(bought.upgradeBoughtToday).toBe(true);
	});

	it('allows only one upgrade per evening', () => {
		const bought = buyUpgrade(saveFixture({ phase: 'market', coins: 200 }), 'shelf');
		expect(() => buyUpgrade(bought, 'market-ledger')).toThrow(/one upgrade/i);
	});

	it('refuses an upgrade that is already owned or unaffordable', () => {
		const owned = saveFixture({ phase: 'market', coins: 200, upgrades: ['shelf'] });
		expect(() => buyUpgrade(owned, 'shelf')).toThrow(/already own/i);
		expect(() => buyUpgrade(saveFixture({ phase: 'market', coins: 1 }), 'shelf')).toThrow(
			/afford/i
		);
	});

	it('applies the reputation upgrade and opens the empty chair immediately', () => {
		const reputation = buyUpgrade(
			saveFixture({ phase: 'market', coins: 200, reputation: 5 }),
			'reputation'
		);
		expect(reputation.reputation).toBe(6);

		const chair = buyUpgrade(saveFixture({ phase: 'market', coins: 200 }), 'empty-chair');
		expect(chair.flags).toContain('keptTheChair');
	});

	it('does not sell upgrades outside the evening market', () => {
		expect(() => buyUpgrade(saveFixture({ phase: 'service', coins: 200 }), 'shelf')).toThrow(
			/evening/i
		);
	});
});

describe('rent shortfalls', () => {
	it('takes the most expensive upgrade, lowers reputation, and keeps the shop alive', () => {
		const save = saveFixture({
			day: 7,
			chapter: 1,
			phase: 'chapterEnd',
			coins: 0,
			reputation: 6,
			upgrades: ['market-ledger', 'shelf'],
			shelfCapacity: 40
		});
		const after = applyRentShortfall(save);

		expect(after.upgrades).toEqual(['market-ledger']);
		expect(after.shelfCapacity).toBe(30);
		expect(after.coins).toBe(10);
		expect(after.reputation).toBe(4);
		expect(after.setbacks).toBe(1);
		expect(after.flags).toContain('rentMissed');
		expect(after.rentOutcome?.kind).toBe('shortfall');
		expect(after.rentOutcome?.taken).toMatch(/shelf/i);
		expect(after.phase).not.toBe('ending');
	});

	it('never confiscates the empty chair, even when it is the most expensive', () => {
		const after = applyRentShortfall(
			saveFixture({
				day: 7,
				chapter: 1,
				phase: 'chapterEnd',
				coins: 0,
				reputation: 5,
				upgrades: ['empty-chair', 'shelf'],
				shelfCapacity: 40
			})
		);

		expect(after.upgrades).toEqual(['empty-chair']);
		expect(after.shelfCapacity).toBe(30);
	});

	it('takes a shelf unit when there is no upgrade and clamps reputation at zero', () => {
		const after = applyRentShortfall(
			saveFixture({
				day: 7,
				chapter: 1,
				phase: 'chapterEnd',
				coins: 0,
				reputation: 1,
				shelfCapacity: 30
			})
		);

		expect(after.shelfCapacity).toBe(29);
		expect(after.reputation).toBe(0);
		expect(after.rentOutcome?.taken).toMatch(/shelf unit/i);
		expect(after.rentOutcome?.message).toMatch(/shop stays open/i);
	});
});
