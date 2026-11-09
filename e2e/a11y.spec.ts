import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

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

async function open(page: Page, overrides: Record<string, unknown> = {}, tab?: RegExp) {
	await page.addInitScript(
		([key, save]) => localStorage.setItem(key, save),
		[SAVE_KEY, JSON.stringify(seededSave(overrides))]
	);
	await page.goto('/');
	await page.evaluate(() => document.fonts.ready);
	if (tab) await page.getByRole('button', { name: tab }).click();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

const screens: { name: string; overrides: Record<string, unknown>; tab?: RegExp }[] = [
	{ name: 'Shop', overrides: {} },
	{
		name: 'Market',
		overrides: {
			day: 3,
			phase: 'market',
			market: [{ elementId: 'H', units: 2, price: 3 }]
		}
	},
	{
		name: 'Book',
		overrides: {
			discovered: [
				{ tags: ['Still', 'Dreaming'], name: 'Hush', day: 2 },
				{ tags: ['Light', 'Still'], name: 'a light, still draught', day: 3 }
			]
		},
		tab: /^book$/i
	},
	{
		name: 'Journal',
		overrides: { day: 8, chapter: 2, relationships: { widow: 7, merchant: 3, apprentice: 1 } },
		tab: /^journal$/i
	},
	{ name: 'Settings', overrides: {}, tab: /^settings$/i }
];

for (const screen of screens) {
	test(`${screen.name} has no axe violations`, async ({ page }) => {
		await open(page, screen.overrides, screen.tab);

		const results = await new AxeBuilder({ page }).analyze();

		expect(results.violations.map((violation) => violation.id)).toEqual([]);
	});
}

test('serves a customer with the keyboard only', async ({ page }) => {
	await open(page);

	await page.getByRole('button', { name: /hydrogen/i }).focus();
	await page.keyboard.press('Enter');
	await page.getByRole('button', { name: /sodium/i }).focus();
	await page.keyboard.press('Enter');
	await page.getByRole('button', { name: /copper/i }).focus();
	await page.keyboard.press('Enter');

	await page.getByRole('button', { name: /^brew$/i }).focus();
	await page.keyboard.press('Enter');

	await expect(page.getByRole('status')).toContainText(/it does not burn/i);

	await page.getByRole('button', { name: /^book$/i }).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('heading', { name: /the recipe book/i })).toBeVisible();
});

test('reaches the ending with the keyboard and reads it', async ({ page }) => {
	await open(page, {
		day: 21,
		chapter: 3,
		phase: 'ending',
		flags: ['keptTheChair', 'ledgerClosed']
	});

	await expect(page.getByRole('heading', { name: /the shop endures/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /the shop endures/i })).toBeFocused();

	await page.getByRole('button', { name: /new game/i }).focus();
	await page.keyboard.press('Enter');

	await expect(page.getByRole('heading', { name: /a shop of small miracles/i })).toBeVisible();
	await expect(page.locator('.stat', { hasText: 'Day' })).toContainText('1');
});

test('every visible button meets the 44px target', async ({ page }) => {
	await open(page);

	const smallIn = async () =>
		page.evaluate(() =>
			[...document.querySelectorAll('button:not([disabled]), a[href]')]
				.filter((element) => {
					const rect = element.getBoundingClientRect();
					const style = getComputedStyle(element);
					return (
						rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && rect.height < 44
					);
				})
				.map((element) => element.textContent?.trim().slice(0, 30) ?? '')
		);

	expect(await smallIn()).toEqual([]);

	await page.getByRole('button', { name: /^book$/i }).click();
	expect(await smallIn()).toEqual([]);

	await page.getByRole('button', { name: /^journal$/i }).click();
	expect(await smallIn()).toEqual([]);

	await page.getByRole('button', { name: /^settings$/i }).click();
	expect(await smallIn()).toEqual([]);
});
