(()=>{
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="designforge-v27";
const uid=()=>Math.random().toString(36).slice(2,10);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const hex=v=>/^#[0-9a-f]{6}$/i.test(v||"")?v:"#4e8cff";
const xmlEsc=s=>esc(s).replace(/`/g,"&#96;");
const svgData=svg=>`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const devices={
 desktop:{w:1440,h:900,label:"PC"},tablet:{w:768,h:1024,label:"Tablet"},mobile:{w:390,h:844,label:"Phone"},custom:{w:1100,h:700,label:"Canvas"}
};
const STICKERS=[
 {id:"paper-cream",name:"Cream Scrapbook",kind:"paper",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240'><path d='M8 10h300v208H8z' fill='#f7ecd9' stroke='#d3b88d' stroke-width='4' stroke-dasharray='9 7'/><path d='M22 35c60 18 120-13 172 4s71 3 104 16M24 184c58-14 109 13 168-5s83 4 101-8' fill='none' stroke='#c59f6b' stroke-width='4' opacity='.55'/></svg>"},
 {id:"paper-grid",name:"Grid Paper",kind:"paper",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240'><rect width='100%' height='100%' rx='5' fill='#fbfaf5'/><path d='M0 20H320M0 40H320M0 60H320M0 80H320M0 100H320M0 120H320M0 140H320M0 160H320M0 180H320M0 200H320M0 220H320M20 0V240M40 0V240M60 0V240M80 0V240M100 0V240M120 0V240M140 0V240M160 0V240M180 0V240M200 0V240M220 0V240M240 0V240M260 0V240M280 0V240M300 0V240' stroke='#b6c4d6' opacity='.35'/></svg>"},
 {id:"torn-blue",name:"Torn Paper",kind:"torn",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='320' height='170'><path d='M5 10H315V128l-23 18-23-10-27 18-30-14-29 16-28-14-36 13-24-17-30 16-26-19-29 11-31-8V10z' fill='#e9f2ff' stroke='#9fbbe1' stroke-width='4'/></svg>"},
 {id:"tape-pink",name:"Washi Tape Pink",kind:"tape",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='300' height='90'><path d='M10 18H290V72H10z' fill='#f3b7cf' opacity='.9'/><path d='M18 28H282M18 45H282M18 62H282' stroke='#fff' stroke-width='5' opacity='.55'/></svg>"},
 {id:"tape-beige",name:"Washi Tape Beige",kind:"tape",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='300' height='90'><path d='M10 18H290V72H10z' fill='#e8d4b1' opacity='.95'/><path d='M20 28H280M20 45H280M20 62H280' stroke='#fff' stroke-width='4' opacity='.5'/></svg>"},
 {id:"label",name:"Paper Label",kind:"label",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='300' height='110'><path d='M15 12H225L285 55l-60 43H15z' fill='#fff7cf' stroke='#d7c375' stroke-width='4'/><circle cx='240' cy='55' r='7' fill='#d7c375'/></svg>"},
 {id:"memo",name:"Memo Note",kind:"memo",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='250' height='220'><path d='M12 12H238V194L198 208H12z' fill='#fff7a8' stroke='#e1cf69' stroke-width='4'/><path d='M28 52H214M28 92H214M28 132H198M28 172H164' stroke='#d5c46b' stroke-width='4' opacity='.7'/></svg>"},
 {id:"polaroid",name:"Polaroid Frame",kind:"polaroid",svg:"<svg xmlns='http://www.w3.org/2000/svg' width='260' height='300'><rect x='8' y='8' width='244' height='284' rx='6' fill='white' stroke='#d5dbe2' stroke-width='3'/><rect x='28' y='28' width='204' height='190' fill='#dfe7ef'/><path d='M64 255H196' stroke='#a7b0bc' stroke-width='7' stroke-linecap='round'/></svg>"},
 {id:"star",name:"Star Doodle",kind:"symbol",text:"★"}, {id:"sparkle",name:"Sparkles",kind:"symbol",text:"✦ ✧"}, {id:"heart",name:"Heart",kind:"symbol",text:"♥"}, {id:"flower",name:"Flower",kind:"symbol",text:"✿"}, {id:"leaf",name:"Leaf",kind:"symbol",text:"❧"}, {id:"arrow",name:"Doodle Arrow",kind:"symbol",text:"➜"}, {id:"smile",name:"Smiley",kind:"symbol",text:"☺"}, {id:"burst",name:"Starburst",kind:"symbol",text:"✷"}
];

const state={
 project:"Untitled Project",theme:"dark",grid:false,snap:true,zoom:1,panX:0,panY:0,device:"desktop",tool:"select",touchMode:true,panMode:false,designType:"Website",selected:null,multiSelected:[],pageId:"home",logo:"logo.png",
 brand:{primary:"#4e8cff",secondary:"#7c3aed",font:"Inter"},
 canvas:{w:1100,h:700,bg:"#ffffff",backgroundType:"solid",backgroundValue:"#ffffff"},
 pages:[{id:"home",name:"Home",objects:[]}],
 version:25
};
let history=[],future=[];let drag=null,resizing=null,rotating=null;let pinch=null;const touchPointers=new Map();let historyArmed=false;let saveTimer=null;

function page(){return state.pages.find(p=>p.id===state.pageId)||state.pages[0]}
function selected(){return page().objects.find(o=>o.id===state.selected)||null}
function openInspector(auto=false){const d=$("#inspectorDrawer");if(!d)return;d.classList.add("open");document.body.classList.add("inspector-open");document.body.classList.remove("library-open");$("#libraryDrawer")?.classList.remove("open");renderInspector();}
function focusInspectorSection(section){openInspector(false);requestAnimationFrame(()=>{const el=$("#inspect-"+section);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});});}
function displayObject(o){const r=o.responsive?.[state.device]||{};return Object.assign({},o,{x:r.x??o.x,y:r.y??o.y,w:r.w??o.w,h:r.h??o.h,fontSize:r.fontSize??o.fontSize})}
function snapshot(){return JSON.stringify({project:state.project,theme:state.theme,grid:state.grid,snap:state.snap,canvas:state.canvas,pages:state.pages,pageId:state.pageId,logo:state.logo,designType:state.designType,brand:state.brand,device:state.device})}
function save(){try{localStorage.setItem(KEY,snapshot());status("Saved",true)}catch(e){console.error(e);status("Save unavailable",false)}}
function pushHistory(){const s=snapshot();if(history[history.length-1]!==s){history.push(s);if(history.length>100)history.shift();future=[]}}
function restoreSnapshot(s){const x=JSON.parse(s);Object.assign(state,x);state.pages=Array.isArray(state.pages)&&state.pages.length?state.pages: [{id:"home",name:"Home",objects:[]}];state.pageId=state.pages.some(p=>p.id===state.pageId)?state.pageId:state.pages[0].id;state.selected=null;state.multiSelected=[];state.zoom=clamp(Number(state.zoom)||1,.25,3);state.panX=0;state.panY=0}
function undo(){if(!history.length)return toast("Nothing to undo");future.push(snapshot());restoreSnapshot(history.pop());renderAll();toast("Undo")}
function redo(){if(!future.length)return toast("Nothing to redo");history.push(snapshot());restoreSnapshot(future.pop());renderAll();toast("Redo")}
function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1500)}
function status(s,good=true){const el=$("#status");if(el){el.textContent=(good?"● ":"! ")+s;el.classList.toggle("bad",!good)}}
function download(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),900)}
function safeName(){return (state.project||"designforge").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()||"designforge"}
function setupLogo(){const img=$("#brandLogo");if(!img)return;img.onerror=()=>{img.removeAttribute("src");img.classList.add("logo-fallback")};img.src=state.logo||"logo.png"}

function normalizeObject(o){return Object.assign({id:uid(),type:"shape",name:"Layer",x:80,y:80,w:220,h:100,rotation:0,opacity:1,fill:"#4e8cff",stroke:"transparent",strokeWidth:0,radius:12,shadow:true,blur:0,backdropBlur:0,locked:false,hidden:false,text:"",textColor:"#fff",fontSize:16,fontWeight:600,align:"left",src:"",mediaSrc:"",mediaFit:"cover",responsive:{desktop:{},tablet:{},mobile:{}},aspectLocked:false,imageFilter:"",prototype:null,autoLayout:false,layoutDirection:"horizontal",layoutGap:16,layoutPadding:16,parentId:null,shapeVariant:"rectangle"},o)}
function load(){
 try{
  const raw=localStorage.getItem(KEY)||localStorage.getItem("designforge-v26")||localStorage.getItem("designforge-v25")||localStorage.getItem("designforge-v24")||localStorage.getItem("designforge-v23")||localStorage.getItem("designforge-v22")||localStorage.getItem("designforge-v21")||localStorage.getItem("designforge-v20")||localStorage.getItem("designforge-v19")||localStorage.getItem("designforge-v18");
  if(raw){const x=JSON.parse(raw);Object.assign(state,x);state.pages=(x.pages||[]).map(p=>({id:p.id||uid(),name:p.name||"Page",objects:(p.objects||[]).map(normalizeObject)}));if(!state.pages.length)state.pages=[{id:"home",name:"Home",objects:[]}];state.pageId=state.pages.some(p=>p.id===state.pageId)?state.pageId:state.pages[0].id;state.zoom=clamp(Number(state.zoom)||1,.25,3)}
 }catch(e){console.warn(e)}
 document.body.classList.toggle("light",state.theme==="light");document.body.classList.toggle("touch-active",!!state.touchMode);
}
function object(type,extra={}){return normalizeObject({type,name:extra.name||type,x:extra.x??80,y:extra.y??80,w:extra.w??220,h:extra.h??100,fill:extra.fill??"#4e8cff",stroke:extra.stroke??"transparent",strokeWidth:extra.strokeWidth??0,radius:extra.radius??12,shadow:extra.shadow??true,text:extra.text||"",textColor:extra.textColor||"#fff",fontSize:extra.fontSize||16,fontWeight:extra.fontWeight||600,align:extra.align||"left",src:extra.src||"",...extra})}
function addObject(type,extra={}){pushHistory();const n=object(type,extra);page().objects.push(n);state.selected=n.id;state.multiSelected=[n.id];save();renderAll();toast("Layer added");return n}
function addText(){addObject("text",{name:"Text",text:"Double-click to edit",w:340,h:66,fontSize:36,fontWeight:750,fill:"transparent",textColor:"#172337"})}
function addHeading(){addObject("text",{name:"Heading",text:"Heading",w:520,h:82,fontSize:54,fontWeight:800,fill:"#172337"})}
function addBody(){addObject("text",{name:"Body Text",text:"Write your content here.",w:460,h:90,fontSize:18,fontWeight:450,fill:"#475569"})}
function addTextToSelected(){
 const parent=selected();
 if(!parent)return addText();
 pushHistory();
 parent.text=parent.text||"Type your text";
 parent.textColor=parent.textColor||"#172337";
 parent.fontSize=parent.fontSize||20;
 parent.fontWeight=parent.fontWeight||600;
 parent.align=parent.align||"left";
 parent.textInset=parent.textInset||18;
 save(); renderAll(); openInspector(true);
 requestAnimationFrame(()=>{
   document.querySelector('.inspector-quickbar [data-focus="text"]')?.click();
   const input=document.querySelector('#itext');
   if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}
 });
 toast("Text added to selected layer");
 return parent;
}
function addImageToSelected(){
 const o=selected();
 if(!o)return toast("Select a layer first");
 const input=$("#imageInput");
 input.dataset.mode="selected";
 input.click();
}
function handleImageFile(file){
 const input=$("#imageInput"),mode=input?.dataset.mode,target=selected();
 const r=new FileReader();
 r.onload=()=>{
   if(mode==="selected"&&target){
     pushHistory();target.mediaSrc=r.result;target.mediaFit=target.mediaFit||"cover";
     save();renderAll();toast("Image added to selected layer");
   }else{
     addObject("image",{name:file.name||"Image",src:r.result,w:360,h:240,fill:"transparent",stroke:"transparent",strokeWidth:0,radius:12});
   }
   if(input){input.value="";delete input.dataset.mode;}
 };
 r.readAsDataURL(file);
}
function addShape(){addObject("shape",{name:"Shape",w:220,h:140,fill:state.brand.primary})}
function addCircle(){addObject("shape",{name:"Circle",w:140,h:140,radius:999,fill:"#31c48d"})}
function addTriangle(){addObject("shape",{name:"Triangle",w:180,h:160,fill:state.brand.primary,shapeVariant:"triangle"})}
function addDiamond(){addObject("shape",{name:"Diamond",w:160,h:160,fill:"#7c3aed",shapeVariant:"diamond"})}
function addHexagon(){addObject("shape",{name:"Hexagon",w:180,h:160,fill:"#f59e0b",shapeVariant:"hexagon"})}
function addStar(){addObject("shape",{name:"Star",w:180,h:180,fill:"#ef4444",shapeVariant:"star"})}
function addEllipse(){addObject("shape",{name:"Ellipse",w:220,h:140,fill:"#14b8a6",radius:999,shapeVariant:"ellipse"})}
function addLine(){addObject("shape",{name:"Line",w:260,h:8,fill:state.brand.primary,radius:999,shapeVariant:"line"})}
function addArrow(){addObject("shape",{name:"Arrow",w:260,h:70,fill:state.brand.primary,shapeVariant:"arrow"})}
function addPentagon(){addObject("shape",{name:"Pentagon",w:180,h:170,fill:"#ec4899",shapeVariant:"pentagon"})}
function addCard(){addObject("card",{name:"Card",w:280,h:180,fill:"#ffffff",stroke:"#d9e2ed",strokeWidth:1,radius:18})}
function addButton(){addObject("button",{name:"Button",text:"Get Started",w:180,h:52,fill:state.brand.primary,textColor:"#fff",fontSize:16,radius:12})}
function addFrame(){addObject("frame",{name:"Frame",w:500,h:320,fill:"transparent",stroke:state.brand.primary,strokeWidth:2,radius:10})}
function addInput(){addObject("shape",{name:"Input",w:300,h:48,fill:"#f8fafc",stroke:"#cbd5e1",strokeWidth:1,radius:9})}
function addNavbar(){addObject("shape",{name:"Navbar",w:1030,h:66,fill:"#ffffff",stroke:"#e2e8f0",strokeWidth:1,radius:12})}
function addChart(){addObject("shape",{name:"Chart",w:420,h:230,fill:"#eef5ff",stroke:"#cbd5e1",strokeWidth:1,radius:18})}
function addMockup(){addObject("frame",{name:"Device Mockup",w:320,h:620,fill:"#0f172a",stroke:"#334155",strokeWidth:8,radius:32})}

function addSticker(id){const s=STICKERS.find(x=>x.id===id);if(!s)return;const sizes={paper:[320,240],torn:[320,170],tape:[300,90],label:[300,110],memo:[250,220],polaroid:[260,300],symbol:[150,110]};const [w,h]=sizes[s.kind]||[160,120];addObject("sticker",{name:s.name,w,h,src:s.svg?svgData(s.svg):"",text:s.text||"",fill:"transparent",stroke:"transparent",strokeWidth:0,radius:0,shadow:true})}

function setTool(t){state.tool=t;$("#moreTools")?.classList.toggle("active",t==="more");$$('.tool[data-tool]').forEach(b=>b.classList.toggle("active",b.dataset.tool===t));if(t!=="select"){const map={text:addText,shape:addShape,card:addCard,button:addButton,image:()=>$("#imageInput").click(),sticker:()=>openPanel("stickers"),frame:addFrame};const fn=map[t];if(fn)fn();state.tool="select";$$('.tool[data-tool]').forEach(b=>b.classList.toggle("active",b.dataset.tool==="select"))}}

function renderObject(o,preview=false){
 const d=displayObject(o),el=document.createElement("div");el.className="obj"+(o.id===state.selected&&!preview?" selected":"")+((state.multiSelected||[]).includes(o.id)&&!preview?" selected":"")+(o.locked?" locked":"");el.dataset.id=o.id;el.style.left=d.x+"px";el.style.top=d.y+"px";el.style.width=d.w+"px";el.style.height=d.h+"px";el.style.opacity=d.opacity;el.style.transform=`rotate(${d.rotation}deg)`;el.style.background=d.fill==="transparent"?"transparent":d.fill;el.style.border=`${d.strokeWidth||0}px solid ${d.stroke||"transparent"}`;el.style.borderRadius=(d.radius||0)+"px";el.style.boxShadow=d.shadow?"0 14px 32px #15325024":"none";el.style.filter=`${d.blur?`blur(${d.blur}px)`:""}${d.imageFilter?` ${d.imageFilter}`:""}`.trim()||"none";el.style.backdropFilter=d.backdropBlur?`blur(${d.backdropBlur}px)`:"none";el.style.fontFamily=state.brand.font||"Inter";
 if(o.type==="shape"){el.classList.add("shape-variant-"+(o.shapeVariant||"rectangle"));if(o.shapeVariant==="line"){el.style.height=Math.max(4,d.h)+"px";el.style.borderRadius="999px"}if(["triangle","diamond","hexagon","star","pentagon","arrow"].includes(o.shapeVariant)){el.style.clipPath={triangle:"polygon(50% 0%, 100% 100%, 0% 100%)",diamond:"polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",hexagon:"polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",star:"polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 94%, 50% 72%, 21% 94%, 32% 57%, 2% 35%, 39% 35%)",pentagon:"polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",arrow:"polygon(0% 35%, 68% 35%, 68% 5%, 100% 50%, 68% 95%, 68% 65%, 0% 65%)"}[o.shapeVariant]}}
 if(o.type==="text"||o.type==="button"){el.classList.add("textobj");el.textContent=o.text;el.style.color=o.type==="button"?o.textColor:(o.textColor||d.fill);el.style.fontSize=d.fontSize+"px";el.style.fontWeight=d.fontWeight;el.style.textAlign=d.align;el.style.lineHeight="1.16";el.style.padding=o.type==="button"?"0 14px":"4px 6px";if(o.type==="button")el.classList.add("buttonobj")}
 if(o.type==="card"){el.classList.add("cardobj");el.innerHTML=`<div class="layer-content"></div>`}
 if(o.type==="image"){el.innerHTML=o.src?`<img class="imageobj" src="${o.src}" alt="">`:`<div style="height:100%;display:grid;place-items:center;color:#66788e;font-size:12px">＋ Upload image</div>`}
 if(o.type==="sticker"){el.classList.add("stickerobj");el.innerHTML=o.src?`<img class="stickerimg" src="${o.src}" alt="${esc(o.name)}" style="object-fit:contain">`:`<div class="sticker-fallback">${esc(o.text||"✦")}</div>`}
 if(o.mediaSrc){const media=document.createElement("img");media.className="layer-media";media.src=o.mediaSrc;media.alt="";media.style.objectFit=o.mediaFit||"cover";el.appendChild(media)}
 if(o.text && !["text","button","image"].includes(o.type)){
   const content=el.querySelector(".layer-content")||document.createElement("div");content.className="layer-content";content.textContent=o.text;content.style.position="absolute";content.style.inset=(o.textInset||14)+"px";content.style.display="flex";content.style.alignItems="center";content.style.justifyContent=o.align==="center"?"center":o.align==="right"?"flex-end":"flex-start";content.style.textAlign=o.align||"left";content.style.fontSize=(o.fontSize||20)+"px";content.style.fontWeight=o.fontWeight||600;content.style.color=o.textColor||"#172337";content.style.whiteSpace="pre-wrap";content.style.wordBreak="break-word";content.style.zIndex="3";if(!content.parentNode)el.appendChild(content)
 }
 if(o.text && !preview && !["text","button","image"].includes(o.type)){
   const content=el.querySelector(".layer-content");
   if(content) content.addEventListener("dblclick",ev=>{ev.stopPropagation();inlineEdit(content,o)});
 }
 if(o.type==="frame")el.innerHTML="<div class='frameobj'></div>";
 if(o.componentId&&!preview){const b=document.createElement("span");b.className="component-badge";b.textContent="Component";b.style.cssText="position:absolute;right:5px;top:5px;font-size:7px;background:#152d4b;color:#9fc7ff;padding:3px 5px;border-radius:99px";el.appendChild(b)}
 if(!preview){["nw","n","ne","e","se","s","sw","w"].forEach(h=>{const q=document.createElement("span");q.className="handle "+h;q.dataset.handle=h;el.appendChild(q)});const rr=document.createElement("span");rr.className="handle rotate";rr.dataset.handle="rotate";el.appendChild(rr);const line=document.createElement("span");line.className="rotate-line";el.appendChild(line)}
 el.addEventListener("pointerdown",e=>objectPointerDown(e,o));if((o.type==="text"||o.type==="button")&&!preview)el.addEventListener("dblclick",()=>inlineEdit(el,o));if(preview&&o.prototype)el.dataset.prototype=o.prototype.target||"";return el;
}
function renderCanvas(){
 const p=page(),root=$("#objects");if(!root)return;root.innerHTML="";p.objects.forEach(o=>{if(!o.hidden)root.appendChild(renderObject(o,false))});const c=$("#canvas");c.style.width=state.canvas.w+"px";c.style.height=state.canvas.h+"px";c.style.background=state.canvas.backgroundType==="gradient"?state.canvas.backgroundValue:state.canvas.bg;c.classList.toggle("grid-on",state.grid);const sh=$("#canvasShell");sh.style.width=state.canvas.w+"px";sh.style.height=state.canvas.h+"px";applyTransform();$("#deviceSize").textContent=`${state.canvas.w}×${state.canvas.h}`;updateZoomUi();}
function renderAll(){updateHeader();renderCanvas();renderInspector();renderLibrary();updateDeviceChips();setupLogo();}

function updateHeader(){$("#pageName").textContent=page().name;document.body.classList.toggle("light",state.theme==="light");document.body.classList.toggle("touch-active",state.touchMode);}
function updateDeviceChips(){$$('.device-chip[data-device]').forEach(b=>b.classList.toggle("active",b.dataset.device===state.device))}
function updateZoomUi(){const pct=Math.round(state.zoom*100);$("#zoomValue").textContent=pct+"%";$("#hudZoom").textContent=pct+"%";$("#zoomSlider").value=pct}
function applyTransform(){$("#canvasShell").style.transform=`translate(calc(-50% + ${state.panX}px),calc(-50% + ${state.panY}px)) scale(${state.zoom})`}
function fitWorkspace(){const vp=$("#viewport");if(!vp)return;const margin=window.innerWidth<760?18:40;const z=clamp(Math.min((vp.clientWidth-margin*2)/state.canvas.w,(vp.clientHeight-margin*2)/state.canvas.h),.25,1);state.zoom=z;state.panX=0;state.panY=0;applyTransform();updateZoomUi();save()}
function setZoom(z,focal){const vp=$("#viewport");const old=state.zoom;const nz=clamp(Number(z)||1,.25,3);if(Math.abs(nz-old)<.001)return;if(!focal){state.zoom=nz;applyTransform();updateZoomUi();save();return}
 const r=vp.getBoundingClientRect(),fx=focal.x-r.left,fy=focal.y-r.top;const centerX=vp.clientWidth/2+state.panX,centerY=vp.clientHeight/2+state.panY;const canvasCx=state.canvas.w/2,canvasCy=state.canvas.h/2;const ptX=(fx-centerX)/old+canvasCx,ptY=(fy-centerY)/old+canvasCy;const newCenterX=fx-(ptX-canvasCx)*nz,newCenterY=fy-(ptY-canvasCy)*nz;state.zoom=nz;state.panX=newCenterX-vp.clientWidth/2;state.panY=newCenterY-vp.clientHeight/2;applyTransform();updateZoomUi();save();}
function resetView(){state.zoom=1;state.panX=0;state.panY=0;applyTransform();updateZoomUi();save();toast("View reset")}

function canvasPoint(e){const rect=$("#canvas").getBoundingClientRect();return{x:(e.clientX-rect.left)/state.zoom,y:(e.clientY-rect.top)/state.zoom}}
function beginHistoryOnce(){if(!historyArmed){pushHistory();historyArmed=true}}
function endHistory(){if(historyArmed){historyArmed=false;save();}}
function objectPointerDown(e,o){if(state.tool!=="select")return;if(o.locked)return toast("Layer is locked");if(pinch)return;
 e.preventDefault();e.stopPropagation();state.selected=o.id;if(!state.multiSelected.includes(o.id))state.multiSelected=[o.id];if(e.shiftKey){state.multiSelected=state.multiSelected.includes(o.id)?state.multiSelected.filter(id=>id!==o.id):[...state.multiSelected,o.id];renderCanvas();renderInspector();openInspector(true);return}
 beginHistoryOnce();const h=e.target.dataset.handle,p=canvasPoint(e);if(h==="rotate"){rotating={o,cx:o.x+o.w/2,cy:o.y+o.h/2};drag=null;resizing=null}else if(h){resizing={o,handle:h,start:{x:o.x,y:o.y,w:o.w,h:o.h},p0:p,ratio:o.w/Math.max(1,o.h)};drag=null;rotating=null}else{drag={o,dx:p.x-o.x,dy:p.y-o.y};resizing=null;rotating=null}renderCanvas();renderInspector();openInspector(true);}
function updateInteraction(e){if(pinch)return;if(!drag&&!resizing&&!rotating)return;e.preventDefault();const p=canvasPoint(e);if(drag){drag.o.x=clamp(p.x-drag.dx,0,Math.max(0,state.canvas.w-drag.o.w));drag.o.y=clamp(p.y-drag.dy,0,Math.max(0,state.canvas.h-drag.o.h));if(state.snap)snapObject(drag.o)}else if(resizing){const r=resizing,dx=p.x-r.p0.x,dy=p.y-r.p0.y,min=24;let x=r.start.x,y=r.start.y,w=r.start.w,h=r.start.h;const hnd=r.handle;if(hnd.includes("e"))w=r.start.w+dx;if(hnd.includes("s"))h=r.start.h+dy;if(hnd.includes("w")){w=r.start.w-dx;x=r.start.x+dx}if(hnd.includes("n")){h=r.start.h-dy;y=r.start.y+dy}
 if(r.o.aspectLocked&&hnd.length===2){if(Math.abs(dx)>=Math.abs(dy))h=w/r.ratio;else w=h*r.ratio;if(hnd.includes("w"))x=r.start.x+r.start.w-w;if(hnd.includes("n"))y=r.start.y+r.start.h-h}
 w=Math.max(min,w);h=Math.max(min,h);x=clamp(x,0,state.canvas.w-min);y=clamp(y,0,state.canvas.h-min);w=Math.min(w,state.canvas.w-x);h=Math.min(h,state.canvas.h-y);Object.assign(r.o,{x,y,w,h})
 }else if(rotating){let deg=Math.atan2(p.y-rotating.cy,p.x-rotating.cx)*180/Math.PI+90;if(deg<0)deg+=360;if(e.shiftKey)deg=Math.round(deg/15)*15;rotating.o.rotation=((Math.round(deg)%360)+360)%360}
 renderCanvas();}
function finishInteraction(){if(drag||resizing||rotating){drag=resizing=rotating=null;endHistory()}}
function snapObject(o){const root=$("#objects");root.querySelectorAll(".snap-guide").forEach(x=>x.remove());const targets=page().objects.filter(t=>t.id!==o.id&&!t.hidden);let gx=null,gy=null,dx=8,dy=8;targets.forEach(t=>{[t.x,t.x+t.w/2,t.x+t.w].forEach(tx=>{const d=Math.abs(o.x+o.w/2-tx);if(d<dx){dx=d;gx=tx-o.w/2}});[t.y,t.y+t.h/2,t.y+t.h].forEach(ty=>{const d=Math.abs(o.y+o.h/2-ty);if(d<dy){dy=d;gy=ty-o.h/2}})});if(gx!==null){o.x=clamp(gx,0,state.canvas.w-o.w);const g=document.createElement("span");g.className="snap-guide v";g.style.left=(o.x+o.w/2)+"px";root.appendChild(g)}if(gy!==null){o.y=clamp(gy,0,state.canvas.h-o.h);const g=document.createElement("span");g.className="snap-guide h";g.style.top=(o.y+o.h/2)+"px";root.appendChild(g)}}

function inlineEdit(el,o){if(o.locked)return;el.contentEditable="true";el.spellcheck=false;el.classList.add("editing");el.focus();const range=document.createRange();range.selectNodeContents(el);range.collapse(false);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);const original=o.text;let done=false;const finish=saveEdit=>{if(done)return;done=true;el.contentEditable="false";el.classList.remove("editing");if(saveEdit){const value=el.textContent.trim();if(value!==original){beginHistoryOnce();o.text=value;endHistory()}}renderAll()};el.addEventListener("blur",()=>finish(true),{once:true});el.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();el.textContent=original;finish(false)}else if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();el.blur()}})}

