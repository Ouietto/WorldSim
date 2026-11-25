// corruption of the five most populous states every 250 years, with what drives it, and the reform counters
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
while(S.year<+(process.argv[3]||-1500)){step();if(S.year%250===0&&S.year>=-3500){const st=S.alive.map(id=>S.pols[id]).filter(o=>o.kind==='state').sort((a,b)=>b.pop-a.pop).slice(0,5);
  let ch=0,n=0;if(S.chk)for(const i of WD.landIdx){if(S.chk[i]>0.1)ch++;n++}
  console.log(S.year,'| provinces with checks',ch,'|',st.map(o=>o.full.slice(0,16)+' age '+(S.year-o.born)+' cor '+(o.cor||0).toFixed(2)+' E/Et '+(o.E/etOf(o)).toFixed(1)+' burden '+(o.burden||0).toFixed(1)+' vig '+(o.vig??0).toFixed(2)).join(' ; '))}}
console.log('reform from the top',S.refTopN||0,'backlash',S.refBackN||0,'local checks arose',S.refLocN||0,'bribed gates',S.bribeN||0)})();`);
