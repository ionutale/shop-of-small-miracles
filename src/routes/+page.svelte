<script lang="ts">
	import { onMount } from 'svelte';
	import ShopScreen from '../lib/components/ShopScreen.svelte';
	import { initGame } from '../lib/stores/game';

	onMount(() => {
		initGame();
	});
</script>

<ShopScreen />
