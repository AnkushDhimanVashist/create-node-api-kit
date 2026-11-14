import { logger } from './logger.js';

const FORCE_EXIT_AFTER_MS = 10_000;

/**
 * Runs `close` once on SIGINT / SIGTERM so in-flight requests can finish and
 * connections are released before the process exits (important in Docker/K8s).
 */
export function registerGracefulShutdown(close: () => Promise<void>): void {
  let shuttingDown = false;

  const handler = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, 'Shutting down gracefully');

    const timer = setTimeout(() => {
      logger.error('Shutdown took too long, forcing exit');
      process.exit(1);
    }, FORCE_EXIT_AFTER_MS);
    timer.unref();

    try {
      await close();
      logger.info('Shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', handler);
  process.on('SIGTERM', handler);
}
