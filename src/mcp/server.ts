import { getGoogleAccessToken } from "../auth/google-oauth.js";
async function resolveGoogleToken(env: Env): Promise<string | undefined> {
  try { return await getGoogleAccessToken(env); }
  catch { return undefined; }
}
import type { GoogleAuthEnv } from "../auth/google-oauth.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getGa4Summary } from "../providers/ga4.js";
export interface Env extends GoogleAuthEnv {
  MCP_ACCESS_TOKEN?: string;
  GOOGLE_ACCESS_TOKEN?: string;
  GOOGLE_ADS_DEVELOPER_TOKEN?: string;
}
export function createMcpServer(env: Env) {
  const server = new McpServer({ name: "gpt-analytics", version: "0.1.0" });
  server.registerTool("ga4_summary", {
    description: "Read GA4 sessions, users and revenue by day.",
    inputSchema: z.object({
      propertyId: z.string(),
      startDate: z.string(),
      endDate: z.string()
    }),
    annotations: { readOnlyHint: true }
  }, async args => {
    const token = await resolveGoogleToken(env); if (!token) return {
      content: [{ type: "text", text: "Google access not configured" }],
      isError: true
    };
    try {
      const data = await getGa4Summary(args, token);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    } catch {
      return { content: [{ type: "text", text: "GA4 request failed" }], isError: true };
    }
  });
  server.registerTool("search_console_summary", {
    description: "Read Search Console daily search performance.",
    inputSchema: z.object({ siteUrl: z.string(), startDate: z.string(), endDate: z.string() }),
    annotations: { readOnlyHint: true }
  }, async args => {
    const token = await resolveGoogleToken(env);
    if (!token) return { content: [{ type: "text" as const, text: "Google access not configured" }], isError: true };
    try {
      const data = await (await import("../providers/search-console.js")).getSearchConsoleSummary(args, token);
      return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
    } catch {
      return { content: [{ type: "text" as const, text: "Search Console request failed" }], isError: true };
    }
  });
  server.registerTool("admob_report", {
    description: "Read AdMob daily earnings, impressions and clicks.",
    inputSchema: z.object({ publisherId: z.string(), startDate: z.string(), endDate: z.string() }),
    annotations: { readOnlyHint: true }
  }, async args => {
    const token = await resolveGoogleToken(env);
    if (!token) return { content: [{ type: "text" as const, text: "Google access not configured" }], isError: true };
    try {
      const data = await (await import("../providers/admob.js")).getAdMobReport(args, token);
      return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
    } catch {
      return { content: [{ type: "text" as const, text: "AdMob request failed" }], isError: true };
    }
  });
  server.registerTool("play_reviews", {
    description: "Read Google Play app reviews without posting replies.",
    inputSchema: z.object({
      packageName: z.string().min(1),
      maxResults: z.number().int().min(1).max(100).optional(),
      pageToken: z.string().optional()
    }),
    annotations: { readOnlyHint: true }
  }, async args => {
    const token = await resolveGoogleToken(env);
    if (!token) return { content: [{ type: "text" as const, text: "Google access not configured" }], isError: true };
    try {
      const data = await (await import("../providers/play-console.js")).getPlayReviews(args, token);
      return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
    } catch {
      return { content: [{ type: "text" as const, text: "Google Play request failed" }], isError: true };
    }
  });
  server.registerTool("google_ads_campaigns", {
    description: "Read Google Ads campaign performance without changing campaigns.",
    inputSchema: z.object({ customerId: z.string(), startDate: z.string(), endDate: z.string() }),
    annotations: { readOnlyHint: true }
  }, async args => {
    const token = await resolveGoogleToken(env);
    const developerToken = env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!token || !developerToken) return { content: [{ type: "text" as const, text: "Google Ads credentials not configured" }], isError: true };
    try {
      const data = await (await import("../providers/google-ads.js")).getAdsCampaignReport({ ...args, developerToken }, token);
      return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
    } catch {
      return { content: [{ type: "text" as const, text: "Google Ads request failed" }], isError: true };
    }
  });
  return server;
}
