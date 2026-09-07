from pathlib import Path
import json,re,subprocess,wave
p=Path(__file__).resolve().parents[1]
def manifest(f):return json.loads((p/f).read_text().split('=',1)[1].strip().rstrip(';'))
a=manifest('config/levels-3.0.js');b=manifest('config/levels-3.0.2.js')
assert len(a)==len(b)==12
for x,y in zip(a,b):
 for key in x:
  if key!='helperInterval':assert x[key]==y[key],(x['id'],key)
old=(p/'game-3.0.1.js').read_text();new=(p/'game-3.0.2.js').read_text()
for name in ['shoot','aimLine','cluster','floating','pos','neighbors']:
 def fn(s):
  i=s.index('function '+name+'(');end=s.find('\nfunction ',i+1);return s[i:end]
 assert fn(old)==fn(new),name
assert 'advanceTimer' not in new
m=manifest('config/assets-3.0.2.js');html=(p/'index.html').read_text()
assert 'game-3.0.2.js?v=3.0.2' in html and 'game-3.0.1.js' not in html
refs=re.findall(r'(?:src|href)="([^"?]+)',html)+list(m['images'].values())+list(m['sfx'].values())+[x['path'] for x in m['tracks'].values()]+[x['path'] for x in m['cues'].values()]
for f in refs:assert not f.startswith('/') and (p/f).is_file(),f
for role in ['sfx_bomb_impact','sfx_bomb_crack','sfx_shell_cascade']:
 with wave.open(str(p/m['sfx'][role])) as w:assert w.getnframes()>0
base='248b5ed187c8736ff129461aca7185eda1ec2f5c'
for f in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=p,text=True).splitlines():
 if f=='index.html':continue
 assert (p/f).read_bytes()==subprocess.check_output(['git','show',base+':'+f],cwd=p),f
print('PASS',len(refs),'asset references; 12-level pressure/density/stomp unchanged; all pre-existing files except index preserved.')
