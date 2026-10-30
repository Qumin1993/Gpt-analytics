import {it,expect,vi} from "vitest";
import {getGoogleAccessToken} from "../src/auth/google-oauth.js";

it("uses static token when refresh credentials are absent",async()=>{
 const fetcher=vi.fn();
 expect(await getGoogleAccessToken({GOOGLE_ACCESS_TOKEN:"static"},fetcher as unknown as typeof fetch)).toBe("static");
 expect(fetcher).not.toHaveBeenCalled();
});
it("refreshes access token using POST with secret in form body",async()=>{
 const fetcher=vi.fn().mockResolvedValue(Response.json({access_token:"fresh"}));
 const token=await getGoogleAccessToken({GOOGLE_CLIENT_ID:"id",GOOGLE_CLIENT_SECRET:"secret",GOOGLE_REFRESH_TOKEN:"refresh"},fetcher as unknown as typeof fetch);
 expect(token).toBe("fresh");
 expect(fetcher).toHaveBeenCalledOnce();
 const [url,init]=fetcher.mock.calls[0]!;
 expect(url).toBe("https://oauth2.googleapis.com/token");
 expect(init.method).toBe("POST");
 expect(init.redirect).toBe("error");
 expect(new URLSearchParams(init.body).get("grant_type")).toBe("refresh_token");
});
it("fails closed on partial credentials",async()=>{
 await expect(getGoogleAccessToken({GOOGLE_CLIENT_ID:"id",GOOGLE_ACCESS_TOKEN:"static"})).rejects.toThrow("Incomplete");
});
