export type Tag =
	| 'Light'
	| 'Still'
	| 'Warm'
	| 'Cold'
	| 'Sharp'
	| 'Soft'
	| 'Heavy'
	| 'Dreaming'
	| 'Bitter'
	| 'Bright'
	| 'Bound'
	| 'Ground'
	| 'Spark'
	| 'Calm'
	| 'Cleanse'
	| 'Radiant'
	| 'Grief'
	| 'Hollow';

export type Phase = 'morning' | 'service' | 'market' | 'chapterEnd' | 'ending';
export type ArcId = 'widow' | 'merchant' | 'apprentice';

export interface ElementRecord {
	id: string;
	number: number;
	symbol: string;
	name: string;
	primary: Tag;
	secondary: Tag;
	price: number;
}

export interface PotionRecord {
	id: string;
	name: string;
	tags: [Tag, Tag];
	effect: string;
}

export interface VisitRecord {
	id: string;
	characterId: string;
	chapter: 1 | 2 | 3;
	request: string;
	tags: [Tag, Tag];
	cleanLine: string;
	sideEffectLine: string;
	declineLine: string;
	flags?: string[];
}

export interface CharacterRecord {
	id: string;
	name: string;
	portraitSeed: number;
	visits: VisitRecord[];
}

export interface ChapterRecord {
	number: 1 | 2 | 3;
	title: string;
	rent: number;
	beats: Record<number, string>;
	recurring: { characterId: string; days: number[] }[];
}

export interface UpgradeRecord {
	id: string;
	name: string;
	description: string;
	cost: number;
	effect: string;
}

export interface EndingRecord {
	id: 'shop-endures' | 'last-miracle' | 'quiet-closing';
	title: string;
	epilogue: string;
}

export interface StockEntry {
	elementId: string;
	units: number;
}

export interface MarketOffer {
	elementId: string;
	units: number;
	price: number;
}

export interface RentOutcome {
	kind: 'paid' | 'shortfall';
	rent: number;
	coinsAfter: number;
	taken: string | null;
	message: string;
}

export interface DiscoveredPotion {
	tags: Tag[];
	name: string;
	day: number;
}

export type BrewKind = 'clean' | 'sideEffect' | 'decline';

export interface BrewOutcome {
	kind: BrewKind;
	tags: Tag[];
	potency: Tag | null;
	matched: Tag[];
	extras: Tag[];
	pay: number;
	reputationDelta: number;
	line: string;
	potionName: string | null;
	/** Set when the apprentice returns a mismatched brew's ingredients. */
	refunded?: boolean;
}

export interface SaveState {
	version: 1;
	seed: number;
	rngState: number;
	day: number;
	chapter: 1 | 2 | 3;
	phase: Phase;
	coins: number;
	reputation: number;
	setbacks: number;
	stock: StockEntry[];
	discovered: DiscoveredPotion[];
	flags: string[];
	relationships: Record<ArcId, number>;
	servedToday: number;
	servedVisitIds: string[];
	activeVisitId: string | null;
	quietDay: boolean;
	market: MarketOffer[];
	upgrades: string[];
	shelfCapacity: number;
	upgradeBoughtToday: boolean;
	swappedToday: boolean;
	apprenticeUsedToday: boolean;
	warmStoveUsedToday: boolean;
	rentOutcome: RentOutcome | null;
	settings: { sound: boolean; reduceMotion: boolean };
	introSeen: boolean;
	lastResult: BrewOutcome | null;
	/** The day whose morning scene has been opened or dismissed. */
	morningSeenDay: number;
	/** Authored story options already taken, in order. */
	choices: string[];
}

export interface ContentBundle {
	elements: readonly ElementRecord[];
	potions: readonly PotionRecord[];
	characters: readonly CharacterRecord[];
	chapters: readonly ChapterRecord[];
	upgrades: readonly UpgradeRecord[];
	endings: readonly EndingRecord[];
}
