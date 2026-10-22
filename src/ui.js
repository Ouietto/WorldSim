"use strict";
/* ================= INTERFACE ================= */
const $=id=>document.getElementById(id);
const fmtN=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+'M':n>=1e3?Math.round(n/1e3)+'k':Math.round(n)+'';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TYPES={rise:['Rise','#c08a2a'],war:['War','#b2452c'],fall:['Fall','#6e5a8c'],diplomacy:['Diplomacy','#4f7f6a'],faith:['Faith','#b0729a'],migration:['Migrations','#a0703a'],culture:['Culture','#4f78a8'],ideas:['Ideas','#3f8a5c'],plague:['Plague','#8a2f4a'],famine:['Famine','#9a7b45'],people:['Peoples','#3d7a99'],nature:['Nature & climate','#6f7d84']};
const MODES=[['political','States'],['alliances','Alliances'],['peoples','Peoples'],['mixing','Mixing'],['unity','Identity'],['loyalty','Loyalty'],['food','Food reserves'],['institutions','Local organization'],['trade','Trade network'],['niche','Home ground'],['soil','Soil'],['forest','Forest'],['inequality','Inequality'],['circ','Exit option'],['religion','Religion'],['knowledge','Knowledge'],['era','Era'],['density','Population'],['capacity','Capacity'],['asabiya','Asabiya'],['disease','Disease'],['weather','Weather'],['climate','Climate check'],['terrain','Terrain']];
const SPEEDS=[[5,'5'],[25,'25'],[100,'100'],[400,'400'],[1e9,'Max']];
const ERA_COL=[[120,128,130],[118,150,86],[196,140,64],[150,96,72],[178,74,58],[122,84,150],[64,96,150],[40,130,140]];
const GROUP_COL=[[40,140,70],[222,190,120],[206,170,90],[110,170,110],[90,120,170],[200,215,225]];
const ui={running:false,speed:2,mode:'political',page:null,stack:[],z:1,ox:0,oy:0,bs:1,filters:new Set(Object.keys(TYPES)),q:'',lastChronKey:'',dirty:true,lastRender:0,lastSide:0,pausedAtEnd:false,pane:'chron',know:new Set(),figFilter:'all',fq:'',plagueSort:'deaths',climView:'mismatch',src:'earth',ready:false,lastSpot:0,toastT:0,ringCell:-1,ringT:0,follow:false,cities:'major',cityNames:true,nomads:'near',nomadLastSeen:new Map(),visibleNomads:new Set()};
let EARTH=null,IMPORTED=null,baseCv=null,compCv=document.createElement('canvas'),ovCv=document.createElement('canvas');
compCv.width=HW;compCv.height=HH;ovCv.width=W;ovCv.height=H;
const ovCtx=ovCv.getContext('2d'),ovImg=ovCtx.createImageData(W,H),compCtx=compCv.getContext('2d');
const mapCv=$('map'),mapCtx=mapCv.getContext('2d'),chartCv=$('chart'),chartCtx=chartCv.getContext('2d');
const cssVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let DISPLAY_FONT='serif';

/* ---------- assets ---------- */
async function inflateB64(b64){
  const bin=atob(b64),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  const buf=await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
  return new Uint8Array(buf);
}

/* ---------- base painting ---------- */
const BCOL=[[0,0,0],[234,239,240],[170,175,158],[104,124,98],[121,145,96],[174,178,121],[196,186,137],[216,199,160],[188,177,112],[84,126,79]];
function paintBase(){
  const w=WD,c=document.createElement('canvas');c.width=HW;c.height=HH;const ctx=c.getContext('2d'),img=ctx.createImageData(HW,HH),d=img.data,e=w.eHi;
  for(let y=0;y<HH;y++)for(let x=0;x<HW;x++){
    const i=y*HW+x,v=e[i],xl=y*HW+(x+HW-1)%HW,yu=y>0?i-HW:i;
    const sh=clamp(1+((e[xl]-v)*0.0011+(e[yu]-v)*0.0011)*(v>0?1:0.2),0.6,1.3);
    let R,G,B;
    if(v<=0){const t=clamp(-v/5500,0,1);R=94-62*t;G=142-80*t;B=162-72*t;if(v>-200){R+=18;G+=14;B+=8}}
    else{const b=biomeOf(w.tHi[i],w.pHi[i]);[R,G,B]=BCOL[b];
      if(v>2200&&b!==1){const t=clamp((v-2200)/2600,0,1);R+=(158-R)*t;G+=(150-G)*t;B+=(140-B)*t}
      if(v>4600&&w.tHi[i]<2){R=G=B=232}}
    d[i*4]=R*sh;d[i*4+1]=G*sh;d[i*4+2]=B*sh;d[i*4+3]=255;
  }
  ctx.putImageData(img,0,0);
  ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1;ctx.beginPath();
  for(let l=-60;l<=60;l+=30){const yy=(90-l)/180*HH;ctx.moveTo(0,yy);ctx.lineTo(HW,yy)}
  for(let l=-150;l<=180;l+=30){const xx=(l+180)/360*HW;ctx.moveTo(xx,0);ctx.lineTo(xx,HH)}ctx.stroke();
  ctx.strokeStyle='rgba(48,96,124,.85)';ctx.lineCap='round';
  for(const i of w.landIdx){if(w.rv[i]<0.3)continue;const j=w.down[i];if(j<0)continue;
    const x1=(w.cxA[i]+0.5)*SC,y1=(w.cyA[i]+0.5)*SC,x2=(w.cxA[j]+0.5)*SC,y2=(w.cyA[j]+0.5)*SC;
    if(Math.abs(x2-x1)>HW/2)continue;
    ctx.lineWidth=0.4+(w.rv[i]-0.3)*3.2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  baseCv=c;
}

/* ---------- overlay ---------- */
const RAMP=[[48,18,59],[70,107,227],[40,187,236],[50,241,152],[164,252,60],[237,208,58],[251,128,34],[200,40,20]];
function ramp(t){t=clamp(t,0,1)*(RAMP.length-1);const k=Math.min(RAMP.length-2,Math.floor(t)),f=t-k,a=RAMP[k],b=RAMP[k+1];return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]}
function rampCss(){return'linear-gradient(90deg,'+RAMP.map((c,k)=>`rgb(${c}) ${Math.round(k/(RAMP.length-1)*100)}%`).join(',')+')'}
function blocs(){
  const s=S,par=new Map(),find=x=>{while(par.get(x)!==x){par.set(x,par.get(par.get(x)));x=par.get(x)}return x};
  for(const id of s.alive)par.set(id,id);
  for(const id of s.alive)for(const q of s.pols[id].allies)if(par.has(q)){const a=find(id),b=find(q);if(a!==b)par.set(a,b)}
  const size=new Map(),lead=new Map();
  for(const id of s.alive){const r=find(id),o=s.pols[id];size.set(r,(size.get(r)||0)+1);const L=lead.get(r);if(!L||o.cells>s.pols[L].cells)lead.set(r,id)}
  const col=new Map();
  for(const id of s.alive){const r=find(id),o=s.pols[id];
    if(size.get(r)>1)col.set(id,[s.pols[lead.get(r)].rgb,175]);
    else col.set(id,[o.rgb.map(v=>v*0.55+150*0.45),90])}
  for(const id of s.alive){const o=s.pols[id];if(o.over&&col.has(o.over)){const [c]=col.get(o.over);col.set(id,[c.map(v=>v*0.6+255*0.4),150])}}
  return col;
}
function polityOnMap(o){return !o||o.kind!=='horde'||!['political','alliances'].includes(ui.mode)||ui.visibleNomads.has(o.id)||ui.page?.t==='pol'&&ui.page.id===o.id}
function refreshNomadVisibility(){
  if(ui.nomadHistory!==S){ui.nomadHistory=S;ui.nomadLastSeen=new Map()}
  ui.visibleNomads=confederationVisibility(ui.nomads,ui.nomadLastSeen);
}
function buildOverlay(){
  const s=S,w=WD,d=ovImg.data,m=ui.mode;refreshNomadVisibility();d.fill(0);
  const bc=m==='alliances'?blocs():null,know=[...ui.know].map(k=>TI[k]);
  const g=w.grade;
  if(m!=='terrain')for(const i of w.landIdx){
    let c=null,a=0;const p=s.pop[i];
    switch(m){
      case'food':if(p>=1){c=ramp(Math.min(1,s.food[i]/p/1.5));a=190}break;
      case'institutions':if(p>=1){c=ramp(s.organisation[i]);a=190}break;
      case'trade':if(p>=1){c=ramp(Math.min(1,s.node[i]*0.5+s.flow[i]/Math.max(1,p)*3));a=s.node[i]>0.2?210:65}break;
      case'political':if(s.pol[i]&&polityOnMap(s.pols[s.pol[i]])){const o=s.pols[s.pol[i]];c=o.rgb;a=o.kind==='horde'?70:isWaste(i)?62:158}break;
      case'soil':if((w.sF[i]>0.08&&s.farm[i]>0.3&&p>=1)||s.salt[i]>0.02){if(s.salt[i]>0.08){c=[235,235,225];a=60+190*Math.min(1,s.salt[i]*1.5)}else{c=ramp(clamp((s.fert[i]-0.3)/0.7,0,1));a=60+140*Math.min(1,w.sF[i]*2)}}break;
      case'forest':if(w.forest0[i]>0.05){const f=s.forest[i],lost=w.forest0[i]-f;if(lost>0.2&&f<0.25){c=[196,120,60];a=60+150*lost}else{c=[34,110,52];a=40+200*f}}break;
      case'inequality':if(s.pol[i]){const o=s.pols[s.pol[i]];if(o.kind==='state'&&o.ineq!=null){c=ramp(clamp((o.ineq-0.15)/0.75,0,1));a=isWaste(i)?60:190}}break;
      case'circ':if(p>=1&&w.sF[i]>0.1){c=ramp(s.circE[i]);a=180}break;
      case'unity':if(s.uni[i]>0.05&&s.uniFam[i]>=0){const hh=(s.civicPol[i]*137.5)%360,k=Math.min(1,s.uni[i]*1.3);const f=x=>{const q=(x+hh/30)%12;return 255*(0.55-0.4*Math.max(-1,Math.min(q-3,9-q,1)))};c=[f(0),f(8),f(4)];a=40+190*k}break;
      case'niche':if(s.pol[i]&&s.pols[s.pol[i]].kind==='state'&&s.pop[i]>=1){c=ramp(Math.min(1,ecoD(i,s.pols[s.pol[i]])/1.4));a=190}break;
      case'loyalty':if(s.pol[i]&&s.pols[s.pol[i]].kind==='state'){c=ramp(s.integ[i]);a=190}break;
      case'mixing':if(p>=1&&s.eth[i]>=0){if(s.eth2[i]>=0){c=ramp(0.35+s.mix[i]*1.3);a=210}else{c=[150,150,140];a=40}}break;
      case'alliances':if(s.pol[i]&&polityOnMap(s.pols[s.pol[i]])){const v=bc.get(s.pol[i]);if(v){c=v[0];a=s.pols[s.pol[i]].kind==='horde'?Math.min(70,v[1]):v[1]}}break;
      case'peoples':if(p>=1&&s.eth[i]>=0){c=s.eths[s.eth[i]].rgb;a=178}break;
      case'religion':if(p>=1){if(s.rel[i]>=0){c=s.rels[s.rel[i]].rgb;a=185}else{c=[150,150,140];a=45}}break;
      case'knowledge':if(p>=1){
        if(know.length){let n=0;for(const k of know)if(s.tk[k][i]>0.5)n++;if(n){c=n===know.length?[230,170,60]:[120,150,190];a=n===know.length?200:110}}
        else{let n=0;for(const f of s.tk)if(f[i]>0.5)n++;c=ramp(n/TECH.length);a=190}}break;
      case'era':if(p>=1){c=ERA_COL[eraOf(i)];a=190}break;
      case'density':if(p>=1){c=ramp((Math.log10(p/w.area[i])+2)/4);a=205}break;
      case'capacity':c=ramp((Math.log10(s.K[i]/w.area[i])+2)/4);a=200;break;
      case'asabiya':if(p>=1){c=ramp(s.s[i]);a=200}break;
      case'disease':if(s.infect[i]){c=[220,40,40];a=230}else if(p>=1&&s.immune[i]>0.05){c=[60,120,200];a=40+170*s.immune[i]}break;
      case'weather':{const v=s.anom[i];c=v>0?[30,150,150]:[170,110,40];a=Math.min(220,Math.abs(v)*120)}break;
      case'climate':
        if(ui.climView==='mismatch'&&g){const k=g.code[i];if(k){c=[[0,0,0],[90,170,110],[200,120,50],[60,120,210],[150,110,210],[230,90,70]][k];a=k===1?110:210}}
        else if(ui.climView==='observed'&&w.kgGrid){const gg=kgGroup(w.kgGrid[i]);if(gg>=0){c=GROUP_COL[gg];a=200}}
        else{const gg=simGroup(w.rawT[i],w.rawP[i],w.rawA[i]);c=GROUP_COL[gg];a=200}
        break;
    }
    if(c){const o=i*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=a}
  }
  ovCtx.putImageData(ovImg,0,0);
}
function buildComp(){
  const s=S,w=WD,ctx=compCtx;
  ctx.globalAlpha=1;ctx.drawImage(baseCv,0,0);
  buildOverlay();ctx.imageSmoothingEnabled=true;ctx.drawImage(ovCv,0,0,HW,HH);
  const m=ui.mode;
  // Stable sub-cell marks show actual minority shares without changing the
  // simulation random stream or replacing every province's dominant identity.
  if(m==='peoples')for(const i of w.landIdx){const minority=s.eth2[i];if(minority<0||s.mix[i]<0.04||s.pop[i]<100)continue;
    ctx.fillStyle='rgb('+s.eths[minority].rgb.join(',')+')';const count=Math.round(s.mix[i]*16),offset=(Math.imul(i+1,1103515245)>>>0)%16;
    for(let n=0;n<count;n++){const slot=(offset+n*7)%16;ctx.fillRect(w.cxA[i]*SC+(slot%4)*SC/4,w.cyA[i]*SC+Math.floor(slot/4)*SC/4,SC/4,SC/4)}
  }
  if(m==='political'||m==='alliances'||m==='peoples'||m==='religion'){
    const key=m==='peoples'?s.eth:m==='religion'?s.rel:Int32Array.from(s.pol,id=>id&&polityOnMap(s.pols[id])?id:0),polMode=m==='political'||m==='alliances';
    let selP=0;if(ui.page){if(polMode&&ui.page.t==='pol')selP=ui.page.id;else if(m==='peoples'&&ui.page.t==='eth')selP=ui.page.id;else if(m==='religion'&&ui.page.t==='rel')selP=ui.page.id;else if(ui.page.t==='cell')selP=key[ui.page.id]}
    const thin=new Path2D(),hi=new Path2D(),war=new Path2D();
    const seg=(p,x1,y1,x2,y2)=>{p.moveTo(x1,y1);p.lineTo(x2,y2)};
    for(const i of w.landIdx){
      const a=key[i],x=w.cxA[i],y=w.cyA[i],jr=w.nb[i*4+1],jd=w.nb[i*4+3];
      for(const [j,x1,y1,x2,y2] of [[jr,(x+1)*SC,y*SC,(x+1)*SC,(y+1)*SC],[jd,x*SC,(y+1)*SC,(x+1)*SC,(y+1)*SC]]){
        if(j<0||!w.land[j]||(j===jr&&x>=W-1))continue;const b=key[j];if(b===a)continue;
        if(polMode&&a>0&&b>0&&s.pols[a].enemies.has(b)){seg(war,x1,y1,x2,y2);continue}
        if(a<=0&&b<=0&&!(m==='peoples'))continue;
        seg(selP>0&&(a===selP||b===selP)?hi:thin,x1,y1,x2,y2)}
    }
    if(polMode){const hatch=new Path2D(),fortP=new Path2D();
      for(const i of w.landIdx){const p=s.pol[i];if(!p||!polityOnMap(s.pols[p]))continue;const o=s.pols[p],x=w.cxA[i]*SC,y=w.cyA[i]*SC;
        if(o.kind==='horde'&&((w.cxA[i]+w.cyA[i])&1)){hatch.moveTo(x,y+SC);hatch.lineTo(x+SC,y)}
        if(s.fort[i]>0.4){for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.pol[j]===p)continue;
          if(d===0){fortP.moveTo(x,y);fortP.lineTo(x,y+SC)}else if(d===1){fortP.moveTo(x+SC,y);fortP.lineTo(x+SC,y+SC)}else if(d===2){fortP.moveTo(x,y);fortP.lineTo(x+SC,y)}else{fortP.moveTo(x,y+SC);fortP.lineTo(x+SC,y+SC)}}}}
      ctx.strokeStyle='rgba(60,40,20,.55)';ctx.lineWidth=0.9;ctx.stroke(hatch);
      ctx.save();ctx.strokeStyle='#3a2614';ctx.lineWidth=3.2;ctx.setLineDash([2.5,1.5]);ctx.stroke(fortP);ctx.restore()}
    ctx.strokeStyle=polMode?'rgba(20,24,28,.6)':'rgba(20,24,28,.3)';ctx.lineWidth=polMode?1.1:0.8;ctx.stroke(thin);
    if(polMode){ctx.strokeStyle='rgba(214,40,30,.95)';ctx.lineWidth=2.2;ctx.stroke(war)}
    ctx.strokeStyle='#fff6e8';ctx.lineWidth=2.6;ctx.stroke(hi);ctx.strokeStyle='rgba(20,24,28,.9)';ctx.lineWidth=1;ctx.stroke(hi);
  }
}

