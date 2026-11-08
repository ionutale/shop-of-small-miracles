import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('page', () => {
	it('renders the shop name', () => {
		render(Page);
		expect(screen.getByRole('heading', { name: /a shop of small miracles/i })).toBeInTheDocument();
	});
});
