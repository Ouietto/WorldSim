// per-seed values of chosen keys for the variants of a request, read from the cache (run inside a worktree)
// node pairs.js <worktree> key1,key2,...
const path=require('path'),fs=require('fs'),crypto=require('crypto');const WT=process.argv[2],KEYS=process.argv[3].split(',');
const REQ=JSON.parse(fs.readFileSync(path.join(WT,'tools/ensemble-request.json')));
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js','earth_elev.b64','koppen.b64','earth_climate.b64','earth_pid.b64','earth_fp.b64','earth_lake.b64'];
const envOf=s=>{const e={};for(const kv of s.split(/\s+/).filter(Boolean)){const [k,...v]=kv.split('=');e[k]=v.join('=')}return e};
const src=fs.readFileSync(path.join(WT,'tools/ensemble.js'),'utf8');const m=src.match(/function srcHash\(dir,env\)\{.*?\n/);
eval(m[0].replace('__dirname',JSON.stringify(path.join(WT,'tools'))));
const seeds=Array.from({length:24},(_,i)=>i+1);
const B=y=>y==null?'-':y<=0?(1-y)+'BCE':y;
for(const v of REQ.variants){const env=envOf(v.env),h=srcHash(path.join(WT,'src'),Object.assign({},envOf(REQ.baseEnv||''),env));
  const rows=seeds.map(s=>{const f=path.join(WT,'reports/cache',`${h}-${s}-${REQ.end}.json`);if(!fs.existsSync(f))return null;return JSON.parse(fs.readFileSync(f))});
  for(const k of KEYS)console.log(v.name.padEnd(28),k.padEnd(10),rows.map(r=>r?(r[k]==null?'nv':typeof r[k]==='number'?Math.round(r[k]):r[k]):'?').join(' '))}
