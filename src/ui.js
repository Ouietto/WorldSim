"use strict";
/* ================= INTERFACE ================= */
const $=id=>document.getElementById(id);
const fmtN=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+'M':n>=1e3?Math.round(n/1e3)+'k':Math.round(n)+'';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TYPES={rise:['Rise','#c08a2a'],war:['War','#b2452c'],fall:['Fall','#6e5a8c'],diplomacy:['Diplomacy','#4f7f6a'],faith:['Faith','#b0729a'],migration:['Migrations','#a0703a'],culture:['Culture','#4f78a8'],ideas:['Ideas','#3f8a5c'],plague:['Plague','#8a2f4a'],famine:['Famine','#9a7b45'],people:['Peoples','#3d7a99'],nature:['Nature & climate','#6f7d84']};
const MODES=[['political','States'],['alliances','Alliances'],['peoples','Peoples'],['mixing','Mixing'],['unity','Identity'],['loyalty','Loyalty'],['niche','Home ground'],['ctemp','Temperature'],['crain','Rainfall'],['cwind','Winds'],['veg','Biomes'],['cchange','Climate change'],['soil','Soil'],['soiltype','Soil types'],['crops','Staple crops'],['landuse','Fields and pasture'],['herds','Herds'],['forest','Forest'],['inequality','Inequality'],['lords','Lords'],['circ','Exit option'],['religion','Religion'],['knowledge','Knowledge'],['path','Paths of invention'],['era','Era'],['density','Population'],['capacity','Capacity'],['asabiya','Asabiya'],['disease','Disease'],['weather','Weather'],['climate','Climate check'],['terrain','Terrain']];
const SPEEDS=[[5,'5'],[25,'25'],[100,'100'],[400,'400'],[1e9,'Max']];
const ERA_COL=[[120,128,130],[118,150,86],[196,140,64],[150,96,72],[178,74,58],[122,84,150],[64,96,150],[40,130,140]];
const GROUP_COL=[[40,140,70],[222,190,120],[206,170,90],[110,170,110],[90,120,170],[200,215,225]];
const ui={running:false,speed:2,mode:'political',page:null,stack:[],z:1,ox:0,oy:0,bs:1,filters:new Set(Object.keys(TYPES)),q:'',lastChronKey:'',dirty:true,lastRender:0,lastSide:0,pausedAtEnd:false,pane:'chron',know:new Set(),figFilter:'all',fq:'',plagueSort:'deaths',climView:'mismatch',src:'earth',ready:false,lastSpot:0,toastT:0,ringCell:-1,ringT:0,follow:false,cities:(()=>{try{return localStorage.getItem('asabiya.cities')||'all'}catch(e){return'all'}})()};
let EARTH=null,IMPORTED=null,baseCv=null,compCv=document.createElement('canvas'),ovCv=document.createElement('canvas');
compCv.width=HW;compCv.height=HH;ovCv.width=W;ovCv.height=H;
const ovCtx=ovCv.getContext('2d'),ovImg=ovCtx.createImageData(W,H),compCtx=compCv.getContext('2d');
/* ---------- refined borders ----------
   Each province is drawn as 2x2 sub-cells. A sub-cell joins the neighbouring province it is closest to, unless a ridge or a strait
   lies in between, so borders settle along mountain crests and water instead of following the square grid; coasts are cut at full detail. */
