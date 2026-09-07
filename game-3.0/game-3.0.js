(() => {
"use strict";
const c=document.getElementById("game"),x=c.getContext("2d");
const scoreEl=document.getElementById("score"),levelEl=document.getElementById("level");
const overlay=document.getElementById("overlay"),ot=document.getElementById("overlayTitle"),op=document.getElementById("overlayText");
const startBtn=document.getElementById("startBtn"),restartBtn=document.getElementById("restartBtn"),soundBtn=document.getElementById("soundBtn");

const LEVELS=window.TWEETY_LEVELS;
const assets=window.TweetyAssets;
const levelConfig=()=>LEVELS[level-1];
let paused=false,advanceTimer=null,session=0,dangerClock=0,hatches=[],reaction="neutral",reactionTimer=0;
const W=480,H=760,wall=43,r=18,rowH=31,cols=10,shooter={x:240,y:665};
const colors=["#e9413c","#3473df","#2fbd75","#f1d33c","#aa4bd2"],spots=["#ffe0dc","#e1e9ff","#dff8e7","#fff7bd","#f0dcf7"];

let grid=[],shot=null,current=0,next=1,aim={x:240,y:300},score=0,level=1,running=false,ceiling=0,shots=0;
let particles=[],falls=[],texts=[],shake=0,recoil=0,last=performance.now(),audio=null,sound=true,transition=false;
let clearPending=false,clearTimer=0,combo=0,maxCombo=0,missStreak=0;
let flyer=null,flyerTimer=0,bonusEgg=null,hatchTarget=null,hatchTimer=0,stompFlash=0,levelTime=0,bombQueued=false;

function A(){assets.audioUnlock();if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume()}
function tone(f,d=.07,type="sine",v=.06,slide=0){if(!sound||!audio)return;let o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(35,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+d)}
function noise(d=.08,v=.03){if(!sound||!audio)return;let n=Math.floor(audio.sampleRate*d),b=audio.createBuffer(1,n,audio.sampleRate),q=b.getChannelData(0);for(let i=0;i<n;i++)q[i]=(Math.random()*2-1)*(1-i/n);let s=audio.createBufferSource(),g=audio.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(audio.destination);s.start()}
const sfx={
 launch(){tone(125,.1,"triangle",.11,170);tone(68,.08,"sine",.07,-18);noise(.04,.02)},
 wall(){tone(250,.04,"square",.028,-65)},
 hit(){tone(105,.065,"triangle",.06,-24);noise(.035,.018)},
 pop(n=3){for(let i=0;i<Math.min(n,3);i++)setTimeout(()=>tone(430+i*70,.05,"sine",.04,110),i*18)},
 drop(){tone(175,.1,"triangle",.04,-95)},
 stomp(){tone(58,.24,"sawtooth",.06,-22);noise(.17,.035)},
 clear(){[392,523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.16,"triangle",.05,80),i*85))},
 lose(){[220,174,130].forEach((f,i)=>setTimeout(()=>tone(f,.22,"sawtooth",.045,-38),i*120))},
 bonus(){[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.1,"triangle",.045,90),i*55))},
 hatch(){tone(700,.08,"sine",.055,220);setTimeout(()=>tone(920,.12,"triangle",.045,100),70)},
 combo(n){tone(350+n*55,.08,"triangle",.04,90)}
};

