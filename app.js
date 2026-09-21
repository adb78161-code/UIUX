const canvas = document.getElementById("canvas");
let history=[],redoStack=[];
let scale=1;

function saveState(){ history.push(canvas.innerHTML); }

function undo(){ if(history.length){ redoStack.push(canvas.innerHTML); canvas.innerHTML=history.pop(); } }
function redo(){ if(redoStack.length){ history.push(canvas.innerHTML); canvas.innerHTML=redoStack.pop(); } }

function addBox(){
 let d=document.createElement("div");
 d.className="obj";
 d.style.width="100px";
 d.style.height="100px";
 d.style.background="skyblue";
 d.style.left="50px";
 d.style.top="50px";
 makeDraggable(d);
 canvas.appendChild(d);
 saveState();
}

function addText(){
 let d=document.createElement("div");
 d.className="obj";
 d.contentEditable=true;
 d.innerText="Text";
 d.style.left="50px";
 d.style.top="50px";
 makeDraggable(d);
 canvas.appendChild(d);
 saveState();
}

document.getElementById("imgUpload").addEventListener("change", e=>{
 let url=URL.createObjectURL(e.target.files[0]);
 let img=document.createElement("img");
 img.src=url;
 img.className="obj";
 img.style.width="120px";
 img.style.left="50px";
 img.style.top="50px";
 makeDraggable(img);
 canvas.appendChild(img);
 saveState();
});

function makeDraggable(el){
 let offsetX,offsetY,drag=false;
 el.onmousedown=e=>{
  drag=true;
  offsetX=e.offsetX;
  offsetY=e.offsetY;
 };
 document.onmousemove=e=>{
  if(!drag)return;
  el.style.left=(e.pageX-offsetX)+"px";
  el.style.top=(e.pageY-offsetY)+"px";
 };
 document.onmouseup=()=>drag=false;
}

/* ZOOM */
function zoomIn(){ scale+=0.1; canvas.style.transform=`scale(${scale})`; }
function zoomOut(){ scale-=0.1; canvas.style.transform=`scale(${scale})`; }

/* EXPORT */
function exportPNG(){
 html2canvas(canvas).then(canvasImg=>{
  let link=document.createElement("a");
  link.download="design.png";
  link.href=canvasImg.toDataURL();
  link.click();
 });
}
