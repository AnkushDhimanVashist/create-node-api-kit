// Fast checks that render every option combination in memory (no install).
// The slow end-to-end check lives in scripts/test-matrix.js.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DATABASES, FEATURES, FRAMEWORKS, LANGUAGES, validateConfig } from '../src/options.js';
import { createContext, renderProject } from '../src/generate.js';

process.removeAllListeners('warning');

const allFeatures = FEATURES.map((f) => f.value);
// No features, every feature, and each feature on its own.
const subsets = [[], allFeatures, ...allFeatures.map((f) => [f])];

const combos = [];
for (const { value: framework } of FRAMEWORKS)
  for (const { value: language } of LANGUAGES) {
    if (framework === 'nestjs' && language === 'js') continue;
    for (const { value: database } of DATABASES)
      for (const features of subsets) combos.push({ framework, language, database, features });
  }

describe(`renders all ${combos.length} combinations`, () => {
  for (const combo of combos) {
    const id = `${combo.framework}/${combo.language}/${combo.database}/${combo.features.join('+') || 'bare'}`;
    it(id, async () => {
      const ctx = createContext({ ...combo, projectName: 'demo', packageManager: 'npm' });
      const files = await renderProject(ctx);
      const ext = combo.language;

      for (const [name, content] of files) {
        assert.ok(!name.endsWith('.ejs'), `${name} kept its .ejs extension`);
        assert.ok(!/<%|%>/.test(content), `${name} has unrendered template tags`);
        if (ext === 'js') assert.ok(!name.endsWith('.ts'), `${name} is TypeScript in a JS project`);
      }

      const entry = combo.framework === 'nestjs' ? 'main' : 'server';
      for (const required of [
        'package.json',
        'README.md',
        '.env.example',
        '.gitignore',
        `src/${entry}.${ext}`,
      ])
        assert.ok(files.has(required), `missing ${required}`);

      const pkg = JSON.parse(files.get('package.json'));
      assert.equal(pkg.name, 'demo');
      assert.equal(files.has('Dockerfile'), combo.features.includes('docker'));
      assert.equal(files.has(`src/lib/redis.${ext}`), combo.features.includes('redis'));
      assert.equal(files.has(`tests/auth.test.${ext}`), combo.features.includes('auth'));
      assert.equal(files.has(`src/docs/openapi.${ext}`), combo.features.includes('swagger'));
      assert.equal(files.has('prisma/schema.prisma'), combo.database === 'prisma');
    });
  }
});

describe('validateConfig', () => {
  it('rejects NestJS + JavaScript', () => {
    assert.throws(
      () =>
        validateConfig({
          framework: 'nestjs',
          language: 'js',
          database: 'none',
          features: [],
          packageManager: 'npm',
        }),
      /TypeScript only/,
    );
  });
  it('rejects unknown values', () => {
    assert.throws(
      () =>
        validateConfig({
          framework: 'koa',
          language: 'ts',
          database: 'none',
          features: [],
          packageManager: 'npm',
        }),
      /Unknown framework/,
    );
  });
});
