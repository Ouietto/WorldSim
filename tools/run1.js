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
// farming arrival: first year half the peopled provinces in a box farm (farm > 0.5); holdouts measured at the end
const FB={cEur:[48,53,8,16],brit:[50.5,55,-4,1],scand:[54.5,59,8,15],japan:[31,36,129,137],pnw:[42,55,-128,-120],cape:[-35,-31,17,22]};
const fbCells={};for(const k in FB){const b=FB[k];fbCells[k]=WD.landIdx.filter(i=>LA(i)>=b[0]&&LA(i)<=b[1]&&LO(i)>=b[2]&&LO(i)<=b[3])}
// diagnosis, not scored: where the people are and what they eat at 3000 BCE and 1 CE (first matching box wins)
const MR=[['Egypt',22,31.5,29,34],['Pontic-Caspian steppe',44,52,30,55],['Near East',25,42,26,63],['Europe',35,72,-12,60],['Inner Asian steppe',40,56,55,125],
  ['South Asia',5,37,60,92],['China',20,42,98,125],['North Africa',15,37,-18,29],['Sub-Saharan Africa',-36,15,-18,52],['Mesoamerica',8,25,-110,-75],
  ['Japan and Korea',30,46,124,146],['Arabia',12,25,34,60],['North America',25,72,-170,-50],['South America',-56,13,-82,-34],['SE Asia and Oceania',-50,20,92,180]];
const mrName=new Array(N).fill('Other');for(const i of WD.landIdx){const la=LA(i),lo=LO(i);let n='Other';for(const b of MR)if(la>=b[1]&&la<=b[2]&&lo>=b[3]&&lo<=b[4]){n=b[0];break}
  if(n==='South America')n=WD.elev[i]>1500||lo<-76?'Andes and Pacific coast':'Lowland South America';mrName[i]=n}
const MRN=MR.map(b=>b[0]).filter(n=>n!=='South America').concat(['Andes and Pacific coast','Lowland South America','Other']);
const diag={};const snap=y=>{const rp={},cp={},fq={},fw={};for(const n of MRN)rp[n]=0;for(const i of WD.landIdx){const p=S.pop[i];if(p<1)continue;rp[mrName[i]]+=p;
    if(S.farm[i]>0.5){const c=S.crop&&S.crop[i]>=0?CROPS[S.crop[i]].k:'none';cp[c]=(cp[c]||0)+p;
      if(S.cf){const g=mrName[i];fq[g]=(fq[g]||0)+p*S.cf[i];fw[g]=(fw[g]||0)+p}}}
  for(const k in rp)rp[k]=+(rp[k]/1e6).toFixed(2);for(const k in cp)cp[k]=+(cp[k]/1e6).toFixed(2);diag[y]={reg:rp,crop:cp};
  // cropping frequency (share of farmland cropped each year), farmer-weighted, when that switch is on
  if(S.cf){const o={};for(const k in fq)o[k]=+(fq[k]/fw[k]).toFixed(2);diag[y].cf=o}
  // frontier horsemanship: riding skill of the peoples ruling farming states that border a steppe horde (people-weighted)
  // (run 79: a state borders herders when one of its provinces touches a herding province outside it, held by a confederation or by
  // clans; before, only states bordering an organised confederation counted, so the measure fell whenever the steppe was mostly clans)
  {const hf=new Uint8Array(S.pols.length);for(const i of WD.landIdx){const q=S.pol[i];if(!q||hf[q])continue;for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j<0||S.pol[j]===q||S.pop[j]<1||S.past[j]<=0.55)continue;const p=S.pol[j]?S.pols[S.pol[j]]:null;if(!p||p.kind==='horde'){hf[q]=1;break}}}
  let a=0,b=0,ar=0;for(const id of S.alive){const o=S.pols[id];if(o.kind!=='state'||!o.nb||o.farmN<0.5*o.cells)continue;
    if(!hf[id])continue;const e=o.core>=0?S.eths[o.core]:null,rd=e&&e.ride?e.ride:0;a+=o.pop*rd;b+=o.pop;if(rd>=0.5)ar+=o.pop}
   diag[y].x={'Frontier states: riding skill':b?+(a/b).toFixed(2):null,'Frontier states: share with mounted archers':b?+(ar/b).toFixed(2):null}}
  // men of fighting age against the usual share, in states of 20+ provinces (cohort switch)
  // confederations: how many large ones, and how much of the steppe they hold
  {let big=0,huge=0,n=0,h=0,hp=0;for(const id of S.alive){const o=S.pols[id];if(o.kind!=='horde')continue;if(o.cells>=20)big++;if(o.cells>=60)huge++}
   for(const i of WD.landIdx){const g=mrName[i];if((g==='Inner Asian steppe'||g==='Pontic-Caspian steppe')&&S.pop[i]>=1){n++;const o=S.pol[i]?S.pols[S.pol[i]]:null;if(o&&o.kind==='horde'){h++;hp+=S.pop[i]}}}
   Object.assign(diag[y].x,{'Confederations of 20+ provinces':big,'Confederations of 60+ provinces':huge,'Steppe provinces held by confederations':n?+(h/n).toFixed(2):null})}
  if(S.coh){let a=0,b=0;for(const id of S.alive){const o=S.pols[id];if(o.kind!=='state'||o.cells<20||o.mpR==null)continue;a+=o.pop*o.mpR;b+=o.pop}diag[y].x['Large states: young men against normal']=b?+(a/b).toFixed(2):null}};
