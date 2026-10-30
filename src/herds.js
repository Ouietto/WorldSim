"use strict";
/* ================= LAND USE, HERDS AND HORSEMEN =================
   The same land can be farmed or grazed. Each province's mix is set by what pays (crops, animals, soil and tools on hand),
   by who lives there (a people's herding tradition is inherited and changes slowly), by raids (exposed fields are costly),
   and by who rules (steppe lords want pasture that feeds horses; landlords, merchants and officials want what pays).
   Courts split between the two are unstable (Kublai and Ariq Böke); some states rule herders and farmers under separate
   laws (the Liao's northern and southern chancelleries). Sources: Barfield 1989; Di Cosmo 2002; Khazanov 1994. */

// ---------- land use ----------
function landUseInit(){const s=S,w=WD;
  if(!w.nomad0)w.nomad0=Uint8Array.from(w.nomad);else w.nomad.set(w.nomad0);
  Object.assign(s,{past:new Float32Array(N).fill(0.5),Kfa:new Float32Array(N),Kh:new Float32Array(N),Kf:new Float32Array(N),raidC:new Int32Array(N).fill(-1e9)});
  for(const e of s.eths)if(e.past==null)e.past=0.5;
}
// a people's herding tradition, inherited and blended like its culture
function inheritPast(e,p,p2){e.past=p?clamp((p2?(p.past+p2.past)/2:p.past)+gauss(S.r)*0.04,0,1):0.5;e.pastSet=p?p.pastSet||0:0}
// every ten years
function landUsePass(){
  const s=S,w=WD,L=w.landIdx,past=s.past,pol=s.pol,pols=s.pols,eths=s.eths,y=s.year;
  const sum=new Float64Array(eths.length),wt=new Float64Array(eths.length);
  for(const i of L){const p=s.pop[i];if(p<1||(s.farm[i]<0.1&&s.herd[i]<0.1))continue;
    // fields on dry, drought-prone land are a gamble that herds, which can move, are not
    const risk=1-0.4*clamp((550-w.Pr[i])/300,0,1)*(1-0.7*s.irrig[i]*w.rv[i]);
    const F=(s.Kfa[i]+0.3*s.Kh[i]+0.2*s.Kf[i])*risk,Hh=s.Kh[i]+0.4*s.Kf[i];if(F+Hh<=0)continue;
    const e=s.eth[i]>=0?eths[s.eth[i]]:null,trad=e&&e.past!=null?e.past:0.5;
    // raided, open country is safer grazed than sown
    const raided=y-s.raidC[i]<30&&w.rough[i]<0.35?1:0;
    const o=pol[i]?pols[pol[i]]:null,policy=o&&o.kind==='state'&&o.steppe!=null?o.steppe-0.5:o&&o.kind==='horde'?0.4:0;
    const share=Fx=>1/(1+Math.exp(-(6*(Hh/(Fx+Hh)-0.5)+3*(trad-0.5)+0.8*raided+1.6*policy)));
    // on grassland, the broken fields and the unbroken turf are weighed apart: turf that hoes and ards cannot work is pasture
    let target;const tu=w.turf?w.turf[i]:0;
    if(tu>0){const op=s.open[i],f1=0.04+0.08*s.iron[i]+0.6*s.plough[i],Fb=s.Kfa[i]/Math.max(0.01,op+(1-op)*f1),rest=0.3*s.Kh[i]+0.2*s.Kf[i];
      target=op*share((Fb+rest)*risk)+(1-op)*share((Fb*f1+rest)*risk)}
    else target=share(F);
    past[i]+=0.15*(target-past[i]);
    w.nomad[i]=past[i]>0.55&&(w.sH[i]>0.12||w.desert[i])?1:0;
    if(e){sum[e.id]+=p*past[i];wt[e.id]+=p}}
  // traditions drift, slowly, toward how a people actually lives
  // (a people's first generation of farmers or herders sets the tradition outright; after that it moves over centuries)
  for(const e of eths){if(!wt[e.id])continue;const m=sum[e.id]/wt[e.id];if(!e.pastSet){e.pastSet=1;e.past=m}else e.past+=0.03*(m-e.past)}
}
// ---------- the ruling coalition: steppe lords versus landlords, merchants and officials ----------
function elitePass(o){
  const s=S,r=s.r,c=o.capital;
  if(o.kind!=='state'){o.steppe=1;o.pD=0;return}
  const e=s.eths[o.core];if(o.steppe==null)o.steppe=e&&e.past!=null?Math.max(e.past,o.nomF||0):0.3;
  let ps=0,pp=0;for(const i of o.sample||[]){pp+=s.pop[i];ps+=s.pop[i]*s.past[i]}const popPast=pp?ps/pp:o.steppe;
  // conquering and taxing farmland slowly turns steppe nobles into landholders; a fresh wave of herders turns it back
  const target=0.55*popPast+0.45*(e&&e.past!=null?e.past:popPast),was=o.steppe;
  o.steppe+=0.012*(target-o.steppe);
  const mid=1-Math.abs(2*o.steppe-1);o.pD=mid*mid*(o.dual?0.3:1)*Math.min(1,o.cells/20);
  if(was>=0.5&&o.steppe<0.5&&o.cells>=15&&o.steppeLogged!==1){o.steppeLogged=1;chron('state',`In the ${o.full}, the old horse lords lose ground to landlords, merchants and officials; the court turns from the herds to the fields.`,c,[R_(o)],'Taxing farmers paid better than grazing their land.')}
  if(was<0.5&&o.steppe>=0.5&&o.cells>=15&&o.steppeLogged!==2){o.steppeLogged=2;chron('state',`Steppe lords take the upper hand at the court of the ${o.full}.`,c,[R_(o)])}
  // a court torn between herders and farmers may rule them under separate laws
  if(!o.dual&&o.pD>0.35&&s.admin[c]>0.4&&o.cells>=20&&r()<0.01){o.dual=1;chron('state',`The ${o.full} rules its herders and its farmers under separate laws, each with its own ministers.`,c,[R_(o)],'Two ways of life under one crown pulled the court apart; dual government eased the strain.')}
  if(o.dual)o.treas-=0.005;
}