function randColor(){let present=[...new Set(grid.map(e=>e.color))];return present.length?present[Math.floor(Math.random()*present.length)]:Math.floor(Math.random()*5)}
function pos(row,col){return{x:wall+r+col*r*2+(row%2?r:0),y:67+r+row*rowH+ceiling}}
function neighbors(row,col){let odd=row%2,ds=odd?[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]:[[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];return ds.map(([a,b])=>({row:row+a,col:col+b})).filter(p=>p.row>=0&&p.col>=0&&p.col<cols)}
function occupied(row,col){return grid.some(e=>e.row===row&&e.col===col)}

function buildLevel(n){
 hatches=[];dangerClock=0;reaction="neutral";reactionTimer=0;
 grid=[];ceiling=0;shots=0;particles=[];falls=[];texts=[];shot=null;transition=false;clearPending=false;clearTimer=0;
 combo=0;missStreak=0;flyer=null;flyerTimer=n===1?20:14;bonusEgg=null;hatchTarget=null;hatchTimer=0;levelTime=0;bombQueued=false;
 let cfg=LEVELS[n-1],rows=cfg.rows;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   let keep=n===1?(Math.random()<.72):n===2?(Math.random()<.82 && !(row>4&&col>2&&col<7)):(Math.random()<cfg.density && !(row>3 && ((n%3===0&&col===4)||(n%3===1&&(col+row)%7===0)||(n%3===2&&row===rows-2&&col>3&&col<7))));
   if(keep)grid.push({row,col,color:Math.floor(Math.random()*5),w:0});
 }
 if(!grid.length)grid.push({row:0,col:4,color:0,w:0});
 current=randColor();next=randColor();levelEl.textContent=n;document.getElementById("levelName").textContent=cfg.name;running=true;paused=false;
}
function reset(){session++;clearTimeout(advanceTimer);advanceTimer=null;maxCombo=0;paused=false;score=0;level=1;scoreEl.textContent="000000";buildLevel(1)}

function egg(px,py,ci,scale=1,rot=0,alpha=1,special=false){
 const img=assets.images[special?"helper_target":`egg_${ci}`];
 if(img){x.save();x.globalAlpha=alpha;x.translate(px,py);x.rotate(rot);x.scale(scale,scale);x.drawImage(img,-r,special?-r:-r*1.1,r*2,special?r*2:r*2.2);x.restore();return;}
 x.save();x.globalAlpha=alpha;x.translate(px,py);x.rotate(rot);x.scale(scale,scale);
 let g=x.createRadialGradient(-6,-8,2,0,2,22);
 if(special){g.addColorStop(0,"#fff");g.addColorStop(.25,"#ffd95a");g.addColorStop(1,"#b86d00")}
 else{g.addColorStop(0,"#fff8");g.addColorStop(.24,colors[ci]);g.addColorStop(1,"#0005")}
 x.fillStyle=g;x.beginPath();x.ellipse(0,0,r*.94,r*1.08,0,0,Math.PI*2);x.fill();x.strokeStyle="#0005";x.lineWidth=2;x.stroke();
 if(!special){x.fillStyle=spots[ci];[[-7,-5],[7,-8],[2,6],[-9,8],[10,7]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],4,0,7);x.fill()})}
 else{x.fillStyle="#fff6";x.beginPath();x.arc(-5,-7,5,0,7);x.fill();x.fillStyle="#6c3f00";x.font="900 13px system-ui";x.textAlign="center";x.fillText("★",0,5)}
 x.restore()
}
function bg(){
 const back=assets.images.background;if(back)x.drawImage(back,0,0,W,H);
 let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#33284f");g.addColorStop(.55,"#201a35");g.addColorStop(1,"#100d1c");if(!back){x.fillStyle=g;x.fillRect(0,0,W,H);}
 for(let sx of [0,W-wall])for(let y=0;y<H;y+=52){const tile=assets.images.stone_side;if(tile)x.drawImage(tile,sx,y,wall,52);else{x.fillStyle="#78634c";x.fillRect(sx,y,wall,50)}}
 let by=55+ceiling;const beam=assets.images.pressure_beam;if(beam)x.drawImage(beam,wall,by,W-wall*2,31);else{x.fillStyle="#9b805d";x.fillRect(wall,by,W-wall*2,31)}
 if(stompFlash>0){x.fillStyle=`rgba(255,225,145,${stompFlash})`;x.fillRect(wall,by,W-wall*2,31)}
 x.fillStyle="#6b5743";x.fillRect(wall,H-42,W-wall*2,42)
}
function character(img,px,py,size){x.save();x.beginPath();x.arc(px+size/2,py+size/2,size/2,0,Math.PI*2);x.clip();x.drawImage(img,px,py,size,size);x.restore()}
function cat(){
 const img=assets.images.tweety_launcher_back;if(img){character(img,199,H-107+recoil*5,82);return;}
 let y=H-25+recoil*5;x.save();x.translate(W/2,y);x.fillStyle="#09090c";
 x.beginPath();x.ellipse(0,-28,34,41,0,0,7);x.fill();x.beginPath();x.moveTo(-24,-55);x.lineTo(-12,-79);x.lineTo(-2,-57);x.fill();x.beginPath();x.moveTo(24,-55);x.lineTo(12,-79);x.lineTo(2,-57);x.fill();
 x.strokeStyle="#101014";x.lineWidth=10;x.lineCap="round";x.beginPath();x.moveTo(27,-17);x.quadraticCurveTo(48,-7,42,15);x.stroke();x.restore()
}
function sling(){let y=shooter.y+30+recoil*9;x.strokeStyle="#6f261c";x.lineWidth=11;x.lineCap="round";x.beginPath();x.moveTo(214,y+15);x.lineTo(228,y-22);x.moveTo(266,y+15);x.lineTo(252,y-22);x.stroke();x.strokeStyle="#2a0d0b";x.lineWidth=4;x.beginPath();x.moveTo(228,y-22);x.lineTo(252,y-22);x.stroke()}
function launcher(){
 if(!shot){
 if(bombQueued){x.save();x.translate(shooter.x,shooter.y-37);x.fillStyle="#24242b";x.beginPath();x.arc(0,0,19,0,7);x.fill();x.fillStyle="#ffcf45";x.font="900 18px system-ui";x.textAlign="center";x.fillText("✦",0,6);x.restore()}
 else egg(shooter.x,shooter.y-37,current,1.08+Math.sin(performance.now()/180)*.015);
 }
 x.save();x.font="bold 11px system-ui";x.textAlign="center";x.fillStyle="#cfc5e5";x.fillText("NEXT",405,667);egg(405,696,next,.72);x.restore()
}

