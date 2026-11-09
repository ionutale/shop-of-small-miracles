<script lang="ts">
	import type { ElementRecord } from '../types';

	let {
		entries,
		disabled = false,
		onPick
	}: {
		entries: readonly { element: ElementRecord; units: number }[];
		disabled?: boolean;
		onPick: (elementId: string) => void;
	} = $props();
</script>

<section class="shelf" aria-labelledby="shelf-title">
	<div class="shelf-head">
		<h2 id="shelf-title">The shelf</h2>
		<p class="hand">tap an essence to place it in the cauldron</p>
	</div>

	<ul class="elements">
		{#each entries as { element, units } (element.id)}
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
					<span class="essence">{element.primary}</span>
					<span class="units">{units} left</span>
				</button>
			</li>
		{/each}
	</ul>
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
