<script lang="ts">
	import { ELEMENT_BY_ID } from '../data/elements';
	import type { BrewOutcome, Tag } from '../types';

	let {
		customerName,
		tags,
		slots,
		result,
		suggested,
		onDismiss
	}: {
		customerName: string;
		tags: [Tag, Tag];
		slots: readonly string[];
		result: BrewOutcome | null;
		suggested: readonly string[] | null;
		onDismiss: () => void;
	} = $props();

	const names = $derived.by(() => {
		const counts: { id: string; count: number }[] = [];
		for (const id of suggested ?? []) {
			const found = counts.find((entry) => entry.id === id);
			if (found) found.count += 1;
			else counts.push({ id, count: 1 });
		}
		const list = counts.map(({ id, count }) => {
			const name = ELEMENT_BY_ID.get(id)?.name ?? id;
			return count > 1 ? `${name} × ${count}` : name;
		});
		if (list.length <= 1) return list[0] ?? '';
		return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
	});
	const step = $derived(result ? 3 : slots.length === 3 ? 2 : 1);
</script>

<aside class="coach" data-testid="first-day-coach" data-step={step} aria-labelledby="coach-title">
	<p class="hand kicker">your first customer</p>
	<h2 id="coach-title">A small miracle, step by step</h2>

	{#if result}
		{#if result.kind === 'clean'}
			<p>
				That is a <strong>clean miracle</strong>: both essences matched, so it pays fully and raises
				reputation. Press Next visitor.
			</p>
		{:else if result.kind === 'sideEffect'}
			<p>
				A <strong>muddy miracle</strong>: both essences matched, but an extra one changed the
				result. It still pays, just less. Press Next visitor.
			</p>
		{:else if result.tags.length === 0}
			<p>
				A <strong>gentle no</strong>. <strong>Nothing was consumed.</strong> When you are ready, try
				{#if names}{names}.{:else}three matching essences.{/if} Then press Next visitor.
			</p>
		{:else}
			<p>
				A <strong>gentle no</strong>. The ingredients were spent; nothing else was lost. Press Next
				visitor.
			</p>
		{/if}
	{:else if slots.length === 3}
		<p>Three essences are in the cauldron. Press <strong>Brew</strong>.</p>
	{:else}
		<p>
			{customerName} asks for <strong>{tags[0]} + {tags[1]}</strong>. Three ingredients brew a
			potion from their main essences; one is doubled.
		</p>
		{#if names}
			<p class="try">Try {names}.</p>
		{/if}
	{/if}

	<button class="dismiss" type="button" onclick={onDismiss}>Hide guide</button>
</aside>

<style>
	.coach {
		margin: 0 0 0.85rem;
		padding: 0.75rem 0.85rem 0.8rem;
		border: 1px solid rgba(176, 138, 79, 0.55);
		border-left-width: 3px;
		border-radius: 4px 14px 5px 12px;
		background:
			linear-gradient(115deg, rgba(232, 184, 106, 0.16), transparent 60%), rgba(255, 255, 255, 0.2);
	}

	.kicker {
		margin: 0 0 0.1rem;
		color: var(--brass-ink);
		font-size: 1.1rem;
		line-height: 1.1;
	}

	h2 {
		margin: 0 0 0.4rem;
		font-size: 1.25rem;
		line-height: 1.2;
	}

	p {
		margin: 0 0 0.4rem;
		font-size: 0.95rem;
		line-height: 1.45;
		color: var(--ink-soft);
	}

	.try {
		color: var(--burgundy);
	}

	.dismiss {
		min-height: 44px;
		margin-top: 0.2rem;
		padding: 0.4rem 0.8rem;
		border: 1px dashed rgba(59, 42, 26, 0.35);
		border-radius: 4px 9px 4px 9px;
		background: rgba(255, 255, 255, 0.28);
		color: var(--ink-soft);
		font-size: 0.9rem;
	}
</style>
