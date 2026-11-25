// what holds Egypt's leading realm together (2026-11-25, after run 144): every 50 years from 3200 BCE its share of the Nile's
// people, provinces, the crisis count nC, stress and its biggest parts, cohesion, power against the next realm in Egypt,
// intelligence, corruption, elite and treasury; every civil war and collapse it suffers, with the share of the Nile it held before,
// just after, and 20 and 50 years later; and the share of decades with no realm holding a third
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const C=WD.regions.find(r=>r.k==='egypt').cells;
const shares=()=>{const m=new Map();let t=0;for(const i of C){t+=S.pop[i];const p=S.pol[i];if(p)m.set(p,(m.get(p)||0)+S.pop[i])}const a=[...m].sort((x,y)=>y[1]-x[1]);return {t,a}};
const shOf=id=>{const {t,a}=shares();const e=a.find(x=>x[0]===id);return e?e[1]/t:0};
const ev=[];const wrap=(name,f)=>function(o){const egy=o&&o.kind==='state'&&shOf(o.id)>0.2;let rec=null;
  if(egy)rec={y:S.year,k:name,id:o.id,nm:o.full.slice(0,20),psi:+(o.psi||0).toFixed(2),nU:o.nU||0,cells:o.cells,sh0:shOf(o.id),S:+(o.S||0).toFixed(2),why:Object.entries(o.why||{}).filter(([q,v])=>typeof v==='number'&&v>0.1).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([q,v])=>q+v.toFixed(2)).join(' ')};
  const r=f.apply(this,arguments);if(rec){rec.sh1=shOf(rec.id);rec.alive=!!S.pols[rec.id].alive;ev.push(rec)}return r};
civilWar=wrap('civil',civilWar);collapse=wrap('collapse',collapse);if(typeof strife==='function')strife=wrap('strife',strife);
const END=+(process.argv[3]||-300);let dec=0,frag=0;
while(S.year<END){step();
  if(S.year%10===0&&S.year>=-3000){dec++;const {t,a}=shares();if(!a.length||a[0][1]/t<1/3)frag++}
  for(const e of ev){if(e.sh20==null&&S.year>=e.y+20)e.sh20=shOf(e.id);if(e.sh50==null&&S.year>=e.y+50)e.sh50=shOf(e.id)}
  if(S.year%50===0&&S.year>=-3200){const {t,a}=shares();if(!a.length){console.log(S.year,'no realm');continue}const o=S.pols[a[0][0]];
    let P=0,ss=0;for(const i of WD.landIdx)if(S.pol[i]===o.id){P+=S.pop[i];ss+=S.s[i]*S.pop[i]}
    const nx=a[1]?S.pols[a[1][0]]:null,nC=Math.max(o.cells,1.5*(o.nU||0)),w=o.why||{};
    const top=Object.entries(w).filter(([q,v])=>typeof v==='number'&&v>0.05).sort((x,y)=>y[1]-x[1]).slice(0,5).map(([q,v])=>q+v.toFixed(2)).join(' ');
    console.log(S.year,String(o.id).padStart(5),o.full.slice(0,20).padEnd(20),'age',S.year-o.born,'share',(a[0][1]/t).toFixed(2),'next',a[1]?(a[1][1]/t).toFixed(2):'-','pw/next',nx?(power(o)/(power(nx)+1)).toFixed(1):'-',
      'nU',o.nU||0,'nC',nC.toFixed(0),'psi',(o.psi||0).toFixed(2),'['+top+']','S',(o.S||0).toFixed(2),'coh',(ss/P).toFixed(2),'I',(o.intel??0).toFixed(2),'cor',(o.cor||0).toFixed(2),'E/Et',(o.E/etOf(o)).toFixed(2),'tr',(o.treas||0).toFixed(2),'mom',(o.mom||0).toFixed(2))}}
console.log('decades with no realm holding a third of the Nile (3000 BCE on):',frag,'of',dec);
for(const e of ev)console.log('EV',e.y,e.k,e.id,e.nm,'psi',e.psi,'nU',e.nU,'S',e.S,'share',e.sh0.toFixed(2),'->',(e.sh1??0).toFixed(2),'+20y',e.sh20==null?'-':e.sh20.toFixed(2),'+50y',e.sh50==null?'-':e.sh50.toFixed(2),e.alive?'':'(realm ended)','|',e.why)})();`);