function aimLine(){
 if(!running||paused||shot||transition||clearPending)return;
 let sx=shooter.x,sy=shooter.y-37,dx=aim.x-sx,dy=aim.y-sy;if(dy>-55)dy=-55;let l=Math.hypot(dx,dy);dx/=l;dy/=l;
 let px=sx,py=sy,vx=dx*690,vy=dy*690,step=1/120,t=0,points=[{x:px,y:py}],lastPlot=0,bounces=0,done=false;
 while(t<1.7&&!done){let drag=Math.pow(.988,step*60);vx*=drag;vy*=drag;px+=vx*step;py+=vy*step;t+=step;
   if(px-r<wall){px=wall+r;vx=Math.abs(vx)*.94;bounces++}else if(px+r>W-wall){px=W-wall-r;vx=-Math.abs(vx)*.94;bounces++}
   if(t-lastPlot>.035){points.push({x:px,y:py,b:bounces});lastPlot=t}
   if(py-r<67+ceiling){done=true;break}
   for(let e of grid){let p=pos(e.row,e.col);if(Math.hypot(p.x-px,p.y-py)<r*1.76){done=true;break}}
   if(bonusEgg&&Math.hypot(bonusEgg.x-px,bonusEgg.y-py)<r*1.8){done=true;break}
   if(bounces>3)done=true;
 }
 points.push({x:px,y:py,b:bounces});x.save();x.strokeStyle="#ffffffe0";x.lineWidth=2.4;x.setLineDash([7,7]);x.lineCap="round";x.lineJoin="round";x.beginPath();x.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)x.lineTo(points[i].x,points[i].y);x.stroke();x.setLineDash([]);
 x.fillStyle="#ffe576";let pb=0;for(let i=1;i<points.length;i++)if(points[i].b>pb){x.beginPath();x.arc(points[i].x,points[i].y,5,0,7);x.fill();pb=points[i].b}
 let p=points[points.length-1];x.strokeStyle="#ffe576";x.lineWidth=2;x.beginPath();x.arc(p.x,p.y,7,0,7);x.stroke();x.restore()
}

