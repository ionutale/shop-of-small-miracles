<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { needRefresh, updateServiceWorker } = useRegisterSW();
</script>

{#if $needRefresh}
	<div class="pwa" role="status">
		<span>A new page is ready.</span>
		<button type="button" onclick={() => updateServiceWorker(true)}>Refresh</button>
		<button type="button" onclick={() => needRefresh.set(false)}>Later</button>
	</div>
{/if}

<style>
	.pwa {
		position: fixed;
		z-index: 50;
		right: 12px;
		bottom: calc(76px + env(safe-area-inset-bottom));
		left: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
		max-width: 536px;
		margin: 0 auto;
		padding: 10px 12px;
		border: 1px solid rgba(59, 42, 26, 0.4);
		border-radius: 4px 10px 4px 10px;
		background: var(--parchment);
		box-shadow: 0 8px 24px rgba(36, 26, 18, 0.3);
		color: var(--ink);
		font-size: 0.92rem;
	}

	span {
		flex: 1;
	}

	button {
		min-height: 44px;
		padding: 4px 10px;
		border: 1px solid rgba(59, 42, 26, 0.35);
		border-radius: 4px 8px 4px 8px;
		background: rgba(255, 255, 255, 0.35);
		color: var(--ink);
		font-size: 0.92rem;
	}
</style>
