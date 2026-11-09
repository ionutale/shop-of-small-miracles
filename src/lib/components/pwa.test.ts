import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { writable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateServiceWorker = vi.fn();
const needRefresh = writable(false);

vi.mock('virtual:pwa-register/svelte', () => ({
	useRegisterSW: () => ({ needRefresh, updateServiceWorker })
}));

async function mount() {
	const { default: PwaUpdate } = await import('./PwaUpdate.svelte');
	return render(PwaUpdate);
}

beforeEach(() => {
	updateServiceWorker.mockClear();
	needRefresh.set(false);
});

describe('update prompt', () => {
	it('shows a refresh prompt for a waiting worker and refreshes on demand', async () => {
		needRefresh.set(true);
		await mount();

		expect(screen.getByText(/a new page is ready/i)).toBeInTheDocument();

		await userEvent.click(screen.getByRole('button', { name: /refresh/i }));

		expect(updateServiceWorker).toHaveBeenCalledWith(true);
	});

	it('lets the player dismiss the prompt for now', async () => {
		needRefresh.set(true);
		await mount();

		await userEvent.click(screen.getByRole('button', { name: /later/i }));

		expect(screen.queryByText(/a new page is ready/i)).not.toBeInTheDocument();
	});
});
