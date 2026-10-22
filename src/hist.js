/* ---------- technology ---------- */
const TECH=[
 {k:'farm',n:'Farming',era:1},
 {k:'herd',n:'Herding',era:1},
 {k:'irrig',n:'Irrigation',era:1,pre:[0]},
 {k:'copper',n:'Bronze',era:2,pre:[0]},
 {k:'horse',n:'Horse riding',era:2,pre:[1]},
 {k:'sail',n:'Seafaring',era:1},
 {k:'writing',n:'Writing',era:2,pre:[0],em:{b:1/2200,pop:3e5,cells:2}},
 {k:'wheel',n:'Wheel and chariot',era:2,pre:[3],em:{b:1/5000,pop:1e6}},
 {k:'iron',n:'Ironworking',era:3,pre:[3],em:{b:1/7000,pop:1e6}},
 {k:'coin',n:'Coinage',era:4,pre:[3],em:{b:1/3600,pop:1e6}},
 {k:'law',n:'Public law and courts',era:3,pre:[32],em:{b:1/2000,pop:2e5,cells:3}},
 {k:'roads',n:'Engineered roads',era:3,pre:[32],em:{b:1/2400,pop:3e5,cells:5}},
 {k:'nav',n:'Navigation',era:4,pre:[5],em:{b:1/3600,pop:5e5,coast:1}},
 {k:'caval',n:'Heavy cavalry',era:5,pre:[4,8,10,9],em:{b:1/5600,pop:3e6,horse:1}},
 {k:'paper',n:'Paper',era:5,pre:[6],em:{b:1/5000,pop:2e6}},
 {k:'crops',n:'Crop rotation',era:4,pre:[0],em:{b:1/4500,pop:6e5,press:1}},
 {k:'gun',n:'Gunpowder',era:6,pre:[8,6],em:{b:1/8000,pop:6e6}},
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
 {k:'records',n:'Accounts and record keeping',era:2,pre:[0],em:{b:1/1000,pop:4e4}},
 {k:'storage',n:'Communal granaries',era:1,pre:[0],em:{b:1/700,pop:2e4}},
 {k:'census',n:'Censuses and land surveys',era:3,pre:[32],em:{b:1/1800,pop:2e5}},
 {k:'post',n:'Messenger relays',era:3,pre:[32],em:{b:1/1800,pop:3e5,cells:5}},
 {k:'office',n:'Salaried public offices',era:3,pre:[32,10],em:{b:1/2200,pop:3e5}},
 {k:'succession',n:'Recognized succession procedures',era:2,pre:[32],em:{b:1/1500,pop:8e4}},
 {k:'charter',n:'Charters and negotiated rights',era:3,pre:[32],em:{b:1/2200,pop:2e5}},
 {k:'canal',n:'Navigable canals',era:4,pre:[2,32],em:{b:1/3500,pop:6e5}},
 {k:'school',n:'Schools for administrators',era:4,pre:[32,36],em:{b:1/2600,pop:5e5}},
];
// positions of the real techniques in the need/energy space (see techFit)
[[0.6,-0.6],[0.2,-0.5],[0.7,0.2],[0.1,0.5],[-0.2,0.4],[0.3,0.1],[-0.4,0],[0,0.5],[0.3,0.7],[-0.6,0.2],[-0.5,-0.1],[-0.4,0.5],[0,0.4],[0.2,0.8],[-0.6,-0.1],[0.7,0.1],[0.2,0.9],[-0.2,0.8],[0.3,-0.3],[0.5,-0.5]].forEach((p,k)=>{if(!TECH[k].pos)TECH[k].pos=p});
const TI={};TECH.forEach((t,k)=>TI[t.k]=k);
const SYNTH0=TECH.findIndex(t=>t.synth);
const ERAS=['Foraging','Neolithic','Bronze Age','Iron Age','Classical','Medieval','Gunpowder age','Age of Sail'];
function eraOf(i){
  const t=S.tk,v=k=>t[k][i]>0.5;
  if(v(17))return 7;if(gunEffect(i)>0.3)return 6;
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
function seedTech(f,c,v,rad){const w=WD;const cx=w.cxA[c],cy=w.cyA[c];
  for(let dy=-rad;dy<=rad;dy++){const y=cy+dy;if(y<0||y>=H)continue;for(let dx=-rad;dx<=rad;dx++){const j=y*W+(cx+dx+W)%W;if(w.land[j])f[j]=Math.max(f[j],v*(dx||dy?0.85:1))}}}
function nearestPeopled(c,maxR,test){
  const w=WD,s=S;let best=-1,bd=1e9;const cx=w.cxA[c],cy=w.cyA[c];
  for(let dy=-maxR;dy<=maxR;dy++){const y=cy+dy;if(y<0||y>=H)continue;for(let dx=-maxR;dx<=maxR;dx++){const j=y*W+(cx+dx+W)%W;
    if(!w.land[j]||s.pop[j]<1||(test&&!test(j)))continue;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=j}}}
  return best;
}
function ring(c,rad,f){const w=WD,cx=w.cxA[c],cy=w.cyA[c];for(let dy=-rad;dy<=rad;dy++){const y=cy+dy;if(y<0||y>=H)continue;for(let dx=-rad;dx<=rad;dx++)f(y*W+(cx+dx+W)%W,dx,dy)}}
function dirWord(dx,dy){const a=Math.atan2(-dy,dx)*180/Math.PI;const k=Math.round(((a+360)%360)/45)%8;return['east','north-east','north','north-west','west','south-west','south','south-east'][k]}
function dxWrap(a,b){let d=WD.cxA[b]-WD.cxA[a];if(d>W/2)d-=W;if(d<-W/2)d+=W;return d}
const EARTH_HEARTHS=[
 {kind:'farm',lat:36.5,lon:40,y:-9000,crop:'wheat and barley',anim:'sheep and goats',grain:1},
 {kind:'farm',lat:30.5,lon:112,y:-7500,crop:'rice',anim:'pigs',grain:1},
 {kind:'farm',lat:35,lon:109,y:-7000,crop:'millet',anim:'pigs and dogs',grain:1},
 {kind:'farm',lat:-6,lon:145,y:-7000,crop:'taro and bananas',anim:'pigs',grain:0},
 {kind:'farm',lat:18,lon:-97,y:-5000,crop:'maize, beans and squash',anim:'turkeys and dogs',grain:1},
 {kind:'farm',lat:-13,lon:-72,y:-5000,crop:'potatoes and quinoa',anim:'llamas and guinea pigs',grain:0.6},
 {kind:'farm',lat:14,lon:2,y:-3000,crop:'sorghum and pearl millet',anim:'cattle',grain:1},
 {kind:'farm',lat:37,lon:-88,y:-2500,crop:'sunflowers and squash',anim:'dogs',grain:0.6},
 {kind:'copper',lat:39,lon:35,y:-4700},
 {kind:'copper',lat:36,lon:104,y:-2600},
 {kind:'copper',lat:-14,lon:-72,y:-1200},
 {kind:'horse',lat:48,lon:50,y:-3700},
 {kind:'sail',lat:37,lon:25,y:-3500},
 {kind:'sail',lat:23.5,lon:120.5,y:-3000},
 {kind:'camel',lat:22,lon:50,y:-1200},
 {kind:'ard',lat:33,lon:44,y:-4300},
];
const EARTH_SEEDS=[[5,25,'afr'],[33,40,'afro'],[48,10,'ie'],[22,78,'indo'],[35,110,'sino'],[5,105,'aus'],[-25,134,'pama'],[60,100,'alt'],[40,-100,'nam'],[-10,-60,'sam']];

function newHistory(hseed){
  const w=WD,r=mulberry32(hashStr('hist:'+hseed+':'+w.seed));
  const tk=TECH.map(()=>new Float32Array(N));
  S={r,seed:hseed,year:P.startYear,start:P.startYear,famN:0,tk,
    pop:new Float32Array(N),K:new Float32Array(N),eth:new Int32Array(N).fill(-1),eth2:new Int32Array(N).fill(-1),mix:new Float32Array(N),mixT:new Uint8Array(N),
    pol:new Int32Array(N),s:new Float32Array(N).fill(0.3),rel:new Int32Array(N).fill(-1),fort:new Float32Array(N),
    fert:new Float32Array(N).fill(1),immune:new Float32Array(N),infect:new Uint8Array(N),ob:new Int32Array(N).fill(-1),
    dist:new Uint16Array(N).fill(65535),taken:new Int32Array(N).fill(-1e9),q:new Int32Array(N),lab:new Int32Array(N),city:new Int32Array(N).fill(-1),
    AG:new Float32Array(AGW*AGH),anom:new Float32Array(N),wm:new Float32Array(N).fill(1),dT:0,dTt:0,gT:0,epoch:null,dry:null,orbM:0,orb0:0,
    eths:[],pols:[null],alive:[],chron:[],outbreaks:[],inf:[],stats:[],hearths:[],figs:[],rels:[],wars:[],activeWars:[],cities:[],migs:[],activeMigs:[],press:new Map(),
    spot:[],famTitle:{},isleName:{},isleBy:{},lmPop:new Int32Array(w.lmCount),fallen:[],darkWatch:[],epochs:[],
    firstTech:new Array(TECH.length).fill(null),lmFound:new Uint8Array(w.lmCount),regionFirst:{},medBest:{share:0,y:null,pol:0},chinaHist:[],medHist:[],farmCheck:null};
  const s=S;
  s.farm=tk[0];s.herd=tk[1];s.irrig=tk[2];s.metal=tk[3];s.horse=tk[4];s.sail=tk[5];s.admin=tk[6];s.wheel=tk[7];s.iron=tk[8];s.coin=tk[9];s.law=tk[10];s.roads=tk[11];s.nav=tk[12];s.caval=tk[13];s.paper=tk[14];s.crops=tk[15];s.gun=tk[16];s.ocean=tk[17];s.camel=tk[18];s.grain=tk[19];s.ard=tk[20];s.plough=tk[21];s.manure=tk[22];s.xcrops=tk[23];s.integ=new Float32Array(N);s.uni=new Float32Array(N);s.uniFam=new Int32Array(N).fill(-1);
  prepEco(w);Object.assign(s,{forest:Float32Array.from(w.forest0),salt:new Float32Array(N),adapt:new Float32Array(N),dp:new Float32Array(N),car:new Float32Array(N),exit:new Float32Array(N),circE:Float32Array.from(w.circ),rp:new Float32Array(N),routes:[],carPairs:new Set(),cropX:new Set(),bfsPar:new Int32Array(N),bfsD:new Int16Array(N),bfsMark:new Int32Array(N),bfsStamp:0});
  for(const i of w.landIdx)s.adapt[i]=w.mal[i]*0.5;
  s.orb0=w.isEarth?null:(r()*23000);
  for(const i of w.coastIdx)s.sail[i]=0.05;
  for(let k=0;k<s.AG.length;k++)s.AG[k]=gauss(r);
  climateStep();computeK();
  const seeds=[],macs=[];
  if(w.isEarth){
    const pool=MACRO_KEYS.slice();for(let i=pool.length-1;i>0;i--){const j=(r()*(i+1))|0;[pool[i],pool[j]]=[pool[j],pool[i]]}
    EARTH_SEEDS.forEach(([la,lo,mac],k)=>{let c=cellAt(la,lo);if(!w.land[c]){for(let kk=1;kk<15&&!w.land[c];kk++)c=cellAt(la,lo+kk*0.9)}if(w.land[c]){seeds.push(c);macs.push(P.shuffleNames?pool[k%pool.length]:mac)}})}
  else{let sep=0.38;
    for(let t=0;t<20000&&seeds.length<P.bands;t++){if(t%4000===3999)sep*=0.7;
      const i=w.landIdx[(r()*w.landIdx.length)|0];if(w.T[i]<4||w.Pr[i]<350||w.lmSize[w.lm[i]]<20)continue;
      if(seeds.every(j=>angDist(i,j)>sep)){seeds.push(i);macs.push(MACRO_KEYS[(seeds.length-1+((r()*MACRO_KEYS.length)|0))%MACRO_KEYS.length])}}}
  const q=s.q;let h=0,t=0;
  seeds.forEach((i,k)=>{const mac=macs[k];s.eth[i]=newEth(-1,-1,makeLang(r,pick(r,MACROS[mac]),mac));q[t++]=i});
  while(h<t){const i=q[h++];
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]&&s.eth[j]<0&&w.T[j]>-9){s.eth[j]=s.eth[i];q[t++]=j}}
    if(w.coast[i]){ring(i,3,j=>{if(w.land[j]&&s.eth[j]<0&&w.T[j]>-9){s.eth[j]=s.eth[i];q[t++]=j}})}
  }
  for(const i of w.landIdx)if(s.eth[i]>=0){s.pop[i]=s.K[i]*0.55;s.lmFound[w.lm[i]]=1}
  for(let k=0;k<10;k++)ethPass(false);
  if(w.isEarth&&P.hearthMode!=='random'){
    for(const hh of EARTH_HEARTHS){if(hh.y<s.start)continue;s.hearths.push(Object.assign({},hh,{cell:cellAt(hh.lat,hh.lon),year:hh.y,done:false,fixed:true}))}
  }else{
    const cand=[];for(const i of w.landIdx)if(w.sF[i]>0.45&&w.lmSize[w.lm[i]]>40)cand.push(i);
    const hs=[];
    for(let t2=0;t2<4000&&hs.length<P.hearths&&cand.length;t2++){const i=cand[(r()*cand.length)|0];if(r()>w.sF[i]*(0.6+0.4*w.rv[i]))continue;if(hs.every(j=>angDist(i,j)>0.32))hs.push(i)}
    hs.forEach((c,k)=>s.hearths.push({kind:'farm',cell:c,year:s.start+(k===0?200+r()*900:400+r()*5500)|0,done:false}));
    s.hearths.push({kind:'sail',year:s.start+1500+r()*3000|0,done:false});
    s.hearths.push({kind:'copper',year:s.start+3800+r()*1800|0,done:false});
    s.hearths.push({kind:'horse',year:s.start+4000+r()*1500|0,done:false});
    s.hearths.push({kind:'camel',year:s.start+6500+r()*1500|0,done:false});
    s.hearths.push({kind:'ard',year:s.start+4300+r()*1500|0,done:false});
  }
  chron('nature',`Foragers of ${seeds.length} unrelated stocks people the habitable world.`,seeds[0]);
  initSociety();recordStats();
}

