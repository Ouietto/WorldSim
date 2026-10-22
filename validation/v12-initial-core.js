"use strict";
/* ================= SIMULATION CORE (no DOM) ================= */
const W=400,H=200,N=W*H,SC=4,HW=W*SC,HH=H*SC,AGW=40,AGH=20;
const PDEF=[
['World','landFrac','Land share',0.2,0.5,0.01,0.33,'Share of the surface above sea level (generated worlds).',1],
['World','bands','Founding peoples',3,40,1,16,'Unrelated language families at the start (generated worlds).',1],
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
  if(typeof prepareAgroEcology==='function')prepareAgroEcology(w);
  return w;
}


/* ---------- languages: sound families modelled on real language families ---------- */
const SP=s=>s.split(' ').filter(Boolean);
const STYLES={
 romance:{cons:'t t r r n n l l s s c c m v p d g b f',cl:'tr pr br cr fl gr',vow:'a a e e i o o u',pat:'CV CV CV CVC KV V',coda:'n r s l',place:'ia ia a ona aria ica',ppl:'ians ans ese ini',pers:'us o a io ius ian',city:'a um ona ia ento'},
 germanic:{cons:'t r n s d l g k h w b f m th',cl:'st sk br dr fr gr hr kn',vow:'a e i o u a e ae',pat:'CV CVC CVC KVC VC',coda:'n r d l s rd ld nd st lf',place:'land heim mark ia burg',ppl:'s ings ar ians',pers:'ric mund bert wulf hild ald',city:'burg ford wick stead ham'},
 slavic:{cons:'v r n s l k m d b p t z ch sh y g',cl:'pr br st sl kr zv',vow:'a o e i u y a o',pat:'CV CV CVC KV',coda:'v n k r l sk',place:'ia ov grad ava inia',ppl:'ians ichi ani s',pers:'slav mir ko av ana',city:'grad ov ets ava'},
 celtic:{cons:'b r d n l c m g t s v',cl:'br dr gl',vow:'a e i o u ai',pat:'CV CVC CV',coda:'n r d g ch',place:'ia an ach dun or',ppl:'ii ans ach',pers:'ach an ig rix',city:'dun ach on'},
 greek:{cons:'t k p r s l n m th ph ch d',cl:'kr tr pl th',vow:'a e i o y a o e',pat:'CV CV CVC V',coda:'s n r',place:'ia os is ene eia',ppl:'ians ioi ites',pers:'os as es ion ikos',city:'polis ia os on'},
 semitic:{cons:'m l k b r d sh t n h s q y z kh',vow:'a a i u a i u',pat:'CV CVC CV CVC',coda:'m n r l b d k',place:'a at ar ad iya',ppl:'ites i ans',pers:'el at ar on ah',city:'at a it un',t:{k:'malik',e:'great malik',c:'sheikh'}},
 kemetic:{cons:'t m n k h s r w b dj p',vow:'e a i o u',pat:'CV CVC',coda:'t n s r f',place:'et ti ut an',ppl:'ites i',pers:'et is u ef',city:'et u is'},
 berber:{cons:'t m z gh r n l s k d y w',vow:'a i u a',pat:'CV CVC VC',coda:'t n r z',place:'a ast at',ppl:'en ans',pers:'en as an',city:'at ast'},
 persian:{cons:'d r s sh k b m n p f z kh v g j',vow:'a a e i o u',pat:'CV CVC CV',coda:'r n d sh z s',place:'an stan ia ar',ppl:'ians i ans',pers:'ush es an dad zad',city:'abad gird shahr',t:{k:'shah',e:'shahanshah',c:'khan'}},
 indic:{cons:'r m n d s v t k j h b p g dh bh ch',vow:'a a i u e o aa',pat:'CV CV CVC',coda:'n r t m sh',place:'pur desh ra va ana',ppl:'is as ans',pers:'ra deva an ita esh',city:'pur nagar abad',t:{k:'raja',e:'maharaja',c:'thakur'}},
 dravidian:{cons:'k t n r l m v p ch y d',vow:'a i u e o a',pat:'CV CV CVC',coda:'n l r m',place:'am ai ur an',ppl:'ar ans',pers:'an appan ai',city:'ur ai am'},
 sinitic:{cons:'zh ch sh j q x h l m n d t g k b p w y s c z',vow:'a ai ao an ang e ei en eng i ia iao ian iang in ing o ong ou u uan uang ui un uo',pat:'CV',coda:'',place:'',ppl:'',pers:'',city:'an yang du zhou ling',mono:1,t:{k:'wang',e:'huangdi',c:'chief'}},
 japonic:{cons:'k s t n h m y r w g z d b',vow:'a i u e o',pat:'CV CV CV',coda:'',place:'ma shima no',ppl:'',pers:'ro ko mi ra',city:'yama kawa ta'},
 tibetan:{cons:'g d b k t p ts dz zh sh s l r m n ng y w',vow:'a e i o u',pat:'CV CVC',coda:'g d b m n ng r l s',place:'',ppl:'pa',pers:'pa ma',city:'kar ling'},
 turkic:{cons:'t k q b s r l m n y ch sh g d',vow:'a a i u o e y',pat:'CV CVC CVC V',coda:'r n k l g sh z q',place:'ia an li',ppl:'s lar',pers:'tay gul ar bek',city:'kent balik',t:{k:'khan',e:'khagan',c:'bey',h:'khan'}},
 mongolic:{cons:'b t g kh m n ch s d r l y',vow:'a o u e i',pat:'CV CVC',coda:'n r l g d',place:'ia ai',ppl:'s ut id',pers:'tai atu gun ei',city:'balgas khot',t:{k:'khan',e:'khagan',c:'noyan',h:'khan'}},
 uralic:{cons:'k t s m n l v p h r j',vow:'a e i o u a',pat:'CV CVC CV',coda:'n s t k l',place:'maa la ia',ppl:'s ians',pers:'ko nen o',city:'la va'},
 bantu:{cons:'k m t l s b w ny z g',cl:'mb nd ng nk nz',vow:'a a i u e o',pat:'CV CV KV CV',coda:'',place:'',ppl:'',pers:'',city:'',pre:{ppl:'Ba Wa A',place:'U Bu Ki'},t:{k:'mwene',e:'great mwene',c:'chief'}},
 mande:{cons:'k m s d n b t g f l j',vow:'a i u o e',pat:'CV CVC',coda:'n',place:'ba ka dugu',ppl:'nke s',pers:'ba ta ri',city:'dugu ba',t:{k:'mansa',e:'great mansa',c:'farin'}},
 austronesian:{cons:'k t m n l p h w s r g ng',vow:'a a i u e o',pat:'CV CV V CVC',coda:'n ng',place:'a ia u',ppl:'ns',pers:'a i ana',city:'a ang',t:{k:'raja',e:'maharaja',c:'datu'}},
 thai:{cons:'k kh t th p ph ch s n m ng l w y',vow:'a ai ao e i o u ua',pat:'CV CVC',coda:'n ng m k t p',place:'',ppl:'',pers:'',city:'buri thani'},
 pama:{cons:'w y ng b d g m n l r rr',vow:'a i u',pat:'CV CVC',coda:'n l r',place:'',ppl:'',pers:'',city:''},
 nahuatl:{cons:'t tl tz ch m n x k p y w l',vow:'a e i o',pat:'CV CVC CV',coda:'tl n c',place:'tlan pan co can',ppl:'ca eca',pers:'tl otl atzin',city:'tlan pan co',t:{k:'tlatoani',e:'huey tlatoani',c:'chief'}},
 maya:{cons:'k b ch t p m n l y w h x',vow:'a a e i o u',pat:'CV CVC',coda:'k l n m b',place:'il al',ppl:'ob',pers:'ab il',city:'il tun'},
 algonquian:{cons:'k w n m s t p ch',vow:'a e i o',pat:'CV CVC',coda:'k n t',place:'ak ig',ppl:'s',pers:'ak in',city:'ak'},
 quechua:{cons:'k q t p ch m n ll y w r s h',vow:'a i u',pat:'CV CVC',coda:'q y n r s',place:'marka suyu',ppl:'kuna',pers:'pa ki yu',city:'marka pampa'},
 tupi:{cons:'t p m n r k g y w b',vow:'a i u e o y',pat:'CV CV V',coda:'',place:'ba ra ma',ppl:'s',pers:'a i',city:'ba tuba'},
};
for(const k in STYLES){const s=STYLES[k];for(const f of ['cons','cl','vow','pat','coda','place','ppl','pers','city'])s[f]=SP(s[f]||'');if(s.pre){s.pre.ppl=SP(s.pre.ppl);s.pre.place=SP(s.pre.place)}s.t=Object.assign({k:'king',e:'emperor',c:'chief',h:'khan'},s.t||{})}
const MACROS={ie:['romance','germanic','slavic','celtic','greek'],afro:['semitic','kemetic','berber'],indo:['indic','dravidian','persian'],sino:['sinitic','japonic','tibetan'],alt:['turkic','mongolic','uralic'],afr:['bantu','mande'],aus:['austronesian','thai'],pama:['pama'],nam:['nahuatl','maya','algonquian'],sam:['quechua','tupi']};
const MACRO_KEYS=Object.keys(MACROS);
const LEX=['root','river','god','sun','sea','mountain','mother','grain'];
const RULES=[['p','f'],['k','h'],['t','s'],['b','v'],['d','z'],['g','y'],['s','h'],['a','e'],['o','u'],['e','i'],['u','o'],['ai','e'],['kh','h'],['ch','sh'],['l','r'],['r','l'],['th','t'],['sh','s'],['ei','i'],['c','g'],['ct','t'],'drop','voice','palatal','nasal','prothesis','geminate'];
function applyRule(w,R){
  if(Array.isArray(R))return w.split(R[0]).join(R[1]);
  switch(R){
    case'drop':return w.length>4&&/[aeiou]$/.test(w)&&!/[aeiou]{2}$/.test(w)?w.slice(0,-1):w;
    case'voice':return w.replace(/([aeiou])p(?=[aeiou])/g,'$1b').replace(/([aeiou])t(?=[aeiou])/g,'$1d').replace(/([aeiou])k(?=[aeiou])/g,'$1g');
    case'palatal':return w.replace(/k(?=[ie])/g,'ch').replace(/c(?=[ie])/g,'ch').replace(/t(?=i)/g,'ch');
    case'nasal':return w.length>4?w.replace(/[mn]$/,''):w;
    case'prothesis':return w.replace(/^s(?=[ptkm])/,'es');
    case'geminate':return w.replace(/([aeiou])([ptk])(?=[aeiou])/,'$1$2$2');
  }
  return w;
}
function applyRules(w,rs){for(const R of rs)w=applyRule(w,R);return tidy(w)}
function tidy(w){return w.replace(/(.)\1\1+/g,'$1$1').replace(/([wyhjvqx])\1/g,'$1').replace(/^([^aeiouy])\1/,'$1').replace(/[aeiou]{3,}/g,m=>m.slice(0,2))}
function syl(S,r){
  const pat=pick(r,S.pat);let w='';
  for(const ch of pat){
    if(ch==='V')w+=pick(r,S.vow);
    else if(ch==='K')w+=S.cl.length?pick(r,S.cl):pick(r,S.cons);
    else if(ch==='C')w+=pick(r,S.cons);
    else if(ch==='F')w+=S.coda.length?pick(r,S.coda):'';
  }
  if(pat.endsWith('C')&&!pat.endsWith('VC')){}
  return w;
}
function rawWord(L,r,n){const S=STYLES[L.style];let w='';n=n||1+(r()<0.55?1:0);if(S.mono)n=Math.min(n,2);for(let i=0;i<n;i++)w+=syl(S,r);
  if(!S.mono&&S.coda.length&&r()<0.3&&/[aeiou]$/.test(w))w+=pick(r,S.coda);
  if(!S.vow.includes('aa'))w=w.replace(/([aeiou])\1/g,'$1');
  return tidy(w).slice(0,10)}
function join(a,b){if(!b)return a;if(b==='s'&&/[^aeiounrlk]$/.test(a))b='ians';if(/^[aeiouy]/.test(b)&&/[aeiouy]$/.test(a))a=a.replace(/[aeiouy]+$/,'')||a;if(a&&a[a.length-1]===b[0]&&!/[aeiou]/.test(b[0]))b=b.slice(1);return a+b}
function word(L,r,n){let w;for(let t=0;t<8;t++){w=applyRules(rawWord(L,r,n),L.rules);if(w.length>=2&&w.length<=10)break}return w}
function makeLang(r,style,macro){
  const S=STYLES[style];
  const L={style,macro,rules:[],lex:{},placeSuf:S.place.length?pick(r,S.place):'',pplSuf:S.ppl.length?pick(r,S.ppl):'',prePpl:S.pre?pick(r,S.pre.ppl):'',prePlace:S.pre?pick(r,S.pre.place):''};
  for(const k of LEX)L.lex[k]=word(L,r,k==='root'?(S.mono?1:1+(r()<0.5?1:0)):undefined);
  for(let t=0;t<6&&!S.mono&&L.lex.root.length<3;t++)L.lex.root=word(L,r,2);
  langNames(L);return L;
}
function langNames(L){const S=STYLES[L.style],root=L.lex.root;
  const rt=S.mono?root:root;
  L.lex.place=cap(L.prePlace?L.prePlace+rt:join(rt,L.placeSuf));
  L.lex.people=cap(L.prePpl?L.prePpl+rt:join(rt,L.pplSuf));
  L.lex.land=L.lex.place;
}
function childLang(L,r){
  const nr=[];const n=STYLES[L.style].mono?0:1+(r()<0.5?1:0);for(let i=0;i<n;i++)nr.push(pick(r,RULES));
  let style=L.style;if(r()<0.22&&MACROS[L.macro]&&MACROS[L.macro].length>1)style=pick(r,MACROS[L.macro]);
  const S=STYLES[style];
  const C={style,macro:L.macro,rules:L.rules.concat(nr).slice(-6),lex:{},placeSuf:style!==L.style||r()<0.3?(S.place.length?pick(r,S.place):''):L.placeSuf,pplSuf:style!==L.style||r()<0.3?(S.ppl.length?pick(r,S.ppl):''):L.pplSuf,prePpl:S.pre?pick(r,S.pre.ppl):'',prePlace:S.pre?pick(r,S.pre.place):''};
  for(const k of LEX)C.lex[k]=r()<0.12?word(C,r):applyRules(L.lex[k],nr);
  if(C.lex.root===L.lex.root||C.lex.root.length<3)C.lex.root=r()<0.5?applyRules(L.lex.root,[pick(r,RULES)]):word(C,r,S.mono?1:2);
  langNames(C);
  if(C.lex.people===L.lex.people){C.lex.root=word(C,r);langNames(C)}
  return C;
}
function hybridLang(A,B,r){
  const C={style:A.style,macro:A.macro,rules:A.rules.slice(-2),lex:{},placeSuf:r()<0.5?A.placeSuf:B.placeSuf,pplSuf:A.pplSuf,prePpl:A.prePpl,prePlace:A.prePlace};
  for(const k of LEX)C.lex[k]=r()<0.5?A.lex[k]:B.lex[k];
  const a=A.lex.root,b=B.lex.root;C.lex.root=tidy(a.slice(0,Math.ceil(a.length/2))+b.slice(Math.floor(b.length/2)));
  if(C.lex.root.length<3)C.lex.root=a+b.slice(-2);
  langNames(C);return C;
}
function personName(L,r){const S=STYLES[L.style];
  if(S.mono){const a=cap(rawWord(L,r,1)),b=rawWord(L,r,1);return r()<0.5?a+' '+cap(b):a+b}
  let w='';for(let t=0;t<8&&w.length<4;t++){w=rawWord(L,r,1+(r()<0.6?1:0));if(S.pers.length&&r()<0.75)w=join(w,pick(r,S.pers));w=applyRules(w,L.rules).slice(0,12)}return cap(w)}
