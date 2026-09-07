"""Original temporary celebration motif; silent replaceable future vocal/SFX files."""
from pathlib import Path
import json,wave
import numpy as np
root=Path(__file__).resolve().parents[1]
sr=22050
rng=np.random.default_rng(310)
def save(path,a):
 a=np.clip(a,-.8,.8)
 with wave.open(str(root/path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((a*32767).astype('<i2').tobytes())
m=json.loads((root/'config/assets-3.1.0.js').read_text().split(' = ',1)[1].rstrip(';\n'))
for pool in m['vocals'].values():
 for role in pool:save(m['sfx'][role],np.zeros(int(sr*.12)))
# Explicit silent placeholders: no imitation of real cheering or cat recordings.
for role in ['sfx_campaign_applause','sfx_campaign_cheer']:save(m['sfx'][role],np.zeros(int(sr*.12)))
beat=60/126;dur=beat*32;a=np.zeros(round(sr*dur))
def note(start,length,freq,gain,kind):
 n=int(length*sr);t=np.arange(n)/sr;env=(1-np.exp(-t*140))*np.exp(-t*(9 if kind=='wood' else 6));
 v=np.sin(2*np.pi*freq*t)+.28*np.sin(2*np.pi*freq*2*t)+.12*np.sin(2*np.pi*freq*3*t)
 if kind=='wood':v+=.18*np.sin(2*np.pi*freq*2.76*t)*np.exp(-t*30)
 i=round(start*sr);idx=(np.arange(n)+i)%len(a);np.add.at(a,idx,v*env*gain)
mel=[72,76,79,76,81,79,76,74,72,74,76,79,77,76,74,67,72,76,79,84,81,79,76,79,77,81,79,76,74,71,72,79]
for i,midi in enumerate(mel):
 note(i*beat,beat*.7,440*2**((midi-69)/12),.16,'wood')
 note(i*beat,beat*.8,440*2**(([48,55,53,55][i//8]-69+(12 if i%2 else 0))/12),.14,'bass')
 t=np.arange(int(.08*sr))/sr;v=rng.uniform(-1,1,len(t))*np.exp(-t*65)*(.035 if i%2 else .06);j=round(i*beat*sr);a[j:j+len(v)]+=v[:len(a[j:j+len(v)])]
save('assets/music/music_campaign_complete.wav',a)
print('Original 126 BPM celebration loop:',dur,'seconds; 16 silent role placeholders')
