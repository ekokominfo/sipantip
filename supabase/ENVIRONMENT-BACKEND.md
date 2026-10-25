# Environmental backend

Deployed to project ltcnoaqibnxsyjouzyxw (sipantip, Tokyo). The original SiPongi collection succeeded at 06:15 WIB; after the source change, the FIRMS collection succeeded on 25 October 2026 at 12:48 WIB with no resource errors. The public cache is Supabase Storage bucket sipantip-environment. pg_cron invokes environment-refresh at minutes 17 and 47 each hour. Hotspot TTL is 30 minutes; model TTL is one hour. The GitHub automatic collector is disabled; workflow_dispatch retains the emergency snapshot path.

The active source is NASA FIRMS. The collector reads the three regional 48-hour CSVs listed in firms-source.js from the official firms2 mirror, without a MAP_KEY. All three must validate (including Last-Modified freshness) before any active feed is replaced. Coordinate-to-administration joins use BNPB reference polygons bundled in firms-geography.json. Unmatched villages remain unknown. SiPongi is a historical/reference source only.

Daily archives retain older SiPongi-derived snapshots. Only yesterday and elapsed today are recomputed from rolling 48-hour coverage; today is marked partial. Older uncovered dates are never inferred as zero. Earlier closed months retain timestamps and are marked historical. Backfill of missing older dates requires a verified historical source; arbitrary custom periods currently returned upstream 500.

## Deployment and verification

1. Apply environment-backend.sql and transaction-only environment-test.sql. Collector state is in a private schema with RLS. Only service_role can call its authentication/lock RPCs. Storage permits public environmental JSON reads only. Analytics is separate.
2. Regenerate portable modules: node scripts/build-edge-collector.cjs. For the dashboard single-file deploy: node scripts/build-edge-collector.cjs --bundle <absolute-output.ts>. Deploy that bundle as index.ts, or deploy the original entry with all adjacent modules via the official CLI.
3. verify_jwt=false is intentional: a server-only Vault secret is verified through service-role-only RPC before any source request. Anonymous POST must return 401. Never place collector secrets or service role credentials in frontend code.
4. Probe via select environment_private.invoke(true,false); then inspect environment_private.collector.last_status and net._http_response. Full collection: select environment_private.invoke(false,true);. Require no errors and verify every manifest object exists before switching cache URL.
5. Apply environment-schedule.sql. Check cron.job and cron.job_run_details, then check the collector completion separately (pg_net queues HTTP asynchronously). A successful cron SQL invocation alone does not prove source collection succeeded.
6. Verify public initial load uses the cache only; Refresh contacts SiPongi and Open-Meteo directly, retains valid payloads on failure and obeys cooldown. Public visitor totals remain hidden, with visit recording/admin reports unchanged.

For rollback, restore the GitHub cache URL in shared-data.js and dist/shared-data.js and unschedule sipantip-environment-refresh. Preserve valid snapshots. Re-enable the GitHub schedule only after checking source reachability. Do not expose the Vault secret in diagnostics.

References: https://supabase.com/docs/guides/functions/schedule-functions and https://supabase.com/docs/guides/functions/auth .

The collector also caches BMKG village weather descriptions as bmkg-villages. It requests at most 50 villages per invocation and enforces a 60-second provider cooldown. With the existing half-hour cron, all 99 villages normally refresh hourly. Forecast rows retain their source production and valid times. Frontend requests only the shared cache; no BMKG API call is made per visitor.