function placeWord(L,r){const S=STYLES[L.style];const rt=word(L,r,S.mono?1:1+(r()<0.4?1:0));return cap(L.prePlace?L.prePlace+rt:join(rt,S.place.length?(r()<0.6?L.placeSuf:pick(r,S.place)):''))}
function cityWord(L,r){const S=STYLES[L.style];if(S.mono)return cap(rawWord(L,r,1))+(r()<0.5?pick(r,S.city):'');const rt=word(L,r,1+(r()<0.4?1:0));return cap(S.city.length&&r()<0.7?join(rt,pick(r,S.city)):rt)}
function roman(n){const v=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';for(const [a,b] of v)while(n>=a){s+=b;n-=a}return s}

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

/* Material economy and institutions. Food units are one person's annual ration.
   Stocks belong to households, governments or people in transit; transfers never
   create food or settlers. K remains potential carrying capacity, not a harvest. */
const SOCIAL_TECH=['storage','records','census','post','office','succession','charter','canal','school'];
function skill(i,k){return TI[k]==null?0:S.tk[TI[k]][i]}
function recordSkill(i){return Math.max(S.admin[i],skill(i,'records')*0.85)}
function initSociety(){
  const s=S,w=WD;
  for(const k of ['food','young','harvest','levy','need','nutrition','organisation','autonomy','unrest','infrastructure','node','flow','urban','ancestryMix','newcomers'])s[k]=new Float64Array(N);
  s.settleLag=new Uint8Array(N);s.colonyBad=new Uint8Array(N);s.colonyHome=new Int32Array(N).fill(-1);
  s.ancestry=Int32Array.from(s.eth);s.ancestry2=new Int32Array(N).fill(-1);s.civicPol=new Int32Array(N);
  s.tradeEdges=[];s.realmCells=new Map();s.communities=[];s.economyMetrics={};
  s.societyCounters={nonStateBattles:0,displacements:0,settlements:0,sponsoredSettlements:0,failedSettlements:0};
  for(const i of w.landIdx){s.food[i]=s.pop[i]*0.45;s.young[i]=s.pop[i]*0.32;s.nutrition[i]=1;s.organisation[i]=0.04;s.autonomy[i]=0.75;s.infrastructure[i]=0.15}
  initDynamics();initEcology();
}
function initInstitutions(o,from){
  const s=S,c=o.capital,p=Math.max(1,o.pop),org=s.organisation[c]||0.05;
  o.central=from?from.central*0.9:0.18+org*0.2;o.bureau=from?from.bureau*0.85:0.04+recordSkill(c)*0.08;
  o.rights=from?from.rights:clamp(0.25+org*0.35,0,1);o.nobles=from?from.nobles:0.65;
  o.succession=from?from.succession*0.9:0.12;o.trust=from?Math.max(0.2,from.trust*0.85):0.5;
  o.health=from?Math.max(0.35,from.health):0.85;o.strain=0;o.arrears=0;o.payroll=1;o.grain=0;
  o.ineq=from?from.ineq*0.9:0.25;o.cplx=0.2;o.comm=0.12;
  // A breakaway can be visited by the political loop in the year it is born,
  // before its first harvest/budget pass. All flow fields need valid defaults.
  o.hunger=0;o.collected=0;o.output=0;o.rents=0;o.trade=0;o.network=0;o.burden=0;o.fiscalDue=0;o.tax=0;o.coalition=0.55;o.resilience=0.3;o.integ=0.7;o.recruitable=p*0.4;
  o.staff=0;o.army=0;o.armyFree=0;o.defFree=0;o.navy=0;o.navyFree=0;o.campaigns=0;o.civilRisk=0;o.relief=0;o.lastReform=-1e9;
  o.gov=from?from.gov:o.rel>=0&&org>0.45?'Temple':org>0.4&&s.r()<0.65?'Council':'Patrimonial';o.legacy=from?from.legacy||from.id:o.restores||o.id;
  o.groups={nobles:{power:o.nobles,loyalty:0.55},officials:{power:o.bureau,loyalty:0.65},merchants:{power:0.1,loyalty:0.55},clergy:{power:0.15,loyalty:0.6}};
  if(!from){const levy=Math.min(s.food[c]*0.15,p*0.08);s.food[c]-=levy;o.grain=levy}
  o.heir=null;o.reforms=[];
  initPoliticalDynamics(o,from);
}
function hasLegacy(o,i){return S.civicPol[i]>0&&S.civicPol[i]===(o.legacy||o.id)}
function transportAccess(i,o){
  const s=S,back=s.returnDist[i]>=65534?40:s.returnDist[i]*0.5;
  const response=(dd(i)+back)*0.5,bulk=s.supplyDist[i]>=65534?80:s.supplyDist[i]*0.5;
  return clamp(Math.exp(-response/Math.max(2,o.h||P.reach))*(0.35+0.65*o.health)*
    (0.3+0.7*Math.exp(-bulk/Math.max(3,(o.h||P.reach)*1.5))),0.015,1);
}
function taxCapacity(i,o){
  const s=S,ag=s.farm[i],grain=foodStorability(i),records=recordSkill(i);
  // Labour services, livestock and commercial dues remain possible without grain.
  const appropriation=clamp(0.25+0.5*grain+0.15*records+0.1*s.herd[i],0,1);
  const compliance=clamp(0.45+0.35*o.trust+0.2*o.rights-0.25*s.unrest[i],0.1,1);
  return (0.045+0.10*o.central+0.035*o.bureau)*(0.45+0.55*ag)*appropriation*compliance*
    localTaxAccess(i,o)*(0.4+0.6*s.integ[i])*(1-0.55*s.autonomy[i])*(1-0.35*o.nobles*s.eliteStake[i])*(1-0.18*s.serviceEstates[i]*s.hereditaryEstates[i]);
}
function foodStocks(){let n=governmentFood();for(const i of WD.landIdx)n+=S.food[i];for(const id of S.alive)n+=S.pols[id].grain||0;for(const e of S.expeditions||[])if(!e.done)n+=e.food;return n}
function budgetPay(o,due){const n=Math.min(Math.max(0,o.grain),Math.max(0,due));o.grain-=n;return n}
function economyPass(){
  const s=S,w=WD,a={start:foodStocks(),harvest:0,spoilage:0,consumed:0,fodder:0,transportLoss:0,end:0};
  s.realmCells=new Map();s.foodImports.fill(0);
  for(const id of s.alive){const o=s.pols[id];
    if(s.pol[o.capital]!==o.id){s.depot[o.capital]+=o.grain;o.grain=0}
    o.collected=0;o.output=0;o.hunger=0;o.rents=0;o.relief=0;o.trade=0;o.campaigns=0;o.recruitable=0;const spoil=(o.grain||0)*(0.16-0.10*skill(o.capital,'storage')-0.025*s.granaries[o.capital]);o.grain=Math.max(0,(o.grain||0)-spoil);a.spoilage+=spoil}
  for(const i of w.landIdx){
    const p=s.pop[i],id=s.pol[i],o=id?s.pols[id]:null;s.levy[i]=0;s.harvest[i]=0;s.need[i]=p;s.flow[i]*=0.7;
    if(o){let cs=s.realmCells.get(id);if(!cs)s.realmCells.set(id,cs=[]);cs.push(i)}
    const depotSpoil=s.depot[i]*(0.20-0.12*skill(i,'storage')-0.03*s.granaries[i]);s.depot[i]-=depotSpoil;a.spoilage+=depotSpoil;
    const spoil=s.food[i]*(0.28-0.19*skill(i,'storage')-0.025*s.granaries[i]);s.food[i]-=spoil;a.spoilage+=spoil;
    if(p<1){a.spoilage+=s.food[i];s.food[i]=0;s.nutrition[i]=1;continue}
    s.young[i]=clamp(s.young[i],0,p*0.65);
    const publicShare=(o?((o.army||0)+(o.staff||0)+(o.navy||0)*20)/Math.max(1,o.pop):0)+(s.localStaff[i]+s.localGuard[i])/Math.max(1,p);
    const labour=clamp(((p-s.young[i])/p-publicShare-s.civicLabor[i]-s.militaryLabor[i]-s.defenseLaborDebt[i]-Math.min(0.12,s.urban[i]/p*0.2))/0.68,0.2,1.2)*(1-0.65*clamp(s.sickness[i],0,0.85));s.defenseLaborDebt[i]=0;
    const productivity=1.23+0.16*s.farm[i]+0.08*s.iron[i]+0.06*s.manure[i];
    let h=Math.min(s.K[i],p*productivity*labour)*(1-0.55*s.raidDamage[i]);
    if(s.settleLag[i]){const share=clamp(s.newcomers[i]/p,0,1);h*=1-share*(0.8-0.45/(s.settleLag[i]+0.5));s.settleLag[i]--;if(!s.settleLag[i])s.newcomers[i]=0}
    s.harvest[i]=h;s.food[i]+=h;a.harvest+=h;
    const feed=animalFodder(i),fed=Math.min(s.food[i],feed);s.food[i]-=fed;a.fodder+=fed;s.animalFeed[i]=feed>0?fed/feed:1;
    if(o){const levy=Math.min(s.food[i],h*taxCapacity(i,o));s.food[i]-=levy;s.levy[i]=levy;depositPublic(o,i,levy);o.collected+=levy;o.output+=h;o.rents+=h*o.nobles*0.08;const loyalty=s.year-s.taken[i]<20?0.05:0.2+0.8*s.integ[i],available=Math.max(0,p-s.localStaff[i]-s.localGuard[i]-s.serviceTroops[i]);o.recruitable+=available*clamp(s.maleShare[i]/0.49,0.1,1.1)*loyalty*(1-0.5*s.autonomy[i])*(0.4+0.6*o.trust)*(0.4+0.6*s.eliteLoyalty[i])}
  }
  regionalFreight(a);maintainWalls(a);localGovernmentPayroll(a);
  // Tribute is a transfer of collected provisions, not a bonus per vassal.
  for(const id of s.alive){const o=s.pols[id],ov=o.over?s.pols[o.over]:null;if(ov&&ov.alive&&ov!==o){const n=tributeShipment(o,ov,o.collected*0.12);o.tributePaid=n}else o.tributePaid=0}
  for(const id of s.alive){
    const o=s.pols[id],cs=s.realmCells.get(id)||[],p=cs.reduce((n,i)=>n+s.pop[i],0);
    // Territorial losses happen after the annual political census. A government
    // that lost its last province must surrender its stores before budgeting,
    // rather than pay a ghost payroll that has no household recipients.
    if(p<=0){
      const holder=s.pol[o.capital]?s.pols[s.pol[o.capital]]:null;
      if(holder&&holder!==o)inheritConquest(holder,o);else{s.food[o.capital]+=o.grain;o.grain=0;o.staff=0;o.army=0;o.navy=0}
      o.payroll=0;o.fiscalDue=0;o.arrears=0;continue;
    }
    const due=(o.staff||0)*1.35+(o.army||0)*(0.55+0.45*o.central)+(o.navy||0)*35+p*(0.001+0.004*o.bureau+0.002*(o.fortN||0)/Math.max(1,o.cells));
    let paid=0;for(const i of cs){const local=budgetAt(o,i,due*s.pop[i]/Math.max(1,p));paid+=local;s.food[i]+=local}o.payroll=due+o.localFiscalDue>0?clamp((paid+o.localPaid)/(due+o.localFiscalDue),0,1):1;o.arrears=Math.max(0,(o.arrears||0)*0.88+due+o.localFiscalDue-paid-o.localPaid);
    o.burden=(due+o.localFiscalDue)/Math.max(1,o.collected);o.fiscalDue=due+o.localFiscalDue;
    // Salaries feed the same people counted in population, so return them to
    // household budgets. Their labour was already removed from production.
    o.localStores=cs.reduce((n,i)=>n+s.depot[i],0);
    if(o.rights+o.trust>0.9)for(const i of cs){
      const deficit=Math.max(0,s.need[i]*1.02-s.food[i]);if(!deficit)continue;
      const access=0.8+0.2*s.infrastructure[i],spent=budgetAt(o,i,Math.min(deficit/access,publicAvailable(o,i)*0.35));
      const delivered=spent*access;s.food[i]+=delivered;o.relief+=delivered;a.transportLoss+=spent-delivered;
    }
  }
  localUrbanFreight(a);tradeFood(a);
  for(const i of w.landIdx){
    const p=s.pop[i],need=s.need[i];s.nutrition[i]=need>0?clamp(s.food[i]/need,0,1):1;
    const eat=Math.min(s.food[i],need);s.food[i]-=eat;a.consumed+=eat;
    const cap=p*(0.55+1.8*skill(i,'storage')+1.2*s.granaries[i]),excess=Math.max(0,s.food[i]-cap);s.food[i]-=excess;a.spoilage+=excess;
    if(s.pol[i])s.pols[s.pol[i]].hunger+=p*(1-s.nutrition[i]);
  }
  for(const id of s.alive){const o=s.pols[id];o.hunger/=Math.max(1,o.pop);o.treas=clamp(o.grain/Math.max(1,o.fiscalDue||o.pop*0.02)-o.arrears/Math.max(1,o.collected),-2,3);refreshForces(o)}
  militaryContractsYear();
  a.end=foodStocks();a.error=a.start+a.harvest-a.spoilage-a.consumed-a.fodder-a.transportLoss-a.end;s.accounts=a;
}
function populationStep(i,p,K,g){
  const s=S,n=s.nutrition[i],family=clamp(s.maleShare[i]/0.25,0.2,1),births=p*(0.020+g*Math.max(0,1-p/Math.max(1,K)))*clamp(0.45+0.55*n,0,1)*family;
  const deaths=p*(0.020+0.16*Math.pow(1-n,1.5));
  const young=s.young[i],mature=young/18;s.young[i]=clamp(young+births-mature-young*deaths/Math.max(1,p),0,Math.max(0,p+births-deaths));
  const next=Math.max(0,p+births-deaths);s.urban[i]*=next/Math.max(1,p);return next;
}
function refreshForces(o){
  const c=o.capital,s=S,p=Math.max(1,o.pop),adult=clamp(1-(s.young[c]||0)/Math.max(1,s.pop[c]),0.35,0.8);
  const nobleL=o.groups?o.groups.nobles.loyalty:0.5;
  const target=(Math.min(p,Math.max(0,o.recruitable))*adult*(o.kind==='horde'?0.075:0.012+0.016*o.central+0.012*o.nobles*nobleL)+(o.auxiliaries||0))*clamp(0.3+0.7*o.payroll,0,1);
  o.army=Math.max(0,(o.army||0)+0.12*(target-(o.army||0)));o.armyFree=Math.max(0,o.army-(o.loanedTroops||0))*0.55;o.defFree=Math.max(0,o.army-(o.loanedTroops||0))*0.45;
  const fleetTarget=p*Math.min(1,(o.coastN||0)/Math.max(1,o.cells))*0.00012*s.sail[c]*(0.3+0.7*s.nav[c])*o.payroll;
  o.navy=Math.max(0,(o.navy||0)+0.1*(fleetTarget-(o.navy||0)));o.navyFree=o.navy;
  const direct=Math.max(0,p-(o.delegatedPop||0));
  const commitments=direct*(0.004+0.002*o.central)+(o.delegatedPop||0)*0.0008+Math.max(1,o.cells-(o.delegatedCells||0))*70+(o.delegatedCells||0)*8+(o.borderLoad||0)*45+o.conquestLoad*p*0.001;
  const personnel=o.staff*4+p*o.nobles*(o.coalition||0.5)*0.002;
  o.occupation=Math.max(0,Math.min(o.collected*0.15,personnel-commitments));
}
function fieldDefense(j,commit){
  const s=S,id=s.pol[j],o=id?s.pols[id]:null,p=s.pop[j];
  const mobility=1+2.2*pastoralMobility(j)*WD.rangeExposure[j]+s.defensePact[j]*s.organisation[j];
  if(!o)return Math.pow(p*(0.015+0.035*s.organisation[j])+1,P.scaleExp)*(0.4+0.6*s.s[j])*milAt(j)*(1+WD.rough[j])*(1+1.5*settlementDefense(j))*mobility;
  const stake=0.7+0.6*s.eliteStake[j]*s.eliteLoyalty[j]+s.cityIdentity[j]*0.3;
  const local=(o.kind==='state'?mobilizedLocalDefense(j,o,commit):p*(0.008+0.018*s.integ[j])*(0.4+0.6*o.health)*stake),reserve=Math.min(o.defFree||0,(o.army||0)/Math.max(2,o.nb.size+1))*transportAccess(j,o);
  if(commit)o.defFree=Math.max(0,o.defFree-reserve);
  if(commit)o.defenseCommitted={cell:j,local,regular:reserve};
  return Math.pow(local+reserve+1,P.scaleExp)*(0.4+0.3*o.S+0.3*s.s[j])*milAt(j)*(1+1.6*WD.rough[j])*(1+2.5*settlementDefense(j))*mobility*(0.55+0.3*o.preparedness+0.15*o.crisisMemory);
}
function campaignForce(o,i,sea){
  if(o.kind==='state')return allocateCampaign(o,i,sea);
  const share=Math.max(300,((o.army||0)+(o.foreignFree||0))/Math.max(2,o.nb.size+1));
  const force=Math.min((o.armyFree||0)+(o.foreignFree||0),share,sea?(o.navyFree||0)*80:Infinity);
  const cost=force*(0.12+dd(i)*0.025+(sea?0.22:0)),ratio=cost>0?Math.min(1,publicAvailable(o,i)/cost):0;
  if(force*ratio<100)return 0;
  const allocated=force*ratio,native=Math.min(o.armyFree||0,allocated),foreign=drawForeignTroops(o,i,allocated-native);
  o.armyFree-=native;o.campaignAuxShare=foreign/Math.max(1,native+foreign);budgetAt(o,i,cost*ratio);o.campaigns++;
  S.martialPractice[i]+=(native+foreign)/Math.max(500,S.pop[i])*2;
  if(sea)o.navyFree=Math.max(0,o.navyFree-allocated/80);
  return allocated*transportAccess(i,o);
}
function armyLoss(o,i,n,auxShare=0){
  if(auxShare>0)foreignCasualties(o,n*auxShare);n*=1-auxShare;
  const s=S,killed=Math.min(o.army||0,Math.max(0,n));o.army=Math.max(0,o.army-killed);
  o.armyFree=Math.min(o.armyFree||0,o.army*0.55);o.defFree=Math.min(o.defFree||0,o.army*0.45);
  let left=killed;const lose=(c,cap)=>{const adult=Math.max(0,s.pop[c]-s.young[c]),men=adult*s.maleShare[c],x=Math.min(left,cap,men);s.pop[c]-=x;s.maleShare[c]=clamp((men-x)/Math.max(1,adult-x),0,1);left-=x};
  for(const c of new Set([i,o.capital])){if(s.pol[c]!==o.id)continue;lose(c,s.pop[c]*0.2)}
  // Losses beyond the local contingent are drawn from its actual recruitment base.
  if(left>0)for(const c of s.realmCells.get(o.id)||[]){lose(c,s.pop[c]*0.05);if(left<1)break}
}
function frontierReady(o,i,j){
  if(o.kind==='horde')return true;
  const s=S,local=s.pop[i],settlement=s.pop[j]<1000,support=frontierTransport(i,j),resistance=(1+2*WD.rangeExposure[j]*pastoralMobility(j))*(1+0.6*s.forest[j]+0.5*WD.rough[j]);
  return frontierHoldable(o,i,j)&&local>=4000&&o.pop>=25000/(0.2+0.8*support)&&o.health>0.4&&o.occupation>=Math.max(200,s.pop[j]*0.015)*resistance&&
    transportAccess(i,o)>0.18&&(!settlement||publicAvailable(o,i)>800&&o.central+o.bureau>0.4);
}
function foundSettlement(i,j,requested,sponsor){
  const s=S,w=WD;if(i===j||!w.land[j]||s.pop[i]<30)return 0;
  const empty=s.pop[j]<1,clearing=empty?0.25+0.7*s.forest[j]+0.4*w.rough[j]:0.08;
  const journey=Math.max(0,Math.hypot(dxWrap(i,j),w.cyA[j]-w.cyA[i])-1)*0.02;
  const provisions=empty?0.85+clearing:0.2,stock=s.food[i]+(sponsor?publicAvailable(sponsor,i)*0.15:0);
  let n=Math.min(requested,s.pop[i]*0.2,stock/(provisions+0.15+journey));if(empty&&n<30)return 0;if(n<1)return 0;
  const cost=n*(provisions+0.15+journey),homePaid=Math.min(s.food[i],cost);s.food[i]-=homePaid;if(sponsor)budgetAt(sponsor,i,cost-homePaid);
  diseaseJourney(i,j,travelDays(i,j,!!(w.coast[i]&&w.coast[j])),n,'migration');
  const priorImmunity=diseaseHistory(i);const before=s.pop[j],age=s.young[i]*n/s.pop[i],animals=takeHerd(i,n/s.pop[i]);s.young[i]-=age;s.young[j]+=age;s.pop[i]-=n;s.pop[j]+=n;s.food[j]+=n*provisions;putHerd(j,animals);
  if(empty)s.societyCounters.settlements++;if(sponsor)s.societyCounters.sponsoredSettlements++;
  if(empty){s.eth[j]=s.eth[i];s.ancestry[j]=s.ancestry[i];s.eth2[j]=-1;s.rel[j]=s.rel[i];s.s[j]=s.s[i];s.adapt[j]=s.adapt[i];s.organisation[j]=s.organisation[i]*0.45;s.infrastructure[j]=0;s.settleLag[j]=1+Math.floor(clearing*2);s.colonyHome[j]=i}
  else{mergeCulture(j,s.eth[i],n,before);mergeAncestry(j,s.ancestry[i],n,before)}
  s.newcomers[j]+=n;if(!empty&&n>before*0.02)s.settleLag[j]=Math.max(1,s.settleLag[j]);
  transferCrops(i,j);mixDiseaseHistory(j,priorImmunity,n,before);if(sponsor)recordFrontierPressure(sponsor,j,0.12);
  for(let k=0;k<s.tk.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][i]*0.8);
  if(sponsor){conquestRecorded(sponsor,j,s.pol[j]);s.pol[j]=sponsor.id;s.integ[j]=0.2;s.taken[j]=s.year;s.dist[j]=Math.min(65534,s.dist[i]+Math.round(routeCost(i,j,sponsor,false)*2));sponsor.occupation=Math.max(0,sponsor.occupation-500)}
  return n;
}
function mergeCulture(i,e,n,old){
  const s=S;if(e<0||n<=0)return;
  if(s.eth[i]===e){if(s.eth2[i]>=0)s.mix[i]*=old/(old+n);return}
  const previousMinority=s.eth2[i]===e?old*s.mix[i]:0,share=(previousMinority+n)/(old+n);
  if(share>0.5){const prior=s.eth[i];s.eth[i]=e;s.eth2[i]=prior;s.mix[i]=1-share}else{s.eth2[i]=e;s.mix[i]=share}s.mixT[i]=0;
}
function mergeAncestry(i,e,n,old){
  const s=S;if(e<0)return;if(s.ancestry[i]<0||old<1){s.ancestry[i]=e;s.ancestry2[i]=-1;s.ancestryMix[i]=0;return}
  if(s.ancestry[i]===e){s.ancestryMix[i]*=old/(old+n);return}
  const share=((s.ancestry2[i]===e?old*s.ancestryMix[i]:0)+n)/(old+n);
  if(share>0.5){s.ancestry2[i]=s.ancestry[i];s.ancestry[i]=e;s.ancestryMix[i]=1-share}else{s.ancestry2[i]=e;s.ancestryMix[i]=share}
}
function householdMigration(){
  const s=S,w=WD,r=s.r,L=w.landIdx;
  for(let z=0;z<L.length;z++){
    const i=L[(s.year&1)?L.length-1-z:z],p=s.pop[i];if(p<30)continue;
    const j=w.nb[i*4+((r()*4)|0)];if(j<0||!w.land[j]||w.T[j]<-9)continue;
    if(s.colonyHome[i]>=0&&s.nutrition[i]<0.65){s.colonyBad[i]++;if(s.colonyBad[i]>=2){s.societyCounters.failedSettlements++;const home=s.colonyHome[i];if(w.land[home]&&s.pop[home]>=1){const n=s.pop[i]*0.6,old=s.pop[home],young=s.young[i]*0.6;s.pop[i]-=n;s.pop[home]+=n;s.young[i]-=young;s.young[home]+=young;mergeCulture(home,s.eth[i],n,old);mergeAncestry(home,s.ancestry[i],n,old);s.food[home]+=s.food[i]*0.6;s.food[i]*=0.4;putHerd(home,takeHerd(i,0.6))}s.colonyHome[i]=-1}}else s.colonyBad[i]=0;
    const pr=p/Math.max(1,s.K[i]),prj=s.pop[j]/Math.max(1,s.K[j]),diff=pr-prj;
    const owner=s.pol[i]?s.pols[s.pol[i]]:null;
    const attraction=settlementAppeal(i,j,owner),pull=Math.max(0,attraction-1)*0.1;
    if(diff+pull<0.15||pr<0.55)continue;
    // Privately funded movement is possible across political boundaries.
    let n=p*P.migration*(0.012+0.04*s.herd[i])*(diff+pull)/(1+diff+pull)*attraction;if(s.pol[j]&&s.pol[j]!==s.pol[i])n*=0.35;
    if(owner&&!s.pol[j])n*=1+owner.nobles*0.3+owner.hunger;
    foundSettlement(i,j,n,null);
  }
}
function buildTradeNetwork(){
  const s=S,w=WD;s.tradeEdges=[];s.node.fill(0);const nodes=[];
  for(const i of w.landIdx){if(s.pop[i]<2000)continue;let rivers=0,roads=0;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]){if(w.rv[j]>0.25)rivers++;if(s.roads[j]>0.4)roads++}}
    const urban=s.urban[i]>1000?0.4:0,port=w.coast[i]&&s.sail[i]>0.3?0.5:0;
    const score=clamp(port+0.25*w.rv[i]+(rivers>=3?0.2:0)+roads*0.06*s.roads[i]+s.car[i]*0.4+urban,0,1);
    if(score>0.22){s.node[i]=score;nodes.push(i)}
  }
  const added=new Map();const edge=(a,b,cost,capacity,reverseCost=cost,via=[])=>{
    if(a===b)return;const key=a<b?a+':'+b:b+':'+a,prior=added.get(key);
    if(prior){const forward=prior.a===a?cost:reverseCost,reverse=prior.a===a?reverseCost:cost;
      if(forward<prior.cost||reverse<prior.reverseCost){prior.cost=Math.min(prior.cost,forward);prior.reverseCost=Math.min(prior.reverseCost,reverse);prior.via=via}
      prior.capacity=Math.max(prior.capacity,capacity);return;
    }
    const e={a,b,cost,reverseCost,capacity,via};added.set(key,e);s.tradeEdges.push(e);
  };
  // Small local exchange; bulk traffic needs an actual river, port or road node.
  for(const i of w.landIdx){if(s.pop[i]<100)continue;for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.pop[j]<100||j<i)continue;
    const linked=Math.min(s.node[i],s.node[j]),road=Math.min(s.roads[i]*s.infrastructure[i],s.roads[j]*s.infrastructure[j]);
    const owner=s.pol[i]?s.pols[s.pol[i]]:{kind:'community'},support=Math.min(transportSupport(i),transportSupport(j));
    const cost=routeCost(i,j,owner,true)*0.018,reverse=routeCost(j,i,owner,true)*0.018,cap=Math.min(s.pop[i],s.pop[j])*(0.002+(0.045*linked+0.015*road)*(0.2+0.8*support));
    edge(i,j,cost,cap,reverse)}}
  for(const i of nodes){
    if(w.riverNav[i]>0.15){let j=i,cost=0,reverse=0;const via=[];
      for(let k=0;k<12;k++){const prev=j;j=w.down[j];if(j<0||!w.land[j]||w.riverNav[j]<0.15)break;via.push(j);
        const owner=s.pol[i]?s.pols[s.pol[i]]:{kind:'community'};cost+=routeCost(prev,j,owner,true)*0.018;reverse+=routeCost(j,prev,owner,true)*0.018;
        if(s.node[j]>0.22){edge(i,j,cost,Math.min(s.pop[i],s.pop[j])*0.07*Math.min(riverBoats(i),riverBoats(j)),reverse,via);break}
      }
    }
    if(w.coast[i]&&s.sail[i]>0.4)for(let k=w.ls[i];k<w.ls[i+1];k++){const j=w.lt[k];if(s.node[j]>0.22&&s.sail[j]>0.3&&(w.ld[k]<=3||s.nav[i]>0.5))edge(i,j,0.025*w.ld[k],Math.min(s.pop[i],s.pop[j])*0.08*s.sail[i])}
  }
}
function tradeFood(accounts){
  const s=S;for(const e of s.tradeEdges){
    const a=s.food[e.a]/Math.max(1,s.need[e.a])>s.food[e.b]/Math.max(1,s.need[e.b])?e.a:e.b,b=a===e.a?e.b:e.a;
    const source=Math.max(0,s.food[a]-s.need[a]*1.08),demand=Math.max(0,s.need[b]*1.08-s.food[b]);
    const pa=s.pol[a]?s.pols[s.pol[a]]:null,pb=s.pol[b]?s.pols[s.pol[b]]:null;
    if(pa&&pb&&(pa.enemies.has(pb.id)||pb.enemies.has(pa.id)))continue;
    const safe=Math.min(pa?0.3+0.7*pa.health:0.5+s.organisation[a]*0.3,pb?0.3+0.7*pb.health:0.5+s.organisation[b]*0.3);
    if(e.via&&e.via.some(i=>{const o=s.pol[i]?s.pols[s.pol[i]]:null;return o&&(pa&&o.enemies.has(pa.id)||pb&&o.enemies.has(pb.id))}))continue;
    const cost=a===e.a?e.cost:(e.reverseCost==null?e.cost:e.reverseCost);
    const loss=clamp(cost+(1-safe)*0.2,0.01,0.75),n=Math.min(source,demand/(1-loss),Math.max(0,e.capacity-(e.freightUsed||0))*safe*epidemicTravelFactor(a,b)*civicTradeAccess(a,b));
    if(n<=0)continue;e.privateUsed=(e.privateUsed||0)+n;s.food[a]-=n;s.food[b]+=n*(1-loss);s.foodImports[b]+=n*(1-loss)*(pb?0.98:1);accounts.transportLoss+=n*loss;s.flow[a]+=n;s.flow[b]+=n;
    // A small toll is physically taken out of the delivered consignment.
    if(pb){const toll=n*(1-loss)*0.02;s.food[b]-=toll;depositPublic(pb,b,toll);pb.trade+=toll;pb.collected+=toll}
  }
}
function communityPass(){
  const s=S,w=WD,r=s.r;
  for(const i of w.landIdx){
    const p=s.pop[i];if(p<100){s.organisation[i]*=0.98;continue}
    s.raiding[i]*=0.985;
    const surplus=s.food[i]/p,pressure=p/Math.max(1,s.K[i]);
    const demand=clamp(0.15+0.25*w.rv[i]+0.3*s.node[i]+0.3*pressure,0,1);
    const investment=Math.min(s.food[i]*0.08,p*0.015)*clamp(surplus*3,0,1);s.food[i]-=investment;
    s.organisation[i]=clamp(s.organisation[i]+0.04*(investment/Math.max(1,p))*(0.3+demand)+0.002*demand*s.nutrition[i]-0.01*(1-s.nutrition[i]),0,1);
    // Infrastructure is a maintained stock, separate from knowing road-building.
    const o=s.pol[i]?s.pols[s.pol[i]]:null,pay=o?o.payroll:s.organisation[i]*0.5;
    localPolitics(i,o);
    s.infrastructure[i]=clamp(s.infrastructure[i]+0.015*pay*(0.2+s.roads[i]+skill(i,'canal'))*(1-s.infrastructure[i])-0.02*(1-pay)*s.infrastructure[i],0,1);
    if(!s.pol[i]&&s.farm[i]>0.3&&surplus>0.1){
      for(const k of ['storage','records']){const ix=TI[k];if(s.tk[ix][i]<0.5&&r()<0.025*P.invent*(0.2+s.organisation[i])){seedTech(s.tk[ix],i,0.8,0);firstTech(ix,i,null)}}
      if(s.rel[i]<0&&s.organisation[i]>0.4&&r()<0.0008*P.faith)foundLocalFaith(i);
    }
    if(o){
      const localPower=0.25+0.5*o.nobles+0.25*s.organisation[i],centre=o.central*o.health*(0.3+0.7*o.payroll)*transportAccess(i,o);
      s.autonomy[i]=clamp(s.autonomy[i]+0.025*(localPower-centre-s.autonomy[i]*0.4),0.05,0.95);
      s.unrest[i]=clamp(s.unrest[i]+0.08*(1-s.nutrition[i])+0.035*(1-o.payroll)+0.015*Math.max(0,o.ineq-0.5)-0.025*o.trust*o.rights,0,1);
      // Remote provincial networks become alternative centres when salaries fail.
      if(i!==o.capital&&o.health<0.45&&s.autonomy[i]>0.7&&s.unrest[i]>0.3&&s.organisation[i]>0.35&&s.year-(o.lastDefection||-1e9)>8&&r()<0.08){
        const id=newPolity(i,o,{origin:{type:'rebellion',from:o.id,why:'Local chiefs and officials withhold revenue as central protection and salaries fail.'}}),p0=s.pols[id];
        for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&s.pol[j]===o.id&&j!==o.capital&&s.autonomy[j]>0.6)s.pol[j]=id}
        partitionInstitutions(o,[p0]);o.lastDefection=s.year;o.shock+=0.08;
        chron('fall',`Provincial authorities in ${p0.base} stop remitting taxes and break away from the ${o.full}.`,i,[R_(o),R_(p0)]);
      }
    }
  }
  nonStateConflict();
}
function foundLocalFaith(c){
  const s=S,r=s.r,e=s.eths[s.eth[c]];if(!e)return;
  const person=newRuler(e.lang,null),f=figFor(null,person,'prophet');f.eth=e.id;f.pol=0;f.title='Keeper of a communal sanctuary';
  const id=s.rels.length,R={id,name:'the '+cap(e.lang.lex.god)+' Covenant',founder:f.id,born:s.year,origin:c,holy:c,pol:0,eth:e.id,fam:e.fam,kind:'ethnic',miss:0.15,cent:0.15,holder:0,rgb:hsl(r()*360,0.55,0.48),parent:-1,kids:[],cells:1,pop:s.pop[c],peak:1,alive:true,states:[],councils:0};
  s.rels.push(R);s.rel[c]=id;f.rel=id;chron('faith',`Communities of the ${e.name} maintain a shared sanctuary and ${R.name}.`,c,[RE(e),RR(R)]);
}
function institutionStep(o,c,y){
  const s=S,r=s.r;if(o.central==null)initInstitutions(o,null);
  const rec=recordSkill(c),office=skill(c,'office'),census=skill(c,'census'),school=skill(c,'school');
  o.comm=clamp(0.08+0.2*rec+0.18*skill(c,'post')*(0.2+0.8*s.mounts[c])+0.12*s.mounts[c]+0.12*s.roads[c]*s.infrastructure[c]+0.14*waterTransport(c)+0.12*skill(c,'canal')*s.infrastructure[c],0,1);
  const pastoral=o.kind==='horde'?(o.pastoralPractice||0):0;
  const targetStaff=o.pop*(0.001+0.004*rec+0.003*office+0.002*census+0.001*pastoral),training=Math.max(0,targetStaff-o.staff)*0.025*o.payroll;
  const trained=budgetPay(o,training*2)/2;o.staff=Math.max(0,o.staff+trained-o.staff*(0.012+0.03*(1-o.payroll)));
  const targetB=(0.1+0.25*rec+0.2*office+0.15*census+0.15*school+0.15*s.law[c]+0.06*pastoral)*Math.min(1,o.staff/Math.max(1,targetStaff*0.65))*o.payroll;
  o.bureau=clamp(o.bureau+0.012*(targetB-o.bureau),0,1);
  const security=clamp(0.3+0.35*o.health+0.35*o.payroll-o.hunger,0,1);
  const trustTarget=clamp(0.25+0.3*o.rights+0.25*security+0.2*o.mandate-0.2*o.ineq,0,1);o.trust=clamp(o.trust+0.018*(trustTarget-o.trust),0,1);
  o.succession=clamp(o.succession+0.006*(Math.max(o.customaryContinuity||0.15,skill(c,'succession')*(0.4+0.6*o.trust))-o.succession),0,1);
  o.rights=clamp(o.rights+0.003*(Math.max(o.customaryRights||0.35,skill(c,'charter')*(0.4+0.6*o.nobles))-o.rights),0.08,0.9);
  const G=o.groups;
  G.nobles.power=o.nobles;G.nobles.loyalty=clamp(0.25+0.35*o.rights+0.3*security-0.2*o.central,0,1);
  G.officials.power=o.bureau;G.officials.loyalty=clamp(0.15+0.65*o.payroll+0.2*o.succession,0,1);
  G.merchants.power=clamp((o.trade||0)/Math.max(1,o.collected)*3+0.15*s.node[c],0.05,0.6);G.merchants.loyalty=clamp(0.2+0.5*security+0.3*o.rights,0,1);
  G.clergy.power=clamp(0.1+0.3*(o.rel>=0?s.rels[o.rel].cent:0),0,0.5);G.clergy.loyalty=clamp(0.3+0.3*o.mandate+0.2*o.rights,0,1);
  o.coalition=Object.values(G).reduce((n,g)=>n+g.power*g.loyalty,0)/Math.max(0.01,Object.values(G).reduce((n,g)=>n+g.power,0));
  if(o.kind==='horde')o.coalition=clamp(o.coalition*0.45+(o.clanCohesion??0.6)*0.55,0,1);
  // Connected territory creates a reason to standardize, rather than a named-region bonus.
  const networkDemand=clamp((o.network||0)*0.25+(o.corridor||0)*0.45+Math.min(1,o.cells/60)*0.15+o.comm*0.15,0,1);
  o.central=clamp(o.central+0.0015*(0.15+o.bureau*0.6+networkDemand*0.25-o.central)*o.payroll-0.001*(1-o.payroll)*o.nobles,0.08,0.95);
  const support=G.officials.power*G.officials.loyalty+G.merchants.power*G.merchants.loyalty+G.clergy.power*G.clergy.loyalty*0.3;
  if(y-o.lastReform>60&&o.ruler.comp>0.68&&o.health>0.7&&o.trust>0.5&&o.bureau>0.15&&o.grain>o.pop*0.12&&support>o.nobles*0.4&&r()<0.004*P.invent){
    budgetPay(o,o.pop*0.10);o.central=clamp(o.central+0.07,0,1);o.nobles=Math.max(0.15,o.nobles-0.06);o.health-=0.08;o.shock+=0.1;o.lastReform=y;o.reforms.push(y);
    o.gov=o.central>0.5?'Bureaucratic':o.rights>0.5?'Council':'Patrimonial';
    chron('culture',`${cap(rulerName(o))} wins support for new salaried offices in the ${o.full}, reducing the authority of hereditary intermediaries.`,c,[R_(o)],'Reserves, trained replacements and a supporting coalition make a costly reform possible.');
  }
  strategicStep(o,c,y);
  const stress=clamp(0.45*(1-o.payroll)+0.3*o.hunger+0.25*Math.min(1,o.arrears/Math.max(1,o.collected))+0.2*Math.max(0,0.5-o.coalition)+0.12*Math.max(0,o.md/Math.max(1,o.h)-1)+0.08*o.conquestLoad,0,1);
  o.strain=clamp(o.strain+0.025*(stress-o.strain),0,1);
  const resilience=0.2+0.25*o.bureau+0.2*o.succession+0.2*o.trust+0.15*o.comm;
  const targetHealth=clamp(1-o.strain*1.5-o.shock*0.18,0,1);
  o.health=clamp(o.health+0.025*(targetHealth-o.health)-0.012*Math.max(0,0.4-o.health)*(1-o.payroll),0.02,1);
  o.resilience=resilience;o.pT=Math.max(0,o.burden-1)*0.25;o.pF=clamp(o.arrears/Math.max(1,o.collected),0,3)*0.25;
  o.cplx=0.15+o.bureau*0.5+o.central*0.2+o.comm*0.15;
  o.ineq=clamp((o.ineq==null?0.25:o.ineq)+0.0007*(o.press-0.8)+0.0002*o.nobles-0.0003*o.rights*o.trust,0.15,0.92);o.pQ=Math.max(0,o.ineq-0.55)*(0.4+o.hunger);
  if(!o.heir&&y-o.ruler.birth>28){const h=newRuler(s.eths[o.core].lang,null);h.birth=y-Math.max(0,Math.min(y-o.ruler.birth-19,12+r()*8));h.death=Math.max(45,h.death);o.heir=h}
}
function selectSuccessor(o,L){
  const r=S.r;
  if(o.gov!=='Council'&&o.heir&&S.year-o.heir.birth>=14&&r()<0.3+0.65*o.succession){const h=o.heir;o.heir=null;h.since=S.year;h.mi=0;return h}
  o.heir=null;const candidates=[newRuler(L,o),newRuler(L,o),newRuler(L,o)];
  if(o.gov==='Council')candidates.sort((a,b)=>(b.comp+b.char)-(a.comp+a.char));
  return candidates[0];
}
function institutionalRisk(o){
  const resistance=0.35+(o.resilience||0.2)+(o.coalition||0.5)*0.3;
  const organized=(0.25+0.75*(o.comm||0.1))*(0.3+0.7*(o.nobles||0.5));
  return clamp(P.crisis*0.0015*Math.pow(Math.max(0,o.psi-0.5),2)*(0.2+o.strain*3)*(0.4+organized)/resistance*(o.island?0.65:1),0,0.9);
}
function partitionInstitutions(parent,children){
  endForeignServiceOf(parent);
  const s=S,ids=new Set(children.map(o=>o.id)),pops=new Map();let total=0;
  for(const i of WD.landIdx)if(s.pol[i]===parent.id||ids.has(s.pol[i])){pops.set(s.pol[i],(pops.get(s.pol[i])||0)+s.pop[i]);total+=s.pop[i]}
  const reserves=parent.grain,army=parent.army,armyFree=parent.armyFree,defFree=parent.defFree,staff=parent.staff,navy=parent.navy;
  for(const o of [parent,...children]){const share=(pops.get(o.id)||0)/Math.max(1,total);o.pop=pops.get(o.id)||0;o.grain=o===parent?reserves:0;o.army=army*share;o.armyFree=armyFree*share;o.defFree=defFree*share;o.staff=staff*share;o.navy=navy*share;o.lastCrisis=s.year;o.health=Math.max(0.35,o.health);o.strain*=0.65}
}
function inheritConquest(o,d){endForeignServiceOf(d);depositPublic(o,d.capital,d.grain||0);d.grain=0;o.staff+=(d.staff||0)*0.7;d.staff=0;o.army+=(d.army||0)*0.3;d.army=0;o.navy+=(d.navy||0)*0.5;d.navy=0}
function culturalIntegration(i,o){
  const s=S;if(s.eth[i]===o.core||s.eth[i]<0||o.conqDyn)return;
  const n=s.pop[i]*(0.0001+0.0007*skill(i,'school'))*o.trust*s.integ[i]*P.assim;
  if(n>0)mergeCulture(i,o.core,n,Math.max(1,s.pop[i]-n));
  // Political loyalty can cross language and ancestry boundaries.
}
function nonStateConflict(){
  const s=S,w=WD,r=s.r,L=w.landIdx;
  for(let k=0;k<Math.ceil(L.length/100);k++){
    const i=L[(r()*L.length)|0];if(s.pol[i]||s.pop[i]<2500||s.organisation[i]<0.25||s.eth[i]<0)continue;
    const j=w.nb[i*4+((r()*4)|0)];if(j<0||!w.land[j]||s.eth[j]<0||s.eth[j]===s.eth[i])continue;
    const motive=0.15+s.pop[i]/Math.max(1,s.K[i])+s.unrest[i];if(r()>0.08*P.warRate*motive)continue;
    const allies=[i];for(let d=0;d<4;d++){const c=w.nb[i*4+d];if(c>=0&&!s.pol[c]&&s.eth[c]===s.eth[i]&&s.organisation[c]>0.2)allies.push(c)}
    let people=0,food=0;for(const c of allies){people+=s.pop[c];food+=s.food[c]}
    const force=people*(0.025+0.03*s.herd[i])*s.organisation[i],attack=Math.pow(force+1,P.scaleExp)*milAt(i),def=fieldDefense(j,true);
    const cost=force*0.12;if(food<cost)continue;s.societyCounters.nonStateBattles++;for(const c of allies)s.food[c]=Math.max(0,s.food[c]-cost*s.food[c]/Math.max(1,food));
    if(r()<clamp(attack/(attack+def)-0.1,0.02,0.85)){
      s.raiding[i]=clamp(s.raiding[i]+0.025,0,1);
      const old=s.eth[j],violence=clamp(0.02+0.08*motive,0.02,0.18);s.pop[j]*=1-violence;displace(j,0.15+0.2*motive,0);
      const inv=s.pop[i]*0.12,young=s.young[i]*0.12,provisions=Math.min(s.food[i],inv*0.2),animals=takeHerd(i,0.12);s.pop[i]-=inv;s.young[i]-=young;s.young[j]+=young;s.food[i]-=provisions;s.food[j]+=provisions;const oldPop=s.pop[j];s.pop[j]+=inv;putHerd(j,animals);mergeCulture(j,s.eth[i],inv,oldPop);mergeAncestry(j,s.ancestry[i],inv,oldPop);s.settleLag[j]=1;s.newcomers[j]+=inv;
      if(s.pol[j]){s.pols[s.pol[j]].shock+=0.12;s.pol[j]=0}s.organisation[j]=Math.max(s.organisation[j],s.organisation[i]*0.7);s.unrest[j]=0.5;
      if(r()<0.25)chron('war',`An alliance of ${s.eths[s.eth[i]].name} communities defeats and displaces ${s.eths[old].name} neighbours.`,j,[RE(s.eths[s.eth[i]]),RE(s.eths[old])]);
      if(s.pop[i]>10000&&s.pop[i]/Math.max(1,s.K[i])>0.85&&s.activeMigs.length<12&&r()<0.25){
        const n=s.pop[i]*0.25,young=s.young[i]*0.25,animals=takeHerd(i,0.25);s.pop[i]-=n;s.young[i]-=young;const M=startMigration({eth:s.eth[i],pop:n,young,animals,cell:i,dx:dxWrap(i,j),dy:w.cyA[j]-w.cyA[i],kind:'warband',cause:'land'});M.food=Math.min(s.food[i],n);s.food[i]-=M.food;
      }
    }else{s.pop[i]=Math.max(0,s.pop[i]-force*0.15);s.raiding[i]*=0.9}
  }
}
function refugeePressure(e,amount,cell,byPol,fromMig,food,young,animals,ancestry){
  const s=S;if(e<0||amount<1)return;
  let p=s.press.get(e);if(!p){p={p:0,food:0,young:0,animals:emptyHerd(),y:s.year,cell,by:byPol,mig:fromMig};s.press.set(e,p)}
  if(!p.animals)p.animals=emptyHerd();if(animals)addHerd(p.animals,animals);
  if(ancestry!=null)p.ancestry=ancestry;
  const history=diseaseHistory(cell);p.immunity=history.map((v,k)=>((p.immunity?.[k]||0)*p.p+v*amount)/Math.max(1,p.p+amount));
  p.p+=amount;p.food+=food||0;p.young+=young||0;p.cell=cell;p.y=s.year;if(byPol)p.by=byPol;if(fromMig!=null)p.mig=fromMig;
  const threshold=clamp(localPop(cell)*0.15,4000,80000);
  if(p.p>=threshold&&s.activeMigs.length<20&&s.r()<0.25*P.wander){
    s.press.delete(e);const a=s.r()*Math.PI*2;
    const M=startMigration({eth:e,pop:p.p,cell,dx:Math.cos(a),dy:Math.sin(a),kind:'people',food:p.food,young:p.young,animals:p.animals});
    M.food=p.food;M.young=p.young;M.immunity=p.immunity;if(p.ancestry!=null){M.ancestry=p.ancestry;M.groups[0].ancestry=p.ancestry}
  }
}
function refugeePass(){
  const s=S;
  for(const [eth,p] of s.press){
    // Displaced people remain in the demographic ledger while awaiting movement.
    const eat=Math.min(p.food,p.p*0.7);p.food-=eat;p.p*=1-0.015-0.06*(1-eat/Math.max(1,p.p*0.7));p.young=Math.min(p.young,p.p*0.6);
    if(p.p<100||s.year-p.y>12){
      const old=s.pop[p.cell];s.pop[p.cell]+=p.p;s.food[p.cell]+=p.food;mergeCulture(p.cell,eth,p.p,old);mergeAncestry(p.cell,p.ancestry??eth,p.p,old);mixDiseaseHistory(p.cell,p.immunity,p.p,old);s.young[p.cell]+=p.young;putHerd(p.cell,p.animals);s.press.delete(eth);
    }
  }
}
function displacedPeople(j,frac,byPol){
  const s=S,n=s.pop[j]*clamp(frac,0,0.85);if(n<1)return 0;
  s.societyCounters.displacements+=n;
  const ratio=n/s.pop[j],food=s.food[j]*ratio,young=s.young[j]*ratio,animals=takeHerd(j,ratio),minority=s.eth2[j]>=0?s.mix[j]:0;s.pop[j]-=n;s.food[j]-=food;s.young[j]-=young;
  for(const [eth,share] of [[s.eth[j],1-minority],[s.eth2[j],minority]])if(eth>=0&&share>0)refugeePressure(eth,n*share,j,byPol,null,food*share,young*share,animals.map(v=>v*share),s.ancestry[j]);return n;
}
function migrationCampaign(M){
  const s=S,w=WD,r=s.r;if(M.done)return;
  const animals=M.animals.reduce((n,v)=>n+v,0),pasture=w.area[M.cell]*w.sH[M.cell]*0.15*Math.max(0,1-s.pop[M.cell]/Math.max(1,s.K[M.cell]));
  M.food+=Math.min(M.pop*0.35,animals*0.3,pasture);
  const supplied=Math.min(M.food||0,M.pop*0.7);M.food=Math.max(0,(M.food||0)-supplied);
  const survival=1+0.012-0.02-0.035*(1-supplied/Math.max(1,M.pop*0.7));scaleMigration(M,survival);
  for(let k=0;k<M.animals.length;k++)M.animals[k]*=clamp(0.97+0.04*animalSuitability(k,M.cell)-0.04*Math.max(0,0.5-s.wm[M.cell]),0.85,1.01);
  if(M.pop<250){disperse(M,'dwindled');return}
  let best=-1,score=-1e9;const origin=M.cell;
  if(M.kind==='horde'&&(M.routeYear==null||s.year-M.routeYear>=8||!M.route||!M.route.length)){
    const source=s.pols[M.pol]||{id:M.pol};M.route=migrationRoute(source,origin,Math.max(100,M.pop*0.09),240);M.routeYear=s.year;
  }
  while(M.route&&M.route[0]===origin)M.route.shift();const waypoint=M.route&&M.route[0];
  ring(origin,1,(j,dx,dy)=>{if(j===origin||!w.land[j]||w.T[j]<-9)return;
    const room=clamp((s.K[j]-s.pop[j])/Math.max(1,s.K[j]),-1,1),owner=s.pol[j]?s.pols[s.pol[j]]:null;
    const blocked=owner?M.blocked.get(owner.id)||0:0,force=M.pop*(M.kind==='people'?0.035:0.09);
    const danger=owner&&owner.id!==M.pol?fieldDefense(j,false)/Math.max(1,Math.pow(force+1,P.scaleExp)*M.S*M.mil):0;
    const value=(dx*M.dx+dy*M.dy)/Math.hypot(dx,dy)*(M.fails>1?0.4:0.9)+room*0.7-0.08*w.tcost[j]+r()*0.5-
      (M.path.slice(-18).includes(j)?1.4:0)-Math.min(2,danger*0.18)-blocked*0.4+(M.herd>0.4?w.sH[j]*pastureCondition(j)*0.7:0)-(s.pol[j]===M.pol?0:wallStrength(j)*3)-s.migrationPressure[j]*0.4+(j===waypoint?3:0);
    if(value>score){score=value;best=j}});
  if(best<0){settleMigration(M,origin,null);return}
  const j=best;if(!migrationWallPass(M,j)){M.fails++;turnMigration(M);return}
  const encounter=migrationNomadEncounter(M,j),q=s.pol[j],foreign=s.eth[j]>=0&&s.eth[j]!==M.eth&&s.pop[j]>1000;let won=encounter===true||!foreign&&(!q||q===M.pol);
  if(!won&&q&&r()<admissionChance(M,j,s.pols[q])*(M.kind==='people'?1:0.45))won=admitMigration(M,j,s.pols[q]);
  if(!won&&M.kind==='people'&&q&&r()<0.65){M.fails++;M.blocked.set(q,(M.blocked.get(q)||0)+1);turnMigration(M);return}
  if(!won){
    const force=M.pop*(M.kind==='people'?0.035:0.09),Ua=Math.pow(force+1,P.scaleExp)*M.S*M.mil*(0.8+0.4*M.experience),Ud=fieldDefense(j,true)*(1+borderBarrier(origin,j));
    won=r()<clamp(Ua/(Ua+Ud),0.02,0.9);scaleMigration(M,won?0.98:0.94);M.experience=clamp(M.experience+(won?0.025:0.008),0,1);
    if(q){const defender=s.pols[q];crisisEncounter(defender,null,!won,won?0.1:0.03);armyLoss(defender,j,Math.min(defender.army*0.1,force*(won?0.06:0.02)))}
    if(won){if(M.herd>0.4&&M.kind!=='people')sackSettlement({id:M.pol,kind:'horde',full:M.name,ruler:{aggr:0.4+M.experience*0.4},migration:M},j,force);s.pop[j]*=0.98;displacedPeople(j,M.kind==='people'?0.12:0.35,0);if(q){s.pols[q].shock+=0.08;if(!M.broke.includes(q))M.broke.push(q)}M.won=M.won||new Set();M.won.add(j)}
  }
  if(!won){M.fails++;if(q)M.blocked.set(q,(M.blocked.get(q)||0)+1);turnMigration(M);if(M.fails>10&&M.food<M.pop*0.1)settleMigration(M,origin,null);return}
  diseaseJourney(origin,j,travelDays(origin,j),Math.min(M.pop,600),'migration');M.cell=j;M.steps++;M.path.push(j);scatterMigration(M,j);if(M.route&&M.route[0]===j)M.route.shift();s.migrationPressure[j]=clamp(s.migrationPressure[j]+M.pop/Math.max(10000,s.K[j])*0.2,0,2);
  // Provisions seized or purchased in transit are removed from local stocks.
  const forage=Math.min(s.food[j]*0.15,M.pop*0.15);s.food[j]-=forage;M.food+=forage;
  recruitMigration(M,j);
  const room=s.K[j]-s.pop[j],settleChance=M.kind==='people'?0.2:w.nomad[j]?0.025:0.08;
  if(M.steps>M.max||s.year-M.start>120||(M.steps>5&&room>M.pop*0.4&&r()<settleChance)||M.peaceful)settleMigration(M,j,q?s.pols[q]:null);
}
function settleMigration(M,j,t){
  const s=S,w=WD;if(M.done)return;
  // Adjacent occupied provinces cannot be annexed by merely settling nearby.
  const host=M.admission?s.pols[M.admission.host]:null;
  const cells=[j];for(let d=0;d<4;d++){const c=w.nb[j*4+d];if(c>=0&&w.land[c]&&cells.length<4&&(host?s.pol[c]===host.id:!s.pol[c]||s.pol[c]===M.pol)&&(s.pop[c]<1||s.eth[c]===M.eth))cells.push(c)}
  const weights=cells.map(c=>Math.max(100,s.K[c]-s.pop[c])),total=weights.reduce((a,b)=>a+b,0);
  for(let k=0;k<cells.length;k++){
    const c=cells[k],old=s.pop[c],n=M.pop*weights[k]/total,empty=old<1;
    s.pop[c]+=n;s.food[c]+=(M.food||0)*weights[k]/total;s.young[c]+=(M.young||M.pop*0.3)*weights[k]/total;
    if(empty){s.eth[c]=M.eth;s.ancestry[c]=M.ancestry==null?M.eth:M.ancestry;s.eth2[c]=-1;s.rel[c]=M.rel;s.infrastructure[c]=0;s.organisation[c]=0.15}
    depositMigrationGroups(c,M,n,old);mixDiseaseHistory(c,M.immunity,n,old);
    putHerd(c,M.animals.map(v=>v*weights[k]/total));if(M.crops)for(let f=0;f<CROPS.length;f++)s.cropAccess[f][c]=Math.max(s.cropAccess[f][c],M.crops[f]*0.8);
    s.settleLag[c]=empty?2:1;s.newcomers[c]+=n;for(let f=0;f<s.tk.length;f++)s.tk[f][c]=Math.max(s.tk[f][c],M.techs[f]*0.8);
    if(M.won&&M.won.has(c))s.pol[c]=0;
  }
  if(host&&host.alive&&s.pol[j]===host.id){host.compacts.push({cell:j,eth:M.eth,people:M.pop,promised:M.admission.promised,since:s.year,loyalty:0.75,failures:0,broken:false,done:false});s.societyCounters.admissions++}
  M.animals=emptyHerd();
  M.food=0;M.done=true;M.end=s.year;s.activeMigs=s.activeMigs.filter(id=>id!==M.id);
  let o=null;
  if(!M.peaceful&&M.pop>15000&&s.organisation[j]>0.3&&(M.farm>0.5||M.herd>0.5)&&!s.pol[j]){const id=newPolity(j,null,{kind:M.herd>0.5&&w.nomad[j]?'horde':'state',conqDyn:true,origin:{type:'migration',mig:M.id,people:M.eth,from:t?t.id:0}});o=s.pols[id];o.core=M.eth;o.raidSkill=M.experience;for(const c of cells)if(!s.pol[c])s.pol[c]=id}
  M.settledPol=o?o.id:0;M.result=o?'settled and founded the '+o.full:M.peaceful?'settled by agreement':'settled as autonomous communities';
  if(M.logged||M.kind==='warband')chron('migration',`After ${s.year-M.start} years, the ${M.name} ${M.result}.`,j,[RM(M),RE(s.eths[M.eth]),...(o?[R_(o)]:[])]);
}
function territorialAttack(o,i,j,sea){
  const s=S,w=WD,q=s.pol[j];if(o.kind==='state'&&o.campaign&&(i!==o.campaign.from||j!==o.campaign.to))return;
  if(!q&&!frontierReady(o,i,j))return;
  if(o.kind==='state'&&!frontierHoldable(o,i,j)&&!(q&&delegationPossible(o,i,j)))return;
  if(o.kind==='horde'&&q&&protectedByTreaty(s.pols[q],o))return;
  if(!q&&s.pop[j]<1){
    if(o.kind==='state')foundSettlement(i,j,Math.min(2000,s.pop[i]*0.08),o);
    else if((w.nomad[j]||w.desert[j])&&dd(i)<o.h&&budgetPay(o,100)>=100){s.pol[j]=o.id;s.taken[j]=s.year;s.dist[j]=Math.min(65534,s.dist[i]+w.tcost[j])}
    return;
  }
  const force=campaignForce(o,i,sea);if(!force)return;recordFrontierPressure(o,j,0.2);diseaseJourney(i,j,travelDays(i,j,sea),Math.min(force,500),'army');
  if(wallStrength(j)>0.3&&!tryWallBreach(o,i,j,force)){o.blockadePressure=clamp(o.blockadePressure+0.08,0,1);return;}
  if(q&&s.r()<eliteDefectionChance(o,j)){switchEliteAllegiance(o,j);return}
  let Ua=Math.pow(force+1,P.scaleExp)*(0.4+0.3*o.S+0.3*s.s[i])*milAt(i)*(0.65+0.35*o.preparedness),Ud=fieldDefense(j,true)*(sea?1:1+borderBarrier(i,j));
  if(sea){const defender=q?s.pols[q]:null;Ua*=clamp(0.45+0.35*s.nav[i]+0.25*s.ocean[i]-0.2*(defender?s.nav[j]:0),0.2,1)}
  if(!q)Ud*=1+0.8*s.forest[j]+w.rough[j];if(w.rangeExposure[j]>0.4&&o.kind!=='horde')Ud*=1+2*pastoralMobility(j)/(1+gunEffect(i));
  if(w.tsetse[j]&&!w.tsetse[o.capital])Ua*=0.6;
  const niche=Math.exp(-P.eco*0.5*Math.max(0,ecoD(j,o)-0.4)/(0.6+o.bureau)),legacy=hasLegacy(o,j)?1.1:1;
  const chance=clamp((Ua/(Ua+Ud)-0.12)*niche*legacy,0.01,0.88),win=s.r()<chance;
  campaignCasualties(o,i,force*(win?0.025:0.09));if(q)defenseCasualties(s.pols[q],j,Math.min(s.pop[j]*0.01,force*(win?0.06:0.02)));
  crisisEncounter(o,q?s.pols[q]:null,win,win?0.025:0.09);if(q)crisisEncounter(s.pols[q],o,!win,win?0.09:0.025);
  recordVictory(o,win,win?0.025:0.09);if(!win)return;if(q&&pastoralBattleOutcome(o,s.pols[q],j))return;if(!besiegeCity(o,i,j,force))return;
  warnCommunities(j,o);
  const delegated=q&&o.kind==='state'&&delegationPossible(o,i,j)&&(o.bureau<0.35||!frontierHoldable(o,i,j));
  if(delegated&&!establishDelegation(o,i,j,q))return;
  if(o.kind==='state'&&!delegated&&!frontierHoldable(o,i,j))return;
  conquestRecorded(o,j,q);
  o.occupation=Math.max(0,o.occupation-Math.max(100,s.pop[j]*0.015));budgetPay(o,Math.min(o.grain,s.pop[j]*0.01));
  s.integ[j]=0.1+0.12*(s.rel[j]>=0&&s.rel[j]===o.rel?1:0)+0.1*o.rights;s.autonomy[j]=Math.max(0.6,s.autonomy[j]);
  s.pol[j]=o.id;s.taken[j]=s.year;s.dist[j]=Math.min(65534,s.dist[i]+(sea?6:w.tcost[j]||2));s.pop[j]*=1-(s.fort[j]>0.5?0.015:0.004);s.unrest[j]=Math.max(0.3,s.unrest[j]);o.conq++;o.ruler.conq++;
  // Jurisdiction changes after a victory. Moving colonists into inhabited land
  // is a separate movement, paid for from household and public provisions.
  if(o.kind==='state'&&s.eth[j]!==o.core&&o.occupation>500&&o.health>0.6&&o.grain>800&&s.pop[i]>10000&&s.r()<0.2+0.3*o.central)
    foundSettlement(i,j,Math.min(1000,s.pop[i]*0.03),o);
  if(o.kind==='horde')displacedPeople(j,0.12,o.id);
  if(q){const d=s.pols[q];if(j===d.capital&&installConquestDynasty(o,d,j))return;d.lastBy=o.id;d.shock+=0.01;d.mandate=Math.max(0,d.mandate-0.015);const wid=o.enemies.get(q);if(wid!=null){const war=s.wars[wid];if(war.aSet.has(o.id))war.gA++;else war.gD++;war.lastGain=s.year;
    if(j===d.capital&&o.kind==='state'&&(d.cells<0.7*o.cells||d.health<0.3))decisive(o,d,war)}}
}
function territorialRaid(o,i,j){
  const s=S,target=s.pol[j]?s.pols[s.pol[j]]:null;if(target&&(target.over===o.id||protectedByTreaty(target,o)))return;
  const force=campaignForce(o,i,false);if(!force)return;recordFrontierPressure(o,j,0.12);diseaseJourney(i,j,travelDays(i,j),Math.min(force,400),'army');
  if(wallStrength(j)>0.3&&!tryWallBreach(o,i,j,force)){o.failedRaids=(o.failedRaids||0)+1;o.blockadePressure=clamp(o.blockadePressure+0.08,0,1);return;}
  const attack=Math.pow(force+1,P.scaleExp)*milAt(i)*(0.8+0.4*o.raidSkill),def=fieldDefense(j,true)*(1+borderBarrier(i,j));
  if(s.r()>attack/(attack+def)){campaignCasualties(o,i,force*0.04);crisisEncounter(o,target,false,0.04);recordVictory(o,false,0.04);if(target)crisisEncounter(target,o,true,0.02);o.failedRaids=(o.failedRaids||0)+1;return}
  crisisEncounter(o,target,true,0.015);recordVictory(o,true,0.015);raidDamageAt(o,i,j,force);if(target)crisisEncounter(target,o,false,0.05);o.failedRaids=Math.max(0,(o.failedRaids||0)-1);
  const booty=Math.min(s.food[j]*0.2,force*0.5);s.food[j]-=booty;depositPublic(o,i,booty);o.loot+=booty;
  putHerd(i,takeHerd(j,0.025));
  displacedPeople(j,0.025,o.id);if(target){target.shock+=0.025;target.raided=(target.raided||0)+1}else s.unrest[j]=Math.min(1,s.unrest[j]+0.05);campaignCasualties(o,i,force*0.015);
}
function socialObservations(){
  const s=S,w=WD;if(!w.regions)return [];
  return w.regions.map(R=>{let population=0,ruled=0,urban=0,admin=0,autonomous=0;const states=new Set();
    for(const i of R.cells){const p=s.pop[i];population+=p;urban=Math.max(urban,s.urban[i]);const o=s.pol[i]?s.pols[s.pol[i]]:null;
      if(o){ruled+=p;states.add(o.id);admin+=p*(1+(o.central>0.25?1:0)+(o.bureau>0.3?1:0)+(o.central>0.6&&o.bureau>0.5?1:0))}
      else if(s.organisation[i]>0.4)autonomous+=p;
    }
    return {name:R.n,population,ruled:ruled/Math.max(1,population),largestSettlement:urban,adminLevels:admin/Math.max(1,ruled),polities:states.size,organizedAutonomous:autonomous/Math.max(1,population)};
  });
}
function societyMetrics(){
  const s=S,states=s.alive.map(id=>s.pols[id]).filter(o=>o.kind==='state');
  const animalStocks=ANIMALS.map((a,k)=>{let n=0;for(const i of WD.landIdx)n+=s.animals[k][i];for(const id of s.activeMigs)n+=s.migs[id].animals[k];for(const p of s.press.values())n+=(p.animals||[])[k]||0;for(const e of s.expeditions)if(!e.done)n+=e.animals[k];return Math.round(n)});
  return {kingdoms:states.filter(o=>o.tier==='Kingdom').length,empires:states.filter(o=>o.tier==='Empire').length,regionalStores:WD.landIdx.reduce((n,i)=>n+s.depot[i],0),foodError:s.accounts?s.accounts.error:0,animalError:s.animalAccounts?s.animalAccounts.error:0,animalStocks,cityStates:states.filter(o=>o.tier==='City-state').length,meanPreparedness:states.reduce((n,o)=>n+o.preparedness,0)/Math.max(1,states.length),tradeEdges:s.tradeEdges.length,communities:WD.landIdx.reduce((n,i)=>n+(s.organisation[i]>0.4&&!s.pol[i]?1:0),0),meanHealth:states.reduce((n,o)=>n+o.health,0)/Math.max(1,states.length),reforms:states.reduce((n,o)=>n+o.reforms.length,0),army:states.reduce((n,o)=>n+o.army,0),migrations:s.migs.length,coerciveMigrations:s.migs.filter(m=>m.kind==='warband'||m.kind==='horde').length,...s.societyCounters};
}

