/* Pointer events are shared by touch, pen and mouse. Coordinates remain in CSS
   pixels; the canvas backing resolution must not enter gesture calculations. */
function installMapGestures(canvas,view,actions){
  const pointers=new Map();let base=null,gesture=false,lastTap=null;
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  const rebase=()=>{const p=[...pointers.values()];base=p.length?{x:p[0].x,y:p[0].y,ox:view.ox,oy:view.oy,z:view.z,
    cx:p.length>1?(p[0].x+p[1].x)/2:p[0].x,cy:p.length>1?(p[0].y+p[1].y)/2:p[0].y,
    distance:p.length>1?Math.max(1,Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)):0}:null};
  const repaint=()=>{actions.clamp();actions.draw()};
  const zoom=(x,y,z)=>{const next=Math.max(1,Math.min(8,z)),f=next/view.z;view.ox=x-(x-view.ox)*f;view.oy=y-(y-view.oy)*f;view.z=next;repaint()};
  canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();if(actions.interact)actions.interact();
    if(!pointers.size)gesture=false;pointers.set(e.pointerId,{...point(e),type:e.pointerType,start:point(e)});
    if(pointers.size>1){gesture=true;lastTap=null}canvas.setPointerCapture(e.pointerId);rebase();
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)){if(e.pointerType!=='touch'&&actions.hover)actions.hover(point(e));return}
    e.preventDefault();const prior=pointers.get(e.pointerId),p=point(e);pointers.set(e.pointerId,{...prior,...p});
    const ps=[...pointers.values()];if(!base)return;
    if(ps.length>1){gesture=true;const cx=(ps[0].x+ps[1].x)/2,cy=(ps[0].y+ps[1].y)/2;
      const z=Math.max(1,Math.min(8,base.z*Math.hypot(ps[1].x-ps[0].x,ps[1].y-ps[0].y)/base.distance)),f=z/base.z;
      view.ox=cx-(base.cx-base.ox)*f;view.oy=cy-(base.cy-base.oy)*f;view.z=z;repaint();
    }else{const dx=p.x-base.x,dy=p.y-base.y;if(Math.abs(dx)+Math.abs(dy)>4)gesture=true;
      if(gesture){view.ox=base.ox+dx;view.oy=base.oy+dy;repaint()}}
  });
  const finish=(e,cancelled)=>{
    const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);
    if(!cancelled&&!gesture&&!pointers.size){const at=point(e),now=e.timeStamp;
      if(p.type==='touch'&&lastTap&&now-lastTap.time<320&&Math.hypot(at.x-lastTap.x,at.y-lastTap.y)<24){zoom(at.x,at.y,view.z*1.8);lastTap=null}
      else{lastTap=p.type==='touch'?{...at,time:now}:null;if(actions.tap)actions.tap(at)}
    }else lastTap=null;
    if(canvas.hasPointerCapture&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(cancelled)gesture=true;rebase();
  };
  canvas.addEventListener('pointerup',e=>finish(e,false));
  canvas.addEventListener('pointercancel',e=>finish(e,true));
  canvas.addEventListener('lostpointercapture',e=>finish(e,true));
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(actions.interact)actions.interact();const p=point(e);zoom(p.x,p.y,view.z*Math.exp(-e.deltaY*0.0015))},{passive:false});
  return{zoom,active:()=>pointers.size};
}
// Fit the shortest wrapped longitude interval, including islands across the
// date line. Uses CSS dimensions and leaves room for controls and a highlight.
function fitMapCells(cells,world,dim,baseScale,padding=48){
  if(!cells.length||dim.w<=0||dim.h<=0||baseScale<=0)return null;
  const xs=[...new Set(cells.map(i=>world.cxA[i]))].sort((a,b)=>a-b);let gap=-1,start=xs[0],y0=Infinity,y1=-Infinity;
  for(let k=0;k<xs.length;k++){const next=xs[(k+1)%xs.length]+(k===xs.length-1?W:0),distance=next-xs[k];if(distance>gap){gap=distance;start=next%W}}
  for(const i of cells){y0=Math.min(y0,world.cyA[i]);y1=Math.max(y1,world.cyA[i])}
  const span=W-gap+1,width=span*SC,height=(y1-y0+1)*SC,margin=Math.min(padding,dim.w*0.18,dim.h*0.18);
  return{cx:(start+span/2)*SC,cy:(y0+y1+1)*SC/2,z:Math.max(1,Math.min(8,Math.min((dim.w-margin*2)/width,(dim.h-margin*2)/height)/baseScale))};
}
