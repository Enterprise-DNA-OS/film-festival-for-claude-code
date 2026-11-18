select set_config('app.actor','Fictional demo seed',true);
do $$ declare e uuid; f1 uuid; f2 uuid; f3 uuid; v1 uuid; v2 uuid; g uuid; begin
 if exists(select 1 from editions where code='DEMO') then return; end if;
 insert into editions(code,name,starts,ends,jurisdiction) values('DEMO','Harbour Light Film Weekend',current_date,current_date+10,'NZ') returning id into e;
 insert into films(code,name,edition_id,minutes,country,language,owner,status,synopsis) values
 ('FILM-01','Tidal Stories',e,82,'New Zealand','English','Mere','selected','Fictional documentary about a coastal community.') returning id into f1;
 insert into films(code,name,edition_id,minutes,country,language,owner,status,synopsis) values
 ('FILM-02','Tidal Gardens',e,71,'Australia','English','Alex','selected','Fictional film about a community garden.') returning id into f2;
 insert into films(code,name,edition_id,minutes,country,language,owner,status,created_at,updated_at) values('FILM-03','Paper Kites',e,18,'New Zealand','English','Mere','submitted',now()-interval '12 days',now()-interval '12 days') returning id into f3;
 insert into reviews(film_id,reviewer,score,note) values(f1,'Selector One',5,'Strong fit for the opening programme.'),(f1,'Selector Two',4,'Confirm subtitles for the final copy.'),(f2,'Selector One',3,'Follow up exhibition conditions.');
 insert into venues(code,name,formats,turnaround) values('HALL','Harbour Hall',array['DCP','ProRes'],20) returning id into v1;
 insert into venues(code,name,formats,turnaround) values('STUDIO','Harbour Studio',array['H264','ProRes'],15) returning id into v2;
 insert into clearances(film_id,jurisdiction,rights_from,rights_to,rights_evidence,max_screenings,classification_route,classification_label,classification_evidence,conditions,recorded_by)
 values(f1,'NZ',current_date,current_date+10,'Fictional licence DEMO-L01',2,'classified','PG, fictional demonstration only','Fictional label DEMO-C01','Check the real licence and label before any actual exhibition','Demo Operator');
 insert into copies(film_id,format,due,status,evidence,checked_by) values(f1,'DCP',current_date-2,'checked','Fictional projection check DEMO-QC01','Projectionist'),(f2,'ProRes',current_date-3,'requested','',null);
 insert into screenings(code,name,film_id,venue_id,starts,qa_minutes,planned_by) values
 ('SHOW-01','Opening session',f1,v1,(current_date+2+time '06:00') at time zone 'UTC',15,'Programme Manager'),
 ('SHOW-02','Community session',f2,v1,(current_date+2+time '07:00') at time zone 'UTC',10,'Programme Manager'),
 ('SHOW-03','Morning repeat',f1,v1,(current_date+3+time '21:00') at time zone 'UTC',0,'Programme Manager');
 insert into guests(code,name,purpose,disclosure_basis,review_due) values('GUEST-01','Rowan Demo','Host the opening discussion','Agreed sharing with the festival transport coordinator',current_date-1) returning id into g;
 insert into visits(code,name,guest_id,starts,ends,location) values
 ('VISIT-01','Station pickup',g,(current_date+2+time '04:00') at time zone 'UTC',(current_date+2+time '05:00') at time zone 'UTC','Central Station'),
 ('VISIT-02','Sound check',g,(current_date+2+time '04:30') at time zone 'UTC',(current_date+2+time '05:30') at time zone 'UTC','Harbour Hall');
 insert into notes(film_id,actor,body,created_at) values(f2,'Demo Operator','Distributor has not supplied the exhibition letter.',now()-interval '12 days');
end $$;
