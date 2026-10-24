-- Run only AFTER probe and a full collection succeed in the Supabase region.
-- Match the existing cadence: hotspot every 30 min; models respect their hourly TTL.
select cron.schedule('sipantip-environment-refresh','17,47 * * * *',
 $$select environment_private.invoke(false,false);$$);

-- Monitor without exposing the Vault secret:
-- select last_started,last_finished,last_status from environment_private.collector;
-- select * from cron.job_run_details where jobid=(select jobid from cron.job where jobname='sipantip-environment-refresh') order by start_time desc limit 5;
-- If rollback is needed: select cron.unschedule('sipantip-environment-refresh');
