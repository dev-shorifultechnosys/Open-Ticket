/* ===========================================================================
   SECTION 06 — UPCOMING EVENTS (FRONTEND PREVIEW)
   Delegated, keyboard-accessible filters & favourites. Does NOT initialise,
   patch, or replace original Open Tickets Isotope or account/booking APIs.
   =========================================================================== */
(() => {
  'use strict';
  const section = document.getElementById('upcomingEvents');
  if (!section) return;
  const buttons = [...section.querySelectorAll('[data-upcoming-filter]')];
  const cards = [...section.querySelectorAll('[data-upcoming-category]')];
  const empty = section.querySelector('#upcomingEmpty');
  const live = section.querySelector('#upcomingAnnouncement');

  const setCategory = (category, announce = true) => {
    const allowed = buttons.some(button => button.dataset.upcomingFilter === category);
    if (!allowed) return;
    buttons.forEach(button => {
      const active = button.dataset.upcomingFilter === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    cards.forEach(card => {
      const show = category === 'all' || card.dataset.upcomingCategory === category;
      card.hidden = !show;
      if (show) count++;
    });
    empty.hidden = count > 0;
    if (announce) live.textContent = count ? `${count} preview event${count===1?'':'s'} shown for ${category}.` : `No sample ${category} event cards in this preview.`;
  };

  section.addEventListener('click', (event) => {
    const filter = event.target.closest('[data-upcoming-filter]');
    if (filter && section.contains(filter)) {
      setCategory(filter.dataset.upcomingFilter);
      return;
    }
    const favourite = event.target.closest('.ot-upcoming-card__heart');
    if (!favourite || !section.contains(favourite)) return;
    const card = favourite.closest('.ot-upcoming-card');
    const title = card?.querySelector('h3')?.textContent.trim() || 'Event';
    const on = favourite.getAttribute('aria-pressed') !== 'true';
    favourite.setAttribute('aria-pressed', String(on));
    favourite.setAttribute('aria-label', `${on?'Remove':'Save'} ${title} ${on?'from':'to'} preview favourites`);
    live.textContent = `${title} ${on?'added to':'removed from'} the preview favourites. This does not save to your account.`;
  });

  // Optionally reflect Section 02's already-public selection; NEVER trigger it
  // in reverse and never touch Isotope or replace the site's filter handlers.
  document.getElementById('eventDiscovery')?.addEventListener('ot:category-selected', (event) => {
    const category = event.detail?.category;
    if (buttons.some(button => button.dataset.upcomingFilter === category)) {
      setCategory(category, false);
    }
  });
})();