const SW=W*2,SH=H*2,SN=SW*SH,subCv=document.createElement('canvas');subCv.width=SW;subCv.height=SH;
const subCtx=subCv.getContext('2d'),subImg=subCtx.createImageData(SW,SH);
let SUB=null;
function prepSub(){
  const w=WD,e=w.eHi,nb=new Int32Array(SN*9).fill(-1),wt=new Float32Array(SN*9),land=new Uint8Array(SN),HS=SC/2;
  const E=(x,y)=>e[clamp(Math.round(y),0,HH-1)*HW+((Math.round(x)%HW)+HW)%HW];
  for(let sy=0;sy<SH;sy++)for(let sx=0;sx<SW;sx++){const q=sy*SW+sx;let nl=0;for(let dy=0;dy<HS;dy++)for(let dx=0;dx<HS;dx++)if(e[(sy*HS+dy)*HW+sx*HS+dx]>0)nl++;land[q]=nl*2>=HS*HS?1:0;if(!land[q])continue;
    const cx=sx>>1,cy=sy>>1,px=(sx+0.5)*HS,py=(sy+0.5)*HS,es=E(px,py);let k=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++,k++){const yy=cy+dy;if(yy<0||yy>=H)continue;const xx=(cx+dx+W)%W,j=yy*W+xx;if(!w.land[j])continue;
      const ux=(sx+0.5)/2-(cx+dx+0.5),uy=(sy+0.5)/2-(cy+dy+0.5),g=Math.exp(-(ux*ux+uy*uy)/0.55);
      const qx=(cx+dx+0.5)*SC,qy=(cy+dy+0.5)*SC,ec=E(qx,qy);let mx=-1e9,wet=0;
      for(const t of [0.25,0.5,0.75]){const v=E(px+(qx-px)*t,py+(qy-py)*t);if(v>mx)mx=v;if(v<=0)wet=1}
      const ridge=Math.max(0,mx-Math.max(es,ec));nb[q*9+k]=j;wt[q*9+k]=g*Math.exp(-ridge/350)*(wet?0.25:1)}}
  SUB={nb,wt,land,lab:new Int32Array(SN),rep:new Int32Array(SN)};
}
// label every sub-cell by weighted vote of its 3x3 neighbourhood; rep = the province whose colour it takes
function subLabels(key){
  const {nb,wt,land,lab,rep}=SUB,cl=new Int32Array(9),cs=new Float32Array(9);
  for(let q=0;q<SN;q++){if(!land[q]){lab[q]=-2;rep[q]=-1;continue}let n=0,best=-1,bw=-1,bc=-1,bcw=-1;
    for(let k=0;k<9;k++){const j=nb[q*9+k];if(j<0)continue;const a=key?key[j]:j,ww=wt[q*9+k];let f=-1;for(let t=0;t<n;t++)if(cl[t]===a){f=t;break}if(f<0){f=n++;cl[f]=a;cs[f]=0}cs[f]+=ww}
    for(let t=0;t<n;t++)if(cs[t]>bw){bw=cs[t];best=cl[t]}
    for(let k=0;k<9;k++){const j=nb[q*9+k];if(j<0)continue;if((key?key[j]:j)===best&&wt[q*9+k]>bcw){bcw=wt[q*9+k];bc=j}}
    lab[q]=best;rep[q]=bc}
}
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
  const w=WD,c=document.createElement('canvas');c.width=HW;c.height=HH;const ctx=c.getContext('2d'),img=ctx.createImageData(HW,HH),d=img.data,e0=w.eHi;
  // the coast of the history's own time: low seas expose the shelves, and the last ice sheets lie white over the north
  const sl=(S&&S.seaLvl!=null?S.seaLvl:w.seaLvl)||0,ice=S&&w.iceY?w.iceY:null,yr=S?S.year:0,e=e0;
  for(let y=0;y<HH;y++)for(let x=0;x<HW;x++){
    const i=y*HW+x,v=e0[i]-sl,xl=y*HW+(x+HW-1)%HW,yu=y>0?i-HW:i;
    const sh=clamp(1+((e[xl]-e0[i])*0.0011+(e[yu]-e0[i])*0.0011)*(v>0?1:0.2),0.6,1.3);
    let R,G,B;
    if(v<=0){const t=clamp(-v/5500,0,1);R=94-62*t;G=142-80*t;B=162-72*t;if(v>-200){R+=18;G+=14;B+=8}}
    else{const b=biomeOf(w.tHi[i],w.pHi[i]);[R,G,B]=BCOL[b];
      if(v>2200&&b!==1){const t=clamp((v-2200)/2600,0,1);R+=(158-R)*t;G+=(150-G)*t;B+=(140-B)*t}
      if(v>4600&&w.tHi[i]<2){R=G=B=232}
      if(ice){const ci=((y/SC)|0)*W+((x/SC)|0);if(yr<ice[ci]){R=228;G=236;B=242}}}
    d[i*4]=R*sh;d[i*4+1]=G*sh;d[i*4+2]=B*sh;d[i*4+3]=255;
  }
  ctx.putImageData(img,0,0);
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.beginPath();
  for(let l=-60;l<=60;l+=30){const yy=(90-l)/180*HH;ctx.moveTo(0,yy);ctx.lineTo(HW,yy)}
  for(let l=-150;l<=180;l+=30){const xx=(l+180)/360*HW;ctx.moveTo(xx,0);ctx.lineTo(xx,HH)}ctx.stroke();
  // rivers as smooth curves: each reach bends through its cell centre, from the midpoint with its main tributary to the midpoint with the cell downstream
  const up=new Int32Array(N).fill(-1),upv=new Float32Array(N);
  for(const i of w.landIdx){const j=w.down[i];if(j>=0&&w.rv[i]>upv[j]){upv[j]=w.rv[i];up[j]=i}}
  const cen=i=>[(w.cxA[i]+0.5)*SC,(w.cyA[i]+0.5)*SC],mid=(a,b)=>{const [x1,y1]=cen(a),[x2,y2]=cen(b);if(Math.abs(x2-x1)>HW/2)return null;return[(x1+x2)/2,(y1+y2)/2]};
  ctx.strokeStyle='rgba(52,104,136,.8)';ctx.lineCap='round';ctx.lineJoin='round';
  for(const i of w.landIdx){if(w.rv[i]<0.3)continue;const j=w.down[i];if(j<0)continue;const [cx,cy]=cen(i),e=mid(i,j);if(!e)continue;
    const u0=up[i]>=0&&w.rv[up[i]]>=0.3?mid(up[i],i):null,s0=u0||[cx,cy];
    ctx.lineWidth=0.4+(w.rv[i]-0.3)*3;ctx.beginPath();ctx.moveTo(s0[0],s0[1]);ctx.quadraticCurveTo(cx,cy,e[0],e[1]);ctx.stroke()}
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
const TCOL=[[-30,[90,60,150]],[-15,[70,110,200]],[0,[150,200,230]],[10,[150,200,120]],[20,[235,210,90]],[28,[230,120,60]],[35,[170,40,40]]];
const RCOL=[[150,96,50],[214,180,110],[236,226,150],[140,196,110],[50,150,110],[40,110,170],[50,60,150]];
function rainCol(v){v=clamp(v,0,1)*(RCOL.length-1);const k=Math.min(RCOL.length-2,Math.floor(v)),f=v-k,a=RCOL[k],b=RCOL[k+1];return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]}
const rainCss=()=>'linear-gradient(90deg,'+RCOL.map((c,k)=>`rgb(${c}) ${Math.round(k/(RCOL.length-1)*100)}%`).join(',')+')';
function tempCol(t){if(t<=TCOL[0][0])return TCOL[0][1];for(let k=1;k<TCOL.length;k++)if(t<=TCOL[k][0]){const [a,ca]=TCOL[k-1],[b,cb]=TCOL[k],f=(t-a)/(b-a);return[ca[0]+(cb[0]-ca[0])*f,ca[1]+(cb[1]-ca[1])*f,ca[2]+(cb[2]-ca[2])*f]}return TCOL[TCOL.length-1][1]}
function buildOverlay(){
  const s=S,w=WD,d=ovImg.data,m=ui.mode;d.fill(0);
  const bc=m==='alliances'?blocs():null,know=[...ui.know].map(k=>TI[k]);
  const g=w.grade;
  if(m!=='terrain')for(const i of w.landIdx){
    let c=null,a=0;const p=s.pop[i];
    switch(m){
      case'lords':if(s.colony&&s.colony[i]>0.25){c=[245,200,90];a=230}else if(s.pol[i]&&s.pols[s.pol[i]].kind==='state'){c=ramp(s.pols[s.pol[i]].nob||0);a=170}break;
      case'political':if(s.pol[i]){const o=s.pols[s.pol[i]];const ov=o.over&&s.pols[o.over]&&s.pols[o.over].alive?s.pols[o.over]:null;
        // tributaries take a paler, fainter version of their overlord's colour
        if(ov&&o.kind==='state'){c=ov.rgb.map(v=>v*0.55+255*0.45);a=isWaste(i)?45:105}else{c=o.rgb;a=o.kind==='horde'?70:isWaste(i)?62:158}}break;
      case'crops':if(s.crop&&s.crop[i]>=0&&s.farm[i]>0.3&&p>=1){c=CROP_RGB[s.crop[i]];a=190}break;
      case'soiltype':if(w.soil&&w.T[i]>-9){c=SOIL_RGB[w.soil[i]];a=170}break;
      case'landuse':if(s.past&&p>=1&&(s.farm[i]>0.1||s.herd[i]>0.1)){const f=s.past[i];c=[LU_F[0]+(LU_P[0]-LU_F[0])*f,LU_F[1]+(LU_P[1]-LU_F[1])*f,LU_F[2]+(LU_P[2]-LU_F[2])*f];a=w.nomad[i]?215:165}break;
      case'herds':if(s.dom){let b=-1,bv=0.03;for(let k=0;k<HERDS.length;k++)if(s.dom[k][i]>bv){bv=s.dom[k][i];b=k}
        if(b>=0){c=HERDS[b].col;a=60+180*Math.min(1,bv*1.5)}else{let wv=0;for(let k=0;k<HERDS.length;k++)wv=Math.max(wv,w.wild[k][i]);if(wv>0.2&&(i+((i/W)|0))%3===0){c=[120,110,95];a=110}}}break;
      case'soil':if((w.sF[i]>0.08&&s.farm[i]>0.3&&p>=1)||s.salt[i]>0.02){if(s.salt[i]>0.08){c=[235,235,225];a=60+190*Math.min(1,s.salt[i]*1.5)}else{c=ramp(clamp((s.fert[i]-0.3)/0.7,0,1));a=60+140*Math.min(1,w.sF[i]*2)}}break;
      case'forest':if(w.forest0[i]>0.05){const f=s.forest[i],lost=w.forest0[i]-f;if(lost>0.2&&f<0.25){c=[196,120,60];a=60+150*lost}else{c=[34,110,52];a=40+200*f}}break;
      case'inequality':if(s.pol[i]){const o=s.pols[s.pol[i]];if(o.kind==='state'&&o.ineq!=null){c=ramp(clamp((o.ineq-0.15)/0.75,0,1));a=isWaste(i)?60:190}}break;
      case'circ':if(p>=1&&w.sF[i]>0.1){c=ramp(s.circE[i]);a=180}break;
      case'unity':if(s.uni[i]>0.05&&s.uniFam[i]>=0){const hh=(s.uniFam[i]*137.5)%360,k=Math.min(1,s.uni[i]*1.3);const f=x=>{const q=(x+hh/30)%12;return 255*(0.55-0.4*Math.max(-1,Math.min(q-3,9-q,1)))};c=[f(0),f(8),f(4)];a=40+190*k}break;
      case'niche':if(s.pol[i]&&s.pols[s.pol[i]].kind==='state'&&s.pop[i]>=1){c=ramp(Math.min(1,ecoD(i,s.pols[s.pol[i]])/1.4));a=190}break;
      case'loyalty':if(s.pol[i]&&s.pols[s.pol[i]].kind==='state'){c=ramp(s.integ[i]);a=190}break;
      case'mixing':if(p>=1&&s.eth[i]>=0){if(s.eth2[i]>=0){c=ramp(0.35+s.mix[i]*1.3);a=210}else{c=[150,150,140];a=40}}break;
      case'alliances':if(s.pol[i]){const v=bc.get(s.pol[i]);if(v){c=v[0];a=s.pols[s.pol[i]].kind==='horde'?Math.min(70,v[1]):v[1]}}break;
      case'peoples':if(p>=1&&s.eth[i]>=0){c=s.eths[s.eth[i]].rgb;a=178}break;
      case'religion':if(p>=1){if(s.rel[i]>=0){c=s.rels[s.rel[i]].rgb;a=185}else{c=[150,150,140];a=45}}break;
      case'knowledge':if(p>=1){
        if(know.length){let n=0;for(const k of know)if(s.tk[k][i]>0.5)n++;if(n){c=n===know.length?[230,170,60]:[120,150,190];a=n===know.length?200:110}}
        else{let n=0;for(const f of s.tk)if(f[i]>0.5)n++;c=ramp(n/TECH.length);a=190}}break;
      case'path':if(p>=1){const [pc,pv]=pathAt(i);if(pc>=0){c=COL_RGB[pc];a=Math.min(220,90+pv*25)}else{c=[150,150,140];a=40}}break;
      case'era':if(p>=1){c=ERA_COL[eraOf(i)];a=190}break;
      case'density':if(p>=1){c=ramp((Math.log10(p/w.area[i])+2)/4);a=205}break;
      case'capacity':c=ramp((Math.log10(s.K[i]/w.area[i])+2)/4);a=200;break;
      case'asabiya':if(p>=1){c=ramp(s.s[i]);a=200}break;
      case'disease':if(s.infect[i]){c=[220,40,40];a=230}else if(p>=1&&s.immune[i]>0.05){c=[60,120,200];a=40+170*s.immune[i]}break;
      case'ctemp':{const t=w.T[i]+s.cdT[i]+s.dT+s.gT+epochTemp();c=tempCol(t);a=w.land[i]?210:0}break;
      case'crain':case'cwind':if(w.land[i]){const pp=Math.max(0.3*w.Pr[i],w.Pr[i]+s.cdP[i]);c=rainCol(Math.log10(Math.max(pp,10)/40)/Math.log10(4000/40));a=m==='cwind'?150:205}break;
      case'veg':if(w.land[i]){const b=VEG[s.veg[i]];if(b){c=b[2];const f0=w.forest0[i];if(f0>0.2&&s.forest[i]<0.5*f0)c=[c[0]*0.5+196*0.5,c[1]*0.5+170*0.5,c[2]*0.5+110*0.5];if(s.farm[i]>0.5&&s.pop[i]/w.area[i]>3)c=[(c[0]+218)/2,(c[1]+190)/2,(c[2]+90)/2];a=215}}break;
      case'cchange':if(w.land[i]){const dp=s.cdP[i],dt=s.cdT[i];const v=clamp(dp/250,-1,1);c=v>=0?[70-40*v,140+30*v,190]:[200,140+40*v,70];a=Math.min(220,40+Math.abs(v)*200+Math.abs(dt)*20)}break;
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
  buildOverlay();
  const m=ui.mode;
  if(!SUB)prepSub();
  const keyM=m==='peoples'?s.eth:m==='religion'?s.rel:(m==='political'||m==='alliances')?s.pol:null;
  subLabels(keyM);
  {const sd=subImg.data,od=ovImg.data,rep=SUB.rep;for(let q=0;q<SN;q++){const j=rep[q],o=q*4;if(j<0){sd[o+3]=0;continue}const r=j*4;sd[o]=od[r];sd[o+1]=od[r+1];sd[o+2]=od[r+2];sd[o+3]=od[r+3]}
   subCtx.putImageData(subImg,0,0)}
  ctx.imageSmoothingEnabled=true;ctx.drawImage(subCv,0,0,HW,HH);
  if(m==='political'||m==='alliances'||m==='peoples'||m==='religion'){
    const key=m==='peoples'?s.eth:m==='religion'?s.rel:s.pol,polMode=m==='political'||m==='alliances';
    let selP=0;if(ui.page){if(polMode&&ui.page.t==='pol')selP=ui.page.id;else if(m==='peoples'&&ui.page.t==='eth')selP=ui.page.id;else if(m==='religion'&&ui.page.t==='rel')selP=ui.page.id;else if(ui.page.t==='cell')selP=key[ui.page.id]}
    const thin=new Path2D(),hi=new Path2D(),war=new Path2D();
    const seg=(p,x1,y1,x2,y2)=>{p.moveTo(x1,y1);p.lineTo(x2,y2)};
    // borders traced on the refined sub-cell labels (marching squares through edge midpoints)
    const L=SUB.lab,HS=SC/2,cat=(p,q)=>{if(p===-2||q===-2)return null;if(polMode&&p>0&&q>0&&s.pols[p].enemies.has(q))return war;if(p<=0&&q<=0&&m!=='peoples')return null;return selP>0&&(p===selP||q===selP)?hi:thin};
    for(let sy=0;sy<SH-1;sy++)for(let sx=0;sx<SW-1;sx++){const q=sy*SW+sx,a=L[q],b=L[q+1],c=L[q+SW],d=L[q+SW+1];if(a===b&&b===c&&c===d)continue;
      const X=(sx+1)*HS,Y=(sy+1)*HS,h2=HS/2*0+HS/2;const mids=[];
      if(a!==b)mids.push([X,Y-h2,a,b]);if(c!==d)mids.push([X,Y+h2,c,d]);if(a!==c)mids.push([X-h2,Y,a,c]);if(b!==d)mids.push([X+h2,Y,b,d]);
      if(mids.length===2){const [m1,m2]=mids,P1=cat(m1[2],m1[3]);if(P1)seg(P1,m1[0],m1[1],m2[0],m2[1])}
      else for(const mm of mids){const P1=cat(mm[2],mm[3]);if(P1)seg(P1,mm[0],mm[1],X,Y)}}
    if(polMode){const hatch=new Path2D(),fortP=new Path2D();
      for(const i of w.landIdx){const p=s.pol[i];if(!p)continue;const o=s.pols[p],x=w.cxA[i]*SC,y=w.cyA[i]*SC;
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
    for(const id of s.alive){const o=s.pols[id];for(const q of o.allies){if(q<id)continue;const p=s.pols[q];if(!p||!p.alive)continue;
      const [x1,y1]=cellXY(o.capital),[x2,y2]=cellXY(p.capital);if(Math.abs(x2-x1)>HW/2)continue;
      each(x1,y1,(sx,sy)=>{ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(x2-x1)*k,sy+(y2-y1)*k);ctx.stroke()})}}
    ctx.setLineDash([])}
  // prevailing winds from the climate model (coarse cells), for the selected month
  if(m==='cwind'&&s.climR&&s.climR.wind){const Wn=s.climR.wind[ui.windMonth||0];if(Wn){ctx.strokeStyle='rgba(30,40,60,.75)';ctx.fillStyle='rgba(30,40,60,.75)';ctx.lineWidth=1.1;const step=Math.max(2,Math.round(5/ui.z));
    for(let y=1;y<CH;y+=step)for(let x=0;x<CW;x+=step){const j=y*CW+x,uu=Wn.U[j],vv=Wn.V[j],sp=Math.hypot(uu,vv);if(sp<0.15)continue;const L=Math.min(14,4+sp*4)*Math.min(1.6,ui.z*0.8+0.4),dx=uu/sp*L,dy=-vv/sp*L;
      each((x+0.5)*CSC,(y+0.5)*CSC,(sx,sy)=>{ctx.beginPath();ctx.moveTo(sx-dx/2,sy-dy/2);ctx.lineTo(sx+dx/2,sy+dy/2);ctx.stroke();const ang=Math.atan2(dy,dx);ctx.beginPath();ctx.moveTo(sx+dx/2,sy+dy/2);ctx.lineTo(sx+dx/2-4*Math.cos(ang-0.5),sy+dy/2-4*Math.sin(ang-0.5));ctx.lineTo(sx+dx/2-4*Math.cos(ang+0.5),sy+dy/2-4*Math.sin(ang+0.5));ctx.fill()})}}}
  // caravan routes
  if((m==='political'||m==='alliances'||m==='religion'||m==='peoples')&&s.routes){ctx.lineWidth=1.6;ctx.strokeStyle='rgba(232,200,140,.85)';ctx.setLineDash([2,3]);
    for(const R of s.routes){const pts=R.path.map(cellXY);if(pts.length<2)continue;
      each(pts[0][0],pts[0][1],(sx0,sy0)=>{ctx.beginPath();let px=pts[0][0];ctx.moveTo(sx0,sy0);
        for(let k=1;k<pts.length;k++){let dx=pts[k][0]-px;if(Math.abs(dx)>HW/2){dx-=Math.sign(dx)*HW}px+=dx;ctx.lineTo(sx0+(px-pts[0][0])*k_,sy0+(pts[k][1]-pts[0][1])*k_)}ctx.stroke()})}
    ctx.setLineDash([])}
  // migrations
  if(m==='political'||m==='alliances'||m==='peoples'||m==='mixing'){
    for(const M of s.migs){if(M.done&&s.year-M.end>25)continue;if(M.path.length<2)continue;
      const pts=M.path.map(cellXY);ctx.lineWidth=2;ctx.strokeStyle=M.done?'rgba(255,214,140,.45)':'rgba(255,196,90,.95)';ctx.setLineDash(M.done?[3,3]:[]);
      each(pts[0][0],pts[0][1],(sx0,sy0)=>{ctx.beginPath();let px=pts[0][0];ctx.moveTo(sx0,sy0);
        for(let k=1;k<pts.length;k++){let dx=pts[k][0]-px;if(Math.abs(dx)>HW/2){dx-=Math.sign(dx)*HW}px+=dx;ctx.lineTo(sx0+(px-pts[0][0])*k_,sy0+(pts[k][1]-pts[0][1])*k_)}
        ctx.stroke();
        if(!M.done){const ex=sx0+(px-pts[0][0])*k_,ey=sy0+(pts[pts.length-1][1]-pts[0][1])*k_;ctx.fillStyle='rgba(255,196,90,.95)';ctx.beginPath();ctx.arc(ex,ey,4.5,0,7);ctx.fill();ctx.strokeStyle='#3a2614';ctx.lineWidth=1;ctx.setLineDash([]);ctx.stroke()}})}
    ctx.setLineDash([])}
  if(ui.ringCell>=0&&performance.now()<ui.ringT){const [mx,my]=cellXY(ui.ringCell),ph=(ui.ringT-performance.now())/4000;
    each(mx,my,(sx,sy)=>{ctx.strokeStyle=`rgba(255,240,200,${0.4+0.6*ph})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(sx,sy,10+18*(1-ph)*((performance.now()/600)%1+0.2),0,7);ctx.stroke()})}
  // cities
  const cm=ui.cities;
  if(cm!=='none'&&(m==='political'||m==='alliances'||m==='peoples'||m==='religion')&&ui.z>=(cm==='caps'||cm==='holy'?1.1:1.4)){
    ctx.font=`11px ${cssVar('--f-ui')}`;ctx.textAlign='left';ctx.textBaseline='middle';
    const holy=cm==='holy'?new Set(s.rels.filter(R=>R.alive&&R.holy!=null&&R.holy>=0).map(R=>R.holy)):null;
    for(const c of s.cities){const p=s.pop[c.cell];const isCap=s.pol[c.cell]&&s.pols[s.pol[c.cell]].capital===c.cell;
      if(cm==='caps'||cm==='holy'?!(isCap||(holy&&holy.has(c.cell))):cm==='big'?!(isCap||p>=250000):!(isCap||p>=60000))continue;
      const [mx,my]=cellXY(c.cell);
      each(mx,my,(sx,sy)=>{ctx.fillStyle='#14202a';ctx.strokeStyle='#f5f3ec';ctx.lineWidth=1.5;
        if(isCap){ctx.fillRect(sx-3,sy-3,6,6);ctx.strokeRect(sx-3,sy-3,6,6)}else{ctx.beginPath();ctx.arc(sx,sy,2.5,0,7);ctx.fill();ctx.stroke()}
        if(ui.z>=2.6){ctx.lineWidth=3;ctx.strokeText(c.name,sx+6,sy);ctx.fillText(c.name,sx+6,sy)}})}}
  // sacred sites: a gold triangle while people still gather there, a hollow one once it is buried and forgotten
  if(cm!=='none'&&s.rits&&(m==='political'||m==='peoples'||m==='religion')&&ui.z>=1.4){
    for(const R of s.rits){if(R.peak<0.3)continue;const [mx,my]=cellXY(R.cell);
      each(mx,my,(sx,sy)=>{ctx.beginPath();ctx.moveTo(sx,sy-4);ctx.lineTo(sx+3.6,sy+2.6);ctx.lineTo(sx-3.6,sy+2.6);ctx.closePath();ctx.lineWidth=1.3;
        if(R.alive){ctx.fillStyle='#b8862b';ctx.strokeStyle='#f5f3ec';ctx.fill();ctx.stroke()}else{ctx.strokeStyle='rgba(60,60,60,.7)';ctx.stroke()}
        if(ui.z>=2.6){ctx.font=`italic 11px ${cssVar('--f-ui')}`;ctx.textAlign='left';ctx.lineWidth=3;ctx.strokeStyle='#f5f3ec';ctx.fillStyle=R.alive?'#6b4c12':'#666';ctx.strokeText(R.name,sx+6,sy);ctx.fillText(R.name,sx+6,sy)}})}}
  // labels
  const lab=[];
  if(m==='political'||m==='alliances'){for(const id of s.alive){const o=s.pols[id];if(o.cells>=6)lab.push([lonToMx(o.lx),(o.ly+0.5)*SC,o.base,o.cells,o.tier==='Empire'||o.tier==='Khaganate'])}}
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
function centerOn(i){if(i==null||i<0)return;const k=ui.bs*ui.z;ui.ox=mapDim.w/2-(WD.cxA[i]+0.5)*SC*k;ui.oy=mapDim.h/2-(WD.cyA[i]+0.5)*SC*k;clampView();drawMap()}

/* ---------- legend ---------- */
function drawLegend(){
  const m=ui.mode,el=$('legend');let h='';
  const rampBox=(t,a,b)=>`<div>${t}</div><div class="ramp" style="background:${rampCss()}"></div><div class="row"><span>${a}</span><span>${b}</span></div>`;
  const keys=list=>'<div class="keys">'+list.map(([c,l])=>`<span><i style="background:rgb(${c})"></i>${l}</span>`).join('')+'</div>';
  switch(m){
    case'lords':h=rampBox('Share of each state held by hereditary lords','crown','lords')+keys([[[245,200,90],'Soldier colony, recently planted']])+'<p style="margin:6px 0 0;opacity:.85">States settle soldiers on new frontiers. Over generations, land granted for service becomes land held by birth: lords defend their own provinces but keep much of the revenue.</p>';break;
    case'political':h='Each colour is a state; tributaries are drawn in a paler shade of their overlord\'s colour. Hatched, faint areas are nomad confederations; pale areas are wasteland a state only claims. Dotted tan lines are caravan routes. Red borders are war fronts; dark dashed lines are fortified frontiers; amber trails are peoples on the move. Click a state to open its page.';break;
    case'crops':h='The staple each farming people grows: the best of the crop packages that have reached it for its climate.'+keys(CROPS.map((C,k)=>[CROP_RGB[k],cap(C.n)]));break;
    case'landuse':h='How each province uses its land, from fields to pasture. The mix follows what pays (crops, soil, tools, rain), the people\'s herding tradition, raids, and what the rulers want. Brighter: herders who move with their animals.'+keys([[LU_F,'Fields'],[LU_F.map((v,k)=>(v+LU_P[k])/2),'Mixed'],[LU_P,'Pasture']]);break;
    case'herds':h='Domestic herds, by the most common animal. Each was tamed where its wild ancestors lived and spreads with herders and trade; hard winters can kill them off. Speckled: wild herds not yet tamed.'+keys([...HERDS.map(x=>[x.col,x.n]),[[120,110,95],'Wild herds']]);break;
    case'soiltype':h='Soils formed under long-standing climate and terrain. They set base fertility, how fast farming wears them out, and how readily irrigation poisons them.'+keys(SOILS.map((S_,k)=>[SOIL_RGB[k],S_.n]));break;
    case'soil':h=rampBox('Soil fertility (farmland only; worn-out soils are cool, fresh ones warm)','depleted','fresh')+keys([[[235,235,225],'Salt-poisoned fields']])+'<p style="margin:6px 0 0;opacity:.85">Crowded fields wear out unless rested, manured or rotated; floodplains renew each year; irrigation in dry lands slowly salts the soil.</p>';break;
    case'forest':h=keys([[[34,110,52],'Standing forest'],[[196,120,60],'Cleared or lost forest']])+'<p style="margin:6px 0 0;opacity:.85">Farmers clear forest to plant; smelting eats charcoal; abandoned land grows back. Stripped hillsides erode.</p>';break;
    case'inequality':h=rampBox('Inequality within each state','equal','extreme')+'<p style="margin:6px 0 0;opacity:.85">Crowding and long peace concentrate wealth, faster where the plough makes land the prize. War, revolution, collapse and plague level it.</p>';break;
    case'circ':h=rampBox('How trapped farmers are (circumscription)','free to leave','hemmed in')+'<p style="margin:6px 0 0;opacity:.85">Where good land is ringed by desert, mountains, sea or crowded neighbours, people cannot walk away from rulers, so states form and can tax (Carneiro). Where open land lies near, subjects simply leave (Herbst, Scott).</p>';break;
    case'unity':h='Shared identities left by long unification. Each colour is the family of peoples that held the land; stronger colour means a deeper memory of unity. Heirs of that unity find reconquest easier, and annex fellow successors more readily. Memory fades over centuries of division.';break;
    case'niche':h=rampBox('Distance from the state\'s home ground','like home','alien')+'<p style="margin:6px 0 0;opacity:.85">'+'How far each province lies from its state\'s home ground: climate, rainfall, way of life and diseases. Cool colours are lands like the heartland; warm colours are unlike it, harder to conquer, tax and keep. Empires grow easily along one climate belt, river or coast.</p>';break;
    case'loyalty':h=rampBox('Province loyalty','newly conquered','fully integrated')+'<p style="margin:6px 0 0;opacity:.85">'+'How integrated each province is into its state. Newly conquered and foreign provinces start low; roads, writing, law, shared people, faith and identity raise it. Rebellions start where it is lowest.</p>';break;
    case'mixing':h='Places where two peoples live side by side. Brighter means a more even mix; long, even mixing can give birth to a new people.';break;
    case'alliances':h='States in the same alliance share a colour; dashed lines link allied capitals. Faded states stand alone; pale states pay tribute to the bloc whose tint they carry. Red borders are war fronts.';break;
    case'peoples':h='Each colour is a people. Related peoples share a hue family.';break;
    case'religion':h='Each colour is an organised faith. Grey areas follow their people’s own folk religion.';break;
    case'knowledge':{
      let share='';if(S&&S.stats.length){}
      const tp=worldPop();
      h=`Pick techniques. Gold: knows all picked; blue: knows some.${ui.know.size?'':' With none picked, colour shows how many techniques each place knows.'}<div class="kchips">`+TECH.map(t=>`<button type="button" data-k="${t.k}" aria-pressed="${ui.know.has(t.k)}" title="${t.synth?esc('Synthesized: '+t.d):''}">${t.synth?'✦ ':''}${t.n}<small>${tp?Math.round(techShare(TI[t.k])/tp*100)+'%':''}</small></button>`).join('')+'</div>';
      break}
    case'path':h='Where each place has gone beyond our own history: colour shows the part of nature its might-have-been techniques harness. Grey places follow our path.'+keys(TCOLS.map((c,j)=>[COL_RGB[j],c[1]]));break;
    case'era':h='Era each place has reached, from what it knows.'+keys(ERAS.map((n,k)=>[ERA_COL[k],n]));break;
    case'density':h=rampBox('People per km²','0.01','100');break;
    case'capacity':h=rampBox('Carrying capacity per km² this year','0.01','100');break;
    case'asabiya':h=rampBox('Asabiya (collective solidarity)','0','1');break;
    case'disease':h=keys([[[220,40,40],'Outbreak now'],[[60,120,200],'Immunity from past exposure']]);break;
    case'ctemp':h=`<div>Mean temperature this century (model change added to ${WD.isEarth?'measured':'modelled'} climate)</div><div class="ramp" style="background:linear-gradient(90deg,${TCOL.map(([t,c])=>`rgb(${c.map(Math.round)}) ${Math.round((t+30)/65*100)}%`).join(',')})"></div><div class="row"><span>−30 °C</span><span>0</span><span>35 °C</span></div>`;break;
    case'crain':h=`<div>Annual rainfall this century</div><div class="ramp" style="background:${rainCss()}"></div><div class="row"><span>40 mm</span><span>4,000 mm</span></div>`;break;
    case'cwind':h=`<div>Annual rainfall, with surface winds</div><div class="ramp" style="background:${rainCss()}"></div><div class="row"><span>40 mm</span><span>4,000 mm</span></div>`+`<div class="kchips" id="windm">${['January','July'].map((l,k)=>`<button type="button" data-m="${k*6}" aria-pressed="${(ui.windMonth||0)===k*6}">${l}</button>`).join('')}</div><p style="margin:6px 0 0;opacity:.85">Winds blow from high to low pressure, turned by the Earth's rotation. Watch the tropical rain belt and monsoons swing with the seasons.</p>`;break;
    case'veg':h='<div class="keys">'+VEG.map(b=>`<span><i style="background:rgb(${b[2]})"></i>${b[1]}</span>`).join('')+'<span><i style="background:rgb(207,180,100)"></i>Fields</span><span><i style="background:rgb(190,165,115)"></i>Cleared forest</span></div><p style="margin:6px 0 0;opacity:.85">What grows where, from the current climate. Fields and cleared forest show where people have changed the land.</p>';break;
    case'cchange':h=keys([[[40,170,190],'Wetter than today'],[[200,100,70],'Drier than today']])+'<p style="margin:6px 0 0;opacity:.85">How this era\'s climate differs from today\'s: the orbit, greenhouse gases and land cover change the monsoons and rain belts. Around 9000–5000 BCE the northern summer sun was stronger and the African monsoon reached far into the Sahara.</p>';break;
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
function worldPop(){if(!S)return 0;let t=0;for(const i of WD.landIdx)t+=S.pop[i];return t}
function techShare(k){let t=0;const f=S.tk[k];for(const i of WD.landIdx)if(f[i]>0.5)t+=S.pop[i];return t}
$('legend').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.k){const k=b.dataset.k;ui.know.has(k)?ui.know.delete(k):ui.know.add(k)}
  if(b.dataset.cv)ui.climView=b.dataset.cv;
  if(b.dataset.m!=null)ui.windMonth=+b.dataset.m;
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
  ctx.fillStyle=acc;ctx.fillText('States (2+ provinces)',L+112,11);if(w>620){ctx.fillStyle=mut;ctx.fillText('Bar above: leading era · line below: climate (blue cold, red warm)',L+250,11)}
}

/* ---------- top stats ---------- */
function updateTop(){
  const s=S,st=s.stats[s.stats.length-1];
  $('yr').textContent=s.year<=0?(1-s.year).toLocaleString('en-US'):String(s.year);$('era').textContent=s.year<=0?'BCE':'CE';
  if(!st)return;
  $('topstats').innerHTML=`<span>Population <b>${fmtN(st.pop)}</b></span><span>States <b>${st.np}</b></span><span>Hordes <b>${st.nh||0}</b></span><span>Leading era <b>${ERAS[st.lead||0]}</b></span><span>Largest ${st.big?`<button type="button" class="biglink" id="biglink" title="Open and show the largest state">${esc(st.big)}</button>`:'<b>none</b>'}${st.bc?` (${st.bc})`:''}</span>`;
}

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
    case'tech':{const f=s.firstTech[id];return f?f.cell:-1}
    case'league':return s.leagues[id].cell;
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
    if(!w.land[i]){h+=`<h2 class="name">Open sea</h2><p class="sub2">${latd}°, ${lond}° · depth ${Math.round(-Math.min(w.elev[i],w.lvl?w.lvl[i]-(S?S.seaLvl:0):0))} m</p>`}
    else{
      const p=s.pol[i]?s.pols[s.pol[i]]:null,e=s.eth[i]>=0?s.eths[s.eth[i]]:null,R=s.rel[i]>=0?s.rels[s.rel[i]]:null,city=s.city[i]>=0?s.cities[s.city[i]]:null;
      h+=`<div class="kind">Province</div><h2 class="name">${city?esc(city.name):e?'Lands of the '+esc(e.name):'Empty land'}</h2><p class="sub2">${latd}°, ${lond}° · ${ERAS[eraOf(i)]}</p>`;
      h+=`<dl class="kv" style="margin-top:10px"><dt>State</dt><dd>${p?lp(p):'none'}</dd><dt>People</dt><dd>${e?le(e):'none'}</dd><dt>Faith</dt><dd>${R?lr(R):e?'folk religion':'–'}</dd><dt>Population</dt><dd>${fmtN(s.pop[i])} / ${fmtN(s.K[i])}</dd>${city?`<dt>City</dt><dd>${esc(city.name)}${p&&p.capital===i?' (capital)':''}, since ${fy(city.born)}</dd>`+(city.sacks&&city.sacks.length?`<dt>Sacked</dt><dd>${city.sacks.slice(-4).map(x=>fy(x.y)).join(', ')}${city.sacks.length>4?` and ${city.sacks.length-4} more`:''}</dd>`:''):''}</dl>`;
      h+=`<h3 class="sec">Land</h3><dl class="kv">${w.soil?`<dt>Soil</dt><dd>${SOILS[w.soil[i]].n}</dd>`:''}${s.crop&&s.crop[i]>=0&&s.farm[i]>0.3?`<dt>Staple</dt><dd>${cap(CROPS[s.crop[i]].n)}${s.crop[i]===CI.potato&&s.tk[TI.chuno][i]>0.5?', freeze-dried':''}${s.crop[i]===CI.maize&&s.tk[TI.nixtamal][i]>0.5?', lime-soaked':''}</dd>`:''}${w.turf&&w.turf[i]>0.05?`<dt>Grass turf</dt><dd>${Math.round(s.open[i]*100)}% broken for fields</dd>`:''}${s.past&&s.pop[i]>=1?`<dt>Land use</dt><dd>${Math.round(s.past[i]*100)}% pasture</dd>`:''}${s.dom&&HERDS.some((x,k)=>s.dom[k][i]>0.05)?`<dt>Herds</dt><dd>${HERDS.filter((x,k)=>s.dom[k][i]>0.05).map(x=>x.n.toLowerCase()).join(', ')}</dd>`:''}<dt>Terrain</dt><dd>${BIOMES[w.biome[i]]}, ${Math.round(w.elev[i])} m</dd><dt>Climate</dt><dd>${w.T[i].toFixed(1)} °C, ${Math.round(w.Pr[i])} mm</dd><dt>Seasonal swing</dt><dd>${w.amp[i].toFixed(0)} °C</dd>${w.transh&&w.transh[i]>0.2&&s.herd[i]>0.3?`<dt>Herding</dt><dd>moves with the seasons</dd>`:''}${w.kgGrid&&w.kgGrid[i]?`<dt>Observed zone</dt><dd>${KG_CODES[w.kgGrid[i]]}</dd><dt>Model zone</dt><dd>${KG_GROUPS[simGroup(w.rawT[i],w.rawP[i],w.rawA[i])]}</dd>`:''}<dt>This year's rain</dt><dd>${Math.round((s.wm[i]-1)*100)>=0?'+':''}${Math.round((s.wm[i]-1)*100)}%</dd><dt>River</dt><dd>${w.rv[i]>0?(w.rv[i]>0.6?'major':'yes'):'no'}</dd><dt>Soil fertility</dt><dd>${(s.fert[i]*100).toFixed(0)}%</dd><dt>Immunity</dt><dd>${(s.immune[i]*100).toFixed(0)}%</dd><dt>Asabiya</dt><dd>${s.s[i].toFixed(2)}</dd></dl>`;
      h+=`<h3 class="sec">Ecology</h3><div class="bars">${w.sF[i]>0.08?bar('Soil fertility',s.fert[i],1,'t'):''}${w.forest0[i]>0.05?bar('Forest standing',s.forest[i]/w.forest0[i],1,'t'):''}${s.salt[i]>0.02?bar('Salt in the soil',s.salt[i],1):''}${w.mal[i]>0.05?bar('Fever burden',w.mal[i]*(1-s.adapt[i]),1):''}${w.oncho[i]>0.05?bar('River blindness',w.oncho[i],1):''}${bar('Disease pool',s.dp[i],1,'t')}${w.sF[i]>0.1?bar('Hemmed in (circumscription)',s.circE[i],1,'t'):''}${s.car[i]>0.1?bar('Caravan traffic',s.car[i],1,'t'):''}</div>`;
      h+=`<h3 class="sec">Known techniques</h3><div class="bars">${TECH.map((T,k)=>s.tk[k][i]>0.05?bar(T.n,s.tk[k][i],1,'t'):'').join('')||'<div class="note">Foraging only.</div>'}</div>`;
    }
  }else if(t==='tech'){h+=techPage(id)
  }else if(t==='league'){const Lg=s.leagues[id],mem=Lg.members.map(q=>s.pols[q]).filter(Boolean);
    h+=`<div class="kind">League of cities</div><h2 class="name">The ${esc(Lg.name)}</h2><p class="sub2">${fy(Lg.born)}${Lg.end?' – '+fy(Lg.end):''}</p><dl class="kv" style="margin-top:10px"><dt>Members</dt><dd>${mem.length?mem.map(lp).join(', '):'none'}</dd></dl><h3 class="sec">Chronicle</h3>`+chronList(chronFor(x=>refHas(x,'league',id)))
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
      h+=`<h3 class="sec">Realm</h3><dl class="kv"><dt>Provinces</dt><dd>${o.cells} (peak ${o.maxCells})</dd>${o.league!=null&&s.leagues[o.league]?`<dt>League</dt><dd>${L_('league',o.league,s.leagues[o.league].name)}</dd>`:''}${o.daughters?`<dt>Daughter cities</dt><dd>${o.daughters}</dd>`:''}${o.shape?`<dt>Extent at peak</dt><dd>${o.shape.ew.toLocaleString()} km east–west × ${o.shape.ns.toLocaleString()} km north–south</dd>`:''}${o.fortN?`<dt>Fortified provinces</dt><dd>${o.fortN}</dd>`:''}<dt>Population</dt><dd>${fmtN(o.pop)}</dd><dt>Capital</dt><dd>${city?esc(city.name):'–'}</dd><dt>Social complexity</dt><dd>${o.spc.toFixed(1)} / 10</dd>${o.cplx!=null&&o.kind==='state'?`<dt>Cost of government</dt><dd>${Math.round((o.burden||0)*100)}% of what it can tax${(o.burden||0)>1?' — more than it returns':''}</dd><dt>Treasury</dt><dd>${o.treas>0.5?'full':o.treas>0?'solvent':o.treas>-1?'in debt':'bankrupt'}</dd><dt>Inequality</dt><dd>${Math.round(o.ineq*100)} / 100</dd><dt>Farming</dt><dd>${(o.plN||0)>0.5*(o.cells-(o.wasteN||0))?'plough':'hoe'} agriculture</dd>${o.wasteN?`<dt>Claimed wasteland</dt><dd>${o.wasteN} provinces</dd>`:''}`:''}<dt>Era</dt><dd>${ERAS[eraOf(c)]}</dd><dt>Faith of the realm</dt><dd>${o.rel>=0?lr(s.rels[o.rel]):'folk religion'}</dd><dt>Core people</dt><dd>${s.eths[o.core]?le(s.eths[o.core]):'?'}</dd><dt>Land use</dt><dd>${(o.press*100).toFixed(0)}% of capacity</dd><dt>Asabiya</dt><dd>${o.S.toFixed(2)}</dd><dt>Elites vs positions</dt><dd>${(o.E/etOf(o)).toFixed(2)}×</dd><dt>Reach</dt><dd>${o.h.toFixed(1)} cells</dd><dt>Civil wars</dt><dd>${o.crises}</dd></dl>`;
      h+=`<h3 class="sec">Relations</h3><dl class="kv"><dt>Allies</dt><dd>${allies.length?allies.map(lp).join(', '):'none'}</dd><dt>At war with</dt><dd>${en.length?en.map(lp).join(', '):'no one'}</dd>${wars.length?`<dt>Wars</dt><dd>${wars.map(lw).join(', ')}</dd>`:''}${o.over&&s.pols[o.over]?`<dt>Pays tribute to</dt><dd>${lp(s.pols[o.over])}</dd>`:''}${tribs.length?`<dt>Tributaries</dt><dd>${tribs.map(lp).join(', ')}</dd>`:''}</dl>`;
      if(o.kind==='state'&&o.prep!=null){const hp=o.paysTo&&s.pols[o.paysTo];
        h+=`<h3 class="sec">Army and stores</h3><div class="bars">${bar('Readiness for war',o.prep,1)}${(o.merc||0)>0.02?bar('Hired soldiers',o.merc,1):''}${(o.gran||0)>0.02?bar('Granaries',o.gran,1,'t'):''}</div>${hp?`<dl class="kv" style="margin-top:6px"><dt>Buys peace from</dt><dd>${lp(hp)}</dd></dl>`:''}`}
      if(o.kind==='state'&&o.info){const sys=['writing','alphabet','printing','drumscript','drums','beacons','khipu','griots','relays'].filter(k=>TI[k]!=null&&s.tk[TI[k]][c]>0.5).map(k=>TECH[TI[k]].n.toLowerCase());
        h+=`<h3 class="sec">Communication</h3><div class="bars">${bar('Records',o.info.rec,1.5)}${bar('Speed',o.info.spd,1.5)}${bar('Memory',o.info.memo,1.3)}</div><p style="margin:6px 0 0;opacity:.85">${sys.length?cap(sys.join(', '))+'.':'Only the spoken message: no records, no relays, no keepers of memory.'}</p>`;
        if(o.mono)h+=`<h3 class="sec">Hold over conquests</h3><div class="bars">${bar('Holding power',o.hold||0,1)}${bar('Force',o.mono.force,1,'t')}${bar('Records',o.mono.rec,1,'t')}${bar('Trade and cities',o.mono.econ,1,'t')}</div><p style="margin:6px 0 0;opacity:.85">${o.mono.sacred?'Holds the holy city of its faith. ':''}${o.empireY?`An empire since ${fy(o.empireY)}: it rules many cities directly.`:(o.hold||0)<0.4?'Conquered peers keep their own rulers and pay tribute, and break away when they can.':'Can annex and govern conquered cities.'}</p>`}
      if(o.kind==='state'&&o.steppe!=null&&(o.steppe>0.15||o.dual||(o.pD||0)>0.05)){
        h+=`<h3 class="sec">Steppe and sown</h3><div class="bars">${bar('Steppe lords at court',o.steppe,1,'t')}${(o.pD||0)>0.02?bar('Court split',o.pD,1):''}</div><p style="margin:6px 0 0;opacity:.85">${o.steppe>0.6?'Herding nobles dominate: conquest is for pasture and plunder.':o.steppe>0.4?'Herding lords and landed officials share the court uneasily.':'Landlords, merchants and officials dominate: conquest is for taxable farmland.'}${o.dual?' Herders and farmers are ruled under separate laws.':''}</p>`}
      if(o.kind==='state'&&((o.nob||0)>0.05||o.colN)){const rf=s.reforms.filter(x=>x.pol===o.id);
        h+=`<h3 class="sec">Land and lords</h3><div class="bars">${bar('Hereditary nobility',o.nob||0,1)}</div><dl class="kv" style="margin-top:6px">${o.colN?`<dt>Soldier colonies</dt><dd>${o.colN} planted</dd>`:''}<dt>Revenue kept by lords</dt><dd>${Math.round(45*(o.nob||0))}%</dd>${rf.length?`<dt>Attempts to reclaim land</dt><dd>${rf.filter(x=>x.ok).length} of ${rf.length} succeeded</dd>`:''}</dl>`}
      if(o.why){const W2=o.why;
        h+=`<h3 class="sec">Instability ${o.psi.toFixed(2)}</h3><div class="bars">${bar('Population pressure',W2.pP,2)}${bar('Elite overproduction',W2.pE,2)}${bar('Weak cohesion',W2.pS,2)}${bar('Overextension',W2.pX,2)}${bar('Ruler',W2.pR,2)}${bar('Cost of government',W2.pT||0,2)}${bar('Fiscal crisis',W2.pF||0,2)}${bar('Inequality',W2.pQ||0,2)}${W2.pB?bar('Overmighty lords',W2.pB,2):''}${bar('Recent shocks',W2.sh,2)}</div>`;
        const cs=topCauses(W2),risk=P.crisis*0.0035*o.psi*o.psi*100;
        h+=`<div class="verdict">${cs.length?`Main strains: ${esc(cs.join(' and '))}.`:'No major strains.'} Chance of civil war this year: ${risk<0.1?'under 0.1':risk.toFixed(1)}%.</div>`}
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
    const ec=e.alive?cellAt(e.la*180/Math.PI,e.lon*180/Math.PI):-1;
    h+=`<h3 class="sec">Way of life</h3><div class="bars">${bar('Herding tradition',e.past??0.5,1,'t')}${bar('Riding',e.ride||0,1,'t')}${bar('War experience',e.xp??0.3,1,'t')}</div>${typeof rideTier==='function'?`<dl class="kv" style="margin-top:6px"><dt>Horsemanship</dt><dd>${cap(RIDE_TIERS[rideTier(e,ec)])}</dd></dl>`:''}`;
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
    h+=`<div class="kind">Epidemic${o.virgin?' · virgin soil':''}${o.novel?' · new disease from forest animals':''}</div><h2 class="name">The ${esc(o.name)}</h2><p class="sub2">${fy(o.year)}${o.done?` – ${fy(o.end)}`:' · still spreading'}</p>`;
    h+=`<dl class="kv" style="margin-top:10px"><dt>Deaths</dt><dd>${fmtN(o.deaths)}</dd><dt>Provinces reached</dt><dd>${o.cells}</dd><dt>Virulence</dt><dd>${(o.vir*100).toFixed(0)}% a year among the unexposed</dd>${o.virgin&&o.from>=0?`<dt>Brought by</dt><dd>${le(s.eths[o.from])}</dd>`:''}</dl>`;
    h+=`<h3 class="sec">Spread</h3><canvas class="mini" id="plaguemap" width="${W*2}" height="${H*2}"></canvas><p class="note">Darker red reached later. The ring marks where it began.</p>`;
    const hit=(Array.isArray(o.hit)?o.hit:[...o.hit]).map(k=>s.pols[k]).filter(p=>p&&p.maxCells>=8).sort((a,b)=>b.maxCells-a.maxCells);
    if(hit.length)h+=`<h3 class="sec">States struck</h3><p style="margin:0">${hit.slice(0,16).map(lp).join(', ')}</p>`;
  }else if(t==='mig'){
    const M=s.migs[id],e=s.eths[M.eth];
    h+=`<div class="kind">${M.kind==='horde'?'Nomad migration':'Migration'}${M.done?'':' · on the move'}</div><h2 class="name">The ${esc(M.name)}</h2><p class="sub2">${fy(M.start)}${M.done?` – ${fy(M.end)}`:''} · ${le(e)}</p>`;
    h+=`<p style="margin:8px 0 0">${linkify(M.startTxt||'',[RM(M),RE(e)])}</p>`;
    h+=`<dl class="kv" style="margin-top:10px"><dt>People</dt><dd>${fmtN(M.pop)}${M.done?'':' now'}</dd><dt>Distance</dt><dd>${M.path.length} provinces crossed</dd>${M.pockets&&M.pockets.length?`<dt>Left behind</dt><dd>${M.pockets.length} small settlement${M.pockets.length>1?'s':''} along the way</dd>`:''}${M.prev>=0?`<dt>Set in motion by</dt><dd>${lm_(s.migs[M.prev])}</dd>`:''}${M.broke.length?`<dt>Broke into</dt><dd>${M.broke.map(k=>s.pols[k]).filter(Boolean).map(lp).join(', ')}</dd>`:''}${M.done?`<dt>Outcome</dt><dd style="text-align:left;font-family:var(--f-ui)">${M.settledPol&&s.pols[M.settledPol]?`Founded the ${lp(s.pols[M.settledPol])}`:esc(cap(M.result))}</dd>`:''}</dl>`;
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
    case'rebellion':return`Founded ${fy(o.born)} in a revolt against the ${from?lp(from):'old regime'}${g.why?' · '+esc(g.why.replace(/\.$/,'')):''}`;
    case'migration':{const M=s.migs[g.mig];return`Founded ${fy(o.born)} by the ${M?lm_(M):'migrants'}${from?` in the lands of the ${lp(from)}`:''}`}
    case'colony':return`Founded ${fy(o.born)} by settlers from the ${from?lp(from):'mother city'}`;
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
  if(M.pockets){ctx.fillStyle='#ffe6b0';ctx.strokeStyle='#7a5418';ctx.lineWidth=1;for(const c of M.pockets){ctx.beginPath();ctx.arc((WD.cxA[c]+0.5)*sx,(WD.cyA[c]+0.5)*sy,2.6,0,7);ctx.fill();ctx.stroke()}}
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
    h+=`<p class="note">${w.climateMeta?`The score grades the built-in climate generator used for invented worlds. Earth itself runs on measured 1981–2010 climate normals (NOAA-hosted GPCC rainfall and GHCN-CAMS temperature), covering ${Math.round(w.climateMeta.coverage*1000)/10}% of the map; the generator fills the rest.`:w.fitted?`The model's climate is graded here. For the simulation itself, Earth's climate is nudged into the observed zones (${Math.round((w.fitChanged||0)/(HW*HH)*1000)/10}% of the map adjusted).`:'The simulation is running on the model climate alone.'} Use the Climate check map mode to see where the model goes wrong.</p>`;
  }else h+=`<p class="note">Grading needs a real-world reference, so it is available on Earth. On other worlds the climate comes from the model below.</p>`;
  h+=`<details class="more2" ${tuneRun?'open':''}><summary>Tune the climate model</summary>`;
  h+=CDEF.map(([k,l,mn,mx,stp])=>`<div class="param"><label for="c-${k}">${l}</label><output id="co-${k}">${(+CL[k]).toFixed(stp<0.01?3:stp<1?2:0)}</output><input type="range" id="c-${k}" min="${mn}" max="${mx}" step="${stp}" value="${CL[k]}"></div>`).join('');
  h+=`<div class="actions"><button class="btn" id="btn-regrade" type="button" ${g?'':'disabled'}>Regrade</button><button class="btn" id="btn-autotune" type="button" ${g?'':'disabled'}>${tuneRun?'Stop':'Auto-tune'}</button><button class="btn" id="btn-climreset" type="button">Defaults</button><button class="btn" id="btn-climapply" type="button">Rebuild world with this climate</button></div><div class="status" id="clim-status">${tuneRun?tuneRun.msg:''}</div></details>`;
  if(w.isEarth&&s){
    h+=`<h3 class="sec">History vs the real record</h3><p class="note" style="margin-top:0">First kingdom holding at least 30% of each region's people, compared with rough real dates. Expect rhymes, not repeats.</p>`;
    h+=`<div class="tablewrap"><table class="table"><thead><tr><th>Region</th><th>Real</th><th>This run</th><th></th></tr></thead><tbody>`;
    for(const R of w.regions){const f=s.regionFirst[R.k];const d=f?f.y-R.ref:null;
      h+=`<tr><td>${R.n}</td><td class="n">${fy(R.ref)}</td><td class="n">${f?fy(f.y):'not yet'}</td><td class="n ${d==null?'':Math.abs(d)<=800?'ok':'bad'}">${d==null?'':(d>0?'+':'')+d+' y'}</td></tr>`}
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
    const sn=s.stateNow;if(sn){h+=`<h3 class="sec">Where states should be rare</h3><p class="note" style="margin-top:0">Share of peopled provinces under a kingdom or larger in places that stayed mostly stateless in the real world (New Guinea farmed early but never built a state; leached rainforest soils, tubers that cannot be taxed, and disease held the Congo and Amazon interiors back).</p><div class="tablewrap"><table class="table"><thead><tr><th>Region</th><th>${fy(sn.y)}</th></tr></thead><tbody>${sn.res.map(r2=>`<tr><td>${r2.n}</td><td class="n ${r2.share<0.25?'ok':'bad'}">${Math.round(r2.share*100)}%</td></tr>`).join('')}</tbody></table></div>`}
    h+=`<h3 class="sec">China: unity and division</h3><p style="margin:0">Share of China's heartland held by its largest state. The dashed line is a rough reading of the real record.${cmax&&cmax[1]?` Peak so far: <b>${Math.round(cmax[1]*100)}%</b> in ${fy(cmax[0])}.`:''}</p><canvas class="sparkc" id="chinachart" style="height:120px"></canvas>`;
  }
  if(s&&s.epochs.length){h+=`<h3 class="sec">Climate epochs this run</h3><ul class="deeds">${s.epochs.map(e=>`<li><span>${fy(e.start)}</span><div>${e.k==='dry'?'Great drought in the '+esc(e.where):e.k==='cold'?'Cold epoch':'Warm epoch'}, ${e.end-e.start} years${e.k!=='dry'?` (${e.amp>0?'+':''}${e.amp.toFixed(1)} °C)`:''}</div></li>`).join('')}</ul>`}
  if(s&&s.co2){const o=orbitFor(s.year);h+=`<p class="note">Climate now: ${s.climAnom>=0?'+':''}${s.climAnom.toFixed(2)} °C against the modern orbit and pre-industrial air; CO₂ ${s.co2.toFixed(0)} ppm, methane ${Math.round(s.ch4)} ppb. Orbit: tilt ${o.obl.toFixed(2)}°, eccentricity ${o.ecc.toFixed(4)}, perihelion at solar longitude ${Math.round(o.peri)}°. See the Climate tab.</p>`}
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
  for(const k of ['chron','figs','plague','insp','clim','tech','check','setup'])$('pane-'+k).hidden=k!==p;
  if(p==='clim')renderClimate();if(p==='tech')renderTech();
  if(p==='insp')renderPage();if(p==='chron')renderChron(true);if(p==='figs')renderFigs();if(p==='plague')renderPlagues();if(p==='check')renderChecks()}
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b)showPane(b.dataset.pane)});

