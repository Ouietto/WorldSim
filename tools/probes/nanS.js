const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const lw0=learnWar;let n=0,bad=0,ex=[];learnWar=function(o,i,win,dif){n++;if(!isFinite(dif)){bad++;if(ex.length<5)ex.push([S.year,o.id,i,win,dif,o.kind,o.S,S.s[i]])}
  const R=o.ruler;const r=lw0.apply(this,arguments);if(R&&R.mil!=null&&!isFinite(R.mil)&&ex.length<10)ex.push(['milNaN',S.year,R.comp,R.aggr,dif,o.id,o.full]);if(o.arm)for(const a of o.arm)if(a.sk!=null&&!isFinite(a.sk)&&ex.length<10)ex.push(['skNaN',S.year,a.cmd,dif]);return r};
while(S.year<+(process.argv[3]||-3000))step();
console.log('calls',n,'non-finite odds',bad,JSON.stringify(ex));})();`);
