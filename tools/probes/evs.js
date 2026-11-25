const path=require('path'),fs=require('fs'),crypto=require('crypto');const WT=process.argv[2],KEYS=process.argv[3].split(',');
const REQ=JSON.parse(fs.readFileSync(path.join(WT,'tools/ensemble-request.json')));
const CORE=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js','earth_elev.b64','koppen.b64','earth_climate.b64','earth_pid.b64','earth_fp.b64','earth_lake.b64'];
const envOf=s=>{const e={};for(const kv of s.split(/\s+/).filter(Boolean)){const i=kv.indexOf('=');e[kv.slice(0,i)]=kv.slice(i+1)}return e};
const src=fs.readFileSync(path.join(WT,'tools/ensemble.js'),'utf8');const m=src.match(/function srcHash\(dir,env\)\{.*?\n/);eval(m[0].replace('__dirname',JSON.stringify(path.join(WT,'tools'))));
const med=a=>{const s=a.filter(x=>x!=null).sort((x,y)=>x-y);return s.length?s[s.length>>1]:null};
for(const v of REQ.variants){const h=srcHash(path.join(WT,'src'),Object.assign({},envOf(REQ.baseEnv||''),envOf(v.env)));const rows=[];
  for(let sd=1;sd<=24;sd++){const f=path.join(WT,'reports/cache',`${h}-${sd}-${REQ.end}.json`);if(fs.existsSync(f))rows.push(JSON.parse(fs.readFileSync(f)))}
  console.log(v.name.padEnd(14),KEYS.map(k=>{const vals=rows.map(r=>k.split('.').reduce((o,p)=>o==null?null:o[p],r));return k+' med '+med(vals)+' any '+vals.filter(x=>x>0).length}).join(' | '))}
