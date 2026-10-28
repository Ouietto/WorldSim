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
  {k:'tundra',n:'Frozen soils',fert:0.3,drain:1.2,salt:1,erode:1},
  {k:'desert',n:'Desert soils',fert:0.9,drain:1.0,salt:1.6,erode:1},
  {k:'alluvium',n:'River silt',fert:1.12,drain:0.5,salt:1.1,erode:0.5},
  {k:'volcanic',n:'Volcanic highland soils',fert:1.15,drain:0.8,salt:1,erode:1.2},
  {k:'mountain',n:'Thin mountain soils',fert:0.85,drain:1.2,salt:1,erode:1.6},
  {k:'tropical',n:'Leached tropical soils',fert:1.0,drain:1.6,salt:1,erode:1.2},
  {k:'podzol',n:'Acid forest soils',fert:0.72,drain:1.2,salt:1,erode:1},
  {k:'blackearth',n:'Black earth',fert:1.05,drain:0.7,salt:1,erode:0.8,sod:1},
  {k:'clay',n:'Heavy savanna clays',fert:1.0,drain:0.9,salt:1.2,erode:0.8},
  {k:'forest',n:'Brown forest soils',fert:1.0,drain:1.0,salt:1,erode:1},
];
const SOI=Object.fromEntries(SOILS.map((s,k)=>[s.k,k]));
function soilFor(w,i){const T=w.T[i],P=w.Pr[i],la=Math.abs(w.lat[i]*180/Math.PI);
  if(T<-6)return SOI.tundra;if(P<250&&w.rv[i]<0.35)return SOI.desert;
  if(w.rv[i]>0.4&&w.elev[i]<1500)return SOI.alluvium;
  if(w.elev[i]>1200&&T>6&&w.rough[i]>0.2&&la<35)return SOI.volcanic;
  if(w.rough[i]>0.5)return SOI.mountain;
  if(w.leach[i]>0.3)return SOI.tropical;
  if(T<5&&P>300)return SOI.podzol;
  if(T>=0&&T<16&&P>=300&&P<=750&&w.rough[i]<0.3)return SOI.blackearth;
  if(T>18&&P>=500&&P<=1300&&w.amp[i]>3&&w.rough[i]<0.25)return SOI.clay;
  return SOI.forest}
// farm and pasture suitability for a climate (same rules as world generation), so they can follow climate change
function suitFor(w,i,t,p){
  const amp=w.amp[i],rv=w.rv[i],tw=t+amp/2,half=amp/2,gs=half<0.5?(t>6?12:0):(t-half>=6?12:t+half<=6?0:12*Math.acos(clamp((6-t)/half,-1,1))/Math.PI);
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
    for(const i of w.landIdx){const k=soilFor(w,i),so=SOILS[k];w.soil[i]=k;if(so.sod)w.sod[i]=1;w.soilFert[i]=so.fert;w.soilDrain[i]=so.drain;w.soilSalt[i]=so.salt;w.soilErode[i]=so.erode;
      // heavy wet clays belong to forest and savanna-clay soils, not to volcanic highlands, river silt or mountain soils
      if(!['forest','podzol','clay'].includes(so.k))w.heavy[i]=0}}
  if(!w.sF0){w.sF0=Float32Array.from(w.sF);w.sH0=Float32Array.from(w.sH);w.leach0=Float32Array.from(w.leach);w.trop0=Float32Array.from(w.trop)}
  else{w.sF.set(w.sF0);w.sH.set(w.sH0);w.leach.set(w.leach0);w.trop.set(w.trop0);w.exQ=null}
  if(w.malAm)for(const i of w.landIdx)if(w.malAm[i]>0)w.mal[i]=0;s.malAm=false;
  Object.assign(s,{lint:new Float32Array(N),sFc:Float32Array.from(w.sF),pkAv:new Uint16Array(N),crop:new Int8Array(N).fill(-1),cY:new Float32Array(N),cTax:new Float32Array(N),cStore:new Float32Array(N),cDrain:new Float32Array(N).fill(1)});
}
// a farming hearth: its package is the historical one on Earth, or whichever fits best elsewhere
function hearthPackage(h,c){const w=WD;if(h.pk!=null)return CI[h.pk];
  let best=0,bv=-1;CROPS.forEach((C,k)=>{if(C.introduced)return;const v=C.fit(w.T[c],w.Pr[c],w.rv[c],w.elev[c])*C.y;if(v>bv){bv=v;best=k}});return best}