/* ---------- climate through time ---------- */
const EPOCH_KINDS=[
 {k:'cold',w:0.5,amp:[-1.3,-0.7],dur:[150,380],start:'A long cold epoch sets in: growing seasons shorten and the northern edge of farming retreats.',end:'The long cold epoch eases.'},
 {k:'warm',w:0.3,amp:[0.5,0.9],dur:[150,320],start:'A warm epoch begins: harvests improve in the north and farming creeps toward the poles.',end:'The warm epoch fades.'},
 {k:'dry',w:0.2,amp:[-1.6,-1.0],dur:[80,250],start:'A great drought settles over the',end:'Rain returns to the'},
];
function climateStep(){
  const s=S,r=s.r,y=s.year;
  s.gT+=-s.gT/150+0.35*Math.sqrt(2/150)*gauss(r);
  if(s.epoch){const e=s.epoch;
    if(y>=e.end){const K=EPOCH_KINDS.find(k=>k.k===e.k);chron('nature',e.k==='dry'?`${K.end} ${e.where} after ${y-e.start} years.`:`${K.end}`,e.cell);e.done=true;s.epoch=null}}
  else if(r()<0.0007*P.epochs){
    let u=r(),K=EPOCH_KINDS[0];for(const k of EPOCH_KINDS){if(u<k.w){K=k;break}u-=k.w}
    const amp=K.amp[0]+r()*(K.amp[1]-K.amp[0]),dur=Math.round(K.dur[0]+r()*(K.dur[1]-K.dur[0]));
    const e={k:K.k,start:y,end:y+dur,amp,cell:-1,where:''};
    if(K.k==='dry'){const L=WD.landIdx;let c=-1;for(let t=0;t<200;t++){const i=L[(r()*L.length)|0];if(s.pop[i]>1000&&WD.T[i]>5){c=i;break}}
      if(c<0)return;e.cell=c;e.cx=WD.cxA[c];e.cy=WD.cyA[c];e.rad=10+r()*12;e.where=regionName(c);
      chron('nature',`${K.start} ${e.where}; it will last for generations.`,c)}
    else chron('nature',K.start,-1);
    s.epoch=e;s.epochs.push(e);
  }
  // orbital forcing of the subtropical monsoon
  if(WD.isEarth)s.orbM=1/(1+Math.exp((y+3300)/320));
  else s.orbM=0.5+0.5*Math.cos(2*Math.PI*(y-s.orb0)/23000);
}
function epochTemp(){const e=S.epoch;if(!e||e.k==='dry')return 0;const y=S.year,ramp=Math.min(1,(y-e.start)/40,(e.end-y)/40);return e.amp*Math.max(0,ramp)}
function regionName(c){const la=WD.lat[c]*180/Math.PI,lo=(WD.cxA[c]+0.5)/W*360-180;
  const e=S.eth[c]>=0?S.eths[S.eth[c]]:null;return e?`lands of the ${e.name}`:`region near ${Math.abs(la).toFixed(0)}°${la>=0?'N':'S'}, ${Math.abs(lo).toFixed(0)}°${lo>=0?'E':'W'}`}

