<script lang="ts">
	import { TAGS } from '../data/tags';
	import type { ElementRecord, Tag } from '../types';
	import TagIcon from './TagIcon.svelte';

	let {
		entries,
		disabled = false,
		onPick
	}: {
		entries: readonly { element: ElementRecord; units: number }[];
		disabled?: boolean;
		onPick: (elementId: string) => void;
	} = $props();

	let essence = $state<Tag | ''>('');

	const visible = $derived(
		essence === ''
			? entries
			: entries.filter(
					({ element }) => element.primary === essence || element.secondary === essence
				)
	);
</script>

<section class="shelf" aria-labelledby="shelf-title">
	<div class="shelf-head">
		<h2 id="shelf-title">The shelf</h2>
		<p class="hand">tap an essence to place it in the cauldron</p>
	</div>

	<div class="filters" role="group" aria-label="Filter the shelf by essence">
		<button
			type="button"
			class="filter"
			class:active={essence === ''}
			aria-pressed={essence === ''}
			onclick={() => (essence = '')}
		>
			All essences
		</button>
		{#each TAGS as tag (tag)}
			<button
				type="button"
				class="filter"
				class:active={essence === tag}
				aria-pressed={essence === tag}
				onclick={() => (essence = essence === tag ? '' : tag)}
			>
				<TagIcon {tag} size={14} />
				{tag}
			</button>
		{/each}
	</div>

	<ul class="elements">
		{#each visible as { element, units } (element.id)}
			<li>
				<button
					type="button"
					class="element"
					class:empty={units === 0}
					disabled={disabled || units === 0}
					onclick={() => onPick(element.id)}
				>
					<span class="symbol">{element.symbol}</span>
					<span class="name">{element.name}</span>
					<span class="essence">{element.primary} · {element.secondary}</span>
					<span class="units">{units} left</span>
				</button>
			</li>
		{/each}
	</ul>

	{#if visible.length === 0}
		<p class="empty-shelf">No element on the shelf carries that essence yet.</p>
	{/if}
</section>

<style>
	.shelf {
		margin-top: 0.35rem;
	}

	.shelf-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.2rem 0.8rem;
		margin-bottom: 0.45rem;
	}

	h2 {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--ink);
	}

	.shelf-head p {
		color: var(--brass-ink);
		font-size: 1rem;
		line-height: 1;
	}

	.filters {
		display: flex;
		gap: 0.35rem;
		margin: 0 0 0.55rem;
		padding: 0 0 0.3rem;
		overflow-x: auto;
		scrollbar-width: thin;
	}

	.filter {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		gap: 0.3rem;
		padding: 0.35rem 0.65rem;
		border: 1px solid rgba(59, 42, 26, 0.28);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.28);
		color: var(--ink-soft);
		font-size: 0.82rem;
		white-space: nowrap;
	}

	.filter.active {
		border-color: rgba(110, 47, 58, 0.55);
		background: rgba(232, 184, 106, 0.28);
		color: var(--burgundy);
	}

	.empty-shelf {
		margin: 0.5rem 0 0;
		color: var(--ink-soft);
	}

	.elements {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.element {
		display: grid;
		width: 100%;
		min-height: 76px;
		grid-template-rows: auto auto auto;
		gap: 0.05rem;
		justify-items: start;
		padding: 0.5rem 0.55rem;
		border: 1px solid rgba(59, 42, 26, 0.24);
		border-radius: 5px 11px 5px 9px;
		background: rgba(255, 255, 255, 0.3);
		color: var(--ink);
		text-align: left;
		transition:
			transform 160ms ease,
			background 160ms ease;
	}

	.element:hover:not(:disabled) {
		transform: translateY(-1px);
		background: rgba(255, 255, 255, 0.5);
	}

	.element:disabled {
		opacity: 0.45;
	}

	.symbol {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
		color: var(--burgundy);
	}

	.name {
		font-size: 0.76rem;
		line-height: 1.15;
	}

	.essence {
		font-family: 'Caveat', cursive;
		font-size: 0.96rem;
		line-height: 1;
		color: var(--green);
	}

	.units {
		font-size: 0.62rem;
		letter-spacing: 0.05em;
		color: var(--ink-soft);
	}

	@media (min-width: 620px) {
		.elements {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
</style>
