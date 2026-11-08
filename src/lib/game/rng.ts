export interface RandomStep {
	value: number;
	state: number;
}

export interface IndexStep {
	index: number;
	state: number;
}

/** Mulberry32 — small, deterministic, and good enough for offering choices. */
export function nextRandom(state: number): RandomStep {
	const next = (state + 0x6d2b79f5) >>> 0;
	let t = next;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	return { value, state: next };
}

export function pickIndex(state: number, length: number): IndexStep {
	const step = nextRandom(state);
	const index = length > 0 ? Math.floor(step.value * length) : 0;
	return { index, state: step.state };
}

/**
 * A per-day starting state. Days are independent of how many draws previous
 * days used, so the same save seed and day always open with the same offers.
 */
export function dayRngState(seed: number, day: number): number {
	const mixed = ((seed >>> 0) ^ Math.imul(day + 1, 0x9e3779b9)) >>> 0;
	return nextRandom(mixed).state;
}
