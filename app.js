
const $=id=>document.getElementById(id);
const canvas=$("canvas"), start=$("canvasStart"), side=$("sidePanel"), sideBody=$("sideBody"), sideTitle=$("sideTitle");
let selected=new Set(), primary=null, tool="select", history=[], future=[], oid=0, projectName="Untitled Project", resizeState=null, dragState=null;

function toast(t){$("toast").textContent=t;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1400)}
function snap(){history.push(canvas.innerHTML);if(history.length>50)history.shift();future=[]}
function bind(){canvas.querySelectorAll(".obj").forEach(o=>{if(!o.dataset.id)o.dataset.id="o"+(++oid);o.onpointerdown=pointerDown;o.ondblclick=()=>{if(o.classList.contains("text")||o.classList.contains("button")){o.contentEditable=true;o.focus()}}})}
function clearSel(){selected.forEach(o=>o.classList.remove("selected"));selected.clear();primary=null}
function select(o,add=false){if(!add)clearSel();if(!o)return;selected.add(o);primary=o;o.classList.add("selected");renderInspector()}
function pointerDown(e){
 if(tool!=="select"&&tool!=="move")return;
 if(e.target.classList.contains("resize")||this.dataset.locked==="1")return;
 e.preventDefault();select(this,e.shiftKey);
 const cr=canvas.getBoundingClientRect(),r=this.getBoundingClientRect();
 dragState={o:this,dx:e.clientX-r.left,dy:e.clientY-r.top};
 this.setPointerCapture(e.pointerId);
 this.onpointermove=ev=>{this.style.left=Math.max(0,(ev.clientX-cr.left-dragState.dx))+"px";this.style.top=Math.max(0,(ev.clientY-cr.top-dragState.dy))+"px";renderInspector()};
 this.onpointerup=()=>{snap();this.onpointermove=null;this.onpointerup=null;dragState=null;renderInspector()};
}
function add(type,opts={}){
 snap();
 const o=document.createElement("div");o.className="obj "+type;o.dataset.id="o"+(++oid);o.dataset.name=opts.name||type;
 o.style.left=(opts.x??120)+"px";o.style.top=(opts.y??100)+"px";o.style.width=(opts.w??220)+"px";o.style.height=(opts.h??120)+"px";
 if(type==="text"){o.textContent=opts.text||"Your heading";o.style.fontSize=(opts.size||34)+"px";o.style.fontWeight="700";o.style.color=opts.color||"#23343b";o.style.width=(opts.w||420)+"px"}
 if(type==="card"){o.textContent=opts.text||"Card";o.style.background=opts.bg||"rgba(255,255,255,.80)"}
 if(type==="button"){o.textContent=opts.text||"Get Started";o.style.width="150px";o.style.height="46px"}
 if(type==="shape"){o.style.background=opts.bg||"linear-gradient(135deg,#b8e6dc,#9acfe3)"}
 if(type==="circle"){o.style.width=opts.w||160+"px";o.style.height=opts.h||160+"px"}
 if(type==="frame"){o.style.background="rgba(255,255,255,.70)"}
 if(type==="sticker"){o.textContent=opts.text||"✦";o.style.width="100px";o.style.height="100px"}
 if(type==="input"){o.textContent=opts.text||"Enter text…";o.style.background="#fff";o.style.color="#77848b";o.style.padding="10px";o.style.border="1px solid #d6e0e3";o.style.borderRadius="10px"}
 if(type==="navbar"){o.textContent=opts.text||"DesignForge     Home    Work    About    Contact";o.style.background="#fff";o.style.color="#243338";o.style.padding="15px";o.style.borderRadius="13px"}
 if(type==="section"){o.style.background=opts.bg||"#dfe9e5"}
 canvas.appendChild(o);bind();select(o);hideStart();return o;
}
function image(file){
 const r=new FileReader();r.onload=ev=>{const o=add("image",{name:file.name,x:100,y:90,w:360,h:230});o.innerHTML=`<img src="${ev.target.result}" alt="">`;};r.readAsDataURL(file)
}
function hideStart(){start.style.display=canvas.querySelector(".obj")?"none":"flex"}
function remove(){if(!selected.size)return;snap();selected.forEach(o=>o.remove());clearSel();hideStart();renderInspector()}
function duplicate(){if(!primary)return;snap();const arr=[...selected];clearSel();arr.forEach(o=>{const c=o.cloneNode(true);c.dataset.id="o"+(++oid);c.style.left=(parseFloat(o.style.left)+24)+"px";c.style.top=(parseFloat(o.style.top)+24)+"px";canvas.appendChild(c);select(c,true)});bind()}
function front(){if(!primary)return;snap();canvas.appendChild(primary)}
function back(){if(!primary)return;snap();canvas.insertBefore(primary,canvas.firstChild)}
function undo(){if(!history.length)return;future.push(canvas.innerHTML);canvas.innerHTML=history.pop();clearSel();bind();hideStart();renderInspector()}
function redo(){if(!future.length)return;history.push(canvas.innerHTML);canvas.innerHTML=future.pop();clearSel();bind();hideStart();renderInspector()}