/* ---------- yearly processes ---------- */
function weather(){
  const s=S,w=WD,g=s.AG,phi=P.climPersist,sd=Math.sqrt(1-phi*phi),r=s.r,cv=0.28*P.climVar;
  for(let k=0;k<g.length;k++)g[k]=phi*g[k]+sd*gauss(r);
  const L=w.landIdx,wi=w.wi,wf=w.wf,e=s.epoch&&s.epoch.k==='dry'?s.epoch:null;
  let ramp=0;if(e)ramp=Math.max(0,Math.min(1,(s.year-e.start)/20,(e.end-s.year)/20));
  for(let k=0;k<L.length;k++){const i=L[k],fx=wf[i*2],fyy=wf[i*2+1];
    let a=(g[wi[i*4]]*(1-fx)+g[wi[i*4+1]]*fx)*(1-fyy)+(g[wi[i*4+2]]*(1-fx)+g[wi[i*4+3]]*fx)*fyy;
    if(e){let dx=Math.abs(w.cxA[i]-e.cx);if(dx>W/2)dx=W-dx;const d2=(dx*dx+(w.cyA[i]-e.cy)**2)/(e.rad*e.rad);if(d2<1)a+=e.amp*ramp*(1-d2)}
    s.anom[i]=a;s.wm[i]=Math.exp(cv*a)}
}
function computeK(){
  const s=S,w=WD,L=w.landIdx,dT=s.dT+s.gT+epochTemp(),orb=s.orbM;
  for(let k=0;k<L.length;k++){
    const i=L[k],T=w.T[i]+dT;
    if(T<-9){s.K[i]=1;continue}
    const wm=s.wm[i],mz=w.monZone[i],Pn=w.Pr[i]*wm+orb*mz*420,ar=w.area[i],rv=w.rv[i];
    const ag=s.cropAccess?farmSuit(i):w.sF[i];
    const npp=Math.min(3000/(1+Math.exp(1.315-0.119*(T+w.amp[i]*0.15))),3000*(1-Math.exp(-0.000664*Pn)));
    const range=s.rangeStock?0.4+0.6*s.rangeStock[i]:1;
    const Kf=(ar*0.1*npp/1000*(1+0.5*w.coast[i]+0.4*rv)+ar*0.12*w.coast[i]*(0.5+0.5*s.sail[i]))*range;
    const dry=clamp(wm,0.3,1.6);
    let sh=w.sH[i];if(mz>0)sh=Math.max(sh,orb*mz*0.7);if(w.desert[i])sh=Math.max(sh,0.25*s.camel[i]);
    const Kh=ar*1.6*sh*s.herd[i]*Math.min(1.3,s.cropAccess?pastureCondition(i):dry)*(1+0.2*s.horse[i])*(1-s.rp[i])*range;
    const irr=s.irrig[i]*rv;
    const season=w.rainSeasonality&&Number.isFinite(w.rainSeasonality[i])?w.rainSeasonality[i]:0.3;
    const wf=(1+(Math.min(dry,1.25)-1)*(1-0.75*irr))*(1-0.12*season*(1-0.8*irr));
    const T_=s.tk,hv=w.heavy[i],lc=w.leach[i];
    let Kfa=ar*3.5*ag*s.farm[i]*s.fert[i]*wf*(1+0.8*s.metal[i]+0.9*s.iron[i]*(1-0.4*lc)+1.0*s.crops[i]+0.7*s.admin[i]+0.55*s.ard[i]*(s.traction?s.traction[i]:0)*(1-0.6*hv)+0.7*s.plough[i]*hv*(s.traction?s.traction[i]:0)+0.6*s.manure[i]+s.xcrops[i]*(0.25+0.8*lc+0.5*w.trop[i]+0.3*(1-w.sF[i]))+0.4*T_[26][i]*Math.max(lc,s.forest[i])+0.15*T_[28][i]*w.coast[i])*(1+rv*(0.25+2.2*s.irrig[i]));
    Kfa*=1+(s.orchards?0.25*s.orchards[i]*(w.coastalCrop?w.coastalCrop[i]:0):0);
    Kfa*=(0.45+0.55*(1-s.forest[i]))*(1-0.6*s.salt[i])*(1-0.5*w.oncho[i]);
    if(w.T[i]<12)Kfa*=clamp(1+0.18*dT,0.4,1.35);
    // heavy, wet temperate forest soils: hard to clear and work until iron axes and ploughs
    if(hv>0)Kfa*=1-0.7*hv*(1-Math.max(s.plough[i],0.4*s.iron[i]));
    s.K[i]=Math.max(1,Kf,Kh+0.4*Kf,Kfa+0.3*Kh+0.2*Kf)*(1-0.5*w.mal[i]*(1-s.adapt[i])*(1-0.5*s.tk[29][i]));
  }
}
function growth(){
  const s=S,w=WD,L=w.landIdx,g=P.growth,dg=P.degrade;
  for(let k=0;k<L.length;k++){const i=L[k];let p=s.pop[i];if(p<=0)continue;const K=s.K[i];
    p=populationStep(i,p,K,g);
    if(p<0.5){p=0;s.eth[i]=-1;s.eth2[i]=-1;s.rel[i]=-1}
    s.pop[i]=p;
    const pr=p/K,fm=s.farm[i];
    if(fm>0.3&&w.sF[i]>0.1){const silt=clamp(w.rv[i]*1.5,0,0.8),lc=w.leach[i];
      if(pr>0.7)s.fert[i]=Math.max(0.3,s.fert[i]-dg*0.0012*(pr-0.7)*fm*(1+1.5*lc)*(1-0.45*s.crops[i])*(1-0.5*s.manure[i])*(1-silt));
      s.fert[i]+=0.0025*(1-s.fert[i])*(1+0.6*s.herd[i]*w.sH[i]+(pr<0.5?1+lc:0));
      if(s.forest[i]<0.15&&w.rough[i]>0.3)s.fert[i]=Math.max(0.3,s.fert[i]-0.0003*w.rough[i]*fm);
      const ir=s.irrig[i]*Math.min(1,w.rv[i]*2);
      if(ir>0.1&&w.Pr[i]<550&&pr>0.5)s.salt[i]=Math.min(0.85,s.salt[i]+0.0004*ir*Math.min(1.2,pr)*(1-0.9*s.tk[30][i]));
      if(s.salt[i]>0&&(pr<0.3||s.tk[30][i]>0.5))s.salt[i]=Math.max(0,s.salt[i]-0.0004-0.002*s.tk[30][i])}
    const f0=w.forest0[i];
    if(f0>0){let fo=s.forest[i];
      // farmers clear forest when they need land; with stone and bronze tools it is slow work, iron axes speed it
      if(fm>0.2&&pr>0.6)fo-=0.0015*fm*Math.min(1,(pr-0.6)*2.5)*fo*(1+2.5*s.iron[i]+0.5*s.metal[i]);
      else fo+=0.004*(f0-fo)*(1-0.6*s.herd[i]*Math.min(1,pr*3));
      s.forest[i]=clamp(fo,0,f0)}
    if(s.rp[i]>0)s.rp[i]*=0.96;
    if(w.mal[i]>0)s.adapt[i]+=0.0012*w.mal[i]*Math.max(0,0.55-s.adapt[i]);
  }
}
function mixIn(j,e,share){const s=S;if(e<0||e===s.eth[j])return;if(s.eth2[j]===e)s.mix[j]=Math.min(1,s.mix[j]+share);else if(s.eth2[j]<0||share>s.mix[j]){s.eth2[j]=e;s.mix[j]=share;s.mixT[j]=0}}
function migrate(){householdMigration()}
function virginSoil(tgt,src){diseaseJourney(src,tgt,travelDays(src,tgt,true),60,'sea')}
function seaHop(){
  const s=S,w=WD,r=s.r,C=w.coastIdx;if(!C.length)return;
  const ex=C.length*0.004*P.seafaring;let tries=Math.floor(ex)+(r()<ex%1?1:0);
  while(tries-->0){
    const i=C[(r()*C.length)|0];if(s.pop[i]<30)continue;
    const sl=s.sail[i];if(r()>0.04+0.5*sl)continue;
    const ang=r()*6.2832,dx=Math.cos(ang),dy=Math.sin(ang)*0.8;
    const range=2+Math.floor(sl*28)+((r()*3)|0)+(s.nav[i]>0.5?14:0)+(s.ocean[i]>0.5?70:0);
    let x=w.cxA[i]+0.5,y=w.cyA[i]+0.5,seen=0,tgt=-1;
    for(let st=0;st<range*1.5;st++){x+=dx*0.7;y+=dy*0.7;if(y<0||y>=H)break;
      const j=Math.floor(y)*W+((Math.floor(x)%W)+W)%W;if(!w.land[j]){seen=1;continue}if(seen){tgt=j;break}}
    if(tgt<0||w.T[tgt]<-9)continue;
    if(s.pop[tgt]<1){
      const sponsor=s.pol[i]?s.pols[s.pol[i]]:null;const backed=sponsor&&sponsor.kind==='state'&&frontierReady(sponsor,i,tgt)?sponsor:null;
      if(!foundSettlement(i,tgt,Math.min((backed?1000:60)+s.pop[i]*0.02,s.K[tgt]*0.5+1),backed))continue;
      for(const f of s.tk)f[tgt]=Math.max(f[tgt],f[i]*0.8);s.admin[tgt]*=0.3;
      const lm=w.lm[tgt];
      if(!s.lmFound[lm]){s.lmFound[lm]=1;if(w.lmSize[lm]>=4){const e=s.eths[s.eth[i]];chron('migration',`Seafarers of the ${e.name} reach an unpeopled ${w.lmSize[lm]>60?'land':'island'}.`,tgt,[RE(e)])}}
    }else if(s.eth[tgt]!==s.eth[i]){
      transferCrops(i,tgt,0.1);for(const k of [0,1,2,3,7,19,20,32,33])s.tk[k][tgt]+=Math.max(0,s.tk[k][i]-s.tk[k][tgt])*0.015;
      diseaseJourney(i,tgt,travelDays(i,tgt,true),Math.min(80,s.pop[i]*0.001),'sea');const owner=s.pol[i]?s.pols[s.pol[i]]:null;if(owner)owner.knownPorts.add(tgt);colonyContact(tgt,owner);
      if(s.ocean[i]>0.5&&w.lm[tgt]!==w.lm[i]){
        cropExchange(i,tgt);mixIn(tgt,s.eth[i],0.05);
        const e1=s.eths[s.eth[i]],e2=s.eths[s.eth[tgt]],key=e1.fam+':'+e2.fam;
        if(!s.contacts)s.contacts=new Set();
        if(e1.fam!==e2.fam&&!s.contacts.has(key)&&w.lmSize[w.lm[tgt]]>200){s.contacts.add(key);chron('migration',`Ocean-going ships of the ${e1.name} make landfall among the ${e2.name}, across the open ocean.`,tgt,[RE(e1),RE(e2)]);spot(`Ships of the ${e1.name} reach the ${e2.name} across the ocean`,tgt,[RE(e1),RE(e2)])}
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
  const s=S,w=WD,L=w.landIdx,T=s.tk,kd=0.12*P.techDiff,loss=0.006*P.techLoss,r=s.r,rels=s.rels,pols=s.pols;
  const suit=[w.sF,w.sH,w.rv,null,w.sH];
  const known=TECH.map((t,k)=>s.firstTech[k]||k===5?1:0);
  const NT=T.length,pop=s.pop,pol=s.pol,INST=TECH.map((t,k)=>k===6||k===9||k===10||k===11||k===14||k>=32);
  for(let kk=Math.floor(a0*L.length),ke=Math.floor(b0*L.length);kk<ke;kk++){
    const i=L[kk];if(s.pop[i]<1)continue;
    let conn=s.pop[i];const pi=s.pol[i],po=pi?pols[pi]:null;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0)conn+=s.pop[j]}
    const rvb=(0.35+0.65*s.node[i]+0.25*w.rv[i])*(1+0.3*s.paper[i]+0.2*s.roads[i]*s.infrastructure[i]);
    const ls0=w.ls[i],ls1=s.sail[i]>0.3?w.ls[i+1]:ls0;
    const dark=po?po.cult<0.1:true;
    const ct=[1,1,1,1],pg=1+0.4*T[31][i];for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0)continue;ct[d]=Math.min(1,0.08+0.25*Math.min(s.node[i],s.node[j])+Math.min(0.5,Math.sqrt(s.flow[i]*s.flow[j])/4000)+0.2*(s.car[i]+s.car[j]))*pg}
    let nj0=-1,nj1=-1,nj2=-1,nj3=-1;{const b=i*4;let j=w.nb[b];if(j>=0&&pop[j]>=1)nj0=j;j=w.nb[b+1];if(j>=0&&pop[j]>=1)nj1=j;j=w.nb[b+2];if(j>=0&&pop[j]>=1)nj2=j;j=w.nb[b+3];if(j>=0&&pop[j]>=1)nj3=j}
    const clT=w.cosLat[i],lowC=conn<3000,noFarm=s.farm[i]<0.3&&s.herd[i]<0.3;
    for(let f=0;f<NT;f++){
      if(!known[f])continue;
      const A=T[f];let t=A[i];
      if(t<0.995){
        let m=0,same=0,mc=1,v;
        if(nj0>=0&&(v=A[nj0])>m){m=v;same=pi&&pol[nj0]===pi;mc=ct[0]}
        if(nj1>=0&&(v=A[nj1])>m){m=v;same=pi&&pol[nj1]===pi;mc=ct[1]}
        if(nj2>=0&&(v=A[nj2])>m){m=v;same=pi&&pol[nj2]===pi;mc=ct[2]*clT}
        if(nj3>=0&&(v=A[nj3])>m){m=v;same=pi&&pol[nj3]===pi;mc=ct[3]*clT}
        for(let q=ls0;q<ls1;q++){const j=w.lt[q];if(pop[j]<1)continue;v=A[j]*0.9;if(v>m){m=v;same=0;mc=0.7}}
        if(m>t){let k=kd*rvb*(same?0.8+0.4*(po?po.comm:0):0.65)*Math.min(1,mc);if(f===0||f===1||f===19)k=kd*(same?1:0.8)*Math.max(0.4,mc)*(1+0.4*w.rv[i]);if(f>=3&&f!==5&&f!==18&&noFarm)k*=0.12;const sf=suit[f];if(sf)k*=0.2+sf[i];if(f===5&&!w.coast[i])k*=0.3;if(f===18)k*=0.2+(w.desert[i]||w.sH[i]>0.3?1:0);if(f===19)k*=0.05+0.95*(1-w.trop[i])*(1-w.leach[i]);else if(f===20)k*=w.tsetse[i]?0.03:0.3+0.7*(1-w.heavy[i]);else if(f===21)k*=0.1+w.heavy[i];else if(f===23)k*=0.3*(s.farm[i]>0.5?1:0.2);else if(TECH[f].synth)k*=0.5;t+=k*(m-t)}
        if(INST[f]&&dark&&m<0.5)t*=pi?0.994:0.985;
      }else if(INST[f]&&dark){// saturated cell: only decays if no neighbour still knows it
        let m=0;if(nj0>=0)m=Math.max(m,T[f][nj0]);if(nj1>=0)m=Math.max(m,T[f][nj1]);if(nj2>=0)m=Math.max(m,T[f][nj2]);if(nj3>=0)m=Math.max(m,T[f][nj3]);if(m<0.5)t*=pi?0.994:0.985}
      if(lowC&&t>0)t*=1-loss*(f===0?0.3:1);
      A[i]=t;
    }
    if(!s.firstTech[2]||s.irrig[i]<0.5){if(s.farm[i]>0.6&&w.waterPotential[i]>0.18&&w.Pr[i]<1200&&s.pop[i]/w.area[i]>1.2&&s.organisation[i]>0.25&&s.food[i]>0.04*s.pop[i]&&r()<0.0005*P.invent){seedTech(s.irrig,i,1,1);firstTech(2,i,po)}}
    const ri=s.rel[i];
    if(ri>=0){const R=rels[ri];
      let j=w.nb[i*4+((r()*4)|0)];
      if(ls1>ls0&&r()<0.2)j=w.lt[ls0+((r()*(ls1-ls0))|0)];
      if(j>=0&&s.pop[j]>=1&&s.rel[j]!==ri&&!(R.kind==='ethnic'&&s.eth[j]>=0&&s.eths[s.eth[j]].fam!==R.fam)){
        const qj=s.pol[j],sr=qj?pols[qj].rel:-1;
        let p=0.09*R.miss*P.faith*Math.min(1,0.15+Math.sqrt(s.pop[i]*s.pop[j])/15000+2*s.car[j])*(pi&&qj===pi?1.5:1)*(sr===ri?4:sr>=0?0.25:1)*(s.rel[j]<0?1.3:0.6)*(1+0.5*s.paper[i])*(0.7+0.6*R.cent);
        if(r()<p)s.rel[j]=ri;
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
      seedTech(s.farm,c,1,2);seedTech(s.herd,c,0.6,1);ring(c,2,i=>{if(w.land[i])seedCrop(i,h.cropIndex==null?bestCrop(i):h.cropIndex,0.85)});s.firstTech[0]=s.firstTech[0]||{y,cell:c};s.firstTech[1]=s.firstTech[1]||{y,cell:c};
      let crop=h.crop,anim=h.anim,gr=h.grain;if(!crop){[crop,anim,gr]=cropFor(w.T[c],w.Pr[c],w.rv[c])}
      seedTech(s.grain,c,gr==null?1:gr,2);s.firstTech[19]=s.firstTech[19]||{y,cell:c};
      const e=s.eths[s.eth[c]];chron('ideas',`Among the ${e.name}, people begin to sow ${crop} and keep ${anim}.`,c,[RE(e)]);h.done=true;
    }else{
      if(!h.fixed){let best=-1,bp=0;
        for(let t=0;t<500;t++){const i=w.landIdx[(r()*w.landIdx.length)|0];if(s.pop[i]<1||s.eth[i]<0)continue;
          let ok=false;
          if(h.kind==='copper')ok=s.farm[i]>0.5&&w.rough[i]>0.2;
          else if(h.kind==='horse')ok=w.sH[i]>0.45&&w.sF[i]<0.35&&s.herd[i]>0.2;
          else if(h.kind==='camel')ok=s.herd[i]>0.3&&(w.desert[i]||w.Pr[i]<350);
          else if(h.kind==='ard')ok=s.farm[i]>0.8&&s.herd[i]>0.5&&!w.tsetse[i]&&w.Pr[i]<900;
          else ok=w.coast[i]&&s.pop[i]>200;
          if(ok&&s.pop[i]>bp){bp=s.pop[i];best=i}}
        if(best<0){h.year=y+25;continue}c=best}
      if(s.eth[c]<0){h.year=y+20;continue}
      const e=s.eths[s.eth[c]];
      if(h.kind==='copper'){seedTech(s.metal,c,1,1);chron('ideas',`Smiths among the ${e.name} learn to smelt copper, and later bronze.`,c,[RE(e)]);s.firstTech[3]=s.firstTech[3]||{y,cell:c}}
      else if(h.kind==='horse'){seedTech(s.horse,c,1,1);seedTech(s.herd,c,1,1);chron('ideas',`On the grasslands, the ${e.name} tame and ride the horse.`,c,[RE(e)]);s.firstTech[4]=s.firstTech[4]||{y,cell:c}}
      else if(h.kind==='ard'){seedTech(s.ard,c,1,1);chron('ideas',`Farmers among the ${e.name} yoke oxen to a scratch plough; one family can now till far more land.`,c,[RE(e)]);s.firstTech[20]=s.firstTech[20]||{y,cell:c}}
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
function disease(){epidemicYear()}

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
function tierOf(o){const n=o.cells-(o.wasteN||0),p=o.pop;
  if(o.kind==='horde')return n<6||p<2e4?'Clans':n<25||p<2e5?'Horde':'Confederation';
  const nom=o.nomF>0.5;
  if(n<=4&&(o.cityCount>0||S.urban[o.capital]>2500||o.origin?.type==='local civic'&&S.urban[o.capital]>=500))return 'City-state';
  // a narrow, crowded river kingdom is still a kingdom: size in people counts, not only in land
  if(p<FLOOR.king*P.floor||(n<4&&p<4*FLOOR.king*P.floor))return'Chiefdom';
  if(n<20||(!nom&&(o.bureau||0)<0.2)||p<FLOOR.emp*P.floor)return nom?'Khanate':'Kingdom';
  return nom?'Khaganate':'Empire'}
function fullName(o){const t=o.tier;return t==='Horde'||t==='Clans'?`${o.base} ${t}`:`${t} of ${o.base}`}
function styleOf(o){const e=S.eths[o.core];return e?STYLES[e.lang.style]:STYLES.romance}
function titleOf(o,R){const st=styleOf(o).t,f=R.fem;const fam=S.eths[o.core]?S.eths[o.core].fam:-1;
  switch(o.tier){case'City-state':return o.gov==='Council'?'archon':st.c;case'Chiefdom':case'Clans':return st.c;case'Horde':case'Confederation':case'Khanate':return st.h;
    case'Kingdom':return st.k==='king'&&f?'queen':st.k;
    default:{if(S.famTitle[fam])return S.famTitle[fam].word;return st.e==='emperor'&&f?'empress':st.k==='khan'?'khagan':st.e}}}
function rulerName(o){const R=o.ruler;return`${titleOf(o,R)} ${R.name}${R.epithet?' '+R.epithet:''}`}
function newRuler(L,o){
  const s=S,r=s.r,tri=()=>(r()+r()+r())/3;
  let base=personName(L,r),num=0;
  if(o&&o.rulers.length&&r()<0.4){const famous=o.rulers.filter(x=>x.fig!=null);const pool=famous.length&&r()<0.7?famous:o.rulers;base=pick(r,pool).base||base}
  if(o){o.nameUse=o.nameUse||{};num=(o.nameUse[base]||0)+1;o.nameUse[base]=num}
  const R={base,name:num>1?`${base} ${roman(num)}`:base,fem:r()<0.15,aggr:tri(),comp:tri(),char:tri(),piety:tri(),exc:'',epithet:'',conq:0,since:s.year,mi:0,fig:null};
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
    E:0.02,shock:0,S:0.5,press:0.5,md:0,adm:0,nomF:0,cells:1,pop:s.pop[c],K:1,maxCells:1,maxPop:0,conq:0,alive:true,wet:0,p5:0,famY:-1e9,
    h:P.reach,gate:1,aggrM:1,psi:0,why:null,hist:[],tier:'Chiefdom',full:'',peak:'',from:from?from.id:0,lastBy:0,fK:0,fE:0,lx:0,ly:0,crises:0,
    rel:s.rel[c],allies:[],enemies:new Map(),truce:new Map(),nb:new Map(),over:0,tribs:0,spc:0,era:0,rulers:[],warsF:[],kids:[],
    origin:opt.origin||(from?{type:'rebellion',from:from.id}:{type:'emerged',people:e}),loot:0,cult:0.2,works:[],golds:[],goldStart:0,sample:[],succ:null,fortN:0,cityPop:0,island:false,assimT:0,conqDyn:!!opt.conqDyn,settledY:0,restores:opt.restores||0};
  o.ruler=newRuler(L,o);o.founderR=o.ruler;initInstitutions(o,from);o.tier=tierOf(o);o.full=fullName(o);o.peak=o.full;
  if(from)from.kids.push(id);
  if(from&&from.cplx!=null){o.cplx=from.cplx*0.55;o.ineq=from.ineq*0.85;o.treas=0.2;o.warC=0}
  s.pols.push(o);s.alive.push(id);s.pol[c]=id;s.dist[c]=0;s.returnDist[c]=0;s.supplyDist[c]=0;s.integ[c]=Math.max(s.integ[c],0.7);o.mandate=1;
  // a new state in the heartland of a fallen great power may claim its name
  if(!opt.base&&o.kind==='state'){for(const F of s.fallen){if(s.year-F.died>900||F.restoredBy)continue;
      const fe=s.eths[F.core],ce=s.eths[e];if(!fe||!ce||(fe.fam!==ce.fam&&!(s.uni[c]>0.2&&s.civicPol[c]===(F.legacy||F.id))))continue;
      if(!F.sample.includes(c)&&angDist(c,F.capital)>0.06)continue;
      if(r()<0.5){F.restoredBy=id;o.base=F.base;o.restores=F.id;o.legacy=F.legacy||F.id;o.origin={type:'restoration',from:F.id,people:e};o.full=fullName(o);
        chron('rise',`Claiming the legacy of the fallen ${F.peak}, a new state rises in its old heartland and takes its name.`,c,[['pol',F.id,F.peak]])}
      break}}
  return id;
}
function succession(o){
  const s=S,r=s.r,L=s.eths[o.core]?s.eths[o.core].lang:s.eths[0].lang,Et=etOf(o),old=o.dyn,R0=o.ruler;
  const pU=(0.04+0.2*Math.max(0,o.E/Et-1)+0.3*Math.max(0,0.6-o.mandate)+0.3*Math.max(0,0.5-o.coalition))*(1-0.8*o.succession);
  o.rulers.push({name:R0.name,base:R0.base,epithet:R0.epithet,from:R0.since,to:s.year,conq:R0.conq,fig:R0.fig,dyn:o.dyn});
  if(o.rulers.length>60)o.rulers.shift();
  o.ruler=selectSuccessor(o,L);
  const usurp=r()<pU;
  if(R0.fig!=null){const f=s.figs[R0.fig];f.died=s.year;deed(f,usurp?`Overthrown at ${s.year-R0.birth} by ${o.ruler.name}`:`Died at ${s.year-R0.birth}`);
    const fam=s.eths[o.core]?s.eths[o.core].fam:-1;
    if((f.conq>=80||f.realm>=200)&&fam>=0&&!s.famTitle[fam]&&r()<0.25){
      const w=R0.base.toLowerCase().replace(/[aeiou]+$/,'')+pick(r,['ar','or','an','er','ar']);
      s.famTitle[fam]={word:w,fig:f.id,from:o.id};
      chron('culture',`The name of ${f.name} outlives its bearer: rulers of the ${s.eths[fam].name} family of peoples will style themselves ${w}.`,o.capital,[RF(f),R_(o)])}}
  if(o.cells>=3&&r()<successionExposure(o,R0)){o.shock+=0.35;s.societyCounters.successionFractures++;chron('war',`After the death of ${R0.name}, local rulers and commanders dispute the succession of the ${o.full}.`,o.capital,[R_(o)],'Personal agreements and recent conquests were not secured by accepted succession institutions.');civilWar(o,true);return}
  if(usurp){o.dyn=personName(L,r);o.gen=1;o.shock+=0.3;o.mandate=0.75;
    if(o.cells>=60){const f=figFor(o,o.ruler,'usurper');deed(f,`Seized the throne of the ${o.full}, ending the House of ${old}`,[R_(o)]);
      chron('war',`${o.ruler.name} seizes the throne of the ${o.full}; the House of ${old} falls.`,o.capital,[R_(o),RF(f)])}}
  else o.gen++;
}
function etOf(o){const c=o.capital,s=S;return 0.02*(1+s.admin[c]+0.5*s.coin[c]+0.5*s.law[c])}
const WHY_LABEL={pN:'rule stretched over lands unlike its own',pT:'a government that cost more than it returned',pF:'an empty treasury and mounting debts',pQ:'a widening gulf between the great and the poor',pZ:'too few trained administrators for the realm',pI:'restless, poorly integrated provinces',pM:'a dynasty that had lost its mandate',pP:'population pressing on the land',pE:'too many elites competing for office',pS:'weak cohesion',pX:'an overextended realm',pR:'an inept ruler',sh:'recent famine, plague, invasion or succession strife'};
function topCauses(why){return Object.entries(why).filter(e=>e[1]>0.08).sort((a,b)=>b[1]-a[1]).slice(0,2).map(e=>WHY_LABEL[e[0]])}
function polCells(id){const s=S,out=[];for(const i of WD.landIdx)if(s.pol[i]===id)out.push(i);return out}
function civilWar(o,breakup){
  if(o.kind==='horde'&&breakup){dissolveConfederation(o,'A succession struggle breaks the common command into rival clans.');return}
  const s=S,w=WD,r=s.r,id=o.id,cells=polCells(id);
  if(cells.length<3)return;
  const dd=i=>(s.dist[i]===65535?9999:s.dist[i])*(1.2-s.integ[i])+s.cityIdentity[i]*40*(s.cityHome[i]!==o.id?1:0);
  const ecS=new Map();for(const c of cells)ecS.set(c,1+P.eco*ecoD(c,o));
  cells.sort((a,b)=>dd(b)*ecS.get(b)-dd(a)*ecS.get(a));
  const n=clamp(1+(r()<0.5?1:0)+(cells.length>=80&&r()<0.5?1:0)+Math.floor(cells.length/250)+(breakup?2:0),1,6),top=cells.slice(0,Math.max(1,Math.round(cells.length*0.6))),seeds=[];
  for(let t=0;t<60&&seeds.length<n;t++){const c=pick(r,top);if(c===o.capital)continue;if(seeds.every(q=>angDist(q,c)>0.018))seeds.push(c)}
  if(!seeds.length)return;
  const oldName=o.full,causes=topCauses(o.why||{}),why=breakup?'Local coalitions and commanders reject a disputed succession or a failing center.':causes.length?'Driven by '+causes.join(' and ')+'.':null;
  const lab=s.lab,q=s.q;let h=0,t=0;
  for(const i of cells)lab[i]=-2;
  lab[o.capital]=id;q[t++]=o.capital;
  if(!breakup){const keep=cells.length-top.length;for(let k=cells.length-1;k>=0;k--){const c=cells[k];if(c===o.capital)continue;if(k>=top.length||s.integ[c]>0.8&&r()<0.7){lab[c]=id;q[t++]=c}}}
  const sOK=seeds.filter(c=>lab[c]===-2);if(!sOK.length){for(const i of cells)lab[i]=0;return}
  const ids=sOK.map(c=>{const former=s.cityHome[c]?s.pols[s.cityHome[c]]:null;const restore=former&&former.id!==id&&!former.alive;const nid=newPolity(c,o,{kind:o.kind,base:restore?former.base:undefined,restores:restore?former.id:0,origin:{type:restore?'restoration':'rebellion',from:id,why}});lab[c]=nid;q[t++]=c;return nid});
  while(h<t){const i=q[h++],l=lab[i];for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&lab[j]===-2){lab[j]=l;q[t++]=j}}}
  for(const i of cells){const l=lab[i];if(l>0&&l!==id){s.pol[i]=l;s.s[i]=Math.min(1,s.s[i]+0.12)}s.pop[i]*=0.94;lab[i]=0}
  o.E=0.7*etOf(o);o.shock=0.2;o.crises++;if(o.cplx!=null){o.cplx*=breakup?0.7:0.85;o.ineq=Math.max(0.2,o.ineq*(breakup?0.7:0.88))}
  const rebels=ids.map(k=>s.pols[k]);partitionInstitutions(o,rebels);
  for(const k of ids){const p=s.pols[k];p.rel=s.rel[p.capital]>=0?s.rel[p.capital]:o.rel}
  for(const i of cells){const p=s.pol[i];if(p&&i!==s.pols[p].capital&&s.autonomy[i]>0.85&&s.integ[i]<0.1&&r()<0.15)s.pol[i]=0}
  const big=cells.length>=40;
  const war=declareWar(rebels,[o],`the ${o.base} Civil War`,big,true);
  war.why=why;
  if(big&&!breakup){const names=ids.map(k=>s.pols[k].base);
    const nm=names.length>1?names.slice(0,-1).join(', ')+' and '+names[names.length-1]:names[0];
    chron('war',`Civil war breaks the ${oldName}; ${nm} ${names.length>1?'break':'breaks'} away.`,o.capital,[['pol',o.id,oldName],...ids.map(k=>RB(s.pols[k])),RW(war)],why)}
}
function collapse(o){
  if(o.kind==='horde'){dissolveConfederation(o,'Unpaid contingents and failing protection end the common command.');return}
  const s=S,w=WD;let lost=0;
  for(const i of w.landIdx)if(s.pol[i]===o.id&&s.dist[i]>2&&i!==o.capital){s.pol[i]=0;s.s[i]=0.3;lost++}
  if(o.maxCells>=20&&lost>=5)chron('fall',`The ${o.full} loses its grip; ${lost} provinces fall away into stateless hands.`,o.capital,[R_(o)],'Unpaid services and provincial defections had exhausted its administrative reach.');
}
function milAt(c){const s=S,w=WD,ts=s.mounts?s.mounts[c]:0;return 1+0.4*s.metal[c]*armsAccess(c)+0.3*s.wheel[c]*Math.max(ts,s.traction?s.traction[c]:0)+0.5*s.iron[c]*armsAccess(c)+ts*(s.horse[c]*(0.3+(w.nomad[c]?0.9:0))+0.6*s.caval[c]*(w.nomad[c]?1:0.5))+1.2*gunEffect(c)+0.2*s.admin[c]+0.3*s.camel[c]*w.desert[c]*ts}
function cerealEff(i){return S.grain[i]*(1-0.75*WD.leach[i])*(1-0.65*WD.trop[i])}
function strength(o){return Math.max(1,Math.max(0,(o.army||0)-(o.loanedTroops||0)+(o.foreignFree||0))*(0.4+0.6*(o.payroll==null?1:o.payroll)))}
function power(o){return Math.pow(strength(o)+1,P.scaleExp)*(0.3+o.S)*milAt(o.capital)}
const dd=i=>S.dist[i]>=65534?40:Math.min(60,S.dist[i]*0.5);
function defense(j){return fieldDefense(j,false)}
function displace(j,frac,byPol){return displacedPeople(j,frac,byPol)}
function attack(o,i,j,sea){territorialAttack(o,i,j,sea)}
function raid(o,i,j){territorialRaid(o,i,j)}
function decisive(o,d,war){
  const s=S,r=s.r;const kin=s.eths[d.core]&&s.eths[o.core]&&s.eths[d.core].fam===s.eths[o.core].fam;
  const idn=s.uni[d.capital]>0.3&&hasLegacy(o,d.capital);
  const remaining=polCells(d.id),administration=remaining.reduce((n,i)=>n+Math.max(8,s.pop[i]*0.0006),0),occupation=remaining.reduce((n,i)=>n+occupationNeed(o,o.capital,i),0);
  const annex=o.bureau>0.2&&o.health>0.6&&o.staff>200&&o.staff>o.pop*0.001+administration&&o.occupation>=occupation&&d.cells<o.cells*0.7&&r()<0.35+0.3*(idn?1:0);
  const n=d.cells,old=d.full;
  if(annex){inheritConquest(o,d);for(const i of polCells(d.id)){conquestRecorded(o,i,d.id);s.pol[i]=o.id;s.integ[i]=Math.min(s.integ[i],kin?0.4:0.12);s.dist[i]=Math.min(65534,(s.dist[d.capital]<65535?s.dist[d.capital]:4)+s.dist[i])}
    o.conq+=n;o.ruler.conq+=n;d.lastBy=o.id;
    if(n>=8){chron('war',`The capital of the ${old} falls, and with it the whole realm: the ${o.full} annexes all ${n} provinces.`,o.capital,[['pol',d.id,old],R_(o),RW(war)]);if(n>=25)spot(`The ${o.full} swallows the ${old}`,o.capital,[R_(o)])}}
  else{d.over=o.id;o.tribs++;endWar(war);s.activeWars=s.activeWars.filter(k=>k!==war.id);
    if(n>=8)chron('war',`With its capital taken, the ${old} submits and becomes a vassal of the ${o.full}.`,d.capital,[R_(d),R_(o),RW(war)])}
}
function distBFS(){routeDistances()}
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
    pa.truce.set(d,s.year+25);pd.truce.set(a,s.year+25)}
  const A=s.pols[war.a[0]],D=s.pols[war.d[0]],yrs=s.year-war.start;
  let out;
  if(war.civil){out=A.alive&&D.alive?`${A.base} and the other rebels keep their independence`:A.alive?`the rebels prevail`:`the old regime restores its rule`}
  else if(war.gA>war.gD+2)out=`the ${A.base} side takes ${war.gA-war.gD} provinces`;
  else if(war.gD>war.gA+2)out=`the ${D.base} side turns the tide and takes ${war.gD-war.gA} provinces`;
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
      if(q>id){const [a]=affinity(o,p);if(a<0.15&&r()<0.3){p.allies=p.allies.filter(x=>x!==id);
        if(o.cells>=40&&p.cells>=40)chron('diplomacy',`The alliance between the ${o.full} and the ${p.full} lapses.`,o.capital,[R_(o),R_(p)]);return false}}
      return true});
    for(const aid of o.allies){const ally=pols[aid];if(ally&&ally.id>id)leagueDiplomacy(o,ally)}
    if(o.cells<1)continue;
    for(const [q] of o.nb){if(q<=id)continue;const p=pols[q];if(!p||!p.alive||o.allies.includes(q)||o.enemies.has(q)||p.cells<1)continue;
      if(o.allies.length>=3||p.allies.length>=3)continue;
      let [a,threat]=affinity(o,p);const marriage=r()<0.06&&o.kind==='state'&&p.kind==='state';if(marriage)a+=0.3;
      if(a>0.55&&r()<0.25*P.allyRate){o.allies.push(q);p.allies.push(id);
        if(o.cells>=30&&p.cells>=30){const faith=o.rel>=0&&o.rel===p.rel&&threat&&threat.rel!==o.rel;
          chron('diplomacy',`The ${o.full} and the ${p.full} conclude an alliance${threat?` against the ${threat.full}`:''}${faith?`, brothers in ${s.rels[o.rel].name} against an unbelieving power`:''}${marriage?', sealed by a royal marriage':''}.`,o.capital,threat?[R_(o),R_(p),R_(threat)]:[R_(o),R_(p)])}}}
    if(o.kind==='horde'&&o.cells>=6){for(const [q] of o.nb){const p=pols[q];if(!p||!p.alive||p.kind==='horde'||p.over||o.enemies.has(q)||p.cells<3)continue;
      if(power(o)>1.3*power(p)&&(p.raided||0)>3&&r()<0.15){p.over=id;o.tribs++;if(p.cells>=25)chron('diplomacy',`Worn down by raids, the ${p.full} agrees to pay tribute to the ${o.full}.`,p.capital,[R_(p),R_(o)])}}}
    o.raided=0;
    const y=s.year;if(o.over&&!o.overY)o.overY=y;if(!o.over)o.overY=0;
    // Civic dependencies negotiate integration through civicUnionStep().
    if(o.over){const ov=pols[o.over];if(!ov||!ov.alive||power(o)>power(ov)){if(ov&&ov.alive&&o.cells>=25)chron('diplomacy',`The ${o.full} stops paying tribute to the ${ov.full}.`,o.capital,[R_(o),R_(ov)]);if(ov)ov.tribs=Math.max(0,ov.tribs-1);o.over=0}}
  }
}
/* ---------- faith ---------- */
function foundReligion(o){
  const s=S,r=s.r,cells=polCells(o.id);if(!cells.length)return;
  const c=pick(r,cells),L=langAt(c),e=s.eth[c]>=0?s.eths[s.eth[c]]:null;
  const Rp=newRuler(L,null);Rp.epithet='';Rp.birth=s.year-(25+((r()*15)|0));Rp.death=Rp.birth+55+((r()*25)|0);
  const f=figFor(null,Rp,'prophet');f.pol=o.id;f.eth=s.eth[c];f.title=`Prophet of the ${e?e.name:'people'}`;f.died=Rp.death;
  const G=cap(L.lex.god),F=Rp.base;
  const name=pick(r,[`${G}ism`,`the Way of ${F}`,`the ${G} Covenant`,`the Faith of ${G}`,`${F}ism`,`the ${cap(L.lex.sun)} Path`]);
  const universal=r()<0.65;
  if(s.city[c]<0){s.city[c]=s.cities.length;s.cities.push({name:cityWord(L,r),cell:c,born:s.year,eth:s.eth[c],peak:s.pop[c],holy:true})}
  const R={id:s.rels.length,name,founder:f.id,born:s.year,origin:c,holy:c,pol:o.id,eth:s.eth[c],fam:e?e.fam:-1,kind:universal?'universal':'ethnic',miss:universal?0.35+0.65*r():0.15,cent:universal?0.3+0.4*r():0.1,holder:o.id,rgb:hsl(r()*360,0.55,0.48),parent:-1,kids:[],cells:0,pop:0,peak:0,alive:true,states:[],councils:0};
  s.rels.push(R);f.rel=R.id;
  s.rel[c]=R.id;for(let d=0;d<4;d++){const j=WD.nb[c*4+d];if(j>=0&&s.pop[j]>=1&&s.pol[j]===o.id)s.rel[j]=R.id}
  deed(f,`Began to preach ${name} in the ${o.full}`,[RR(R),R_(o)]);
  chron('faith',`The prophet ${f.name} begins to preach ${name} in the ${o.full}${universal?', a faith open to every people':''}.`,c,[RF(f),RR(R),R_(o)]);
  spot(`The prophet ${f.name} begins to preach ${name}`,c,[RF(f),RR(R)]);
}
function holyName(R){const c=S.city[R.holy];return c>=0?S.cities[c].name:'its holy city'}
function relPass(){
  const s=S,w=WD,E=s.rels,n=E.length;if(!n)return;
  const L=w.landIdx,sx=new Float64Array(n),sy=new Float64Array(n),sz=new Float64Array(n),cnt=new Int32Array(n),pp=new Float64Array(n);
  for(let k=0;k<L.length;k++){const i=L[k],e=s.rel[i];if(e<0||s.pop[i]<1)continue;sx[e]+=w.x3[i];sy[e]+=w.y3[i];sz[e]+=w.z3[i];cnt[e]++;pp[e]+=s.pop[i]}
  for(let e=0;e<n;e++){const R=E[e];R.cells=cnt[e];R.pop=pp[e];if(cnt[e]>R.peak)R.peak=cnt[e];
    if(R.alive&&!cnt[e]){R.alive=false;R.died=s.year;if(R.peak>=30)chron('faith',`The last followers of ${R.name} are gone; at its height it held ${R.peak} provinces.`,R.origin,[RR(R)])}
    if(pp[e]>0){const m=Math.hypot(sx[e],sy[e],sz[e])||1;sx[e]/=m;sy[e]/=m;sz[e]/=m;R.lon=Math.atan2(sy[e],sx[e]);R.la=Math.asin(clamp(sz[e],-1,1))}
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
function pushPressure(e,amount,cell,byPol,fromMig,food,young){refugeePressure(e,amount,cell,byPol,fromMig,food,young)}
function startMigration(o){
  const s=S,w=WD,e=s.eths[o.eth];const n=Math.hypot(o.dx,o.dy)||1;
  const M={id:s.migs.length,eth:o.eth,rel:s.rel[o.cell],name:o.kind==='horde'&&o.pol?o.pol.full:e.name,pop:o.pop,cell:o.cell,dx:o.dx/n,dy:o.dy/n,path:[o.cell],kind:o.kind,start:s.year,steps:0,max:20+((s.r()*25)|0),fails:0,
    food:o.food||0,young:o.young==null?o.pop*0.3:o.young,animals:o.animals||emptyHerd(),groups:[{eth:o.eth,ancestry:s.ancestry[o.cell],pop:o.pop}],blocked:new Map(),experience:o.pol?o.pol.raidSkill:s.raiding[o.cell],ancestry:s.ancestry[o.cell],S:0.75,mil:milAt(o.cell),farm:s.farm[o.cell],herd:s.herd[o.cell],immunity:diseaseHistory(o.cell),settled:[],crops:s.cropAccess.map(f=>f[o.cell]),techs:s.tk.map(f=>f[o.cell]),pol:o.pol?o.pol.id:0,prev:o.prev!=null?o.prev:-1,by:o.by?o.by.id:0,done:false,result:'',broke:[],cause:o.cause||''};
  if(M.kind==='horde'||M.kind==='warband')M.max=60+Math.floor(s.r()*80);
  s.migs.push(M);s.activeMigs.push(M.id);
  const refs=[RM(M),RE(e)];let txt;
  const dir=dirWord(M.dx,M.dy);
  if(o.kind==='horde')txt=`${o.cause==='drought'?'Driven from parched pastures':o.cause==='pressure'?'Pressed by another migrating coalition':o.cause==='blocked frontier'?'Turning away from a defended frontier':'Seeking pasture and richer lands'}, the ${M.name} sets out ${dir}ward, some ${fmtK(M.pop)} strong.`;
  else if(M.prev>=0){const P0=s.migs[M.prev];refs.push(RM(P0));txt=`Fleeing the ${P0.name}, the ${e.name} take to the roads and head ${dir}, ${fmtK(M.pop)} people in all.`}
  else if(o.by){refs.push(R_(o.by));txt=`Driven out by the ${o.by.full}, the ${e.name} take to the roads and head ${dir}, ${fmtK(M.pop)} people in all.`}
  else txt=`The ${e.name} take to the roads and head ${dir}, ${fmtK(M.pop)} people in all.`;
  M.startTxt=txt;M.logged=M.pop>=100000||o.kind==='horde'||M.prev>=0;
  if(M.logged)chron('migration',txt,o.cell,refs);
  if(M.pop>400000)spot(`The ${M.name} ${o.kind==='horde'?'is':'are'} on the move`,o.cell,[RM(M)]);
  return M;
}
function fmtK(n){return n>=1e6?(n/1e6).toFixed(1)+' million':Math.round(n/1000)*1000>=1000?Math.round(n/1000)+' thousand':Math.round(n)+''}
function migStep(M){migrationCampaign(M)}
function disperse(M,why){const s=S;M.done=true;M.end=s.year;M.result=why==='trapped'?'trapped and scattered':'dwindled and scattered';
  if(M.pop>0&&M.cell>=0){const old=s.pop[M.cell];s.pop[M.cell]+=M.pop;s.food[M.cell]+=M.food||0;depositMigrationGroups(M.cell,M,M.pop,old);mixDiseaseHistory(M.cell,M.immunity,M.pop,old);s.young[M.cell]+=M.young||0;putHerd(M.cell,M.animals);M.animals=emptyHerd();M.food=0}
  s.activeMigs=s.activeMigs.filter(k=>k!==M.id);
  if(M.logged&&M.path.length>8)chron('migration',`The ${M.name} ${M.result} after ${s.year-M.start} years of wandering.`,M.cell,[RM(M)])}
function settle(M,j,t){settleMigration(M,j,t)}
function hordeMigration(o,cause){
  const s=S,r=s.r,cells=polCells(o.id);if(!cells.length||s.year-o.lastMigration<15||s.activeMigs.length>=20)return null;
  for(const t of s.militaryContracts)if(!t.done&&t.horde===o.id)returnVeterans(t);
  o.lastMigration=s.year;const groups=[];
  const share=clamp(0.25+0.25*Math.max(o.press-0.6,0)+0.2*Math.max(0,-o.wet),0.25,0.6),animals=emptyHerd();
  let tot=0,food=0,young=0;for(const c of cells){const take=s.pop[c]*share;young+=s.young[c]*share;food+=s.food[c]*share;addHerd(animals,takeHerd(c,share));s.food[c]*=1-share;s.pop[c]-=take;s.young[c]*=1-share;tot+=take;
    const minority=s.eth2[c]>=0?s.mix[c]:0;for(const [eth,part] of [[s.eth[c],1-minority],[s.eth2[c],minority]])if(eth>=0&&part>0){let g=groups.find(g=>g.eth===eth&&g.ancestry===s.ancestry[c]);if(!g){g={eth,ancestry:s.ancestry[c],pop:0};groups.push(g)}g.pop+=take*part}
  }
  food+=budgetPay(o,o.grain*share);o.army*=1-share;o.staff*=1-share;
  const [dx,dy]=chooseMigrationVector(o);o.shock+=0.2;
  const M=startMigration({eth:o.core,pop:tot,food,young,animals,cell:o.capital,dx,dy,kind:'horde',pol:o,cause:cause||(o.wet<-0.4?'drought':o.blockadePressure>0.2?'blocked frontier':'riches')});
  M.groups=groups;M.route=o.plannedRoute||[];M.routeYear=s.year;o.pop=Math.max(0,o.pop-tot);return M;
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
  const s=S,w=WD,r=s.r,y=s.year,pols=s.pols,L=w.landIdx,pol=s.pol,pop=s.pop;
  const sampleNow=y%10===0;
  for(const id of s.alive){const o=pols[id];o.pop=0;o.K=0;o.cells=0;o.sS=0;o.dS=0;o.ad=0;o.nom=0;o.cx=0;o.cy=0;o.yy=0;o.mp=-1;o.mc=-1;o.coastN=0;o.farmN=0;o.fortN=0;o.lmN=0;o.tax=0;o.ig=0;o.wasteN=0;o.plN=0;o.hvN=0;o.n0=0;o.n1=0;o.n2=0;o.n3=0;o.nw=0;o.forP=0;o.netSum=0;o.recentSum=0;o.corridorSum=0;o.responseSum=0;o.supplySum=0;o.cityCount=0;o.clanPops.clear();if(sampleNow)o.sample=[]}
  for(let k=0;k<L.length;k++){const i=L[k],p=pol[i];if(!p)continue;const o=pols[p],pp=pop[i];
    o.pop+=pp;o.K+=s.K[i];o.cells++;o.sS+=s.s[i];const di=dd(i);o.dS+=di;let eD=0;if(pp>=1){o.n0+=pp*w.nT[i];o.n1+=pp*w.nM[i];o.n2+=pp*w.nN[i];o.n3+=pp*w.nD[i];o.nw+=pp;if(o.ni){eD=ecoD(i,o);if(eD>0.8)o.forP+=pp}}o.ad+=s.admin[i];o.ig+=s.integ[i];const pl=s.ard[i]>0.5&&s.traction[i]>0.2;o.tax+=s.levy[i];o.netSum+=s.node[i]*s.infrastructure[i];o.recentSum+=pp*(s.year-s.taken[i]<40?1-s.integ[i]:0);o.corridorSum+=pp*waterTransport(i);o.responseSum+=pp*(dd(i)+(s.returnDist[i]<65534?s.returnDist[i]*0.5:40));o.supplySum+=pp*(s.supplyDist[i]<65534?s.supplyDist[i]*0.5:80);if(s.urban[i]>2500)o.cityCount++;if(o.kind==='horde')o.clanPops.set(s.clan[i],(o.clanPops.get(s.clan[i])||0)+pp);if(pl)o.plN++;if(w.heavy[i]>0.4)o.hvN++;if(isWaste(i,o.kind==='horde'))o.wasteN++;
    if(w.nomad[i])o.nom++;if(w.coast[i])o.coastN++;if(s.farm[i]*farmSuit(i)>0.25&&pp/w.area[i]>2)o.farmN++;if(s.fort[i]>0.5)o.fortN++;
    o.cx+=w.cosLon[i];o.cy+=w.sinLon[i];o.yy+=w.cyA[i];if(pp>o.mp){o.mp=pp;o.mc=i}
    if(sampleNow){if(o.sample.length<24)o.sample.push(i);else if(r()<24/o.cells)o.sample[(r()*24)|0]=i}}
  const next=[];
  for(const id of s.alive){const o=pols[id];
    if(o.cells===0){const heir=pol[o.capital]?pols[pol[o.capital]]:null;if(heir&&heir!==o)inheritConquest(heir,o);else{s.food[o.capital]+=o.grain||0;o.grain=0}o.alive=false;o.died=y;
      for(const [q] of o.enemies){const p=pols[q];if(p)p.enemies.delete(id)}o.enemies.clear();
      for(const q of o.allies){const p=pols[q];if(p)p.allies=p.allies.filter(x=>x!==id)}
      if(o.ruler.fig!=null){const f=s.figs[o.ruler.fig];if(!f.died){f.died=y;deed(f,`Died as the ${o.full} fell`)}}
      const sc=new Map();for(const c of o.sample){const q=pol[c];if(q&&q!==id)sc.set(q,(sc.get(q)||0)+1)}
      o.succ=[...sc.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
      if(o.maxCells>=40){s.fallen.push(o);if(s.fallen.length>60)s.fallen.shift();
        if(s.admin[o.capital]>0.6)s.darkWatch.push({y,id,cells:o.sample.slice()})}
      if(o.departed){}
      else if(o.maxCells>=25){const sn=o.succ.slice(0,3).map(k=>pols[k]).filter(Boolean);
        chron('fall',`The ${o.peak} is extinguished${o.lastBy&&pols[o.lastBy]?` by the ${pols[o.lastBy].full}`:''}. Founded ${fy(o.born)}, it held ${o.maxCells} provinces at its height.${sn.length?` Its lands pass to the ${sn.map(p=>p.full).join(', the ')}.`:''}`,o.capital,[['pol',id,o.peak],...(o.lastBy&&pols[o.lastBy]?[R_(pols[o.lastBy])]:[]),...sn.map(R_)])}
      continue}
    next.push(id);
    if(o.nw>0){const k=1/o.nw,nv=[o.n0*k,o.n1*k,o.n2*k,o.n3*k];o.ni=o.ni?o.ni.map((v,q)=>v*0.8+nv[q]*0.2):nv}o.forS=o.pop>0?o.forP/o.pop:0;
    o.recentShare=o.recentSum/Math.max(1,o.pop);o.corridor=o.corridorSum/Math.max(1,o.pop);o.responseDays=o.responseSum/Math.max(1,o.pop);o.supplyBurden=o.supplySum/Math.max(1,o.pop);o.network=o.netSum/o.cells;o.S=o.sS/o.cells;o.integ=o.ig/o.cells;if(o.mandate==null)o.mandate=1;o.press=o.K>0?o.pop/o.K:1;o.md=o.dS/o.cells;o.adm=o.ad/o.cells;o.nomF=o.nom/o.cells;
    if(pol[o.capital]!==id&&o.mc>=0){s.depot[o.capital]+=o.grain;o.grain=0;o.capital=o.mc;if(s.eth[o.mc]>=0&&!o.conqDyn)o.core=s.eth[o.mc]}
    // Mixed pastoral/agrarian government develops through sustained practice
    // in developmentYear(), rather than a fraction of farmland changing a label.
    o.tier=tierOf(o);o.full=fullName(o);
    if(o.cells>o.maxCells){o.maxCells=o.cells;o.peak=o.full}
    if(o.pop>o.maxPop)o.maxPop=o.pop;
    o.lx=Math.atan2(o.cy,o.cx);o.ly=o.yy/o.cells;
    const c=o.capital;
    o.spc=clamp(0.9*Math.log10(Math.max(o.pop,1e3))-2.7+0.6*Math.log10(o.cells+1)+(o.tier==='Empire'||o.tier==='Khaganate'?1.6:o.tier==='Kingdom'||o.tier==='Khanate'?0.8:0)+s.admin[c]+0.8*s.law[c]+0.6*s.coin[c]+0.5*s.paper[c]+0.5*s.roads[c],0,10);
  }
  s.alive=next;
  // count island cells per state (needs this year's landmass of capital)
  for(let k=0;k<L.length;k++){const i=L[k],p=pol[i];if(p){const o=pols[p];if(w.lm[i]===w.lm[o.capital])o.lmN++}}
  yield;
  const infl=P.leaderInfl;
  for(const id of next){const o=pols[id];if(!o.alive)continue;
    const R=o.ruler,c=o.capital;
    {const lm=w.lm[c],ls=w.lmSize[lm];
    o.island=ls>=4&&ls<=700&&s.lmPop[lm]>0&&o.lmN>=0.8*s.lmPop[lm];
    if(o.island&&s.isleBy[lm]!==id&&o.cells>=4){const first=!s.isleName[lm];if(first)s.isleName[lm]=placeWord(langAt(c),r);s.isleBy[lm]=id;
      if(ls>=10){chron('rise',`The ${o.full} unites the whole island of ${s.isleName[lm]}${first?'':' once more'}.`,c,[R_(o)]);const f=figFor(o,o.ruler,'ruler');deed(f,`Unified the island of ${s.isleName[lm]}`,[R_(o)])}}}
    if(y-R.birth>=R.death){succession(o);if(!o.alive||o.cells===0)continue}
    const Rn=o.ruler,comp=0.5+infl*(Rn.comp-0.5);
    o.aggrM=Math.max(0.12,1+infl*(4*Rn.aggr-2)*0.6);
    const a=s.anom[c];o.wet=o.wet*0.92+a*0.08;
    o.loot*=0.9;
    o.gate=clamp(0.2+0.8*o.health+0.5*Math.min(1,o.grain/Math.max(1,o.pop*0.1))-o.hunger,0.1,1.5);
    o.h=P.reach*(0.65+1.3*(o.comm||0.1)+0.65*o.bureau+0.25*o.central)*(0.5+0.5*o.health)*(0.8+0.4*comp)*(o.kind==='horde'?1.4:1)*(1+0.1*s.tk[24][c]+0.1*s.tk[31][c]);
    const Et=etOf(o);
    o.E=clamp(o.E+0.012*o.E*(1-o.press)*(0.8+0.4*comp)*(0.5+(o.ineq==null?0.5:o.ineq)),0.004,0.12);
    o.shock*=0.92;
    o.mandate=Math.min(1,o.mandate+0.006);
    statecraft(o,c,y);
    if(!o.alive)continue;
    if(o.kind==='state'&&o.pop<FLOOR.chief*P.floor){o.lowY=o.lowY||y;if(y-o.lowY>25){if(o.maxCells>=8)chron('fall',`The ${o.full} dwindles below the numbers needed to sustain a ruler and his household; it dissolves back into villages and kin-groups.`,c,[R_(o)],'Too few people remained to feed a court, an army and their collectors.');for(const i of polCells(id))pol[i]=0;continue}}else o.lowY=0;
    const pP=Math.max(0,o.press-0.85)*3,pE=Math.max(0,o.E/Et-1.15)*1.1,pS=Math.max(0,0.42-o.S)*2.2,pX=Math.max(0,o.md/o.h-0.85)*(s.admin[c]<0.5?2.2:1.0),pR=Math.max(0,0.5-comp)*0.8,pI=Math.max(0,0.45-o.integ)*0.8,pM=Math.max(0,0.5-o.mandate)*1.2,pZ=o.kind==='state'?Math.max(0,(o.pop*(0.0006+0.0015*o.central)+o.cells*20)/Math.max(1,o.staff+o.pop*o.nobles*0.001)-1)*0.2:0;
    const pT=o.pT||0,pF=o.pF||0,pQ=o.pQ||0;const pN=o.kind==='state'?P.eco*0.8*Math.max(0,(o.forS||0)-0.35):0;o.why={pP,pE,pS,pX,pR,pI,pM,pZ,pN,pT,pF,pQ,sh:o.shock};o.psi=pP+pE+pS+pX+pR+pI+pM+pZ+pT+pF+pQ+pN+o.shock;
    const isl=o.island?0.4:1;
    o.civilRisk=institutionalRisk(o);
    if(y-(o.lastCrisis||-1e9)>20){
      if(o.cells>=20&&o.health<0.25&&o.strain>0.5&&r()<o.civilRisk*2){civilWar(o,true);o.lastCrisis=y}
      else if(o.cells>=3&&r()<o.civilRisk){civilWar(o);o.lastCrisis=y}
      else if(o.cells>=2&&o.health<0.18&&o.strain>0.55&&r()<0.02){collapse(o);o.lastCrisis=y}
    }
    if(o.kind==='horde'&&o.cells<=2&&y-o.born>30&&o.hunger>0.25&&o.coalition<0.4&&r()<0.03){dissolveConfederation(o,'The remaining clans can no longer sustain their common leadership.');continue}
    culture(o);
    if(y%5===0){
      if(o.p5&&o.pop<0.8*o.p5&&o.wet<-0.3)o.mandate=Math.max(0,o.mandate-0.25);
      if(o.p5&&o.pop<0.8*o.p5&&o.cells>=15&&o.wet<-0.3&&y-o.famY>60){o.famY=y;o.shock+=0.5;
        chron('famine',`Years of drought bring famine to the ${o.full}; it loses ${Math.round((1-o.pop/o.p5)*100)}% of its people.`,c,[R_(o)])}
      o.p5=o.pop}
    // conquerors fade into the conquered
    if(o.conqDyn&&y%10===0){const ce=s.eth[c];if(ce>=0&&ce!==o.core){o.assimT+=10;if(o.assimT>=90){const old=s.eths[o.core],nw=s.eths[ce];o.core=ce;o.conqDyn=false;
        if(o.cells>=15)chron('people',`Four generations on, the ruling ${old.name} of the ${o.full} have become ${nw.name} in all but name.`,c,[R_(o),RE(old),RE(nw)])}}else o.assimT=0}
    // figures and milestones
    if(Rn.fig!=null){const f=s.figs[Rn.fig];f.conq=Rn.conq;if(o.cells>f.realm)f.realm=o.cells;f.title=`${cap(titleOf(o,Rn))} of the ${o.full}`}
    while(Rn.mi<4&&Rn.conq>=[25,50,100,200][Rn.mi]&&o.cells>=25){const m=[25,50,100,200][Rn.mi];Rn.mi++;
      const f=figFor(o,Rn,'ruler');f.conq=Rn.conq;
      const bits=[];if(Rn.exc==='aggr')bits.push('a ruler of uncommon ferocity');if(o.wet>0.35)bits.push(o.nomF>0.5||o.kind==='horde'?'with grass made rich by a run of wet years':'during a run of wet years');else if(o.wet<-0.35)bits.push('despite years of drought');
      deed(f,`Had conquered ${m} provinces for the ${o.full}${o.wet>0.35?' during a run of wet years':''}`,[R_(o)]);
      chron('rise',`${cap(rulerName(o))} of the ${o.full}${bits.length?', '+bits.join(', ')+',':''} has conquered ${m} provinces.`,c,[R_(o),RF(f)]);
      if(m>=50)spot(`${cap(rulerName(o))} has conquered ${m} provinces`,c,[RF(f),R_(o)])}
    if(!o.fK&&o.cells>=40){o.fK=1;
      const f=figFor(o,o.founderR,'founder');if(!f.deeds.some(d=>d[1].startsWith('Founded')))deed(f,`Founded the ${o.base} state`,[R_(o)]);
      chron('rise',`The ${o.full} rises under ${rulerName(o)}.`,c,[R_(o)])}
    if(!o.fE&&o.cells>=100){o.fE=1;const f=figFor(o,Rn,'ruler');deed(f,`Ruled the ${o.full} at ${o.cells} provinces`,[R_(o)]);
      chron('rise',`The ${o.base} realm grows to ${o.cells} provinces under ${rulerName(o)}.`,c,[R_(o),RF(f)]);spot(`The ${o.full} reaches ${o.cells} provinces`,c,[R_(o)])}
    // Local urban projects are funded before the annual harvest in civicYear().
    // faith
    const cr=s.rel[c];
    if(cr>=0&&cr!==o.rel&&r()<0.04){o.rel=cr;const Rl=s.rels[cr];if(!Rl.states.includes(id))Rl.states.push(id);
      if(o.cells>=30){const f=figFor(o,Rn,'ruler');deed(f,`Made ${Rl.name} the faith of the realm`,[RR(Rl)]);
        chron('faith',`${cap(rulerName(o))} makes ${Rl.name} the faith of the ${o.full}.`,c,[R_(o),RR(Rl),RF(f)])}}
    if(o.kind==='state'&&s.admin[c]>0.5&&o.cells>=10&&(o.shock>0.25||o.why.pS>0.2)&&r()<P.faith*0.0003)foundReligion(o);
    // nomads on the move
    if(o.kind==='horde'&&o.cells>=6&&o.pop>50000&&s.activeMigs.length<10&&((o.wet<-0.4&&o.press>0.75&&r()<0.02*P.wander)||(o.S>0.55&&Rn.aggr>0.7&&r()<0.006*P.wander)||(((o.failedRaids||0)>3||o.blockadePressure>0.3||s.migrationPressure[o.capital]>0.5)&&r()<0.012*P.wander))){hordeMigration(o)}
    // war
    if(o.cells>=1&&o.enemies.size<3&&r()<P.warRate*0.02*o.aggrM*o.gate){
      let best=0,bw=0,holy=false;const po=power(o),Rl=o.rel>=0?s.rels[o.rel]:null,hp=Rl?pol[Rl.holy]:0;
      for(const [q,b] of o.nb){const t=pols[q];if(!t||!t.alive||o.enemies.has(q)||o.allies.includes(q)||o.over===q||t.over===id||(o.truce.get(q)||-1e9)>y)continue;
        let wt=b*Math.pow(po/(power(t)+1),1.5);
        if(Rl&&t.rel!==o.rel&&t.rel>=0)wt*=1+0.4*P.zeal*Rn.piety;
        const isHoly=Rl&&q===hp&&t.rel!==o.rel&&Rn.piety>0.6;if(isHoly)wt*=1+4*P.zeal;
        bw+=wt;if(wt>0&&r()*bw<wt){best=q;holy=isHoly}}
      if(best){const t=pols[best];const war=declareWar([o],[t],holy?`the Holy War for ${holyName(Rl)}`:null,holy,false,holy);
        const tot=war.a.concat(war.d).reduce((sm,k)=>sm+pols[k].cells,0);
        if(holy||tot>=150||(o.cells>=30&&t.cells>=30)){war.notable=true;
          const al=war.a.slice(1).map(k=>pols[k].base),dl=war.d.slice(1).map(k=>pols[k].base);
          chron('war',`${holy?'Holy war':'War'}: the ${o.full} attacks the ${t.full}${holy?` to win back ${holyName(Rl)}`:''}${al.length?`, joined by ${al.join(' and ')}`:''}${dl.length?`; ${dl.join(' and ')} ${dl.length>1?'come':'comes'} to the defence`:''}.`,t.capital,[R_(o),R_(t),RW(war)])}}}
  }
  // active wars
  const still=[];
  for(const wid of s.activeWars){const war=s.wars[wid];
    const aAlive=war.a.some(k=>pols[k].alive),dAlive=war.d.some(k=>pols[k].alive),yrs=y-war.start;
    const fresh=y-(war.lastGain||war.start);
    if(!aAlive||!dAlive||r()<0.02+(fresh>8?0.08:0)+(yrs>40?0.1:0)){endWar(war);continue}
    still.push(wid)}
  s.activeWars=still;
  if(y%5===0)diplomacy();
  yield;
  // border pass
  for(const id of s.alive){pols[id].nb=new Map();pols[id].borderLoad=0;}
  const asR=P.asabR,asD=P.asabD,wr=P.warRate*0.03,rev=y&1,rels=s.rels,fz=P.fortify;
  for(let kk=0;kk<L.length;kk++){
    const i=L[rev?L.length-1-kk:kk],p=pol[i],pi=pop[i],ei=s.eth[i],ri=s.rel[i];
    const o=p?pols[p]:null,horde=o&&o.kind==='horde';
    let fr=0,cand=-1,nc=0,candSea=false,threat=0,rcand=-1,rn=0;
    const cl=w.cosLat[i];
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j])continue;const q=pol[j],barrier=borderBarrier(i,j),wt=(d<2?1:cl)/(1+barrier*1.8);
      if(q!==p){const ej=s.eth[j];
        if(ej>=0&&ei>=0&&ej!==ei&&ethDist(ei,ej)>0.22)fr=1;
        else if(ri>=0&&s.rel[j]>=0&&s.rel[j]!==ri)fr=1;
        if(o){o.borderLoad+=(d<2?1:cl)/(1+barrier*2);if(q){const t=pols[q];o.nb.set(q,(o.nb.get(q)||0)+1);
            if(t.kind==='horde'||o.enemies.has(q))threat=1;
            if(o.enemies.has(q)||(horde&&pastoralRival(o,t))){nc+=3*wt;if(r()*nc<3*wt)cand=j}
            else if(!horde&&opportunismScore(o,i,j)>0.03){const interest=wt*opportunismScore(o,i,j);nc+=interest;if(r()*nc<interest)cand=j}
            else if(horde&&t.kind==='state'){const interest=wt*raidAttraction(o,i,j);rn+=interest;if(r()*rn<interest)rcand=j}}
          else if(!horde||w.nomad[j]||w.desert[j]||pop[j]>=1){const interest=wt*settlementAppeal(i,j,o);nc+=interest;if(r()*nc<interest)cand=j}}}}
    if(o&&w.coast[i]&&s.sail[i]>0.5){for(let q2=w.ls[i];q2<w.ls[i+1];q2++){const j=w.lt[q2];if(w.ld[q2]>3&&s.nav[i]<0.5)continue;const q=pol[j];if(q===p)continue;
      if(q){o.nb.set(q,(o.nb.get(q)||0)+1);if(o.enemies.has(q)){nc+=1;if(r()*nc<1){cand=j;candSea=true}}}}}
    let sv=s.s[i];
    if(o){const decay=asD*(o.island?0.5:1)*(o.conqDyn?1.6:1);
      sv+=fr?asR*sv*(1-sv)*0.4:-decay*sv*(1-o.trust)*(1-o.bureau)*0.2;sv+=0.003*(o.trust+o.rights-0.8)-0.004*o.hunger;sv+=0.004*infl*(o.ruler.char-0.5);if(ri>=0&&ri===o.rel)sv+=0.0015*(0.5+rels[ri].cent);
      s.s[i]=clamp(sv,0.02,1);
      if(s.integ[i]<1){const fam=ei>=0&&s.eths[ei]&&s.eths[o.core]&&s.eths[ei].fam===s.eths[o.core].fam;s.integ[i]=Math.min(1,s.integ[i]+0.0011/(1+0.8*P.eco*ecoD(i,o))*(0.5+s.admin[i]+s.roads[i]+0.5*s.law[i])*(fam?1.5:0.6)*(0.3+0.7*o.trust*o.payroll)*(1-0.6*s.cityIdentity[i]*(s.cityHome[i]!==o.id?1:0))*(ri>=0&&ri===o.rel?1.2:0.8)*(s.uni[i]>0.3&&s.eths[o.core]&&hasLegacy(o,i)?1.6:1))}
      if(cand>=0&&pol[cand]!==o.id&&s.taken[i]!==y&&(candSea||!opportunisticCampaign(o,i,cand))){const q=pol[cand];
        if(horde&&!q&&!w.nomad[cand]&&!w.desert[cand]&&pop[cand]>=1){if(r()<P.raid*0.02*o.aggrM*o.gate){raid(o,i,cand)}}
        else{const rate=q?wr*2*(1+3*s.circE[cand]):wr*(horde?1:Math.min(1,Math.max(0.1,pop[i]/w.area[i]/6))*(0.3+0.7*Math.min(1,o.press))*(1+gunEffect(i)));if((!q||o.enemies.has(q)||horde)&&r()<rate*o.aggrM*o.gate)attack(o,i,cand,candSea)}}
      if(horde&&rcand>=0&&r()<P.raid*0.025*o.aggrM*o.gate*(1-0.8*wallStrength(rcand)))raid(o,i,rcand);
      const c=o.core;
      if(ei>=0&&c>=0&&ei!==c&&pi>=1)culturalIntegration(i,o);
      if(o.conqDyn&&ei!==c&&pi>=1)mixIn(i,c,0.0006);
      if(o.rel>=0&&ri!==o.rel&&pi>=1){const Rl=rels[o.rel];if(!(Rl.kind==='ethnic'&&ei>=0&&s.eths[ei].fam!==Rl.fam)&&r()<0.003*P.faith*o.S*(Rl.miss+0.3)*(0.7+0.6*Rl.cent))s.rel[i]=o.rel}
      // fortify threatened frontiers if the state is cohesive and can pay
      if(threat&&!horde&&o.S>0.45&&o.gate>0.7&&recordSkill(i)>0.3&&s.fort[i]<1){const due=pi*0.001,paid=budgetAt(o,i,due);s.fort[i]=Math.min(1,s.fort[i]+0.006*fz*(1+s.roads[i])*paid/Math.max(1,due))}
    }else{
      sv+=fr?asR*0.6*sv*(1-sv):(0.3-sv)*0.02;s.s[i]=clamp(sv,0.02,1);
      if(pi>=1){const dens=pi/w.area[i],agr=s.farm[i]*farmSuit(i),past=s.herd[i]*Math.max(w.sH[i],w.desert[i]*s.camel[i]*0.6);
        const localTown=localFoundationReady(i);
        if(localTown||(agr>0.25||(s.node[i]>0.65&&s.urban[i]>4000))&&dens>3.5&&settledStateHabitat(i)&&s.organisation[i]>0.32&&s.food[i]>pi*0.08&&localPop(i)>=FLOOR.chief*3*P.floor/(0.2+0.8*transportSupport(i))){
          if(r()<P.formRate*0.0012*(0.2+1.6*P.circ*s.circE[i])*(0.4+s.s[i])*(1+Math.min(2,dens/15))*Math.min(1,0.05+s.metal[i]+s.admin[i]+s.horse[i]*0.5+Math.min(0.4,Math.max(0,dens-5)/25)+0.15*Math.max(0,s.circE[i]-0.5))*(0.4+0.6*s.organisation[i])*(0.45+0.55*cerealEff(i))){
            const id=newPolity(i,null);s.organisation[i]=Math.max(s.organisation[i],0.4);if(localTown){s.pols[id].origin.type='local civic';s.societyCounters.localTownFoundations++}
            for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]&&!pol[j]&&s.eth[j]===ei&&pop[j]>=1&&r()<0.5){pol[j]=id;s.dist[j]=2}}}}
        else if(past>0.3&&dens>0.5&&(w.nomad[i]||w.desert[i])&&s.organisation[i]>0.15&&pastoralFormationReady(i)){
          if(r()<P.nomad*0.0006*(0.4+s.s[i])*(0.3+s.mounts[i]+s.pack[i])*nomadOpportunity(i)){
            const id=newPolity(i,null,{kind:'horde'});s.societyCounters.confederations++;
            for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]&&!pol[j]&&(w.nomad[j]||w.desert[j])&&pop[j]>=1&&r()<0.6){pol[j]=id;s.dist[j]=2}}}}
      }
    }
    if(s.fort[i]>0){const keep=o&&!horde&&o.S>0.3&&o.press<1;s.fort[i]=keep?s.fort[i]*0.9995:s.fort[i]*0.99;if(s.fort[i]<0.01)s.fort[i]=0}
  }
  // first great walls
  for(const id of s.alive){const o=pols[id];if(o.fortN>=8&&!o.wallLogged&&o.cells>=20){o.wallLogged=1;chron('culture',`The ${o.full} begins to fortify its frontier with a great line of walls and forts.`,o.capital,[R_(o)]);spot(`The ${o.full} builds a great wall`,o.capital,[R_(o)])}}
  for(const id of s.activeMigs.slice())migStep(s.migs[id]);
  if(y%5===0){yield;distBFS();yield;
    for(const i of w.landIdx){const p=s.pol[i];const ob=p?s.pols[p]:null;
      if(ob&&ob.kind==='state'&&ob.cells>=60&&s.integ[i]>0.55&&s.pop[i]>=1&&s.eths[ob.core]&&s.nutrition[i]>0.85&&ob.trust>0.4){const f=ob.legacy||ob.id;s.civicPol[i]=s.civicPol[i]||f;if(s.civicPol[i]!==f){if(s.uni[i]<0.15){s.civicPol[i]=f;s.uniFam[i]=s.eths[ob.core].fam;s.uni[i]=0}else{s.uni[i]*=0.985;continue}}s.uni[i]+=0.0035*(1-s.uni[i])}
      else s.uni[i]*=0.9975}
    if(y%10===0){yield;exitPass(0,0.25);yield;exitPass(0.25,0.5);yield;exitPass(0.5,0.75);yield;exitPass(0.75,1);yield}
    for(const i of w.landIdx){const p=s.pol[i];if(!p)continue;const o=s.pols[p];if(o.kind!=='state'||i===o.capital)continue;const ce=cerealEff(i);
      if(isWaste(i)){let rim=0;for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&s.pol[j]===p&&!isWaste(j))rim++}
        const keep=rim>0||s.fort[i]>0.3||s.car[i]>0.3||(dd(i)<0.35*o.h&&o.S>0.4&&(o.burden||0)<1.1);if(!keep&&r()<0.3){s.pol[i]=0;continue}}
      if(s.autonomy[i]>0.85&&o.health<0.3&&s.integ[i]<0.15&&r()<0.05)s.pol[i]=0}}
}

