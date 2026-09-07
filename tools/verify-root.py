from pathlib import Path
import json,re,subprocess,wave
p=Path(__file__).resolve().parents[1]
html=(p/'index.html').read_text()
assert 'game-3.0.1.js?v=3.0.1' in html and 'game-2.2.js' not in html
assert 'Build 3.0 RC · 3.0.1' in html
m=json.loads((p/'config/assets-3.0.1.js').read_text().split('=',1)[1].strip().rstrip(';'))
refs=re.findall(r'(?:src|href)="([^"?]+)',html)+list(m['images'].values())+list(m['sfx'].values())+[s['path'] for s in m['tracks'].values()]+[s['path'] for s in m['cues'].values()]
for f in refs:assert (p/f).is_file(),f
assert not any(f.startswith('/') for f in refs)
for prefix in ['baseline-2.2/','game-3.0/','source-history/']:
 for f in subprocess.check_output(['git','ls-tree','-r','--name-only','c84a3c01884d783bd98166c9a7a380ebb3a338e4',prefix],cwd=p,text=True).splitlines():
  assert (p/f).read_bytes()==subprocess.check_output(['git','show','c84a3c01884d783bd98166c9a7a380ebb3a338e4:'+f],cwd=p),f
for f in ['game-2.2.js','style-2.2.css','game.js','style.css']:
 assert (p/f).read_bytes()==subprocess.check_output(['git','show','c84a3c01884d783bd98166c9a7a380ebb3a338e4:'+f],cwd=p),f
for f in ['assets/music/music_main_menu.wav']+[v['path'] for v in m['cues'].values()]:
 with wave.open(str(p/f)) as w:assert w.getnframes()>0;print(f,round(w.getnframes()/w.getframerate(),3),'s')
# Preserve the gameplay functions verbatim from the uploaded RC wherever this patch has no reason to touch them.
a=(p/'game-3.0/game-3.0.js').read_text();b=(p/'game-3.0.1.js').read_text()
for name in ['shoot','aimLine','snap','check','cluster','floating','pos','neighbors']:
 def extract(s):
  start=s.index('function '+name+'(');end=s.find('\nfunction ',start+1);return s[start:end if end!=-1 else len(s)]
 assert extract(a)==extract(b),'Unexpected gameplay change: '+name
assert (p/'config/levels-3.0.js').read_bytes()==(p/'game-3.0/config/levels-3.0.js').read_bytes()
print('PASS',len(refs),'relative references; root targets 3.0 RC; baseline/source snapshots and gameplay functions preserved.')
