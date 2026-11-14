import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';

const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
configureApp(app);
await app.init();

/** Sends a request to the app in memory (no open port) and returns status + JSON body. */
export async function request(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options: { body?: unknown; token?: string } = {},
) {
  let req = supertest(app.getHttpServer())[method.toLowerCase() as 'get'](url);
  if (options.token) req = req.set('Authorization', `Bearer ${options.token}`);
  if (options.body !== undefined) req = req.send(options.body as object);
  const res = await req;
  return { status: res.status, body: res.body, headers: res.headers };
}
