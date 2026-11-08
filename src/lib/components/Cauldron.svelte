<script lang="ts">
	import { ELEMENT_BY_ID } from '../data/elements';

	let {
		slots,
		onRemove
	}: {
		slots: readonly string[];
		onRemove: (index: number) => void;
	} = $props();
</script>

<div class="cauldron-block">
	<div class="cauldron" aria-label="Cauldron">
		{#each [0, 1, 2] as index (index)}
			{@const id = slots[index]}
			{@const element = id ? ELEMENT_BY_ID.get(id) : null}
			{@const label = element
				? `Remove ${element.name} from the cauldron`
				: `Empty cauldron slot ${index + 1}`}
			<button
				type="button"
				class="slot"
				class:filled={Boolean(element)}
				aria-label={label}
				disabled={!element}
				onclick={() => element && onRemove(index)}
			>
				{#if element}
					<span class="symbol">{element.symbol}</span>
					<span class="name">{element.name}</span>
					<span class="hint">tap to remove</span>
				{:else}
					<span class="empty-mark" aria-hidden="true">+</span>
					<span class="hint">a place for an essence</span>
				{/if}
			</button>
		{/each}
	</div>
	<p class="hand cauldron-note">
		Three essences make a small miracle. A doubled essence makes it strong.
	</p>
</div>

<style>
	.cauldron-block {
		margin: 0.75rem 0;
	}

	.cauldron {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.4rem;
		padding: 0.65rem;
		border: 1px solid rgba(59, 42, 26, 0.32);
		border-radius: 44% 44% 18px 18px / 22px 22px 18px 18px;
		background:
			radial-gradient(ellipse at 50% 10%, rgba(232, 184, 106, 0.24), transparent 60%),
			rgba(59, 42, 26, 0.08);
		box-shadow: inset 0 6px 18px rgba(59, 42, 26, 0.12);
	}

	.slot {
		display: flex;
		min-height: 78px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.1rem;
		padding: 0.35rem;
		border: 1px dashed rgba(59, 42, 26, 0.35);
		border-radius: 999px;
		background: rgba(240, 226, 196, 0.42);
		color: var(--ink);
	}

	.slot.filled {
		border-style: solid;
		border-color: rgba(110, 47, 58, 0.45);
		background: rgba(255, 255, 255, 0.38);
	}

	.slot:disabled {
		opacity: 0.66;
	}

	.symbol {
		font-size: 1.35rem;
		font-weight: 700;
		line-height: 1;
		color: var(--burgundy);
	}

	.name {
		font-size: 0.72rem;
		line-height: 1.1;
		text-align: center;
	}

	.empty-mark {
		font-size: 1.4rem;
		color: var(--brass);
		line-height: 1;
	}

	.hint {
		font-size: 0.58rem;
		letter-spacing: 0.04em;
		color: var(--ink-soft);
		opacity: 0.8;
	}

	.cauldron-note {
		margin: 0.4rem 0 0;
		text-align: center;
		font-size: 1.06rem;
		color: var(--brass);
	}
</style>
