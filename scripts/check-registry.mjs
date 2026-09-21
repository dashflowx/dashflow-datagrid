#!/usr/bin/env node
/**
 * G05: datagrid registry ids unique, prefixed, and not overlapping core.*
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/registry.ts'), 'utf8');
const ids = [...src.matchAll(/id: '(datagrid\.[^']+)'/g)].map((m) => m[1]);
const unique = new Set(ids);
if (unique.size !== ids.length) {
  throw new Error(`Duplicate datagrid registry ids: ${ids.length} vs ${unique.size}`);
}
if (ids.length < 2) {
  throw new Error('DATAGRID_REGISTRY must list free + pro rows');
}
if (ids.some((id) => !id.startsWith('datagrid.'))) {
  throw new Error('Datagrid ids must start with datagrid.');
}

const coreRegistry = join(root, '../dashflowx-core/src/registry.ts');
if (existsSync(coreRegistry)) {
  const coreSrc = readFileSync(coreRegistry, 'utf8');
  const coreIds = new Set([...coreSrc.matchAll(/id: '(core\.[^']+)'/g)].map((m) => m[1]));
  const overlap = ids.filter((id) => coreIds.has(id));
  if (overlap.length) {
    throw new Error(`Registry id overlap with core: ${overlap.join(', ')}`);
  }
}

console.log(`G05 ok: ${ids.length} datagrid registry rows, unique vs core`);
