<script lang="ts">
	import ScreenShell from './ScreenShell.svelte';

	let { onStart, onSettings }: { onStart: () => void; onSettings: () => void } = $props();
</script>

<ScreenShell title="A Shop of Small Miracles" kicker="a candlelit shop at the edge of a cold town">
	<div class="title-page">
		<p class="lede">
			Keep the shop for <strong>21 days</strong>. Serve three visitors a day, pay the rent, and
			choose what the shop becomes.
		</p>

		<p class="rule">
			A potion is three ingredients; their <strong>main essences</strong> must cover the customer’s two
			tags. One can be doubled.
		</p>

		<div class="actions">
			<button class="primary" type="button" onclick={onStart}>Enter the shop</button>
			<button type="button" onclick={onSettings}>Settings</button>
		</div>

		<p class="note">
			A short letter from the old alchemist is waiting under the door. No accounts, no trackers, and
			the shop works offline after the first visit.
		</p>
	</div>
</ScreenShell>

<style>
	.title-page {
		display: grid;
		gap: 1rem;
		max-width: 34rem;
		padding: 1.1rem 1.05rem 1.2rem;
		border: 1px solid rgba(59, 42, 26, 0.2);
		border-radius: 6px 18px 8px 15px;
		background: rgba(255, 255, 255, 0.18);
	}

	.rule {
		margin: 0;
		padding: 0.6rem 0.75rem;
		border-left: 2px solid rgba(176, 138, 79, 0.6);
		border-radius: 0 8px 8px 0;
		background: rgba(255, 255, 255, 0.16);
		color: var(--ink-soft);
		font-size: 0.95rem;
		line-height: 1.45;
	}

	.lede {
		margin: 0;
		font-size: 1.08rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}

	.actions {
		display: grid;
		gap: 0.55rem;
	}

	button {
		width: 100%;
		min-height: 48px;
		padding: 0.6rem 1rem;
		border: 1px solid rgba(59, 42, 26, 0.35);
		border-radius: 4px 10px 4px 10px;
		background: rgba(255, 255, 255, 0.3);
		color: var(--ink);
		font-size: 1rem;
	}

	button.primary {
		border-color: rgba(110, 47, 58, 0.5);
		background: rgba(232, 184, 106, 0.28);
		font-family: 'Caveat', cursive;
		font-size: 1.3rem;
		color: var(--burgundy);
	}

	.note {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.92rem;
		line-height: 1.45;
	}
</style>
