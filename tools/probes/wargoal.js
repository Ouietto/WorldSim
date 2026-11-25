const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
while(S.year<-1000)step();const G={};for(const w of S.wars){if(!w)continue;const k=w.goal||'?';G[k]=(G[k]||0)+1}
let lev=0,lc=0;if(S.lev)for(const i of WD.landIdx)if(S.lev[i]>0){lc++;lev+=S.lev[i]}
console.log('war goals',JSON.stringify(G),'wreckN',S.wreckN||0,'cutN',S.wkCutN||0,'provinces with leverage',lc,'people depending M',(lev/1e6).toFixed(2))})();`);
