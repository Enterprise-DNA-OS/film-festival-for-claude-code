create table editions (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 starts date not null, ends date not null, jurisdiction text not null check(jurisdiction in ('NZ','AU')),
 timezone text not null default 'Pacific/Auckland', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends>=starts)
);
create table films (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 edition_id uuid not null references editions, minutes integer not null check(minutes between 1 and 1440),
 country text not null, language text not null, owner text not null, synopsis text not null default '',
 status text not null default 'submitted' check(status in ('submitted','selected','rejected')),
 source_id text, source_record jsonb, source_hash text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(edition_id,source_id)
);
create table reviews (
 id uuid primary key default gen_random_uuid(), film_id uuid not null references films,
 reviewer text not null, score integer not null check(score between 1 and 5), note text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table venues (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 formats text[] not null, turnaround integer not null check(turnaround between 0 and 240),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table clearances (
 id uuid primary key default gen_random_uuid(), film_id uuid unique not null references films,
 jurisdiction text not null check(jurisdiction in ('NZ','AU')), rights_from date not null, rights_to date not null,
 rights_evidence text not null, max_screenings integer not null check(max_screenings>0),
 classification_route text not null check(classification_route in ('classified','exemption')),
 classification_label text not null, classification_evidence text not null, conditions text not null,
 recorded_by text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(rights_to>=rights_from)
);
create table copies (
 id uuid primary key default gen_random_uuid(), film_id uuid unique not null references films,
 format text not null check(format in ('DCP','ProRes','H264','35mm')), due date not null,
 status text not null default 'requested' check(status in ('requested','received','checked')),
 evidence text not null default '', checked_by text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(status<>'checked' or (length(trim(evidence))>0 and length(trim(checked_by))>0))
);
create table screenings (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 film_id uuid not null references films, venue_id uuid not null references venues,
 starts timestamptz not null, qa_minutes integer not null default 0 check(qa_minutes between 0 and 240),
 cancelled boolean not null default false, planned_by text not null,
 approved_hash text, approved_by text, approved_at timestamptz, approval_note text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table guests (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 purpose text not null, disclosure_basis text not null, review_due date not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table visits (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null,
 guest_id uuid not null references guests, starts timestamptz not null, ends timestamptz not null,
 location text not null, status text not null default 'provisional' check(status in ('provisional','confirmed','cancelled')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends>starts)
);
create table notes (
 id uuid primary key default gen_random_uuid(), film_id uuid not null references films, actor text not null, body text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table activity (
 id uuid primary key default gen_random_uuid(), entity text not null, entity_id uuid not null, actor text not null,
 operation text not null, reason text not null default '', before_row jsonb, after_row jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function audit_change() returns trigger language plpgsql as $$
declare who text;
begin
 who:=current_setting('app.actor',true);
 if coalesce(trim(who),'')='' then raise exception 'An actor is required'; end if;
 if tg_op='UPDATE' then new.updated_at:=clock_timestamp(); end if;
 if tg_op='DELETE' then raise exception 'Deletion is disabled; cancel or reject instead'; end if;
 insert into activity(entity,entity_id,actor,operation,reason,before_row,after_row)
 values(tg_table_name,new.id,who,tg_op,coalesce(current_setting('app.reason',true),''),case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end $$;
create function immutable_history() returns trigger language plpgsql as $$ begin raise exception 'History is append only'; end $$;
create trigger activity_immutable before update or delete on activity for each row execute function immutable_history();
create trigger reviews_immutable before update or delete on reviews for each row execute function immutable_history();
create trigger notes_immutable before update or delete on notes for each row execute function immutable_history();
do $$ declare t text; begin
 foreach t in array array['editions','films','reviews','venues','clearances','copies','screenings','guests','visits','notes'] loop
 execute format('create trigger audit before insert or update or delete on %I for each row execute function audit_change()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
 alter table activity enable row level security;
 revoke all on activity from public;
end $$;
create view v_schedule as
 select s.*, f.name as film, f.code as film_code, f.status as selection, f.owner, f.minutes,
 e.code as edition, e.jurisdiction, e.starts as edition_start, e.ends as edition_end, e.timezone,
 v.name as venue, v.formats, v.turnaround,
 s.starts + (f.minutes+s.qa_minutes)*interval '1 minute' as ends,
 s.starts + (f.minutes+s.qa_minutes+v.turnaround)*interval '1 minute' as clear_at,
 (s.starts at time zone e.timezone)::date as local_day,
 to_char(s.starts at time zone e.timezone,'YYYY-MM-DD HH24:MI') as local_start
 from screenings s join films f on f.id=s.film_id join editions e on e.id=f.edition_id join venues v on v.id=s.venue_id;
create view v_conflicts as
 select a.id, a.code, a.film, a.venue, b.code as conflicts_with,
 'Room occupied or turnaround incomplete'::text as reason
 from v_schedule a join v_schedule b on a.venue_id=b.venue_id and a.id<>b.id
 and a.starts<b.clear_at and b.starts<a.clear_at where not a.cancelled and not b.cancelled;
create view v_readiness as
 select s.*,
 array_remove(array[
 case when s.selection<>'selected' then 'Film not selected' end,
 case when s.local_day<s.edition_start or s.local_day>s.edition_end then 'Outside edition dates' end,
 case when c.id is null then 'Rights and classification evidence missing' end,
 case when c.id is not null and c.jurisdiction<>s.jurisdiction then 'Wrong clearance jurisdiction' end,
 case when c.id is not null and (s.local_day<c.rights_from or s.local_day>c.rights_to) then 'Outside licensed dates' end,
 case when c.id is not null and (select count(*) from screenings x where x.film_id=s.film_id and not x.cancelled)>c.max_screenings then 'Licensed screening count exceeded' end,
 case when cp.id is null or cp.status<>'checked' then 'Projection copy not checked' end,
 case when cp.id is not null and not(cp.format=any(s.formats)) then 'Unsupported projection format' end,
 case when exists(select 1 from v_conflicts x where x.id=s.id) then 'Venue time conflict' end
 ],null) as blockers,
 md5(jsonb_build_object('screening',s.code,'start',s.starts,'qa',s.qa_minutes,'film',s.film,'duration',s.minutes,
 'selected',s.selection,'venue',s.venue,'formats',s.formats,'turnaround',s.turnaround,'edition',s.edition,
 'edition_start',s.edition_start,'edition_end',s.edition_end,'timezone',s.timezone,'jurisdiction',s.jurisdiction,
 'clearance',to_jsonb(c),'copy',to_jsonb(cp))::text) as evidence_hash
 from v_schedule s left join clearances c on c.film_id=s.film_id left join copies cp on cp.film_id=s.film_id;
create view v_release as
 select *, case when cancelled then 'cancelled' when cardinality(blockers)>0 then 'blocked'
 when approved_hash=evidence_hash then 'signed off' when approved_hash is not null then 'review changed evidence' else 'awaiting sign-off' end as readiness
 from v_readiness;
create view v_selection as
 select f.id,f.code,f.name,f.owner,f.status,f.minutes,
 count(r.id)::int as reviews,round(avg(r.score),2) as average_score,
 (select max(created_at) from reviews where film_id=f.id) as last_review,
 (select count(*) from screenings s where s.film_id=f.id and not s.cancelled)::int as screenings
 from films f left join reviews r on r.film_id=f.id group by f.id;
create view v_delivery as
 select f.id,f.code,f.name,f.owner,c.format,c.due,c.status,c.evidence,
 coalesce(c.status,'not requested') as delivery_status,
 case when c.id is null then 'Request copy' when c.status<>'checked' and c.due<current_date then 'Overdue copy'
 when c.status='received' then 'Projection check due' when c.status='requested' then 'Awaiting copy' else 'Checked' end as attention
 from films f left join copies c on c.film_id=f.id where f.status='selected';
create view v_guest_conflicts as
 select a.code,a.name,g.name as guest,b.code as conflicts_with from visits a join visits b
 on a.guest_id=b.guest_id and a.id<>b.id and a.starts<b.ends and b.starts<a.ends
 join guests g on g.id=a.guest_id where a.status<>'cancelled' and b.status<>'cancelled';
create view v_compliance as
 select code as record, 'exhibition-readiness'::text as rule,array_to_string(blockers,'; ') as issue
 from v_readiness where not cancelled and cardinality(blockers)>0
 union all select code,'guest-disclosure-review','Review purpose and disclosure basis before sharing itinerary'
 from guests where review_due<current_date or trim(purpose)='' or trim(disclosure_basis)=''
 union all select code,'guest-timing','Overlaps with '||conflicts_with from v_guest_conflicts;

alter table clearances add constraint clearance_evidence_present check (
 length(trim(rights_evidence))>0 and length(trim(classification_label))>0 and length(trim(classification_evidence))>0 and length(trim(conditions))>0 and length(trim(recorded_by))>0
);
