<script lang="ts">
	import { characterById } from '../data/characters';
	import { relationshipHint } from '../game/book';
	import { selectEnding } from '../game/story';
	import { game, resetGame } from '../stores/game';
	import type { ArcId } from '../types';

	const ARCS: readonly ArcId[] = ['widow', 'merchant', 'apprentice'];

	const ending = $derived(selectEnding($game));
	const cast = $derived(
		ARCS.flatMap((arc) => {
			const character = characterById(arc);
			return character ? [{ character, value: $game.relationships[arc] ?? 0 }] : [];
		})
	);
</script>

<article class="ending paper" data-testid="ending-page" aria-labelledby="ending-title">
	<p class="hand kicker">day {$game.day} · the last page</p>
	<h2 id="ending-title">{ending.title}</h2>
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

	<button class="new-game" type="button" onclick={() => resetGame()}>New game</button>
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

	.kicker {
		margin: 0 0 0.2rem;
		color: var(--brass);
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

	.name {
		font-size: 1.2rem;
		color: var(--burgundy);
	}

	.hint {
		color: var(--ink-soft);
		line-height: 1.4;
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
