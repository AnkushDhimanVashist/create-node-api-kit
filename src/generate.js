import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import ejs from 'ejs';
import * as prettier from 'prettier';
import { buildPackageJson } from './package-json.js';

const TEMPLATES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../templates');

/** Files that only make sense in a TypeScript project. */
const TS_ONLY_FILES = new Set(['tsconfig.json', 'tsconfig.build.json']);

/** Turns the user's answers into the object every template is rendered with. */
export function createContext(config) {
  const isTs = config.language === 'ts';
  const has = Object.fromEntries(
    ['auth', 'swagger', 'docker', 'redis'].map((f) => [f, config.features.includes(f)]),
  );
  const pm = config.packageManager;
  return {
    ...config,
    isTs,
    has,
    ext: isTs ? 'ts' : 'js',
    isNest: config.framework === 'nestjs',
    hasDb: config.database !== 'none',
    isPostgres: config.database === 'prisma' || config.database === 'drizzle',
    pm,
    /** `npm run dev`, `pnpm dev`, ... */
    run: (script) => (pm === 'npm' ? `npm run ${script}` : `${pm} ${script}`),
    install: pm === 'yarn' ? 'yarn' : `${pm} install`,
    entry: config.framework === 'nestjs' ? 'main' : 'server',
  };
}

/** Ordered list of template folders. Later layers overwrite earlier ones. */
function layers(ctx) {
  const list = ['shared'];
  if (!ctx.isNest) list.push('functional');
  list.push(`frameworks/${ctx.framework}`, `db/${ctx.database}`);
  for (const feature of ctx.features) {
    list.push(`features/${feature}/shared`);
    if (!ctx.isNest) list.push(`features/${feature}/functional`);
    list.push(`features/${feature}/${ctx.framework}`);
  }
  return list.map((l) => path.join(TEMPLATES, l)).filter((dir) => fs.existsSync(dir));
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

/** `_gitignore` -> `.gitignore`, `foo.ts.ejs` -> `foo.ts` */
function targetName(rel) {
  return rel
    .split(path.sep)
    .map((part) => (part.startsWith('_') ? `.${part.slice(1)}` : part))
    .join('/')
    .replace(/\.ejs$/, '');
}

function toJs(rel, source) {
  // Node's built-in type stripper only removes types: comments and code shape stay intact.
  const code = stripTypeScriptTypes(source, { mode: 'strip' });
  return { rel: rel.replace(/\.ts$/, '.js'), source: code };
}

function isEmptyModule(code) {
  return (
    code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim() === ''
  );
}

/**
 * Renders every template layer into memory, returns a Map of relative path -> file content.
 * Nothing touches the disk here, which keeps the generator easy to test.
 */
export async function renderProject(ctx) {
  const files = new Map();

  for (const dir of layers(ctx)) {
    for (const rel of walk(dir)) {
      let content = fs.readFileSync(path.join(dir, rel), 'utf8');
      if (rel.endsWith('.ejs')) {
        content = ejs.render(content, ctx, { filename: path.join(dir, rel) });
      }
      const name = targetName(rel);
      // A template that renders to nothing is a file that does not apply to this config.
      if (content.trim() === '') {
        files.delete(name);
        continue;
      }
      files.set(name, content);
    }
  }

  files.set('package.json', JSON.stringify(buildPackageJson(ctx), null, 2) + '\n');

  if (!ctx.isTs) {
    for (const [rel, source] of [...files]) {
      if (TS_ONLY_FILES.has(rel) || rel.endsWith('.d.ts')) {
        files.delete(rel);
      } else if (rel.endsWith('.ts')) {
        files.delete(rel);
        const js = toJs(rel, source);
        // A file that only declared types has nothing left to run in JavaScript.
        if (!isEmptyModule(js.source)) files.set(js.rel, js.source);
      }
    }
  }

  return format(files);
}

async function format(files) {
  const config = JSON.parse(files.get('.prettierrc') ?? '{}');
  const out = new Map();
  for (const [rel, source] of files) {
    const info = await prettier.getFileInfo(rel);
    if (info.inferredParser && !rel.endsWith('.prisma')) {
      out.set(rel, await prettier.format(source, { ...config, filepath: rel }));
    } else {
      out.set(rel, source);
    }
  }
  return out;
}

export function writeProject(targetDir, files) {
  for (const [rel, content] of files) {
    const full = path.join(targetDir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
}
