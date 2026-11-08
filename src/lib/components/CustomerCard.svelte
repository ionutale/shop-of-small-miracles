<script lang="ts">
	import type { CharacterRecord, VisitRecord } from '../types';
	import InkPortrait from './InkPortrait.svelte';
	import TagChip from './TagChip.svelte';

	let {
		visit,
		character,
		onDecline
	}: {
		visit: VisitRecord;
		character: CharacterRecord | null;
		onDecline?: () => void;
	} = $props();
</script>

<article class="customer paper" aria-labelledby="customer-name">
	<div class="portrait-frame">
		<InkPortrait seed={character?.portraitSeed ?? 1} label={character?.name ?? 'A visitor'} />
	</div>

	<div class="words">
		<p class="hand eyebrow">A visitor, just before dusk</p>
		<h2 id="customer-name">{character?.name ?? 'A stranger'}</h2>
		<p class="request" data-testid="customer-request">{visit.request}</p>

		<div class="tags" aria-label="Requested essences">
			{#each visit.tags as tag (tag)}
				<TagChip {tag} />
			{/each}
		</div>

		{#if onDecline}
			<button class="decline" type="button" onclick={onDecline}>Politely decline</button>
		{/if}
	</div>
</article>

<style>
	.customer {
		display: grid;
		grid-template-columns: 74px minmax(0, 1fr);
		gap: 0.9rem;
		align-items: start;
		padding: 1rem;
		border-radius: 6px 18px 8px 16px;
		border: 1px solid rgba(59, 42, 26, 0.18);
	}

	.portrait-frame {
		padding: 0.2rem;
		border: 1px solid rgba(176, 138, 79, 0.55);
		border-radius: 50% 46% 52% 48%;
		background: rgba(255, 255, 255, 0.2);
		overflow: hidden;
	}

	.words {
		min-width: 0;
	}

	.eyebrow {
		margin: 0 0 0.1rem;
		color: var(--brass);
		font-size: 1.12rem;
		line-height: 1;
	}

	h2 {
		margin: 0 0 0.45rem;
		font-size: 1.55rem;
		color: var(--ink);
	}

	.request {
		margin: 0 0 0.7rem;
		font-size: 1.04rem;
		line-height: 1.42;
		color: var(--ink-soft);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.decline {
		margin-top: 0.85rem;
		padding: 0.55rem 0.8rem;
		min-height: 44px;
		border: 1px solid rgba(110, 47, 58, 0.4);
		border-radius: 4px;
		background: transparent;
		color: var(--burgundy);
		font-family: 'Caveat', cursive;
		font-size: 1.18rem;
	}

	.decline:hover {
		background: rgba(110, 47, 58, 0.07);
	}

	@media (min-width: 620px) {
		.customer {
			grid-template-columns: 92px minmax(0, 1fr);
			padding: 1.2rem;
		}
	}
</style>
