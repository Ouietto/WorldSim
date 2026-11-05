// Province rebuild, stage 1: build provinces from the 25 km grid and draw them. node tools/provinces_preview.js capC.bin count outdir
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=path.join(__dirname,'..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const [capFiles,count,out,alpha]=[process.argv[2].split(','),+process.argv[3]||26000,process.argv[4]||'.',process.argv[5]!=null?+process.argv[5]:0.5];const tag=count+'_a'+alpha;
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});const w=WD;
const capC=new Float32Array(N);for(const f of capFiles){const a=new Float32Array(new Uint8Array(fs.readFileSync(f)).buffer);for(let i=0;i<N;i++)capC[i]+=a[i]/capFiles.length}
const fp=new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,'earth_fp.b64'),'utf8'),'base64')));
const t0=Date.now();const P=buildProvinces(w,{capC,fp,count,alpha});
console.log('provinces',P.np,'target people per province',Math.round(P.T),'built in',((Date.now()-t0)/1000).toFixed(1)+'s');
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
      if(edge)c=c.map(v=>Math.round(v*0.55));if(P.river[k])c=[50,105,200]}
    for(let dy=0;dy<sc;dy++)for(let dx=0;dx<sc;dx++){const o=(((y-y0)*sc+dy)*Wd+(x-x0)*sc+dx)*3;img[o]=c[0];img[o+1]=c[1];img[o+2]=c[2]}}
  fs.writeFileSync(path.join(out,name+'.ppm'),Buffer.concat([Buffer.from('P6\\n'+Wd+' '+Hd+'\\n255\\n'),img]))}
draw('nile_'+tag,14,33,24,40,8);draw('mesopotamia_'+tag,28,40,36,52,8);draw('europe_'+tag,35,60,-12,35,4);draw('france_'+tag,42,52,-6,9,8);draw('world_'+tag,-58,80,-180,180,1);
fs.writeFileSync(path.join(out,'pid_'+tag+'.bin'),Buffer.from(P.pid.buffer))})()`);
