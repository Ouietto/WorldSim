"use strict";
/* ================= CROPS AND SOILS =================
   Staple crop packages differ in where they grow, how much food they give, how easily they can be stored and taxed,
   and how hard they are on the soil (Mayshar, Moav & Pascali 2022 on appropriability; Scott 2017). A package spreads
   from its hearth with farmers and is grown wherever it is the best of the packages that have arrived. Processing can
   change a crop's character: freeze-dried potatoes (chuño) store for years, nixtamalized maize is far more nourishing.
   Soils come from the climate and terrain they formed under; farm suitability follows the changing climate. */
// fit(T,P,c): T annual mean °C at the place, P annual mm, c the cell; trapezoid helper: 0 below a, 1 from b to c, 0 above d
const trap=(x,a,b,c,d)=>x<=a||x>=d?0:x<b?(x-a)/(b-a):x<=c?1:(d-x)/(d-c);
const CROPS=[
  {k:'wheat',n:'wheat and barley',anim:'sheep and goats',y:1.0,store:0.9,tax:0.95,drain:1.0,fit:(T,P,rv)=>trap(T,0,7,26,32)*Math.max(trap(P,150,350,900,1700),P<350?Math.min(1,rv*1.6):0)},
  {k:'rice',n:'rice',anim:'pigs and water buffalo',y:1.1,store:0.9,tax:1.0,drain:0.5,fit:(T,P,rv)=>trap(T,13,19,30,35)*Math.max(trap(P,800,1300,4500,7000),Math.min(1,rv*2))},
  {k:'millet',n:'millet',anim:'pigs and dogs',y:0.85,store:0.95,tax:0.95,drain:0.9,fit:(T,P,rv)=>trap(T,2,7,17,24)*Math.max(trap(P,200,350,850,1500),P<350?Math.min(1,rv*1.6):0)},
  {k:'sorghum',n:'sorghum and pearl millet',anim:'cattle',y:0.85,store:0.85,tax:0.9,drain:0.9,fit:(T,P,rv)=>trap(T,16,22,32,36)*Math.max(trap(P,200,400,1000,1700),P<400?Math.min(1,rv*1.6):0)},
  {k:'maize',n:'maize, beans and squash',anim:'turkeys and dogs',y:1.4,store:0.8,tax:0.85,drain:0.65,fit:(T,P,rv,el)=>trap(T,9,14,27,32)*Math.max(trap(P,350,600,2200,3500),P<600?Math.min(1,rv*1.6):0)*(el>3400?0.2:1)},
  {k:'potato',n:'potatoes and quinoa',anim:'llamas and guinea pigs',y:1.6,store:0.3,tax:0.35,drain:1.1,fit:(T,P,rv)=>trap(T,-1,4,15,22)*trap(P,250,450,1600,2600)},
  {k:'yams',n:'yams, taro and bananas',anim:'pigs and fowl',y:1.0,store:0.2,tax:0.15,drain:0.8,fit:(T,P,rv)=>trap(T,19,23,31,35)*trap(P,850,1300,4500,7000)},
  {k:'sunflower',n:'sunflowers, squash and goosefoot',anim:'dogs',y:0.6,store:0.7,tax:0.6,drain:0.8,fit:(T,P,rv)=>trap(T,4,9,19,25)*trap(P,500,750,1400,2000)},
  {k:'cassava',n:'cassava',anim:'goats',y:1.4,store:0.25,tax:0.2,drain:0.7,fit:(T,P,rv)=>trap(T,18,22,31,35)*trap(P,500,900,3000,5000),introduced:1},
];
const CI=Object.fromEntries(CROPS.map((c,k)=>[c.k,k]));
// soils, assigned once from long-standing climate and terrain; fert multiplies farm yield, drain how fast farming wears it out,
// salt how readily irrigation poisons it, erode how fast bare slopes lose it
const SOILS=[
  {k:'tundra',n:'Frozen soils',fert:0.3,drain:1.2,salt:1,erode:1,dig:0.5},
  {k:'desert',n:'Desert soils',fert:0.9,drain:1.0,salt:1.6,erode:1,dig:0.7},
  {k:'alluvium',n:'River silt',fert:1.12,drain:0.5,salt:1.1,erode:0.5,dig:1.3},
  {k:'volcanic',n:'Volcanic highland soils',fert:1.15,drain:0.8,salt:1,erode:1.2,dig:1.0},
  {k:'mountain',n:'Thin mountain soils',fert:0.85,drain:1.2,salt:1,erode:1.6,dig:0.5},
  {k:'tropical',n:'Leached tropical soils',fert:1.0,drain:1.6,salt:1,erode:1.2,dig:0.9},
  {k:'podzol',n:'Acid forest soils',fert:0.72,drain:1.2,salt:1,erode:1,dig:0.7},
  {k:'blackearth',n:'Black earth',fert:1.05,drain:0.7,salt:1,erode:0.8,dig:1.0},
  {k:'clay',n:'Heavy savanna clays',fert:1.0,drain:0.9,salt:1.2,erode:0.8,dig:0.45},
  {k:'forest',n:'Brown forest soils',fert:1.0,drain:1.0,salt:1,erode:1,dig:0.8},
];
const SOI=Object.fromEntries(SOILS.map((s,k)=>[s.k,k]));
function soilFor(w,i){const T=w.T[i],P=w.Pr[i],la=Math.abs(w.lat[i]*180/Math.PI);
  if(T<-6)return SOI.tundra;if(P<250&&w.rvF[i]<0.35)return SOI.desert;
  if(w.rvF[i]>0.3&&w.elev[i]<1500)return SOI.alluvium;
  if(w.elev[i]>1200&&T>6&&w.rough[i]>0.2&&la<35)return SOI.volcanic;
  if(w.rough[i]>0.5)return SOI.mountain;
  if(w.leach[i]>0.3)return SOI.tropical;
  if(T<5&&P>300)return SOI.podzol;
  if(T>=0&&T<16&&P>=300&&P<=750&&w.rough[i]<0.3)return SOI.blackearth;
  if(T>18&&P>=500&&P<=1300&&w.amp[i]>3&&w.rough[i]<0.25)return SOI.clay;
  return SOI.forest}