/* ---------- controls ---------- */
$('speed').innerHTML=SPEEDS.map(([v,l],k)=>`<button type="button" data-k="${k}" aria-pressed="${k===ui.speed}" title="${k===4?'As fast as possible':v+' years per second'}">${l}</button>`).join('');
$('speed').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;ui.speed=+b.dataset.k;for(const x of $('speed').children)x.setAttribute('aria-pressed',x===b)});
function setRunning(on){ui.running=on&&ui.ready;$('play').textContent=ui.running?'Pause':'Play'}
$('play').addEventListener('click',()=>setRunning(!ui.running));
const CITY_SHOW=[['all','All cities'],['big','Capitals and large cities'],['caps','Capitals only'],['holy','Capitals and holy cities'],['none','None']];
// map views: a few quick buttons and every layer in one grouped menu
const QUICK=['political','peoples','religion','veg'];
const MODE_GROUPS=[['Politics',['political','alliances','lords','unity','loyalty','inequality','circ']],['Peoples and ideas',['peoples','mixing','religion','knowledge','path','era']],['People and land',['density','capacity','crops','landuse','herds','asabiya','disease','soil','soiltype','forest','niche','terrain']],['Climate',['ctemp','crain','cwind','veg','cchange','weather','climate']]];
const MODE_NAME=Object.fromEntries(MODES);MODE_NAME.veg='Biomes';
$('modes').innerHTML=QUICK.map(k=>`<button type="button" data-m="${k}" aria-pressed="${k===ui.mode}">${MODE_NAME[k]}</button>`).join('')+`<label class="msel"><span>Map</span><select id="modesel" aria-label="Map view">${MODE_GROUPS.map(([g,ks])=>`<optgroup label="${g}">${ks.filter(k=>MODE_NAME[k]).map(k=>`<option value="${k}"${k===ui.mode?' selected':''}>${MODE_NAME[k]}</option>`).join('')}</optgroup>`).join('')}</select></label><label class="msel"><span>Cities</span><select id="citysel" aria-label="Which cities to show">${CITY_SHOW.map(([k,l])=>`<option value="${k}"${k===ui.cities?' selected':''}>${l}</option>`).join('')}</select></label>`;
function setMode(m){ui.mode=m;for(const x of $('modes').querySelectorAll('button'))x.setAttribute('aria-pressed',x.dataset.m===m);const sel=$('modesel');if(sel&&sel.value!==m)sel.value=m;drawLegend();ui.dirty=true}
$('modes').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;setMode(b.dataset.m)});
$('modesel').addEventListener('change',e=>setMode(e.target.value));
$('citysel').addEventListener('change',e=>{ui.cities=e.target.value;try{localStorage.setItem('asabiya.cities',ui.cities)}catch(_){}ui.dirty=true});
$('topstats').addEventListener('click',e=>{if(!e.target.closest('#biglink')||!S)return;let b=null;for(const id of S.alive){const o=S.pols[id];if(!b||o.cells>b.cells)b=o}if(b){openPage('pol',b.id);centerOn(b.capital)}});
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.code==='Space'){e.preventDefault();setRunning(!ui.running)}});
let drag=null;const touches=new Map();let pinch=null;
function zoomAt(sx,sy,z2){z2=clamp(z2,1,8);const f=z2/ui.z;ui.ox=sx-(sx-ui.ox)*f;ui.oy=sy-(sy-ui.oy)*f;ui.z=z2;clampView();drawMap()}
function pinchState(){const r=mapCv.getBoundingClientRect(),[a,b]=[...touches.values()];return{d:Math.hypot(a.x-b.x,a.y-b.y)||1,mx:(a.x+b.x)/2-r.left,my:(a.y+b.y)/2-r.top}}
mapCv.addEventListener('pointerdown',e=>{touches.set(e.pointerId,{x:e.clientX,y:e.clientY});try{mapCv.setPointerCapture(e.pointerId)}catch(_){}
  if(touches.size===2){const p=pinchState();pinch={d:p.d,z:ui.z,mx:p.mx,my:p.my};drag=null}
  else if(touches.size===1)drag={x:e.clientX,y:e.clientY,ox:ui.ox,oy:ui.oy,moved:false}});
