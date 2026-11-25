const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
let shown=0;const lw0=learnWar;learnWar=function(o,i,win,dif){if(!isFinite(dif)&&shown<2){shown++;const q=S.pol[i];
  const R=o.ruler;console.log('year',S.year,'pol',o.id,o.full,'cell i',i,'owner of i',q,'win',win);
  console.log(' strength',strength(o),'S',o.S,'s',S.s[i],'milAt',milAt(i,1),'localForce',localForce(o,i),'mom',o.mom,'vet',o.vet,'mil',R&&R.mil,'comp',R&&R.comp,'aggr',R&&R.aggr,'tax',o.tax,'pop',o.pop,'garr',o.garr,'arms',o.arms,'mpR',o.mpR,'coord',o.coord,'h',o.h,'dist',S.dist[i]);
  if(o.arm)console.log(' armies',JSON.stringify(o.arm));
  if(shown===1){const j=[...Array(WD.nbS[i+1]-WD.nbS[i])].map((_,k)=>WD.nbA[WD.nbS[i]+k]).find(j=>j>=0&&S.pol[j]&&o.enemies.has(S.pol[j]));if(j!=null){const dq=S.pols[S.pol[j]];try{console.log(' j',j,'siege',siegeSupply(o,i),'mobA',mobOf(o,i,j,1),'mobD',mobOf(dq,j,j),'ecoD',ecoD(j,o),'uni',S.uni[j],'circE j',S.circE[j],'cereal j',cerealEff(j),'trop',WD.trop[j],'defense j',defense(j),'Ua base',Math.pow(strength(o)+1,P.scaleExp)*(0.5*o.S+0.5*S.s[i])*milAt(i,1)*hReach(o,dd(i)))}catch(e){console.log('err',e.message)}}}
  try{console.log(' defense(i)',defense(i),'integ',S.integ[i],'thr',S.thr&&S.thr[i],'circE',S.circE[i],'cerealEff',cerealEff(i),'ecoD',ecoD(i,o),'fort',S.fort[i])}catch(e){console.log(e.message)}}
  return lw0.apply(this,arguments)};
while(S.year<+(process.argv[3]||-2300)&&shown<2)step();console.log('done',S.year)})();`);
