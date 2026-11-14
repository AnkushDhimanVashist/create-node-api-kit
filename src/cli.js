import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { spawnSync } from 'node:child_process';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import {
  DATABASES,
  DEFAULTS,
  FEATURES,
  FRAMEWORKS,
  LANGUAGES,
  PACKAGE_MANAGERS,
  validateConfig,
} from './options.js';
import { createContext, renderProject, writeProject } from './generate.js';

const HELP = `
${pc.bold('create-node-api-kit')} - scaffold a production-ready Node.js API

${pc.bold('Usage')}
  npx create-node-api-kit@latest [project-name] [options]

${pc.bold('Options')}
  --framework <name>   express | fastify | nestjs | hono
  --lang <name>        ts | js            (NestJS is ts only)
  --db <name>          prisma | drizzle | mongoose | none
  --features <list>    comma separated: auth,swagger,docker,redis  (use "" for none)
  --pm <name>          npm | pnpm | yarn | bun
  --no-install         skip installing dependencies
  --no-git             skip git init + first commit
  -y, --yes            accept defaults for anything not passed as a flag
  -h, --help           show this help
`;

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent ?? '';
  for (const pm of ['pnpm', 'yarn', 'bun']) if (ua.startsWith(pm)) return pm;
  return 'npm';
}

function readFlags(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    allowNegative: true,
    options: {
      framework: { type: 'string' },
      lang: { type: 'string' },
      db: { type: 'string' },
      features: { type: 'string' },
      pm: { type: 'string' },
      install: { type: 'boolean' },
      git: { type: 'boolean' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  return { ...values, name: positionals[0] };
}

function cancelled(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

async function ask(flags) {
  // No terminal (CI, piped input): never block on a prompt, use defaults instead.
  const auto = flags.yes || !process.stdin.isTTY;
  const answers = {};

  answers.projectName =
    flags.name ??
    (auto
      ? 'my-api'
      : cancelled(
          await p.text({
            message: 'Project name',
            placeholder: 'my-api',
            defaultValue: 'my-api',
            validate: (v) =>
              v && !/^[a-z0-9-_.]+$/.test(v)
                ? 'Use lowercase letters, numbers, - _ and . only'
                : undefined,
          }),
        ));

  answers.framework =
    flags.framework ??
    (auto
      ? DEFAULTS.framework
      : cancelled(
          await p.select({
            message: 'Framework',
            options: FRAMEWORKS,
            initialValue: DEFAULTS.framework,
          }),
        ));

  if (answers.framework === 'nestjs') {
    answers.language = 'ts';
  } else {
    answers.language =
      flags.lang ??
      (auto
        ? DEFAULTS.language
        : cancelled(
            await p.select({
              message: 'Language',
              options: LANGUAGES,
              initialValue: DEFAULTS.language,
            }),
          ));
  }

  answers.database =
    flags.db ??
    (auto
      ? DEFAULTS.database
      : cancelled(
          await p.select({
            message: 'Database',
            options: DATABASES,
            initialValue: DEFAULTS.database,
          }),
        ));

  if (flags.features !== undefined) {
    answers.features = flags.features
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
  } else {
    answers.features = auto
      ? DEFAULTS.features
      : cancelled(
          await p.multiselect({
            message: `Features ${pc.dim('(space to toggle, enter to confirm)')}`,
            options: FEATURES,
            initialValues: DEFAULTS.features,
            required: false,
          }),
        );
  }

  const detected = detectPackageManager();
  answers.packageManager =
    flags.pm ??
    (auto
      ? detected
      : cancelled(
          await p.select({
            message: 'Package manager',
            options: PACKAGE_MANAGERS,
            initialValue: detected,
          }),
        ));

  answers.install =
    flags.install ??
    (auto
      ? DEFAULTS.install
      : cancelled(await p.confirm({ message: 'Install dependencies now?' })));
  answers.git =
    flags.git ??
    (auto ? DEFAULTS.git : cancelled(await p.confirm({ message: 'Initialize a git repo?' })));

  return answers;
}

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: 'pipe', shell: process.platform === 'win32' });
  return result.status === 0
    ? null
    : result.stderr?.toString() || result.error?.message || 'failed';
}

export async function main(argv = process.argv.slice(2)) {
  let flags;
  try {
    flags = readFlags(argv);
  } catch (err) {
    console.error(pc.red(err.message));
    console.log(HELP);
    process.exit(1);
  }
  if (flags.help) {
    console.log(HELP);
    return;
  }

  p.intro(pc.bgCyan(pc.black(' create-node-api-kit ')));

  const config = await ask(flags);
  try {
    validateConfig(config);
  } catch (err) {
    p.cancel(err.message);
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), config.projectName);
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    p.cancel(`Folder ${pc.bold(config.projectName)} already exists and is not empty.`);
    process.exit(1);
  }

  const ctx = createContext({ ...config, projectName: path.basename(targetDir) });

  const s = p.spinner();
  s.start('Writing project files');
  const files = await renderProject(ctx);
  writeProject(targetDir, files);
  s.stop(`Wrote ${files.size} files`);

  if (config.install) {
    s.start(`Installing dependencies with ${config.packageManager} (this can take a minute)`);
    const err = run(config.packageManager, ['install'], targetDir);
    if (err)
      s.stop(pc.yellow(`Install failed - run "${ctx.install}" yourself.\n${err.slice(-800)}`), 1);
    else s.stop('Dependencies installed');
  }

  if (config.git) {
    const failed =
      run('git', ['init', '-q', '-b', 'main'], targetDir) ||
      run('git', ['add', '-A'], targetDir) ||
      run('git', ['commit', '-q', '-m', 'Initial commit from create-node-api-kit'], targetDir);
    if (failed) p.log.warn('Could not create the first git commit (is git configured?). Skipped.');
    else p.log.success('Git repository initialized');
  }

  const steps = [`cd ${config.projectName}`];
  if (!config.install) steps.push(ctx.install);
  steps.push('cp .env.example .env');
  if (ctx.has.docker && ctx.hasDb)
    steps.push('docker compose up -d db' + (ctx.has.redis ? ' redis' : ''));
  if (ctx.database === 'prisma') steps.push(ctx.run('db:migrate'));
  if (ctx.database === 'drizzle') steps.push(ctx.run('db:push'));
  steps.push(ctx.run('dev'));

  p.note(steps.join('\n'), 'Next steps');
  p.outro(
    `Your API will be at ${pc.cyan('http://localhost:3000')}${ctx.has.swagger ? ` - docs at ${pc.cyan('/docs')}` : ''}`,
  );
}