/* ---------- map view ---------- */
function sizeCanvas(cv){const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.max(1,Math.round(r.width*dpr));cv.height=Math.max(1,Math.round(r.height*dpr));return{w:r.width,h:r.height,dpr}}
let mapDim={w:1,h:1,dpr:1};
function resize(){mapDim=sizeCanvas(mapCv);ui.bs=Math.max(mapDim.w/HW,mapDim.h/HH);clampView();sizeCanvas(chartCv);drawChart();drawMap()}
function clampView(){const mw=HW*ui.bs*ui.z,mh=HH*ui.bs*ui.z;ui.oy=clamp(ui.oy,mapDim.h-mh,0);ui.ox=((ui.ox%mw)-mw)%mw}
const lonToMx=l=>(l/(2*Math.PI)+0.5)*HW,laToMy=la=>(0.5-la/Math.PI)*HH;
function cityMapItems(){
  if(ui.cities==='hidden')return [];
  const s=S,w=WD,regional=new Map(),items=[],seen=new Set();
  const region=i=>Math.floor(w.cyA[i]/12)*Math.ceil(W/12)+Math.floor(w.cxA[i]/12);
  for(const c of s.cities){if(c.abandoned)continue;const p=s.urban[c.cell]||0,k=region(c.cell);regional.set(k,Math.max(regional.get(k)||0,p))}
  for(const c of s.cities){
    if(c.abandoned)continue;const i=c.cell,o=s.pol[i]?s.pols[s.pol[i]]:null,capital=!!(o&&o.kind==='state'&&o.capital===i),p=s.urban[i]||0;
    if(o&&o.kind==='horde'&&['political','alliances'].includes(ui.mode)&&!polityOnMap(o))continue;
    if(!capital&&(p<500||ui.cities==='capitals'))continue;
    if(!capital&&ui.cities==='major'&&p<Math.max(4000,(regional.get(region(i))||0)*0.35))continue;
    items.push({cell:i,name:c.name,pop:p,capital});seen.add(i);
  }
  for(const id of s.alive){const o=s.pols[id];if(o.kind==='state'&&!seen.has(o.capital)&&!(s.cityDamage[o.capital]>0.8&&s.urban[o.capital]<500))items.push({cell:o.capital,name:o.base,pop:s.urban[o.capital]||0,capital:true})}
  const selected=ui.page&&ui.page.t==='pol'?ui.page.id:0;
  return items.sort((a,b)=>(s.pol[b.cell]===selected?1:0)-(s.pol[a.cell]===selected?1:0)||Number(b.capital)-Number(a.capital)||b.pop-a.pop);
}
function drawMap(){
  if(!baseCv||!S)return;
  const ctx=mapCtx,{w,h,dpr}=mapDim,k=ui.bs*ui.z,mw=HW*k,mh=HH*k,m=ui.mode;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  ctx.imageSmoothingEnabled=ui.z<2.5;
  for(let c=0;c<3;c++){const x=ui.ox+c*mw;if(x>w)break;ctx.drawImage(compCv,x,ui.oy,mw,mh)}
  const k_=k,s=S,W2=WD,each=(mx,my,f)=>{for(let c=-1;c<3;c++){const sx=ui.ox+c*mw+mx*k,sy=ui.oy+my*k;if(sx>-80&&sx<w+80&&sy>-40&&sy<h+40)f(sx,sy)}};
  const cellXY=i=>[(W2.cxA[i]+0.5)*SC,(W2.cyA[i]+0.5)*SC];
  // alliance lines
  if(m==='alliances'){ctx.strokeStyle='rgba(255,246,230,.75)';ctx.lineWidth=1.3;ctx.setLineDash([4,3]);
    for(const id of s.alive){const o=s.pols[id];for(const q of o.allies){if(q<id)continue;const p=s.pols[q];if(!p||!p.alive||!polityOnMap(o)||!polityOnMap(p))continue;
      const [x1,y1]=cellXY(o.capital),[x2,y2]=cellXY(p.capital);if(Math.abs(x2-x1)>HW/2)continue;
      each(x1,y1,(sx,sy)=>{ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(x2-x1)*k,sy+(y2-y1)*k);ctx.stroke()})}}
    ctx.setLineDash([])}
  // caravan routes
  if((m==='political'||m==='alliances'||m==='religion'||m==='peoples')&&s.routes){ctx.lineWidth=1.6;ctx.strokeStyle='rgba(232,200,140,.85)';ctx.setLineDash([2,3]);
    for(const R of s.routes){const pts=R.path.map(cellXY);if(pts.length<2)continue;
      each(pts[0][0],pts[0][1],(sx0,sy0)=>{ctx.beginPath();let px=pts[0][0];ctx.moveTo(sx0,sy0);
        for(let k=1;k<pts.length;k++){let dx=pts[k][0]-px;if(Math.abs(dx)>HW/2){dx-=Math.sign(dx)*HW}px+=dx;ctx.lineTo(sx0+(px-pts[0][0])*k_,sy0+(pts[k][1]-pts[0][1])*k_)}ctx.stroke()})}
    ctx.setLineDash([])}
  // migrations
  if(m==='political'||m==='alliances'||m==='peoples'||m==='mixing'){
    for(const M of s.migs){if(M.kind==='horde'&&M.pol&&s.pols[M.pol]&&!polityOnMap(s.pols[M.pol]))continue;if(M.done&&s.year-M.end>25)continue;if(M.path.length<2)continue;
      const pts=M.path.map(cellXY);ctx.lineWidth=2;ctx.strokeStyle=M.done?'rgba(255,214,140,.45)':'rgba(255,196,90,.95)';ctx.setLineDash(M.done?[3,3]:[]);
      each(pts[0][0],pts[0][1],(sx0,sy0)=>{ctx.beginPath();let px=pts[0][0];ctx.moveTo(sx0,sy0);
        for(let k=1;k<pts.length;k++){let dx=pts[k][0]-px;if(Math.abs(dx)>HW/2){dx-=Math.sign(dx)*HW}px+=dx;ctx.lineTo(sx0+(px-pts[0][0])*k_,sy0+(pts[k][1]-pts[0][1])*k_)}
        ctx.stroke();
        if(!M.done){const ex=sx0+(px-pts[0][0])*k_,ey=sy0+(pts[pts.length-1][1]-pts[0][1])*k_;ctx.fillStyle='rgba(255,196,90,.95)';ctx.beginPath();ctx.arc(ex,ey,4.5,0,7);ctx.fill();ctx.strokeStyle='#3a2614';ctx.lineWidth=1;ctx.setLineDash([]);ctx.stroke()}})}
    ctx.setLineDash([])}
  if(m==='peoples'&&(ui.z>1.4||ui.page?.t==='eth')){
    const selected=ui.page?.t==='eth'?ui.page.id:-1;
    ctx.lineWidth=1;ctx.setLineDash([2,3]);
    for(const move of s.campMoves){if(s.year-move.year>3||selected>=0&&move.eth!==selected)continue;
      const [x,y]=cellXY(move.from),[tx,ty]=cellXY(move.to);if(Math.abs(tx-x)>HW/2)continue;
      ctx.strokeStyle='rgba('+s.eths[move.eth].rgb.join(',')+',.8)';each(x,y,(sx,sy)=>{ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(tx-x)*k,sy+(ty-y)*k);ctx.stroke()});
    }ctx.setLineDash([]);
    for(const M of s.migs)for(const group of M.settled||[]){if(s.year-group.year>25||selected>=0&&group.eth!==selected)continue;
      const [x,y]=cellXY(group.cell);ctx.fillStyle='rgb('+s.eths[group.eth].rgb.join(',')+')';each(x,y,(sx,sy)=>{ctx.beginPath();ctx.arc(sx,sy,2.2,0,Math.PI*2);ctx.fill()});
    }
  }
  if(ui.ringCell>=0&&performance.now()<ui.ringT){const [mx,my]=cellXY(ui.ringCell),ph=(ui.ringT-performance.now())/4000;
    each(mx,my,(sx,sy)=>{ctx.strokeStyle=`rgba(255,240,200,${0.4+0.6*ph})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(sx,sy,10+18*(1-ph)*((performance.now()/600)%1+0.2),0,7);ctx.stroke()})}
  // City filters affect display only. Regional urban population, rather than
  // rural hinterland population, determines a city's importance.
  if((m==='political'||m==='alliances'||m==='peoples'||m==='religion')&&ui.cities!=='hidden'){
    ctx.font=`11px ${cssVar('--f-ui')}`;ctx.textAlign='left';ctx.textBaseline='middle';
    const marks=[],names=[];
    for(const city of cityMapItems()){
      const [mx,my]=cellXY(city.cell);
      each(mx,my,(sx,sy)=>{
        if(marks.some(p=>Math.abs(p[0]-sx)<11&&Math.abs(p[1]-sy)<11))return;marks.push([sx,sy]);
        ctx.fillStyle='#14202a';ctx.strokeStyle='#f5f3ec';ctx.lineWidth=1.5;
        if(city.capital){ctx.fillRect(sx-3,sy-3,6,6);ctx.strokeRect(sx-3,sy-3,6,6)}else{ctx.beginPath();ctx.arc(sx,sy,2.5,0,7);ctx.fill();ctx.stroke()}
        if(ui.cityNames&&ui.z>=2){
          const width=ctx.measureText(city.name).width,rect=[sx+6,sy-8,width+4,16];
          if(!names.some(p=>rect[0]<p[0]+p[2]&&rect[0]+rect[2]>p[0]&&rect[1]<p[1]+p[3]&&rect[1]+rect[3]>p[1])){
            names.push(rect);ctx.lineWidth=3;ctx.strokeText(city.name,sx+6,sy);ctx.fillText(city.name,sx+6,sy);
          }
        }
      });
    }
  }
  // labels
  const lab=[];
  if(m==='political'||m==='alliances'){for(const id of s.alive){const o=s.pols[id];if(o.cells>=6&&polityOnMap(o))lab.push([lonToMx(o.lx),(o.ly+0.5)*SC,o.base,o.cells,o.tier==='Empire'||o.tier==='Khaganate'])}}
  else if(m==='peoples'){for(const e of s.eths)if(e.alive&&e.cells>=18)lab.push([lonToMx(e.lon),laToMy(e.la),e.name,e.cells,false])}
  else if(m==='religion'){for(const R of s.rels)if(R.alive&&R.cells>=12&&R.lon!=null)lab.push([lonToMx(R.lon),laToMy(R.la),R.name.replace(/^the /,''),R.cells,false])}
  lab.sort((a,b)=>b[3]-a[3]);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  const placed=[];
  for(const [mx,my,name,n,big] of lab.slice(0,110)){
    const size=clamp(9+Math.sqrt(n)*1.3,10,30)*Math.min(1.6,Math.sqrt(ui.z));
    ctx.font=`${big?'':'italic '}${size}px ${DISPLAY_FONT}`;
    const txt=big?name.toUpperCase().split('').join(' '):name,tw=ctx.measureText(txt).width;
    each(mx,my,(sx,sy)=>{const bx=[sx-tw/2-2,sy-size/2,tw+4,size];
      if(placed.some(p=>bx[0]<p[0]+p[2]&&bx[0]+bx[2]>p[0]&&bx[1]<p[1]+p[3]&&bx[1]+bx[3]>p[1]))return;
      placed.push(bx);ctx.strokeStyle='rgba(245,243,236,.82)';ctx.lineWidth=3;ctx.strokeText(txt,sx,sy);ctx.fillStyle='#16222b';ctx.fillText(txt,sx,sy)})
  }
  if(ui.page&&ui.page.t==='cell'){const i=ui.page.id,cx=W2.cxA[i],cy=W2.cyA[i];ctx.strokeStyle='#fff';ctx.lineWidth=2;
    each(cx*SC,cy*SC,(sx,sy)=>ctx.strokeRect(sx,sy,SC*k,SC*k))}
}
function screenToCell(sx,sy){const k=ui.bs*ui.z;let mx=(sx-ui.ox)/k;mx=((mx%HW)+HW)%HW;const my=(sy-ui.oy)/k;if(my<0||my>=HH)return-1;return Math.floor(my/SC)*W+Math.floor(mx/SC)}
function centerOn(i){if(i==null||i<0)return;ui.camera=null;const k=ui.bs*ui.z;ui.ox=mapDim.w/2-(WD.cxA[i]+0.5)*SC*k;ui.oy=mapDim.h/2-(WD.cyA[i]+0.5)*SC*k;clampView();drawMap()}
function focusPolity(id){
  const o=S?.pols[id];if(!o?.alive)return;
  let cells=WD.landIdx.filter(i=>S.pol[i]===id&&S.pop[i]>=100);if(!cells.length)cells=[o.capital];
  const target=fitMapCells(Array.from(cells),WD,mapDim,ui.bs);if(!target)return;
  ui.mode='political';$('map-view').value='political';$('nomad-tools').hidden=false;drawLegend();
  openPage('pol',id);ui.ringCell=o.capital;ui.ringT=performance.now()+1800;
  const cx=(mapDim.w/2-ui.ox)/(ui.bs*ui.z),cy=(mapDim.h/2-ui.oy)/(ui.bs*ui.z);
  target.cx=cx+((target.cx-cx+HW*1.5)%HW-HW/2);
  ui.camera={from:{cx,cy,z:ui.z},to:target,start:performance.now(),duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:650};
  moveCamera(performance.now());ui.dirty=true;
}
function moveCamera(t){
  const c=ui.camera;if(!c)return;const progress=c.duration?clamp((t-c.start)/c.duration,0,1):1,f=progress*progress*(3-2*progress);
  ui.z=Math.exp(Math.log(c.from.z)+(Math.log(c.to.z)-Math.log(c.from.z))*f);
  const x=c.from.cx+(c.to.cx-c.from.cx)*f,y=c.from.cy+(c.to.cy-c.from.cy)*f;
  ui.ox=mapDim.w/2-x*ui.bs*ui.z;ui.oy=mapDim.h/2-y*ui.bs*ui.z;clampView();drawMap();if(progress>=1)ui.camera=null;
}

/* ---------- legend ---------- */
function drawLegend(){
  const m=ui.mode,el=$('legend');let h='';
  const rampBox=(t,a,b)=>`<div>${t}</div><div class="ramp" style="background:${rampCss()}"></div><div class="row"><span>${a}</span><span>${b}</span></div>`;
  const keys=list=>'<div class="keys">'+list.map(([c,l])=>`<span><i style="background:rgb(${c})"></i>${l}</span>`).join('')+'</div>';
  switch(m){
    case'food':h=rampBox('Household food reserves','empty','18 months or more');break;
    case'institutions':h=rampBox('Local councils, storage and organization','informal','established');break;
    case'trade':h=rampBox('Ports, river nodes and actual food traffic','local exchange','connected hub');break;
    case'political':h='Each colour is a state. Use Confederations to show all, hide them, or show whole coalitions near settled societies (with a ten-year grace period). Hatched, faint areas are visible nomad confederations; pale areas are wasteland a state only claims. Dotted tan lines are caravan routes. Red borders are war fronts; dark dashed lines are fortified frontiers; amber trails are peoples on the move. Click a state to open its page.';break;
    case'soil':h=rampBox('Soil fertility (farmland only; worn-out soils are cool, fresh ones warm)','depleted','fresh')+keys([[[235,235,225],'Salt-poisoned fields']])+'<p style="margin:6px 0 0;opacity:.85">Crowded fields wear out unless rested, manured or rotated; floodplains renew each year; irrigation in dry lands slowly salts the soil.</p>';break;
    case'forest':h=keys([[[34,110,52],'Standing forest'],[[196,120,60],'Cleared or lost forest']])+'<p style="margin:6px 0 0;opacity:.85">Farmers clear forest to plant; smelting eats charcoal; abandoned land grows back. Stripped hillsides erode.</p>';break;
    case'inequality':h=rampBox('Inequality within each state','equal','extreme')+'<p style="margin:6px 0 0;opacity:.85">Crowding and long peace concentrate wealth, faster where the plough makes land the prize. War, revolution, collapse and plague level it.</p>';break;
    case'circ':h=rampBox('How trapped farmers are (circumscription)','free to leave','hemmed in')+'<p style="margin:6px 0 0;opacity:.85">Where good land is ringed by desert, mountains, sea or crowded neighbours, people cannot walk away from rulers, so states form and can tax (Carneiro). Where open land lies near, subjects simply leave (Herbst, Scott).</p>';break;
    case'unity':h='Shared identities left by long unification. Each colour marks an inherited political tradition; stronger colour means a deeper memory of unity. Heirs of that unity find reconquest easier, and annex fellow successors more readily. Memory fades over centuries of division.';break;
    case'niche':h=rampBox('Distance from the state\'s home ground','like home','alien')+'<p style="margin:6px 0 0;opacity:.85">'+'How far each province lies from its state\'s home ground: climate, rainfall, way of life and diseases. Cool colours are lands like the heartland; warm colours are unlike it, harder to conquer, tax and keep. Empires grow easily along one climate belt, river or coast.</p>';break;
    case'loyalty':h=rampBox('Province loyalty','newly conquered','fully integrated')+'<p style="margin:6px 0 0;opacity:.85">'+'How integrated each province is into its state. Newly conquered and foreign provinces start low; roads, writing, law, shared people, faith and identity raise it. Rebellions start where it is lowest.</p>';break;
    case'mixing':h='Places where two peoples live side by side. Brighter means a more even mix; long, even mixing can give birth to a new people.';break;
    case'alliances':h='States in the same alliance share a colour; dashed lines link allied capitals. Faded states stand alone; pale states pay tribute to the bloc whose tint they carry. Red borders are war fronts.';break;
    case'peoples':h='Each colour is a people; related peoples share a hue family. Small marks show resident minorities. Amber trails follow migrations; at closer zoom, coloured traces show recent camp movements and dots mark communities left along migration routes.';break;
    case'religion':h='Each colour is an organised faith. Grey areas follow their people’s own folk religion.';break;
    case'knowledge':{
      let share='';if(S&&S.stats.length){}
      const tp=worldPop();
      h=`Pick techniques. Gold: knows all picked; blue: knows some.${ui.know.size?'':' With none picked, colour shows how many techniques each place knows.'}<div class="kchips">`+TECH.map(t=>`<button type="button" data-k="${t.k}" aria-pressed="${ui.know.has(t.k)}" title="${t.synth?esc('Synthesized: '+t.d):''}">${t.synth?'✦ ':''}${t.n}<small>${tp?Math.round(techShare(TI[t.k])/tp*100)+'%':''}</small></button>`).join('')+'</div>';
      break}
    case'era':h='Era each place has reached, from what it knows.'+keys(ERAS.map((n,k)=>[ERA_COL[k],n]));break;
    case'density':h=rampBox('People per km²','0.01','100');break;
    case'capacity':h=rampBox('Carrying capacity per km² this year','0.01','100');break;
    case'asabiya':h=rampBox('Asabiya (collective solidarity)','0','1');break;
    case'disease':h=keys([[[220,40,40],'Outbreak now'],[[60,120,200],'Immunity from past exposure']]);break;
    case'weather':h=keys([[[30,150,150],'Wetter than normal'],[[170,110,40],'Drier than normal']]);break;
    case'climate':
      h=`<div class="kchips">${[['mismatch','Model vs observed'],['model','Model zones'],['observed','Observed zones']].map(([k,l])=>`<button type="button" data-cv="${k}" aria-pressed="${ui.climView===k}">${l}</button>`).join('')}</div>`;
      if(ui.climView==='mismatch')h+=WD&&WD.grade?keys([[[90,170,110],'Matches'],[[200,120,50],'Model too dry'],[[60,120,210],'Model too wet'],[[150,110,210],'Model too cold'],[[230,90,70],'Model too warm']]):'<div>Observed climate zones exist only for Earth.</div>';
      else h+=keys(KG_GROUPS.map((n,k)=>[GROUP_COL[k],n]));
      break;
    case'terrain':h='Relief, biomes and major rivers.';break;
  }
  el.innerHTML=h;
}
function worldPop(){if(!S)return 0;let t=0;for(const i of WD.landIdx)t+=S.pop[i];for(const id of S.activeMigs)t+=S.migs[id].pop;for(const p of S.press.values())t+=p.p;for(const e of S.expeditions||[])if(!e.done)t+=e.pop;return t}
function techShare(k){let t=0;const f=S.tk[k];for(const i of WD.landIdx)if(f[i]>0.5)t+=S.pop[i];return t}
$('legend').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.k){const k=b.dataset.k;ui.know.has(k)?ui.know.delete(k):ui.know.add(k)}
  if(b.dataset.cv)ui.climView=b.dataset.cv;
  drawLegend();ui.dirty=true});

/* ---------- chart ---------- */
function drawChart(){
  if(!S)return;const r=chartCv.getBoundingClientRect(),ctx=chartCtx,w=r.width,h=r.height;const dpr=Math.min(2,window.devicePixelRatio||1);
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const st=S.stats;if(st.length<2)return;
  const ink=cssVar('--ink'),mut=cssVar('--muted'),line=cssVar('--line'),acc=cssVar('--accent');
  const L=46,R=40,T=22,B=20,pw=w-L-R,ph=h-T-B,y0=S.start,y1=Math.max(st[st.length-1].y,y0+500);
  const X=y=>L+(y-y0)/(y1-y0)*pw;
  const pmax=Math.max(...st.map(s=>s.pop)),pmin=Math.max(1e5,Math.min(...st.map(s=>s.pop))*0.8);
  const lo=Math.floor(Math.log10(pmin)),hi=Math.ceil(Math.log10(pmax*1.05));
  const Y=v=>T+ph-(Math.log10(Math.max(v,10**lo))-lo)/(hi-lo)*ph;
  const nmax=Math.max(4,...st.map(s=>s.np));
  ctx.font=`10px ${cssVar('--f-mono')}`;ctx.textBaseline='middle';
  ctx.strokeStyle=line;ctx.lineWidth=1;ctx.fillStyle=mut;ctx.textAlign='right';
  for(let e=lo;e<=hi;e++){const yy=Math.round(Y(10**e))+0.5;ctx.beginPath();ctx.moveTo(L,yy);ctx.lineTo(L+pw,yy);ctx.stroke();ctx.fillText(fmtN(10**e),L-6,yy)}
  ctx.fillStyle=acc;ctx.globalAlpha=0.26;const bw=Math.max(1,pw/st.length);
  for(const s of st){const bh=s.np/nmax*ph;ctx.fillRect(X(s.y)-bw/2,T+ph-bh,bw,bh)}
  ctx.globalAlpha=1;
  // leading era band
  for(let k=0;k<st.length;k++){const s=st[k],x0=X(s.y),x1=k+1<st.length?X(st[k+1].y):x0+bw;ctx.fillStyle=`rgb(${ERA_COL[s.lead||0]})`;ctx.fillRect(x0,T-6,Math.max(1,x1-x0),4)}
  for(let k=0;k<st.length;k++){const s=st[k],x0=X(s.y),x1=k+1<st.length?X(st[k+1].y):x0+bw,g=clamp((s.gT||0)/1.2,-1,1);ctx.fillStyle=g>=0?`rgba(214,96,60,${Math.abs(g)})`:`rgba(60,110,200,${Math.abs(g)})`;ctx.fillRect(x0,T+ph+1,Math.max(1,x1-x0),3)}
  ctx.textAlign='left';ctx.fillStyle=acc;ctx.fillText(String(nmax),L+pw+6,T+4);ctx.fillText('0',L+pw+6,T+ph);
  ctx.strokeStyle=ink;ctx.lineWidth=1.6;ctx.beginPath();st.forEach((s,k)=>{const x=X(s.y),y=Y(s.pop);k?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
  const last=st[st.length-1];ctx.fillStyle=ink;ctx.beginPath();ctx.arc(X(last.y),Y(last.pop),3,0,7);ctx.fill();
  ctx.fillStyle=mut;ctx.textAlign='center';ctx.textBaseline='alphabetic';
  const span=y1-y0,stepY=[100,200,500,1000,2000,5000].find(v=>v/span*pw>=72)||5000;
  for(let yy=Math.ceil(y0/stepY)*stepY;yy<=y1;yy+=stepY){ctx.fillText(yy<0?`${-yy} BCE`:yy===0?'1 CE':`${yy}`,X(yy),h-5)}
  ctx.textAlign='left';ctx.font=`11px ${cssVar('--f-ui')}`;ctx.fillStyle=ink;ctx.fillText('World population',L+4,11);
  ctx.fillStyle=acc;ctx.fillText('States and city states',L+112,11);if(w>620){ctx.fillStyle=mut;ctx.fillText('Bar above: leading era · line below: climate (blue cold, red warm)',L+250,11)}
}

/* ---------- top stats ---------- */
function updateTop(){
  const s=S,st=s.stats[s.stats.length-1];
  $('yr').textContent=s.year<=0?(1-s.year).toLocaleString('en-US'):String(s.year);$('era').textContent=s.year<=0?'BCE':'CE';
  if(!st)return;
  const largest=S.alive.map(id=>S.pols[id]).filter(o=>o.alive).reduce((a,b)=>!a||b.cells>a.cells?b:a,null);
  const button=$('largest-focus'),focused=button&&document.activeElement===button;
  const markup=`<span>Population <b>${fmtN(st.pop)}</b></span><span>States <b>${st.np}</b></span><span>Hordes <b>${st.nh||0}</b></span><span>Leading era <b>${ERAS[st.lead||0]}</b></span><span>Largest ${largest?`<button class="stat-focus" id="largest-focus" data-pol="${largest.id}" type="button" title="Show ${esc(largest.full)} on the map"><b>${esc(largest.full)}</b> (${largest.cells})</button>`:'<b>none</b>'}</span>`;
  if(ui.topMarkup!==markup){$('topstats').innerHTML=markup;ui.topMarkup=markup;if(focused)$('largest-focus')?.focus({preventScroll:true})}
}
$('topstats').addEventListener('click',e=>{const b=e.target.closest('[data-pol]');if(b)focusPolity(+b.dataset.pol)});

/* ---------- links and pages ---------- */
function linkify(txt,refs){
  if(!refs||!refs.length)return esc(txt);
  const hits=[];
  for(const [t,id,name] of [...refs].sort((a,b)=>String(b[2]).length-String(a[2]).length)){if(!name)continue;
    let from=0,pos;
    while((pos=txt.indexOf(name,from))>=0){if(!hits.some(h=>pos<h.e&&pos+name.length>h.s)){hits.push({s:pos,e:pos+name.length,t,id});break}from=pos+1}}
  hits.sort((a,b)=>a.s-b.s);let out='',k=0;
  for(const h of hits){out+=esc(txt.slice(k,h.s))+`<a class="lnk" tabindex="0" data-t="${h.t}" data-id="${h.id}">${esc(txt.slice(h.s,h.e))}</a>`;k=h.e}
  return out+esc(txt.slice(k));
}
const L_=(t,id,name)=>`<a class="lnk" tabindex="0" data-t="${t}" data-id="${id}">${esc(name)}</a>`;
const lm_=M=>L_('mig',M.id,'the '+M.name),lp=o=>L_('pol',o.id,o.alive?o.full:o.peak),le=e=>L_('eth',e.id,e.name),lr=R=>L_('rel',R.id,R.name),lf=f=>L_('fig',f.id,f.name),lw=w=>L_('war',w.id,w.name);
function entityCell(t,id){const s=S;
  switch(t){case'cell':return id;case'pol':return s.pols[id].capital;case'eth':{const e=s.eths[id];return e.alive?cellAt(e.la*180/Math.PI,e.lon*180/Math.PI):-1}
    case'rel':return s.rels[id].origin;case'fig':{const f=s.figs[id];const p=f.pol&&s.pols[f.pol];return p?p.capital:-1}
    case'plague':return s.outbreaks[id].origin;case'war':return s.pols[s.wars[id].d[0]].capital;case'mig':{const M=s.migs[id];return M.done?M.path[M.path.length-1]:M.cell}}return-1}
function openPage(t,id,noPush){if(ui.page&&!noPush&&!(ui.page.t===t&&ui.page.id===id))ui.stack.push(ui.page);if(ui.stack.length>40)ui.stack.shift();ui.page={t,id:+id};showPane('insp');ui.dirty=true}
document.querySelector('.side').addEventListener('click',e=>{const a=e.target.closest('.lnk');if(!a)return;e.preventDefault();openPage(a.dataset.t,+a.dataset.id);centerOn(entityCell(a.dataset.t,+a.dataset.id))});
document.querySelector('.side').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const a=e.target.closest('.lnk,.card');if(a)a.click()});
function bar(label,v,max,cls){const t=clamp(v/max,0,1);return`<div class="barrow"><span>${label}</span><div class="track"><div class="fill ${cls||''}" style="width:${(t*100).toFixed(0)}%"></div></div><span class="v">${v.toFixed(2)}</span></div>`}
function chronFor(pred,max){const out=[];const c=S.chron;for(let k=c.length-1;k>=0&&out.length<(max||25);k--){if(pred(c[k]))out.push(c[k])}return out}
function chronList(list){return list.length?'<div class="entries">'+list.map(entryHTML).join('')+'</div>':'<div class="note">No recorded events yet.</div>'}
function entryHTML(e){return`<div class="entry"><div class="yr" data-c="${e.cell}"><i style="background:${TYPES[e.t][1]}"></i>${fy(e.y)}</div><div class="txt">${linkify(e.txt,e.refs)}${e.why?`<span class="why">${esc(e.why)}</span>`:''}</div></div>`}
const refHas=(e,t,id)=>e.refs&&e.refs.some(r=>r[0]===t&&r[1]===id);
function spark(hist){if(!hist||hist.length<4)return'';return`<canvas class="sparkc" data-hist="${hist.join(',')}"></canvas>`}
function drawSparks(root){
  for(const cv of root.querySelectorAll('canvas.sparkc')){const a=cv.dataset.hist.split(',').map(Number),r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
    cv.width=r.width*dpr;cv.height=r.height*dpr;const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    const ys=[],vs=[];for(let k=0;k<a.length;k+=2){ys.push(a[k]);vs.push(a[k+1])}
    const x0=ys[0],x1=Math.max(ys[ys.length-1],x0+10),vm=Math.max(...vs),w=r.width,h=r.height;
    ctx.fillStyle=cssVar('--accent-soft');ctx.strokeStyle=cssVar('--accent');ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,h);
    ys.forEach((y,k)=>ctx.lineTo((y-x0)/(x1-x0)*w,h-2-vs[k]/vm*(h-14)));ctx.lineTo(w,h);ctx.closePath();ctx.fill();
    ctx.beginPath();ys.forEach((y,k)=>{const X=(y-x0)/(x1-x0)*w,Y=h-2-vs[k]/vm*(h-14);k?ctx.lineTo(X,Y):ctx.moveTo(X,Y)});ctx.stroke();
    ctx.fillStyle=cssVar('--muted');ctx.font=`10px ${cssVar('--f-mono')}`;ctx.textBaseline='top';ctx.textAlign='left';ctx.fillText(`peak ${vm} provinces`,2,0);ctx.textAlign='right';ctx.fillText(`${fy(x0)} – ${fy(ys[ys.length-1])}`,w-2,0)}
}
function renderPage(){
  const el=$('pane-insp');
  if(!S){el.innerHTML='';return}
  if(!ui.page){el.innerHTML='<div class="empty">Click anywhere on the map, or any name in the chronicle, to open its page.</div>';return}
  const {t,id}=ui.page,s=S,w=WD;let h=`<div class="backbar">${ui.stack.length?'<button class="btn" id="pgback" type="button">Back</button>':''}</div>`;
  try{
  if(t==='cell'){
    const i=id,latd=(w.lat[i]*180/Math.PI).toFixed(1),lond=((w.cxA[i]+0.5)/W*360-180).toFixed(1);
    if(!w.land[i]){h+=`<h2 class="name">Open sea</h2><p class="sub2">${latd}°, ${lond}° · depth ${Math.round(-w.elev[i])} m</p>`}
    else{
      const p=s.pol[i]?s.pols[s.pol[i]]:null,e=s.eth[i]>=0?s.eths[s.eth[i]]:null,R=s.rel[i]>=0?s.rels[s.rel[i]]:null,city=s.city[i]>=0?s.cities[s.city[i]]:null;
      h+=`<div class="kind">Province</div><h2 class="name">${city?esc(city.name):e?'Lands of the '+esc(e.name):'Empty land'}</h2><p class="sub2">${latd}°, ${lond}° · ${ERAS[eraOf(i)]}</p>`;
      h+=`<dl class="kv" style="margin-top:10px"><dt>State</dt><dd>${p?lp(p):'none'}</dd><dt>People</dt><dd>${e?le(e):'none'}</dd><dt>Faith</dt><dd>${R?lr(R):e?'folk religion':'–'}</dd><dt>Population</dt><dd>${fmtN(s.pop[i])} / ${fmtN(s.K[i])}</dd><dt>Household provisions</dt><dd>${(12*s.food[i]/Math.max(1,s.pop[i])).toFixed(1)} months</dd><dt>Harvest shortfall</dt><dd>${Math.round((1-s.nutrition[i])*100)}%</dd><dt>Communal organization</dt><dd>${Math.round(s.organisation[i]*100)} / 100</dd>${s.settleLag[i]?`<dt>Settlement establishment</dt><dd>${s.settleLag[i]} harvests remaining</dd>`:''}${city?`<dt>City</dt><dd>${esc(city.name)}${p&&p.capital===i?' (capital)':''}, since ${fy(city.born)}</dd>`:''}</dl>`;
      h+=`<h3 class="sec">Land</h3><dl class="kv"><dt>Terrain</dt><dd>${BIOMES[w.biome[i]]}, ${Math.round(w.elev[i])} m</dd><dt>Climate</dt><dd>${w.T[i].toFixed(1)} °C, ${Math.round(w.Pr[i])} mm</dd><dt>Seasonal swing</dt><dd>${w.amp[i].toFixed(0)} °C</dd>${w.kgGrid&&w.kgGrid[i]?`<dt>Observed zone</dt><dd>${KG_CODES[w.kgGrid[i]]}</dd><dt>Model zone</dt><dd>${KG_GROUPS[simGroup(w.rawT[i],w.rawP[i],w.rawA[i])]}</dd>`:''}<dt>This year's rain</dt><dd>${Math.round((s.wm[i]-1)*100)>=0?'+':''}${Math.round((s.wm[i]-1)*100)}%</dd><dt>River</dt><dd>${w.rv[i]>0?(w.rv[i]>0.6?'major':'yes'):'no'}</dd><dt>Soil fertility</dt><dd>${(s.fert[i]*100).toFixed(0)}%</dd><dt>Immunity</dt><dd>${(s.immune[i]*100).toFixed(0)}%</dd><dt>Asabiya</dt><dd>${s.s[i].toFixed(2)}</dd></dl>`;
      h+=`<h3 class="sec">Ecology</h3><div class="bars">${w.sF[i]>0.08?bar('Soil fertility',s.fert[i],1,'t'):''}${w.forest0[i]>0.05?bar('Forest standing',s.forest[i]/w.forest0[i],1,'t'):''}${s.salt[i]>0.02?bar('Salt in the soil',s.salt[i],1):''}${w.mal[i]>0.05?bar('Fever burden',w.mal[i]*(1-s.adapt[i]),1):''}${w.oncho[i]>0.05?bar('River blindness',w.oncho[i],1):''}${bar('Disease pool',s.dp[i],1,'t')}${w.sF[i]>0.1?bar('Hemmed in (circumscription)',s.circE[i],1,'t'):''}${s.car[i]>0.1?bar('Caravan traffic',s.car[i],1,'t'):''}</div>`;
      h+=`<h3 class="sec">City defenses and workshops</h3><dl class="kv"><dt>City defense strength</dt><dd>${Math.round(cityWallStrength(i)*100)} / 100</dd><dt>City wall condition</dt><dd>${Math.round(s.cityWallHealth[i]*100)}%</dd><dt>Engineering knowledge</dt><dd>${Math.round(s.engineeringKnowledge[i]*100)} / 100</dd><dt>Built granaries</dt><dd>${Math.round(s.granaries[i]*100)} / 100</dd><dt>Arms and tools available</dt><dd>${Math.round(armsAccess(i)*100)}%</dd><dt>Labor in civic projects</dt><dd>${Math.round(s.civicLabor[i]*100)}%</dd>${s.ruralPatron[i]&&s.pols[s.ruralPatron[i]]?`<dt>Rural protection agreement</dt><dd>${lp(s.pols[s.ruralPatron[i]])}, ${Math.round(s.ruralInfluence[i]*100)}% established</dd>`:''}</dl>`;
      h+=`<h3 class="sec">Settlement and livelihoods</h3><dl class="kv"><dt>Town residents</dt><dd>${fmtN(s.urban[i])}</dd><dt>Main urban activity</dt><dd>${CITY_ROLES[s.cityRole[i]]}</dd><dt>Built housing</dt><dd>${fmtN(s.housing[i])} people</dd><dt>Water supply</dt><dd>${fmtN(urbanWaterCapacity(i))} people</dd><dt>Urban livelihoods</dt><dd>${fmtN(s.urbanJobs[i])} people</dd><dt>Sanitation</dt><dd>${Math.round(s.sanitation[i]*100)}%</dd><dt>Grain delivered from nearby farms</dt><dd>${fmtN(s.localFoodImports[i])} annual rations</dd></dl>`;
      if(p&&s.delegationOwner[i]===p.id)h+=`<h3 class="sec">Local government</h3><dl class="kv"><dt>Retained local officials</dt><dd>${fmtN(s.localStaff[i])}</dd><dt>Local garrison</dt><dd>${fmtN(s.localGuard[i])}</dd><dt>Local payroll funded</dt><dd>${Math.round(s.localPayroll[i]*100)}%</dd><dt>Confidence in the bargain</dt><dd>${Math.round(s.delegationTrust[i]*100)}%</dd></dl>`;
      if(s.serviceEstates[i]>0.001)h+=`<h3 class="sec">Military land grants</h3><dl class="kv"><dt>Resident service troops</dt><dd>${fmtN(s.serviceTroops[i])}</dd><dt>Service estate influence</dt><dd>${Math.round(s.serviceEstates[i]*100)}%</dd><dt>Hereditary control of grants</dt><dd>${Math.round(s.hereditaryEstates[i]*100)}%</dd><dt>Years since establishment</dt><dd>${s.estateAge[i]}</dd></dl>`;
      if(p){const agreements=p.compacts.filter(t=>t.durable&&!t.done&&t.cell===i);if(agreements.length)h+=`<h3 class="sec">Local settlement agreements</h3>${agreements.slice(0,6).map(t=>`<p class="note">${fmtN(t.people)} people · ${esc(t.mode==='farm'?'farming':t.mode==='urban'?'town residence':'pasture and service')} · since ${fy(t.since)} · confidence ${Math.round(t.loyalty*100)}%${t.broken?' · promises disputed':''}</p>`).join('')}`}
      h+=`<h3 class="sec">Known techniques</h3><div class="bars">${TECH.map((T,k)=>s.tk[k][i]>0.05?bar(T.n,s.tk[k][i],1,'t'):'').join('')||'<div class="note">Foraging only.</div>'}</div>`;
      h+=`<h3 class="sec">Transport and local power</h3><dl class="kv">${ANIMALS.map((a,k)=>`<dt>${a.n}</dt><dd>${fmtN(s.animals[k][i])}</dd>`).join('')}<dt>Available traction</dt><dd>${Math.round(s.traction[i]*100)} / 100</dd><dt>Pack transport</dt><dd>${Math.round(s.pack[i]*100)} / 100</dd><dt>Riding and remounts</dt><dd>${Math.round(s.mounts[i]*100)} / 100</dd><dt>Local civic identity</dt><dd>${Math.round(s.cityIdentity[i]*100)} / 100</dd><dt>Landholders' stake</dt><dd>${Math.round(s.eliteStake[i]*100)} / 100</dd><dt>Landholders' loyalty</dt><dd>${Math.round(s.eliteLoyalty[i]*100)} / 100</dd><dt>Coastal crop investment</dt><dd>${Math.round(s.orchards[i]*100)} / 100</dd><dt>Crop system</dt><dd>${cropSystem(i).kind<0?'No established crop package':CROPS[cropSystem(i).kind].n}</dd><dt>Local crop suitability</dt><dd>${Math.round(farmSuit(i)*100)} / 100</dd><dt>Terraces</dt><dd>${Math.round(s.terraces[i]*100)} / 100</dd><dt>Local waterworks</dt><dd>${Math.round(s.waterworks[i]*100)} / 100</dd><dt>Regional public stores</dt><dd>${fmtN(s.depot[i])} annual rations</dd><dt>Frontier insecurity</dt><dd>${Math.round(frontierRisk(i)*100)} / 100</dd><dt>Damage from raids</dt><dd>${Math.round(s.raidDamage[i]*100)} / 100</dd><dt>Wall condition</dt><dd>${Math.round(s.wallHealth[i]*100)} / 100</dd><dt>Open breaches</dt><dd>${Math.round(s.wallBreach[i]*100)} / 100</dd><dt>Resource recovery</dt><dd>${Math.round(s.rangeStock[i]*100)}%</dd><dt>City damage</dt><dd>${Math.round(s.cityDamage[i]*100)}%</dd><dt>Urban viability</dt><dd>${Math.round(citySubsistence(i)*100)}%</dd><dt>Adult male share</dt><dd>${Math.round(s.maleShare[i]*100)}%</dd></dl>`;
    }
  }else if(t==='pol'){
    const o=s.pols[id],R=o.ruler,c=o.capital,city=s.city[c]>=0?s.cities[s.city[c]]:null;
    h+=`<div class="kind">${o.alive?(o.kind==='horde'?'Nomad '+o.tier.toLowerCase():o.tier):'Fallen state'}${o.island?' · island realm':''}${o.conqDyn?' · conquest dynasty':''}</div><h2 class="name">${esc(o.alive?o.full:o.peak)}</h2>`;
    h+=`<p class="sub2">${originText(o)}${o.alive?'':` · fell ${fy(o.died)}${o.lastBy&&s.pols[o.lastBy]?` to the ${lp(s.pols[o.lastBy])}`:''}`}</p>`;
    h+=spark(o.hist);
    if(o.alive){
      const age=s.year-R.birth;
      h+=`<h3 class="sec">Ruler</h3><p style="margin:0">${R.fig!=null?lf(s.figs[R.fig])+', '+esc(titleOf(o,R)):esc(cap(rulerName(o)))}, age ${age}, of the House of ${esc(o.dyn)}${o.gen>1?` (${o.gen} generations)`:''}. Reigning since ${fy(R.since)}; ${R.conq} provinces conquered.</p>`;
      h+=`<div class="bars" style="margin-top:8px">${bar('Aggression',R.aggr,1,'t')}${bar('Competence',R.comp,1,'t')}${bar('Charisma',R.char,1,'t')}</div>`;
      const allies=o.allies.map(q=>s.pols[q]).filter(Boolean),en=[...o.enemies.keys()].map(q=>s.pols[q]).filter(Boolean),wars=[...new Set(o.enemies.values())].map(k=>s.wars[k]);
      const tribs=s.alive.map(k=>s.pols[k]).filter(p=>p.over===id);
      h+=`<h3 class="sec">Realm</h3><dl class="kv"><dt>Provinces</dt><dd>${o.cells} (peak ${o.maxCells})</dd>${o.shape?`<dt>Extent at peak</dt><dd>${o.shape.ew.toLocaleString()} km east–west × ${o.shape.ns.toLocaleString()} km north–south</dd>`:''}${o.fortN?`<dt>Fortified provinces</dt><dd>${o.fortN}</dd>`:''}<dt>Population</dt><dd>${fmtN(o.pop)}</dd><dt>Capital</dt><dd>${city?esc(city.name):'–'}</dd><dt>Social complexity</dt><dd>${o.spc.toFixed(1)} / 10</dd>${o.cplx!=null&&o.kind==='state'?`<dt>Cost of government</dt><dd>${Math.round((o.burden||0)*100)}% of what it can tax${(o.burden||0)>1?' — more than it returns':''}</dd><dt>Treasury</dt><dd>${o.treas>0.5?'full':o.treas>0?'solvent':o.treas>-1?'in debt':'bankrupt'}</dd><dt>Inequality</dt><dd>${Math.round(o.ineq*100)} / 100</dd><dt>Farming</dt><dd>${(o.plN||0)>0.5*(o.cells-(o.wasteN||0))?'plough':'hoe'} agriculture</dd>${o.wasteN?`<dt>Claimed wasteland</dt><dd>${o.wasteN} provinces</dd>`:''}`:''}<dt>Era</dt><dd>${ERAS[eraOf(c)]}</dd><dt>Faith of the realm</dt><dd>${o.rel>=0?lr(s.rels[o.rel]):'folk religion'}</dd><dt>Core people</dt><dd>${s.eths[o.core]?le(s.eths[o.core]):'?'}</dd><dt>Land use</dt><dd>${(o.press*100).toFixed(0)}% of capacity</dd><dt>Asabiya</dt><dd>${o.S.toFixed(2)}</dd><dt>Elites vs positions</dt><dd>${(o.E/etOf(o)).toFixed(2)}×</dd><dt>Communication horizon</dt><dd>${o.h.toFixed(1)} travel days</dd><dt>Civil wars</dt><dd>${o.crises}</dd></dl>`;
      h+=`<h3 class="sec">Institutions and resources</h3><p class="note">${esc(o.gov)} government. Institutions need trained people, provisions and maintained connections.</p><div class="bars">${bar('Central authority',o.central,1,'t')}${bar('Administrative skill',o.bureau,1,'t')}${bar('Public trust',o.trust,1,'g')}${bar('Negotiated rights',o.rights,1,'t')}${bar('Succession continuity',o.succession,1,'t')}${bar('Service reliability',o.health,1,'g')}${bar('Accumulated strain',o.strain,1)}</div><dl class="kv"><dt>Public provisions</dt><dd>${(12*o.grain/Math.max(1,o.pop)).toFixed(1)} population-months</dd><dt>Annual collections</dt><dd>${fmtN(o.collected||0)} rations</dd><dt>Payroll funded</dt><dd>${Math.round(o.payroll*100)}%</dd><dt>Trained officials</dt><dd>${fmtN(o.staff)}</dd><dt>Available troops</dt><dd>${fmtN(o.army)}</dd><dt>Maintained ships</dt><dd>${Math.round(o.navy)}</dd><dt>Campaigns this year</dt><dd>${o.campaigns||0}</dd><dt>Durable reforms</dt><dd>${o.reforms.length}</dd></dl>`;
      if(o.pastoralOrigin)h+=`<h3 class="sec">Pastoral government</h3><dl class="kv"><dt>Government</dt><dd>${o.hybridGovernment?'Mixed pastoral and agrarian':o.kind==='horde'?'Mobile confederation':'Territorial administration'}</dd><dt>Administrative practice</dt><dd>${Math.round(o.pastoralPractice*100)}%</dd>${o.kind==='horde'?`<dt>Revenue from farming districts</dt><dd>${Math.round(o.agrarianRevenue*100)}%</dd><dt>Mixed administration established</dt><dd>${Math.round(Math.min(1,o.settlementProgress)*100)}%</dd>`:''}${o.submission&&s.pols[o.over]?`<dt>Overlord</dt><dd>${lp(s.pols[o.over])}</dd><dt>Submission confidence</dt><dd>${Math.round(o.submission.loyalty*100)}%</dd>`:''}</dl>`;
      h+=`<h3 class="sec">Reach and continuity</h3><dl class="kv"><dt>Message round trip</dt><dd>${o.responseDays.toFixed(1)} days, weighted average</dd><dt>Connected water routes</dt><dd>${Math.round(o.corridor*100)} / 100</dd><dt>Military preparedness</dt><dd>${Math.round(o.preparedness*100)} / 100</dd><dt>Crisis experience</dt><dd>${Math.round(o.crisisMemory*100)} / 100</dd><dt>Years without conflict or expansion</dt><dd>${o.peaceYears}</dd><dt>Unintegrated recent conquests</dt><dd>${Math.round(o.recentShare*100)}% of population</dd><dt>Conquest obligations</dt><dd>${o.conquestLoad.toFixed(2)}</dd><dt>Settlement agreements</dt><dd>${o.compacts.length}</dd><dt>Civic debt outstanding</dt><dd>${fmtN(s.creditLoans.filter(l=>!l.done&&l.borrower===o.id).reduce((n,l)=>n+l.principal,0))} rations</dd><dt>Urban viability</dt><dd>${Math.round((o.viability||citySubsistence(c))*100)}%</dd><dt>Regional provisions</dt><dd>${fmtN(o.localStores)}</dd><dt>Conquest law</dt><dd>${esc(o.warLaw)}</dd><dt>Lethal collective reprisals</dt><dd>${o.collectiveReprisals?'Permitted':'Prohibited'}</dd><dt>Protection agreements</dt><dd>${o.protectionPacts.filter(p=>!p.broken).length}</dd><dt>Coalition momentum</dt><dd>${Math.round(o.momentum*100)} / 100</dd>${o.kind==='horde'?`<dt>Member clans</dt><dd>${o.clanTerms.size}</dd><dt>Raiding experience</dt><dd>${Math.round(o.raidSkill*100)} / 100</dd>`:''}</dl>`;

      if(o.kind==='state')h+=`<h3 class="sec">Expansion and local government</h3><dl class="kv"><dt>Delegated provinces</dt><dd>${o.delegatedCells||0}</dd><dt>People under local councils</dt><dd>${fmtN(o.delegatedPop||0)}</dd><dt>Retained local officials</dt><dd>${fmtN(o.localOfficials||0)}</dd><dt>Customary rights</dt><dd>${Math.round(o.customaryRights*100)}%</dd><dt>Seasonal troops mustered</dt><dd>${fmtN(o.mustered||0)}</dd><dt>Campaign objective</dt><dd>${o.campaign?L_('cell',o.campaign.to,s.city[o.campaign.to]>=0?s.cities[s.city[o.campaign.to]].name:'Border province'):'none'}</dd><dt>Military household settlements</dt><dd>${s.militarySettlements.filter(t=>t.pol===o.id&&s.pol[t.cell]===o.id).length}</dd></dl>`;
      h+=`<h3 class="sec">Civic development</h3><dl class="kv"><dt>Cities funding invention</dt><dd>${o.researchCities||0}</dd><dt>Current specialist funding</dt><dd>${fmtN(o.researchFunded||0)} rations</dd><dt>Local governing agreements</dt><dd>${(o.civicBargains||[]).filter(b=>s.pol[b.cell]===o.id).length}</dd>${o.civicUnion?`<dt>Negotiated integration</dt><dd>${Math.round(o.civicUnion.progress*100)}%, ${o.civicUnion.years} supported years</dd>`:''}${o.kind==='horde'?`<dt>Generational coalition strain</dt><dd>${Math.round(o.coalitionFatigue*100)}%</dd><dt>Breakup risk per five years</dt><dd>${((o.breakupRisk||0)*100).toFixed(1)}%</dd>`:''}</dl>`;
      h+=`<h3 class="sec">Political supporters</h3><div class="bars">${Object.entries(o.groups).map(([name,g])=>bar(cap(name)+' support',g.loyalty,1,'t')).join('')}</div>`;
      h+=`<h3 class="sec">Relations</h3><dl class="kv"><dt>Allies</dt><dd>${allies.length?allies.map(lp).join(', '):'none'}</dd><dt>At war with</dt><dd>${en.length?en.map(lp).join(', '):'no one'}</dd>${wars.length?`<dt>Wars</dt><dd>${wars.map(lw).join(', ')}</dd>`:''}${o.over&&s.pols[o.over]?`<dt>Pays tribute to</dt><dd>${lp(s.pols[o.over])}</dd>`:''}${tribs.length?`<dt>Tributaries</dt><dd>${tribs.map(lp).join(', ')}</dd>`:''}</dl>`;
      if(o.why){const W2=o.why;
        h+=`<h3 class="sec">Instability ${o.psi.toFixed(2)}</h3><div class="bars">${bar('Population pressure',W2.pP,2)}${bar('Elite overproduction',W2.pE,2)}${bar('Weak cohesion',W2.pS,2)}${bar('Overextension',W2.pX,2)}${bar('Ruler',W2.pR,2)}${bar('Cost of government',W2.pT||0,2)}${bar('Fiscal crisis',W2.pF||0,2)}${bar('Inequality',W2.pQ||0,2)}${bar('Recent shocks',W2.sh,2)}</div>`;
        const cs=topCauses(W2),risk=(o.civilRisk||0)*100;
        h+=`<div class="verdict">${cs.length?`Main strains: ${esc(cs.join(' and '))}.`:'No major strains.'} Chance of organized civil war this year: ${risk<0.1?'under 0.1':risk.toFixed(1)}%.</div>`}
    }else{
      h+=`<h3 class="sec">At its height</h3><dl class="kv"><dt>Provinces</dt><dd>${o.maxCells}</dd><dt>Population</dt><dd>${fmtN(o.maxPop)}</dd><dt>Civil wars</dt><dd>${o.crises}</dd></dl>`}
    h+=`<h3 class="sec">Family tree</h3>`+treeHTML(o);
    if(o.succ&&o.succ.length)h+=`<p class="note">Its lands passed to the ${o.succ.map(k=>s.pols[k]).filter(Boolean).map(lp).join(', ')}.</p>`;
    if(o.works.length||o.golds.length){h+=`<h3 class="sec">Culture</h3>${o.alive?`<div class="bars">${bar('Cultural output',o.cult,1,'g')}</div>`:''}`;
      if(o.golds.length)h+=`<p class="note">Flowerings: ${o.golds.map(g=>fy(g[0])+'–'+fy(g[1])).join('; ')}.</p>`;
      if(o.works.length)h+=`<ul class="deeds" style="margin-top:6px">${o.works.slice(-8).map(x=>`<li><span>${fy(x.y)}</span><div>${cap(esc(x.name))}${x.fig!=null?' · '+lf(s.figs[x.fig]):''}</div></li>`).join('')}</ul>`}
    else if(o.alive)h+=`<h3 class="sec">Culture</h3><div class="bars">${bar('Cultural output',o.cult,1,'g')}</div>`;
    const rl=o.rulers.filter(r=>r.fig!=null).slice(-12);
    if(rl.length)h+=`<h3 class="sec">Notable past rulers</h3><p style="margin:0">${rl.map(r=>lf(s.figs[r.fig])+` <span class="sub2">(${fy(r.from)}–${fy(r.to)})</span>`).join(', ')}</p>`;
    h+=`<h3 class="sec">Chronicle</h3>`+chronList(chronFor(e=>refHas(e,'pol',id)));
  }else if(t==='eth'){
    const e=s.eths[id],chain=[];let q=e.parent;while(q>=0&&chain.length<6){chain.push(s.eths[q]);q=s.eths[q].parent}
    const L=e.lang.lex;
    h+=`<div class="kind">People${e.alive?'':' (vanished)'} · ${esc(e.lang.style)}-like speech</div><h2 class="name">${esc(e.name)}</h2><p class="sub2">Emerged ${fy(e.born)} · family of the ${le(s.eths[e.fam])}${e.parent2>=0?` · born of the ${le(s.eths[e.parent])} and the ${le(s.eths[e.parent2])} mingling`:''}</p>`;
    h+=`<h3 class="sec">Lineage</h3><p class="lineage">${[e,...chain].map((x,k)=>k?le(x):'<b>'+esc(x.name)+'</b>').join(' ← ')}</p>`;
    if(e.kids.length)h+=`<p class="lineage">Daughter peoples: ${e.kids.slice(0,16).map(k=>le(s.eths[k])).join(', ')}</p>`;
    h+=`<h3 class="sec">Words</h3><div class="lex"><span>homeland <b>${esc(L.place)}</b></span>${['god','sun','river','sea','mountain','mother','grain'].map(k=>`<span>${k} <b>${esc(L[k])}</b></span>`).join('')}</div>`;
    const states=s.alive.map(k=>s.pols[k]).filter(o=>o.core===id);
    h+=`<h3 class="sec">Today</h3><dl class="kv"><dt>Provinces</dt><dd>${e.cells}</dd><dt>Population</dt><dd>${fmtN(e.pop)} (peak ${fmtN(e.peak)})</dd><dt>States they lead</dt><dd>${states.length?states.slice(0,8).map(lp).join(', '):'none'}</dd></dl>`;
    h+=`<h3 class="sec">Chronicle</h3>`+chronList(chronFor(x=>refHas(x,'eth',id)));
  }else if(t==='rel'){
    const R=s.rels[id],f=s.figs[R.founder];
    h+=`<div class="kind">${R.kind==='universal'?'Universal faith':'Ethnic faith'}${R.alive?'':' (extinct)'}</div><h2 class="name">${esc(R.name)}</h2><p class="sub2">Founded ${fy(R.born)} by ${lf(f)}${R.parent>=0?`, breaking with ${lr(s.rels[R.parent])}`:''}</p>`;
    const hc=s.city[R.holy]>=0?s.cities[s.city[R.holy]].name:'—',hp=s.pol[R.holy]?s.pols[s.pol[R.holy]]:null;
    h+=`<dl class="kv" style="margin-top:10px"><dt>Holy city</dt><dd>${esc(hc)}${hp?` (held by ${lp(hp)})`:''}</dd><dt>Centralization</dt><dd>${(R.cent*100).toFixed(0)}%${R.councils?` · ${R.councils} council${R.councils>1?'s':''}`:''}</dd><dt>Followers</dt><dd>${fmtN(R.pop)} in ${R.cells} provinces</dd><dt>Peak</dt><dd>${R.peak} provinces</dd><dt>Missionary zeal</dt><dd>${(R.miss*100).toFixed(0)}%</dd><dt>Open to</dt><dd>${R.kind==='universal'?'every people':'its own family of peoples'}</dd></dl>`;
    const st=R.states.map(k=>s.pols[k]).filter(Boolean);
    if(st.length)h+=`<h3 class="sec">States that adopted it</h3><p style="margin:0">${st.slice(-20).map(lp).join(', ')}${st.length>20?` and ${st.length-20} more`:''}</p>`;
    if(R.kids.length)h+=`<h3 class="sec">Schisms</h3><p style="margin:0">${R.kids.map(k=>lr(s.rels[k])).join(', ')}</p>`;
    h+=`<h3 class="sec">Chronicle</h3>`+chronList(chronFor(x=>refHas(x,'rel',id)));
  }else if(t==='fig'){
    const f=s.figs[id],e=f.eth>=0?s.eths[f.eth]:null,p=f.pol?s.pols[f.pol]:null;
    const label={ruler:'Ruler',founder:'Founder',usurper:'Usurper',prophet:'Prophet',reformer:'Reformer',sage:'Sage'}[f.kind]||'Figure';
    h+=`<div class="kind">${label}</div><h2 class="name">${esc(f.name)}</h2><p class="sub2">${esc(f.title)}${p?` · ${lp(p)}`:''}</p>`;
    h+=`<dl class="kv" style="margin-top:10px"><dt>Born</dt><dd>${fy(f.born)}</dd><dt>Died</dt><dd>${f.died&&f.died<=s.year?fy(f.died):'living'}</dd>${e?`<dt>People</dt><dd>${le(e)}</dd>`:''}${f.rel>=0?`<dt>Faith founded</dt><dd>${lr(s.rels[f.rel])}</dd>`:''}${f.conq?`<dt>Provinces conquered</dt><dd>${f.conq}</dd>`:''}${f.realm?`<dt>Largest realm ruled</dt><dd>${f.realm} provinces</dd>`:''}<dt>Renown</dt><dd>${figScore(f).toFixed(0)}</dd></dl>`;
    h+=`<h3 class="sec">Deeds</h3><ul class="deeds">${f.deeds.map(d=>`<li><span>${fy(d[0])}</span><div>${linkify(d[1],d[2])}</div></li>`).join('')}</ul>`;
    if(f.rel>=0){const R=s.rels[f.rel];h+=`<p class="note">${esc(R.name)} later reached ${R.peak} provinces${R.states.length?` and was adopted by ${R.states.length} state${R.states.length>1?'s':''}`:''}.</p>`}
  }else if(t==='plague'){
    const o=s.outbreaks[id],e=s.eth[o.origin]>=0?s.eths[s.eth[o.origin]]:null;
    h+=`<div class="kind">Epidemic${o.virgin?' · virgin soil':''}</div><h2 class="name">The ${esc(o.name)}</h2><p class="sub2">${fy(o.year)}${o.done?` – ${fy(o.end)}`:' · still spreading'}</p>`;
    h+=`<dl class="kv" style="margin-top:10px"><dt>Deaths</dt><dd>${fmtN(o.deaths)}</dd><dt>Provinces reached</dt><dd>${o.cells}</dd><dt>Disease family</dt><dd>${o.pathogen==null?'Legacy outbreak':PATHOGENS[o.pathogen].n}</dd><dt>Livestock deaths</dt><dd>${fmtN(o.animalDeaths||0)}</dd><dt>Case severity</dt><dd>${(o.vir*100).toFixed(0)}% of resolved infections before hardship and care modifiers</dd>${o.virgin&&o.from>=0?`<dt>Brought by</dt><dd>${le(s.eths[o.from])}</dd>`:''}</dl>`;
    h+=`<h3 class="sec">Spread</h3><canvas class="mini" id="plaguemap" width="${W*2}" height="${H*2}"></canvas><p class="note">Darker red reached later. The ring marks where it began.</p>`;
    const hit=(Array.isArray(o.hit)?o.hit:[...o.hit]).map(k=>s.pols[k]).filter(p=>p&&p.maxCells>=8).sort((a,b)=>b.maxCells-a.maxCells);
    if(hit.length)h+=`<h3 class="sec">States struck</h3><p style="margin:0">${hit.slice(0,16).map(lp).join(', ')}</p>`;
  }else if(t==='mig'){
    const M=s.migs[id],e=s.eths[M.eth];
    h+=`<div class="kind">${M.kind==='horde'?'Nomad migration':'Migration'}${M.done?'':' · on the move'}</div><h2 class="name">The ${esc(M.name)}</h2><p class="sub2">${fy(M.start)}${M.done?` – ${fy(M.end)}`:''} · ${le(e)}</p>`;
    h+=`<p style="margin:8px 0 0">${linkify(M.startTxt||'',[RM(M),RE(e)])}</p>`;
    h+=`<dl class="kv" style="margin-top:10px"><dt>People</dt><dd>${fmtN(M.pop)}${M.done?'':' now'}</dd><dt>Distance</dt><dd>${M.path.length} provinces crossed</dd><dt>Settlers left along the route</dt><dd>${fmtN((M.settled||[]).reduce((n,g)=>n+g.pop,0))}</dd><dt>Groups in the coalition</dt><dd>${M.groups.length}</dd><dt>Transport animals</dt><dd>${fmtN(M.animals.reduce((n,v)=>n+v,0))}</dd><dt>Experience</dt><dd>${Math.round(M.experience*100)} / 100</dd>${M.prev>=0?`<dt>Set in motion by</dt><dd>${lm_(s.migs[M.prev])}</dd>`:''}${M.broke.length?`<dt>Broke into</dt><dd>${M.broke.map(k=>s.pols[k]).filter(Boolean).map(lp).join(', ')}</dd>`:''}${M.done?`<dt>Outcome</dt><dd style="text-align:left;font-family:var(--f-ui)">${M.settledPol&&s.pols[M.settledPol]?`Founded the ${lp(s.pols[M.settledPol])}`:esc(cap(M.result))}</dd>`:''}</dl>`;
    const next=s.migs.filter(x=>x.prev===M.id);if(next.length)h+=`<h3 class="sec">Peoples it set moving</h3><p style="margin:0">${next.map(lm_).join(', ')}</p>`;
    h+=`<h3 class="sec">Route</h3><canvas class="mini" id="migmap" width="${W*2}" height="${H*2}"></canvas>`;
    h+=`<h3 class="sec">Chronicle</h3>`+chronList(chronFor(x=>refHas(x,'mig',id)));
  }else if(t==='war'){
    const war=s.wars[id],A=war.a.map(k=>s.pols[k]),D=war.d.map(k=>s.pols[k]);
    h+=`<div class="kind">${war.civil?'Civil war':'War'}</div><h2 class="name">${esc(cap(war.name))}</h2><p class="sub2">${fy(war.start)}${war.end?` – ${fy(war.end)}`:' · ongoing'}</p>`;
    h+=`<dl class="kv" style="margin-top:10px"><dt>${war.civil?'Rebels':'Attackers'}</dt><dd>${A.map(lp).join(', ')}</dd><dt>${war.civil?'Old regime':'Defenders'}</dt><dd>${D.map(lp).join(', ')}</dd><dt>Provinces taken</dt><dd>${war.gA} by ${war.civil?'rebels':'attackers'}, ${war.gD} by ${war.civil?'the regime':'defenders'}</dd>${war.end?`<dt>Outcome</dt><dd style="text-align:left;font-family:var(--f-ui)">${esc(cap(war.outcome))}</dd>`:''}</dl>`;
    if(war.why)h+=`<div class="verdict">${esc(war.why)}</div>`;
    h+=`<h3 class="sec">Chronicle</h3>`+chronList(chronFor(x=>refHas(x,'war',id)));
  }
  }catch(err){h+=`<div class="note">This page could not be drawn: ${esc(err.message)}</div>`}
  el.innerHTML=h;
  const b=$('pgback');if(b)b.onclick=()=>{ui.page=ui.stack.pop()||null;renderPage();ui.dirty=true};
  drawSparks(el);
  if(t==='plague')drawPlagueMap(id);
  if(t==='mig')drawMigMap(id);
}
function originText(o){const s=S,g=o.origin||{},from=g.from&&s.pols[g.from];
  switch(g.type){
    case'local civic':return`Founded ${fy(o.born)} by local farming and market communities`;
    case'rebellion':return`Founded ${fy(o.born)} in a revolt against the ${from?lp(from):'old regime'}${g.why?' · '+esc(g.why.replace(/\.$/,'')):''}`;
    case'migration':{const M=s.migs[g.mig];return`Founded ${fy(o.born)} by the ${M?lm_(M):'migrants'}${from?` in the lands of the ${lp(from)}`:''}`}
    case'restoration':return`Founded ${fy(o.born)} as a restoration of the fallen ${from?lp(from):'empire'}`;
    default:{const e=s.eths[g.people!=null?g.people:o.core];return`${o.kind==='horde'?'Formed':'Founded'} ${fy(o.born)} ${o.kind==='horde'?'when the clans':'among the'} ${e?le(e):'people'}${o.kind==='horde'?' united':''}${g.settled?` · settled as rulers of farmland in ${fy(g.settled)}`:''}`}
  }}