function puff(px,py,ci,count=7){count=Math.min(count,8);for(let i=0;i<count;i++){let a=Math.random()*7,s=75+Math.random()*135;particles.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-25,t:.35+Math.random()*.18,ci,size:2+Math.random()*4})}if(particles.length>90)particles.splice(0,particles.length-90)}
function text(t,px,py,big=false){texts.push({t,x:px,y:py,life:1,big});if(texts.length>10)texts.shift()}
function nearest(px,py){let row=Math.max(0,Math.round((py-67-r-ceiling)/rowH)),st=row%2?r:0,col=Math.max(0,Math.min(cols-1,Math.round((px-wall-r-st)/(r*2))));return{row,col}}
function cluster(st){let first=grid.find(e=>e.row===st.row&&e.col===st.col);if(!first)return[];let out=[],stack=[st],seen=new Set;while(stack.length){let q=stack.pop(),k=q.row+","+q.col;if(seen.has(k))continue;seen.add(k);let e=grid.find(z=>z.row===q.row&&z.col===q.col);if(!e||e.color!==first.color)continue;out.push(e);neighbors(q.row,q.col).forEach(n=>stack.push(n))}return out}
function floating(){let con=new Set,stack=grid.filter(e=>e.row===0).map(e=>({row:e.row,col:e.col}));while(stack.length){let q=stack.pop(),k=q.row+","+q.col;if(con.has(k)||!occupied(q.row,q.col))continue;con.add(k);neighbors(q.row,q.col).forEach(n=>stack.push(n))}let loose=grid.filter(e=>!con.has(e.row+","+e.col));grid=grid.filter(e=>con.has(e.row+","+e.col));return loose}

function triggerHatchCandidate(){
 if(hatchTarget||grid.length<8)return;
 let e=grid[Math.floor(Math.random()*grid.length)];hatchTarget=e;hatchTimer=6.5;text("A special egg is shaking!",240,125,true);sfx.bonus()
}
function rewardHatch(px,py){
 hatches.push({x:px,y:py,vy:-170,age:0,rot:0});reaction="excited";reactionTimer=1.8;
 score+=1000;scoreEl.textContent=String(score).padStart(6,"0");text("TWEETY! +1000",px,py,true);sfx.hatch();
 // Push danger back a little as a satisfying reward.
 ceiling=Math.max(0,ceiling-14)
}
function launchFlyer(){
 if(flyer||transition||clearPending)return;
 flyer={x:-55,y:165+Math.random()*120,vx:level===1?105:135,phase:0,dropped:false};text("TWEETY IS COMING!",240,118,true);sfx.bonus();assets.speakHelper(sound)
}
function dropBonusEgg(){
 bonusEgg={x:240+Math.random()*100-50,y:250,vy:0,life:12};text("HIT ↑ TO LIFT THE BEAM",240,160,false)
}
function explodeBomb(px,py){
 let dead=[];for(let e of grid){let p=pos(e.row,e.col);if(Math.hypot(p.x-px,p.y-py)<92)dead.push(e)}
 if(dead.length){let keys=new Set(dead.map(e=>e.row+","+e.col));dead.forEach(e=>{let p=pos(e.row,e.col);puff(p.x,p.y,e.color,6)});grid=grid.filter(e=>!keys.has(e.row+","+e.col));let loose=floating();spawnFalls(loose);score+=dead.length*150+loose.length*180;scoreEl.textContent=String(score).padStart(6,"0");text("BOMB!",px,py,true);sfx.pop(6)}
 ceiling=Math.max(0,ceiling-24);check()
}
function spawnFalls(loose){loose.slice(0,50).forEach(e=>{let p=pos(e.row,e.col);falls.push({x:p.x,y:p.y,ci:e.color,vx:(Math.random()-.5)*75,vy:-25-Math.random()*45,rot:0,vr:(Math.random()-.5)*5,life:1.6})});if(loose.length)sfx.drop()}

