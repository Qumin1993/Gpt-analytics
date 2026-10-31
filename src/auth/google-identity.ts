export interface GoogleIdentityEnv {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_ALLOWED_SUB?: string;
}
export async function verifyGoogleOwner(code:string,redirectUri:string,verifier:string,env:GoogleIdentityEnv,fetcher:typeof fetch=fetch):Promise<string>{
  if (!code || !verifier || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_ALLOWED_SUB) throw new Error("Google owner authentication unavailable");
  const response = await fetcher("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, code_verifier: verifier, grant_type: "authorization_code" }), redirect: "error"
  });
  if (!response.ok) throw new Error("Google authorization failed");
  const token = await response.json() as { access_token?: unknown };
  if (typeof token.access_token !== "string" || !token.access_token) throw new Error("Google token missing");
  const info = await fetcher("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: "Bearer " + token.access_token }, redirect: "error"
  });
  if (!info.ok) throw new Error("Google identity verification failed");
  const profile = await info.json() as { sub?: unknown };
  if (typeof profile.sub !== "string" || !profile.sub || profile.sub !== env.GOOGLE_ALLOWED_SUB) throw new Error("Google account not authorized");
  return profile.sub;
}
