// Near East box (25-42 N, 26-63 E) at a given year: people, capacity, farming, crops, techniques; regional or full world by env
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const seed=process.argv[2]||'1',AT=(process.argv[3]||'-5000,-3000').split(',').map(Number),END=Math.max(...AT);
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(seed);const step=()=>{const g=stepG();while(!g.next().done){}};
const box=[];for(const i of WD.landIdx){const [la,lo]=latLonOf(WD,i);if(la>=25&&la<=42&&lo>=26&&lo<=63)box.push(i)}
const rep=()=>{let p=0,K=0,Kp=0,fa=0,me=0,ir=0,sf=0,cr=0,st=0,pe=0,n=0;const crops={};
 for(const i of box){const q=S.pop[i];p+=q;K+=S.K[i];Kp+=S.Kpot?S.Kpot[i]:0;fa+=q*S.farm[i];me+=q*S.metal[i];ir+=q*S.irrig[i];sf+=q*S.sFc[i];if(S.pkAv){for(let k=0;k<CROPS.length;k++)if(S.pkAv[i]&(1<<k))crops[CROPS[k].k]=(crops[CROPS[k].k]||0)+q}
  if(S.pol[i]&&S.pols[S.pol[i]]&&S.pols[S.pol[i]].kind==='state')st+=q;n++}
 const t=Math.max(1,p);const cr2={};for(const k in crops)cr2[k]=+(crops[k]/t).toFixed(2);
 let dT=0,dP=0;for(const i of box){dT+=S.cdT[i];dP+=S.cdP[i]}const tl={};TECH.forEach((T,k)=>{let a=0;for(const i of box)a+=S.pop[i]*S.tk[k][i];const v=a/t;if(v>0.02)tl[T.k||T.name||k]=+v.toFixed(2)});
 console.log('  climate co2 '+(S.co2||0).toFixed(1)+' ch4 '+(S.ch4||0).toFixed(0)+' box dT '+(dT/n).toFixed(2)+' dP '+(dP/n).toFixed(1)+' | tech '+JSON.stringify(tl));
 console.log((process.env.REGION||'world')+' seed '+seed+' year '+S.year+' provinces '+n+' popM '+(p/1e6).toFixed(2)+' KM '+(K/1e6).toFixed(2)+' pop/K '+(p/Math.max(1,K)).toFixed(2)+' farm '+(fa/t).toFixed(2)+' sFc '+(sf/t).toFixed(2)+' metal '+(me/t).toFixed(2)+' irrig '+(ir/t).toFixed(2)+' inStates '+(st/t).toFixed(2)+' crops '+JSON.stringify(cr2))};
while(S.year<END){step();if(AT.includes(S.year))rep()}})();`);
