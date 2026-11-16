import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';
import { initGame } from '../stores/game';
import { saveFixture } from '../test/fixtures';
import GoalBar from './GoalBar.svelte';

beforeEach(() => localStorage.clear());

describe('goal bar', () => {
	it('states the day, the rent countdown, and the visitor goal', () => {
		initGame(42, saveFixture({ day: 1, chapter: 1, phase: 'service' }));

		render(GoalBar);

		const bar = screen.getByTestId('goal-bar');
		expect(bar).toHaveTextContent(/day 1 of 21/i);
		expect(bar).toHaveTextContent(/rent in 6 days/i);
		expect(bar).toHaveTextContent(/visitors 1 of 3/i);
	});

	it('says rent is due today on a rent day', () => {
		initGame(42, saveFixture({ day: 7, chapter: 1, phase: 'service' }));

		render(GoalBar);

		expect(screen.getByTestId('goal-bar')).toHaveTextContent(/rent due today/i);
	});

	it('hides visitors and closes the ledger on the ending', () => {
		initGame(42, saveFixture({ day: 21, chapter: 3, phase: 'ending' }));

		render(GoalBar);

		const bar = screen.getByTestId('goal-bar');
		expect(bar).toHaveTextContent(/day 21 of 21/i);
		expect(bar).toHaveTextContent(/last ledger is closed/i);
		expect(bar).not.toHaveTextContent(/visitors/i);
	});
});
