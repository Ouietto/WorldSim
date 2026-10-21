const fs=require('fs'),zlib=require('zlib');
const core=['world.js','lang.js','hist.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('');
const elev=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/earth_elev.b64','utf8'),'base64'));
const kg=zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/koppen.b64','utf8'),'base64'));
eval(core.replace('function civilWar(o,breakup){','function civilWar(o,breakup){CW.push([S.year,o.cells,breakup?1:0]);').replace('function collapse(o){','function collapse(o){CO.push([S.year,o.cells]);')+`
var CW=[],CO=[];
const E=decodeEarth(new Uint8Array(elev),new Uint8Array(kg));
WD=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});
newHistory(process.argv[2]||'3');const END=+(process.argv[3]||0);
while(S.year<END){step();if(S.year%500===0){const al=S.alive.map(k=>S.pols[k]).filter(o=>o.kind==='state'&&o.cells>=30);
 const m={};for(const o of al)for(const k in o.why)m[k]=(m[k]||0)+o.why[k]/al.length;
 const big=CW.filter(c=>c[1]>=30).length,bc=CO.filter(c=>c[1]>=30).length;CW=[];CO=[];
 console.log(S.year,'big',al.length,'psi',Object.entries(m).map(([k,v])=>k+':'+v.toFixed(2)).join(' '),'h',(al.reduce((a,o)=>a+o.h,0)/al.length).toFixed(1),'md',(al.reduce((a,o)=>a+o.md,0)/al.length).toFixed(1),'S',(al.reduce((a,o)=>a+o.S,0)/al.length).toFixed(2),'cw30',big,'col30',bc,'top',al.sort((a,b)=>b.cells-a.cells).slice(0,4).map(o=>o.cells+':'+o.full+'@'+(WD.lat[o.capital]*57.3).toFixed(0)+','+((WD.cxA[o.capital]+.5)/W*360-180).toFixed(0)+' b'+o.born+' cr'+o.crises+' psi'+o.psi.toFixed(2)+' S'+o.S.toFixed(2)).join(' | '),'china',(S.chinaHist.at(-1)||[0,0])[1].toFixed(2),'med',(S.medHist.at(-1)||[0,0])[1].toFixed(2))}}
`);
