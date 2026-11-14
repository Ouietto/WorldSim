#!/usr/bin/env node
// Run many Earth histories in parallel and score them against historical targets.
//
//   node tools/ensemble.js                      16 seeds of the working tree to 1500 CE
//   node tools/ensemble.js --seeds 1-24 --end 1 runs to 1 CE (metrics after that are skipped)
//   node tools/ensemble.js --ref HEAD~1         also runs the same seeds on another commit and compares, seed by seed
//   node tools/ensemble.js --env P_pull=0.5     runs a variant (slider overrides, ABL ablation switches, SW test switches)
//   node tools/ensemble.js --base-env ABL=sack  environment for the comparison side
//   node tools/ensemble.js --variants tools/ensemble-request.json
//                                               runs every variant listed there (the first is the base) and compares
//                                               each with the base; --variants 'base=;river=SW=river' works too
//
// Results are cached by source contents, seed, end year and environment, so the baseline costs nothing the second time.
// The score counts scored targets only (see cls in targets.js); "all 41" is the old score over the original targets.
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{spawn,execFileSync}=require('child_process');
const ROOT=path.join(__dirname,'..'),TARGETS=require('./targets.js');
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js','earth_elev.b64','koppen.b64','earth_climate.b64','earth_pid.b64','earth_fp.b64','earth_lake.b64'];
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const range=s=>String(s).split(',').flatMap(p=>{const m=p.match(/^(\d+)-(\d+)$/);if(!m)return[p];const a=[];for(let i=+m[1];i<=+m[2];i++)a.push(String(i));return a});
const parseEnv=s=>Object.fromEntries((s||'').split(/\s+/).filter(Boolean).map(kv=>{const i=kv.indexOf('=');return[kv.slice(0,i),kv.slice(i+1)]}));
function loadVariants(spec){if(!spec)return null;let list;
  if(fs.existsSync(spec)){const r=JSON.parse(fs.readFileSync(spec,'utf8'));list=r.variants||[{name:'base',env:r.env||''}]}
  else list=spec.split(';').filter(Boolean).map(p=>{const i=p.indexOf('=');return{name:p.slice(0,i),env:p.slice(i+1)}});
  return list.map(v=>({name:v.name,env:parseEnv(v.env)}))}
const VARIANTS=loadVariants(arg('variants',null));
const REQ=VARIANTS&&fs.existsSync(arg('variants'))?JSON.parse(fs.readFileSync(arg('variants'),'utf8')):{};
const SEEDS=range(arg('seeds',REQ.seeds||'1-16')),END=+arg('end',REQ.end??1500),JOBS=+arg('jobs',Math.max(1,os.cpus().length)),REF=arg('ref',null),LABEL=arg('label',null);
const ENV=parseEnv(arg('env','')),BENV=parseEnv(arg('base-env',''));
const OUT=path.join(ROOT,'reports'),CACHE=path.join(OUT,'cache');fs.mkdirSync(CACHE,{recursive:true});

function srcHash(dir,env){const h=crypto.createHash('sha1');for(const f of CORE){const p=path.join(dir,f);if(fs.existsSync(p))h.update(f).update(fs.readFileSync(p))}h.update(fs.readFileSync(path.join(__dirname,'run1.js')));h.update(JSON.stringify(env));return h.digest('hex').slice(0,12)}
function worktreeFor(ref){const sha=execFileSync('git',['-C',ROOT,'rev-parse','--short',ref]).toString().trim(),dir=path.join(os.tmpdir(),'asabiya-ref-'+sha);
  if(!fs.existsSync(dir))execFileSync('git',['-C',ROOT,'worktree','add','--detach',dir,sha],{stdio:'ignore'});return{dir:path.join(dir,'src'),name:ref+' ('+sha+')'}}

async function runAll(jobs){let next=0,done=0;const t0=Date.now();
  await Promise.all(Array.from({length:Math.min(JOBS,jobs.length)},async()=>{while(next<jobs.length){const j=jobs[next++];
    if(!fs.existsSync(j.cache)){const line=await new Promise((res,rej)=>{let o='',e='';const p=spawn(process.execPath,[path.join(__dirname,'run1.js'),j.seed,String(END),j.dir],{env:Object.assign({},process.env,j.env)});
        p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);p.on('close',c=>c===0?res(o.trim().split('\n').pop()):rej(new Error(`seed ${j.seed} failed:\n${e.slice(-2000)}`)))});
      fs.writeFileSync(j.cache,line)}
    done++;process.stderr.write(`\r  ${done}/${jobs.length} runs done (${((Date.now()-t0)/60000).toFixed(1)} min)   `)}}));
  process.stderr.write('\n');return jobs.map(j=>JSON.parse(fs.readFileSync(j.cache,'utf8')))}

