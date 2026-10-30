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
  o.prep=atWar?o.prep+0.04*(1-o.prep):o.prep-0.006*(o.prep-0.35-0.3*Math.min(1,(o.fortN||0)/10)-(s.year-(o.raidY||-1e9)<10?0.3:0));
  o.prep=clamp(o.prep,0.1,1);
  // mercenaries: money instead of men, when cohesion is low and coin plentiful
  const coin=s.coin[c]>0.5;
  if(atWar&&coin&&o.treas>0.2&&o.S<0.5)o.merc=Math.min(0.8,(o.merc||0)+0.05);else o.merc=(o.merc||0)*0.92;
  if(o.merc>0.01){o.treas-=0.02*o.merc;
    if(o.treas<-0.5&&o.merc>0.3){o.shock+=0.3;o.merc=0;if(o.cells>=15)chron('war',`Unpaid, the mercenaries of the ${o.full} turn on their employers.`,c,[R_(o)],'The treasury could no longer pay the soldiers it had hired.')}}
  // granaries: literate states store grain in good years
  if(s.admin[c]>0.3&&o.press<0.95)o.gran=Math.min(1,(o.gran||0)+0.02*s.admin[c]*(1-(o.gran||0)));
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
  const runners=v('relays')*(1+0.5*s.roads[c]+0.4*Math.min(1,s.horse[c]));
  const rec=clamp(0.75*marks+0.55*objects+0.1*mem+0.3*v('drumscript'),0,1.5);
  const spd=clamp(0.25*marks+0.45*runners+0.35*sound+0.15*Math.min(1,s.horse[c])+0.15*(s.courX?s.courX[c]:0),0,1.5);
  const memo=clamp(0.5*marks+0.6*mem+0.25*objects,0,1.3);
  o.info={rec,spd,memo};o.leg=0.75+0.35*Math.min(1,rec);return o.info}

// ---------- monopolies and holding power ----------
// Conquering a neighbour is easy; holding it is not. A centre holds a province that depends on something it monopolises:
// force (a paid standing army), knowledge (scribes and records), the economy (trade, cities, metals) or the sacred (the god's
// house). Peers with their own walls, scribes and gods break away at the first chance (Renfrew & Cherry 1986; Weber; Innis 1950).
// Empire is not a technique: it is a state that has gathered enough of these to rule other cities directly.
function monopolies(o){const s=S,c=o.capital,info=o.info||infoCap(o),rec=Math.min(1,info.rec);
  // savanna kingdoms held by horsemen rather than scribes (Goody 1971)
  const force=clamp(0.35*rec+0.35*Math.max(s.admin[c],0.7*Math.min(1,s.horse[c]))+0.3*(o.treas>0?Math.min(1,o.treas+0.5):0.2)*(o.prep??0.5)*2,0,1);
  const econ=clamp(0.6*Math.min(1,s.car[c])+1.5*(o.cityPop||0)/(o.pop+1)+0.3*s.coin[c],0,1);
  const R=o.rel>=0?s.rels[o.rel]:null,sacred=Math.max(R&&R.holy!=null&&s.pol[R.holy]===o.id?1:0,s.ritW?clamp((s.ritW[c]-0.3)/0.5,0,1):0);   // the god's house, or an old sanctuary at the capital
  o.mono={force,rec,econ,sacred};o.hold=clamp((force+rec+econ+0.5*sacred)/3.2+0.15*Math.min(1,info.spd),0,1);return o.hold}
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
  for(let t=0;t<120;t++){const i=L[(r()*L.length)|0];if(s.pop[i]<1||s.ritW[i]>0.15)continue;const sd=s.sed?s.sed[i]:0,dens=s.pop[i]/w.area[i];
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
