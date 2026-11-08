<script lang="ts">
	import { beatForDay, chapterForDay } from '../data/chapters';
	import { morningChoices, morningDue } from '../game/story';
	import { chooseStoryOption, dismissMorning, game } from '../stores/game';

	let chosen = $state<string | null>(null);

	const visible = $derived(Boolean(chosen) || morningDue($game));
	const chapter = $derived(chapterForDay($game.day));
	const beat = $derived(beatForDay($game.day));
	const choices = $derived(morningChoices($game));
	const chosenResult = $derived(
		chosen
			? (choices.flatMap((choice) => choice.options).find((option) => option.id === chosen)
					?.result ?? null)
			: null
	);

	function choose(optionId: string): void {
		chooseStoryOption(optionId);
		chosen = optionId;
	}

	function begin(): void {
		dismissMorning();
		chosen = null;
	}
</script>

{#if visible}
	<section class="beat paper" data-testid="day-beat" aria-label="Today’s story">
		<p class="hand beat-kicker">{chapter.title}</p>
		<p class="beat-text">{beat}</p>

		{#if chosen}
			{#if chosenResult}
				<p class="result" role="status">{chosenResult}</p>
			{/if}
			<button class="begin" type="button" onclick={begin}>Begin the day</button>
		{:else if choices.length > 0}
			{#each choices as choice (choice.id)}
				<div class="choice">
					<p class="prompt">{choice.prompt}</p>
					<div class="options">
						{#each choice.options as option (option.id)}
							<button class="option" type="button" onclick={() => choose(option.id)}>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			<button class="begin" type="button" onclick={begin}>Begin the day</button>
		{/if}
	</section>
{/if}

<style>
	.beat {
		margin: 0 0 0.85rem;
		padding: 0.65rem 0.85rem 0.8rem;
		border-left: 2px solid rgba(176, 138, 79, 0.55);
		border-radius: 0 8px 8px 0;
		background: rgba(255, 255, 255, 0.16);
	}

	.beat-kicker {
		margin: 0 0 0.1rem;
		color: var(--brass);
		font-size: 1.15rem;
		line-height: 1.1;
	}

	.beat-text {
		margin: 0;
		font-size: 0.98rem;
		line-height: 1.4;
		color: var(--ink-soft);
	}

	.choice {
		margin-top: 0.7rem;
	}

	.prompt {
		margin: 0 0 0.45rem;
		font-size: 1.05rem;
		line-height: 1.35;
		color: var(--ink);
	}

	.options {
		display: grid;
		gap: 0.4rem;
	}

	.option,
	.begin {
		width: 100%;
		min-height: 48px;
		padding: 0.5rem 0.8rem;
		border: 1px solid rgba(110, 47, 58, 0.4);
		border-radius: 4px 10px 4px 10px;
		background: rgba(255, 255, 255, 0.3);
		color: var(--ink);
		font-size: 1rem;
		line-height: 1.3;
		text-align: left;
	}

	.option {
		font-family: 'Caveat', cursive;
		font-size: 1.15rem;
		color: var(--burgundy);
	}

	.begin {
		margin-top: 0.6rem;
		text-align: center;
	}

	.result {
		margin: 0.6rem 0 0;
		padding-top: 0.55rem;
		border-top: 1px dashed rgba(110, 47, 58, 0.35);
		color: var(--ink-soft);
		font-size: 0.98rem;
		line-height: 1.4;
	}
</style>
