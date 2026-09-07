(() => {
"use strict";
const c=document.getElementById("game"),x=c.getContext("2d");
const scoreEl=document.getElementById("score"),levelEl=document.getElementById("level");
const overlay=document.getElementById("overlay"),ot=document.getElementById("overlayTitle"),op=document.getElementById("overlayText");
const startBtn=document.getElementById("startBtn"),restartBtn=document.getElementById("restartBtn"),soundBtn=document.getElementById("soundBtn");
const W=480,H=760,wall=43,r=18,rowH=31,cols=10,shooter={x:240,y:665};
const colors=["#e9413c","#3473df","#2fbd75","#f1d33c","#aa4bd2"],spots=["#ffe0dc","#e1e9ff","#dff8e7","#fff7bd","#f0dcf7"];
let grid=[],shot=null,current=0,next=1,aim={x:240,y:300},score=0,level=1,running=false,ceiling=0,shots=0;
let particles=[],falls=[],texts=[],shake=0,recoil=0,impactPulse=0,last=performance.now(),audio=null,sound=true,transition=false,clearPending=false,clearTimer=0;

function A(){if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume()}
function tone(f,d=.07,type="sine",v=.06,slide=0){if(!sound||!audio)return;let o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(35,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+d)}
function noise(d=.08,v=.035){if(!sound||!audio)return;let n=Math.floor(audio.sampleRate*d),b=audio.createBuffer(1,n,audio.sampleRate),q=b.getChannelData(0);for(let i=0;i<n;i++)q[i]=(Math.random()*2-1)*(1-i/n);let s=audio.createBufferSource(),g=audio.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(audio.destination);s.start()}
const sfx={
 launch(){tone(125,.11,"triangle",.12,180);tone(65,.09,"sine",.08,-15);noise(.045,.025)},
 wall(){tone(260,.045,"square",.035,-70)},
 hit(){tone(105,.07,"triangle",.07,-25);noise(.04,.025)},
 pop(n=3){for(let i=0;i<Math.min(n,3);i++)setTimeout(()=>tone(430+i*70,.05,"sine",.04,110),i*20)},
 drop(){tone(180,.11,"triangle",.04,-100)},
 beam(){tone(62,.22,"sawtooth",.05,-20);noise(.15,.025)},
 clear(){[392,523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.18,"triangle",.055,90),i*90))},
 lose(){[220,174,130].forEach((f,i)=>setTimeout(()=>tone(f,.25,"sawtooth",.05,-40),i*130))}
};
function randColor(){let present=[...new Set(grid.map(e=>e.color))];return present.length?present[Math.floor(Math.random()*present.length)]:Math.floor(Math.random()*5)}
function pos(row,col){return{x:wall+r+col*r*2+(row%2?r:0),y:67+r+row*rowH+ceiling}}
function neighbors(row,col){let odd=row%2,ds=odd?[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]:[[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];return ds.map(([a,b])=>({row:row+a,col:col+b})).filter(p=>p.row>=0&&p.col>=0&&p.col<cols)}
function occupied(row,col){return grid.some(e=>e.row===row&&e.col===col)}
function buildLevel(n){
 grid=[];ceiling=0;shots=0;particles=[];falls=[];texts=[];shot=null;transition=false;clearPending=false;clearTimer=0;
 let rows=n===1?6:7;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   let keep=n===1?(Math.random()<.73):(Math.random()<.82 && !(row>4&&col>2&&col<7));
   if(keep){let palette=n===1?5:5;grid.push({row,col,color:Math.floor(Math.random()*palette),w:0})}
 }
 current=randColor();next=randColor();levelEl.textContent=n;running=true;
}
function reset(){score=0;level=1;scoreEl.textContent="000000";buildLevel(1)}
function egg(px,py,ci,scale=1,rot=0,alpha=1){
 x.save();x.globalAlpha=alpha;x.translate(px,py);x.rotate(rot);x.scale(scale,scale);
 let g=x.createRadialGradient(-6,-8,2,0,2,22);g.addColorStop(0,"#fff8");g.addColorStop(.24,colors[ci]);g.addColorStop(1,"#0005");
 x.fillStyle=g;x.beginPath();x.ellipse(0,0,r*.94,r*1.08,0,0,Math.PI*2);x.fill();
 x.strokeStyle="#0005";x.lineWidth=2;x.stroke();
 x.fillStyle=spots[ci];[[-7,-5],[7,-8],[2,6],[-9,8],[10,7]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],4,0,7);x.fill()});
 x.restore()
}
function bg(){
 let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#33284f");g.addColorStop(.55,"#201a35");g.addColorStop(1,"#100d1c");x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let sx of [0,W-wall]){x.fillStyle="#574837";x.fillRect(sx,0,wall,H);for(let y=0;y<H;y+=52){let gg=x.createLinearGradient(sx,y,sx+wall,y+52);gg.addColorStop(0,"#aa916b");gg.addColorStop(1,"#725e47");x.fillStyle=gg;x.fillRect(sx+4,y+4,wall-8,44);x.strokeStyle="#45382c";x.lineWidth=3;x.strokeRect(sx+4,y+4,wall-8,44)}}
 let by=55+ceiling;x.fillStyle="#6e5a43";x.fillRect(wall,by,W-wall*2,31);for(let xx=wall;xx<W-wall;xx+=58){x.fillStyle="#9b805d";x.fillRect(xx+3,by+3,52,25)}
 x.fillStyle="#6b5743";x.fillRect(wall,H-42,W-wall*2,42)
}
function cat(){
 let y=H-25+recoil*5;x.save();x.translate(W/2,y);x.fillStyle="#09090c";
 x.beginPath();x.ellipse(0,-28,34,41,0,0,7);x.fill();
 x.beginPath();x.moveTo(-24,-55);x.lineTo(-12,-79);x.lineTo(-2,-57);x.fill();
 x.beginPath();x.moveTo(24,-55);x.lineTo(12,-79);x.lineTo(2,-57);x.fill();
 x.strokeStyle="#101014";x.lineWidth=10;x.lineCap="round";x.beginPath();x.moveTo(27,-17);x.quadraticCurveTo(48,-7,42,15);x.stroke();x.restore()
}
function sling(){
 let y=shooter.y+30+recoil*9;x.strokeStyle="#6f261c";x.lineWidth=11;x.lineCap="round";x.beginPath();x.moveTo(214,y+15);x.lineTo(228,y-22);x.moveTo(266,y+15);x.lineTo(252,y-22);x.stroke();
 x.strokeStyle="#2a0d0b";x.lineWidth=4;x.beginPath();x.moveTo(228,y-22);x.lineTo(252,y-22);x.stroke()
}
function launcher(){
 if(shot)return;
 // current egg is deliberately above Tweety and never hidden
 egg(shooter.x,shooter.y-37,current,1.08+Math.sin(performance.now()/180)*.015);
 x.save();x.font="bold 11px system-ui";x.textAlign="center";x.fillStyle="#cfc5e5";x.fillText("NEXT",405,667);egg(405,696,next,.72);x.restore()
}
function aimLine(){
 if(!running||shot||transition)return;
 let sx=shooter.x,sy=shooter.y-37,dx=aim.x-sx,dy=aim.y-sy;
 if(dy>-55)dy=-55;
 let l=Math.hypot(dx,dy);dx/=l;dy/=l;

 // Predict using nearly the same travel model as the real projectile.
 let px=sx,py=sy,vx=dx*690,vy=dy*690;
 const step=1/120,maxTime=1.7;
 let t=0,points=[{x:px,y:py}],lastPlot=0,bounces=0,done=false;
 while(t<maxTime && !done){
   let drag=Math.pow(.988,step*60);
   vx*=drag;vy*=drag;
   px+=vx*step;py+=vy*step;t+=step;

   if(px-r<wall){px=wall+r;vx=Math.abs(vx)*.94;bounces++}
   else if(px+r>W-wall){px=W-wall-r;vx=-Math.abs(vx)*.94;bounces++}

   if(t-lastPlot>.035){points.push({x:px,y:py,b:bounces});lastPlot=t}

   if(py-r<67+ceiling){done=true;break}
   for(let e of grid){
     let p=pos(e.row,e.col);
     if(Math.hypot(p.x-px,p.y-py)<r*1.76){done=true;break}
   }
   if(bounces>3)done=true;
 }
 points.push({x:px,y:py,b:bounces});

 x.save();
 x.strokeStyle="#ffffffe0";x.lineWidth=2.4;x.setLineDash([7,7]);x.lineCap="round";x.lineJoin="round";
 x.beginPath();x.moveTo(points[0].x,points[0].y);
 for(let i=1;i<points.length;i++)x.lineTo(points[i].x,points[i].y);
 x.stroke();
 x.setLineDash([]);

 // Highlight every predicted wall-bounce location.
 x.fillStyle="#ffe576";
 let prevB=0;
 for(let i=1;i<points.length;i++){
   if(points[i].b>prevB){x.beginPath();x.arc(points[i].x,points[i].y,5,0,Math.PI*2);x.fill();prevB=points[i].b}
 }

 // Predicted impact marker.
 let p=points[points.length-1];
 x.strokeStyle="#ffe576";x.lineWidth=2;
 x.beginPath();x.arc(p.x,p.y,7,0,Math.PI*2);x.stroke();
 x.restore()
}
function puff(px,py,ci,count=8){
 count=Math.min(count,8);
 for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=75+Math.random()*135;particles.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-25,t:.38+Math.random()*.18,ci,size:2+Math.random()*4})}
 if(particles.length>90)particles.splice(0,particles.length-90)
}
function text(t,px,py,big=false){texts.push({t,x:px,y:py,life:.8,big})}
function nearest(px,py){let row=Math.max(0,Math.round((py-67-r-ceiling)/rowH)),st=row%2?r:0,col=Math.max(0,Math.min(cols-1,Math.round((px-wall-r-st)/(r*2))));return{row,col}}
function cluster(st){
 let first=grid.find(e=>e.row===st.row&&e.col===st.col);if(!first)return[];
 let out=[],stack=[st],seen=new Set;
 while(stack.length){let q=stack.pop(),k=q.row+","+q.col;if(seen.has(k))continue;seen.add(k);let e=grid.find(z=>z.row===q.row&&z.col===q.col);if(!e||e.color!==first.color)continue;out.push(e);neighbors(q.row,q.col).forEach(n=>stack.push(n))}
 return out
}
function floating(){
 let con=new Set,stack=grid.filter(e=>e.row===0).map(e=>({row:e.row,col:e.col}));
 while(stack.length){let q=stack.pop(),k=q.row+","+q.col;if(con.has(k)||!occupied(q.row,q.col))continue;con.add(k);neighbors(q.row,q.col).forEach(n=>stack.push(n))}
 let loose=grid.filter(e=>!con.has(e.row+","+e.col));grid=grid.filter(e=>con.has(e.row+","+e.col));return loose
}
function snap(){
 let cell=nearest(shot.x,shot.y),c0={...cell};
 if(occupied(c0.row,c0.col)){let opts=neighbors(c0.row,c0.col).filter(p=>!occupied(p.row,p.col));if(opts.length){opts.sort((a,b)=>{let A=pos(a.row,a.col),B=pos(b.row,b.col);return Math.hypot(A.x-shot.x,A.y-shot.y)-Math.hypot(B.x-shot.x,B.y-shot.y)});c0=opts[0]}else c0.row++}
 let pp=pos(c0.row,c0.col),ci=shot.color;grid.push({row:c0.row,col:c0.col,color:ci,w:1});shot=null;shake=5;impactPulse=.18;sfx.hit();
 let cl=cluster(c0);
 if(cl.length>=3){
   let keys=new Set(cl.map(e=>e.row+","+e.col));cl.forEach(e=>{let p=pos(e.row,e.col);puff(p.x,p.y,e.color,7)});grid=grid.filter(e=>!keys.has(e.row+","+e.col));sfx.pop(cl.length);
   let loose=floating();loose.slice(0,45).forEach(e=>{let p=pos(e.row,e.col);falls.push({x:p.x,y:p.y,ci:e.color,vx:(Math.random()-.5)*75,vy:-20-Math.random()*45,rot:0,vr:(Math.random()-.5)*5})});
   let gain=cl.length*100+loose.length*175;score+=gain;scoreEl.textContent=String(score).padStart(6,"0");text(loose.length?`DROP! +${gain}`:`+${gain}`,pp.x,pp.y,true);if(loose.length)sfx.drop()
 }
 shots++;current=next;next=randColor();
 let every=level===1?7:5;if(shots%every===0){ceiling+=level===1?11:14;sfx.beam();shake=4;text("RUMBLE!",240,105,true)}
 check()
}
function check(){
 if(grid.length===0){
   clearPending=true;
   clearTimer=0;
   return
 }
 for(let e of grid){
   let p=pos(e.row,e.col);
   if(p.y+r>shooter.y-95){finish(false);return}
 }
}
function finish(win){running=false;transition=false;win?sfx.clear():sfx.lose();overlay.classList.remove("hidden");ot.textContent=win?"Two-Level Slice Complete!":"Game Over";op.textContent=win?`Score ${String(score).padStart(6,"0")} — both vertical-slice levels cleared.`:`The eggs reached Tweety. Score ${String(score).padStart(6,"0")}.`;startBtn.textContent="Play Again"}
function shoot(){
 if(!running||shot||transition||clearPending)return;A();let sy=shooter.y-37,dx=aim.x-shooter.x,dy=aim.y-sy;if(dy>-55)dy=-55;let l=Math.hypot(dx,dy),speed=690;
 shot={x:shooter.x,y:sy,vx:dx/l*speed,vy:dy/l*speed,color:current,age:0,scale:.72};recoil=1;shake=2;sfx.launch()
}
function update(dt){
 recoil=Math.max(0,recoil-dt*6);shake=Math.max(0,shake-dt*18);impactPulse=Math.max(0,impactPulse-dt);
 if(clearPending && !transition){
   // Wait until all visible falling eggs/particles have finished, then hold briefly before changing level.
   if(grid.length===0 && falls.length===0 && particles.length===0 && !shot){
     clearTimer+=dt;
     if(clearTimer>=1.1){
       transition=true;running=false;clearPending=false;sfx.clear();
       setTimeout(()=>{if(level===1){level=2;buildLevel(2);text("LEVEL 2",240,330,true)}else finish(true)},500)
     }
   }else{
     clearTimer=0;
   }
 }
 grid.forEach(e=>e.w=Math.max(0,(e.w||0)-dt*5));
 if(shot){
   shot.age+=dt;shot.scale=Math.min(1,shot.scale+dt*5);
   // strong initial impulse, then subtle air drag: fast and weighty without ruining aim
   let drag=Math.pow(.988,dt*60);shot.vx*=drag;shot.vy*=drag;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;
   if(shot.x-r<wall){shot.x=wall+r;shot.vx=Math.abs(shot.vx)*.94;shake=2;sfx.wall()}
   if(shot.x+r>W-wall){shot.x=W-wall-r;shot.vx=-Math.abs(shot.vx)*.94;shake=2;sfx.wall()}
   let hit=shot.y-r<67+ceiling;
   if(!hit)for(let e of grid){let p=pos(e.row,e.col);if(Math.hypot(p.x-shot.x,p.y-shot.y)<r*1.76){hit=true;break}}
   if(hit)snap()
 }
 particles.forEach(p=>{p.t-=dt;p.vy+=360*dt;p.x+=p.vx*dt;p.y+=p.vy*dt});particles=particles.filter(p=>p.t>0);
 falls.forEach(f=>{f.vy+=650*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.rot+=f.vr*dt;if(f.y>H-55&&f.vy>0){f.y=H-55;f.vy*=-.25;f.vx*=.7}});falls=falls.filter(f=>f.y<H+70);
 texts.forEach(t=>{t.life-=dt;t.y-=28*dt});texts=texts.filter(t=>t.life>0)
}
function draw(){
 x.save();let sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;x.translate(sx,sy);bg();
 grid.forEach(e=>{let p=pos(e.row,e.col),w=e.w||0;egg(p.x,p.y,e.color,1+w*.12,Math.sin(performance.now()/55+e.col)*w*.08)});
 falls.forEach(f=>egg(f.x,f.y,f.ci,1,f.rot));
 particles.forEach(p=>{x.globalAlpha=Math.min(1,p.t*2);x.fillStyle=spots[p.ci];x.beginPath();x.arc(p.x,p.y,p.size,0,7);x.fill();x.globalAlpha=1});
 aimLine();sling();cat();launcher();if(shot)egg(shot.x,shot.y,shot.color,shot.scale,Math.atan2(shot.vy,shot.vx)+Math.PI/2);
 texts.forEach(t=>{x.globalAlpha=Math.min(1,t.life*2);x.textAlign="center";x.font=`900 ${t.big?25:18}px system-ui`;x.lineWidth=5;x.strokeStyle="#241632";x.strokeText(t.t,t.x,t.y);x.fillStyle="#ffe276";x.fillText(t.t,t.x,t.y);x.globalAlpha=1});
 x.restore()
}
function loop(now){let dt=Math.min(.028,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop)}
function pointer(e){let q=c.getBoundingClientRect();return{x:(e.clientX-q.left)/q.width*W,y:(e.clientY-q.top)/q.height*H}}
c.addEventListener("pointerdown",e=>{e.preventDefault();aim=pointer(e);A()});
c.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")aim=pointer(e)});
c.addEventListener("pointerup",e=>{aim=pointer(e);shoot()});
function start(){A();reset();overlay.classList.add("hidden");startBtn.textContent="Start Game"}
startBtn.onclick=start;restartBtn.onclick=start;soundBtn.onclick=()=>{sound=!sound;soundBtn.textContent=sound?"Sound On":"Sound Off";if(sound)A()};
reset();running=false;requestAnimationFrame(loop);
})();