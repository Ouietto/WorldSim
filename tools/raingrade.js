// Grade modelled rainfall and climate zones against NOAA normals and Köppen. Usage: node tools/raingrade.js [tune]
const fs=require('fs'),zlib=require('zlib'),path=require('path');const S_=path.join(__dirname,'..','src');
const rd=f=>fs.readFileSync(path.join(S_,f),'utf8'),inf=f=>new Uint8Array(zlib.inflateSync(Buffer.from(rd(f),'base64')));
eval(rd('world.js')+rd('climate.js')+`
const E=decodeEarth(inf('earth_elev.b64'),inf('koppen.b64'),inf('earth_climate.b64'));
const smp=climateSampler(EARTH_CLIMATE),g=climPrep(E.height),Tm=climRun(g,{});
const pts=[];for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const i=y*CW+x;if(g.land[i]<0.6)continue;const lat=90-(y+0.5)*180/CH,lon=(x+0.5)*360/CW-180;
  const p=smp(lat,lon,'precipitation');if(!Number.isFinite(p))continue;const kg=kgGroup(E.kg[(y*CSC+CSC/2)*HW+x*CSC+CSC/2]);
  let s=0,lo=1e9,hi=-1e9;for(let m=0;m<12;m++){const v=Tm[m*CN+i]-CLM.lapse*g.elev[i]/1000;s+=v;lo=Math.min(lo,v);hi=Math.max(hi,v)}
  pts.push({i,p,kg,t:s/12,rg:hi-lo,w:Math.cos(lat*Math.PI/180),lat,lon})}
function grade(par,verbose){const {Pm}=climMoist(g,Tm,{par});let e=0,W=0,ok=0,n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0;const bands={},reg={};
  for(const q of pts){let P=0;for(let m=0;m<12;m++)P+=Pm[m*CN+q.i];const a=Math.log10(P+50),b=Math.log10(q.p+50);e+=q.w*(a-b)**2;W+=q.w;
    sx+=a;sy+=b;sxx+=a*a;syy+=b*b;sxy+=a*b;n++;if(q.kg>=0){const sg=simGroup(q.t,P,q.rg);if(sg===q.kg)ok++}
    if(verbose){const k=Math.round(q.lat/15)*15;const B=bands[k]||(bands[k]={n:0,m:0,o:0});B.n++;B.m+=P;B.o+=q.p}}
  const corr=(n*sxy-sx*sy)/Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));
  if(verbose)console.log(Object.keys(bands).map(Number).sort((a,b)=>b-a).map(k=>k+':'+Math.round(bands[k].m/bands[k].n)+'/'+Math.round(bands[k].o/bands[k].n)).join(' '));
  return{rmseLog:Math.sqrt(e/W),corr,koppen:ok/n}}
function probe(par){const {Pm}=climMoist(g,Tm,{par});const at=(la,lo)=>{const y=Math.floor((90-la)/180*CH),x=Math.floor((lo+180)/360*CW);let P=0;for(let m=0;m<12;m++)P+=Pm[m*CN+y*CW+x];return Math.round(P)};
  const L=[['Sahara',23,10],['Congo',0,22],['Amazon',-3,-60],['Poland',52,20],['Ukraine',49,32],['Kazakh',48,67],['Mesopot',33,44],['NChina',35,113],['SChina',25,113],['Ganges',26,83],['Indus',28,70],['Britain',53,-2],['Siberia',62,100],['Atacama',-23,-69],['Namib',-23,15],['Sahel',14,5],['US Midwest',41,-92],['Calif',36,-119]];
  console.log(L.map(([n,la,lo])=>n+':'+at(la,lo)+'/'+Math.round(smp(la,lo,'precipitation'))).join(' '))}
const t0=Date.now();const r=grade(null,true);console.log('default',JSON.stringify(r),'ms',Date.now()-t0);probe(null);
if(process.argv[2]==='tune'){const par={};for(const d of CDEF3)par[d[0]]=CLM[d[0]];const score=q=>q.rmseLog-0.5*q.koppen;let best=score(r);
  for(let it=0;it<3;it++)for(const d of CDEF3){const k=d[0],st=(d[3]-d[2])*0.06;
    for(const dir of [1,-1]){let moved=false;for(;;){const tr=Object.assign({},par);tr[k]=clamp(par[k]+dir*st,d[2],d[3]);if(tr[k]===par[k])break;const q=grade(tr),sc=score(q);if(sc<best-1e-4){best=sc;par[k]=tr[k];moved=true}else break}if(moved)break}}
  console.log('tuned',JSON.stringify(grade(par,true)),JSON.stringify(Object.fromEntries(Object.entries(par).map(([k,v])=>[k,+v.toFixed(3)]))));probe(par)}
`);