function renderInspector(){
 const box=$("#inspectorBody"),o=selected();
 $("#inspectorSub").textContent=o?o.name:"No layer selected";
 if(!o){box.innerHTML=`<div class="empty"><b>Select an element</b><span>Choose a layer to adjust position, size, colour, blur and typography.</span><button id="addTextFromInspector" class="full-btn primary">＋ Add Text</button></div>`;$("#addTextFromInspector")?.addEventListener("click",()=>addText());$("#addTextInside")?.addEventListener("click",()=>addTextToSelected());return}
 const textLike=true;
 box.innerHTML=`
 <div class="inspector-section-title"><b>Design Adjustments</b><small>Everything for the selected layer</small></div>
 <div class="inspector-quickbar"><button data-focus="adjust" class="active">Adjust</button><button data-focus="colour">Colour</button><button data-focus="blur">Blur</button><button data-focus="text">Text</button><button data-focus="effects">Effects</button></div>
 <div class="inspect-section" id="inspect-adjust"><h4>Touch Design Adjustment</h4>
 <div class="touch-adjust-note"><b>☝ Move with your finger</b><span>Drag the selected layer directly on the canvas to change X / Y.</span><span>Drag any edge or corner handle to change Width / Height.</span><span>Drag the round handle above the layer to rotate.</span></div>
 ${rangeField("Rotation","irot",o.rotation,0,360,1,"°")}<label class="check-row"><input id="ilockratio" type="checkbox" ${o.aspectLocked?"checked":""}> Lock aspect ratio while resizing</label></div>
 <div class="inspect-section" id="inspect-colour"><h4>Colour & Appearance</h4>
 ${colorField("Fill colour","ifill",o.fill)}${textField("Fill HEX","ifillhex",o.fill)}${colorField("Border colour","istroke",o.stroke==="transparent"?"#000000":o.stroke)}
 ${rangeField("Border","isw",o.strokeWidth,0,30,1,"px")}${rangeField("Corner radius","irad",o.radius,0,120,1,"px")}${rangeField("Opacity","iop",o.opacity*100,0,100,1,"%")}
 <label class="check-row"><input id="ishadow" type="checkbox" ${o.shadow?"checked":""}> Shadow</label></div>
 <div class="inspect-section" id="inspect-blur"><h4>Blur</h4>${rangeField("Object blur","iblur",o.blur,0,50,1,"px")}${rangeField("Background blur","iback",o.backdropBlur,0,50,1,"px")}</div>
 <div class="inspect-section" id="inspect-text"><h4>Text Editing</h4><div class="notice">Text belongs to the selected layer. Typing here does not create a new layer.</div>
 <label class="field"><span>Text content</span><textarea id="itext" rows="4" placeholder="Type text for this layer…">${esc(o.text||"")}</textarea></label>
 ${!o.text?`<button id="addTextFromInspector" class="full-btn primary">＋ Add Text to Selected Layer</button>`:""}
 ${rangeField("Font size","ifs",o.fontSize||20,6,300,1,"px")}${rangeField("Font weight","ifw",o.fontWeight||600,100,900,100,"")}${colorField("Text colour","itcolor",o.textColor||"#172337")}<label class="field">Alignment<select id="ialign"><option value="left" ${o.align==="left"?"selected":""}>Left</option><option value="center" ${o.align==="center"?"selected":""}>Center</option><option value="right" ${o.align==="right"?"selected":""}>Right</option></select></label>
 </div>
 <div class="inspect-section" id="inspect-effects"><h4>Effects & Tools</h4><div class="field-row"><button id="gradientBtn" class="full-btn">🌈 Gradient</button><button id="imageStudioBtn" class="full-btn">🖼 Image Adjust</button></div><button id="addImageInside" class="full-btn">＋ Add Image to Selected Layer</button></div>
 <div class="inspect-section"><h4>Responsive Layout</h4><button class="full-btn" id="saveResponsive">Save current layer for ${devices[state.device].label}</button><div class="notice" style="margin-top:8px">Preview switching changes the viewport, not your master canvas size.</div></div>
 <div class="inspect-actions"><button id="duplicateBtn">Duplicate</button><button id="deleteBtn" class="danger">Delete</button><button id="lockBtn">${o.locked?"Unlock":"Lock"}</button><button id="hideBtn">${o.hidden?"Show":"Hide"}</button></div>`;
 bindInspector(o,textLike);
 const addTextBtn=$("#addTextFromInspector"); if(addTextBtn) addTextBtn.onclick=()=>addTextToSelected();
 const addInsideBtn=$("#addTextInside"); if(addInsideBtn) addInsideBtn.onclick=()=>addTextToSelected();
}

