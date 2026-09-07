/* Replace paths in config/assets-3.0.js; no gameplay edits required. */
(() => {
'use strict';
const manifest=window.TWEETY_MANIFEST,images={},buffers={},failed=[];
const url=path=>path+'?v='+encodeURIComponent(manifest.version);
let context=null,master=null,musicWanted=false,muted=false;
const music=new Audio(url(manifest.music));music.loop=true;music.volume=.24;music.preload='none';
function setMusic(enabled){musicWanted=enabled;if(enabled&&!muted&&!document.hidden){music.play().catch(()=>{});}else music.pause();}
function audioUnlock(){
 try{if(!context){context=new(window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=.65;master.connect(context.destination);
  for(const [role,path] of Object.entries(manifest.sfx))fetch(url(path)).then(r=>{if(!r.ok)throw Error(path);return r.arrayBuffer()}).then(a=>context.decodeAudioData(a)).then(b=>buffers[role]=b).catch(()=>failed.push(path));
 }if(context.state==='suspended')context.resume();}catch(e){/* Silent play remains available on unsupported browsers. */}
}
let active=0;
function play(role){if(muted)return true;if(!context||!buffers[role])return false;if(active>=12)return true;const s=context.createBufferSource();s.buffer=buffers[role];s.connect(master);active++;s.onended=()=>{active--;s.disconnect()};s.start();return true;}
function setMuted(value){muted=value;if(master)master.gain.value=value?0:.65;setMusic(musicWanted);if(value&&window.speechSynthesis)window.speechSynthesis.cancel();}
function speakHelper(enabled){if(!enabled||muted||!window.speechSynthesis)return;const speech=new SpeechSynthesisUtterance("Tweety's here to help!");speech.lang='en-US';speech.pitch=1.65;speech.rate=1.08;speech.volume=.55;window.speechSynthesis.speak(speech);}
const ready=Promise.all(Object.entries(manifest.images).map(([role,path])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images[role]=img;resolve()};img.onerror=()=>{failed.push(path);resolve()};img.src=url(path)})));
window.TweetyAssets={manifest,images,url,ready,failed,audioUnlock,play,setMusic,setMuted,speakHelper};
})();
