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
    case 0:return clamp(w.sH[i]*1.3,0,1)*(0.25+0.75*ps)*(T>-10?1:0);
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
}
const DOM_TXT=['tame the horse: first for meat and milk, soon for carts and riding','tame the two-humped camel; the cold deserts open to caravans','tame the one-humped camel; the hot deserts begin to open to caravans and raiders','tame the reindeer, and the taiga and tundra become pasture','tame the llama and alpaca: wool, dung for fields and fires, and pack trains along the mountain paths'];
function domesticate(sp,i){const s=S,w=WD,d=s.dom[sp];d[i]=Math.max(d[i],0.3);ring(i,1,j=>{if(w.land[j]&&capFor(sp,j)>0.05)d[j]=Math.max(d[j],0.15)});
  const first=!s.domFirst[sp];if(first)s.domFirst[sp]={y:s.year,cell:i};s.domLog.push({y:s.year,sp,cell:i});
  if(sp===0)s.firstTech[4]=s.firstTech[4]||{y:s.year,cell:i};if(sp===1||sp===2)s.firstTech[18]=s.firstTech[18]||{y:s.year,cell:i};
  const e=s.eth[i]>=0?s.eths[s.eth[i]]:null;
  if(e)chron('ideas',`${first?'':'Independently, '}the ${e.name} ${DOM_TXT[sp]}.`,i,[RE(e)])}
// every ten years: domestication, herd growth, spread with herders and trade, hard winters and droughts
function herdPass(){
  const s=S,w=WD,r=s.r,L=w.landIdx,nb=w.nb,y=s.year;
  for(let sp=0;sp<HERDS.length;sp++){const d=s.dom[sp],wild=w.wild[sp],Pg=s.domP[sp];
    const rate=[0.003,0.003,0.0012,0.0015,0.005][sp];
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
        const keen=0.25+0.75*Math.max(s.past[j],0.6*s.herd[j]);if(r()<0.6*keen)add.push(j,Math.min(c,0.25*v))}}
    for(let k=0;k<add.length;k+=2)d[add[k]]=Math.max(d[add[k]],add[k+1])}
  // a killing winter (dzud) or drought on the steppe
  if(r()<0.3){const i=L[(r()*L.length)|0];const hit=s.dom[0][i]>0.3||s.dom[1][i]>0.3||s.dom[3][i]>0.3;
    if(hit&&w.T[i]<10){const loss=0.35+0.3*r();ring(i,5,j=>{for(const sp of [0,1,3])s.dom[sp][j]*=1-loss});
      const p=s.pol[i]?s.pols[s.pol[i]]:null;s.dieoffs.push({y,cell:i});
      if(p&&p.kind==='horde'&&p.cells>=15){p.shock+=0.25;chron('nature',`A killing winter freezes the steppe: the ${p.full} loses ${Math.round(loss*100)}% of its herds.`,i,[R_(p)])}}}
  // what herds mean for everything else: riding, caravans, pack trains
  const hh=s.dom[0],bb=s.dom[1],dd2=s.dom[2];
  for(const i of L){s.horse[i]=Math.min(1,1.5*hh[i]);s.camel[i]=Math.min(1,1.5*Math.max(bb[i],dd2[i]))}
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
