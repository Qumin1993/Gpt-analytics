import { googleRequest } from "./google";

export interface Ga4ReportInput {
  propertyId: string;
  startDate: string;
  endDate: string;
}

export async function getGa4Summary(
  input: Ga4ReportInput,
  accessToken: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  if (!/^\d{1,20}$/.test(input.propertyId)) throw new Error("Invalid GA4 property ID");
  for (const date of [input.startDate, input.endDate]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date + "T00:00:00Z").toISOString().slice(0,10) !== date) {
      throw new Error("Invalid GA4 date");
    }
  }
  if (input.startDate > input.endDate) throw new Error("Invalid GA4 date range");
  return googleRequest(
    `https://analyticsdata.googleapis.com/v1beta/properties/${input.propertyId}:runReport`,
    accessToken,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: input.startDate, endDate: input.endDate }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "totalRevenue" }],
        limit: "10000",
      }),
    },
    fetcher,
  );
}
