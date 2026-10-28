// Run: node tests/cross.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'cube-illustrator.html'),'utf8'),script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>{assert(script.includes(a)&&script.includes(b));return script.slice(script.indexOf(a),script.indexOf(b));};
const code=part('const RAD=','/* ========== 상태')+part('function mkState(','let state=')+part('const applyM=','const matMul=')+
  part('function rotM(','const CM=')+part('const dot3=','/* 화면 기준 적용')+part('const AX=','const GAP=')+
  part('function parseAlg(','/* ========== 도해 SVG')+part('const CROSS_MOVES=','const CROSS_KEY=');
const c=vm.runInNewContext(code+';({crossBuild,crossGenerate,crossStep,crossSolution,crossSolved,CROSS_GOAL,CROSS_CELLS,CROSS_EDGES,CROSS_MOVES,CROSS_BASES,applyMoveTo,invMoves,FKEYS,parseAlg,lab})');
assert.equal(c.CROSS_EDGES.length,12);assert(c.CROSS_EDGES.every(e=>e.cells.length===2));assert.equal(c.CROSS_CELLS.length,24);
console.time('Cross BFS');const t=c.crossBuild();console.timeEnd('Cross BFS');assert.equal(t.layers.flat().length,12*11*10*9*16);
assert.equal(t.dist[c.CROSS_GOAL],0);assert.equal(t.layers.length,9);
for(const turn of t.turns)assert.equal(new Set(turn).size,24);
const encoded=st=>c.CROSS_CELLS.filter(([f])=>f==='D').reduce((n,[f,r,col],i)=>{
  const target=c.CROSS_BASES.W[f][r][col]+':'+r+':'+col;
  const dest=c.CROSS_CELLS.findIndex(([g,y,x])=>st[g][y][x]===target);assert(dest>=0);return n+dest*24**i;
},0);
// Distinct labels on the four primary stickers independently track the real move engine.
const labels=c.crossSolved('W');c.CROSS_CELLS.filter(([f])=>f==='D').forEach(([f,r,col])=>labels[f][r][col]='W:'+r+':'+col);
let cases=0;
for(let depth=1;depth<=7;depth++)for(let sample=0;sample<12;sample++){
  const q=c.crossGenerate(depth);assert.equal(q.solution.length,depth);assert.equal(q.easy.length,depth);assert.equal(t.dist[q.code],depth);
  assert(q.normal.length>=19);assert.deepEqual(q.easy,c.invMoves(q.solution));
  for(const moves of [q.easy,q.normal]){
    assert.equal(encoded(moves.reduce(c.applyMoveTo,labels)),q.code);
    for(const color of ['W','Y','R','O','G','B']){
      const base=c.crossSolved(color),st=moves.reduce(c.applyMoveTo,base);
      assert.deepEqual(q.solution.reduce(c.applyMoveTo,st),base);assert.equal(base.D[1][1],color);
      assert.equal(c.FKEYS.flatMap(f=>base[f].flat()).filter(v=>v!=='X').length,9);
      assert.equal(c.FKEYS.flatMap(f=>st[f].flat()).filter(v=>v!=='X').length,9);cases++;
    }
  }
}
// Every edge has unit cost: this + the path to zero proves the distances are minimal.
for(const layer of t.layers)for(const code of layer){
  let descending=code===c.CROSS_GOAL;
  for(let m=0;m<18;m++){
    const next=c.crossStep(code,m);assert(Math.abs(t.dist[code]-t.dist[next])<=1);
    if(t.dist[next]===t.dist[code]-1)descending=true;
  }assert(descending);
}
assert.equal(c.crossGenerate(1,t.layers[1][0]).solution.length,1);
console.log(`Cross: all ${t.layers.flat().length} distances/edges, six colors x seven depths, ${cases} full-cube scramble/solution checks; easy and normal show the same cross`);

