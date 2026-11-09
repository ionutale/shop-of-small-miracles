import { expect, test } from '@playwright/test';

const SAVE_KEY = 'small-miracles:save:v1';

function seededSave(overrides: Record<string, unknown> = {}) {
	return {
		version: 1,
		seed: 42,
		rngState: 7,
		day: 1,
		chapter: 1,
		phase: 'service',
		coins: 40,
		reputation: 5,
		setbacks: 0,
		stock: [
			{ elementId: 'H', units: 3 },
			{ elementId: 'O', units: 3 },
			{ elementId: 'Na', units: 3 },
			{ elementId: 'Cu', units: 3 },
			{ elementId: 'Ag', units: 3 },
			{ elementId: 'Cl', units: 3 }
		],
		discovered: [],
		flags: [],
		relationships: { widow: 0, merchant: 0, apprentice: 0 },
		servedToday: 0,
		servedVisitIds: [],
		activeVisitId: 'widow-lamp',
		quietDay: false,
		market: [],
		upgrades: [],
		shelfCapacity: 30,
		upgradeBoughtToday: false,
		swappedToday: false,
		apprenticeUsedToday: false,
		warmStoveUsedToday: false,
		rentOutcome: null,
		settings: { sound: false, reduceMotion: true },
		introSeen: true,
		lastResult: null,
		morningSeenDay: 21,
		choices: [],
		...overrides
	};
}

async function seed(page: import('@playwright/test').Page, overrides: Record<string, unknown>) {
	await page.addInitScript(
		([key, save]) => localStorage.setItem(key, save),
		[SAVE_KEY, JSON.stringify(seededSave(overrides))]
	);
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test('serves the first guided customer in under a minute', async ({ page }) => {
	const started = Date.now();
	await seed(page, {});

	await page.getByRole('button', { name: /hydrogen/i }).click();
	await page.getByRole('button', { name: /sodium/i }).click();
	await page.getByRole('button', { name: /copper/i }).click();
	await page.getByRole('button', { name: /^brew$/i }).click();

	await expect(page.getByRole('status')).toContainText(/it does not burn/i);
	expect(Date.now() - started).toBeLessThan(60_000);
});

test('a reload mid-day restores the same customer, stock, phase, and RNG', async ({ page }) => {
	await seed(page, {
		day: 3,
		servedToday: 2,
		servedVisitIds: ['widow-lamp', 'salt-merchant'],
		rngState: 12_345,
		activeVisitId: 'widow-letters'
	});

	const before = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
		SAVE_KEY
	);
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByRole('heading', { level: 2, name: /the widow/i })).toBeVisible();

	await page.reload();

	const after = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
		SAVE_KEY
	);
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByRole('heading', { level: 2, name: /the widow/i })).toBeVisible();
	await expect(page.getByTestId('visitor-count')).toContainText('3 of 3');
	expect(after.activeVisitId).toBe(before.activeVisitId);
	expect(after.stock).toEqual(before.stock);
	expect(after.rngState).toBe(before.rngState);
});

test('a chapter shortfall is a setback, not a game over', async ({ page }) => {
	await seed(page, {
		day: 7,
		chapter: 1,
		phase: 'chapterEnd',
		coins: 0,
		reputation: 5,
		upgrades: ['shelf'],
		shelfCapacity: 40
	});

	await page.getByRole('button', { name: /pay rent/i }).click();
	await expect(page.getByRole('heading', { name: /setback, not an ending/i })).toBeVisible();
	await page.getByRole('button', { name: /continue/i }).click();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByText(/day 8/i).first()).toBeVisible();
});

const endings = [
	{
		name: 'The Shop Endures',
		overrides: { reputation: 5, relationships: { widow: 3, merchant: 3, apprentice: 3 }, flags: [] }
	},
	{
		name: 'The Last Miracle',
		overrides: {
			reputation: 8,
			relationships: { widow: 7, merchant: 7, apprentice: 7 },
			flags: ['keptTheChair']
		}
	},
	{
		name: 'A Quiet Closing',
		overrides: {
			reputation: 4,
			relationships: { widow: 3, merchant: 3, apprentice: 3 },
			flags: ['closedTheShop']
		}
	}
];

for (const ending of endings) {
	test(`reaches ${ending.name} from a seeded save`, async ({ page }) => {
		await seed(page, {
			day: 21,
			chapter: 3,
			phase: 'ending',
			...ending.overrides
		});

		await expect(page.getByTestId('ending-page')).toBeVisible();
		await expect(page.getByRole('heading', { name: ending.name })).toBeVisible();
		await expect(page.getByTestId('ending-relationship')).toHaveCount(3);
	});
}
