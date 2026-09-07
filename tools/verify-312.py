from pathlib import Path
import subprocess,json,zipfile,hashlib,re
p=Path(__file__).resolve().parents[1]
for f in subprocess.check_output(['git','ls-tree','-r','--name-only','5541739'],cwd=p,text=True).splitlines():
 if f!='index.html':assert (p/f).read_bytes()==subprocess.check_output(['git','show',f'5541739:{f}'],cwd=p),f
m=json.loads((p/'config/assets-3.1.2.js').read_text().split(' = ',1)[1].rstrip(';\n'))
paths=list(m['images'].values())+list(m['sfx'].values())+[v['path'] for k in ['tracks','cues'] for v in m[k].values()]
for f in paths:assert (p/f).is_file(),f
raw=[]
for name in ['impactsound(2).zip','mood(2).zip']:
 with zipfile.ZipFile(p.parent/'upload'/name) as z:raw.extend(hashlib.sha256(z.read(f)).hexdigest() for f in z.namelist() if not f.endswith('/'))
for f in (p/'assets/audio-3.1.2').iterdir():assert hashlib.sha256(f.read_bytes()).hexdigest() in raw,f
for f in re.findall(r'(?:src|href)="([^"?]+)',(p/'index.html').read_text()):assert (p/f).is_file(),f
assert 'game-3.1.2.js?v=3.1.2' in (p/'index.html').read_text()
assert 'config/assets-3.1.2.js?v=3.1.2' in (p/'index.html').read_text()
a=(p/'game-3.1.1.js').read_text();b=(p/'game-3.1.2.js').read_text()
for name in ['shoot','aimLine','cluster','floating','pos','neighbors','helperSafety','helperNeed','considerHelper','continueLevel','bombImpact','explodeBomb','draw','speechBubble','pedestal','cat','launcher','buildLevel']:
 def part(s):
  start=s.index('function '+name+'(');end=s.find('\nfunction ',start+1);return s[start:end]
 assert part(a)==part(b),name
print('PASS: prior files preserved; core physics/helpers/visuals unchanged; 16 audio files byte-identical to latest packs;',len(paths),'manifest paths resolve')
