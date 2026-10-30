
/* ==========================================================================
   SECTION 02 — EVENT DISCOVERY (pure ES6, no DOM framework)
   This module owns ONLY the new search/filter controls.
   It NEVER creates or replaces an Isotope instance, and never changes the
   CMS event grid. During integration, listen for ot:category-selected.
   Search submits to the existing Open Tickets /search route.
   ========================================================================== */
(() => {
  'use strict';
  const root = document.getElementById('eventDiscovery');
  if (!root) return;
  const qs = (selector) => root.querySelector(selector);
  const qsa = (selector) => Array.from(root.querySelectorAll(selector));
  const form = qs('#otDiscoveryForm');
  const categoryHidden = qs('#discoveryCategory');
  const categoryButtons = qsa('[data-category]');
  const suggestions = qs('#discoverySuggestions');
  const suggestionsToggle = qs('#discoverySuggestionsToggle');
  const more = qs('#discoveryMore');
  const moreToggle = qs('#discoveryMoreToggle');

  /* Category state: UI only until the actual site integration is connected. */
  function setCategory(category) {
    categoryHidden.value = category;
    categoryButtons.forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    root.dispatchEvent(new CustomEvent('ot:category-selected', {
      bubbles: true, detail: {category}
    }));
  }
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => setCategory(button.dataset.category));
  });

  /* Functional, accessible search suggestions disclosure. */
  function setSuggestions(open) {
    suggestions.hidden = !open;
    suggestionsToggle.setAttribute('aria-expanded', String(open));
  }
  suggestionsToggle.addEventListener('click', () => setSuggestions(suggestions.hidden));
  qsa('[data-suggestion]').forEach(button => {
    button.addEventListener('click', () => {
      qs('#discoveryQuery').value = button.dataset.suggestion;
      setSuggestions(false);
      qs('#discoveryQuery').focus();
    });
  });
  document.addEventListener('pointerdown', event => {
    if (!qs('.ot-discovery__search-control').contains(event.target)) setSuggestions(false);
  }, {passive:true});

  /* Additional filters — intentionally separate from any live Isotope logic. */
  moreToggle.addEventListener('click', () => {
    const opening = more.hidden;
    more.hidden = !opening;
    moreToggle.setAttribute('aria-expanded', String(opening));
  });
  qs('#discoverySort').addEventListener('change', event => {
    qs('#discoverySortHidden').value = event.target.value;
  });
  qs('#discoveryReset').addEventListener('click', () => {
    form.reset();
    qs('#discoverySort').value = '';
    qs('#discoverySortHidden').value = '';
    setCategory('');
    setSuggestions(false);
    more.hidden = true;
    moreToggle.setAttribute('aria-expanded', 'false');
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setSuggestions(false);
      more.hidden = true;
      moreToggle.setAttribute('aria-expanded', 'false');
    }
  });
  // The actual search back end may use different parameter names.
  // The production integration must map query/location/date/category/sort
  // to its confirmed API without altering the original Isotope selectors.
})();
