// usage: node butterfly.js seed perturb(0/1) out.json
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const seed=process.argv[2]||'1',PERT=+process.argv[3],OUT=process.argv[4];
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(seed);const step=()=>{const g=stepG();while(!g.next().done){}};
// the perturbed province: the most populous land province of the Peloponnese box at the moment of the nudge
let tgt=-1;const snaps={};const lat=i=>latLonOf(WD,i);
while(S.year<-4000){step();
 if(PERT&&S.year===-6500){let best=-1,bp=-1;for(const i of WD.landIdx){const [la,lo]=latLonOf(WD,i);if(la>36.5&&la<38.5&&lo>21&&lo<23.5&&S.pop[i]>bp){bp=S.pop[i];best=i}}tgt=best;S.pop[best]+=1}
 if(S.year%250===0&&S.year>=-6500){snaps[S.year]={idx:Array.from(WD.landIdx),pop:Array.from(WD.landIdx,i=>+S.pop[i].toFixed(3)),pol:Array.from(WD.landIdx,i=>S.pol[i])}}}
fs.writeFileSync(OUT,JSON.stringify({tgt,idx:Array.from(WD.landIdx),ll:Array.from({length:N},(_,i)=>latLonOf(WD,i).map(x=>+x.toFixed(2))),snaps}))})();`);
