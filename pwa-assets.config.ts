import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	preset: {
		...minimal2023Preset,
		maskable: {
			...minimal2023Preset.maskable,
			resizeOptions: { background: '#F0E2C4' }
		},
		apple: {
			...minimal2023Preset.apple,
			resizeOptions: { background: '#F0E2C4' }
		}
	},
	images: ['static/favicon.svg']
});
