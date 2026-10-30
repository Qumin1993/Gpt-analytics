import {it,expect} from "vitest";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {InMemoryTransport} from "@modelcontextprotocol/sdk/inMemory.js";
import {createMcpServer} from "../src/mcp/server.js";
it("fails closed without Google credentials",async()=>{
 const server=createMcpServer({});
 const client=new Client({name:"test",version:"1"});
 const [a,b]=InMemoryTransport.createLinkedPair();
 await server.connect(a);
 await client.connect(b);
 try {
  const ga=await client.callTool({name:"ga4_summary",arguments:{propertyId:"123",startDate:"2026-10-01",endDate:"2026-10-02"}});
  const ads=await client.callTool({name:"google_ads_campaigns",arguments:{customerId:"1234567890",startDate:"2026-10-01",endDate:"2026-10-02"}});
  expect(ga.isError).toBe(true);
  expect(ads.isError).toBe(true);
 } finally {await client.close();await server.close();}
});
