import {it,expect,vi} from 'vitest';
import {getAdsCampaignReport} from '../src/providers/google-ads';
it('sends scoped Google Ads search with auth headers',async()=>{
 const f=vi.fn().mockResolvedValue(Response.json({results:[]}));
 await getAdsCampaignReport({customerId:'1234567890',startDate:'2026-10-01',endDate:'2026-10-30',developerToken:'dev-token',loginCustomerId:'0987654321'},'oauth',f as typeof fetch);
 const [url,init]=f.mock.calls[0]!;
 expect(url).toContain('/v26/customers/1234567890/googleAds:search');
 expect(init.method).toBe('POST');
 expect(new Headers(init.headers).get('developer-token')).toBe('dev-token');
 expect(new Headers(init.headers).get('login-customer-id')).toBe('0987654321');
 const query=JSON.parse(init.body).query;
 expect(query).toContain('metrics.cost_micros');
 expect(query).toContain("2026-10-01");
});
it('rejects invalid inputs before network calls',async()=>{
 const f=vi.fn();
 const base={customerId:'1234567890',startDate:'2026-10-01',endDate:'2026-10-30',developerToken:'dev-token'};
 for(const change of [{customerId:'bad'},{startDate:'2026-02-30'},{endDate:'2026-09-01'},{developerToken:' '},{loginCustomerId:'bad'},{pageToken:''}]) {
  await expect(getAdsCampaignReport({...base,...change},'oauth',f as typeof fetch)).rejects.toThrow();
 }
 expect(f).not.toHaveBeenCalled();
});
