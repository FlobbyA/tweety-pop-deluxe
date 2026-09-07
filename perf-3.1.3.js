/* Opt-in, local-only diagnostics. No network telemetry and no gameplay changes. */
(() => {
'use strict';
if(new URLSearchParams(location.search).get('perf')!=='1')return;
const capacity=7200,columns=['rafMs','updateMs','drawMs','clippedMs','steps','state','eggs','particles','shells','falls','helper'];
const data=columns.map(()=>new Float64Array(capacity));let count=0,index=0,lastStamp=null,lastUi=0,longTasks=[],loafs=[];
const requestedHz=Number(new URLSearchParams(location.search).get('hz'))||0;
const panel=document.createElement('aside'),text=document.createElement('pre'),save=document.createElement('button');
panel.style.cssText='position:fixed;right:4px;top:75px;z-index:99;background:#100c20dd;color:#fff;padding:6px;border-radius:6px;pointer-events:none;font:11px monospace;max-width:240px';
text.style.cssText='margin:0;white-space:pre-wrap';save.textContent='Save performance JSON';save.style.cssText='pointer-events:auto;font:11px sans-serif;min-height:32px';panel.append(text,save);document.body.append(panel);
function percentile(a,p){if(!a.length)return 0;return a[Math.min(a.length-1,Math.floor((a.length-1)*p))]}
function stats(values){const a=values.slice().sort((a,b)=>a-b);return {mean:a.reduce((s,v)=>s+v,0)/(a.length||1),p50:percentile(a,.5),p95:percentile(a,.95),p99:percentile(a,.99),max:a.at(-1)||0}}
function rows(){const result=[];for(let n=0;n<count;n++){const i=(index-count+n+capacity)%capacity;result.push(columns.map((_,j)=>data[j][i]))}return result}
function summary(rows){const playing=rows.filter(r=>r[5]===1),intervals=playing.map(r=>r[0]).filter(v=>v>0),timing=stats(intervals),estimate=requestedHz||([60,90,120].reduce((a,b)=>Math.abs(1000/a-timing.p50)<Math.abs(1000/b-timing.p50)?a:b,60));return {playingFrames:playing.length,raf:timing,fps:timing.mean?1000/timing.mean:0,update:stats(playing.map(r=>r[1])),drawSubmission:stats(playing.map(r=>r[2])),over50ms:intervals.filter(v=>v>50).length,assumedHz:estimate,estimatedMissedVsync:intervals.reduce((s,v)=>s+Math.max(0,Math.round(v/(1000/estimate))-1),0),clippedElapsedMs:playing.reduce((s,r)=>s+r[3],0)}}
function report(){const r=rows(),c=document.getElementById('game'),box=c.getBoundingClientRect();return {build:'3.1.3',renderCache:new URLSearchParams(location.search).get('cache')==='0'?'disabled':'enabled',time:new Date().toISOString(),userAgent:navigator.userAgent,dpr:devicePixelRatio,viewport:{width:innerWidth,height:innerHeight},canvas:{width:c.width,height:c.height,cssWidth:box.width,cssHeight:box.height,pixels:c.width*c.height},summary:summary(r),columns,rows:r,longTasks,loafs,notes:'Desktop mobile emulation is not Android. Draw timing is CPU command submission, not GPU completion. Estimated missed vsync uses requested hz or inferred median; not measured display drops. State 1=playing,2=paused,3=clear feedback,0=menu/result.'}}
window.TweetyPerf={frame(stamp,updateMs,drawMs,clippedMs,steps,state,eggs,particles,shells,falls,helper){
 const dt=lastStamp===null?0:stamp-lastStamp;lastStamp=stamp;if(dt<=0)return;
 const values=[dt,updateMs,drawMs,clippedMs,steps,state,eggs,particles,shells,falls,helper];for(let j=0;j<values.length;j++)data[j][index]=values[j];index=(index+1)%capacity;count=Math.min(capacity,count+1);
 if(stamp-lastUi>1000){lastUi=stamp;const s=summary(rows().slice(-240));text.textContent=`3.1.3 DIAGNOSTIC\nFPS ${s.fps.toFixed(1)} · latest ${dt.toFixed(1)}ms\np95 ${s.raf.p95.toFixed(1)}ms\nUpdate ${s.update.mean.toFixed(2)}ms\nDraw submit ${s.drawSubmission.mean.toFixed(2)}ms\nLong >50ms ${s.over50ms}\nCapture while playing, then Save`;}},resetClock(){lastStamp=null},report};
document.addEventListener('visibilitychange',()=>{lastStamp=null});
for(const [type,destination] of [['longtask',longTasks],['long-animation-frame',loafs]])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){destination.push({startTime:e.startTime,duration:e.duration,blockingDuration:e.blockingDuration||0});if(destination.length>200)destination.shift()}}).observe({type,buffered:false})}catch{}
save.onclick=()=>{const blob=new Blob([JSON.stringify(report(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Tweety-performance-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
})();
