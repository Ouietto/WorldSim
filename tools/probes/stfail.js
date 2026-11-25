// why stateless provinces fail the state test, by region: share of people failing first at each condition
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const seed=process.argv[2]||'1',END=+(process.argv[3]||-2000),AT=(process.argv[4]||'-3500,-2500,-2000').split(',').map(Number);
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(seed);
const R={Greece:[36,41,20,27],Levant:[31,37,34,37.5],AnatW:[36,41,26,32],AnatC:[37,41,32,40],Zagros:[33,38,44,49],Elam:[30,33,47,51],NIran:[35,38,48,58],Fars:[28,31.5,50,56],Mesop:[30,35,42,47],Egypt:[25,31.5,30,33],Indus:[24,31,67,74]};
const LA=i=>WD.lat[i]*180/Math.PI,LO=i=>(WD.cxA[i]+0.5)/W*360-180;const I={};for(const k in R){const b=R[k];I[k]=WD.landIdx.filter(i=>LA(i)>=b[0]&&LA(i)<=b[1]&&LO(i)>=b[2]&&LO(i)<=b[3])}
const step=()=>{const g=stepG();while(!g.next().done){}};
const rep=()=>{const o={};for(const k in I){const c={pop:0,state:0,agr:0,dens:0,nomad:0,floor:0,pass:0};let past=0,fs=0;
  for(const i of I[k]){const p=S.pop[i];if(p<1)continue;c.pop+=p;past+=p*S.past[i];const op=S.pol[i]&&S.pols[S.pol[i]];if(op&&op.kind==='state'){c.state+=p;continue}
   const FL=!swOn('nofarmland'),fsh=FL?WD.fSh[i]:1,pf=FL?1-S.past[i]:1,agr=S.farm[i]*Math.min(1,S.sFc[i]/fsh),dens=p*(pf/fsh+1-pf)/WD.area[i];fs+=p*agr;
   if(!(agr>0.35))c.agr+=p;else if(!(dens>3.2))c.dens+=p;else if(WD.nomad[i])c.nomad+=p;else if(!(localPop(i)>=FLOOR.chief*3*P.floor))c.floor+=p;else c.pass+=p}
  const t=c.pop||1;o[k]='kpop '+(c.pop/1e3).toFixed(0)+' state '+(c.state/t).toFixed(2)+' | fail agr '+(c.agr/t).toFixed(2)+' dens '+(c.dens/t).toFixed(2)+' nomad '+(c.nomad/t).toFixed(2)+' floor '+(c.floor/t).toFixed(2)+' pass '+(c.pass/t).toFixed(2)+' | past '+(past/t).toFixed(2)}
  console.log('year '+S.year);for(const k in o)console.log('  '+k.padEnd(7)+o[k])};
while(S.year<END){step();if(AT.includes(S.year))rep()}})();`);
