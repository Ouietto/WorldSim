const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const RG={};for(const R of WD.regions)RG[R.k]=new Set(R.cells);const keys=['meso','levant','egypt','iran','anatolia','aegean'];
const rep=()=>{const tot={};for(const k of keys){tot[k]=0;for(const i of RG[k])tot[k]+=S.pop[i]}
 const st=[];for(const id of S.alive){const o=S.pols[id];if(o.kind!=='state')continue;const sh={};for(const k of keys)sh[k]=0;let n=0,p=0;
   for(const i of WD.landIdx)if(S.pol[i]===id){n++;p+=S.pop[i];for(const k of keys)if(RG[k].has(i))sh[k]+=S.pop[i]}
   st.push({id,full:o.full,tier:o.tier,n,p,sh,cap:o.cap,coord:o.coord,S:o.S,wars:o.enemies.size,age:S.year-o.born,over:o.over||0,ll:latLonOf(WD,o.capital).map(v=>v.toFixed(0)).join(',')})}
 st.sort((a,b)=>b.p-a.p);console.log('== year',S.year,'states',st.length,'region people M',Object.entries(tot).map(([k,v])=>k+' '+(v/1e6).toFixed(2)).join(' '));
 for(const o of st.slice(0,6))console.log(' ',o.full.slice(0,40).padEnd(40),o.tier.padEnd(10),'prov',o.n,'popM',(o.p/1e6).toFixed(2),'cap',o.ll,'age',o.age,'wars',o.wars,'S',(o.S||0).toFixed(2),'coord',(o.coord??1).toFixed(2),'capK',Math.round((o.cap||0)/1e3),'share',keys.map(k=>k.slice(0,3)+' '+(tot[k]?Math.round(100*o.sh[k]/tot[k]):0)).join(' '))};
while(S.year<-600){step();if(S.year===-2000||S.year===-1500||S.year===-1000||S.year===-700)rep()}})();`);
