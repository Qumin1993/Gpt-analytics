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

## Google Cloud setup
1. Create or select a Google Cloud project.
2. Enable the required APIs: Analytics Data, Search Console, AdMob, Google Play Android Developer and Google Ads.
3. Configure the OAuth consent screen and required scopes.
4. Create an OAuth client and obtain a refresh token with account owner consent.
5. Grant the account access to the relevant GA4, Search Console, AdMob, Play Console and Google Ads resources.
6. Store credentials only in Cloudflare secrets. Never commit credentials to Git.

## Cloudflare deployment checklist
1. Install dependencies with npm install and authenticate using npx wrangler login.
2. Verify the intended Cloudflare account and Worker name before deployment.
3. Set MCP_ACCESS_TOKEN using npx wrangler secret put MCP_ACCESS_TOKEN. Generate a unique random value of at least 32 characters.
4. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN using separate wrangler secret put commands.
5. Set GOOGLE_ADS_DEVELOPER_TOKEN only when using Google Ads.
6. Run npm test, npm run typecheck and npx wrangler deploy --dry-run.
7. Deploy only after explicit approval and verification of Google account permissions.
8. Confirm GET /health and test authenticated and unauthenticated MCP requests.
9. Restrict the shared MCP token to trusted clients. This server does not provide per-user OAuth or multi-tenant isolation.
10. Rotate compromised secrets immediately. Never print credentials in terminal logs or commit them to Git.
