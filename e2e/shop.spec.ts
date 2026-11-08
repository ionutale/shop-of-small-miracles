import { expect, test } from '@playwright/test';

const SAVE_KEY = 'small-miracles:save:v1';

test('serves the first customer by tap in under a minute and restores the shop after reload', async ({
	page
}) => {
	const started = Date.now();

	await page.goto('/');

	await expect(page.getByRole('heading', { name: /a shop of small miracles/i })).toBeVisible();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByTestId('day-beat')).toContainText(/letter arrives under the door/i);
	await expect(page.getByTestId('visitor-count')).toContainText('1 of 3');
	await expect(page.getByRole('heading', { name: 'The Widow', exact: true })).toBeVisible();
	await expect(page.getByTestId('tag-chip')).toHaveCount(2);
	await expect(page.getByText(/3 left/).first()).toBeVisible();

	await page.reload();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByTestId('visitor-count')).toContainText('1 of 3');
	await expect(page.getByRole('heading', { name: 'The Widow', exact: true })).toBeVisible();
	await expect(page.getByText(/3 left/).first()).toBeVisible();

	await page.getByRole('button', { name: /hydrogen/i }).click();
	await page.getByRole('button', { name: /sodium/i }).click();
	await page.getByRole('button', { name: /copper/i }).click();

	await expect(page.getByText(/potent: warm/i)).toBeVisible();
	await page.getByRole('button', { name: /^brew$/i }).click();

	await expect(page.getByRole('status')).toContainText(/it does not burn/i);
	await expect(page.getByText(/payment: 24 coins/i)).toBeVisible();
	await expect(page.getByText(/6 \/ 10/)).toBeVisible();
	await expect(page.getByText(/widow's lamp/i)).toBeVisible();

	await page.reload();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByRole('status')).toContainText(/it does not burn/i);
	await expect(page.getByText(/64 coins/)).toBeVisible();
	await expect(page.getByText(/6 \/ 10/)).toBeVisible();

	await page.getByRole('button', { name: /next visitor/i }).click();
	await expect(page.getByTestId('visitor-count')).toContainText('2 of 3');
	await expect(page.locator('.customer h2')).toBeVisible();
	await expect(page.getByRole('status')).toHaveCount(0);
	await expect(page.getByText(/2 left/).first()).toBeVisible();

	await page.reload();
	await expect(page.getByTestId('visitor-count')).toContainText('2 of 3');
	await expect(page.locator('.customer h2')).toBeVisible();

	expect(Date.now() - started).toBeLessThan(60_000);
});

test('a mismatched brew spends the ingredients and leaves reputation alone', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('button', { name: /hydrogen/i }).click();
	await page.getByRole('button', { name: /oxygen/i }).click();
	await page.getByRole('button', { name: /silver/i }).click();
	await page.getByRole('button', { name: /^brew$/i }).click();

	await expect(page.getByRole('status')).toContainText(/that is not light/i);
	await expect(page.getByText(/the ingredients were spent/i)).toBeVisible();
	await expect(page.getByText(/5 \/ 10/)).toBeVisible();
	await expect(page.getByRole('button', { name: /next visitor/i })).toBeVisible();

	await page.reload();
	await expect(page.getByRole('status')).toContainText(/that is not light/i);
	await expect(page.getByText(/5 \/ 10/)).toBeVisible();
});

test('politely declining costs nothing', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('button', { name: /politely decline/i }).click();

	await expect(page.getByRole('status')).toContainText(/thank you for trying/i);
	await expect(page.getByText(/nothing was consumed/i)).toBeVisible();

	await page.getByRole('button', { name: /next visitor/i }).click();
	await expect(page.getByTestId('visitor-count')).toContainText('2 of 3');
	await expect(page.getByText(/3 left/).first()).toBeVisible();
	await expect(page.getByText(/40 coins/)).toBeVisible();
});

test('serves exactly three visitors, reaches the evening, and opens the next day', async ({
	page
}) => {
	await page.goto('/');

	for (let served = 1; served <= 3; served++) {
		await expect(page.getByTestId('visitor-count')).toContainText(`${served} of 3`);
		await page.getByRole('button', { name: /politely decline/i }).click();
		await page.getByRole('button', { name: served === 3 ? /^evening$/i : /next visitor/i }).click();
	}

	await expect(page.getByTestId('evening')).toBeVisible();
	await expect(page.getByRole('heading', { name: /^evening$/i })).toBeVisible();
	await expect(page.getByTestId('evening')).toContainText(/3 visitors came/i);

	await page.reload();
	await expect(page.getByTestId('evening')).toBeVisible();

	await page.getByRole('button', { name: /close up the shop/i }).click();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByTestId('visitor-count')).toContainText('1 of 3');
	await expect(page.getByTestId('day-beat')).toContainText(/swept your step/i);

	await page.reload();
	await expect(page.getByTestId('visitor-count')).toContainText('1 of 3');
	await expect(page.getByTestId('day-beat')).toContainText(/swept your step/i);
});

test('an empty shelf becomes a quiet day with no penalty and still reaches evening', async ({
	page
}) => {
	await page.addInitScript(
		([key, save]) => localStorage.setItem(key, save),
		[
			SAVE_KEY,
			JSON.stringify({
				version: 1,
				seed: 42,
				rngState: 7,
				day: 1,
				chapter: 1,
				phase: 'service',
				coins: 40,
				reputation: 5,
				setbacks: 0,
				stock: [],
				discovered: [],
				flags: [],
				relationships: { widow: 0, merchant: 0, apprentice: 0 },
				servedToday: 0,
				servedVisitIds: [],
				activeVisitId: null,
				quietDay: true,
				market: [],
				upgrades: [],
				settings: { sound: true, reduceMotion: false },
				introSeen: true,
				lastResult: null
			})
		]
	);

	await page.goto('/');
	await expect(page.getByText(/the shop is quiet/i)).toBeVisible();
	await expect(page.getByText(/5 \/ 10/)).toBeVisible();
	await expect(page.getByRole('button', { name: /^evening$/i })).toBeVisible();

	await page.getByRole('button', { name: /^evening$/i }).click();
	await expect(page.getByTestId('evening')).toContainText(/quiet day/i);

	await page.getByRole('button', { name: /close up the shop/i }).click();
	await expect(page.getByTestId('day-beat')).toContainText(/swept your step/i);
	await expect(page.getByText(/the shop is quiet/i)).toBeVisible();
	await expect(page.getByText(/5 \/ 10/)).toBeVisible();
});
