import { buildApp } from '../../src/app.js';

const app = await buildApp();
await app.ready();

/** Sends a request to the app in memory (no open port) and returns status + JSON body. */
export async function request(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options: { body?: unknown; token?: string } = {},
) {
  const res = await app.inject({
    method,
    url,
    payload: options.body as Record<string, unknown> | undefined,
    headers: options.token ? { authorization: `Bearer ${options.token}` } : {},
  });
  return { status: res.statusCode, body: res.body ? res.json() : undefined, headers: res.headers };
}
