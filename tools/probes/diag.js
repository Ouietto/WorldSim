// rise-and-fall diagnosis: who holds Mesopotamia and Egypt decade by decade, the leader's power against its rivals, how often lost
// provinces come back to the same realm, and how fast
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const OUT=process.argv[3];
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};
const rec={dec:[],loss:{meso:[],egypt:[]}};const prev={},lost={meso:new Map(),egypt:new Map()};for(const k in BX)prev[k]=new Int32Array(BX[k].length);
while(S.year<-300){step();
  // province changes every year inside the boxes: a province lost by a realm, and whether it comes back to that realm
  if(S.year>=-3500)for(const k in BX){const C=BX[k],P=prev[k],L=lost[k];for(let n=0;n<C.length;n++){const i=C[n],p=S.pol[i];if(p!==P[n]){
      if(P[n]>0){const o=S.pols[P[n]];if(o&&o.alive&&o.kind==='state')L.set(n,{y:S.year,from:P[n]})}
      const l=L.get(n);if(l&&p===l.from){rec.loss[k].push(S.year-l.y);L.delete(n)}
      P[n]=p}}
    for(const [n,l] of L)if(S.year-l.y>200){rec.loss[k].push(null);L.delete(n)}}
  if(S.year%10===0&&S.year>=-3500){const row={y:S.year};
    const st=S.alive.map(id=>S.pols[id]).filter(o=>o.kind==='state');const inR=st.filter(o=>WD.inR?WD.inR[o.capital]:1);
    const pw=new Map(inR.map(o=>[o.id,power(o)]));
    for(const k in BX){const C=BX[k];let tot=0;const cnt=new Map();for(const i of C){tot+=S.pop[i];const p=S.pol[i];if(p)cnt.set(p,(cnt.get(p)||0)+S.pop[i])}
      let bk=0,bv=0;for(const [p,v] of cnt)if(v>bv){bv=v;bk=p}const o=S.pols[bk];
      let riv=0;if(o)for(const [q,v] of pw)if(q!==bk)riv=Math.max(riv,v);
      let nb=0;if(o)for(const [q] of o.nb){const t=S.pols[q];if(t&&t.alive&&t.kind==='state')nb=Math.max(nb,pw.get(q)||power(t))}
      row[k]={id:bk,name:o?o.full.slice(0,24):'-',sh:+(tot?bv/tot:0).toFixed(2),age:o?S.year-o.born:0,pr:o&&riv?+(pw.get(bk)/riv).toFixed(2):null,pn:o&&nb?+(pw.get(bk)/nb).toFixed(2):null,S:o?+(o.S||0).toFixed(2):null,psi:o?+(o.psi||0).toFixed(2):null}}
    rec.dec.push(row)}}
fs.writeFileSync(OUT,JSON.stringify(rec))})();`);
