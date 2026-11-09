<script lang="ts">
	import type { Tag } from '../types';

	let { tag, size = 16 }: { tag: Tag; size?: number } = $props();
</script>

<svg
	viewBox="0 0 16 16"
	width={size}
	height={size}
	class="icon"
	aria-hidden="true"
	focusable="false"
	fill="none"
	stroke="currentColor"
	stroke-width="1.4"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if tag === 'Light'}
		<circle cx="8" cy="8" r="3" />
		<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13" />
	{:else if tag === 'Still'}
		<circle cx="8" cy="8" r="5.5" />
		<path d="M4.5 8h7" />
	{:else if tag === 'Warm'}
		<path
			d="M8 2c2 2.4 3.5 4 3.5 6a3.5 3.5 0 0 1-7 0c0-1.4.7-2.5 1.8-3.6.3 1 .9 1.6 1.7 2 .2-1.6-.3-3-0.5-4.4Z"
		/>
	{:else if tag === 'Cold'}
		<path d="M8 2v12M3 5l10 6M13 5L3 11M8 2l-1.4 1.6M8 2l1.4 1.6M8 14l-1.4-1.6M8 14l1.4-1.6" />
	{:else if tag === 'Sharp'}
		<path d="M10.5 1.5 5.5 8.5h3L4.5 14.5l6-8h-3l3-5Z" />
	{:else if tag === 'Soft'}
		<path d="M4.2 12a2.7 2.7 0 0 1-.2-5.4A3.6 3.6 0 0 1 11 5.4a3 3 0 0 1 .5 6Z" />
	{:else if tag === 'Heavy'}
		<path d="M5 5h6l2 8H3l2-8Z" />
		<path d="M6 5V3.5a2 2 0 0 1 4 0V5" />
	{:else if tag === 'Dreaming'}
		<path d="M11.5 10.5A4.5 4.5 0 0 1 6 3.2a5 5 0 1 0 5.5 7.3Z" />
	{:else if tag === 'Bitter'}
		<path d="M8 14c3-2 4.5-4.2 4.5-7a4.5 4.5 0 0 0-9 0c0 2.8 1.5 5 4.5 7Z" />
		<path d="M8 5v4M6.5 7h3" />
	{:else if tag === 'Bright'}
		<path d="M8 1.5 9.5 6.5 14.5 8 9.5 9.5 8 14.5 6.5 9.5 1.5 8 6.5 6.5Z" />
	{:else if tag === 'Bound'}
		<circle cx="6" cy="8" r="3.2" />
		<circle cx="10" cy="8" r="3.2" />
	{:else if tag === 'Ground'}
		<path d="M1.5 13 5 7l2.2 3L9.5 5l5 8Z" />
		<path d="M1.5 13h13" />
	{:else if tag === 'Spark'}
		<path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l1.8 1.8M10.2 10.2 12 12M12 4l-1.8 1.8M5.8 10.2 4 12" />
		<circle cx="8" cy="8" r="1.4" />
	{:else if tag === 'Calm'}
		<path
			d="M1.5 6c1.6-1.6 3.2-1.6 4.8 0s3.2 1.6 4.8 0 2.4-1.4 3.4-0.6M1.5 10.5c1.6-1.6 3.2-1.6 4.8 0s3.2 1.6 4.8 0 2.4-1.4 3.4-0.6"
		/>
	{:else if tag === 'Cleanse'}
		<path d="M8 1.8c2.4 3 4 5 4 6.9a4 4 0 0 1-8 0c0-1.9 1.6-3.9 4-6.9Z" />
		<path d="M6.4 9.2c0 1 .7 1.7 1.6 1.9" />
	{:else if tag === 'Radiant'}
		<circle cx="8" cy="8" r="2.2" />
		<path
			d="M8 1v3M8 12v3M1 8h3M12 8h3M3.2 3.2 5.3 5.3M10.7 10.7l2.1 2.1M12.8 3.2l-2.1 2.1M5.3 10.7l-2.1 2.1"
		/>
	{:else if tag === 'Grief'}
		<path
			d="M8 13.5C4.5 11 2.5 9 2.5 6.4A2.9 2.9 0 0 1 8 4.7a2.9 2.9 0 0 1 5.5 1.7c0 2.6-2 4.6-5.5 7.1Z"
		/>
	{:else if tag === 'Hollow'}
		<circle cx="8" cy="8" r="6" />
		<circle cx="8" cy="8" r="3" stroke-dasharray="1.4 2.2" />
	{/if}
</svg>

<style>
	.icon {
		display: block;
		flex: none;
	}
</style>
