/* Royal reception enhancement: reveal the Headmaster's address on arrival.
   No localStorage changes, quest unlocking, or automatic navigation. */
(() => {
  'use strict';
  const reception = document.getElementById('royal-reception');
  if (!reception) return;
  const letter = reception.querySelector('details');
  const heading = document.getElementById('royal-reception-title');
  function welcome() {
    if (location.hash !== '#royal-reception') return;
    if (letter) letter.open = true;
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({preventScroll:true});
    }
    reception.scrollIntoView({behavior:'instant',block:'start'});
  }
  window.addEventListener('hashchange', welcome);
  window.addEventListener('pageshow', welcome);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',welcome,{once:true});
  else welcome();
})();
