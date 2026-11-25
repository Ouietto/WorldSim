// the gathering phase: decades when no realm holds a third of Mesopotamia or Egypt. For the three largest realms in the box: how
// often they fight, whom, how their attacks go, what they gain and how; and how long until one holds a third again
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};const inB={};for(const k in BX){inB[k]=new Uint8Array(WD.n);for(const i of BX[k])inB[k][i]=1}
// per polity per decade: attacks made into states, wins, by odds; wars declared
const A=new Map();const st=id=>{let x=A.get(id);if(!x){x={att:0,win:0,pw:0,attIn:0,winIn:0,dec:0,decIn:0,decisive:0,band:0,gate:0,lost:0};A.set(id,x)}return x};
const at0=attack;attack=function(o,i,j,sea){const q=S.pol[j];const r=at0.apply(this,arguments);if(q&&S.pols[q]&&S.pols[q].kind==='state'&&o.kind==='state'){const x=st(o.id);x.att++;const won=S.pol[j]===o.id;if(won){x.win++;st(q).lost++}
  for(const k in inB)if(inB[k][j]){x.attIn++;if(won)x.winIn++}}return r};
const dc0=decisive;decisive=function(o,d,war){st(o.id).decisive++;return dc0.apply(this,arguments)};
const dw0=declareWar;declareWar=function(As,Ds,name,notable,civil,holy){const w=dw0.apply(this,arguments);if(!civil&&As[0]&&As[0].kind==='state'){const x=st(As[0].id);x.dec++;for(const k in inB)if(inB[k][Ds[0].capital])x.decIn++}return w};
const out={meso:[],egypt:[]};let prevTop={meso:null,egypt:null};
while(S.year<+(process.argv[3]||-500)){step();if(S.year%10!==0||S.year<-3200)continue;
  for(const k in BX){const C=BX[k];let tot=0;const cnt=new Map();for(const i of C){tot+=S.pop[i];const p=S.pol[i];if(!p)continue;const o=S.pols[p];if(o.kind!=='state'||o.tier==='Chiefdom'||o.tier==='Clans')continue;const h=o.over&&S.pols[o.over]&&S.pols[o.over].alive?o.over:p;cnt.set(h,(cnt.get(h)||0)+S.pop[i])}
    const top=[...cnt].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([p,v])=>({p,sh:v/tot}));const frag=!top.length||top[0].sh<1/3;
    const rec={y:S.year,frag,top:top.map(t=>{const o=S.pols[t.p],x=st(t.p);const prov=polCells(t.p).length;let inP=0;for(const i of C)if(S.pol[i]===t.p)inP++;
      let war=0,warIn=0;for(const [q,wid] of o.enemies){const e=S.pols[q];if(!e||!e.alive)continue;war++;if(inB[k][e.capital])warIn++}
      const r2={id:t.p,sh:+t.sh.toFixed(2),prov,inP,tier:o.tier,age:S.year-o.born,S:+(o.S||0).toFixed(2),psi:+(o.psi||0).toFixed(1),mom:+(o.mom||0).toFixed(2),war,warIn,vass:o.tribs||0,att:x.att,win:x.win,attIn:x.attIn,winIn:x.winIn,dec:x.dec,decIn:x.decIn,decisive:x.decisive,lost:x.lost};return r2})};
    if(top.length>1){const p1=power(S.pols[top[0].p]),p2=power(S.pols[top[1].p]);rec.ratio=+(p1/(p2+1)).toFixed(2)}
    out[k].push(rec)}
  A.clear()}
// summary: fragmented decades, the top realm's numbers, and gathering spells (from losing a third-holder to the next one)
const med=a=>{a=a.filter(x=>x!=null).sort((x,y)=>x-y);return a.length?a[a.length>>1]:null},mean=a=>a.length?+(a.reduce((s,x)=>s+x,0)/a.length).toFixed(2):null;
for(const k in out){const R=out[k],F=R.filter(r=>r.frag&&r.top.length);
  console.log('==',k,'decades',R.length,'fragmented',F.length);
  const T=F.map(r=>r.top[0]);
  console.log(' top realm in fragmented decades: share',med(T.map(t=>t.sh)),'provinces',med(T.map(t=>t.prov)),'in box',med(T.map(t=>t.inP)),'age',med(T.map(t=>t.age)),'cohesion',med(T.map(t=>t.S)),'stress',med(T.map(t=>t.psi)),'power vs second',med(F.map(r=>r.ratio)));
  console.log(' per decade: wars declared',mean(T.map(t=>t.dec)),'(on box realms',mean(T.map(t=>t.decIn))+')','attacks on states',mean(T.map(t=>t.att)),'won',mean(T.map(t=>t.win)),'| in the box: attacks',mean(T.map(t=>t.attIn)),'won',mean(T.map(t=>t.winIn)),'| capitals taken',mean(T.map(t=>t.decisive)),'provinces lost',mean(T.map(t=>t.lost)),'| at war (wars open)',mean(T.map(t=>t.war)),'with box realms',mean(T.map(t=>t.warIn)));
  const T2=F.filter(r=>r.top[1]).map(r=>r.top[1]);console.log(' second realm: share',med(T2.map(t=>t.sh)),'attacks',mean(T2.map(t=>t.att)),'won',mean(T2.map(t=>t.win)),'wars declared',mean(T2.map(t=>t.dec)));
  // spells
  let sp=[],start=null;for(const r of R){if(r.frag&&start==null)start=r.y;if(!r.frag&&start!=null){sp.push(r.y-start);start=null}}if(start!=null)sp.push('open '+(R[R.length-1].y-start));
  console.log(' fragmented spells (years):',sp.join(', '));
  const L=R.filter(r=>!r.frag).map(r=>r.top[0].id);const runs=[];let p=null,n=0;for(const id of L){if(id===p)n++;else{if(p!=null)runs.push(n*10);p=id;n=1}}if(p!=null)runs.push(n*10);console.log(' holder runs (years, in order of decades held):',runs.slice(0,30).join(', '))}
})();`);
