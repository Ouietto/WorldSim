/* Transport stocks, geographic networks and political continuity.
   Distances are estimated travel days (stored in half-day units). These are
   coarse scenario rules, not reconstructed historical itineraries. */
const ANIMALS=[
  {k:'cattle',n:'Cattle',draft:0.18,pack:0.04,mount:0,rate:0.065,feed:0.08},
  {k:'buffalo',n:'Water buffalo',draft:0.22,pack:0.02,mount:0,rate:0.055,feed:0.07},
  {k:'donkey',n:'Donkeys',draft:0.03,pack:0.65,mount:0.04,rate:0.05,feed:0.045},
  {k:'horse',n:'Horses',draft:0.08,pack:0.18,mount:0.22,rate:0.05,feed:0.12},
  {k:'camel',n:'Camels',draft:0,pack:0.7,mount:0.12,rate:0.035,feed:0.045},
  {k:'llama',n:'Llamas',draft:0,pack:0.45,mount:0,rate:0.06,feed:0.035}
];
function emptyHerd(){return ANIMALS.map(()=>0)}
function addHerd(a,b){for(let k=0;k<a.length;k++)a[k]+=b[k]||0;return a}
function takeHerd(i,share){const s=S,a=emptyHerd();share=clamp(share,0,1);for(let k=0;k<a.length;k++){a[k]=s.animals[k][i]*share;s.animals[k][i]-=a[k]}refreshAnimalAccess(i);return a}
function putHerd(i,a){if(!a)return;for(let k=0;k<ANIMALS.length;k++)S.animals[k][i]+=a[k]||0;refreshAnimalAccess(i)}
function initDynamics(){
  const s=S,w=WD;
  s.animals=ANIMALS.map(()=>new Float64Array(N));s.animalFeed=new Float32Array(N).fill(1);
  for(const k of ['traction','pack','mounts','cityIdentity','eliteStake','eliteLoyalty','orchards','raiding'])s[k]=new Float32Array(N);
  s.cityHome=new Int32Array(N);s.returnDist=new Uint16Array(N).fill(65535);s.supplyDist=new Uint16Array(N).fill(65535);
  s.clan=new Int32Array(N);s.animalOrigins=[];
  Object.assign(s.societyCounters,{animalBirths:0,animalDeaths:0,domesticated:0,confederations:0,clanDepartures:0,eliteDefections:0,admissions:0,brokenCompacts:0,successionFractures:0,leagues:0});
  for(const i of w.landIdx){s.eliteStake[i]=0.2;s.eliteLoyalty[i]=0.5;s.clan[i]=1+Math.floor(w.cxA[i]/3)+Math.ceil(W/3)*Math.floor(w.cyA[i]/3)}
  prepareCorridors(w);
  // Approximate scenario anchors for animal populations, distinct from knowledge
  // of herding/riding. Historical mode does not put breeders on every continent.
  const origins=[[0,38,39,-8500],[0,28,67,-6500],[1,28,72,-3000],[2,25,32,-3500],[3,48,43,-2200],[4,40,75,-2200],[4,22,50,-1200],[5,-14,-70,-3500]];
  if(w.isEarth&&P.hearthMode!=='random'){
    for(const [kind,la,lo,year] of origins){const at=nearestPeopled(cellAt(la,lo),8,i=>kind===1?animalSuitability(kind,i)>0.8:kind===4?animalSuitability(kind,i)>0.9:true);if(at>=0)s.animalOrigins.push({kind,cell:at,year,done:false})}
  }else{
    for(let kind=0;kind<ANIMALS.length;kind++){
      let cell=-1,best=0;for(let n=0;n<600;n++){const i=w.landIdx[(s.r()*w.landIdx.length)|0],v=animalSuitability(kind,i)*(0.6+0.4*s.r());if(s.pop[i]>100&&v>best){best=v;cell=i}}
      if(cell>=0)s.animalOrigins.push({kind,cell,year:s.start+1200+kind*550+Math.floor(s.r()*1800),done:false});
    }
  }
  animalOrigins();
}
function prepareCorridors(w){
  if(w.corridorsReady)return;
  w.riverNav=new Float32Array(N);w.riverBasin=new Int32Array(N).fill(-1);
  w.riverHead=new Int32Array(N).fill(-1);w.riverNext=new Int32Array(N).fill(-1);w.coastalCrop=new Float32Array(N);
  for(const i of w.landIdx){
    const j=w.down[i],drop=j>=0&&w.land[j]?Math.max(0,w.elev[i]-w.elev[j]):0;
    w.riverNav[i]=clamp((w.rv[i]-0.3)/0.45,0,1)*(1-0.8*w.rough[i])*clamp(1-drop/250,0,1);
    if(j>=0&&w.land[j]){w.riverNext[i]=w.riverHead[j];w.riverHead[j]=i}
    // Mediterranean-type crop opportunities also occur outside the Mediterranean.
    // Coastal shipping makes this potential useful; it does not irrigate deserts.
    const mild=clamp((w.T[i]-8)/7,0,1)*clamp((29-w.T[i])/7,0,1);
    w.coastalCrop[i]=w.coast[i]?mild*clamp((w.Pr[i]-220)/220,0,1)*clamp((1400-w.Pr[i])/500,0,1)*(1-w.rough[i]*0.6):0;
  }
  for(const i of w.landIdx){if(w.riverBasin[i]>=0)continue;let j=i,root=i;const path=[];
    while(j>=0&&w.land[j]&&w.riverBasin[j]<0){path.push(j);root=j;j=w.down[j]}
    if(j>=0&&w.land[j])root=w.riverBasin[j];for(const c of path)w.riverBasin[c]=root;
  }
  w.corridorsReady=true;
}
function animalSuitability(k,i){
  const w=WD,t=w.T[i],rain=w.Pr[i],rough=w.rough[i],disease=w.tsetse[i]?0.18:1;
  let v=1;
  if(k===0)v=clamp((t+13)/12,0,1)*clamp((36-t)/10,0,1)*clamp((rain-120)/400,0.05,1)*disease;
  if(k===1)v=clamp((t-9)/10,0,1)*clamp((rain+900*w.rv[i]-450)/700,0,1)*(w.tsetse[i]?0.35:1);
  if(k===2)v=clamp((t+5)/15,0,1)*clamp((2200-rain)/1200,0.05,1)*disease;
  if(k===3)v=clamp((t+15)/15,0,1)*clamp((33-t)/10,0,1)*clamp((rain-100)/250,0.05,1)*clamp((2600-rain)/1500,0.1,1)*disease;
  if(k===4)v=clamp((1600-rain)/900,0.02,1)*clamp((t+12)/15,0,1);
  if(k===5)v=clamp((27-t)/12,0,1)*clamp((2500-rain)/1200,0.05,1)*clamp((rain-100)/250,0.05,1);
  return clamp(v*(1-rough*(k===5?0.15:0.45)),0,1);
}
function animalOrigins(){
  const s=S;for(const h of s.animalOrigins){if(h.done||s.year<h.year)continue;h.done=true;
    const n=Math.min(300,Math.max(20,s.pop[h.cell]*0.025));s.animals[h.kind][h.cell]+=n;s.societyCounters.domesticated+=n;
    s.herd[h.cell]=Math.max(0.7,s.herd[h.cell]);if(h.kind===3)s.horse[h.cell]=Math.max(0.7,s.horse[h.cell]);if(h.kind===4)s.camel[h.cell]=Math.max(0.7,s.camel[h.cell]);
    refreshAnimalAccess(h.cell);chron('ideas',`Communities begin breeding ${ANIMALS[h.kind].n.toLowerCase()} for work and transport.`,h.cell);
  }
}
function refreshAnimalAccess(i){
  const s=S,p=Math.max(100,s.pop[i]);let draft=0,pack=0,mount=0;
  for(let k=0;k<ANIMALS.length;k++){const n=s.animals[k][i],a=ANIMALS[k];draft+=n*a.draft;pack+=n*a.pack;mount+=n*a.mount}
  s.traction[i]=clamp(draft/(p*0.018),0,1);s.pack[i]=clamp(pack/(p*0.025),0,1);s.mounts[i]=clamp(mount/(p*0.01),0,1);
}
function animalFodder(i){let n=0;for(let k=0;k<ANIMALS.length;k++)n+=S.animals[k][i]*ANIMALS[k].feed;return n*(0.35+0.65*S.farm[i])}
function animalPass(){
  const s=S,w=WD;animalOrigins();if(s.year%5!==0)return;
  const a={start:0,births:0,deaths:0,end:0};
  for(const i of w.landIdx){
    let total=0;for(const f of s.animals)total+=f[i];a.start+=total;if(total<=0)continue;
    const scrub=w.desert[i]?w.area[i]*0.12*(0.2+Math.min(1,w.Pr[i]/250))*s.animals[4][i]/Math.max(1,total):0;
    const capacity=Math.max(1,s.pop[i]*(0.1+0.3*s.farm[i])+w.area[i]*w.sH[i]*0.5*(1-0.7*s.forest[i])+scrub);
    const crowd=Math.max(0,total/(capacity*pastureCondition(i))-1),shock=Math.max(0,0.65-pastureCondition(i));
    for(let k=0;k<ANIMALS.length;k++){const n=s.animals[k][i];if(n<=0)continue;
      const suit=animalSuitability(k,i),birth=n*ANIMALS[k].rate*5*suit*s.animalFeed[i]*(0.3+0.7*s.herd[i])*Math.max(0,1-total/capacity);
      const loss=Math.min(n+birth,n*5*(0.012+0.075*(1-suit)+0.06*(1-s.animalFeed[i])+0.08*shock+0.04*Math.min(3,crowd)));
      s.animals[k][i]=n+birth-loss;a.births+=birth;a.deaths+=loss;
    }
  }
  // Transfers are staged, preventing a breeding population from crossing the
  // entire continent in one pass. Payments are transfers of household food.
  const delta=ANIMALS.map(()=>new Float64Array(N)),available=s.animals.map(f=>Float64Array.from(f));
  const exchange=(i,j,capacity)=>{
    const oi=s.pol[i]?s.pols[s.pol[i]]:null,oj=s.pol[j]?s.pols[s.pol[j]]:null;
    if(oi&&oj&&(oi.enemies.has(oj.id)||oj.enemies.has(oi.id)))return;
    for(let k=0;k<ANIMALS.length;k++){
      const ri=s.animals[k][i]/Math.max(100,s.pop[i]),rj=s.animals[k][j]/Math.max(100,s.pop[j]);if(Math.abs(ri-rj)<0.0005)continue;
      const from=ri>rj?i:j,to=from===i?j:i;if(s.herd[to]<0.2||s.pop[to]<100)continue;
      const amount=Math.min(available[k][from]*capacity,Math.abs(ri-rj)*Math.max(100,s.pop[to])*0.25,s.food[to]/0.08)*animalSuitability(k,to);
      if(amount<=0)continue;available[k][from]-=amount;delta[k][from]-=amount;delta[k][to]+=amount;s.food[to]-=amount*0.08;s.food[from]+=amount*0.08;
    }
  };
  for(const i of w.landIdx)if(s.pop[i]>=100)for(let d=0;d<2;d++){const j=w.nb[i*4+(d===0?1:3)];if(j>=0&&w.land[j])exchange(i,j,0.025+0.05*Math.min(s.node[i],s.node[j]))}
  for(const e of s.tradeEdges)exchange(e.a,e.b,0.1);
  for(const i of w.landIdx){for(let k=0;k<ANIMALS.length;k++){s.animals[k][i]+=delta[k][i];a.end+=s.animals[k][i]}refreshAnimalAccess(i)}
  s.societyCounters.animalBirths+=a.births;s.societyCounters.animalDeaths+=a.deaths;a.error=a.start+a.births-a.deaths-a.end;s.animalAccounts=a;
}
function riverBoats(i){return clamp(0.1+0.35*S.farm[i]+0.4*S.sail[i]+0.15*S.organisation[i],0,1)}
function waterTransport(i){return Math.max(S.sail[i]*(WD.coast[i]?0.7:0),riverBoats(i)*(WD.riverNav[i]||0))*(0.4+0.6*S.infrastructure[i])}
function transportSupport(i){return clamp(0.1+0.42*S.pack[i]+0.23*S.traction[i]+0.75*waterTransport(i)+0.18*S.organisation[i],0.1,1)}
function frontierTransport(i,j){
  const s=S,w=WD,p=Math.max(100,s.pop[i]);let carrying=0,draft=0;
  for(let k=0;k<ANIMALS.length;k++){const usable=s.animals[k][i]*animalSuitability(k,j);carrying+=usable*ANIMALS[k].pack;draft+=usable*ANIMALS[k].draft}
  const water=alongRiver(i,j)?riverBoats(i)*Math.min(w.riverNav[i],w.riverNav[j]):w.coast[i]&&w.coast[j]?s.sail[i]*0.7:0;
  return clamp(0.1+0.42*clamp(carrying/(p*0.025),0,1)+0.23*clamp(draft/(p*0.018),0,1)+0.75*water+0.18*s.organisation[i],0.1,1);
}
function alongRiver(i,j){return WD.down[i]===j||WD.down[j]===i}
function crossingRiver(i,j){
  const w=WD;if(alongRiver(i,j))return 0;const c=w.rv[i]>=w.rv[j]?i:j;if(w.rv[c]<0.45)return 0;
  const d=w.down[c];if(d<0)return 0;const fx=dxWrap(c,d),fy=w.cyA[d]-w.cyA[c],mx=dxWrap(i,j),my=w.cyA[j]-w.cyA[i];
  const dot=Math.abs(fx*mx+fy*my)/Math.max(1,Math.hypot(fx,fy)*Math.hypot(mx,my));return dot<0.65?w.rv[c]:0;
}
function borderBarrier(i,j){
  const w=WD,bridge=Math.min(S.roads[i]*S.infrastructure[i],S.roads[j]*S.infrastructure[j]);
  return clamp(Math.max(w.rough[i],w.rough[j])*0.8+crossingRiver(i,j)*(1-0.65*bridge),0,1.6);
}
function routeCost(i,j,o,supply){
  const s=S,w=WD,km=100*Math.hypot(dxWrap(i,j)*w.cosLat[i],w.cyA[j]-w.cyA[i]);
  const road=Math.min(s.roads[i]*s.infrastructure[i],s.roads[j]*s.infrastructure[j]);
  const terrain=1+P.terrain*(Math.max(w.rough[i],w.rough[j])*2.2+Math.max(s.forest[i],s.forest[j])*0.8+Math.max(w.desert[i],w.desert[j])*0.9);
  const mounted=Math.min(s.mounts[i],s.mounts[j]),relay=Math.min(skill(i,'post'),skill(j,'post'))*Math.min(s.infrastructure[i],s.infrastructure[j]);
  let days=km/(supply?25*(0.25+0.75*Math.min(s.pack[i],s.pack[j])):25+35*mounted+65*mounted*relay);
  days*=terrain/(1+road*0.8);days+=crossingRiver(i,j)*(1.3-road*0.9);
  if(o.kind==='horde'&&w.nomad[i]&&w.nomad[j])days*=0.65;
  if(alongRiver(i,j)){
    const nav=Math.min(w.riverNav[i],w.riverNav[j]),sail=Math.min(riverBoats(i),riverBoats(j));
    const season=clamp(0.5+0.5*Math.min(s.wm[i],s.wm[j])-0.2*(w.rainSeasonality?w.rainSeasonality[i]:0),0.2,1)*(w.T[i]<2?0.65:1);
    const speed=w.down[i]===j?75:30,canal=Math.min(skill(i,'canal'),skill(j,'canal'))*Math.min(s.infrastructure[i],s.infrastructure[j]);
    const boat=km/(speed*(0.5+0.5*sail))*(supply?0.2:1)/(Math.max(0.05,nav*season)*(0.6+0.4*s.infrastructure[i])+canal*0.4);
    if(sail>0.25)days=Math.min(days,boat);
  }
  return clamp(days,0.5,60);
}
function routeDistances(){
  const s=S,w=WD,run=(out,reverse,supply)=>{
    out.fill(65535);const buckets=Array.from({length:256},()=>[]);let pending=0;
    for(const id of s.alive){const o=s.pols[id],c=o.capital;if(s.pol[c]!==id)continue;out[c]=0;buckets[0].push(c);pending++}
    const relax=(i,j,d,cost)=>{if(j<0||s.pol[j]!==s.pol[i])return;const nd=d+Math.max(1,Math.min(240,Math.round(cost*2)));if(nd<out[j]){out[j]=nd;buckets[nd&255].push(j);pending++}};
    for(let d=0;pending&&d<65535;d++){const q=buckets[d&255];buckets[d&255]=[];
      for(const i of q){pending--;if(out[i]!==d)continue;const o=s.pols[s.pol[i]];
        for(let k=0;k<4;k++){const j=w.nb[i*4+k];if(j>=0&&s.pol[j]===o.id)relax(i,j,d,reverse?routeCost(j,i,o,supply):routeCost(i,j,o,supply))}
        const down=w.down[i];if(down>=0&&w.land[down]&&s.pol[down]===o.id)relax(i,down,d,reverse?routeCost(down,i,o,supply):routeCost(i,down,o,supply));
        for(let j=w.riverHead[i];j>=0;j=w.riverNext[j])if(s.pol[j]===o.id)relax(i,j,d,reverse?routeCost(j,i,o,supply):routeCost(i,j,o,supply));
        if(w.coast[i]&&s.sail[i]>0.5)for(let k=w.ls[i];k<w.ls[i+1];k++){const j=w.lt[k],distance=w.ld[k];if(s.pol[j]!==o.id||s.sail[j]<0.3||(distance>3&&s.nav[i]<0.5))continue;
          const season=w.T[i]<2?1.5:1.1;relax(i,j,d,distance*season*(supply?0.3:0.9)/(0.5+0.5*Math.min(s.sail[i],s.sail[j])));
        }
      }
    }
  };
  run(s.dist,false,false);run(s.returnDist,true,false);run(s.supplyDist,false,true);
}
function settlementAppeal(i,j,o){
  const s=S,w=WD,market=w.coast[j]?s.sail[i]*(0.25+0.75*s.node[i])*(0.3+w.coastalCrop[j]):0;
  const yieldValue=clamp(s.K[j]/Math.max(1000,s.pop[j]+2000),0,3),access=o?transportAccess(i,o):1;
  return clamp((0.35+yieldValue*0.25+market)*access*(1-0.8*frontierRisk(j))/(1+w.rough[j]+s.forest[j]*0.5),0.02,2.5);
}
function initPoliticalDynamics(o,from){
  o.preparedness=from?from.preparedness*0.85:0.3;o.crisisMemory=from?from.crisisMemory*0.8:0.25;
  o.frontierIntel=from?from.frontierIntel*0.8:0.25;o.raidSkill=from?from.raidSkill*0.7:0.1;
  o.conquestLoad=0;o.recentShare=0;o.responseDays=0;o.supplyBurden=0;o.corridor=0;o.borderLoad=0;o.cityCount=0;
  o.lastConflict=S.year;o.lastBorderChange=S.year;o.peaceYears=0;o.trainingPaid=0;o.auxiliaries=0;
  o.compacts=[];o.raidTargets=new Map();o.clanTerms=new Map();o.clanPops=new Map();o.lastClanExit=-1e9;
  initFrontierPolity(o,from);
  if(S.urban[o.capital]>2000&&!S.cityHome[o.capital])S.cityHome[o.capital]=o.id;
}
function conquestRecorded(o,j,previous){
  const s=S;if(previous===o.id)return;
  if(previous&&s.urban[j]>2000&&!s.cityHome[j])s.cityHome[j]=previous;
  o.conquestLoad=clamp((o.conquestLoad||0)+s.pop[j]/Math.max(1000,o.pop)*0.6+(s.cityHome[j]&&s.cityHome[j]!==o.id?0.05:0),0,3);
  o.lastBorderChange=s.year;
  s.taken[j]=s.year;s.returnDist[j]=65535;s.supplyDist[j]=65535;
  if(previous&&s.pols[previous])s.pols[previous].lastBorderChange=s.year;
}
function crisisEncounter(o,target,won,severity){
  if(!o)return;const s=S,survival=clamp(1-severity,0,1);
  o.lastConflict=s.year;o.crisisMemory=clamp(o.crisisMemory+0.035*survival,0,1);o.frontierIntel=clamp(o.frontierIntel+0.04*survival,0,1);
  if(o.kind==='horde')o.raidSkill=clamp(o.raidSkill+(won?0.025:0.012)*survival-severity*0.15,0,1);
  if(target){let t=o.raidTargets.get(target.id);if(!t){t={knowledge:0,failures:0,last:s.year};o.raidTargets.set(target.id,t)}
    t.knowledge=clamp(t.knowledge+0.07*survival,0,1);t.failures=won?Math.max(0,t.failures-1):Math.min(8,t.failures+1);t.last=s.year;
    if(o.raidTargets.size>16)o.raidTargets.delete(o.raidTargets.keys().next().value);
  }
}
function strategicStep(o,c,y){
  const s=S,records=recordSkill(c),schools=skill(c,'school'),continuity=clamp(records*0.35+schools*o.bureau*0.4+o.succession*0.25,0,1);
  const trainingDue=(o.army*0.08+o.pop*0.001)*(0.25+0.75*o.ruler.comp),paid=budgetPay(o,trainingDue);
  o.trainingPaid=trainingDue>0?paid/trainingDue:0;
  const target=clamp(0.15+o.trainingPaid*0.35+o.bureau*0.2+continuity*0.2+(y-o.lastConflict<12?0.1:0)-o.hunger*0.3,0,1);
  o.preparedness=clamp(o.preparedness+0.025*(target-o.preparedness),0,1);
  o.crisisMemory=clamp(o.crisisMemory*(1-0.012*(1-continuity))+0.003*continuity*o.trainingPaid,0,1);
  o.frontierIntel=clamp(o.frontierIntel*0.986+0.009*o.trainingPaid*(0.4+0.6*o.preparedness),0,1);
  o.raidSkill=clamp(o.raidSkill*(1-0.004*(1-o.trainingPaid*0.7)),0,1);
  for(const [id,t] of o.raidTargets){t.knowledge*=0.99;if(y-t.last>100)o.raidTargets.delete(id)}
  o.peaceYears=Math.max(0,y-Math.max(o.lastConflict,o.lastBorderChange));
  o.conquestLoad=clamp(o.conquestLoad*(1-0.006-0.012*o.bureau*o.trust*o.payroll),0,3);
  compactStep(o);
  if(o.kind==='horde')confederationStep(o);
  // Landed intermediaries can consolidate local power during effective defense.
  // Rights and rents give them a stake, while salaried alternatives constrain it.
  const localTarget=clamp(0.3+o.ineq*0.45+o.rights*0.15-o.bureau*0.25,0.15,0.9);
  o.nobles=clamp(o.nobles+0.0015*(localTarget-o.nobles),0.1,0.95);
}
function successionExposure(o,oldRuler){
  const personal=clamp(oldRuler.conq/Math.max(3,o.cells),0,1)*(0.4+0.6*oldRuler.char);
  const unresolved=clamp(o.conquestLoad*0.2+o.recentShare*0.55+personal*0.4,0,1);
  let risk=unresolved*(1-0.75*o.succession)*(1-0.45*o.bureau)*(1-0.35*o.trust);
  if(o.kind==='horde'){
    let n=0,loyal=0;for(const t of o.clanTerms.values()){loyal+=t.loyalty;n++}
    risk+=0.3*(1-(n?loyal/n:o.coalition))*(1-0.7*o.succession)+0.24*o.coalitionFatigue*(1-0.8*o.patronage);
  }
  return clamp(risk,0,0.85);
}
function localPolitics(i,o){
  const s=S,p=s.pop[i],city=clamp(s.urban[i]/Math.max(1000,p)*6,0,1);
  s.cityIdentity[i]=clamp(s.cityIdentity[i]+0.025*(city*s.organisation[i]-s.cityIdentity[i]),0,1);
  if(!o){s.eliteLoyalty[i]*=0.98;return}
  if(city>0.2&&!s.cityHome[i])s.cityHome[i]=o.id;
  const security=clamp(o.health*(0.4+0.6*o.payroll)-o.hunger,0,1);
  const property=clamp(0.2+0.5*o.rights+0.3*security,0,1);
  s.eliteStake[i]=clamp(s.eliteStake[i]+0.025*(property*s.farm[i]-s.eliteStake[i]),0,1);
  const civic=s.cityHome[i]&&s.cityHome[i]!==o.id?(1-s.integ[i])*s.cityIdentity[i]*0.35:0;
  const loyalty=clamp(0.15+0.4*security+0.25*o.rights+0.25*s.eliteStake[i]-0.2*o.central-civic,0,1);
  s.eliteLoyalty[i]=clamp(s.eliteLoyalty[i]+0.06*(loyalty-s.eliteLoyalty[i]),0,1);
  if(s.cityHome[i]!==o.id&&s.integ[i]>0.85&&o.trust>0.65&&s.year-s.taken[i]>150&&s.r()<0.01)s.cityHome[i]=o.id;
  if(WD.coast[i]&&WD.coastalCrop[i]>0.15&&s.farm[i]>0.3){
    const market=waterTransport(i)*clamp(s.node[i]+(o.cityPop||0)/Math.max(1,o.pop),0,1),due=p*0.006*market;
    const paid=budgetPay(o,Math.min(due,o.grain*0.04));
    s.orchards[i]=clamp(s.orchards[i]+0.035*(due>0?paid/due:0)*market*(1-s.orchards[i])-0.025*(1-o.payroll)*s.orchards[i],0,1);
  }
}
function eliteDefectionChance(attacker,j){
  const s=S,d=s.pol[j]?s.pols[s.pol[j]]:null;if(!d||d===attacker)return 0;
  const incumbent=s.eliteLoyalty[j]*0.45+s.eliteStake[j]*d.rights*0.25+d.health*d.payroll*0.3;
  const credible=attacker.rights*(0.3+0.7*attacker.health)*(0.4+0.6*attacker.payroll);
  const offer=0.15+credible*0.45+attacker.ruler.comp*0.15+Math.max(0,0.5-d.mandate)*0.3-ethDist(attacker.core,s.eth[j])*0.08;
  const crisis=clamp((1-d.health)*0.5+(1-d.payroll)*0.3+(1-d.mandate)*0.2,0,1);
  return clamp((offer-incumbent-0.12)*crisis*(0.2+0.8*s.autonomy[j]),0,0.35);
}
function switchEliteAllegiance(attacker,j){
  const s=S,old=s.pol[j],d=s.pols[old];if(!d||old===attacker.id)return false;
  conquestRecorded(attacker,j,old);const contingent=Math.min(d.army,d.army*s.pop[j]/Math.max(1,d.pop)*0.35);
  d.army-=contingent;attacker.army+=contingent;s.pol[j]=attacker.id;s.taken[j]=s.year;s.integ[j]=0.3;
  s.autonomy[j]=Math.max(0.8,s.autonomy[j]);s.eliteLoyalty[j]=0.6;attacker.nobles=Math.min(0.95,attacker.nobles+0.025);d.shock+=0.08;
  s.dist[j]=65535;s.returnDist[j]=65535;s.supplyDist[j]=65535;s.societyCounters.eliteDefections++;
  chron('diplomacy',`Local landholders accept the protection of the ${attacker.full}, retaining their estates and local authority.`,j,[R_(attacker),R_(d)]);return true;
}
function nomadOpportunity(i){
  const s=S,w=WD;let prize=0,threat=0;
  ring(i,3,j=>{const id=s.pol[j],o=id?s.pols[id]:null;if(o&&o.kind==='state'){prize=Math.max(prize,clamp(o.pop/300000,0,1));threat=Math.max(threat,o.enemies.size?0.5:0.2)}});
  return clamp(0.15+prize*0.6+threat+Math.max(0,s.anom[i])*0.25+s.raiding[i]*0.35,0.1,1.5);
}
function settledStateHabitat(i){
  const s=S,w=WD;return !(w.rangeExposure[i]>0.4&&frontierRisk(i)>0.18)||s.urban[i]>10000&&s.farm[i]*farmSuit(i)>0.12&&(w.rv[i]>0.35||s.node[i]>0.7)&&frontierRisk(i)<0.5;
}
function confederationStep(o){
  const s=S;if(s.year%5!==0)return;
  let total=0;for(const p of o.clanPops.values())total+=p;
  const cells=s.realmCells.get(o.id)||polCells(o.id);let reward=0;
  for(const i of cells)if(s.pol[i]===o.id){const paid=budgetAt(o,i,Math.min(publicAvailable(o,i)*0.12,s.pop[i]*0.012));s.food[i]+=paid;reward+=paid}
  const fair=clamp(reward/Math.max(1,total*0.012),0,1);
  const generations=clamp((s.year-o.born-35)/100,0,1.5),bargains=(1-o.succession*0.65)*(1-o.trust*0.25);
  const fatigue=clamp(generations*bargains*(1-o.patronage*0.85)*(1-0.3*o.momentum)+o.strain*0.3,0,1);
  o.coalitionFatigue=clamp(o.coalitionFatigue+0.12*(fatigue-o.coalitionFatigue),0,1);
  let external=0;for(const [id] of o.nb){const p=s.pols[id];if(p&&p.alive&&p.kind==='state')external=Math.max(external,clamp(power(p)/Math.max(1,power(o)),0,1))}
  let departing=-1,worst=1;
  for(const [clan,p] of o.clanPops){
    let t=o.clanTerms.get(clan);if(!t){t={loyalty:0.6,joined:s.year};o.clanTerms.set(clan,t)}
    const target=clamp(0.1+0.22*o.ruler.char+0.24*fair+0.15*external+0.16*o.succession+0.15*o.trust+0.14*(o.momentum||0)-0.35*o.hunger-0.18*o.strain-0.35*o.coalitionFatigue+o.patronage*0.12,0,1);
    t.loyalty=clamp(t.loyalty+0.12*(target-t.loyalty)-0.06*o.shock,0,1);
    if(t.loyalty<worst&&p>2000){worst=t.loyalty;departing=clan}
  }
  for(const clan of o.clanTerms.keys())if(!o.clanPops.has(clan))o.clanTerms.delete(clan);
  if(departing>=0&&worst<0.32&&o.cells>=4&&s.year-o.lastClanExit>12&&s.r()<0.25)releaseClan(o,departing);
}
function releaseClan(o,clan){
  const s=S,cells=(s.realmCells.get(o.id)||polCells(o.id)).filter(i=>s.pol[i]===o.id&&s.clan[i]===clan&&i!==o.capital);if(!cells.length)return false;
  const pop=cells.reduce((n,i)=>n+s.pop[i],0);let child=null;
  if(pop>5000&&cells.length>1){const id=newPolity(cells[0],o,{kind:'horde',origin:{type:'rebellion',from:o.id,why:'Member clans reject the distribution of protection and rewards.'}});child=s.pols[id];for(const i of cells)s.pol[i]=id;partitionInstitutions(o,[child])}
  else for(const i of cells)s.pol[i]=0;
  o.lastClanExit=s.year;o.clanTerms.delete(clan);s.societyCounters.clanDepartures++;
  chron('fall',`Member clans leave the ${o.full} after protection and promised rewards fail.`,cells[0],[R_(o),...(child?[R_(child)]:[])]);return true;
}
function raidAttraction(o,i,j){
  const s=S,t=s.pol[j]?s.pols[s.pol[j]]:null,known=t?o.raidTargets.get(t.id):null;
  const value=clamp(s.food[j]/Math.max(500,s.pop[j]*0.3),0.1,2),resistance=fieldDefense(j,false)/Math.max(1,power(o));
  return value*(1+(known?known.knowledge*0.3:0))/(1+borderBarrier(i,j)+resistance*0.6+(known?known.failures*0.5:0));
}
function chooseMigrationVector(o){
  const path=migrationRoute(o,o.capital,Math.max(100,o.pop*0.045));o.plannedRoute=path;
  if(path.length){const first=path[0];return [dxWrap(o.capital,first),WD.cyA[first]-WD.cyA[o.capital]]}
  const angle=S.r()*Math.PI*2;return [Math.cos(angle),Math.sin(angle)];
}
function admissionChance(M,j,o){
  const s=S,room=Math.max(0,s.K[j]*0.95-s.pop[j]),need=M.pop*0.25;
  if(!o||o.kind!=='state'||o.health<0.35||room<M.pop*0.3||o.grain<need)return 0;
  const affinity=1-ethDist(M.eth,s.eth[j]);
  return clamp(0.1+0.3*o.rights+0.2*o.trust+0.15*affinity+0.15*(1-o.press)-0.2*M.pop/Math.max(1,s.pop[j]),0,0.8);
}
function admitMigration(M,j,o){
  const grant=M.pop*0.25;if(o.grain<grant)return false;
  M.food+=budgetPay(o,grant);M.peaceful=true;M.admission={host:o.id,cell:j,promised:M.pop*0.045};return true;
}
function compactStep(o){
  const s=S;o.auxiliaries=0;
  for(const t of o.compacts){
    if(t.done)continue;if(s.pol[t.cell]!==o.id){t.done=true;continue}
    const n=Math.min(t.people,s.pop[t.cell]*0.6),due=t.promised,paid=budgetPay(o,due);s.food[t.cell]+=paid;
    const fulfillment=due>0?paid/due:1;t.loyalty=clamp(t.loyalty+0.04*(fulfillment-t.loyalty)-0.02*(1-s.nutrition[t.cell]),0,1);
    o.auxiliaries+=n*0.025*t.loyalty;
    if(fulfillment<0.4){t.failures++;s.unrest[t.cell]=clamp(s.unrest[t.cell]+0.025,0,1)}else t.failures=Math.max(0,t.failures-1);
    if(t.failures>=3&&t.loyalty<0.45&&!t.broken){t.broken=true;s.societyCounters.brokenCompacts++;o.shock+=0.15;
      chron('migration',`Settlers in the ${o.full} protest broken promises of provisions and protection.`,t.cell,[R_(o),RE(s.eths[t.eth])]);
    }
    if(t.broken&&t.loyalty<0.2&&n>=1000&&s.activeMigs.length<20){
      const p=s.pop[t.cell],take=Math.min(n*0.6,p*0.3),share=take/Math.max(1,p),food=s.food[t.cell]*share,young=s.young[t.cell]*share,animals=takeHerd(t.cell,share);
      s.pop[t.cell]-=take;s.food[t.cell]-=food;s.young[t.cell]-=young;
      const angle=s.r()*Math.PI*2;startMigration({eth:t.eth,pop:take,food,young,animals,cell:t.cell,dx:Math.cos(angle),dy:Math.sin(angle),kind:'warband',cause:'broken compact'});t.done=true;
    }
    if(s.year-t.since>=25)t.done=true;
  }
  o.compacts=o.compacts.filter(t=>!t.done);
}
function leagueDiplomacy(o,p){
  const s=S;if(o.kind!=='state'||p.kind!=='state'||o.cells>6||p.cells>6||p.over||o.over||o.enemies.size||p.enemies.size)return;
  if(o.rights<0.35||o.trust<0.5||p.trust<0.5||!o.allies.includes(p.id))return;
  const stronger=power(o)>=power(p)?o:p,weaker=stronger===o?p:o;
  if(s.r()<0.008*P.allyRate){weaker.over=stronger.id;weaker.overY=s.year;stronger.tribs++;weaker.league=true;s.societyCounters.leagues++;
    chron('diplomacy',`The ${weaker.full} joins a league led by the ${stronger.full}, keeping its own council and laws.`,weaker.capital,[R_(weaker),R_(stronger)]);
  }
}
function scaleMigration(M,factor){M.pop*=factor;M.young*=factor;for(const g of M.groups)g.pop*=factor}
function turnMigration(M){M.route=[];const angle=(S.r()<0.5?-1:1)*(0.8+S.r()*0.8),x=M.dx,y=M.dy;M.dx=x*Math.cos(angle)-y*Math.sin(angle);M.dy=x*Math.sin(angle)+y*Math.cos(angle)}
function recruitMigration(M,j){
  const s=S,id=s.pol[j];if(M.kind==='people'||M.steps%5||s.pop[j]<2000||id&&id!==M.pol)return;
  if(s.r()>0.12+0.18*M.experience)return;
  const n=Math.min(M.pop*0.08,s.pop[j]*0.06),share=n/s.pop[j],food=s.food[j]*share,young=s.young[j]*share;
  addHerd(M.animals,takeHerd(j,share));s.pop[j]-=n;s.food[j]-=food;s.young[j]-=young;M.pop+=n;M.food+=food;M.young+=young;
  let group=M.groups.find(g=>g.eth===s.eth[j]&&g.ancestry===s.ancestry[j]);if(!group){group={eth:s.eth[j],ancestry:s.ancestry[j],pop:0};M.groups.push(group)}group.pop+=n;
}
function depositMigrationGroups(i,M,n,old){
  const s=S;let before=old;
  for(const g of M.groups){const amount=n*g.pop/Math.max(1,M.pop);if(amount<=0)continue;
    if(before<1){s.eth[i]=g.eth;s.eth2[i]=-1;s.mix[i]=0;s.ancestry[i]=g.ancestry;s.ancestry2[i]=-1;s.ancestryMix[i]=0}
    else{mergeCulture(i,g.eth,amount,before);mergeAncestry(i,g.ancestry,amount,before)}before+=amount;
  }
}
