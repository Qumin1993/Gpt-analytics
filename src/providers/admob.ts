import { googleRequest } from "./google";

export interface AdMobReportInput {
  publisherId: string;
  startDate: string;
  endDate: string;
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Invalid AdMob date");
  const d = new Date(value + "T00:00:00Z");
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid AdMob date");
  }
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

export async function getAdMobReport(
  input: AdMobReportInput,
  token: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  if (!/^pub-\d{16}$/.test(input.publisherId)) throw new Error("Invalid AdMob publisher ID");
  const startDate = parseDate(input.startDate);
  const endDate = parseDate(input.endDate);
  if (input.startDate > input.endDate) throw new Error("Invalid AdMob date range");
  return googleRequest(
    `https://admob.googleapis.com/v1/accounts/${input.publisherId}/networkReport:generate`,
    token,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportSpec: {
          dateRange: { startDate, endDate },
          dimensions: ["DATE", "APP"],
          metrics: ["ESTIMATED_EARNINGS", "IMPRESSIONS", "CLICKS"],
        },
      }),
    },
    fetcher,
  );
}
