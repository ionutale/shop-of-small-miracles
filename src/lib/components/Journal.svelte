<script lang="ts">
	import { CHAPTERS, chapterForDay } from '../data/chapters';
	import { characterById } from '../data/characters';
	import { LETTERS, lettersUpTo } from '../data/letters';
	import { relationshipHint } from '../game/book';
	import { game } from '../stores/game';
	import type { ArcId } from '../types';
	import ScreenShell from './ScreenShell.svelte';

	const ARCS: readonly ArcId[] = ['widow', 'merchant', 'apprentice'];

	const today = $derived(chapterForDay($game.day));
	const chapters = $derived(
		CHAPTERS.filter((chapter) => chapter.number <= today.number).map((chapter) => ({
			...chapter,
			days: Object.entries(chapter.beats)
				.map(([day, text]) => ({ day: Number(day), text }))
				.filter((beat) => beat.day <= $game.day)
				.sort((a, b) => a.day - b.day)
		}))
	);
	const cast = $derived(
		ARCS.flatMap((id) => {
			const character = characterById(id);
			return character ? [{ character, value: $game.relationships[id] ?? 0 }] : [];
		})
	);
	const letters = $derived(lettersUpTo($game.day));
</script>

<ScreenShell title="The journal" kicker="the shop remembers what the ledger cannot hold">
	<p class="lede">
		Day {$game.day} of 21. Chapter {today.number} of 3. The journal is not a list of tasks; it is what
		the shop has lived through.
	</p>

	<section class="recap" aria-labelledby="recap-title">
		<h2 id="recap-title">What has happened</h2>
		{#each chapters as chapter (chapter.number)}
			<details open={chapter.number === today.number}>
				<summary>
					<span class="hand chapter-title" role="heading" aria-level="3">{chapter.title}</span>
					<span class="chapter-meta">Chapter {chapter.number}</span>
				</summary>
				<ol class="beats">
					{#each chapter.days as beat (beat.day)}
						<li><span class="day">Day {beat.day}</span> {beat.text}</li>
					{/each}
				</ol>
			</details>
		{/each}
	</section>

	<section class="cast" aria-labelledby="cast-title">
		<h2 id="cast-title">Recurring faces</h2>
		<ul class="cast-list">
			{#each cast as entry (entry.character.id)}
				<li class="face paper">
					<p class="name hand">{entry.character.name}</p>
					<p class="hint">{relationshipHint(entry.value)}</p>
				</li>
			{/each}
		</ul>
	</section>

	<section class="letters" aria-labelledby="letters-title">
		<h2 id="letters-title">Letters from the old alchemist</h2>
		<p class="note">{letters.length} of {LETTERS.length} letters received.</p>
		<ul class="letter-list">
			{#each letters as letter (letter.id)}
				<li class="letter paper deckle">
					<p class="letter-day">Left for day {letter.day}</p>
					<h3 class="hand">{letter.title}</h3>
					<p class="letter-body">{letter.body}</p>
				</li>
			{/each}
		</ul>
	</section>
</ScreenShell>

<style>
	.lede {
		margin: 0 0 1.25rem;
		color: var(--ink-soft);
		line-height: 1.5;
	}

	section {
		margin-bottom: 1.75rem;
	}

	h2 {
		margin: 0 0 0.55rem;
		font-size: 1.5rem;
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 1.3rem;
		color: var(--burgundy);
	}

	details {
		margin-bottom: 0.6rem;
		padding: 0.55rem 0.8rem;
		border: 1px solid rgba(59, 42, 26, 0.18);
		border-radius: 4px 12px 5px 10px;
		background: rgba(255, 255, 255, 0.22);
	}

	summary {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.25rem 0.75rem;
		min-height: 44px;
		padding: 0.35rem 0;
		cursor: pointer;
	}

	.chapter-title {
		font-size: 1.2rem;
		color: var(--burgundy);
	}

	.chapter-meta {
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.beats {
		margin: 0.5rem 0 0.35rem;
		padding-left: 1.1rem;
		list-style: decimal;
	}

	.beats li {
		margin-bottom: 0.45rem;
		line-height: 1.45;
	}

	.day {
		color: var(--brass-ink);
		font-size: 0.8rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.cast-list,
	.letter-list {
		display: grid;
		gap: 0.7rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.face,
	.letter {
		padding: 0.85rem 0.95rem;
		border: 1px solid rgba(59, 42, 26, 0.2);
		border-radius: 5px 14px 6px 12px;
	}

	.name {
		margin: 0 0 0.15rem;
		font-size: 1.25rem;
		color: var(--burgundy);
	}

	.hint {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.45;
	}

	.note {
		margin: 0 0 0.6rem;
		color: var(--ink-soft);
		font-size: 0.95rem;
	}

	.letter {
		background-image: repeating-linear-gradient(
			0deg,
			transparent 0 1.95rem,
			rgba(59, 42, 26, 0.09) 1.95rem 2rem
		);
	}

	.letter-day {
		margin: 0;
		color: var(--brass-ink);
		font-size: 0.78rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.letter-body {
		margin: 0;
		line-height: 1.5;
	}

	@media (min-width: 620px) {
		.cast-list {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
