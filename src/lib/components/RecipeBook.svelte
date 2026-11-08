<script lang="ts">
	import { TAGS } from '../data/tags';
	import { namedPotionFor } from '../data/potions';
	import { bookEntries, filterBook } from '../game/book';
	import { game } from '../stores/game';
	import type { Tag } from '../types';
	import ScreenShell from './ScreenShell.svelte';
	import TagChip from './TagChip.svelte';

	let query = $state('');
	let tag = $state<Tag | ''>('');

	const entries = $derived(bookEntries($game.discovered));
	const activeTag = $derived(tag === '' ? null : tag);
	const named = $derived(
		filterBook(
			entries.filter((entry) => entry.named),
			query,
			activeTag
		)
	);
	const unfiled = $derived(
		filterBook(
			entries.filter((entry) => !entry.named),
			query,
			activeTag
		)
	);
	const filtering = $derived(query.trim().length > 0 || tag !== '');
	const shown = $derived(named.length + unfiled.length);

	function effectFor(tags: readonly Tag[]): string {
		return namedPotionFor(tags)?.effect ?? '';
	}
</script>

<ScreenShell title="The recipe book" kicker="everything the cauldron has taught the shop">
	<section class="intro" aria-label="Book summary">
		<p>
			{entries.length}
			{entries.length === 1 ? 'miracle' : 'miracles'} filed. Named potions keep their own page; everything
			else waits in the unfiled stack.
		</p>
	</section>

	<div class="controls">
		<label class="field">
			<span>Search the book</span>
			<input
				type="search"
				bind:value={query}
				placeholder="A name or an essence"
				autocomplete="off"
			/>
		</label>

		<label class="field">
			<span>Filter by essence</span>
			<select bind:value={tag}>
				<option value="">Every essence</option>
				{#each TAGS as essence (essence)}
					<option value={essence}>{essence}</option>
				{/each}
			</select>
		</label>
	</div>

	{#if entries.length === 0}
		<p class="empty paper" role="status">
			Nothing has been filed yet. Brew a clean potion and the book will remember it.
		</p>
	{:else if shown === 0}
		<p class="empty paper" role="status">No entry matches that search.</p>
	{:else}
		{#if named.length > 0}
			<section class="shelf" aria-labelledby="named-title">
				<h2 id="named-title">Named potions</h2>
				<ul class="entries">
					{#each named as entry (entry.name)}
						<li>
							<article class="entry paper" aria-label={entry.name}>
								<div class="entry-head">
									<h3 class="hand">{entry.name}</h3>
									<p class="day">First brewed on day {entry.day}</p>
								</div>
								<div class="tags">
									{#each entry.tags as essence (essence)}
										<TagChip tag={essence} />
									{/each}
								</div>
								<p class="effect">{effectFor(entry.tags)}</p>
							</article>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if unfiled.length > 0}
			<section class="shelf" aria-labelledby="unfiled-title">
				<h2 id="unfiled-title">Unfiled</h2>
				<p class="note">Combinations without a name yet. The shop describes them as best it can.</p>
				<ul class="entries">
					{#each unfiled as entry (entry.name)}
						<li>
							<article class="entry paper" aria-label={entry.name}>
								<div class="entry-head">
									<h3 class="hand">{entry.name}</h3>
									<p class="day">First brewed on day {entry.day}</p>
								</div>
								<div class="tags">
									{#each entry.tags as essence (essence)}
										<TagChip tag={essence} />
									{/each}
								</div>
							</article>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	{/if}

	{#if filtering && shown > 0}
		<p class="note" role="status">{shown} shown.</p>
	{/if}
</ScreenShell>

<style>
	.intro {
		margin-bottom: 1rem;
		color: var(--ink-soft);
	}

	.controls {
		display: grid;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.field {
		display: grid;
		gap: 0.25rem;
		font-size: 0.82rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	input,
	select {
		width: 100%;
		min-height: 44px;
		padding: 0.5rem 0.7rem;
		border: 1px solid rgba(59, 42, 26, 0.35);
		border-radius: 4px 9px 4px 9px;
		background: rgba(255, 255, 255, 0.35);
		font-size: 1rem;
		letter-spacing: normal;
		text-transform: none;
	}

	.shelf {
		margin-bottom: 1.5rem;
	}

	h2 {
		margin: 0 0 0.35rem;
		font-size: 1.5rem;
	}

	.note {
		margin: 0 0 0.6rem;
		color: var(--ink-soft);
		font-size: 0.95rem;
	}

	.entries {
		display: grid;
		gap: 0.8rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.entry {
		padding: 0.9rem 0.95rem 1rem;
		border: 1px solid rgba(59, 42, 26, 0.2);
		border-radius: 5px 14px 6px 12px;
		background-image: repeating-linear-gradient(
			0deg,
			transparent 0 1.95rem,
			rgba(59, 42, 26, 0.09) 1.95rem 2rem
		);
	}

	.entry-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.25rem 0.75rem;
	}

	h3 {
		margin: 0;
		font-size: 1.35rem;
		line-height: 1.2;
		color: var(--burgundy);
	}

	.day {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.78rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin: 0.55rem 0;
	}

	.effect {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.45;
	}

	.empty {
		padding: 1.1rem;
		border: 1px solid rgba(59, 42, 26, 0.2);
		border-radius: 6px 16px 7px 14px;
		color: var(--ink-soft);
	}

	@media (min-width: 620px) {
		.controls {
			grid-template-columns: 1fr 1fr;
			align-items: end;
		}

		.entries {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
