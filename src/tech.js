"use strict";
/* ================= TECHNOLOGY MATRIX =================
   Every technique sits in a grid: what it is FOR (rows) × what natural phenomenon it HARNESSES (columns), at a tier.
   A new technique combines what a society already masters in its row and its column (W. Brian Arthur, The Nature of
   Technology, 2009). Which cells a society reaches depends on its environment and resources, the traditions its people
   carry, and its situation (need, energy, war, disease); its size and wealth set the speed (Henrich's "collective brain").
   Real techniques keep their own calibrated rules; the empty cells hold might-have-been techniques that are created
   only when some society actually invents one, named in the inventors' own language. */
const TROWS=[['food','Food'],['move','Movement'],['info','Information'],['power','Power'],['mat','Materials'],['health','Health'],['war','War'],['order','Organization']];
const TCOLS=[['muscle','Muscle and beasts','Beasts'],['water','Water','Water'],['wind','Wind','Wind'],['fire','Fire and minerals','Fire'],['life','Living things','Life'],['signs','Signs and symbols','Signs'],['mech','Mechanism','Mech']];
const NTR=TROWS.length,NTC=TCOLS.length,NTT=4;
const TIER_NAMES=['','early','developed','advanced','high'];
// placement of the built-in techniques: [row, column, tier]
const TPOS={farm:[0,4,1],grain:[0,4,1],herd:[0,0,1],irrig:[0,1,1],copper:[4,3,1],horse:[1,0,1],sail:[1,2,1],camel:[1,0,2],
  writing:[2,5,2],wheel:[1,6,2],iron:[4,3,2],ard:[0,0,2],manure:[0,4,2],pigeon:[2,4,2],law:[7,5,2],
  coin:[7,3,3],roads:[1,6,3],nav:[1,1,3],caval:[6,0,3],paper:[2,4,3],crops:[0,4,3],plough:[0,0,3],kitesig:[2,2,3],windcart:[1,2,3],
  fungal:[0,4,3],ledger:[7,6,3],tidemill:[3,1,3],watermill:[3,1,3],feverbark:[5,4,3],saltflush:[0,1,3],
  gun:[6,3,4],ocean:[1,2,4],xcrops:[0,4,4],windmill:[3,2,4]};