const NEVER=1e9,applies=t=>!(t.at!=null&&t.at>END)&&!(t.kind==='year'&&t.hi>END)&&!((t.k.startsWith('s_')||t.k.startsWith('fs_'))&&END<1500)&&!(['cUnity','medMax','ewShare'].includes(t.k)&&END<1),
  val=(r,t)=>{const v=t.get?t.get(r):r[t.k];return v==null?(t.kind==='year'?NEVER:null):v},inBand=(v,t)=>v!=null&&v!==NEVER&&v>=t.lo&&v<=t.hi,
  median=a=>{const s=a.filter(v=>v!=null).sort((x,y)=>x-y);if(!s.length)return null;const m=s.length>>1;return s.length%2?s[m]:(s[m-1]===NEVER||s[m]===NEVER?Math.max(s[m-1],s[m]):(s[m-1]+s[m])/2)},
  q=(a,p)=>{const s=a.filter(v=>v!=null).sort((x,y)=>x-y);return s.length?s[Math.min(s.length-1,Math.floor(p*(s.length-1)+0.5))]:null},
  fmt=(v,t)=>v==null?'–':v===NEVER?'never':t.kind==='share'?Math.round(v*100)+'%':t.kind==='year'?(v<=0?Math.round(1-v)+' BCE':Math.round(v)+' CE'):t.dec?v.toFixed(t.dec):Math.round(v).toString(),
  miss=(v,t)=>v==null?null:v===NEVER?1:v<t.lo?(t.lo-v)/(t.hi-t.lo):v>t.hi?(v-t.hi)/(t.hi-t.lo):0,
  cval=(r,t)=>{const v=val(r,t);if(v==null)return null;if(v===NEVER)return 2.5;return Math.max(-2.5,Math.min(2.5,(v-t.real)/(t.hi-t.lo)))};
const ORIG=t=>!t.get; // the 41 targets the score history was kept on

function score(rs){const rows=[];for(const t of TARGETS){if(!applies(t))continue;const vs=rs.map(r=>val(r,t));const ok=vs.filter(v=>inBand(v,t)).length;
    rows.push({t,vs,med:median(vs),p25:q(vs,0.25),p75:q(vs,0.75),inBand:ok/vs.length,never:vs.filter(v=>v===NEVER).length})}
  const avg=f=>{const a=rows.filter(f);return a.length?a.reduce((s,r)=>s+r.inBand,0)/a.length:0};
  return{rows,score:avg(r=>!r.t.cls),old:avg(r=>ORIG(r.t))}}
// standard error of the score, from resampling histories
function scoreSE(rs){let x=12345;const R=()=>{x=(x*16807)%2147483647;return x/2147483647};const v=[];
  for(let b=0;b<200;b++){const s=Array.from({length:rs.length},()=>rs[Math.floor(R()*rs.length)]);v.push(score(s).score)}
  const m=v.reduce((a,b)=>a+b,0)/v.length;return Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(v.length-1))}
function diffSE(A,B){let x=12345;const R=()=>{x=(x*16807)%2147483647;return x/2147483647};const v=[],n=Math.min(A.length,B.length);
  for(let b=0;b<200;b++){const ix=Array.from({length:n},()=>Math.floor(R()*n));v.push(score(ix.map(i=>B[i])).score-score(ix.map(i=>A[i])).score)}
  const m=v.reduce((a,b)=>a+b,0)/v.length;return Math.sqrt(v.reduce((a,b)=>a+(b-m)**2,0)/(v.length-1))}