// farm and pasture suitability for a climate (same rules as world generation), so they can follow climate change
function suitFor(w,i,t,p){
  const amp=w.amp[i],rv=w.rvF[i],tw=t+amp/2,half=amp/2,gs=half<0.5?(t>6?12:0):(t-half>=6?12:t+half<=6?0:12*Math.acos(clamp((6-t)/half,-1,1))/Math.PI);
  const tS=clamp((gs-4.3)/2.2,0,1)*clamp((tw-14)/7,0,1)*clamp((31-t)/5,0,1)*(t<2?clamp((t+4)/6,0,1):1)*(biomeOf(t,p)===3?0.45:1);
  const pS=Math.max(clamp((p-280)/450,0,1)*clamp((3400-p)/1600,0.25,1),t>9.5&&t<18?0.62*clamp((p-330)/120,0,1)*clamp((850-p)/150,0,1):0);
  const irr=rv*clamp((tw-14)/6,0,1),el=w.elev[i];
  const leach=el<1500?clamp((p-1100)/600,0,1)*clamp((t-20)/3,0,1)*(1-clamp((rv-0.55)*2.5,0,0.8)):0;
  const trop=el<1200?clamp((t-21)/3,0,1)*clamp((p-900)/600,0,1):0;
  const sF=Math.max(tS*pS,tS*irr*0.95)*(1-0.65*w.rough[i])*(el>3500?0.3:1)*(1-0.7*leach);
  const sH=clamp((tw-4)/10,0,1)*clamp((27-t)/7,0,1)*clamp((p-120)/180,0,1)*clamp((1100-p)/500,0.15,1)*(1-0.4*w.rough[i]);
  return[sF,sH,leach,trop]}
