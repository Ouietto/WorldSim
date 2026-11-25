// phase 2 and the peopled frontier: every 250 years, the leading realms of Egypt and Mesopotamia (cohesion, the frontier weight
// their people feel under frontpop) and the five most populous states' intelligence with what it is made of
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};
while(S.year<+(process.argv[3]||-1000)){step();if(S.year%250===0&&S.year>=-3500){const F=FPOP?frontWeight():null,FB=frontBand();let line=S.year+'';
  for(const k in BX){const cnt=new Map();let tot=0;for(const i of BX[k]){tot+=S.pop[i];const p=S.pol[i];if(p)cnt.set(p,(cnt.get(p)||0)+S.pop[i])}let bk=0,bv=0;for(const [p,v] of cnt)if(v>bv){bv=v;bk=p}const o=S.pols[bk];
    if(!o){line+=' | '+k+' none';continue}let P=0,ss=0,fw=0,fb=0;for(const i of WD.landIdx){if(S.pol[i]!==bk)continue;P+=S.pop[i];ss+=S.s[i]*S.pop[i];if(F)fw+=F[i]*S.pop[i];if(FB[i])fb+=S.pop[i]}
    line+=' | '+k+' '+o.full.slice(0,18)+' share '+(bv/tot).toFixed(2)+' coh '+(ss/P).toFixed(2)+' band '+(fb/P).toFixed(2)+(F?' weight '+(fw/P).toFixed(2):'')}
  const st=S.alive.map(id=>S.pols[id]).filter(o=>o.kind==='state').sort((a,b)=>b.pop-a.pop).slice(0,5);
  console.log(line);console.log('   top states: '+st.map(o=>{const i=o.info||{};return o.full.slice(0,14)+' I '+(o.intel??intelOf(o)).toFixed(2)+' (rec '+(i.rec||0).toFixed(2)+' spd '+(i.spd||0).toFixed(2)+' cplx '+(o.cplx||0).toFixed(2)+' cor '+(o.cor||0).toFixed(2)+')'}).join('; '))}}
console.log('false reports',S.falseN||0,'lessons',S.lessonN||0)})();`);
