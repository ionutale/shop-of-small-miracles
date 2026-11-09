<script lang="ts">
	import { tick } from 'svelte';
	import { trapFocus } from '../actions/trapFocus';
	import { playSound } from '../game/sound';
	import { appInstalled, installPrompt } from '../stores/install';
	import { game, resetGame, setReduceMotion, setSound } from '../stores/game';
	import ScreenShell from './ScreenShell.svelte';

	let confirming = $state(false);
	let installedNow = $state(false);
	let resetTrigger = $state<HTMLButtonElement | undefined>();
	let installed = $derived(
		typeof window !== 'undefined' &&
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(display-mode: standalone)').matches
	);

	async function clearShop(): Promise<void> {
		resetGame();
		confirming = false;
		await tick();
		resetTrigger?.focus();
	}

	async function cancelReset(): Promise<void> {
		confirming = false;
		await tick();
		resetTrigger?.focus();
	}

	function toggleSound(enabled: boolean): void {
		setSound(enabled);
		if (enabled) playSound('chime');
	}

	async function install(): Promise<void> {
		const prompt = $installPrompt;
		if (!prompt) return;
		try {
			await prompt.prompt();
			await prompt.userChoice;
			installedNow = true;
		} catch {
			// The browser may decline; the button simply disappears.
		} finally {
			installPrompt.set(null);
		}
	}
</script>

<ScreenShell title="Settings" kicker="the small dials behind the counter">
	<section class="block" aria-labelledby="comfort-title">
		<h2 id="comfort-title">Comfort</h2>

		<label class="toggle">
			<input
				id="sound-toggle"
				name="sound"
				type="checkbox"
				checked={$game.settings.sound}
				onchange={(event) => toggleSound(event.currentTarget.checked)}
			/>
			<span>
				<span class="toggle-title">Sound</span>
				<span class="toggle-note">Paper, glass, and a chime made by the browser, not a file.</span>
			</span>
		</label>

		<label class="toggle">
			<input
				id="motion-toggle"
				name="motion"
				type="checkbox"
				checked={$game.settings.reduceMotion}
				onchange={(event) => setReduceMotion(event.currentTarget.checked)}
			/>
			<span>
				<span class="toggle-title">Reduce motion</span>
				<span class="toggle-note">Still the candle, the steam, and the page turns.</span>
			</span>
		</label>

		<p class="note">Both settings are remembered with the shop.</p>
	</section>

	<section class="block" aria-labelledby="install-title">
		<h2 id="install-title">Keep the shop close</h2>
		{#if installed || $appInstalled || installedNow}
			<p>This shop is already installed. It will open without a browser bar and work offline.</p>
		{:else}
			<p>
				Add this shop to your home screen from your browser menu. After the first visit it opens
				without a network, like a paper book on a shelf.
			</p>
			{#if $installPrompt}
				<button class="install" type="button" onclick={install}>Install the shop</button>
			{/if}
		{/if}
		<p class="note">No app store, no account, and no download.</p>
	</section>

	<section class="block" aria-labelledby="progress-title">
		<h2 id="progress-title">Progress</h2>
		{#if confirming}
			<div class="backdrop">
				<div
					class="dialog paper"
					role="dialog"
					aria-modal="true"
					aria-labelledby="reset-title"
					aria-describedby="reset-note"
					use:trapFocus={{ onEscape: cancelReset }}
				>
					<h3 id="reset-title">Reset all progress?</h3>
					<p id="reset-note">
						This clears the save, the recipe book, every choice, and the ledger. It cannot be
						undone.
					</p>
					<div class="actions">
						<button class="quiet" type="button" onclick={cancelReset}>Keep my shop</button>
						<button class="danger" type="button" onclick={clearShop}>Yes, clear the shop</button>
					</div>
				</div>
			</div>
		{:else}
			<p>Start again from a single hydrogen atom and an empty ledger.</p>
			<button
				class="danger"
				type="button"
				bind:this={resetTrigger}
				onclick={() => (confirming = true)}
			>
				Reset all progress
			</button>
		{/if}
	</section>

	<section class="block about" aria-labelledby="about-title">
		<h2 id="about-title">About</h2>
		<p>
			A Shop of Small Miracles is a storybook shop sim about brewing small kindnesses for a cold
			town. Every portrait, tag icon, and mark is drawn by the page itself.
		</p>
		<p class="note">No accounts, no trackers. Your shop lives in this browser and nowhere else.</p>
	</section>
</ScreenShell>

<style>
	.block {
		margin: 0 0 1.1rem;
		padding: 1rem 1.05rem 1.1rem;
		border: 1px solid rgba(59, 42, 26, 0.2);
		border-radius: 5px 14px 6px 12px;
		background: rgba(255, 255, 255, 0.2);
	}

	h2 {
		margin: 0 0 0.6rem;
		font-size: 1.45rem;
	}

	h3 {
		margin: 0 0 0.45rem;
		font-size: 1.3rem;
	}

	.backdrop {
		position: fixed;
		z-index: 40;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(36, 26, 18, 0.55);
	}

	.dialog {
		width: min(100%, 28rem);
		padding: 1.2rem 1.1rem;
		border: 1px solid rgba(59, 42, 26, 0.3);
		border-radius: 6px 18px 8px 15px;
	}

	.dialog:focus-visible {
		outline: 3px solid var(--burgundy);
		outline-offset: 4px;
	}

	p {
		margin: 0 0 0.55rem;
		line-height: 1.5;
	}

	.toggle {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		min-height: 48px;
		padding: 0.45rem 0;
		cursor: pointer;
	}

	.toggle + .toggle {
		border-top: 1px dashed rgba(59, 42, 26, 0.2);
	}

	.toggle input {
		width: 22px;
		height: 22px;
		margin-top: 0.15rem;
		accent-color: var(--burgundy);
		flex: none;
	}

	.toggle-title {
		display: block;
		font-size: 1.05rem;
	}

	.toggle-note {
		display: block;
		color: var(--ink-soft);
		font-size: 0.9rem;
		line-height: 1.35;
	}

	.actions {
		display: grid;
		gap: 0.5rem;
	}

	button {
		width: 100%;
		min-height: 48px;
		padding: 0.55rem 0.9rem;
		border: 1px solid rgba(59, 42, 26, 0.35);
		border-radius: 4px 9px 4px 9px;
		background: rgba(255, 255, 255, 0.3);
		color: var(--ink);
		font-size: 1rem;
	}

	button.danger {
		border-color: rgba(110, 47, 58, 0.5);
		color: var(--burgundy);
	}

	button.quiet {
		border-style: dashed;
	}

	.note {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.92rem;
	}

	.about p:last-child {
		margin-bottom: 0;
	}
</style>
