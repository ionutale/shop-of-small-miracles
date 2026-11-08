<script lang="ts">
	let { seed = 1, label = 'Ink portrait' }: { seed?: number; label?: string } = $props();

	const hair = $derived(seed % 4);
	const jaw = $derived(Math.floor(seed / 4) % 3);
	const tilt = $derived(((seed % 7) - 3) * 0.9);
	const shoulders = $derived(jaw === 0 ? 'M18 112 Q60 82 102 112' : 'M14 112 Q60 76 106 112');
	const face = $derived(
		jaw === 0
			? 'M44 42 Q44 20 60 20 Q76 20 76 42 L76 62 Q76 84 60 88 Q44 84 44 62 Z'
			: jaw === 1
				? 'M42 44 Q42 18 60 18 Q80 20 78 44 L77 65 Q75 88 60 90 Q45 88 43 65 Z'
				: 'M45 40 Q48 18 60 18 Q74 18 76 40 L74 66 Q72 86 60 88 Q48 86 46 66 Z'
	);
</script>

<svg viewBox="0 0 120 120" role="img" aria-label={label} class="portrait">
	<circle cx="60" cy="62" r="52" fill="rgba(232, 184, 106, 0.18)" />
	<g
		transform={`rotate(${tilt} 60 60)`}
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d={face} />
		<path d={shoulders} opacity="0.8" />
		{#if hair === 0}
			<path d="M43 38 Q46 14 64 16 Q80 18 77 40 Q70 26 58 26 Q48 28 43 38" fill="currentColor" />
		{:else if hair === 1}
			<path d="M42 42 Q48 14 72 16 Q84 20 78 44 L74 32 Q62 22 48 30 Z" fill="currentColor" />
			<path d="M76 46 Q86 56 80 68" />
		{:else if hair === 2}
			<path
				d="M42 40 Q48 12 66 18 Q70 8 78 12 Q84 30 76 46 Q68 28 54 30 Q46 32 42 40"
				fill="currentColor"
			/>
		{:else}
			<path d="M40 46 Q42 20 60 18 Q80 20 80 46" stroke-width="4" />
		{/if}
		<path d="M51 52 q3 -3 6 0" />
		<path d="M65 52 q3 -3 6 0" />
		<path d="M56 68 q4 3 8 0" />
	</g>
</svg>

<style>
	.portrait {
		display: block;
		width: 100%;
		height: auto;
		color: var(--ink);
	}
</style>