// ---------- herd animals: wild ranges, domestication as a process, real stocks ----------
// Horses: the DOM2 lineage from the lower Volga–Don about 2200 BCE (Librado et al. 2021), earlier Botai horse use;
// Bactrian camels in Central Asia about 2500 BCE; dromedaries in Arabia about 1100 BCE; llamas and alpacas in the Andes
// about 4000 BCE; reindeer in Siberia in the first millennia BCE/CE. The Americas have no horses until ships bring them.
const HERDS=[
  {k:'horse',n:'Horses',col:[205,120,55]},
  {k:'bactrian',n:'Bactrian camels',col:[175,150,95]},
  {k:'dromedary',n:'Dromedaries',col:[235,195,110]},
  {k:'reindeer',n:'Reindeer',col:[140,175,205]},
  {k:'llama',n:'Llamas and alpacas',col:[205,140,205]},
];
const HI=Object.fromEntries(HERDS.map((h,k)=>[h.k,k]));
const latOf=i=>WD.lat[i]*180/Math.PI,lonOf=i=>(WD.cxA[i]+0.5)/W*360-180;
function wildFor(w,sp,i,earth){const T=w.T[i],P=w.Pr[i],la=latOf(i),lo=lonOf(i),el=w.elev[i];if(T<-14)return 0;let g=0,box=true;
  switch(sp){
    case 0:g=clamp((w.sH[i]-0.25)/0.4,0,1)*clamp((16-T)/6,0,1)*(T>-8?1:0);box=lo>18&&lo<125&&la>43&&la<58;break;
    case 1:g=(w.desert[i]||P<350?1:0)*clamp((18-T)/6,0,1)*clamp((T+6)/6,0,1);box=lo>45&&lo<115&&la>34&&la<52;break;
    case 2:g=(w.desert[i]||P<300?1:0)*clamp((T-16)/5,0,1);box=lo>34&&lo<60&&la>12&&la<32;break;
    case 3:g=clamp((3-T)/6,0,1)*(Math.abs(la)>50?1:0)*(P>150?1:0);box=lo>-12&&la>52;break;
    case 4:g=clamp((el-2300)/800,0,1)*clamp((P-150)/250,0,1)*(T<16?1:0);box=lo>-82&&lo<-60&&la>-40&&la<-3;break}
  return earth&&!box?0:g}
// how many domestic animals a province can carry (0..1); farmers keep few, herders many
function capFor(sp,i){const s=S,w=WD,ps=s.past[i],T=w.T[i]+s.cdT[i],P=w.Pr[i];
  if(sp<=2&&w.tsetse[i])return 0;
  switch(sp){
    case 0:{const t=s.linOf?linTraits('horse',i):null,hd=t?t.hardy:0.5;return clamp(w.sH[i]*1.3,0,1)*(0.25+0.75*ps)*(T>-10?1:0)*(T<0||P<300?0.6+0.8*hd:1)}
    case 1:return (w.desert[i]||P<450?0.9:0.25)*clamp((22-T)/8,0,1)*clamp((T+8)/6,0,1)*(0.3+0.7*ps);
    case 2:return (w.desert[i]||P<400?1:0.2)*clamp((T-14)/6,0,1)*(0.3+0.7*ps);
    case 3:return clamp((4-T)/6,0,1)*(Math.abs(latOf(i))>48?1:0);
    case 4:return clamp((w.elev[i]-1800)/1000,0,1)*clamp((P-150)/250,0,1)}
  return 0}
function herdInit(){const s=S,w=WD;
  if(!w.wild){w.wild=HERDS.map((h,sp)=>{const a=new Float32Array(N);for(const i of w.landIdx)a[i]=wildFor(w,sp,i,w.isEarth);return a});
    if(!w.isEarth){// on invented worlds each animal lives on only some landmasses
      const rr=mulberry32(hashStr('wild:'+w.seed));HERDS.forEach((h,sp)=>{const keep=new Map();for(const i of w.landIdx){if(!w.wild[sp][i])continue;const lm=w.lm[i];if(!keep.has(lm))keep.set(lm,rr()<0.6);if(!keep.get(lm))w.wild[sp][i]=0}})}}
  s.dom=HERDS.map(()=>new Float32Array(N));s.domP=HERDS.map(()=>new Float32Array(N));s.domFirst=HERDS.map(()=>null);s.domLog=[];s.dieoffs=[];
  s.domR=s.dom[3];s.domL=s.dom[4];
  for(const e of s.eths){if(e.ride==null)e.ride=0;if(e.xp==null)e.xp=0.3}
  beastsInit()
}
const DOM_TXT=['tame the horse: first for meat and milk, soon for carts and riding','tame the two-humped camel; the cold deserts open to caravans','tame the one-humped camel; the hot deserts begin to open to caravans and raiders','tame the reindeer, and the taiga and tundra become pasture','tame the llama and alpaca: wool, dung for fields and fires, and pack trains along the mountain paths'];
function domesticate(sp,i){const s=S,w=WD,d=s.dom[sp];d[i]=Math.max(d[i],0.3);ring(i,1,j=>{if(w.land[j]&&capFor(sp,j)>0.05)d[j]=Math.max(d[j],0.15)});
  if(sp===0&&s.linOf){const Ln=newLineage('horse',-1,i);ring(i,1,j=>{if(d[j]>0)s.linOf.horse[j]=Ln.id})}
  const first=!s.domFirst[sp];if(first)s.domFirst[sp]={y:s.year,cell:i};s.domLog.push({y:s.year,sp,cell:i});
  if(sp===0)s.firstTech[4]=s.firstTech[4]||{y:s.year,cell:i};if(sp===1||sp===2)s.firstTech[18]=s.firstTech[18]||{y:s.year,cell:i};
  const e=s.eth[i]>=0?s.eths[s.eth[i]]:null;
  if(e)chron('ideas',`${first?'':'Independently, '}the ${e.name} ${DOM_TXT[sp]}.`,i,[RE(e)])}
