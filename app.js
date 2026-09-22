(() => {
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="designforge-v11";
const uid=()=>Math.random().toString(36).slice(2,10);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const hex=v=>/^#[0-9a-f]{6}$/i.test(v||"")?v:"#4e8cff";

const state={
 project:"Untitled Project",theme:"dark",grid:false,zoom:1,device:"desktop",tool:"select",touchMode:true,panMode:false,
 canvas:{w:1100,h:700,bg:"#ffffff"},
 pages:[{id:"home",name:"Home",objects:[]}],pageId:"home",
 logo:"logo.png"
};
let history=[],future=[],drag=null,resizing=null,rotating=null,skipSave=false;

const devices={
 desktop:{w:1440,h:900,label:"PC"},
 tablet:{w:768,h:1024,label:"Tablet"},
 mobile:{w:390,h:844,label:"Phone"}
};

function page(){return state.pages.find(p=>p.id===state.pageId)||state.pages[0]}
function selected(){return page().objects.find(o=>o.id===state.selected)}
function snap(){return JSON.stringify({project:state.project,theme:state.theme,grid:state.grid,canvas:state.canvas,pages:state.pages,pageId:state.pageId,logo:state.logo})}
function save(){try{localStorage.setItem(KEY,snap())}catch{}}
function historyPush(){history.push(snap());if(history.length>80)history.shift();future=[]}
function load(){
 try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&Array.isArray(x.pages)&&x.canvas)Object.assign(state,x)}
 catch{localStorage.removeItem(KEY)}
 document.body.classList.toggle("light",state.theme==="light");
}
function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1600)}
function download(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),800)}
function object(type,o={}){
 const b={id:uid(),type,name:o.name||type,x:o.x??80,y:o.y??80,w:o.w??220,h:o.h??100,rotation:o.rotation??0,opacity:o.opacity??1,
 fill:o.fill??"#4e8cff",stroke:o.stroke??"transparent",strokeWidth:o.strokeWidth??0,radius:o.radius??12,shadow:o.shadow??true,
 blur:o.blur??0,backdropBlur:o.backdropBlur??0,locked:false,hidden:false,visible:true,
 text:o.text||"",textColor:o.textColor||"#ffffff",fontSize:o.fontSize||16,fontWeight:o.fontWeight||600,align:o.align||"left",
 src:o.src||"",responsive:o.responsive||{desktop:{},tablet:{},mobile:{}},...o};
 return b;
}
function add(type,o={}){
 historyPush();const n=object(type,o);page().objects.push(n);state.selected=n.id;save();render();toast("Layer added");return n;
}
function addText(){add("text",{name:"Text",text:"Double-click to edit",w:340,h:65,fontSize:36,fontWeight:700,fill:"#172337"})}
function addShape(){add("shape",{name:"Shape",w:200,h:130,fill:"#4e8cff"})}
function addCard(){add("card",{name:"Card",w:280,h:180,fill:"#ffffff",stroke:"#d9e2ed",strokeWidth:1,radius:18})}
function addButton(){add("button",{name:"Button",text:"Get Started",w:180,h:50,fill:"#3b82f6",textColor:"#fff",fontSize:16,radius:12})}
function addFrame(){add("frame",{name:"Frame",w:500,h:320,fill:"transparent",stroke:"#3b82f6",strokeWidth:2,radius:8})}
function addLayer(){
 openModal("New Layer",`<div class="presetgrid">
 <button class="preset" data-layer="text"><b>Text</b><small>Editable typography</small></button>
 <button class="preset" data-layer="shape"><b>Shape</b><small>Rectangle / visual shape</small></button>
 <button class="preset" data-layer="card"><b>Card</b><small>Container component</small></button>
 <button class="preset" data-layer="button"><b>Button</b><small>Interactive UI button</small></button>
 <button class="preset" data-layer="frame"><b>Frame</b><small>Responsive frame</small></button>
 <button class="preset" data-layer="image"><b>Image</b><small>Upload an image</small></button>
 </div>`);
 $$(".preset[data-layer]").forEach(b=>b.onclick=()=>{closeModal();if(b.dataset.layer==="text")addText();else if(b.dataset.layer==="shape")addShape();else if(b.dataset.layer==="card")addCard();else if(b.dataset.layer==="button")addButton();else if(b.dataset.layer==="frame")addFrame();else $("#imageInput").click()});
}
function applyResponsive(o){
 const r=o.responsive?.[state.device]||{};
 if(r.w)o.w=r.w;if(r.h)o.h=r.h;if(r.x!==undefined)o.x=r.x;if(r.y!==undefined)o.y=r.y;if(r.fontSize)o.fontSize=r.fontSize;
}
function render(){
 const p=page();
 $("#pageName").textContent=p.name;
 $("#canvas").style.width=state.canvas.w+"px";$("#canvas").style.height=state.canvas.h+"px";$("#canvas").style.background=state.canvas.bg;$("#canvas").classList.toggle("grid",state.grid);
 $("#canvasShell").style.width=state.canvas.w+"px";$("#canvasShell").style.height=state.canvas.h+"px";$("#canvasShell").style.transform=`scale(${state.zoom})`;
 $("#deviceSize").textContent=`${state.canvas.w} × ${state.canvas.h}`;
 const root=$("#objects");root.innerHTML="";
 p.objects.forEach(o=>{if(o.hidden)return;applyResponsive(o);root.appendChild(renderObject(o))});
 renderInspector();renderLibrary();updateDeviceButtons();
}
function renderObject(o){
 const el=document.createElement("div");el.className="obj"+(o.id===state.selected?" selected":"")+(o.locked?" locked":"");el.dataset.id=o.id;
 Object.assign(el.style,{left:o.x+"px",top:o.y+"px",width:o.w+"px",height:o.h+"px",opacity:o.opacity,transform:`rotate(${o.rotation}deg)`,
 background:o.fill==="transparent"?"transparent":o.fill,border:`${o.strokeWidth}px solid ${o.stroke||"transparent"}`,borderRadius:o.radius+"px",
 boxShadow:o.shadow?"0 12px 30px #102a451f":"none",filter:o.blur?`blur(${o.blur}px)`:"none",backdropFilter:o.backdropBlur?`blur(${o.backdropBlur}px)`:"none",WebkitBackdropFilter:o.backdropBlur?`blur(${o.backdropBlur}px)`:"none"});
 if(o.type==="text"||o.type==="button"){
   el.classList.add("textobj");el.textContent=o.text;el.style.color=o.type==="button"?o.textColor:o.fill;el.style.fontSize=o.fontSize+"px";el.style.fontWeight=o.fontWeight;el.style.textAlign=o.align;el.style.lineHeight="1.12";el.style.padding=o.type==="button"?"0 14px":"4px 6px";
   if(o.type==="button"){el.style.display="flex";el.style.alignItems="center";el.style.justifyContent="center"}
 }
 if(o.type==="card")el.innerHTML=`<div style="padding:18px;color:#172337;font-weight:700">Card</div>`;
 if(o.type==="image")el.innerHTML=o.src?`<img class="imageobj" src="${o.src}">`:`<div style="height:100%;display:grid;place-items:center;color:#64748b;font-size:12px">＋ Upload image</div>`;
 if(o.type==="frame")el.innerHTML="<div class='frameobj'></div>";
 if(o.type==="shape")el.setAttribute("aria-label","Shape");
 ["nw","n","ne","e","se","s","sw","w"].forEach(h=>{const q=document.createElement("span");q.className="handle "+h;q.dataset.handle=h;el.appendChild(q)});
 const rr=document.createElement("span");rr.className="handle rotate";rr.dataset.handle="rotate";el.appendChild(rr);
 const line=document.createElement("span");line.className="rotate-line";el.appendChild(line);
 el.addEventListener("pointerdown",pointerDown);el.addEventListener("dblclick",()=>{if(o.type==="text"||o.type==="button"){const v=prompt("Edit text",o.text);if(v!==null){historyPush();o.text=v;save();render()}}});
 return el;
}
function canvasPoint(e){const rect=$("#canvas").getBoundingClientRect();return{x:(e.clientX-rect.left)/state.zoom,y:(e.clientY-rect.top)/state.zoom}}
function pointerDown(e){
 const el=e.currentTarget,o=page().objects.find(x=>x.id===el.dataset.id);if(!o||state.tool!=="select"||state.panMode)return;
 e.preventDefault();state.selected=o.id;if(o.locked)return toast("Layer is locked");
 const h=e.target.dataset.handle,p=canvasPoint(e);
 if(h==="rotate"){historyPush();rotating={o,cx:o.x+o.w/2,cy:o.y+o.h/2}}
 else if(h){historyPush();resizing={o,h,x:o.x,y:o.y,w:o.w,hgt:o.h,p0:p}}
 else{historyPush();drag={o,dx:p.x-o.x,dy:p.y-o.y}}
 renderSelectionOnly();renderInspector();
}
function updateInteraction(e){
 if(!drag&&!resizing&&!rotating)return;e.preventDefault();const p=canvasPoint(e);
 if(drag){drag.o.x=clamp(p.x-drag.dx,0,state.canvas.w-drag.o.w);drag.o.y=clamp(p.y-drag.dy,0,state.canvas.h-drag.o.h)}
 else if(resizing){
  const r=resizing,dx=p.x-r.p0.x,dy=p.y-r.p0.y;let x=r.x,y=r.y,w=r.w,h=r.hgt,min=24;
  if(r.h.includes("e"))w=r.w+dx;if(r.h.includes("s"))h=r.hgt+dy;if(r.h.includes("w")){w=r.w-dx;x=r.x+dx}if(r.h.includes("n")){h=r.hgt-dy;y=r.y+dy}
  if(w<min){if(r.h.includes("w"))x=r.x+r.w-min;w=min}if(h<min){if(r.h.includes("n"))y=r.y+r.hgt-min;h=min}
  r.o.x=clamp(x,0,state.canvas.w-min);r.o.y=clamp(y,0,state.canvas.h-min);r.o.w=Math.min(Math.max(min,w),state.canvas.w-r.o.x);r.o.h=Math.min(Math.max(min,h),state.canvas.h-r.o.y)
 }else{
  let deg=Math.atan2(p.y-rotating.cy,p.x-rotating.cx)*180/Math.PI+90;if(deg<0)deg+=360;if(e.shiftKey)deg=Math.round(deg/15)*15;rotating.o.rotation=Math.round(deg)%360
 }
 renderCanvasObjectsOnly();
}
function finishInteraction(){if(drag||resizing||rotating){save();drag=resizing=rotating=null;render()}}
function renderSelectionOnly(){$$("#objects .obj").forEach(x=>x.classList.toggle("selected",x.dataset.id===state.selected))}
function renderCanvasObjectsOnly(){page().objects.forEach(o=>{const el=$("#objects").querySelector(`[data-id="${o.id}"]`);if(!el)return;el.style.left=o.x+"px";el.style.top=o.y+"px";el.style.width=o.w+"px";el.style.height=o.h+"px";el.style.transform=`rotate(${o.rotation}deg)`})}
window.addEventListener("pointermove",updateInteraction,{passive:false});window.addEventListener("pointerup",finishInteraction);window.addEventListener("pointercancel",finishInteraction);
let gesture=null;
function setupTouchGestures(){
 const vp=$("#viewport");
 vp.addEventListener("touchstart",e=>{if(e.touches.length===2){e.preventDefault();const a=e.touches[0],b=e.touches[1];gesture={dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),zoom:state.zoom}}else if(e.touches.length===1&&state.panMode){const t=e.touches[0];gesture={x:t.clientX,y:t.clientY,sl:vp.scrollLeft,st:vp.scrollTop}}},{passive:false});
 vp.addEventListener("touchmove",e=>{if(e.touches.length===2&&gesture){e.preventDefault();const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setZoom(clamp(gesture.zoom*(d/gesture.dist),.25,3))}else if(e.touches.length===1&&gesture&&state.panMode){e.preventDefault();const t=e.touches[0];vp.scrollLeft=gesture.sl-(t.clientX-gesture.x);vp.scrollTop=gesture.st-(t.clientY-gesture.y)}},{passive:false});
 vp.addEventListener("touchend",()=>gesture=null,{passive:true});
}
function toggleTouchMode(){state.touchMode=!state.touchMode;document.body.classList.toggle("touch-active",state.touchMode);$("#touchModeBtn").textContent=state.touchMode?"☝ Touch":"⌁ Mouse";save();toast(state.touchMode?"Touch handles enlarged":"Standard handles")}
function togglePan(){state.panMode=!state.panMode;document.body.classList.toggle("pan-mode",state.panMode);toast(state.panMode?"Pan mode enabled":"Pan mode disabled")}
function mobileMenu(){
 openModal("Touch Controls",`<div class="mobile-menu-card"><button id="mAdd">＋ New Layer</button><button id="mZoom">＋ Zoom</button><button id="mFit">Fit Canvas</button><button id="mPan">✋ Pan Canvas</button><button id="mDevices">▣ Devices</button><button id="mExport">⇩ Export</button></div>`);
 $("#mAdd").onclick=()=>{closeModal();addLayer()};$("#mZoom").onclick=()=>{closeModal();setZoom(state.zoom+.15)};$("#mFit").onclick=()=>{closeModal();$("#fitBtn").click()};$("#mPan").onclick=()=>{closeModal();togglePan()};$("#mDevices").onclick=()=>{closeModal();$("#deviceBtn").click()};$("#mExport").onclick=()=>{closeModal();exportModal()};
}
const panels={
home:{title:"Home",desc:"Start a project or continue designing.",items:[["New Canvas","Choose any width × height","new"],["Landing Page","Responsive website starter","landing"],["Dashboard","App dashboard starter","dashboard"],["Mobile App","Phone UI starter","mobile"],["Portfolio","Creative portfolio starter","portfolio"],["E-commerce","Shop starter","shop"]]},
templates:{title:"Templates",desc:"Ready-to-edit layouts.",items:[["Landing Page","Hero + CTA + cards","landing"],["Dashboard","Stats + navigation","dashboard"],["Mobile App","Mobile product screen","mobile"],["Portfolio","Creative showcase","portfolio"],["E-commerce","Product layout","shop"]]},
elements:{title:"Elements",desc:"Every element creates a real editable layer.",items:[["Text","Add editable text","text"],["Heading","Large typography","heading"],["Subheading","Supporting text","subheading"],["Body Text","Body paragraph","body"],["Card","Container card","card"],["Button","Action button","button"],["Shape","Rectangle shape","shape"],["Circle","Circle shape","circle"],["Frame","Responsive frame","frame"],["Image","Upload image","image"],["Input","Form input","input"],["Navbar","Navigation bar","navbar"]]},
layers:{title:"Layers",desc:"Manage every object on the current page.",items:[]},
pages:{title:"Pages",desc:"Create separate screens.",items:[]},
brand:{title:"Brand / Logo",desc:"Change the DesignForge logo used by this project.",items:[["Change Logo","Upload your own logo","logo"],["Reset Logo","Restore DesignForge logo","reset-logo"]]},
settings:{title:"Settings",desc:"Editor and project controls.",items:[["Dark","Dark workspace","dark"],["Light","Light workspace","light"],["Custom Canvas","Enter width and height","new"],["Export","Export project / website","export"],["Import","Import a DesignForge file","import"],["Reset","Reset local project","reset"]]}
};
function renderLibrary(){
 const key=$(".nav.active")?.dataset.panel||"home",p=panels[key];
 if(key==="layers"){renderLayers();return}if(key==="pages"){renderPages();return}
 $("#library").innerHTML=`<h3>${p.title}</h3><p>${p.desc}</p>${key==="templates"||key==="home"?`<input class="search" id="search" placeholder="Search...">`:""}<div class="libgrid">${p.items.map(x=>`<button class="libbtn" data-act="${x[2]}"><b>${x[0]}</b><small>${x[1]}</small></button>`).join("")}</div>`;
 $$("#library .libbtn").forEach(b=>b.onclick=()=>libraryAction(b.dataset.act));
 const s=$("#search");if(s)s.oninput=()=>{$$("#library .libbtn").forEach(b=>b.style.display=b.textContent.toLowerCase().includes(s.value.toLowerCase())?"":"none")};
}
function renderLayers(){
 const p=page();$("#library").innerHTML=`<h3>Layers</h3><p>${p.objects.length} layer${p.objects.length===1?"":"s"}</p><button class="fullbtn" id="addLayerLib">＋ New Layer</button>${[...p.objects].reverse().map(o=>`<div class="layer ${o.id===state.selected?"active":""}" data-id="${o.id}"><button class="tiny" data-eye="${o.id}">${o.hidden?"○":"●"}</button><span class="layername">${esc(o.name)}</span><button class="tiny" data-lock="${o.id}">${o.locked?"🔒":"🔓"}</button></div>`).join("")||"<div class='empty'>No layers yet.</div>"}`;
 $("#addLayerLib").onclick=addLayer;
 $$("#library .layer").forEach(r=>r.onclick=e=>{if(e.target.dataset.eye||e.target.dataset.lock)return;state.selected=r.dataset.id;render()});
 $$("#library [data-eye]").forEach(b=>b.onclick=()=>{const o=page().objects.find(x=>x.id===b.dataset.eye);if(o){historyPush();o.hidden=!o.hidden;save();render()}});
 $$("#library [data-lock]").forEach(b=>b.onclick=()=>{const o=page().objects.find(x=>x.id===b.dataset.lock);if(o){historyPush();o.locked=!o.locked;save();render()}});
}
function renderPages(){
 $("#library").innerHTML=`<h3>Pages</h3><p>Organize multiple website screens.</p><button class="fullbtn" id="addPage">＋ New Page</button>${state.pages.map(p=>`<div class="layer ${p.id===state.pageId?"active":""}" data-page="${p.id}"><span>▤</span><span class="layername">${esc(p.name)}</span><button class="tiny" data-delpage="${p.id}">×</button></div>`).join("")}`;
 $("#addPage").onclick=()=>{historyPush();const p={id:uid(),name:"Page "+(state.pages.length+1),objects:[]};state.pages.push(p);state.pageId=p.id;state.selected=null;save();render()};
 $$("#library [data-page]").forEach(r=>r.onclick=e=>{if(e.target.dataset.delpage)return;state.pageId=r.dataset.page;state.selected=null;save();render()});
 $$("#library [data-delpage]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(state.pages.length===1)return toast("Keep one page");historyPush();state.pages=state.pages.filter(p=>p.id!==b.dataset.delpage);state.pageId=state.pages[0].id;save();render()});
}
function libraryAction(a){
 if(a==="new")return newCanvas();
 if(a==="text")return addText();
 if(a==="heading")return add("text",{name:"Heading",text:"Heading",fontSize:48,fontWeight:800,fill:"#172337",w:500,h:70});
 if(a==="subheading")return add("text",{name:"Subheading",text:"Supporting text",fontSize:28,fontWeight:650,fill:"#334155",w:480,h:55});
 if(a==="body")return add("text",{name:"Body Text",text:"Write your content here.",fontSize:17,fontWeight:400,fill:"#475569",w:460,h:80});
 if(["card","button","shape","frame"].includes(a))return add(a);
 if(a==="circle")return add("shape",{name:"Circle",w:130,h:130,radius:999,fill:"#31c48d"});
 if(a==="image")return $("#imageInput").click();
 if(a==="input")return add("shape",{name:"Input",w:300,h:48,fill:"#f8fafc",stroke:"#cbd5e1",strokeWidth:1,radius:9});
 if(a==="navbar")return add("shape",{name:"Navbar",x:35,y:30,w:1030,h:65,h:65,fill:"#ffffff",stroke:"#e2e8f0",strokeWidth:1,radius:12});
 if(a==="logo")return $("#logoInput").click();
 if(a==="reset-logo"){state.logo="logo.png";$(".brand img").src=state.logo;save();toast("Logo reset");return}
 if(a==="dark"||a==="light"){state.theme=a;document.body.classList.toggle("light",a==="light");save();return}
 if(a==="export")return exportModal();
 if(a==="import")return $("#projectInput").click();
 if(a==="reset"){if(confirm("Reset local DesignForge project?")){localStorage.removeItem(KEY);location.reload()}return}
 if(["landing","dashboard","mobile","portfolio","shop"].includes(a))return template(a);
}
function template(kind){
 historyPush();const p=page();p.objects=[];
 if(kind==="landing"){p.objects=[object("text",{name:"Hero Title",text:"Design Without Limits",x:90,y:100,w:620,h:90,fontSize:58,fontWeight:800,fill:"#172337"}),object("text",{name:"Hero Copy",text:"Create beautiful responsive websites and interfaces anywhere.",x:95,y:200,w:520,h:70,fontSize:19,fontWeight:400,fill:"#64748b"}),object("button",{x:95,y:295}),object("card",{x:710,y:100,w:300,h:300,fill:"#eaf1ff"})]}
 if(kind==="dashboard"){p.objects=[object("shape",{name:"Sidebar",x:25,y:25,w:200,h:650,fill:"#101d31",radius:18}),object("text",{text:"Dashboard",x:270,y:55,w:400,h:60,fontSize:40,fontWeight:800,fill:"#172337"}),object("card",{name:"Revenue",x:270,y:150,w:220,h:150,fill:"#eef5ff"}),object("card",{name:"Users",x:515,y:150,w:220,h:150,fill:"#f0fbf7"}),object("card",{name:"Orders",x:760,y:150,w:220,h:150,fill:"#fff5e9"})]}
 if(kind==="mobile"){p.objects=[object("text",{text:"Welcome back",x:28,y:70,w:330,h:55,fontSize:32,fontWeight:800,fill:"#172337"}),object("card",{x:28,y:155,w:334,h:175,fill:"#e9f1ff"}),object("button",{x:28,y:360,w:334}),object("card",{x:28,y:440,w:334,h:110})];state.canvas={w:390,h:844,bg:"#f8fafc"}}
 if(kind==="portfolio"){p.objects=[object("text",{text:"Creative Portfolio",x:70,y:70,w:650,h:70,fontSize:50,fontWeight:800,fill:"#172337"}),object("card",{x:70,y:190,w:285,h:190,fill:"#e8eef8"}),object("card",{x:400,y:190,w:285,h:190,fill:"#eaf8f1"}),object("card",{x:730,y:190,w:285,h:190,fill:"#fff0e7"})]}
 if(kind==="shop"){p.objects=[object("text",{text:"Modern Store",x:70,y:65,w:500,h:70,fontSize:52,fontWeight:800,fill:"#172337"}),object("card",{x:70,y:190,w:260,h:320,fill:"#f1f5f9"}),object("card",{x:400,y:190,w:260,h:320,fill:"#eef2ff"}),object("card",{x:730,y:190,w:260,h:320,fill:"#f0fdf4"})]}
 state.selected=null;save();render();toast("Template ready");
}
function newCanvas(){
 openModal("New Canvas",`<div class="presetgrid"><button class="preset" data-size="1100x700"><b>Website</b><small>1100 × 700</small></button><button class="preset" data-size="1440x900"><b>Desktop</b><small>1440 × 900</small></button><button class="preset" data-size="768x1024"><b>Tablet</b><small>768 × 1024</small></button><button class="preset" data-size="390x844"><b>Phone</b><small>390 × 844</small></button><button class="preset" data-size="1080x1080"><b>Social Post</b><small>1080 × 1080</small></button><button class="preset" id="customSize"><b>Custom</b><small>Any width × height</small></button></div>`);
 $$(".preset[data-size]").forEach(b=>b.onclick=()=>{historyPush();const [w,h]=b.dataset.size.split("x").map(Number);state.canvas={w,h,bg:"#ffffff"};page().objects=[];state.selected=null;state.device="custom";save();closeModal();render();toast("Canvas created")});
 $("#customSize").onclick=()=>{openModal("Custom Canvas",`<div class="device-card"><div class="row"><div><label>Width (px)</label><input id="cw" type="number" min="50" max="10000" value="${state.canvas.w}"></div><div><label>Height (px)</label><input id="ch" type="number" min="50" max="10000" value="${state.canvas.h}"></div></div><button id="applyCustom" class="fullbtn">Create Custom Canvas</button></div>`);$("#applyCustom").onclick=()=>{const w=Number($("#cw").value),h=Number($("#ch").value);if(!Number.isFinite(w)||!Number.isFinite(h)||w<50||h<50||w>10000||h>10000)return toast("Use 50–10000 px");historyPush();state.canvas={w,h,bg:"#ffffff"};state.device="custom";page().objects=[];state.selected=null;save();closeModal();render();toast("Custom canvas ready")}}
}
function exportModal(){
 openModal("Export",`<div class="presetgrid"><button class="preset" id="ep"><b>DesignForge Project</b><small>Editable .designforge file</small></button><button class="preset" id="esvg"><b>SVG</b><small>Vector export</small></button><button class="preset" id="epng"><b>PNG</b><small>Image export</small></button><button class="preset" id="ehtml"><b>Responsive HTML</b><small>Website for PC/tablet/phone</small></button></div>`);
 $("#ep").onclick=()=>{const data={format:"DesignForge",version:12.5,...JSON.parse(snap())};download(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),safeName()+".designforge");closeModal();toast("Project exported")};
 $("#esvg").onclick=()=>{download(new Blob([makeSVG()],{type:"image/svg+xml"}),safeName()+".svg");closeModal();toast("SVG exported")};
 $("#epng").onclick=()=>exportPNG();
 $("#ehtml").onclick=()=>{download(new Blob([makeHTML()],{type:"text/html"}),safeName()+".html");closeModal();toast("Responsive HTML exported")};
}
function safeName(){return (state.project||"designforge").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"designforge"}
function makeSVG(){
 const p=page();
 const body=p.objects.filter(o=>!o.hidden).map(o=>{
  const fill=o.fill==="transparent"?"none":o.fill;
  if(o.type==="text"||o.type==="button")return `<g transform="translate(${o.x} ${o.y}) rotate(${o.rotation} ${o.w/2} ${o.h/2})"><rect width="${o.w}" height="${o.h}" rx="${o.radius}" fill="${fill}" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" opacity="${o.opacity}"/><text x="${o.w/2}" y="${o.h/2+o.fontSize/3}" text-anchor="middle" font-family="Arial" font-size="${o.fontSize}" font-weight="${o.fontWeight}" fill="${o.type==="button"?o.textColor:o.fill}">${esc(o.text)}</text></g>`;
  if(o.type==="image"&&o.src)return `<image href="${o.src}" x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" preserveAspectRatio="xMidYMid slice" opacity="${o.opacity}" transform="rotate(${o.rotation} ${o.x+o.w/2} ${o.y+o.h/2})"/>`;
  return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="${o.radius}" fill="${fill}" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" opacity="${o.opacity}" transform="rotate(${o.rotation} ${o.x+o.w/2} ${o.y+o.h/2})"/>`;
 }).join("");
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${state.canvas.w}" height="${state.canvas.h}" viewBox="0 0 ${state.canvas.w} ${state.canvas.h}"><rect width="100%" height="100%" fill="${state.canvas.bg}"/>${body}</svg>`;
}
function exportPNG(){
 const svg=makeSVG(),blob=new Blob([svg],{type:"image/svg+xml"}),url=URL.createObjectURL(blob),img=new Image();
 img.onload=()=>{const c=document.createElement("canvas");c.width=state.canvas.w;c.height=state.canvas.h;const ctx=c.getContext("2d");ctx.fillStyle=state.canvas.bg;ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);c.toBlob(b=>{download(b,safeName()+".png");URL.revokeObjectURL(url);closeModal();toast("PNG exported")},"image/png")};img.src=url;
}
function makeHTML(){
 const p=page();
 const objs=p.objects.filter(o=>!o.hidden).map(o=>{
  let content="";
  if(o.type==="text"||o.type==="button")content=esc(o.text);
  if(o.type==="image"&&o.src)content=`<img src="${o.src}" alt="" />`;
  const extra=o.type==="button"?` class="button"`:"";
  return `<div${extra} style="--x:${o.x}px;--y:${o.y}px;--w:${o.w}px;--h:${o.h}px;--fill:${o.fill};--color:${o.type==="button"?o.textColor:o.fill};--radius:${o.radius}px;--size:${o.fontSize}px;--weight:${o.fontWeight};--blur:${o.blur}px;--back:${o.backdropBlur}px;--opacity:${o.opacity};--rot:${o.rotation}deg">${content}</div>`;
 }).join("");
 return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>${esc(state.project)}</title><style>*{box-sizing:border-box}html,body{margin:0}body{font-family:Inter,Arial,sans-serif;background:#f4f7fb}.page{position:relative;width:min(100%,${state.canvas.w}px);min-height:${state.canvas.h}px;margin:auto;background:${state.canvas.bg};overflow:hidden}.page>div{position:absolute;left:var(--x);top:var(--y);width:var(--w);height:var(--h);background:var(--fill);color:var(--color);border-radius:var(--radius);font-size:var(--size);font-weight:var(--weight);opacity:var(--opacity);transform:rotate(var(--rot));filter:blur(var(--blur));backdrop-filter:blur(var(--back));-webkit-backdrop-filter:blur(var(--back));padding:6px;white-space:pre-wrap;overflow:hidden}.page img{width:100%;height:100%;object-fit:cover}.button{display:grid;place-items:center}@media(max-width:1023px){.page{min-height:100vh}}@media(max-width:767px){.page{min-height:100vh}.page>div{max-width:100vw}}@media(max-width:480px){.page{width:100%;overflow-x:hidden}}</style></head><body><main class="page">${objs}</main></body></html>`;
}
function openProjectImport(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.pages||!x.canvas)throw 0;historyPush();Object.assign(state,x);state.selected=null;save();render();toast("Project imported")}catch{toast("Invalid project file")}};r.readAsText(f);e.target.value=""}