function treeHTML(o){const s=S,anc=[];let p=o;const seen=new Set([o.id]);
  for(let k=0;k<8;k++){const g=p.origin||{};const f=g.type==='migration'?null:g.from&&s.pols[g.from];if(!f||seen.has(f.id))break;seen.add(f.id);anc.push([f,g.type]);p=f}
  let h='<div class="lineage">';
  if(anc.length){h+=anc.slice().reverse().map(([f,ty])=>`${lp(f)} <span>${ty==='restoration'?'restored as':'gave rise to'}</span>`).join(' → ')+' → '}
  h+=`<b>${esc(o.alive?o.full:o.peak)}</b></div>`;
  const kids=o.kids.map(k=>s.pols[k]).filter(p=>p&&p.maxCells>=4);
  if(kids.length){h+='<ul class="deeds" style="margin-top:6px">'+kids.slice(0,14).map(k=>{const gk=k.kids.map(x=>s.pols[x]).filter(p=>p&&p.maxCells>=4);return`<li><span>${fy(k.born)}</span><div>${lp(k)}${k.alive?'':' (fallen)'}${gk.length?`<br><span class="sub2">→ ${gk.slice(0,6).map(lp).join(', ')}${gk.length>6?' …':''}</span>`:''}</div></li>`}).join('')+'</ul>'+(kids.length>14?`<p class="note">and ${kids.length-14} more.</p>`:'')}
  else h+='<p class="note">No states have broken away from it.</p>';
  return h}