// every ten years: domestication, herd growth, spread with herders and trade, hard winters and droughts
function herdPass(){
  const s=S,w=WD,r=s.r,L=w.landIdx,nb=w.nb,y=s.year;
  for(let sp=0;sp<HERDS.length;sp++){const d=s.dom[sp],wild=w.wild[sp],Pg=s.domP[sp];
    const rate=[0.004,0.003,0.0012,0.0015,0.005][sp];
    // where tame herds are already near, people get animals from neighbours instead of taming their own
    for(const i of L){const wv=wild[i];if(wv<0.2||d[i]>0.05||s.pop[i]<500)continue;let near=false;ring(i,6,j=>{if(d[j]>0.05)near=true});if(near){Pg[i]=0;continue}
      const keepers=sp===4?Math.max(s.herd[i],0.6*s.farm[i]):sp===3?Math.max(s.herd[i],0.5):s.herd[i];if(keepers<0.4)continue;
      Pg[i]+=rate*wv*keepers*(0.5+r());if(Pg[i]>=1){Pg[i]=0;domesticate(sp,i)}}
    for(const i of L){let v=d[i];if(v<=0)continue;const c=capFor(sp,i);
      if(c<=0.01){d[i]=v<0.01?0:v*0.5;continue}
      v+=0.3*v*(1-v/c);if(s.pop[i]<1)v*=0.8;d[i]=clamp(v,0,1)}
    const add=[];
    for(const i of L){const v=d[i];if(v<0.12)continue;
      for(let k=0;k<4;k++){const j=nb[i*4+k];if(j<0||s.pop[j]<1||d[j]>=v*0.8)continue;const c=capFor(sp,j);if(c<0.03)continue;
        const keen=0.25+0.75*Math.max(s.past[j],0.6*s.herd[j]);if(r()<0.6*keen)add.push(j,Math.min(c,0.25*v),i)}}
    for(let k=0;k<add.length;k+=3){d[add[k]]=Math.max(d[add[k]],add[k+1]);if(sp===0&&s.linOf)linCarry('horse',add[k+2],add[k])}}
  // a killing winter (dzud) or drought on the steppe
  if(r()<0.3){const i=L[(r()*L.length)|0];const hit=s.dom[0][i]>0.3||s.dom[1][i]>0.3||s.dom[3][i]>0.3;
    if(hit&&w.T[i]<10){const loss=0.35+0.3*r();ring(i,5,j=>{for(const sp of [0,1,3])s.dom[sp][j]*=1-loss});
      const p=s.pol[i]?s.pols[s.pol[i]]:null;s.dieoffs.push({y,cell:i});
      if(p&&p.kind==='horde'&&p.cells>=15){p.shock+=0.25;chron('nature',`A killing winter freezes the steppe: the ${p.full} loses ${Math.round(loss*100)}% of its herds.`,i,[R_(p)])}}}
  // what herds mean for everything else: riding, caravans, pack trains
  const hh=s.dom[0],bb=s.dom[1],dd2=s.dom[2];
  beastPass();
  for(const i of L){s.horse[i]=Math.min(1,Math.max(1.5*hh[i],s.mountX[i]));s.camel[i]=Math.min(1,Math.max(1.5*Math.max(bb[i],dd2[i]),s.packX[i]*(w.desert[i]||w.Pr[i]<400?0.7:0)))}
  ridePass();
}
// herds travel with migrating peoples
function herdSnapshot(c){const s=S;return s.dom?HERDS.map((h,sp)=>s.dom[sp][c]):null}
function herdPlant(snap,c,f){const s=S;if(!snap||!s.dom)return;for(let sp=0;sp<HERDS.length;sp++)if(snap[sp]>0.05){const cap=capFor(sp,c);if(cap>0.02)s.dom[sp][c]=Math.max(s.dom[sp][c],Math.min(cap,snap[sp]*f))}}

