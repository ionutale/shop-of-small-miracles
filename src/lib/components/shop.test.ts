import { cleanup, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { serviceSave } from '../test/fixtures';
import { game, initGame } from '../stores/game';
import ShopScreen from './ShopScreen.svelte';

beforeEach(() => {
	localStorage.clear();
	initGame(42, serviceSave());
});

afterEach(() => {
	cleanup();
});

describe('shop', () => {
	it('shows the shop sign, one customer, and two requested essences', () => {
		render(ShopScreen);
		expect(screen.getByRole('heading', { name: /a shop of small miracles/i })).toBeInTheDocument();
		expect(screen.getByText(/the widow/i)).toBeInTheDocument();
		expect(screen.getByTestId('customer-request')).toHaveTextContent(/warm/i);
		expect(screen.getAllByTestId('tag-chip')).toHaveLength(2);
	});

	it('selects three ingredients, previews the tags, and brews a clean potion', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /hydrogen/i }));
		await user.click(screen.getByRole('button', { name: /sodium/i }));
		await user.click(screen.getByRole('button', { name: /copper/i }));

		expect(screen.getByText(/potent: warm/i)).toBeInTheDocument();
		const brewButton = screen.getByRole('button', { name: /^brew$/i });
		expect(brewButton).toBeEnabled();
		await user.click(brewButton);

		expect(screen.getByRole('status')).toHaveTextContent(/it does not burn/i);
		expect(screen.getByText(/payment: 24 coins/i)).toBeInTheDocument();
		expect(screen.getByText(/6 \/ 10/)).toBeInTheDocument();
		expect(screen.getByText(/widow's lamp/i)).toBeInTheDocument();

		const state = get(game);
		expect(state.coins).toBe(64);
		expect(state.reputation).toBe(6);
		expect(state.discovered).toHaveLength(1);
	});

	it('disables brewing until three ingredients are chosen and lets a slot be cleared', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		expect(screen.getByRole('button', { name: /^brew$/i })).toBeDisabled();
		await user.click(screen.getByRole('button', { name: /hydrogen/i }));
		expect(screen.getByRole('button', { name: /^brew$/i })).toBeDisabled();

		await user.click(screen.getByRole('button', { name: /remove hydrogen from the cauldron/i }));
		expect(get(game).stock.find((entry) => entry.elementId === 'H')?.units).toBe(2);
	});

	it('consumes ingredients on a mismatched brew and keeps reputation', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /hydrogen/i }));
		await user.click(screen.getByRole('button', { name: /oxygen/i }));
		await user.click(screen.getByRole('button', { name: /silver/i }));
		await user.click(screen.getByRole('button', { name: /^brew$/i }));

		expect(screen.getByRole('status')).toHaveTextContent(/that is not light/i);
		expect(screen.getByText(/5 \/ 10/)).toBeInTheDocument();

		const state = get(game);
		expect(state.lastResult?.kind).toBe('decline');
		expect(state.reputation).toBe(5);
		expect(state.coins).toBe(40);
		expect(state.stock.find((entry) => entry.elementId === 'O')?.units).toBe(0);
	});

	it('politely declining consumes nothing', async () => {
		const user = userEvent.setup();
		const before = structuredClone(get(game).stock);
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /politely decline/i }));
		expect(screen.getByRole('status')).toHaveTextContent(/thank you for trying/i);
		expect(get(game).stock).toEqual(before);
		expect(get(game).coins).toBe(40);
	});

	it('moves to the next visitor after a result', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /hydrogen/i }));
		await user.click(screen.getByRole('button', { name: /sodium/i }));
		await user.click(screen.getByRole('button', { name: /copper/i }));
		await user.click(screen.getByRole('button', { name: /^brew$/i }));
		await user.click(screen.getByRole('button', { name: /next visitor/i }));

		expect(get(game).activeVisitId).toBe('baker-lantern');
		expect(screen.getByText(/baker’s boy/i)).toBeInTheDocument();
	});

	it('shows a quiet day when no visitor can be served', () => {
		initGame(42, serviceSave({ stock: [], quietDay: true, activeVisitId: null }));
		render(ShopScreen);
		expect(screen.getByText(/the shop is quiet/i)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /^brew$/i })).not.toBeInTheDocument();
	});
});