/* ---------- peoples, mixing, cities, records ---------- */
function ethPass(log){
  const s=S,w=WD,E=s.eths,n=E.length,L=w.landIdx;
  const sx=new Float64Array(n),sy=new Float64Array(n),sz=new Float64Array(n),cnt=new Int32Array(n),pp=new Float64Array(n);
  const add=(e,p,i,province)=>{if(e<0||p<=0)return;sx[e]+=w.x3[i]*p;sy[e]+=w.y3[i]*p;sz[e]+=w.z3[i]*p;pp[e]+=p;if(province)cnt[e]++};
  for(let k=0;k<L.length;k++){const i=L[k],e=s.eth[i];if(e<0||s.pop[i]<1)continue;const minority=s.eth2[i]>=0&&s.eth2[i]!==e?clamp(s.mix[i],0,0.5):0;add(e,s.pop[i]*(1-minority),i,true);if(minority>0)add(s.eth2[i],s.pop[i]*minority,i,true)}
  for(const id of s.activeMigs){const m=s.migs[id];for(const g of m.groups)add(g.eth,g.pop,m.cell,false)}
  for(const e of s.expeditions||[])if(!e.done)add(e.eth,e.pop,e.home,false);
  for(const [e,p] of s.press)add(e,p.p,p.cell,false);
  for(let e=0;e<n;e++){const o=E[e];o.cells=cnt[e];o.pop=pp[e];if(pp[e]>o.peak)o.peak=pp[e];
    if(o.alive&&pp[e]<0.5)o.died=s.year;o.alive=pp[e]>=0.5;
    if(pp[e]>0){const m=Math.hypot(sx[e],sy[e],sz[e])||1;sx[e]/=m;sy[e]/=m;sz[e]/=m;o.lon=Math.atan2(sy[e],sx[e]);o.la=Math.asin(clamp(sz[e],-1,1))}}
  const md=new Float64Array(n).fill(2),far=new Int32Array(n).fill(-1);
  for(let k=0;k<L.length;k++){const i=L[k],e=s.eth[i];if(e<0||s.pop[i]<1)continue;const d=w.x3[i]*sx[e]+w.y3[i]*sy[e]+w.z3[i]*sz[e];if(d<md[e]){md[e]=d;far[e]=i}}
  const thr=P.splitDist*2*Math.PI/W;let made=0;
  for(let e=0;e<n&&made<12;e++){
    if(cnt[e]<6||far[e]<0)continue;
    if(Math.acos(clamp(md[e],-1,1))<=thr||s.r()>0.5)continue;
    const f=far[e],c=newEth(e);made++;
    const queue=[f],seen=new Set(queue);let converted=0;
    for(let at=0;at<queue.length&&converted<Math.max(2,Math.floor(cnt[e]*0.3));at++){const i=queue[at];if(s.eth[i]!==e||s.pop[i]<1)continue;s.eth[i]=c;converted++;
      for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]&&!seen.has(j)&&s.eth[j]===e&&(!s.pol[i]||s.pol[i]===s.pol[j]||w.rough[j]<0.6)){seen.add(j);queue.push(j)}}}
    if(log&&pp[e]>2e6&&cnt[e]>=30){
      const dlat=w.lat[f]-Math.asin(clamp(sz[e],-1,1));let dlon=Math.atan2(w.y3[f],w.x3[f])-Math.atan2(sy[e],sx[e]);
      if(dlon>Math.PI)dlon-=2*Math.PI;if(dlon<-Math.PI)dlon+=2*Math.PI;
      const dir=Math.abs(dlat)>Math.abs(dlon)*Math.cos(w.lat[f])?(dlat>0?'north':'south'):(dlon>0?'east':'west');
      chron('people',`The ${E[e].name} drift apart; in the ${dir} a new people, the ${E[c].name}, emerges.`,f,[RE(E[e]),RE(E[c])]);
    }
  }
  for(const o of E)if(o.alive)for(let k=0;k<6;k++)o.cult[k]=clamp(o.cult[k]+gauss(s.r)*0.015,0,1);
}
function mixPass(){
  const s=S,w=WD,r=s.r,L=w.landIdx;let born=0;
  for(let k=0;k<L.length;k++){const i=L[k],b=s.eth2[i];if(b<0)continue;
    if(s.pop[i]<1||b===s.eth[i]){s.eth2[i]=-1;continue}
    let m=s.mix[i];
    if(m>0.5){const a=s.eth[i];s.eth[i]=b;s.eth2[i]=a;m=1-m;s.mix[i]=m}
    if(m<0.03){s.eth2[i]=-1;s.mixT[i]=0;continue}
    if(m>0.25)s.mixT[i]=Math.min(255,s.mixT[i]+1);else s.mixT[i]=Math.max(0,s.mixT[i]-1);
    if(s.mixT[i]>=15&&born<2&&r()<0.08*P.mixing){
      const A=s.eth[i];if(A<0)continue;
      const nid=newEth(A,b);born++;
      const q=s.q;let h=0,t=0,cnt=0,pp=0;q[t++]=i;s.lab[i]=-7;
      while(h<t&&cnt<60){const c=q[h++];const ea=s.eth[c],eb=s.eth2[c];
        if((ea===A&&eb===b)||(ea===b&&eb===A)){s.eth[c]=nid;s.eth2[c]=-1;s.mix[c]=0;s.mixT[c]=0;cnt++;pp+=s.pop[c];
          for(let d=0;d<4;d++){const j=w.nb[c*4+d];if(j>=0&&w.land[j]&&s.lab[j]!==-7){s.lab[j]=-7;q[t++]=j}}}}
      for(let z=0;z<t;z++)s.lab[q[z]]=0;
      const E=s.eths,ne=E[nid];
      if(cnt<5){for(let z=0;z<t;z++){const c=q[z];if(s.eth[c]===nid){s.eth[c]=A;s.eth2[c]=-1}}ne.alive=false;ne.stillborn=true;continue}
      if(pp>300000){chron('people',`From long mingling of the ${E[A].name} and the ${E[b].name}, a new people emerges: the ${ne.name}.`,i,[RE(E[A]),RE(E[b]),RE(ne)]);spot(`A new people, the ${ne.name}, is born of the ${E[A].name} and ${E[b].name}`,i,[RE(ne)])}
    }
  }
}
function cityPass(){
  const s=S,w=WD;for(const id of s.alive)s.pols[id].cityPop=0;
  for(const i of w.landIdx){const p=s.pop[i],o=s.pol[i]?s.pols[s.pol[i]]:null;
    s.urban[i]=clamp(s.urban[i],0,p);
    if(o)o.cityPop+=s.urban[i];
    if(s.city[i]<0&&s.ruinedCity[i]>=0&&s.cityDamage[i]<0.35&&s.urban[i]>4000){const old=s.cities[s.ruinedCity[i]];old.abandoned=false;old.rebuiltYear=s.year;s.city[i]=s.ruinedCity[i];s.ruinedCity[i]=-1}
    if(s.city[i]<0&&s.urban[i]>(o?.origin?.type==='local civic'&&o.capital===i?800:4000)&&s.organisation[i]>0.25){const L=langAt(i);s.city[i]=s.cities.length;s.cities.push({name:cityWord(L,s.r),cell:i,born:s.year,eth:s.eth[i],peak:s.urban[i]})}
    if(s.city[i]>=0){const c=s.cities[s.city[i]];c.pop=s.urban[i];c.peak=Math.max(c.peak,c.pop)}
  }
}
// shape of an empire at its peak: east-west versus north-south extent in km (Turchin, Adams & Hall 2006)
function polShape(o){const w=WD,cols=new Uint8Array(W);let la0=90,la1=-90,sl=0,n=0;
  for(const i of w.landIdx){if(S.pol[i]!==o.id||isWaste(i))continue;const la=w.lat[i]*57.2958;if(la<la0)la0=la;if(la>la1)la1=la;cols[w.cxA[i]]=1;sl+=la;n++}
  if(n<10)return null;let gap=0,run=0;for(let k=0;k<2*W;k++){if(cols[k%W])run=0;else{run++;if(run>gap)gap=run}}gap=Math.min(gap,W);
  const span=(W-gap+1)*360/W,ml=sl/n,ew=span*111*Math.cos(ml/57.2958),ns=(la1-la0+180/H)*111;return{ew:Math.round(ew),ns:Math.round(ns),n}}
