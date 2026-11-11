/* ---------- technology ---------- */
const TECH=[
 {k:'farm',n:'Farming',era:1},
 {k:'herd',n:'Herding',era:1},
 {k:'irrig',n:'Irrigation',era:1,pre:[0]},
 {k:'copper',n:'Bronze',era:2,pre:[0]},
 {k:'horse',n:'Horse riding',era:2,pre:[1]},
 {k:'sail',n:'Seafaring',era:1},
 {k:'writing',n:'Writing',era:2,pre:[0,3],em:{b:1/5000,pop:1.5e6,cells:2,urb:1}},
 {k:'wheel',n:'Wheel and chariot',era:2,pre:[3],em:{b:1/5000,pop:1e6}},
 {k:'iron',n:'Ironworking',era:3,pre:[3,7,6],em:{b:1/12000,pop:3e6}},
 {k:'coin',n:'Coinage',era:4,pre:[6,8],em:{b:1/3600,pop:4e6}},
 {k:'law',n:'Law codes',era:4,pre:[6],em:{b:1/3200,pop:3e6,cells:15}},
 {k:'roads',n:'Roads',era:4,pre:[],em:{b:1/3200,pop:3e6,cells:15,need:'levy'}},
 {k:'nav',n:'Navigation',era:4,pre:[5,6,8],em:{b:1/3600,pop:2e6,coast:1}},
 {k:'caval',n:'Heavy cavalry',era:5,pre:[4,8,10,9],em:{b:1/5600,pop:3e6,horse:1}},
 {k:'paper',n:'Paper',era:5,pre:[9,10,11],em:{b:1/5600,pop:6e6}},
 {k:'crops',n:'Crop rotation',era:5,pre:[8,10,11],em:{b:1/6400,pop:4e6}},
 {k:'gun',n:'Gunpowder',era:6,pre:[14,13],em:{b:1/8000,pop:12e6}},
 {k:'ocean',n:'Ocean navigation',era:7,pre:[12,14,15],em:{b:1/7000,pop:5e6,coast:1}},
 {k:'camel',n:'Camels',era:2,pre:[1]},
 {k:'grain',n:'Grain crops',era:1,pre:[0]},
 {k:'ard',n:'Scratch plough',era:2,pre:[0,1],pos:[0.5,0.3]},
 {k:'plough',n:'Heavy plough',era:5,pre:[20,8],em:{b:1/5200,pop:1.5e6,press:1,heavy:1},pos:[0.6,0.6]},
 {k:'manure',n:'Intensive manuring',era:3,pre:[0,1],em:{b:1/3000,pop:5e5,press:1},pos:[0.8,-0.2]},
 {k:'xcrops',n:'Crops from across the ocean',era:7,pre:[0]},
 {k:'kitesig',n:'Kite signalling',era:4,pre:[6,5],em:{b:1/16000,pop:2e6},pos:[0.5,-0.3],synth:1,d:'Signal kites relay orders along frontiers: administrative reach +15%.'},
 {k:'windcart',n:'Wind wagons',era:5,pre:[7,12],em:{b:1/16000,pop:2e6},pos:[-0.3,0.9],synth:1,d:'Sail-driven carts cross flat deserts and steppe: they open caravan routes like camels do.'},
 {k:'fungal',n:'Forest fungal gardens',era:3,pre:[0,22],em:{b:1/14000,pop:3e5,press:1},pos:[0.9,-0.8],synth:1,d:'Cultivated fungi on forest litter: +40% food in forest and leached soils.'},
 {k:'ledger',n:'Clockwork ledgers',era:5,pre:[14,9],em:{b:1/16000,pop:4e6},pos:[-0.7,0.6],synth:1,d:'Geared tallying engines for the treasury: +10% tax, slower-growing upkeep.'},
 {k:'tidemill',n:'Tide mills',era:4,pre:[8,12],em:{b:1/14000,pop:1.5e6,coast:1},pos:[0,0.95],synth:1,d:'Tidal water power for milling and forges: +15% food on coasts.'},
 {k:'feverbark',n:'Fever-bark medicine',era:4,pre:[6,15],em:{b:1/14000,pop:2e6},pos:[0.6,-0.4],synth:1,d:'A bark remedy for marsh fevers: halves the malaria burden, plague deaths -20%.'},
 {k:'saltflush',n:'Salt-flushing canals',era:4,pre:[2,10],em:{b:1/12000,pop:1e6,press:1},pos:[0.7,0.3],synth:1,d:'Drainage that rinses salt from irrigated fields: reverses salinization.'},
 {k:'pigeon',n:'Courier birds',era:3,pre:[6,1],em:{b:1/14000,pop:8e5},pos:[-0.2,-0.6],synth:1,d:'Trained birds carry messages: reach +10% and faster spread of ideas.'},
 {k:'watermill',n:'Water mills',era:5,pre:[8,7],em:{b:1/6000,pop:2e6},d:'Water wheels grind grain and drive hammers: more food along rivers.'},
 {k:'windmill',n:'Windmills',era:6,pre:[32],em:{b:1/7000,pop:3e6},d:'Wind turns millstones where rivers are scarce: more food in windy, dry lands.'},
 {k:'chuno',n:'Freeze-dried potatoes',era:2,pre:[0],d:'Potatoes frozen at night and dried in the sun keep for years: they can be stored in state warehouses and taxed like grain.'},
 {k:'terrace',n:'Terraces and raised fields',era:2,pre:[0],d:'Stone-walled terraces on hillsides, raised and drained beds in wetlands: hand labour turns poor ground into intensive fields, without ploughs or draft animals.'},
 {k:'nixtamal',n:'Lime-soaked maize',era:2,pre:[0],d:'Cooking maize with lime frees its niacin and protein: maize farmers eat better and grow more.'},
 // communication: five media (marks, sound and light, objects, memory specialists, runners), each strong in records, speed or memory
 {k:'griots',n:'Court remembrancers',era:1,pre:[],em:{b:1/2500,pop:1.2e5,need:'noScript'},pos:[-0.4,-0.4],medium:'memory',d:'Professional keepers of genealogies, law and history, like the griots of Mali: a dynasty\'s memory without writing.'},
 {k:'drums',n:'Talking drums',era:2,pre:[],em:{b:1/3000,pop:1e5,need:'drums'},pos:[-0.2,-0.3],medium:'sound',d:'Drums that speak the tones and rhythms of the language: messages cross forest and hills faster than a runner.'},
 {k:'beacons',n:'Beacon chains',era:2,pre:[],em:{b:1/3500,pop:3e5,need:'threat'},pos:[0.3,0.2],medium:'sound',d:'Fire by night and smoke by day, relayed from hill to hill: warning of raids and revolts within hours.'},
 {k:'khipu',n:'Knotted-cord records',era:2,pre:[0],em:{b:1/3000,pop:3e5,cells:3,need:'noScript'},pos:[-0.3,0.1],medium:'objects',d:'Accounts, census and tribute kept in knotted cords, like the Inca khipu: records without a script.'},
 {k:'relays',n:'Relay posts',era:3,pre:[],em:{b:1/3500,pop:8e5,cells:20},pos:[0,0.5],medium:'runners',d:'Runners or riders posted in stages along the roads, like the Inca chasqui and the Persian post: orders cross the realm in days.'},
 {k:'alphabet',n:'Alphabet',era:3,pre:[6],em:{b:1/6000,pop:2e5,need:'trade'},pos:[-0.3,0.3],medium:'marks',d:'A few dozen signs for sounds instead of hundreds for words: reading and writing escape the scribal class.'},
 {k:'printing',n:'Printing',era:6,pre:[14,3],em:{b:1/8000,pop:5e6},pos:[-0.2,0.7],medium:'marks',d:'Carved blocks or movable type multiply texts: books, notices and dissent spread beyond any court.'},
 {k:'drumscript',n:'Drum notation',era:4,pre:[6,14],em:{b:1/9000,pop:6e5,need:'hasDrums'},pos:[-0.1,0.2],synth:1,medium:'sound',d:'Drum language written down on paper: messages both fast and kept. Speed of sound with the records of a script.'},
];
// positions of the real techniques in the need/energy space (see techFit)
[[0.6,-0.6],[0.2,-0.5],[0.7,0.2],[0.1,0.5],[-0.2,0.4],[0.3,0.1],[-0.4,0],[0,0.5],[0.3,0.7],[-0.6,0.2],[-0.5,-0.1],[-0.4,0.5],[0,0.4],[0.2,0.8],[-0.6,-0.1],[0.7,0.1],[0.2,0.9],[-0.2,0.8],[0.3,-0.3],[0.5,-0.5]].forEach((p,k)=>{if(!TECH[k].pos)TECH[k].pos=p});
const TI={};TECH.forEach((t,k)=>TI[t.k]=k);
const REC_TK=new Set([TI.writing,TI.khipu,TI.griots]);
const SYNTH0=TECH.findIndex(t=>t.synth);
// who carries each institution: 1 writing (court, then merchants' accounts), 2 merchants (coins, the alphabet),
// 3 the court alone (law, roads, relays, cord records), 4 anyone who reads (paper, printing)
const CARRY=TECH.map(t=>({writing:1,coin:2,alphabet:2,law:3,roads:3,relays:3,khipu:3,paper:4,printing:4,ledger:3})[t.k]||0);
const ERAS=['Foraging','Neolithic','Bronze Age','Iron Age','Classical','Medieval','Gunpowder age','Age of Sail'];
function eraOf(i){
  const t=S.tk,v=k=>t[k][i]>0.5;
  if(v(17))return 7;if(v(16))return 6;
  if((v(13)+v(14)+v(15))>=2)return 5;
  if(v(8)&&(v(9)||v(10)))return 4;
  if(v(8))return 3;if(v(3))return 2;
  if((v(0)&&WD.sF[i]>0.1)||(v(1)&&WD.sH[i]>0.1))return 1;
  return 0;
}

/* ---------- history state ---------- */
let WD=null,S=null;
function newEth(par,par2,lang){
  const s=S,r=s.r,id=s.eths.length,p=par>=0?s.eths[par]:null,p2=par2>=0&&par2!=null?s.eths[par2]:null;
  if(!lang)lang=p2?hybridLang(p.lang,p2.lang,r):p?childLang(p.lang,r):null;
  const cult=new Float32Array(6);for(let k=0;k<6;k++)cult[k]=p?clamp((p2?(p.cult[k]+p2.cult[k])/2:p.cult[k])+gauss(r)*0.12,0,1):r();
  let hue,sat,lit;
  if(p){hue=p2?(p.hue+p2.hue)/2+gauss(r)*10:p.hue+gauss(r)*16;sat=clamp(p.sat+gauss(r)*0.05,0.32,0.72);lit=clamp(p.lit+gauss(r)*0.06,0.36,0.68)}
  else{hue=(s.famN*137.508+20)%360;sat=0.55;lit=0.52;s.famN++}
  const e={id,name:lang.lex.people,lang,cult,fam:p?p.fam:id,parent:p?par:-1,parent2:p2?par2:-1,depth:p?p.depth+1:0,born:s.year,hue,sat,lit,rgb:hsl(hue,sat,lit),alive:true,cells:0,pop:0,peak:0,lon:0,la:0,kids:[]};
  if(p)p.kids.push(id);if(p2)p2.kids.push(id);
  inheritPast(e,p,p2);inheritRide(e,p,p2);inheritTrad(e,p,p2);
  s.eths.push(e);return id;
}
function ethDist(a,b){
  if(a===b)return 0;if(a<0||b<0)return 1;const A=S.eths[a].cult,B=S.eths[b].cult;let d=0;
  for(let k=0;k<6;k++){const t=A[k]-B[k];d+=t*t}
  d=Math.sqrt(d/6)*1.6;if(S.eths[a].fam!==S.eths[b].fam)d+=0.35;return d>1?1:d;
}
const R_=o=>['pol',o.id,o.full],RB=o=>['pol',o.id,o.base],RE=e=>['eth',e.id,e.name],RF=f=>['fig',f.id,f.name],RR=x=>['rel',x.id,x.name],RW=w=>['war',w.id,w.name],RPl=o=>['plague',o.id,o.name],RM=m=>['mig',m.id,m.name];
function chron(t,txt,cell,refs,why){S.chron.push({y:S.year,t,txt,cell:cell==null?-1:cell,refs:refs||[],why:why||null});if(S.chron.length>30000)S.chron.splice(0,4000)}
function spot(txt,cell,refs){S.spot.push({y:S.year,txt,cell,refs:refs||[]});if(S.spot.length>60)S.spot.shift()}
function angDist(a,b){const w=WD;return Math.acos(clamp(w.x3[a]*w.x3[b]+w.y3[a]*w.y3[b]+w.z3[a]*w.z3[b],-1,1))}
// every unit within rad 100 km cells of unit c (a square; sea too), with its offset from c in cells: on the grid each cell around;
// on provinces each unit whose middle lies in a cell around c's home cell, at its true offset
function ring(c,rad,f){const w=WD;
  if(!w.hbS){const cx=w.cxA[c],cy=w.cyA[c];for(let dy=-rad;dy<=rad;dy++){const y=cy+dy;if(y<0||y>=H)continue;for(let dx=-rad;dx<=rad;dx++)f(y*W+(cx+dx+W)%W,dx,dy)}return}
  const cx=w.hx[c],cy=w.hy[c],S=w.hbS,A=w.hbA,x0=w.cxA[c],y0=w.cyA[c];
  for(let dy=-rad;dy<=rad;dy++){const y=cy+dy;if(y<0||y>=H)continue;for(let dx=-rad;dx<=rad;dx++){const b=y*W+(cx+dx+W)%W;
    for(let q=S[b];q<S[b+1];q++){const j=A[q];let ox=w.cxA[j]-x0;if(ox>W/2)ox-=W;if(ox<-W/2)ox+=W;f(j,ox,w.cyA[j]-y0)}}}}
function seedTech(f,c,v,rad){const w=WD;ring(c,rad,(j,dx,dy)=>{if(w.land[j])f[j]=Math.max(f[j],v*(dx||dy?0.85:1))})}
function nearestPeopled(c,maxR,test){
  const w=WD,s=S;let best=-1,bd=1e9;
  ring(c,maxR,(j,dx,dy)=>{if(!w.land[j]||s.pop[j]<1||(test&&!test(j)))return;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=j}});
  return best;
}
// the unit at a point given in 100 km cells (fractions count)
function uAtF(x,y){if(y<0||y>=H)return -1;const w=WD;if(!w.uid)return Math.floor(y)*W+((Math.floor(x)%W)+W)%W;
  return w.uid[Math.min(HH-1,Math.floor(y*SC))*HW+((Math.floor(x*SC)%HW)+HW)%HW]}
function dirWord(dx,dy){const a=Math.atan2(-dy,dx)*180/Math.PI;const k=Math.round(((a+360)%360)/45)%8;return['east','north-east','north','north-west','west','south-west','south','south-east'][k]}
// a neighbour picked at random (on the grid one of the four sides, an edge of the map counting as none)
function rndNb(i,x){const w=WD,a=w.nbS[i],n=w.nbS[i+1]-a;return n>0?w.nbA[a+((x*n)|0)]:-1}
let NJ_=new Int32Array(64),NC_=new Float64Array(64);
function dxWrap(a,b){let d=WD.cxA[b]-WD.cxA[a];if(d>W/2)d-=W;if(d<-W/2)d+=W;return d}
const EARTH_HEARTHS=[
 {kind:'farm',lat:36.5,lon:40,y:-9000,crop:'wheat and barley',anim:'sheep and goats',grain:1,pk:'wheat'},
 {kind:'farm',lat:30.5,lon:112,y:-7500,crop:'rice',anim:'pigs',grain:1,pk:'rice'},
 {kind:'farm',lat:35,lon:109,y:-7000,crop:'millet',anim:'pigs and dogs',grain:1,pk:'millet'},
 {kind:'farm',lat:-6,lon:145,y:-7000,crop:'taro and bananas',anim:'pigs',grain:0,pk:'yams'},
 {kind:'farm',lat:18,lon:-97,y:-5000,crop:'maize, beans and squash',anim:'turkeys and dogs',grain:1,pk:'maize'},
 {kind:'farm',lat:-13,lon:-72,y:-5000,crop:'potatoes and quinoa',anim:'llamas and guinea pigs',grain:0.6,pk:'potato'},
 {kind:'farm',lat:14,lon:2,y:-3000,crop:'sorghum and pearl millet',anim:'cattle',grain:1,pk:'sorghum'},
 {kind:'farm',lat:7.5,lon:-1,y:-2500,crop:'yams and oil palm',anim:'goats',grain:0,pk:'yams'},
 {kind:'farm',lat:37,lon:-88,y:-2500,crop:'sunflowers and squash',anim:'dogs',grain:0.6,pk:'sunflower'},
 {kind:'copper',lat:39,lon:35,y:-4700},
 {kind:'copper',lat:36,lon:104,y:-2600},
 {kind:'copper',lat:-14,lon:-72,y:-1200},
 {kind:'iron',lat:9.5,lon:8,y:-700},
 {kind:'sail',lat:37,lon:25,y:-3500},
 {kind:'sail',lat:23.5,lon:120.5,y:-3000},
 {kind:'ard',lat:33,lon:44,y:-4300},
];
// when the first people reached the land each founding stock peoples, where it is recent: the Americas' game had met human hunters
// only a few thousand years before 12,000 BCE (Monte Verde about 14,500 years ago; Dillehay et al. 2015); everywhere else, tens
// of thousands (the naive-fauna hunting in herds.js, switch wildanim)
const SEED_ARRIVE={nam:-14000,sam:-13000};
const EARTH_SEEDS=[[5,25,'afr'],[33,40,'afro'],[48,10,'ie'],[22,78,'indo'],[35,110,'sino'],[5,105,'aus'],[-25,134,'pama'],[60,100,'alt'],[40,-100,'nam'],[-10,-60,'sam']];

function newHistory(hseed){
  const w=WD,r=mulberry32(hashStr('hist:'+hseed+':'+w.seed));
  if(w.rv0){w.rv.set(w.rv0);w.rvF.set(w.rvF0)}
  seaReset(P.startYear);
  if(typeof TECH_BASE!=='undefined'&&TECH_BASE)TECH.length=TECH_BASE;
  const tk=TECH.map(()=>new Float32Array(N));
  // nature (climate noise, dry epochs, eruptions) draws from its own stream, a fixed number of draws a year, so two versions of
  // the model run with the same seed meet the same droughts and eruptions and can be compared history by history
  S={r,rN:mulberry32(hashStr('nature:'+hseed+':'+w.seed)),seed:hseed,year:P.startYear,start:P.startYear,famN:0,tk,
    pop:new Float32Array(N),K:new Float32Array(N),evT:new Float32Array(N),evP:new Float32Array(N).fill(1),seaLvl:WD.seaLvl??0,seaVer:0,eth:new Int32Array(N).fill(-1),eth2:new Int32Array(N).fill(-1),mix:new Float32Array(N),mixT:new Uint8Array(N),
    pol:new Int32Array(N),s:new Float32Array(N).fill(0.3),rel:new Int32Array(N).fill(-1),fort:new Float32Array(N),
    fert:new Float32Array(N).fill(1),immune:new Float32Array(N),infect:new Uint8Array(N),ob:new Int32Array(N).fill(-1),
    dist:new Uint16Array(N).fill(65535),taken:new Int32Array(N).fill(-1e9),q:new Int32Array(N),lab:new Int32Array(N),city:new Int32Array(N).fill(-1),
    AG:new Float32Array(AGW*AGH),anom:new Float32Array(N),wm:new Float32Array(N).fill(1),dT:0,dTt:0,gT:0,epoch:null,dry:null,orbM:0,orb0:0,
    eths:[],pols:[null],alive:[],chron:[],outbreaks:[],inf:[],stats:[],hearths:[],figs:[],rels:[],wars:[],activeWars:[],cities:[],migs:[],activeMigs:[],press:new Map(),
    spot:[],famTitle:{},isleName:{},isleBy:{},lmPop:new Float64Array(w.lmCount),fallen:[],darkWatch:[],epochs:[],
    firstTech:new Array(TECH.length).fill(null),lmFound:new Uint8Array(w.lmCount),regionFirst:{},medBest:{share:0,y:null,pol:0},chinaHist:[],medHist:[],farmCheck:null};
  const s=S;
  s.farm=tk[0];s.herd=tk[1];s.irrig=tk[2];s.metal=tk[3];s.horse=tk[4];s.sail=tk[5];s.admin=tk[6];s.wheel=tk[7];s.iron=tk[8];s.coin=tk[9];s.law=tk[10];s.roads=tk[11];s.nav=tk[12];s.caval=tk[13];s.paper=tk[14];s.crops=tk[15];s.gun=tk[16];s.ocean=tk[17];s.camel=tk[18];s.grain=tk[19];s.ard=tk[20];s.plough=tk[21];s.manure=tk[22];s.xcrops=tk[23];s.integ=new Float32Array(N);s.uni=new Float32Array(N);s.uniFam=new Int32Array(N).fill(-1);
  prepEco(w);Object.assign(s,{forest:Float32Array.from(w.forest0),salt:new Float32Array(N),adapt:new Float32Array(N),dp:new Float32Array(N),car:new Float32Array(N),exit:new Float32Array(N),Kpot:new Float32Array(N),stx:new Float32Array(N),circE:Float32Array.from(w.circ),rp:new Float32Array(N),routes:[],carPairs:new Set(),cropX:new Set(),bfsPar:new Int32Array(N),bfsD:new Int16Array(N),bfsMark:new Int32Array(N),bfsStamp:0});
  for(const i of w.landIdx)s.adapt[i]=w.mal[i]*0.5;
  s.orb0=w.isEarth?null:(r()*23000);
  cropsInit();originsInit();landUseInit();herdInit();climInit();techMatrixInit();societyInit();
  for(const i of w.coastIdx)s.sail[i]=0.05;
  for(let k=0;k<s.AG.length;k++)s.AG[k]=gauss(r);
  climateStep();computeK();
  const seeds=[],macs=[],keys=[];
  if(w.isEarth){
    const pool=MACRO_KEYS.slice();for(let i=pool.length-1;i>0;i--){const j=(r()*(i+1))|0;[pool[i],pool[j]]=[pool[j],pool[i]]}
    EARTH_SEEDS.forEach(([la,lo,mac],k)=>{let c=cellAt(la,lo);if(!w.land[c]){for(let kk=1;kk<15&&!w.land[c];kk++)c=cellAt(la,lo+kk*0.9)}if(w.land[c]){seeds.push(c);macs.push(P.shuffleNames?pool[k%pool.length]:mac);keys.push(mac)}})}
  else{let sep=0.38;
    for(let t=0;t<20000&&seeds.length<P.bands;t++){if(t%4000===3999)sep*=0.7;
      const i=rLand(r);if(w.T[i]<4||w.Pr[i]<350||w.lmSize[w.lm[i]]<20)continue;
      if(seeds.every(j=>angDist(i,j)>sep)){seeds.push(i);macs.push(MACRO_KEYS[(seeds.length-1+((r()*MACRO_KEYS.length)|0))%MACRO_KEYS.length])}}}
  const q=s.q;let h=0,t=0;
  seeds.forEach((i,k)=>{const mac=macs[k];s.eth[i]=newEth(-1,-1,makeLang(r,pick(r,MACROS[mac]),mac));if(keys[k]&&SEED_ARRIVE[keys[k]]!=null)s.eths[s.eth[i]].arrive=SEED_ARRIVE[keys[k]];q[t++]=i});
  while(h<t){const i=q[h++];
    const iced=j=>w.iceY&&w.iceY[j]>s.start;for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&w.land[j]&&s.eth[j]<0&&w.T[j]>-9&&!iced(j)){s.eth[j]=s.eth[i];q[t++]=j}}
    if(w.coast[i]){ring(i,3,j=>{if(w.land[j]&&s.eth[j]<0&&w.T[j]>-9&&!iced(j)){s.eth[j]=s.eth[i];q[t++]=j}})}
  }
  for(const i of w.landIdx)if(s.eth[i]>=0){s.pop[i]=s.K[i]*0.55;s.lmFound[w.lm[i]]=1}
  for(let k=0;k<10;k++)ethPass(false);
  if(w.isEarth&&P.hearthMode!=='random'){
    for(const hh of EARTH_HEARTHS){if(hh.y<s.start||(hh.kind==='farm'&&P.hearthMode==='emergent'))continue;s.hearths.push(Object.assign({},hh,{cell:cellAt(hh.lat,hh.lon),year:hh.y,done:false,fixed:true}))}
  }else{
    const cand=[];for(const i of w.landIdx)if(w.sF[i]>0.45&&w.lmSize[w.lm[i]]>40)cand.push(i);
    const hs=[];
    for(let t2=0;t2<4000&&hs.length<P.hearths&&cand.length;t2++){const i=cand[(r()*cand.length)|0];if(r()>w.sF[i]*(0.6+0.4*w.rv[i]))continue;if(hs.every(j=>angDist(i,j)>0.32))hs.push(i)}
    hs.forEach((c,k)=>s.hearths.push({kind:'farm',cell:c,year:s.start+(k===0?200+r()*900:400+r()*5500)|0,done:false}));
    s.hearths.push({kind:'sail',year:s.start+1500+r()*3000|0,done:false});
    s.hearths.push({kind:'copper',year:s.start+3800+r()*1800|0,done:false});
    s.hearths.push({kind:'ard',year:s.start+4300+r()*1500|0,done:false});
  }
  chron('nature',`Foragers of ${seeds.length} unrelated stocks people the habitable world.`,seeds[0]);
  recordStats();
}

/* ---------- the ancient Earth: rising seas, retreating ice, abrupt climate shifts ---------- */
// The world is generated at the low sea level of 12,000 BCE; each history first drowns what was already under water at its
// start year, then drowns the shelves as the sea rises (Doggerland, the Gulf, Sundaland, Beringia, the Torres Strait).
function seaReset(y){const w=WD;if(!w.land0)return;w.land.set(w.land0);const lv=w.isEarth?seaLevelAt(y):0;
  for(let i=0;i<N;i++)if(w.land[i]&&w.lvl[i]<=lv)w.land[i]=0;shoreline(w);seaLanes(w);w.seaLvl=lv}
function seaStep(){const s=S,w=WD,lv=seaLevelAt(s.year);if(lv<=s.seaLvl+0.01)return;s.seaLvl=w.seaLvl=lv;
  const gone=[];for(const i of w.landIdx)if(w.lvl[i]<=lv)gone.push(i);if(!gone.length)return;
  const lm0=w.lm.slice();let moved=0,where=-1,wp=0,nm=null;
  for(const i of gone){const p=s.pop[i];if(p>wp&&s.eth[i]>=0){wp=p;where=i;nm=regionName(i)}
    w.land[i]=0;let best=-1,bk=-1;for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&w.land[j]&&w.lvl[j]>lv&&s.K[j]>bk){bk=s.K[j];best=j}}
    if(best>=0&&p>0){s.pop[best]+=p;moved+=p;if(s.eth[best]<0)s.eth[best]=s.eth[i];else mixIn(best,s.eth[i],p/(s.pop[best]+1)*0.6)}
    const pid=s.pol[i];s.pop[i]=0;s.eth[i]=-1;s.eth2[i]=-1;s.rel[i]=-1;s.pol[i]=0;s.K[i]=0;
    if(pid&&s.pols[pid]&&s.pols[pid].capital===i){const o=s.pols[pid];let c=-1;if(best>=0&&s.pol[best]===pid)c=best;else for(const j of w.landIdx)if(s.pol[j]===pid&&w.land[j]){c=j;break}if(c>=0)o.capital=c}}
  shoreline(w);seaLanes(w);s.seaVer++;
  const lf=new Uint8Array(w.lmCount);for(const i of w.landIdx)if(s.pop[i]>=1)lf[w.lm[i]]=1;s.lmPop=new Float64Array(w.lmCount);s.lmFound=lf;
  // a land bridge cut: two sizeable lands now where there was one
  const rep=new Map();for(const i of w.landIdx){const m=w.lm[i];if(w.lmSize[m]>=40&&!rep.has(m))rep.set(m,i)}
  const byOld=new Map();for(const [m,i] of rep){const o=lm0[i];if(!byOld.has(o))byOld.set(o,[]);byOld.get(o).push(m)}
  let split=false;
  // the shores facing each other across the new strait: a drowned province touching the smaller land, and the nearest
  // drowned province touching the larger one
  const shore=(g,m)=>{for(let d=w.nbS[g];d<w.nbS[g+1];d++){const j=w.nbA[d];if(j>=0&&w.land[j]&&w.lm[j]===m)return j}return -1};
  for(const ms of byOld.values()){if(ms.length<2)continue;ms.sort((a,b)=>w.lmSize[a]-w.lmSize[b]);const m=ms[0],M=ms[ms.length-1];
    const As=[],Bs=[];for(const g of gone){const j=shore(g,m),k=shore(g,M);if(j>=0)As.push([g,j]);if(k>=0)Bs.push([g,k])}if(!As.length)continue;
    let a=As[0][1],b=-1,bd=1e9;for(const [ga,ja] of As)for(const [gb,jb] of Bs){const d=angDist(ga,gb)-(s.pop[ja]>0?0.01:0);if(d<bd){bd=d;a=ja;b=jb}}
    split=true;const isle=w.lmSize[m]<w.lmSize[M]*0.25;
    chron('nature',isle?`The rising sea cuts the ${regionName(a)} off from the mainland. It is an island now, and only boats can cross.`:`The rising sea drowns the land bridge between the ${regionName(a)} and the ${b>=0?regionName(b):'far shore'}: what was one land is now two, and only boats can cross.`,a)}
  if(!split&&gone.length>=3&&moved>2000&&nm)chron('nature',`The sea rises over the lowlands of the ${nm}; about ${Math.round(moved/1000)*1000} people move to higher ground.`,where)}
// abrupt shifts of the real deglaciation and Holocene (Alley 2000; Alley & Agustsdottir 2005; Weiss 2016): the Younger Dryas
// chill around the North Atlantic with drought in the Levant, the 8.2 ka chill, and the 4.2 ka drought from the Nile to the Indus
const EARTH_EVENTS=[
  {k:'yd',a:-10900,b:-9650,up:150,dn:60,na:4,g:0.8,box:[25,42,25,65],dry:0.8,
    start:'Within a lifetime the cold returns to the northern lands: forests give way to steppe, and the rains fail in the south.',end:'The great cold breaks within a generation; the world warms quickly and the rains come back.'},
  {k:'e82',a:-6250,b:-6100,up:20,dn:40,na:1.5,g:0.2,box:[15,40,-15,65],dry:0.85,
    start:'A sharp chill and drought settle on the northern lands and the dry lands from the Nile to Persia.',end:'The chill of a long century passes.'},
  {k:'e42',a:-2250,b:-1950,up:40,dn:60,na:0,g:0,box:[20,40,25,80],dry:0.7,
    start:'A great drought settles over the lands from the Nile to the Indus; canals run low and the rain-fed plains fail.',end:'The long drought from the Nile to the Indus ends.'}];
function eventPass(){const s=S,w=WD,y=s.year;let any=false;s.evT.fill(0);s.evP.fill(1);
  for(const e of EARTH_EVENTS){if(y<e.a-1||y>e.b+e.dn)continue;
    if(y>=e.a&&!s['ev_'+e.k]){s['ev_'+e.k]=1;chron('nature',e.start,-1)}
    if(y>=e.b&&s['ev_'+e.k]===1){s['ev_'+e.k]=2;chron('nature',e.end,-1)}
    const f=y<e.a?0:Math.min(1,(y-e.a)/e.up,y<=e.b?1:Math.max(0,1-(y-e.b)/e.dn));if(f<=0)continue;any=true;
    const [la0,la1,lo0,lo1]=e.box;
    for(const i of w.landIdx){const la=w.lat[i]*57.2958,lo=(w.cxA[i]+0.5)/W*360-180;
      const na=clamp((la-30)/15,0,1)*clamp((lo+110)/20,0,1)*clamp((70-lo)/20,0,1);s.evT[i]-=f*(e.g+e.na*na);
      if(la>=la0&&la<=la1&&lo>=lo0&&lo<=lo1)s.evP[i]*=1-f*(1-e.dry)}}
  return any}

// The African and Asian humid period (deMenocal et al. 2000; Shanahan et al. 2015; Fleitmann et al. 2007; Kuper & Kropelin
// 2006): stronger summer sun drove the monsoons far north. Lakes and grass covered the Sahara, Arabia had lakes, the Thar
// was green. Our coarse climate model shifts its rain belt instead of widening it, so on Earth the reconstructed signal is
// added to its rain change until the model can make it itself. The rains failed between about 6500 and 1800 BCE, earliest in
// Arabia and latest in the Indus lands, and the herders of the drying lands crowded onto the Nile, the Euphrates and the Sahel.
const HUMID=[
  // [name, lat0, lat1, lon0, lon1, extra rain (mm), decline starts, gone by]
  ['the Sahara',11,27,-18,38,320,-5000,-3300],['Arabia',13,30,38,60,200,-6500,-4500],['the Near East',29,38,34,50,70,-4500,-3000],
  ['the Thar and the Indus lands',22,31,66,78,150,-3500,-1800],['the East African lakes',-3,12,30,45,120,-5000,-3000]];
function humidFrac(y,a,b){if(y<-9900)return 0;const on=Math.min(1,(y+9900)/400);return on*(y<=a?1:y>=b?0:1-(y-a)/(b-a))}
function humidRain(i,y){const w=WD,la=w.lat[i]*57.2958,lo=(w.cxA[i]+0.5)/W*360-180;let d=0;
  for(const [nm,a,b,c,e,amp,t0,t1] of HUMID){
    // water step (default since run 81): the Sahara dried from the north and east first and the south last (Kuper & Kropelin 2006; Shanahan et al. 2015):
    // the eastern desert from about 5500 BCE, the Chad basin and the southern edge not until about 3000-2500 BCE
    const sw=nm==='the Sahara',s0=sw?clamp(-5300+110*(25-la)-12*(lo-10),-6000,-3600):t0,s1=sw?s0+1300:t1;
    const f=humidFrac(y,s0,s1);
    // and the monsoon's gain reached south of the desert too, over the Sahel and the Chari and upper Nile catchments that fed Lake
    // Mega-Chad and the Nile floods (rising from the equatorial forest edge to its full strength by 14 N, fading north of 24 N)
    if(sw){if(f<=0)continue;const m=clamp((la-4)/10,0,1)*clamp((30-la)/6,0,1)*clamp(Math.min(lo-c,e-lo)/4,0,1);if(m>0)d=Math.max(d,amp*1.1*f*m);continue}if(f<=0)continue;
    const m=clamp(Math.min(la-a,b-la)/3,0,1)*clamp(Math.min(lo-c,e-lo)/4,0,1);if(m>0)d=Math.max(d,amp*f*m)}return d}
// every fifty years on Earth: the humid period's rain is laid on the climate model's own change, and land and vegetation follow
function humidStep(){const s=S,w=WD,y=s.year;if(!w.isEarth||!s.cdP0)return;if(y<-10000||y>-1700)return;
  for(const i of w.landIdx)s.cdP[i]=s.cdP0[i]+humidRain(i,y);if(typeof climateSuit==='function'&&s.pkAv)climateSuit();vegPass();w.exQ=null;
  for(const H of HUMID){const k='hum_'+H[0];if(y>=H[6]&&!s[k]){s[k]=1;chron('nature',`The summer rains begin to fail in ${H[0]}. Lakes shrink, grass gives way to sand, and herders drift toward the rivers.`,-1)}
    if(y>=H[7]&&s[k]===1){s[k]=2;chron('nature',`The desert has returned to ${H[0]}. Those who stayed now live by the rivers, the oases and the wells.`,-1)}}
  if(y>=-9600&&!s.hum_on){s.hum_on=1;chron('nature','Summer rains reach deep into the deserts: lakes fill across the Sahara and Arabia, and grass and herds follow.',-1)}}

/* ---------- climate through time ---------- */
const EPOCH_KINDS=[
 {k:'cold',w:0.5,amp:[-1.3,-0.7],dur:[150,380],start:'A long cold epoch sets in: growing seasons shorten and the northern edge of farming retreats.',end:'The long cold epoch eases.'},
 {k:'warm',w:0.3,amp:[0.5,0.9],dur:[150,320],start:'A warm epoch begins: harvests improve in the north and farming creeps toward the poles.',end:'The warm epoch fades.'},
 {k:'dry',w:0.2,amp:[-1.6,-1.0],dur:[80,250],start:'A great drought settles over the',end:'Rain returns to the'},
];
function climateStep(){
  const s=S,r=s.rN||s.r,y=s.year;
  s.gT+=-s.gT/150+0.35*Math.sqrt(2/150)*gauss(r);
  if(s.epoch){const e=s.epoch;
    if(y>=e.end){const K=EPOCH_KINDS.find(k=>k.k===e.k);chron('nature',e.k==='dry'?`${K.end} ${e.where} after ${y-e.start} years.`:`${K.end}`,e.cell);e.done=true;s.epoch=null}}
  else if(r()<0.0007*P.epochs){
    let u=r(),K=EPOCH_KINDS[0];for(const k of EPOCH_KINDS){if(u<k.w){K=k;break}u-=k.w}
    const amp=K.amp[0]+r()*(K.amp[1]-K.amp[0]),dur=Math.round(K.dur[0]+r()*(K.dur[1]-K.dur[0]));
    const e={k:K.k,start:y,end:y+dur,amp,cell:-1,where:''};
    if(K.k==='dry'){let c=-1;const rad=10+r()*12;for(let t=0;t<200;t++){const i=rLand(r);if(c<0&&pEq(i)>1000&&WD.T[i]>5)c=i}
      if(c<0)return;e.cell=c;e.cx=WD.cxA[c];e.cy=WD.cyA[c];e.rad=rad;e.where=regionName(c);
      chron('nature',`${K.start} ${e.where}; it will last for generations.`,c)}
    else chron('nature',K.start,-1);
    s.epoch=e;s.epochs.push(e);
  }
}
function epochTemp(){const e=S.epoch;if(!e||e.k==='dry')return 0;const y=S.year,ramp=Math.min(1,(y-e.start)/40,(e.end-y)/40);return e.amp*Math.max(0,ramp)}
function regionName(c){const la=WD.lat[c]*180/Math.PI,lo=(WD.cxA[c]+0.5)/W*360-180;
  const e=S.eth[c]>=0?S.eths[S.eth[c]]:null;return e?`lands of the ${e.name}`:`region near ${Math.abs(la).toFixed(0)}°${la>=0?'N':'S'}, ${Math.abs(lo).toFixed(0)}°${lo>=0?'E':'W'}`}

