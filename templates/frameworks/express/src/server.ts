import { buildApp } from './app.js';
import { env } from './config/env.js';
import { connectInfrastructure, disconnectInfrastructure } from './lib/infra.js';
import { logger } from './lib/logger.js';
import { registerGracefulShutdown } from './lib/shutdown.js';

async function main() {
  await connectInfrastructure();

  const app = buildApp();
  const server = app.listen(env.PORT, env.HOST, (err) => {
    if (err) throw err;
    logger.info(`Server ready at http://localhost:${env.PORT}`);
  });

  registerGracefulShutdown(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    await disconnectInfrastructure();
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
