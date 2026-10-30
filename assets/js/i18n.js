/* =====================================================================
 * Open Tickets V21 — one-page multilingual translation controller
 * All text/UI options, generated state announcements, input hints and
 * accessibility labels. The original text is preserved per text-node,
 * allowing locale changes in any order without nested translations.
 * This is a static-theme translation, not an API or machine-translation call.
 * ===================================================================== */
(() => {
 'use strict';
 const SUPPORTED = new Set(['en','af','zu','xh','st','de','fr','es','pt']);
 const LABELS = {en:'English',af:'Afrikaans',zu:'isiZulu',xh:'isiXhosa',st:'Sesotho',de:'Deutsch',fr:'Français',es:'Español',pt:'Português'};
 const WORDS = window.OT_I18N_STRINGS || {};
 const NODE_BASE = new WeakMap();
 const ATTR_BASE = new WeakMap();
 let current = 'en';
 let scheduled = false;

 const datePart = {
   en:{Mon:'Mon',Tue:'Tue',Wed:'Wed',Thu:'Thu',Fri:'Fri',Sat:'Sat',Sun:'Sun',Jan:'Jan',Feb:'Feb',Mar:'Mar',Apr:'Apr',May:'May',Jun:'Jun',Jul:'Jul',Aug:'Aug',Sep:'Sep',Oct:'Oct',Nov:'Nov',Dec:'Dec'},
   af:{Mon:'Ma',Tue:'Di',Wed:'Wo',Thu:'Do',Fri:'Vr',Sat:'Sa',Sun:'So',Jan:'Jan',Feb:'Feb',Mar:'Mrt',Apr:'Apr',May:'Mei',Jun:'Jun',Jul:'Jul',Aug:'Aug',Sep:'Sep',Oct:'Okt',Nov:'Nov',Dec:'Des'},
   zu:{Mon:'Msomb',Tue:'Lwesib',Wed:'Lwesith',Thu:'Lwesin',Fri:'Lwesihl',Sat:'Mgqib',Sun:'Sonto',Jan:'Jan',Feb:'Feb',Mar:'Mas',Apr:'Eph',May:'Mey',Jun:'Jun',Jul:'Jul',Aug:'Aga',Sep:'Sep',Oct:'Okt',Nov:'Nov',Dec:'Dis'},
   xh:{Mon:'Mvulo',Tue:'Lwesib',Wed:'Lwesith',Thu:'Lwesin',Fri:'Lwesihl',Sat:'Mgqib',Sun:'Cawa',Jan:'Jan',Feb:'Feb',Mar:'Mat',Apr:'Epr',May:'Mey',Jun:'Jun',Jul:'Jul',Aug:'Aga',Sep:'Sep',Oct:'Okt',Nov:'Nov',Dec:'Dis'},
   st:{Mon:'Mant',Tue:'Labob',Wed:'Labor',Thu:'Labon',Fri:'Laboh',Sat:'Moqeb',Sun:'Sont',Jan:'Phere',Feb:'Hlak',Mar:'Tlhak',Apr:'Mmesa',May:'Mots',Jun:'Phup',Jul:'Phupu',Aug:'Phato',Sep:'Lwets',Oct:'Mphal',Nov:'Pund',Dec:'Tshit'},
   de:{Mon:'Mo',Tue:'Di',Wed:'Mi',Thu:'Do',Fri:'Fr',Sat:'Sa',Sun:'So',Jan:'Jan',Feb:'Feb',Mar:'Mär',Apr:'Apr',May:'Mai',Jun:'Jun',Jul:'Jul',Aug:'Aug',Sep:'Sep',Oct:'Okt',Nov:'Nov',Dec:'Dez'},
   fr:{Mon:'lun.',Tue:'mar.',Wed:'mer.',Thu:'jeu.',Fri:'ven.',Sat:'sam.',Sun:'dim.',Jan:'janv.',Feb:'févr.',Mar:'mars',Apr:'avr.',May:'mai',Jun:'juin',Jul:'juil.',Aug:'août',Sep:'sept.',Oct:'oct.',Nov:'nov.',Dec:'déc.'},
   es:{Mon:'lun',Tue:'mar',Wed:'mié',Thu:'jue',Fri:'vie',Sat:'sáb',Sun:'dom',Jan:'ene',Feb:'feb',Mar:'mar',Apr:'abr',May:'may',Jun:'jun',Jul:'jul',Aug:'ago',Sep:'sep',Oct:'oct',Nov:'nov',Dec:'dic'},
   pt:{Mon:'seg',Tue:'ter',Wed:'qua',Thu:'qui',Fri:'sex',Sat:'sáb',Sun:'dom',Jan:'jan',Feb:'fev',Mar:'mar',Apr:'abr',May:'mai',Jun:'jun',Jul:'jul',Aug:'ago',Sep:'set',Oct:'out',Nov:'nov',Dec:'dez'}
 };
 const froms={en:'From',af:'Vanaf',zu:'Kusukela',xh:'Ukusuka',st:'Ho tloha',de:'Ab',fr:'À partir de',es:'Desde',pt:'Desde'};
 const dateWord={en:'Date',af:'Datum',zu:'Usuku',xh:'Umhla',st:'Letsatsi',de:'Datum',fr:'Date',es:'Fecha',pt:'Data'};
 const simpleLabel={
   'event card':{af:'geleentheidskaart',zu:'ikhadi lomcimbi',xh:'ikhadi lomsitho',st:'karete ya ketsahalo',de:'Eventkarte',fr:"carte d'événement",es:'tarjeta de evento',pt:'cartão de evento'},
   'event artwork':{af:'geleentheidsbeeld',zu:'isithombe somcimbi',xh:'umfanekiso womsitho',st:'setshwantsho sa ketsahalo',de:'Eventbild',fr:"image de l'événement",es:'imagen del evento',pt:'imagem do evento'},
   'favourites':{af:'gunstelinge',zu:'izintandokazi',xh:'iintandokazi',st:'baratuwa',de:'Favoriten',fr:'favoris',es:'favoritos',pt:'favoritos'}
 };

 function t(source, locale=current) {
   const str=String(source || '');
   if(locale==='en' || !str.trim()) return str;
   const trimmed=str.trim();
   const map=WORDS[locale]||{};
   let translated = map[trimmed];
   if(translated===undefined) {
     const date = trimmed.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\s*·\s*(\d{1,2}:\d{2})$/i);
     if (date) { const d=datePart[locale]||datePart.en; translated=`${d[date[1]]}, ${date[2]} ${d[date[3]]} ${date[4]} · ${date[5]}`; }
   }
   if(translated===undefined && /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i.test(trimmed)) {
     const title=trimmed.slice(0,1).toUpperCase()+trimmed.slice(1).toLowerCase();
     translated=(datePart[locale]?.[title]||trimmed).toUpperCase();
   }
   if(translated===undefined) {
     const from=trimmed.match(/^From\s+(R[\d,.–-]+)$/);
     if(from) translated=`${froms[locale]} ${from[1]}`;
   }
   if(translated===undefined){
     const da=trimmed.match(/^Date\s+(\d{1,2})\s+([A-Za-z]{3})$/);
     if(da) translated=`${dateWord[locale]} ${da[1]} ${(datePart[locale]?.[da[2][0]+da[2].slice(1).toLowerCase()]||da[2]).toUpperCase()}`;
   }
   if(translated===undefined){
     const patterns = [
       [/^Explore (.+) events$/i, ([_,name])=>`${t('Explore Events',locale)}: ${t(name,locale)}`],
       [/^(.+) event card$/i, ([_,name])=>`${name} — ${simpleLabel['event card'][locale]}`],
       [/^(.+) event artwork$/i, ([_,name])=>`${name} — ${simpleLabel['event artwork'][locale]}`],
       [/^(.+) event promotional artwork$/i,([_,name])=>`${name} — ${simpleLabel['event artwork'][locale]}`],
       [/^View (.+) event$/i, ([_,name])=>`${t('View Event',locale)}: ${name}`],
       [/^Feature event (.+)$/i, ([_,name])=>`${t('Featured event',locale)}: ${name}`],
       [/^Save (.+) to (?:this demo's|this preview's|preview) favourites$/i, ([_,name])=>`${t('Save',locale)}: ${name} — ${simpleLabel.favourites[locale]}`],
       [/^Remove (.+) from (?:this demo's|this preview's|preview) favourites$/i, ([_,name])=>`${t('Remove',locale)}: ${name} — ${simpleLabel.favourites[locale]}`],
       [/^(Playing|Play): (.+)$/i, ([_,verb,name])=>`${t(verb,locale)}: ${name}`],
       [/^(.+) (selected\. Continue in event search filters\.)$/i, ([_,name])=>`${t(name,locale)} — ${t('Search Events',locale)}`],
       [/^(Facebook|Instagram|YouTube|X) profile: pending confirmation$/i, ([_,name])=>`${name} — ${t('Social profiles pending verification',locale)}`],
       [/^(.+) event (\d+) of (\d+)$/i,([_,name,i,total])=>`${name} — ${t('Featured Events',locale)} ${i}/${total}`],
       [/^(\d+) preview events? shown for ([a-z-]+)\.$/i,([_,count,cat])=>`${count} ${t('Events',locale)} — ${t(cat==='all'?'All':cat.charAt(0).toUpperCase()+cat.slice(1),locale)}`],
     ];
     for(const [regex,fn] of patterns){const found=trimmed.match(regex);if(found){translated=fn(found);break;}}
   }
   if(translated===undefined) return str;
   const start=str.match(/^\s*/)?.[0]||'';
   const end=str.match(/\s*$/)?.[0]||'';
   return start+translated+end;
 }

 function scanText(){
   const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
     acceptNode(node){const parent=node.parentElement;if(!parent) return NodeFilter.FILTER_REJECT;
       return parent.closest('script,style,svg,noscript,template')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
     }
   });
   let node;
   while((node=walker.nextNode())){
     const actual=node.nodeValue;
     let record=NODE_BASE.get(node);
     if(!record){record={en:actual,last:actual};NODE_BASE.set(node,record);}
     else if(actual!==record.last){record.en=actual;record.last=actual;}
     const desired=t(record.en);
     if(actual!==desired){record.last=desired;node.nodeValue=desired;}
   }
 }
 function scanAttrs(){
   const attrs=['placeholder','aria-label','title','alt','aria-description'];
   for(const element of document.querySelectorAll('*')){
     if(element.closest('svg,script,style,noscript'))continue;
     let record=ATTR_BASE.get(element);
     if(!record){record={};ATTR_BASE.set(element,record);}
     for(const attr of attrs){
       if(!element.hasAttribute(attr))continue;
       const actual=element.getAttribute(attr);
       let v=record[attr];
       if(!v){v={en:actual,last:actual};record[attr]=v;}
       else if(actual!==v.last){v.en=actual;v.last=actual;}
       const desired=t(v.en);
       if(actual!==desired){v.last=desired;element.setAttribute(attr,desired);}
     }
   }
 }
 function translatePage(){
   scheduled=false;
   scanText();scanAttrs();
   document.documentElement.lang=current;
   document.documentElement.dataset.lang=current;
   const pageTitle=document.body.classList.contains('ot-inner-page') ? document.querySelector('main h1')?.textContent?.trim() : t('Events');
   document.title=document.body.classList.contains('ot-inner-page') ? `${pageTitle || t('Events')} | Open Tickets` : `Open Tickets — ${pageTitle}`;
   const header=document.getElementById('languageLabel');
   if(header && header.textContent!==LABELS[current]) header.textContent=LABELS[current];
   const footer=document.getElementById('footerLanguageSelect');
   if(footer && footer.value!==current) footer.value=current;
   document.querySelectorAll('.ot-language__menu button[data-lang]').forEach(el=>el.classList.toggle('is-selected',el.dataset.lang===current));
 }
 function queueUpdate(){if(scheduled)return;scheduled=true;requestAnimationFrame(translatePage);}
 function setLanguage(locale){
   if(!SUPPORTED.has(locale)) return;
   current=locale;
   try{localStorage.setItem('ot-demo-language',locale);}catch(e){}
   translatePage();
   document.dispatchEvent(new CustomEvent('ot:translation-changed',{detail:{language:current}}));
 }
 function getLanguage(){return current;}
 window.OT_I18N=Object.freeze({setLanguage,getLanguage,translate:t,refresh:queueUpdate,available:[...SUPPORTED]});

 document.addEventListener('ot:language-selected',event=>setLanguage(event.detail?.language));
 document.getElementById('footerLanguageSelect')?.addEventListener('change',e=>setLanguage(e.target.value));
 const observer=new MutationObserver(mutations=>{
   if(mutations.some(m=>m.type==='childList'||m.type==='characterData'||m.type==='attributes'))queueUpdate();
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title','alt']});
 let initial='en';try{initial=localStorage.getItem('ot-demo-language')||'en';}catch(e){}
 setLanguage(SUPPORTED.has(initial)?initial:'en');
})();