const cor=(a,b)=>{const n=a.length;let ma=0,mb=0;for(let i=0;i<n;i++){ma+=a[i];mb+=b[i]}ma/=n;mb/=n;let sab=0,saa=0,sbb=0;for(let i=0;i<n;i++){const x=a[i]-ma,y=b[i]-mb;sab+=x*y;saa+=x*x;sbb+=y*y}return saa&&sbb?sab/Math.sqrt(saa*sbb):null};
// how alike the same seed's history is in two versions (0 = unrelated), averaged over scored targets
function pairing(A,B){const cs=[];for(const t of TARGETS){if(t.cls||!applies(t))continue;const a=A.map(r=>cval(r,t)),b=B.map(r=>cval(r,t));if(a.some(v=>v==null)||b.some(v=>v==null))continue;const c=cor(a,b);if(c!=null)cs.push(c)}
  return cs.length?cs.reduce((x,y)=>x+y,0)/cs.length:null}
const pct=x=>Math.round(x*100)+'%';

function report(A,B,nameA,nameB){
  const L=[];const sA=score(A),sB=B?score(B):null;
  L.push(`# Ensemble check: ${SEEDS.length} Earth histories to ${END<=0?(1-END)+' BCE':END+' CE'}`,'');
  L.push(`**${nameA}:** ${pct(sA.score)} of scored targets hit (all 41: ${pct(sA.old)}).${sB?` **${nameB}:** ${pct(sB.score)} (all 41: ${pct(sB.old)}).`:''}`,'');
  if(!B){L.push('| Group | Target | Real | Band | Median | Middle half | In band | Never |','|---|---|---|---|---|---|---|---|');
    for(const r of sA.rows){const t=r.t;L.push(`| ${t.g} | ${t.n}${t.cls?' ('+t.cls+')':''} | ${fmt(t.real,t)} | ${fmt(t.lo,t)} to ${fmt(t.hi,t)} | ${fmt(r.med,t)} | ${fmt(r.p25,t)} to ${fmt(r.p75,t)} | ${Math.round(r.inBand*100)}% | ${t.kind==='year'?r.never:''} |`)}}
  else{L.push(`Seed by seed: "closer" counts seeds where ${nameA} lands nearer the band than ${nameB}.`,'');
    L.push(`| Group | Target | Real | Median ${nameB} | Median ${nameA} | In band ${nameB} | In band ${nameA} | Closer / farther |`,'|---|---|---|---|---|---|---|---|');
    for(let k=0;k<sA.rows.length;k++){const a=sA.rows[k],b=sB.rows[k],t=a.t;let better=0,worse=0;
      for(let s=0;s<a.vs.length;s++){const ma=miss(a.vs[s],t),mb=miss(b.vs[s],t);if(ma==null||mb==null)continue;
        const da=ma||Math.abs(a.vs[s]-t.real)/(t.hi-t.lo)*0.01,db=mb||Math.abs(b.vs[s]-t.real)/(t.hi-t.lo)*0.01;if(da<db-1e-9)better++;else if(da>db+1e-9)worse++}
      L.push(`| ${t.g} | ${t.n}${t.cls?' ('+t.cls+')':''} | ${fmt(t.real,t)} | ${fmt(b.med,t)} | ${fmt(a.med,t)} | ${Math.round(b.inBand*100)}% | ${Math.round(a.inBand*100)}% | ${better} / ${worse} |`)}}
  const tm=rs=>{const t=rs.map(r=>r.time.total).sort((a,b)=>a-b);return`median ${t[t.length>>1].toFixed(0)} s per run (${t[0].toFixed(0)}–${t[t.length-1].toFixed(0)})`};
  L.push('',`Run time, ${nameA}: ${tm(A)}${B?`; ${nameB}: ${tm(B)}`:''}.`);
  const nan=A.reduce((a,r)=>a+(r.x&&r.x.nan||0),0);if(nan)L.push('',`**Warning:** ${nan} states with invalid (NaN) values across runs.`);
  return{md:L.join('\n'),scoreA:sA.score,scoreB:sB&&sB.score}}

