import type { ArcId } from '../types';

export interface ChoiceEffects {
	flags?: readonly string[];
	relationships?: Partial<Record<ArcId, number>>;
	reputation?: number;
}

export interface ChoiceOption {
	id: string;
	label: string;
	/** The line the shop reads back after the choice. */
	result: string;
	effects: ChoiceEffects;
}

export interface ChoiceRecord {
	id: string;
	day: number;
	prompt: string;
	options: readonly ChoiceOption[];
}

/**
 * One authored choice on a morning-scene day. The first option of each choice
 * is the kind path; the alternate is quieter and never punitive beyond a small
 * relationship cost. Choices raise or lower relationships and set story flags;
 * they never touch coins, stock, or rent.
 */
export const CHOICES: readonly ChoiceRecord[] = [
	{
		id: 'day-3-cart',
		day: 3,
		prompt: 'The salt merchant’s cart has lost a wheel outside your door.',
		options: [
			{
				id: 'd3-mend-cart',
				label: 'Mend the wheel',
				result: 'You mend the wheel; the whole street smells of salt and thanks.',
				effects: { relationships: { merchant: 2 } }
			},
			{
				id: 'd3-wave-on',
				label: 'Wave him on',
				result: 'He levers the cart up alone. The street smells of salt and nothing else.',
				effects: { relationships: { merchant: -1 } }
			}
		]
	},
	{
		id: 'day-6-lamp',
		day: 6,
		prompt: 'The widow’s lamp is still burning on her windowsill, too hot for the small room.',
		options: [
			{
				id: 'd6-new-wick',
				label: 'Take her a new wick',
				result: 'She lets you in. The lamp burns low and steady, and she talks about her husband.',
				effects: { relationships: { widow: 2 } }
			},
			{
				id: 'd6-leave-lamp',
				label: 'Leave her be',
				result: 'The light stays where it is. You watch it from across the lane.',
				effects: {}
			}
		]
	},
	{
		id: 'day-8-letters',
		day: 8,
		prompt: 'The widow sets a bundle of letters on the counter and does not let go of the string.',
		options: [
			{
				id: 'd8-read-aloud',
				label: 'Read one aloud with her',
				result: 'You read his hand slowly, and the grief in the room is only grief.',
				effects: { relationships: { widow: 2 } }
			},
			{
				id: 'd8-keep-letters',
				label: 'Let her keep the string tied',
				result: 'She tucks the bundle back under her shawl. Some letters keep their own time.',
				effects: {}
			}
		]
	},
	{
		id: 'day-10-mud',
		day: 10,
		prompt: 'The salt merchant returns with mud to the knee and stands in the rain.',
		options: [
			{
				id: 'd10-warm-stove',
				label: 'Give him the warm stove',
				result: 'He sits with his boots steaming and tells the story he would not finish.',
				effects: { relationships: { merchant: 2 } }
			},
			{
				id: 'd10-send-home',
				label: 'Send him home to dry off',
				result: 'He nods and goes. The rain keeps his footprints for a while.',
				effects: { relationships: { merchant: -1 } }
			}
		]
	},
	{
		id: 'day-12-water',
		day: 12,
		prompt: 'The landlord’s apprentice leaves a jar of clean water by the door after dark.',
		options: [
			{
				id: 'd12-walk-home',
				label: 'Walk her home',
				result: 'You carry the empty jar back and the lane is quieter for the company.',
				effects: { relationships: { apprentice: 2 } }
			},
			{
				id: 'd12-thank-her',
				label: 'Thank her from the step',
				result: 'She waves once and disappears around the corner.',
				effects: { relationships: { apprentice: 1 } }
			}
		]
	},
	{
		id: 'day-13-letter',
		day: 13,
		prompt: 'A letter with no signature asks what the old alchemist’s last miracle was for.',
		options: [
			{
				id: 'd13-read-letter',
				label: 'Read the old alchemist’s letter',
				result: 'The paper smells of the same wax. You were meant to find this one.',
				effects: { flags: ['readTheLetter'], relationships: { apprentice: 2 }, reputation: 1 }
			},
			{
				id: 'd13-burn-letter',
				label: 'Burn it unread',
				result: 'The wax blackens and the question goes up the chimney.',
				effects: {}
			}
		]
	},
	{
		id: 'day-16-road',
		day: 16,
		prompt:
			'The salt merchant has stopped selling salt. He stands outside the shop and watches the road.',
		options: [
			{
				id: 'd16-tea',
				label: 'Ask him in for tea',
				result: 'He holds the cup without drinking it, but he stays until the kettle is cold.',
				effects: { relationships: { merchant: 2 } }
			},
			{
				id: 'd16-closed-door',
				label: 'Leave the door closed',
				result: 'He watches the road a while longer, then walks back up the hill.',
				effects: { relationships: { merchant: -1 } }
			}
		]
	},
	{
		id: 'day-17-box',
		day: 17,
		prompt: 'The merchant brings a small wooden box and asks you to keep it until morning.',
		options: [
			{
				id: 'd17-keep-box',
				label: 'Keep the box',
				result: 'You put it under the counter. It is heavier than it looks.',
				effects: { flags: ['saltDebt'], relationships: { merchant: 1 } }
			},
			{
				id: 'd17-refuse-box',
				label: 'Refuse it gently',
				result: 'He takes it back without arguing and thanks you for the honesty.',
				effects: {}
			}
		]
	},
	{
		id: 'day-19-chair',
		day: 19,
		prompt:
			'The apprentice sets the old alchemist’s chair back in its corner and asks you to look at it.',
		options: [
			{
				id: 'd19-keep-chair',
				label: 'Keep the chair by the stove',
				result: 'You put a cushion on it. The corner looks less empty than it did.',
				effects: { flags: ['keptTheChair'], relationships: { widow: 2, apprentice: 1 } }
			},
			{
				id: 'd19-store-chair',
				label: 'Move it to the back room',
				result: 'The corner is honest now: just a corner, just a shop.',
				effects: {}
			}
		]
	},
	{
		id: 'day-20-choice',
		day: 20,
		prompt:
			'The landlord’s man comes early. He says the choice about the shop can wait one more day.',
		options: [
			{
				id: 'd20-keep-open',
				label: 'Keep the shop open',
				result: 'You tell him the lamp will be lit tomorrow. He writes it down and leaves.',
				effects: { relationships: { apprentice: 2 }, reputation: 1 }
			},
			{
				id: 'd20-close-tomorrow',
				label: 'Close the shop tomorrow',
				result: 'He nods as if he expected it. The ledger closes with no argument.',
				effects: { flags: ['closedTheShop'] }
			}
		]
	}
] as const;

const OPTION_INDEX = new Map(
	CHOICES.flatMap((choice) =>
		choice.options.map((option) => [option.id, { choice, option }] as const)
	)
);

export function choiceForOption(
	optionId: string
): { choice: ChoiceRecord; option: ChoiceOption } | null {
	return OPTION_INDEX.get(optionId) ?? null;
}

export function choicesForDay(day: number): readonly ChoiceRecord[] {
	return CHOICES.filter((choice) => choice.day === day);
}
