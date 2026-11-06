/* ---------- provinces (stage 1 of the province rebuild) ----------
   Provinces drawn from the land on the 25 km fine grid (HW x HH), each holding roughly as many people as the land can feed,
   instead of the 100 km squares. Every fine cell records its province, and everything about a province is worked out from its
   cells, so provinces can later be split, merged or redrawn (with climate, or a land laid waste) by reassigning cells.
   - capacity: the model's own capacity at its pre-industrial peak on the coarse grid, shared out among the coarse cell's fine
     cells by what each can grow (plant growth from its climate, flatness, floodplain);
   - growth: provinces grow from seeds along the cheapest ground on foot (valley floors cheap, slopes dear), never across the sea,
     never between today's land and the shelves the sea will drown, and never across a great river: its two banks are different
     provinces (Nein, 2026-11-05); a province stops when it holds its share of people or reaches some days' travel across;
   - evening out: a few rounds re-centre each seed and reassign cells, provinces holding too many people giving ground to their
     neighbours. */
// the shipped province map (src/earth_pid.b64): one province number per fine cell as uint16 (65535: sea), each row stored as
// differences from the cell before, deflated
function decodePid(bytes){const u=new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.byteLength>>1),pid=new Int32Array(HW*HH);
  for(let y=0;y<HH;y++){let v=0;for(let x=0;x<HW;x++){const i=y*HW+x;v=(v+u[i])&65535;pid[i]=v===65535?-1:v}}return pid}
// a small binary heap of (key, value) pairs
function mkHeap(){const K=[],V=[];return{push(k,v){let n=K.length;K.push(k);V.push(v);while(n>0){const p=(n-1)>>1;if(K[p]<=K[n])break;[K[p],K[n]]=[K[n],K[p]];[V[p],V[n]]=[V[n],V[p]];n=p}},
  pop(){const k=K[0],v=V[0],lk=K.pop(),lv=V.pop();if(K.length){K[0]=lk;V[0]=lv;let n=0;for(;;){const l=2*n+1,r=l+1;let m=n;if(l<K.length&&K[l]<K[m])m=l;if(r<K.length&&K[r]<K[m])m=r;if(m===n)break;[K[m],K[n]]=[K[n],K[m]];[V[m],V[n]]=[V[n],V[m]];n=m}}return[k,v]},get size(){return K.length}}}
const fn8=(k,f)=>{const x=k%HW,y=(k/HW)|0;for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=HH)continue;for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;f(yy*HW+(x+dx+HW)%HW,dx&&dy)}}};
/* rivers on the 25 km grid: each coarse river step (a province with a river and the one it drains into) is traced over the fine
   cells between their lowest points along the cheapest low ground, so the line keeps to the valley floor. The larger rivers are
   laid first and keep their course where a smaller one crosses it. dn is the next fine cell downstream (-1: the sea) */
