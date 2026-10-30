import { describe, expect, it } from 'vitest';
import worker from '../src/index';

describe('worker routing', () => {
  it('responds to health checks', async () => {
    const response = await worker.fetch(new Request('https://example.test/health'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });
  it('rejects unknown routes', async () => {
    const response = await worker.fetch(new Request('https://example.test/unknown'));
    expect(response.status).toBe(404);
  });
});
