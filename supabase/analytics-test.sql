-- Transactional checks: all test visits are rolled back, never counted publicly.
begin;
do $$
declare before_total bigint; after_total bigint; v uuid:=gen_random_uuid(); s uuid:=gen_random_uuid();
begin
 select (public.visitor_totals()->>'total')::bigint into before_total;
 perform public.record_visit(v,s,'Desktop','Firefox','Linux','langsung');
 perform public.record_visit(v,s,'Desktop','Firefox','Linux','langsung');
 perform public.record_visit(v,s,'Desktop','Firefox','Linux','langsung','peta-section');
 select (public.visitor_totals()->>'total')::bigint into after_total;
 assert after_total=before_total+1,'Duplicate visitor counted';
 assert (select count(*)=1 from analytics_private.visits where visitor_id=v),'Duplicate session';
 assert (select views=1 from analytics_private.visits where id=s),'Refresh not deduplicated';
 begin
  perform public.record_visit(gen_random_uuid(),s,'Desktop','Firefox','Linux','langsung');
  raise exception 'Mismatched session was accepted';
 exception when raise_exception then
  if sqlerrm<>'Session mismatch' then raise; end if;
 end;
 begin
  perform public.record_visit(v,gen_random_uuid(),'Desktop','Firefox','Linux','example.org/private?secret=1');
  raise exception 'Private URL accepted';
 exception when raise_exception then
  if sqlerrm<>'Invalid referrer' then raise; end if;
 end;
end $$;
set local role anon;
do $$ begin
 perform public.visitor_totals();
 begin perform public.visitor_report(30);raise exception 'Anonymous report allowed';exception when insufficient_privilege then null;end;
 begin perform 1 from analytics_private.visits;raise exception 'Anonymous table access allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
do $$ begin
 begin perform public.visitor_report(30);raise exception 'Unapproved user report allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: deduplication, validation, anonymous denial, non-admin denial' as result;
rollback;
