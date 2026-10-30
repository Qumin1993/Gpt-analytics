import {it,expect,vi} from "vitest";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {InMemoryTransport} from "@modelcontextprotocol/sdk/inMemory.js";
import {createMcpServer} from "../src/mcp/server.js";
it("refreshes OAuth before GA4 call",async()=>{
 const calls:string[]=[];
 const original=globalThis.fetch;
 globalThis.fetch=vi.fn(async (input:RequestInfo|URL,init?:RequestInit)=>{
  const url=String(input); calls.push(url);
  if(url.includes("oauth2.googleapis.com")) return Response.json({access_token:"fresh-token"});
  expect(new Headers(init?.headers).get("authorization")).toBe("Bearer fresh-token");
  return Response.json({rows:[]});
 }) as typeof fetch;
 const server=createMcpServer({GOOGLE_CLIENT_ID:"id",GOOGLE_CLIENT_SECRET:"secret",GOOGLE_REFRESH_TOKEN:"refresh"});
 const client=new Client({name:"test",version:"1"});
 const [a,b]=InMemoryTransport.createLinkedPair();
 try {
  await server.connect(a); await client.connect(b);
  const result=await client.callTool({name:"ga4_summary",arguments:{propertyId:"123",startDate:"2026-10-01",endDate:"2026-10-02"}});
  expect(result.isError).not.toBe(true);
  expect(calls).toHaveLength(2);
 } finally {await client.close();await server.close();globalThis.fetch=original;}
});
