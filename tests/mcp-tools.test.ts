import { it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/mcp/server.js";

it("lists five read-only analytics tools", async () => {
  const server = createMcpServer({});
  const client = new Client({ name: "test-client", version: "1.0" });
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const { tools } = await client.listTools();
    expect(tools.map(t => t.name).sort()).toEqual([
      "ga4_summary", "search_console_summary", "admob_report",
      "play_reviews", "google_ads_campaigns"
    ].sort());
    expect(tools.every(t => t.annotations?.readOnlyHint === true)).toBe(true);
  } finally {
    await client.close();
    await server.close();
  }
});
