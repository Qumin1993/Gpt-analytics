import { createPluginProvider, type PluginEnv } from "./plugin.js";

export default {
  async fetch(request: Request, env: PluginEnv, ctx: import("@cloudflare/workers-types").ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ status: "ok" });
    }
    if (!env.APP_BASE_URL || !env.GOOGLE_ALLOWED_SUB || !env.OAUTH_KV) {
      return new Response("OAuth configuration unavailable", { status: 503 });
    }
    try {
      return await createPluginProvider(env).fetch(request, env, ctx);
    } catch {
      return new Response("OAuth service unavailable", { status: 503 });
    }
  }
};
