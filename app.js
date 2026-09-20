const modal=document.getElementById('modal'), board=document.getElementById('board');
let selected=null;
function openEditor(name){document.getElementById('templateName').textContent=name+' — DesignForge Editor';modal.classList.add('show');document.body.style.overflow='hidden'}
function enterEditor(){openEditor('New Project')}
function closeEditor(){modal.classList.remove('show');document.body.style.overflow=''}
function addEl(type){
 const e=document.createElement('div');e.className='element';e.style.left='80px';e.style.top=(220+board.children.length*35)+'px';
 if(type==='text'){e.textContent='New heading';e.style.fontFamily="'Playfair Display',serif";e.style.fontSize='30px'}
 if(type==='card'){e.textContent='New card';e.style.width='180px';e.style.height='100px';e.style.padding='18px';e.style.background='#fff';e.style.borderRadius='22px';e.style.boxShadow='0 15px 30px #0001'}
 if(type==='button'){e.textContent='Button';e.style.background='#78cfc2';e.style.padding='11px 18px';e.style.borderRadius='30px';e.style.fontSize='11px';e.style.fontWeight='700'}
 if(type==='shape'){e.style.width='160px';e.style.height='120px';e.style.borderRadius='50%';e.style.background='linear-gradient(135deg,#a9ded3,#9bcfe2)'}
 board.appendChild(e);makeDrag(e);select(e)}
function makeDrag(e){e.addEventListener('pointerdown',ev=>{select(e);const r=e.getBoundingClientRect(),b=board.getBoundingClientRect(),ox=ev.clientX-r.left,oy=ev.clientY-r.top;e.setPointerCapture(ev.pointerId);function m(x){e.style.left=Math.max(0,x.clientX-b.left-ox)+'px';e.style.top=Math.max(0,x.clientY-b.top-oy)+'px'}e.onpointermove=m;e.onpointerup=()=>{e.onpointermove=null;e.onpointerup=null}})}
function select(e){if(selected)selected.style.outline='';selected=e;e.style.outline='2px solid #78cfc2'}
function changeColor(c){if(selected)selected.style.background=c}
function changeRadius(v){if(selected)selected.style.borderRadius=v+'px'}
function clearBoard(){if(confirm('Clear the canvas?'))board.innerHTML=''}
function saveBoard(){localStorage.setItem('designforgeBoard',board.innerHTML);alert('Design saved in this browser.')}
document.querySelectorAll('.element').forEach(makeDrag);
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeEditor()})
