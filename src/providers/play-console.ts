import { googleRequest } from "./google";

export interface PlayReviewsInput {
  packageName: string;
  maxResults?: number | undefined;
  pageToken?: string | undefined;
}
export async function getPlayReviews(
  input: PlayReviewsInput,
  token: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(input.packageName)) {
    throw new Error("Invalid Play package name");
  }
  const limit = input.maxResults ?? 100;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Invalid Play page size");
  }
  if (input.pageToken !== undefined && (input.pageToken.length > 2048 || !input.pageToken)) {
    throw new Error("Invalid Play page token");
  }
  const url = new URL(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(input.packageName)}/reviews`);
  url.searchParams.set("maxResults", String(limit));
  if (input.pageToken) url.searchParams.set("token", input.pageToken);
  return googleRequest(url.toString(), token, { method: "GET" }, fetcher);
}
