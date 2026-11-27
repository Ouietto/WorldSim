// a sweep for broken state (2026-11-27): every 100 years, non-finite numbers in every living realm's fields and in the province arrays,
// provinces held by dead realms, realms not holding their capital, active wars with a dead or missing principal, and enemies maps that
// point at wars already ended. Prints the first examples of each. Usage: sanity.js <seed> <endYear>
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};const END=+(process.argv[3]||-1000);const seen={};
const note=(k,msg)=>{seen[k]=(seen[k]||0)+1;if(seen[k]<=3)console.log(S.year,k,msg)};
const ARR=['pop','K','integ','s','dist','fl','fh','fhM','flM','wk','chk','qD','qT','lev','thr','salt','farm','irrig','car','roads'];
while(S.year<END){step();if(S.year%100!==0)continue;const s=S,w=WD;
  for(const id of s.alive){const o=s.pols[id];if(!o){note('alive-missing',id);continue}if(!o.alive)note('alive-but-dead',o.full);
    for(const [k,v] of Object.entries(o)){if(typeof v==='number'&&!isFinite(v))note('nonfinite '+k,o.full+' '+v)}
    if(o.ruler)for(const [k,v] of Object.entries(o.ruler))if(typeof v==='number'&&!isFinite(v))note('nonfinite ruler.'+k,o.full+' '+v);
    if(o.les)for(const v of o.les)if(!isFinite(v))note('nonfinite les',o.full);
    if(o.arm)for(const a of o.arm){if(!(a.at>=0)||a.at>=N)note('army nowhere',o.full+' '+a.at);if(a.sk!=null&&!isFinite(a.sk))note('nonfinite army sk',o.full)}
    if(s.pol[o.capital]!==id)note('capital not held',o.full+' cap '+o.capital+' held by '+s.pol[o.capital]);
    for(const [q,wid] of o.enemies){const war=s.wars[wid];if(!war)note('enemy war missing',o.full);else if(war.end!==0)note('enemy war ended',o.full+' war '+war.name+' ended '+war.end);const t=s.pols[q];if(!t||!t.alive)note('enemy dead',o.full+' vs '+(t?t.full:q))}}
  for(const wid of s.activeWars){const war=s.wars[wid];if(!war){note('active war missing',wid);continue}if(war.end!==0)note('active war ended',war.name);
    if(!(war.gA>=0)||!(war.gD>=0))note('war gains nonfinite',war.name+' '+war.gA+' '+war.gD)}
  for(const i of w.landIdx){const p=s.pol[i];if(p){const o=s.pols[p];if(!o||!o.alive)note('province held by dead realm',i+' '+(o?o.full:p))}
    for(const k of ARR){const A=s[k];if(A&&A.length===N&&!isFinite(A[i]))note('nonfinite s.'+k,'province '+i+' '+A[i])}}
  if(S.year%500===0)console.log(S.year,'swept',Object.keys(seen).length?JSON.stringify(seen):'clean')}
console.log('END',JSON.stringify(seen))})();`);
