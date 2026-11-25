const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});let a=0,m=0;
for(const i of WD.landIdx){const la=WD.lat[i]*180/Math.PI,lo=(WD.cxA[i]+0.5)/W*360-180;if(la>28&&la<38&&lo>34&&lo<56){a+=WD.sF[i];m++}}
console.log(process.env.KV||'-',process.env.SW||'-','Levant-Iran mean farm suitability',(a/m).toFixed(3))})();`);
