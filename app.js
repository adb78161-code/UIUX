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
/* ===== DesignForge additions: New Canvas, Layer Delete, Stickers, Templates ===== */

function openNew(){ $("newModal").classList.add("show"); }
function closeNew(){ $("newModal").classList.remove("show"); }
function closeStickers(){ $("stickerModal").classList.remove("show"); }

$("newDesign").onclick=openNew;
$("stickersBtn").onclick=()=>$("stickerModal").classList.add("show");
$("deleteTool").onclick=()=>remove();

function clearSelectionHandles(){
  document.querySelectorAll(".resize").forEach(x=>x.remove());
}

function newCanvas(w,h,name){
  snap();
  canvas.innerHTML="";
  canvas.style.width=w+"px";
  canvas.style.height=h+"px";
  canvas.classList.remove("canvas-grid");
  selected=null;
  $("docName").textContent=name;
  localStorage.removeItem("designforgeStudio");
  closeNew();
  renderLayers();
  renderProps();
  fitToNewCanvas();
}

function fitToNewCanvas(){
  const r=wrap.getBoundingClientRect();
  zoom=Math.min((r.width-100)/canvas.offsetWidth,(r.height-120)/canvas.offsetHeight);
  zoom=Math.max(.25,Math.min(1,zoom));
  zoomApply();
  wrap.scrollLeft=0;wrap.scrollTop=0;
}

function addSticker(symbol){
  snap();
  const o=document.createElement("div");
  o.className="obj sticker";
  o.dataset.name="Sticker "+symbol;
  o.textContent=symbol;
  o.style.left="300px";
  o.style.top="220px";
  o.style.width="120px";
  o.style.height="120px";
  o.style.fontSize="92px";
  o.style.color="#78cfc2";
  canvas.appendChild(o);
  bindAll();
  select(o);
  closeStickers();
}

function renderLayers(){
  layers.innerHTML="";
  [...canvas.querySelectorAll(":scope > .obj")].reverse().forEach((o,i)=>{
    const row=document.createElement("div");
    row.className="layer"+(o===selected?" selected":"");
    let n=o.dataset.name||o.textContent.trim().slice(0,24)||o.className.split(" ")[1];
    row.innerHTML='<span>'+(i+1)+'</span><span class="name">'+escapeHTML(n)+'</span><span class="eye">●</span><button class="layer-delete" title="Delete layer">×</button>';
    row.querySelector(".layer-delete").onclick=(e)=>{e.stopPropagation();if(o===selected)selected=null;snap();o.remove();renderLayers();renderProps()};
    row.onclick=()=>select(o);
    layers.appendChild(row);
  });
}

function add(type){
  snap();
  let o=document.createElement("div");
  o.className="obj "+type;
  o.style.left=(100+canvas.children.length*20)+"px";
  o.style.top=(100+canvas.children.length*20)+"px";

  if(type==="text"){
    o.textContent="Your text";
    o.style.width="300px";
    o.style.fontSize="36px";
    o.style.fontWeight="700";
    o.style.color="#20262a";
  }
  if(type==="card"){
    o.style.width="280px";o.style.height="170px";o.style.padding="22px";
    o.style.background="#f7f4eb";o.style.borderRadius="22px";
    o.innerHTML='<div class="obj text" style="left:20px;top:20px;font-size:22px;font-weight:700">Card title</div>';
  }
  if(type==="button"){o.textContent="Button";o.style.width="140px";o.style.height="46px"}
  if(type==="shape"){o.style.width="230px";o.style.height="150px"}
  if(type==="ellipse"){o.style.width="180px";o.style.height="180px"}
  if(type==="frame"){o.style.width="500px";o.style.height="350px";o.style.background="#fff";o.style.border="1px solid #ddd";o.style.borderRadius="18px"}
  if(type==="image"){o.style.width="350px";o.style.height="230px";o.style.background="#cddbd7";o.innerHTML="<span style='display:grid;place-items:center;height:100%;color:#64716d;font-size:11px'>Upload image</span>"}

  canvas.appendChild(o);
  bindAll();select(o);
}

