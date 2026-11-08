import { expect, test } from '@playwright/test';

test('serves the first customer by tap in under a minute and restores the shop after reload', async ({
	page
}) => {
	const started = Date.now();

	await page.goto('/');

	await expect(page.getByRole('heading', { name: /a shop of small miracles/i })).toBeVisible();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByText('The Widow')).toBeVisible();
	await expect(page.getByTestId('tag-chip')).toHaveCount(2);
	await expect(page.getByText(/3 left/).first()).toBeVisible();

	await page.reload();
	await expect(page.locator('.shop')).toHaveAttribute('data-phase', 'service');
	await expect(page.getByText('The Widow')).toBeVisible();
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
	await expect(page.getByText(/baker’s boy/i)).toBeVisible();
	await expect(page.getByRole('status')).toHaveCount(0);
	await expect(page.getByText(/2 left/).first()).toBeVisible();

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
	await expect(page.getByText(/3 left/).first()).toBeVisible();
	await expect(page.getByText(/40 coins/)).toBeVisible();
});
