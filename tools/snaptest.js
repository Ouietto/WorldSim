// Checks that a history resumed from a saved world ends exactly where an unbroken one does.
// node tools/snaptest.js <seed> <saveYear> <endYear>    (honours WORLD, REGION, SW, KV like run1.js)
// It runs the seed to saveYear, saves, runs on to endYear (fingerprint A); then a fresh process loads the save and runs on to
// endYear (fingerprint B). A and B must match; if not, some state lives outside what snapSave() keeps.
const fs=require('fs'),zlib=require('zlib'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const seed=process.argv[2]||'1',SAVE=+(process.argv[3]||-6000),END=+(process.argv[4]||-5000),MODE=process.argv[5]||'parent',FILE=process.argv[6]||path.join(os.tmpdir(),`snaptest-${seed}-${SAVE}.bin`);
const SRC=path.join(__dirname,'..','src');
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'];
const core=CORE.map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n')+'\n'+require('./snapcore.js');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`
;(function(){
const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(process.env.WORLD==='prov'?provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}):WD);
newHistory(seed);snapMark();
const step=()=>{const g=stepG();while(!g.next().done){}};
const chk=()=>{const h=require('crypto').createHash('md5');for(const A of [S.pop,S.pol,S.eth,S.integ,S.farm])h.update(Buffer.from(A.buffer,A.byteOffset,A.byteLength));
  h.update(String(S.alive.length)+':'+S.pols.length+':'+TECH.length);return h.digest('hex').slice(0,12)};
let t0=Date.now();
if(MODE==='parent'){
  while(S.year<SAVE)step();const tA=Date.now()-t0;const buf=snapSave();fs.writeFileSync(FILE,buf);
  t0=Date.now();while(S.year<END)step();const a=chk(),tB=Date.now()-t0;
  const out=execFileSync(process.execPath,[__filename,seed,String(SAVE),String(END),'child',FILE],{env:process.env,maxBuffer:1<<26}).toString().trim().split('\\n').pop();
  const b=JSON.parse(out);
  console.log(JSON.stringify({seed,save:SAVE,end:END,unbroken:a,resumed:b.chk,match:a===b.chk,saveMB:+(buf.length/1e6).toFixed(1),secToSave:+(tA/1000).toFixed(1),secOn:+(tB/1000).toFixed(1),secResumedOn:b.sec,secLoad:b.load}));
  process.exitCode=a===b.chk?0:1}
else{const y=snapLoad(fs.readFileSync(FILE));const tl=Date.now()-t0;t0=Date.now();while(S.year<END)step();
  console.log(JSON.stringify({chk:chk(),from:y,sec:+((Date.now()-t0)/1000).toFixed(1),load:+(tl/1000).toFixed(1)}))}
})();`);