function rangeField(label,id,value,min,max,step,suffix){return `<label class="field"><span>${label}<output id="${id}Out">${Math.round(value)}${suffix}</output></span><input id="${id}" class="range" type="range" min="${min}" max="${max}" step="${step}" value="${Math.round(value)}"></label>`}
function colorField(label,id,value){return `<label class="field"><span>${label}</span><input id="${id}" type="color" value="${hex(value)}"></label>`}
function textField(label,id,value){return `<label class="field"><span>${label}</span><input id="${id}" value="${esc(value||"")}"></label>`}
function bindInspector(o,textLike){
 const focusButtons=$$('.inspector-quickbar [data-focus]');
 const addInside=$("#addTextInside"); if(addInside) addInside.onclick=()=>addTextToSelected();
 const showInspectorSection=(key)=>{
   const target='#inspect-'+(key||'adjust');
   ['#inspect-adjust','#inspect-colour','#inspect-blur','#inspect-text','#inspect-effects'].forEach(sel=>{const el=$(sel);if(el)el.classList.toggle('inspector-hidden',sel!==target);});
   focusButtons.forEach(b=>b.classList.toggle('active',b.dataset.focus===(key||'adjust')));
 };
 focusButtons.forEach(b=>b.addEventListener('click',()=>showInspectorSection(b.dataset.focus)));
 showInspectorSection('adjust');
 $$('.inspector-tabs button').forEach(b=>b.onclick=()=>{$$('.inspector-tabs button').forEach(x=>x.classList.remove("active"));b.classList.add("active");['layout','style','text'].forEach(t=>{const el=$("#itab-"+t);if(el)el.hidden=t!==b.dataset.itab})});
 const bindRange=(id,setter)=>{const el=$("#"+id),out=$("#"+id+"Out");if(!el)return;el.addEventListener("pointerdown",beginHistoryOnce);el.addEventListener("input",()=>{const v=Number(el.value);setter(v);if(out)out.textContent=Math.round(v)+(id==="iop"?"%":id==="irot"?"°":"px");renderCanvas()});el.addEventListener("change",()=>{endHistory();renderAll()})};
 bindRange("ix",v=>o.x=clamp(v,0,Math.max(0,state.canvas.w-o.w)));bindRange("iy",v=>o.y=clamp(v,0,Math.max(0,state.canvas.h-o.h)));bindRange("iw",v=>{const w=clamp(v,24,Math.max(24,state.canvas.w-o.x));if(o.aspectLocked){const h=w*(o.h/Math.max(1,o.w));o.w=w;o.h=clamp(h,24,state.canvas.h-o.y)}else o.w=w});bindRange("ih",v=>{const h=clamp(v,24,Math.max(24,state.canvas.h-o.y));if(o.aspectLocked){const w=h*(o.w/Math.max(1,o.h));o.h=h;o.w=clamp(w,24,state.canvas.w-o.x)}else o.h=h});bindRange("irot",v=>o.rotation=v);bindRange("irad",v=>o.radius=v);bindRange("isw",v=>o.strokeWidth=v);bindRange("iop",v=>o.opacity=v/100);bindRange("iblur",v=>o.blur=v);bindRange("iback",v=>o.backdropBlur=v);bindRange("ifs",v=>o.fontSize=v);bindRange("ifw",v=>o.fontWeight=v);
 const bind=(id,fn,ev="change")=>{const el=$("#"+id);if(!el)return;el.addEventListener(ev,()=>{beginHistoryOnce();fn(el);endHistory();renderAll()})};
 bind("ilockratio",el=>o.aspectLocked=el.checked);bind("ishadow",el=>o.shadow=el.checked);bind("ifill",el=>o.fill=el.value,"input");bind("ifillhex",el=>{if(/^#[0-9a-f]{6}$/i.test(el.value))o.fill=el.value});bind("istroke",el=>o.stroke=el.value,"input");bind("itcolor",el=>o.textColor=el.value,"input");bind("ialign",el=>o.align=el.value);
 const textEl=$("#itext");
 if(textEl){
   textEl.addEventListener("input",()=>{o.text=textEl.value;renderCanvas();});
   textEl.addEventListener("compositionstart",()=>{textEl.dataset.composing="1";});
   textEl.addEventListener("compositionend",()=>{textEl.dataset.composing="0";o.text=textEl.value;renderCanvas();});
   textEl.addEventListener("blur",()=>{if(textEl.dataset.composing!=="1"){pushHistory();o.text=textEl.value;save();}});
 }
 $("#duplicateBtn").onclick=duplicateSelected;$("#deleteBtn").onclick=deleteSelected;$("#lockBtn").onclick=()=>{beginHistoryOnce();o.locked=!o.locked;endHistory();renderAll()};$("#hideBtn").onclick=()=>{beginHistoryOnce();o.hidden=!o.hidden;endHistory();renderAll()};$("#saveResponsive").onclick=()=>{beginHistoryOnce();const d=devices[state.device];o.responsive=o.responsive||{};o.responsive[state.device]={x:o.x,y:o.y,w:o.w,h:o.h,fontSize:o.fontSize};endHistory();toast(`Saved ${d.label} layout`)};$("#gradientBtn").onclick=gradientStudio;$("#imageStudioBtn").onclick=imageStudio;$("#addImageInside").onclick=addImageToSelected;
}
function deleteSelected(){const p=page(),i=p.objects.findIndex(o=>o.id===state.selected);if(i<0)return toast("Select a layer first");pushHistory();p.objects.splice(i,1);state.selected=null;state.multiSelected=[];save();renderAll();toast("Layer deleted")}
function duplicateSelected(){const o=selected();if(!o)return toast("Select a layer first");pushHistory();const n=normalizeObject(JSON.parse(JSON.stringify(o)));n.id=uid();n.name=(o.name||o.type)+" copy";n.x=clamp(o.x+24,0,state.canvas.w-n.w);n.y=clamp(o.y+24,0,state.canvas.h-n.h);page().objects.push(n);state.selected=n.id;state.multiSelected=[n.id];save();renderAll();toast("Layer duplicated")}

function renderLibrary(){const key=$('.rail-btn.active')?.dataset.panel||"home";const body=$("#libraryBody");const configs={
 home:{title:"Design",desc:"Start a project or choose a starter.",items:[["New Canvas","Any width × height","new"],["Landing Page","Hero + cards + CTA","landing"],["Dashboard","Navigation + stats","dashboard"],["Mobile App","Phone UI starter","mobile"],["Portfolio","Creative showcase","portfolio"],["E-commerce","Product layout","shop"]]},
 templates:{title:"Templates",desc:"Ready-to-edit professional starters.",items:[["Landing Page","Hero + CTA + cards","landing"],["Dashboard","Stats + sidebar","dashboard"],["Mobile App","Mobile product screen","mobile"],["Portfolio","Creative showcase","portfolio"],["E-commerce","Product cards","shop"]]},
 elements:{title:"Elements",desc:"Every button adds a real editable layer.",items:[["Text","Editable text","text"],["Heading","Large typography","heading"],["Body Text","Readable copy","body"],["Card","Container card","card"],["Button","Action button","button"],["Rectangle","Basic shape","shape"],["Circle","Round shape","circle"],["Triangle","Triangle","triangle"],["Diamond","Diamond","diamond"],["Hexagon","Hexagon","hexagon"],["Star","Star","starshape"],["Ellipse","Ellipse","ellipse"],["Line","Line","line"],["Arrow","Arrow","arrowshape"],["Pentagon","Pentagon","pentagon"],["Frame","Responsive frame","frame"],["Image","Upload an image","image"],["Input","Form field","input"],["Navbar","Navigation bar","navbar"],["Chart","Chart container","chart"],["Device Mockup","Phone frame","mockup"]]},
 brand:{title:"Brand",desc:"Project colors, typography and logo.",items:[["Change Logo","Upload project logo","logo"],["Brand Kit","Primary + secondary + font","brand-kit"],["Reset Logo","Use logo.png again","reset-logo"]]},
 styles:{title:"Styles",desc:"Professional visual systems.",items:[["Design Styles","Minimal, glass, luxury","styles"],["Background Studio","Solid + gradients","background"],["Brand Kit","Colors + typography","brand-kit"]]},
 settings:{title:"Settings",desc:"Editor preferences and files.",items:[["Dark","Dark workspace","dark"],["Light","Light workspace","light"],["Export","Project / SVG / PNG / HTML","export"],["Import","Open a DesignForge file","import"],["Reset","Reset local project","reset"]]}
};
 if(key==="stickers"){ $("#drawerTitle").textContent="Stickers";$("#drawerDesc").textContent="Scrapbook paper, tape and decorative pieces.";body.innerHTML=`<input id="stickerSearch" class="search-input" placeholder="Search stickers…"><div class="sticker-grid" id="stickerGrid">${STICKERS.map(s=>`<button class="sticker-card" data-sticker="${s.id}">${s.svg?`<img src="${svgData(s.svg)}" alt="">`:`<div class="sticker-preview">${esc(s.text)}</div>`}<b>${s.name}</b></button>`).join("")}</div>`;$$('[data-sticker]').forEach(b=>b.onclick=()=>addSticker(b.dataset.sticker));$("#stickerSearch").oninput=e=>{$$('#stickerGrid .sticker-card').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase()))};return}
 if(key==="layers"){renderLayers();return}if(key==="pages"){renderPages();return}
 const c=configs[key]||configs.home;$("#drawerTitle").textContent=c.title;$("#drawerDesc").textContent=c.desc;body.innerHTML=`<div class="panel-grid">${c.items.map(i=>`<button class="panel-btn" data-action="${i[2]}"><b>${i[0]}</b><small>${i[1]}</small></button>`).join("")}</div>`;$$('#libraryBody [data-action]').forEach(b=>b.onclick=()=>libraryAction(b.dataset.action))
}
function openPanel(key){document.body.classList.add("library-open");document.body.classList.remove("inspector-open");$$('.rail-btn').forEach(b=>b.classList.toggle('active',b.dataset.panel===key));$("#libraryDrawer").classList.add("open");$("#inspectorDrawer").classList.remove("open");renderLibrary()}
function closePanels(){$("#libraryDrawer").classList.remove("open");$("#inspectorDrawer").classList.remove("open");document.body.classList.remove("library-open","inspector-open")}
function libraryAction(a){switch(a){case"new":return newCanvas();case"landing":return template("landing");case"dashboard":return template("dashboard");case"mobile":return template("mobile");case"portfolio":return template("portfolio");case"shop":return template("shop");case"text":return addText();case"heading":return addHeading();case"body":return addBody();case"shape":return addShape();case"circle":return addCircle();case"triangle":return addTriangle();case"diamond":return addDiamond();case"hexagon":return addHexagon();case"starshape":return addStar();case"ellipse":return addEllipse();case"line":return addLine();case"arrowshape":return addArrow();case"pentagon":return addPentagon();case"card":return addCard();case"button":return addButton();case"frame":return addFrame();case"image":return $("#imageInput").click();case"input":return addInput();case"navbar":return addNavbar();case"chart":return addChart();case"mockup":return addMockup();case"logo":return $("#logoInput").click();case"reset-logo":state.logo="logo.png";setupLogo();save();return toast("Logo reset");case"brand-kit":return brandKit();case"styles":return styleStudio();case"background":return backgroundStudio();case"dark":state.theme="dark";document.body.classList.remove("light");save();return toast("Dark mode");case"light":state.theme="light";document.body.classList.add("light");save();return toast("Light mode");case"export":return exportModal();case"import":return $("#projectInput").click();case"reset":if(confirm("Reset your local DesignForge project?")){localStorage.removeItem(KEY);location.reload()}return;}}

function renderLayers(){const p=page(),body=$("#libraryBody");$("#drawerTitle").textContent="Layers";$("#drawerDesc").textContent=`${p.objects.length} layer${p.objects.length===1?"":"s"} on ${p.name}`;body.innerHTML=`<button class="full-btn" id="layerAdd">＋ New Layer</button>${[...p.objects].reverse().map(o=>`<div class="layer-row ${o.id===state.selected?"active":""}" data-layer="${o.id}"><button class="tiny" data-eye="${o.id}">${o.hidden?"○":"●"}</button><span class="layer-name">${esc(o.name||o.type)}</span><button class="tiny" data-up="${o.id}">↑</button><button class="tiny" data-down="${o.id}">↓</button><button class="tiny" data-lock="${o.id}">${o.locked?"🔒":"🔓"}</button></div>`).join("")||`<div class="empty"><b>No layers yet</b><span>Add something from the bottom toolbar.</span></div>`}`;$("#layerAdd").onclick=()=>openPanel("elements");$$('[data-layer]').forEach(r=>r.onclick=e=>{if(e.target.dataset.eye||e.target.dataset.up||e.target.dataset.down||e.target.dataset.lock)return;state.selected=r.dataset.layer;state.multiSelected=[state.selected];renderAll();if(window.innerWidth<=760)openInspector(true)});$$('[data-eye]').forEach(b=>b.onclick=()=>{const o=page().objects.find(x=>x.id===b.dataset.eye);if(o){pushHistory();o.hidden=!o.hidden;save();renderAll()}});$$('[data-lock]').forEach(b=>b.onclick=()=>{const o=page().objects.find(x=>x.id===b.dataset.lock);if(o){pushHistory();o.locked=!o.locked;save();renderAll()}});$$('[data-up],[data-down]').forEach(b=>b.onclick=e=>{e.stopPropagation();const arr=page().objects,i=arr.findIndex(o=>o.id===(b.dataset.up||b.dataset.down));if(i<0)return;const ni=b.dataset.up?Math.min(arr.length-1,i+1):Math.max(0,i-1);if(ni===i)return;pushHistory();[arr[i],arr[ni]]=[arr[ni],arr[i]];save();renderAll()})}
function renderPages(){const body=$("#libraryBody");$("#drawerTitle").textContent="Pages";$("#drawerDesc").textContent="Organize multiple screens.";body.innerHTML=`<button class="full-btn" id="addPage">＋ New Page</button>${state.pages.map(p=>`<div class="layer-row ${p.id===state.pageId?"active":""}" data-page="${p.id}"><span style="text-align:center">▤</span><span class="layer-name">${esc(p.name)}</span><button class="tiny" data-delpage="${p.id}">×</button></div>`).join("")}`;$("#addPage").onclick=()=>{pushHistory();const p={id:uid(),name:"Page "+(state.pages.length+1),objects:[]};state.pages.push(p);state.pageId=p.id;state.selected=null;save();renderAll()};$$('[data-page]').forEach(r=>r.onclick=e=>{if(e.target.dataset.delpage)return;state.pageId=r.dataset.page;state.selected=null;state.multiSelected=[];renderAll()});$$('[data-delpage]').forEach(b=>b.onclick=e=>{e.stopPropagation();if(state.pages.length===1)return toast("Keep one page");pushHistory();state.pages=state.pages.filter(p=>p.id!==b.dataset.delpage);state.pageId=state.pages[0].id;state.selected=null;save();renderAll()})}

function createDesignType(){const types=[["Website","1100×700","landing"],["Mobile App UI","390×844","mobile"],["Dashboard","1440×900","dashboard"],["Landing Page","1440×900","landing"],["Social Post","1080×1080","social"],["Story","1080×1920","story"],["Presentation","1920×1080","presentation"],["Poster","1080×1350","poster"],["Business Card","1050×600","carddesign"],["Resume / CV","794×1123","resume"],["YouTube Thumbnail","1280×720","thumbnail"],["Logo Board","1000×1000","logo-board"]];openModal("Create New Design","Choose a canvas and starter.",`<div class="design-grid">${types.map(t=>`<button class="option-card" data-design="${t[2]}" data-label="${t[0]}"><b>${t[0]}</b><small>${t[1]}</small></button>`).join("")}</div>`);$$('[data-design]').forEach(b=>b.onclick=()=>{closeModal();startDesign(b.dataset.design,b.dataset.label)})}
function startDesign(kind,label){pushHistory();state.designType=label;state.project=label+" Project";const p=page();p.objects=[];const sizes={mobile:[390,844],social:[1080,1080],story:[1080,1920],presentation:[1920,1080],poster:[1080,1350],carddesign:[1050,600],resume:[794,1123],thumbnail:[1280,720],"logo-board":[1000,1000],dashboard:[1440,900],landing:[1440,900]};const [w,h]=sizes[kind]||[1100,700];state.canvas={w,h,bg:"#ffffff",backgroundType:"solid",backgroundValue:"#ffffff"};state.device=kind==="mobile"?"mobile":kind==="presentation"||kind==="dashboard"?"desktop":"custom";if(["landing","dashboard","mobile"].includes(kind))template(kind);else if(kind==="social")p.objects=[object("text",{name:"Headline",text:"YOUR STORY STARTS HERE",x:90,y:110,w:900,h:90,fontSize:62,fontWeight:800,fill:"#172337"}),object("text",{name:"Caption",text:"Create something memorable.",x:95,y:215,w:650,h:60,fontSize:26,fill:"#64748b"}),object("shape",{name:"Accent",x:90,y:310,w:180,h:12,fill:state.brand.primary,radius:999})];else if(kind==="story")p.objects=[object("shape",{name:"Story Background",x:0,y:0,w,h,fill:"#0b1220",radius:0}),object("text",{name:"Story Title",text:"NEW STORY",x:45,y:100,w:300,h:70,fontSize:42,fontWeight:800,fill:"#fff"}),object("button",{name:"CTA",x:45,y:h-130,w:300,h:58,text:"Swipe Up",fill:state.brand.primary})];else if(kind==="presentation")p.objects=[object("text",{name:"Slide Title",text:"Presentation Title",x:100,y:120,w:1000,h:100,fontSize:70,fontWeight:800,fill:"#172337"}),object("text",{name:"Slide Subtitle",text:"A clean professional presentation",x:105,y:245,w:800,h:60,fontSize:25,fill:"#64748b"})];else p.objects=[object("text",{name:"Title",text:label,x:70,y:70,w:650,h:90,fontSize:54,fontWeight:800,fill:"#172337"}),object("card",{name:"Card 1",x:70,y:210,w:280,h:190,fill:"#eef4ff"}),object("card",{name:"Card 2",x:390,y:210,w:280,h:190,fill:"#eef8f1"}),object("card",{name:"Card 3",x:710,y:210,w:280,h:190,fill:"#fff3e8"})];state.selected=null;state.multiSelected=[];save();renderAll();requestAnimationFrame(fitWorkspace);toast("Design created")}
function template(kind){pushHistory();const p=page();p.objects=[];if(kind==="landing"){p.objects=[object("text",{name:"Hero Title",text:"Design Without Limits",x:90,y:100,w:620,h:90,fontSize:58,fontWeight:800,fill:"#172337"}),object("text",{name:"Hero Copy",text:"Create beautiful responsive websites and interfaces anywhere.",x:95,y:200,w:520,h:80,fontSize:19,fill:"#64748b"}),object("button",{x:95,y:305}),object("card",{x:710,y:100,w:300,h:300,fill:"#eaf1ff"})]};if(kind==="dashboard"){p.objects=[object("shape",{name:"Sidebar",x:25,y:25,w:200,h:650,fill:"#101d31",radius:18}),object("text",{name:"Dashboard Title",text:"Dashboard",x:270,y:55,w:400,h:60,fontSize:40,fontWeight:800,fill:"#172337"}),object("card",{name:"Revenue",x:270,y:150,w:220,h:150,fill:"#eef5ff"}),object("card",{name:"Users",x:515,y:150,w:220,h:150,fill:"#f0fbf7"}),object("card",{name:"Orders",x:760,y:150,w:220,h:150,fill:"#fff5e9"})]};if(kind==="mobile"){p.objects=[object("text",{name:"Welcome",text:"Welcome back",x:28,y:70,w:330,h:55,fontSize:32,fontWeight:800,fill:"#172337"}),object("card",{name:"Feature",x:28,y:155,w:334,h:175,fill:"#e9f1ff"}),object("button",{x:28,y:360,w:334}),object("card",{name:"Recent",x:28,y:440,w:334,h:110})];state.canvas={w:390,h:844,bg:"#f8fafc",backgroundType:"solid",backgroundValue:"#f8fafc"};state.device="mobile"}if(kind==="portfolio"){p.objects=[object("text",{text:"Creative Portfolio",x:70,y:70,w:650,h:70,fontSize:50,fontWeight:800,fill:"#172337"}),object("card",{x:70,y:190,w:285,h:190,fill:"#e8eef8"}),object("card",{x:400,y:190,w:285,h:190,fill:"#eaf8f1"}),object("card",{x:730,y:190,w:285,h:190,fill:"#fff0e7"})]};if(kind==="shop"){p.objects=[object("text",{text:"Modern Store",x:70,y:65,w:500,h:70,fontSize:52,fontWeight:800,fill:"#172337"}),object("card",{x:70,y:190,w:260,h:320,fill:"#f1f5f9"}),object("card",{x:400,y:190,w:260,h:320,fill:"#eef2ff"}),object("card",{x:730,y:190,w:260,h:320,fill:"#f0fdf4"})]};state.selected=null;state.multiSelected=[];save();renderAll();requestAnimationFrame(fitWorkspace);toast("Template ready")}

function newCanvas(){openModal("New Canvas","Choose a preset or create a custom size.",`<div class="option-grid"><button class="option-card" data-size="1100x700"><b>Website</b><small>1100 × 700</small></button><button class="option-card" data-size="1440x900"><b>Desktop</b><small>1440 × 900</small></button><button class="option-card" data-size="768x1024"><b>Tablet</b><small>768 × 1024</small></button><button class="option-card" data-size="390x844"><b>Phone</b><small>390 × 844</small></button><button class="option-card" data-size="1080x1080"><b>Social Post</b><small>1080 × 1080</small></button><button class="option-card" id="customSize"><b>Custom</b><small>50–10000 px</small></button></div>`);$$('[data-size]').forEach(b=>b.onclick=()=>{const [w,h]=b.dataset.size.split('x').map(Number);pushHistory();state.canvas={w,h,bg:"#ffffff",backgroundType:"solid",backgroundValue:"#ffffff"};page().objects=[];state.selected=null;state.multiSelected=[];state.device=w===390?"mobile":w===768?"tablet":w===1440?"desktop":"custom";save();closeModal();renderAll();requestAnimationFrame(fitWorkspace);toast("Canvas created")});$("#customSize").onclick=()=>openModal("Custom Canvas","Enter exact design dimensions.",`<div class="row"><label class="field"><span>Width</span><input id="cw" type="number" min="50" max="10000" value="${state.canvas.w}"></label><label class="field"><span>Height</span><input id="ch" type="number" min="50" max="10000" value="${state.canvas.h}"></label></div><button id="applyCustom" class="full-btn primary">Create Canvas</button>`);$("#applyCustom").onclick=()=>{const w=Number($("#cw").value),h=Number($("#ch").value);if(!Number.isFinite(w)||!Number.isFinite(h)||w<50||h<50||w>10000||h>10000)return toast("Use 50–10000 px");pushHistory();state.canvas={w,h,bg:"#fff",backgroundType:"solid",backgroundValue:"#fff"};page().objects=[];state.selected=null;state.multiSelected=[];state.device="custom";save();closeModal();renderAll();requestAnimationFrame(fitWorkspace);toast("Custom canvas created")}}

function openModal(title,subtitle,html){$("#modalTitle").textContent=title;$("#modalSubtitle").textContent=subtitle||"";$("#modalBody").innerHTML=html;$("#modal").classList.remove("hidden");$("#modal").setAttribute("aria-hidden","false")}
function closeModal(){$("#modal").classList.add("hidden");$("#modal").setAttribute("aria-hidden","true")}
function renameProject(){openModal("Rename Project","Give this design a clear project name.",`<label class="field"><span>Project name</span><input id="projectName" value="${esc(state.project)}" autofocus></label><button id="saveProjectName" class="full-btn primary">Save Project Name</button>`);$("#saveProjectName").onclick=()=>{const v=$("#projectName").value.trim();if(!v)return toast("Enter a project name");pushHistory();state.project=v;save();closeModal();toast("Project renamed")}}
function brandKit(){openModal("Brand Kit","Set colors and typography used by new elements.",`<div class="row"><label class="field"><span>Primary</span><input id="brand1" type="color" value="${hex(state.brand.primary)}"></label><label class="field"><span>Secondary</span><input id="brand2" type="color" value="${hex(state.brand.secondary)}"></label></div><label class="field"><span>Font family</span><input id="brandfont" value="${esc(state.brand.font)}"></label><button id="brandSave" class="full-btn primary">Save Brand Kit</button>`);$("#brandSave").onclick=()=>{pushHistory();state.brand.primary=$("#brand1").value;state.brand.secondary=$("#brand2").value;state.brand.font=$("#brandfont").value||"Inter";save();closeModal();renderAll();toast("Brand kit saved")}}
function styleStudio(){const styles=[["Minimal","#172337","#edf3fa"],["Ocean","#0b3d5c","#dff5ff"],["Berry","#5b214d","#fff0fa"],["Forest","#164b3d","#e9fbf3"],["Sunset","#7a3b0b","#fff4e6"],["Futuristic","#eef2ff","#0b1020"]];openModal("Design Styles","Apply a visual style to the current page.",`<div class="option-grid">${styles.map(s=>`<button class="option-card" data-style="${s[0]}" data-a="${s[1]}" data-b="${s[2]}"><b>${s[0]}</b><small>Primary ${s[1]} · Surface ${s[2]}</small></button>`).join("")}</div>`);$$('[data-style]').forEach(b=>b.onclick=()=>{pushHistory();state.brand.primary=b.dataset.a;page().objects.filter(o=>o.type==="button"||o.type==="shape").forEach(o=>o.fill=b.dataset.a);state.canvas.bg=b.dataset.b;state.canvas.backgroundType="solid";save();closeModal();renderAll();toast("Style applied")})}
function backgroundStudio(){openModal("Background Studio","Choose a solid or gradient canvas background.",`<label class="field"><span>Type</span><select id="bgType"><option value="solid">Solid</option><option value="gradient">Gradient</option></select></label><div class="row"><label class="field"><span>Color A</span><input id="bgA" type="color" value="${hex(state.canvas.bg)}"></label><label class="field"><span>Color B</span><input id="bgB" type="color" value="#7c3aed"></label></div><label class="field"><span>Angle <output id="bgAngleOut">135°</output></span><input id="bgAngle" type="range" min="0" max="360" value="135" class="range"></label><button id="bgApply" class="full-btn primary">Apply Background</button>`);$("#bgAngle").oninput=e=>$("#bgAngleOut").textContent=e.target.value+"°";$("#bgApply").onclick=()=>{pushHistory();const type=$("#bgType").value,a=$("#bgA").value,b=$("#bgB").value,ang=$("#bgAngle").value;state.canvas.backgroundType=type;state.canvas.backgroundValue=type==="gradient"?`linear-gradient(${ang}deg,${a},${b})`:a;state.canvas.bg=a;save();closeModal();renderAll();toast("Background updated")}}
function gradientStudio(){const o=selected();openModal("Gradient Studio","Apply a gradient to the selected layer or canvas.",`<label class="field"><span>Target</span><select id="gradTarget"><option value="layer">Selected layer</option><option value="canvas">Canvas</option></select></label><div class="row"><label class="field"><span>Color A</span><input id="gradA" type="color" value="#4e8cff"></label><label class="field"><span>Color B</span><input id="gradB" type="color" value="#7c3aed"></label></div><label class="field"><span>Angle <output id="gradAngleOut">135°</output></span><input id="gradAngle" class="range" type="range" min="0" max="360" value="135"></label><button id="gradApply" class="full-btn primary">Apply Gradient</button>`);$("#gradAngle").oninput=e=>$("#gradAngleOut").textContent=e.target.value+"°";$("#gradApply").onclick=()=>{const t=$("#gradTarget").value,a=$("#gradA").value,b=$("#gradB").value,g=`linear-gradient(${$("#gradAngle").value}deg,${a},${b})`;if(t==="layer"&&!o)return toast("Select a layer first");pushHistory();if(t==="canvas"){state.canvas.backgroundType="gradient";state.canvas.backgroundValue=g}else o.fill=g;save();closeModal();renderAll();toast("Gradient applied")}}
function imageStudio(){const o=selected();if(!o||o.type!=="image")return toast("Select an image layer first");openModal("Image Studio","Tune brightness, contrast and saturation.",`<div class="row"><label class="field"><span>Brightness <output id="bOut">100%</output></span><input id="b" type="range" class="range" min="0" max="200" value="100"></label><label class="field"><span>Contrast <output id="cOut">100%</output></span><input id="c" type="range" class="range" min="0" max="200" value="100"></label></div><div class="row"><label class="field"><span>Saturation <output id="sOut">100%</output></span><input id="s" type="range" class="range" min="0" max="200" value="100"></label><label class="field"><span>Blur <output id="blOut">${o.blur||0}px</output></span><input id="bl" type="range" class="range" min="0" max="30" value="${o.blur||0}"></label></div><button id="imgApply" class="full-btn primary">Apply Image Effects</button>`);[["b","bOut","%"],["c","cOut","%"],["s","sOut","%"],["bl","blOut","px"]].forEach(([id,out,suf])=>$("#"+id).oninput=e=>$("#"+out).textContent=e.target.value+suf);$("#imgApply").onclick=()=>{pushHistory();o.imageFilter=`brightness(${$("#b").value}%) contrast(${$("#c").value}%) saturate(${$("#s").value}%)`;o.blur=Number($("#bl").value);save();closeModal();renderAll();toast("Image effects applied")}}

function groupSelected(){const ids=new Set(state.multiSelected||[]);if(ids.size<2&&state.selected)ids.add(state.selected);if(ids.size<2)return toast("Select 2+ layers with Shift");const kids=page().objects.filter(o=>ids.has(o.id));pushHistory();const minX=Math.min(...kids.map(o=>o.x)),minY=Math.min(...kids.map(o=>o.y)),maxX=Math.max(...kids.map(o=>o.x+o.w)),maxY=Math.max(...kids.map(o=>o.y+o.h));const g=object("frame",{name:"Group",x:minX-12,y:minY-12,w:maxX-minX+24,h:maxY-minY+24,fill:"transparent",stroke:"#64748b",strokeWidth:1});page().objects.push(g);kids.forEach(o=>o.parentId=g.id);state.selected=g.id;state.multiSelected=[g.id];save();renderAll();toast("Group created")}
function autoLayout(){const o=selected();if(!o)return toast("Select a container first");pushHistory();o.autoLayout=true;o.layoutDirection="horizontal";const kids=page().objects.filter(x=>x.id!==o.id&&!x.hidden&&x.x>=o.x&&x.x<=o.x+o.w&&x.y>=o.y&&x.y<=o.y+o.h);let x=o.x+(o.layoutPadding||16),y=o.y+(o.layoutPadding||16);kids.forEach(k=>{k.x=x;k.y=y;x+=k.w+(o.layoutGap||16)});save();renderAll();toast("Auto Layout applied")}
function prototypeLink(){const o=selected();if(!o)return toast("Select a layer first");openModal("Prototype Interaction","Choose a page to open when this layer is clicked in Preview.",`<label class="field"><span>Open page</span><select id="protoPage">${state.pages.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label><label class="field"><span>Transition</span><select id="protoAnim"><option>Instant</option><option>Fade</option><option>Slide</option></select></label><button id="protoSave" class="full-btn primary">Save Interaction</button>`);$("#protoPage").value=o.prototype?.target||state.pages[0].id;$("#protoAnim").value=o.prototype?.animation||"Instant";$("#protoSave").onclick=()=>{pushHistory();o.prototype={target:$("#protoPage").value,animation:$("#protoAnim").value};save();closeModal();toast("Prototype interaction saved")}}
function smartAssistant(){openModal("✦ Design Assistant","Quick quality tools for your current workspace.",`<div class="option-grid"><button class="option-card" data-assist="fit"><b>Fit Canvas</b><small>Recalculate the best view</small></button><button class="option-card" data-assist="center"><b>Center Selected</b><small>Move selected layer to center</small></button><button class="option-card" data-assist="clean"><b>Clean Layout</b><small>Keep layers inside canvas</small></button><button class="option-card" data-assist="health"><b>Workspace Health</b><small>Run a quick editor check</small></button></div>`);$$('[data-assist]').forEach(b=>b.onclick=()=>{const a=b.dataset.assist;if(a==="fit"){closeModal();fitWorkspace();toast("Canvas fitted")};if(a==="center"){const o=selected();if(!o)return toast("Select a layer");pushHistory();o.x=(state.canvas.w-o.w)/2;o.y=(state.canvas.h-o.h)/2;save();closeModal();renderAll();toast("Layer centered")};if(a==="clean"){pushHistory();page().objects.forEach(o=>{o.x=clamp(o.x,0,state.canvas.w-o.w);o.y=clamp(o.y,0,state.canvas.h-o.h)});save();closeModal();renderAll();toast("Layout cleaned")};if(a==="health"){const issues=[];if(!(state.canvas.w>0&&state.canvas.h>0))issues.push("canvas size");const ids=new Set();page().objects.forEach(o=>{if(ids.has(o.id))issues.push("duplicate id");ids.add(o.id)});closeModal();toast(issues.length?"Check: "+issues.join(", "):"Workspace healthy")}})}
function moreTop(){openModal("More Tools","Advanced editor actions.",`<div class="option-grid"><button class="option-card" id="assistantOpen"><b>✦ Assistant</b><small>Quality and layout tools</small></button><button class="option-card" id="prototypeOpen"><b>⌁ Prototype</b><small>Link layers to pages</small></button><button class="option-card" id="themeOpen"><b>☾ Theme</b><small>Switch light / dark</small></button><button class="option-card" id="touchOpen"><b>☝ Touch</b><small>Toggle large touch handles</small></button><button class="option-card" id="commandOpen"><b>⌘ Search</b><small>Find actions quickly</small></button><button class="option-card" id="exportOpen"><b>⇩ Export</b><small>Project / SVG / PNG / HTML</small></button></div>`);$("#assistantOpen").onclick=()=>{closeModal();smartAssistant()};$("#prototypeOpen").onclick=()=>{closeModal();prototypeLink()};$("#themeOpen").onclick=()=>{closeModal();state.theme=state.theme==="dark"?"light":"dark";save();renderAll();toast("Theme updated")};$("#touchOpen").onclick=()=>{closeModal();state.touchMode=!state.touchMode;document.body.classList.toggle("touch-active",state.touchMode);save();renderAll();toast(state.touchMode?"Touch handles on":"Touch handles off")};$("#commandOpen").onclick=()=>{closeModal();commandSearch()};$("#exportOpen").onclick=()=>{closeModal();exportModal()}}
function commandSearch(){openModal("⌘ Search","Search any DesignForge action.",`<input id="cmd" class="search-input" placeholder="Try: sticker, new canvas, export, grid…"><div id="cmdList" class="option-grid" style="margin-top:9px">${[["New Canvas","new"],["New Layer","layer"],["Stickers","stickers"],["Layers","layers"],["Fit Canvas","fit"],["Gradient Studio","gradient"],["Image Studio","image"],["Export","export"],["Assistant","assistant"],["Prototype","prototype"]].map(x=>`<button class="option-card" data-cmd="${x[1]}"><b>${x[0]}</b></button>`).join("")}</div>`);const run=a=>{closeModal();switch(a){case"new":newCanvas();break;case"layer":openPanel("elements");break;case"stickers":openPanel("stickers");break;case"layers":openPanel("layers");break;case"fit":fitWorkspace();break;case"gradient":gradientStudio();break;case"image":imageStudio();break;case"export":exportModal();break;case"assistant":smartAssistant();break;case"prototype":prototypeLink();break}};$$('[data-cmd]').forEach(b=>b.onclick=()=>run(b.dataset.cmd));$("#cmd").oninput=e=>$$('[data-cmd]').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase()))}

