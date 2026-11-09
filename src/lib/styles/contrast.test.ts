import { describe, expect, it } from 'vitest';

function luminance(hex: string): number {
	const value = hex.replace('#', '');
	const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
	const linear = channels.map((channel) =>
		channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
	);
	return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string, background: string): number {
	const a = luminance(foreground);
	const b = luminance(background);
	const lighter = Math.max(a, b);
	const darker = Math.min(a, b);
	return (lighter + 0.05) / (darker + 0.05);
}

const parchment = '#F0E2C4';
const parchmentDeep = '#E2CEA6';

describe('text palette', () => {
	it('keeps every text colour at 4.5:1 on parchment', () => {
		for (const colour of ['#6F5124', '#5B452C', '#3B2A1A', '#6E2F3A']) {
			expect(contrast(colour, parchment), colour).toBeGreaterThanOrEqual(4.5);
		}
	});

	it('keeps brass text readable on the deepest paper tint', () => {
		expect(contrast('#6F5124', parchmentDeep)).toBeGreaterThanOrEqual(4.5);
	});
});
