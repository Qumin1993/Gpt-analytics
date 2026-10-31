import { isOwnerAuthorized, type PluginAuthContext } from "./auth/plugin-access.js";
import type { KVNamespace } from "@cloudflare/workers-types";
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer, type Env as BaseEnv } from "./mcp/server.js";
import { handlePluginAuth } from "./plugin-auth.js";
import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";

export interface PluginEnv extends BaseEnv {
  OAUTH_KV: KVNamespace;
  APP_BASE_URL?: string;
  GOOGLE_ALLOWED_SUB?: string;
  OAUTH_PROVIDER?: OAuthHelpers;
}

type AuthContext = { props?: { ownerSub?: string }; auth?: { userId?: string; scope?: string[] } };
export const mcpHandler = {
  async fetch(request: Request, env: PluginEnv, context: unknown): Promise<Response> {
    if (!isOwnerAuthorized(env.GOOGLE_ALLOWED_SUB, context as PluginAuthContext)) {
      return new Response("Forbidden", { status: 403 });
    }
    const server = createMcpServer(env);
    const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
    await server.connect(transport);
    return transport.handleRequest(request);
  }
};

export function createPluginProvider(env: PluginEnv): OAuthProvider<PluginEnv> {
  if (!env.APP_BASE_URL) throw new Error("APP_BASE_URL is required");
  const base = new URL(env.APP_BASE_URL);
  if (base.protocol !== "https:" || base.pathname !== "/" || base.search || base.hash) {
    throw new Error("APP_BASE_URL must be an HTTPS origin");
  }
  return new OAuthProvider<PluginEnv>({
    apiRoute: "/mcp",
    apiHandler: mcpHandler,
    defaultHandler: { fetch: handlePluginAuth },
    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/oauth/token",
    clientRegistrationEndpoint: "/oauth/register",
    scopesSupported: ["analytics:read", "offline_access"],
    requiredScopes: ["analytics:read"],
    clientIdMetadataDocumentEnabled: true,
    resourceMetadata: {
      resource: base.origin + "/mcp",
      authorization_servers: [base.origin],
      resource_name: "GPT Analytics"
    }
  });
}
