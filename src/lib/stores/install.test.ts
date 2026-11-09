import { get } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	appInstalled,
	captureInstallPrompt,
	installPrompt,
	type InstallPromptEvent
} from './install';

let cleanup: (() => void) | null = null;

afterEach(() => {
	cleanup?.();
	cleanup = null;
	installPrompt.set(null);
	appInstalled.set(false);
});

describe('install prompt', () => {
	it('captures the browser prompt and releases the listener', () => {
		cleanup = captureInstallPrompt();

		const event = new Event('beforeinstallprompt') as InstallPromptEvent;
		event.prompt = vi.fn(async () => {});
		event.userChoice = Promise.resolve({ outcome: 'accepted' });
		window.dispatchEvent(event);

		expect(get(installPrompt)).toBe(event);

		cleanup();
		cleanup = null;
		installPrompt.set(null);
		window.dispatchEvent(event);

		expect(get(installPrompt)).toBeNull();
	});

	it('adopts a prompt captured before the app mounted', () => {
		const event = new Event('beforeinstallprompt') as InstallPromptEvent;
		event.prompt = vi.fn(async () => {});
		event.userChoice = Promise.resolve({ outcome: 'accepted' });
		window.__deferredInstallPrompt = event;

		cleanup = captureInstallPrompt();

		expect(get(installPrompt)).toBe(event);
		window.__deferredInstallPrompt = null;
	});

	it('clears the prompt when the app is installed', () => {
		cleanup = captureInstallPrompt();
		const event = new Event('beforeinstallprompt') as InstallPromptEvent;
		event.prompt = vi.fn(async () => {});
		event.userChoice = Promise.resolve({ outcome: 'accepted' });
		window.dispatchEvent(event);
		expect(get(installPrompt)).toBe(event);

		window.dispatchEvent(new Event('appinstalled'));

		expect(get(installPrompt)).toBeNull();
		expect(get(appInstalled)).toBe(true);
	});

	it('ignores a missing window', () => {
		const original = globalThis.window;
		// @ts-expect-error simulate a server-side module load.
		delete globalThis.window;
		try {
			expect(() => captureInstallPrompt()()).not.toThrow();
		} finally {
			globalThis.window = original;
		}
	});
});
