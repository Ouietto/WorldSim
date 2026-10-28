const fs=require('fs'),zlib=require('zlib');
const core=['world.js','climate.js','lang.js','hist.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('');
const elev=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/earth_elev.b64','utf8'),'base64'));
const kg=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/koppen.b64','utf8'),'base64'));
const climate=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/earth_climate.b64','utf8'),'base64'));
const seeds=process.argv[2].split(','),END=+(process.argv[3]||1500);
eval(core+`
const E=decodeEarth(new Uint8Array(elev),new Uint8Array(kg),new Uint8Array(climate));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
if(process.env.ECO!=null)P.eco=+process.env.ECO;
for(const sd of seeds){const t0=Date.now();newHistory(sd);while(S.year<END)step();
 const ch=S.chinaHist.filter(h=>h[0]>=-250),cU=ch.filter(h=>h[1]>0.5).length/Math.max(1,ch.length),cMax=Math.max(...S.chinaHist.map(h=>h[1]));
 const mMax=Math.max(...S.medHist.map(h=>h[1])),ft=k=>S.firstTech[k]?S.firstTech[k].y:'-';
 const rf=k=>S.regionFirst[k]?S.regionFirst[k].y:'-';const al=S.alive.map(k=>S.pols[k]).filter(o=>o.kind==='state');
 console.log(JSON.stringify({sd,s:((Date.now()-t0)/1000)|0,pop:Math.round(S.stats[S.stats.length-1].pop/1e6),states:al.length,maxC:Math.max(...al.map(o=>o.cells)),
  cU:+cU.toFixed(2),cMax:+cMax.toFixed(2),mMax:+mMax.toFixed(2),egypt:rf('egypt'),nchina:rf('nchina'),indus:rf('indus'),wafr:rf('wafrica'),write:ft(6),iron:ft(8),paper:ft(14),
  farm:S.farmCheck&&S.farmCheck.res.map(r=>Math.round(r.share*100)).join('/'),top:S.alive.map(k=>S.pols[k]).filter(o=>o.kind==='state').map(o=>o.cells).sort((a,b)=>b-a).slice(0,5).join(','),ineq:+(S.alive.map(k=>S.pols[k]).filter(o=>o.kind==='state'&&o.cells>=20).reduce((a,o,_,A)=>a+o.ineq/A.length,0)).toFixed(2),routes:S.routes.length,ft:[20,21,22,23,24,25,26,27,28,29,30,31].map(ft).join(' '),bigBCE:(()=>{const at=y=>{const st=S.stats.filter(x=>x.y<=y).pop();return st?st.bc:0};return at(-1000)+'/'+at(0)})(),shapes:(()=>{const sh=(S.shapes||[]).map(id=>S.pols[id].shape).filter(Boolean);const ew=sh.filter(x=>x.ew>x.ns).length,vert=sh.filter(x=>x.ns>1.5*x.ew&&x.ns>2500).length;const rs=sh.map(x=>x.ew/x.ns).sort((a,b)=>a-b);return sh.length+' ew'+Math.round(100*ew/Math.max(1,sh.length))+'% vert'+vert+' med'+(rs.length?rs[rs.length>>1].toFixed(2):'-')})(),stateless:S.stateNow&&S.stateNow.res.map(r=>Math.round(r.share*100)).join('/')}))}
`);