/* ---------- yearly processes ---------- */
function weather(){
  const s=S,w=WD,g=s.AG,phi=P.climPersist,sd=Math.sqrt(1-phi*phi),r=s.rN||s.r,cv=0.28*P.climVar;const s_anom=s.anom,s_wm=s.wm,w_cxA=w.cxA,w_cyA=w.cyA;
  for(let k=0;k<g.length;k++)g[k]=phi*g[k]+sd*gauss(r);
  const L=w.landIdx,wi=w.wi,wf=w.wf,e=s.epoch&&s.epoch.k==='dry'?s.epoch:null;
  let ramp=0;if(e)ramp=Math.max(0,Math.min(1,(s.year-e.start)/20,(e.end-s.year)/20));
  for(let k=0;k<L.length;k++){const i=L[k],fx=wf[i*2],fyy=wf[i*2+1];
    let a=(g[wi[i*4]]*(1-fx)+g[wi[i*4+1]]*fx)*(1-fyy)+(g[wi[i*4+2]]*(1-fx)+g[wi[i*4+3]]*fx)*fyy;
    if(e){let dx=Math.abs(w_cxA[i]-e.cx);if(dx>W/2)dx=W-dx;const d2=(dx*dx+(w_cyA[i]-e.cy)**2)/(e.rad*e.rad);if(d2<1)a+=e.amp*ramp*(1-d2)}
    s_anom[i]=a;s_wm[i]=Math.exp(cv*a)}
}
// diminishing returns: each new farming technique adds less on top of the others (Boserup's intensification, Malthus's ceiling)
const intens=x=>1+3.2*(1-Math.exp(-x/3.2));
// cropping frequency (run 73): crowded farmers close about a seventh of the gap to their ceiling per century (four times faster
// overshot China's first state and the 3000 BCE population). New farmers start at long fallow (CF0); capacity scales with
// frequency against CFREF
const CF0=0.25,CFREF=0.4,CFR=0.0015;
// scalar stress at the strong setting (run 75: Egypt's first state 0 -> 16% in band, Yellow River 14 -> 33%, Indus 80 -> 91%;
// score +2.1). threat switch (run 74, set aside): frontier threat builds the state and its horsemen
const sclK=()=>2;
// cohort switch: six age and sex groups per province (girls, boys, young women, young men 15-34, older women, older men)
const cohOn=()=>swOn('cohort'),cohArr=()=>{if(!cohOn())return null;if(!S.coh)S.coh=new Float32Array(N*6);return S.coh};
// farming reads the floodplain share (rvF), not the raw river; state capacity reads record keeping (writing, khipu, griots,
// drum script), not writing alone
const rvAg=()=>WD.rvF,admOf=()=>S.recK||S.admin;
// sums of generated techniques for the food and power rows, cached every ten years for the capacity pass
function genCache(){const s=S,w=WD;if(!s.genByRow)return;if(!s.genC0){s.genC0=new Float32Array(N);s.genC3=new Float32Array(N)}
  const fill=(row,a)=>{a.fill(0);for(const k of s.genByRow[row]){const t=s.tk[k],tr=TECH[k].tier;for(const i of w.landIdx)a[i]+=t[i]*tr}};fill(0,s.genC0);fill(3,s.genC3)}
// water (default since run 81, +3.1 with the river fix: Sahel farming 64 -> 92%, West African state 20 -> 69%, 1500 CE population
// 22 -> 52% in band): rivers carry the rain that falls now, not today's; closed basins hold lakes when more water flows in than
// evaporates (Lake Mega-Chad, the Tenere lakes at Gobero, Lake Ptolemy; Drake & Bristow 2006); land that dries sends the people
// it can no longer feed downstream along its water and on to the nearest land that can take them (the Nile, the Niger bend,
// Lake Chad, the Sahel: Kuper & Kropelin 2006; Brooks 2006)
function waterPass(){
  const s=S,w=WD,L=w.landIdx,ord=w.order,down=w.down,fd=w.fillD,area=w.area,hsh=w.hsh||null;if(!ord||!fd)return;
  if(!w.rv0){w.rv0=w.rv.slice();w.rvF0=w.rvF.slice()}
  // hollows: provinces lying below the level at which their hollow spills, joined to neighbours that fill to the same level (a
  // neighbouring hollow with its own spill level is a separate basin: the Niger's inland delta is not the Saharan depression beyond it)
  if(!w.bid){const bid=new Int32Array(N).fill(-1),cells=[],fz=w.fillZ;for(const i of L){if(bid[i]>=0||!(fd[i]>1))continue;const b=cells.length,q=[i],C=[];bid[i]=b;
      while(q.length){const c=q.pop();C.push(c);for(let e=w.snS[c];e<w.snS[c+1];e++){const j=w.snA[e];if(bid[j]<0&&w.land[j]&&fd[j]>1&&Math.abs(fz[j]-fz[c])<2){bid[j]=b;q.push(j)}}}
      C.sort((a,b2)=>w.elev[a]-w.elev[b2]);cells.push(C)}
    w.bid=bid;w.bcells=cells}
  if(!s.lake){s.lake=new Float32Array(N);s.Kw=Float32Array.from(s.K);s.lakeMax=new Map();s.Pw=new Float32Array(N);s.dryW=new Uint8Array(N)}
  // where the climate itself is drying: this half-century's rain under the last one's (a dry year is weather, not this)
  for(const i of L){const P=Math.max(0.3*w.Pr[i],w.Pr[i]+s.cdP[i]);s.dryW[i]=s.Pw[i]>0&&P<0.97*s.Pw[i]?1:0;s.Pw[i]=P}
  const bid=w.bid,BC=w.bcells,nb=BC.length,acc=new Float32Array(N),run=new Float32Array(N),runL=new Float32Array(N),accL=new Float32Array(N),pool=new Float64Array(nb),lake=s.lake;lake.fill(0);
  // two measures of the water: the river size the model was calibrated on (rain above 200 mm), and what really runs off to fill a
  // lake, rain less what the land gives back to the air (Turc-Pike: E = P / sqrt(1+(P/PET)^2); 400 mm of desert-edge rain yields
  // about 8 mm, 1,000 mm under a temperate sky about 170)
  const PET=i=>clamp(400+70*(w.T[i]+s.cdT[i]),300,2600);
  for(const i of L){const T=w.T[i]+s.cdT[i],P=Math.max(0.3*w.Pr[i],w.Pr[i]+s.cdP[i]),E=PET(i);run[i]=Math.max(0,P-200)*area[i]*1e-4*(T<-9?0.2:1);
    runL[i]=Math.max(0,P-P/Math.sqrt(1+(P/E)*(P/E)))*area[i]}
  // a stream crossing dry land loses water into its bed and to the air, the smaller the stream the larger the share (up to 15% a
  // province in true desert); great rivers lose little (the Nile)
  const th0=w.rvTh,keep=new Float32Array(N);for(const i of L){const P=Math.max(0.3*w.Pr[i],w.Pr[i]+s.cdP[i]);keep[i]=1-0.15*clamp((400-P)/400,0,1)}
  const flow=(src,dst,blk)=>{dst.set(src);for(let k=ord.length-1;k>=0;k--){const i=ord[k],d=down[i];if(d<0||!w.land[d])continue;const b=bid[i];
      if(b>=0&&blk&&blk[b])continue;const a=dst[i];dst[d]+=a*(1-(1-keep[i])/(1+acc[i]/th0))}};
  flow(run,acc,null);flow(runL,accL,null);
  for(const i of L){const d=down[i];if(d<0||!w.land[d])continue;const bd=bid[d];if(bd>=0&&bid[i]!==bd)pool[bd]+=accL[i]}for(const i of L)if(bid[i]>=0)pool[bid[i]]+=runL[i];
  // a hollow whose inflow evaporation can carry off holds a lake and lets nothing out; one that would overflow is a basin the river
  // runs through by a gorge too narrow to see in 100 km averages (the Congo's cuvette, the Sichuan and Hungarian plains), and holds
  // no lake; nor does one the sea has reached, or one in wet country
  const shut=new Uint8Array(nb);let any=false;
  for(let b=0;b<nb;b++){const B=BC[b],I=pool[b];if(I<=0)continue;let Ad=0,En=0,Pm=0,sea=false;
    // (on provinces only the part of a province lying in the hollow can hold water: hsh)
    for(const c of B){if(!w.land[c]){sea=true;break}const ah=hsh?area[c]*hsh[c]:area[c];Ad+=ah;const P=Math.max(0.3*w.Pr[c],w.Pr[c]+s.cdP[c]);Pm+=ah*P;En+=ah*Math.max(150,PET(c)-P)}
    // (on provinces, not where a river ends in its closed hollow and only an overflow would carry on: the balance of water decides)
    let thru=false;for(const c of B){if(w.rv0[c]<0.5||w.sinkU&&w.sinkU[c])continue;const d=down[c];if(d>=0&&w.land[d]&&bid[d]!==b){thru=true;break}}
    // a hollow a great river runs out of is part of its valley, never a lake (the Nile above Qena)
    if(sea||thru||Pm/Math.max(1,Ad)>=900)continue;En/=Math.max(1,Ad);if(globalThis.LAKEDBG)LAKEDBG.push({b,key:B[0],I,Ad,En,Pm:Pm/Ad,n:B.length});
    // a lake brims where inflow and evaporation are near balance: a hollow that could carry off less than about two thirds of its
    // inflow is a river basin, not a lake. A brimming lake spills from its outlet (Mega-Chad into the Benue at its height)
    let A=I/En;const A0=Math.min(A,Ad);if(A>=1.6*Ad)continue;
    if(A>=Ad){for(const c of B)lake[c]=hsh?hsh[c]:1}
    else{shut[b]=1;any=true;for(const c of B){if(A<=0)break;const f=Math.min(hsh?hsh[c]:1,A/area[c]);lake[c]=f;A-=f*area[c]}}
    if(B.length<3)continue;const key=B[0],was=s.lakeMax.get(key)||0;if(A0>was)s.lakeMax.set(key,A0);
    if(A0>=40000&&was<40000)chron('nature',`A great lake spreads across the ${regionName(key)}, some ${fmtK(Math.round(A0))} square kilometres of open water.`,key,[]);
    else if(was>=40000&&A0<0.2*was&&!s['lakeGone'+key]){s['lakeGone'+key]=1;chron('nature',`The great lake of the ${regionName(key)} has shrunk to marsh and salt pans.`,key,[])}}
  // then the water runs again, ending in the closed lakes
  if(any)flow(run,acc,shut);
  const th=w.rvTh,rv=w.rv,rvF=w.rvF,ffp=w.ffp;
  for(const i of L)rv[i]=acc[i]>th?clamp(Math.log(acc[i]/th)/Math.log(100)+0.2,0,1):0;
  // on provinces the bank across a river shares its size
  if(w.rtS){const r0=Float32Array.from(rv),S=w.rtS,A=w.rtA;for(const i of L)for(let q=S[i];q<S[i+1];q++)if(r0[A[q]]>rv[i])rv[i]=r0[A[q]]}
  for(const i of L){
    rvF[i]=Math.min(1,rv[i]*(ffp?ffp[i]:1)*clamp((w.T[i]-w.amp[i]/2+8)/8,0.3,1)+0.5*Math.min(lake[i],1-lake[i]))}
  s.Kw.set(s.K);s.seaVer++;
}
// every year, before hunger takes them: where the climate is drying (rain down since the last water pass) and the land holds more people than it can feed, they move
// rather than starve: downstream along the drainage (up to eight provinces) or to a neighbour, wherever there is most room
function followWater(){
  const s=S,w=WD,L=w.landIdx,pop=s.pop,K=s.K,Kw=s.Kw,down=w.down,nbS=w.nbS,nbA=w.nbA,dry=s.dryW;if(!dry)return;
  for(const i of L){const p=pop[i];if(!dry[i]||p<50||p<=1.02*K[i])continue;
    let best=-1,bs=0,j=i;
    for(let st=1;st<=8;st++){j=down[j];if(j<0||!w.land[j])break;const sp=(K[j]-pop[j])/(1+0.15*st);if(sp>bs){bs=sp;best=j}}
    for(let d=nbS[i];d<nbS[i+1];d++){const q=nbA[d];if(q<0||!w.land[q])continue;const sp=K[q]-pop[q];if(sp>bs){bs=sp;best=q}}
    if(best<0)continue;const mv=Math.min(0.6*(p-K[i]),0.5*bs);if(mv<1)continue;moveFolk(i,best,mv);s.fwN=(s.fwN||0)+mv}
}
// people moving from one province to another bring their people, faith and ways, as in migrate()
function moveFolk(i,j,mv){const s=S,T=s.tk,pj=s.pop[j];s.pop[i]-=mv;s.pop[j]+=mv;
  if(pj<1||s.eth[j]<0){s.eth[j]=s.eth[i];s.eth2[j]=-1;s.rel[j]=s.rel[i];s.s[j]=s.s[i];s.adapt[j]=s.adapt[i];for(const f of T)f[j]=Math.max(f[j],f[i]*0.9)}
  else if(s.eth[j]!==s.eth[i]){const sh=mv/(pj+mv);mixIn(j,s.eth[i],sh*0.6);if(s.eth2[j]===s.eth[i]&&s.mix[j]>0.5){const a=s.eth[j];s.eth[j]=s.eth2[j];s.eth2[j]=a;s.mix[j]=1-s.mix[j]}
    for(const f of T)if(f[i]*0.9>f[j])f[j]+=(f[i]*0.9-f[j])*Math.min(1,1.5*sh)}}
// herds switch: herders live on their animals: sheep, goats and cattle, with horses and camels on top. s.hs is the herd against
// what the province's pasture carries in a normal year (1). Herds regrow about a third of the gap a year when the grass allows,
// more slowly once a family is down to its last animals (the point where it cannot rebuild alone varies from place to place:
// Moritz et al. 2017, "No magic number"). They die when the grass or the winter forage gives out: a dry summer, or deep snow and
// ice over the grass in a cold winter (dzud; a dry summer before a hard winter is the worst: Fernandez-Gimenez et al. 2012).
// Herders who outnumber what their herds feed eat into their breeding stock. The winter is its own weather field, drawn from its
// own random stream so the rains stay the same.
const herdsOn=()=>!swOn('noherds');
function herdYear(){
  const s=S,w=WD,L=w.landIdx;
  if(!s.hs){s.hs=new Float32Array(N).fill(1);s.KhN=Float32Array.from(s.Kh);s.hsK=new Float32Array(N).fill(1);s.hsLoss=new Float32Array(N);s.WG=new Float32Array(AGW*AGH);s.rW=mulberry32(hashStr('winter:'+s.seed+':'+w.seed));s.dzC=0;s.hzC=0;s.dzCc=0;s.hzCc=0}
  const g=s.WG,rW=s.rW;
  // (switch dzwide; 2026-11-07) a hard winter covers a whole country: the cold of the Siberian High and its snow reach across 2,000 km
  // at once (the 2010 dzud struck about four-fifths of Mongolia). The winter is a local field on 9-degree cells plus a field on
  // 36-degree cells, so each place keeps the same spread of winters but neighbours share them. Rao et al. (2015): Mongolia's
  // national livestock loss tops 6% in 26% of years and 8.7% in 10% (median 4.2%), with 17% and 20% in its worst years; without
  // this, the plateau's worst year in a thousand was 17%
  if(!swOn('nodzwide')){if(!s.WG2){s.WG2=new Float32Array(10*5);s.WGf=new Float32Array(AGW*AGH)}const g2=s.WG2,gf=s.WGf;
    for(let k=0;k<g2.length;k++)g2[k]=0.3*g2[k]+0.954*gauss(rW);for(let k=0;k<gf.length;k++)gf[k]=0.3*gf[k]+0.954*gauss(rW);
    for(let y=0;y<AGH;y++)for(let x=0;x<AGW;x++){const gx=(x+0.5)/4-0.5,gy=clamp((y+0.5)/4-0.5,0,4),x0=Math.floor(gx),y0=Math.min(3,Math.floor(gy)),fx=gx-x0,fy=gy-y0,
      xa=((x0%10)+10)%10,xb=(xa+1)%10,c=(g2[y0*10+xa]*(1-fx)+g2[y0*10+xb]*fx)*(1-fy)+(g2[(y0+1)*10+xa]*(1-fx)+g2[(y0+1)*10+xb]*fx)*fy;
      g[y*AGW+x]=0.6*gf[y*AGW+x]+0.8*c/Math.sqrt(((1-fx)**2+fx*fx)*((1-fy)**2+fy*fy))}}
  else for(let k=0;k<g.length;k++)g[k]=0.3*g[k]+0.954*gauss(rW);
  const dT=s.dT+s.gT+epochTemp(),wi=w.wi,wf=w.wf,hs=s.hs,lossA=s.hsLoss,dom=s.dom;
  for(const i of L){lossA[i]=0;if(!(w.sH[i]>0.03||w.desert[i]))continue;
    const T=w.T[i]+dT+s.cdT[i]+s.evT[i],cold=clamp((w.amp[i]/2-T-4)/10,0,1);
    const F=Math.min(1.3,clamp(s.wm[i]*s.evP[i],0.3,1.6));
    let dz=0;if(cold>0){const fx=wf[i*2],fy=wf[i*2+1],z=(g[wi[i*4]]*(1-fx)+g[wi[i*4+1]]*fx)*(1-fy)+(g[wi[i*4+2]]*(1-fx)+g[wi[i*4+3]]*fx)*fy;dz=cold*clamp((z-0.8)/1.6,0,0.85)}
    const cap=F*(1-dz);let v=hs[i];
    if(v>cap){const lost=(v-cap)*0.75;lossA[i]=lost/v;v-=lost}
    else{const th=0.15+0.2*(((i*2654435761)>>>0)/4294967296);v+=0.3*v*(1-v/cap)*Math.min(1,v/th)}
    const p=s.pop[i],K=s.K[i];if(p>K&&s.past[i]>0.5)v-=0.1*Math.min(1,p/K-1)*v;
    hs[i]=clamp(v,0.02,1.6);
    const ls=lossA[i];if(ls>0.25&&dom){for(let sp=0;sp<4;sp++)if(dom[sp][i]>0)dom[sp][i]*=1-ls}
    if(s.past[i]>0.5&&p>=1){const a=cw(i);s.hzC+=a;if(ls>0.25)s.dzC+=a;if(cold>0.5){s.hzCc+=a;if(ls>0.25)s.dzCc+=a}}}
  // (switch hunger, with herds; Nein 2026-11-05: hungry herders trade, raid, follow a khan, move or settle) a herding people's hardship
  // is how far its herds stand below a normal year's (none above 0.8 of it, full at 0.2); a clan below its ruin line for five years
  // running cannot rebuild alone and gives up the herds where it can (Khazanov 1984: the poor drop out of nomadism and settle;
  // Barfield 1989: the khan's loot and tribute hold the rest)
  if(!swOn('nohunger')){if(!s.hgr){s.hgr=new Float32Array(N);s.ruinY=new Uint16Array(N)}const hg=s.hgr,ry=s.ruinY;
    for(const i of L){if(!(s.past[i]>0.5)||s.pop[i]<1||!(w.sH[i]>0.03||w.desert[i])){hg[i]=0;ry[i]=0;continue}
      const v=hs[i],th=0.15+0.2*(((i*2654435761)>>>0)/4294967296);hg[i]=clamp((0.8-v)/0.6,0,1);ry[i]=v<th?Math.min(60000,ry[i]+1):0;
      if(ry[i]>=5)settleRuined(i)}}
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='horde'||o.cells<15)continue;const ls=lossA[o.capital];if(ls<0.3)continue;
    o.shock+=0.5*ls;chron('nature',`${dz0(o.capital)?'A killing winter buries the pastures':'Drought burns the pastures'}: the ${o.full} loses ${Math.round(ls*100)}% of its herds.`,o.capital,[R_(o)])}
}
// ruined herders settle: where fields can be had and farming is known next door, they take up the plough (a tenth of the way a year);
// otherwise a tenth of them a year go into a neighbouring state's province that has room (a state short of people or soldiers lets
// them in; the Ming and Qing settled surrendered Mongols on the frontier), and mix with its people
function settleRuined(i){const s=S,w=WD;let kn=false,bit=0,best=-1,room=0;
  for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j<0||!w.land[j])continue;if(s.farm[j]>=0.5){kn=true;if(s.pkAv)bit|=s.pkAv[j]}
    const q=s.pol[j];if(q&&q!==s.pol[i]&&s.pols[q].kind==='state'){const rm=0.7*s.K[j]-s.pop[j];if(rm>room){room=rm;best=j}}}
  if(kn&&w.sF[i]>=0.12){s.farm[i]+=(0.6-s.farm[i])*0.1;if(s.pkAv)s.pkAv[i]|=bit;
    if(s.farm[i]>0.5&&s.farm[i]<0.51&&s.eth[i]>=0)chron('migration',`Ruined by hard years, the herders of the ${s.eths[s.eth[i]].name} take up farming.`,i,[RE(s.eths[s.eth[i]])]);return}
  if(best>=0){const m=Math.min(0.1*s.pop[i],room);if(m<1)return;s.pop[i]-=m;s.pop[best]+=m;mixIn(best,s.eth[i],m/s.pop[best]);
    if((s.ruinY[i]%25)===5&&s.eth[i]>=0)chron('migration',`Ruined herders of the ${s.eths[s.eth[i]].name} cross into the ${s.pols[s.pol[best]].full} to settle.`,best,[RE(s.eths[s.eth[i]]),R_(s.pols[s.pol[best]])])}}
// peoples without states fight over good ground (Nein, 2026-11-10): a crowded band falls on a neighbour of another people whose
// land is worth having, the more where food is dense enough to defend (rich rivers and coasts: Keeley 1996; Kelly 2000). The
// beaten flee (and may set a whole people moving), are killed, or, hemmed in, are taken in by the victors, who move onto the land.
// Fighting binds both sides together. Peoples living beside states harden (hardOf). Every five years.
function bandWars(){const s=S,w=WD,r=s.r,E=s.eths,seen=new Uint8Array(E.length);
  for(const i of w.landIdx){if(s.pol[i]||s.pop[i]<1)continue;const e=s.eth[i];if(e<0)continue;let st=0,cand=-1,n=0;
    for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j<0||!w.land[j])continue;const q=s.pol[j];if(q){if(s.pols[q].kind==='state')st=1;continue}
      if(s.pop[j]>=1&&s.eth[j]>=0&&s.eth[j]!==e&&r()<1/++n)cand=j}
    if(st)seen[e]=1;
    const pr=s.pop[i]/Math.max(1,s.K[i]);if(cand<0||pr<0.85)continue;const j=cand,kdI=s.K[i]/w.area[i],kdJ=s.K[j]/w.area[j];if(kdJ<0.5*kdI)continue;
    if(r()>pU(0.05*clamp((pr-0.85)/0.15,0,1)*clamp(kdJ/0.2,0.2,1),i))continue;
    const A=Math.pow(s.pop[i]+1,0.75)*s.s[i]*milAt(i)*(1+hardOf(e)),D=Math.pow(s.pop[j]+1,0.75)*s.s[j]*milAt(j)*(1+hardOf(s.eth[j]))*(1+w.rough[j]);
    s.bandW=(s.bandW||0)+1;
    if(r()<A/(A+D)){const hem=s.circE[j],R=A/D;s.pop[j]*=0.95;
      if(R>2&&hem>0.5){mixIn(j,e,0.5)}else displace(j,0.3,0);
      const m=0.15*s.pop[i];s.pop[i]-=m;s.pop[j]+=m;mixIn(j,e,m/Math.max(1,s.pop[j]));
      if(s.eth2[j]===e&&s.mix[j]>0.5){const a=s.eth[j];s.eth[j]=e;s.eth2[j]=a;s.mix[j]=1-s.mix[j]}
      s.s[i]=Math.min(1,s.s[i]+0.03);s.s[j]=Math.min(1,s.s[j]+0.02)}
    else{s.pop[i]*=0.97;s.s[j]=Math.min(1,s.s[j]+0.03);s.s[i]=Math.min(1,s.s[i]+0.01)}}
  for(let e=0;e<E.length;e++){const X=E[e];if(!X)continue;const h=X.hard||0;X.hard=seen[e]?h+0.01*(1-h):h*0.99}}
