"use strict";
/* ================= CLIMATE MODEL =================
   Our own simplified planetary climate, built from standard textbook pieces:
   - orbital insolation by latitude and month (Berger 1978 geometry)
   - an energy balance per column, OLR = A + B*T (Budyko 1969; Sellers 1969; North & Coakley 1979)
   - land/ocean heat capacity, so seasons and continentality emerge
   - zonal-mean meridional heat diffusion (North 1975), solved implicitly
   - zonal advection by prevailing winds (maritime west coasts in the westerlies)
   - wind-driven ocean currents as boundary heat fluxes (warm western-boundary, cold eastern-boundary)
   The model runs on a coarse grid (CW x CH) and is interpolated to the map with a lapse-rate correction. */
const CW=200,CH=100,CN=CW*CH,CSC=HW/CW;     // 1.8 degree cells; CSC hi-res pixels per climate cell
const CDEF2=[
  // key, label, min, max, step, default, note
  ['S0','Solar constant (W/m²)',1200,1500,1,1361,'Sunlight at the top of the atmosphere.'],
  ['A','Outgoing radiation at 0 °C (W/m²)',170,230,0.5,191,'Infrared emitted to space at 0 °C; the greenhouse effect lowers it.'],
  ['B','Radiation per °C (W/m²/°C)',1.4,2.6,0.02,2.216,'How fast emission rises with temperature (includes water-vapour feedback).'],
  ['D','Poleward heat transport',0.2,1.2,0.01,0.66,'Diffusive heat carried toward the poles by winds and oceans.'],
  ['albO','Ocean and cloud albedo',0.15,0.45,0.005,0.264,'Planetary albedo over open ocean, clouds included.'],
  ['albL','Land albedo',0.15,0.5,0.005,0.331,'Planetary albedo over snow-free land, clouds included.'],
  ['albI','Snow and ice albedo',0.4,0.8,0.01,0.456,'Planetary albedo over snow, ice sheets and sea ice.'],
  ['albCl','Tropical cloud albedo',0,0.2,0.005,0.062,'Extra reflection by deep clouds near the equator.'],
  ['mixL','Mixed-layer depth (m)',10,150,1,24.8,'Depth of the ocean surface layer that stores seasonal heat.'],
  ['cLand','Land heat capacity (MJ/m²/°C)',2,40,0.5,21.12,'Heat stored by land and the air above it; low values give extreme seasons.'],
  ['gam','Local mixing (W/m²/°C)',0,15,0.1,12.1,'How strongly each place is pulled toward its latitude\'s mean.'],
  ['adv','Wind transport of heat',0,0.6,0.01,0.502,'How far prevailing winds carry ocean temperatures inland.'],
  ['curr','Ocean current strength (W/m²)',0,80,0.5,1.2,'Heat brought or removed by boundary currents near coasts.'],
  ['lapse','Lapse rate (°C/km)',4,8,0.05,6.0,'Cooling with altitude.'],
];
const CLM={};for(const d of CDEF2)CLM[d[0]]=d[5];
const ORB_NOW={ecc:0.0167,obl:23.44,peri:282.9};

/* daily-mean top-of-atmosphere insolation (W/m²) at latitude phi (radians) for a solar longitude lam (degrees) */
function insolation(phi,lam,orb,S0){
  const d2r=Math.PI/180,eps=orb.obl*d2r,L=lam*d2r,dec=Math.asin(Math.sin(eps)*Math.sin(L));
  const dist=Math.pow(1+orb.ecc*Math.cos(L-orb.peri*d2r),2)/Math.pow(1-orb.ecc*orb.ecc,2);
  const x=-Math.tan(phi)*Math.tan(dec),h0=x>=1?0:x<=-1?Math.PI:Math.acos(x);
  return Math.max(0,S0/Math.PI*dist*(h0*Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.sin(h0)));
}
// solar longitude at mid-month (vernal equinox about 20 March)
const MONTH_LAM=Array.from({length:12},(_,m)=>((m*30.44+15.2-79.5)/365.25*360+360)%360);

