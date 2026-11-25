const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const R={egypt:WD.regions.find(r=>r.k==='egypt').cells,meso:WD.regions.find(r=>r.k==='meso').cells};
while(S.year<-1000){step();if(S.year%500===0&&S.year>=-6000){const out=[S.year];for(const [k,C] of Object.entries(R)){let p=0,K=0,f=0,wk=0,ir=0,sa=0,st=0;
  for(const i of C){const v=WD.rvF[i];p+=S.pop[i];K+=S.K[i];f+=v;wk+=(S.wk?S.wk[i]:S.irrig[i])*v;ir+=S.irrig[i]*v;sa+=S.salt[i]*v;const o=S.pol[i]&&S.pols[S.pol[i]];if(o&&o.kind==='state')st+=S.pop[i]}
  out.push(k,'pop',(p/1e6).toFixed(2),'K',(K/1e6).toFixed(2),'works',(wk/f).toFixed(2),'know',(ir/f).toFixed(2),'salt',(sa/f).toFixed(2),'inStates',(st/Math.max(1,p)).toFixed(2),'|')}console.log(out.join(' '))}}})();`);
