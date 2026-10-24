-- Backend preparation only. Apply the separate schedule after the source probe succeeds.
begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create schema if not exists vault;
create extension if not exists supabase_vault with schema vault;
create schema if not exists environment_private;
revoke all on schema environment_private from public,anon,authenticated;
create table if not exists environment_private.collector(
 id boolean primary key default true check(id),
 secret_hash text not null,
 lease_until timestamptz not null default '-infinity',
 last_started timestamptz,
 last_finished timestamptz,
 last_status jsonb
);
alter table environment_private.collector enable row level security;
revoke all on environment_private.collector from public,anon,authenticated;

-- No secret is included in source control or sent to the public dashboard.
do $$
declare secret text;
begin
 select decrypted_secret into secret from vault.decrypted_secrets where name='sipantip_environment_collector' limit 1;
 if secret is null then
  secret:=encode(extensions.gen_random_bytes(32),'hex');
  perform vault.create_secret(secret,'sipantip_environment_collector','Server-only SIPANTIP collection authorization');
 end if;
 insert into environment_private.collector(id,secret_hash)
 values(true,encode(extensions.digest(secret,'sha256'),'hex'))
 on conflict(id) do nothing;
end $$;

create or replace function public.claim_environment_refresh(p_secret text)
returns boolean language plpgsql security definer set search_path='' as $$
declare claimed boolean;
begin
 if p_secret is null or length(p_secret)<>64 then return false; end if;
 update environment_private.collector set lease_until=now()+interval '3 minutes',last_started=now()
 where id=true and lease_until<=now() and secret_hash=encode(extensions.digest(p_secret,'sha256'),'hex')
 returning true into claimed;
 return coalesce(claimed,false);
end $$;
revoke all on function public.claim_environment_refresh(text) from public,anon,authenticated;
grant execute on function public.claim_environment_refresh(text) to service_role;

create or replace function public.finish_environment_refresh(p_secret text,p_status jsonb)
returns void language sql security definer set search_path='' as $$
 update environment_private.collector set lease_until=now()+interval '10 seconds',last_finished=now(),last_status=p_status
 where id=true and secret_hash=encode(extensions.digest(p_secret,'sha256'),'hex');
$$;
revoke all on function public.finish_environment_refresh(text,jsonb) from public,anon,authenticated;
grant execute on function public.finish_environment_refresh(text,jsonb) to service_role;

create or replace function environment_private.invoke(p_probe boolean default false,p_force boolean default false)
returns bigint language sql security definer set search_path='' as $$
 select net.http_post(
  url:='https://ltcnoaqibnxsyjouzyxw.supabase.co/functions/v1/environment-refresh',
  headers:=jsonb_build_object('Content-Type','application/json','x-sipantip-collector',
    (select decrypted_secret from vault.decrypted_secrets where name='sipantip_environment_collector' limit 1)),
  body:=jsonb_build_object('action',case when p_probe then 'probe' else 'collect' end,'force',p_force),
  timeout_milliseconds:=120000
 );
$$;
revoke all on function environment_private.invoke(boolean,boolean) from public,anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('sipantip-environment','sipantip-environment',true,10485760,array['application/json'])
on conflict(id) do nothing;
-- This bucket contains public environmental observations only. No public write policy.
commit;

-- After deploying environment-refresh with verify_jwt=false, run:
-- select environment_private.invoke(true,false);
-- Then inspect the matching net._http_response record: expect ok=true and a source timestamp.
-- Wait at least 10 seconds after probe completion, then collect:
-- select environment_private.invoke(false,true);
