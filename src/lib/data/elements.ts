import type { ElementRecord } from '../types';

export const ELEMENTS: readonly ElementRecord[] = [
	{
		id: 'H',
		number: 1,
		symbol: 'H',
		name: 'Hydrogen',
		primary: 'Light',
		secondary: 'Warm',
		price: 3
	},
	{
		id: 'O',
		number: 8,
		symbol: 'O',
		name: 'Oxygen',
		primary: 'Bright',
		secondary: 'Cold',
		price: 3
	},
	{
		id: 'Na',
		number: 11,
		symbol: 'Na',
		name: 'Sodium',
		primary: 'Warm',
		secondary: 'Spark',
		price: 4
	},
	{
		id: 'Cu',
		number: 29,
		symbol: 'Cu',
		name: 'Copper',
		primary: 'Warm',
		secondary: 'Bound',
		price: 4
	},
	{
		id: 'K',
		number: 19,
		symbol: 'K',
		name: 'Potassium',
		primary: 'Spark',
		secondary: 'Warm',
		price: 5
	},
	{
		id: 'Ag',
		number: 47,
		symbol: 'Ag',
		name: 'Silver',
		primary: 'Still',
		secondary: 'Hollow',
		price: 4
	}
];

export const ELEMENT_BY_ID: ReadonlyMap<string, ElementRecord> = new Map(
	ELEMENTS.map((element) => [element.id, element])
);
