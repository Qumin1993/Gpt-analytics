import { it, expect } from "vitest";
import worker from "../src/index.js";

it("lists five read-only tools over authenticated MCP HTTP", async () => {
  const secret = "s".repeat(40);
  const request = new Request("https://local.test/mcp", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "mcp-protocol-version": "2025-03-26"
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
  });
  const response = await worker.fetch(request, { MCP_ACCESS_TOKEN: secret });
  expect(response.status).toBe(200);
  const data = await response.json() as { result?: { tools?: {name: string; annotations?: {readOnlyHint?: boolean}}[] } };
  const tools = data.result?.tools ?? [];
  expect(tools.map(t => t.name).sort()).toEqual([
    "ga4_summary", "search_console_summary", "admob_report",
    "play_reviews", "google_ads_campaigns"
  ].sort());
  expect(tools.every(t => t.annotations?.readOnlyHint === true)).toBe(true);
});
