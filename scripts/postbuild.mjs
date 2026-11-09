import { copyFileSync, existsSync } from 'node:fs';

// Cloudflare Workers assets serve `/` from index.html. SvelteKit's static
// adapter emits the SPA shell as 200.html, so mirror it for the root request.
const build = 'build';
const shell = `${build}/200.html`;
const index = `${build}/index.html`;

if (!existsSync(shell)) {
	console.error('Missing build/200.html; run `pnpm build` first.');
	process.exit(1);
}

copyFileSync(shell, index);
console.log('Copied build/200.html to build/index.html for the Workers root.');
