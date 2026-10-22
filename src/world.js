"use strict";
/* ================= SIMULATION CORE (no DOM) ================= */
const W=400,H=200,N=W*H,SC=4,HW=W*SC,HH=H*SC,AGW=40,AGH=20;
const PDEF=[
['World','landFrac','Land share',0.2,0.5,0.01,0.33,'Share of the surface above sea level (generated worlds).',1],
['World','bands','Founding peoples',3,24,1,10,'Unrelated language families at the start (generated worlds).',1],
['World','hearths','Farming hearths',1,8,1,4,'Places where crops are first domesticated (random hearths).',1],
['World','startYear','Start year',-12000,-4000,500,-9000,'Year the simulation begins.',1],
['Climate','climVar','Weather variability',0,2,0.05,1,'Size of year-to-year rainfall swings.'],
['Climate','climPersist','Wet and dry runs',0,0.95,0.01,0.8,'How long a wet or dry spell tends to last.'],
['Climate','volcano','Volcanic winters',0,3,0.1,1,'How often eruptions cool the world for a few years.'],
['People','growth','Growth rate',0.004,0.03,0.001,0.012,'Yearly growth while below carrying capacity.'],
['People','migration','Migration',0,3,0.05,1,'How readily people move toward emptier land.'],
['People','seafaring','Seafaring',0,3,0.05,1,'How often coastal peoples cross open water.'],
['People','splitDist','Split radius',4,24,1,10,'How far (in cells) a people spreads before it splits.'],
['People','assim','Assimilation',0,3,0.05,1,'How fast states absorb minority peoples.'],
['People','mixing','Mixing into new peoples',0,3,0.05,1,'How readily long-mingled peoples merge into a new one.'],
['People','wander','Great migrations',0,3,0.05,1,'How readily displaced peoples and hordes set off across the map.'],
['States','formRate','State formation',0,3,0.05,1,'How often dense farming or herding peoples form chiefdoms.'],
['States','warRate','War frequency',0,3,0.05,1,'How often states declare war and press their attacks.'],
['States','asabR','Frontier cohesion',0.01,0.3,0.005,0.1,'Asabiya gained on frontiers with alien peoples or faiths.'],
['States','asabD','Interior decay',0.001,0.05,0.001,0.006,'Asabiya lost in safe interiors.'],
['States','reach','Administrative reach',2,20,0.5,6,'Travel-day scale for delivering orders and receiving replies, before institutions and communication tools.'],
['States','crisis','Instability sensitivity',0,3,0.05,1,'How easily structural pressure turns into civil war.'],
['States','allyRate','Alliances',0,3,0.05,1,'How readily states with shared interests ally.'],
['States','terrain','Terrain friction',0,3,0.05,1,'How much deserts, mountains and forests slow armies and administration.'],
['States','floor','Population floor',0.2,3,0.05,1,'Scales the population a chiefdom, kingdom or empire needs to exist. States that fall below their floor demote or dissolve.'],
['States','circ','Circumscription',0,2,0.05,1,'How much hemmed-in land (Carneiro) and the lack of an exit option favour state formation and taxation.'],
['States','eco','Ecological reach',0,3,0.05,1,'How much harder it is to conquer, tax and hold lands unlike the state\'s home climate and way of life. Higher favours empires that follow one climate belt, river or coast.'],
['States','scaleExp','Returns to scale',0.6,1,0.01,0.8,'How strongly a bigger tax base turns into military reach. Higher favours large empires.'],
['States','fortify','Fortification',0,3,0.05,1,'How readily cohesive, wealthy states fortify threatened frontiers.'],
['Nomads','nomad','Nomad confederations',0,3,0.05,1,'How readily herders unite into confederations under strong leaders.'],
['Nomads','raid','Raiding',0,3,0.05,1,'How often nomads raid settled neighbours.'],
['Leaders','leaderInfl','Leader influence',0,1,0.01,0.6,'How much a ruler’s traits matter.'],
['Leaders','leaderFlair','Exceptional rulers',0,0.15,0.005,0.03,'Chance that a ruler has one extreme trait.'],
['Ideas & faith','invent','Invention',0,3,0.05,1,'How often states make new discoveries.'],
['Ideas & faith','techDiff','Idea diffusion',0,3,0.05,1,'How fast techniques spread between neighbours.'],
['Ideas & faith','techLoss','Skill loss in isolation',0,3,0.05,1,'Small, cut-off groups forget techniques.'],
['Ideas & faith','faith','Prophets and schisms',0,3,0.05,1,'How often new religions and schisms arise.'],
['Ideas & faith','zeal','Holy wars',0,3,0.05,1,'How readily pious rulers fight over faith and holy sites.'],
['Climate','epochs','Climate epochs',0,3,0.05,1,'How often centuries-long cold, warm or dry epochs occur.'],
['Ideas & faith','disease','Epidemics',0,3,0.05,1,'How often crowd diseases break out.'],
['Ideas & faith','degrade','Soil exhaustion',0,3,0.05,1,'How fast overworked farmland loses fertility.'],
];
const P={};for(const d of PDEF)P[d[1]]=d[6];
P.hearthMode='historical';P.fitClimate=true;P.shuffleNames=false;
const CDEF=[
['tEq','Equator temperature (°C)',22,32,0.5,29],
['tGrad','Equator-to-pole drop (°C)',30,60,1,47],
['lapse','Cooling with height (°C/km)',4,9,0.1,6],
['rainBelt','Tropical rain belt (mm)',600,4000,50,3150],
['midlat','Mid-latitude storm belt (mm)',200,2000,25,1400],
['subDry','Subtropical dry belt (mm)',0,800,10,590],
['dry','Interior drying rate',0.002,0.06,0.001,0.038],
['floor','Interior moisture floor',0,0.95,0.01,0.75],
['orog','Mountain rainfall',0,5000,100,2400],
['recycle','Rainforest moisture recycling',0,1,0.01,0.9],
['monsoon','Monsoon reach',0,1.2,0.01,0.62],
['monsoonP','Monsoon rainfall (mm)',0,2500,50,575],
['maritime','West-coast ocean warmth (°C)',0,8,0.25,5.5],
['contKm','Continentality distance (km)',300,3000,50,650],
['seas','Maritime seasonal swing',0.05,0.4,0.01,0.165],
['contSeas','Continental seasonal swing',0,1,0.01,0.55],
];
const CL={};for(const d of CDEF)CL[d[0]]=d[5];

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function gauss(r){const u=r()||1e-9,v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v)}
function pick(r,a){return a[(r()*a.length)|0]}
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
function fy(y){return y<=0?`${(1-y).toLocaleString('en-US')} BCE`:`${y} CE`}
function hsl(h,s,l){h=((h%360)+360)%360/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return[f(0),f(8),f(4)]}
function makeNoise(r){
  const perm=new Uint8Array(512),val=new Float32Array(256),p=[];
  for(let i=0;i<256;i++)p.push(i);
  for(let i=255;i>0;i--){const j=(r()*(i+1))|0;const t=p[i];p[i]=p[j];p[j]=t}
  for(let i=0;i<512;i++)perm[i]=p[i&255];
  for(let i=0;i<256;i++)val[i]=r()*2-1;
  return function(x,y,z){
    const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
    const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf),X=xi&255,Y=yi&255,Z=zi&255;
    const a0=perm[X]+Y,a1=perm[X+1]+Y,b00=perm[a0]+Z,b01=perm[a0+1]+Z,b10=perm[a1]+Z,b11=perm[a1+1]+Z;
    const c000=val[perm[b00]],c001=val[perm[b00+1]],c010=val[perm[b01]],c011=val[perm[b01+1]],c100=val[perm[b10]],c101=val[perm[b10+1]],c110=val[perm[b11]],c111=val[perm[b11+1]];
    const x00=c000+(c100-c000)*u,x01=c001+(c101-c001)*u,x10=c010+(c110-c010)*u,x11=c011+(c111-c011)*u,y0=x00+(x10-x00)*v,y1=x01+(x11-x01)*v;
    return y0+(y1-y0)*w;
  };
}
function fbm(n,x,y,z,o){let s=0,a=1,f=1,t=0;for(let i=0;i<o;i++){s+=a*n(x*f+i*17.1,y*f-i*9.7,z*f+i*3.3);t+=a;a*=0.5;f*=2.03}return s/t}
function boxBlur(a,w,h,rx,ry,wrap){
  const tmp=new Float32Array(a.length);
  if(rx>0)for(let y=0;y<h;y++){const o=y*w;let s=0;for(let d=-rx;d<=rx;d++)s+=a[o+((d+w)%w)];for(let x=0;x<w;x++){tmp[o+x]=s/(2*rx+1);s+=a[o+((x+rx+1)%w)]-a[o+((x-rx+w)%w)]}}else tmp.set(a);
  if(ry>0)for(let x=0;x<w;x++)for(let y=0;y<h;y++){let s=0,c=0;for(let d=-ry;d<=ry;d++){const yy=y+d;if(yy<0||yy>=h)continue;s+=tmp[yy*w+x];c++}a[y*w+x]=s/c}else a.set(tmp);
}

