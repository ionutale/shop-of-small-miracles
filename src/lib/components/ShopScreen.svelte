<script lang="ts">
	import { chapterForDay, rentDueOn, TOTAL_DAYS, VISITS_PER_DAY } from '../data/chapters';
	import { characterById, visitById } from '../data/characters';
	import { ELEMENTS } from '../data/elements';
	import { namePotion } from '../data/potions';
	import { ownedUpgrades } from '../data/upgrades';
	import { brewTags, judgeBrew } from '../game/brew';
	import { playSound } from '../game/sound';
	import {
		brew,
		decline,
		finishService,
		game,
		nextCustomer,
		recovered,
		swapCustomer
	} from '../stores/game';
	import BrewPreview from './BrewPreview.svelte';
	import Cauldron from './Cauldron.svelte';
	import CustomerCard from './CustomerCard.svelte';
	import EndingPage from './EndingPage.svelte';
	import IngredientShelf from './IngredientShelf.svelte';
	import MarketScreen from './MarketScreen.svelte';
	import MorningScene from './MorningScene.svelte';
	import RentScene from './RentScene.svelte';

	let slots = $state<string[]>([]);

	const visit = $derived(visitById($game.activeVisitId));
	const character = $derived(visit ? characterById(visit.characterId) : null);
	const result = $derived($game.lastResult);
	const chapter = $derived(chapterForDay($game.day));
	const visitorNumber = $derived(
		$game.quietDay
			? $game.servedToday
			: Math.min($game.servedToday + (result ? 0 : 1), VISITS_PER_DAY)
	);
	const shelf = $derived(
		ELEMENTS.map((element) => ({
			element,
			units: $game.stock.find((entry) => entry.elementId === element.id)?.units ?? 0
		}))
	);
	const preview = $derived.by(() => {
		if (!visit || slots.length !== 3) return null;
		const brewed = brewTags(slots, ELEMENTS);
		return judgeBrew(brewed, visit, $game.reputation, ownedUpgrades($game.upgrades));
	});
	const canBrewNow = $derived(slots.length === 3);
	const namedPotion = $derived(
		preview && $game.upgrades.includes('cauldron') ? namePotion(preview.tags) : null
	);
	const canSwap = $derived(
		$game.phase === 'service' &&
			$game.upgrades.includes('ledger') &&
			!$game.swappedToday &&
			!result &&
			Boolean(visit)
	);
	const announcement = $derived.by(() => {
		if ($game.rentOutcome) return $game.rentOutcome.message;
		if (!result) return '';
		let text = result.line;
		if (result.pay > 0) text += ` Payment: ${result.pay} coins.`;
		if (result.reputationDelta > 0) text += ' Reputation up.';
		if (result.reputationDelta < 0) text += ' Reputation down.';
		return text;
	});
	const showingEnding = $derived(
		$game.phase === 'ending' ||
			($game.phase === 'chapterEnd' &&
				$game.day >= TOTAL_DAYS &&
				$game.flags.includes('ledgerClosed'))
	);

	function pick(elementId: string): void {
		if (slots.length >= 3 || result || !visit) return;
		playSound('glass');
		slots = [...slots, elementId];
	}

	function remove(index: number): void {
		slots = slots.filter((_, slot) => slot !== index);
	}

	function handleBrew(): void {
		if (!canBrewNow) return;
		brew(slots);
		playSound($game.lastResult?.kind === 'clean' ? 'chime' : 'paper');
		slots = [];
	}

	function handleDecline(): void {
		decline();
		playSound('paper');
		slots = [];
	}

	function handleNext(): void {
		nextCustomer();
		playSound('paper');
		slots = [];
	}

	function handleEvening(): void {
		finishService();
		slots = [];
	}

	function handleSwap(): void {
		swapCustomer();
		slots = [];
	}
</script>

