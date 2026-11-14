import { defineConfig } from 'prisma/config';

// Prisma CLI does not read .env by itself any more: load it with Node.
try {
  process.loadEnvFile();
} catch {
  // no .env file - variables come from the environment
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