for(const ev of ['pointercancel'])mapCv.addEventListener(ev,e=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null});
mapCv.addEventListener('pointermove',e=>{
  if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&touches.size===2){const p=pinchState();ui.ox+=p.mx-pinch.mx;ui.oy+=p.my-pinch.my;pinch.mx=p.mx;pinch.my=p.my;zoomAt(p.mx,p.my,pinch.z*p.d/pinch.d);return}
  const r=mapCv.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;
  if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;if(drag.moved){ui.ox=drag.ox+dx;ui.oy=drag.oy+dy;clampView();drawMap()}return}
  const i=screenToCell(sx,sy),tip=$('tip');
  if(i<0||!S||!WD.land[i]){tip.hidden=true;return}
  const p=S.pol[i]?S.pols[S.pol[i]]:null,e2=S.eth[i]>=0?S.eths[S.eth[i]]:null,R=S.rel[i]>=0?S.rels[S.rel[i]]:null;
  const e3=S.eth2[i]>=0?S.eths[S.eth2[i]]:null;
  tip.textContent=[p&&p.full,e2?e2.name+(e3?' and '+e3.name:''):'Unpeopled',R&&R.name,fmtN(S.pop[i])].filter(Boolean).join(' · ');tip.style.left=sx+'px';tip.style.top=sy+'px';tip.hidden=false;
});
mapCv.addEventListener('pointerleave',()=>{$('tip').hidden=true});
mapCv.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&S){const r=mapCv.getBoundingClientRect();const i=screenToCell(e.clientX-r.left,e.clientY-r.top);
  if(i>=0){const m=ui.mode;
    if(WD.land[i]&&(m==='political'||m==='alliances')&&S.pol[i])openPage('pol',S.pol[i]);
    else if(WD.land[i]&&m==='peoples'&&S.eth[i]>=0)openPage('eth',S.eth[i]);
    else if(WD.land[i]&&m==='religion'&&S.rel[i]>=0)openPage('rel',S.rel[i]);
    else openPage('cell',i)}}drag=null;touches.delete(e.pointerId);if(touches.size<2)pinch=null});
