/* Regional provisioning, exposed frontiers and choices in conquest. */
function initFrontierPolity(o,from){
  o.momentum=from?(from.momentum||0)*0.5:0;o.inventionProgress=new Float32Array(TECH.length);
  o.warLaw=from?from.warLaw:(S.r()<0.22?'Expulsion permitted':'Negotiated incorporation');
  o.collectiveReprisals=from?from.collectiveReprisals:S.r()<0.08;
  o.lastAccession=-100000;o.lastOpportunism=-100000;o.occupationLosses=0;o.localStores=0;
  o.raidHistory=new Map();o.protectionPacts=[];o.installTarget=0;o.installUntil=-100000;
  o.blockadePressure=0;o.lastMigration=-100000;o.patronage=0;o.coalitionFatigue=0;
  o.loanedTroops=0;o.foreignFree=0;o.campaignAuxShare=0;o.sharedThreat=0;o.threatMemory=new Map();o.knownPorts=new Set();o.creditTrust=0.7;o.creditDefault=-100000;
}
function publicAvailable(o,i){return Math.max(0,S.depot[i])+(i===o.capital?Math.max(0,o.grain):0)}
function budgetAt(o,i,due){
  if(S.pol[i]!==o.id)return 0;let left=Math.max(0,due),paid=Math.min(S.depot[i],left);S.depot[i]-=paid;left-=paid;
  if(i===o.capital){const n=budgetPay(o,left);paid+=n}return paid;
}
function depositPublic(o,i,n){if(i===o.capital)o.grain+=n;else S.depot[i]+=n}
function governmentFood(){let n=0;for(const i of WD.landIdx)n+=S.depot[i];for(const t of S.publicShipments)n+=t.food;return n}
function regionalFreight(accounts){
  const s=S,w=WD;
  for(const i of w.landIdx)if(s.depot[i]>0){const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(!o||!o.alive){s.food[i]+=s.depot[i];s.depot[i]=0}
    else if(i===o.capital){o.grain+=s.depot[i];s.depot[i]=0}
  }
  for(const t of s.publicShipments){if(t.created>=s.year)continue;t.years--;
    if(t.years<=0){const o=s.pols[t.to],loss=t.food*0.08;
      if(o&&o.alive&&s.pol[t.dest]===o.id){depositPublic(o,t.dest,t.food-loss);
        const from=s.pols[t.from];if(o.kind==='horde'&&from&&from.kind==='state')o.patronage=clamp(o.patronage+(t.food-loss)/Math.max(1,o.pop*0.03),0,1);
      }else s.food[t.dest]+=t.food-loss;
      accounts.transportLoss+=loss;t.food=0;
    }
  }
  s.publicShipments=s.publicShipments.filter(t=>t.food>0);
  for(const e of s.tradeEdges){e.freightUsed=0;e.privateUsed=0}
  // Four staged consignments per year. Each stage uses pre-transfer stocks;
  // public and private freight compete for the same edge's annual capacity.
  for(let season=0;season<4;season++){
    const available=new Float64Array(N),delta=new Float64Array(N);
    for(const i of w.landIdx){const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o)available[i]=publicAvailable(o,i)}
    for(const e of s.tradeEdges){
      const id=s.pol[e.a];if(!id||s.pol[e.b]!==id)continue;const o=s.pols[id];
      if(e.via&&e.via.some(i=>s.pol[i]!==id))continue;
      const target=i=>i===o.capital?Math.max(s.pop[i]*0.06,o.pop*0.025):s.pop[i]*0.045;
      const ta=Math.max(1,target(e.a)),tb=Math.max(1,target(e.b));
      const a=available[e.a]/ta>available[e.b]/tb?e.a:e.b,b=a===e.a?e.b:e.a;
      const excess=Math.max(0,available[a]-target(a)),need=Math.max(0,target(b)-available[b]);
      const cap=Math.max(0,e.capacity*0.45-(e.freightUsed||0));
      const cost=a===e.a?e.cost:(e.reverseCost==null?e.cost:e.reverseCost),loss=clamp(cost+0.03*(1-o.payroll),0.01,0.75);
      const n=Math.min(excess,need/(1-loss),cap*0.5);if(n<=0)continue;
      available[a]-=n;delta[a]-=n;delta[b]+=n*(1-loss);e.freightUsed+=n;
      accounts.transportLoss+=n*loss;s.societyCounters.freight+=n;
    }
    for(const i of w.landIdx)if(delta[i]){const o=s.pols[s.pol[i]];if(delta[i]<0)budgetAt(o,i,-delta[i]);else depositPublic(o,i,delta[i])}
  }
}
function tributeShipment(o,over,amount){
  const paid=budgetPay(o,amount);if(paid<=0)return 0;
  S.publicShipments.push({to:over.id,from:o.id,dest:over.capital,food:paid,created:S.year,years:Math.max(1,Math.ceil(angDist(o.capital,over.capital)/0.15))});return paid;
}
function gunEffect(i){return S.gun[i]*clamp(S.firearms[i]/Math.max(20,S.pop[i]*0.008),0,1)}
function pastoralMobility(i){
  return S.herd[i]*(0.12+0.88*Math.max(S.mounts[i]*S.horse[i],S.mounts[i]*S.camel[i]))*(1-S.forest[i]*0.7)*(1-WD.rough[i]*0.65);
}
function frontierProtection(i,o){
  const local=wallStrength(i)*(0.4+0.6*S.infrastructure[i]);
  if(!o)return clamp(local+S.defensePact[i]*S.organisation[i]*0.2,0,0.7);
  const supply=clamp(publicAvailable(o,i)/Math.max(1,S.pop[i]*0.04),0,1);
  return clamp(local*0.6+o.preparedness*supply*(0.2+0.25*S.mounts[i]+0.35*gunEffect(i))+S.defensePact[i]*0.15,0,0.95);
}
function frontierRisk(i){
  const from=S.threatFrom[i];if(from<0)return 0;const a=S.pol[from],b=S.pol[i],o=b?S.pols[b]:null;
  if(a&&a===b)return 0;if(a&&o&&(o.allies.includes(a)||o.over===a))return 0;
  return clamp(S.frontierDanger[i]*(1-frontierProtection(i,o)),0,1);
}
function frontierField(){
  const s=S,w=WD;s.frontierDanger.fill(0);s.threatFrom.fill(-1);
  for(const i of w.landIdx){if(s.pop[i]<800||s.herd[i]<0.3)continue;
    const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.kind!=='horde')continue;
    const mobility=pastoralMobility(i),herds=clamp(s.animals[3][i]/Math.max(1,s.pop[i]*0.08)+s.animals[4][i]/Math.max(1,s.pop[i]*0.12),0,1);
    const capacity=clamp(s.pop[i]/12000,0,1)*(0.2+0.8*herds)*clamp(pastureCondition(i),0.2,1.2);
    const pressure=1+0.3*Math.max(0,1-s.wm[i]);
    const danger=clamp(mobility*capacity*(0.3+s.organisation[i]+(o?o.raidSkill:0))*pressure,0,1);
    if(danger>0.03){s.frontierDanger[i]=danger;s.threatFrom[i]=i}
  }
  for(let pass=0;pass<4;pass++){
    const next=Float32Array.from(s.frontierDanger),origin=Int32Array.from(s.threatFrom);
    for(const i of w.landIdx)if(s.frontierDanger[i]>0.03)for(let d=0;d<4;d++){
      const j=w.nb[i*4+d];if(j<0||!w.land[j])continue;
      const friction=0.68*(1-0.55*Math.max(w.rough[i],w.rough[j]))*(1-0.45*s.forest[j])*(1-wallStrength(j)*0.8)/(1+crossingRiver(i,j)*0.3);
      const value=s.frontierDanger[i]*friction;if(value>next[j]){next[j]=value;origin[j]=s.threatFrom[i]}
    }
    s.frontierDanger=next;s.threatFrom=origin;
  }
}
function occupationNeed(o,i,j){
  const mobile=pastoralMobility(j),exposed=WD.rangeExposure[j],risk=frontierRisk(j);
  const contested=exposed*(0.4+mobile*3)+risk*4;
  return Math.max(120,S.pop[j]*0.012)*(1+contested+0.5*S.forest[j]+0.4*WD.rough[j])/(0.5+frontierTransport(i,j));
}
function frontierHoldable(o,i,j){
  if(o.kind==='horde')return true;
  const mobile=pastoralMobility(j),range=WD.rangeExposure[j],safe=frontierProtection(i,o);
  return o.occupation>=occupationNeed(o,i,j)&&
    (!((range>0.45&&mobile>0.3)||frontierRisk(j)>0.3)||safe>0.25+0.22*mobile||o.ruler.comp*o.preparedness*S.mounts[i]>0.42);
}
function buildFrontierDefense(i,o){
  if(!o||o.kind!=='state'||frontierRisk(i)<0.08)return;
  const due=S.pop[i]*0.002,paid=budgetAt(o,i,due);if(due<=0)return;
  S.fort[i]=clamp(S.fort[i]+0.015*(paid/due)*o.preparedness*(0.3+S.organisation[i])-0.004*(1-o.payroll),0,1);
}
function warnCommunities(j,attacker){
  const s=S;for(let d=0;d<4;d++){const i=WD.nb[j*4+d];if(i<0||!WD.land[i]||s.pol[i]===attacker.id)continue;
    s.defensePact[i]=clamp(s.defensePact[i]+0.16*s.organisation[i],0,1);s.frontierContacts[i]=s.year;
  }
}
function opportunismScore(o,i,j){
  const s=S;if(o.kind!=='state'||s.pop[j]<1500||s.pol[j]===o.id)return 0;
  const target=s.pol[j]?s.pols[s.pol[j]]:null;
  if(target&&(target.over===o.id||o.allies.includes(target.id)||o.truce.get(target.id)>s.year))return 0;
  if(target&&target.kind==='state'&&target.tier!=='Chiefdom'&&target.tier!=='City-state')return 0;
  const organization=s.organisation[j],developing=clamp((organization-0.15)*2.2,0,1)*(1-0.5*s.defensePact[j]);
  const reward=clamp((s.food[j]+s.depot[j])/Math.max(1,s.pop[j]*0.7),0,1)+clamp(s.urban[j]/8000,0,1)*0.4;
  const advantage=clamp(power(o)/Math.max(1,fieldDefense(j,false))-1,0,3)/3;
  const fiscal=target&&s.year-(target.creditDefault??-100000)<30?0.3*(1-target.health):0;
  const motive=0.2+o.ruler.aggr*0.5+Math.max(0,o.E/etOf(o)-1)*0.12+fiscal;
  return clamp(developing*reward*advantage*motive*(0.3+0.7*o.frontierIntel)/(1+occupationNeed(o,i,j)/Math.max(1,o.occupation)),0,1);
}
function opportunisticCampaign(o,i,j){
  const s=S,score=opportunismScore(o,i,j);if(score<=0||s.year-o.lastOpportunism<8||!frontierHoldable(o,i,j)||publicAvailable(o,i)<200)return false;
  if(s.r()>score*0.035*P.warRate)return false;
  const target=s.pol[j]?s.pols[s.pol[j]]:null;o.lastOpportunism=s.year;s.societyCounters.opportunistCampaigns++;
  warnCommunities(j,o);
  if(target&&!o.enemies.has(target.id))declareWar([o],[target],o.base+' frontier intervention',false);
  chron('war',`${o.full} intervenes against neighboring communities, seeking tribute and control before rival coalitions consolidate.`,j,[R_(o)],'A developing center offers wealth and an opening for an ambitious ruler, but occupation requires provisions and personnel.');
  territorialAttack(o,i,j,false);return true;
}
function recordVictory(o,won,severity){
  if(o.kind!=='horde')return;
  o.momentum=clamp((o.momentum||0)+(won?0.045:-0.09)-severity*0.1,0,1);
}
function incorporateClans(o,p){
  const s=S;if(!p||!p.alive||p.kind!=='horde'||p.id===o.id)return false;
  const cells=polCells(p.id);if(!cells.length)return false;
  const cost=Math.min(o.grain,o.pop*0.008);if(cost<=0)return false;budgetPay(o,cost);endForeignServiceOf(p);
  for(const i of cells){s.pol[i]=o.id;s.integ[i]=Math.max(0.25,s.integ[i]);s.autonomy[i]=Math.max(0.8,s.autonomy[i]);s.dist[i]=s.returnDist[i]=s.supplyDist[i]=65535;
    o.clanTerms.set(s.clan[i],{loyalty:0.55,joined:s.year});
  }
  s.depot[p.capital]+=p.grain;p.grain=0;
  o.army+=p.army*0.75;o.staff+=p.staff*0.5;o.pop+=p.pop;o.cells+=cells.length;
  p.army=p.staff=0;p.alive=false;p.died=s.year;p.succ=[o.id];p.over=o.id;
  s.alive=s.alive.filter(id=>id!==p.id);o.momentum=clamp(o.momentum+0.08,0,1);o.lastAccession=s.year;s.societyCounters.clanAccessions++;
  chron('diplomacy',`The clans of ${p.full} enter the ${o.full}, keeping local leaders in return for contingents and a share of future rewards.`,p.capital,[R_(o),R_(p)]);return true;
}
function snowballStep(o){
  const s=S;o.momentum*=0.975;if(s.year-o.lastAccession<5||o.momentum<0.18||o.hunger>0.15||o.coalition<0.45)return;
  if(s.r()>0.04*(o.ruler.char+o.momentum))return;
  for(const [id] of o.nb){const p=s.pols[id];if(!p||!p.alive||p.kind!=='horde'||power(p)>power(o)*(0.5+o.momentum))continue;
    if(incorporateClans(o,p))break;
  }
}
function removeResidentCulture(i,eth,n){
  const s=S,p=s.pop[i],minor=s.eth2[i]>=0?p*s.mix[i]:0,major=p-minor;
  let a=major,b=minor;if(eth===s.eth[i])a=Math.max(0,a-n);else if(eth===s.eth2[i])b=Math.max(0,b-n);else return;
  const remaining=a+b;if(remaining<1){s.mix[i]=0;return}
  if(b>a){const prior=s.eth[i];s.eth[i]=s.eth2[i];s.eth2[i]=prior;s.mix[i]=a/remaining}else s.mix[i]=b/remaining;
  // Ancestry is tracked independently. A two-component representation cannot
  // reconstruct the joint ancestry/language distribution of every household.
  if(eth===s.ancestry[i]){const b0=s.ancestry2[i]>=0?p*s.ancestryMix[i]:0,a0=Math.max(0,p-b0-n);if(b0>a0){const old=s.ancestry[i];s.ancestry[i]=s.ancestry2[i];s.ancestry2[i]=old;s.ancestryMix[i]=a0/Math.max(1,a0+b0)}else s.ancestryMix[i]=b0/Math.max(1,a0+b0)}
}
function expelCohort(i,o,fraction){
  const s=S,eth=s.eth[i],p=s.pop[i],share=s.eth2[i]>=0?1-s.mix[i]:1,n=p*share*clamp(fraction,0,0.8);if(n<1)return 0;
  const ratio=n/p,food=s.food[i]*ratio,young=s.young[i]*ratio,animals=takeHerd(i,ratio),ancestry=s.ancestry[i];
  removeResidentCulture(i,eth,n);s.pop[i]-=n;s.food[i]-=food;s.young[i]-=young;
  refugeePressure(eth,n,i,o.id,null,food,young,animals,ancestry);
  s.societyCounters.displacements+=n;return n;
}
function selectiveMortality(i,fraction){
  const s=S,adult=Math.max(0,s.pop[i]-s.young[i]),men=adult*s.maleShare[i],eth=s.eth[i];
  const native=s.eth2[i]>=0?1-s.mix[i]:1,n=Math.min(men*clamp(fraction,0,0.7)*native,s.pop[i]*0.3);
  removeResidentCulture(i,eth,n);s.pop[i]-=n;s.maleShare[i]=clamp((men-n)/Math.max(1,adult-n),0,1);
  s.societyCounters.selectiveDeaths+=n;return n;
}
function coerciveOccupation(i,o){
  const s=S;if(o.kind!=='state'||s.eth[i]<0||s.eth[i]===o.core||s.year-s.taken[i]>75)return;
  if(o.rights>0.75){o.warLaw='Negotiated incorporation';o.collectiveReprisals=false}
  const harsh=o.warLaw==='Expulsion permitted',resistance=s.unrest[i]+s.defensePact[i]*0.3;
  if(harsh&&resistance>0.55&&o.health>0.35&&s.year-s.reprisals[i]>12&&o.occupation>occupationNeed(o,i,i)&&s.r()<0.035*o.ruler.aggr){
    const due=s.pop[i]*0.015;if(budgetAt(o,i,due)<due*0.8)return;
    s.reprisals[i]=s.year;s.societyCounters.reprisals++;
    const severe=o.collectiveReprisals&&resistance>0.8&&s.r()<0.3,dead=severe?selectiveMortality(i,0.25+0.3*s.r()):0;
    const displaced=expelCohort(i,o,0.25+0.3*s.r());
    s.raidDamage[i]=clamp(s.raidDamage[i]+0.2,0,1);s.organisation[i]*=0.8;s.integ[i]*=0.6;o.trust=Math.max(0.05,o.trust-0.03);o.occupationLosses+=dead;
    warnCommunities(i,o);
    chron('war',`Occupation authorities in the ${o.full} expel ${fmtK(displaced)} residents after resistance${severe?`, with selective killing of ${fmtK(dead)} adult men`:''}.`,i,[R_(o)],'Collective punishment permitted by the government causes displacement, labour losses, resentment and a lasting demographic imbalance.');
    for(let d=0;d<4;d++){const home=WD.nb[i*4+d];if(home>=0&&s.pol[home]===o.id&&s.eth[home]===o.core&&s.pop[home]>5000){const n=foundSettlement(home,i,Math.min(s.pop[home]*0.06,s.pop[i]*0.2),o);s.societyCounters.forcedResettlers+=n;break}}
  }
  if(harsh&&o.payroll>0.6&&s.integ[i]>0.15){
    const due=s.pop[i]*0.003,paid=budgetAt(o,i,due),contact=clamp(s.newcomers[i]/Math.max(1,s.pop[i])+s.urban[i]/Math.max(1,s.pop[i])+recordSkill(i)*0.25,0,0.8);
    const n=s.pop[i]*(0.004+0.035*contact)*(paid/Math.max(1,due));
    if(n>0)mergeCulture(i,o.core,n,Math.max(1,s.pop[i]-n));
  }
}
function shatterGovernment(o,cell,reason){
  const s=S;if(!o.alive)return;endForeignServiceOf(o);
  const cells=polCells(o.id);for(const i of cells){s.pol[i]=0;s.autonomy[i]=0.9;s.integ[i]*=0.4;s.food[i]+=s.depot[i];s.depot[i]=0}
  s.food[o.capital]+=o.grain;o.grain=0;o.army=o.staff=o.navy=0;o.alive=false;o.died=s.year;o.succ=[];
  if(!s.fallen.includes(o))s.fallen.push(o);s.alive=s.alive.filter(id=>id!==o.id);s.societyCounters.shatteredStates++;
  chron('fall',reason||`Raiding and the loss of its administrative center shatter the ${o.full}; surviving communities govern themselves.`,cell,[R_(o)],'Destruction of central government is distinct from annexation or the disappearance of its people.');
}
function raidDamageAt(o,origin,j,force){
  const s=S,target=s.pol[j]?s.pols[s.pol[j]]:null;
  const destroyed=s.food[j]*0.025;s.food[j]-=destroyed;
  const stock=target?budgetAt(target,j,publicAvailable(target,j)*0.15):0;
  depositPublic(o,origin,stock);s.raidDamage[j]=clamp(s.raidDamage[j]+0.04+Math.min(0.12,force/Math.max(1,s.pop[j])),0,1);
  s.infrastructure[j]*=0.96;s.workshops[j]*=0.95;s.defensePact[j]=clamp(s.defensePact[j]+0.08,0,1);
  s.wallHealth[j]*=0.97;sackSettlement(o,j,force);
  if(target){let h=target.raidHistory.get(o.id);if(!h){h={raids:0,last:s.year,paidYears:0,breaches:0};target.raidHistory.set(o.id,h)}h.raids++;h.last=s.year}
  s.societyCounters.devastations++;
  if(target&&j===target.capital&&target.health<0.3&&target.payroll<0.5&&s.raidDamage[j]>0.45&&s.r()<0.12)shatterGovernment(target,j);
}
function longRangeRaid(o){
  const s=S,w=WD;if(o.kind!=='horde'||s.r()>0.025*P.raid*(0.4+o.ruler.aggr+o.momentum)||o.armyFree<150)return;
  let origin=o.capital;const cells=s.realmCells.get(o.id)||[];for(let k=0;k<Math.min(6,cells.length);k++){const i=cells[(s.r()*cells.length)|0];if(publicAvailable(o,i)>publicAvailable(o,origin))origin=i}
  const queue=[[origin,0]],seen=new Set([origin]);let at=0,best=-1,score=0;
  while(at<queue.length&&at<160){const [i,depth]=queue[at++];if(depth>=6)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||seen.has(j)||w.rough[j]>0.8||s.forest[j]>0.85)continue;seen.add(j);
      const defended=s.pol[j]!==o.id&&wallStrength(j)>0.3;
      if(s.pol[j]!==o.id&&s.pop[j]>1000){const target=s.pol[j]?s.pols[s.pol[j]]:null;
        if(!target||target.over!==o.id&&!o.allies.includes(target.id)&&!protectedByTreaty(target,o)){const v=raidAttraction(o,origin,j)/(1+depth*0.3);if(v>score){score=v;best=j}}
      }if(!defended)queue.push([j,depth+1]);
    }
  }
  if(best>=0){s.societyCounters.raidsBeyondBorder++;territorialRaid(o,origin,best)}
}
function frontierYear(){
  const s=S,w=WD;if(s.year%5===0)frontierField();
  for(const id of [...s.alive]){const o=s.pols[id];if(!o.alive)continue;if(o.kind==='horde'){o.blockadePressure*=0.97;o.patronage*=0.94;snowballStep(o);longRangeRaid(o)}else{protectionDiplomacy(o);offerForeignService(o)}}
  for(const i of w.landIdx){const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(o){buildFrontierDefense(i,o);coerciveOccupation(i,o)}
    // Rich new farms on exposed pasture may suffer insecurity before there is
    // a territorial confederation to declare a conventional war.
    if(!o&&s.farm[i]>0.3&&frontierRisk(i)>0.25&&s.r()<0.004*frontierRisk(i)){
      const from=s.threatFrom[i];if(from<0||s.food[from]<s.pop[from]*0.05)continue;
      const cost=Math.min(s.food[from],s.pop[from]*0.015);s.food[from]-=cost;
      const loot=Math.min(s.food[i]*0.08,cost*3);s.food[i]-=loot;s.food[from]+=loot;
      s.raidDamage[i]=clamp(s.raidDamage[i]+0.05,0,1);s.raiding[from]=clamp(s.raiding[from]+0.02,0,1);
    }
  }
}
function wallStrength(i){return S.fort[i]*S.wallHealth[i]*(1-S.wallBreach[i])}
function maintainWalls(accounts){
  const s=S;for(const i of WD.landIdx){if(s.fort[i]<0.02)continue;
    const o=s.pol[i]?s.pols[s.pol[i]]:null,due=s.fort[i]*(s.pop[i]*0.001+WD.area[i]*0.004);
    const paid=o?budgetAt(o,i,due):Math.min(s.food[i],due*s.organisation[i]);
    if(o)s.food[i]+=paid;else{s.food[i]-=paid;if(accounts)accounts.consumed+=paid}
    const met=due>0?paid/due:0;
    s.wallHealth[i]=clamp(s.wallHealth[i]+0.04*met-0.015-0.055*(1-met)-0.02*s.raidDamage[i],0,1);
    s.wallBreach[i]=Math.max(0,s.wallBreach[i]-0.13*met*s.infrastructure[i]);
    if(s.wallBreach[i]===0)s.breachBy[i]=0;
    if(s.wallHealth[i]<0.05)s.fort[i]*=0.985;
  }
}
function tryWallBreach(o,from,j,force){
  const s=S,strength=wallStrength(j);if(strength<0.3)return true;
  const target=s.pol[j]?s.pols[s.pol[j]]:null;if(target&&protectedByTreaty(target,o))return false;
  if(s.breachAttempt&&s.breachAttempt.get(j)===s.year)return false;
  if(s.breachAttemptYear!==s.year){s.breachAttempt=new Map();s.breachAttemptYear=s.year}s.breachAttempt.set(j,s.year);
  const watch=target?target.preparedness*target.payroll:0.2;
  const weakness=clamp(1-s.wallHealth[j]+s.wallBreach[j]+0.5*(1-watch),0,1);
  const chance=clamp(weakness*0.18*(0.3+o.raidSkill+o.frontierIntel)+gunEffect(from)*0.12+Math.min(0.04,force/Math.max(1,s.pop[j])*0.015)-strength*0.08,0.002,0.35);
  if(s.r()>chance)return false;
  const cost=Math.min(publicAvailable(o,from),Math.max(10,force*0.04));if(cost<10)return false;budgetAt(o,from,cost);
  s.wallBreach[j]=0.85;s.wallHealth[j]*=0.75;s.breachBy[j]=o.id;s.societyCounters.wallBreaches++;
  chron('war',`Scouts of the ${o.full} find and force a weak section of the frontier defenses, opening a route into the interior.`,j,[R_(o)],'Neglected repairs, weak patrols and local intelligence can expose a defended frontier.');return true;
}
function protectedByTreaty(state,horde){
  return state.protectionPacts.some(p=>p.horde===horde.id&&p.failures<2&&p.until>=S.year&&!p.broken);
}
function createProtectionPact(state,horde,amount){
  if(state.protectionPacts.some(p=>p.horde===horde.id&&!p.broken))return false;
  state.protectionPacts.push({horde:horde.id,promised:amount,since:S.year,until:S.year+12,paid:0,failures:0,broken:false});S.societyCounters.protectionTreaties++;
  chron('diplomacy',`The ${state.full} promises annual provisions to the ${horde.full} in exchange for peace on its frontier.`,state.capital,[R_(state),R_(horde)],'Past raids and the cost of frontier defense make a negotiated payment attractive.');return true;
}
function protectionDiplomacy(o){
  const s=S;
  for(const pact of o.protectionPacts){
    const h=s.pols[pact.horde];if(pact.broken||!h||!h.alive||h.kind!=='horde')continue;
    if(s.year>pact.until){const ratio=power(h)/Math.max(1,power(o));
      if(ratio>1.5)pact.promised*=1.25;
      pact.until=s.year+12;
    }
    const paid=tributeShipment(o,h,pact.promised);pact.paid=paid;
    s.societyCounters.protectionPaid+=paid;
    if(paid<pact.promised*0.8)pact.failures++;else pact.failures=Math.max(0,pact.failures-1);
    const record=o.raidHistory.get(h.id);if(record&&paid>=pact.promised*0.8)record.paidYears++;
    const overwhelming=power(h)>power(o)*2.5&&h.momentum>0.6;
    if(pact.failures>=2||overwhelming&&s.r()<0.015*(1-h.trust)){
      pact.broken=true;s.societyCounters.brokenProtection++;
      h.allies=h.allies.filter(id=>id!==o.id);o.allies=o.allies.filter(id=>id!==h.id);
      h.installTarget=o.id;h.installUntil=s.year+30;h.momentum=clamp(h.momentum+0.05,0,1);
      if(!h.enemies.has(o.id))declareWar([h],[o],h.base+' protection dispute',true);
      chron('war',`The protection agreement between the ${o.full} and the ${h.full} breaks down${pact.failures>=2?' after unpaid installments':', as the confederation demands submission'}.`,o.capital,[R_(o),R_(h)]);
    }
  }
  if(o.protectionPacts.filter(p=>!p.broken&&p.until>=s.year).length>=2||o.central<0.25)return;
  for(const [id,history] of o.raidHistory){const h=s.pols[id];if(!h||!h.alive||h.kind!=='horde'||s.year-history.last>30||history.raids<2||o.enemies.has(id))continue;
    const threat=power(h)/Math.max(1,power(o)),willingness=clamp(history.raids*0.07+threat*0.15+(1-o.preparedness)*0.2+o.ruler.comp*0.1-o.ruler.aggr*0.15,0,0.8);
    const due=Math.max(50,o.pop*0.0015+h.army*0.025);
    if(o.grain>due*2&&s.r()<0.02*willingness){createProtectionPact(o,h,due);break}
  }
}
function installConquestDynasty(o,d,capital){
  if(!d.alive||o.kind!=='horde'||o.installTarget!==d.id||S.year>o.installUntil||d.health>0.45||o.army<d.army*1.2)return false;
  const elite=d.groups?d.groups.nobles.loyalty:0.5;
  if(elite>0.65||o.rights<0.2||o.grain<d.pop*0.015)return false;
  const s=S,name=d.full,cells=polCells(d.id);for(const i of cells){s.pol[i]=o.id;s.integ[i]=0.25;s.autonomy[i]=Math.max(0.7,s.autonomy[i]);conquestRecorded(o,i,d.id)}
  const oldCapital=o.capital;S.depot[oldCapital]+=o.grain;o.grain=0;
  inheritConquest(o,d);o.kind='state';o.conqDyn=true;o.settledY=s.year;o.capital=capital;o.legacy=d.legacy||d.id;o.base=d.base;
  o.bureau=Math.max(o.bureau,d.bureau*0.7);o.central=(o.central+d.central)*0.5;o.health=Math.max(0.45,o.health);o.conquestLoad=clamp(o.conquestLoad+1,0,3);
  o.pop+=d.pop;o.cells+=cells.length;d.alive=false;d.died=s.year;d.succ=[o.id];s.alive=s.alive.filter(id=>id!==d.id);s.societyCounters.conquestDynasties++;
  o.tier=tierOf(o);o.full=fullName(o);
  chron('rise',`The victors install the dynasty of ${o.dyn} over the former ${name}, retaining local administrators and estates.`,capital,[R_(o),R_(d)],'A defeated government, cooperation from intermediaries and sufficient forces allow conquest to become dynastic rule.');return true;
}
function confederationVisibility(mode,lastSeen=new Map()){
  const s=S,w=WD,visible=new Set();if(mode==='off')return visible;
  if(mode==='on'){for(const id of s.alive)if(s.pols[id].kind==='horde')visible.add(id);return visible}
  const distance=new Uint8Array(N).fill(255),queue=new Int32Array(N);let head=0,tail=0;
  const settled=i=>s.pop[i]>=4000&&s.farm[i]>0.3&&(s.urban[i]>=1500||s.pop[i]/w.area[i]>4&&s.organisation[i]>0.25);
  for(const i of w.landIdx)if(settled(i)){distance[i]=0;queue[tail++]=i}
  while(head<tail){const i=queue[head++];if(distance[i]>=3)continue;for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]&&distance[j]>distance[i]+1){distance[j]=distance[i]+1;queue[tail++]=j}}}
  for(const i of w.landIdx){const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.kind==='horde'&&distance[i]<=3)visible.add(o.id)}
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='horde')continue;
    if([...o.enemies.keys()].some(id=>s.pols[id]&&s.pols[id].alive&&s.pols[id].kind==='state'))visible.add(id);
  }
  for(const e of s.tradeEdges){const a=s.pol[e.a],b=s.pol[e.b];if(!a||!b||a===b)continue;
    if(s.pols[a].kind==='horde'&&settled(e.b))visible.add(a);if(s.pols[b].kind==='horde'&&settled(e.a))visible.add(b);
  }
  for(const id of visible)lastSeen.set(id,s.year);
  for(const id of s.alive)if(s.pols[id].kind==='horde'&&lastSeen.has(id)&&s.year-lastSeen.get(id)<=10)visible.add(id);
  return visible;
}

