(() => {
"use strict";

const KEY="designforge-v9";
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

const state={
 project:"Untitled Project",
 canvas:{w:1100,h:700,bg:"#ffffff"},
 zoom:1, grid:false, theme:"dark", pageId:"home",
 pages:[{id:"home",name:"Home",objects:[]}],
 selected:null, tool:"select",device:"desktop",responsive:true
};
let history=[], future=[], drag=null, resize=null, rotating=null;

function blankPage(id="home",name="Home"){return {id,name,objects:[]};}
function currentPage(){return state.pages.find(p=>p.id===state.pageId)||state.pages[0];}
function snapshot(){return JSON.stringify({project:state.project,canvas:state.canvas,pages:state.pages,pageId:state.pageId,theme:state.theme});}
function restore(s){const x=JSON.parse(s);Object.assign(state,x);state.selected=null;applyTheme();render();}
function saveHistory(){history.push(snapshot());if(history.length>60)history.shift();future=[];}
function save(){try{localStorage.setItem(KEY,snapshot())}catch(e){toast("Local save unavailable");}}
function load(){
 try{
  const raw=localStorage.getItem(KEY);
  if(raw){const x=JSON.parse(raw); if(x&&Array.isArray(x.pages)&&x.canvas){Object.assign(state,x)}}
 }catch(e){localStorage.removeItem(KEY);toast("Recovered from invalid saved data")}
 applyTheme();
}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1600)}
function applyTheme(){document.body.classList.toggle("light",state.theme==="light")}
function color(v){return v||"#4e8cff"}

function makeObj(type,opts={}){
 const base={id:uid(),type,name:opts.name||type[0].toUpperCase()+type.slice(1),x:80,y:80,w:220,h:100,rotation:0,opacity:1,fill:"#4e8cff",stroke:"transparent",strokeWidth:0,radius:14,shadow:true,locked:false,hidden:false,blur:0,backdropBlur:0,responsive:{desktop:{},tablet:{},mobile:{}}};
 if(type==="text")Object.assign(base,{text:opts.text||"Heading",w:420,h:70,fill:"#162338",fontSize:48,fontWeight:700,align:"left",lineHeight:1.05});
 if(type==="button")Object.assign(base,{text:"Get Started",w:180,h:52,fill:"#4e8cff",textColor:"#ffffff",fontSize:16,fontWeight:700,radius:12,align:"center"});
 if(type==="card")Object.assign(base,{w:280,h:180,fill:"#ffffff",stroke:"#d9e3ef",strokeWidth:1,radius:18,shadow:true});
 if(type==="shape")Object.assign(base,{w:180,h:130,fill:"#6c5cff"});
 if(type==="circle")Object.assign(base,{w:130,h:130,fill:"#31c48d",radius:999});
 if(type==="frame")Object.assign(base,{w:500,h:320,fill:"transparent",stroke:"#4e8cff",strokeWidth:2,radius:8});
 if(type==="image")Object.assign(base,{w:320,h:220,fill:"#d8e3f0",src:""});
 return Object.assign(base,opts);
}
function add(type,opts={}){
 saveHistory();const o=makeObj(type,opts);currentPage().objects.push(o);state.selected=o.id;save();render();return o;
}
function findObj(){return currentPage().objects.find(o=>o.id===state.selected)}
function updateObj(id,patch,historyIt=true){const o=currentPage().objects.find(x=>x.id===id);if(!o)return;if(historyIt)saveHistory();Object.assign(o,patch);save();render()}
function removeSelected(){const o=findObj();if(!o)return;saveHistory();currentPage().objects=currentPage().objects.filter(x=>x.id!==o.id);state.selected=null;save();render()}
function duplicate(){const o=findObj();if(!o)return;saveHistory();const n=JSON.parse(JSON.stringify(o));n.id=uid();n.name=o.name+" Copy";n.x+=25;n.y+=25;currentPage().objects.push(n);state.selected=n.id;save();render()}
function moveLayer(dir){
 const p=currentPage(),i=p.objects.findIndex(o=>o.id===state.selected);if(i<0)return;
 const j=dir==="front"?p.objects.length-1:dir==="back"?0:i+(dir==="up"?1:-1);if(j===i)return;
 saveHistory();const [o]=p.objects.splice(i,1);p.objects.splice(clamp(j,0,p.objects.length),0,o);save();render();
}
function setZoom(z){state.zoom=clamp(z,.25,4);$("#zoomLabel").textContent=Math.round(state.zoom*100)+"%";$("#canvasShadow").style.transform=`scale(${state.zoom})`;save()}
function render(){
 const p=currentPage();$("#pageTitle").textContent=p.name;
 ensureDeviceBar();
 applyResponsiveToObjects();
 $("#canvas").style.width=state.canvas.w+"px";$("#canvas").style.height=state.canvas.h+"px";$("#canvas").style.background=state.canvas.bg;$("#canvas").classList.toggle("grid",state.grid);
 $("#canvasShadow").style.width=state.canvas.w+"px";$("#canvasShadow").style.height=state.canvas.h+"px";$("#canvasShadow").style.transform=`scale(${state.zoom})`;
 const root=$("#objects");root.innerHTML="";
 p.objects.forEach(o=>{if(o.hidden)return;root.appendChild(renderObj(o))});
 renderInspector();renderLibrary();
}