// the South American hearth also carries cassava, domesticated in the southwest Amazon
function plantHearth(k,c){const s=S,bit=(1<<k)|(k===CI.potato?1<<CI.cassava:0);s.pkAv[c]|=bit;ring(c,2,j=>{if(WD.land[j])s.pkAv[j]|=bit});cropPass(true)}
// every ten years: packages spread with farmers and by sea, each farm grows its best package, and some learn to process it
function cropPass(quiet){
  const s=S,w=WD,r=s.r,L=w.landIdx,pkAv=s.pkAv,farm=s.farm,pop=s.pop,nb=w.nb,cdT=s.cdT,cdP=s.cdP,dT=s.dT+s.gT;
  const chu=s.tk[TI.chuno],nix=s.tk[TI.nixtamal],ter=s.tk[TI.terrace],sFc=s.sFc;
  // new farmers bring the crops of the neighbours they learned farming from
  for(const i of L){if(pkAv[i]||farm[i]<0.3)continue;let b=0;for(let d=0;d<4;d++){const j=nb[i*4+d];if(j>=0)b|=pkAv[j]}pkAv[i]=b}
  if(!quiet)for(const i of L){if(farm[i]<0.3||!pkAv[i]||pop[i]<1)continue;
    for(let d=0;d<4;d++){const j=nb[i*4+d];if(j>=0&&pop[j]>=1&&(pkAv[j]|pkAv[i])!==pkAv[j]&&r()<0.12)pkAv[j]|=pkAv[i]}
    if(s.sail[i]>0.3&&r()<0.05){const a=w.ls[i],b=w.ls[i+1];if(b>a){const j=w.lt[a+((r()*(b-a))|0)];if(pop[j]>=1)pkAv[j]|=pkAv[i]}}}
  for(const i of L){const av=pkAv[i];if(!av){sFc[i]=w.sF[i];s.crop[i]=-1;s.cY[i]=0;s.cTax[i]=0;s.cStore[i]=0;s.cDrain[i]=1;continue}
    const T=w.T[i]+(cdT?cdT[i]:0)+dT,P=Math.max(0.3*w.Pr[i],w.Pr[i]+(cdP?cdP[i]:0)),rv=w.rv[i],el=w.elev[i];
    let best=-1,bv=0,bf=0;for(let k=0;k<CROPS.length;k++){if(!(av&(1<<k)))continue;const C=CROPS[k],f=C.fit(T,P,rv,el),v=f*C.y*(k===CI.maize&&nix[i]>0.5?1.1:1);if(v>bv){bv=v;best=k;bf=f}}
    // farm suitability for what is actually grown: cool-summer crops do not need the warm summers cereals do, and terraces tame slopes
    {let b=w.sF[i];const ro=w.rough[i],rf=1-0.65*ro;
      if(best===CI.potato){const pS=clamp((P-280)/450,0,1)*clamp((3400-P)/1600,0.25,1);b=Math.max(b,pS*rf*(1-0.7*w.leach[i]))}
      if(ter[i]>0.5&&ro>0.05)b=Math.min(1,b*(1-0.65*ro*0.4)/rf);sFc[i]=b}
    if(best<0||bf<0.05){s.crop[i]=-1;s.cY[i]=0;s.cTax[i]=0;s.cStore[i]=0;s.cDrain[i]=1;continue}
    const C=CROPS[best];let st=C.store,tx=C.tax;
    if(best===CI.potato&&chu[i]>0.5){st=0.8;tx=0.7}
    s.crop[i]=best;s.cY[i]=bv;s.cTax[i]=tx;s.cStore[i]=st;s.cDrain[i]=C.drain;
    if(quiet)continue;
    // discoveries: freezing and sun-drying potatoes where nights freeze and days are dry; soaking maize in lime
    if(best===CI.potato&&!s.firstTech[TI.chuno]&&el>2500&&P<1300&&T>-2&&T<14&&farm[i]>0.6&&pop[i]>2000&&r()<0.004){seedTech(chu,i,1,1);firstTech(TI.chuno,i,s.pol[i]?s.pols[s.pol[i]]:null)}
    // Boserup: crowded farmers on slopes or in wetlands build terraces and raised fields
    // invented independently wherever crowding on slopes or wetlands demands it (Yemen, China, the Andes, Mesoamerica, New Guinea)
    if(ter[i]<0.1&&(w.rough[i]>0.3||(P>1000&&w.rough[i]<0.1&&w.rv[i]>0.15))&&farm[i]>0.7&&pop[i]>0.85*s.K[i]&&pop[i]/w.area[i]>4&&r()<0.0006){seedTech(ter,i,1,1);if(!s.firstTech[TI.terrace])firstTech(TI.terrace,i,s.pol[i]?s.pols[s.pol[i]]:null)}
    if(best===CI.maize&&!s.firstTech[TI.nixtamal]&&farm[i]>0.7&&pop[i]>3000&&r()<0.0015){seedTech(nix,i,1,1);firstTech(TI.nixtamal,i,s.pol[i]?s.pols[s.pol[i]]:null)}}
}
// after each climate re-solve: farm and pasture suitability follow the new climate (a greener Sahara can be farmed)
function climateSuit(){const s=S,w=WD;if(!w.sF0)return;
  for(const i of w.landIdx){const t=w.T[i]+s.cdT[i],p=Math.max(0.3*w.Pr[i],w.Pr[i]+s.cdP[i]);
    if(Math.abs(s.cdT[i])<0.05&&Math.abs(s.cdP[i])<5){w.sF[i]=w.sF0[i];w.sH[i]=w.sH0[i];w.leach[i]=w.leach0[i];w.trop[i]=w.trop0[i];continue}
    // the measured baseline already holds local detail the formulas miss, so apply only the change the formulas predict
    const a=suitFor(w,i,w.T[i],w.Pr[i]),b=suitFor(w,i,t,p);
    w.sF[i]=clamp(w.sF0[i]+b[0]-a[0],0,1);w.sH[i]=clamp(w.sH0[i]+b[1]-a[1],0,1);w.leach[i]=clamp(w.leach0[i]+b[2]-a[2],0,1);w.trop[i]=clamp(w.trop0[i]+b[3]-a[3],0,1)}
  w.exQ=null;cropPass(true)}
