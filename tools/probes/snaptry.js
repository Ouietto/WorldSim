const fs=require('fs'),zlib=require('zlib'),path=require('path'),v8=require('v8');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory('1');const step=()=>{const g=stepG();while(!g.next().done){}};
while(S.year<-6000)step();
// find function-valued fields anywhere in S and WD
const seen=new Set(),fnp=[];const walk=(x,p,d)=>{if(x===null||typeof x!=='object'||seen.has(x)||d>8)return;seen.add(x);if(ArrayBuffer.isView(x))return;
  const ent=x instanceof Map?[...x.entries()].map(([k,v])=>[String(k),v]):x instanceof Set?[...x].map((v,k)=>[k,v]):Object.entries(x);
  for(const [k,v] of ent){if(typeof v==='function'){if(fnp.length<40)fnp.push(p+'.'+k)}else walk(v,p+'.'+k,d+1)}};
walk(S,'S',0);console.log('functions in S:',fnp.join(' '));fnp.length=0;seen.clear();walk(WD,'WD',0);console.log('functions in WD:',fnp.join(' '));
const t0=Date.now();const keys=Object.keys(S).filter(k=>typeof S[k]!=='function');const So={};for(const k of keys)So[k]=S[k];
try{const b=v8.serialize(So);console.log('S bytes',b.length,'ms',Date.now()-t0,'gz',zlib.gzipSync(b,{level:1}).length)}catch(e){console.log('S err',e.message)}
const wk=Object.keys(WD).filter(k=>typeof WD[k]!=='function');const Wo={};for(const k of wk)Wo[k]=WD[k];
try{const b=v8.serialize(Wo);console.log('WD bytes',b.length)}catch(e){console.log('WD err',e.message)}
console.log('globals?',typeof P,Object.keys(P).length)})();`);
