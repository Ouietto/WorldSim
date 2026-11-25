const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const seed=process.argv[2]||'1';
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(seed);const step=()=>{const g=stepG();while(!g.next().done){}};
const R=WD.regions.find(r=>r.k==='egypt'),C=R.cells;
while(S.year<-1000){step();if(S.year%250===0&&S.year>=-4500){let p=0,K=0,rv=0,ir=0,cd=0,a=0,sf=0,stt=0,war=0;
 for(const i of C){p+=S.pop[i];K+=S.K[i];rv+=WD.rvF[i]*WD.area[i];ir+=S.pop[i]*S.irrig[i];cd+=S.cdP[i]*WD.area[i];a+=WD.area[i];sf+=S.sFc[i]*WD.area[i];if(S.pol[i]&&S.pols[S.pol[i]]&&S.pols[S.pol[i]].kind==='state')stt+=S.pop[i]}
 console.log(S.year,'popM',(p/1e6).toFixed(2),'KM',(K/1e6).toFixed(2),'pop/K',(p/Math.max(1,K)).toFixed(2),'rvF',(rv/a).toFixed(3),'sFc',(sf/a).toFixed(3),'irrig',(ir/Math.max(1,p)).toFixed(2),'dP',(cd/a).toFixed(1),'inStates',(stt/Math.max(1,p)).toFixed(2),'provinces',C.length)}}})();`);