/* coarse grid derived from the hi-res heightmap */
function climPrep(eHi){
  const g={elev:new Float32Array(CN),land:new Float32Array(CN),lat:new Float32Array(CH),cosl:new Float32Array(CH)};
  for(let y=0;y<CH;y++){g.lat[y]=(90-(y+0.5)*180/CH)*Math.PI/180;g.cosl[y]=Math.cos(g.lat[y])}
  for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){let nl=0,se=0;
    for(let dy=0;dy<CSC;dy++)for(let dx=0;dx<CSC;dx++){const e=eHi[(y*CSC+dy)*HW+x*CSC+dx];if(e>0){nl++;se+=e}}
    const i=y*CW+x;g.land[i]=nl/(CSC*CSC);g.elev[i]=nl?se/nl:0}
  // ocean current heat flux: distance (in cells, same row) to land east and west, within the same basin
  const cur=new Float32Array(CN),LIM=12;
  for(let y=0;y<CH;y++){const la=Math.abs(90-(y+0.5)*180/CH);
    for(let x=0;x<CW;x++){const i=y*CW+x;if(g.land[i]>0.5)continue;
      let dE=99,dW=99;for(let k=1;k<=LIM;k++){if(g.land[y*CW+(x+k)%CW]>0.5){dE=k;break}}for(let k=1;k<=LIM;k++){if(g.land[y*CW+(x-k+CW)%CW]>0.5){dW=k;break}}
      const fE=dE<99?Math.exp(-dE/4):0,fW=dW<99?Math.exp(-dW/5):0;
      // subtropics: cold upwelling off west coasts (land to the east), warm western-boundary currents off east coasts
      const sub=Math.exp(-(((la-27)/11)**2)),mid=Math.exp(-(((la-52)/9)**2));
      cur[i]=-1.0*sub*fE+0.6*sub*fW+0.9*mid*fE-0.6*mid*fW}}
  g.cur=cur;
  // land within reach of a cold coastal current: marine inversions stop rain (Atacama, Namib, Baja, Western Sahara)
  const cold=new Float32Array(CN);
  for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const i=y*CW+x;if(g.land[i]<0.5)continue;let c=0;
    for(let dy=-3;dy<=3;dy++){const yy=y+dy;if(yy<0||yy>=CH)continue;for(let dx=-4;dx<=4;dx++){const j=yy*CW+(x+dx+CW)%CW;if(g.land[j]<0.5&&cur[j]<0)c=Math.max(c,-cur[j]*Math.exp(-(Math.abs(dx)+Math.abs(dy))/3))}}
    cold[i]=Math.min(1,c*1.5)}
  g.cold=cold;
  return g;
}

/* run the seasonal energy balance to a periodic state.
   opt: {orb, co2 (ppm), albLand: optional Float32Array(CN) land albedo, years}
   returns sea-level-equivalent monthly temperatures Tm[12*CN] */
