import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { isAuthorized } from "./auth/bearer.js";
import { createMcpServer, type Env } from "./mcp/server.js";

export default {
  async fetch(request: Request, env: Env = Object.create(null)): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/health") return Response.json({ status: "ok" });
    if (path !== "/mcp") return new Response("Not found", { status: 404 });
    if (!(await isAuthorized(request, env.MCP_ACCESS_TOKEN))) {
      return new Response("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" }
      });
    }
    const server = createMcpServer(env);
    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true
    });
    await server.connect(transport);
    return transport.handleRequest(request);
  }
};
