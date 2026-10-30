# GPT Analytics MCP

Read-only Cloudflare Workers MCP server.

## Tools
- `ga4_summary`: GA4 daily sessions, users and revenue.
- `search_console_summary`: search performance.
- `admob_report`: AdMob report.
- `play_reviews`: Google Play reviews (no replies).
- `google_ads_campaigns`: Google Ads campaign metrics.

## Security and configuration
`/health` is public. `/mcp` requires `Authorization: Bearer <token>` and an `MCP_ACCESS_TOKEN` secret of at least 32 characters.

Set secrets in Cloudflare using `npx wrangler secret put NAME`:
- `MCP_ACCESS_TOKEN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_ADS_DEVELOPER_TOKEN`

Alternatively, `GOOGLE_ACCESS_TOKEN` is supported for local testing. Keep secrets out of Git. `.dev.vars` is ignored.

## Checks
Run `npm test`, `npm run typecheck`, and `npx wrangler deploy --dry-run`.

Google OAuth consent, API permissions and a Google Ads developer token must be configured by the account owner. Automated tests mock Google APIs; they do not verify live account access. Do not deploy before validating credentials and access controls.