/* ---------- Earth assets ---------- */
let EARTH_CLIMATE=null;
function decodeEarth(elevBytes,kgBytes,climateBytes){
  const d=new Int16Array(elevBytes.buffer,elevBytes.byteOffset,HW*HH),h=new Float32Array(HW*HH);
  for(let y=0;y<HH;y++){let acc=0;for(let x=0;x<HW;x++){acc+=d[y*HW+x];h[y*HW+x]=acc}}
  if(climateBytes)EARTH_CLIMATE=parseClimate(new TextDecoder().decode(climateBytes));
  return{height:h,kg:new Uint8Array(kgBytes.buffer,kgBytes.byteOffset,HW*HH),climate:EARTH_CLIMATE};
}
const KG_CODES=['','Af','Am','As','Aw','BSh','BSk','BWh','BWk','Cfa','Cfb','Cfc','Csa','Csb','Csc','Cwa','Cwb','Cwc','Dfa','Dfb','Dfc','Dfd','Dsa','Dsb','Dsc','Dsd','Dwa','Dwb','Dwc','Dwd','EF','ET','Ocean'];
const KG_GROUPS=['Tropical (A)','Desert (BW)','Steppe (BS)','Temperate (C)','Continental (D)','Polar (E)'];
function kgGroup(c){return c>=1&&c<=4?0:c===5||c===6?2:c===7||c===8?1:c>=9&&c<=17?3:c>=18&&c<=29?4:c===30||c===31?5:-1}
function simGroup(T,Pp,A){const Tw=T+A/2,Tc=T-A/2;if(Tw<10)return 5;const th=Math.max(0,20*T+140);if(Pp<th)return Pp<th/2?1:2;if(Tc>=18)return 0;if(Tc>0)return 3;return 4}

