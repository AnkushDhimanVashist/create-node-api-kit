import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { env } from './config/env.js';
import { connectInfrastructure, disconnectInfrastructure } from './lib/infra.js';
import { logger } from './lib/logger.js';
import { NestPinoLogger } from './lib/nest-logger.js';
import { registerGracefulShutdown } from './lib/shutdown.js';

async function main() {
  await connectInfrastructure();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new NestPinoLogger(),
  });
  configureApp(app);
  await app.listen(env.PORT, env.HOST);
  logger.info(`Server ready at http://localhost:${env.PORT}`);

  registerGracefulShutdown(async () => {
    await app.close();
    await disconnectInfrastructure();
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
