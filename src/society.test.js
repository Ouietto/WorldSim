'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert');
const core=['world.js','lang.js','hist.js','society.js','dynamics.js','ecology.js','frontiers.js'].map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
const bytes=f=>new Uint8Array(zlib.inflateSync(Buffer.from(fs.readFileSync(__dirname+'/'+f,'utf8'),'base64')));
const uiSource=fs.readFileSync(__dirname+'/ui.js','utf8');
const inspectorSource=uiSource.slice(uiSource.indexOf('function renderPage(){'),uiSource.indexOf('function originText('));
eval(core+`
const earth=decodeEarth(bytes('earth_elev.b64'),bytes('koppen.b64'),bytes('earth_climate.b64'));
const world=genWorld({seed:'Earth',earth:true,height:earth.height,kg:earth.kg,fit:true});
WD=world;newHistory('conservation');
economyPass();assert(Math.abs(S.accounts.error)<0.01,'world food ledger must balance');
const a=cellAt(32,44),b=a+1,c=a+2,d=a+W;
assert([a,b,c,d].every(i=>world.land[i]));
function fixture(){
  WD=world;newHistory('fixture');WD=Object.assign({},world,{landIdx:Int32Array.from([a,b,c,d]),coastIdx:new Int32Array(0),land:new Uint8Array(N)});for(const i of WD.landIdx)WD.land[i]=1;
  S.pop.fill(0);S.food.fill(0);S.young.fill(0);S.pol.fill(0);S.urban.fill(0);S.node.fill(0);S.flow.fill(0);S.settleLag.fill(0);
  S.eth.fill(0);S.ancestry.fill(0);S.eth2.fill(-1);S.rel.fill(-1);S.activeMigs=[];S.press.clear();S.tradeEdges=[];
  for(const i of WD.landIdx){S.pop[i]=10000;S.young[i]=3200;S.K[i]=20000;S.food[i]=10000;S.farm[i]=1;seedLocalCrops(i);S.cropAdapt[bestCrop(i)][i]=1;S.grain[i]=1;S.organisation[i]=0.5;S.s[i]=0.6;S.nutrition[i]=1;S.integ[i]=0.8;S.infrastructure[i]=0.5}
}
function polity(cell,from){const id=newPolity(cell,from);const o=S.pols[id];o.pop=S.pop[cell];o.cells=1;return o}
function close(x,y,msg){assert(Math.abs(x-y)<Math.max(1e-5,Math.abs(y)*1e-7),msg+' '+x+' / '+y)}
fixture();S.pop[b]=0;S.food[a]=0;
assert.equal(foundSettlement(a,b,1000,null),0,'settlers cannot leave without provisions');
S.food[a]=5000;const before=S.pop[a]+S.pop[b],stock=S.food[a]+S.food[b],n=foundSettlement(a,b,1000,null);
assert(n>0);close(S.pop[a]+S.pop[b],before,'settlement conserves population');
close(S.food[a]+S.food[b],stock-n*0.15,'only explicit establishment inputs consume provisions');
assert(S.settleLag[b]>0,'new settlement misses part of its first harvest');
fixture();const sponsor=polity(a);sponsor.grain=10000;S.food[a]=0;S.eth[b]=1;S.ancestry[b]=1;S.pol[b]=sponsor.id;
const inhabitants=S.pop[a]+S.pop[b],reserves=sponsor.grain;const sponsored=foundSettlement(a,b,1000,sponsor);
assert(sponsored>0&&sponsor.grain<reserves,'organized settlement draws on actual public provisions');
close(S.pop[a]+S.pop[b],inhabitants,'sponsored settlement in an inhabited province conserves people');
assert(S.mix[b]>0&&S.societyCounters.sponsoredSettlements===1,'state-sponsored colonists mix with an existing population');
fixture();S.pop[a]=40000;S.pop[b]=1000;S.eth[b]=1;S.ancestry[b]=1;
const colonizer=polity(a);colonizer.pop=40000;colonizer.staff=2000;colonizer.army=10000;colonizer.armyFree=5000;colonizer.occupation=2000;colonizer.grain=10000;colonizer.health=1;colonizer.central=0.7;S.r=()=>0;
S.animals[0][a]=10000;S.animals[2][a]=3000;refreshAnimalAccess(a);
territorialAttack(colonizer,a,b,false);
assert.equal(S.pol[b],colonizer.id);assert.equal(S.societyCounters.sponsoredSettlements,1,'a funded victory can launch an actual colonial settlement');
assert(S.mix[b]>0&&S.newcomers[b]>0,'colonial jurisdiction and actual demographic replacement are distinct');
fixture();const o=polity(a);S.pol[b]=o.id;o.pop=20000;o.cells=2;o.army=300;o.staff=80;o.grain=2000;
economyPass();assert(Math.abs(S.accounts.error)<0.01,'levies, wages, relief and tribute conserve food');
assert(o.collected>0&&o.payroll>=0&&o.payroll<=1);
fixture();const extinct=polity(a),conqueror=polity(b);extinct.grain=2000;extinct.army=100;extinct.staff=80;S.pol[a]=conqueror.id;
economyPass();assert(Math.abs(S.accounts.error)<0.01,'a government losing its final province cannot lose a ghost payroll');
assert.equal(extinct.grain,0);assert.equal(extinct.staff,0);assert.equal(extinct.army,0);
fixture();const army=polity(a);army.army=10000;army.armyFree=5500;army.grain=0;
assert.equal(campaignForce(army,a,false),0,'unprovisioned army cannot campaign');
army.grain=100000;let allocated=0;
for(let i=0;i<10;i++)allocated+=campaignForce(army,a,false);
assert(allocated<=5500+0.01,'a force cannot fight on unlimited fronts');assert(army.armyFree>=0);
army.armyFree=5500;army.navyFree=0;assert.equal(campaignForce(army,a,true),0,'overseas campaigns need maintained ships');
fixture();S.eth[a]=0;S.eth[b]=1;S.ancestry[b]=1;
const cultureState=polity(a);cultureState.trust=1;S.integ[b]=1;S.tk[TI.school][b]=1;
culturalIntegration(b,cultureState);assert.equal(S.ancestry[b],1,'language integration cannot rewrite ancestry');
assert(S.mix[b]>0&&S.mix[b]<0.01,'integration changes a share, not a whole province at once');
fixture();S.eth.fill(1);S.eth2[a]=0;S.mix[a]=0.3;ethPass(false);
assert(S.eths[0].alive&&S.eths[0].pop>=2999,'a surviving minority cannot be declared culturally extinct');
S.eth2[a]=-1;S.mix[a]=0;S.press.set(0,{p:500,food:100,young:100,cell:a,y:S.year});ethPass(false);
assert(S.eths[0].alive&&S.eths[0].pop===500&&S.eths[0].cells===0,'displaced cultures remain alive without settled provinces');

fixture();S.r=()=>0.99;const old=S.pop[a],displaced=displace(a,0.3,0);
close(S.pop[a]+[...S.press.values()].reduce((n,p)=>n+p.p,0),old,'displaced people remain accounted for');
assert.equal(displaced,3000);assert(S.press.get(0).food>0);
fixture();const parent=polity(a);S.pol[b]=parent.id;parent.pop=20000;parent.grain=1000;parent.army=300;parent.staff=40;
const child=polity(b,parent);partitionInstitutions(parent,[child]);
close(parent.grain+child.grain,1000,'successors divide reserves');close(parent.army+child.army,300,'successors divide troops');
close(parent.staff+child.staff,40,'successors divide trained officials');assert(child.bureau>0&&child.succession>0);
institutionStep(child,b,S.year);for(const k of ['health','trust','strain','pT','pF'])assert(Number.isFinite(child[k]),'new breakaway '+k+' must be usable before its first budget pass');
fixture();const host=polity(b),neighbour=polity(c);S.eth[b]=1;S.eth[c]=1;
const M=startMigration({eth:0,pop:2000,cell:a,dx:1,dy:0,kind:'warband',food:1000});M.won=new Set([b]);
const resident=S.pop[b];settleMigration(M,b,host);assert.equal(S.pol[c],neighbour.id,'settling cannot annex an undefeated neighbour');
assert(S.pop[b]>resident&&M.done&&M.food===0);
fixture();S.pop[a]=20000;S.pop[b]=1000;S.eth[b]=1;S.organisation[a]=1;S.food[a]=20000;
const choices=[0,0.3,0,0,0.99,0];S.r=()=>choices.length?choices.shift():0.99;
nonStateConflict();assert(S.societyCounters.nonStateBattles>0,'autonomous communities wage war');
assert(S.migs.some(m=>m.kind==='warband'),'successful autonomous warbands can launch coercive migration');assert.equal(S.pol[a],0);

fixture();S.food[a]=20000;S.food[b]=1000;S.need[a]=10000;S.need[b]=10000;
const account={transportLoss:0};S.tradeEdges=[];tradeFood(account);assert.equal(S.food[b],1000);
S.tradeEdges=[{a,b,cost:0.1,capacity:500}];const foodTotal=S.food[a]+S.food[b];tradeFood(account);
assert(S.food[b]>1000&&S.food[b]<=1500);close(S.food[a]+S.food[b]+account.transportLoss,foodTotal,'trade accounts for transport loss');
fixture();const weak=polity(a);weak.payroll=0;weak.collected=100;weak.arrears=5000;weak.hunger=0.8;weak.psi=3;weak.md=10;weak.h=3;weak.ineq=0.7;
const health0=weak.health;institutionStep(weak,a,0);assert(weak.health>health0-0.05,'one bad year cannot instantly collapse institutions');
for(let i=1;i<150;i++)institutionStep(weak,a,i);
assert(weak.health<health0&&weak.strain>0.4,'sustained fiscal failure causes accumulated breakdown');
const riskWeak=institutionalRisk(weak);weak.payroll=1;weak.grain=10000;weak.arrears=0;weak.hunger=0;weak.trust=0.8;weak.bureau=0.8;weak.succession=0.9;weak.strain=0.05;weak.resilience=0.8;
assert(institutionalRisk(weak)<riskWeak,'funded institutions resist breakdown');
fixture();S.settleLag[a]=2;S.newcomers[a]=S.pop[a];const p0=S.pop[a];economyPass();const shortfall=S.nutrition[a];S.food[a]=0;economyPass();growth();
assert(S.pop[a]<p0&&shortfall<=1,'unprovisioned establishment can fail through food shortage');
WD=world;
function replay(){newHistory('deterministic');for(let i=0;i<120;i++)step();let sum=0;for(const c of WD.landIdx)sum+=S.pop[c]*(c%97+1);return [sum,S.chron.length,S.migs.length]}
assert.deepEqual(replay(),replay(),'same seed and rules reproduce the same history');
// Exercise actual annual political, fiscal and succession interactions in a
// populated regional scenario, instead of waiting for rare events in a unit test.
fixture();S.year=0;S.hearths.forEach(h=>h.done=true);
for(const i of WD.landIdx){S.pop[i]=80000;S.young[i]=24000;S.food[i]=60000;S.K[i]=100000;for(const k of ['records','storage','office','law','census','succession','post','charter','school']){S.tk[TI[k]][i]=1;S.firstTech[TI[k]]={y:0,cell:i}}}
const west=polity(a),east=polity(c);S.pol[b]=west.id;S.pol[d]=east.id;
for(const o of [west,east]){o.pop=160000;o.cells=2;o.grain=30000;o.staff=700;o.army=2000;o.bureau=0.5;o.central=0.45;o.rights=0.5;o.succession=0.8;o.h=8}
declareWar([west],[east],'scenario war',true,false,false);
for(let y=0;y<220;y++)step();
assert(S.pols.some(o=>o&&o.rulers.length>1),'multiple successions are exercised');
for(const id of S.alive){const o=S.pols[id];for(const k of ['grain','staff','army','health','bureau','trust','strain','central','navy'])assert(Number.isFinite(o[k])&&o[k]>=0,k+' survives integrated scenario');}
for(const i of WD.landIdx)for(const key of ['pop','food','young','nutrition','organisation'])assert(Number.isFinite(S[key][i])&&S[key][i]>=0,key+' stays finite and nonnegative');
fixture();const displayed=polity(a);const pane={innerHTML:''};
const ui={page:{t:'pol',id:displayed.id},stack:[]},$=id=>id==='pane-insp'?pane:null;
const esc=String,fmtN=n=>Math.round(n).toString(),lp=o=>o.full,le=e=>e.name,lr=r=>r.name,lf=f=>f.name;
const originText=()=>'',spark=()=>'',treeHTML=()=>'',drawSparks=()=>{},chronList=()=>'',chronFor=()=>[],bar=(label,v)=>label+':'+v.toFixed(2),showPane=()=>{};
eval(inspectorSource+'renderPage();');
assert(!/could not be drawn|NaN|undefined/.test(pane.innerHTML),'new state inspector renders complete finite data');
assert(pane.innerHTML.includes('Institutions and resources')&&pane.innerHTML.includes('Maintained ships'));
ui.page={t:'cell',id:a};eval(inspectorSource+'renderPage();');assert(!/could not be drawn|NaN|undefined/.test(pane.innerHTML)&&pane.innerHTML.includes('Transport and local power'),'province inspector shows valid transport and elite data');
console.log('PASS: conservation, settlement provisioning, army allocation, culture/ancestry, refugees, inheritance, migration borders, trade, collapse and deterministic replay');
`);
