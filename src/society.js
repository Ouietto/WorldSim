/* Material economy and institutions. Food units are one person's annual ration.
   Stocks belong to households, governments or people in transit; transfers never
   create food or settlers. K remains potential carrying capacity, not a harvest. */
const SOCIAL_TECH=['storage','records','census','post','office','succession','charter','canal','school'];
function skill(i,k){return TI[k]==null?0:S.tk[TI[k]][i]}
function recordSkill(i){return Math.max(S.admin[i],skill(i,'records')*0.85)}
function initSociety(){
  const s=S,w=WD;
  for(const k of ['food','young','harvest','levy','need','nutrition','organisation','autonomy','unrest','infrastructure','node','flow','urban','ancestryMix','newcomers'])s[k]=new Float64Array(N);
  s.settleLag=new Uint8Array(N);s.colonyBad=new Uint8Array(N);s.colonyHome=new Int32Array(N).fill(-1);
  s.ancestry=Int32Array.from(s.eth);s.ancestry2=new Int32Array(N).fill(-1);s.civicPol=new Int32Array(N);
  s.tradeEdges=[];s.realmCells=new Map();s.communities=[];s.economyMetrics={};
  s.societyCounters={nonStateBattles:0,displacements:0,settlements:0,sponsoredSettlements:0,failedSettlements:0};
  for(const i of w.landIdx){s.food[i]=s.pop[i]*0.45;s.young[i]=s.pop[i]*0.32;s.nutrition[i]=1;s.organisation[i]=0.04;s.autonomy[i]=0.75;s.infrastructure[i]=0.15}
  initDynamics();initEcology();
}
function initInstitutions(o,from){
  const s=S,c=o.capital,p=Math.max(1,o.pop),org=s.organisation[c]||0.05;
  o.central=from?from.central*0.9:0.18+org*0.2;o.bureau=from?from.bureau*0.85:0.04+recordSkill(c)*0.08;
  o.rights=from?from.rights:clamp(0.25+org*0.35,0,1);o.nobles=from?from.nobles:0.65;
  o.succession=from?from.succession*0.9:0.12;o.trust=from?Math.max(0.2,from.trust*0.85):0.5;
  o.health=from?Math.max(0.35,from.health):0.85;o.strain=0;o.arrears=0;o.payroll=1;o.grain=0;
  o.ineq=from?from.ineq*0.9:0.25;o.cplx=0.2;o.comm=0.12;
  // A breakaway can be visited by the political loop in the year it is born,
  // before its first harvest/budget pass. All flow fields need valid defaults.
  o.hunger=0;o.collected=0;o.output=0;o.rents=0;o.trade=0;o.network=0;o.burden=0;o.fiscalDue=0;o.tax=0;o.coalition=0.55;o.resilience=0.3;o.integ=0.7;o.recruitable=p*0.4;
  o.staff=0;o.army=0;o.armyFree=0;o.defFree=0;o.navy=0;o.navyFree=0;o.campaigns=0;o.civilRisk=0;o.relief=0;o.lastReform=-1e9;
  o.gov=from?from.gov:o.rel>=0&&org>0.45?'Temple':org>0.4&&s.r()<0.65?'Council':'Patrimonial';o.legacy=from?from.legacy||from.id:o.restores||o.id;
  o.groups={nobles:{power:o.nobles,loyalty:0.55},officials:{power:o.bureau,loyalty:0.65},merchants:{power:0.1,loyalty:0.55},clergy:{power:0.15,loyalty:0.6}};
  if(!from){const levy=Math.min(s.food[c]*0.15,p*0.08);s.food[c]-=levy;o.grain=levy}
  o.heir=null;o.reforms=[];
  initPoliticalDynamics(o,from);
}
function hasLegacy(o,i){return S.civicPol[i]>0&&S.civicPol[i]===(o.legacy||o.id)}
function transportAccess(i,o){
  const s=S,back=s.returnDist[i]>=65534?40:s.returnDist[i]*0.5;
  const response=(dd(i)+back)*0.5,bulk=s.supplyDist[i]>=65534?80:s.supplyDist[i]*0.5;
  return clamp(Math.exp(-response/Math.max(2,o.h||P.reach))*(0.35+0.65*o.health)*
    (0.3+0.7*Math.exp(-bulk/Math.max(3,(o.h||P.reach)*1.5))),0.015,1);
}
function taxCapacity(i,o){
  const s=S,ag=s.farm[i],grain=foodStorability(i),records=recordSkill(i);
  // Labour services, livestock and commercial dues remain possible without grain.
  const appropriation=clamp(0.25+0.5*grain+0.15*records+0.1*s.herd[i],0,1);
  const compliance=clamp(0.45+0.35*o.trust+0.2*o.rights-0.25*s.unrest[i],0.1,1);
  return (0.045+0.10*o.central+0.035*o.bureau)*(0.45+0.55*ag)*appropriation*compliance*
    transportAccess(i,o)*(0.4+0.6*s.integ[i])*(1-0.55*s.autonomy[i])*(1-0.35*o.nobles*s.eliteStake[i]);
}
function foodStocks(){let n=governmentFood();for(const i of WD.landIdx)n+=S.food[i];for(const id of S.alive)n+=S.pols[id].grain||0;for(const e of S.expeditions||[])if(!e.done)n+=e.food;return n}
function budgetPay(o,due){const n=Math.min(Math.max(0,o.grain),Math.max(0,due));o.grain-=n;return n}
function economyPass(){
  const s=S,w=WD,a={start:foodStocks(),harvest:0,spoilage:0,consumed:0,fodder:0,transportLoss:0,end:0};
  s.realmCells=new Map();s.foodImports.fill(0);
  for(const id of s.alive){const o=s.pols[id];
    if(s.pol[o.capital]!==o.id){s.depot[o.capital]+=o.grain;o.grain=0}
    o.collected=0;o.output=0;o.hunger=0;o.rents=0;o.relief=0;o.trade=0;o.campaigns=0;o.recruitable=0;const spoil=(o.grain||0)*(0.16-0.10*skill(o.capital,'storage')-0.025*s.granaries[o.capital]);o.grain=Math.max(0,(o.grain||0)-spoil);a.spoilage+=spoil}
  for(const i of w.landIdx){
    const p=s.pop[i],id=s.pol[i],o=id?s.pols[id]:null;s.levy[i]=0;s.harvest[i]=0;s.need[i]=p;s.flow[i]*=0.7;
    if(o){let cs=s.realmCells.get(id);if(!cs)s.realmCells.set(id,cs=[]);cs.push(i)}
    const depotSpoil=s.depot[i]*(0.20-0.12*skill(i,'storage')-0.03*s.granaries[i]);s.depot[i]-=depotSpoil;a.spoilage+=depotSpoil;
    const spoil=s.food[i]*(0.28-0.19*skill(i,'storage')-0.025*s.granaries[i]);s.food[i]-=spoil;a.spoilage+=spoil;
    if(p<1){a.spoilage+=s.food[i];s.food[i]=0;s.nutrition[i]=1;continue}
    s.young[i]=clamp(s.young[i],0,p*0.65);
    const publicShare=o?((o.army||0)+(o.staff||0)+(o.navy||0)*20)/Math.max(1,o.pop):0;
    const labour=clamp(((p-s.young[i])/p-publicShare-s.civicLabor[i]-Math.min(0.12,s.urban[i]/p*0.2))/0.68,0.2,1.2)*(1-0.65*clamp(s.sickness[i],0,0.85));
    const productivity=1.23+0.16*s.farm[i]+0.08*s.iron[i]+0.06*s.manure[i];
    let h=Math.min(s.K[i],p*productivity*labour)*(1-0.55*s.raidDamage[i]);
    if(s.settleLag[i]){const share=clamp(s.newcomers[i]/p,0,1);h*=1-share*(0.8-0.45/(s.settleLag[i]+0.5));s.settleLag[i]--;if(!s.settleLag[i])s.newcomers[i]=0}
    s.harvest[i]=h;s.food[i]+=h;a.harvest+=h;
    const feed=animalFodder(i),fed=Math.min(s.food[i],feed);s.food[i]-=fed;a.fodder+=fed;s.animalFeed[i]=feed>0?fed/feed:1;
    if(o){const levy=Math.min(s.food[i],h*taxCapacity(i,o));s.food[i]-=levy;s.levy[i]=levy;depositPublic(o,i,levy);o.collected+=levy;o.output+=h;o.rents+=h*o.nobles*0.08;const loyalty=s.year-s.taken[i]<20?0.05:0.2+0.8*s.integ[i];o.recruitable+=p*clamp(s.maleShare[i]/0.49,0.1,1.1)*loyalty*(1-0.5*s.autonomy[i])*(0.4+0.6*o.trust)*(0.4+0.6*s.eliteLoyalty[i])}
  }
  regionalFreight(a);maintainWalls(a);
  // Tribute is a transfer of collected provisions, not a bonus per vassal.
  for(const id of s.alive){const o=s.pols[id],ov=o.over?s.pols[o.over]:null;if(ov&&ov.alive&&ov!==o){const n=tributeShipment(o,ov,o.collected*0.12);o.tributePaid=n}else o.tributePaid=0}
  for(const id of s.alive){
    const o=s.pols[id],cs=s.realmCells.get(id)||[],p=cs.reduce((n,i)=>n+s.pop[i],0);
    // Territorial losses happen after the annual political census. A government
    // that lost its last province must surrender its stores before budgeting,
    // rather than pay a ghost payroll that has no household recipients.
    if(p<=0){
      const holder=s.pol[o.capital]?s.pols[s.pol[o.capital]]:null;
      if(holder&&holder!==o)inheritConquest(holder,o);else{s.food[o.capital]+=o.grain;o.grain=0;o.staff=0;o.army=0;o.navy=0}
      o.payroll=0;o.fiscalDue=0;o.arrears=0;continue;
    }
    const due=(o.staff||0)*1.35+(o.army||0)*(0.55+0.45*o.central)+(o.navy||0)*35+p*(0.001+0.004*o.bureau+0.002*(o.fortN||0)/Math.max(1,o.cells));
    let paid=0;for(const i of cs){const local=budgetAt(o,i,due*s.pop[i]/Math.max(1,p));paid+=local;s.food[i]+=local}o.payroll=due>0?clamp(paid/due,0,1):1;o.arrears=Math.max(0,(o.arrears||0)*0.88+due-paid);
    o.burden=due/Math.max(1,o.collected);o.fiscalDue=due;
    // Salaries feed the same people counted in population, so return them to
    // household budgets. Their labour was already removed from production.
    o.localStores=cs.reduce((n,i)=>n+s.depot[i],0);
    if(o.rights+o.trust>0.9)for(const i of cs){
      const deficit=Math.max(0,s.need[i]*1.02-s.food[i]);if(!deficit)continue;
      const access=0.8+0.2*s.infrastructure[i],spent=budgetAt(o,i,Math.min(deficit/access,publicAvailable(o,i)*0.35));
      const delivered=spent*access;s.food[i]+=delivered;o.relief+=delivered;a.transportLoss+=spent-delivered;
    }
  }
  tradeFood(a);
  for(const i of w.landIdx){
    const p=s.pop[i],need=s.need[i];s.nutrition[i]=need>0?clamp(s.food[i]/need,0,1):1;
    const eat=Math.min(s.food[i],need);s.food[i]-=eat;a.consumed+=eat;
    const cap=p*(0.55+1.8*skill(i,'storage')+1.2*s.granaries[i]),excess=Math.max(0,s.food[i]-cap);s.food[i]-=excess;a.spoilage+=excess;
    if(s.pol[i])s.pols[s.pol[i]].hunger+=p*(1-s.nutrition[i]);
  }
  for(const id of s.alive){const o=s.pols[id];o.hunger/=Math.max(1,o.pop);o.treas=clamp(o.grain/Math.max(1,o.fiscalDue||o.pop*0.02)-o.arrears/Math.max(1,o.collected),-2,3);refreshForces(o)}
  militaryContractsYear();
  a.end=foodStocks();a.error=a.start+a.harvest-a.spoilage-a.consumed-a.fodder-a.transportLoss-a.end;s.accounts=a;
}
function populationStep(i,p,K,g){
  const s=S,n=s.nutrition[i],family=clamp(s.maleShare[i]/0.25,0.2,1),births=p*(0.020+g*Math.max(0,1-p/Math.max(1,K)))*clamp(0.45+0.55*n,0,1)*family;
  const deaths=p*(0.020+0.16*Math.pow(1-n,1.5));
  const young=s.young[i],mature=young/18;s.young[i]=clamp(young+births-mature-young*deaths/Math.max(1,p),0,Math.max(0,p+births-deaths));
  return Math.max(0,p+births-deaths);
}
function refreshForces(o){
  const c=o.capital,s=S,p=Math.max(1,o.pop),adult=clamp(1-(s.young[c]||0)/Math.max(1,s.pop[c]),0.35,0.8);
  const nobleL=o.groups?o.groups.nobles.loyalty:0.5;
  const target=(Math.min(p,Math.max(0,o.recruitable))*adult*(o.kind==='horde'?0.075:0.012+0.016*o.central+0.012*o.nobles*nobleL)+(o.auxiliaries||0))*clamp(0.3+0.7*o.payroll,0,1);
  o.army=Math.max(0,(o.army||0)+0.12*(target-(o.army||0)));o.armyFree=Math.max(0,o.army-(o.loanedTroops||0))*0.55;o.defFree=Math.max(0,o.army-(o.loanedTroops||0))*0.45;
  const fleetTarget=p*Math.min(1,(o.coastN||0)/Math.max(1,o.cells))*0.00012*s.sail[c]*(0.3+0.7*s.nav[c])*o.payroll;
  o.navy=Math.max(0,(o.navy||0)+0.1*(fleetTarget-(o.navy||0)));o.navyFree=o.navy;
  const commitments=p*(0.004+0.002*o.central)+Math.max(1,o.cells)*70+(o.borderLoad||0)*45+o.conquestLoad*p*0.001;
  const personnel=o.staff*4+p*o.nobles*(o.coalition||0.5)*0.002;
  o.occupation=Math.max(0,Math.min(o.collected*0.15,personnel-commitments));
}
function fieldDefense(j,commit){
  const s=S,id=s.pol[j],o=id?s.pols[id]:null,p=s.pop[j];
  const mobility=1+2.2*pastoralMobility(j)*WD.rangeExposure[j]+s.defensePact[j]*s.organisation[j];
  if(!o)return Math.pow(p*(0.015+0.035*s.organisation[j])+1,P.scaleExp)*(0.4+0.6*s.s[j])*milAt(j)*(1+WD.rough[j])*(1+1.5*settlementDefense(j))*mobility;
  const stake=0.7+0.6*s.eliteStake[j]*s.eliteLoyalty[j]+s.cityIdentity[j]*0.3;
  const local=p*(0.008+0.018*s.integ[j])*(0.4+0.6*o.health)*stake,reserve=Math.min(o.defFree||0,(o.army||0)/Math.max(2,o.nb.size+1))*transportAccess(j,o);
  if(commit)o.defFree=Math.max(0,o.defFree-reserve);
  return Math.pow(local+reserve+1,P.scaleExp)*(0.4+0.3*o.S+0.3*s.s[j])*milAt(j)*(1+1.6*WD.rough[j])*(1+2.5*settlementDefense(j))*mobility*(0.55+0.3*o.preparedness+0.15*o.crisisMemory);
}
function campaignForce(o,i,sea){
  const share=Math.max(300,((o.army||0)+(o.foreignFree||0))/Math.max(2,o.nb.size+1));
  const force=Math.min((o.armyFree||0)+(o.foreignFree||0),share,sea?(o.navyFree||0)*80:Infinity);
  const cost=force*(0.12+dd(i)*0.025+(sea?0.22:0)),ratio=cost>0?Math.min(1,publicAvailable(o,i)/cost):0;
  if(force*ratio<100)return 0;
  const allocated=force*ratio,native=Math.min(o.armyFree||0,allocated),foreign=drawForeignTroops(o,i,allocated-native);
  o.armyFree-=native;o.campaignAuxShare=foreign/Math.max(1,native+foreign);budgetAt(o,i,cost*ratio);o.campaigns++;
  S.martialPractice[i]+=(native+foreign)/Math.max(500,S.pop[i])*2;
  if(sea)o.navyFree=Math.max(0,o.navyFree-allocated/80);
  return allocated*transportAccess(i,o);
}
function armyLoss(o,i,n,auxShare=0){
  if(auxShare>0)foreignCasualties(o,n*auxShare);n*=1-auxShare;
  const s=S,killed=Math.min(o.army||0,Math.max(0,n));o.army=Math.max(0,o.army-killed);
  o.armyFree=Math.min(o.armyFree||0,o.army*0.55);o.defFree=Math.min(o.defFree||0,o.army*0.45);
  let left=killed;const lose=(c,cap)=>{const adult=Math.max(0,s.pop[c]-s.young[c]),men=adult*s.maleShare[c],x=Math.min(left,cap,men);s.pop[c]-=x;s.maleShare[c]=clamp((men-x)/Math.max(1,adult-x),0,1);left-=x};
  for(const c of new Set([i,o.capital])){if(s.pol[c]!==o.id)continue;lose(c,s.pop[c]*0.2)}
  // Losses beyond the local contingent are drawn from its actual recruitment base.
  if(left>0)for(const c of s.realmCells.get(o.id)||[]){lose(c,s.pop[c]*0.05);if(left<1)break}
}
function frontierReady(o,i,j){
  if(o.kind==='horde')return true;
  const s=S,local=s.pop[i],settlement=s.pop[j]<1000,support=frontierTransport(i,j),resistance=(1+2*WD.rangeExposure[j]*pastoralMobility(j))*(1+0.6*s.forest[j]+0.5*WD.rough[j]);
  return frontierHoldable(o,i,j)&&local>=4000&&o.pop>=25000/(0.2+0.8*support)&&o.health>0.4&&o.occupation>=Math.max(200,s.pop[j]*0.015)*resistance&&
    transportAccess(i,o)>0.18&&(!settlement||publicAvailable(o,i)>800&&o.central+o.bureau>0.4);
}
function foundSettlement(i,j,requested,sponsor){
  const s=S,w=WD;if(i===j||!w.land[j]||s.pop[i]<30)return 0;
  const empty=s.pop[j]<1,clearing=empty?0.25+0.7*s.forest[j]+0.4*w.rough[j]:0.08;
  const journey=Math.max(0,Math.hypot(dxWrap(i,j),w.cyA[j]-w.cyA[i])-1)*0.02;
  const provisions=empty?0.85+clearing:0.2,stock=s.food[i]+(sponsor?publicAvailable(sponsor,i)*0.15:0);
  let n=Math.min(requested,s.pop[i]*0.2,stock/(provisions+0.15+journey));if(empty&&n<30)return 0;if(n<1)return 0;
  const cost=n*(provisions+0.15+journey),homePaid=Math.min(s.food[i],cost);s.food[i]-=homePaid;if(sponsor)budgetAt(sponsor,i,cost-homePaid);
  diseaseJourney(i,j,travelDays(i,j,!!(w.coast[i]&&w.coast[j])),n,'migration');
  const priorImmunity=diseaseHistory(i);const before=s.pop[j],age=s.young[i]*n/s.pop[i],animals=takeHerd(i,n/s.pop[i]);s.young[i]-=age;s.young[j]+=age;s.pop[i]-=n;s.pop[j]+=n;s.food[j]+=n*provisions;putHerd(j,animals);
  if(empty)s.societyCounters.settlements++;if(sponsor)s.societyCounters.sponsoredSettlements++;
  if(empty){s.eth[j]=s.eth[i];s.ancestry[j]=s.ancestry[i];s.eth2[j]=-1;s.rel[j]=s.rel[i];s.s[j]=s.s[i];s.adapt[j]=s.adapt[i];s.organisation[j]=s.organisation[i]*0.45;s.infrastructure[j]=0;s.settleLag[j]=1+Math.floor(clearing*2);s.colonyHome[j]=i}
  else{mergeCulture(j,s.eth[i],n,before);mergeAncestry(j,s.ancestry[i],n,before)}
  s.newcomers[j]+=n;if(!empty&&n>before*0.02)s.settleLag[j]=Math.max(1,s.settleLag[j]);
  transferCrops(i,j);mixDiseaseHistory(j,priorImmunity,n,before);if(sponsor)recordFrontierPressure(sponsor,j,0.12);
  for(let k=0;k<s.tk.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][i]*0.8);
  if(sponsor){conquestRecorded(sponsor,j,s.pol[j]);s.pol[j]=sponsor.id;s.integ[j]=0.2;s.taken[j]=s.year;s.dist[j]=Math.min(65534,s.dist[i]+Math.round(routeCost(i,j,sponsor,false)*2));sponsor.occupation=Math.max(0,sponsor.occupation-500)}
  return n;
}
function mergeCulture(i,e,n,old){
  const s=S;if(e<0||n<=0)return;
  if(s.eth[i]===e){if(s.eth2[i]>=0)s.mix[i]*=old/(old+n);return}
  const previousMinority=s.eth2[i]===e?old*s.mix[i]:0,share=(previousMinority+n)/(old+n);
  if(share>0.5){const prior=s.eth[i];s.eth[i]=e;s.eth2[i]=prior;s.mix[i]=1-share}else{s.eth2[i]=e;s.mix[i]=share}s.mixT[i]=0;
}
function mergeAncestry(i,e,n,old){
  const s=S;if(e<0)return;if(s.ancestry[i]<0||old<1){s.ancestry[i]=e;s.ancestry2[i]=-1;s.ancestryMix[i]=0;return}
  if(s.ancestry[i]===e){s.ancestryMix[i]*=old/(old+n);return}
  const share=((s.ancestry2[i]===e?old*s.ancestryMix[i]:0)+n)/(old+n);
  if(share>0.5){s.ancestry2[i]=s.ancestry[i];s.ancestry[i]=e;s.ancestryMix[i]=1-share}else{s.ancestry2[i]=e;s.ancestryMix[i]=share}
}
function householdMigration(){
  const s=S,w=WD,r=s.r,L=w.landIdx;
  for(let z=0;z<L.length;z++){
    const i=L[(s.year&1)?L.length-1-z:z],p=s.pop[i];if(p<30)continue;
    const j=w.nb[i*4+((r()*4)|0)];if(j<0||!w.land[j]||w.T[j]<-9)continue;
    if(s.colonyHome[i]>=0&&s.nutrition[i]<0.65){s.colonyBad[i]++;if(s.colonyBad[i]>=2){s.societyCounters.failedSettlements++;const home=s.colonyHome[i];if(w.land[home]&&s.pop[home]>=1){const n=s.pop[i]*0.6,old=s.pop[home],young=s.young[i]*0.6;s.pop[i]-=n;s.pop[home]+=n;s.young[i]-=young;s.young[home]+=young;mergeCulture(home,s.eth[i],n,old);mergeAncestry(home,s.ancestry[i],n,old);s.food[home]+=s.food[i]*0.6;s.food[i]*=0.4;putHerd(home,takeHerd(i,0.6))}s.colonyHome[i]=-1}}else s.colonyBad[i]=0;
    const pr=p/Math.max(1,s.K[i]),prj=s.pop[j]/Math.max(1,s.K[j]),diff=pr-prj;
    const owner=s.pol[i]?s.pols[s.pol[i]]:null;
    const attraction=settlementAppeal(i,j,owner),pull=Math.max(0,attraction-1)*0.1;
    if(diff+pull<0.15||pr<0.55)continue;
    // Privately funded movement is possible across political boundaries.
    let n=p*P.migration*(0.012+0.04*s.herd[i])*(diff+pull)/(1+diff+pull)*attraction;if(s.pol[j]&&s.pol[j]!==s.pol[i])n*=0.35;
    if(owner&&!s.pol[j])n*=1+owner.nobles*0.3+owner.hunger;
    foundSettlement(i,j,n,null);
  }
}
function buildTradeNetwork(){
  const s=S,w=WD;s.tradeEdges=[];s.node.fill(0);const nodes=[];
  for(const i of w.landIdx){if(s.pop[i]<2000)continue;let rivers=0,roads=0;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]){if(w.rv[j]>0.25)rivers++;if(s.roads[j]>0.4)roads++}}
    const urban=s.urban[i]>1000?0.4:0,port=w.coast[i]&&s.sail[i]>0.3?0.5:0;
    const score=clamp(port+0.25*w.rv[i]+(rivers>=3?0.2:0)+roads*0.06*s.roads[i]+s.car[i]*0.4+urban,0,1);
    if(score>0.22){s.node[i]=score;nodes.push(i)}
  }
  const added=new Map();const edge=(a,b,cost,capacity,reverseCost=cost,via=[])=>{
    if(a===b)return;const key=a<b?a+':'+b:b+':'+a,prior=added.get(key);
    if(prior){const forward=prior.a===a?cost:reverseCost,reverse=prior.a===a?reverseCost:cost;
      if(forward<prior.cost||reverse<prior.reverseCost){prior.cost=Math.min(prior.cost,forward);prior.reverseCost=Math.min(prior.reverseCost,reverse);prior.via=via}
      prior.capacity=Math.max(prior.capacity,capacity);return;
    }
    const e={a,b,cost,reverseCost,capacity,via};added.set(key,e);s.tradeEdges.push(e);
  };
  // Small local exchange; bulk traffic needs an actual river, port or road node.
  for(const i of w.landIdx){if(s.pop[i]<100)continue;for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.pop[j]<100||j<i)continue;
    const linked=Math.min(s.node[i],s.node[j]),road=Math.min(s.roads[i]*s.infrastructure[i],s.roads[j]*s.infrastructure[j]);
    const owner=s.pol[i]?s.pols[s.pol[i]]:{kind:'community'},support=Math.min(transportSupport(i),transportSupport(j));
    const cost=routeCost(i,j,owner,true)*0.018,reverse=routeCost(j,i,owner,true)*0.018,cap=Math.min(s.pop[i],s.pop[j])*(0.002+(0.045*linked+0.015*road)*(0.2+0.8*support));
    edge(i,j,cost,cap,reverse)}}
  for(const i of nodes){
    if(w.riverNav[i]>0.15){let j=i,cost=0,reverse=0;const via=[];
      for(let k=0;k<12;k++){const prev=j;j=w.down[j];if(j<0||!w.land[j]||w.riverNav[j]<0.15)break;via.push(j);
        const owner=s.pol[i]?s.pols[s.pol[i]]:{kind:'community'};cost+=routeCost(prev,j,owner,true)*0.018;reverse+=routeCost(j,prev,owner,true)*0.018;
        if(s.node[j]>0.22){edge(i,j,cost,Math.min(s.pop[i],s.pop[j])*0.07*Math.min(riverBoats(i),riverBoats(j)),reverse,via);break}
      }
    }
    if(w.coast[i]&&s.sail[i]>0.4)for(let k=w.ls[i];k<w.ls[i+1];k++){const j=w.lt[k];if(s.node[j]>0.22&&s.sail[j]>0.3&&(w.ld[k]<=3||s.nav[i]>0.5))edge(i,j,0.025*w.ld[k],Math.min(s.pop[i],s.pop[j])*0.08*s.sail[i])}
  }
}
function tradeFood(accounts){
  const s=S;for(const e of s.tradeEdges){
    const a=s.food[e.a]/Math.max(1,s.need[e.a])>s.food[e.b]/Math.max(1,s.need[e.b])?e.a:e.b,b=a===e.a?e.b:e.a;
    const source=Math.max(0,s.food[a]-s.need[a]*1.08),demand=Math.max(0,s.need[b]*1.08-s.food[b]);
    const pa=s.pol[a]?s.pols[s.pol[a]]:null,pb=s.pol[b]?s.pols[s.pol[b]]:null;
    if(pa&&pb&&(pa.enemies.has(pb.id)||pb.enemies.has(pa.id)))continue;
    const safe=Math.min(pa?0.3+0.7*pa.health:0.5+s.organisation[a]*0.3,pb?0.3+0.7*pb.health:0.5+s.organisation[b]*0.3);
    if(e.via&&e.via.some(i=>{const o=s.pol[i]?s.pols[s.pol[i]]:null;return o&&(pa&&o.enemies.has(pa.id)||pb&&o.enemies.has(pb.id))}))continue;
    const cost=a===e.a?e.cost:(e.reverseCost==null?e.cost:e.reverseCost);
    const loss=clamp(cost+(1-safe)*0.2,0.01,0.75),n=Math.min(source,demand/(1-loss),Math.max(0,e.capacity-(e.freightUsed||0))*safe*epidemicTravelFactor(a,b)*civicTradeAccess(a,b));
    if(n<=0)continue;e.privateUsed=(e.privateUsed||0)+n;s.food[a]-=n;s.food[b]+=n*(1-loss);s.foodImports[b]+=n*(1-loss)*(pb?0.98:1);accounts.transportLoss+=n*loss;s.flow[a]+=n;s.flow[b]+=n;
    // A small toll is physically taken out of the delivered consignment.
    if(pb){const toll=n*(1-loss)*0.02;s.food[b]-=toll;depositPublic(pb,b,toll);pb.trade+=toll;pb.collected+=toll}
  }
}
function communityPass(){
  const s=S,w=WD,r=s.r;
  for(const i of w.landIdx){
    const p=s.pop[i];if(p<100){s.organisation[i]*=0.98;continue}
    s.raiding[i]*=0.985;
    const surplus=s.food[i]/p,pressure=p/Math.max(1,s.K[i]);
    const demand=clamp(0.15+0.25*w.rv[i]+0.3*s.node[i]+0.3*pressure,0,1);
    const investment=Math.min(s.food[i]*0.08,p*0.015)*clamp(surplus*3,0,1);s.food[i]-=investment;
    s.organisation[i]=clamp(s.organisation[i]+0.04*(investment/Math.max(1,p))*(0.3+demand)+0.002*demand*s.nutrition[i]-0.01*(1-s.nutrition[i]),0,1);
    // Infrastructure is a maintained stock, separate from knowing road-building.
    const o=s.pol[i]?s.pols[s.pol[i]]:null,pay=o?o.payroll:s.organisation[i]*0.5;
    localPolitics(i,o);
    s.infrastructure[i]=clamp(s.infrastructure[i]+0.015*pay*(0.2+s.roads[i]+skill(i,'canal'))*(1-s.infrastructure[i])-0.02*(1-pay)*s.infrastructure[i],0,1);
    if(!s.pol[i]&&s.farm[i]>0.3&&surplus>0.1){
      for(const k of ['storage','records']){const ix=TI[k];if(s.tk[ix][i]<0.5&&r()<0.025*P.invent*(0.2+s.organisation[i])){seedTech(s.tk[ix],i,0.8,0);firstTech(ix,i,null)}}
      if(s.rel[i]<0&&s.organisation[i]>0.4&&r()<0.0008*P.faith)foundLocalFaith(i);
    }
    if(o){
      const localPower=0.25+0.5*o.nobles+0.25*s.organisation[i],centre=o.central*o.health*(0.3+0.7*o.payroll)*transportAccess(i,o);
      s.autonomy[i]=clamp(s.autonomy[i]+0.025*(localPower-centre-s.autonomy[i]*0.4),0.05,0.95);
      s.unrest[i]=clamp(s.unrest[i]+0.08*(1-s.nutrition[i])+0.035*(1-o.payroll)+0.015*Math.max(0,o.ineq-0.5)-0.025*o.trust*o.rights,0,1);
      // Remote provincial networks become alternative centres when salaries fail.
      if(i!==o.capital&&o.health<0.45&&s.autonomy[i]>0.7&&s.unrest[i]>0.3&&s.organisation[i]>0.35&&s.year-(o.lastDefection||-1e9)>8&&r()<0.08){
        const id=newPolity(i,o,{origin:{type:'rebellion',from:o.id,why:'Local chiefs and officials withhold revenue as central protection and salaries fail.'}}),p0=s.pols[id];
        for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&s.pol[j]===o.id&&j!==o.capital&&s.autonomy[j]>0.6)s.pol[j]=id}
        partitionInstitutions(o,[p0]);o.lastDefection=s.year;o.shock+=0.08;
        chron('fall',`Provincial authorities in ${p0.base} stop remitting taxes and break away from the ${o.full}.`,i,[R_(o),R_(p0)]);
      }
    }
  }
  nonStateConflict();
}
function foundLocalFaith(c){
  const s=S,r=s.r,e=s.eths[s.eth[c]];if(!e)return;
  const person=newRuler(e.lang,null),f=figFor(null,person,'prophet');f.eth=e.id;f.pol=0;f.title='Keeper of a communal sanctuary';
  const id=s.rels.length,R={id,name:'the '+cap(e.lang.lex.god)+' Covenant',founder:f.id,born:s.year,origin:c,holy:c,pol:0,eth:e.id,fam:e.fam,kind:'ethnic',miss:0.15,cent:0.15,holder:0,rgb:hsl(r()*360,0.55,0.48),parent:-1,kids:[],cells:1,pop:s.pop[c],peak:1,alive:true,states:[],councils:0};
  s.rels.push(R);s.rel[c]=id;f.rel=id;chron('faith',`Communities of the ${e.name} maintain a shared sanctuary and ${R.name}.`,c,[RE(e),RR(R)]);
}
function institutionStep(o,c,y){
  const s=S,r=s.r;if(o.central==null)initInstitutions(o,null);
  const rec=recordSkill(c),office=skill(c,'office'),census=skill(c,'census'),school=skill(c,'school');
  o.comm=clamp(0.08+0.2*rec+0.18*skill(c,'post')*(0.2+0.8*s.mounts[c])+0.12*s.mounts[c]+0.12*s.roads[c]*s.infrastructure[c]+0.14*waterTransport(c)+0.12*skill(c,'canal')*s.infrastructure[c],0,1);
  const targetStaff=o.pop*(0.001+0.004*rec+0.003*office+0.002*census),training=Math.max(0,targetStaff-o.staff)*0.025*o.payroll;
  const trained=budgetPay(o,training*2)/2;o.staff=Math.max(0,o.staff+trained-o.staff*(0.012+0.03*(1-o.payroll)));
  const targetB=(0.1+0.25*rec+0.2*office+0.15*census+0.15*school+0.15*s.law[c])*Math.min(1,o.staff/Math.max(1,targetStaff*0.65))*o.payroll;
  o.bureau=clamp(o.bureau+0.012*(targetB-o.bureau),0,1);
  const security=clamp(0.3+0.35*o.health+0.35*o.payroll-o.hunger,0,1);
  const trustTarget=clamp(0.25+0.3*o.rights+0.25*security+0.2*o.mandate-0.2*o.ineq,0,1);o.trust=clamp(o.trust+0.018*(trustTarget-o.trust),0,1);
  o.succession=clamp(o.succession+0.006*(skill(c,'succession')*(0.4+0.6*o.trust)-o.succession),0,1);
  o.rights=clamp(o.rights+0.003*(skill(c,'charter')*(0.4+0.6*o.nobles)-o.rights),0.08,0.9);
  const G=o.groups;
  G.nobles.power=o.nobles;G.nobles.loyalty=clamp(0.25+0.35*o.rights+0.3*security-0.2*o.central,0,1);
  G.officials.power=o.bureau;G.officials.loyalty=clamp(0.15+0.65*o.payroll+0.2*o.succession,0,1);
  G.merchants.power=clamp((o.trade||0)/Math.max(1,o.collected)*3+0.15*s.node[c],0.05,0.6);G.merchants.loyalty=clamp(0.2+0.5*security+0.3*o.rights,0,1);
  G.clergy.power=clamp(0.1+0.3*(o.rel>=0?s.rels[o.rel].cent:0),0,0.5);G.clergy.loyalty=clamp(0.3+0.3*o.mandate+0.2*o.rights,0,1);
  o.coalition=Object.values(G).reduce((n,g)=>n+g.power*g.loyalty,0)/Math.max(0.01,Object.values(G).reduce((n,g)=>n+g.power,0));
  if(o.kind==='horde')o.coalition=clamp(o.coalition*0.45+(o.clanCohesion??0.6)*0.55,0,1);
  // Connected territory creates a reason to standardize, rather than a named-region bonus.
  const networkDemand=clamp((o.network||0)*0.25+(o.corridor||0)*0.45+Math.min(1,o.cells/60)*0.15+o.comm*0.15,0,1);
  o.central=clamp(o.central+0.0015*(0.15+o.bureau*0.6+networkDemand*0.25-o.central)*o.payroll-0.001*(1-o.payroll)*o.nobles,0.08,0.95);
  const support=G.officials.power*G.officials.loyalty+G.merchants.power*G.merchants.loyalty+G.clergy.power*G.clergy.loyalty*0.3;
  if(y-o.lastReform>60&&o.ruler.comp>0.68&&o.health>0.7&&o.trust>0.5&&o.bureau>0.15&&o.grain>o.pop*0.12&&support>o.nobles*0.4&&r()<0.004*P.invent){
    budgetPay(o,o.pop*0.10);o.central=clamp(o.central+0.07,0,1);o.nobles=Math.max(0.15,o.nobles-0.06);o.health-=0.08;o.shock+=0.1;o.lastReform=y;o.reforms.push(y);
    o.gov=o.central>0.5?'Bureaucratic':o.rights>0.5?'Council':'Patrimonial';
    chron('culture',`${cap(rulerName(o))} wins support for new salaried offices in the ${o.full}, reducing the authority of hereditary intermediaries.`,c,[R_(o)],'Reserves, trained replacements and a supporting coalition make a costly reform possible.');
  }
  strategicStep(o,c,y);
  const stress=clamp(0.45*(1-o.payroll)+0.3*o.hunger+0.25*Math.min(1,o.arrears/Math.max(1,o.collected))+0.2*Math.max(0,0.5-o.coalition)+0.12*Math.max(0,o.md/Math.max(1,o.h)-1)+0.08*o.conquestLoad,0,1);
  o.strain=clamp(o.strain+0.025*(stress-o.strain),0,1);
  const resilience=0.2+0.25*o.bureau+0.2*o.succession+0.2*o.trust+0.15*o.comm;
  const targetHealth=clamp(1-o.strain*1.5-o.shock*0.18,0,1);
  o.health=clamp(o.health+0.025*(targetHealth-o.health)-0.012*Math.max(0,0.4-o.health)*(1-o.payroll),0.02,1);
  o.resilience=resilience;o.pT=Math.max(0,o.burden-1)*0.25;o.pF=clamp(o.arrears/Math.max(1,o.collected),0,3)*0.25;
  o.cplx=0.15+o.bureau*0.5+o.central*0.2+o.comm*0.15;
  o.ineq=clamp((o.ineq==null?0.25:o.ineq)+0.0007*(o.press-0.8)+0.0002*o.nobles-0.0003*o.rights*o.trust,0.15,0.92);o.pQ=Math.max(0,o.ineq-0.55)*(0.4+o.hunger);
  if(!o.heir&&y-o.ruler.birth>28){const h=newRuler(s.eths[o.core].lang,null);h.birth=y-Math.max(0,Math.min(y-o.ruler.birth-19,12+r()*8));h.death=Math.max(45,h.death);o.heir=h}
}
function selectSuccessor(o,L){
  const r=S.r;
  if(o.gov!=='Council'&&o.heir&&S.year-o.heir.birth>=14&&r()<0.3+0.65*o.succession){const h=o.heir;o.heir=null;h.since=S.year;h.mi=0;return h}
  o.heir=null;const candidates=[newRuler(L,o),newRuler(L,o),newRuler(L,o)];
  if(o.gov==='Council')candidates.sort((a,b)=>(b.comp+b.char)-(a.comp+a.char));
  return candidates[0];
}
function institutionalRisk(o){
  const resistance=0.35+(o.resilience||0.2)+(o.coalition||0.5)*0.3;
  const organized=(0.25+0.75*(o.comm||0.1))*(0.3+0.7*(o.nobles||0.5));
  return clamp(P.crisis*0.0015*Math.pow(Math.max(0,o.psi-0.5),2)*(0.2+o.strain*3)*(0.4+organized)/resistance*(o.island?0.65:1),0,0.9);
}
function partitionInstitutions(parent,children){
  endForeignServiceOf(parent);
  const s=S,ids=new Set(children.map(o=>o.id)),pops=new Map();let total=0;
  for(const i of WD.landIdx)if(s.pol[i]===parent.id||ids.has(s.pol[i])){pops.set(s.pol[i],(pops.get(s.pol[i])||0)+s.pop[i]);total+=s.pop[i]}
  const reserves=parent.grain,army=parent.army,armyFree=parent.armyFree,defFree=parent.defFree,staff=parent.staff,navy=parent.navy;
  for(const o of [parent,...children]){const share=(pops.get(o.id)||0)/Math.max(1,total);o.pop=pops.get(o.id)||0;o.grain=o===parent?reserves:0;o.army=army*share;o.armyFree=armyFree*share;o.defFree=defFree*share;o.staff=staff*share;o.navy=navy*share;o.lastCrisis=s.year;o.health=Math.max(0.35,o.health);o.strain*=0.65}
}
function inheritConquest(o,d){endForeignServiceOf(d);depositPublic(o,d.capital,d.grain||0);d.grain=0;o.staff+=(d.staff||0)*0.7;d.staff=0;o.army+=(d.army||0)*0.3;d.army=0;o.navy+=(d.navy||0)*0.5;d.navy=0}
function culturalIntegration(i,o){
  const s=S;if(s.eth[i]===o.core||s.eth[i]<0||o.conqDyn)return;
  const n=s.pop[i]*(0.0001+0.0007*skill(i,'school'))*o.trust*s.integ[i]*P.assim;
  if(n>0)mergeCulture(i,o.core,n,Math.max(1,s.pop[i]-n));
  // Political loyalty can cross language and ancestry boundaries.
}
function nonStateConflict(){
  const s=S,w=WD,r=s.r,L=w.landIdx;
  for(let k=0;k<Math.ceil(L.length/100);k++){
    const i=L[(r()*L.length)|0];if(s.pol[i]||s.pop[i]<2500||s.organisation[i]<0.25||s.eth[i]<0)continue;
    const j=w.nb[i*4+((r()*4)|0)];if(j<0||!w.land[j]||s.eth[j]<0||s.eth[j]===s.eth[i])continue;
    const motive=0.15+s.pop[i]/Math.max(1,s.K[i])+s.unrest[i];if(r()>0.08*P.warRate*motive)continue;
    const allies=[i];for(let d=0;d<4;d++){const c=w.nb[i*4+d];if(c>=0&&!s.pol[c]&&s.eth[c]===s.eth[i]&&s.organisation[c]>0.2)allies.push(c)}
    let people=0,food=0;for(const c of allies){people+=s.pop[c];food+=s.food[c]}
    const force=people*(0.025+0.03*s.herd[i])*s.organisation[i],attack=Math.pow(force+1,P.scaleExp)*milAt(i),def=fieldDefense(j,true);
    const cost=force*0.12;if(food<cost)continue;s.societyCounters.nonStateBattles++;for(const c of allies)s.food[c]=Math.max(0,s.food[c]-cost*s.food[c]/Math.max(1,food));
    if(r()<clamp(attack/(attack+def)-0.1,0.02,0.85)){
      s.raiding[i]=clamp(s.raiding[i]+0.025,0,1);
      const old=s.eth[j],violence=clamp(0.02+0.08*motive,0.02,0.18);s.pop[j]*=1-violence;displace(j,0.15+0.2*motive,0);
      const inv=s.pop[i]*0.12,young=s.young[i]*0.12,provisions=Math.min(s.food[i],inv*0.2),animals=takeHerd(i,0.12);s.pop[i]-=inv;s.young[i]-=young;s.young[j]+=young;s.food[i]-=provisions;s.food[j]+=provisions;const oldPop=s.pop[j];s.pop[j]+=inv;putHerd(j,animals);mergeCulture(j,s.eth[i],inv,oldPop);mergeAncestry(j,s.ancestry[i],inv,oldPop);s.settleLag[j]=1;s.newcomers[j]+=inv;
      if(s.pol[j]){s.pols[s.pol[j]].shock+=0.12;s.pol[j]=0}s.organisation[j]=Math.max(s.organisation[j],s.organisation[i]*0.7);s.unrest[j]=0.5;
      if(r()<0.25)chron('war',`An alliance of ${s.eths[s.eth[i]].name} communities defeats and displaces ${s.eths[old].name} neighbours.`,j,[RE(s.eths[s.eth[i]]),RE(s.eths[old])]);
      if(s.pop[i]>10000&&s.pop[i]/Math.max(1,s.K[i])>0.85&&s.activeMigs.length<12&&r()<0.25){
        const n=s.pop[i]*0.25,young=s.young[i]*0.25,animals=takeHerd(i,0.25);s.pop[i]-=n;s.young[i]-=young;const M=startMigration({eth:s.eth[i],pop:n,young,animals,cell:i,dx:dxWrap(i,j),dy:w.cyA[j]-w.cyA[i],kind:'warband',cause:'land'});M.food=Math.min(s.food[i],n);s.food[i]-=M.food;
      }
    }else{s.pop[i]=Math.max(0,s.pop[i]-force*0.15);s.raiding[i]*=0.9}
  }
}
function refugeePressure(e,amount,cell,byPol,fromMig,food,young,animals,ancestry){
  const s=S;if(e<0||amount<1)return;
  let p=s.press.get(e);if(!p){p={p:0,food:0,young:0,animals:emptyHerd(),y:s.year,cell,by:byPol,mig:fromMig};s.press.set(e,p)}
  if(!p.animals)p.animals=emptyHerd();if(animals)addHerd(p.animals,animals);
  if(ancestry!=null)p.ancestry=ancestry;
  const history=diseaseHistory(cell);p.immunity=history.map((v,k)=>((p.immunity?.[k]||0)*p.p+v*amount)/Math.max(1,p.p+amount));
  p.p+=amount;p.food+=food||0;p.young+=young||0;p.cell=cell;p.y=s.year;if(byPol)p.by=byPol;if(fromMig!=null)p.mig=fromMig;
  const threshold=clamp(localPop(cell)*0.15,4000,80000);
  if(p.p>=threshold&&s.activeMigs.length<20&&s.r()<0.25*P.wander){
    s.press.delete(e);const a=s.r()*Math.PI*2;
    const M=startMigration({eth:e,pop:p.p,cell,dx:Math.cos(a),dy:Math.sin(a),kind:'people',food:p.food,young:p.young,animals:p.animals});
    M.food=p.food;M.young=p.young;M.immunity=p.immunity;if(p.ancestry!=null){M.ancestry=p.ancestry;M.groups[0].ancestry=p.ancestry}
  }
}
function refugeePass(){
  const s=S;
  for(const [eth,p] of s.press){
    // Displaced people remain in the demographic ledger while awaiting movement.
    const eat=Math.min(p.food,p.p*0.7);p.food-=eat;p.p*=1-0.015-0.06*(1-eat/Math.max(1,p.p*0.7));p.young=Math.min(p.young,p.p*0.6);
    if(p.p<100||s.year-p.y>12){
      const old=s.pop[p.cell];s.pop[p.cell]+=p.p;s.food[p.cell]+=p.food;mergeCulture(p.cell,eth,p.p,old);mergeAncestry(p.cell,p.ancestry??eth,p.p,old);mixDiseaseHistory(p.cell,p.immunity,p.p,old);s.young[p.cell]+=p.young;putHerd(p.cell,p.animals);s.press.delete(eth);
    }
  }
}
function displacedPeople(j,frac,byPol){
  const s=S,n=s.pop[j]*clamp(frac,0,0.85);if(n<1)return 0;
  s.societyCounters.displacements+=n;
  const ratio=n/s.pop[j],food=s.food[j]*ratio,young=s.young[j]*ratio,animals=takeHerd(j,ratio),minority=s.eth2[j]>=0?s.mix[j]:0;s.pop[j]-=n;s.food[j]-=food;s.young[j]-=young;
  for(const [eth,share] of [[s.eth[j],1-minority],[s.eth2[j],minority]])if(eth>=0&&share>0)refugeePressure(eth,n*share,j,byPol,null,food*share,young*share,animals.map(v=>v*share),s.ancestry[j]);return n;
}
function migrationCampaign(M){
  const s=S,w=WD,r=s.r;if(M.done)return;
  const animals=M.animals.reduce((n,v)=>n+v,0),pasture=w.area[M.cell]*w.sH[M.cell]*0.15*Math.max(0,1-s.pop[M.cell]/Math.max(1,s.K[M.cell]));
  M.food+=Math.min(M.pop*0.35,animals*0.3,pasture);
  const supplied=Math.min(M.food||0,M.pop*0.7);M.food=Math.max(0,(M.food||0)-supplied);
  const survival=1+0.012-0.02-0.035*(1-supplied/Math.max(1,M.pop*0.7));scaleMigration(M,survival);
  for(let k=0;k<M.animals.length;k++)M.animals[k]*=clamp(0.97+0.04*animalSuitability(k,M.cell)-0.04*Math.max(0,0.5-s.wm[M.cell]),0.85,1.01);
  if(M.pop<250){disperse(M,'dwindled');return}
  let best=-1,score=-1e9;const origin=M.cell;
  if(M.kind==='horde'&&(M.routeYear==null||s.year-M.routeYear>=8||!M.route||!M.route.length)){
    const source=s.pols[M.pol]||{id:M.pol};M.route=migrationRoute(source,origin,Math.max(100,M.pop*0.09),240);M.routeYear=s.year;
  }
  while(M.route&&M.route[0]===origin)M.route.shift();const waypoint=M.route&&M.route[0];
  ring(origin,1,(j,dx,dy)=>{if(j===origin||!w.land[j]||w.T[j]<-9)return;
    const room=clamp((s.K[j]-s.pop[j])/Math.max(1,s.K[j]),-1,1),owner=s.pol[j]?s.pols[s.pol[j]]:null;
    const blocked=owner?M.blocked.get(owner.id)||0:0,force=M.pop*(M.kind==='people'?0.035:0.09);
    const danger=owner&&owner.id!==M.pol?fieldDefense(j,false)/Math.max(1,Math.pow(force+1,P.scaleExp)*M.S*M.mil):0;
    const value=(dx*M.dx+dy*M.dy)/Math.hypot(dx,dy)*(M.fails>1?0.4:0.9)+room*0.7-0.08*w.tcost[j]+r()*0.5-
      (M.path.slice(-18).includes(j)?1.4:0)-Math.min(2,danger*0.18)-blocked*0.4+(M.herd>0.4?w.sH[j]*pastureCondition(j)*0.7:0)-(s.pol[j]===M.pol?0:wallStrength(j)*3)-s.migrationPressure[j]*0.4+(j===waypoint?3:0);
    if(value>score){score=value;best=j}});
  if(best<0){settleMigration(M,origin,null);return}
  const j=best;if(!migrationWallPass(M,j)){M.fails++;turnMigration(M);return}
  const encounter=migrationNomadEncounter(M,j),q=s.pol[j],foreign=s.eth[j]>=0&&s.eth[j]!==M.eth&&s.pop[j]>1000;let won=encounter===true||!foreign&&(!q||q===M.pol);
  if(!won&&q&&r()<admissionChance(M,j,s.pols[q])*(M.kind==='people'?1:0.45))won=admitMigration(M,j,s.pols[q]);
  if(!won&&M.kind==='people'&&q&&r()<0.65){M.fails++;M.blocked.set(q,(M.blocked.get(q)||0)+1);turnMigration(M);return}
  if(!won){
    const force=M.pop*(M.kind==='people'?0.035:0.09),Ua=Math.pow(force+1,P.scaleExp)*M.S*M.mil*(0.8+0.4*M.experience),Ud=fieldDefense(j,true)*(1+borderBarrier(origin,j));
    won=r()<clamp(Ua/(Ua+Ud),0.02,0.9);scaleMigration(M,won?0.98:0.94);M.experience=clamp(M.experience+(won?0.025:0.008),0,1);
    if(q){const defender=s.pols[q];crisisEncounter(defender,null,!won,won?0.1:0.03);armyLoss(defender,j,Math.min(defender.army*0.1,force*(won?0.06:0.02)))}
    if(won){if(M.herd>0.4&&M.kind!=='people')sackSettlement({id:M.pol,kind:'horde',full:M.name,ruler:{aggr:0.4+M.experience*0.4},migration:M},j,force);s.pop[j]*=0.98;displacedPeople(j,M.kind==='people'?0.12:0.35,0);if(q){s.pols[q].shock+=0.08;if(!M.broke.includes(q))M.broke.push(q)}M.won=M.won||new Set();M.won.add(j)}
  }
  if(!won){M.fails++;if(q)M.blocked.set(q,(M.blocked.get(q)||0)+1);turnMigration(M);if(M.fails>10&&M.food<M.pop*0.1)settleMigration(M,origin,null);return}
  diseaseJourney(origin,j,travelDays(origin,j),Math.min(M.pop,600),'migration');M.cell=j;M.steps++;M.path.push(j);scatterMigration(M,j);if(M.route&&M.route[0]===j)M.route.shift();s.migrationPressure[j]=clamp(s.migrationPressure[j]+M.pop/Math.max(10000,s.K[j])*0.2,0,2);
  // Provisions seized or purchased in transit are removed from local stocks.
  const forage=Math.min(s.food[j]*0.15,M.pop*0.15);s.food[j]-=forage;M.food+=forage;
  recruitMigration(M,j);
  const room=s.K[j]-s.pop[j],settleChance=M.kind==='people'?0.2:w.nomad[j]?0.025:0.08;
  if(M.steps>M.max||s.year-M.start>120||(M.steps>5&&room>M.pop*0.4&&r()<settleChance)||M.peaceful)settleMigration(M,j,q?s.pols[q]:null);
}
function settleMigration(M,j,t){
  const s=S,w=WD;if(M.done)return;
  // Adjacent occupied provinces cannot be annexed by merely settling nearby.
  const host=M.admission?s.pols[M.admission.host]:null;
  const cells=[j];for(let d=0;d<4;d++){const c=w.nb[j*4+d];if(c>=0&&w.land[c]&&cells.length<4&&(host?s.pol[c]===host.id:!s.pol[c]||s.pol[c]===M.pol)&&(s.pop[c]<1||s.eth[c]===M.eth))cells.push(c)}
  const weights=cells.map(c=>Math.max(100,s.K[c]-s.pop[c])),total=weights.reduce((a,b)=>a+b,0);
  for(let k=0;k<cells.length;k++){
    const c=cells[k],old=s.pop[c],n=M.pop*weights[k]/total,empty=old<1;
    s.pop[c]+=n;s.food[c]+=(M.food||0)*weights[k]/total;s.young[c]+=(M.young||M.pop*0.3)*weights[k]/total;
    if(empty){s.eth[c]=M.eth;s.ancestry[c]=M.ancestry==null?M.eth:M.ancestry;s.eth2[c]=-1;s.rel[c]=M.rel;s.infrastructure[c]=0;s.organisation[c]=0.15}
    depositMigrationGroups(c,M,n,old);mixDiseaseHistory(c,M.immunity,n,old);
    putHerd(c,M.animals.map(v=>v*weights[k]/total));if(M.crops)for(let f=0;f<CROPS.length;f++)s.cropAccess[f][c]=Math.max(s.cropAccess[f][c],M.crops[f]*0.8);
    s.settleLag[c]=empty?2:1;s.newcomers[c]+=n;for(let f=0;f<s.tk.length;f++)s.tk[f][c]=Math.max(s.tk[f][c],M.techs[f]*0.8);
    if(M.won&&M.won.has(c))s.pol[c]=0;
  }
  if(host&&host.alive&&s.pol[j]===host.id){host.compacts.push({cell:j,eth:M.eth,people:M.pop,promised:M.admission.promised,since:s.year,loyalty:0.75,failures:0,broken:false,done:false});s.societyCounters.admissions++}
  M.animals=emptyHerd();
  M.food=0;M.done=true;M.end=s.year;s.activeMigs=s.activeMigs.filter(id=>id!==M.id);
  let o=null;
  if(!M.peaceful&&M.pop>15000&&s.organisation[j]>0.3&&(M.farm>0.5||M.herd>0.5)&&!s.pol[j]){const id=newPolity(j,null,{kind:M.herd>0.5&&w.nomad[j]?'horde':'state',conqDyn:true,origin:{type:'migration',mig:M.id,people:M.eth,from:t?t.id:0}});o=s.pols[id];o.core=M.eth;o.raidSkill=M.experience;for(const c of cells)if(!s.pol[c])s.pol[c]=id}
  M.settledPol=o?o.id:0;M.result=o?'settled and founded the '+o.full:M.peaceful?'settled by agreement':'settled as autonomous communities';
  if(M.logged||M.kind==='warband')chron('migration',`After ${s.year-M.start} years, the ${M.name} ${M.result}.`,j,[RM(M),RE(s.eths[M.eth]),...(o?[R_(o)]:[])]);
}
function territorialAttack(o,i,j,sea){
  const s=S,w=WD,q=s.pol[j];if(!q&&!frontierReady(o,i,j))return;
  if(o.kind==='state'&&!frontierHoldable(o,i,j))return;
  if(o.kind==='horde'&&q&&protectedByTreaty(s.pols[q],o))return;
  if(!q&&s.pop[j]<1){
    if(o.kind==='state')foundSettlement(i,j,Math.min(2000,s.pop[i]*0.08),o);
    else if((w.nomad[j]||w.desert[j])&&dd(i)<o.h&&budgetPay(o,100)>=100){s.pol[j]=o.id;s.taken[j]=s.year;s.dist[j]=Math.min(65534,s.dist[i]+w.tcost[j])}
    return;
  }
  const force=campaignForce(o,i,sea);if(!force)return;recordFrontierPressure(o,j,0.2);diseaseJourney(i,j,travelDays(i,j,sea),Math.min(force,500),'army');
  if(wallStrength(j)>0.3&&!tryWallBreach(o,i,j,force)){o.blockadePressure=clamp(o.blockadePressure+0.08,0,1);return;}
  if(q&&s.r()<eliteDefectionChance(o,j)){switchEliteAllegiance(o,j);return}
  let Ua=Math.pow(force+1,P.scaleExp)*(0.4+0.3*o.S+0.3*s.s[i])*milAt(i)*(0.65+0.35*o.preparedness),Ud=fieldDefense(j,true)*(sea?1:1+borderBarrier(i,j));
  if(sea){const defender=q?s.pols[q]:null;Ua*=clamp(0.45+0.35*s.nav[i]+0.25*s.ocean[i]-0.2*(defender?s.nav[j]:0),0.2,1)}
  if(!q)Ud*=1+0.8*s.forest[j]+w.rough[j];if(w.rangeExposure[j]>0.4&&o.kind!=='horde')Ud*=1+2*pastoralMobility(j)/(1+gunEffect(i));
  if(w.tsetse[j]&&!w.tsetse[o.capital])Ua*=0.6;
  const niche=Math.exp(-P.eco*0.5*Math.max(0,ecoD(j,o)-0.4)/(0.6+o.bureau)),legacy=hasLegacy(o,j)?1.1:1;
  const chance=clamp((Ua/(Ua+Ud)-0.12)*niche*legacy,0.01,0.88),win=s.r()<chance;
  armyLoss(o,i,force*(win?0.025:0.09),o.campaignAuxShare);if(q)armyLoss(s.pols[q],j,Math.min(s.pols[q].army*0.08,force*(win?0.06:0.02)));
  crisisEncounter(o,q?s.pols[q]:null,win,win?0.025:0.09);if(q)crisisEncounter(s.pols[q],o,!win,win?0.09:0.025);
  recordVictory(o,win,win?0.025:0.09);if(!win)return;if(!besiegeCity(o,i,j,force))return;
  warnCommunities(j,o);
  conquestRecorded(o,j,q);
  o.occupation=Math.max(0,o.occupation-Math.max(100,s.pop[j]*0.015));budgetPay(o,Math.min(o.grain,s.pop[j]*0.01));
  s.integ[j]=0.1+0.12*(s.rel[j]>=0&&s.rel[j]===o.rel?1:0)+0.1*o.rights;s.autonomy[j]=Math.max(0.6,s.autonomy[j]);
  s.pol[j]=o.id;s.taken[j]=s.year;s.dist[j]=Math.min(65534,s.dist[i]+(sea?6:w.tcost[j]||2));s.pop[j]*=1-(s.fort[j]>0.5?0.015:0.004);s.unrest[j]=Math.max(0.3,s.unrest[j]);o.conq++;o.ruler.conq++;
  // Jurisdiction changes after a victory. Moving colonists into inhabited land
  // is a separate movement, paid for from household and public provisions.
  if(o.kind==='state'&&s.eth[j]!==o.core&&o.occupation>500&&o.health>0.6&&o.grain>800&&s.pop[i]>10000&&s.r()<0.2+0.3*o.central)
    foundSettlement(i,j,Math.min(1000,s.pop[i]*0.03),o);
  if(o.kind==='horde')displacedPeople(j,0.12,o.id);
  if(q){const d=s.pols[q];if(j===d.capital&&installConquestDynasty(o,d,j))return;d.lastBy=o.id;d.shock+=0.01;d.mandate=Math.max(0,d.mandate-0.015);const wid=o.enemies.get(q);if(wid!=null){const war=s.wars[wid];if(war.aSet.has(o.id))war.gA++;else war.gD++;war.lastGain=s.year;
    if(j===d.capital&&o.kind==='state'&&(d.cells<0.7*o.cells||d.health<0.3))decisive(o,d,war)}}
}
function territorialRaid(o,i,j){
  const s=S,target=s.pol[j]?s.pols[s.pol[j]]:null;if(target&&(target.over===o.id||protectedByTreaty(target,o)))return;
  const force=campaignForce(o,i,false);if(!force)return;recordFrontierPressure(o,j,0.12);diseaseJourney(i,j,travelDays(i,j),Math.min(force,400),'army');
  if(wallStrength(j)>0.3&&!tryWallBreach(o,i,j,force)){o.failedRaids=(o.failedRaids||0)+1;o.blockadePressure=clamp(o.blockadePressure+0.08,0,1);return;}
  const attack=Math.pow(force+1,P.scaleExp)*milAt(i)*(0.8+0.4*o.raidSkill),def=fieldDefense(j,true)*(1+borderBarrier(i,j));
  if(s.r()>attack/(attack+def)){armyLoss(o,i,force*0.04,o.campaignAuxShare);crisisEncounter(o,target,false,0.04);recordVictory(o,false,0.04);if(target)crisisEncounter(target,o,true,0.02);o.failedRaids=(o.failedRaids||0)+1;return}
  crisisEncounter(o,target,true,0.015);recordVictory(o,true,0.015);raidDamageAt(o,i,j,force);if(target)crisisEncounter(target,o,false,0.05);o.failedRaids=Math.max(0,(o.failedRaids||0)-1);
  const booty=Math.min(s.food[j]*0.2,force*0.5);s.food[j]-=booty;depositPublic(o,i,booty);o.loot+=booty;
  putHerd(i,takeHerd(j,0.025));
  displacedPeople(j,0.025,o.id);if(target){target.shock+=0.025;target.raided=(target.raided||0)+1}else s.unrest[j]=Math.min(1,s.unrest[j]+0.05);armyLoss(o,i,force*0.015,o.campaignAuxShare);
}
function socialObservations(){
  const s=S,w=WD;if(!w.regions)return [];
  return w.regions.map(R=>{let population=0,ruled=0,urban=0,admin=0,autonomous=0;const states=new Set();
    for(const i of R.cells){const p=s.pop[i];population+=p;urban=Math.max(urban,s.urban[i]);const o=s.pol[i]?s.pols[s.pol[i]]:null;
      if(o){ruled+=p;states.add(o.id);admin+=p*(1+(o.central>0.25?1:0)+(o.bureau>0.3?1:0)+(o.central>0.6&&o.bureau>0.5?1:0))}
      else if(s.organisation[i]>0.4)autonomous+=p;
    }
    return {name:R.n,population,ruled:ruled/Math.max(1,population),largestSettlement:urban,adminLevels:admin/Math.max(1,ruled),polities:states.size,organizedAutonomous:autonomous/Math.max(1,population)};
  });
}
function societyMetrics(){
  const s=S,states=s.alive.map(id=>s.pols[id]).filter(o=>o.kind==='state');
  const animalStocks=ANIMALS.map((a,k)=>{let n=0;for(const i of WD.landIdx)n+=s.animals[k][i];for(const id of s.activeMigs)n+=s.migs[id].animals[k];for(const p of s.press.values())n+=(p.animals||[])[k]||0;for(const e of s.expeditions)if(!e.done)n+=e.animals[k];return Math.round(n)});
  return {kingdoms:states.filter(o=>o.tier==='Kingdom').length,empires:states.filter(o=>o.tier==='Empire').length,regionalStores:WD.landIdx.reduce((n,i)=>n+s.depot[i],0),foodError:s.accounts?s.accounts.error:0,animalError:s.animalAccounts?s.animalAccounts.error:0,animalStocks,cityStates:states.filter(o=>o.tier==='City-state').length,meanPreparedness:states.reduce((n,o)=>n+o.preparedness,0)/Math.max(1,states.length),tradeEdges:s.tradeEdges.length,communities:WD.landIdx.reduce((n,i)=>n+(s.organisation[i]>0.4&&!s.pol[i]?1:0),0),meanHealth:states.reduce((n,o)=>n+o.health,0)/Math.max(1,states.length),reforms:states.reduce((n,o)=>n+o.reforms.length,0),army:states.reduce((n,o)=>n+o.army,0),migrations:s.migs.length,coerciveMigrations:s.migs.filter(m=>m.kind==='warband'||m.kind==='horde').length,...s.societyCounters};
}
