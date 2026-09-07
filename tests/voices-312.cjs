const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const started=[],events={};let now=0;
class Source{connect(){}disconnect(){}start(t){this.time=t;started.push(this)}stop(){this.stopped=true;this.onended?.()}}
class Context{constructor(){this.currentTime=10;this.state='running'}createGain(){return {gain:{value:1},connect(){},disconnect(){}}}createBufferSource(){return new Source()}decodeAudioData(){return Promise.resolve({})}}
const s={window:{AudioContext:Context},document:{hidden:false,addEventListener:(e,f)=>events[e]=f},Audio:class{addEventListener(){}removeEventListener(){}pause(){}play(){return Promise.resolve()}},Image:class{set src(v){this.onload()}},fetch:()=>Promise.resolve({ok:true,arrayBuffer:()=>Promise.resolve(new ArrayBuffer(4))}),setTimeout,clearTimeout};vm.createContext(s);
vm.runInContext(fs.readFileSync('config/assets-3.1.2.js','utf8'),s);vm.runInContext(fs.readFileSync('assets-3.1.2.js','utf8'),s);
(async()=>{let a=s.window.TweetyAssets;a.audioUnlock();await new Promise(r=>setImmediate(r));
assert(a.voice('vocal_danger',{priority:3}));assert.equal(started.length,1);a.voice('vocal_nice',{priority:1});assert.equal(started.length,1);a.voice('vocal_helper',{priority:3});assert.equal(started.length,1);a.voice('vocal_game_over',{priority:4});assert(started[0].stopped);assert.equal(started.length,2);console.log('PASS ordinary/equal voices suppressed, higher priority replaces without overlap');
a.effect('sfx_egg_shells',{delay:.085});assert.equal(started.at(-1).time,10.085);console.log('PASS shell layer uses audio clock scheduling');
a.stopEffects();assert(started.every(x=>x.stopped));console.log('PASS pause/session cleanup stops scheduled sources');
a.voice('vocal_nice');a.setMuted(true);assert(started.at(-1).stopped);const n=started.length;a.voice('vocal_danger');assert.equal(started.length,n);a.setMuted(false);a.voice('vocal_danger');s.document.hidden=true;events.visibilitychange();assert(started.at(-1).stopped);console.log('PASS mute and hidden tab stop vocals');
s.document.hidden=false;let fallback=0;a.effect('missing',{fallback:()=>fallback++});assert.equal(fallback,1);assert.equal(a.voice('missing'),false);console.log('PASS absent media falls back without blocking');
const m=s.window.TWEETY_MANIFEST;assert(m.sfx.vocal_game_over.endsWith('vocal_game_over.wav'));assert(!JSON.stringify(m).includes('Gameover.wav'));for(const r of ['nice','excited','annoyed','danger','warning','helper','level_clear','game_over','missed','disappointed'])assert(m.vocals[r].every(v=>m.sfx[v]));console.log('PASS all requested mood roles mapped');
})().catch(e=>{console.error(e);process.exitCode=1});