function drawMigMap(id){
  const cv=$('migmap');if(!cv)return;const ctx=cv.getContext('2d'),M=S.migs[id];ctx.drawImage(baseCv,0,0,cv.width,cv.height);
  const sx=cv.width/W,sy=cv.height/H;ctx.strokeStyle='#ffc45a';ctx.lineWidth=2.5;ctx.beginPath();let px=null;
  for(const c of M.path){const x=(WD.cxA[c]+0.5)*sx,y=(WD.cyA[c]+0.5)*sy;if(px!==null&&Math.abs(x-px)<cv.width/2)ctx.lineTo(x,y);else ctx.moveTo(x,y);px=x}ctx.stroke();
  const a=M.path[0],b=M.path[M.path.length-1];ctx.fillStyle='#fff';ctx.beginPath();ctx.arc((WD.cxA[a]+0.5)*sx,(WD.cyA[a]+0.5)*sy,4,0,7);ctx.fill();ctx.fillStyle='#ffc45a';ctx.beginPath();ctx.arc((WD.cxA[b]+0.5)*sx,(WD.cyA[b]+0.5)*sy,5,0,7);ctx.fill();
}
function drawPlagueMap(id){
  const cv=$('plaguemap');if(!cv)return;const ctx=cv.getContext('2d'),o=S.outbreaks[id];
  ctx.imageSmoothingEnabled=true;ctx.drawImage(baseCv,0,0,cv.width,cv.height);
  const maxT=Math.max(1,...o.spread.map(p=>p[0])),sx=cv.width/W,sy=cv.height/H;
  for(const [t,i] of o.spread){const f=t/maxT;ctx.fillStyle=`rgba(${Math.round(240-110*f)},${Math.round(70-50*f)},${Math.round(60-40*f)},.85)`;ctx.fillRect(WD.cxA[i]*sx,WD.cyA[i]*sy,Math.ceil(sx),Math.ceil(sy))}
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc((WD.cxA[o.origin]+0.5)*sx,(WD.cyA[o.origin]+0.5)*sy,7,0,7);ctx.stroke();
}

