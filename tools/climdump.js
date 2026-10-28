// Dump model and observed fields as raw float32 files for plotting. Usage: node tools/climdump.js outdir
const fs=require('fs'),zlib=require('zlib'),path=require('path');const S_=path.join(__dirname,'..','src');
const rd=f=>fs.readFileSync(path.join(S_,f),'utf8'),inf=f=>new Uint8Array(zlib.inflateSync(Buffer.from(rd(f),'base64')));
const out=process.argv[2];
eval(rd('world.js')+rd('climate.js')+`
const E=decodeEarth(inf('earth_elev.b64'),inf('koppen.b64'),inf('earth_climate.b64'));const smp=climateSampler(EARTH_CLIMATE),g=climPrep(E.height),Tm=climRun(g,{}),M=climMoist(g,Tm,{});
const Pa=new Float32Array(CN),Po=new Float32Array(CN),Ta=new Float32Array(CN),To=new Float32Array(CN);
for(let i=0;i<CN;i++){let s=0,t=0;for(let m=0;m<12;m++){s+=M.Pm[m*CN+i];t+=Tm[m*CN+i]}Pa[i]=s;Ta[i]=t/12-CLM.lapse*g.elev[i]/1000*g.land[i];
  const y=Math.floor(i/CW),x=i%CW,la=90-(y+0.5)*180/CH,lo=(x+0.5)*360/CW-180;Po[i]=g.land[i]>0.5?smp(la,lo,'precipitation'):NaN;To[i]=g.land[i]>0.5?smp(la,lo,'temperature'):NaN}
const w=(n,a)=>fs.writeFileSync(out+'/'+n+'.f32',Buffer.from(a.buffer));
w('Pa',Pa);w('Po',Po);w('Ta',Ta);w('To',To);w('land',g.land);
for(const m of [0,6]){w('U'+m,M.Wind[m].U);w('V'+m,M.Wind[m].V);w('pr'+m,M.Wind[m].pr);w('P'+m,M.Pm.slice(m*CN,(m+1)*CN))}
console.log('dumped',CW,CH);`);
