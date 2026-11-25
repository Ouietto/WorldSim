// first year each place is farmed (farm > 0.5), province world; also the strain lag at the place when farmed
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
const END=+(process.argv[3]||-4000),seed=process.argv[2]||'1';
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(seed);
const PL={Asikli:[38.35,34.23],Ulucak:[38.45,27.45],Knossos:[35.3,25.16],Thessaly:[39.5,22.3],Karanovo:[42.5,25.9],Koros:[46.6,20.3],Saxony:[51.3,12.4],Paris:[48.8,2.4],Wiltshire:[51.2,-1.9],Apulia:[41.3,16.3],Valencia:[39.5,-0.4],Zealand:[55.5,11.8],Mehrgarh:[29.4,67.6],Harappa:[30.6,72.9]};
const G=(la,lo)=>uAtF((lo+180)/360*W,(90-la)/180*H),U={},F={};for(const k in PL)U[k]=G(...PL[k]);
const step=()=>{const g=stepG();while(!g.next().done){}};
while(S.year<END){step();if(S.year%10===0)for(const k in U){if(F[k]==null&&S.farm[U[k]]>0.5){const i=U[k],c=S.crop[i];F[k]=S.year+(c>=0&&S.sAd?' '+CROPS[c].k+' lag '+(S.sAd[i*CROPS.length+c]-WD.sumDry[i]).toFixed(2):' nocrop')}}}
console.log((process.env.SW||'now')+' seed '+seed+' '+JSON.stringify(F));})();`);
