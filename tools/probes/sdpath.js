const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'];
const core=CORE.map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`
;(function(){
const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
const w=WD,SD=w.sumDry;
for(const [a,b,c,d,nm] of [[39.5,22.3,47.5,19.0,'Thessaly-Budapest'],[38.7,35.5,39.6,32.8,'Cappadocia-Ankara'],[39.5,22.3,50.8,12.9,'Thessaly-Saxony'],[40.9,14.3,48.8,2.3,'Naples-Paris']]){
 const G=(la,lo)=>uAtF((lo+180)/360*W,(90-la)/180*H);const s=G(a,b),t=G(c,d);console.log(nm,"start lat",(WD.lat[s]*180/Math.PI).toFixed(1),"end lat",(WD.lat[t]*180/Math.PI).toFixed(1));const prev=new Int32Array(N).fill(-1),seen=new Uint8Array(N);const q=[s];seen[s]=1;
 while(q.length){const i=q.shift();if(i===t)break;for(let k=w.nbS[i];k<w.nbS[i+1];k++){const j=w.nbA[k];if(j<0||!w.land[j]||seen[j])continue;seen[j]=1;prev[j]=i;q.push(j)}}
 const p=[];for(let i=t;i>=0;i=prev[i])p.push(i);p.reverse();
 let slow=0,full=0;const sd=p.map(i=>SD[i].toFixed(2));
 for(let k=1;k<p.length;k++){const d=Math.abs(SD[p[k]]-SD[p[k-1]]);slow+=1/(1-0.85*Math.min(1,d))-1}
 console.log(nm,'steps',p.length-1,'extra steps of delay',slow.toFixed(2),'(a one-step change would add',(1/0.15-1).toFixed(2)+')\\n  SD:',sd.join(' '));
}})();`);
