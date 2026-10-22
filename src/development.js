/* Settlement and political development are funded, reversible processes.
   Rates are experimental; a pastoral economy is not a lower political stage. */
const CITY_ROLES=['Market town','Port','Craft center','Administrative center','Ritual center','Frontier center'];
function initDevelopment(){
  const s=S;
  for(const k of ['housing','urbanWater','urbanJobs','localFoodImports'])s[k]=new Float64Array(N);
  s.sanitation=new Float32Array(N);s.cityRole=new Uint8Array(N);
  s.settlementRequests=[];s.nextSettlementId=1;
  Object.assign(s.societyCounters,{nomadSubmissions:0,nomadReleases:0,pastoralTransitions:0,settlementPetitions:0,negotiatedSettlers:0,frontierSettlers:0,redistributedSettlers:0,urbanArrivals:0,urbanDepartures:0,localGrainDeliveries:0});
  initConsolidation();
}
function initDevelopmentPolity(o,from){
  o.pastoralOrigin=o.kind==='horde'||!!from?.pastoralOrigin;
  o.pastoralPractice=from?(from.pastoralPractice||0)*0.7:0;
  o.hybridYears=from?(from.hybridYears||0)*0.5:0;o.agrarianRevenue=0;o.settlementProgress=0;
  o.lastPetition=-100000;o.lastPastoralDefeat=-100000;o.submission=null;
  initConsolidationPolity(o,from);
}
function urbanWaterCapacity(i){
  const w=WD,access=clamp(w.waterPotential[i]*0.7+w.Pr[i]/2500,0,1);
  return (200+8500*access*access+suitableWaterworks(i)+S.urbanWater[i])*clamp(S.wm[i],0.3,1.1);
}
function suitableWaterworks(i){return S.waterworks[i]*12000*(0.2+0.8*WD.waterPotential[i])}
function urbanActivities(i,o){
  const s=S,p=s.pop[i],trade=Math.min(p*0.12,s.flow[i]*0.12),administration=o?(o.staff+o.army*0.15)*p/Math.max(1,o.pop):0;
  const surplus=Math.max(0,s.harvest[i]-s.need[i]*0.9),processing=Math.min(p*0.045,surplus*0.12);
  const roles=[p*(0.012+0.055*s.organisation[i])+processing+trade*0.5,
    WD.coast[i]?trade*(0.5+0.5*s.sail[i]):0,
    p*s.workshops[i]*0.06*(0.4+0.6*s.urbanNetwork[i]),administration,
    s.rel[i]>=0?p*0.012*s.organisation[i]:0,
    o?o.army*p/Math.max(1,o.pop)*0.12*civicThreat(i,o):0];
  s.cityRole[i]=roles.indexOf(Math.max(...roles));
  return roles.reduce((a,b)=>a+b,0);
}
function urbanTarget(i,o){
  const s=S,p=s.pop[i],food=s.harvest[i]*0.25+s.foodImports[i];
  s.urbanJobs[i]=urbanActivities(i,o);
  return Math.max(0,Math.min(p*urbanShare(i,o),s.urbanJobs[i],food,urbanWaterCapacity(i))*(1-s.cityDamage[i]));
}
function urbanBuildSpend(i,o,due){
  const privatePaid=civicSpend(i,null,due);if(!o||privatePaid>=due)return privatePaid;
  const reserve=(o.fiscalDue||o.pop*0.02)*S.pop[i]/Math.max(1,o.pop)*1.25;
  const discretionary=Math.max(0,publicAvailable(o,i)-reserve)*0.03;
  return privatePaid+civicSpend(i,o,Math.min(due-privatePaid,discretionary));
}
function urbanConstruction(i,o){
  const s=S,p=s.pop[i];if(p<100)return;
  const target=urbanTarget(i,o),occupied=s.urban[i];
  // Maintenance is paid before expansion. Empty buildings persist but decay.
  const upkeep=s.housing[i]*0.002+s.urbanWater[i]*0.0015,maintained=urbanBuildSpend(i,o,upkeep)/Math.max(1,upkeep);
  s.housing[i]*=1-0.004*(1-maintained)-0.001*s.raidDamage[i];s.urbanWater[i]*=1-0.006*(1-maintained);
  const seats=Math.min(Math.max(0,target*1.1-s.housing[i]),Math.max(5,p*0.003)),cost=0.35+0.2*WD.rough[i];
  if(seats>0){const paid=urbanBuildSpend(i,o,seats*cost);s.housing[i]+=paid/cost;s.engineeringPractice[i]+=paid*0.08}
  const waterNeed=Math.max(0,Math.min(s.housing[i],s.urbanJobs[i])*1.1-urbanWaterCapacity(i));
  if(waterNeed>0&&s.engineeringKnowledge[i]>0.1){const paid=urbanBuildSpend(i,o,Math.min(p*0.001,waterNeed*0.3));s.urbanWater[i]+=paid/0.3*(0.2+0.8*WD.waterPotential[i]);s.engineeringPractice[i]+=paid*0.1}
  const crowd=occupied/Math.max(100,s.housing[i]),due=occupied*0.0015;
  const paid=urbanBuildSpend(i,o,due),met=paid/Math.max(1,due);
  s.sanitation[i]=clamp(s.sanitation[i]+0.025*(met*(0.2+0.5*s.infrastructure[i]+0.3*s.engineeringKnowledge[i])-s.sanitation[i])-0.005*Math.max(0,crowd-1),0,1);
}
function localUrbanFreight(accounts){
  const s=S,w=WD;s.localFoodImports.fill(0);
  // Each origin allocates one finite surplus among its neighboring buyers.
  for(const i of w.landIdx){const surplus=Math.max(0,s.food[i]-s.need[i]*1.12);if(surplus<1)continue;
    const buyers=[];let total=0;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.urban[j]<200)continue;
      const a=s.pol[i]?s.pols[s.pol[i]]:null,b=s.pol[j]?s.pols[s.pol[j]]:null;if(a&&b&&(a.enemies.has(b.id)||b.enemies.has(a.id)))continue;
      const access=Math.min(transportSupport(i),transportSupport(j)),road=Math.min(s.infrastructure[i],s.infrastructure[j]);
      const loss=clamp(0.06+0.14*w.rough[j]+0.06*(1-access),0.02,0.4),demand=Math.max(0,s.need[j]*1.08-s.food[j]);
      const capacity=Math.min(s.pop[i],s.pop[j])*(0.008+0.025*access+0.02*road)*civicTradeAccess(i,j)*epidemicTravelFactor(i,j);
      const wanted=Math.min(demand/(1-loss),capacity);if(wanted>0){buyers.push({j,wanted,loss});total+=wanted}
    }
    const fraction=Math.min(1,surplus/Math.max(1,total));for(const b of buyers){const n=b.wanted*fraction,delivered=n*(1-b.loss);s.food[i]-=n;s.food[b.j]+=delivered;s.foodImports[b.j]+=delivered;s.localFoodImports[b.j]+=delivered;accounts.transportLoss+=n-delivered;s.societyCounters.localGrainDeliveries+=delivered;s.flow[i]+=n;s.flow[b.j]+=delivered}
  }
}
function moveDevelopmentHouseholds(i,j,requested,options={}){
  const s=S;if(i===j||!WD.land[j])return 0;const prior=s.pop[i],old=s.pop[j];
  let n=Math.min(requested,prior*0.2,Math.max(0,s.K[j]-old)*0.35,s.food[i]/0.15);
  const selected=options.eth,selectedShare=selected==null?1:s.eth[i]===selected?1-(s.eth2[i]>=0?s.mix[i]:0):s.eth2[i]===selected?s.mix[i]:0;
  n=Math.min(n,prior*selectedShare);
  if(options.ruralOnly)n=Math.min(n,Math.max(0,prior-s.urban[i]));if(n<10)return 0;
  const ratio=n/prior,food=s.food[i]*ratio,young=s.young[i]*ratio,herd=takeHerd(i,ratio),history=diseaseHistory(i),minor=s.eth2[i]>=0?s.mix[i]:0;
  const ancestryMinor=s.ancestry2[i]>=0?s.ancestryMix[i]:0,adult=Math.max(0,old-s.young[j]),newAdult=n-young;
  s.maleShare[j]=(adult*s.maleShare[j]+newAdult*s.maleShare[i])/Math.max(1,adult+newAdult);
  s.pop[i]-=n;s.young[i]-=young;s.food[i]-=food;s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-n*0.06);putHerd(j,herd);
  const groups=selected==null?[[s.eth[i],1-minor],[s.eth2[i],minor]]:[[selected,1]];
  let before=old;for(const [eth,part] of groups)if(eth>=0&&part>0){if(before<1){s.eth[j]=eth;s.eth2[j]=-1;s.mix[j]=0}else mergeCulture(j,eth,n*part,before);before+=n*part}
  if(selected!=null){s.pop[i]=prior;removeResidentCulture(i,selected,n);s.pop[i]=prior-n}
  before=old;for(const [eth,part] of [[s.ancestry[i],1-ancestryMinor],[s.ancestry2[i],ancestryMinor]])if(eth>=0&&part>0){mergeAncestry(j,eth,n*part,before);before+=n*part}
  if(!options.ruralOnly)s.urban[i]*=1-ratio;
  if(options.urban)s.urban[j]+=n;
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][i]*Math.min(0.5,n/Math.max(1,s.pop[j])));
  transferCrops(i,j);mixDiseaseHistory(j,history,n,old);s.newcomers[j]+=n;s.settleLag[j]=Math.max(1,s.settleLag[j]);
  diseaseJourney(i,j,travelDays(i,j),n,'migration');
  s.campMoves.push({from:i,to:j,eth:s.eth[i],pop:n,year:s.year,home:i,cause:options.cause||'urban opportunity'});
  for(const [cell,delta] of [[i,-n],[j,n]]){const owner=s.pol[cell]?s.pols[s.pol[cell]]:null;if(owner)owner.pop=Math.max(0,owner.pop+delta)}
  return n;
}
function urbanPopulationYear(){
  const s=S,w=WD;
  // Local rural/urban residence changes do not create population.
  for(const i of w.landIdx){const p=s.pop[i],o=s.pol[i]?s.pols[s.pol[i]]:null,target=Math.min(s.housing[i],urbanTarget(i,o));s.urban[i]=clamp(s.urban[i],0,p);
    const lack=clamp(1-s.nutrition[i]+s.cityDamage[i]+s.sickness[i],0,1);
    if(s.urban[i]>target){const n=Math.min(s.urban[i],(s.urban[i]-target)*(0.06+0.2*lack));s.urban[i]-=n;s.societyCounters.urbanDepartures+=n}
    else if(s.nutrition[i]>0.85&&s.cityDamage[i]<0.5){const n=Math.min((p-s.urban[i])*0.015,target-s.urban[i],(p*0.0008+s.urban[i]*0.025)*s.organisation[i]);s.urban[i]+=n;s.societyCounters.urbanArrivals+=n}
  }
  // Stage arrivals so a household moves at most once in this pass.
  const moves=[],available=new Map();for(const j of w.landIdx){if(s.urban[j]<200||s.nutrition[j]<0.9||s.cityDamage[j]>0.4)continue;
    const host=s.pol[j]?s.pols[s.pol[j]]:null,target=Math.min(s.housing[j],urbanTarget(j,host));let room=Math.max(0,target-s.urban[j]);if(room<10)continue;
    for(let d=0;d<4&&room>=10;d++){const i=w.nb[j*4+d];if(i<0||!w.land[i]||s.pop[i]<500)continue;
      const source=s.pol[i]?s.pols[s.pol[i]]:null;if(host&&source&&(host.enemies.has(source.id)||source.enemies.has(host.id)))continue;
      if(host&&host.rights<0.25)continue;
      const rural=available.has(i)?available.get(i):Math.max(0,s.pop[i]-s.urban[i]),pull=clamp(s.urbanJobs[j]/Math.max(100,s.urban[j])-1,0,1);
      const n=Math.min(room,rural*0.008*P.migration*pull);if(n<10)continue;available.set(i,rural-n);moves.push({i,j,n});room-=n;
    }
  }
  for(const m of moves)s.societyCounters.urbanArrivals+=moveDevelopmentHouseholds(m.i,m.j,m.n,{urban:true,ruralOnly:true});
}
function settlementRoute(from,to,host,limit=8){
  const s=S,w=WD,queue=[[from,0]],seen=new Set([from]);
  for(let at=0;at<queue.length&&at<160;at++){const [i,depth]=queue[at];if(i===to)return depth;if(depth>=limit)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||seen.has(j)||w.rough[j]>0.85)continue;
      const owner=s.pol[j]?s.pols[s.pol[j]]:null;if(owner&&owner.id!==host.id&&owner.kind==='state')continue;
      if(owner&&host.enemies.has(owner.id))continue;seen.add(j);queue.push([j,depth+1]);}
  }return -1;
}
function settlementCapacity(host,j,mode){
  const s=S;if(!host?.alive||host.kind!=='state'||host.health<0.45||s.nutrition[j]<0.85)return 0;
  if(s.pol[j]!==host.id&&!(s.pol[j]===0&&s.ruralPatron[j]===host.id&&s.ruralSecurity[j]>0.35))return 0;
  const room=Math.max(0,s.K[j]*0.9-s.pop[j]),claims=clamp(1-s.pop[j]/Math.max(1,s.K[j])-s.eliteStake[j]*0.25,0,1);
  if(mode==='urban')return Math.min(room,Math.max(0,Math.min(s.housing[j],urbanWaterCapacity(j),s.urbanJobs[j])-s.urban[j]));
  const livelihood=mode==='pastoral'?WD.sH[j]*s.rangeStock[j]:s.farm[j]*farmSuit(j);
  return room*claims*clamp(livelihood,0,1)*0.35;
}
function settlementFundingCell(host,j){
  if(S.pol[j]===host.id)return j;
  for(let d=0;d<4;d++){const i=WD.nb[j*4+d];if(i>=0&&S.pol[i]===host.id&&S.urban[i]>=500)return i}
  return -1;
}
function createSettlementAgreement(host,i,j,requested,mode='pastoral',parent=null){
  const s=S,route=settlementRoute(i,j,host);if(route<0||host.enemies.has(s.pol[i]))return null;
  const funding=settlementFundingCell(host,j);if(funding<0)return null;
  const capacity=settlementCapacity(host,j,mode),cost=0.35+route*0.08+(mode==='farm'?0.45:mode==='urban'?0.2:0);
  const n=Math.min(requested,capacity,publicAvailable(host,funding)/Math.max(1,cost)*0.5);if(n<50)return null;
  const grant=budgetAt(host,funding,n*cost);if(grant<n*cost*0.99){s.food[j]+=grant;return null}
  const eth=parent?parent.eth:s.eth[i],moved=moveDevelopmentHouseholds(i,j,n,{urban:mode==='urban',eth,cause:'settlement agreement'});
  if(moved<50){s.food[j]+=grant;return null}s.food[j]+=grant;
  const t={id:s.nextSettlementId++,durable:true,host:host.id,cell:j,eth,people:moved,promised:moved*0.025,since:s.year,loyalty:0.65,failures:0,broken:false,done:false,mode,rights:host.rights,landRights:true,parent:parent?.id||0,patronCell:host.capital};
  host.compacts.push(t);s.societyCounters.negotiatedSettlers+=moved;if(s.pol[j]!==host.id)s.societyCounters.frontierSettlers+=moved;
  s.autonomy[j]=Math.max(s.autonomy[j],0.6);s.settleLag[j]=Math.max(s.settleLag[j],mode==='farm'?2:1);
  const origin=s.pol[i]?s.pols[s.pol[i]]:null;if(origin&&origin!==host){const fraction=moved/Math.max(1,origin.pop+moved);origin.army*=1-fraction;origin.staff*=1-fraction}
  chron('migration',`The ${host.full} receives ${fmtK(moved)} people under a ${mode==='urban'?'town':mode==='farm'?'farming':'pasture'} settlement agreement, promising provisions, protection and land rights.`,j,[R_(host),RE(s.eths[eth])]);
  return t;
}
function requestClanSettlement(o,origin=o.capital){
  const s=S;if(s.year-o.lastPetition<15||s.pop[origin]<500)return false;o.lastPetition=s.year;s.societyCounters.settlementPetitions++;
  const candidates=[];ring(origin,3,j=>{if(!WD.land[j])return;const host=s.pol[j]?s.pols[s.pol[j]]:s.ruralPatron[j]?s.pols[s.ruralPatron[j]]:null;if(!host||host.kind!=='state'||host.enemies.has(o.id))return;
    if(settlementRoute(origin,j,host)<0)return;
    for(const mode of ['urban','pastoral','farm']){if(mode==='urban'&&s.urban[j]<500)continue;
      const capacity=settlementCapacity(host,j,mode);if(capacity<100)continue;
      const livelihood=mode==='urban'?0.4+s.organisation[j]*0.3:mode==='pastoral'?(0.3+0.7*s.herd[origin])*WD.sH[j]*s.rangeStock[j]:(0.3+0.7*s.farm[origin])*farmSuit(j);
      candidates.push({host,j,mode,capacity,score:host.health+host.rights+host.trust+Math.min(1,capacity/3000)*0.6+livelihood*0.4-angDist(origin,j)*10});
    }
  });candidates.sort((a,b)=>b.score-a.score);
  for(const c of candidates)if(createSettlementAgreement(c.host,origin,c.j,Math.min(s.pop[origin]*0.15,c.capacity),c.mode))return true;
  return false;
}
function settlementAgreementStep(o,t){
  if(t.done)return;const s=S,owner=s.pol[t.cell];if(owner!==o.id&&!(owner===0&&s.ruralPatron[t.cell]===o.id)){t.done=true;return}
  const culture=s.eth[t.cell]===t.eth?1-(s.eth2[t.cell]>=0?s.mix[t.cell]:0):s.eth2[t.cell]===t.eth?s.mix[t.cell]:0;
  const n=Math.min(t.people,s.pop[t.cell]*culture);t.people=n;if(n<10){t.done=true;return}
  const funding=settlementFundingCell(o,t.cell),supportedYears=s.year-t.since,need=supportedYears<8?t.promised:t.promised*0.2,paid=funding>=0?budgetAt(o,funding,need):0;s.food[t.cell]+=paid;
  const protection=owner===o.id?o.health*o.payroll:s.ruralSecurity[t.cell],kept=o.rights>=t.rights-0.12&&protection>=0.3;
  const fulfillment=clamp((need?paid/need:1)*0.4+(kept?0.4:0)+s.nutrition[t.cell]*0.2,0,1);
  t.loyalty=clamp(t.loyalty+0.035*(fulfillment-t.loyalty),0,1);
  o.auxiliaries+=n*0.025*t.loyalty*(t.mode==='urban'?0.5:1);
  if(fulfillment<0.55){t.failures++;s.unrest[t.cell]=clamp(s.unrest[t.cell]+0.01,0,1)}else t.failures=Math.max(0,t.failures-2);
  if(t.failures>=5&&!t.broken){t.broken=true;s.societyCounters.brokenCompacts++;o.shock+=0.08;chron('migration',`Settled communities in the ${o.full} protest failed provisions or land-rights promises.`,t.cell,[R_(o)])}
  if(t.broken&&t.loyalty<0.25&&n>300&&s.activeMigs.length<20){
    // Use the existing cohort machinery; only actual resident households leave.
    const take=Math.min(n*0.5,s.pop[t.cell]*0.2),p=s.pop[t.cell],share=take/p,food=s.food[t.cell]*share,young=s.young[t.cell]*share,animals=takeHerd(t.cell,share),immunity=diseaseHistory(t.cell);
    removeResidentCulture(t.cell,t.eth,take);s.pop[t.cell]-=take;s.young[t.cell]-=young;s.food[t.cell]-=food;s.urban[t.cell]*=1-share;
    const a=s.r()*Math.PI*2,M=startMigration({eth:t.eth,pop:take,food,young,animals,cell:t.cell,dx:Math.cos(a),dy:Math.sin(a),kind:'people',cause:'broken settlement agreement'});M.immunity=immunity;t.people-=take;t.done=true;
  }
}
function redistributeSettlers(o){
  const s=S;if(o.kind!=='state'||o.cells<4||o.staff<o.pop*0.002||o.health<0.65||o.payroll<0.8||s.year%10)return;
  const cells=(s.realmCells.get(o.id)||[]).filter(i=>s.pol[i]===o.id);
  for(const t of [...o.compacts]){if(!t.durable||t.done||t.people<500||t.loyalty<0.65||s.year-t.since<10||s.year-(t.lastRedistribution||-100000)<20)continue;
    const targets=cells.filter(j=>j!==t.cell&&publicAvailable(o,j)>250&&settlementCapacity(o,j,t.mode)>300&&settlementRoute(t.cell,j,o,6)>=0).sort((a,b)=>settlementCapacity(o,b,t.mode)-settlementCapacity(o,a,t.mode));
    if(!targets.length)continue;const j=targets[0];
    // Relocation is negotiated, and requires a materially better destination.
    if(s.nutrition[j]<s.nutrition[t.cell]||s.r()>0.15*o.trust)continue;
    const moved=createSettlementAgreement(o,t.cell,j,Math.min(t.people*0.2,1000),t.mode,t);if(moved){t.people=Math.max(0,t.people-moved.people);t.lastRedistribution=s.year;s.societyCounters.redistributedSettlers+=moved.people}
  }
}
function pastoralRival(o,p){return p&&p.alive&&p.kind==='horde'&&o.over!==p.id&&p.over!==o.id&&!o.allies.includes(p.id)&&(o.truce.get(p.id)||-100000)<=S.year}
function submitPastoralPolity(winner,loser){
  const s=S;if(!pastoralRival(winner,loser)||loser.over||power(winner)<power(loser)*1.15)return false;
  const seen=new Set();for(let ancestor=winner;ancestor?.over&&!seen.has(ancestor.id);ancestor=s.pols[ancestor.over]){seen.add(ancestor.id);if(ancestor.over===loser.id)return false}
  const due=loser.pop*0.004,paid=budgetPay(winner,due);if(paid<due*0.9){s.food[loser.capital]+=paid;return false}s.food[loser.capital]+=paid;
  loser.over=winner.id;loser.overY=s.year;winner.tribs++;loser.submission={since:s.year,loyalty:0.5,leader:winner.ruler.since};
  for(const wid of [...s.activeWars]){const war=s.wars[wid];if(war.a.includes(winner.id)&&war.d.includes(loser.id)||war.d.includes(winner.id)&&war.a.includes(loser.id)){endWar(war);s.activeWars=s.activeWars.filter(id=>id!==wid)}}
  loser.enemies.delete(winner.id);winner.enemies.delete(loser.id);
  s.societyCounters.nomadSubmissions++;chron('diplomacy',`The ${loser.full} submits to the ${winner.full}, retaining its chiefs and pasture in return for tribute and military obligations.`,loser.capital,[R_(winner),R_(loser)]);return true;
}
function pastoralBattleOutcome(o,p,j){
  const s=S;if(o.kind!=='horde'||!p||p.kind!=='horde'||!pastoralRival(o,p))return false;
  p.lastPastoralDefeat=s.year;if(s.year-p.lastPetition>=15)requestClanSettlement(p,j);
  const advantage=power(o)/Math.max(1,power(p));if(advantage<1.25||s.r()>0.45)return false;
  if(p.coalition<0.4&&s.r()<0.4&&hordeMigration(p,'defeat by another confederation'))return true;
  return s.r()<0.6?submitPastoralPolity(o,p):incorporateClans(o,p);
}
function pastoralAdministration(o){
  const s=S;if(!o.pastoralOrigin)return;
  if(o.submission){const lord=s.pols[o.over];const secure=lord?.alive&&lord.kind==='horde'&&lord.health>0.4;
    const strength=secure?clamp(power(lord)/Math.max(1,power(o)),0,2):0;
    o.submission.loyalty=clamp(o.submission.loyalty+0.025*((secure?0.2+lord.trust*0.4+strength*0.15:0)-o.submission.loyalty)-0.015*o.hunger,0,1);
    if(secure&&lord.enemies.size&&o.submission.loyalty>0.45&&s.year%5===0&&!s.militaryContracts.some(t=>!t.done&&t.horde===o.id))createMilitaryContract(lord,o,o.army*0.15,5);
    if(!secure||o.submission.loyalty<0.25&&s.r()<0.05){if(lord)lord.tribs=Math.max(0,lord.tribs-1);o.over=0;o.submission=null;s.societyCounters.nomadReleases++;chron('diplomacy',`The ${o.full} withdraws its submission as the overlord's protection and authority weaken.`,o.capital,[R_(o)])}
  }
  if(o.kind!=='horde')return;
  const cells=(s.realmCells.get(o.id)||[]).filter(i=>s.pol[i]===o.id);let agrarian=0,all=0,specialists=0,towns=0,food=0,localConsent=0;
  for(const i of cells){const revenue=s.levy[i],crops=s.farm[i]*farmSuit(i),pasture=s.herd[i]*WD.sH[i];all+=revenue;agrarian+=revenue*crops/Math.max(0.05,crops+pasture+0.05*(1-s.farm[i]));food+=s.pop[i]*s.nutrition[i];localConsent+=s.pop[i]*s.eliteLoyalty[i];
    if(s.urban[i]>=1000){towns++;specialists+=s.urban[i]*(recordSkill(i)*0.6+s.organisation[i]*0.1)*(1-s.cityDamage[i])}}
  o.agrarianRevenue=all>0?agrarian/all:0;
  const demand=Math.max(0,o.clanTerms.size-1)+Math.min(8,o.tribs||0);
  if(demand>0){const need=o.pop*0.0003*Math.min(4,demand),paid=civicSpend(o.capital,o,need),practice=paid/Math.max(1,need);o.pastoralPractice=clamp(o.pastoralPractice+0.008*practice-0.003*(1-practice),0,1);s.recordPractice[o.capital]+=paid*0.03}
  const trained=o.staff>Math.max(30,o.pop*0.001)&&specialists>30;
  const suitable=towns>0&&o.agrarianRevenue>0.35&&trained&&food/Math.max(1,o.pop)>0.9&&localConsent/Math.max(1,o.pop)>0.45&&o.payroll>0.75&&o.health>0.6;
  const acceptance=clamp(o.coalition*0.5+o.rights*0.25+o.succession*0.25-o.coalitionFatigue*0.2,0,1);
  o.hybridYears=clamp(o.hybridYears+(suitable?acceptance:-1.5),0,100);o.settlementProgress=o.hybridYears/40;
  if(suitable&&acceptance>0.35){const due=o.pop*0.0005,paid=civicSpend(o.capital,o,due);o.hybridYears=Math.max(0,o.hybridYears-(1-paid/Math.max(1,due)));}
  if(o.hybridYears>=40){const old=o.full;o.kind='state';o.conqDyn=true;o.settledY=s.year;o.hybridGovernment=true;o.origin=Object.assign({},o.origin,{settled:s.year});o.shock+=0.08;o.conquestLoad=clamp(o.conquestLoad+0.1,0,3);o.tier=tierOf(o);o.full=fullName(o);s.societyCounters.pastoralTransitions++;
    chron('rise',`After sustained government of farming districts and towns, the ${old} establishes a mixed pastoral and agrarian administration as the ${o.full}.`,o.capital,[R_(o)],'Mobile communities retain their livelihoods. Officials, local cooperation, food and predictable revenue sustain the transition.');
  }
}
function developmentYear(){
  const s=S;for(const id of [...s.alive]){const o=s.pols[id];if(!o.alive)continue;pastoralAdministration(o);if(o.kind==='state')redistributeSettlers(o);
    else if(s.year%5===0&&(s.year-o.lastPastoralDefeat<15||o.hunger>0.2||o.coalitionFatigue>0.6)&&s.r()<0.15)requestClanSettlement(o);
  }
}
