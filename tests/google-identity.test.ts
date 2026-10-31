import { it, expect, vi } from "vitest";
import { verifyGoogleOwner } from "../src/auth/google-identity.js";
const env = { GOOGLE_CLIENT_ID: "client", GOOGLE_CLIENT_SECRET: "secret", GOOGLE_ALLOWED_SUB: "owner123" };
it("accepts only verified owner Google subject", async () => {
 const fetcher=vi.fn(async (input:RequestInfo|URL,init?:RequestInit)=>{
  if(String(input).endsWith("/token")){
   const body=new URLSearchParams(String(init?.body));
   expect(body.get("code_verifier")).toBe("pkce");
   return Response.json({access_token:"access"});
  }
  return Response.json({sub:"owner123"});
 }) as typeof fetch;
 expect(await verifyGoogleOwner("code","https://example.test/callback","pkce",env,fetcher)).toBe("owner123");
 expect(fetcher).toHaveBeenCalledTimes(2);
});
it("rejects other Google accounts",async()=>{
 const fetcher=vi.fn().mockResolvedValueOnce(Response.json({access_token:"access"})).mockResolvedValueOnce(Response.json({sub:"attacker"})) as typeof fetch;
 await expect(verifyGoogleOwner("code","https://example.test/callback","pkce",env,fetcher)).rejects.toThrow("not authorized");
});
it("fails closed without owner configuration",async()=>{
 const fetcher=vi.fn() as typeof fetch;
 await expect(verifyGoogleOwner("code","https://example.test/callback","pkce",{GOOGLE_CLIENT_ID:"client"},fetcher)).rejects.toThrow();
 expect(fetcher).not.toHaveBeenCalled();
});