// was the herd lost to the winter or to the summer?
function dz0(i){const s=S,w=WD;return w.amp[i]/2-(w.T[i]+s.cdT[i])-4>0&&s.wm[i]>0.85}
function computeK(){
  const s=S,w=WD,L=w.landIdx,dT=s.dT+s.gT+epochTemp(),cdT=s.cdT,cdP=s.cdP;const s_K=s.K,s_adapt=s.adapt,s_admin=admOf(),s_ard=s.ard,s_camel=s.camel,s_crops=s.crops,s_farm=s.farm,s_fert=s.fert,s_forest=s.forest,s_herd=s.herd,s_horse=s.horse,s_iron=s.iron,s_irrig=s.irrig,s_manure=s.manure,s_metal=s.metal,s_plough=s.plough,s_rp=s.rp,s_salt=s.salt,s_tk=s.tk,s_wm=s.wm,s_xcrops=s.xcrops,w_Pr=w.Pr,w_T=w.T,w_amp=w.amp,w_area=w.area,w_coast=w.coast,w_desert=w.desert,w_heavy=w.heavy,w_leach=w.leach,w_mal=w.mal,w_oncho=w.oncho,w_rv=w.rv,w_sF=w.sF,w_sH=w.sH,w_techEnv=w.techEnv,w_transh=w.transh,w_trop=w.trop,s_crop=s.crop,s_cY=s.cY,w_soilFert=w.soilFert,s_sFc=s.sFc,w_terrFit=w.terrFit,w_sod=w.sod,s_lint=s.lint,s_pop=s.pop,s_Kfa=s.Kfa,s_Kh=s.Kh,s_Kf=s.Kf,s_past=s.past,s_domR=s.domR,s_domL=s.domL,s_wheel=s.wheel,w_turf=w.turf,s_open=s.open,s_malF=s.malF;
  const Z=w.zeroN||(w.zeroN=new Float32Array(N)),s_evT=s.evT||Z,s_evP=s.evP,s_sed=s.sed||Z,s_wildG=s.wildG||Z,s_huntX=s.huntX||Z,s_meatX=s.meatX||Z,s_mouseX=s.mouseX||Z,w_iceY=w.iceY||w.noIce||(w.noIce=new Float32Array(N).fill(-1e9)),s_Kpot=s.Kpot,s_year=s.year,tTer=s.tk[TI.terrace],t26=s.tk[26],t28=s.tk[28],t29=s.tk[29],t32=s.tk[32],t33=s.tk[33],envW=w.techEnv?w.techEnv[2]:null,
    g0=s.genC0||Z,g3=s.genC3||Z,coolC=w.coolC||(w.coolC=(()=>{const a=new Float32Array(N);for(let i=0;i<N;i++){const la=Math.abs(w.lat[i])*57.3;a[i]=w.coast[i]?clamp((la-33)/8,0,1)*clamp((62-la)/8,0,1):0}return a})());
  // the irrigation bonus applies to the share of the farmed land that is floodplain (all of it in Egypt, a sliver on the Volga),
  // not to how big the river is
  if(!s.cf){s.cf=new Float32Array(N).fill(CF0);s.cfMax=new Float32Array(N).fill(CF0)}const GZ=s.gzD||(s.gzD=new Float32Array(N),s.grass=new Float32Array(N),s.gzT=new Int32Array(N).fill(-1),s.gzA=new Float32Array(N),s.gzN=0,s.gzFar=0,s.gzD);const s_cf=s.cf,s_cfMax=s.cfMax,riceK=CI.rice,maizeK=CI.maize,HS=herdsOn()&&s.hs?s.hs:null,HSK=HS?s.hsK:null,LK=s.lake||null,ARI=swOn('aridirr'),WETK=swOn('wetk');
  for(let k=0;k<L.length;k++){
    const i=L[k];
    // foragers and herders: capacity refreshed every third year (staggered), farmers every year
    if(s_farm[i]<0.3&&(k+s_year)%3!==0&&s_K[i]>0&&!(HS&&Math.abs(HS[i]-HSK[i])>0.08))continue;
    if(HS)HSK[i]=HS[i];
    const T=w_T[i]+dT+cdT[i]+s_evT[i];
    if(T<-9||s_year<w_iceY[i]){s_K[i]=1;continue}
    const wm=s_wm[i]*s_evP[i],Pn=Math.max(0.3*w_Pr[i],w_Pr[i]+cdP[i])*wm,ar=w_area[i],rv=w_rv[i];
    let npp=Math.min(3000/(1+Math.exp(1.315-0.119*(T+w_amp[i]*0.15))),3000*(1-Math.exp(-0.000664*Pn)));
    // (switch wetk) on watered land (floodplain and fan, rvF) the plants and game have the river's water, at least the 550 mm
    // the fan pass waters to, not only the rain: the oasis and the valley floor feed foragers in a dry land
    if(WETK&&Pn<550&&w.rvF[i]>0){const f=w.rvF[i];npp=(1-f)*npp+f*Math.min(3000/(1+Math.exp(1.315-0.119*(T+w_amp[i]*0.15))),3000*(1-Math.exp(-0.000664*550)))}
    // cool temperate coasts are the richest foraging on Earth: salmon runs, shellfish, seals (Yesner 1980; the Jomon, the
    // Ertebolle and the Northwest Coast were among the densest forager peoples known)
    const cool=w_coast[i]?coolC[i]:0;
    const Kf=ar*0.1*npp/1000*(1+0.5*w_coast[i]+0.8*cool+0.4*rv+(LK?0.6*LK[i]:0))*(1+0.4*s_sed[i])*(1+1.2*s_wildG[i])*(1+0.15*s_huntX[i]);
    const dry=clamp(wm,0.3,1.6);
    let sh=Math.max(w_sH[i],0.5*s_domR[i],0.6*s_domL[i]);if(w_desert[i]&&cdP[i]>40)sh=Math.max(sh,clamp((w_Pr[i]+cdP[i]-80)/350,0,0.7));if(w_desert[i])sh=Math.max(sh,0.25*s_camel[i]);
    // horses and wagons let herders use the open grassland between the rivers, not only the valleys (Anthony 2007)
    const mob=Math.min(1,s_horse[i])*(0.4+0.6*s_wheel[i]);
    // herds switch: what the herd itself can give (s.hs, below), which lags the grass by years after a crash
    const KhB=HS?ar*1.6*sh*Math.max(s_herd[i],s_domR[i],s_domL[i])*(1+0.6*mob*clamp((w_sH[i]-0.2)/0.4,0,1))*(1+0.25*w_transh[i])*(1-s_rp[i]):0;
    let Kh=HS?KhB*Math.min(1.3,HS[i]):ar*1.6*sh*Math.max(s_herd[i],s_domR[i],s_domL[i])*Math.min(1.3,dry)*(1+0.6*mob*clamp((w_sH[i]-0.2)/0.4,0,1))*(1+0.25*w_transh[i])*(1-s_rp[i]);
    // herders follow the grass (default since run 79): crowded herds wear the grass down; s.grass is what the pasture itself would feed, whoever grazes it
    // what herding gives in a normal year, which is what people weigh when they choose between fields and herds
    if(HS)s.KhN[i]=KhB*(1-0.45*GZ[i])+ar*0.4*s_meatX[i];
    if(GZ){Kh*=1-0.45*GZ[i];s.grass[i]=ar*1.6*sh*Math.min(1.3,dry)*(1+0.25*w_transh[i])*(1-s_rp[i])*(1-0.45*GZ[i])}
    // other domestic animals (beastEffects): eland where cattle die of sleeping sickness, bison, deer, capybara
    const KhX=ar*0.4*s_meatX[i];
    const irr=s_irrig[i]*w.rvF[i];
    const wf=1+(Math.min(dry,1.25)-1)*(1-0.75*irr);
    const hv=w_heavy[i],lc=w_leach[i];
    const fp=Math.min(1,w.rvF[i]/Math.max(w_sF[i],0.02));
    // techniques that raise each harvest; ards, ploughs, manure and terraces instead set how often the land can be cropped (below)
    const xY=0.8*s_metal[i]+0.9*s_iron[i]*(1-0.4*lc)+1.0*s_crops[i]+0.7*s_admin[i]+s_xcrops[i]*(0.25+0.8*lc+0.5*w_trop[i]+0.3*(1-w_sF[i]))+0.4*t26[i]*Math.max(lc,s_forest[i])+0.15*t28[i]*w_coast[i];
    // aridirr switch: canals pay as much as the land is short of water (evaporation against rain): all of it on the Nile, the
    // Tigris-Euphrates and the Indus, little in wet temperate Europe, where a floodplain is marsh and flood-prone forest; bunded
    // rice keeps it, since a paddy is about holding water, not lacking it. Flood silt enriches valley soil everywhere
    const AQ=ARI?(s_crop[i]===riceK?1:clamp((clamp(400+70*T,300,2600)-Pn/wm)/(0.6*clamp(400+70*T,300,2600)),0,1)):1;
    let Kfa=ar*4.2*s_sFc[i]*s_fert[i]*wf*intens(xY)*(1+fp*(0.25+2.2*s_irrig[i]*AQ));
    {
      // cropping frequency (Boserup 1965): how often a field bears. Hoe farmers crop a plot a few years and leave it to bush for
      // many; oxen and the ard allow a fallow every other year (the Mediterranean two-field round); manure and rotations, or the
      // heavy plough on wet clays, allow cropping every year; bunded rice paddies keep their fertility without manure; flood silt
      // renews river land every year, and canals in warm rice country give two harvests (south China; Egypt and Sumer mostly one). Leached tropical
      // soils give out after two or three harvests (Sanchez 1976). Farmers move toward this ceiling only under crowding (growth)
      const rice=s_crop[i]===riceK?1:0,warm=clamp((T-16)/6,0,1);
      // late farming (default since run 79): crop rotation lets rain-fed land bear two years in three (the three-field round of medieval Europe), and
      // quick-ripening rice brings a second rice crop to irrigated paddies off the floodplains (Champa rice in Song China, 1012)
      const rot=s_crops[i];
      let cR=CF0+0.25*s_ard[i]*(1-0.6*hv)+0.25*s_plough[i]*hv+0.35*s_manure[i]*(0.5+0.5*Math.max(s_ard[i],s_plough[i]))+0.35*tTer[i]*w_terrFit[i]+0.15*rot*(0.5+0.5*Math.max(s_ard[i],s_plough[i]));
      // milpa (run 74): maize, beans and squash grown together feed the soil (beans fix nitrogen), so Mesoamerican fields rest
      // less than a lone grain's would (Zizumbo-Villarreal & Colunga-GarcíaMarín 2010)
      cR=Math.max(cR,(0.55+0.6*rot*s_irrig[i]*warm)*rice,s_crop[i]===maizeK?0.42:0)*(1-0.6*lc);
      const cF=0.6+0.4*s_irrig[i]+0.8*s_irrig[i]*warm*(0.12+0.88*rice);
      s_cfMax[i]=(1-fp)*cR+fp*cF;Kfa*=s_cf[i]/CFREF}
    Kfa*=(s_crop[i]>=0?s_cY[i]:0.35)*w_soilFert[i]*(1+0.12*s_domL[i]);
    // unbroken grass turf defeats the hoe and mostly the ard; heavy ploughs cut it. Farmers open it field by field (openPass)
    if(w_turf[i]>0){const op=s_open[i],f1=0.04+0.08*s_iron[i]+0.6*s_plough[i];Kfa*=op+(1-op)*f1}
    Kfa*=1+0.07*t32[i]*Math.min(1,rv*3)+0.05*t33[i]*(envW?envW[i]:0.5)+0.06*g0[i]+0.04*g3[i];
    Kfa*=(1-0.3*s_forest[i]*(1-clamp(0.5*s_metal[i]+0.7*s_iron[i],0,0.9)))*(1-0.6*s_salt[i])*(1-0.5*w_oncho[i]);
    if(w_T[i]<12)Kfa*=clamp(1+0.18*dT,0.4,1.35);
    // heavy, wet temperate forest soils: hard to clear and work until iron axes and ploughs
    if(hv>0)Kfa*=1-0.7*hv*(1-Math.max(s_plough[i],0.4*s_iron[i]));
    // what full farming would feed here, against what the wild already feeds: the farmers' edge is numbers (Bocquet-Appel 2011)
    // rain-fed farming on the dry continental grasslands is a gamble: one dry year in three wipes out the crop, while herds can
    // walk to grass. The Pontic and Kazakh steppes and the Great Plains stayed pastoral until iron ploughs and markets (Anthony 2007)
    Kfa*=1-0.45*(w.rainRisk?w.rainRisk[i]:0);
    // the potential is what farmers would get with real crops, even before the crops have arrived here
    s_Kpot[i]=Kfa*(s_crop[i]>=0?1:1/0.35)*Math.max(1,CFREF/s_cf[i]);Kfa*=s_farm[i];
    s_Kfa[i]=Kfa*(1+0.04*s_mouseX[i]);s_Kh[i]=Kh+KhX;s_Kf[i]=Kf;const ps=s_past[i];
    // the province's mix of fields and pasture, set by what pays, who lives there, raids and rulers (see herds.js)
    s_K[i]=Math.max(1,Kf,(1-ps)*(s_Kfa[i]+0.3*s_Kh[i]+0.2*Kf)+ps*(s_Kh[i]+0.4*Kf))*(1-0.5*w_mal[i]*s_malF[i]*(1-s_adapt[i])*(1-0.5*t29[i]));
  }
}
function growth(){
  const s=S,w=WD,L=w.landIdx,g=P.growth,dg=P.degrade,CO=cohArr();const s_K=s.K,s_adapt=s.adapt,s_crops=s.crops,s_eth=s.eth,s_eth2=s.eth2,s_farm=s.farm,s_fert=s.fert,s_forest=s.forest,s_herd=s.herd,s_iron=s.iron,s_irrig=s.irrig,s_manure=s.manure,s_metal=s.metal,s_plough=s.plough,s_pol=s.pol,s_pols=s.pols,s_pop=s.pop,s_rel=s.rel,s_rp=s.rp,s_salt=s.salt,s_tk=s.tk,w_Pr=w.Pr,w_area=w.area,w_forest0=w.forest0,w_leach=w.leach,w_mal=w.mal,w_rough=w.rough,w_rv=w.rv,w_sF=w.sF,w_sH=w.sH,w_soilDrain=w.soilDrain,s_cDrain=s.cDrain,w_soilSalt=w.soilSalt,w_soilErode=w.soilErode;
  const DT=s.dt||1,DX=DT>1?1-Math.pow(0.8,DT):0.2;
  for(let k=0;k<L.length;k++){const i=L[k];let p=s_pop[i];if(p<=0)continue;const K=s_K[i];
    if(p<K){if(DT>1)p=K>0?K/(1+(K/p-1)*Math.exp(-g*DT*(0.6+0.4*Math.min(1,s_farm[i]+0.5*s_herd[i])))):p;else p+=g*p*(1-p/K)*(0.6+0.4*Math.min(1,s_farm[i]+0.5*s_herd[i]))}else{let ex=(p-K)*DX;const gq=s_pol[i]?s_pols[s_pol[i]]:null;if(gq&&gq.gran>0.05&&gq.wet<-0.1){const sv=ex*0.6*gq.gran;ex-=sv;gq.granUse=(gq.granUse||0)+sv}p-=ex;if(!s_pol[i]&&p>1.2*K&&p>20000&&s_eth[i]>=0)pushPressure(s_eth[i],ex*0.35,i,0,null)}
    if(CO){
      // cohorts: the year's net change (above) is met by births to the women there are; deaths fall on each age; children and
      // young adults grow up. Losses from war, plague or flight since last year are spread over the ages first. A province
      // short of young women has fewer children; a shortage of men lowers births only a little (remarriage, polygyny)
      const b=i*6,p0=s_pop[i];let c0=CO[b],c1=CO[b+1],c2=CO[b+2],c3=CO[b+3],c4=CO[b+4],c5=CO[b+5];const T=c0+c1+c2+c3+c4+c5;
      if(T<=0){c0=0.156*p0;c1=0.164*p0;c2=c3=c4=c5=0.17*p0}else if(Math.abs(T-p0)>1e-4*p0){const f=p0/T;c0*=f;c1*=f;c2*=f;c3*=f;c4*=f;c5*=f}
      if(p>0){const D=0.04*(c0+c1)+0.012*(c2+c3)+0.05*(c4+c5),dP=p-p0;let ex=0;
        // births replace the dead (fertility follows child loss), and growth beyond that needs women of childbearing age
        const fw=(c2+0.4*c4)/(0.238*p0+1),mm=Math.min(1,0.85+0.15*(c3+0.5*c5)/(c2+0.5*c4+1));let Bb=dP>0?D+dP*clamp(fw,0.3,1.6)*mm:D+dP;if(Bb<0){ex=-Bb;Bb=0}
        const a0=c0/15,a1=c1/15,a2=c2/20,a3=c3/20;
        c0+=0.488*Bb-0.04*c0-a0;c1+=0.512*Bb-0.04*c1-a1;c2+=a0-0.012*c2-a2;c3+=a1-0.012*c3-a3;c4+=a2-0.05*c4;c5+=a3-0.05*c5;
        if(ex>0){const sw=1.5*(c0+c1)+0.7*(c2+c3)+1.3*(c4+c5);if(sw>0){const kC=Math.min(0.9,ex*1.5/sw),kY=Math.min(0.9,ex*0.7/sw),kO=Math.min(0.9,ex*1.3/sw);c0*=1-kC;c1*=1-kC;c2*=1-kY;c3*=1-kY;c4*=1-kO;c5*=1-kO}}
        p=c0+c1+c2+c3+c4+c5}
      if(p<0.5){c0=c1=c2=c3=c4=c5=0}
      CO[b]=c0;CO[b+1]=c1;CO[b+2]=c2;CO[b+3]=c3;CO[b+4]=c4;CO[b+5]=c5}
    if(p<0.5){p=0;s_eth[i]=-1;s_eth2[i]=-1;s_rel[i]=-1}
    s_pop[i]=p;
    const pr=p/K,fm=s_farm[i];
    // crowded farmers shorten the fallow toward what their soils and tools allow; when land is plentiful again they let it rest
    // (Boserup 1965; after the Black Death arable went back to grass)
    if(fm>0.3){let c=s.cf[i];const m=s.cfMax[i];
      if(c>m)c-=0.02*(c-m);else if(pr>0.7)c+=CFR*(m-c)*Math.min(1,(pr-0.7)/0.2);else if(pr<0.45&&c>CF0)c-=1.5*CFR*(c-CF0);
      s.cf[i]=c}else if(s.cf[i]>CF0)s.cf[i]-=0.01*(s.cf[i]-CF0);
    if(fm>0.3&&w_sF[i]>0.1){const silt=clamp(w.rvF[i]*1.5,0,0.8),lc=w_leach[i];
      if(pr>0.7)s_fert[i]=Math.max(0.3,s_fert[i]-dg*0.0012*(pr-0.7)*fm*(1+0.6*lc)*w_soilDrain[i]*s_cDrain[i]*(1-0.45*s_crops[i])*(1-0.5*s_manure[i])*(1-silt));
      s_fert[i]+=0.0025*(1-s_fert[i])*(1+0.6*s_herd[i]*w_sH[i]+(pr<0.5?1+lc:0));
      if(s_forest[i]<0.15&&w_rough[i]>0.3)s_fert[i]=Math.max(0.3,s_fert[i]-0.0003*w_soilErode[i]*w_rough[i]*fm);
      const ir=s_irrig[i]*Math.min(1,rvAg()[i]*2);
      // salt builds where crowded irrigated land is cropped every year with poor drainage; thin early canal farming with fallow
      // years and floods to flush the soil kept it down (Jacobsen & Adams 1958; Powell 1985)
      if(ir>0.1&&w_Pr[i]<550&&pr>0.5){const dens=p/w_area[i];s_salt[i]=Math.min(0.85,s_salt[i]+0.0004*w_soilSalt[i]*ir*Math.min(1.2,pr)*clamp((dens-4)/8,0,1)*(1-0.9*s_tk[30][i]))}
      if(s_salt[i]>0&&(pr<0.3||s_tk[30][i]>0.5))s_salt[i]=Math.max(0,s_salt[i]-0.0004-0.002*s_tk[30][i])}
    const f0=w_forest0[i];
    if(f0>0){let fo=s_forest[i];
      // people clear as much forest as they need for fields and grazing (more people, more clearing; intensive farming needs less land);
      // stone and bronze tools make it slow work, iron axes speed it; land no longer needed grows back
      const dens=p/w_area[i],need=clamp(fm*dens/(25*(1+0.5*s_crops[i]+0.4*s_plough[i]+0.4*s_irrig[i]))+1.6*fm*w_sF[i]*Math.max(0,pr-0.7)+0.25*s_herd[i]*w_sH[i]*Math.min(1,pr),0,0.95),tgt=f0*(1-need);
      if(fo>tgt){const d=(fo-tgt)*0.0015*(1+5*s_iron[i]+0.5*s_metal[i]);fo-=d;s.fclr[i]=d}else{fo+=(tgt-fo)*0.004;s.fclr[i]=0}
      s_forest[i]=clamp(fo,0,f0)}
    if(s_rp[i]>0)s_rp[i]*=0.96;
    if(w_mal[i]>0)s_adapt[i]+=0.0012*w_mal[i]*s.malF[i]*Math.max(0,0.55-s_adapt[i]);
  }
}
function mixIn(j,e,share){const s=S;if(e<0||e===s.eth[j])return;if(s.eth2[j]===e)s.mix[j]=Math.min(1,s.mix[j]+share);else if(s.eth2[j]<0||share>s.mix[j]){s.eth2[j]=e;s.mix[j]=share;s.mixT[j]=0}}
function migrate(){
  const s=S,w=WD,L=w.landIdx,r=s.r,mg=P.migration,rev=s.year&1,T=s.tk,nbE=w.nbE||null,SEEDS=originsOn()&&seedOn(),SEAC=swOn('seacol');const s_K=s.K,s_adapt=s.adapt,s_eth=s.eth,s_eth2=s.eth2,s_farm=s.farm,s_herd=s.herd,s_horse=s.horse,s_iron=s.iron,s_metal=s.metal,s_mix=s.mix,s_pol=s.pol,s_pols=s.pols,s_pop=s.pop,s_rel=s.rel,s_s=s.s,w_area=w.area,w_land=w.land,w_nbS=w.nbS,w_nbA=w.nbA,w_nbW=w.nbW,w_sF=w.sF,w_sH=w.sH;
  const MDT=s.dtM||1;
  // a move from i toward neighbour j, sc of a 100 km step's flow
  const one=(i,j,p,pr,sc)=>{if(j<0||!w_land[j])return 0;
    const kj=s_K[j];if(kj<2&&w_sF[j]<0.05&&w_sH[j]<0.05)return 0;
    const ar=w_area[j],kE=Math.max(kj,ar*3*w_sF[j]*s_farm[i]*(1+0.6*s_metal[i]+0.6*s_iron[i]),ar*1.1*w_sH[j]*s_herd[i]);
    const pj=s_pop[j],prj=pj/kE,diff=pr-prj;if(diff<0.1)return 0;
    let mob=MDT*mg*(0.08+0.25*s_herd[i]*w_sH[i]*(0.5+s_horse[i]));
    if(s_pol[j]&&s_pol[j]!==s_pol[i])mob*=0.4;
    else if(s_pol[i]&&!s_pol[j]){const o=s_pols[s_pol[i]];if(o.kind==='state')mob*=1+2*Math.max(0,(o.burden||0)-0.7)+1.5*Math.max(0,(o.ineq||0)-0.5)+2*Math.max(0,(o.ext??0.45)-0.7)}
    if(s_farm[i]>=0.5&&pj>=1&&s_farm[j]<0.3)mob*=settleOK(i,j);
    const mv=Math.min(p*mob*diff/(1+diff)*sc,p*0.3*sc);
    s_pop[i]-=mv;s_pop[j]+=mv;
    if(pj<1||s_eth[j]<0){s_eth[j]=s_eth[i];s_eth2[j]=-1;s_rel[j]=s_rel[i];s_s[j]=s_s[i];s_adapt[j]=s_adapt[i];for(const f of T)f[j]=Math.max(f[j],f[i]*0.9)}
    else if(s_eth[j]!==s_eth[i]){const sh=mv/(pj+mv);mixIn(j,s_eth[i],sh*0.6);if(s_eth2[j]===s_eth[i]&&s_mix[j]>0.5){const a=s_eth[j];s_eth[j]=s_eth2[j];s_eth2[j]=a;s_mix[j]=1-s_mix[j]}
      // newcomers bring their ways in proportion to their numbers: a few farming families among foragers make a farming
      // fringe, not a farming people (the availability phase, Zvelebil 1986)
      for(const f of T)if(f[i]*0.9>f[j])f[j]+=(f[i]*0.9-f[j])*Math.min(1,1.5*sh)}
    // (switch seedcarry; Nein, 2026-11-06) people who sow wild plants take their seed and their selection with them: the stand
    // they tend takes root where they settle if the climate there suits it (with wildmove), and their sowing and the progress of
    // their selection mix into the newcomers' place by their numbers, as their ways do
    if(SEEDS&&s.cultv&&s.cultv[i]>0.05){const WR=s.occ?s.wildR:w.wildR,k=WR[i];if(k>=0){const sh=pj<1?1:mv/(pj+mv),cv=s.cultv[i];
      if(s.occ){const o=s.occ[k];if(o[j]<o[i])o[j]+=(o[i]-o[j])*Math.min(1,2*sh*cv)}
      const rj=WR[j];if(rj===k||rj<0){s.cultv[j]+=(cv-s.cultv[j])*sh;s.domst[j]+=(s.domst[i]-s.domst[j])*sh}}}
    return mv};
  // (switch seacol; Nein, 2026-11-07) crowded farmers on a coast paddle along it and across narrow seas to good land beyond, as
  // the first farmers reached Cyprus, Crete, southern Italy and Iberia by boat ahead of any land front (Zilhao 2001; Broodbank 2013):
  // the same move as over land, along the sea lanes, a twentieth of a land step's flow per 100 km of water and per 100 km of the
  // home coast; dugouts and paddled boats go up to 3 sea steps, sailing boats 6; the seed goes with them
  const seaMove=i=>{const fl=0.05*cwL(i),far=s.sail[i]>0.3?6:3;
    for(let q=w.ls[i];q<w.ls[i+1];q++){const j=w.lt[q],dl=w.ld[q];if(dl>far)continue;const qq=s_pop[i];if(qq<1)break;
      if(one(i,j,qq,qq/s_K[i],fl/dl)>0&&s.pkAv)s.pkAv[j]|=s.pkAv[i]}};
  for(let kk=0;kk<L.length;kk++){
    const i=L[rev?L.length-1-kk:kk],p=s_pop[i];if(p<1)continue;
    const pr=p/s_K[i];if(pr<0.55)continue;
    if(SEAC&&s_farm[i]>=0.5&&w.coast[i])seaMove(i);
    // (on provinces people move toward every neighbour each year, each by its share of the flow: nbE/4 of a 100 km step's)
    if(nbE){for(let e=w.nbS[i];e<w.nbS[i+1];e++){const q=s_pop[i];if(q<1)break;one(i,w.nbA[e],q,q/s_K[i],Math.min(1,nbE[e]/4))}continue}
    one(i,rndNb(i,r()),p,pr,1)}
}
// herders follow the grass (default since run 79): herders follow the grass, clan by clan (Khazanov 1984; Humphrey & Sneath 1999). Herds above what the grass
// bears wear it down, and rested grass recovers in a few years. Every other year a herding clan hears of the grass within a
// few days' ride, farther if it rides; if better grass per head keeps being reported in the same direction for some years
// it moves there with its herds. Most moves are short; a run of wet years far off can pull clans a long way. Fields are not
// grass: herders do not move into farmland or a farming state's provinces
function grazePass(){
  const s=S,w=WD,L=w.landIdx,r=s.r,D=s.gzD,G=s.grass,TG=s.gzT,A=s.gzA,T=s.tk,y=s.year;
  for(let kk=0;kk<L.length;kk++){const i=L[kk],p=s.pop[i];if(!(s.past[i]>0.3)){if(D[i]>0)D[i]*=0.97;continue}
    const pr=s.K[i]>1?p/s.K[i]:0;D[i]=clamp(D[i]+0.004*Math.max(0,pr-0.8)*s.past[i]-0.03*D[i]*(pr<0.7?1:0.3),0,1);
    if((kk+y)&1||p<3000||s.past[i]<0.5||s.herd[i]<0.4||s.farm[i]>0.5)continue;
    const q=s.pol[i],o=q?s.pols[q]:null;if(o&&o.kind==='state'&&!herdLed(o))continue;
    const e=s.eth[i]>=0?s.eths[s.eth[i]]:null,R=2+Math.round(3*Math.min(1,s.horse[i])*(0.3+(e&&e.ride?e.ride:0)))+(s.hgr&&s.hgr[i]>0.5?2:0),own=G[i]/(p*s.past[i]+1);if(own<=0)continue;
    const cx=w.hx?w.hx[i]:w.cxA[i],cy=w.hy?w.hy[i]:w.cyA[i];let best=-1,bg=0;
    for(let t=0;t<4;t++){const dy=Math.round((r()*2-1)*R),yy=cy+dy;if(yy<0||yy>=H)continue;const dx=Math.round((r()*2-1)*R),j=uAt(cx+dx,yy);
      if(j===i||!w.land[j]||s.farm[j]>0.5||G[j]<=0)continue;const qj=s.pol[j],oj=qj?s.pols[qj]:null;if(oj&&oj.kind==='state'&&!herdLed(oj))continue;
      const gain=G[j]/(s.pop[j]*Math.max(0.3,s.past[j])+1)/own-1-0.06*Math.hypot(dx,dy)-(oj&&qj!==q?0.3:0);if(gain>bg){bg=gain;best=j}}
    if(best>=0&&(TG[i]===best||(TG[i]>=0&&Math.abs(w.cxA[TG[i]]-w.cxA[best])+Math.abs(w.cyA[TG[i]]-w.cyA[best])<=1)))A[i]=0.7*A[i]+bg;else if(best>=0&&bg>A[i]){TG[i]=best;A[i]=0.5*bg}else A[i]*=0.7;
    if(A[i]<0.6||TG[i]<0)continue;
    const j=TG[i],mv=Math.min(p*0.3,Math.max(1500,p*0.12));if(mv>p*0.3)continue;TG[i]=-1;A[i]=0;
    const pj=s.pop[j];s.pop[i]-=mv;s.pop[j]+=mv;
    if(pj<1||s.eth[j]<0){s.eth[j]=s.eth[i];s.eth2[j]=-1;s.rel[j]=s.rel[i];s.s[j]=s.s[i];s.adapt[j]=s.adapt[i];for(const f of T)f[j]=Math.max(f[j],f[i]*0.9);if(s.past)s.past[j]=Math.max(s.past[j],0.6)}
    else if(s.eth[j]!==s.eth[i]){const sh=mv/(pj+mv);mixIn(j,s.eth[i],sh*0.6);for(const f of T)if(f[i]*0.9>f[j])f[j]+=(f[i]*0.9-f[j])*Math.min(1,1.5*sh)}
    const far=Math.abs(((w.cxA[j]-cx+W*1.5)%W)-W/2)+Math.abs(w.cyA[j]-cy);s.gzN++;if(far>=4)s.gzFar++;
    if(mv>=30000&&far>=4&&e)chron('migration',`A clan of the ${e.name} follows the rains to the ${dirWord(((w.cxA[j]-cx+W*1.5)%W)-W/2,w.cyA[j]-cy)}ern pastures with its herds, some ${fmtK(mv)} strong.`,j,[RE(e)])}
}
function virginSoil(tgt,src){
  const s=S,r=s.r;
  const gap=s.dp[src]-s.dp[tgt];
  if(gap>0.2&&!s.infect[tgt]&&pEq(tgt)>1000&&r()<0.35*gap){
    const e=s.eths[s.eth[src]];
    const o={id:s.outbreaks.length,name:`${e?cap(e.lang.lex.sea)+' ':''}${pick(r,PLAGUE)}`,origin:tgt,year:s.year,deaths:0,vir:0.12+0.25*gap+r()*0.08,cells:1,active:1,done:false,spread:[[0,tgt]],hit:new Set(),virgin:true,from:s.eth[src],dp:s.dp[src]};
    s.outbreaks.push(o);s.infect[tgt]=3;s.ob[tgt]=o.id;s.inf.push(tgt);
  }
}
function seaHop(){
  const s=S,w=WD,r=s.r,C=w.coastIdx;const s_K=s.K,s_admin=s.admin,s_eth=s.eth,s_eths=s.eths,s_lmFound=s.lmFound,s_nav=s.nav,s_ocean=s.ocean,s_pop=s.pop,s_rel=s.rel,s_s=s.s,s_sail=s.sail,w_T=w.T,w_cxA=w.cxA,w_cyA=w.cyA,w_land=w.land,w_lm=w.lm,w_lmSize=w.lmSize;if(!C.length)return;
  const ex=coastLen()*0.004*P.seafaring*(s.dt||1);let tries=Math.floor(ex)+(r()<ex%1?1:0);
  while(tries-->0){
    const i=rCoast(r);if(pEq(i)<30)continue;
    const sl=s_sail[i];if(r()>0.04+0.5*sl)continue;
    const ang=r()*6.2832,dx=Math.cos(ang),dy=Math.sin(ang)*0.8;
    const range=2+Math.floor(sl*28)+((r()*3)|0)+(s_nav[i]>0.5?14:0)+(s_ocean[i]>0.5?70:0);
    let x=w_cxA[i]+0.5,y=w_cyA[i]+0.5,seen=0,tgt=-1;
    for(let st=0;st<range*1.5;st++){x+=dx*0.7;y+=dy*0.7;if(y<0||y>=H)break;
      const j=uAtF(x,y);if(!w_land[j]){seen=1;continue}if(seen){tgt=j;break}}
    if(tgt<0||w_T[tgt]<-9)continue;
    if(s_pop[tgt]<1){
      s_pop[tgt]=Math.min(60+s_pop[i]*0.02,s_K[tgt]*0.5+1);s_eth[tgt]=s_eth[i];s_rel[tgt]=s_rel[i];s_s[tgt]=0.4;
      for(const f of s.tk)f[tgt]=Math.max(f[tgt],f[i]*0.8);s_admin[tgt]*=0.3;
      // seacrop switch: seafarers carry their seed grain and animals, not only their skills
      const lm=w_lm[tgt];
      if(!s_lmFound[lm]){s_lmFound[lm]=1;if(w_lmSize[lm]>=4){const e=s_eths[s_eth[i]];chron('migration',`Seafarers of the ${e.name} reach an unpeopled ${w_lmSize[lm]>60?'land':'island'}.`,tgt,[RE(e)])}}
    }else if(s_eth[tgt]!==s_eth[i]){
      for(const f of s.tk)f[tgt]=Math.max(f[tgt],f[i]*0.5);
      if(s_ocean[i]>0.5&&w_lm[tgt]!==w_lm[i]){
        virginSoil(tgt,i);cropExchange(i,tgt);mixIn(tgt,s_eth[i],0.05);
        const e1=s_eths[s_eth[i]],e2=s_eths[s_eth[tgt]],key=e1.fam+':'+e2.fam;
        if(!s.contacts)s.contacts=new Set();
        if(e1.fam!==e2.fam&&!s.contacts.has(key)&&w_lmSize[w_lm[tgt]]>200){s.contacts.add(key);chron('migration',`Ocean-going ships of the ${e1.name} make landfall among the ${e2.name}, across the open ocean.`,tgt,[RE(e1),RE(e2)]);spot(`Ships of the ${e1.name} reach the ${e2.name} across the ocean`,tgt,[RE(e1),RE(e2)])}
      }
    }
  }
}
function firstTech(k,cell,o){
  const s=S;if(s.firstTech[k])return;s.firstTech[k]={y:s.year,cell,pol:o?o.id:0,eth:s.eth[cell]};
  const t=TECH[k],e=s.eths[s.eth[cell]]||null;
  const where=o?`the ${o.full}`:e?`the ${e.name}`:'a distant people';
  const refs=o?[R_(o)]:e?[RE(e)]:[];
  const verb={plough:'forge a heavy iron plough that turns the wet, clay soils',manure:'begin to gather manure and night soil to feed their fields',kitesig:'fly signal kites to send orders across the realm',windcart:'build sail-driven wagons that cross the flat deserts',fungal:'cultivate fungal gardens on the forest floor',ledger:'build geared engines to keep the treasury accounts',tidemill:'harness the tides to turn mills and forge hammers',feverbark:'brew a bark remedy that tames the marsh fevers',saltflush:'dig flushing canals that rinse the salt from their fields',pigeon:'train birds to carry messages between cities',irrig:'dig the first irrigation canals',wheel:'build the first wheeled carts and chariots',writing:'begin to keep written records',iron:'learn to smelt iron',coin:'strike the first coins',law:'write down the first law code',roads:'lay the first long paved roads',nav:'learn to steer by the stars across open seas',caval:'field the first armoured horsemen',paper:'make the first paper',crops:'rotate their fields and add fodder crops',gun:'make the first gunpowder weapons',ocean:'build ships that can cross oceans'}[t.k];
  if(verb){chron('ideas',`Scholars and craftsmen of ${where} ${verb}${t.synth?', a path our own history never took':''}.`,cell,refs);if(k>=8)spot(`${t.n} first appears in ${where}`,cell,refs)}
}
function techStep(a0,b0){if(a0==null){a0=0;b0=1}
  const s=S,w=WD,L=w.landIdx,T=s.tk,kd=0.12*P.techDiff,loss=0.006*P.techLoss,r=s.r,rels=s.rels,pols=s.pols;const s_car=s.car,s_eth=s.eth,s_eths=s.eths,s_farm=s.farm,s_firstTech=s.firstTech,s_herd=s.herd,s_irrig=s.irrig,s_paper=s.paper,s_pol=s.pol,s_pop=s.pop,s_rel=s.rel,s_roads=s.roads,s_sail=s.sail,w_Pr=w.Pr,w_area=w.area,w_coast=w.coast,w_cosLat=w.cosLat,w_desert=w.desert,w_heavy=w.heavy,w_leach=w.leach,w_ls=w.ls,w_lt=w.lt,w_nbS=w.nbS,w_nbA=w.nbA,w_nbW=w.nbW,w_nbE=w.nbE||null,szF=w.szF||null,w_land=w.land,w_rv=w.rv,w_sH=w.sH,w_trop=w.trop,w_tsetse=w.tsetse;
  const suit=[w.sF,w.sH,rvAg(),null,w.sH];
  // drums carry where forest and hills hide fires and slow runners; beacons need hills in sight of each other
  if(!w.drumSuit){w.drumSuit=new Float32Array(N);w.beaconSuit=new Float32Array(N);for(const i of L){w.drumSuit[i]=clamp(Math.max(w.forest0[i],1.5*w.rough[i]),0,1);w.beaconSuit[i]=clamp(2*w.rough[i]+0.2,0,1)}}
  suit[TI.drums]=w.drumSuit;suit[TI.beacons]=w.beaconSuit;
  const known=TECH.map((t,k)=>s_firstTech[k]||k===5?1:0);
  const NT=T.length,pop=s.pop,pol=s.pol,INST=TECH.map((t,k)=>k===6||k===9||k===10||k===11||k===14||t.k==='relays'||t.k==='khipu');
  for(let kk=Math.floor(a0*L.length),ke=Math.floor(b0*L.length);kk<ke;kk++){
    const i=L[kk];if(s_pop[i]<1)continue;const ei=s_eth[i];
    let conn=s_pop[i];const pi=s_pol[i],po=pi?pols[pi]:null;
    // (on provinces: the people of the province and its neighbours as if spread over five 100 km cells)
    if(szF){let a=w_area[i];for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j>=0&&w_land[j]){conn+=s_pop[j];a+=w_area[j]}}conn*=5*w_area[i]*szF[i]/a}
    else for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j>=0)conn+=s_pop[j]}
    const rvb=(1+0.5*w_rv[i])*(1+0.3*s_paper[i]+0.2*s_roads[i]+0.3*T[TI.alphabet][i]+0.4*T[TI.printing][i]);
    // narrow straits were crossed in skin boats and dugouts long before seafaring (Crete by 7000 BCE, Britain by 4000 BCE)
    const ls0=w_ls[i],ls1=s_sail[i]>0.3?w_ls[i+1]:ls0,lsE=w_ls[i+1];
    const dark=po?po.cult<0.1:true;
    // peopled neighbours and how closely each is in touch (east-west neighbours on the grid count fully, north-south ones by the
    // width of the shared side; provinces by the length of the shared border)
    const pg=1+0.4*T[31][i],cti=j=>j<0?1:Math.min(1,0.25+(szF?Math.sqrt(s_pop[i]*szF[i]*s_pop[j]*szF[j]):Math.sqrt(s_pop[i]*s_pop[j]))/6000+s_car[i]+s_car[j])*pg;
    let nn=0;for(let e=w_nbS[i];e<w_nbS[i+1];e++){const j=w_nbA[e];if(j>=0&&pop[j]>=1){NJ_[nn]=j;NC_[nn]=w_nbE?Math.min(1,cti(j))*w_nbE[e]:cti(j)*w_nbW[e];nn++}}
    const lowC=conn<3000,noFarm=s_farm[i]<0.3&&s_herd[i]<0.3;
    // carriers: an institution is taken up by the people who need it, scribes by a court with cities to run, accounts by
    // merchants; a chiefdom beside a literate empire has no one to read (Goody 1986). A rival that beats you with it
    // forces the pace (Renfrew and Cherry 1986).
    const stt=po&&po.kind==='state',adm=stt?clamp(0.04+0.1*(po.cityI||0)+po.cells/250+2*(po.cityUrb||0)/(po.pop+1)+0.3*Math.max(0,(po.cplx||0.2)-0.3),0,1):0.02,
      mer=clamp(0.03+1.2*s_car[i]+(s.city[i]>=0?0.15:0),0,1),prs=stt?Math.min(1,0.4*(po.enemies?po.enemies.size:0)+(po.shock||0)):0;
    for(let f=0;f<NT;f++){
      if(!known[f]||f===4||f===18)continue;   // horses and camels come from real herds (herds.js), not from diffusing know-how
      const A=T[f];let t=A[i];
      if(t<0.995){
        let m=0,same=0,mc=1,v,mj=-1;
        for(let q=0;q<nn;q++){const nj=NJ_[q];if((v=A[nj])>m){m=v;same=pi&&pol[nj]===pi;mc=NC_[q];mj=nj}}
        for(let q=ls0;q<lsE;q++){const raft=q>=ls1,j=w_lt[q];if(raft&&(w.ld[q]>2||w.lm[j]===w.lm[i]))continue;if(pop[j]<1)continue;v=A[j]*0.9;if(v>m){m=v;same=0;mc=raft?0.2:0.7;mj=j}}
        if(m>t){let k=kd*rvb*(same?1:0.6)*Math.min(w_nbE?6:1,mc);if(f===0&&w_nbE)k*=FDX;if(f>=3&&f!==5&&f!==18&&noFarm)k*=0.02;const sf=suit[f];if(sf)k*=0.2+sf[i];if(f===5&&!w_coast[i])k*=0.3;if(f===18)k*=0.2+(w_desert[i]||w_sH[i]>0.3?1:0);if(f===19)k*=0.05+0.95*(1-w_trop[i])*(1-w_leach[i]);else if(f===20)k*=w_tsetse[i]?0.03:0.3+0.7*(1-w_heavy[i]);else if(f===21)k*=0.1+w_heavy[i];else if(f===23)k*=0.3*(s_farm[i]>0.5?1:0.2);else if(f>=SYNTH0)k*=0.5;
          // foragers take up farming only as far as it beats what the wild gives them: rich coasts, rivers and lakes hold out
          // for centuries beside farmers (Ertebolle, Jomon, the Northwest Coast; Zvelebil 1986; Rowley-Conwy 2011). Land no one can
          // farm still passes the knowledge along
          if(f===0&&t<0.5&&w.sF[i]>=0.1){const adv=s.Kpot[i]/(s.Kf[i]/(1+1.2*(s.wildG?s.wildG[i]:0))+1);
            // gatherers of the wild ancestors are halfway to farming already
            
            // crowded farmers next door settle the forager's land anyway, by boat too (Neolithic Britain: Brace et al. 2019)
            const sq=mj>=0&&s.K[mj]>0?clamp((pop[mj]/s.K[mj]-0.6)/0.4,0,1)*clamp(adv-0.5,0,1):0;
            k*=Math.max(clamp((adv-1)/5,0.03,1),0.6*sq)}
          if(TECH[f].col!=null&&ei>=0&&s_eths[ei].deep)k*=0.85+0.45*s_eths[ei].deep[TECH[f].col];
          const cr=CARRY[f];if(cr){const nd=cr===1?Math.max(adm,0.6*mer):cr===2?Math.max(mer,0.5*adm):cr===3?adm:Math.max(adm,mer);k*=0.03+0.97*nd*(1+(same?0:prs))}
          const t0=t;t+=(w_nbE?Math.min(0.9,k):k)*(m-t);
          // a fast change unsettles the old order: new scribes and clerks against the warrior nobility, felt as lost cohesion
          if(cr&&pi){const dt=t-t0;if(dt>0.01)s.s[i]=Math.max(0.02,s.s[i]-3*dt*dt)}}
        if(INST[f]&&dark&&m<0.5)t*=pi?0.994:0.985;
      }else if(INST[f]&&dark){// saturated cell: only decays if no neighbour still knows it
        let m=0;for(let q=0;q<nn;q++)m=Math.max(m,T[f][NJ_[q]]);if(m<0.5)t*=pi?0.994:0.985}
      // farming is practised by everyone: a well-peopled province that has it refines it over generations,
      // instead of staying at the level of the thin chain of neighbours that brought it
      if(f===0&&t>0.3&&t<0.995&&!lowC)t+=0.004*(0.2+suit[f][i])*(1-t)
      if(lowC&&t>0)t*=1-loss*(f===0?0.3:1)*(1-0.6*s.ritW[i]);
      A[i]=t;
    }
    // irrigation: farmers on a river invent it where they must; in a desert valley even a thin population needs canals
    // (Samarra and Choga Mami, about 6000 BCE), in wetter lands only crowding drives it
    if(!s_firstTech[2]||s_irrig[i]<0.5){if(s_farm[i]>0.8&&w.rvF[i]>0.15&&w_Pr[i]<1000&&s_pop[i]/w_area[i]>4*clamp(w_Pr[i]/600,0.2,1)&&r()<pU(0.0008*P.invent,i)){seedTech(s.irrig,i,1,1);firstTech(2,i,po)}}
    const ri=s_rel[i];
    if(ri>=0){const R=rels[ri];
      let j=-1,ej=-1;{const x=r(),a=w_nbS[i],n=w_nbS[i+1]-a;if(n>0){ej=a+((x*n)|0);j=w_nbA[ej]}}
      if(ls1>ls0&&r()<0.2){j=w_lt[ls0+((r()*(ls1-ls0))|0)];ej=-1}
      if(j>=0&&s_pop[j]>=1&&s_rel[j]!==ri&&!(R.kind==='ethnic'&&s_eth[j]>=0&&s_eths[s_eth[j]].fam!==R.fam)){
        const qj=s_pol[j],sr=qj?pols[qj].rel:-1;
        let p=0.09*R.miss*P.faith*Math.min(1,0.15+(szF?Math.sqrt(s_pop[i]*szF[i]*s_pop[j]*szF[j]):Math.sqrt(s_pop[i]*s_pop[j]))/15000+2*s_car[j])*(pi&&qj===pi?1.5:1)*(sr===ri?4:sr>=0?0.25:1)*(s_rel[j]<0?1.3:0.6)*(1+0.5*s_paper[i])*(0.7+0.6*R.cent);
        if(r()<(szF&&ej>=0?hopR(p,i,ej):p))s_rel[j]=ri;
      }}
  }
}
function hearthCheck(){
  const s=S,w=WD,r=s.r,y=s.year;
  for(const h of s.hearths){if(h.done||y<h.year)continue;
    let c=h.cell;
    if(h.fixed){c=nearestPeopled(h.cell,4,h.kind==='farm'?j=>w.sF[j]>0.15:null);if(c<0){h.year=y+20;continue}}
    if(h.kind==='farm'){
      if(s.pop[c]<1||s.eth[c]<0){h.year=y+20;continue}
      seedTech(s.farm,c,1,2);seedTech(s.herd,c,0.6,1);s.firstTech[0]=s.firstTech[0]||{y,cell:c};s.firstTech[1]=s.firstTech[1]||{y,cell:c};
      let crop=h.crop,anim=h.anim,gr=h.grain;if(!crop){[crop,anim,gr]=cropFor(w.T[c],w.Pr[c],rvAg()[c])}
      seedTech(s.grain,c,gr==null?1:gr,2);s.firstTech[19]=s.firstTech[19]||{y,cell:c};
      {const pk=hearthPackage(h,c);plantHearth(pk,c);if(!h.crop){crop=CROPS[pk].n;anim=CROPS[pk].anim}}
      const e=s.eths[s.eth[c]];chron('ideas',`Among the ${e.name}, people begin to sow ${crop} and keep ${anim}.`,c,[RE(e)]);h.done=true;
    }else{
      if(!h.fixed){let best=-1,bp=0;
        for(let t=0;t<500;t++){const i=rLand(r);if(s.pop[i]<1||s.eth[i]<0)continue;
          let ok=false;
          if(h.kind==='copper')ok=s.farm[i]>0.5&&w.rough[i]>0.2;
          else if(h.kind==='horse')ok=w.sH[i]>0.45&&w.sF[i]<0.35&&s.herd[i]>0.2;
          else if(h.kind==='camel')ok=s.herd[i]>0.3&&(w.desert[i]||w.Pr[i]<350);
          else if(h.kind==='ard')ok=s.farm[i]>0.8&&s.herd[i]>0.5&&!w.tsetse[i]&&w.Pr[i]<900;
          else ok=w.coast[i]&&pEq(i)>200;
          if(ok&&pEq(i)>bp){bp=pEq(i);best=i}}
        if(best<0){h.year=y+25;continue}c=best}
      if(s.eth[c]<0){h.year=y+20;continue}
      const e=s.eths[s.eth[c]];
      if(h.kind==='copper'){seedTech(s.metal,c,1,1);chron('ideas',`Smiths among the ${e.name} learn to smelt copper, and later bronze.`,c,[RE(e)]);s.firstTech[3]=s.firstTech[3]||{y,cell:c}}
      else if(h.kind==='horse'){seedTech(s.horse,c,1,1);seedTech(s.herd,c,1,1);chron('ideas',`On the grasslands, the ${e.name} tame and ride the horse.`,c,[RE(e)]);s.firstTech[4]=s.firstTech[4]||{y,cell:c}}
      else if(h.kind==='ard'){seedTech(s.ard,c,1,1);chron('ideas',`Farmers among the ${e.name} yoke oxen to a scratch plough; one family can now till far more land.`,c,[RE(e)]);s.firstTech[20]=s.firstTech[20]||{y,cell:c}}
      else if(h.kind==='iron'){seedTech(s.iron,c,1,1);chron('ideas',`Smiths among the ${e.name} learn to smelt iron in clay furnaces, without passing through an age of bronze.`,c,[RE(e)]);s.firstTech[8]=s.firstTech[8]||{y,cell:c}}
      else if(h.kind==='camel'){seedTech(s.camel,c,1,2);chron('ideas',`The ${e.name} tame the camel; the deserts begin to open to caravans and raiders.`,c,[RE(e)]);s.firstTech[18]=s.firstTech[18]||{y,cell:c}}
      else{seedTech(s.sail,c,1,1);chron('ideas',`The ${e.name} build boats that can cross open sea.`,c,[RE(e)])}
      h.done=true;
    }
  }
}
function cropFor(T,Pp,rv){
  if(T>22&&Pp>1500)return['yams and taro','pigs and fowl',0];
  if(T>20&&Pp>1000)return[rv>0.3?'rice':'millet and rice','pigs and water buffalo',1];
  if(T>17&&Pp<900)return['sorghum and millet','cattle',1];
  if(T>=9&&(Pp<800||rv>0.3))return['wheat and barley','sheep and goats',1];
  if(T<9)return['rye and oats','cattle and sheep',1];
  return['maize and beans','turkeys and dogs',1];
}
const PLAGUE=['fever','pox','sweat','plague','flux','ague'];
function disease(){
  const s=S,w=WD,r=s.r,L=w.landIdx,dz=P.disease;const s_dp=s.dp,s_eth=s.eth,s_eths=s.eths,s_farm=s.farm,s_herd=s.herd,s_immune=s.immune,s_infect=s.infect,s_ob=s.ob,s_outbreaks=s.outbreaks,s_pol=s.pol,s_pols=s.pols,s_pop=s.pop,s_sail=s.sail,s_tk=s.tk,w_area=w.area,w_coast=w.coast,w_ls=w.ls,w_lt=w.lt,w_nbS=w.nbS,w_nbA=w.nbA,w_nbW=w.nbW;
  for(let t=0;t<40;t++){
    const i=rLand(r);if(s_pop[i]<1||s_infect[i])continue;
    const dens=s_pop[i]/w_area[i];
    if(r()<dz*0.0002*dens*(s_farm[i]+s_herd[i])){
      const e=s_eth[i]>=0?s_eths[s_eth[i]]:null;
      const o={id:s.outbreaks.length,name:`${e?cap(e.lang.lex.river)+' ':''}${pick(r,PLAGUE)}`,origin:i,year:s.year,deaths:0,vir:0.04+r()*0.13,cells:1,active:1,done:false,spread:[[0,i]],hit:new Set()};
      s.outbreaks.push(o);s_infect[i]=3;s_ob[i]=o.id;s.inf.push(i);
    }
  }
  // spillover: people cutting into warm forests meet the diseases of its animals (Wolfe, Dunavan & Diamond 2007)
  for(let t=0;t<20;t++){const i=rLand(r),cl=s.fclr[i];if(!(cl>0)||s_pop[i]<1||s_infect[i])continue;const f0=w.forest0[i];if(f0<0.4||w.T[i]<18)continue;
    const dens=s_pop[i]/w_area[i];
    if(r()<dz*0.0025*Math.min(2,cl/0.002)*Math.min(1,dens/5)*clamp(2*s.forest[i]/f0,0,1)){
      const e=s_eth[i]>=0?s_eths[s_eth[i]]:null;
      const o={id:s.outbreaks.length,name:`${e?cap(e.lang.lex.mountain)+' ':''}${pick(r,['fever','wasting sickness','pox','sleeping sickness','bleeding fever'])}`,origin:i,year:s.year,deaths:0,vir:0.12+r()*0.15,cells:1,active:1,done:false,spread:[[0,i]],hit:new Set(),novel:true};
      s.outbreaks.push(o);s_infect[i]=3;s_ob[i]=o.id;s.inf.push(i);s_dp[i]=Math.min(1,s_dp[i]+0.06);s.spills=(s.spills||0)+1;
      chron('plague',`A new ${o.name} crosses from the animals of the forest to the ${e?e.name:'people'} clearing it.`,i,[RPl(o)],'Cutting into the forest brought farmers and their animals close to wild hosts of diseases no one had met before.')}}
  const nl=[];
  for(const o of s.outbreaks)if(!o.done)o.active=0;
  for(const i of s.inf){if(!s_infect[i])continue;
    const o=s_outbreaks[s_ob[i]],dens=s_pop[i]/w_area[i];
    const m=Math.min(0.7,o.vir*(1-(o.novel?0.3:1)*s_immune[i])*(0.5+0.5*Math.min(1,dens/15))*(o.virgin?1+2.5*Math.max(0,(o.dp||0)-s_dp[i]):1)*(1-0.2*s_tk[29][i])),dd=s_pop[i]*m;
    s_pop[i]-=dd;o.deaths+=dd;o.active++;
    if(s_pol[i]){const po=s_pols[s_pol[i]];po.shock+=0.003*cw(i);po.plagueD=(po.plagueD||0)+dd;o.hit.add(s_pol[i])}
    const spreadTo=j=>{s_infect[j]=3;s_ob[j]=o.id;nl.push(j);o.cells+=cw(j);if(o.spread.length<4000)o.spread.push([s.year-o.year,j])};
    for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j<0||s_pop[j]<1||s_infect[j]||s_immune[j]>0.95||s_ob[j]===o.id)continue;
      const dj=s_pop[j]/w_area[j];
      if(r()<hopP(0.4*(1-s_immune[j])*Math.min(1,(dens+dj)/8+0.15)*(s_pol[j]===s_pol[i]?1:0.7),d))spreadTo(j)}
    if(w_coast[i]&&s_sail[i]>0.5)for(let q=w_ls[i];q<w_ls[i+1];q++){const j=w_lt[q];if(s_pop[j]<1||s_infect[j]||s_immune[j]>0.95||s_ob[j]===o.id)continue;if(r()<0.06*(1-s_immune[j]))spreadTo(j)}
    s_infect[i]--;
    if(s_infect[i]===0){s_immune[i]=Math.max(s_immune[i],0.85);if(o.virgin)s_dp[i]=Math.max(s_dp[i],o.dp*0.6)}else nl.push(i);
  }
  s.inf=nl;
  for(const o of s.outbreaks){if(o.done||o.active>0||o.year===s.year)continue;o.done=true;o.end=s.year;o.hit=[...o.hit];
    if(o.deaths>250000){const d=o.deaths>=1e6?`${(o.deaths/1e6).toFixed(1)} million`:`${Math.round(o.deaths/1000)} thousand`;
      chron('plague',`The ${o.name} burns out after killing about ${d} across ${Math.round(o.cells)} provinces${o.virgin?', most of them people who had never met such a disease':''}.`,o.origin,[RPl(o)]);
      if(o.deaths>5e6)spot(`The ${o.name} has killed ${d}`,o.origin,[RPl(o)])}}
  if(s.year%5===0)for(let k=0;k<L.length;k++)s_immune[L[k]]*=0.927;
}

