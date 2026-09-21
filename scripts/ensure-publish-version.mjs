#!/usr/bin/env node
/**
 * If the package is not on the registry, set version to 1.0.0 (first create).
 * If this version was already published, bump past the highest published version.
 *
 * Usage: node scripts/ensure-publish-version.mjs <dir> <registry>
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FIRST = '1.0.0';
const dir = resolve(process.argv[2] || '.');
const registry = process.argv[3] || 'https://registry.npmjs.org';
const pkgPath = join(dir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const name = pkg.name;

function npmJson(args) {
  try {
    const out = execFileSync('npm', [...args, '--registry', registry, '--loglevel', 'error'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    }).trim();
    return out;
  } catch (e) {
    const err = `${e.stderr || ''}${e.stdout || ''}${e.message || ''}`;
    if (
      /E404|404 Not Found|not in this registry|code E404|is not in this registry|404 '@/i.test(
        err
      )
    ) {
      return '';
    }
    console.error(err);
    process.exit(1);
  }
}

function parseVer(v) {
  const [a, b, c] = String(v)
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  return [a, b, c];
}

function cmp(x, y) {
  const a = parseVer(x);
  const b = parseVer(y);
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function bumpPatch(v) {
  const [a, b, c] = parseVer(v);
  return `${a}.${b}.${c + 1}`;
}

function publishedVersions() {
  const raw = npmJson(['view', name, 'versions', '--json']);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (parsed) return [String(parsed)];
  } catch {
    return raw ? [raw] : [];
  }
  return [];
}

function writeVersion(next, reason) {
  pkg.version = next;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(reason);
}

const published = publishedVersions();
if (published.length === 0) {
  writeVersion(FIRST, `${name} not found on ${registry} — creating ${name}@${FIRST}`);
  process.exit(0);
}

const latest = published.reduce((m, v) => (cmp(v, m) > 0 ? v : m), published[0]);
if (!published.includes(pkg.version)) {
  console.log(
    `${name} on ${registry}: latest ${latest} (${published.length} versions). Publishing ${pkg.version}.`
  );
  process.exit(0);
}

let next = latest;
do {
  next = bumpPatch(next);
} while (published.includes(next));
writeVersion(
  next,
  `${name}@${pkg.version} already on ${registry} (latest ${latest}) — publishing ${next} instead`
);
