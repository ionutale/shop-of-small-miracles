import type { Tag } from '../types';

/**
 * One small, all-ages consequence per extra essence. The first line is the
 * canonical one used in the brew result; the rest add variety for future work.
 */
export const SIDE_EFFECTS: Record<Tag, readonly string[]> = {
	Light: [
		'The room brightens a shade too far, and every shadow looks recently moved.',
		'For a moment you can see the dust inside the lamp.'
	],
	Still: [
		'The room goes too quiet, and someone’s clock stops.',
		'Nothing moves for a breath, including the steam.'
	],
	Warm: [
		'The cup stays warm long after it should, and the handle sweats.',
		'Summer leans in through the window for a moment, uninvited.'
	],
	Cold: [
		'Frost creeps across the counter in a neat, apologetic line.',
		'The kettle sighs and gives up.'
	],
	Sharp: [
		'The edge of the smell cuts, and the customer blinks twice.',
		'A clean line appears in the dust, as if drawn by a careful knife.'
	],
	Soft: [
		'Everything in the room settles half an inch, including the customer.',
		'The sound of the street arrives wrapped in wool.'
	],
	Heavy: [
		'The floorboards remember the customer’s boots for the rest of the day.',
		'The potion pulls at the shelf, and a jar edges forward.'
	],
	Dreaming: [
		'The customer’s eyes drift, and they answer a question nobody asked.',
		'The candle burns a colour that is not on the shelf.'
	],
	Bitter: [
		'The aftertaste arrives before the first sip and stays for tea.',
		'The customer’s mouth folds, politely, around the truth.'
	],
	Bright: [
		'For one heartbeat the room is brighter than the window.',
		'The customer’s shadow points the wrong way.'
	],
	Bound: [
		'The stopper sticks, and the customer has to ask for help.',
		'Two loose pages on the counter settle into the same order.'
	],
	Ground: [
		'The floor feels suddenly farther away, and the customer grips the counter.',
		'A little dust rises and then thinks better of it.'
	],
	Spark: [
		'A blue spark jumps from the ladle to the customer’s sleeve.',
		'The hair on your arm stands up, and the lamp flickers once.'
	],
	Calm: [
		'The customer exhales, and the whole shop takes the same breath.',
		'For a moment nobody wants anything at all.'
	],
	Cleanse: [
		'The smell leaves first, and then the comfort.',
		'The counter looks scrubbed in one neat, accusing patch.'
	],
	Radiant: [
		'The potion glows through the glass, and the customer shields their eyes.',
		'A warm halo stays on the counter after the cup is lifted.'
	],
	Grief: [
		'The room fills with a feeling that has no name and knows the way in.',
		'The customer looks at the empty chair and then at nothing.'
	],
	Hollow: [
		'The sound of the shop drops out, as if poured somewhere else.',
		'The customer speaks, and their voice arrives a step behind them.'
	]
};

/** The canonical consequence for an extra essence. */
export function sideEffectLineFor(tag: Tag): string {
	return SIDE_EFFECTS[tag][0];
}
