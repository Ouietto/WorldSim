// Province world against the grid world: node tools/provinces_check.js [outdir]
// Builds the 100 km grid world and the province world from src/earth_pid.b64 and compares totals: land, climate, farming and
// herding land, river flow at the mouths, floodplain farming by region, the rising sea, coasts and sea lanes.
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=path.join(__dirname,'..','src');const OUT=process.argv[2]||null;
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
let t0=Date.now();const w=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});const tW=Date.now()-t0;
t0=Date.now();const pid=decodePid(B('earth_pid.b64')),u=provinceWorld(w,pid,{fp:B('earth_fp.b64')});const tU=Date.now()-t0;
console.log('grid world',tW,'ms; province world',tU,'ms;',u.np,'provinces,',u.n-u.np,'sea units, stray land cells',u.stray);
const D2R=Math.PI/180,LA=(W0,i)=>W0.lat[i]/D2R,LO=(W0,i)=>(W0.cxA[i]+0.5)/W*360-180;
const f=(x,d=0)=>typeof x==='number'?x.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d}):x;
const row=(name,a,b,d=0)=>console.log('  '+name.padEnd(34),f(a,d).padStart(14),f(b,d).padStart(14),(a?((b/a-1)*100).toFixed(1)+'%':'').padStart(8));
const sum=(W0,fn,sel)=>{let s=0;for(const i of W0.landIdx){if(sel&&!sel(i))continue;s+=fn(i)}return s};
console.log('\\n  '.padEnd(36)+'grid'.padStart(14)+'provinces'.padStart(14)+'diff'.padStart(8));
console.log(' counts');row('land units',w.landIdx.length,u.landIdx.length);row('coastal units',w.coastIdx.length,u.coastIdx.length);row('landmasses',w.lmCount,u.lmCount);
row('sea lanes',w.lt.length,u.lt.length);row('units in hollows (fillD>1)',sum(w,i=>w.fillD[i]>1?1:0),sum(u,i=>u.fillD[i]>1?1:0));row('units with a river (rv>0)',sum(w,i=>w.rv[i]>0?1:0),sum(u,i=>u.rv[i]>0?1:0));
console.log(' area, thousand km2');const A=W0=>i=>W0.area[i]/1e3;
row('land at the low stand',sum(w,A(w)),sum(u,A(u)));row('land today',sum(w,A(w),i=>w.landNow[i]),sum(u,A(u),i=>u.landNow[i]));
row('land drowned by 4000 BCE',sum(w,A(w),i=>w.lvl[i]<=seaLevelAt(-4000)),sum(u,A(u),i=>u.lvl[i]<=seaLevelAt(-4000)));
row('land drowned by 7000 BCE',sum(w,A(w),i=>w.lvl[i]<=seaLevelAt(-7000)),sum(u,A(u),i=>u.lvl[i]<=seaLevelAt(-7000)));
row('farmable (area x sF)',sum(w,i=>w.area[i]*w.sF[i]/1e3),sum(u,i=>u.area[i]*u.sF[i]/1e3));row('herding (area x sH)',sum(w,i=>w.area[i]*w.sH[i]/1e3),sum(u,i=>u.area[i]*u.sH[i]/1e3));
row('flood farming (area x rvF)',sum(w,i=>w.area[i]*w.rvF[i]/1e3),sum(u,i=>u.area[i]*u.rvF[i]/1e3),1);row('desert',sum(w,A(w),i=>w.desert[i]),sum(u,A(u),i=>u.desert[i]));
row('nomad land',sum(w,A(w),i=>w.nomad[i]),sum(u,A(u),i=>u.nomad[i]));row('tsetse belt',sum(w,A(w),i=>w.tsetse[i]),sum(u,A(u),i=>u.tsetse[i]));
console.log(' land means (area-weighted)');const M=(W0,k)=>sum(W0,i=>W0.area[i]*W0[k][i])/sum(W0,i=>W0.area[i]);
for(const k of ['T','Pr','amp','elev','rough','gs','tcost','leach','trop','monZone','rainRisk','ffp'])row(k,M(w,k),M(u,k),k==='rough'||k==='leach'||k==='trop'||k==='monZone'||k==='rainRisk'||k==='ffp'?3:1);
console.log(' river flow near the mouth (largest acc in the box)');
const MOUTH={Nile:[29.5,31.8,29.5,32.6],'Tigris-Euphrates':[29,31.5,46,49],Indus:[23.5,26,66.5,69.5],Niger:[4,6.5,5,7.5],Mississippi:[28.5,31,-92,-88.5],Amazon:[-2,1,-52,-48],Yangtze:[30.5,32.5,119.5,122.5],Ganges:[21.5,24.5,88,91.5],Danube:[44.5,45.8,27.5,30],Volga:[45.5,47,46.5,49],Congo:[-6.5,-5,11.5,14],Yellow:[36.5,38.5,117,119.5],Ob:[66,68,70,74]};
for(const [nm,[a,b,c,d]] of Object.entries(MOUTH)){const mx=W0=>{let m=0;for(const i of W0.landIdx){const la=LA(W0,i),lo=LO(W0,i);if(la>=a&&la<=b&&lo>=c&&lo<=d)m=Math.max(m,W0.acc[i])}return m};row(nm,mx(w),mx(u))}
console.log(' flood farming by region (area x rvF, km2) and units');
const REG={'Egypt valley 24-30N':[24,30,30,33.5],'Delta':[30,31.7,29.5,32.6],'Nubia 18.5-24N':[18.5,24,29,35],'S Mesopotamia':[30,33.5,44,48],'Indus 24-30N':[24,30,66,72],'Amu Darya':[37,44,58,66],'Ganges plain':[23,28,78,89],'Yellow River plain':[34,38,113,119],'Niger inland delta':[13,16,-6,-2],'France':[43,51,-4,7]};
for(const [nm,[a,b,c,d]] of Object.entries(REG)){const sel=W0=>i=>{const la=LA(W0,i),lo=LO(W0,i);return la>=a&&la<=b&&lo>=c&&lo<=d};
  row(nm,sum(w,i=>w.area[i]*w.rvF[i],sel(w)),sum(u,i=>u.area[i]*u.rvF[i],sel(u)));row('   units',sum(w,()=>1,sel(w)),sum(u,()=>1,sel(u)))}
{let d=0,m=0;const gT=gridToUnits(u,w.T);for(const i of u.landIdx){d+=Math.abs(gT[i]-u.T[i]);m++}console.log(' grid temperature mapped onto provinces: mean difference from their own',(d/m).toFixed(2),'C')}
row('land area with a river (thousand km2)',sum(w,i=>w.rv[i]>0?w.area[i]/1e3:0),sum(u,i=>u.rv[i]>0?u.area[i]/1e3:0));
console.log(' weather grid weights in range:',Array.from(u.wi).every(x=>x>=0&&x<AGW*AGH)&&Array.from(u.wf).every(x=>x>=0&&x<=1));
// a few lanes across known straits
const near=(W0,la,lo)=>{let b=-1,bd=1e9;for(const i of W0.coastIdx){const d=(LA(W0,i)-la)**2+((LO(W0,i)-lo)*Math.cos(la*D2R))**2;if(d<bd){bd=d;b=i}}return b};
const lane=(W0,p,q)=>{const a=near(W0,...p),b=near(W0,...q);for(let k=W0.ls[a];k<W0.ls[a+1];k++)if(W0.lm[W0.lt[k]]===W0.lm[b])return 'yes';return 'no'};
for(const [nm,p,q] of [['Gibraltar',[36,-5.6],[35.8,-5.8]],['Cyprus-Syria',[35.3,34.0],[35.5,35.9]],['Korea-Japan',[35.1,129],[33.6,130.4]],['Sicily-Tunisia',[37.6,12.5],[37,11]],['Crete-Egypt',[35,25],[31.2,27]]])console.log('  lane',nm.padEnd(16),'grid',lane(w,p,q),'provinces',lane(u,p,q));
if(OUT){fs.mkdirSync(OUT,{recursive:true});
  // floodplain farming map: provinces shaded by rvF, rivers drawn
  const draw=(name,la0,la1,lo0,lo1,sc)=>{const x0=Math.floor((lo0+180)/360*HW),x1=Math.floor((lo1+180)/360*HW),y0=Math.floor((90-la1)/180*HH),y1=Math.floor((90-la0)/180*HH);
    const Wd=(x1-x0)*sc,Hd=(y1-y0)*sc,img=Buffer.alloc(Wd*Hd*3);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const k=y*HW+((x%HW)+HW)%HW,v=u.uid[k];let c;
      if(v>=u.np||!u.land[v])c=[28,40,62];else{const r=Math.min(1,2*u.rvF[v]),s=u.sF[v];c=[Math.round(215-60*s-150*r),Math.round(195+20*s-20*r),Math.round(150-60*s-110*r)];
        let edge=false;for(const j of [y*HW+((x+1)%HW+HW)%HW,(y+1)*HW+((x%HW)+HW)%HW])if(j<HW*HH&&u.uid[j]!==v)edge=true;if(edge)c=c.map(q=>Math.round(q*0.7));
        if(u.fineOn[k])c=u.fineRv[k]>=0.75?[20,60,190]:u.fineRv[k]>0?[60,120,220]:[120,170,235]}
      for(let dy=0;dy<sc;dy++)for(let dx=0;dx<sc;dx++){const o=(((y-y0)*sc+dy)*Wd+(x-x0)*sc+dx)*3;img[o]=c[0];img[o+1]=c[1];img[o+2]=c[2]}}
    fs.writeFileSync(path.join(OUT,name+'.ppm'),Buffer.concat([Buffer.from('P6\\n'+Wd+' '+Hd+'\\n255\\n'),img]))};
  draw('nile',14,32,26,36,8);draw('mesopotamia',29,37.5,38,49,10);draw('indus',22,34,64,76,8);draw('europe',42,56,-6,20,4)}
})()`);
