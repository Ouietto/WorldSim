const fs=require('fs'),path=require('path'),crypto=require('crypto');const ROOT=process.argv[2];
const src=fs.readFileSync(path.join(ROOT,'tools/ensemble.js'),'utf8');const CORE=eval(src.match(/const CORE=(\[[^\]]*\])/)[1]);
const req=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/ensemble-request.json'),'utf8'));
// env as ensemble.js builds it: parse KEY=VAL pairs
for(const v of req.variants){const env={};for(const kv of v.env.split(/\s+/)){const [k,...r]=kv.split('=');env[k]=r.join('=')}
 const h=crypto.createHash('sha1');for(const f of CORE){const p=path.join(ROOT,'src',f);if(fs.existsSync(p))h.update(f).update(fs.readFileSync(p))}h.update(fs.readFileSync(path.join(ROOT,'tools/run1.js')));h.update(JSON.stringify(env));
 const hh=h.digest('hex').slice(0,12);let n=0;for(let s=1;s<=24;s++)if(fs.existsSync(path.join(ROOT,'reports/cache',hh+'-'+s+'-1500.json')))n++;console.log(v.name,hh,n)}
