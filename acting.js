// Public performance gallery and an email builder. No uploads or stored inquiries.
(() => {
  const grid = document.querySelector('.acting-grid');
  if (grid) {
    const cards = Array.from(grid.querySelectorAll('[data-acting-group]'));
    const links = cards.map(card => card.querySelector('[data-acting-id]'));
    const filters = Array.from(document.querySelectorAll('[data-acting-filter]'));
    const counter = document.querySelector('[data-acting-count]');
    const dialog = document.querySelector('.acting-dialog');
    const video = dialog.querySelector('[data-acting-player]');
    const heading = dialog.querySelector('#acting-viewer-title');
    const position = dialog.querySelector('[data-acting-position]');
    const error = dialog.querySelector('[data-acting-error]');
    let activeLinks = links;
    let index = 0;
    let opener;
    let priorOverflow;

    function applyFilter(value) {
      cards.forEach(card => { card.hidden = value !== 'all' && card.dataset.actingGroup !== value; });
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.actingFilter === value)));
      activeLinks = links.filter(link => !link.closest('[data-acting-group]').hidden);
      const selected = filters.find(button => button.dataset.actingFilter === value);
      counter.textContent = `${activeLinks.length} clips · ${selected.childNodes[0].textContent.trim()}`;
    }
    document.querySelector('.acting-filters').hidden = false;
    filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.actingFilter)));

    function selectClip(nextIndex) {
      index = (nextIndex + activeLinks.length) % activeLinks.length;
      const link = activeLinks[index];
      video.pause();
      error.hidden = true;
      video.poster = link.dataset.actingPoster;
      video.src = link.href;
      video.setAttribute('aria-label', link.dataset.actingTitle);
      heading.textContent = link.dataset.actingTitle;
      position.textContent = `${index + 1} of ${activeLinks.length}`;
      video.load();
    }
    video.addEventListener('error', () => { if (video.getAttribute('src')) error.hidden = false; });
    if (typeof dialog.showModal === 'function') {
      document.querySelectorAll('[data-acting-id]').forEach(link => link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        let nextIndex = activeLinks.findIndex(item => item.dataset.actingId === link.dataset.actingId);
        if (nextIndex < 0) {
          applyFilter('all');
          nextIndex = activeLinks.findIndex(item => item.dataset.actingId === link.dataset.actingId);
        }
        opener = link;
        selectClip(nextIndex);
        priorOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        dialog.querySelector('[data-acting-close]').focus();
      }));
      dialog.querySelector('[data-acting-close]').addEventListener('click', () => dialog.close());
      dialog.querySelector('[data-acting-prev]').addEventListener('click', () => selectClip(index - 1));
      dialog.querySelector('[data-acting-next]').addEventListener('click', () => selectClip(index + 1));
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('close', () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
        document.body.style.overflow = priorOverflow;
        if (opener?.isConnected) opener.focus();
      });
    }
  }

  const form = document.querySelector('[data-casting-form]');
  if (form) {
    form.hidden = false;
    const result = form.querySelector('[data-casting-result]');
    form.addEventListener('input', () => { result.hidden = true; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const values = new FormData(form);
      const get = name => String(values.get(name) || '').trim();
      for (const key of ['name', 'email', 'project', 'details']) {
        if (!get(key)) { form.elements.namedItem(key).focus(); return; }
      }
      const subject = `Casting inquiry for Bre Lynn: ${get('project')}`;
      const body = [
        'Hello Bre,', '',
        `Name: ${get('name')}`, `Email: ${get('email')}`,
        `Company / production: ${get('company') || 'Not specified'}`,
        `Project: ${get('project')}`,
        `Role / opportunity: ${get('role') || 'Not specified'}`,
        `Filming dates: ${get('dates') || 'To discuss'}`,
        `Location / travel: ${get('location') || 'To discuss'}`,
        `Compensation: ${get('compensation') || 'To discuss'}`,
        '', 'Project details:', get('details'), '',
        'This is an inquiry; project terms and availability are subject to agreement.'
      ].join('\n');
      result.querySelector('[data-casting-mailto]').href = `mailto:Bremcilroy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      result.querySelector('[data-casting-preview]').value = body;
      result.hidden = false;
    });
  }
})();