// Bounded scouting of connected pasture and crossings. Costs, rather than a
// preferred compass direction, decide which opening a mobile coalition seeks.
function migrationRoute(o,start,force,limit=700){
  const s=S,w=WD,cost=new Map([[start,0]]),parent=new Map(),heap=[[0,start]];
  const push=(v)=>{heap.push(v);let k=heap.length-1;while(k){const p=(k-1)>>1;if(heap[p][0]<=v[0])break;heap[k]=heap[p];k=p}heap[k]=v};
  const pop=()=>{const v=heap[0],last=heap.pop();if(heap.length){let k=0;while(k*2+1<heap.length){let c=k*2+1;if(c+1<heap.length&&heap[c+1][0]<heap[c][0])c++;if(heap[c][0]>=last[0])break;heap[k]=heap[c];k=c}heap[k]=last}return v};
  let visited=0,best=-1,bestValue=0;
  while(heap.length&&visited<limit){const [distance,i]=pop();if(distance!==cost.get(i))continue;visited++;if(distance>120)continue;
    if(i!==start&&s.pol[i]!==o.id){
      const owner=s.pol[i]?s.pols[s.pol[i]]:null,defense=fieldDefense(i,false)/Math.max(1,Math.pow(force+1,P.scaleExp)*milAt(start));
      const room=clamp((s.K[i]-s.pop[i])/Math.max(1000,s.K[i]),0,1),forage=w.sH[i]*pastureCondition(i);
      const wealth=owner&&owner.kind==='state'?Math.log2(2+s.pop[i]/5000)*clamp(s.food[i]/Math.max(1,s.pop[i]),0,1):0;
      const value=(room*forage+wealth*0.65+0.08)*Math.min(1,forage+0.15)/(1+distance*0.065+defense*0.8+s.migrationPressure[i]);
      if(value>bestValue){bestValue=value;best=i}
    }
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||w.T[j]<-9||w.rough[j]>0.85||s.forest[j]>0.9)continue;
      const own=s.pol[j]===o.id,owner=s.pol[j]?s.pols[s.pol[j]]:null,wall=own?0:wallStrength(j);
      if(wall>0.65)continue;
      const forage=w.sH[j]*pastureCondition(j);if(forage<0.08&&!(w.desert[j]&&s.pack[start]>0.25)&&!(owner&&owner.kind==='state'))continue;
      const opposition=own?0:fieldDefense(j,false)/Math.max(1,Math.pow(force+1,P.scaleExp)*milAt(start));
      const step=1+2*w.rough[j]+2*s.forest[j]+0.4*crossingRiver(i,j)+Math.max(0,0.55-forage)*4+wall*12+Math.min(8,opposition*1.2)+s.migrationPressure[j]*2;
      const next=distance+step;if(next>=(cost.get(j)??Infinity))continue;
      cost.set(j,next);parent.set(j,i);push([next,j]);
    }
  }
  const path=[];if(best>=0){let i=best;while(i!==start){path.push(i);i=parent.get(i);if(i==null)return []}path.reverse()}return path;
}
function migrationWallPass(M,j){
  const s=S,strength=wallStrength(j);if(s.pol[j]===M.pol||strength<0.3)return true;
  const key=-1-j;if(M.blocked.get(key)===s.year)return false;M.blocked.set(key,s.year);
  const owner=s.pol[j]?s.pols[s.pol[j]]:null,watch=owner?owner.preparedness*owner.payroll:0.2;
  const weakness=1-s.wallHealth[j]+s.wallBreach[j]+0.4*(1-watch),cost=M.pop*0.015;
  if(M.food<cost||s.r()>clamp(weakness*(0.06+M.experience*0.12)-strength*0.05,0.001,0.2))return false;
  M.food-=cost;s.wallBreach[j]=0.85;s.wallHealth[j]*=0.8;s.breachBy[j]=M.pol;s.societyCounters.migrantBreaches++;
  chron('migration',`The ${M.name} force an opening in neglected frontier defenses and move through the gap.`,j,[RM(M)]);return true;
}
function takeMigrationFollowers(M,j,n){
  const s=S,prior=s.pop[j];n=Math.min(n,prior*0.25);if(n<1)return 0;
  const ratio=n/prior,young=s.young[j]*ratio,food=s.food[j]*ratio;
  addHerd(M.animals,takeHerd(j,ratio));M.food+=food;M.young+=young;M.pop+=n;
  const minority=s.eth2[j]>=0?s.mix[j]:0;
  for(const [eth,share] of [[s.eth[j],1-minority],[s.eth2[j],minority]])if(eth>=0&&share>0){
    let g=M.groups.find(g=>g.eth===eth&&g.ancestry===s.ancestry[j]);if(!g){g={eth,ancestry:s.ancestry[j],pop:0};M.groups.push(g)}g.pop+=n*share;
  }
  s.pop[j]-=n;s.young[j]-=young;s.food[j]-=food;
  const owner=s.pol[j]?s.pols[s.pol[j]]:null;if(owner){owner.army*=1-ratio;owner.staff*=1-ratio}
  return n;
}
function migrationNomadEncounter(M,j){
  const s=S,o=s.pol[j]?s.pols[s.pol[j]]:null;if(!o||o.kind!=='horde'||o.id===M.pol||M.kind==='people')return null;
  const mobile=M.pop*0.09*M.S*M.mil,defender=Math.max(100,(o.army-o.loanedTroops)*milAt(j));
  const pressure=clamp(mobile/defender,0,3);s.migrationPressure[j]=clamp(s.migrationPressure[j]+pressure*0.3,0,2);
  const affinity=1-ethDist(M.eth,s.eth[j]),provision=clamp(M.food/Math.max(1,M.pop*0.6),0,1);
  if(pressure>0.8&&provision>0.25&&s.r()<clamp(0.08+M.experience*0.22+affinity*0.12+(1-o.coalition)*0.15,0,0.55)){
    const n=takeMigrationFollowers(M,j,Math.min(M.pop*0.15,s.pop[j]*0.12, M.food*0.25));
    if(n>0){M.experience=clamp(M.experience+0.02,0,1);s.societyCounters.migrationAccessions++;
      chron('migration',`Clans of the ${o.full} join the moving ${M.name}, bringing ${fmtK(n)} people and their herds.`,j,[RM(M),R_(o)]);return true}
  }
  if(pressure>1.35&&s.migrationPressure[j]>0.45&&o.pop>15000&&s.year-o.lastMigration>15&&s.activeMigs.length<20&&s.r()<0.3*(1-o.preparedness*0.5)){
    const retreat=hordeMigration(o,'pressure');if(retreat){retreat.prev=M.id;s.societyCounters.migrationRetreats++;o.shock+=0.1;return true}
  }
  return null;
}