function fineRivers(w){
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,land=w.land,rr=w.rvReal;
  // the coarse courses. The 100 km drainage keeps some 100 loops where mapped courses cross and its fallback routing (a flood
  // over the burned-in rivers, which can enter a river system from a neighbouring one) ran back upstream: the Shatt al-Arab, the
  // Ordos loop of the Yellow River, the lower Amazon. Here the mapped courses are laid again: largest first, a course that passes
  // a cell twice (a meander within 100 km) leaving it where it last does; a course's end runs into a touching course that reaches
  // the sea (the largest), or the sea beside it, or ends in a dry closed hollow, or else takes the way water leaves by the ground alone (the true heights from the sea of the low stand: with the Gulf
  // dry, the Tigris and Euphrates run on across it). Other ground drains as on the 100 km grid; any loop left is opened by a way
  // out that reaches the sea
  const down=Int32Array.from(w.down);let loopsLeft=0,flipped=0,reps=0,sinks=0,fdTo=null;const sinkL=[];const rkOf=new Uint8Array(NC).fill(99);
  if(w.rivCh){const n8c=(i,f)=>{const cx=i%W,cy=(i/W)|0;for(let dy=-1;dy<=1;dy++){const yy=cy+dy;if(yy<0||yy>=H)continue;for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;f(yy*W+(cx+dx+W)%W)}}};
    const fdT=new Int32Array(NC).fill(-1);{const vis=new Uint8Array(NC),Hc=mkHeap();for(let i=0;i<NC;i++)if(!land[i])vis[i]=1;
      for(const i of w.coastIdx){vis[i]=1;let oc=-1;n8c(i,j=>{if(!land[j]&&oc<0)oc=j});fdT[i]=oc;Hc.push(w.elev[i],i)}
      while(Hc.size){const [kk,i]=Hc.pop();n8c(i,j=>{if(!vis[j]){vis[j]=1;fdT[j]=i;Hc.push(Math.max(w.elev[j],kk+0.01),j)}})}}fdTo=fdT;
    // a lowland course whose mouth end stands well above its source end (lowest 25 km ground, over 50 m) was turned the wrong way
    // on the 100 km grid, where the river network's distance to the sea decides: the Amazon (which ran up to Iquitos), the Yenisei,
    // the Angara, the Parana, tributaries of the Amazon, Yukon and Mackenzie. Mountain courses keep the grid's direction (a 100 km
    // cell astride a range holds deep valleys of other rivers)
    const lowE=c=>{const cx=c%W,cy=(c/W)|0;let m=1e9;for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++){const v=e[(cy*SC+dy)*HW+cx*SC+dx];if(v>SL0&&v<m)m=v}return m};
    const onSea=c=>{let s=!w.landNow[c];n8c(c,j=>{if(!w.landNow[j])s=true});return s};
    const CH=w.rivCh.map(L=>{const c=L.cells;if(c.length<3)return L;const a=c[0],z=c[c.length-1];
      if(!onSea(z)&&lowE(z)>lowE(a)+50&&lowE(a)<450){flipped++;return{rank:L.rank,cells:c.slice().reverse()}}return L}).filter(L=>L.cells.length>=2);
    const ord=CH.slice().sort((a,b)=>a.rank-b.rank||b.cells.length-a.cells.length);
    const set=new Uint8Array(NC);for(const L of CH)for(const c of L.cells)if(L.rank<rkOf[c])rkOf[c]=L.rank;
    for(const L of ord){const c=L.cells,last=new Map();c.forEach((x,j)=>last.set(x,j));
      for(let j=0;j+1<c.length;j++){const x=c[j];if(set[x])continue;const jl=last.get(x);if(jl>=c.length-1)continue;down[x]=c[jl+1];set[x]=1}}
    const safe0=(t,c)=>{const seen=new Set();let x=t;while(x>=0&&land[x]){if(x===c||seen.has(x))return false;seen.add(x);x=down[x]}return true};
    for(const L of ord){const z=L.cells[L.cells.length-1];if(set[z])continue;let bj=-1,br=99,be=Infinity;
      n8c(z,j=>{if(!set[j]||L.cells.includes(j))return;if((rkOf[j]<br||rkOf[j]===br&&w.elev[j]<be)&&safe0(j,z)){br=rkOf[j];be=w.elev[j];bj=j}});
      if(bj<0)n8c(z,j=>{if(bj<0&&!land[j])bj=j});
      // a course that joins none and ends deep in a dry closed hollow ends there (the Chari in Lake Chad, the Amu Darya in the Aral):
      // it goes no further, and the lakes decide whether the hollow spills. A wet hollow in 100 km heights is a gorge too narrow to
      // see (the Congo's cuvette)
      if(bj<0&&w.fillD[z]>20&&w.Pr[z]<700&&!onSea(z)){down[z]=-1;set[z]=1;sinks++;sinkL.push(z);continue}
      down[z]=bj>=0?bj:fdT[z];set[z]=1}
    const succ=new Map();for(const L of CH){const c=L.cells;for(let j=0;j+1<c.length;j++){if(!succ.has(c[j]))succ.set(c[j],[]);succ.get(c[j]).push([L.rank,c[j+1]])}}
    for(const v of succ.values())v.sort((a,b)=>a[0]-b[0]);
    for(let rep=0;rep<50;rep++){const st=new Uint8Array(NC);let opened=0;
      for(const i0 of w.landIdx){if(st[i0])continue;const P=[];let i=i0;while(i>=0&&land[i]&&!st[i]){st[i]=1;P.push(i);i=down[i]}
        if(i>=0&&land[i]&&st[i]===1){const Lp=[],inL=new Set();let j=i;do{Lp.push(j);inL.add(j);j=down[j]}while(j!==i);
          // a way out counts only if it reaches the sea without coming back
          const safe=t=>{const seen=new Set();let x=t;while(x>=0&&land[x]){if(inL.has(x)||seen.has(x))return false;seen.add(x);x=down[x]}return true};
          let bc=-1,bt=-1,br=99;for(const c of Lp)for(const [rk,t] of succ.get(c)||[])if(!inL.has(t)&&rk<br&&safe(t)){br=rk;bc=c;bt=t}
          if(bc<0){let be=Infinity;for(const c of Lp)if(fdT[c]!==down[c]&&!inL.has(fdT[c])&&safe(fdT[c])&&w.elev[c]<be){be=w.elev[c];bc=c;bt=fdT[c]}}
          if(bc<0){let bw=-1;for(const c of Lp)if(rkOf[c]>bw&&fdT[c]!==down[c]){bw=rkOf[c];bc=c;bt=fdT[c]}}
          if(bc>=0){down[bc]=bt;opened++}}
        for(const q of P)st[q]=2}
      loopsLeft+=opened;reps=rep;if(!opened)break}}
  // flows along these courses: runoff summed downstream in drainage order
  const acc=new Float32Array(NC);{const indeg=new Int32Array(NC);for(const i of w.landIdx){acc[i]=Math.max(0,w.Pr[i]-200)*w.area[i]*1e-4*(w.T[i]<-9?0.2:1);const d=down[i];if(d>=0&&land[d])indeg[d]++}
    const q=[];for(const i of w.landIdx)if(!indeg[i])q.push(i);for(let h=0;h<q.length;h++){const i=q[h],d=down[i];if(d>=0&&land[d]){acc[d]+=acc[i];if(--indeg[d]===0)q.push(d)}}}
  const thC=w.isEarth?3600:2500,rvC=new Float32Array(NC);for(const i of w.landIdx)rvC[i]=acc[i]>thC?clamp(Math.log(acc[i]/thC)/Math.log(100)+0.2,0,1):0;
  const isL=k=>e[k]>SL0,rv=new Float32Array(NF),real=new Uint8Array(NF),on=new Uint8Array(NF),rk=new Uint8Array(NF).fill(99),dn=new Int32Array(NF).fill(-2),low=new Int32Array(NC).fill(-1);
  // every mapped course is traced, whatever water it carries (the Euphrates above the Tigris holds under the model's river size,
  // but its valley still leads the water)
  // (on Earth: the mapped courses and the way on from each to the sea; elsewhere every river the flows make)
  const want=new Uint8Array(NC);if(rr){for(let c=0;c<NC;c++)if(rr[c]&&land[c]){let x=c,n=0;while(x>=0&&land[x]&&!want[x]&&n<NC){want[x]=1;x=down[x];n++}}}else for(let c=0;c<NC;c++)if(rvC[c]>0)want[c]=1;
  for(let c=0;c<NC;c++){if(!land[c]||!want[c])continue;const cx=c%W,cy=(c/W)|0;let b=-1,be=1e9;
    for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++){const k=(cy*SC+dy)*HW+cx*SC+dx;if(isL(k)&&e[k]<be){be=e[k];b=k}}low[c]=b}
  // larger first; between equal flows (dry country) the one nearer the mouth first, so a course is always laid after the one it
  // drains into and can never be led back into itself
  const dpC=new Int32Array(NC).fill(-1);for(const i0 of w.landIdx){if(dpC[i0]>=0)continue;const P=[];let i=i0;while(i>=0&&land[i]&&dpC[i]<0&&P.length<NC){P.push(i);i=down[i]}
    let d=i>=0&&land[i]&&dpC[i]>=0?dpC[i]:-1;for(let t=P.length-1;t>=0;t--)dpC[P[t]]=++d}
  const steps=[];for(let c=0;c<NC;c++)if(low[c]>=0)steps.push(c);steps.sort((a,b)=>acc[b]-acc[a]||dpC[a]-dpC[b]);
  const BW=2*SC+2,dist=new Float32Array(BW*BW),prev=new Int32Array(BW*BW);let failed=0;
  for(const c of steps){const d=down[c],a=low[c];if(d<0){if(dn[a]===-2)dn[a]=-1;rv[a]=Math.max(rv[a],rvC[c]);on[a]=1;continue}
    const toSea=!land[d]||low[d]<0;
    const cx=c%W,cy=(c/W)|0,dcx=d%W,dcy=(d/W)|0;let ddx=dcx-cx;if(ddx>W/2)ddx-=W;if(ddx<-W/2)ddx+=W;const ddy=dcy-cy;
    const x0=cx*SC+Math.min(0,ddx)*SC-1,y0=cy*SC+Math.min(0,ddy)*SC-1,bw=(Math.abs(ddx)+1)*SC+2,bh=(Math.abs(ddy)+1)*SC+2;
    const gk=(lx,ly)=>{const y=y0+ly;if(y<0||y>=HH)return -1;return y*HW+((x0+lx)%HW+HW)%HW};
    const b=toSea?-1:low[d],eRef=Math.min(e[a],toSea?0:e[b]);
    dist.fill(Infinity,0,bw*bh);prev.fill(-1,0,bw*bh);const H2=mkHeap();
    let ax=(a%HW)-x0;ax=((ax%HW)+HW)%HW;const ay=((a/HW)|0)-y0;if(ax>=bw||ay<0||ay>=bh)continue;dist[ay*bw+ax]=0;H2.push(0,ay*bw+ax);let hit=-1;
    while(H2.size){const [dd,li]=H2.pop();if(dd>dist[li])continue;const k=gk(li%bw,(li/bw)|0);
      if(toSea?!isL(k):k===b){hit=li;break}if(!isL(k))continue;
      const lx=li%bw,ly=(li/bw)|0;
      for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){if(!ox&&!oy)continue;const nx=lx+ox,ny=ly+oy;if(nx<0||ny<0||nx>=bw||ny>=bh)continue;const j=gk(nx,ny);if(j<0)continue;
        const sea=!isL(j);if(sea&&!toSea)continue;const nd=dd+(ox&&oy?1.414:1)*(1+(sea?0:Math.max(0,e[j]-eRef))/25),lj=ny*bw+nx;
        if(nd<dist[lj]){dist[lj]=nd;prev[lj]=li;H2.push(nd,lj)}}}
    const path=[];
    if(hit>=0){for(let li=hit;li>=0;li=prev[li])path.push(gk(li%bw,(li/bw)|0));path.reverse()}
    else{failed++;if(toSea){let sea=false;fn8(a,j=>{if(!isL(j))sea=true});if(sea&&dn[a]===-2)dn[a]=-1;rv[a]=Math.max(rv[a],rvC[c]);continue}// straight line (8-connected) when the low ground between them is cut by the sea
      let xa=a%HW,ya=(a/HW)|0,xb=b%HW,yb=(b/HW)|0;let dx=xb-xa;if(dx>HW/2)dx-=HW;if(dx<-HW/2)dx+=HW;const dy=yb-ya,n=Math.max(Math.abs(dx),Math.abs(dy),1);
      for(let t=0;t<=n;t++){const k=Math.round(ya+dy*t/n)*HW+((Math.round(xa+dx*t/n)%HW)+HW)%HW;if(path[path.length-1]!==k)path.push(k)}}
    for(let i=0;i<path.length;i++){const u=path[i];if(!isL(u))break;on[u]=1;rv[u]=Math.max(rv[u],rvC[c]);if(rkOf[c]<rk[u])rk[u]=rkOf[c];if(rr&&rr[c])real[u]=1;
      if(i+1<path.length&&dn[u]===-2&&u!==path[i+1])dn[u]=isL(path[i+1])?path[i+1]:-1}}
  // depth to the sea along the traces; a trace that ends nowhere (a loop where courses cross, or a gap) is joined to a neighbouring
  // trace that reaches the sea; what cannot be joined is drained like any other ground
  const dp=new Int32Array(NF).fill(-1),onP=new Uint8Array(NF);let cuts=0;let tr=[];for(let k=0;k<NF;k++)if(on[k])tr.push(k);
  const walk=k=>{const P=[];let x=k,base;
    for(;;){if(dp[x]>=0){base=dp[x];break}if(dp[x]===-3||onP[x]){base=-3;if(onP[x]){dn[x]=-2;cuts++}break}P.push(x);onP[x]=1;if(dn[x]===-1){base=-1;break}if(dn[x]<0){base=-3;break}x=dn[x]}
    for(const q of P)onP[q]=0;if(base===-3){for(const q of P)dp[q]=-3}else for(let i=P.length-1;i>=0;i--)dp[P[i]]=++base};
  for(let rep=0;rep<6;rep++){dp.fill(-1);for(const k of tr)if(dp[k]===-1)walk(k);let fixed=0;
    for(const k of tr){if(dp[k]!==-3||dn[k]!==-2)continue;let bj=-1,be=Infinity;fn8(k,j=>{if(dp[j]>=0&&e[j]<be){be=e[j];bj=j}});if(bj>=0){dn[k]=bj;fixed++}}
    if(!fixed)break}
  let unres=0;for(const k of tr)if(dp[k]<0){dn[k]=-2;unres++}
  return{rv,real,on,rk,dn,dp,low,failed,unres,cuts,loopsLeft,flipped,reps,sinks,sinkL,fdT:fdTo,downC:down,accC:acc,rvC}}