function cropsInit(){
  const s=S,w=WD;
  if(!w.soil){w.soil=new Uint8Array(N);w.soilFert=new Float32Array(N).fill(1);w.soilDrain=new Float32Array(N).fill(1);w.soilSalt=new Float32Array(N).fill(1);w.soilErode=new Float32Array(N).fill(1);
    w.terrFit=new Float32Array(N);for(const i of w.landIdx)w.terrFit[i]=Math.min(1,2*w.rough[i]+(w.Pr[i]>1000&&w.rv[i]>0.15&&w.rough[i]<0.1?0.6:0));
    w.sod=new Uint8Array(N);w.heavy0=Float32Array.from(w.heavy);
    // turf: grassland moist enough for a dense mat of roots but too dry for trees (the chernozem steppe, the tallgrass prairie)
    // is barely broken by hoes. Drier steppe grows sparse bunchgrass with bare ground between, easy to dig; wetter land grows
    // woods, which are cleared by axe and fire instead. Floodplains are open ground, stripped and silted by floods.
    w.turf=new Float32Array(N);w.soilDig=new Float32Array(N).fill(1);
    // monsoon grasslands with dry winters (the loess of North China) grow bunchgrass, not a matted sod: the hoe farmers of
    // Yangshao worked them from the start (Liu & Chen 2012)
    const dryWinter=i=>{const k=w.kgGrid?w.kgGrid[i]:0;return k===15||k===16||k===26||k===27};
    for(const i of w.landIdx){const b=w.biome[i],P=w.Pr[i];if(b===5||b===6)w.turf[i]=clamp((P-300)/150,0,1)*clamp((700-P)/100,0,1)*(1-Math.min(1,2*w.rv[i]))*(dryWinter(i)?0.25:1)}
    for(const i of w.landIdx){const k=soilFor(w,i),so=SOILS[k];w.soil[i]=k;w.soilDig[i]=so.dig;if(w.turf[i]>0.3)w.sod[i]=1;w.soilFert[i]=so.fert;w.soilDrain[i]=so.drain;w.soilSalt[i]=so.salt;w.soilErode[i]=so.erode;
      // heavy wet clays belong to forest and savanna-clay soils, not to volcanic highlands, river silt or mountain soils
      if(!['forest','podzol','clay'].includes(so.k))w.heavy[i]=0}}
  if(!w.sF0){w.sF0=Float32Array.from(w.sF);w.sH0=Float32Array.from(w.sH);w.leach0=Float32Array.from(w.leach);w.trop0=Float32Array.from(w.trop)}
  else{w.sF.set(w.sF0);w.sH.set(w.sH0);w.leach.set(w.leach0);w.trop.set(w.trop0);w.exQ=null}
  if(w.malAm)for(const i of w.landIdx)if(w.malAm[i]>0)w.mal[i]=0;s.malAm=false;
  Object.assign(s,{lint:new Float32Array(N),sFc:Float32Array.from(w.sF),pkAv:new Uint16Array(N),crop:new Int8Array(N).fill(-1),cY:new Float32Array(N),cTax:new Float32Array(N),cStore:new Float32Array(N),cDrain:new Float32Array(N).fill(1),cBand:new Float32Array(CROPS.length*2).map((_,k)=>k%2?-1:99),open:new Float32Array(N).fill(1),pkGrow:new Uint16Array(N),malF:new Float32Array(N).fill(1),fclr:new Float32Array(N)});
  for(const i of w.landIdx)s.open[i]=1-w.turf[i];
  if(!w.alat){w.alat=new Float32Array(N);for(const i of w.landIdx)w.alat[i]=Math.abs(w.lat[i]*180/Math.PI)}
}
// a farming hearth: its package is the historical one on Earth, or whichever fits best elsewhere
function hearthPackage(h,c){const w=WD;if(h.pk!=null)return CI[h.pk];
  let best=0,bv=-1;CROPS.forEach((C,k)=>{if(C.introduced)return;const v=C.fit(w.T[c],w.Pr[c],w.rvF[c],w.elev[c])*C.y;if(v>bv){bv=v;best=k}});return best}
