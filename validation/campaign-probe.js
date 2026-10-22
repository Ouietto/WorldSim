'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const source=path.join(__dirname,'../src');
const fixture=fs.readFileSync(path.join(source,'consolidation.test.js'),'utf8');
const prefix=fixture.slice(0,fixture.indexOf('fixture();const conqueror'));
const probe=String.raw`
const outcomes=[];
for(const [label,frontierWall,cityWall] of [['open',0,0],['frontier wall',1,0],['city wall',0,1]]){
 let wins=0,checks=0,blocked=0;
 const original=besiegeCity;
 besiegeCity=function(...args){checks++;const result=original(...args);if(!result)blocked++;return result};
 for(let trial=0;trial<12;trial++){
  fixture();S.r=mulberry32(hashStr('campaign-probe-'+trial));const attacker=pol(a),defender=pol(b);
  S.pop[a]=80000;S.young[a]=24000;attacker.pop=80000;attacker.army=20000;attacker.staff=2000;attacker.bureau=0.6;attacker.occupation=20000;attacker.grain=1000000;attacker.preparedness=1;attacker.ruler.comp=0.9;
  S.pop[b]=20000;S.young[b]=6000;defender.pop=20000;defender.army=1000;defender.grain=1000000;defender.preparedness=1;S.food[a]=200000;S.food[b]=40000;
  S.urban[b]=5000;S.fort[b]=frontierWall;S.wallHealth[b]=1;S.wallBreach[b]=0;S.cityWall[b]=cityWall;S.cityWallHealth[b]=1;S.engineeringKnowledge[a]=S.engineeringKnowledge[b]=0.8;S.eliteLoyalty[b]=1;
  declareWar([attacker],[defender],'Controlled campaign',false,false,false);
  attacker.campaign={from:a,to:b,start:0,lastAttempt:-1,sea:false};
  // Ten supplied opportunities with a finite, shrinking standing army.
  // This isolates military rules; it is not a ten-year full social history.
  for(let turn=1;turn<=10;turn++){
   S.year=turn;S.civicLabor.fill(0);S.defenseUsed.fill(0);civicWorksAt(b,defender);
   attacker.armyFree=attacker.army*0.55;defender.defFree=defender.army*0.45;
   territorialAttack(attacker,a,b,false);if(S.pol[b]===attacker.id){wins++;break}
  }
 }
 besiegeCity=original;outcomes.push({case:label,captures:wins,trials:12,siegeChecks:checks,checksNotCapturing:blocked});
}
console.log(JSON.stringify({controlledCampaignProbe:outcomes}));
`;
vm.runInNewContext(prefix+probe+'`);',{require,__dirname:source,console,process,Buffer,TextDecoder,TextEncoder,performance,structuredClone},{filename:path.join(source,'campaign-probe.js')});
