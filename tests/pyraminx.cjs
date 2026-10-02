// Run: node tests/pyraminx.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
const script=html.split('<script>')[1].split('</script>')[0];
new vm.Script(script);
const section=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const code=section('const RAD=','/* ========== 색 / 면')+
  section('const applyM=','const matMul=')+section('function rotM(','const CM=')+
  script.match(/const cross=.*;/)[0]+script.match(/const dot3=.*;/)[0]+
  section('const PYRA_VERTICES=','function pyraMoveDiagram');
const {parse,geometry,vertices}=vm.runInNewContext(code+';({parse:parsePyraAlg,geometry:pyraGeometry,vertices:PYRA_VERTICES})');
assert.equal(parse('R R').moves.length,2);
assert.equal(parse("R2 R’2").moves.map(m=>m.prime).join(','),'true,false');
assert.equal(parse('F x R22').bad.length,3);
for(const letter of 'ULRBulrb'){
  const normal=geometry({letter,prime:false}),reverse=geometry({letter,prime:true});
  assert.equal(normal.faces.length,7); // 3 moving triangles + 3 stationary quads + opposite face
  const moving=normal.faces.filter(t=>t.moving);
  assert.equal(moving.length,3);
  const edge=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
  for(const face of moving)assert(Math.abs(edge(face.points[1],face.points[2])/Math.sqrt(12)-(letter===letter.toUpperCase()?2/3:1/3))<1e-10);
  assert.deepEqual(normal.arc[0],reverse.arc.at(-1));
  assert.deepEqual(normal.arc.at(-1),reverse.arc[0]);
  assert(normal.arc.flat().every(Number.isFinite));
}
const vs=Object.values(vertices);
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)
  assert(Math.abs(Math.hypot(...vs[i].map((x,k)=>x-vs[j][k]))-Math.sqrt(12))<1e-10);
console.log('Pyraminx: syntax, parser, seven unsplit surfaces, layer cuts and reverse arrows OK');
