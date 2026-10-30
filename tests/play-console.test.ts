import { describe, it, expect, vi } from 'vitest';
import { getPlayReviews } from '../src/providers/play-console';

describe('Play Console reviews', () => {
  it('uses GET with a package, limit and page token', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ reviews: [] }));
    await getPlayReviews({ packageName: 'com.example.app', maxResults: 25, pageToken: 'next' }, 'test-token', fetcher as typeof fetch);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    const parsed = new URL(url);
    expect(parsed.hostname).toBe('androidpublisher.googleapis.com');
    expect(parsed.pathname).toBe('/androidpublisher/v3/applications/com.example.app/reviews');
    expect(parsed.searchParams.get('maxResults')).toBe('25');
    expect(parsed.searchParams.get('token')).toBe('next');
    expect(init.method).toBe('GET');
  });

  it('rejects unsafe package names and invalid limits without network calls', async () => {
    const fetcher = vi.fn();
    for (const input of [
      { packageName: '../bad' },
      { packageName: 'com.example.app', maxResults: 101 },
      { packageName: 'com.example.app', maxResults: 0 },
      { packageName: 'com.example.app', pageToken: '' }
    ]) {
      await expect(getPlayReviews(input, 'token', fetcher as typeof fetch)).rejects.toThrow();
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
});