function hex(rgb){const m=(rgb||"").match(/\d+/g);if(!m)return"#ffffff";return"#"+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,"0")).join("")}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
function renderInspector(){
 const box=$("inspectorBody");
 if(!primary){box.innerHTML='<div class="empty-inspector">Select an object on the canvas to edit its position, size, appearance, typography and layers.</div>';return}
 const s=getComputedStyle(primary),x=parseFloat(primary.style.left)||0,y=parseFloat(primary.style.top)||0,w=parseFloat(primary.style.width)||primary.offsetWidth,h=parseFloat(primary.style.height)||primary.offsetHeight;
 box.innerHTML=`
 <section class="prop"><div class="prop-title">POSITION <span>⌄</span></div>
 <div class="fields"><div class="field"><label>X</label><input id="x" type="number" value="${Math.round(x)}"></div><div class="field"><label>Y</label><input id="y" type="number" value="${Math.round(y)}"></div></div>
 <div class="align"><button data-a="l">⇤</button><button data-a="cx">↔</button><button data-a="r">⇥</button><button data-a="t">⇡</button><button data-a="cy">↕</button><button data-a="b">⇣</button></div></section>
 <section class="prop"><div class="prop-title">SIZE <span>⌄</span></div><div class="fields"><div class="field"><label>W</label><input id="w" type="number" value="${Math.round(w)}"></div><div class="field"><label>H</label><input id="h" type="number" value="${Math.round(h)}"></div></div></section>
 <section class="prop"><div class="prop-title">APPEARANCE <span>⌄</span></div>
 <div class="field"><label>Opacity</label><div class="range"><input id="opacity" type="range" min="0" max="100" value="${Math.round((parseFloat(s.opacity)||1)*100)}"><span class="value" id="ov">${Math.round((parseFloat(s.opacity)||1)*100)}%</span></div></div>
 <div class="field" style="margin-top:10px"><label>Rotation</label><div class="range"><input id="rotation" type="range" min="-180" max="180" value="${primary.dataset.rot||0}"><span class="value" id="rv">${primary.dataset.rot||0}°</span></div></div></section>
 <section class="prop"><div class="prop-title">FILL <span>＋</span></div><div class="color"><input id="color" type="color" value="${hex(s.backgroundColor)}"><input id="hex" type="text" value="${hex(s.backgroundColor)}"></div></section>
 <section class="prop"><div class="prop-title">BORDER <span>›</span></div><div class="fields"><div class="field"><label>Width</label><input id="border" type="number" value="${parseInt(s.borderWidth)||0}"></div><div class="field"><label>Radius</label><input id="radius" type="number" value="${parseInt(s.borderRadius)||0}"></div></div></section>
 <section class="prop" ${(primary.classList.contains("text")||primary.classList.contains("button"))?"":"hidden"}>
 <div class="prop-title">TYPOGRAPHY <span>⌄</span></div><div class="field"><label>Text</label><input id="text" value="${esc(primary.textContent)}"></div>
 <div class="fields" style="margin-top:7px"><div class="field"><label>Font</label><input id="fontSize" type="number" value="${parseInt(s.fontSize)||16}"></div><div class="field"><label>Weight</label><select id="weight"><option>400</option><option>500</option><option>600</option><option selected>700</option><option>800</option></select></div></div></section>
 <section class="prop"><button class="action" id="duplicate">Duplicate</button><button class="action" id="front">Bring to front</button><button class="action" id="back">Send to back</button><button class="action" id="delete">Delete</button></section>`;
 const set=(id,fn,ev="change")=>$(id)?.addEventListener(ev,fn);
 set("x",e=>primary.style.left=e.target.value+"px");set("y",e=>primary.style.top=e.target.value+"px");set("w",e=>primary.style.width=e.target.value+"px");set("h",e=>primary.style.height=e.target.value+"px");
 set("opacity",e=>{primary.style.opacity=e.target.value/100;$("ov").textContent=e.target.value+"%"},"input");
 set("rotation",e=>{primary.dataset.rot=e.target.value;primary.style.transform=`rotate(${e.target.value}deg)`;$("rv").textContent=e.target.value+"°"},"input");
 set("color",e=>primary.style.background=e.target.value);set("hex",e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value))primary.style.background=e.target.value});
 set("border",e=>{primary.style.borderStyle="solid";primary.style.borderWidth=e.target.value+"px"});set("radius",e=>primary.style.borderRadius=e.target.value+"px");
 set("text",e=>primary.textContent=e.target.value);set("fontSize",e=>primary.style.fontSize=e.target.value+"px");set("weight",e=>primary.style.fontWeight=e.target.value);
 $("duplicate").onclick=duplicate;$("front").onclick=front;$("back").onclick=back;$("delete").onclick=remove;
 document.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>align(b.dataset.a));
}
function align(a){if(!primary)return;const w=primary.offsetWidth,h=primary.offsetHeight;if(a==="l")primary.style.left="20px";if(a==="r")primary.style.left=(canvas.clientWidth-w-20)+"px";if(a==="cx")primary.style.left=(canvas.clientWidth-w)/2+"px";if(a==="t")primary.style.top="20px";if(a==="b")primary.style.top=(canvas.clientHeight-h-20)+"px";if(a==="cy")primary.style.top=(canvas.clientHeight-h)/2+"px";renderInspector()}

