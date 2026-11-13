"use strict";
const NOLEAGUE=typeof process!=="undefined"&&process.env&&process.env.NOLEAGUE?1:0,ABL=typeof process!=="undefined"&&process.env&&process.env.ABL||"";
/* ================= SOLDIER COLONIES AND HEREDITARY NOBILITY =================
   States hold new frontiers by settling soldiers on the land: Roman coloniae, Chinese tuntian military farms, Assyrian and
   Inca resettlements, Byzantine themes, Ottoman timars. Settlers make the frontier hold and push it further, but land given
   for service tends to become land held by birth: a hereditary nobility that protects its own provinces and keeps much of
   their revenue. Rulers try to take it back; sometimes they succeed. */
function societyInit(){const s=S;s.colony=new Float32Array(N);s.colonies=[];s.reforms=[];s.rits=[];s.ritAt=new Int32Array(N).fill(-1);s.ritW=new Float32Array(N);s.ritOf=new Int32Array(N).fill(-1)}
// every ten years
function colonyPass(){
  const s=S,w=WD,r=s.r;
  for(let i=0;i<N;i++)if(s.colony[i]>0)s.colony[i]*=0.97;
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='state'){o.nob=0;continue}
    if(o.nob==null)o.nob=0;
    const c=o.capital,real=Math.max(1,o.cells-(o.wasteN||0));
    // (land for soldiers; Nein 2026-11-11, switch nogrants turns it off) a state that cannot pay its soldiers in money owes them
    // land. The debt (owed) grows with every decade at war, less where wages are paid in coin from a sound treasury; each
    // settlement of veterans on conquered land pays some of it off. A state deep in this debt looks for land to conquer, its
    // soldiers listen to generals who promise it, and at last they demand it (the Gracchi; Marius; Brunt 1971)
    const GRANT=!swOn('nogrants');
    if(GRANT){const pay=clamp((o.mon||0)*(o.treas>-0.3?1:0.4),0,1);o.owed=clamp((o.owed||0)*0.9+(o.enemies.size?0.1*(1-pay):0),0,1.5);
      if(o.owed>1&&!o.owedC&&real>=20){o.owedC=1;o.shock=(o.shock||0)+0.2;chron('fall',`The soldiers of the ${o.full} demand the land they were promised for their service, and there is none left to give.`,c,[R_(o)],'Wars had been paid for in promises of land; the conquests had stopped.')}
      if(o.owed<0.5)o.owedC=0}
    // plant a colony on a recently taken, thinly settled frontier province
    if(o.cells>=8&&o.pop>4e5&&o.treas>-0.5&&o.front&&o.front.length&&r()<(1+(GRANT?o.owed||0:0))*0.35*Math.min(1,o.pop/2e6)*(0.6+0.4*(o.enemies.size?1:0)+0.6*Math.min(1,o.thr||0))){
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
          o.colN=(o.colN||0)+1;o.nob=Math.min(1,o.nob+0.025);if(o.owed)o.owed=Math.max(0,o.owed-0.25);s.colonies.push({y:s.year,pol:id,cell:j,n:d});
          if(o.colN===1&&real>=20)chron('state',`The ${o.full} settles veterans on conquered land at its frontier, granting them farms in return for service.`,j,[R_(o)],'Soldiers who farm the land they hold make a frontier that stays held.')}}}
    // land held for service becomes land held by birth; large, loosely governed realms breed lords of their own
    const col=Math.min(1,(o.colN||0)/Math.max(4,real/15)),adm=admOf()[c]*0.6+s.paper[c]*0.2+s.law[c]*0.2;
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
    // kin: cities of one language family, or of one sacred site whatever their tongue (Nippur for the cities of Sumer and Akkad,
    // Delphi's amphictyony)
    const site=s.ritOf?s.ritOf[o.capital]:-1;
    const kin=[];for(const [q] of o.nb){const p=s.pols[q];if(p&&p.alive&&isCityState(p)&&!p.enemies.has(id)&&((s.eths[p.core]&&s.eths[p.core].fam===fam)||(site>=0&&s.ritOf[p.capital]===site)))kin.push(p)}
    // a shared sanctuary binds cities that do not touch: chiefs' lands between them do not stop the festival
    if(site>=0&&s.rits[site].imp>0.7)for(const q of s.alive){const p=s.pols[q];if(q===id||!isCityState(p)||kin.includes(p)||p.enemies.has(id)||s.ritOf[p.capital]!==site)continue;if(angDist(o.capital,p.capital)<0.06)kin.push(p)}
    if(o.league!=null){continue}
    const inL=kin.find(p=>p.league!=null&&!s.leagues[p.league].end);
    const circ=S.circE[o.capital]||0;
    if(inL&&r()<0.2*(1-0.3*circ)){const L=s.leagues[inL.league];o.league=L.id;L.members.push(id);if(L.members.length<=6)chron('diplomacy',`The ${o.full} joins the ${L.name}.`,o.capital,[R_(o),['league',L.id,L.name]]);continue}
    const free=kin.filter(p=>p.league==null);
    // cities league against a danger: a war on their hands or a much bigger neighbour at the gate (Renfrew & Cherry 1986)
    const threat=o.enemies.size>0||[...o.nb.keys()].some(q=>{const t=s.pols[q];return t&&t.alive&&(t.kind==='horde'||t.cells>=3*Math.max(1,o.cells))});
    if(!threat)continue;
    if(free.length>=2&&r()<0.12*(1-0.3*circ)){const e=s.eths[o.core],L={id:s.leagues.length,name:`${cap(placeWord(e.lang,r))} League`,members:[id,...free.slice(0,5).map(p=>p.id)],born:s.year,cell:o.capital,fam};
      s.leagues.push(L);for(const q of L.members)s.pols[q].league=L.id;
      chron('diplomacy',`${L.members.length} cities of the ${e.name} swear to stand together as the ${L.name}.`,o.capital,[['league',L.id,L.name],...L.members.map(q=>R_(s.pols[q]))],'Small cities of one people were safer together than alone against the kingdoms around them.');
      spot(`The ${L.name} is founded`,o.capital,[['league',L.id,L.name]])}}
}
function colonizePass(){
  const s=S,w=WD,r=s.r;
  for(const id of s.alive.slice()){const o=s.pols[id];if(o.kind!=='state')continue;const c=o.capital;
    // (Nein, 2026-11-11) rich merchants fit out voyages too: where their wealth is large beside the crown's taxes a city sends
    // settlers out without being crowded, more often, and toward shores with the ore, salt or spices it lacks
    const mwR=goodsOn()?clamp((o.mw||0)/((o.tax||0)+1),0,1):0;
    if(!w.coast[c]||s.sail[c]<0.5||(o.press<0.8&&mwR<0.3)||o.cells>40)continue;
    const cityLike=isCityState(o)||(o.coastN||0)>=0.4*o.cells;if(!cityLike)continue;
    if(r()>0.1*(isCityState(o)?1.5:0.7)*(0.5+s.nav[c])*(1+2*mwR))continue;
    const reach=8+14*s.nav[c]+12*s.ocean[c],cx=w.cxA[c],cy=w.cyA[c],CI=w.coastIdx;let best=-1,bs=0;
    for(let t=0;t<60;t++){const j=CI[(r()*CI.length)|0];if(s.pol[j]||!w.land[j]||w.desert[j])continue;
      let dx=Math.abs(w.cxA[j]-cx);dx=Math.min(dx,W-dx);const d=Math.hypot(dx,w.cyA[j]-cy);if(d<4||d>reach)continue;
      const dT=Math.abs(w.T[j]-w.T[c]);if(dT>6||s.K[j]<3000)continue;
      const sc=(s.K[j]-s.pop[j])/(1+dT)*(1-0.5*d/reach)*(s.eth[j]<0||pEq(j)<500?1.5:1)*(mwR>0&&(oreWanted(o,j)||(s.ore&&s.ore[6][j]>0.3&&o.gmet&&o.gmet[6]<0.8))?3:1);if(sc>bs){bs=sc;best=j}}
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
    if(far)chron('state',`Settlers from the ${o.full} sail away and found the ${d.full} on a distant shore.`,j,[R_(o),R_(d)],o.press<0.8?'Its merchants paid for the voyage: the new town would trade what the mother city lacked.':'The home city was crowded; the sea offered land like its own.');
  }
}
/* ================= WAR, SUPPLY AND STORES =================
   Sacked cities send refugees to the nearest safe province of their own people. Rich states facing strong nomads may
   pay for peace (Han and the Xiongnu, Song and the Liao) or hire soldiers instead of raising them; unpaid mercenaries
   mutiny. Literate states keep granaries that soften famine. A siege needs food: attackers far from surplus land or
   rivers and roads struggle against walls. Long peace lets armies decay (preparedness), which is when invaders do best. */
