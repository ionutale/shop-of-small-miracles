import { cleanup, render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { serviceSave } from '../test/fixtures';
import { createInitialSave, SAVE_KEY } from '../game/storage';
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
	it('shows a recovery notice for a corrupt save and lets it be dismissed', async () => {
		localStorage.setItem(SAVE_KEY, '{not a save');
		initGame(42);
		const user = userEvent.setup();

		render(ShopScreen);

		expect(screen.getByText(/old save could not be read/i)).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /dismiss/i }));

		expect(screen.queryByText(/old save could not be read/i)).not.toBeInTheDocument();
	});

	it('shows the shop sign, one customer, two requested essences, and today’s story beat', () => {
		render(ShopScreen);
		expect(screen.getByRole('heading', { name: /a shop of small miracles/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /the widow/i })).toBeInTheDocument();
		expect(screen.getByTestId('customer-request')).toHaveTextContent(/warm/i);
		expect(screen.getAllByTestId('tag-chip')).toHaveLength(2);
		expect(screen.getByTestId('day-beat')).toHaveTextContent(/letter arrives under the door/i);
		expect(screen.getByTestId('visitor-count')).toHaveTextContent('1 of 3');
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
		const resultPanel = screen.getByTestId('result');
		expect(within(resultPanel).getByText(/payment: 24 coins/i)).toBeInTheDocument();
		expect(screen.getByText(/6 \/ 10/)).toBeInTheDocument();
		expect(within(resultPanel).getByText(/widow's lamp/i)).toBeInTheDocument();

		const state = get(game);
		expect(state.coins).toBe(64);
		expect(state.reputation).toBe(6);
		expect(state.discovered).toHaveLength(1);
	});

	it('announces the brew result and payment in one polite live region', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /hydrogen/i }));
		await user.click(screen.getByRole('button', { name: /sodium/i }));
		await user.click(screen.getByRole('button', { name: /copper/i }));
		await user.click(screen.getByRole('button', { name: /^brew$/i }));

		const announcer = screen.getByTestId('announcer');
		expect(announcer).toHaveAttribute('aria-live', 'polite');
		expect(announcer).toHaveTextContent(/it does not burn/i);
		expect(announcer).toHaveTextContent(/payment: 24 coins/i);
	});

	it('announces a rent setback once', async () => {
		initGame(42, serviceSave({ day: 7, chapter: 1, phase: 'chapterEnd', coins: 0 }));
		const user = userEvent.setup();
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /pay rent/i }));

		expect(screen.getByTestId('announcer')).toHaveTextContent(/setback|shelf/i);
	});

	it('disables brewing until three ingredients are chosen and lets a slot be cleared', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		expect(screen.getByRole('button', { name: /^brew$/i })).toBeDisabled();
		await user.click(screen.getByRole('button', { name: /hydrogen/i }));
		expect(screen.getByRole('button', { name: /^brew$/i })).toBeDisabled();

		await user.click(screen.getByRole('button', { name: /cauldron slot 1: h hydrogen/i }));
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
		expect(screen.getByTestId('visitor-count')).toHaveTextContent('0 of 3');
		expect(screen.queryByRole('button', { name: /^brew$/i })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: /^evening$/i })).toBeInTheDocument();
	});

	it('serves exactly three visitors with no repeat, then shows the evening placeholder', async () => {
		const user = userEvent.setup();
		localStorage.clear();
		initGame(42, createInitialSave(42));
		render(ShopScreen);

		const met: string[] = [];
		for (let served = 0; served < 3; served++) {
			expect(screen.getByTestId('visitor-count')).toHaveTextContent(`${served + 1} of 3`);
			met.push(get(game).activeVisitId ?? '');
			await user.click(screen.getByRole('button', { name: /politely decline/i }));
			const next = screen.getByRole('button', {
				name: served === 2 ? /^evening$/i : /next visitor/i
			});
			await user.click(next);
		}

		expect(new Set(met).size).toBe(3);
		expect(get(game).phase).toBe('market');
		expect(screen.getByTestId('evening')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /^evening$/i })).toBeInTheDocument();
	});

	it('lets a quiet day reach the evening and open the next day', async () => {
		const user = userEvent.setup();
		initGame(42, serviceSave({ stock: [], quietDay: true, activeVisitId: null }));
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /^evening$/i }));
		expect(screen.getByTestId('evening')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /close up the shop/i }));
		const state = get(game);
		expect(state.day).toBe(2);
		expect(state.phase).toBe('service');
		expect(screen.getByTestId('day-beat')).toHaveTextContent(/swept your step/i);
	});
});