/* drainage of every fine cell: river traces carry their own course; other ground drains by the lowest way out (priority flood,
   8 neighbours) into a trace or the sea. Returns the next cell downstream (-1: the sea) and steps to the sea */
function fineDrain(w,FR){
  // a trace that could not be followed to the sea (a loop in the coarse courses) is still burned in: water runs along it by its
  // own heights to the nearest way out, so a gorge too narrow for 25 km cells (the Iron Gates) does not send the Danube to the Baltic
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,isL=k=>e[k]>SL0,dAll=new Int32Array(NF).fill(-2),vis=new Uint8Array(NF),H2=mkHeap();
  const rk=k=>FR&&FR.on[k]?e[k]-6000:e[k];
  for(let k=0;k<NF;k++){if(!isL(k)){vis[k]=1;continue}if(FR&&FR.dp[k]>=0){vis[k]=1;dAll[k]=FR.dn[k];H2.push(rk(k),k)}}
  for(let k=0;k<NF;k++){if(vis[k])continue;let sea=false;fn8(k,j=>{if(!isL(j))sea=true});if(sea){vis[k]=1;dAll[k]=-1;H2.push(rk(k),k)}}
  while(H2.size){const [key,k]=H2.pop();fn8(k,j=>{if(vis[j])return;vis[j]=1;dAll[j]=k;H2.push(Math.max(rk(j),key+0.01),j)})}
  const dep=new Int32Array(NF).fill(-1),P=[];
  for(let k=0;k<NF;k++){if(!isL(k)||dep[k]>=0)continue;P.length=0;let x=k;while(x>=0&&dep[x]<0&&P.length<NF){P.push(x);x=dAll[x]}let d=x>=0?dep[x]:-1;for(let i=P.length-1;i>=0;i--)dep[P[i]]=++d}
  return{down:dAll,dep}}
// how far each fine cell's hollow must fill before it spills: priority flood on the true heights
function fineHollows(w){
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,isL=k=>e[k]>SL0,fz=new Float32Array(NF).fill(-1e9),vis=new Uint8Array(NF),H2=mkHeap();
  for(let k=0;k<NF;k++){if(!isL(k)){vis[k]=1;continue}let sea=false;fn8(k,j=>{if(!isL(j))sea=true});if(sea){vis[k]=1;fz[k]=e[k];H2.push(e[k],k)}}
  while(H2.size){const [key,k]=H2.pop();fn8(k,j=>{if(vis[j])return;vis[j]=1;fz[j]=Math.max(e[j],key+0.01);H2.push(fz[j],j)})}
  return fz}
/* floodplain share of each fine cell: GFPLAIN (Nardi et al. 2019, 250 m, reduced to 25 km) where it sees one; it misses the
   wide alluvial plains of dry rivers (the Indus 2%, Sumer 19% of the land; elsewhere it matches the flat ground beside rivers), so
   in dry country (under 600 mm) ground beside a sizeable river that is as low and flat as the river's own cell counts as
   floodplain too. Flatness alone is no guide: the desert beside the Nubian Nile is flat but stands above an incised valley */
function fineFloodplain(w,FR,fp){
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,isL=k=>e[k]>SL0,f=new Float32Array(NF),share=[0.6,0.4,0.2];
  for(let k=0;k<NF;k++){if(!isL(k))continue;let g=fp&&fp[k]!==255?fp[k]/250:0;
    if(FR){const x=k%HW,y=(k/HW)|0;let best=1e9,rvB=0,rkB=99,ds=9;
      for(let dy=-2;dy<=2;dy++){const yy=y+dy;if(yy<0||yy>=HH)continue;for(let dx=-2;dx<=2;dx++){const j=yy*HW+((x+dx)%HW+HW)%HW;if(!FR.on[j]||FR.rv[j]<0.2&&FR.rk[j]>3)continue;const dd=Math.max(Math.abs(dx),Math.abs(dy));if(dd<ds||(dd===ds&&e[j]<best)){ds=dd;best=e[j];rvB=FR.rv[j];rkB=FR.rk[j]}}}
      if(ds<=2){let s=0;for(const j of [y*HW+(x+1)%HW,y*HW+(x+HW-1)%HW,k-HW,k+HW])if(j>=0&&j<NF&&isL(j))s=Math.max(s,Math.abs(e[j]-e[k]));
        const a=clamp((25-s)/20,0,1)*clamp((20-(e[k]-best))/15,0,1)*(rvB>=0.2?clamp((rvB-0.1)/0.4,0,1):0.5)*clamp((600-w.pHi[k])/300,0,1);g=Math.max(g,a*share[ds])}}
    f[k]=g}
  return f}
/* piedmont and alluvial-fan farmland (Nein, 2026-11-06): in dry country, streams leaving the hills spread their water over the
   fans and plains at the mountain foot (Mehrgarh below the Bolan, Jeitun under the Kopet Dag, the Susiana, the Kerman and Herat
   fans), where floodwater and diverted streams grew crops long before canals; at 100 km these average to desert. Each 25 km
   cell sheds what its rain leaves after evaporation (Fu's Budyko curve with w = 2, the lower end for dry hills whose rain comes
   in storms, with evaporative demand from its temperature);
   the water runs down the fine drainage, and in dry, gentle ground (under 500 mm, slopes under about 250 m per cell) it waters as
   much land as it can, each cell taking what its crops lack of 550 mm before passing on the rest, less a sixth lost along the
   channel. Water that joins a mapped river stays the river's (its floodplain is counted apart). Returns each cell's watered share */
