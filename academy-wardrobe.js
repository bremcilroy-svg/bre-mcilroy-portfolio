const chest = document.querySelector('#open-uniform-chest');
const dialog = document.querySelector('#academy-wardrobe');
const housePicker = dialog.querySelector('#wardrobe-house');
const status = dialog.querySelector('#wardrobe-status');
const summary = document.querySelector('#uniform-summary');
const wardrobeKey = 'amethyst-crescent-uniform-v1';
const characterKey = 'amethyst-crescent-character-v1';

const houses = {
  amethyst: 'Amethyst',
  emberheart: 'Emberheart',
  frostveil: 'Frosttopaz',
  silverthorn: 'Silverthorn'
};

const looks = {
  regalia: 'Velvet Regalia',
  tailored: 'Crescent Tailoring',
  evening: 'Midnight Couture'
};

function readSave(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function validHouse(value) {
  return typeof value === 'string' && Object.hasOwn(houses, value);
}

function savedUniform() {
  const saved = readSave(wardrobeKey);
  return validHouse(saved?.house) && Object.hasOwn(looks, saved.look) ? saved : null;
}

function renderSummary() {
  const saved = savedUniform();
  summary.textContent = saved
    ? looks[saved.look] + ' · House ' + houses[saved.house]
    : 'Choose a look to receive your Academy uniform.';
}

function renderWardrobe() {
  const house = housePicker.value;
  if (!validHouse(house)) return;
  dialog.dataset.palette = house;
  dialog.querySelectorAll('[data-crest-house]').forEach(crest => {
    crest.hidden = crest.dataset.crestHouse !== house;
  });
  dialog.querySelector('#wardrobe-common-room').href = 'academy-house-' + house + '.html';
  const saved = savedUniform();
  dialog.querySelectorAll('[data-uniform]').forEach(button => {
    const selected = saved?.house === house && saved.look === button.dataset.uniform;
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected ? 'Uniform received' : 'Choose this uniform';
  });
}

chest.addEventListener('click', () => {
  if (document.querySelector('#room').hidden || dialog.open) return;
  const characterHouse = readSave(characterKey)?.house;
  const saved = savedUniform();
  housePicker.value = validHouse(characterHouse) ? characterHouse : saved?.house || 'amethyst';
  housePicker.disabled = validHouse(characterHouse);
  status.textContent = housePicker.disabled
    ? 'Your saved Academy character belongs to House ' + houses[housePicker.value] + '.'
    : '';
  renderWardrobe();
  dialog.showModal();
});

housePicker.addEventListener('change', () => {
  status.textContent = '';
  renderWardrobe();
});

dialog.querySelector('#close-wardrobe').addEventListener('click', () => dialog.close());
dialog.querySelectorAll('[data-uniform]').forEach(button => {
  button.addEventListener('click', () => {
    const house = housePicker.value;
    const look = button.dataset.uniform;
    if (document.querySelector('#room').hidden || !validHouse(house) || !Object.hasOwn(looks, look)) return;
    try {
      localStorage.setItem(wardrobeKey, JSON.stringify({ house, look }));
    } catch {
      status.textContent = 'This browser could not save your uniform.';
      return;
    }
    status.textContent = 'You received ' + looks[look] + ' in House ' + houses[house] + ' colors.';
    renderWardrobe();
    renderSummary();
  });
});

window.addEventListener('pageshow', renderSummary);
renderSummary();
