// Grade the climate model against NOAA 1981-2010 land normals. Usage: node tools/climgrade.js [tune]
const fs=require('fs'),zlib=require('zlib'),path=require('path');const S_=path.join(__dirname,'..','src');
const rd=f=>fs.readFileSync(path.join(S_,f),'utf8'),inf=f=>new Uint8Array(zlib.inflateSync(Buffer.from(rd(f),'base64')));
eval(rd('world.js')+rd('climate.js')+`
const E=decodeEarth(inf('earth_elev.b64'),inf('koppen.b64'),inf('earth_climate.b64'));
const truth=EARTH_CLIMATE,smp=climateSampler(truth),g=climPrep(E.height);
const pts=[];for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const i=y*CW+x;if(g.land[i]<0.6)continue;const lat=90-(y+0.5)*180/CH,lon=(x+0.5)*360/CW-180;
  const t=smp(lat,lon,'temperature'),rg=smp(lat,lon,'temperatureRange');if(!Number.isFinite(t)||!Number.isFinite(rg))continue;pts.push({i,t,rg,w:Math.cos(lat*Math.PI/180),lat})}
function grade(par,verbose){const Tm=climRun(g,{par});let e=0,er=0,b=0,W=0;const bands={};
  for(const p of pts){let s=0,lo=1e9,hi=-1e9;for(let m=0;m<12;m++){const v=Tm[m*CN+p.i]-(par&&par.lapse||CLM.lapse)*g.elev[p.i]/1000;s+=v;lo=Math.min(lo,v);hi=Math.max(hi,v)}const t=s/12,rg=hi-lo;
    e+=p.w*(t-p.t)**2;er+=p.w*(rg-p.rg)**2;b+=p.w*(t-p.t);W+=p.w;
    if(verbose){const k=Math.round(p.lat/15)*15;const B=bands[k]||(bands[k]={n:0,dt:0,dr:0});B.n++;B.dt+=t-p.t;B.dr+=rg-p.rg}}
  const r={rmseT:Math.sqrt(e/W),rmseR:Math.sqrt(er/W),bias:b/W};
  if(verbose)console.log(Object.keys(bands).map(Number).sort((a,b)=>b-a).map(k=>k+':'+(bands[k].dt/bands[k].n).toFixed(1)+'/'+(bands[k].dr/bands[k].n).toFixed(1)).join(' '));
  return r}
const t0=Date.now();let r=grade(null,true);console.log('default',JSON.stringify(r),'ms',Date.now()-t0);
if(process.argv[2]==='tune'){const par=Object.assign({},CLM),keys=['A','B','D','albO','albL','albI','albCl','mixL','cLand','gam','adv','curr'];
  const score=q=>q.rmseT+0.6*q.rmseR;let best=score(r);
  for(let it=0;it<3;it++)for(const k of keys){const d=CDEF2.find(x=>x[0]===k),st=(d[3]-d[2])*0.06;
    for(const dir of [1,-1]){let moved=false;for(;;){const tr=Object.assign({},par);tr[k]=clamp(par[k]+dir*st,d[2],d[3]);if(tr[k]===par[k])break;const q=grade(tr),sc=score(q);if(sc<best-1e-3){best=sc;par[k]=tr[k];moved=true}else break}if(moved)break}}
  console.log('tuned',JSON.stringify(grade(par,true)),JSON.stringify(Object.fromEntries(Object.entries(par).map(([k,v])=>[k,+v.toFixed(3)]))))}
`);
