// Build provinces from the 25 km grid and draw them: node tools/provinces_preview.js [capC files|-] [count] [outdir] [alpha] [--ship]
// capC: the coarse capacity at the pre-industrial peak (float32 per coarse cell; default tools/data/earth_capC.f32.gz, the mean of
// two histories' highest K at 1, 1000 and 1499 CE). --ship writes the province map to src/earth_pid.b64
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=path.join(__dirname,'..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const encodePid=pid=>{const u=new Uint16Array(pid.length);for(let i=0;i<pid.length;i++){const v=pid[i]<0?65535:pid[i],pv=i%1600?(pid[i-1]<0?65535:pid[i-1]):0;u[i]=(v-pv)&65535}
  return zlib.deflateSync(Buffer.from(u.buffer),{level:9}).toString('base64')};
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const SHIP=process.argv.includes('--ship'),AV=process.argv.filter(a=>a!=='--ship');
const [capFiles,count,out,alpha]=[(AV[2]&&AV[2]!=='-'?AV[2]:path.join(__dirname,'data','earth_capC.f32.gz')).split(','),+AV[3]||26000,AV[4]||'.',AV[5]!=null?+AV[5]:1];const tag=count+'_a'+alpha;
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});const w=WD;
const capC=new Float32Array(N);for(const f of capFiles){let raw=fs.readFileSync(f);if(f.endsWith('.gz'))raw=zlib.gunzipSync(raw);const a=new Float32Array(new Uint8Array(raw).buffer);for(let i=0;i<N;i++)capC[i]+=a[i]/capFiles.length}
const fp=new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,'earth_fp.b64'),'utf8'),'base64')));
let t0=Date.now();const FR=fineRivers(w);console.log('fine rivers',((Date.now()-t0)/1000).toFixed(1)+'s','straight-line steps',FR.failed,'loops cut',FR.cuts,'trace cells drained by own heights',FR.unres);
t0=Date.now();const ff=fineFloodplain(w,FR,fp);console.log('floodplain',((Date.now()-t0)/1000).toFixed(1)+'s');
{const LAf=k=>90-(((k/HW)|0)+0.5)*180/HH,LOf=k=>((k%HW)+0.5)*360/HW-180;const R={nubia:[18.5,24,29,35],egyptValley:[24,30,30,33],delta:[30,31.6,29.5,32.5],smeso:[30,33.5,44,48],indus:[24,30,67,72],amu:[37,43,59,62],ganges:[23,28,78,89],yellowPlain:[34,38,113,119],nigerInland:[13,16,-6,-2],france:[43,51,-4,7],sahara:[20,28,0,20]};
  for(const [n,[a,b,c,d]] of Object.entries(R)){let s0=0,s1=0,m=0;for(let k=0;k<HW*HH;k++){if(w.eHi[k]<=SEA_LOW)continue;const la=LAf(k),lo=LOf(k);if(la<a||la>b||lo<c||lo>d)continue;m++;s0+=fp[k]===255?0:fp[k]/250;s1+=ff[k]}console.log('  floodplain',n.padEnd(12),'GFPLAIN',(s0/m).toFixed(3),'combined',(s1/m).toFixed(3))}}
t0=Date.now();const P=buildProvinces(w,{capC,fp,ff,rivers:FR,count,alpha});
console.log('provinces',P.np,'valley river cells',P.valley,'target people per province',Math.round(P.T),'built in',((Date.now()-t0)/1000).toFixed(1)+'s');
const cs=Array.from(P.cap).sort((a,b)=>a-b),ar=Array.from(P.area).sort((a,b)=>a-b),q=(a,f)=>a[Math.floor(f*(a.length-1))];
console.log('people per province (10/50/90%)',Math.round(q(cs,0.1)),Math.round(q(cs,0.5)),Math.round(q(cs,0.9)),'| area km2 (10/50/90%)',Math.round(q(ar,0.1)),Math.round(q(ar,0.5)),Math.round(q(ar,0.9)));
// count provinces in a few regions
const LAf=k=>90-(((k/HW)|0)+0.5)*180/HH,LOf=k=>((k%HW)+0.5)*360/HW-180;
const reg=(n,a,b,c,d)=>{const s=new Set();for(let k=0;k<HW*HH;k++){if(P.pid[k]<0)continue;const la=LAf(k),lo=LOf(k);if(la>=a&&la<=b&&lo>=c&&lo<=d)s.add(P.pid[k])}console.log('  ',n.padEnd(26),s.size,'provinces')};
reg('Egypt Nile 24-31.5N 30-33E',24,31.5,30,33);reg('Nubia 18.5-24N 29-35E',18.5,24,29,35);reg('S Mesopotamia',30,33.5,44,48);reg('France',43,51,-4,7);reg('Sahara 18-28N -10-25E',18,28,-10,25);reg('Ganges plain',23,28,78,89);
const col=p=>{let h=(p*2654435761)>>>0;return[110+(h&127),110+((h>>7)&127),100+((h>>14)&127)]};
function draw(name,la0,la1,lo0,lo1,sc){const x0=Math.floor((lo0+180)/360*HW),x1=Math.floor((lo1+180)/360*HW),y0=Math.floor((90-la1)/180*HH),y1=Math.floor((90-la0)/180*HH);
  const Wd=(x1-x0)*sc,Hd=(y1-y0)*sc,img=Buffer.alloc(Wd*Hd*3);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const k=y*HW+((x%HW)+HW)%HW,p=P.pid[k];let c;
    if(p<0)c=[28,40,62];else{c=col(p);if(P.cls[k]===2)c=c.map(v=>Math.round(v*0.75+40));
      let edge=false;for(const j of [y*HW+((x+1)%HW+HW)%HW,y*HW+((x-1)%HW+HW)%HW,(y+1)*HW+((x%HW)+HW)%HW,(y-1)*HW+((x%HW)+HW)%HW])if(j>=0&&j<HW*HH&&P.pid[j]!==p&&P.pid[j]>=0)edge=true;
      if(ff[k]>0.05)c=[c[0]*(1-0.5*ff[k]),c[1],c[2]*(1-0.3*ff[k])].map(Math.round);if(edge)c=c.map(v=>Math.round(v*0.55));if(FR.on[k])c=[90,150,230];if(P.river[k])c=[30,80,200]}
    for(let dy=0;dy<sc;dy++)for(let dx=0;dx<sc;dx++){const o=(((y-y0)*sc+dy)*Wd+(x-x0)*sc+dx)*3;img[o]=c[0];img[o+1]=c[1];img[o+2]=c[2]}}
  fs.writeFileSync(path.join(out,name+'.ppm'),Buffer.concat([Buffer.from('P6\\n'+Wd+' '+Hd+'\\n255\\n'),img]))}
draw('nile_'+tag,14,33,24,40,8);draw('lowernile_'+tag,24,32,28,35,16);draw('indus_'+tag,22,36,62,78,8);draw('niger_'+tag,8,20,-12,10,6);draw('mesopotamia_'+tag,28,40,36,52,8);draw('europe_'+tag,35,60,-12,35,4);draw('france_'+tag,42,52,-6,9,8);draw('world_'+tag,-58,80,-180,180,1);
fs.writeFileSync(path.join(out,'pid_'+tag+'.bin'),Buffer.from(P.pid.buffer));
if(SHIP){fs.writeFileSync(path.join(SRC,'earth_pid.b64'),encodePid(P.pid));console.log('wrote src/earth_pid.b64')}})()`);
