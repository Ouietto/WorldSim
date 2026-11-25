// leading realm of Mesopotamia and Egypt every 100 years: stress index and its biggest parts, plus civil wars and their depth
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};
const cw0=civilWar;const cwl=[];civilWar=function(o,b){const n0=polCells(o.id).length,psi=o.psi||0;const r=cw0.apply(this,arguments);const n1=o.alive?polCells(o.id).length:0;cwl.push([S.year,o.id,b?1:0,psi.toFixed(1),n0,n1]);return r};
const END=+(process.argv[3]||-1000);
while(S.year<END){step();if(S.year%100===0&&S.year>=-3500){for(const k in BX){const C=BX[k];const cnt=new Map();for(const i of C){const p=S.pol[i];if(p)cnt.set(p,(cnt.get(p)||0)+S.pop[i])}
  let bk=0,bv=0;for(const [p,v] of cnt)if(v>bv){bv=v;bk=p}const o=S.pols[bk];if(!o)continue;const w=o.why||{};
  const top=Object.entries(w).filter(([q,v])=>typeof v==='number'&&v>0.05).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([q,v])=>q+v.toFixed(2)).join(' ');
  const mine=cwl.filter(x=>x[1]===o.id&&x[0]>S.year-100).map(x=>x[3]+':'+x[4]+'>'+x[5]+(x[2]?'B':'')).join(',');
  console.log(S.year,k.padEnd(5),String(o.id).padStart(4),o.full.slice(0,24).padEnd(24),'c',String(o.cells|0).padStart(3),'psi',(o.psi||0).toFixed(2),'E/Et',(o.E/etOf(o)).toFixed(2),'tr',(o.treas||0).toFixed(2),'ow',(o.owed||0).toFixed(2),'|',top,'| cw',mine)}}}})();`);