// a city falls: plunder, death and flight
function sackCity(o,j,q){
  const s=S,w=WD,r=s.r,ci=s.city[j];if(ci<0||ABL.includes('sack'))return;const city=s.cities[ci],d=q?s.pols[q]:null;
  const sameFaith=d&&o.rel>=0&&d.rel===o.rel,p=(o.kind==='horde'?0.3:sameFaith?0.05:0.14)*(1+(o.ruler&&o.ruler.exc==='aggr'?1:0));
  if(r()>p)return;
  const loss=s.pop[j]*(0.2+0.25*r()),fled=loss*0.5;s.pop[j]-=loss;
  if(o.kind==='horde')o.loot+=loss*0.3;else o.treas=Math.min(1,(o.treas||0)+0.15);
  s.fort[j]*=0.3;if(o.kind==='horde')s.irrig[j]*=0.7;
  // refugees go to the nearest province still held by their own state and people, or else take to the roads
  let dest=-1;if(d&&d.alive){let bd=1e9;ring(j,4,(c,dx,dy)=>{if(c!==j&&s.pol[c]===q&&s.eth[c]===s.eth[j]&&s.pop[c]>=1){const dd2=dx*dx+dy*dy;if(dd2<bd){bd=dd2;dest=c}}})}
  if(dest>=0)s.pop[dest]+=fled;else pushPressure(s.eth[j],fled,j,o.id,null);
  (city.sacks||(city.sacks=[])).push({y:s.year,by:o.id,lost:loss});
  if(city.peak>=150000||(d&&j===d.capital))chron('war',`The ${o.full} sacks ${city.name}${d?`, a city of the ${d.full}`:''}; ${fmtK(loss)} people are killed or flee${dest>=0?` to ${s.city[dest]>=0?s.cities[s.city[dest]].name:'the provinces nearby'}`:''}.`,j,[R_(o)].concat(d?[R_(d)]:[]));
}
// food for a siege: attackers living off crowded land, far from rivers and roads, run short
function siegeSupply(o,i){const s=S,w=WD;if(ABL.includes('siege'))return 1;return clamp(0.85+0.4*Math.max(0,1-s.pop[i]/Math.max(1,s.K[i]))+0.2*w.rv[i]+0.2*s.roads[i]+0.2*(o.gran||0),0.6,1.15)}
function stateMil(o){if(ABL.includes('prep'))return 1;return o.kind==='horde'?1:(0.85+0.3*(o.prep??0.6))*(1+0.4*(o.merc||0))}
// once a year per state, after the accounts
function militaryPass(o){
  const s=S,r=s.r,c=o.capital,atWar=o.enemies.size>0;
  if(o.kind!=='state'){const e=s.eths[o.core];o.prep=e&&e.xp!=null?Math.max(0.5,e.xp):0.8;o.merc=0;o.prest=(o.prest||0)*0.98;return}
  if(o.prep==null){const e=s.eths[o.core];o.prep=e&&e.xp!=null?clamp(e.xp,0.2,1):0.6}
  if(o.prep==null)o.prep=0.6;
  // readiness rises in war and decays in peace; forts and frontier raids keep it up
  o.prep=atWar?o.prep+0.04*(1-o.prep):o.prep-0.006*(o.prep-0.35-0.3*Math.min(1,(o.fortN||0)/10)-(s.year-(o.raidY||-1e9)<10?0.3:0)-0.4*Math.min(1,o.thr||0));
  o.prep=clamp(o.prep,0.1,1);
  // mercenaries: money instead of men, when cohesion is low and coin plentiful
  const coin=s.coin[c]>0.5;
  if(atWar&&coin&&o.treas>0.2&&o.S<0.5)o.merc=Math.min(0.8,(o.merc||0)+0.05);else o.merc=(o.merc||0)*0.92;
  if(o.merc>0.01){o.treas-=0.02*o.merc;
    if(o.treas<-0.5&&o.merc>0.3){o.shock+=0.3;o.merc=0;if(o.cells>=15)chron('war',`Unpaid, the mercenaries of the ${o.full} turn on their employers.`,c,[R_(o)],'The treasury could no longer pay the soldiers it had hired.')}}
  // granaries: literate states store grain in good years
  {const keep=Math.max(s.recK[c],s.ritW?0.7*s.ritW[c]:0);if(keep>0.3&&o.press<0.95)o.gran=Math.min(1,(o.gran||0)+0.02*keep*(1-(o.gran||0)))}
  if(o.gran>0.05)o.treas-=0.004*o.gran;
  if(o.granUse){o.gran=Math.max(0,o.gran-o.granUse/(0.04*o.pop+1));o.granUse=0}
  // paying for peace: a strong horde raiding a rich state
  if(o.paysTo){const h=s.pols[o.paysTo];
    if(!h||!h.alive||h.kind!=='horde'||power(o)>1.6*power(h)){o.paysTo=0}
    else if(o.treas<-1){o.paysTo=0;o.shock+=0.15;chron('war',`The ${o.full} can no longer pay the ${h.full}, and the raids begin again.`,c,[R_(o),R_(h)])}
    else{o.treas-=0.025;h.loot+=o.pop*0.0012}}
  else if(s.year-(o.raidY||-1e9)<5&&o.raidBy&&o.treas>0.1&&o.cells>=10){const h=s.pols[o.raidBy];
    if(h&&h.alive&&h.kind==='horde'&&power(h)>0.7*power(o)&&r()<0.15){o.paysTo=h.id;h.payers=(h.payers||0)+1;
      chron('diplomacy',`The ${o.full} buys peace from the ${h.full} with yearly gifts of silk, grain and silver.`,c,[R_(o),R_(h)],'Paying was cheaper than fighting horsemen who could not be caught.')}}
}

// ---------- communication: five media ----------
// Marks (scripts, alphabets, notation), sound and light (talking drums, beacons), objects (knotted cords, tallies), memory
// specialists (remembrancers) and runners (relay posts). Each serves records, speed or memory; paper and printing amplify
// marks, roads and horses amplify runners. Sources: Innis 1950; Goody 1986; Urton 2003 (khipu); Finnegan 1970 (drum languages).
const TONAL=new Set(['sinitic','tibetan','bantu','mande','thai']);
function commNeed(k,o,c){const s=S,w=WD,T=s.tk;
  switch(k){
    case 'noScript':return T[TI.writing][c]<0.3;
    // roads are built by organised labour: a levy of dense villages, with or without iron, coin or writing
    case 'levy':return (o.levy||0)>0.35;
    // drum languages carry the tones of speech; forests and hills hide fires and slow runners
    case 'drums':{const e=s.eths[o.core];const tonal=!!(e&&e.lang&&TONAL.has(e.lang.style));return (w.forest0[c]>0.35||w.rough[c]>0.3)&&(tonal||s.r()<0.2)}
    case 'threat':return o.fortN>0||o.enemies.size>0||(o.raided||0)>0;
    // a script meeting traders, sailors or foreigners outside the scribal class
    case 'trade':return s.car[c]>0.1||(w.coast[c]&&s.sail[c]>0.5)||(o.cityPop||0)>0.2*o.pop;
    case 'hasDrums':return T[TI.drums][c]>0.5}
  return true}
function infoCap(o){const s=S,T=s.tk,c=o.capital,v=k=>T[TI[k]][c];
  const marks=Math.min(1.3,v('writing')+0.3*v('alphabet'))*(1+0.3*v('paper')+0.3*v('printing'));
  const sound=Math.max(v('drums'),v('beacons'))+0.5*v('drumscript'),objects=v('khipu'),mem=v('griots');
  // mounted couriers need riders, not just horses: a people that owns horses but has not learned to ride them sends runners
  const rA=rideAdm(o,c),runners=v('relays')*(1+0.5*s.roads[c]+0.5*rA);
  const rec=clamp(0.75*marks+0.55*objects+0.1*mem+0.3*v('drumscript'),0,1.5);
  const spd=clamp(0.25*marks+0.45*runners+0.35*sound+0.3*rA+0.15*(s.courX?s.courX[c]:0),0,1.5);
  const memo=clamp(0.5*marks+0.6*mem+0.25*objects,0,1.3);
  o.info={rec,spd,memo};o.leg=0.75+0.35*Math.min(1,rec);return o.info}

// ---------- monopolies and holding power ----------
// Conquering a neighbour is easy; holding it is not. A centre holds a province that depends on something it monopolises:
// force (a paid standing army), knowledge (scribes and records), the economy (trade, cities, metals) or the sacred (the god's
// house). Peers with their own walls, scribes and gods break away at the first chance (Renfrew & Cherry 1986; Weber; Innis 1950).
// Empire is not a technique: it is a state that has gathered enough of these to rule other cities directly.
function monopolies(o){const s=S,c=o.capital,info=o.info||infoCap(o),rec=Math.min(1,info.rec);
  // savanna kingdoms held by horsemen rather than scribes (Goody 1971)
  const force=clamp(0.35*(o.levy||0)*Math.min(1,(o.ext??0.45)/0.45)+0.5*rideAdm(o,c)+0.4*(o.treas>0?Math.min(1,o.treas+0.5):0.2)*(o.prep??0.5)*2,0,1);
  const econ=clamp(0.6*Math.min(1,s.car[c])+1.5*(o.cityPop||0)/(o.pop+1)+0.3*s.coin[c]+0.4*Math.min(1,o.gran||0),0,1);
  const R=o.rel>=0?s.rels[o.rel]:null,sacred=Math.max(R&&R.holy!=null&&s.pol[R.holy]===o.id?1:0,s.ritW?clamp((s.ritW[c]-0.3)/0.5,0,1):0);   // the god's house, or an old sanctuary at the capital
  o.mono={force,rec,econ,sacred};o.hold=clamp((force+rec+econ+0.8*sacred)/3.2+0.15*Math.min(1,info.spd),0,1);return o.hold}
// what a defeated state brings to the table on its own: walls, scribes, its own city and cohesion
function selfHold(d){const s=S,c=d.capital,info=d.info||infoCap(d);
  return clamp(0.35*Math.min(1,info.rec)+0.25*(s.city[c]>=0?1:0)+0.25*Math.min(1,s.fort[c]*2)+0.25*d.S,0,1)}

