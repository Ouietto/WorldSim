# Rasterise Natural Earth 1:50m river centrelines (public domain; github.com/nvkelso/natural-earth-vector,
# geojson/ne_50m_rivers_lake_centerlines.geojson) onto the 400x200 history grid as ordered cell chains.
# usage: python3 tools/rivers.py ne_50m_rivers_lake_centerlines.geojson out.txt
# Output: chains separated by ';', each "<scalerank digit><start cell, base 36>,<steps a-h>" (8-neighbour moves).
import json,sys,math
W,H=400,200
D={(-1,-1):'a',(0,-1):'b',(1,-1):'c',(-1,0):'d',(1,0):'e',(-1,1):'f',(0,1):'g',(1,1):'h'}
def b36(n):
    s='';
    while True:
        s='0123456789abcdefghijklmnopqrstuvwxyz'[n%36]+s;n//=36
        if not n:return s
d=json.load(open(sys.argv[1]));out=[]
for f in d['features']:
    sr=max(0,min(9,int(f['properties'].get('scalerank') or 9)));g=f['geometry']
    for ln in (g['coordinates'] if g['type']=='MultiLineString' else [g['coordinates']]):
        cells=[]
        for a,b in zip(ln,ln[1:]):
            lo0,la0=a[:2];lo1,la1=b[:2]
            if abs(lo1-lo0)>180:continue
            n=max(1,int(max(abs(lo1-lo0),abs(la1-la0))/0.05))
            for k in range(n+1):
                t=k/n;lo=lo0+(lo1-lo0)*t;la=la0+(la1-la0)*t
                c=(int(math.floor((lo+180)/360*W))%W,min(H-1,max(0,int(math.floor((90-la)/180*H)))))
                if not cells or cells[-1]!=c:cells.append(c)
        # split where a step is not to an 8-neighbour (wrap or gaps)
        seg=[]
        def flush():
            if len(seg)>=2:
                out.append(str(sr)+b36(seg[0][1]*W+seg[0][0])+','+''.join(D[((q[0]-p[0]+W+1)%W-1,q[1]-p[1])] for p,q in zip(seg,seg[1:])))
        for c in cells:
            if seg:
                dx=(c[0]-seg[-1][0]+W+1)%W-1;dy=c[1]-seg[-1][1]
                if abs(dx)>1 or abs(dy)>1 or (dx,dy)==(0,0):flush();seg=[]
            seg.append(c)
        flush()
s=';'.join(out);open(sys.argv[2],'w').write(s);print(len(out),'chains',len(s),'chars',file=sys.stderr)
