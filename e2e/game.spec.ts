import { expect, test } from '@playwright/test';
import { SAVE_KEY, seedSave } from './fixtures';

test('serves the seeded first customer in under a minute', async ({ page }) => {
	const started = Date.now();
	await seedSave(page);
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

	await page.getByRole('button', { name: /hydrogen/i }).click();
	await page.getByRole('button', { name: /sodium/i }).click();
	await page.getByRole('button', { name: /copper/i }).click();
	await page.getByRole('button', { name: /^brew$/i }).click();

	await expect(page.getByRole('status')).toContainText(/it does not burn/i);
	expect(Date.now() - started).toBeLessThan(60_000);
});

test('a reload mid-day restores the same customer, stock, phase, and RNG', async ({ page }) => {
	await seedSave(page, {
		day: 3,
		servedToday: 2,
		servedVisitIds: ['widow-lamp', 'apprentice-lamp'],
		rngState: 12_345,
		activeVisitId: 'merchant-salt'
	});
	await page.goto('/');

	// A real change after load: the mismatched brew spends three units and is
	// persisted. The reload must read that save, not the fixture again.
	await page.getByRole('button', { name: /hydrogen/i }).click();
	await page.getByRole('button', { name: /sodium/i }).click();
	await page.getByRole('button', { name: /copper/i }).click();
	await page.getByRole('button', { name: /^brew$/i }).click();
	await expect(page.getByTestId('result')).toContainText(/road salt/i);

	const before = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
		SAVE_KEY
	);
	expect(before.day).toBe(3);
	expect(before.activeVisitId).toBe('merchant-salt');
	expect(before.rngState).toBe(12_345);
	expect(before.stock).toHaveLength(6);

	await page.reload();

	const after = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
		SAVE_KEY
	);
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByRole('heading', { level: 2, name: /the salt merchant/i })).toBeVisible();
	await expect(page.getByTestId('visitor-count')).toContainText('3 of 3');
	await expect(page.getByTestId('result')).toContainText(/road salt/i);

	expect(after.day).toBe(3);
	expect(after.activeVisitId).toBe('merchant-salt');
	expect(after.rngState).toBe(12_345);
	expect(after.stock).toEqual(before.stock);
	expect(after.stock.find((entry: { elementId: string }) => entry.elementId === 'H').units).toBe(2);
	expect(after.lastResult).toEqual(before.lastResult);
});

test('a chapter shortfall is a setback that continues the shop', async ({ page }) => {
	await seedSave(page, {
		day: 7,
		chapter: 1,
		phase: 'chapterEnd',
		coins: 0,
		reputation: 5,
		upgrades: ['shelf'],
		shelfCapacity: 40
	});
	await page.goto('/');

	await page.getByRole('button', { name: /pay rent/i }).click();
	await expect(page.getByRole('heading', { name: /setback, not an ending/i })).toBeVisible();
	await page.getByRole('button', { name: /continue/i }).click();

	await expect(page.getByTestId('rent-scene')).toHaveCount(0);
	await expect(page.getByTestId('customer-request')).toBeVisible();
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
		await seedSave(page, {
			day: 21,
			chapter: 3,
			phase: 'ending',
			...ending.overrides
		});
		await page.goto('/');

		await expect(page.getByTestId('ending-page')).toBeVisible();
		await expect(page.getByRole('heading', { name: ending.name })).toBeVisible();
		await expect(page.getByTestId('ending-relationship')).toHaveCount(3);
	});
}
