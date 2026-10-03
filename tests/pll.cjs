// Run: node tests/pll.cjs (no browser or dependencies needed)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const code=part('const RAD=','/* ========== 상태')+part('const applyM=','const matMul=')+
 part('function rotM(','const CM=')+part('const dot3=','/* 화면 기준 적용')+
 part('const AX=','const GAP=')+part('function parseAlg(','/* ========== 도해 SVG')+
 part('const PLL_DATA=','const LSKEY2=')+part('const PLL_CENTER=','const PLL_CACHE=');
const ctx=vm.runInNewContext(code+';({PLL_DATA,PLL_ORIENTATIONS,pllCase,pllSolved,applyMoveTo,parseAlg,FKEYS,PLL_CENTER})');
const {PLL_DATA,PLL_ORIENTATIONS,pllCase,pllSolved,applyMoveTo,parseAlg,FKEYS,PLL_CENTER}=ctx;
const run=(s,alg)=>parseAlg(alg).moves.reduce(applyMoveTo,s);
const solved=s=>FKEYS.every(f=>s[f].flat().every(c=>c===s[f][1][1]));
const key=s=>{const map=Object.fromEntries(FKEYS.map(f=>[s[f][1][1],PLL_CENTER[f]]));return FKEYS.flatMap(f=>s[f].flat().map(c=>map[c])).join('');};
assert.equal(PLL_DATA.length,21);assert.equal(PLL_ORIENTATIONS.length,24);
// Side-strip colors read from SCDB top-down SVGs on 2026-10-03 (B,F,L,R per column).
const referenceStrips={"Aa":"OGBGBGROOBRR","Ab":"GGOBBGRORORB","E":"GGOOORBGBBRR","F":"GROOORGBBRBG","Ga":"BGRGGOBROORB","Gb":"BGRGRBOGOORB","Gc":"BGRGOBGROORB","Gd":"BGRGGROBOORB","H":"BGROGBORBGRO","Ja":"OOBRGOBRGBGR","Jb":"ORBROGBRGGBO","Na":"BBRRBGORGGOO","Nb":"GGOOBGORBBRR","Ra":"RBGGGOBROBOR","Rb":"GROOOGBRBRBG","T":"BGRGBGOROORB","Ua":"BGRORGOBBGRO","Ub":"BGROOGBRBGRO","V":"GGOOOGRBBBRR","Y":"GGOORGBOBBRR","Z":"GBORORGBGBOR"};
let checked=0;
for(const [name,,setup,algs] of PLL_DATA){
 const reference=run(pllSolved(),setup),variants=new Set();
 const strips=[];for(let c=0;c<3;c++)strips.push(reference.B[0][2-c],reference.F[0][c],reference.L[0][c],reference.R[0][2-c]);
 assert.equal(strips.join(''),referenceStrips[name],`${name}: SCDB top-down colors differ`);
 for(let u=0;u<4;u++)for(let y=0;y<4;y++)variants.add(key(run(reference,[...Array(u).fill('U'),...Array(y).fill('y')].join(' '))));
 assert.equal(algs.length,4);
 for(const alg of algs){
  const info=pllCase(alg);assert(!info.error,`${name}: ${info.error}`);
  assert(variants.has(key(info.base)),`${name}: wrong case for ${alg}`);
  assert(solved(info.moves.reduce(applyMoveTo,info.base)),`${name}: unsolved`);
  assert.equal(JSON.stringify(run(pllSolved(),info.setup)),JSON.stringify(info.base),`${name}: setup differs`);
  checked++;
 }
}
assert(pllCase('R banana').error);assert(pllCase('R').error);assert(pllCase('').error);
console.log(`PLL: ${checked} algorithms match their SCDB cases up to U/y, setups reproduce the same state, and all solve`);
