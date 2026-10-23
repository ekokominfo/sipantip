-- Run once in the Supabase SQL editor. No secrets are included in this migration.
begin;
create schema if not exists analytics_private;
revoke all on schema analytics_private from public, anon, authenticated;
create table if not exists analytics_private.admins(user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists analytics_private.visitors(id uuid primary key, first_seen timestamptz not null default now(), last_seen timestamptz not null default now());
create table if not exists analytics_private.visits(
 id uuid primary key, visitor_id uuid not null references analytics_private.visitors(id),
 started_at timestamptz not null default now(), last_seen timestamptz not null default now(),
 device text not null, browser text not null, os text not null, referrer text not null,
 views integer not null default 1 check(views between 1 and 200)
);
create index if not exists visits_started_idx on analytics_private.visits(started_at);
create table if not exists analytics_private.activity(
 session_id uuid not null references analytics_private.visits(id) on delete cascade,
 feature text not null, visited_at timestamptz not null default now(), primary key(session_id,feature)
);
alter table analytics_private.admins enable row level security;
alter table analytics_private.visitors enable row level security;
alter table analytics_private.visits enable row level security;
alter table analytics_private.activity enable row level security;
revoke all on all tables in schema analytics_private from public,anon,authenticated;

create or replace function public.record_visit(p_visitor uuid,p_session uuid,p_device text,p_browser text,p_os text,p_referrer text,p_feature text default 'pageview')
returns void language plpgsql security definer set search_path='' as $$
declare v analytics_private.visits%rowtype;
begin
 if p_visitor is null or p_session is null then raise exception 'Invalid identifier'; end if;
 if p_device not in ('Ponsel','Tablet','Desktop') or p_browser not in ('Chrome','Safari','Firefox','Edge','Lainnya') or p_os not in ('Android','iOS','Windows','macOS','Linux','Lainnya') then raise exception 'Invalid metadata'; end if;
 if p_feature not in ('pageview','peta-section','district-section','village-section','daily-section','pm-section','data-section','regency-section') then raise exception 'Invalid feature'; end if;
 if p_referrer is null or length(p_referrer)>120 or p_referrer !~ '^[a-zA-Z0-9.-]+$' then raise exception 'Invalid referrer'; end if;
 -- Serialise per visitor to prevent concurrent refreshes bypassing the limits.
 perform pg_advisory_xact_lock(hashtextextended(p_visitor::text,0));
 select * into v from analytics_private.visits where id=p_session for update;
 if found then
   if v.visitor_id<>p_visitor then raise exception 'Session mismatch'; end if;
   if v.last_seen<now()-interval '24 hours' then return; end if;
   if p_feature='pageview' and v.last_seen<now()-interval '10 seconds' then
     update analytics_private.visits set views=least(views+1,200),last_seen=now() where id=p_session;
   end if;
 else
   if (select count(*) from analytics_private.visits where visitor_id=p_visitor and started_at>now()-interval '24 hours')>=48 then return; end if;
   insert into analytics_private.visitors(id) values(p_visitor) on conflict(id) do nothing;
   insert into analytics_private.visits(id,visitor_id,device,browser,os,referrer) values(p_session,p_visitor,p_device,p_browser,p_os,lower(p_referrer));
 end if;
 update analytics_private.visitors set last_seen=now() where id=p_visitor;
 insert into analytics_private.activity(session_id,feature) values(p_session,p_feature) on conflict do nothing;
end $$;

create or replace function public.visitor_totals() returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object('total',(select count(*) from analytics_private.visitors),'today',
 (select count(distinct v.visitor_id) from analytics_private.visits v join analytics_private.activity a on a.session_id=v.id where a.visited_at >= (date_trunc('day',now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta')),
 'since',(select min(first_seen) from analytics_private.visitors));
$$;

create or replace function public.visitor_report(p_days integer default 30) returns jsonb
language plpgsql security definer set search_path='' as $$
declare since_time timestamptz; result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from analytics_private.admins where user_id=auth.uid()) then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_days not in (7,30,90) then raise exception 'Invalid period'; end if;
 since_time:=((now() at time zone 'Asia/Jakarta')::date-(p_days-1))::timestamp at time zone 'Asia/Jakarta';
 select jsonb_build_object(
 'totals',public.visitor_totals(),
 'new_visitors',(select count(distinct s.visitor_id) from analytics_private.visits s join analytics_private.visitors v on v.id=s.visitor_id where s.started_at>=since_time and v.first_seen>=since_time),
 'returning_visitors',(select count(distinct s.visitor_id) from analytics_private.visits s join analytics_private.visitors v on v.id=s.visitor_id where s.started_at>=since_time and v.first_seen<since_time),
 'previous',jsonb_build_object(
 'sessions',(select count(*) from analytics_private.visits where started_at>=since_time-make_interval(days=>p_days) and started_at<since_time),
 'unique',(select count(distinct visitor_id) from analytics_private.visits where started_at>=since_time-make_interval(days=>p_days) and started_at<since_time),
 'views',(select coalesce(sum(views),0) from analytics_private.visits where started_at>=since_time-make_interval(days=>p_days) and started_at<since_time),
 'complete',coalesce((select min(first_seen)<=since_time-make_interval(days=>p_days) from analytics_private.visitors),false)
 ),
 'unique',(select count(distinct visitor_id) from analytics_private.visits where started_at>=since_time),
 'sessions',(select count(*) from analytics_private.visits where started_at>=since_time),
 'views',(select coalesce(sum(views),0) from analytics_private.visits where started_at>=since_time),
 'daily',(select coalesce(jsonb_agg(t order by t.day),'[]'::jsonb) from (select (started_at at time zone 'Asia/Jakarta')::date as "day",count(distinct visitor_id) visitors,count(*) sessions,sum(views) views from analytics_private.visits where started_at>=since_time group by 1) t),
 'devices',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select device label,count(*) count from analytics_private.visits where started_at>=since_time group by 1 order by 2 desc) t),
 'browsers',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select browser label,count(*) count from analytics_private.visits where started_at>=since_time group by 1 order by 2 desc) t),
 'systems',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select os label,count(*) count from analytics_private.visits where started_at>=since_time group by 1 order by 2 desc) t),
 'referrers',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select referrer label,count(*) count from analytics_private.visits where started_at>=since_time group by 1 order by 2 desc limit 20) t),
 'features',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select feature label,count(*) count from analytics_private.activity where visited_at>=since_time and feature<>'pageview' group by 1 order by 2 desc) t),
 'hours',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select extract(hour from started_at at time zone 'Asia/Jakarta')::int label,count(*) count from analytics_private.visits where started_at>=since_time group by 1 order by 1) t),
 'latest',(select max(last_seen) from analytics_private.visitors)
 ) into result;
 return result;
end $$;
revoke all on function public.record_visit(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.visitor_totals() from public,anon,authenticated;
revoke all on function public.visitor_report(integer) from public,anon,authenticated;
grant execute on function public.record_visit(uuid,uuid,text,text,text,text,text) to anon;
grant execute on function public.visitor_totals() to anon,authenticated;
grant execute on function public.visitor_report(integer) to authenticated;
commit;
