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
function buildProvinces(w,o){
  const NF=HW*HH,e=w.eHi,SL0=w.isEarth?SEA_LOW:0,count=o.count||26000,rMax=o.rMax||6,riverMin=o.riverMin??0.75;
  const cls=new Uint8Array(NF);for(let k=0;k<NF;k++)cls[k]=e[k]>0?1:e[k]>SL0?2:0;
  const fy=k=>(k/HW)|0,fx=k=>k%HW,latF=new Float32Array(HH);for(let y=0;y<HH;y++)latF[y]=(90-(y+0.5)*180/HH)*Math.PI/180;
  const nb4=(k,f)=>{const x=fx(k),y=fy(k);f(y*HW+(x+1)%HW,0);f(y*HW+(x+HW-1)%HW,0);if(y>0)f(k-HW,1);if(y<HH-1)f(k+HW,1)};
  // what each fine cell can grow: plant growth from its own climate (the model's formula), flatness, floodplain
  const slope=new Float32Array(NF),wt=new Float32Array(NF),area=new Float32Array(NF),fp=o.fp||null;
  for(let k=0;k<NF;k++){if(!cls[k])continue;let s=0;nb4(k,j=>{if(cls[j]){const d=Math.abs(e[j]-e[k]);if(d>s)s=d}});slope[k]=s;
    const T=w.tHi[k],P=Math.max(0,w.pHi[k]),A=w.aHi[k],npp=Math.min(3000/(1+Math.exp(1.315-0.119*(T+A*0.15))),3000*(1-Math.exp(-0.000664*P)));
    const f=fp&&fp[k]!==255?fp[k]/250:0;area[k]=Math.pow(111.32*180/HH,2)*Math.cos(latF[fy(k)]);
    // in dry land the people live by the water: rain-fed growth counts only above 250 mm, and floodplain counts on its own
    const rainNpp=P>250?npp:npp*Math.max(0,(P-100)/150);
    wt[k]=area[k]*((rainNpp/1000)*(0.25+0.75*Math.exp(-s/150))+1.5*f+0.002)}
  // great rivers on the fine grid: through the lowest fine cell of each coarse river province, joined downstream
  const river=new Uint8Array(NF);
  if(w.rvReal){const low=new Int32Array(N).fill(-1);const big=c=>w.rvReal[c]&&(w.rv0?w.rv0[c]:w.rv[c])>=riverMin;
    for(let c=0;c<N;c++){if(!big(c))continue;const cx=c%W,cy=(c/W)|0;let b=-1,be=1e9;for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++){const k=(cy*SC+dy)*HW+cx*SC+dx;if(cls[k]&&e[k]<be){be=e[k];b=k}}low[c]=b}
    for(let c=0;c<N;c++){if(low[c]<0)continue;const d=w.down[c];if(d<0||low[d]<0)continue;
      let x0=fx(low[c]),y0=fy(low[c]),x1=fx(low[d]),y1=fy(low[d]);let dx=x1-x0;if(dx>HW/2)dx-=HW;if(dx<-HW/2)dx+=HW;const dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy));
      for(let t=0;t<=n;t++){const x=(Math.round(x0+dx*t/Math.max(1,n))%HW+HW)%HW,y=Math.round(y0+dy*t/Math.max(1,n)),k=y*HW+x;if(cls[k])river[k]=1}}}
  for(let k=0;k<NF;k++)if(river[k])wt[k]+=area[k]*1.0;
  // capacity: the coarse capacity shared among its fine cells by that weight; cells with no coarse capacity (shelves drowned by
  // the time it was measured, ice) get the typical capacity per unit of weight
  const cap=new Float32Array(NF),wsum=new Float64Array(N);
  for(let k=0;k<NF;k++)if(cls[k]===1)wsum[((fy(k)/SC)|0)*W+((fx(k)/SC)|0)]+=wt[k];
  const ratios=[];for(let c=0;c<N;c++)if(wsum[c]>0&&o.capC[c]>0)ratios.push(o.capC[c]/wsum[c]);ratios.sort((a,b)=>a-b);const rho=ratios.length?ratios[ratios.length>>1]:1;
  for(let k=0;k<NF;k++){if(!cls[k])continue;const c=((fy(k)/SC)|0)*W+((fx(k)/SC)|0);cap[k]=cls[k]===1&&o.capC[c]>0&&wsum[c]>0?o.capC[c]*wt[k]/wsum[c]:wt[k]*rho*0.5}
  const stepCost=(a,b,ns)=>(ns?1:Math.cos(latF[fy(a)]))*(1+Math.abs(e[b]-e[a])/150+slope[b]/600);
  const pid=new Int32Array(NF).fill(-1);
  // a small binary heap of [cost, cell]
  const heap=()=>{const K=[],V=[];return{K,V,push(k,v){let n=K.length;K.push(k);V.push(v);while(n>0){const p=(n-1)>>1;if(K[p]<=K[n])break;[K[p],K[n]]=[K[n],K[p]];[V[p],V[n]]=[V[n],V[p]];n=p}},
    pop(){const k=K[0],v=V[0],lk=K.pop(),lv=V.pop();if(K.length){K[0]=lk;V[0]=lv;let n=0;for(;;){const l=2*n+1,r=l+1;let m=n;if(l<K.length&&K[l]<K[m])m=l;if(r<K.length&&K[r]<K[m])m=r;if(m===n)break;[K[m],K[n]]=[K[n],K[m]];[V[m],V[n]]=[V[n],V[m]];n=m}}return[k,v]},get size(){return K.length}}};
  const order=[];for(let k=0;k<NF;k++)if(cls[k]&&!river[k])order.push(k);
  let total=0;for(const k of order)total+=cap[k];
  // how much land a province takes here: its share of people over the local capacity per km2 (smoothed over the coarse cell),
  // between one fine cell and some days' travel across (radius rMax fine cells)
  // (capacity per km2 smoothed over the 3x3 fine cells around: wide enough to even out noise, narrow enough that the desert
  // beside the Nile does not borrow the valley's crowd)
  const dens=new Float32Array(NF);for(const k of order){const x=fx(k),y=fy(k);let c=0,a=0;for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=HH)continue;for(let dx=-1;dx<=1;dx++){const j=yy*HW+((x+dx)%HW+HW)%HW;if(cls[j]===cls[k]){c+=cap[j];a+=area[j]}}}dens[k]=c/Math.max(1,a)}
  const aMin=Math.pow(111.32*180/HH,2)*0.9,aMax=Math.PI*Math.pow(rMax*111.32*180/HH,2);
  // provinces in crowded land hold more people than those in thin land, but are still smaller: area falls with the square root of
  // the capacity per km2 (Egypt's 42 nomes held some 40,000 people each; France's departments in 1800 over 200,000), so dense
  // farmland is not cut into single fine cells while valleys still come out narrow and deserts wide
  const AL=o.alpha??0.5;
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
      nb4(k,(j,ns)=>{if(river[j]||cls[j]!==cls[k])return;const nd=d+stepCost(k,j,ns)*mult[p];if(nd<dist[j]&&nd<=rMax*2*mult[p]){dist[j]=nd;own[j]=p;H2.push(nd,j)}})}
    for(const k of order)if(own[k]>=0)pid[k]=own[k];
    pCap=new Array(np).fill(0);for(const k of order)if(pid[k]>=0)pCap[pid[k]]+=cap[k];
    for(let p=0;p<np;p++){if(pCap[p]<=0)continue;mult[p]*=clamp(Math.pow(pCap[p]/T,0.25),0.8,1.25)}}
  // a cell left unclaimed (beyond every seed's reach after evening out) joins its claimed neighbour
  for(let pass=0;pass<20;pass++){let left=0;for(const k of order){if(pid[k]>=0)continue;let b=-1;nb4(k,j=>{if(b<0&&pid[j]>=0&&cls[j]===cls[k]&&!river[j])b=pid[j]});if(b>=0)pid[k]=b;else left++}if(!left)break}
  for(const k of order)if(pid[k]<0){pid[k]=np++;pCap.push(cap[k])}
  // river cells go to the bank province beside them holding the fewest people
  for(let k=0;k<NF;k++){if(!river[k])continue;let b=-1,bc=Infinity;nb4(k,j=>{const p=pid[j];if(p>=0&&!river[j]&&cls[j]===cls[k]&&pCap[p]<bc){bc=pCap[p];b=p}});if(b<0)nb4(k,j=>{if(b<0&&pid[j]>=0)b=pid[j]});pid[k]=b>=0?b:np++}
  // renumber, dropping provinces left empty
  const map=new Int32Array(np).fill(-1);let n2=0;for(let k=0;k<NF;k++){const p=pid[k];if(p<0)continue;if(map[p]<0)map[p]=n2++;pid[k]=map[p]}
  const pc=new Float64Array(n2),pa=new Float64Array(n2),pn=new Int32Array(n2);for(let k=0;k<NF;k++){const p=pid[k];if(p<0)continue;pc[p]+=cap[k];pa[p]+=area[k];pn[p]++}
  return{pid,np:n2,cap:pc,area:pa,cells:pn,river,cls,T,total}
}
