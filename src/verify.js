'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert');
const core=['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js','epidemics.js','connections.js','peoples.js','urbanism.js','civic.js','development.js','consolidation.js','map-input.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
const bytes=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/'+f,'utf8'),'base64')));
eval(core+`
const E=decodeEarth(bytes('earth_elev.b64'),bytes('koppen.b64'),bytes('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
const end=+(process.argv[3]||1500),start=Date.now();newHistory(process.argv[2]||'7');
while(S.year<end){step();
  for(const id of S.alive){const o=S.pols[id];for(const k of ['psi','health','bureau','trust','grain'])assert(Number.isFinite(o[k]),k+'='+o[k]+' state '+id+' born '+o.born+' year '+S.year)}
  if(S.year%100===0){
  for(const i of WD.landIdx)for(const k of ['cityWall','cityWallHealth','engineeringKnowledge','engineeringPractice','granaries','civicLabor','militaryEquipment','martialPractice','ruralInfluence','ruralSecurity','siegeProgress','housing','urbanWater','urbanJobs','sanitation','localFoodImports','localStaff','localGuard','localGuardFree','localPayroll','delegationTrust','seasonLevy','levyFree','defenseUsed','defenseLaborDebt','militaryLabor','serviceTroops','serviceFree','serviceEstates','estateAge','hereditaryEstates'])assert(Number.isFinite(S[k][i])&&S[k][i]>=0,'invalid civic '+k+' at '+i+' year '+S.year);
  for(const i of WD.landIdx)for(const k of ['pop','food','young','nutrition','organisation','autonomy','urban','traction','pack','mounts','cityIdentity','eliteStake','eliteLoyalty','orchards','depot','raidDamage','wallHealth','wallBreach','migrationPressure','maleShare','workshops','terraces','waterworks','firearms','sickness','rangeStock','cityDamage','urbanViability','urbanNetwork','foodImports'])assert(Number.isFinite(S[k][i])&&S[k][i]>=0,k+'='+S[k][i]+' at '+i+' in '+S.year+' owner='+S.pol[i]);
  for(const d of S.pathogens)for(const i of WD.landIdx)assert(d.recovered[i]+d.exposed[i]+d.infectious[i]<1.0001,'disease compartments year '+S.year+' at '+i);
  for(const e of S.expeditions)if(!e.done)assert(Number.isFinite(e.pop)&&e.pop>=0&&e.food>=0,'invalid expedition');
  for(const l of S.creditLoans)assert(Number.isFinite(l.principal)&&l.principal>=0,'invalid civic debt');
  for(const f of S.animals)for(const i of WD.landIdx)assert(Number.isFinite(f[i])&&f[i]>=-1e-7,'invalid animal stock');
  if(S.animalAccounts)assert(Math.abs(S.animalAccounts.error)<0.01,'animal imbalance');
  for(const id of S.activeMigs){const M=S.migs[id];assert(Number.isFinite(M.pop)&&M.pop>=0&&M.food>=0,'invalid migration');assert(Math.abs(M.groups.reduce((n,g)=>n+g.pop,0)-M.pop)<Math.max(0.01,M.pop*1e-6),'migration cohort imbalance')}
  assert(Math.abs(S.accounts.error)<0.1,'food imbalance '+S.accounts.error+' year '+S.year);
  for(const id of S.alive){const o=S.pols[id];for(const k of ['grain','staff','army','health','central','bureau','strain','payroll','hunger','trust','burden','navy','preparedness','crisisMemory','raidSkill','conquestLoad','responseDays'])assert(Number.isFinite(o[k])&&o[k]>=0,k+' state '+id+' year '+S.year);for(const k of ['health','central','bureau','strain','payroll'])assert(o[k]<=1,k+'='+o[k]+' state '+id+' year '+S.year)}
  if(S.year%1000===0)console.log(JSON.stringify({year:S.year,pop:Math.round(S.stats.at(-1).pop),states:S.alive.length,migrating:S.activeMigs.length,...societyMetrics()}));
}}
console.log(JSON.stringify({seed:S.seed,year:S.year,seconds:Math.round((Date.now()-start)/1000),pop:Math.round(S.stats.at(-1).pop),states:S.alive.length,first:S.regionFirst,tech:S.firstTech.map((x,i)=>x?[TECH[i].k,x.y]:null).filter(Boolean),...societyMetrics()}));
`);
