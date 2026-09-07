from pathlib import Path
import subprocess,re
p=Path(__file__).resolve().parents[1]
for f in subprocess.check_output(['git','ls-tree','-r','--name-only','d830324'],cwd=p,text=True).splitlines():
 if f!='index.html':assert (p/f).read_bytes()==subprocess.check_output(['git','show',f'd830324:{f}'],cwd=p),f
old=(p/'game-3.1.4.js').read_text();new=(p/'game-3.1.5.js').read_text()
for name in ['shoot','aimLine','snap','cluster','floating','pos','neighbors','helperSafety','helperNeed','considerHelper','continueLevel','bombImpact','explodeBomb','speechBubble','pedestal','cat','launcher','buildLevel','loop']:
 def extract(s):
  a=s.index('function '+name+'(');b=s.find('\nfunction ',a+1);return s[a:b]
 assert extract(old)==extract(new),name
# All post-shot physical/UI effect updates retain old gravity and time scale.
a=old.index(' particles.forEach(p=>{p.t-=dt;');b=old.index('\nfunction drawFlyer',a);assert old[a:b] in new
h=(p/'index.html').read_text();assert 'render-cache-3.1.3.js?v=3.1.3' in h
for f in re.findall(r'(?:src|href)="([^"?]+)',h):assert (p/f).is_file(),f
assert 'game-3.1.5.js?v=3.1.5' in h
print('PASS cache/level/audio/UI files preserved; launch/guide/match/helper/bomb/loop unchanged; other motion gravity unchanged; all runtime paths resolve')