// ---------- sacred sites ----------
// Long before cities, foragers and early farmers gathered at a few places, year after year, and built there: Gobekli Tepe's
// pillars, the ring at Stonehenge, the earthworks of Poverty Point. Gathering keeps scattered bands one people: it renews
// alliances, marriages, stories and skills (Johnson 1982 on scalar stress; Renfrew 1973; Dietrich et al. 2012). A site gains
// standing with each generation that returns, and erodes when they stop: buried, overgrown, a fossil for later diggers.
// Newcomers can take over a living site or rediscover a dead one; a site with enough standing can become a faith's holy city.
const RIT_KIND=[['ring of standing stones','stones'],['circle of carved stone pillars','pillars'],['great earthen mound','mound'],['sacred grove and spring','grove'],['painted cave','cave'],['shell mound and feasting ground','shell mound']];
function ritKind(c){const w=WD;if(w.rough[c]>0.45)return 4;if(w.coast[c]&&w.T[c]>8)return 5;if(w.forest0[c]>0.6)return 3;if(w.rough[c]>0.2)return 1;return w.T[c]<14?0:2}
function ritName(r){return r.name}
// every ten years
function ritualPass(){const s=S,w=WD,r=s.r,y=s.year,L=w.landIdx;
  // new gathering places where settled bands live close together and no site already draws them
  for(let t=0;t<120;t++){const i=rLand(r);if(s.pop[i]<1||s.ritW[i]>0.15)continue;const sd=s.sed?s.sed[i]:0,dens=s.pop[i]/w.area[i];
    if(sd<0.45||dens<0.15)continue;if(r()<0.03*sd*Math.min(1,dens/0.6)){const L2=langAt(i),k=ritKind(i);
      const R={id:s.rits.length,cell:i,eth:s.eth[i],name:cityWord(L2,r),kind:k,born:y,imp:0.08,peak:0.08,last:y,alive:true,fossil:false,told:false,keepers:s.eth[i]};
      s.rits.push(R);s.ritAt[i]=R.id}}
  s.ritW.fill(0);s.ritOf.fill(-1);
  for(const R of s.rits){const c=R.cell;
    if(!w.land[c]){if(R.alive){R.alive=false;R.fossil=true;if(R.told)chron('nature',`The sea closes over the old ${RIT_KIND[R.kind][0]} at ${R.name}.`,c)}continue}
    let att=0;const cnt=new Map();ring(c,4,j=>{const p=s.pop[j];if(p<1)return;att+=p*(0.4+0.6*(s.sed?s.sed[j]:1));const e=s.eth[j];if(e>=0)cnt.set(e,(cnt.get(e)||0)+p)});
    let top=-1,tp=0;for(const [e,p] of cnt)if(p>tp){tp=p;top=e}
    const a=clamp(att/25000,0,1);
    if(R.alive){
      if(a>0.08){R.imp=Math.min(1,R.imp+0.015*a*(1-R.imp)+0.004*a);R.last=y}else R.imp*=0.96;
      if(R.imp>R.peak)R.peak=R.imp;
      if(!R.told&&R.imp>0.35){R.told=true;const e=s.eths[top]||s.eths[R.eth];
        chron('culture',`Every year the ${e?e.name:'peoples around'} gather at ${R.name}, where they have raised a ${RIT_KIND[R.kind][0]}. Feasts, marriages and old stories bind the scattered bands into one people.`,c,e?[RE(e)]:[])}
      if(top>=0&&R.keepers>=0&&top!==R.keepers&&R.told&&tp>0.6*att&&y-(R.taken||-1e9)>300&&s.eths[top].name!==(s.eths[R.keepers]||{}).name){const e=s.eths[top],o=s.eths[R.keepers];R.taken=y;
        chron('culture',`The ${e.name} take over the sacred ${RIT_KIND[R.kind][1]} of ${R.name}, once kept by the ${o?o.name:'others'}, and make its feasts their own.`,c,[RE(e)])}
      if(top>=0)R.keepers=top;
      if(R.imp<0.03&&y-R.last>200){R.alive=false;R.fossil=true;if(R.told||R.peak>0.3)chron('culture',`No one gathers at ${R.name} any more. Its ${RIT_KIND[R.kind][1]} are buried and forgotten, a puzzle for diggers yet unborn.`,c)}}
    else if(R.fossil&&a>0.5&&r()<0.01){R.alive=true;R.fossil=false;R.imp=0.12;R.last=y;const e=s.eths[top];
      if(R.peak>0.3&&e)chron('culture',`The ${e.name} find the old ${RIT_KIND[R.kind][1]} at ${R.name} and begin to gather there again.`,c,[RE(e)])}
    if(R.alive&&R.imp>0.05){const cx=w.cxA[c],cy=w.cyA[c];ring(c,5,(j,dx,dy)=>{const v=R.imp*(1-Math.hypot(dx,dy)/6);if(v>s.ritW[j]){s.ritW[j]=v;s.ritOf[j]=R.id}})}}
}
// the most revered living site in a set of cells, for a new faith's holy city
function holySite(cells){const s=S;let best=null;for(const c of cells){const k=s.ritAt[c];if(k<0)continue;const R=s.rits[k];if(R.alive&&R.imp>0.5&&(!best||R.imp>best.imp))best=R}return best}

// every ten years: a much stronger neighbour can make a small realm pay tribute without a war, by gifts and threats; tribute
// empires such as the Aztec Triple Alliance ruled mostly this way (Hassig 1985; Smith 2012)
function tributePass(){const s=S,r=s.r,w=WD;
  // where conquest is costly (mountains, forest) a far stronger neighbour takes tribute instead of the land: hegemony, the
  // usual form of rule in the highlands of Mesoamerica and the Andes before the Inca (Hassig 1985; Smith 2012)
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='state'||o.over||(o.hold??0)<0.35)continue;const po=power(o),Rn=o.ruler||{aggr:0.5};
    for(const [q] of o.nb){const d=s.pols[q];if(!d||!d.alive||d.kind!=='state'||d.over||d.league!=null||o.enemies.has(q)||o.allies.includes(q)||d.cells>o.cells)continue;
      const c=d.capital,hard=clamp(1.5*w.rough[c]+0.8*s.forest[c]+(w.tcost[c]>=5?0.3:0),0,1);if(hard<0.3)continue;
      if(power(d)*3>po)continue;if(r()<0.04*hard*(0.5+Rn.aggr)*Math.min(1.5,(o.ext??0.45)/0.45)){d.over=id;o.tribs++;
        if(d.cells>=3||o.cells>=10)chron('diplomacy',`Without a battle, the ${d.full} sends gifts and submits to the ${o.full}, paying tribute to keep its own ruler.`,d.capital,[R_(d),R_(o)],'A far stronger neighbour asked for tribute; across these mountains and forests, taking the land itself would have cost too much.')}}}}

// ---------- the tribal frontier ----------
// Peoples without states are not a scatter of lone villages. Lineages that feud among themselves unite against an outsider
// (segmentary opposition: Evans-Pritchard 1940; Sahlins 1961), so a state at war with a tribe faces the tribe, not a valley.
// They also strike first: raids on exposed frontier settlements were the normal condition of every agrarian frontier, from
// the Amorites and Gutians on Sumer to the Germans on the Roman limes and the Xiongnu on Han China (Lattimore 1940; Barfield
// 1989). A frontier province without walls, garrison or settled loyalty can be lost back to them.
// rally: the fighters a stateless people can bring to bear on one province, from its kin within two provinces (riders from further)
function rallyPass(){const s=S,w=WD,L=w.landIdx;if(!s.rally)s.rally=new Float32Array(N);const R=s.rally;
  for(const i of L){R[i]=0;if(s.pol[i]||s.pop[i]<1)continue;const e=s.eth[i];if(e<0)continue;let t=0;
    ring(i,2,(j,dx,dy)=>{if(j===i||!w.land[j]||s.pol[j]||s.eth[j]!==e)return;t+=s.pop[j]*(Math.abs(dx)+Math.abs(dy)<=2?0.6:0.3)});
    const E=s.eths[e],ride=E&&E.ride?E.ride:0;R[i]=s.pop[i]+t*(0.7+0.6*ride)*(0.6+0.8*s.s[i])}}
function frontierPass(){const s=S,w=WD,r=s.r,L=w.landIdx;if(!s.rally)rallyPass();const R=s.rally;
  for(const id of s.alive){const o=s.pols[id];o.tFront=0}
  for(const i of L){const p=s.pol[i];if(!p)continue;const o=s.pols[p];if(o.kind!=='state'||s.pop[i]<1)continue;
    let best=-1,bu=0;for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j<0||!w.land[j]||s.pol[j]||s.pop[j]<1||s.eth[j]<0||s.eth[j]===s.eth[i])continue;
      const E=s.eths[s.eth[j]],ride=E&&E.ride?E.ride:0,hungry=(s.evP[j]<0.9?1.6:1)*(s.pop[j]>0.95*s.K[j]?1.4:1)*(s.hgr?1+1.5*s.hgr[j]:1);
      const u=Math.pow(R[j]+1,0.75)*s.s[j]*milAt(j)*(1+1.5*ride)*hungry*(1+0.6*s.herd[j]*w.sH[j])*(1+hardOf(s.eth[j]));if(u>bu){bu=u;best=j}}
    if(best<0)continue;o.tFront+=cwL(i);
    // a raid every few years where the tribes are strong; walls, garrisons and loyal settlers blunt it
    // a raid strikes before the army can come: what counts is the province's own people, walls and garrison, not the realm's strength
    const Ud=Math.pow(pEq(i)*2+1,0.75)*milAt(i)*(1+2.5*s.fort[i])*(1+1.6*w.rough[i])*(0.5+s.integ[i])*(0.6+0.8*o.S)*(0.7+0.6*(o.prep??0.6)),pw=clamp(bu/(bu+Ud),0,0.8);
    if(r()<pF(0.06*pw,i,i)){const a=cw(i);s.pop[i]*=0.96;s.integ[i]=Math.max(0,s.integ[i]-0.12);o.shock+=0.002*a;s.raidC[i]=s.year;o.raided=(o.raided||0)+a;o.raidY=s.year;
      // the frontier falls back: a recently taken, unwalled, unreconciled province is abandoned to the raiders
      if(s.integ[i]<0.12&&s.fort[i]<0.3&&i!==o.capital&&s.city[i]<0&&s.year-(s.taken[i]||-1e9)<300&&r()<0.5){s.pol[i]=0;
        if(o.cells>=20&&r()<0.05)chron('war',`Raiders from the ${s.eths[s.eth[best]]?s.eths[s.eth[best]].name:'hill tribes'} drive the settlers of the ${o.full} from a frontier province.`,i,[R_(o)])}}}}
