/* =====================================================================
  Open Tickets 4-page static theme. No Isotope initialization/replacement.
  Mobile menu, FAQ search, local search preview, gallery and tab interactions.
  Booking always uses the existing official provider.
===================================================================== */
(() => {
 'use strict';
 const header=document.getElementById('siteHeader');
 const toggle=document.getElementById('mobileMenuToggle');
 const menu=document.getElementById('mobileMenu');
 if (header && toggle && menu){
  function setMenu(open){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
  toggle.addEventListener('click',()=>setMenu(menu.hidden));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){setMenu(false);toggle.focus();}});
  document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!header.contains(e.target))setMenu(false);},{passive:true});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  matchMedia('(min-width:992px)').addEventListener?.('change',e=>{if(e.matches)setMenu(false)});
  const onScroll=()=>header.classList.toggle('is-scrolled',window.scrollY>28);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
 }
 document.querySelectorAll('.ot-language__menu [data-lang]').forEach(btn=>btn.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('ot:language-selected',{detail:{language:btn.dataset.lang}}))));
 // FAQ hub: all verified unique questions visible by default, category selection filters the list.
 const faqSearch=document.getElementById('faqSearch');
 if (faqSearch) {
  const groups=[...document.querySelectorAll('[data-faq-group]')];
  const sections=[...document.querySelectorAll('[data-faq-category]')];
  const empty=document.getElementById('faqNoResults');
  const count=document.getElementById('faqVisibleCount');
  const total=document.querySelectorAll('.inner-faq__entry').length;
  let selected='all';
  function show() {
   const term=faqSearch.value.trim().toLocaleLowerCase();
   let matches=0;
   sections.forEach(section=>{
    let inGroup=0;
    const belongs=selected==='all'||section.dataset.faqCategory===selected;
    section.querySelectorAll('.inner-faq__entry').forEach(entry=>{
      const visible=belongs&&(!term||entry.textContent.toLocaleLowerCase().includes(term));
      entry.hidden=!visible;
      if(visible) inGroup++;
    });
    section.hidden=!inGroup;
    matches+=inGroup;
   });
   empty.hidden=matches>0;
   count.textContent=`Showing ${matches} of ${total} questions`;
  }
  groups.forEach(button=>button.addEventListener('click',()=>{
   selected=button.dataset.faqGroup;
   groups.forEach(b=>{
    const active=b===button;
    b.classList.toggle('is-active',active);
    b.setAttribute('aria-pressed',String(active));
   });
   show();
   if(selected!=='all'&&window.matchMedia('(min-width:768px)').matches) {
    document.getElementById('faqItems')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
   }
  }));
  faqSearch.addEventListener('input',()=>{
   if(faqSearch.value.trim()) {
     selected='all';
     groups.forEach(b=>{const isAll=b.dataset.faqGroup==='all';b.classList.toggle('is-active',isAll);b.setAttribute('aria-pressed',String(isAll));});
   }
   show();
  });
  document.addEventListener('keydown',e=>{
   const target=document.activeElement;
   if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(target?.tagName) && !target?.isContentEditable){e.preventDefault();faqSearch.focus();}
  });
  show();
 }
 // Detail image gallery + tabbed content.
 const gallery=document.querySelector('.event-detail__main-image img');
 if(gallery){
  const frame=gallery.closest('.event-detail__main-image');
  const setArtwork=src=>frame?.classList.toggle('is-event-banner',src.includes('/appel-pe.'));
  document.querySelectorAll('[data-gallery-src]').forEach(b=>b.addEventListener('click',()=>{
    gallery.src=b.dataset.gallerySrc;gallery.alt=b.dataset.galleryAlt||'';setArtwork(gallery.getAttribute('src')||'');
    document.querySelectorAll('[data-gallery-src]').forEach(x=>{
      const selected=x===b;x.classList.toggle('is-selected',selected);x.setAttribute('aria-pressed',String(selected));
    });
  }));
 }
 const tabs=[...document.querySelectorAll('[data-event-tab]')];
 tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>{const active=x===t;x.classList.toggle('is-active',active);x.setAttribute('aria-selected',String(active));document.getElementById('eventTab'+x.dataset.eventTab.charAt(0).toUpperCase()+x.dataset.eventTab.slice(1)).hidden=!active;});}));
 // Search Results: small, honest local demo filter. Not Isotope; no CMS claims.
 const results=document.getElementById('resultGrid');
 if(results && Array.isArray(window.OT_EVENTS)){
  const entries=window.OT_EVENTS;
  const input=document.getElementById('resultSearchInput');
  const sort=document.getElementById('resultSort');
  const form=document.getElementById('resultSearchForm');
  const count=document.getElementById('resultCount');
  const empty=document.getElementById('resultEmpty');
  const checks=[...document.querySelectorAll('input[name="category"]')];
  const times=[...document.querySelectorAll('input[name="when"]')];
  const filterToggle=document.getElementById('resultFilterToggle');
  const filterPanel=document.getElementById('resultFilters');
  const compactFilters=matchMedia('(max-width:767.98px)');
  function setFiltersOpen(open){
   if(!filterPanel || !filterToggle)return;
   filterPanel.classList.toggle('is-mobile-open',open);
   filterToggle.setAttribute('aria-expanded',String(open));
   filterToggle.querySelector('.inner-results__filter-toggle-text').textContent=open?'Hide filters':'Filter & Sort';
  }
  filterToggle?.addEventListener('click',()=>setFiltersOpen(filterToggle.getAttribute('aria-expanded')!=='true'));
  compactFilters.addEventListener?.('change',()=>setFiltersOpen(false));
  document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&compactFilters.matches&&filterToggle?.getAttribute('aria-expanded')==='true'){
    setFiltersOpen(false);filterToggle.focus();
   }
  });
  const params=new URLSearchParams(location.search);
  input.value=params.get('query')||params.get('q')||'';
  const initialCategory=params.get('category');
  if(initialCategory) { const match=checks.find(c=>c.value===initialCategory);if(match)match.checked=true; }
  const validURL=v=>v.startsWith('https://opentickets.co.za/')||v==='event-detail.html';
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  function render(){
   const q=input.value.trim().toLocaleLowerCase();const selected=checks.filter(c=>c.checked).map(c=>c.value);
   const when=times.find(c=>c.checked)?.value||'all';const now=new Date(); now.setHours(0,0,0,0);
   const end=when==='week'?new Date(now.getFullYear(),now.getMonth(),now.getDate()+7,23,59,59):when==='month'?new Date(now.getFullYear(),now.getMonth()+1,0,23,59,59):null;
   // Sort by full event start timestamp (date + local time), not by day alone.
   // Stable name tie-breaker makes the order deterministic for equal start times.
   const startAt=e=>new Date(`${e.date}T${e.time||'00:00'}:00`);
   const filtered=entries.filter(e=>(!q||[e.name,e.venue,e.cat].join(' ').toLocaleLowerCase().includes(q))&&(!selected.length||selected.includes(e.cat))&&(!end||startAt(e)<=end)&&startAt(e)>=now)
    .sort((a,b)=>sort.value==='name'?a.name.localeCompare(b.name):startAt(a)-startAt(b)||a.name.localeCompare(b.name));
   results.replaceChildren();
   filtered.forEach(e=>{
    const card=el('article','inner-results__card');
    const imgBox=el('div','inner-results__card-image');const img=document.createElement('img');img.src='assets/images/events/'+e.img;img.alt=e.name+' promotional artwork';img.loading='lazy';img.width=960;img.height=510;imgBox.append(img,el('span','',e.cat==='sports'?'Sports':e.cat==='community'?'Community':e.cat==='arts'?'Arts':e.cat==='theatre'?'Theatre':e.cat==='music'?'Music':'Festival'));
    const body=el('div','inner-results__card-body');const title=el('h3','',e.name);const date=el('p','',e.when);const venue=el('p','',e.venue);const footer=el('div','inner-results__card-meta');const price=el('strong','',e.price==='Check price'?'Check price':'From '+e.price);const link=el('a','','View Event');link.href=validURL(e.url)?e.url:'search-results.html';footer.append(price,link);body.append(title,date,venue,footer);card.append(imgBox,body);results.append(card);
   });
   count.textContent=`Showing ${filtered.length} of ${entries.length} events`;
   empty.hidden=filtered.length>0;
   document.dispatchEvent(new CustomEvent('ot:results-updated',{detail:{count:filtered.length}}));
  }
  function reset(){input.value='';checks.forEach(c=>c.checked=false);times[0].checked=true;sort.value='date';render();}
  form.addEventListener('submit',e=>{e.preventDefault();render();});
  input.addEventListener('input',render);
  [...checks,...times,sort].forEach(c=>c.addEventListener('change',render));
  document.getElementById('resetResultFilters').addEventListener('click',reset);
  document.getElementById('clearResultEmpty').addEventListener('click',reset);
  render();
 }
})();
