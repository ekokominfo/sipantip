begin;
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
commit;
