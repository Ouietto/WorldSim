const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
const core={core:[22,42,18,62]},buf={steppe:[42,55,25,62],centralAsia:[35,45,55,75],indus:[22,37,60,78],arabia:[12,30,35,60],nubiaLibya:[12,33,10,40],centralMed:[30,46,8,20]};
const LA=i=>WD.lat[i]*180/Math.PI,LO=i=>(WD.cxA[i]+0.5)/W*360-180,inb=(i,b)=>LA(i)>=b[0]&&LA(i)<=b[1]&&LO(i)>=b[2]&&LO(i)<=b[3];
let nC=0,nB=0;const per={};for(const i of WD.landIdx){if(inb(i,core.core)){nC++;continue}for(const k in buf)if(inb(i,buf[k])){nB++;per[k]=(per[k]||0)+1;break}}
console.log('land provinces',WD.landIdx.length,'core',nC,'buffer',nB,'share',((nC+nB)/WD.landIdx.length*100).toFixed(1)+'%',JSON.stringify(per))})();`);
