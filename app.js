const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$("#canvas"), toast=$("#toast"), fileInput=$("#fileInput"), inspector=$("#inspector");
let state={name:"Untitled Project",width:980,height:620,grid:true,gridSize:16,elements:[]},selected=null,history=[],future=[],zoom=1;

function notify(t){toast.textContent=t;toast.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(()=>toast.classList.remove("show"),1400)}
function save(){localStorage.setItem("designforge-v8",JSON.stringify(state));$("#projectName").value=state.name}
function snap(){history.push(JSON.stringify(state));if(history.length>50)history.shift();future=[]}
function uid(){return "e"+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function empty(){ $("#empty").style.display=state.elements.length?"none":"flex" }
function render(){
 canvas.querySelectorAll(".obj").forEach(x=>x.remove());
 canvas.style.width=state.width+"px";canvas.style.height=state.height+"px";
 canvas.style.backgroundSize=state.grid?`${state.gridSize}px ${state.gridSize}px`:"0 0";
 state.elements.forEach(draw);
 empty();if(selected)select(selected);renderInspector();
}
function draw(e){
 let el=document.createElement(e.type==="image"?"div":"div");el.className="obj "+e.cls;el.dataset.id=e.id;
 Object.assign(el.style,{left:e.x+"px",top:e.y+"px",width:e.w+"px",height:e.h+"px",opacity:e.opacity/100,transform:`rotate(${e.rotation}deg)`,borderRadius:e.radius+"px",borderWidth:e.border+"px",borderStyle:e.border?"solid":"",borderColor:e.borderColor||"#ffffff99",boxShadow:e.shadow?"0 16px 38px #001c2c35":"none",filter:`blur(${e.blur}px)`});
 if(e.type==="text"){el.classList.add("textObj");el.textContent=e.text;el.style.fontSize=e.fontSize+"px";el.style.fontWeight=e.weight;el.style.color=e.color}
 if(e.type==="card"){el.classList.add("cardObj");el.textContent=e.text}
 if(e.type==="button"){el.classList.add("buttonObj");el.textContent=e.text}
 if(e.type==="shape"){el.classList.add("shapeObj");el.style.background=e.fill}
 if(e.type==="circle"){el.classList.add("circleObj");el.style.background=e.fill}
 if(e.type==="frame"){el.classList.add("frameObj")}
 if(e.type==="image"){el.classList.add("imageObj");if(e.src){let im=document.createElement("img");im.src=e.src;el.appendChild(im)}else el.style.background=e.fill}
 el.addEventListener("pointerdown",ev=>drag(ev,e.id));canvas.appendChild(el);
}
function select(id){selected=id;$$(".obj").forEach(o=>o.classList.toggle("selected",o.dataset.id===id));}
function getSel(){return state.elements.find(e=>e.id===selected)}
function drag(ev,id){
 ev.preventDefault();select(id);let e=getSel(),sx=ev.clientX,sy=ev.clientY,ox=e.x,oy=e.y;
 const move=mv=>{e.x=ox+(mv.clientX-sx)/zoom;e.y=oy+(mv.clientY-sy)/zoom;render()};
 const up=()=>{removeEventListener("pointermove",move);removeEventListener("pointerup",up);save()};
 addEventListener("pointermove",move);addEventListener("pointerup",up);
}
function add(type,opts={}){
 snap();let e={id:uid(),type,x:70+state.elements.length*18,y:70+state.elements.length*15,w:200,h:120,opacity:100,rotation:0,radius:20,border:0,blur:0,shadow:false,fill:"#78ddd1",borderColor:"#ffffff99",text:"",fontSize:28,weight:600,color:"#203642",...opts};
 state.elements.push(e);selected=e.id;save();render();select(e.id);notify("Added "+type)
}
function panel(name){
 $("#panel").classList.remove("hidden");$("#panelTitle").textContent=name[0].toUpperCase()+name.slice(1);
 let data={
 home:[["New canvas","new"],["Quick start","info"],["Save project","save"]],
 templates:[["Landing Page","landing"],["Dashboard","dashboard"],["Mobile App","mobile"],["Portfolio","portfolio"],["Streaming UI","streaming"],["E-commerce","shop"]],
 elements:[["Card","card"],["Button","button"],["Shape","shape"],["Circle","circle"],["Frame","frame"],["Input","input"],["Navbar","navbar"],["Sticker","sticker"]],
 text:[["Heading","heading"],["Subheading","subheading"],["Body","body"],["Quote","quote"],["Caption","caption"]],
 images:[["Upload image","upload"],["Image placeholder","image"],["Replace selected","replace"]],
 layers:[["Select top layer","top"],["Bring forward","forward"],["Send backward","back"],["Delete selected","delete"]],
 assets:[["Upload image","upload"],["Save project","save"],["Export JSON","export"]],
 settings:[["New canvas","new"],["Clear canvas","clear"],["Save project","save"],["Reset project","reset"]]
 }[name]||[];
 $("#panelBody").innerHTML=`<div class="choiceGrid">${data.map(x=>`<button class="choice" data-act="${x[1]}"><b>${x[0]}</b><small>DesignForge tool</small></button>`).join("")}</div>`;
 $$("#panelBody [data-act]").forEach(b=>b.onclick=()=>act(b.dataset.act));
}
function act(a){
 if(a==="new")newCanvas();
 if(a==="save"){save();notify("Project saved")}
 if(a==="clear"){snap();state.elements=[];selected=null;save();render();notify("Canvas cleared")}
 if(a==="reset"){localStorage.removeItem("designforge-v8");location.reload()}
 if(a==="upload")fileInput.click();
 if(a==="replace"){if(selected)fileInput.click();else notify("Select an image first")}
 if(a==="export")exportJSON();
 if(a==="delete")deleteSelected();
 if(a==="forward")layerMove(1);if(a==="back")layerMove(-1);
 if(a==="top"){if(state.elements.length){selected=state.elements.at(-1).id;render()}}
 if(["card","button","shape","circle","frame"].includes(a))add(a);
 if(a==="input")add("card",{text:"Input field",w:250,h:46,radius:10,fill:"#ffffff",color:"#687783"});
 if(a==="navbar")add("card",{text:"Home     Work     About     Contact",w:420,h:55,radius:12,fill:"#ffffff"});
 if(a==="sticker")add("text",{text:"✦",w:100,h:100,fontSize:72,color:"#f5d46a"});
 if(a==="heading")add("text",{text:"Design your future",w:430,h:65,fontSize:40,weight:700});
 if(a==="subheading")add("text",{text:"Beautiful digital experiences.",w:360,h:50,fontSize:24});
 if(a==="body")add("text",{text:"Create, explore and refine your interface.",w:360,h:70,fontSize:16});
 if(a==="quote")add("text",{text:"“Make it simple, but significant.”",w:420,h:70,fontSize:26,weight:500});
 if(a==="caption")add("text",{text:"Caption",w:180,h:35,fontSize:12});
 if(a==="image")add("image",{w:280,h:180,fill:"#c3d9df"});
 if(a==="landing"||a==="dashboard"||a==="mobile"||a==="portfolio"||a==="streaming"||a==="shop")template(a);
}
function template(t){
 snap();state.elements=[];
 if(t==="landing"){addT("card",40,35,900,540,"#ffffffaa","");addT("text",80,100,500,100,"","Design beautiful products.",44);addT("text",80,205,430,60,"","A modern UI/UX workspace for ideas.",18);addT("button",80,295,155,48,"#75ddd2","Start designing");addT("shape",560,105,300,280,"linear-gradient(135deg,#86ded4,#6f75ff)","")}
 if(t==="dashboard"){addT("card",35,30,180,545,"#293e58","Navigation");addT("text",250,45,500,60,"","Analytics dashboard",34);addT("card",250,130,190,130,"#ffffffcc","Revenue");addT("card",460,130,190,130,"#ffffffcc","Users");addT("card",670,130,230,130,"#ffffffcc","Growth");addT("shape",250,295,650,230,"linear-gradient(145deg,#8adfd7,#7480ff)","")}
 if(t==="mobile"){state.width=390;state.height=844;addT("card",25,25,340,794,"#f3f6f5","");addT("text",50,65,270,55,"","Hello there",32);addT("shape",50,145,290,180,"linear-gradient(135deg,#8de1d6,#707bff)","");addT("card",50,355,290,90,"#ffffff","Quick action");addT("button",50,475,290,48,"#76ded2","Continue")}
 if(t==="portfolio"){addT("text",55,55,500,70,"","Creative portfolio.",42);addT("shape",570,45,330,250,"linear-gradient(135deg,#b5e5dc,#edb9a7)","");addT("card",55,210,260,230,"#ffffffc7","Project One");addT("card",335,210,260,230,"#d8e8e4","Project Two");addT("card",615,330,285,210,"#ead6cb","Project Three")}
 if(t==="streaming"){addT("card",30,25,920,555,"#23343f","");addT("shape",285,65,430,240,"linear-gradient(135deg,#182a36,#75979c)","");addT("card",55,65,190,240,"#73858a","Continue");addT("card",285,335,190,190,"#79999c","Movie");addT("card",500,335,190,190,"#b89583","Series");addT("card",715,335,190,190,"#607f88","Anime")}
 if(t==="shop"){addT("text",50,45,500,60,"","Modern store.",40);for(let i=0;i<3;i++)addT("card",50+i*290,145,250,290,["#f0dfd3","#d7e7e1","#d9d3e9"][i],"Product "+(i+1))}
 state.name=t[0].toUpperCase()+t.slice(1)+" Project";$("#projectName").value=state.name;save();render();notify("Template created")
}
function addT(type,x,y,w,h,fill,text,size){state.elements.push({id:uid(),type,x,y,w,h,opacity:100,rotation:0,radius:22,border:0,blur:0,shadow:true,fill,text:text||"",fontSize:size||28,weight:600,color:"#203642",borderColor:"#ffffff99"})}
function newCanvas(){
 modal(`<div class="modalHead"><h2>New canvas</h2><button data-close>×</button></div><p>Choose a size for your design.</p><div class="presetGrid">${[["Website",980,620],["Landing Page",1440,900],["Desktop App",1200,800],["Mobile",390,844],["Tablet",768,1024],["Social Post",1080,1080],["Story",1080,1920],["Presentation",1280,720]].map(x=>`<button class="preset" data-size="${x[1]},${x[2]}"><b>${x[0]}</b><small>${x[1]} × ${x[2]}</small></button>`).join("")}</div>`);
 $$(".preset").forEach(b=>b.onclick=()=>{let [w,h]=b.dataset.size.split(",").map(Number);snap();state.width=w;state.height=h;state.elements=[];selected=null;save();render();closeModal();notify("New canvas created")})
}
function modal(html){$("#modal").innerHTML=html;$("#modalBack").classList.remove("hidden");$("#modal [data-close]")?.addEventListener("click",closeModal)}
function closeModal(){$("#modalBack").classList.add("hidden")}
function deleteSelected(){if(!selected)return; snap();state.elements=state.elements.filter(e=>e.id!==selected);selected=null;save();render();notify("Deleted")}
function layerMove(dir){if(!selected)return;let i=state.elements.findIndex(e=>e.id===selected),j=i+dir;if(j<0||j>=state.elements.length)return;snap();[state.elements[i],state.elements[j]]=[state.elements[j],state.elements[i]];save();render();select(selected)}
function undo(){if(!history.length)return;future.push(JSON.stringify(state));state=JSON.parse(history.pop());selected=null;save();render();notify("Undo")}
function redo(){if(!future.length)return;history.push(JSON.stringify(state));state=JSON.parse(future.pop());save();render();notify("Redo")}
function exportJSON(){let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="designforge-v8-project.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);notify("Project exported")}
function renderInspector(){
 let e=getSel(),b=$("#inspectorBody");if(!e){b.innerHTML=`<div class="insSection" style="text-align:center;padding:35px 10px;font-size:10px;color:#d9e5eb">Select an object on the canvas to edit it.</div>`;return}
 b.innerHTML=`<div class="insSection"><div class="insTitle">Position <span>⌃</span></div><div class="twocol"><label class="field">X<input data-p="x" type="number" value="${Math.round(e.x)}"></label><label class="field">Y<input data-p="y" type="number" value="${Math.round(e.y)}"></label></div><div class="aligns">${["left","center","right","top","middle","bottom"].map(x=>`<button data-a="${x}">${x[0].toUpperCase()}</button>`).join("")}</div></div>
 <div class="insSection"><div class="insTitle">Size <span>⌃</span></div><div class="twocol"><label class="field">W<input data-p="w" type="number" value="${Math.round(e.w)}"></label><label class="field">H<input data-p="h" type="number" value="${Math.round(e.h)}"></label></div></div>
 <div class="insSection"><div class="insTitle">Appearance</div><label class="field">Opacity<div class="range"><input data-p="opacity" type="range" min="0" max="100" value="${e.opacity}"><output>${e.opacity}%</output></div></label><label class="field">Rotation<div class="range"><input data-p="rotation" type="range" min="-180" max="180" value="${e.rotation}"><output>${e.rotation}°</output></div></label></div>
 <div class="insSection"><div class="insTitle">Fill</div><div class="colorRow"><input data-p="fill" type="color" value="${e.fill?.startsWith("#")?e.fill:"#ffffff"}"><input id="hex" type="text" value="${e.fill}"></div></div>
 <div class="insSection"><div class="insTitle">Border</div><div class="twocol"><label class="field">Width<input data-p="border" type="number" value="${e.border}"></label><label class="field">Radius<input data-p="radius" type="number" value="${e.radius}"></label></div></div>
 <div class="insSection actions"><button class="action" id="dup">Duplicate</button><button class="action" id="front">Forward</button><button class="action" id="back">Backward</button><button class="action danger" id="del">Delete</button></div>`;
 b.querySelectorAll("[data-p]").forEach(i=>i.addEventListener(i.type==="range"?"input":"change",()=>{let p=i.dataset.p,v=i.type==="range"?Number(i.value):i.value;if(["x","y","w","h","opacity","rotation","border","radius"].includes(p))v=Number(v);if(p==="fill"&&i.type==="color")v=i.value;snap();e[p]=v;save();render();select(e.id)}));
 b.querySelectorAll("[data-a]").forEach(x=>x.onclick=()=>align(x.dataset.a));
 $("#dup").onclick=()=>{snap();let c=JSON.parse(JSON.stringify(e));c.id=uid();c.x+=25;c.y+=25;state.elements.push(c);selected=c.id;save();render();select(c.id)};
 $("#front").onclick=()=>layerMove(1);$("#back").onclick=()=>layerMove(-1);$("#del").onclick=deleteSelected;
}
function align(a){let e=getSel();if(!e)return;snap();if(a==="left")e.x=0;if(a==="right")e.x=state.width-e.w;if(a==="center")e.x=(state.width-e.w)/2;if(a==="top")e.y=0;if(a==="bottom")e.y=state.height-e.h;if(a==="middle")e.y=(state.height-e.h)/2;save();render();select(e.id)}
$$(".nav").forEach(b=>b.onclick=()=>{$$(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");panel(b.dataset.panel);if(innerWidth<760)$("#inspector").classList.remove("open")});
$$(".tool").forEach(b=>b.onclick=()=>{let t=b.dataset.tool;$$(".tool").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(t==="text")add("text",{text:"Your heading",w:350,h:60,fontSize:34});if(t==="shape")add("shape");if(t==="card")add("card",{text:"Card title"});if(t==="button")add("button",{text:"Get Started",w:150,h:46});if(t==="frame")add("frame",{w:300,h:200});if(t==="image")fileInput.click();if(t==="more")panel("elements")});
$("#closePanel").onclick=()=>$("#panel").classList.add("hidden");$("#newCanvas").onclick=newCanvas;$("#canvasPreset").onclick=newCanvas;
$("#undo").onclick=undo;$("#redo").onclick=redo;$("#export").onclick=exportJSON;$("#theme").onclick=()=>document.documentElement.classList.toggle("dark");$("#help").onclick=()=>notify("Select an object, then edit it in the Design panel.");
$("#zoomPlus").onclick=()=>setZoom(zoom+.1);$("#zoomMinus").onclick=()=>setZoom(zoom-.1);$("#zoomFit").onclick=()=>setZoom(1);$("#gridBtn").onclick=()=>{$("#gridToggle").click()};
function setZoom(z){zoom=Math.max(.5,Math.min(1.7,z));canvas.style.transform=`scale(${zoom})`;canvas.style.transformOrigin="center center";$("#zoomLabel").textContent=Math.round(zoom*100)+"%"}
$("#gridToggle").onchange=e=>{state.grid=e.target.checked;save();render()};$("#gridSize").onchange=e=>{state.gridSize=+e.target.value;save();render()};
$$("[data-device]").forEach(b=>b.onclick=()=>{let d=b.dataset.device;$$("[data-device]").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(d==="desktop"){state.width=980;state.height=620}else if(d==="tablet"){state.width=700;state.height=650}else{state.width=390;state.height=700}save();render();notify(d+" canvas")});
fileInput.onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>add("image",{src:r.result});r.readAsDataURL(f);e.target.value=""};
$("#projectName").onchange=e=>{state.name=e.target.value;save()};$("#brand").onclick=()=>panel("home");
$("#search").onkeydown=e=>{if(e.key==="Enter")notify("Use the sidebar to add matching tools.")};
$$(".tab").forEach(t=>t.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");if(t.dataset.tab!=="design"){ $("#inspectorBody").innerHTML=`<div class="insSection" style="padding:35px 10px;text-align:center;font-size:10px">${t.dataset.tab==="prototype"?"Prototype connections are ready for the next interaction layer.":"Comments panel ready for project notes."}</div>`}else renderInspector()});
canvas.addEventListener("pointerdown",e=>{if(e.target===canvas){selected=null;renderInspector();$$(".obj").forEach(x=>x.classList.remove("selected"))}});
document.addEventListener("keydown",e=>{let m=e.ctrlKey||e.metaKey;if(m&&e.key.toLowerCase()==="z"){e.preventDefault();undo()}if(m&&e.key.toLowerCase()==="y"){e.preventDefault();redo()}if(m&&e.key.toLowerCase()==="d"){e.preventDefault();if(selected){let e=getSel();add(e.type,{...e,x:e.x+25,y:e.y+25})}}if(e.key==="Delete"&&selected&&!/input|textarea|select/i.test(document.activeElement.tagName))deleteSelected()});
try{let x=localStorage.getItem("designforge-v8");if(x)state=JSON.parse(x)}catch{}$("#projectName").value=state.name;render();setZoom(1);