/* ---------- climate ---------- */
const CLIMATE_DAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
const VALIDATED_CLIMATES=new WeakSet();
// Numeric climate exchange format; see CLIMATE.md. No colours or image legends
// are interpreted as measurements. Grid coordinates are pixel CENTRES.
function parseClimate(input){
  if(input&&typeof input==='object'&&VALIDATED_CLIMATES.has(input))return input;
  const d=typeof input==='string'?JSON.parse(input):input;
  const fail=s=>{throw new Error('Climate data: '+s)};
  if(!d||d.format!=='asabiya-climate-v1')fail('expected format asabiya-climate-v1.');
  const g=d.grid||{},nx=g.width,ny=g.height;
  if(!Number.isInteger(nx)||!Number.isInteger(ny)||nx<2||ny<2||nx*ny>2000000)fail('grid dimensions must be integers, with 4–2,000,000 cells.');
  for(const k of ['lon0','lat0','dx','dy'])if(!Number.isFinite(g[k]))fail('grid '+k+' must be a finite number.');
  if(g.dx<=0||g.dy===0||g.wrap!==true||Math.abs(nx*g.dx-360)>1e-6||Math.abs(ny*Math.abs(g.dy)-180)>1e-6)fail('use a global regular latitude/longitude grid covering 360 × 180 degrees, with positive dx and wrap: true.');
  const expectedLat=g.dy<0?90+g.dy/2:-90+g.dy/2;
  if(Math.abs(g.lat0-expectedLat)>1e-6)fail('lat0 must name the centre of the first row, not its outer edge.');
  if(d.period!=='annual'&&d.period!=='monthly')fail('period must be annual or monthly (January through December).');
  const monthly=d.period==='monthly',units=d.units||{},sn=nx*ny,steps=monthly?12:1;
  if(units.temperature!=='degC'&&units.temperature!=='K')fail('temperature units must be degC or K.');
  if(monthly?!['mm/month','mm/day'].includes(units.precipitation):units.precipitation!=='mm/year')fail(monthly?'monthly precipitation units must be mm/month or mm/day.':'annual precipitation units must be mm/year.');
  const hasNoData=Object.prototype.hasOwnProperty.call(d,'noData');
  if(hasNoData&&d.noData!==null&&!Number.isFinite(d.noData))fail('noData must be null or a finite number.');
  const read=(name,count,lo,hi,convert)=>{
    let a=d[name];if(a===undefined)return null;
    if(monthly&&count===sn*12&&Array.isArray(a)&&a.length===12&&a.every(v=>Array.isArray(v)||ArrayBuffer.isView(v))){if(a.some(v=>v.length!==sn))fail(name+' has an incorrect monthly grid size.');a=a.flatMap(v=>Array.from(v))}
    if(!(Array.isArray(a)||ArrayBuffer.isView(a))||a.length!==count)fail(name+' must contain exactly '+count+' row-major numbers.');
    const out=new Float32Array(count);
    for(let i=0;i<count;i++){
      const v=a[i];if(hasNoData&&v===d.noData){out[i]=NaN;continue}
      if(typeof v!=='number'||!Number.isFinite(v))fail(name+' contains a non-finite or non-numeric value at '+i+'.');
      const z=convert?convert(v,i):v;if(z<lo||z>hi)fail(name+' is outside its accepted physical range at '+i+'.');out[i]=z;
    }
    return out;
  };
  const t=read('temperature',sn*steps,-110,70,v=>units.temperature==='K'?v-273.15:v);
  const p=read('precipitation',sn*steps,0,monthly?15000:50000,(v,i)=>monthly&&units.precipitation==='mm/day'?v*CLIMATE_DAYS[Math.floor(i/sn)]:v);
  if(!t||!p)fail('both temperature and precipitation arrays are required.');
  const annualT=new Float32Array(sn),annualP=new Float32Array(sn);
  let range=monthly?new Float32Array(sn):read('temperatureRange',sn,0,160);
  let season=monthly?new Float32Array(sn):read('rainSeasonality',sn,0,1);
  let dry=monthly?new Float32Array(sn):read('dryMonths',sn,0,12);
  let growing=monthly?new Float32Array(sn):read('growingMonths',sn,0,12);
  for(let i=0;i<sn;i++){
    if(monthly){let st=0,sp=0,lo=Infinity,hi=-Infinity,dr=0,gs=0,valid=true;
      for(let m=0;m<12;m++){const j=m*sn+i;if(!Number.isFinite(t[j])||!Number.isFinite(p[j])){valid=false;break}st+=t[j]*CLIMATE_DAYS[m];sp+=p[j];lo=Math.min(lo,t[j]);hi=Math.max(hi,t[j]);if(p[j]<30)dr++;if(t[j]>=6)gs++}
      if(!valid){annualT[i]=annualP[i]=range[i]=season[i]=dry[i]=growing[i]=NaN;continue}
      if(sp>50000)fail('monthly precipitation sums to more than 50,000 mm/year at '+i+'.');
      let variation=0;for(let m=0;m<12;m++)variation+=Math.abs(p[m*sn+i]-sp/12);
      annualT[i]=st/365;annualP[i]=sp;range[i]=hi-lo;season[i]=sp>0?variation/sp/(22/12):0;dry[i]=dr;growing[i]=gs;
    }else{annualT[i]=t[i];annualP[i]=p[i];if(!Number.isFinite(t[i])||!Number.isFinite(p[i]))annualT[i]=annualP[i]=NaN}
  }
  const result={grid:Object.assign({},g),temperature:annualT,precipitation:annualP,temperatureRange:range,rainSeasonality:season,dryMonths:dry,growingMonths:growing,metadata:d.metadata||{},period:d.period};
  VALIDATED_CLIMATES.add(result);return result;
}
function climateSampler(climate){
  const g=climate.grid,nx=g.width,ny=g.height;
  return function(lat,lon,field){
    const a=climate[field];if(!a)return NaN;
    const gx=((lon-g.lon0)/g.dx%nx+nx)%nx,gy=clamp((lat-g.lat0)/g.dy,0,ny-1),x0=Math.floor(gx),y0=Math.floor(gy),x1=(x0+1)%nx,y1=Math.min(y0+1,ny-1),fx=gx-x0,fy=gy-y0;
    const ids=[y0*nx+x0,y0*nx+x1,y1*nx+x0,y1*nx+x1],ws=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];
    let sum=0,weight=0;for(let k=0;k<4;k++)if(Number.isFinite(a[ids[k]])){sum+=a[ids[k]]*ws[k];weight+=ws[k]}
    return weight>1e-8?sum/weight:NaN;
  };
}
function applyNumericClimate(C,input){
  const climate=parseClimate(input),sample=climateSampler(climate);let used=0;
  for(let y=0;y<HH;y++)for(let x=0;x<HW;x++){
    const i=y*HW+x,lat=90-(y+0.5)*180/HH,lon=(x+0.5)*360/HW-180,t=sample(lat,lon,'temperature'),p=sample(lat,lon,'precipitation');
    if(!Number.isFinite(t)||!Number.isFinite(p))continue;
    C.tHi[i]=t;C.pHi[i]=p;const a=sample(lat,lon,'temperatureRange');if(Number.isFinite(a))C.aHi[i]=a;used++;
  }
  for(const key of ['rainSeasonality','dryMonths','growingMonths'])if(climate[key]){
    C[key]=new Float32Array(N);for(let y=0;y<H;y++)for(let x=0;x<W;x++)C[key][y*W+x]=sample(90-(y+0.5)*180/H,(x+0.5)*360/W-180,key);
  }
  C.climateMeta=Object.assign({},climate.metadata,{numeric:true,inputPeriod:climate.period,coverage:used/(HW*HH)});
  return C;
}
function genClimate(eHi){
  const n=HW*HH,tHi=new Float32Array(n),pHi=new Float32Array(n),aHi=new Float32Array(n),mZ=new Float32Array(n),oZ=new Float32Array(n),cZ=new Float32Array(n),mR=new Float32Array(n),mM=new Float32Array(n),oM=new Float32Array(n),baseRow=new Float32Array(HH);
  const latOf=y=>90-(y+0.5)/HH*180;
  const base=latD=>{const a=Math.abs(latD);return Math.max(60,260+CL.rainBelt*Math.exp(-(((latD-3)/13)**2))+CL.midlat*Math.exp(-(((a-50)/12)**2))-CL.subDry*Math.exp(-(((a-24)/7)**2))-150*clamp((a-65)/20,0,1))};
  for(let y=0;y<HH;y++)baseRow[y]=base(latOf(y));
  // one moisture march along a row or column; idx(st) gives the pixel, km is the step length
  // mode 0: prevailing wind; 1: monsoon from a coast (slow decay, needs a wide ocean); 2: monsoon drawn poleward (fast decay)
  const march=(len,idx,km,bp,outM,outO,outC,mode)=>{
    let m=1,prev=0,ds=0;const fl=mode?CL.floor*0.3:Math.min(0.95,CL.floor+CL.recycle*bp/2000),dr=mode===1?CL.dry*0.45:mode===2?CL.dry*2.5:CL.dry,rc=mode?0.05:0.25;
    for(let st=0;st<2*len;st++){const i=idx(st%len),e=eHi[i];let rain=0;
      if(e<=0){m+=(1-m)*rc;prev=0;ds=0}
      else{const dh=e-prev;if(dh>0){rain=m*(1-Math.exp(-dh/1500));m-=rain}m+=(fl-m)*dr*(km/31);prev=e;ds+=km}
      if(st>=len){outM[i]=m;if(outO)outO[i]=rain;if(outC)outC[i]=1-Math.exp(-ds/CL.contKm)}}
  };
  for(let y=0;y<HH;y++){
    const latD=latOf(y),a=Math.abs(latD),dir=a<30?-1:(a<62?1:-1),kmPx=Math.max(5,40075*Math.cos(latD*Math.PI/180)/HW),o=y*HW;
    march(HW,dir>0?k=>o+k:k=>o+HW-1-k,kmPx,baseRow[y],mZ,oZ,cZ);
    march(HW,dir>0?k=>o+HW-1-k:k=>o+k,kmPx,baseRow[y],mR,null,null,1);
  }
  // summer monsoon: moisture drawn poleward from the tropical oceans
  const kmV=20004/HH,y0=Math.floor((90-45)/180*HH),yEq=Math.floor(HH/2),y1=Math.floor((90+45)/180*HH);
  for(let x=0;x<HW;x++){
    const ys=Math.floor((90+12)/180*HH),ye=y0;const lenN=ys-ye;
    march(lenN,k=>(ys-k)*HW+x,kmV,0,mM,oM,null,2);
    const ys2=Math.floor((90-12)/180*HH),lenS=y1-ys2;
    march(lenS,k=>(ys2+k)*HW+x,kmV,0,mM,oM,null,2);
  }
  for(let y=0;y<HH;y++){
    const latD=latOf(y),a=Math.abs(latD),s=Math.sin(latD*Math.PI/180),s2=s*s;
    const Tsea=CL.tEq-CL.tGrad*s2*(0.55+0.5*s2*s2),dir=a<30?-1:(a<62?1:-1);
    const mon=CL.monsoon*clamp((52-a)/20,0,1)*clamp((a-2)/6,0,1),eastW=clamp((a-18)/8,0,1);
    for(let x=0;x<HW;x++){const i=y*HW+x,e=eHi[i];
      const cont=e<=0?0:cZ[i];
      tHi[i]=Tsea-CL.lapse*0.001*Math.max(0,e)+(dir>0?CL.maritime*(1-cont)*clamp((a-30)/15,0,1):0);
      const mm=Math.max(mR[i]*eastW,mM[i]);
      const orog=Math.max(oZ[i],mon*oM[i]);
      pHi[i]=e<=0?baseRow[y]:baseRow[y]*(0.12+0.88*mZ[i])+CL.monsoonP*mon*mm+CL.orog*orog*(0.35+baseRow[y]/1400);
      aHi[i]=0.5+a*(CL.seas+CL.contSeas*cont);
    }
  }
  boxBlur(pHi,HW,HH,4,2,true);boxBlur(aHi,HW,HH,6,2,true);boxBlur(tHi,HW,HH,1,1,true);
  return{tHi,pHi,aHi};
}
function fitClimate(tHi,pHi,aHi,eHi,kg){
  let changed=0;
  for(let i=0;i<HW*HH;i++){
    if(eHi[i]<=0)continue;const g=kgGroup(kg[i]);if(g<0)continue;
    let T=tHi[i],Pp=pHi[i];const A=aHi[i],T0=T,P0=Pp;
    const Tw=()=>T+A/2,Tc=()=>T-A/2;
    if(g===5){if(Tw()>=10)T-=Tw()-9.5}else if(Tw()<10)T+=10.5-Tw();
    if(g===0&&Tc()<18)T+=18.5-Tc();
    if(g===3){if(Tc()>=18)T-=Tc()-17.5;if(Tc()<=0)T+=0.5-Tc()}
    if(g===4&&Tc()>0)T-=Tc()+0.5;
    const th=Math.max(0,20*T+140);
    if(g===1){if(Pp>=th/2)Pp=th*0.35}
    else if(g===2){if(Pp>=th)Pp=th*0.8;else if(Pp<th/2)Pp=th*0.65}
    else if(g!==5&&Pp<th)Pp=th*1.25+40;
    tHi[i]=T;pHi[i]=Pp;if(T!==T0||Pp!==P0)changed++;
  }
  return changed;
}
function gradeClimate(w,rawT,rawP,rawA){
  if(!w.kgGrid)return null;
  const code=new Uint8Array(N),per=[];for(let g=0;g<6;g++)per.push({ok:0,tot:0});
  let ok=0,tot=0;const RANK=[3,1,1,2,1,0];
  for(const i of w.landIdx){const og=kgGroup(w.kgGrid[i]);if(og<0)continue;
    const sg=simGroup(rawT[i],rawP[i],rawA[i]),a=w.area[i];
    per[og].tot+=a;tot+=a;
    if(sg===og){per[og].ok+=a;ok+=a;code[i]=1;continue}
    const sB=sg===1||sg===2,oB=og===1||og===2;
    if(sB&&!oB)code[i]=2;else if(oB&&!sB)code[i]=3;
    else if(sB&&oB)code[i]=sg===1?2:3;
    else code[i]=[3,0,0,2,1,0][sg]<[3,0,0,2,1,0][og]?4:5;
  }
  return{score:tot?ok/tot:0,per,code};
}

