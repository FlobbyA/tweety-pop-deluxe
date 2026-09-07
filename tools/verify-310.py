from pathlib import Path
import json,re,subprocess,wave
from PIL import Image
p=Path(__file__).resolve().parents[1]
def cfg(n,v):return json.loads((p/f'config/{n}-{v}.js').read_text().split(' = ',1)[1].rstrip(';\n'))
a,b=cfg('levels','3.0.2'),cfg('levels','3.1.0')
assert len(b)==15
for old,new in zip(a,b):
 for k,v in old.items():
  if not k.startswith('helper'):assert new[k]==v,(old['id'],k)
old=(p/'game-3.0.2.js').read_text();new=(p/'game-3.1.0.js').read_text()
for name in ['shoot','aimLine','cluster','floating','pos','neighbors','explodeBomb','bombImpact','helperSafety','continueLevel','cleanupEvents']:
 pattern=r'function '+name+r'\([^\n]*?(?=\nfunction |\nconst |\nlet |\n\(\))'
 # Use next top-level function boundary, allowing multi-line body.
 def extract(s):
  start=s.index('function '+name+'(');end=s.find('\nfunction ',start+1);return s[start:end if end!=-1 else len(s)].split('\nconst BUBBLES=')[0]
 assert extract(old)==extract(new),name
assert 'x.clip()' not in new
m=cfg('assets','3.1.0');paths=list(m['images'].values())+list(m['sfx'].values())+[v['path'] for group in ['tracks','cues'] for v in m[group].values()]
for path in paths:assert (p/path).is_file(),path
for path in m['images'].values():
 if path.endswith('.png'):
  im=Image.open(p/path);assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255),path
for path in paths:
 if path.endswith('.wav'):
  with wave.open(str(p/path)) as w:assert w.getnframes()>0 and w.getsampwidth()==2
h=(p/'index.html').read_text();assert '/15' in h and '3.0.2' not in h
for path in re.findall(r'(?:src|href)="([^"]+)"',h):assert (p/path.split('?')[0]).is_file(),path
# All previous tracked files except active index stay byte identical.
for f in subprocess.check_output(['git','ls-tree','-r','--name-only','0bfa686'],cwd=p,text=True).splitlines():
 if f=='index.html':continue
 assert (p/f).read_bytes()==subprocess.check_output(['git','show',f'0bfa686:{f}'],cwd=p),f
print(f'PASS: {len(paths)} manifest paths, PNG alpha, WAV validity, 1–12 non-helper data, unchanged core functions, preserved 3.0.2/baselines')
