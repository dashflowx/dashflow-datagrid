#!/usr/bin/env node
/**
 * @dashflowx/core is a file: sibling. Its dist is gitignored, so tsc fails
 * with TS2307 unless we build core first.
 */
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const formsRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const coreRoot = join(formsRoot, '../dashflowx-core');
const distJs = join(coreRoot, 'dist/index.es.js');
const distDts = join(coreRoot, 'dist/index.es.d.ts');

if (!existsSync(coreRoot)) {
  console.log('No sibling dashflowx-core; expecting @dashflowx/core from npm.');
  process.exit(0);
}

if (existsSync(distJs) && existsSync(distDts)) {
  console.log('Sibling @dashflowx/core dist is present.');
  process.exit(0);
}

console.log('Building sibling @dashflowx/core (dist missing)…');
execSync('yarn install --frozen-lockfile', { cwd: coreRoot, stdio: 'inherit' });
execSync('yarn build', { cwd: coreRoot, stdio: 'inherit' });
if (!existsSync(distJs)) {
  console.error('dashflowx-core build did not produce dist/index.es.js');
  process.exit(1);
}
