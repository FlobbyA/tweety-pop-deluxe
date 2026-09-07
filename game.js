(() => {
"use strict";
const c=document.getElementById("game"),x=c.getContext("2d");
const scoreEl=document.getElementById("score"),levelEl=document.getElementById("level");
const overlay=document.getElementById("overlay"),ot=document.getElementById("overlayTitle"),op=document.getElementById("overlayText");
const startBtn=document.getElementById("startBtn"),restartBtn=document.getElementById("restartBtn"),soundBtn=document.getElementById("soundBtn");
const W=480,H=760,wall=43,r=18,rowH=31,cols=10,shooter={x:240,y:665};
const colors=["#e9413c","#3473df","#2fbd75","#f1d33c","#aa4bd2"],spots=["#ffe0dc","#e1e9ff","#dff8e7","#fff7bd","#f0dcf7"];
let grid=[],shot=null,current=0,next=1,aim={x:240,y:300},score=0,level=1,running=false,ceiling=0,shots=0;
let particles=[],falls=[],texts=[],shake=0,recoil=0,impactPulse=0,last=performance.now(),audio=null,sound=true,transition=false;

function A(){if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume()}
function tone(f,d=.07,type="sine",v=.06,slide=0){if(!sound||!audio)return;let o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(35,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+d)}
function noise(d=.08,v=.035){if(!sound||!audio)return;let n=Math.floor(audio.sampleRate*d),b=audio.createBuffer(1,n,audio.sampleRate),q=b.getChannelData(0);for(let i=0;i<n;i++)q[i]=(Math.random()*2-1)*(1-i/n);let s=audio.createBufferSource(),g=audio.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(audio.destination);s.start()}
const sfx={
 launch(){tone(125,.11,"triangle",.12,180);tone(65,.09,"sine",.08,-15);noise(.045,.025)},
 wall(){tone(260,.045,"square",.035,-70)},
 hit(){tone(105,.07,"triangle",.07,-25);noise(.04,.025)},
 pop(n=3){for(let i=0;i<Math.min(n,6);i++)setTimeout(()=>tone(430+i*55,.055,"sine",.045,120),i*18)},
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
 grid=[];ceiling=0;shots=0;particles=[];falls=[];texts=[];shot=null;transition=false;
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
 let dx=aim.x-shooter.x,dy=aim.y-(shooter.y-37);if(dy>-40)dy=-40;let len=Math.hypot(dx,dy);dx/=len;dy/=len;
 x.save();x.strokeStyle="#fff7";x.lineWidth=2;x.setLineDash([5,9]);x.beginPath();x.moveTo(shooter.x,shooter.y-58);for(let d=30;d<210;d+=22)x.lineTo(shooter.x+dx*d,shooter.y-37+dy*d);x.stroke();x.restore()
}
function puff(px,py,ci,count=10){for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=80+Math.random()*150;particles.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,t:.45+Math.random()*.25,ci,size:2+Math.random()*5})}}
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
   let keys=new Set(cl.map(e=>e.row+","+e.col));cl.forEach(e=>{let p=pos(e.row,e.col);puff(p.x,p.y,e.color,12)});grid=grid.filter(e=>!keys.has(e.row+","+e.col));sfx.pop(cl.length);
   let loose=floating();loose.forEach(e=>{let p=pos(e.row,e.col);falls.push({x:p.x,y:p.y,ci:e.color,vx:(Math.random()-.5)*80,vy:-20-Math.random()*50,rot:0,vr:(Math.random()-.5)*6})});
   let gain=cl.length*100+loose.length*175;score+=gain;scoreEl.textContent=String(score).padStart(6,"0");text(loose.length?`DROP! +${gain}`:`+${gain}`,pp.x,pp.y,true);if(loose.length)sfx.drop()
 }
 shots++;current=next;next=randColor();
 let every=level===1?7:5;if(shots%every===0){ceiling+=level===1?11:14;sfx.beam();shake=4;text("RUMBLE!",240,105,true)}
 check()
}
function check(){
 if(grid.length===0||score>=(level===1?3200:7600)){if(transition)return;transition=true;running=false;sfx.clear();setTimeout(()=>{if(level===1){level=2;buildLevel(2);text("LEVEL 2",240,330,true)}else finish(true)},850);return}
 for(let e of grid){let p=pos(e.row,e.col);if(p.y+r>shooter.y-95){finish(false);return}}
}
function finish(win){running=false;transition=false;win?sfx.clear():sfx.lose();overlay.classList.remove("hidden");ot.textContent=win?"Two-Level Slice Complete!":"Game Over";op.textContent=win?`Score ${String(score).padStart(6,"0")} — both vertical-slice levels cleared.`:`The eggs reached Tweety. Score ${String(score).padStart(6,"0")}.`;startBtn.textContent="Play Again"}
function shoot(){
 if(!running||shot||transition)return;A();let sy=shooter.y-37,dx=aim.x-shooter.x,dy=aim.y-sy;if(dy>-55)dy=-55;let l=Math.hypot(dx,dy),speed=690;
 shot={x:shooter.x,y:sy,vx:dx/l*speed,vy:dy/l*speed,color:current,age:0,scale:.72};recoil=1;shake=2;sfx.launch()
}
function update(dt){
 recoil=Math.max(0,recoil-dt*6);shake=Math.max(0,shake-dt*18);impactPulse=Math.max(0,impactPulse-dt);
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
function loop(now){let dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop)}
function pointer(e){let q=c.getBoundingClientRect();return{x:(e.clientX-q.left)/q.width*W,y:(e.clientY-q.top)/q.height*H}}
c.addEventListener("pointerdown",e=>{e.preventDefault();aim=pointer(e);A()});
c.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")aim=pointer(e)});
c.addEventListener("pointerup",e=>{aim=pointer(e);shoot()});
function start(){A();reset();overlay.classList.add("hidden");startBtn.textContent="Start Game"}
startBtn.onclick=start;restartBtn.onclick=start;soundBtn.onclick=()=>{sound=!sound;soundBtn.textContent=sound?"Sound On":"Sound Off";if(sound)A()};
reset();running=false;requestAnimationFrame(loop);
})();