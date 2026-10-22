/* Food-denominated civic credit is a claim on existing resources, not a money
   creation system. Urban networks support specialization but compete for food. */
function initUrbanism(){
  const s=S;s.urbanNetwork=new Float32Array(N);s.urbanViability=new Float32Array(N);s.foodImports=new Float64Array(N);s.creditLoans=[];
  Object.assign(s.societyCounters,{civicLoans:0,civicDefaults:0,debtProtectorates:0,unsupportedDissolutions:0});
}
function urbanNetworkPass(){
  const s=S,next=new Float32Array(N);
  for(const e of s.tradeEdges){const ua=s.urban[e.a],ub=s.urban[e.b];
    const traffic=(e.privateUsed||0)+(e.freightUsed||0),infrastructure=Math.min(s.infrastructure[e.a],s.infrastructure[e.b]);
    const contact=clamp(traffic/Math.max(100,Math.min(s.pop[e.a],s.pop[e.b])*0.02)+Math.min(s.node[e.a],s.node[e.b])*infrastructure*0.3,0,1);
    const a=s.pol[e.a]?s.pols[s.pol[e.a]]:null,b=s.pol[e.b]?s.pols[s.pol[e.b]]:null;if(a&&b&&a.enemies.has(b.id))continue;
    if(ua>1500)next[e.b]+=clamp(ua/20000,0,1)*contact/(1+e.cost*3);
    if(ub>1500)next[e.a]+=clamp(ub/20000,0,1)*contact/(1+e.cost*3);
  }
  for(const i of WD.landIdx)s.urbanNetwork[i]=clamp(next[i],0,1);
}
function citySubsistence(i){
  const s=S,w=WD,p=Math.max(1,s.pop[i]);let hinterland=s.harvest[i];
  for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j])continue;
    const a=s.pol[i]?s.pols[s.pol[i]]:null,b=s.pol[j]?s.pols[s.pol[j]]:null;if(a&&b&&a.enemies.has(b.id))continue;
    const connected=(0.08+0.22*Math.min(transportSupport(i),transportSupport(j)))*(1-WD.rough[j]*0.7);hinterland+=Math.max(0,s.harvest[j]-s.need[j]*0.85)*connected;
  }
  const food=clamp((hinterland+s.foodImports[i]*0.6)/p,0,1.5),agriculture=s.farm[i]*farmSuit(i);
  const imports=clamp(s.foodImports[i]/p*3,0,1),stocks=clamp(s.food[i]/p,0,0.5);
  const cold=clamp((-5-(w.T[i]-w.amp[i]*0.5))/25,0,1),buffer=0.5*skill(i,'storage')+imports*0.5;
  return clamp((0.4*food+0.3*agriculture+0.25*imports+0.1*s.urbanNetwork[i]+0.1*stocks)*(1-0.35*cold*(1-buffer))*(1-0.6*s.cityDamage[i]),0,1);
}
function urbanShare(i,o){
  const s=S,p=Math.max(1,s.pop[i]),viability=citySubsistence(i);s.urbanViability[i]=viability;
  const jobs=0.025+s.organisation[i]*0.08+s.node[i]*0.1+s.urbanNetwork[i]*0.11+(o?o.bureau*0.05:0);
  const competition=1+0.5*s.urbanNetwork[i]*clamp(s.urban[i]/p*4,0,1);
  return clamp(jobs*viability/competition+s.foodImports[i]/p*0.5,0,0.4);
}
function issueCivicLoan(borrower,lender,amount,term=8,rate=0.04){
  const s=S;if(!borrower.alive||borrower.kind!=='state'||amount<20||s.creditLoans.filter(l=>!l.done&&l.borrower===borrower.id).length>=2)return null;
  let paid=0,source=borrower.capital;
  if(lender){if(!lender.alive||lender.enemies.has(borrower.id)||lender.grain<amount*2)return null;source=lender.capital;paid=budgetPay(lender,amount)}
  else{const surplus=Math.max(0,s.food[source]-s.pop[source]*0.3);paid=Math.min(amount,surplus*0.2);s.food[source]-=paid}
  if(paid<20){if(lender)lender.grain+=paid;else s.food[source]+=paid;return null}
  const travel=lender?Math.max(1,Math.ceil(travelDays(source,borrower.capital,!!(WD.coast[source]&&WD.coast[borrower.capital]))/365)):0;
  if(lender)s.publicShipments.push({from:lender.id,to:borrower.id,dest:borrower.capital,food:paid,created:s.year,years:travel,kind:'credit'});else depositPublic(borrower,source,paid);
  const loan={borrower:borrower.id,lender:lender?lender.id:0,creditorCell:source,original:paid,principal:paid,rate,term,due:s.year+travel+1,misses:0,defaulted:false,done:false};
  s.creditLoans.push(loan);s.societyCounters.civicLoans++;return loan;
}
function serviceCivicLoan(loan){
  const s=S,o=s.pols[loan.borrower];if(loan.done||s.year<loan.due)return;
  if(!o||!o.alive){loan.done=true;loan.writtenOff=loan.principal;return}
  const lender=loan.lender?s.pols[loan.lender]:null,duePrincipal=Math.min(loan.principal,loan.original/loan.term),interest=loan.principal*loan.rate;
  const paid=budgetAt(o,o.capital,duePrincipal+interest);
  if(lender&&lender.alive&&paid>0)s.publicShipments.push({from:o.id,to:lender.id,dest:lender.capital,food:paid,created:s.year,years:Math.max(1,Math.ceil(travelDays(o.capital,lender.capital)/365)),kind:'credit'});
  else s.food[loan.creditorCell]+=paid;
  const principalPaid=Math.min(duePrincipal,Math.max(0,paid-interest));loan.principal=Math.max(0,loan.principal-principalPaid);loan.due++;
  if(paid<(duePrincipal+interest)*0.8)loan.misses++;else loan.misses=Math.max(0,loan.misses-1);
  if(loan.misses>=3&&!loan.defaulted){loan.defaulted=true;o.creditDefault=s.year;o.creditTrust=Math.max(0.05,(o.creditTrust||0.7)-0.35);o.shock+=0.08;o.trust=Math.max(0.05,o.trust-0.04);s.societyCounters.civicDefaults++;
    chron('diplomacy',`The ${o.full} defaults on civic borrowing after repeated missed payments.`,o.capital,[R_(o),...(lender?[R_(lender)]:[])],'Creditors may negotiate, withhold further credit or seek political concessions. Default does not automatically cause annexation.');
  }
  if(loan.principal<0.01){loan.done=true;o.creditTrust=clamp((o.creditTrust||0.7)+0.08,0,1)}
}
function acceptDebtProtector(client,patron){
  const s=S;if(!client.alive||!patron.alive||client.over||client.enemies.has(patron.id)||power(patron)<power(client)*1.3||patron.health*patron.payroll<0.4)return false;
  const debts=s.creditLoans.filter(l=>!l.done&&l.borrower===client.id),external=debts.filter(l=>l.lender!==patron.id);
  const cost=external.reduce((n,l)=>n+l.principal,0)+Math.max(50,client.pop*0.01);if(patron.grain<cost*1.5)return false;
  for(const l of debts){if(l.lender===patron.id){l.done=true;l.writtenOff=l.principal;l.principal=0;continue}
    const paid=budgetPay(patron,l.principal),creditor=s.pols[l.lender];if(creditor?.alive)s.publicShipments.push({from:patron.id,to:creditor.id,dest:creditor.capital,food:paid,created:s.year,years:1,kind:'credit'});else s.food[l.creditorCell]+=paid;l.done=true;l.principal=0;
  }
  tributeShipment(patron,client,Math.max(50,client.pop*0.01));client.over=patron.id;client.overY=s.year;patron.tribs++;client.creditDefault=-100000;client.shock+=0.04;
  s.societyCounters.debtProtectorates++;chron('diplomacy',`The ${client.full} accepts the protection of the ${patron.full} in exchange for relief from its debts.`,client.capital,[R_(client),R_(patron)]);return true;
}
function urbanYear(){
  const s=S;if(s.year%10===0)urbanNetworkPass();for(const l of s.creditLoans)serviceCivicLoan(l);
  for(const id of [...s.alive]){const o=s.pols[id];if(o.kind!=='state')continue;const c=o.capital;
    o.creditTrust=o.creditTrust==null?0.7:o.creditTrust;o.creditTrust=clamp(o.creditTrust+0.002*(0.8-o.creditTrust),0,1);
    const viability=citySubsistence(c);s.urbanViability[c]=viability;o.viability=viability;
    const unsupported=o.cells<=6&&viability<0.28&&o.payroll<0.6;o.unsupportedYears=unsupported?(o.unsupportedYears||0)+1:Math.max(0,(o.unsupportedYears||0)-2);
    if(unsupported){o.strain=clamp(o.strain+0.003,0,1);o.health=Math.max(0.02,o.health-0.002);o.groups.nobles.loyalty=Math.max(0.05,o.groups.nobles.loyalty-0.002)}
    if(o.unsupportedYears>35&&o.health<0.35&&o.payroll<0.4&&s.r()<0.04){s.societyCounters.unsupportedDissolutions++;shatterGovernment(o,c,'Unsustained collections, food supply and civic services dissolve the government; the remaining communities govern themselves.');continue}
    const shortfall=(o.fiscalDue||0)-(o.collected||0),credible=o.creditTrust>0.4&&o.health>0.45&&viability>0.35;
    if(shortfall>100&&credible&&o.grain<shortfall&&s.year%5===0&&s.r()<0.25){
      if(!issueCivicLoan(o,null,Math.min(shortfall*2,o.pop*0.04)))for(const [q] of o.nb){const p=s.pols[q];if(p?.kind==='state'&&p.alive&&p.grain>shortfall*6&&!p.enemies.has(id)&&issueCivicLoan(o,p,Math.min(shortfall*2,o.pop*0.05)))break}
    }
    if(s.year-(o.creditDefault??-100000)<30&&o.cells<=6&&o.health<0.6&&!o.over&&s.r()<0.015*(1-o.ruler.aggr)){
      for(const [q] of o.nb){const patron=s.pols[q];if(patron?.kind==='state'&&acceptDebtProtector(o,patron))break}
    }
  }
  if(s.year%50===0)s.creditLoans=s.creditLoans.filter(l=>!l.done||l.defaulted);
}
