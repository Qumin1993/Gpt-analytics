import { describe, expect, it, vi } from 'vitest';
import { googleRequest } from '../src/providers/google';

describe('googleRequest safety', () => {
  it.each([
    'http://analyticsdata.googleapis.com/v1',
    'https://evil.example/v1',
    'https://analyticsdata.googleapis.com.evil.example/v1',
    'https://user:pass@analyticsdata.googleapis.com/v1',
    'https://analyticsdata.googleapis.com:8443/v1',
  ])('rejects unsupported endpoint %s', async url => {
    const fetcher = vi.fn();
    await expect(googleRequest(url, 'secret', {}, fetcher as typeof fetch)).rejects.toThrow('Unsupported');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('rejects missing token', async () => {
    await expect(googleRequest('https://analyticsdata.googleapis.com/v1', ' ')).rejects.toThrow('Missing');
  });

  it('attaches bearer token and disables redirects', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ rows: [] }));
    const result = await googleRequest<{rows: unknown[]}>(
      'https://analyticsdata.googleapis.com/v1', 'secret',
      { headers: { Authorization: 'Bearer attacker' } }, fetcher as typeof fetch
    );
    expect(result).toEqual({ rows: [] });
    const [, init] = fetcher.mock.calls[0]!;
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer secret');
    expect(init.redirect).toBe('error');
  });

  it('does not reveal access token in HTTP errors', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('secret', { status: 403 }));
    await expect(googleRequest('https://analyticsdata.googleapis.com/v1', 'secret', {}, fetcher as typeof fetch)).rejects.toThrow('Google API returned HTTP 403');
  });
});