function deviceSize(device){
  return device==="mobile"?{w:390,h:844}:device==="tablet"?{w:768,h:1024}:{w:1440,h:900};
}
function ensureDeviceBar(){
  let bar=document.querySelector(".device-bar");
  if(!bar){
    bar=document.createElement("div");bar.className="device-bar";
    bar.innerHTML='<button data-device="desktop">🖥 PC</button><button data-device="tablet">▣ Tablet</button><button data-device="mobile">📱 Phone</button><span class="responsive-badge">Responsive</span>';
    const stage=$("#stageViewport");stage.parentElement.insertBefore(bar,stage);
    bar.querySelectorAll("[data-device]").forEach(b=>b.onclick=()=>{
      saveHistory();state.device=b.dataset.device;
      const s=deviceSize(state.device);
      state.canvas.w=s.w;state.canvas.h=s.h;
      save();render();toast(state.device==="desktop"?"PC preview":state.device==="tablet"?"Tablet preview":"Phone preview");
    });
  }
  bar.querySelectorAll("[data-device]").forEach(b=>b.classList.toggle("active",b.dataset.device===state.device));
}
function applyResponsiveToObjects(){
  const p=currentPage();
  p.objects.forEach(o=>{
    const r=o.responsive?.[state.device];
    if(!r)return;
    if(r.w) o.w=r.w;
    if(r.fontSize) o.fontSize=r.fontSize;
  });
}
function renderObj(o){
 const el=document.createElement("div");el.className="obj"+(state.selected===o.id?" selected":"");el.dataset.id=o.id;
 Object.assign(el.style,{left:o.x+"px",top:o.y+"px",width:o.w+"px",height:o.h+"px",transform:`rotate(${o.rotation||0}deg)`,opacity:o.opacity,background:o.fill==="transparent"?"transparent":o.fill,border:`${o.strokeWidth||0}px solid ${o.stroke||"transparent"}`,borderRadius:(o.radius||0)+"px",boxShadow:o.shadow?"0 10px 28px #18324a22":"none",filter:o.blur?`blur(${o.blur}px)`:"none",backdropFilter:o.backdropBlur?`blur(${o.backdropBlur}px)`:"none",WebkitBackdropFilter:o.backdropBlur?`blur(${o.backdropBlur}px)`:"none"});
 if(o.type==="text"||o.type==="button"){el.classList.add("text-object");el.textContent=o.text||"";el.style.color=o.textColor||o.fill;el.style.fontSize=(o.fontSize||16)+"px";el.style.fontWeight=o.fontWeight||400;el.style.textAlign=o.align||"left";el.style.lineHeight=o.lineHeight||1.2;el.style.padding=o.type==="button"?"0 14px":"4px 6px";if(o.type==="button")el.style.display="flex",el.style.alignItems="center",el.style.justifyContent="center",el.style.color=o.textColor||"#fff"}
 if(o.type==="image"){el.innerHTML=o.src?`<img class="image-object" src="${o.src}">`:"<div style='height:100%;display:grid;place-items:center;color:#63758b;font-size:12px'>＋ Image</div>";}
 if(o.type==="frame")el.innerHTML="<div class='frame-object'></div>";
 if(o.type==="card")el.innerHTML="<div style='padding:20px;font-weight:700;color:#172337'>Card</div>";
 const hs=["nw","n","ne","e","se","s","sw","w"];hs.forEach(h=>{const q=document.createElement("span");q.className="handle h-"+h;q.dataset.handle=h;el.appendChild(q)});const r=document.createElement("span");r.className="handle rotate-h";r.dataset.handle="rotate";el.appendChild(r);const line=document.createElement("span");line.className="rotate-line";el.appendChild(line);
 el.addEventListener("pointerdown",onPointerDown);el.addEventListener("dblclick",()=>editText(o));
 return el;
}
function onPointerDown(e){
 if(state.tool!=="select")return;
 const el=e.currentTarget,o=findObjById(el.dataset.id);if(!o||o.locked)return;
 e.preventDefault();el.setPointerCapture(e.pointerId);
 if(e.target.dataset.handle==="rotate"){saveHistory();rotating={o,startX:e.clientX,startY:e.clientY,startRot:o.rotation||0};return}
 if(e.target.dataset.handle){saveHistory();resize={o,handle:e.target.dataset.handle,startX:e.clientX,startY:e.clientY,x:o.x,y:o.y,w:o.w,h:o.h};return}
 state.selected=o.id;save();renderInspector();render();
 drag={o,startX:e.clientX,startY:e.clientY,x:o.x,y:o.y};
}
function findObjById(id){return currentPage().objects.find(o=>o.id===id)}
window.addEventListener("pointermove",e=>{
 if(drag){const dx=(e.clientX-drag.startX)/state.zoom,dy=(e.clientY-drag.startY)/state.zoom;drag.o.x=clamp(drag.x+dx,0,state.canvas.w-drag.o.w);drag.o.y=clamp(drag.y+dy,0,state.canvas.h-drag.o.h);render();return}
 if(resize){const dx=(e.clientX-resize.startX)/state.zoom,dy=(e.clientY-resize.startY)/state.zoom,h=resize.handle,o=resize.o;
  let x=resize.x,y=resize.y,w=resize.w,hh=resize.h;
  if(h.includes("e"))w=resize.w+dx;if(h.includes("s"))hh=resize.h+dy;if(h.includes("w")){w=resize.w-dx;x=resize.x+dx}if(h.includes("n")){hh=resize.h-dy;y=resize.y+dy}
  o.x=clamp(x,0,state.canvas.w-20);o.y=clamp(y,0,state.canvas.h-20);o.w=Math.max(20,w);o.h=Math.max(20,hh);render();return}
 if(rotating){const o=rotating.o,dx=e.clientX-rotating.startX,dy=e.clientY-rotating.startY;o.rotation=rotating.startRot+dx*.35-dy*.05;render()}
});
window.addEventListener("pointerup",()=>{if(drag||resize||rotating){save();drag=null;resize=null;rotating=null;renderInspector()}});
function editText(o){if(!["text","button"].includes(o.type))return;const v=prompt("Edit text",o.text||"");if(v!==null){saveHistory();o.text=v;save();render()}}
function select(id){state.selected=id;render()}
function renderInspector(){
 const box=$("#inspectorBody"),o=findObj();
 if(!o){box.innerHTML=`<div class="empty"><b>No selection</b>Select an object on the canvas to edit it.</div>`;return}
 box.innerHTML=`
 <div class="ins-section"><h4>Selected</h4><div class="row"><div><label>Name</label><input id="iName" type="text" value="${esc(o.name)}"></div><div><label>Type</label><input disabled value="${o.type}"></div></div>
 <div class="row three"><div><label>X</label><input id="iX" type="number" value="${o.x}"></div><div><label>Y</label><input id="iY" type="number" value="${o.y}"></div><div><label>Rotation</label><input id="iR" type="number" value="${Math.round(o.rotation||0)}"></div></div></div>
 <div class="ins-section"><h4>Size</h4><div class="row"><div><label>Width</label><input id="iW" type="number" value="${Math.round(o.w)}"></div><div><label>Height</label><input id="iH" type="number" value="${Math.round(o.h)}"></div></div></div>
 <div class="ins-section"><h4>Appearance</h4><div class="row"><div><label>Fill</label><input id="iFill" type="color" value="${toHex(o.fill)}"></div><div><label>Opacity</label><input id="iOpacity" class="range" type="range" min="0" max="1" step=".01" value="${o.opacity}"></div></div>
 <div class="row"><div><label>Border</label><input id="iStroke" type="color" value="${toHex(o.stroke||"#000000")}"></div><div><label>Radius</label><input id="iRadius" type="number" value="${o.radius||0}"></div></div>
 <div class="row"><div><label>Border width</label><input id="iSW" type="number" min="0" value="${o.strokeWidth||0}"></div><div><label>Shadow</label><select id="iShadow"><option value="1" ${o.shadow?"selected":""}>On</option><option value="0" ${!o.shadow?"selected":""}>Off</option></select></div></div></div>
 ${["text","button"].includes(o.type)?`<div class="ins-section"><h4>Typography</h4><textarea id="iText" rows="3">${esc(o.text||"")}</textarea><div class="row"><div><label>Font size</label><input id="iFont" type="number" value="${o.fontSize||16}"></div><div><label>Weight</label><select id="iWeight">${[400,500,600,700,800].map(x=>`<option ${x===(o.fontWeight||400)?"selected":""}>${x}</option>`).join("")}</select></div></div><div class="row"><div><label>Text color</label><input id="iTextColor" type="color" value="${toHex(o.textColor||"#172337")}"></div><div><label>Align</label><select id="iAlign"><option>left</option><option ${o.align==="center"?"selected":""}>center</option><option ${o.align==="right"?"selected":""}>right</option></select></div></div></div>`:""}
 <div class="ins-section"><h4>Layer</h4><div class="mini-actions"><button id="dupBtn">Duplicate</button><button id="delBtn">Delete</button></div><div class="mini-actions"><button id="backBtn">Send Back</button><button id="frontBtn">Bring Front</button></div><div class="mini-actions"><button id="lockBtn">${o.locked?"Unlock":"Lock"}</button><button id="hideBtn">Hide</button></div></div>`;
 bindInspector(o);
}
function bindInspector(o){
 const map={iName:"name",iX:"x",iY:"y",iR:"rotation",iW:"w",iH:"h",iFill:"fill",iOpacity:"opacity",iStroke:"stroke",iRadius:"radius",iSW:"strokeWidth",iShadow:"shadow",iText:"text",iFont:"fontSize",iWeight:"fontWeight",iTextColor:"textColor",iAlign:"align",iBlur:"blur",iBlurNum:"blur"};
 o.responsive=o.responsive||{desktop:{},tablet:{},mobile:{}};
 function bindResponsive(){
   const d=$("#iDevice"); if(d)d.value=state.device;
   const rw=$("#iRW"),rf=$("#iRF");
   if(rw)rw.value=o.responsive[state.device]?.w||o.w;
   if(rf)rf.value=o.responsive[state.device]?.fontSize||o.fontSize||16;
 }
 const dev=$("#iDevice"); if(dev)dev.onchange=()=>{state.device=dev.value;save();render()};
 const rw=$("#iRW"); if(rw)rw.onchange=()=>{saveHistory();o.responsive[state.device]={...(o.responsive[state.device]||{}),w:Number(rw.value)};save();render()};
 const rf=$("#iRF"); if(rf)rf.onchange=()=>{saveHistory();o.responsive[state.device]={...(o.responsive[state.device]||{}),fontSize:Number(rf.value)};save();render()};
 const bd=$("#iBackdrop"); if(bd)bd.oninput=()=>{o.backdropBlur=Number(bd.value);render()};
 const glass=$("#iGlass"); if(glass)glass.onchange=()=>{saveHistory();const v=glass.value;o.backdropBlur=v==="soft"?6:v==="medium"?14:v==="strong"?24:0;o.blur=0;save();render()};
 bindResponsive();
 Object.entries(map).forEach(([id,key])=>{const el=$("#"+id);if(!el)return;el.addEventListener("change",()=>{saveHistory();let v=el.value;if(["x","y","rotation","w","h","opacity","radius","strokeWidth","fontSize","fontWeight"].includes(key))v=Number(v);if(key==="shadow")v=v==="1";Object.assign(o,{[key]:v});save();render()})});
 $("#dupBtn").onclick=duplicate;$("#delBtn").onclick=removeSelected;$("#backBtn").onclick=()=>moveLayer("back");$("#frontBtn").onclick=()=>moveLayer("front");$("#lockBtn").onclick=()=>{saveHistory();o.locked=!o.locked;save();render()};$("#hideBtn").onclick=()=>{saveHistory();o.hidden=true;state.selected=null;save();render()};
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toHex(v){if(!v||v==="transparent"||v.startsWith("linear-gradient"))return "#4e8cff";return v.length===7?v:"#4e8cff"}

const panels={
home:{title:"Quick Start",desc:"Build a responsive interface directly in your browser.",items:[["New Canvas","Create a fresh canvas","new"],["Landing Page","Starter landing layout","tpl-landing"],["Dashboard","Starter dashboard","tpl-dashboard"],["Mobile App","Mobile UI starter","tpl-mobile"],["Portfolio","Portfolio starter","tpl-portfolio"],["E-commerce","Shop UI starter","tpl-shop"]]},
templates:{title:"Templates",desc:"Insert a complete editable starter layout.",items:[["Landing Page","Hero + cards + CTA","tpl-landing"],["Dashboard","Sidebar + stats","tpl-dashboard"],["Mobile App","Mobile product screen","tpl-mobile"],["Portfolio","Creative portfolio","tpl-portfolio"],["Streaming UI","Media browsing layout","tpl-stream"],["E-commerce","Product card layout","tpl-shop"]]},
elements:{title:"Elements",desc:"Add reusable UI building blocks.",items:[["Card","Container card","card"],["Button","Action button","button"],["Rectangle","Basic shape","shape"],["Circle","Circular shape","circle"],["Frame","Design frame","frame"],["Input","Form field","input"],["Navbar","Navigation bar","navbar"],["Badge","Small label","badge"]]},
text:{title:"Text",desc:"Insert editable typography presets.",items:[["Heading","Large heading","heading"],["Subheading","Supporting title","subheading"],["Body","Body copy","body"],["Quote","Quote block","quote"],["Caption","Small caption","caption"]]},
images:{title:"Images",desc:"Upload an image from this device.",items:[["Upload Image","Choose a local image","upload"]]},
layers:{title:"Layers",desc:"Select, reorder, hide or lock objects.",items:[]},
pages:{title:"Pages",desc:"Create multiple design pages.",items:[]},
settings:{title:"Settings",desc:"Project and editor settings.",items:[["Dark Theme","Use dark workspace","dark"],["Light Theme","Use light workspace","light"],["Export Project","Download project JSON","export"],["Import Project","Restore project JSON","import"],["Reset Project","Clear local project","reset"]]}
};
function renderLibrary(){
 const active=$(".side-item.active")?.dataset.panel||"home",p=panels[active]||panels.home;
 if(active==="layers"){renderLayerLibrary();return} if(active==="pages"){renderPageLibrary();return}
 $("#library").innerHTML=`<h3>${p.title}</h3><p>${p.desc}</p>${active==="home"||active==="templates"?`<input id="libSearch" class="search" placeholder="Search...">`:""}<div class="lib-grid">${p.items.map(x=>`<button class="lib-btn" data-act="${x[2]}"><b>${x[0]}</b><small>${x[1]}</small></button>`).join("")}</div>`;
 $$("#library .lib-btn").forEach(b=>b.onclick=()=>libraryAction(b.dataset.act));
 const s=$("#libSearch");if(s)s.oninput=()=>filterLibrary(s.value);
}
function filterLibrary(q){$$("#library .lib-btn").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q.toLowerCase())?"":"none")}
function renderLayerLibrary(){
 const p=currentPage();$("#library").innerHTML=`<h3>Layers</h3><p>${p.objects.length} object${p.objects.length===1?"":"s"} on ${p.name}</p><div>${[...p.objects].reverse().map(o=>`<div class="layer-row ${o.id===state.selected?"active":""}" data-id="${o.id}"><button class="eye" data-hide="${o.id}">${o.hidden?"○":"●"}</button><span class="layer-name">${esc(o.name)}</span><button data-lock="${o.id}">${o.locked?"🔒":"🔓"}</button></div>`).join("")||`<div class="empty">No layers yet.</div>`}</div>`;
 $$("#library .layer-row").forEach(r=>r.onclick=e=>{if(e.target.dataset.hide||e.target.dataset.lock)return;select(r.dataset.id)});$$("#library [data-hide]").forEach(b=>b.onclick=()=>{saveHistory();const o=findObjById(b.dataset.hide);o.hidden=!o.hidden;save();render()});$$("#library [data-lock]").forEach(b=>b.onclick=()=>{saveHistory();const o=findObjById(b.dataset.lock);o.locked=!o.locked;save();render()});
}
function renderPageLibrary(){
 $("#library").innerHTML=`<h3>Pages</h3><p>Organize multiple screens in one project.</p><button id="addPage" style="width:100%;margin-bottom:10px">＋ New Page</button><div>${state.pages.map(p=>`<div class="page-row ${p.id===state.pageId?"active":""}" data-page="${p.id}"><span>▤</span><span class="layer-name">${esc(p.name)}</span><button data-page-del="${p.id}">×</button></div>`).join("")}</div>`;
 $$("#library .page-row").forEach(r=>r.onclick=e=>{if(e.target.dataset.pageDel)return;state.pageId=r.dataset.page;state.selected=null;save();render()});
 $("#addPage").onclick=()=>{saveHistory();const p=blankPage(uid(),"Page "+(state.pages.length+1));state.pages.push(p);state.pageId=p.id;state.selected=null;save();render()};
 $$("#library [data-page-del]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(state.pages.length===1)return toast("Keep at least one page");saveHistory();state.pages=state.pages.filter(p=>p.id!==b.dataset.pageDel);state.pageId=state.pages[0].id;save();render()});
}
function libraryAction(a){
 if(a==="new"){newCanvas();return} if(a==="upload"){$("#imageInput").click();return}
 if(a==="export")exportProject();if(a==="import"){$("#projectInput").click();return}
 if(a==="dark"||a==="light"){state.theme=a;applyTheme();save();render();return}
 if(a==="reset"){if(confirm("Reset this local project?")){localStorage.removeItem(KEY);location.reload()}return}
 if(["heading","subheading","body","quote","caption"].includes(a)){const cfg={heading:["Heading",48,700],subheading:["Subheading",30,650],body:["Body text",18,400],quote:["“A thoughtful interface.”",28,500],caption:["Caption",12,500]}[a];add("text",{text:cfg[0],fontSize:cfg[1],fontWeight:cfg[2],fill:"#172337"});return}
 if(a==="input"){add("shape",{name:"Input",w:300,h:48,fill:"#f8fafc",stroke:"#cbd5e1",strokeWidth:1,radius:9});return}
 if(a==="navbar"){add("shape",{name:"Navbar",x:40,y:30,w:1020,h:64,h:64,fill:"#ffffff",stroke:"#e2e8f0",strokeWidth:1,radius:12});return}
 if(a==="badge"){add("button",{name:"Badge",text:"NEW",w:80,h:30,fontSize:11,radius:999,fill:"#e8f0ff",textColor:"#3566c4"});return}
 if(["card","button","shape","circle","frame"].includes(a)){add(a);return}
 if(a.startsWith("tpl-"))template(a.slice(4));
}
function clearObjects(){currentPage().objects=[];state.selected=null}
function template(kind){
 saveHistory();clearObjects();
 const p=currentPage();
 if(kind==="landing"){p.objects.push(makeObj("text",{name:"Hero title",text:"Design without limits.",x:90,y:100,w:600,h:80,fontSize:56,fontWeight:800,fill:"#172337"}),makeObj("text",{name:"Hero copy",text:"A lightweight UI/UX workspace that runs directly in your browser.",x:94,y:195,w:510,h:65,fontSize:19,fontWeight:400,fill:"#64748b"}),makeObj("button",{x:94,y:290}),makeObj("card",{x:700,y:105,w:300,h:300,fill:"#eaf1ff"}),makeObj("card",{x:730,y:135,w:240,h:80,fill:"#ffffff"}))}
 if(kind==="dashboard"){p.objects.push(makeObj("shape",{name:"Sidebar",x:25,y:25,w:210,h:650,fill:"#101d31",radius:18}),makeObj("text",{name:"Dashboard title",text:"Overview",x:280,y:50,fontSize:38,fontWeight:800,fill:"#172337"}),makeObj("card",{name:"Revenue",x:280,y:140,w:230,h:150,fill:"#eef5ff"}),makeObj("card",{name:"Users",x:535,y:140,w:230,h:150,fill:"#f0fbf7"}),makeObj("card",{name:"Activity",x:790,y:140,w:230,h:150,fill:"#fff7e9"}))}
 if(kind==="mobile"){state.canvas={w:390,h:844,bg:"#f8fafc"};p.objects.push(makeObj("text",{name:"Mobile title",text:"Welcome back",x:28,y:70,w:330,h:55,fontSize:32,fontWeight:800,fill:"#172337"}),makeObj("card",{x:28,y:160,w:334,h:170,fill:"#e8f0ff"}),makeObj("button",{x:28,y:360,w:334}),makeObj("card",{x:28,y:445,w:334,h:110,fill:"#ffffff"}))}
 if(kind==="portfolio"){p.objects.push(makeObj("text",{text:"Creative Portfolio",x:75,y:80,w:600,h:75,fontSize:50,fontWeight:800,fill:"#172337"}),makeObj("text",{text:"Selected work • illustration • UI/UX • motion",x:80,y:165,w:500,h:35,fontSize:17,fill:"#64748b"}),makeObj("card",{x:80,y:250,w:285,h:190,fill:"#e7eef9"}),makeObj("card",{x:400,y:250,w:285,h:190,fill:"#e8f8f1"}),makeObj("card",{x:720,y:250,w:285,h:190,fill:"#fff1e7"}))}
 if(kind==="stream"){p.objects.push(makeObj("shape",{name:"Top bar",x:0,y:0,w:1100,h:70,fill:"#101828",radius:0}),makeObj("text",{text:"StreamBox",x:40,y:17,w:200,h:35,fontSize:25,fontWeight:800,fill:"#fff"}),makeObj("card",{x:45,y:110,w:300,h:190,fill:"#151f30"}),makeObj("card",{x:380,y:110,w:300,h:190,fill:"#151f30"}),makeObj("card",{x:715,y:110,w:300,h:190,fill:"#151f30"}))}
 if(kind==="shop"){p.objects.push(makeObj("text",{text:"Modern Store",x:70,y:60,w:450,h:70,fontSize:52,fontWeight:800,fill:"#172337"}),makeObj("card",{x:70,y:190,w:260,h:320,fill:"#f1f5f9"}),makeObj("card",{x:400,y:190,w:260,h:320,fill:"#eef2ff"}),makeObj("card",{x:730,y:190,w:260,h:320,fill:"#f0fdf4"}))}
 save();render();toast("Template inserted");
}
function newCanvas(){
 openModal("New Canvas",`<div class="preset-grid">${[
 ["Website",1100,700],["Landing Page",1200,800],["Desktop App",1200,760],["Mobile",390,844],["Tablet",820,1180],["Social Post",1080,1080],["Story",1080,1920],["Presentation",1920,1080],["Custom",900,600]
].map(x=>`<button class="preset" data-size="${x[1]}x${x[2]}"><b>${x[0]}</b><small>${x[1]} × ${x[2]}</small></button>`).join("")}</div>`);
 $$(".preset").forEach(b=>b.onclick=()=>{const [w,h]=b.dataset.size.split("x").map(Number);saveHistory();state.canvas={w,h,bg:"#ffffff"};clearObjects();save();closeModal();render();toast("New canvas ready")});
}
function openModal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
function exportResponsiveWebsite(){
 const p=currentPage();
 const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(state.project)}</title><style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#fff}.page{position:relative;width:100%;max-width:${state.canvas.w}px;min-height:${state.canvas.h}px;margin:auto;overflow:hidden;background:${state.canvas.bg}}.o{position:absolute}@media(max-width:1023px){.page{min-height:100vh}}@media(max-width:767px){.page{min-height:100vh}.o{max-width:100%}}</style></head><body><main class="page">${p.objects.filter(o=>!o.hidden).map(o=>{let content=o.type==="text"||o.type==="button"?esc(o.text||""):o.type==="image"&&o.src?`<img src="${o.src}" style="width:100%;height:100%;object-fit:cover">`:"";return `<div class="o" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;opacity:${o.opacity};background:${o.fill==="transparent"?"transparent":o.fill};border:${o.strokeWidth||0}px solid ${o.stroke||"transparent"};border-radius:${o.radius||0}px;filter:${o.blur?`blur(${o.blur}px)`:"none"};backdrop-filter:blur(${o.backdropBlur||0}px);font-size:${o.fontSize||16}px;font-weight:${o.fontWeight||400}px;color:${o.textColor||o.fill};display:${o.type==="button"?"flex":"block"};align-items:center;justify-content:center;padding:6px">${content}</div>`}).join("")}</main></body></html>`;
 download(new Blob([html],{type:"text/html"}),(state.project||"designforge").replace(/\W+/g,"-")+"-responsive.html");toast("Responsive website exported");
}
function exportProject(){
 const data={format:"DesignForge Project",version:9,...JSON.parse(snapshot())};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});download(blob,(state.project||"designforge").replace(/\W+/g,"-")+".designforge");toast("Project exported")}
