import { expect, test } from '@playwright/test';

test('is installable and works offline after the first load', async ({ page, context }) => {
	await page.goto('/');
	await expect(async () => {
		const enter = page.getByRole('button', { name: /enter the shop/i });
		if ((await enter.count()) > 0) await enter.click();
		await expect(page.locator('.shop')).toBeVisible({ timeout: 1500 });
	}).toPass({ timeout: 15_000 });
	await expect(page.getByRole('heading', { name: /a shop of small miracles/i })).toBeVisible();

	const manifestLink = page.locator('link[rel="manifest"]');
	await expect(manifestLink).toHaveAttribute('href', '/manifest.webmanifest');

	const manifest = await (
		await page.request.get(new URL('/manifest.webmanifest', page.url()).toString())
	).json();
	const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
	expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
	expect(manifest.display).toBe('standalone');
	expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable')).toBe(
		true
	);

	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});

	await page.evaluate((key) => {
		const save = JSON.parse(localStorage.getItem(key) ?? '{}');
		save.day = 9;
		localStorage.setItem(key, JSON.stringify(save));
	}, 'small-miracles:save:v1');
	await page.reload();

	await context.setOffline(true);
	await page.reload();
	await expect(page.getByRole('heading', { name: /a shop of small miracles/i })).toBeVisible();
	await expect(page.locator('.stat', { hasText: 'Day' })).toContainText('9');

	const day = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? '{}').day,
		'small-miracles:save:v1'
	);
	expect(day).toBe(9);
	await context.setOffline(false);
});
