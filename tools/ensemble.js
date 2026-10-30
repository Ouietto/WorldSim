#!/usr/bin/env node
// Run many Earth histories in parallel and score them against historical targets.
//
//   node tools/ensemble.js                      16 seeds of the working tree to 1500 CE
//   node tools/ensemble.js --seeds 1-24 --end 1 runs to 1 CE (metrics after that are skipped)
//   node tools/ensemble.js --ref HEAD~1         also runs the same seeds on another commit and compares, seed by seed
//   node tools/ensemble.js --env P_pull=0.5     runs a variant (slider overrides, ABL ablation switches)
//   node tools/ensemble.js --base-env ABL=sack  environment for the comparison side
//
// Results are cached by source contents, seed, end year and environment, so the baseline costs nothing the second time.
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),{spawn,execFileSync}=require('child_process');
const ROOT=path.join(__dirname,'..'),TARGETS=require('./targets.js');
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','earth_elev.b64','koppen.b64','earth_climate.b64'];
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const range=s=>s.split(',').flatMap(p=>{const m=p.match(/^(\d+)-(\d+)$/);if(!m)return[p];const a=[];for(let i=+m[1];i<=+m[2];i++)a.push(String(i));return a});
const SEEDS=range(arg('seeds','1-16')),END=+arg('end',1500),JOBS=+arg('jobs',Math.max(1,os.cpus().length)),REF=arg('ref',null),LABEL=arg('label',null);
const parseEnv=s=>Object.fromEntries((s||'').split(/\s+/).filter(Boolean).map(kv=>kv.split('=')));
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
  val=(r,t)=>{const v=r[t.k];return v==null?(t.kind==='year'?NEVER:null):v},inBand=(v,t)=>v!=null&&v!==NEVER&&v>=t.lo&&v<=t.hi,
  median=a=>{const s=a.filter(v=>v!=null).sort((x,y)=>x-y);if(!s.length)return null;const m=s.length>>1;return s.length%2?s[m]:(s[m-1]===NEVER||s[m]===NEVER?Math.max(s[m-1],s[m]):(s[m-1]+s[m])/2)},
  q=(a,p)=>{const s=a.filter(v=>v!=null).sort((x,y)=>x-y);return s.length?s[Math.min(s.length-1,Math.floor(p*(s.length-1)+0.5))]:null},
  fmt=(v,t)=>v==null?'–':v===NEVER?'never':t.kind==='share'?Math.round(v*100)+'%':t.kind==='year'?(v<=0?Math.round(1-v)+' BCE':Math.round(v)+' CE'):Math.round(v).toString(),
  miss=(v,t)=>v==null?null:v===NEVER?1:v<t.lo?(t.lo-v)/(t.hi-t.lo):v>t.hi?(v-t.hi)/(t.hi-t.lo):0;

function score(rs){const rows=[];for(const t of TARGETS){if(!applies(t))continue;const vs=rs.map(r=>val(r,t));const ok=vs.filter(v=>inBand(v,t)).length;
    rows.push({t,vs,med:median(vs),p25:q(vs,0.25),p75:q(vs,0.75),inBand:ok/vs.length,never:vs.filter(v=>v===NEVER).length})}
  return{rows,score:rows.reduce((a,r)=>a+r.inBand,0)/rows.length}}

function report(A,B,nameA,nameB){
  const L=[];const sA=score(A),sB=B?score(B):null;
  L.push(`# Ensemble check: ${SEEDS.length} Earth histories to ${END<=0?(1-END)+' BCE':END+' CE'}`,'');
  L.push(`**${nameA}:** ${Math.round(sA.score*100)}% of targets hit across seeds.${sB?` **${nameB}:** ${Math.round(sB.score*100)}%.`:''}`,'');
  if(!B){L.push('| Group | Target | Real | Band | Median | Middle half | In band | Never |','|---|---|---|---|---|---|---|---|');
    for(const r of sA.rows){const t=r.t;L.push(`| ${t.g} | ${t.n} | ${fmt(t.real,t)} | ${fmt(t.lo,t)} to ${fmt(t.hi,t)} | ${fmt(r.med,t)} | ${fmt(r.p25,t)} to ${fmt(r.p75,t)} | ${Math.round(r.inBand*100)}% | ${t.kind==='year'?r.never:''} |`)}}
  else{L.push(`Seed by seed: "closer" counts seeds where ${nameA} lands nearer the band than ${nameB}.`,'');
    L.push(`| Group | Target | Real | Median ${nameB} | Median ${nameA} | In band ${nameB} | In band ${nameA} | Closer / farther |`,'|---|---|---|---|---|---|---|---|');
    for(let k=0;k<sA.rows.length;k++){const a=sA.rows[k],b=sB.rows[k],t=a.t;let better=0,worse=0;
      for(let s=0;s<a.vs.length;s++){const ma=miss(a.vs[s],t),mb=miss(b.vs[s],t);if(ma==null||mb==null)continue;
        const da=ma||Math.abs(a.vs[s]-t.real)/(t.hi-t.lo)*0.01,db=mb||Math.abs(b.vs[s]-t.real)/(t.hi-t.lo)*0.01;if(da<db-1e-9)better++;else if(da>db+1e-9)worse++}
      L.push(`| ${t.g} | ${t.n} | ${fmt(t.real,t)} | ${fmt(b.med,t)} | ${fmt(a.med,t)} | ${Math.round(b.inBand*100)}% | ${Math.round(a.inBand*100)}% | ${better} / ${worse} |`)}}
  const tm=rs=>{const t=rs.map(r=>r.time.total).sort((a,b)=>a-b);return`median ${t[t.length>>1].toFixed(0)} s per run (${t[0].toFixed(0)}–${t[t.length-1].toFixed(0)})`};
  L.push('',`Run time, ${nameA}: ${tm(A)}${B?`; ${nameB}: ${tm(B)}`:''}.`);
  const nan=A.reduce((a,r)=>a+(r.x&&r.x.nan||0),0);if(nan)L.push('',`**Warning:** ${nan} states with invalid (NaN) values across runs.`);
  return{md:L.join('\n'),scoreA:sA.score,scoreB:sB&&sB.score}}

(async()=>{
  const here={dir:path.join(ROOT,'src'),name:LABEL||'working tree'};
  const mk=(side,env)=>SEEDS.map(seed=>({seed,dir:side.dir,env,cache:path.join(CACHE,`${srcHash(side.dir,env)}-${seed}-${END}.json`)}));
  let jobs=mk(here,ENV),base=null;if(REF){base=worktreeFor(REF);jobs=jobs.concat(mk(base,BENV))}
  else if(Object.keys(BENV).length){base={dir:here.dir,name:'working tree, '+Object.entries(BENV).map(e=>e.join('=')).join(' ')};jobs=jobs.concat(mk(base,BENV))}
  const res=await runAll(jobs),A=res.slice(0,SEEDS.length),B=base?res.slice(SEEDS.length):null;
  const nameA=Object.keys(ENV).length?here.name+', '+Object.entries(ENV).map(e=>e.join('=')).join(' '):here.name;
  const {md,scoreA,scoreB}=report(A,B,nameA,base&&base.name);
  const stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
  fs.writeFileSync(path.join(OUT,`ensemble-${stamp}.md`),md+'\n');fs.writeFileSync(path.join(OUT,`ensemble-${stamp}.json`),JSON.stringify({end:END,seeds:SEEDS,A,B,scoreA,scoreB},null,1));
  console.log(md);
})().catch(e=>{console.error(e.message);process.exit(1)});
