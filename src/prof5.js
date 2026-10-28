const fs=require('fs'),zlib=require('zlib');
let core=['world.js','climate.js','lang.js','hist.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('');
const elev=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/earth_elev.b64','utf8'),'base64'));
const kg=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/koppen.b64','utf8'),'base64'));
const climate=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/earth_climate.b64','utf8'),'base64'));
const fns=['climateStep','weather','hearthCheck','computeK','growth','migrate','seaHop','techStep','disease','poolPass','caravanPass','politics','ethPass','relPass','recordStats','cityPass','regionPass','mixPass','exitPass','distBFS'];
let wrap='';for(const f of fns)wrap+=`{const o=${f};${f}=function(){const t=performance.now();const r=o.apply(this,arguments);TT["${f}"]=(TT["${f}"]||0)+performance.now()-t;return r}}\n`;
const A=+(process.argv[2]||-2000),B=+(process.argv[3]||-1500);
eval(core+`
const TT={};${wrap}
const E=decodeEarth(new Uint8Array(elev),new Uint8Array(kg),new Uint8Array(climate));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});newHistory('2');
while(S.year<A)step();for(const k in TT)TT[k]=0;const t0=performance.now();
while(S.year<B)step();
console.log('ms/yr',((performance.now()-t0)/(B-A)).toFixed(1));
console.log(Object.entries(TT).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+(v/1000).toFixed(1)+'s').join(' '));`);
