// the yearly flood (2026-11-26): every 50 years from 3500 BCE, Egypt's and Mesopotamia's floods over the last 50 years (median,
// lowest, years under 0.7 and over 1.5 of the river's running mean) on their irrigated provinces, works in place, people and
// capacity, and the famines the chronicle records in each box. Usage: flood.js <seed> <endYear>
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};const acc={meso:[],egypt:[]};const inB={};for(const k in BX){inB[k]=new Set(BX[k])}
const END=+(process.argv[3]||-1500);
while(S.year<END){step();if(S.year<-3550)continue;
  for(const k in BX){let n=0,f=0;for(const i of BX[k])if(S.fl&&WD.rvF[i]>0.2&&S.irrig[i]>0.3){n++;f+=S.fl[i]*S.pop[i]}let pp=0;for(const i of BX[k])if(S.fl&&WD.rvF[i]>0.2&&S.irrig[i]>0.3)pp+=S.pop[i];if(n)acc[k].push(f/pp)}
  if(S.year%50===0&&S.year>=-3500){let line=S.year+'';for(const k in BX){const a=acc[k].slice().sort((x,y)=>x-y);let P=0,K=0,wk=0,nw=0;for(const i of BX[k]){P+=S.pop[i];K+=S.K[i];if(S.wk&&WD.rvF[i]>0.2){wk+=S.wk[i];nw++}}
      const fam=S.chron.filter(c=>c.t==='famine'&&c.y>S.year-50&&c.cell>=0&&inB[k].has(c.cell)).length;
      line+=' | '+k+' flood med '+(a.length?a[a.length>>1].toFixed(2):'-')+' min '+(a.length?a[0].toFixed(2):'-')+' <0.7 '+a.filter(x=>x<0.7).length+' >1.5 '+a.filter(x=>x>1.5).length+' works '+(nw?(wk/nw).toFixed(2):'-')+' people '+(P/1e6).toFixed(2)+'M K '+(K/1e6).toFixed(2)+'M famines '+fam;acc[k]=[]}
    console.log(line)}}
console.log('famines in the chronicle',S.chron.filter(c=>c.t==='famine').length)})();`);
