'use strict';
// Observes the unmodified model. Wrappers count outcomes without drawing RNG.
const fs=require('fs'),zlib=require('zlib');
const ref=process.argv[4],path=require('path'),repo=path.resolve(__dirname,'..');
if(ref&&!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref))throw Error('Invalid source reference');
function readSource(f,optional=false){
  if(!ref)return fs.readFileSync(__dirname+'/'+f,'utf8');
  const git=process.platform==='win32'?'C:/Program Files/Git/cmd/git.exe':'git';
  const result=require('child_process').spawnSync(git,['-c','safe.directory='+repo.replaceAll('\\','/'),'show',ref+':src/'+f],{cwd:repo,encoding:'utf8',maxBuffer:8000000});
  if(result.status!==0){if(optional)return '';throw Error('Cannot read source '+f+' at '+ref)}return result.stdout;
}
const snapshotPath=process.env.WORLDSIM_MODEL_SNAPSHOT;
if(ref&&snapshotPath)throw Error('Choose a Git reference or a model snapshot, not both');
const core=snapshotPath?fs.readFileSync(path.resolve(repo,snapshotPath),'utf8'):['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js','epidemics.js','connections.js','peoples.js','urbanism.js','civic.js'].map(f=>readSource(f)).concat(readSource('development.js',true),readSource('consolidation.js',true),readSource('map-input.js')).join('\n');
const modelHash=require('crypto').createHash('sha256').update(core).digest('hex');
const bytes=f=>new Uint8Array(zlib.inflateSync(Buffer.from(readSource(f),'base64')));
eval(core+`
const E=decodeEarth(bytes('earth_elev.b64'),bytes('koppen.b64'),bytes('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
newHistory(process.argv[2]||'7');const end=+(process.argv[3]||-2700),started=Date.now(),counts={},regionalPeaks={},firstConsolidation={};
const count=k=>counts[k]=(counts[k]||0)+1;
for(const [label,read,write] of [
 ['frontierReady',()=>frontierReady,f=>frontierReady=f],['holdable',()=>frontierHoldable,f=>frontierHoldable=f],
 ['campaignForce',()=>campaignForce,f=>campaignForce=f],['siege',()=>besiegeCity,f=>besiegeCity=f],
 ['incorporate',()=>incorporateHinterland,f=>incorporateHinterland=f],['union',()=>integrateCivicPolity,f=>integrateCivicPolity=f]
]){const original=read();write(function(...args){const result=original(...args);if(args[0]?.kind==='state'){count(label+'.calls');count(label+(result?'.yes':'.no'))}return result})}
const attack0=territorialAttack;territorialAttack=function(o,i,j,sea){const prior=S.pol[j];if(o.kind==='state')count(prior?'attacks.state':'attacks.frontier');const result=attack0(o,i,j,sea);if(o.kind==='state'&&S.pol[j]===o.id&&prior!==o.id)count(prior?'captures.state':'captures.frontier');return result};
const civil0=civilWar;civilWar=function(o,breakup){if(o.kind==='state'){count('civilWar');count('civilWar.'+(o.cells>=20?'large':'small'))}return civil0(o,breakup)};
const medSet=new Set(WD.medCells);
const born0=newPolity;newPolity=function(...args){const id=born0(...args),o=S.pols[id];count('birth.'+o.kind);if(WD.coast[o.capital]&&medSet.has(o.capital))count('medBirth.'+(o.kind==='horde'?'pastoral':o.origin.type==='migration'?'migrant':'local'));return id};
function regionalAudit(){
 const sets=WD.regions.concat([{k:'china',n:'China',cells:WD.chinaCells}]);
 return sets.map(R=>{let total=0;const owners=new Map();for(const i of R.cells){const p=S.pop[i];total+=p;const id=S.pol[i],o=id?S.pols[id]:null;if(o?.alive&&o.kind==='state')owners.set(id,(owners.get(id)||0)+p)}
  let id=0,ruled=0;for(const [o,n] of owners)if(n>ruled){id=o;ruled=n}const o=S.pols[id],share=ruled/Math.max(1,total),delegated=o?(o.delegatedPop||0)/Math.max(1,o.pop):0;
  const result={region:R.k,population:Math.round(total),share,polity:id,name:o?.full||'',cells:o?.cells||0,health:o?.health||0,bureau:o?.bureau||0,delegatedShare:delegated};
  result.centralized=share>=0.6&&result.cells>=5&&result.health>=0.55&&result.bureau>=0.3&&delegated<=0.5;
  if(result.centralized&&!firstConsolidation[R.k])firstConsolidation[R.k]={year:S.year,...result};
  const peak=regionalPeaks[R.k];if(!peak||share>peak.share)regionalPeaks[R.k]={year:S.year,share,name:result.name,centralized:result.centralized};return result;
 });
}
const snapshot=()=>{const states=S.alive.map(id=>S.pols[id]).filter(o=>o.alive&&o.kind==='state'),mean=k=>states.reduce((n,o)=>n+(o[k]||0),0)/Math.max(1,states.length);
 const biggest=[...states].sort((a,b)=>b.cells-a.cells).slice(0,6).map(o=>({name:o.full,cells:o.cells,pop:Math.round(o.pop),born:o.born,health:o.health,payroll:o.payroll,staff:Math.round(o.staff),bureau:o.bureau,rights:o.rights,occupation:Math.round(o.occupation),collected:Math.round(o.collected),due:Math.round(o.fiscalDue),army:Math.round(o.army),reach:o.h,meanDistance:o.md,cityCount:o.cityCount,why:o.why}));
 let urban=0;for(const i of WD.landIdx)urban+=S.urban[i];
 console.log(JSON.stringify({source:ref||snapshotPath||'working tree',modelHash,seed:S.seed,year:S.year,seconds:Math.round((Date.now()-started)/1000),states:states.length,hordes:S.alive.length-states.length,urban:Math.round(urban),historicMax:S.pols.reduce((n,o)=>o?.kind==='state'?Math.max(n,o.maxCells):n,0),regions:regionalAudit(),regionalPeaks,firstConsolidation,mean:Object.fromEntries(['cells','health','payroll','bureau','rights','occupation','staff','army','collected','fiscalDue','strain','hunger'].map(k=>[k,mean(k)])),counts:{...counts},counters:S.societyCounters,firstTech:S.firstTech.map((x,k)=>x?[TECH[k].k,x.y]:null).filter(Boolean),biggest}));
};
while(S.year<end){step();if(S.year%50===0){
 if(Math.abs(S.accounts.error)>0.1)throw Error('Food ledger '+S.accounts.error+' in '+S.year);
 for(const id of S.alive)for(const k of ['pop','staff','army','bureau','health','payroll','grain'])if(!Number.isFinite(S.pols[id][k])||S.pols[id][k]<0)throw Error('Invalid '+k+' in '+S.year);
 if(S.localStaff)for(const i of WD.landIdx)for(const k of ['localStaff','localGuard','delegationTrust','seasonLevy','militaryLabor','serviceTroops','serviceEstates','hereditaryEstates'])if(!Number.isFinite(S[k][i])||S[k][i]<0)throw Error('Invalid '+k+' in '+S.year);
 regionalAudit();
 }if(S.year%500===0)snapshot()}
if(S.year%500)snapshot();
`);
