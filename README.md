# create-node-api-kit

[![npm](https://img.shields.io/npm/v/create-node-api-kit)](https://www.npmjs.com/package/create-node-api-kit) [![CI](https://github.com/AnkushDhimanVashist/create-node-api-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/AnkushDhimanVashist/create-node-api-kit/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Docs and command builder: https://ankushdhimanvashist.github.io/create-node-api-kit/

Scaffold a production-ready Node.js REST API in one command. Answer a few questions
(or press Enter for the defaults) and get a project with only the stack you picked:
a clean folder structure, validation, logging, error handling, tests, linting and CI
already wired up.

```bash
npx create-node-api-kit@latest my-api
```

```
┌   create-node-api-kit
│
◇  Project name        my-api
◇  Framework           Express
◇  Language            TypeScript
◇  Database            PostgreSQL + Prisma
◇  Features            JWT authentication, Swagger / OpenAPI docs, Docker
◇  Package manager     npm
◇  Install dependencies now?  Yes
◇  Initialize a git repo?     Yes
│
└  Your API will be at http://localhost:3000 - docs at /docs
```

## Options

| Prompt          | Choices (default first)                                                 |
| --------------- | ----------------------------------------------------------------------- |
| Framework       | **Express**, Fastify, NestJS, Hono                                      |
| Language        | **TypeScript**, JavaScript (NestJS is TypeScript only)                  |
| Database        | **PostgreSQL + Prisma**, PostgreSQL + Drizzle, MongoDB + Mongoose, None |
| Features        | JWT auth, Swagger / OpenAPI docs, Docker, Redis (cache + rate limiting) |
| Package manager | npm, pnpm, yarn, bun (defaults to the one you ran the command with)     |

That is 7 framework/language pairs × 4 databases × 16 feature sets = **448 combinations**.
Every framework/language/database pair is installed, linted, type-checked, tested and
built in CI, with all features on and with none.

### Skip the prompts

Every prompt has a flag, handy for scripts and CI:

```bash
npx create-node-api-kit@latest my-api \
  --framework fastify --lang ts --db drizzle \
  --features auth,swagger,redis --pm pnpm --no-git
```

| Flag           | Values                                                            |
| -------------- | ----------------------------------------------------------------- |
| `--framework`  | `express` `fastify` `nestjs` `hono`                               |
| `--lang`       | `ts` `js`                                                         |
| `--db`         | `prisma` `drizzle` `mongoose` `none`                              |
| `--features`   | comma list of `auth` `swagger` `docker` `redis`, or `""` for none |
| `--pm`         | `npm` `pnpm` `yarn` `bun`                                         |
| `--no-install` | do not install dependencies                                       |
| `--no-git`     | do not create a git repo                                          |
| `-y`, `--yes`  | defaults for everything not passed as a flag                      |

## What every project gets

- **Layered, feature-based structure**: routes → service → repository, one folder per feature
- **Zod** validation; the same schemas give you types and (optionally) the OpenAPI docs
- **Validated environment variables**: the server refuses to start with a clear message if one is missing
- **Consistent JSON errors** from one `AppError` class and one error handler
- **Pino** structured logging (pretty in development, JSON in production)
- **Security defaults**: Helmet / secure headers, CORS, body size limit, rate limiting
- **Health checks**: `/health` (liveness) and `/health/ready` (checks the database and Redis)
- **Graceful shutdown** on SIGINT / SIGTERM
- **Vitest** API tests that run against an in-memory repository (no database needed)
- **ESLint + Prettier**, `.editorconfig`, `.nvmrc`
- **GitHub Actions** CI: lint, format check, type-check, test, build
- A generated **README** that explains the project, its scripts and how to add a feature

### Optional features

| Feature   | What you get                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `auth`    | Register / login / me routes, bcrypt hashing, JWT access tokens, protected routes, timing-safe login |
| `swagger` | OpenAPI 3.1 document generated from the Zod schemas, Swagger UI at `/docs`                           |
| `docker`  | Multi-stage `Dockerfile` (non-root, healthcheck) and `docker-compose.yml` with your database         |
| `redis`   | Shared Redis connection, JSON cache helper with invalidation, Redis-backed rate limiting             |

## Generated folder structure

Express / Fastify / Hono:

```
src/
├── server.ts              # entry point: connect, listen, graceful shutdown
├── app.ts                 # builds the app (used by the server and the tests)
├── config/env.ts          # environment variables, validated with Zod
├── lib/                   # logger, database, redis, cache, jwt, password, shutdown
├── common/                # errors, validation, middleware
├── docs/                  # OpenAPI document + Swagger UI
└── modules/
    ├── health/
    ├── auth/
    └── users/
        ├── user.routes.ts      # HTTP layer
        ├── user.service.ts     # business logic
        ├── user.repository.ts  # the only file that talks to the database
        ├── user.schema.ts      # Zod schemas
        └── user.entity.ts      # types + the public user shape
tests/
```

NestJS projects use the Nest conventions (`*.module.ts`, `*.controller.ts`, guards, pipes,
filters) on top of the same shared core (config, logger, errors, repositories, schemas).

## Requirements

Node.js 22.13 or newer.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how the
templates are organized and how to test your change across every combination.

## License

[MIT](LICENSE)
