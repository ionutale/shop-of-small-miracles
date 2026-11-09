<script lang="ts">
	import type { UpgradeRecord } from '../types';

	let {
		upgrade,
		owned,
		disabled,
		onBuy
	}: {
		upgrade: UpgradeRecord;
		owned: boolean;
		disabled: boolean;
		onBuy: () => void;
	} = $props();
</script>

<article class="upgrade" class:owned data-testid="upgrade-card">
	<header>
		<p class="hand price">{owned ? 'owned' : `${upgrade.cost} coins`}</p>
		{#if owned}<p class="badge">in the shop</p>{/if}
	</header>
	<h3>{upgrade.name}</h3>
	<p class="description">{upgrade.description}</p>
	<p class="effect">{upgrade.effect}</p>
	<button type="button" disabled={owned || disabled} onclick={onBuy}>
		Buy upgrade — {upgrade.name}
	</button>
</article>

<style>
	.upgrade {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.7rem 0.75rem;
		border: 1px solid rgba(59, 42, 26, 0.22);
		border-radius: 5px 13px 6px 11px;
		background: rgba(255, 255, 255, 0.28);
	}

	.upgrade.owned {
		border-color: rgba(62, 74, 58, 0.45);
		background: rgba(62, 74, 58, 0.08);
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.price {
		margin: 0;
		color: var(--brass-ink);
		font-size: 1.15rem;
		line-height: 1;
	}

	.badge {
		margin: 0;
		font-size: 0.64rem;
		letter-spacing: 0.08em;
		color: var(--green);
		text-transform: uppercase;
	}

	h3 {
		margin: 0;
		font-size: 1.08rem;
		line-height: 1.15;
	}

	.description {
		margin: 0;
		font-size: 0.86rem;
		line-height: 1.35;
		color: var(--ink-soft);
	}

	.effect {
		margin: 0 0 0.15rem;
		font-family: 'Caveat', cursive;
		font-size: 1.02rem;
		line-height: 1.2;
		color: var(--burgundy);
	}

	button {
		min-height: 44px;
		margin-top: auto;
		padding: 0.45rem 0.6rem;
		border: 1px solid rgba(62, 74, 58, 0.6);
		border-radius: 4px 9px 4px 9px;
		background: rgba(62, 74, 58, 0.9);
		color: var(--parchment);
		font-size: 0.9rem;
		line-height: 1.15;
	}

	button:disabled {
		border-color: rgba(59, 42, 26, 0.25);
		background: rgba(59, 42, 26, 0.12);
		color: var(--ink-soft);
	}
</style>
