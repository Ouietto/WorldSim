"use strict";
const NOLEAGUE=typeof process!=="undefined"&&process.env&&process.env.NOLEAGUE?1:0;
/* ================= SOLDIER COLONIES AND HEREDITARY NOBILITY =================
   States hold new frontiers by settling soldiers on the land: Roman coloniae, Chinese tuntian military farms, Assyrian and
   Inca resettlements, Byzantine themes, Ottoman timars. Settlers make the frontier hold and push it further, but land given
   for service tends to become land held by birth: a hereditary nobility that protects its own provinces and keeps much of
   their revenue. Rulers try to take it back; sometimes they succeed. */
function societyInit(){const s=S;s.colony=new Float32Array(N);s.colonies=[];s.reforms=[]}
// every ten years
function colonyPass(){
  const s=S,w=WD,r=s.r;
  for(let i=0;i<N;i++)if(s.colony[i]>0)s.colony[i]*=0.97;
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='state'){o.nob=0;continue}
    if(o.nob==null)o.nob=0;
    const c=o.capital,real=Math.max(1,o.cells-(o.wasteN||0));
    // plant a colony on a recently taken, thinly settled frontier province
    if(o.cells>=8&&o.pop>4e5&&o.treas>-0.5&&o.front&&o.front.length&&r()<0.35*Math.min(1,o.pop/2e6)*(0.6+0.8*Math.min(1,o.warC||0)+0.4*(o.enemies.size?1:0))){
      const j=o.front[(r()*o.front.length)|0];
      if(s.pol[j]===id&&s.colony[j]<0.3&&s.K[j]>s.pop[j]*1.4&&w.land[j]){
        const want=Math.min(0.012*o.pop,(s.K[j]-s.pop[j])*0.6);
        // settlers come from the old lands around the capital
        let src=0;const from=[c];ring(c,2,q=>{if(s.pol[q]===id&&s.pop[q]>1)from.push(q)});for(const q of from)src+=s.pop[q]*0.1;
        const d=Math.min(want,src);if(d>2000){const f=d/src;for(const q of from)s.pop[q]-=s.pop[q]*0.1*f;
          const old=s.pop[j],oe=s.eth[j];s.pop[j]+=d;
          if(oe<0||old<1){s.eth[j]=o.core;s.eth2[j]=-1}else if(oe!==o.core){if(d>old){s.eth[j]=o.core;s.eth2[j]=oe;s.mix[j]=old/(old+d)}else{s.eth2[j]=o.core;s.mix[j]=Math.max(s.mix[j]||0,d/(old+d))}s.mixT[j]=0}
          if(o.rel>=0&&d>old)s.rel[j]=o.rel;
          for(let k=0;k<s.tk.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][c]*0.85);
          s.colony[j]=1;s.integ[j]=Math.max(s.integ[j],0.75);s.s[j]=Math.max(s.s[j],o.S);ring(j,1,q=>{if(s.pol[q]===id)s.integ[q]=Math.min(1,s.integ[q]+0.15)});
          o.colN=(o.colN||0)+1;o.nob=Math.min(1,o.nob+0.025);s.colonies.push({y:s.year,pol:id,cell:j,n:d});
          if(o.colN===1&&real>=20)chron('state',`The ${o.full} settles veterans on conquered land at its frontier, granting them farms in return for service.`,j,[R_(o)],'Soldiers who farm the land they hold make a frontier that stays held.')}}}
    // land held for service becomes land held by birth; large, loosely governed realms breed lords of their own
    const col=Math.min(1,(o.colN||0)/Math.max(4,real/15)),adm=s.admin[c]*0.6+s.paper[c]*0.2+s.law[c]*0.2;
    o.nob=clamp(o.nob+10*(0.0012*col*(1-0.7*adm)+0.0005*(1-adm)*Math.min(1,real/80))*(1-o.nob)-10*0.001*adm*o.nob,0,0.95);
    // a strong ruler with a well-run court may try to take the lands back
    if(o.nob>0.5&&real>=15&&r()<0.06*(o.nob-0.4)*(o.burden>0.9?2:1)){
      const p=clamp(0.2+0.35*o.S+0.3*adm+0.2*(o.mandate||0)-0.3*o.nob,0.05,0.85),ok=r()<p;
      s.reforms.push({y:s.year,pol:id,ok});
      if(ok){o.nob*=0.55;o.treas=Math.min(1,o.treas+0.3);chron('state',`${cap(rulerName(o))} of the ${o.full} reclaims the estates of the great families and puts the provinces back under royal officials.`,c,[R_(o)],'Lands granted for service had become private domains; the crown took them back while it was strong enough.')}
      else{o.shock+=0.35;o.mandate=Math.max(0,(o.mandate||1)-0.25);chron('fall',`The great lords of the ${o.full} rise against ${rulerName(o)}, who tried to take back their lands.`,c,[R_(o)],'The nobles held the provinces, the soldiers and the revenue; the crown overreached.')}}
  }
}
/* ================= CITY-STATES, LEAGUES AND DAUGHTER COLONIES =================
   A walled city with its farmland can stand for centuries among larger neighbours (Sumer, the Greek poleis, Phoenicia,
   the Maya, the Swahili coast, Hausaland, Italy). Neighbouring cities of one people band together in leagues, and
   crowded coastal cities send settlers across the sea to found daughter cities in lands like their own. */