// can farmers settle among herders and foragers? only where they are protected, the land is nearly empty, or its people have
// just been broken by drought or plague; otherwise the settlers are driven off (Anthony 2007 on the steppe; Shennan 2018)
function settleOK(i,j){const s=S;const pj=s.pop[j];if(pj<1||s.farm[i]<0.5||s.farm[j]>=0.3||s.eth[j]===s.eth[i])return 1;
  const thin=clamp(1-pj/(0.5*s.K[j]+1),0,1),pi=s.pol[i],pj2=s.pol[j];
  const prot=pi&&s.pols[pi].kind==='state'&&(pj2===pi||s.fort[i]>0.3)?1:pi&&s.pols[pi].kind==='state'?0.5:0;
  const broken=(s.evP[j]<0.9||s.infect[j])?0.8:0;
  return 0.12+0.88*Math.max(thin,prot,broken)}

/* ---------- goods and markets (Nein, 2026-11-11; switch nogoods turns it off) ----------
   Eight goods a civilisation runs on, beyond grain and herds: salt, timber, copper, tin, iron, gold and silver, the luxuries of
   particular climates (spices, incense), and the wares of cities (cloth, pottery, wine, oil). Salt comes from dry coasts, desert
   pans and a few hills; timber from standing forest; luxuries from the wet tropics and the hot dry margins; wares from cities.
   Ores lie in mountain belts about 300 km across, placed by the world's seed (invented, not derived: the model has no geology):
   copper in about a fifth of them, gold and silver in a tenth, tin in one in thirty, iron in half and in bog country.
   Every ten years each polity's output and need of each good are counted in people served, and a polity short of a good buys
   from neighbours with a surplus. Both sides gain (the seller more), and each remembers what the other is worth to it.
   A realm short of metal for its weapons fights worse; one short of bullion coins less; one short of salt is restless.
   A neighbour that has what a state lacks is worth more to conquer, and a trading partner is worth less to attack. */
const GOODS=[{k:'salt',n:'salt',v:1},{k:'timber',n:'timber',v:0.6},{k:'copper',n:'copper',v:2},{k:'tin',n:'tin',v:5},{k:'iron',n:'iron',v:1.5},{k:'gold',n:'gold and silver',v:6},{k:'lux',n:'spices and incense',v:4},{k:'wares',n:'the wares of cities',v:2}],NG=8,GVS=22.1;
const goodsOn=()=>!swOn('nogoods');
function h3(a,b,c){let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263)^Math.imul(c|0,2246822519);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function goodsInit(){const s=S,w=WD,sd=hashStr(String(w.seed??s.seed??'w'))|0,G=s.ore=[];for(let g=0;g<NG;g++)G.push(new Float32Array(N));
  for(const i of w.landIdx){const la=w.lat[i]*57.2958,lo=(w.cxA[i]+0.5)/W*360-180,bx=Math.floor(lo/3),by=Math.floor(la/3),rg=w.rough[i],T=w.T[i],Pr=w.Pr[i];
    const belt=k=>h3(bx,by,sd+k),own=k=>h3(i,77,sd+k),m=clamp((rg-0.15)/0.3,0,1);
    G[0][i]=w.coast[i]&&Pr<600&&T>8?0.8:w.desert[i]&&own(1)>0.7?0.6:rg>0.2&&belt(1)>0.9?0.7:0;
    G[2][i]=m*(belt(2)>0.78?1:0)*(0.5+0.5*own(2));G[3][i]=m*(belt(3)>0.965?1:0)*(0.5+0.5*own(3));
    G[4][i]=(m>0?m:Pr>600?0.3:0)*(belt(4)>0.45?1:0)*(0.4+0.6*own(4));G[5][i]=m*(belt(5)>0.9?1:0)*(0.5+0.5*own(5));
    G[6][i]=T>22&&Pr>1500?0.8:T>22&&Pr>80&&Pr<400&&own(6)>0.6?0.7:0}}
function goodsPass(){const s=S,w=WD,pols=s.pols;if(!s.ore)goodsInit();const G=s.ore,A=s.alive;
  for(const id of A){const o=pols[id];if(!o.gs){o.gs=new Float64Array(NG);o.gd=new Float64Array(NG);o.gmet=new Float32Array(NG).fill(1)}o.gs.fill(0);o.gd.fill(0);o.gInc=0;o.gp=new Map()}
  for(const i of w.landIdx){let p=s.pol[i],half=1;
    // peoples without a state sell what their land yields to a neighbouring polity, at half the rate
    if(!p){if(s.pop[i]<1||!(G[0][i]>0||G[2][i]>0||G[3][i]>0||G[4][i]>0||G[5][i]>0||G[6][i]>0))continue;for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&s.pol[j]){p=s.pol[j];break}}if(!p)continue;half=0.5}
    const o=pols[p];if(!o.gs)continue;const pp=s.pop[i],c=cw(i)*half,wk=Math.min(1,pp/(2000*cw(i))),X=o.gs,mt=Math.min(1,s.metal[i]);if(half<1){X[0]+=G[0][i]*1e6*c*wk;X[2]+=G[2][i]*1.2e6*c*wk;X[3]+=G[3][i]*2e6*c*wk;X[4]+=G[4][i]*5e5*c*wk;X[5]+=G[5][i]*1e6*c*wk;X[6]+=G[6][i]*6e5*c*wk;continue}
    X[0]+=G[0][i]*1e6*c*wk;X[1]+=s.forest[i]*2e5*c*wk;X[2]+=G[2][i]*1.2e6*c*wk*mt;X[3]+=G[3][i]*2e6*c*wk*mt;X[4]+=G[4][i]*5e5*c*wk*Math.min(1,s.iron[i]);X[5]+=G[5][i]*1e6*c*wk*mt;X[6]+=G[6][i]*6e5*c*wk}
  for(const id of A){const o=pols[id],c=o.capital,D=o.gd,pop=o.pop,br=Math.min(1,s.metal[c])*(1-0.7*Math.min(1,s.iron[c]));
    D[0]=pop;D[1]=3*(o.cityPop||0)+0.2*pop*Math.min(1,s.sail[c]);D[2]=0.5*pop*br;D[3]=0.06*pop*br;D[4]=0.6*pop*Math.min(1,s.iron[c]);D[5]=pop*(0.05+0.5*(o.mon||0));D[6]=0.15*pop*(0.5+(o.ineq||0.25));D[7]=0.3*pop;
    o.gs[7]=8*(o.cityPop||0)}
  // routes (Nein, 2026-11-11): goods travel along chains of polities that know each other, by shared borders and, for peoples who
  // sail, between ports within reach (600 km, to 1,800 with deep-water sailing). A buyer is served by the nearest surplus first, up
  // to four hands away; each hand between takes a toll (a tenth, up to three-tenths under a grasping ruler) and less arrives for
  // it. A seller who is the only source in reach doubles the price, and the buyer remembers the squeeze. Merchants' wealth (mw)
  // gathers where goods are sold and pass through
  const port=new Map();for(const id of A){const o=pols[id];o.sea=null;const c=o.capital;if(w.coast[c]&&s.sail[c]>0.5)port.set(id,c)}
  const PL=[...port.keys()];for(let a=0;a<PL.length;a++)for(let b=a+1;b<PL.length;b++){const ca=port.get(PL[a]),cb=port.get(PL[b]),R=600*(1+2*Math.min(s.nav[ca],s.nav[cb]));
    if(kmB(ca,cb)<=R){const oa=pols[PL[a]],ob=pols[PL[b]];(oa.sea||(oa.sea=[])).push(PL[b]);(ob.sea||(ob.sea=[])).push(PL[a])}}
  for(const id of A){const o=pols[id],m=o.metro!=null?pols[o.metro]:null;if(m&&m.alive&&m.gs){(o.sea||(o.sea=[])).push(m.id);(m.sea||(m.sea=[])).push(id)}}
  const got=new Float64Array(NG),hop=new Map(),par=new Map();
  for(const id of A){const o=pols[id];if(o.pop<1||!o.nb)continue;got.fill(0);let short=false;for(let g=0;g<NG;g++)if(o.gd[g]>o.gs[g])short=true;
    if(short){hop.clear();par.clear();hop.set(id,0);const Q=[id];
      for(let h=0;h<Q.length&&Q.length<60;h++){const u=Q[h],ou=pols[u],d=hop.get(u);if(d>=4)continue;
        const vis=q=>{if(hop.has(q))return;const t=pols[q];if(!t||!t.alive||!t.gs||ou.enemies.has(q))return;hop.set(q,d+1);par.set(q,u);Q.push(q)};
        if(ou.nb)for(const [q] of ou.nb)vis(q);if(ou.sea)for(const q of ou.sea)vis(q)}
      for(let g=0;g<NG;g++){let df=o.gd[g]-o.gs[g];if(df<=0)continue;let nsrc=0;for(let k=1;k<Q.length;k++){const t=pols[Q[k]];if(t.gs[g]>t.gd[g])nsrc++}
        for(let k=1;k<Q.length&&df>0;k++){const q=Q[k],t=pols[q],sq=t.gs[g]-t.gd[g];if(sq<=0)continue;
          let keep=1;for(let u=par.get(q);u!==id&&u!=null;u=par.get(u)){const m=pols[u],tl=0.1+0.2*((m.ruler&&m.ruler.greed)??0.5)*(m.kind==='state'?1:0.5);keep*=1-tl}
          const x=Math.min(df,0.5*sq*keep);if(x<=0)continue;t.gs[g]-=x/keep;got[g]+=x;df-=x;
          const mono=nsrc===1?2:1,sh=GOODS[g].v/GVS*x,vi=0.8*0.4*(o.tax||0)*sh/(o.pop+1)/mono,ve=0.8*0.6*(t.tax||0)*sh/(t.pop+1)*mono;
          o.gInc+=vi;t.gInc+=ve;t.mw=(t.mw||0)+ve;o.gp.set(q,(o.gp.get(q)||0)+vi);t.gp.set(id,(t.gp.get(id)||0)+ve);
          if(mono>1){if(!o.grv)o.grv=new Map();o.grv.set(q,(o.grv.get(q)||0)+vi)}
          for(let u=par.get(q);u!==id&&u!=null;u=par.get(u)){const m=pols[u],cut=0.15*ve;m.gInc+=cut;m.mw=(m.mw||0)+cut;s.transit=(s.transit||0)+1}
          s.tradeN=(s.tradeN||0)+1}}}
    for(let g=0;g<NG;g++)o.gmet[g]=o.gd[g]>0?clamp((Math.max(0,o.gs[g])+got[g])/o.gd[g],0,1):1;
    const c=o.capital,fe=Math.min(1,s.iron[c]),bz=Math.min(1,s.metal[c]);
    o.arms=fe>0.5?0.75+0.25*o.gmet[4]:bz>0.5?0.75+0.25*Math.min(o.gmet[2],o.gmet[3]):1;o.wantP=0.15*(1-o.gmet[0]);
    // merchants: their wealth decays a tenth a decade; where it is large beside the crown's taxes, command by hired captains gains standing
    o.mw=(o.mw||0)*0.9;if(o.cmdW&&o.tax>0){const mr=clamp(o.mw/(o.tax+1),0,1);o.cmdW[3]=clamp(o.cmdW[3]*(1+0.05*mr),0.05,5)}}}