$("#newCanvas").onclick=newCanvas;$("#newLayer").onclick=addLayer;$("#gridBtn").onclick=()=>{state.grid=!state.grid;save();render()};$("#fitBtn").onclick=()=>{const v=$("#viewport");setZoom(Math.min((v.clientWidth-50)/state.canvas.w,(v.clientHeight-50)/state.canvas.h,.98))};
$("#undoBtn").onclick=()=>{if(!history.length)return toast("Nothing to undo");future.push(snap());const x=JSON.parse(history.pop());Object.assign(state,x);save();render()};
$("#redoBtn").onclick=()=>{if(!future.length)return toast("Nothing to redo");history.push(snap());const x=JSON.parse(future.pop());Object.assign(state,x);save();render()};
$("#zoomIn").onclick=()=>setZoom(state.zoom+.1);$("#zoomOut").onclick=()=>setZoom(state.zoom-.1);
$("#themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";document.body.classList.toggle("light",state.theme==="light");save()};
$("#projectBtn").onclick=()=>{const n=prompt("Project name",state.project);if(n){historyPush();state.project=n;save();toast("Project renamed")}};
$("#homeBtn").onclick=$("#homeBrand").onclick=()=>{$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.panel==="home"));state.pageId=state.pages[0].id;state.selected=null;render();toast("Home")};
$("#previewBtn").onclick=()=>{document.body.classList.toggle("preview");$("#previewBtn").textContent=document.body.classList.contains("preview")?"✕ Exit Preview":"▶ Preview"};
$("#exportBtn").onclick=exportModal;$("#deviceBtn").onclick=()=>$("#devicebar").scrollIntoView({block:"nearest"});
$("#mobileInspector").onclick=()=>$("#inspector").classList.toggle("open");$("#closeInspector").onclick=()=>$("#inspector").classList.remove("open");
$$(".devicebar button[data-device]").forEach(b=>b.onclick=()=>{if(b.dataset.device==="custom"){openModal("Custom Device",`<div class="device-card"><div class="row"><div><label>Viewport width</label><input id="dvw" type="number" value="${state.canvas.w}"></div><div><label>Viewport height</label><input id="dvh" type="number" value="${state.canvas.h}"></div></div><button id="applyDevice" class="fullbtn">Use Custom Device</button></div>`);$("#applyDevice").onclick=()=>{const w=Number($("#dvw").value),h=Number($("#dvh").value);if(w<50||h<50)return toast("Minimum 50 px");historyPush();state.canvas.w=w;state.canvas.h=h;state.device="custom";save();closeModal();render();return} }else{historyPush();setDevice(b.dataset.device)}});
$$(".nav").forEach(b=>b.onclick=()=>{$$(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#library").classList.remove("open");renderLibrary()});
$$(".tool").forEach(b=>b.onclick=()=>{state.tool=b.dataset.tool;$$(".tool").forEach(x=>x.classList.toggle("active",x===b));if(state.tool==="text")addText();else if(state.tool==="shape")addShape();else if(state.tool==="card")addCard();else if(state.tool==="button")addButton();else if(state.tool==="frame")addFrame();else if(state.tool==="image")$("#imageInput").click();state.tool="select"});
$("#moreTools").onclick=()=>addLayer();
$("#modalClose").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
$("#imageInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{add("image",{name:f.name,src:r.result,w:320,h:220});e.target.value=""};r.readAsDataURL(f)};
$("#logoInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.logo=r.result;document.querySelector(".brand img").src=state.logo;save();render();toast("Logo changed");e.target.value=""};r.readAsDataURL(f)};
$("#projectInput").onchange=openProjectImport;
$("#touchModeBtn").onclick=toggleTouchMode;
$("#mobileHome").onclick=()=>$("#homeBtn").click();
$("#mobileLayers").onclick=()=>{$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.panel==="layers"));renderLibrary();$("#library").classList.add("open")};
$("#mobileAdd").onclick=addLayer;
$("#mobilePreview").onclick=()=>$("#previewBtn").click();
$("#mobileExport").onclick=exportModal;
setupTouchGestures();
document.body.classList.toggle("touch-active",state.touchMode);
window.addEventListener("keydown",e=>{
 const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==="z"){e.preventDefault();$("#undoBtn").click()}else if(mod&&(e.key.toLowerCase()==="y"||(e.shiftKey&&e.key.toLowerCase()==="z"))){e.preventDefault();$("#redoBtn").click()}else if(mod&&e.key.toLowerCase()==="d"){e.preventDefault();duplicate()}else if(e.key==="Delete"||e.key==="Backspace"){if(!["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))deleteSelected()}else if(e.key==="Escape"&&document.body.classList.contains("preview"))$("#previewBtn").click();
});
window.addEventListener("resize",()=>{if(state.zoom>1.5)setZoom(state.zoom)});
load();render();setInterval(()=>save(),5000);
})();