/* ---------- chronicle pane ---------- */
function buildFilters(){
  $('filters').innerHTML=Object.entries(TYPES).map(([k,[l,c]])=>`<button class="chip" type="button" data-k="${k}" aria-pressed="${ui.filters.has(k)}"><i style="background:${c}"></i>${l}</button>`).join('');
}
$('filters').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;const k=b.dataset.k;ui.filters.has(k)?ui.filters.delete(k):ui.filters.add(k);b.setAttribute('aria-pressed',ui.filters.has(k));renderChron(true)});
let qTimer=0;$('q').addEventListener('input',e=>{clearTimeout(qTimer);qTimer=setTimeout(()=>{ui.q=e.target.value.trim().toLowerCase();renderChron(true)},150)});
function renderChron(force){
  if(!S)return;const c=S.chron,key=c.length+'|'+ui.q+'|'+[...ui.filters].join();if(!force&&key===ui.lastChronKey)return;ui.lastChronKey=key;
  const q=ui.q,out=[];let total=0;
  for(let k=c.length-1;k>=0;k--){const e=c[k];if(!ui.filters.has(e.t))continue;if(q&&!e.txt.toLowerCase().includes(q)&&!(e.why&&e.why.toLowerCase().includes(q)))continue;total++;if(out.length<300)out.push(e)}
  $('entries').innerHTML=out.length?out.map(entryHTML).join('')+(total>out.length?`<div class="more">Showing the latest 300 of ${total} entries. Search or filter to narrow them down.</div>`:''):`<div class="empty">${q?'Nothing matches that search.':'Nothing recorded yet. Press Play.'}</div>`;
  const m=$('matches');
  if(q.length>=2){const s=S,hits=[];
    for(const o of s.pols)if(o&&(o.base.toLowerCase().includes(q))&&o.maxCells>=3)hits.push(['State',lp(o),o.maxCells]);
    for(const e of s.eths)if(e.name.toLowerCase().includes(q))hits.push(['People',le(e),e.cells+1]);
    for(const R of s.rels)if(R.name.toLowerCase().includes(q))hits.push(['Faith',lr(R),R.peak+50]);
    for(const f of s.figs)if(f.name.toLowerCase().includes(q))hits.push(['Figure',lf(f),figScore(f)]);
    for(const wr of s.wars)if(wr.notable&&wr.name.toLowerCase().includes(q))hits.push(['War',lw(wr),wr.gA+wr.gD]);
    for(const M of s.migs)if(M.logged&&M.name.toLowerCase().includes(q))hits.push(['Migration',lm_(M),M.pop/1e4]);
    for(const o of s.outbreaks)if(o.deaths>1e5&&o.name.toLowerCase().includes(q))hits.push(['Plague',L_('plague',o.id,'The '+o.name),o.deaths/1e5]);
    hits.sort((a,b)=>b[2]-a[2]);
    m.hidden=!hits.length;m.innerHTML=hits.slice(0,14).map(([k,l])=>`<span><span class="k">${k}</span>${l}</span>`).join('');
  }else m.hidden=true;
}
$('entries').addEventListener('click',e=>{const d=e.target.closest('.yr');if(!d)return;const c=+d.dataset.c;if(c>=0){openPage('cell',c);centerOn(c)}});

