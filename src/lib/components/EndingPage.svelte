<script lang="ts">
	import { onMount } from 'svelte';
	import { characterById } from '../data/characters';
	import { relationshipHint } from '../game/book';
	import { selectEnding } from '../game/story';
	import { game, resetGame } from '../stores/game';
	import type { ArcId } from '../types';

	const ARCS: readonly ArcId[] = ['widow', 'merchant', 'apprentice'];

	let heading = $state<HTMLHeadingElement | undefined>();
	let confirming = $state(false);

	const ending = $derived(selectEnding($game));
	const cast = $derived(
		ARCS.flatMap((arc) => {
			const character = characterById(arc);
			return character ? [{ character, value: $game.relationships[arc] ?? 0 }] : [];
		})
	);
	const mercies = $derived(
		[
			$game.flags.includes('helpedWidow')
				? 'The widow’s step is swept before the town wakes.'
				: null,
			$game.flags.includes('readTheLetter')
				? 'The old alchemist’s last letter is folded into the ledger.'
				: null,
			$game.flags.includes('saltDebt')
				? 'The salt merchant’s box is still under the counter, waiting for morning.'
				: null
		].filter((line): line is string => line !== null)
	);

	onMount(() => heading?.focus());
</script>

<article class="ending paper deckle" data-testid="ending-page" aria-labelledby="ending-title">
	<span class="wax-seal ending-seal" aria-hidden="true"></span>
	<p class="hand kicker">day {$game.day} · the last page</p>
	<h2 id="ending-title" tabindex="-1" bind:this={heading}>{ending.title}</h2>
	<p class="chose">The shop chose to be…</p>
	<p class="epilogue">{ending.epilogue}</p>

	<h3>What stayed</h3>
	<ul class="cast">
		{#each cast as entry (entry.character.id)}
			<li data-testid="ending-relationship">
				<span class="hand name">{entry.character.name}</span>
				<span class="hint">{relationshipHint(entry.value)}</span>
			</li>
		{/each}
	</ul>

	{#if mercies.length > 0}
		<h3>Small mercies</h3>
		<ul class="mercies">
			{#each mercies as line (line)}
				<li>{line}</li>
			{/each}
		</ul>
	{/if}

	{#if confirming}
		<p class="confirm-note">
			Start again from day one? The shop, the book, and the journal will be cleared.
		</p>
		<div class="confirm-actions">
			<button class="new-game quiet" type="button" onclick={() => (confirming = false)}>
				Keep this ending
			</button>
			<button class="new-game danger" type="button" onclick={() => resetGame()}>
				Yes, start over
			</button>
		</div>
	{:else}
		<button class="new-game" type="button" onclick={() => (confirming = true)}>New game</button>
	{/if}
</article>

<style>
	.ending {
		margin: 0.5rem 0 0;
		padding: 1.2rem 1.05rem 1.3rem;
		border: 1px solid rgba(59, 42, 26, 0.22);
		border-radius: 6px 18px 8px 15px;
		background:
			linear-gradient(160deg, rgba(255, 255, 255, 0.32), transparent 55%), rgba(255, 255, 255, 0.14);
	}

	.ending-seal {
		position: absolute;
		top: 0.8rem;
		right: 0.9rem;
		width: 1.7rem;
		height: 1.7rem;
		font-size: 0.9rem;
	}

	.kicker {
		margin: 0 0 0.2rem;
		color: var(--brass-ink);
		font-size: 1.12rem;
	}

	h2 {
		margin: 0 0 0.7rem;
		font-size: clamp(1.75rem, 7vw, 2.4rem);
		line-height: 1.05;
		color: var(--ink);
	}

	.chose {
		margin: 0 0 0.25rem;
		color: var(--burgundy);
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.epilogue {
		margin: 0 0 1.1rem;
		font-size: 1.05rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}

	h3 {
		margin: 0 0 0.45rem;
		font-size: 1.35rem;
	}

	.cast {
		display: grid;
		gap: 0.5rem;
		margin: 0 0 1.1rem;
		padding: 0;
		list-style: none;
	}

	.cast li {
		display: grid;
		gap: 0.1rem;
		padding: 0.5rem 0.7rem;
		border-left: 2px solid rgba(176, 138, 79, 0.55);
		background: rgba(255, 255, 255, 0.16);
	}

	.mercies {
		display: grid;
		gap: 0.35rem;
		margin: 0 0 1.1rem;
		padding-left: 1.1rem;
		color: var(--ink-soft);
		line-height: 1.4;
	}

	.name {
		font-size: 1.2rem;
		color: var(--burgundy);
	}

	.hint {
		color: var(--ink-soft);
		line-height: 1.4;
	}

	.confirm-note {
		margin: 0 0 0.55rem;
		color: var(--ink-soft);
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.confirm-actions {
		display: grid;
		gap: 0.5rem;
	}

	.new-game.quiet {
		border-style: dashed;
	}

	.new-game.danger {
		border-color: rgba(110, 47, 58, 0.5);
		color: var(--burgundy);
	}

	.new-game {
		width: 100%;
		min-height: 48px;
		padding: 0.55rem 1rem;
		border: 1px solid rgba(59, 42, 26, 0.35);
		border-radius: 4px 9px 4px 9px;
		background: rgba(255, 255, 255, 0.28);
		color: var(--ink);
		font-size: 1.02rem;
	}
</style>
