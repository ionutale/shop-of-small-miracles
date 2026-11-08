import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	testMatch: '**/*.spec.ts',
	use: {
		baseURL: 'http://127.0.0.1:4320',
		viewport: { width: 390, height: 844 },
		isMobile: true,
		hasTouch: true
	},
	webServer: {
		// exec keeps the preview server as the direct child so Playwright can stop it
		// cleanly at the end of the run instead of leaving it holding the port.
		command: 'pnpm build && exec ./node_modules/.bin/vite preview --host 127.0.0.1 --port 4320',
		url: 'http://127.0.0.1:4320',
		reuseExistingServer: false,
		timeout: 180_000
	}
});
