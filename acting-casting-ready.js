/* Additive casting submission panel for Bre Lynn's existing acting portfolio. */
(() => {
  'use strict';
  const hero = document.querySelector('.acting-hero');
  if (!hero || document.getElementById('casting-quick-kit')) return;
  const section = document.createElement('section');
  section.id = 'casting-quick-kit';
  section.className = 'wrap casting-quick-kit';
  section.setAttribute('aria-label', 'Casting submission materials');
  section.innerHTML = `
    <div class="casting-quick-copy">
      <p class="eyebrow">For casting directors &amp; productions</p>
      <h2>Bre Lynn <span>· Acting submission</span></h2>
      <p>Michigan-based actor and creative performer. Selected on-camera performance clips, headshots, and a downloadable acting profile are available below.</p>
      <p class="casting-quick-note">Film experience: <em>Day of the Cicadas</em> — background / extra roles; release anticipated 2027.</p>
      <div class="casting-quick-actions">
        <a class="casting-quick-primary" href="#featured-performances">Watch 4 featured clips</a>
        <a href="bre-lynn-acting-profile.pdf" download>Acting profile PDF</a>
        <a href="blm-photo-052.jpg" download="Bre-Lynn-Headshot.jpg">Download headshot</a>
        <a href="mailto:Bremcilroy@gmail.com?subject=Acting%20Inquiry%20-%20Bre%20Lynn">Email Bre Lynn</a>
      </div>
      <p class="casting-quick-note">Full collection: <a href="#performances">27 performance clips</a> · <a href="#casting-profile">Additional headshots</a></p>
    </div>
    <a class="casting-quick-photo" href="blm-photo-052.jpg" aria-label="View Bre Lynn's headshot">
      <img src="blm-photo-052.jpg" alt="Bre Lynn acting headshot" loading="lazy" width="1238" height="1536">
      <span>View headshot</span>
    </a>`;
  hero.insertAdjacentElement('afterend', section);
})();