// what a neighbour's goods are worth to a state that lacks them, as a share of its own taxes
function lackV(o,t){if(!o.gmet||!t.gs)return 0;let v=0;for(let g=0;g<NG;g++)if(o.gmet[g]<0.8&&t.gs[g]>t.gd[g])v+=GOODS[g].v/GVS*(1-o.gmet[g]);return 0.5*(o.tax||0)*v+2*(o.grv&&o.grv.get(t.id)||0)}
// stateless land with ore or salt a state is short of is worth holding whatever its people pay
function oreWanted(o,j){const G=S.ore;if(!G||!o.gmet)return false;for(const g of [0,2,3,4,5])if(G[g][j]>0.3&&o.gmet[g]<0.8)return true;return false}

/* ---------- roads as works (agreed 2026-11-05; switch noworks turns it off) ----------
   A road is built, province by province, by a state that knows road-building and has hands for it: the labour levy (free
   service and the crown's slaves) and, for a moneyed state in funds, paid gangs. Roads grow outward from the capital through
   the peopled country toward cities and forts, cost more over rough ground, and must be kept up: a state that cannot spare the
   labour lets them decay, and roads nobody rules fall apart in a few generations. Travel, rule and tax reach follow the roads
   that exist, not the knowledge of how to build them. Walls draw on the same labour. Every ten years. */
const worksOn=()=>!swOn('noworks');
const RD=j=>S.road?S.road[j]>0.5:S.roads[j]>0.5;
function roadPass(){const s=S,w=WD,pols=s.pols;if(!s.road)s.road=new Float32Array(N);const R=s.road,cand=new Map();
  for(const id of s.alive){const o=pols[id];o.roadN=0;if(o.kind==='state'&&s.roads[o.capital]>0.3)cand.set(id,[])}
  for(const i of w.landIdx){const p=s.pol[i],o=p?pols[p]:null;if(R[i]>0){if(!o||o.kind!=='state'){R[i]*=0.8;if(R[i]<0.02)R[i]=0}else o.roadN+=cw(i)*R[i]}
    if(!o||R[i]>=0.95)continue;const C=cand.get(p);if(!C)continue;let adj=i===o.capital;if(!adj)for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&s.pol[j]===p&&(j===o.capital||R[j]>0.5)){adj=true;break}}
    if(!adj)continue;const sc=(s.city[i]>=0||s.fort[i]>0.3?3:1)*(1+Math.min(1,s.car[i]))*Math.min(3,s.pop[i]/w.area[i]/5+0.2)/(1+2*w.rough[i]);
    if(C.length<24)C.push([sc,i]);else{let m=0;for(let k=1;k<24;k++)if(C[k][0]<C[m][0])m=k;if(sc>C[m][0])C[m]=[sc,i]}}
  for(const [id,C] of cand){const o=pols[id];let B=8*(o.levy||0)+4*clamp(o.treas||0,0,1)*(o.mon||0);const keep=0.1*o.roadN+0.05*(o.fortN||0);
    o.roadPaid=B>=keep;B-=keep;if(B>0){C.sort((a,b)=>b[0]-a[0]);for(const [sc,i] of C){const cost=cwL(i)*(1+2*w.rough[i]);if(B<cost*0.3)break;const add=Math.min(1-R[i],B/cost);R[i]+=add;B-=add*cost;o.roadN+=cw(i)*add;s.roadB=(s.roadB||0)+add*cw(i)}}
    if(!o.roadC&&o.roadN>=10&&(o.cA||o.cells)>=20){o.roadC=1;chron('culture',`The ${o.full} builds roads out from its capital, with ${o.stSl>0.3*(o.pop*0.03)?'the labour of its slaves':(o.mon||0)>0.5?'paid gangs':'the labour its people owe'}.`,o.capital,[R_(o)],'Armies, messengers and tax grain move along them.')}}
  // unpaid roads decay
  for(const i of w.landIdx){if(R[i]<=0)continue;const p=s.pol[i],o=p?pols[p]:null;if(o&&o.kind==='state'&&!o.roadPaid){R[i]*=0.9;if(R[i]<0.02)R[i]=0}}}
/* ---------- slavery (Nein, 2026-11-11; switch noslaves turns it off) ----------
   Captives are taken when land is conquered and in raids, and are a traded good. A polity keeps a pool of captives with the
   peoples they came from. Every ten years peoples who live by raiding sell most of theirs to the richest neighbouring state,
   and each state puts its captives to work where labour is wanted: on the estates of unequal realms, most of all in warm, wet
   farmland (plantations), in mines, and in cities. They are added to the people of those provinces as slaves and bring their
   own culture with them, so a people carried off in numbers shows on the map where it was put to work. Slaves do not serve in
   the army; their labour concentrates wealth; where they are many and the state is weak they rise. Their descendants are
   absorbed over generations, so slavery lasts only where captives keep coming. Universal faiths mostly forbid enslaving
   fellow believers.
   It also serves the society that keeps it (Nein, 2026-11-11): the free close ranks (solidarity rises where slaves are held), the
   poor among the free side with the masters, not against them (unrest from inequality is muted: Morgan 1975; Fredrickson 1981),
   and free men spared the fields can go on campaign (Finley 1980). The price is a standing watch over the slaves. */
const slaveOn=()=>!swOn('noslaves');
function kinBan(o,rel){if(o.rel<0||rel!==o.rel)return false;const R=S.rels[o.rel];return!!R&&R.kind==='universal'&&(R.id*7+3)%10<7}
function takeCaptives(o,j,share){const s=S;if(!slaveOn()||s.pop[j]<50||kinBan(o,s.rel[j]))return;const n=s.pop[j]*share;s.pop[j]-=n;o.capt=(o.capt||0)+n;
  const e=s.eth[j];if(e>=0){if(!o.captE)o.captE=new Map();o.captE.set(e,(o.captE.get(e)||0)+n)}}
