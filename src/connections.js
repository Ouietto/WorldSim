/* Frontier coalitions and maritime foundations use actual resources and local
   relationships. These are conditional processes, not regional spawn scripts. */
function initConnections(){
  const s=S;s.frontierAlarm=new Float32Array(N);s.frontierEnemy=new Int32Array(N);s.encroached=new Int32Array(N).fill(-100000);
  s.portContact=new Float32Array(N);s.expeditions=[];s.enclaves=[];
  Object.assign(s.societyCounters,{defensiveConfederations:0,threatAccessions:0,maritimeFoundations:0,tradingEnclaves:0,failedExpeditions:0,colonialContacts:0});
}
function recordFrontierPressure(attacker,j,severity){
  if(!attacker||attacker.kind!=='state')return;const s=S,w=WD;
  ring(j,2,(i,dx,dy)=>{if(!w.land[i]||s.pop[i]<300||s.pol[i]===attacker.id||s.herd[i]<0.35||w.rangeExposure[i]<0.25)return;
    const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.kind==='state')return;
    const distance=1+Math.abs(dx)+Math.abs(dy),communication=(0.3+0.7*s.organisation[i])*(0.5+0.5*Math.max(s.mounts[i],s.pack[i]));
    const threat=severity*communication/distance;
    if(!s.frontierEnemy[i]||s.frontierEnemy[i]===attacker.id||threat>s.frontierAlarm[i]*0.5){s.frontierEnemy[i]=attacker.id;s.frontierAlarm[i]=clamp(s.frontierAlarm[i]+threat,0,1);s.encroached[i]=s.year}
    if(o){o.threatMemory=o.threatMemory||new Map();o.threatMemory.set(attacker.id,{last:s.year,severity:s.frontierAlarm[i]})}
  });
}
function frontierCoalitionAt(i,force=false){
  const s=S,w=WD,enemy=s.frontierEnemy[i],alarm=s.frontierAlarm[i],incumbent=s.pol[i]?s.pols[s.pol[i]]:null;
  if(!enemy||alarm<0.12||incumbent&&incumbent.kind!=='horde')return null;
  const aggressor=s.pols[enemy];if(!aggressor||!aggressor.alive)return null;
  if(incumbent&&(incumbent.allies.includes(enemy)||protectedByTreaty(aggressor,incumbent)))return null;
  const cells=[];let population=0,food=0,herds=0;
  // Local communication only: a threat is not broadcast to every pastoralist.
  const queue=[i],seen=new Set(queue);for(let at=0;at<queue.length&&at<32;at++){const j=queue[at];
    if(s.frontierEnemy[j]!==enemy||s.frontierAlarm[j]<0.08||s.herd[j]<0.35||w.rough[j]>0.8)continue;
    const owner=s.pol[j]?s.pols[s.pol[j]]:null;if(owner&&owner.kind!=='horde'||owner&&owner.allies.includes(enemy))continue;
    cells.push(j);population+=s.pop[j];food+=s.food[j];herds+=s.animals.reduce((n,a)=>n+a[j],0);
    for(let d=0;d<4;d++){const next=w.nb[j*4+d];if(next>=0&&w.land[next]&&!seen.has(next)){seen.add(next);queue.push(next)}}
  }
  if(cells.length<2||population<12000||herds<population*0.015||food<population*0.08)return null;
  const leader=incumbent?incumbent.ruler.char:0.2+s.organisation[i]*0.6;
  if(!force&&s.r()>alarm*(0.04+0.15*leader)*P.formRate)return null;
  let o=incumbent;if(!o){const unclaimed=cells.filter(j=>!s.pol[j]);if(unclaimed.length<2)return null;
    o=s.pols[newPolity(i,null,{kind:'horde',origin:{type:'defensive',against:enemy,why:'Clans coordinate protection after repeated incursions on their pasture and routes.'}})];
    for(const j of unclaimed){s.pol[j]=o.id;s.integ[j]=0.55;s.autonomy[j]=0.85}
    o.pop=unclaimed.reduce((n,j)=>n+s.pop[j],0);o.cells=unclaimed.length;o.sharedThreat=alarm;s.societyCounters.defensiveConfederations++;
    chron('rise',`Clans assemble the ${o.full} to resist incursions by the ${aggressor.full}.`,i,[R_(o),R_(aggressor)]);
  }
  o.sharedThreat=Math.max(o.sharedThreat||0,alarm);o.threatMemory=o.threatMemory||new Map();o.threatMemory.set(enemy,{last:s.year,severity:alarm});
  const neighbors=new Set(cells.map(j=>s.pol[j]).filter(id=>id&&id!==o.id));
  for(const id of neighbors){const p=s.pols[id];if(!p||!p.alive||p.kind!=='horde'||p.allies.includes(enemy)||power(p)>power(o)*(0.8+leader))continue;
    if((force||s.r()<alarm*leader*0.3)&&incorporateClans(o,p)){s.societyCounters.threatAccessions++;break}}
  return o;
}
function connectionYear(){
  const s=S;for(const i of WD.landIdx){s.frontierAlarm[i]*=0.96;s.portContact[i]*=0.99;
    if(s.year%5===0&&s.frontierAlarm[i]>0.12)frontierCoalitionAt(i);
    if(!s.pol[i]&&s.portContact[i]>0.05&&s.pop[i]>1000){const contact=s.portContact[i];s.organisation[i]=clamp(s.organisation[i]+0.0015*contact,0,1);s.defensePact[i]=clamp(s.defensePact[i]+0.002*contact,0,1)}
  }
  for(const id of [...s.alive]){const o=s.pols[id];o.sharedThreat=(o.sharedThreat||0)*0.95;
    for(const [enemy,m] of o.threatMemory||[]){if(!s.pols[enemy]?.alive||s.year-m.last>40)o.threatMemory.delete(enemy)}
    if(o.kind==='state')maritimeYear(o);
  }
  for(const e of [...s.expeditions])if(!e.done&&s.year>=e.arrival)landExpedition(e);
}
function colonialMotivation(o){
  const c=o.capital,s=S,land=clamp(s.pop[c]/Math.max(1,s.K[c])-0.55,0,0.8),exclusion=clamp(o.ineq-0.3,0,0.6)*(1-o.rights*0.5);
  const exile=clamp(o.shock*0.25+(1-o.coalition)*0.3,0,0.5),opportunity=s.node[c]*0.2;
  return clamp(land+exclusion+exile+opportunity,0,1);
}
function maritimeYear(o){
  const s=S,c=o.capital;if(!WD.coast[c]||s.sail[c]<0.35||s.pop[c]<4000)return;
  o.merchantFleet=o.merchantFleet||0;o.maritimePractice=o.maritimePractice||0;o.cityStateYears=o.cityStateYears||0;
  const civic=o.cells<=6&&s.urban[c]>1500;if(civic)o.cityStateYears++;
  const due=s.pop[c]*0.0015*(0.2+s.node[c]),paid=budgetAt(o,c,due);s.food[c]+=paid;
  o.merchantFleet=Math.max(0,o.merchantFleet*0.96+paid*0.04*s.sail[c]);o.merchantFree=o.merchantFleet;
  o.maritimePractice=clamp(o.maritimePractice+0.01*(paid/Math.max(1,due))*s.sail[c],0,1);
  if(!civic||s.year-(o.lastFoundation??-100000)<20||o.cityStateYears<30||o.maritimePractice<0.15||s.nutrition[c]<0.75)return;
  if(s.r()>0.012*P.seafaring*colonialMotivation(o))return;
  const target=chooseColonySite(o);if(target>=0)launchExpedition(o,target);
}
function chooseColonySite(o){
  const s=S,w=WD,c=o.capital,candidates=new Set(o.knownPorts||[]);for(let k=w.ls[c];k<w.ls[c+1];k++)if(w.ld[k]<4+12*s.nav[c])candidates.add(w.lt[k]);
  let best=-1,score=0;for(const i of candidates){if(!w.coast[i]||s.pol[i]===o.id||w.T[i]<0)continue;
    const host=s.pol[i]?s.pols[s.pol[i]]:null;if(host&&host.enemies.has(o.id))continue;
    let suitability=0;for(let k=0;k<CROPS.length;k++)suitability=Math.max(suitability,s.cropAccess[k][c]*cropSuitability(k,i));
    if(suitability<0.12&&w.rv[i]<0.3)continue;
    const water=0.2+w.rv[i]+w.waterPotential[i],room=clamp((s.K[i]-s.pop[i])/Math.max(1000,s.K[i]),-0.5,1);
    const harbor=1+0.2*Array.from({length:4},(_,d)=>w.nb[i*4+d]).filter(j=>j>=0&&!w.land[j]).length;
    const value=(suitability+water*0.2+room*0.2+s.node[i]*0.4)*harbor/(1+travelDays(c,i,true)*0.015+s.defensePact[i]+(host?0.4:0));if(value>score){score=value;best=i}
  }return best;
}
function launchExpedition(o,j,relation){
  const s=S,c=o.capital;if(!WD.coast[c]||!WD.coast[j]||s.sail[c]<0.35||o.kind!=='state')return null;
  const days=travelDays(c,j,true),space=(o.merchantFree||0)*50+(o.navyFree||0)*40;
  const n=Math.min(2000,s.pop[c]*0.12,space, (s.food[c]*0.15+publicAvailable(o,c)*0.25)/(1.6+days*0.003));if(n<250)return null;
  const cost=n*(1.6+days*0.003),homePaid=Math.min(s.food[c]*0.15,cost);s.food[c]-=homePaid;
  const paid=budgetAt(o,c,cost-homePaid);if(paid+homePaid<cost*0.999){s.food[c]+=homePaid+paid;return null}
  const prior=s.pop[c],ratio=n/prior,young=s.young[c]*ratio,animals=takeHerd(c,ratio),staff=Math.min(o.staff*0.08,n*0.012),escorts=Math.min(o.army*0.04,n*0.04);
  s.pop[c]-=n;s.young[c]-=young;o.staff-=staff;o.army-=escorts;
  const merchant=Math.min(o.merchantFree||0,n/50);o.merchantFree=Math.max(0,(o.merchantFree||0)-merchant);o.navyFree=Math.max(0,(o.navyFree||0)-Math.max(0,n-merchant*50)/40);
  const e={id:s.expeditions.length,home:c,parent:o.id,dest:j,eth:s.eth[c],ancestry:s.ancestry[c],pop:n,young,animals,staff,escorts,food:n*1.35,crops:s.cropAccess.map(a=>a[c]),tech:s.tk.map(a=>a[c]),immunity:diseaseHistory(c),arrival:s.year+Math.max(1,Math.ceil(days/365)),departed:s.year,days,relation:relation||null,done:false,returning:false};
  s.expeditions.push(e);o.lastFoundation=s.year;diseaseJourney(c,j,days,n,'sea');
  chron('migration',`An expedition of ${fmtK(n)} settlers leaves the ${o.full}, carrying provisions, crafts and civic traditions to an overseas site.`,c,[R_(o),RE(s.eths[e.eth])]);return e;
}
function colonyContact(i,parent){
  const s=S;s.portContact[i]=clamp(s.portContact[i]+0.35,0,1);s.societyCounters.colonialContacts++;
  for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j>=0&&WD.land[j]&&s.pop[j]>300){s.portContact[j]=clamp(s.portContact[j]+0.18,0,1);if(!s.pol[j])s.defensePact[j]=clamp(s.defensePact[j]+0.08,0,1)}}
  if(parent){parent.knownPorts=parent.knownPorts||new Set();parent.knownPorts.add(i)}
}
function landExpedition(e){
  const s=S,parent=s.pols[e.parent];let j=e.returning?e.home:e.dest;
  const eat=Math.min(e.food,e.pop*0.35);e.food-=eat;const mortality=clamp(0.005+0.025*(1-eat/Math.max(1,e.pop*0.35)),0,0.04);
  e.pop*=1-mortality;e.young*=1-mortality;e.staff*=1-mortality;e.escorts*=1-mortality;for(let k=0;k<e.animals.length;k++)e.animals[k]*=0.99;
  const host=s.pol[j]?s.pols[s.pol[j]]:null;
  const accepted=e.returning||(!host||!host.enemies.has(e.parent))&&(e.relation||s.pop[j]<500||s.r()<clamp(0.15+(host?host.rights*0.4:0.3)+(parent?parent.trust*0.2:0)-s.defensePact[j]*0.35,0.05,0.85));
  if(!accepted){if(!e.returning){e.returning=true;e.arrival=s.year+Math.max(1,Math.ceil(e.days/365));s.societyCounters.failedExpeditions++;return}j=e.home}
  const old=s.pop[j],empty=old<1;s.pop[j]+=e.pop;s.young[j]+=e.young;s.food[j]+=e.food;putHerd(j,e.animals);
  if(empty){s.eth[j]=e.eth;s.ancestry[j]=e.ancestry;s.eth2[j]=-1;s.mix[j]=0;s.organisation[j]=0.2}
  else{mergeCulture(j,e.eth,e.pop,old);mergeAncestry(j,e.ancestry,e.pop,old)}
  mixDiseaseHistory(j,e.immunity,e.pop,old);
  for(let k=0;k<CROPS.length;k++)s.cropAccess[k][j]=Math.max(s.cropAccess[k][j],e.crops[k]*0.8);
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],e.tech[k]*Math.min(0.8,e.pop/Math.max(1,s.pop[j])));
  s.newcomers[j]+=e.pop;s.settleLag[j]=Math.max(s.settleLag[j],empty?2:1);
  if(e.returning){if(parent&&parent.alive&&s.pol[j]===parent.id){parent.staff+=e.staff;parent.army+=e.escorts}}
  else{colonyContact(j,parent);
    const relation=host?'enclave':e.relation||(parent&&parent.alive&&transportAccess(e.home,parent)>0.5&&parent.cells>6&&parent.navy>2?'dependent':'independent');
    if(relation==='enclave'||old>e.pop*8&&s.organisation[j]>0.5){s.enclaves.push({parent:e.parent,cell:j,eth:e.eth,people:e.pop,born:s.year});s.societyCounters.tradingEnclaves++;chron('migration','Overseas settlers establish a trading enclave by agreement with local communities.',j,[RE(s.eths[e.eth])])}
    else{const id=newPolity(j,parent&&parent.alive?parent:null,{origin:{type:'colony',from:e.parent,relation,why:'An overseas civic foundation supported by actual settlers and an agreement over the site.'}}),o=s.pols[id];
      o.core=e.eth;o.staff=e.staff;o.army=e.escorts;o.rights=Math.max(0.5,o.rights);o.gov='Council';o.bureau*=0.7;o.central*=0.7;
      const reserve=Math.min(s.food[j]*0.2,e.pop*0.2);s.food[j]-=reserve;o.grain+=reserve;s.autonomy[j]=0.7;
      if(relation==='dependent'&&parent?.alive){o.over=parent.id;o.overY=s.year;parent.tribs++}
      if(parent?.alive){o.allies.push(parent.id);if(!parent.allies.includes(id))parent.allies.push(id)}
      if(s.city[j]<0){s.city[j]=s.cities.length;s.cities.push({cell:j,name:cityWord(langAt(j),s.r),born:s.year,eth:e.eth,peak:e.pop})}s.urban[j]=Math.max(s.urban[j],Math.min(s.pop[j]*0.4,e.pop*0.5));
      s.societyCounters.maritimeFoundations++;chron('rise',`Settlers establish the ${o.full} as ${relation==='dependent'?'a dependent overseas foundation':'an independent daughter city'}.`,j,[R_(o),...(parent?[R_(parent)]:[])]);
    }
  }
  e.done=true;e.food=0;e.animals=emptyHerd();e.result=e.returning?'returned':s.pol[j]?'settled':'enclave';
}
