import { buildApp } from './app.js';
import { env } from './config/env.js';
import { connectInfrastructure, disconnectInfrastructure } from './lib/infra.js';
import { logger } from './lib/logger.js';
import { registerGracefulShutdown } from './lib/shutdown.js';

async function main() {
  await connectInfrastructure();

  const app = await buildApp();
  await app.listen({ port: env.PORT, host: env.HOST });

  registerGracefulShutdown(async () => {
    await app.close();
    await disconnectInfrastructure();
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
