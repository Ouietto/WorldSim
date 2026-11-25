// the line provinces that press hardest on Egypt's leading realm under threat cohesion, and who is across them
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const EG=WD.regions.find(r=>r.k==='egypt').cells;const w=WD;const LA=i=>WD.lat[i]*180/Math.PI,LO=i=>(WD.cxA[i]+0.5)/W*360-180;
for(const Y of (process.argv[3]||'-3000,-2500').split(',').map(Number)){while(S.year<Y)step();const FT=frontThreat();
  const cnt=new Map();for(const i of EG){const p=S.pol[i];if(p)cnt.set(p,(cnt.get(p)||0)+S.pop[i])}let bk=0,bv=0;for(const [p,v] of cnt)if(v>bv){bv=v;bk=p}const o=S.pols[bk];
  let P=0;for(const i of WD.landIdx)if(S.pol[i]===bk)P+=S.pop[i];
  console.log('==',S.year,o.full,'people',Math.round(P));
  for(const i of WD.landIdx){if(S.pol[i]!==bk)continue;const ei=S.eth[i],ri=S.rel[i];let best=null;
    for(let e=w.nbS[i];e<w.nbS[i+1];e++){const j=w.nbA[e];if(j<0||!w.land[j]||S.pol[j]===bk)continue;const ej=S.eth[j];
      if(!((ej>=0&&ei>=0&&ej!==ei&&ethDist(ei,ej)>0.22)||(ri>=0&&S.rel[j]>=0&&S.rel[j]!==ri)))continue;const q=S.pol[j];
      const t=q?power(S.pols[q])/(power(o)+1)*(0.4+0.6*dispOf(o,S.pols[q])):S.pop[j]*(1+2*rideAtCell(j))/(0.5*(S.pop[i]+1));
      if(!best||t>best.t)best={t,j,q:q?S.pols[q].full:'stateless',pj:Math.round(S.pop[j]),ride:+rideAtCell(j).toFixed(2),past:+S.past[j].toFixed(2),eth:S.eths[ej]?S.eths[ej].name:'-',lat:LA(j).toFixed(1),lon:LO(j).toFixed(1)}}
    console.log(' prov',i,'lat',LA(i).toFixed(1),'lon',LO(i).toFixed(1),'pop',Math.round(S.pop[i]),'FT',FT[i].toFixed(2),'thr',(S.thr?S.thr[i]:0).toFixed(2),'s',S.s[i].toFixed(2),best?'| line: '+JSON.stringify(best):'')}}})();`);