// war after 1000 BCE: share of state-years at war (people-weighted, states of 3+ provinces), provinces changing hands
const WAR={w:0,p:0,sy:0,taken:0,t0:null};
// steppe and migration dynamics after 3000 BCE, counted from the chronicle as it is written (it is trimmed when long)
const DOM={inv:/break through the frontier/,dom:/abandon their pastures/,wall:/fortify its frontier/},dCnt={inv:0,dom:0,wall:0};let chI=0;
// where each invasion came from: a beaten confederation fleeing, a confederation in drought or grown rich, or a people on the move
const invSrc={beaten:0,drought:0,riches:0,people:0};
// farmed = growing a staple. Knowing how to farm with no crop to grow (herders at the Cape, foragers on the Northwest Coast) is
// not farming; it was counted as farming before run 76
const fShare=k=>{let n=0,f=0;for(const i of fbCells[k])if(S.pop[i]>=1){n++;if(S.farm[i]>0.5&&S.crop&&S.crop[i]>=0)f++}return n?f/n:0},fArr={};
while(S.year<END){step();
  {const ch=S.chron;if(ch.length<chI)chI=Math.max(0,chI-4000);for(;chI<ch.length;chI++){const c=ch[chI];if(c.y<-3000)continue;for(const k in DOM)if(DOM[k].test(c.txt)){dCnt[k]++;if(k==='inv'){const M=c.refs&&c.refs[0]&&c.refs[0][0]==='mig'?S.migs[c.refs[0][1]]:null;const src=!M?'people':M.kind==='horde'?(M.cause==='pushed'?'beaten':M.cause==='drought'?'drought':'riches'):'people';invSrc[src]++}}}}
  if(S.year===-2999||S.year===1||S.year===1000)snap(S.year);
  if(S.year>=-1000&&S.year%10===0){if(WAR.t0==null)WAR.t0=S.year;for(const id of S.alive){const o=S.pols[id];if(o.kind!=='state'||o.cells<3)continue;WAR.sy+=10;WAR.p+=o.pop;if(o.enemies.size)WAR.w+=o.pop}
    for(const i of WD.landIdx)if(S.taken[i]>S.year-10&&S.taken[i]<=S.year)WAR.taken++}
  if(S.year%25===0)for(const k of ['cEur','brit','scand','japan'])if(fArr[k]==null&&fShare(k)>=0.5)fArr[k]=S.year;
  if(S.year%1000===0||S.year===1){sec[S.year]=(Date.now()-lap)/1000;lap=Date.now()}
  if(S.year%50===0&&S.year<=1)for(const k of S.alive){const o=S.pols[k];if(o.kind==='horde'&&(!hMax||o.cells>hMax.cells))hMax={cells:o.cells,y:S.year,at:Math.round(LA(o.capital))+','+Math.round(LO(o.capital))}}
  if(S.year===-999&&typeof herdLed!=='undefined'){let n=0,f=0;for(const i of WD.landIdx){const la=LA(i),lo=LO(i);if(la>44&&la<52&&lo>28&&lo<50&&WD.sod[i]&&S.pop[i]>=1){n++;const o=S.pol[i]?S.pols[S.pol[i]]:null;if(o&&o.kind==='state'&&!herdLed(o))f++}}pontic=n?+(f/n).toFixed(3):null}
  if(marks.includes(S.year)){const st=S.stats[S.stats.length-1];pop[S.year]=Math.round(st.pop/1e6);big[S.year]=st.bcS??st.bc;bigH[S.year]=st.bcH??null;
    const d=o=>o?o.full+' '+o.cells+' at '+Math.round(WD.lat[o.capital]*180/Math.PI)+','+Math.round((WD.cxA[o.capital]+0.5)/W*360-180):null;who[S.year]={state:d(S.pols[st.bigS]),horde:d(S.pols[st.bigH])}}}