// the South American hearth also carries cassava, domesticated in the southwest Amazon
// Crops are bred for the day length and season of their homeland; moving them far north or south takes centuries of selection.
// Each crop's adapted band of latitude starts around its hearth and widens only where farmers grow it at the edge,
// about a quarter of a degree a century: maize took some 5,000 years to go from the Balsas valley to the American Southwest
// and the Eastern Woodlands (Smith 2006; Diamond 1997, on axes of spread).
function bandIn(k,c){const b=S.cBand,a=WD.alat[c];b[2*k]=Math.min(b[2*k],Math.max(0,a-7));b[2*k+1]=Math.max(b[2*k+1],a+7)}
function plantHearth(k,c){const s=S,bit=(1<<k)|(k===CI.potato?1<<CI.cassava:0);bandIn(k,c);if(k===CI.potato)bandIn(CI.cassava,c);s.pkAv[c]|=bit;ring(c,2,j=>{if(WD.land[j])s.pkAv[j]|=bit});cropPass(true)}
// every ten years: packages spread with farmers and by sea, each farm grows its best package, and some learn to process it
function cropPass(quiet){
  const s=S,w=WD,r=s.r,L=w.landIdx,pkAv=s.pkAv,farm=s.farm,pop=s.pop,nb=w.nb,cdT=s.cdT,cdP=s.cdP,dT=s.dT+s.gT;
  const chu=s.tk[TI.chuno],nix=s.tk[TI.nixtamal],ter=s.tk[TI.terrace],sFc=s.sFc,cB=s.cBand,alat=w.alat,edge=new Uint8Array(CROPS.length);
  // farmers pass on the crops they grow; seed they only carry (traded, or brought by herders) travels about ten times slower,
  // so a short desert gap is crossed in centuries but rice does not walk from Asia into the Congo. Seafarers carry seed too.
  const grow=s.pkGrow;
  for(const i of L){if(pkAv[i]||farm[i]<0.3)continue;let b=0;for(let d=0;d<4;d++){const j=nb[i*4+d];if(j>=0)b|=grow[j]}pkAv[i]=b}
  if(!quiet)for(const i of L){const g=grow[i],c=pkAv[i];if(farm[i]<0.3||!c||pop[i]<1)continue;
    for(let d=0;d<4;d++){const j=nb[i*4+d];if(j<0||pop[j]<1)continue;if((pkAv[j]|g)!==pkAv[j]&&r()<0.12)pkAv[j]|=g;else if((pkAv[j]|c)!==pkAv[j]&&r()<0.012)pkAv[j]|=c}
    if(s.sail[i]>0.3&&r()<0.05){const a=w.ls[i],b=w.ls[i+1];if(b>a){const j=w.lt[a+((r()*(b-a))|0)];if(pop[j]>=1)pkAv[j]|=g}}}
  for(const i of L){const av=pkAv[i];if(!av){grow[i]=0;sFc[i]=w.sF[i];s.crop[i]=-1;s.cY[i]=0;s.cTax[i]=0;s.cStore[i]=0;s.cDrain[i]=1;continue}
    const T=w.T[i]+(cdT?cdT[i]:0)+dT,P=Math.max(0.3*w.Pr[i],w.Pr[i]+(cdP?cdP[i]:0)),rv=w.rvF[i],el=w.elev[i];
    const a=alat[i];let best=-1,bv=0,bf=0,gm=0;for(let k=0;k<CROPS.length;k++){if(!(av&(1<<k)))continue;const C=CROPS[k],dl=Math.max(0,cB[2*k]-a,a-cB[2*k+1]),f=C.fit(T,P,rv,el)*(dl>0?Math.exp(-dl*dl/9):1);if(f>0.15)gm|=1<<k;const v=f*C.y*(k===CI.maize&&nix[i]>0.5?1.1:1);if(v>bv){bv=v;best=k;bf=f}}grow[i]=gm;
    // farm suitability for what is actually grown: cool-summer crops do not need the warm summers cereals do, and terraces tame slopes
    {let b=w.sF[i];const ro=w.rough[i],rf=1-0.65*ro;
      if(best===CI.potato){const pS=clamp((P-280)/450,0,1)*clamp((3400-P)/1600,0.25,1);b=Math.max(b,pS*rf*(1-0.7*w.leach[i]))}
      if(ter[i]>0.5&&ro>0.05)b=Math.min(1,b*(1-0.65*ro*0.4)/rf);sFc[i]=b}
    if(best<0||bf<0.05){s.crop[i]=-1;s.cY[i]=0;s.cTax[i]=0;s.cStore[i]=0;s.cDrain[i]=1;continue}
    const C=CROPS[best];let st=C.store,tx=C.tax;
    if(best===CI.potato&&chu[i]>0.5){st=0.8;tx=0.7}
    s.crop[i]=best;s.cY[i]=bv;s.cTax[i]=tx;s.cStore[i]=st;s.cDrain[i]=C.drain;
    if(quiet)continue;
    if(farm[i]>0.5&&pop[i]>=1){if(a>cB[2*best+1]-1.5)edge[best]|=1;if(a<cB[2*best]+1.5)edge[best]|=2}
    // discoveries: freezing and sun-drying potatoes where nights freeze and days are dry; soaking maize in lime
    if(best===CI.potato&&!s.firstTech[TI.chuno]&&el>2500&&P<1300&&T>-2&&T<14&&farm[i]>0.6&&pop[i]>2000&&r()<0.004){seedTech(chu,i,1,1);firstTech(TI.chuno,i,s.pol[i]?s.pols[s.pol[i]]:null)}
    // Boserup: crowded farmers on slopes or in wetlands build terraces and raised fields
    // invented independently wherever crowding on slopes or wetlands demands it (Yemen, China, the Andes, Mesoamerica, New Guinea)
    if(ter[i]<0.1&&(w.rough[i]>0.3||(P>1000&&w.rough[i]<0.1&&w.rv[i]>0.15))&&farm[i]>0.7&&pop[i]>0.85*s.K[i]&&pop[i]/w.area[i]>4&&r()<0.0006){seedTech(ter,i,1,1);if(!s.firstTech[TI.terrace])firstTech(TI.terrace,i,s.pol[i]?s.pols[s.pol[i]]:null)}
    if(best===CI.maize&&!s.firstTech[TI.nixtamal]&&farm[i]>0.7&&pop[i]>3000&&r()<0.0015){seedTech(nix,i,1,1);firstTech(TI.nixtamal,i,s.pol[i]?s.pols[s.pol[i]]:null)}}
  if(!quiet){for(let k=0;k<CROPS.length;k++){if(edge[k]&1)cB[2*k+1]+=0.025;if(edge[k]&2)cB[2*k]=Math.max(0,cB[2*k]-0.025)}openPass()}
}
// after each climate re-solve: farm and pasture suitability follow the new climate (a greener Sahara can be farmed)
function climateSuit(){const s=S,w=WD;if(!w.sF0)return;
  for(const i of w.landIdx){const t=w.T[i]+s.cdT[i],p=Math.max(0.3*w.Pr[i],w.Pr[i]+s.cdP[i]);
    if(Math.abs(s.cdT[i])<0.05&&Math.abs(s.cdP[i])<5){w.sF[i]=w.sF0[i];w.sH[i]=w.sH0[i];w.leach[i]=w.leach0[i];w.trop[i]=w.trop0[i];continue}
    // the measured baseline already holds local detail the formulas miss, so apply only the change the formulas predict
    const a=suitFor(w,i,w.T[i],w.Pr[i]),b=suitFor(w,i,t,p);
    // capped: the formulas jump at thresholds (a biome boundary, a growing-season cutoff), the land changes less abruptly
    const dl=(x,y)=>clamp(x-y,-0.2,0.2);
    w.sF[i]=clamp(w.sF0[i]+dl(b[0],a[0]),0,1);w.sH[i]=clamp(w.sH0[i]+dl(b[1],a[1]),0,1);w.leach[i]=clamp(w.leach0[i]+b[2]-a[2],0,1);w.trop[i]=clamp(w.trop0[i]+b[3]-a[3],0,1)}
  w.exQ=null;cropPass(true)}
