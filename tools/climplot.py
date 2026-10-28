# Plot dumped climate fields. Usage: python3 tools/climplot.py dir
import sys,numpy as np
from PIL import Image,ImageDraw
d=sys.argv[1];CW,CH=200,100;S=4
L=lambda n:np.fromfile(f'{d}/{n}.f32',dtype=np.float32).reshape(CH,CW)
land=L('land')>0.5
def ramp(v):
    stops=np.array([[110,60,20],[200,160,80],[240,230,150],[150,210,120],[40,160,90],[20,90,160],[60,20,140]],float)
    v=np.clip(v,0,1)*(len(stops)-1);k=np.minimum(np.floor(v).astype(int),len(stops)-2);f=(v-k)[...,None]
    return stops[k]*(1-f)+stops[k+1]*f
def rain(P):
    t=np.log10(np.maximum(P,1)/50)/np.log10(4000/50)
    img=ramp(t);img[~land]=[30,40,60];return img
def panel(img):return Image.fromarray(img.astype(np.uint8)).resize((CW*S,CH*S),Image.NEAREST)
a=panel(rain(L('Pa')));b=panel(rain(np.nan_to_num(L('Po'))))
canvas=Image.new('RGB',(CW*S,CH*S*2+10),(0,0,0));canvas.paste(a,(0,0));canvas.paste(b,(0,CH*S+10));canvas.save(f'{d}/rain.png')
for m in ['0','6']:
    pr=L('pr'+m);U=L('U'+m);V=L('V'+m);P=L('P'+m)
    t=np.log10(np.maximum(P*12,1)/50)/np.log10(4000/50);img=ramp(t);img[~land]=(np.clip((pr-pr.min())/(pr.max()-pr.min()),0,1)[...,None]*np.array([90,110,150])+20)[~land]
    im=panel(img);dr=ImageDraw.Draw(im)
    for y in range(2,CH,4):
        for x in range(2,CW,4):
            cx,cy=x*S+S//2,y*S+S//2;u,v=U[y,x],V[y,x];dr.line([cx,cy,cx+u*6,cy-v*6],fill=(255,255,255));dr.ellipse([cx-1,cy-1,cx+1,cy+1],fill=(255,80,80))
    im.save(f'{d}/wind{m}.png')
print('ok')
