import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { TAGS } from '../data/tags';
import InkPortrait from './InkPortrait.svelte';
import TagChip from './TagChip.svelte';
import TagIcon from './TagIcon.svelte';

describe('ink portrait', () => {
	it('is deterministic for a character seed', () => {
		const first = render(InkPortrait, { props: { seed: 12 } });
		const firstMarkup = first.container.innerHTML;
		first.unmount();

		const second = render(InkPortrait, { props: { seed: 12 } });

		expect(second.container.innerHTML).toBe(firstMarkup);
	});

	it('draws different portraits for different seeds', () => {
		const first = render(InkPortrait, { props: { seed: 12 } }).container.innerHTML;
		const second = render(InkPortrait, { props: { seed: 13 } }).container.innerHTML;

		expect(second).not.toBe(first);
	});

	it('is inline SVG with no external images', () => {
		const { container } = render(InkPortrait, { props: { seed: 7 } });

		expect(container.querySelector('svg')).not.toBeNull();
		expect(container.querySelector('img')).toBeNull();
		expect(container.innerHTML).not.toMatch(/https?:\/\//);
	});
});

describe('tag icons', () => {
	it('draws an inline icon for every one of the eighteen essences', () => {
		for (const tag of TAGS) {
			const { container, unmount } = render(TagIcon, { props: { tag } });
			const svg = container.querySelector('svg');
			expect(svg, tag).not.toBeNull();
			expect(svg?.querySelectorAll('path, circle, line, polyline').length, tag).toBeGreaterThan(0);
			expect(container.querySelector('img')).toBeNull();
			unmount();
		}
	});

	it('keeps a readable text label beside the icon on every chip', () => {
		for (const tag of TAGS) {
			const { unmount } = render(TagChip, { props: { tag } });
			expect(screen.getByText(tag)).toBeInTheDocument();
			unmount();
		}
	});
});
