// Run: node tests/ortega.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const code=part('const RAD=','/* ========== 상태')+part('const applyM=','const matMul=')+
 part('function rotM(','const CM=')+part('const dot3=','/* 화면 기준 적용')+
 part('const AX=','const GAP=')+part('function parseAlg(','/* ========== 도해 SVG')+
 part('const PLL_CENTER=','const PLL_CACHE=')+part('const OLL_DATA=','function twoPicture(');
const c=vm.runInNewContext(code+';({TWO_DATA,twoCase,cornerColors,applyMoveTo,parseTwoAlg,FKEYS})');
assert.equal(c.TWO_DATA.oll2.length,7);assert.equal(c.TWO_DATA.pbl2.length,6);let checked=0;
for(const [kind,rows] of Object.entries(c.TWO_DATA))for(const [name,,algs] of rows){
 const reference=c.twoCase(algs[0],kind);assert(!reference.error,`${name}: ${reference.error}`);
 const masks=new Set();let rotated=reference.base;
 for(let i=0;i<4;i++){masks.add(['U','F','R','B','L'].flatMap(f=>c.cornerColors(rotated,f).map(x=>x==='Y'?1:0)).join(''));rotated=c.applyMoveTo(rotated,{letter:'y'});}
 const bars=s=>['F','R','B','L'].map(f=>[s[f][0][0]===s[f][0][2],s[f][2][0]===s[f][2][2]]).reduce((n,a)=>[n[0]+a[0],n[1]+a[1]],[0,0]).join(',');
 for(const alg of algs){const info=c.twoCase(alg,kind);assert(!info.error,`${kind} ${name}: ${info.error}`);
  const end=info.moves.reduce(c.applyMoveTo,info.base);assert(c.FKEYS.every(f=>new Set(c.cornerColors(end,f)).size===1),`${name} not solved`);
  if(kind==='oll2')assert(masks.has(['U','F','R','B','L'].flatMap(f=>c.cornerColors(info.base,f).map(x=>x==='Y'?1:0)).join('')),`${name}: wrong OLL pattern`);
  else assert.equal(bars(info.base),bars(reference.base),`${name}: wrong PBL pairing`);
  checked++;
 }
}
assert(c.parseTwoAlg('M Rw Fw').bad.length===3);assert(c.twoCase('R','pbl2').error);
console.log(`Ortega: ${checked} SCDB algorithms match OLL patterns/PBL layer pairing and solve all corners`);
