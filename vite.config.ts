import adapter from '@sveltejs/adapter-static';
import { withPwa } from '@vite-pwa/sveltekit';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		...withPwa(
			{
				compilerOptions: {
					// Force runes mode for the project, except for libraries.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter({ fallback: '200.html' })
			},
			{
				registerType: 'prompt',
				pwaAssets: {
					preset: 'minimal-2023',
					image: 'static/favicon.svg',
					overrideManifestIcons: true
				},
				manifest: {
					name: 'A Shop of Small Miracles',
					short_name: 'Small Miracles',
					description: 'Brew small miracles in a candlelit shop at the edge of a cold town.',
					theme_color: '#F0E2C4',
					background_color: '#F0E2C4',
					display: 'standalone',
					orientation: 'portrait',
					start_url: '/',
					scope: '/'
				},
				generateSW: {
					globPatterns: ['client/**/*.{js,css,html,svg,png,ico,woff2}'],
					globStrict: false,
					navigateFallback: '/'
				},
				kit: {
					adapterFallback: '200.html',
					spa: { fallbackMapping: '/' },
					includeVersionFile: true
				}
			}
		),
		svelteTesting()
	],
	test: {
		expect: { requireAssertions: true },
		environment: 'jsdom',
		environmentOptions: { jsdom: { url: 'http://localhost:3000' } },
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.test.ts']
	}
});
