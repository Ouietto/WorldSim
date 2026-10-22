/* Delegated government, finite campaign mobilization and service settlements.
   These are experimental mechanisms, not compulsory historical milestones. */
function initConsolidation(){
  const s=S;
  s.delegationOwner=new Int32Array(N);s.delegationOrigin=new Int32Array(N);
  for(const k of ['localStaff','localGuard','localGuardFree','localPayroll','delegationTrust','seasonLevy','levyFree','defenseUsed','defenseLaborDebt','militaryLabor','serviceTroops','serviceFree','serviceEstates','estateAge','hereditaryEstates'])s[k]=new Float64Array(N);
  s.militarySettlements=[];
  Object.assign(s.societyCounters,{delegatedConquests:0,delegatedIntegrations:0,delegationExits:0,campaignPlans:0,seasonalMusters:0,levyCasualties:0,serviceSettlements:0,serviceSettlers:0,customaryAgreements:0,localTownFoundations:0});
}
function initConsolidationPolity(o,from){
  o.campaign=null;o.campaignAllocatedYear=-100000;o.campaignLevyShare=0;o.fieldLevies=[];
  o.levyCohorts=[];o.mustered=0;o.lastMusterYear=-100000;o.delegatedCells=0;o.delegatedPop=0;o.localOfficials=0;
  o.localFiscalDue=0;o.localPaid=0;o.customaryRights=from?from.customaryRights||0.35:0.35;
  o.customaryContinuity=from?from.customaryContinuity||0.15:0.15;o.lastServiceSettlement=-100000;
}
function customaryInstitutions(o){
  const security=clamp(o.health*o.payroll-o.hunger,0,1),bargains=o.civicBargains||[];
  const broken=bargains.filter(b=>b.failures>5).length/Math.max(1,bargains.length);
  const target=clamp(0.23+0.19*security+0.14*o.trust+0.08*o.coalition-0.2*broken-0.08*o.shock,0.12,0.62);
  o.customaryRights=clamp(o.customaryRights+0.015*(target-o.customaryRights),0.08,0.65);
  o.customaryContinuity=clamp(o.customaryContinuity+0.006*(0.12+0.28*security*o.trust*o.coalition-o.customaryContinuity),0.05,0.4);
}
function delegationPossible(o,i,j){
  const s=S,d=s.pol[j]?s.pols[s.pol[j]]:null;if(o.kind!=='state'||!d||d===o||d.kind!=='state'||o.health<0.45||o.payroll<0.5)return false;
  if(s.organisation[j]<0.25||s.farm[j]*farmSuit(j)<0.08&&s.urban[j]<500)return false;
  const mobile=pastoralMobility(j);if((frontierRisk(j)>0.3||WD.rangeExposure[j]>0.45&&mobile>0.3)&&frontierProtection(i,o)<0.25+mobile*0.22)return false;
  const liaison=6+(o.delegatedCells||0)*4+s.pop[j]*0.00012;
  return o.staff>=o.pop*0.00035+liaison&&publicAvailable(o,i)>=Math.max(30,s.pop[j]*0.008)&&transportAccess(i,o)>0.2&&routeCost(i,j,o,false)<Math.max(5,o.h*2);
}
function establishDelegation(o,i,j,previous){
  const s=S,d=s.pols[previous];if(!delegationPossible(o,i,j))return false;
  const cost=Math.max(30,s.pop[j]*0.008),paid=budgetAt(o,i,cost);if(paid<cost*0.99){s.food[i]+=paid;return false}
  s.food[j]+=paid*0.75;
  const share=clamp(s.pop[j]/Math.max(1,d.pop),0,1),officials=d.staff*share*0.8,guard=Math.max(0,d.army-(d.loanedTroops||0))*share*0.3;
  d.staff-=officials;d.army-=guard;d.armyFree=Math.min(d.armyFree,Math.max(0,d.army-(d.loanedTroops||0))*0.55);d.defFree=Math.min(d.defFree,Math.max(0,d.army-(d.loanedTroops||0))*0.45);s.localStaff[j]+=officials;s.localGuard[j]+=guard;
  s.delegationOwner[j]=o.id;s.delegationOrigin[j]=previous;s.delegationTrust[j]=0.58;s.localPayroll[j]=Math.max(0.5,d.payroll);
  s.autonomy[j]=Math.max(0.75,s.autonomy[j]);s.eliteLoyalty[j]=Math.max(0.5,s.eliteLoyalty[j]);
  o.delegatedCells++;o.delegatedPop+=s.pop[j];o.localOfficials+=s.localStaff[j];o.nobles=clamp(o.nobles+0.008,0.1,0.95);
  o.civicBargains=o.civicBargains||[];o.civicBargains.push({cell:j,rights:Math.max(0.3,o.rights),since:s.year,failures:0,delegated:true});
  s.societyCounters.delegatedConquests++;
  chron('diplomacy',`Local authorities in ${s.city[j]>=0?s.cities[s.city[j]].name:d.base} accept the ${o.full}, retaining officials, land rights and substantial autonomy.`,j,[R_(o),R_(d)],'Local administration survives the victory. The new ruler must fund protection and honor the bargain before attempting direct government.');return true;
}
function localTaxAccess(i,o){
  const central=transportAccess(i,o);return S.delegationOwner[i]===o.id?Math.max(central,(0.35+0.5*S.organisation[i])*S.localPayroll[i]*(0.4+0.6*S.delegationTrust[i])):central;
}
function localGovernmentPayroll(accounts){
  const s=S;for(const id of s.alive){s.pols[id].localFiscalDue=0;s.pols[id].localPaid=0}
  for(const i of WD.landIdx){const id=s.pol[i],o=id?s.pols[id]:null;if(!o||s.delegationOwner[i]!==id)continue;
    const adult=Math.max(0,s.pop[i]-s.young[i]);s.localStaff[i]=Math.min(s.localStaff[i],adult*0.1);s.localGuard[i]=Math.min(s.localGuard[i],adult*s.maleShare[i]*0.25);
    const due=s.localStaff[i]*1.2+s.localGuard[i]*0.6+s.pop[i]*0.0004,paid=budgetAt(o,i,due);s.food[i]+=paid;
    s.localPayroll[i]=due>0?clamp(paid/due,0,1):1;o.localFiscalDue+=due;o.localPaid+=paid;
    s.localGuardFree[i]=s.localGuard[i]*s.localPayroll[i]*0.7;
    const target=s.pop[i]*(0.0006+0.0016*recordSkill(i)),training=Math.max(0,target-s.localStaff[i])*0.02*s.localPayroll[i];
    const trained=budgetAt(o,i,training*2)/2;s.localStaff[i]=Math.max(0,s.localStaff[i]+trained-s.localStaff[i]*(0.012+0.025*(1-s.localPayroll[i])));
    s.food[i]+=trained;accounts.consumed+=trained;s.localGuard[i]*=1-0.015-0.035*(1-s.localPayroll[i]);
  }
}
function delegationCensus(o){
  o.delegatedCells=0;o.delegatedPop=0;o.localOfficials=0;
  for(const i of S.realmCells.get(o.id)||[])if(S.pol[i]===o.id&&S.delegationOwner[i]===o.id){o.delegatedCells++;o.delegatedPop+=S.pop[i];o.localOfficials+=S.localStaff[i]}
}
function delegationYear(){
  const s=S;
  for(const i of WD.landIdx){const owner=s.pol[i],o=owner?s.pols[owner]:null;
    if(!s.delegationOwner[i])continue;
    if(!o||!o.alive){s.localStaff[i]=s.localGuard[i]=s.localGuardFree[i]=0;s.delegationOwner[i]=0;continue}
    if(s.delegationOwner[i]!==owner){s.delegationOwner[i]=owner;s.delegationTrust[i]*=0.6}
    const bargain=(o.civicBargains||[]).find(b=>b.cell===i&&b.delegated),kept=!bargain||o.rights>=bargain.rights-0.1;
    const target=clamp(0.12+0.4*s.localPayroll[i]+0.25*o.health+0.15*(kept?1:0)-0.35*s.unrest[i]-0.2*o.hunger,0,1);
    s.delegationTrust[i]=clamp(s.delegationTrust[i]+0.025*(target-s.delegationTrust[i]),0,1);
    s.autonomy[i]=Math.max(s.autonomy[i],0.65);s.eliteLoyalty[i]=Math.min(s.eliteLoyalty[i],0.3+0.7*s.delegationTrust[i]);
    if(s.year-s.taken[i]>40&&s.delegationTrust[i]>0.7&&o.bureau>0.35&&o.health>0.7&&o.payroll>0.85&&o.staff>o.pop*0.002+o.cells*15&&publicAvailable(o,i)>s.pop[i]*0.04){
      const due=s.pop[i]*0.025,paid=civicSpend(i,o,due);if(paid>=due*0.95){o.staff+=s.localStaff[i];o.army+=s.localGuard[i];s.localStaff[i]=s.localGuard[i]=s.localGuardFree[i]=0;s.delegationOwner[i]=0;s.autonomy[i]=Math.max(0.45,s.autonomy[i]-0.15);s.societyCounters.delegatedIntegrations++;}
    }
    if(i!==o.capital&&s.delegationTrust[i]<0.22&&s.localPayroll[i]<0.4&&s.year-s.taken[i]>10&&s.year-(o.lastDefection||-100000)>8&&s.r()<0.05){
      const child=s.pols[newPolity(i,o,{origin:{type:'rebellion',from:o.id,why:'Provincial authorities reject failed protection and broken obligations.'}})];partitionInstitutions(o,[child]);child.staff+=s.localStaff[i];child.army+=s.localGuard[i];s.localStaff[i]=s.localGuard[i]=s.localGuardFree[i]=0;s.delegationOwner[i]=0;o.lastDefection=s.year;s.societyCounters.delegationExits++;
      chron('fall',`Local authorities withdraw from the ${o.full} after their governing bargain fails.`,i,[R_(o),R_(child)]);
    }
  }
  for(const id of s.alive)delegationCensus(s.pols[id]);
}
function planCampaign(o){
  const s=S,w=WD;if(o.kind!=='state')return;
  const old=o.campaign;
  if(old){const target=s.pol[old.to],enemy=target?s.pols[target]:null;
    if(s.year-old.start>5||s.pol[old.from]!==o.id||target===o.id||enemy&&(!enemy.alive||!o.enemies.has(enemy.id))||o.health<0.35)o.campaign=null;
    else return;
  }
  if(o.health<0.5||o.payroll<0.65||s.r()>0.16*P.warRate*o.aggrM)return;
  let best=null,score=0;
  for(const i of s.realmCells.get(o.id)||[]){if(s.pol[i]!==o.id||transportAccess(i,o)<0.2||publicAvailable(o,i)<50)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.pol[j]===o.id)continue;const q=s.pol[j],enemy=q?s.pols[q]:null;
      if(enemy&&(!o.enemies.has(q)||enemy.over===o.id||o.over===q))continue;
      if(!q&&!frontierReady(o,i,j)||q&&!frontierHoldable(o,i,j)&&!delegationPossible(o,i,j))continue;
      const value=(enemy?1.5:0.4+o.press*0.3)*transportAccess(i,o)/(1+borderBarrier(i,j)+dd(i)*0.15)*(0.7+s.r()*0.3);
      if(value>score){score=value;best={from:i,to:j,pol:q,start:s.year,lastAttempt:-100000,sea:false}}
    }
  }
  if(best){o.campaign=best;s.societyCounters.campaignPlans++}
}
function musterSeasonal(o){
  const s=S;if(o.lastMusterYear===s.year)return;o.lastMusterYear=s.year;o.levyCohorts=[];o.mustered=0;if(o.kind!=='state'||!o.campaign||o.health<0.4||o.payroll<0.6)return;
  for(const i of s.realmCells.get(o.id)||[]){if(s.pol[i]!==o.id||s.nutrition[i]<0.9||s.unrest[i]>0.5)continue;
    if(routeCost(i,o.campaign.from,o,false)>Math.max(5,o.h*1.5)&&i!==o.campaign.from)continue;
    const p=s.pop[i],adult=Math.max(0,p-s.young[i])*s.maleShare[i],standing=(o.army+o.staff)*p/Math.max(1,o.pop)+s.localStaff[i]+s.localGuard[i]+s.serviceTroops[i];
    const compliance=clamp((0.35+0.65*s.integ[i])*(0.4+0.6*o.trust)*(0.4+0.6*s.eliteLoyalty[i])*(1-0.6*s.unrest[i]),0,1);
    const desired=Math.min(Math.max(0,adult-standing)*0.16,p*0.04*compliance),paid=budgetAt(o,i,Math.min(desired*0.22,publicAvailable(o,i)*0.3)),n=paid/0.22;
    if(n<10){s.food[i]+=paid;continue}s.food[i]+=paid;s.seasonLevy[i]=n;s.levyFree[i]=n*0.65;s.militaryLabor[i]+=n*0.25/Math.max(1,p);o.levyCohorts.push(i);o.mustered+=n;s.societyCounters.seasonalMusters+=n;
  }
}
function allocateCampaign(o,i,sea){
  const s=S;if(o.campaignAllocatedYear===s.year)return 0;
  const levy=(o.levyCohorts||[]).reduce((n,c)=>n+(s.pol[c]===o.id?s.levyFree[c]:0),0),native=Math.max(0,o.armyFree||0),foreign=Math.max(0,o.foreignFree||0);
  const total=Math.min(native+levy+foreign,sea?(o.navyFree||0)*80:Infinity),unit=0.12+dd(i)*0.025+(sea?0.22:0);
  const n=Math.min(total,publicAvailable(o,i)/Math.max(0.01,unit));if(n<100)return 0;
  const regular=Math.min(native,n);o.armyFree-=regular;let left=n-regular,seasonal=0;o.fieldLevies=[];
  for(const c of o.levyCohorts||[]){if(s.pol[c]!==o.id)continue;const take=Math.min(left,s.levyFree[c]);if(take<=0)continue;s.levyFree[c]-=take;left-=take;seasonal+=take;o.fieldLevies.push({cell:c,people:take})}
  const auxiliaries=drawForeignTroops(o,i,left),allocated=regular+seasonal+auxiliaries;
  budgetAt(o,i,allocated*unit);o.campaignAuxShare=auxiliaries/Math.max(1,allocated);o.campaignLevyShare=seasonal/Math.max(1,allocated);o.campaignAllocatedYear=s.year;o.campaigns++;
  if(sea)o.navyFree=Math.max(0,o.navyFree-allocated/80);s.martialPractice[i]+=allocated/Math.max(500,s.pop[i])*2;
  return allocated*transportAccess(i,o);
}
function campaignCasualties(o,i,n){
  const s=S,levy=n*(o.campaignLevyShare||0),aux=n*(o.campaignAuxShare||0);if(aux>0)foreignCasualties(o,aux);
  const total=(o.fieldLevies||[]).reduce((v,c)=>v+c.people,0);for(const c of o.fieldLevies||[]){const dead=killResidentMen(c.cell,Math.min(c.people,levy*c.people/Math.max(1,total)));
    c.people-=dead;s.seasonLevy[c.cell]=Math.max(0,s.seasonLevy[c.cell]-dead);s.societyCounters.levyCasualties+=dead}
  armyLoss(o,i,Math.max(0,n-levy-aux));
}
function killResidentMen(i,n){
  const s=S,adult=Math.max(0,s.pop[i]-s.young[i]),men=adult*s.maleShare[i],dead=Math.min(n,men);s.pop[i]-=dead;s.maleShare[i]=clamp((men-dead)/Math.max(1,adult-dead),0,1);s.urban[i]=Math.min(s.urban[i],s.pop[i]);return dead;
}
function defenseCasualties(o,j,n){
  if(o.kind!=='state'){armyLoss(o,j,n);return}
  const d=o.defenseCommitted;if(!d||d.cell!==j){armyLoss(o,j,n);return}
  const total=d.local+d.regular,regular=n*d.regular/Math.max(1,total),local=n-regular;armyLoss(o,j,regular);
  const dead=killResidentMen(j,local),guards=Math.min(S.localGuard[j]+S.serviceTroops[j],dead*0.3),share=S.localGuard[j]/Math.max(1,S.localGuard[j]+S.serviceTroops[j]);
  S.localGuard[j]=Math.max(0,S.localGuard[j]-guards*share);S.serviceTroops[j]=Math.max(0,S.serviceTroops[j]-guards*(1-share));
}
function mobilizedLocalDefense(j,o,commit){
  const s=S,p=s.pop[j],adult=Math.max(0,p-s.young[j])*s.maleShare[j],standing=(o.army||0)*p/Math.max(1,o.pop)+s.localGuard[j]+s.serviceTroops[j];
  const willing=p*(0.006+0.016*s.organisation[j])*(0.4+0.6*o.health)*(0.5+0.5*s.eliteLoyalty[j]);
  const eligible=Math.max(0,Math.min(willing,adult-standing-s.seasonLevy[j])-s.defenseUsed[j]);
  const funds=publicAvailable(o,j)+Math.max(0,s.food[j]-p*0.3)*0.04,n=Math.min(eligible,funds/0.15);
  const local=Math.min(s.localGuardFree[j]+s.serviceFree[j],Math.max(0,adult-s.seasonLevy[j]-s.defenseUsed[j]));
  if(commit){const cost=n*0.15,paid=budgetAt(o,j,cost);s.food[j]=Math.max(0,s.food[j]-(cost-paid));s.defenseUsed[j]+=n+local;const guards=Math.min(local,s.localGuardFree[j]);s.localGuardFree[j]-=guards;s.serviceFree[j]=Math.max(0,s.serviceFree[j]-(local-guards));s.defenseLaborDebt[j]+=n*0.1/Math.max(1,p)}
  return n+local;
}
function advanceCampaigns(){
  for(const id of [...S.alive]){const o=S.pols[id],c=o.campaign;if(!o.alive||o.kind!=='state'||!c||c.lastAttempt===S.year||o.campaignAllocatedYear===S.year)continue;
    if(S.pol[c.from]!==o.id||S.pol[c.to]===o.id)continue;const q=S.pol[c.to];if(q&&!o.enemies.has(q))continue;
    c.lastAttempt=S.year;territorialAttack(o,c.from,c.to,c.sea);
  }
}
function offerSettledContingent(o){
  const s=S;if(o.kind!=='state'||!o.campaign||s.year%5||o.health<0.6||s.r()>0.12*o.trust)return;
  for(const id of s.alive){const p=s.pols[id];if(p===o||p.kind!=='state'||p.health<0.6||p.trust<0.4||p.over!==o.id&&!o.allies.includes(id)||o.enemies.has(id))continue;
    if(p.over!==o.id&&![...o.enemies.keys()].some(e=>p.enemies.has(e)))continue;
    if(angDist(o.campaign.from,p.capital)>0.12)continue;if(createMilitaryContract(o,p,p.army*0.15,5))break;
  }
}
function localFoundationReady(i){
  const s=S;if(s.urban[i]<500||s.organisation[i]<0.35||s.nutrition[i]<0.9||s.farm[i]*farmSuit(i)<0.08)return false;
  const market=s.node[i]>0.2||WD.coast[i]&&s.infrastructure[i]>0.2||WD.rv[i]>0.25;
  return market&&s.pop[i]/WD.area[i]>0.8&&localPop(i)>=FLOOR.chief*3*P.floor/(0.4+0.6*transportSupport(i))&&settledStateHabitat(i);
}
function pastoralFormationReady(i){
  const s=S,past=s.herd[i]*Math.max(WD.sH[i],WD.desert[i]*s.camel[i]*0.6),crops=s.farm[i]*farmSuit(i);
  return past>Math.max(0.3,crops*1.3)&&s.urban[i]<s.pop[i]*0.025&&Math.max(s.mounts[i],s.pack[i])>0.08;
}
function foundServiceSettlement(o,i,j,requested){
  const s=S,own=s.pol[j]===o.id;if(o.kind!=='state'||s.year-o.lastServiceSettlement<15||s.pol[j]&&!own||s.urban[j]>1000||s.nutrition[i]<0.95)return 0;
  if(own){if(o.rights<0.3||s.nutrition[j]<0.85||transportAccess(i,o)<0.25||routeCost(i,j,o,false)>Math.max(5,o.h*1.5)||frontierProtection(i,o)<frontierRisk(j)*0.5)return 0}
  else if(s.pop[j]>1000||!frontierReady(o,i,j))return 0;
  if(!s.pol[j]&&s.pop[j]>100&&s.ruralPatron[j]!==o.id)return 0;
  const veterans=Math.min(o.army*0.12,Math.max(0,o.army-(o.loanedTroops||0))*0.2,requested/4);if(veterans<30)return 0;
  const room=Math.max(0,s.K[j]*0.9-s.pop[j])*(1-s.eliteStake[j]*0.5),clearing=0.25+0.7*s.forest[j]+0.4*WD.rough[j];
  const journey=Math.max(0,Math.hypot(dxWrap(i,j),WD.cyA[j]-WD.cyA[i])-1)*0.02,unit=(s.pop[j]<1?1+clearing:0.35)+journey;
  const desired=Math.min(requested,veterans*4,s.pop[i]*0.2,room,publicAvailable(o,i)/unit);if(desired<120)return 0;
  // The treasury funds actual establishment provisions. In an owned district,
  // household movement must not reset existing jurisdiction or integration.
  const paid=budgetAt(o,i,desired*unit);s.food[i]+=paid;
  const n=foundSettlement(i,j,desired,own?null:o);if(n<120)return 0;if(own)s.societyCounters.sponsoredSettlements++;
  const soldiers=Math.min(veterans,n/4);o.army-=soldiers;const available=Math.max(0,o.army-(o.loanedTroops||0));o.armyFree=Math.min(o.armyFree,available*0.55);o.defFree=Math.min(o.defFree,available*0.45);s.serviceTroops[j]+=soldiers;
  s.serviceEstates[j]=clamp(s.serviceEstates[j]+n/Math.max(1,s.pop[j])*0.3,0,0.5);s.estateAge[j]=0;s.serviceFree[j]=s.serviceTroops[j];o.lastServiceSettlement=s.year;
  s.militarySettlements.push({pol:o.id,from:i,cell:j,people:n,soldiers,since:s.year,grantRights:o.rights,supportYears:3});
  s.societyCounters.serviceSettlements++;s.societyCounters.serviceSettlers+=n;
  chron('migration',`Veterans and their households establish a service settlement for the ${o.full}, receiving land in return for frontier duties.`,j,[R_(o)],'Existing soldiers leave the field army. Households, provisions and herds move from the recruitment base; land and service obligations can become lasting political interests.');return n;
}
function serviceSettlementYear(){
  const s=S;for(const t of s.militarySettlements){const o=s.pols[t.pol];if(!o?.alive||s.pol[t.cell]!==o.id)continue;
    if(s.year-t.since<3&&s.pol[t.from]===o.id){const n=budgetAt(o,t.from,t.people*0.15);if(n>0)s.publicShipments.push({from:o.id,to:o.id,dest:t.cell,food:n,created:s.year,years:1,kind:'settlement support'})}
  }
  for(const i of WD.landIdx){if(s.serviceTroops[i]<=0&&s.serviceEstates[i]<=0)continue;const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(!o||!o.alive){s.serviceTroops[i]*=0.95;s.serviceEstates[i]*=0.995;continue}
    s.estateAge[i]++;s.serviceTroops[i]=Math.min(s.serviceTroops[i]*0.99+s.pop[i]*s.serviceEstates[i]*0.0002,s.pop[i]*0.08);
    const kept=o.rights>=0.25&&s.nutrition[i]>0.8,inheritance=s.estateAge[i]>25?clamp((o.nobles+o.rights)*(1-o.bureau*o.central),0,1):0;
    s.hereditaryEstates[i]=clamp(s.hereditaryEstates[i]+0.008*(inheritance-s.hereditaryEstates[i]),0,1);
    s.eliteStake[i]=clamp(s.eliteStake[i]+s.serviceEstates[i]*0.004,0,1);o.nobles=clamp(o.nobles+s.serviceEstates[i]*s.hereditaryEstates[i]*0.0004,0.1,0.95);
    s.serviceFree[i]=s.serviceTroops[i]*(kept?0.6:0.2)*s.eliteLoyalty[i];s.militaryLabor[i]+=s.serviceTroops[i]*0.12/Math.max(1,s.pop[i]);
  }
  if(s.year%5)return;
  for(const id of [...s.alive]){const o=s.pols[id];if(o.kind!=='state'||o.health<0.65||o.press<0.7||s.year-o.lastServiceSettlement<15||s.r()>0.08)continue;
    for(const i of s.realmCells.get(id)||[]){if(s.pop[i]<8000)continue;let done=false;for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j<0||!WD.land[j]||s.urban[j]>=500)continue;
      let frontier=!s.pol[j];if(s.pol[j]===id)for(let e=0;e<4;e++){const k=WD.nb[j*4+e];if(k>=0&&WD.land[k]&&s.pol[k]!==id)frontier=true}
      if(frontier&&foundServiceSettlement(o,i,j,Math.min(1600,s.pop[i]*0.04))>0){done=true;break}}if(done)break}
  }
}
function consolidationYear(){
  const s=S;s.seasonLevy.fill(0);s.levyFree.fill(0);s.defenseUsed.fill(0);s.militaryLabor.fill(0);s.serviceFree.fill(0);s.localGuardFree.fill(0);
  delegationYear();serviceSettlementYear();
  for(const id of [...s.alive]){const o=s.pols[id];if(!o.alive)continue;customaryInstitutions(o);planCampaign(o);musterSeasonal(o);offerSettledContingent(o)}
}
