<script lang="ts">
	import { TOTAL_DAYS, VISITS_PER_DAY } from '../data/chapters';
	import { game } from '../stores/game';

	const ended = $derived(
		$game.phase === 'ending' ||
			($game.phase === 'chapterEnd' &&
				$game.day >= TOTAL_DAYS &&
				$game.flags.includes('ledgerClosed'))
	);
	const rentDay = $derived([7, 14, 21].find((day) => day >= $game.day) ?? null);
	const rentText = $derived(
		ended || rentDay === null
			? 'The last ledger is closed'
			: rentDay === $game.day
				? 'Rent due today'
				: `Rent in ${rentDay - $game.day} days`
	);
	const visitors = $derived(
		Math.min(
			VISITS_PER_DAY,
			$game.servedToday +
				($game.phase === 'service' && $game.activeVisitId && !$game.quietDay && !$game.lastResult
					? 1
					: 0)
		)
	);
</script>

<div class="goal" data-testid="goal-bar" role="group" aria-label="Today’s goal">
	<span>Day {$game.day} of {TOTAL_DAYS}</span>
	<span>{rentText}</span>
	{#if !ended}
		<span>Visitors {visitors} of {VISITS_PER_DAY}</span>
	{/if}
</div>

<style>
	.goal {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.85rem;
		margin: 0 0 0.7rem;
		padding: 0.35rem 0.7rem;
		border-left: 2px solid rgba(176, 138, 79, 0.55);
		border-radius: 0 8px 8px 0;
		background: rgba(255, 255, 255, 0.14);
		color: var(--ink-soft);
		font-size: 0.82rem;
		letter-spacing: 0.03em;
	}

	span + span::before {
		content: '·';
		margin-right: 0.85rem;
		color: var(--brass-ink);
	}
</style>
