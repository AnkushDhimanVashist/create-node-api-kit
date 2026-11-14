#!/usr/bin/env node
/**
 * Generates projects for many option combinations, installs them and runs
 * each project's own lint / format / typecheck / test / build scripts.
 *
 *   node scripts/test-matrix.js                 # every framework x language x database, all + no features
 *   node scripts/test-matrix.js --filter hono   # only combos whose id contains "hono"
 *   node scripts/test-matrix.js --full          # also every subset of features (slow)
 *   CONCURRENCY=2 node scripts/test-matrix.js
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { DATABASES, FEATURES, FRAMEWORKS, LANGUAGES } from '../src/options.js';
import { createContext, renderProject, writeProject } from '../src/generate.js';

process.removeAllListeners('warning');

const { values: args } = parseArgs({
  options: {
    filter: { type: 'string' },
    full: { type: 'boolean' },
    keep: { type: 'boolean' },
    out: { type: 'string' },
  },
});

const allFeatures = FEATURES.map((f) => f.value);
const featureSets = args.full
  ? Array.from({ length: 1 << allFeatures.length }, (_, mask) =>
      allFeatures.filter((_, i) => mask & (1 << i)),
    )
  : [allFeatures, []];

const combos = [];
for (const { value: framework } of FRAMEWORKS) {
  for (const { value: language } of LANGUAGES) {
    if (framework === 'nestjs' && language === 'js') continue;
    for (const { value: database } of DATABASES) {
      for (const features of featureSets) {
        const id = [framework, language, database, features.join('+') || 'bare'].join('-');
        if (args.filter && !args.filter.split(',').every((f) => id.includes(f))) continue;
        combos.push({ id, framework, language, database, features });
      }
    }
  }
}

const root = args.out ?? fs.mkdtempSync(path.join(os.tmpdir(), 'node-api-kit-matrix-'));
const concurrency = Number(
  process.env.CONCURRENCY ?? Math.max(1, Math.min(4, os.cpus().length / 2)),
);
console.log(`Testing ${combos.length} combinations in ${root} (concurrency ${concurrency})\n`);

function sh(cmd, cmdArgs, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { cwd, env: { ...process.env, CI: '1' } });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', (code) => resolve({ code, out }));
  });
}

async function check(combo) {
  const dir = path.join(root, combo.id);
  fs.rmSync(dir, { recursive: true, force: true });
  const ctx = createContext({ ...combo, projectName: combo.id, packageManager: 'npm' });
  writeProject(dir, await renderProject(ctx));

  const steps = [['install', ['install', '--no-audit', '--no-fund']]];
  steps.push(['lint', ['run', 'lint']], ['format', ['run', 'format:check']]);
  if (combo.language === 'ts') steps.push(['typecheck', ['run', 'typecheck']]);
  steps.push(['test', ['run', 'test']]);
  if (combo.language === 'ts') steps.push(['build', ['run', 'build']]);

  for (const [name, npmArgs] of steps) {
    const { code, out } = await sh('npm', npmArgs, dir);
    if (code !== 0) return { ...combo, ok: false, step: name, out };
  }
  if (!args.keep) fs.rmSync(dir, { recursive: true, force: true });
  return { ...combo, ok: true };
}

const results = [];
const queue = [...combos];
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const combo = queue.shift();
      const started = Date.now();
      const result = await check(combo);
      results.push(result);
      const secs = ((Date.now() - started) / 1000).toFixed(0);
      console.log(
        `${result.ok ? 'PASS' : 'FAIL'}  ${combo.id}  (${secs}s)${result.ok ? '' : `  -> ${result.step}`}`,
      );
    }
  }),
);

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
for (const f of failed) {
  console.log(`\n──── ${f.id} failed at "${f.step}" ────\n${f.out.slice(-3000)}`);
}
process.exit(failed.length ? 1 : 0);
