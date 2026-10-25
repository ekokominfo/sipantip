-- Admin 3.0 additive migration. Run after analytics.sql / report-v2.sql.
-- Preserves all visitor history and existing admin grants. No keys in this file.
begin;
create table if not exists analytics_private.tracking_versions(
 version integer primary key, started_at timestamptz not null default now()
);
insert into analytics_private.tracking_versions(version) values(3) on conflict do nothing;
create table if not exists analytics_private.map_events(
 id uuid primary key,
 session_id uuid not null references analytics_private.visits(id) on delete cascade,
 action text not null check(length(action)<=64),
 occurred_at timestamptz not null default now()
);
create index if not exists map_events_time_idx on analytics_private.map_events(occurred_at);
create index if not exists map_events_session_idx on analytics_private.map_events(session_id,occurred_at);
alter table analytics_private.map_events enable row level security;
alter table analytics_private.tracking_versions enable row level security;
revoke all on analytics_private.map_events,analytics_private.tracking_versions from public,anon,authenticated;

create or replace function public.record_visit(p_visitor uuid,p_session uuid,p_device text,p_browser text,p_os text,p_referrer text,p_feature text default 'pageview')
returns void language plpgsql security definer set search_path='' as $$
declare v analytics_private.visits%rowtype;
begin
 if p_visitor is null or p_session is null then raise exception 'Invalid identifier'; end if;
 if p_device is null or p_browser is null or p_os is null or p_device not in ('Ponsel','Tablet','Desktop') or p_browser not in ('Chrome','Safari','Firefox','Edge','Lainnya') or p_os not in ('Android','iOS','Windows','macOS','Linux','Lainnya') then raise exception 'Invalid metadata'; end if;
 if p_feature is null or p_feature not in ('pageview','peta-section','district-section','village-section','daily-section','pm-section','data-section','regency-section','weather-section','rain-section','sources-section') then raise exception 'Invalid feature'; end if;
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

create or replace function public.record_map_event(
 p_visitor uuid,p_session uuid,p_event uuid,p_action text,
 p_device text,p_browser text,p_os text,p_referrer text
) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_event is null or p_action is null or p_action not in ('filter:confidence:High','filter:confidence:Medium','filter:confidence:Low','filter:confidence:all','filter:district','filter:period','filter:village','filter:village:clear','filter:reset','search:map','layer:village','layer:district','layer:pm','layer:High','layer:Medium','layer:Low','layer:wind','layer:cloud','layer:rain','location:request','location:clear','nearby:hotspot','nearby:facility','nearby:show','route:open','map:focus','map:fullscreen') then raise exception 'Invalid map action'; end if;
 -- record_visit validates metadata, locks the visitor and enforces session ownership/limits.
 perform public.record_visit(p_visitor,p_session,p_device,p_browser,p_os,p_referrer,'peta-section');
 if not exists(select 1 from analytics_private.visits where id=p_session and visitor_id=p_visitor and last_seen>=now()-interval '24 hours') then return; end if;
 if (select count(*) from analytics_private.map_events where session_id=p_session)>=600 then return; end if;
 if exists(select 1 from analytics_private.map_events where session_id=p_session and action=p_action and occurred_at>now()-interval '500 milliseconds') then return; end if;
 insert into analytics_private.map_events(id,session_id,action) values(p_event,p_session,p_action) on conflict(id) do nothing;
end $$;
revoke all on function public.record_map_event(uuid,uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_map_event(uuid,uuid,uuid,text,text,text,text,text) to anon;

create or replace function public.visitor_report(p_days integer default 30) returns jsonb
language plpgsql security definer set search_path='' as $$
declare since_time timestamptz; result jsonb;
begin
 if auth.uid() is null or not exists(select 1 from analytics_private.admins where user_id=auth.uid()) then raise exception 'Admin access required' using errcode='42501'; end if;
 if p_days is null or p_days not in (7,30,90) then raise exception 'Invalid period'; end if;
 since_time:=((now() at time zone 'Asia/Jakarta')::date-(p_days-1))::timestamp at time zone 'Asia/Jakarta';
 select jsonb_build_object(
 'schema_version',3,
 'generated_at',now(),
 'period',jsonb_build_object('start',since_time,'end',now()),
 'map_tracking_since',(select started_at from analytics_private.tracking_versions where version=3),
 'totals',public.visitor_totals(),
 'new_visitors',(select count(distinct s.visitor_id) from analytics_private.visits s join analytics_private.visitors v on v.id=s.visitor_id where s.started_at>=since_time and v.first_seen>=since_time),
 'returning_visitors',(select count(distinct s.visitor_id) from analytics_private.visits s join analytics_private.visitors v on v.id=s.visitor_id where s.started_at>=since_time and v.first_seen<since_time),
 'previous',jsonb_build_object(
 'start',since_time-make_interval(days=>p_days),
 'end',since_time,
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
 'referrers',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select referrer label,count(*) count from analytics_private.visits where started_at>=since_time group by 1 order by 2 desc) t),
 'features',(select coalesce(jsonb_agg(t),'[]'::jsonb) from (select feature label,count(*) count from analytics_private.activity where visited_at>=since_time and feature<>'pageview' group by 1 order by 2 desc) t),
 'hours_window',jsonb_build_object('start',now()-interval '24 hours','end',now()),
 'hours',(select coalesce(jsonb_agg(t order by t.bucket),'[]'::jsonb) from (
   select b.bucket,extract(hour from b.bucket at time zone 'Asia/Jakarta')::int label,count(v.id) count
   from generate_series(now()-interval '24 hours',now()-interval '1 hour',interval '1 hour') b(bucket)
   left join analytics_private.visits v on v.started_at>=b.bucket and v.started_at<b.bucket+interval '1 hour'
   group by b.bucket
 ) t),
 'map_events',(select coalesce(jsonb_agg(t order by t.count desc,t.label),'[]'::jsonb) from (
   select action label,count(*) count,count(distinct session_id) sessions
   from analytics_private.map_events where occurred_at>=since_time group by action
 ) t),
 'latest',(select max(last_seen) from analytics_private.visitors)
 ) into result;
 return result;
end $$;
commit;
