// Run: node tests/navigation.cjs (Node built-ins only)
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
new vm.Script(html.split('<script>')[1].split('</script>')[0]);
const ids=[...html.matchAll(/class="nav-toggle" aria-expanded="false" aria-controls="([^"]+)"/g)].map(m=>m[1]);
assert.deepEqual(ids,['nav3Children','cfopChildren','nav2Children','ortegaChildren']);
const panels=Object.fromEntries(ids.map(id=>[id,{inert:true}]));
const buttons=ids.map(id=>{const attrs={'aria-controls':id,'aria-expanded':'false'},parent={open:false};return {getAttribute:k=>attrs[k],setAttribute:(k,v)=>attrs[k]=String(v),parentElement:{classList:{toggle:(k,v)=>parent[k]=v}},parent};});
const start=html.indexOf("document.querySelectorAll('nav .nav-toggle')");
const end=html.indexOf("document.querySelectorAll('[data-topic]').forEach",start);
vm.runInNewContext(html.slice(start,end),{document:{querySelectorAll:()=>buttons,getElementById:id=>panels[id]}});
for(const [i,b] of buttons.entries())for(let click=1;click<=4;click++){
 b.onclick();assert.equal(b.getAttribute('aria-expanded'),String(click%2===1));
 assert.equal(panels[ids[i]].inert,click%2===0);assert.equal(b.parent.open,click%2===1);
}
assert(!/<summary|<details/.test(html.slice(html.indexOf('<nav>'),html.indexOf('</nav>'))));
assert.match(html,/prefers-reduced-motion:reduce/);
assert.match(html,/nav \.nav-collapse\{[^}]*grid-template-rows:0fr/);
console.log('Navigation: four full-row toggles reverse safely, ARIA/inert/frame state synchronized, motion reduction supported');
