// mean sod cover by region, province world, at history start
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'];
const core=CORE.map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`
;(function(){
const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory('1');
const LA=i=>WD.lat[i]*180/Math.PI,LO=i=>(WD.cxA[i]+0.5)/W*360-180,CW=i=>WD.szF?1/WD.szF[i]:1;
const R={Greece:[36,41,20,27],Levant:[31,37,34,37],AnatoliaW:[36,41,26,32],Zagros:[32,38,45,50],Fars:[28,32,50,56],Mesop:[30,37,40,48],
 Hungary:[45,48.5,18,22.5],Pontic:[45,50,30,45],Kazakh:[46,52,55,75],Poland:[50,54,15,24],France:[44,50,-1,6],Germany:[48,54,7,14],Ukraine_fs:[49,52,24,32],NChina:[34,40,106,118],Prairie:[38,48,-102,-95]};
const out={};for(const k in R){const b=R[k];let a=0,m=0;for(const i of WD.landIdx){const la=LA(i),lo=LO(i);if(la>=b[0]&&la<=b[1]&&lo>=b[2]&&lo<=b[3]){a+=WD.turf[i]*CW(i);m+=CW(i)}}out[k]=m?+(a/m).toFixed(2):null}
console.log(process.env.SW||'now',JSON.stringify(out));
})();`);
