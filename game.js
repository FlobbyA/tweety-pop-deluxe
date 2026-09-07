(() => {
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const W = canvas.width, H = canvas.height;
const wall = 42;
const topHud = 54;
const shooterY = H - 72;
const r = 18;
const cellW = r * 2;
const rowH = 31;
const cols = 10;
const colors = ['#df3b36','#315bd8','#2eb469','#f2d83d','#b24ad5'];
const spot = ['#ffd9d5','#d9e0ff','#d7f6dd','#fff6bb','#efd5f7'];

let grid, projectile, aimX, score, running, gameOver, ceilingOffset, shots, targetToWin;

function reset(){
  grid = [];
  score = 0; running = false; gameOver = false;
  ceilingOffset = 0; shots = 0; targetToWin = 28;
  projectile = null; aimX = W/2;
  seedGrid();
  updateScore();
  draw();
}

function seedGrid(){
  const rows = 6;
  for(let row=0; row<rows; row++){
    for(let col=0; col<cols; col++){
      if(Math.random() < 0.72){
        const idx = Math.floor(Math.random()*colors.length);
        grid.push({row,col,color:idx});
      }
    }
  }
}

function gridPos(row,col){
  const stagger = row % 2 ? r : 0;
  return {
    x: wall + r + col*cellW + stagger,
    y: topHud + r + row*rowH + ceilingOffset
  };
}

function drawBackground(){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#32284c');
  g.addColorStop(.55,'#241e3a');
  g.addColorStop(1,'#181424');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

  // stone side columns
  for(const x of [0,W-wall]){
    ctx.fillStyle='#7f6d56';ctx.fillRect(x,0,wall,H);
    for(let y=0;y<H;y+=54){
      ctx.fillStyle = (Math.floor(y/54)%2)?'#9b8567':'#8a755b';
      ctx.fillRect(x+4,y+4,wall-8,46);
      ctx.strokeStyle='#4b3e31';ctx.lineWidth=3;ctx.strokeRect(x+4,y+4,wall-8,46);
    }
  }
  // descending top beam
  const beamY = topHud - 12 + ceilingOffset;
  ctx.fillStyle='#8e795d';ctx.fillRect(wall,beamY,W-wall*2,30);
  for(let x=wall;x<W-wall;x+=54){
    ctx.fillStyle=(Math.floor(x/54)%2)?'#a88f69':'#927b5d';
    ctx.fillRect(x+3,beamY+3,48,24);
  }

  // floor ledge
  ctx.fillStyle='#6e5b49';ctx.fillRect(wall,H-42,W-wall*2,42);
}

function drawEgg(x,y,colorIndex,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
  ctx.fillStyle=colors[colorIndex];
  ctx.beginPath();ctx.ellipse(0,0,r*0.95,r*1.08,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=spot[colorIndex];
  const pts=[[-7,-5],[7,-8],[2,6],[-9,8],[10,7]];
  for(const [px,py] of pts){
    ctx.beginPath();ctx.arc(px,py,4.2,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawTweetyBack(){
  // placeholder silhouette only; final artwork will replace this.
  const x=W/2,y=H-30;
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#0b0b0e';
  ctx.beginPath();ctx.ellipse(0,-26,35,42,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-24,-55);ctx.lineTo(-11,-80);ctx.lineTo(-2,-57);ctx.fill();
  ctx.beginPath();ctx.moveTo(24,-55);ctx.lineTo(11,-80);ctx.lineTo(2,-57);ctx.fill();
  ctx.strokeStyle='#111';ctx.lineWidth=10;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(28,-17);ctx.quadraticCurveTo(48,-8,43,13);ctx.stroke();
  ctx.restore();
}

function drawSlingshot(){
  const x=W/2,y=shooterY+24;
  ctx.strokeStyle='#7b271d';ctx.lineWidth=12;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x-26,y+20);ctx.lineTo(x-12,y-18);ctx.moveTo(x+26,y+20);ctx.lineTo(x+12,y-18);ctx.stroke();
  ctx.strokeStyle='#34130f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-12,y-18);ctx.lineTo(x+12,y-18);ctx.stroke();
}

function drawAim(){
  if(!running || projectile) return;
  const sx=W/2, sy=shooterY;
  let dx=aimX-sx, dy=-180;
  const len=Math.hypot(dx,dy);dx/=len;dy/=len;
  ctx.strokeStyle='#ffffff66';ctx.lineWidth=2;ctx.setLineDash([8,8]);
  ctx.beginPath();ctx.moveTo(sx,sy);
  for(let d=25;d<180;d+=26){ctx.lineTo(sx+dx*d,sy+dy*d)}
  ctx.stroke();ctx.setLineDash([]);
}

function draw(){
  drawBackground();
  for(const e of grid){
    const p=gridPos(e.row,e.col);drawEgg(p.x,p.y,e.color);
  }
  drawAim();
  drawSlingshot();
  drawTweetyBack();
  if(projectile) drawEgg(projectile.x,projectile.y,projectile.color);
}

function nearestCell(x,y){
  const approxRow=Math.max(0,Math.round((y-topHud-r-ceilingOffset)/rowH));
  const stagger=approxRow%2?r:0;
  const approxCol=Math.max(0,Math.min(cols-1,Math.round((x-wall-r-stagger)/cellW)));
  return {row:approxRow,col:approxCol};
}

function occupied(row,col){return grid.some(e=>e.row===row&&e.col===col)}
function neighbors(row,col){
  const odd=row%2;
  const ds=odd
    ? [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]]
    : [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]];
  return ds.map(([dr,dc])=>({row:row+dr,col:col+dc}))
    .filter(p=>p.row>=0&&p.col>=0&&p.col<cols);
}
function clusterFrom(start){
  const startEgg=grid.find(e=>e.row===start.row&&e.col===start.col);
  if(!startEgg) return [];
  const out=[], stack=[start], seen=new Set();
  while(stack.length){
    const cur=stack.pop(), key=cur.row+','+cur.col;
    if(seen.has(key))continue;seen.add(key);
    const egg=grid.find(e=>e.row===cur.row&&e.col===cur.col);
    if(!egg||egg.color!==startEgg.color)continue;
    out.push(egg);
    for(const n of neighbors(cur.row,cur.col)) stack.push(n);
  }
  return out;
}
function removeFloating(){
  const connected=new Set(), stack=[];
  for(const e of grid) if(e.row===0) stack.push({row:e.row,col:e.col});
  while(stack.length){
    const cur=stack.pop(),key=cur.row+','+cur.col;
    if(connected.has(key))continue;
    if(!occupied(cur.row,cur.col))continue;
    connected.add(key);
    for(const n of neighbors(cur.row,cur.col)) stack.push(n);
  }
  const before=grid.length;
  grid=grid.filter(e=>connected.has(e.row+','+e.col));
  return before-grid.length;
}

function snapProjectile(){
  const cell=nearestCell(projectile.x, projectile.y);
  let c={...cell};
  if(occupied(c.row,c.col)){
    const options=neighbors(c.row,c.col).filter(p=>!occupied(p.row,p.col));
    if(options.length){
      options.sort((a,b)=>{
        const pa=gridPos(a.row,a.col),pb=gridPos(b.row,b.col);
        return Math.hypot(pa.x-projectile.x,pa.y-projectile.y)-Math.hypot(pb.x-projectile.x,pb.y-projectile.y);
      });
      c=options[0];
    } else c.row++;
  }
  grid.push({row:c.row,col:c.col,color:projectile.color});
  projectile=null;
  const cl=clusterFrom(c);
  if(cl.length>=3){
    const keys=new Set(cl.map(e=>e.row+','+e.col));
    grid=grid.filter(e=>!keys.has(e.row+','+e.col));
    const floating=removeFloating();
    const gain=cl.length*100+floating*150;
    score+=gain; updateScore();
  }
  shots++;
  if(shots%6===0) ceilingOffset += 10;
  checkState();
}

function checkState(){
  if(score>=targetToWin*100){
    endGame(true);return;
  }
  let danger=false;
  for(const e of grid){
    const p=gridPos(e.row,e.col);
    if(p.y+r>shooterY-48){danger=true;break;}
  }
  if(danger) endGame(false);
}

function endGame(win){
  running=false; gameOver=!win;
  overlay.classList.remove('hidden');
  overlayTitle.textContent=win?'Level Complete!':'Game Over';
  overlayText.textContent=win
    ? `Score ${score.toString().padStart(6,'0')} — prototype level cleared.`
    : `The eggs reached Tweety. Score ${score.toString().padStart(6,'0')}.`;
  startBtn.textContent='Play Again';
}

function shoot(targetX){
  if(!running||projectile) return;
  const sx=W/2, sy=shooterY;
  const tx=Math.max(wall+r,Math.min(W-wall-r,targetX));
  let dx=tx-sx, dy=-220;
  const len=Math.hypot(dx,dy);
  const speed=7.5;
  projectile={x:sx,y:sy,vx:dx/len*speed,vy:dy/len*speed,color:Math.floor(Math.random()*colors.length)};
}

function tick(){
  if(projectile){
    projectile.x+=projectile.vx; projectile.y+=projectile.vy;
    if(projectile.x-r<wall){projectile.x=wall+r;projectile.vx*=-1}
    if(projectile.x+r>W-wall){projectile.x=W-wall-r;projectile.vx*=-1}
    let hit=projectile.y-r<topHud+ceilingOffset;
    if(!hit){
      for(const e of grid){
        const p=gridPos(e.row,e.col);
        if(Math.hypot(p.x-projectile.x,p.y-projectile.y)<r*1.8){hit=true;break}
      }
    }
    if(hit) snapProjectile();
  }
  draw(); requestAnimationFrame(tick);
}

function updateScore(){scoreEl.textContent=score.toString().padStart(6,'0')}

function canvasX(ev){
  const rect=canvas.getBoundingClientRect();
  const p=ev.touches?ev.touches[0]:ev;
  return (p.clientX-rect.left)/rect.width*W;
}
canvas.addEventListener('pointermove',e=>{aimX=canvasX(e)});
canvas.addEventListener('pointerdown',e=>{aimX=canvasX(e)});
canvas.addEventListener('pointerup',e=>{aimX=canvasX(e);shoot(aimX)});
canvas.addEventListener('touchmove',e=>{e.preventDefault();aimX=canvasX(e)},{passive:false});

function start(){
  reset();running=true;overlay.classList.add('hidden');
}
startBtn.addEventListener('click',start);
restartBtn.addEventListener('click',start);

reset();tick();
})();