// Contracts earmark existing troops; the employer never gets a second copy of
// the same army. Temporary service keeps dependents in the recruitment base.
function createMilitaryContract(state,horde,troops,years=8){
  const s=S;if(state.kind!=='state'||horde.kind!=='horde'||state.enemies.has(horde.id)||!state.alive||!horde.alive)return null;
  if(s.militaryContracts.some(t=>!t.done&&(t.state===state.id||t.horde===horde.id)))return null;
  const n=Math.min(troops,Math.max(0,horde.army-horde.loanedTroops)*0.3),due=n*0.8;if(n<100||state.grain<due*2)return null;
  const travel=Math.max(1,Math.ceil(angDist(state.capital,horde.capital)/0.15));
  const t={state:state.id,horde:horde.id,home:horde.capital,troops:n,free:0,pay:due,since:s.year,arrives:s.year+travel,end:s.year+travel+years,failures:0,served:0,tech:new Float32Array(TECH.length),equipment:0,done:false,lastPaid:s.year};
  tributeShipment(state,horde,due);s.militaryContracts.push(t);horde.loanedTroops+=n;
  horde.armyFree=Math.max(0,horde.armyFree-n*0.55);horde.defFree=Math.max(0,horde.defFree-n*0.45);
  if(!state.allies.includes(horde.id))state.allies.push(horde.id);if(!horde.allies.includes(state.id))horde.allies.push(state.id);
  s.societyCounters.militaryContracts++;
  chron('diplomacy',`The ${state.full} engages ${Math.round(n)} warriors from the ${horde.full}, promising provisions for their service against its rivals.`,state.capital,[R_(state),R_(horde)]);return t;
}
function offerForeignService(o){
  const s=S;if(s.year%5||!o.enemies.size||s.r()>0.06*P.allyRate)return;
  const candidates=new Set([...o.nb.keys(),...o.allies]);
  for(const id of candidates){const h=s.pols[id];if(!h||!h.alive||h.kind!=='horde'||h.enemies.has(o.id))continue;
    if(h.enemies.size&&![...h.enemies.keys()].some(id=>o.enemies.has(id)))continue;
    if(createMilitaryContract(o,h,h.army*0.25))break;
  }
}
function returnVeterans(t){
  const s=S,h=s.pols[t.horde],employer=s.pols[t.state];if(employer)employer.foreignFree=Math.max(0,employer.foreignFree-t.free);
  t.done=true;t.free=0;if(!h||!h.alive)return;
  h.loanedTroops=Math.max(0,h.loanedTroops-t.troops);s.societyCounters.returnedVeterans+=t.troops;
  if(t.served>0){const c=s.pol[t.home]===h.id?t.home:h.capital,experience=clamp(t.served/20,0,0.18);
    h.raidSkill=clamp(h.raidSkill+experience,0,1);h.crisisMemory=clamp(h.crisisMemory+experience*0.5,0,1);
    s.craftPractice[c]+=Math.min(30,t.served*0.5);s.firearms[c]+=t.equipment;t.equipment=0;
    for(let k=0;k<TECH.length;k++)if(t.tech[k]>s.tk[k][c])s.tk[k][c]=Math.max(s.tk[k][c],Math.min(0.45,t.tech[k]*0.4));
    chron('ideas',`Veterans return to the ${h.full} with experience of settled armies and techniques encountered in service.`,c,[R_(h)],'Equipment and practical knowledge can travel home, but widespread adoption still needs training, materials and local workshops.');
  }
}
function endForeignServiceOf(o){for(const t of S.militaryContracts)if(!t.done&&(t.horde===o.id||t.state===o.id))returnVeterans(t)}
function militaryContractsYear(){
  const s=S;for(const id of s.alive){const o=s.pols[id];o.foreignFree=0;o.loanedTroops=0;o.campaignAuxShare=0}
  for(const t of s.militaryContracts){if(t.done)continue;const a=s.pols[t.state],h=s.pols[t.horde];
    if(!a||!a.alive||!h||!h.alive||h.kind!=='horde'||a.enemies.has(h.id)||s.year>=t.end||t.failures>=2){returnVeterans(t);continue}
    t.troops=Math.min(t.troops,h.army*0.5);
    if(t.lastPaid<s.year){const paid=tributeShipment(a,h,t.pay);t.lastPaid=s.year;if(paid<t.pay*0.8)t.failures++;else t.failures=Math.max(0,t.failures-1)}
    h.loanedTroops+=t.troops;t.free=s.year>=t.arrives&&t.failures===0?t.troops*0.55:0;a.foreignFree+=t.free;
  }
  for(const id of s.alive){const o=s.pols[id];o.armyFree=Math.max(0,o.army-o.loanedTroops)*0.55;o.defFree=Math.max(0,o.army-o.loanedTroops)*0.45}
  if(s.year%25===0)s.militaryContracts=s.militaryContracts.filter(t=>!t.done);
}
function drawForeignTroops(o,i,n){
  const s=S;let used=0;for(const t of s.militaryContracts){if(t.done||t.state!==o.id||t.free<=0)continue;
    const take=Math.min(n-used,t.free);if(take<=0)break;t.free-=take;used+=take;t.served++;
    for(let k=0;k<TECH.length;k++)t.tech[k]=Math.max(t.tech[k],s.tk[k][i]);
    const equipment=Math.min(s.firearms[i]*0.02,take*0.01);s.firearms[i]-=equipment;t.equipment+=equipment;
  }o.foreignFree=Math.max(0,o.foreignFree-used);return used;
}
function foreignCasualties(o,n){
  const s=S,contracts=s.militaryContracts.filter(t=>!t.done&&t.state===o.id&&t.troops>0),total=contracts.reduce((v,t)=>v+t.troops,0);
  for(const t of contracts){const killed=Math.min(t.troops,n*t.troops/Math.max(1,total)),h=s.pols[t.horde];t.troops-=killed;t.free=Math.min(t.free,t.troops*0.55);
    if(h){h.loanedTroops=Math.max(0,h.loanedTroops-killed);armyLoss(h,s.pol[t.home]===h.id?t.home:h.capital,killed)}
  }
}
