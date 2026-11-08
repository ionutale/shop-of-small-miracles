import { describe, expect, it } from 'vitest';
import { dayRngState, nextRandom, pickIndex } from './rng';

describe('rng', () => {
	it('is deterministic for a seed', () => {
		expect(nextRandom(42)).toEqual(nextRandom(42));
	});

	it('advances and stays in range', () => {
		let state = 7;
		const values: number[] = [];
		for (let i = 0; i < 20; i++) {
			const step = nextRandom(state);
			state = step.state;
			values.push(step.value);
			expect(step.value).toBeGreaterThanOrEqual(0);
			expect(step.value).toBeLessThan(1);
		}
		expect(new Set(values).size).toBeGreaterThan(1);
	});

	it('picks indices inside the range and advances the state', () => {
		const a = pickIndex(9, 5);
		expect(a.index).toBeGreaterThanOrEqual(0);
		expect(a.index).toBeLessThan(5);
		expect(a.state).not.toBe(9);
	});

	it('gives each day a reproducible starting state', () => {
		expect(dayRngState(42, 1)).toBe(dayRngState(42, 1));
		expect(dayRngState(42, 1)).not.toBe(dayRngState(42, 2));
		expect(dayRngState(42, 21)).not.toBe(dayRngState(43, 21));
	});
});
