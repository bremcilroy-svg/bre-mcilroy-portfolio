import {authorAccess} from './vault-author-state.js?v=20261112-author';
import {societyStats} from './vault-society.js?v=20261112-phase7fix';
function renderSociety(){const s=societyStats();const $=x=>document.querySelector(x);const names=['Heart','Mirror','Moon','Sunrise'];
$('#author-revisit').hidden=!authorAccess(s).allowed;
$('#invitation').innerHTML=s.journey.allComplete?'<span class="sigil">❦</span><h2>Your invitation is unsealed.</h2><p>You walked through love, faced the fractured pieces, survived the longest night, and found your way toward tomorrow.</p><p><strong>You are invited to become a Keeper of Forgotten Words.</strong></p><a class="button" href="poetry-vault-fifth-door.html">Answer the invitation →</a>':'<span class="sigil">◇</span><h2>The invitation remains sealed.</h2><p>Complete all four chambers and open the final door to join the Keepers.</p><a class="button" href="poetry-vault-entrance.html">Return to the journey →</a>';
$('#achievements').innerHTML=s.achievements.map((a,i)=>`<article><div class="emblem">${['♡','◇','☾','☀'][i]}</div><h3>${a.room}</h3><p>${a.complete?'✦ Chapter stamp earned':'◇ Chapter stamp locked'}</p><p>${a.bookmark?'✦ Hidden bookmark found':'◇ Hidden bookmark undiscovered'}</p><p>${a.clean?'✦ Completed without hints':'◇ Hint-free trial not earned'}</p><small>${a.inscription?'Inscription discovered':'Inscription not yet discovered'}</small><a href="${['poetry-vault.html','poetry-vault-mirror.html','poetry-vault-labyrinth.html','poetry-vault-dawn.html'][i]}">Revisit chamber →</a></article>`).join('');
$('#seal-icons').innerHTML=names.map((n,i)=>`<span class="${s.seals.includes(s.achievements[i].id)?'earned':''}" aria-label="${n} seal ${s.seals.includes(s.achievements[i].id)?'earned':'locked'}">${['♡','◇','☾','☀'][i]}<small>${n}</small></span>`).join('');
$('#seal-status').textContent=`${s.seals.length} of 4 hidden seals found${s.journey.allComplete?' · Original journey complete':' · Original journey incomplete'}.`;
$('#enter-fifth').textContent=s.journey.allComplete&&s.seals.length===4?'Enter the Fifth Door →':'See the locked Fifth Door →';

}
renderSociety();
window.addEventListener('pageshow',renderSociety);
window.addEventListener('storage',renderSociety);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderSociety();});
