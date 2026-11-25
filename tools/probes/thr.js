const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const seed=process.argv[2]||'1',END=+(process.argv[3]||-1500);
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(seed);
const R={Pontic:[45,50,30,45],Hungary:[45,48.5,18,22.5],UkrForSt:[49,52,24,36],Kazakh:[46,52,55,75],Mongolia:[44,50,95,115],Ordos:[37,41,106,112],NChinaPl:[34,38,112,118],Anatolia:[37,40,28,36],Mesop:[30,35,42,47],Poland:[50,54,15,24],Iran:[32,37,48,56]};
const LA=i=>WD.lat[i]*180/Math.PI,LO=i=>(WD.cxA[i]+0.5)/W*360-180;const I={};for(const k in R){const b=R[k];I[k]=WD.landIdx.filter(i=>LA(i)>=b[0]&&LA(i)<=b[1]&&LO(i)>=b[2]&&LO(i)<=b[3])}
const step=()=>{const g=stepG();while(!g.next().done){}};
const rep=()=>{const o={};for(const k in I){let p=0,t=0,ps=0,st=0,n=0;for(const i of I[k]){const q=S.pop[i];p+=q;t+=q*(S.thL?S.thL[i]:0);ps+=q*S.past[i];if(S.pol[i]&&S.pols[S.pol[i]]&&S.pols[S.pol[i]].kind==='state')st+=q}
  o[k]=[+(p/1e3).toFixed(0),+(t/Math.max(1,p)).toFixed(2),+(ps/Math.max(1,p)).toFixed(2),+(st/Math.max(1,p)).toFixed(2)]}console.log((process.env.SW||'')+' year '+S.year+' [kpop, threat, pasture share, in states] '+JSON.stringify(o))};
while(S.year<END){step();if(S.year===-3000||S.year===-2000||S.year===-1500||S.year===-500)rep()}})();`);
