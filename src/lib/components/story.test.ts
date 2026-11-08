import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { ENDINGS } from '../data/endings';
import { game, initGame } from '../stores/game';
import { saveFixture } from '../test/fixtures';
import EndingPage from './EndingPage.svelte';
import MorningScene from './MorningScene.svelte';
import ShopScreen from './ShopScreen.svelte';

beforeEach(() => localStorage.clear());

describe('morning scene', () => {
	it('plays the authored beat and its choice on a choice day', () => {
		initGame(42, saveFixture({ day: 3, morningSeenDay: 0 }));

		render(MorningScene);

		expect(screen.getByTestId('day-beat')).toHaveTextContent(/whole street smells of the road/i);
		expect(screen.getByText(/lost a wheel outside your door/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /mend the wheel/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /wave him on/i })).toBeInTheDocument();
	});

	it('records a choice, shows its result, and dismisses the card', async () => {
		initGame(42, saveFixture({ day: 3, morningSeenDay: 0 }));
		const user = userEvent.setup();

		render(MorningScene);

		await user.click(screen.getByRole('button', { name: /mend the wheel/i }));

		expect(get(game).relationships.merchant).toBe(2);
		expect(screen.getByText(/salt and thanks/i)).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /begin the day/i }));

		expect(screen.queryByText(/lost a wheel outside your door/i)).not.toBeInTheDocument();
		expect(get(game).morningSeenDay).toBe(3);
	});

	it('never blocks service: the customer is still waiting behind the card', async () => {
		initGame(42, saveFixture({ day: 3, morningSeenDay: 0 }));

		render(ShopScreen);

		expect(screen.getByText(/lost a wheel outside your door/i)).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /the widow/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /hydrogen/i })).toBeEnabled();
	});

	it('shows only the beat and a begin button on a day without a choice', () => {
		initGame(42, saveFixture({ day: 2, morningSeenDay: 0 }));

		render(MorningScene);

		expect(screen.getByTestId('day-beat')).toHaveTextContent(/someone has swept your step/i);
		expect(screen.getByRole('button', { name: /begin the day/i })).toBeInTheDocument();
	});

	it('stays dismissed for the rest of the day', () => {
		initGame(42, saveFixture({ day: 3, morningSeenDay: 3 }));

		render(MorningScene);

		expect(screen.queryByText(/lost a wheel outside your door/i)).not.toBeInTheDocument();
	});
});

describe('ending page', () => {
	it.each(ENDINGS)('renders $title with the three relationship lines', (ending) => {
		initGame(
			42,
			saveFixture({
				day: 21,
				chapter: 3,
				phase: 'ending',
				flags: ending.id === 'quiet-closing' ? ['closedTheShop'] : ['keptTheChair'],
				reputation: ending.id === 'last-miracle' ? 8 : 5,
				relationships:
					ending.id === 'last-miracle'
						? { widow: 7, merchant: 7, apprentice: 7 }
						: { widow: 3, merchant: 4, apprentice: 5 }
			})
		);

		render(EndingPage);

		expect(screen.getByRole('heading', { name: ending.title })).toBeInTheDocument();
		expect(screen.getByText(ending.epilogue)).toBeInTheDocument();
		expect(screen.getAllByTestId('ending-relationship')).toHaveLength(3);
		expect(screen.getByText(/the shop chose to be/i)).toBeInTheDocument();
	});

	it('offers a new game from the final page', async () => {
		initGame(42, saveFixture({ day: 21, chapter: 3, phase: 'ending' }));
		const user = userEvent.setup();

		render(EndingPage);

		await user.click(screen.getByRole('button', { name: /new game/i }));

		expect(get(game).day).toBe(1);
		expect(get(game).phase).toBe('service');
		expect(get(game).flags).not.toContain('closedTheShop');
	});

	it('is reachable from the day-21 ledger in the shop', () => {
		initGame(
			42,
			saveFixture({
				day: 21,
				chapter: 3,
				phase: 'chapterEnd',
				flags: ['ledgerClosed'],
				reputation: 5
			})
		);

		render(ShopScreen);

		const page = screen.getByTestId('ending-page');
		expect(within(page).getByRole('heading', { name: ENDINGS[0].title })).toBeInTheDocument();
		expect(screen.queryByText(/visitors/i)).not.toBeInTheDocument();
	});
});