// how much of a province's harvest a ruler can actually take: storable, visible staples, or labour service once
// there are storehouses and roads to organize it (the Inca mit'a)
function taxEff(i){const s=S,w=WD,crop=Math.max(cerealEff(i),0);
  const labour=(0.1+0.3*s.roads[i]+0.25*s.admin[i])*(0.4+0.6*s.cStore[i])*Math.min(1,s.pop[i]/w.area[i]/10);
  return Math.max(crop,labour)}

// first ocean contact between landmasses: each side gets the other's crops, and Old World fevers reach the Americas
function contactCrops(a,b){const s=S,w=WD;const all=lm=>{let m=0;for(const i of w.landIdx)if(w.lm[i]===lm)m|=s.pkAv[i];return m};
  const ma=all(w.lm[a]),mb=all(w.lm[b]);s.pkAv[a]|=mb;s.pkAv[b]|=ma;
  const lonOf=i=>(w.cxA[i]+0.5)/W*360-180,am=i=>lonOf(i)<-30;
  if(!s.malAm&&am(a)!==am(b)&&w.malAm){s.malAm=true;for(const i of w.landIdx)if(w.malAm[i]>0)w.mal[i]=w.malAm[i];
    const c=am(a)?a:b;chron('plague','Ships from across the ocean bring malaria to the Americas; the warm lowlands become deadly.',c,[])}}
