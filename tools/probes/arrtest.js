const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory('1');let X=-1,bd=1e9;for(const i of WD.landIdx){const [la,lo]=latLonOf(WD,i);const d=(la-36)**2+(lo-38)**2;if(d<bd){bd=d;X=i}}
WD.region.arr={n:1,end:0,items:{'c:rice':[[-9990,X]],'t:terrace':[[-9985,X]],'h:horse':[[-9980,X]],'b:dog':[[-9980,X]]}};
const step=()=>{const g=stepG();while(!g.next().done){}};while(S.year<-9970)step();
console.log('X',X,latLonOf(WD,X).map(v=>v.toFixed(1)),'pop',S.pop[X].toFixed(0),'log',JSON.stringify(S.arrLog),'arrN',S.arrN);
let rice=0,ter=0,hor=0;for(const i of WD.landIdx){if((S.pkAv[i]>>CI.rice)&1)rice++;if(S.tk[TI.terrace][i]>=0.5)ter++;if(S.dom[HI.horse][i]>0.3)hor++}console.log('provinces holding rice',rice,'terrace',ter,'horse',hor)})();`);
