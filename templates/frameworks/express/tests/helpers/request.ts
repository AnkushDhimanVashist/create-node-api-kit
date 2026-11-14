import supertest from 'supertest';
import { buildApp } from '../../src/app.js';

const app = buildApp();

/** Sends a request to the app in memory (no open port) and returns status + JSON body. */
export async function request(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options: { body?: unknown; token?: string } = {},
) {
  let req = supertest(app)[method.toLowerCase() as 'get'](url);
  if (options.token) req = req.set('Authorization', `Bearer ${options.token}`);
  if (options.body !== undefined) req = req.send(options.body as object);
  const res = await req;
  return { status: res.status, body: res.body, headers: res.headers };
}