/* ---------- figures ---------- */
function figFor(o,R,kind){
  if(R.fig!=null)return S.figs[R.fig];
  const f={id:S.figs.length,name:R.name+(R.epithet?' '+R.epithet:''),kind,pol:o?o.id:0,eth:o?o.core:-1,born:R.birth,died:0,title:o?`${cap(titleOf(o,R))} of the ${o.full}`:'',deeds:[],conq:0,realm:0,rel:-1,exc:R.exc||'',works:0};
  S.figs.push(f);R.fig=f.id;return f;
}
function deed(f,txt,refs){f.deeds.push([S.year,txt,refs||[]])}
function figScore(f){let s=f.conq*1.5+f.realm+f.deeds.length*4+(f.exc?5:0)+f.works*12;if(f.rel>=0){const R=S.rels[f.rel];s+=10*Math.sqrt(R.peak)+Math.min(100,R.states?R.states.length:0)*0.5}return s}

/* ---------- states ---------- */
const FLOOR={chief:5e3,king:6e4,emp:6e5};
function tierOf(o){const n=o.cells-(o.wasteN||0),p=o.pop*(o.coord??1);   // governed people: scalar stress counts only those the ruler can reach
  if(o.kind==='horde')return n<6||p<2e4?'Clans':n<25||p<2e5?'Horde':'Confederation';
  const nom=o.nomF>0.5;
  // a narrow, crowded river kingdom is still a kingdom: size in people counts, not only in land
  // a walled city and its fields: small in land, but a state of its own
  if(n<=5&&!nom&&p>=FLOOR.king*P.floor*0.25&&(S.city[o.capital]>=0||(o.origin&&o.origin.type==='colony')))return'City-state';
  if(p<FLOOR.king*P.floor||(n<4&&p<4*FLOOR.king*P.floor))return'Chiefdom';
  if(n<20||(!nom&&o.adm<0.25)||p<FLOOR.emp*P.floor)return nom?'Khanate':'Kingdom';
  return nom?'Khaganate':'Empire'}
function fullName(o){const t=o.tier;return t==='Horde'||t==='Clans'?`${o.base} ${t}`:t==='City-state'?`City of ${o.base}`:`${t} of ${o.base}`}
function styleOf(o){const e=S.eths[o.core];return e?STYLES[e.lang.style]:STYLES.romance}
function titleOf(o,R){const st=styleOf(o).t,f=R.fem;const fam=S.eths[o.core]?S.eths[o.core].fam:-1;
  switch(o.tier){case'Chiefdom':case'Clans':return st.c;case'Horde':case'Confederation':case'Khanate':return st.h;
    case'Kingdom':case'City-state':return st.k==='king'&&f?'queen':st.k;
    default:{if(S.famTitle[fam])return S.famTitle[fam].word;return st.e==='emperor'&&f?'empress':st.k==='khan'?'khagan':st.e}}}
function rulerName(o){const R=o.ruler;return`${titleOf(o,R)} ${R.name}${R.epithet?' '+R.epithet:''}`}
function newRuler(L,o){
  const s=S,r=s.r,tri=()=>(r()+r()+r())/3;
  let base=personName(L,r),num=0;
  if(o&&o.rulers.length&&r()<0.4){const famous=o.rulers.filter(x=>x.fig!=null);const pool=famous.length&&r()<0.7?famous:o.rulers;base=pick(r,pool).base||base}
  if(o){o.nameUse=o.nameUse||{};num=(o.nameUse[base]||0)+1;o.nameUse[base]=num}
  const R={base,name:num>1?`${base} ${roman(num)}`:base,fem:r()<0.15,aggr:tri(),comp:tri(),char:tri(),piety:tri(),greed:tri(),exc:'',epithet:'',conq:0,since:s.year,mi:0,fig:null};
  const acc=16+r()*28;R.birth=s.year-Math.floor(acc);R.death=Math.floor(clamp(50+gauss(r)*14,acc+1,88));
  if(r()<P.leaderFlair){const k=pick(r,['aggr','comp','char','piety']);R[k]=0.93+0.07*r();R.exc=k;
    R.epithet=pick(r,k==='aggr'?['the Great','the Conqueror','the Terrible']:k==='comp'?['the Wise','the Lawgiver','the Builder']:k==='char'?['the Beloved','the Radiant','the Lion']:['the Pious','the Saint','the Devout'])}
  return R;
}
function langAt(c){const e=S.eth[c];return S.eths[e>=0?e:0].lang}
function newPolity(c,from,opt){
  opt=opt||{};
  const s=S,r=s.r,id=s.pols.length,e=s.eth[c]>=0?s.eth[c]:0,L=s.eths[e].lang;
  let base=opt.base||L.lex.place;
  if(!opt.base&&(from||s.alive.some(k=>s.pols[k].base===base)))base=placeWord(L,r);
  const o={id,base,core:e,capital:c,rgb:hsl(r()*360,0.42+0.22*r(),0.5+0.1*r()),born:s.year,dyn:personName(L,r),gen:1,kind:opt.kind||'state',
    E:0.02,shock:0,S:0.5,press:0.5,md:0,adm:0,nomF:0,cells:cw(c),pop:s.pop[c],K:1,maxCells:cw(c),maxPop:0,conq:0,alive:true,wet:0,p5:0,famY:-1e9,
    h:P.reach,gate:1,aggrM:1,psi:0,why:null,hist:[],tier:'Chiefdom',full:'',peak:'',from:from?from.id:0,lastBy:0,fK:0,fE:0,lx:0,ly:0,crises:0,
    rel:s.rel[c],allies:[],enemies:new Map(),truce:new Map(),nb:new Map(),over:0,tribs:0,spc:0,era:0,rulers:[],warsF:[],kids:[],
    origin:opt.origin||(from?{type:'rebellion',from:from.id}:{type:'emerged',people:e}),loot:0,cult:0.2,works:[],golds:[],goldStart:0,sample:[],succ:null,fortN:0,cityPop:0,island:false,assimT:0,conqDyn:!!opt.conqDyn,settledY:0,restores:opt.restores||0};
  o.ruler=newRuler(L,o);o.founderR=o.ruler;o.tier=tierOf(o);o.full=fullName(o);o.peak=o.full;
  if(from)from.kids.push(id);
  if(from&&from.cplx!=null){o.cplx=from.cplx*0.55;o.ineq=from.ineq*0.85;o.treas=0.2}
  s.pols.push(o);s.alive.push(id);s.pol[c]=id;s.dist[c]=0;s.integ[c]=Math.max(s.integ[c],0.7);o.mandate=1;
  // a new state in the heartland of a fallen great power may claim its name
  if(!opt.base&&o.kind==='state'){for(const F of s.fallen){if(s.year-F.died>900||F.restoredBy)continue;
      const fe=s.eths[F.core],ce=s.eths[e];if(!fe||!ce||fe.fam!==ce.fam)continue;
      if(!F.sample.includes(c)&&angDist(c,F.capital)>0.06)continue;
      if(r()<0.5){F.restoredBy=id;o.base=F.base;o.restores=F.id;o.origin={type:'restoration',from:F.id,people:e};o.full=fullName(o);
        chron('rise',`Claiming the legacy of the fallen ${F.peak}, a new state rises in its old heartland and takes its name.`,c,[['pol',F.id,F.peak]])}
      break}}
  return id;
}
function succession(o){
  const s=S,r=s.r,L=s.eths[o.core]?s.eths[o.core].lang:s.eths[0].lang,Et=etOf(o),old=o.dyn,R0=o.ruler;
  // a court that keeps its genealogies, laws and precedents (in writing or in the heads of remembrancers) passes power on more smoothly
  const mem=o.info?Math.min(1,o.info.memo):0;
  const pU=(0.06+0.25*Math.max(0,o.E/Et-1)+0.35*Math.max(0,0.6-(o.mandate==null?1:o.mandate)))*(1-0.35*mem);
  o.rulers.push({name:R0.name,base:R0.base,epithet:R0.epithet,from:R0.since,to:s.year,conq:R0.conq,fig:R0.fig,dyn:o.dyn});
  if(o.rulers.length>60)o.rulers.shift();
  o.ruler=newRuler(L,o);
  const usurp=r()<pU;
  if(R0.fig!=null){const f=s.figs[R0.fig];f.died=s.year;deed(f,usurp?`Overthrown at ${s.year-R0.birth} by ${o.ruler.name}`:`Died at ${s.year-R0.birth}`);
    const fam=s.eths[o.core]?s.eths[o.core].fam:-1;
    if((f.conq>=80||f.realm>=200)&&fam>=0&&!s.famTitle[fam]&&r()<0.25){
      const w=R0.base.toLowerCase().replace(/[aeiou]+$/,'')+pick(r,['ar','or','an','er','ar']);
      s.famTitle[fam]={word:w,fig:f.id,from:o.id};
      chron('culture',`The name of ${f.name} outlives its bearer: rulers of the ${s.eths[fam].name} family of peoples will style themselves ${w}.`,o.capital,[RF(f),R_(o)])}}
  if(o.kind==='horde'&&r()<0.1+0.45*(1-o.S)-0.3*Math.min(0.5,o.prest||0)+((o.prest||0)<0.05?0.15:0)){o.shock+=0.6;if(o.cells>=10)chron('war',`On the death of ${R0.name}, the ${o.full} begins to splinter among rival chiefs.`,o.capital,[R_(o)]);hordeBreakup(o);return}
  if(usurp){o.dyn=personName(L,r);o.gen=1;o.shock+=0.3*(1-0.3*mem);o.mandate=0.75;
    if(o.cells>=60){const f=figFor(o,o.ruler,'usurper');deed(f,`Seized the throne of the ${o.full}, ending the House of ${old}`,[R_(o)]);
      chron('war',`${o.ruler.name} seizes the throne of the ${o.full}; the House of ${old} falls.`,o.capital,[R_(o),RF(f)])}}
  else o.gen++;
}
function etOf(o){const c=o.capital,s=S;return 0.02*(1+admOf()[c]+0.5*s.coin[c]+0.5*s.law[c])}
const WHY_LABEL={pW:'taxes that took the peasants\' bread',pD:'a court split between steppe lords and settled officials',pB:'great lords who answered to no one',pN:'rule stretched over lands unlike its own',pT:'a government that cost more than it returned',pF:'an empty treasury and mounting debts',pQ:'a widening gulf between the great and the poor',pZ:'an empire grown too large to govern',pC:'more people than its chiefs and record-keepers could manage',pY:'a swollen generation of young men without land or office',pI:'restless, poorly integrated provinces',pM:'a dynasty that had lost its mandate',pP:'population pressing on the land',pE:'too many elites competing for office',pS:'weak cohesion',pX:'an overextended realm',pR:'an inept ruler',sh:'recent famine, plague, invasion or succession strife'};
function topCauses(why){return Object.entries(why).filter(e=>e[1]>0.08).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>WHY_LABEL[e[0]])}
function polCells(id){const s=S,out=[];for(const i of WD.landIdx)if(s.pol[i]===id)out.push(i);return out}
function civilWar(o,breakup){
  const s=S,w=WD,r=s.r,id=o.id,cells=polCells(id);
  if(cells.length<3)return;
  const A=w.szF?cells.reduce((a,i)=>a+cw(i),0):cells.length;
  const dd=i=>(s.dist[i]===65535?9999:s.dist[i])*(1.2-s.integ[i]);
  const ecS=new Map();for(const c of cells)ecS.set(c,1+P.eco*ecoD(c,o));
  cells.sort((a,b)=>dd(b)*ecS.get(b)-dd(a)*ecS.get(a));
  const n=clamp(1+(r()<0.5?1:0)+(A>=80&&r()<0.5?1:0)+Math.floor(A/250)+(breakup?2:0),1,6),top=cells.slice(0,Math.max(1,Math.round(cells.length*0.6))),seeds=[];
  for(let t=0;t<60&&seeds.length<n;t++){const c=pick(r,top);if(c===o.capital)continue;if(seeds.every(q=>angDist(q,c)>0.07))seeds.push(c)}
  if(!seeds.length)return;
  const oldName=o.full,causes=topCauses(o.why||{}),why=breakup?'A confederation held together by one leader rarely outlives him.':causes.length?'Driven by '+causes.join(' and ')+'.':null;
  const lab=s.lab,q=s.q;let h=0,t=0;
  for(const i of cells)lab[i]=-2;
  lab[o.capital]=id;q[t++]=o.capital;
  if(!breakup){const keep=cells.length-top.length;for(let k=cells.length-1;k>=0;k--){const c=cells[k];if(c===o.capital)continue;if(k>=top.length||s.integ[c]>0.8&&r()<0.7){lab[c]=id;q[t++]=c}}}
  const sOK=seeds.filter(c=>lab[c]===-2);if(!sOK.length){for(const i of cells)lab[i]=0;return}
  const ids=sOK.map(c=>{const nid=newPolity(c,o,{kind:o.kind,origin:{type:'rebellion',from:id,why}});lab[c]=nid;q[t++]=c;return nid});
  while(h<t){const i=q[h++],l=lab[i];for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&lab[j]===-2){lab[j]=l;q[t++]=j}}}
  const cut=[];for(const i of cells){const l=lab[i];if(l>0&&l!==id){s.pol[i]=l;s.s[i]=Math.min(1,s.s[i]+0.12)}else if(l===-2)cut.push(i);s.pop[i]*=0.94;lab[i]=0}
  // lords carve up fallen realms (default since run 79): provinces cut off from both the capital and the rebels do not stay with the old ruler; their lords keep them
  if(cut.length&&o.kind==='state')partitionLands(o,cut,why);
  o.E=0.7*etOf(o);o.shock=0.2;o.crises++;if(o.cplx!=null){o.cplx*=breakup?0.7:0.85;o.ineq=Math.max(0.2,o.ineq*(breakup?0.7:0.88))}
  const rebels=ids.map(k=>s.pols[k]);
  for(const k of ids){const p=s.pols[k];p.rel=s.rel[p.capital]>=0?s.rel[p.capital]:o.rel}
  for(const i of cells){const p=s.pol[i];if(p&&i!==s.pols[p].capital&&!(herdLed(s.pols[p])&&s.past[i]>0.5)&&cerealEff(i)<0.3&&r()<0.6)s.pol[i]=0}
  const big=A>=40;
  const war=declareWar(rebels,[o],`the ${o.base} Civil War`,big,true);
  war.why=why;
  if(big&&!breakup){const names=ids.map(k=>s.pols[k].base);
    const nm=names.length>1?names.slice(0,-1).join(', ')+' and '+names[names.length-1]:names[0];
    chron('war',`Civil war breaks the ${oldName}; ${nm} ${names.length>1?'break':'breaks'} away.`,o.capital,[['pol',o.id,oldName],...ids.map(k=>RB(s.pols[k])),RW(war)],why)}
}
// confederations break into their parts (default since run 79): a confederation is its khan's personal network of chiefs (Barfield 1989; Khazanov 1984). When it breaks,
// the ruling clan keeps only its own people's pastures joined to the capital. Outlying pieces that can feed a following go
// to the chiefs who held them and ride off as confederations of their own (one to three at most, the largest first); the
// rest slip back to their clans, stateless. Nothing far-flung stays with the old khan.
function hordeBreakup(o){
  const s=S,w=WD,id=o.id,cells=polCells(id);if(cells.length<2)return;
  const A=w.szF?cells.reduce((a,i)=>a+cw(i),0):cells.length,aOf=l=>w.szF?l.reduce((a,i)=>a+cw(i),0):l.length;
  const own=new Set(cells),lab=s.lab;for(const i of cells)lab[i]=0;
  // the khan keeps his own people's pastures near the camp: the same reach a failing state keeps (run 76: a wider core let
  // the house outlive every collapse; confederations born before 5000 BCE were still riding at 3000 BCE)
  const lim=2,q=[o.capital];lab[o.capital]=1;let h=0;
  while(h<q.length){const i=q[h++];for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&own.has(j)&&!lab[j]&&s.eth[j]===o.core&&s.dist[j]<=lim){lab[j]=1;q.push(j)}}}
  // a khan whose capital stands among subject peoples still keeps the camps around it
  if(aOf(q)<3){h=0;while(h<q.length){const i=q[h++];for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&own.has(j)&&!lab[j]&&s.dist[j]<=0.5*lim){lab[j]=1;q.push(j)}}}}
  const why='A confederation held together by one leader rarely outlives him.',news=[],pieces=[];let freed=0;
  // the house itself must pass the same test as a rebel chief: too few people or pastures left to feed a following, and its
  // camp goes back to the clans with the rest
  let cp=0;for(const i of q)cp+=s.pop[i];const qA=aOf(q),fall=cp<5e4||qA<6;
  if(fall)for(const i of q)lab[i]=0;
  for(const c0 of cells){if(lab[c0])continue;const comp=[c0];lab[c0]=2;let k=0,pp=0,best=c0,bp=-1;
    while(k<comp.length){const i=comp[k++];pp+=s.pop[i];if(s.pop[i]>bp){bp=s.pop[i];best=i}for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&own.has(j)&&!lab[j]){lab[j]=2;comp.push(j)}}}
    pieces.push({comp,pp,best})}
  // only a few chiefs can hold a following of their own: the Xiongnu split in two, the Turks in two, the Mongols in four.
  // The largest pieces get a chance at a successor confederation, at most one to three; everyone else goes back to the clans
  pieces.sort((a,b)=>b.pp-a.pp);const maxNew=1+(s.r()<0.5?1:0)+(s.r()<0.25?1:0);
  for(const pc of pieces){const ok=news.length<maxNew&&pc.pp>=5e4&&aOf(pc.comp)>=6&&s.r()<0.6;
    if(ok){const nid=newPolity(pc.best,o,{kind:'horde',origin:{type:'rebellion',from:id,why}});for(const i of pc.comp){s.pol[i]=nid;s.s[i]=Math.min(1,s.s[i]+0.12)}news.push(nid)}
    else{for(const i of pc.comp){s.pol[i]=0;s.s[i]=Math.min(s.s[i],0.3)}freed+=aOf(pc.comp)}}
  for(const i of cells){s.pop[i]*=0.96;lab[i]=0}
  o.E=0.7*etOf(o);o.shock=0.2;o.crises++;if(o.cplx!=null){o.cplx*=0.7;o.ineq=Math.max(0.2,o.ineq*0.7)}
  const rebels=news.map(k=>s.pols[k]);if(rebels.length&&!fall)declareWar(rebels,[o],`the ${o.base} succession war`,A>=40,true);
  // run 77: with a fallen house simply dissolving, beaten confederations stopped fleeing onto their neighbours (23.6 -> 0.2 a
  // millennium) and invasions through a frontier nearly stopped (6.9 -> 0.4). A house too weak to keep a following, with heirs
  // riding off around it, has lost the succession: its own people take their herds and ride away from the strongest heir, as
  // the Northern Xiongnu did after the split of 48 CE (Barfield 1989), on the same terms as any beaten confederation (coalitionPass)
  let fled=null;
  if(fall&&rebels.length&&o.core>=0&&cp>3e4&&s.activeMigs.length<12){const by=rebels[0];let tot=0;for(const i of q){const take=s.pop[i]*0.6;s.pop[i]-=take;tot+=take}
    startMigration({eth:o.core,pop:tot,cell:o.capital,dx:-dxWrap(o.capital,by.capital),dy:-(w.cyA[by.capital]-w.cyA[o.capital]),kind:'horde',pol:o,by,cause:'pushed'});fled=by}
  // the breakup itself is no defeat: the next count of pastures lost to an enemy starts from what the house kept
  if(!fall)o.c10=qA;freed=Math.round(freed);
  if(A>=20){const nm=rebels.slice(0,3).map(p=>p.full),e=s.eths[o.core];
    chron('war',`The ${o.full} falls apart: ${fall?(fled?'its house is driven from its home pastures':'its house falls with it'):`its khan keeps only the ${e?e.name+' ':''}home pastures`}.${nm.length?` ${nm.join(', ')}${rebels.length>3?' and others':''} ride off under their own chiefs.`:''}${freed?` ${freed} province${freed>1?'s scatter':' scatters'} back to ${freed>1?'their clans':'its clans'}.`:''}`,o.capital,[R_(o),...rebels.slice(0,3).map(RB)],why)}
  if(A>=20&&fled)chron('migration',`Beaten by the ${fled.full}, the ${o.full} abandon their pastures and ride away with their herds.`,o.capital,[R_(o),R_(fled)],why);
}
function collapse(o){
  const s=S,w=WD;let lost=0;
  if(o.kind==='horde'){hordeBreakup(o);return}
  if(o.kind==='state'){const away=[];for(const i of w.landIdx)if(s.pol[i]===o.id&&s.dist[i]>2&&i!==o.capital)away.push(i);const awA=w.szF?away.reduce((a,i)=>a+cw(i),0):away.length;
    const res=partitionLands(o,away,'Its asabiya had decayed below the point where it could hold together; its lords kept what they held.');
    if(o.maxCells>=20&&awA>=5)chron('fall',`The ${o.full} loses its grip.${res.ids.length?` Its lords carve ${Math.round(res.claimed)} provinces into ${res.ids.length} realm${res.ids.length>1?'s':''}: ${res.ids.slice(0,4).map(k=>s.pols[k].full).join(', ')}${res.ids.length>4?' and others':''}.`:''}${res.freed>=0.5?` ${Math.round(res.freed)} provinces of poor land fall away into stateless hands.`:''}`,o.capital,[R_(o),...res.ids.slice(0,4).map(k=>RB(s.pols[k]))],'Its asabiya had decayed below the point where it could hold together.');
    return}
  for(const i of w.landIdx)if(s.pol[i]===o.id&&s.dist[i]>2&&i!==o.capital){s.pol[i]=0;s.s[i]=0.3;lost+=cw(i)}lost=Math.round(lost);
  if(o.maxCells>=20&&lost>=5)chron('fall',`The ${o.full} loses its grip; ${lost} provinces fall away into stateless hands.`,o.capital,[R_(o)],'Its asabiya had decayed below the point where it could hold together.');
}
// lords carve up fallen realms (default since run 79): farmland is worth claiming. When a farming state loses its grip, the lords, governors and garrison
// commanders who hold its provinces keep them as realms of their own: the successor kingdoms of the Carolingians, the
// Zhou and the Abbasids (Wickham 2009; Kennedy 2004). Each joined piece of good farmland is split among a few lords, one per
// half-dozen to dozen provinces; only poor land (desert, forest, thin pasture) and scraps too small to feed a lord's
// household and retinue go back to the villages. Herder-led states count their pastures as worth holding.
function partitionLands(o,cells,why){
  const s=S,w=WD,r=s.r,lab=s.lab,hl=herdLed(o),out={ids:[],claimed:0,freed:0};
  const good=i=>s.pop[i]>=1&&((s.farm[i]>0.5&&cerealEff(i)>=0.3)||(hl&&s.past[i]>0.5));
  const set=new Set();for(const i of cells){if(good(i))set.add(i);else{s.pol[i]=0;s.s[i]=0.3;out.freed+=cw(i)}}
  for(const c0 of set){if(lab[c0])continue;const comp=[c0];lab[c0]=-3;let k=0,pp=0;
    while(k<comp.length){const i=comp[k++];pp+=s.pop[i];for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&set.has(j)&&!lab[j]){lab[j]=-3;comp.push(j)}}}
    const cA=w.szF?comp.reduce((a,i)=>a+cw(i),0):comp.length;
    if(pp<FLOOR.chief*P.floor*3){for(const i of comp){s.pol[i]=0;s.s[i]=0.3;lab[i]=0}out.freed+=cA;continue}
    // lords: the strongest seats, spread apart
    const m=Math.max(1,Math.min(12,Math.round(cA/(6+r()*8)))),byPop=comp.slice().sort((a,b)=>pEq(b)-pEq(a)),seeds=[];
    for(const c of byPop){if(seeds.length>=m)break;if(seeds.every(q=>angDist(q,c)>0.03*Math.sqrt(cA/m)))seeds.push(c)}
    const q=s.q;let h=0,t=0;const ids=seeds.map(c=>{const nid=newPolity(c,o,{kind:'state',origin:{type:'rebellion',from:o.id,why}});lab[c]=nid;q[t++]=c;return nid});
    while(h<t){const i=q[h++],l=lab[i];for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&lab[j]===-3){lab[j]=l;q[t++]=j}}}
    for(const i of comp){const l=lab[i];if(l>0){s.pol[i]=l;s.s[i]=Math.min(1,s.s[i]+0.1);out.claimed+=cw(i)}else{s.pol[i]=0;out.freed+=cw(i)}lab[i]=0}
    out.ids.push(...ids)}
  return out}
function milAt(c){const s=S,w=WD,ts=w.tsetse[c]?0.15:1;return 1+0.07*genAt(6,c)+0.05*genAt(4,c)+0.4*s.metal[c]+0.3*s.wheel[c]*ts+0.5*s.iron[c]+ts*Math.min(1,s.horse[c])*(0.3+1.5*rideAtCell(c))+1.2*s.gun[c]+0.2*admOf()[c]+0.3*s.camel[c]*w.desert[c]+(s.warX?0.4*s.warX[c]:0)}
// horse switch: horses count in war once, by how well the people of the province ride them (riding tiers in herds.js)
function rideAtCell(c){const e=S.eth[c]>=0?S.eths[S.eth[c]]:null;return e&&e.ride?e.ride:0}
// what a field-taxing state can take: herds move, and a herding cell yields little grain to the tax collector
function cerealEff(i){return S.cTax[i]*(1-0.45*WD.leach[i])*(1-0.35*WD.trop[i])*(1-0.8*clamp((S.past[i]-0.45)/0.4,0,1))}
const herdLed=o=>o&&o.kind==='state'&&(o.steppe||0)>0.5;
/* ---------- armies, part 1: manpower holds land (Nein, 2026-11-10; switch noarmy turns it off) ----------
   Holding a province ties down men: by its land, by how unsettled it is in the realm (1 - integration, squared), by forest and
   rough ground where a people can melt away, less with iron, roads, records, forts and guns, and less in a calm, well-run realm
   (a settled, prosperous interior all but holds itself). The garrison comes out of the men a state can field, so a realm that
   holds much unwilling land has little left to fight with. A state takes stateless land only where the people it could tax
   outweigh the men it would take to hold them; what it cannot afford to hold it lets go. Units are people's worth of manpower. */
const armyOn=()=>!swOn('noarmy'),GAR=40000;
/* ---------- money (Nein, 2026-11-11; switch nomoney turns it off) ----------
   What a state can do with its taxes depends on what they are paid in. Taxes in kind (grain, cattle, cloth) must be hauled: what
   a far province pays shrinks with the distance unless there are pack and draught animals, carts or boats to carry it (haul, 0 to
   1, at the capital). Money travels: metal by weight where there is metalworking and a market, coin with the technique of coinage,
   and where neither is to hand but markets are busy and hauling is hard, light tokens (cloth, shells, cacao). mon, 0 to 1, is how
   far a realm's dealings are in money; it follows the markets, and faster when there are many soldiers to pay. Money buys
   soldiers that grain cannot. Peoples with nothing to carry grain lean on labour service instead. A court deep in debt with a
   coinage thins it: quick relief, then rising prices and lost trust. */
const moneyOn=()=>!swOn('nomoney');
function haulAt(c){const s=S,w=WD,an=Math.max(0.8*Math.min(1,s.horse[c]),s.camel[c],s.packX?s.packX[c]:0,0.6*s.ard[c],s.dom&&s.dom[4]?0.35*s.dom[4][c]:0);
  return clamp(an*(1+0.6*s.wheel[c])+0.35*Math.max(w.rv[c],w.coast[c]?Math.min(1,s.sail[c]):0),0,1)}
function garrAt(i,integ,calm,t){const s=S,w=WD,h=1-integ;if(t==null)t=i;
  return GAR*cw(i)*(0.02+h*h*(1+1.5*w.rough[i]+1.5*s.forest[i])*(1-0.6*calm))/(1+0.5*s.iron[t]+0.7*s.roads[t]+0.6*s.recK[t]+1.5*s.fort[i]+2*s.gun[t])}
const calmOf=o=>clamp(0.5+0.5*(o.leg??1)-Math.max(0,(o.burden||0.6)-0.8),0,1);
// a people that has lived beside states for generations learns their weapons and their ways of war, and holds together better
// against them (the Germans of the Rhine frontier, Wells 1999; Heather 2009): hard, 0 to 1, on each people
// the custom of treaties a state's people keep, helped by law codes and records at its court
const dipOf=o=>{const E=S.eths[o.core];return clamp((E&&E.dip||0)+0.15*S.law[o.capital]+0.1*S.recK[o.capital],0,1)};
const hardOf=e=>e>=0&&S.eths[e]?S.eths[e].hard||0:0;
/* ---------- armies, part 2: field armies and who leads them (Nein, 2026-11-10; switch nofield turns it off) ----------
   A state's field force is one to four armies, each standing somewhere under a commander. A fight draws on the armies near it
   (falling off over 600 km) and on a local levy worth three-tenths of the whole, so a realm at war on three fronts fights each
   with a part, and a blow far from every army meets little. An army on the march counts for less until it arrives. A horde is
   its own army. Who commands is the people's habit, learned from results: every fight an army wins raises the standing of its
   kind of commander (king, noble, priest, merchant's captain, chosen war leader) and every loss lowers it faster; a new realm
   starts from its people's habit. The kind in favour colours what wars are for. A general who keeps winning far from a weak
   court takes the throne. */
const fieldOn=()=>armyOn()&&!swOn('nofield'),CMD=['king','noble','priest','merchant','chief'],CMD_M=[1,1.1,1,0.9,1],CMD_AIM=[1,1.15,1.1,0.7,0.9];
function kmB(i,j){const w=WD,a=w.lat[i],b=w.lat[j];let dl=(w.cxA[i]-w.cxA[j])/W*2*Math.PI;if(dl>Math.PI)dl-=2*Math.PI;if(dl<-Math.PI)dl+=2*Math.PI;
  const h=Math.sin((a-b)/2)**2+Math.cos(a)*Math.cos(b)*Math.sin(dl/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(h)))}
function cmdPick(o,first){const cwt=o.cmdW,r=S.r;if(first){let b=0;for(let k=1;k<5;k++)if(cwt[k]>cwt[b])b=k;return b}let t=0;for(const x of cwt)t+=x;let u=r()*t;for(let k=0;k<5;k++){u-=cwt[k];if(u<=0)return k}return 0}
function armiesOf(o){if(!o.cmdW){const E=S.eths[o.core],rl=o.rel>=0&&S.rels[o.rel]?S.rels[o.rel].cent||0:0;o.cmdW=E&&E.cmdW?E.cmdW.slice():[1,1,0.4+rl,0.3,1.5];o.arm=[]}
  const n=1+Math.min(3,Math.floor((o.cA||o.cells)/40));while(o.arm.length<n)o.arm.push({at:o.capital,cmd:cmdPick(o,o.arm.length===0),eta:0,w:0,l:0});
  if(o.arm.length>n)o.arm.length=n;return o.arm}
function localForce(o,i){const A=o.arm;if(!A||!A.length)return 1;const y=S.year;let f=0.3;for(const a of A){const m=a.cmd===0?0.9+0.4*o.ruler.comp:CMD_M[a.cmd];f+=0.7/A.length*(a.eta>y?0.3:1)*m*Math.exp(-kmB(i,a.at)/600)}return f}
function armyCredit(o,i,win){const A=o.arm;if(!A)return;let b=null,bd=800;for(const a of A){const d=kmB(i,a.at);if(d<bd){bd=d;b=a}}if(!b)return;
  if(win)b.w++;else b.l++;o.cmdW[b.cmd]=clamp(o.cmdW[b.cmd]*(win?1.01:0.985),0.05,5);const E=S.eths[o.core];if(E){if(!E.cmdW)E.cmdW=o.cmdW.slice();else E.cmdW[b.cmd]+=(o.cmdW[b.cmd]-E.cmdW[b.cmd])*0.02}}
// each year: armies go where the fighting is (the first to where land was last lost, the rest to the fronts), marching 500 km a year
function armyYear(){const s=S,y=s.year,r=s.r;
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='state')continue;const A=armiesOf(o);let top=0;for(let k=1;k<5;k++)if(o.cmdW[k]>o.cmdW[top])top=k;o.aimM=CMD_AIM[top]*(1+0.5*Math.min(1,o.owed||0));o.cmdTop=top;
    const T=[];if(o.lostAt!=null&&y-o.lostY<=5&&s.pol[o.lostAt]!==undefined)T.push(o.lostAt);if(o.hot)for(const h of o.hot)T.push(h);
    for(let k=0;k<A.length;k++){const a=A[k];const t=T.length?T[k%T.length]:(o.enemies.size?a.at:o.capital);
      if(t!==a.at){const d=kmB(a.at,t);if(d>150){a.eta=y+Math.ceil(d/500)*(a.cmd===4&&!o.enemies.size?2:1);a.at=t}}
      // a winning general far from a weak court
      if(k>0||a.cmd!==0){if(a.w-a.l>=6&&kmB(a.at,o.capital)>500&&(o.hold??0.5)<0.6&&r()<0.01*(1.3-(o.leg??1))*(1+3*(o.owed||0))){
        const old=o.ruler.name;succession(o);if(!o.alive)break;o.ruler.comp=Math.max(o.ruler.comp,0.7);o.shock=(o.shock||0)+0.3;o.cmdW[0]*=1.3;a.w=a.l=0;a.cmd=0;s.usurpN=(s.usurpN||0)+1;
        if((o.cA||o.cells)>=20)chron('fall',`A victorious general marches on the court of the ${o.full} and takes the throne from ${old}'s line as ${o.ruler.name}.`,o.capital,[R_(o)])}}}
    o.hot=null;o.hotN=0}}
