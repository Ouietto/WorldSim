const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const cnt=id=>{let n=0,p=0;for(const i of WD.landIdx)if(S.pol[i]===id){n++;p+=S.pop[i]}return [n,p]};
const done=[];const ew=endWar;endWar=function(war){if(war.claim&&war._s){const a=war.a[0],d=war.d[0],[na]=cnt(a),[nd]=cnt(d);
    done.push({y0:war._s.y,yrs:S.year-war._s.y,a0:war._s.na,d0:war._s.nd,pa:war._s.pa,pd:war._s.pd,da:na-war._s.na,dd:nd-war._s.nd,dDead:!(S.pols[d]&&S.pols[d].alive&&nd>0),
      prA:war._s.pr})}return ew.apply(this,arguments)};
while(S.year<-300){step();for(const id of S.activeWars){const war=S.wars[id];if(war&&war.claim&&!war._s){const a=war.a[0],d=war.d[0],[na,pa]=cnt(a),[nd,pd]=cnt(d);
    war._s={y:S.year,na,nd,pa,pd,pr:+(power(S.pols[a])/(power(S.pols[d])+1)).toFixed(2)}}}}
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1]};
console.log('claim wars ended',done.length,'| median years',med(done.map(w=>w.yrs)),'| attacker/defender power at start median',med(done.map(w=>w.prA)),
  '| attacker provinces at start median',med(done.map(w=>w.a0)),'defender',med(done.map(w=>w.d0)),
  '| attacker gained (median, mean)',med(done.map(w=>w.da)),(done.reduce((x,w)=>x+w.da,0)/Math.max(1,done.length)).toFixed(1),
  '| defender lost (median)',med(done.map(w=>-w.dd)),'| defender destroyed',done.filter(w=>w.dDead).length,
  '| attacker gained more than 30% of the defender',done.filter(w=>w.da>0.3*w.d0).length)})();`);
