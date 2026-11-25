const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
for(const i of [WD.landIdx[100],WD.landIdx[5000],WD.landIdx[20000]]){const [la,lo]=latLonOf(WD,i);console.log('i',i,'latLonOf',la.toFixed(1),lo.toFixed(1),' probe lon',((WD.cxA[i]+0.5)/W*360-180).toFixed(1),' sin',WD.sinLon[i].toFixed(3),'cos',WD.cosLon[i].toFixed(3))}
applyRegion(WD);console.log('kept',WD.landIdx.length,'core',WD.inCore.reduce((a,b)=>a+b,0))})();`);
