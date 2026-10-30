import { describe, expect, it, vi } from 'vitest';
import { getAdMobReport } from '../src/providers/admob';

describe('AdMob reporting', () => {
  it('posts a report with expected metrics and dates', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ rows: [] }));
    const result = await getAdMobReport({
      publisherId: 'pub-1234567890123456',
      startDate: '2026-10-01',
      endDate: '2026-10-30',
    }, 'test-token', fetcher as typeof fetch);
    expect(result).toEqual({ rows: [] });
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe('https://admob.googleapis.com/v1/accounts/pub-1234567890123456/networkReport:generate');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.reportSpec.dateRange.startDate).toEqual({ year: 2026, month: 10, day: 1 });
    expect(body.reportSpec.metrics).toEqual(['ESTIMATED_EARNINGS', 'IMPRESSIONS', 'CLICKS']);
  });

  it('rejects invalid publisher and date ranges without a network request', async () => {
    const fetcher = vi.fn();
    for (const input of [
      { publisherId: '../bad', startDate: '2026-10-01', endDate: '2026-10-30' },
      { publisherId: 'pub-1234567890123456', startDate: '2026-02-30', endDate: '2026-10-30' },
      { publisherId: 'pub-1234567890123456', startDate: '2026-10-30', endDate: '2026-10-01' },
    ]) {
      await expect(getAdMobReport(input, 'token', fetcher as typeof fetch)).rejects.toThrow();
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
});
it('accepts Google streaming report JSON array', async () => {
  const records = [{ header: {} }, { row: { metricValues: { CLICKS: { integerValue: '7' } } } }, { footer: { matchingRowCount: '1' } }];
  const fetcher = vi.fn().mockResolvedValue(Response.json(records));
  const result = await getAdMobReport({ publisherId: 'pub-1234567890123456', startDate: '2026-10-01', endDate: '2026-10-30' }, 'token', fetcher as typeof fetch);
  expect(result).toEqual(records);
});
