// civil wars of realms with 8+ provinces: the court's condition when it broke out, and how it ended
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const rec=[];const cw0=civilWar;civilWar=function(o,b){const n0=polCells(o.id).length;if(n0<8||o.kind!=='state')return cw0.apply(this,arguments);
  const r={y:S.year,id:o.id,n0,why:Object.entries(o.why||{}).filter(e=>e[1]>0.3).map(e=>e[0]+e[1].toFixed(1)).join(' '),org:o.origin&&o.origin.type,age:S.year-o.born,psi:+(o.psi||0).toFixed(1),owed:+(o.owed||0).toFixed(2),treas:+(o.treas||0).toFixed(2),eE:+(o.E/etOf(o)).toFixed(1)};const w0=S.wars.length;
  const out=cw0.apply(this,arguments);r.fell=!o.alive||polCells(o.id).length===0||S.pols[o.id].cells===0;r.n1=o.alive?polCells(o.id).length:0;
  const war=S.wars.length>w0?S.wars[S.wars.length-1]:null;if(war&&war.civil){r.war=war.id;r.reb=war.a.length}rec.push(r);return out};
while(S.year<+(process.argv[3]||-1000))step();
for(const r of rec){if(r.war!=null){const w=S.wars[r.war];r.yrs=(w.end||S.year)-w.start;r.out=w.outcome||'ongoing';r.gA=Math.round(w.gA);r.gD=Math.round(w.gD);
  const o=S.pols[r.id];r.n2=o.alive?polCells(r.id).length:0}}
const n=rec.length,wars=rec.filter(r=>r.war!=null);const tab={};for(const r of wars){const k=r.out.replace(/^[^ ]+ /,'');tab[k]=(tab[k]||0)+1}
console.log('civil wars in realms of 8+ provinces',n,'court fell at once',rec.filter(r=>r.war==null).length,'fought out',wars.length);
console.log('outcomes',JSON.stringify(tab));
const med=a=>{a=a.filter(x=>x!=null).sort((x,y)=>x-y);return a.length?a[a.length>>1]:null};
console.log('median at outbreak: stress',med(rec.map(r=>r.psi)),'pay owed',med(rec.map(r=>r.owed)),'elite/offices',med(rec.map(r=>r.eE)),'| share with pay owed > 0.3',(rec.filter(r=>r.owed>0.3).length/Math.max(1,n)).toFixed(2));
console.log('fought out: provinces before / after outbreak / at end (median)',med(wars.map(r=>r.n0)),med(wars.map(r=>r.n1)),med(wars.map(r=>r.n2)),'years',med(wars.map(r=>r.yrs)),'rebels took',med(wars.map(r=>r.gA)),'court took',med(wars.map(r=>r.gD)));
for(const r of rec.slice(0,40))console.log(r.y,r.n0,'>',r.n1,'psi',r.psi,'age',r.age,r.org,r.why);})();`);
