/* Additive Gizmo welcome. Does not modify chapter saves or puzzles. */
(()=>{'use strict';
const KEY='pv_gizmo_guest_first_name_v1';
const VOICE_KEY='pv_gizmo_voice_v1';
const NAME_RE=/^[\p{L}][\p{L}\p{M} '\-]{0,29}$/u;
const init=()=>{
 if(!document.getElementById('enter-vault'))return;
 const enter=document.getElementById('enter-vault');
 const resume=document.getElementById('continue-game');
 const panel=document.createElement('dialog');panel.id='pvg-welcome';panel.setAttribute('aria-labelledby','pvg-welcome-title');
 panel.innerHTML=`<div class="pvg-welcome-card"><button class="pvg-welcome-close" type="button" aria-label="Close introduction">×</button><img class="pvg-welcome-cat" src="vault-gizmo-original.svg" alt="Gizmo, the castle's gray-and-white cat"><p class="pvg-welcome-eyebrow">The castle's little guardian</p><h2 id="pvg-welcome-title">A word from Gizmo</h2><p class="pvg-welcome-dialogue">“Ah, there you are, love. I was beginning to wonder if you'd ever find us. I'm Gizmo, keeper of these halls and, naturally, their most important resident. Before we begin, darling, might I have your first name? You'll see it on your keepsake key card when you finish.”</p><label for="pvg-guest-name">Your first name</label><input id="pvg-guest-name" maxlength="30" autocomplete="given-name" placeholder="First name" required><p class="pvg-welcome-error" role="alert" hidden>Please enter a first name (letters, spaces, apostrophes or hyphens).</p><div class="pvg-welcome-controls"><label><input id="pvg-narration" type="checkbox"> Hear Gizmo speak (optional)</label><label for="pvg-voice">British voice</label><select id="pvg-voice"><option value="">Choose an available voice</option></select><button id="pvg-preview" type="button">▶ Preview voice</button></div><button class="pvg-welcome-begin" type="button">Continue into the castle →</button><p class="pvg-welcome-note">Your name stays in this browser. The voice options depend on your device.</p></div>`;
 document.body.append(panel);
 const name=panel.querySelector('#pvg-guest-name'),err=panel.querySelector('.pvg-welcome-error'),narr=panel.querySelector('#pvg-narration'),voice=panel.querySelector('#pvg-voice');
 const speech=window.speechSynthesis;let target='poetry-vault.html';
 try{name.value=localStorage.getItem(KEY)||'';narr.checked=localStorage.getItem('pv_gizmo_narration_v1')==='true'}catch{}
 const opening="Ah, there you are, love. I'm Gizmo, guardian of these halls. Before we begin, darling, might I have your first name?";
 let voices=[];
 function fillVoices(){if(!speech)return;voices=speech.getVoices().filter(v=>/^en\b|^en-/i.test(v.lang));const old=voice.value;voice.replaceChildren(new Option('Choose an available voice',''));voices.forEach(v=>voice.add(new Option(`${v.name} (${v.lang})`,v.voiceURI)));try{voice.value=old||localStorage.getItem(VOICE_KEY)||''}catch{}}
 fillVoices();if(speech)speech.addEventListener('voiceschanged',fillVoices);
 function speak(){if(!speech)return; speech.cancel();const u=new SpeechSynthesisUtterance(opening);const v=voices.find(v=>v.voiceURI===voice.value)||voices.find(v=>/en-GB/i.test(v.lang))||voices[0];if(v)u.voice=v;u.rate=.86;u.pitch=.93;speech.speak(u)}
 panel.querySelector('#pvg-preview').addEventListener('click',speak);
 panel.querySelector('.pvg-welcome-close').addEventListener('click',()=>panel.close());
 panel.addEventListener('close',()=>speech?.cancel());
 function open(dest){target=dest;err.hidden=true;if(!panel.open)panel.showModal();name.focus();}
 enter.addEventListener('click',e=>{e.preventDefault();open(enter.getAttribute('href')||'poetry-vault.html')});
 // Intercept only the first Continue click; preserve the site's own resume routing.
 let allowedResume=false;
 resume.addEventListener('click',e=>{
  if(allowedResume){allowedResume=false;return}
  if(resume.disabled)return;
  e.preventDefault();e.stopImmediatePropagation();open('__resume__');
 },true);
 const go=panel.querySelector('.pvg-welcome-begin');go.addEventListener('click',()=>{if(target==='__resume__')allowedResume=true},true);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
