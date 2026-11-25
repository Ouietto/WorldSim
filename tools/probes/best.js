const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
const R={Greece:[36,41,20,27],Levant:[31,37,34,37.5],AnatW:[36,41,26,32],AnatC:[37,41,32,40],Zagros:[33,38,44,49],Elam:[30,33,47,51],NIran:[35,38,48,58],Fars:[28,31.5,50,56],Mesop:[30,35,42,47],Egypt:[25,31.5,30,33],
 Hungary:[45,48.5,18,22.5],France:[44,50,-1,6],Poland:[50,54,15,24],Pontic:[45,50,30,45],NChinaPl:[34,38,112,118],Ganges:[24,28,78,88],Andes:[-16,-8,-78,-70],Ethiopia:[8,15,36,40],Mexico:[18,21,-100,-97]};
const LA=i=>WD.lat[i]*180/Math.PI,LO=i=>(WD.cxA[i]+0.5)/W*360-180;
for(const k in R){const b=R[k];let a=0,m=0,sf=0,sb=0,lo=1;for(const i of WD.landIdx){if(LA(i)>=b[0]&&LA(i)<=b[1]&&LO(i)>=b[2]&&LO(i)<=b[3]){const A=WD.area[i];a+=A*WD.bestS[i];m+=A;sf+=A*WD.sF[i];sb+=A*Math.min(1,WD.sF[i]/WD.bestS[i]);lo=Math.min(lo,WD.bestS[i])}}
 console.log(k.padEnd(9),'best share',(a/m).toFixed(2),'min',lo.toFixed(2),' sF',(sf/m).toFixed(2),' sF on best',(sb/m).toFixed(2))}})();`);