// generic descriptions for cells that our own history left empty or barely used
const TGEN=[
  ['ox-drawn seed drills','water-lifting wheels','wind-pumped terraces','kiln-dried grain stores','cultivated forest gardens','planting almanacs','geared threshing machines'],
  ['pack-beast relays','river barge networks','land sails','hot-air lanterns','bred riding beasts','route maps and waymarks','rail-guided carts'],
  ['runner relays','water-clock signals','signal kites','beacon chains','courier birds','shorthand scripts','mechanical message drums'],
  ['beast-driven treadmills','water wheels','wind engines','steam toys put to work','oil and tallow lamps for night work','work calendars','gear trains'],
  ['quarrying levers','water-powered hammers','wind-blown furnaces','refined alloys','bamboo and timber composites','standard weights and measures','turning lathes'],
  ['bone-setting','baths and clean water','wind-cooled sickhouses','distilled medicines','herbal pharmacopoeias','sickness records','surgical instruments'],
  ['war beasts','fire ships','war kites','incendiary weapons','poisoned arrows','signal codes for armies','siege engines'],
  ['labour levies','canal administration','weather lore and calendars','mints and assays','forest and herd reserves','archives','clockwork tallies'],
];
const AGE_NAMES=['an age of beasts','an age of waterworks','an age of sails and kites','a furnace age','a green age','an age of letters','a clockwork age'];
const ROW_EFFECT=['more food','cheaper travel and longer reach','longer administrative reach','more food and revenue','stronger armies and tools','fewer deaths in epidemics','stronger armies','cheaper government'];
let TECH_BASE=0;
function techMatrixInit(){
  // reset any generated techniques from a previous history
  if(!TECH_BASE){TECH_BASE=TECH.length}
  TECH.length=TECH_BASE;for(const k of Object.keys(TI))delete TI[k];TECH.forEach((t,k)=>{TI[t.k]=k;const p=TPOS[t.k];if(p){t.row=p[0];t.col=p[1];t.tier=p[2]}});
  const s=S;s.genByRow=Array.from({length:NTR},()=>[]);s.genSlots=new Map();s.ages=[];s.ageCol=[];s.matrixLog=[];
  prepTechEnv(WD);
  for(const e of s.eths)if(!e.trad)e.trad=new Float32Array(NTC).fill(0.15);
}
// what the land itself offers each column (static), averaged later over a state's provinces
function prepTechEnv(w){
  if(w.techEnv)return;const env=Array.from({length:NTC},()=>new Float32Array(N));let wind=null;
  if(w.clim&&w.clim.wind){wind=new Float32Array(CN);for(const Wm of w.clim.wind)if(Wm)for(let j=0;j<CN;j++)wind[j]+=Math.hypot(Wm.U[j],Wm.V[j])/12}
  for(const i of w.landIdx){const p=w.Pr[i];
    env[0][i]=clamp(w.sH[i]*0.9+0.2*(w.nomad[i]?1:0),0,1);
    env[1][i]=clamp(w.rv[i]*1.4+0.35*w.coast[i]+clamp((p-400)/1600,0,0.4),0,1);
    env[2][i]=wind?climSample(wind,0,w.cxA[i]*SC+SC/2,w.cyA[i]*SC+SC/2):0.5;
    env[3][i]=clamp(w.rough[i]*1.6+0.25*w.forest0[i]+(w.elev[i]>800?0.15:0),0,1);
    env[4][i]=clamp(0.45*w.forest0[i]+0.45*w.sF[i]+0.25*clamp((p-300)/1500,0,1),0,1)}
  // wind: model wind speed relative to the windiest tenth of the land, more where coasts, steppe or desert leave it unbroken
  const ws=Array.from(w.landIdx,i=>env[2][i]).sort((a,b)=>a-b),q9=ws[Math.floor(ws.length*0.9)]||1;
  for(const i of w.landIdx)env[2][i]=clamp(env[2][i]/q9*(w.coast[i]||w.nomad[i]||w.desert[i]?1:0.6),0,1);
  w.techEnv=env;
}
// how much a state's land, resources and know-how afford each column
function techAfford(o){
  const s=S,w=WD,env=w.techEnv,a=new Float32Array(NTC),cells=o.sample&&o.sample.length?o.sample:[o.capital],c=o.capital;
  for(const i of cells)for(let k=0;k<5;k++)a[k]+=env[k][i];
  for(let k=0;k<5;k++)a[k]/=cells.length;
  a[0]=clamp(a[0]+0.3*s.herd[c]+0.25*s.horse[c]+0.2*s.camel[c],0,1);
  a[3]=clamp(a[3]+0.25*s.metal[c]+0.2*s.iron[c],0,1);
  a[5]=clamp(0.6*s.admin[c]+0.3*s.paper[c]+0.2*s.law[c],0,1);
  let urb=0;for(const i of cells)if(s.city[i]>=0)urb++;a[6]=clamp(0.3*s.wheel[c]+0.3*s.iron[c]+urb/cells.length*1.5,0,1);
  return a;
}
// highest tier mastered in each row and column, from what the capital knows
function techLevels(c){
  const s=S,rl=new Int8Array(NTR),cl=new Int8Array(NTC),own=new Int8Array(NTR*NTC),known=[];
  for(let k=0;k<TECH.length;k++){const t=TECH[k];if(t.row==null||s.tk[k][c]<0.5)continue;known.push(t);if(t.tier>rl[t.row])rl[t.row]=t.tier;if(t.tier>cl[t.col])cl[t.col]=t.tier;const q=t.row*NTC+t.col;if(t.tier>own[q])own[q]=t.tier}
  // highest tier in a row or column reached OUTSIDE a given cell: a technique must combine knowledge from elsewhere
  const rowEx=(r,co)=>{let m=0;for(const t of known)if(t.row===r&&t.col!==co&&t.tier>m)m=t.tier;return m},colEx=(co,r)=>{let m=0;for(const t of known)if(t.col===co&&t.row!==r&&t.tier>m)m=t.tier;return m};
  return{rl,cl,own,rowEx,colEx};
}
// a state's situation pulls some rows forward
function techLean(o,aff){
  const s=S,need=o.fac?o.fac[0]:0,energy=o.fac?o.fac[1]:0,c=o.capital;
  return[0.6+0.6*Math.max(0,need),0.6+0.4*Math.min(1,o.cells/100)+0.3*(o.coastN||0)/Math.max(1,o.cells),0.6+0.5*Math.min(1,o.cells/80),
    0.5+0.6*Math.max(0,energy)+0.4*Math.max(0,-need),0.7+0.3*aff[3],0.6+0.8*Math.min(1,s.dp[c]||0),
    0.5+0.8*Math.min(1,o.enemies.size/2),0.5+0.6*clamp(o.burden||0,0,1.5)];
}
function pullNow(){return WD.isEarth?P.pull:Math.min(P.pull,0.45)}
function synthMult(){const q=1-pullNow();return 0.02+3*q*q}
// relative to the default pull on Earth, for the hand-made possible techniques
function synthRel(){return synthMult()/0.0875}
// every ten years: traditions drift toward what peoples practise; states may invent a might-have-been technique
function matrixPass(){
  const s=S,r=s.r,base=1/90000;
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='state'||o.cells<4||o.pop<3e5)continue;
    const c=o.capital,aff=techAfford(o),e=s.eths[o.core];o.aff=aff;
    if(e){if(!e.trad)e.trad=new Float32Array(NTC).fill(0.15);for(let k=0;k<NTC;k++)e.trad[k]+=0.06*(aff[k]-e.trad[k])}
    const trad=e?e.trad:new Float32Array(NTC).fill(0.15),{rl,cl,own,rowEx,colEx}=techLevels(c),lean=techLean(o,aff);o.lean=lean;o.lvl={rl,cl};
    const speed=P.invent*Math.min(3,Math.sqrt(o.pop/1e6))*(0.7+0.9*(o.cult||0))*synthMult();
    for(let ro=0;ro<NTR;ro++)for(let co=0;co<NTC;co++){
      if(Math.min(rl[ro],cl[co])<1)continue;
      const t=Math.max(2,own[ro*NTC+co]+1);if(t<2||t>NTT||rowEx(ro,co)<t-1||colEx(co,ro)<t-1)continue;{
        const key=ro*100+co*10+t;let real=false,known=false;
        for(let k=0;k<TECH.length;k++){const T=TECH[k];if(T.row===ro&&T.col===co&&T.tier===t){if(!T.gen)real=true;if(s.tk[k][c]>=0.5)known=true}}
        if(known)continue;
        const colW=(0.3+0.7*aff[co])*(0.4+1.2*trad[co]);
        const p=base/t*10*speed*colW*lean[ro]*(real?0.12:1);
        if(r()<p)inventGen(o,ro,co,t,key)}}
    // an alternate age: one column of might-have-been techniques far ahead of the rest
    if(o.age==null){const cnt=new Int8Array(NTC);for(let k=TECH_BASE;k<TECH.length;k++)if(s.tk[k][c]>=0.5)cnt[TECH[k].col]++;
      let best=-1,bv=0,second=0;for(let k=0;k<NTC;k++){if(cnt[k]>bv){second=bv;bv=cnt[k];best=k}else if(cnt[k]>second)second=cnt[k]}
      if(bv>=4&&bv>=2*second&&!(s.year-(s.ageCol[best]??-1e9)<400)){o.age=best;s.ageCol[best]=s.year;s.ages.push({y:s.year,pol:id,col:best});
        chron('ideas',`The ${o.full} enters ${AGE_NAMES[best]}: its craftsmen have taken ${TCOLS[best][1].toLowerCase()} further than any people of our own history.`,c,[R_(o)]);
        spot(`The ${o.full} enters ${AGE_NAMES[best]}`,c,[R_(o)])}}
  }
}
// create (or reinvent) the technique for a grid cell; named in the inventors' language
function inventGen(o,ro,co,t,key){
  const s=S,c=o.capital;let k=s.genSlots.get(key);
  if(k==null){
    const e=s.eths[o.core],L=e?e.lang:langAt(c),local=cap(word(L,s.r,2)),generic=(t>=3?TIER_NAMES[t]+' ':'')+TGEN[ro][co];
    const T={k:'g'+key,n:local,generic,gen:1,synth:1,row:ro,col:co,tier:t,era:Math.min(7,1+t*1.5|0),pre:[],inventor:o.id,people:o.core,
      d:`${cap(generic)}: ${ROW_EFFECT[ro]} (tier ${t}).`};
    k=TECH.length;TECH.push(T);TI[T.k]=k;s.tk.push(new Float32Array(N));s.firstTech.push(null);s.genSlots.set(key,k);s.genByRow[ro].push(k);
  }
  seedTech(s.tk[k],c,1,1);
  const T=TECH[k];
  if(!s.firstTech[k]){s.firstTech[k]={y:s.year,cell:c,pol:o.id,eth:s.eth[c]};
    chron('ideas',`Craftsmen of the ${o.full} devise the ${T.n} (${T.generic}), a path our own history never took.`,c,[R_(o)]);
    s.matrixLog.push({y:s.year,k,pol:o.id})}
}
// summed strength of the generated techniques of one row known in a province
function genAt(row,i){const s=S;if(!s.genByRow)return 0;let v=0;for(const k of s.genByRow[row])v+=(s.tk[k][i]||0)*TECH[k].tier;return v}
// how far this world's set of known techniques has drifted from our own (0 = same mix, 1 = entirely different)
function divergence(){const s=S;let real=0,gen=0;for(let k=0;k<TECH.length;k++){if(!s.firstTech[k])continue;if(TECH[k].synth)gen++;else real++}return gen/(gen+real||1)}
