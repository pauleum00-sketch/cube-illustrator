// Run: node tests/cross.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'cube-illustrator.html'),'utf8'),script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>{assert(script.includes(a)&&script.includes(b));return script.slice(script.indexOf(a),script.indexOf(b));};
const code=part('const RAD=','/* ========== 상태')+part('function mkState(','let state=')+part('const applyM=','const matMul=')+
  part('function rotM(','const CM=')+part('const dot3=','/* 화면 기준 적용')+part('const AX=','const GAP=')+
  part('function parseAlg(','/* ========== 도해 SVG')+part('const CROSS_MOVES=','const CROSS_KEY=');
const c=vm.runInNewContext(code+';({crossBuild,crossGenerate,crossStep,crossSolution,crossSolved,crossDisplayMoves,crossDisplaySolved,CROSS_CENTER,CROSS_FACES,CROSS_GOAL,CROSS_CELLS,CROSS_EDGES,CROSS_MOVES,CROSS_BASES,applyMoveTo,invMoves,FKEYS,parseAlg,lab,mkState})');
assert.equal(c.CROSS_EDGES.length,12);assert(c.CROSS_EDGES.every(e=>e.cells.length===2));assert.equal(c.CROSS_CELLS.length,24);
console.time('Cross BFS');const t=c.crossBuild();console.timeEnd('Cross BFS');assert.equal(t.layers.flat().length,12*11*10*9*16);
assert.equal(t.dist[c.CROSS_GOAL],0);assert.equal(t.layers.length,9);
for(const turn of t.turns)assert.equal(new Set(turn).size,24);
const standard=c.parseAlg('x2 y').moves.reduce(c.applyMoveTo,c.mkState());
assert.equal(standard.U[1][1],'W');assert.equal(standard.F[1][1],'G');assert.equal(standard.R[1][1],'R');
for(const f of c.FKEYS)assert.equal(standard[f][1][1],c.CROSS_CENTER[f]);
const rotations=[{st:c.mkState(),moves:[]}],seen=new Set();
for(let i=0;i<rotations.length;i++)for(const letter of ['x','y','z']){
  const mv={letter},st=c.applyMoveTo(rotations[i].st,mv),key=c.FKEYS.map(f=>st[f][1][1]).join('');
  if(!seen.has(key)){seen.add(key);rotations.push({st,moves:[...rotations[i].moves,mv]});}
}
const displayRotations={};
for(const color of ['W','Y','R','O','G','B']){
  const rotation=rotations.find(r=>{const st=r.moves.reduce(c.applyMoveTo,c.CROSS_BASES[color]);return c.FKEYS.every(f=>st[f][1][1]===c.CROSS_CENTER[f]);});
  assert(rotation);displayRotations[color]=rotation.moves;
}
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
      const displayBase=c.crossDisplaySolved(color),displayMoves=c.crossDisplayMoves(moves,color),displaySolution=c.crossDisplayMoves(q.solution,color);
      const displayState=displayMoves.reduce(c.applyMoveTo,displayBase);
      assert.deepEqual(displayRotations[color].reduce(c.applyMoveTo,st),displayState,'Physical rotation preserves the case and its minimum distance');
      assert.deepEqual(displaySolution.reduce(c.applyMoveTo,displayState),displayBase);
      assert.equal(displayBase[c.CROSS_FACES[color]][1][1],color);
      for(let i=0;i<moves.length;i++){assert.equal(displayMoves[i].prime,moves[i].prime);assert.equal(displayMoves[i].dbl,moves[i].dbl);}
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

