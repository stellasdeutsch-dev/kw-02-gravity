const W=__W__,PARENT='__PARENT__',D=__DATA__,TB=__TABLES__;
const GROUP=W>1000?'Desktop':W<500?'Mobile':'Tablet';
const VAR={'#FFA6C8':'VariableID:1:3','#F7F92E':'VariableID:1:4','#AEC5FF':'VariableID:1:5','#1C84D4':'VariableID:1:6','#B9DDF6':'VariableID:1:7','#111111':'VariableID:1:8','#8A8A8A':'VariableID:1:9','#FFFFFF':'VariableID:1:10'};
const VO={};for(const [h,id] of Object.entries(VAR))VO[h]=await figma.variables.getVariableByIdAsync(id);
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const solid=(h,o)=>{let p={type:'SOLID',color:rgb(h)};if(o!=null&&o<1)p.opacity=o;if(VO[h])p=figma.variables.setBoundVariableForPaint(p,'color',VO[h]);return p;};
const assets=await figma.getNodeByIdAsync('1:13');const HASH={};for(const r of assets.children){const f=r.fills[0];if(f&&f.type==='IMAGE')HASH[r.name+'.webp']=f.imageHash;}
const FST=(ff,fw)=>ff==='Inter'?({400:'Regular',500:'Medium',600:'Semi Bold',700:'Bold'}[fw]||'Regular'):ff==='Alumni Sans'?'Black':'Regular';
const FAM=ff=>ff==='Inter'||ff==='Alumni Sans'||ff==='Marck Script'?ff:'Inter';
await figma.loadFontAsync({family:'Inter',style:'Regular'});
const ST=TB.st.map(k=>{const [ff,fw,fs,lh,ls,up,role]=k.split('|');return{ff:FAM(ff),fw:+fw,fs:+fs,lh:lh===''?null:+lh,ls:+ls,up:up==='1',role};});
for(const s of ST)await figma.loadFontAsync({family:s.ff,style:FST(s.ff,s.fw)});
const local=await figma.getLocalTextStylesAsync();const SBN={};for(const s of local)SBN[s.name]=s;
const styleFor=s=>{const name=`${GROUP}/${s.role} ${Math.round(s.fs)}`;let st=SBN[name];if(!st){st=figma.createTextStyle();st.name=name;st.fontName={family:s.ff,style:FST(s.ff,s.fw)};st.fontSize=s.fs;st.lineHeight=s.lh?{unit:'PIXELS',value:s.lh}:{unit:'AUTO'};st.letterSpacing={unit:'PIXELS',value:s.ls};if(s.up)st.textCase='UPPER';SBN[name]=st;}return st;};
const grad=(css,h)=>{const stops=[];const re=/rgba?\(([^)]+)\)\s*([\d.]+)?(px|%)?/g;let m;const raw=[];while((m=re.exec(css))){const p=m[1].split(',').map(parseFloat);raw.push({c:{r:p[0]/255,g:p[1]/255,b:p[2]/255,a:p[3]==null?1:p[3]},pos:m[2]==null?null:(m[3]==='px'?(+m[2])/h:(+m[2])/100)});}
raw.forEach((s,i)=>{if(s.pos==null)s.pos=raw.length>1?i/(raw.length-1):0;s.pos=Math.max(0,Math.min(1,s.pos));if(i&&s.pos<raw[i-1].pos)s.pos=raw[i-1].pos;stops.push({color:s.c,position:s.pos});});
return{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:stops};};
const WAVE={'wv-h6':[6,1],'wv-h5':[5,1],'wv-v4':[4,0],'wv-v6':[6,0]};
const ids=[],TXT=[];let nText=0,nImg=0,nIc=0,nFr=0;
function mk(n,parent){let node;
if(n.t==='f'){node=figma.createFrame();nFr++;node.name=n.n;node.resize(Math.max(n.w,0.01),Math.max(n.h,0.01));
 const fills=[];if(n.fill)fills.push(solid(n.fill,n.fo));if(n.grad)fills.push(grad(n.grad,n.h));node.fills=fills;
 if(n.r){node.topLeftRadius=n.r[0];node.topRightRadius=n.r[1];node.bottomRightRadius=n.r[2];node.bottomLeftRadius=n.r[3];}
 if(n.st){node.strokes=[solid(n.st.c)];node.strokeWeight=n.st.w;node.strokeAlign='INSIDE';}
 if(n.arch&&!n.r)node.cornerRadius=Math.min(n.w,n.h)/2;
 node.clipsContent=!!(n.clip||n.mask);
 parent.appendChild(node);node.x=n.x;node.y=n.y;
 if(n.mask&&WAVE[n.mask]){const [cnt,hor]=WAVE[n.mask];const els=[];for(let i=0;i<cnt;i++){const e=figma.createEllipse();const c=(i+.5)/cnt,r=.92/cnt;if(hor){e.resize(2*r*n.w,n.h);e.x=(c-r)*n.w;e.y=0;}else{e.resize(n.w,2*r*n.h);e.x=0;e.y=(c-r)*n.h;}node.appendChild(e);els.push(e);}
  const u=figma.union(els,node);u.name='Волна';u.isMask=true;const bg=figma.createRectangle();bg.name='Фон';bg.resize(n.w,n.h);bg.fills=node.fills;node.appendChild(bg);node.fills=[];}
 for(const c of n.ch)mk(c,node);}
else if(n.t==='x'){const s=ST[n.k];node=figma.createText();nText++;node.fontName={family:s.ff,style:FST(s.ff,s.fw)};node.characters=n.s;node.name=n.s.replace(/\s+/g,' ').slice(0,40);
 parent.appendChild(node);node.x=n.x;node.y=n.y;
 node.fontSize=s.fs;if(s.lh)node.lineHeight={unit:'PIXELS',value:s.lh};node.letterSpacing={unit:'PIXELS',value:s.ls};if(s.up)node.textCase='UPPER';
 node.textAlignHorizontal=n.al||'LEFT';if(n.ind)node.paragraphIndent=n.ind;
 node.fills=[solid(n.c,n.o)];
 if(n.ws){node.textAutoResize='WIDTH_AND_HEIGHT';if(n.al==='CENTER')node.x=n.x+(n.w-node.width)/2;}
 else if(s.role==='Кнопка'||s.role==='Контакт'){node.resize(Math.max(n.w,1),Math.max(n.h,1));node.textAutoResize='NONE';node.textAlignVertical='CENTER';}
 else{node.resize(Math.max(n.w+2,1),Math.max(n.h,1));node.textAutoResize='HEIGHT';}
 if(n.ru)for(const [a,b,c] of n.ru)if(b<=n.s.length)node.setRangeFills(a,b,[solid(c)]);
 TXT.push([node,styleFor(s)]);}
else if(n.t==='i'){node=figma.createRectangle();nImg++;node.name=n.n;node.resize(Math.max(n.w,0.01),Math.max(n.h,0.01));const h=HASH[n.src];node.fills=h?[{type:'IMAGE',imageHash:h,scaleMode:n.fit?'FIT':'FILL'}]:[solid('#AEC5FF')];if(n.r)node.cornerRadius=n.r;parent.appendChild(node);node.x=n.x;node.y=n.y;}
else if(n.t==='v'){node=figma.createNodeFromSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${n.w}" height="${n.h}" viewBox="${n.vb}">${TB.ic[n.k]}</svg>`);nIc++;node.name=n.n;node.fills=[];parent.appendChild(node);node.x=n.x;node.y=n.y;}
return node;}
let parent,top=[];
if(PARENT==='ROOT'){parent=await figma.getNodeByIdAsync('1:11');}else parent=await figma.getNodeByIdAsync(PARENT);
for(const n of D.nodes){const node=mk(n,parent);top.push(node);}
// стили текста применяем после сборки (асинхронно)
for(const [t,st] of TXT){const fills=t.getStyledTextSegments(['fills']);const ind=t.paragraphIndent;await t.setTextStyleIdAsync(st.id);for(const seg of fills)t.setRangeFills(seg.start,seg.end,seg.fills);if(ind)t.paragraphIndent=ind;}
let out={top:top.map(t=>t.id),counts:{frames:nFr,texts:nText,images:nImg,icons:nIc}};
if(PARENT==='ROOT'){const pf=top[0];pf.name=`Главная · ${W}`;pf.x=W===1440?100:W===834?1700:2700;pf.y=100;pf.clipsContent=true;const sh=pf.findOne(x=>x.name==='Белый лист');out.page=pf.id;out.sheet=sh&&sh.id;}
const ad=top.find(t=>t.name==='Реклама платформы');if(ad)out.ad=ad.id;
return out;