function panel(name){
 side.classList.add("show");sideTitle.textContent=name[0].toUpperCase()+name.slice(1);
 if(name==="home")sideBody.innerHTML=`<div class="side-card"><h4>DesignForge V5</h4><p>Create website, mobile and dashboard interfaces directly on the canvas.</p><button class="side-btn primary" id="newBtn">＋ New design</button></div><div class="side-card"><h4>Quick actions</h4><p>Use the bottom toolbar to insert elements. Select any object to edit it in the right panel.</p></div>`;
 if(name==="templates")sideBody.innerHTML=`<div class="template t1" data-template="dashboard"><b>Dashboard</b></div><div class="template t2" data-template="aurora"><b>Aurora Analytics</b></div><div class="template t3" data-template="streaming"><b>Streaming</b></div><div class="template t4" data-template="portfolio"><b>Portfolio</b></div>`;
 if(name==="elements")sideBody.innerHTML=`<div class="asset-grid">${[['card','▣','Card'],['button','▰','Button'],['shape','◇','Shape'],['circle','●','Circle'],['frame','□','Frame'],['input','▭','Input'],['navbar','☰','Navbar'],['sticker','✦','Sticker']].map(a=>`<button data-add="${a[0]}">${a[1]}<small>${a[2]}</small></button>`).join("")}</div>`;
 if(name==="text")sideBody.innerHTML=`<div class="side-card"><h4>Text</h4><button class="side-btn" data-text="heading">Heading</button><button class="side-btn" data-text="sub">Subheading</button><button class="side-btn" data-text="body">Body text</button><button class="side-btn" data-text="caption">Caption</button></div>`;
 if(name==="images")sideBody.innerHTML=`<div class="upload" id="upload">▧<br><b>Add images</b>Tap here to upload.</div><div class="side-card"><p>Images can be moved, resized, rotated and styled from the Design panel.</p></div>`;
 if(name==="uploads")sideBody.innerHTML=`<div class="upload" id="upload">☁<br><b>Upload assets</b>PNG, JPG, WEBP</div><div class="asset-list" id="assetList"></div>`;
 if(name==="layers")sideBody.innerHTML=`<input id="layerSearch" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ffffff22;background:#ffffff10;color:#fff" placeholder="Search layers..."><div id="layersList">${layersHTML()}</div>`;
 if(name==="settings")sideBody.innerHTML=`<div class="side-card"><h4>Workspace</h4><button class="side-btn primary" id="newBtn">＋ New canvas</button><button class="side-btn" id="clearBtn">Clear canvas</button><button class="side-btn" id="saveBtn">Save project</button></div><div class="side-card"><h4>Background</h4><p>The supplied reference is used as the workspace visual. Your actual designs remain editable objects on the canvas.</p></div>`;
 document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>add(b.dataset.add));
 document.querySelectorAll("[data-text]").forEach(b=>b.onclick=()=>{const d={heading:["Your heading",38],sub:["A beautiful interface",24],body:["Create something meaningful.",16],caption:["Caption",11]}[b.dataset.text];add("text",{text:d[0],size:d[1]})});
 document.querySelectorAll("[data-template]").forEach(b=>b.onclick=()=>template(b.dataset.template));
 $("newBtn")?.addEventListener("click",newModal);$("clearBtn")?.addEventListener("click",()=>{snap();canvas.innerHTML="";clearSel();hideStart();renderInspector()});$("saveBtn")?.addEventListener("click",save);
 $("upload")?.addEventListener("click",()=>$("imageInput").click());
 $("layerSearch")?.addEventListener("input",e=>{document.querySelectorAll(".layer-row").forEach(r=>r.style.display=r.textContent.toLowerCase().includes(e.target.value.toLowerCase())?"flex":"none")});
}
function layersHTML(){return [...canvas.querySelectorAll(".obj")].reverse().map((o,i)=>`<div class="layer-row ${selected.has(o)?"selected":""}" data-layer="${o.dataset.id}"><span>${i+1}</span><span class="layer-name">${esc(o.dataset.name||o.textContent.slice(0,20))}</span><button data-eye="${o.dataset.id}">●</button><button data-lock="${o.dataset.id}">◇</button><button data-del="${o.dataset.id}">×</button></div>`).join("")}
side.addEventListener("click",e=>{const row=e.target.closest(".layer-row");if(!row)return;const o=canvas.querySelector(`[data-id="${row.dataset.layer}"]`);if(!o)return;if(e.target.dataset.eye){o.style.visibility=o.style.visibility==="hidden"?"visible":"hidden"}else if(e.target.dataset.lock){o.dataset.locked=o.dataset.locked==="1"?"0":"1"}else if(e.target.dataset.del){snap();o.remove()}else select(o);panel("layers")});