/* Transport stocks, geographic networks and political continuity.
   Distances are estimated travel days (stored in half-day units). These are
   coarse scenario rules, not reconstructed historical itineraries. */
const ANIMALS=[
  {k:'cattle',n:'Cattle',draft:0.18,pack:0.04,mount:0,rate:0.065,feed:0.08},
  {k:'buffalo',n:'Water buffalo',draft:0.22,pack:0.02,mount:0,rate:0.055,feed:0.07},
  {k:'donkey',n:'Donkeys',draft:0.03,pack:0.65,mount:0.04,rate:0.05,feed:0.045},
  {k:'horse',n:'Horses',draft:0.08,pack:0.18,mount:0.22,rate:0.05,feed:0.12},
  {k:'camel',n:'Camels',draft:0,pack:0.7,mount:0.12,rate:0.035,feed:0.045},
  {k:'llama',n:'Llamas',draft:0,pack:0.45,mount:0,rate:0.06,feed:0.035}
];
function emptyHerd(){return ANIMALS.map(()=>0)}
function addHerd(a,b){for(let k=0;k<a.length;k++)a[k]+=b[k]||0;return a}
function takeHerd(i,share){const s=S,a=emptyHerd();share=clamp(share,0,1);for(let k=0;k<a.length;k++){a[k]=s.animals[k][i]*share;s.animals[k][i]-=a[k]}refreshAnimalAccess(i);return a}
function putHerd(i,a){if(!a)return;for(let k=0;k<ANIMALS.length;k++)S.animals[k][i]+=a[k]||0;refreshAnimalAccess(i)}
function initDynamics(){
  const s=S,w=WD;
  s.animals=ANIMALS.map(()=>new Float64Array(N));s.animalFeed=new Float32Array(N).fill(1);
  for(const k of ['traction','pack','mounts','cityIdentity','eliteStake','eliteLoyalty','orchards','raiding'])s[k]=new Float32Array(N);
  s.cityHome=new Int32Array(N);s.returnDist=new Uint16Array(N).fill(65535);s.supplyDist=new Uint16Array(N).fill(65535);
  s.clan=new Int32Array(N);s.animalOrigins=[];
  Object.assign(s.societyCounters,{animalBirths:0,animalDeaths:0,domesticated:0,confederations:0,clanDepartures:0,eliteDefections:0,admissions:0,brokenCompacts:0,successionFractures:0,leagues:0});
  for(const i of w.landIdx){s.eliteStake[i]=0.2;s.eliteLoyalty[i]=0.5;s.clan[i]=1+Math.floor(w.cxA[i]/3)+Math.ceil(W/3)*Math.floor(w.cyA[i]/3)}
  prepareCorridors(w);
  // Approximate scenario anchors for animal populations, distinct from knowledge
  // of herding/riding. Historical mode does not put breeders on every continent.
  const origins=[[0,38,39,-8500],[0,28,67,-6500],[1,28,72,-3000],[2,25,32,-3500],[3,48,43,-2200],[4,40,75,-2200],[4,22,50,-1200],[5,-14,-70,-3500]];
  if(w.isEarth&&P.hearthMode!=='random'){
    for(const [kind,la,lo,year] of origins){const at=nearestPeopled(cellAt(la,lo),8,i=>kind===1?animalSuitability(kind,i)>0.8:kind===4?animalSuitability(kind,i)>0.9:true);if(at>=0)s.animalOrigins.push({kind,cell:at,year,done:false})}
  }else{
    for(let kind=0;kind<ANIMALS.length;kind++){
      let cell=-1,best=0;for(let n=0;n<600;n++){const i=w.landIdx[(s.r()*w.landIdx.length)|0],v=animalSuitability(kind,i)*(0.6+0.4*s.r());if(s.pop[i]>100&&v>best){best=v;cell=i}}
      if(cell>=0)s.animalOrigins.push({kind,cell,year:s.start+1200+kind*550+Math.floor(s.r()*1800),done:false});
    }
  }
  animalOrigins();
}
function prepareCorridors(w){
  if(w.corridorsReady)return;
  w.riverNav=new Float32Array(N);w.riverBasin=new Int32Array(N).fill(-1);
  w.riverHead=new Int32Array(N).fill(-1);w.riverNext=new Int32Array(N).fill(-1);w.coastalCrop=new Float32Array(N);
  for(const i of w.landIdx){
    const j=w.down[i],drop=j>=0&&w.land[j]?Math.max(0,w.elev[i]-w.elev[j]):0;
    w.riverNav[i]=clamp((w.rv[i]-0.3)/0.45,0,1)*(1-0.8*w.rough[i])*clamp(1-drop/250,0,1);
    if(j>=0&&w.land[j]){w.riverNext[i]=w.riverHead[j];w.riverHead[j]=i}
    // Mediterranean-type crop opportunities also occur outside the Mediterranean.
    // Coastal shipping makes this potential useful; it does not irrigate deserts.
    const mild=clamp((w.T[i]-8)/7,0,1)*clamp((29-w.T[i])/7,0,1);
    w.coastalCrop[i]=w.coast[i]?mild*clamp((w.Pr[i]-220)/220,0,1)*clamp((1400-w.Pr[i])/500,0,1)*(1-w.rough[i]*0.6):0;
  }
  for(const i of w.landIdx){if(w.riverBasin[i]>=0)continue;let j=i,root=i;const path=[];
    while(j>=0&&w.land[j]&&w.riverBasin[j]<0){path.push(j);root=j;j=w.down[j]}
    if(j>=0&&w.land[j])root=w.riverBasin[j];for(const c of path)w.riverBasin[c]=root;
  }
  w.corridorsReady=true;
}
function animalSuitability(k,i){
  const w=WD,t=w.T[i],rain=w.Pr[i],rough=w.rough[i],disease=w.tsetse[i]?0.18:1;
  let v=1;
  if(k===0)v=clamp((t+13)/12,0,1)*clamp((36-t)/10,0,1)*clamp((rain-120)/400,0.05,1)*disease;
  if(k===1)v=clamp((t-9)/10,0,1)*clamp((rain+900*w.rv[i]-450)/700,0,1)*(w.tsetse[i]?0.35:1);
  if(k===2)v=clamp((t+5)/15,0,1)*clamp((2200-rain)/1200,0.05,1)*disease;
  if(k===3)v=clamp((t+15)/15,0,1)*clamp((33-t)/10,0,1)*clamp((rain-100)/250,0.05,1)*clamp((2600-rain)/1500,0.1,1)*disease;
  if(k===4)v=clamp((1600-rain)/900,0.02,1)*clamp((t+12)/15,0,1);
  if(k===5)v=clamp((27-t)/12,0,1)*clamp((2500-rain)/1200,0.05,1)*clamp((rain-100)/250,0.05,1);
  return clamp(v*(1-rough*(k===5?0.15:0.45)),0,1);
}
function animalOrigins(){
  const s=S;for(const h of s.animalOrigins){if(h.done||s.year<h.year)continue;h.done=true;
    const n=Math.min(300,Math.max(20,s.pop[h.cell]*0.025));s.animals[h.kind][h.cell]+=n;s.societyCounters.domesticated+=n;
    s.herd[h.cell]=Math.max(0.7,s.herd[h.cell]);if(h.kind===3)s.horse[h.cell]=Math.max(0.7,s.horse[h.cell]);if(h.kind===4)s.camel[h.cell]=Math.max(0.7,s.camel[h.cell]);
    refreshAnimalAccess(h.cell);chron('ideas',`Communities begin breeding ${ANIMALS[h.kind].n.toLowerCase()} for work and transport.`,h.cell);
  }
}
function refreshAnimalAccess(i){
  const s=S,p=Math.max(100,s.pop[i]);let draft=0,pack=0,mount=0;
  for(let k=0;k<ANIMALS.length;k++){const n=s.animals[k][i],a=ANIMALS[k];draft+=n*a.draft;pack+=n*a.pack;mount+=n*a.mount}
  s.traction[i]=clamp(draft/(p*0.018),0,1);s.pack[i]=clamp(pack/(p*0.025),0,1);s.mounts[i]=clamp(mount/(p*0.01),0,1);
}
function animalFodder(i){let n=0;for(let k=0;k<ANIMALS.length;k++)n+=S.animals[k][i]*ANIMALS[k].feed;return n*(0.35+0.65*S.farm[i])}
function animalPass(){
  const s=S,w=WD;animalOrigins();if(s.year%5!==0)return;
  const a={start:0,births:0,deaths:0,end:0};
  for(const i of w.landIdx){
    let total=0;for(const f of s.animals)total+=f[i];a.start+=total;if(total<=0)continue;
    const scrub=w.desert[i]?w.area[i]*0.12*(0.2+Math.min(1,w.Pr[i]/250))*s.animals[4][i]/Math.max(1,total):0;
    const capacity=Math.max(1,s.pop[i]*(0.1+0.3*s.farm[i])+w.area[i]*w.sH[i]*0.5*(1-0.7*s.forest[i])+scrub);
    const crowd=Math.max(0,total/(capacity*pastureCondition(i))-1),shock=Math.max(0,0.65-pastureCondition(i));
    for(let k=0;k<ANIMALS.length;k++){const n=s.animals[k][i];if(n<=0)continue;
      const suit=animalSuitability(k,i),birth=n*ANIMALS[k].rate*5*suit*s.animalFeed[i]*(0.3+0.7*s.herd[i])*Math.max(0,1-total/capacity);
      const loss=Math.min(n+birth,n*5*(0.012+0.075*(1-suit)+0.06*(1-s.animalFeed[i])+0.08*shock+0.04*Math.min(3,crowd)));
      s.animals[k][i]=n+birth-loss;a.births+=birth;a.deaths+=loss;
    }
  }
  // Transfers are staged, preventing a breeding population from crossing the
  // entire continent in one pass. Payments are transfers of household food.
  const delta=ANIMALS.map(()=>new Float64Array(N)),available=s.animals.map(f=>Float64Array.from(f));
  const exchange=(i,j,capacity)=>{
    const oi=s.pol[i]?s.pols[s.pol[i]]:null,oj=s.pol[j]?s.pols[s.pol[j]]:null;
    if(oi&&oj&&(oi.enemies.has(oj.id)||oj.enemies.has(oi.id)))return;
    for(let k=0;k<ANIMALS.length;k++){
      const ri=s.animals[k][i]/Math.max(100,s.pop[i]),rj=s.animals[k][j]/Math.max(100,s.pop[j]);if(Math.abs(ri-rj)<0.0005)continue;
      const from=ri>rj?i:j,to=from===i?j:i;if(s.herd[to]<0.2||s.pop[to]<100)continue;
      const amount=Math.min(available[k][from]*capacity,Math.abs(ri-rj)*Math.max(100,s.pop[to])*0.25,s.food[to]/0.08)*animalSuitability(k,to);
      if(amount<=0)continue;available[k][from]-=amount;delta[k][from]-=amount;delta[k][to]+=amount;s.food[to]-=amount*0.08;s.food[from]+=amount*0.08;
    }
  };
  for(const i of w.landIdx)if(s.pop[i]>=100)for(let d=0;d<2;d++){const j=w.nb[i*4+(d===0?1:3)];if(j>=0&&w.land[j])exchange(i,j,0.025+0.05*Math.min(s.node[i],s.node[j]))}
  for(const e of s.tradeEdges)exchange(e.a,e.b,0.1);
  for(const i of w.landIdx){for(let k=0;k<ANIMALS.length;k++){s.animals[k][i]+=delta[k][i];a.end+=s.animals[k][i]}refreshAnimalAccess(i)}
  s.societyCounters.animalBirths+=a.births;s.societyCounters.animalDeaths+=a.deaths;a.error=a.start+a.births-a.deaths-a.end;s.animalAccounts=a;
}
function riverBoats(i){return clamp(0.1+0.35*S.farm[i]+0.4*S.sail[i]+0.15*S.organisation[i],0,1)}
function waterTransport(i){return Math.max(S.sail[i]*(WD.coast[i]?0.7:0),riverBoats(i)*(WD.riverNav[i]||0))*(0.4+0.6*S.infrastructure[i])}
function transportSupport(i){return clamp(0.1+0.42*S.pack[i]+0.23*S.traction[i]+0.75*waterTransport(i)+0.18*S.organisation[i],0.1,1)}
function frontierTransport(i,j){
  const s=S,w=WD,p=Math.max(100,s.pop[i]);let carrying=0,draft=0;
  for(let k=0;k<ANIMALS.length;k++){const usable=s.animals[k][i]*animalSuitability(k,j);carrying+=usable*ANIMALS[k].pack;draft+=usable*ANIMALS[k].draft}
  const water=alongRiver(i,j)?riverBoats(i)*Math.min(w.riverNav[i],w.riverNav[j]):w.coast[i]&&w.coast[j]?s.sail[i]*0.7:0;
  return clamp(0.1+0.42*clamp(carrying/(p*0.025),0,1)+0.23*clamp(draft/(p*0.018),0,1)+0.75*water+0.18*s.organisation[i],0.1,1);
}
function alongRiver(i,j){return WD.down[i]===j||WD.down[j]===i}
function crossingRiver(i,j){
  const w=WD;if(alongRiver(i,j))return 0;const c=w.rv[i]>=w.rv[j]?i:j;if(w.rv[c]<0.45)return 0;
  const d=w.down[c];if(d<0)return 0;const fx=dxWrap(c,d),fy=w.cyA[d]-w.cyA[c],mx=dxWrap(i,j),my=w.cyA[j]-w.cyA[i];
  const dot=Math.abs(fx*mx+fy*my)/Math.max(1,Math.hypot(fx,fy)*Math.hypot(mx,my));return dot<0.65?w.rv[c]:0;
}
function borderBarrier(i,j){
  const w=WD,bridge=Math.min(S.roads[i]*S.infrastructure[i],S.roads[j]*S.infrastructure[j]);
  return clamp(Math.max(w.rough[i],w.rough[j])*0.8+crossingRiver(i,j)*(1-0.65*bridge),0,1.6);
}
function routeCost(i,j,o,supply){
  const s=S,w=WD,km=100*Math.hypot(dxWrap(i,j)*w.cosLat[i],w.cyA[j]-w.cyA[i]);
  const road=Math.min(s.roads[i]*s.infrastructure[i],s.roads[j]*s.infrastructure[j]);
  const terrain=1+P.terrain*(Math.max(w.rough[i],w.rough[j])*2.2+Math.max(s.forest[i],s.forest[j])*0.8+Math.max(w.desert[i],w.desert[j])*0.9);
  const mounted=Math.min(s.mounts[i],s.mounts[j]),relay=Math.min(skill(i,'post'),skill(j,'post'))*Math.min(s.infrastructure[i],s.infrastructure[j]);
  let days=km/(supply?25*(0.25+0.75*Math.min(s.pack[i],s.pack[j])):25+35*mounted+65*mounted*relay);
  days*=terrain/(1+road*0.8);days+=crossingRiver(i,j)*(1.3-road*0.9);
  if(o.kind==='horde'&&w.nomad[i]&&w.nomad[j])days*=0.65;
  if(alongRiver(i,j)){
    const nav=Math.min(w.riverNav[i],w.riverNav[j]),sail=Math.min(riverBoats(i),riverBoats(j));
    const season=clamp(0.5+0.5*Math.min(s.wm[i],s.wm[j])-0.2*(w.rainSeasonality?w.rainSeasonality[i]:0),0.2,1)*(w.T[i]<2?0.65:1);
    const speed=w.down[i]===j?75:30,canal=Math.min(skill(i,'canal'),skill(j,'canal'))*Math.min(s.infrastructure[i],s.infrastructure[j]);
    const boat=km/(speed*(0.5+0.5*sail))*(supply?0.2:1)/(Math.max(0.05,nav*season)*(0.6+0.4*s.infrastructure[i])+canal*0.4);
    if(sail>0.25)days=Math.min(days,boat);
  }
  return clamp(days,0.5,60);
}
function routeDistances(){
  const s=S,w=WD,run=(out,reverse,supply)=>{
    out.fill(65535);const buckets=Array.from({length:256},()=>[]);let pending=0;
    for(const id of s.alive){const o=s.pols[id],c=o.capital;if(s.pol[c]!==id)continue;out[c]=0;buckets[0].push(c);pending++}
    const relax=(i,j,d,cost)=>{if(j<0||s.pol[j]!==s.pol[i])return;const nd=d+Math.max(1,Math.min(240,Math.round(cost*2)));if(nd<out[j]){out[j]=nd;buckets[nd&255].push(j);pending++}};
    for(let d=0;pending&&d<65535;d++){const q=buckets[d&255];buckets[d&255]=[];
      for(const i of q){pending--;if(out[i]!==d)continue;const o=s.pols[s.pol[i]];
        for(let k=0;k<4;k++){const j=w.nb[i*4+k];if(j>=0&&s.pol[j]===o.id)relax(i,j,d,reverse?routeCost(j,i,o,supply):routeCost(i,j,o,supply))}
        const down=w.down[i];if(down>=0&&w.land[down]&&s.pol[down]===o.id)relax(i,down,d,reverse?routeCost(down,i,o,supply):routeCost(i,down,o,supply));
        for(let j=w.riverHead[i];j>=0;j=w.riverNext[j])if(s.pol[j]===o.id)relax(i,j,d,reverse?routeCost(j,i,o,supply):routeCost(i,j,o,supply));
        if(w.coast[i]&&s.sail[i]>0.5)for(let k=w.ls[i];k<w.ls[i+1];k++){const j=w.lt[k],distance=w.ld[k];if(s.pol[j]!==o.id||s.sail[j]<0.3||(distance>3&&s.nav[i]<0.5))continue;
          const season=w.T[i]<2?1.5:1.1;relax(i,j,d,distance*season*(supply?0.3:0.9)/(0.5+0.5*Math.min(s.sail[i],s.sail[j])));
        }
      }
    }
  };
  run(s.dist,false,false);run(s.returnDist,true,false);run(s.supplyDist,false,true);
}
function settlementAppeal(i,j,o){
  const s=S,w=WD,market=w.coast[j]?s.sail[i]*(0.25+0.75*s.node[i])*(0.3+w.coastalCrop[j]):0;
  const yieldValue=clamp(s.K[j]/Math.max(1000,s.pop[j]+2000),0,3),access=o?transportAccess(i,o):1;
  return clamp((0.35+yieldValue*0.25+market)*access*(1-0.8*frontierRisk(j))/(1+w.rough[j]+s.forest[j]*0.5),0.02,2.5);
}
function initPoliticalDynamics(o,from){
  o.preparedness=from?from.preparedness*0.85:0.3;o.crisisMemory=from?from.crisisMemory*0.8:0.25;
  o.frontierIntel=from?from.frontierIntel*0.8:0.25;o.raidSkill=from?from.raidSkill*0.7:0.1;
  o.conquestLoad=0;o.recentShare=0;o.responseDays=0;o.supplyBurden=0;o.corridor=0;o.borderLoad=0;o.cityCount=0;
  o.lastConflict=S.year;o.lastBorderChange=S.year;o.peaceYears=0;o.trainingPaid=0;o.auxiliaries=0;
  o.compacts=[];o.raidTargets=new Map();o.clanTerms=new Map();o.clanPops=new Map();o.lastClanExit=-1e9;
  initFrontierPolity(o,from);
  initDevelopmentPolity(o,from);
  if(S.urban[o.capital]>2000&&!S.cityHome[o.capital])S.cityHome[o.capital]=o.id;
}
function conquestRecorded(o,j,previous){
  const s=S;if(previous===o.id)return;
  if(previous&&s.urban[j]>2000&&!s.cityHome[j])s.cityHome[j]=previous;
  o.conquestLoad=clamp((o.conquestLoad||0)+s.pop[j]/Math.max(1000,o.pop)*0.6+(s.cityHome[j]&&s.cityHome[j]!==o.id?0.05:0),0,3);
  o.lastBorderChange=s.year;
  s.taken[j]=s.year;s.returnDist[j]=65535;s.supplyDist[j]=65535;
  if(previous&&s.pols[previous])s.pols[previous].lastBorderChange=s.year;
}
function crisisEncounter(o,target,won,severity){
  if(!o)return;const s=S,survival=clamp(1-severity,0,1);
  o.lastConflict=s.year;s.martialPractice[o.capital]+=Math.max(0.1,severity*20);o.crisisMemory=clamp(o.crisisMemory+0.035*survival,0,1);o.frontierIntel=clamp(o.frontierIntel+0.04*survival,0,1);
  if(o.kind==='horde')o.raidSkill=clamp(o.raidSkill+(won?0.025:0.012)*survival-severity*0.15,0,1);
  if(target){let t=o.raidTargets.get(target.id);if(!t){t={knowledge:0,failures:0,last:s.year};o.raidTargets.set(target.id,t)}
    t.knowledge=clamp(t.knowledge+0.07*survival,0,1);t.failures=won?Math.max(0,t.failures-1):Math.min(8,t.failures+1);t.last=s.year;
    if(o.raidTargets.size>16)o.raidTargets.delete(o.raidTargets.keys().next().value);
  }
}
function strategicStep(o,c,y){
  const s=S,records=recordSkill(c),schools=skill(c,'school'),continuity=clamp(records*0.35+schools*o.bureau*0.4+o.succession*0.25,0,1);
  const trainingDue=(o.army*0.08+o.pop*0.001)*(0.25+0.75*o.ruler.comp),paid=budgetPay(o,trainingDue);
  o.trainingPaid=trainingDue>0?paid/trainingDue:0;
  const target=clamp(0.15+o.trainingPaid*0.35+o.bureau*0.2+continuity*0.2+(y-o.lastConflict<12?0.1:0)-o.hunger*0.3,0,1);
  o.preparedness=clamp(o.preparedness+0.025*(target-o.preparedness),0,1);
  o.crisisMemory=clamp(o.crisisMemory*(1-0.012*(1-continuity))+0.003*continuity*o.trainingPaid,0,1);
  o.frontierIntel=clamp(o.frontierIntel*0.986+0.009*o.trainingPaid*(0.4+0.6*o.preparedness),0,1);
  o.raidSkill=clamp(o.raidSkill*(1-0.004*(1-o.trainingPaid*0.7)),0,1);
  for(const [id,t] of o.raidTargets){t.knowledge*=0.99;if(y-t.last>100)o.raidTargets.delete(id)}
  o.peaceYears=Math.max(0,y-Math.max(o.lastConflict,o.lastBorderChange));
  o.conquestLoad=clamp(o.conquestLoad*(1-0.006-0.012*o.bureau*o.trust*o.payroll),0,3);
  compactStep(o);
  if(o.kind==='horde')confederationStep(o);
  // Landed intermediaries can consolidate local power during effective defense.
  // Rights and rents give them a stake, while salaried alternatives constrain it.
  const localTarget=clamp(0.3+o.ineq*0.45+o.rights*0.15-o.bureau*0.25,0.15,0.9);
  o.nobles=clamp(o.nobles+0.0015*(localTarget-o.nobles),0.1,0.95);
}
function successionExposure(o,oldRuler){
  const personal=clamp(oldRuler.conq/Math.max(3,o.cells),0,1)*(0.4+0.6*oldRuler.char);
  const unresolved=clamp(o.conquestLoad*0.2+o.recentShare*0.55+personal*0.4,0,1);
  let risk=unresolved*(1-0.75*o.succession)*(1-0.45*o.bureau)*(1-0.35*o.trust);
  if(o.kind==='horde'){
    let n=0,loyal=0;for(const t of o.clanTerms.values()){loyal+=t.loyalty;n++}
    risk+=0.3*(1-(n?loyal/n:o.coalition))*(1-0.7*o.succession)+0.24*o.coalitionFatigue*(1-0.8*o.patronage);
  }
  return clamp(risk,0,0.85);
}
function localPolitics(i,o){
  const s=S,p=s.pop[i],city=clamp(s.urban[i]/Math.max(1000,p)*6,0,1);
  s.cityIdentity[i]=clamp(s.cityIdentity[i]+0.025*(city*s.organisation[i]-s.cityIdentity[i]),0,1);
  if(!o){s.eliteLoyalty[i]*=0.98;return}
  if(city>0.2&&!s.cityHome[i])s.cityHome[i]=o.id;
  const security=clamp(o.health*(0.4+0.6*o.payroll)-o.hunger,0,1);
  const property=clamp(0.2+0.5*o.rights+0.3*security,0,1);
  s.eliteStake[i]=clamp(s.eliteStake[i]+0.025*(property*s.farm[i]-s.eliteStake[i]),0,1);
  const civic=s.cityHome[i]&&s.cityHome[i]!==o.id?(1-s.integ[i])*s.cityIdentity[i]*0.35:0;
  const loyalty=clamp(0.15+0.4*security+0.25*o.rights+0.25*s.eliteStake[i]-0.2*o.central-civic,0,1);
  s.eliteLoyalty[i]=clamp(s.eliteLoyalty[i]+0.06*(loyalty-s.eliteLoyalty[i]),0,1);
  if(s.cityHome[i]!==o.id&&s.integ[i]>0.85&&o.trust>0.65&&s.year-s.taken[i]>150&&s.r()<0.01)s.cityHome[i]=o.id;
  if(WD.coast[i]&&WD.coastalCrop[i]>0.15&&s.farm[i]>0.3){
    const market=waterTransport(i)*clamp(s.node[i]+(o.cityPop||0)/Math.max(1,o.pop),0,1),due=p*0.006*market;
    const paid=budgetPay(o,Math.min(due,o.grain*0.04));
    s.orchards[i]=clamp(s.orchards[i]+0.035*(due>0?paid/due:0)*market*(1-s.orchards[i])-0.025*(1-o.payroll)*s.orchards[i],0,1);
  }
}
function eliteDefectionChance(attacker,j){
  const s=S,d=s.pol[j]?s.pols[s.pol[j]]:null;if(!d||d===attacker)return 0;
  const incumbent=s.eliteLoyalty[j]*0.45+s.eliteStake[j]*d.rights*0.25+d.health*d.payroll*0.3;
  const credible=attacker.rights*(0.3+0.7*attacker.health)*(0.4+0.6*attacker.payroll);
  const offer=0.15+credible*0.45+attacker.ruler.comp*0.15+Math.max(0,0.5-d.mandate)*0.3-ethDist(attacker.core,s.eth[j])*0.08;
  const crisis=clamp((1-d.health)*0.5+(1-d.payroll)*0.3+(1-d.mandate)*0.2,0,1);
  return clamp((offer-incumbent-0.12)*crisis*(0.2+0.8*s.autonomy[j]),0,0.35);
}
function switchEliteAllegiance(attacker,j){
  const s=S,old=s.pol[j],d=s.pols[old];if(!d||old===attacker.id)return false;
  conquestRecorded(attacker,j,old);const contingent=Math.min(d.army,d.army*s.pop[j]/Math.max(1,d.pop)*0.35);
  d.army-=contingent;attacker.army+=contingent;s.pol[j]=attacker.id;s.taken[j]=s.year;s.integ[j]=0.3;
  s.autonomy[j]=Math.max(0.8,s.autonomy[j]);s.eliteLoyalty[j]=0.6;attacker.nobles=Math.min(0.95,attacker.nobles+0.025);d.shock+=0.08;
  s.dist[j]=65535;s.returnDist[j]=65535;s.supplyDist[j]=65535;s.societyCounters.eliteDefections++;
  chron('diplomacy',`Local landholders accept the protection of the ${attacker.full}, retaining their estates and local authority.`,j,[R_(attacker),R_(d)]);return true;
}
function nomadOpportunity(i){
  const s=S,w=WD;let prize=0,threat=0;
  ring(i,3,j=>{const id=s.pol[j],o=id?s.pols[id]:null;if(o&&o.kind==='state'){prize=Math.max(prize,clamp(o.pop/300000,0,1));threat=Math.max(threat,o.enemies.size?0.5:0.2)}});
  return clamp(0.15+prize*0.6+threat+(s.frontierAlarm?s.frontierAlarm[i]*0.7:0)+Math.max(0,s.anom[i])*0.25+s.raiding[i]*0.35,0.1,1.5);
}
function settledStateHabitat(i){
  const s=S,w=WD;return !(w.rangeExposure[i]>0.4&&frontierRisk(i)>0.18)||s.urban[i]>10000&&s.farm[i]*farmSuit(i)>0.12&&(w.rv[i]>0.35||s.node[i]>0.7)&&frontierRisk(i)<0.5;
}
function confederationStep(o){
  const s=S;if(s.year%5!==0)return;
  let total=0;for(const p of o.clanPops.values())total+=p;
  const cells=s.realmCells.get(o.id)||polCells(o.id);let reward=0;
  for(const i of cells)if(s.pol[i]===o.id){const paid=budgetAt(o,i,Math.min(publicAvailable(o,i)*0.12,s.pop[i]*0.012));s.food[i]+=paid;reward+=paid}
  const fair=clamp(reward/Math.max(1,total*0.012),0,1);
  const generations=clamp((s.year-o.born-25)/60,0,2),bargains=(1-o.succession*0.65)*(1-o.trust*0.25);
  const fatigue=clamp(generations*bargains*(1-o.patronage*0.85)*(1-0.3*o.momentum)+o.strain*0.3,0,1);
  o.coalitionFatigue=clamp(o.coalitionFatigue+0.25*(fatigue-o.coalitionFatigue),0,1);
  let external=0;for(const [id] of o.nb){const p=s.pols[id];if(p&&p.alive&&p.kind==='state')external=Math.max(external,clamp(power(p)/Math.max(1,power(o)),0,1))}
  let departing=-1,worst=1;
  for(const [clan,p] of o.clanPops){
    let t=o.clanTerms.get(clan);if(!t){t={loyalty:0.6,joined:s.year};o.clanTerms.set(clan,t)}
    const target=clamp(0.1+0.22*o.ruler.char+0.24*fair+0.15*external+0.16*o.succession+0.15*o.trust+0.14*(o.momentum||0)+0.18*(o.sharedThreat||0)-0.35*o.hunger-0.18*o.strain-0.35*o.coalitionFatigue+o.patronage*0.12,0,1);
    t.loyalty=clamp(t.loyalty+0.12*(target-t.loyalty)-0.06*o.shock,0,1);
    if(t.loyalty<worst&&p>2000){worst=t.loyalty;departing=clan}
  }
  for(const clan of o.clanTerms.keys())if(!o.clanPops.has(clan))o.clanTerms.delete(clan);
  let loyal=0,weight=0;for(const [clan,t] of o.clanTerms){const n=o.clanPops.get(clan)||1;loyal+=n*t.loyalty;weight+=n}
  o.clanCohesion=clamp((weight?loyal/weight:0.3)*(1-o.coalitionFatigue*0.35),0,1);
  o.coalition=clamp(o.coalition*0.45+o.clanCohesion*0.55,0,1);
  if(departing>=0&&worst<0.32&&o.cells>=4&&s.year-o.lastClanExit>12&&s.r()<0.25)releaseClan(o,departing);
  o.breakupRisk=confederationBreakupRisk(o,fair);
  if(s.r()<o.breakupRisk)dissolveConfederation(o);
}
function releaseClan(o,clan){
  const s=S,cells=(s.realmCells.get(o.id)||polCells(o.id)).filter(i=>s.pol[i]===o.id&&s.clan[i]===clan&&i!==o.capital);if(!cells.length)return false;
  const pop=cells.reduce((n,i)=>n+s.pop[i],0);let child=null;
  if(pop>5000&&cells.length>1){const id=newPolity(cells[0],o,{kind:'horde',origin:{type:'rebellion',from:o.id,why:'Member clans reject the distribution of protection and rewards.'}});child=s.pols[id];for(const i of cells)s.pol[i]=id;partitionInstitutions(o,[child])}
  else for(const i of cells)s.pol[i]=0;
  o.lastClanExit=s.year;o.clanTerms.delete(clan);s.societyCounters.clanDepartures++;
  chron('fall',`Member clans leave the ${o.full} after protection and promised rewards fail.`,cells[0],[R_(o),...(child?[R_(child)]:[])]);return true;
}
function raidAttraction(o,i,j){
  const s=S,t=s.pol[j]?s.pols[s.pol[j]]:null,known=t?o.raidTargets.get(t.id):null;
  const value=clamp(s.food[j]/Math.max(500,s.pop[j]*0.3),0.1,2),resistance=fieldDefense(j,false)/Math.max(1,power(o));
  return value*(1+(known?known.knowledge*0.3:0))/(1+borderBarrier(i,j)+resistance*0.6+(known?known.failures*0.5:0));
}
function chooseMigrationVector(o){
  const path=migrationRoute(o,o.capital,Math.max(100,o.pop*0.045));o.plannedRoute=path;
  if(path.length){const first=path[0];return [dxWrap(o.capital,first),WD.cyA[first]-WD.cyA[o.capital]]}
  const angle=S.r()*Math.PI*2;return [Math.cos(angle),Math.sin(angle)];
}
function admissionChance(M,j,o){
  const s=S,room=Math.max(0,s.K[j]*0.95-s.pop[j]),need=M.pop*0.25;
  if(!o||o.kind!=='state'||o.health<0.35||room<M.pop*0.3||o.grain<need)return 0;
  const affinity=1-ethDist(M.eth,s.eth[j]);
  return clamp(0.1+0.3*o.rights+0.2*o.trust+0.15*affinity+0.15*(1-o.press)-0.2*M.pop/Math.max(1,s.pop[j]),0,0.8);
}
function admitMigration(M,j,o){
  const grant=M.pop*0.25;if(o.grain<grant)return false;
  M.food+=budgetPay(o,grant);M.peaceful=true;M.admission={host:o.id,cell:j,promised:M.pop*0.045};return true;
}
function compactStep(o){
  const s=S;o.auxiliaries=0;
  for(const t of o.compacts){
    if(t.durable){settlementAgreementStep(o,t);continue}
    if(t.done)continue;if(s.pol[t.cell]!==o.id){t.done=true;continue}
    const n=Math.min(t.people,s.pop[t.cell]*0.6),due=t.promised,paid=budgetPay(o,due);s.food[t.cell]+=paid;
    const fulfillment=due>0?paid/due:1;t.loyalty=clamp(t.loyalty+0.04*(fulfillment-t.loyalty)-0.02*(1-s.nutrition[t.cell]),0,1);
    o.auxiliaries+=n*0.025*t.loyalty;
    if(fulfillment<0.4){t.failures++;s.unrest[t.cell]=clamp(s.unrest[t.cell]+0.025,0,1)}else t.failures=Math.max(0,t.failures-1);
    if(t.failures>=3&&t.loyalty<0.45&&!t.broken){t.broken=true;s.societyCounters.brokenCompacts++;o.shock+=0.15;
      chron('migration',`Settlers in the ${o.full} protest broken promises of provisions and protection.`,t.cell,[R_(o),RE(s.eths[t.eth])]);
    }
    if(t.broken&&t.loyalty<0.2&&n>=1000&&s.activeMigs.length<20){
      const p=s.pop[t.cell],take=Math.min(n*0.6,p*0.3),share=take/Math.max(1,p),food=s.food[t.cell]*share,young=s.young[t.cell]*share,animals=takeHerd(t.cell,share);
      s.pop[t.cell]-=take;s.food[t.cell]-=food;s.young[t.cell]-=young;
      const angle=s.r()*Math.PI*2;startMigration({eth:t.eth,pop:take,food,young,animals,cell:t.cell,dx:Math.cos(angle),dy:Math.sin(angle),kind:'warband',cause:'broken compact'});t.done=true;
    }
    if(s.year-t.since>=25)t.done=true;
  }
  o.compacts=o.compacts.filter(t=>!t.done);
}
function leagueDiplomacy(o,p){
  const s=S;if(o.kind!=='state'||p.kind!=='state'||o.cells>6||p.cells>6||p.over||o.over||o.enemies.size||p.enemies.size)return;
  if(o.rights<0.35||o.trust<0.5||p.trust<0.5||!o.allies.includes(p.id))return;
  const stronger=power(o)>=power(p)?o:p,weaker=stronger===o?p:o;
  if(s.r()<0.008*P.allyRate){weaker.over=stronger.id;weaker.overY=s.year;stronger.tribs++;weaker.league=true;s.societyCounters.leagues++;
    chron('diplomacy',`The ${weaker.full} joins a league led by the ${stronger.full}, keeping its own council and laws.`,weaker.capital,[R_(weaker),R_(stronger)]);
  }
}
function scaleMigration(M,factor){M.pop*=factor;M.young*=factor;for(const g of M.groups)g.pop*=factor}
function turnMigration(M){M.route=[];const angle=(S.r()<0.5?-1:1)*(0.8+S.r()*0.8),x=M.dx,y=M.dy;M.dx=x*Math.cos(angle)-y*Math.sin(angle);M.dy=x*Math.sin(angle)+y*Math.cos(angle)}
function recruitMigration(M,j){
  const s=S,id=s.pol[j];if(M.kind==='people'||M.steps%5||s.pop[j]<2000||id&&id!==M.pol)return;
  if(s.r()>0.12+0.18*M.experience)return;
  const n=Math.min(M.pop*0.08,s.pop[j]*0.06),share=n/s.pop[j],food=s.food[j]*share,young=s.young[j]*share;
  addHerd(M.animals,takeHerd(j,share));s.pop[j]-=n;s.food[j]-=food;s.young[j]-=young;M.pop+=n;M.food+=food;M.young+=young;
  let group=M.groups.find(g=>g.eth===s.eth[j]&&g.ancestry===s.ancestry[j]);if(!group){group={eth:s.eth[j],ancestry:s.ancestry[j],pop:0};M.groups.push(group)}group.pop+=n;
}
function depositMigrationGroups(i,M,n,old){
  const s=S;let before=old;
  for(const g of M.groups){const amount=n*g.pop/Math.max(1,M.pop);if(amount<=0)continue;
    if(before<1){s.eth[i]=g.eth;s.eth2[i]=-1;s.mix[i]=0;s.ancestry[i]=g.ancestry;s.ancestry2[i]=-1;s.ancestryMix[i]=0}
    else{mergeCulture(i,g.eth,amount,before);mergeAncestry(i,g.ancestry,amount,before)}before+=amount;
  }
}