function snap(){
 let bomb=shot.bomb,cell=nearest(shot.x,shot.y),c0={...cell},impact={x:shot.x,y:shot.y};
 if(bomb){shot=null;bombQueued=false;recoil=1;shake=5;explodeBomb(impact.x,impact.y);current=next;next=randColor();return}
 if(occupied(c0.row,c0.col)){let opts=neighbors(c0.row,c0.col).filter(p=>!occupied(p.row,p.col));if(opts.length){opts.sort((a,b)=>{let A=pos(a.row,a.col),B=pos(b.row,b.col);return Math.hypot(A.x-shot.x,A.y-shot.y)-Math.hypot(B.x-shot.x,B.y-shot.y)});c0=opts[0]}else c0.row++}
 let pp=pos(c0.row,c0.col),ci=shot.color;grid.push({row:c0.row,col:c0.col,color:ci,w:1});shot=null;shake=5;sfx.hit();
 let cl=cluster(c0),matched=cl.length>=3;
 if(matched){
   let hatchHit=hatchTarget&&cl.includes(hatchTarget),keys=new Set(cl.map(e=>e.row+","+e.col));
   cl.forEach(e=>{let p=pos(e.row,e.col);puff(p.x,p.y,e.color,7)});grid=grid.filter(e=>!keys.has(e.row+","+e.col));sfx.pop(cl.length);
   let loose=floating();spawnFalls(loose);
   reaction="excited";reactionTimer=.85;combo++;maxCombo=Math.max(maxCombo,combo);sfx.combo(combo);
   let gain=cl.length*100+loose.length*175+Math.max(0,combo-1)*125;score+=gain;scoreEl.textContent=String(score).padStart(6,"0");
   text(combo>1?`COMBO x${combo}! +${gain}`:`+${gain}`,pp.x,pp.y,true);
   if(cl.length>=6){text("BIG POP!",240,145,true);score+=500;scoreEl.textContent=String(score).padStart(6,"0");sfx.bonus()}
   if(hatchHit){rewardHatch(pp.x,pp.y);hatchTarget=null;hatchTimer=0}
   if(combo>=4&&!bombQueued){bombQueued=true;text("BOMB READY!",240,185,true);sfx.bonus();combo=0}
 }else{reaction="annoyed";reactionTimer=.7;combo=0;missStreak++}
 shots++;current=next;next=randColor();
 // Authentic-feeling pressure pulse: smooth stomp after a shot interval, faster on level 2.
 let every=levelConfig().stompEvery;if(shots%every===0){ceiling+=levelConfig().stomp;stompFlash=.35;shake=7;sfx.stomp();text("STOMP!",240,105,true)}
 if(!hatchTarget&&Math.random()<levelConfig().hatchChance)triggerHatchCandidate();
 check()
}
function check(){
 if(grid.length===0){
   // Arm level-clear only once. Do not reset clearTimer every frame.
   if(!clearPending && !transition){
     clearPending=true;
     clearTimer=0;
     flyer=null;
     bonusEgg=null;
     hatchTarget=null;
     hatchTimer=0;
     bombQueued=false;
   }
   return
 }
 for(let e of grid){
   let p=pos(e.row,e.col);
   if(p.y+r>shooter.y-95){finish(false);return}
 }
}
function finish(win){if(!running&&!transition&&!clearPending)return;assets.setMusic(false);document.getElementById("overlayCat").src=assets.url(assets.manifest.images[win?"tweety_level_clear":"tweety_game_over"]);running=false;transition=false;clearPending=false;win?sfx.clear():sfx.lose();overlay.classList.remove("hidden");ot.textContent=win?"TWEETY TAKES OVER!":"Game Over";op.textContent=win?`Score ${String(score).padStart(6,"0")} • Max combo x${maxCombo}`:`The eggs reached Tweety. Score ${String(score).padStart(6,"0")}.`;startBtn.textContent="Play Again"}