// generator versions yield every few milliseconds so the page stays responsive while the climate re-solves
function drain(it){let r;while(!(r=it.next()).done);return r.value}
function climRun(g,opt){return drain(climRunG(g,opt))}
function* climRunG(g,opt){
  const P=Object.assign({},CLM,opt.par||{}),orb=opt.orb||ORB_NOW,co2=opt.co2||280,years=opt.years||14;
  const A=P.A-5.35*Math.log(co2/280)+(opt.dA||0),B=P.B,dt=365.25*86400/12;
  const Co=P.mixL*4.18e6,Cl=P.cLand*1e6;                       // J/m²/K
  const T=new Float32Array(CN).fill(12),Tm=new Float32Array(12*CN),Cdt=new Float32Array(CN),ab=new Float32Array(CN);
  for(let i=0;i<CN;i++){const f=g.land[i];Cdt[i]=((1-f)*Co+f*Cl)/dt}
  if(opt.init)T.set(opt.init);
  const Z=new Float64Array(CH),Zc=new Float64Array(CH),a=new Float64Array(CH),b=new Float64Array(CH),c=new Float64Array(CH),r=new Float64Array(CH);
  // meridional diffusion conductances between rows (North 1975 in x=sin(lat))
  const dphi=Math.PI/CH,kN=new Float64Array(CH+1);
  for(let e=1;e<CH;e++){const le=(90-e*180/CH)*Math.PI/180;kN[e]=P.D*Math.cos(le)/(dphi*dphi)}
  // prevailing zonal wind sign and strength by latitude: trades blow west, westerlies east
  const wind=new Float32Array(CH);for(let y=0;y<CH;y++){const la=Math.abs(g.lat[y])*180/Math.PI;wind[y]=la<30?-0.6*Math.sin(la/30*Math.PI):la<65?Math.sin((la-30)/35*Math.PI):-0.3}
  for(let yr=0;yr<years;yr++)for(let m=0;m<12;m++){
    const lam=MONTH_LAM[m];
    // 1. column energy balance, implicit in T
    for(let y=0;y<CH;y++){const Q=insolation(g.lat[y],lam,orb,P.S0),la=Math.abs(g.lat[y]),cl=P.albCl*Math.exp(-((la*180/Math.PI/12)**2));
      for(let x=0;x<CW;x++){const i=y*CW+x,f=g.land[i],ts=T[i]-P.lapse*g.elev[i]/1000;
        const snow=clamp((-ts-1)/8,0,1),ice=clamp((-T[i]-1.5)/4,0,1);
        const aL=opt.albLand?opt.albLand[i]:P.albL,alb=cl+(1-f)*(P.albO+(P.albI-P.albO)*ice)+f*(aL+(P.albI-aL)*snow*(g.elev[i]>2500?1:0.85));
        ab[i]=Q*(1-alb)+(1-f)*P.curr*g.cur[i];
        T[i]=(Cdt[i]*T[i]+ab[i]-A)/(Cdt[i]+B)}}
    // 2. zonal-mean meridional diffusion (implicit, tridiagonal), added back as a row-uniform change
    for(let y=0;y<CH;y++){let s=0,sc=0;for(let x=0;x<CW;x++){const i=y*CW+x;s+=T[i];sc+=Cdt[i]}Z[y]=s/CW;Zc[y]=sc/CW}
    for(let y=0;y<CH;y++){const cy=g.cosl[y],kn=kN[y]/cy,ks=kN[y+1]/cy;a[y]=-kn;c[y]=-ks;b[y]=Zc[y]+kn+ks;r[y]=Zc[y]*Z[y]}
    for(let y=1;y<CH;y++){const w=a[y]/b[y-1];b[y]-=w*c[y-1];r[y]-=w*r[y-1]}
    const Zn=new Float64Array(CH);Zn[CH-1]=r[CH-1]/b[CH-1];for(let y=CH-2;y>=0;y--)Zn[y]=(r[y]-c[y]*Zn[y+1])/b[y];
    // 3. local mixing toward the latitude mean, and the diffusion increment
    for(let y=0;y<CH;y++){const dZ=Zn[y]-Z[y];for(let x=0;x<CW;x++){const i=y*CW+x;T[i]+=dZ;T[i]+=(Z[y]-T[i])*P.gam/(Cdt[i]+B+P.gam)}}
    // 4. advection along the prevailing wind: an exponential sweep carries upwind temperatures downwind (two passes for wraparound)
    for(let y=0;y<CH;y++){const u=wind[y]*P.adv;if(Math.abs(u)<1e-3)continue;const dir=u>0?1:-1,k=Math.abs(u);
      let carry=T[y*CW+(dir>0?CW-1:0)];
      for(let pass=0;pass<2;pass++)for(let s=0;s<CW;s++){const x=dir>0?s:CW-1-s,i=y*CW+x,f=g.land[i];
        // air over land takes on carried temperature strongly; over ocean the sea dominates
        const kk=k*(f>0.5?1:0.25);const nv=T[i]+(carry-T[i])*kk;if(pass===1)T[i]=nv;carry=carry+(T[i]-carry)*(f>0.5?0.18:0.6)}}
    yield;
    if(yr===years-1)Tm.set(T,m*CN);
  }
  return Tm;
}

