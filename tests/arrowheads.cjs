// Run: node tests/arrowheads.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../cube-illustrator.html'),'utf8');
const code=html.slice(html.indexOf('function head('),html.indexOf('const AX='));
const {head,arrowShaft,drawArrow}=vm.runInNewContext(code+';({head,arrowShaft,drawArrow})',{
 path:pts=>'M '+pts.map(p=>p.join(' ')).join(' L ')
});
for(let i=0;i<16;i++){
 const t=i*Math.PI/8,a=[40,40],b=[40+12*Math.cos(t),40+12*Math.sin(t)];
 const pts=head(a,b).match(/points="([^"]+)"/)[1].split(' ').map(s=>s.split(',').map(Number));
 const cross=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 assert(cross(pts[1])>0&&cross(pts[2])<0);
 assert(Math.abs(cross(pts[1])+cross(pts[2]))<1e-8);
}
assert.equal(JSON.stringify(arrowShaft([[0,0],[20,0],[40,0]],12)),'[[0,0],[20,0],[28,0]]');
for(const dbl of [false,true])for(const dash of [false,true]){
 const svg=drawArrow([[0,0],[20,0],[40,0]],p=>p,dbl,dash);
 assert.equal((svg.match(/<polygon/g)||[]).length,dbl?2:1);
 assert.equal(svg.includes('stroke-dasharray'),dash);
 assert(!svg.includes('stroke="#fff"'),'Arrow heads must connect to the shaft without a white outline');
 assert(!/NaN|Infinity/.test(svg));
}
console.log('Arrowheads: symmetric wings, connected black heads/shaft, double heads and dashed strokes OK');
