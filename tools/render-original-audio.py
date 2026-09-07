"""Render original temporary Tweety cues. No sampled or reference audio is read."""
from pathlib import Path
import math,wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1];SR=22050;rng=np.random.default_rng(301)
def hz(n):return 440*2**((n-69)/12)
def voice(n,dur,kind):
 t=np.arange(int(dur*SR))/SR;f=hz(n);attack=np.minimum(1,t/.006)
 if kind=='mallet':a=(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*18)+.12*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*25))*np.exp(-t*8)
 elif kind=='pluck':a=sum(np.sin(2*np.pi*f*k*t)*np.exp(-t*(7+k*3))/k**1.5 for k in range(1,6))
 elif kind=='bass':a=(np.sin(2*np.pi*f*t)+.24*np.sin(2*np.pi*f*2*t))*np.exp(-t*10)
 elif kind=='comic':a=np.sin(2*np.pi*f*(t-.16*t*t))*np.exp(-t*4)*(1+.2*np.sin(2*np.pi*13*t))
 elif kind=='kick':a=np.sin(2*np.pi*(65*t-22*t*t))*np.exp(-t*32)
 else:a=rng.uniform(-1,1,len(t))*np.exp(-t*65)*.6
 return a*attack*np.minimum(1,np.maximum(0,dur-t)/.012)
def render(path,length,notes):
 out=np.zeros(int(length*SR))
 for start,n,dur,kind,vol in notes:
  a=voice(n,dur,kind)*vol;i=int(start*SR);count=min(len(a),len(out)-i)
  if count>0:out[i:i+count]+=a[:count]
 out*=.76/max(1,np.max(np.abs(out)));out[:128]*=np.linspace(0,1,128);out[-128:]*=np.linspace(1,0,128)
 path=ROOT/path;path.parent.mkdir(parents=True,exist_ok=True)
 with wave.open(str(path),'wb') as w:w.setparams((1,2,SR,0,'NONE','not compressed'));w.writeframes((out*32767).astype('<i2').tobytes())
beat=60/112;notes=[]
melodies=[[72,76,79,76,74,72],[69,72,76,79,76,72],[65,69,72,74,72,69],[67,71,74,77,74,71]]
for bar in range(8):
 root=[48,45,41,43][bar%4];b=bar*4*beat
 for offset,n in zip([0,.75,1.5,2,2.75,3.5],melodies[bar%4]):notes.append((b+offset*beat,n,.22,'mallet',.2))
 for offset,step in zip([0,1,2,3],[0,7,12,7]):notes.append((b+offset*beat,root+step,.23,'bass',.32))
 for offset in [.5,2.5]:
  for step in [0,4 if bar%4!=1 else 3,7]:notes.append((b+offset*beat,root+12+step,.15,'pluck',.09))
 for offset in [0,2]:notes.append((b+offset*beat,0,.11,'kick',.3))
 for offset in [1,3]:notes.append((b+offset*beat,0,.07,'tap',.15))
render('assets/music/music_main_menu.wav',32*beat,notes)
render('assets/audio/sfx_get_ready.wav',.70,[(0,67,.18,'pluck',.4),(.18,72,.18,'pluck',.4),(.37,79,.3,'mallet',.4)])
render('assets/audio/sfx_level_clear.wav',.70,[(0,72,.18,'mallet',.4),(.13,76,.18,'mallet',.4),(.26,79,.18,'mallet',.4),(.40,84,.29,'mallet',.4),(.4,48,.22,'bass',.4)])
render('assets/audio/sfx_game_over.wav',1.15,[(0,67,.21,'pluck',.4),(.22,63,.2,'pluck',.4),(.45,60,.2,'pluck',.35),(.66,43,.46,'comic',.4)])
print('Rendered four original temporary audio files.')
