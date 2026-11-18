import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawnSync} from 'node:child_process';
import {getDb,REPO_ROOT} from './lib/db.mjs';import {migrate} from './migrate.mjs';import {seed} from './seed.mjs';import {run,human} from './festival.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'film-festival-demo-'));process.env.DATABASE_URL='';process.env.DATA_DIR=path.join(root,'db');process.env.OUTPUT_DIR=root;
const db=await getDb();try{await migrate(db);await seed(db);for(const cmd of ['screening-schedule','copy-traffic','compliance'])console.log(`\n${cmd}\n${human(await run(db,[cmd]))}`);}finally{await db.close();}
for(const script of ['view','docs']){const r=spawnSync(process.execPath,[`scripts/${script}.mjs`],{cwd:REPO_ROOT,env:process.env,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||r.stdout);console.log(r.stdout);}
console.log(`Fictional demo workspace: ${root}`);