/* Crop access and local adaptation are separate from general farming knowledge.
   These broad packages describe subsistence systems, not ethnic abilities. */
const CROPS=[
  {k:'temperate',n:'Wheat and barley',lo:5,hi:27,rain:420,store:0.95},
  {k:'millet',n:'Millet and sorghum',lo:16,hi:34,rain:330,store:0.9},
  {k:'rice',n:'Rice',lo:15,hi:32,rain:1050,store:0.95},
  {k:'maize',n:'Maize and beans',lo:10,hi:31,rain:580,store:0.85},
  {k:'roots',n:'Tropical roots and gardens',lo:19,hi:34,rain:1100,store:0.35},
  {k:'highland',n:'Highland tubers and quinoa',lo:1,hi:21,rain:430,store:0.65}
];
function cropIndex(h){
  const name=h.crop||'';
  if(/potato|quinoa/.test(name))return 5;if(/taro|yam|banana/.test(name))return 4;
  if(/maize|sunflower|squash/.test(name))return 3;if(/rice/.test(name))return 2;
  if(/sorghum|millet/.test(name))return 1;return 0;
}
function prepareAgroEcology(w){
  if(w.cropSuit)return;
  w.cropSuit=CROPS.map(()=>new Float32Array(N));w.valleyShare=new Float32Array(N);
  w.waterPotential=new Float32Array(N);w.rangeExposure=new Float32Array(N);
  for(const i of w.landIdx){
    const t=w.T[i],rain=w.Pr[i],r=w.rough[i],e=w.elev[i],river=w.rv[i];
    const valley=clamp(0.04+river*0.32+r*0.09*(rain>120?1:0),0.02,0.5);
    w.valleyShare[i]=valley;
    // Local runoff and snow-fed catchments can matter without a major channel.
    w.waterPotential[i]=clamp(river+0.35*r*clamp((rain-100)/500,0,1)+0.12*clamp((rain-250)/500,0,1),0,1);
    const canopy=clamp((rain-500)/750,0,1)*clamp((t+4)/12,0,1);
    w.rangeExposure[i]=clamp((1-canopy*0.9)*(1-r*0.8)*clamp((rain-110)/250,0,1)*clamp((1800-rain)/700,0,1),0,1);
    let best=0;
    for(let k=0;k<CROPS.length;k++){
      const c=CROPS[k],warm=k===0?t+w.amp[i]*0.23:t+w.amp[i]*0.12;
      const thermal=clamp((warm-c.lo+3)/7,0,1)*clamp((c.hi-warm+3)/7,0,1);
      const growing=k===5?clamp((t+1)/6,0,1):clamp(((w.gs?w.gs[i]:6)-2.4)/3,0,1);
      const moisture=clamp((rain-90)/(c.rain-90),0,1);
      const altitude=clamp(1-Math.max(0,e-(k===5?4300:3300))/1700,0,1);
      const ground=(1-r*0.68)*(1-valley)+valley;
      const leach=(w.leach?w.leach[i]:0)*(k===4?0.2:0.6);
      w.cropSuit[k][i]=thermal*growing*altitude*ground*(0.12+0.88*moisture)*(1-leach);
      best=Math.max(best,w.cropSuit[k][i]);
    }
    // Potential is used for hearth placement. Actual yields require local crops.
    w.sF[i]=Math.max(w.sF[i]*0.55,best);
    w.nomad[i]=w.rangeExposure[i]>0.4&&w.sH[i]>0.32?1:0;
  }
}
function initEcology(){
  const s=S,w=WD;prepareAgroEcology(w);
  s.cropAccess=CROPS.map(()=>new Float32Array(N));s.cropAdapt=CROPS.map(()=>new Float32Array(N));
  for(const k of ['terraces','waterworks','workshops','recordPractice','craftPractice','chemicalPractice','firearms','raidDamage','frontierDanger','defensePact','maleShare'])s[k]=new Float32Array(N);
  s.maleShare.fill(0.49);s.threatFrom=new Int32Array(N).fill(-1);s.depot=new Float64Array(N);
  s.reprisals=new Int32Array(N).fill(-100000);s.frontierContacts=new Int32Array(N).fill(-100000);
  s.wallHealth=new Float32Array(N).fill(1);s.wallBreach=new Float32Array(N);s.breachBy=new Int32Array(N);
  s.publicShipments=[];s.militaryContracts=[];s.migrationPressure=new Float32Array(N);
  Object.assign(s.societyCounters,{cropInvestment:0,freight:0,raidsBeyondBorder:0,devastations:0,shatteredStates:0,clanAccessions:0,opportunistCampaigns:0,reprisals:0,selectiveDeaths:0,forcedResettlers:0,wallBreaches:0,protectionTreaties:0,protectionPaid:0,brokenProtection:0,conquestDynasties:0,militaryContracts:0,returnedVeterans:0,migrationAccessions:0,migrationRetreats:0,migrantBreaches:0});
  for(const h of s.hearths)if(h.kind==='farm')h.cropIndex=h.crop?cropIndex(h):bestCrop(h.cell);
  initEpidemics();initConnections();initPeoples();initUrbanism();initCivic();
}
function bestCrop(i){let best=0;for(let k=1;k<CROPS.length;k++)if(WD.cropSuit[k][i]>WD.cropSuit[best][i])best=k;return best}
function seedCrop(i,k,value=1){
  S.cropAccess[k][i]=Math.max(S.cropAccess[k][i],value);S.cropAdapt[k][i]=Math.max(S.cropAdapt[k][i],0.25*value);
}
function seedLocalCrops(i){seedCrop(i,bestCrop(i))}
function transferCrops(i,j,factor=0.8){
  for(let k=0;k<CROPS.length;k++)if(S.cropAccess[k][i]>0.05){S.cropAccess[k][j]=Math.max(S.cropAccess[k][j],S.cropAccess[k][i]*factor);S.cropAdapt[k][j]=Math.max(S.cropAdapt[k][j],S.cropAdapt[k][i]*factor*0.6)}
}
function cropSuitability(k,i){
  const s=S,w=WD,r=w.rough[i],water=w.waterPotential[i];
  const irrigation=Math.max(s.irrig[i]*w.rv[i],s.waterworks[i]*water);
  const moistureRecovery=clamp((CROPS[k].rain-w.Pr[i])/CROPS[k].rain,0,0.85)*irrigation;
  const thermal=clamp((w.T[i]-CROPS[k].lo+6)/8,0,1)*clamp((CROPS[k].hi-w.T[i]+5)/8,0,1);
  return clamp((w.cropSuit[k][i]+thermal*moistureRecovery*0.65)*(1+0.9*s.terraces[i]*r),0,1);
}
function cropSystem(i){
  let value=0,kind=-1;for(let k=0;k<CROPS.length;k++){
    const v=S.cropAccess[k][i]*cropSuitability(k,i)*(0.35+0.65*S.cropAdapt[k][i]);
    if(v>value){value=v;kind=k}
  }return {value,kind};
}
function farmSuit(i){return S.cropAccess?cropSystem(i).value:WD.sF[i]}
function foodStorability(i){const c=cropSystem(i);return c.kind<0?0.2:CROPS[c.kind].store+(1-CROPS[c.kind].store)*skill(i,'storage')*0.55}
function pastureCondition(i){
  const w=WD,s=S,season=w.rainSeasonality&&Number.isFinite(w.rainSeasonality[i])?Math.max(0,w.rainSeasonality[i]):0.3;
  const winter=clamp((w.amp[i]-18)/24,0,1)*clamp((0.85-s.wm[i])/0.65,0,1);
  return clamp(s.wm[i]*(1-season*0.18)-winter*0.5,0.1,1.45);
}
function agroPass(){
  const s=S,w=WD;
  for(const i of w.landIdx){
    s.raidDamage[i]*=0.94;s.defensePact[i]*=0.995;s.migrationPressure[i]*=0.8;
    // Aggregate sex composition converges through cohort maturation, not an
    // instantaneous reset after selective wartime mortality.
    s.maleShare[i]+=0.018*(0.49-s.maleShare[i]);
    if(s.pop[i]<100)continue;
    const p=s.pop[i],org=s.organisation[i],surplus=clamp(s.food[i]/p-0.12,0,0.6);
    const work=Math.min(s.food[i]*0.03,p*0.012*surplus)*(0.3+0.7*org);
    s.food[i]-=work;s.societyCounters.cropInvestment+=work;
    const effort=work/p,need=clamp(p/Math.max(1,s.K[i]),0,1.5);
    s.terraces[i]=clamp(s.terraces[i]*(1-0.002*(1-org))+effort*1.6*w.rough[i]*need,0,1);
    s.waterworks[i]=clamp(s.waterworks[i]*(1-0.003*(1-org))+effort*1.8*w.waterPotential[i]*need,0,1);
    const urban=clamp(s.urban[i]/p,0,0.4),market=clamp(s.node[i]+s.flow[i]/p,0,1);
    s.workshops[i]=clamp(s.workshops[i]*0.998+effort*(0.1+urban*4+market),0,1);
    s.craftPractice[i]+=s.workshops[i]*s.nutrition[i]*(0.2+0.8*s.metal[i])*(1-0.6*clamp(s.sickness[i],0,1));
    s.recordPractice[i]+=recordSkill(i)*(0.15+urban*2+market*0.3)*s.nutrition[i];
    if(s.paper[i]>0.5&&s.iron[i]>0.5)s.chemicalPractice[i]+=s.workshops[i]*s.paper[i]*s.nutrition[i];
    if(s.gun[i]>0.7){const due=Math.min(s.food[i]*0.01,p*0.002*s.workshops[i]);s.food[i]-=due;s.firearms[i]+=due*0.05*s.gun[i]}
    s.firearms[i]*=0.975;
    if(s.year%5===0)for(let k=0;k<CROPS.length;k++){
      const present=s.cropAccess[k][i];if(present>0.01)s.cropAdapt[k][i]=clamp(s.cropAdapt[k][i]+0.025*present*cropSuitability(k,i)*(0.3+org),0,1);
    }
  }
  if(s.year%5!==0)return;
  const delta=CROPS.map(()=>new Float32Array(N));
  const share=(i,j,contact)=>{
    if(s.pop[j]<100||s.farm[j]<0.1||s.food[j]<s.pop[j]*0.02)return;
    for(let k=0;k<CROPS.length;k++){
      const gap=s.cropAccess[k][i]-s.cropAccess[k][j];if(gap<=0.02||s.cropAccess[k][i]<0.1)continue;
      delta[k][j]=Math.max(delta[k][j],gap*contact*(0.2+0.8*cropSuitability(k,j)));
    }
  };
  for(const i of w.landIdx)if(s.pop[i]>=100)for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j])share(i,j,0.10+0.12*Math.min(s.node[i],s.node[j]))}
  for(const e of s.tradeEdges){const a=s.pol[e.a]?s.pols[s.pol[e.a]]:null,b=s.pol[e.b]?s.pols[s.pol[e.b]]:null;if(a&&b&&a.enemies.has(b.id))continue;share(e.a,e.b,0.3);share(e.b,e.a,0.3)}
  for(const i of w.landIdx){let effort=0;for(let k=0;k<CROPS.length;k++)effort+=delta[k][i];
    const cost=Math.min(s.food[i],s.pop[i]*effort*0.008),funded=effort>0?cost/Math.max(1e-9,s.pop[i]*effort*0.008):0;s.food[i]-=cost;
    for(let k=0;k<CROPS.length;k++)s.cropAccess[k][i]=clamp(s.cropAccess[k][i]+delta[k][i]*funded,0,1);
  }
}
function technicalReadiness(o,k,c=o.capital){
  const s=S,t=TECH[k],p=s.recordPractice[c],craft=s.craftPractice[c];
  if(t.k==='writing')return Math.min(1,p/100,Math.max(0,(s.urban[c]-1200)/4000));
  if(t.k==='wheel')return Math.min(1,craft/35,s.traction[c]+s.pack[c]);
  if(t.k==='iron')return Math.min(1,craft/120);
  if(t.k==='paper')return Math.min(1,craft/400,p/600);
  if(t.k==='gun')return Math.min(1,s.chemicalPractice[c]/500,craft/1300,p/1400);
  if(t.k==='caval')return Math.min(1,craft/180,s.mounts[c]);
  if(t.k==='ocean')return Math.min(1,craft/750,s.sail[c]*s.nav[c]);
  if(['office','school','census','canal'].includes(t.k))return Math.min(1,p/(t.k==='school'?180:60));
  return clamp(0.1+s.workshops[c]*2+craft/70,0,1);
}
function inventionPass(o){
  if(o.kind!=='state')return;
  const s=S,sites=new Set([o.capital,...(s.realmCells.get(o.id)||[])]);o.researchFunded=0;o.researchCities=0;
  for(const c of sites){if(s.pol[c]!==o.id||s.urban[c]<800||s.nutrition[c]<0.75||s.cityDamage[c]>0.6)continue;
    const eligible=[],connections=researchConnections(c,o);
    for(let k=6;k<TECH.length;k++){
      const t=TECH[k],em=t.em;if(!em||s.tk[k][c]>=0.5||connections<em.pop*0.06||(em.coast&&!WD.coast[c])||(em.horse&&s.mounts[c]<0.5)||(em.heavy&&WD.heavy[c]<0.3))continue;
      if(t.pre.some(p=>s.tk[p][c]<0.7)||technicalReadiness(o,k,c)<0.999)continue;
      eligible.push(k);
    }
    if(!eligible.length)continue;
    const due=Math.min(publicAvailable(o,c)*0.015,s.pop[c]*0.0015,s.urban[c]*0.012*s.nutrition[c]);
    const paid=civicSpend(c,o,due),specialists=paid*(0.2+s.workshops[c])*(0.3+0.7*o.cult)*innovationEfficiency(c,o);
    if(specialists<=0)continue;o.researchFunded+=paid;o.researchCities++;s.societyCounters.urbanResearch+=paid;
    let projects=s.cityProjects.get(c);if(!projects)s.cityProjects.set(c,projects=new Float64Array(TECH.length));
    for(const k of eligible){const t=TECH[k],em=t.em,need=1/em.b;
      const gain=P.invent*specialists/eligible.length*(0.5+techFit(o,k))*researchExperience(c,t.k)/Math.max(1,Math.sqrt(em.pop/10000));
      projects[k]+=gain;o.inventionProgress[k]+=gain;
      if(projects[k]>=need){seedTech(s.tk[k],c,1,1);firstTech(k,c,o);projects[k]=0;o.inventionProgress[k]=0}
    }
  }
}
function researchConnections(i,o){
  const s=S;let people=s.pop[i]+Math.max(0,o.pop-s.pop[i])*transportAccess(i,o)*0.12;
  for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j<0)continue;const p=s.pol[j]?s.pols[s.pol[j]]:null;
    if(!p||!p.enemies.has(o.id))people+=s.pop[j]*(0.05+0.15*Math.min(s.node[i],s.node[j]));
  }return people;
}
function innovationEfficiency(i,o){
  const s=S,p=Math.max(1,s.pop[i]),urban=Math.min(p,s.urban[i]);
  const concentration=clamp(urban/p*5,0,1)*clamp(Math.log1p(urban/800)/Math.log(21),0,1);
  const contact=0.45+0.35*s.node[i]+0.2*s.urbanNetwork[i];
  return (1+0.5*concentration)*contact*s.nutrition[i]*s.nutrition[i]*(1-0.75*s.sickness[i])*(0.4+0.6*o.health);
}
function researchExperience(i,k){
  const s=S;let practice=s.craftPractice[i];
  if(['writing','paper','law','records','census','office','school','succession','charter','ledger'].includes(k))practice=s.recordPractice[i];
  else if(['roads','canal','storage','saltflush'].includes(k))practice=s.engineeringPractice[i];
  else if(['caval','gun'].includes(k))practice=s.martialPractice[i]+s.craftPractice[i]*0.5;
  else if(['coin','nav','ocean'].includes(k))practice=s.commercialPractice[i]*10+s.craftPractice[i]*0.25;
  return 0.75+0.5*clamp(Math.log1p(practice)/9,0,1);
}

/* Regional provisioning, exposed frontiers and choices in conquest. */
function initFrontierPolity(o,from){
  o.momentum=from?(from.momentum||0)*0.5:0;o.inventionProgress=new Float32Array(TECH.length);
  o.warLaw=from?from.warLaw:(S.r()<0.22?'Expulsion permitted':'Negotiated incorporation');
  o.collectiveReprisals=from?from.collectiveReprisals:S.r()<0.08;
  o.lastAccession=-100000;o.lastOpportunism=-100000;o.occupationLosses=0;o.localStores=0;
  o.raidHistory=new Map();o.protectionPacts=[];o.installTarget=0;o.installUntil=-100000;
  o.blockadePressure=0;o.lastMigration=-100000;o.patronage=0;o.coalitionFatigue=0;o.clanCohesion=0.6;
  o.loanedTroops=0;o.foreignFree=0;o.campaignAuxShare=0;o.sharedThreat=0;o.threatMemory=new Map();o.knownPorts=new Set();o.creditTrust=0.7;o.creditDefault=-100000;
}
function publicAvailable(o,i){return Math.max(0,S.depot[i])+(i===o.capital?Math.max(0,o.grain):0)}
function budgetAt(o,i,due){
  if(S.pol[i]!==o.id)return 0;let left=Math.max(0,due),paid=Math.min(S.depot[i],left);S.depot[i]-=paid;left-=paid;
  if(i===o.capital){const n=budgetPay(o,left);paid+=n}return paid;
}
function depositPublic(o,i,n){if(i===o.capital)o.grain+=n;else S.depot[i]+=n}
function governmentFood(){let n=0;for(const i of WD.landIdx)n+=S.depot[i];for(const t of S.publicShipments)n+=t.food;return n}
function regionalFreight(accounts){
  const s=S,w=WD;
  for(const i of w.landIdx)if(s.depot[i]>0){const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(!o||!o.alive){s.food[i]+=s.depot[i];s.depot[i]=0}
    else if(i===o.capital){o.grain+=s.depot[i];s.depot[i]=0}
  }
  for(const t of s.publicShipments){if(t.created>=s.year)continue;t.years--;
    if(t.years<=0){const o=s.pols[t.to],loss=t.food*0.08;
      if(o&&o.alive&&s.pol[t.dest]===o.id){depositPublic(o,t.dest,t.food-loss);
        const from=s.pols[t.from];if(o.kind==='horde'&&from&&from.kind==='state')o.patronage=clamp(o.patronage+(t.food-loss)/Math.max(1,o.pop*0.03),0,1);
      }else s.food[t.dest]+=t.food-loss;
      accounts.transportLoss+=loss;t.food=0;
    }
  }
  s.publicShipments=s.publicShipments.filter(t=>t.food>0);
  for(const e of s.tradeEdges){e.freightUsed=0;e.privateUsed=0}
  // Four staged consignments per year. Each stage uses pre-transfer stocks;
  // public and private freight compete for the same edge's annual capacity.
  for(let season=0;season<4;season++){
    const available=new Float64Array(N),delta=new Float64Array(N);
    for(const i of w.landIdx){const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o)available[i]=publicAvailable(o,i)}
    for(const e of s.tradeEdges){
      const id=s.pol[e.a];if(!id||s.pol[e.b]!==id)continue;const o=s.pols[id];
      if(e.via&&e.via.some(i=>s.pol[i]!==id))continue;
      const target=i=>i===o.capital?Math.max(s.pop[i]*0.06,o.pop*0.025):s.pop[i]*0.045;
      const ta=Math.max(1,target(e.a)),tb=Math.max(1,target(e.b));
      const a=available[e.a]/ta>available[e.b]/tb?e.a:e.b,b=a===e.a?e.b:e.a;
      const excess=Math.max(0,available[a]-target(a)),need=Math.max(0,target(b)-available[b]);
      const cap=Math.max(0,e.capacity*0.45-(e.freightUsed||0));
      const cost=a===e.a?e.cost:(e.reverseCost==null?e.cost:e.reverseCost),loss=clamp(cost+0.03*(1-o.payroll),0.01,0.75);
      const n=Math.min(excess,need/(1-loss),cap*0.5);if(n<=0)continue;
      available[a]-=n;delta[a]-=n;delta[b]+=n*(1-loss);e.freightUsed+=n;
      accounts.transportLoss+=n*loss;s.societyCounters.freight+=n;
    }
    for(const i of w.landIdx)if(delta[i]){const o=s.pols[s.pol[i]];if(delta[i]<0)budgetAt(o,i,-delta[i]);else depositPublic(o,i,delta[i])}
  }
}
function tributeShipment(o,over,amount){
  const paid=budgetPay(o,amount);if(paid<=0)return 0;
  S.publicShipments.push({to:over.id,from:o.id,dest:over.capital,food:paid,created:S.year,years:Math.max(1,Math.ceil(angDist(o.capital,over.capital)/0.15))});return paid;
}
function gunEffect(i){return S.gun[i]*clamp(S.firearms[i]/Math.max(20,S.pop[i]*0.008),0,1)}
function pastoralMobility(i){
  return S.herd[i]*(0.12+0.88*Math.max(S.mounts[i]*S.horse[i],S.mounts[i]*S.camel[i]))*(1-S.forest[i]*0.7)*(1-WD.rough[i]*0.65);
}
function frontierProtection(i,o){
  const local=wallStrength(i)*(0.4+0.6*S.infrastructure[i]);
  if(!o)return clamp(local+S.defensePact[i]*S.organisation[i]*0.2,0,0.7);
  const supply=clamp(publicAvailable(o,i)/Math.max(1,S.pop[i]*0.04),0,1);
  return clamp(local*0.6+o.preparedness*supply*(0.2+0.25*S.mounts[i]+0.35*gunEffect(i))+S.defensePact[i]*0.15,0,0.95);
}
function frontierRisk(i){
  const from=S.threatFrom[i];if(from<0)return 0;const a=S.pol[from],b=S.pol[i],o=b?S.pols[b]:null;
  if(a&&a===b)return 0;if(a&&o&&(o.allies.includes(a)||o.over===a))return 0;
  return clamp(S.frontierDanger[i]*(1-frontierProtection(i,o)),0,1);
}
function frontierField(){
  const s=S,w=WD;s.frontierDanger.fill(0);s.threatFrom.fill(-1);
  for(const i of w.landIdx){if(s.pop[i]<800||s.herd[i]<0.3)continue;
    const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.kind!=='horde')continue;
    const mobility=pastoralMobility(i),herds=clamp(s.animals[3][i]/Math.max(1,s.pop[i]*0.08)+s.animals[4][i]/Math.max(1,s.pop[i]*0.12),0,1);
    const capacity=clamp(s.pop[i]/12000,0,1)*(0.2+0.8*herds)*clamp(pastureCondition(i),0.2,1.2);
    const pressure=1+0.3*Math.max(0,1-s.wm[i]);
    const danger=clamp(mobility*capacity*(0.3+s.organisation[i]+(o?o.raidSkill:0))*pressure,0,1);
    if(danger>0.03){s.frontierDanger[i]=danger;s.threatFrom[i]=i}
  }
  for(let pass=0;pass<4;pass++){
    const next=Float32Array.from(s.frontierDanger),origin=Int32Array.from(s.threatFrom);
    for(const i of w.landIdx)if(s.frontierDanger[i]>0.03)for(let d=0;d<4;d++){
      const j=w.nb[i*4+d];if(j<0||!w.land[j])continue;
      const friction=0.68*(1-0.55*Math.max(w.rough[i],w.rough[j]))*(1-0.45*s.forest[j])*(1-wallStrength(j)*0.8)/(1+crossingRiver(i,j)*0.3);
      const value=s.frontierDanger[i]*friction;if(value>next[j]){next[j]=value;origin[j]=s.threatFrom[i]}
    }
    s.frontierDanger=next;s.threatFrom=origin;
  }
}
function occupationNeed(o,i,j){
  const mobile=pastoralMobility(j),exposed=WD.rangeExposure[j],risk=frontierRisk(j);
  const contested=exposed*(0.4+mobile*3)+risk*4;
  return Math.max(120,S.pop[j]*0.012)*(1+contested+0.5*S.forest[j]+0.4*WD.rough[j])/(0.5+frontierTransport(i,j));
}
function frontierHoldable(o,i,j){
  if(o.kind==='horde')return true;
  const mobile=pastoralMobility(j),range=WD.rangeExposure[j],safe=frontierProtection(i,o);
  return o.occupation>=occupationNeed(o,i,j)&&
    (!((range>0.45&&mobile>0.3)||frontierRisk(j)>0.3)||safe>0.25+0.22*mobile||o.ruler.comp*o.preparedness*S.mounts[i]>0.42);
}
function buildFrontierDefense(i,o){
  if(!o||o.kind!=='state'||frontierRisk(i)<0.08)return;
  const due=S.pop[i]*0.002,paid=budgetAt(o,i,due);if(due<=0)return;
  S.fort[i]=clamp(S.fort[i]+0.015*(paid/due)*(0.7+0.3*S.engineeringKnowledge[i])*o.preparedness*(0.3+S.organisation[i])-0.004*(1-o.payroll),0,1);
}
function warnCommunities(j,attacker){
  const s=S;for(let d=0;d<4;d++){const i=WD.nb[j*4+d];if(i<0||!WD.land[i]||s.pol[i]===attacker.id)continue;
    s.defensePact[i]=clamp(s.defensePact[i]+0.16*s.organisation[i],0,1);s.frontierContacts[i]=s.year;
  }
}
function opportunismScore(o,i,j){
  const s=S;if(o.kind!=='state'||s.pop[j]<1500||s.pol[j]===o.id)return 0;
  const target=s.pol[j]?s.pols[s.pol[j]]:null;
  if(target&&(target.over===o.id||o.allies.includes(target.id)||o.truce.get(target.id)>s.year))return 0;
  if(target&&target.kind==='state'&&target.tier!=='Chiefdom'&&target.tier!=='City-state')return 0;
  const organization=s.organisation[j],developing=clamp((organization-0.15)*2.2,0,1)*(1-0.5*s.defensePact[j]);
  const reward=clamp((s.food[j]+s.depot[j])/Math.max(1,s.pop[j]*0.7),0,1)+clamp(s.urban[j]/8000,0,1)*0.4;
  const advantage=clamp(power(o)/Math.max(1,fieldDefense(j,false))-1,0,3)/3;
  const fiscal=target&&s.year-(target.creditDefault??-100000)<30?0.3*(1-target.health):0;
  const motive=0.2+o.ruler.aggr*0.5+Math.max(0,o.E/etOf(o)-1)*0.12+fiscal;
  return clamp(developing*reward*advantage*motive*(0.3+0.7*o.frontierIntel)/(1+occupationNeed(o,i,j)/Math.max(1,o.occupation)),0,1);
}
function opportunisticCampaign(o,i,j){
  const s=S,score=opportunismScore(o,i,j);if(score<=0||s.year-o.lastOpportunism<8||!frontierHoldable(o,i,j)||publicAvailable(o,i)<200)return false;
  if(s.r()>score*0.035*P.warRate)return false;
  const target=s.pol[j]?s.pols[s.pol[j]]:null;o.lastOpportunism=s.year;s.societyCounters.opportunistCampaigns++;
  warnCommunities(j,o);
  if(target&&!o.enemies.has(target.id))declareWar([o],[target],o.base+' frontier intervention',false);
  chron('war',`${o.full} intervenes against neighboring communities, seeking tribute and control before rival coalitions consolidate.`,j,[R_(o)],'A developing center offers wealth and an opening for an ambitious ruler, but occupation requires provisions and personnel.');
  territorialAttack(o,i,j,false);return true;
}
function recordVictory(o,won,severity){
  if(o.kind!=='horde')return;
  o.momentum=clamp((o.momentum||0)+(won?0.045:-0.09)-severity*0.1,0,1);
}
function incorporateClans(o,p){
  const s=S;if(!p||!p.alive||p.kind!=='horde'||p.id===o.id)return false;
  const cells=polCells(p.id);if(!cells.length)return false;
  const cost=Math.min(o.grain,o.pop*0.008);if(cost<=0)return false;budgetPay(o,cost);endForeignServiceOf(p);
  for(const i of cells){s.pol[i]=o.id;s.integ[i]=Math.max(0.25,s.integ[i]);s.autonomy[i]=Math.max(0.8,s.autonomy[i]);s.dist[i]=s.returnDist[i]=s.supplyDist[i]=65535;
    o.clanTerms.set(s.clan[i],{loyalty:0.55,joined:s.year});
  }
  s.depot[p.capital]+=p.grain;p.grain=0;
  o.army+=p.army*0.75;o.staff+=p.staff*0.5;o.pop+=p.pop;o.cells+=cells.length;
  p.army=p.staff=0;p.alive=false;p.died=s.year;p.succ=[o.id];p.over=o.id;
  s.alive=s.alive.filter(id=>id!==p.id);o.momentum=clamp(o.momentum+0.08,0,1);o.lastAccession=s.year;s.societyCounters.clanAccessions++;
  chron('diplomacy',`The clans of ${p.full} enter the ${o.full}, keeping local leaders in return for contingents and a share of future rewards.`,p.capital,[R_(o),R_(p)]);return true;
}
function snowballStep(o){
  const s=S;o.momentum*=0.975;if(s.year-o.lastAccession<5||o.momentum<0.18||o.hunger>0.15||o.coalition<0.45)return;
  if(s.r()>0.04*(o.ruler.char+o.momentum))return;
  for(const [id] of o.nb){const p=s.pols[id];if(!p||!p.alive||p.kind!=='horde'||power(p)>power(o)*(0.5+o.momentum))continue;
    if(incorporateClans(o,p))break;
  }
}
function removeResidentCulture(i,eth,n){
  const s=S,p=s.pop[i],minor=s.eth2[i]>=0?p*s.mix[i]:0,major=p-minor;
  let a=major,b=minor;if(eth===s.eth[i])a=Math.max(0,a-n);else if(eth===s.eth2[i])b=Math.max(0,b-n);else return;
  const remaining=a+b;if(remaining<1){s.mix[i]=0;return}
  if(b>a){const prior=s.eth[i];s.eth[i]=s.eth2[i];s.eth2[i]=prior;s.mix[i]=a/remaining}else s.mix[i]=b/remaining;
  // Ancestry is tracked independently. A two-component representation cannot
  // reconstruct the joint ancestry/language distribution of every household.
  if(eth===s.ancestry[i]){const b0=s.ancestry2[i]>=0?p*s.ancestryMix[i]:0,a0=Math.max(0,p-b0-n);if(b0>a0){const old=s.ancestry[i];s.ancestry[i]=s.ancestry2[i];s.ancestry2[i]=old;s.ancestryMix[i]=a0/Math.max(1,a0+b0)}else s.ancestryMix[i]=b0/Math.max(1,a0+b0)}
}
function expelCohort(i,o,fraction){
  const s=S,eth=s.eth[i],p=s.pop[i],share=s.eth2[i]>=0?1-s.mix[i]:1,n=p*share*clamp(fraction,0,0.8);if(n<1)return 0;
  const ratio=n/p,food=s.food[i]*ratio,young=s.young[i]*ratio,animals=takeHerd(i,ratio),ancestry=s.ancestry[i];
  removeResidentCulture(i,eth,n);s.pop[i]-=n;s.food[i]-=food;s.young[i]-=young;
  refugeePressure(eth,n,i,o.id,null,food,young,animals,ancestry);
  s.societyCounters.displacements+=n;return n;
}
function selectiveMortality(i,fraction){
  const s=S,adult=Math.max(0,s.pop[i]-s.young[i]),men=adult*s.maleShare[i],eth=s.eth[i];
  const native=s.eth2[i]>=0?1-s.mix[i]:1,n=Math.min(men*clamp(fraction,0,0.7)*native,s.pop[i]*0.3);
  removeResidentCulture(i,eth,n);s.pop[i]-=n;s.maleShare[i]=clamp((men-n)/Math.max(1,adult-n),0,1);
  s.societyCounters.selectiveDeaths+=n;return n;
}
function coerciveOccupation(i,o){
  const s=S;if(o.kind!=='state'||s.eth[i]<0||s.eth[i]===o.core||s.year-s.taken[i]>75)return;
  if(o.rights>0.75){o.warLaw='Negotiated incorporation';o.collectiveReprisals=false}
  const harsh=o.warLaw==='Expulsion permitted',resistance=s.unrest[i]+s.defensePact[i]*0.3;
  if(harsh&&resistance>0.55&&o.health>0.35&&s.year-s.reprisals[i]>12&&o.occupation>occupationNeed(o,i,i)&&s.r()<0.035*o.ruler.aggr){
    const due=s.pop[i]*0.015;if(budgetAt(o,i,due)<due*0.8)return;
    s.reprisals[i]=s.year;s.societyCounters.reprisals++;
    const severe=o.collectiveReprisals&&resistance>0.8&&s.r()<0.3,dead=severe?selectiveMortality(i,0.25+0.3*s.r()):0;
    const displaced=expelCohort(i,o,0.25+0.3*s.r());
    s.raidDamage[i]=clamp(s.raidDamage[i]+0.2,0,1);s.organisation[i]*=0.8;s.integ[i]*=0.6;o.trust=Math.max(0.05,o.trust-0.03);o.occupationLosses+=dead;
    warnCommunities(i,o);
    chron('war',`Occupation authorities in the ${o.full} expel ${fmtK(displaced)} residents after resistance${severe?`, with selective killing of ${fmtK(dead)} adult men`:''}.`,i,[R_(o)],'Collective punishment permitted by the government causes displacement, labour losses, resentment and a lasting demographic imbalance.');
    for(let d=0;d<4;d++){const home=WD.nb[i*4+d];if(home>=0&&s.pol[home]===o.id&&s.eth[home]===o.core&&s.pop[home]>5000){const n=foundSettlement(home,i,Math.min(s.pop[home]*0.06,s.pop[i]*0.2),o);s.societyCounters.forcedResettlers+=n;break}}
  }
  if(harsh&&o.payroll>0.6&&s.integ[i]>0.15){
    const due=s.pop[i]*0.003,paid=budgetAt(o,i,due),contact=clamp(s.newcomers[i]/Math.max(1,s.pop[i])+s.urban[i]/Math.max(1,s.pop[i])+recordSkill(i)*0.25,0,0.8);
    const n=s.pop[i]*(0.004+0.035*contact)*(paid/Math.max(1,due));
    if(n>0)mergeCulture(i,o.core,n,Math.max(1,s.pop[i]-n));
  }
}
function shatterGovernment(o,cell,reason){
  if(o.kind==='horde'){dissolveConfederation(o,reason||'The loss of its common command scatters the coalition.');return}
  const s=S;if(!o.alive)return;endForeignServiceOf(o);
  const cells=polCells(o.id);for(const i of cells){s.pol[i]=0;s.autonomy[i]=0.9;s.integ[i]*=0.4;s.food[i]+=s.depot[i];s.depot[i]=0}
  s.food[o.capital]+=o.grain;o.grain=0;o.army=o.staff=o.navy=0;o.alive=false;o.died=s.year;o.succ=[];
  if(!s.fallen.includes(o))s.fallen.push(o);s.alive=s.alive.filter(id=>id!==o.id);s.societyCounters.shatteredStates++;
  chron('fall',reason||`Raiding and the loss of its administrative center shatter the ${o.full}; surviving communities govern themselves.`,cell,[R_(o)],'Destruction of central government is distinct from annexation or the disappearance of its people.');
}
function raidDamageAt(o,origin,j,force){
  const s=S,target=s.pol[j]?s.pols[s.pol[j]]:null;
  const destroyed=s.food[j]*0.025;s.food[j]-=destroyed;
  const stock=target?budgetAt(target,j,publicAvailable(target,j)*0.15):0;
  depositPublic(o,origin,stock);s.raidDamage[j]=clamp(s.raidDamage[j]+0.04+Math.min(0.12,force/Math.max(1,s.pop[j])),0,1);
  s.infrastructure[j]*=0.96;s.workshops[j]*=0.95;s.defensePact[j]=clamp(s.defensePact[j]+0.08,0,1);
  s.wallHealth[j]*=0.97;sackSettlement(o,j,force);
  if(target){let h=target.raidHistory.get(o.id);if(!h){h={raids:0,last:s.year,paidYears:0,breaches:0};target.raidHistory.set(o.id,h)}h.raids++;h.last=s.year}
  s.societyCounters.devastations++;
  if(target&&j===target.capital&&target.health<0.3&&target.payroll<0.5&&s.raidDamage[j]>0.45&&s.r()<0.12)shatterGovernment(target,j);
}
function longRangeRaid(o){
  const s=S,w=WD;if(o.kind!=='horde'||s.r()>0.025*P.raid*(0.4+o.ruler.aggr+o.momentum)||o.armyFree<150)return;
  let origin=o.capital;const cells=s.realmCells.get(o.id)||[];for(let k=0;k<Math.min(6,cells.length);k++){const i=cells[(s.r()*cells.length)|0];if(publicAvailable(o,i)>publicAvailable(o,origin))origin=i}
  const queue=[[origin,0]],seen=new Set([origin]);let at=0,best=-1,score=0;
  while(at<queue.length&&at<160){const [i,depth]=queue[at++];if(depth>=6)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||seen.has(j)||w.rough[j]>0.8||s.forest[j]>0.85)continue;seen.add(j);
      const defended=s.pol[j]!==o.id&&wallStrength(j)>0.3;
      if(s.pol[j]!==o.id&&s.pop[j]>1000){const target=s.pol[j]?s.pols[s.pol[j]]:null;
        if(!target||target.over!==o.id&&!o.allies.includes(target.id)&&!protectedByTreaty(target,o)){const v=raidAttraction(o,origin,j)/(1+depth*0.3);if(v>score){score=v;best=j}}
      }if(!defended)queue.push([j,depth+1]);
    }
  }
  if(best>=0){s.societyCounters.raidsBeyondBorder++;territorialRaid(o,origin,best)}
}
function frontierYear(){
  const s=S,w=WD;if(s.year%5===0)frontierField();
  for(const id of [...s.alive]){const o=s.pols[id];if(!o.alive)continue;if(o.kind==='horde'){o.blockadePressure*=0.97;o.patronage*=0.94;snowballStep(o);longRangeRaid(o)}else{protectionDiplomacy(o);offerForeignService(o)}}
  for(const i of w.landIdx){const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(o){buildFrontierDefense(i,o);coerciveOccupation(i,o)}
    // Rich new farms on exposed pasture may suffer insecurity before there is
    // a territorial confederation to declare a conventional war.
    if(!o&&s.farm[i]>0.3&&frontierRisk(i)>0.25&&s.r()<0.004*frontierRisk(i)){
      const from=s.threatFrom[i];if(from<0||s.food[from]<s.pop[from]*0.05)continue;
      const cost=Math.min(s.food[from],s.pop[from]*0.015);s.food[from]-=cost;
      const loot=Math.min(s.food[i]*0.08,cost*3);s.food[i]-=loot;s.food[from]+=loot;
      s.raidDamage[i]=clamp(s.raidDamage[i]+0.05,0,1);s.raiding[from]=clamp(s.raiding[from]+0.02,0,1);
    }
  }
}
function wallStrength(i){return S.fort[i]*S.wallHealth[i]*(1-S.wallBreach[i])}
function maintainWalls(accounts){
  const s=S;for(const i of WD.landIdx){if(s.fort[i]<0.02)continue;
    const o=s.pol[i]?s.pols[s.pol[i]]:null,due=s.fort[i]*(s.pop[i]*0.001+WD.area[i]*0.004);
    const paid=o?budgetAt(o,i,due):Math.min(s.food[i],due*s.organisation[i]);
    if(o)s.food[i]+=paid;else{s.food[i]-=paid;if(accounts)accounts.consumed+=paid}
    const met=due>0?paid/due:0;
    s.wallHealth[i]=clamp(s.wallHealth[i]+0.04*met-0.015-0.055*(1-met)-0.02*s.raidDamage[i],0,1);
    s.wallBreach[i]=Math.max(0,s.wallBreach[i]-0.13*met*s.infrastructure[i]);
    if(s.wallBreach[i]===0)s.breachBy[i]=0;
    if(s.wallHealth[i]<0.05)s.fort[i]*=0.985;
  }
}
function tryWallBreach(o,from,j,force){
  const s=S,strength=wallStrength(j);if(strength<0.3)return true;
  const target=s.pol[j]?s.pols[s.pol[j]]:null;if(target&&protectedByTreaty(target,o))return false;
  if(s.breachAttempt&&s.breachAttempt.get(j)===s.year)return false;
  if(s.breachAttemptYear!==s.year){s.breachAttempt=new Map();s.breachAttemptYear=s.year}s.breachAttempt.set(j,s.year);
  const watch=target?target.preparedness*target.payroll:0.2;
  const weakness=clamp(1-s.wallHealth[j]+s.wallBreach[j]+0.5*(1-watch),0,1);
  const chance=clamp(weakness*0.18*(0.3+o.raidSkill+o.frontierIntel)+gunEffect(from)*0.12+Math.min(0.04,force/Math.max(1,s.pop[j])*0.015)-strength*0.08,0.002,0.35);
  if(s.r()>chance)return false;
  const cost=Math.min(publicAvailable(o,from),Math.max(10,force*0.04));if(cost<10)return false;budgetAt(o,from,cost);
  s.engineeringPractice[from]+=cost*0.3;s.engineeringPractice[j]+=cost*0.1;
  s.wallBreach[j]=0.85;s.wallHealth[j]*=0.75;s.breachBy[j]=o.id;s.societyCounters.wallBreaches++;
  chron('war',`Scouts of the ${o.full} find and force a weak section of the frontier defenses, opening a route into the interior.`,j,[R_(o)],'Neglected repairs, weak patrols and local intelligence can expose a defended frontier.');return true;
}
function protectedByTreaty(state,horde){
  return state.protectionPacts.some(p=>p.horde===horde.id&&p.failures<2&&p.until>=S.year&&!p.broken);
}
function createProtectionPact(state,horde,amount){
  if(state.protectionPacts.some(p=>p.horde===horde.id&&!p.broken))return false;
  state.protectionPacts.push({horde:horde.id,promised:amount,since:S.year,until:S.year+12,paid:0,failures:0,broken:false});S.societyCounters.protectionTreaties++;
  chron('diplomacy',`The ${state.full} promises annual provisions to the ${horde.full} in exchange for peace on its frontier.`,state.capital,[R_(state),R_(horde)],'Past raids and the cost of frontier defense make a negotiated payment attractive.');return true;
}
function protectionDiplomacy(o){
  const s=S;
  for(const pact of o.protectionPacts){
    const h=s.pols[pact.horde];if(pact.broken||!h||!h.alive||h.kind!=='horde')continue;
    if(s.year>pact.until){const ratio=power(h)/Math.max(1,power(o));
      if(ratio>1.5)pact.promised*=1.25;
      pact.until=s.year+12;
    }
    const paid=tributeShipment(o,h,pact.promised);pact.paid=paid;
    s.societyCounters.protectionPaid+=paid;
    if(paid<pact.promised*0.8)pact.failures++;else pact.failures=Math.max(0,pact.failures-1);
    const record=o.raidHistory.get(h.id);if(record&&paid>=pact.promised*0.8)record.paidYears++;
    const overwhelming=power(h)>power(o)*2.5&&h.momentum>0.6;
    if(pact.failures>=2||overwhelming&&s.r()<0.015*(1-h.trust)){
      pact.broken=true;s.societyCounters.brokenProtection++;
      h.allies=h.allies.filter(id=>id!==o.id);o.allies=o.allies.filter(id=>id!==h.id);
      h.installTarget=o.id;h.installUntil=s.year+30;h.momentum=clamp(h.momentum+0.05,0,1);
      if(!h.enemies.has(o.id))declareWar([h],[o],h.base+' protection dispute',true);
      chron('war',`The protection agreement between the ${o.full} and the ${h.full} breaks down${pact.failures>=2?' after unpaid installments':', as the confederation demands submission'}.`,o.capital,[R_(o),R_(h)]);
    }
  }
  if(o.protectionPacts.filter(p=>!p.broken&&p.until>=s.year).length>=2||o.central<0.25)return;
  for(const [id,history] of o.raidHistory){const h=s.pols[id];if(!h||!h.alive||h.kind!=='horde'||s.year-history.last>30||history.raids<2||o.enemies.has(id))continue;
    const threat=power(h)/Math.max(1,power(o)),willingness=clamp(history.raids*0.07+threat*0.15+(1-o.preparedness)*0.2+o.ruler.comp*0.1-o.ruler.aggr*0.15,0,0.8);
    const due=Math.max(50,o.pop*0.0015+h.army*0.025);
    if(o.grain>due*2&&s.r()<0.02*willingness){createProtectionPact(o,h,due);break}
  }
}
function installConquestDynasty(o,d,capital){
  if(!d.alive||o.kind!=='horde'||o.installTarget!==d.id||S.year>o.installUntil||d.health>0.45||o.army<d.army*1.2)return false;
  const elite=d.groups?d.groups.nobles.loyalty:0.5;
  if(elite>0.65||o.rights<0.2||o.grain<d.pop*0.015)return false;
  const s=S,name=d.full,cells=polCells(d.id);for(const i of cells){s.pol[i]=o.id;s.integ[i]=0.25;s.autonomy[i]=Math.max(0.7,s.autonomy[i]);conquestRecorded(o,i,d.id)}
  const oldCapital=o.capital;S.depot[oldCapital]+=o.grain;o.grain=0;
  inheritConquest(o,d);o.kind='state';o.conqDyn=true;o.settledY=s.year;o.capital=capital;o.legacy=d.legacy||d.id;o.base=d.base;
  o.bureau=Math.max(o.bureau,d.bureau*0.7);o.central=(o.central+d.central)*0.5;o.health=Math.max(0.45,o.health);o.conquestLoad=clamp(o.conquestLoad+1,0,3);
  o.pop+=d.pop;o.cells+=cells.length;d.alive=false;d.died=s.year;d.succ=[o.id];s.alive=s.alive.filter(id=>id!==d.id);s.societyCounters.conquestDynasties++;
  o.tier=tierOf(o);o.full=fullName(o);
  chron('rise',`The victors install the dynasty of ${o.dyn} over the former ${name}, retaining local administrators and estates.`,capital,[R_(o),R_(d)],'A defeated government, cooperation from intermediaries and sufficient forces allow conquest to become dynastic rule.');return true;
}
function confederationVisibility(mode,lastSeen=new Map()){
  const s=S,w=WD,visible=new Set();if(mode==='off')return visible;
  if(mode==='on'){for(const id of s.alive)if(s.pols[id].kind==='horde')visible.add(id);return visible}
  const distance=new Uint8Array(N).fill(255),queue=new Int32Array(N);let head=0,tail=0;
  const settled=i=>s.pop[i]>=4000&&s.farm[i]>0.3&&(s.urban[i]>=1500||s.pop[i]/w.area[i]>4&&s.organisation[i]>0.25);
  for(const i of w.landIdx)if(settled(i)){distance[i]=0;queue[tail++]=i}
  while(head<tail){const i=queue[head++];if(distance[i]>=3)continue;for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j>=0&&w.land[j]&&distance[j]>distance[i]+1){distance[j]=distance[i]+1;queue[tail++]=j}}}
  for(const i of w.landIdx){const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.kind==='horde'&&distance[i]<=3)visible.add(o.id)}
  for(const id of s.alive){const o=s.pols[id];if(o.kind!=='horde')continue;
    if([...o.enemies.keys()].some(id=>s.pols[id]&&s.pols[id].alive&&s.pols[id].kind==='state'))visible.add(id);
  }
  for(const e of s.tradeEdges){const a=s.pol[e.a],b=s.pol[e.b];if(!a||!b||a===b)continue;
    if(s.pols[a].kind==='horde'&&settled(e.b))visible.add(a);if(s.pols[b].kind==='horde'&&settled(e.a))visible.add(b);
  }
  for(const id of visible)lastSeen.set(id,s.year);
  for(const id of s.alive)if(s.pols[id].kind==='horde'&&lastSeen.has(id)&&s.year-lastSeen.get(id)<=10)visible.add(id);
  return visible;
}

