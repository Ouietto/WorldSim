// the early gathering of Egypt and Mesopotamia (2026-11-25, after run 148: every crisis package made the first unifications late):
// every 50 years from 3500 BCE the leading realm of each box (share of the box's people, provinces, mean integration, stress and its
// biggest parts, how deep the crisis is, weariness, mandate, burden, treasury), and every civil war, collapse or strife of a realm
// holding a fifth of a box, with its share before, just after, and 20 and 50 years later. Usage: gather2.js <seed> <endYear>
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};
const shOf=(k,id)=>{let t=0,v=0;for(const i of BX[k]){t+=S.pop[i];if(S.pol[i]===id)v+=S.pop[i]}return t?v/t:0};
const lead=k=>{const m=new Map();let t=0;for(const i of BX[k]){t+=S.pop[i];const p=S.pol[i];if(p)m.set(p,(m.get(p)||0)+S.pop[i])}let bk=0,bv=0;for(const [p,v] of m)if(v>bv){bv=v;bk=p}return {id:bk,sh:t?bv/t:0}};
const ev=[];const wrap=(name,f)=>function(o){const recs=[];if(o&&o.kind==='state')for(const k in BX){const sh=shOf(k,o.id);if(sh>0.2)recs.push({k,y:S.year,kind:name,id:o.id,nm:o.full.slice(0,20),psi:+(o.psi||0).toFixed(2),
    dp:typeof deepOf==='function'?+deepOf(o).toFixed(2):0,nU:o.nU||0,sh0:sh,why:Object.entries(o.why||{}).filter(([q,v])=>typeof v==='number'&&v>0.1).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([q,v])=>q+v.toFixed(2)).join(' ')})}
  const r=f.apply(this,arguments);for(const e of recs){e.sh1=shOf(e.k,e.id);ev.push(e)}return r};
civilWar=wrap('civil',civilWar);collapse=wrap('collapse',collapse);if(typeof strife==='function')strife=wrap('strife',strife);
const END=+(process.argv[3]||-2000);
while(S.year<END){step();
  for(const e of ev){if(e.sh20==null&&S.year>=e.y+20)e.sh20=shOf(e.k,e.id);if(e.sh50==null&&S.year>=e.y+50)e.sh50=shOf(e.k,e.id)}
  if(S.year%50===0&&S.year>=-3500)for(const k in BX){const L=lead(k),o=S.pols[L.id];if(!o){console.log(S.year,k,'none');continue}let n=0,ig=0;for(const i of WD.landIdx)if(S.pol[i]===o.id){n++;ig+=S.integ[i]}
    const top=Object.entries(o.why||{}).filter(([q,v])=>typeof v==='number'&&v>0.05).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([q,v])=>q+v.toFixed(2)).join(' ');
    console.log(S.year,k.padEnd(5),String(o.id).padStart(5),o.full.slice(0,20).padEnd(20),'age',S.year-o.born,'share',L.sh.toFixed(2),'prov',n,'integ',(ig/n).toFixed(2),'psi',(o.psi||0).toFixed(2),'['+top+']',
      'deep',(typeof deepOf==='function'?deepOf(o):0).toFixed(2),'wy',(o.wy||0).toFixed(2),'mand',(o.mandate??1).toFixed(2),'bd',(o.burden||0).toFixed(2),'tr',(o.treas||0).toFixed(2),'wars',o.enemies.size)}}
for(const e of ev)console.log('EV',e.y,e.k,e.kind,e.id,e.nm,'psi',e.psi,'deep',e.dp,'nU',e.nU,'share',e.sh0.toFixed(2),'->',(e.sh1??0).toFixed(2),'+20y',e.sh20==null?'-':e.sh20.toFixed(2),'+50y',e.sh50==null?'-':e.sh50.toFixed(2),'|',e.why);
console.log('counts: civil wars',ev.length,'vacuum',S.vacN||0,'civil truces',S.truceCN||0,'truces',S.truceN||0)})();`);
