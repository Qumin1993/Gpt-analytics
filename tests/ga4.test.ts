import { describe, expect, it, vi } from 'vitest';
import { getGa4Summary } from '../src/providers/ga4';

describe('GA4 reporting', () => {
  it('requests metrics for a validated property and date range', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ rows: [] }));
    const result = await getGa4Summary(
      { propertyId: '12345', startDate: '2026-10-01', endDate: '2026-10-30' },
      'test-token', fetcher as typeof fetch);
    expect(result).toEqual({ rows: [] });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe('https://analyticsdata.googleapis.com/v1beta/properties/12345:runReport');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({
      dateRanges: [{ startDate: '2026-10-01', endDate: '2026-10-30' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'totalRevenue' }],
    });
  });

  it('rejects invalid IDs and backwards date ranges without a request', async () => {
    const fetcher = vi.fn();
    await expect(getGa4Summary({ propertyId: '../bad', startDate: '2026-10-01', endDate: '2026-10-30' }, 'token', fetcher as typeof fetch)).rejects.toThrow();
    await expect(getGa4Summary({ propertyId: '123', startDate: '2026-10-30', endDate: '2026-10-01' }, 'token', fetcher as typeof fetch)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
