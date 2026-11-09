<script lang="ts">
	import type { BrewKind, Tag } from '../types';
	import TagChip from './TagChip.svelte';

	let {
		preview,
		potionName = null,
		enabled,
		onBrew
	}: {
		preview: {
			tags: Tag[];
			potency: Tag | null;
			kind: BrewKind;
			pay: number;
			extras: Tag[];
		} | null;
		potionName?: string | null;
		enabled: boolean;
		onBrew: () => void;
	} = $props();
</script>

<section class="preview" aria-labelledby="preview-title">
	<h2 id="preview-title">The cauldron turns</h2>

	{#if preview}
		<div class="tags">
			{#each preview.tags as tag (tag)}
				<TagChip {tag} potent={tag === preview.potency} />
			{/each}
		</div>

		{#if preview.potency}
			<p class="potency">Potent: {preview.potency}</p>
		{:else}
			<p class="potency muted">No doubled essence.</p>
		{/if}

		{#if preview.extras.length > 0}
			<p class="extra">Extra essences: {preview.extras.join(', ')}. The miracle will be muddy.</p>
		{/if}

		{#if potionName}
			<p class="named">The cauldron names it: <span class="hand">{potionName}</span></p>
		{/if}

		{#if preview.kind === 'decline'}
			<p class="pay muted">
				This would not answer the request. The ingredients would still be spent.
			</p>
		{:else if preview.kind === 'clean'}
			<p class="pay">A clean brew pays {preview.pay} coins.</p>
		{:else}
			<p class="pay">A muddy brew pays {preview.pay} coins.</p>
		{/if}
	{:else}
		<p class="muted">Choose three essences from the shelf.</p>
	{/if}

	<button class="brew" type="button" disabled={!enabled} onclick={onBrew}>Brew</button>
</section>

<style>
	.preview {
		margin-top: 0.75rem;
		padding: 0.8rem;
		border: 1px solid rgba(176, 138, 79, 0.35);
		border-radius: 10px 5px 12px 5px;
		background: rgba(232, 184, 106, 0.1);
	}

	h2 {
		margin-bottom: 0.45rem;
		font-size: 1.12rem;
		color: var(--ink);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 0.35rem;
	}

	.potency {
		margin: 0 0 0.25rem;
		font-family: 'Caveat', cursive;
		font-size: 1.12rem;
		color: var(--burgundy);
	}

	.pay {
		margin: 0 0 0.6rem;
		font-size: 0.94rem;
		color: var(--ink-soft);
	}

	.extra {
		margin: 0 0 0.35rem;
		font-size: 0.86rem;
		color: var(--burgundy);
	}

	.named {
		margin: 0 0 0.35rem;
		font-size: 0.9rem;
		color: var(--ink-soft);
	}

	.named .hand {
		font-size: 1.12rem;
		color: var(--burgundy);
	}

	.muted {
		color: var(--ink-soft);
	}

	.brew {
		width: 100%;
		min-height: 48px;
		padding: 0.6rem 1rem;
		border: 1px solid rgba(62, 74, 58, 0.65);
		border-radius: 4px 10px 4px 10px;
		background: var(--green);
		color: var(--parchment);
		font-size: 1.08rem;
		letter-spacing: 0.04em;
	}

	.brew:disabled {
		background: rgba(62, 74, 58, 0.35);
		border-color: transparent;
		color: rgba(240, 226, 196, 0.72);
	}
</style>
