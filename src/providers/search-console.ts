import { googleRequest } from "./google";

export interface SearchConsoleInput {
  siteUrl: string;
  startDate: string;
  endDate: string;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function getSearchConsoleSummary(
  input: SearchConsoleInput,
  accessToken: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  const site = input.siteUrl;
  if (!(site.startsWith("sc-domain:") && /^sc-domain:[a-z0-9.-]+$/i.test(site)) &&
      !/^https?:\/\/[^\s/?#]+\/$/i.test(site)) {
    throw new Error("Invalid Search Console property");
  }
  if (!validDate(input.startDate) || !validDate(input.endDate) || input.startDate > input.endDate) {
    throw new Error("Invalid Search Console date range");
  }
  return googleRequest(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,
    accessToken,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: input.startDate,
        endDate: input.endDate,
        dimensions: ["date"],
        rowLimit: 25000,
      }),
    },
    fetcher,
  );
}