/* sample a coarse field at hi-res pixel (x,y), bilinear */
function climSample(F,off,x,y){
  const gx=(x+0.5)/CSC-0.5,gy=clamp((y+0.5)/CSC-0.5,0,CH-1),x0=Math.floor(gx),y0=Math.floor(gy),fx=gx-x0,fy=gy-y0,x0w=(x0+CW)%CW,x1=(x0+1)%CW,y1=Math.min(y0+1,CH-1);
  return F[off+y0*CW+x0w]*(1-fx)*(1-fy)+F[off+y0*CW+x1]*fx*(1-fy)+F[off+y1*CW+x0w]*(1-fx)*fy+F[off+y1*CW+x1]*fx*fy;
}
/* surface monthly temperature at a hi-res pixel from sea-level-equivalent coarse fields */
function climTempAt(Tm,m,x,y,elev){return climSample(Tm,m*CN,x,y)-CLM.lapse*Math.max(0,elev)/1000}

/* ---------- winds, moisture and rain ----------
   Prevailing winds follow the thermal equator (the tropical rain belt shifts with the seasons);
   a thermal component blows from cool toward warm surfaces, which makes monsoons.
   Oceans keep the air near saturation (Clausius-Clapeyron); air carries moisture downwind and rains it out
   where it rises (convergence, mountains, storm tracks) or cools; land recycles part of its rain. */
