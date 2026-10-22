'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert');
const core=['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js','epidemics.js','connections.js','peoples.js','urbanism.js','civic.js','development.js','map-input.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
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

fixture();const town=pol(b);S.housing[b]=10000;S.urbanJobs[b]=9000;S.urban[b]=3000;town.grain=50000;S.eth[b]=S.ancestry[b]=1;S.animals[3][a]=500;
const beforePeople=people(),beforeAnimals=animals(),beforeFood=foodStocks();
const agreement=createSettlementAgreement(town,a,b,1000,'farm');assert(agreement&&agreement.durable,'a city can negotiate a funded settlement');
close(people(),beforePeople,'settlement transfers actual households');close(animals(),beforeAnimals,'settlement transfers actual herds');close(foodStocks()+agreement.people*0.06,beforeFood,'settlement grants transfer stocks and travel consumes provisions');assert(S.eth2[b]===0&&S.settleLag[b]>=2,'new farming households retain identity and miss establishing harvests');
const originalCell=S.pol[a];assert(originalCell===0,'admitting migrants does not annex their homeland');
for(let year=1;year<=40;year++){S.year=year;town.auxiliaries=0;settlementAgreementStep(town,agreement)}assert(!agreement.done&&agreement.loyalty>0.6,'land and service agreements last beyond the old 25-year cutoff');
const acceptedLoyalty=agreement.loyalty;town.rights=0.08;town.health=0.2;town.payroll=0.1;town.grain=0;S.food[b]=0;S.nutrition[b]=0.2;
for(let year=41;year<=80&&!agreement.done;year++){S.year=year;settlementAgreementStep(town,agreement)}assert(agreement.loyalty<acceptedLoyalty&&agreement.broken,'broken rights and support cause disaffection');

fixture();const poor=pol(b);poor.grain=0;S.food[b]=0;assert(!createSettlementAgreement(poor,a,b,1000,'farm'),'unfunded cities cannot receive a subsidized settlement');
fixture();const blocked=pol(b);blocked.grain=50000;WD.nb.fill(-1);assert(!createSettlementAgreement(blocked,a,b,1000,'farm'),'households need an accessible land route');
fixture();const edge=pol(a);edge.grain=50000;S.urban[a]=3000;S.ruralPatron[b]=edge.id;S.ruralSecurity[b]=0.8;const frontier=createSettlementAgreement(edge,c,b,500,'farm');assert(frontier&&S.pol[b]===0,'a frontier compact extends influence without instant annexation');

fixture();const victor=pol(a,'horde'),loser=pol(b,'horde');victor.army=10000;loser.army=1000;victor.grain=50000;
const peopleBefore=people(),flagBefore=S.pol[b];assert(submitPastoralPolity(victor,loser),'a stronger confederation can demand submission');assert(S.pol[b]===flagBefore&&loser.over===victor.id,'submission preserves local chiefs and territory');close(people(),peopleBefore,'submission creates no population');assert(!pastoralRival(victor,loser),'an accepted subject is not attacked every border pass');
const enemy=pol(c);victor.enemies.set(enemy.id,1);S.year=5;const troopsBefore=victor.army+loser.army;pastoralAdministration(loser);assert(S.militaryContracts.some(t=>!t.done&&t.state===victor.id&&t.horde===loser.id),'a submitted clan can supply a provisioned contingent');close(victor.army+loser.army,troopsBefore,'military service does not duplicate troops');assert(loser.loanedTroops>0,'loaned troops are withheld from the home command');
victor.alive=false;pastoralAdministration(loser);assert(!loser.over&&!loser.submission,'submission ends when the overlord disappears');

fixture();const shelter=pol(b),petitioners=pol(a,'horde');shelter.grain=50000;S.urban[b]=3000;S.farm[a]=0.2;S.food[a]=20000;assert(requestClanSettlement(petitioners,a),'losing clans can petition a reachable city');assert(shelter.compacts.some(t=>t.durable)&&S.societyCounters.negotiatedSettlers>0,'accepted petitions produce real settlement agreements');
fixture();const crown=pol(a);S.pol[b]=S.pol[c]=S.pol[d]=crown.id;crown.cells=4;crown.pop=40000;crown.staff=1000;crown.grain=100000;S.depot[c]=5000;S.realmCells.set(crown.id,[a,b,c,d]);S.urban[a]=3000;S.year=100;S.eth[b]=1;S.eth2[b]=0;S.mix[b]=0.2;
const clan={id:1,durable:true,host:crown.id,cell:b,eth:0,people:1500,promised:37.5,since:0,loyalty:0.9,failures:0,broken:false,done:false,mode:'farm',rights:0.8};crown.compacts.push(clan);routeDistances();S.r=()=>0;
const beforeDistribution=people();redistributeSettlers(crown);close(people(),beforeDistribution,'kingdom resettlement conserves households');assert(S.societyCounters.redistributedSettlers>0&&crown.compacts.length===2,'capable governments can negotiate distribution into another district');assert(S.mix[b]<0.2,'redistribution moves the agreed minority rather than unrelated majority residents');

fixture();const hybrid=pol(a,'horde');S.urban[a]=3000;S.levy[a]=500;S.farm[a]=1;S.eliteLoyalty[a]=0.8;hybrid.coalition=0.8;hybrid.rights=0.8;hybrid.succession=0.8;hybrid.grain=100000;
for(let year=0;year<20;year++){S.year=year;S.civicLabor.fill(0);pastoralAdministration(hybrid)}assert(hybrid.kind==='horde'&&hybrid.hybridYears>0,'farmland control alone never changes the government overnight');
const development=hybrid.hybridYears;S.urban[a]=0;for(let year=20;year<25;year++){S.year=year;pastoralAdministration(hybrid)}assert(hybrid.hybridYears<development,'loss of towns and specialists reverses development');
S.urban[a]=3000;for(let year=25;year<150&&hybrid.kind==='horde';year++){S.year=year;S.civicLabor.fill(0);hybrid.grain=100000;pastoralAdministration(hybrid)}assert(hybrid.kind==='state'&&hybrid.hybridGovernment,'sustained revenue, officials and cooperation can support mixed government');assert(S.herd[a]>0||S.farm[a]===1,'transition does not erase local livelihoods');

fixture();const constructionFood=foodStocks();urbanConstruction(a,null);assert(S.housing[a]>0&&S.housing[a]<100&&foodStocks()<constructionFood&&S.civicLabor[a]>0,'households build limited housing using real surplus and labor');
const builtHousing=S.housing[a];S.food[a]=0;S.civicLabor.fill(0);urbanConstruction(a,null);assert(S.housing[a]<builtHousing,'unfunded urban housing deteriorates');
fixture();S.housing[a]=10000;S.engineeringKnowledge[a]=0.8;const oldWater=urbanWaterCapacity(a);urbanConstruction(a,null);assert(urbanWaterCapacity(a)>oldWater,'funded engineering can expand constrained urban water supply');
fixture();const urbanPol=pol(a);S.urban[a]=3000;S.housing[a]=4000;S.urbanWater[a]=5000;const urbanBefore=S.urban[a];cityPass();close(S.urban[a],urbanBefore,'a census records real residents rather than replacing them with a target');
S.urban[a]=0;S.housing[a]=0;urbanPopulationYear();assert.equal(S.urban[a],0,'cities cannot grow without built housing');
S.housing[a]=10000;S.food[a]=30000;S.urbanWater[a]=10000;const regionalPopulation=people();for(let year=0;year<40;year++){S.civicLabor.fill(0);urbanPopulationYear()}assert(S.urban[a]>0&&S.urban[a]<1000,'urban residence grows gradually');close(people(),regionalPopulation,'local urbanization and migration conserve people');
const inhabited=S.urban[a];S.harvest[a]=0;S.foodImports[a]=0;S.nutrition[a]=0.3;urbanPopulationYear();assert(S.urban[a]<inhabited,'urban food and employment loss induces departure');

fixture();S.food.fill(0);for(const i of cells){S.need[i]=10000;S.urban[i]=3000}S.food[a]=13000;const freightFood=foodStocks(),account={transportLoss:0};localUrbanFreight(account);
assert(S.food[a]>=11200-0.001,'producers retain their own subsistence and buffer');assert(S.localFoodImports[b]+S.localFoodImports[d]>0,'neighboring towns receive actual grain');close(foodStocks()+account.transportLoss,freightFood,'competing towns cannot duplicate a hinterland surplus');

fixture();const cityOwner=pol(a);S.urban[a]=3000;S.housing[a]=4000;shatterGovernment(cityOwner,a);assert(S.urban[a]===3000&&S.housing[a]===4000,'political collapse does not erase viable urban settlement');
console.log('PASS: funded household settlement, durable bargains and withdrawal, accessible frontier agreements, reversible nomad submission, gradual mixed government, real urban residents, housing and food limits, finite competing hinterlands, cities surviving governments');
`);
