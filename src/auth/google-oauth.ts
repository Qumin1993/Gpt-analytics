export interface GoogleAuthEnv {
  GOOGLE_ACCESS_TOKEN?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
}
export async function getGoogleAccessToken(env: GoogleAuthEnv, fetcher: typeof fetch = fetch): Promise<string> {
  const values = [env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REFRESH_TOKEN];
  if (values.some(value => value !== undefined)) {
    if (values.some(value => !value?.trim())) throw new Error("Incomplete Google OAuth configuration");
    const body = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      refresh_token: env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    });
    const response = await fetcher("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      redirect: "error",
    });
    if (!response.ok) throw new Error(`Google OAuth returned HTTP ${response.status}`);
    const data = await response.json() as { access_token?: unknown };
    if (typeof data.access_token !== "string" || !data.access_token.trim()) {
      throw new Error("Invalid Google OAuth response");
    }
    return data.access_token;
  }
  if (env.GOOGLE_ACCESS_TOKEN?.trim()) return env.GOOGLE_ACCESS_TOKEN;
  throw new Error("Google credentials not configured");
}
