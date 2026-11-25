const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
// follow the two most populous states of the core each century: stress index and its parts, cohesion, civil wars (chronicle)
const cw0=civilWar;let cwN={};civilWar=function(o,b){cwN[o.id]=(cwN[o.id]||0)+1;return cw0.apply(this,arguments)};
while(S.year<-600){step();if(S.year%200===0&&S.year>=-3600){const st=S.alive.map(id=>S.pols[id]).filter(o=>o.kind==='state').sort((a,b)=>b.pop-a.pop).slice(0,2);
  for(const o of st){const w=o.why||{};const top=Object.entries(w).filter(([k,v])=>typeof v==='number'&&k!=='sh').sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+' '+v.toFixed(2)).join(', ');
    console.log(S.year,o.full.slice(0,26).padEnd(26),'cells',o.cells,'popM',(o.pop/1e6).toFixed(2),'S',(o.S||0).toFixed(2),'psi',(o.psi||0).toFixed(2),'shock',(o.shock||0).toFixed(2),'civil wars so far',cwN[o.id]||0,'| top:',top)}}}})();`);
