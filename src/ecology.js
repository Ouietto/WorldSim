/* Crop access and local adaptation are separate from general farming knowledge.
   These broad packages describe subsistence systems, not ethnic abilities. */
const CROPS=[
  {k:'temperate',n:'Wheat and barley',lo:5,hi:27,rain:420,store:0.95},
  {k:'millet',n:'Millet and sorghum',lo:16,hi:34,rain:330,store:0.9},
  {k:'rice',n:'Rice',lo:15,hi:32,rain:1050,store:0.95},
  {k:'maize',n:'Maize and beans',lo:10,hi:31,rain:580,store:0.85},
  {k:'roots',n:'Tropical roots and gardens',lo:19,hi:34,rain:1100,store:0.35},
  {k:'highland',n:'Highland tubers and quinoa',lo:1,hi:21,rain:430,store:0.65}
];
function cropIndex(h){
  const name=h.crop||'';
  if(/potato|quinoa/.test(name))return 5;if(/taro|yam|banana/.test(name))return 4;
  if(/maize|sunflower|squash/.test(name))return 3;if(/rice/.test(name))return 2;
  if(/sorghum|millet/.test(name))return 1;return 0;
}
function prepareAgroEcology(w){
  if(w.cropSuit)return;
  w.cropSuit=CROPS.map(()=>new Float32Array(N));w.valleyShare=new Float32Array(N);
  w.waterPotential=new Float32Array(N);w.rangeExposure=new Float32Array(N);
  for(const i of w.landIdx){
    const t=w.T[i],rain=w.Pr[i],r=w.rough[i],e=w.elev[i],river=w.rv[i];
    const valley=clamp(0.04+river*0.32+r*0.09*(rain>120?1:0),0.02,0.5);
    w.valleyShare[i]=valley;
    // Local runoff and snow-fed catchments can matter without a major channel.
    w.waterPotential[i]=clamp(river+0.35*r*clamp((rain-100)/500,0,1)+0.12*clamp((rain-250)/500,0,1),0,1);
    const canopy=clamp((rain-500)/750,0,1)*clamp((t+4)/12,0,1);
    w.rangeExposure[i]=clamp((1-canopy*0.9)*(1-r*0.8)*clamp((rain-110)/250,0,1)*clamp((1800-rain)/700,0,1),0,1);
    let best=0;
    for(let k=0;k<CROPS.length;k++){
      const c=CROPS[k],warm=k===0?t+w.amp[i]*0.23:t+w.amp[i]*0.12;
      const thermal=clamp((warm-c.lo+3)/7,0,1)*clamp((c.hi-warm+3)/7,0,1);
      const growing=k===5?clamp((t+1)/6,0,1):clamp(((w.gs?w.gs[i]:6)-2.4)/3,0,1);
      const moisture=clamp((rain-90)/(c.rain-90),0,1);
      const altitude=clamp(1-Math.max(0,e-(k===5?4300:3300))/1700,0,1);
      const ground=(1-r*0.68)*(1-valley)+valley;
      const leach=(w.leach?w.leach[i]:0)*(k===4?0.2:0.6);
      w.cropSuit[k][i]=thermal*growing*altitude*ground*(0.12+0.88*moisture)*(1-leach);
      best=Math.max(best,w.cropSuit[k][i]);
    }
    // Potential is used for hearth placement. Actual yields require local crops.
    w.sF[i]=Math.max(w.sF[i]*0.55,best);
    w.nomad[i]=w.rangeExposure[i]>0.4&&w.sH[i]>0.32?1:0;
  }
}
function initEcology(){
  const s=S,w=WD;prepareAgroEcology(w);
  s.cropAccess=CROPS.map(()=>new Float32Array(N));s.cropAdapt=CROPS.map(()=>new Float32Array(N));
  for(const k of ['terraces','waterworks','workshops','recordPractice','craftPractice','chemicalPractice','firearms','raidDamage','frontierDanger','defensePact','maleShare'])s[k]=new Float32Array(N);
  s.maleShare.fill(0.49);s.threatFrom=new Int32Array(N).fill(-1);s.depot=new Float64Array(N);
  s.reprisals=new Int32Array(N).fill(-100000);s.frontierContacts=new Int32Array(N).fill(-100000);
  s.wallHealth=new Float32Array(N).fill(1);s.wallBreach=new Float32Array(N);s.breachBy=new Int32Array(N);
  s.publicShipments=[];s.militaryContracts=[];s.migrationPressure=new Float32Array(N);
  Object.assign(s.societyCounters,{cropInvestment:0,freight:0,raidsBeyondBorder:0,devastations:0,shatteredStates:0,clanAccessions:0,opportunistCampaigns:0,reprisals:0,selectiveDeaths:0,forcedResettlers:0,wallBreaches:0,protectionTreaties:0,protectionPaid:0,brokenProtection:0,conquestDynasties:0,militaryContracts:0,returnedVeterans:0,migrationAccessions:0,migrationRetreats:0,migrantBreaches:0});
  for(const h of s.hearths)if(h.kind==='farm')h.cropIndex=h.crop?cropIndex(h):bestCrop(h.cell);
  initEpidemics();initConnections();initPeoples();initUrbanism();
}
function bestCrop(i){let best=0;for(let k=1;k<CROPS.length;k++)if(WD.cropSuit[k][i]>WD.cropSuit[best][i])best=k;return best}
function seedCrop(i,k,value=1){
  S.cropAccess[k][i]=Math.max(S.cropAccess[k][i],value);S.cropAdapt[k][i]=Math.max(S.cropAdapt[k][i],0.25*value);
}
function seedLocalCrops(i){seedCrop(i,bestCrop(i))}
function transferCrops(i,j,factor=0.8){
  for(let k=0;k<CROPS.length;k++)if(S.cropAccess[k][i]>0.05){S.cropAccess[k][j]=Math.max(S.cropAccess[k][j],S.cropAccess[k][i]*factor);S.cropAdapt[k][j]=Math.max(S.cropAdapt[k][j],S.cropAdapt[k][i]*factor*0.6)}
}
function cropSuitability(k,i){
  const s=S,w=WD,r=w.rough[i],water=w.waterPotential[i];
  const irrigation=Math.max(s.irrig[i]*w.rv[i],s.waterworks[i]*water);
  const moistureRecovery=clamp((CROPS[k].rain-w.Pr[i])/CROPS[k].rain,0,0.85)*irrigation;
  const thermal=clamp((w.T[i]-CROPS[k].lo+6)/8,0,1)*clamp((CROPS[k].hi-w.T[i]+5)/8,0,1);
  return clamp((w.cropSuit[k][i]+thermal*moistureRecovery*0.65)*(1+0.9*s.terraces[i]*r),0,1);
}
function cropSystem(i){
  let value=0,kind=-1;for(let k=0;k<CROPS.length;k++){
    const v=S.cropAccess[k][i]*cropSuitability(k,i)*(0.35+0.65*S.cropAdapt[k][i]);
    if(v>value){value=v;kind=k}
  }return {value,kind};
}
function farmSuit(i){return S.cropAccess?cropSystem(i).value:WD.sF[i]}
function foodStorability(i){const c=cropSystem(i);return c.kind<0?0.2:CROPS[c.kind].store+(1-CROPS[c.kind].store)*skill(i,'storage')*0.55}
function pastureCondition(i){
  const w=WD,s=S,season=w.rainSeasonality&&Number.isFinite(w.rainSeasonality[i])?Math.max(0,w.rainSeasonality[i]):0.3;
  const winter=clamp((w.amp[i]-18)/24,0,1)*clamp((0.85-s.wm[i])/0.65,0,1);
  return clamp(s.wm[i]*(1-season*0.18)-winter*0.5,0.1,1.45);
}
function agroPass(){
  const s=S,w=WD;
  for(const i of w.landIdx){
    s.raidDamage[i]*=0.94;s.defensePact[i]*=0.995;s.migrationPressure[i]*=0.8;
    // Aggregate sex composition converges through cohort maturation, not an
    // instantaneous reset after selective wartime mortality.
    s.maleShare[i]+=0.018*(0.49-s.maleShare[i]);
    if(s.pop[i]<100)continue;
    const p=s.pop[i],org=s.organisation[i],surplus=clamp(s.food[i]/p-0.12,0,0.6);
    const work=Math.min(s.food[i]*0.03,p*0.012*surplus)*(0.3+0.7*org);
    s.food[i]-=work;s.societyCounters.cropInvestment+=work;
    const effort=work/p,need=clamp(p/Math.max(1,s.K[i]),0,1.5);
    s.terraces[i]=clamp(s.terraces[i]*(1-0.002*(1-org))+effort*1.6*w.rough[i]*need,0,1);
    s.waterworks[i]=clamp(s.waterworks[i]*(1-0.003*(1-org))+effort*1.8*w.waterPotential[i]*need,0,1);
    const urban=clamp(s.urban[i]/p,0,0.4),market=clamp(s.node[i]+s.flow[i]/p,0,1);
    s.workshops[i]=clamp(s.workshops[i]*0.998+effort*(0.1+urban*4+market),0,1);
    s.craftPractice[i]+=s.workshops[i]*s.nutrition[i]*(0.2+0.8*s.metal[i])*(1-0.6*clamp(s.sickness[i],0,1));
    s.recordPractice[i]+=recordSkill(i)*(0.15+urban*2+market*0.3)*s.nutrition[i];
    if(s.paper[i]>0.5&&s.iron[i]>0.5)s.chemicalPractice[i]+=s.workshops[i]*s.paper[i]*s.nutrition[i];
    if(s.gun[i]>0.7){const due=Math.min(s.food[i]*0.01,p*0.002*s.workshops[i]);s.food[i]-=due;s.firearms[i]+=due*0.05*s.gun[i]}
    s.firearms[i]*=0.975;
    if(s.year%5===0)for(let k=0;k<CROPS.length;k++){
      const present=s.cropAccess[k][i];if(present>0.01)s.cropAdapt[k][i]=clamp(s.cropAdapt[k][i]+0.025*present*cropSuitability(k,i)*(0.3+org),0,1);
    }
  }
  if(s.year%5!==0)return;
  const delta=CROPS.map(()=>new Float32Array(N));
  const share=(i,j,contact)=>{
    if(s.pop[j]<100||s.farm[j]<0.1||s.food[j]<s.pop[j]*0.02)return;
    for(let k=0;k<CROPS.length;k++){
      const gap=s.cropAccess[k][i]-s.cropAccess[k][j];if(gap<=0.02||s.cropAccess[k][i]<0.1)continue;
      delta[k][j]=Math.max(delta[k][j],gap*contact*(0.2+0.8*cropSuitability(k,j)));
    }
  };
  for(const i of w.landIdx)if(s.pop[i]>=100)for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j])share(i,j,0.10+0.12*Math.min(s.node[i],s.node[j]))}
  for(const e of s.tradeEdges){const a=s.pol[e.a]?s.pols[s.pol[e.a]]:null,b=s.pol[e.b]?s.pols[s.pol[e.b]]:null;if(a&&b&&a.enemies.has(b.id))continue;share(e.a,e.b,0.3);share(e.b,e.a,0.3)}
  for(const i of w.landIdx){let effort=0;for(let k=0;k<CROPS.length;k++)effort+=delta[k][i];
    const cost=Math.min(s.food[i],s.pop[i]*effort*0.008),funded=effort>0?cost/Math.max(1e-9,s.pop[i]*effort*0.008):0;s.food[i]-=cost;
    for(let k=0;k<CROPS.length;k++)s.cropAccess[k][i]=clamp(s.cropAccess[k][i]+delta[k][i]*funded,0,1);
  }
}
function technicalReadiness(o,k){
  const s=S,c=o.capital,t=TECH[k],p=s.recordPractice[c],craft=s.craftPractice[c];
  if(t.k==='writing')return Math.min(1,p/100,Math.max(0,(s.urban[c]-1200)/4000));
  if(t.k==='wheel')return Math.min(1,craft/35,s.traction[c]+s.pack[c]);
  if(t.k==='iron')return Math.min(1,craft/120);
  if(t.k==='paper')return Math.min(1,craft/400,p/600);
  if(t.k==='gun')return Math.min(1,s.chemicalPractice[c]/500,craft/1300,p/1400);
  if(t.k==='caval')return Math.min(1,craft/180,s.mounts[c]);
  if(t.k==='ocean')return Math.min(1,craft/750,s.sail[c]*s.nav[c]);
  if(['office','school','census','canal'].includes(t.k))return Math.min(1,p/(t.k==='school'?180:60));
  return clamp(0.1+s.workshops[c]*2+craft/70,0,1);
}
function inventionPass(o){
  if(o.kind!=='state')return;
  const s=S,c=o.capital,eligible=[];
  for(let k=6;k<TECH.length;k++){
    const t=TECH[k],em=t.em;if(!em||s.tk[k][c]>=0.5||o.pop<em.pop*0.35||(em.cells&&o.cells<em.cells)||(em.coast&&!WD.coast[c]&&o.coastN<2)||(em.horse&&s.mounts[c]<0.5)||(em.heavy&&(o.hvN||0)<3))continue;
    if(t.pre.some(p=>s.tk[p][c]<0.7))continue;
    const readiness=technicalReadiness(o,k);if(readiness<0.999)continue;
    eligible.push(k);
  }
  if(!eligible.length)return;
  // A fixed specialist budget is shared by projects. Fragmenting one society
  // into many polities no longer grants a free full research budget to each.
  const paid=budgetAt(o,c,Math.min(publicAvailable(o,c)*0.015,o.pop*0.0015));
  const specialists=paid*(0.2+s.workshops[c])*(0.3+0.7*o.cult);
  for(const k of eligible){
    const t=TECH[k],em=t.em,need=1/em.b;
    o.inventionProgress[k]+=specialists/eligible.length*(0.5+techFit(o,k))/Math.max(1,Math.sqrt(em.pop/10000));
    if(o.inventionProgress[k]>=need){seedTech(s.tk[k],c,1,1);firstTech(k,c,o);o.inventionProgress[k]=0}
  }
}
