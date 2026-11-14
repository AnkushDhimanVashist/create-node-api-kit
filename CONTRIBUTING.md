# Contributing

Thanks for helping! This guide explains how the generator works and how to check a change.

## Setup

```bash
git clone https://github.com/AnkushDhimanVashist/create-node-api-kit.git
cd create-node-api-kit
npm install
node bin/index.js my-test-api     # try the CLI locally
```

## How projects are generated

Templates live in `templates/` as **layers**. The generator copies them in this order;
a later layer overwrites a file with the same path from an earlier one:

1. `shared/` - every project (config, logger, errors, validation, tests, tooling)
2. `functional/` - Express, Fastify and Hono only (plain-object services)
3. `frameworks/<framework>/` - app, server, routes, middleware for that framework
4. `db/<database>/` - database client and the `user.repository` for that database
5. `features/<feature>/shared/`, `features/<feature>/functional/`, `features/<feature>/<framework>/`

Rules:

- Files ending in `.ejs` are rendered with [EJS](https://ejs.co). The variables available
  are built in `createContext()` in [src/generate.js](src/generate.js) (`framework`, `isTs`,
  `database`, `has.auth`, `run('dev')`, ...).
- A template that renders to an empty file is skipped, so a whole file can be conditional.
- A leading `_` becomes `.` (`_gitignore` -> `.gitignore`), because npm drops dotfiles on publish.
- Templates are written **in TypeScript only**. For JavaScript projects the generator strips
  the types with Node's built-in `stripTypeScriptTypes`. So:
  - import types with `import type` (enforced by `verbatimModuleSyntax`),
  - use only erasable syntax: no `enum`, no `namespace`, no constructor parameter properties
    (NestJS files are the exception: NestJS is TypeScript only),
  - write relative imports with a `.js` extension.
- Everything is formatted with Prettier after rendering, so do not fight over whitespace in templates.
- Dependency versions live in one place: [src/package-json.js](src/package-json.js).

## Testing

```bash
npm test                                   # renders 168 combinations in memory (seconds)
npm run test:matrix                        # installs + lints + type-checks + tests + builds 56 projects
npm run test:matrix -- --filter hono       # only combinations whose id contains "hono"
npm run test:matrix -- --filter nestjs,auth --keep   # keep the generated projects to inspect them
```

Please run the matrix for the frameworks your change touches before opening a pull request.