/* ---------- figures pane ---------- */
const FIGF=[['all','All'],['ruler','Rulers'],['faith','Prophets and reformers'],['founder','Founders and usurpers'],['sage','Sages']];
$('figfilters').innerHTML=FIGF.map(([k,l])=>`<button class="chip" type="button" data-k="${k}" aria-pressed="${k===ui.figFilter}">${l}</button>`).join('');
$('figfilters').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;ui.figFilter=b.dataset.k;for(const x of $('figfilters').children)x.setAttribute('aria-pressed',x===b);renderFigs()});
$('fq').addEventListener('input',e=>{ui.fq=e.target.value.trim().toLowerCase();renderFigs()});
function renderFigs(){
  if(!S)return;const ff=ui.figFilter,q=ui.fq;
  const list=S.figs.filter(f=>(ff==='all'||(ff==='ruler'&&f.kind==='ruler')||(ff==='faith'&&(f.kind==='prophet'||f.kind==='reformer'))||(ff==='founder'&&(f.kind==='founder'||f.kind==='usurper'))||(ff==='sage'&&f.kind==='sage'))&&(!q||f.name.toLowerCase().includes(q)||f.title.toLowerCase().includes(q)))
    .map(f=>[figScore(f),f]).sort((a,b)=>b[0]-a[0]).slice(0,120);
  const mx=list.length?list[0][0]:1;
  $('figlist').innerHTML=list.length?list.map(([sc,f])=>{const last=f.deeds[f.deeds.length-1];
    return`<div class="card" tabindex="0" data-id="${f.id}"><div class="cn">${esc(f.name)}</div><div class="cs">${fy(f.born)}${f.died&&f.died<=S.year?' – '+fy(f.died):''}</div><div class="cd">${esc(f.title)}${last?' · '+esc(last[1]):''}</div><div class="cbar"><i style="width:${(sc/mx*100).toFixed(0)}%"></i></div></div>`}).join(''):'<div class="empty">No one has made their mark yet.</div>';
}
$('figlist').addEventListener('click',e=>{const c=e.target.closest('.card');if(!c)return;const id=+c.dataset.id;openPage('fig',id);centerOn(entityCell('fig',id))});

