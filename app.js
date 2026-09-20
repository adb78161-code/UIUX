const canvas=document.getElementById("canvas"),wrap=document.getElementById("wrap"),layers=document.getElementById("layerList");
let selected=null,tool="select",zoom=1,history=[],future=[],drag=null,resize=null,uid=0;
const $=id=>document.getElementById(id);

function snap(){history.push(canvas.innerHTML);if(history.length>50)history.shift();future=[]}
function bindAll(){canvas.querySelectorAll(".obj").forEach(o=>{o.onpointerdown=pointerDown;o.ondblclick=()=>{if(isText(o)){o.contentEditable=true;o.focus()}}})}
function isText(o){return o.classList.contains("text")||o.classList.contains("button")}
function select(o){if(selected)selected.classList.remove("selected");selected=o;if(o)o.classList.add("selected");renderLayers();renderProps()}
function pointerDown(e){
 if(e.target.classList.contains("resize"))return;
 if(tool!=="select")return;
 e.preventDefault();select(this);
 const r=this.getBoundingClientRect(),cr=canvas.getBoundingClientRect();
 drag={o:this,ox:e.clientX-r.left,oy:e.clientY-r.top};this.setPointerCapture(e.pointerId);this.onpointermove=move;this.onpointerup=end;
}
function move(e){if(!drag)return;const cr=canvas.getBoundingClientRect();drag.o.style.left=Math.max(0,(e.clientX-cr.left-drag.ox)/zoom)+"px";drag.o.style.top=Math.max(0,(e.clientY-cr.top-drag.oy)/zoom)+"px";renderProps()}
function end(){if(drag)snap();this.onpointermove=null;this.onpointerup=null;drag=null}
function add(type){
 snap();let o=document.createElement("div");o.className="obj "+type;o.style.left=(100+canvas.children.length*20)+"px";o.style.top=(100+canvas.children.length*20)+"px";
 if(type==="text"){o.textContent="Your text";o.style.width="300px";o.style.fontSize="36px";o.style.fontWeight="700";o.style.color="#20262a"}
 if(type==="card"){o.style.width="280px";o.style.height="170px";o.style.padding="22px";o.style.background="#f7f4eb";o.style.borderRadius="22px";o.innerHTML='<div class="obj text" style="left:20px;top:20px;font-size:22px;font-weight:700">Card title</div>'}
 if(type==="button"){o.textContent="Button";o.style.width="140px";o.style.height="46px"}
 if(type==="shape"){o.style.width="230px";o.style.height="150px"}
 if(type==="ellipse"){o.style.width="180px";o.style.height="180px"}
 if(type==="frame"){o.style.width="500px";o.style.height="350px";o.style.background="#fff";o.style.border="1px solid #ddd";o.style.borderRadius="18px"}
 if(type==="image"){o.style.width="350px";o.style.height="230px";o.style.background="#cddbd7";o.innerHTML="<span style='display:grid;place-items:center;height:100%;color:#64716d;font-size:11px'>Upload image</span>"}
 canvas.appendChild(o);bindAll();select(o)
}
document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(tool!=="select"&&tool!=="image"){add(tool);tool="select";document.querySelector('[data-tool="select"]').classList.add("active")}if(tool==="image"){$("fileInput").click();tool="select";document.querySelector('[data-tool="select"]').classList.add("active")}});
$("fileInput").onchange=e=>{let f=e.target.files[0];if(!f)return;snap();let r=new FileReader();r.onload=()=>{let o=document.createElement("div");o.className="obj image";o.style.left="150px";o.style.top="150px";o.style.width="420px";o.style.height="280px";o.innerHTML='<img src="'+r.result+'">';canvas.appendChild(o);bindAll();select(o)};r.readAsDataURL(f);e.target.value=""};
$("replaceImage").onclick=()=>{$("fileInput").click()};
function renderLayers(){
 layers.innerHTML="";
 [...canvas.querySelectorAll(":scope > .obj")].reverse().forEach((o,i)=>{let row=document.createElement("div");row.className="layer"+(o===selected?" selected":"");let n=o.dataset.name||o.textContent.trim().slice(0,24)||o.className.split(" ")[1];row.innerHTML='<span>'+(i+1)+'</span><span class="name">'+escapeHTML(n)+'</span><span class="eye">●</span>';row.onclick=()=>select(o);layers.appendChild(row)})
}
function escapeHTML(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function rgb(s){let m=s.match(/\d+/g);return m&&m.length>=3?"#"+m.slice(0,3).map(v=>(+v).toString(16).padStart(2,"0")).join(""):"#ffffff"}
function renderProps(){
 $("empty").hidden=!!selected;$("properties").hidden=!selected;
 if(!selected){$("info").textContent="Select an object";return}
 $("x").value=parseInt(selected.style.left)||0;$("y").value=parseInt(selected.style.top)||0;
 $("w").value=Math.round(selected.getBoundingClientRect().width/zoom);$("h").value=Math.round(selected.getBoundingClientRect().height/zoom);
 $("fill").value=rgb(getComputedStyle(selected).backgroundColor);$("opacity").value=Math.round(parseFloat(getComputedStyle(selected).opacity)*100);
 $("radius").value=parseInt(getComputedStyle(selected).borderRadius)||0;
 let tr=getComputedStyle(selected);$("rotation").value=(selected.dataset.rotation||0);
 $("textSection").style.display=isText(selected)?"block":"none";
 if(isText(selected)){$("text").value=selected.textContent;$("fontSize").value=parseInt(tr.fontSize);$("weight").value=tr.fontWeight;$("textColor").value=rgb(tr.color)}
 $("info").textContent=Math.round(parseInt(selected.style.left)||0)+" , "+Math.round(parseInt(selected.style.top)||0)+"   •   "+$("w").value+" × "+$("h").value;
 handles()
}
function handles(){document.querySelectorAll(".resize").forEach(x=>x.remove());if(!selected)return;["nw","ne","sw","se"].forEach(p=>{let h=document.createElement("i");h.className="resize "+p;h.dataset.pos=p;h.onpointerdown=startResize;selected.appendChild(h)})}
function startResize(e){e.stopPropagation();e.preventDefault();let r=selected.getBoundingClientRect();resize={x:e.clientX,y:e.clientY,w:r.width/zoom,h:r.height/zoom,l:parseFloat(selected.style.left),t:parseFloat(selected.style.top),p:this.dataset.pos};this.setPointerCapture(e.pointerId);this.onpointermove=resizeMove;this.onpointerup=resizeEnd}
function resizeMove(e){if(!resize)return;let dx=(e.clientX-resize.x)/zoom,dy=(e.clientY-resize.y)/zoom,w=resize.w,h=resize.h,l=resize.l,t=resize.t;if(resize.p.includes("e"))w=Math.max(20,w+dx);if(resize.p.includes("s"))h=Math.max(20,h+dy);if(resize.p.includes("w")){w=Math.max(20,w-dx);l+=dx}if(resize.p.includes("n")){h=Math.max(20,h-dy);t+=dy}selected.style.width=w+"px";selected.style.height=h+"px";selected.style.left=l+"px";selected.style.top=t+"px";renderProps()}
function resizeEnd(){snap();this.onpointermove=null;this.onpointerup=null;resize=null}
function prop(id,fn){$(id).onchange=()=>{if(selected){snap();fn()}}}
prop("x",()=>selected.style.left=$("x").value+"px");prop("y",()=>selected.style.top=$("y").value+"px");prop("w",()=>selected.style.width=$("w").value+"px");prop("h",()=>selected.style.height=$("h").value+"px");
$("fill").onchange=e=>{if(selected){snap();selected.style.background=e.target.value}};$("opacity").oninput=e=>{if(selected)selected.style.opacity=e.target.value/100};
$("radius").oninput=e=>{if(selected)selected.style.borderRadius=e.target.value+"px"};$("rotation").oninput=e=>{if(selected){selected.dataset.rotation=e.target.value;selected.style.transform="rotate("+e.target.value+"deg)"}};
$("text").oninput=e=>{if(selected)selected.textContent=e.target.value};$("fontSize").onchange=e=>{if(selected)selected.style.fontSize=e.target.value+"px"};$("weight").onchange=e=>{if(selected)selected.style.fontWeight=e.target.value};$("textColor").onchange=e=>{if(selected)selected.style.color=e.target.value};
function textAlign(a){if(selected)selected.style.textAlign=a}
function align(a){if(!selected)return;snap();let cw=canvas.clientWidth,ch=canvas.clientHeight,w=selected.offsetWidth,h=selected.offsetHeight;if(a==="left")selected.style.left="30px";if(a==="center")selected.style.left=(cw-w)/2+"px";if(a==="right")selected.style.left=(cw-w-30)+"px";if(a==="top")selected.style.top="30px";if(a==="middle")selected.style.top=(ch-h)/2+"px";if(a==="bottom")selected.style.top=(ch-h-30)+"px";renderProps()}
function remove(){if(!selected)return;snap();selected.remove();selected=null;renderLayers();renderProps()}
function duplicate(){if(!selected)return;snap();let c=selected.cloneNode(true);c.querySelectorAll(".resize").forEach(x=>x.remove());c.style.left=(parseFloat(selected.style.left)+25)+"px";c.style.top=(parseFloat(selected.style.top)+25)+"px";canvas.appendChild(c);bindAll();select(c)}
function front(){if(selected){snap();canvas.appendChild(selected);renderLayers()}}function back(){if(selected){snap();canvas.insertBefore(selected,canvas.firstElementChild);renderLayers()}}
$("undo").onclick=()=>{if(!history.length)return;future.push(canvas.innerHTML);canvas.innerHTML=history.pop();selected=null;bindAll();renderLayers();renderProps()};
$("redo").onclick=()=>{if(!future.length)return;history.push(canvas.innerHTML);canvas.innerHTML=future.pop();selected=null;bindAll();renderLayers();renderProps()};
$("gridBtn").onclick=()=>canvas.classList.toggle("canvas-grid");
function zoomApply(){canvas.style.transform="scale("+zoom+")";$("zoomText").textContent=Math.round(zoom*100)+"%"}
$("zoomIn").onclick=()=>{zoom=Math.min(2,zoom+.1);zoomApply()};$("zoomOut").onclick=()=>{zoom=Math.max(.3,zoom-.1);zoomApply()};
$("fit").onclick=()=>{let r=wrap.getBoundingClientRect();zoom=Math.min((r.width-100)/1440,(r.height-120)/900);zoom=Math.max(.3,Math.min(1,zoom));zoomApply();wrap.scrollLeft=0;wrap.scrollTop=0};
$("layerSearch").oninput=e=>{let q=e.target.value.toLowerCase();layers.querySelectorAll(".layer").forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?"flex":"none")};
$("newFrame").onclick=()=>add("frame");
$("save").onclick=()=>{localStorage.setItem("designforgeStudio",canvas.innerHTML);alert("Design saved in this browser.")};
$("export").onclick=()=>document.getElementById("exportModal").classList.add("show");
function closeExport(){$("exportModal").classList.remove("show")}
function download(name,data,type){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function exportJSON(){download("designforge-project.json",JSON.stringify({width:1440,height:900,html:canvas.innerHTML},null,2),"application/json")}
function exportHTML(){let clean=canvas.cloneNode(true);clean.querySelectorAll(".resize").forEach(x=>x.remove());let out='<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#ddd}.canvas{position:relative;width:1440px;height:900px;background:#e9e7e0;overflow:hidden}.obj{position:absolute;box-sizing:border-box}.obj.image img{width:100%;height:100%;object-fit:cover}.obj.button{display:flex;align-items:center;justify-content:center}</style></head><body><div class="canvas">'+clean.innerHTML+'</div></body></html>';download("designforge-design.html",out,"text/html")}
$("canvas");
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="z"){e.preventDefault();$("undo").click()}if((e.ctrlKey||e.metaKey)&&e.key==="y"){e.preventDefault();$("redo").click()}if(e.key==="Delete"&&selected)remove()});
canvas.addEventListener("pointerdown",e=>{if(e.target===canvas)select(null)});
bindAll();renderLayers();renderProps();zoomApply();