// Bounded scouting of connected pasture and crossings. Costs, rather than a
// preferred compass direction, decide which opening a mobile coalition seeks.
function migrationRoute(o,start,force,limit=700){
  const s=S,w=WD,cost=new Map([[start,0]]),parent=new Map(),heap=[[0,start]];
  const push=(v)=>{heap.push(v);let k=heap.length-1;while(k){const p=(k-1)>>1;if(heap[p][0]<=v[0])break;heap[k]=heap[p];k=p}heap[k]=v};
  const pop=()=>{const v=heap[0],last=heap.pop();if(heap.length){let k=0;while(k*2+1<heap.length){let c=k*2+1;if(c+1<heap.length&&heap[c+1][0]<heap[c][0])c++;if(heap[c][0]>=last[0])break;heap[k]=heap[c];k=c}heap[k]=last}return v};
  let visited=0,best=-1,bestValue=0;
  while(heap.length&&visited<limit){const [distance,i]=pop();if(distance!==cost.get(i))continue;visited++;if(distance>120)continue;
    if(i!==start&&s.pol[i]!==o.id){
      const owner=s.pol[i]?s.pols[s.pol[i]]:null,defense=fieldDefense(i,false)/Math.max(1,Math.pow(force+1,P.scaleExp)*milAt(start));
      const room=clamp((s.K[i]-s.pop[i])/Math.max(1000,s.K[i]),0,1),forage=w.sH[i]*pastureCondition(i);
      const wealth=owner&&owner.kind==='state'?Math.log2(2+s.pop[i]/5000)*clamp(s.food[i]/Math.max(1,s.pop[i]),0,1):0;
      const value=(room*forage+wealth*0.65+0.08)*Math.min(1,forage+0.15)/(1+distance*0.065+defense*0.8+s.migrationPressure[i]);
      if(value>bestValue){bestValue=value;best=i}
    }
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||w.T[j]<-9||w.rough[j]>0.85||s.forest[j]>0.9)continue;
      const own=s.pol[j]===o.id,owner=s.pol[j]?s.pols[s.pol[j]]:null,wall=own?0:wallStrength(j);
      if(wall>0.65)continue;
      const forage=w.sH[j]*pastureCondition(j);if(forage<0.08&&!(w.desert[j]&&s.pack[start]>0.25)&&!(owner&&owner.kind==='state'))continue;
      const opposition=own?0:fieldDefense(j,false)/Math.max(1,Math.pow(force+1,P.scaleExp)*milAt(start));
      const step=1+2*w.rough[j]+2*s.forest[j]+0.4*crossingRiver(i,j)+Math.max(0,0.55-forage)*4+wall*12+Math.min(8,opposition*1.2)+s.migrationPressure[j]*2;
      const next=distance+step;if(next>=(cost.get(j)??Infinity))continue;
      cost.set(j,next);parent.set(j,i);push([next,j]);
    }
  }
  const path=[];if(best>=0){let i=best;while(i!==start){path.push(i);i=parent.get(i);if(i==null)return []}path.reverse()}return path;
}
function migrationWallPass(M,j){
  const s=S,strength=wallStrength(j);if(s.pol[j]===M.pol||strength<0.3)return true;
  const key=-1-j;if(M.blocked.get(key)===s.year)return false;M.blocked.set(key,s.year);
  const owner=s.pol[j]?s.pols[s.pol[j]]:null,watch=owner?owner.preparedness*owner.payroll:0.2;
  const weakness=1-s.wallHealth[j]+s.wallBreach[j]+0.4*(1-watch),cost=M.pop*0.015;
  if(M.food<cost||s.r()>clamp(weakness*(0.06+M.experience*0.12)-strength*0.05,0.001,0.2))return false;
  M.food-=cost;s.wallBreach[j]=0.85;s.wallHealth[j]*=0.8;s.breachBy[j]=M.pol;s.societyCounters.migrantBreaches++;
  chron('migration',`The ${M.name} force an opening in neglected frontier defenses and move through the gap.`,j,[RM(M)]);return true;
}
function takeMigrationFollowers(M,j,n){
  const s=S,prior=s.pop[j];n=Math.min(n,prior*0.25);if(n<1)return 0;
  const ratio=n/prior,young=s.young[j]*ratio,food=s.food[j]*ratio;
  addHerd(M.animals,takeHerd(j,ratio));M.food+=food;M.young+=young;M.pop+=n;
  const minority=s.eth2[j]>=0?s.mix[j]:0;
  for(const [eth,share] of [[s.eth[j],1-minority],[s.eth2[j],minority]])if(eth>=0&&share>0){
    let g=M.groups.find(g=>g.eth===eth&&g.ancestry===s.ancestry[j]);if(!g){g={eth,ancestry:s.ancestry[j],pop:0};M.groups.push(g)}g.pop+=n*share;
  }
  s.pop[j]-=n;s.young[j]-=young;s.food[j]-=food;
  const owner=s.pol[j]?s.pols[s.pol[j]]:null;if(owner){owner.army*=1-ratio;owner.staff*=1-ratio}
  return n;
}
function migrationNomadEncounter(M,j){
  const s=S,o=s.pol[j]?s.pols[s.pol[j]]:null;if(!o||o.kind!=='horde'||o.id===M.pol||M.kind==='people')return null;
  const mobile=M.pop*0.09*M.S*M.mil,defender=Math.max(100,(o.army-o.loanedTroops)*milAt(j));
  const pressure=clamp(mobile/defender,0,3);s.migrationPressure[j]=clamp(s.migrationPressure[j]+pressure*0.3,0,2);
  const affinity=1-ethDist(M.eth,s.eth[j]),provision=clamp(M.food/Math.max(1,M.pop*0.6),0,1);
  if(pressure>0.8&&provision>0.25&&s.r()<clamp(0.08+M.experience*0.22+affinity*0.12+(1-o.coalition)*0.15,0,0.55)){
    const n=takeMigrationFollowers(M,j,Math.min(M.pop*0.15,s.pop[j]*0.12, M.food*0.25));
    if(n>0){M.experience=clamp(M.experience+0.02,0,1);s.societyCounters.migrationAccessions++;
      chron('migration',`Clans of the ${o.full} join the moving ${M.name}, bringing ${fmtK(n)} people and their herds.`,j,[RM(M),R_(o)]);return true}
  }
  if(pressure>1.35&&s.migrationPressure[j]>0.45&&o.pop>15000&&s.year-o.lastMigration>15&&s.activeMigs.length<20&&s.r()<0.3*(1-o.preparedness*0.5)){
    const retreat=hordeMigration(o,'pressure');if(retreat){retreat.prev=M.id;s.societyCounters.migrationRetreats++;o.shock+=0.1;return true}
  }
  return null;
}

// Contracts earmark existing troops; the employer never gets a second copy of
// the same army. Temporary service keeps dependents in the recruitment base.
function createMilitaryContract(state,horde,troops,years=8){
  const s=S,settled=horde.kind==='state'&&state.kind==='state'&&(horde.over===state.id||state.allies.includes(horde.id))&&horde.trust>0.4;
  if((state.kind!=='state'&&!(state.kind==='horde'&&horde.over===state.id&&horde.submission))||horde.kind!=='horde'&&!settled||state.enemies.has(horde.id)||!state.alive||!horde.alive)return null;
  if(s.militaryContracts.some(t=>!t.done&&(t.state===state.id||t.horde===horde.id)))return null;
  const n=Math.min(troops,Math.max(0,horde.army-horde.loanedTroops)*0.3),due=n*0.8;if(n<100||state.grain<due*2)return null;
  const travel=Math.max(1,Math.ceil(angDist(state.capital,horde.capital)/0.15));
  const t={state:state.id,horde:horde.id,kind:settled?'settled':'nomad',home:horde.capital,troops:n,free:0,pay:due,since:s.year,arrives:s.year+travel,end:s.year+travel+years,failures:0,served:0,tech:new Float32Array(TECH.length),equipment:0,done:false,lastPaid:s.year};
  tributeShipment(state,horde,due);s.militaryContracts.push(t);horde.loanedTroops+=n;
  horde.armyFree=Math.max(0,horde.armyFree-n*0.55);horde.defFree=Math.max(0,horde.defFree-n*0.45);
  if(!state.allies.includes(horde.id))state.allies.push(horde.id);if(!horde.allies.includes(state.id))horde.allies.push(state.id);
  s.societyCounters.militaryContracts++;
  chron('diplomacy',`The ${state.full} engages ${Math.round(n)} warriors from the ${horde.full}, promising provisions for their service against its rivals.`,state.capital,[R_(state),R_(horde)]);return t;
}
function offerForeignService(o){
  const s=S;if(s.year%5||!o.enemies.size||s.r()>0.06*P.allyRate)return;
  const candidates=new Set([...o.nb.keys(),...o.allies]);
  for(const id of candidates){const h=s.pols[id];if(!h||!h.alive||h.kind!=='horde'||h.enemies.has(o.id))continue;
    if(h.enemies.size&&![...h.enemies.keys()].some(id=>o.enemies.has(id)))continue;
    if(createMilitaryContract(o,h,h.army*0.25))break;
  }
}
function returnVeterans(t){
  const s=S,h=s.pols[t.horde],employer=s.pols[t.state];if(employer)employer.foreignFree=Math.max(0,employer.foreignFree-t.free);
  t.done=true;t.free=0;if(!h||!h.alive)return;
  h.loanedTroops=Math.max(0,h.loanedTroops-t.troops);s.societyCounters.returnedVeterans+=t.troops;
  if(t.served>0){const c=s.pol[t.home]===h.id?t.home:h.capital,experience=clamp(t.served/20,0,0.18);
    h.raidSkill=clamp(h.raidSkill+experience,0,1);h.crisisMemory=clamp(h.crisisMemory+experience*0.5,0,1);
    s.craftPractice[c]+=Math.min(30,t.served*0.5);s.firearms[c]+=t.equipment;t.equipment=0;
    for(let k=0;k<TECH.length;k++)if(t.tech[k]>s.tk[k][c])s.tk[k][c]=Math.max(s.tk[k][c],Math.min(0.45,t.tech[k]*0.4));
    chron('ideas',`Veterans return to the ${h.full} with experience of settled armies and techniques encountered in service.`,c,[R_(h)],'Equipment and practical knowledge can travel home, but widespread adoption still needs training, materials and local workshops.');
  }
}
function endForeignServiceOf(o){for(const t of S.militaryContracts)if(!t.done&&(t.horde===o.id||t.state===o.id))returnVeterans(t)}
function militaryContractsYear(){
  const s=S;for(const id of s.alive){const o=s.pols[id];o.foreignFree=0;o.loanedTroops=0;o.campaignAuxShare=0}
  for(const t of s.militaryContracts){if(t.done)continue;const a=s.pols[t.state],h=s.pols[t.horde];
    if(!a||!a.alive||!h||!h.alive||h.kind!=='horde'&&!(t.kind==='settled'&&(h.over===a.id||a.allies.includes(h.id)))||a.enemies.has(h.id)||s.year>=t.end||t.failures>=2){returnVeterans(t);continue}
    t.troops=Math.min(t.troops,h.army*0.5);
    if(t.lastPaid<s.year){const paid=tributeShipment(a,h,t.pay);t.lastPaid=s.year;if(paid<t.pay*0.8)t.failures++;else t.failures=Math.max(0,t.failures-1)}
    h.loanedTroops+=t.troops;t.free=s.year>=t.arrives&&t.failures===0?t.troops*0.55:0;a.foreignFree+=t.free;
  }
  for(const id of s.alive){const o=s.pols[id];o.armyFree=Math.max(0,o.army-o.loanedTroops)*0.55;o.defFree=Math.max(0,o.army-o.loanedTroops)*0.45}
  if(s.year%25===0)s.militaryContracts=s.militaryContracts.filter(t=>!t.done);
}
function drawForeignTroops(o,i,n){
  const s=S;let used=0;for(const t of s.militaryContracts){if(t.done||t.state!==o.id||t.free<=0)continue;
    const take=Math.min(n-used,t.free);if(take<=0)break;t.free-=take;used+=take;t.served++;
    for(let k=0;k<TECH.length;k++)t.tech[k]=Math.max(t.tech[k],s.tk[k][i]);
    const equipment=Math.min(s.firearms[i]*0.02,take*0.01);s.firearms[i]-=equipment;t.equipment+=equipment;
  }o.foreignFree=Math.max(0,o.foreignFree-used);return used;
}
function foreignCasualties(o,n){
  const s=S,contracts=s.militaryContracts.filter(t=>!t.done&&t.state===o.id&&t.troops>0),total=contracts.reduce((v,t)=>v+t.troops,0);
  for(const t of contracts){const killed=Math.min(t.troops,n*t.troops/Math.max(1,total)),h=s.pols[t.horde];t.troops-=killed;t.free=Math.min(t.free,t.troops*0.55);
    if(h){h.loanedTroops=Math.max(0,h.loanedTroops-killed);armyLoss(h,s.pol[t.home]===h.id?t.home:h.capital,killed)}
  }
}

/* Stylized disease families, not calibrated reconstructions of named pathogens.
   E/I/R are fractions of the local host population. Each family has independent
   immunity; short disease steps run inside the annual political/economic step. */
const PATHOGENS=[
  {k:'respiratory',n:'respiratory fever',incubation:7,duration:14,beta:1.65,fatality:0.018,waning:0.28},
  {k:'enteric',n:'enteric fever',incubation:14,duration:28,beta:1.3,fatality:0.09,waning:0.15},
  {k:'pox',n:'pox-like disease',incubation:14,duration:21,beta:2.3,fatality:0.22,waning:0.008},
  {k:'vector',n:'vector-borne fever',incubation:14,duration:28,beta:1.1,fatality:0.075,waning:0.12},
  {k:'herd',n:'livestock pestilence',incubation:14,duration:21,beta:1.8,fatality:0.3,waning:0.1,animal:true}
];
const DISEASE_STEPS=24,DISEASE_DAYS=365/DISEASE_STEPS;
function initEpidemics(){
  const s=S;s.pathogens=PATHOGENS.map(()=>({exposed:new Float32Array(N),infectious:new Float32Array(N),recovered:new Float32Array(N),wave:new Int32Array(N).fill(-1),active:new Set(),endemic:new Set()}));
  s.sickness=new Float32Array(N);s.containment=new Float32Array(N);s.epidemicLoss=new Float32Array(N);
  s.previousForest=Float32Array.from(s.forest);s.healthTrips=[];s.diseaseTick=0;s.healthRoutes=new Map();
  Object.assign(s.societyCounters,{epidemicDeaths:0,livestockEpidemicDeaths:0,diseaseIntroductions:0,spillovers:0,epidemicSuccessions:0,healthProvisioning:0});
}
function diseaseHosts(k,i){return PATHOGENS[k].animal?S.animals.reduce((n,a)=>n+a[i],0):S.pop[i]}
function pathogenHabitat(k,i){
  if(PATHOGENS[k].k!=='vector')return 1;
  return clamp((WD.T[i]-10)/12,0,1)*clamp((WD.Pr[i]-180)/650,0,1)*clamp(S.wm[i],0.2,1.2);
}
function outbreakAt(k,i,cases=10,parent=-1,source=i,cause='local outbreak'){
  const s=S,d=s.pathogens[k],p=PATHOGENS[k],hosts=diseaseHosts(k,i);if(hosts<50||pathogenHabitat(k,i)<0.1)return null;
  const susceptible=Math.max(0,1-d.recovered[i]-d.exposed[i]-d.infectious[i]),dose=Math.min(susceptible,cases/hosts);if(dose<=0)return null;
  let o=s.outbreaks[d.wave[i]];
  if(!o||o.done||!d.active.has(i)){
    o=parent>=0?s.outbreaks[parent]:null;
    if(!o||o.done||o.pathogen!==k){const e=s.eths[s.eth[i]];
      o={id:s.outbreaks.length,pathogen:k,name:(e?cap(e.lang.lex.river)+' ':'')+p.n,origin:i,year:s.year,deaths:0,animalDeaths:0,vir:p.fatality,cells:0,active:0,done:false,spread:[],visited:new Set(),hit:new Set(),virgin:source!==i&&d.recovered[i]<0.1,from:s.eth[source],cause};s.outbreaks.push(o);
      chron('plague',`An outbreak of ${p.n} begins${cause==='spillover'?' after changing contact with wildlife and livestock':''}.`,i,[RPl(o)]);
    }
    d.wave[i]=o.id;
  }
  if(!o.visited.has(i)){o.visited.add(i);o.cells++;if(o.spread.length<4000)o.spread.push([s.year-o.year,i])}
  d.exposed[i]+=dose;d.active.add(i);return o;
}
function travelInfectionSurvival(k,days,people,mode){
  const p=PATHOGENS[k],direct=Math.exp(-days/(p.incubation+p.duration));
  // Sequential infection within a sizeable traveling group can bridge a long
  // journey. Livestock and vector reservoirs can travel in suitable cargo.
  const chain=clamp(people/180,0,0.55)*(mode==='sea'||mode==='migration'?0.65:0.25);
  const reservoir=p.animal&&mode==='livestock'?0.7:p.k==='vector'&&mode==='sea'?0.12:0;
  return clamp(direct+(1-direct)*Math.max(chain,reservoir),0,1);
}
function epidemicTravelFactor(i,j){return S.containment?1-0.75*Math.max(S.containment[i],S.containment[j]):1}
function diseaseJourney(src,dest,days,people,mode='local',family=null){
  const s=S;if(src===dest||people<=0||!s.pathogens||s.healthTrips.length>=6000)return;
  const exposures=[];for(let k=0;k<PATHOGENS.length;k++){if(family!=null&&k!==family)continue;
    const d=s.pathogens[k],prevalence=d.infectious[src]+d.exposed[src]*0.5;
    const dose=people*prevalence*travelInfectionSurvival(k,days,people,mode)*epidemicTravelFactor(src,dest);
    if(dose>0.001)exposures.push({k,dose,wave:d.wave[src]});
  }
  if(exposures.length)s.healthTrips.push({src,dest,mode,exposures,due:s.diseaseTick+Math.max(1,Math.ceil(days/DISEASE_DAYS))});
}
function travelDays(i,j,sea=false){return Math.max(1,angDist(i,j)*6371/(sea?95:22))}
function diseaseHistory(i){return S.pathogens.map(d=>d.recovered[i])}
function mixDiseaseHistory(j,history,n,prior){if(!history||n<=0)return;for(let k=0;k<S.pathogens.length;k++){const d=S.pathogens[k],total=Math.max(1,prior+n);
  d.exposed[j]*=prior/total;d.infectious[j]*=prior/total;
  d.recovered[j]=clamp((d.recovered[j]*prior+(history[k]||0)*n)/total,0,1-d.exposed[j]-d.infectious[j]);
}}
function healthPolicy(i,o,portion=1){
  const s=S,ill=s.pathogens.slice(0,4).reduce((n,d)=>n+d.infectious[i]+d.exposed[i],0);
  const trust=o?o.trust:s.organisation[i],capacity=o?o.health*o.payroll*(0.3+0.7*o.bureau):s.organisation[i]*0.4;
  const response=ill>0.002?clamp(capacity*trust*(0.3+(o?o.preparedness:0)),0,0.85):0;
  const due=s.pop[i]*response*0.002*portion,paid=o?budgetAt(o,i,due):Math.min(s.food[i]*0.01,due);
  if(o)s.food[i]+=paid;else s.food[i]-=paid;
  s.societyCounters.healthProvisioning+=paid;
  const funded=due>0?paid/due:0;s.containment[i]=clamp(s.containment[i]*0.65+response*funded*0.35,0,0.85);
}
function diseaseMortality(k,i,n,o){
  const s=S,p=PATHOGENS[k];if(n<=0)return;
  if(p.animal){const hosts=diseaseHosts(k,i),ratio=clamp(n/Math.max(1,hosts),0,1);for(const a of s.animals)a[i]*=1-ratio;refreshAnimalAccess(i);o.animalDeaths+=n;s.societyCounters.livestockEpidemicDeaths+=n;return}
  n=Math.min(n,s.pop[i]*0.5);const prior=s.pop[i],ratio=n/Math.max(1,prior),id=s.pol[i],state=id?s.pols[id]:null;
  s.pop[i]-=n;s.young[i]*=1-ratio;s.urban[i]*=1-ratio;s.epidemicLoss[i]+=n;o.deaths+=n;s.societyCounters.epidemicDeaths+=n;
  s.organisation[i]*=1-ratio*0.12;s.infrastructure[i]*=1-ratio*0.08;
  if(state){const realm=n/Math.max(1,state.pop);state.staff*=1-realm;state.army*=1-realm;state.navy*=1-realm;
    state.shock=clamp(state.shock+realm*0.8,0,3);state.plagueD=(state.plagueD||0)+n;o.hit.add(id)}
}
function epidemicOrigins(){
  const s=S,w=WD;if(P.disease<=0)return;
  for(let t=0;t<40;t++){const i=w.landIdx[(s.r()*w.landIdx.length)|0];if(s.pop[i]<200)continue;
    const density=s.pop[i]/w.area[i],herds=diseaseHosts(4,i),cleared=Math.max(0,s.previousForest[i]-s.forest[i]);
    const chance=P.disease*(0.00012*density*(0.2+s.farm[i])+cleared*0.06+s.herd[i]*Math.min(1,herds/2000)*0.0005);
    if(s.r()>chance)continue;
    const k=cleared>0.005&&pathogenHabitat(3,i)>0.3?3:herds>500&&s.r()<0.2?4:density>8&&herds>1000&&s.r()<0.25?2:s.food[i]/s.pop[i]<0.1?1:(s.r()<0.65?0:1);
    if(!s.pathogens[k].active.has(i)){const o=outbreakAt(k,i,Math.max(3,s.pop[i]*0.002),-1,i,k===3?'spillover':'local outbreak');if(o&&k===3)s.societyCounters.spillovers++}
  }
  for(let k=0;k<PATHOGENS.length;k++)for(const i of [...s.pathogens[k].endemic]){
    if(diseaseHosts(k,i)<20000||!s.node[i]){s.pathogens[k].endemic.delete(i);continue}
    if(s.r()<0.025*P.disease)outbreakAt(k,i,3);
  }
}
function epidemicRoutes(){
  const s=S;s.healthRoutes=new Map();
  const add=(i,j,people,sea)=>{if(people<0.1)return;let routes=s.healthRoutes.get(i);if(!routes)s.healthRoutes.set(i,routes=[]);routes.push({j,people,days:travelDays(i,j,sea),mode:sea?'sea':'trade'})};
  for(const e of s.tradeEdges){const traffic=(e.privateUsed||0)+(e.freightUsed||0);if(traffic<=0)continue;const sea=!!(WD.coast[e.a]&&WD.coast[e.b]&&!alongRiver(e.a,e.b));add(e.a,e.b,Math.min(200,traffic*0.015),sea);add(e.b,e.a,Math.min(200,traffic*0.015),sea)}
  for(const route of s.routes){const i=route.path[0],j=route.path.at(-1);if(i!=null&&j!=null&&Math.min(s.car[i],s.car[j])>0.1){add(i,j,15*Math.min(s.car[i],s.car[j]),false);add(j,i,15*Math.min(s.car[i],s.car[j]),false)}}
}
function epidemicYear(){
  const s=S,w=WD;s.sickness.fill(0);s.epidemicLoss.fill(0);epidemicOrigins();epidemicRoutes();
  for(const i of w.landIdx){for(let k=0;k<PATHOGENS.length;k++)s.pathogens[k].recovered[i]*=Math.max(0,1-PATHOGENS[k].waning-0.018);healthPolicy(i,s.pol[i]?s.pols[s.pol[i]]:null);s.previousForest[i]=s.forest[i]}
  for(let tick=0;tick<DISEASE_STEPS;tick++){
    s.diseaseTick++;
    const due=s.healthTrips.filter(t=>t.due<=s.diseaseTick);s.healthTrips=s.healthTrips.filter(t=>t.due>s.diseaseTick);
    for(const trip of due)for(const e of trip.exposures)if(s.r()<1-Math.exp(-e.dose*epidemicTravelFactor(trip.src,trip.dest))){if(outbreakAt(e.k,trip.dest,Math.max(1,e.dose),e.wave,trip.src,'contact'))s.societyCounters.diseaseIntroductions++}
    for(let k=0;k<PATHOGENS.length;k++){const d=s.pathogens[k],p=PATHOGENS[k];
      for(const i of [...d.active]){const hosts=diseaseHosts(k,i),o=s.outbreaks[d.wave[i]];if(!o||hosts<1){d.active.delete(i);continue}
        const habitat=pathogenHabitat(k,i),ill=d.infectious[i],latent=d.exposed[i],susceptible=Math.max(0,1-d.recovered[i]-ill-latent);
        if(k<4&&tick%6===0&&ill>0.01)healthPolicy(i,s.pol[i]?s.pols[s.pol[i]]:null,0.25);
        const density=clamp(Math.log2(2+hosts/w.area[i])/3,0.12,1.5),season=p.k==='respiratory'?0.85+0.25*Math.cos((tick/DISEASE_STEPS)*Math.PI*2):1;
        const urbanCrowding=1+0.35*clamp(s.urban[i]/Math.max(100,s.housing[i]),0,2)*clamp(s.urban[i]/Math.max(1,s.pop[i])*4,0,1);
        const hygiene=p.k==='enteric'?clamp((1-0.25*s.infrastructure[i]-0.3*s.sanitation[i])*urbanCrowding,0.4,1.7):p.k==='respiratory'?urbanCrowding:1;
        const transmission=p.beta*ill*susceptible*density*season*habitat*hygiene*(1-0.7*s.containment[i])*P.disease;
        const exposed=Math.min(susceptible,transmission),onset=latent*Math.min(1,DISEASE_DAYS/p.incubation),resolved=ill*Math.min(1,DISEASE_DAYS/p.duration);
        const hardship=1+0.9*(1-s.nutrition[i])+0.35*s.raidDamage[i],care=1-0.2*s.containment[i];
        const dead=Math.min(hosts*0.4,resolved*hosts*p.fatality*hardship*care);
        diseaseMortality(k,i,dead,o);
        const mortality=dead/Math.max(1,hosts),remaining=Math.max(0.01,1-mortality);
        d.exposed[i]=clamp((latent+exposed-onset)/remaining,0,1);
        d.infectious[i]=clamp((ill+onset-resolved)/remaining,0,1-d.exposed[i]);
        d.recovered[i]=clamp((d.recovered[i]+resolved-mortality)/remaining,0,1-d.exposed[i]-d.infectious[i]);
        if(!p.animal)s.sickness[i]+=ill/DISEASE_STEPS;
        if(ill>0.0001&&tick%2===0){
          for(let dir=0;dir<4;dir++){const j=w.nb[i*4+dir];if(j<0||!w.land[j]||diseaseHosts(k,j)<50)continue;diseaseJourney(i,j,travelDays(i,j),Math.min(60,Math.sqrt(hosts*diseaseHosts(k,j))*0.002),'local',k)}
          if(tick%4===0)for(const route of s.healthRoutes.get(i)||[])diseaseJourney(i,route.j,route.days,route.people/6,route.mode,k);
        }
        if(d.exposed[i]+d.infectious[i]<1/Math.max(1000,hosts)){d.exposed[i]=d.infectious[i]=0;d.active.delete(i);if(hosts>50000&&s.node[i]>0.3&&k<3)d.endemic.add(i)}
      }
    }
  }
  s.infect.fill(0);s.immune.fill(0);const active=new Set();for(const o of s.outbreaks)if(!o.done)o.active=0;
  for(let k=0;k<PATHOGENS.length;k++){const d=s.pathogens[k];for(const i of w.landIdx)if(k<4)s.immune[i]+=d.recovered[i]/4;
    for(const i of d.active){s.infect[i]=1;s.ob[i]=d.wave[i];active.add(i);s.outbreaks[d.wave[i]].active++}}
  s.inf=[...active];const pending=new Set(s.healthTrips.flatMap(t=>t.exposures.map(e=>e.wave)));
  for(const o of s.outbreaks)if(!o.done&&!o.active&&!pending.has(o.id)&&o.year<s.year){o.done=true;o.end=s.year;o.hit=[...o.hit];if(o.deaths>25000||o.animalDeaths>5000)chron('plague',`The ${o.name} subsides after ${fmtK(o.deaths)} human deaths${o.animalDeaths?` and ${fmtK(o.animalDeaths)} livestock losses`:''}.`,o.origin,[RPl(o)])}
  for(const i of w.landIdx)s.sickness[i]=clamp(s.sickness[i],0,0.85);
  for(const id of [...s.alive]){const o=s.pols[id],c=o.capital,loss=s.epidemicLoss[c]/Math.max(1,s.pop[c]+s.epidemicLoss[c]);
    if(loss>0.04&&s.r()<loss*0.65){o.ruler.death=s.year-o.ruler.birth;s.societyCounters.epidemicSuccessions++;chron('plague',`The ruler of the ${o.full} dies during the epidemic, testing the succession.`,c,[R_(o)])}}
}

