from pathlib import Path
import subprocess,re
p=Path(__file__).resolve().parents[1]
for f in subprocess.check_output(['git','ls-tree','-r','--name-only','160fb51'],cwd=p,text=True).splitlines():
 if f!='index.html':assert (p/f).read_bytes()==subprocess.check_output(['git','show',f'160fb51:{f}'],cwd=p),f
old=(p/'game-3.1.2.js').read_text();new=(p/'game-3.1.3.js').read_text()
def without_loop(s):
 a=s.index('function loop(now)');b=s.index('function pointer(',a);return s[:a]+s[b:]
assert without_loop(old)==without_loop(new),'Only loop diagnostics may differ in game source'
body=old[old.index('function loop(now){')+len('function loop(now){'):old.index('\nfunction pointer(')].removesuffix('}')
assert body.replace('requestAnimationFrame(loop)','requestAnimationFrame(loop);return;') in new,'Default loop must keep exact timing and steps'
h=(p/'index.html').read_text()
for f in re.findall(r'(?:src|href)="([^"?]+)',h):assert (p/f).is_file(),f
assert 'game-3.1.3.js?v=3.1.3' in h
print('PASS: all 3.1.2 files retained; entire game outside diagnostic loop byte-identical; default loop timing identical; runtime paths resolve')