const CDEF3=[
  ['pTr','Equatorial trough depth',0,20,0.1,14.4,'Low pressure along the thermal equator, where the trade winds meet.'],
  ['pSH','Subtropical high strength',0,20,0.1,2,'High pressure belts near 30 degrees, under sinking air.'],
  ['pSP','Subpolar low depth',0,20,0.1,15.4,'Low pressure belts near 60 degrees, where storms gather.'],
  ['wTh','Thermal pressure',0,3,0.02,0.6,'Hot land makes low pressure and cold land high pressure (monsoons, winter highs).'],
  ['mse','Moisture pull on the rain belt',0,2,0.01,0.3,'The tropical rain belt follows warm AND moist air (moist static energy), not just the hottest ground.'],
  ['wSpd','Wind speed',1,60,0.5,15,'Converts pressure gradients to wind speed.'],
  ['rh','Ocean humidity',0.3,1,0.01,0.766,'How close air over the sea stays to saturation.'],
  ['pBase','Base rain rate (%/day)',0,10,0.05,1.3,'Rain from moist air with no extra lifting.'],
  ['pConv','Convergence rain',0,40,0.1,18,'Extra rain where winds converge and air rises.'],
  ['pOro','Mountain rain',0,40,0.2,2.4,'Extra rain where wind climbs a slope.'],
  ['pFront','Storm-track rain (%/day)',0,25,0.05,25,'Extra rain in the mid-latitude storm belts.'],
  ['pSub','Subsidence drying',0,1,0.01,0,'Suppression of rain under sinking subtropical air.'],
  ['pCv','Tropical storms (%/day)',0,30,0.1,11.6,'Convective rain from warm, humid air.'],
  ['pCold','Cold-coast drying',0,1,0.01,0.82,'Cold currents chill the air and stop rain on nearby coasts.'],
  ['rhMin','Humidity needed for rain',0,0.8,0.01,0,'Air drier than this relative humidity hardly rains, however it is lifted.'],
  ['recyc','Rain recycling',0,0.9,0.01,0.774,'Share of rain on land that evaporates back into the air.'],
];
for(const d of CDEF3)CLM[d[0]]=d[5];
const wsat=T=>9*Math.exp(0.064*Math.min(T,27));   // column water capacity; hot land does not raise it much (the air aloft stays cooler)
// Sea-level pressure from a zonal pattern (equatorial trough, subtropical highs, subpolar lows) plus thermal highs and lows
// over cold and warm surfaces; surface wind blows across the isobars toward low pressure, turned by the Coriolis force.
function climWinds(g,Tm,m,P,Wm){
  const U=new Float32Array(CN),V=new Float32Array(CN),T=Tm.subarray(m*CN,(m+1)*CN),itcz=new Float32Array(CW),pr=new Float32Array(CN);
  const yLo=Math.floor(CH*(90-30)/180),yHi=Math.ceil(CH*(90+30)/180);
  for(let x=0;x<CW;x++){let best=-1e9,by=CH/2;for(let y=yLo;y<yHi;y++){const v=T[y*CW+x]+(Wm?P.mse*Wm[y*CW+x]:0)-0.004*Math.pow(Math.abs(y-CH/2),2);if(v>best){best=v;by=y}}itcz[x]=90-(by+0.5)*180/CH}
  for(let k=0;k<3;k++){const c=Float32Array.from(itcz);for(let x=0;x<CW;x++){let s=0;for(let d=-6;d<=6;d++)s+=c[(x+d+CW)%CW];itcz[x]=s/13}}
  for(let x=0;x<CW;x++)itcz[x]=clamp(itcz[x],-25,25);
  const Ta=new Float32Array(CN);for(let y=0;y<CH;y++){let s=0;for(let x=0;x<CW;x++)s+=T[y*CW+x];s/=CW;for(let x=0;x<CW;x++)Ta[y*CW+x]=T[y*CW+x]-s}
  boxBlur(Ta,CW,CH,3,2,true);
  for(let y=0;y<CH;y++){const la=g.lat[y]*180/Math.PI,al=Math.abs(la);
    for(let x=0;x<CW;x++){const it=itcz[x],sh=0.4*it,d=la-it;
      pr[y*CW+x]=-P.pTr*Math.exp(-((d/9)**2))+P.pSH*Math.exp(-((((la-sh)-30*Math.sign(la-sh||1))/11)**2))-P.pSP*Math.exp(-(((al-60)/10)**2))+0.4*P.pSP*Math.exp(-(((al-85)/8)**2))-P.wTh*Ta[y*CW+x]}}
  const OM=Math.PI/180;
  for(let y=0;y<CH;y++){const la=g.lat[y]*180/Math.PI,cy=Math.max(0.15,g.cosl[y]),hem=la>=0?1:-1;
    // cross-isobar angle: geostrophic (90 degrees) away from the equator, minus about 30 degrees of surface friction
    const beta=(90-30)*clamp(Math.abs(la)/12,0,1)*OM*hem,cb=Math.cos(beta),sb=Math.sin(beta),fs=1/Math.max(Math.sin(Math.abs(la)*OM),Math.sin(12*OM));
    for(let x=0;x<CW;x++){const i=y*CW+x;
      const gx=(pr[y*CW+(x+1)%CW]-pr[y*CW+(x+CW-1)%CW])/2/cy,gy=(y>0&&y<CH-1)?(pr[(y-1)*CW+x]-pr[(y+1)*CW+x])/2:0;
      const dx=-gx,dy=-gy;                        // toward low pressure (dy: northward)
      // northern hemisphere: turn clockwise (rightward); southern: anticlockwise
      let u=dx*cb+dy*sb,v=-dx*sb+dy*cb;const k=P.wSpd*fs*0.08;u*=k;v*=k;
      // easterly momentum carried into the deep tropics by the trades, where the Coriolis turning vanishes
      u-=0.4*Math.exp(-((la/14)**2));
      const sp=Math.hypot(u,v);if(sp>4){u*=4/sp;v*=4/sp}
      U[i]=u;V[i]=v}}
  return{U,V,itcz,pr};
}
function climMoist(g,Tm,opt){return drain(climMoistG(g,Tm,opt))}
function* climMoistG(g,Tm,opt){
  const P=Object.assign({},CLM,opt&&opt.par||{}),SUB=30;   // substeps per month (days)
  const Pm=new Float32Array(12*CN),Wv=new Float32Array(CN),W2=new Float32Array(CN),Wind=[],Wmon=[];
  const elev=g.elev,land=g.land,cold=g.cold,cosl=g.cosl,pLapse=P.lapse,pRh=P.rh,pCv=P.pCv,pRhMin=P.rhMin,pCold=P.pCold,pRecyc=P.recyc;
  // a warm start from an earlier run (opt.state) lets a single pass suffice when the climate changes gradually
  const st=opt&&opt.state,NP=st?1:2;
  if(st){Wv.set(st.Wv);for(let m=0;m<12;m++)Wmon[m]=st.Wmon[m]}else for(let i=0;i<CN;i++)Wv[i]=wsat(Tm[i])*P.rh;
  for(let pass=0;pass<NP;pass++)for(let m=0;m<12;m++){
    const WD_=climWinds(g,Tm,m,P,pass>0||st?Wmon[m]:null),{U,V,itcz}=WD_,T=Tm.subarray(m*CN,(m+1)*CN),rate=new Float32Array(CN),acc=new Float32Array(CN);
    // lifting: convergence and upslope flow; storm tracks; subsidence under the subtropical highs
    for(let y=0;y<CH;y++){const la=g.lat[y]*180/Math.PI,cy=Math.max(0.2,g.cosl[y]);
      const front=Math.exp(-(((Math.abs(la)-50)/12)**2));
      for(let x=0;x<CW;x++){const i=y*CW+x,xe=y*CW+(x+1)%CW,xw=y*CW+(x+CW-1)%CW,yn=y>0?i-CW:i,ys=y<CH-1?i+CW:i;
        const div=(U[xe]-U[xw])/2/cy+(V[yn]-V[ys])/2;
        const he=land[xe]>0.5?elev[xe]:0,hw=land[xw]>0.5?elev[xw]:0,hn=land[yn]>0.5?elev[yn]:0,hs=land[ys]>0.5?elev[ys]:0;
        const up=Math.max(0,U[i]*(he-hw)/2/cy+V[i]*(hn-hs)/2)/1000;
        const r=P.pBase/100*(1+P.pConv*Math.max(0,-div)+P.pOro*up)*Math.max(0,1-P.pSub*Math.max(0,div)*10)+P.pFront/100*front;
        rate[i]=Math.max(0,r)*(1-P.pCold*g.cold[i])}}           // per half-day
    // saturation depends only on the place and the month: compute it once per month, not every day
    const satM=new Float64Array(CN);for(let i=0;i<CN;i++)satM[i]=wsat(T[i]-pLapse*elev[i]/1000*land[i]);
    for(let s=0;s<SUB;s++){if(s%8===7)yield;
      // advect: semi-Lagrangian from the upstream point (winds in cells per day, so half a step)
      for(let y=0;y<CH;y++){const cy=Math.max(0.2,cosl[y]);for(let x=0;x<CW;x++){const i=y*CW+x;
        let sx=x-U[i]/cy,sy=y+V[i];sy=clamp(sy,0,CH-1);const x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0,xa=((x0%CW)+CW)%CW,xb=(xa+1)%CW,y1=Math.min(y0+1,CH-1);
        W2[i]=Wv[y0*CW+xa]*(1-fx)*(1-fy)+Wv[y0*CW+xb]*fx*(1-fy)+Wv[y1*CW+xa]*(1-fx)*fy+Wv[y1*CW+xb]*fx*fy}}
      for(let i=0;i<CN;i++){const t=T[i],sat=satM[i];let w=W2[i];
        if(land[i]<0.5){w+=(sat*pRh-w)*0.6}                // the sea refills the air
        const conv=pCv/100*clamp((t-18)/8,0,1.5)*clamp(w/sat-0.55,0,1)*2;
        const rhf=clamp((w/sat-pRhMin)/0.25,0,1);
        let p=w*Math.min(0.9,(rate[i]+conv*(1-pCold*cold[i]))*rhf);if(w-p>sat){p=w-sat}                  // supersaturated air rains out
        w-=p;if(land[i]>=0.5)w+=p*pRecyc*clamp((t+5)/20,0,1);  // evapotranspiration returns part of it
        Wv[i]=Math.max(0,w);acc[i]+=p}}
    Wmon[m]=Float32Array.from(Wv);if(pass===NP-1){Pm.set(acc,m*CN);Wind[m]=WD_}
  }
  return{Pm,Wind,state:{Wv:Float32Array.from(Wv),Wmon}};
}

