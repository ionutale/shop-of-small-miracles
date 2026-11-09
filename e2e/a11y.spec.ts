import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 360, height: 740 } });

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

async function tabTo(page: Page, pattern: RegExp): Promise<void> {
	for (let step = 0; step < 90; step += 1) {
		await page.keyboard.press('Tab');
		const label = await page.evaluate(() => {
			const element = document.activeElement as HTMLElement | null;
			return element ? (element.getAttribute('aria-label') ?? element.textContent ?? '') : '';
		});
		if (pattern.test(label)) return;
	}
	throw new Error(`Could not reach ${pattern} by tabbing`);
}

async function smallTargets(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const report: string[] = [];
		const targets = document.querySelectorAll('button:not([disabled]), a[href]');
		for (const element of targets) {
			const rect = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			if (
				rect.width > 0 &&
				rect.height > 0 &&
				style.visibility !== 'hidden' &&
				(rect.width < 44 || rect.height < 44)
			) {
				report.push(
					`${element.textContent?.trim().slice(0, 24) ?? 'unnamed'} (${rect.width}×${rect.height})`
				);
			}
		}
		for (const input of document.querySelectorAll('input[type="checkbox"]')) {
			const label = input.closest('label');
			const rect = label?.getBoundingClientRect();
			if (rect && rect.height > 0 && rect.height < 44) report.push(`checkbox label ${rect.height}`);
		}
		return report;
	});
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
		expect(
			results.incomplete
				.filter((incomplete) => incomplete.id === 'aria-prohibited-attr')
				.map((incomplete) => incomplete.id)
		).toEqual([]);
	});
}

test('the reset dialog has no axe violations', async ({ page }) => {
	await open(page, {}, /^settings$/i);

	await page.getByRole('button', { name: /reset all progress/i }).click();
	await expect(page.getByRole('dialog')).toBeVisible();

	const results = await new AxeBuilder({ page }).analyze();

	expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

test('serves a customer by tabbing and pressing Enter', async ({ page }) => {
	await open(page);

	await tabTo(page, /hydrogen/i);
	await page.keyboard.press('Enter');
	await tabTo(page, /sodium/i);
	await page.keyboard.press('Enter');
	await tabTo(page, /copper/i);
	await page.keyboard.press('Enter');

	await tabTo(page, /^brew$/i);
	await page.keyboard.press('Enter');

	await expect(page.getByRole('status')).toContainText(/it does not burn/i);

	await tabTo(page, /^book$/i);
	await page.keyboard.press('Enter');
	await expect(page.getByRole('heading', { name: /the recipe book/i })).toBeVisible();
});

test('buys market stock with the keyboard', async ({ page }) => {
	await open(page, {
		day: 3,
		phase: 'market',
		coins: 20,
		market: [{ elementId: 'H', units: 2, price: 3 }]
	});

	await tabTo(page, /buy hydrogen for 3 coins/i);
	await page.keyboard.press('Enter');

	await expect(page.getByRole('group', { name: /shop status/i })).toContainText('17');
});

test('reaches the ending with the keyboard and reads it', async ({ page }) => {
	await open(page, {
		day: 21,
		chapter: 3,
		phase: 'ending',
		flags: ['keptTheChair', 'ledgerClosed']
	});

	await expect(page.getByRole('heading', { name: /the shop endures/i })).toBeFocused();

	await tabTo(page, /new game/i);
	await page.keyboard.press('Enter');

	await expect(page.getByRole('heading', { name: /a shop of small miracles/i })).toBeVisible();
	await expect(page.locator('.stat', { hasText: 'Day' })).toContainText('1');
});

test('continuing the final rent lands focus on the ending', async ({ page }) => {
	await open(page, {
		day: 21,
		chapter: 3,
		phase: 'chapterEnd',
		coins: 200,
		flags: []
	});

	await page.getByRole('button', { name: /pay rent/i }).click();
	await page.getByRole('button', { name: /continue/i }).click();

	await expect(page.getByRole('heading', { name: /the shop endures/i })).toBeFocused();
});

test('every visible target is at least 44px on the browsing screens', async ({ page }) => {
	await open(page);
	expect(await smallTargets(page)).toEqual([]);

	for (const tab of [/^book$/i, /^journal$/i, /^settings$/i]) {
		await page.getByRole('button', { name: tab }).click();
		expect(await smallTargets(page)).toEqual([]);
	}

	await page.getByRole('button', { name: /reset all progress/i }).click();
	expect(await smallTargets(page)).toEqual([]);
	await page.keyboard.press('Escape');
});

test('market, rent, and ending targets are at least 44px', async ({ page }) => {
	await open(page, {
		day: 3,
		phase: 'market',
		market: [{ elementId: 'H', units: 2, price: 3 }]
	});
	expect(await smallTargets(page)).toEqual([]);

	await open(page, { day: 7, chapter: 1, phase: 'chapterEnd', coins: 100 });
	expect(await smallTargets(page)).toEqual([]);
	await page.getByRole('button', { name: /pay rent/i }).click();
	expect(await smallTargets(page)).toEqual([]);

	await open(page, { day: 21, chapter: 3, phase: 'ending' });
	expect(await smallTargets(page)).toEqual([]);
});
