import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import Page from '../../routes/+page.svelte';
import { game, initGame, setReduceMotion } from '../stores/game';
import { saveFixture } from '../test/fixtures';
import SettingsScreen from './SettingsScreen.svelte';

beforeEach(() => {
	localStorage.clear();
	document.documentElement.classList.remove('reduce-motion');
});

describe('settings', () => {
	it('persists sound and reduced motion across a reload', async () => {
		initGame(42);
		const user = userEvent.setup();

		render(SettingsScreen);

		await user.click(screen.getByRole('checkbox', { name: /sound/i }));
		await user.click(screen.getByRole('checkbox', { name: /reduce motion/i }));

		expect(get(game).settings).toEqual({ sound: false, reduceMotion: true });

		initGame(42);

		expect(get(game).settings).toEqual({ sound: false, reduceMotion: true });
	});

	it('applies the reduced-motion class to the page', async () => {
		initGame(42);
		render(Page);
		await tick();

		expect(document.documentElement.classList.contains('reduce-motion')).toBe(false);

		setReduceMotion(true);
		await tick();

		expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
	});

	it('resets progress only on a second confirmation', async () => {
		initGame(42, saveFixture({ day: 9, coins: 99, flags: ['keptTheChair'] }));
		const user = userEvent.setup();

		render(SettingsScreen);

		await user.click(screen.getByRole('button', { name: /reset all progress/i }));

		expect(screen.getByRole('button', { name: /yes, clear the shop/i })).toBeInTheDocument();
		expect(get(game).day).toBe(9);
		expect(get(game).coins).toBe(99);

		await user.click(screen.getByRole('button', { name: /yes, clear the shop/i }));

		expect(get(game).day).toBe(1);
		expect(get(game).coins).toBe(40);
		expect(get(game).flags).toEqual([]);
		expect(screen.queryByRole('button', { name: /yes, clear the shop/i })).not.toBeInTheDocument();
	});

	it('can keep the shop after arming the reset', async () => {
		initGame(42, saveFixture({ day: 9 }));
		const user = userEvent.setup();

		render(SettingsScreen);

		await user.click(screen.getByRole('button', { name: /reset all progress/i }));
		await user.click(screen.getByRole('button', { name: /keep my shop/i }));

		expect(get(game).day).toBe(9);
		expect(screen.getByRole('button', { name: /reset all progress/i })).toBeInTheDocument();
	});

	it('offers install guidance and an about note', () => {
		initGame(42);

		render(SettingsScreen);

		expect(screen.getByText(/add this shop to your home screen/i)).toBeInTheDocument();
		expect(screen.getByText(/no accounts, no trackers/i)).toBeInTheDocument();
	});
});