function restoreStarter(){
  // A lightweight starter template for a newly created blank design.
  const card=document.createElement("div");
  card.className="obj card";
  card.dataset.name="Starter Card";
  card.style.left="120px";card.style.top="100px";card.style.width="420px";card.style.height="230px";
  card.style.padding="30px";
  card.innerHTML='<div class="obj text" data-name="Starter Heading" style="left:30px;top:35px;width:330px;font-size:34px;font-weight:700">Start designing.</div>';
  canvas.appendChild(card);bindAll();select(card);
}

$("save").onclick=()=>{
  localStorage.setItem("designforgeStudio",JSON.stringify({
    html:canvas.innerHTML,width:canvas.offsetWidth,height:canvas.offsetHeight,name:$("docName").textContent
  }));
  $("docName").textContent="Saved • "+$("docName").textContent.replace(/^Saved • /,"");
};

function loadSaved(){
  const raw=localStorage.getItem("designforgeStudio");
  if(!raw)return;
  try{
    const d=JSON.parse(raw);
    canvas.style.width=(d.width||1440)+"px";
    canvas.style.height=(d.height||900)+"px";
    canvas.innerHTML=d.html||"";
    $("docName").textContent=d.name||"Untitled UI Design";
    bindAll();renderLayers();renderProps();
  }catch(e){}
}

window.addEventListener("load",loadSaved);
window.addEventListener("resize",()=>{});

