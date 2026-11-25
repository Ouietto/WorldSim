// why the practice of checks (noreflocal) rarely arises: every 250 years, count cities passing each condition of checkPass
// (city, records > 0.3, caravans > 0.2 or coast, local corruption corAt > 0.1) and show the spread of corAt in cities with records
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};const q=(a,p)=>a.length?a[Math.floor(p*(a.length-1))].toFixed(3):'-';
while(S.year<+(process.argv[3]||-1500)){step();if(S.year%250===0&&S.year>=-3500){const s=S,w=WD;let nC=0,nS=0,nR=0,nT=0,nB=0,nA=0,ch=0;const ci=[],cr=[],ig=[];
  for(const i of w.landIdx){if(s.chk&&s.chk[i]>0.1)ch++;if(s.city[i]<0)continue;nC++;const p=s.pol[i],o=p?s.pols[p]:null;if(!o||o.kind!=='state')continue;nS++;
    const r=s.recK[i]>0.3,t=s.car[i]>0.2||w.coast[i],c=corAt(o,i);if(r)nR++;if(r&&t)nT++;if(c>0.1)nB++;if(r&&t&&c>0.1)nA++;
    if(r&&t){ci.push(c);cr.push(o.cor||0);ig.push(s.integ[i])}}
  [ci,cr,ig].forEach(a=>a.sort((x,y)=>x-y));
  console.log(S.year,'cities',nC,'in states',nS,'records',nR,'+trade',nT,'corAt>0.1',nB,'all',nA,'| r+t cities: corAt p50',q(ci,.5),'p90',q(ci,.9),'realm cor p50',q(cr,.5),'p90',q(cr,.9),'integ p10',q(ig,.1),'p50',q(ig,.5),'| provinces with checks',ch)}}
console.log('local checks arose',S.refLocN||0,'reform from the top',S.refTopN||0)})();`);