const yr=v=>v?v.y:null,rf=k=>S.regionFirst[k]?S.regionFirst[k].y:null,ft=k=>yr(S.firstTech[TI[k]]);
for(const k of ['meso','egypt','indus','nchina','mesoam','andes','europe','wafrica'])out['r_'+k]=rf(k);
for(const k of ['writing','iron','coin','paper','gun'])out['t_'+k]=ft(k);
out.t_horse=S.domFirst&&S.domFirst[0]?S.domFirst[0].y:null;out.s_pontic=pontic;
for(const k of ['cEur','brit','scand','japan'])out['f_'+k]=fArr[k]??null;out.fs_pnw=END>=1500?+fShare('pnw').toFixed(3):null;out.fs_cape=END>=1500?+fShare('cape').toFixed(3):null;
if(S.origins){for(const R of WILD)out['o_'+R.k]=S.origins[R.k]?S.origins[R.k].y:null;out.o_count=Object.keys(S.origins).length;out.x_rits=S.rits?S.rits.filter(R=>R.peak>0.35).length:null;out.x_oriLog=S.oriLog}
if(S.bFirst){out.x_beasts=BEASTS.map((b,k)=>S.bFirst[k]?b.k+' '+S.bFirst[k].y:null).filter(Boolean);out.x_alt=S.alt.map(a=>a.k+' '+a.y);out.x_breeds=S.lins.filter(L=>L.told).length}
{const yrs=Math.max(1,END+3000)/1000;out.d_invasions=+(dCnt.inv/yrs).toFixed(2);for(const k in invSrc)out['d_inv_'+k]=+(invSrc[k]/yrs).toFixed(2);out.d_dominoes=+(dCnt.dom/yrs).toFixed(2);out.d_walls=dCnt.wall}
out.diag=diag;
{const ws=S.wars.filter(x=>!x.civil&&x.start>=-1000),done=ws.filter(x=>x.end).map(x=>x.end-x.start).sort((a,b)=>a-b),span=Math.max(1,S.year-(WAR.t0??-1000));
 out.d_warShare=WAR.p?+(WAR.w/WAR.p).toFixed(3):null;out.d_warsPerState=WAR.sy?+(ws.length/(WAR.sy/100)).toFixed(2):null;out.d_warLen=done.length?done[done.length>>1]:null;out.d_taken=+(WAR.taken/(span/100)).toFixed(0);
 const g={};for(const x of ws)if(x.goal)g[x.goal]=(g[x.goal]||0)+1;out.d_goals=g;
 // lifespans of confederations that reached 20+ provinces, born after 3000 BCE
 {const L=S.pols.filter(o=>o&&o.kind==='horde'&&o.maxCells>=20&&o.born>=-3000).map(o=>(o.alive?S.year:o.died)-o.born).sort((a,b)=>a-b);out.d_confN=L.length;out.d_confLife=L.length?L[L.length>>1]:null}if(S.gzD){out.d_clan=S.gzN;out.d_clanFar=S.gzFar}if(S.hs){out.d_dz=S.hzC?+(S.dzC/S.hzC).toFixed(4):null}}
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
  hordeMax:hMax,spills:S.spills||0,pushed:S.migs?S.migs.filter(m=>m&&m.cause==='pushed').length:null,domestic:S.domLog?S.domLog.slice(0,8).map(d=>HERDS[d.sp].k+' '+d.y+'@'+Math.round(LA(d.cell))+','+Math.round(LO(d.cell))):null,
  horsesAmericas:S.horse?WD.landIdx.filter(i=>LO(i)<-52&&LA(i)<62&&S.horse[i]>0.05).length:null,contact:!!S.malAm,sacks:S.cities.reduce((a,c)=>a+(c.sacks?c.sacks.length:0),0),nan:al.filter(o=>!(o.cult>=0&&o.psi>=0)).length};
{let hh=0;for(const i of WD.landIdx)hh=(hh*31+Math.round(S.pop[i])+S.pol[i]*7)%2147483647;out.x.hash=hh}
out.time={init:tInit/1000,total:(Date.now()-t0)/1000,byMillennium:sec};
process.stdout.write(JSON.stringify(out)+'\\n');
})();
`);
