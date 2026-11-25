const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const seed=process.argv[2]||'1',END=+(process.argv[3]||-500);
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(seed);const step=()=>{const g=stepG();while(!g.next().done){}};
while(S.year<END)step();
const LA=i=>(WD.lat[i]*180/Math.PI).toFixed(0),LO=i=>((WD.cxA[i]+0.5)/W*360-180).toFixed(0);
const st=S.alive.map(id=>S.pols[id]).filter(o=>o.kind==='state').sort((a,b)=>b.pop-a.pop);
console.log('year',S.year,'states',st.length);
for(const o of st.slice(0,25)){const c=o.capital;console.log(String(o.name||o.id).slice(0,14).padEnd(14),'cap',LA(c)+','+LO(c),'coast',WD.coast[c]?1:0,'sail',S.sail[c].toFixed(2),'pop',(o.pop/1e3).toFixed(0)+'k','K',(o.K/1e3).toFixed(0)+'k','tax',(o.tax||0).toFixed(0),'gInc',(o.gInc||0).toFixed(1),'trade',(o.trade||0).toFixed(1),'sea',o.sea?o.sea.length:0,'town',S.city[c]>=0?(urbanShare(c)).toFixed(2):'-')}
// coastal Mediterranean stats
let cp=0,ck=0;for(const i of WD.landIdx){const la=WD.lat[i]*180/Math.PI,lo=(WD.cxA[i]+0.5)/W*360-180;if(la>30&&la<42&&lo>12&&lo<37&&WD.coast[i]){cp+=S.pop[i];ck+=S.K[i]}}
console.log('E Med coast pop',(cp/1e6).toFixed(2),'M  K',(ck/1e6).toFixed(2),'M')})();`);
