The Supabase backend is prepared but must not be treated as deployed until verified.

1. Connect the Supabase plugin to project `ltcnoaqibnxsyjouzyxw` and confirm project identity/region. Apply `environment-backend.sql`, then run transaction-only `environment-test.sql`. It creates only a separate environmental bucket and private collector state, leaving analytics intact.
2. Deploy `functions/environment-refresh/index.ts` with all adjacent modules and `verify_jwt=false`. The function authenticates every request with a server-only Vault secret through a service-role-only RPC. No secret belongs in frontend code or repository files.
3. Invoke the protected source probe using the SQL command at the end of the backend migration. Inspect its HTTP response and require a valid, recent source timestamp. If the source is unreachable from this region, stop before changing the frontend.
4. Invoke a full forced collection after the probe lease expires. Require all feeds to succeed, verify referenced storage objects exist, and inspect source timestamps. The first run seeds retained data from the existing public GitHub cache.
5. Only after verification, set the production cache base to `https://ltcnoaqibnxsyjouzyxw.supabase.co/storage/v1/object/public/sipantip-environment/` in `shared-data.js` and `dist/shared-data.js`. Keep localhost reading local cache. Apply `environment-schedule.sql` and remove the GitHub schedule to avoid duplicate collectors. Retain workflow_dispatch for emergency GitHub snapshots.
6. Verify a scheduled collection, a public fresh page load without manual Refresh, the explicit source refresh, and unchanged visitor recording/admin access. For rollback, restore the GitHub cache URL and unschedule the new cron job; retain all valid snapshots.

Regenerate portable modules after collector changes with `node scripts/build-edge-collector.cjs`. Generated validation/collection logic shares the Node collector's tested rules. The Edge transport does not spawn processes or rely on a filesystem. The function uses the platform-provided service role key only inside the backend.

References: https://supabase.com/docs/guides/functions/schedule-functions and https://supabase.com/docs/guides/functions/auth .