// ---------- horse skill and war experience: carried by peoples, inherited by states ----------
const RIDE_TIERS=['no riding','horse herding','chariots','mounted archers','heavy cavalry'];
function rideTier(e,c){const s=S,r=e.ride||0;if(r<0.12)return 0;if(r<0.3)return 1;if(r<0.5)return c>=0&&s.wheel[c]>0.5?2:1;if(r<0.75)return 3;return c>=0&&s.caval[c]>0.5&&s.iron[c]>0.5?4:3}
function inheritRide(e,p,p2){e.ride=p?((p2?(p.ride+p2.ride)/2:p.ride)||0)*0.9:0;e.xp=p?((p2?(p.xp+p2.xp)/2:p.xp)??0.3)*0.9:0.3}
function ridePass(){
  const s=S,eths=s.eths,n=eths.length,hs=new Float64Array(n),ws=new Float64Array(n),war=new Uint8Array(n),stateXp=new Float64Array(n).fill(-1);
  for(const i of WD.landIdx){const e=s.eth[i];if(e<0||s.pop[i]<1)continue;hs[e]+=s.pop[i]*s.horse[i];ws[e]+=s.pop[i]}
  for(const id of s.alive){const o=s.pols[id];if(o.core==null||o.core<0)continue;if(o.enemies.size)war[o.core]=1;stateXp[o.core]=Math.max(stateXp[o.core],o.prep??0.6)}
  for(const e of eths){if(!e.alive||!ws[e.id])continue;const h=hs[e.id]/ws[e.id],was=e.ride||0;
    // riding skill grows over generations toward what a people's herds and way of life allow: herders far beyond farmers who own a few horses
    const tgt=Math.min(1,1.2*h*(0.2+0.8*(e.past??0.5))+(war[e.id]?0.12*h:0));
    e.ride=clamp(was+(tgt>was?0.012:0.006)*(tgt-was),0,1);
    // experience: a people keeps what its state's armies learned, and loses it slowly in long peace without a state
    if(stateXp[e.id]>=0)e.xp+=0.05*(stateXp[e.id]-e.xp);else if(!war[e.id])e.xp-=0.003*e.xp;
    if(was<0.5&&e.ride>=0.5&&e.pop>200000&&!e.archers){e.archers=1;let c=-1;for(const i of WD.landIdx)if(s.eth[i]===e.id){c=i;break}
      chron('war',`The ${e.name} learn to shoot from the saddle: mounted archers, faster than any army on foot.`,c,[RE(e)])}}
  // enemies learn from each other: tactics, captured horses, deserters
  for(const wid of s.activeWars){const W2=s.wars[wid];if(!W2)continue;
    for(const a of W2.a)for(const b of W2.d){const A=s.pols[a],Bp=s.pols[b];if(!A||!Bp||!A.alive||!Bp.alive)continue;
      const ea=eths[A.core],eb=eths[Bp.core];if(!ea||!eb)continue;
      const learn=(x,y,h)=>{if(y.ride>x.ride&&h>0.03)x.ride+=0.02*(y.ride-x.ride)};learn(ea,eb,hs[ea.id]/(ws[ea.id]||1));learn(eb,ea,hs[eb.id]/(ws[eb.id]||1));
      const pa=A.prep??0.6,pb=Bp.prep??0.6;if(pb>pa)A.prep=pa+0.02*(pb-pa);if(pa>pb)Bp.prep=pb+0.02*(pa-pb)}}
}
function rideOf(o){const e=o&&o.core>=0?S.eths[o.core]:null;return e&&e.ride?e.ride:0}

// ---------- coalitions: prestige, snowballs, collapse and dominoes ----------
// Loot and victories draw clans to a successful leader; defeat, a hard winter or a leader's death pull them apart.
// A coalition beaten and pushed off its pastures flees along the steppe with its herds and tactics and falls on the next.
function coalitionPass(){
  const s=S,r=s.r,pols=s.pols;
  for(const id of s.alive.slice()){const o=pols[id];if(!o.alive||o.kind!=='horde'){o.c10=o.cells;continue}
    const pr=o.prest||0;
    // weaker neighbouring clans join a winning confederation
    // a khan holds clans through personal ties; the circle he can keep loyal widens with riders who can cross it fast
    const span=Math.max(0,1-o.cells/(60+340*rideOf(o)));
    if(pr>0.25&&o.cells>=8&&span>0)for(const [q] of o.nb){const t=pols[q];if(!t||!t.alive||t.kind!=='horde'||t.cells>=0.6*o.cells||(t.prest||0)>=pr||o.enemies.has(q))continue;
      if(r()<0.2*pr*span){for(const i of polCells(q))s.pol[i]=id;o.cells+=t.cells;t.cells=0;o.prest=pr+0.015;
        if(o.cells>=30)chron('war',`The ${t.full} submit to the ${o.full}, whose victories draw the clans of the steppe.`,o.capital,[R_(o),R_(t)])}}
    // a coalition driven off its pastures takes its herds and tactics elsewhere
    const lost=(o.c10||o.cells)-o.cells;
    if(o.c10&&lost>0.35*o.c10&&o.cells>=5&&o.pop>30000&&o.lastBy&&pols[o.lastBy]&&s.activeMigs.length<12&&r()<0.5){
      const by=pols[o.lastBy],cells=polCells(id);let tot=0;for(const c of cells){const take=s.pop[c]*0.6;s.pop[c]-=take;tot+=take}
      const dx=-dxWrap(o.capital,by.capital),dy=-(WD.cyA[by.capital]-WD.cyA[o.capital]);o.shock+=0.3;
      startMigration({eth:o.core,pop:tot,cell:o.capital,dx,dy,kind:'horde',pol:o,by,cause:'pushed'});
      if(o.c10>=20)chron('migration',`Beaten by the ${by.full}, the ${o.full} abandon their pastures and ride away with their herds.`,o.capital,[R_(o),R_(by)])}
    o.c10=o.cells}
}

// Herders organise against rivals, not only against states: a clan bordering another herding people,
// or the farmers at the edge of the sown, has a frontier (Barfield 1989; Turchin 2009).
function steppeFront(i,ei){const w=WD,s=S;
  for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.pop[j]<1)continue;
    const ej=s.eth[j];if(ej>=0&&ei>=0&&ej!==ei&&ethDist(ei,ej)>0.22)return 1;
    if(s.past[j]<0.3&&s.past[i]>0.55)return 1}
  return 0}

