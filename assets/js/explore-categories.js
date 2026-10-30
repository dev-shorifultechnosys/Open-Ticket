/* ============================================================================
   SECTION 05 — EXPLORE BY CATEGORY
   • Accessible, lightweight horizontal rail; no framework, no duplicated Isotope.
   • Category selections reuse Section 02's existing selection controls.
   • CMS filter logic stays owned by the original site at integration time.
   ============================================================================ */
(() => {
  'use strict';
  const section=document.getElementById('exploreCategories');
  if(!section) return;
  const viewport=section.querySelector('.ot-categories__viewport');
  const cards=[...section.querySelectorAll('.ot-category-card')];
  const previous=section.querySelector('[data-cat-previous]');
  const next=section.querySelector('[data-cat-next]');
  const status=section.querySelector('#categoryStatus');
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior=()=>prefersReduced.matches?'instant':'smooth';

  function updateArrows(){
    const remaining=viewport.scrollWidth-viewport.clientWidth;
    previous.disabled=viewport.scrollLeft<=2;
    next.disabled=viewport.scrollLeft>=remaining-2;
  }
  function slide(direction){
    const first=cards[0];
    const second=cards[1];
    const step=second?second.offsetLeft-first.offsetLeft:first.offsetWidth+14;
    viewport.scrollBy({left:direction*step*2,behavior:scrollBehavior()});
  }
  previous.addEventListener('click',()=>slide(-1));
  next.addEventListener('click',()=>slide(1));
  viewport.addEventListener('scroll',updateArrows,{passive:true});
  window.addEventListener('resize',updateArrows,{passive:true});
  requestAnimationFrame(updateArrows);

  function showSelected(category){
    cards.forEach(card=>{
      const on=card.dataset.category===category;
      card.classList.toggle('is-selected',on);
      card.setAttribute('aria-pressed',String(on));
    });
  }
  cards.forEach(card=>{
    card.addEventListener('click',()=>{
      const category=card.dataset.category;
      showSelected(category);
      status.textContent=`${card.dataset.categoryName} selected. Continue in event search filters.`;
      const discovery=document.getElementById('eventDiscovery');
      const chip=[...document.querySelectorAll('.ot-discovery__category')]
        .find(button=>button.dataset.category===category);
      if(chip) chip.click();
      else {
        // Other does not exist in the original discovery chip set; do not fake
        // an Isotope category. The user's selection is forwarded for integration.
        section.dispatchEvent(new CustomEvent('ot:category-intent',{
          bubbles:true,detail:{category}
        }));
      }
      discovery?.scrollIntoView({behavior:scrollBehavior(),block:'start'});
    });
  });
  document.getElementById('eventDiscovery')?.addEventListener('ot:category-selected',event=>{
    showSelected(event.detail.category);
  });
})();
