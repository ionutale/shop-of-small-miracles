import type { UpgradeRecord } from '../types';

/**
 * The twelve shop upgrades. At most one is bought per evening. Each effect is
 * read by the engine from the owned ids, so a purchase changes the shop at once.
 */
export const UPGRADES: readonly UpgradeRecord[] = [
	{
		id: 'shelf',
		name: 'A Second Shelf',
		description: 'More room for the small stock of a small shop.',
		cost: 50,
		effect: 'Shelf capacity grows by 10 units.'
	},
	{
		id: 'market-ledger',
		name: 'The Market Ledger',
		description: 'A list of who owes whom, kept in close handwriting.',
		cost: 35,
		effect: 'Market prices fall by 10%, rounded down.'
	},
	{
		id: 'brass-scales',
		name: 'Brass Scales',
		description: 'Old, accurate, and warm to the touch.',
		cost: 45,
		effect: 'Clean brews pay 2 extra coins.'
	},
	{
		id: 'reputation',
		name: 'A Good Name',
		description: 'The town begins to say the shop’s name kindly.',
		cost: 100,
		effect: 'Reputation rises by 1 now and at the start of each chapter.'
	},
	{
		id: 'stillroom',
		name: 'The Stillroom',
		description: 'A narrow room behind the counter, full of dust and possibility.',
		cost: 70,
		effect: 'The evening market keeps one extra offer.'
	},
	{
		id: 'cauldron',
		name: 'A Better Cauldron',
		description: 'The old iron hums before it boils.',
		cost: 30,
		effect: 'The cauldron names a potion before you brew it.'
	},
	{
		id: 'ledger',
		name: 'The Appointment Ledger',
		description: 'Names, hours, and a few careful crossings-out.',
		cost: 80,
		effect: 'Once a day, swap the waiting visitor for another eligible one.'
	},
	{
		id: 'warm-stove',
		name: 'A Warm Stove',
		description: 'The room keeps its heat long after the fire is banked.',
		cost: 55,
		effect: 'The first clean brew each day adds 1 extra reputation.'
	},
	{
		id: 'apprentice',
		name: 'An Apprentice',
		description: 'Someone to sweep up after the experiments.',
		cost: 90,
		effect: 'Once a day, a mismatched brew returns its ingredients.'
	},
	{
		id: 'glass-jars',
		name: 'Glass Jars',
		description: 'Clean, labelled, and better than paper twists.',
		cost: 40,
		effect: 'Each market purchase adds 2 bonus units.'
	},
	{
		id: 'old-sign',
		name: 'The Old Sign',
		description: 'Repainted lettering over the old lettering.',
		cost: 65,
		effect: 'Payments rise by 10%.'
	},
	{
		id: 'empty-chair',
		name: 'The Empty Chair',
		description: 'The previous alchemist’s chair, kept where it has always stood.',
		cost: 150,
		effect: 'Keep the chair. Opens the final scene and the best path.'
	}
];

export const UPGRADE_BY_ID: ReadonlyMap<string, UpgradeRecord> = new Map(
	UPGRADES.map((upgrade) => [upgrade.id, upgrade])
);

export function upgradeById(id: string | null | undefined): UpgradeRecord | null {
	return id ? (UPGRADE_BY_ID.get(id) ?? null) : null;
}

export function ownsUpgrade(upgrades: readonly string[], id: string): boolean {
	return upgrades.includes(id);
}

export function ownedUpgrades(upgrades: readonly string[]): UpgradeRecord[] {
	return upgrades
		.map((id) => upgradeById(id))
		.filter((upgrade): upgrade is UpgradeRecord => upgrade !== null);
}