function shapePass(){const s=S;
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='state')continue;const real=o.cells-(o.wasteN||0);if(real<60||real<(o.shapeN||0)*1.08)continue;
    const sh=polShape(o);if(!sh)continue;o.shapeN=real;o.shape=sh;if(!o.inShapes){o.inShapes=1;s.shapes.push(o.id)}}}
function regionPass(){
  const s=S,w=WD;
  if(s.year%50===0){if(!s.shapes)s.shapes=[];shapePass()}
  s.lmPop.fill(0);for(const i of w.landIdx)if(s.pop[i]>=1)s.lmPop[w.lm[i]]++;
  // dark ages: has writing been forgotten where a literate great power fell?
  s.darkWatch=s.darkWatch.filter(d=>{if(s.year-d.y<100)return true;let a=0;for(const c of d.cells)a+=s.admin[c];a/=Math.max(1,d.cells.length);
    const o=s.pols[d.id];if(a<0.3&&o)chron('culture',`A century after the fall of the ${o.peak}, writing has fallen out of use in most of its old lands.`,o.capital,[['pol',o.id,o.peak]],'With no state to pay scribes and no cities to need them, the skill was not passed on.');return false});
  if(!w.isEarth)return;
  s.socialNow=socialObservations();
  const cnt=new Map();
  // the first kingdom holding a large share of a region's people (not its empty land)
  for(const R of w.regions){if(s.regionFirst[R.k])continue;cnt.clear();let tot=0;for(const i of R.cells){const pp=s.pop[i];tot+=pp;const p=s.pol[i];if(p&&s.pols[p].kind==='state'&&['Kingdom','Empire','Khanate','Khaganate'].includes(s.pols[p].tier))cnt.set(p,(cnt.get(p)||0)+pp)}
    let best=0,bp=0;for(const [p,c] of cnt)if(c>best){best=c;bp=p}
    if(tot>0&&best>=0.3*tot){const o=s.pols[bp];s.regionFirst[R.k]={y:s.year,pol:bp,name:o.full}}}
  const share=cells=>{cnt.clear();for(const i of cells){let p=s.pol[i];if(!p)continue;let wt=1;const o=s.pols[p];if(o.over&&s.pols[o.over]&&s.pols[o.over].alive){p=o.over;wt=0.6}cnt.set(p,(cnt.get(p)||0)+wt)}let best=0,bp=0;for(const [p,c] of cnt)if(c>best){best=c;bp=p}return[cells.length?best/cells.length:0,bp]};
  const [cs,cp]=share(w.chinaCells);s.chinaHist.push([s.year,cs,cp]);
  const [ms,mp]=share(w.medCells);s.medHist.push([s.year,ms,mp]);
  if(ms>s.medBest.share)s.medBest={share:ms,y:s.year,pol:mp,name:mp?s.pols[mp].full:''};
  if(s.year%100===0||s.year>=0&&!s.farmCheck){s.stateNow={y:s.year,res:NOSTATE.map(R=>{let pc=0,sc=0;for(const i of w.landIdx){const la=w.lat[i]*180/Math.PI,lo=(w.cxA[i]+0.5)/W*360-180;if(la<R.box[0]||la>R.box[1]||lo<R.box[2]||lo>R.box[3]||s.pop[i]<1)continue;pc++;if(s.pol[i]&&s.pols[s.pol[i]].kind==='state'&&s.pols[s.pol[i]].tier!=='Chiefdom')sc++}return{n:R.n,share:pc?sc/pc:0,pc}})}}
  if(s.year>=0&&!s.farmCheck||s.year%100===0){const res=NOFARM.map(R=>{let pc=0,fc=0;for(const i of w.landIdx){const la=w.lat[i]*180/Math.PI,lo=(w.cxA[i]+0.5)/W*360-180;if(la<R.box[0]||la>R.box[1]||lo<R.box[2]||lo>R.box[3]||s.pop[i]<1)continue;pc++;if(s.farm[i]>0.5&&w.sF[i]>0.15)fc++}return{n:R.n,share:pc?fc/pc:0}});
    if(s.year>=0&&!s.farmCheck)s.farmCheck={y:s.year,res};s.farmNow={y:s.year,res}}
}
function recordStats(){
  const s=S,w=WD;let tp=0;const eraPop=new Float64Array(ERAS.length);
  for(const i of w.landIdx){const p=s.pop[i];if(p<1)continue;tp+=p;eraPop[eraOf(i)]+=p}
  for(const id of s.activeMigs)tp+=s.migs[id].pop;for(const e of s.expeditions||[])if(!e.done)tp+=e.pop;for(const p of s.press.values())tp+=p.p;
  let np=0,nh=0,big=null;for(const id of s.alive){const o=s.pols[id];if(o.cells>=2||o.tier==='City-state'){if(o.kind==='horde')nh++;else np++}if(!big||o.cells>big.cells)big=o;if(o.cells>=3)o.hist.push(s.year,o.cells)}
  let pe=0;for(const e of s.eths)if(e.alive)pe++;
  let lead=0;for(let k=ERAS.length-1;k>=0;k--)if(eraPop[k]>tp*0.03){lead=k;break}
  s.stats.push({y:s.year,pop:tp,np,nh,big:big?big.full:'',bc:big?big.cells:0,bigId:big?big.id:0,pe,lead,gT:s.gT+epochTemp(),orb:s.orbM,society:societyMetrics(),eraPop:Array.from(eraPop,v=>v/(tp||1))});
}
function step(){for(const _ of stepG());}
// one simulated year, split into slices so the page can stay responsive between them
function* stepG(){
  const s=S;s.year++;
  climateStep();weather();hearthCheck();civicYear();
  if(s.dTt>0){s.dTt--;if(!s.dTt)s.dT=0}
  else if(s.r()<0.0012*P.volcano)volcano();
  agroPass();animalPass();computeK();economyPass();growth();yield;migrate();seaHop();refugeePass();
  if(s.year%3===0){techStep(0,0.34);yield;techStep(0.34,0.67);yield;techStep(0.67,1);yield}
  disease();if(s.year%10===5)poolPass();if(s.year%20===7)caravanPass();yield;
  yield* politicsG();advanceCampaigns();frontierYear();connectionYear();peoplesYear();urbanYear();developmentYear();
  if(s.year%20===0){yield;ethPass(true);yield;relPass()}
  if(s.year%5===0){yield;communityPass()}
  if(s.year%10===0){yield;buildTradeNetwork();recordStats();cityPass();yield;regionPass();yield;mixPass()}
}