function strength(o){const rd=rideOf(o);if(o.kind!=='horde'&&armyOn()){const men=0.25*o.pop*(o.coord??1)*Math.min(1.3,o.mpR??1)*(swOn('nogrants')?1:1-0.5*Math.max(0,(o.ineq||0.25)-0.45)*(1-0.7*(o.mon||0)))*(1-(o.slvS||0))*(1+0.8*(o.slvS||0));return((o.tax||0)*1.6*(moneyOn()?0.7+0.6*(o.mon||0):1)+Math.max(0.15*men,men-0.25*(o.garr||0)))*(o.arms??1)*stateMil(o)*(1+0.35*rd)}return o.kind==='horde'?(o.pop*Math.min(1.3,o.mpR??1)+o.loot*3)*(0.7+0.9*rd)*(0.8+0.4*(o.prep??0.6))*(1+0.5*clamp(o.prest||0,0,1)):((o.tax||0)*1.6+0.25*o.pop*(o.coord??1)*Math.min(1.3,o.mpR??1))*stateMil(o)*(1+0.35*rd)}
function power(o){return Math.pow(strength(o)+1,P.scaleExp)*(0.3+o.S)*milAt(o.capital)}
const dd=i=>S.dist[i]>=65534?40:Math.min(60,S.dist[i]*0.5);
function defense(j){const s=S,w=WD,q=s.pol[j];let Ud;
  if(q){const d=s.pols[q];Ud=Math.pow(strength(d)+1,P.scaleExp)*(0.5*d.S+0.5*s.s[j])*milAt(j)*Math.exp(-dd(j)/d.h)*(0.6+0.4*s.integ[j]);if(d.kind==='state'&&fieldOn())Ud*=localForce(d,j)}
  else Ud=Math.pow((s.rally&&s.rally[j]>0?2*s.rally[j]:pEq(j)*4)+1,0.75)*s.s[j]*milAt(j)*0.8*(1+1.5*hardOf(s.eth[j]));
  return Ud*(1+1.6*w.rough[j])*(1+2.5*s.fort[j])*(1+0.6*s.colony[j]+(q?0.3*(s.pols[q].nob||0)+(j===s.pols[q].capital&&s.pols[q].tier==='City-state'?0.4:0):0));
}
function displace(j,frac,byPol){const s=S;const p=s.pop[j]*frac;if(p<1)return 0;s.pop[j]-=p;pushPressure(s.eth[j],p,j,byPol,null);return p}
// the cost of one step into newly taken land until the next distance search (provinces: as far as the two middles lie apart)
function stepCost(i,j){const w=WD,c=w.tcost[j]||2;return w.szF?Math.max(1,Math.round(c*(cwL(i)+cwL(j))/2)):c}
function attack(o,i,j,sea){
  const s=S,w=WD,q=s.pol[j];
  const di=dd(i);
  let Ua=Math.pow(strength(o)+1,P.scaleExp)*(0.5*o.S+0.5*s.s[i])*milAt(i)*Math.exp(-di/o.h);const FLD=fieldOn();if(FLD&&o.kind==='state'){Ua*=localForce(o,i);if(o.cmdTop===2&&q&&s.pols[q].rel!==o.rel)Ua*=1.2}if(sea){const dq=s.pol[j]?s.pols[s.pol[j]]:null;const nv=x=>x?(0.3+s.nav[x.capital]+0.5*s.ocean[x.capital])*Math.min(1,0.2+2*x.coastN/Math.max(1,x.cells)):0;Ua*=clamp(0.35+0.5*(nv(o)-0.7*nv(dq)),0.15,0.9)}
  if(!q&&s.pop[j]<1){if(!sea&&s.r()<(o.kind==='horde'?0.15*(0.15+0.85*rideOf(o)):dd(i)<0.45*o.h||s.fort[i]>0.3?0.05:0.005)&&(o.kind!=='horde'||w.nomad[j]||w.desert[j])){s.pol[j]=o.id;s.taken[j]=s.year;s.dist[j]=Math.min(65534,s.dist[i]+stepCost(i,j))}return}
  // a state does not take land that cannot pay for its own garrison, unless a caravan road runs through it
  if(!q&&o.kind==='state'&&armyOn()&&s.car[j]<0.3&&!oreWanted(o,j)&&s.pop[j]*s.farm[j]*cerealEff(j)<garrAt(j,0.08,calmOf(o),i)){
    // (Nein, 2026-11-11) land not worth holding may still be worth raiding for its people: columns go in to take slaves, as Rome's
    // did in Gaul and Germany. The raided harden against it
    if(slaveOn()&&s.pop[j]>=500&&!kinBan(o,s.rel[j])&&s.r()<0.3+0.7*(o.ineq||0.25)){const Ua=Math.pow(strength(o)+1,P.scaleExp)*(0.5*o.S+0.5*s.s[i])*milAt(i)*Math.exp(-dd(i)/o.h)*(fieldOn()?localForce(o,i):1),Ud=defense(j);
      if(s.r()<Ua/(Ua+Ud)){const e=s.eth[j];takeCaptives(o,j,0.1);displace(j,0.1,o.id);s.s[j]=Math.min(1,s.s[j]+0.03);s.slvRaid=(s.slvRaid||0)+1;if(e>=0&&s.eths[e])s.eths[e].hard=Math.min(1,(s.eths[e].hard||0)+0.005);
        if(e>=0&&s.eths[e]&&(o.cA||o.cells)>=25&&s.r()<0.02)chron('war',`The ${o.full} sends columns into the lands of the ${s.eths[e].name} to take slaves.`,j,[R_(o),RE(s.eths[e])])}}
    return}
  let Ud=defense(j);
  if(q&&(s.fort[j]>0.2||j===s.pols[q].capital||s.city[j]>=0))Ua*=siegeSupply(o,i);
  // stateless peoples melt into forest and hills and fight on; with no capital to take there is no single victory. Only gunpowder changes the odds.
  if(!q&&o.kind==='state')Ud*=(armyOn()?1.3+s.forest[j]+w.rough[j]:2.2+2*s.forest[j]+2*w.rough[j])/(1+3*s.gun[i])/(1+0.8*s.colony[i]);
  if(w.nomad[j]&&o.kind!=='horde'&&o.nomF<0.4){const ej=s.eth[j]>=0?s.eths[s.eth[j]]:null;Ud*=(1+3*(ej?ej.ride||0:0))/(1+2*s.gun[i])}
  if(w.tsetse[j]&&!w.tsetse[o.capital])Ud*=1.5;
  if(w.desert[j]&&w.rv[j]<0.3&&o.kind!=='horde'&&s.camel[i]<0.5)Ud*=1.5;
  // Carneiro: in a hemmed-in valley the beaten cannot flee, so wars end in absorption
  // the fortunes of war: even a match between equals can be won
  const pw=clamp(((Ua-Ud)/(Ua+Ud)*1.6+(q?0.1:0))*(q&&o.kind==='state'?1+0.8*s.circE[j]:1),0,0.92);
  const dpol=q?s.pols[q]:null;
  const kin=dpol&&s.eths[dpol.core]&&s.eths[o.core]&&s.eths[dpol.core].fam===s.eths[o.core].fam;
  const of=s.eths[o.core]?s.eths[o.core].fam:-2,ub=s.uni[j]>0.25&&s.uniFam[j]===of&&o.cells>=12?1+0.5*s.uni[j]:dpol&&s.uni[j]>0.25&&s.eths[dpol.core]&&s.eths[dpol.core].fam!==s.uniFam[j]?1+0.3*s.uni[j]:1;
  const tro=WD.trop[j]>0.5&&WD.trop[o.capital]<0.3?0.45:1;
  const pw2=tro*ub*(kin&&dpol.rel===o.rel?Math.min(0.9,pw*1.15+0.01):pw)*(o.kind==='state'?0.1+0.9*Math.pow(cerealEff(j),1.5):1);
  const eA=ecoD(j,o),pw3=pw2*Math.exp(-P.eco*(o.kind==='horde'?0.4:1.2)*Math.pow(Math.max(0,eA-0.4),1.3));
  const win=s.r()<pw3,wid0=q?o.enemies.get(q):null,war0=wid0!=null?s.wars[wid0]:null;
  if(FLD){if(o.kind==='state')armyCredit(o,i,win);if(q){const d=s.pols[q];if(d.kind==='state'){armyCredit(d,j,!win);if(win){d.lostAt=j;d.lostY=s.year}}}}
  if(win){
    const ej=s.eth[j];
    s.integ[j]=(ej>=0&&s.eths[ej]&&s.eths[o.core]&&s.eths[ej].fam===s.eths[o.core].fam?0.35:0.08)+(s.rel[j]===o.rel&&o.rel>=0?0.15:0);
    s.pol[j]=o.id;s.taken[j]=s.year;s.pop[j]*=0.93;takeCaptives(o,j,q?0.08:0.15);s.s[j]=Math.max(s.s[j]*0.8,0.05);s.dist[j]=Math.min(65534,s.dist[i]+(sea?6:stepCost(i,j)));
    if(o.kind==='horde'&&ej>=0&&ej!==o.core)displace(j,0.2,o.id);
    const a=cw(j);o.conq+=a;o.ruler.conq+=a;if(o.kind==='horde')o.prest=(o.prest||0)+0.02*a;
    if(q&&s.city[j]>=0)sackCity(o,j,q);
    if(q){const d=s.pols[q];d.lastBy=o.id;d.shock+=0.004*a;d.mandate=Math.max(0,(d.mandate||1)-0.01*a);const wid=o.enemies.get(q);if(wid!=null){const war=s.wars[wid];if(war.aSet.has(o.id))war.gA+=a;else war.gD+=a;war.lastGain=s.year;
        if(j===d.capital&&o.kind==='state'&&war.goal==='break'&&war.aSet.has(o.id))breakRealm(o,d,war);
        else if(j===d.capital&&o.kind==='state'&&(d.cells<=2||d.cells<0.7*o.cells||d.S<0.35))decisive(o,d,war)}}
  }
  // cohort switch: every engagement costs men on both sides, more for the side that loses; a taken province loses many of
  // its young men (killed, fled or carried off), more in a punitive campaign
  const CO=cohArr();if(CO){const dq=q?s.pols[q]:null,a=cw(j);o.lossYM=(o.lossYM||0)+(o.army||0)*(win?0.005:0.012)*a;if(dq)dq.lossYM=(dq.lossYM||0)+(dq.army||0)*(win?0.012:0.005)*a;
    if(win){const b=j*6+3,dl=CO[b]*(war0&&war0.goal==='punitive'?0.25:0.15);CO[b]-=dl;s.pop[j]=Math.max(0,s.pop[j]-dl)}}
}
// war goals (default since run 79): a show of force. The victor storms the capital and leaves the realm in pieces rather than annexing it
function breakRealm(o,d,war){
  const s=S,n=d.cells,old=d.full;endWar(war);s.activeWars=s.activeWars.filter(k=>k!==war.id);
  let bc=-1,bp=-1;for(const i of polCells(d.id))if(s.pop[i]>bp){bp=s.pop[i];bc=i}
  if(bc<0)return;d.capital=bc;d.shock+=0.8;d.mandate=0;
  if(n>=8)chron('war',`The ${o.full} storms the capital of the ${old} and breaks its power: the realm falls apart among its lords.`,o.capital,[R_(o),['pol',d.id,old],RW(war)],'A show of force: the victor wanted a weak neighbour, not more provinces.');
  if(polCells(d.id).length>=3)civilWar(d,true)}
function raid(o,i,j,deep){
  const s=S,q=s.pol[j],t=s.pols[q];if(!t||t.over===o.id||t.paysTo===o.id)return;
  const Ua=Math.pow(o.pop+1,0.75)*(0.5*o.S+0.5*s.s[i])*milAt(i),Ud=defense(j);
  if(s.r()<clamp((Ua-Ud*0.6)/(Ua+Ud),0.05,0.9)){
    takeCaptives(o,j,deep?0.15:0.06);if(deep)S.popWar=(S.popWar||0)+1;const taken=s.pop[j]*0.03,a=cw(j);s.pop[j]-=taken;o.loot+=taken*0.5;o.prest=(o.prest||0)+0.01*a;t.shock+=0.012*a;t.raided=(t.raided||0)+a;t.raidY=s.year;t.raidBy=o.id;s.raidC[j]=s.year;
    displace(j,0.04,o.id);
  }
}
function decisive(o,d,war){
  const s=S,r=s.r;const kin=s.eths[d.core]&&s.eths[o.core]&&s.eths[d.core].fam===s.eths[o.core].fam;
  const idn=s.uni[d.capital]>0.3&&s.eths[o.core]&&s.uniFam[d.capital]===s.eths[o.core].fam;
  // annex the whole realm only if the victor can hold it: its monopolies against the loser's own walls, scribes and cohesion;
  // otherwise the loser keeps its own ruler and pays tribute
  const hO=o.hold??0.5,hD=d.kind==='state'?selfHold(d):0.2;
  const annex=war.goal==='tribute'?false:d.cells<=0.15*o.cells||r()<clamp(0.1+1.1*(hO-0.7*hD)+((kin||idn)?0.2:0),0.05,0.9);
  const n=d.cells,old=d.full;
  if(annex){for(const i of polCells(d.id)){s.pol[i]=o.id;s.integ[i]=Math.min(s.integ[i],kin?0.4:0.12);s.dist[i]=Math.min(65534,(s.dist[d.capital]<65535?s.dist[d.capital]:4)+s.dist[i])}
    o.conq+=n;o.ruler.conq+=n;d.lastBy=o.id;
    if(n>=8){chron('war',`The capital of the ${old} falls, and with it the whole realm: the ${o.full} annexes all ${Math.round(n)} provinces.`,o.capital,[['pol',d.id,old],R_(o),RW(war)]);if(n>=25)spot(`The ${o.full} swallows the ${old}`,o.capital,[R_(o)])}}
  else{d.over=o.id;o.tribs++;endWar(war);s.activeWars=s.activeWars.filter(k=>k!==war.id);
    if(n>=8)chron('war',`With its capital taken, the ${old} submits and becomes a vassal of the ${o.full}.`,d.capital,[R_(d),R_(o),RW(war)])}
}
function distBFS(){
  if(WD.hopK){distProv();return}
  const s=S,w=WD,pols=s.pols;s.dist.fill(65535);
  const B=[];for(let k=0;k<32;k++)B.push([]);let pending=0;
  for(const id of s.alive){const c=pols[id].capital;if(s.pol[c]===id){s.dist[c]=0;B[0].push(c);pending++}}
  const tf=P.terrain;
  for(let d=0;pending>0&&d<60000;d++){
    const bk=B[d&31];B[d&31]=[];
    for(const i of bk){pending--;if(s.dist[i]!==d)continue;const p=s.pol[i],horde=pols[p].kind==='horde';
      for(let k=w.nbS[i];k<w.nbS[i+1];k++){const j=w.nbA[k];if(j<0||s.pol[j]!==p)continue;
        // built roads cut the climb most: stairways and switchbacks over the passes (the Inca roads, Hyslop 1984)
        let c=2+(w.tcost[j]-2)*tf*(s.roads[j]>0.5?0.4:1)*(s.pkT?1-0.45*s.pkT[j]:1);c*=w.nbD[k];if(s.roads[j]>0.5)c*=0.8;if(w.desert[j]&&(s.camel[j]>0.5||horde))c*=0.5;if(horde&&w.nomad[j])c=Math.min(c,1.5);
        const nd=d+Math.max(1,Math.min(30,Math.round(c)));if(s.dist[j]>nd){s.dist[j]=nd;B[nd&31].push(j);pending++}}
      if(w.coast[i]&&s.sail[i]>0.5)for(let q=w.ls[i];q<w.ls[i+1];q++){const j=w.lt[q],dl=w.ld[q];if(dl>3&&s.nav[i]<0.5)continue;if(s.pol[j]!==p)continue;const nd=d+Math.min(30,2+2*dl);if(s.dist[j]>nd){s.dist[j]=nd;B[nd&31].push(j);pending++}}
    }
  }
}
// the same on provinces: steps shorter than 100 km count their fraction (a search by the least cost so far, not in whole steps)
// (costs kept in doubles: a single-precision table rounded some costs below the heap's key, and those provinces were never
// reached, so they counted as cut off from the capital)
function distProv(){
  const s=S,w=WD,pols=s.pols,tf=P.terrain;s.dist.fill(65535);const df=s.distF&&s.distF.length===N&&s.distF instanceof Float64Array?s.distF:(s.distF=new Float64Array(N));df.fill(1e9);const H2=mkHeap();
  for(const id of s.alive){const c=pols[id].capital;if(s.pol[c]===id){df[c]=0;H2.push(0,c)}}
  // (step 2, relay seats; Nein 2026-11-05: loyal cities and forts count as relay seats; switch noseats turns it off) the court's
  // word is renewed at a loyal city or fort: land beyond one stands as if up to half as far from the capital, by how loyal the seat
  // is (settled into the realm, integ 0.4 to 0.8). A string of loyal seats carries rule a long way; a disloyal one passes nothing on
  const SEAT=!swOn('noseats');
  while(H2.size){let [d,i]=H2.pop();if(d>df[i])continue;s.dist[i]=Math.min(65534,Math.round(d));const p=s.pol[i],horde=pols[p].kind==='horde';
    let slack=0;if(SEAT&&d>0&&!horde&&(s.city[i]>=0||s.fort[i]>0.3)){const ly=clamp((s.integ[i]-0.4)/0.4,0,1);if(ly>0){d*=1-0.5*ly;slack=0.5}}
    for(let k=w.nbS[i];k<w.nbS[i+1];k++){const j=w.nbA[k];if(j<0||s.pol[j]!==p)continue;
      let c=2+(w.tcost[j]-2)*tf*(s.roads[j]>0.5?0.4:1)*(s.pkT?1-0.45*s.pkT[j]:1);if(s.roads[j]>0.5)c*=0.8;if(w.desert[j]&&(s.camel[j]>0.5||horde))c*=0.5;if(horde&&w.nomad[j])c=Math.min(c,1.5);
      c=Math.min(30,c)*w.nbD[k];const nd=d+Math.max(0.1,c);if(nd<df[j]-slack){df[j]=nd;H2.push(nd,j)}}
    if(w.coast[i]&&s.sail[i]>0.5)for(let q=w.ls[i];q<w.ls[i+1];q++){const j=w.lt[q],dl=w.ld[q];if(dl>3&&s.nav[i]<0.5)continue;if(s.pol[j]!==p)continue;const nd=d+Math.min(30,2+2*dl);if(nd<df[j]-slack){df[j]=nd;H2.push(nd,j)}}}
}
/* wars and diplomacy */
function declareWar(As,Ds,name,notable,civil,holy){
  const s=S,r=s.r,id=s.wars.length,A=As[0],D=Ds[0];
  const war={id,name:name||`the ${A.base}–${D.base} War`,a:As.map(o=>o.id),d:Ds.map(o=>o.id),start:s.year,end:0,gA:0,gD:0,civil:!!civil,holy:!!holy,notable:!!notable,aSet:null,why:null,outcome:''};
  if(!civil){
    for(const al of A.allies){const p=s.pols[al];if(p&&p.alive&&!D.allies.includes(al)&&!war.d.includes(al)&&!p.enemies.has(D.id)&&r()<(holy&&p.rel===A.rel?0.85:0.6))war.a.push(al)}
    for(const al of D.allies){const p=s.pols[al];if(p&&p.alive&&!war.a.includes(al)&&!war.d.includes(al)&&r()<0.75)war.d.push(al)}
    if(holy){for(const [q] of D.nb){const p=s.pols[q];if(p&&p.alive&&p.kind==='state'&&p.rel===A.rel&&!war.a.includes(q)&&!war.d.includes(q)&&!p.enemies.has(D.id)&&r()<0.3*P.zeal)war.a.push(q)}}
  }
  war.aSet=new Set(war.a);
  for(const a of war.a)for(const d of war.d){const pa=s.pols[a],pd=s.pols[d];if(!pa.enemies.has(d)){pa.enemies.set(d,id);pd.enemies.set(a,id)}}
  for(const k of war.a.concat(war.d))s.pols[k].warsF.push(id);
  s.wars.push(war);s.activeWars.push(id);
  return war;
}
function endWar(war){
  const s=S;war.end=s.year;
  for(const a of war.a)for(const d of war.d){const pa=s.pols[a],pd=s.pols[d];
    if(pa.enemies.get(d)===war.id){pa.enemies.delete(d);pd.enemies.delete(a)}
    const tr=war.treaty!=null?Math.round(10+30*war.treaty):25;pa.truce.set(d,s.year+tr);pd.truce.set(a,s.year+tr)}
  const A=s.pols[war.a[0]],D=s.pols[war.d[0]],yrs=s.year-war.start;
  let out;
  if(war.civil){out=A.alive&&D.alive?`${A.base} and the other rebels keep their independence`:A.alive?`the rebels prevail`:`the old regime restores its rule`}
  else if(war.gA>war.gD+2)out=`the ${A.base} side takes ${Math.round(war.gA-war.gD)} provinces`;
  else if(war.gD>war.gA+2)out=`the ${D.base} side turns the tide and takes ${Math.round(war.gD-war.gA)} provinces`;
  else out='it ends without decisive gains';
  war.outcome=out;
  if(war.notable||war.gA+war.gD>=25)chron('war',`${cap(war.name)} ends after ${yrs} year${yrs===1?'':'s'}; ${out}.`,A.alive?A.capital:D.capital,[RW(war),RB(A),RB(D)]);
  const win=war.gA>war.gD+2?A:war.gD>war.gA+2?D:null;
  if(win&&win.alive&&Math.abs(war.gA-war.gD)>=15){const f=figFor(win,win.ruler,'ruler');deed(f,`Victor in ${war.name}`,[RW(war)])}
}
function affinity(o,p){
  const s=S;let a=0,threat=null;
  if(o.rel>=0&&o.rel===p.rel)a+=0.45;else if(o.rel>=0&&p.rel>=0)a-=0.2;
  a+=0.3*(1-ethDist(o.core,p.core));
  const po=power(o),pp=power(p);
  for(const [t] of o.nb){if(t===p.id||!p.nb.has(t))continue;const T=s.pols[t];if(T&&T.alive&&power(T)>1.3*Math.max(po,pp)){a+=0.45+(T.rel>=0&&T.rel!==o.rel&&o.rel===p.rel?0.25:0);threat=T;break}}
  if((o.truce.get(p.id)||-1e9)>s.year-10)a-=0.4;
  if(o.enemies.has(p.id))a-=1;
  return[a,threat];
}
function diplomacy(){
  const s=S,r=s.r,pols=s.pols;
  for(const id of s.alive){const o=pols[id];
    o.allies=o.allies.filter(q=>{const p=pols[q];if(!p||!p.alive||o.enemies.has(q))return false;
      if(o.league!=null&&p.league===o.league)return true;
      if(q>id){const [a]=affinity(o,p);if(a<0.15&&r()<0.3){p.allies=p.allies.filter(x=>x!==id);
        if(o.cells>=40&&p.cells>=40)chron('diplomacy',`The alliance between the ${o.full} and the ${p.full} lapses.`,o.capital,[R_(o),R_(p)]);return false}}
      return true});
    if(o.cells<2)continue;
    for(const [q] of o.nb){if(q<=id)continue;const p=pols[q];if(!p||!p.alive||o.allies.includes(q)||o.enemies.has(q)||p.cells<2)continue;
      if((o.allies.length>=3&&o.league==null)||(p.allies.length>=3&&p.league==null)||o.allies.length>=8||p.allies.length>=8)continue;
      let [a,threat]=affinity(o,p);const marriage=r()<0.06&&o.kind==='state'&&p.kind==='state';if(marriage)a+=0.3;
      if(a>0.55&&r()<0.25*P.allyRate){o.allies.push(q);p.allies.push(id);
        if(o.cells>=30&&p.cells>=30){const faith=o.rel>=0&&o.rel===p.rel&&threat&&threat.rel!==o.rel;
          chron('diplomacy',`The ${o.full} and the ${p.full} conclude an alliance${threat?` against the ${threat.full}`:''}${faith?`, brothers in ${s.rels[o.rel].name} against an unbelieving power`:''}${marriage?', sealed by a royal marriage':''}.`,o.capital,threat?[R_(o),R_(p),R_(threat)]:[R_(o),R_(p)])}}}
    if(o.kind==='horde'&&o.cells>=6){for(const [q] of o.nb){const p=pols[q];if(!p||!p.alive||p.kind==='horde'||p.over||o.enemies.has(q)||p.cells<3)continue;
      if(power(o)>1.3*power(p)&&(p.raided||0)>3&&r()<0.15){p.over=id;o.tribs++;if(p.cells>=25)chron('diplomacy',`Worn down by raids, the ${p.full} agrees to pay tribute to the ${o.full}.`,p.capital,[R_(p),R_(o)])}}}
    o.raided=0;
    const y=s.year;if(o.over&&!o.overY)o.overY=y;if(!o.over)o.overY=0;
    if(o.over&&o.kind==='state'){const ov=pols[o.over];if(ov&&ov.alive&&ov.kind==='state'&&y-o.overY>40&&power(ov)>3*power(o)&&r()<0.01*Math.max(0.1,2*(ov.hold??0.5)-selfHold(o))*(s.eths[ov.core]&&s.eths[o.core]&&s.eths[ov.core].fam===s.eths[o.core].fam?2:1)){const n=o.cells,old=o.full;for(const c of polCells(o.id)){s.pol[c]=ov.id;s.integ[c]=Math.max(s.integ[c]*0.6,0.3);s.dist[c]=Math.min(65534,(s.dist[o.capital]<65535?s.dist[o.capital]:0)+s.dist[c]+4)}ov.tribs=Math.max(0,ov.tribs-1);o.over=0;if(n>=10)chron('diplomacy',`The ${ov.full} absorbs its long-time vassal, the ${old}.`,o.capital,[R_(ov),['pol',o.id,old]]);continue}}
    if(o.over){const ov=pols[o.over];if(!ov||!ov.alive||power(o)>power(ov)){if(ov&&ov.alive&&o.cells>=25)chron('diplomacy',`The ${o.full} stops paying tribute to the ${ov.full}.`,o.capital,[R_(o),R_(ov)]);if(ov)ov.tribs=Math.max(0,ov.tribs-1);o.over=0}}
  }
}
/* ---------- faith ---------- */
function foundReligion(o){
  const s=S,r=s.r,cells=polCells(o.id);if(!cells.length)return;
  const site=holySite(cells),c=site?site.cell:pick(r,cells),L=langAt(c),e=s.eth[c]>=0?s.eths[s.eth[c]]:null;
  const Rp=newRuler(L,null);Rp.epithet='';Rp.birth=s.year-(25+((r()*15)|0));Rp.death=Rp.birth+55+((r()*25)|0);
  const f=figFor(null,Rp,'prophet');f.pol=o.id;f.eth=s.eth[c];f.title=`Prophet of the ${e?e.name:'people'}`;f.died=Rp.death;
  const G=cap(L.lex.god),F=Rp.base;
  const name=pick(r,[`${G}ism`,`the Way of ${F}`,`the ${G} Covenant`,`the Faith of ${G}`,`${F}ism`,`the ${cap(L.lex.sun)} Path`]);
  const universal=r()<0.65;
  if(s.city[c]<0){s.city[c]=s.cities.length;s.cities.push({name:site?site.name:cityWord(L,r),cell:c,born:s.year,eth:s.eth[c],peak:s.pop[c],holy:true})}
  if(site){site.faith=s.rels.length;chron('faith',`The new faith takes the ancient sanctuary of ${site.name} for its holy city; people have gathered there for ${s.year-site.born} years.`,c)}
  const R={id:s.rels.length,name,founder:f.id,born:s.year,origin:c,holy:c,pol:o.id,eth:s.eth[c],fam:e?e.fam:-1,kind:universal?'universal':'ethnic',miss:universal?0.35+0.65*r():0.15,cent:universal?0.3+0.4*r():0.1,holder:o.id,rgb:hsl(r()*360,0.55,0.48),parent:-1,kids:[],cells:0,pop:0,peak:0,alive:true,states:[],councils:0};
  s.rels.push(R);f.rel=R.id;
  s.rel[c]=R.id;for(let d=WD.nbS[c];d<WD.nbS[c+1];d++){const j=WD.nbA[d];if(j>=0&&s.pop[j]>=1&&s.pol[j]===o.id)s.rel[j]=R.id}
  deed(f,`Began to preach ${name} in the ${o.full}`,[RR(R),R_(o)]);
  chron('faith',`The prophet ${f.name} begins to preach ${name} in the ${o.full}${universal?', a faith open to every people':''}.`,c,[RF(f),RR(R),R_(o)]);
  spot(`The prophet ${f.name} begins to preach ${name}`,c,[RF(f),RR(R)]);
}
function holyName(R){const c=S.city[R.holy];return c>=0?S.cities[c].name:'its holy city'}
function relPass(){
  const s=S,w=WD,E=s.rels,n=E.length;if(!n)return;
  const L=w.landIdx,sx=new Float64Array(n),sy=new Float64Array(n),sz=new Float64Array(n),cnt=new Float64Array(n),pp=new Float64Array(n);
  for(let k=0;k<L.length;k++){const i=L[k],e=s.rel[i];if(e<0||s.pop[i]<1)continue;sx[e]+=w.x3[i];sy[e]+=w.y3[i];sz[e]+=w.z3[i];cnt[e]+=cw(i);pp[e]+=s.pop[i]}
  for(let e=0;e<n;e++){const R=E[e];R.cells=cnt[e];R.pop=pp[e];if(cnt[e]>R.peak)R.peak=cnt[e];
    if(R.alive&&!cnt[e]){R.alive=false;R.died=s.year;if(R.peak>=30)chron('faith',`The last followers of ${R.name} are gone; at its height it held ${Math.round(R.peak)} provinces.`,R.origin,[RR(R)])}
    if(cnt[e]){const m=Math.hypot(sx[e],sy[e],sz[e])||1;sx[e]/=m;sy[e]/=m;sz[e]/=m;R.lon=Math.atan2(sy[e],sx[e]);R.la=Math.asin(clamp(sz[e],-1,1))}
    if(!R.alive)continue;
    // centralization follows who holds the holy city
    const hp=s.pol[R.holy],holder=hp?s.pols[hp]:null,faithful=holder&&holder.rel===R.id;
    if(faithful)R.cent=clamp(R.cent+0.04*(0.3+s.admin[R.holy]),0,1);else R.cent=clamp(R.cent-0.05,0,1);
    if(holder&&holder.id!==R.holder&&R.peak>=20){
      if(!faithful&&holder.rel>=0)chron('faith',`The holy city of ${holyName(R)} falls to the ${holder.full}, who follow ${E[holder.rel].name}; the faithful of ${R.name} lose their centre.`,R.holy,[RR(R),R_(holder),RR(E[holder.rel])]);
      else if(faithful&&R.holder&&s.pols[R.holder]&&s.pols[R.holder].rel!==R.id)chron('faith',`The faithful of ${R.name} recover their holy city of ${holyName(R)} under the ${holder.full}.`,R.holy,[RR(R),R_(holder)])}
    R.holder=holder?holder.id:0;
  }
  const md=new Float64Array(n).fill(2),far=new Int32Array(n).fill(-1);
  for(let k=0;k<L.length;k++){const i=L[k],e=s.rel[i];if(e<0||s.pop[i]<1)continue;const d=w.x3[i]*sx[e]+w.y3[i]*sy[e]+w.z3[i]*sz[e];if(d<md[e]){md[e]=d;far[e]=i}}
  const thr=14*2*Math.PI/W;let made=0;
  for(let e=0;e<n&&made<3;e++){const R=E[e];
    if(!R.alive||cnt[e]<40||far[e]<0||Math.acos(clamp(md[e],-1,1))<thr)continue;
    const f0=far[e],age=(s.year-R.born)/1000;
    const pSch=0.12*P.faith*(1-0.7*R.cent)*(1+1.5*s.paper[f0])*(1+0.5*Math.min(2,age));
    if(s.r()>pSch)continue;
    if(R.cent>0.55&&s.r()<R.cent*0.7){R.councils++;if(R.peak>=30)chron('faith',`A council at ${holyName(R)} settles a dispute that threatened to split ${R.name}.`,R.holy,[RR(R)]);continue}
    const L2=langAt(f0),Rp=newRuler(L2,null);Rp.epithet='';Rp.birth=s.year-30;Rp.death=s.year+20+((s.r()*25)|0);
    const fg=figFor(null,Rp,'reformer');fg.pol=s.pol[f0];fg.eth=s.eth[f0];fg.title='Reformer';fg.died=Rp.death;
    const core=R.name.replace(/^the /,'');
    const nm=pick(s.r,[`Reformed ${core}`,`${cap(word(L2,s.r))}ism`,`the New ${core}`,`the ${Rp.base} Church`]);
    if(s.city[f0]<0){s.city[f0]=s.cities.length;s.cities.push({name:cityWord(L2,s.r),cell:f0,born:s.year,eth:s.eth[f0],peak:s.pop[f0],holy:true})}
    const C={id:E.length,name:nm,founder:fg.id,born:s.year,origin:f0,holy:f0,pol:s.pol[f0],eth:s.eth[f0],fam:R.fam,kind:R.kind,miss:clamp(R.miss+gauss(s.r)*0.15,0.1,1),cent:0.25,holder:s.pol[f0],rgb:hsl(s.r()*360,0.5,0.5),parent:e,kids:[],cells:0,pop:0,peak:0,alive:true,states:[],councils:0};
    E.push(C);R.kids.push(C.id);fg.rel=C.id;made++;
    for(let k=0;k<L.length;k++){const i=L[k];if(s.rel[i]!==e)continue;
      if(w.x3[i]*w.x3[f0]+w.y3[i]*w.y3[f0]+w.z3[i]*w.z3[f0]>w.x3[i]*sx[e]+w.y3[i]*sy[e]+w.z3[i]*sz[e])s.rel[i]=C.id}
    deed(fg,`Broke with ${R.name} and founded ${nm}`,[RR(R),RR(C)]);
    const causes=[];if(R.cent<0.3)causes.push('the faith had no strong centre');if(s.paper[f0]>0.5)causes.push('cheap books spread new readings');if(age>1)causes.push('long-standing grievances against its clergy');
    chron('faith',`A schism splits ${R.name}: followers of the reformer ${fg.name} form ${nm}.`,f0,[RR(R),RF(fg),RR(C)],causes.length?'Because '+causes.join(', and ')+'.':null);
  }
}
/* ---------- migrations ---------- */
function pushPressure(e,amount,cell,byPol,fromMig){
  const s=S,r=s.r;if(e<0||amount<1)return;
  let m=s.press.get(e);if(!m||s.year-m.y>40){m={p:0,y:s.year,cell,by:byPol,mig:fromMig};s.press.set(e,m)}
  m.p+=amount;m.cell=cell;if(byPol)m.by=byPol;if(fromMig!=null)m.mig=fromMig;
  const E0=s.eths[e];
  if(m.p>80000&&s.activeMigs.length<10&&r()<0.35*P.wander&&!(E0.lastMig&&s.year-E0.lastMig<150)){
    s.press.delete(e);E0.lastMig=s.year;
    let dx=0,dy=0;const by=m.by?s.pols[m.by]:null;
    if(by&&by.alive){dx=-dxWrap(cell,by.capital);dy=-(WD.cyA[by.capital]-WD.cyA[cell])}
    if(m.mig!=null){const M=s.migs[m.mig];if(M){dx=M.dx;dy=M.dy}}
    if(!dx&&!dy){const a=r()*6.28;dx=Math.cos(a);dy=Math.sin(a)}
    startMigration({eth:e,pop:m.p,cell,dx,dy,kind:'people',by,prev:m.mig})
  }
}
function startMigration(o){
  const s=S,w=WD,e=s.eths[o.eth];const n=Math.hypot(o.dx,o.dy)||1;
  const M={id:s.migs.length,eth:o.eth,rel:s.rel[o.cell],name:o.kind==='horde'&&o.pol?o.pol.full:e.name,pop:o.pop,cell:o.cell,dx:o.dx/n,dy:o.dy/n,path:[o.cell],kind:o.kind,start:s.year,steps:0,max:20+((s.r()*25)|0),fails:0,
    S:0.75,mil:milAt(o.cell),farm:s.farm[o.cell],herd:s.herd[o.cell],techs:s.tk.map(f=>f[o.cell]),herds:herdSnapshot(o.cell),pol:o.pol?o.pol.id:0,prev:o.prev!=null?o.prev:-1,by:o.by?o.by.id:0,done:false,result:'',broke:[],cause:o.cause||''};
  s.migs.push(M);s.activeMigs.push(M.id);
  const refs=[RM(M),RE(e)];let txt;
  const dir=dirWord(M.dx,M.dy);
  if(o.kind==='horde')txt=`${o.cause==='drought'?'Driven from parched pastures':'Hungry for richer lands'}, the ${M.name} sets out ${dir}ward, some ${fmtK(M.pop)} strong.`;
  else if(M.prev>=0){const P0=s.migs[M.prev];refs.push(RM(P0));txt=`Fleeing the ${P0.name}, the ${e.name} take to the roads and head ${dir}, ${fmtK(M.pop)} people in all.`}
  else if(o.by){refs.push(R_(o.by));txt=`Driven out by the ${o.by.full}, the ${e.name} take to the roads and head ${dir}, ${fmtK(M.pop)} people in all.`}
  else txt=`The ${e.name} take to the roads and head ${dir}, ${fmtK(M.pop)} people in all.`;
  M.startTxt=txt;M.logged=M.pop>=100000||o.kind==='horde'||M.prev>=0;
  if(M.logged)chron('migration',txt,o.cell,refs);
  if(M.pop>400000)spot(`The ${M.name} ${o.kind==='horde'?'is':'are'} on the move`,o.cell,[RM(M)]);
  return M;
}
function fmtK(n){return n>=1e6?(n/1e6).toFixed(1)+' million':Math.round(n/1000)*1000>=1000?Math.round(n/1000)+' thousand':Math.round(n)+''}
function migStep(M){
  const s=S,w=WD,r=s.r;
  if(M.done)return;
  let best=-1,bs=-1e9;const c=M.cell,cx=w.cxA[c],cy=w.cyA[c];
  ring(c,1,(j,dx,dy)=>{if(j===c||!w.land[j]||w.T[j]<-9)return;
    const k=s.K[j],p=s.pop[j],room=k>1?clamp((k-p)/(k+1),-1,1):-1;
    let sc=2.2*(dx*M.dx+dy*M.dy)/Math.hypot(dx,dy)-0.15*(w.tcost[j]-2)*P.terrain+0.8*room+r()*0.7;
    if(M.path.includes(j))sc-=3;if(w.desert[j]&&M.kind!=='horde')sc-=1;
    if(sc>bs){bs=sc;best=j}});
  if(best<0){disperse(M,'trapped');return}
  const j=best;M.cell=j;M.steps++;M.pop*=0.985;if(M.path.length<240)M.path.push(j);
  const q=s.pol[j];
  if(q&&q!==M.pol){
    const t=s.pols[q];
    const Um=Math.pow(M.pop,0.75)*M.S*M.mil,Ud=defense(j)*(t.kind==='horde'?0.8:1);
    if(r()<clamp((Um-Ud)/(Um+Ud)*1.6+0.12,0.04,0.92)){
      M.pop*=0.94;displace(j,0.25,0);const pr=s.press.get(s.eth[j]);if(pr)pr.mig=M.id;
      t.shock+=t.cells>=20?0.08:0.02;
      if(!M.broke.includes(q)){M.broke.push(q);if(t.cells>=20){if(!M.logged){M.logged=true;chron('migration',M.startTxt,M.path[0],[RM(M),RE(s.eths[M.eth])])}chron('migration',`The ${M.name} break through the frontier of the ${t.full}.`,j,[RM(M),R_(t)]);t.invaded=(t.invaded||0)+1}}
      if((M.steps>=3&&r()<0.12)||M.steps>M.max)settle(M,j,t);
    }else{M.pop*=0.8;M.fails++;const a=(r()<0.5?1:-1)*(0.8+r()*0.9),ca=Math.cos(a),sa=Math.sin(a),nx=M.dx*ca-M.dy*sa,ny=M.dx*sa+M.dy*ca;M.dx=nx;M.dy=ny;
      if(M.fails>5)settle(M,M.path[Math.max(0,M.path.length-2)],null)}
  }else{
    if(pEq(j)>1000&&s.eth[j]>=0&&s.eth[j]!==M.eth){displace(j,0.15,0);const pr=s.press.get(s.eth[j]);if(pr)pr.mig=M.id}
    const room=s.K[j]-s.pop[j];
    if(M.steps>2&&room>0&&M.pop>40000&&r()<0.09)dropPocket(M,j,0.04+0.04*r());
    if((room>M.pop*0.15&&M.steps>4&&r()<0.25)||M.steps>M.max)settle(M,j,null);
  }
  if(!M.done&&M.pop<15000)disperse(M,'dwindled');
}
// a band that stays behind: a pocket of the migrating people inside other peoples' lands
function dropPocket(M,j,f){const s=S,d=M.pop*f;if(d<500)return;M.pop-=d;const old=s.pop[j],oe=s.eth[j];s.pop[j]+=d;
  if(oe<0||old<1){s.eth[j]=M.eth;s.eth2[j]=-1}
  else if(oe!==M.eth){if(d>old){s.eth[j]=M.eth;s.eth2[j]=oe;s.mix[j]=old/(old+d)}else{s.eth2[j]=M.eth;s.mix[j]=Math.max(s.mix[j]||0,d/(old+d))}s.mixT[j]=0}
  for(let k=0;k<s.tk.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],(M.techs[k]||0)*0.6);herdPlant(M.herds,j,0.5);
  (M.pockets||(M.pockets=[])).push(j)}