function fineFans(w,FR,D){
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,isL=k=>e[k]>SL0,Q=new Float64Array(NF),fan=new Float32Array(NF),ord=[];
  const ar=y=>Math.pow(111.32*180/HH,2)*Math.cos((90-(y+0.5)*180/HH)*Math.PI/180);
  for(let k=0;k<NF;k++)if(isL(k))ord.push(k);ord.sort((a,b)=>D.dep[b]-D.dep[a]);
  for(const k of ord){const P=Math.max(0,w.pHi[k]),T=w.tHi[k],A=ar((k/HW)|0),pet=300+55*Math.max(0,T),phi=P>1?pet/P:99;
    const R=P>1?P*Math.max(0,Math.sqrt(1+phi*phi)-phi):0;let q=Q[k];
    const big=FR&&FR.on[k]&&FR.rv[k]>=0.2;
    if(!big&&P<500&&q>0){let s=0;const x=k%HW,y=(k/HW)|0;for(const j of [y*HW+(x+1)%HW,y*HW+(x+HW-1)%HW,k-HW,k+HW])if(j>=0&&j<NF&&isL(j))s=Math.max(s,Math.abs(e[j]-e[k]));
      const flat=clamp((250-s)/150,0,1),need=550-P,a=Math.min(0.6*flat*A,q/need);fan[k]=a/A;q=(q-a*need)*(5/6)}
    const d=D.down[k];if(d>=0)Q[d]+=q+R*A}
  return fan}
