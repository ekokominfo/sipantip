-- Transaction-only checks; no source HTTP requests and no persisted test changes.
begin;
do $$
declare secret text;
begin
 if has_function_privilege('anon','public.claim_environment_refresh(text)','execute')
 or has_function_privilege('authenticated','public.claim_environment_refresh(text)','execute') then
  raise exception 'Public users must not claim collection jobs';
 end if;
 if not has_function_privilege('service_role','public.claim_environment_refresh(text)','execute') then
  raise exception 'Backend role cannot claim collection jobs';
 end if;
 if has_table_privilege('anon','environment_private.collector','select')
 or has_table_privilege('authenticated','environment_private.collector','select') then
  raise exception 'Private job state is exposed';
 end if;
 if public.claim_environment_refresh(repeat('0',64)) then raise exception 'Wrong secret accepted'; end if;
 select decrypted_secret into secret from vault.decrypted_secrets where name='sipantip_environment_collector' limit 1;
 if secret is null then raise exception 'Collector secret missing'; end if;
 update environment_private.collector set lease_until='-infinity';
 if not public.claim_environment_refresh(secret) then raise exception 'Valid secret rejected'; end if;
 if public.claim_environment_refresh(secret) then raise exception 'Overlapping job accepted'; end if;
 perform public.finish_environment_refresh(secret,'{"test":true}'::jsonb);
 if not exists(select 1 from environment_private.collector where last_status->>'test'='true') then raise exception 'Job completion not recorded'; end if;
 if not exists(select 1 from storage.buckets where id='sipantip-environment' and public and file_size_limit=10485760) then raise exception 'Public environmental bucket missing'; end if;
end $$;
rollback;
