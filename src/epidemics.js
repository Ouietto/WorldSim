/* Stylized disease families, not calibrated reconstructions of named pathogens.
   E/I/R are fractions of the local host population. Each family has independent
   immunity; short disease steps run inside the annual political/economic step. */
const PATHOGENS=[
  {k:'respiratory',n:'respiratory fever',incubation:7,duration:14,beta:1.65,fatality:0.018,waning:0.28},
  {k:'enteric',n:'enteric fever',incubation:14,duration:28,beta:1.3,fatality:0.09,waning:0.15},
  {k:'pox',n:'pox-like disease',incubation:14,duration:21,beta:2.3,fatality:0.22,waning:0.008},
  {k:'vector',n:'vector-borne fever',incubation:14,duration:28,beta:1.1,fatality:0.075,waning:0.12},
  {k:'herd',n:'livestock pestilence',incubation:14,duration:21,beta:1.8,fatality:0.3,waning:0.1,animal:true}
];
const DISEASE_STEPS=24,DISEASE_DAYS=365/DISEASE_STEPS;
function initEpidemics(){
  const s=S;s.pathogens=PATHOGENS.map(()=>({exposed:new Float32Array(N),infectious:new Float32Array(N),recovered:new Float32Array(N),wave:new Int32Array(N).fill(-1),active:new Set(),endemic:new Set()}));
  s.sickness=new Float32Array(N);s.containment=new Float32Array(N);s.epidemicLoss=new Float32Array(N);
  s.previousForest=Float32Array.from(s.forest);s.healthTrips=[];s.diseaseTick=0;s.healthRoutes=new Map();
  Object.assign(s.societyCounters,{epidemicDeaths:0,livestockEpidemicDeaths:0,diseaseIntroductions:0,spillovers:0,epidemicSuccessions:0,healthProvisioning:0});
}
function diseaseHosts(k,i){return PATHOGENS[k].animal?S.animals.reduce((n,a)=>n+a[i],0):S.pop[i]}
function pathogenHabitat(k,i){
  if(PATHOGENS[k].k!=='vector')return 1;
  return clamp((WD.T[i]-10)/12,0,1)*clamp((WD.Pr[i]-180)/650,0,1)*clamp(S.wm[i],0.2,1.2);
}
function outbreakAt(k,i,cases=10,parent=-1,source=i,cause='local outbreak'){
  const s=S,d=s.pathogens[k],p=PATHOGENS[k],hosts=diseaseHosts(k,i);if(hosts<50||pathogenHabitat(k,i)<0.1)return null;
  const susceptible=Math.max(0,1-d.recovered[i]-d.exposed[i]-d.infectious[i]),dose=Math.min(susceptible,cases/hosts);if(dose<=0)return null;
  let o=s.outbreaks[d.wave[i]];
  if(!o||o.done||!d.active.has(i)){
    o=parent>=0?s.outbreaks[parent]:null;
    if(!o||o.done||o.pathogen!==k){const e=s.eths[s.eth[i]];
      o={id:s.outbreaks.length,pathogen:k,name:(e?cap(e.lang.lex.river)+' ':'')+p.n,origin:i,year:s.year,deaths:0,animalDeaths:0,vir:p.fatality,cells:0,active:0,done:false,spread:[],visited:new Set(),hit:new Set(),virgin:source!==i&&d.recovered[i]<0.1,from:s.eth[source],cause};s.outbreaks.push(o);
      chron('plague',`An outbreak of ${p.n} begins${cause==='spillover'?' after changing contact with wildlife and livestock':''}.`,i,[RPl(o)]);
    }
    d.wave[i]=o.id;
  }
  if(!o.visited.has(i)){o.visited.add(i);o.cells++;if(o.spread.length<4000)o.spread.push([s.year-o.year,i])}
  d.exposed[i]+=dose;d.active.add(i);return o;
}
function travelInfectionSurvival(k,days,people,mode){
  const p=PATHOGENS[k],direct=Math.exp(-days/(p.incubation+p.duration));
  // Sequential infection within a sizeable traveling group can bridge a long
  // journey. Livestock and vector reservoirs can travel in suitable cargo.
  const chain=clamp(people/180,0,0.55)*(mode==='sea'||mode==='migration'?0.65:0.25);
  const reservoir=p.animal&&mode==='livestock'?0.7:p.k==='vector'&&mode==='sea'?0.12:0;
  return clamp(direct+(1-direct)*Math.max(chain,reservoir),0,1);
}
function epidemicTravelFactor(i,j){return S.containment?1-0.75*Math.max(S.containment[i],S.containment[j]):1}
function diseaseJourney(src,dest,days,people,mode='local',family=null){
  const s=S;if(src===dest||people<=0||!s.pathogens||s.healthTrips.length>=6000)return;
  const exposures=[];for(let k=0;k<PATHOGENS.length;k++){if(family!=null&&k!==family)continue;
    const d=s.pathogens[k],prevalence=d.infectious[src]+d.exposed[src]*0.5;
    const dose=people*prevalence*travelInfectionSurvival(k,days,people,mode)*epidemicTravelFactor(src,dest);
    if(dose>0.001)exposures.push({k,dose,wave:d.wave[src]});
  }
  if(exposures.length)s.healthTrips.push({src,dest,mode,exposures,due:s.diseaseTick+Math.max(1,Math.ceil(days/DISEASE_DAYS))});
}
function travelDays(i,j,sea=false){return Math.max(1,angDist(i,j)*6371/(sea?95:22))}
function diseaseHistory(i){return S.pathogens.map(d=>d.recovered[i])}
function mixDiseaseHistory(j,history,n,prior){if(!history||n<=0)return;for(let k=0;k<S.pathogens.length;k++){const d=S.pathogens[k],total=Math.max(1,prior+n);
  d.exposed[j]*=prior/total;d.infectious[j]*=prior/total;
  d.recovered[j]=clamp((d.recovered[j]*prior+(history[k]||0)*n)/total,0,1-d.exposed[j]-d.infectious[j]);
}}
function healthPolicy(i,o,portion=1){
  const s=S,ill=s.pathogens.slice(0,4).reduce((n,d)=>n+d.infectious[i]+d.exposed[i],0);
  const trust=o?o.trust:s.organisation[i],capacity=o?o.health*o.payroll*(0.3+0.7*o.bureau):s.organisation[i]*0.4;
  const response=ill>0.002?clamp(capacity*trust*(0.3+(o?o.preparedness:0)),0,0.85):0;
  const due=s.pop[i]*response*0.002*portion,paid=o?budgetAt(o,i,due):Math.min(s.food[i]*0.01,due);
  if(o)s.food[i]+=paid;else s.food[i]-=paid;
  s.societyCounters.healthProvisioning+=paid;
  const funded=due>0?paid/due:0;s.containment[i]=clamp(s.containment[i]*0.65+response*funded*0.35,0,0.85);
}
function diseaseMortality(k,i,n,o){
  const s=S,p=PATHOGENS[k];if(n<=0)return;
  if(p.animal){const hosts=diseaseHosts(k,i),ratio=clamp(n/Math.max(1,hosts),0,1);for(const a of s.animals)a[i]*=1-ratio;refreshAnimalAccess(i);o.animalDeaths+=n;s.societyCounters.livestockEpidemicDeaths+=n;return}
  n=Math.min(n,s.pop[i]*0.5);const prior=s.pop[i],ratio=n/Math.max(1,prior),id=s.pol[i],state=id?s.pols[id]:null;
  s.pop[i]-=n;s.young[i]*=1-ratio;s.epidemicLoss[i]+=n;o.deaths+=n;s.societyCounters.epidemicDeaths+=n;
  s.organisation[i]*=1-ratio*0.12;s.infrastructure[i]*=1-ratio*0.08;
  if(state){const realm=n/Math.max(1,state.pop);state.staff*=1-realm;state.army*=1-realm;state.navy*=1-realm;
    state.shock=clamp(state.shock+realm*0.8,0,3);state.plagueD=(state.plagueD||0)+n;o.hit.add(id)}
}
function epidemicOrigins(){
  const s=S,w=WD;if(P.disease<=0)return;
  for(let t=0;t<40;t++){const i=w.landIdx[(s.r()*w.landIdx.length)|0];if(s.pop[i]<200)continue;
    const density=s.pop[i]/w.area[i],herds=diseaseHosts(4,i),cleared=Math.max(0,s.previousForest[i]-s.forest[i]);
    const chance=P.disease*(0.00012*density*(0.2+s.farm[i])+cleared*0.06+s.herd[i]*Math.min(1,herds/2000)*0.0005);
    if(s.r()>chance)continue;
    const k=cleared>0.005&&pathogenHabitat(3,i)>0.3?3:herds>500&&s.r()<0.2?4:density>8&&herds>1000&&s.r()<0.25?2:s.food[i]/s.pop[i]<0.1?1:(s.r()<0.65?0:1);
    if(!s.pathogens[k].active.has(i)){const o=outbreakAt(k,i,Math.max(3,s.pop[i]*0.002),-1,i,k===3?'spillover':'local outbreak');if(o&&k===3)s.societyCounters.spillovers++}
  }
  for(let k=0;k<PATHOGENS.length;k++)for(const i of [...s.pathogens[k].endemic]){
    if(diseaseHosts(k,i)<20000||!s.node[i]){s.pathogens[k].endemic.delete(i);continue}
    if(s.r()<0.025*P.disease)outbreakAt(k,i,3);
  }
}
function epidemicRoutes(){
  const s=S;s.healthRoutes=new Map();
  const add=(i,j,people,sea)=>{if(people<0.1)return;let routes=s.healthRoutes.get(i);if(!routes)s.healthRoutes.set(i,routes=[]);routes.push({j,people,days:travelDays(i,j,sea),mode:sea?'sea':'trade'})};
  for(const e of s.tradeEdges){const traffic=(e.privateUsed||0)+(e.freightUsed||0);if(traffic<=0)continue;const sea=!!(WD.coast[e.a]&&WD.coast[e.b]&&!alongRiver(e.a,e.b));add(e.a,e.b,Math.min(200,traffic*0.015),sea);add(e.b,e.a,Math.min(200,traffic*0.015),sea)}
  for(const route of s.routes){const i=route.path[0],j=route.path.at(-1);if(i!=null&&j!=null&&Math.min(s.car[i],s.car[j])>0.1){add(i,j,15*Math.min(s.car[i],s.car[j]),false);add(j,i,15*Math.min(s.car[i],s.car[j]),false)}}
}
function epidemicYear(){
  const s=S,w=WD;s.sickness.fill(0);s.epidemicLoss.fill(0);epidemicOrigins();epidemicRoutes();
  for(const i of w.landIdx){for(let k=0;k<PATHOGENS.length;k++)s.pathogens[k].recovered[i]*=Math.max(0,1-PATHOGENS[k].waning-0.018);healthPolicy(i,s.pol[i]?s.pols[s.pol[i]]:null);s.previousForest[i]=s.forest[i]}
  for(let tick=0;tick<DISEASE_STEPS;tick++){
    s.diseaseTick++;
    const due=s.healthTrips.filter(t=>t.due<=s.diseaseTick);s.healthTrips=s.healthTrips.filter(t=>t.due>s.diseaseTick);
    for(const trip of due)for(const e of trip.exposures)if(s.r()<1-Math.exp(-e.dose*epidemicTravelFactor(trip.src,trip.dest))){if(outbreakAt(e.k,trip.dest,Math.max(1,e.dose),e.wave,trip.src,'contact'))s.societyCounters.diseaseIntroductions++}
    for(let k=0;k<PATHOGENS.length;k++){const d=s.pathogens[k],p=PATHOGENS[k];
      for(const i of [...d.active]){const hosts=diseaseHosts(k,i),o=s.outbreaks[d.wave[i]];if(!o||hosts<1){d.active.delete(i);continue}
        const habitat=pathogenHabitat(k,i),ill=d.infectious[i],latent=d.exposed[i],susceptible=Math.max(0,1-d.recovered[i]-ill-latent);
        if(k<4&&tick%6===0&&ill>0.01)healthPolicy(i,s.pol[i]?s.pols[s.pol[i]]:null,0.25);
        const density=clamp(Math.log2(2+hosts/w.area[i])/3,0.12,1.5),season=p.k==='respiratory'?0.85+0.25*Math.cos((tick/DISEASE_STEPS)*Math.PI*2):1;
        const hygiene=p.k==='enteric'?1-0.25*s.infrastructure[i]:1;
        const transmission=p.beta*ill*susceptible*density*season*habitat*hygiene*(1-0.7*s.containment[i])*P.disease;
        const exposed=Math.min(susceptible,transmission),onset=latent*Math.min(1,DISEASE_DAYS/p.incubation),resolved=ill*Math.min(1,DISEASE_DAYS/p.duration);
        const hardship=1+0.9*(1-s.nutrition[i])+0.35*s.raidDamage[i],care=1-0.2*s.containment[i];
        const dead=Math.min(hosts*0.4,resolved*hosts*p.fatality*hardship*care);
        diseaseMortality(k,i,dead,o);
        const mortality=dead/Math.max(1,hosts),remaining=Math.max(0.01,1-mortality);
        d.exposed[i]=clamp((latent+exposed-onset)/remaining,0,1);
        d.infectious[i]=clamp((ill+onset-resolved)/remaining,0,1-d.exposed[i]);
        d.recovered[i]=clamp((d.recovered[i]+resolved-mortality)/remaining,0,1-d.exposed[i]-d.infectious[i]);
        if(!p.animal)s.sickness[i]+=ill/DISEASE_STEPS;
        if(ill>0.0001&&tick%2===0){
          for(let dir=0;dir<4;dir++){const j=w.nb[i*4+dir];if(j<0||!w.land[j]||diseaseHosts(k,j)<50)continue;diseaseJourney(i,j,travelDays(i,j),Math.min(60,Math.sqrt(hosts*diseaseHosts(k,j))*0.002),'local',k)}
          if(tick%4===0)for(const route of s.healthRoutes.get(i)||[])diseaseJourney(i,route.j,route.days,route.people/6,route.mode,k);
        }
        if(d.exposed[i]+d.infectious[i]<1/Math.max(1000,hosts)){d.exposed[i]=d.infectious[i]=0;d.active.delete(i);if(hosts>50000&&s.node[i]>0.3&&k<3)d.endemic.add(i)}
      }
    }
  }
  s.infect.fill(0);s.immune.fill(0);const active=new Set();for(const o of s.outbreaks)if(!o.done)o.active=0;
  for(let k=0;k<PATHOGENS.length;k++){const d=s.pathogens[k];for(const i of w.landIdx)if(k<4)s.immune[i]+=d.recovered[i]/4;
    for(const i of d.active){s.infect[i]=1;s.ob[i]=d.wave[i];active.add(i);s.outbreaks[d.wave[i]].active++}}
  s.inf=[...active];const pending=new Set(s.healthTrips.flatMap(t=>t.exposures.map(e=>e.wave)));
  for(const o of s.outbreaks)if(!o.done&&!o.active&&!pending.has(o.id)&&o.year<s.year){o.done=true;o.end=s.year;o.hit=[...o.hit];if(o.deaths>25000||o.animalDeaths>5000)chron('plague',`The ${o.name} subsides after ${fmtK(o.deaths)} human deaths${o.animalDeaths?` and ${fmtK(o.animalDeaths)} livestock losses`:''}.`,o.origin,[RPl(o)])}
  for(const i of w.landIdx)s.sickness[i]=clamp(s.sickness[i],0,0.85);
  for(const id of [...s.alive]){const o=s.pols[id],c=o.capital,loss=s.epidemicLoss[c]/Math.max(1,s.pop[c]+s.epidemicLoss[c]);
    if(loss>0.04&&s.r()<loss*0.65){o.ruler.death=s.year-o.ruler.birth;s.societyCounters.epidemicSuccessions++;chron('plague',`The ruler of the ${o.full} dies during the epidemic, testing the succession.`,c,[R_(o)])}}
}
