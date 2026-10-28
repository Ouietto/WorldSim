const fs=require('fs'),zlib=require('zlib');
const core=fs.readFileSync(__dirname+'/world.js','utf8')+fs.readFileSync(__dirname+'/climate.js','utf8')+fs.readFileSync(__dirname+'/lang.js','utf8')+fs.readFileSync(__dirname+'/hist.js','utf8')+fs.readFileSync(__dirname+'/tech.js','utf8')+fs.readFileSync(__dirname+'/society.js','utf8');
const elev=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/earth_elev.b64','utf8'),'base64'));
const kg=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/koppen.b64','utf8'),'base64'));
const climate=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/earth_climate.b64','utf8'),'base64'));
const mode=process.argv[2]||'earth',hs=process.argv[3]||'1',END=+(process.argv[4]||1800);
eval(core+`
let t0=Date.now();
const E=decodeEarth(new Uint8Array(elev),new Uint8Array(kg),new Uint8Array(climate));
WD=mode==='earth'?genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true}):genWorld({seed:mode,landFrac:P.landFrac});
console.log('world ms',Date.now()-t0,'land',WD.landIdx.length,'links',WD.lt.length,'grade',WD.grade&&WD.grade.score.toFixed(3),WD.grade&&WD.grade.per.map((p,g)=>KG_GROUPS[g]+':'+(p.tot?(p.ok/p.tot).toFixed(2):'-')).join(' '),'fitChanged',WD.fitChanged);
t0=Date.now();newHistory(hs);console.log('init ms',Date.now()-t0,'eths',S.eths.length);
t0=Date.now();let tl=Date.now();
while(S.year<END){step(); if(S.year%1000===0){const st=S.stats[S.stats.length-1];{const al=S.alive.map(k=>S.pols[k]).filter(o=>o.kind==="state");let gf=0,fc=0;for(const i of WD.landIdx)if(S.farm[i]>0.5){fc++;if(S.grain[i]>0.5)gf++}console.log("  dbg grain",(gf/Math.max(1,fc)).toFixed(2),"meanCells",(al.reduce((a,o)=>a+o.cells,0)/Math.max(1,al.length)).toFixed(1),"maxCells",Math.max(0,...al.map(o=>o.cells)),"integ",(al.reduce((a,o)=>a+(o.integ||0),0)/Math.max(1,al.length)).toFixed(2),"mand",(al.reduce((a,o)=>a+(o.mandate||0),0)/Math.max(1,al.length)).toFixed(2),"taxR",(al.reduce((a,o)=>a+(o.tax||0),0)/Math.max(1,al.reduce((a,o)=>a+o.pop,0))).toFixed(2))}console.log(S.year,"pop",(st.pop/1e6).toFixed(1)+'M','states',st.np,'hordes',st.nh,'migs',S.migs.length,'active',S.activeMigs.length,'big',st.big,st.bc,'peoples',st.pe,'era',ERAS[st.lead],'rels',S.rels.filter(r=>r.alive).length,'wars',S.activeWars.length,'ms/yr',((Date.now()-tl)/1000).toFixed(2));tl=Date.now()}}
console.log('total s',(Date.now()-t0)/1000);
const ty={};for(const c of S.chron)ty[c.t]=(ty[c.t]||0)+1;console.log(ty,'chron',S.chron.length,'figs',S.figs.length,'cities',S.cities.length,'wars',S.wars.length);
console.log('first tech', S.firstTech.map((f,k)=>TECH[k].k+':'+(f?f.y:'-')).join(' '));
if(WD.isEarth){console.log('regions',JSON.stringify(S.regionFirst));console.log('med best',S.medBest.share.toFixed(2),S.medBest.y,S.medBest.name);
 console.log('china', S.chinaHist.filter((h,k)=>k%20===0).map(h=>h[0]+':'+h[1].toFixed(2)).join(' '));}
const top=S.figs.map(f=>[figScore(f),f]).sort((a,b)=>b[0]-a[0]).slice(0,8);for(const [sc,f] of top)console.log('FIG',sc.toFixed(0),f.kind,f.name,'|',f.title,'|',f.deeds.slice(0,3).map(d=>fy(d[0])+' '+d[1]).join('; '));
for(const R of S.rels.filter(r=>r.peak>20).slice(0,8))console.log('REL',R.name,R.kind,'peak',R.peak,'states',R.states.length,fy(R.born));
console.log("stateNow",JSON.stringify(S.stateNow));{const m={};for(const i of WD.landIdx){const la=WD.lat[i]*180/Math.PI,lo=(WD.cxA[i]+0.5)/W*360-180;if(la<-5||la>4||lo<15||lo>28||!S.pol[i])continue;const o=S.pols[S.pol[i]];const k=(o.origin&&o.origin.k||JSON.stringify(o.origin||"").slice(0,40))+" "+o.full+" cells="+o.cells+" born="+o.born+" cap="+(WD.lat[o.capital]*180/Math.PI).toFixed(0)+","+((WD.cxA[o.capital]+0.5)/W*360-180).toFixed(0);m[k]=(m[k]||0)+1}console.log(m)}
const fl=process.env.SHOW?S.chron.filter(c=>c.t===process.env.SHOW).slice(0,40):[];for(const c of fl)console.log(fy(c.y),c.t,c.txt,c.why||'');
`);
