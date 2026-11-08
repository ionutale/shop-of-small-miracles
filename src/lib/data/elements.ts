import type { ElementRecord } from '../types';

/**
 * Thirty real elements, treated as magical ingredients. Only the primary tag
 * defines a potion; the secondary tag is flavour for the shelf card and prose.
 * Every one of the eighteen essences is somebody's primary.
 */
export const ELEMENTS: readonly ElementRecord[] = [
	{ id: 'H', number: 1, symbol: 'H', name: 'Hydrogen', primary: 'Light', secondary: 'Warm', price: 3 },
	{ id: 'He', number: 2, symbol: 'He', name: 'Helium', primary: 'Still', secondary: 'Hollow', price: 4 },
	{ id: 'Li', number: 3, symbol: 'Li', name: 'Lithium', primary: 'Spark', secondary: 'Calm', price: 5 },
	{ id: 'C', number: 6, symbol: 'C', name: 'Carbon', primary: 'Ground', secondary: 'Still', price: 2 },
	{ id: 'N', number: 7, symbol: 'N', name: 'Nitrogen', primary: 'Dreaming', secondary: 'Soft', price: 3 },
	{ id: 'O', number: 8, symbol: 'O', name: 'Oxygen', primary: 'Bright', secondary: 'Warm', price: 3 },
	{ id: 'F', number: 9, symbol: 'F', name: 'Fluorine', primary: 'Sharp', secondary: 'Bitter', price: 4 },
	{ id: 'Na', number: 11, symbol: 'Na', name: 'Sodium', primary: 'Warm', secondary: 'Spark', price: 4 },
	{ id: 'Mg', number: 12, symbol: 'Mg', name: 'Magnesium', primary: 'Calm', secondary: 'Light', price: 3 },
	{ id: 'Al', number: 13, symbol: 'Al', name: 'Aluminium', primary: 'Soft', secondary: 'Ground', price: 2 },
	{ id: 'Si', number: 14, symbol: 'Si', name: 'Silicon', primary: 'Still', secondary: 'Bound', price: 4 },
	{ id: 'P', number: 15, symbol: 'P', name: 'Phosphorus', primary: 'Spark', secondary: 'Dreaming', price: 5 },
	{ id: 'S', number: 16, symbol: 'S', name: 'Sulfur', primary: 'Bitter', secondary: 'Sharp', price: 4 },
	{ id: 'Cl', number: 17, symbol: 'Cl', name: 'Chlorine', primary: 'Cleanse', secondary: 'Sharp', price: 4 },
	{ id: 'K', number: 19, symbol: 'K', name: 'Potassium', primary: 'Spark', secondary: 'Warm', price: 5 },
	{ id: 'Ca', number: 20, symbol: 'Ca', name: 'Calcium', primary: 'Bound', secondary: 'Ground', price: 3 },
	{ id: 'Fe', number: 26, symbol: 'Fe', name: 'Iron', primary: 'Heavy', secondary: 'Ground', price: 4 },
	{ id: 'Cu', number: 29, symbol: 'Cu', name: 'Copper', primary: 'Warm', secondary: 'Radiant', price: 4 },
	{ id: 'Zn', number: 30, symbol: 'Zn', name: 'Zinc', primary: 'Calm', secondary: 'Cleanse', price: 3 },
	{ id: 'Ga', number: 31, symbol: 'Ga', name: 'Gallium', primary: 'Soft', secondary: 'Bright', price: 5 },
	{ id: 'Ge', number: 32, symbol: 'Ge', name: 'Germanium', primary: 'Ground', secondary: 'Heavy', price: 4 },
	{ id: 'As', number: 33, symbol: 'As', name: 'Arsenic', primary: 'Bitter', secondary: 'Hollow', price: 5 },
	{ id: 'Se', number: 34, symbol: 'Se', name: 'Selenium', primary: 'Radiant', secondary: 'Light', price: 6 },
	{ id: 'Ho', number: 67, symbol: 'Ho', name: 'Holmium', primary: 'Cold', secondary: 'Still', price: 5 },
	{ id: 'Kr', number: 36, symbol: 'Kr', name: 'Krypton', primary: 'Hollow', secondary: 'Still', price: 5 },
	{ id: 'Ag', number: 47, symbol: 'Ag', name: 'Silver', primary: 'Still', secondary: 'Dreaming', price: 4 },
	{ id: 'Sn', number: 50, symbol: 'Sn', name: 'Tin', primary: 'Soft', secondary: 'Heavy', price: 3 },
	{ id: 'I', number: 53, symbol: 'I', name: 'Iodine', primary: 'Cleanse', secondary: 'Light', price: 5 },
	{ id: 'Xe', number: 54, symbol: 'Xe', name: 'Xenon', primary: 'Dreaming', secondary: 'Hollow', price: 5 },
	{ id: 'Pb', number: 82, symbol: 'Pb', name: 'Lead', primary: 'Grief', secondary: 'Bound', price: 5 }
];

export const ELEMENT_BY_ID: ReadonlyMap<string, ElementRecord> = new Map(
	ELEMENTS.map((element) => [element.id, element])
);
