import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './+page.svelte';

beforeEach(() => {
	localStorage.clear();
	vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

async function start(): Promise<void> {
	await userEvent.click(screen.getByRole('button', { name: /enter the shop/i }));
}

describe('page', () => {
	it('starts at the title when there is no save', () => {
		render(Page);

		expect(screen.getByRole('heading', { name: /a shop of small miracles/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /enter the shop/i })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /^book$/i })).not.toBeInTheDocument();
	});

	it('enters the shop from the title', async () => {
		render(Page);

		await start();

		expect(screen.getByRole('heading', { name: /a shop of small miracles/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /^book$/i })).toBeInTheDocument();
	});

	it('opens the recipe book and the journal from the page tabs', async () => {
		render(Page);
		await start();

		await userEvent.click(screen.getByRole('button', { name: /^book$/i }));
		expect(screen.getByRole('heading', { name: /the recipe book/i })).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: /journal/i }));
		expect(screen.getByRole('heading', { name: /the journal/i })).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: /settings/i }));
		expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
	});

	it('resets the scroll position when another tab opens', async () => {
		render(Page);
		await start();

		await userEvent.click(screen.getByRole('button', { name: /journal/i }));

		expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 });
	});

	it('keeps each screen’s state when switching tabs', async () => {
		render(Page);
		await start();

		await userEvent.click(screen.getByRole('button', { name: /^book$/i }));
		await userEvent.type(screen.getByLabelText(/search the book/i), 'hush');

		await userEvent.click(screen.getByRole('button', { name: /journal/i }));
		await userEvent.click(screen.getByRole('button', { name: /^book$/i }));

		expect(screen.getByLabelText(/search the book/i)).toHaveValue('hush');
	});
});
