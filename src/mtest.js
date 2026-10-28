const fs=require('fs'),zlib=require('zlib');
const core=['world.js','climate.js','lang.js','hist.js','tech.js','society.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('');
const B=f=>zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/'+f,'utf8'),'base64'));
const hs=process.argv[2]||'1',END=+(process.argv[3]||1500),pull=process.argv[4];
eval(core+`
const E=decodeEarth(new Uint8Array(B('earth_elev.b64')),new Uint8Array(B('koppen.b64')),new Uint8Array(B('earth_climate.b64')));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});if(pull!=null)P.pull=+pull;
newHistory(hs);const t0=Date.now();
while(S.year<END){step()}
console.log('seed',hs,'pull',pullNow(),'s',(Date.now()-t0)/1000|0,'pop',(S.stats[S.stats.length-1].pop/1e6|0)+'M','div',divergence().toFixed(3));
console.log('first',['writing','iron','paper','watermill','windmill','gun'].map(k=>k+':'+(S.firstTech[TI[k]]?S.firstTech[TI[k]].y:'-')).join(' '));
console.log('gen',TECH.length-TECH_BASE,'ages',S.ages.length);
for(const m of S.matrixLog.slice(0,14)){const T=TECH[m.k];console.log(' ',m.y,T.n,'('+T.generic+')',TROWS[T.row][0],TCOLS[T.col][0],'t'+T.tier,S.pols[m.pol].full)}
{const al=S.alive.map(k=>S.pols[k]);const cs=al.filter(o=>o.tier==='City-state');const big=al.filter(o=>o.kind==='state'&&o.cells>=40);
console.log('cityStates',cs.length,'leagues',(S.leagues||[]).length,'liveLeagues',(S.leagues||[]).filter(L=>!L.end).length,'daughters',S.pols.filter(o=>o&&o.origin&&o.origin.type==='colony').length,'colonies',S.colonies.length,'reforms',S.reforms.length+'/'+S.reforms.filter(x=>x.ok).length,'bigNob',big.map(o=>o.nob.toFixed(2)).join(' '),'pockets',S.migs.reduce((a,M)=>a+(M.pockets?M.pockets.length:0),0));
for(const L of (S.leagues||[]).slice(0,5))console.log(' LEAGUE',L.born,L.name,L.members.length,L.end||'');
for(const o of S.pols.filter(o=>o&&o.origin&&o.origin.type==='colony').slice(0,6))console.log(' COLONY',o.born,o.full,'from',S.pols[o.origin.from].full,o.alive?'alive':'fell '+o.died);}
for(const a of S.ages.slice(0,8))console.log(' AGE',a.y,AGE_NAMES[a.col],S.pols[a.pol].full);
`);
