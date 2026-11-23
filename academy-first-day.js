const CARD_KEY = 'amethyst-crescent-student-pass-v1';
const HOUSES = {
  amethyst: ['Amethyst', 'the snow owl'],
  emberheart: ['Emberheart', 'the ember dragon'],
  frostveil: ['Frosttopaz', 'the frost wolf'],
  silverthorn: ['Silverthorn', 'the silver stag']
};

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

function student() {
  const card = read(CARD_KEY);
  return typeof card?.name === 'string' && card.name.trim() && Object.hasOwn(HOUSES, card.house)
    ? card : null;
}

function stageKey(card, stage) {
  return 'amethyst-first-day-v1:' + JSON.stringify([card.house, card.name, stage]);
}

function hasStage(card, stage) {
  return Boolean(card && read(stageKey(card, stage)) === true);
}

function saveStage(card, stage, status) {
  try {
    localStorage.setItem(stageKey(card, stage), 'true');
    return true;
  } catch {
    status.textContent = 'Your browser could not save this step. Check that site storage is enabled and try again.';
    return false;
  }
}

const hall = document.querySelector('#first-day-hall');
if (hall) {
  const checkIn = hall.querySelector('button');
  const status = hall.querySelector('[role="status"]');
  const schedule = hall.querySelector('ol');
  const study = hall.querySelector('[data-first-day-study]');
  function refreshHall() {
    const card = student();
    checkIn.hidden = !card || hasStage(card, 'check-in');
    study.hidden = Boolean(card);
    schedule.hidden = !hasStage(card, 'check-in');
    status.textContent = card
      ? hasStage(card, 'check-in')
        ? 'Welcome, ' + card.name + ' of House ' + HOUSES[card.house][0] + '. Here is your first-day schedule.'
        : 'Show your student key card to check in.'
      : 'Finish the entrance trial and collect your key card in the Author’s Study.';
    if (card) schedule.querySelector('a').href = 'academy-house-' + card.house + '.html';
  }
  checkIn.addEventListener('click', () => {
    const card = student();
    if (card && saveStage(card, 'check-in', status)) refreshHall();
  });
  refreshHall();
  window.addEventListener('pageshow', refreshHall);
}

const house = document.querySelector('#first-day-house');
if (house) {
  function greet() {
    const card = student();
    house.hidden = !card || card.house !== document.body.dataset.house || !hasStage(card, 'check-in');
    if (house.hidden) return;
    const status = house.querySelector('[role="status"]');
    const guardian = HOUSES[card.house][1];
    status.textContent = 'Welcome home, ' + card.name + '. Your guardian, ' + guardian + ', greets you at the door. Gizmo points his nose toward the Owl Observatory.';
    const saved = saveStage(card, 'house-visit', status);
    house.querySelector('a').hidden = !saved;
  }
  greet();
  window.addEventListener('pageshow', greet);
}

const observatory = document.querySelector('#first-day-observatory');
if (observatory) {
  const gate = observatory.querySelector('#observatory-gate');
  const telescope = observatory.querySelector('#open-telescope');
  const sky = observatory.querySelector('#telescope-view');
  const feedback = observatory.querySelector('#constellation-feedback');
  const selection = observatory.querySelector('#constellation-selection');
  const badge = observatory.querySelector('#constellation-badge');
  const stars = [...sky.querySelectorAll('[data-star]')];
  const solution = ['Talons', 'Silver Wing', 'Owl’s Eye'];
  let picked = [];

  function renderSelection() {
    selection.textContent = picked.length ? picked.join(' → ') : 'No stars selected.';
    stars.forEach(button => button.setAttribute('aria-pressed', String(picked.includes(button.dataset.star))));
  }

  function refreshObservatory() {
    const card = student();
    const checkedIn = hasStage(card, 'check-in');
    const eligible = hasStage(card, 'house-visit') && checkedIn;
    telescope.hidden = !eligible;
    if (!eligible) sky.hidden = true;
    badge.hidden = !eligible || !hasStage(card, 'owl-badge');
    gate.hidden = eligible;
    if (!eligible) {
      gate.querySelector('p').textContent = checkedIn
        ? 'Visit your house common room before your first class.'
        : 'Check in with your student key card at the Royal Great Hall.';
      const next = gate.querySelector('a');
      next.href = checkedIn ? 'academy-house-' + card.house + '.html' : 'academy-royal-great-hall.html';
      next.textContent = checkedIn ? 'Visit my common room' : 'Go to the Royal Great Hall';
    }
  }

  telescope.addEventListener('click', () => {
    sky.hidden = false;
    telescope.setAttribute('aria-expanded', 'true');
    stars[0].focus();
  });

  stars.forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.star;
    if (picked.includes(name)) picked = picked.filter(star => star !== name);
    else if (picked.length < 3) picked.push(name);
    else {
      feedback.textContent = 'Clear or deselect a star before choosing another.';
      return;
    }
    feedback.textContent = '';
    renderSelection();
  }));

  sky.querySelector('#clear-constellation').addEventListener('click', () => {
    picked = [];
    feedback.textContent = '';
    renderSelection();
  });

  sky.querySelector('#submit-constellation').addEventListener('click', () => {
    if (picked.length !== 3) {
      feedback.textContent = 'Choose three stars before tracing the owl.';
      return;
    }
    if (!solution.every((star, i) => picked[i] === star)) {
      feedback.textContent = 'The owl hasn’t appeared. Follow the clue from the ground up and leave the Lantern out.';
      return;
    }
    const card = student();
    if (!hasStage(card, 'check-in') || !hasStage(card, 'house-visit')) {
      refreshObservatory();
      return;
    }
    if (saveStage(card, 'owl-badge', feedback)) {
      feedback.textContent = 'The owl lights up. Your Observatory badge is saved to your student key card.';
      // The owl crystal is earned only after the correct constellation and saved badge.
      try {
        const key='amethyst-academy-fountain-memories-v1', milestone='observatory-owl-constellation';
        const raw=JSON.parse(localStorage.getItem(key)||'[]');
        const memories=Array.isArray(raw)?raw.filter(m=>m&&typeof m.title==='string'):[];
        if(!memories.some(m=>m.milestone===milestone)){
          while(memories.length>=30){const ordinary=memories.findIndex(m=>!m.milestone);if(ordinary<0)break;memories.splice(ordinary,1);}
   if(memories.length<30){
   memories.push({id:'milestone-'+milestone,title:'Owl Observatory — Constellation Solved',path:'academy-owl-observatory.html',date:new Date().toISOString(),note:'The owl constellation was traced and the Observatory badge earned.',milestone});
          localStorage.setItem(key,JSON.stringify(memories));
          try{sessionStorage.setItem('amethyst-fountain-new-milestone',milestone)}catch(e){}
   }
        }
      }catch(e){/* Optional memory must not interrupt the Observatory. */}
      sky.classList.add('constellation-solved');
      badge.hidden = false;
    }
  });

  renderSelection();
  refreshObservatory();
  window.addEventListener('pageshow', refreshObservatory);
}

const cardBadge = document.querySelector('#first-day-card-badge');
if (cardBadge) {
  const pass = document.querySelector('#student-pass');
  function renderBadge() {
    const card = student();
    cardBadge.hidden = !hasStage(card, 'owl-badge')
      || document.querySelector('#student-doors').hidden
      || pass.dataset.palette !== card?.house;
  }
  renderBadge();
  const observer = new MutationObserver(renderBadge);
  observer.observe(pass, { attributes: true, attributeFilter: ['open', 'data-palette'] });
  observer.observe(document.querySelector('#student-doors'), { attributes: true, attributeFilter: ['hidden'] });
}