function template(t){snap();canvas.innerHTML="";
 const a=(type,n,x,y,w,h,bg,text,size)=>add(type,{name:n,x,y,w,h,bg,text,size});
 if(t==="dashboard"){a("text","Heading",50,45,500,60,null,"Beautiful digital experiences.",42);a("card","Card 1",50,150,240,150,"#f3eee5","Overview");a("card","Card 2",315,150,240,150,"#d8ece8","Analytics");a("shape","Chart",50,335,700,240,"linear-gradient(145deg,#b8ded6,#99cfe1)");a("card","Panel",790,45,310,530,"#ece9f8","")}
 if(t==="aurora"){a("card","Sidebar",20,20,190,700,"#453b94","");a("text","Title",240,45,500,55,null,"Aurora Analytics",38);a("card","Metric A",240,125,190,115,"#c8bdf0","$31,028");a("card","Metric B",445,125,190,115,"#86dce9","$3,280");a("card","Metric C",650,125,190,115,"#c8b6ed","$340");a("card","Metric D",855,125,190,115,"#ed9bd6","$3.75k");a("shape","Chart",240,270,610,270,"linear-gradient(180deg,#7d6ce477,#72dce255)");a("card","Activity",870,270,230,270,"#eee9ff","This month")}
 if(t==="streaming"){a("card","Shell",30,30,1100,700,"#344145","");a("shape","Hero",320,80,600,300,"linear-gradient(135deg,#1c2b37,#79999d)");a("card","Continue",70,80,220,300,"#6f7f80","Continue Watching");a("card","Movie 1",320,410,190,230,"#76979a","Movie");a("card","Movie 2",530,410,190,230,"#b58f7e","Series");a("card","Movie 3",740,410,190,230,"#57777f","Anime")}
 if(t==="portfolio"){a("text","Portfolio",60,50,520,80,null,"Design your future.",48);a("shape","Visual",600,45,450,300,"linear-gradient(135deg,#9ed7d0,#edc2ae)");a("card","Project 1",60,250,300,240,"#d6e6df","Project One");a("card","Project 2",390,250,300,240,"#e8c9b8","Project Two");a("card","Project 3",720,380,330,220,"#b8d5d9","Project Three")}
 bind();clearSel();hideStart();renderInspector();panel("home");toast("Template added")}

