/* Communities can share a people without sharing a single migration decision.
   Resource use, movement and settlement always transfer existing cohorts. */
function initPeoples(){
  const s=S;s.rangeStock=new Float32Array(N).fill(1);s.campHome=new Int32Array(N).fill(-1);s.culturalIsolation=new Float32Array(N);
  s.cityDamage=new Float32Array(N);s.ruinedCity=new Int32Array(N).fill(-1);s.campMoves=[];
  Object.assign(s.societyCounters,{campMovements:0,scatteredSettlers:0,regionalPeoples:0,citySacks:0,citiesAbandoned:0,sackRefugees:0});
  // Regional branches retain linguistic relatives. Earth's original macro
  // anchors are naming scenarios, not ten homogeneous continental cultures.
  const candidates=WD.landIdx.filter(i=>s.pop[i]>500);let made=0;
  for(let tries=0;tries<500&&made<P.bands*2&&candidates.length;tries++){
    const i=candidates[(s.r()*candidates.length)|0],parent=s.eth[i];if(parent<0)continue;
    let count=0;ring(i,2,j=>{if(WD.land[j]&&s.eth[j]===parent)count++});if(count<7)continue;
    const child=newEth(parent);ring(i,2,(j,dx,dy)=>{if(WD.land[j]&&s.eth[j]===parent&&dx*dx+dy*dy<=5)s.eth[j]=child});made++;
  }
}
function moveCamp(i,j,n){
  const s=S,w=WD,owner=s.pol[j]?s.pols[s.pol[j]]:null,homeOwner=s.pol[i]?s.pols[s.pol[i]]:null;
  if(i===j||!w.land[j]||s.pop[i]<100||s.farm[i]>0.4||owner&&owner.kind==='state'||homeOwner&&homeOwner.kind==='state')return 0;
  if(owner&&homeOwner&&owner.id!==homeOwner.id)return 0;
  const room=Math.max(0,s.K[j]*(0.6+0.4*s.rangeStock[j])-s.pop[j]);n=Math.min(n,s.pop[i]*0.3,room*0.5,s.food[i]/0.2);if(n<30)return 0;
  const prior=s.pop[i],old=s.pop[j],ratio=n/prior,young=s.young[i]*ratio,food=s.food[i]*ratio,cost=n*0.035,animals=takeHerd(i,ratio),history=diseaseHistory(i);
  s.pop[i]-=n;s.young[i]-=young;s.food[i]-=food;s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-cost);putHerd(j,animals);
  const minority=s.eth2[i]>=0?s.mix[i]:0;let before=old;
  for(const [eth,share] of [[s.eth[i],1-minority],[s.eth2[i],minority]])if(eth>=0&&share>0){if(before<1){s.eth[j]=eth;s.eth2[j]=-1;s.mix[j]=0}else mergeCulture(j,eth,n*share,before);before+=n*share}
  mergeAncestry(j,s.ancestry[i],n,old);mixDiseaseHistory(j,history,n,old);transferCrops(i,j);
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][i]*Math.min(0.8,n/Math.max(1,s.pop[j])));
  const home=s.campHome[i]>=0?s.campHome[i]:i;if(old<n*4)s.campHome[j]=home;s.campMoves.push({from:i,to:j,eth:s.eth[i],pop:n,year:s.year,home});s.societyCounters.campMovements++;
  diseaseJourney(i,j,travelDays(i,j),n,'migration');return n;
}
function peoplesYear(){
  const s=S,w=WD;
  // Stage resource renewal before movement, and snapshot origins so a cohort
  // cannot hop repeatedly across an entire continent in one annual pass.
  const available=Float32Array.from(s.pop);
  for(const i of w.landIdx){const renewable=clamp(pastureCondition(i),0.1,1.4),use=s.pop[i]/Math.max(100,s.K[i]);
    s.rangeStock[i]=clamp(s.rangeStock[i]+0.14*renewable*(1-s.rangeStock[i])-0.065*use*(1-s.farm[i]),0.05,1);
    s.culturalIsolation[i]+=1;s.cityDamage[i]*=0.999;
    if(s.cityDamage[i]>0.02){const o=s.pol[i]?s.pols[s.pol[i]]:null,due=s.pop[i]*s.cityDamage[i]*0.003;
      const paid=o?budgetAt(o,i,due):Math.min(s.food[i]*0.01,due*s.organisation[i]);if(o)s.food[i]+=paid;else s.food[i]-=paid;
      s.cityDamage[i]=Math.max(0,s.cityDamage[i]-0.025*paid/Math.max(1,due)*(0.3+s.organisation[i]));
    }
  }
  for(const i of w.landIdx){if(available[i]<300||s.farm[i]>0.35||s.pol[i]&&s.pols[s.pol[i]].kind==='state'||s.r()>0.12*P.migration)continue;
    let best=-1,score=0;const pressure=s.pop[i]/Math.max(1,s.K[i]),depleted=1-s.rangeStock[i];if(depleted<0.2&&pressure<0.8)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||w.T[j]<-9)continue;
      const home=s.campHome[i]===j&&s.rangeStock[j]>0.65?0.25:0;
      const value=s.rangeStock[j]-s.rangeStock[i]+clamp((s.K[j]-s.pop[j])/Math.max(1,s.K[j]),-1,1)*0.25+home-w.rough[j]*0.15-frontierRisk(j)*0.25;
      if(value>score){score=value;best=j}
    }
    if(best>=0&&score>0.12)moveCamp(i,best,Math.min(available[i]*0.22,4000));
  }
  s.campMoves=s.campMoves.filter(m=>s.year-m.year<=12).slice(-600);
  if(s.year%20===0)regionalIdentityPass();
}
function localCulturalBranch(i,limit=12){
  const s=S,w=WD,parent=s.eth[i];if(parent<0)return null;
  const cells=[],queue=[i],seen=new Set(queue),owner=s.pol[i];
  for(let at=0;at<queue.length&&cells.length<limit;at++){const j=queue[at];if(s.eth[j]!==parent||s.pop[j]<100||s.pol[j]!==owner)continue;cells.push(j);
    for(let d=0;d<4;d++){const next=w.nb[j*4+d];if(next>=0&&w.land[next]&&!seen.has(next)&&angDist(i,next)<0.06){seen.add(next);queue.push(next)}}
  }
  if(cells.length<2||cells.reduce((n,j)=>n+s.pop[j],0)<3000)return null;
  const child=newEth(parent);for(const j of cells){s.eth[j]=child;s.culturalIsolation[j]=0} s.societyCounters.regionalPeoples++;
  chron('people',`Communities develop a distinct regional identity as the ${s.eths[child].name}, related to the ${s.eths[parent].name}.`,i,[RE(s.eths[child]),RE(s.eths[parent])]);return child;
}
function regionalIdentityPass(){
  const s=S,w=WD;if(s.eths.length>4000)return;let made=0;
  for(let t=0;t<120&&made<3;t++){const i=w.landIdx[(s.r()*w.landIdx.length)|0];if(s.pop[i]<1500||s.culturalIsolation[i]<100||s.eth[i]<0)continue;
    const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.trust*o.comm*s.integ[i]>0.25)continue;
    const culture=s.eths[s.eth[i]],distance=angDist(i,nearestCultureCenter(culture,i));
    if(distance<0.035&&w.rough[i]<0.5&&s.campHome[i]<0)continue;
    if(s.r()<0.025*(1+w.rough[i])&&localCulturalBranch(i))made++;
  }
}
function nearestCultureCenter(e,fallback){return e.lon==null?fallback:cellAt((e.la||0)*180/Math.PI,e.lon*180/Math.PI)}
function scatterMigration(M,j,forced=false){
  const s=S;if(M.done||M.pop<1500||M.food<M.pop*0.3||s.pol[j]&&s.pol[j]!==M.pol&&!M.admission&&!(M.won&&M.won.has(j)))return 0;
  const room=Math.max(0,s.K[j]-s.pop[j]);if(room<300||!forced&&s.r()>0.08+0.12*clamp(room/Math.max(1,s.K[j]),0,1))return 0;
  const groups=M.groups.filter(g=>g.pop>100);if(!groups.length)return 0;
  const g=groups[(s.r()*groups.length)|0],n=Math.min(g.pop*0.25,M.pop*(0.04+s.r()*0.08),room*0.25);if(n<80)return 0;
  const old=s.pop[j],ratio=n/M.pop,food=M.food*ratio,young=M.young*ratio,animals=M.animals.map(v=>v*ratio);
  M.food-=food;M.young-=young;M.pop-=n;g.pop-=n;for(let k=0;k<M.animals.length;k++)M.animals[k]-=animals[k];
  s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-n*0.08);putHerd(j,animals);
  if(old<1){s.eth[j]=g.eth;s.eth2[j]=-1;s.mix[j]=0;s.ancestry[j]=g.ancestry;s.ancestry2[j]=-1;s.ancestryMix[j]=0;s.rel[j]=M.rel;s.organisation[j]=0.15}
  else{mergeCulture(j,g.eth,n,old);mergeAncestry(j,g.ancestry,n,old)}mixDiseaseHistory(j,M.immunity,n,old);
  if(M.crops)for(let k=0;k<CROPS.length;k++)s.cropAccess[k][j]=Math.max(s.cropAccess[k][j],M.crops[k]*0.6);
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],M.techs[k]*Math.min(0.6,n/Math.max(1,s.pop[j])));
  s.newcomers[j]+=n;if(M.farm>0.4)s.settleLag[j]=1;
  M.settled=M.settled||[];M.settled.push({cell:j,eth:g.eth,pop:n,year:s.year});s.societyCounters.scatteredSettlers+=n;return n;
}
function sackSettlement(attacker,j,force,forced=false){
  const s=S,urban=s.urban[j],target=s.pol[j]?s.pols[s.pol[j]]:null;
  if(!forced&&cityWallStrength(j)>0.3)return false;
  if(attacker.kind!=='horde'||urban<500||force<100||target&&protectedByTreaty(target,attacker))return false;
  const aggression=attacker.ruler?attacker.ruler.aggr:0.5,preserve=attacker.installTarget&&target&&attacker.installTarget===target.id;
  const resistance=s.unrest[j]+wallStrength(j),chance=(0.015+0.065*aggression+0.045*resistance+0.04*(attacker.hunger||0))*(preserve?0.25:1);
  if(!forced&&s.r()>chance)return false;
  const severity=forced?0.9:clamp(0.15+0.25*aggression+force/Math.max(1,s.pop[j])*0.2,0.15,0.65);
  s.cityWallHealth[j]*=1-severity*0.5;s.granaries[j]*=1-severity*0.4;s.militaryEquipment[j]*=1-severity*0.5;
  s.cityDamage[j]=clamp(s.cityDamage[j]+severity,0,1);s.raidDamage[j]=clamp(s.raidDamage[j]+severity*0.4,0,1);
  s.food[j]*=1-severity*0.15;s.workshops[j]*=1-severity*0.55;s.infrastructure[j]*=1-severity*0.5;s.organisation[j]*=1-severity*0.25;
  const killed=Math.min(s.pop[j]*0.04,urban*severity*0.06),prior=s.pop[j];s.pop[j]-=killed;s.young[j]*=1-killed/Math.max(1,prior);
  const refugees=displacedPeople(j,Math.min(0.45,(urban*severity*0.7+s.pop[j]*severity*0.08)/Math.max(1,s.pop[j])),attacker.id||0);s.societyCounters.sackRefugees+=refugees;
  s.urban[j]*=Math.pow(1-s.cityDamage[j],2);s.societyCounters.citySacks++;
  const city=s.city[j]>=0?s.cities[s.city[j]]:null,refs=attacker.migration?[RM(attacker.migration)]:[R_(attacker)];
  if(s.cityDamage[j]>0.8&&s.urban[j]<800){if(city){city.abandoned=true;city.abandonedYear=s.year;s.ruinedCity[j]=s.city[j];s.city[j]=-1}s.urban[j]=0;s.societyCounters.citiesAbandoned++}
  chron('war',`${city?city.name:'A settlement'} is devastated by the ${attacker.full}; ${fmtK(refugees)} survivors flee.`,j,refs,'Housing, stores, workshops and administration are damaged. Rural survivors remain, and rebuilding requires sustained resources.');
  if(target&&target.capital===j&&s.cityDamage[j]>0.8){if(target.health<0.3&&target.payroll<0.5)shatterGovernment(target,j);
    else{const options=polCells(target.id).filter(i=>i!==j&&s.cityDamage[i]<0.6);options.sort((a,b)=>s.urban[b]-s.urban[a]);if(options.length){s.depot[j]+=target.grain;target.grain=0;target.capital=options[0];target.shock+=0.15}}}
  return true;
}
