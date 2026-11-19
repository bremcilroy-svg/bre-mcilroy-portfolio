/* Optional Owl Constellation Trail. Does not modify chapter saves or locks. */
const KEY='aca-owl-trail-v1';
const nodes=[
 {id:'gate',name:'Moonlit Gate',icon:'🌙',paths:['owl','mist']},
 {id:'owl',name:'Snow Owl Perch',icon:'🦉',paths:['gate','stars','mist']},
 {id:'mist',name:'Silver Mist',icon:'🌫️',paths:['gate','owl','thorns']},
 {id:'stars',name:'Constellation Crossing',icon:'✦',paths:['owl','dawn','thorns']},
 {id:'thorns',name:'Thorn Passage',icon:'🌿',paths:['mist','stars']},
 {id:'dawn',name:'Hidden Moonwell',icon:'💎',paths:['stars']}
];
const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
function init(){
 const play=document.getElementById('play-ui');if(!play||document.getElementById('aca-owl-trail'))return;
 const aside=document.createElement('aside');aside.id='aca-owl-trail';aside.className='aca-owl-trail';
 aside.innerHTML='<button type="button" class="aca-owl-toggle" aria-expanded="false">🌙 Owl Constellation Trail</button><div class="aca-owl-panel" hidden><h2>The Midnight Star Path</h2><p>A snow owl guards the way to a hidden moonwell. Follow the owl, then the stars. Beware the mist and thorns.</p><div class="aca-owl-map" aria-hidden="true">☾ ✦ 🦉 ✦ ☾</div><p class="aca-owl-position" role="status"></p><div class="aca-owl-paths" role="group" aria-label="Choose a passage"></div><div class="aca-owl-controls"><button type="button" class="aca-owl-hint">Ask the owl</button><button type="button" class="aca-owl-reset">Restart trail</button></div><p class="aca-owl-message" role="status" aria-live="polite"></p><p class="aca-owl-note">Optional exploration. The original clock, ledger, poems and chapter saves remain untouched.</p></div>';
 document.body.append(aside);
 const toggle=aside.querySelector('.aca-owl-toggle'),panel=aside.querySelector('.aca-owl-panel'),position=aside.querySelector('.aca-owl-position'),paths=aside.querySelector('.aca-owl-paths'),message=aside.querySelector('.aca-owl-message');
 let current='gate',won=false,steps=0;
 try{won=JSON.parse(localStorage.getItem(KEY)||'{}').won===true}catch{}
 if(won)current='dawn';
 function playing(){return !play.hidden&&getComputedStyle(play).display!=='none'}
 function render(){
  aside.hidden=!playing();if(aside.hidden)return;
  aside.classList.toggle('is-found',won);
  position.textContent='You are at: '+byId[current].icon+' '+byId[current].name;
  paths.replaceChildren();
  if(won){message.textContent='✦ The moonwell shines. The snow owl has shown you the hidden path.';return}
  byId[current].paths.forEach(id=>{
   const b=document.createElement('button');b.type='button';b.textContent=byId[id].icon+' '+byId[id].name;
   b.addEventListener('click',()=>{
    if(!playing()||won)return;
    current=id;steps++;
    if(id==='dawn'){won=true;message.textContent='✦ You found the moonwell. A silver constellation glows above the water.';try{localStorage.setItem(KEY,JSON.stringify({won:true}))}catch{}}
    else if(id==='mist'||id==='thorns')message.textContent='The way grows uncertain. Listen for the owl and follow the stars.';
    else message.textContent=id==='owl'?'A blue-eyed snow owl watches from a silver branch.':'The constellations point toward a hidden spring.';
    render();
   });paths.append(b);
  });
 }
 toggle.addEventListener('click',()=>{if(!playing())return;panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));render()});
 aside.querySelector('.aca-owl-hint').addEventListener('click',()=>{if(!playing())return;message.textContent=current==='gate'?'Look for the snow owl first.':current==='owl'?'The stars mark the safest crossing.':current==='stars'?'The moonwell waits beyond the constellations.':'Retrace your steps toward the owl and the stars.'});
 aside.querySelector('.aca-owl-reset').addEventListener('click',()=>{if(!playing())return;current='gate';won=false;steps=0;message.textContent='The moonlit path begins again.';try{localStorage.removeItem(KEY)}catch{}render()});
 new MutationObserver(render).observe(play,{attributes:true,attributeFilter:['hidden','style','class']});render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
