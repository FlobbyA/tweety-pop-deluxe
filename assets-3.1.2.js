/* External role-based audio. No production audio data is embedded here. */
(() => {
'use strict';
const manifest=window.TWEETY_MANIFEST,images={},buffers={},failed=[];
const url=path=>path+(path.includes('?')?'&':'?')+'v='+encodeURIComponent(manifest.version);
let context=null,master=null,muted=false,unlocked=false,scene='menu',musicWanted=true,active=0;
const tracks={},cues={},pending=new Set(),sources=new Set(),fallbackTimers=new Set();
let voiceSource=null,voicePriority=0;
function media(spec){try{const a=new Audio(url(spec.path));a.loop=!!spec.loop;a.volume=spec.volume??.5;a.preload='auto';a.addEventListener('error',()=>{if(!failed.includes(spec.path))failed.push(spec.path)});return a}catch{return null}}
for(const [role,spec] of Object.entries(manifest.tracks))tracks[role]=media(spec);
for(const [role,spec] of Object.entries(manifest.cues))cues[role]=media(spec);
function safePlay(a){if(!a)return Promise.reject(Error('missing audio'));try{return Promise.resolve(a.play())}catch(e){return Promise.reject(e)}}
function syncMusic(){
 const wanted=scene==='menu'?'music_main_menu':scene==='gameplay'?'music_gameplay_loop':scene==='campaign'?'music_campaign_complete':null;
 for(const [role,a] of Object.entries(tracks)){if(!a)continue;if(role===wanted&&musicWanted&&unlocked&&!muted&&!document.hidden){safePlay(a).catch(()=>{});}else a.pause()}
}
function setScene(value){if(value==="menu"||value==="ready")stopEffects();scene=value;musicWanted=true;syncMusic()}
function setMusic(enabled){musicWanted=enabled;syncMusic()}
function stopCues(){for(const finish of [...pending])finish();for(const a of Object.values(cues)){if(!a)continue;a.pause();try{a.currentTime=0}catch{}}}
function cue(role,{maxWait=2200}={}){
 const a=cues[role];if(!a||!unlocked||muted||document.hidden||a.error)return Promise.resolve(false);
 return new Promise(resolve=>{let finished=false,timer;
  const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);a.removeEventListener('ended',finish);a.removeEventListener('error',finish);pending.delete(finish);a.pause();resolve(true)};
  pending.add(finish);a.addEventListener('ended',finish);a.addEventListener('error',finish);timer=setTimeout(finish,maxWait);
  try{a.currentTime=0}catch{}safePlay(a).catch(finish);
 });
}
function audioUnlock(){
 unlocked=true;
 try{if(!context){context=new(window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=muted?0:.65;master.connect(context.destination);
  for(const [role,path] of Object.entries(manifest.sfx))fetch(url(path)).then(r=>{if(!r.ok)throw Error(path);return r.arrayBuffer()}).then(a=>context.decodeAudioData(a)).then(b=>buffers[role]=b).catch(()=>{if(!failed.includes(path))failed.push(path)});
 }if(context.state==='suspended')Promise.resolve(context.resume()).catch(()=>{});}catch{/* Media audio or silence is enough to play. */}
 syncMusic();
}
function stopEffects(){
 for(const t of fallbackTimers)clearTimeout(t);fallbackTimers.clear();
 for(const s of [...sources]){try{s.stop()}catch{}s.onended?.()}voiceSource=null;voicePriority=0;
}
function startBuffer(role,{delay=0,priority=0,vocal=false}={}){
 if(muted||document.hidden||!unlocked)return true;
 if(!context||!buffers[role])return false;
 if(vocal&&voiceSource){if(priority<=voicePriority)return true;const previous=voiceSource;try{previous.stop()}catch{}previous.onended?.();}
 if(active>=12)return true;
 try{const s=context.createBufferSource(),g=context.createGain();s.buffer=buffers[role];g.gain.value=manifest.gains?.[role]??1;s.connect(g);g.connect(master);active++;sources.add(s);
 if(vocal){voiceSource=s;voicePriority=priority;}
 let ended=false;s.onended=()=>{if(ended)return;ended=true;active--;sources.delete(s);s.disconnect();g.disconnect();if(voiceSource===s){voiceSource=null;voicePriority=0}};
 s.start(context.currentTime+delay);return true}catch{return false}
}
function voice(role,options={}){return startBuffer(role,{...options,vocal:true})}
function effect(role,{delay=0,fallback}={}){
 if(startBuffer(role,{delay}))return true;
 if(fallback){if(!delay)fallback();else{const t=setTimeout(()=>{fallbackTimers.delete(t);if(!muted&&!document.hidden)fallback()},delay*1000);fallbackTimers.add(t)}}return false;
}
function play(role){
 if(role==='clear'||role==='lose'){stopCues();void cue(role==='clear'?'sfx_level_clear':'sfx_game_over');return true}
 return startBuffer(role);
}
function setMuted(value){muted=value;if(master)master.gain.value=value?0:.65;if(value){stopEffects();stopCues();if(window.speechSynthesis)window.speechSynthesis.cancel()}syncMusic()}
function speakHelper(enabled){if(!enabled||muted||!unlocked||document.hidden||!window.speechSynthesis)return;const speech=new SpeechSynthesisUtterance("Tweety's here to help!");speech.lang='en-US';speech.pitch=1.65;speech.rate=1.08;speech.volume=.55;window.speechSynthesis.speak(speech)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopEffects();stopCues();if(window.speechSynthesis)window.speechSynthesis.cancel()}syncMusic()});
const ready=Promise.all(Object.entries(manifest.images).map(([role,path])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images[role]=img;resolve()};img.onerror=()=>{failed.push(path);resolve()};img.src=url(path)})));
window.TweetyAssets={manifest,images,url,ready,failed,audioUnlock,play,voice,effect,stopEffects,setMusic,setScene,setMuted,speakHelper,cue,stopCues};
})();