function newModal(){openModal(`<button class="modal-close" data-close>×</button><h2>Create a new canvas</h2><p>Choose a canvas size. Everything remains editable.</p><div class="preset-grid">${[
["website","🖥","Website","1440 × 900"],["landing","◩","Landing Page","1440 × 1024"],["mobile","📱","Mobile App","390 × 844"],["tablet","▯","Tablet","768 × 1024"],["social","◼","Social Post","1080 × 1080"],["story","▯","Story","1080 × 1920"],["presentation","▣","Presentation","1280 × 720"],["blank","＋","Blank Canvas","1440 × 900"]].map(p=>`<button class="preset" data-preset="${p[0]}"><span>${p[1]}</span><b>${p[2]}</b><small>${p[3]}</small></button>`).join("")}</div>`);document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>newCanvas(b.dataset.preset))}
function newCanvas(type){const s={website:[1440,900],landing:[1440,1024],mobile:[390,844],tablet:[768,1024],social:[1080,1080],story:[1080,1920],presentation:[1280,720],blank:[1440,900]}[type]||[1440,900];snap();canvas.innerHTML="";canvas.style.width=s[0]+"px";canvas.style.height=s[1]+"px";projectName="Untitled Project";$("projectName").textContent=projectName;closeModal();hideStart();renderInspector();toast("New canvas created")}
function openModal(html){$("modalCard").innerHTML=html;$("modal").classList.add("show");$("modalCard").querySelector("[data-close]")?.addEventListener("click",closeModal)}
function closeModal(){$("modal").classList.remove("show")}
function exportModal(){openModal(`<button class="modal-close" data-close>×</button><h2>Export</h2><p>Export the current design.</p><div class="export-grid"><button data-export="json">Project JSON</button><button data-export="html">Standalone HTML</button><button data-export="svg">SVG</button><button data-export="png">Preview / Screenshot</button></div>`);$("modalCard").querySelector("[data-close]").onclick=closeModal;document.querySelectorAll("[data-export]").forEach(b=>b.onclick=()=>exportProject(b.dataset.export))}
function download(name,data,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function exportProject(type){const c=canvas.cloneNode(true);c.querySelectorAll(".selected,.resize").forEach(x=>x.classList.remove("selected"));if(type==="json")download("designforge-v5-project.json",JSON.stringify({name:projectName,width:canvas.offsetWidth,height:canvas.offsetHeight,html:canvas.innerHTML},null,2),"application/json");if(type==="html")download("designforge-design.html",`<!doctype html><style>body{margin:0}.canvas{position:relative;width:${canvas.offsetWidth}px;height:${canvas.offsetHeight}px;overflow:hidden;background:#eef4f2}.obj{position:absolute;box-sizing:border-box}.obj.image img{width:100%;height:100%;object-fit:cover}</style><div class="canvas">${c.innerHTML}</div>`,"text/html");if(type==="svg")download("designforge-design.svg",`<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.offsetWidth}" height="${canvas.offsetHeight}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${c.innerHTML}</div></foreignObject></svg>`,"image/svg+xml");if(type==="png")toast("Open Preview and use your browser screenshot");closeModal()}
function save(){localStorage.setItem("designforge-v5-exact",JSON.stringify({name:projectName,w:canvas.offsetWidth,h:canvas.offsetHeight,html:canvas.innerHTML}));$("saved").textContent="☁ Saved";toast("Project saved")}
function load(){try{const d=JSON.parse(localStorage.getItem("designforge-v5-exact")||"null");if(d){projectName=d.name||projectName;$("projectName").textContent=projectName;canvas.style.width=d.w+"px";canvas.style.height=d.h+"px";canvas.innerHTML=d.html||"";bind();hideStart()}}catch{}}

/* Navigation */
document.querySelectorAll("[data-panel]").forEach(b=>b.onclick=()=>panel(b.dataset.panel));
$("closeSide").onclick=()=>side.classList.remove("show");
$("homeBtn").onclick=()=>panel("home");
$("projectBtn").onclick=newModal;
$("exportBtn").onclick=exportModal;
$("undoBtn").onclick=undo;$("redoBtn").onclick=redo;
$("themeBtn").onclick=()=>{document.body.classList.toggle("dim");toast("Workspace appearance changed")};
$("previewBtn").onclick=()=>{const w=window.open("","_blank");const c=canvas.cloneNode(true);c.querySelectorAll(".selected").forEach(x=>x.classList.remove("selected"));w.document.write(`<style>body{margin:0;background:#101820;display:grid;place-items:center;min-height:100vh}.canvas{position:relative;width:${canvas.offsetWidth}px;height:${canvas.offsetHeight}px;background:#eef4f2;overflow:hidden}.obj{position:absolute;box-sizing:border-box}.obj.image img{width:100%;height:100%;object-fit:cover}</style><div class="canvas">${c.innerHTML}</div>`);w.document.close();};
$("commandBtn").onclick=()=>panel("elements");
$("settingsBtn").onclick=()=>panel("settings");
$("moreTool").onclick=()=>openModal(`<button class="modal-close" data-close>×</button><h2>Insert</h2><div class="more-grid">${[
["card","▣","Card"],["button","▰","Button"],["circle","●","Circle"],["line","╱","Line"],["sticker","✦","Sticker"],["input","▭","Input"],["navbar","☰","Navbar"],["section","▤","Section"]
].map(x=>`<button data-more="${x[0]}">${x[1]}<small>${x[2]}</small></button>`).join("")}</div>`);document.querySelectorAll("[data-more]").forEach(b=>b.onclick=()=>{add(b.dataset.more);closeModal()})});
document.querySelectorAll(".tool[data-tool]").forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll(".tool").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(tool==="text")add("text");if(tool==="shape")add("shape");if(tool==="frame")add("frame");if(tool==="image")$("imageInput").click()});
$("imageInput").onchange=e=>{[...e.target.files].forEach(image);e.target.value=""};
$("gridToggle").onchange=e=>canvas.classList.toggle("grid",e.target.checked);
$("gridSize").onchange=e=>canvas.style.backgroundSize=`${e.target.value} ${e.target.value}`;
document.querySelectorAll("[data-device]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-device]").forEach(x=>x.classList.remove("active"));b.classList.add("active");const d=b.dataset.device;canvas.style.width=d==="desktop"?"900px":d==="tablet"?"620px":"330px";canvas.style.height=d==="desktop"?"560px":d==="tablet"?"620px":"600px";toast(d+" canvas")});
document.querySelectorAll("[data-inspect]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(b.dataset.inspect==="design")renderInspector();else if(b.dataset.inspect==="prototype")$("inspectorBody").innerHTML='<div class="empty-inspector"><b>Prototype</b><br><br>Select an element and add interactions, navigation or transitions.</div>';else $("inspectorBody").innerHTML='<div class="empty-inspector"><b>Comments</b><br><br>Comment tools are ready for the next collaboration update.</div>'});
document.addEventListener("keydown",e=>{const m=e.ctrlKey||e.metaKey;if(m&&e.key.toLowerCase()==="s"){e.preventDefault();save()}if(m&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo()}if(m&&e.key.toLowerCase()==="d"){e.preventDefault();duplicate()}if(e.key==="Delete"&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA")remove();if(e.key==="Escape")closeModal()});
canvas.addEventListener("click",e=>{if(e.target===canvas)clearSel()});
window.addEventListener("resize",()=>{});
load();bind();hideStart();renderInspector();
