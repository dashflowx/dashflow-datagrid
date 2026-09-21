#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const free = readFileSync(join(root, 'src/free/index.ts'), 'utf8');
if (free.includes("from '../pro") || free.includes('src/pro')) {
  throw new Error('Free entry imports src/pro');
}
if (!existsSync(join(root, 'src/pro/index.tsx'))) {
  throw new Error('src/pro/index.tsx missing');
}
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if ((pkg.files || []).some((f) => String(f).includes('src'))) {
  throw new Error('package.json files must not ship src');
}
console.log('G05 ok: Pro is under src/pro; free entry does not import it');