mapCv.addEventListener('dblclick',e=>{const r=mapCv.getBoundingClientRect();const i=screenToCell(e.clientX-r.left,e.clientY-r.top);if(i>=0)openPage('cell',i)});
mapCv.addEventListener('wheel',e=>{e.preventDefault();const r=mapCv.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;
  const z2=clamp(ui.z*Math.exp(-e.deltaY*0.0015),1,8),f=z2/ui.z;ui.ox=sx-(sx-ui.ox)*f;ui.oy=sy-(sy-ui.oy)*f;ui.z=z2;clampView();drawMap()},{passive:false});

/* ---------- world building ---------- */
function busy(on,txt){const b=$('busy');b.hidden=!on;if(txt)b.textContent=txt}
function startHistory(){
  P.hearthMode=$('hearthh').value;P.shuffleNames=$('shufn').checked;
  try{history.replaceState(null,'','#seed-'+($('hseed').value||'1').replace(/[^A-Za-z0-9]/g,''))}catch(e){}
  newHistory($('hseed').value||'1');
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
$('src').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const v=b.dataset.v;if(v==='import'&&!IMPORTED){$('imp-status').className='status err';$('imp-status').textContent='Choose a heightmap below and build it first.';$('f-height').scrollIntoView({block:'center',behavior:'smooth'});return}buildWorld(v)});
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
    const ft=$('f-temp').files[0],fp=$('f-prec').files[0];
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
  if(ui.running&&S){
    const sp=SPEEDS[ui.speed][0],t0=performance.now();
    // run the year in slices, keeping each frame short so the map and panels stay responsive
    const slice=()=>{if(!ui.gen||ui.genS!==S){ui.gen=stepG();ui.genS=S}if(ui.gen.next().done){ui.gen=null;return true}return false};
    // at Max speed the simulation gets most of each frame (about 30 frames a second); otherwise it stays under 14 ms
    if(sp>=1e9){while(performance.now()-t0<26)slice()}
    else{accY+=sp*dt;let n=Math.min(Math.floor(accY),60);accY-=n;while(performance.now()-t0<14){if(ui.gen){slice();continue}if(n<=0)break;n--;slice()}if(n>0)accY+=n}
    ui.dirty=true;
    if(S.year>=1800&&!ui.pausedAtEnd){ui.pausedAtEnd=true;setRunning(false);chron('nature','The age of agrarian empires gives way to the industrial era, where this version of the model stops being reliable.')}
  }
  if(S&&S.spot.length&&S.spot[S.spot.length-1]!==ui.lastSpotObj){const sp=S.spot[S.spot.length-1];ui.lastSpotObj=sp;
    if(ui.ready&&ui.running){const el=$('toast');el.innerHTML=`<span class="ty">${fy(sp.y)}</span> ${linkify(sp.txt,sp.refs)}`;el.hidden=false;ui.toastT=t+5000;ui.ringCell=sp.cell;ui.ringT=performance.now()+4000;if(ui.follow&&sp.cell>=0)centerOn(sp.cell)}}
  if(ui.toastT&&t>ui.toastT){$('toast').hidden=true;ui.toastT=0}
  if(ui.ringT&&performance.now()<ui.ringT)ui.dirty=true;
  if(S&&baseCv&&S.seaVer!==ui.seaVer){ui.seaVer=S.seaVer;paintBase();ui.dirty=true}
  if(ui.dirty&&S&&baseCv&&t-ui.lastRender>110){ui.lastRender=t;ui.dirty=false;buildComp();drawMap();updateTop()}
  if(S&&t-ui.lastSide>700){ui.lastSide=t;
    if(ui.pane==='chron')renderChron();else if(ui.running){if(ui.pane==='insp')renderPage();else if(ui.pane==='figs')renderFigs();else if(ui.pane==='plague')renderPlagues();else if(ui.pane==='tech')renderTech();else if(ui.pane==='clim')renderClimate()}
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

/* ---------- climate tab ---------- */
// how well the model's present-day climate matches the measured normals (Earth only), computed once per world
function climSkill(){const w=WD;if(w.climSkillV!==undefined)return w.climSkillV;w.climSkillV=null;
  if(!w.isEarth||!EARTH_CLIMATE||!w.clim)return null;const smp=climateSampler(EARTH_CLIMATE),R=w.clim,g=R.g;
  let et=0,ep=0,n=0,ok=0,nk=0;
  for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const j=y*CW+x;if(g.land[j]<0.6)continue;const la=90-(y+0.5)*180/CH,lo=(x+0.5)*360/CW-180,t=smp(la,lo,'temperature'),pp=smp(la,lo,'precipitation');if(!Number.isFinite(t)||!Number.isFinite(pp))continue;
    const mt=R.Ta[j]-CLM.lapse*g.elev[j]/1000;et+=(mt-t)**2;ep+=(Math.log10(R.Pa[j]+50)-Math.log10(pp+50))**2;n++;
    if(w.kgHi){const kg=kgGroup(w.kgHi[(y*CSC+CSC/2)*HW+x*CSC+CSC/2]);if(kg>=0){nk++;if(simGroup(mt,R.Pa[j],R.Ar[j])===kg)ok++}}}
  return w.climSkillV=n?{t:Math.sqrt(et/n),p:Math.sqrt(ep/n),k:nk?ok/nk:null}:null}
