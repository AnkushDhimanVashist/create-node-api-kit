/**
 * Every choice the CLI understands lives here. The prompts, the flag parser,
 * the generator and the test matrix all read from this single source.
 */

export const FRAMEWORKS = [
  { value: 'express', label: 'Express', hint: 'most popular, huge ecosystem' },
  { value: 'fastify', label: 'Fastify', hint: 'fast, plugin-based' },
  { value: 'nestjs', label: 'NestJS', hint: 'opinionated, modules + DI (TypeScript only)' },
  { value: 'hono', label: 'Hono', hint: 'tiny, modern, Web-standard APIs' },
];

export const LANGUAGES = [
  { value: 'ts', label: 'TypeScript', hint: 'recommended' },
  { value: 'js', label: 'JavaScript', hint: 'no build step' },
];

export const DATABASES = [
  { value: 'prisma', label: 'PostgreSQL + Prisma', hint: 'type-safe ORM, migrations' },
  { value: 'drizzle', label: 'PostgreSQL + Drizzle', hint: 'lightweight, SQL-first' },
  { value: 'mongoose', label: 'MongoDB + Mongoose', hint: 'document database' },
  { value: 'none', label: 'None', hint: 'in-memory store, add a database later' },
];

export const FEATURES = [
  { value: 'auth', label: 'JWT authentication', hint: 'register, login, protected routes' },
  { value: 'swagger', label: 'Swagger / OpenAPI docs', hint: 'served at /docs' },
  { value: 'docker', label: 'Docker', hint: 'Dockerfile + docker-compose' },
  { value: 'redis', label: 'Redis', hint: 'caching + distributed rate limiting' },
];

export const PACKAGE_MANAGERS = [
  { value: 'npm', label: 'npm' },
  { value: 'pnpm', label: 'pnpm' },
  { value: 'yarn', label: 'yarn' },
  { value: 'bun', label: 'bun' },
];

export const DEFAULTS = {
  framework: 'express',
  language: 'ts',
  database: 'prisma',
  features: ['auth', 'swagger', 'docker'],
  packageManager: 'npm',
  install: true,
  git: true,
};

const values = (list) => list.map((o) => o.value);

/** Throws a readable error when a config holds an unknown value. */
export function validateConfig(config) {
  const check = (name, value, list) => {
    if (!values(list).includes(value)) {
      throw new Error(`Unknown ${name} "${value}". Use one of: ${values(list).join(', ')}`);
    }
  };
  check('framework', config.framework, FRAMEWORKS);
  check('language', config.language, LANGUAGES);
  check('database', config.database, DATABASES);
  check('package manager', config.packageManager, PACKAGE_MANAGERS);
  for (const f of config.features) check('feature', f, FEATURES);
  if (config.framework === 'nestjs' && config.language !== 'ts') {
    throw new Error('NestJS projects are TypeScript only. Use --lang ts.');
  }
}
