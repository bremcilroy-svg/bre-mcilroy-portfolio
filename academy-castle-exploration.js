/* Castle exploration controls: drag/swipe to turn, tap relic to inspect,
   keyboard arrows to move. Uses existing room actions and never touches saves. */
function mount(){
 const configs=[
  {root:'#aca-keepers-hall',scene:'.aca-hall-viewport',left:'.aca-hall-prev',right:'.aca-hall-next',inspect:'.aca-hall-inspect',target:'.aca-hall-altar',owl:'.aca-hall-owl',owlAction:'.aca-hall-owl-button'},
  {root:'#aca-amethyst-gateway',scene:'.aca-gateway-scene',left:'.aca-gateway-left',right:'.aca-gateway-right',inspect:'.aca-gateway-inspect',target:'.aca-gateway-pillar',owl:'.aca-gateway-owl',owlAction:null}
 ];
 configs.forEach(c=>{
  const root=document.querySelector(c.root);if(!root||root.dataset.explorationReady)return;
  const scene=root.querySelector(c.scene),left=root.querySelector(c.left),right=root.querySelector(c.right),inspect=root.querySelector(c.inspect),target=root.querySelector(c.target),owl=root.querySelector(c.owl);
  if(!scene||!left||!right||!inspect||!target)return;
  root.dataset.explorationReady='true';
  scene.tabIndex=0;
  scene.setAttribute('role','group');
  scene.setAttribute('aria-label','Explore the chamber. Swipe or drag left and right to walk between alcoves. Use left and right arrow keys to move, Enter to inspect the relic.');
  scene.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight Enter');
  const help=document.createElement('p');help.className='aca-explore-help';help.textContent='Drag or swipe to walk · Tap the relic to inspect · Arrow keys and Enter also work';
  scene.insertAdjacentElement('afterend',help);
  const move=dir=>{const button=dir>0?right:left;if(!button.disabled)button.click()};
  let down=null,dragged=false;
  scene.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;down={x:e.clientX,y:e.clientY,id:e.pointerId};dragged=false});
  scene.addEventListener('pointermove',e=>{
   if(!down||down.id!==e.pointerId)return;
   const dx=e.clientX-down.x;
   if(Math.abs(dx)>12){scene.style.setProperty('--aca-look',Math.max(-12,Math.min(12,dx/9))+'px')}
  });
  scene.addEventListener('pointerup',e=>{
   if(!down||down.id!==e.pointerId)return;
   const dx=e.clientX-down.x,dy=e.clientY-down.y;
   if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.2){move(dx<0?1:-1);dragged=true}
   down=null;scene.style.removeProperty('--aca-look');
  });
  scene.addEventListener('pointercancel',()=>{down=null;scene.style.removeProperty('--aca-look')});
  scene.addEventListener('click',e=>{if(dragged){dragged=false;return}if(e.target.closest(c.target))inspect.click();else if(c.owlAction&&e.target.closest(c.owl))root.querySelector(c.owlAction)?.click()});
  scene.addEventListener('keydown',e=>{
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();move(e.key==='ArrowRight'?1:-1)}
   if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect.click()}
  });
  target.title='Inspect the relic';
  if(owl&&c.owlAction)owl.title='Ask the snow owl';
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
