// Run: node tests/player-view.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const elements=new Map(),listeners={};
function element(id){
  if(!elements.has(id)){
    const classes=new Set(),captures=new Set(),events={};
    elements.set(id,{hidden:false,parentElement:{},classes,captures,events,
      classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle:(k,on)=>on?classes.add(k):classes.delete(k)},
      addEventListener:(k,fn)=>events[k]=fn,setPointerCapture:k=>captures.add(k),
      hasPointerCapture:k=>captures.has(k),releasePointerCapture:k=>captures.delete(k)});
  }return elements.get(id);
}
const ctx={document:{getElementById:element,querySelectorAll:()=>[],activeElement:{tagName:'BODY'}},
  addEventListener:(k,fn)=>listeners[k]=fn,sharedEntry:()=>null,fingerEditorUI:()=>{},algHTML:x=>x};
vm.createContext(ctx);
vm.runInContext(part('const RAD=','const COLORS=')+part('const applyM=','/* ========== 무브 엔진:')+
  part('/* ========== 공식 재생 플레이어 ========== */','\nrenderProfiles();')+
  '\nplayT=view=>JSON.stringify(view);playSVG=(st,view,T,geo,ang,two)=>JSON.stringify({st,view,geo,ang,two});plChips=()=>{};'+
  '\nglobalThis.player=()=>PL;globalThis.drag=()=>plViewDrag;globalThis.eye=PLEYE;',ctx);
const stage=element('plStage'),reset=element('plResetView');
function pointer(type,id=1,x=100,y=100,button=0){
  const e={pointerId:id,clientX:x,clientY:y,button,prevented:false,preventDefault(){this.prevented=true;}};
  stage.events[type](e);return e;
}
const stringify=x=>JSON.stringify(x);
const start=(key,view=ctx.eye)=>ctx.startPlayer(key,'R U',[{letter:'R'},{letter:'U'}],{cube:'case'},view,'','',key,key.startsWith('oll2')||key.startsWith('pbl2'));
for(const key of ['pll:H','oll3:1','oll2:L','pbl2:Adj']){
  start(key);const p=ctx.player();assert(p.canOrbit);assert(!reset.hidden);assert(stage.classes.has('orbit'));
  p.playing=true;p.i=1;p.k=.43;const geo={ax:'y'};ctx.plRender(geo,.6);
  const snapshot=stringify([p.st,p.base,p.moves,p.i,p.k,p.gen,p.playing,p.geo,p.ang]);
  assert(!pointer('pointerdown',2,100,100,2).prevented);assert.equal(ctx.drag(),null);
  assert(pointer('pointerdown').prevented);assert(stage.captures.has(1));
  pointer('pointerdown',2);pointer('pointermove',2,180,150);assert.equal(stringify(p.view),stringify(ctx.eye));
  pointer('pointermove',1,180,150);assert.notEqual(stringify(p.view),stringify(ctx.eye));
  assert.equal(stringify([p.st,p.base,p.moves,p.i,p.k,p.gen,p.playing,p.geo,p.ang]),snapshot);
  pointer('pointerup',2);assert(ctx.drag());pointer('pointercancel');assert.equal(ctx.drag(),null);
  assert(!stage.classes.has('dragging'));assert.equal(stage.captures.size,0);
  reset.onclick();assert.equal(stringify(p.view),stringify(ctx.eye));
  assert.equal(stringify([p.st,p.base,p.moves,p.i,p.k,p.gen,p.playing,p.geo,p.ang]),snapshot);
  pointer('pointerdown');pointer('pointermove',1,140,130);reset.onclick();assert.equal(ctx.drag(),null);
  pointer('pointerdown');pointer('lostpointercapture');assert.equal(ctx.drag(),null);
  pointer('pointerdown');pointer('pointermove',1,130,170);ctx.closePlayer();assert.equal(ctx.player(),null);assert.equal(ctx.drag(),null);
  pointer('pointermove',1,200,200);start(key);assert.equal(stringify(ctx.player().view),stringify(ctx.eye));
}
for(const key of ['f2l-fr:1','f2l-fl:1']){
  const view=key.includes('fl')?ctx.rotM('y',Math.PI/2):ctx.eye;start(key,view);
  assert(!ctx.player().canOrbit);assert(reset.hidden);assert(!stage.classes.has('orbit'));
  assert(!pointer('pointerdown').prevented);pointer('pointermove',1,200,180);reset.onclick();
  assert.equal(stringify(ctx.player().view),stringify(view));
}
start('pll:H');pointer('pointerdown');pointer('pointermove',1,200,160);start('oll3:1');
assert.equal(ctx.drag(),null);assert.equal(stringify(ctx.player().view),stringify(ctx.eye));
for(let i=0;i<100;i++){pointer('pointerdown');pointer('pointermove',1,170+i,150-i);pointer('pointerup');}
for(const row of ctx.player().view)assert(Math.abs(Math.hypot(...row)-1)<1e-12);
assert.match(html,/id="plResetView"[^>]*aria-label="기본 각도로 되돌리기"/);
assert.match(html,/\.pstage\.orbit\{[^}]*touch-action:none/);
vm.runInContext(part('function playT(','function playSVG('),ctx);
const math=vm.runInContext('({applyM,matMul})',ctx),corners=[];
for(const x of [-1.5,1.5])for(const y of [-1.5,1.5])for(const z of [-1.5,1.5])corners.push([x,y,z]);
const upsideDown=math.matMul(ctx.rotM('x',7*Math.PI/4),ctx.rotM('y',Math.PI/9)),T=ctx.playT(upsideDown,true);
for(const ax of ['x','y','z'])for(let a=0;a<360;a+=5)for(const q of corners){
  const p=T(math.applyM(upsideDown,math.applyM(ctx.rotM(ax,a*Math.PI/180),q)));
  assert(p[0]>=0&&p[0]<=420&&p[1]>=0&&p[1]<=380,'No clipping while orbiting upside down');
}
const legacy=corners.concat(['x','y','z'].flatMap(ax=>corners.map(q=>math.applyM(ctx.rotM(ax,Math.PI/4),q))));
const oldFit=ctx.fit(legacy,420,380,8),f2lFit=ctx.playT(ctx.eye);
for(const q of corners)assert.deepEqual(f2lFit(q),oldFit(q));
console.log('Player view: four topics, pose preservation, angle-only reset, pointer lifecycle, stable matrices, upside-down frame; F2L view/size unchanged');
