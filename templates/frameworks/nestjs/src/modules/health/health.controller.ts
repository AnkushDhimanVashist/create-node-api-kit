import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { checkInfrastructure } from '../../lib/infra.js';

@SkipThrottle()
@Controller('health')
export class HealthController {
  /** Liveness: the process is up and serving requests. */
  @Get()
  live() {
    return { status: 'ok', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() };
  }

  /** Readiness: every dependency (database, cache, ...) is reachable. */
  @Get('ready')
  async ready(@Res({ passthrough: true }) res: Response) {
    const dependencies = await checkInfrastructure();
    const ok = Object.values(dependencies).every((s) => s === 'up');
    res.status(ok ? 200 : 503);
    return { status: ok ? 'ok' : 'degraded', dependencies };
  }
}