/* ================= v0.5: land, ecology, disease, contact, inequality ================= */
// static ecological layers derived from the world once
function prepEco(w){
  if(w.ecoReady)return;
  const forest0=new Float32Array(N),heavy=new Float32Array(N),mal=new Float32Array(N),oncho=new Float32Array(N),circ=new Float32Array(N),good=new Float32Array(N);
  for(const i of w.landIdx){const t=w.T[i],p=w.Pr[i],rv=w.rv[i];
    forest0[i]=w.desert[i]?0:clamp((p-380)/520,0,1)*clamp((t+6)/8,0,1)*(1-0.5*clamp((w.elev[i]-3000)/800,0,1));
    heavy[i]=clamp((p-650)/400,0,1)*clamp((17-t)/5,0,1)*(1-clamp(rv*2,0,0.6));
    mal[i]=w.elev[i]<1500?clamp((t-19)/5,0,1)*clamp((p-650)/700,0,1):0;
    oncho[i]=rv>0.25&&w.rough[i]>0.12?clamp((t-21)/3,0,1)*clamp((p-700)/300,0,1)*clamp((1900-p)/300,0,1):0;
    good[i]=w.sF[i]+0.5*w.rv[i]*(w.sF[i]>0.05?1:0)}
  // environmental circumscription (Carneiro): good land hemmed in by poor land or sea
  const sur=Float32Array.from(good);boxBlur(sur,W,H,7,6,true);
  for(const i of w.landIdx){const own=good[i];if(own<0.15)continue;circ[i]=clamp((1-sur[i]/own)*1.3,0,1)}
  // ecological niche of each province (Turchin, Adams & Hall 2006): climate, moisture, way of life, disease setting
  const nT=new Float32Array(N),nM=new Float32Array(N),nN=new Float32Array(N),nD=new Float32Array(N);
  for(const i of w.landIdx){nT[i]=w.T[i]/8;nM[i]=2*clamp(Math.log(Math.max(1,w.Pr[i])/150)/Math.log(20),0,1);nN[i]=w.nomad[i]?1.2:w.desert[i]?0.8:0;nD[i]=0.8*mal[i]+(w.tsetse[i]?0.5:0)}
  Object.assign(w,{forest0,heavy,mal,oncho,circ,nT,nM,nN,nD,ecoReady:true});
}
// how strongly a place's people are tied to a technique's ecological niche
function techFit(o,k){const p=TECH[k].pos;if(!p||!o.fac)return 1;const dx=p[0]-o.fac[0],dy=p[1]-o.fac[1];return Math.exp(-(dx*dx+dy*dy)/0.6)}
function ecoD(i,o){const v=o.ni;if(!v)return 0;const w=WD,a=w.nT[i]-v[0],b=w.nM[i]-v[1],c=w.nN[i]-v[2],d=w.nD[i]-v[3];return Math.sqrt(a*a+b*b+c*c+d*d)}
// land with nothing a state can tax: empty, or held by foragers with no fields or herds worth the name
function isWaste(i,horde){const s=S,w=WD;if(s.pop[i]<1)return true;if(s.pop[i]/w.area[i]<0.25&&w.sF[i]<0.12)return true;if(s.farm[i]*w.sF[i]>=0.12||s.car[i]>=0.3||s.city[i]>=0)return false;
  const hp=s.herd[i]*Math.max(w.sH[i],w.desert[i]*s.camel[i]*0.6);return horde?hp<0.15:s.K[i]/w.area[i]<2.5}