// how much of a province's harvest a ruler can actually take: storable, visible staples, or labour service once
// there are storehouses and roads to organize it (the Inca mit'a)
function taxEff(i){const s=S,w=WD,crop=Math.max(cerealEff(i),0);
  const labour=(0.1+0.3*s.roads[i]+0.25*s.admin[i])*(0.4+0.6*s.cStore[i])*Math.min(1,s.pop[i]/w.area[i]/10);
  return Math.max(crop,labour)}

// first ocean contact between landmasses: each side gets the other's crops, and Old World fevers reach the Americas
function contactCrops(a,b){const s=S,w=WD;const all=lm=>{let m=0;for(const i of w.landIdx)if(w.lm[i]===lm)m|=s.pkAv[i];return m};
  const ma=all(w.lm[a]),mb=all(w.lm[b]);s.pkAv[a]|=mb;s.pkAv[b]|=ma;
  // ships also carry animals: horses reach the Americas only now
  if(s.dom)for(let sp=0;sp<HERDS.length;sp++){const ha=s.dom[sp][a],hb=s.dom[sp][b];if(ha>0.05&&capFor(sp,b)>0.02)s.dom[sp][b]=Math.max(hb,0.1);if(hb>0.05&&capFor(sp,a)>0.02)s.dom[sp][a]=Math.max(ha,0.1)}
  const lonOf=i=>(w.cxA[i]+0.5)/W*360-180,am=i=>lonOf(i)<-30;
  if(!s.malAm&&am(a)!==am(b)&&w.malAm){s.malAm=true;for(const i of w.landIdx)if(w.malAm[i]>0)w.mal[i]=w.malAm[i];
    const c=am(a)?a:b;chron('plague','Ships from across the ocean bring malaria to the Americas; the warm lowlands become deadly.',c,[])}}

