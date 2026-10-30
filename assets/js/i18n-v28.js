/* V28: Only new Search Results controls; all languages follow existing locale system. */
(() => {const d=window.OT_I18N_STRINGS||{};
 const extras={
 en:{'Filter & Sort':'Filter & Sort','Hide filters':'Hide filters'},
 af:{'Filter & Sort':'Filtreer en sorteer','Hide filters':'Versteek filters'},
 zu:{'Filter & Sort':'Hlunga futhi uhlele','Hide filters':'Fihla izihlungi'},
 xh:{'Filter & Sort':'Hluza uze uhlele','Hide filters':'Fihla izihluzi'},
 st:{'Filter & Sort':'Hlopha le ho hlophisa','Hide filters':'Pata disefe'},
 de:{'Filter & Sort':'Filtern und sortieren','Hide filters':'Filter ausblenden'},
 fr:{'Filter & Sort':'Filtrer et trier','Hide filters':'Masquer les filtres'},
 es:{'Filter & Sort':'Filtrar y ordenar','Hide filters':'Ocultar filtros'},
 pt:{'Filter & Sort':'Filtrar e ordenar','Hide filters':'Ocultar filtros'}
 };for(const [lang,map] of Object.entries(extras))Object.assign(d[lang]||(d[lang]={}),map);
})();
