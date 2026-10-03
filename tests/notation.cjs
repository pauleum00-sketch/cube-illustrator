// Run: node tests/notation.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const code=part('function parseAlg(','/* ========== 도해 SVG')+
 part('function parsePyraAlg(','function pyraGeometry(')+part('function notationSVG(','function drawAlg(')+
 part('function mirrorAlg(','function algSVG(')+part('function parsePLL(','function pllCase(');
const c=vm.runInNewContext(code+';({parseAlg,parsePyraAlg,parsePLL,notationSVG,notationHTML,mirrorAlg,lab})',{esc:s=>s});
for(const parse of [c.parseAlg,c.parsePyraAlg,c.parsePLL]){
 const p=parse("(R U R') / U // (L' U L)");
 assert.equal(p.bad.length,0);assert.equal(p.moves.length,7);
 assert.equal(p.moves[0].chunk,p.moves[2].chunk);
 assert(p.moves[3].spaceBefore);assert(p.moves[4].lineBefore);
 assert.notEqual(p.moves[0].chunk,p.moves[4].chunk);
 assert(parse('(R U').bad.length);assert(parse('R)').bad.length);
 assert(parse('(bad)').bad.length);
 assert.equal(parse('(R) R').moves.length,2);
}
const p=c.parseAlg('(R U) / F // (L D)');
const svg=c.notationSVG(p.moves,()=>'',124,132,40,8);
assert.equal((svg.match(/class="alg-chunk"/g)||[]).length,2);
assert(svg.includes('translate(282.72,0)'));assert(svg.includes('translate(0,172)'));
assert(c.notationHTML(p.moves).includes('class="alg-break"'));
assert(c.notationHTML(p.moves).includes('class="alg-gap"'));
const mirrored=c.parseAlg(c.mirrorAlg('(R U) / F // (L D)'));
assert.equal(mirrored.bad.length,0);assert(mirrored.moves[3].lineBefore);
assert.equal(mirrored.moves[0].letter,'L');
assert.equal(c.parseAlg('U U').moves.length,1);
assert.equal(c.parseAlg('U / U').moves.length,2);
console.log('Notation: grouping, gaps, line breaks, strict errors, SVG placement, mirror and merge boundaries OK');
