const passKey = 'amethyst-crescent-student-pass-v1';
const houses = {
  amethyst: 'Amethyst',
  emberheart: 'Emberheart',
  frostveil: 'Frostveil',
  silverthorn: 'Silverthorn'
};

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function validHouse(house) {
  return typeof house === 'string' && Object.hasOwn(houses, house);
}

function studentPass() {
  const card = read(passKey);
  return validHouse(card?.house) && typeof card.name === 'string' && card.name.trim() ? card : null;
}

function currentUniform() {
  const uniform = read('amethyst-crescent-uniform-v1');
  const house = read('amethyst-crescent-character-v1')?.house;
  return validHouse(uniform?.house) && (!validHouse(house) || house === uniform.house) ? uniform : null;
}

function showClassAccess() {
  const card = studentPass();
  const gate = document.querySelector('#classroom-gate');
  if (!gate) return;
  gate.hidden = Boolean(card);
  document.querySelector('#academy-lessons').hidden = !card;
  if (card) {
    document.querySelector('#classroom-welcome').textContent =
      'Welcome, ' + card.name + ' of House ' + houses[card.house] + '.';
  }
}

function photoFor(file) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) {
      reject(new Error('Choose a JPG, PNG, or WebP photo under 12 MB.'));
      return;
    }
    const image = new Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(source);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 320;
        const edge = Math.min(image.naturalWidth, image.naturalHeight);
        const x = (image.naturalWidth - edge) / 2;
        const y = (image.naturalHeight - edge) / 2;
        const context = canvas.getContext('2d');
        context.fillStyle = '#241929';
        context.fillRect(0, 0, 320, 320);
        context.drawImage(image, x, y, edge, edge, 0, 0, 320, 320);
        resolve(canvas.toDataURL('image/jpeg', .82));
      } catch {
        reject(new Error('This photo could not be processed.'));
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error('This photo could not be opened.'));
    };
    image.src = source;
  });
}

const openPass = document.querySelector('#open-student-pass');
if (openPass) {
  const dialog = document.querySelector('#student-pass');
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('#student-pass-status');
  const cardName = dialog.querySelector('#student-card-name');
  const cardHouse = dialog.querySelector('#student-card-house');
  const cardPhoto = dialog.querySelector('#student-card-photo');
  const doors = dialog.querySelector('#student-doors');
  let photo = '';

  function render(card, house) {
    cardName.textContent = card?.name || 'Your name';
    cardHouse.textContent = validHouse(house) ? 'House ' + houses[house] : 'House pending';
    dialog.dataset.palette = house || 'amethyst';
    dialog.querySelectorAll('[data-card-crest]').forEach(crest => {
      crest.hidden = crest.dataset.cardCrest !== house;
    });
    cardPhoto.hidden = !card?.photo;
    if (card?.photo) cardPhoto.src = card.photo;
    else cardPhoto.removeAttribute('src');
    dialog.querySelector('#student-photo-placeholder').hidden = Boolean(card?.photo);
    const unlocked = Boolean(card && card.house === house);
    doors.hidden = !unlocked;
    if (unlocked) dialog.querySelector('#student-house-door').href = 'academy-house-' + house + '.html';
  }

  openPass.addEventListener('click', () => {
    if (document.querySelector('#room').hidden || dialog.open) return;
    const uniform = currentUniform();
    const saved = studentPass();
    photo = saved?.photo || '';
    form.reset();
    form.hidden = !uniform;
    form.elements.studentName.value = saved?.name
      || read('amethyst-crescent-character-v1')?.name
      || localStorage.getItem('pv_gizmo_guest_first_name_v1')
      || '';
    status.textContent = uniform ? '' : 'Choose your house uniform in the chest to issue your key card.';
    render(saved, uniform?.house);
    dialog.showModal();
  });

  dialog.querySelector('#student-pass-close').addEventListener('click', () => dialog.close());
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const uniform = currentUniform();
    const name = form.elements.studentName.value.trim();
    if (!uniform || !name || document.querySelector('#room').hidden) return;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const file = form.elements.studentPhoto.files[0];
      if (file) photo = await photoFor(file);
      const card = { name, house: uniform.house, photo };
      localStorage.setItem(passKey, JSON.stringify(card));
      render(card, card.house);
      status.textContent = 'Key card issued. Your student doors are open.';
    } catch (error) {
      status.textContent = error?.name === 'QuotaExceededError'
        ? 'This browser is out of space for the card. Try a different browser.'
        : error?.message || 'The key card could not be saved.';
    } finally {
      submit.disabled = false;
    }
  });
}

showClassAccess();
window.addEventListener('pageshow', showClassAccess);
window.addEventListener('storage', event => {
  if (event.key === passKey || event.key === null) showClassAccess();
});
