import { writable } from 'svelte/store';

export interface InstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
	interface Window {
		/** Stashed by the inline script in app.html before Svelte boots. */
		__deferredInstallPrompt?: InstallPromptEvent | null;
	}
}

export const installPrompt = writable<InstallPromptEvent | null>(null);

/** Flips when the browser confirms the app is installed. */
export const appInstalled = writable(false);

/**
 * Adopt a prompt captured by the inline app.html script before Svelte booted,
 * and keep listening for later fires plus the installed confirmation. Returns
 * the cleanup for the layout's mounted lifetime.
 */
export function captureInstallPrompt(): () => void {
	if (typeof window === 'undefined') return () => {};

	const adopt = () => {
		const deferred = window.__deferredInstallPrompt;
		if (deferred) installPrompt.set(deferred);
	};

	const onAvailable = () => adopt();
	const onPrompt = (event: Event) => {
		event.preventDefault();
		window.__deferredInstallPrompt = event as InstallPromptEvent;
		installPrompt.set(event as InstallPromptEvent);
	};
	const onInstalled = () => {
		window.__deferredInstallPrompt = null;
		installPrompt.set(null);
		appInstalled.set(true);
	};

	adopt();
	window.addEventListener('beforeinstallprompt', onPrompt);
	window.addEventListener('shop-install-available', onAvailable);
	window.addEventListener('appinstalled', onInstalled);

	return () => {
		window.removeEventListener('beforeinstallprompt', onPrompt);
		window.removeEventListener('shop-install-available', onAvailable);
		window.removeEventListener('appinstalled', onInstalled);
	};
}
