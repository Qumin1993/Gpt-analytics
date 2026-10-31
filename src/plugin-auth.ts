import { AuthorizationError, CimdFetchError, authorizationErrorRedirect, type OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { verifyGoogleOwner, type GoogleIdentityEnv } from "./auth/google-identity.js";

export interface PluginAuthEnv extends GoogleIdentityEnv {
  APP_BASE_URL?: string;
  OAUTH_PROVIDER?: OAuthHelpers;
}

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

function consentPage(info: { clientName: string; clientDomain?: string; redirectHost: string; redirectIsLoopback: boolean; scope: string[] }, handle: string): string {
  const scopes = info.scope.map(scope => `<label><input type="checkbox" name="scope" value="${escapeHtml(scope)}" checked> ${escapeHtml(scope)}</label>`).join("");
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>GPT Analytics authorization</title><h1>Connect GPT Analytics</h1><p>${escapeHtml(info.clientName)} requests access to your analytics data.</p><p>Redirect destination: <strong>${escapeHtml(info.redirectHost)}</strong></p>${info.clientDomain ? `<p>Verified client domain: ${escapeHtml(info.clientDomain)}</p>` : `<p>Client name is not verified.</p>`}${info.redirectIsLoopback ? "<p>Warning: local callback address.</p>" : ""}<form method="post"><input type="hidden" name="handle" value="${escapeHtml(handle)}">${scopes}<button name="decision" value="approve">Allow</button><button name="decision" value="deny">Deny</button></form></html>`;
}
export async function handlePluginAuth(request: Request, env: PluginAuthEnv): Promise<Response> {
  const oauth = env.OAUTH_PROVIDER;
  if (!oauth || !env.APP_BASE_URL || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_ALLOWED_SUB) return new Response("OAuth unavailable", { status: 503 });
  const origin = new URL(env.APP_BASE_URL);
  if (new URL(request.url).origin !== origin.origin) return new Response("Invalid OAuth origin", { status: 400 });
  const path = new URL(request.url).pathname;
  try {
    if (path === "/authorize" && request.method === "GET") {
      const authRequest = await oauth.parseAuthRequest(request);
      const details = await oauth.describeConsent(authRequest);
      const consent = await oauth.beginConsent(authRequest);
      consent.headers.set("content-type", "text/html; charset=utf-8");
      return new Response(consentPage(details, consent.handle), { headers: consent.headers });
    }
    if (path === "/authorize" && request.method === "POST") {
      const form = await request.formData();
      const handle = String(form.get("handle") ?? "");
      if (form.get("decision") !== "approve") {
        const denied = await oauth.denyConsent(request, handle);
        return new Response(null, { status: 302, headers: denied.headers });
      }
      const approved = await oauth.approveConsent(request, handle, { scope: form.getAll("scope").map(String) });
      const verifier = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
      const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
      const challenge = btoa(String.fromCharCode(...digest)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      const upstream = await oauth.beginUpstream(approved.request, { data: { verifier }, headers: approved.headers });
      const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      google.search = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        redirect_uri: origin.origin + "/google/callback",
        response_type: "code",
        scope: "openid email profile",
        state: upstream.state,
        code_challenge: challenge,
        code_challenge_method: "S256",
        prompt: "select_account"
      }).toString();
      upstream.headers.set("Location", google.toString());
      return new Response(null, { status: 302, headers: upstream.headers });
    }
    if (path === "/google/callback" && request.method === "GET") {
      const resumed = await oauth.finishUpstream<{ verifier: string }>(request);
      const params = new URL(request.url).searchParams;
      if (params.has("error") || !params.get("code")) {
        resumed.headers.set("Location", authorizationErrorRedirect(resumed.request, "access_denied"));
        return new Response(null, { status: 302, headers: resumed.headers });
      }
      const ownerSub = await verifyGoogleOwner(params.get("code")!, origin.origin + "/google/callback", resumed.data.verifier, env);
      const { redirectTo } = await oauth.completeAuthorization({
        request: resumed.request, userId: ownerSub, metadata: {},
        scope: resumed.request.scope, props: { ownerSub }
      });
      resumed.headers.set("Location", redirectTo);
      return new Response(null, { status: 302, headers: resumed.headers });
    }
    return new Response("Not found", { status: 404 });
  } catch (error) {
    if (error instanceof AuthorizationError && error.redirectTo) return Response.redirect(error.redirectTo, 302);
    if (error instanceof AuthorizationError || error instanceof CimdFetchError) return new Response("Invalid OAuth authorization request", { status: 400 });
    if (error instanceof Error && error.message === "Google account not authorized") return new Response("Google account not authorized", { status: 403 });
    return new Response("OAuth authorization failed", { status: 503 });
  }
}