function sparkSvg(pts,col,lo,hi,fmt){if(pts.length<2)return'';const W_=300,H_=56,x0=pts[0][0],x1=pts[pts.length-1][0];const X=x=>(x-x0)/(x1-x0||1)*W_,Y=v=>H_-4-(v-lo)/(hi-lo||1)*(H_-8);
  return`<svg viewBox="0 0 ${W_} ${H_}" class="spark" preserveAspectRatio="none" style="width:100%;height:${H_}px"><polyline fill="none" stroke="${col}" stroke-width="1.6" points="${pts.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')}"/><text x="2" y="10" font-size="9" fill="currentColor" opacity=".7">${fmt(hi)}</text><text x="2" y="${H_-1}" font-size="9" fill="currentColor" opacity=".7">${fmt(lo)}</text></svg>`}
function renderClimate(){const el=$('pane-clim'),s=S,w=WD;if(!s||!s.co2){el.innerHTML='';return}
  const o=orbitFor(s.year),anom=s.climAnom+s.gT+epochTemp()+s.dT,sk=climSkill();
  let h=`<h3 class="sec">The climate now</h3><dl class="kv"><dt>Global temperature</dt><dd>${anom>=0?'+':''}${anom.toFixed(2)} °C against the present day</dd><dt>Carbon dioxide</dt><dd>${s.co2.toFixed(1)} ppm</dd><dt>Methane</dt><dd>${Math.round(s.ch4)} ppb</dd><dt>Forest carbon</dt><dd>${Math.round(s.landC)} Gt C</dd><dt>Axial tilt</dt><dd>${o.obl.toFixed(2)}°</dd><dt>Eccentricity</dt><dd>${o.ecc.toFixed(4)}</dd><dt>Perihelion</dt><dd>${perihelionWord(o.peri)}</dd><dt>Model last solved</dt><dd>${fy(s.climY)}</dd></dl>`;
  const st=s.stats.filter(x=>x.co2!=null);
  if(st.length>1){const c=st.map(x=>[x.y,x.co2]),t=st.map(x=>[x.y,x.gT]);const cl=Math.min(...c.map(p=>p[1])),ch=Math.max(...c.map(p=>p[1])),tl=Math.min(...t.map(p=>p[1])),th=Math.max(...t.map(p=>p[1]));
    h+=`<h3 class="sec">Carbon dioxide</h3>${sparkSvg(c,'#b0643c',Math.floor(cl-1),Math.ceil(ch+1),v=>v+' ppm')}<h3 class="sec">Global temperature</h3>${sparkSvg(t,'#3c78b0',tl-0.1,th+0.1,v=>(v>=0?'+':'')+v.toFixed(1)+' °C')}`}
  h+=`<h3 class="sec">Map layers</h3><div class="kchips" id="climmodes">${[['ctemp','Temperature'],['crain','Rainfall'],['cwind','Winds'],['veg','Biomes'],['cchange','Change from today'],['climate','Climate zones']].map(([k,l])=>`<button type="button" data-mode="${k}" aria-pressed="${ui.mode===k}">${l}</button>`).join('')}</div>`;
  if(sk)h+=`<h3 class="sec">How good is the model?</h3><p style="margin:0">Run on Earth's real mountains and coasts with today's orbit, the model misses measured annual temperatures by <b>${sk.t.toFixed(1)} °C</b> on average and rainfall by a factor of about <b>${Math.pow(10,sk.p).toFixed(1)}</b>${sk.k!=null?`; it puts <b>${Math.round(sk.k*100)}%</b> of land in the right climate group`:''}. On Earth the simulation therefore keeps the measured climate and uses only the model's <i>changes</i> through time; invented worlds use the model directly.</p>`;
  h+=`<details class="more2"><summary>How the climate model works</summary><p>Sunlight is computed from the orbit for every latitude and month. Each place balances absorbed sunlight against heat radiated to space; land heats and cools faster than the sea, which makes seasons and continental extremes. Heat spreads toward the poles, and winds carry ocean temperatures inland.</p><p>Air pressure comes from the tropical rain belt, the subtropical highs, the stormy subpolar lows, and heat lows over hot land. Winds blow from high to low pressure, turned by the Earth's rotation. Oceans keep the air humid; winds carry the moisture inland, and it rains where air rises: where winds meet, up mountainsides, along storm tracks. Forests return part of the rain to the air.</p><p>The climate is solved again every 250 years, or sooner when greenhouse gases change: the slow wobble of the orbit moves the monsoons, cleared forests release carbon dioxide and change how much sunlight the land reflects, and rice paddies and herds add methane. Biomes follow the climate, and fields and cleared forest follow the people.</p></details>`;
  el.innerHTML=h;
}
function perihelionWord(p){const months=['late March','late April','late May','late June','late July','late August','late September','late October','late November','late December','late January','late February'];return'Earth is closest to the sun in '+months[Math.floor(((p+15)%360)/30)]}
$('pane-clim').addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(!b)return;setMode(b.dataset.mode);renderClimate()});
/* ===== Technology tab: the matrix of techniques ===== */
const LU_F=[96,165,80],LU_P=[222,176,96];
const CROP_RGB=[[214,178,82],[120,190,120],[196,150,90],[190,110,70],[230,200,60],[150,110,170],[70,140,90],[220,140,60],[120,90,60]];
const SOIL_RGB=[[200,215,225],[225,205,160],[90,130,190],[150,80,70],[150,150,140],[200,110,70],[150,170,130],[40,40,40],[120,95,70],[150,120,80]];
const COL_RGB=[[150,110,70],[60,130,190],[120,180,200],[200,90,50],[80,160,80],[150,100,170],[110,110,120]];
const COL_CSS=COL_RGB.map(c=>`rgb(${c})`);
ui.tcell=null;
// the column a province has pushed furthest beyond our own history (-1: none)
function pathAt(i){const s=S;let best=-1,bv=0;const v=new Float32Array(NTC);
  for(let k=TECH_BASE;k<TECH.length;k++)if(s.tk[k][i]>0.5)v[TECH[k].col]+=TECH[k].tier;
  for(let c=0;c<NTC;c++)if(v[c]>bv){bv=v[c];best=c}return[best,bv]}