/* Frontier coalitions and maritime foundations use actual resources and local
   relationships. These are conditional processes, not regional spawn scripts. */
function initConnections(){
  const s=S;s.frontierAlarm=new Float32Array(N);s.frontierEnemy=new Int32Array(N);s.encroached=new Int32Array(N).fill(-100000);
  s.portContact=new Float32Array(N);s.expeditions=[];s.enclaves=[];
  Object.assign(s.societyCounters,{defensiveConfederations:0,threatAccessions:0,maritimeFoundations:0,tradingEnclaves:0,failedExpeditions:0,colonialContacts:0});
}
function recordFrontierPressure(attacker,j,severity){
  if(!attacker||attacker.kind!=='state')return;const s=S,w=WD;
  ring(j,2,(i,dx,dy)=>{if(!w.land[i]||s.pop[i]<300||s.pol[i]===attacker.id||s.herd[i]<0.35||w.rangeExposure[i]<0.25)return;
    const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.kind==='state')return;
    const distance=1+Math.abs(dx)+Math.abs(dy),communication=(0.3+0.7*s.organisation[i])*(0.5+0.5*Math.max(s.mounts[i],s.pack[i]));
    const threat=severity*communication/distance;
    if(!s.frontierEnemy[i]||s.frontierEnemy[i]===attacker.id||threat>s.frontierAlarm[i]*0.5){s.frontierEnemy[i]=attacker.id;s.frontierAlarm[i]=clamp(s.frontierAlarm[i]+threat,0,1);s.encroached[i]=s.year}
    if(o){o.threatMemory=o.threatMemory||new Map();o.threatMemory.set(attacker.id,{last:s.year,severity:s.frontierAlarm[i]})}
  });
}
function frontierCoalitionAt(i,force=false){
  const s=S,w=WD,enemy=s.frontierEnemy[i],alarm=s.frontierAlarm[i],incumbent=s.pol[i]?s.pols[s.pol[i]]:null;
  if(!enemy||alarm<0.12||incumbent&&incumbent.kind!=='horde')return null;
  const aggressor=s.pols[enemy];if(!aggressor||!aggressor.alive)return null;
  if(incumbent&&(incumbent.allies.includes(enemy)||protectedByTreaty(aggressor,incumbent)))return null;
  const cells=[];let population=0,food=0,herds=0;
  // Local communication only: a threat is not broadcast to every pastoralist.
  const queue=[i],seen=new Set(queue);for(let at=0;at<queue.length&&at<32;at++){const j=queue[at];
    if(s.frontierEnemy[j]!==enemy||s.frontierAlarm[j]<0.08||s.herd[j]<0.35||w.rough[j]>0.8)continue;
    const owner=s.pol[j]?s.pols[s.pol[j]]:null;if(owner&&owner.kind!=='horde'||owner&&owner.allies.includes(enemy))continue;
    cells.push(j);population+=s.pop[j];food+=s.food[j];herds+=s.animals.reduce((n,a)=>n+a[j],0);
    for(let d=0;d<4;d++){const next=w.nb[j*4+d];if(next>=0&&w.land[next]&&!seen.has(next)){seen.add(next);queue.push(next)}}
  }
  if(cells.length<2||population<12000||herds<population*0.015||food<population*0.08)return null;
  const leader=incumbent?incumbent.ruler.char:0.2+s.organisation[i]*0.6;
  if(!force&&s.r()>alarm*(0.04+0.15*leader)*P.formRate)return null;
  let o=incumbent;if(!o){const unclaimed=cells.filter(j=>!s.pol[j]);if(unclaimed.length<2)return null;
    o=s.pols[newPolity(i,null,{kind:'horde',origin:{type:'defensive',against:enemy,why:'Clans coordinate protection after repeated incursions on their pasture and routes.'}})];
    for(const j of unclaimed){s.pol[j]=o.id;s.integ[j]=0.55;s.autonomy[j]=0.85}
    o.pop=unclaimed.reduce((n,j)=>n+s.pop[j],0);o.cells=unclaimed.length;o.sharedThreat=alarm;s.societyCounters.defensiveConfederations++;
    chron('rise',`Clans assemble the ${o.full} to resist incursions by the ${aggressor.full}.`,i,[R_(o),R_(aggressor)]);
  }
  o.sharedThreat=Math.max(o.sharedThreat||0,alarm);o.threatMemory=o.threatMemory||new Map();o.threatMemory.set(enemy,{last:s.year,severity:alarm});
  const neighbors=new Set(cells.map(j=>s.pol[j]).filter(id=>id&&id!==o.id));
  for(const id of neighbors){const p=s.pols[id];if(!p||!p.alive||p.kind!=='horde'||p.allies.includes(enemy)||power(p)>power(o)*(0.8+leader))continue;
    if((force||s.r()<alarm*leader*0.3)&&incorporateClans(o,p)){s.societyCounters.threatAccessions++;break}}
  return o;
}
function connectionYear(){
  const s=S;for(const i of WD.landIdx){s.frontierAlarm[i]*=0.96;s.portContact[i]*=0.99;
    if(s.year%5===0&&s.frontierAlarm[i]>0.12)frontierCoalitionAt(i);
    if(!s.pol[i]&&s.portContact[i]>0.05&&s.pop[i]>1000){const contact=s.portContact[i];s.organisation[i]=clamp(s.organisation[i]+0.0015*contact,0,1);s.defensePact[i]=clamp(s.defensePact[i]+0.002*contact,0,1)}
  }
  for(const id of [...s.alive]){const o=s.pols[id];o.sharedThreat=(o.sharedThreat||0)*0.95;
    for(const [enemy,m] of o.threatMemory||[]){if(!s.pols[enemy]?.alive||s.year-m.last>40)o.threatMemory.delete(enemy)}
    if(o.kind==='state')maritimeYear(o);
  }
  for(const e of [...s.expeditions])if(!e.done&&s.year>=e.arrival)landExpedition(e);
}
function colonialMotivation(o){
  const c=o.capital,s=S,land=clamp(s.pop[c]/Math.max(1,s.K[c])-0.55,0,0.8),exclusion=clamp(o.ineq-0.3,0,0.6)*(1-o.rights*0.5);
  const exile=clamp(o.shock*0.25+(1-o.coalition)*0.3,0,0.5),opportunity=s.node[c]*0.2;
  return clamp(land+exclusion+exile+opportunity,0,1);
}
function maritimeYear(o){
  const s=S,c=o.capital;if(!WD.coast[c]||s.sail[c]<0.35||s.pop[c]<4000)return;
  o.merchantFleet=o.merchantFleet||0;o.maritimePractice=o.maritimePractice||0;o.cityStateYears=o.cityStateYears||0;
  const civic=o.cells<=6&&s.urban[c]>1500;if(civic)o.cityStateYears++;
  const due=s.pop[c]*0.0015*(0.2+s.node[c]),paid=budgetAt(o,c,due);s.food[c]+=paid;
  o.merchantFleet=Math.max(0,o.merchantFleet*0.96+paid*0.04*s.sail[c]);o.merchantFree=o.merchantFleet;
  o.maritimePractice=clamp(o.maritimePractice+0.01*(paid/Math.max(1,due))*s.sail[c],0,1);
  if(!civic||s.year-(o.lastFoundation??-100000)<20||o.cityStateYears<30||o.maritimePractice<0.15||s.nutrition[c]<0.75)return;
  if(s.r()>0.012*P.seafaring*colonialMotivation(o))return;
  const target=chooseColonySite(o);if(target>=0)launchExpedition(o,target);
}
function chooseColonySite(o){
  const s=S,w=WD,c=o.capital,candidates=new Set(o.knownPorts||[]);for(let k=w.ls[c];k<w.ls[c+1];k++)if(w.ld[k]<4+12*s.nav[c])candidates.add(w.lt[k]);
  let best=-1,score=0;for(const i of candidates){if(!w.coast[i]||s.pol[i]===o.id||w.T[i]<0)continue;
    const host=s.pol[i]?s.pols[s.pol[i]]:null;if(host&&host.enemies.has(o.id))continue;
    let suitability=0;for(let k=0;k<CROPS.length;k++)suitability=Math.max(suitability,s.cropAccess[k][c]*cropSuitability(k,i));
    if(suitability<0.12&&w.rv[i]<0.3)continue;
    const water=0.2+w.rv[i]+w.waterPotential[i],room=clamp((s.K[i]-s.pop[i])/Math.max(1000,s.K[i]),-0.5,1);
    const harbor=1+0.2*Array.from({length:4},(_,d)=>w.nb[i*4+d]).filter(j=>j>=0&&!w.land[j]).length;
    const value=(suitability+water*0.2+room*0.2+s.node[i]*0.4)*harbor/(1+travelDays(c,i,true)*0.015+s.defensePact[i]+(host?0.4:0));if(value>score){score=value;best=i}
  }return best;
}
function launchExpedition(o,j,relation){
  const s=S,c=o.capital;if(!WD.coast[c]||!WD.coast[j]||s.sail[c]<0.35||o.kind!=='state')return null;
  const days=travelDays(c,j,true),space=(o.merchantFree||0)*50+(o.navyFree||0)*40;
  const n=Math.min(2000,s.pop[c]*0.12,space, (s.food[c]*0.15+publicAvailable(o,c)*0.25)/(1.6+days*0.003));if(n<250)return null;
  const cost=n*(1.6+days*0.003),homePaid=Math.min(s.food[c]*0.15,cost);s.food[c]-=homePaid;
  const paid=budgetAt(o,c,cost-homePaid);if(paid+homePaid<cost*0.999){s.food[c]+=homePaid+paid;return null}
  const prior=s.pop[c],ratio=n/prior,young=s.young[c]*ratio,animals=takeHerd(c,ratio),staff=Math.min(o.staff*0.08,n*0.012),escorts=Math.min(o.army*0.04,n*0.04);
  s.pop[c]-=n;s.young[c]-=young;o.staff-=staff;o.army-=escorts;
  const merchant=Math.min(o.merchantFree||0,n/50);o.merchantFree=Math.max(0,(o.merchantFree||0)-merchant);o.navyFree=Math.max(0,(o.navyFree||0)-Math.max(0,n-merchant*50)/40);
  const e={id:s.expeditions.length,home:c,parent:o.id,dest:j,eth:s.eth[c],ancestry:s.ancestry[c],pop:n,young,animals,staff,escorts,food:n*1.35,crops:s.cropAccess.map(a=>a[c]),tech:s.tk.map(a=>a[c]),immunity:diseaseHistory(c),arrival:s.year+Math.max(1,Math.ceil(days/365)),departed:s.year,days,relation:relation||null,done:false,returning:false};
  s.expeditions.push(e);o.lastFoundation=s.year;diseaseJourney(c,j,days,n,'sea');
  chron('migration',`An expedition of ${fmtK(n)} settlers leaves the ${o.full}, carrying provisions, crafts and civic traditions to an overseas site.`,c,[R_(o),RE(s.eths[e.eth])]);return e;
}
function colonyContact(i,parent){
  const s=S;s.portContact[i]=clamp(s.portContact[i]+0.35,0,1);s.societyCounters.colonialContacts++;
  for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j>=0&&WD.land[j]&&s.pop[j]>300){s.portContact[j]=clamp(s.portContact[j]+0.18,0,1);if(!s.pol[j])s.defensePact[j]=clamp(s.defensePact[j]+0.08,0,1)}}
  if(parent){parent.knownPorts=parent.knownPorts||new Set();parent.knownPorts.add(i)}
}
function landExpedition(e){
  const s=S,parent=s.pols[e.parent];let j=e.returning?e.home:e.dest;
  const eat=Math.min(e.food,e.pop*0.35);e.food-=eat;const mortality=clamp(0.005+0.025*(1-eat/Math.max(1,e.pop*0.35)),0,0.04);
  e.pop*=1-mortality;e.young*=1-mortality;e.staff*=1-mortality;e.escorts*=1-mortality;for(let k=0;k<e.animals.length;k++)e.animals[k]*=0.99;
  const host=s.pol[j]?s.pols[s.pol[j]]:null;
  const accepted=e.returning||(!host||!host.enemies.has(e.parent))&&(e.relation||s.pop[j]<500||s.r()<clamp(0.15+(host?host.rights*0.4:0.3)+(parent?parent.trust*0.2:0)-s.defensePact[j]*0.35,0.05,0.85));
  if(!accepted){if(!e.returning){e.returning=true;e.arrival=s.year+Math.max(1,Math.ceil(e.days/365));s.societyCounters.failedExpeditions++;return}j=e.home}
  const old=s.pop[j],empty=old<1;s.pop[j]+=e.pop;s.young[j]+=e.young;s.food[j]+=e.food;putHerd(j,e.animals);
  if(empty){s.eth[j]=e.eth;s.ancestry[j]=e.ancestry;s.eth2[j]=-1;s.mix[j]=0;s.organisation[j]=0.2}
  else{mergeCulture(j,e.eth,e.pop,old);mergeAncestry(j,e.ancestry,e.pop,old)}
  mixDiseaseHistory(j,e.immunity,e.pop,old);
  for(let k=0;k<CROPS.length;k++)s.cropAccess[k][j]=Math.max(s.cropAccess[k][j],e.crops[k]*0.8);
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],e.tech[k]*Math.min(0.8,e.pop/Math.max(1,s.pop[j])));
  s.newcomers[j]+=e.pop;s.settleLag[j]=Math.max(s.settleLag[j],empty?2:1);
  if(e.returning){if(parent&&parent.alive&&s.pol[j]===parent.id){parent.staff+=e.staff;parent.army+=e.escorts}}
  else{colonyContact(j,parent);
    const relation=host?'enclave':e.relation||(parent&&parent.alive&&transportAccess(e.home,parent)>0.5&&parent.cells>6&&parent.navy>2?'dependent':'independent');
    if(relation==='enclave'||old>e.pop*8&&s.organisation[j]>0.5){s.enclaves.push({parent:e.parent,cell:j,eth:e.eth,people:e.pop,born:s.year});s.societyCounters.tradingEnclaves++;chron('migration','Overseas settlers establish a trading enclave by agreement with local communities.',j,[RE(s.eths[e.eth])])}
    else{const id=newPolity(j,parent&&parent.alive?parent:null,{origin:{type:'colony',from:e.parent,relation,why:'An overseas civic foundation supported by actual settlers and an agreement over the site.'}}),o=s.pols[id];
      o.core=e.eth;o.staff=e.staff;o.army=e.escorts;o.rights=Math.max(0.5,o.rights);o.gov='Council';o.bureau*=0.7;o.central*=0.7;
      const reserve=Math.min(s.food[j]*0.2,e.pop*0.2);s.food[j]-=reserve;o.grain+=reserve;s.autonomy[j]=0.7;
      if(relation==='dependent'&&parent?.alive){o.over=parent.id;o.overY=s.year;parent.tribs++}
      if(parent?.alive){o.allies.push(parent.id);if(!parent.allies.includes(id))parent.allies.push(id)}
      if(s.city[j]<0){s.city[j]=s.cities.length;s.cities.push({cell:j,name:cityWord(langAt(j),s.r),born:s.year,eth:e.eth,peak:e.pop})}s.urban[j]=Math.max(s.urban[j],Math.min(s.pop[j]*0.4,e.pop*0.5));
      s.societyCounters.maritimeFoundations++;chron('rise',`Settlers establish the ${o.full} as ${relation==='dependent'?'a dependent overseas foundation':'an independent daughter city'}.`,j,[R_(o),...(parent?[R_(parent)]:[])]);
    }
  }
  e.done=true;e.food=0;e.animals=emptyHerd();e.result=e.returning?'returned':s.pol[j]?'settled':'enclave';
}

/* Communities can share a people without sharing a single migration decision.
   Resource use, movement and settlement always transfer existing cohorts. */
function initPeoples(){
  const s=S;s.rangeStock=new Float32Array(N).fill(1);s.campHome=new Int32Array(N).fill(-1);s.culturalIsolation=new Float32Array(N);
  s.cityDamage=new Float32Array(N);s.ruinedCity=new Int32Array(N).fill(-1);s.campMoves=[];
  Object.assign(s.societyCounters,{campMovements:0,scatteredSettlers:0,regionalPeoples:0,citySacks:0,citiesAbandoned:0,sackRefugees:0});
  // Regional branches retain linguistic relatives. Earth's original macro
  // anchors are naming scenarios, not ten homogeneous continental cultures.
  const candidates=WD.landIdx.filter(i=>s.pop[i]>500);let made=0;
  for(let tries=0;tries<500&&made<P.bands*2&&candidates.length;tries++){
    const i=candidates[(s.r()*candidates.length)|0],parent=s.eth[i];if(parent<0)continue;
    let count=0;ring(i,2,j=>{if(WD.land[j]&&s.eth[j]===parent)count++});if(count<7)continue;
    const child=newEth(parent);ring(i,2,(j,dx,dy)=>{if(WD.land[j]&&s.eth[j]===parent&&dx*dx+dy*dy<=5)s.eth[j]=child});made++;
  }
}
function moveCamp(i,j,n){
  const s=S,w=WD,owner=s.pol[j]?s.pols[s.pol[j]]:null,homeOwner=s.pol[i]?s.pols[s.pol[i]]:null;
  if(i===j||!w.land[j]||s.pop[i]<100||s.farm[i]>0.4||owner&&owner.kind==='state'||homeOwner&&homeOwner.kind==='state')return 0;
  if(owner&&homeOwner&&owner.id!==homeOwner.id)return 0;
  const room=Math.max(0,s.K[j]*(0.6+0.4*s.rangeStock[j])-s.pop[j]);n=Math.min(n,s.pop[i]*0.3,room*0.5,s.food[i]/0.2);if(n<30)return 0;
  const prior=s.pop[i],old=s.pop[j],ratio=n/prior,young=s.young[i]*ratio,food=s.food[i]*ratio,cost=n*0.035,animals=takeHerd(i,ratio),history=diseaseHistory(i);
  s.pop[i]-=n;s.young[i]-=young;s.food[i]-=food;s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-cost);putHerd(j,animals);
  const minority=s.eth2[i]>=0?s.mix[i]:0;let before=old;
  for(const [eth,share] of [[s.eth[i],1-minority],[s.eth2[i],minority]])if(eth>=0&&share>0){if(before<1){s.eth[j]=eth;s.eth2[j]=-1;s.mix[j]=0}else mergeCulture(j,eth,n*share,before);before+=n*share}
  mergeAncestry(j,s.ancestry[i],n,old);mixDiseaseHistory(j,history,n,old);transferCrops(i,j);
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][i]*Math.min(0.8,n/Math.max(1,s.pop[j])));
  const home=s.campHome[i]>=0?s.campHome[i]:i;if(old<n*4)s.campHome[j]=home;s.campMoves.push({from:i,to:j,eth:s.eth[i],pop:n,year:s.year,home});s.societyCounters.campMovements++;
  diseaseJourney(i,j,travelDays(i,j),n,'migration');return n;
}
function peoplesYear(){
  const s=S,w=WD;
  // Stage resource renewal before movement, and snapshot origins so a cohort
  // cannot hop repeatedly across an entire continent in one annual pass.
  const available=Float32Array.from(s.pop);
  for(const i of w.landIdx){const renewable=clamp(pastureCondition(i),0.1,1.4),use=s.pop[i]/Math.max(100,s.K[i]);
    s.rangeStock[i]=clamp(s.rangeStock[i]+0.14*renewable*(1-s.rangeStock[i])-0.065*use*(1-s.farm[i]),0.05,1);
    s.culturalIsolation[i]+=1;s.cityDamage[i]*=0.999;
    if(s.cityDamage[i]>0.02){const o=s.pol[i]?s.pols[s.pol[i]]:null,due=s.pop[i]*s.cityDamage[i]*0.003;
      const paid=o?budgetAt(o,i,due):Math.min(s.food[i]*0.01,due*s.organisation[i]);if(o)s.food[i]+=paid;else s.food[i]-=paid;
      s.cityDamage[i]=Math.max(0,s.cityDamage[i]-0.025*paid/Math.max(1,due)*(0.3+s.organisation[i]));
    }
  }
  for(const i of w.landIdx){if(available[i]<300||s.farm[i]>0.35||s.pol[i]&&s.pols[s.pol[i]].kind==='state'||s.r()>0.12*P.migration)continue;
    let best=-1,score=0;const pressure=s.pop[i]/Math.max(1,s.K[i]),depleted=1-s.rangeStock[i];if(depleted<0.2&&pressure<0.8)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||w.T[j]<-9)continue;
      const home=s.campHome[i]===j&&s.rangeStock[j]>0.65?0.25:0;
      const value=s.rangeStock[j]-s.rangeStock[i]+clamp((s.K[j]-s.pop[j])/Math.max(1,s.K[j]),-1,1)*0.25+home-w.rough[j]*0.15-frontierRisk(j)*0.25;
      if(value>score){score=value;best=j}
    }
    if(best>=0&&score>0.12)moveCamp(i,best,Math.min(available[i]*0.22,4000));
  }
  s.campMoves=s.campMoves.filter(m=>s.year-m.year<=12).slice(-600);
  if(s.year%20===0)regionalIdentityPass();
}
function localCulturalBranch(i,limit=12){
  const s=S,w=WD,parent=s.eth[i];if(parent<0)return null;
  const cells=[],queue=[i],seen=new Set(queue),owner=s.pol[i];
  for(let at=0;at<queue.length&&cells.length<limit;at++){const j=queue[at];if(s.eth[j]!==parent||s.pop[j]<100||s.pol[j]!==owner)continue;cells.push(j);
    for(let d=0;d<4;d++){const next=w.nb[j*4+d];if(next>=0&&w.land[next]&&!seen.has(next)&&angDist(i,next)<0.06){seen.add(next);queue.push(next)}}
  }
  if(cells.length<2||cells.reduce((n,j)=>n+s.pop[j],0)<3000)return null;
  const child=newEth(parent);for(const j of cells){s.eth[j]=child;s.culturalIsolation[j]=0} s.societyCounters.regionalPeoples++;
  chron('people',`Communities develop a distinct regional identity as the ${s.eths[child].name}, related to the ${s.eths[parent].name}.`,i,[RE(s.eths[child]),RE(s.eths[parent])]);return child;
}
function regionalIdentityPass(){
  const s=S,w=WD;if(s.eths.length>4000)return;let made=0;
  for(let t=0;t<120&&made<3;t++){const i=w.landIdx[(s.r()*w.landIdx.length)|0];if(s.pop[i]<1500||s.culturalIsolation[i]<100||s.eth[i]<0)continue;
    const o=s.pol[i]?s.pols[s.pol[i]]:null;if(o&&o.trust*o.comm*s.integ[i]>0.25)continue;
    const culture=s.eths[s.eth[i]],distance=angDist(i,nearestCultureCenter(culture,i));
    if(distance<0.035&&w.rough[i]<0.5&&s.campHome[i]<0)continue;
    if(s.r()<0.025*(1+w.rough[i])&&localCulturalBranch(i))made++;
  }
}
function nearestCultureCenter(e,fallback){return e.lon==null?fallback:cellAt((e.la||0)*180/Math.PI,e.lon*180/Math.PI)}
function scatterMigration(M,j,forced=false){
  const s=S;if(M.done||M.pop<1500||M.food<M.pop*0.3||s.pol[j]&&s.pol[j]!==M.pol&&!M.admission&&!(M.won&&M.won.has(j)))return 0;
  const room=Math.max(0,s.K[j]-s.pop[j]);if(room<300||!forced&&s.r()>0.08+0.12*clamp(room/Math.max(1,s.K[j]),0,1))return 0;
  const groups=M.groups.filter(g=>g.pop>100);if(!groups.length)return 0;
  const g=groups[(s.r()*groups.length)|0],n=Math.min(g.pop*0.25,M.pop*(0.04+s.r()*0.08),room*0.25);if(n<80)return 0;
  const old=s.pop[j],ratio=n/M.pop,food=M.food*ratio,young=M.young*ratio,animals=M.animals.map(v=>v*ratio);
  M.food-=food;M.young-=young;M.pop-=n;g.pop-=n;for(let k=0;k<M.animals.length;k++)M.animals[k]-=animals[k];
  s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-n*0.08);putHerd(j,animals);
  if(old<1){s.eth[j]=g.eth;s.eth2[j]=-1;s.mix[j]=0;s.ancestry[j]=g.ancestry;s.ancestry2[j]=-1;s.ancestryMix[j]=0;s.rel[j]=M.rel;s.organisation[j]=0.15}
  else{mergeCulture(j,g.eth,n,old);mergeAncestry(j,g.ancestry,n,old)}mixDiseaseHistory(j,M.immunity,n,old);
  if(M.crops)for(let k=0;k<CROPS.length;k++)s.cropAccess[k][j]=Math.max(s.cropAccess[k][j],M.crops[k]*0.6);
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],M.techs[k]*Math.min(0.6,n/Math.max(1,s.pop[j])));
  s.newcomers[j]+=n;if(M.farm>0.4)s.settleLag[j]=1;
  M.settled=M.settled||[];M.settled.push({cell:j,eth:g.eth,pop:n,year:s.year});s.societyCounters.scatteredSettlers+=n;return n;
}
function sackSettlement(attacker,j,force,forced=false){
  const s=S,urban=s.urban[j],target=s.pol[j]?s.pols[s.pol[j]]:null;
  if(!forced&&cityWallStrength(j)>0.3)return false;
  if(attacker.kind!=='horde'||urban<500||force<100||target&&protectedByTreaty(target,attacker))return false;
  const aggression=attacker.ruler?attacker.ruler.aggr:0.5,preserve=attacker.installTarget&&target&&attacker.installTarget===target.id;
  const resistance=s.unrest[j]+wallStrength(j),chance=(0.015+0.065*aggression+0.045*resistance+0.04*(attacker.hunger||0))*(preserve?0.25:1);
  if(!forced&&s.r()>chance)return false;
  const severity=forced?0.9:clamp(0.15+0.25*aggression+force/Math.max(1,s.pop[j])*0.2,0.15,0.65);
  s.housing[j]*=1-severity*0.6;s.urbanWater[j]*=1-severity*0.5;s.sanitation[j]*=1-severity*0.5;
  s.cityWallHealth[j]*=1-severity*0.5;s.granaries[j]*=1-severity*0.4;s.militaryEquipment[j]*=1-severity*0.5;
  s.cityDamage[j]=clamp(s.cityDamage[j]+severity,0,1);s.raidDamage[j]=clamp(s.raidDamage[j]+severity*0.4,0,1);
  s.food[j]*=1-severity*0.15;s.workshops[j]*=1-severity*0.55;s.infrastructure[j]*=1-severity*0.5;s.organisation[j]*=1-severity*0.25;
  const killed=Math.min(s.pop[j]*0.04,urban*severity*0.06),prior=s.pop[j];s.pop[j]-=killed;s.young[j]*=1-killed/Math.max(1,prior);
  const refugees=displacedPeople(j,Math.min(0.45,(urban*severity*0.7+s.pop[j]*severity*0.08)/Math.max(1,s.pop[j])),attacker.id||0);s.societyCounters.sackRefugees+=refugees;
  s.urban[j]*=Math.pow(1-s.cityDamage[j],2);s.societyCounters.citySacks++;
  const city=s.city[j]>=0?s.cities[s.city[j]]:null,refs=attacker.migration?[RM(attacker.migration)]:[R_(attacker)];
  if(s.cityDamage[j]>0.8&&s.urban[j]<800){if(city){city.abandoned=true;city.abandonedYear=s.year;s.ruinedCity[j]=s.city[j];s.city[j]=-1}s.urban[j]=0;s.societyCounters.citiesAbandoned++}
  chron('war',`${city?city.name:'A settlement'} is devastated by the ${attacker.full}; ${fmtK(refugees)} survivors flee.`,j,refs,'Housing, stores, workshops and administration are damaged. Rural survivors remain, and rebuilding requires sustained resources.');
  if(target&&target.capital===j&&s.cityDamage[j]>0.8){if(target.health<0.3&&target.payroll<0.5)shatterGovernment(target,j);
    else{const options=polCells(target.id).filter(i=>i!==j&&s.cityDamage[i]<0.6);options.sort((a,b)=>s.urban[b]-s.urban[a]);if(options.length){s.depot[j]+=target.grain;target.grain=0;target.capital=options[0];target.shock+=0.15}}}
  return true;
}

/* Food-denominated civic credit is a claim on existing resources, not a money
   creation system. Urban networks support specialization but compete for food. */
function initUrbanism(){
  const s=S;s.urbanNetwork=new Float32Array(N);s.urbanViability=new Float32Array(N);s.foodImports=new Float64Array(N);s.creditLoans=[];
  Object.assign(s.societyCounters,{civicLoans:0,civicDefaults:0,debtProtectorates:0,unsupportedDissolutions:0});
}
function urbanNetworkPass(){
  const s=S,next=new Float32Array(N);
  for(const e of s.tradeEdges){const ua=s.urban[e.a],ub=s.urban[e.b];
    const traffic=(e.privateUsed||0)+(e.freightUsed||0),infrastructure=Math.min(s.infrastructure[e.a],s.infrastructure[e.b]);
    const contact=clamp(traffic/Math.max(100,Math.min(s.pop[e.a],s.pop[e.b])*0.02)+Math.min(s.node[e.a],s.node[e.b])*infrastructure*0.3,0,1);
    const a=s.pol[e.a]?s.pols[s.pol[e.a]]:null,b=s.pol[e.b]?s.pols[s.pol[e.b]]:null;if(a&&b&&a.enemies.has(b.id))continue;
    if(ua>1500)next[e.b]+=clamp(ua/20000,0,1)*contact/(1+e.cost*3);
    if(ub>1500)next[e.a]+=clamp(ub/20000,0,1)*contact/(1+e.cost*3);
  }
  for(const i of WD.landIdx)s.urbanNetwork[i]=clamp(next[i],0,1);
}
function citySubsistence(i){
  const s=S,w=WD,p=Math.max(1,s.pop[i]);
  // Imported grain is counted only after an actual, finite delivery.
  const food=clamp((s.harvest[i]+s.foodImports[i]*0.6)/p,0,1.5),agriculture=s.farm[i]*farmSuit(i);
  const imports=clamp(s.foodImports[i]/p*3,0,1),stocks=clamp(s.food[i]/p,0,0.5);
  const cold=clamp((-5-(w.T[i]-w.amp[i]*0.5))/25,0,1),buffer=0.5*skill(i,'storage')+imports*0.5;
  return clamp((0.4*food+0.3*agriculture+0.25*imports+0.1*s.urbanNetwork[i]+0.1*stocks)*(1-0.35*cold*(1-buffer))*(1-0.6*s.cityDamage[i]),0,1);
}
function urbanShare(i,o){
  const s=S,p=Math.max(1,s.pop[i]),viability=citySubsistence(i);s.urbanViability[i]=viability;
  const jobs=0.025+s.organisation[i]*0.08+s.node[i]*0.1+s.urbanNetwork[i]*0.11+(o?o.bureau*0.05:0);
  const competition=1+0.5*s.urbanNetwork[i]*clamp(s.urban[i]/p*4,0,1);
  return clamp(jobs*viability/competition+s.foodImports[i]/p*0.5,0,0.4);
}
function issueCivicLoan(borrower,lender,amount,term=8,rate=0.04){
  const s=S;if(!borrower.alive||borrower.kind!=='state'||amount<20||s.creditLoans.filter(l=>!l.done&&l.borrower===borrower.id).length>=2)return null;
  let paid=0,source=borrower.capital;
  if(lender){if(!lender.alive||lender.enemies.has(borrower.id)||lender.grain<amount*2)return null;source=lender.capital;paid=budgetPay(lender,amount)}
  else{const surplus=Math.max(0,s.food[source]-s.pop[source]*0.3);paid=Math.min(amount,surplus*0.2);s.food[source]-=paid}
  if(paid<20){if(lender)lender.grain+=paid;else s.food[source]+=paid;return null}
  const travel=lender?Math.max(1,Math.ceil(travelDays(source,borrower.capital,!!(WD.coast[source]&&WD.coast[borrower.capital]))/365)):0;
  if(lender)s.publicShipments.push({from:lender.id,to:borrower.id,dest:borrower.capital,food:paid,created:s.year,years:travel,kind:'credit'});else depositPublic(borrower,source,paid);
  const loan={borrower:borrower.id,lender:lender?lender.id:0,creditorCell:source,original:paid,principal:paid,rate,term,due:s.year+travel+1,misses:0,defaulted:false,done:false};
  s.creditLoans.push(loan);s.societyCounters.civicLoans++;return loan;
}
function serviceCivicLoan(loan){
  const s=S,o=s.pols[loan.borrower];if(loan.done||s.year<loan.due)return;
  if(!o||!o.alive){loan.done=true;loan.writtenOff=loan.principal;return}
  const lender=loan.lender?s.pols[loan.lender]:null,duePrincipal=Math.min(loan.principal,loan.original/loan.term),interest=loan.principal*loan.rate;
  const paid=budgetAt(o,o.capital,duePrincipal+interest);
  if(lender&&lender.alive&&paid>0)s.publicShipments.push({from:o.id,to:lender.id,dest:lender.capital,food:paid,created:s.year,years:Math.max(1,Math.ceil(travelDays(o.capital,lender.capital)/365)),kind:'credit'});
  else s.food[loan.creditorCell]+=paid;
  const principalPaid=Math.min(duePrincipal,Math.max(0,paid-interest));loan.principal=Math.max(0,loan.principal-principalPaid);loan.due++;
  if(paid<(duePrincipal+interest)*0.8)loan.misses++;else loan.misses=Math.max(0,loan.misses-1);
  if(loan.misses>=3&&!loan.defaulted){loan.defaulted=true;o.creditDefault=s.year;o.creditTrust=Math.max(0.05,(o.creditTrust||0.7)-0.35);o.shock+=0.08;o.trust=Math.max(0.05,o.trust-0.04);s.societyCounters.civicDefaults++;
    chron('diplomacy',`The ${o.full} defaults on civic borrowing after repeated missed payments.`,o.capital,[R_(o),...(lender?[R_(lender)]:[])],'Creditors may negotiate, withhold further credit or seek political concessions. Default does not automatically cause annexation.');
  }
  if(loan.principal<0.01){loan.done=true;o.creditTrust=clamp((o.creditTrust||0.7)+0.08,0,1)}
}
function acceptDebtProtector(client,patron){
  const s=S;if(!client.alive||!patron.alive||client.over||client.enemies.has(patron.id)||power(patron)<power(client)*1.3||patron.health*patron.payroll<0.4)return false;
  const debts=s.creditLoans.filter(l=>!l.done&&l.borrower===client.id),external=debts.filter(l=>l.lender!==patron.id);
  const cost=external.reduce((n,l)=>n+l.principal,0)+Math.max(50,client.pop*0.01);if(patron.grain<cost*1.5)return false;
  for(const l of debts){if(l.lender===patron.id){l.done=true;l.writtenOff=l.principal;l.principal=0;continue}
    const paid=budgetPay(patron,l.principal),creditor=s.pols[l.lender];if(creditor?.alive)s.publicShipments.push({from:patron.id,to:creditor.id,dest:creditor.capital,food:paid,created:s.year,years:1,kind:'credit'});else s.food[l.creditorCell]+=paid;l.done=true;l.principal=0;
  }
  tributeShipment(patron,client,Math.max(50,client.pop*0.01));client.over=patron.id;client.overY=s.year;patron.tribs++;client.creditDefault=-100000;client.shock+=0.04;
  s.societyCounters.debtProtectorates++;chron('diplomacy',`The ${client.full} accepts the protection of the ${patron.full} in exchange for relief from its debts.`,client.capital,[R_(client),R_(patron)]);return true;
}
function urbanYear(){
  const s=S;if(s.year%10===0)urbanNetworkPass();urbanPopulationYear();for(const l of s.creditLoans)serviceCivicLoan(l);
  for(const id of [...s.alive]){const o=s.pols[id];if(o.kind!=='state')continue;const c=o.capital;
    o.creditTrust=o.creditTrust==null?0.7:o.creditTrust;o.creditTrust=clamp(o.creditTrust+0.002*(0.8-o.creditTrust),0,1);
    const viability=citySubsistence(c);s.urbanViability[c]=viability;o.viability=viability;
    const unsupported=o.cells<=6&&viability<0.28&&o.payroll<0.6;o.unsupportedYears=unsupported?(o.unsupportedYears||0)+1:Math.max(0,(o.unsupportedYears||0)-2);
    if(unsupported){o.strain=clamp(o.strain+0.003,0,1);o.health=Math.max(0.02,o.health-0.002);o.groups.nobles.loyalty=Math.max(0.05,o.groups.nobles.loyalty-0.002)}
    if(o.unsupportedYears>35&&o.health<0.35&&o.payroll<0.4&&s.r()<0.04){s.societyCounters.unsupportedDissolutions++;shatterGovernment(o,c,'Unsustained collections, food supply and civic services dissolve the government; the remaining communities govern themselves.');continue}
    const shortfall=(o.fiscalDue||0)-(o.collected||0),credible=o.creditTrust>0.4&&o.health>0.45&&viability>0.35;
    if(shortfall>100&&credible&&o.grain<shortfall&&s.year%5===0&&s.r()<0.25){
      if(!issueCivicLoan(o,null,Math.min(shortfall*2,o.pop*0.04)))for(const [q] of o.nb){const p=s.pols[q];if(p?.kind==='state'&&p.alive&&p.grain>shortfall*6&&!p.enemies.has(id)&&issueCivicLoan(o,p,Math.min(shortfall*2,o.pop*0.05)))break}
    }
    if(s.year-(o.creditDefault??-100000)<30&&o.cells<=6&&o.health<0.6&&!o.over&&s.r()<0.015*(1-o.ruler.aggr)){
      for(const [q] of o.nb){const patron=s.pols[q];if(patron?.kind==='state'&&acceptDebtProtector(o,patron))break}
    }
  }
  if(s.year%50===0)s.creditLoans=s.creditLoans.filter(l=>!l.done||l.defaulted);
}

/* Urban defenses, rural agreements and practical innovation. All numeric rates
   are experimental scenario parameters, not reconstructed historical laws. */
