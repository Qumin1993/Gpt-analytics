const HOSTS = new Set([
  "analyticsdata.googleapis.com",
  "searchconsole.googleapis.com",
  "www.googleapis.com",
  "admob.googleapis.com",
  "androidpublisher.googleapis.com",
  "googleads.googleapis.com",
]);

export async function googleRequest<T>(
  url: string,
  token: string,
  init: RequestInit = {},
  fetcher: typeof fetch = fetch,
): Promise<T> {
  const endpoint = new URL(url);
  if (endpoint.protocol !== "https:" || !HOSTS.has(endpoint.hostname) || endpoint.port || endpoint.username || endpoint.password) {
    throw new Error("Unsupported Google API endpoint");
  }
  if (!token.trim()) throw new Error("Missing Google access token");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  const response = await fetcher(endpoint.toString(), { ...init, headers, redirect: "error" });
  if (!response.ok) throw new Error(`Google API returned HTTP ${response.status}`);
  return (await response.json()) as T;
}
