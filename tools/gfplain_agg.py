# GFPLAIN250m (Nardi et al. 2019, Scientific Data 6:180309; figshare 10.6084/m9.figshare.6665165) reduced to src/earth_fp.b64.
# Run on the extracted continental GeoTIFFs; then pack the max share over continents per 0.225 deg subcell as uint8 (x250, 255 = no data), deflated, base64.
# aggregate GFPLAIN250m (floodplain = 0, everything else = 255) to the model's 400x200 grid (0.9 deg) and its 1600x800 subcells
import sys,numpy as np,tifffile,os,tempfile
D=sys.argv[1];out=sys.argv[2];W,H=1600,800;d=0.0023147920;S=360/W
res={}
for c in ['AF','AS','EU','NA','OC','SA']:
    p=os.path.join(D,c,c+'.TIF');tfw=[float(x.replace(',','.')) for x in open(os.path.join(D,c,c+'.TFw')).read().split()]
    left,top=tfw[4],tfw[5];mm=os.path.join(tempfile.gettempdir(),'gfp_'+c+'.mm')
    a=tifffile.imread(p,out=mm);R,C=a.shape
    FP=np.zeros(W*H,np.float64);TOT=np.zeros(W*H,np.float64)
    lon=left+(np.arange(C)+0.5)*d;x=np.floor((lon+180)/S).astype(np.int64)%W
    for r0 in range(0,R,600):
        blk=np.asarray(a[r0:r0+600]);lat=top-(np.arange(r0,r0+blk.shape[0])+0.5)*d;y=np.clip(np.floor((90-lat)/S).astype(np.int64),0,H-1)
        idx=(y[:,None]*W+x[None,:]).ravel()
        TOT+=np.bincount(idx,minlength=W*H);FP+=np.bincount(idx,weights=(blk.ravel()==0).astype(np.float64),minlength=W*H)
    res[c+"_FP"]=FP;res[c+"_TOT"]=TOT;print(c,a.shape,"floodplain px",int(FP.sum()),flush=True);del a;os.remove(mm)
np.savez(out,**res)
