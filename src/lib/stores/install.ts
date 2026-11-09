import { writable } from 'svelte/store';

export interface InstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: string }>;
}

export const installPrompt = writable<InstallPromptEvent | null>(null);

/**
 * Ask the browser to hold its install prompt until the settings screen offers
 * it. Returns a cleanup function for the layout's mounted lifetime.
 */
export function captureInstallPrompt(): () => void {
	if (typeof window === 'undefined') return () => {};

	const handler = (event: Event) => {
		event.preventDefault();
		installPrompt.set(event as InstallPromptEvent);
	};

	window.addEventListener('beforeinstallprompt', handler);
	return () => window.removeEventListener('beforeinstallprompt', handler);
}
