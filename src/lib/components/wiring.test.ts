import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initGame } from '../stores/game';
import { serviceSave } from '../test/fixtures';
import ShopScreen from './ShopScreen.svelte';

const sound = vi.hoisted(() => ({ playSound: vi.fn(), setSoundEnabled: vi.fn() }));

vi.mock('../game/sound', () => sound);

beforeEach(() => {
	localStorage.clear();
	sound.playSound.mockClear();
	initGame(42, serviceSave());
});

describe('sound wiring', () => {
	it('plays glass when an ingredient is placed in the cauldron', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /hydrogen/i }));

		expect(sound.playSound).toHaveBeenCalledWith('glass');
	});

	it('plays a chime on a clean brew', async () => {
		const user = userEvent.setup();
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /hydrogen/i }));
		await user.click(screen.getByRole('button', { name: /sodium/i }));
		await user.click(screen.getByRole('button', { name: /copper/i }));
		await user.click(screen.getByRole('button', { name: /^brew$/i }));

		expect(sound.playSound).toHaveBeenCalledWith('chime');
	});
});
