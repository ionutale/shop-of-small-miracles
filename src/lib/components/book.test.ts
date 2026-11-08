import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { LETTERS } from '../data/letters';
import { namePotion, POTIONS } from '../data/potions';
import { initGame } from '../stores/game';
import { saveFixture } from '../test/fixtures';
import Journal from './Journal.svelte';
import RecipeBook from './RecipeBook.svelte';

const HUSH = POTIONS.find((potion) => potion.id === 'hush')!;
const WIDOWS_LAMP = POTIONS.find((potion) => potion.id === 'widows-lamp')!;

beforeEach(() => localStorage.clear());

describe('recipe book', () => {
	it('shows a named potion with its title, tags, effect, and discovery day', () => {
		initGame(
			42,
			saveFixture({
				discovered: [{ tags: [...HUSH.tags], name: HUSH.name, day: 4 }]
			})
		);

		render(RecipeBook);

		const card = screen.getByRole('article', { name: /hush/i });
		expect(card).toHaveTextContent(HUSH.effect);
		expect(within(card).getByText('Still')).toBeInTheDocument();
		expect(within(card).getByText('Dreaming')).toBeInTheDocument();
		expect(card).toHaveTextContent(/day 4/i);
	});

	it('files an unknown combination under Unfiled with its generated name', () => {
		const name = namePotion(['Light', 'Still']);
		initGame(42, saveFixture({ discovered: [{ tags: ['Light', 'Still'], name, day: 3 }] }));

		render(RecipeBook);

		expect(screen.getByRole('heading', { name: /unfiled/i })).toBeInTheDocument();
		const card = screen.getByRole('article', { name: new RegExp(name, 'i') });
		expect(card).toHaveTextContent('Light');
		expect(card).toHaveTextContent('Still');
		expect(card).toHaveTextContent(/day 3/i);
	});

	it('gives an unknown combination a stable generated name', () => {
		const first = namePotion(['Light', 'Still']);
		expect(namePotion(['Light', 'Still'])).toBe(first);
		expect(first).toBe('a light, still draught');
	});

	it('filters discovered entries by search and by essence', async () => {
		initGame(
			42,
			saveFixture({
				discovered: [
					{ tags: [...WIDOWS_LAMP.tags], name: WIDOWS_LAMP.name, day: 1 },
					{ tags: [...HUSH.tags], name: HUSH.name, day: 2 }
				]
			})
		);

		render(RecipeBook);

		expect(screen.queryByText('Salt Tears')).not.toBeInTheDocument();

		await userEvent.type(screen.getByLabelText(/search the book/i), 'hush');
		expect(screen.getByRole('article', { name: /hush/i })).toBeInTheDocument();
		expect(screen.queryByRole('article', { name: /widow.s lamp/i })).not.toBeInTheDocument();

		await userEvent.clear(screen.getByLabelText(/search the book/i));
		await userEvent.selectOptions(screen.getByLabelText(/filter by essence/i), 'Light');
		expect(screen.getByRole('article', { name: /widow.s lamp/i })).toBeInTheDocument();
		expect(screen.queryByRole('article', { name: /hush/i })).not.toBeInTheDocument();
	});

	it('shows an empty state before anything is filed', () => {
		initGame(42, saveFixture({ discovered: [] }));

		render(RecipeBook);

		expect(screen.getByText(/nothing has been filed yet/i)).toBeInTheDocument();
	});
});

describe('journal', () => {
	it('reflects the chapter, the cast, and the collected letters', () => {
		initGame(
			42,
			saveFixture({
				day: 8,
				chapter: 2,
				relationships: { widow: 7, merchant: 2, apprentice: 0 }
			})
		);

		render(Journal);

		expect(screen.getByRole('heading', { name: /the salt road/i })).toBeInTheDocument();
		expect(screen.getByText(/bundle of letters tied in string/i)).toBeInTheDocument();

		expect(screen.getByText(LETTERS[0].title)).toBeInTheDocument();
		expect(screen.getByText(LETTERS[0].body)).toBeInTheDocument();
		expect(screen.getByText(LETTERS[1].body)).toBeInTheDocument();
		expect(screen.queryByText(LETTERS[2].body)).not.toBeInTheDocument();

		expect(screen.getByText(/old friend/i)).toBeInTheDocument();
		expect(screen.getAllByText(/still learning/i)).toHaveLength(2);
	});

	it('counts only the letters the shop has received', () => {
		initGame(42, saveFixture({ day: 1, chapter: 1 }));

		render(Journal);

		expect(screen.getByText(new RegExp(`1 of ${LETTERS.length} letters`, 'i'))).toBeInTheDocument();
	});
});
