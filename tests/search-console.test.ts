import { describe, it, expect, vi } from 'vitest';
import { getSearchConsoleSummary } from '../src/providers/search-console';

describe('Search Console', () => {
  it('sends a scoped query to Google', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ rows: [] }));
    await getSearchConsoleSummary({ siteUrl: 'sc-domain:example.com', startDate: '2026-10-01', endDate: '2026-10-30' }, 'token', fetcher as typeof fetch);
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toContain('sc-domain%3Aexample.com/searchAnalytics/query');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body).dimensions).toEqual(['date']);
  });
  it('rejects invalid dates without making a request', async () => {
    const fetcher = vi.fn();
    await expect(getSearchConsoleSummary({ siteUrl: 'sc-domain:example.com', startDate: '2026-02-30', endDate: '2026-10-30' }, 'token', fetcher as typeof fetch)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
