<script lang="ts">
	import { onMount } from 'svelte';
	import { playSound } from '../lib/game/sound';
	import Journal from '../lib/components/Journal.svelte';
	import RecipeBook from '../lib/components/RecipeBook.svelte';
	import SettingsScreen from '../lib/components/SettingsScreen.svelte';
	import ShopScreen from '../lib/components/ShopScreen.svelte';
	import { game, initGame } from '../lib/stores/game';

	type Tab = 'shop' | 'book' | 'journal' | 'settings';

	const TABS: readonly { id: Tab; label: string }[] = [
		{ id: 'shop', label: 'Shop' },
		{ id: 'book', label: 'Recipe book' },
		{ id: 'journal', label: 'Journal' },
		{ id: 'settings', label: 'Settings' }
	];

	let tab = $state<Tab>('shop');

	function openTab(next: Tab): void {
		if (next === tab) return;
		tab = next;
		window.scrollTo({ top: 0 });
		playSound('paper');
	}

	onMount(() => {
		initGame();
	});

	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.classList.toggle('reduce-motion', $game.settings.reduceMotion);
	});
</script>

<div class="screen" hidden={tab !== 'shop'}>
	<ShopScreen />
</div>
<div class="screen" hidden={tab !== 'book'}>
	<RecipeBook />
</div>
<div class="screen" hidden={tab !== 'journal'}>
	<Journal />
</div>
<div class="screen" hidden={tab !== 'settings'}>
	<SettingsScreen />
</div>

<nav class="tabs" aria-label="Shop pages">
	{#each TABS as item (item.id)}
		<button
			type="button"
			class:active={tab === item.id}
			aria-current={tab === item.id ? 'page' : undefined}
			onclick={() => openTab(item.id)}
		>
			{item.label}
		</button>
	{/each}
</nav>

<style>
	.tabs {
		position: fixed;
		z-index: 20;
		bottom: 0;
		left: 50%;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		width: min(100%, 760px);
		padding: 0.35rem 0.4rem calc(0.35rem + env(safe-area-inset-bottom));
		border-top: 1px solid rgba(59, 42, 26, 0.28);
		background: rgba(226, 206, 166, 0.96);
		box-shadow: 0 -10px 26px rgba(36, 26, 18, 0.22);
		transform: translateX(-50%);
		backdrop-filter: blur(6px);
	}

	.tabs button {
		min-height: 48px;
		padding: 0.4rem 0.3rem;
		border: 0;
		border-radius: 4px 10px 4px 10px;
		background: transparent;
		color: var(--ink-soft);
		font-family: 'Caveat', cursive;
		font-size: 1.08rem;
		letter-spacing: 0.01em;
	}

	.tabs button.active {
		background: rgba(255, 255, 255, 0.42);
		color: var(--burgundy);
		box-shadow: inset 0 0 0 1px rgba(110, 47, 58, 0.28);
	}

	@media (min-width: 620px) {
		.tabs {
			bottom: 1rem;
			border: 1px solid rgba(59, 42, 26, 0.28);
			border-radius: 8px 18px 8px 14px;
		}
	}
</style>