function techFocusPol(){const s=S;if(ui.page&&ui.page.t==='pol'&&s.pols[ui.page.id]&&s.pols[ui.page.id].alive)return s.pols[ui.page.id];
  let b=null;for(const id of s.alive){const o=s.pols[id];if(o.kind==='state'&&(!b||o.pop>b.pop))b=o}return b}
function renderTech(){const el=$('pane-tech'),s=S;if(!s||!s.genByRow){el.innerHTML='';return}
  const tp=worldPop()||1,share=k=>techShare(k)/tp,dv=divergence(),nGen=TECH.length-TECH_BASE;
  let h=`<h3 class="sec">How far this world has left our path</h3><div class="bars">${bar('Divergence',dv,1,'t')}</div>`;
  h+=`<p class="note" style="margin:6px 0 0">${nGen?`${nGen} might-have-been technique${nGen>1?'s':''} invented so far.`:'Every technique so far is one our own history also found.'} Pull of our history: ${pullNow().toFixed(2)}${WD.isEarth?'':' (capped on invented worlds)'}.</p>`;
  if(s.ages.length)h+=`<dl class="kv" style="margin-top:8px">${s.ages.slice(-6).map(a=>`<dt>${fy(a.y)}</dt><dd>${lp(s.pols[a.pol])}: ${AGE_NAMES[a.col]}</dd>`).join('')}</dl>`;
  // the grid: rows are what techniques are for, columns the phenomena they harness; four tier slots per cell
  h+=`<h3 class="sec">The matrix</h3><div class="tgrid"><div></div>${TCOLS.map((c,j)=>`<div class="th" title="${esc(c[1])}"><i style="background:${COL_CSS[j]}"></i>${esc(c[2])}</div>`).join('')}`;
  for(let r=0;r<NTR;r++){h+=`<div class="rh">${TROWS[r][1]}</div>`;
    for(let c=0;c<NTC;c++){const slots=['','','',''];
      for(let k=0;k<TECH.length;k++){const T=TECH[k];if(T.row!==r||T.col!==c)continue;const sh=s.firstTech[k]?Math.max(0.25,Math.min(1,share(k)*3)):0;
        const cls=T.gen?'g':T.synth?'y':'r';if(!slots[T.tier-1]||sh)slots[T.tier-1]=`<b class="${cls}" style="opacity:${sh?sh.toFixed(2):0.18}"></b>`}
      h+=`<button type="button" class="tc${ui.tcell===r*10+c?' on':''}" data-rc="${r*10+c}" aria-label="${TROWS[r][1]} by ${TCOLS[c][1]}">${slots.map(x=>x||'<b class="e"></b>').join('')}</button>`}}
  h+=`</div><div class="tkey"><span><b class="r"></b>our history</span><span><b class="y"></b>could have been</span><span><b class="g"></b>invented here</span><span>each square holds tiers 1–4 · fainter: fewer people know it</span></div>`;
  if(ui.tcell!=null){const r=Math.floor(ui.tcell/10),c=ui.tcell%10,list=TECH.map((T,k)=>[T,k]).filter(([T])=>T.row===r&&T.col===c).sort((a,b)=>a[0].tier-b[0].tier);
    h+=`<h3 class="sec">${TROWS[r][1]} · ${TCOLS[c][1]}</h3>`;
    h+=list.length?`<dl class="kv">${list.map(([T,k])=>`<dt>Tier ${T.tier}</dt><dd>${L_('tech',k,(T.synth?'✦ ':'')+T.n)}${T.generic?`<br><small>${esc(T.generic)}</small>`:''}<br><small>${s.firstTech[k]?fy(s.firstTech[k].y)+' · '+Math.round(share(k)*100)+'% of people':'not yet found'}</small></dd>`).join('')}</dl>`:`<p class="note">Nothing here yet. Someone who masters ${TROWS[r][1].toLowerCase()} and ${TCOLS[c][1].toLowerCase()} could find a technique in this cell: ${esc(TGEN[r][c])}.</p>`}
  // the compass of one state: what its land offers, what its people carry, what its situation demands
  const o=techFocusPol();
  if(o&&o.aff){const e=s.eths[o.core];
    h+=`<h3 class="sec">Where ${lp(o)} is heading</h3><p class="note" style="margin:0 0 6px">${ui.page&&ui.page.t==='pol'?'':'The largest state; open any state to see its own. '}Inventions come where land, tradition and need overlap.</p>`;
    h+=`<div class="tcomp"><div><div class="tl">Land and resources</div>${TCOLS.map((c,j)=>cbar(c[2],o.aff[j],COL_CSS[j])).join('')}</div><div><div class="tl">Traditions${e?' of the '+esc(e.name):''}</div>${TCOLS.map((c,j)=>cbar(c[2],e&&e.trad?e.trad[j]:0,COL_CSS[j])).join('')}</div></div>`;
    if(o.lean){const mx=Math.max(...o.lean);h+=`<div class="tl" style="margin-top:8px">What its situation pushes it toward</div><div class="bars">${TROWS.map((r,j)=>bar(r[1],o.lean[j],mx,'t')).join('')}</div>`}}
  h+=`<h3 class="sec">Map</h3><div class="kchips"><button type="button" data-mode="path" aria-pressed="${ui.mode==='path'}">Paths of invention</button><button type="button" data-mode="knowledge" aria-pressed="${ui.mode==='knowledge'}">Knowledge</button></div>`;
  h+=`<details class="more2"><summary>How invention works</summary><p>Every technique sits in a grid: what it is for, and what part of nature it puts to work. A new technique combines what a society already does well in its row and its column; W. Brian Arthur calls this combinatorial evolution. Where it happens depends on the land and its resources, the traditions a people carries and passes on through migration and mixing, and what a state needs; how fast it happens depends on how many people and how much wealth are involved.</p><p>Techniques from our own history keep their own rules. The other cells hold techniques our history could have found but did not; they appear only when a society invents one, named in its own language with a plain description underneath. The pull of our history sets how often that happens. A state that takes one phenomenon far beyond our own past enters an alternate age.</p></details>`;
  el.innerHTML=h}