// ---------- other animals: commensals, prey and partners, real and possible ----------
// Animals came into human lives by three roads (Zeder 2012): drawn to camps and granaries (dogs, cats), managed as hunted
// herds (sheep, cattle), or caught and bred on purpose (horses, donkeys). Some were only ever tamed, each one caught from the
// wild: elephants, cheetahs, hawks. Whether a species can be domesticated depends on its temper, sociality and breeding
// (Diamond 1997, ch. 9; Clutton-Brock 1999), and on whether people of the right kind live beside it. Many species that never
// were could have been: eland and moose have been farmed in the 20th century, Belyaev's foxes tamed in decades, and the
// Egyptians kept hyenas. Here every wild species has a chance, small or large, and any success is history taking another road.
// path: commensal | prey | directed | tamed. tame: how readily it takes to people. bred: breeds in captivity.
// Roles: hunt (foragers' yield), guard, mouse (granary losses), meat (pasture food), ride and pack (mobility, raids, caravans),
// war (armies), courier (fast messages), tsetse (thrives where cattle and horses die). real: domesticated or tamed in our world.
const BEASTS=[
  {k:'dog',n:'dogs',one:'dog',path:'commensal',tame:1,bred:1,real:1,col:[150,120,90],roles:{hunt:1,guard:1,pack:0.25,war:0.2}},
  {k:'cat',n:'cats',one:'cat',path:'commensal',tame:0.8,bred:1,real:1,col:[200,170,120],roles:{mouse:1},box:[[10,42,-15,70]],clim:(T,P)=>T>10&&P<1300},
  {k:'donkey',n:'donkeys',one:'donkey',path:'directed',tame:0.7,bred:1,real:1,col:[150,140,130],roles:{pack:0.7,ride:0.25,desert:1},box:[[8,31,22,44]],clim:(T,P)=>T>14&&P<700},
  {k:'elephant',n:'elephants',one:'elephant',path:'tamed',tame:0.45,bred:0,real:1,col:[120,120,130],roles:{war:1,haul:0.6},box:[[5,30,68,110],[28,37,-10,12]],clim:(T,P)=>T>14&&P>400},
  {k:'guineafowl',n:'guineafowl',one:'guineafowl',path:'commensal',tame:0.9,bred:1,real:1,col:[90,90,110],roles:{meat:0.12},box:[[-25,16,-18,45]],clim:(T,P)=>T>18&&P>300},
  {k:'eland',n:'eland',one:'eland',path:'prey',tame:0.12,bred:1,col:[190,150,90],roles:{meat:0.8,tsetse:1},box:[[-32,12,10,42]],clim:(T,P)=>T>14&&P>300&&P<1500},
  {k:'zebra',n:'zebras',one:'zebra',path:'directed',tame:0.06,bred:1,col:[60,60,60],roles:{ride:0.8,pack:0.4,tsetse:1},box:[[-35,12,10,42]],clim:(T,P)=>T>12&&P>250&&P<1200},
  {k:'gwolf',n:'golden wolves',one:'golden wolf',path:'commensal',tame:0.25,bred:1,col:[180,140,80],roles:{hunt:0.8,guard:1,war:0.3},box:[[5,35,-17,45]],clim:(T,P)=>T>14},
  {k:'serval',n:'servals',one:'serval',path:'commensal',tame:0.2,bred:1,col:[210,160,60],roles:{mouse:0.9},box:[[-30,18,-18,45]],clim:(T,P)=>T>18&&P>400},
  {k:'cheetah',n:'cheetahs',one:'cheetah',path:'tamed',tame:0.35,bred:0,breed:0.01,real:1,col:[220,180,90],roles:{hunt:0.8,war:0.15,prestige:1},box:[[-30,30,-18,50],[25,40,40,80]],clim:(T,P)=>T>12&&P<900},
  {k:'hippo',n:'hippopotamuses',one:'hippopotamus',path:'prey',tame:0.015,bred:1,col:[110,90,110],roles:{meat:0.6,war:0.5,river:1},box:[[-30,32,-18,45]],clim:(T,P,rv)=>T>16&&rv>0.3},
  {k:'ostrich',n:'ostriches',one:'ostrich',path:'prey',tame:0.15,bred:1,col:[110,100,90],roles:{meat:0.3,courier:1},box:[[-35,35,-18,60]],clim:(T,P)=>T>12&&P<700},
  {k:'bison',n:'bison',one:'bison',path:'prey',tame:0.06,bred:1,col:[100,70,50],roles:{meat:1,haul:0.4},box:[[30,60,-115,-90]],clim:(T,P,rv,sH)=>sH>0.3},
  {k:'moose',n:'moose',one:'moose',path:'directed',tame:0.06,bred:1,col:[90,80,60],roles:{ride:0.4,pack:0.6,taiga:1},box:[[48,70,-170,-50],[48,70,10,180]],clim:(T,P)=>T<6&&T>-10&&P>300},
  {k:'peccary',n:'peccaries',one:'peccary',path:'prey',tame:0.15,bred:1,col:[120,100,90],roles:{meat:0.5},box:[[-30,30,-110,-35]],clim:(T,P)=>T>18&&P>600},
  {k:'capybara',n:'capybaras',one:'capybara',path:'prey',tame:0.12,bred:1,col:[150,110,80],roles:{meat:0.5},box:[[-35,12,-82,-35]],clim:(T,P,rv)=>T>16&&rv>0.15},
  {k:'tapir',n:'tapirs',one:'tapir',path:'directed',tame:0.08,bred:1,col:[70,70,80],roles:{pack:0.5,forest:1},box:[[-25,20,-95,-35]],clim:(T,P)=>T>20&&P>1200},
  {k:'emu',n:'emus',one:'emu',path:'prey',tame:0.1,bred:1,col:[130,110,90],roles:{meat:0.4},box:[[-40,-10,112,155]],clim:(T,P)=>P<1000},
  {k:'deer',n:'red deer',one:'red deer',path:'prey',tame:0.08,bred:1,col:[160,90,60],roles:{meat:0.6},box:[[35,62,-10,60]],clim:(T,P)=>T>2&&T<16&&P>400}];
