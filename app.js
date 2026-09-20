const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const art=$("#artboard"), infinite=$("#infinite");
let selected=null, tool="select", zoom=1, id=0, undoStack=[], redoStack=[], drag=null, resizing=null;

function snapshot(){undoStack.push(art.innerHTML);if(undoStack.length>40)undoStack.shift();redoStack=[]}
function restore(html){art.innerHTML=html;bindAll();selected=null;renderLayers();updateProps()}
function bindAll(){$$(".object").forEach(e=>{e.onpointerdown=pointerDown;e.ondblclick=()=>{if(e.classList.contains("text")||e.classList.contains("button")){e.contentEditable=true;e.focus()}}})}
function makeObject(cls,x=120,y=100,w=240,h=120){
 id++;const e=document.createElement("div");e.className="object "+cls;e.dataset.id=id;
 e.style.left=x+"px";e.style.top=y+"px";e.style.width=w+"px";e.style.height=h+"px";
 if(cls==="text"){e.textContent="Your Heading";e.style.fontSize="48px";e.style.fontWeight="700";e.style.color="#20252a";e.style.height="auto";e.style.width="420px"}
 if(cls==="button")e.textContent="Get Started";
 if(cls==="frame"){e.dataset.label="Frame"}
 if(cls==="image"){e.innerHTML='<div style="height:100%;display:grid;place-items:center;color:#69747b;font-size:12px">Drop image here</div>'}
 art.appendChild(e);bindAll();select(e);return e
}
function select(e){if(selected)selected.classList.remove("selected");selected=e;if(e)e.classList.add("selected");renderLayers();updateProps()}
function pointerDown(ev){
 if(tool!=="select"){return}
 if(ev.target.classList.contains("handle"))return;
 ev.preventDefault();select(this);const r=this.getBoundingClientRect(),a=art.getBoundingClientRect();
 drag={e:this,ox:ev.clientX-r.left,oy:ev.clientY-r.top,a};this.setPointerCapture(ev.pointerId);this.onpointermove=moveDrag;this.onpointerup=endDrag
}
function moveDrag(ev){if(!drag)return;const a=art.getBoundingClientRect();drag.e.style.left=Math.max(0,(ev.clientX-a.left)/zoom-drag.ox/zoom)+"px";drag.e.style.top=Math.max(0,(ev.clientY-a.top)/zoom-drag.oy/zoom)+"px";updateProps()}
function endDrag(){snapshot();this.onpointermove=null;this.onpointerup=null;drag=null}
function addTool(t){
 tool=t;$$(".tool").forEach(b=>b.classList.toggle("active",b.dataset.tool===t));
 if(t==="image"){$("#imageInput").click();tool="select"}
}
$$(".tool[data-tool]").forEach(b=>b.onclick=()=>addTool(b.dataset.tool));
$("#imageInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{snapshot();const o=makeObject("image",180,150,400,260);o.innerHTML='<img src="'+reader.result+'">';bindAll()};reader.readAsDataURL(f);e.target.value=""};
function createFromTool(t){
 snapshot();
 if(t==="text")makeObject("text");
 if(t==="frame")makeObject("frame",100,100,420,300);
 if(t==="rect")makeObject("rect");
 if(t==="ellipse")makeObject("ellipse",120,120,180,180);
 if(t==="button")makeObject("button",120,120,150,48);
}
$$(".tool").forEach(b=>{if(b.dataset.tool&&b.dataset.tool!=="select"&&b.dataset.tool!=="image")b.onclick=()=>{addTool(b.dataset.tool);createFromTool(b.dataset.tool)}});
$("#addFrame").onclick=()=>{snapshot();makeObject("frame",150,120,500,350)};
function renderLayers(){const box=$("#layersList");box.innerHTML="";[...art.children].reverse().forEach((e,i)=>{const row=document.createElement("div");row.className="layer"+(e===selected?" selected":"");let n=e.dataset.label||e.textContent?.trim().slice(0,22)||e.className.split(" ")[1];row.innerHTML="<span>"+(i+1)+"</span><span>"+n+"</span><span class='eye'>●</span>";row.onclick=()=>select(e);box.appendChild(row)})}
function addHandles(){
 $$(".handle").forEach(h=>h.remove());if(!selected)return;
 ["nw","ne","sw","se"].forEach(pos=>{const h=document.createElement("i");h.className="handle "+pos;h.dataset.resize=pos;h.onpointerdown=resizeStart;selected.appendChild(h)})
}
function resizeStart(ev){ev.stopPropagation();ev.preventDefault();if(!selected)return;const r=selected.getBoundingClientRect();resizing={startX:ev.clientX,startY:ev.clientY,w:r.width/zoom,h:r.height/zoom,x:parseFloat(selected.style.left),y:parseFloat(selected.style.top),pos:this.dataset.resize};this.setPointerCapture(ev.pointerId);this.onpointermove=resizeMove;this.onpointerup=resizeEnd}
function resizeMove(ev){if(!resizing)return;let dx=(ev.clientX-resizing.startX)/zoom,dy=(ev.clientY-resizing.startY)/zoom;let w=resizing.w,h=resizing.h,x=resizing.x,y=resizing.y;if(resizing.pos.includes("e"))w=Math.max(20,w+dx);if(resizing.pos.includes("s"))h=Math.max(20,h+dy);if(resizing.pos.includes("w")){w=Math.max(20,w-dx);x+=dx}if(resizing.pos.includes("n")){h=Math.max(20,h-dy);y+=dy}selected.style.width=w+"px";selected.style.height=h+"px";selected.style.left=x+"px";selected.style.top=y+"px";updateProps()}
function resizeEnd(){snapshot();this.onpointermove=null;this.onpointerup=null;resizing=null}
function updateProps(){
 $("#emptyProps").hidden=!!selected;$("#props").hidden=!selected;if(!selected){$("#selectionInfo").textContent="Nothing selected";return}
 $("#px").value=parseInt(selected.style.left)||0;$("#py").value=parseInt(selected.style.top)||0;$("#pw").value=Math.round(selected.getBoundingClientRect().width/zoom);$("#ph").value=Math.round(selected.getBoundingClientRect().height/zoom);
 const bg=getComputedStyle(selected).backgroundColor;$("#fill").value=rgbToHex(bg);$("#opacity").value=Math.round(parseFloat(getComputedStyle(selected).opacity)*100);$("#radius").value=parseInt(getComputedStyle(selected).borderRadius)||0;
 const text=selected.classList.contains("text")||selected.classList.contains("button");$("#textProps").style.display=text?"block":"none";if(text){$("#textValue").value=selected.childNodes[0]?.textContent||"";$("#fontSize").value=parseInt(getComputedStyle(selected).fontSize);$("#fontWeight").value=getComputedStyle(selected).fontWeight;$("#textColor").value=rgbToHex(getComputedStyle(selected).color)}
 $("#selectionInfo").textContent=`${Math.round((parseFloat(selected.style.left)||0))}, ${Math.round((parseFloat(selected.style.top)||0))} • ${Math.round(selected.getBoundingClientRect().width/zoom)} × ${Math.round(selected.getBoundingClientRect().height/zoom)}`;
 addHandles()
}
function rgbToHex(s){const m=s.match(/\d+/g);return m&&m.length>=3?"#"+m.slice(0,3).map(v=>(+v).toString(16).padStart(2,"0")).join(""):"#ffffff"}
["px","py","pw","ph"].forEach(k=>$("#"+k).onchange=()=>{if(!selected)return;snapshot();const v=+$("#"+k).value;if(k==="px")selected.style.left=v+"px";if(k==="py")selected.style.top=v+"px";if(k==="pw")selected.style.width=v+"px";if(k==="ph")selected.style.height=v+"px";updateProps()});
$("#fill").onchange=e=>{if(selected){snapshot();selected.style.background=e.target.value}}
$("#opacity").oninput=e=>{if(selected)selected.style.opacity=e.target.value/100}
$("#radius").oninput=e=>{if(selected)selected.style.borderRadius=e.target.value+"px"}
$("#textValue").oninput=e=>{if(selected)selected.childNodes[0].textContent=e.target.value}
$("#fontSize").onchange=e=>{if(selected)selected.style.fontSize=e.target.value+"px"}
$("#fontWeight").onchange=e=>{if(selected)selected.style.fontWeight=e.target.value}
$("#textColor").onchange=e=>{if(selected)selected.style.color=e.target.value}
$("#deleteBtn").onclick=()=>{if(selected){snapshot();selected.remove();selected=null;renderLayers();updateProps()}}
$("#duplicateBtn").onclick=()=>{if(!selected)return;snapshot();const c=selected.cloneNode(true);c.querySelectorAll(".handle").forEach(x=>x.remove());c.style.left=(parseFloat(selected.style.left)+20)+"px";c.style.top=(parseFloat(selected.style.top)+20)+"px";art.appendChild(c);bindAll();select(c)}
$("#frontBtn").onclick=()=>{if(selected){snapshot();art.appendChild(selected);renderLayers()}}
$("#backBtn").onclick=()=>{if(selected){snapshot();art.insertBefore(selected,art.firstChild);renderLayers()}}
function doUndo(){if(!undoStack.length)return;redoStack.push(art.innerHTML);restore(undoStack.pop())}
function doRedo(){if(!redoStack.length)return;undoStack.push(art.innerHTML);restore(redoStack.pop())}
$("#undoBtn").onclick=doUndo;$("#redoBtn").onclick=doRedo;
function save(){localStorage.setItem("designforge_full",JSON.stringify({html:art.innerHTML,zoom}));alert("Design saved to this browser.")}
function load(){const d=JSON.parse(localStorage.getItem("designforge_full")||"null");if(d){art.innerHTML=d.html;zoom=d.zoom||1;applyZoom();bindAll();renderLayers();updateProps()}}
$("#saveBtn").onclick=save;
function applyZoom(){art.style.transform=`scale(${zoom})`;$("#zoomText").textContent=Math.round(zoom*100)+"%"}
$("#zoomIn").onclick=()=>{zoom=Math.min(2,zoom+.1);applyZoom()};$("#zoomOut").onclick=()=>{zoom=Math.max(.3,zoom-.1);applyZoom()};
$("#fitBtn").onclick=()=>{const r=infinite.getBoundingClientRect();zoom=Math.min((r.width-80)/1440,(r.height-120)/900);zoom=Math.max(.3,Math.min(1,zoom));applyZoom();infinite.scrollLeft=0;infinite.scrollTop=0}
$("#exportBtn").onclick=()=>$("#exportModal").classList.add("show");$("#closeExport").onclick=()=>$("#exportModal").classList.remove("show");
$("#exportJson").onclick=()=>download("designforge-project.json",JSON.stringify({html:art.innerHTML,width:1440,height:900},null,2),"application/json");
$("#exportHtml").onclick=()=>{const out=`<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#ddd}.canvas{position:relative;width:1440px;height:900px;background:#f7f3eb;overflow:hidden}.object{position:absolute;box-sizing:border-box}</style></head><body><div class="canvas">${art.innerHTML.replaceAll(/<i class="handle [^"]+"><\/i>/g,"")}</div></body></html>`;download("design.html",out,"text/html")};
function download(name,data,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
$("#clearBoard")?.addEventListener("click",()=>{});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="z"){e.preventDefault();doUndo()}if((e.ctrlKey||e.metaKey)&&e.key==="y"){e.preventDefault();doRedo()}if(e.key==="Delete"&&selected){$("#deleteBtn").click()}});
art.addEventListener("pointerdown",e=>{if(e.target===art){select(null)}});
bindAll();renderLayers();updateProps();applyZoom();