// ---------- opening the land ----------
// Turf is broken field by field, by labour. Farming peoples do it when crowded (Boserup 1965): slowly with hoes and digging
// sticks, faster with ards and iron shares, quickly with heavy ploughs; friable soils (loess, silt) go faster than clays.
// Herding peoples leave the turf for their animals. Fields abandoned or turned to pasture go back to grass within a few generations.
// Tropical forest cleared for fields leaves sunlit pools where malaria mosquitoes breed (Livingstone 1958); regrowth shades them out.
function openPass(){const s=S,w=WD,L=w.landIdx,op=s.open,pop=s.pop,K=s.K,nb=w.nb,eths=s.eths;
  for(const i of L){const tu=w.turf[i];
    if(tu>0){const o0=1-tu;let o=op[i];
      if(pop[i]<1||s.farm[i]<0.3||s.past[i]>0.7)o-=0.05*(o-o0);
      else{const e=s.eth[i]>=0?eths[s.eth[i]]:null,trad=1-(e&&e.past!=null?e.past:0.5);
        // crowding here, or crowded farmers next door looking for land
        let push=clamp((pop[i]/Math.max(1,K[i])-0.6)/0.4,0,1);
        for(let d=0;d<4;d++){const j=nb[i*4+d];if(j>=0&&pop[j]>=1&&s.farm[j]>0.3)push=Math.max(push,op[j]*clamp((pop[j]/Math.max(1,K[j])-0.7)/0.3,0,1))}
        // hoes and scratch-ards barely cut virgin sod; iron shares help a little; the heavy mouldboard plough turns it over
        const tool=0.015+0.03*s.ard[i]+0.08*s.iron[i]+2.5*s.plough[i];
        o+=0.04*tool*w.soilDig[i]*push*trad*(1-0.7*s.past[i])*(1-o)}
      op[i]=clamp(o,o0,1)}
    const f0=w.forest0[i];if(f0>0.3&&w.T[i]>20)s.malF[i]=0.55+0.45*clamp(1-s.forest[i]/f0,0,1)}
}

