const fs=require('fs');const R=JSON.parse(fs.readFileSync(process.argv[2]));
const med=a=>{const s=a.filter(x=>x!=null).sort((x,y)=>x-y);return s.length?s[s.length>>1]:null};
for(const k of ['meso','egypt']){
  // spans of the realm holding most of the box's people (with its share), merged over decades
  const sp=[];for(const r of R.dec){const d=r[k];const last=sp[sp.length-1];if(last&&last.id===d.id){last.to=r.y;last.mx=Math.max(last.mx,d.sh)}else sp.push({id:d.id,name:d.name,from:r.y,to:r.y,mx:d.sh})}
  const big=sp.filter(s=>s.mx>=1/3&&s.to-s.from>=50);
  console.log(`== ${k}: realms holding most of the people for 50+ years with a third or more at peak: ${big.length}`);
  for(const s of big)console.log(`   ${s.name.padEnd(24)} ${-s.from+1} to ${-s.to+1} BCE (${s.to-s.from} yrs), peak share ${s.mx}`);
  const byM=[[-3500,-2500],[-2500,-1500],[-1500,-300]];
  for(const [a,b] of byM){const rows=R.dec.filter(r=>r.y>=a&&r.y<b).map(r=>r[k]);
    console.log(`   ${-a+1}-${-b+1} BCE: leader share med ${med(rows.map(d=>d.sh))}, leader power / strongest other in region med ${med(rows.map(d=>d.pr))}, / strongest neighbour med ${med(rows.map(d=>d.pn))}, cohesion ${med(rows.map(d=>d.S))}, stress ${med(rows.map(d=>d.psi))}, leader age ${med(rows.map(d=>d.age))}`)}
  const L=R.loss[k],back=L.filter(x=>x!=null);
  console.log(`   provinces lost by a realm: ${L.length}; back to the same realm: ${back.length} (${(100*back.length/Math.max(1,L.length)).toFixed(0)}%), within 50 yrs ${back.filter(x=>x<=50).length}, median ${med(back)} yrs`)}
