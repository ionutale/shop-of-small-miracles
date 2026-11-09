<script lang="ts">
	import type { Tag } from '../types';
	import TagIcon from './TagIcon.svelte';

	let { tag, potent = false }: { tag: Tag; potent?: boolean } = $props();
</script>

<span class="tag" data-testid="tag-chip" class:potent>
	<span class="glyph"><TagIcon {tag} /></span>
	<span class="label">{tag}</span>
	{#if potent}<span class="potent-label">potent</span>{/if}
</span>

<style>
	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.6rem;
		border: 1px solid rgba(110, 47, 58, 0.35);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.28);
		color: var(--ink);
		font-size: 0.82rem;
		letter-spacing: 0.04em;
		line-height: 1.25;
		white-space: nowrap;
	}

	.glyph {
		display: inline-flex;
		color: var(--burgundy);
	}

	.potent {
		border-color: rgba(176, 138, 79, 0.7);
		background: rgba(232, 184, 106, 0.24);
	}

	.potent-label {
		font-family: 'Caveat', cursive;
		font-size: 0.82rem;
		color: var(--burgundy);
	}
</style>
