// why Egypt's first unifiers do not snowball (2026-11-26, after run 150): every war, 3500-2500 BCE (or to the end year), in which a
// state holding 15% of the Nile's people is a principal, with its share and power against the other side at the start, the war's
// goal, how long it ran, provinces each side took, whether it ended on terms, and the share of the Nile the state held at the end.
// Then a summary per role (attacking or attacked). Usage: egwar.js <seed> <endYear>
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const C=WD.regions.find(r=>r.k==='egypt').cells;const shOf=id=>{let t=0,v=0;for(const i of C){t+=S.pop[i];if(S.pol[i]===id)v+=S.pop[i]}return t?v/t:0};
const T0=-3500,END=+(process.argv[3]||-2500),log=[];
const dw=declareWar;declareWar=function(As,Ds,name,notable,civil,holy){const war=dw.apply(this,arguments);if(S.year<T0)return war;
  const a=S.pols[As[0].id??As[0]]||As[0],d=S.pols[Ds[0].id??Ds[0]]||Ds[0];
  for(const [me,ot,role] of [[a,d,'A'],[d,a,'D']]){if(!me||me.kind!=='state')continue;const sh=shOf(me.id);if(sh<0.15)continue;
    log.push({war,role,id:me.id,nm:me.full.slice(0,18),y:S.year,sh0:sh,osh:ot?shOf(ot.id):0,okind:ot?(ot.kind==='horde'?'horde':ot.tier):'-',pr:ot?power(me)/(power(ot)+1):0,goal:war.goal||'-',civil:!!civil,allies:0})}
  return war};
while(S.year<END){step();for(const e of log){if(e.end==null&&e.war.end!=null){e.end=e.war.end;e.shE=shOf(e.id);e.alive=S.pols[e.id].alive}}}
for(const e of log)if(e.end==null){e.end=null;e.shE=shOf(e.id)}
for(const e of log){const w=e.war,mine=e.role==='A'?w.gA:w.gD,theirs=e.role==='A'?w.gD:w.gA;e.mine=mine||0;e.theirs=theirs||0;e.terms=w.treaty!=null;e.n=(e.role==='A'?w.a.length:w.d.length)-1;e.m=(e.role==='A'?w.d.length:w.a.length)-1}
for(const e of log)console.log('W',e.y,e.role,e.id,e.nm.padEnd(18),'share',e.sh0.toFixed(2),'vs',e.okind,'share',e.osh.toFixed(2),'power x',e.pr.toFixed(2),'goal',e.goal,e.civil?'CIVIL':'','years',e.end!=null?e.end-e.y:'open','took',e.mine.toFixed(1),'lost',e.theirs.toFixed(1),e.terms?'terms':'','allies',e.n,'against',e.m,'share at end',(e.shE??0).toFixed(2),e.alive===false?'(ended)':'');
for(const role of ['A','D'])for(const civ of [false,true]){const L=log.filter(e=>e.role===role&&e.civil===civ&&e.end!=null);if(!L.length)continue;const md=a=>{a=a.slice().sort((x,y)=>x-y);return a[a.length>>1]};
  const won=L.filter(e=>e.mine>=e.theirs+1).length,lost=L.filter(e=>e.theirs>=e.mine+1).length;
  console.log('SUM',role==='A'?'attacking':'attacked',civ?'(civil)':'','wars',L.length,'won',won,'lost',lost,'even',L.length-won-lost,'median years',md(L.map(e=>e.end-e.y)),'median took',md(L.map(e=>e.mine)).toFixed(1),'median power x',md(L.map(e=>e.pr)).toFixed(2),'on terms',L.filter(e=>e.terms).length,'median share change',md(L.map(e=>(e.shE??0)-e.sh0)).toFixed(3))}
const ys=log.filter(e=>e.role==='A'&&!e.civil).map(e=>e.y);console.log('wars started by a 15% state per century',(ys.length/((END-T0)/100)).toFixed(2))})();`);
