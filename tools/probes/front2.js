// how much of the leading realm of Egypt and Mesopotamia counts as a cohesion-building frontier, and how many people stand across it
const fs=require('fs'),zlib=require('zlib'),path=require('path');const SRC=process.env.SRC||path.join(__dirname,'..','..','src');
const core=['world.js','climate.js','lang.js','hist.js','crops.js','herds.js','tech.js','society.js','provinces.js'].map(f=>fs.readFileSync(path.join(SRC,f),'utf8')).join('\n');
const B=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(path.join(SRC,f),'utf8'),'base64')));
eval(core+`;(function(){const E=decodeEarth(B('earth_elev.b64'),B('koppen.b64'),B('earth_climate.b64'));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
useWorld(provinceWorld(WD,decodePid(B('earth_pid.b64')),{fp:B('earth_fp.b64'),lake:B('earth_lake.b64')}));
newHistory(process.argv[2]||'1');const step=()=>{const g=stepG();while(!g.next().done){}};
const BX={meso:WD.regions.find(r=>r.k==='meso').cells,egypt:WD.regions.find(r=>r.k==='egypt').cells};const w=WD;
while(S.year<+(process.argv[3]||-1000)){step();if(S.year%250===0&&S.year>=-3500){const F=frontBand();
  for(const k in BX){const cnt=new Map();for(const i of BX[k]){const p=S.pol[i];if(p)cnt.set(p,(cnt.get(p)||0)+S.pop[i])}let bk=0,bv=0;for(const [p,v] of cnt)if(v>bv){bv=v;bk=p}const o=S.pols[bk];if(!o)continue;
    let P=0,Pf=0,ss=0,n=0,core=0;const across=[];for(const i of WD.landIdx){if(S.pol[i]!==bk)continue;P+=S.pop[i];ss+=S.s[i]*S.pop[i];n++;if(F[i]){Pf+=S.pop[i]}
      // a province on the line itself: the people across it of another people or faith, against its own
      let f=0,ac=0;const ei=S.eth[i],ri=S.rel[i];for(let e=w.nbS[i];e<w.nbS[i+1];e++){const j=w.nbA[e];if(j<0||!w.land[j]||S.pol[j]===bk)continue;const ej=S.eth[j];
        if((ej>=0&&ei>=0&&ej!==ei&&ethDist(ei,ej)>0.22)||(ri>=0&&S.rel[j]>=0&&S.rel[j]!==ri)){f=1;ac+=S.pop[j]}}
      if(f)across.push(ac/(S.pop[i]+1))}
    across.sort((a,b)=>a-b);const md=across.length?across[across.length>>1]:null;
    console.log(S.year,k.padEnd(5),o.full.slice(0,22).padEnd(22),'prov',n,'people on a frontier band',(Pf/P).toFixed(2),'cohesion',(ss/P).toFixed(2),'| provinces on the line',across.length,'people across / own: median',md==null?'-':md.toFixed(3),'share under 0.05',across.length?(across.filter(x=>x<0.05).length/across.length).toFixed(2):"-")}}}console.log("treach",S.treachN||0,"cFall",S.cFallN||0)})();`);
