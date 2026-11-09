<script lang="ts">
	import { rentDueOn, TOTAL_DAYS } from '../data/chapters';
	import { get } from 'svelte/store';
	import { ELEMENT_BY_ID } from '../data/elements';
	import { UPGRADES } from '../data/upgrades';
	import { offerPrice, shelfUnits } from '../game/economy';
	import { advanceDay, buyMarketOffer, game, purchaseUpgrade } from '../stores/game';
	import UpgradeCard from './UpgradeCard.svelte';

	let notice = $state('');
	const shelfTotal = $derived(shelfUnits($game.stock));
	const rentDue = $derived(rentDueOn($game.day));
	const lastDay = $derived($game.day >= TOTAL_DAYS);
	const offers = $derived(
		$game.market.map((offer, index) => ({
			offer,
			index,
			element: ELEMENT_BY_ID.get(offer.elementId),
			price: offerPrice(offer, $game.upgrades)
		}))
	);

	function buy(index: number): void {
		const offer = $game.market[index];
		const element = offer ? ELEMENT_BY_ID.get(offer.elementId) : null;
		const before = get(game).coins;
		buyMarketOffer(index);
		const after = get(game);
		if (element && after.coins < before) {
			notice = `Bought ${element.name} for ${before - after.coins} coins. ${after.coins} coins left.`;
		}
	}

	function closeShop(): void {
		advanceDay();
	}
</script>