/* ===== DESIGNFORGE V3 ===== */
let clipboardHTML="";
function closeTemplates(){ $("templatesModal").classList.remove("show"); }
$("templatesBtn").onclick=()=>$("templatesModal").classList.add("show");
function copySelected(){if(!selected)return;let c=selected.cloneNode(true);c.querySelectorAll(".resize").forEach(x=>x.remove());clipboardHTML=c.outerHTML;}
$("copyBtn").onclick=copySelected;
$("pasteBtn").onclick=()=>{if(!clipboardHTML)return;snap();let b=document.createElement("div");b.innerHTML=clipboardHTML;let o=b.firstElementChild;o.style.left=(parseFloat(o.style.left||0)+30)+"px";o.style.top=(parseFloat(o.style.top||0)+30)+"px";canvas.appendChild(o);bindAll();select(o);};
function useTemplate(type){
 snap();canvas.innerHTML="";$("templatesModal").classList.remove("show");
 let bg=document.createElement("div");bg.className="obj frame";bg.dataset.name=type+" Template";bg.style.left="40px";bg.style.top="40px";bg.style.width=(canvas.offsetWidth-80)+"px";bg.style.height=(canvas.offsetHeight-80)+"px";bg.style.borderRadius="28px";bg.style.padding="25px";bg.style.background=type==="streaming"?"#303638":"#f5f1e8";canvas.appendChild(bg);
 const add=(cls,name,l,t,w,h,text,color)=>{let o=document.createElement("div");o.className="obj "+cls;o.dataset.name=name;o.style.left=l+"px";o.style.top=t+"px";o.style.width=w+"px";o.style.height=h+"px";if(text!==undefined)o.textContent=text;if(color)o.style.background=color;bg.appendChild(o);return o;};
 if(type==="dashboard"){let a=add("text","Title",40,35,500,55,"Your dashboard","#27312e");a.style.fontSize="42px";add("card","Stats",40,115,250,150,"","#dce9e2");add("card","Revenue",315,115,250,150,"","#ead9c9");add("card","Activity",590,115,250,150,"","#c7dfe0");add("shape","Chart",40,305,800,300,"","linear-gradient(145deg,#c9e4db,#9bcbd3)");add("card","Sidebar",880,35,310,570,"","#dce6e0");}
 else if(type==="streaming"){let a=add("text","Heading",45,45,500,90,"Discover something new","#fff");a.style.fontSize="45px";add("card","Hero",45,155,780,310,"","linear-gradient(135deg,#425a62,#9cb9b5)");add("card","Movie One",45,500,230,230,"","#718c91");add("card","Movie Two",300,500,230,230,"","#a37f70");add("card","Movie Three",555,500,230,230,"","#55747d");add("card","Queue",850,155,330,575,"","#4a5555");}
 else if(type==="portfolio"){let a=add("text","Portfolio Title",45,45,650,120,"Hello, I'm a designer.","#27312e");a.style.fontSize="62px";add("shape","Visual",690,45,450,330,"","linear-gradient(135deg,#a8d8ce,#efc8b5)");add("card","Project One",45,220,350,240,"","#d6e6df");add("card","Project Two",420,220,240,240,"","#e6c7b7");add("card","Project Three",45,490,615,210,"","#b8d5d9");}
 else {let a=add("text","Shop Heading",45,45,500,65,"New collection","#27312e");a.style.fontSize="44px";add("card","Product One",45,145,250,380,"","#d5e5df");add("card","Product Two",320,145,250,380,"","#efd2c0");add("card","Product Three",595,145,250,380,"","#b9dadd");add("card","Cart",880,45,280,480,"","#f8f5ed");}
 bindAll();renderLayers();select(bg);
}
function v3RenderLayers(){layers.innerHTML="";[...canvas.querySelectorAll(":scope > .obj")].reverse().forEach((o,i)=>{let r=document.createElement("div");r.className="layer"+(o===selected?" selected":"")+(o.dataset.locked==="1"?" locked":"")+(o.dataset.hidden==="1"?" hidden-layer":"");let n=o.dataset.name||o.textContent.trim().slice(0,24)||o.className.split(" ")[1];r.innerHTML='<span>'+(i+1)+'</span><span class="name">'+escapeHTML(n)+'</span><span class="eye">'+(o.dataset.hidden==="1"?"◌":"●")+'</span><button class="layer-delete">×</button>';r.querySelector(".layer-delete").onclick=e=>{e.stopPropagation();snap();if(o===selected)selected=null;o.remove();renderLayers();renderProps()};r.querySelector(".eye").onclick=e=>{e.stopPropagation();o.dataset.hidden=o.dataset.hidden==="1"?"0":"1";o.style.visibility=o.dataset.hidden==="1"?"hidden":"visible";renderLayers()};r.onclick=()=>select(o);layers.appendChild(r);});}
renderLayers=v3RenderLayers;
$("hideBtn").onclick=()=>{if(selected){selected.dataset.hidden=selected.dataset.hidden==="1"?"0":"1";selected.style.visibility=selected.dataset.hidden==="1"?"hidden":"visible";renderLayers();}};
$("lockBtn").onclick=()=>{if(selected){selected.dataset.locked=selected.dataset.locked==="1"?"0":"1";renderLayers();}};
$("borderColor").onchange=e=>{if(selected){snap();selected.style.borderColor=e.target.value}};
$("borderWidth").onchange=e=>{if(selected){snap();selected.style.borderStyle="solid";selected.style.borderWidth=e.target.value+"px"}};
$("shadow").onchange=e=>{if(selected){snap();selected.style.boxShadow=e.target.value==="none"?"none":e.target.value==="soft"?"0 15px 35px rgba(35,48,45,.16)":"0 25px 70px rgba(20,25,25,.28)"}};
const v3Pointer=pointerDown;pointerDown=function(e){if(this.dataset.locked==="1")return;v3Pointer.call(this,e);};
const v3Props=renderProps;renderProps=function(){v3Props();if(!selected)return;$("borderColor").value=rgb(getComputedStyle(selected).borderColor);$("borderWidth").value=parseInt(getComputedStyle(selected).borderWidth)||0;let s=getComputedStyle(selected).boxShadow;$("shadow").value=s==="none"?"none":(s.includes("70px")?"strong":"soft");};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="c"){e.preventDefault();copySelected()}if((e.ctrlKey||e.metaKey)&&e.key==="v"){e.preventDefault();$("pasteBtn").click()}if((e.ctrlKey||e.metaKey)&&e.key==="d"){e.preventDefault();duplicate()}if(e.key==="Escape")closeTemplates();});

