import fs from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const readCommands={
 editions:'List festival editions', films:'List films and selection progress', 'film-review':'Read a film and its full evidence',
 'selection-meeting':'Review scores and unreviewed submissions', 'screening-schedule':'Read screening times and readiness',
 'venue-conflicts':'Find room and turnaround conflicts', 'copy-traffic':'Review projection-copy deliveries',
 'rights-desk':'Read rights and classification records', 'guest-desk':'List guest purposes and review dates',
 'guest-itinerary':'Read a guest itinerary', 'guest-conflicts':'Find overlapping guest commitments',
 attention:'Find blocked screenings, overdue copies and quiet films', compliance:'Check recorded exhibition and guest controls',
 'weekly-review':'Combine selection, schedule readiness and copy traffic', insights:'Answer ten cross-festival questions', activity:'Read the change history',
 export:'Export all business records and history', 'draft-chase':'Draft a film evidence chase locally'
};
const writeCommands={
 'add-edition':'Register an edition', 'add-film':'Add a film submission', 'edit-film':'Correct film details',
 review:'Append a selector review', select:'Record a selection decision', 'add-venue':'Register a projection venue',
 clearance:'Record rights and classification evidence', 'request-copy':'Request a projection copy', 'receive-copy':'Record a copy receipt',
 'check-copy':'Record a projection check', schedule:'Plan a screening', reschedule:'Change screening timing', cancel:'Cancel a screening',
 'sign-off':'Sign off a clear screening as an independent reviewer', 'add-guest':'Register a guest and disclosure purpose',
 'review-guest':'Review guest information use', 'add-visit':'Add a guest commitment', 'set-visit':'Confirm or cancel a guest commitment',
 log:'Append a film note', import:'Import an Eventival spreadsheet export with an explicit column map'
};
export const commands={...readCommands,...writeCommands};
const specs={
 'add-edition':['code','name','from','to','jurisdiction','timezone'], 'add-film':['code','name','edition','minutes','country','language','owner','synopsis'],
 'edit-film':['name','minutes','country','language','owner','synopsis','reason'],review:['score','note'],select:['status','reason'],
 'add-venue':['code','name','formats','turnaround'],clearance:['jurisdiction','from','to','rights','limit','route','label','evidence','conditions'],
 'request-copy':['format','due'],'receive-copy':['evidence'],'check-copy':['evidence'],schedule:['code','name','film','venue','starts','qa'],
 reschedule:['starts','venue','qa','reason'],cancel:['reason'],'sign-off':['reason'],
 'add-guest':['code','name','purpose','basis','review-date'],'review-guest':['purpose','basis','review-date','reason'],
 'add-visit':['code','name','guest','starts','ends','location'],'set-visit':['status','reason'],log:['text'],import:['edition','map'],export:['out']
};
function parse(args){
 const [cmd,...rest]=args;const o={};const pos=[];
 for(const a of rest){if(a.startsWith('--')){const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(k in o)throw Error(`Duplicate option --${k}`);o[k]=i<0?true:a.slice(i+1);}else pos.push(a);}
 const allowed=new Set(['json','actor','dry-run',...(specs[cmd]||[])]);
 for(const k of Object.keys(o))if(!allowed.has(k))throw Error(`Unknown option --${k}`);
 if(o['dry-run']!==undefined&&o['dry-run']!==true)throw Error('--dry-run is a boolean flag');
 return {cmd,o,pos};
}
function req(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k}=value is required`);return o[k].trim();}
function int(v,min,max){if(!/^\d+$/.test(String(v))||Number(v)<min||Number(v)>max)throw Error(`Expected integer ${min}..${max}`);return Number(v);}
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Expected a real calendar date YYYY-MM-DD');return v;}
function instant(v){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(v)||!Number.isFinite(Date.parse(v)))throw Error('Timestamp needs an explicit UTC offset, for example 2027-01-15T19:00+13:00');date(v.slice(0,10));return new Date(v).toISOString();}
const oneOf=(v,choices)=>{if(!choices.includes(v))throw Error(`Expected one of ${choices.join(', ')}`);return v;};
const code=v=>{if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(v))throw Error('Code needs letters, numbers, dot, underscore or hyphen');return v;};
async function resolve(db,t,value){
 if(!value)throw Error(`A ${t} identifier is required`);
 let rows=await db.query(`select * from ${t} where lower(code)=lower($1) or id::text=$1`,[value]);
 if(!rows.length)rows=await db.query(`select * from ${t} where starts_with(id::text,lower($1)) or position(lower($1) in lower(name))>0 order by code`,[value]);
 if(rows.length!==1){const e=Error(rows.length?`Ambiguous ${t}: ${value}`:`${t} not found: ${value}`);e.candidates=rows.map(r=>({id:r.id,code:r.code,name:r.name}));throw e;}return rows[0];
}
async function insert(db,t,data){const keys=Object.keys(data);return(await db.query(`insert into ${t}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(data)))[0];}
async function update(db,t,id,data){const keys=Object.keys(data);return(await db.query(`update ${t} set ${keys.map((k,i)=>`${k}=$${i+2}`).join(',')} where id=$1 returning *`,[id,...Object.values(data)]))[0];}
async function note(db,f,actor,body){return insert(db,'notes',{film_id:f.id,actor,body});}
const tables=['editions','films','reviews','venues','clearances','copies','screenings','guests','visits','notes','activity'];
export const questions=[
 ['Which submissions still have no selector review?',"select f.code,f.name,f.owner from films f where f.status='submitted' and not exists(select 1 from reviews r where r.film_id=f.id) order by f.code"],
 ['Which selected films have no screening?',"select code,name,owner from v_selection where status='selected' and screenings=0 order by code"],
 ['Which films divide the selection panel?',"select f.code,f.name,min(r.score) as low,max(r.score) as high from films f join reviews r on r.film_id=f.id group by f.id having max(r.score)-min(r.score)>=2 order by f.code"],
 ['Which owners are waiting on overdue copies?',"select owner,count(*)::int as overdue from v_delivery where attention='Overdue copy' group by owner order by owner"],
 ['Which screening slots clash after turnaround is allowed for?',"select code,venue,conflicts_with from v_conflicts order by code,conflicts_with"],
 ['Which signed-off sessions need a new evidence review?',"select code,film,readiness from v_release where approved_hash is not null and readiness<>'signed off' and not cancelled order by code"],
 ['Which films exceed their licensed screening allowance?',"select f.code,f.name,c.max_screenings,count(s.id)::int as scheduled from films f join clearances c on c.film_id=f.id join screenings s on s.film_id=f.id and not s.cancelled group by f.id,c.max_screenings having count(s.id)>c.max_screenings order by f.code"],
 ['Which guests have overlapping commitments?',"select * from v_guest_conflicts order by code"],
 ['Which programme owners have the most blocked screenings?',"select owner,count(*)::int as blocked from v_release where readiness='blocked' group by owner order by blocked desc,owner"],
 ['Which screening days have the most programmed minutes?',"select edition,local_day,sum(minutes+qa_minutes)::int as programme_minutes from v_schedule where not cancelled group by edition,local_day order by local_day,edition"]
];
async function read(db,cmd,pos,o){
 const queries={editions:'select * from editions order by starts,code',films:'select * from v_selection order by code',
 'selection-meeting':'select * from v_selection order by status,average_score desc nulls last,code',
 'screening-schedule':"select code,film,venue,local_start,timezone,minutes,qa_minutes,readiness,array_to_string(blockers,'; ') as blockers from v_release order by starts,code",
 'venue-conflicts':'select code,film,venue,conflicts_with,reason from v_conflicts order by code,conflicts_with',
 'copy-traffic':'select code,name,owner,format,due,delivery_status,attention from v_delivery order by due nulls first,code',
 'rights-desk':'select f.code,f.name,c.jurisdiction,c.rights_from,c.rights_to,c.max_screenings,c.classification_route,c.classification_label,c.conditions from films f left join clearances c on c.film_id=f.id order by f.code',
 'guest-desk':'select code,name,purpose,disclosure_basis,review_due from guests order by code',
 'guest-conflicts':'select * from v_guest_conflicts order by code',compliance:'select * from v_compliance order by record,rule',
 activity:'select entity,actor,operation,created_at,entity_id from activity order by created_at,id'};
 if(queries[cmd])return db.query(queries[cmd]);
 if(cmd==='film-review'){
  const f=await resolve(db,'films',pos[0]);const out={film:f};
  for(const t of ['reviews','clearances','copies','screenings','notes'])out[t]=await db.query(`select * from ${t} where film_id=$1 order by created_at,id`,[f.id]);return out;
 }
 if(cmd==='guest-itinerary'){const g=await resolve(db,'guests',pos[0]);return {guest:g,visits:await db.query('select code,name,starts,ends,location,status from visits where guest_id=$1 order by starts,code',[g.id])};}
 if(cmd==='attention')return {screenings:await db.query("select code,film,readiness,array_to_string(blockers,'; ') as blockers from v_release where not cancelled and readiness<>'signed off' order by starts,code"),copies:await read(db,'copy-traffic',[],{}),quiet_films:await db.query("select f.code,f.name,f.owner from films f where f.status<>'rejected' and greatest(f.updated_at,coalesce((select max(created_at) from notes where film_id=f.id),f.created_at),coalesce((select max(created_at) from reviews where film_id=f.id),f.created_at))<now()-interval '7 days' order by f.code")};
 if(cmd==='weekly-review')return {selection:await read(db,'selection-meeting',[],{}),screenings:await read(db,'screening-schedule',[],{}),copies:await read(db,'copy-traffic',[],{})};
 if(cmd==='insights'){const out=[];for(const [question,sql] of questions)out.push({question,rows:await db.query(sql)});return out;}
 if(cmd==='export'){const out={format:'film-festival-v1',exported_at:new Date().toISOString()};for(const t of tables)out[t]=await db.query(`select * from ${t} order by id`);return out;}
 if(cmd==='draft-chase'){const f=await resolve(db,'films',pos[0]);return {film:f.code,title:f.name,owner:f.owner,delivery:await db.query('select attention,due,format from v_delivery where id=$1',[f.id]),screenings:await db.query('select code,local_start,blockers from v_readiness where film_id=$1 and not cancelled order by starts',[f.id])};}
 throw Error('Unknown read command');
}
async function write(db,cmd,pos,o,actor){
 if(cmd==='add-edition'){
  const timezone=o.timezone||'Pacific/Auckland';try{new Intl.DateTimeFormat('en',{timeZone:timezone});}catch{throw Error('Unknown timezone');}
  return insert(db,'editions',{code:code(req(o,'code')),name:req(o,'name'),starts:date(req(o,'from')),ends:date(req(o,'to')),jurisdiction:oneOf(req(o,'jurisdiction'),['NZ','AU']),timezone});
 }
 if(cmd==='add-film'){const e=await resolve(db,'editions',req(o,'edition'));return insert(db,'films',{code:code(req(o,'code')),name:req(o,'name'),edition_id:e.id,minutes:int(req(o,'minutes'),1,1440),country:req(o,'country'),language:req(o,'language'),owner:req(o,'owner'),synopsis:o.synopsis||''});}
 if(cmd==='add-venue')return insert(db,'venues',{code:code(req(o,'code')),name:req(o,'name'),formats:req(o,'formats').split(',').map(v=>oneOf(v,['DCP','ProRes','H264','35mm'])),turnaround:int(req(o,'turnaround'),0,240)});
 if(cmd==='add-guest')return insert(db,'guests',{code:code(req(o,'code')),name:req(o,'name'),purpose:req(o,'purpose'),disclosure_basis:req(o,'basis'),review_due:date(req(o,'review-date'))});
 if(cmd==='review-guest'){req(o,'reason');const g=await resolve(db,'guests',pos[0]);return update(db,'guests',g.id,{purpose:req(o,'purpose'),disclosure_basis:req(o,'basis'),review_due:date(req(o,'review-date'))});}
 if(cmd==='add-visit'){const g=await resolve(db,'guests',req(o,'guest'));return insert(db,'visits',{code:code(req(o,'code')),name:req(o,'name'),guest_id:g.id,starts:instant(req(o,'starts')),ends:instant(req(o,'ends')),location:req(o,'location')});}
 if(cmd==='set-visit'){req(o,'reason');const v=await resolve(db,'visits',pos[0]);return update(db,'visits',v.id,{status:oneOf(req(o,'status'),['provisional','confirmed','cancelled'])});}
 if(cmd==='schedule'){
  const f=await resolve(db,'films',req(o,'film'));const v=await resolve(db,'venues',req(o,'venue'));
  return insert(db,'screenings',{code:code(req(o,'code')),name:req(o,'name'),film_id:f.id,venue_id:v.id,starts:instant(req(o,'starts')),qa_minutes:int(o.qa||0,0,240),planned_by:actor});
 }
 if(['reschedule','cancel','sign-off'].includes(cmd)){
  const s=await resolve(db,'screenings',pos[0]);const reason=req(o,'reason');
  if(cmd==='cancel')return update(db,'screenings',s.id,{cancelled:true,approval_note:reason});
  if(s.cancelled)throw Error('Screening is cancelled');
  if(cmd==='reschedule'){
   const data={starts:instant(req(o,'starts')),planned_by:actor,approved_hash:null,approved_by:null,approved_at:null,approval_note:reason};
   if(o.qa!==undefined)data.qa_minutes=int(o.qa,0,240);if(o.venue)data.venue_id=(await resolve(db,'venues',req(o,'venue'))).id;
   return update(db,'screenings',s.id,data);
  }
  const r=(await db.query('select * from v_readiness where id=$1',[s.id]))[0];
  if(r.blockers.length)throw Error(`Screening blocked: ${r.blockers.join('; ')}`);
  if(s.planned_by.trim().toLowerCase()===actor.toLowerCase())throw Error('Independent reviewer must differ from the planner');
  return update(db,'screenings',s.id,{approved_hash:r.evidence_hash,approved_by:actor,approved_at:new Date().toISOString(),approval_note:reason});
 }
 if(cmd==='import'){
  if(pos[0]!=='eventival'||!pos[1])throw Error('Usage: import eventival <export.csv> --edition=... --map=... --actor=...');
  const e=await resolve(db,'editions',req(o,'edition'));const map=JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT,req(o,'map')),'utf8'));
  const required=['source_id','name','minutes','country','language','owner'];
  for(const k of required)if(typeof map[k]!=='string'||!map[k])throw Error(`Mapping needs ${k}`);
  if(Object.keys(map).some(k=>![...required,'synopsis'].includes(k)))throw Error('Unknown mapping destination');
  const rows=parseCsv(fs.readFileSync(path.resolve(REPO_ROOT,pos[1]),'utf8'));if(!rows.length)throw Error('No data rows');
  for(const field of Object.values(map))if(!(field in rows[0]))throw Error(`Missing mapped column: ${field}`);
  const ids=new Set();let added=0,replayed=0;
  for(const row of rows){
   const value=k=>String(row[map[k]]||'').trim();for(const k of required)if(!value(k))throw Error(`Missing ${k} in source row`);
   const source=value('source_id');if(ids.has(source))throw Error(`Duplicate source identifier: ${source}`);ids.add(source);
   const digest=hash(JSON.stringify(row));const old=(await db.query('select * from films where edition_id=$1 and source_id=$2',[e.id,source]))[0];
   if(old){if(old.source_hash!==digest)throw Error(`Source ${source} changed; reconcile it before importing again`);replayed++;continue;}
   await insert(db,'films',{code:`EV-${hash(e.id+':'+source).slice(0,16)}`,name:value('name'),minutes:int(value('minutes'),1,1440),edition_id:e.id,country:value('country'),language:value('language'),owner:value('owner'),synopsis:map.synopsis?value('synopsis'):'',source_id:source,source_record:JSON.stringify(row),source_hash:digest});added++;
  }
  return {rows:rows.length,added,replayed,dry_run:Boolean(o['dry-run']),edition:e.code};
 }
 const f=await resolve(db,'films',pos[0]);
 if(cmd==='edit-film'){
  const reason=req(o,'reason');const data={};for(const k of ['name','country','language','owner','synopsis'])if(o[k]!==undefined)data[k]=req(o,k);
  if(o.minutes!==undefined)data.minutes=int(o.minutes,1,1440);if(!Object.keys(data).length)throw Error('Supply at least one field to correct');
  await note(db,f,actor,`Correction: ${reason}`);return update(db,'films',f.id,data);
 }
 if(cmd==='review')return insert(db,'reviews',{film_id:f.id,reviewer:actor,score:int(req(o,'score'),1,5),note:req(o,'note')});
 if(cmd==='select'){
  const status=oneOf(req(o,'status'),['submitted','selected','rejected']);const reason=req(o,'reason');
  if(status==='selected'&&!(await db.query('select id from reviews where film_id=$1',[f.id])).length)throw Error('Record a selector review first');
  await note(db,f,actor,`Selection ${status}: ${reason}`);return update(db,'films',f.id,{status});
 }
 if(cmd==='clearance'){
  const data={film_id:f.id,jurisdiction:oneOf(req(o,'jurisdiction'),['NZ','AU']),rights_from:date(req(o,'from')),rights_to:date(req(o,'to')),rights_evidence:req(o,'rights'),max_screenings:int(req(o,'limit'),1,10000),classification_route:oneOf(req(o,'route'),['classified','exemption']),classification_label:req(o,'label'),classification_evidence:req(o,'evidence'),conditions:req(o,'conditions'),recorded_by:actor};
  const old=(await db.query('select id from clearances where film_id=$1',[f.id]))[0];return old?update(db,'clearances',old.id,data):insert(db,'clearances',data);
 }
 if(cmd==='request-copy'){
  const data={film_id:f.id,format:oneOf(req(o,'format'),['DCP','ProRes','H264','35mm']),due:date(req(o,'due')),status:'requested',evidence:'',checked_by:null};
  const old=(await db.query('select id from copies where film_id=$1',[f.id]))[0];return old?update(db,'copies',old.id,data):insert(db,'copies',data);
 }
 if(['receive-copy','check-copy'].includes(cmd)){
  const cp=(await db.query('select * from copies where film_id=$1',[f.id]))[0];if(!cp)throw Error('Request the copy first');
  if(cmd==='receive-copy'&&cp.status!=='requested')throw Error('Only a requested copy can be received');
  if(cmd==='check-copy'&&cp.status!=='received')throw Error('Receive the copy before its projection check');
  return update(db,'copies',cp.id,{status:cmd==='receive-copy'?'received':'checked',evidence:req(o,'evidence'),checked_by:cmd==='check-copy'?actor:null});
 }
 if(cmd==='log')return note(db,f,actor,req(o,'text'));
 throw Error('Unknown write command');
}
export async function run(db,args){
 const {cmd,o,pos}=parse(args);if(!commands[cmd])throw Error(`Unknown command: ${cmd||'(none)'}`);
 const needsRef=['film-review','guest-itinerary','draft-chase','edit-film','review','select','clearance','request-copy','receive-copy','check-copy','reschedule','cancel','sign-off','review-guest','set-visit','log'];
 const wanted=cmd==='import'?2:needsRef.includes(cmd)?1:0;if(pos.length!==wanted)throw Error(`${cmd} expects ${wanted} positional argument(s)`);
 const mut=cmd in writeCommands;const actor=mut?req(o,'actor'):null;
 if(o['dry-run']&&!mut)throw Error('--dry-run is only for record changes');
 await db.exec(mut?'BEGIN':'BEGIN READ ONLY');let result;
 try{
  if(mut){await db.exec('LOCK TABLE editions,films,venues,screenings,clearances,copies,guests,visits IN SHARE ROW EXCLUSIVE MODE');await db.query("select set_config('app.actor',$1,true)",[actor]);await db.query("select set_config('app.reason',$1,true)",[o.reason||o.note||o.evidence||cmd]);}
  result=mut?await write(db,cmd,pos,o,actor):await read(db,cmd,pos,o);
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');
 }catch(e){await db.exec('ROLLBACK');throw e;}
 if(cmd==='export'&&o.out){const file=path.resolve(REPO_ROOT,req(o,'out'));fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});return {file,format:result.format};}
 if(cmd==='draft-chase'){
  const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,`${result.film}-${randomUUID()}.md`);
  const text=`# Draft only: ${result.title}\n\nOwner: ${result.owner}\n\nRecorded delivery position:\n${JSON.stringify(result.delivery,null,2)}\n\nScreening evidence still to review:\n${JSON.stringify(result.screenings,null,2)}\n\nPlease confirm the missing exhibition and projection evidence with the relevant owner. No message has been sent.\n`;
  fs.writeFileSync(file,text,{flag:'wx',mode:0o600});return {file,sent:false};
 }
 return result;
}
export function human(value){
 if(Array.isArray(value)){if(value.some(x=>x?.question))return value.map(x=>x.question+'\n'+human(x.rows)).join('\n\n');if(!value.length)return '(none)';return table(value,Object.keys(value[0]).filter(k=>!['id','source_record','source_hash'].includes(k)).map(key=>({key,label:key.replaceAll('_',' '),width:60,format:v=>v instanceof Date?v.toISOString():v&&typeof v==='object'?JSON.stringify(v):v})));}
 if(value&&typeof value==='object')return Object.entries(value).map(([k,v])=>`${k}\n${typeof v==='object'?human(Array.isArray(v)?v:[v]):v}`).join('\n\n');return String(value);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=process.argv.slice(2);
 if(!args.length||args.includes('--help')){console.log(Object.entries(commands).map(([c,d])=>`${c.padEnd(22)} ${d}`).join('\n'));console.log('\nSee docs/cli.md for arguments.');}
 else{let db;try{db=await getDb();const result=await run(db,args);console.log(args.includes('--json')?JSON.stringify(result,null,2):human(result));}catch(e){console.error(args.includes('--json')?JSON.stringify({error:e.message,...(e.candidates?{candidates:e.candidates}:{})}):e.message+(e.candidates?'\n'+human(e.candidates):''));process.exitCode=1;}finally{if(db)await db.close();}}
}