function disperse(M,why){const s=S;M.done=true;M.end=s.year;M.result=why==='trapped'?'trapped and scattered':'dwindled and scattered';
  if(M.pop>0&&M.cell>=0){const tail=M.path.slice(-4);for(const c of tail)if(WD.land[c])dropPocket(M,c,0.6/tail.length)}
  s.activeMigs=s.activeMigs.filter(k=>k!==M.id);
  if(M.logged&&M.path.length>8)chron('migration',`The ${M.name} ${M.result} after ${s.year-M.start} years of wandering.`,M.cell,[RM(M)])}
function settle(M,j,t){
  const s=S,w=WD,r=s.r;M.done=true;M.end=s.year;s.activeMigs=s.activeMigs.filter(k=>k!==M.id);
  // the grid spread them over nine cells near where they stopped; provinces over nine cells' worth of land, by area
  const cells=[],z=w.szF;let aT=0;ring(j,2,(c)=>{if(w.land[c]&&w.T[c]>-9&&(z?aT<9:cells.length<9)){cells.push(c);aT+=cw(c)}});
  const per0=M.pop/cells.length;
  for(const c of cells){const old=s.pop[c],oe=s.eth[c],per=z?M.pop*cw(c)/aT:per0;s.pop[c]+=per;
    if(oe<0||old<1){s.eth[c]=M.eth;s.eth2[c]=-1}
    else if(oe!==M.eth){if(per>old){s.eth[c]=M.eth;s.eth2[c]=oe;s.mix[c]=old/(old+per)}else{s.eth2[c]=M.eth;s.mix[c]=per/(old+per)}s.mixT[c]=0}
    if(M.rel>=0&&per>old)s.rel[c]=M.rel;
    for(let k=0;k<s.tk.length;k++)s.tk[k][c]=Math.max(s.tk[k][c],(M.techs[k]||0)*0.8);herdPlant(M.herds,c,0.8)}
  const e=s.eths[M.eth],farmland=w.sF[j]>0.3&&M.farm>0.5;
  const strong=M.pop>100000;
  let o=null;
  if(strong){
    const id=newPolity(j,null,{kind:farmland?'state':'horde',origin:{type:'migration',mig:M.id,people:M.eth,from:t?t.id:0},conqDyn:!!t});
    o=s.pols[id];o.S=0.7;for(const c of cells){s.pol[c]=id;s.s[c]=Math.max(s.s[c],0.65)}
  }
  M.settledPol=o?o.id:0;
  M.result=o?`settled and founded the ${o.full}`:`settled among the locals`;
  const refs=[RM(M),RE(e)];if(t)refs.push(R_(t));if(o)refs.push(R_(o));
  if(M.logged||o)chron('migration',`After ${s.year-M.start} years on the move, the ${M.name} settle${t?` in the lands of the ${t.full}`:''}${o?` and found the ${o.full}`:' and mingle with the people there'}.`,j,refs);
  if(o&&t&&t.cells>=30)spot(`The ${M.name} found the ${o.full} inside the ${t.full}`,j,[R_(o),R_(t)]);
}
function hordeMigration(o){
  const s=S,r=s.r,cells=polCells(o.id);if(!cells.length)return;
  let best=null,bp=0;for(const [q] of o.nb){const t=s.pols[q];if(t&&t.alive&&t.kind==='state'&&t.pop>bp){bp=t.pop;best=t}}
  let tot=0;for(const c of cells){const take=s.pop[c]*0.6;s.pop[c]-=take;tot+=take}
  let dx,dy;if(best){dx=dxWrap(o.capital,best.capital);dy=WD.cyA[best.capital]-WD.cyA[o.capital]}else{const a=r()*6.28;dx=Math.cos(a);dy=Math.sin(a)}
  o.shock+=0.4;
  startMigration({eth:o.core,pop:tot,cell:o.capital,dx,dy,kind:'horde',pol:o,cause:o.wet<-0.4?'drought':'riches'});
}
/* ---------- culture ---------- */
const WORKS=['epic','temple','chronicle','law treatise','observatory','song cycle','palace','book of hymns','philosophy','great library'];
function culture(o){
  const s=S,r=s.r,c=o.capital;
  const surplus=clamp(1.15-o.press,0,1),stab=clamp(1-o.psi/2,0,1),lit=s.admin[c];
  const conn=0.5*clamp((o.nb.size+o.allies.length)/8,0,1)+0.5*clamp(s.paper[c]+(WD.coast[c]?0.3:0),0,1);
  const urb=clamp(o.cityPop/(o.pop+1)*4,0,1),patron=clamp(o.E/etOf(o),0,2)/2;
  const tgt=(0.3+0.7*Math.sqrt(surplus))*stab*(0.3+0.7*lit)*(0.5+0.5*(0.4*urb+0.3*conn+0.3*patron))*(o.kind==='horde'?0.5:1);
  o.cult+=(tgt-o.cult)*0.05;
  o.cultWhy={surplus,stab,lit,conn,urb,patron};
  if(o.cult>0.5){if(!o.goldStart)o.goldStart=s.year;
    if(r()<0.01*o.cult&&o.cells>=6){const L=langAt(c),Rp=newRuler(L,null);Rp.epithet='';Rp.birth=s.year-30-((r()*20)|0);Rp.death=s.year+((r()*25)|0);
      const f=figFor(o,Rp,'sage');f.title=`Sage of the ${o.full}`;f.died=Rp.death;f.works=1;
      const kind=pick(r,WORKS),name=`the ${kind} of ${Rp.base}`;o.works.push({y:s.year,name,fig:f.id});deed(f,`Created ${name}`,[R_(o)]);
      if(o.cells>=25)chron('culture',`In the ${o.full}, ${Rp.base} completes ${name}.`,c,[R_(o),RF(f)])}}
  else if(o.goldStart&&o.cult<0.38){const len=s.year-o.goldStart;
    if(len>=60){o.golds.push([o.goldStart,s.year]);
      const why=o.cultWhy,parts=[];if(why.surplus>0.4)parts.push('ample harvests');if(why.stab>0.6)parts.push('long peace at home');if(why.urb>0.5)parts.push('great cities');if(why.conn>0.5)parts.push('busy contacts abroad');if(why.patron>0.5)parts.push('rich patrons');
      const nw=o.works.filter(x=>x.y>=o.goldStart).length;
      if(o.cells>=20&&nw>=1)chron('culture',`Looking back, the years ${fy(o.goldStart)} to ${fy(s.year)} were a flowering for the ${o.full}${parts.length?', fed by '+parts.slice(0,3).join(', '):''}; ${nw} great work${nw>1?'s':''} date${nw>1?'':'s'} from it.`,c,[R_(o)])}
    o.goldStart=0}
}
/* ---------- states, each year ---------- */
function politics(){for(const _ of politicsG());}
function* politicsG(){
  if(!S.recK)recPass();
  const s=S,w=WD,r=s.r,y=s.year,pols=s.pols,L=w.landIdx,pol=s.pol,pop=s.pop,szF=w.szF||null;const s_K=s.K,s_admin=s.admin,s_recK=s.recK,s_anom=s.anom,s_ard=s.ard,s_camel=s.camel,s_car=s.car,s_circE=s.circE,s_coin=s.coin,s_dist=s.dist,s_eth=s.eth,s_eths=s.eths,s_farm=s.farm,s_figs=s.figs,s_fort=s.fort,s_gun=s.gun,s_herd=s.herd,s_horse=s.horse,s_integ=s.integ,s_isleBy=s.isleBy,s_isleName=s.isleName,s_law=s.law,s_leagues=s.leagues,s_lmPop=s.lmPop,s_metal=s.metal,s_migs=s.migs,s_nav=s.nav,s_paper=s.paper,s_pol=s.pol,s_pols=s.pols,s_pop=s.pop,s_rel=s.rel,s_rels=s.rels,s_roads=s.roads,s_s=s.s,s_sail=s.sail,s_taken=s.taken,s_tk=s.tk,s_uni=s.uni,s_uniFam=s.uniFam,s_wars=s.wars,w_area=w.area,w_coast=w.coast,w_cosLat=w.cosLat,w_cosLon=w.cosLon,w_cyA=w.cyA,w_desert=w.desert,w_heavy=w.heavy,w_land=w.land,w_ld=w.ld,w_lm=w.lm,w_lmSize=w.lmSize,w_ls=w.ls,w_lt=w.lt,w_nD=w.nD,w_nM=w.nM,w_nN=w.nN,w_nT=w.nT,w_nbS=w.nbS,w_nbA=w.nbA,w_nbW=w.nbW,w_nomad=w.nomad,w_sF=w.sF,w_sH=w.sH,w_sinLon=w.sinLon,w_tsetse=w.tsetse,s_cStore=s.cStore,s_irrig=s.irrig,s_sFc=s.sFc;
  const sampleNow=y%10===0,SCK=sclK(),SWt=swOn('threat'),CO=cohArr();
  const ARMY=armyOn(),MONEY=moneyOn();
  for(const id of s.alive){const o=pols[id];o.calm=calmOf(o);o.pop=0;o.K=0;o.cells=0;o.sS=0;o.dS=0;o.ad=0;o.nom=0;o.cx=0;o.cy=0;o.yy=0;o.mp=-1;o.mc=-1;o.coastN=0;o.farmN=0;o.fortN=0;o.lmN=0;o.tax=0;o.garr=0;o.ig=0;o.wasteN=0;o.cA=0;o.plN=0;o.hvN=0;o.trade=0;o.n0=0;o.n1=0;o.n2=0;o.n3=0;o.nw=0;o.forP=0;if(sampleNow){o.sample=[];o.front=[]}if(CO){o.lossF=o.lossYM&&o.ym>0?Math.min(0.5,o.lossYM/o.ym):0;o.lossYM=0;o.ym=0}}
  for(let k=0;k<L.length;k++){const i=L[k],p=pol[i];if(!p)continue;const o=pols[p];if(CO){const b=i*6+3;if(o.lossF>0){const dl=CO[b]*o.lossF;CO[b]-=dl;pop[i]=Math.max(0,pop[i]-dl)}o.ym+=CO[b]}const pp=pop[i];
    // on provinces every mean and tally over a realm's land is weighted by the land each holds (ci cells; the grid: 1 each),
    // coasts, walled frontiers and caravan routes by their length
    const ci=szF?1/szF[i]:1,li=szF?Math.sqrt(ci):1;
    o.pop+=pp;o.K+=s_K[i];o.cells++;if(szF)o.cA+=ci;o.sS+=s_s[i]*ci;const di=dd(i);o.dS+=di*ci;let eD=0;if(pp>=1){o.n0+=pp*w_nT[i];o.n1+=pp*w_nM[i];o.n2+=pp*w_nN[i];o.n3+=pp*w_nD[i];o.nw+=pp;if(o.ni){eD=ecoD(i,o);if(eD>0.8)o.forP+=pp}}o.ad+=s_recK[i]*ci;o.ig+=s_integ[i]*ci;if(ARMY&&o.kind==='state'&&i!==o.capital)o.garr+=garrAt(i,s_integ[i],o.calm??0.5)+(s.slv?0.3*GAR*ci*s.slv[i]:0);const pl=s_ard[i]>0.5&&!w_tsetse[i];o.tax+=pp>=1?pp*s_farm[i]*taxEff(i)*(o.leg??1)*((o.ext??0.45)/0.45)*Math.exp(-di/(o.h||6))*(MONEY?(o.mon||0)+(1-(o.mon||0))*Math.exp(-di*(1-(o.haul??0.5))/(0.6*(o.h||6))):1)*(0.5+0.5*s_integ[i])*(0.6+0.4*s_circE[i])*(pl?1.1:0.8)/(1+0.3*P.eco*eD):0;if(pl)o.plN+=ci;if(w_heavy[i]>0.4)o.hvN+=ci;if(isWaste(i,o.kind==="horde"))o.wasteN+=ci;if(s_car[i]>0.3){const tl=1500*s_car[i]*li;o.tax+=tl;o.trade+=tl}
    if(w_nomad[i])o.nom+=ci;if(w_coast[i])o.coastN+=li;if(s_farm[i]>0.5&&w_sF[i]>0.25&&pp/w_area[i]>2)o.farmN+=ci;if(s_fort[i]>0.5)o.fortN+=li;
    o.cx+=w_cosLon[i]*ci;o.cy+=w_sinLon[i]*ci;o.yy+=w_cyA[i]*ci;{const pe=szF?pp*szF[i]:pp;if(pe>o.mp){o.mp=pe;o.mc=i}}
    if(sampleNow&&o.front&&o.front.length<8&&s.year-s_taken[i]<80&&s_pop[i]<0.6*s_K[i]&&s_K[i]*(szF?szF[i]:1)>200)o.front.push(i);
    if(sampleNow){if(o.sample.length<24)o.sample.push(i);else if(r()<24*ci/(szF?o.cA:o.cells))o.sample[(r()*24)|0]=i}}
  // income from goods bought and sold (counted every ten years) joins the taxes
  for(const id of s.alive){const o=pols[id];if(o.gInc>0&&o.tax!=null){const gi=Math.min(o.gInc,0.5*o.tax);o.tax+=gi;o.trade=(o.trade||0)+gi}}
  // (the choice of war aims, below) a vassal pays a fifth of its taxes to its overlord
  if(!swOn('nochoice'))for(const id of s.alive){const o=pols[id];if(o.over&&o.tax>0){const ov=pols[o.over];if(ov&&ov.alive&&ov.tax!=null){const t=0.2*o.tax;o.tax-=t;ov.tax+=t;ov.tribIn=t+(ov.tribIn||0)*0.9}}}
  const next=[];
  for(const id of s.alive){const o=pols[id];
    if(o.cells===0){o.alive=false;o.died=y;
      for(const [q] of o.enemies){const p=pols[q];if(p)p.enemies.delete(id)}o.enemies.clear();
      for(const q of o.allies){const p=pols[q];if(p)p.allies=p.allies.filter(x=>x!==id)}
      if(o.ruler.fig!=null){const f=s_figs[o.ruler.fig];if(!f.died){f.died=y;deed(f,`Died as the ${o.full} fell`)}}
      const sc=new Map();for(const c of o.sample){const q=pol[c];if(q&&q!==id)sc.set(q,(sc.get(q)||0)+1)}
      o.succ=[...sc.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
      if(o.maxCells>=40){s.fallen.push(o);if(s.fallen.length>60)s.fallen.shift();
        if(s_admin[o.capital]>0.6)s.darkWatch.push({y,id,cells:o.sample.slice()})}
      if(o.departed){}
      else if(o.maxCells>=25){const sn=o.succ.slice(0,3).map(k=>pols[k]).filter(Boolean);
        chron('fall',`The ${o.peak} is extinguished${o.lastBy&&pols[o.lastBy]?` by the ${pols[o.lastBy].full}`:''}. Founded ${fy(o.born)}, it held ${Math.round(o.maxCells)} provinces at its height.${sn.length?` Its lands pass to the ${sn.map(p=>p.full).join(', the ')}.`:''}`,o.capital,[['pol',id,o.peak],...(o.lastBy&&pols[o.lastBy]?[R_(pols[o.lastBy])]:[]),...sn.map(R_)])}
      continue}
    next.push(id);
    if(o.nw>0){const k=1/o.nw,nv=[o.n0*k,o.n1*k,o.n2*k,o.n3*k];o.ni=o.ni?o.ni.map((v,q)=>v*0.8+nv[q]*0.2):nv}o.forS=o.pop>0?o.forP/o.pop:0;
    const cl=szF?o.cA:o.cells;o.S=o.sS/cl;o.integ=o.ig/cl;if(o.mandate==null)o.mandate=1;o.press=o.K>0?o.pop/o.K:1;o.md=o.dS/cl;o.adm=o.ad/cl;o.nomF=o.nom/cl;
    if(pol[o.capital]!==id&&o.mc>=0){o.capital=o.mc;if(s_eth[o.mc]>=0&&!o.conqDyn)o.core=s_eth[o.mc]}
    // nomads who come to rule farmland settle down
    if(o.kind==='horde'&&o.farmN>=Math.max(3,o.cells*0.3)){const old=o.full;o.kind='state';o.conqDyn=true;o.settledY=y;o.origin=Object.assign({},o.origin,{settled:y});o.tier=tierOf(o);o.full=fullName(o);
      if(o.cells>=8){chron('rise',`Masters now of settled farmland, the ${old} put down roots and rule as the ${o.full}.`,o.capital,[R_(o)]);spot(`Nomad conquerors settle as the ${o.full}`,o.capital,[R_(o)])}}
    o.tier=tierOf(o);o.full=fullName(o);
    if(o.cells>o.maxCells){o.maxCells=o.cells;o.peak=o.full}
    if(o.pop>o.maxPop)o.maxPop=o.pop;
    o.lx=Math.atan2(o.cy,o.cx);o.ly=o.yy/(szF?o.cA:o.cells);
    // on provinces a state's size counts in 100 km cells of land, as on the grid (thresholds, tiers, reach); nU is how many
    // provinces it holds
    o.nU=o.cells;if(szF)o.cells=Math.max(1,o.cA);
    const c=o.capital;
    o.spc=clamp(0.9*Math.log10(Math.max(o.pop,1e3))-2.7+0.6*Math.log10(o.cells+1)+(o.tier==='Empire'||o.tier==='Khaganate'?1.6:o.tier==='Kingdom'||o.tier==='Khanate'?0.8:0)+s_recK[c]+0.8*s_law[c]+0.6*s_coin[c]+0.5*s_paper[c]+0.5*s_roads[c],0,10);
  }
  s.alive=next;
  // count island cells per state (needs this year's landmass of capital)
  for(let k=0;k<L.length;k++){const i=L[k],p=pol[i];if(p){const o=pols[p];if(w_lm[i]===w_lm[o.capital])o.lmN+=szF?1/szF[i]:1}}
  yield;
  const infl=P.leaderInfl;
  for(const id of next){const o=pols[id];if(!o.alive)continue;
    const R=o.ruler,c=o.capital;
    {const lm=w_lm[c],ls=w_lmSize[lm];
    o.island=ls>=4&&ls<=700&&s_lmPop[lm]>0&&o.lmN>=0.8*s_lmPop[lm];
    if(o.island&&s_isleBy[lm]!==id&&o.cells>=4){const first=!s_isleName[lm];if(first)s_isleName[lm]=placeWord(langAt(c),r);s_isleBy[lm]=id;
      if(ls>=10){chron('rise',`The ${o.full} unites the whole island of ${s_isleName[lm]}${first?'':' once more'}.`,c,[R_(o)]);const f=figFor(o,o.ruler,'ruler');deed(f,`Unified the island of ${s_isleName[lm]}`,[R_(o)])}}}
    if(y-R.birth>=R.death){succession(o);if(!o.alive||o.cells===0)continue}
    const Rn=o.ruler,comp=0.5+infl*(Rn.comp-0.5);
    o.aggrM=Math.max(0.12,1+infl*(4*Rn.aggr-2)*0.6);
    const a=s_anom[c];o.wet=o.wet*0.92+a*0.08;
    o.loot*=0.9;
    o.gate=clamp(0.5+1.1*(1-o.press)+(o.nomF>0.5||o.kind==='horde'?0.5:0.22)*a+Math.min(0.5,o.tribs*0.15)-(o.over?0.15:0)+Math.min(0.5,o.loot/(o.pop+1)*4)-Math.min(0.3,o.fortN*0.004),0.15,1.9)*(CO?clamp((o.mpR??1)*(o.mpR??1),0.2,1.3):1);   // a ruler counts his young men before he picks a fight
    // reach: how fast orders travel and how much the centre can see (drums, beacons, relays, records, scripts); without any of it
    // a ruler cannot delegate far (Spencer 2010)
    if(o.kind==='state'){infoCap(o);monopolies(o)}
    // scalar stress: a polity coordinates only as many people as its hierarchy, records, sanctuary and paid force can reach
    // (Johnson 1982; Feinman 2011). Past that it cannot count, tax or call up the rest, its chiefs pull apart, and it either
    // builds new layers of office and records or splits; growth stalls at this threshold until records arrive (Shin et al. 2020)
    if(SCK&&o.kind==='state'){const mo=o.mono||{},inf=o.info||{rec:0};o.cap=15000*Math.exp(2.5*(o.cplx||0.2)+3.6*Math.min(1.5,inf.rec||0)+0.6*(mo.sacred||0)+(mo.force||0));
      o.scl=Math.max(0,Math.log(Math.max(1,o.pop)/o.cap));o.coord=Math.exp(-0.5*SCK*o.scl);o.tax*=o.coord}else{o.scl=0;o.coord=1}
    // manpower (cohort switch): the men of fighting age against a settled population's usual share (1 = normal, below = bled
    // white, above = a youth bulge). Armies draw a share of them: most herders ride; farmers send what the levy reaches.
    // Every year at war costs a part of the army to battle, siege and camp fever (Scheidel 2007 on Roman losses); boys take
    // fifteen years to replace them
    if(CO){o.mpR=o.pop>0&&o.ym!=null?clamp(o.ym/(0.17*o.pop),0,2):1;o.army=(o.ym??0.17*o.pop)*(o.kind==='horde'?0.5:0.06+0.3*(o.levy||0))*(o.coord??1);if(o.enemies.size)o.lossYM=(o.lossYM||0)+0.02*o.army;
      if(o.kind==='state'&&o.mpR<0.75&&o.ineq!=null)o.ineq=Math.max(0.15,o.ineq-0.001)}
    // threat: raids by horsemen and wars against stronger enemies (Tilly; Zhao's horsemen, 307 BCE). It decays in peace
    if(SWt&&o.kind==='state'){let inp=0;if(y-(o.raidY||-1e9)<5){const h=pols[o.raidBy];inp+=h&&h.alive&&h.kind==='horde'?0.6:0.3}
      if(o.enemies.size){let mx=0;const me=power(o)+1;for(const [q] of o.enemies){const e=pols[q];if(e&&e.alive)mx=Math.max(mx,power(e)/me)}inp+=Math.min(0.6,0.5*mx)}
      o.thr=(o.thr||0)*0.97+0.03*Math.min(1,inp)}
    o.h=P.reach*(1+0.04*genAt(1,c)+0.05*genAt(2,c))*(1+0.8*s_recK[c]+0.5*s_law[c]+0.7*s_roads[c]+0.4*s_coin[c]+0.6*s_gun[c])*(0.7+0.6*comp)*(o.kind==='horde'?1.4*(1+0.8*rideAdm(o,c)):1)*(o.kind==='state'?0.75+0.5*Math.min(1.4,o.cplx||0.2):1)*(1+0.15*s_tk[24][c]+0.1*s_tk[31][c])*(o.kind==='state'?0.55+0.45*Math.min(1.2,0.2+o.info.spd):1);
    const Et=etOf(o);
    o.E=clamp(o.E+0.012*o.E*(1-o.press)*(0.8+0.4*comp)*(0.5+(o.ineq==null?0.5:o.ineq)),0.004,0.12);
    o.shock*=0.92;
    o.mandate=Math.min(1,o.mandate+0.006);
    statecraft(o,c,y);militaryPass(o);elitePass(o);
    if(o.kind==='state'&&o.pop<FLOOR.chief*P.floor){o.lowY=o.lowY||y;if(y-o.lowY>25){if(o.maxCells>=8)chron('fall',`The ${o.full} dwindles below the numbers needed to sustain a ruler and his household; it dissolves back into villages and kin-groups.`,c,[R_(o)],'Too few people remained to feed a court, an army and their collectors.');for(const i of polCells(id))pol[i]=0;continue}}else o.lowY=0;
    const pP=Math.max(0,o.press-0.85)*3,pE=Math.max(0,o.E/Et-1.15)*1.1,pS=Math.max(0,0.42-o.S)*2.2,pX=Math.max(0,o.md/o.h-0.85)*(s_recK[c]<0.5?2.2:1.0),pR=Math.max(0,0.5-comp)*0.8,pI=Math.max(0,0.45-(o.integ??1))*0.8,pM=Math.max(0,0.5-o.mandate)*1.2,pZ=o.kind==='state'?Math.max(0,o.cells/(170*(1+0.6*s_roads[c]+0.4*s_admin[c]+0.3*s_paper[c]))-1)*0.9:0;
    const pT=o.pT||0,pF=o.pF||0,pQ=o.pQ||0,pC=SCK*0.8*(o.scl||0),pY=CO&&o.kind==='state'?Math.max(0,(o.mpR??1)-1.12)*1.5:0;const pN=o.kind==='state'?P.eco*0.8*Math.max(0,(o.forS||0)-0.35):0;const pB=o.kind==='state'?Math.max(0,(o.nob||0)-0.55)*(1.2-o.S):0;const pD=o.kind==='state'?0.8*(o.pD||0):0,pW=o.kind==='state'?o.pW||0:0;o.why={pP,pE,pS,pX,pR,pI,pM,pZ,pN,pT,pF,pQ,pB,pD,pW,pC,pY,sh:o.shock};o.psi=pP+pE+pS+pX+pR+pI+pM+pZ+pT+pF+pQ+pN+pB+pD+pW+pC+pY+o.shock;
    const isl=o.island?0.4:1;
    if(o.kind==='state'&&o.cells>=40&&o.psi>2.2&&r()<P.crisis*0.008*(o.psi-2)*isl){o.shock+=0.4;if(o.cells>=80)chron('fall',`The ${o.full} shatters into rival kingdoms.`,o.capital,[R_(o)],'Driven by '+topCauses(o.why).join(' and ')+'.');civilWar(o,true)}
    else if(o.cells>=3&&r()<P.crisis*0.0035*o.psi*o.psi*isl){if(o.kind==='horde')hordeBreakup(o);else civilWar(o)}
    else if(o.cells>=2&&o.S<(o.island?0.08:0.12)&&r()<0.02)collapse(o);
    if(o.kind==='horde'&&o.cells<=2&&y-o.born>30&&r()<0.03){for(const i of polCells(id)){pol[i]=0}continue}
    culture(o);
    if(y%5===0){
      if(o.p5&&o.pop<0.8*o.p5&&o.wet<-0.3)o.mandate=Math.max(0,o.mandate-0.25);
      if(o.p5&&o.pop<0.8*o.p5&&o.cells>=15&&o.wet<-0.3&&y-o.famY>60){o.famY=y;o.shock+=0.5;
        chron('famine',`Years of drought bring famine to the ${o.full}; it loses ${Math.round((1-o.pop/o.p5)*100)}% of its people.`,c,[R_(o)])}
      o.p5=o.pop}
    // conquerors fade into the conquered
    if(o.conqDyn&&y%10===0){const ce=s_eth[c];if(ce>=0&&ce!==o.core){o.assimT+=10;if(o.assimT>=90){const old=s_eths[o.core],nw=s_eths[ce];o.core=ce;o.conqDyn=false;
        if(o.cells>=15)chron('people',`Four generations on, the ruling ${old.name} of the ${o.full} have become ${nw.name} in all but name.`,c,[R_(o),RE(old),RE(nw)])}}else o.assimT=0}
    // figures and milestones
    if(Rn.fig!=null){const f=s_figs[Rn.fig];f.conq=Rn.conq;if(o.cells>f.realm)f.realm=o.cells;f.title=`${cap(titleOf(o,Rn))} of the ${o.full}`}
    while(Rn.mi<4&&Rn.conq>=[25,50,100,200][Rn.mi]&&o.cells>=25){const m=[25,50,100,200][Rn.mi];Rn.mi++;
      const f=figFor(o,Rn,'ruler');f.conq=Rn.conq;
      const bits=[];if(Rn.exc==='aggr')bits.push('a ruler of uncommon ferocity');if(o.wet>0.35)bits.push(o.nomF>0.5||o.kind==='horde'?'with grass made rich by a run of wet years':'during a run of wet years');else if(o.wet<-0.35)bits.push('despite years of drought');
      deed(f,`Had conquered ${m} provinces for the ${o.full}${o.wet>0.35?' during a run of wet years':''}`,[R_(o)]);
      chron('rise',`${cap(rulerName(o))} of the ${o.full}${bits.length?', '+bits.join(', ')+',':''} has conquered ${m} provinces.`,c,[R_(o),RF(f)]);
      if(m>=50)spot(`${cap(rulerName(o))} has conquered ${m} provinces`,c,[RF(f),R_(o)])}
    if(!o.fK&&o.cells>=40){o.fK=1;
      const f=figFor(o,o.founderR,'founder');if(!f.deeds.some(d=>d[1].startsWith('Founded')))deed(f,`Founded the ${o.base} state`,[R_(o)]);
      chron('rise',`The ${o.full} rises under ${rulerName(o)}.`,c,[R_(o)])}
    if(!o.fE&&o.cells>=100){o.fE=1;const f=figFor(o,Rn,'ruler');deed(f,`Ruled the ${o.full} at ${o.nU??o.cells} provinces`,[R_(o)]);
      chron('rise',`The ${o.base} realm grows to ${o.nU??o.cells} provinces under ${rulerName(o)}.`,c,[R_(o),RF(f)]);spot(`The ${o.full} reaches ${o.nU??o.cells} provinces`,c,[R_(o)])}
    // invention, tied to cultural vigour
    // a league of cities shares one pool of skills and ideas
    const lgI=o.league!=null&&s.leagues&&s_leagues[o.league]&&!s_leagues[o.league].end?s_leagues[o.league]:null,oP=lgI?Math.max(o.pop,lgI.pop||0):o.pop,oC=lgI?Math.max(o.cells,lgI.cells||0):o.cells;
    if(o.kind==='state')for(let k=6;k<TECH.length;k++){const T=TECH[k],em=T.em;if(!em||s_tk[k][c]>=0.5)continue;
      // thresholds were set when world population ran about 40% above the historical estimates; rescaled with it
      // writing grew out of the accounts of temple and palace cities (Schmandt-Besserat 1992): townspeople count for more
      const emP=em.pop*0.6*0.65,oPx=(em.urb?oP*(1+3*clamp((o.cityUrb||0)/(o.pop+1),0,0.8)):oP)*(o.scl&&REC_TK.has(k)?1+Math.min(2,2*o.scl):1);if(oPx<emP*0.5||(em.cells&&oC<em.cells)||(em.coast&&!w_coast[c]&&o.coastN<2)||(em.horse&&s_horse[c]<0.6)||(em.heavy&&(o.hvN||0)<3)||(em.need&&!commNeed(em.need,o,c)))continue;
      let ok=true;for(const p of T.pre)if(s_tk[p][c]<0.7){ok=false;break}if(!ok)continue;
      const fit=techFit(o,k),bos=em.press?clamp((o.press-0.7)*5,0,2):1;
      if(r()<em.b*(k===6&&WD.szF?WRX:1)*P.invent*Math.min(3,Math.sqrt(oPx/emP))*(0.7+0.9*o.cult)*bos*(T.synth?fit*fit*2.5*synthRel():0.6+0.8*fit)){
        seedTech(s_tk[k],c,1,1);if(k===6)for(const i of L)if(pol[i]===id)s_admin[i]=Math.max(s_admin[i],0.35);
        firstTech(k,c,o)}}
    // faith
    const cr=s_rel[c];
    if(cr>=0&&cr!==o.rel&&r()<0.04){o.rel=cr;const Rl=s_rels[cr];if(!Rl.states.includes(id))Rl.states.push(id);
      if(o.cells>=30){const f=figFor(o,Rn,'ruler');deed(f,`Made ${Rl.name} the faith of the realm`,[RR(Rl)]);
        chron('faith',`${cap(rulerName(o))} makes ${Rl.name} the faith of the ${o.full}.`,c,[R_(o),RR(Rl),RF(f)])}}
    if(o.kind==='state'&&s_admin[c]>0.5&&o.cells>=10&&(o.shock>0.25||o.why.pS>0.2)&&r()<P.faith*0.0003)foundReligion(o);
    // nomads on the move
    if(o.kind==='horde'&&o.cells>=6&&o.pop>50000&&s.activeMigs.length<10&&((o.wet<-0.4&&o.press>0.75&&r()<0.02*P.wander)||(o.S>0.55&&Rn.aggr>0.7&&r()<0.006*P.wander))){hordeMigration(o)}
    // war
    // a walled city with its fields makes war too: city-states fought each other constantly (Lagash and Umma)
    // chiefdoms raid and fight their neighbours too (Carneiro 1981): a single valley's chief can go to war
    if((o.cells>=2||o.tier==='City-state'||(o.kind==='state'&&o.pop>=2*FLOOR.chief*P.floor))&&o.enemies.size<3&&r()<P.warRate*0.02*o.aggrM*o.gate){
      let best=0,bw=0,holy=false;const CHO=!swOn('nochoice'),po=power(o),Rl=o.rel>=0?s_rels[o.rel]:null,hp=Rl?pol[Rl.holy]:0;
      for(const [q,b] of o.nb){const t=pols[q];if(!t||!t.alive||o.enemies.has(q)||o.allies.includes(q)||o.over===q||t.over===id||(o.truce.get(q)||-1e9)>y)continue;
        let wt=b*Math.pow(po/(power(t)+1),1.5);
        // (armies, part 3: wars are for something; Nein 2026-11-10, switch nochoice turns it off) the court weighs what each neighbour
        // is worth and the cheapest way to get it: take its land (half its taxes and trade if won, less the men to hold unwilling
        // land), make it pay tribute (a fifth, no garrisons; only against the clearly weaker), raid it (a little, at little risk;
        // for the poorer side), or punish a raider. A neighbour worth nothing by any road is left alone.
        if(CHO&&o.kind==='state'){const pr=po/(power(t)+1),x=Math.pow(pr,1.5),pw=x/(1+x),V=(t.tax||0)+(t.trade||0)+lackV(o,t),own=o.tax||0,tl3=3*(o.gp&&o.gp.get(q)||0),tA=t.cA||t.cells,
            gc=GAR*tA*0.72*1.5/(1+0.5*s.iron[c]+0.7*s_roads[c]+0.6*s_recK[c]+2*s_gun[c])*own/(o.pop+1)*0.25,
            vC=pw*0.5*(V-gc)-(1-pw)*0.1*own-tl3,vT=pr>1.5?pw*0.2*V-(1-pw)*0.05*own:-1e18,vR=(own/(o.pop+1)<V/(t.pop+1)||o.cells<6)?0.04*V*Math.min(1,pr)*(slaveOn()&&!kinBan(o,t.rel)?1.5:1)-0.01*own-tl3:-1e18,
            vP=o.raidBy===q&&y-(o.raidY||-1e9)<15?0.15*own*pw:-1e18,
            // a war for people, not land: where land is plentiful and hands are few, the prize is the neighbour's population, carried
            // home (mainland South-East Asia: Scott 2009; Lieberman 2003)
            scar=clamp(1-o.pop/(0.7*o.K+1),0,1),vS=slaveOn()&&scar>0.2&&!kinBan(o,t.rel)?pw*0.08*scar*own*Math.min(3,t.pop/(o.pop+1))-(1-pw)*0.05*own-tl3:-1e18,bv=Math.max(vC,vT,vR,vP,vS);
          if(bv<=0)continue;wt=b*bv/(own+1)*4;t._g=bv===vP?'punitive':bv===vC?'conquest':bv===vT?'tribute':bv===vS?'captives':'raid'}
        if(Rl&&t.rel!==o.rel&&t.rel>=0)wt*=1+0.4*P.zeal*Rn.piety;
        const isHoly=Rl&&q===hp&&t.rel!==o.rel&&Rn.piety>0.6;if(isHoly)wt*=1+4*P.zeal;
        bw+=wt;if(wt>0&&r()*bw<wt){best=q;holy=isHoly}}
      if(best){const t=pols[best];const war=declareWar([o],[t],holy?`the Holy War for ${holyName(Rl)}`:null,holy,false,holy);
        // war goals (default since run 79): what the war is for. A strong state crushes a raiding or loosely organised neighbour to secure the
        // frontier (Rome against the Dacians, Han against the Xiongnu); against a rival kingdom it may march on the capital to
        // break it rather than take it (Assyria and Urartu, 714 BCE); otherwise it fights for provinces
        if(!holy){const pr=po/(power(t)+1),weak=t.tier==='Chiefdom'||t.tier==='Clans'||(t.kind==='horde'&&t.cells<25),raider=o.raidBy===best&&y-(o.raidY||-1e9)<15;
          war.goal=pr>2&&(weak||raider)?'punitive':pr>1.3&&pr<4&&t.kind==='state'&&!weak&&r()<0.35?'break':'conquest';
          if(CHO&&o.kind==='state'&&t._g){if(t._g==='conquest'){if(war.goal==='punitive')war.goal='conquest'}else war.goal=t._g;
            if(!s.goalN)s.goalN={};s.goalN[war.goal]=(s.goalN[war.goal]||0)+1;
            // the clearly weaker may submit without a fight
            if(war.goal==='tribute'&&pr>3&&t.kind==='state'&&!t.over&&r()<0.5){t.over=id;t.overY=y;o.tribs++;endWar(war);s.activeWars=s.activeWars.filter(k=>k!==war.id);s.goalN.submit=(s.goalN.submit||0)+1;
              if(t.cells>=25)chron('diplomacy',`Faced with the armies of the ${o.full}, the ${t.full} agrees to pay tribute rather than fight.`,t.capital,[R_(t),R_(o)])}}}
        const tot=war.a.concat(war.d).reduce((sm,k)=>sm+pols[k].cells,0);
        if(holy||tot>=150||(o.cells>=30&&t.cells>=30)){war.notable=true;
          const al=war.a.slice(1).map(k=>pols[k].base),dl=war.d.slice(1).map(k=>pols[k].base);
          chron('war',`${holy?'Holy war':'War'}: the ${o.full} attacks the ${t.full}${holy?` to win back ${holyName(Rl)}`:''}${al.length?`, joined by ${al.join(' and ')}`:''}${dl.length?`; ${dl.join(' and ')} ${dl.length>1?'come':'comes'} to the defence`:''}.`,t.capital,[R_(o),R_(t),RW(war)])}}}
  }
  // active wars
  const still=[],PEACE=!swOn('nopeace');
  for(const wid of s.activeWars){const war=s_wars[wid];
    const aAlive=war.a.some(k=>pols[k].alive),dAlive=war.d.some(k=>pols[k].alive),yrs=y-war.start;
    const fresh=y-(war.lastGain||war.start);
    // exhausted sides make peace (cohort switch); punitive campaigns are short. A stalemate can still drag on for generations
    const exA=CO&&(pols[war.a[0]].mpR??1)<0.85,exD=CO&&(pols[war.d[0]].mpR??1)<0.8;
    // (negotiated peace and the custom of treaties; Nein 2026-11-11, switch nopeace turns it off) a war can be ended on terms:
    // the attacker who has what it came for offers peace and keeps it; a side losing ground sues and cedes border land for
    // peace; a stalemate is talked out. How readily, and how long the truce holds (10 to 40 years), goes with the custom of
    // treaties (dip, 0 to 1, kept by each people): it grows in long indecisive wars between peers, with law codes and records,
    // and passes to the other side of every treaty made
    if(PEACE&&aAlive&&dAlive&&!war.civil&&yrs>=2){const A=pols[war.a[0]],D=pols[war.d[0]];
      if(A.alive&&D.alive&&A.kind==='state'&&D.kind==='state'){const g=(war.gA||0)-(war.gD||0),pr=power(A)/(power(D)+1),dA=dipOf(A),dD=dipOf(D),dip=0.5*(dA+dD),want=Math.max(2,0.15*(D.cA||D.cells));
        let pp=0,kind='';
        if(war.goal==='conquest'&&g>=want&&fresh>=1){pp=0.3;kind='won'}
        else if(g<=-2&&fresh<4){pp=0.15;kind='lostA'}
        else if(g>=2&&fresh<4&&(war.gA||0)>0.25*(D.cA||D.cells)){pp=0.2;kind='lostD'}
        else if(fresh>5){pp=0.1;kind='stale';if(pr>0.6&&pr<1.6){const E1=s.eths[A.core],E2=s.eths[D.core];if(E1)E1.dip=Math.min(1,(E1.dip||0)+0.01);if(E2)E2.dip=Math.min(1,(E2.dip||0)+0.01)}}
        if(kind&&r()<pp*(1+2*dip)){
          // the loser cedes border land next to what it has already lost: a third again of the winner's gains, up to five provinces' worth
          let ced=0;if(kind==='lostD'||kind==='lostA'){const W_=kind==='lostD'?A:D,Lo=kind==='lostD'?D:A,need=Math.min(5,0.3*Math.abs(g));
            if(need>=0.5)for(const i of polCells(Lo.id)){if(ced>=need)break;if(i===Lo.capital||s.city[i]>=0)continue;let adj=false;for(let d2=w.nbS[i];d2<w.nbS[i+1];d2++){const j=w.nbA[d2];if(j>=0&&s.pol[j]===W_.id){adj=true;break}}
              if(adj){s.pol[i]=W_.id;s.taken[i]=y;s.integ[i]=Math.min(s.integ[i],0.2);ced+=cw(i)}}
            if(ced>=3&&Lo.maxCells>=25)chron('diplomacy',`The ${Lo.full} sues for peace and cedes ${Math.round(ced)} border provinces to the ${W_.full}.`,Lo.capital,[R_(Lo),R_(W_),RW(war)])}
          war.treaty=dip;const E1=s.eths[A.core],E2=s.eths[D.core];if(E1&&E2){const hi=Math.max(E1.dip||0,E2.dip||0);E1.dip=(E1.dip||0)+0.2*(hi-(E1.dip||0));E2.dip=(E2.dip||0)+0.2*(hi-(E2.dip||0))}
          if(!s.peaceN)s.peaceN={};s.peaceN[kind]=(s.peaceN[kind]||0)+1;endWar(war);continue}}}
    if(!aAlive||!dAlive||r()<0.02+(fresh>8?0.08:0)+(yrs>40?0.1:0)+(exA?0.06:0)+(exD?0.06:0)+((war.goal==='punitive'||war.goal==='raid'||war.goal==='captives')&&yrs>4?0.12:0)){endWar(war);continue}
    still.push(wid)}
  s.activeWars=still;
  if(y%5===0)diplomacy();
  yield;
  // border pass
  for(const id of s.alive)pols[id].nb=new Map();
  const asR=P.asabR,asD=P.asabD,wr=P.warRate*0.03,rev=y&1,rels=s.rels,fz=P.fortify,LP=szF?localPopF():null,FB=szF?frontBand():null;
  for(let kk=0;kk<L.length;kk++){
    const i=L[rev?L.length-1-kk:kk],p=pol[i],pi=pop[i],ei=s_eth[i],ri=s_rel[i];
    const o=p?pols[p]:null,horde=o&&o.kind==='horde';
    let fr=0,cand=-1,nc=0,candSea=false,threat=0,rcand=-1,rn=0;
    const cl=w_cosLat[i];
    for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j<0||!w_land[j])continue;const q=pol[j],wt=w_nbW[d];
      if(q!==p){const ej=s_eth[j];
        if(ej>=0&&ei>=0&&ej!==ei&&ethDist(ei,ej)>0.22)fr=1;
        else if(ri>=0&&s_rel[j]>=0&&s_rel[j]!==ri)fr=1;
        if(o){if(q){const t=pols[q];o.nb.set(q,(o.nb.get(q)||0)+(szF?wt:1));
            if(t.kind==='horde'||o.enemies.has(q))threat=1;
            if(o.enemies.has(q)||(horde&&t.kind==='horde')){nc+=3*wt;if(r()*nc<3*wt)cand=j}
            else if(horde&&t.kind==='state'){rn+=wt;if(r()*rn<wt)rcand=j}}
          else if(!horde||w_nomad[j]||w_desert[j]||pop[j]>=1){nc+=wt;if(r()*nc<wt)cand=j}}}}
    if(FB)fr=FB[i];
    if(o&&w_coast[i]&&s_sail[i]>0.5){for(let q2=w_ls[i];q2<w_ls[i+1];q2++){const j=w_lt[q2];if(w_ld[q2]>3&&s_nav[i]<0.5)continue;const q=pol[j];if(q===p)continue;
      if(q){o.nb.set(q,(o.nb.get(q)||0)+1);if(o.enemies.has(q)){nc+=1;if(r()*nc<1){cand=j;candSea=true}}}}}
    let sv=s_s[i];
    if(o){const decay=asD*(o.island?0.5:1)*(o.conqDyn?1.6:1);
      sv+=fr?asR*sv*(1-sv):-decay*sv;sv+=0.004*infl*(o.ruler.char-0.5);if(ri>=0&&ri===o.rel)sv+=0.0015*(0.5+rels[ri].cent);
      s_s[i]=clamp(sv,0.02,1);
      // provinces settle into a realm only as fast as the centre can hold them (monopolies, records, speed)
      if(s_integ[i]<1){const hp=o.kind==='state'?0.35+0.65*(o.hold??0.5):1,fam=ei>=0&&s_eths[ei]&&s_eths[o.core]&&s_eths[ei].fam===s_eths[o.core].fam;s_integ[i]=Math.min(1,s_integ[i]+hp*0.0011/(1+0.8*P.eco*ecoD(i,o))*(0.5+s_recK[i]+s_roads[i]+0.5*s_law[i])*(fam?1.5:0.6)*(ri>=0&&ri===o.rel?1.2:0.8)*(s_uni[i]>0.3&&s_eths[o.core]&&s_uniFam[i]===s_eths[o.core].fam?1.6:1))}
      if(cand>=0&&s_taken[i]!==y){const q=pol[cand];
        if(horde&&!q&&!w_nomad[cand]&&!w_desert[cand]&&pop[cand]>=1){if(r()<pF(P.raid*0.02*o.aggrM*o.gate,i,cand)){s.raidC[cand]=y;const t0=pop[cand]*0.03;pop[cand]-=t0;o.loot+=t0*0.5;displace(cand,0.02,o.id)}}
        else{const wg=q?s_wars[o.enemies.get(q)]:null,rate=(wg&&wg.goal==='punitive'&&wg.aSet.has(o.id)?2:1)*(q?wr*2*(1+3*s_circE[cand]):wr*(horde?0.25+0.75*rideOf(o):Math.min(1,Math.max(0.1,pop[i]/w_area[i]/6))*(0.3+0.7*Math.min(1,o.press))*(1+2*s_gun[i])));if(q&&o.arm&&o.enemies.has(q)){o.hotN=(o.hotN||0)+1;if(!o.hot)o.hot=[i];else if(o.hot.length<3)o.hot.push(i);else if(r()*o.hotN<3)o.hot[(r()*3)|0]=i}if(r()<pF(rate*o.aggrM*(o.aimM||1)*o.gate,i,cand)){if(wg&&(wg.goal==='raid'||wg.goal==='captives')&&wg.aSet.has(o.id)&&!candSea){raid(o,i,cand,wg.goal==='captives');if(o.kind==='state')o.treas=Math.min(1,(o.treas||0)+0.01)}else attack(o,i,cand,candSea)}}}
      if(horde&&rcand>=0&&r()<pF(P.raid*0.025*o.aggrM*o.gate*(1-0.8*s_fort[rcand]),i,rcand))raid(o,i,rcand);
      const c=o.core;
      if(ei>=0&&c>=0&&ei!==c&&pi>=1&&!o.conqDyn&&r()<P.assim*0.004*o.S*(1-0.8*ethDist(ei,c))*(ri>=0&&ri===o.rel?1.5:1))s_eth[i]=c;
      if(o.conqDyn&&ei!==c&&pi>=1)mixIn(i,c,0.0006);
      if(o.rel>=0&&ri!==o.rel&&pi>=1){const Rl=rels[o.rel];if(!(Rl.kind==='ethnic'&&ei>=0&&s_eths[ei].fam!==Rl.fam)&&r()<0.003*P.faith*o.S*(Rl.miss+0.3)*(0.7+0.6*Rl.cent))s_rel[i]=o.rel}
      // fortify threatened frontiers if the state is cohesive and can pay: walls are bought with treasure and labour gangs
      // (the Qin and Ming walls, Hadrian's; Waldron 1990), not with scribes
      if(threat&&!horde&&o.S>0.45&&o.gate>0.7&&o.treas>0&&s_fort[i]<1){const pay=Math.min(1.5,o.treas+0.6*(o.levy||0));if(pay>0.3)s_fort[i]=Math.min(1,s_fort[i]+0.006*fz*pay*(1+s_roads[i]))}
    }else{
      sv+=fr?asR*0.6*sv*(1-sv):(0.3+0.25*s.ritW[i]-sv)*0.02;s_s[i]=clamp(sv,0.02,1);
      if(pi>=1){const dens=pi/w_area[i],agr=s_farm[i]*s_sFc[i],past=s_herd[i]*Math.max(w_sH[i],w_desert[i]*s_camel[i]*0.6);
        // density threshold rescaled with population, which ran about 40% above historical estimates when it was set
        if(agr>0.35&&dens>3.2&&!w_nomad[i]&&(LP?LP[i]:localPop(i))>=FLOOR.chief*3*P.floor){
          // pristine states need crowding and nowhere to go (Carneiro 1970); everywhere else a state's example, trade or threat
          // has to reach first (secondary state formation: Price 1978; Wright 1977)
          // a great sanctuary organises labour and tribute: the temple towns of the Olmec, Chavin and Caral grew into states
          // without bronze or canals (Flannery & Marcus 2012)
          const temple=clamp((s.ritW[i]-0.4)/0.4,0,1);
          const prist=clamp((dens-15)/15,0,1)*s_circE[i]+0.5*s_irrig[i]*Math.min(1,2*w.rvF[i])+0.5*temple,cg=0.12+0.88*Math.min(1,1.3*s.stx[i]+prist);
          if(r()<pU(cg*P.formRate*0.0012*(0.2+1.6*P.circ*s_circE[i])*(0.4+s_s[i])*(1+Math.min(2,dens/15))*Math.min(1,0.05+s_metal[i]+s_recK[i]+s_horse[i]*0.5+Math.min(0.4,Math.max(0,dens-5)/25)+0.15*Math.max(0,s_circE[i]-0.5)+0.6*s_cStore[i]*Math.min(1,Math.max(0,dens-6)/12)+0.4*s_irrig[i]+0.6*temple)*(()=>{const fe=Math.max(cerealEff(i),0.6*(0.4+0.6*s_cStore[i])*Math.min(1,Math.max(0,dens-8)/12));return 0.03+0.97*fe*fe})(),i)){
            const id=newPolity(i,null);
            if(szF)grabNear(i,id,j=>!pol[j]&&s_eth[j]===ei&&pop[j]>=1,0.5);
            else for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j>=0&&w_land[j]&&!pol[j]&&s_eth[j]===ei&&pop[j]>=1&&r()<0.5){pol[j]=id;s_dist[j]=2}}}}
        else if(past>0.3&&dens>0.3&&(w_nomad[i]||w_desert[i])&&(fr||steppeFront(i,ei))){
          // riders organise far more readily than herders on foot; a rival clan is a weaker spur than a state
          if(r()<pU(P.nomad*0.0003*(fr?1:0.3)*(0.4+s_s[i])*(0.08+1.4*s_horse[i]+s_camel[i])*(s.hgr?1+2*s.hgr[i]:1),i)){
            const id=newPolity(i,null,{kind:'horde'});
            if(szF)grabNear(i,id,j=>!pol[j]&&(w_nomad[j]||w_desert[j])&&pop[j]>=1,0.6);
            else for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j>=0&&w_land[j]&&!pol[j]&&(w_nomad[j]||w_desert[j])&&pop[j]>=1&&r()<0.6){pol[j]=id;s_dist[j]=2}}}}
      }
    }
    if(s_fort[i]>0){const keep=o&&!horde&&o.S>0.3&&o.press<1&&(o.treas??0)>-0.2;s_fort[i]=keep?s_fort[i]*0.9995:s_fort[i]*0.99;if(s_fort[i]<0.01)s_fort[i]=0}
  }
  // first great walls
  for(const id of s.alive){const o=pols[id];if(o.fortN>=8&&!o.wallLogged&&o.cells>=20){o.wallLogged=1;chron('culture',`The ${o.full} begins to fortify its frontier with a great line of walls and forts.`,o.capital,[R_(o)]);spot(`The ${o.full} builds a great wall`,o.capital,[R_(o)])}}
  for(const id of s.activeMigs.slice())migStep(s_migs[id]);
  if(y%5===0){yield;distBFS();yield;if(y%10===0)stxPass();
    for(const i of w.landIdx){const p=s_pol[i];const ob=p?s_pols[p]:null;
      if(ob&&ob.kind==='state'&&ob.cells>=60&&s_integ[i]>0.55&&s_pop[i]>=1&&s_eths[ob.core]&&ecoD(i,ob)<0.6){const f=s_eths[ob.core].fam;if(s_uniFam[i]!==f){if(s_uni[i]<0.15){s_uniFam[i]=f;s_uni[i]=0}else{s_uni[i]*=0.985;continue}}s_uni[i]+=0.0035*(1-s_uni[i])}
      else s_uni[i]*=0.9975}
    if(y%10===0){yield;exitPass(0,0.25);yield;exitPass(0.25,0.5);yield;exitPass(0.5,0.75);yield;exitPass(0.75,1);yield}
    const CTRL=swOn('ctrl');
    for(const i of w.landIdx){const p=s_pol[i];if(!p)continue;const o=s_pols[p];if(o.kind!=='state'||i===o.capital)continue;const ce=herdLed(o)&&s.past[i]>0.5?0.5:cerealEff(i);
      if(isWaste(i)){let rim=0;for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j>=0&&s_pol[j]===p&&!isWaste(j))rim++}
        const keep=rim>0||s_fort[i]>0.3||s_car[i]>0.3||(dd(i)<0.35*o.h&&o.S>0.4&&(o.burden||0)<1.1);if(!keep&&r()<0.3){s_pol[i]=0;continue}}
      if(ce<0.35&&r()<0.15*(1-ce/0.35)*(1.2-0.5*s_integ[i])){s_pol[i]=0;continue}
      // a ruler who cannot see, pay or reach a province does not keep it: its chiefs stop answering (prestige-goods chiefdoms,
      // Earle 1997). Only weakly integrated provinces of weakly holding states drift away.
      // (step 2, control; Nein 2026-11-05: land a state cannot reach is lost or taken, so exclaves and thin salients don't last; switch
      // ctrl turns it on until it has been run) control is exp(-effective distance / reach), 0 for land cut off from the capital. A poorly held province
      // (under 0.35) goes over to a neighbouring state whose control next door is clearly better, sooner to kin, to its own faith and
      // from a heavy hand; land cut off or all but out of reach (under 0.08) stops answering whatever the realm's strength
      // a realm whose garrisons take more men than it has lets go of land that does not pay for its own
      if(ARMY&&o.garr>0.6*o.pop*(o.coord??1)&&s.city[i]<0&&s_fort[i]<0.3&&s_car[i]<0.3){const g=garrAt(i,s_integ[i],o.calm??0.5);
        if(pop[i]*s.farm[i]*cerealEff(i)<0.5*g&&r()<0.1*Math.min(1,o.garr/(o.pop*(o.coord??1)+1)-0.6)){s_pol[i]=0;s.shedN=(s.shedN||0)+1;continue}}
      if(CTRL){const cut=s_dist[i]===65535,c=cut?0:Math.exp(-dd(i)/(o.h||6));
        if(c<0.35){let bq=0,bj=-1,bc=c+0.3;
          for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j<0)continue;const q=s_pol[j];if(!q||q===p)continue;const oq=s_pols[q];if(oq.kind!=='state'||o.over===q||oq.over===p)continue;
            const cq=Math.exp(-dd(j)/(oq.h||6));if(cq>bc){bc=cq;bq=q;bj=j}}
          if(bq){const oq=s_pols[bq],kin=s_eth[i]===oq.core,fa=s.rel[i]>=0&&s.rel[i]===oq.rel;
            if(r()<0.03*(bc-c)*(kin?2:1)*(fa?1.5:1)*(1+Math.max(0,(o.burden||0.6)-0.8))*(1.2-s_integ[i])){
              s_pol[i]=bq;s.taken[i]=y;s_integ[i]=Math.min(s_integ[i],kin?0.4:0.2);s_dist[i]=Math.min(65534,s_dist[bj]+stepCost(bj,i));s.defN=(s.defN||0)+1;
              if(s.city[i]>=0)chron('fall',`${s.cities[s.city[i]].name} goes over to the ${oq.full}: the ${o.full} could no longer reach it.`,i,[R_(o),R_(oq)]);continue}}
          if((cut||c<0.08)&&r()<(cut?0.15:0.04*(1-c/0.08))){s.lostN=(s.lostN||0)+1;
            if(pEq(i)>=FLOOR.chief*P.floor*3&&s.farm[i]>0.5&&cerealEff(i)>=0.3){const nid=newPolity(i,o,{kind:'state',origin:{type:'rebellion',from:o.id,why:'Cut off from the court, its governor ruled for himself.'}});s_pol[i]=nid;
              if(szF&&szF[i]>1)grabNear(i,nid,j=>s_pol[j]===p&&j!==o.capital&&(s_dist[j]===65535||Math.exp(-dd(j)/(o.h||6))<0.08),1,0.56)}
            else s_pol[i]=0;continue}}}
      const hd=o.hold??0.5;if(hd<0.5&&s_integ[i]<0.35&&r()<0.04*(0.5-hd)*(1-s_integ[i]/0.35)*(1+dd(i)/(o.h||6))){
        // lords carve up fallen realms (default since run 79): a governor who stops answering keeps good farmland as his own lordship
        if(pEq(i)>=FLOOR.chief*P.floor*3&&s.farm[i]>0.5&&cerealEff(i)>=0.3){const nid=newPolity(i,o,{kind:'state',origin:{type:'rebellion',from:o.id,why:'A governor the court could not see or pay kept his province.'}});s_pol[i]=nid;
          if(szF&&szF[i]>1)grabNear(i,nid,j=>s_pol[j]===p&&j!==o.capital&&s_integ[j]<0.35,1,0.56)}
        else s_pol[i]=0}}}
}