function buildProvinces(w,o){
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,count=o.count||26000,rMax=o.rMax||6,riverMin=o.riverMin??0.75;
  const cls=new Uint8Array(NF);for(let k=0;k<NF;k++)cls[k]=e[k]>0?1:e[k]>SL0?2:0;
  const fy=k=>(k/HW)|0,fx=k=>k%HW,latF=new Float32Array(HH);for(let y=0;y<HH;y++)latF[y]=(90-(y+0.5)*180/HH)*Math.PI/180;
  const nb4=(k,f)=>{const x=fx(k),y=fy(k);f(y*HW+(x+1)%HW,0);f(y*HW+(x+HW-1)%HW,0);if(y>0)f(k-HW,1);if(y<HH-1)f(k+HW,1)};
  // what each fine cell can grow: plant growth from its own climate (the model's formula), flatness, floodplain
  const slope=new Float32Array(NF),wt=new Float32Array(NF),area=new Float32Array(NF),fp=o.fp||null,ff=o.ff||null,fan=o.fan||null;
  for(let k=0;k<NF;k++){if(!cls[k])continue;let s=0;nb4(k,j=>{if(cls[j]){const d=Math.abs(e[j]-e[k]);if(d>s)s=d}});slope[k]=s;
    const T=w.tHi[k],P=Math.max(0,w.pHi[k]),A=w.aHi[k],npp=Math.min(3000/(1+Math.exp(1.315-0.119*(T+A*0.15))),3000*(1-Math.exp(-0.000664*P)));
    const f=ff?ff[k]:fp&&fp[k]!==255?fp[k]/250:0;area[k]=Math.pow(111.32*180/HH,2)*Math.cos(latF[fy(k)]);
    // in dry land the people live by the water: rain-fed growth counts only above 250 mm, and floodplain counts on its own
    const rainNpp=P>250?npp:npp*Math.max(0,(P-100)/150);
    // (fans and piedmont ground watered by hill streams count like floodplain)
    wt[k]=area[k]*((rainNpp/1000)*(0.25+0.75*Math.exp(-s/150))+1.5*Math.max(f,fan?fan[k]:0)+0.002)}
  // great rivers on the fine grid (fineRivers): the mapped courses at least riverMin in size lie between provinces
  const river=new Uint8Array(NF);
  if(o.rivers){const R=o.rivers;for(let k=0;k<NF;k++)if(cls[k]&&R.real[k]&&R.rv[k]>=riverMin)river[k]=1}
  else if(w.rvReal){const low=new Int32Array(NC).fill(-1);const big=c=>w.rvReal[c]&&(w.rv0?w.rv0[c]:w.rv[c])>=riverMin;
    for(let c=0;c<NC;c++){if(!big(c))continue;const cx=c%W,cy=(c/W)|0;let b=-1,be=1e9;for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++){const k=(cy*SC+dy)*HW+cx*SC+dx;if(cls[k]&&e[k]<be){be=e[k];b=k}}low[c]=b}
    for(let c=0;c<NC;c++){if(low[c]<0)continue;const d=w.down[c];if(d<0||low[d]<0)continue;
      let x0=fx(low[c]),y0=fy(low[c]),x1=fx(low[d]),y1=fy(low[d]);let dx=x1-x0;if(dx>HW/2)dx-=HW;if(dx<-HW/2)dx+=HW;const dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy));
      for(let t=0;t<=n;t++){const x=(Math.round(x0+dx*t/Math.max(1,n))%HW+HW)%HW,y=Math.round(y0+dy*t/Math.max(1,n)),k=y*HW+x;if(cls[k])river[k]=1}}}
  for(let k=0;k<NF;k++)if(river[k])wt[k]+=area[k]*1.0;
  // capacity: the coarse capacity shared among its fine cells by that weight; cells with no coarse capacity (shelves drowned by
  // the time it was measured, ice) get the typical capacity per unit of weight
  // the coarse capacity was measured with the coarse floodplain (the share of a 100 km cell within 30 m of its lowest ground),
  // which in dry country took the flat desert beside an incised river for floodplain (Nubia half floodplain, Egypt's valley a
  // quarter): there, its river part is scaled to the fine floodplain
  let capC=o.capC;
  if(o.ff&&w.ffp){capC=Float32Array.from(o.capC);const sf=new Float64Array(NC),sn=new Float64Array(NC);
    for(let k=0;k<NF;k++)if(cls[k]===1){const c=((fy(k)/SC)|0)*W+((fx(k)/SC)|0);sf[c]+=o.ff[k];sn[c]++}
    for(let c=0;c<NC;c++){if(!sn[c]||!(w.ffp[c]>0)||!(capC[c]>0))continue;const d=clamp((450-w.Pr[c])/200,0,1),r=Math.min(1,sf[c]/sn[c]/w.ffp[c]);capC[c]*=1-d*(1-r)}}
  const cap=new Float32Array(NF),wsum=new Float64Array(NC);
  for(let k=0;k<NF;k++)if(cls[k]===1)wsum[((fy(k)/SC)|0)*W+((fx(k)/SC)|0)]+=wt[k];
  const ratios=[];for(let c=0;c<NC;c++)if(wsum[c]>0&&capC[c]>0)ratios.push(capC[c]/wsum[c]);ratios.sort((a,b)=>a-b);const rho=ratios.length?ratios[ratios.length>>1]:1;
  for(let k=0;k<NF;k++){if(!cls[k])continue;const c=((fy(k)/SC)|0)*W+((fx(k)/SC)|0);cap[k]=cls[k]===1&&capC[c]>0&&wsum[c]>0?capC[c]*wt[k]/wsum[c]:wt[k]*rho*0.5}
  // in dry country a river's floodplain is the only farmland, often narrower than a 25 km cell (the Nile above the Delta, the
  // Indus in Sindh): it is ground of its own, never a line between provinces. Provinces of the desert around do not reach into
  // it, nor valley provinces out (grp: the ground a province may grow over; 3 for a dry valley: under 400 mm of rain, river cells
  // and cells at least a fifth floodplain or a tenth watered fan)
  const grp=Uint8Array.from(cls);let valley=0;
  if(o.ff)for(let k=0;k<NF;k++){if(cls[k]!==1||w.pHi[k]>=400)continue;if(river[k]||o.ff[k]>=0.2||fan&&fan[k]>=0.1){river[k]=0;grp[k]=3;valley++}}
  const stepCost=(a,b,ns)=>(ns?1:Math.cos(latF[fy(a)]))*(1+Math.abs(e[b]-e[a])/150+slope[b]/600);
  const pid=new Int32Array(NF).fill(-1);
  const heap=mkHeap;
  const order=[];for(let k=0;k<NF;k++)if(cls[k]&&!river[k])order.push(k);
  let total=0;for(const k of order)total+=cap[k];
  // how much land a province takes here: its share of people over the local capacity per km2 (smoothed over the coarse cell),
  // between one fine cell and some days' travel across (radius rMax fine cells)
  // (capacity per km2 smoothed over the 3x3 fine cells around: wide enough to even out noise, narrow enough that the desert
  // beside the Nile does not borrow the valley's crowd)
  const dens=new Float32Array(NF);for(const k of order){const x=fx(k),y=fy(k);let c=0,a=0;for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=HH)continue;for(let dx=-1;dx<=1;dx++){const j=yy*HW+((x+dx)%HW+HW)%HW;if(cls[j]===cls[k]){c+=cap[j];a+=area[j]}}}dens[k]=c/Math.max(1,a)}
  const aMin=Math.pow(111.32*180/HH,2)*0.9,aMax=Math.PI*Math.pow(rMax*111.32*180/HH,2);
  // each province holds about the same number of people at the land's pre-industrial peak (Nein, 2026-11-05: alpha 1), between
  // one fine cell and some days' travel across, so valleys come out narrow and deserts wide (alpha 0.5 gave crowded land larger
  // shares: area falling with the square root of capacity per km2)
  const AL=o.alpha??1;
  const want=(k,T)=>clamp(T/Math.pow(Math.max(dens[k],1e-6),AL),aMin,aMax);
  // the share of people per province that gives the wanted count
  let lo=1e-6,hi=1e12;for(let it=0;it<60;it++){const T=Math.sqrt(lo*hi);let n=0;for(const k of order)n+=area[k]/want(k,T);if(n>count)lo=T;else hi=T}
  let T=Math.sqrt(lo*hi);
  // seeds scattered at about a province's width apart (dart throwing, in a fixed order so the map is the same every time)
  const rnd=mulberry32(hashStr('provinces:'+w.seed)),perm=order.slice();for(let i=perm.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[perm[i],perm[j]]=[perm[j],perm[i]]}
  const GS=8,gw=Math.ceil(HW/GS),gh=Math.ceil(HH/GS);let seeds=[];
  const kmX=k=>Math.cos(latF[fy(k)])*111.32*360/HW,kmY=111.32*180/HH;
  // dart throwing packs fewer seeds than the areas promise: repeat with the share adjusted until the count is within 3%
  for(let tries=0;tries<5;tries++){const grid=Array.from({length:gw*gh},()=>[]);seeds=[];
  for(const k of perm){const r=0.9*Math.sqrt(want(k,T)/Math.PI)*2,x=fx(k),y=fy(k),gx=(x/GS)|0,gy=(y/GS)|0,rg=Math.ceil(r/kmY/GS)+1;let ok=true;
    for(let yy=Math.max(0,gy-rg);yy<=Math.min(gh-1,gy+rg)&&ok;yy++)for(let xx=gx-rg;xx<=gx+rg&&ok;xx++){for(const q of grid[yy*gw+((xx%gw)+gw)%gw]){if(cls[q]!==cls[k])continue;let dx=Math.abs(fx(q)-x);dx=Math.min(dx,HW-dx);const dd=Math.hypot(dx*kmX(k),(fy(q)-y)*kmY);if(dd<0.5*(r+0.9*Math.sqrt(want(q,T)/Math.PI)*2)){ok=false;break}}}
    if(ok){seeds.push(k);grid[gy*gw+gx].push(k)}}
    if(Math.abs(seeds.length-count)<0.03*count)break;T*=Math.pow(seeds.length/count,1.05)}
  let np=seeds.length;const pid0=pid;for(let p=0;p<np;p++)pid0[seeds[p]]=p;let pCap=new Array(np).fill(0);
  // evening out: re-centre each seed on its province's capacity-weighted middle, then reassign every cell to the seed it reaches
  // most cheaply, with provinces holding too many people made dearer to reach and those holding too few cheaper
  const mult=new Float32Array(np).fill(1);
  for(let round=0;round<5;round++){
    const sx=new Float64Array(np),sy=new Float64Array(np),sz=new Float64Array(np),ref=new Int32Array(np).fill(-1);
    for(const k of order){const p=pid[k];if(p<0)continue;if(ref[p]<0)ref[p]=k;let x=fx(k);const rx=fx(ref[p]);if(x-rx>HW/2)x-=HW;if(rx-x>HW/2)x+=HW;const wv=cap[k]+1e-6;sx[p]+=x*wv;sy[p]+=fy(k)*wv;sz[p]+=wv}
    const seed=new Int32Array(np).fill(-1),best=new Float64Array(np).fill(Infinity);
    if(round===0)for(let p=0;p<np;p++)seed[p]=seeds[p];
    else for(const k of order){const p=pid[k];if(p<0)continue;const cx=sx[p]/sz[p],cy=sy[p]/sz[p];let dx=Math.abs(fx(k)-((cx%HW)+HW)%HW);dx=Math.min(dx,HW-dx);const dd=dx*dx+(fy(k)-cy)*(fy(k)-cy);if(dd<best[p]){best[p]=dd;seed[p]=k}}
    const dist=new Float32Array(NF).fill(Infinity),own=new Int32Array(NF).fill(-1),H2=heap();
    for(let p=0;p<np;p++)if(seed[p]>=0){dist[seed[p]]=0;own[seed[p]]=p;H2.push(0,seed[p])}
    while(H2.size){const [d,k]=H2.pop();if(d>dist[k])continue;const p=own[k];
      nb4(k,(j,ns)=>{if(river[j]||grp[j]!==grp[k])return;const nd=d+stepCost(k,j,ns)*mult[p];if(nd<dist[j]&&nd<=rMax*2*mult[p]){dist[j]=nd;own[j]=p;H2.push(nd,j)}})}
    for(const k of order)if(own[k]>=0)pid[k]=own[k];
    pCap=new Array(np).fill(0);for(const k of order)if(pid[k]>=0)pCap[pid[k]]+=cap[k];
    for(let p=0;p<np;p++){if(pCap[p]<=0)continue;mult[p]*=clamp(Math.pow(pCap[p]/T,0.25),0.8,1.25)}}
  // a cell left unclaimed (beyond every seed's reach after evening out) joins its claimed neighbour
  for(let pass=0;pass<20;pass++){let left=0;for(const k of order){if(pid[k]>=0)continue;let b=-1;nb4(k,j=>{if(b<0&&pid[j]>=0&&grp[j]===grp[k]&&!river[j])b=pid[j]});if(b>=0)pid[k]=b;else left++}if(!left)break}
  // dry valley ground and watered fans no seed reached are provinces of their own, one to each patch (a fan below the Bolan is not
  // the hill province beside it); anything else still unclaimed joins any neighbour of its own kind of land
  // (a patch with under 300 km2 of floodplain or watered fan stays with its neighbour)
  for(const k0 of order){if(pid[k0]>=0||grp[k0]!==3)continue;const id=np;let c=0,wa=0;const st=[k0],got=[k0];pid[k0]=id;
    while(st.length){const k=st.pop();c+=cap[k];wa+=area[k]*Math.max(o.ff[k],fan?fan[k]:0);nb4(k,j=>{if(pid[j]<0&&grp[j]===3&&!river[j]){pid[j]=id;st.push(j);got.push(j)}})}
    if(wa>=300){np++;pCap.push(c)}else for(const k of got)pid[k]=-2}
  for(const k of order)if(pid[k]===-2)pid[k]=-1;
  for(let pass=0;pass<20;pass++){let left=0;for(const k of order){if(pid[k]>=0)continue;let b=-1;nb4(k,j=>{if(b<0&&pid[j]>=0&&cls[j]===cls[k]&&!river[j])b=pid[j]});if(b>=0)pid[k]=b;else left++}if(!left)break}
  for(const k of order)if(pid[k]<0){pid[k]=np++;pCap.push(cap[k])}
  // river cells go to the bank province beside them holding the fewest people
  for(let k=0;k<NF;k++){if(!river[k])continue;let b=-1,bc=Infinity;nb4(k,j=>{const p=pid[j];if(p>=0&&!river[j]&&cls[j]===cls[k]&&pCap[p]<bc){bc=pCap[p];b=p}});if(b<0)nb4(k,j=>{if(b<0&&pid[j]>=0)b=pid[j]});pid[k]=b>=0?b:np++}
  // renumber, dropping provinces left empty
  const map=new Int32Array(np).fill(-1);let n2=0;for(let k=0;k<NF;k++){const p=pid[k];if(p<0)continue;if(map[p]<0)map[p]=n2++;pid[k]=map[p]}
  const pc=new Float64Array(n2),pa=new Float64Array(n2),pn=new Int32Array(n2);for(let k=0;k<NF;k++){const p=pid[k];if(p<0)continue;pc[p]+=cap[k];pa[p]+=area[k];pn[p]++}
  return{pid,np:n2,cap:pc,area:pa,cells:pn,river,cls,T,total,valley}
}
/* ---------- the province world ----------
   The world the model runs on, rebuilt from a province map: units 0..np-1 are the provinces, np..n-1 the open sea (one unit per
   100 km cell holding sea at the low stand of 12,000 BCE). Each unit gets every field the grid world has, worked out from its 25 km
   cells: climate and ground as area-weighted means, rivers and hollows from the 25 km drainage, floodplain from GFPLAIN and the
   ground beside the rivers. Neighbours are lists: nbS/nbA (touching units; nbL the shared border in km) and snS/snA (touching
   at a corner too, for water spreading between seas). A great river runs between provinces: the banks share its size (rtS/rtA) */