function initCivic(){
  const s=S;
  for(const k of ['cityWall','cityWallHealth','engineeringKnowledge','engineeringPractice','granaries','civicLabor','militaryEquipment','martialPractice','commercialPractice','ruralInfluence','ruralSecurity','siegeProgress'])s[k]=new Float32Array(N);
  s.cityWallHealth.fill(1);s.ruralPatron=new Int32Array(N);s.ruralYears=new Uint16Array(N);
  s.siegeOwner=new Int32Array(N);s.siegeYear=new Int32Array(N).fill(-100000);s.cityProjects=new Map();
  Object.assign(s.societyCounters,{ruralAgreements:0,ruralIncorporations:0,civicUnions:0,brokenCivicBargains:0,civicWorks:0,urbanResearch:0,confederationBreakups:0,scatteredClans:0,clansReceivedByCities:0,clansJoiningConfederations:0});
  initDevelopment();
}
function civicSpend(i,o,due){
  const s=S,p=s.pop[i],room=Math.max(0,0.1-s.civicLabor[i])*p/3;
  due=Math.min(Math.max(0,due),room);if(due<=0)return 0;
  const paid=o?budgetAt(o,i,due):Math.min(due,Math.max(0,s.food[i]-p*0.25)*0.06*s.organisation[i]);
  // Public wages return to the same resident households; materials are consumed.
  if(o)s.food[i]+=paid*0.75;else s.food[i]-=paid;
  s.civicLabor[i]=clamp(s.civicLabor[i]+paid/Math.max(1,p)*3,0,0.1);s.societyCounters.civicWorks+=paid;return paid;
}
function cityWallStrength(i){
  return S.cityWall[i]*S.cityWallHealth[i]*(0.35+0.65*S.engineeringKnowledge[i]);
}
function settlementDefense(i){
  return Math.max(wallStrength(i),cityWallStrength(i)*clamp(S.urban[i]/Math.max(1,S.pop[i])*4,0,1));
}
function armsAccess(i){return clamp(S.militaryEquipment[i]/Math.max(25,S.pop[i]*0.012),0,1)}
function civicThreat(i,o){
  let pressure=frontierRisk(i)+S.raidDamage[i];
  for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j<0)continue;const q=S.pol[j];
    if(q&&o&&q!==o.id&&(o.enemies.has(q)||S.pols[q]?.kind==='horde'))pressure+=0.25;
    else if(q&&o&&q!==o.id&&!o.allies.includes(q))pressure+=0.035;
  }return clamp(pressure,0,1);
}
function civicWorksAt(i,o){
  const s=S,p=s.pop[i],urban=Math.min(p,s.urban[i]);if(p<100)return;
  s.engineeringPractice[i]*=0.999;s.martialPractice[i]*=0.995;s.commercialPractice[i]*=0.998;
  s.engineeringKnowledge[i]=Math.max(s.engineeringKnowledge[i]*0.9995,clamp(Math.log1p(s.engineeringPractice[i])/11,0,1));
  const threat=civicThreat(i,o),materials=0.65+0.35*Math.max(s.forest[i],WD.rough[i]);
  if(s.cityWall[i]>0.001){
    const due=(Math.sqrt(Math.max(100,urban))*0.15+urban*0.0005)*s.cityWall[i]/materials,paid=civicSpend(i,o,due),met=paid/Math.max(1,due);
    s.cityWallHealth[i]=clamp(s.cityWallHealth[i]+0.025*met-0.012-0.045*(1-met)-s.raidDamage[i]*0.015,0,1);
    s.engineeringPractice[i]+=paid*0.15;if(s.cityWallHealth[i]<0.05)s.cityWall[i]*=0.99;
  }
  // An isolated first city has no automatic wall. Nearby conflict, raiding and
  // rival centers create demand; a cheap circuit can precede skilled masonry.
  if(urban>1000&&threat>0.04&&P.fortify>0){
    const due=urban*0.006*(0.6+threat)/materials,paid=civicSpend(i,o,due),met=paid/Math.max(1,due);
    s.cityWall[i]=clamp(s.cityWall[i]+0.022*met*(0.2+0.8*s.organisation[i])*Math.min(2,P.fortify),0,1);
    s.engineeringPractice[i]+=paid*(0.4+threat);s.cityWallHealth[i]=clamp(s.cityWallHealth[i]+0.01*met,0,1);
  }
  const reserve=o?publicAvailable(o,i):0,storageDemand=clamp((s.food[i]+reserve)/Math.max(1,p)-0.15+threat*0.4,0,1);
  const granaryDue=p*0.003*(s.granaries[i]+storageDemand*(1-s.granaries[i]));
  const invested=skill(i,'storage')>0.2?civicSpend(i,o,granaryDue):0;
  s.granaries[i]=clamp(s.granaries[i]*0.995+0.016*invested/Math.max(1,granaryDue)*skill(i,'storage')*storageDemand,0,1);
  // Working equipment is separate from knowing metallurgy. Workshops consume
  // provisions; preparation and finite armies still determine its military use.
  s.militaryEquipment[i]*=0.92;
  if(s.metal[i]>0.3&&s.workshops[i]>0.02){
    const replacement=clamp((p*0.015-s.militaryEquipment[i])/Math.max(1,p*0.015),0,1);
    const due=p*0.003*s.workshops[i]*replacement,paid=civicSpend(i,o,due);
    s.militaryEquipment[i]+=paid*0.6*(0.4+0.6*s.metal[i])*(1-s.sickness[i]);
  }
  s.commercialPractice[i]+=Math.min(10,(s.foodImports[i]+s.flow[i]*0.15)/Math.max(100,p))*s.node[i];
  if(s.siegeOwner[i]&&s.year-s.siegeYear[i]>1){s.siegeProgress[i]*=0.65;if(s.siegeProgress[i]<0.01){s.siegeOwner[i]=0;s.siegeProgress[i]=0}}
}
function shareEngineering(){
  const s=S,delta=new Float32Array(N);
  const contact=(i,j,rate)=>{const a=s.pol[i]?s.pols[s.pol[i]]:null,b=s.pol[j]?s.pols[s.pol[j]]:null;
    if(a&&b&&a.enemies.has(b.id)||s.pop[j]<100||s.organisation[j]<0.1)return;
    delta[j]=Math.max(delta[j],Math.max(0,s.engineeringKnowledge[i]-s.engineeringKnowledge[j])*rate);
  };
  for(const i of WD.landIdx)if(s.pop[i]>100)for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j>=0&&WD.land[j])contact(i,j,0.02*Math.min(s.infrastructure[i],s.infrastructure[j]))}
  for(const e of s.tradeEdges)if((e.privateUsed||0)+(e.freightUsed||0)>1){contact(e.a,e.b,0.035);contact(e.b,e.a,0.035)}
  for(const i of WD.landIdx)s.engineeringKnowledge[i]=clamp(s.engineeringKnowledge[i]+delta[i],0,1);
}
function ruralProtection(o,i,j){
  const s=S,travel=routeCost(i,j,o,false),reach=Math.exp(-travel/Math.max(3,o.h*1.5+3+s.infrastructure[i]*5));
  const reserves=clamp(publicAvailable(o,i)/Math.max(50,s.pop[i]*0.04),0,1);
  const troops=clamp(Math.max(0,o.army-(o.loanedTroops||0))/Math.max(200,o.pop*0.015+o.cells*40),0,1);
  const patrol=o.preparedness*o.payroll*troops*reserves,cooperation=s.organisation[i]*o.trust*o.payroll*reserves;
  // City walls offer a nearby refuge, not a shield over the entire countryside.
  return clamp(reach*(0.1+0.5*patrol+0.3*cooperation+0.15*s.ruralInfluence[j]+0.08*cityWallStrength(i)+0.13*wallStrength(j))*(1-frontierRisk(j)*0.8)*(1-WD.rangeExposure[j]*pastoralMobility(j)*0.65),0,1);
}
function incorporateHinterland(o,i,j){
  const s=S;if(s.pol[j]||s.urban[j]>1200||s.ruralPatron[j]!==o.id||s.ruralInfluence[j]<0.8||s.ruralYears[j]<50||ruralProtection(o,i,j)<0.3)return false;
  const personnelNeed=(o.cells+1)*6+(o.pop+s.pop[j])*0.0006;
  if(o.staff<personnelNeed||Math.max(0,o.army-(o.loanedTroops||0))<Math.max(40,o.pop*0.0015)||publicAvailable(o,i)<s.pop[j]*0.015||o.rights<0.4||o.health<0.65)return false;
  const paid=civicSpend(i,o,s.pop[j]*0.02);if(paid<s.pop[j]*0.019)return false;
  conquestRecorded(o,j,0);s.pol[j]=o.id;s.integ[j]=0.45;s.autonomy[j]=0.75;
  s.dist[j]=Math.min(65534,s.dist[i]+Math.round(routeCost(i,j,o,false)*2));
  o.cells++;o.pop+=s.pop[j];let realm=s.realmCells.get(o.id);if(realm&&!realm.includes(j))realm.push(j);
  o.civicBargains=o.civicBargains||[];o.civicBargains.push({cell:j,rights:o.rights,since:s.year,failures:0});
  s.societyCounters.ruralIncorporations++;
  chron('diplomacy',`Rural communities accept the protection and jurisdiction of the ${o.full}, retaining local land rights and leaders.`,j,[R_(o)],'Decades of provision and protection precede incorporation; residents, cultures and ancestry stay in place.');return true;
}
function ruralAgreements(){
  const s=S,visited=new Set();for(const i of WD.landIdx){if(s.urban[i]<300||s.organisation[i]<0.35)continue;const o=s.pol[i]?s.pols[s.pol[i]]:null;if(!o?.alive||o.kind!=='state'||o.health<0.5||o.rights<0.3||o.staff<12)continue;
    for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j<0||visited.has(j)||!WD.land[j]||s.pol[j]||s.pop[j]<200||s.urban[j]>1200||s.farm[j]*farmSuit(j)<0.1)continue;
      const security=ruralProtection(o,i,j);if(security<0.2)continue;
      const prior=s.ruralPatron[j],incumbent=s.ruralInfluence[j];
      if(prior&&prior!==o.id&&security<s.ruralSecurity[j]+0.12)continue;
      const due=3+s.pop[j]*0.0005,paid=civicSpend(i,o,due);if(paid<due*0.9)continue;visited.add(j);
      if(prior!==o.id){s.ruralPatron[j]=o.id;s.ruralInfluence[j]=incumbent*0.2;s.ruralYears[j]=0;s.societyCounters.ruralAgreements++;s.societyCounters.customaryAgreements++}
      s.ruralSecurity[j]=security;s.ruralYears[j]=Math.min(65535,s.ruralYears[j]+5);
      const appeal=(0.25+0.75*o.trust)*(0.4+0.6*security)*(1-0.5*s.defensePact[j]*s.organisation[j]);
      s.ruralInfluence[j]=clamp(s.ruralInfluence[j]+0.08*appeal,0,1);
      if(P.allyRate>0&&s.r()<Math.min(0.6,0.1*P.allyRate))incorporateHinterland(o,i,j);
    }
  }
}
function civicUnionTerms(client,patron){
  if(!client?.alive||!patron?.alive||client.kind!=='state'||patron.kind!=='state'||client.enemies.has(patron.id)||client.cells>8)return false;
  const near=angDist(client.capital,patron.capital)<0.1||client.nb.has(patron.id);
  return near&&patron.rights>=0.45&&patron.trust>=0.6&&patron.health>=0.65&&patron.payroll>=0.8&&client.trust>=0.4;
}
function integrateCivicPolity(client,patron){
  const s=S,u=client.civicUnion;if(!u||u.progress<1||u.years<80||!civicUnionTerms(client,patron)||patron.staff<(patron.pop+client.pop)*0.0013+(patron.cells+client.cells)*10)return false;
  if(publicAvailable(patron,patron.capital)<client.pop*0.06)return false;
  const cost=budgetAt(patron,patron.capital,client.pop*0.04);s.food[client.capital]+=cost;
  endForeignServiceOf(client);depositPublic(patron,client.capital,client.grain);client.grain=0;
  patron.staff+=client.staff;patron.army+=client.army;patron.navy+=client.navy;client.staff=client.army=client.navy=0;
  patron.compacts.push(...client.compacts);client.compacts=[];
  for(const loan of s.creditLoans){if(loan.borrower===client.id)loan.borrower=patron.id;if(loan.lender===client.id)loan.lender=patron.id;if(loan.lender===loan.borrower)loan.done=true}
  for(const shipment of s.publicShipments){if(shipment.to===client.id)shipment.to=patron.id;if(shipment.from===client.id)shipment.from=patron.id}
  const cells=polCells(client.id);patron.civicBargains=patron.civicBargains||[];
  for(const j of cells){conquestRecorded(patron,j,client.id);s.pol[j]=patron.id;s.integ[j]=Math.max(0.5,s.integ[j]*0.8);s.autonomy[j]=Math.max(0.65,s.autonomy[j]);patron.civicBargains.push({cell:j,rights:u.rights,since:s.year,failures:0})}
  patron.cells+=cells.length;patron.pop+=client.pop;patron.tribs=Math.max(0,patron.tribs-1);
  client.alive=false;client.died=s.year;client.succ=[patron.id];client.lastBy=patron.id;client.unionWith=patron.id;
  for(const [q] of client.enemies)s.pols[q]?.enemies.delete(client.id);client.enemies.clear();
  for(const q of client.allies){const other=s.pols[q];if(other)other.allies=other.allies.filter(id=>id!==client.id)}
  s.alive=s.alive.filter(id=>id!==client.id);s.fallen.push(client);s.societyCounters.civicUnions++;
  chron('diplomacy',`The ${client.full} joins the ${patron.full} under a negotiated charter protecting its council and land rights.`,client.capital,[R_(client),R_(patron)],'Shared government follows sustained support and agreement. Local cultural identities persist.');return true;
}
function civicUnionStep(client){
  const s=S,patron=client.over?s.pols[client.over]:null;if(!patron||client.kind!=='state'){client.civicUnion=null;return}
  let u=client.civicUnion;if(!u||u.patron!==patron.id)u=client.civicUnion={patron:patron.id,progress:0,years:0,rights:Math.max(0.55,patron.rights),failures:0};
  if(!civicUnionTerms(client,patron)||patron.rights<u.rights-0.08){u.progress=Math.max(0,u.progress-0.025);u.failures++;return}
  const due=Math.max(10,client.pop*0.002),paid=tributeShipment(patron,client,due);
  if(paid<due*0.9){u.progress=Math.max(0,u.progress-0.02);u.failures++;return}
  u.years++;u.failures=Math.max(0,u.failures-1);
  const civic=S.cityIdentity[client.capital],need=clamp((1-client.health)*0.6+frontierRisk(client.capital)+client.enemies.size*0.15,0,1);
  const connection=clamp(S.node[client.capital]+S.urbanNetwork[client.capital],0,1);
  u.progress=clamp(u.progress+0.006*(0.4+connection+need)*(1-0.65*civic),0,1);
  if(u.progress>=1&&P.allyRate>0&&s.r()<0.025*P.allyRate)integrateCivicPolity(client,patron);
}
function offerCivicProtection(client){
  const s=S;if(client.over||client.cells>6||s.urban[client.capital]<1500)return;
  const need=clamp(frontierRisk(client.capital)+(1-client.health)*0.6+client.enemies.size*0.15+s.urbanNetwork[client.capital]*0.15,0,1);
  if(need<0.1||s.r()>0.012*need*P.allyRate)return;
  for(const id of client.allies){const patron=s.pols[id];if(!civicUnionTerms(client,patron)||power(patron)<power(client)*1.3||patron.over)continue;
    client.over=id;client.overY=s.year;client.league=true;patron.tribs++;
    chron('diplomacy',`The ${client.full} enters a protection league with the ${patron.full}, reserving its council and local laws.`,client.capital,[R_(client),R_(patron)]);break;
  }
}
function maintainCivicBargains(o){
  const s=S;for(const b of o.civicBargains||[]){if(s.pol[b.cell]!==o.id)continue;
    const broken=o.rights<b.rights-0.12||o.health*o.payroll<0.35||s.nutrition[b.cell]<0.6;
    b.failures=broken?b.failures+1:Math.max(0,b.failures-2);
    if(broken){s.unrest[b.cell]=clamp(s.unrest[b.cell]+0.006,0,1);s.eliteLoyalty[b.cell]*=0.995}
    if(b.failures>=15&&!b.protested){b.protested=true;s.societyCounters.brokenCivicBargains++;chron('diplomacy',`Communities within the ${o.full} withhold cooperation after their charter promises fail.`,b.cell,[R_(o)])}
  }
}
function besiegeCity(o,from,j,force){
  const s=S,strength=cityWallStrength(j);if(strength<0.3||s.urban[j]<1000)return true;
  if(s.siegeOwner[j]!==o.id){s.siegeOwner[j]=o.id;s.siegeProgress[j]=0}
  if(s.siegeYear[j]===s.year)return s.siegeProgress[j]>=1;
  const due=Math.max(20,force*0.025);if(publicAvailable(o,from)<due)return false;
  budgetAt(o,from,due);s.siegeYear[j]=s.year;
  const supplies=clamp((s.food[j]+s.depot[j]+(s.pol[j]&&s.pols[s.pol[j]].capital===j?s.pols[s.pol[j]].grain:0))/Math.max(1,s.pop[j]),0,1);
  s.siegeProgress[j]=clamp(s.siegeProgress[j]+(0.09+0.15*s.engineeringKnowledge[from]+0.22*gunEffect(from)+0.15*(1-supplies))/(0.5+strength),0,1);
  s.engineeringPractice[from]+=due*0.3;s.engineeringPractice[j]+=due*0.1;s.raidDamage[j]=clamp(s.raidDamage[j]+0.015,0,1);
  if(s.siegeProgress[j]<1)return false;
  s.cityWallHealth[j]*=0.3;s.engineeringKnowledge[from]=Math.max(s.engineeringKnowledge[from],s.engineeringKnowledge[j]*0.5);
  s.siegeOwner[j]=0;s.siegeProgress[j]=0;return true;
}
function civicTradeAccess(i,j){return (S.siegeOwner[i]&&S.year-S.siegeYear[i]<=1||S.siegeOwner[j]&&S.year-S.siegeYear[j]<=1)?0.35:1}
function civicYear(){
  const s=S;s.civicLabor.fill(0);consolidationYear();
  for(const i of WD.landIdx){s.ruralInfluence[i]*=0.998;s.ruralSecurity[i]*=0.97;const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(s.ruralPatron[i]&&!s.pols[s.ruralPatron[i]]?.alive){s.ruralPatron[i]=0;s.ruralYears[i]=0}
    civicWorksAt(i,o);urbanConstruction(i,o);
  }
  if(s.year%5===0){shareEngineering();ruralAgreements()}
  for(const id of [...s.alive]){const o=s.pols[id];if(o.kind!=='state')continue;if(s.year%5===0)offerCivicProtection(o);civicUnionStep(o);if(o.alive){maintainCivicBargains(o);inventionPass(o)}}
}
function confederationBreakupRisk(o,fair=0){
  const generations=Math.max(0,(S.year-o.born-25)/30),agePressure=1-Math.exp(-generations*0.65);
  let loyalty=0;for(const t of o.clanTerms.values())loyalty+=t.loyalty;loyalty/=Math.max(1,o.clanTerms.size);
  const continuity=clamp(o.succession*0.35+o.trust*0.15+loyalty*0.2+fair*0.15+o.patronage*0.65+o.momentum*0.1+o.sharedThreat*0.1,0,1);
  const disputes=clamp(o.coalitionFatigue*0.4+(1-loyalty)*0.3+o.hunger*0.35+o.shock*0.3+o.strain*0.2,0,1);
  return clamp((0.015+agePressure*0.38)*disputes*(1-continuity)*(1-continuity),0,0.45);
}
function scatterClanHouseholds(i,j,requested){
  const s=S,old=s.pop[j],prior=s.pop[i],n=Math.min(requested,prior*0.3,Math.max(0,s.K[j]-old)*0.2,s.food[i]/0.25);if(n<30)return 0;
  const ratio=n/prior,food=s.food[i]*ratio,young=s.young[i]*ratio,animals=takeHerd(i,ratio),minority=s.eth2[i]>=0?s.mix[i]:0,history=diseaseHistory(i);
  s.pop[i]-=n;s.young[i]-=young;s.food[i]-=food;s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-n*0.06);putHerd(j,animals);
  let before=old;for(const [eth,share] of [[s.eth[i],1-minority],[s.eth2[i],minority]])if(eth>=0&&share>0){if(before<1){s.eth[j]=eth;s.eth2[j]=-1;s.mix[j]=0}else mergeCulture(j,eth,n*share,before);before+=n*share}
  mergeAncestry(j,s.ancestry[i],n,old);mixDiseaseHistory(j,history,n,old);transferCrops(i,j);
  s.newcomers[j]+=n;s.settleLag[j]=Math.max(1,s.settleLag[j]);diseaseJourney(i,j,travelDays(i,j),n,'migration');
  s.campMoves.push({from:i,to:j,eth:s.eth[i],pop:n,year:s.year,home:i,cause:'coalition breakup'});s.societyCounters.scatteredClans+=n;return n;
}
function dissolveConfederation(o,reason='Succession disputes and failed rewards dissolve the coalition.'){
  const s=S;if(!o.alive||o.kind!=='horde')return false;const cells=polCells(o.id),total=cells.reduce((n,i)=>n+s.pop[i],0),army=o.army;
  endForeignServiceOf(o);const recipients=new Set();
  for(const i of cells){s.pol[i]=0;s.autonomy[i]=0.9;s.integ[i]*=0.4;s.food[i]+=s.depot[i];s.depot[i]=0}
  s.food[o.capital]+=o.grain;o.grain=0;
  for(const i of cells){if(s.pop[i]<200)continue;
    const queue=[[i,0]],seen=new Set([i]),destinations=[];
    for(let at=0;at<queue.length&&at<45;at++){const [j,depth]=queue[at];if(depth>=3)continue;
      for(let d=0;d<4;d++){const next=WD.nb[j*4+d];if(next<0||!WD.land[next]||seen.has(next)||WD.rough[next]>0.85)continue;seen.add(next);
        const host=s.pol[next]?s.pols[s.pol[next]]:null;if(host?.enemies.has(o.id))continue;
        if(wallStrength(next)>0.6&&host&&!host.allies.includes(o.id)&&host.rights<0.5)continue;queue.push([next,depth+1]);
        if(!host?.alive||host.id===o.id||s.pop[next]>=s.K[next]*0.95)continue;
        if(host.kind==='state'&&(s.urban[next]<1000||host.rights<0.3||host.health<0.45||s.nutrition[next]<0.85))continue;
        if(host.kind==='horde'&&(host.hunger>0.2||host.coalition<0.35))continue;
        destinations.push({cell:next,host,score:(host.kind==='state'?0.6:0.5)+host.health*0.25-depth*0.12+s.r()*0.15});
      }
    }
    destinations.sort((a,b)=>b.score-a.score);
    // Several destinations may receive different contingents; the remaining
    // households stay as autonomous clans rather than disappearing with a flag.
    const base=s.pop[i];for(const target of destinations.slice(0,2)){
      const host=target.host,requested=base*(0.08+s.r()*0.12);
      const agreement=host.kind==='state'?createSettlementAgreement(host,i,target.cell,requested,WD.sH[target.cell]*s.rangeStock[target.cell]>s.farm[target.cell]*farmSuit(target.cell)?'pastoral':'farm'):null;
      const moved=host.kind==='state'?(agreement?.people||0):scatterClanHouseholds(i,target.cell,requested);if(!moved)continue;
      if(host.kind==='horde')host.pop+=moved;else s.societyCounters.scatteredClans+=moved;recipients.add(host.id);
      if(host.kind==='horde'){host.army+=army*moved/Math.max(1,total);host.clanTerms.set(s.clan[i],{loyalty:0.5,joined:s.year});s.societyCounters.clansJoiningConfederations+=moved}
      else s.societyCounters.clansReceivedByCities+=moved;
    }
  }
  o.army=o.staff=o.navy=0;o.alive=false;o.died=s.year;o.succ=[...recipients];o.departed=true;
  for(const [id] of o.enemies)s.pols[id]?.enemies.delete(o.id);o.enemies.clear();
  for(const id of o.allies){const p=s.pols[id];if(p)p.allies=p.allies.filter(q=>q!==o.id)}
  s.alive=s.alive.filter(id=>id!==o.id);s.fallen.push(o);s.societyCounters.confederationBreakups++;
  chron('fall',`The ${o.full} breaks apart. ${reason} Some households seek new patrons or settlement near cities; others remain in autonomous clans.`,o.capital,[R_(o),...[...recipients].map(id=>R_(s.pols[id]))]);return true;
}

/* Settlement and political development are funded, reversible processes.
   Rates are experimental; a pastoral economy is not a lower political stage. */
const CITY_ROLES=['Market town','Port','Craft center','Administrative center','Ritual center','Frontier center'];
function initDevelopment(){
  const s=S;
  for(const k of ['housing','urbanWater','urbanJobs','localFoodImports'])s[k]=new Float64Array(N);
  s.sanitation=new Float32Array(N);s.cityRole=new Uint8Array(N);
  s.settlementRequests=[];s.nextSettlementId=1;
  Object.assign(s.societyCounters,{nomadSubmissions:0,nomadReleases:0,pastoralTransitions:0,settlementPetitions:0,negotiatedSettlers:0,frontierSettlers:0,redistributedSettlers:0,urbanArrivals:0,urbanDepartures:0,localGrainDeliveries:0});
  initConsolidation();
}
function initDevelopmentPolity(o,from){
  o.pastoralOrigin=o.kind==='horde'||!!from?.pastoralOrigin;
  o.pastoralPractice=from?(from.pastoralPractice||0)*0.7:0;
  o.hybridYears=from?(from.hybridYears||0)*0.5:0;o.agrarianRevenue=0;o.settlementProgress=0;
  o.lastPetition=-100000;o.lastPastoralDefeat=-100000;o.submission=null;
  initConsolidationPolity(o,from);
}
function urbanWaterCapacity(i){
  const w=WD,access=clamp(w.waterPotential[i]*0.7+w.Pr[i]/2500,0,1);
  return (200+8500*access*access+suitableWaterworks(i)+S.urbanWater[i])*clamp(S.wm[i],0.3,1.1);
}
function suitableWaterworks(i){return S.waterworks[i]*12000*(0.2+0.8*WD.waterPotential[i])}
function urbanActivities(i,o){
  const s=S,p=s.pop[i],trade=Math.min(p*0.12,s.flow[i]*0.12),administration=o?(o.staff+o.army*0.15)*p/Math.max(1,o.pop):0;
  const surplus=Math.max(0,s.harvest[i]-s.need[i]*0.9),processing=Math.min(p*0.045,surplus*0.12);
  const roles=[p*(0.012+0.055*s.organisation[i])+processing+trade*0.5,
    WD.coast[i]?trade*(0.5+0.5*s.sail[i]):0,
    p*s.workshops[i]*0.06*(0.4+0.6*s.urbanNetwork[i]),administration,
    s.rel[i]>=0?p*0.012*s.organisation[i]:0,
    o?o.army*p/Math.max(1,o.pop)*0.12*civicThreat(i,o):0];
  s.cityRole[i]=roles.indexOf(Math.max(...roles));
  return roles.reduce((a,b)=>a+b,0);
}
function urbanTarget(i,o){
  const s=S,p=s.pop[i],food=s.harvest[i]*0.25+s.foodImports[i];
  s.urbanJobs[i]=urbanActivities(i,o);
  return Math.max(0,Math.min(p*urbanShare(i,o),s.urbanJobs[i],food,urbanWaterCapacity(i))*(1-s.cityDamage[i]));
}
function urbanBuildSpend(i,o,due){
  const privatePaid=civicSpend(i,null,due);if(!o||privatePaid>=due)return privatePaid;
  const reserve=(o.fiscalDue||o.pop*0.02)*S.pop[i]/Math.max(1,o.pop)*1.25;
  const discretionary=Math.max(0,publicAvailable(o,i)-reserve)*0.03;
  return privatePaid+civicSpend(i,o,Math.min(due-privatePaid,discretionary));
}
function urbanConstruction(i,o){
  const s=S,p=s.pop[i];if(p<100)return;
  const target=urbanTarget(i,o),occupied=s.urban[i];
  // Maintenance is paid before expansion. Empty buildings persist but decay.
  const upkeep=s.housing[i]*0.002+s.urbanWater[i]*0.0015,maintained=urbanBuildSpend(i,o,upkeep)/Math.max(1,upkeep);
  s.housing[i]*=1-0.004*(1-maintained)-0.001*s.raidDamage[i];s.urbanWater[i]*=1-0.006*(1-maintained);
  const seats=Math.min(Math.max(0,target*1.1-s.housing[i]),Math.max(5,p*0.003)),cost=0.35+0.2*WD.rough[i];
  if(seats>0){const paid=urbanBuildSpend(i,o,seats*cost);s.housing[i]+=paid/cost;s.engineeringPractice[i]+=paid*0.08}
  const waterNeed=Math.max(0,Math.min(s.housing[i],s.urbanJobs[i])*1.1-urbanWaterCapacity(i));
  if(waterNeed>0&&s.engineeringKnowledge[i]>0.1){const paid=urbanBuildSpend(i,o,Math.min(p*0.001,waterNeed*0.3));s.urbanWater[i]+=paid/0.3*(0.2+0.8*WD.waterPotential[i]);s.engineeringPractice[i]+=paid*0.1}
  const crowd=occupied/Math.max(100,s.housing[i]),due=occupied*0.0015;
  const paid=urbanBuildSpend(i,o,due),met=paid/Math.max(1,due);
  s.sanitation[i]=clamp(s.sanitation[i]+0.025*(met*(0.2+0.5*s.infrastructure[i]+0.3*s.engineeringKnowledge[i])-s.sanitation[i])-0.005*Math.max(0,crowd-1),0,1);
}
function localUrbanFreight(accounts){
  const s=S,w=WD;s.localFoodImports.fill(0);
  // Each origin allocates one finite surplus among its neighboring buyers.
  for(const i of w.landIdx){const surplus=Math.max(0,s.food[i]-s.need[i]*1.12);if(surplus<1)continue;
    const buyers=[];let total=0;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.urban[j]<200)continue;
      const a=s.pol[i]?s.pols[s.pol[i]]:null,b=s.pol[j]?s.pols[s.pol[j]]:null;if(a&&b&&(a.enemies.has(b.id)||b.enemies.has(a.id)))continue;
      const access=Math.min(transportSupport(i),transportSupport(j)),road=Math.min(s.infrastructure[i],s.infrastructure[j]);
      const loss=clamp(0.06+0.14*w.rough[j]+0.06*(1-access),0.02,0.4),demand=Math.max(0,s.need[j]*1.08-s.food[j]);
      const capacity=Math.min(s.pop[i],s.pop[j])*(0.008+0.025*access+0.02*road)*civicTradeAccess(i,j)*epidemicTravelFactor(i,j);
      const wanted=Math.min(demand/(1-loss),capacity);if(wanted>0){buyers.push({j,wanted,loss});total+=wanted}
    }
    const fraction=Math.min(1,surplus/Math.max(1,total));for(const b of buyers){const n=b.wanted*fraction,delivered=n*(1-b.loss);s.food[i]-=n;s.food[b.j]+=delivered;s.foodImports[b.j]+=delivered;s.localFoodImports[b.j]+=delivered;accounts.transportLoss+=n-delivered;s.societyCounters.localGrainDeliveries+=delivered;s.flow[i]+=n;s.flow[b.j]+=delivered}
  }
}
function moveDevelopmentHouseholds(i,j,requested,options={}){
  const s=S;if(i===j||!WD.land[j])return 0;const prior=s.pop[i],old=s.pop[j];
  let n=Math.min(requested,prior*0.2,Math.max(0,s.K[j]-old)*0.35,s.food[i]/0.15);
  const selected=options.eth,selectedShare=selected==null?1:s.eth[i]===selected?1-(s.eth2[i]>=0?s.mix[i]:0):s.eth2[i]===selected?s.mix[i]:0;
  n=Math.min(n,prior*selectedShare);
  if(options.ruralOnly)n=Math.min(n,Math.max(0,prior-s.urban[i]));if(n<10)return 0;
  const ratio=n/prior,food=s.food[i]*ratio,young=s.young[i]*ratio,herd=takeHerd(i,ratio),history=diseaseHistory(i),minor=s.eth2[i]>=0?s.mix[i]:0;
  const ancestryMinor=s.ancestry2[i]>=0?s.ancestryMix[i]:0,adult=Math.max(0,old-s.young[j]),newAdult=n-young;
  s.maleShare[j]=(adult*s.maleShare[j]+newAdult*s.maleShare[i])/Math.max(1,adult+newAdult);
  s.pop[i]-=n;s.young[i]-=young;s.food[i]-=food;s.pop[j]+=n;s.young[j]+=young;s.food[j]+=Math.max(0,food-n*0.06);putHerd(j,herd);
  const groups=selected==null?[[s.eth[i],1-minor],[s.eth2[i],minor]]:[[selected,1]];
  let before=old;for(const [eth,part] of groups)if(eth>=0&&part>0){if(before<1){s.eth[j]=eth;s.eth2[j]=-1;s.mix[j]=0}else mergeCulture(j,eth,n*part,before);before+=n*part}
  if(selected!=null){s.pop[i]=prior;removeResidentCulture(i,selected,n);s.pop[i]=prior-n}
  before=old;for(const [eth,part] of [[s.ancestry[i],1-ancestryMinor],[s.ancestry2[i],ancestryMinor]])if(eth>=0&&part>0){mergeAncestry(j,eth,n*part,before);before+=n*part}
  if(!options.ruralOnly)s.urban[i]*=1-ratio;
  if(options.urban)s.urban[j]+=n;
  for(let k=0;k<TECH.length;k++)s.tk[k][j]=Math.max(s.tk[k][j],s.tk[k][i]*Math.min(0.5,n/Math.max(1,s.pop[j])));
  transferCrops(i,j);mixDiseaseHistory(j,history,n,old);s.newcomers[j]+=n;s.settleLag[j]=Math.max(1,s.settleLag[j]);
  diseaseJourney(i,j,travelDays(i,j),n,'migration');
  s.campMoves.push({from:i,to:j,eth:s.eth[i],pop:n,year:s.year,home:i,cause:options.cause||'urban opportunity'});
  for(const [cell,delta] of [[i,-n],[j,n]]){const owner=s.pol[cell]?s.pols[s.pol[cell]]:null;if(owner)owner.pop=Math.max(0,owner.pop+delta)}
  return n;
}
function urbanPopulationYear(){
  const s=S,w=WD;
  // Local rural/urban residence changes do not create population.
  for(const i of w.landIdx){const p=s.pop[i],o=s.pol[i]?s.pols[s.pol[i]]:null,target=Math.min(s.housing[i],urbanTarget(i,o));s.urban[i]=clamp(s.urban[i],0,p);
    const lack=clamp(1-s.nutrition[i]+s.cityDamage[i]+s.sickness[i],0,1);
    if(s.urban[i]>target){const n=Math.min(s.urban[i],(s.urban[i]-target)*(0.06+0.2*lack));s.urban[i]-=n;s.societyCounters.urbanDepartures+=n}
    else if(s.nutrition[i]>0.85&&s.cityDamage[i]<0.5){const n=Math.min((p-s.urban[i])*0.015,target-s.urban[i],(p*0.0008+s.urban[i]*0.025)*s.organisation[i]);s.urban[i]+=n;s.societyCounters.urbanArrivals+=n}
  }
  // Stage arrivals so a household moves at most once in this pass.
  const moves=[],available=new Map();for(const j of w.landIdx){if(s.urban[j]<200||s.nutrition[j]<0.9||s.cityDamage[j]>0.4)continue;
    const host=s.pol[j]?s.pols[s.pol[j]]:null,target=Math.min(s.housing[j],urbanTarget(j,host));let room=Math.max(0,target-s.urban[j]);if(room<10)continue;
    for(let d=0;d<4&&room>=10;d++){const i=w.nb[j*4+d];if(i<0||!w.land[i]||s.pop[i]<500)continue;
      const source=s.pol[i]?s.pols[s.pol[i]]:null;if(host&&source&&(host.enemies.has(source.id)||source.enemies.has(host.id)))continue;
      if(host&&host.rights<0.25)continue;
      const rural=available.has(i)?available.get(i):Math.max(0,s.pop[i]-s.urban[i]),pull=clamp(s.urbanJobs[j]/Math.max(100,s.urban[j])-1,0,1);
      const n=Math.min(room,rural*0.008*P.migration*pull);if(n<10)continue;available.set(i,rural-n);moves.push({i,j,n});room-=n;
    }
  }
  for(const m of moves)s.societyCounters.urbanArrivals+=moveDevelopmentHouseholds(m.i,m.j,m.n,{urban:true,ruralOnly:true});
}
function settlementRoute(from,to,host,limit=8){
  const s=S,w=WD,queue=[[from,0]],seen=new Set([from]);
  for(let at=0;at<queue.length&&at<160;at++){const [i,depth]=queue[at];if(i===to)return depth;if(depth>=limit)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||seen.has(j)||w.rough[j]>0.85)continue;
      const owner=s.pol[j]?s.pols[s.pol[j]]:null;if(owner&&owner.id!==host.id&&owner.kind==='state')continue;
      if(owner&&host.enemies.has(owner.id))continue;seen.add(j);queue.push([j,depth+1]);}
  }return -1;
}
function settlementCapacity(host,j,mode){
  const s=S;if(!host?.alive||host.kind!=='state'||host.health<0.45||s.nutrition[j]<0.85)return 0;
  if(s.pol[j]!==host.id&&!(s.pol[j]===0&&s.ruralPatron[j]===host.id&&s.ruralSecurity[j]>0.35))return 0;
  const room=Math.max(0,s.K[j]*0.9-s.pop[j]),claims=clamp(1-s.pop[j]/Math.max(1,s.K[j])-s.eliteStake[j]*0.25,0,1);
  if(mode==='urban')return Math.min(room,Math.max(0,Math.min(s.housing[j],urbanWaterCapacity(j),s.urbanJobs[j])-s.urban[j]));
  const livelihood=mode==='pastoral'?WD.sH[j]*s.rangeStock[j]:s.farm[j]*farmSuit(j);
  return room*claims*clamp(livelihood,0,1)*0.35;
}
function settlementFundingCell(host,j){
  if(S.pol[j]===host.id)return j;
  for(let d=0;d<4;d++){const i=WD.nb[j*4+d];if(i>=0&&S.pol[i]===host.id&&S.urban[i]>=500)return i}
  return -1;
}
function createSettlementAgreement(host,i,j,requested,mode='pastoral',parent=null){
  const s=S,route=settlementRoute(i,j,host);if(route<0||host.enemies.has(s.pol[i]))return null;
  const funding=settlementFundingCell(host,j);if(funding<0)return null;
  const capacity=settlementCapacity(host,j,mode),cost=0.35+route*0.08+(mode==='farm'?0.45:mode==='urban'?0.2:0);
  const n=Math.min(requested,capacity,publicAvailable(host,funding)/Math.max(1,cost)*0.5);if(n<50)return null;
  const grant=budgetAt(host,funding,n*cost);if(grant<n*cost*0.99){s.food[j]+=grant;return null}
  const eth=parent?parent.eth:s.eth[i],moved=moveDevelopmentHouseholds(i,j,n,{urban:mode==='urban',eth,cause:'settlement agreement'});
  if(moved<50){s.food[j]+=grant;return null}s.food[j]+=grant;
  const t={id:s.nextSettlementId++,durable:true,host:host.id,cell:j,eth,people:moved,promised:moved*0.025,since:s.year,loyalty:0.65,failures:0,broken:false,done:false,mode,rights:host.rights,landRights:true,parent:parent?.id||0,patronCell:host.capital};
  host.compacts.push(t);s.societyCounters.negotiatedSettlers+=moved;if(s.pol[j]!==host.id)s.societyCounters.frontierSettlers+=moved;
  s.autonomy[j]=Math.max(s.autonomy[j],0.6);s.settleLag[j]=Math.max(s.settleLag[j],mode==='farm'?2:1);
  const origin=s.pol[i]?s.pols[s.pol[i]]:null;if(origin&&origin!==host){const fraction=moved/Math.max(1,origin.pop+moved);origin.army*=1-fraction;origin.staff*=1-fraction}
  chron('migration',`The ${host.full} receives ${fmtK(moved)} people under a ${mode==='urban'?'town':mode==='farm'?'farming':'pasture'} settlement agreement, promising provisions, protection and land rights.`,j,[R_(host),RE(s.eths[eth])]);
  return t;
}
function requestClanSettlement(o,origin=o.capital){
  const s=S;if(s.year-o.lastPetition<15||s.pop[origin]<500)return false;o.lastPetition=s.year;s.societyCounters.settlementPetitions++;
  const candidates=[];ring(origin,3,j=>{if(!WD.land[j])return;const host=s.pol[j]?s.pols[s.pol[j]]:s.ruralPatron[j]?s.pols[s.ruralPatron[j]]:null;if(!host||host.kind!=='state'||host.enemies.has(o.id))return;
    if(settlementRoute(origin,j,host)<0)return;
    for(const mode of ['urban','pastoral','farm']){if(mode==='urban'&&s.urban[j]<500)continue;
      const capacity=settlementCapacity(host,j,mode);if(capacity<100)continue;
      const livelihood=mode==='urban'?0.4+s.organisation[j]*0.3:mode==='pastoral'?(0.3+0.7*s.herd[origin])*WD.sH[j]*s.rangeStock[j]:(0.3+0.7*s.farm[origin])*farmSuit(j);
      candidates.push({host,j,mode,capacity,score:host.health+host.rights+host.trust+Math.min(1,capacity/3000)*0.6+livelihood*0.4-angDist(origin,j)*10});
    }
  });candidates.sort((a,b)=>b.score-a.score);
  for(const c of candidates)if(createSettlementAgreement(c.host,origin,c.j,Math.min(s.pop[origin]*0.15,c.capacity),c.mode))return true;
  return false;
}
function settlementAgreementStep(o,t){
  if(t.done)return;const s=S,owner=s.pol[t.cell];if(owner!==o.id&&!(owner===0&&s.ruralPatron[t.cell]===o.id)){t.done=true;return}
  const culture=s.eth[t.cell]===t.eth?1-(s.eth2[t.cell]>=0?s.mix[t.cell]:0):s.eth2[t.cell]===t.eth?s.mix[t.cell]:0;
  const n=Math.min(t.people,s.pop[t.cell]*culture);t.people=n;if(n<10){t.done=true;return}
  const funding=settlementFundingCell(o,t.cell),supportedYears=s.year-t.since,need=supportedYears<8?t.promised:t.promised*0.2,paid=funding>=0?budgetAt(o,funding,need):0;s.food[t.cell]+=paid;
  const protection=owner===o.id?o.health*o.payroll:s.ruralSecurity[t.cell],kept=o.rights>=t.rights-0.12&&protection>=0.3;
  const fulfillment=clamp((need?paid/need:1)*0.4+(kept?0.4:0)+s.nutrition[t.cell]*0.2,0,1);
  t.loyalty=clamp(t.loyalty+0.035*(fulfillment-t.loyalty),0,1);
  o.auxiliaries+=n*0.025*t.loyalty*(t.mode==='urban'?0.5:1);
  if(fulfillment<0.55){t.failures++;s.unrest[t.cell]=clamp(s.unrest[t.cell]+0.01,0,1)}else t.failures=Math.max(0,t.failures-2);
  if(t.failures>=5&&!t.broken){t.broken=true;s.societyCounters.brokenCompacts++;o.shock+=0.08;chron('migration',`Settled communities in the ${o.full} protest failed provisions or land-rights promises.`,t.cell,[R_(o)])}
  if(t.broken&&t.loyalty<0.25&&n>300&&s.activeMigs.length<20){
    // Use the existing cohort machinery; only actual resident households leave.
    const take=Math.min(n*0.5,s.pop[t.cell]*0.2),p=s.pop[t.cell],share=take/p,food=s.food[t.cell]*share,young=s.young[t.cell]*share,animals=takeHerd(t.cell,share),immunity=diseaseHistory(t.cell);
    removeResidentCulture(t.cell,t.eth,take);s.pop[t.cell]-=take;s.young[t.cell]-=young;s.food[t.cell]-=food;s.urban[t.cell]*=1-share;
    const a=s.r()*Math.PI*2,M=startMigration({eth:t.eth,pop:take,food,young,animals,cell:t.cell,dx:Math.cos(a),dy:Math.sin(a),kind:'people',cause:'broken settlement agreement'});M.immunity=immunity;t.people-=take;t.done=true;
  }
}
function redistributeSettlers(o){
  const s=S;if(o.kind!=='state'||o.cells<4||o.staff<o.pop*0.002||o.health<0.65||o.payroll<0.8||s.year%10)return;
  const cells=(s.realmCells.get(o.id)||[]).filter(i=>s.pol[i]===o.id);
  for(const t of [...o.compacts]){if(!t.durable||t.done||t.people<500||t.loyalty<0.65||s.year-t.since<10||s.year-(t.lastRedistribution||-100000)<20)continue;
    const targets=cells.filter(j=>j!==t.cell&&publicAvailable(o,j)>250&&settlementCapacity(o,j,t.mode)>300&&settlementRoute(t.cell,j,o,6)>=0).sort((a,b)=>settlementCapacity(o,b,t.mode)-settlementCapacity(o,a,t.mode));
    if(!targets.length)continue;const j=targets[0];
    // Relocation is negotiated, and requires a materially better destination.
    if(s.nutrition[j]<s.nutrition[t.cell]||s.r()>0.15*o.trust)continue;
    const moved=createSettlementAgreement(o,t.cell,j,Math.min(t.people*0.2,1000),t.mode,t);if(moved){t.people=Math.max(0,t.people-moved.people);t.lastRedistribution=s.year;s.societyCounters.redistributedSettlers+=moved.people}
  }
}
function pastoralRival(o,p){return p&&p.alive&&p.kind==='horde'&&o.over!==p.id&&p.over!==o.id&&!o.allies.includes(p.id)&&(o.truce.get(p.id)||-100000)<=S.year}
function submitPastoralPolity(winner,loser){
  const s=S;if(!pastoralRival(winner,loser)||loser.over||power(winner)<power(loser)*1.15)return false;
  const seen=new Set();for(let ancestor=winner;ancestor?.over&&!seen.has(ancestor.id);ancestor=s.pols[ancestor.over]){seen.add(ancestor.id);if(ancestor.over===loser.id)return false}
  const due=loser.pop*0.004,paid=budgetPay(winner,due);if(paid<due*0.9){s.food[loser.capital]+=paid;return false}s.food[loser.capital]+=paid;
  loser.over=winner.id;loser.overY=s.year;winner.tribs++;loser.submission={since:s.year,loyalty:0.5,leader:winner.ruler.since};
  for(const wid of [...s.activeWars]){const war=s.wars[wid];if(war.a.includes(winner.id)&&war.d.includes(loser.id)||war.d.includes(winner.id)&&war.a.includes(loser.id)){endWar(war);s.activeWars=s.activeWars.filter(id=>id!==wid)}}
  loser.enemies.delete(winner.id);winner.enemies.delete(loser.id);
  s.societyCounters.nomadSubmissions++;chron('diplomacy',`The ${loser.full} submits to the ${winner.full}, retaining its chiefs and pasture in return for tribute and military obligations.`,loser.capital,[R_(winner),R_(loser)]);return true;
}
function pastoralBattleOutcome(o,p,j){
  const s=S;if(o.kind!=='horde'||!p||p.kind!=='horde'||!pastoralRival(o,p))return false;
  p.lastPastoralDefeat=s.year;if(s.year-p.lastPetition>=15)requestClanSettlement(p,j);
  const advantage=power(o)/Math.max(1,power(p));if(advantage<1.25||s.r()>0.45)return false;
  if(p.coalition<0.4&&s.r()<0.4&&hordeMigration(p,'defeat by another confederation'))return true;
  return s.r()<0.6?submitPastoralPolity(o,p):incorporateClans(o,p);
}
function pastoralAdministration(o){
  const s=S;if(!o.pastoralOrigin)return;
  if(o.submission){const lord=s.pols[o.over];const secure=lord?.alive&&lord.kind==='horde'&&lord.health>0.4;
    const strength=secure?clamp(power(lord)/Math.max(1,power(o)),0,2):0;
    o.submission.loyalty=clamp(o.submission.loyalty+0.025*((secure?0.2+lord.trust*0.4+strength*0.15:0)-o.submission.loyalty)-0.015*o.hunger,0,1);
    if(secure&&lord.enemies.size&&o.submission.loyalty>0.45&&s.year%5===0&&!s.militaryContracts.some(t=>!t.done&&t.horde===o.id))createMilitaryContract(lord,o,o.army*0.15,5);
    if(!secure||o.submission.loyalty<0.25&&s.r()<0.05){if(lord)lord.tribs=Math.max(0,lord.tribs-1);o.over=0;o.submission=null;s.societyCounters.nomadReleases++;chron('diplomacy',`The ${o.full} withdraws its submission as the overlord's protection and authority weaken.`,o.capital,[R_(o)])}
  }
  if(o.kind!=='horde')return;
  const cells=(s.realmCells.get(o.id)||[]).filter(i=>s.pol[i]===o.id);let agrarian=0,all=0,specialists=0,towns=0,food=0,localConsent=0;
  for(const i of cells){const revenue=s.levy[i],crops=s.farm[i]*farmSuit(i),pasture=s.herd[i]*WD.sH[i];all+=revenue;agrarian+=revenue*crops/Math.max(0.05,crops+pasture+0.05*(1-s.farm[i]));food+=s.pop[i]*s.nutrition[i];localConsent+=s.pop[i]*s.eliteLoyalty[i];
    if(s.urban[i]>=1000){towns++;specialists+=s.urban[i]*(recordSkill(i)*0.6+s.organisation[i]*0.1)*(1-s.cityDamage[i])}}
  o.agrarianRevenue=all>0?agrarian/all:0;
  const demand=Math.max(0,o.clanTerms.size-1)+Math.min(8,o.tribs||0);
  if(demand>0){const need=o.pop*0.0003*Math.min(4,demand),paid=civicSpend(o.capital,o,need),practice=paid/Math.max(1,need);o.pastoralPractice=clamp(o.pastoralPractice+0.008*practice-0.003*(1-practice),0,1);s.recordPractice[o.capital]+=paid*0.03}
  const trained=o.staff>Math.max(30,o.pop*0.001)&&specialists>30;
  const suitable=towns>0&&o.agrarianRevenue>0.35&&trained&&food/Math.max(1,o.pop)>0.9&&localConsent/Math.max(1,o.pop)>0.45&&o.payroll>0.75&&o.health>0.6;
  const acceptance=clamp(o.coalition*0.5+o.rights*0.25+o.succession*0.25-o.coalitionFatigue*0.2,0,1);
  o.hybridYears=clamp(o.hybridYears+(suitable?acceptance:-1.5),0,100);o.settlementProgress=o.hybridYears/40;
  if(suitable&&acceptance>0.35){const due=o.pop*0.0005,paid=civicSpend(o.capital,o,due);o.hybridYears=Math.max(0,o.hybridYears-(1-paid/Math.max(1,due)));}
  if(o.hybridYears>=40){const old=o.full;o.kind='state';o.conqDyn=true;o.settledY=s.year;o.hybridGovernment=true;o.origin=Object.assign({},o.origin,{settled:s.year});o.shock+=0.08;o.conquestLoad=clamp(o.conquestLoad+0.1,0,3);o.tier=tierOf(o);o.full=fullName(o);s.societyCounters.pastoralTransitions++;
    chron('rise',`After sustained government of farming districts and towns, the ${old} establishes a mixed pastoral and agrarian administration as the ${o.full}.`,o.capital,[R_(o)],'Mobile communities retain their livelihoods. Officials, local cooperation, food and predictable revenue sustain the transition.');
  }
}
function developmentYear(){
  const s=S;for(const id of [...s.alive]){const o=s.pols[id];if(!o.alive)continue;pastoralAdministration(o);if(o.kind==='state')redistributeSettlers(o);
    else if(s.year%5===0&&(s.year-o.lastPastoralDefeat<15||o.hunger>0.2||o.coalitionFatigue>0.6)&&s.r()<0.15)requestClanSettlement(o);
  }
}

