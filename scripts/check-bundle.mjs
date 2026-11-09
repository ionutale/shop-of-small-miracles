import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 180;
const root = 'build/_app';
/** @type {string[]} */
const files = [];

/** @param {string} dir */
function walk(dir) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) walk(path);
		else if (entry.endsWith('.js')) files.push(path);
	}
}

try {
	walk(root);
} catch {
	console.error('No build found. Run `pnpm build` before `pnpm check:bundle`.');
	process.exit(1);
}

const total = files.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0);
const kb = total / 1024;
console.log(`Initial JS gzip: ${kb.toFixed(1)} KB across ${files.length} chunks`);

if (kb > BUDGET_KB) {
	console.error(`Budget exceeded: initial JS must stay at or below ${BUDGET_KB} KB gzip.`);
	process.exit(1);
}

console.log(`Within the ${BUDGET_KB} KB budget by ${(BUDGET_KB - kb).toFixed(1)} KB.`);