/* ---------- peoples, mixing, cities, records ---------- */
function ethPass(log){
  const s=S,w=WD,E=s.eths,n=E.length,L=w.landIdx;
  const sx=new Float64Array(n),sy=new Float64Array(n),sz=new Float64Array(n),cnt=new Float64Array(n),pp=new Float64Array(n);
  for(let k=0;k<L.length;k++){const i=L[k],e=s.eth[i];if(e<0||s.pop[i]<1)continue;sx[e]+=w.x3[i];sy[e]+=w.y3[i];sz[e]+=w.z3[i];cnt[e]+=cw(i);pp[e]+=s.pop[i]}
  for(let e=0;e<n;e++){const o=E[e];o.cells=cnt[e];o.pop=pp[e];if(pp[e]>o.peak)o.peak=pp[e];
    if(o.alive&&!cnt[e])o.died=s.year;o.alive=cnt[e]>0;
    if(cnt[e]){const m=Math.hypot(sx[e],sy[e],sz[e])||1;sx[e]/=m;sy[e]/=m;sz[e]/=m;o.lon=Math.atan2(sy[e],sx[e]);o.la=Math.asin(clamp(sz[e],-1,1))}}
  const md=new Float64Array(n).fill(2),far=new Int32Array(n).fill(-1);
  for(let k=0;k<L.length;k++){const i=L[k],e=s.eth[i];if(e<0||s.pop[i]<1)continue;const d=w.x3[i]*sx[e]+w.y3[i]*sy[e]+w.z3[i]*sz[e];if(d<md[e]){md[e]=d;far[e]=i}}
  const thr=P.splitDist*2*Math.PI/W;let made=0;
  // a people that gathers at a shared sacred site stays one people longer, and its customs drift less
  const rw=new Float64Array(n);if(s.ritW)for(let k=0;k<L.length;k++){const i=L[k],e=s.eth[i];if(e>=0&&s.pop[i]>=1)rw[e]+=s.ritW[i]*cw(i)}
  for(let e=0;e<n;e++)rw[e]=cnt[e]?Math.min(1,2*rw[e]/cnt[e]):0;
  for(let e=0;e<n&&made<12;e++){
    if(cnt[e]<6||far[e]<0)continue;
    if(Math.acos(clamp(md[e],-1,1))<=thr*(1+rw[e])||s.r()>0.5)continue;
    const f=far[e],c=newEth(e);made++;
    for(let k=0;k<L.length;k++){const i=L[k];if(s.eth[i]!==e)continue;
      const df=w.x3[i]*w.x3[f]+w.y3[i]*w.y3[f]+w.z3[i]*w.z3[f],dc=w.x3[i]*sx[e]+w.y3[i]*sy[e]+w.z3[i]*sz[e];
      if(df>dc)s.eth[i]=c}
    if(log&&pp[e]>2e6&&cnt[e]>=30){
      const dlat=w.lat[f]-Math.asin(clamp(sz[e],-1,1));let dlon=Math.atan2(w.y3[f],w.x3[f])-Math.atan2(sy[e],sx[e]);
      if(dlon>Math.PI)dlon-=2*Math.PI;if(dlon<-Math.PI)dlon+=2*Math.PI;
      const dir=Math.abs(dlat)>Math.abs(dlon)*Math.cos(w.lat[f])?(dlat>0?'north':'south'):(dlon>0?'east':'west');
      chron('people',`The ${E[e].name} drift apart; in the ${dir} a new people, the ${E[c].name}, emerges.`,f,[RE(E[e]),RE(E[c])]);
    }
  }
  for(let e=0;e<n;e++){const o=E[e];if(o.alive)for(let k=0;k<6;k++)o.cult[k]=clamp(o.cult[k]+gauss(s.r)*0.015*(1-0.6*rw[e]),0,1)}
}
function mixPass(){
  const s=S,w=WD,r=s.r,L=w.landIdx;const s_eth=s.eth,s_eth2=s.eth2,s_lab=s.lab,s_mix=s.mix,s_mixT=s.mixT,s_pop=s.pop,w_land=w.land,w_nbS=w.nbS,w_nbA=w.nbA,w_nbW=w.nbW;let born=0;
  for(let k=0;k<L.length;k++){const i=L[k],b=s_eth2[i];if(b<0)continue;
    if(s_pop[i]<1||b===s_eth[i]){s_eth2[i]=-1;continue}
    let m=s_mix[i];
    if(m>0.5){const a=s_eth[i];s_eth[i]=b;s_eth2[i]=a;m=1-m;s_mix[i]=m}
    if(m<0.03){s_eth2[i]=-1;s_mixT[i]=0;continue}
    if(m>0.25)s_mixT[i]=Math.min(255,s_mixT[i]+1);else s_mixT[i]=Math.max(0,s_mixT[i]-1);
    if(s_mixT[i]>=15&&born<2&&r()<pU(0.08*P.mixing,i)){
      const A=s_eth[i];if(A<0)continue;
      const nid=newEth(A,b);born++;
      const q=s.q;let h=0,t=0,cnt=0,pp=0;q[t++]=i;s_lab[i]=-7;
      while(h<t&&cnt<60){const c=q[h++];const ea=s_eth[c],eb=s_eth2[c];
        if((ea===A&&eb===b)||(ea===b&&eb===A)){s_eth[c]=nid;s_eth2[c]=-1;s_mix[c]=0;s_mixT[c]=0;cnt+=cw(c);pp+=s_pop[c];
          for(let d=w_nbS[c];d<w_nbS[c+1];d++){const j=w_nbA[d];if(j>=0&&w_land[j]&&s_lab[j]!==-7){s_lab[j]=-7;q[t++]=j}}}}
      for(let z=0;z<t;z++)s_lab[q[z]]=0;
      const E=s.eths,ne=E[nid];
      if(cnt<5){for(let z=0;z<t;z++){const c=q[z];if(s_eth[c]===nid){s_eth[c]=A;s_eth2[c]=-1}}ne.alive=false;ne.stillborn=true;continue}
      if(pp>300000){chron('people',`From long mingling of the ${E[A].name} and the ${E[b].name}, a new people emerges: the ${ne.name}.`,i,[RE(E[A]),RE(E[b]),RE(ne)]);spot(`A new people, the ${ne.name}, is born of the ${E[A].name} and ${E[b].name}`,i,[RE(ne)])}
    }
  }
}
// share of a province's people who live in its town: canals and rivers that make grain cheap to move to a centre, trade,
// storable staples and walls draw people together (Adams 1981; Algaze 2008). Irrigated southern Mesopotamia was mostly urban.
function urbanShare(i){const s=S,w=WD;return clamp(0.05+0.4*s.irrig[i]*Math.min(1,2*rvAg()[i])+0.25*Math.min(1,s.car[i])+0.1*s.cStore[i]+(s.fort[i]>0.3?0.1:0),0,0.8)}
function cityPass(){
  const s=S,w=WD,r=s.r,pols=s.pols;const s_city=s.city,s_eth=s.eth,s_farm=s.farm,s_pol=s.pol,s_pop=s.pop;
  // on provinces a town draws on a 100 km cell's people, as on the grid (the people of the cell it lies in), and two towns are
  // not founded within a cell of each other: a fifth-of-a-cell province on a crowded plain is not a city, nor is every one of five
  const CP=w.szF?cellPopF():null,near=i=>{let f=false;ring(i,1,(j,dx,dy)=>{if(!f&&j!==i&&s_city[j]>=0&&dx*dx+dy*dy<0.9)f=true});return f};
  for(const id of s.alive){pols[id].cityPop=0;pols[id].cityUrb=0;pols[id].cityI=0;pols[id].cityN=0}
  for(const i of w.landIdx){const p=s_pol[i];
    if(s_city[i]>=0){if(p){const q=pols[p],cp=CP?CP[i]:s_pop[i];q.cityN++;q.cityPop+=cp;q.cityUrb+=cp*urbanShare(i);if(i!==q.capital&&s.integ[i]>0.5)q.cityI++}continue}
    if(s_farm[i]<0.5||!p)continue;
    const o=pols[p],cp=CP?CP[i]:s_pop[i],urb=cp*urbanShare(i);
    // a town of 25,000 is a city whatever the province's size; otherwise a large province grows one at the capital
    if(urb<25000&&(cp<120000||(i!==o.capital&&cp<Math.max(150000,o.mp*0.6))))continue;
    if(CP&&near(i))continue;
    const L=langAt(i);s_city[i]=s.cities.length;s.cities.push({name:cityWord(L,r),cell:i,born:s.year,eth:s_eth[i],peak:cp})}
  // a realm's towns cannot hold more people than the realm (a city-state on part of a cell)
  if(CP)for(const id of s.alive){const q=pols[id];if(q.cityPop>q.pop){q.cityUrb*=q.pop/q.cityPop;q.cityPop=q.pop}}
  for(const c of s.cities){const cp=CP?CP[c.cell]:s_pop[c.cell];if(cp>c.peak)c.peak=cp}
  // empire is recognised, not invented: a state that rules many cities directly through its own governors, records and soldiers
  for(const id of s.alive){const o=pols[id];if(o.kind!=='state'||o.empireY||(o.cityI||0)<4||(o.hold||0)<0.55)continue;
    o.empireY=s.year;const first=!s.firstEmpire;if(first)s.firstEmpire={y:s.year,pol:id};
    chron('state',`${first?'For the first time anywhere, a':'A'} single state rules many cities directly: the ${o.full} holds ${o.cityI+1} cities through its own governors, records and soldiers. An empire.`,o.capital,[R_(o)],'Conquered cities once broke away at the first chance; this court can see, pay and send to all of them.')}
}
// shape of an empire at its peak: east-west versus north-south extent in km (Turchin, Adams & Hall 2006)
function polShape(o){const w=WD,cols=new Uint8Array(W);let la0=90,la1=-90,sl=0,n=0;
  for(const i of w.landIdx){if(S.pol[i]!==o.id||isWaste(i))continue;const la=w.lat[i]*57.2958,a=cw(i);if(la<la0)la0=la;if(la>la1)la1=la;cols[w.hx?w.hx[i]:w.cxA[i]]=1;sl+=la*a;n+=a}
  if(n<10)return null;let gap=0,run=0;for(let k=0;k<2*W;k++){if(cols[k%W])run=0;else{run++;if(run>gap)gap=run}}gap=Math.min(gap,W);
  const span=(W-gap+1)*360/W,ml=sl/n,ew=span*111*Math.cos(ml/57.2958),ns=(la1-la0+180/H)*111;return{ew:Math.round(ew),ns:Math.round(ns),n}}
function shapePass(){const s=S;
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='state')continue;const real=o.cells-(o.wasteN||0);if(real<60||real<(o.shapeN||0)*1.08)continue;
    const sh=polShape(o);if(!sh)continue;o.shapeN=real;o.shape=sh;if(!o.inShapes){o.inShapes=1;s.shapes.push(o.id)}}}
function regionPass(){
  const s=S,w=WD;const s_admin=s.admin,s_farm=s.farm,s_lmPop=s.lmPop,s_pol=s.pol,s_pols=s.pols,s_pop=s.pop,s_regionFirst=s.regionFirst,w_cxA=w.cxA,w_lat=w.lat,w_lm=w.lm,w_sF=w.sF;
  if(s.year%50===0){if(!s.shapes)s.shapes=[];shapePass()}
  s.lmPop.fill(0);for(const i of w.landIdx)if(s_pop[i]>=1)s_lmPop[w_lm[i]]+=cw(i);
  // dark ages: has writing been forgotten where a literate great power fell?
  s.darkWatch=s.darkWatch.filter(d=>{if(s.year-d.y<100)return true;let a=0;for(const c of d.cells)a+=s_admin[c];a/=Math.max(1,d.cells.length);
    const o=s_pols[d.id];if(a<0.3&&o)chron('culture',`A century after the fall of the ${o.peak}, writing has fallen out of use in most of its old lands.`,o.capital,[['pol',o.id,o.peak]],'With no state to pay scribes and no cities to need them, the skill was not passed on.');return false});
  if(!w.isEarth)return;
  const cnt=new Map();
  // the first state, league or overlord's bloc holding a large share of a region's people (not its empty land);
  // a tributary counts toward its overlord, a league city toward its league; chiefdoms count only inside a league or bloc
  const headOf=o=>{if(o.over&&s_pols[o.over]&&s_pols[o.over].alive)return['p',o.over];if(o.league!=null&&s.leagues&&s.leagues[o.league]&&!s.leagues[o.league].end)return['L',o.league];return['p',o.id]};
  for(const R of w.regions){if(s_regionFirst[R.k])continue;cnt.clear();let tot=0;for(const i of R.cells){const pp=s_pop[i];tot+=pp;const p=s_pol[i];if(!p)continue;const o=s_pols[p];
      const [t,id]=headOf(o),solo=t==='p'&&id===o.id;if(solo&&(o.tier==='Chiefdom'||o.tier==='Clans'))continue;const key=t+id;cnt.set(key,(cnt.get(key)||0)+pp*(o.coord??1))}
    let best=0,bk='';for(const [k,c] of cnt)if(c>best){best=c;bk=k}
    // and at least 100,000 people: a single walled town holding a third of an almost empty region is not yet its first state
    if(tot>0&&best>=0.3*tot&&best>=1e5){const L=bk[0]==='L',id=+bk.slice(1),o=L?null:s_pols[id];s_regionFirst[R.k]={y:s.year,pol:L?s.leagues[id].members[0]:id,name:L?s.leagues[id].name:o.full,kind:L?'league':o.kind}}}
  const share=cells=>{cnt.clear();let tA=0;for(const i of cells){const a=cw(i);tA+=a;let p=s_pol[i];if(!p)continue;let wt=a;const o=s_pols[p];if(o.over&&s_pols[o.over]&&s_pols[o.over].alive){p=o.over;wt=0.6*a}cnt.set(p,(cnt.get(p)||0)+wt)}let best=0,bp=0;for(const [p,c] of cnt)if(c>best){best=c;bp=p}return[cells.length?best/tA:0,bp]};
  const [cs,cp]=share(w.chinaCells);s.chinaHist.push([s.year,cs,cp]);
  const [ms,mp]=share(w.medCells);s.medHist.push([s.year,ms,mp]);
  if(ms>s.medBest.share)s.medBest={share:ms,y:s.year,pol:mp,name:mp?s_pols[mp].full:''};
  if(s.year%100===0||s.year>=0&&!s.farmCheck){s.stateNow={y:s.year,res:NOSTATE.map(R=>{let pc=0,sc=0;for(const i of w.landIdx){const la=w_lat[i]*180/Math.PI,lo=(w_cxA[i]+0.5)/W*360-180;if(la<R.box[0]||la>R.box[1]||lo<R.box[2]||lo>R.box[3]||s_pop[i]<1)continue;const a=cw(i);pc+=a;if(s_pol[i]&&s_pols[s_pol[i]].kind==='state'&&s_pols[s_pol[i]].tier!=='Chiefdom')sc+=a}return{n:R.n,share:pc?sc/pc:0,pc}})}}
  if(s.year>=0&&!s.farmCheck||s.year%100===0){const res=NOFARM.map(R=>{let pc=0,fc=0;for(const i of w.landIdx){const la=w_lat[i]*180/Math.PI,lo=(w_cxA[i]+0.5)/W*360-180;if(la<R.box[0]||la>R.box[1]||lo<R.box[2]||lo>R.box[3]||s_pop[i]<1)continue;const a=cw(i);pc+=a;if(s_farm[i]>0.5&&w_sF[i]>0.15)fc+=a}return{n:R.n,share:pc?fc/pc:0}});
    if(s.year>=0&&!s.farmCheck)s.farmCheck={y:s.year,res};s.farmNow={y:s.year,res}}
}
function recordStats(){
  const s=S,w=WD;const s_pols=s.pols,s_pop=s.pop;let tp=0;const eraPop=new Float64Array(ERAS.length);
  for(const i of w.landIdx){const p=s_pop[i];if(p<1)continue;tp+=p;eraPop[eraOf(i)]+=p}
  let np=0,nh=0,big=null,bigS=null,bigH=null;for(const id of s.alive){const o=s_pols[id];if(o.cells>=2){if(o.kind==='horde')nh++;else np++}if(!big||o.cells>big.cells)big=o;if(o.kind==='horde'){if(!bigH||o.cells>bigH.cells)bigH=o}else if(!bigS||o.cells>bigS.cells)bigS=o;if(o.cells>=3)o.hist.push(s.year,o.cells)}
  let pe=0;for(const e of s.eths)if(e.alive)pe++;
  let lead=0;for(let k=ERAS.length-1;k>=0;k--)if(eraPop[k]>tp*0.03){lead=k;break}
  s.stats.push({y:s.year,pop:tp,np,nh,big:big?big.full:'',bc:big?big.cells:0,bcS:bigS?bigS.cells:0,bigS:bigS?bigS.id:0,bcH:bigH?bigH.cells:0,bigH:bigH?bigH.id:0,pe,lead,gT:s.gT+epochTemp()+s.climAnom,co2:s.co2,ch4:s.ch4,eraPop:Array.from(eraPop,v=>v/(tp||1))});
}
function step(){for(const _ of stepG());}
// one simulated year, split into slices so the page can stay responsive between them
// remainder that is never negative: in JS, -8997 % 10 is -7, which silently skipped passes in BCE years
const ymod=(y,n)=>((y%n)+n)%n;
// (default; switch nofast turns it off; Nein, 2026-11-10: let the early game pass faster) while the whole world forages (no farming, no herds, no polity)
// the yearly passes run once a decade for the decade: growth by the logistic's exact solution over ten years, migration in two
// five-year moves, three rounds of technique spread, ten years of sea crossings. Passes on their own schedules (every 5, 10, 20 and
// 50 years) run as always. The first field, herd or polity ends it for good. One run takes half its time before the first state
// because yearly weather keeps every province's numbers moving, not because anything is changing
function fastD(){const s=S;if(swOn('nofast')||s.fastOff)return 1;
  if(ymod(s.year,10)===0){let on=s.alive.length>0||(s.domLog&&s.domLog.length>0);if(!on){const f=s.farm,h=s.herd;for(const i of WD.landIdx)if(f[i]>0.01||h[i]>0.01){on=true;break}}
    if(on){s.fastOff=s.year;return 1}}
  return 10}