/* Delegated government, finite campaign mobilization and service settlements.
   These are experimental mechanisms, not compulsory historical milestones. */
function initConsolidation(){
  const s=S;
  s.delegationOwner=new Int32Array(N);s.delegationOrigin=new Int32Array(N);
  for(const k of ['localStaff','localGuard','localGuardFree','localPayroll','delegationTrust','seasonLevy','levyFree','defenseUsed','defenseLaborDebt','militaryLabor','serviceTroops','serviceFree','serviceEstates','estateAge','hereditaryEstates'])s[k]=new Float64Array(N);
  s.militarySettlements=[];
  Object.assign(s.societyCounters,{delegatedConquests:0,delegatedIntegrations:0,delegationExits:0,campaignPlans:0,seasonalMusters:0,levyCasualties:0,serviceSettlements:0,serviceSettlers:0,customaryAgreements:0,localTownFoundations:0});
}
function initConsolidationPolity(o,from){
  o.campaign=null;o.campaignAllocatedYear=-100000;o.campaignLevyShare=0;o.fieldLevies=[];
  o.levyCohorts=[];o.mustered=0;o.lastMusterYear=-100000;o.delegatedCells=0;o.delegatedPop=0;o.localOfficials=0;
  o.localFiscalDue=0;o.localPaid=0;o.customaryRights=from?from.customaryRights||0.35:0.35;
  o.customaryContinuity=from?from.customaryContinuity||0.15:0.15;o.lastServiceSettlement=-100000;
}
function customaryInstitutions(o){
  const security=clamp(o.health*o.payroll-o.hunger,0,1),bargains=o.civicBargains||[];
  const broken=bargains.filter(b=>b.failures>5).length/Math.max(1,bargains.length);
  const target=clamp(0.23+0.19*security+0.14*o.trust+0.08*o.coalition-0.2*broken-0.08*o.shock,0.12,0.62);
  o.customaryRights=clamp(o.customaryRights+0.015*(target-o.customaryRights),0.08,0.65);
  o.customaryContinuity=clamp(o.customaryContinuity+0.006*(0.12+0.28*security*o.trust*o.coalition-o.customaryContinuity),0.05,0.4);
}
function delegationPossible(o,i,j){
  const s=S,d=s.pol[j]?s.pols[s.pol[j]]:null;if(o.kind!=='state'||!d||d===o||d.kind!=='state'||o.health<0.45||o.payroll<0.5)return false;
  if(s.organisation[j]<0.25||s.farm[j]*farmSuit(j)<0.08&&s.urban[j]<500)return false;
  const mobile=pastoralMobility(j);if((frontierRisk(j)>0.3||WD.rangeExposure[j]>0.45&&mobile>0.3)&&frontierProtection(i,o)<0.25+mobile*0.22)return false;
  const liaison=6+(o.delegatedCells||0)*4+s.pop[j]*0.00012;
  return o.staff>=o.pop*0.00035+liaison&&publicAvailable(o,i)>=Math.max(30,s.pop[j]*0.008)&&transportAccess(i,o)>0.2&&routeCost(i,j,o,false)<Math.max(5,o.h*2);
}
function establishDelegation(o,i,j,previous){
  const s=S,d=s.pols[previous];if(!delegationPossible(o,i,j))return false;
  const cost=Math.max(30,s.pop[j]*0.008),paid=budgetAt(o,i,cost);if(paid<cost*0.99){s.food[i]+=paid;return false}
  s.food[j]+=paid*0.75;
  const share=clamp(s.pop[j]/Math.max(1,d.pop),0,1),officials=d.staff*share*0.8,guard=Math.max(0,d.army-(d.loanedTroops||0))*share*0.3;
  d.staff-=officials;d.army-=guard;d.armyFree=Math.min(d.armyFree,Math.max(0,d.army-(d.loanedTroops||0))*0.55);d.defFree=Math.min(d.defFree,Math.max(0,d.army-(d.loanedTroops||0))*0.45);s.localStaff[j]+=officials;s.localGuard[j]+=guard;
  s.delegationOwner[j]=o.id;s.delegationOrigin[j]=previous;s.delegationTrust[j]=0.58;s.localPayroll[j]=Math.max(0.5,d.payroll);
  s.autonomy[j]=Math.max(0.75,s.autonomy[j]);s.eliteLoyalty[j]=Math.max(0.5,s.eliteLoyalty[j]);
  o.delegatedCells++;o.delegatedPop+=s.pop[j];o.localOfficials+=s.localStaff[j];o.nobles=clamp(o.nobles+0.008,0.1,0.95);
  o.civicBargains=o.civicBargains||[];o.civicBargains.push({cell:j,rights:Math.max(0.3,o.rights),since:s.year,failures:0,delegated:true});
  s.societyCounters.delegatedConquests++;
  chron('diplomacy',`Local authorities in ${s.city[j]>=0?s.cities[s.city[j]].name:d.base} accept the ${o.full}, retaining officials, land rights and substantial autonomy.`,j,[R_(o),R_(d)],'Local administration survives the victory. The new ruler must fund protection and honor the bargain before attempting direct government.');return true;
}
function localTaxAccess(i,o){
  const central=transportAccess(i,o);return S.delegationOwner[i]===o.id?Math.max(central,(0.35+0.5*S.organisation[i])*S.localPayroll[i]*(0.4+0.6*S.delegationTrust[i])):central;
}
function localGovernmentPayroll(accounts){
  const s=S;for(const id of s.alive){s.pols[id].localFiscalDue=0;s.pols[id].localPaid=0}
  for(const i of WD.landIdx){const id=s.pol[i],o=id?s.pols[id]:null;if(!o||s.delegationOwner[i]!==id)continue;
    const adult=Math.max(0,s.pop[i]-s.young[i]);s.localStaff[i]=Math.min(s.localStaff[i],adult*0.1);s.localGuard[i]=Math.min(s.localGuard[i],adult*s.maleShare[i]*0.25);
    const due=s.localStaff[i]*1.2+s.localGuard[i]*0.6+s.pop[i]*0.0004,paid=budgetAt(o,i,due);s.food[i]+=paid;
    s.localPayroll[i]=due>0?clamp(paid/due,0,1):1;o.localFiscalDue+=due;o.localPaid+=paid;
    s.localGuardFree[i]=s.localGuard[i]*s.localPayroll[i]*0.7;
    const target=s.pop[i]*(0.0006+0.0016*recordSkill(i)),training=Math.max(0,target-s.localStaff[i])*0.02*s.localPayroll[i];
    const trained=budgetAt(o,i,training*2)/2;s.localStaff[i]=Math.max(0,s.localStaff[i]+trained-s.localStaff[i]*(0.012+0.025*(1-s.localPayroll[i])));
    s.food[i]+=trained;accounts.consumed+=trained;s.localGuard[i]*=1-0.015-0.035*(1-s.localPayroll[i]);
  }
}
function delegationCensus(o){
  o.delegatedCells=0;o.delegatedPop=0;o.localOfficials=0;
  for(const i of S.realmCells.get(o.id)||[])if(S.pol[i]===o.id&&S.delegationOwner[i]===o.id){o.delegatedCells++;o.delegatedPop+=S.pop[i];o.localOfficials+=S.localStaff[i]}
}
function delegationYear(){
  const s=S;
  for(const i of WD.landIdx){const owner=s.pol[i],o=owner?s.pols[owner]:null;
    if(!s.delegationOwner[i])continue;
    if(!o||!o.alive){s.localStaff[i]=s.localGuard[i]=s.localGuardFree[i]=0;s.delegationOwner[i]=0;continue}
    if(s.delegationOwner[i]!==owner){s.delegationOwner[i]=owner;s.delegationTrust[i]*=0.6}
    const bargain=(o.civicBargains||[]).find(b=>b.cell===i&&b.delegated),kept=!bargain||o.rights>=bargain.rights-0.1;
    const target=clamp(0.12+0.4*s.localPayroll[i]+0.25*o.health+0.15*(kept?1:0)-0.35*s.unrest[i]-0.2*o.hunger,0,1);
    s.delegationTrust[i]=clamp(s.delegationTrust[i]+0.025*(target-s.delegationTrust[i]),0,1);
    s.autonomy[i]=Math.max(s.autonomy[i],0.65);s.eliteLoyalty[i]=Math.min(s.eliteLoyalty[i],0.3+0.7*s.delegationTrust[i]);
    if(s.year-s.taken[i]>40&&s.delegationTrust[i]>0.7&&o.bureau>0.35&&o.health>0.7&&o.payroll>0.85&&o.staff>o.pop*0.002+o.cells*15&&publicAvailable(o,i)>s.pop[i]*0.04){
      const due=s.pop[i]*0.025,paid=civicSpend(i,o,due);if(paid>=due*0.95){o.staff+=s.localStaff[i];o.army+=s.localGuard[i];s.localStaff[i]=s.localGuard[i]=s.localGuardFree[i]=0;s.delegationOwner[i]=0;s.autonomy[i]=Math.max(0.45,s.autonomy[i]-0.15);s.societyCounters.delegatedIntegrations++;}
    }
    if(i!==o.capital&&s.delegationTrust[i]<0.22&&s.localPayroll[i]<0.4&&s.year-s.taken[i]>10&&s.year-(o.lastDefection||-100000)>8&&s.r()<0.05){
      const child=s.pols[newPolity(i,o,{origin:{type:'rebellion',from:o.id,why:'Provincial authorities reject failed protection and broken obligations.'}})];partitionInstitutions(o,[child]);child.staff+=s.localStaff[i];child.army+=s.localGuard[i];s.localStaff[i]=s.localGuard[i]=s.localGuardFree[i]=0;s.delegationOwner[i]=0;o.lastDefection=s.year;s.societyCounters.delegationExits++;
      chron('fall',`Local authorities withdraw from the ${o.full} after their governing bargain fails.`,i,[R_(o),R_(child)]);
    }
  }
  for(const id of s.alive)delegationCensus(s.pols[id]);
}
function planCampaign(o){
  const s=S,w=WD;if(o.kind!=='state')return;
  const old=o.campaign;
  if(old){const target=s.pol[old.to],enemy=target?s.pols[target]:null;
    if(s.year-old.start>5||s.pol[old.from]!==o.id||target===o.id||enemy&&(!enemy.alive||!o.enemies.has(enemy.id))||o.health<0.35)o.campaign=null;
    else return;
  }
  if(o.health<0.5||o.payroll<0.65||s.r()>0.16*P.warRate*o.aggrM)return;
  let best=null,score=0;
  for(const i of s.realmCells.get(o.id)||[]){if(s.pol[i]!==o.id||transportAccess(i,o)<0.2||publicAvailable(o,i)<50)continue;
    for(let d=0;d<4;d++){const j=w.nb[i*4+d];if(j<0||!w.land[j]||s.pol[j]===o.id)continue;const q=s.pol[j],enemy=q?s.pols[q]:null;
      if(enemy&&(!o.enemies.has(q)||enemy.over===o.id||o.over===q))continue;
      if(!q&&!frontierReady(o,i,j)||q&&!frontierHoldable(o,i,j)&&!delegationPossible(o,i,j))continue;
      const value=(enemy?1.5:0.4+o.press*0.3)*transportAccess(i,o)/(1+borderBarrier(i,j)+dd(i)*0.15)*(0.7+s.r()*0.3);
      if(value>score){score=value;best={from:i,to:j,pol:q,start:s.year,lastAttempt:-100000,sea:false}}
    }
  }
  if(best){o.campaign=best;s.societyCounters.campaignPlans++}
}
function musterSeasonal(o){
  const s=S;if(o.lastMusterYear===s.year)return;o.lastMusterYear=s.year;o.levyCohorts=[];o.mustered=0;if(o.kind!=='state'||!o.campaign||o.health<0.4||o.payroll<0.6)return;
  for(const i of s.realmCells.get(o.id)||[]){if(s.pol[i]!==o.id||s.nutrition[i]<0.9||s.unrest[i]>0.5)continue;
    if(routeCost(i,o.campaign.from,o,false)>Math.max(5,o.h*1.5)&&i!==o.campaign.from)continue;
    const p=s.pop[i],adult=Math.max(0,p-s.young[i])*s.maleShare[i],standing=(o.army+o.staff)*p/Math.max(1,o.pop)+s.localStaff[i]+s.localGuard[i]+s.serviceTroops[i];
    const compliance=clamp((0.35+0.65*s.integ[i])*(0.4+0.6*o.trust)*(0.4+0.6*s.eliteLoyalty[i])*(1-0.6*s.unrest[i]),0,1);
    const desired=Math.min(Math.max(0,adult-standing)*0.16,p*0.04*compliance),paid=budgetAt(o,i,Math.min(desired*0.22,publicAvailable(o,i)*0.3)),n=paid/0.22;
    if(n<10){s.food[i]+=paid;continue}s.food[i]+=paid;s.seasonLevy[i]=n;s.levyFree[i]=n*0.65;s.militaryLabor[i]+=n*0.25/Math.max(1,p);o.levyCohorts.push(i);o.mustered+=n;s.societyCounters.seasonalMusters+=n;
  }
}
function allocateCampaign(o,i,sea){
  const s=S;if(o.campaignAllocatedYear===s.year)return 0;
  const levy=(o.levyCohorts||[]).reduce((n,c)=>n+(s.pol[c]===o.id?s.levyFree[c]:0),0),native=Math.max(0,o.armyFree||0),foreign=Math.max(0,o.foreignFree||0);
  const total=Math.min(native+levy+foreign,sea?(o.navyFree||0)*80:Infinity),unit=0.12+dd(i)*0.025+(sea?0.22:0);
  const n=Math.min(total,publicAvailable(o,i)/Math.max(0.01,unit));if(n<100)return 0;
  const regular=Math.min(native,n);o.armyFree-=regular;let left=n-regular,seasonal=0;o.fieldLevies=[];
  for(const c of o.levyCohorts||[]){if(s.pol[c]!==o.id)continue;const take=Math.min(left,s.levyFree[c]);if(take<=0)continue;s.levyFree[c]-=take;left-=take;seasonal+=take;o.fieldLevies.push({cell:c,people:take})}
  const auxiliaries=drawForeignTroops(o,i,left),allocated=regular+seasonal+auxiliaries;
  budgetAt(o,i,allocated*unit);o.campaignAuxShare=auxiliaries/Math.max(1,allocated);o.campaignLevyShare=seasonal/Math.max(1,allocated);o.campaignAllocatedYear=s.year;o.campaigns++;
  if(sea)o.navyFree=Math.max(0,o.navyFree-allocated/80);s.martialPractice[i]+=allocated/Math.max(500,s.pop[i])*2;
  return allocated*transportAccess(i,o);
}
function campaignCasualties(o,i,n){
  const s=S,levy=n*(o.campaignLevyShare||0),aux=n*(o.campaignAuxShare||0);if(aux>0)foreignCasualties(o,aux);
  const total=(o.fieldLevies||[]).reduce((v,c)=>v+c.people,0);for(const c of o.fieldLevies||[]){const dead=killResidentMen(c.cell,Math.min(c.people,levy*c.people/Math.max(1,total)));
    c.people-=dead;s.seasonLevy[c.cell]=Math.max(0,s.seasonLevy[c.cell]-dead);s.societyCounters.levyCasualties+=dead}
  armyLoss(o,i,Math.max(0,n-levy-aux));
}
function killResidentMen(i,n){
  const s=S,adult=Math.max(0,s.pop[i]-s.young[i]),men=adult*s.maleShare[i],dead=Math.min(n,men);s.pop[i]-=dead;s.maleShare[i]=clamp((men-dead)/Math.max(1,adult-dead),0,1);s.urban[i]=Math.min(s.urban[i],s.pop[i]);return dead;
}
function defenseCasualties(o,j,n){
  if(o.kind!=='state'){armyLoss(o,j,n);return}
  const d=o.defenseCommitted;if(!d||d.cell!==j){armyLoss(o,j,n);return}
  const total=d.local+d.regular,regular=n*d.regular/Math.max(1,total),local=n-regular;armyLoss(o,j,regular);
  const dead=killResidentMen(j,local),guards=Math.min(S.localGuard[j]+S.serviceTroops[j],dead*0.3),share=S.localGuard[j]/Math.max(1,S.localGuard[j]+S.serviceTroops[j]);
  S.localGuard[j]=Math.max(0,S.localGuard[j]-guards*share);S.serviceTroops[j]=Math.max(0,S.serviceTroops[j]-guards*(1-share));
}
function mobilizedLocalDefense(j,o,commit){
  const s=S,p=s.pop[j],adult=Math.max(0,p-s.young[j])*s.maleShare[j],standing=(o.army||0)*p/Math.max(1,o.pop)+s.localGuard[j]+s.serviceTroops[j];
  const willing=p*(0.006+0.016*s.organisation[j])*(0.4+0.6*o.health)*(0.5+0.5*s.eliteLoyalty[j]);
  const eligible=Math.max(0,Math.min(willing,adult-standing-s.seasonLevy[j])-s.defenseUsed[j]);
  const funds=publicAvailable(o,j)+Math.max(0,s.food[j]-p*0.3)*0.04,n=Math.min(eligible,funds/0.15);
  const local=Math.min(s.localGuardFree[j]+s.serviceFree[j],Math.max(0,adult-s.seasonLevy[j]-s.defenseUsed[j]));
  if(commit){const cost=n*0.15,paid=budgetAt(o,j,cost);s.food[j]=Math.max(0,s.food[j]-(cost-paid));s.defenseUsed[j]+=n+local;const guards=Math.min(local,s.localGuardFree[j]);s.localGuardFree[j]-=guards;s.serviceFree[j]=Math.max(0,s.serviceFree[j]-(local-guards));s.defenseLaborDebt[j]+=n*0.1/Math.max(1,p)}
  return n+local;
}
function advanceCampaigns(){
  for(const id of [...S.alive]){const o=S.pols[id],c=o.campaign;if(!o.alive||o.kind!=='state'||!c||c.lastAttempt===S.year||o.campaignAllocatedYear===S.year)continue;
    if(S.pol[c.from]!==o.id||S.pol[c.to]===o.id)continue;const q=S.pol[c.to];if(q&&!o.enemies.has(q))continue;
    c.lastAttempt=S.year;territorialAttack(o,c.from,c.to,c.sea);
  }
}
function offerSettledContingent(o){
  const s=S;if(o.kind!=='state'||!o.campaign||s.year%5||o.health<0.6||s.r()>0.12*o.trust)return;
  for(const id of s.alive){const p=s.pols[id];if(p===o||p.kind!=='state'||p.health<0.6||p.trust<0.4||p.over!==o.id&&!o.allies.includes(id)||o.enemies.has(id))continue;
    if(p.over!==o.id&&![...o.enemies.keys()].some(e=>p.enemies.has(e)))continue;
    if(angDist(o.campaign.from,p.capital)>0.12)continue;if(createMilitaryContract(o,p,p.army*0.15,5))break;
  }
}
function localFoundationReady(i){
  const s=S;if(s.urban[i]<500||s.organisation[i]<0.35||s.nutrition[i]<0.9||s.farm[i]*farmSuit(i)<0.08)return false;
  const market=s.node[i]>0.2||WD.coast[i]&&s.infrastructure[i]>0.2||WD.rv[i]>0.25;
  return market&&s.pop[i]/WD.area[i]>0.8&&localPop(i)>=FLOOR.chief*3*P.floor/(0.4+0.6*transportSupport(i))&&settledStateHabitat(i);
}
function pastoralFormationReady(i){
  const s=S,past=s.herd[i]*Math.max(WD.sH[i],WD.desert[i]*s.camel[i]*0.6),crops=s.farm[i]*farmSuit(i);
  return past>Math.max(0.3,crops*1.3)&&s.urban[i]<s.pop[i]*0.025&&Math.max(s.mounts[i],s.pack[i])>0.08;
}
function foundServiceSettlement(o,i,j,requested){
  const s=S;if(o.kind!=='state'||s.year-o.lastServiceSettlement<15||s.pol[j]&&s.pol[j]!==o.id||s.pop[j]>1000||!frontierReady(o,i,j)||s.nutrition[i]<0.95)return 0;
  if(!s.pol[j]&&s.pop[j]>100&&s.ruralPatron[j]!==o.id)return 0;
  const veterans=Math.min(o.army*0.12,Math.max(0,o.army-(o.loanedTroops||0))*0.2,requested/4);if(veterans<30)return 0;
  const n=foundSettlement(i,j,Math.min(requested,veterans*4),o);if(n<120)return 0;
  const soldiers=Math.min(veterans,n/4);o.army-=soldiers;o.armyFree=Math.min(o.armyFree,o.army*0.55);s.serviceTroops[j]+=soldiers;
  s.serviceEstates[j]=clamp(s.serviceEstates[j]+n/Math.max(1,s.pop[j])*0.3,0,0.5);s.estateAge[j]=0;s.serviceFree[j]=s.serviceTroops[j];o.lastServiceSettlement=s.year;
  s.militarySettlements.push({pol:o.id,from:i,cell:j,people:n,soldiers,since:s.year,grantRights:o.rights,supportYears:3});
  s.societyCounters.serviceSettlements++;s.societyCounters.serviceSettlers+=n;
  chron('migration',`Veterans and their households establish a service settlement for the ${o.full}, receiving land in return for frontier duties.`,j,[R_(o)],'Existing soldiers leave the field army. Households, provisions and herds move from the recruitment base; land and service obligations can become lasting political interests.');return n;
}
function serviceSettlementYear(){
  const s=S;for(const t of s.militarySettlements){const o=s.pols[t.pol];if(!o?.alive||s.pol[t.cell]!==o.id)continue;
    if(s.year-t.since<3&&s.pol[t.from]===o.id){const n=budgetAt(o,t.from,t.people*0.15);if(n>0)s.publicShipments.push({from:o.id,to:o.id,dest:t.cell,food:n,created:s.year,years:1,kind:'settlement support'})}
  }
  for(const i of WD.landIdx){if(s.serviceTroops[i]<=0&&s.serviceEstates[i]<=0)continue;const o=s.pol[i]?s.pols[s.pol[i]]:null;
    if(!o||!o.alive){s.serviceTroops[i]*=0.95;s.serviceEstates[i]*=0.995;continue}
    s.estateAge[i]++;s.serviceTroops[i]=Math.min(s.serviceTroops[i]*0.99+s.pop[i]*s.serviceEstates[i]*0.0002,s.pop[i]*0.08);
    const kept=o.rights>=0.25&&s.nutrition[i]>0.8,inheritance=s.estateAge[i]>25?clamp((o.nobles+o.rights)*(1-o.bureau*o.central),0,1):0;
    s.hereditaryEstates[i]=clamp(s.hereditaryEstates[i]+0.008*(inheritance-s.hereditaryEstates[i]),0,1);
    s.eliteStake[i]=clamp(s.eliteStake[i]+s.serviceEstates[i]*0.004,0,1);o.nobles=clamp(o.nobles+s.serviceEstates[i]*s.hereditaryEstates[i]*0.0004,0.1,0.95);
    s.serviceFree[i]=s.serviceTroops[i]*(kept?0.6:0.2)*s.eliteLoyalty[i];s.militaryLabor[i]+=s.serviceTroops[i]*0.12/Math.max(1,s.pop[i]);
  }
  if(s.year%5)return;
  for(const id of [...s.alive]){const o=s.pols[id];if(o.kind!=='state'||o.health<0.65||o.press<0.7||s.year-o.lastServiceSettlement<15||s.r()>0.08)continue;
    for(const i of s.realmCells.get(id)||[]){if(s.pop[i]<8000)continue;let done=false;for(let d=0;d<4;d++){const j=WD.nb[i*4+d];if(j>=0&&WD.land[j]&&s.pop[j]<1000&&foundServiceSettlement(o,i,j,Math.min(1600,s.pop[i]*0.04))>0){done=true;break}}if(done)break}
  }
}
function consolidationYear(){
  const s=S;s.seasonLevy.fill(0);s.levyFree.fill(0);s.defenseUsed.fill(0);s.militaryLabor.fill(0);s.serviceFree.fill(0);s.localGuardFree.fill(0);
  delegationYear();serviceSettlementYear();
  for(const id of [...s.alive]){const o=s.pols[id];if(!o.alive)continue;customaryInstitutions(o);planCampaign(o);musterSeasonal(o);offerSettledContingent(o)}
}

/* Pointer events are shared by touch, pen and mouse. Coordinates remain in CSS
   pixels; the canvas backing resolution must not enter gesture calculations. */
function installMapGestures(canvas,view,actions){
  const pointers=new Map();let base=null,gesture=false,lastTap=null;
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  const rebase=()=>{const p=[...pointers.values()];base=p.length?{x:p[0].x,y:p[0].y,ox:view.ox,oy:view.oy,z:view.z,
    cx:p.length>1?(p[0].x+p[1].x)/2:p[0].x,cy:p.length>1?(p[0].y+p[1].y)/2:p[0].y,
    distance:p.length>1?Math.max(1,Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)):0}:null};
  const repaint=()=>{actions.clamp();actions.draw()};
  const zoom=(x,y,z)=>{const next=Math.max(1,Math.min(8,z)),f=next/view.z;view.ox=x-(x-view.ox)*f;view.oy=y-(y-view.oy)*f;view.z=next;repaint()};
  canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();if(actions.interact)actions.interact();
    if(!pointers.size)gesture=false;pointers.set(e.pointerId,{...point(e),type:e.pointerType,start:point(e)});
    if(pointers.size>1){gesture=true;lastTap=null}canvas.setPointerCapture(e.pointerId);rebase();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)){if(e.pointerType!=='touch'&&actions.hover)actions.hover(point(e));return}
    e.preventDefault();const prior=pointers.get(e.pointerId),p=point(e);pointers.set(e.pointerId,{...prior,...p});
    const ps=[...pointers.values()];if(!base)return;
    if(ps.length>1){gesture=true;const cx=(ps[0].x+ps[1].x)/2,cy=(ps[0].y+ps[1].y)/2;
      const z=Math.max(1,Math.min(8,base.z*Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y)/base.distance)),f=z/base.z;
      view.ox=cx-(base.cx-base.ox)*f;view.oy=cy-(base.cy-base.oy)*f;view.z=z;repaint();
    }else{const dx=p.x-base.x,dy=p.y-base.y;if(Math.abs(dx)+Math.abs(dy)>4)gesture=true;
      if(gesture){view.ox=base.ox+dx;view.oy=base.oy+dy;repaint()}}
  });
  const finish=(e,cancelled)=>{
    const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);
    if(!cancelled&&!gesture&&!pointers.size){const at=point(e),now=e.timeStamp;
      if(p.type==='touch'&&lastTap&&now-lastTap.time<320&&Math.hypot(at.x-lastTap.x,at.y-lastTap.y)<24){zoom(at.x,at.y,view.z*1.8);lastTap=null}
      else{lastTap=p.type==='touch'?{...at,time:now}:null;if(actions.tap)actions.tap(at)}
    }else lastTap=null;
    if(canvas.hasPointerCapture&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(cancelled)gesture=true;rebase();
  };
  canvas.addEventListener('pointerup',e=>finish(e,false));
  canvas.addEventListener('pointercancel',e=>finish(e,true));
  canvas.addEventListener('lostpointercapture',e=>finish(e,true));
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(actions.interact)actions.interact();const p=point(e);zoom(p.x,p.y,view.z*Math.exp(-e.deltaY*0.0015))},{passive:false});
  return{zoom,active:()=>pointers.size};
}
// Fit the shortest wrapped longitude interval, including islands across the
// date line. Uses CSS dimensions and leaves room for controls and a highlight.
function fitMapCells(cells,world,dim,baseScale,padding=48){
  if(!cells.length||dim.w<=0||dim.h<=0||baseScale<=0)return null;
  const xs=[...new Set(cells.map(i=>world.cxA[i]))].sort((a,b)=>a-b);let gap=-1,start=xs[0],y0=Infinity,y1=-Infinity;
  for(let k=0;k<xs.length;k++){const next=xs[(k+1)%xs.length]+(k===xs.length-1?W:0),distance=next-xs[k];if(distance>gap){gap=distance;start=next%W}}
  for(const i of cells){y0=Math.min(y0,world.cyA[i]);y1=Math.max(y1,world.cyA[i])}
  const span=W-gap+1,width=span*SC,height=(y1-y0+1)*SC,margin=Math.min(padding,dim.w*0.18,dim.h*0.18);
  return{cx:(start+span/2)*SC,cy:(y0+y1+1)*SC/2,z:Math.max(1,Math.min(8,Math.min((dim.w-margin*2)/width,(dim.h-margin*2)/height)/baseScale))};
}
