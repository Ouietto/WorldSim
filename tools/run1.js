// Run one Earth history and print one JSON line of measurements.
// node tools/run1.js <seed> <endYear> [srcDir]
// Env: P_<name>=<value> overrides a slider (e.g. P_pull=0.5); ABL=... passes ablation switches through.
const fs=require('fs'),zlib=require('zlib'),path=require('path');
const seed=process.argv[2]||'1',END=+(process.argv[3]||1500),SRC=path.resolve(process.argv[4]||path.join(__dirname,'..','src'));
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js'].filter(f=>fs.existsSync(path.join(SRC,f)));
const core=CORE.map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const overrides=Object.entries(process.env).filter(([k])=>k.startsWith('P_')).map(([k,v])=>[k.slice(2),+v]);
eval(core+`
;(function(){
const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
for(const [k,v] of overrides)P[k]=v;
const LA=i=>WD.lat[i]*180/Math.PI,LO=i=>(WD.cxA[i]+0.5)/W*360-180;
const t0=Date.now();newHistory(seed);const tInit=Date.now()-t0;
const out={seed,end:END},pop={},big={},bigH={},who={},sec={};let lap=Date.now(),hMax=null,pontic=null;
const marks=[-2999,-999,1,1000,1500].filter(y=>y<=END);
while(S.year<END){step();
  if(S.year%1000===0||S.year===1){sec[S.year]=(Date.now()-lap)/1000;lap=Date.now()}
  if(S.year%50===0&&S.year<=1)for(const k of S.alive){const o=S.pols[k];if(o.kind==='horde'&&(!hMax||o.cells>hMax.cells))hMax={cells:o.cells,y:S.year,at:Math.round(LA(o.capital))+','+Math.round(LO(o.capital))}}
  if(S.year===-999&&typeof herdLed!=='undefined'){let n=0,f=0;for(const i of WD.landIdx){const la=LA(i),lo=LO(i);if(la>44&&la<52&&lo>28&&lo<50&&WD.sod[i]&&S.pop[i]>=1){n++;const o=S.pol[i]?S.pols[S.pol[i]]:null;if(o&&o.kind==='state'&&!herdLed(o))f++}}pontic=n?+(f/n).toFixed(3):null}
  if(marks.includes(S.year)){const st=S.stats[S.stats.length-1];pop[S.year]=Math.round(st.pop/1e6);big[S.year]=st.bcS??st.bc;bigH[S.year]=st.bcH??null;
    const d=o=>o?o.full+' '+o.cells+' at '+Math.round(WD.lat[o.capital]*180/Math.PI)+','+Math.round((WD.cxA[o.capital]+0.5)/W*360-180):null;who[S.year]={state:d(S.pols[st.bigS]),horde:d(S.pols[st.bigH])}}}
const yr=v=>v?v.y:null,rf=k=>S.regionFirst[k]?S.regionFirst[k].y:null,ft=k=>yr(S.firstTech[TI[k]]);
for(const k of ['meso','egypt','indus','nchina','mesoam','andes','europe','wafrica'])out['r_'+k]=rf(k);
for(const k of ['writing','iron','coin','paper','gun'])out['t_'+k]=ft(k);
out.t_horse=S.domFirst&&S.domFirst[0]?S.domFirst[0].y:null;out.s_pontic=pontic;
out.p_m3000=pop[-2999]??null;out.p_1=pop[1]??null;out.p_1000=pop[1000]??null;out.p_1500=pop[1500]??null;
out.b_m1000=big[-999]??null;out.b_1=big[1]??null;out.h_m1000=bigH[-999]??null;out.h_1=bigH[1]??null;
const ch=S.chinaHist.filter(h=>h[0]>=-250);out.cUnity=ch.length?+(ch.filter(h=>h[1]>0.5).length/ch.length).toFixed(3):null;
out.medMax=S.medHist.length?+Math.max(...S.medHist.map(h=>h[1])).toFixed(3):null;
const sh=(S.shapes||[]).map(id=>S.pols[id].shape).filter(Boolean);out.ewShare=sh.length?+(sh.filter(x=>x.ew>x.ns).length/sh.length).toFixed(3):null;
const sn=S.stateNow&&END>=1500?S.stateNow.res:null;out.s_ng=sn?+sn[0].share.toFixed(3):null;out.s_congo=sn?+sn[1].share.toFixed(3):null;out.s_amaz=sn?+sn[2].share.toFixed(3):null;
// context, not scored
const al=S.alive.map(k=>S.pols[k]);const regPop={};for(const R of WD.regions){let t=0;for(const i of R.cells)t+=S.pop[i];regPop[R.k]=+(t/1e6).toFixed(2)}
out.x={regPop,who,regionKinds:Object.fromEntries(Object.entries(S.regionFirst).map(([k,v])=>[k,(v.kind||'state')+': '+v.name])),states:al.filter(o=>o.kind==='state').length,hordes:al.filter(o=>o.kind==='horde').length,
  cityStates:al.filter(o=>o.tier==='City-state').length,gen:typeof TECH_BASE!=='undefined'?TECH.length-TECH_BASE:0,co2:S.co2?+S.co2.toFixed(1):null,
  hordeMax:hMax,pushed:S.migs?S.migs.filter(m=>m&&m.cause==='pushed').length:null,domestic:S.domLog?S.domLog.slice(0,8).map(d=>HERDS[d.sp].k+' '+d.y+'@'+Math.round(LA(d.cell))+','+Math.round(LO(d.cell))):null,
  horsesAmericas:S.horse?WD.landIdx.filter(i=>LO(i)<-52&&LA(i)<62&&S.horse[i]>0.05).length:null,contact:!!S.malAm,sacks:S.cities.reduce((a,c)=>a+(c.sacks?c.sacks.length:0),0),nan:al.filter(o=>!(o.cult>=0&&o.psi>=0)).length};
{let hh=0;for(const i of WD.landIdx)hh=(hh*31+Math.round(S.pop[i])+S.pol[i]*7)%2147483647;out.x.hash=hh}
out.time={init:tInit/1000,total:(Date.now()-t0)/1000,byMillennium:sec};
process.stdout.write(JSON.stringify(out)+'\\n');
})();
`);
