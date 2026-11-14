#!/usr/bin/env node
// Smoke test before a batch (2026-11-13): a few short histories side by side, then a check that every feature that is switched
// on actually fired. A feature that runs but never changes anything (a rule hidden behind a comment, a pass on a year it never
// lands on) passes every crash check and costs a whole batch to notice.
//   node tools/smoke.js [--seeds 1,2] [--end -1000] [--env "WORLD=prov SW=..."]
const {spawn}=require('child_process'),os=require('os'),path=require('path');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d};
const SEEDS=arg('--seeds','1,2').split(','),END=arg('--end','-1000'),ENV=arg('--env','WORLD=prov');
const env={...process.env};for(const kv of ENV.split(/\s+/).filter(Boolean)){const [k,...v]=kv.split('=');env[k]=v.join('=')}
const SW=(env.SW||'').split(',');const on=s=>!SW.includes(s);
// what must have happened at least once across the seeds, by the end year, for a feature that is on
const CHECKS=[
  ['events', 'rulers reviewing after an event', o=>o.ev.review],
  [null,     'raids by stateless frontier peoples', o=>o.ev.fRaid],
  ['noworks','built roads', o=>o.ev.roads],
  ['nodeal', 'deals with the conquered', o=>(o.ev.dProv||0)+(o.ev.dPeople||0)],
  ['nokhan', 'clans joining a khan', o=>(o.ev.khan||0)+(o.ev.khanW||0)],
  ['notrans','provinces with mounted skill at a working level', o=>o.skill&&o.skill.n5],
  ['nofront','frontier horsemen acting (leave, join, ravage)', o=>(o.ev.fFlee||0)+(o.ev.fJoin||0)+(o.ev.fRavage||0)],
  ['noport', 'portions granted to lesser khans', o=>o.ev.pGrant],
  ['nomob',  'faster side choosing its moment or slipping away', o=>(o.ev.mChoose||0)+(o.ev.mEvade||0)],
  ['nomob',  'strike and flee wearing down ground', o=>o.ev.mHarass],
];
const run=seed=>new Promise(res=>{let out='',err='';const p=spawn(process.execPath,[path.join(__dirname,'run1.js'),seed,END],{env});
  p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);
  p.on('close',code=>{let o=null;try{o=JSON.parse(out.trim().split('\n').pop())}catch(e){}res({seed,code,o,err:err.slice(-400)})})});
(async()=>{const t0=Date.now(),jobs=Math.max(1,Math.min(SEEDS.length,os.cpus().length));const res=[];let k=0;
  await Promise.all(Array.from({length:jobs},async()=>{while(k<SEEDS.length){const s=SEEDS[k++];res.push(await run(s))}}));
  let fail=0;for(const r of res)if(r.code!==0||!r.o){fail++;console.log(`FAIL seed ${r.seed} crashed (exit ${r.code}): ${r.err}`)}
  const ok=res.filter(r=>r.o);
  if(ok.length)for(const [sw,label,f] of CHECKS){if(sw&&sw!=='events'&&!on(sw))continue;if(sw==='events'&&!on('noevents'))continue;
    const v=ok.map(r=>+f(r.o)||0),tot=v.reduce((a,b)=>a+b,0);console.log(`${tot>0?'ok  ':'FAIL'} ${label}: ${v.map(x=>+x.toFixed(2)).join(', ')}`);if(!(tot>0))fail++}
  {const tp={};for(const r of ok)for(const [k,v] of Object.entries(r.o.time&&r.o.time.pass||{}))tp[k]=(tp[k]||0)+v/ok.length;
    console.log('time per pass (mean s): '+Object.entries(tp).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>k+' '+v.toFixed(0)).join(', '))}
  console.log(`${fail?'SMOKE TEST FAILED':'Smoke test passed'} (${res.length} histories to ${END}, ${((Date.now()-t0)/60000).toFixed(1)} min)`);process.exit(fail?1:0)})();
