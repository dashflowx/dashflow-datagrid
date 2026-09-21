#!/usr/bin/env node
/**
 * Q02: pack the package in cwd (or argv[1]) and fail if Pro source / secrets leak.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cwd = process.argv[2] || process.cwd();
const dir = mkdtempSync(join(tmpdir(), 'dfx-pack-'));
try {
  const out = execSync('npm pack --pack-destination ' + JSON.stringify(dir), {
    cwd,
    encoding: 'utf8',
  }).trim();
  const tgz = out.split('\n').filter(Boolean).pop();
  const tgzPath = join(dir, tgz);
  const list = execSync(`tar -tzf ${JSON.stringify(tgzPath)}`, { encoding: 'utf8' });
  process.stdout.write(list);
  const bad = list.split('\n').filter((l) => /\/src\/pro\/|\.env$|\/node_modules\//.test(l));
  if (bad.length) {
    console.error('Forbidden paths in tarball:', bad.join('\n'));
    process.exit(1);
  }
  console.log('pack inspect ok:', tgz);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
