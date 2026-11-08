<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, kicker, children }: { title: string; kicker: string; children: Snippet } = $props();
</script>

<div class="page">
	<div class="candle" aria-hidden="true">
		<span class="flame"></span>
		<span class="wax"></span>
	</div>

	<main class="inner">
		<header class="masthead">
			<p class="hand kicker">{kicker}</p>
			<h1>{title}</h1>
		</header>

		{@render children()}
	</main>
</div>

<style>
	.page {
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

	.page::before {
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

	.masthead {
		margin-bottom: 1rem;
	}

	.kicker {
		margin: 0 0 0.2rem;
		color: var(--brass);
		font-size: 1.12rem;
		line-height: 1.1;
	}

	h1 {
		margin: 0;
		font-size: clamp(1.7rem, 7vw, 2.4rem);
		letter-spacing: -0.015em;
	}

	@keyframes flicker {
		0%,
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
		40% {
			transform: scale(0.94, 1.05) translateY(-1px);
			opacity: 0.9;
		}
		70% {
			transform: scale(1.04, 0.97) translateY(0);
			opacity: 0.96;
		}
	}

	@media (min-width: 620px) {
		.page {
			margin: 1.25rem auto;
			min-height: calc(100dvh - 2.5rem);
			padding: 3rem 2.2rem 3rem;
			border-radius: 4px 22px 6px 18px;
			border: 1px solid rgba(59, 42, 26, 0.25);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flame {
			animation: none;
		}
	}
</style>
