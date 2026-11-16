import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { game, initGame } from '../stores/game';
import { serviceSave } from '../test/fixtures';
import ShopScreen from './ShopScreen.svelte';

beforeEach(() => localStorage.clear());

describe('first-day coach', () => {
	it('walks the first customer through pick, brew, and read', async () => {
		initGame(42, serviceSave({ tutorialDone: false }));
		const user = userEvent.setup();

		render(ShopScreen);

		const coach = screen.getByTestId('first-day-coach');
		expect(coach).toHaveTextContent(/warm \+ light/i);
		expect(coach).toHaveTextContent(/hydrogen, sodium and copper/i);

		const hydrogen = screen.getByRole('button', { name: /^h hydrogen/i });
		expect(hydrogen.className).toMatch(/suggested/);

		await user.click(hydrogen);
		await user.click(screen.getByRole('button', { name: /^na sodium/i }));
		await user.click(screen.getByRole('button', { name: /^cu copper/i }));

		expect(coach).toHaveTextContent(/press brew/i);

		await user.click(screen.getByRole('button', { name: /^brew$/i }));

		expect(coach).toHaveTextContent(/clean miracle/i);
		expect(screen.getByTestId('result')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /next visitor/i }));

		expect(screen.queryByTestId('first-day-coach')).not.toBeInTheDocument();
		expect(get(game).tutorialDone).toBe(true);
	});

	it('can be dismissed without finishing the brew', async () => {
		initGame(42, serviceSave({ tutorialDone: false }));
		const user = userEvent.setup();

		render(ShopScreen);
		await user.click(screen.getByRole('button', { name: /hide guide/i }));

		expect(screen.queryByTestId('first-day-coach')).not.toBeInTheDocument();
		expect(get(game).tutorialDone).toBe(true);
	});

	it('tells the truth when the player declines politely', async () => {
		initGame(42, serviceSave({ tutorialDone: false }));
		const user = userEvent.setup();

		render(ShopScreen);
		await user.click(screen.getByRole('button', { name: /politely decline/i }));

		const coach = screen.getByTestId('first-day-coach');
		expect(coach).toHaveTextContent(/nothing was consumed/i);
		expect(coach).toHaveTextContent(/try hydrogen, sodium and copper/i);
		expect(coach).toHaveTextContent(/press next visitor/i);

		await user.click(screen.getByRole('button', { name: /next visitor/i }));
		expect(get(game).tutorialDone).toBe(true);
	});

	it('does not suggest a retry after a mismatched brew', async () => {
		initGame(42, serviceSave({ tutorialDone: false }));
		const user = userEvent.setup();

		render(ShopScreen);
		await user.click(screen.getByRole('button', { name: /^h hydrogen/i }));
		await user.click(screen.getByRole('button', { name: /^o oxygen/i }));
		await user.click(screen.getByRole('button', { name: /^ag silver/i }));
		await user.click(screen.getByRole('button', { name: /^brew$/i }));

		const coach = screen.getByTestId('first-day-coach');
		expect(coach).toHaveTextContent(/ingredients were spent/i);
		expect(coach).toHaveTextContent(/press next visitor/i);
		expect(screen.queryByText(/try hydrogen/i)).not.toBeInTheDocument();
	});

	it('stays dismissed after a reload', async () => {
		initGame(42, serviceSave({ tutorialDone: false }));
		const user = userEvent.setup();

		render(ShopScreen);
		await user.click(screen.getByRole('button', { name: /hide guide/i }));

		initGame(42);

		expect(get(game).tutorialDone).toBe(true);
		render(ShopScreen);
		expect(screen.queryByTestId('first-day-coach')).not.toBeInTheDocument();
	});

	it('does not show for a returning save', () => {
		initGame(42, serviceSave({ tutorialDone: true }));

		render(ShopScreen);

		expect(screen.queryByTestId('first-day-coach')).not.toBeInTheDocument();
	});

	it('does not block the brew controls', async () => {
		initGame(42, serviceSave({ tutorialDone: false }));
		const user = userEvent.setup();

		render(ShopScreen);
		await user.click(screen.getByRole('button', { name: /^h hydrogen/i }));
		await user.click(screen.getByRole('button', { name: /^na sodium/i }));
		await user.click(screen.getByRole('button', { name: /^cu copper/i }));

		expect(screen.getByRole('button', { name: /^brew$/i })).toBeEnabled();
	});
});
