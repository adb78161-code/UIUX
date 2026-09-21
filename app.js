const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$("#canvas"), toast=$("#toast"), fileInput=$("#fileInput");
let selected=null, zoom=1, tool="select", history=[], future=[], projectKey="designforge-v6";
let state={elements:[], canvas:{type:"Website",w:980,h:640}, grid:true, gridSize:16};

function say(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(say.t);say.t=setTimeout(()=>toast.classList.remove("show"),1600)}
function save(){localStorage.setItem(projectKey,JSON.stringify(state));$("#saveState").textContent="● Saved"}
function snapshot(){history.push(JSON.stringify(state));if(history.length>40)history.shift();future=[]}
function commit(){snapshot();save()}
function render(){
  canvas.querySelectorAll(".element").forEach(e=>e.remove());
  state.elements.forEach(e=>drawElement(e));
  canvas.style.backgroundSize=`${state.grid?state.gridSize:0}px ${state.grid?state.gridSize:0}px`;
  $("#emptyState").style.display=state.elements.length?"none":"block";
  if(selected){let el=state.elements.find(x=>x.id===selected); if(el) select(el.id); else selected=null}
}
function drawElement(e){
  let n=document.createElement(e.kind==="image"?"img":"div");
  n.className="element "+(e.kind==="text"?"el-text":"");
  if(e.kind==="shape")n.classList.add("el-shape");
  if(e.kind==="card")n.classList.add("el-card");
  if(e.kind==="button")n.classList.add("el-button");
  if(e.kind==="frame")n.classList.add("el-frame");
  if(e.kind==="image"){n.classList.add("el-image");n.src=e.src}
  n.dataset.id=e.id;n.textContent=e.text||"";
  Object.assign(n.style,{left:e.x+"px",top:e.y+"px",width:e.w+"px",height:e.h+"px",opacity:e.opacity/100,transform:`rotate(${e.rotation}deg)`,background:e.kind==="text"||e.kind==="image"||e.kind==="frame"?"":e.fill,borderWidth:e.border+"px",borderStyle:"solid",borderColor:e.borderColor||"rgba(255,255,255,.6)",borderRadius:e.radius+"px",filter:`blur(${e.blur||0}px)`,boxShadow:e.shadow?"0 16px 35px rgba(0,0,0,.22)":"none"});
  if(e.kind==="text"){n.style.color=e.color||"#fff";n.style.fontSize=(e.fontSize||26)+"px";n.style.fontWeight=e.fontWeight||600}
  n.addEventListener("pointerdown",ev=>startDrag(ev,e.id));
  canvas.appendChild(n);
}
function select(id){selected=id;$$(".element").forEach(x=>x.classList.toggle("selected",x.dataset.id==id));let e=state.elements.find(x=>x.id===id);if(!e)return;
  $("#propX").value=Math.round(e.x);$("#propY").value=Math.round(e.y);$("#propW").value=Math.round(e.w);$("#propH").value=Math.round(e.h);
  $("#opacity").value=e.opacity;$("#opacityOut").value=e.opacity+"%";$("#rotation").value=e.rotation;$("#rotationOut").value=e.rotation+"°";
  $("#fillColor").value=(e.fill||"#ffffff").startsWith("#")?e.fill:"#ffffff";$("#fillHex").value=e.fill||"#ffffff";$("#radius").value=e.radius||0;$("#borderWidth").value=e.border||0;$("#shadow").checked=!!e.shadow;$("#blur").value=e.blur||0;
}
function id(){return "e"+Date.now()+Math.random().toString(16).slice(2)}
function add(kind,opts={}){
 snapshot();
 let e={id:id(),kind,x:80+state.elements.length*18,y:80+state.elements.length*18,w:180,h:120,fill:"#ffffff",opacity:100,rotation:0,radius:24,border:0,shadow:false,blur:0,...opts};
 state.elements.push(e);selected=e.id;save();render();select(e.id);say("Added "+kind)
}
function startDrag(ev,id){
 if(tool!=="select"&&tool!=="move")return;
 ev.preventDefault();select(id);let e=state.elements.find(x=>x.id===id), sx=ev.clientX,sy=ev.clientY,ox=e.x,oy=e.y;
 const move=ev2=>{e.x=ox+(ev2.clientX-sx)/zoom;e.y=oy+(ev2.clientY-sy)/zoom;render();select(id)}
 const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);save()};
 window.addEventListener("pointermove",move);window.addEventListener("pointerup",up)
}
function setProp(prop,val){if(!selected)return;let e=state.elements.find(x=>x.id===selected);if(!e)return;snapshot();e[prop]=Number(val);save();render();select(selected)}
function panel(name){
 const p=$("#panel"),title=$("#panelTitle"),body=$("#panelBody");p.classList.remove("hidden");
 title.textContent=name[0].toUpperCase()+name.slice(1);body.innerHTML="";
 let items={templates:[["Landing Page","template"],["Mobile App","template"],["Dashboard","template"],["Portfolio","template"]],elements:[["Card","card"],["Button","button"],["Shape","shape"],["Frame","frame"],["Circle","circle"]],text:[["Heading","heading"],["Body Text","body"],["Quote","quote"]],images:[["Upload Image","upload"],["Image placeholder","image"]],uploads:[["Choose an image from device","upload"]],layers:[["Layers are shown by selecting objects on canvas","info"]],settings:[["Clear canvas","clear"],["Save project","save"],["Export project","export"]]}[name]||[];
 let grid=document.createElement("div");grid.className="card-grid";
 items.forEach(([label,act])=>{let b=document.createElement("button");b.className="choice";b.textContent=label;b.onclick=()=>panelAction(act);grid.appendChild(b)});body.appendChild(grid)
}
function panelAction(a){
 if(a==="card")add("card",{text:"Card title",w:240,h:150});
 else if(a==="button")add("button",{text:"Get Started",w:150,h:48,radius:14});
 else if(a==="shape")add("shape");
 else if(a==="circle")add("shape",{w:120,h:120,radius:60,fill:"#6ed9e8"});
 else if(a==="frame")add("frame",{w:300,h:200});
 else if(a==="heading")add("text",{text:"Design your future",w:330,h:70,fontSize:38});
 else if(a==="body")add("text",{text:"Beautiful digital experiences.",w:300,h:70,fontSize:18});
 else if(a==="quote")add("text",{text:"Create. Explore. Refine.",w:300,h:70,fontSize:28,fontWeight:500});
 else if(a==="image")add("image",{w:260,h:170,src:""});
 else if(a==="upload")fileInput.click();
 else if(a==="clear"){snapshot();state.elements=[];selected=null;save();render();say("Canvas cleared")}
 else if(a==="save"){save();say("Project saved")}
 else if(a==="export")exportProject();
}
function exportProject(){
 const data=JSON.stringify(state,null,2), blob=new Blob([data],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="designforge-project.json";a.click();URL.revokeObjectURL(a.href);say("Project exported")
}
function undo(){if(!history.length)return;future.push(JSON.stringify(state));state=JSON.parse(history.pop());selected=null;save();render();say("Undo")}
function redo(){if(!future.length)return;history.push(JSON.stringify(state));state=JSON.parse(future.pop());save();render();say("Redo")}
function setZoom(v){zoom=Math.max(.5,Math.min(2,v));canvas.style.transform=`scale(${zoom})`;canvas.style.transformOrigin="center center";$("#zoomLabel").textContent=Math.round(zoom*100)+"%"}
function template(type){snapshot();state.elements=[];if(type==="Landing Page"){state.elements=[{id:id(),kind:"card",x:50,y:45,w:880,h:500,fill:"rgba(255,255,255,.55)",opacity:100,rotation:0,radius:35,border:1,shadow:true,blur:0,text:""},{id:id(),kind:"text",x:100,y:120,w:500,h:130,fill:"#fff",opacity:100,rotation:0,radius:0,border:0,shadow:false,blur:0,text:"Build beautiful digital experiences.",fontSize:46},{id:id(),kind:"button",x:100,y:285,w:150,h:48,fill:"#fff",opacity:100,rotation:0,radius:14,border:0,shadow:true,blur:0,text:"Get Started"}]}render();save();say("Landing page template added")}
$$(".nav").forEach(b=>b.onclick=()=>{ $$(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");panel(b.dataset.panel)});
$$(".tool").forEach(b=>b.onclick=()=>{tool=b.dataset.tool;$$(".tool").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(tool==="text")add("text",{text:"Your text",w:220,h:55,fontSize:28});if(tool==="shape")add("shape");if(tool==="image")fileInput.click();if(tool==="frame")add("frame")});
$("#closePanel").onclick=()=>$("#panel").classList.add("hidden");
$("#newCanvas").onclick=()=>{let type=prompt("Canvas type: Website, Mobile, Tablet, Social, Story, Presentation","Website");if(type){state.elements=[];state.canvas.type=type;selected=null;commit();render();say(type+" canvas created")}};
$("#canvasType").onclick=()=>$("#newCanvas").click();
$("#duplicate").onclick=()=>{if(!selected)return;let e=state.elements.find(x=>x.id===selected);if(e){snapshot();let c=JSON.parse(JSON.stringify(e));c.id=id();c.x+=24;c.y+=24;state.elements.push(c);selected=c.id;save();render();select(c.id)}};
$("#delete").onclick=()=>{if(!selected)return;snapshot();state.elements=state.elements.filter(x=>x.id!==selected);selected=null;save();render();say("Layer deleted")};
$("#opacity").oninput=e=>{if(selected){let x=state.elements.find(a=>a.id===selected);x.opacity=+e.target.value;$("#opacityOut").value=x.opacity+"%";render();select(selected);save()}};
$("#rotation").oninput=e=>{if(selected){let x=state.elements.find(a=>a.id===selected);x.rotation=+e.target.value;$("#rotationOut").value=x.rotation+"°";render();select(selected);save()}};
$("#fillColor").oninput=e=>{if(selected){let x=state.elements.find(a=>a.id===selected);x.fill=e.target.value;$("#fillHex").value=x.fill;render();select(selected);save()}};
$("#fillHex").onchange=e=>{if(/^#[0-9a-f]{6}$/i.test(e.target.value)&&selected){state.elements.find(a=>a.id===selected).fill=e.target.value;save();render();select(selected)}};
$("#radius").oninput=e=>setProp("radius",e.target.value);$("#borderWidth").oninput=e=>setProp("border",e.target.value);$("#blur").oninput=e=>setProp("blur",e.target.value);
$("#shadow").onchange=e=>{if(selected){state.elements.find(a=>a.id===selected).shadow=e.target.checked;save();render();select(selected)}};
["propX","propY","propW","propH"].forEach((id,i)=>$("#"+id).onchange=e=>setProp(["x","y","w","h"][i],e.target.value));
$$(".aligns button").forEach(b=>b.onclick=()=>{if(!selected)return;let e=state.elements.find(x=>x.id===selected);snapshot();if(b.dataset.align==="left")e.x=0;if(b.dataset.align==="top")e.y=0;if(b.dataset.align==="center")e.x=(canvas.clientWidth-e.w)/2;if(b.dataset.align==="middle")e.y=(canvas.clientHeight-e.h)/2;if(b.dataset.align==="right")e.x=canvas.clientWidth-e.w;if(b.dataset.align==="bottom")e.y=canvas.clientHeight-e.h;save();render();select(selected)});
$("#gridToggle").onchange=e=>{state.grid=e.target.checked;save();render()};$("#gridSize").onchange=e=>{state.gridSize=parseInt(e.target.value);save();render()};
$("#zoomIn").onclick=()=>setZoom(zoom+.1);$("#zoomOut").onclick=()=>setZoom(zoom-.1);$("#zoomBtn").onclick=()=>setZoom(zoom===1?1.25:1);
$("[data-action=undo]").onclick=undo;$("[data-action=redo]").onclick=redo;$("[data-action=export]").onclick=exportProject;$("[data-action=theme]").onclick=()=>document.documentElement.classList.toggle("dark");
$("[data-action=grid]").onclick=()=>$("#gridToggle").click();$("[data-action=preview]").onclick=()=>say("Preview mode — select device below");
$$("[data-device]").forEach(b=>b.onclick=()=>{let d=b.dataset.device;$$("[data-device]").forEach(x=>x.classList.remove("active"));b.classList.add("active");canvas.style.aspectRatio=d==="mobile"?"9/16":d==="tablet"?"4/3":"16/10";canvas.style.maxWidth=d==="mobile"?"430px":d==="tablet"?"760px":"980px"});
fileInput.onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>add("image",{src:r.result,w:280,h:180});r.readAsDataURL(f);e.target.value=""};
$("#projectName").onchange=e=>{state.name=e.target.value;save()};$("#helpBtn").onclick=()=>say("Tip: use the left tools, drag objects, and edit properties on the right.");
window.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key==="z"){e.preventDefault();undo()}if((e.ctrlKey||e.metaKey)&&e.key==="y"){e.preventDefault();redo()}if(e.key==="Delete"&&selected)$("#delete").click()};
try{let s=localStorage.getItem(projectKey);if(s)state=JSON.parse(s)}catch{}render();setZoom(1);
