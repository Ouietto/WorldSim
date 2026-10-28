'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/world.js','utf8')+fs.readFileSync(__dirname+'/climate.js','utf8');
eval(source+`
const base={format:'asabiya-climate-v1',grid:{width:4,height:2,lon0:-135,lat0:45,dx:90,dy:-90,wrap:true},period:'annual',units:{temperature:'degC',precipitation:'mm/year'},noData:null,temperature:[10,20,30,40,-10,-20,-30,null],precipitation:[100,200,300,400,500,600,700,null]};
let d=parseClimate(base),sample=climateSampler(d);
assert.equal(sample(45,-135,'temperature'),10);
assert.equal(sample(-45,-135,'temperature'),-10);
assert.equal(sample(45,225,'temperature'),10);
assert.equal(sample(45,-90,'temperature'),15);
assert.equal(sample(-45,135,'temperature')!==sample(-45,135,'temperature'),true);
assert.equal(sample(-45,90,'temperature'),-30); // normalize the sole observed neighbour
const south=Object.assign({},base,{grid:Object.assign({},base.grid,{lat0:-45,dy:90}),temperature:[-10,-20,-30,null,10,20,30,40],precipitation:[500,600,700,null,100,200,300,400]});
assert.equal(climateSampler(parseClimate(south))(45,-135,'temperature'),10);
const monthly=Object.assign({},base,{period:'monthly',units:{temperature:'K',precipitation:'mm/day'},temperature:Array.from({length:12},(_,m)=>Array(8).fill(273.15+m)),precipitation:Array.from({length:12},()=>Array(8).fill(1))});
d=parseClimate(monthly);
assert(Math.abs(d.temperature[0]-Array.from({length:12},(_,m)=>m*CLIMATE_DAYS[m]).reduce((a,b)=>a+b,0)/365)<1e-5);
assert.equal(d.precipitation[0],365);assert.equal(d.temperatureRange[0],11);assert.equal(d.dryMonths[0],1);assert.equal(d.growingMonths[0],6);
for(const change of [{format:'png'},{units:{temperature:'degC',precipitation:'inches'}},{temperature:[1,2]},{temperature:[NaN,20,30,40,-10,-20,-30,null]},{temperature:[150,20,30,40,-10,-20,-30,null]},{grid:Object.assign({},base.grid,{lat0:90})},{grid:Object.assign({},base.grid,{dx:89})}])assert.throws(()=>parseClimate(Object.assign({},base,change)),/Climate data/);
assert.throws(()=>parseClimate(Object.assign({},base,{noData:undefined})),/noData/);
const inflated=name=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/'+name,'utf8'),'base64')));
const climateBytes=inflated('earth_climate.b64');
const E=decodeEarth(inflated('earth_elev.b64'),inflated('koppen.b64'),climateBytes);
const world=genWorld({seed:'climate-test',earth:true,height:E.height,kg:E.kg,fit:true});
assert(world.climateMeta&&world.climateMeta.numeric);assert.equal(world.fitted,false);
const probes=[['Sahara',25.5,15.5,0,80],['Arabia',24.5,45.5,20,300],['Tarim',39.5,83.5,0,150],['Mongolia',46.5,103.5,80,400],['Amazon',-3.5,-60.5,1500,3500]];
for(const [label,lat,lon,min,max] of probes){const i=cellAt(lat,lon),p=world.Pr[i];assert(p>=min&&p<=max,label+' precipitation '+p);console.log(label+': '+p.toFixed(0)+' mm/year, '+world.T[i].toFixed(1)+' C')}
for(const i of world.landIdx){assert(Number.isFinite(world.T[i]));assert(Number.isFinite(world.Pr[i]));assert(world.Pr[i]>=0)}
assert(world.growingMonths&&world.rainSeasonality&&world.dryMonths);
console.log('Climate tests passed; numeric coverage '+(world.climateMeta.coverage*100).toFixed(1)+'% of the full land/ocean display grid.');
`);
