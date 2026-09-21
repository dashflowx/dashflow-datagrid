import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DATAGRID_REGISTRY,
  assertUniqueRegistryIds,
  editorPalette,
  isProEntry,
} from '../registry';

const require = createRequire(import.meta.url);
const coreRegistryPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../dashflowx-core/src/registry.ts'
);

describe('DATAGRID_REGISTRY', () => {
  it('has unique ids', () => {
    expect(() => assertUniqueRegistryIds(DATAGRID_REGISTRY)).not.toThrow();
    const ids = DATAGRID_REGISTRY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prefixes ids with datagrid.', () => {
    expect(DATAGRID_REGISTRY.every((e) => e.id.startsWith('datagrid.'))).toBe(true);
  });

  it('does not collide with CORE_REGISTRY ids', () => {
    expect(existsSync(coreRegistryPath)).toBe(true);
    const coreSrc = readFileSync(coreRegistryPath, 'utf8');
    const coreIds = new Set([...coreSrc.matchAll(/id: '(core\.[^']+)'/g)].map((m) => m[1]));
    expect(coreIds.size).toBeGreaterThan(0);
    for (const entry of DATAGRID_REGISTRY) {
      expect(coreIds.has(entry.id)).toBe(false);
    }
  });

  it('splits free vs pro for the editor palette', () => {
    const palette = editorPalette(DATAGRID_REGISTRY);
    expect(palette.length).toBe(DATAGRID_REGISTRY.length);
    expect(palette.filter(isProEntry).every((e) => e.tier === 'pro')).toBe(true);
    expect(DATAGRID_REGISTRY.filter((e) => e.tier === 'free').map((e) => e.id)).toEqual([
      'datagrid.table',
      'datagrid.grid',
    ]);
  });
});

describe('peer @dashflowx/core', () => {
  it('resolves the sibling package', () => {
    const resolved = require.resolve('@dashflowx/core');
    expect(resolved).toContain('@dashflowx/core');
  });
});
