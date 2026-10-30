/* ============================================================================
   OPEN TICKETS V26 — CONTINUOUS HERO SLIDER + SHARED HEADER
   Background: looping horizontal 5-slide carousel, controls target images only.
   Event sidebar: 3 smaller rotating cards, independent slow replacement.
   Native JavaScript. Does not initialise/change Isotope or ticket checkout.
   ============================================================================ */
(() => {
  'use strict';
  const $ = (q,root=document) => root.querySelector(q);
  const $$ = (q,root=document) => Array.from(root.querySelectorAll(q));
  const hero = $('#featuredEvents');
  if (!hero) return;
  const eventData = [
    {name:'Appel in PE',category:'Live Music',day:'06',month:'NOV',venue:'Boardwalk Hotel and Casino',image:'assets/images/events/appel-pe.webp',url:'event-detail.html'},
    {name:'Going Back West',category:'Festival',day:'07',month:'NOV',venue:'Tarlton Raceway',image:'assets/images/events/going-back-west.webp',url:'https://opentickets.co.za/event/01kva9y2phdzcq6p7p12s0r5vy'},
    {name:'ISR Sewes en Hoops',category:'School Sports',day:'31',month:'OCT',venue:'Hoërskool Hartebeespoort',image:'assets/images/events/isr-sewes.webp',url:'https://opentickets.co.za/event/01m5h7c18yer4wrqhjsyxrneeg'},
    {name:'Mamelodi Sundowns vs Durban City',category:'Football',day:'31',month:'OCT',venue:'Royal Bafokeng Stadium',image:'assets/images/events/sundowns-city.webp',url:'https://opentickets.co.za/event/01m5ena2smd0hden3vqrxdks07'},
    {name:'Help24 Somer Fees',category:'Festival',day:'21',month:'NOV',venue:'Hoërskool Florida',image:'assets/images/events/help24.webp',url:'https://opentickets.co.za/event/01m3vvwks8fnsc3f7qv9fbxpxk'}
  ];
  const slides = $$('.ot-hero__slide',hero);
  const track = $('#heroTrack');
  const pager = $('#heroPager');
  const previous = $('#heroPrev');
  const next = $('#heroNext');
  const pause = $('#heroAutoplay');
  const announcement = $('#heroAnnouncement');
  const rail = $('#heroRail');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const count = slides.length;
  let activeIndex = 0;
  let physicalIndex = 1;
  let carouselTimer = null;
  let railTimer = null;
  let paused = false;
  let pending = false;
  let railBusy = false;
  let transitionWatchdog = null;
  let replaceSlot = 0;
  let hiddenEventIndex = 3;
  const ROTATE_MS = 6200; // time between slide changes; editable in one place
  const RAIL_MS = 10800;

  /* The clones make the last-to-first AND first-to-last motion seamless. */
  if (count > 1) {
    const lastClone=slides[count-1].cloneNode(true), firstClone=slides[0].cloneNode(true);
    lastClone.removeAttribute('data-hero-slide');firstClone.removeAttribute('data-hero-slide');
    lastClone.setAttribute('aria-hidden','true');firstClone.setAttribute('aria-hidden','true');
    track.prepend(lastClone);track.append(firstClone);
    const allSlides=$$('.ot-hero__slide',track);
    track.style.width=`${allSlides.length*100}%`;
    allSlides.forEach(el => {el.style.flexBasis=`${100/allSlides.length}%`;});
    const offset=100/allSlides.length;
    track.classList.add('is-jumping');
    track.style.transform=`translate3d(-${offset}%,0,0)`;
    track.offsetHeight;track.classList.remove('is-jumping');
  }
  function place(index,immediate=false){
    const step=100/(count+2);
    if(immediate)track.classList.add('is-jumping');
    track.style.transform=`translate3d(-${(index*step).toFixed(6)}%,0,0)`;
    if(immediate){track.offsetHeight;track.classList.remove('is-jumping');}
  }
  function setActive(index,spoken=false){
    activeIndex=(index+count)%count;
    $$('button[data-slide]',pager).forEach((button,i)=>{
      const isActive=i===activeIndex;button.classList.toggle('is-active',isActive);
      if(isActive)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
    });
    if(spoken) announcement.textContent=`Background image ${activeIndex+1} of ${count}`;
  }
  function completeSlide(){
    clearTimeout(transitionWatchdog);
    transitionWatchdog=null;
    if(!pending)return;
    pending=false;
    if(physicalIndex===count+1){physicalIndex=1;place(1,true);}
    else if(physicalIndex===0){physicalIndex=count;place(count,true);}
  }
  function show(index,manual=false){
    if(count<2)return;
    // If someone clicks while sliding, finish the previous move cleanly first.
    if(pending)completeSlide();
    const desired=(index+count)%count;
    if(activeIndex===count-1 && desired===0 && index===count)physicalIndex=count+1;
    else if(activeIndex===0 && desired===count-1 && index===-1)physicalIndex=0;
    else physicalIndex=desired+1;
    setActive(desired,manual);
    pending=true;
    place(physicalIndex);
    // Browsers may skip transitionend when a tab is throttled or during resize.
    transitionWatchdog=setTimeout(completeSlide,1500);
    if(manual)restartCarousel();
  }
  track.addEventListener('transitionend',e=>{
    if(e.target!==track||e.propertyName!=='transform')return;
    completeSlide();
  });
  function jump(index,manual=false){
    if(reduceMotion.matches){
      clearTimeout(transitionWatchdog);transitionWatchdog=null;
      setActive(index,manual);physicalIndex=activeIndex+1;place(physicalIndex,true);
      pending=false;if(manual)restartCarousel();
    } else show(index,manual);
  }
  function stopCarousel(){if(carouselTimer)clearInterval(carouselTimer);carouselTimer=null;}
  function startCarousel(){
    stopCarousel();
    // Continuous rotation even while the user hovers/focuses the Hero.
    // Explicit Pause, a hidden tab, or reduced-motion preference are respected.
    if(paused||reduceMotion.matches||document.hidden)return;
    carouselTimer=setInterval(()=>jump(activeIndex+1),ROTATE_MS);
  }
  function restartCarousel(){stopCarousel();startCarousel();}
  previous?.addEventListener('click',()=>jump(activeIndex-1,true));
  next?.addEventListener('click',()=>jump(activeIndex+1,true));
  pager?.addEventListener('click',e=>{const b=e.target.closest('[data-slide]');if(b)jump(Number(b.dataset.slide),true);});
  pause?.addEventListener('click',()=>{
    paused=!paused;pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-pressed',String(paused));
    pause.setAttribute('aria-label',paused?'Resume background slideshow':'Pause background slideshow');
    restartCarousel();
  });
  // Hover and focus must not suspend background rotation (user requested nonstop).

  /* Event rail: three small accessible links, one gentle change per interval. */
  const makeCard = i => {
    const e=eventData[i];const a=document.createElement('a');
    a.className='ot-mini-card';a.href=e.url;a.dataset.index=String(i);a.setAttribute('aria-label',`View event ${e.name}`);
    // Two-column mini card: image/compact date on the left; event metadata
    // and a visible gold arrow on the right. Keep a single full-card link.
    const media=document.createElement('span');media.className='ot-mini-card__media';
    const img=document.createElement('img');img.src=e.image;img.alt='';img.loading='lazy';img.decoding='async';img.width=900;img.height=350;
    const date=document.createElement('span');date.className='ot-mini-card__date';date.append(document.createTextNode(e.day));
    const month=document.createElement('small');month.textContent=e.month;date.append(month);
    media.append(img,date);
    const copy=document.createElement('span');copy.className='ot-mini-card__copy';
    const info=document.createElement('span');info.className='ot-mini-card__details';
    const title=document.createElement('strong');title.textContent=e.name;
    const venue=document.createElement('small');venue.className='ot-mini-card__venue';venue.textContent=e.venue;
    const kind=document.createElement('small');kind.className='ot-mini-card__kind';kind.textContent=e.category||'';
    info.append(title,venue,kind);
    const arrow=document.createElement('span');arrow.className='ot-mini-card__arrow';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg class="ot-icon"><use href="#ot-i-arrow"></use></svg>';
    copy.append(info,arrow);a.append(media,copy);return a;
  };
  rail.replaceChildren(...[0,1,2].map(makeCard));
  function rotateRail(){
    if(railBusy||reduceMotion.matches||document.hidden||rail.matches(':hover')||rail.contains(document.activeElement))return;
    const children=$$('.ot-mini-card',rail),slot=replaceSlot%3,old=children[slot];if(!old)return;
    const oldIndex=Number(old.dataset.index),incomingIndex=hiddenEventIndex;
    railBusy=true;old.classList.add('is-changing');
    setTimeout(()=>{
      if(!old.isConnected){railBusy=false;return;}
      const updated=makeCard(incomingIndex);updated.classList.add('is-arriving');old.replaceWith(updated);
      requestAnimationFrame(()=>requestAnimationFrame(()=>updated.classList.remove('is-arriving')));
      hiddenEventIndex=oldIndex;replaceSlot=(slot+1)%3;railBusy=false;
    },440);
  }
  function stopRail(){if(railTimer)clearInterval(railTimer);railTimer=null;}
  function startRail(){stopRail();if(!reduceMotion.matches&&!document.hidden)railTimer=setInterval(rotateRail,RAIL_MS);}
  rail.addEventListener('mouseenter',stopRail);
  rail.addEventListener('mouseleave',startRail);
  rail.addEventListener('focusin',stopRail);
  rail.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!rail.contains(document.activeElement))startRail();}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopRail();stopCarousel();clearTimeout(transitionWatchdog);transitionWatchdog=null;pending=false;}else{pending=false;physicalIndex=activeIndex+1;place(physicalIndex,true);startRail();startCarousel();}});
  reduceMotion.addEventListener?.('change',()=>{if(reduceMotion.matches){stopRail();stopCarousel();clearTimeout(transitionWatchdog);transitionWatchdog=null;pending=false;physicalIndex=activeIndex+1;place(physicalIndex,true);}else{startRail();startCarousel();}});
  setActive(0);startCarousel();startRail();

  /* Shared sticky/shrinking header, mobile navigation, language hook unchanged. */
  const header=$('#siteHeader');let scheduled=false;
  function updateHeader(){header.classList.toggle('is-scrolled',window.scrollY>28);scheduled=false;}
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateHeader);}}, {passive:true});updateHeader();
  const mobileToggle=$('#mobileMenuToggle'), mobileMenu=$('#mobileMenu');
  function setMenu(open){mobileMenu.hidden=!open;mobileToggle.setAttribute('aria-expanded',String(open));mobileToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');if(open)$('#mobileSearch')?.focus({preventScroll:true});}
  mobileToggle?.addEventListener('click',()=>setMenu(mobileMenu.hidden));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileMenu.hidden){setMenu(false);mobileToggle.focus();}});
  document.addEventListener('pointerdown',e=>{if(!mobileMenu.hidden&&!header.contains(e.target))setMenu(false);});
  $$('a',mobileMenu).forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  matchMedia('(min-width:992px)').addEventListener?.('change',e=>{if(e.matches)setMenu(false);});
  $$('.ot-language__menu button[data-lang]').forEach(button=>button.addEventListener('click',()=>{
    $$('.ot-language__menu button').forEach(el=>el.classList.remove('is-selected'));
    button.classList.add('is-selected');const lab=$('#languageLabel');if(lab)lab.textContent=button.textContent;
    document.dispatchEvent(new CustomEvent('ot:language-selected',{detail:{language:button.dataset.lang}}));
  }));
})();
