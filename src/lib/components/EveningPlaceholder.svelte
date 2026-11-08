<script lang="ts">
	import { TOTAL_DAYS } from '../data/chapters';
	import { advanceDay, game } from '../stores/game';

	const day = $derived($game.day);
	const quiet = $derived($game.quietDay);
	const served = $derived($game.servedToday);
	const lastDay = $derived(day >= TOTAL_DAYS);

	function closeShop(): void {
		advanceDay();
	}
</script>

<section class="evening paper" data-testid="evening" aria-labelledby="evening-title">
	<p class="hand kicker">the lamps are lit; the street empties</p>
	<h2 id="evening-title">Evening</h2>

	{#if quiet}
		<p>It was a quiet day. The kettle stayed warm and no one came to the counter.</p>
	{:else}
		<p>{served} visitors came to the shop today. You count the coins and bank the fire.</p>
	{/if}

	<p class="market-note">
		The evening market is not open yet. The stalls are still being built, and the street is patient.
	</p>

	<button class="close" type="button" onclick={closeShop}>Close up the shop</button>
	{#if lastDay}
		<p class="next-day">This was the last day. The ledger is closed.</p>
	{:else}
		<p class="next-day">Tomorrow will be day {day + 1}.</p>
	{/if}
</section>

<style>
	.evening {
		margin-top: 0.9rem;
		padding: 1.1rem;
		border: 1px solid rgba(59, 42, 26, 0.22);
		border-radius: 7px 18px 8px 16px;
	}

	.kicker {
		margin: 0 0 0.2rem;
		color: var(--brass);
		font-size: 1.15rem;
		line-height: 1;
	}

	h2 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
	}

	p {
		margin: 0 0 0.6rem;
		color: var(--ink-soft);
		line-height: 1.45;
	}

	.market-note {
		padding-top: 0.55rem;
		border-top: 1px solid rgba(59, 42, 26, 0.15);
		font-size: 0.92rem;
		opacity: 0.85;
	}

	.close {
		width: 100%;
		min-height: 48px;
		margin-top: 0.35rem;
		padding: 0.6rem 1rem;
		border: 1px solid rgba(62, 74, 58, 0.65);
		border-radius: 4px 10px 4px 10px;
		background: var(--green);
		color: var(--parchment);
		font-size: 1.05rem;
		letter-spacing: 0.04em;
	}

	.next-day {
		margin: 0.55rem 0 0;
		font-family: 'Caveat', cursive;
		font-size: 1.2rem;
		color: var(--brass);
		text-align: center;
	}
</style>
