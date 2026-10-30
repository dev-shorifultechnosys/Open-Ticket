/* ===========================================================================
   SECTION 03 — FEATURED EVENT CARDS
   Native, keyboard-accessible preview-only favourite controls.
   No CMS mutation, account save, ticket checkout or Isotope API call.
   =========================================================================== */
(() => {
  'use strict';
  const section = document.querySelector('#featuredEventGrid');
  if (!section) return;
  const announcer = section.querySelector('#featuredAnnouncement');

  // Upgrade site-derived poster fallbacks to official CDN artwork when available.
  // If a browser is offline or the remote request fails, the packaged fallback remains visible.
  const candidates = [...section.querySelectorAll('img[data-original-src]')];
  const posterObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      posterObserver.unobserve(entry.target);
      const img = entry.target;
      const photo = new Image();
      photo.decoding = 'async';
      photo.onload = () => { img.src = photo.src; };
      photo.src = img.dataset.originalSrc;
    }
  }, {rootMargin: '320px 0px'}) : null;
  candidates.forEach(img => {
    if (posterObserver) posterObserver.observe(img);
    else { const photo = new Image(); photo.onload = () => { img.src = photo.src; }; photo.src = img.dataset.originalSrc; }
  });

  section.addEventListener('click', (event) => {
    const button = event.target.closest('.ot-event-card__save');
    if (!button || !section.contains(button)) return;
    const card = button.closest('.ot-event-card');
    if (!card) return;
    const name = card.querySelector('h3')?.textContent.trim() || 'Event';
    const selected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Remove' : 'Save'} ${name} ${selected ? 'from' : 'to'} this preview's favourites`);
    button.title = selected ? 'Remove from preview favourites' : 'Save in this preview';
    announcer.textContent = `${name} ${selected ? 'saved to' : 'removed from'} preview favourites; this is not synced to an account.`;
  });
})();