function shoot(){
 if(!running||paused||shot||transition||clearPending)return;A();let sy=shooter.y-37,dx=aim.x-shooter.x,dy=aim.y-sy;if(dy>-55)dy=-55;let l=Math.hypot(dx,dy),speed=690;
 shot={x:shooter.x,y:sy,vx:dx/l*speed,vy:dy/l*speed,color:current,age:0,scale:.72,bomb:bombQueued};recoil=1;shake=2;sfx.launch()
}

function update(dt){
 if(paused||!running&&!transition&&!clearPending)return;
 reactionTimer=Math.max(0,reactionTimer-dt);if(!reactionTimer)reaction="neutral";
 hatches.forEach(h=>{h.age+=dt;h.vy+=540*dt;h.y+=h.vy*dt;h.rot+=dt*.7});hatches=hatches.filter(h=>h.y<H+100&&h.age<3);
 recoil=Math.max(0,recoil-dt*6);shake=Math.max(0,shake-dt*18);stompFlash=Math.max(0,stompFlash-dt);levelTime+=dt;
 grid.forEach(e=>e.w=Math.max(0,(e.w||0)-dt*5));

 // Slow continuous pressure, with a clearly faster second stage.
 if(running&&!transition&&!clearPending){
   ceiling += levelConfig().pressure*dt;
   dangerClock-=dt;if(dangerClock<=0&&grid.some(e=>pos(e.row,e.col).y+r>470)){if(sound)assets.play("danger");dangerClock=3;}
   flyerTimer-=dt;if(flyerTimer<=0&&!flyer){launchFlyer();flyerTimer=levelConfig().helperInterval}
 }
 if(hatchTarget){hatchTimer-=dt;if(hatchTimer<=0){hatchTarget=null;hatchTimer=0;text("Too late!",240,140,false)}}

 if(flyer){
   flyer.phase+=dt*7;flyer.x+=flyer.vx*dt;
   if(!flyer.dropped&&flyer.x>W*.55){flyer.dropped=true;dropBonusEgg()}
   if(flyer.x>W+70)flyer=null
 }
 if(bonusEgg){bonusEgg.vy+=65*dt;bonusEgg.y+=bonusEgg.vy*dt;bonusEgg.life-=dt;if(bonusEgg.y>500){bonusEgg.y=500;bonusEgg.vy=0}if(bonusEgg.life<=0)bonusEgg=null}

 if(clearPending&&!transition){
   if(grid.length===0&&!shot){
     clearTimer+=dt;
     // Prefer waiting for visual debris, but never allow cosmetics to deadlock progression.
     let visualsDone=(falls.length===0&&particles.length===0);
     if((visualsDone&&clearTimer>=.55)||clearTimer>=1.8){
       falls=[];particles=[];transition=true;running=false;clearPending=false;
       sfx.clear();text("LEVEL CLEAR!",240,300,true);
       const activeSession=session;
       advanceTimer=setTimeout(()=>{
         if(activeSession!==session)return;
         if(level<LEVELS.length){level++;buildLevel(level);text(`LEVEL ${level}`,240,330,true)}
         else finish(true)
       },750)
     }
   }else{
     clearTimer=0;
   }
 }

 if(shot){
   shot.age+=dt;shot.scale=Math.min(1,shot.scale+dt*5);let drag=Math.pow(.988,dt*60);shot.vx*=drag;shot.vy*=drag;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;
   if(shot.x-r<wall){shot.x=wall+r;shot.vx=Math.abs(shot.vx)*.94;shake=2;sfx.wall()}
   if(shot.x+r>W-wall){shot.x=W-wall-r;shot.vx=-Math.abs(shot.vx)*.94;shake=2;sfx.wall()}
   if(bonusEgg&&Math.hypot(bonusEgg.x-shot.x,bonusEgg.y-shot.y)<r*1.9){
     let bx=bonusEgg.x,by=bonusEgg.y;bonusEgg=null;score+=1500;scoreEl.textContent=String(score).padStart(6,"0");text("BEAM UP! +1500",bx,by,true);puff(bx,by,3,8);sfx.bonus();reaction="excited";reactionTimer=1.2;ceiling=Math.max(0,ceiling-18)
   }
   let hit=shot.y-r<67+ceiling;if(!hit)for(let e of grid){let p=pos(e.row,e.col);if(Math.hypot(p.x-shot.x,p.y-shot.y)<r*1.76){hit=true;break}}if(hit)snap()
 }

 particles.forEach(p=>{p.t-=dt;p.vy+=360*dt;p.x+=p.vx*dt;p.y+=p.vy*dt});particles=particles.filter(p=>p.t>0);
 falls.forEach(f=>{f.life-=dt;f.vy+=650*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt});falls=falls.filter(f=>f.life>0&&f.y<H+60);
 texts.forEach(t=>{t.life-=dt;t.y-=22*dt});texts=texts.filter(t=>t.life>0);
 check()
}

