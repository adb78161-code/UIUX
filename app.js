document.querySelectorAll('.template-grid article').forEach(card=>{
 card.addEventListener('click',()=>card.animate([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:220}))
});
const observer=new IntersectionObserver(entries=>{
 entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:0,transform:'translateY(25px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'ease-out',fill:'forwards'})}})
},{threshold:.12});
document.querySelectorAll('.intro,.showcase-card,.template-grid article,.workflow-list>div,.cta-section').forEach(e=>{e.style.opacity=0;observer.observe(e)});