function* stepG(){
  const s=S;s.year++;const FD=fastD(),hv=FD===1||ymod(s.year,FD)===0;s.dt=FD;
  climateStep();if(WD.isEarth){if(s.year%5===0){eventPass();originsPass()}if(s.year%50===0)humidStep();if(s.year%10===0)seaStep();if(s.year%250===0&&s.year<-6000)s.seaVer++}weather();if(hv&&herdsOn())herdYear();if(s.year%50===0||!s.lake)waterPass();hearthCheck();
  if(s.dTt>0){s.dTt--;if(!s.dTt)s.dT=0}
  else if((s.rN||s.r)()<0.0012*P.volcano)volcano();
  if(s.year-s.climY>=250||Math.abs(s.co2-s.climCo2)>4){yield;yield* climUpdateG();yield}
  if(hv){computeK();followWater();growth();yield;if(FD>1){s.dtM=FD/2;migrate();migrate();s.dtM=1}else migrate();seaHop();if(S.gzD)grazePass()}
  if(FD>1){if(hv)for(let k=0;k<3;k++){techStep(0,1);yield}}
  else if(s.year%3===0){techStep(0,0.34);yield;techStep(0.34,0.67);yield;techStep(0.67,1);yield}
  if(hv)disease();if(ymod(s.year,10)===5)poolPass();if(ymod(s.year,20)===7)caravanPass();yield;
  if(hv)yield* politicsG();if(fieldOn()&&s.alive.length)armyYear();
  if(s.year%5===1)rallyPass();if(ymod(s.year,5)===2&&armyOn())bandWars();if(ymod(s.year,10)===3&&goodsOn()&&s.alive.length)goodsPass();if(ymod(s.year,10)===6&&slaveOn()&&s.alive.length)slavePass();if(hv&&s.year%2===0)frontierPass();
  if(s.year%20===0){yield;ethPass(true);yield;relPass()}
  if(ymod(s.year,10)===3){cropPass();yield}
  if(ymod(s.year,10)===6){landUsePass();yield}
  if(ymod(s.year,10)===8){herdPass();coalitionPass();yield}
  if(s.year%10===0){genCache();ritualPass();deepPass();recPass();carbonPass();yield;matrixPass();yield;colonyPass();if(!NOLEAGUE){leaguePass();colonizePass()}yield;recordStats();cityPass();yield;regionPass();yield;mixPass()}
}

/* ================= v0.5: land, ecology, disease, contact, inequality ================= */
// static ecological layers derived from the world once
function prepEco(w){
  if(w.ecoReady)return;
  const forest0=new Float32Array(N),heavy=new Float32Array(N),mal=new Float32Array(N),malAm=new Float32Array(N),oncho=new Float32Array(N),circ=new Float32Array(N),good=new Float32Array(N);
  for(const i of w.landIdx){const t=w.T[i],p=w.Pr[i],rv=w.rv[i];
    forest0[i]=w.desert[i]?0:clamp((p-380)/520,0,1)*clamp((t+6)/8,0,1)*(1-0.5*clamp((w.elev[i]-3000)/800,0,1));
    heavy[i]=clamp((p-650)/400,0,1)*clamp((17-t)/5,0,1)*(1-clamp(rv*2,0,0.6));
    mal[i]=w.elev[i]<1500?clamp((t-19)/5,0,1)*clamp((p-650)/700,0,1):0;
    // malaria reached the Americas only with ships from Europe and Africa
    if((w.cxA[i]+0.5)/W*360-180<-30){malAm[i]=mal[i];mal[i]=0}
    oncho[i]=rv>0.25&&w.rough[i]>0.12?clamp((t-21)/3,0,1)*clamp((p-700)/300,0,1)*clamp((1900-p)/300,0,1):0;
    good[i]=w.sF[i]+0.5*w.rv[i]*(w.sF[i]>0.05?1:0)}
  // environmental circumscription (Carneiro): good land hemmed in by poor land or sea
  const sur=Float32Array.from(good);blurUnits(w,sur,7,6,true);
  for(const i of w.landIdx){const own=good[i];if(own<0.15)continue;circ[i]=clamp((1-sur[i]/own)*1.3,0,1)}
  // ecological niche of each province (Turchin, Adams & Hall 2006): climate, moisture, way of life, disease setting
  const nT=new Float32Array(N),nM=new Float32Array(N),nN=new Float32Array(N),nD=new Float32Array(N);
  // (default since run 89, Nein 2026-11-06: count river water; switch norvniche turns it off) a people farming a floodplain or fan lives on the river's water, not the
  // rain: moisture counts the watered share of the farmland (as the fan pass waters it, to 550 mm) and only the rest is desert living,
  // so the Nile's and Sumer's farmers are not desert peoples to the rule of ecological reach
  const RVN=!swOn('norvniche');
  for(const i of w.landIdx){const g=RVN?Math.min(1,w.rvF[i]/Math.max(w.sF[i],0.02)):0,pe=w.Pr[i]+g*Math.max(0,550-w.Pr[i]);
    nT[i]=w.T[i]/8;nM[i]=2*clamp(Math.log(Math.max(1,pe)/150)/Math.log(20),0,1);nN[i]=w.nomad[i]?1.2:w.desert[i]?0.8*(1-g):0;nD[i]=0.8*mal[i]+(w.tsetse[i]?0.5:0)}
  // seasonal pastures (transhumance): herds move between summer uplands and winter lowlands, or between desert-edge grass after the rains and wetter pasture in the dry season
  const transh=new Float32Array(N);
  for(const i of w.landIdx){if(w.sH[i]<0.12)continue;let v=0;const e0=w.elev[i],p0=w.Pr[i];
    ring(i,3,j=>{if(!w.land[j]||w.sH[j]<0.08)return;v=Math.max(v,clamp((Math.abs(w.elev[j]-e0)-500)/1000,0,1),clamp((Math.abs(w.Pr[j]-p0)-150)/400,0,1)*(w.desert[i]||w.desert[j]||w.nomad[i]?1:0.4))});
    transh[i]=v}
  Object.assign(w,{forest0,heavy,mal,malAm,oncho,circ,nT,nM,nN,nD,transh,ecoReady:true});
}
// how strongly a place's people are tied to a technique's ecological niche
function techFit(o,k){const p=TECH[k].pos;if(!p||!o.fac)return 1;const dx=p[0]-o.fac[0],dy=p[1]-o.fac[1];return Math.exp(-(dx*dx+dy*dy)/0.6)}
function ecoD(i,o){const v=o.ni;if(!v)return 0;const w=WD,a=w.nT[i]-v[0],b=w.nM[i]-v[1],c=w.nN[i]-v[2],d=w.nD[i]-v[3];return Math.sqrt(a*a+b*b+c*c+d*d)}
// land with nothing a state can tax: empty, or held by foragers with no fields or herds worth the name
function isWaste(i,horde){const s=S,w=WD;if(s.pop[i]<1)return true;if(s.pop[i]/w.area[i]<0.25&&w.sF[i]<0.12)return true;if(s.farm[i]*w.sF[i]>=0.12||s.car[i]>=0.3||s.city[i]>=0)return false;
  const hp=s.herd[i]*Math.max(w.sH[i],w.desert[i]*s.camel[i]*0.6);return horde?hp<0.15:s.K[i]/w.area[i]<2.5}
// Tainter: complexity has rising upkeep; Goldstone: fiscal crisis; Turchin/Scheidel: the wealth pump and its levellers
function statecraft(o,c,y){
  const s=S,r=s.r;
  if(o.cplx==null){o.cplx=0.2;o.treas=0.3;o.ineq=0.25}
  if(o.kind!=='state'){o.pT=o.pF=o.pQ=0;o.burden=0;return}
  // a state born this year has not yet collected its first taxes
  if(o.tax==null){o.pT=o.pF=0;o.pQ=o.pQ||0;o.burden=o.burden||0.6;if(!o.fac)o.fac=[0,0];return}
  const real=Math.max(1,o.cells-(o.wasteN||0));
  // strained polities build new layers of office (scalar stress); threatened ones build tax offices, arsenals and standing
  // troops (Tilly 1990). Both are paid for in upkeep below
  const tgt=0.15+0.35*admOf()[c]+0.2*s.law[c]+0.2*s.roads[c]+0.15*s.paper[c]+0.3*Math.min(1,real/250)+0.1*Math.min(1,o.fortN/20)+(o.scl?0.15*sclK()*Math.min(1.5,o.scl):0)+0.2*Math.min(1,o.thr||0);
  o.cplx+=tgt>o.cplx?0.01*(tgt-o.cplx):0.0015*(tgt-o.cplx);
  const ledger=s.tk[27][c]>0.5;
  // ruling costs grow with people AND with land: every province needs officials, garrisons and messengers, so thinly peopled realms cost more than they pay
  const upkeep=0.28*Math.pow(o.cplx,ledger?1.6:1.8)*(o.pop+12000*real*(1-0.4*s.roads[c])),rev=(o.tax||0)*(1-0.45*(o.nob||0))*(ledger?1.1:1)+1;
  o.burden=upkeep/rev;
  o.pT=Math.max(0,o.burden-1)*1.2;
  const atWar=o.enemies.size>0;
  // extraction: how much of what the farmers grow above their needs the ruler takes. His own appetite and the realm's needs
  // (war, debt) set the aim; what records, officials and the labour levy can see and collect caps it (Scott 1998; D'Altroy &
  // Earle 1985 on staple finance). A light hand keeps the peasants loyal; a heavy one starves them, drives them off or raises
  // them (Goldstone 1991; Turchin & Nefedov 2009).
  {const R0=o.ruler||{},greed=R0.greed??0.5,rec=o.info?Math.min(1,o.info.rec):admOf()[c];
   o.levy=clamp(o.pop/Math.max(1,o.cells)/60000,0,1)*clamp((o.cplx||0.2)/0.5,0,1);
   // money and hauling
   if(moneyOn()){o.haul=haulAt(c);const mkt=clamp(3*(o.cityPop||0)/(o.pop+1)+0.5*Math.min(1,s.car[c])+0.3*(o.coastN/Math.max(1,o.cells)),0,1),pay=clamp((o.garr||0)/(o.pop+1)*4+(atWar?0.3:0),0,1),
       bu=o.gmet?o.gmet[5]:1,mT=Math.max(0.5*Math.min(1,s.metal[c])*mkt*(0.5+0.5*bu),(0.5+0.5*mkt)*s.coin[c]*(0.4+0.6*bu),0.35*mkt*(1-o.haul));
     if(o.mon==null)o.mon=0;const was=o.mon;o.mon+=(0.01+0.02*pay)*(mT-o.mon);
     if(was<0.25&&o.mon>=0.25&&real>=15&&s.coin[c]<0.3&&s.metal[c]<0.3)chron('culture',`In the markets of the ${o.full} cloth, shells and other light goods pass as money: there is little to carry grain with, and no coin.`,c,[R_(o)]);
     if(o.deb>0)o.deb*=0.97;
     if(o.treas<-0.8&&o.mon>0.6&&s.coin[c]>0.5&&r()<0.05){o.deb=(o.deb||0)+0.15;o.treas+=0.4;o.mon-=0.1;o.mandate=Math.max(0,(o.mandate??1)-0.05);o.shock+=0.05*o.deb*4;s.debN=(s.debN||0)+1;
       if(real>=25)chron('fall',`Short of silver, the ${o.full} thins its coin. The soldiers are paid; prices rise, and trust in the coin falls.`,c,[R_(o)],'The treasury could not meet its debts in good metal.')}}
   const aim=0.4+0.4*(greed-0.5)+(atWar?0.15:0)+0.2*Math.max(0,-o.treas),cap=0.3+0.45*rec+0.25*o.levy*(moneyOn()?1+(1-(o.haul??0.5))*(1-(o.mon||0)):1);
   if(o.ext==null)o.ext=Math.min(aim,cap);o.ext+=0.08*(Math.min(aim,cap)-o.ext);
   o.pW=Math.max(0,o.ext-(0.5+0.25*(o.leg??0.8)))*1.5+(o.wantP||0);
   if(o.ext<0.45)o.mandate=Math.min(1,(o.mandate??1)+0.003*(0.45-o.ext)*10)}
  // garrisons and repairs: every walled province costs something every year
  // garrisons on a tribal frontier
  o.treas=clamp(o.treas+0.04*(1-o.burden)-(atWar?0.02:0)-0.0004*(o.fortN||0)-0.0003*(o.tFront||0),-2,1);
  o.pF=Math.max(0,-o.treas)*0.6+0.3*Math.max(0,(o.owed||0)-0.5);
  if(o.treas<-1.2&&s.law[c]>0.5&&r()<0.02){
    if(o.ineq>0.5&&r()<0.5){o.treas=0;o.ineq=Math.max(0.2,o.ineq-0.12);o.mandate=Math.min(1,o.mandate+0.15);if(real>=25)chron('culture',`${cap(rulerName(o))} of the ${o.full} proclaims a jubilee: debts are cancelled and debt-slaves freed.`,c,[R_(o)],'Debts had piled up faster than anyone could repay them; cancelling them bought peace and loyalty.')}
    else{o.treas=-0.2;o.mandate=Math.max(0,o.mandate-0.2);o.shock+=0.3;if(real>=25)chron('fall',`The treasury of the ${o.full} is empty: the crown defaults on its debts and its soldiers go unpaid.`,c,[R_(o)],'Spending on armies and officials had long outrun what the land could pay.')}}
  // the wealth pump: crowded land and peace concentrate wealth, faster where the plough makes land the prize
  const plF=(o.plN||0)/real;
  o.ineq=clamp(o.ineq+0.0012*(o.press-0.75)*(1+0.8*plF)+(atWar?0:0.0004)-0.0004*(1-plF)*(o.ineq-0.25),0.15,0.92);
  o.pQ=Math.max(0,o.ineq-0.55)*(o.press>0.85?1.6:0.6)*(1-Math.min(0.6,2*(o.slvS||0)));
  // labour scarcity after great dying
  if(y%10===0){if(o.p10&&o.pop<0.8*o.p10&&o.plagueD>0.1*o.p10){const was=o.ineq;o.ineq=Math.max(0.2,o.ineq-0.15);if(real>=30&&was>0.45)chron('culture',`After the great dying, labour is scarce in the ${o.full}: wages rise and the great landholders lose their grip.`,c,[R_(o)],'So many had died that the survivors could bargain for their work.')}
    o.p10=o.pop;o.plagueD=0}
  // position in need/energy space, for invention
  const need=clamp((o.press-0.8)*2+(atWar?0.3:0)+0.5*Math.max(0,o.burden-0.8)-0.3*Math.max(0,1-o.press),-1,1);
  const energy=clamp(-0.8+0.6*s.ard[c]+0.5*s.iron[c]+0.4*s.horse[c]+0.3*(o.coastN/Math.max(1,o.cells))+0.4*WD.rv[c]+0.3*s.camel[c]+0.3*s.wheel[c],-1,1);
  o.fac=[need,energy];
}
function localPop(i){const w=WD,s=S;let t=s.pop[i];for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0)t+=s.pop[j]}return t*1.8}
// On provinces, people counted the way the grid counted them: each 100 km cell holds the people of the units in it, by area
// (G); a unit sees the area-weighted mean over the cells it covers, of its own cell (cellPopF) or of its cell and the four beside
// it times 1.8 (localPopF, the grid's localPop). A province of a fifth of a cell is not five times harder to crowd, nor a
// desert province of thirty cells thirty times easier
function cellPeople(){const w=WD,s=S,G=w._cg||(w._cg=new Float64Array(NC)),S_=w.gcS,A=w.gcA,Wt=w.gcW;G.fill(0);
  for(const v of w.landIdx){const p=s.pop[v];if(p>0)for(let q=S_[v];q<S_[v+1];q++)G[A[q]]+=p*Wt[q]}return G}
// a metaethnic frontier on provinces is as wide as on the grid: a 100 km cell touching another people or faith is all frontier,
// so a province counts as frontier if one touching them lies within three quarters of a cell of it (the grid: the touching
// cells themselves)
function frontBand(){const w=WD,s=S,L=w.landIdx,n=w.n,d=w._fb||(w._fb=new Float32Array(n)),F=w._fbF||(w._fbF=new Uint8Array(n)),q=[];d.fill(9);F.fill(0);
  for(const i of L){const ei=s.eth[i],ri=s.rel[i],p=s.pol[i];let f=0;for(let e=w.nbS[i];e<w.nbS[i+1]&&!f;e++){const j=w.nbA[e];if(j<0||!w.land[j]||s.pol[j]===p)continue;const ej=s.eth[j];
      if(ej>=0&&ei>=0&&ej!==ei&&ethDist(ei,ej)>0.22)f=1;else if(ri>=0&&s.rel[j]>=0&&s.rel[j]!==ri)f=1}
    if(f){d[i]=0;q.push(i)}}
  for(let h=0;h<q.length;h++){const c=q[h],dc=d[c];F[c]=1;for(let e=w.nbS[c];e<w.nbS[c+1];e++){const j=w.nbA[e];if(j<0||!w.land[j])continue;const x=dc+w.nbD[e];if(x<=0.75&&x<d[j]){d[j]=x;q.push(j)}}}
  return F}
// Province calibration (run 86, 64 histories): farming spreads between provinces at 0.7 of the rate other know-how does (it
// ran 1.4 times as fast as on the grid from Anatolia to the Danube; switches fd55, fd100 to test), and writing comes six times
// as readily (province states form near their real dates, about 2,400 years after the grid's, and the rate was set for those
// early states; switches wr1, wr3). The grid keeps both as they were
const WRX=swOn('wr1')?1:swOn('wr3')?3:6,FDX=swOn('fd100')?1:swOn('fd55')?0.55:0.7;
// the density of an amount held by the units (people, food), as the 100 km cells around each unit hold it: each cell's amount
// over its land, seen by a unit as the area-weighted mean over the cells it covers
function cellDensF(a,key){const w=WD,G=new Float64Array(NC),LA=new Float64Array(NC),S_=w.gcS,A=w.gcA,Wt=w.gcW,out=w['_cd'+key]||(w['_cd'+key]=new Float32Array(w.n));
  for(const v of w.landIdx){const x=a[v],ar=w.area[v];for(let q=S_[v];q<S_[v+1];q++){const c=A[q];G[c]+=x*Wt[q];LA[c]+=ar*Wt[q]}}
  for(let c=0;c<NC;c++)if(LA[c]>0)G[c]/=LA[c];
  for(const v of w.landIdx){let x=0;for(let q=S_[v];q<S_[v+1];q++)x+=Wt[q]*G[A[q]];out[v]=x}return out}
function cellPopF(){const w=WD,G=cellPeople(),out=w._cp||(w._cp=new Float32Array(w.n)),S_=w.gcS,A=w.gcA,Wt=w.gcW;
  for(const v of w.landIdx){let x=0;for(let q=S_[v];q<S_[v+1];q++)x+=Wt[q]*G[A[q]];out[v]=x}return out}
function localPopF(){const w=WD,G=cellPeople(),out=w._lp||(w._lp=new Float32Array(w.n)),S_=w.gcS,A=w.gcA,Wt=w.gcW;
  for(const v of w.landIdx){let x=0;for(let q=S_[v];q<S_[v+1];q++){const c=A[q],cx=c%W,cy=(c/W)|0;
      x+=Wt[q]*(G[c]+G[cy*W+(cx+1)%W]+G[cy*W+(cx+W-1)%W]+(cy>0?G[c-W]:0)+(cy<H-1?G[c+W]:0))}out[v]=x*1.8}return out}
// a polity born on provinces takes in what one born on the grid took (its cell and, each by chance pr, the four beside it): of
// the land within rad cells (100 km), reached through units whose ground and people fit (ok), it takes a share pr on average
// (half to one and a half times that), nearest first, so that what it takes is all of one piece
function grabNear(i,id,ok,pr,rad){const w=WD,s=S,r=s.r,dm=new Map([[i,0]]),q=[i],R=rad||1.05;
  for(let h=0;h<q.length;h++){const c=q[h],dc=dm.get(c);for(let e=w.nbS[c];e<w.nbS[c+1];e++){const j=w.nbA[e];if(j<0||j===i||!w.land[j]||!ok(j))continue;
      const d=dc+w.nbD[e];if(d>R||(dm.has(j)&&dm.get(j)<=d))continue;if(!dm.has(j))q.push(j);dm.set(j,d)}}
  const ord=q.slice(1).sort((a,b)=>dm.get(a)-dm.get(b));let A=0;for(const j of ord)A+=cw(j);
  const T=pr>=1?A:A*pr*(0.5+r());let got=0;
  for(const j of ord){if(got>=T)break;s.pol[j]=id;s.dist[j]=Math.max(1,Math.round(2*dm.get(j)));got+=cw(j)}}
// contact with states: a state's example, trade demand and threat reach a few provinces past its borders, fading with
// distance; a strong state reaches further than a chiefdom. Outside the cradles, states form where this reaches.
function stxPass(){const s=S,w=WD,L=w.landIdx,x=s.stx,nbS=w.nbS,nbA=w.nbA,nD=w.hopK?(w.dec08||(w.dec08=Float32Array.from(w.nbD,d=>Math.pow(0.8,d)))):null;
  for(const i of L){const p=s.pol[i];if(!p){x[i]=0;continue}const o=s.pols[p];
    x[i]=o.kind!=='state'?0.25:o.tier==='Chiefdom'||o.tier==='Clans'?0.2:clamp((o.spc||2)/7,0.25,1)}
  // a caravan road carries the example of the state at its far end: salt, gold, scribes and envoys
  for(const i of L)if(s.car[i]>0.1)x[i]=Math.max(x[i],0.8*Math.min(1,s.car[i]))
  for(let k=0;k<6;k++){const fw=k%2===0;for(let a=0;a<L.length;a++){const i=L[fw?a:L.length-1-a];let m=x[i];
    for(let d=nbS[i];d<nbS[i+1];d++){const j=nbA[d];if(j>=0&&w.land[j]){const v=(nD?nD[d]:0.8)*x[j];if(v>m)m=v}}x[i]=m}}}
// the exit option (Herbst, Scott): open land nearby lets subjects walk away; crowding or barren surroundings trap them (Carneiro)
function exitPass(a0,b0){if(a0==null){a0=0;b0=1}
  const s=S,w=WD,LL=w.landIdx;if(!w.exQ){w.exQ=new Float64Array(N);w.exPd=new Float64Array(N);for(const j of LL){const q=Math.max(w.sF[j],0.5*w.forest0[j]*(w.T[j]>10?1:0.3),0.4*w.sH[j]);w.exQ[j]=q;w.exPd[j]=Math.max(0.3,7*q)}}const exQ=w.exQ,exPd=w.exPd;const s_circE=s.circE,s_exit=s.exit,s_pol=s.pol,s_pop=s.pop,w_T=w.T,w_area=w.area,w_circ=w.circ,w_cxA=w.cxA,w_cyA=w.cyA,w_forest0=w.forest0,w_land=w.land,w_sF=w.sF,w_sH=w.sH;
  for(let kk=Math.floor(a0*LL.length),ke=Math.floor(b0*LL.length);kk<ke;kk++){const i=LL[kk];if(s_pop[i]<1||w_sF[i]<0.1){s_circE[i]=w_circ[i];continue}
    // the land around, sampled every 100 km out to 300 km (on provinces, the province at each point; its own ground aside)
    const cx=w.hx?w.hx[i]:w_cxA[i],cy=w.hy?w.hy[i]:w_cyA[i];let tot=0,n=0;
    for(let dy=-3;dy<=3;dy++){const yy=cy+dy;if(yy<0||yy>=H)continue;for(let dx=-3;dx<=3;dx++){if(!dx&&!dy)continue;const j=uAt(cx+dx,yy);if(j===i)continue;n++;if(!w_land[j])continue;
      const q=exQ[j],pd=exPd[j];tot+=q*Math.max(0,1-s_pop[j]/w_area[j]/pd)*(s_pol[j]?0.4:1)}}
    const ex=n?tot/n:0,own=w_sF[i]+0.1;s_exit[i]=ex;
    s_circE[i]=clamp(Math.max(w_circ[i],1-1.6*ex/own),0,1)}
}
// disease pools (McNeill, Crosby): dense, connected farming and herding peoples build up crowd diseases and immunity to them
function poolPass(){
  const s=S,w=WD,L=w.landIdx,dp=s.dp,tmp=s.bfsPar;const s_car=s.car,s_city=s.city,s_eth=s.eth,s_eths=s.eths,s_farm=s.farm,s_herd=s.herd,s_pop=s.pop,s_rp=s.rp,s_sail=s.sail,w_area=w.area,w_coast=w.coast,w_land=w.land,w_ls=w.ls,w_lt=w.lt,w_nbS=w.nbS,w_nbA=w.nbA,w_nbW=w.nbW,w_sH=w.sH;
  for(const i of L){if(s_pop[i]<1){dp[i]*=0.98;continue}
    const dens=s_pop[i]/w_area[i],tgt=Math.min(1,0.22*Math.log10(1+dens)+0.3*s_herd[i]*s_farm[i]+(s_city[i]>=0?0.2:0));
    let m=dp[i];for(let d=w_nbS[i];d<w_nbS[i+1];d++){const j=w_nbA[d];if(j<0||s_pop[j]<1)continue;const c=Math.min(1,(w.szF?Math.sqrt(s_pop[i]*w.szF[i]*s_pop[j]*w.szF[j]):Math.sqrt(s_pop[i]*s_pop[j]))/20000+s_car[i]);m=Math.max(m,dp[j]*(w.hopK?Math.pow(0.9+0.08*c,w.nbD[d]):0.9+0.08*c))}
    if(w_coast[i]&&s_sail[i]>0.5)for(let q=w_ls[i];q<w_ls[i+1];q++){const j=w_lt[q];if(s_pop[j]>=1)m=Math.max(m,dp[j]*0.92)}
    tmp[i]=Math.round(1000*(dp[i]+0.06*(Math.max(tgt,m)-dp[i])))}
  for(const i of L)dp[i]=tmp[i]/1000;
  // cattle plague
  const r=s.r;
  if(r()<0.04*P.disease){for(let t=0;t<60;t++){const c=rLand(r);if(s_herd[c]<0.6||w_sH[c]<0.3||pEq(c)<100)continue;
    let n=0;ring(c,9,(j,dx,dy)=>{if(w_land[j]&&s_herd[j]>0.3&&dx*dx+dy*dy<=81){s_rp[j]=Math.max(s_rp[j],0.65);n+=cw(j)}});
    const e=s_eth[c]>=0?s_eths[s_eth[c]]:null;chron('plague',`A cattle plague sweeps the herds${e?` of the ${e.name}`:''}; herders lose most of their beasts, and hunger drives many from the land.`,c,e?[RE(e)]:[]);
    if(e)pushPressure(s_eth[c],pEq(c)*0.3*Math.min(20,n),c,0,null);break}}
}
// volcanic winters, small and great
function volcano(){
  const s=S,rN=s.rN||s.r,r=s.r,great=rN()<0.15;
  s.dT=great?-2.3:-0.8-0.6*rN();s.dTt=great?4+((rN()*3)|0):1+((rN()*2)|0);
  if(!great){chron('nature','A great eruption veils the sun; harvests fail across the cooler lands for several years.');return}
  chron('nature','A colossal eruption darkens the sky: the sun is dim for years, summers fail across the world, and hunger stalks every land.',-1,[],'Volcanic ash and sulphur in the high atmosphere reflect sunlight back to space.');
  spot('A volcanic winter grips the world',-1,[]);
  for(const id of s.alive){const o=s.pols[id];o.mandate=Math.max(0,(o.mandate==null?1:o.mandate)-0.25);o.shock+=0.15}
  // famine weakens bodies: a plague often follows
  if(r()<0.5){let best=-1,bd=0;for(let t=0;t<300;t++){const i=rLand(r);const d=s.pop[i]/WD.area[i]*(1+s.car[i]*3+(s.city[i]>=0?2:0));if(d>bd&&!s.infect[i]){bd=d;best=i}}
    if(best>=0){const e=s.eth[best]>=0?s.eths[s.eth[best]]:null;const o={id:s.outbreaks.length,name:`${e?cap(e.lang.lex.river)+' ':''}${pick(r,PLAGUE)}`,origin:best,year:s.year,deaths:0,vir:0.18+r()*0.1,cells:1,active:1,done:false,spread:[[0,best]],hit:new Set()};
      s.outbreaks.push(o);s.infect[best]=3;s.ob[best]=o.id;s.inf.push(best);chron('plague',`In the hungry years after the eruption, the ${o.name} breaks out.`,best,[RPl(o)])}}
}
// caravan routes across deserts: need camels (or wind wagons), people at both ends, and demand
function caravanPass(){
  // (on provinces a crossing is measured in 100 km cells, not in steps: desert provinces are large)
  const s=S,w=WD,r=s.r,L=w.landIdx,par=s.bfsPar,z=w.szF,dist=z?(s.bfsDF&&s.bfsDF.length===N?s.bfsDF:(s.bfsDF=new Float32Array(N))):s.bfsD;
  for(const i of L)if(s.car[i]>0)s.car[i]*=0.82;
  const arid=j=>w.land[j]&&(w.desert[j]||w.Pr[j]<300);
  const srcs=[];
  for(let t=0;t<2500&&srcs.length<14;t++){const i=rLand(r);if(arid(i)||!s.pol[i]||s.pop[i]/w.area[i]<1.5)continue;
    if(s.camel[i]<0.5&&s.tk[25][i]<0.5)continue;let ok=false;for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j>=0&&arid(j))ok=true}if(ok)srcs.push(i)}
  const mark=s.bfsMark||(s.bfsMark=new Int32Array(N));
  for(const a of srcs){
    const st=++s.bfsStamp;
    const q=[a];mark[a]=st;par[a]=-1;dist[a]=0;let hit=-1;
    for(let h=0;h<q.length&&hit<0;h++){const i=q[h];if(dist[i]>70)break;
      for(let d=w.nbS[i];d<w.nbS[i+1];d++){const j=w.nbA[d];if(j<0||!w.land[j]||mark[j]===st)continue;
        if(arid(j)){if(q.length<6000){mark[j]=st;par[j]=i;dist[j]=dist[i]+(z?w.nbD[d]:1);q.push(j)}}
        else if(dist[i]>=8&&s.pop[j]/w.area[j]>1.5&&s.pol[j]!==s.pol[a]){par[j]=i;hit=j;break}}}
    if(hit<0)continue;
    const path=[];for(let c=hit,g=0;c>=0&&g<200;c=par[c],g++){path.push(c);if(c===a)break}
    for(const c of path)s.car[c]=1;
    const pa=s.pols[s.pol[a]],pb=s.pols[s.pol[hit]]||null,ea=s.eths[s.eth[a]],eb=s.eths[s.eth[hit]];
    const key=[ea?ea.fam:-1,eb?eb.fam:-1].sort().join(':');
    let R=s.routes.find(x=>x.key===key);
    const pts=path.filter((c,k)=>k%2===0||k===path.length-1);
    if(!R){R={id:s.routes.length,key,born:s.year,a,b:hit,path:pts};s.routes.push(R);
      if(ea&&eb&&ea.fam!==eb.fam&&!s.carPairs.has(key)){s.carPairs.add(key);chron('migration',`Caravans begin to cross the desert between the ${pa?pa.full:ea.name} and the ${pb?pb.full:eb.name}, carrying salt, gold, slaves and ideas.`,path[path.length>>1],[pa?R_(pa):RE(ea),pb?R_(pb):RE(eb)])}}
    else{R.path=pts;R.a=a;R.b=hit}
    R.last=s.year;
  }
  s.routes=s.routes.filter(R=>s.year-R.last<80);
}
// the exchange of crops between long-separated farming worlds (Crosby)
function cropExchange(a,b){
  const s=S,w=WD;if(s.farm[a]<0.5||s.farm[b]<0.5||w.lm[a]===w.lm[b]||w.lmSize[w.lm[a]]<200||w.lmSize[w.lm[b]]<200)return;
  const key=[w.lm[a],w.lm[b]].sort().join(':');if(s.cropX.has(key))return;s.cropX.add(key);
  seedTech(s.xcrops,a,1,1);seedTech(s.xcrops,b,1,1);s.firstTech[23]=s.firstTech[23]||{y:s.year,cell:b};
  if(typeof contactCrops==='function')contactCrops(a,b);
  const RA=rvAg(),ca=cropFor(w.T[a],w.Pr[a],RA[a])[0],cb=cropFor(w.T[b],w.Pr[b],RA[b])[0],ea=s.eths[s.eth[a]],eb=s.eths[s.eth[b]];
  chron('ideas',`Ships carry ${ca} to the ${eb?eb.name:'far shore'}, and bring ${cb===ca?'other crops':cb} home to the ${ea?ea.name:'homeland'}. Over the coming centuries the new crops will let poor and marginal soils feed far more people.`,b,[ea?RE(ea):null,eb?RE(eb):null].filter(Boolean));
  spot('New crops cross the ocean',b,[]);
}

/* ================= v0.6: the climate model through time ================= */
// The world's climate is re-solved by climate.js as the orbit drifts and greenhouse gases change.
// History uses the model's CHANGE from the present-day reference run, added to the world's baseline
// (measured normals on Earth): T = baseline + dT, P = max(0.3 baseline, baseline + dP).
function climInit(){
  const s=S,w=WD;
  Object.assign(s,{co2:262,ch4:590,cEx:0,landC:0,climY:-1e9,climCo2:262,climAnom:0,cdT:new Float32Array(N),cdP:new Float32Array(N),veg:new Uint8Array(N),climState:null,climLog:[]});
  s.landC=landCarbon();
  // the reference climate: today's orbit and pre-industrial air over today's natural vegetation. Changes through time are
  // measured against this, so the reference and every later run see land albedo the same way (forests darker than open land)
  vegPass();
  if(!w.climRef&&w.clim)w.climRef=climModel(w.eHi,{g:w.clim.g,albLand:landAlbedo(),init:w.clim.Tlast,state:w.clim.state});
  climUpdate();
}
function orbitFor(y){return WD.isEarth?orbitAt(y):orbitAt(y-(S.orb0||0))}
// the cell of the climate model's grid (half the 100 km grid's resolution) holding a unit's home cell
function climCell(w,i){const x=w.hx?w.hx[i]:w.cxA[i],y=w.hy?w.hy[i]:w.cyA[i];return Math.floor(y/2)*CW+Math.floor(x/2)}
function climAdd(w,i,v,a,n){if(!w.gcS){const j=climCell(w,i);a[j]+=v;n[j]+=1;return}
  const S_=w.gcS,A=w.gcA,Wt=w.gcW,ar=w.area[i];for(let q=S_[i];q<S_[i+1];q++){const c=A[q],j=Math.floor(((c/W)|0)/2)*CW+Math.floor((c%W)/2),x=ar*Wt[q];a[j]+=v*x;n[j]+=x}}
function landAlbedo(){
  // coarse land albedo from vegetation and land use: cleared forest and fields are brighter than forest
  const s=S,w=WD,a=new Float32Array(CN),n=new Float32Array(CN);
  // (the grid: each cell in its climate cell; provinces spread over the climate cells they cover, by area: a desert province
  // of a dozen cells is not all put in the climate cell of its middle)
  for(const i of w.landIdx){const b=VEG[s.veg[i]];let al=b?b[3]:CLM.albL;
    const f0=w.forest0[i];if(f0>0.2&&s.forest[i]<f0)al+=(0.31-al)*(1-s.forest[i]/f0)*(al<0.31?1:0);climAdd(w,i,al,a,n)}
  for(let j=0;j<CN;j++)a[j]=n[j]?a[j]/n[j]:CLM.albL;return a;
}
// coarse rain-recycling factor from vegetation: deserts return little of their rain to the air, forests much.
// Not used yet: the model's African rain belt shifts north instead of widening, so the feedback amplifies Sahel drying.
function landRecyc(){const s=S,w=WD,a=new Float32Array(CN),n=new Float32Array(CN);
  for(const i of w.landIdx){const b=VEG[s.veg[i]];climAdd(w,i,b&&b[5]!=null?b[5]:1,a,n)}
  for(let j=0;j<CN;j++)a[j]=n[j]?a[j]/n[j]:1;return a}
function climUpdate(){drain(climUpdateG())}
function* climUpdateG(){if(typeof process!=="undefined"&&process.env&&process.env.NOCLIM){S.climY=S.year;S.climCo2=S.co2;return}
  const s=S,w=WD,R0=w.climRef||w.clim;if(!R0)return;
  const dA=-0.036*(Math.sqrt(s.ch4)-Math.sqrt(700));
  const R=yield* climModelG(w.eHi,{g:R0.g,orb:orbitFor(s.year),co2:s.co2,dA,albLand:landAlbedo(),init:(s.climR||R0).Tlast,state:(s.climR||R0).state});
  s.climR=R;s.climY=s.year;s.climCo2=s.co2;
  // map the change from the reference run onto the history grid
  let gs=0,gw=0;
  // (worked out on the 100 km grid, then onto the units)
  const gT=w.uid?new Float32Array(NC):s.cdT,gP=w.uid?new Float32Array(NC):s.cdP;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,hx=x*SC+SC/2,hy=y*SC+SC/2;
    gT[i]=climSample(R.Ta,0,hx,hy)-climSample(R0.Ta,0,hx,hy);const dp=climSample(R.Pa,0,hx,hy)-climSample(R0.Pa,0,hx,hy);
    // the coarse model's tropical rain belt is too narrow, so it SHIFTS where the real belt mostly widens; its drying signal is damped
    gP[i]=dp>0?dp:dp*0.4}
  // keep the large-scale signal: the coarse model's local detail is not trusted on top of measured climate
  boxBlur(gT,W,H,3,2,true);boxBlur(gP,W,H,4,2,true);if(w.uid){gridToUnits(w,gT,s.cdT);gridToUnits(w,gP,s.cdP)}
  s.cdP0=Float32Array.from(s.cdP);if(WD.isEarth)for(const i of WD.landIdx)s.cdP[i]+=humidRain(i,s.year);
  if(typeof climateSuit==='function'&&s.pkAv)climateSuit();
  for(let j=0;j<CN;j++){const c=R0.g.cosl[Math.floor(j/CW)];gs+=c*(R.Ta[j]-R0.Ta[j]);gw+=c}
  s.climAnom=gs/gw;
  vegPass();
  s.climLog.push({y:s.year,co2:s.co2,ch4:s.ch4,anom:s.climAnom});
}
function vegPass(){
  const s=S,w=WD,R=s.climR;const s_cdP=s.cdP,s_cdT=s.cdT,s_veg=s.veg,w_Pr=w.Pr,w_T=w.T,w_amp=w.amp,w_cxA=w.cxA,w_cyA=w.cyA,w_dryMonths=w.dryMonths,w_elev=w.elev;
  for(const i of w.landIdx){const T=w_T[i]+s_cdT[i],Pp=Math.max(0.3*w_Pr[i],w_Pr[i]+s_cdP[i]),a=w_amp[i];
    const dry=w.dryMonths?w_dryMonths[i]:R?climSample(R.Dm,0,w_cxA[i]*SC+SC/2,w_cyA[i]*SC+SC/2):3;
    s_veg[i]=vegFor(T,Pp,T+a/2,T-a/2,dry,w_elev[i])}
}
// land carbon in forests (GtC): about 12 kg C per m² of closed forest
function landCarbon(){const s=S,w=WD;let c=0;for(const i of w.landIdx)c+=s.forest[i]*w.area[i]*1.2e-5;return c}
// greenhouse gases follow land use: forest clearing releases CO2 (the oceans take most of it back over centuries);
// rice paddies and herds add methane
function carbonPass(){
  const s=S,w=WD,c=landCarbon(),E=s.landC-c;s.landC=c;
  s.cEx=s.cEx*(1-10/450)+Math.max(-50,E)/2.12*0.45;s.co2=262+Math.max(-8,s.cEx);
  let rice=0,herd=0;for(const i of w.landIdx){const p=s.pop[i];if(p<1)continue;if(s.farm[i]>0.5&&w.rv[i]>0.2&&w.T[i]>18&&w.Pr[i]>900)rice+=p;herd+=p*s.herd[i]*w.sH[i]}
  s.ch4=580+110*(rice+0.4*herd)/1.5e8;
}
