// Run: node tests/double-direction.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8'),script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const code=part('const RAD=','/* ========== 상태')+part('const applyM=','const matMul=')+part('function rotM(','const CM=')+
 part('const dot3=','/* 화면 기준 적용')+part('const AX=','const GAP=')+part('function parseAlg(','/* ========== 도해 SVG');
const c=vm.runInNewContext(code+';({toggleDoubleDirection,fingerSequence,parseAlg,applyMoveTo,moveGeom,FKEYS})');
const base=Object.fromEntries(c.FKEYS.map(f=>[f,Array.from({length:3},(_,r)=>Array.from({length:3},(_,col)=>f+r+col))]));
for(const letter of 'RLUDFBrludfbMESxyz'){
 const text=letter+'2',reversed=c.toggleDoubleDirection(text,0);assert.equal(reversed,letter+"'2");assert.equal(c.toggleDoubleDirection(reversed,0),text);
 const a=c.parseAlg(text).moves[0],b=c.parseAlg(reversed).moves[0];assert.equal(c.moveGeom(a).dir,-c.moveGeom(b).dir);
 assert.equal(JSON.stringify(c.applyMoveTo(base,a)),JSON.stringify(c.applyMoveTo(base,b)));
 assert.equal(c.fingerSequence(text),c.fingerSequence(reversed));
}
const original="  ( R U2 / R' ) // (M2 U2')  ",expected="  ( R U'2 / R' ) // (M2 U2')  ";
assert.equal(c.toggleDoubleDirection(original,1),expected);assert.equal(c.toggleDoubleDirection(expected,1),original);
assert.equal(c.toggleDoubleDirection(original,4),"  ( R U2 / R' ) // (M2 U2)  ");
assert.equal(c.toggleDoubleDirection('R, U U, F2',1),"R, U'2, F2");
assert.equal(c.toggleDoubleDirection("(U' U') / Rw2",0),'(U2) / Rw2');
assert.equal(c.toggleDoubleDirection('R / Rw2 // L',1),"R / Rw'2 // L");
for(const [text,i] of [['R U',0],['U2',1],['U2',-1],['bad U2',0]])assert.equal(c.toggleDoubleDirection(text,i),text);
assert.notEqual(c.fingerSequence('R U R'),c.fingerSequence("R U' R"));
assert.notEqual(c.fingerSequence('U U R'),c.fingerSequence('U / U R'));
console.log('Double direction: 18 move types reverse animation but preserve final state, raw grouping/gaps and finger indices; merged/wide notation supported');