const BI=Object.fromEntries(BEASTS.map((b,k)=>[b.k,k]));
function beastWild(w,b,i,earth){if(b.k==='dog')return 0;const T=w.T[i],P=w.Pr[i],la=latOf(i),lo=lonOf(i);
  if(earth&&!b.box.some(([a,c,d,e])=>la>=a&&la<=c&&lo>=d&&lo<=e))return 0;return b.clim(T,P,w.rv[i],w.sH[i])?1:0}
function beastsInit(){const s=S,w=WD,earth=w.isEarth;
  if(!w.bwild){w.bwild=BEASTS.map(b=>{const a=new Uint8Array(N);for(let i=0;i<N;i++)if(w.land0?w.land0[i]:w.land[i])a[i]=beastWild(w,b,i,earth);return a});
    if(!earth){const rr=mulberry32(hashStr('beasts:'+w.seed));BEASTS.forEach((b,k)=>{const keep=new Map();for(let i=0;i<N;i++){if(!w.bwild[k][i])continue;const lm=w.lm[i];if(!keep.has(lm))keep.set(lm,rr()<0.5);if(!keep.get(lm))w.bwild[k][i]=0}})}}
  s.bst=BEASTS.map(()=>new Float32Array(N));s.bP=BEASTS.map(()=>new Float32Array(N));s.bFirst=BEASTS.map(()=>null);s.bTold={};s.alt=[];
  s.lins=[];s.linOf={};for(const b of BEASTS)if(b.bred)s.linOf[b.k]=new Int32Array(N).fill(-1);s.linOf.horse=new Int32Array(N).fill(-1);
  s.mountX=new Float32Array(N);s.packX=new Float32Array(N);s.meatX=new Float32Array(N);s.huntX=new Float32Array(N);s.mouseX=new Float32Array(N);s.warX=new Float32Array(N);s.courX=new Float32Array(N);
  // dogs came with the first peoples everywhere but Australia and Africa south of the Sahara (they reached Africa with herders,
  // about 3500 BCE, and Australia with the dingo, about 1500 BCE)
  if(earth){const d=s.bst[BI.dog];for(const i of w.landIdx){const la=latOf(i),lo=lonOf(i);if(s.eth[i]<0&&s.pop[i]<1){}
      const africa=lo>-20&&lo<52&&la<30&&la>-36,aus=lo>110&&la<-9;if(!africa&&!aus)d[i]=0.5}
    const L0=newLineage('dog',-1,null);for(const i of w.landIdx)if(d[i]>0)s.linOf.dog[i]=L0.id}
}
// lineages: each domestic population belongs to one, and lineages drift with how their keepers live
function newLineage(k,parent,cell){const s=S,p=parent>=0?s.lins[parent]:null;
  const L={id:s.lins.length,k,parent,born:s.year,cell,fam:cell!=null&&cell>=0&&s.eth[cell]>=0?s.eths[s.eth[cell]].fam:-1,eth:cell!=null&&cell>=0?s.eth[cell]:-1,
    t:p?Object.assign({},p.t):{size:0.5,hardy:0.5,temper:0.35,speed:0.5},name:null,told:false,cells:0};
  s.lins.push(L);return L}
function linTraits(k,i){const s=S,a=s.linOf[k];if(!a||a[i]<0)return null;return s.lins[a[i]].t}
function beastCap(k,i){const s=S,w=WD,b=BEASTS[k],T=w.T[i]+s.cdT[i],P=w.Pr[i];
  if(b.k==='dog')return 0.8;
  if(w.tsetse[i]&&!b.roles.tsetse&&['donkey','cat'].includes(b.k))return 0.1;
  if(b.path==='tamed'){let near=0;ring(i,3,j=>{if(w.bwild[k][j])near=1});return near?0.6:0}
  // bred animals live wherever their climate allows, not only where their wild kin did
  const ok=b.clim(T,P,w.rv[i],w.sH[i])?1:0.25,tr=linTraits(b.k,i),hard=tr?tr.hardy:0.5;
  return clamp(ok*(0.5+0.5*hard)+(ok<1?0.2*hard:0),0,1)}