function cbar(l,v,col){return`<div class="cb"><span>${esc(l)}</span><i><u style="width:${Math.round(clamp(v,0,1)*100)}%;background:${col}"></u></i></div>`}
$('pane-tech').addEventListener('click',e=>{const b=e.target.closest('button[data-rc]');if(b){const v=+b.dataset.rc;ui.tcell=ui.tcell===v?null:v;renderTech();return}
  const m=e.target.closest('button[data-mode]');if(m){setMode(m.dataset.mode);renderTech()}});
function techPage(k){const s=S,T=TECH[k],f=s.firstTech[k],tp=worldPop()||1;
  let h=`<div class="kind">${T.gen?'Might-have-been technique':T.synth?'Possible technique':'Technique'}</div><h2 class="name">${esc((T.synth?'✦ ':'')+T.n)}</h2>${T.generic?`<p class="sub2">${esc(cap(T.generic))}</p>`:''}`;
  h+=`<dl class="kv" style="margin-top:10px"><dt>Purpose</dt><dd>${T.row!=null?TROWS[T.row][1]:'–'}</dd><dt>Harnesses</dt><dd>${T.col!=null?TCOLS[T.col][1]:'–'}</dd><dt>Tier</dt><dd>${T.tier||'–'}</dd>`;
  h+=`<dt>First</dt><dd>${f?fy(f.y)+(f.pol&&s.pols[f.pol]?', '+lp(s.pols[f.pol]):''):'not yet found'}</dd><dt>Known by</dt><dd>${Math.round(techShare(k)/tp*100)}% of people</dd></dl>`;
  h+=`<p style="margin:10px 0 0">${esc(T.d||'')}</p>`;
  let par=[];if(T.pre&&T.pre.length)par=T.pre.map(q=>[TECH[q],q]);
  else if(T.row!=null)par=TECH.map((P_,q)=>[P_,q]).filter(([P_,q])=>q!==k&&P_.tier===T.tier-1&&(P_.row===T.row||P_.col===T.col)&&s.firstTech[q]).slice(0,6);
  if(par.length)h+=`<h3 class="sec">Built on</h3><p style="margin:0">${par.map(([P_,q])=>L_('tech',q,P_.n)).join(', ')}</p>`;
  const kids=TECH.map((C,q)=>[C,q]).filter(([C])=>C.pre&&C.pre.includes(k));if(kids.length)h+=`<h3 class="sec">Leads to</h3><p style="margin:0">${kids.map(([C,q])=>L_('tech',q,C.n)).join(', ')}</p>`;
  return h}
