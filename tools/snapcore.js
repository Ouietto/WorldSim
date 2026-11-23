// Saved worlds: the code here is evaluated in the same scope as the model (after src/*.js), so it can reach S, WD, TECH and P.
// snapMark() after newHistory() fingerprints the world's fields; snapSave() then keeps the history (S), the random-stream states,
// the techs invented along the way, and only those world fields that have changed since the mark (rivers, coasts, caches).
// snapLoad(buf) is called on a fresh world after newHistory() with the same seed, region and switches, and puts it all back.
// tools/snaptest.js checks that a history resumed from a saved world ends exactly where an unbroken one does.
module.exports=`
var SNAP_H0=null;
function snapHash(v){return require('crypto').createHash('md5').update(require('v8').serialize(v)).digest('hex')}
function snapMark(){SNAP_H0={};for(const k of Object.keys(WD)){const v=WD[k];if(typeof v!=='function')SNAP_H0[k]=snapHash(v)}SNAP_H0.__tech=TECH_BASE||TECH.length}
function snapSave(){
  if(!SNAP_H0)throw new Error('snapMark() must run right after newHistory()');
  const So={};for(const k of Object.keys(S))if(typeof S[k]!=='function')So[k]=S[k];
  const rs={r:S.r.s,rN:S.rN?S.rN.s:null,rW:S.rW?S.rW.s:null};
  const Wd={};for(const k of Object.keys(WD)){const v=WD[k];if(typeof v==='function')continue;if(snapHash(v)!==SNAP_H0[k])Wd[k]=v}
  const base=SNAP_H0.__tech,tech=TECH.slice(base),ti={};for(const T of tech)ti[T.k]=TI[T.k];
  return require('zlib').gzipSync(require('v8').serialize({year:S.year,seed:S.seed,S:So,rs,W:Wd,tech,ti,base,N}),{level:1})}
function snapLoad(buf){
  const o=require('v8').deserialize(require('zlib').gunzipSync(buf));
  if(o.N!==N)throw new Error('saved world has '+o.N+' units, this one '+N);
  if(String(o.seed)!==String(S.seed))throw new Error('saved world is seed '+o.seed+', this history '+S.seed);
  for(const k in o.W)WD[k]=o.W[k];
  TECH.length=o.base;for(const T of o.tech)TECH.push(T);for(const k in o.ti)TI[k]=o.ti[k];
  S=o.S;S.r=mulberry32s(o.rs.r);if(o.rs.rN!=null)S.rN=mulberry32s(o.rs.rN);if(o.rs.rW!=null)S.rW=mulberry32s(o.rs.rW);
  return o.year}
`;