// several variants against the first (the base): one column each; ▲/▼ marks a change in a target's hit rate bigger than
// twice its noise (two independent samples of n histories)
function variantReport(names,sets){
  const L=[],S=sets.map(score),n=SEEDS.length,base=S[0],se=sets.map(scoreSE);
  L.push(`# Variant check: ${n} Earth histories to ${END<=0?(1-END)+' BCE':END+' CE'}`,'');
  L.push('| Variant | Score | ± | Change | ± change | All 41 | Same-seed likeness |','|---|---|---|---|---|---|---|');
  S.forEach((s,k)=>{const d=k?s.score-base.score:null,sd=k?diffSE(sets[0],sets[k]):null;
    L.push(`| ${names[k]} | ${(s.score*100).toFixed(1)}% | ${(se[k]*100).toFixed(1)} | ${k?`${d>=0?'+':''}${(d*100).toFixed(1)}${Math.abs(d)>2*sd?(d>0?' ▲':' ▼'):''}`:''} | ${k?(sd*100).toFixed(1):''} | ${pct(s.old)} | ${k?(pairing(sets[0],sets[k])??0).toFixed(2):''} |`)});
  L.push('',`Score is the share of scored targets in band (guards and context left out). A change is marked when it exceeds twice its noise (paired bootstrap over the same seeds).`,'');
  L.push(`| Group | Target | Real | Band | Median ${names[0]} | ${names.map(x=>x).join(' | ')} |`,`|---|---|---|---|---|${names.map(()=>'---').join('|')}|`);
  for(let r=0;r<base.rows.length;r++){const t=base.rows[r].t,p0=base.rows[r].inBand;
    const cells=S.map((s,k)=>{const p=s.rows[r].inBand;if(!k)return pct(p);const sd=Math.sqrt((p0*(1-p0)+p*(1-p))/n)||0.01;const d=p-p0;return pct(p)+(Math.abs(d)>2*sd?(d>0?' ▲':' ▼'):'')+(` (${fmt(s.rows[r].med,t)})`)});
    L.push(`| ${t.g} | ${t.n}${t.cls?' ('+t.cls+')':''} | ${fmt(t.real,t)} | ${fmt(t.lo,t)} to ${fmt(t.hi,t)} | ${fmt(base.rows[r].med,t)} | ${cells.join(' | ')} |`)}
  const bad=base.rows.filter(r=>r.t.cls==='guard'&&r.inBand<0.9);S.slice(1).forEach((s,k)=>s.rows.forEach(r=>{if(r.t.cls==='guard'&&r.inBand<0.9)bad.push({t:r.t,inBand:r.inBand,v:names[k+1]})}));
  if(bad.length)L.push('','**Guards broken:** '+bad.map(b=>`${b.t.n} ${pct(b.inBand)}${b.v?' ('+b.v+')':''}`).join('; '));
  // diagnosis: where people are and what they eat, median millions per history
  for(const y of [-2999,1,1000]){if(y>END)continue;const regs=new Set();sets.forEach(rs=>rs.forEach(r=>r.diag&&r.diag[y]&&Object.keys(r.diag[y].reg).forEach(k=>regs.add(k))));if(!regs.size)continue;
    L.push('',`**People by region at ${y<=0?(1-y)+' BCE':y+' CE'}** (median, millions)`,'',`| Region | ${names.join(' | ')} |`,`|---|${names.map(()=>'---').join('|')}|`);
    for(const g of regs)L.push(`| ${g} | ${sets.map(rs=>{const m=median(rs.map(r=>r.diag&&r.diag[y]?r.diag[y].reg[g]:null));return m==null?'–':m.toFixed(1)}).join(' | ')} |`);
    const crops=new Set();sets.forEach(rs=>rs.forEach(r=>r.diag&&r.diag[y]&&Object.keys(r.diag[y].crop).forEach(k=>crops.add(k))));
    L.push('',`**Farmers by staple at ${y<=0?(1-y)+' BCE':y+' CE'}** (median, millions)`,'',`| Staple | ${names.join(' | ')} |`,`|---|${names.map(()=>'---').join('|')}|`);
    for(const c of crops)L.push(`| ${c} | ${sets.map(rs=>{const m=median(rs.map(r=>r.diag&&r.diag[y]?(r.diag[y].crop[c]||0):null));return m==null?'–':m.toFixed(1)}).join(' | ')} |`);
    if(sets.some(rs=>rs.some(r=>r.diag&&r.diag[y]&&r.diag[y].cf))){L.push('',`**Cropping frequency at ${y<=0?(1-y)+' BCE':y+' CE'}** (median, share of farmland cropped per year; 1 = every year)`,'',`| Region | ${names.join(' | ')} |`,`|---|${names.map(()=>'---').join('|')}|`);
      for(const g of regs)L.push(`| ${g} | ${sets.map(rs=>{const m=median(rs.map(r=>r.diag&&r.diag[y]&&r.diag[y].cf?r.diag[y].cf[g]??null:null));return m==null?'–':m.toFixed(2)}).join(' | ')} |`)}
    const xk=new Set();sets.forEach(rs=>rs.forEach(r=>r.diag&&r.diag[y]&&r.diag[y].x&&Object.keys(r.diag[y].x).forEach(k=>xk.add(k))));
    if(xk.size){L.push('',`**Other diagnostics at ${y<=0?(1-y)+' BCE':y+' CE'}** (median)`,'',`| | ${names.join(' | ')} |`,`|---|${names.map(()=>'---').join('|')}|`);
      for(const g of xk)L.push(`| ${g} | ${sets.map(rs=>{const m=median(rs.map(r=>r.diag&&r.diag[y]&&r.diag[y].x?r.diag[y].x[g]??null:null));return m==null?'–':m.toFixed(2)}).join(' | ')} |`)}}
  if(sets.some(rs=>rs.some(r=>r.ev))){L.push('','**Rare events** (median per millennium after 3000 BCE; share of histories with at least one in brackets)','',`| | ${names.join(' | ')} |`,`|---|${names.map(()=>'---').join('|')}|`);
    for(const [k,lab] of [['settle','Hordes settling as conquest dynasties'],['cav','Farming states taking up mounted archery'],['fRise','Frontier horsemen: rise and break away'],['fCrushed','… rise and are put down'],['fFlee','… ride out and found a horde'],['fJoin','… ride over to a horde'],['fRavage','… hemmed in, ravage their neighbours'],['fSack','… sack the capital and go home'],['fDynasty','… take the throne'],['fWalled','… held in by a wall (decades)'],['review','Rulers reviewing policy after an event'],['dProv','Deals: terms given to a single province'],['dPeople','… to a whole people'],['dRevoke','… revoked by an heir'],['pGrant','Portions: khans granting land to lesser khans'],['pDemand','… lesser khans making demands of an heir'],['pGrace','… giving the heir grace'],['pSplit','… realm divided or lesser khans riding off'],['fRaid','Raids by stateless frontier peoples'],['khan','Hungry clans joining a khan'],['khanW','Clans joining a winning khan'],['submit','Beaten khans submitting whole'],['grass','Farmed grass taken by hordes'],['fkhan','New khans rising on unheld frontier'],['wMove','Saddle and court: court moves off the steppe'],['wSep','… separate offices'],['wSecede','… homeland secedes'],['wSaddle','… saddle coup'],['wCourt','… court assimilates'],['usurp','Generals usurping'],['debase','Debasements'],['rising','Slave risings'],['officials','Slave officials ruling for themselves'],['slaveCoup','Slave soldiers taking a throne'],['slaveState','Slave states founded'],['emancip','Emancipations'],['sack','Cities sacked in raids'],['colony','Colonies founded'],['shed','Provinces let go for want of garrisons'],['popWar','Deep raids for people']])
      L.push(`| ${lab} | ${sets.map(rs=>{const v=rs.map(r=>r.ev?r.ev[k]??null:null),m=median(v),n=v.filter(x=>x!=null).length;return m==null?'–':+m.toFixed(2)+' ('+Math.round(100*v.filter(x=>x>0).length/Math.max(1,n))+'%)'}).join(' | ')} |`)}
  {const r0=sets[0].filter(r=>r.ev);if(r0.length){const keys=Object.keys(r0[0].ev).filter(k=>!['roads'].includes(k)),dead=keys.filter(k=>r0.every(r=>!(r.ev[k]>0)));
    if(dead.length)L.push('',`**Never happened in any ${names[0]} history:** ${dead.join(', ')}. A feature that is switched on but never fires is a bug until shown otherwise.`)}}
  if(sets[0][0]&&sets[0][0].d_invasions!=null){L.push('','**Steppe and war dynamics** (median; steppe counts per millennium after 3000 BCE, walls in total, wars after 1000 BCE)','',`| | ${names.join(' | ')} |`,`|---|${names.map(()=>'---').join('|')}|`);
    for(const [k,lab] of [['d_invasions','Invasions through a frontier'],['d_inv_beaten','… by beaten confederations fleeing'],['d_inv_drought','… by confederations in drought'],['d_inv_riches','… by confederations grown rich'],['d_inv_people','… by peoples on the move'],['d_inv_conquest','… by confederations conquering in war'],['d_dz','Herding years with a die-off over 25% (share)'],['d_dzCold','… on cold-winter pastures'],['d_dominoes','Beaten herders riding off (dominoes)'],['d_walls','Great walls begun'],['d_warShare','States at war (share of state-years, after 1000 BCE)'],['d_warsPerState','Wars started per state per century'],['d_warLen','Median war length (years)'],['d_taken','Provinces changing hands per century'],['d_clan','Herding clans moving to new grass (total)'],['d_clanFar','… of them 4+ provinces away'],['d_confN','Confederations reaching 20+ provinces (after 3000 BCE)'],['d_confLife','… their median life (years)']])L.push(`| ${lab} | ${sets.map(rs=>{const m=median(rs.map(r=>r[k]));return m==null?'–':+m.toFixed(1)}).join(' | ')} |`)}
  const tm=rs=>{const t=rs.map(r=>r.time.total).sort((a,b)=>a-b);return t[t.length>>1].toFixed(0)};
  L.push('',`Median run time (s): ${names.map((x,k)=>x+' '+tm(sets[k])).join(', ')}.`);
  // median seconds per pass in the first variant (the base), largest first; a pass that suddenly grows shows up here
  {const rs=sets[0].filter(r=>r.time&&r.time.pass);if(rs.length){const ks=new Set();for(const r of rs)for(const k in r.time.pass)ks.add(k);
    const med=k=>{const a=rs.map(r=>r.time.pass[k]||0).sort((x,y)=>x-y);return a[a.length>>1]};const row=[...ks].map(k=>[k,med(k)]).filter(x=>x[1]>=1).sort((a,b)=>b[1]-a[1]);
    L.push('',`Time per pass, ${names[0]}, median seconds: ${row.map(([k,v])=>k+' '+v.toFixed(0)).join(', ')}.`)}}
  return{md:L.join('\n'),scores:S.map(s=>s.score)}}

