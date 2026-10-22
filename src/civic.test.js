'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert');
const core=['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js','epidemics.js','connections.js','peoples.js','urbanism.js','civic.js','development.js','consolidation.js','map-input.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
const bytes=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/'+f,'utf8'),'base64')));
eval(core+`
const earth=decodeEarth(bytes('earth_elev.b64'),bytes('koppen.b64'),bytes('earth_climate.b64'));
const world=genWorld({seed:'Earth',earth:true,height:earth.height,kg:earth.kg,fit:true});WD=world;
const a=cellAt(32,44),b=a+1,c=a+2,d=a+W,e=b+W,f=c+W,cells=[a,b,c,d,e,f];
function fixture(){
  WD=world;newHistory('civic');S.year=0;P.invent=P.allyRate=P.disease=1;S.hearths.forEach(h=>h.done=true);S.animalOrigins=[];
  WD=Object.assign({},world,{landIdx:Int32Array.from(cells),coastIdx:new Int32Array(0),land:new Uint8Array(N),rangeExposure:new Float32Array(N),rough:new Float32Array(N),coast:new Uint8Array(N),rv:new Float32Array(N),nomad:new Uint8Array(N),tcost:new Float32Array(N).fill(1),nb:new Int32Array(N*4).fill(-1)});
  S.pop.fill(0);S.food.fill(0);S.pol.fill(0);S.young.fill(0);S.eth.fill(0);S.eth2.fill(-1);S.ancestry.fill(0);S.rel.fill(-1);S.forest.fill(0);S.urban.fill(0);S.node.fill(0);S.flow.fill(0);S.s.fill(0.7);S.cities=[];S.city.fill(-1);S.tradeEdges=[];
  for(const i of cells){WD.land[i]=1;S.pop[i]=10000;S.young[i]=3000;S.K[i]=100000;S.food[i]=20000;S.harvest[i]=14000;S.need[i]=10000;S.nutrition[i]=1;S.wm[i]=1;S.farm[i]=1;seedLocalCrops(i);S.cropAdapt[bestCrop(i)][i]=1;S.organisation[i]=0.7;S.infrastructure[i]=0.7;S.integ[i]=0.8;
    const ns=[i-1,i+1,i-W,i+W].filter(j=>cells.includes(j)&&Math.abs(WD.cxA[j]-WD.cxA[i])+Math.abs(WD.cyA[j]-WD.cyA[i])===1);ns.forEach((j,k)=>WD.nb[i*4+k]=j)}
}
function pol(i,kind='state'){const o=S.pols[newPolity(i,null,{kind})];o.pop=S.pop[i];o.cells=1;o.health=o.payroll=1;o.h=20;o.rights=o.trust=0.8;o.preparedness=1;o.staff=500;o.army=3000;S.realmCells.set(o.id,[i]);return o}
function close(x,y,label){assert(Math.abs(x-y)<Math.max(0.01,Math.abs(y)*1e-6),label+': '+x+' / '+y)}
function people(){return cells.reduce((n,i)=>n+S.pop[i],0)}
function animals(){return S.animals.reduce((n,h)=>n+cells.reduce((v,i)=>v+h[i],0),0)}

fixture();const firstCity=pol(a);S.urban[a]=5000;firstCity.grain=10000;civicWorksAt(a,firstCity);assert.equal(S.cityWall[a],0,'an isolated first city gets no automatic wall');
const rival=pol(b);firstCity.enemies.set(rival.id,1);firstCity.grain=0;S.food[a]=0;civicWorksAt(a,firstCity);assert.equal(S.cityWall[a],0,'a threat cannot finance a wall');
for(let year=0;year<80;year++){S.civicLabor.fill(0);firstCity.grain=10000;civicWorksAt(a,firstCity)}assert(S.cityWall[a]>0.4&&S.engineeringKnowledge[a]>0.2,'funded construction develops physical works and practical knowledge');
const held=S.cityWallHealth[a];firstCity.grain=0;S.food[a]=0;for(let year=0;year<20;year++){S.civicLabor.fill(0);civicWorksAt(a,firstCity)}assert(S.cityWallHealth[a]<held*0.5,'unfunded high-quality walls still decay');
fixture();S.engineeringKnowledge[a]=0.9;S.tradeEdges=[{a,b:c,privateUsed:1000,freightUsed:0}];shareEngineering();assert(S.engineeringKnowledge[c]>0&&S.cityWall[c]===0,'contact transfers designs without building free walls');assert.equal(S.engineeringKnowledge[f],0,'unconnected cities do not automatically inherit regional designs');

fixture();economyPass();const baselineHarvest=S.harvest[a],baselineFood=S.food[a];fixture();S.civicLabor[a]=0.1;economyPass();assert(S.harvest[a]<baselineHarvest&&Math.abs(S.accounts.error)<0.01,'civic construction competes with harvest labor');
fixture();S.cityWall[a]=1;economyPass();close(S.food[a],baselineFood,'walls alone create no storage capacity');fixture();S.granaries[a]=1;economyPass();assert(S.food[a]>baselineFood,'paid physical granaries support larger reserves');
fixture();const toolmaker=pol(a);S.metal[a]=S.iron[a]=1;const knowledgeOnly=milAt(a);S.militaryEquipment[a]=200;assert(milAt(a)>knowledgeOnly,'military benefit needs actual working equipment');S.militaryEquipment[a]=0;S.workshops[a]=1;toolmaker.grain=0;S.food[a]=0;civicWorksAt(a,toolmaker);assert.equal(S.militaryEquipment[a],0,'knowing metallurgy does not supply unpaid equipment');

fixture();const city=pol(a);city.grain=50000;S.urban[a]=5000;P.allyRate=0;S.r=()=>0.99;const residents=people();
for(let year=5;year<=25;year+=5){S.year=year;S.civicLabor.fill(0);ruralAgreements()}assert(S.ruralInfluence[b]>0&&S.pol[b]===0,'rural influence precedes a territorial transfer');
for(let year=30;year<=220;year+=5){S.year=year;S.civicLabor.fill(0);ruralAgreements();for(const i of cells)S.ruralInfluence[i]*=Math.pow(0.998,5)}
assert(S.ruralInfluence[b]>0.85);S.civicLabor.fill(0);assert(incorporateHinterland(city,a,b),'a sustained funded agreement can incorporate neighboring farms');close(people(),residents,'rural incorporation does not spawn settlers');assert(S.autonomy[b]>=0.7&&S.ancestry[b]===0,'incorporation preserves local people and rights');
fixture();const exposed=pol(a);exposed.grain=50000;S.urban[a]=5000;exposed.army=0;assert(ruralProtection(exposed,a,b)<0.35,'capital walls cannot replace rural patrols');S.ruralPatron[b]=exposed.id;S.ruralInfluence[b]=1;S.ruralYears[b]=200;assert(!incorporateHinterland(exposed,a,b),'unsupported influence cannot annex a frontier');

fixture();const patron=pol(a),client=pol(b);patron.grain=100000;client.over=patron.id;client.league=true;S.cityIdentity[b]=0.9;S.node[b]=1;S.urban[b]=4000;const reserves=foodStocks();
for(let year=0;year<80;year++){S.year=year;civicUnionStep(client)}assert(client.alive&&client.civicUnion.progress<1,'a strong civic identity resists rapid passive absorption');close(foodStocks(),reserves,'integration support travels from existing patron reserves');
client.civicUnion.progress=1;client.civicUnion.years=120;patron.staff=2000;const staffTotal=patron.staff+client.staff,armyTotal=patron.army+client.army,unionPeople=people();
assert(integrateCivicPolity(client,patron));close(people(),unionPeople,'negotiated union conserves people');close(patron.staff,staffTotal,'peaceful union preserves officials');close(patron.army,armyTotal,'peaceful union transfers existing troops');assert(S.cityIdentity[b]>0.8&&S.autonomy[b]>=0.65,'a charter preserves civic identity and autonomy');

fixture();const scholar=pol(a);S.urban[a]=5000;S.node[a]=0.6;const efficient=innovationEfficiency(a,scholar);S.urban[a]=1000;assert(innovationEfficiency(a,scholar)<efficient,'concentrated supported specialists improve invention efficiency');S.urban[a]=5000;S.nutrition[a]=0.3;assert(innovationEfficiency(a,scholar)<efficient*0.2,'crowding cannot override hunger');
fixture();const scholars=pol(a);scholars.pop=50000;scholars.grain=0;scholars.cult=1;S.pol[c]=scholars.id;scholars.cells=2;S.realmCells.set(scholars.id,[a,c]);S.urban[a]=S.urban[c]=6000;S.pop[c]=30000;S.depot[c]=50000;S.workshops[c]=0.8;S.recordPractice[c]=200;S.farm[c]=1;
inventionPass(scholars);assert(scholars.researchCities===1&&S.cityProjects.get(c)?.[TI.writing]>0,'a non-capital city can fund a writing project without a large territorial state');assert(!S.cityProjects.has(a),'a funded secondary city cannot spend an unfunded capital budget');
const progress=S.cityProjects.get(c)[TI.writing];S.depot[c]=0;S.civicLabor.fill(0);inventionPass(scholars);close(S.cityProjects.get(c)[TI.writing],progress,'projects cannot progress without actual provisions');

fixture();const defenders=pol(b),besieger=pol(a);S.urban[b]=5000;S.cityWall[b]=S.cityWallHealth[b]=S.engineeringKnowledge[b]=1;besieger.grain=100000;S.r=()=>0;
assert(!besiegeCity(besieger,a,b,1000),'an intact city needs a sustained siege');const oneAttempt=S.siegeProgress[b];besiegeCity(besieger,a,b,1000);close(S.siegeProgress[b],oneAttempt,'repeated calls cannot complete a siege in one year');
for(let year=1;year<25&&cityWallStrength(b)>0.3;year++){S.year=year;besiegeCity(besieger,a,b,1000)}assert(cityWallStrength(b)<=0.3,'a funded prolonged siege can breach a city');

fixture();const aging=pol(a,'horde');aging.born=0;aging.succession=aging.trust=aging.patronage=aging.momentum=aging.sharedThreat=0;aging.coalitionFatigue=0.8;aging.hunger=0.3;aging.strain=0.4;aging.clanTerms.set(1,{loyalty:0.2});S.year=30;const youngRisk=confederationBreakupRisk(aging);S.year=100;const oldRisk=confederationBreakupRisk(aging);assert(oldRisk>youngRisk,'generational strain accelerates breakup risk');aging.patronage=1;aging.succession=0.8;aging.trust=0.8;aging.clanTerms.set(1,{loyalty:0.9});assert(confederationBreakupRisk(aging,1)<oldRisk*0.1,'real patronage and durable bargains can sustain an old coalition');S.year=150;S.r=()=>0.99;confederationStep(aging);assert(aging.alive,'age is not a hard confederation expiry');
fixture();const breaking=pol(a,'horde'),town=pol(b),receiving=pol(c,'horde');S.pol[d]=breaking.id;S.realmCells.set(breaking.id,[a,d]);breaking.pop=20000;breaking.cells=2;breaking.grain=5000;S.animals[3][a]=S.animals[3][d]=500;S.urban[b]=4000;town.grain=10000;S.eth[b]=S.ancestry[b]=1;receiving.coalition=0.8;S.r=()=>0.5;
const beforeScatter=people(),beforeHerds=animals(),beforeProvisions=foodStocks(),beforeYoung=cells.reduce((n,i)=>n+S.young[i],0);assert(dissolveConfederation(breaking));close(people(),beforeScatter,'confederation breakup conserves all households');close(animals(),beforeHerds,'confederation breakup conserves herds');close(cells.reduce((n,i)=>n+S.young[i],0),beforeYoung,'children move with their actual households');close(foodStocks()+S.societyCounters.scatteredClans*0.06,beforeProvisions,'scattering transfers provisions and consumes explicit travel costs');assert(S.pol[a]===0&&S.pop[a]>0&&!breaking.alive,'remaining people become autonomous clans');assert(S.societyCounters.clansReceivedByCities>0&&S.societyCounters.clansJoiningConfederations>0,'different contingents settle near cities and join neighboring coalitions');assert(S.campMoves.length>1&&S.eth2[b]===0,'scattered movement leaves visible mixed communities');

fixture();const shattered=pol(a,'horde');shatterGovernment(shattered,a);assert(S.societyCounters.confederationBreakups===1&&!shattered.alive,'loss of a nomad administrative center uses the same dispersal mechanism');
fixture();const west=pol(a),east=pol(c),nomads=pol(e,'horde');S.urban[a]=S.urban[c]=4000;S.pol[b]=west.id;S.pol[d]=east.id;west.cells=east.cells=2;west.pop=east.pop=20000;S.realmCells.set(west.id,[a,b]);S.realmCells.set(east.id,[c,d]);S.farm[e]=0;S.herd[e]=1;S.animals[3][e]=400;
for(const o of [west,east,nomads])o.grain=30000;declareWar([west],[east],'civic scenario',true);
for(let year=0;year<150;year++){step();assert(Math.abs(S.accounts.error)<0.02,'integrated civic food ledger');for(const i of cells)for(const field of ['pop','food','cityWall','cityWallHealth','engineeringKnowledge','granaries','civicLabor','militaryEquipment','ruralInfluence','siegeProgress'])assert(Number.isFinite(S[field][i])&&S[field][i]>=0,'finite civic '+field)}
console.log('PASS: funded city defenses and storage, labor costs, practical equipment, staged rural agreements and civic unions, multi-city invention, sieges, conditional confederation breakup and conserved scattering; 150-year integrated scenario');
`);
