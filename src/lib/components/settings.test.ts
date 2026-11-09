import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { vi } from 'vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import Page from '../../routes/+page.svelte';
import { installPrompt, type InstallPromptEvent } from '../stores/install';
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

	it('applies and removes the reduced-motion class on the page', async () => {
		initGame(42);
		render(Page);
		await tick();

		expect(document.documentElement.classList.contains('reduce-motion')).toBe(false);

		setReduceMotion(true);
		await tick();

		expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);

		setReduceMotion(false);
		await tick();

		expect(document.documentElement.classList.contains('reduce-motion')).toBe(false);
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

	it('keeps the comfort settings when progress resets', async () => {
		initGame(42);
		const user = userEvent.setup();

		render(SettingsScreen);

		await user.click(screen.getByRole('checkbox', { name: /sound/i }));
		await user.click(screen.getByRole('checkbox', { name: /reduce motion/i }));
		await user.click(screen.getByRole('button', { name: /reset all progress/i }));
		await user.click(screen.getByRole('button', { name: /yes, clear the shop/i }));

		expect(get(game).day).toBe(1);
		expect(get(game).settings).toEqual({ sound: false, reduceMotion: true });
	});

	it('traps focus in the reset dialog and restores it on cancel', async () => {
		initGame(42);
		const user = userEvent.setup();

		render(SettingsScreen);

		const trigger = screen.getByRole('button', { name: /reset all progress/i });
		trigger.focus();
		await user.click(trigger);

		expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
		const keep = screen.getByRole('button', { name: /keep my shop/i });
		expect(keep).toHaveFocus();

		const confirm = screen.getByRole('button', { name: /yes, clear the shop/i });
		confirm.focus();
		await user.tab();
		expect(keep).toHaveFocus();

		await user.tab({ shift: true });
		expect(confirm).toHaveFocus();

		await user.keyboard('{Escape}');
		await tick();

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: /reset all progress/i })).toHaveFocus();

		await user.click(screen.getByRole('button', { name: /reset all progress/i }));
		await user.click(screen.getByRole('button', { name: /keep my shop/i }));
		await tick();

		expect(screen.getByRole('button', { name: /reset all progress/i })).toHaveFocus();
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

	it('offers the captured install prompt when the browser provides one', () => {
		initGame(42);
		installPrompt.set({
			prompt: vi.fn(async () => {}),
			userChoice: Promise.resolve({ outcome: 'accepted' })
		} as unknown as InstallPromptEvent);

		render(SettingsScreen);

		expect(screen.getByRole('button', { name: /install the shop/i })).toBeInTheDocument();
		installPrompt.set(null);
	});

	it('explains the rules in a help section', () => {
		initGame(42);

		render(SettingsScreen);

		expect(screen.getByRole('heading', { name: /how the shop works/i })).toBeInTheDocument();
		expect(screen.getByText(/a clean brew matches both requested essences/i)).toBeInTheDocument();
		expect(screen.getByText(/extra essence causes a side effect/i)).toBeInTheDocument();
		expect(screen.getByText(/rent is due at the end of each chapter/i)).toBeInTheDocument();
		expect(screen.getByText(/missing rent is a setback, never a game over/i)).toBeInTheDocument();
	});

	it('offers install guidance and an about note', () => {
		initGame(42);

		render(SettingsScreen);

		expect(screen.getByText(/add this shop to your home screen/i)).toBeInTheDocument();
		expect(screen.getByText(/no accounts, no trackers/i)).toBeInTheDocument();
	});
});