function drawFlyer(){
 if(!flyer)return;const img=assets.images.tweety_helper_flying;if(img){character(img,flyer.x-42,flyer.y-42+Math.sin(flyer.phase)*7,84);return;}x.save();x.translate(flyer.x,flyer.y+Math.sin(flyer.phase)*7);
 // placeholder "flying Tweety" silhouette
 x.fillStyle="#0b0b10";x.beginPath();x.ellipse(0,0,24,17,0,0,7);x.fill();x.beginPath();x.moveTo(-14,-9);x.lineTo(-6,-27);x.lineTo(0,-10);x.fill();x.beginPath();x.moveTo(13,-8);x.lineTo(7,-25);x.lineTo(2,-9);x.fill();
 x.strokeStyle="#0b0b10";x.lineWidth=7;x.beginPath();x.moveTo(-18,2);x.lineTo(-35,-10);x.moveTo(18,2);x.lineTo(35,-10);x.stroke();x.restore()
}
function draw(){
 x.save();x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);bg();
 grid.forEach(e=>{let p=pos(e.row,e.col),w=e.w||0,sc=1+w*.1;
   if(e===hatchTarget&&hatchTimer>0){let jig=Math.sin(performance.now()/45)*4;x.save();x.translate(jig,0);egg(p.x,p.y,e.color,sc);x.restore();x.strokeStyle="#ffe36a";x.lineWidth=2;x.beginPath();x.arc(p.x,p.y,24,0,7);x.stroke()}
   else egg(p.x,p.y,e.color,sc)
 });
 falls.forEach(f=>egg(f.x,f.y,f.ci,1,f.rot,Math.min(1,f.life*2)));
 particles.forEach(p=>{x.globalAlpha=Math.min(1,p.t*2);x.fillStyle=spots[p.ci];x.beginPath();x.arc(p.x,p.y,p.size,0,7);x.fill();x.globalAlpha=1});
 if(bonusEgg)egg(bonusEgg.x,bonusEgg.y,0,1.1,0,1,true);
 drawFlyer();aimLine();sling();cat();launcher();
 hatches.forEach(h=>{x.save();x.translate(h.x,h.y);x.rotate(h.rot);const img=assets.images.tweety_bonus_hatch;if(img)character(img,-38,-38,76);for(let i=0;i<4;i++){x.save();x.translate((i-1.5)*18*(1+h.age),20+h.age*20);x.rotate(i+h.age*3);x.fillStyle="#fff2be";x.beginPath();x.moveTo(-8,0);x.lineTo(0,-9);x.lineTo(9,4);x.closePath();x.fill();x.restore()}x.restore()});
 let lowest=grid.reduce((v,e)=>Math.max(v,pos(e.row,e.col).y+r),0),danger=running&&lowest>470;
 document.getElementById("danger").classList.toggle("active",danger);
 let mood=danger?"danger":reaction;let portrait=assets.images[`tweety_scorekeeper_${mood}`];if(portrait)character(portrait,57,668,65);
 if(danger){x.save();x.strokeStyle=`rgba(255,80,85,${.35+Math.sin(performance.now()/180)*.2})`;x.lineWidth=4;x.strokeRect(wall+2,564,W-wall*2-4,3);x.restore();}
 if(shot){if(shot.bomb){x.save();x.translate(shot.x,shot.y);x.fillStyle="#24242b";x.beginPath();x.arc(0,0,19,0,7);x.fill();x.fillStyle="#ffcf45";x.font="900 18px system-ui";x.textAlign="center";x.fillText("✦",0,6);x.restore()}else egg(shot.x,shot.y,shot.color,shot.scale,Math.atan2(shot.vy,shot.vx)+Math.PI/2)}
 texts.forEach(t=>{if(t.big&&assets.images.status_label){let width=Math.min(350,Math.max(140,t.t.length*12)),tx=Math.max(width/2+wall,Math.min(W-wall-width/2,t.x));x.save();x.globalAlpha=Math.min(1,t.life*2);x.drawImage(assets.images.status_label,tx-width/2,t.y-31,width,46);x.restore();t.x=tx;}x.globalAlpha=Math.min(1,t.life*2);x.textAlign="center";x.font=`900 ${t.big?23:17}px system-ui`;x.lineWidth=5;x.strokeStyle="#241632";x.strokeText(t.t,t.x,t.y);x.fillStyle="#ffe276";x.fillText(t.t,t.x,t.y);x.globalAlpha=1});x.restore()
}
function loop(now){let dt=Math.min(.056,(now-last)/1000);last=now;if(!document.hidden){while(dt>0){let step=Math.min(dt,1/120);update(step);dt-=step;}draw()}requestAnimationFrame(loop)}
function pointer(e){let q=c.getBoundingClientRect();return{x:(e.clientX-q.left)/q.width*W,y:(e.clientY-q.top)/q.height*H}}
let activePointer=null;
c.addEventListener("pointerdown",e=>{if(activePointer!==null||!running||paused)return;e.preventDefault();activePointer=e.pointerId;c.setPointerCapture(e.pointerId);aim=pointer(e);A()});
c.addEventListener("pointermove",e=>{if(e.pointerId===activePointer)aim=pointer(e)});
c.addEventListener("pointerup",e=>{if(e.pointerId!==activePointer)return;activePointer=null;aim=pointer(e);shoot()});
c.addEventListener("pointercancel",()=>{activePointer=null});
function start(){A();assets.setMusic(true);reset();overlay.classList.add("hidden");startBtn.textContent="Start Game"}
startBtn.onclick=start;restartBtn.onclick=start;soundBtn.onclick=()=>{sound=!sound;soundBtn.textContent=sound?"Sound On":"Sound Off";assets.setMuted(!sound);if(sound)A()};
document.getElementById("pauseBtn").onclick=()=>{if(!running)return;paused=!paused;document.getElementById("pauseBtn").textContent=paused?"Resume":"Pause";document.getElementById("pauseLabel").hidden=!paused;assets.setMusic(!paused);};
 document.addEventListener("visibilitychange",()=>{last=performance.now();if(document.hidden&&running){paused=true;document.getElementById("pauseBtn").textContent="Resume";document.getElementById("pauseLabel").hidden=false;assets.setMusic(false);}});
 const originalStart=start;startBtn.onclick=restartBtn.onclick=()=>{document.getElementById("pauseBtn").textContent="Pause";document.getElementById("pauseLabel").hidden=true;originalStart()};
 for(const role of Object.keys(sfx)){const fallback=sfx[role];sfx[role]=(...args)=>{if(!sound)return;if(!assets.play(role))fallback(...args)}}
 reset();running=false;startBtn.disabled=true;startBtn.textContent="Loading Tweety…";assets.ready.then(()=>{startBtn.disabled=false;startBtn.textContent="Start Game";if(assets.failed.length)op.textContent="Some artwork could not load. Refresh with a stable connection."});requestAnimationFrame(loop);
})();