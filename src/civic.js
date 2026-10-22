/* Urban defenses, rural agreements and practical innovation. All numeric rates
   are experimental scenario parameters, not reconstructed historical laws. */
function initCivic(){
  const s=S;
  for(const k of ['cityWall','cityWallHealth','engineeringKnowledge','engineeringPractice','granaries','civicLabor','militaryEquipment','martialPractice','commercialPractice','ruralInfluence','ruralSecurity','siegeProgress'])s[k]=new Float32Array(N);
  s.cityWallHealth.fill(1);s.ruralPatron=new Int32Array(N);s.ruralYears=new Uint16Array(N);
  s.siegeOwner=new Int32Array(N);s.siegeYear=new Int32Array(N).fill(-100000);s.cityProjects=new Map();
  Object.assign(s.societyCounters,{ruralAgreements:0,ruralIncorporations:0,civicUnions:0,brokenCivicBargains:0,civicWorks:0,urbanResearch:0,confederationBreakups:0,scatteredClans:0,clansReceivedByCities:0,clansJoiningConfederations:0});
  initDevelopment();
}
function civicSpend(i,o,due){
  const s=S,p=s.pop[i],room=Math.max(0,0.1-s.civicLabor[i])*p/3;
  due=Math.min(Math.max(0,due),room);if(due<=0)return 0;
  const paid=o?budgetAt(o,i,due):Math.min(due,Math.max(0,s.food[i]-p*0.25)*0.06*s.organisation[i]);
  // Public wages return to the same resident households; materials are consumed.
  if(o)s.food[i]+=paid*0.75;else s.food[i]-=paid;
  s.civicLabor[i]=clamp(s.civicLabor[i]+paid/Math.max(1,p)*3,0,0.1);s.societyCounters.civicWorks+=paid;return paid;
}
function cityWallStrength(i){
  return S.cityWall[i]*S.cityWallHealth[i]*(0.35+0.65*S.engineeringKnowledge[i]);
}
function settlementDefense(i){
  return Math.max(wallStrength(i),cityWallStrength(i)*clamp(S.urban[i]/Math.max(1,S.pop[i])*4,0,1));
}
function armsAccess(i){return clamp(S.militaryEquipment[i]/Math.max(25,S.pop[i]*0.012),0,1)}
function civicThreat(i,o){
  let pressure=frontierRisk(i)+S.raidDamage[i];
  for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j<0)continue;const q=S.pol[j];
    if(q&&o&&q!==o.id&&(o.enemies.has(q)||S.pols[q]?.kind==='horde'))pressure+=0.25;
    else if(q&&o&&q!==o.id&&!o.allies.includes(q))pressure+=0.035;
  }return clamp(pressure,0,1);
}
function civicWorksAt(i,o){
  const s=S,p=s.pop[i],urban=Math.min(p,s.urban[i]);if(p<100)return;
  s.engineeringPractice[i]*=0.999;s.martialPractice[i]*=0.995;s.commercialPractice[i]*=0.998;
  s.engineeringKnowledge[i]=Math.max(s.engineeringKnowledge[i]*0.9995,clamp(Math.log1p(s.engineeringPractice[i])/11,0,1));
  const threat=civicThreat(i,o),materials=0.65+0.35*Math.max(s.forest[i],WD.rough[i]);
  if(s.cityWall[i]>0.001){
    const due=(Math.sqrt(Math.max(100,urban))*0.15+urban*0.0005)*s.cityWall[i]/materials,paid=civicSpend(i,o,due),met=paid/Math.max(1,due);
    s.cityWallHealth[i]=clamp(s.cityWallHealth[i]+0.025*met-0.012-0.045*(1-met)-s.raidDamage[i]*0.015,0,1);
    s.engineeringPractice[i]+=paid*0.15;if(s.cityWallHealth[i]<0.05)s.cityWall[i]*=0.99;
  }
  // An isolated first city has no automatic wall. Nearby conflict, raiding and
  // rival centers create demand; a cheap circuit can precede skilled masonry.
  if(urban>1000&&threat>0.04&&P.fortify>0){
    const due=urban*0.006*(0.6+threat)/materials,paid=civicSpend(i,o,due),met=paid/Math.max(1,due);
    s.cityWall[i]=clamp(s.cityWall[i]+0.022*met*(0.2+0.8*s.organisation[i])*Math.min(2,P.fortify),0,1);
    s.engineeringPractice[i]+=paid*(0.4+threat);s.cityWallHealth[i]=clamp(s.cityWallHealth[i]+0.01*met,0,1);
  }
  const reserve=o?publicAvailable(o,i):0,storageDemand=clamp((s.food[i]+reserve)/Math.max(1,p)-0.15+threat*0.4,0,1);
  const granaryDue=p*0.003*(s.granaries[i]+storageDemand*(1-s.granaries[i]));
  const invested=skill(i,'storage')>0.2?civicSpend(i,o,granaryDue):0;
  s.granaries[i]=clamp(s.granaries[i]*0.995+0.016*invested/Math.max(1,granaryDue)*skill(i,'storage')*storageDemand,0,1);
  // Working equipment is separate from knowing metallurgy. Workshops consume
  // provisions; preparation and finite armies still determine its military use.
  s.militaryEquipment[i]*=0.92;
  if(s.metal[i]>0.3&&s.workshops[i]>0.02){
    const replacement=clamp((p*0.015-s.militaryEquipment[i])/Math.max(1,p*0.015),0,1);
    const due=p*0.003*s.workshops[i]*replacement,paid=civicSpend(i,o,due);
    s.militaryEquipment[i]+=paid*0.6*(0.4+0.6*s.metal[i])*(1-s.sickness[i]);
  }
  s.commercialPractice[i]+=Math.min(10,(s.foodImports[i]+s.flow[i]*0.15)/Math.max(100,p))*s.node[i];
  if(s.siegeOwner[i]&&s.year-s.siegeYear[i]>1){s.siegeProgress[i]*=0.65;if(s.siegeProgress[i]<0.01){s.siegeOwner[i]=0;s.siegeProgress[i]=0}}
}
function shareEngineering(){
  const s=S,delta=new Float32Array(N);
  const contact=(i,j,rate)=>{const a=s.pol[i]?s.pols[s.pol[i]]:null,b=s.pol[j]?s.pols[s.pol[j]]:null;
    if(a&&b&&a.enemies.has(b.id)||s.pop[j]<100||s.organisation[j]<0.1)return;
    delta[j]=Math.max(delta[j],Math.max(0,s.engineeringKnowledge[i]-s.engineeringKnowledge[j])*rate);
  };
  for(const i of WD.landIdx)if(s.pop[i]>100)for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j>=0&&WD.land[j])contact(i,j,0.02*Math.min(s.infrastructure[i],s.infrastructure[j]))}
  for(const e of s.tradeEdges)if((e.privateUsed||0)+(e.freightUsed||0)>1){contact(e.a,e.b,0.035);contact(e.b,e.a,0.035)}
  for(const i of WD.landIdx)s.engineeringKnowledge[i]=clamp(s.engineeringKnowledge[i]+delta[i],0,1);
}
function ruralProtection(o,i,j){
  const s=S,travel=routeCost(i,j,o,false),reach=Math.exp(-travel/Math.max(1,o.h));
  const reserves=clamp(publicAvailable(o,i)/Math.max(50,s.pop[i]*0.04),0,1);
  const troops=clamp(Math.max(0,o.army-(o.loanedTroops||0))/Math.max(200,o.pop*0.015+o.cells*40),0,1);
  const patrol=o.preparedness*o.payroll*troops*reserves;
  // City walls offer a nearby refuge, not a shield over the entire countryside.
  return clamp(reach*(0.1+0.65*patrol+0.12*cityWallStrength(i)+0.13*wallStrength(j))*(1-frontierRisk(j)*0.8)*(1-WD.rangeExposure[j]*pastoralMobility(j)*0.65),0,1);
}
function incorporateHinterland(o,i,j){
  const s=S;if(s.pol[j]||s.urban[j]>1200||s.ruralPatron[j]!==o.id||s.ruralInfluence[j]<0.85||s.ruralYears[j]<50||ruralProtection(o,i,j)<0.4)return false;
  const personnelNeed=(o.cells+1)*20+(o.pop+s.pop[j])*0.001;
  if(o.staff<personnelNeed||publicAvailable(o,i)<s.pop[j]*0.03||o.rights<0.45||o.health<0.65)return false;
  const paid=civicSpend(i,o,s.pop[j]*0.02);if(paid<s.pop[j]*0.019)return false;
  conquestRecorded(o,j,0);s.pol[j]=o.id;s.integ[j]=0.45;s.autonomy[j]=0.75;
  s.dist[j]=Math.min(65534,s.dist[i]+Math.round(routeCost(i,j,o,false)*2));
  o.cells++;o.pop+=s.pop[j];let realm=s.realmCells.get(o.id);if(realm&&!realm.includes(j))realm.push(j);
  o.civicBargains=o.civicBargains||[];o.civicBargains.push({cell:j,rights:o.rights,since:s.year,failures:0});
  s.societyCounters.ruralIncorporations++;
  chron('diplomacy',`Rural communities accept the protection and jurisdiction of the ${o.full}, retaining local land rights and leaders.`,j,[R_(o)],'Decades of provision and protection precede incorporation; residents, cultures and ancestry stay in place.');return true;
}
function ruralAgreements(){
  const s=S,visited=new Set();for(const i of WD.landIdx){if(s.urban[i]<1500)continue;const o=s.pol[i]?s.pols[s.pol[i]]:null;if(!o?.alive||o.kind!=='state'||o.health<0.5||o.rights<0.35)continue;
    for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j<0||visited.has(j)||!WD.land[j]||s.pol[j]||s.pop[j]<200||s.urban[j]>1200||s.farm[j]*farmSuit(j)<0.1)continue;
      const security=ruralProtection(o,i,j);if(security<0.35)continue;
      const prior=s.ruralPatron[j],incumbent=s.ruralInfluence[j];
      if(prior&&prior!==o.id&&security<s.ruralSecurity[j]+0.12)continue;
      const due=20+s.pop[j]*0.003,paid=civicSpend(i,o,due);if(paid<due*0.9)continue;visited.add(j);
      if(prior!==o.id){s.ruralPatron[j]=o.id;s.ruralInfluence[j]=incumbent*0.2;s.ruralYears[j]=0;s.societyCounters.ruralAgreements++}
      s.ruralSecurity[j]=security;s.ruralYears[j]=Math.min(65535,s.ruralYears[j]+5);
      const appeal=(0.25+0.75*o.trust)*(0.4+0.6*security)*(1-0.5*s.defensePact[j]*s.organisation[j]);
      s.ruralInfluence[j]=clamp(s.ruralInfluence[j]+0.055*appeal,0,1);
      if(P.allyRate>0&&s.r()<Math.min(0.6,0.1*P.allyRate))incorporateHinterland(o,i,j);
    }
  }
}
function civicUnionTerms(client,patron){
  if(!client?.alive||!patron?.alive||client.kind!=='state'||patron.kind!=='state'||client.enemies.has(patron.id)||client.cells>8)return false;
  const near=angDist(client.capital,patron.capital)<0.1||client.nb.has(patron.id);
  return near&&patron.rights>=0.55&&patron.trust>=0.6&&patron.health>=0.65&&patron.payroll>=0.8&&client.trust>=0.4;
}
function integrateCivicPolity(client,patron){
  const s=S,u=client.civicUnion;if(!u||u.progress<1||u.years<80||!civicUnionTerms(client,patron)||patron.staff<(patron.pop+client.pop)*0.003+(patron.cells+client.cells)*25)return false;
  if(publicAvailable(patron,patron.capital)<client.pop*0.06)return false;
  const cost=budgetAt(patron,patron.capital,client.pop*0.04);s.food[client.capital]+=cost;
  endForeignServiceOf(client);depositPublic(patron,client.capital,client.grain);client.grain=0;
  patron.staff+=client.staff;patron.army+=client.army;patron.navy+=client.navy;client.staff=client.army=client.navy=0;
  patron.compacts.push(...client.compacts);client.compacts=[];
  for(const loan of s.creditLoans){if(loan.borrower===client.id)loan.borrower=patron.id;if(loan.lender===client.id)loan.lender=patron.id;if(loan.lender===loan.borrower)loan.done=true}
  for(const shipment of s.publicShipments){if(shipment.to===client.id)shipment.to=patron.id;if(shipment.from===client.id)shipment.from=patron.id}
  const cells=polCells(client.id);patron.civicBargains=patron.civicBargains||[];
  for(const j of cells){conquestRecorded(patron,j,client.id);s.pol[j]=patron.id;s.integ[j]=Math.max(0.5,s.integ[j]*0.8);s.autonomy[j]=Math.max(0.65,s.autonomy[j]);patron.civicBargains.push({cell:j,rights:u.rights,since:s.year,failures:0})}
  patron.cells+=cells.length;patron.pop+=client.pop;patron.tribs=Math.max(0,patron.tribs-1);
  client.alive=false;client.died=s.year;client.succ=[patron.id];client.lastBy=patron.id;client.unionWith=patron.id;
  for(const [q] of client.enemies)s.pols[q]?.enemies.delete(client.id);client.enemies.clear();
  for(const q of client.allies){const other=s.pols[q];if(other)other.allies=other.allies.filter(id=>id!==client.id)}
  s.alive=s.alive.filter(id=>id!==client.id);s.fallen.push(client);s.societyCounters.civicUnions++;
  chron('diplomacy',`The ${client.full} joins the ${patron.full} under a negotiated charter protecting its council and land rights.`,client.capital,[R_(client),R_(patron)],'Shared government follows sustained support and agreement. Local cultural identities persist.');return true;
}
function civicUnionStep(client){
  const s=S,patron=client.over?s.pols[client.over]:null;if(!patron||client.kind!=='state'){client.civicUnion=null;return}
  let u=client.civicUnion;if(!u||u.patron!==patron.id)u=client.civicUnion={patron:patron.id,progress:0,years:0,rights:Math.max(0.55,patron.rights),failures:0};
  if(!civicUnionTerms(client,patron)||patron.rights<u.rights-0.08){u.progress=Math.max(0,u.progress-0.025);u.failures++;return}
  const due=Math.max(10,client.pop*0.002),paid=tributeShipment(patron,client,due);
  if(paid<due*0.9){u.progress=Math.max(0,u.progress-0.02);u.failures++;return}
  u.years++;u.failures=Math.max(0,u.failures-1);
  const civic=S.cityIdentity[client.capital],need=clamp((1-client.health)*0.6+frontierRisk(client.capital)+client.enemies.size*0.15,0,1);
  const connection=clamp(S.node[client.capital]+S.urbanNetwork[client.capital],0,1);
  u.progress=clamp(u.progress+0.006*(0.4+connection+need)*(1-0.65*civic),0,1);
  if(u.progress>=1&&P.allyRate>0&&s.r()<0.025*P.allyRate)integrateCivicPolity(client,patron);
}
function offerCivicProtection(client){
  const s=S;if(client.over||client.cells>6||s.urban[client.capital]<1500)return;
  const need=clamp(frontierRisk(client.capital)+(1-client.health)*0.6+client.enemies.size*0.15+s.urbanNetwork[client.capital]*0.15,0,1);
  if(need<0.1||s.r()>0.012*need*P.allyRate)return;
  for(const id of client.allies){const patron=s.pols[id];if(!civicUnionTerms(client,patron)||power(patron)<power(client)*1.3||patron.over)continue;
    client.over=id;client.overY=s.year;client.league=true;patron.tribs++;
    chron('diplomacy',`The ${client.full} enters a protection league with the ${patron.full}, reserving its council and local laws.`,client.capital,[R_(client),R_(patron)]);break;
  }
}
function maintainCivicBargains(o){
  const s=S;for(const b of o.civicBargains||[]){if(s.pol[b.cell]!==o.id)continue;
    const broken=o.rights<b.rights-0.12||o.health*o.payroll<0.35||s.nutrition[b.cell]<0.6;
    b.failures=broken?b.failures+1:Math.max(0,b.failures-2);
    if(broken){s.unrest[b.cell]=clamp(s.unrest[b.cell]+0.006,0,1);s.eliteLoyalty[b.cell]*=0.995}
    if(b.failures>=15&&!b.protested){b.protested=true;s.societyCounters.brokenCivicBargains++;chron('diplomacy',`Communities within the ${o.full} withhold cooperation after their charter promises fail.`,b.cell,[R_(o)])}
  }
}
function besiegeCity(o,from,j,force){
  const s=S,strength=cityWallStrength(j);if(strength<0.3||s.urban[j]<1000)return true;
  if(s.siegeOwner[j]!==o.id){s.siegeOwner[j]=o.id;s.siegeProgress[j]=0}
  if(s.siegeYear[j]===s.year)return s.siegeProgress[j]>=1;
  const due=Math.max(20,force*0.025);if(publicAvailable(o,from)<due)return false;
  budgetAt(o,from,due);s.siegeYear[j]=s.year;
  const supplies=clamp((s.food[j]+s.depot[j]+(s.pol[j]&&s.pols[s.pol[j]].capital===j?s.pols[s.pol[j]].grain:0))/Math.max(1,s.pop[j]),0,1);
  s.siegeProgress[j]=clamp(s.siegeProgress[j]+(0.09+0.15*s.engineeringKnowledge[from]+0.22*gunEffect(from)+0.15*(1-supplies))/(0.5+strength),0,1);
  s.engineeringPractice[from]+=due*0.3;s.engineeringPractice[j]+=due*0.1;s.raidDamage[j]=clamp(s.raidDamage[j]+0.015,0,1);
  if(s.siegeProgress[j]<1)return false;
  s.cityWallHealth[j]*=0.3;s.engineeringKnowledge[from]=Math.max(s.engineeringKnowledge[from],s.engineeringKnowledge[j]*0.5);
  s.siegeOwner[j]=0;s.siegeProgress[j]=0;return true;
}
function civicTradeAccess(i,j){return (S.siegeOwner[i]&&S.year-S.siegeYear[i]<=1||S.siegeOwner[j]&&S.year-S.siegeYear[j]<=1)?0.35:1}
function civicYear(){
  const s=S;s.civicLabor.fill(0);
  for(const i of WD.landIdx){s.ruralInfluence[i]*=0.998;s.ruralSecurity[i]*=0.97;const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(s.ruralPatron[i]&&!s.pols[s.ruralPatron[i]]?.alive){s.ruralPatron[i]=0;s.ruralYears[i]=0}
    civicWorksAt(i,o);urbanConstruction(i,o);
  }
  if(s.year%5===0){shareEngineering();ruralAgreements()}
  for(const id of [...s.alive]){const o=s.pols[id];if(o.kind!=='state')continue;if(s.year%5===0)offerCivicProtection(o);civicUnionStep(o);if(o.alive){maintainCivicBargains(o);inventionPass(o)}}
}
function confederationBreakupRisk(o,fair=0){
  const generations=Math.max(0,(S.year-o.born-25)/30),agePressure=1-Math.exp(-generations*0.65);
  let loyalty=0;for(const t of o.clanTerms.values())loyalty+=t.loyalty;loyalty/=Math.max(1,o.clanTerms.size);
  const continuity=clamp(o.succession*0.35+o.trust*0.15+loyalty*0.2+fair*0.15+o.patronage*0.65+o.momentum*0.1+o.sharedThreat*0.1,0,1);
  const disputes=clamp(o.coalitionFatigue*0.4+(1-loyalty)*0.3+o.hunger*0.35+o.shock*0.3+o.strain*0.2,0,1);
  return clamp((0.015+agePressure*0.38)*disputes*(1-continuity)*(1-continuity),0,0.45);
}
function scatterClanHouseholds(i,j,requested){
  const s=S,old=s.pop[j],prior=s.pop[i],n=Math.min(requested,prior*0.3,Math.max(0,s.K[j]-old)*0.2,s.food[i]/0.25);if(n<30)return 0;
  const ratio=n/prior,food=s.food[i]*ratio,young=s.young[i]*ratio,animals=takeHerd(i,ratio),minority=s.eth2[i]>=0?s.mix[i]:0,history=diseaseHistory(i);
  s.pop[i]-=n;s.young[i]-=young;s.food[i]-=food;s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-n*0.06);putHerd(j,animals);
  let before=old;for(const [eth,share] of [[s.eth[i],1-minority],[s.eth2[i],minority]])if(eth>=0&&share>0){if(before<1){s.eth[j]=eth;s.eth2[j]=-1;s.mix[j]=0}else mergeCulture(j,eth,n*share,before);before+=n*share}
  mergeAncestry(j,s.ancestry[i],n,old);mixDiseaseHistory(j,history,n,old);transferCrops(i,j);
  s.newcomers[j]+=n;s.settleLag[j]=Math.max(1,s.settleLag[j]);diseaseJourney(i,j,travelDays(i,j),n,'migration');
  s.campMoves.push({from:i,to:j,eth:s.eth[i],pop:n,year:s.year,home:i,cause:'coalition breakup'});s.societyCounters.scatteredClans+=n;return n;
}
function dissolveConfederation(o,reason='Succession disputes and failed rewards dissolve the coalition.'){
  const s=S;if(!o.alive||o.kind!=='horde')return false;const cells=polCells(o.id),total=cells.reduce((n,i)=>n+s.pop[i],0),army=o.army;
  endForeignServiceOf(o);const recipients=new Set();
  for(const i of cells){s.pol[i]=0;s.autonomy[i]=0.9;s.integ[i]*=0.4;s.food[i]+=s.depot[i];s.depot[i]=0}
  s.food[o.capital]+=o.grain;o.grain=0;
  for(const i of cells){if(s.pop[i]<200)continue;
    const queue=[[i,0]],seen=new Set([i]),destinations=[];
    for(let at=0;at<queue.length&&at<45;at++){const [j,depth]=queue[at];if(depth>=3)continue;
      for(let d=0;d<4;d++){const next=WD.nb[j*4+d];if(next<0||!WD.land[next]||seen.has(next)||WD.rough[next]>0.85)continue;seen.add(next);
        const host=s.pol[next]?s.pols[s.pol[next]]:null;if(host?.enemies.has(o.id))continue;
        if(wallStrength(next)>0.6&&host&&!host.allies.includes(o.id)&&host.rights<0.5)continue;queue.push([next,depth+1]);
        if(!host?.alive||host.id===o.id||s.pop[next]>=s.K[next]*0.95)continue;
        if(host.kind==='state'&&(s.urban[next]<1000||host.rights<0.3||host.health<0.45||s.nutrition[next]<0.85))continue;
        if(host.kind==='horde'&&(host.hunger>0.2||host.coalition<0.35))continue;
        destinations.push({cell:next,host,score:(host.kind==='state'?0.6:0.5)+host.health*0.25-depth*0.12+s.r()*0.15});
      }
    }
    destinations.sort((a,b)=>b.score-a.score);
    // Several destinations may receive different contingents; the remaining
    // households stay as autonomous clans rather than disappearing with a flag.
    const base=s.pop[i];for(const target of destinations.slice(0,2)){
      const host=target.host,requested=base*(0.08+s.r()*0.12);
      const agreement=host.kind==='state'?createSettlementAgreement(host,i,target.cell,requested,WD.sH[target.cell]*s.rangeStock[target.cell]>s.farm[target.cell]*farmSuit(target.cell)?'pastoral':'farm'):null;
      const moved=host.kind==='state'?(agreement?.people||0):scatterClanHouseholds(i,target.cell,requested);if(!moved)continue;
      if(host.kind==='horde')host.pop+=moved;else s.societyCounters.scatteredClans+=moved;recipients.add(host.id);
      if(host.kind==='horde'){host.army+=army*moved/Math.max(1,total);host.clanTerms.set(s.clan[i],{loyalty:0.5,joined:s.year});s.societyCounters.clansJoiningConfederations+=moved}
      else s.societyCounters.clansReceivedByCities+=moved;
    }
  }
  o.army=o.staff=o.navy=0;o.alive=false;o.died=s.year;o.succ=[...recipients];o.departed=true;
  for(const [id] of o.enemies)s.pols[id]?.enemies.delete(o.id);o.enemies.clear();
  for(const id of o.allies){const p=s.pols[id];if(p)p.allies=p.allies.filter(q=>q!==o.id)}
  s.alive=s.alive.filter(id=>id!==o.id);s.fallen.push(o);s.societyCounters.confederationBreakups++;
  chron('fall',`The ${o.full} breaks apart. ${reason} Some households seek new patrons or settlement near cities; others remain in autonomous clans.`,o.capital,[R_(o),...[...recipients].map(id=>R_(s.pols[id]))]);return true;
}
