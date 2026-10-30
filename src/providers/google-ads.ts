import { googleRequest } from "./google";

export interface AdsReportInput {
  customerId: string;
  startDate: string;
  endDate: string;
  developerToken: string;
  loginCustomerId?: string;
  pageToken?: string;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export async function getAdsCampaignReport(
  input: AdsReportInput,
  accessToken: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  if (!/^\d{10}$/.test(input.customerId)) throw new Error("Invalid Google Ads customer ID");
  if (input.loginCustomerId !== undefined && !/^\d{10}$/.test(input.loginCustomerId)) {
    throw new Error("Invalid Google Ads login customer ID");
  }
  if (!input.developerToken?.trim()) throw new Error("Missing Google Ads developer token");
  if (!validDate(input.startDate) || !validDate(input.endDate) || input.startDate > input.endDate) {
    throw new Error("Invalid Google Ads date range");
  }
  if (input.pageToken !== undefined && (!input.pageToken || input.pageToken.length > 4096)) {
    throw new Error("Invalid Google Ads page token");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "developer-token": input.developerToken,
  };
  if (input.loginCustomerId) headers["login-customer-id"] = input.loginCustomerId;
  const query = "SELECT segments.date, campaign.id, campaign.name, " +
    "metrics.impressions, metrics.clicks, metrics.cost_micros " +
    "FROM campaign WHERE segments.date BETWEEN '" + input.startDate +
    "' AND '" + input.endDate + "' ORDER BY segments.date";
  return googleRequest(
    `https://googleads.googleapis.com/v26/customers/${input.customerId}/googleAds:search`,
    accessToken,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ query, ...(input.pageToken ? { pageToken: input.pageToken } : {}) }),
    },
    fetcher,
  );
}