// ---------- the origins of farming ----------
// Farming is not placed: it grows out of foragers' lives where four things meet (Bar-Yosef 1998; Richerson, Boyd & Bettinger
// 2001; Smith 2001; Fuller 2007). Wild plants worth domesticating grow there (on Earth, the real ranges of the wild ancestors);
// foragers settle down on rich, storable wild food; something squeezes them (crowding, a cold or dry spell, the demands of
// feasts at a sacred site) so they start to tend and sow; and they keep at it without a break for the two to five thousand years
// selection takes. A bad spell sends them back to the hunt and the selection slips; most attempts fail. Once the package is
// complete it locks in and spreads with the farmers' children (the frontier in techStep and migrate).
// q: how much food the wild progenitors give: big-seeded grasses of the Mediterranean-climate hills far outyield teosinte or
// goosefoot (Blumler 1998; Diamond 1997, ch. 8)
const WILD=[
  {k:'fc',q:1.0,n:'the Fertile Crescent',pk:'wheat',box:[31,39,34,48],t:2700,crop:'wheat and barley',anim:'sheep and goats',grain:1},
  {k:'yz',q:0.8,n:'the Yangtze',pk:'rice',box:[24,32,108,122],t:3500,crop:'rice',anim:'pigs',grain:1},
  {k:'yr',q:0.8,n:'the Yellow River',pk:'millet',box:[33,41,104,118],t:2200,crop:'millet',anim:'pigs and dogs',grain:1},
  {k:'ng',q:0.75,n:'the New Guinea highlands',pk:'yams',box:[-8,-3,138,148],t:2600,crop:'taro and bananas',anim:'pigs',grain:0},
  {k:'ma',q:0.5,n:'the Balsas lowlands',pk:'maize',box:[16,21,-104,-96],t:3500,crop:'maize, beans and squash',anim:'turkeys and dogs',grain:1},
  {k:'an',q:0.65,n:'the Andes',pk:'potato',box:[-18,-8,-78,-66],t:3400,crop:'potatoes and quinoa',anim:'llamas and guinea pigs',grain:0.6},
  {k:'sa',q:0.5,n:'the Sahel',pk:'sorghum',box:[10,18,-10,35],t:2000,crop:'sorghum and pearl millet',anim:'cattle',grain:1},
  {k:'wa',q:0.55,n:'the West African forest edge',pk:'yams',box:[5,10,-8,10],t:5000,crop:'yams and oil palm',anim:'goats',grain:0},
  {k:'ea',q:0.45,n:'the Eastern Woodlands',pk:'sunflower',box:[33,40,-92,-82],t:3000,crop:'sunflowers and squash',anim:'dogs',grain:0.6}];
function originsInit(){const s=S,w=WD;s.wildG=new Float32Array(N);s.sed=new Float32Array(N);s.cultv=new Float32Array(N);s.domst=new Float32Array(N);s.origins={};s.oriLog={};
  if(!w.wildR){w.wildR=new Int8Array(N).fill(-1);w.wildW=new Float32Array(N);
    if(w.isEarth)for(let i=0;i<N;i++){if(!w.land0[i])continue;const la=w.lat[i]*57.2958,lo=(w.cxA[i]+0.5)/W*360-180;
      WILD.forEach((R,k)=>{const [a,b,c,d]=R.box;if(la<a||la>b||lo<c||lo>d)return;
        const e=Math.min(la-a,b-la,lo-c,d-lo),v=0.5+0.5*clamp(e/2,0,1);if(v>w.wildW[i]){w.wildW[i]=v;w.wildR[i]=k}})}}}