function slavePass(){const s=S,w=WD,pols=s.pols,r=s.r;if(!s.slv){s.slv=new Float32Array(N);s.slvE=new Int32Array(N).fill(-1)}const SL=s.slv,G=s.ore;
  // sale: raiders and small chiefs sell to the richest neighbouring state that will take them
  for(const id of s.alive){const o=pols[id];if(!(o.capt>100)||!o.nb)continue;if(o.kind==='state'&&(o.cA||o.cells)>=6)continue;let b=null,bv=0;
    for(const [q] of o.nb){const t=pols[q];if(!t||!t.alive||t.kind!=='state'||o.enemies.has(q))continue;const v=(t.tax||0)*(0.3+(t.ineq||0.25));if(v>bv){bv=v;b=t}}
    if(!b)continue;const n=0.8*o.capt;o.capt-=n;b.capt=(b.capt||0)+n;if(o.captE){if(!b.captE)b.captE=new Map();for(const [e,x] of o.captE){b.captE.set(e,(b.captE.get(e)||0)+0.8*x);o.captE.set(e,0.2*x)}}
      o.loot=(o.loot||0)+0.3*n;s.slvSold=(s.slvSold||0)+n}
  // work: weight of each province for its state's captives
  const want=i=>{const p=s.pop[i];if(p<500)return 0;const hot=w.T[i]>18&&w.Pr[i]>800&&s.farm[i]>0.5?3:0,mine=G&&(G[2][i]>0.3||G[3][i]>0.3||G[5][i]>0.3||G[0][i]>0.5)?3:0;return p*(1+hot+mine+(s.city[i]>=0?1:0))*s.farm[i]};
  for(const id of s.alive){const o=pols[id];o.slvW=0;o.slvN=0}
  for(const i of w.landIdx){const p=s.pol[i];if(SL[i]>0){SL[i]*=0.95;if(SL[i]<0.005){SL[i]=0;s.slvE[i]=-1}}if(!p)continue;const o=pols[p];o.slvN+=SL[i]*s.pop[i];if(o.capt>100)o.slvW+=want(i)}
  for(const i of w.landIdx){const p=s.pol[i];if(!p)continue;const o=pols[p];if(!(o.capt>100)||!(o.slvW>0))continue;const n=o.capt*want(i)/o.slvW;if(n<1)continue;
    let e=-1,bx=0;if(o.captE)for(const [k,x] of o.captE)if(x>bx){bx=x;e=k}
    o.slvNew=(o.slvNew||0)+n;if(e>=0)o.slTopE=e;
    const old=s.pop[i];s.pop[i]+=n;SL[i]=Math.min(0.7,(SL[i]*old+n)/(old+n));s.s[i]=Math.min(1,s.s[i]+0.05*SL[i]);if(s.forest[i]>0.05&&s.farm[i]>0.5)s.forest[i]=Math.max(0,s.forest[i]-0.1*SL[i]);if(e>=0&&e!==s.eth[i]){mixIn(i,e,n/(old+n));s.slvE[i]=e}o.slvN+=n}
  for(const id of s.alive){const o=pols[id];
    if(o.capt>100&&o.slvW>0){let e=-1,bx=0;if(o.captE)for(const [k,x] of o.captE)if(x>bx){bx=x;e=k}
      if(bx>=50000&&e>=0&&s.eths[e]&&(o.cA||o.cells)>=15){s.slvMig=(s.slvMig||0)+1;chron('migration',`${Math.round(bx/1000)},000 captives of the ${s.eths[e].name} are carried off to the fields, mines and households of the ${o.full}.`,o.capital,[RE(s.eths[e]),R_(o)],'Taken in war and raids, or bought from those who took them.')}
      o.capt=0;o.captE=null}
    else if(o.capt>0)o.capt*=0.7;
    o.slvS=o.pop>0?clamp(o.slvN/o.pop,0,0.7):0;
    if(o.kind!=='state')continue;
    // who owns them (Nein, 2026-11-11): the crown, the estates of nobles and great landowners, the towns. New captives are shared
    // out by who took them (a king's army for the crown, nobles' for their estates, merchants' ventures for sale), by who can pay
    // (estates where land is concentrated, towns where merchants are rich, the crown where the treasury is sound), and by how
    // strong the crown is against the nobles. The crown wants them where free labour service is weak, for fleets, and where it
    // can feed, guard and organise them
    {const c=o.capital,top=o.cmdTop??0,rec=o.info?Math.min(1,o.info.rec):admOf()[c],free=clamp(o.pop/Math.max(1,o.cells)/60000,0,1)*clamp((o.cplx||0.2)/0.5,0,1),
       fleet=w.coast[c]&&s.sail[c]>0.5&&o.enemies.size?0.4:0,
       wC=[1,0.3,0.5,0.2,0.4][top]*(1-0.6*(o.nob||0))*clamp(0.3+0.8*(1-free)+fleet+(o.mam||0),0.1,1.8)*(0.4+0.6*rec)*(o.treas>-0.5?1:0.4),
       wE=(0.3+(o.nob||0))*(0.5+2*Math.max(0,(o.ineq||0.25)-0.25)),wT=0.3+2*clamp((o.mw||0)/((o.tax||0)+1),0,1)+2*(o.cityPop||0)/(o.pop+1),W3=wC+wE+wT,n=o.slvNew||0;
     o.slC=(o.slC||0)*0.95+n*wC/W3;o.slE=(o.slE||0)*0.95+n*wE/W3;o.slT=(o.slT||0)*0.9+n*wT/W3;o.slvNew=0;
     const eS=o.slE/(o.pop+1);o.stSl=o.slC;
     // estates: wealth and independence for the great families; fewer free farmers
     if(o.ineq!=null)o.ineq=clamp(o.ineq+0.08*eS,0.15,0.92);o.nob=clamp((o.nob||0)+0.03*Math.min(1,5*eS),0,0.95);
     // towns: more wares
     if(o.gs)o.gs[7]+=2*o.slT;
     // the crown's soldiers: a moneyed ruler who cannot trust his nobles or his people buys an army (mam, the share of the army
     // that is slave soldiery). They fight well, owe him everything and break the nobles' hold; when they are most of the army
     // under a weak ruler they take the throne and become the nobility (Pipes 1981; Crone 1980)
     if(o.slC>2000&&(o.mon||0)>0.4&&((o.nob||0)>0.45||(o.hold??0.5)<0.45))o.mam=Math.min(0.9,(o.mam||0)+0.06);else if(o.mam>0)o.mam*=0.85;
     // the crown's officials: slaves, eunuchs and freedmen who owe everything to the ruler run his household and then his offices
     // (eun). They serve a strong ruler well and take the nobles' place; under a weak one they rule in his name, for themselves
     if(o.slC>500&&rec>0.3&&(o.nob||0)>0.4)o.eun=Math.min(0.9,(o.eun||0)+0.05);else if(o.eun>0)o.eun*=0.9;
     if(o.eun>0.05){o.nob=Math.max(0,o.nob-0.02*o.eun);const strong=o.ruler&&o.ruler.comp>=0.5;
       if(strong){o.cplx=Math.min(1.2,(o.cplx||0.2)+0.01*o.eun);o.eunC=0}
       else if(o.eun>0.5&&r()<0.3*(o.eun-0.3)){o.mandate=Math.max(0,(o.mandate??1)-0.15);o.treas-=0.15;o.shock=(o.shock||0)+0.2;s.eunN=(s.eunN||0)+1;if(o.cmdW)o.cmdW[1]*=1.1;
         if((o.cA||o.cells)>=15&&!o.eunC){o.eunC=1;chron('fall',`In the ${o.full} the ruler's household slaves hold the offices and the purse; ${o.ruler.name} reigns and they rule.`,c,[R_(o)],'Raised to break the great families, they answered to no one once the throne was weak.')}}}
     if(o.mam>0.05){o.nob=Math.max(0,o.nob-0.03*o.mam);
       if(o.mam>0.5&&o.ruler&&o.ruler.comp<0.45&&r()<0.4*(o.mam-0.4)){const old=o.ruler.name,oc=o.core,ne=o.slTopE;succession(o);if(!o.alive)continue;
         o.ruler.comp=Math.max(o.ruler.comp,0.65);o.shock=(o.shock||0)+0.3;o.nob=Math.min(0.95,o.nob+0.25);o.mam=0.3;o.mamRule=s.year;s.mamN=(s.mamN||0)+1;if(o.cmdW)o.cmdW[0]*=1.3;
         // the new rulers are the people the soldiers were taken from: strangers to their subjects, more so of another stock
         let who='';if(ne!=null&&ne>=0&&s.eths[ne]&&ne!==oc){o.core=ne;who=` of the ${s.eths[ne].name}`;const E=s.eths[oc];o.mandate=Math.max(0,(o.mandate??1)-(E&&s.eths[ne].fam===E.fam?0.05:0.15))}
         if((o.cA||o.cells)>=15)chron('fall',`The slave soldiers${who} in the ${o.full} set aside ${old}'s heirs and raise one of their own, ${o.ruler.name}, to the throne.`,c,[R_(o)],'Bought to guard the throne against the great families, they had become the only army that mattered.')}}
     // risings come from the estates. Where slaves are most of the people of a region the state reaches badly (an island, a far
     // province) they can win it: they drive out the masters and it is their country (Haiti). A strong state near at hand puts a
     // rising down with slaughter; a weak one whose people are largely slaves frees them rather than fight
     if(eS>0.08&&((o.hold??0.5)<0.5||o.enemies.size)&&r()<0.6*(eS-0.05)){s.slvRev=(s.slvRev||0)+1;o.shock=(o.shock||0)+0.3;let seed=-1,bs=0;
       for(const i of polCells(id)){if(SL[i]<0.45||i===c)continue;const far=s.dist[i]===65535?3:dd(i)/(o.h||6);if(far*SL[i]>bs){bs=far*SL[i];seed=i}}
       const weak=(o.hold??0.5)<0.4||(o.treas??0)<-0.8;
       if(seed>=0&&bs>0.9){const e=s.slvE[seed],nid=newPolity(seed,o,{kind:'state',origin:{type:'rebellion',from:id,why:'Its slaves rose, drove out their masters and kept the land.'}});s.pol[seed]=nid;
         if(w.szF)grabNear(seed,nid,j=>s.pol[j]===id&&j!==c&&SL[j]>=0.35,1,1.5);
         for(const i of polCells(nid)){if(s.slvE[i]>=0&&s.slvE[i]!==s.eth[i]){const a=s.eth[i];s.eth[i]=s.slvE[i];s.eth2[i]=a;s.mix[i]=1-SL[i]}SL[i]=0;s.slvE[i]=-1;s.integ[i]=0.8;s.s[i]=Math.min(1,s.s[i]+0.2)}
         const d=pols[nid];if(e>=0)d.core=e;s.haitiN=(s.haitiN||0)+1;
         chron('fall',`The slaves of a far province of the ${o.full} rise, drive out their masters and found the ${d.full}.`,seed,[R_(o),R_(d)],'They were most of the people there, and the realm could not reach them in strength.')}
       else if(weak&&o.slvS>0.35){for(const i of polCells(id)){SL[i]=0;s.slvE[i]=-1}o.slC=o.slE=o.slT=0;o.ineq=Math.max(0.2,(o.ineq||0.25)-0.12);o.mandate=Math.min(1,(o.mandate??1)+0.1);s.emanN=(s.emanN||0)+1;
         if((o.cA||o.cells)>=10)chron('culture',`Faced with a rising it cannot put down, the ${o.full} frees its slaves.`,c,[R_(o)])}
       else{for(const i of polCells(id))if(SL[i]>0.2){SL[i]*=weak?0.5:0.6;s.pop[i]*=weak?0.97:0.9}
         if((o.cA||o.cells)>=15)chron('fall',weak?`The slaves of the ${o.full} rise against their masters.`:`The slaves of the ${o.full} rise, and are put down with great slaughter.`,c,[R_(o)],'They were many, and the realm was busy elsewhere.')}}}}}

