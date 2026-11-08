import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

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
});