/* DESIGNFORGE V5 UPGRADE */
function v5Close(id){document.getElementById(id)?.classList.remove('show')}
function v5Open(id){document.getElementById(id)?.classList.add('show')}
$('newDesign').onclick=()=>v5Open('v5New');$('templatesBtn').onclick=()=>v5Open('v5Templates');$('moreV5').onclick=()=>v5Open('v5More');
document.querySelectorAll('[data-v5preset]').forEach(b=>b.onclick=()=>{let v=b.dataset.v5preset;let w=1440,h=900;if(v!='blank'){[w,h]=v.split('x').map(Number)}snapshot();canvas.innerHTML='';canvas.style.width=w+'px';canvas.style.height=h+'px';$('docName').textContent='Untitled Project';$('v5stageName').textContent='Untitled Project';v5Close('v5New');selected=null;renderLayers();renderProps();toast('New '+v+' canvas')});
document.querySelectorAll('[data-v5add]').forEach(b=>b.onclick=()=>{v5Close('v5More');if(b.dataset.v5add==='sticker'){addSticker('✦')}else add(b.dataset.v5add)});
document.querySelectorAll('.v5mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.v5mode').forEach(x=>x.classList.remove('active'));b.classList.add('active');toast(b.textContent+' mode')});
document.querySelectorAll('[data-v5tpl]').forEach(b=>b.onclick=()=>{v5Close('v5Templates');let t=b.dataset.v5tpl;snapshot();canvas.innerHTML='';let bg=document.createElement('div');bg.className='obj frame';bg.dataset.name=b.textContent;bg.style.left='45px';bg.style.top='45px';bg.style.width='1350px';bg.style.height='810px';bg.style.background=t==='aurora'?'linear-gradient(135deg,#ded5f6,#a9dce9)':t==='streaming'?'#394447':t==='portfolio'?'#eee3d7':t==='shop'?'#e0eee8':t==='saas'?'#e7eaf5':'#e8e5f0';bg.style.borderRadius='28px';canvas.appendChild(bg);let mk=(type,name,x,y,w,h,txt,bgcolor)=>{let o=document.createElement('div');o.className='obj '+type;o.dataset.name=name;o.style.left=x+'px';o.style.top=y+'px';o.style.width=w+'px';o.style.height=h+'px';if(txt!==undefined)o.textContent=txt;if(bgcolor)o.style.background=bgcolor;bg.appendChild(o);return o};let title=mk('text','Heading',70,70,600,60,t==='aurora'?'Aurora Analytics':t==='streaming'?'Discover something new':t==='portfolio'?'Hello, I\'m a designer.':t==='shop'?'New collection':t==='saas'?'Build better products.':'Your dashboard');title.style.fontSize='44px';title.style.fontWeight='700';if(t==='aurora'){mk('card','Metric 1',70,165,230,135,'','#c9bdf1');mk('card','Metric 2',325,165,230,135,'','#86ddea');mk('card','Metric 3',580,165,230,135,'','#c7b7ed');mk('card','Metric 4',835,165,230,135,'','#ee9ed5');mk('shape','Analytics chart',70,335,730,300,'','linear-gradient(180deg,#7d6be466,#75dce455)');mk('card','Activity',825,335,240,300,'','#eee9ff')}else if(t==='streaming'){mk('shape','Hero',330,150,720,330,'','linear-gradient(135deg,#22303a,#7c9ca0)');mk('card','Queue',70,150,220,330,'','#697879');mk('card','Movie 1',330,520,210,220,'','#72979b');mk('card','Movie 2',565,520,210,220,'','#a17f72');mk('card','Movie 3',800,520,210,220,'','#557680')}else{mk('card','Project 1',70,210,280,250,'','#d6e6df');mk('card','Project 2',380,210,280,250,'','#e6c7b7');mk('card','Project 3',690,210,280,250,'','#b8d5d9');mk('shape','Visual',1000,210,300,500,'linear-gradient(135deg,#a7d8ce,#efc3b0)')}bindAll();select(bg);renderLayers();renderProps();hideHint()});
$('v5search').onkeydown=e=>{if(e.key==='Enter'){let q=e.target.value.toLowerCase();document.querySelectorAll('.layer').forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?'flex':'none')}};
const oldSave=$('save').onclick;$('save').onclick=()=>{localStorage.setItem('designforgeV5Project',JSON.stringify({html:canvas.innerHTML,width:canvas.offsetWidth,height:canvas.offsetHeight,name:$('docName').textContent}));toast('Project saved');if(oldSave)oldSave()};