/* ---------- orbit through time ----------
   Holocene approximation of Berger (1978): eccentricity and obliquity drift slowly; the longitude of perihelion
   precesses through the seasons every ~21,700 years (perihelion fell in northern summer ~11,000 years ago). */
function orbitAt(year){const ya=Math.max(0,1950-year);return{ecc:0.0167+0.0027*clamp(ya/11000,0,1.4),obl:23.44+0.80*Math.sin(Math.PI/2*clamp(ya/10000,0,1)),peri:((282.9-ya*360/21700)%360+360)%360}}

/* ---------- biomes ----------
   Potential vegetation from climate (after Whittaker 1975 and the Köppen aridity threshold), with a slow forest/open state.
   Human land use is layered on top by the history engine. */
const VEG=[
  // key, name, colour, albedo (planetary, clouds included), carbon (kg C per m²)
  ['ice','Ice sheet',[236,240,244],0.62,0],
  ['tundra','Tundra',[176,184,160],0.36,1],
  ['taiga','Boreal forest',[78,112,84],0.27,9],
  ['tforest','Temperate forest',[84,134,82],0.27,14],
  ['mediterranean','Mediterranean scrub',[158,160,96],0.31,4],
  ['steppe','Grassland and steppe',[186,182,112],0.32,2.5],
  ['desert','Desert',[222,200,150],0.37,0.3],
  ['savanna','Savanna',[196,178,92],0.31,4],
  ['dryforest','Tropical dry forest',[136,150,72],0.29,9],
  ['rainforest','Tropical rainforest',[42,110,64],0.25,20],
  ['alpine','Alpine',[160,156,148],0.38,1],
];
const VI={};VEG.forEach((b,k)=>VI[b[0]]=k);
// T: annual mean °C, P: mm/yr, warm/cold: warmest and coldest month, dry: months under 30 mm, elev: m
function vegFor(T,P,warm,cold,dry,elev){
  if(warm<0)return VI.ice;
  if(warm<10)return elev>2500&&cold>-20?VI.alpine:VI.tundra;
  const arid=20*T+140;                       // Köppen aridity threshold (mm)
  if(P<arid*0.5)return VI.desert;
  if(elev>3200&&warm<14)return VI.alpine;
  if(P<arid)return cold>=18?VI.savanna:VI.steppe;
  if(cold>=18){if(dry<=2&&P>1700)return VI.rainforest;if(dry<=5)return VI.dryforest;return VI.savanna}
  if(cold<-3)return P>300?VI.taiga:VI.steppe;
  if(dry>=3&&T>12&&P<900)return VI.mediterranean;
  return P>550?VI.tforest:VI.steppe;
}