<section class="evening" data-testid="evening" aria-labelledby="evening-title">
	<p class="visually-hidden" role="status" aria-live="polite" data-testid="market-announcer">
		{notice}
	</p>
	<p class="hand kicker">the lamps are lit; the street fills with stalls</p>
	<h2 id="evening-title">Evening</h2>

	{#if $game.quietDay}
		<p>It was a quiet day. The kettle stayed warm and no one came to the counter.</p>
	{:else}
		<p>
			{$game.servedToday} visitors came to the shop today. You count the coins and bank the fire.
		</p>
	{/if}

	<p class="ledger-line">
		<span data-testid="shelf-capacity">{shelfTotal} / {$game.shelfCapacity} units</span>
		on the shelf · <strong>{$game.coins} coins</strong> in the tin
	</p>

	<section class="market" aria-labelledby="market-title">
		<div class="section-head">
			<h3 id="market-title">The evening market</h3>
			<p class="hand">eight stalls, or as many as the street can hold</p>
		</div>

		{#if offers.length === 0}
			<p class="empty">The stalls have packed up for the night.</p>
		{:else}
			<ul class="offers">
				{#each offers as { offer, index, element, price } (offer.elementId)}
					{#if element}
						<li class="offer" data-testid="market-offer">
							<div class="offer-head">
								<span class="symbol" aria-hidden="true">{element.symbol}</span>
								<span class="name">{element.name}</span>
								<span class="price">
									{price} coins
									{#if price < offer.price}
										<span class="was">was {offer.price}</span>
									{/if}
								</span>
							</div>
							<p class="essences">{element.primary} · {element.secondary}</p>
							<p class="supply">{offer.units} of the day’s supply left</p>
							<button
								type="button"
								data-testid="buy-offer"
								disabled={offer.units <= 0 ||
									$game.coins < price ||
									shelfTotal >= $game.shelfCapacity}
								onclick={() => buy(index)}
							>
								{offer.units <= 0
									? `${element.name} — sold out`
									: `Buy ${element.name} for ${price} coins`}
							</button>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</section>

	<section class="upgrades" aria-labelledby="upgrades-title">
		<div class="section-head">
			<h3 id="upgrades-title">One thing for the shop</h3>
			<p class="hand">the evening allows a single improvement</p>
		</div>

		{#if $game.upgradeBoughtToday}
			<p class="empty">The shop has already made its one purchase tonight.</p>
		{/if}

		<div class="upgrade-grid">
			{#each UPGRADES as upgrade (upgrade.id)}
				<UpgradeCard
					{upgrade}
					owned={$game.upgrades.includes(upgrade.id)}
					disabled={$game.upgradeBoughtToday || $game.coins < upgrade.cost}
					onBuy={() => purchaseUpgrade(upgrade.id)}
				/>
			{/each}
		</div>
	</section>

	{#if rentDue !== null}
		<p class="rent-warning">The rent is due before you close: {rentDue} coins.</p>
	{/if}

	<button class="close" type="button" onclick={closeShop}>Close up the shop</button>
	{#if lastDay}
		<p class="next-day">This was the last day. The ledger is closed.</p>
	{:else}
		<p class="next-day">Tomorrow will be day {$game.day + 1}.</p>
	{/if}
</section>

<style>
	.evening {
		margin-top: 0.9rem;
		padding: 1.1rem;
		border: 1px solid rgba(59, 42, 26, 0.22);
		border-radius: 7px 18px 8px 16px;
		background:
			linear-gradient(115deg, rgba(255, 255, 255, 0.28), transparent 38%),
			radial-gradient(ellipse at 12% 18%, rgba(176, 138, 79, 0.12), transparent 48%),
			radial-gradient(ellipse at 88% 92%, rgba(110, 47, 58, 0.08), transparent 52%),
			var(--parchment);
		box-shadow:
			0 1px 2px var(--shadow),
			0 18px 50px rgba(0, 0, 0, 0.28);
	}

	.kicker {
		margin: 0 0 0.2rem;
		color: var(--brass-ink);
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

	.ledger-line {
		padding-top: 0.55rem;
		border-top: 1px solid rgba(59, 42, 26, 0.15);
		font-size: 0.9rem;
	}

	.ledger-line strong {
		color: var(--ink);
	}

	.section-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.15rem 0.8rem;
		margin: 0.9rem 0 0.5rem;
	}

	h3 {
		margin: 0;
		font-size: 1.22rem;
	}

	.section-head .hand {
		margin: 0;
		color: var(--brass-ink);
		font-size: 1.02rem;
		line-height: 1;
	}

	.offers {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.offer {
		display: flex;
		flex-direction: column;
		gap: 0.18rem;
		padding: 0.55rem 0.6rem;
		border: 1px solid rgba(59, 42, 26, 0.22);
		border-radius: 5px 12px 5px 10px;
		background: rgba(255, 255, 255, 0.3);
	}

	.offer-head {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: baseline;
		gap: 0.35rem;
	}

	.symbol {
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1;
		color: var(--burgundy);
	}

	.name {
		font-size: 0.84rem;
		line-height: 1.15;
		color: var(--ink);
	}

	.price {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--green);
		white-space: nowrap;
	}

	.was {
		display: block;
		font-size: 0.62rem;
		font-weight: 400;
		color: var(--ink-soft);
		text-decoration: line-through;
	}

	.essences {
		margin: 0;
		font-family: 'Caveat', cursive;
		font-size: 0.96rem;
		line-height: 1.05;
		color: var(--green);
	}

	.supply {
		margin: 0 0 0.25rem;
		font-size: 0.66rem;
		letter-spacing: 0.04em;
		color: var(--ink-soft);
	}

	.offer button {
		min-height: 44px;
		margin-top: auto;
		padding: 0.35rem 0.4rem;
		border: 1px solid rgba(62, 74, 58, 0.5);
		border-radius: 4px 9px 4px 9px;
		background: rgba(62, 74, 58, 0.1);
		color: var(--ink);
		font-size: 0.82rem;
	}

	.offer button:disabled {
		opacity: 0.45;
	}

	.upgrade-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	.empty {
		padding: 0.5rem 0;
		font-size: 0.9rem;
		color: var(--ink-soft);
	}

	.rent-warning {
		margin: 0.9rem 0 0;
		padding: 0.5rem 0.65rem;
		border-left: 2px solid var(--burgundy);
		background: rgba(110, 47, 58, 0.08);
		font-family: 'Caveat', cursive;
		font-size: 1.16rem;
		color: var(--burgundy);
	}

	.close {
		width: 100%;
		min-height: 48px;
		margin-top: 0.85rem;
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
		color: var(--brass-ink);
		text-align: center;
	}

	@media (min-width: 620px) {
		.offers {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.upgrade-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
