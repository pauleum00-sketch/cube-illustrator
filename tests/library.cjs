// Run: node tests/library.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8').split('<script>')[1].split('</script>')[0];
const code=script.slice(script.indexOf('const LIBKEY='),script.indexOf('function fingerHTML('));
const storage=new Map([['f2lWorkbook.v2','original students']]);let id=0;
const c=vm.runInNewContext(code+';({LIB,migrateLibrary,sharedAdd,sharedSelect,sharedEntry})',{localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},crypto:{randomUUID:()=>String(++id)},toast(){}});
const students=[{algIdx:{H:1},custom:{}},{algIdx:{H:'c'},custom:{H:'custom formula'}}];
c.migrateLibrary('test',[['pll:H',['first formula','second formula'], 'H']],students,students[0],(p,n,a)=>p.algIdx[n]==='c'?p.custom[n]:a[p.algIdx[n]||0]);
assert.deepEqual([...c.LIB.cases['pll:H'].algs.map(a=>a.text)],['first formula','second formula','custom formula']);
assert.equal(c.sharedEntry('pll:H').text,'second formula');assert.equal(storage.get('f2lWorkbook.v2'),'original students');
const active=c.sharedEntry('pll:H');active.notes[1]='오른손 엄지';active.grip='up';active.regrips=[1];
assert.equal(c.sharedAdd('pll:H','second formula'),active);
c.migrateLibrary('test',[['pll:H',['first formula'], 'H']],students,students[1],()=> 'first formula');
assert.equal(c.sharedEntry('pll:H'),active);assert.equal(c.sharedEntry('pll:H').notes[1],'오른손 엄지');
c.sharedSelect('pll:H',c.LIB.cases['pll:H'].algs[2].id);assert.equal(c.sharedEntry('pll:H').text,'custom formula');
assert.equal(c.LIB.cases['pll:H'].algs.length,3);
console.log('Library: preserve previous variants/custom text, select current formula, shared notes, idempotent migration and original backup OK');
