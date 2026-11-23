// Builds the arrivals table a regional history draws from (arrivePass in src/hist.js), from full-world runs made with
// REGION_REPORT=<region> (each run1.js output then carries out.arr: per item [first year held anywhere, 1 if that was inside the
// region's boxes, first year held inside them, the province]).
//   node tools/arrivals.js [--region neareast] [--write] <run1 output files...>
// An item counts as arriving from outside in a history when it was first held outside the boxes and later reached them. The table
// keeps, per item, the [year, province] of each such history, and the number of histories, so a regional run comes out with each
// arrival as often, as early and at the same edges as the world runs did. --write puts it into src/world.js.
const fs=require('fs'),path=require('path');
const args=process.argv.slice(2);const take=k=>{const i=args.indexOf(k);if(i<0)return null;const v=args[i+1];args.splice(i,2);return v};
const REGION=take('--region')||'neareast',WRITE=args.includes('--write'),BEASTS=args.includes('--beasts');const files=args.filter(a=>a!=='--write'&&a!=='--beasts');
// tamed beasts (b:) are left out unless --beasts: their wild ranges and odd far-flung taming (a peccary reaching the Near East in one
// world history) are not worth bringing in; crops (c:), herds (h:) and techniques (t:) are
const runs=[];for(const f of files){let o=null;try{o=JSON.parse(fs.readFileSync(f,'utf8').trim().split('\n').pop())}catch(e){}if(o&&o.arr)runs.push(o)}
if(!runs.length){console.error('no run1 outputs with arrivals (run the world with REGION_REPORT='+REGION+')');process.exit(1)}
const items={},seen={},inside={};
for(const o of runs)for(const [k,r] of Object.entries(o.arr)){if(k.startsWith('b:')&&!BEASTS)continue;seen[k]=(seen[k]||0)+1;if(r[1])inside[k]=(inside[k]||0)+1;else if(r[2]!=null)(items[k]=items[k]||[]).push([r[2],r[3]])}
const end=Math.min(...runs.map(o=>o.end));
const B=y=>y<=0?(1-y)+' BCE':y+' CE',med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1]};
console.log(`${runs.length} world histories to ${B(end)}. Items first held outside the region and reaching it:\n`);
console.log('| Item | Histories with an arrival | Median year | Earliest | Latest | Began inside (histories) |');console.log('|---|---|---|---|---|---|');
for(const k of Object.keys(items).sort((a,b)=>med(items[a].map(x=>x[0]))-med(items[b].map(x=>x[0])))){const ys=items[k].map(x=>x[0]);
  console.log(`| ${k} | ${ys.length} of ${runs.length} | ${B(med(ys))} | ${B(Math.min(...ys))} | ${B(Math.max(...ys))} | ${inside[k]||0} |`)}
const T={n:runs.length,end,items};
if(WRITE){const p=path.join(__dirname,'..','src','world.js');let s=fs.readFileSync(p,'utf8');const re=new RegExp('^SIMREGIONS\\.'+REGION+'\\.arr=.*;$','m');
  if(!re.test(s)){console.error('no SIMREGIONS.'+REGION+'.arr line in src/world.js');process.exit(1)}
  s=s.replace(re,()=>`SIMREGIONS.${REGION}.arr=${JSON.stringify(T)};`);fs.writeFileSync(p,s);console.log(`\nwritten to src/world.js (${Object.keys(items).length} items)`)}
