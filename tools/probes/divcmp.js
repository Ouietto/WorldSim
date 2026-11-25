// compare two butterfly outputs: share of provinces with identical people, and with the same realm, by year and by distance from the nudge
const TOL=+(process.env.TOL||1e-3);const fs=require('fs');const A=JSON.parse(fs.readFileSync(process.argv[2])),B=JSON.parse(fs.readFileSync(process.argv[3]));
const t=B.tgt,ll=A.ll,[la0,lo0]=ll[t];
const dist=ll.map(([a,o])=>{const r=Math.PI/180,c=Math.sin(a*r)*Math.sin(la0*r)+Math.cos(a*r)*Math.cos(la0*r)*Math.cos((o-lo0)*r);return 6371*Math.acos(Math.max(-1,Math.min(1,c)))});
const bands=[[0,500],[500,1500],[1500,3000],[3000,9e9]];
console.log('year | same people (all) | same realm (all) | same people by distance from the nudge:',bands.map(b=>b.join('-')+'km').join(' '));
for(const y of Object.keys(A.snaps).map(Number).sort((a,b)=>a-b)){const a=A.snaps[y],b=B.snaps[y];if(!b)continue;const bm=new Map(b.idx.map((i,k)=>[i,k]));
  let sp=0,sr=0,n=0;const bs=bands.map(()=>[0,0]);
  for(let k=0;k<a.pop.length;k++){const i=a.idx[k],kb=bm.get(i);if(kb==null)continue;const pa=a.pop[k],pb=b.pop[kb];if(pa<1&&pb<1)continue;n++;const same=Math.abs(pa-pb)<=TOL*Math.max(1,pa);if(same)sp++;if(a.pol[k]===b.pol[kb])sr++;
    const bi=bands.findIndex(([l,h])=>dist[i]>=l&&dist[i]<h);bs[bi][0]+=same?1:0;bs[bi][1]++}
  console.log(y,'|',(sp/n).toFixed(3),'|',(sr/n).toFixed(3),'|',bs.map(([s,m])=>m?(s/m).toFixed(3):'-').join(' '))}
