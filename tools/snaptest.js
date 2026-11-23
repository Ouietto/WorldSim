// Checks that a history resumed from a saved start (run1.js SNAP_AT / SNAP_IN) ends exactly where an unbroken one does: the same
// fingerprint and the same measurements. If not, some state lives outside what run1.js saves (S, WD, invented techs, its records).
// node tools/snaptest.js <seed> <saveYear> <endYear>    (honours WORLD, REGION, SW, KV like run1.js)
const {execFileSync}=require('child_process'),path=require('path'),os=require('os'),fs=require('fs');
const seed=process.argv[2]||'1',SAVE=process.argv[3]||'-7000',END=process.argv[4]||'-6500';
const RUN=path.join(__dirname,'run1.js'),FILE=path.join(os.tmpdir(),`snaptest-${process.pid}-${seed}-${SAVE}.bin`);
const run=extra=>{const t0=Date.now(),o=execFileSync(process.execPath,[RUN,seed,END],{env:{...process.env,...extra},maxBuffer:1<<28}).toString().trim().split('\n').pop();
  return {o:JSON.parse(o),sec:(Date.now()-t0)/1000}};
// timings and the resume marker differ by design; everything else must be equal
const strip=o=>{const c=JSON.parse(JSON.stringify(o));delete c.time;delete c.sec;delete c.from;delete c.secs;delete c.tInit;return JSON.stringify(c)};
const A=run({});
const S1=run({SNAP_AT:SAVE,SNAP_OUT:FILE});
const B=run({SNAP_IN:FILE});
const same=strip(A.o)===strip(B.o);
let diff=[];if(!same){const a=JSON.parse(strip(A.o)),b=JSON.parse(strip(B.o));for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[k])!==JSON.stringify(b[k]))diff.push(k)}
console.log(JSON.stringify({seed,save:+SAVE,end:+END,unbroken:A.o.chk,resumed:B.o.chk,match:same,differing:diff.slice(0,12),saveMB:+(fs.statSync(FILE).size/1e6).toFixed(1),secUnbroken:A.sec,secToSave:S1.sec,secResumed:B.sec}));
fs.unlinkSync(FILE);process.exitCode=same?0:1;