// Tainter: complexity has rising upkeep; Goldstone: fiscal crisis; Turchin/Scheidel: the wealth pump and its levellers
function statecraft(o,c,y){institutionStep(o,c,y)}
function localPop(i){const w=WD,s=S;let t=s.pop[i];for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0)t+=s.pop[j]}return t*1.8}
// the exit option (Herbst, Scott): open land nearby lets subjects walk away; crowding or barren surroundings trap them (Carneiro)
function exitPass(a0,b0){if(a0==null){a0=0;b0=1}
  const s=S,w=WD,LL=w.landIdx;
  for(let kk=Math.floor(a0*LL.length),ke=Math.floor(b0*LL.length);kk<ke;kk++){const i=LL[kk];if(s.pop[i]<1||w.sF[i]<0.1){s.circE[i]=w.circ[i];continue}
    const cx=w.cxA[i],cy=w.cyA[i];let tot=0,n=0;
    for(let dy=-3;dy<=3;dy++){const yy=cy+dy;if(yy<0||yy>=H)continue;for(let dx=-3;dx<=3;dx++){if(!dx&&!dy)continue;const j=yy*W+(cx+dx+W)%W;n++;if(!w.land[j])continue;
      const q=Math.max(w.sF[j],0.5*w.forest0[j]*(w.T[j]>10?1:0.3),0.4*w.sH[j]),pd=Math.max(0.3,7*q);tot+=q*Math.max(0,1-s.pop[j]/w.area[j]/pd)*(s.pol[j]?0.4:1)}}
    const ex=tot/n,own=w.sF[i]+0.1;s.exit[i]=ex;
    s.circE[i]=clamp(Math.max(w.circ[i],1-1.6*ex/own),0,1)}
}
// disease pools (McNeill, Crosby): dense, connected farming and herding peoples build up crowd diseases and immunity to them
function poolPass(){for(const i of WD.landIdx)S.dp[i]=S.pathogens.slice(0,4).reduce((n,d)=>n+d.recovered[i],0)/4}
// volcanic winters, small and great
function volcano(){
  const s=S,r=s.r,great=r()<0.15;
  s.dT=great?-2.3:-0.8-0.6*r();s.dTt=great?4+((r()*3)|0):1+((r()*2)|0);
  if(!great){chron('nature','A great eruption veils the sun; harvests fail across the cooler lands for several years.');return}
  chron('nature','A colossal eruption darkens the sky: the sun is dim for years, summers fail across the world, and hunger stalks every land.',-1,[],'Volcanic ash and sulphur in the high atmosphere reflect sunlight back to space.');
  spot('A volcanic winter grips the world',-1,[]);
  for(const id of s.alive){const o=s.pols[id];o.mandate=Math.max(0,(o.mandate==null?1:o.mandate)-0.25);o.shock+=0.15}
  // famine weakens bodies: a plague often follows
  if(r()<0.5){const L=WD.landIdx;let best=-1,bd=0;for(let t=0;t<300;t++){const i=L[(r()*L.length)|0];const d=s.pop[i]/WD.area[i]*(1+s.car[i]*3+(s.city[i]>=0?2:0));if(d>bd&&!s.infect[i]){bd=d;best=i}}
    if(best>=0)outbreakAt(1,best,Math.max(10,s.pop[best]*0.003),-1,best,'famine');}

}
// caravan routes across deserts: need camels (or wind wagons), people at both ends, and demand
function caravanPass(){
  const s=S,w=WD,r=s.r,L=w.landIdx,par=s.bfsPar,dist=s.bfsD;
  for(const i of L)if(s.car[i]>0)s.car[i]*=0.82;
  const arid=j=>w.land[j]&&(w.desert[j]||w.Pr[j]<300);
  const srcs=[];
  for(let t=0;t<2500&&srcs.length<14;t++){const i=L[(r()*L.length)|0];if(arid(i)||!s.pol[i]||s.pop[i]/w.area[i]<1.5)continue;
    if(s.camel[i]<0.5&&s.tk[25][i]<0.5)continue;let ok=false;for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&arid(j))ok=true}if(ok)srcs.push(i)}
  const mark=s.bfsMark||(s.bfsMark=new Int32Array(N));
  for(const a of srcs){
    const st=++s.bfsStamp;
    const q=[a];mark[a]=st;par[a]=-1;dist[a]=0;let hit=-1;
    for(let h=0;h<q.length&&hit<0;h++){const i=q[h];if(dist[i]>70)break;
      for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||mark[j]===st)continue;
        if(arid(j)){if(q.length<6000){mark[j]=st;par[j]=i;dist[j]=dist[i]+1;q.push(j)}}
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
  const ca=cropFor(w.T[a],w.Pr[a],w.rv[a])[0],cb=cropFor(w.T[b],w.Pr[b],w.rv[b])[0],ea=s.eths[s.eth[a]],eb=s.eths[s.eth[b]];
  chron('ideas',`Ships carry ${ca} to the ${eb?eb.name:'far shore'}, and bring ${cb===ca?'other crops':cb} home to the ${ea?ea.name:'homeland'}. Over the coming centuries the new crops will let poor and marginal soils feed far more people.`,b,[ea?RE(ea):null,eb?RE(eb):null].filter(Boolean));
  spot('New crops cross the ocean',b,[]);
}
