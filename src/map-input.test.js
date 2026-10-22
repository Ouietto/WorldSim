'use strict';
const fs=require('fs'),assert=require('assert');
eval(fs.readFileSync(__dirname+'/map-input.js','utf8')+`
const listeners={},captured=new Set(),canvas={getBoundingClientRect:()=>({left:10,top:20}),addEventListener:(name,fn)=>listeners[name]=fn,setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture:id=>captured.delete(id)};
const view={z:1,ox:0,oy:0};let taps=0,draws=0;
const controls=installMapGestures(canvas,view,{clamp:()=>{},draw:()=>draws++,tap:()=>taps++});
function send(type,id,x,y,extra={}){listeners[type]({pointerId:id,clientX:x+10,clientY:y+20,pointerType:'touch',button:0,timeStamp:1000,preventDefault:()=>{},...extra})}
send('pointerdown',1,100,100);send('pointerdown',2,200,100);send('pointermove',2,300,100);
assert.equal(view.z,2,'two fingers pinch in');assert.equal(view.ox,-100,'pinch preserves the world point under the moving midpoint');
send('pointerup',2,300,100);const ox=view.ox;send('pointermove',1,120,100);assert.equal(view.ox,ox+20,'remaining finger pans without a jump');send('pointerup',1,120,100);assert.equal(taps,0,'pinching never selects a province');
send('pointerdown',1,100,100);send('pointercancel',1,100,100);assert.equal(controls.active(),0);send('pointermove',1,300,300);assert.equal(taps,0,'cancelled contacts do not linger');
send('pointerdown',1,100,100);send('pointerup',1,100,100);assert.equal(taps,1,'a tap still selects');
send('pointerdown',1,100,100);send('pointerup',1,100,100,{timeStamp:1200});assert(view.z>2,'double tap offers another touch zoom gesture');assert.equal(taps,1);
controls.zoom(100,100,100);assert.equal(view.z,8);controls.zoom(100,100,0);assert.equal(view.z,1);assert(draws>0);
send('pointerdown',3,50,50,{pointerType:'mouse',button:2});assert.equal(controls.active(),0,'right click cannot start a stuck drag');
console.log('PASS: pinch midpoint, pan transitions, gesture cancellation, tap selection, touch double-tap and zoom limits');
`);
