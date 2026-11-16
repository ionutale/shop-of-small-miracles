import { render, screen, within } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { BADGES } from '../data/badges';
import { initGame } from '../stores/game';
import { saveFixture } from '../test/fixtures';
import Journal from './Journal.svelte';

const FIRST_LIGHT = BADGES.find((badge) => badge.id === 'first-light')!;
const OPEN_FOR_BUSINESS = BADGES.find((badge) => badge.id === 'open-for-business')!;

beforeEach(() => localStorage.clear());

describe('journal honors', () => {
	it('shows the earned count and an earned badge with its flavor and day', () => {
		initGame(42, saveFixture({ badges: [{ id: 'first-light', day: 2 }] }));

		render(Journal);

		expect(screen.getByRole('heading', { name: /small honors/i })).toBeInTheDocument();
		expect(screen.getByText(new RegExp(`1 / ${BADGES.length}`))).toBeInTheDocument();

		const earned = screen.getByText(FIRST_LIGHT.title).closest('li');
		expect(earned).not.toBeNull();
		expect(within(earned!).getByText(FIRST_LIGHT.flavor)).toBeInTheDocument();
		expect(within(earned!).getByText(/earned day 2/i)).toBeInTheDocument();
		expect(within(earned!).queryByText(/not yet earned/i)).not.toBeInTheDocument();
	});

	it('lists a locked badge with its hint and no earned marker', () => {
		initGame(42, saveFixture({ badges: [{ id: 'first-light', day: 2 }] }));

		render(Journal);

		expect(screen.getByText(OPEN_FOR_BUSINESS.title)).toBeInTheDocument();
		expect(screen.getByText(OPEN_FOR_BUSINESS.hint)).toBeInTheDocument();

		const locked = screen.getByText(OPEN_FOR_BUSINESS.title).closest('li');
		expect(within(locked!).getByText('Not yet earned.')).toBeInTheDocument();
		expect(within(locked!).queryByText(/earned day/i)).not.toBeInTheDocument();
		expect(within(locked!).queryByText(OPEN_FOR_BUSINESS.flavor)).not.toBeInTheDocument();
	});

	it('keeps the list semantics and never hides the locked honors', () => {
		initGame(42, saveFixture({ badges: [{ id: 'first-light', day: 2 }] }));

		render(Journal);

		const list = screen.getByRole('list', { name: /small honors/i });
		expect(within(list).getAllByRole('listitem')).toHaveLength(BADGES.length);
	});

	it('ignores persisted badge ids that are no longer defined', () => {
		initGame(
			42,
			saveFixture({
				badges: [
					{ id: 'first-light', day: 2 },
					{ id: 'retired-honor', day: 5 }
				]
			})
		);

		render(Journal);

		expect(screen.getByText(new RegExp(`1 / ${BADGES.length}`))).toBeInTheDocument();
		const list = screen.getByRole('list', { name: /small honors/i });
		expect(within(list).getAllByRole('listitem')).toHaveLength(BADGES.length);
		expect(screen.queryByText('retired-honor')).not.toBeInTheDocument();
	});
});
