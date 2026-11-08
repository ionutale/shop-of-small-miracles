import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Page from './+page.svelte';

beforeEach(() => {
	vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

describe('page', () => {
	it('renders the shop name', () => {
		render(Page);
		expect(screen.getByRole('heading', { name: /a shop of small miracles/i })).toBeInTheDocument();
	});

	it('opens the recipe book and the journal from the page tabs', async () => {
		render(Page);

		await userEvent.click(screen.getByRole('button', { name: /recipe book/i }));
		expect(screen.getByRole('heading', { name: /the recipe book/i })).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: /journal/i }));
		expect(screen.getByRole('heading', { name: /the journal/i })).toBeInTheDocument();
	});

	it('resets the scroll position when another tab opens', async () => {
		render(Page);

		await userEvent.click(screen.getByRole('button', { name: /journal/i }));

		expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 });
	});

	it('keeps each screen’s state when switching tabs', async () => {
		render(Page);

		await userEvent.click(screen.getByRole('button', { name: /recipe book/i }));
		await userEvent.type(screen.getByLabelText(/search the book/i), 'hush');

		await userEvent.click(screen.getByRole('button', { name: /journal/i }));
		await userEvent.click(screen.getByRole('button', { name: /recipe book/i }));

		expect(screen.getByLabelText(/search the book/i)).toHaveValue('hush');
	});
});