function exportModal(){openModal("Export","Choose a format.",`<div class="option-grid"><button class="option-card" id="exProject"><b>DesignForge Project</b><small>Editable .designforge file</small></button><button class="option-card" id="exSVG"><b>SVG</b><small>Vector export</small></button><button class="option-card" id="exPNG"><b>PNG</b><small>Image export</small></button><button class="option-card" id="exHTML"><b>Responsive HTML</b><small>Single file website</small></button></div>`);$("#exProject").onclick=()=>{download(new Blob([JSON.stringify({format:"DesignForge",version:25,...JSON.parse(snapshot())},null,2)],{type:"application/json"}),safeName()+".designforge");closeModal();toast("Project exported")};$("#exSVG").onclick=()=>{download(new Blob([makeSVG()],{type:"image/svg+xml"}),safeName()+".svg");closeModal();toast("SVG exported")};$("#exPNG").onclick=()=>exportPNG();$("#exHTML").onclick=()=>{download(new Blob([makeHTML()],{type:"text/html"}),safeName()+".html");closeModal();toast("HTML exported")}}
function makeSVG(objects=page().objects){const body=objects.filter(o=>!o.hidden).map(o=>{const fill=o.fill==="transparent"?"none":o.fill;if(o.type==="text"||o.type==="button")return `<g transform="translate(${o.x} ${o.y}) rotate(${o.rotation} ${o.w/2} ${o.h/2})"><rect width="${o.w}" height="${o.h}" rx="${o.radius}" fill="${fill}" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" opacity="${o.opacity}"/><text x="${o.w/2}" y="${o.h/2+o.fontSize/3}" text-anchor="middle" font-family="Arial" font-size="${o.fontSize}" font-weight="${o.fontWeight}" fill="${o.type==="button"?o.textColor:o.fill}">${xmlEsc(o.text)}</text></g>`;if((o.type==="image"||o.type==="sticker")&&o.src)return `<image href="${o.src}" x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" preserveAspectRatio="${o.type==="sticker"?"xMidYMid meet":"xMidYMid slice"}" opacity="${o.opacity}" transform="rotate(${o.rotation} ${o.x+o.w/2} ${o.y+o.h/2})"/>`;return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="${o.radius}" fill="${fill}" stroke="${o.stroke}" stroke-width="${o.strokeWidth}" opacity="${o.opacity}" transform="rotate(${o.rotation} ${o.x+o.w/2} ${o.y+o.h/2})"/>`}).join("");const bg=state.canvas.backgroundType==="gradient"?`<rect width="100%" height="100%" fill="${state.canvas.backgroundValue}"/>`:`<rect width="100%" height="100%" fill="${state.canvas.bg}"/>`;return `<svg xmlns="http://www.w3.org/2000/svg" width="${state.canvas.w}" height="${state.canvas.h}" viewBox="0 0 ${state.canvas.w} ${state.canvas.h}">${bg}${body}</svg>`}
function exportPNG(){const svg=makeSVG(),blob=new Blob([svg],{type:"image/svg+xml"}),url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=state.canvas.w;c.height=state.canvas.h;const ctx=c.getContext("2d");ctx.drawImage(img,0,0);c.toBlob(b=>{download(b,safeName()+".png");URL.revokeObjectURL(url);closeModal();toast("PNG exported")},"image/png")};img.onerror=()=>{URL.revokeObjectURL(url);toast("PNG export failed")};img.src=url}
function makeHTML(){const body=page().objects.filter(o=>!o.hidden).map(o=>{let content="";if(o.type==="text"||o.type==="button")content=esc(o.text);if((o.type==="image"||o.type==="sticker")&&o.src)content=`<img src="${o.src}" alt="">`;return `<div class="obj o${o.type}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;transform:rotate(${o.rotation}deg);opacity:${o.opacity};background:${o.fill};border:${o.strokeWidth}px solid ${o.stroke};border-radius:${o.radius}px">${content}</div>`}).join("");return `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(state.project)}</title><style>*{box-sizing:border-box}html,body{margin:0;background:#0c1725;font-family:Inter,system-ui}.page{width:${state.canvas.w}px;height:${state.canvas.h}px;position:relative;margin:30px auto;background:${state.canvas.bg};overflow:hidden}@media(max-width:760px){.page{transform-origin:top center;transform:scale(.9);margin:12px auto}}.obj{position:absolute;display:flex;align-items:center;justify-content:center;padding:6px;white-space:pre-wrap;overflow:hidden}.obj.oimage img,.obj.osticker img{width:100%;height:100%;object-fit:cover}.obj.osticker img{object-fit:contain}</style><main class="page">${body}</main>`}

function openPreview(){const frame=$("#previewViewport");frame.innerHTML="";const stage=document.createElement("div");stage.className="preview-stage";stage.style.width=state.canvas.w+"px";stage.style.height=state.canvas.h+"px";stage.style.background=state.canvas.backgroundType==="gradient"?state.canvas.backgroundValue:state.canvas.bg;page().objects.filter(o=>!o.hidden).forEach(o=>stage.appendChild(renderObject(o,true)));frame.appendChild(stage);fitPreviewStage();frame.onclick=e=>{const obj=e.target.closest(".obj");if(!obj)return;const target=obj.dataset.prototype;if(!target)return;state.pageId=target;openPreview()};$("#previewOverlay").classList.remove("hidden");document.body.classList.add("previewing")}
function fitPreviewStage(){const frame=$("#previewViewport"),stage=frame.querySelector(".preview-stage");if(!stage)return;const z=clamp(Math.min((frame.clientWidth-30)/state.canvas.w,(frame.clientHeight-30)/state.canvas.h),.08,1);stage.style.transform=`translate(-50%,-50%) scale(${z})`}
function closePreview(){$("#previewOverlay").classList.add("hidden");document.body.classList.remove("previewing")}

function setupTouch(){
 const vp=$("#viewport");
 // Reliable Android/iOS pinch handling. Pointer capture keeps both fingers
 // attached to the editor even when a finger starts over a canvas object.
 const beginPinch=(pts)=>{
   if(pts.length<2)return;
   const a=pts[0],b=pts[1];
   const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
   const dist=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
   const r=vp.getBoundingClientRect();
   const fx=center.x-r.left,fy=center.y-r.top;
   const centerX=vp.clientWidth/2+state.panX,centerY=vp.clientHeight/2+state.panY;
   pinch={dist,center,zoom:state.zoom,panX:state.panX,panY:state.panY,
     canvasPoint:{x:(fx-centerX)/state.zoom+state.canvas.w/2,y:(fy-centerY)/state.zoom+state.canvas.h/2}};
   drag=resizing=rotating=null;historyArmed=false;
 };
 const movePinch=(pts)=>{
   if(pts.length<2||!pinch)return;
   const a=pts[0],b=pts[1];
   const dist=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
   const center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
   const nz=clamp(pinch.zoom*(dist/pinch.dist),.25,3);
   const r=vp.getBoundingClientRect();
   const fx=pinch.center.x-r.left,fy=pinch.center.y-r.top;
   const newCenterX=fx-(pinch.canvasPoint.x-state.canvas.w/2)*nz;
   const newCenterY=fy-(pinch.canvasPoint.y-state.canvas.h/2)*nz;
   state.zoom=nz;
   state.panX=newCenterX-vp.clientWidth/2+(center.x-pinch.center.x);
   state.panY=newCenterY-vp.clientHeight/2+(center.y-pinch.center.y);
   applyTransform();updateZoomUi();
 };
 window.addEventListener("pointerdown",e=>{
   if(e.pointerType!=="touch")return;
   touchPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(touchPointers.size===2)beginPinch([...touchPointers.values()]);
 },{passive:false});
 window.addEventListener("pointermove",e=>{
   if(e.pointerType!=="touch"||!touchPointers.has(e.pointerId))return;
   touchPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(touchPointers.size>=2&&pinch){if(e.cancelable)e.preventDefault();movePinch([...touchPointers.values()]);}
 },{passive:false});
 const endPointer=e=>{
   if(e.pointerType!=="touch")return;
   touchPointers.delete(e.pointerId);
   try{vp.releasePointerCapture?.(e.pointerId)}catch{}
   if(touchPointers.size<2&&pinch){pinch=null;save();}
 };
 window.addEventListener("pointerup",endPointer,{passive:true});
 window.addEventListener("pointercancel",endPointer,{passive:true});
 // Native touch fallback makes pinch reliable on browsers that suppress a
 // second pointer stream while the keyboard/editor is active.
 let touchGesture=null;
 vp.addEventListener("touchstart",e=>{
   if(e.touches.length<2)return;
   e.preventDefault();
   const pts=[...e.touches].slice(0,2).map(t=>({x:t.clientX,y:t.clientY}));
   const a=pts[0],b=pts[1],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
   const r=vp.getBoundingClientRect();
   const fx=center.x-r.left,fy=center.y-r.top;
   const centerX=vp.clientWidth/2+state.panX,centerY=vp.clientHeight/2+state.panY;
   touchGesture={dist:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),center,zoom:state.zoom,
     canvasPoint:{x:(fx-centerX)/state.zoom+state.canvas.w/2,y:(fy-centerY)/state.zoom+state.canvas.h/2}};
   drag=resizing=rotating=null;historyArmed=false;
 },{passive:false});
 vp.addEventListener("touchmove",e=>{
   if(e.touches.length<2||!touchGesture)return;
   e.preventDefault();
   const pts=[...e.touches].slice(0,2).map(t=>({x:t.clientX,y:t.clientY}));
   const a=pts[0],b=pts[1],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
   const dist=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));
   const nz=clamp(touchGesture.zoom*(dist/touchGesture.dist),.25,3);
   const r=vp.getBoundingClientRect(),fx=touchGesture.center.x-r.left,fy=touchGesture.center.y-r.top;
   const newCenterX=fx-(touchGesture.canvasPoint.x-state.canvas.w/2)*nz;
   const newCenterY=fy-(touchGesture.canvasPoint.y-state.canvas.h/2)*nz;
   state.zoom=nz;
   state.panX=newCenterX-vp.clientWidth/2+(center.x-touchGesture.center.x);
   state.panY=newCenterY-vp.clientHeight/2+(center.y-touchGesture.center.y);
   applyTransform();updateZoomUi();
 },{passive:false});
 const endTouch=()=>{if(touchGesture){touchGesture=null;save();}};
 vp.addEventListener("touchend",endTouch,{passive:true});vp.addEventListener("touchcancel",endTouch,{passive:true});
 vp.addEventListener("wheel",e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();const dir=e.deltaY<0?1.08:.92;setZoom(state.zoom*dir,{x:e.clientX,y:e.clientY})}},{passive:false});
}
function setupViewportPan(){let mid=null,space=null;const vp=$("#viewport");vp.addEventListener("pointerdown",e=>{if(e.pointerType==="touch")return;if(e.button===1||e.button===0&&state.panMode||e.button===0&&e.target===vp&&e.altKey){e.preventDefault();mid={x:e.clientX,y:e.clientY,px:state.panX,py:state.panY};vp.setPointerCapture?.(e.pointerId)}});window.addEventListener("pointermove",e=>{if(!mid)return;if(e.cancelable)e.preventDefault();state.panX=mid.px+(e.clientX-mid.x);state.panY=mid.py+(e.clientY-mid.y);applyTransform()},{passive:false});window.addEventListener("pointerup",()=>{if(mid){mid=null;save()}});window.addEventListener("keydown",e=>{if(e.code==="Space"&&!e.repeat){space=true;vp.classList.add("space-pan")}});window.addEventListener("keyup",e=>{if(e.code==="Space"){space=false;vp.classList.remove("space-pan")}});vp.addEventListener("pointerdown",e=>{if(space&&!mid&&e.pointerType!=="touch"){e.preventDefault();mid={x:e.clientX,y:e.clientY,px:state.panX,py:state.panY};vp.setPointerCapture?.(e.pointerId)}})}

