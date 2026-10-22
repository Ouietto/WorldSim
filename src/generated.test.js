'use strict';
const fs=require('fs'),assert=require('assert');
const core=['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
eval(core+`
WD=genWorld({seed:'frontier-atlas',landFrac:P.landFrac});newHistory('generated-scenario');S.year=0;S.animalOrigins=[];S.hearths.forEach(h=>h.done=true);
// A synthetic developed-world scenario exercises coasts, drainage, winter
// routes and multiple landmasses without waiting for millennia of invention.
for(const i of WD.landIdx){if(S.pop[i]<100||WD.sF[i]<0.15)continue;
  S.farm[i]=S.herd[i]=1;seedLocalCrops(i);S.cropAdapt[bestCrop(i)][i]=1;S.grain[i]=0.8;S.organisation[i]=0.65;S.infrastructure[i]=0.7;S.metal[i]=S.iron[i]=0.7;S.sail[i]=0.9;S.nav[i]=0.7;
  for(const k of ['records','storage','law','office','post','charter','succession','census','canal'])S.tk[TI[k]][i]=0.8;
  S.animals[0][i]=S.pop[i]*0.12;S.animals[2][i]=S.pop[i]*0.04;S.animals[3][i]=S.pop[i]*0.04;refreshAnimalAccess(i);
}
for(const i of WD.landIdx){if(S.pop[i]<100)continue;
  if(WD.desert[i]&&animalSuitability(4,i)>0.9){S.herd[i]=S.camel[i]=0.9;S.animals[4][i]=S.pop[i]*0.15;S.food[i]+=S.pop[i]*0.5}
  if(S.farm[i]>0.5&&animalSuitability(1,i)>0.85)S.animals[1][i]=S.pop[i]*0.08;
  refreshAnimalAccess(i);
}
computeK();
const capitals=[];
for(const i of WD.landIdx){if(capitals.length>=10)break;if(S.pop[i]<1000||WD.sF[i]<0.3||capitals.some(c=>angDist(c,i)<0.22))continue;capitals.push(i)}
assert(capitals.length>=3,'generated scenario has multiple regional governments');
for(const c of capitals){const id=newPolity(c,null),o=S.pols[id];let pop=0,cells=0;
  ring(c,3,i=>{if(!WD.land[i]||S.pol[i]&&S.pol[i]!==id||S.pop[i]<100)return;S.pol[i]=id;S.integ[i]=0.7;pop+=S.pop[i];cells++});
  o.pop=pop;o.cells=cells;o.grain=pop*0.25;o.army=pop*0.01;o.staff=pop*0.004;o.bureau=0.5;o.central=0.45;o.succession=0.7;
}
routeDistances();buildTradeNetwork();
for(let y=0;y<250;y++){
  step();assert(Math.abs(S.accounts.error)<0.05,'generated food ledger '+S.year+' '+S.accounts.error);
  if(S.animalAccounts)assert(Math.abs(S.animalAccounts.error)<0.01,'generated animal ledger');
  for(const id of S.alive)for(const k of ['grain','health','bureau','preparedness','conquestLoad'])assert(Number.isFinite(S.pols[id][k])&&S.pols[id][k]>=0,'generated state '+k);
  for(const id of S.alive)for(const k of ['health','central','bureau','strain','payroll'])assert(S.pols[id][k]<=1,'generated bounded field '+k+' '+S.pols[id][k]);
  if(y%25===0)for(const i of WD.landIdx){for(const k of ['food','pop','traction','pack','mounts'])assert(Number.isFinite(S[k][i])&&S[k][i]>=0,'generated province '+k);for(const f of S.animals)assert(Number.isFinite(f[i])&&f[i]>=-1e-7,'generated animal stock')}
}
console.log('PASS: 250-year generated-world scenario with developed transport, coasts, river networks and multiple governments; '+S.alive.length+' surviving polities');
`);