(async()=>{
  const here={dir:path.join(ROOT,'src'),name:LABEL||'working tree'};
  const mk=(side,env)=>SEEDS.map(seed=>({seed,dir:side.dir,env,cache:path.join(CACHE,`${srcHash(side.dir,env)}-${seed}-${END}.json`)}));
  const stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  if(VARIANTS){const jobs=VARIANTS.flatMap(v=>mk(here,v.env));const res=await runAll(jobs);
    const sets=VARIANTS.map((v,k)=>res.slice(k*SEEDS.length,(k+1)*SEEDS.length)),names=VARIANTS.map(v=>v.name);
    const {md,scores}=variantReport(names,sets);
    fs.writeFileSync(path.join(OUT,`variants-${stamp}.md`),md+'\n');fs.writeFileSync(path.join(OUT,`variants-${stamp}.json`),JSON.stringify({end:END,seeds:SEEDS,variants:VARIANTS,scores},null,1));
    console.log(md);return}
  let jobs=mk(here,ENV),base=null;if(REF){base=worktreeFor(REF);jobs=jobs.concat(mk(base,BENV))}
  else if(Object.keys(BENV).length){base={dir:here.dir,name:'working tree, '+Object.entries(BENV).map(e=>e.join('=')).join(' ')};jobs=jobs.concat(mk(base,BENV))}
  const res=await runAll(jobs),A=res.slice(0,SEEDS.length),B=base?res.slice(SEEDS.length):null;
  const nameA=Object.keys(ENV).length?here.name+', '+Object.entries(ENV).map(e=>e.join('=')).join(' '):here.name;
  const {md,scoreA,scoreB}=report(A,B,nameA,base&&base.name);
  fs.writeFileSync(path.join(OUT,`ensemble-${stamp}.md`),md+'\n');fs.writeFileSync(path.join(OUT,`ensemble-${stamp}.json`),JSON.stringify({end:END,seeds:SEEDS,A,B,scoreA,scoreB},null,1));
  console.log(md);
})().catch(e=>{console.error(e.message);process.exit(1)});