/* ---------- plague pane ---------- */
$('plaguesort').innerHTML=[['deaths','Deadliest'],['time','Most recent']].map(([k,l])=>`<button class="chip" type="button" data-k="${k}" aria-pressed="${k===ui.plagueSort}">${l}</button>`).join('');
$('plaguesort').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;ui.plagueSort=b.dataset.k;for(const x of $('plaguesort').children)x.setAttribute('aria-pressed',x===b);renderPlagues()});
function renderPlagues(){
  if(!S)return;let list=S.outbreaks.filter(o=>o.deaths>1e5||(!o.done&&o.cells>20));
  list=ui.plagueSort==='deaths'?list.sort((a,b)=>b.deaths-a.deaths):list.sort((a,b)=>b.year-a.year);
  list=list.slice(0,100);const mx=Math.max(1,...list.map(o=>o.deaths));
  $('plaguelist').innerHTML=list.length?list.map(o=>{const e=S.eth[o.origin]>=0?S.eths[S.eth[o.origin]]:null;
    return`<div class="card" tabindex="0" data-id="${o.id}"><div class="cn">The ${esc(o.name)}</div><div class="cs">${fmtN(o.deaths)} dead</div><div class="cd">${fy(o.year)}${o.done?'':' · still spreading'} · ${o.cells} provinces${e?' · first among the '+esc(e.name):''}${o.virgin?' · virgin soil':''}</div><div class="cbar"><i style="width:${(o.deaths/mx*100).toFixed(0)}%"></i></div></div>`}).join(''):'<div class="empty">No great epidemics yet.</div>';
}
$('plaguelist').addEventListener('click',e=>{const c=e.target.closest('.card');if(!c)return;const id=+c.dataset.id;openPage('plague',id);centerOn(S.outbreaks[id].origin)});

/* ---------- checks pane ---------- */
let tuneRun=null;
function renderChecks(){
  const el=$('pane-check'),w=WD,s=S;if(!w)return;let h='';
  const g=w.grade;
  h+=`<h3 class="sec" style="margin-top:0">Climate model vs the real world</h3>`;
  if(g){
    h+=`<div class="score"><b>${(g.score*100).toFixed(0)}%</b><span>of land area falls in the same climate group as the observed Köppen map</span></div>`;
    h+=`<div class="bars" style="margin-top:10px">${g.per.map((p,k)=>p.tot?bar(KG_GROUPS[k],p.ok/p.tot,1,'g'):'').join('')}</div>`;
    h+=`<p class="note">${w.climateMeta?`The simulation uses ${esc(w.climateMeta.label||'imported numerical climate')}. The score above grades the separate synthetic generator; numerical observations are not altered to improve this score.`:w.fitted?`The model's climate is graded here. For the simulation itself, Earth's climate is nudged into the observed zones (${Math.round((w.fitChanged||0)/(HW*HH)*1000)/10}% of the map adjusted).`:'The simulation is running on the synthetic climate model.'} Use the Climate check map mode to see where the model goes wrong.</p>`;
  }else h+=`<p class="note">Grading needs a real-world reference, so it is available on Earth. On other worlds the climate comes from the model below.</p>`;
  h+=`<details class="more2" ${tuneRun?'open':''}><summary>Tune the synthetic climate generator</summary>`;
  h+=CDEF.map(([k,l,mn,mx,stp])=>`<div class="param"><label for="c-${k}">${l}</label><output id="co-${k}">${(+CL[k]).toFixed(stp<0.01?3:stp<1?2:0)}</output><input type="range" id="c-${k}" min="${mn}" max="${mx}" step="${stp}" value="${CL[k]}"></div>`).join('');
  h+=`<div class="actions"><button class="btn" id="btn-regrade" type="button" ${g?'':'disabled'}>Regrade</button><button class="btn" id="btn-autotune" type="button" ${g?'':'disabled'}>${tuneRun?'Stop':'Auto-tune'}</button><button class="btn" id="btn-climreset" type="button">Defaults</button><button class="btn" id="btn-climapply" type="button" ${w.climateMeta?'disabled':''}>Rebuild with generator settings</button></div><div class="status" id="clim-status">${tuneRun?tuneRun.msg:''}</div></details>`;
  if(w.isEarth&&s){
    h+=`<h3 class="sec">Territorial consolidation</h3><p class="note" style="margin-top:0">First kingdom holding at least 30% of each region's people. Legacy reference dates are approximate comparison anchors; they do not establish when government or urbanism first appeared.</p>`;
    h+=`<div class="tablewrap"><table class="table"><thead><tr><th>Region</th><th>Legacy anchor</th><th>This run</th><th></th></tr></thead><tbody>`;
    for(const R of w.regions){const f=s.regionFirst[R.k];const d=f?f.y-R.ref:null;
      h+=`<tr><td>${R.n}</td><td class="n">${fy(R.ref)}</td><td class="n">${f?fy(f.y):'not yet'}</td><td class="n ">${d==null?'':(d>0?'+':'')+d+' y'}</td></tr>`}
    h+=`</tbody></table></div>`;
    const mb=s.medBest;
    h+=`<h3 class="sec">Mediterranean</h3><p style="margin:0">Largest share of Mediterranean coastlands under one state so far: <b>${Math.round(mb.share*100)}%</b>${mb.y!=null?`, by the ${mb.pol&&s.pols[mb.pol]?lp(s.pols[mb.pol]):esc(mb.name)} in ${fy(mb.y)}`:''}. Rome held all of it around 117 CE.</p>`;
    const ch=s.chinaHist,cmax=ch.length?ch.reduce((a,b)=>b[1]>a[1]?b:a,[0,0,0]):null;
    const fc=s.farmCheck,fn=s.farmNow;
    if(fn){h+=`<h3 class="sec">Farming where there was none</h3><p class="note" style="margin-top:0">Share of peopled provinces farming in regions that had little or no farming in the real world by 1 CE (southern Africa got it from about 300 CE).</p><div class="tablewrap"><table class="table"><thead><tr><th>Region</th><th>1 CE</th><th>${fy(fn.y)}</th></tr></thead><tbody>${fn.res.map((r2,k)=>{const a=fc?fc.res[k].share:null;return`<tr><td>${r2.n}</td><td class="n ${a==null?'':a<0.1?'ok':'bad'}">${a==null?'–':Math.round(a*100)+'%'}</td><td class="n">${Math.round(r2.share*100)}%</td></tr>`}).join('')}</tbody></table></div>`}
    {let f0=0,f=0,salt=0,worn=0,farmN=0;for(const i of w.landIdx){f0+=w.forest0[i];f+=s.forest[i];if(s.salt[i]>0.3)salt++;if(s.farm[i]>0.5&&w.sF[i]>0.1&&s.pop[i]>=1){farmN++;if(s.fert[i]<0.6)worn++}}
      h+=`<h3 class="sec">Land and ecology</h3><dl class="kv"><dt>Forest still standing</dt><dd>${Math.round(f/Math.max(1,f0)*100)}% of the original cover</dd><dt>Worn-out farmland</dt><dd>${Math.round(worn/Math.max(1,farmN)*100)}% of farmed provinces</dd><dt>Salt-poisoned provinces</dt><dd>${salt}</dd><dt>Caravan routes in use</dt><dd>${s.routes.length}</dd></dl>`}
    {const sh=(s.shapes||[]).map(id=>s.pols[id]).filter(o=>o&&o.shape);if(sh.length){const ew=sh.filter(o=>o.shape.ew>o.shape.ns).length;const top=sh.slice().sort((a,b)=>b.shapeN-a.shapeN).slice(0,6);
      h+=`<h3 class="sec">Shape of empires</h3><p class="note" style="margin-top:0">Each large state measured at its peak, in kilometres. Most large Afro-Eurasian empires stretched east–west along one climate belt; the long north–south exceptions follow a river, a coast or a mountain range (Turchin, Adams &amp; Hall 2006).</p><p style="margin:0 0 6px">${sh.length} large states so far; <b>${Math.round(100*ew/sh.length)}%</b> longer east–west than north–south.</p><div class="tablewrap"><table class="table"><thead><tr><th>State</th><th>E–W</th><th>N–S</th></tr></thead><tbody>${top.map(o=>`<tr><td>${lp(o)}</td><td class="n">${o.shape.ew.toLocaleString()} km</td><td class="n">${o.shape.ns.toLocaleString()} km</td></tr>`).join('')}</tbody></table></div>`}}
    const sn=s.stateNow;if(sn){h+=`<h3 class="sec">Regional political coverage</h3><p class="note" style="margin-top:0">Share of peopled provinces under a city state, kingdom or empire. These regions contain varied and incompletely known political histories. Dense settlement, farming and sophisticated communal organization can exist outside centralized kingdoms; low state coverage is not a measure of social simplicity.</p><div class="tablewrap"><table class="table"><thead><tr><th>Region</th><th>${fy(sn.y)}</th></tr></thead><tbody>${sn.res.map(r2=>`<tr><td>${r2.n}</td><td class="n ${r2.share<0.25?'ok':'bad'}">${Math.round(r2.share*100)}%</td></tr>`).join('')}</tbody></table></div>`}
    if(s.socialNow)h+=`<h3 class="sec">Independent social measures</h3><p class="note">These describe population, urban settlement and administration separately. Political coverage and hierarchy are model observations, not claims of historical certainty.</p><div class="tablewrap"><table class="table"><thead><tr><th>Region</th><th>People</th><th>Largest town</th><th>Admin. levels</th><th>Organized outside states</th></tr></thead><tbody>${s.socialNow.map(x=>`<tr><td>${esc(x.name)}</td><td>${fmtN(x.population)}</td><td>${fmtN(x.largestSettlement)}</td><td>${x.adminLevels.toFixed(1)}</td><td>${Math.round(x.organizedAutonomous*100)}%</td></tr>`).join('')}</tbody></table></div>`;
    const material=societyMetrics();h+=`<h3 class="sec">Material and institutional checks</h3><dl class="kv"><dt>Food ledger discrepancy</dt><dd>${material.foodError.toExponential(1)} rations</dd><dt>Exchange links</dt><dd>${material.tradeEdges.toLocaleString()}</dd><dt>Organized autonomous provinces</dt><dd>${material.communities.toLocaleString()}</dd><dt>Mean service reliability</dt><dd>${Math.round(material.meanHealth*100)}%</dd></dl><p class="note">Earth uses modern numerical land climatology with simulated historical anomalies. This is a spatial baseline, not a reconstruction of the climate in 9000 BCE.</p>`;
    h+=`<h3 class="sec">China: unity and division</h3><p style="margin:0">Share of China's heartland held by its largest state. The dashed line is a rough reading of the real record.${cmax&&cmax[1]?` Peak so far: <b>${Math.round(cmax[1]*100)}%</b> in ${fy(cmax[0])}.`:''}</p><canvas class="sparkc" id="chinachart" style="height:120px"></canvas>`;
  }
  if(s&&s.epochs.length){h+=`<h3 class="sec">Climate epochs this run</h3><ul class="deeds">${s.epochs.map(e=>`<li><span>${fy(e.start)}</span><div>${e.k==='dry'?'Great drought in the '+esc(e.where):e.k==='cold'?'Cold epoch':'Warm epoch'}, ${e.end-e.start} years${e.k!=='dry'?` (${e.amp>0?'+':''}${e.amp.toFixed(1)} °C)`:''}</div></li>`).join('')}</ul>`}
  if(s){const M=s.orbM;h+=`<p class="note">Orbital monsoon boost now: ${Math.round(M*100)}% ${w.isEarth?'(on Earth it fades between about 4000 and 2500 BCE, drying the Sahara and Arabia)':''}.</p>`}
  el.innerHTML=h;
  if(w.isEarth&&s)drawChina();
  el.querySelectorAll('input[type=range]').forEach(inp=>inp.addEventListener('input',()=>{const k=inp.id.slice(2);CL[k]=+inp.value;const d=CDEF.find(x=>x[0]===k);$('co-'+k).textContent=(+CL[k]).toFixed(d[4]<0.01?3:d[4]<1?2:0)}));
  const st=$('clim-status');
  $('btn-regrade').onclick=()=>{st.textContent='Regrading…';setTimeout(()=>{const sc=quickGrade();st.textContent=`This model setting scores ${(sc*100).toFixed(1)}% (the world in use scores ${(w.grade.score*100).toFixed(1)}%).`},20)};
  $('btn-autotune').onclick=()=>{if(tuneRun){tuneRun.stop=true;return}autoTune()};
  $('btn-climreset').onclick=()=>{for(const d of CDEF)CL[d[0]]=d[5];renderChecks()};
  $('btn-climapply').onclick=()=>buildWorld(ui.src);
}
function drawChina(){
  const cv=$('chinachart');if(!cv)return;const r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);cv.width=r.width*dpr;cv.height=r.height*dpr;
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);const w=r.width,h=r.height,ch=S.chinaHist;
  const x0=-2000,x1=Math.max(1800,S.year),X=y=>(y-x0)/(x1-x0)*(w-30)+28,Y=v=>h-16-v*(h-26);
  ctx.strokeStyle=cssVar('--line');ctx.fillStyle=cssVar('--muted');ctx.font=`10px ${cssVar('--f-mono')}`;ctx.lineWidth=1;
  for(const v of [0,0.5,1]){ctx.beginPath();ctx.moveTo(28,Y(v));ctx.lineTo(w,Y(v));ctx.stroke();ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(Math.round(v*100)+'%',24,Y(v))}
  ctx.textAlign='center';ctx.textBaseline='alphabetic';for(const y of [-2000,-1000,0,1000]){ctx.fillText(y<0?-y+' BCE':y===0?'1 CE':y,X(y),h-3)}
  ctx.setLineDash([4,3]);ctx.strokeStyle=cssVar('--muted');ctx.beginPath();CHINA_REF.forEach((p,k)=>{const nx=k+1<CHINA_REF.length?CHINA_REF[k+1][0]:x1;if(k===0)ctx.moveTo(X(p[0]),Y(p[1]));else ctx.lineTo(X(p[0]),Y(p[1]));ctx.lineTo(X(nx),Y(p[1]))});ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=cssVar('--accent');ctx.lineWidth=1.6;ctx.beginPath();let st=false;for(const [y,v] of ch){if(y<x0)continue;st?ctx.lineTo(X(y),Y(v)):ctx.moveTo(X(y),Y(v));st=true}ctx.stroke();
}
function aggGrade(C){const T=new Float32Array(N),Pp=new Float32Array(N),A=new Float32Array(N);
  const agg=(src,dst)=>{for(let cy=0;cy<H;cy++)for(let cx=0;cx<W;cx++){let s=0;for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++)s+=src[(cy*SC+dy)*HW+cx*SC+dx];dst[cy*W+cx]=s/(SC*SC)}};
  agg(C.tHi,T);agg(C.pHi,Pp);agg(C.aHi,A);return gradeClimate(WD,T,Pp,A).score}
function quickGrade(){return aggGrade(genClimate(WD.eHi))}
function autoTune(){
  const st=$('clim-status');let best=quickGrade(),pass=0,di=0,fi=0;const F=[-0.2,-0.07,0.07,0.2];
  tuneRun={stop:false,msg:`Starting at ${(best*100).toFixed(1)}%…`};renderChecks();
  const stepT=()=>{
    if(tuneRun.stop||pass>=2){const m=`Finished at ${(best*100).toFixed(1)}%. Rebuild the world to use it.`;tuneRun=null;renderChecks();$('clim-status').textContent=m;return}
    const d=CDEF[di],k=d[0],old=CL[k];CL[k]=clamp(old+F[fi]*(d[3]-d[2]),d[2],d[3]);
    const sc=quickGrade();if(sc>best+0.0005){best=sc}else CL[k]=old;
    if(++fi>=F.length){fi=0;if(++di>=CDEF.length){di=0;pass++}}
    tuneRun.msg=`Pass ${pass+1} of 2 · ${d[1]} · best ${(best*100).toFixed(1)}%`;const s2=$('clim-status');if(s2)s2.textContent=tuneRun.msg;
    const inp=$('c-'+k);if(inp){inp.value=CL[k];$('co-'+k).textContent=(+CL[k]).toFixed(d[4]<0.01?3:d[4]<1?2:0)}
    setTimeout(stepT,10)};
  setTimeout(stepT,30);
}

