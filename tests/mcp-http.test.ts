import {it,expect} from "vitest";
import worker from "../src/index.js";
const secret="s".repeat(40);
it("rejects missing and invalid MCP bearer",async()=>{
  const req=(token?:string)=>new Request("https://local.test/mcp",{method:"POST",headers:token?{authorization:"Bearer "+token}:{}});
  expect((await worker.fetch(req(),{MCP_ACCESS_TOKEN:secret})).status).toBe(401);
  expect((await worker.fetch(req("wrong"),{MCP_ACCESS_TOKEN:secret})).status).toBe(401);
  expect((await worker.fetch(req(secret),{})).status).toBe(401);
});

it("initializes MCP with valid bearer", async () => {
  const response = await worker.fetch(new Request("https://local.test/mcp", {
    method: "POST",
    headers: {
      authorization: "Bearer " + secret,
      "content-type": "application/json",
      accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1.0" } }
    })
  }), { MCP_ACCESS_TOKEN: secret });
  expect(response.status).toBe(200);
  const data = await response.json() as { result?: { serverInfo?: { name?: string } } };
  expect(data.result?.serverInfo?.name).toBe("gpt-analytics");
});