// (switch wings; Nein 2026-11-11) A settled horde has two wings: the garrisons and court in the farmland, and the people still
// herding in the homeland. Each wing's strength is its solidarity (asabiya), which the model already keeps per province: it wears
// down faster in a conquest dynasty's rich provinces and holds on the steppe (Ibn Khaldun). The court takes on its subjects'
// ways faster the more they outnumber it and the more of them live in cities. Friction is greatest when the wings are of
// comparable size, have grown apart, and the homeland's solidarity runs well above the court's. Then, by conditions: a literate
// court with money and an able ruler keeps the two under separate offices (Liao's northern and southern administrations, the
// Qing banners), at a standing cost; a stronger saddle wing breaks away with a distant homeland (the Six Garrisons, 523; Ariq
// Boke, 1260) or takes a near court; a stronger court finishes becoming its subjects' people and loses its grip on the steppe.
// The older ruling-coalition rule (elitePass in herds.js: o.steppe, o.dual) already lets a torn court rule herders and farmers
// under separate laws; separate offices here is the same institution, so the two share o.dual.
// The frontier men's decision (switch nofront, knob front; Nein 2026-11-12). Each decade a connected stretch of skilled,
// poorly integrated frontier provinces weighs what is open to it. If they judge they can beat what the state can bring
// (judged from its recent record, so they can be wrong) they rise; if far stronger than the state they march on the capital,
// and either sack it and go back to the grass or, under an able leader against a court that has lost its mandate, take the
// throne. If they cannot win and no wall stands in the way they ride out to open grass, to a horde already there or as a new
// one (the Cossack hosts). With no grass in reach and discontent very high they ravage the provinces around them, which
// loosens those too and opens a way out. Walled in, they simmer. (Six Garrisons revolt, Northern Wei, 523.)
const frontOn=()=>!swOn('nofront');
function frontierPass(){const s=S,w=WD,r=s.r,L=s.cavL;if(!L)return;const N_=s.frontN||(s.frontN={rise:0,crushed:0,flee:0,join:0,ravage:0,sack:0,dynasty:0,walled:0}),kf=knob('front');
  const seen=new Set(),nA=w.nbA,nS=w.nbS,grass=j=>w.land[j]&&(w.nomad[j]||w.desert[j]||(s.past&&s.past[j]>0.5))&&s.forest[j]<0.5;
  for(const id of [...s.alive]){const o=s.pols[id];if(!o||!o.alive||o.kind!=='state'||o.cells<8)continue;
    for(const i0 of polCells(id)){if(seen.has(i0)||L[i0]<0.3||s.integ[i0]>=0.4||i0===o.capital)continue;
      const C=[i0];seen.add(i0);for(let k=0;k<C.length;k++){const i=C[k];for(let d=nS[i];d<nS[i+1];d++){const j=nA[d];if(j>=0&&!seen.has(j)&&s.pol[j]===id&&L[j]>=0.3&&s.integ[j]<0.4&&j!==o.capital){seen.add(j);C.push(j)}}}
      let pp=0,sk=0,ig=0,sol=0,wall=0,far=0;for(const i of C){pp+=s.pop[i];sk+=s.pop[i]*L[i];ig+=s.integ[i];sol+=s.s[i];far+=dd(i);if(s.fort[i]>0.5)wall++}
      if(pp<50)continue;sk/=pp;ig/=C.length;sol/=C.length;far/=C.length;const D=1-ig;
      if(!(r()<0.15*kf*D))continue;
      // what they can bring against what the state can bring this far from its capital, as they see it
      const F=Math.pow(0.25*pp+1,P.scaleExp)*(0.3+sol)*(1+1.5*sk),G0=Math.pow(strength(o)+1,P.scaleExp)*(0.3+o.S)*(1+1.5*(o.cav||0))*Math.exp(-far/(o.h||6)),
        seenWeak=1-0.4*Math.min(1,o.shock||0)-(o.raidY!=null&&s.year-o.raidY<10?0.2:0),rho=F/(G0*seenWeak+1),truth=F/(G0+1);
      let out=-1,hordeNb=0;for(const i of C){for(let d=nS[i];d<nS[i+1];d++){const j=nA[d];if(j<0||!grass(j))continue;const q=s.pol[j];if(!q&&s.pop[j]>=0){if(out<0)out=j}else if(q&&q!==id&&s.pols[q].kind==='horde'){hordeNb=q;if(out<0)out=j}}}
      const top=C.reduce((a,i)=>s.pop[i]>s.pop[a]?i:a,C[0]);
      if(rho>1){ // they rise
        if(r()>truth/(1+truth)*1.6){N_.crushed++;for(const i of C){s.pop[i]*=0.95;L[i]*=0.7;s.integ[i]=Math.min(1,s.integ[i]+0.1)}
          if(o.cells>=15)chron('war',`The frontier horsemen of the ${o.full} rise against it and are put down.`,top,[R_(o)],'They thought the state weaker than it was.');continue}
        if(truth>3&&s.pol[o.capital]===id){const cap=o.capital,lead=newRuler(s.eths[s.eth[top]>=0?s.eth[top]:o.core].lang,o);
          if(lead.comp>0.6&&(o.mandate??1)<0.6){N_.dynasty++;o.rulers.push({name:o.ruler.name,base:o.ruler.base,epithet:o.ruler.epithet,from:o.ruler.since,to:s.year,conq:o.ruler.conq,fig:o.ruler.fig,dyn:o.dyn});o.ruler=lead;o.mandate=0.7;o.shock=(o.shock||0)+0.3;for(const i of C)s.integ[i]=Math.max(s.integ[i],0.6);
            chron('state',`The frontier horsemen of the ${o.full} march on the capital, and their leader ${lead.name} takes the throne.`,cap,[R_(o)],'They outmatched the army, the court had lost its standing, and he was able enough to rule what he had taken.');continue}
          N_.sack++;if(typeof sackCity==='function'&&s.city[cap]>=0&&worksOn())sackCity(o,cap,id);else s.pop[cap]*=0.9;o.shock=(o.shock||0)+0.8;o.treas=Math.min(o.treas||0,0);
          chron('war',`The frontier horsemen of the ${o.full} march on the capital, sack it, and ride back to the frontier.`,cap,[R_(o)],'They outmatched the army and wanted plunder, not a throne.')}
        const gr=C.filter(grass).length>C.length/2,nid=newPolity(top,o,{kind:gr?'horde':'state',origin:{type:'rebellion',from:id,why:'frontier'}}),n=s.pols[nid];for(const i of C){s.pol[i]=nid;s.taken[i]=s.year}n.cav=sk;N_.rise++;o.shock=(o.shock||0)+0.3;
        if(o.cells>=15)chron('fall',`The frontier horsemen of the ${o.full} rise and set up for themselves as the ${n.full}.`,top,[R_(o),R_(n)],'They had learned to fight as the raiders do, owed the court little, and judged it could not put them down.');continue}
      if(out>=0&&wall<C.length*0.3){ // they ride out
        const share=0.3;let mv=0;for(const i of C){const m=s.pop[i]*share;s.pop[i]-=m;mv+=m;L[i]*=0.6}
        if(hordeNb&&s.pols[hordeNb].alive){const h=s.pols[hordeNb];s.pop[out]+=mv;h.prest=(h.prest||0)+0.05;h.kin=Math.min(1,(h.kin||0)+0.1);N_.join++;
          if(o.cells>=15)chron('migration',`Frontier horsemen of the ${o.full} ride over to the ${h.full}.`,out,[R_(o),R_(h)],'They owed the court little and could not have beaten it.')}
        else{const e=s.eth[top];if(s.pop[out]<1||s.eth[out]<0)s.eth[out]=e;s.pop[out]+=mv;const nid=newPolity(out,o,{kind:'horde',origin:{type:'rebellion',from:id,why:'frontier flight'}}),n=s.pols[nid];n.cav=sk;n.kin=0.3;N_.flee++;
          if(o.cells>=15)chron('migration',`Frontier horsemen of the ${o.full} ride out beyond the border and raise their own standard as the ${n.full}.`,out,[R_(o),R_(n)],'They owed the court little, could not have beaten it, and no wall stood in their way.')}
        continue}
      if(out<0&&D>0.8){N_.ravage++;for(const i of C)for(let d=nS[i];d<nS[i+1];d++){const j=nA[d];if(j>=0&&s.pol[j]===id&&!seen.has(j)){s.pop[j]*=0.97;s.integ[j]=Math.max(0,s.integ[j]-0.15);if(s.thr)s.thr[j]=Math.min(1,s.thr[j]+0.3);L[j]=Math.max(L[j],0.5*sk)}}
        o.shock=(o.shock||0)+0.1;if(o.cells>=15&&C.length>=3)chron('war',`Frontier horsemen of the ${o.full}, hemmed in, ravage the provinces around them.`,top,[R_(o)],'They wanted out, and there was no open country to ride to.');continue}
      if(wall){N_.walled++;o.shock=(o.shock||0)+0.03}}}}