/* ---------- rules ---------- */
function buildRules(){
  const groups={};for(const d of PDEF)(groups[d[0]]=groups[d[0]]||[]).push(d);
  let h='<p class="note">Rules apply at once, except those marked new world, which apply the next time you build a world or rerun history.</p>';
  for(const [g,list] of Object.entries(groups)){
    h+=`<div class="group"><h3 class="sec">${g}</h3>`;
    for(const d of list){const [,k,l,mn,mx,stp,v,hint,wd]=d;
      h+=`<div class="param"><label for="p-${k}">${l}${wd?'<span class="tag">new world</span>':''}</label><output id="o-${k}">${fmtP(k,P[k])}</output><input type="range" id="p-${k}" min="${mn}" max="${mx}" step="${stp}" value="${P[k]}"><span class="hint">${hint}</span></div>`}
    h+='</div>';
  }
  h+='<div class="actions"><button class="btn" id="btn-defaults" type="button">Restore default rules</button></div>';
  $('rules').innerHTML=h;
  $('rules').addEventListener('input',e=>{const t=e.target;if(!t.id||!t.id.startsWith('p-'))return;const k=t.id.slice(2);P[k]=+t.value;$('o-'+k).textContent=fmtP(k,P[k])});
  $('btn-defaults').addEventListener('click',()=>{for(const d of PDEF){P[d[1]]=d[6];$('p-'+d[1]).value=d[6];$('o-'+d[1]).textContent=fmtP(d[1],d[6])}});
}
function fmtP(k,v){if(k==='startYear')return fy(v);if(k==='landFrac')return Math.round(v*100)+'%';if(Number.isInteger(+v)&&+v>=1)return String(v);return(+v).toFixed(v<0.1?3:2)}

/* ---------- tabs ---------- */
function showPane(p){ui.pane=p;for(const b of document.querySelectorAll('.tabs button'))b.setAttribute('aria-selected',b.dataset.pane===p);
  for(const k of ['chron','figs','plague','insp','check','setup'])$('pane-'+k).hidden=k!==p;
  if(p==='insp')renderPage();if(p==='chron')renderChron(true);if(p==='figs')renderFigs();if(p==='plague')renderPlagues();if(p==='check')renderChecks()}
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)showPane(b.dataset.pane)});

/* ---------- controls ---------- */
$('speed').innerHTML=SPEEDS.map(([v,l],k)=>`<button type="button" data-k="${k}" aria-pressed="${k===ui.speed}" title="${k===4?'As fast as possible':v+' years per second'}">${l}</button>`).join('');
$('speed').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ui.speed=+b.dataset.k;for(const x of $('speed').children)x.setAttribute('aria-pressed',x===b)});
function setRunning(on){ui.running=on&&ui.ready;$('play').textContent=ui.running?'Pause':'Play'}
$('play').addEventListener('click',()=>setRunning(!ui.running));
$('modes').innerHTML=`<div class="city-tools"><label for="map-view">Map view <select id="map-view">${MODES.map(([k,l])=>`<option value="${k}"${k===ui.mode?' selected':''}>${l}</option>`).join('')}</select></label></div><div class="city-tools" id="nomad-tools"><label for="nomad-filter">Confederations <select id="nomad-filter"><option value="off">Off</option><option value="on">On</option><option value="near" selected>Near settled societies</option></select></label></div><div class="city-tools"><label for="city-filter">Cities <select id="city-filter"><option value="hidden">Hidden</option><option value="capitals">Capitals</option><option value="major" selected>Major + capitals</option><option value="all">All cities</option></select></label><label><input id="city-names" type="checkbox" checked>Names</label></div>`;
$('city-filter').addEventListener('change',e=>{ui.cities=e.target.value;ui.dirty=true});
$('city-names').addEventListener('change',e=>{ui.cityNames=e.target.checked;ui.dirty=true});
$('map-view').addEventListener('change',e=>{ui.mode=e.target.value;$('nomad-tools').hidden=!['political','alliances'].includes(ui.mode);drawLegend();ui.dirty=true});
$('nomad-filter').addEventListener('change',e=>{ui.nomads=e.target.value;drawLegend();ui.dirty=true});

document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select,button'))return;if(e.code==='Space'){e.preventDefault();setRunning(!ui.running)}});
installMapGestures(mapCv,ui,{clamp:clampView,draw:drawMap,interact:()=>{ui.camera=null},
  hover:({x:sx,y:sy})=>{
  const i=screenToCell(sx,sy),tip=$('tip');
  if(i<0||!S||!WD.land[i]){tip.hidden=true;return}
  const p=S.pol[i]&&polityOnMap(S.pols[S.pol[i]])?S.pols[S.pol[i]]:null,e2=S.eth[i]>=0?S.eths[S.eth[i]]:null,R=S.rel[i]>=0?S.rels[S.rel[i]]:null;
  const e3=S.eth2[i]>=0?S.eths[S.eth2[i]]:null;
  tip.textContent=[p&&p.full,e2?e2.name+(e3?' and '+e3.name:''):'Unpeopled',R&&R.name,fmtN(S.pop[i])].filter(Boolean).join(' · ');tip.style.left=sx+'px';tip.style.top=sy+'px';tip.hidden=false;
  },tap:({x,y})=>{if(!S)return;const i=screenToCell(x,y);
  if(i>=0){const m=ui.mode;
    if(WD.land[i]&&(m==='political'||m==='alliances')&&S.pol[i]&&polityOnMap(S.pols[S.pol[i]]))openPage('pol',S.pol[i]);
    else if(WD.land[i]&&m==='peoples'&&S.eth[i]>=0)openPage('eth',S.eth[i]);
    else if(WD.land[i]&&m==='religion'&&S.rel[i]>=0)openPage('rel',S.rel[i]);
    else openPage('cell',i)}}
});
mapCv.addEventListener('pointerleave',()=>{$('tip').hidden=true});
mapCv.addEventListener('dblclick',e=>{const r=mapCv.getBoundingClientRect();const i=screenToCell(e.clientX-r.left,e.clientY-r.top);if(i>=0)openPage('cell',i)});

/* ---------- world building ---------- */
function busy(on,txt){const b=$('busy');b.hidden=!on;if(txt)b.textContent=txt}
function startHistory(){
  P.hearthMode=$('hearthh').checked?'historical':'random';P.shuffleNames=$('shufn').checked;
  try{history.replaceState(null,'','#seed-'+($('hseed').value||'1').replace(/[^A-Za-z0-9]/g,''))}catch(e){}
  newHistory($('hseed').value||'1');ui.camera=null;
  ui.page=null;ui.stack=[];ui.lastChronKey='';ui.lastSpotObj=null;$('toast').hidden=true;ui.pausedAtEnd=false;ui.dirty=true;ui.ready=true;$('play').disabled=false;
  showPane(ui.pane);updateTop();drawChart();drawLegend();
  const h0=S.hearths.find(h=>h.kind==='farm');if(h0)centerOn(h0.cell);
}
function buildWorld(src){
  busy(true,'Shaping the world…');setRunning(false);ui.ready=false;
  setTimeout(()=>{
    try{
      const fit=$('fitc').checked;P.fitClimate=fit;
      if(src==='earth')WD=genWorld({seed:'Earth',earth:true,height:EARTH.height,kg:EARTH.kg,fit});
      else if(src==='import'&&IMPORTED)WD=genWorld(Object.assign({seed:IMPORTED.name},IMPORTED));
      else WD=genWorld({seed:$('wseed').value||'atlas-7',landFrac:P.landFrac});
      ui.src=src;for(const b of $('src').children)b.setAttribute('aria-pressed',b.dataset.v===src);
      paintBase();startHistory();busy(false);
    }catch(err){console.error(err);busy(true,'World generation failed: '+err.message)}
  },30);
}
$('src').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const v=b.dataset.v;if(v==='import'&&!IMPORTED){$('imp-status').className='status err';$('imp-status').textContent='Choose a heightmap below and build it first.';return}buildWorld(v)});
$('btn-world').addEventListener('click',()=>buildWorld(ui.src));
$('btn-rerun').addEventListener('click',()=>{setRunning(false);startHistory()});
$('btn-reroll').addEventListener('click',()=>{$('hseed').value=String(Math.floor(Math.random()*1e6));setRunning(false);startHistory()});
$('btn-share').addEventListener('click',async()=>{const seed=($('hseed').value||'1').replace(/[^A-Za-z0-9]/g,'');let base='';try{base=(window.top===window?location.href:document.referrer||location.href).split('#')[0]}catch(e){base=location.href.split('#')[0]}
  const link=base+'#seed-'+seed,st=$('share-status');$('share-link').value=link;
  try{await navigator.clipboard.writeText(link);st.textContent='Link copied. It opens this exact history (with the default rules).'}catch(e){$('share-link').select();st.textContent='Copy the link above.'}});
$('followc').addEventListener('change',e=>{ui.follow=e.target.checked});
function readImage(file){return new Promise((res,rej)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const c=document.createElement('canvas');c.width=HW;c.height=HH;const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(img,0,0,HW,HH);const d=x.getImageData(0,0,HW,HH).data;const g=new Float32Array(HW*HH);for(let i=0;i<g.length;i++)g[i]=(d[i*4]*0.299+d[i*4+1]*0.587+d[i*4+2]*0.114)/255;URL.revokeObjectURL(url);res({g,w:img.naturalWidth,h:img.naturalHeight})};img.onerror=()=>rej(new Error('That file could not be read as an image.'));img.src=url})}
$('btn-import').addEventListener('click',async()=>{
  const st=$('imp-status');st.className='status';
  const fh=$('f-height').files[0];if(!fh){st.className='status err';st.textContent='Choose a heightmap image first.';return}
  try{
    const H1=await readImage(fh),mn=+$('h-min').value,mx=+$('h-max').value,mid=$('h-mid').checked;
    const height=H1.g.map(v=>mid?(v>=0.5?(v-0.5)*2*mx:(0.5-v)*2*mn):mn+v*(mx-mn));
    const o={height,name:fh.name.replace(/\.[^.]+$/,'')};let note=`Heightmap ${H1.w}×${H1.h} loaded.`;
    if(Math.abs(H1.w/H1.h-2)>0.05)note+=' It is not 2:1, so it was stretched to fit.';
    const ft=$('f-temp').files[0],fp=$('f-prec').files[0],fc=$('f-climate').files[0];
    if(fc){o.climate=parseClimate(await fc.text());note+=' Numerical climate loaded.'}
    if(ft){const T1=await readImage(ft),a=+$('t-min').value,b=+$('t-max').value;o.temp=T1.g.map(v=>a+v*(b-a));note+=' Temperature map loaded.'}
    if(fp){const P1=await readImage(fp),a=+$('p-min').value,b=+$('p-max').value;o.prec=P1.g.map(v=>a+v*(b-a));note+=' Precipitation map loaded.'}
    let land=0;for(const v of height)if(v>0)land++;
    if(land<HW*HH*0.02){st.className='status err';st.textContent=`Almost nothing is above sea level with these settings (${(land/height.length*100).toFixed(1)}% land). Check the black and white values.`;return}
    IMPORTED=o;buildWorld('import');st.textContent=note+` ${(land/height.length*100).toFixed(0)}% of the surface is land. Note that browsers read images at 8 bits, so expect about 80 m steps in elevation.`;
  }catch(err){st.className='status err';st.textContent=err.message}
});

/* ---------- main loop ---------- */
let lastT=performance.now(),accY=0;
function frame(t){
  const dt=Math.min(0.1,(t-lastT)/1000);lastT=t;
  if(ui.camera)moveCamera(t);
  if(ui.running&&S){
    const sp=SPEEDS[ui.speed][0],t0=performance.now();
    // run the year in slices, keeping each frame short so the map and panels stay responsive
    const slice=()=>{if(!ui.gen||ui.genS!==S){ui.gen=stepG();ui.genS=S}if(ui.gen.next().done){ui.gen=null;return true}return false};
    if(sp>=1e9){while(performance.now()-t0<14)slice()}
    else{accY+=sp*dt;let n=Math.min(Math.floor(accY),60);accY-=n;while(performance.now()-t0<14){if(ui.gen){slice();continue}if(n<=0)break;n--;slice()}if(n>0)accY+=n}
    ui.dirty=true;
    if(S.year>=1800&&!ui.pausedAtEnd){ui.pausedAtEnd=true;setRunning(false);chron('nature','The age of agrarian empires gives way to the industrial era, where this version of the model stops being reliable.')}
  }
  if(S&&S.spot.length&&S.spot[S.spot.length-1]!==ui.lastSpotObj){const sp=S.spot[S.spot.length-1];ui.lastSpotObj=sp;
    if(ui.ready&&ui.running){const el=$('toast');el.innerHTML=`<span class="ty">${fy(sp.y)}</span> ${linkify(sp.txt,sp.refs)}`;el.hidden=false;ui.toastT=t+5000;ui.ringCell=sp.cell;ui.ringT=performance.now()+4000;if(ui.follow&&sp.cell>=0)centerOn(sp.cell)}}
  if(ui.toastT&&t>ui.toastT){$('toast').hidden=true;ui.toastT=0}
  if(ui.ringT&&performance.now()<ui.ringT)ui.dirty=true;
  if(ui.dirty&&S&&baseCv&&t-ui.lastRender>110){ui.lastRender=t;ui.dirty=false;buildComp();drawMap();updateTop()}
  if(S&&t-ui.lastSide>700){ui.lastSide=t;
    if(ui.pane==='chron')renderChron();else if(ui.running){if(ui.pane==='insp')renderPage();else if(ui.pane==='figs')renderFigs();else if(ui.pane==='plague')renderPlagues()}
    if(ui.mode==='knowledge'&&ui.running&&t%3000<700)drawLegend();
    drawChart()}
  requestAnimationFrame(frame);
}
async function boot(){
  buildFilters();buildRules();drawLegend();showPane('chron');
  new ResizeObserver(resize).observe($('mapwrap'));new ResizeObserver(()=>{sizeCanvas(chartCv);drawChart()}).observe(chartCv);
  resize();
  document.fonts&&document.fonts.ready.then(()=>{DISPLAY_FONT=cssVar('--f-display')||'serif';ui.dirty=true});
  DISPLAY_FONT=cssVar('--f-display')||'serif';
  requestAnimationFrame(frame);
  try{
    busy(true,'Loading Earth…');
    const [e,k,c]=await Promise.all([inflateB64(EARTH_ELEV_B64),inflateB64(KOPPEN_B64),inflateB64(EARTH_CLIMATE_B64)]);
    EARTH=decodeEarth(e,k,c);
    let seed=null;try{const m=/seed-([A-Za-z0-9]+)/.exec(location.hash||'');if(m)seed=m[1]}catch(err){}
    $('hseed').value=seed||String(Math.floor(Math.random()*1e6));
    buildWorld('earth');
  }catch(err){console.error(err);busy(true,'Earth could not be loaded here, so a generated world is used instead.');setTimeout(()=>buildWorld('gen'),800)}
}
boot();
