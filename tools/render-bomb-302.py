"""Original short bomb Foley synthesis. No reference recordings are read."""
from pathlib import Path
import wave
import numpy as np
p=Path(__file__).resolve().parents[1]/'assets/audio';sr=22050;rng=np.random.default_rng(302)
def save(name,a):
 a=np.clip(a,-.72,.72);a[:64]*=np.linspace(0,1,64);a[-128:]*=np.linspace(1,0,128)
 with wave.open(str(p/(name+'.wav')),'wb') as w:w.setparams((1,2,sr,0,'NONE','not compressed'));w.writeframes((a*32767).astype('<i2').tobytes())
t=np.arange(int(.32*sr))/sr
impact=.5*np.sin(2*np.pi*(94*t-80*t*t))*np.exp(-t*13)+.19*rng.uniform(-1,1,len(t))*np.exp(-t*44)
save('sfx_bomb_impact',impact)
a=np.zeros(int(.31*sr))
for k in range(11):
 t=np.arange(int(.045*sr))/sr;i=int((k*.018)*sr);q=(rng.uniform(-1,1,len(t))*.22+np.sin(2*np.pi*(750+k*103)*t)*.09)*np.exp(-t*95);a[i:i+len(q)]+=q
save('sfx_bomb_crack',a)
a=np.zeros(int(.82*sr))
for k in range(27):
 t=np.arange(int(.055*sr))/sr;i=int((.015+k*.023+rng.uniform(0,.012))*sr);q=(rng.uniform(-1,1,len(t))*.12+np.sin(2*np.pi*rng.uniform(1200,3600)*t)*.1)*np.exp(-t*100)*(1-k/38);a[i:i+len(q)]+=q
save('sfx_shell_cascade',a)
print('Created impact 0.32s, crack 0.31s, cascade 0.82s; bounded peaks.')
