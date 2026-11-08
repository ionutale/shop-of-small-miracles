import type { SaveState, Tag, VisitRecord } from '../types';

export function tinyVisit(tags: [Tag, Tag]): VisitRecord {
	return {
		id: 'visit-1',
		characterId: 'widow',
		chapter: 1,
		request: 'A small kindness.',
		tags,
		cleanLine: 'Thank you.',
		sideEffectLine: 'Oh.',
		declineLine: 'Perhaps not.'
	};
}

export function saveFixture(overrides: Partial<SaveState> = {}): SaveState {
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
			{ elementId: 'H', units: 2 },
			{ elementId: 'O', units: 1 },
			{ elementId: 'Na', units: 2 },
			{ elementId: 'Cu', units: 2 },
			{ elementId: 'K', units: 1 },
			{ elementId: 'Ag', units: 1 }
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
		settings: { sound: true, reduceMotion: false },
		introSeen: true,
		lastResult: null,
		...overrides
	};
}

export function serviceSave(overrides: Partial<SaveState> = {}): SaveState {
	return saveFixture({
		phase: 'service',
		activeVisitId: 'widow-lamp',
		quietDay: false,
		...overrides
	});
}

export function memoryStorage(): Storage {
	const map = new Map<string, string>();
	return {
		get length() {
			return map.size;
		},
		clear: () => map.clear(),
		getItem: (key) => map.get(key) ?? null,
		key: (index) => [...map.keys()][index] ?? null,
		removeItem: (key) => void map.delete(key),
		setItem: (key, value) => void map.set(key, value)
	};
}