function setupOfflineApp(){
 const bar=$("#offlineBar");
 const update=()=>{ if(bar){bar.hidden=navigator.onLine; if(!navigator.onLine) bar.textContent="Offline mode • Your local project is available on this device"; } };
 window.addEventListener("online",update); window.addEventListener("offline",update); update();
 let deferred=null; const btn=$("#installBtn");
 window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;if(btn)btn.hidden=false;});
 if(btn)btn.onclick=async()=>{ if(!deferred)return; deferred.prompt(); try{await deferred.userChoice}catch{} deferred=null; btn.hidden=true; };
 window.addEventListener("appinstalled",()=>{if(btn)btn.hidden=true;toast("DesignForge installed");});
}

function initEvents(){
 $("#modalClose").onclick=closeModal;$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});$("#closeLibrary").onclick=()=>{$("#libraryDrawer").classList.remove("open");document.body.classList.remove("library-open")};$("#closeInspector").onclick=()=>{$("#inspectorDrawer").classList.remove("open");document.body.classList.remove("inspector-open")};$("#homeBtn").onclick=()=>openPanel("home");$("#createBtn").onclick=createDesignType;$("#projectBtn").onclick=renameProject;$("#undoBtn").onclick=undo;$("#redoBtn").onclick=redo;$("#fitBtn").onclick=fitWorkspace;$("#hudFit").onclick=fitWorkspace;$("#resetViewBtn").onclick=resetView;$("#hudZoomOut").onclick=()=>setZoom(state.zoom*.9);$("#hudZoomIn").onclick=()=>setZoom(state.zoom*1.1);$("#zoomOut").onclick=()=>setZoom(state.zoom-.1);$("#zoomIn").onclick=()=>setZoom(state.zoom+.1);$("#zoomSlider").oninput=e=>setZoom(Number(e.target.value)/100);$("#newCanvas").onclick=newCanvas;$("#newLayer").onclick=()=>openPanel("elements");$("#groupBtn").onclick=groupSelected;$("#layoutBtn").onclick=autoLayout;$("#gridBtn").onclick=()=>{pushHistory();state.grid=!state.grid;save();renderCanvas();toast(state.grid?"Grid on":"Grid off")};$("#snapBtn").onclick=()=>{state.snap=!state.snap;$("#snapBtn").classList.toggle("active-mini",state.snap);save();toast(state.snap?"Snap on":"Snap off")};$("#moreTools").onclick=()=>moreTop();$("#moreTopBtn").onclick=moreTop;$("#previewBtn").onclick=openPreview;$("#closePreview").onclick=closePreview;$("#exportBtn").onclick=exportModal;
 $$('.device-chip[data-device]').forEach(b=>b.onclick=()=>{state.device=b.dataset.device;updateDeviceChips();save();renderCanvas();toast(devices[state.device].label+" preview")});
 $$('.rail-btn').forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));$$('.tool[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));$$('.mobile-dock button').forEach(b=>b.onclick=()=>{const a=b.dataset.mobile;if(a==="design")openPanel("elements");else if(a==="stickers")openPanel("stickers");else if(a==="layers")openPanel("layers");else if(a==="add")openPanel("elements");else if(a==="edit")openInspector(false)});
 $("#canvas").addEventListener("pointerdown",e=>{if(e.target===e.currentTarget||e.target.id==="objects"){if(state.panMode)return;state.selected=null;state.multiSelected=[];renderAll()}});
 let lastViewportHeight=window.innerHeight;
 let keyboardOpen=false;
 const handleViewportResize=()=>{
   const vv=window.visualViewport;
   const h=vv?vv.height:window.innerHeight;
   keyboardOpen=(lastViewportHeight-h)>120 || document.activeElement?.matches?.("input,textarea,[contenteditable=true]");
   lastViewportHeight=h;
   if(keyboardOpen)return;
   clearTimeout(saveTimer);saveTimer=setTimeout(()=>{fitWorkspace();fitPreviewStage()},120);
 };
 window.addEventListener("resize",handleViewportResize);
 window.visualViewport?.addEventListener("resize",handleViewportResize);
 window.addEventListener("keydown",e=>{const tag=document.activeElement?.tagName;if(["INPUT","TEXTAREA","SELECT"].includes(tag))return;const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==="z"){e.preventDefault();undo();return}if(mod&&(e.key.toLowerCase()==="y"||(e.shiftKey&&e.key.toLowerCase()==="z"))){e.preventDefault();redo();return}if(mod&&e.key.toLowerCase()==="d"){e.preventDefault();duplicateSelected();return}if(e.key==="Delete"||e.key==="Backspace"){e.preventDefault();deleteSelected();return}const o=selected();if(o&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){e.preventDefault();beginHistoryOnce();const s=e.shiftKey?10:1;if(e.key==="ArrowLeft")o.x=clamp(o.x-s,0,state.canvas.w-o.w);if(e.key==="ArrowRight")o.x=clamp(o.x+s,0,state.canvas.w-o.w);if(e.key==="ArrowUp")o.y=clamp(o.y-s,0,state.canvas.h-o.h);if(e.key==="ArrowDown")o.y=clamp(o.y+s,0,state.canvas.h-o.h);endHistory();renderAll()}}
 );
 window.addEventListener("pointermove",e=>{if(e.pointerType==="touch"&&touchPointers.size>=2)return;updateInteraction(e)},{passive:false});
 window.addEventListener("pointerup",e=>{if(e.pointerType==="touch"&&touchPointers.size>=2)return;finishInteraction()},{passive:true});
 window.addEventListener("pointercancel",e=>finishInteraction(),{passive:true});
 setupTouch();setupViewportPan();
 $("#imageInput").addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;handleImageFile(f)});
 $("#logoInput").addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.logo=r.result;setupLogo();save();e.target.value="";toast("Project logo updated")};r.readAsDataURL(f)});
 $("#projectInput").addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);Object.assign(state,x);state.pages=(x.pages||[]).map(p=>({id:p.id||uid(),name:p.name||"Page",objects:(p.objects||[]).map(normalizeObject)}));state.pageId=state.pages[0]?.id||"home";save();renderAll();fitWorkspace();toast("Project imported")}catch{toast("Invalid DesignForge file")}e.target.value=""};r.readAsText(f)});
}

load();initEvents();setupOfflineApp();renderAll();requestAnimationFrame(fitWorkspace);status("Ready",true);
})();
