const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(file){

const nodes=new Map(),timers=new Map();let timerID=0;
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??(()=>{})});
function el(id){if(!nodes.has(id))nodes.set(id,{textContent:'',hidden:false,classList:{add(){},remove(){},toggle(){}},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:480,height:760}),setPointerCapture(){}});return nodes.get(id)}
const sandbox={console,performance:{now:()=>0},Math,document:{hidden:false,getElementById:el,addEventListener(){}},requestAnimationFrame(){},setTimeout(fn){timers.set(++timerID,fn);return timerID},clearTimeout(id){timers.delete(id)},window:{TweetyAssets:{images:{},ready:Promise.resolve(),failed:[],manifest:{images:{}},url:x=>x,audioUnlock(){},stopEffects(){},voice(){return true},effect(role,{fallback}={}){return true},setMusic(){},setScene(){},stopCues(){},cue(){return {then:fn=>fn()}},setMuted(){},play:()=>true,speakHelper(){}}}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('config/levels-3.1.0.js','utf8'),sandbox);
let source=fs.readFileSync(file,'utf8');source=source.replace(/\}\)\(\);\s*$/,`window.test={run:code=>eval(code),update,draw,check,reset,buildLevel,shoot,snap,cluster,floating,aimLine,start,prepareGameplay,continueLevel,helperSafety};})();`);vm.runInContext(source,sandbox);

return sandbox.window.test;}
const results=[];
for(const hz of [60,90,120])for(const [name,aim] of [['direct',{x:240,y:200}],['angled',{x:350,y:200}],['one-wall',{x:760,y:150}]]){
 const pair=[];
 for(const file of ['game-3.1.3.js','game-3.1.4.js']){
 const t=load(file),r=s=>t.run(s);r('A=()=>{};sound=false;reset();LEVELS[0].pressure=0;LEVELS[0].stompEvery=999;LEVELS[0].hatchChance=0;grid=[];for(let row=0;row<=6;row++)for(let col=0;col<10;col++)grid.push({row,col,color:1,w:0});current=0;next=0;flyerTimer=999;last=0');r('aim='+JSON.stringify(aim));t.shoot();let frames=0;
 while(r('shot!==null')&&frames<600){frames++;r(`loop(${frames*1000/hz})`)}
 assert(frames<600);const attached=JSON.parse(r('JSON.stringify(grid.filter(e=>e.color===0).map(e=>({row:e.row,col:e.col})))'));
 pair.push({file,seconds:frames/hz,attached});
 }
 assert.deepEqual(pair[0].attached,pair[1].attached,name+' target changed');assert(pair[1].seconds<pair[0].seconds);results.push({hz,name,before:pair[0],after:pair[1]});
}
fs.writeFileSync('docs/motion-ab-314.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