function isCityState(o){return o.kind==='state'&&o.tier==='City-state'}
function leaguePass(){
  const s=S,r=s.r;if(!s.leagues)s.leagues=[];
  for(const L of s.leagues){if(L.end)continue;L.members=L.members.filter(q=>{const p=s.pols[q];return p&&p.alive&&p.league===L.id&&isCityState(p)});
    for(const q of s.alive){const p=s.pols[q];if(p.league===L.id&&!L.members.includes(q))p.league=null}
    L.pop=0;L.cells=0;for(const q of L.members){L.pop+=s.pols[q].pop;L.cells+=s.pols[q].cells}
    if(L.members.length<2){L.end=s.year;for(const q of L.members)s.pols[q].league=null;chron('diplomacy',`The ${L.name} breaks apart.`,L.cell,[['league',L.id,L.name]]);continue}
    // members stand together
    for(const a of L.members)for(const b of L.members)if(a!==b){const A=s.pols[a];if(!A.allies.includes(b)&&!A.enemies.has(b))A.allies.push(b)}}
  for(const id of s.alive){const o=s.pols[id];if(!isCityState(o))continue;const fam=s.eths[o.core]?s.eths[o.core].fam:-1;
    const kin=[];for(const [q] of o.nb){const p=s.pols[q];if(p&&p.alive&&isCityState(p)&&!p.enemies.has(id)&&s.eths[p.core]&&s.eths[p.core].fam===fam)kin.push(p)}
    if(o.league!=null){continue}
    const inL=kin.find(p=>p.league!=null&&!s.leagues[p.league].end);
    if(inL&&r()<0.2){const L=s.leagues[inL.league];o.league=L.id;L.members.push(id);if(L.members.length<=6)chron('diplomacy',`The ${o.full} joins the ${L.name}.`,o.capital,[R_(o),['league',L.id,L.name]]);continue}
    const free=kin.filter(p=>p.league==null);
    if(free.length>=2&&r()<0.12){const e=s.eths[o.core],L={id:s.leagues.length,name:`${cap(placeWord(e.lang,r))} League`,members:[id,...free.slice(0,5).map(p=>p.id)],born:s.year,cell:o.capital,fam};
      s.leagues.push(L);for(const q of L.members)s.pols[q].league=L.id;
      chron('diplomacy',`${L.members.length} cities of the ${e.name} swear to stand together as the ${L.name}.`,o.capital,[['league',L.id,L.name],...L.members.map(q=>R_(s.pols[q]))],'Small cities of one people were safer together than alone against the kingdoms around them.');
      spot(`The ${L.name} is founded`,o.capital,[['league',L.id,L.name]])}}
}
function colonizePass(){
  const s=S,w=WD,r=s.r;
  for(const id of s.alive.slice()){const o=s.pols[id];if(o.kind!=='state')continue;const c=o.capital;
    if(!w.coast[c]||s.sail[c]<0.5||o.press<0.8||o.cells>40)continue;
    const cityLike=isCityState(o)||(o.coastN||0)>=0.4*o.cells;if(!cityLike)continue;
    if(r()>0.1*(isCityState(o)?1.5:0.7)*(0.5+s.nav[c]))continue;
    const reach=8+14*s.nav[c]+12*s.ocean[c],cx=w.cxA[c],cy=w.cyA[c],CI=w.coastIdx;let best=-1,bs=0;
    for(let t=0;t<60;t++){const j=CI[(r()*CI.length)|0];if(s.pol[j]||!w.land[j]||w.desert[j])continue;
      let dx=Math.abs(w.cxA[j]-cx);dx=Math.min(dx,W-dx);const d=Math.hypot(dx,w.cyA[j]-cy);if(d<4||d>reach)continue;
      const dT=Math.abs(w.T[j]-w.T[c]);if(dT>6||s.K[j]<3000)continue;
      const sc=(s.K[j]-s.pop[j])/(1+dT)*(1-0.5*d/reach)*(s.eth[j]<0||s.pop[j]<500?1.5:1);if(sc>bs){bs=sc;best=j}}
    if(best<0)continue;
    const j=best,n=Math.min(0.03*o.pop,s.K[j]*0.5,40000);if(n<3000)continue;
    s.pop[c]=Math.max(1,s.pop[c]-n*0.6);
    const old=s.pop[j];s.pop[j]+=n;const oe=s.eth[j];s.eth[j]=o.core;if(oe>=0&&oe!==o.core&&old>=1){s.eth2[j]=oe;s.mix[j]=old/(old+n);s.mixT[j]=0}else s.eth2[j]=-1;
    if(o.rel>=0)s.rel[j]=o.rel;for(let k=0;k<s.tk.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][c]*0.9);
    if(s.city[j]<0){s.city[j]=s.cities.length;s.cities.push({name:cityWord(s.eths[o.core].lang,r),cell:j,born:s.year,eth:o.core,peak:s.pop[j]})}
    const nid=newPolity(j,null,{kind:'state',origin:{type:'colony',from:id,people:o.core}}),d=s.pols[nid];
    d.S=Math.max(d.S,o.S*0.9);d.cult=o.cult;d.metro=id;o.daughters=(o.daughters||0)+1;
    if(!d.allies.includes(id)){d.allies.push(id);o.allies.push(nid)}
    const far=o.daughters===1||o.cells>=10;
    if(far)chron('state',`Settlers from the ${o.full} sail away and found the ${d.full} on a distant shore.`,j,[R_(o),R_(d)],'The home city was crowded; the sea offered land like its own.');
  }
}
