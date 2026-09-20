const canvas=document.getElementById("canvas");
let selected=null,drag=null,history=[];

function snap(){history.push(canvas.innerHTML);if(history.length>25)history.shift()}
function add(cls,text){
 snap();const e=document.createElement("div");e.className="element "+cls;e.textContent=text||"New element";
 e.style.left="50px";e.style.top=(canvas.children.length*15+60)+"px";
 if(cls==="card"){e.style.width="250px";e.style.height="125px";e.style.padding="20px";e.style.background="#f4f5ed";e.style.borderRadius="24px"}
 if(cls==="button"){e.style.padding="12px 20px";e.style.background="var(--mint)";e.style.color="#173735";e.style.borderRadius="99px";e.style.fontWeight="800"}
 if(cls==="shape"){e.style.width="180px";e.style.height="120px";e.style.background="linear-gradient(135deg,#b8e5dd,#9bcfe2)";e.style.borderRadius="45px"}
 if(cls==="image"){e.style.width="230px";e.style.height="150px";e.style.borderRadius="24px";e.style.background="linear-gradient(135deg,#f1d4c5,#9bd8cf,#9bcfe2)"}
 if(cls==="text"){e.style.fontSize="24px";e.style.fontWeight="800"}
 canvas.appendChild(e);bind(e);select(e)
}
function addText(){add("text","Your heading")}
function addCard(){add("card","Card content")}
function addButton(){add("button","Explore")}
function addShape(){add("shape","")}
function addImage(){add("image","")}
function bind(e){e.addEventListener("pointerdown",start)}
function start(ev){
 ev.preventDefault();select(this);const r=this.getBoundingClientRect(),cr=canvas.getBoundingClientRect();
 drag={e:this,ox:ev.clientX-r.left,oy:ev.clientY-r.top};this.setPointerCapture(ev.pointerId);this.onpointermove=move;this.onpointerup=end
}
function move(ev){if(!drag)return;const r=canvas.getBoundingClientRect();drag.e.style.left=Math.max(0,ev.clientX-r.left-drag.ox)+"px";drag.e.style.top=Math.max(0,ev.clientY-r.top-drag.oy)+"px"}
function end(){drag=null;this.onpointermove=null;this.onpointerup=null}
function select(e){if(selected)selected.classList.remove("selected");selected=e;e.classList.add("selected");renderLayers()}
function renderLayers(){const box=document.getElementById("layerList");box.innerHTML="";[...canvas.children].forEach((e,i)=>{const x=document.createElement("div");x.className="layer";x.textContent=(i+1)+". "+(e.textContent||e.className.split(" ")[1]);x.onclick=()=>select(e);box.appendChild(x)})}
function setTheme(v){
 document.documentElement.style.setProperty("--paper",v==="mint"?"#eef8f4":v==="peach"?"#fff0e6":v==="night"?"#20282a":"#f8f4ec");
 document.documentElement.style.setProperty("--text",v==="night"?"#eef5f2":"#253235")
}
function setAccent(v){document.documentElement.style.setProperty("--mint",v)}
function setRadius(v){document.documentElement.style.setProperty("--radius",v+"px")}
function setShadow(v){document.documentElement.style.setProperty("--shadow",v+"px");canvas.style.boxShadow=`0 ${v}px ${v*4}px rgba(64,76,73,.25)`}
function setDevice(v){canvas.classList.toggle("desktop",v==="desktop")}
function clearDesign(){if(confirm("Clear this design?")){snap();canvas.innerHTML="";renderLayers()}}
function saveDesign(){
 localStorage.setItem("designForgeHTML",canvas.innerHTML);
 localStorage.setItem("designForgeTheme",getComputedStyle(document.documentElement).getPropertyValue("--paper"));
 alert("Design saved in this browser.");
}
function loadDesign(){
 const html=localStorage.getItem("designForgeHTML");
 if(html){
   canvas.innerHTML=html;
   [...canvas.children].forEach(bind);
   renderLayers();
 }
}
function loadTemplate(type){
 snap();canvas.innerHTML="";
 if(type==="dashboard"){addText();addCard();addButton();addShape()}
 if(type==="mobile"){addImage();addText();addButton();addCard()}
 if(type==="landing"){addText();addImage();addButton()}
 renderLayers()
}
function togglePreview(){document.body.classList.toggle("preview")}
[...canvas.children].forEach(bind);renderLayers();
