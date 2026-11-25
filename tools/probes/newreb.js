// the first years of rebel states born of civil wars in realms of 8+ provinces: taxes, distance to their own capital, burden
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const watch=[];const cw0=civilWar;civilWar=function(o,b){const n0=polCells(o.id).length,p0=S.pols.length;const r=cw0.apply(this,arguments);if(n0>=8&&o.kind==='state')for(let k=p0;k<S.pols.length;k++)if(watch.length<12)watch.push({id:k,y:S.year,from:o.id,fromCplx:+(o.cplx||0).toFixed(2)});return r};
while(S.year<+(process.argv[3]||-2600)&&!(watch.length>=12&&S.year>watch[11].y+4)){step();
  for(const w of watch){if(S.year-w.y>4)continue;const o=S.pols[w.id];if(!o.alive){continue}const C=polCells(w.id);let md=0;for(const i of C)md+=S.dist[i]>=65534?99:S.dist[i];md/=Math.max(1,C.length);
    console.log('reb',w.id,'born',w.y,'age',S.year-w.y,'prov',C.length,'pop',Math.round(o.pop),'tax',o.tax==null?'-':Math.round(o.tax),'mean dist',md.toFixed(1),'h',(o.h||0).toFixed(1),'cplx',(o.cplx||0).toFixed(2),'parent cplx',w.fromCplx,'burden',(o.burden||0).toFixed(1),'pT',(o.pT||0).toFixed(1),'pC',((o.why||{}).pC||0).toFixed(1),'treas',(o.treas||0).toFixed(2))}}})();`);
