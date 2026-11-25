const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const hk=HI.horse,tk=TI.horse;
while(S.year<-300){step();if(S.year%250===0&&S.year>=-4500){let n=0,nt=0,la0=90,la1=-90,lo0=180,lo1=-180,pop=0,np=0;const cells=[];
  for(const i of WD.landIdx){if(S.pop[i]<1)continue;const d=S.dom[hk][i],t=S.tk[tk][i];if(t>=0.5)nt++;if(d>0.3){n++;pop+=S.pop[i];const [la,lo]=latLonOf(WD,i);la0=Math.min(la0,la);la1=Math.max(la1,la);lo0=Math.min(lo0,lo);lo1=Math.max(lo1,lo);if(cells.length<3)cells.push(la.toFixed(0)+','+lo.toFixed(0))}}
  // the front: horse herds next to provinces without them, and why those neighbours have none
  let edge=0,nbPop=0,nbPast=0,nbFarm=0,nbN=0;for(const i of WD.landIdx){if(!(S.dom[hk][i]>0.3))continue;for(let d=WD.nbS[i];d<WD.nbS[i+1];d++){const j=WD.nbA[d];if(j<0||!WD.land[j]||S.dom[hk][j]>0.3)continue;edge++;nbN++;nbPop+=S.pop[j]>=1?1:0;nbPast+=S.past[j]||0;nbFarm+=S.farm[j]||0}}
  console.log(S.year,'horse herds in',n,'provinces',(pop/1e6).toFixed(2)+'M people','riding tech in',nt,'box lat',la0.toFixed(0)+'..'+la1.toFixed(0),'lon',lo0.toFixed(0)+'..'+lo1.toFixed(0),'e.g.',cells.join(' '),'| edge links',edge,'neighbours peopled',(nbPop/Math.max(1,nbN)).toFixed(2),'pasture',(nbPast/Math.max(1,nbN)).toFixed(2),'farm',(nbFarm/Math.max(1,nbN)).toFixed(2),'| first',JSON.stringify(S.domFirst&&S.domFirst[hk]))}}})();`);