function provinceWorld(w,pid,o){o=o||{};
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,D2R=Math.PI/180;
  const cls=new Uint8Array(NF);for(let k=0;k<NF;k++)cls[k]=e[k]>0?1:e[k]>SL0?2:0;
  const cOf=k=>((((k/HW)|0)/SC)|0)*W+(((k%HW)/SC)|0),latY=y=>(90-(y+0.5)*180/HH)*D2R;
  let np=0,stray=0;for(let k=0;k<NF;k++){if(!cls[k])continue;if(pid[k]<0)stray++;else if(pid[k]>=np)np=pid[k]+1}
  const seaU=new Int32Array(NC).fill(-1);let n=np;
  for(let k=0;k<NF;k++)if(!cls[k]||pid[k]<0){const c=cOf(k);if(seaU[c]<0)seaU[c]=n++}
  const uid=new Int32Array(NF);for(let k=0;k<NF;k++)uid[k]=cls[k]&&pid[k]>=0?pid[k]:seaU[cOf(k)];
  const fa=new Float32Array(HH);for(let y=0;y<HH;y++)fa[y]=(40075/HW)*(20004/HH)*Math.cos(latY(y));
  // the fine cells of each unit
  const cS=new Int32Array(n+1);for(let k=0;k<NF;k++)cS[uid[k]+1]++;for(let u=0;u<n;u++)cS[u+1]+=cS[u];
  const cA=new Int32Array(NF);{const f=cS.slice(0,n);for(let k=0;k<NF;k++)cA[f[uid[k]]++]=k}
  // local relief of each land cell: spread of the heights over the 5x5 cells around (125 km; the grid's 100 km cells measure the
  // spread within the cell, sea floor included on coasts)
  const RR=o.relR??2,rel=new Float32Array(NF);for(let k=0;k<NF;k++){if(!cls[k])continue;const x=k%HW,y=(k/HW)|0;let s=0,s2=0,m=0;
    for(let dy=-RR;dy<=RR;dy++){const yy=y+dy;if(yy<0||yy>=HH)continue;for(let dx=-RR;dx<=RR;dx++){const j=yy*HW+(x+dx+HW)%HW;if(!cls[j])continue;s+=e[j];s2+=e[j]*e[j];m++}}
    rel[k]=Math.sqrt(Math.max(0,s2/m-(s/m)*(s/m)))}
  const u={seed:w.seed,n,np,isProv:true,eHi:e,isEarth:w.isEarth,imported:w.imported,kgHi:w.kgHi,fitted:w.fitted,clim:w.clim,climateMeta:w.climateMeta,
    fitChanged:w.fitChanged,tHi:w.tHi,pHi:w.pHi,aHi:w.aHi,grade:w.grade,coarse:w,pid,uid,cS,cA,nb:null};
  const area=new Float32Array(n),T=new Float32Array(n),Pr=new Float32Array(n),amp=new Float32Array(n),elev=new Float32Array(n),rough=new Float32Array(n),
    land=new Uint8Array(n),lvl=new Float32Array(n),landNow=new Uint8Array(n),kgGrid=new Uint8Array(n),lat=new Float32Array(n),x3=new Float32Array(n),
    y3=new Float32Array(n),z3=new Float32Array(n),cosLon=new Float32Array(n),sinLon=new Float32Array(n),cxA=new Float32Array(n),cyA=new Float32Array(n),cosLat=new Float32Array(n);
  const extra=['rainSeasonality','dryMonths','growingMonths'].filter(key=>w[key]);for(const key of extra)u[key]=new Float32Array(n);
  const kc=new Int32Array(33),hs=[];
  for(let v=0;v<n;v++){let A=0,st=0,sp=0,sa=0,se=0,sr=0,X=0,Y=0,Z=0,n1=0,nl=0;const ex=extra.map(()=>0);hs.length=0;kc.fill(0);let kb=0,kbc=0;
    for(let q=cS[v];q<cS[v+1];q++){const k=cA[q],y=(k/HW)|0,a=fa[y],la=latY(y),lo=((k%HW)+0.5)/HW*2*Math.PI-Math.PI;
      A+=a;st+=a*w.tHi[k];sp+=a*w.pHi[k];sa+=a*w.aHi[k];se+=a*e[k];sr+=a*rel[k];X+=a*Math.cos(la)*Math.cos(lo);Y+=a*Math.cos(la)*Math.sin(lo);Z+=a*Math.sin(la);
      hs.push(e[k]);if(cls[k]===1)n1++;if(cls[k])nl++;extra.forEach((key,t)=>ex[t]+=a*w[key][cOf(k)]);
      if(w.kgHi){const c=w.kgHi[k];if(c>=1&&c<=31){kc[c]++;if(kc[c]>kbc){kbc=kc[c];kb=c}}}}
    const em=se/A,L=Math.hypot(X,Y,Z)||1;area[v]=A;T[v]=st/A;Pr[v]=Math.max(0,sp/A);amp[v]=sa/A;land[v]=v<np?1:0;
    elev[v]=land[v]?Math.max(em,5):Math.min(em,-5);rough[v]=land[v]?clamp(sr/A/700+Math.max(0,em-1200)/3000,0,1):0;
    hs.sort((a,b)=>a-b);lvl[v]=hs[hs.length-Math.ceil(hs.length/2)];landNow[v]=n1*2>=hs.length?1:0;kgGrid[v]=kb;
    const la=Math.asin(clamp(Z/L,-1,1)),lo=Math.atan2(Y,X);lat[v]=la;x3[v]=X/L;y3[v]=Y/L;z3[v]=Z/L;cosLon[v]=Math.cos(lo);sinLon[v]=Math.sin(lo);
    cxA[v]=(lo/D2R+180)/360*W-0.5;cyA[v]=(90-la/D2R)/180*H-0.5;cosLat[v]=Math.max(0.2,Math.cos(la));extra.forEach((key,t)=>u[key][v]=ex[t]/A)}
  Object.assign(u,{area,T,Pr,amp,elev,rough,land,lvl,landNow,land0:land.slice(),lat,x3,y3,z3,cosLon,sinLon,cxA,cyA,cosLat});if(w.kgHi)u.kgGrid=kgGrid;
  // neighbours: units touching along a cell edge (with the border's length) or at a corner (for the sea's spread)
  {const P4=new Map(),P8=new Set(),kmY=20004/HH;const add=(a,b,L)=>{const key=a<b?a*n+b:b*n+a;P4.set(key,(P4.get(key)||0)+L)},add8=(a,b)=>P8.add(a<b?a*n+b:b*n+a);
    for(let y=0;y<HH;y++)for(let x=0;x<HW;x++){const k=y*HW+x,a=uid[k],r=y*HW+(x+1)%HW;if(uid[r]!==a){add(a,uid[r],kmY);add8(a,uid[r])}
      if(y<HH-1){const d=k+HW;if(uid[d]!==a){add(a,uid[d],(40075/HW)*Math.cos((90-(y+1)*180/HH)*D2R));add8(a,uid[d])}
        for(const dx of [-1,1]){const j=(y+1)*HW+(x+dx+HW)%HW;if(uid[j]!==a)add8(a,uid[j])}}}
    const csr=(keys,len)=>{const deg=new Int32Array(n+1);for(const key of keys){deg[Math.floor(key/n)+1]++;deg[key%n+1]++}for(let v=0;v<n;v++)deg[v+1]+=deg[v];
      const S=deg.slice(),A=new Int32Array(S[n]),Lb=len?new Float32Array(S[n]):null,f=S.slice(0,n);
      for(const key of keys){const a=Math.floor(key/n),b=key%n,l=len?len.get(key):0;A[f[a]]=b;if(Lb)Lb[f[a]]=l;f[a]++;A[f[b]]=a;if(Lb)Lb[f[b]]=l;f[b]++}
      for(let v=0;v<n;v++){const idx=[];for(let q=S[v];q<S[v+1];q++)idx.push(q);idx.sort((p,q)=>A[p]-A[q]);const a2=idx.map(q=>A[q]),l2=Lb?idx.map(q=>Lb[q]):null;
        for(let t=0;t<idx.length;t++){A[S[v]+t]=a2[t];if(Lb)Lb[S[v]+t]=l2[t]}}
      return[S,A,Lb]};
    [u.nbS,u.nbA,u.nbL]=csr(Array.from(P4.keys()),P4);[u.snS,u.snA]=csr(Array.from(P8),null);
    u.nbW=Float32Array.from(u.nbL,l=>l/(20004/H));
    // distance between neighbouring middles, in cell heights (100 km)
    const D=new Float32Array(u.nbA.length);for(let v=0;v<n;v++)for(let q=u.nbS[v];q<u.nbS[v+1];q++){const j=u.nbA[q];D[q]=Math.max(0.05,Math.acos(clamp(x3[v]*x3[j]+y3[v]*y3[j]+z3[v]*z3[j],-1,1))*6371/(20004/H))}u.nbD=D;
    // the model's spreading was set for steps of 100 km: across a province border, a chance per year of crossing becomes the chance
    // of crossing that many times over the 100 km (hopK = 100 km / distance), and a flow between neighbours grows with the shared
    // border and falls with the distance twice over (once for the gradient, once for the steps): nbE = border/distance^2, both in
    // 100 km. A 100 km square of the grid gives 1 for both
    u.hopK=Float32Array.from(D,d=>clamp(1/d,0.2,6));
    // people per unit stand for how crowded a 100 km neighbourhood is in many places (contact, connection, who can innovate): a
    // province counts its people as if spread over a 100 km cell at its latitude (szF = that cell's area over the province's)
    u.szF=Float32Array.from(area,(a,v)=>v<np&&a>0?(40075/W)*(20004/H)*Math.cos(lat[v])/a:1);u.nbE=Float32Array.from(D,(d,q)=>clamp(u.nbW[q]/(d*d),0,6))}
  // home cell: the 100 km cell holding each unit's middle; hbS/hbA list the units at home in each cell (searches within a
  // radius go through these)
  {const hx=new Int16Array(n),hy=new Int16Array(n),cnt=new Int32Array(NC+1);
    for(let v=0;v<n;v++){hx[v]=((Math.round(cxA[v])%W)+W)%W;hy[v]=clamp(Math.round(cyA[v]),0,H-1);cnt[hy[v]*W+hx[v]+1]++}
    for(let c=0;c<NC;c++)cnt[c+1]+=cnt[c];const A=new Int32Array(n),f=cnt.slice(0,NC);for(let v=0;v<n;v++)A[f[hy[v]*W+hx[v]]++]=v;
    Object.assign(u,{hx,hy,hbS:cnt,hbA:A})}
  // the 100 km cells each unit covers, with its share in each (climate anomalies and other fields of the 100 km grid reach the
  // units through gridToUnits)
  {const S=new Int32Array(n+1),A=[],Wt=[];for(let v=0;v<n;v++){S[v]=A.length;const m=new Map();let tot=0;
      for(let q=cS[v];q<cS[v+1];q++){const k=cA[q],a=fa[(k/HW)|0],c=cOf(k);m.set(c,(m.get(c)||0)+a);tot+=a}
      for(const [c,a] of Array.from(m).sort((x,y)=>x[0]-y[0])){A.push(c);Wt.push(a/tot)}}
    S[n]=A.length;u.gcS=S;u.gcA=Int32Array.from(A);u.gcW=Float32Array.from(Wt)}
  shoreline(u);const landList=u.landIdx;
  // rivers and drainage on the 25 km grid
  const FR=fineRivers(w),D=fineDrain(w,FR),fz=fineHollows(w),ff=fineFloodplain(w,FR,o.fp||null),fanF=o.noFans||swOn('nofan')?null:fineFans(w,FR,D);u.fineRv=FR.rv;u.fineReal=FR.real;u.fineOn=FR.on;u.fineDn=D.down;
  // each province drains from its most downstream cell (on a province with rivers, the most downstream cell of its largest);
  // where that would close a loop, from its most downstream cell of all (strictly nearer the sea than any of its own cells)
  const maxRv=new Float32Array(n),down=new Int32Array(n).fill(-1);
  const hasTr=new Uint8Array(n);for(let v=0;v<np;v++)for(let q=cS[v];q<cS[v+1];q++){const k=cA[q];if(FR.on[k]){hasTr[v]=1;maxRv[v]=Math.max(maxRv[v],FR.rv[k])}}
  const pick=(v,riv)=>{let b=-1,bd=Infinity;for(let q=cS[v];q<cS[v+1];q++){const k=cA[q];if(!cls[k]||riv&&!(FR.on[k]&&FR.rv[k]>=maxRv[v]))continue;if(D.dep[k]<bd){bd=D.dep[k];b=k}}return b};
  const drainTo=(v,k)=>{if(k<0)return -1;const d=D.down[k];if(d>=0)return uid[d];let s=-1;fn8(k,j=>{if(s<0&&!cls[j])s=uid[j]});return s};
  for(let v=0;v<np;v++){let t=hasTr[v]?drainTo(v,pick(v,true)):-2;if(t===v||t===-2)t=drainTo(v,pick(v,false));down[v]=t===v?-1:t}
  // a river ending in a closed hollow (Lake Chad, the Aral, Baikal) drains on, when its lake overflows, the way the ground leads
  // out of the hollow; whether it does is the lakes' to decide
  const sinkU=new Uint8Array(n);u.sinkU=sinkU;
  if(FR.sinkL&&FR.fdT)for(const z of FR.sinkL){const a=FR.low[z];if(a<0)continue;const v=pid[a];if(v<0||down[v]!==-1)continue;
    let c=FR.fdT[z];for(let st=0;st<60&&c>=0;st++){if(!w.land[c]){down[v]=seaU[c]>=0?seaU[c]:-1;break}
      const cx=c%W,cy=(c/W)|0;let b=-1,be=1e9;for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++){const k=(cy*SC+dy)*HW+cx*SC+dx;if(cls[k]&&e[k]<be){be=e[k];b=k}}
      if(b>=0&&uid[b]!==v&&land[uid[b]]){down[v]=uid[b];break}c=FR.fdT[c]}if(down[v]!==-1)sinkU[v]=1}
  for(let rep=0;rep<20;rep++){const st=new Uint8Array(n);let fixed=0;
    for(let v0=0;v0<np;v0++){if(st[v0])continue;const P=[];let v=v0;while(v>=0&&v<np&&!st[v]){st[v]=1;P.push(v);v=down[v]}
      if(v>=0&&v<np&&st[v]===1){let x=v;do{const nx=down[x];const t=drainTo(x,pick(x,false));if(t!==down[x]){down[x]=t===x?-1:t;fixed++}x=nx}while(x!==v&&x>=0)}
      for(const q of P)st[q]=2}
    if(!fixed)break}
  // order by distance from the mouth, so water is passed downstream in turn
  const dep=new Int32Array(n).fill(-1);for(const v0 of landList){if(dep[v0]>=0)continue;const P=[];let v=v0;while(v>=0&&land[v]&&dep[v]<0&&P.length<n){P.push(v);v=down[v]}
    let d=v>=0&&land[v]&&dep[v]>=0?dep[v]:-1;for(let t=P.length-1;t>=0;t--)dep[P[t]]=++d}
  const order=Int32Array.from(Array.from(landList).sort((a,b)=>dep[a]-dep[b]));
  const acc=new Float32Array(n);for(const v of landList)acc[v]=Math.max(0,Pr[v]-200)*area[v]*1e-4*(T[v]<-9?0.2:1);
  for(let k=order.length-1;k>=0;k--){const v=order[k],d=down[v];if(d>=0&&land[d])acc[d]+=acc[v]}
  // river size: the grid's threshold (3,600, some 1,100 m3/s by the model's runoff) left the Euphrates above the Tigris no river;
  // provinces count rivers from half that (Nein, 2026-11-05)
  const th=w.isEarth?1800:1250,rv=new Float32Array(n);u.rvTh=th;for(const v of landList)rv[v]=acc[v]>th?clamp(Math.log(acc[v]/th)/Math.log(100)+0.2,0,1):0;
  // a river belongs to the provinces on both its banks: one holds its cells (on a great river, the bank holding fewer people),
  // the other touches them and shares its size (rtS/rtA: the provinces whose river a province shares). Only a cell on the
  // holder's main river counts, not a tributary at its edge; provinces on a mapped course
  const rvReal=new Uint8Array(n),RT=new Set();
  for(let k=0;k<NF;k++){if(!cls[k]||pid[k]<0)continue;if(FR.real[k])rvReal[pid[k]]=1;if(!FR.on[k]||FR.rv[k]<0.9*maxRv[pid[k]])continue;const q=pid[k],x=k%HW,y=(k/HW)|0;
    for(const j of [y*HW+(x+1)%HW,y*HW+(x+HW-1)%HW,y>0?k-HW:-1,y<HH-1?k+HW:-1]){if(j<0||!cls[j])continue;const p=pid[j];if(p>=0&&p!==q)RT.add(p*n+q)}}
  {const keys=Array.from(RT).sort((a,b)=>a-b),S=new Int32Array(n+1),A=new Int32Array(keys.length);for(const key of keys)S[Math.floor(key/n)+1]++;for(let v=0;v<n;v++)S[v+1]+=S[v];
    const f=S.slice(0,n);for(const key of keys)A[f[Math.floor(key/n)]++]=key%n;u.rtS=S;u.rtA=A;
    for(const v of landList)for(let q=S[v];q<S[v+1];q++){if(rvReal[A[q]])rvReal[v]=1;rv[v]=Math.max(rv[v],rv[A[q]])}}
  Object.assign(u,{down,order,acc,rv,rvReal});
  // hollows: how deep the unit's ground lies below the level its hollow spills at (fillD, mean over its cells), and that level
  // at its lowest cell (fillZ); pour: the first unit beyond the rim along the drainage
  // hsh: the share of the province lying more than a metre below its spill level, all a lake can cover
  {const fillD=new Float32Array(n),fillZ=new Float32Array(n).fill(-1e9),hsh=new Float32Array(n);
    for(const v of landList){let A=0,s=0,lo=Infinity,ah=0;for(let q=cS[v];q<cS[v+1];q++){const k=cA[q],a=fa[(k/HW)|0];if(!cls[k])continue;A+=a;const d=Math.max(0,fz[k]-e[k]);s+=a*d;if(d>1)ah+=a;if(e[k]<lo){lo=e[k];fillZ[v]=fz[k]}}fillD[v]=A?s/A:0;hsh[v]=A?ah/A:0}
    u.hsh=hsh;
    const pour=new Int32Array(n).fill(-1),inH=v=>fillD[v]>1&&!rvReal[v];
    for(const v of landList){if(!inH(v))continue;let j=down[v],k=0;while(j>=0&&land[j]&&inH(j)&&k<400){j=down[j];k++}pour[v]=j>=0&&land[j]?j:-1}
    Object.assign(u,{fillD,fillZ,pour})}
  // floodplain share of each unit
  {const ffp=new Float32Array(n);for(const v of landList){let A=0,s=0;for(let q=cS[v];q<cS[v+1];q++){const k=cA[q],a=fa[(k/HW)|0];if(!cls[k])continue;A+=a;s+=a*ff[k]}ffp[v]=A?s/A:0}u.ffp=ffp}
  // the share of each province watered by hill streams on fans and piedmont (fineFans)
  if(fanF){const fan=new Float32Array(n);for(const v of landList){let A=0,s=0;for(let q=cS[v];q<cS[v+1];q++){const k=cA[q],a=fa[(k/HW)|0];if(!cls[k])continue;A+=a;s+=a*fanF[k]}fan[v]=A?s/A:0}u.fan=fan}
  deriveLand(u);weatherWeights(u);seaLanes(u);
  if(w.isEarth){
    // target regions are drawn on today's coasts, where the measurements are taken
    const nowList=Array.from(landList).filter(v=>landNow[v]),LA=v=>lat[v]/D2R,LO=v=>(cxA[v]+0.5)/W*360-180;
    u.regions=REGIONS.map(R=>{const cells=[];for(const v of nowList){const la=LA(v),lo=LO(v);if(la>=R.box[0]&&la<=R.box[1]&&lo>=R.box[2]&&lo<=R.box[3])cells.push(v)}return Object.assign({},R,{cells:Int32Array.from(cells)})});
    const med=[],china=[];
    for(const v of nowList){const la=LA(v),lo=LO(v);
      if(la>=21&&la<=41&&lo>=100&&lo<=122)china.push(v);
      if(la>=30&&la<=46.5&&lo>=-10&&lo<=37){let near=false;const cx=Math.floor((lo+180)/360*HW),cy=Math.floor((90-la)/180*HH);
        for(let dy=-8;dy<=8&&!near;dy++)for(let dx=-8;dx<=8;dx++){const yy=cy+dy;if(yy<0||yy>=HH)continue;const j=yy*HW+(cx+dx+HW)%HW;
          if(e[j]>0)continue;const la2=90-(yy+0.5)*180/HH,lo2=(((cx+dx+HW)%HW)+0.5)*360/HW-180;
          if(lo2>-5.6&&!(la2>40.8&&lo2>26.5)&&la2<46&&lo2<37){near=true;break}}
        if(near)med.push(v)}}
    u.medCells=Int32Array.from(med);u.chinaCells=Int32Array.from(china);
    u.iceY=new Float32Array(n).fill(-1e9);
    const ICE=[[59,-80,-6500,5500,16],[56,-127,-10000,2000,8],[64,17,-8000,4000,8]];
    for(let v=0;v<n;v++){if(!land[v])continue;for(const [la0,lo0,y0,span,R] of ICE){const p0=la0*D2R,l0=lo0*D2R;
      const d=Math.acos(clamp(Math.sin(lat[v])*Math.sin(p0)+Math.cos(lat[v])*Math.cos(p0)*(cosLon[v]*Math.cos(l0)+sinLon[v]*Math.sin(l0)),-1,1))/D2R;
      if(d<=R*1.15)u.iceY[v]=Math.max(u.iceY[v],y0-span*d/R)}}
  }
  u.stray=stray;return u}