// Portions (switch noport, knob port; Nein 2026-11-12). Plunder is shared out on the spot; tax flows to the court. So as a
// horde's income turns from plunder to tax, the lesser khans who hold no land of their own stop being paid. A portion is land:
// the khan grants settled country out of his own hand (o.grant), which costs the court revenue and later divides the realm
// among heirs (the Mongol ulus). The unprovided wait on a khan who is good to his vassals; only when he falls short decade
// after decade does their grievance grow. They press for conquest, and in the end ride off. At his death they make demands
// of the heir, or give him grace if the father had been generous.
const portOn=()=>!swOn('noport');
function portionPass(o){const s=S,r=s.r,N=s.portN||(s.portN={grant:0,demand:0,grace:0,split:0}),herd=o.nomP||0,farm=o.farmP||0;
  if(herd<1||!o.ruler){o.griev=0;o.unprov=0;return}
  const gen=(o.ruler.char||0.5)>0.55,g0=o.grant||0,kin=o.kind==='horde'?o.kin||0:1,un=(1-Math.min(1,g0*farm/(herd+1)))*kin;o.unprov=un;
  if(un<=0.1){o.short=0;o.griev=(o.griev||0)*0.7;return}
  if(farm>0&&g0<1&&r()<(gen?0.6:0.25*(o.griev||0)+(o.ruler.greed<0.4?0.2:0))){o.grant=Math.min(1,g0+0.15);o.short=0;o.griev=Math.max(0,(o.griev||0)-0.15);N.grant++;return}
  o.short=(o.short||0)+1;if(!gen||o.short>=3)o.griev=Math.min(1,(o.griev||0)+0.2*knob('port')*un*(gen?0.6:1))}
// at a khan's death the unprovided turn to the heir
function portionHeir(o,R0){const s=S,r=s.r,N=s.portN||(s.portN={grant:0,demand:0,grace:0,split:0}),g=o.griev||0,R=o.ruler;
  if((o.grant||0)>0.5&&o.cells>=30&&r()<0.4*o.grant){N.split++;if(o.cells>=15)chron('state',`On the death of ${R0.name}, the portions he granted become realms of their own: the ${o.full} is divided among his heirs.`,o.capital,[R_(o)],'Most of its settled land had been granted out to lesser khans.');o.grant*=0.5;o.griev=g*0.5;hordeBreakup(o);return}
  if(g<=0.25)return;
  if((R0.char||0.5)>0.55&&r()<0.7){o.griev=g*0.6;o.short=0;N.grace++;return}   // a generous father buys his son time
  N.demand++;
  if((R.char||0.5)>0.45||R.aggr<0.5||(o.farmP||0)<1){o.grant=Math.min(1,(o.grant||0)+0.3);o.griev=g*0.5;o.short=0;
    if(o.cells>=15)chron('state',`The lesser khans of the ${o.full} demand their portions of ${R.name}, and he grants them.`,o.capital,[R_(o)],'They had gone unprovided while the court grew rich on its taxpayers.')}
  else{N.split++;if(o.cells>=15)chron('war',`${R.name} of the ${o.full} refuses the lesser khans their portions, and they ride off with their people.`,o.capital,[R_(o)],'They had gone unprovided while the court grew rich on its taxpayers.');o.griev=g*0.4;hordeBreakup(o)}}
function wingsPass(o,c,y){if(portOn())portionPass(o);const s=S,w=WD,r=s.r,ce=s.eth[c],hw=o.hw||0,sH=o.sH||0,sC=o.sC??o.S,N=s.wingN||(s.wingN={sep:0,secede:0,saddle:0,court:0});
  // a court still on the steppe rules its farmers from the saddle. Once they outnumber its herders it may move among them, the
  // sooner the more it has learned to live off settled people (Northern Wei to Luoyang, 494; the Yuan to Dadu); from then on the
  // court and the homeland drift apart
  if(ce<0||ce===o.core){o.assimT=0;const m=o.mc;
    if((w.nomad[c]||w.desert[c])&&m>=0&&s.pol[m]===o.id&&!(w.nomad[m]||w.desert[m])&&o.farmP>o.nomP&&r()<0.05*(0.3+(o.kin||0))){o.capital=m;N.move=(N.move||0)+1;
      if(o.cells>=15)chron('state',`The ${o.full} moves its court off the steppe to ${s.city[m]>=0&&s.cities[s.city[m]]?s.cities[s.city[m]].name:'the farmland'}, among the people it taxes.`,m,[R_(o)],'Its farmers had come to outnumber its herders, and it had learned to live off them.')}
    return}
  const urb=clamp((o.cityPop||0)/(o.pop+1)*8,0,1);o.assimT+=10*(0.4+1.2*clamp(o.farmP/(o.pop+1),0,1))*(1+0.5*urb)*(o.sep||o.dual?0.4:1);
  const assim=home=>{const old=s.eths[o.core],nw=s.eths[ce];o.core=ce;o.conqDyn=false;o.sep=0;o.mandate=Math.min(1,(o.mandate??1)+0.1);N.court++;
    if(home)for(const i of polCells(o.id))if((w.nomad[i]||w.desert[i])&&s.eth[i]!==ce)s.integ[i]*=0.6;
    if(o.cells>=15)chron('people',`The ruling ${old.name} of the ${o.full} have become ${nw.name} in all but name${home?'; the herders of the old homeland no longer know them':''}.`,c,[R_(o),RE(old),RE(nw)],home?'The court had lived among its subjects for generations and held more men than the homeland.':'The court had lived among its subjects for generations.')};
  if(o.sep){o.treas=(o.treas||0)-0.02;if(o.treas<-0.3||s.recK[c]<0.3)o.sep=0}
  if(hw<0.03){if(o.assimT>=90)assim(false);return}
  // the wings are sized by people: the ruling people's herders against the farmers the court commands
  const hp=o.nomP/(o.nomP+o.farmP+1),fr=(portOn()?0.6*(o.griev||0):0)+knob('wings')*4*hp*(1-hp)*clamp((sH-sC)/0.25,0,1)*clamp(o.assimT/60,0,1)*(o.sep||o.dual?0.4:1);o.wingF=fr;
  if(!(fr>0.3&&r()<0.1*fr)){if(o.assimT>=180)assim(true);return}
  if(!o.sep&&!o.dual&&s.recK[c]>0.5&&(o.treas||0)>0.2&&o.ruler.comp>0.5){o.sep=1;o.dual=1;N.sep++;
    if(o.cells>=15)chron('state',`The ${o.full} sets its herders and its farmers under separate offices, each ruled by its own custom.`,c,[R_(o)],'The court and the homeland had grown apart; a literate court with a full treasury could afford to keep them apart.');return}
  const Ws=sH*(0.5+hp)*(1+0.5*Math.min(1,o.owed||0))*(o.cmdTop===4?1.3:1),Wc=sC*(1.5-hp)*(1+0.4*(o.eun||0)+0.3*clamp(o.treas||0,0,1));
  if(Ws>1.2*Wc){const home=polCells(o.id).filter(i=>(w.nomad[i]||w.desert[i])&&s.eth[i]===o.core&&i!==c);let far=0,best=-1,bp=-1;for(const i of home){far+=dd(i);if(s.pop[i]>bp){bp=s.pop[i];best=i}}
    if(home.length>=3&&far/home.length>0.5*(o.h||6)){const old=o.full,nid=newPolity(best,o,{kind:'horde',origin:{type:'rebellion',from:o.id,why:'saddle'}});for(const i of home){s.pol[i]=nid;s.s[i]=Math.min(1,s.s[i]+0.1)}
      o.shock=(o.shock||0)+0.4;N.secede++;chron('fall',`The herders of the homeland will not serve a court that has forgotten the saddle: they raise their own khan and leave the ${old}.`,best,[R_(o),R_(s.pols[nid])],'The homeland kept its solidarity while the court lost its own, and the homeland lay far from the capital.')}
    else{o.assimT=0;o.sep=0;o.mandate=Math.max(0,(o.mandate??1)-0.2);o.shock=(o.shock||0)+0.3;o.saddleY=y;N.saddle++;for(const i of polCells(o.id))if(!(w.nomad[i]||w.desert[i]))s.integ[i]*=0.8;
      chron('state',`Men of the saddle seize the court of the ${o.full} and undo its settled ways.`,c,[R_(o)],'The homeland kept its solidarity while the court lost its own, and the capital lay within reach.')}}
  else if(Wc>1.2*Ws)assim(true)}
