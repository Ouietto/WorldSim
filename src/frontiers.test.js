'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert');
const core=['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js','epidemics.js','connections.js','peoples.js','urbanism.js','civic.js','development.js','map-input.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
const bytes=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/'+f,'utf8'),'base64')));
eval(core+`
const earth=decodeEarth(bytes('earth_elev.b64'),bytes('koppen.b64'),bytes('earth_climate.b64'));
const world=genWorld({seed:'Earth',earth:true,height:earth.height,kg:earth.kg,fit:true});WD=world;
const a=cellAt(32,44),b=a+1,c=a+2,d=a+W,e=b+W,f=c+W,cells=[a,b,c,d,e,f];
function fixture(){
  WD=world;newHistory('frontiers');S.year=0;S.hearths.forEach(h=>h.done=true);S.animalOrigins=[];
  WD=Object.assign({},world,{landIdx:Int32Array.from(cells),coastIdx:new Int32Array(0),land:new Uint8Array(N),
    rangeExposure:new Float32Array(N),sH:Float32Array.from(world.sH),rough:new Float32Array(N),rv:new Float32Array(N),nomad:new Uint8Array(N),
    nb:new Int32Array(N*4).fill(-1),tcost:new Float32Array(N).fill(1)});
  S.pop.fill(0);S.food.fill(0);S.pol.fill(0);S.young.fill(0);S.eth.fill(0);S.eth2.fill(-1);S.ancestry.fill(0);S.rel.fill(-1);S.forest.fill(0);S.urban.fill(0);S.node.fill(0);S.flow.fill(0);S.s.fill(0.7);
  for(const i of cells){WD.land[i]=1;WD.sH[i]=1;S.pop[i]=10000;S.young[i]=3000;S.K[i]=10000;S.food[i]=12000;S.nutrition[i]=1;S.wm[i]=1;S.farm[i]=1;seedLocalCrops(i);S.cropAdapt[bestCrop(i)][i]=1;S.organisation[i]=0.6;S.infrastructure[i]=0.5;S.integ[i]=0.8;
    const neighbors=[i-1,i+1,i-W,i+W].filter(j=>cells.includes(j)&&Math.abs(WD.cxA[j]-WD.cxA[i])+Math.abs(WD.cyA[j]-WD.cyA[i])===1);neighbors.forEach((j,k)=>WD.nb[i*4+k]=j);
  }
}
function pol(i,kind='state'){const o=S.pols[newPolity(i,null,{kind})];o.pop=S.pop[i];o.cells=1;o.health=o.payroll=1;o.h=10;S.realmCells.set(o.id,[i]);return o}
function close(x,y,label){assert(Math.abs(x-y)<Math.max(0.001,Math.abs(y)*1e-7),label+': '+x+' / '+y)}
function people(){let n=cells.reduce((n,i)=>n+S.pop[i],0);for(const id of S.activeMigs)n+=S.migs[id].pop;for(const p of S.press.values())n+=p.p;return n}
function herd(){let n=0;for(const a of S.animals)for(const i of cells)n+=a[i];for(const id of S.activeMigs)for(const v of S.migs[id].animals)n+=v;for(const p of S.press.values())for(const v of p.animals||[])n+=v;return n}

fixture();S.cropAccess.forEach(f=>f.fill(0));assert.equal(farmSuit(a),0,'farming knowledge cannot create a locally absent crop');seedLocalCrops(a);S.year=5;agroPass();assert(S.cropAccess.some(f=>f[b]>0)&&S.cropAccess.every(f=>f[c]===0),'crop packages spread one contact stage at a time');
const andes=cellAt(-13,-72);WD=world;newHistory('highland-crops');seedCrop(andes,5);S.cropAdapt[5][andes]=1;assert(farmSuit(andes)>0.1,'adapted highland crops have viable Andean potential');
const beforeTerrace=farmSuit(andes);S.terraces[andes]=1;assert(farmSuit(andes)>beforeTerrace,'terraces improve usable highland ground');
const arid=cellAt(30,54);seedLocalCrops(arid);const beforeWater=farmSuit(arid);S.waterworks[arid]=1;assert(farmSuit(arid)>beforeWater,'local catchment water can improve dry plateau farming');
fixture();const innovator=pol(a);innovator.pop=1000000;innovator.grain=1000000;innovator.cells=20;for(const p of TECH[TI.gun].pre)S.tk[p][a]=1;
for(let y=0;y<100;y++)inventionPass(innovator);assert.equal(S.gun[a],0,'wealth and prerequisites alone cannot bypass practical chemical and craft experience');
S.gun[a]=1;assert.equal(gunEffect(a),0,'gunpowder knowledge supplies no free weapons');S.firearms[a]=1000;assert(gunEffect(a)>0.5);

fixture();const farmer=pol(a);S.pol[c]=farmer.id;farmer.pop=20000;farmer.cells=2;S.realmCells.set(farmer.id,[a,c]);farmer.grain=10000;S.depot[c]=0;
assert.equal(publicAvailable(farmer,c),0,'a remote garrison cannot spend the capital treasury');
assert.equal(budgetAt(farmer,c,100),0);S.tradeEdges=[{a,b:c,cost:0.1,capacity:1000,via:[b]}];
let accounts={transportLoss:0};regionalFreight(accounts);assert.equal(S.depot[c],0,'uncontrolled transit cuts public freight');
S.pol[b]=farmer.id;const stocks=foodStocks();regionalFreight(accounts);assert(S.depot[c]>0,'a controlled route carries provisions');close(foodStocks()+accounts.transportLoss,stocks,'public shipping conserves food');
assert(S.tradeEdges[0].freightUsed<=450,'government freight respects shared capacity');
S.fort[c]=1;S.depot[c]=0;for(let y=0;y<25;y++)maintainWalls({consumed:0});assert(S.wallHealth[c]<0.1,'unpaid walls deteriorate despite a rich capital');
S.depot[c]=10000;const oldCondition=S.wallHealth[c];for(let y=0;y<10;y++)maintainWalls({consumed:0});assert(S.wallHealth[c]>oldCondition,'local funding repairs defenses');
fixture();S.fort[b]=0.9;economyPass();assert(Math.abs(S.accounts.error)<0.01,'autonomous wall maintenance is accounted for');

fixture();const h=pol(a,'horde'),target=pol(c);S.pop[c]=300000;S.food[c]=300000;target.pop=300000;h.army=100000;h.pop=1000000;S.fort[b]=1;
let route=migrationRoute(h,a,1000000);assert(route.includes(c)&&!route.includes(b),'a wall redirects movement around its end toward a weaker crossing');
S.wallBreach[b]=0.9;route=migrationRoute(h,a,1000000);assert(route.includes(b),'an existing gap makes the direct corridor attractive');
assert.equal(S.societyCounters.wallBreaches,0,'route planning cannot breach walls or spend supplies');
S.wallHealth[b]=0.3;S.wallBreach[b]=0;const M=startMigration({eth:0,pop:20000,cell:a,dx:1,dy:0,kind:'horde',pol:h,food:0});S.r=()=>0;
assert(!migrationWallPass(M,b),'an unfunded migration cannot force a defended crossing');M.food=20000;S.year++;
assert(migrationWallPass(M,b)&&S.wallBreach[b]>0.8,'a supplied party can exploit a weak section');

fixture();const source=pol(a,'horde'),rival=pol(b,'horde');source.pop=100000;source.army=10000;rival.pop=30000;rival.army=300;rival.coalition=0.1;S.animals[3][b]=500;
const moving=startMigration({eth:0,pop:30000,cell:a,dx:1,dy:0,kind:'horde',pol:source,food:50000});moving.experience=0.8;S.r=()=>0;
let p0=people(),animals0=herd();assert(migrationNomadEncounter(moving,b));close(people(),p0,'joining a migration moves real people');close(herd(),animals0,'joining a migration moves real herds');assert(S.societyCounters.migrationAccessions===1);
fixture();const displaced=pol(b,'horde');S.pol[c]=displaced.id;displaced.cells=2;displaced.pop=20000;displaced.army=100;displaced.preparedness=0;S.realmCells.set(displaced.id,[b,c]);
const wave=startMigration({eth:0,pop:80000,cell:a,dx:1,dy:0,kind:'horde',food:0});wave.mil=3;wave.S=1;S.r=()=>0.1;
p0=people();assert(migrationNomadEncounter(wave,b));close(people(),p0,'flight ahead of a migration conserves cohorts');assert(S.societyCounters.migrationRetreats===1&&S.activeMigs.length===2,'one movement can trigger another');
fixture();const victim=pol(b,'horde');victim.army=50000;victim.pop=100000;const raidingParty=startMigration({eth:0,pop:15000,cell:a,dx:1,dy:0,kind:'horde',food:0});S.r=()=>0.99;
assert.equal(migrationNomadEncounter(raidingParty,b),null,'a stronger resistant coalition can fight instead of joining or fleeing');

fixture();const employer=pol(a),provider=pol(b,'horde');employer.grain=10000;employer.army=0;provider.army=1000;provider.armyFree=550;provider.defFree=450;
const contract=createMilitaryContract(employer,provider,300,4);assert(contract&&provider.loanedTroops===300);assert.equal(provider.army+employer.army,1000,'hiring does not create troops');
S.year=contract.arrives;militaryContractsYear();assert(provider.armyFree<550&&employer.foreignFree>0,'the same warriors cannot campaign for both partners');
S.tk[TI.iron][a]=1;S.tk[TI.iron][b]=0;S.firearms[a]=100;const force=campaignForce(employer,a,false);assert(force>0&&employer.campaignAuxShare===1);
const statePeople=S.pop[a],homePeople=S.pop[b];armyLoss(employer,a,20,employer.campaignAuxShare);close(S.pop[a],statePeople,'foreign losses do not remove native recruits');assert(S.pop[b]<homePeople&&contract.troops<300);
const skillBefore=provider.raidSkill;S.year=contract.end;militaryContractsYear();assert(contract.done&&provider.loanedTroops===0&&provider.raidSkill>skillBefore);
assert(S.tk[TI.iron][b]>0&&S.tk[TI.iron][b]<0.5,'veterans bring prototypes rather than instant nationwide adoption');assert(S.firearms[b]>0&&S.firearms[a]<100,'returned equipment comes out of real employer stocks');
fixture();const patron=pol(a),clans=pol(b,'horde'),unifier=pol(c,'horde');patron.grain=10000;clans.army=1000;clans.armyFree=550;clans.defFree=450;unifier.grain=10000;const loan=createMilitaryContract(patron,clans,300);S.year=loan.arrives;militaryContractsYear();assert(patron.foreignFree>0);incorporateClans(unifier,clans);assert(loan.done&&patron.foreignFree===0,'clan incorporation cannot duplicate an overseas contingent');

fixture();const payer=pol(a),protector=pol(b,'horde');payer.grain=1000;payer.central=0;createProtectionPact(payer,protector,100);
const reserves=foodStocks(),recipientStores=protector.grain;protectionDiplomacy(payer);assert(protectedByTreaty(payer,protector));close(foodStocks(),reserves,'protection payments are transfers in transit');assert.equal(protector.grain,recipientStores,'tribute cannot arrive instantly');
payer.grain=0;S.year++;protectionDiplomacy(payer);S.year++;protectionDiplomacy(payer);assert(!protectedByTreaty(payer,protector)&&protector.installTarget===payer.id,'missed payments open a dynastic conflict');

fixture();const occupier=pol(a);S.pol[b]=occupier.id;S.eth[b]=1;S.ancestry[b]=1;occupier.warLaw='Expulsion permitted';occupier.rights=0.4;occupier.payroll=1;S.depot[b]=100000;S.urban[b]=3000;S.newcomers[b]=2000;S.integ[b]=0.8;S.taken[b]=0;S.unrest[b]=0;S.r=()=>0.99;
for(let y=1;y<=60;y++){S.year=y;coerciveOccupation(b,occupier)}assert.equal(S.eth[b],occupier.core,'sustained funded coercion and contact can shift a local majority in two generations');assert.equal(S.ancestry[b],1,'linguistic shift preserves ancestry');
fixture();const invader=pol(a);S.eth[b]=1;S.ancestry[b]=1;S.animals[3][b]=100;S.r=()=>0.99;p0=people();animals0=herd();expelCohort(b,invader,0.4);close(people(),p0,'expulsion conserves surviving people');close(herd(),animals0,'refugees retain their moved herds');
const youngBefore=S.young[b],maleBefore=S.maleShare[b],lost=selectiveMortality(b,0.5);close(S.young[b],youngBefore,'selective adult mortality does not kill child cohorts');assert(lost>0&&S.maleShare[b]<maleBefore);

fixture();const old=pol(a,'horde');old.born=-200;old.clanPops.set(1,10000);old.clanTerms.set(1,{loyalty:0.6,joined:-200});old.trust=0.2;old.succession=0.1;old.grain=10000;S.r=()=>0.99;
for(let y=0;y<100;y+=5){S.year=y;confederationStep(old)}const unsupported=old.coalitionFatigue;old.coalitionFatigue=0;old.patronage=1;
for(let y=0;y<100;y+=5){S.year=y;confederationStep(old)}assert(old.coalitionFatigue<unsupported*0.3,'delivered settled patronage can sustain an aging coalition');assert(old.alive,'age is a source of stress, not a fixed expiry');

fixture();const remote=pol(a,'horde');S.farm.fill(0);S.urban.fill(0);let memory=new Map();const random=S.r,ownership=Array.from(S.pol);assert(!confederationVisibility('near',memory).has(remote.id));S.farm[c]=1;S.pop[c]=30000;S.urban[c]=3000;
assert(confederationVisibility('near',memory).has(remote.id),'proximity exposes the whole coalition');S.farm[c]=0;S.year=9;assert(confederationVisibility('near',memory).has(remote.id));S.year=11;assert(!confederationVisibility('near',memory).has(remote.id),'visibility grace expires');
assert.equal(confederationVisibility('off',memory).size,0);assert(confederationVisibility('on',memory).has(remote.id));assert.equal(S.r,random);assert.deepEqual(Array.from(S.pol),ownership,'display filters cannot change territorial simulation');

// Exercise the annual ordering with a real foreign contract and a mobile group,
// rather than testing only the individual decisions above.
fixture();const west=pol(a),east=pol(c),nomads=pol(e,'horde');S.pol[b]=west.id;S.pol[d]=east.id;
for(const o of [west,east,nomads]){o.pop=o===nomads?10000:20000;o.cells=o===nomads?1:2;o.grain=50000;o.army=1500;o.staff=200;o.bureau=0.5;o.central=0.5;o.succession=0.6}
for(const i of cells){S.depot[i]=5000;S.animals[3][i]=400;refreshAnimalAccess(i);S.horse[i]=S.herd[i]=1;for(const k of ['records','storage','law','office'])S.tk[TI[k]][i]=1}
S.farm[e]=S.farm[f]=0;WD.nomad[e]=WD.nomad[f]=1;WD.rangeExposure[e]=WD.rangeExposure[f]=0.9;
declareWar([west],[east],'provisioned frontier scenario',true);assert(createMilitaryContract(west,nomads,300));
const party=takeHerd(f,0.5);S.pop[f]-=5000;S.young[f]-=1500;S.food[f]-=5000;startMigration({eth:0,pop:5000,young:1500,food:5000,animals:party,cell:f,dx:-1,dy:0,kind:'warband'});
for(let y=0;y<80;y++){step();assert(Math.abs(S.accounts.error)<0.01,'integrated frontier food ledger');
  for(const id of S.alive){const o=S.pols[id];for(const k of ['grain','army','foreignFree','loanedTroops','coalitionFatigue'])assert(Number.isFinite(o[k])&&o[k]>=0,'integrated frontier '+k)}
  for(const id of S.activeMigs){const m=S.migs[id];close(m.groups.reduce((n,g)=>n+g.pop,0),m.pop,'integrated mobile cohorts')}
}
console.log('PASS: local provisioning, walls, least-resistance routes, migration accessions and cascades, foreign service, tribute, demographic consequences, coalition longevity and visibility');
`);