/* ---------- world ---------- */
const BIOMES=['Ocean','Ice','Tundra','Boreal forest','Temperate forest','Grassland','Steppe','Desert','Savanna','Tropical forest'];
function biomeOf(T,Pp){
  if(T<-9)return 1;if(T<-1)return 2;if(T<5)return Pp<250?2:3;
  const t=Math.max(T,0);if(Pp<150+8*t)return 7;if(Pp<330+13*t)return 6;if(T>=20)return Pp<1300?8:9;return Pp<700?5:4;
}
function cellAt(lat,lon){const y=clamp(Math.floor((90-lat)/180*H),0,H-1),x=((Math.floor((lon+180)/360*W)%W)+W)%W;return y*W+x}
const REGIONS=[
 {k:'meso',n:'Mesopotamia',box:[29,37,39,49],ref:-3099},
 {k:'egypt',n:'Egypt',box:[22,31.5,29,34],ref:-3099},
 {k:'indus',n:'Indus valley',box:[23,33,66,76],ref:-2599},
 {k:'nchina',n:'Yellow River',box:[32,41,105,120],ref:-1899},
 {k:'mesoam',n:'Mesoamerica',box:[14,22,-100,-86],ref:-499},
 {k:'andes',n:'Central Andes',box:[-20,-5,-80,-68],ref:-199},
 {k:'europe',n:'Western Europe',box:[42,55,-6,15],ref:-49},
 {k:'wafrica',n:'West Africa',box:[8,18,-12,8],ref:700},
];
const NOSTATE=[{n:'New Guinea',box:[-10,-1,131,151]},{n:'Congo interior',box:[-5,4,15,28]},{n:'Amazon interior',box:[-10,0,-72,-52]}];
const NOFARM=[{n:'Siberia',box:[55,75,60,180]},{n:'Australia',box:[-40,-11,113,154]},{n:'Northern North America',box:[52,72,-170,-55]},{n:'Southern Africa',box:[-35,-25,15,32]}];
const CHINA_REF=[[-1600,0.25],[-1046,0.5],[-771,0.25],[-221,0.9],[220,0.45],[280,0.85],[304,0.45],[589,0.95],[907,0.35],[960,0.7],[1127,0.5],[1279,1],[1368,0.95],[1644,1],[1800,1]];
function genWorld(o){
  const r=mulberry32(hashStr('world:'+o.seed));
  const eHi=new Float32Array(HW*HH);
  if(o.height){eHi.set(o.height)}else{
    const n1=makeNoise(r),n2=makeNoise(r),n3=makeNoise(r),n4=makeNoise(r);
    const raw=new Float32Array(HW*HH),smp=[];
    for(let y=0;y<HH;y++){
      const lat=Math.PI/2-(y+0.5)/HH*Math.PI,cl=Math.cos(lat),sl=Math.sin(lat);
      for(let x=0;x<HW;x++){
        const lon=(x+0.5)/HW*2*Math.PI-Math.PI,X=cl*Math.cos(lon),Y=cl*Math.sin(lon),Z=sl;
        const wx=fbm(n2,X*1.1+3.1,Y*1.1,Z*1.1,3),wy=fbm(n2,X*1.1,Y*1.1+7.3,Z*1.1,3),wz=fbm(n2,X*1.1,Y*1.1,Z*1.1+1.7,3);
        const qx=X+0.75*wx,qy=Y+0.75*wy,qz=Z+0.75*wz,c=fbm(n1,qx*1.45,qy*1.45,qz*1.45,6);
        let rg=1-Math.abs(fbm(n3,qx*2.7,qy*2.7,qz*2.7,4)*1.7);rg=clamp(rg,0,1);rg=rg*rg*rg;
        const v=c+0.17*rg*(c>-0.04?1:0.25)+0.05*fbm(n4,X*7,Y*7,Z*7,3);
        raw[y*HW+x]=v;if((x%3===0)&&(y%2===0)&&r()<cl)smp.push(v);
      }
    }
    smp.sort((a,b)=>a-b);
    const sl=smp[Math.floor(smp.length*(1-o.landFrac))],mx=smp[smp.length-1],mn=smp[0];
    for(let i=0;i<raw.length;i++){const v=raw[i];eHi[i]=v>sl?20+Math.pow((v-sl)/(mx-sl),1.35)*6200:-(60+Math.pow((sl-v)/(sl-mn),0.5)*5600)}
  }
  const C=genClimate(eHi);
  const w={seed:o.seed,eHi,isEarth:!!o.earth,imported:!!o.height&&!o.earth,kgHi:o.kg||null,fitted:false};
  // raw (model) climate on the coarse grid, kept for grading
  const rawT=new Float32Array(N),rawP=new Float32Array(N),rawA=new Float32Array(N);
  const agg=(src,dst)=>{for(let cy=0;cy<H;cy++)for(let cx=0;cx<W;cx++){let s=0;for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++)s+=src[(cy*SC+dy)*HW+cx*SC+dx];dst[cy*W+cx]=s/(SC*SC)}};
  agg(C.tHi,rawT);agg(C.pHi,rawP);agg(C.aHi,rawA);
  const numericClimate=o.climate||(o.earth?EARTH_CLIMATE:null);
  if(numericClimate){applyNumericClimate(C,numericClimate);w.climateMeta=C.climateMeta;for(const key of ['rainSeasonality','dryMonths','growingMonths'])if(C[key])w[key]=C[key]}
  if(o.temp&&!numericClimate)C.tHi.set(o.temp);if(o.prec&&!numericClimate)C.pHi.set(o.prec);
  // Observations/imported numeric measurements must not be rewritten to pass
  // a classification test. Köppen fitting remains available for model worlds.
  if(o.kg&&o.fit&&!numericClimate){w.fitChanged=fitClimate(C.tHi,C.pHi,C.aHi,eHi,o.kg);w.fitted=true}
  w.tHi=C.tHi;w.pHi=C.pHi;w.aHi=C.aHi;
  const elev=new Float32Array(N),T=new Float32Array(N),Pr=new Float32Array(N),amp=new Float32Array(N),rough=new Float32Array(N),land=new Uint8Array(N);
  for(let cy=0;cy<H;cy++)for(let cx=0;cx<W;cx++){
    let se=0,se2=0,st=0,sp=0,sa=0,nl=0;
    for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++){const k=(cy*SC+dy)*HW+cx*SC+dx,e=eHi[k];se+=e;se2+=e*e;st+=C.tHi[k];sp+=C.pHi[k];sa+=C.aHi[k];if(e>0)nl++}
    const n=SC*SC,i=cy*W+cx,em=se/n;
    land[i]=nl*2>=n?1:0;elev[i]=land[i]?Math.max(em,5):Math.min(em,-5);T[i]=st/n;Pr[i]=Math.max(0,sp/n);amp[i]=sa/n;
    rough[i]=land[i]?clamp(Math.sqrt(Math.max(0,se2/n-em*em))/700+Math.max(0,em-1200)/3000,0,1):0;
  }
  Object.assign(w,{elev,T,Pr,amp,rough,land,rawT,rawP,rawA});
  if(o.kg){const kgGrid=new Uint8Array(N);
    for(let cy=0;cy<H;cy++)for(let cx=0;cx<W;cx++){const cnt=new Uint8Array(33);let best=0,bc=0;
      for(let dy=0;dy<SC;dy++)for(let dx=0;dx<SC;dx++){const c=o.kg[(cy*SC+dy)*HW+cx*SC+dx];if(c>=1&&c<=31){cnt[c]++;if(cnt[c]>bc){bc=cnt[c];best=c}}}
      kgGrid[cy*W+cx]=best}
    w.kgGrid=kgGrid}
  const lat=new Float32Array(N),area=new Float32Array(N),x3=new Float32Array(N),y3=new Float32Array(N),z3=new Float32Array(N),cosLon=new Float32Array(N),sinLon=new Float32Array(N),cxA=new Int16Array(N),cyA=new Int16Array(N),nb=new Int32Array(N*4);
  for(let cy=0;cy<H;cy++)for(let cx=0;cx<W;cx++){
    const i=cy*W+cx,la=(90-(cy+0.5)/H*180)*Math.PI/180,lo=((cx+0.5)/W*360-180)*Math.PI/180;
    lat[i]=la;area[i]=(40075/W)*(20004/H)*Math.cos(la);cxA[i]=cx;cyA[i]=cy;
    cosLon[i]=Math.cos(lo);sinLon[i]=Math.sin(lo);x3[i]=Math.cos(la)*Math.cos(lo);y3[i]=Math.cos(la)*Math.sin(lo);z3[i]=Math.sin(la);
    nb[i*4]=cy*W+(cx+W-1)%W;nb[i*4+1]=cy*W+(cx+1)%W;nb[i*4+2]=cy>0?i-W:-1;nb[i*4+3]=cy<H-1?i+W:-1;
  }
  const cosLat=new Float32Array(N);for(let i=0;i<N;i++)cosLat[i]=Math.max(0.2,Math.cos(lat[i]));
  Object.assign(w,{lat,area,x3,y3,z3,cosLon,sinLon,cxA,cyA,nb,cosLat});
  const landList=[],coastList=[],coast=new Uint8Array(N);
  for(let i=0;i<N;i++)if(land[i]){landList.push(i);for(let d=0;d<4;d++){const j=nb[i*4+d];if(j>=0&&!land[j]){coast[i]=1;break}}if(coast[i])coastList.push(i)}
  w.landIdx=Int32Array.from(landList);w.coastIdx=Int32Array.from(coastList);w.coast=coast;
  const lm=new Int32Array(N).fill(-1),lmSize=[],q=new Int32Array(N);
  for(const s0 of landList){if(lm[s0]>=0)continue;const id=lmSize.length;let h=0,t=0;q[t++]=s0;lm[s0]=id;
    while(h<t){const i=q[h++];for(let d=0;d<4;d++){const j=nb[i*4+d];if(j>=0&&land[j]&&lm[j]<0){lm[j]=id;q[t++]=j}}}lmSize.push(t)}
  w.lm=lm;w.lmSize=lmSize;w.lmCount=lmSize.length;
  // drainage
  const filled=new Float32Array(N),down=new Int32Array(N).fill(-1),vis=new Uint8Array(N),order=[],hk=[],hv=[];
  const hpush=(i,k)=>{let n=hk.length;hk.push(k);hv.push(i);while(n>0){const p=(n-1)>>1;if(hk[p]<=hk[n])break;[hk[p],hk[n]]=[hk[n],hk[p]];[hv[p],hv[n]]=[hv[n],hv[p]];n=p}};
  const hpop=()=>{const top=hv[0],lk=hk.pop(),lv=hv.pop();if(hk.length){hk[0]=lk;hv[0]=lv;let n=0;for(;;){const l=2*n+1,rr=l+1;let m=n;if(l<hk.length&&hk[l]<hk[m])m=l;if(rr<hk.length&&hk[rr]<hk[m])m=rr;if(m===n)break;[hk[m],hk[n]]=[hk[n],hk[m]];[hv[m],hv[n]]=[hv[n],hv[m]];n=m}}return top};
  const n8=(i,f)=>{const cx=i%W,cy=(i/W)|0;for(let dy=-1;dy<=1;dy++){const yy=cy+dy;if(yy<0||yy>=H)continue;for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;f(yy*W+(cx+dx+W)%W)}}};
  for(let i=0;i<N;i++)if(!land[i])vis[i]=1;
  for(const i of coastList){filled[i]=elev[i];vis[i]=1;let oc=-1;n8(i,j=>{if(!land[j]&&oc<0)oc=j});down[i]=oc;hpush(i,elev[i])}
  while(hv.length){const i=hpop();order.push(i);n8(i,j=>{if(!vis[j]){vis[j]=1;filled[j]=Math.max(elev[j],filled[i]+0.01);down[j]=i;hpush(j,filled[j])}})}
  const acc=new Float32Array(N);
  for(const i of landList)acc[i]=Math.max(0,Pr[i]-200)*area[i]*1e-4*(T[i]<-9?0.2:1);
  for(let k=order.length-1;k>=0;k--){const i=order[k],d=down[i];if(d>=0&&land[d])acc[d]+=acc[i]}
  const rv=new Float32Array(N),th=2500;for(const i of landList)rv[i]=acc[i]>th?clamp(Math.log(acc[i]/th)/Math.log(100)+0.2,0,1):0;
  w.down=down;w.acc=acc;w.rv=rv;
  // suitability
  const sF=new Float32Array(N),sH=new Float32Array(N),nomad=new Uint8Array(N),biome=new Uint8Array(N);
  for(const i of landList){
    const t=T[i],p=Pr[i],tw=t+amp[i]/2;biome[i]=biomeOf(t,p);
    if(t<-9)continue;
    const half=amp[i]/2,estimatedGs=half<0.5?(t>6?12:0):(t-half>=6?12:t+half<=6?0:12*Math.acos(clamp((6-t)/half,-1,1))/Math.PI),gs=w.growingMonths&&Number.isFinite(w.growingMonths[i])?w.growingMonths[i]:estimatedGs;
    w.gs=w.gs||new Float32Array(N);w.gs[i]=gs;
    const tS=clamp((gs-4.3)/2.2,0,1)*clamp((tw-14)/7,0,1)*clamp((31-t)/5,0,1)*(t<2?clamp((t+4)/6,0,1):1)*(biomeOf(t,p)===3?0.45:1);
    // loess and black-earth soils: semi-arid temperate grassland soils are deep and fertile once worked
    const pS=Math.max(clamp((p-280)/450,0,1)*clamp((3400-p)/1600,0.25,1),t>9.5&&t<18?0.62*clamp((p-330)/120,0,1)*clamp((850-p)/150,0,1):0);
    const irr=rv[i]*clamp((tw-14)/6,0,1);
    const leach=elev[i]<1500?clamp((p-1300)/900,0,1)*clamp((t-21)/3,0,1)*(1-clamp((rv[i]-0.55)*2.5,0,0.8)):0;
    w.leach=w.leach||new Float32Array(N);w.leach[i]=leach;
    w.trop=w.trop||new Float32Array(N);w.trop[i]=elev[i]<1200?clamp((t-22)/4,0,1)*clamp((p-1100)/800,0,1):0;
    sF[i]=Math.max(tS*pS,tS*irr*0.95)*(1-0.65*rough[i])*(elev[i]>3500?0.3:1)*(1-0.7*leach);
    sH[i]=clamp((tw-4)/10,0,1)*clamp((27-t)/7,0,1)*clamp((p-120)/180,0,1)*clamp((1100-p)/500,0.15,1)*(1-0.4*rough[i]);
    nomad[i]=(sH[i]>0.45&&sF[i]<0.3)?1:0;
  }
  Object.assign(w,{sF,sH,nomad,biome});
  // travel cost (units of a half flat cell), tsetse belt, orbital monsoon zone
  const tcost=new Uint8Array(N),tsetse=new Uint8Array(N),monZone=new Float32Array(N),desert=new Uint8Array(N);
  for(const i of landList){const b=biome[i],t=T[i],p=Pr[i],la=lat[i]*180/Math.PI;
    let c=2;if(b===7){c=8;desert[i]=1}else if(b===9)c=6;else if(b===1||b===2)c=6;else if(b===3)c=3;
    c+=Math.round(rough[i]*8);if(rv[i]>0.3)c=Math.max(1,c>>1);tcost[i]=Math.min(20,c);
    const lo=(cxA[i]+0.5)/W*360-180;
    tsetse[i]=(t>22&&p>900&&Math.abs(la)<20&&(!w.isEarth||lo>-18&&lo<52&&lm[i]===lm[cellAt(0,25)]))?1:0;
    if(p<520)monZone[i]=clamp((33-Math.abs(la))/8,0,1)*clamp((Math.abs(la)-9)/5,0,1)*(la>0?1:0.45)*clamp((520-p)/250,0,1)}
  Object.assign(w,{tcost,tsetse,monZone,desert});
  // weather interpolation
  const wi=new Int32Array(N*4),wf=new Float32Array(N*2);
  for(let i=0;i<N;i++){const cx=i%W,cy=(i/W)|0,gx=(cx+0.5)/W*AGW-0.5,gy=clamp((cy+0.5)/H*AGH-0.5,0,AGH-1.001);
    const x0=Math.floor(gx),y0=Math.floor(gy),xa=(x0+AGW)%AGW,xb=(x0+1)%AGW,y1=Math.min(y0+1,AGH-1);
    wi[i*4]=y0*AGW+xa;wi[i*4+1]=y0*AGW+xb;wi[i*4+2]=y1*AGW+xa;wi[i*4+3]=y1*AGW+xb;wf[i*2]=gx-x0;wf[i*2+1]=gy-y0}
  w.wi=wi;w.wf=wf;
  // sea links: coastal cell -> coastal cells across water within 6 sea steps
  const ls=new Int32Array(N+1),lt=[],ld=[],seen=new Int32Array(N).fill(-1),qd=new Uint8Array(N);
  for(let i=0;i<N;i++){ls[i]=lt.length;if(!coast[i])continue;
    let h=0,t=0;const found=[];
    for(let d=0;d<4;d++){const j=nb[i*4+d];if(j>=0&&!land[j]&&seen[j]!==i){seen[j]=i;q[t++]=j;qd[j]=1}}
    while(h<t){const c=q[h++],dc=qd[c];
      n8(c,j=>{if(seen[j]===i)return;seen[j]=i;
        if(land[j]){if(j!==i&&dc>=2&&coast[j])found.push([j,dc])}
        else if(dc<6){qd[j]=dc+1;q[t++]=j}})}
    found.sort((a,b)=>(lm[b[0]]!==lm[i])-(lm[a[0]]!==lm[i])||a[1]-b[1]);
    for(const [j,d] of found.slice(0,10)){lt.push(j);ld.push(d)}
  }
  ls[N]=lt.length;w.ls=ls;w.lt=Int32Array.from(lt);w.ld=Uint8Array.from(ld);
  if(w.isEarth){
    w.regions=REGIONS.map(R=>{const cells=[];for(const i of landList){const la=lat[i]*180/Math.PI,lo=(cxA[i]+0.5)/W*360-180;if(la>=R.box[0]&&la<=R.box[1]&&lo>=R.box[2]&&lo<=R.box[3])cells.push(i)}return Object.assign({},R,{cells:Int32Array.from(cells)})});
    const med=[],china=[];
    for(const i of landList){const la=lat[i]*180/Math.PI,lo=(cxA[i]+0.5)/W*360-180;
      if(la>=21&&la<=41&&lo>=100&&lo<=122)china.push(i);
      if(la>=30&&la<=46.5&&lo>=-10&&lo<=37){let near=false;const cx=cxA[i],cy=cyA[i];
        for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){const yy=cy+dy;if(yy<0||yy>=H)continue;const j=yy*W+(cx+dx+W)%W;
          if(land[j])continue;const la2=lat[j]*180/Math.PI,lo2=(cxA[j]+0.5)/W*360-180;
          if(lo2>-5.6&&!(la2>40.8&&lo2>26.5)&&la2<46&&lo2<37){near=true;break}}
        if(near)med.push(i)}}
    w.medCells=Int32Array.from(med);w.chinaCells=Int32Array.from(china);
  }
  w.grade=gradeClimate(w,numericClimate?T:rawT,numericClimate?Pr:rawP,numericClimate?amp:rawA);
  return w;
}

