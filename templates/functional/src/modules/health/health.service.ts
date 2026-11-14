import { checkInfrastructure } from '../../lib/infra.js';

export const healthService = {
  /** Liveness: the process is up and serving requests. */
  live() {
    return { status: 'ok', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() };
  },

  /** Readiness: every dependency (database, cache, ...) is reachable. */
  async ready() {
    const dependencies = await checkInfrastructure();
    const ok = Object.values(dependencies).every((s) => s === 'up');
    return { ok, body: { status: ok ? 'ok' : 'degraded', dependencies } };
  },
};