/* ---------- whole-planet climate for a world ---------- */
// summary coarse fields from monthly results
function climSummary(Tm,Pm){
  const Ta=new Float32Array(CN),Pa=new Float32Array(CN),Ar=new Float32Array(CN),Dm=new Float32Array(CN);
  for(let i=0;i<CN;i++){let s=0,lo=1e9,hi=-1e9,p=0,d=0;for(let m=0;m<12;m++){const t=Tm[m*CN+i],pp=Pm[m*CN+i];s+=t;lo=Math.min(lo,t);hi=Math.max(hi,t);p+=pp;if(pp<30)d++}
    Ta[i]=s/12;Pa[i]=p;Ar[i]=hi-lo;Dm[i]=d}
  return{Ta,Pa,Ar,Dm};
}
// run the model for a heightmap; opt: {orb, co2, par, albLand}
function climModel(eHi,opt){return drain(climModelG(eHi,opt))}
function* climModelG(eHi,opt){
  opt=opt||{};const g=opt.g||climPrep(eHi);
  const Tm=yield* climRunG(g,{orb:opt.orb,co2:opt.co2,dA:opt.dA,par:opt.par,albLand:opt.albLand,init:opt.init,years:opt.init?4:undefined}),M=yield* climMoistG(g,Tm,{par:opt.par,state:opt.state});
  return Object.assign({g,Tm,Pm:M.Pm,wind:M.Wind,state:M.state,Tlast:Tm.slice(11*CN)},climSummary(Tm,M.Pm));
}
// map a model run to the hi-res grid: annual temperature (with altitude), rainfall and seasonal range
function climToHi(R,eHi){
  const n=HW*HH,tHi=new Float32Array(n),pHi=new Float32Array(n),aHi=new Float32Array(n);
  for(let y=0;y<HH;y++)for(let x=0;x<HW;x++){const i=y*HW+x;
    tHi[i]=climSample(R.Ta,0,x,y)-CLM.lapse*Math.max(0,eHi[i])/1000;pHi[i]=Math.max(0,climSample(R.Pa,0,x,y));aHi[i]=Math.max(0,climSample(R.Ar,0,x,y))}
  return{tHi,pHi,aHi};
}
