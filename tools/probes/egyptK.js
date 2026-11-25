const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const C=WD.regions.find(r=>r.k==='egypt').cells;
const rep=()=>{let A=0,fA=0,p=0,K=0;const m={sFc:0,fert:0,cf:0,cY:0,soilF:0,irrig:0,metal:0,crops:0,admin:0,intens:0,farm:0,salt:0,past:0,forest:0,wm:0,Kfa:0};
 for(const i of C){const a=WD.area[i],f=WD.rvF[i]*a;A+=a;fA+=f;p+=S.pop[i];K+=S.K[i];
  m.sFc+=S.sFc[i]*f;m.fert+=S.fert[i]*f;m.cf+=S.cf[i]*f;m.cY+=(S.crop[i]>=0?S.cY[i]:0.35)*f;m.soilF+=WD.soilFert[i]*f;m.irrig+=S.irrig[i]*f;m.metal+=S.metal[i]*f;m.crops+=S.crops[i]*f;m.admin+=admOf()[i]*f;m.farm+=S.farm[i]*f;m.salt+=(S.salt?S.salt[i]:0)*f;m.past+=S.past[i]*f;m.forest+=S.forest[i]*f;m.wm+=(S.wm?S.wm[i]:1)*f;m.Kfa+=S.Kfa[i];
  const xY=0.8*S.metal[i]+0.9*S.iron[i]+1.0*S.crops[i]+0.7*admOf()[i];m.intens+=(1+3.2*(1-Math.exp(-xY/3.2)))*f}
 const kfa=m.Kfa;for(const k in m)m[k]=+(m[k]/fA).toFixed(2);m.KfaM=+(kfa/1e6).toFixed(2);
 console.log(S.year,'area',Math.round(A),'floodplain km2',Math.round(fA),'popM',(p/1e6).toFixed(2),'KM',(K/1e6).toFixed(2),'K/floodkm2',(K/fA).toFixed(1),JSON.stringify(m))};
while(S.year<-1000){step();if(S.year%500===0&&S.year>=-5000)rep()}})();`);
