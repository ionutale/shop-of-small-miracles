import type { Page } from '@playwright/test';
import type { SaveState } from '../src/lib/types';

export const SAVE_KEY = 'small-miracles:save:v1';

export function seededSave(overrides: Partial<SaveState> = {}): SaveState {
	return {
		version: 1,
		seed: 42,
		rngState: 7,
		day: 1,
		chapter: 1,
		phase: 'service',
		coins: 40,
		reputation: 5,
		setbacks: 0,
		stock: [
			{ elementId: 'H', units: 3 },
			{ elementId: 'O', units: 3 },
			{ elementId: 'Na', units: 3 },
			{ elementId: 'Cu', units: 3 },
			{ elementId: 'Ag', units: 3 },
			{ elementId: 'Cl', units: 3 }
		],
		discovered: [],
		flags: [],
		relationships: { widow: 0, merchant: 0, apprentice: 0 },
		servedToday: 0,
		servedVisitIds: [],
		activeVisitId: 'widow-lamp',
		quietDay: false,
		market: [],
		upgrades: [],
		shelfCapacity: 30,
		upgradeBoughtToday: false,
		swappedToday: false,
		apprenticeUsedToday: false,
		warmStoveUsedToday: false,
		rentOutcome: null,
		settings: { sound: false, reduceMotion: true },
		introSeen: true,
		lastResult: null,
		morningSeenDay: 21,
		choices: [],
		...overrides
	};
}

/**
 * Store a save before the app boots. It only seeds an empty slot, so a reload
 * during a test reads what the app persisted rather than the fixture again.
 */
export async function seedSave(page: Page, overrides: Partial<SaveState> = {}): Promise<void> {
	await page.addInitScript(
		([key, save]) => {
			if (!localStorage.getItem(key)) localStorage.setItem(key, save);
		},
		[SAVE_KEY, JSON.stringify(seededSave(overrides))]
	);
}