// every ten years
function beastPass(){const s=S,w=WD,r=s.r,L=w.landIdx,nb=w.nb,y=s.year;
  for(let k=0;k<BEASTS.length;k++){const b=BEASTS[k],d=s.bst[k],Pg=s.bP[k],wild=w.bwild[k];
    // taming is a chance event: the more people of the right kind live beside the wild animal, the likelier it is each decade
    if(b.k!=='dog'&&!(s.bFirst[k]&&s.bTold[k]>=3)){let sum=0;const cand=[];
      for(const i of L){if(!wild[i]||d[i]>0.05||s.pop[i]<300)continue;
        const st=s.pol[i]?s.pols[s.pol[i]]:null,sed=s.sed?s.sed[i]:0;
        const ctx=b.path==='commensal'?(s.farm[i]>0.5?1:0):b.path==='prey'?Math.max(0.8*s.herd[i],0.2*sed):
          b.path==='directed'?(s.herd[i]>0.4?s.herd[i]*(0.5+0.5*Math.min(1,s.horse[i]+s.camel[i]+s.bst[BI.donkey][i]+(s.domL?s.domL[i]:0))):0):
          (st&&st.kind==='state'&&st.cells>=10&&st.tier!=='Chiefdom'?1:0);
        if(ctx<=0)continue;
        // no one tames a second animal for a job one they already keep does well: no golden wolves where dogs guard the camp
        const role=Object.keys(b.roles)[0];if(BEASTS.some((o,q)=>q!==k&&Object.keys(o.roles)[0]===role&&s.bst[q][i]>0.2)||(role==='ride'&&s.horse[i]>0.3)||(role==='pack'&&s.camel[i]>0.3))continue;
        sum+=ctx;cand.push(i,ctx)}
      if(sum>0&&r()<0.002*b.tame*(b.real||s.bFirst[k]?1:0.3)*Math.sqrt(sum)){let u=r()*sum,c=cand[0];for(let q=0;q<cand.length;q+=2){u-=cand[q+1];if(u<=0){c=cand[q];break}}
        let near=false;ring(c,5,j=>{if(d[j]>0.05)near=true});if(!near)tameBeast(k,c)}}
    // herds grow toward what the land carries, die out where no one keeps them, and spread with keepers
    for(const i of L){let v=d[i];if(v<=0)continue;const c=beastCap(k,i);if(c<=0.01||s.pop[i]<1){d[i]=v<0.01?0:v*0.6;continue}v+=0.3*v*(1-v/c);d[i]=clamp(v,0,1)}
    if(b.path==='tamed')continue;const add=[];
    for(const i of L){const v=d[i];if(v<0.12)continue;
      for(let q=0;q<4;q++){const j=nb[i*4+q];if(j<0||s.pop[j]<1||d[j]>=v*0.8)continue;const c=beastCap(k,j);if(c<0.05)continue;if(r()<0.35)add.push(i,j,Math.min(c,0.3*v))}}
    for(let q=0;q<add.length;q+=3){const i=add[q],j=add[q+1];d[j]=Math.max(d[j],add[q+2]);linCarry(b.k,i,j)}
    // a tamed-only animal is now and then bred at last by its keepers
    if(b.path==='tamed'&&b.breed&&s.bFirst[k]&&!s['bred_'+b.k]&&r()<b.breed){let c=-1;for(const i of L)if(d[i]>0.3){c=i;break}
      if(c>=0){s['bred_'+b.k]=1;b.path='directed';s.linOf[b.k]=new Int32Array(N).fill(-1);const Ln=newLineage(b.k,-1,c);for(const i of L)if(d[i]>0.05)s.linOf[b.k][i]=Ln.id;
        const e=s.eths[s.eth[c]];altNote(b.k,c,`For the first time anywhere, the keepers of the ${e?e.name:'court'} breed ${b.n} in captivity; no longer must every one be caught wild.`)}}}
  linPass();beastEffects()}
// the herds pass also carries horse lineages
function linCarry(k,i,j){const s=S,a=s.linOf[k];if(!a||a[i]<0)return;const L=s.lins[a[i]];
  const fresh=a[j]<0;if(fresh||r_lt(0.3)){a[j]=a[i];
    // carried far from home to another people, a lineage starts its own line
    const ej=s.eth[j],fj=ej>=0?s.eths[ej].fam:-1;if(fresh&&fj>=0&&fj!==L.fam&&L.cell>=0&&angDist(L.cell,j)>0.25&&r_lt(0.03)){const Lc=newLineage(k,L.id,j);a[j]=Lc.id}}}
function r_lt(p){return S.r()<p}
function tameBeast(k,i){const s=S,w=WD,b=BEASTS[k],d=s.bst[k];d[i]=Math.max(d[i],0.3);if(b.path!=='tamed')ring(i,1,j=>{if(w.land[j]&&beastCap(k,j)>0.05)d[j]=Math.max(d[j],0.15)});
  if(b.bred){const Ln=newLineage(b.k,-1,i);ring(i,1,j=>{if(d[j]>0)s.linOf[b.k][j]=Ln.id})}
  const first=!s.bFirst[k];if(first)s.bFirst[k]={y:s.year,cell:i};const e=s.eth[i]>=0?s.eths[s.eth[i]]:null,nm=e?`the ${e.name}`:'a people';
  const verb=b.path==='tamed'?`${nm} catch and train wild ${b.n}`:b.path==='commensal'?`${b.n} come to live among ${nm}, and stay`:`${nm} tame the ${b.one}`;
  const use=Object.keys(b.roles).map(r=>({hunt:'hunting',guard:'guarding camps',mouse:'keeping mice from the stores',meat:'meat and hides',ride:'riding',pack:'carrying loads',war:'war',courier:'carrying messages at speed',haul:'hauling',prestige:'the prestige of their lords',tsetse:'',desert:'',river:'',taiga:'',forest:''}[r])).filter(Boolean);
  const txt=`${cap(verb)}${use.length?`: ${use.slice(0,3).join(', ')}`:''}.`;
  if(first&&!b.real)altNote(b.k,i,`For the first time anywhere, ${verb}. ${cap(use.slice(0,3).join(', '))}${use.length?'.':''}`);
  else{const n=s.bTold[k]=(s.bTold[k]||0)+1;if(n<=3)chron('ideas',first?txt:`Independently, ${txt.charAt(0).toLowerCase()+txt.slice(1)}`,i,e?[RE(e)]:[])}}
