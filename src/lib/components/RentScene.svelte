<script lang="ts">
	import { chapterForDay, rentDueOn } from '../data/chapters';
	import { game, leaveRentScene, settleRent } from '../stores/game';

	const chapter = $derived(chapterForDay($game.day));
	const rent = $derived(rentDueOn($game.day) ?? chapter.rent);
	const outcome = $derived($game.rentOutcome);

	function pay(): void {
		settleRent();
	}

	function leave(): void {
		leaveRentScene();
	}
</script>

<section
	class="rent paper"
	data-testid="rent-scene"
	aria-labelledby="rent-title"
	aria-live="polite"
>
	{#if outcome}
		<p class="hand kicker">the chapter ledger</p>
		<h2 id="rent-title">
			{outcome.kind === 'paid' ? 'Rent paid' : 'A setback, not an ending'}
		</h2>
		<p class="message">{outcome.message}</p>

		{#if outcome.kind === 'shortfall'}
			<ul class="stats" aria-label="The cost of the setback">
				<li><span>Coins</span> <strong>{$game.coins}</strong></li>
				<li><span>Reputation</span> <strong>{$game.reputation} / 10</strong></li>
				<li><span>Setbacks</span> <strong>{$game.setbacks}</strong></li>
			</ul>
			<p class="soft">Nothing has ended. The shop will open again, a little lighter than before.</p>
		{:else}
			<p class="soft">The tin holds {$game.coins} coins. The shop will open again tomorrow.</p>
		{/if}

		<button class="continue" type="button" onclick={leave}>Continue</button>
	{:else}
		<p class="hand kicker">the chapter ledger</p>
		<h2 id="rent-title">Rent is due</h2>
		<p>
			{chapter.title} closes tonight. The landlord’s man sets down his empty book and asks for
			<strong>{rent} coins</strong>.
		</p>
		<p class="purse">You have <strong>{$game.coins} coins</strong> in the tin.</p>

		{#if $game.coins < rent}
			<p class="warning">
				You are {rent - $game.coins} coins short. The shop will lose something tonight, but it will stay
				open.
			</p>
		{:else}
			<p class="soft">There is enough. The ledger can be cleared cleanly.</p>
		{/if}

		<button class="pay" type="button" onclick={pay}>Pay rent</button>
	{/if}
</section>

<style>
	.rent {
		margin-top: 0.9rem;
		padding: 1.15rem;
		border: 1px solid rgba(59, 42, 26, 0.24);
		border-radius: 6px 17px 7px 15px;
	}

	.kicker {
		margin: 0 0 0.25rem;
		color: var(--brass);
		font-size: 1.14rem;
		line-height: 1;
	}

	h2 {
		margin: 0 0 0.55rem;
		font-size: 1.7rem;
		line-height: 1;
		color: var(--ink);
	}

	p {
		margin: 0 0 0.6rem;
		color: var(--ink-soft);
		line-height: 1.45;
	}

	.message {
		font-size: 1.02rem;
		color: var(--ink);
	}

	.purse strong,
	p strong {
		color: var(--ink);
	}

	.warning {
		padding: 0.5rem 0.65rem;
		border-left: 2px solid var(--burgundy);
		background: rgba(110, 47, 58, 0.08);
		font-family: 'Caveat', cursive;
		font-size: 1.15rem;
		color: var(--burgundy);
	}

	.soft {
		font-size: 0.9rem;
		opacity: 0.85;
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.9rem;
		margin: 0.2rem 0 0.6rem;
		padding: 0.5rem 0.6rem;
		border-top: 1px solid rgba(59, 42, 26, 0.16);
		border-bottom: 1px solid rgba(59, 42, 26, 0.16);
		list-style: none;
	}

	.stats li {
		display: inline-flex;
		align-items: baseline;
		gap: 0.3rem;
		font-size: 0.72rem;
		letter-spacing: 0.05em;
		color: var(--ink-soft);
		text-transform: uppercase;
	}

	.stats strong {
		font-size: 1rem;
		letter-spacing: 0;
		color: var(--ink);
		text-transform: none;
	}

	button {
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
</style>
