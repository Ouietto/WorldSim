// Does precession green the Sahara? Compare rainfall at 7000 BCE and today. Usage: node tools/orbtest.js [year]
const fs=require('fs'),zlib=require('zlib'),path=require('path');const S_=path.join(__dirname,'..','src');
const rd=f=>fs.readFileSync(path.join(S_,f),'utf8'),inf=f=>new Uint8Array(zlib.inflateSync(Buffer.from(rd(f),'base64')));
eval(rd('world.js')+rd('climate.js')+`
const E=decodeEarth(inf('earth_elev.b64'),inf('koppen.b64'),inf('earth_climate.b64'));const g=climPrep(E.height);
const run=y=>{const Tm=climRun(g,{orb:orbitAt(y)});return{Tm,P:climMoist(g,Tm,{}).Pm}};const A=run(+(process.argv[2]||-7000)),B=run(1950);
const box=(la0,la1,lo0,lo1,R)=>{let s=0,t=0,n=0;for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){const la=90-(y+0.5)*180/CH,lo=(x+0.5)*360/CW-180,i=y*CW+x;if(la<la0||la>la1||lo<lo0||lo>lo1||g.land[i]<0.5)continue;for(let m=0;m<12;m++){s+=R.P[m*CN+i];t+=R.Tm[m*CN+i]/12}n++}return[s/n,t/n]};
for(const [nm,b] of Object.entries({Sahara:[15,25,-10,30],Sahel:[10,16,-10,30],Arabia:[15,28,40,55],Thar:[23,30,68,76],NChina:[33,40,105,118],Europe:[45,55,0,30]})){const a=box(...b,A),c=box(...b,B);console.log(nm.padEnd(7),'P then/now',Math.round(a[0]),'/',Math.round(c[0]),'T',a[1].toFixed(1),'/',c[1].toFixed(1))}
console.log('orbit then',JSON.stringify(orbitAt(+(process.argv[2]||-7000))))`);