function originsOn(){return WD.isEarth&&P.hearthMode==='emergent'}
// every five years
function originsPass(){if(!originsOn())return;const s=S,w=WD,L=w.landIdx,y=s.year,agg=WILD.map(()=>({sed:0,cul:0,dom:0,c:-1}));
  for(const i of L){const p=s.pop[i];if(p<1){s.sed[i]*=0.9;s.cultv[i]*=0.9;continue}
    const la=Math.abs(w.lat[i])*57.2958,ri=w.wildR[i];
    // farmers whose borrowed crops do poorly here take up the local wild plants too (secondary domestication: millet beside
    // borrowed rice, sorghum beside wheat that fails in the summer rains)
    if(s.farm[i]>0.5){s.sed[i]=1;if(ri<0||s.origins[WILD[ri].k])continue;const R=WILD[ri],C=CROPS[CI[R.pk]];
      const g=w.wildW[i]*clamp(1.3*C.fit(w.T[i]+s.cdT[i],Math.max(0,w.Pr[i]+s.cdP[i]),w.rvF[i],w.elev[i]),0,1)*R.q,have=s.crop[i]>=0?s.cY[i]:0.3,pr=clamp(1.2*g-0.8*have,0,1);
      let cv=s.cultv[i];cv=clamp(cv+0.05*pr*(1-cv)-0.01*(1-pr)*cv,0,1);s.cultv[i]=cv;let dm=s.domst[i];
      if(cv>0.15)dm=Math.min(1,dm+15*cv*Math.min(1,1.5*g)/R.t);s.domst[i]=dm;const A=agg[ri];if(cv>A.cul)A.cul=cv;if(dm>A.dom){A.dom=dm;A.c=i}continue}
    const rich=clamp((s.Kf[i]/w.area[i]-0.1)/0.25,0,1);
    // wild stands: big-seeded grasses store for years; roots and fruit keep poorly and invite less settling
    let grain=0;if(ri>=0){const C=CROPS[CI[WILD[ri].pk]];grain=w.wildW[i]*clamp(1.3*C.fit(w.T[i]+s.cdT[i]+s.evT[i],Math.max(0,w.Pr[i]*s.evP[i]+s.cdP[i]),w.rvF[i],w.elev[i]),0,1)*(WILD[ri].grain?1:0.6)*WILD[ri].q}
    s.wildG[i]=grain;
    const cool=w.coast[i]?clamp((la-33)/8,0,1)*clamp((62-la)/8,0,1):0,nuts=w.forest0[i]*clamp((w.T[i]-4)/6,0,1)*clamp((24-w.T[i])/6,0,1);
    const stor=Math.max(grain,0.8*cool,0.45*nuts);
    const stress=Math.min(1,clamp(-s.evT[i]/2,0,1)+clamp((1-s.evP[i])*3,0,1)+clamp((0.85-s.wm[i])*2,0,1));
    const tgt=rich*stor*(1-0.6*stress);let sd=s.sed[i];sd+=(tgt-sd)*(tgt>sd?0.02:0.05);s.sed[i]=sd;
    let cv=s.cultv[i],dm=s.domst[i];
    if(grain>0.1&&sd>0.35){const crowd=clamp((p/w.area[i]-0.15)/0.4,0,1),press=Math.min(1,crowd+0.7*stress+0.6*(s.ritW?s.ritW[i]:0));
      cv+=0.03*sd*grain*press*(1-cv)-0.006*(1-press)*cv}
    else cv-=0.05*cv;
    s.cultv[i]=cv=clamp(cv,0,1);
    if(ri>=0){const R=WILD[ri];if(cv>0.15)dm=Math.min(1,dm+5*cv*Math.min(1,1.5*grain)/R.t);else if(cv<0.1)dm=Math.max(0,dm-5*0.5/R.t);s.domst[i]=dm;
      const A=agg[ri];if(sd>A.sed)A.sed=sd;if(cv>A.cul)A.cul=cv;if(dm>A.dom){A.dom=dm;A.c=i}}}
  WILD.forEach((R,k)=>{const A=agg[k],f=s.oriLog[R.k]||(s.oriLog[R.k]={});if(s.origins[R.k]||A.c<0)return;
    const e=s.eth[A.c]>=0?s.eths[s.eth[A.c]]:null,nm=e?`the ${e.name}`:'foragers';
    if(A.sed>0.6&&!f.sed){f.sed=y;chron('ideas',`In ${R.n}, ${nm} begin to live year-round in villages, living off stores of wild ${R.grain?'grain':'roots and fruit'}.`,A.c,e?[RE(e)]:[])}
    if(A.cul>0.4&&!f.cul){f.cul=y;f.up=1;chron('ideas',`In ${R.n}, ${nm} begin to sow and tend the wild ${R.grain?'grasses':'plants'} they once only gathered.`,A.c,e?[RE(e)]:[])}
    if(f.up&&A.cul<0.15){f.up=0;f.fail=(f.fail||0)+1;chron('ideas',`In ${R.n}, ${nm} abandon their plots and villages and go back to the hunt; what their sowing had bred slips back toward the wild.`,A.c,e?[RE(e)]:[])}
    else if(!f.up&&A.cul>0.4){f.up=1;chron('ideas',`In ${R.n}, ${nm} take up sowing again in the old village sites.`,A.c,e?[RE(e)]:[])}
    if(A.dom>=1){s.origins[R.k]={y,cell:A.c};
      chron('ideas',`In ${R.n}, after ${f.cul?y-f.cul:'many'} years of sowing, the ${R.crop} of ${nm} no longer scatter their seed or grow wild: they need the farmer, and the farmer needs them.`,A.c,e?[RE(e)]:[],'Farming locks in: from here it spreads with the farmers\' children.');
      s.hearths.push({kind:'farm',cell:A.c,year:y,done:false,crop:R.crop,anim:R.anim,grain:R.grain,pk:R.pk,origin:R.k})}})}
