/* ================================================================
   SECTION 09 — FOOTER INTERACTIONS
   Minimal vanilla JS; independent of the carousel and Isotope.
   The language choices navigate to the existing production site
   language routes rather than pretending this standalone demo has
   a complete CMS translation system.
================================================================ */
(() => {
  'use strict';
  const topButton = document.getElementById('footerBackToTop');
  if (topButton) {
    topButton.addEventListener('click', () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
    });
  }


  // Language selector is bound by the site-wide i18n controller (i18n.js).
  // No redirect or new network request is needed for the static theme.
})();