function download(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
$("#projectInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.pages||!x.canvas)throw 0;saveHistory();Object.assign(state,x);state.selected=null;save();render();toast("Project imported")}catch{toast("Invalid project file")}};r.readAsText(f);e.target.value=""};
$("#imageInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>add("image",{src:r.result,name:f.name});r.readAsDataURL(f);e.target.value=""};

$$(".side-item").forEach(b=>b.onclick=()=>{$$(".side-item").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#library").classList.remove("open");renderLibrary()});
$("#newCanvasBtn").onclick=newCanvas;$("#modalClose").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#undoBtn").onclick=()=>{if(!history.length)return toast("Nothing to undo");future.push(snapshot());restore(history.pop())};
$("#redoBtn").onclick=()=>{if(!future.length)return toast("Nothing to redo");history.push(snapshot());restore(future.pop())};
$("#zoomIn").onclick=()=>setZoom(state.zoom+.1);$("#zoomOut").onclick=()=>setZoom(state.zoom-.1);$("#fitBtn").onclick=()=>{const v=$("#stageViewport"),sx=(v.clientWidth-70)/state.canvas.w,sy=(v.clientHeight-70)/state.canvas.h;setZoom(Math.min(sx,sy,.98))};
$("#gridBtn").onclick=()=>{state.grid=!state.grid;save();render()};$("#saveBtn").onclick=()=>{save();toast("Saved on this device")};
$("#themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";applyTheme();save();render()};
$("#responsiveBtn").onclick=()=>{const bar=document.querySelector(".device-bar");if(bar){bar.scrollIntoView({block:"nearest"});toast("Choose PC, Tablet or Phone below the toolbar")}};
$("#previewBtn").onclick=()=>{document.body.classList.toggle("preview-mode");$("#previewBtn").textContent=document.body.classList.contains("preview-mode")?"✕ Exit Preview":"▶ Preview"};
$("#exportBtn").onclick=()=>openModal("Export",`<div class="preset-grid"><button class="preset" id="exportProjectCard"><b>DesignForge Project</b><small>Editable project file</small></button><button class="preset" id="exportWebCard"><b>Responsive Website</b><small>HTML that adapts across devices</small></button></div>`);setTimeout(()=>{$("#exportProjectCard").onclick=()=>{closeModal();exportProject()};$("#exportWebCard").onclick=()=>{closeModal();exportResponsiveWebsite()}},0);$("#projectNameBtn").onclick=()=>{const n=prompt("Project name",state.project);if(n){saveHistory();state.project=n;save();toast("Project renamed")}};
$("#mobileInspectorBtn").onclick=()=>$("#inspector").classList.toggle("open");$("#closeInspector").onclick=()=>$("#inspector").classList.remove("open");
$$("[data-add]").forEach(b=>b.onclick=()=>add(b.dataset.add));
$("#moreBtn").onclick=()=>openModal("More Tools",`<div class="preset-grid"><button class="preset" onclick="document.querySelector('#imageInput').click()"><b>Upload Image</b><small>Use an image from this device</small></button><button class="preset" onclick="duplicate();closeModal()"><b>Duplicate</b><small>Copy selected object</small></button><button class="preset" onclick="removeSelected();closeModal()"><b>Delete</b><small>Remove selected object</small></button></div>`);

window.addEventListener("keydown",e=>{
 const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==="z"){e.preventDefault();$("#undoBtn").click()}else if(mod&&(e.key.toLowerCase()==="y"||e.shiftKey&&e.key.toLowerCase()==="z")){e.preventDefault();$("#redoBtn").click()}else if(mod&&e.key.toLowerCase()==="d"){e.preventDefault();duplicate()}else if(e.key==="Delete"||e.key==="Backspace"){if(document.activeElement?.tagName==="INPUT"||document.activeElement?.tagName==="TEXTAREA")return;removeSelected()}
 if(e.key==="Escape"&&document.body.classList.contains("preview-mode"))$("#previewBtn").click();
});
$("#stageViewport").addEventListener("wheel",e=>{if(e.ctrlKey){e.preventDefault();setZoom(state.zoom+(e.deltaY<0?.05:-.05))}},{passive:false});

load();render();
})();
