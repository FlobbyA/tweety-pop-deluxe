const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(file){

const nodes=new Map(),timers=new Map();let timerID=0;
const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??(()=>{})});
function el(id){if(!nodes.has(id))nodes.set(id,{textContent:'',hidden:false,classList:{add(){},remove(){},toggle(){}},addEventListener(){},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:480,height:760}),setPointerCapture(){}});return nodes.get(id)}
const sandbox={console,performance:{now:()=>0},Math,document:{hidden:false,getElementById:el,addEventListener(){}},requestAnimationFrame(){},setTimeout(fn){timers.set(++timerID,fn);return timerID},clearTimeout(id){timers.delete(id)},window:{TweetyAssets:{images:{},ready:Promise.resolve(),failed:[],manifest:{images:{}},url:x=>x,audioUnlock(){},stopEffects(){},voice(){return true},effect(role,{fallback}={}){return true},setMusic(){},setScene(){},stopCues(){},cue(){return {then:fn=>fn()}},setMuted(){},play:()=>true,speakHelper(){}}}};vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('config/levels-3.1.0.js','utf8'),sandbox);
let source=fs.readFileSync(file,'utf8');source=source.replace(/\}\)\(\);\s*$/,`window.test={run:code=>eval(code),update,draw,check,reset,buildLevel,shoot,snap,cluster,floating,aimLine,start,prepareGameplay,continueLevel,helperSafety};})();`);vm.runInContext(source,sandbox);

return sandbox.window.test;}
const rows=[];for(const file of ['game-3.1.4.js','game-3.1.5.js'])for(const milliseconds of [100,200,240]){const t=load(file),r=s=>t.run(s);r('A=()=>{};sound=false;reset();LEVELS[0].pressure=0;grid=[{row:0,col:4,color:1}];flyerTimer=999;aim={x:240,y:100};last=0');t.shoot();for(let frame=1;frame<=milliseconds*.12;frame++)r(`loop(${frame*1000/120})`);const remainder=milliseconds/1000-Math.floor(milliseconds*.12)/120;if(remainder>1e-10)t.update(remainder);rows.push({file,milliseconds,travelPixels:r('628-(shot.renderY??shot.y)')})}fs.writeFileSync('docs/launch-ab-315.json',JSON.stringify(rows,null,2));console.log(rows);