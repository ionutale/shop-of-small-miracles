import { expect, test } from '@playwright/test';
import { SAVE_KEY, seededSave } from './fixtures';

async function enterShop(page: import('@playwright/test').Page) {
	await expect(async () => {
		const enter = page.getByRole('button', { name: /enter the shop/i });
		if ((await enter.count()) > 0) await enter.click();
		await expect(page.locator('.shop')).toBeVisible({ timeout: 1500 });
	}).toPass({ timeout: 15_000 });
}

async function reachEvening(page: import('@playwright/test').Page) {
	for (let served = 1; served <= 3; served++) {
		await page.getByRole('button', { name: /politely decline/i }).click();
		await page.getByRole('button', { name: served === 3 ? /^evening$/i : /next visitor/i }).click();
	}
	await expect(page.getByTestId('evening')).toBeVisible();
}

test('serves the first customer by tap in under a minute and restores the shop after reload', async ({
	page
}) => {
	const started = Date.now();

	await page.goto('/');
	await enterShop(page);

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
	await expect(page.getByTestId('result').getByText(/payment: 24 coins/i)).toBeVisible();
	await expect(page.getByText(/6 \/ 10/)).toBeVisible();
	await expect(
		page.getByRole('region', { name: /today’s service/i }).getByText(/widow's lamp/i)
	).toBeVisible();

	await page.reload();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByRole('status')).toContainText(/it does not burn/i);
	await expect(page.getByText(/64 coins/)).toBeVisible();
	await expect(page.getByText(/6 \/ 10/)).toBeVisible();

	await page.getByRole('button', { name: /next visitor/i }).click();
	await expect(page.getByTestId('visitor-count')).toContainText('2 of 3');
	await expect(page.locator('.customer h2')).toBeVisible();
	await expect(page.getByTestId('announcer')).toHaveText('');
	await expect(page.getByText(/2 left/).first()).toBeVisible();

	await page.reload();
	await expect(page.getByTestId('visitor-count')).toContainText('2 of 3');
	await expect(page.locator('.customer h2')).toBeVisible();

	expect(Date.now() - started).toBeLessThan(60_000);
});

test('a mismatched brew spends the ingredients and leaves reputation alone', async ({ page }) => {
	await page.goto('/');
	await enterShop(page);

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
	await enterShop(page);

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
	await enterShop(page);

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
	await enterShop(page);
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

test('buys evening stock and keeps the same market after reload', async ({ page }) => {
	await page.goto('/');
	await enterShop(page);
	await reachEvening(page);

	await expect(page.getByTestId('market-offer')).toHaveCount(8);
	await expect(page.getByTestId('shelf-capacity')).toContainText('27 / 30 units');

	const before = await page.getByTestId('market-offer').allTextContents();
	await page.getByTestId('buy-offer').first().click();

	await expect(page.getByTestId('shelf-capacity')).toContainText('28 / 30 units');
	const afterBuy = await page.getByTestId('market-offer').allTextContents();
	expect(afterBuy).not.toEqual(before);

	await page.reload();
	await expect(page.getByTestId('evening')).toBeVisible();
	await expect(page.getByTestId('shelf-capacity')).toContainText('28 / 30 units');
	expect(await page.getByTestId('market-offer').allTextContents()).toEqual(afterBuy);
});

test('allows exactly one upgrade in an evening and remembers it', async ({ page }) => {
	await page.goto('/');
	await enterShop(page);
	await reachEvening(page);

	await page.getByRole('button', { name: /buy upgrade — the market ledger/i }).click();
	await expect(page.getByText(/already made its one purchase tonight/i)).toBeVisible();

	const buttons = await page.getByRole('button', { name: /buy upgrade/i }).all();
	for (const button of buttons) await expect(button).toBeDisabled();

	await page.reload();
	await expect(page.getByText(/already made its one purchase tonight/i)).toBeVisible();
	for (const button of await page.getByRole('button', { name: /buy upgrade/i }).all()) {
		await expect(button).toBeDisabled();
	}
});

test('pays the rent on day seven and opens chapter two', async ({ page }) => {
	await page.addInitScript(
		([key, save]) => localStorage.setItem(key, save),
		[
			SAVE_KEY,
			JSON.stringify(seededSave({ day: 7, chapter: 1, phase: 'market', coins: 100, market: [] }))
		]
	);
	await page.goto('/');
	await enterShop(page);

	await expect(page.getByTestId('evening')).toBeVisible();
	await page.getByRole('button', { name: /close up the shop/i }).click();
	await expect(page.getByTestId('rent-scene')).toBeVisible();
	await expect(page.getByRole('heading', { name: /rent is due/i })).toBeVisible();

	await page.getByRole('button', { name: /pay rent/i }).click();
	await expect(page.getByRole('heading', { name: /rent paid/i })).toBeVisible();
	await expect(page.getByText(/the tin holds 60 coins/i)).toBeVisible();

	await page.getByRole('button', { name: /continue/i }).click();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByTestId('customer-request')).toBeVisible();
	await expect(page.getByLabel('Shop status').getByText(/chapter 2/i)).toBeVisible();
});

test('a rent shortfall names what was taken and the shop continues', async ({ page }) => {
	await page.addInitScript(
		([key, save]) => localStorage.setItem(key, save),
		[
			SAVE_KEY,
			JSON.stringify(
				seededSave({
					day: 7,
					chapter: 1,
					phase: 'market',
					coins: 0,
					reputation: 5,
					upgrades: ['brass-scales'],
					market: []
				})
			)
		]
	);
	await page.goto('/');
	await enterShop(page);

	await page.getByRole('button', { name: /close up the shop/i }).click();
	await expect(page.getByText(/40 coins short/i)).toBeVisible();

	await page.getByRole('button', { name: /pay rent/i }).click();
	await expect(page.getByRole('heading', { name: /setback, not an ending/i })).toBeVisible();
	await expect(page.getByTestId('rent-scene')).toContainText(/brass scales/i);
	await expect(page.getByTestId('rent-scene').getByText(/3 \/ 10/)).toBeVisible();
	await expect(page.getByText(/10 coins/).first()).toBeVisible();

	await page.getByRole('button', { name: /continue/i }).click();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByTestId('customer-request')).toBeVisible();
	await expect(page.getByText(/10 coins/).first()).toBeVisible();
	await expect(page.getByText(/3 \/ 10/).first()).toBeVisible();
});

test('a double-click on reset does not clear the shop', async ({ page }) => {
	await page.addInitScript(
		([key, save]) => localStorage.setItem(key, save),
		[SAVE_KEY, JSON.stringify(seededSave({ day: 9, activeVisitId: 'widow-lamp' }))]
	);
	await page.goto('/');
	await enterShop(page);

	await page.getByRole('button', { name: /^settings$/i }).click();
	await page.getByRole('button', { name: /reset all progress/i }).dblclick();

	const day = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? '{}').day,
		SAVE_KEY
	);
	expect(day).toBe(9);
});
