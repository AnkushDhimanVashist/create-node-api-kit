/**
 * Builds the generated project's package.json from the user's choices.
 * All dependency versions are pinned here, in one place, so upgrading the
 * template means editing this file only.
 */

const V = {
  // core
  zod: '^4.6.7',
  pino: '^10.4.0',
  'pino-pretty': '^13.2.0',
  // express
  express: '^5.3.0',
  helmet: '^8.3.0',
  cors: '^2.8.6',
  'pino-http': '^11.0.0',
  'express-rate-limit': '^8.7.4',
  '@types/express': '^5.0.6',
  '@types/cors': '^2.8.19',
  // fastify
  fastify: '^5.12.8',
  '@fastify/cors': '^11.4.3',
  '@fastify/helmet': '^13.2.0',
  '@fastify/rate-limit': '^11.2.2',
  // hono
  hono: '^4.13.18',
  '@hono/node-server': '^2.1.8',
  // nestjs
  '@nestjs/core': '^12.5.0',
  '@nestjs/common': '^12.5.0',
  '@nestjs/platform-express': '^12.5.0',
  '@nestjs/throttler': '^6.7.1',
  '@nestjs/cli': '^12.0.13',
  '@nestjs/testing': '^12.5.0',
  '@nestjs/schematics': '^12.0.13',
  'reflect-metadata': '^0.2.2',
  rxjs: '^7.8.2',
  'unplugin-swc': '^2.0.0',
  '@swc/core': '^1.16.22',
  // databases
  prisma: '^7.10.1',
  '@prisma/client': '^7.10.1',
  '@prisma/adapter-pg': '^7.10.1',
  pg: '^8.23.1',
  '@types/pg': '^8.23.1',
  'drizzle-orm': '^0.45.4',
  'drizzle-kit': '^0.31.11',
  mongoose: '^9.12.1',
  // auth
  jsonwebtoken: '^9.0.3',
  '@types/jsonwebtoken': '^9.0.10',
  bcryptjs: '^3.0.3',
  // swagger
  'swagger-ui-express': '^5.0.1',
  '@types/swagger-ui-express': '^4.1.8',
  '@fastify/swagger': '^9.9.4',
  '@fastify/swagger-ui': '^6.1.4',
  '@hono/swagger-ui': '^0.6.2',
  '@nestjs/swagger': '^12.1.2',
  // redis
  ioredis: '^6.0.0',
  'rate-limit-redis': '^6.0.2',
  // tooling
  typescript: '~6.0.3',
  tsx: '^4.23.15',
  '@types/node': '^22.20.5',
  vitest: '^5.1.0',
  supertest: '^7.3.2',
  '@types/supertest': '^7.2.1',
  eslint: '^10.15.0',
  '@eslint/js': '^10.0.1',
  'typescript-eslint': '^8.72.2',
  globals: '^17.14.0',
  prettier: '^3.10.1',
};

export const VERSIONS = V;

function pick(names) {
  const out = {};
  for (const n of names) {
    if (!V[n]) throw new Error(`No version pinned for ${n}`);
    out[n] = V[n];
  }
  return out;
}

function sortKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

export function buildPackageJson(ctx) {
  const { framework, isTs, database, has } = ctx;
  const deps = ['zod', 'pino'];
  const dev = [
    'pino-pretty',
    'vitest',
    'eslint',
    '@eslint/js',
    'globals',
    'prettier',
    '@types/node',
  ];
  if (isTs) dev.push('typescript', 'typescript-eslint', 'tsx');

  // ── framework ───────────────────────────────────────────────
  if (framework === 'express') {
    deps.push('express', 'helmet', 'cors', 'pino-http', 'express-rate-limit');
    dev.push('supertest');
    if (isTs) dev.push('@types/express', '@types/cors', '@types/supertest');
  }
  if (framework === 'fastify') {
    deps.push('fastify', '@fastify/cors', '@fastify/helmet', '@fastify/rate-limit');
  }
  if (framework === 'hono') {
    deps.push('hono', '@hono/node-server');
  }
  if (framework === 'nestjs') {
    deps.push(
      '@nestjs/core',
      '@nestjs/common',
      '@nestjs/platform-express',
      '@nestjs/throttler',
      'reflect-metadata',
      'rxjs',
      'helmet',
    );
    dev.push(
      '@nestjs/cli',
      '@nestjs/schematics',
      '@nestjs/testing',
      'unplugin-swc',
      '@swc/core',
      'supertest',
      '@types/supertest',
      '@types/express',
    );
  }

  // ── database ────────────────────────────────────────────────
  if (database === 'prisma') {
    deps.push('@prisma/client', '@prisma/adapter-pg', 'pg');
    dev.push('prisma');
  }
  if (database === 'drizzle') {
    deps.push('drizzle-orm', 'pg');
    dev.push('drizzle-kit');
    if (isTs) dev.push('@types/pg');
  }
  if (database === 'mongoose') deps.push('mongoose');

  // ── features ────────────────────────────────────────────────
  if (has.auth) {
    deps.push('jsonwebtoken', 'bcryptjs');
    if (isTs) dev.push('@types/jsonwebtoken');
  }
  if (has.swagger) {
    if (framework === 'express') {
      deps.push('swagger-ui-express');
      if (isTs) dev.push('@types/swagger-ui-express');
    }
    if (framework === 'fastify') deps.push('@fastify/swagger', '@fastify/swagger-ui');
    if (framework === 'hono') deps.push('@hono/swagger-ui');
    if (framework === 'nestjs') deps.push('@nestjs/swagger');
  }
  if (has.redis) {
    deps.push('ioredis');
    if (framework === 'express') deps.push('rate-limit-redis');
  }

  // ── scripts ─────────────────────────────────────────────────
  const scripts = {};
  if (framework === 'nestjs') {
    scripts.dev = 'nest start --watch';
    scripts.build = 'nest build';
    scripts.start = 'node dist/main.js';
  } else if (isTs) {
    scripts.dev = 'tsx watch src/server.ts';
    scripts.build = 'tsc -p tsconfig.build.json';
    scripts.start = 'node dist/server.js';
  } else {
    scripts.dev = 'node --watch src/server.js';
    scripts.start = 'node src/server.js';
  }
  if (isTs) scripts.typecheck = 'tsc --noEmit';
  scripts.lint = 'eslint .';
  scripts['lint:fix'] = 'eslint . --fix';
  scripts.format = 'prettier --write .';
  scripts['format:check'] = 'prettier --check .';
  scripts.test = 'vitest run';
  scripts['test:watch'] = 'vitest';

  if (database === 'prisma') {
    scripts['db:generate'] = 'prisma generate';
    scripts['db:migrate'] = 'prisma migrate dev';
    scripts['db:deploy'] = 'prisma migrate deploy';
    scripts['db:studio'] = 'prisma studio';
    scripts.postinstall = 'prisma generate';
  }
  if (database === 'drizzle') {
    scripts['db:generate'] = 'drizzle-kit generate';
    scripts['db:migrate'] = 'drizzle-kit migrate';
    scripts['db:push'] = 'drizzle-kit push';
    scripts['db:studio'] = 'drizzle-kit studio';
  }

  return {
    name: ctx.projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    engines: { node: '>=22.13.0' },
    scripts,
    dependencies: sortKeys(pick(deps)),
    devDependencies: sortKeys(pick(dev)),
  };
}