<div class="shop" data-phase={$game.phase}>
	<div class="candle" aria-hidden="true">
		<span class="flame"></span>
		<span class="wax"></span>
	</div>

	<main class="inner">
		<p class="visually-hidden" role="status" aria-live="polite" data-testid="announcer">
			{announcement}
		</p>

		{#if $recovered}
			<div class="recovery" role="status">
				<p>The old save could not be read. The shop starts fresh.</p>
				<button type="button" onclick={() => recovered.set(false)}>Dismiss</button>
			</div>
		{/if}

		<header class="masthead">
			<p class="hand kicker">at the edge of a cold town, a small light is kept</p>
			<h1 id="shop-title" tabindex="-1">A Shop of Small Miracles</h1>
			<div class="status" role="group" aria-label="Shop status">
				<p class="stat"><span>Day</span> <strong>{$game.day}</strong></p>
				<p class="stat"><span>Chapter</span> <strong>{chapter.number}</strong></p>
				{#if !showingEnding}
					<p class="stat">
						<span>Visitors</span>
						<strong data-testid="visitor-count">{visitorNumber} of {VISITS_PER_DAY}</strong>
					</p>
				{/if}
				<p class="stat"><span>Coins</span> <strong>{$game.coins} coins</strong></p>
				<p class="stat">
					<span>Reputation</span> <strong>{$game.reputation} / 10</strong>
				</p>
			</div>
		</header>

		{#if !$game.rentOutcome}
			<MorningScene />
		{/if}

		{#if $game.rentOutcome}
			<RentScene />
		{:else if showingEnding}
			<EndingPage />
		{:else if $game.phase === 'market'}
			<MarketScreen />
		{:else if $game.phase === 'chapterEnd'}
			{#if rentDueOn($game.day) !== null}
				<RentScene />
			{:else}
				<section class="interlude paper" data-testid="interlude" aria-labelledby="interlude-title">
					<p class="hand quiet-kicker">the last of the candle</p>
					<h2 id="interlude-title">The ledger is closed</h2>
					<p>The shop is quiet for the night. Whatever comes next is written tomorrow.</p>
				</section>
			{/if}
		{:else}
			<section class="service" aria-label="Today’s service">
				{#if visit && character}
					<CustomerCard {visit} {character} onDecline={result ? undefined : handleDecline} />

					{#if canSwap}
						<button class="swap" type="button" onclick={handleSwap}>
							Ask the ledger for another visitor
						</button>
					{/if}

					{#if result}
						<section class="result paper" data-testid="result">
							<p class="hand verdict">
								{result.kind === 'clean'
									? 'A clean miracle'
									: result.kind === 'sideEffect'
										? 'A muddy miracle'
										: 'A gentle no'}
							</p>
							<p class="line">{result.line}</p>

							{#if result.pay > 0}
								<p class="payment">Payment: {result.pay} coins</p>
							{/if}
							{#if result.reputationDelta > 0}
								<p class="reputation">Reputation +{result.reputationDelta}.</p>
							{:else if result.reputationDelta < 0}
								<p class="reputation">Reputation −1.</p>
							{:else if result.refunded}
								<p class="reputation muted">The apprentice returned the ingredients.</p>
							{:else if result.tags.length === 0}
								<p class="reputation muted">Nothing was consumed.</p>
							{:else}
								<p class="reputation muted">The ingredients were spent.</p>
							{/if}

							{#if result.potionName}
								<p class="filed">
									Filed in the recipe book: <span class="hand">{result.potionName}</span>
								</p>
							{/if}

							<button class="next" type="button" onclick={handleNext}>
								{$game.servedToday >= VISITS_PER_DAY ? 'Evening' : 'Next visitor'}
							</button>
						</section>
					{:else}
						<Cauldron {slots} onRemove={remove} />
						<IngredientShelf entries={shelf} disabled={slots.length >= 3} onPick={pick} />
						<BrewPreview
							{preview}
							potionName={namedPotion}
							enabled={canBrewNow}
							onBrew={handleBrew}
						/>
					{/if}
				{:else}
					<section class="quiet paper" aria-labelledby="quiet-title">
						<p class="hand quiet-kicker">the kettle, the dust, the last of the light</p>
						<h2 id="quiet-title">The shop is quiet</h2>
						<p>
							No one else comes today. You bank the fire, wipe the counter, and let the room settle
							around you.
						</p>
						<button class="next" type="button" onclick={handleEvening}>Evening</button>
					</section>
				{/if}
			</section>
		{/if}
	</main>
</div>

<style>
	.shop {
		position: relative;
		min-height: 100dvh;
		max-width: 760px;
		margin: 0 auto;
		padding: calc(2.7rem + env(safe-area-inset-top)) 1rem calc(5.5rem + env(safe-area-inset-bottom));
		overflow: hidden;
		background:
			linear-gradient(115deg, rgba(255, 255, 255, 0.26), transparent 40%),
			radial-gradient(ellipse at 50% 0%, rgba(232, 184, 106, 0.3), transparent 46%),
			radial-gradient(ellipse at 88% 94%, rgba(110, 47, 58, 0.08), transparent 52%),
			var(--parchment);
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4);
	}

	.shop::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.2;
		background-image:
			repeating-linear-gradient(0deg, transparent 0 3px, rgba(59, 42, 26, 0.06) 3px 4px),
			repeating-linear-gradient(90deg, transparent 0 5px, rgba(59, 42, 26, 0.05) 5px 6px);
		mix-blend-mode: multiply;
		z-index: 0;
	}

	.inner {
		position: relative;
		z-index: 1;
	}

	.candle {
		position: absolute;
		top: 0.75rem;
		right: 1.25rem;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.wax {
		display: block;
		width: 0.55rem;
		height: 2.1rem;
		border-radius: 3px 3px 2px 2px;
		background: linear-gradient(180deg, #f4e5c0, #d8c095);
		box-shadow: 0 1px 3px rgba(59, 42, 26, 0.35);
	}

	.flame {
		display: block;
		width: 0.55rem;
		height: 0.95rem;
		margin-bottom: 0.12rem;
		border-radius: 50% 50% 46% 46% / 62% 62% 38% 38%;
		background: radial-gradient(circle at 50% 68%, #fff7d6 0 18%, var(--candle) 46%, #d9832f 78%);
		box-shadow:
			0 0 12px 4px rgba(232, 184, 106, 0.65),
			0 0 38px 14px rgba(232, 184, 106, 0.2);
		animation: flicker 2.8s ease-in-out infinite;
	}

	@keyframes flicker {
		0%,
		100% {
			transform: scale(1) translateX(0);
			opacity: 1;
		}
		35% {
			transform: scale(1.06, 0.95) translateX(0.4px);
			opacity: 0.9;
		}
		68% {
			transform: scale(0.96, 1.08) translateX(-0.4px);
			opacity: 0.96;
		}
	}

	.masthead {
		margin-bottom: 1rem;
	}

	.recovery {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0 0 0.8rem;
		padding: 0.5rem 0.7rem;
		border: 1px solid rgba(110, 47, 58, 0.4);
		border-radius: 4px 10px 4px 10px;
		background: rgba(110, 47, 58, 0.08);
		font-size: 0.92rem;
	}

	.recovery p {
		flex: 1;
		margin: 0;
	}

	.recovery button {
		min-height: 44px;
		padding: 0.35rem 0.7rem;
		border: 1px solid rgba(59, 42, 26, 0.35);
		border-radius: 4px 8px 4px 8px;
		background: rgba(255, 255, 255, 0.35);
	}

	.kicker {
		margin: 0 0 0.15rem;
		color: var(--brass-ink);
		font-size: 1.2rem;
		line-height: 1.1;
	}

	h1 {
		max-width: 12ch;
		font-size: clamp(2.1rem, 10vw, 3rem);
		line-height: 0.94;
		letter-spacing: -0.015em;
		color: var(--ink);
	}

	.status {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.9rem;
		margin-top: 0.75rem;
		padding-top: 0.55rem;
		border-top: 1px solid rgba(59, 42, 26, 0.18);
	}

	.stat {
		display: inline-flex;
		align-items: baseline;
		gap: 0.32rem;
		margin: 0;
		font-size: 0.82rem;
		letter-spacing: 0.04em;
		color: var(--ink-soft);
		text-transform: uppercase;
	}

	.stat strong {
		font-family: 'Cormorant Garamond', serif;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: 0;
		color: var(--ink);
		text-transform: none;
	}

	.result {
		margin-top: 0.85rem;
		padding: 0.9rem 1rem;
		border-radius: 5px 14px 6px 12px;
		border: 1px solid rgba(176, 138, 79, 0.45);
	}

	.verdict {
		margin: 0 0 0.15rem;
		color: var(--burgundy);
		font-size: 1.35rem;
		line-height: 1;
	}

	.line {
		margin: 0 0 0.65rem;
		font-size: 1.05rem;
		line-height: 1.42;
		color: var(--ink);
	}

	.payment,
	.reputation,
	.filed {
		margin: 0.15rem 0;
		font-size: 0.92rem;
		color: var(--ink-soft);
	}

	.payment {
		font-weight: 600;
		color: var(--green);
	}

	.filed .hand {
		font-size: 1.18rem;
		color: var(--burgundy);
	}

	.muted {
		color: var(--ink-soft);
	}

	.next {
		width: 100%;
		min-height: 46px;
		margin-top: 0.8rem;
		padding: 0.55rem 1rem;
		border: 1px solid rgba(59, 42, 26, 0.35);
		border-radius: 4px 9px 4px 9px;
		background: rgba(255, 255, 255, 0.28);
		color: var(--ink);
		font-size: 1.02rem;
	}

	.swap {
		width: 100%;
		min-height: 44px;
		margin-top: 0.55rem;
		padding: 0.45rem 0.8rem;
		border: 1px dashed rgba(110, 47, 58, 0.5);
		border-radius: 4px 9px 4px 9px;
		background: rgba(110, 47, 58, 0.06);
		color: var(--burgundy);
		font-family: 'Caveat', cursive;
		font-size: 1.12rem;
	}

	.quiet {
		padding: 1.2rem 1.1rem;
		border-radius: 6px 16px 7px 14px;
		border: 1px solid rgba(59, 42, 26, 0.2);
	}

	.interlude {
		margin-top: 0.9rem;
		padding: 1.2rem 1.1rem;
		border-radius: 6px 16px 7px 14px;
		border: 1px solid rgba(59, 42, 26, 0.2);
	}

	.interlude h2 {
		margin: 0 0 0.45rem;
		font-size: 1.6rem;
	}

	.interlude p:last-child {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.45;
	}

	.quiet-kicker {
		margin: 0 0 0.25rem;
		color: var(--brass-ink);
		font-size: 1.12rem;
		line-height: 1.1;
	}

	.quiet h2 {
		margin: 0 0 0.45rem;
		font-size: 1.6rem;
	}

	.quiet p:last-child {
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.45;
	}

	@media (min-width: 620px) {
		.shop {
			margin: 1.25rem auto;
			min-height: calc(100dvh - 2.5rem);
			padding: 3rem 2.2rem 3.2rem;
			border-radius: 4px 22px 6px 18px;
			border: 1px solid rgba(59, 42, 26, 0.25);
		}

		.masthead {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
			gap: 1rem;
		}

		.status {
			flex-direction: column;
			gap: 0.15rem;
			margin: 0;
			padding: 0.2rem 0 0.2rem 1rem;
			border-top: 0;
			border-left: 1px solid rgba(59, 42, 26, 0.18);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flame {
			animation: none;
		}
	}
</style>
