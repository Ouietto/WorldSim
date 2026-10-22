'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert');
const core=['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js','epidemics.js','connections.js','peoples.js','urbanism.js','map-input.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
const bytes=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/'+f,'utf8'),'base64')));
const citySource=fs.readFileSync(__dirname+'/ui.js','utf8').split('function cityMapItems(){')[1].split('function drawMap(){')[0];
eval(core+`
const E=decodeEarth(bytes('earth_elev.b64'),bytes('koppen.b64'),bytes('earth_climate.b64'));
const world=genWorld({seed:'Earth',earth:true,height:E.height,kg:E.kg,fit:true});WD=world;
const a=cellAt(32,44),b=a+1,c=a+2,d=a+W,line=[a,b,c,a+3,a+4,a+5];
function fixture(){
  WD=world;newHistory('dynamics');S.year=0;S.animalOrigins=[];S.hearths.forEach(h=>h.done=true);
  WD=Object.assign({},world,{landIdx:Int32Array.from([...line,d]),coastIdx:new Int32Array(0),
    rv:Float32Array.from(world.rv),riverNav:Float32Array.from(world.riverNav),down:Int32Array.from(world.down),
    riverHead:new Int32Array(N).fill(-1),riverNext:new Int32Array(N).fill(-1),rough:new Float32Array(N),coast:new Uint8Array(N),nomad:new Uint8Array(N),sF:Float32Array.from(world.sF),land:new Uint8Array(N)});
  for(const i of WD.landIdx)WD.land[i]=1;
  S.pop.fill(0);S.food.fill(0);S.pol.fill(0);S.young.fill(0);S.eth.fill(0);S.ancestry.fill(0);S.rel.fill(-1);S.urban.fill(0);S.node.fill(0);S.city.fill(-1);S.cities=[];S.tradeEdges=[];S.forest.fill(0);S.organisation.fill(0.5);
  for(const i of WD.landIdx){S.pop[i]=10000;S.young[i]=3000;S.K[i]=100000;S.food[i]=20000;S.farm[i]=1;seedLocalCrops(i);S.cropAdapt[bestCrop(i)][i]=1;S.herd[i]=1;S.nutrition[i]=1;S.integ[i]=0.8;S.infrastructure[i]=0.6;WD.rv[i]=0;WD.riverNav[i]=0;WD.down[i]=-1;S.sail[i]=0;S.roads[i]=0}
}
function polity(i,kind){const id=newPolity(i,null,{kind:kind||'state'}),o=S.pols[id];o.pop=S.pop[i];o.health=1;o.payroll=1;o.h=10;return o}
function totalAnimals(){let n=0;for(const f of S.animals)for(const i of WD.landIdx)n+=f[i];for(const id of S.activeMigs)for(const v of S.migs[id].animals)n+=v;for(const p of S.press.values())for(const v of p.animals||[])n+=v;return n}
function people(){let n=0;for(const i of WD.landIdx)n+=S.pop[i];for(const id of S.activeMigs)n+=S.migs[id].pop;for(const p of S.press.values())n+=p.p;return n}
function close(x,y,why){assert(Math.abs(x-y)<Math.max(1e-5,Math.abs(y)*1e-7),why+': '+x+' / '+y)}

fixture();S.horse[a]=1;refreshAnimalAccess(a);assert.equal(S.mounts[a],0,'riding knowledge does not create horses');
S.animals[3][a]=1000;refreshAnimalAccess(a);assert(S.mounts[a]>0,'breeders provide actual riding capacity');
const animals0=totalAnimals(),pop0=people();foundSettlement(a,b,1000,null);
close(totalAnimals(),animals0,'settlers transfer animals');close(people(),pop0,'settlers transfer people');
assert(S.animals[3][b]>0);economyPass();assert(S.accounts.fodder>0&&Math.abs(S.accounts.error)<0.01,'fodder is an explicit food use');
fixture();S.animals[0][a]=1000;S.year=5;const cash=S.food[a]+S.food[b]+S.food[d];animalPass();
assert(Math.abs(S.animalAccounts.error)<1e-6,'births, deaths and trading conserve animal stocks');
assert(S.animals[0][b]>0&&S.animals[0][c]===0,'breeders cannot cross two links in one diffusion pass');
close(S.food[a]+S.food[b]+S.food[d],cash,'animal purchases transfer food');
assert.equal(world.tsetse[cellAt(12,105)],0,'Earth tropical Asia does not inherit African tsetse');
WD=world;newHistory('buffalo');assert(animalSuitability(1,cellAt(12,105))>0.4,'humid Asian farming can support buffalo');
const buffaloOrigin=S.animalOrigins.find(h=>h.kind===1);assert(buffaloOrigin&&animalSuitability(1,buffaloOrigin.cell)>0.8,'buffalo founders have a viable wet or riverine habitat');
S.year=buffaloOrigin.year;animalOrigins();const buffaloFounders=S.animals[1].reduce((n,v)=>n+v,0);
for(let y=0;y<20;y+=5){S.year+=5;animalPass()}assert(S.animals[1].reduce((n,v)=>n+v,0)>buffaloFounders,'a supplied founder herd can breed instead of immediately going extinct');
WD=world;newHistory('camels');const camelOrigin=S.animalOrigins.filter(h=>h.kind===4).at(-1);assert(camelOrigin&&animalSuitability(4,camelOrigin.cell)>0.9,'camel breeders start in viable arid habitat');S.year=camelOrigin.year;animalOrigins();const camelFounders=S.animals[4].reduce((n,v)=>n+v,0);for(let y=0;y<20;y+=5){S.year+=5;animalPass()}assert(S.animals[4].reduce((n,v)=>n+v,0)>camelFounders,'camels can use arid scrub instead of requiring temperate pasture');

fixture();const river=polity(a);for(const i of line)S.pol[i]=river.id;river.cells=line.length;river.pop=60000;
for(let k=0;k<line.length-1;k++){WD.down[line[k]]=line[k+1];WD.riverHead[line[k+1]]=line[k]}
for(const i of line){WD.riverNav[i]=1;WD.rv[i]=1;S.sail[i]=1}
assert(routeCost(a,b,river,false)<routeCost(b,a,river,false),'upstream orders travel more slowly');
routeDistances();const boatResponse=S.dist[c]+S.returnDist[c],boatBulk=S.supplyDist[c];
assert(S.returnDist[c]>S.dist[c],'return-trip latency is measured separately');
for(const i of line){WD.riverNav[i]=0;S.sail[i]=0}routeDistances();
assert(S.dist[c]+S.returnDist[c]>boatResponse&&S.supplyDist[c]>boatBulk,'navigable corridors improve communication and bulk supply');
const walking=routeCost(a,b,river,false);S.horse[a]=S.horse[b]=1;
close(routeCost(a,b,river,false),walking,'horse technology without animals cannot speed messengers');
S.animals[3][a]=S.animals[3][b]=1000;refreshAnimalAccess(a);refreshAnimalAccess(b);
assert(routeCost(a,b,river,false)<walking,'actual riding animals speed messengers');
WD.down[a]=d;WD.rv[a]=1;assert(crossingRiver(a,b)>0&&crossingRiver(a,d)===0,'a river is a crosswise barrier and a longitudinal corridor');
const flat=borderBarrier(b,c);WD.rough[c]=0.9;assert(borderBarrier(b,c)>flat,'mountain frontiers have a defensive barrier');

fixture();for(const i of [a,b,c]){S.urban[i]=5000;S.sail[i]=1;WD.rv[i]=1;WD.riverNav[i]=1}
WD.down[a]=c;buildTradeNetwork();const riverTrade=S.tradeEdges.find(e=>e.a===a&&e.b===c||e.a===c&&e.b===a);
assert(riverTrade&&riverTrade.reverseCost!==riverTrade.cost,'trade retains upstream and downstream costs');
WD.down[a]=b;buildTradeNetwork();assert(S.tradeEdges.find(e=>e.a===a&&e.b===b).capacity>500,'bulk river capacity upgrades an existing local exchange edge');
const exporter=polity(a),transit=polity(b),importer=polity(c);exporter.enemies.set(transit.id,0);transit.enemies.set(exporter.id,0);
S.tradeEdges=[{a,b:c,cost:0.01,capacity:500,via:[b,c]}];S.food[a]=20000;S.food[c]=1000;S.need[a]=S.need[c]=10000;
const beforeTransit=S.food[c];tradeFood({transportLoss:0});assert.equal(S.food[c],beforeTransit,'hostile intermediate territory blocks a trade shortcut');

fixture();WD.rangeExposure=Float32Array.from(world.rangeExposure);WD.rangeExposure[b]=0.8;S.frontierDanger[b]=0.4;S.threatFrom[b]=a;WD.nomad[b]=1;WD.sF[b]=0.22;WD.rv[b]=0.8;assert(!settledStateHabitat(b),'ordinary pasture does not support a sedentary fiscal state');S.urban[b]=15000;assert(settledStateHabitat(b),'a dense agricultural river enclave can form a state within the steppe');
fixture();const frontier=polity(a);frontier.pop=40000;frontier.occupation=3000;frontier.grain=10000;frontier.central=0.5;frontier.bureau=0.3;S.pop[b]=0;
assert(!frontierReady(frontier,a,b),'small states without transport have an expensive frontier');
S.animals[0][a]=4000;S.animals[2][a]=2000;refreshAnimalAccess(a);
assert(frontierReady(frontier,a,b),'traction and pack supply lower the frontier population requirement');
S.urban[a]=6000;frontier.cells=2;assert.equal(tierOf(frontier),'City-state','urban local government can remain a city state');
frontier.cells=25;frontier.pop=1e6;frontier.bureau=0.4;assert.equal(tierOf(frontier),'Empire');

fixture();const conqueror=polity(a);conqueror.cells=6;conqueror.conquestLoad=2;conqueror.recentShare=0.7;conqueror.ruler.conq=6;conqueror.ruler.char=0.9;
const brittle=successionExposure(conqueror,conqueror.ruler);conqueror.succession=0.95;conqueror.bureau=0.8;conqueror.trust=0.9;
assert(successionExposure(conqueror,conqueror.ruler)<brittle*0.3,'institutions can preserve a conqueror realm');
fixture();const fragile=polity(a);for(const i of line)S.pol[i]=fragile.id;fragile.cells=6;fragile.pop=60000;fragile.conquestLoad=3;fragile.recentShare=1;fragile.ruler.conq=10;S.r=()=>0;
succession(fragile);assert.equal(S.societyCounters.successionFractures,1);assert(S.alive.length>1,'disputed succession creates actual successor polities');

fixture();const ready=polity(a),neglected=polity(b);ready.grain=1e7;ready.bureau=0.7;ready.succession=0.8;ready.army=neglected.army=500;
for(const k of ['records','school'])S.tk[TI[k]][a]=1;
neglected.grain=0;neglected.payroll=0;
for(let year=1;year<=100;year++){S.year=year;strategicStep(ready,a,year);strategicStep(neglected,b,year)}
assert(ready.preparedness>neglected.preparedness&&ready.crisisMemory>neglected.crisisMemory,'funded training and records preserve readiness through peace');
assert(ready.peaceYears===100&&ready.health===1,'peace does not impose automatic state decay');

fixture();const horde=polity(a,'horde');for(const i of [a,b,c,d])S.pol[i]=horde.id;horde.cells=4;horde.pop=40000;horde.grain=1000;horde.army=300;horde.staff=40;
S.clan[a]=S.clan[d]=1;S.clan[b]=S.clan[c]=2;S.realmCells.set(horde.id,[a,b,c,d]);
assert(releaseClan(horde,2),'member clans can leave');
const successors=S.alive.map(id=>S.pols[id]);close(successors.reduce((n,o)=>n+o.grain,0),1000,'clan separation divides provisions');close(successors.reduce((n,o)=>n+o.army,0),300,'clan separation divides troops');
fixture();const raider=polity(a,'horde'),defender=polity(b);for(let n=0;n<200;n++)crisisEncounter(raider,defender,true,0.01);
assert(raider.raidSkill<=1&&raider.raidTargets.get(defender.id).knowledge<=1,'learning has a ceiling');
const attraction=raidAttraction(raider,a,b);for(let n=0;n<6;n++)crisisEncounter(raider,defender,false,0.1);
assert(raidAttraction(raider,a,b)<attraction,'repeated defeats encourage choosing another target');

fixture();const attacker=polity(a,'horde'),incumbent=polity(b);attacker.rights=0.9;attacker.ruler.comp=0.9;
S.eliteStake[b]=0.95;S.eliteLoyalty[b]=0.95;incumbent.rights=0.9;incumbent.mandate=1;
const secure=eliteDefectionChance(attacker,b);incumbent.health=0.15;incumbent.payroll=0;incumbent.mandate=0.1;S.eliteLoyalty[b]=0.1;
assert(eliteDefectionChance(attacker,b)>secure,'credible rival protection matters when incumbent protection fails');
const population=people(),authority=attacker.nobles;assert(switchEliteAllegiance(attacker,b));close(people(),population,'elite defection is not demographic replacement');
assert(S.autonomy[b]>=0.8&&attacker.nobles>authority,'local bargains constrain the new center');

fixture();const host=polity(b);S.pop[a]-=2000;S.young[a]-=600;
const M=startMigration({eth:1,pop:2000,young:600,food:1000,cell:a,dx:1,dy:0,kind:'people'});host.grain=0;
assert.equal(admissionChance(M,b,host),0,'admission needs real provisions');host.grain=5000;
const stock=foodStocks()+M.food,populationBefore=people();assert(admitMigration(M,b,host));settleMigration(M,b,host);
close(foodStocks(),stock,'a settlement grant transfers provisions');close(people(),populationBefore,'admission conserves people');assert.equal(host.compacts.length,1);
host.grain=0;S.nutrition[b]=0.25;for(let n=1;n<=24;n++){S.year=n;compactStep(host)}
assert(S.societyCounters.brokenCompacts>0&&S.migs.some(m=>m.cause==='broken compact'),'persistent broken promises can create an armed breakaway');
close(people(),populationBefore,'compact rebellion draws from actual settlers');

fixture();S.eth[b]=S.ancestry[b]=1;S.animals[3][a]=100;const cargo=takeHerd(a,0.5);S.pop[a]-=5000;S.young[a]-=1500;
const coalition=startMigration({eth:0,pop:5000,young:1500,food:3000,animals:cargo,cell:a,dx:1,dy:0,kind:'warband'});coalition.steps=5;const coalitionPeople=people(),coalitionHerds=totalAnimals();S.r=()=>0;recruitMigration(coalition,b);
assert(coalition.groups.length===2,'a mobile coalition can incorporate another community');close(people(),coalitionPeople,'coalition recruitment transfers actual households');close(totalAnimals(),coalitionHerds,'coalition recruitment transfers actual animals');
S.pop[c]=0;S.food[c]=0;settleMigration(coalition,c,null);assert(S.eth2[c]===1&&S.mix[c]>0,'mixed migrant cohorts retain cultural minorities when settling empty land');

fixture();const coastal=polity(a);WD.coast[a]=1;S.sail[a]=1;S.node[a]=1;WD.coastalCrop=Float32Array.from(world.coastalCrop);WD.coastalCrop[a]=1;coastal.cityPop=2000;coastal.grain=5000;
const coastalFunds=coastal.grain;localPolitics(a,coastal);assert(S.orchards[a]>0&&coastal.grain<coastalFunds,'coastal agricultural investment needs market access and actual funds');
coastal.grain=0;S.orchards[a]=0;localPolitics(a,coastal);assert.equal(S.orchards[a],0,'unfunded coastal investment does not create productive capital');

fixture();S.cities=[{cell:a,name:'Small town'},{cell:b,name:'Regional center'}];S.urban[a]=1000;S.pop[a]=200000;S.urban[b]=15000;
const ui={cities:'major',page:null};const cityMapItems=eval('(function cityMapItems(){'+citySource.trim()+')');
assert.deepEqual(cityMapItems().map(c=>c.name),['Regional center'],'major-city filtering uses urban residents');
ui.cities='all';assert.equal(cityMapItems().length,2);ui.cities='hidden';assert.equal(cityMapItems().length,0);
ui.cities='capitals';const capital=polity(a);assert.equal(cityMapItems()[0].cell,a,'capital seats remain available even without a large city');

function frontierReplay(){
fixture();S.year=-2000;S.eth[b]=S.eth[c]=1;
const cities=polity(a),nomads=polity(c,'horde');S.pol[b]=cities.id;S.pol[d]=nomads.id;
for(const i of [a,b,c,d]){S.pop[i]=60000;S.young[i]=18000;S.food[i]=60000;S.s[i]=0.65;S.organisation[i]=0.75;S.cityIdentity[i]=0.5;S.infrastructure[i]=0.8;S.animals[0][i]=8000;S.animals[3][i]=3000;S.animals[2][i]=2000;refreshAnimalAccess(i);for(const k of ['records','storage','office','law','census','succession','post','charter','school'])S.tk[TI[k]][i]=0.9}
WD.nomad[c]=WD.nomad[d]=1;for(const o of [cities,nomads]){o.pop=120000;o.cells=2;o.grain=50000;o.staff=600;o.army=2000;o.bureau=0.5;o.central=0.4;o.rights=0.6;o.succession=0.7}
declareWar([cities],[nomads],'mixed frontier scenario',true);for(let y=0;y<300;y++){step();assert(Math.abs(S.accounts.error)<0.01,'mixed scenario food ledger '+S.year+' '+JSON.stringify(S.accounts));for(const id of S.alive){const o=S.pols[id];for(const k of ['health','grain','preparedness','crisisMemory','raidSkill','conquestLoad'])assert(Number.isFinite(o[k])&&o[k]>=0,'mixed scenario '+k)}for(const id of S.activeMigs){const m=S.migs[id];close(m.groups.reduce((n,g)=>n+g.pop,0),m.pop,'mixed migrating cohorts')}}
assert(S.pols.some(o=>o&&o.rulers.length>1),'mixed scenario exercises succession');
return [S.chron.length,S.migs.length,...WD.landIdx.map(i=>S.pop[i]),...S.alive.map(id=>S.pols[id].grain)];}
assert.deepEqual(frontierReplay(),frontierReplay(),'advanced mixed-frontier dynamics reproduce with the same seed');
console.log('PASS: herds and fodder, staged animal diffusion, river directions and crossings, communication and supply, frontier costs, city states, succession, readiness, clans, raider learning, elite bargains, migrant compacts and city filters');
`);
