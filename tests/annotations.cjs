// Run: node tests/annotations.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
const script=html.split('<script>')[1].split('</script>')[0];new vm.Script(script);
const part=(a,b)=>script.slice(script.indexOf(a),script.indexOf(b));
const old="y F' R U R' U' R' F R",entry={id:'kept',text:old,grip:'down',notes:{0:'회전',1:'왼손 검지',3:'오른손 검지'},regrips:[3],highlights:[[1,4]]};
const storage=new Map([['cubeAlgorithmLibrary.v1',JSON.stringify({cases:{'oll2:L':{active:'kept',algs:[entry]}},migrated:{}})]]);
const code=part('const RAD=','/* ========== 상태')+part('const applyM=','const matMul=')+
 part('function rotM(','const CM=')+part('const dot3=','/* 화면 기준 적용')+part('const AX=','const GAP=')+
 part('function parseAlg(','/* ========== 도해 SVG')+part('function wrapFingerNote(','function drawAlg(')+
 part('const PLL_CENTER=','const PLL_CACHE=')+part('const OLL_DATA=','function twoPicture(')+
 part('const LIBKEY=','let fingerOn=')+part('function orientOrtegaL(','const TWO_BOOKS=');
const c=vm.runInNewContext(code+';({LIB,sharedEntry,orientOrtegaL,highlightRanges,toggleHighlight,fingerHTML,notationHTML,parseAlg,twoCase,applyMoveTo,cornerColors,FKEYS})',{
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},crypto:{randomUUID:()=> 'new'},toast(){},esc:s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;'),moveDiagram:()=>'<path class="demo-diagram"/>'});
const rotated=c.applyMoveTo(c.twoCase(old,'oll2').base,{letter:'y'});
c.orientOrtegaL();const a=c.sharedEntry('oll2:L'),next=c.twoCase(a.text,'oll2');
assert.equal(a.text,"F' R U R' U' R' F R");assert.equal(a.id,'kept');assert.equal(a.grip,'down');
assert.equal(JSON.stringify(a.notes),JSON.stringify({0:'왼손 검지',2:'오른손 검지'}));assert.equal(JSON.stringify(a.regrips),'[2]');assert.equal(JSON.stringify(a.highlights),'[[0,3]]');
assert.equal(JSON.parse(storage.get('cubeOrtegaLBeforeRotation.v1'))[0].text,old);
for(const f of c.FKEYS)assert.equal(JSON.stringify(c.cornerColors(rotated,f)),JSON.stringify(c.cornerColors(next.base,f)),f+' must begin after y');
const saved=JSON.stringify(a);c.orientOrtegaL();assert.equal(JSON.stringify(a),saved,'migration must be idempotent');
c.toggleHighlight(a,3,0,8);assert.equal(JSON.stringify(a.highlights),'[]');
c.toggleHighlight(a,1,3,8);c.toggleHighlight(a,2,5,8);assert.equal(JSON.stringify(a.highlights),'[[1,5]]');
c.toggleHighlight(a,5,1,8);assert.equal(JSON.stringify(a.highlights),'[]');
assert.equal(JSON.stringify(c.highlightRanges({highlights:[[0,1],[2,99],[-1,2],['1',2]]},8)),'[[0,1]]');
a.highlights=[[0,3]];
const diagram=c.fingerHTML('oll2:L',"(F' R / U R') // U' R' F R",true);
assert.equal((diagram.match(/demo-diagram/g)||[]).length,8);assert.equal((diagram.match(/class="move-label"/g)||[]).length,8);
assert(diagram.includes('class="grip-tag"'));assert(diagram.includes('class="finger-note"'));assert(diagram.includes('class="regrip-line"'));assert(diagram.includes('class="alg-highlight"'));assert(diagram.includes('class="alg-subchunk"'));
const labels=[...diagram.matchAll(/class="move-label" x="([^"]+)" y="([^"]+)"/g)];assert(labels.every(l=>l[2]===labels[0][2]),'notes must not change label height');
const label0=labels[0][1],note0=diagram.match(/class="finger-note" x="([^"]+)"/)[1];assert.equal(label0,note0,'note and label must share their center');
assert(!c.fingerHTML('oll2:L',a.text,false,false).includes('finger-note'));
a.grip='home';assert(!c.fingerHTML('oll2:L',a.text,true).includes('grip-tag'),'home grip must not have a tag');
assert(!c.fingerHTML('oll2:L',a.text,false).includes('홈그립'));
a.grip='up';assert(c.fingerHTML('oll2:L',a.text,true).includes('업그립'));
a.grip='down';assert(c.fingerHTML('oll2:L',a.text,true).includes('다운그립'));
for(const text of ["R U R' U'","(R U / R' U') // F R","R (U R') / F"]){
 const markup=c.notationHTML(c.parseAlg(text).moves,undefined,[[0,3]]);
 assert.equal((markup.match(/<span/g)||[]).length,(markup.match(/<\/span>/g)||[]).length);
}
assert.equal((c.notationHTML(c.parseAlg("R U R' U'").moves,undefined,[[0,3]]).match(/highlight-span/g)||[]).length,1);
a.grip='home';a.notes={};a.regrips=[];a.highlights=[];
const plain=c.fingerHTML('oll2:L','R U F L');assert(plain.includes('viewBox="0 0 112 28"'));
a.highlights=[[1,2]];const spaced=c.fingerHTML('oll2:L','R U F L');
assert(spaced.includes('viewBox="0 0 144 28"'));
assert(spaced.includes('class="alg-highlight" x="35" y="1" width="74"'));
assert.deepEqual([...spaced.matchAll(/class="alg-move" transform="translate\(([^,]+),([^\)]+)\)"/g)].map(m=>[+m[1],+m[2]]),[[0,0],[44,0],[72,0],[116,0]]);
const broken=c.fingerHTML('oll2:L','R U // F L');
assert.equal((broken.match(/class="alg-highlight"/g)||[]).length,2);assert(broken.includes('translate(16,28)'));
console.log('Annotations: L starts after y with IDs/notes/regrips/highlights backed up and shifted once; highlight toggle/merge; integrated diagram/label/note centers and explicit grouping/breaks OK');
