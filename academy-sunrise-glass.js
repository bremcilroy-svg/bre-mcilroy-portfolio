/* Optional stained-glass sunrise; original chapter progress and gates untouched. */
const KEY='aca-sunrise-glass-v1';
const panes=[{id:'stars',name:'Stars',symbol:'✦',color:'#8295df'},{id:'moon',name:'Moon',symbol:'☾',color:'#b9b4ec'},{id:'horizon',name:'First Light',symbol:'❈',color:'#f6b5a6'},{id:'sunrise',name:'Sunrise',symbol:'🌅',color:'#ffcf8b'}];
function init(){
 const play=document.getElementById('play-ui');if(!play||document.getElementById('aca-sunrise-glass'))return;
 const aside=document.createElement('aside');aside.id='aca-sunrise-glass';aside.className='aca-sunrise-glass';
 aside.innerHTML='<button type="button" class="aca-sunrise-toggle" aria-expanded="false">🌅 Stained-Glass Sunrise</button><div class="aca-sunrise-panel" hidden><h2>The Window of Tomorrow</h2><p>Bring the morning through the glass. Select the panes in the order the night becomes day.</p><div class="aca-sunrise-window" aria-hidden="true"><span>✦</span><span>☾</span><span>❈</span><span>🌅</span></div><p class="aca-sunrise-progress" role="status"></p><div class="aca-sunrise-choices" role="group" aria-label="Select the next stained-glass pane"></div><div class="aca-sunrise-actions"><button type="button" class="aca-sunrise-undo">Undo</button><button type="button" class="aca-sunrise-hint">Hint</button><button type="button" class="aca-sunrise-reset">Replay</button></div><p class="aca-sunrise-message" role="status" aria-live="polite"></p><p class="aca-sunrise-note">An optional chamber secret. The original sunrise emblem, window alignment, pages, and chapter saves are unchanged.</p></div>';
 document.body.append(aside);
 const toggle=aside.querySelector('.aca-sunrise-toggle'),panel=aside.querySelector('.aca-sunrise-panel'),choices=aside.querySelector('.aca-sunrise-choices'),progress=aside.querySelector('.aca-sunrise-progress'),message=aside.querySelector('.aca-sunrise-message');
 let selected=[],won=false;
 try{won=JSON.parse(localStorage.getItem(KEY)||'{}').won===true}catch{}
 if(won)selected=[...panes];
 function playing(){return !play.hidden&&getComputedStyle(play).display!=='none'}
 function render(){
  aside.hidden=!playing();if(aside.hidden)return;
  aside.classList.toggle('is-sunrise',won);
  progress.textContent=won?'The sunrise has filled the window.':selected.length+' of 4 panes illuminated';
  aside.querySelectorAll('.aca-sunrise-window span').forEach((span,i)=>span.classList.toggle('is-lit',selected.some(x=>x.id===panes[i].id)));
  choices.replaceChildren();
  panes.filter(x=>!selected.some(y=>y.id===x.id)).forEach(x=>{
   const b=document.createElement('button');b.type='button';b.textContent=x.symbol+' '+x.name;
   b.addEventListener('click',()=>{
    if(!playing()||won)return;
    selected.push(x);
    if(selected.length===4){
     if(selected.every((v,i)=>v.id===panes[i].id)){won=true;message.textContent='🌅 The sunrise floods the window with gold. “Tomorrow begins with the courage to try again.”';try{localStorage.setItem(KEY,JSON.stringify({won:true}))}catch{}}
     else{selected=[];message.textContent='The light scatters. Follow the sky from night into morning and try again.'}
    }else message.textContent=x.name+' shines through the glass.';
    render();
   });choices.append(b);
  });
  aside.querySelector('.aca-sunrise-undo').disabled=won||selected.length===0;
  aside.querySelector('.aca-sunrise-reset').disabled=!won&&selected.length===0;
 }
 toggle.addEventListener('click',()=>{if(!playing())return;panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));render()});
 aside.querySelector('.aca-sunrise-undo').addEventListener('click',()=>{if(!playing()||won)return;selected.pop();message.textContent='The last beam fades.';render()});
 aside.querySelector('.aca-sunrise-hint').addEventListener('click',()=>{if(!playing())return;message.textContent='First the stars, then the moon. The horizon brightens before the sun rises.'});
 aside.querySelector('.aca-sunrise-reset').addEventListener('click',()=>{if(!playing())return;selected=[];won=false;message.textContent='The glass waits for another morning.';try{localStorage.removeItem(KEY)}catch{}render()});
 new MutationObserver(render).observe(play,{attributes:true,attributeFilter:['hidden','style','class']});render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
