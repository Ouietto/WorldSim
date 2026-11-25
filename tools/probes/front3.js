// what presses on the leading realm of Egypt and Mesopotamia under threat cohesion: the threat field (realm or people across),
// the province's own memory of raids and war, and who is across
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};const w=WD;
while(S.year<+(process.argv[3]||-1500)){step();if(S.year%250===0&&S.year>=-3500){const FT=frontThreat();
  for(const k in BX){const cnt=new Map();for(const i of BX[k]){const p=S.pol[i];if(p)cnt.set(p,(cnt.get(p)||0)+S.pop[i])}let bk=0,bv=0;for(const [p,v] of cnt)if(v>bv){bv=v;bk=p}const o=S.pols[bk];if(!o)continue;
    let P=0,a=0,b=0,c=0,ss=0;const who=new Map();for(const i of WD.landIdx){if(S.pol[i]!==bk)continue;const p=S.pop[i];P+=p;const t=S.thr?S.thr[i]:0;a+=FT[i]*p;b+=t*p;c+=Math.max(FT[i],t)*p;ss+=S.s[i]*p;
      for(let e=w.nbS[i];e<w.nbS[i+1];e++){const j=w.nbA[e];if(j<0||!w.land[j])continue;const q=S.pol[j];if(q===bk)continue;const key=q?S.pols[q].full.slice(0,18)+(o.enemies.has(q)?'(war)':''):'none';who.set(key,(who.get(key)||0)+1)}}
    const top=[...who].sort((x,y)=>y[1]-x[1]).slice(0,4).map(x=>x[0]+':'+x[1]).join(', ');
    console.log(S.year,k.padEnd(5),o.full.slice(0,20).padEnd(20),'S',(ss/P).toFixed(2),'threat across',(a/P).toFixed(2),'raid/war memory',(b/P).toFixed(2),'pressing',(c/P).toFixed(2),'wars',o.enemies.size,'| across:',top)}}}})();`);
