// how rulers learn war: per ruler, battles near his own army and the skill reached; momentum spread among states at war
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const lw0=learnWar;let calls=0;learnWar=function(o,i,win,dif){calls++;const R=o.ruler,m0=milOf(R);lw0.apply(this,arguments);if(R&&R.mil!=null&&R.mil!==m0){R._n=(R._n||0)+1;R._d=(R._d||0)+(R.mil-m0)}};
const done=[];const su0=succession;succession=function(o){const R=o.ruler;if(o.kind==='state'&&R)done.push({n:R._n||0,d:R._d||0,mil:milOf(R),yrs:S.year-R.since,cells:o.nU||0});return su0.apply(this,arguments)};
const moms=[],vets=[],gsk=[];
while(S.year<+(process.argv[3]||-1500)){step();if(S.year%20===0)for(const id of S.alive){const o=S.pols[id];if(o.kind==='state'&&o.enemies.size&&(o.nU||0)>=5){moms.push(o.mom||0);vets.push(o.vet||0);if(o.arm)for(const a of o.arm)if(a.cmd!==0&&a.sk!=null)gsk.push(a.sk)}}}
const q=(a,p)=>{const b=a.slice().sort((x,y)=>x-y);return b.length?+b[Math.floor(p*(b.length-1))].toFixed(3):null};
const big=done.filter(x=>x.cells>=10);
console.log('learn calls',calls,'rulers',done.length,'of realms >=10 provinces',big.length);
console.log('battles led by the king per ruler (big realms): median',q(big.map(x=>x.n),0.5),'p90',q(big.map(x=>x.n),0.9),'max',q(big.map(x=>x.n),1));
console.log('skill gained: median',q(big.map(x=>x.d),0.5),'p90',q(big.map(x=>x.d),0.9),'max',q(big.map(x=>x.d),1),'| final skill p10/50/90',q(big.map(x=>x.mil),0.1),q(big.map(x=>x.mil),0.5),q(big.map(x=>x.mil),0.9));
console.log('momentum at war (states >=5 provinces): p10',q(moms,0.1),'p50',q(moms,0.5),'p90',q(moms,0.9),'| veterans p50',q(vets,0.5),'p90',q(vets,0.9));
console.log('generals skill p10/50/90/max',q(gsk,0.1),q(gsk,0.5),q(gsk,0.9),q(gsk,1),'n',gsk.length);console.log('ev gate',S.gateN||0,'band',S.bandN||0,'release',S.releaseN||0,'strife',S.strifeN||0,'milHi',S.milHiN||0,'cFall',S.cFallN||0,'cSplit',S.cSplitN||0);
})();`);