// a road our world did not take: flagged in the chronicle and the checks
function altNote(k,c,txt){const s=S;s.alt.push({y:s.year,k,cell:c,txt});const e=s.eth[c]>=0?s.eths[s.eth[c]]:null;chron('ideas',txt,c,e?[RE(e)]:[],'This did not happen in our world.')}
// every ten years: lineages drift with how their keepers live; a lineage changed enough becomes a named breed
function linPass(){const s=S,w=WD;if(s.year-(s.linY??-1e9)<50)return;s.linY=s.year;const n=s.lins.length,acc=new Float64Array(n*6);
  const add=(id,i)=>{const o=id*6;acc[o]++;acc[o+1]+=s.past[i];acc[o+2]+=s.farm[i];const T=w.T[i];acc[o+3]+=(T<2||T>25||w.Pr[i]<300)?1:0;const p=s.pol[i]?s.pols[s.pol[i]]:null;acc[o+4]+=p&&p.enemies.size?1:0;acc[o+5]+=p&&p.kind==='state'?1:0};
  for(const k in s.linOf){const a=s.linOf[k];for(const i of w.landIdx)if(a[i]>=0&&s.pop[i]>=1)add(a[i],i)}
  for(const L of s.lins){const o=L.id*6,c=acc[o];L.cells=c;if(!c)continue;const past=acc[o+1]/c,farm=acc[o+2]/c,harsh=acc[o+3]/c,war=acc[o+4]/c,state=acc[o+5]/c,t=L.t,g=0.05;
    // herders' half-wild herds grow small, hardy and hard to handle; stabled, fodder-fed stock grows big, docile and soft
    t.size+=g*(clamp(0.45+0.35*farm*state-0.25*past+0.15*war,0,1)-t.size);t.hardy+=g*(clamp(0.3+0.4*past+0.35*harsh-0.2*farm,0,1)-t.hardy);
    t.temper+=g*(clamp(0.35+0.45*farm-0.3*past,0,1)-t.temper);t.speed+=g*(clamp(0.4+0.25*past+0.25*war,0,1)-t.speed);
    if(!L.told&&L.parent>=0&&c>=15&&s.year-L.born>300&&(s.breedN?.[L.k]||0)<3){const P=s.lins[L.parent].t;
      const dv=Math.abs(t.size-P.size)+Math.abs(t.hardy-P.hardy)+Math.abs(t.temper-P.temper)+Math.abs(t.speed-P.speed);
      if(dv>0.3){L.told=true;let c0=-1;const a=s.linOf[L.k];for(const i of w.landIdx)if(a[i]===L.id&&s.pop[i]>=1){c0=i;break}if(c0<0)continue;
        const e=s.eths[s.eth[c0]];L.name=`${e?cap(placeWord(e.lang,s.r)):'Plains'} ${L.k==='horse'?'horse':BEASTS[BI[L.k]].one}`;L.eth=s.eth[c0];
        const d=[t.size>0.62?'big':t.size<0.38?'small':'',t.hardy>0.62?'hardy':t.hardy<0.38?'delicate':'',t.temper>0.6?'gentle':t.temper<0.3?'half-wild':'',t.speed>0.62?'swift':''].filter(Boolean);
        const B0=L.k==='horse'?null:BEASTS[BI[L.k]];if(B0&&(B0.roles.mouse||(B0.roles.meat||0)<0.3&&!B0.roles.ride&&!B0.roles.war&&!B0.roles.hunt))continue;
        s.breedN=s.breedN||{};s.breedN[L.k]=(s.breedN[L.k]||0)+1;
        chron('culture',`The ${L.k==='horse'?'horses':BEASTS[BI[L.k]].n} of the ${e?e.name:'herders'} have become a breed of their own, the ${L.name}${d.length?`: ${d.join(', ')}`:''}.`,c0,e?[RE(e)]:[])}}}}
// what the animals do for their people, as province values the rest of the model reads
function beastEffects(){const s=S,w=WD,L=w.landIdx;
  for(const i of L){let mount=0,pack=0,meat=0,hunt=0,mouse=0,war=0,cour=0;
    for(let k=0;k<BEASTS.length;k++){const v=s.bst[k][i];if(v<0.05)continue;const R=BEASTS[k].roles,t=linTraits(BEASTS[k].k,i)||{size:0.5,speed:0.5,temper:0.5};
      const q=Math.min(1,1.5*v);
      if(R.ride)mount=Math.max(mount,q*R.ride*(0.7+0.6*t.speed)*(0.7+0.6*t.temper));
      if(R.pack)pack=Math.max(pack,q*R.pack*(R.desert?1:0.6));
      if(R.meat)meat+=q*R.meat*(0.7+0.6*t.size);if(R.hunt&&k>0)hunt=Math.max(hunt,q*R.hunt);if(R.mouse)mouse=Math.max(mouse,q*R.mouse);
      if(R.war)war=Math.max(war,q*R.war*(R.river?(w.rv[i]>0.3?1:0.2):1)*(0.7+0.6*t.size));if(R.courier)cour=Math.max(cour,q*R.courier)}
    s.mountX[i]=mount;s.packX[i]=pack;s.meatX[i]=Math.min(1.2,meat);s.huntX[i]=hunt;s.mouseX[i]=mouse;s.warX[i]=war;s.courX[i]=cour}}
