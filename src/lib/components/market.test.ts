import { cleanup, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateMarket } from '../game/economy';
import { game, initGame } from '../stores/game';
import { saveFixture } from '../test/fixtures';
import MarketScreen from './MarketScreen.svelte';
import RentScene from './RentScene.svelte';
import ShopScreen from './ShopScreen.svelte';

beforeEach(() => {
	localStorage.clear();
});

afterEach(() => {
	cleanup();
});

function eveningSave(overrides: Parameters<typeof saveFixture>[0] = {}) {
	return saveFixture({
		phase: 'market',
		day: 2,
		chapter: 1,
		coins: 100,
		market: generateMarket(7, 1, 2).offers,
		stock: [],
		shelfCapacity: 30,
		...overrides
	});
}

describe('the evening market', () => {
	it('announces a purchase and the coins left', async () => {
		initGame(
			42,
			eveningSave({
				coins: 20,
				market: [{ elementId: 'H', units: 2, price: 3 }],
				stock: []
			})
		);
		const user = userEvent.setup();

		render(MarketScreen);
		await user.click(screen.getByTestId('buy-offer'));

		expect(screen.getByTestId('market-announcer')).toHaveTextContent(
			/bought hydrogen for 3 coins/i
		);
		expect(screen.getByTestId('market-announcer')).toHaveTextContent(/17 coins left/i);
	});
	it('shows eight offers and the shelf capacity', () => {
		initGame(42, eveningSave());
		render(MarketScreen);

		expect(screen.getAllByTestId('market-offer')).toHaveLength(8);
		expect(screen.getByTestId('shelf-capacity')).toHaveTextContent('0 / 30 units');
		expect(screen.getByRole('heading', { name: /^evening$/i })).toBeInTheDocument();
	});

	it('buys stock, subtracts coins, and adds to the shelf', async () => {
		const user = userEvent.setup();
		initGame(42, eveningSave());
		render(MarketScreen);

		const offer = get(game).market[0];
		await user.click(screen.getAllByTestId('buy-offer')[0]);

		expect(get(game).coins).toBe(100 - offer.price);
		expect(get(game).stock.find((entry) => entry.elementId === offer.elementId)?.units).toBe(1);
		expect(screen.getByTestId('shelf-capacity')).toHaveTextContent('1 / 30 units');
	});

	it('disables a buy when the purse cannot cover the price', () => {
		initGame(42, eveningSave({ coins: 0 }));
		render(MarketScreen);
		for (const button of screen.getAllByTestId('buy-offer')) {
			expect(button).toBeDisabled();
		}
	});

	it('sells exactly one upgrade per evening', async () => {
		const user = userEvent.setup();
		initGame(42, eveningSave({ coins: 300, market: [] }));
		render(MarketScreen);

		const buttons = screen.getAllByRole('button', { name: /buy upgrade/i });
		await user.click(buttons[0]);

		expect(get(game).upgradeBoughtToday).toBe(true);
		for (const button of screen.getAllByRole('button', { name: /buy upgrade/i })) {
			expect(button).toBeDisabled();
		}
	});

	it('closes the shop into the rent scene on day seven', async () => {
		const user = userEvent.setup();
		initGame(42, eveningSave({ day: 7, chapter: 1, coins: 100 }));
		render(ShopScreen);

		await user.click(screen.getByRole('button', { name: /close up the shop/i }));

		expect(screen.getByTestId('rent-scene')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /rent is due/i })).toBeInTheDocument();
	});
});

describe('the rent scene', () => {
	it('pays rent and advances to the next chapter', async () => {
		const user = userEvent.setup();
		initGame(42, saveFixture({ day: 7, chapter: 1, phase: 'chapterEnd', coins: 100 }));
		render(RentScene);

		await user.click(screen.getByRole('button', { name: /pay rent/i }));

		expect(await screen.findByRole('heading', { name: /rent paid/i })).toBeInTheDocument();
		expect(get(game).coins).toBe(60);
		expect(get(game).day).toBe(8);
		expect(get(game).chapter).toBe(2);

		await user.click(screen.getByRole('button', { name: /continue/i }));
		expect(get(game).rentOutcome).toBeNull();
		expect(get(game).phase).toBe('service');
	});

	it('shows a named setback, not a game over, when the purse is short', async () => {
		const user = userEvent.setup();
		initGame(
			42,
			saveFixture({
				day: 7,
				chapter: 1,
				phase: 'chapterEnd',
				coins: 0,
				reputation: 5,
				upgrades: ['brass-scales']
			})
		);
		render(RentScene);

		await user.click(screen.getByRole('button', { name: /pay rent/i }));

		expect(await screen.findByText(/setback, not an ending/i)).toBeInTheDocument();
		expect(screen.getByTestId('rent-scene')).toHaveTextContent(/brass scales/i);
		expect(get(game).setbacks).toBe(1);
		expect(get(game).coins).toBe(10);
		expect(get(game).reputation).toBe(3);
		expect(get(game).phase).not.toBe('ending');

		await user.click(screen.getByRole('button', { name: /continue/i }));
		expect(get(game).rentOutcome).toBeNull();
		expect(get(game).phase).toBe('service');
		expect(get(game).day).toBe(8);
	});
});
