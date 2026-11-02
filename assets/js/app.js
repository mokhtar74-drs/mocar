(function () {
  'use strict';
  const D = window.MOCAR, I = window.I18N, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('mocar_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mocar_' + k, JSON.stringify(v)); } catch (e) { } }
  };
  const S = {
    lang: store.get('lang', 'ar'), theme: store.get('theme', (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'),
    fav: store.get('fav', []), cmp: store.get('cmp', []), recent: store.get('recent', [])
  };
  const carById = new Map(D.cars.map(c => [c.id, c]));
  ['fav', 'cmp', 'recent'].forEach(k => { S[k] = S[k].filter(id => carById.has(id)); });

  const t = (k, v) => { let s = I[S.lang][k] ?? k; if (v) for (const p in v) s = s.replace('{' + p + '}', v[p]); return s; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const L = (o, k) => o[k + (S.lang === 'ar' ? 'Ar' : 'En')];
  const nm = o => S.lang === 'ar' ? o.ar : o.en;
  const num = n => Math.round(n).toLocaleString('en-US');
  const money = n => `<span class="ltr">${num(n)}</span><span class="cur">${t('sar')}</span>`;
  const moneyText = n => `${num(n)} ${t('sar')}`;

  const ICONS = {
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', swap: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>', doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>', clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', down: '<path d="m6 9 6 6 6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    cmp: '<path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7"/>', phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>', up: '<path d="m18 15-6-6-6 6"/>', cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', engine: '<path d="M5 9h3V6h7l3 3h3v8h-3l-2 2H9l-3-3H3v-4h2z"/>', gear: '<circle cx="5" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v8M12 8v8M19 8v2a2 2 0 0 1-2 2H5"/>', speed: '<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    wa: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"/><path d="M8.5 8.5c0 4 3 7 7 7l1-2-2.5-1-1 1c-1-.5-2-1.500-2.500-2.500l1-1-1-2.500z"/>', home: '<path d="m3 11 9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>', car: '<path d="M5 17H3v-5l2-5a2 2 0 0 1 2-1.300h10a2 2 0 0 1 2 1.300l2 5v5h-2"/><circle cx="7.500" cy="17" r="2"/><circle cx="16.500" cy="17" r="2"/><path d="M9.500 17h5M4 12h16"/>', calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4"/>', pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>', spark: '<path d="M12 3l1.900 5.100L19 10l-5.100 1.900L12 17l-1.900-5.100L5 10l5.100-1.900zM19 16l.8 2.200L22 19l-2.200.8L19 22l-.8-2.200L16 19l2.200-.8z"/>', share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.600 13.500 6.800 4M15.400 6.500l-6.800 4"/>', filter: '<path d="M22 3H2l8 9.500V19l4 2v-8.500z"/>', ok: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>', shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>', card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>', cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.500"/>', mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>', family: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2M16 3.100a4 4 0 0 1 0 7.800M22 21v-2a4 4 0 0 0-3-3.900"/>', truck: '<path d="M1 3h14v13H1zM15 8h4l4 4v4h-8z"/><circle cx="6" cy="18.500" r="2.500"/><circle cx="18" cy="18.500" r="2.500"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>', ig: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.500 6.500h.01"/>', tt: '<path d="M14 3v12a4 4 0 1 1-4-4M14 3c.5 3 2.500 5 6 5"/>', yt: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>', xx: '<path d="M4 4l16 16M20 4 4 20"/>', sc: '<path d="M12 3c3 0 5 2 5 5v3l2 1-2 1.500c.5 1.500 2 2.500 3.500 3-1 .8-2 .8-3 1-.5 1.500-1.500 1-3 1.500-1 .3-1.500 1.500-2.500 1.500s-1.500-1.200-2.500-1.500c-1.500-.5-2.500 0-3-1.500-1-.2-2-.2-3-1 1.500-.5 3-1.500 3.500-3L5 12l2-1V8c0-3 2-5 5-5z"/>'
  };
  const ic = (n, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  // Illustrative assumptions only: every finance figure on the site derives from these and is labelled an estimate.
  const FIN = { rate: 5, term: 60, dbr: 33 };
  const estimate = (price, down = 0, months = FIN.term, rate = FIN.rate, balloon = 0) => {
    const financed = Math.max(price - down, 0), profit = financed * (rate / 100) * (months / 12), total = financed + profit;
    return { financed, profit, total: total + down, monthly: months ? Math.max(total - balloon, 0) / months : 0 };
  };
  const priced = D.cars.filter(c => c.vat > 0);
  const normAr = s => String(s).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const hay = new Map(D.cars.map(c => [c.id, normAr([c.en, c.ar, c.brandEn, c.brandAr, c.modelEn, c.modelAr, c.trimEn, c.trimAr, c.shapeEn, c.shapeAr, c.year, c.fuelEn, c.fuelAr].join(' '))]));
  const SEARCH_SYN = [[/اس يو في|جيب|عائليه|عائلي/g, 'suv'], [/بيك اب|بيكاب|ونيت|pick up/g, 'pickup'], [/هجين|هايبرد/g, 'hybrid'], [/كروس اوفر|كروس/g, 'crossover'], [/هاتشباك/g, 'hatchback'], [/سيدان/g, 'sedan'], [/باص|حافله/g, 'bus'], [/فان/g, 'van'], [/بنزين/g, 'petrol'], [/ديزل/g, 'diesel'], [/اوتوماتيك|اتوماتيك/g, 'automatic']];
  const SEARCH_STOP = new Set(['car', 'cars', 'a', 'an', 'the', 'for', 'with', 'سياره', 'سيارات', 'في', 'ب']);
  const yearLike = (n, u) => !u && +n >= 1990 && +n <= 2035;
  const toSar = (n, u) => { const v = parseFloat(n.replace(/,/g, '')); return (u || v < 1000) ? v * 1000 : v; };
  function parseSearch(q) {
    let s = normAr(String(q).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))), max = 0, min = 0;
    s = s.replace(/(under|below|less than|up to|max|اقل من|تحت|حتي|الي)\s*(\d[\d,.]*)\s*(k|الف)?/g, (m, _, n, u) => { if (yearLike(n, u)) return n; max = toSar(n, u); return ' '; });
    s = s.replace(/(over|above|more than|from|اكثر من|فوق|من)\s*(\d[\d,.]*)\s*(k|الف)?/g, (m, _, n, u) => { if (yearLike(n, u)) return n; min = toSar(n, u); return ' '; });
    SEARCH_SYN.forEach(([r, w]) => { s = s.replace(r, w); });
    return { words: s.split(' ').filter(w => w && !SEARCH_STOP.has(w)), max, min };
  }
  const searchCars = q => { const { words, max, min } = parseSearch(q); if (!words.length && !max && !min) return []; return D.cars.filter(c => words.every(w => hay.get(c.id).includes(w)) && (!max || (c.vat && c.vat <= max)) && (!min || c.vat >= min)); };
  const BEST = new Set(D.bestIds), OFFER = new Set(D.offers.flatMap(o => o.cars || []));
  const track = (event, data) => { (window.dataLayer = window.dataLayer || []).push({ event, ...data }); };
  const newRef = () => 'RE-' + Date.now().toString(36).toUpperCase().slice(-6);
  const ME_KEYS = ['name', 'mobile', 'email', 'city'];
  const saveMe = form => { const me = store.get('me', {}); ME_KEYS.forEach(k => { const el = form.elements[k]; if (el && el.value.trim()) me[k] = el.value.trim(); }); store.set('me', me); };
  const catMem = { shown: 12 };
  const shareBase = () => location.href.split('#')[0];
  function setMeta(desc, ld) {
    const m = $('meta[name=description]'); if (m) m.content = desc;
    let el = $('#ldJson'); if (el) el.remove();
    if (ld) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'ldJson'; el.textContent = JSON.stringify(ld); document.head.appendChild(el); }
  }
  const uniq = (key, src = D.cars) => [...new Map(src.map(c => [c[key + 'En'], { v: c[key + 'En'], en: c[key + 'En'], ar: c[key + 'Ar'] }])).values()];

  /* ---------- Parts ---------- */
  function priceHTML(c) {
    if (!c.vat) return `<div class="pr-req">${esc(L(c, 'priceNote') || t('onRequest'))}</div>`;
    return `<div class="pr-ex"><span>${money(c.price)}</span><small>${t('exTax')}</small></div><div class="pr-in"><span>${money(c.vat)}</span><small>${t('incTax')}</small></div>`;
  }
  function badge(c) {
    if (BEST.has(c.id)) return `<span class="tag tag-best">${t('bestSelling')}</span>`;
    if (OFFER.has(c.id)) return `<span class="tag tag-offer">${t('inOffer')}</span>`;
    return `<span class="tag">${esc(L(c, 'shape'))}</span>`;
  }
  const monthlyLine = c => c.vat ? `<div class="card-mo">≈ ${moneyText(estimate(c.vat).monthly)} ${t('perMonth')} <small>${t('estShort')}</small></div>` : '';
  function toolBtns(c) {
    const f = S.fav.includes(c.id), m = S.cmp.includes(c.id);
    return `<div class="card-tools"><button class="tool" data-quick="${c.id}" title="${t('quickView')}" aria-label="${t('quickView')}: ${esc(nm(c))}">${ic('eye')}</button><button class="tool t-cmp ${m ? 'on' : ''}" data-cmp="${c.id}" aria-pressed="${m}" title="${t(m ? 'inCompare' : 'addCompare')}" aria-label="${t(m ? 'inCompare' : 'addCompare')}: ${esc(nm(c))}">${ic('cmp')}</button><button class="tool ${f ? 'on' : ''}" data-fav="${c.id}" aria-pressed="${f}" title="${t(f ? 'remFav' : 'addFav')}" aria-label="${t(f ? 'remFav' : 'addFav')}: ${esc(nm(c))}">${ic('heart')}</button></div>`;
  }
  function card(c) {
    return `<article class="card">${toolBtns(c)}${badge(c)}
      <a class="card-media" href="#/car/${c.id}" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" src="${c.thumb}" alt=""></a>
      <div class="card-body"><a class="card-title" href="#/car/${c.id}">${esc(nm(c))}</a></div>
      <div class="specline"><span>${ic('cal')}${c.year}</span><span>${ic('engine')}${c.engine} ${t('liter')}</span><span>${ic('gear')}${esc(L(c, 'trans'))}</span><span>${ic('speed')}${c.hp} ${t('hp')}</span></div>
      <div class="card-price">${priceHTML(c)}${monthlyLine(c)}</div></article>`;
  }
  const scrollerNav = id => `<div class="scroller-nav"><button class="round" data-scroll="${id}" data-dir="-1" aria-label="${t('prev')}">${ic('chevL', 'flip')}</button><button class="round" data-scroll="${id}" data-dir="1" aria-label="${t('next')}">${ic('chevR', 'flip')}</button></div>`;
  const pageHead = (title, sub) => `<div class="page-head"><div class="wrap"><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div></div>`;

  /* ---------- Chrome ---------- */
  const NAV = [['/', 'home'], ['/cars', 'cars'], ['/offers', 'offers'], ['/finance', 'finance'], ['/finder', 'finder'], ['/trade-in', 'tradeIn'], ['/branches', 'branches'], ['/about', 'about'], ['/contact', 'contact']], MORE = [['/jobs', 'jobs'], ['/faqs', 'faqs'], ['/blog', 'blog']];
  function navHTML() {
    const link = ([p, k]) => `<a href="#${p}" data-nav="${p}">${t(k)}</a>`;
    const mega = `<div class="mega"><div><h4>${t('browseBrands')}</h4><div class="mega-brands">${D.brands.filter(b => b.count).sort((a, b) => b.count - a.count).map(b => `<a href="#/cars?brand=${b.id}">${b.img ? `<img src="${b.img}" alt="" loading="lazy">` : ''}<span>${esc(nm(b))}</span></a>`).join('')}</div></div><div><h4>${t('browseBody')}</h4><div class="mega-list">${uniq('shape').map(x => `<a href="#/cars?body=${encodeURIComponent(x.v)}">${esc(nm(x))}</a>`).join('')}</div><h4>${t('shortcuts')}</h4><div class="mega-list">${SHORTCUTS().map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</div></div></div>`;
    return NAV.map(n => n[0] === '/cars' ? `<div class="has-menu">${link(n).replace('</a>', ` ${ic('down', 'caret')}</a>`)}${mega}</div>` : link(n)).join('') + `<div class="has-menu"><button class="nav-more" aria-haspopup="true">${t('more')} ${ic('down', 'caret')}</button><div class="drop">${MORE.map(link).join('')}</div></div>`;
  }
  const SHORTCUTS = () => [['#/cars?max=60000', t('under60')], ['#/cars?monthly=1000', t('mo1000')], ['#/cars?fuel=Hybrid', t('hybrids')], ['#/cars?year=2026', t('m2026')]];
  const SOC = [['facebook', 'fb'], ['instagram', 'ig'], ['tiktok', 'tt'], ['youtube', 'yt'], ['x', 'xx'], ['snapchat', 'sc']];
  const socials = () => `<div class="socials">${SOC.map(([k, i]) => `<a href="${D.contact.social[k]}" target="_blank" rel="noopener" aria-label="${k}">${ic(i)}</a>`).join('')}</div>`;
  function renderChrome() {
    const h = document.documentElement; h.lang = S.lang; h.dir = S.lang === 'ar' ? 'rtl' : 'ltr'; h.dataset.theme = S.theme;
    $('#skipLink').textContent = t('skip');
    const dark = S.theme === 'dark';
    $('#header').innerHTML = `<div class="top"><div class="wrap">
        <button class="icon-btn menu-btn" data-act="drawer" aria-label="${t('menu')}">${ic('menu')}</button>
        <a class="logo" href="#/" aria-label="${t('company')}"><img src="assets/img/ui/logo.svg" alt="${t('company')}" width="187" height="40"></a>
        <button class="head-search" data-act="search" aria-label="${t('search')}">${ic('search')}<span>${t('searchPh')}</span><kbd>Ctrl K</kbd></button>
        <div class="top-act">
          <a class="top-phone" href="tel:${D.contact.phone}" aria-label="${t('callSales')}">${ic('phone')}<span class="ltr">${D.contact.phone}</span></a>
          <button class="icon-btn" data-act="search" aria-label="${t('search')}" style="display:var(--msearch,none)">${ic('search')}</button>
          <a class="icon-btn hide-m" href="#/compare" aria-label="${t('compare')}">${ic('cmp')}<span class="badge" data-badge="cmp"></span></a>
          <a class="icon-btn hide-m" href="#/favorites" aria-label="${t('favorites')}">${ic('heart')}<span class="badge" data-badge="fav"></span></a>
          <button class="icon-btn" data-act="theme" aria-label="${t(dark ? 'themeLight' : 'themeDark')}" title="${t(dark ? 'themeLight' : 'themeDark')}">${ic(dark ? 'sun' : 'moon')}</button>
          <button class="icon-btn lang-btn" data-act="lang" lang="${S.lang === 'ar' ? 'en' : 'ar'}">${S.lang === 'ar' ? 'EN' : 'ع'}</button>
          <a class="btn btn-brand order-top" href="#/order">${t('order')}</a>
        </div></div></div>
      <div class="sub"><div class="wrap"><nav class="nav" aria-label="${t('menu')}">${navHTML()}</nav>${socials()}</div></div>`;
    $('#footer').innerHTML = `<div class="wrap foot">
        <div><img src="assets/img/ui/logo.svg" alt="${t('company')}" width="187" height="40"><p>${t('footerText')}</p>${socials()}</div>
        <div><h3>${t('importantLinks')}</h3><ul>${[['/', 'home'], ['/offers', 'offers'], ['/branches', 'branches'], ['/cars', 'cars']].map(([p, k]) => `<li><a href="#${p}">${t(k)}</a></li>`).join('')}</ul></div>
        <div><h3>${t('quickLinks')}</h3><ul>${[['/faqs', 'faqs'], ['/contact', 'contact'], ['/trade-in', 'tradeIn'], ['/order', 'order'], ['/quote', 'quote'], ['/jobs', 'jobs'], ['/about', 'about'], ['/privacy', 'privacy']].map(([p, k]) => `<li><a href="#${p}">${t(k)}</a></li>`).join('')}</ul></div>
        <div><h3>${t('contact')}</h3><ul><li><a href="tel:${D.contact.phone}" class="ltr">${D.contact.phone}</a></li><li><a href="https://wa.me/${D.contact.whatsapp}" target="_blank" rel="noopener">${t('whatsapp')}: <span class="ltr">${D.contact.whatsappShow}</span></a></li><li><a href="mailto:${D.contact.email}">${D.contact.email}</a></li><li><a href="#/finance">${t('finance')}</a></li><li><a href="#/finder">${t('finder')}</a></li></ul></div>
      </div><div class="foot-bot">© ${t('rights')}</div>`;
    $('#bottomNav').innerHTML = [['/', 'home', 'home'], ['/cars', 'car', 'cars'], ['/finance', 'calc', 'finance'], ['/favorites', 'heart', 'favorites'], ['/branches', 'pin', 'branches']].map(([p, i, k]) => `<a href="#${p}" data-nav="${p}">${ic(i)}<span>${k === 'finance' && S.lang === 'ar' ? 'التمويل' : k === 'finance' ? 'Finance' : t(k)}</span>${k === 'favorites' ? '<span class="badge" data-badge="fav"></span>' : ''}</a>`).join('');
    $('#floaters').innerHTML = `<button class="fab fab-up" data-act="top" aria-label="Top">${ic('up')}</button><div class="hub-wrap"><div class="hub" id="hub" hidden><b>${t('howHelp')}</b><a href="https://wa.me/${D.contact.whatsapp}" target="_blank" rel="noopener">${ic('wa')}${t('whatsapp')}</a><a href="tel:${D.contact.phone}">${ic('phone')}${t('callSales')}</a><button data-act="callback">${ic('clock')}${t('callback')}</button><a href="#/branches">${ic('pin')}${t('branches')}</a><a href="#/finder">${ic('spark')}${t('finder')}</a></div><button class="fab" data-act="hub" aria-expanded="false" aria-controls="hub" aria-label="${t('howHelp')}">${ic('chat')}</button></div>`;
    document.documentElement.style.setProperty('--msearch', innerWidth <= 720 ? 'inline-flex' : 'none');
    updateBadges(); renderTray(); markNav();
  }
  function markNav() { const p = '/' + (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]); $$('[data-nav]').forEach(a => { const on = a.dataset.nav === p || (p === '/car' && a.dataset.nav === '/cars'); a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); }); }
  function updateBadges() { $$('[data-badge]').forEach(b => { const n = S[b.dataset.badge].length; b.textContent = n || ''; }); }
  function toast(m) { const e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('show'), 2400); }
  function renderTray() {
    const route = location.hash.split('?')[0], show = S.cmp.length && route !== '#/compare';
    document.body.classList.toggle('has-tray', !!show);
    $('#compareTray').innerHTML = show ? `<div class="tray"><div class="wrap"><div class="tray-cars">${S.cmp.map(id => { const c = carById.get(id); return `<div class="tray-car"><img src="${c.thumb}" alt="${esc(nm(c))}"><button data-cmp="${id}" aria-label="${t('remove')}: ${esc(nm(c))}">×</button></div>`; }).join('')}</div><a class="btn btn-brand btn-sm" href="#/compare">${t('compareNow')} (${S.cmp.length})</a></div></div>` : '';
  }
  function syncToggles() {
    $$('[data-fav]').forEach(b => { const on = S.fav.includes(+b.dataset.fav); b.classList.toggle(b.classList.contains('btn') ? 'on-red' : 'on', on); b.setAttribute('aria-pressed', on); });
    $$('[data-cmp]').forEach(b => { if (b.closest('.tray-car,.rm-wrap')) return; const on = S.cmp.includes(+b.dataset.cmp); b.classList.toggle(b.classList.contains('btn') ? 'on-brand' : 'on', on); b.setAttribute('aria-pressed', on); });
    updateBadges(); renderTray();
  }

  /* ---------- Overlays ---------- */
  let lastFocus = null;
  function openOverlay(html, onKey) {
    lastFocus = document.activeElement; $('#overlay').innerHTML = html; document.body.style.overflow = 'hidden'; openOverlay.key = onKey || null;
    const f = $('#overlay').querySelector('input,button,a'); if (f) f.focus();
  }
  function closeOverlay() { $('#overlay').innerHTML = ''; document.body.style.overflow = ''; openOverlay.key = null; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  function openDrawer() {
    openOverlay(`<div class="backdrop" data-close="1"><nav class="drawer" role="dialog" aria-modal="true" aria-label="${t('menu')}"><div class="drawer-head"><img src="assets/img/ui/logo.svg" alt="" style="height:38px;background:#0B1730;border-radius:7px;padding:4px 7px"><button class="icon-btn" data-act="close" aria-label="${t('close')}">${ic('x')}</button></div>
      ${[...NAV, ...MORE, ['/compare', 'compare'], ['/favorites', 'favorites'], ['/order', 'order'], ['/quote', 'quote']].map(([p, k]) => `<a href="#${p}">${t(k)}</a>`).join('')}<div style="margin-top:10px">${socials()}</div></nav></div>`);
  }
  function openSearch() {
    openOverlay(`<div class="backdrop" data-close="1"><div class="palette" role="dialog" aria-modal="true" aria-label="${t('search')}"><div class="palette-in">${ic('search')}<input id="palQ" type="search" autocomplete="off" placeholder="${t('searchPh')}" aria-label="${t('searchPh')}"><button class="icon-btn" data-act="close" aria-label="${t('close')}">${ic('x')}</button></div><div class="palette-list" id="palList"></div></div></div>`);
    const q = $('#palQ'), list = $('#palList'); let idx = -1, res = [];
    const draw = () => {
      const v = q.value.trim(); res = v ? searchCars(v) : D.bestIds.map(i => carById.get(i)); idx = -1;
      list.innerHTML = (v ? '' : `<div class="pal-ex"><small>${t('tryThese')}</small>${t('searchExamples').split('|').map(x => `<button class="chip" data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div>`) + (res.length ? res.slice(0, 7).map(c => `<a class="sug" href="#/car/${c.id}"><img src="${c.thumb}" alt="" loading="lazy"><span><b>${esc(nm(c))}</b><small>${c.vat ? moneyText(c.vat) + ' · ' + t('incTax') : esc(L(c, 'priceNote') || t('onRequest'))}</small></span></a>`).join('') + (v ? `<a class="sug link" href="#/cars?q=${encodeURIComponent(v)}" style="justify-content:center">${t('viewAllResults')} (${res.length})</a>` : '') : `<div class="sug-empty">${t('noResults')}</div>`);
    };
    q.addEventListener('input', draw);
    list.addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (b) { q.value = b.dataset.ex; draw(); q.focus(); } });
    q.addEventListener('keydown', e => {
      const items = $$('.sug', list);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((x, i) => x.classList.toggle('on', i === idx)); items[idx] && items[idx].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') { e.preventDefault(); if (items[idx]) items[idx].click(); else if (q.value.trim()) { location.hash = '#/cars?q=' + encodeURIComponent(q.value.trim()); closeOverlay(); } }
    });
    draw();
  }
  function lightbox(imgs, start) {
    let i = start;
    const show = () => { const im = $('#lbImg'); if (!im) return; im.src = imgs[i]; im.classList.remove('zoomed'); $('#lbC').textContent = `${i + 1} / ${imgs.length}`; $$('.lb-thumbs button').forEach((b, n) => { b.classList.toggle('on', n === i); if (n === i) b.scrollIntoView({ block: 'nearest', inline: 'center' }); }); };
    const step = d => { i = (i + d + imgs.length) % imgs.length; show(); };
    openOverlay(`<div class="lb" id="lb" role="dialog" aria-modal="true"><button class="x" data-act="close" aria-label="${t('close')}">${ic('x')}</button><button class="p" aria-label="${t('prev')}">${ic('chevL', 'flip')}</button><img id="lbImg" src="${imgs[i]}" alt="" title="${t('zoomHint')}"><button class="n" aria-label="${t('next')}">${ic('chevR', 'flip')}</button><div class="c" id="lbC"></div><div class="lb-thumbs">${imgs.map((u, n) => `<button data-n="${n}" aria-label="${n + 1}"><img src="${u}" alt="" loading="lazy"></button>`).join('')}</div></div>`, e => {
      if (e.key === 'ArrowLeft') step(S.lang === 'ar' ? 1 : -1);
      if (e.key === 'ArrowRight') step(S.lang === 'ar' ? -1 : 1);
    });
    show();
    const lb = $('#lb'), im = $('#lbImg'); $('.p', lb).onclick = () => step(-1); $('.n', lb).onclick = () => step(1);
    $('.lb-thumbs', lb).onclick = e => { const b = e.target.closest('[data-n]'); if (b) { i = +b.dataset.n; show(); } };
    im.onclick = () => im.classList.toggle('zoomed');
    im.onmousemove = e => { const r = im.getBoundingClientRect(); im.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; };
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    lb.addEventListener('touchend', e => { if (sx === null || im.classList.contains('zoomed')) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 45) step((dx < 0 ? 1 : -1) * (S.lang === 'ar' ? -1 : 1)); sx = null; });
    lb.addEventListener('click', e => { if (e.target === lb) closeOverlay(); });
  }
  function quickView(id) {
    const c = carById.get(id); if (!c) return;
    const specs = [['year', c.year], ['engineSize', `${c.engine} ${t('liter')}`], ['power', `${c.hp} ${t('hp')}`], ['transmission', L(c, 'trans')], ['fuel', L(c, 'fuel')], ['drive', L(c, 'drive')]];
    openOverlay(`<div class="backdrop" data-close="1"><div class="modal qv" role="dialog" aria-modal="true" aria-label="${esc(nm(c))}"><div class="modal-head"><h2 style="font-size:20px;font-weight:700;line-height:1.3">${esc(nm(c))}</h2><button class="icon-btn" data-act="close" aria-label="${t('close')}">${ic('x')}</button></div><img src="${c.img}" alt="${esc(nm(c))}" style="width:100%;border-radius:10px;aspect-ratio:1.92;object-fit:cover"><div class="price-box">${priceHTML(c)}${monthlyLine(c)}</div><div class="quick-specs">${specs.map(([k, v]) => `<div><span>${t(k)}</span><b>${esc(v)}</b></div>`).join('')}</div><div class="cta-grid"><a class="btn btn-brand" href="#/buy/${c.id}">${t('startPurchase')}</a><a class="btn btn-line" href="#/car/${c.id}">${t('details')}</a></div></div></div>`);
  }

  /* ---------- Forms ---------- */
  function fieldHTML(f) {
    if (!f.value && ME_KEYS.includes(f.name)) f = { ...f, value: store.get('me', {})[f.name] || '' };
    const id = 'f_' + f.name, lbl = `<label for="${id}">${esc(f.label)}${f.req ? ' <span class="req">*</span>' : f.opt ? ` <span class="opt">(${t('optional')})</span>` : ''}</label>`, cls = 'field' + (f.full ? ' full' : '');
    const req = f.req ? 'aria-required="true"' : '';
    let c;
    if (f.type === 'select') c = `<select id="${id}" name="${f.name}" ${req} ${f.disabled ? 'disabled' : ''}><option value="">${esc(f.ph || t('choose'))}</option>${(f.options || []).map(o => `<option value="${esc(o.v)}" ${o.v == f.value ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>`;
    else if (f.type === 'textarea') c = `<textarea class="input" id="${id}" name="${f.name}" ${req} placeholder="${esc(f.ph || '')}">${esc(f.value || '')}</textarea>`;
    else c = `<input class="input ${f.type === 'tel' ? 'phone-in' : ''}" id="${id}" name="${f.name}" type="${f.type || 'text'}" ${req} ${f.type === 'tel' ? 'inputmode="numeric" maxlength="10" placeholder="05XXXXXXXX" autocomplete="tel"' : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} value="${esc(f.value || '')}" placeholder="${f.type === 'tel' ? '05XXXXXXXX' : esc(f.ph || '')}">`;
    return `<div class="${cls}">${lbl}${c}<div class="err" id="${id}_e"></div></div>`;
  }
  const CITIES = [['Riyadh', 'الرياض'], ['Jeddah', 'جدة'], ['Makkah', 'مكة المكرمة'], ['Madinah', 'المدينة المنورة'], ['Dammam', 'الدمام'], ['Khobar', 'الخبر'], ['Abha', 'أبها'], ['Khamis Mushait', 'خميس مشيط'], ['Tabuk', 'تبوك'], ['Jazan', 'جازان'], ['Taif', 'الطائف'], ['Buraydah', 'بريدة'], ['Hail', 'حائل'], ['Najran', 'نجران'], ['Al Ahsa', 'الأحساء']];
  const cityOpts = () => CITIES.map(([e, a]) => ({ v: e, l: S.lang === 'ar' ? a : e }));
  const carOpts = () => [...D.cars].sort((a, b) => nm(a).localeCompare(nm(b))).map(c => ({ v: c.id, l: nm(c) }));
  const brandOpts = () => D.brands.filter(b => b.count).map(b => ({ v: b.id, l: nm(b) }));
  const branchOpts = () => D.branches.map(b => ({ v: b.id, l: nm(b) }));
  function formHTML(id, fields, submitLabel) {
    return `<form class="form" id="${id}" novalidate><div class="form-grid">${fields.map(fieldHTML).join('')}</div><button class="btn btn-wa btn-block" type="submit">${ic('wa')}${submitLabel || t('sendWa')}</button><p class="note">${t('formHint')}</p></form>`;
  }
  function validate(form, fields) {
    let firstBad = null;
    fields.forEach(f => {
      const el = form.elements[f.name], e = $('#f_' + f.name + '_e', form); if (!el) return;
      const v = el.value.trim(); let msg = '';
      if (f.req && !v) msg = t('required');
      else if (v && f.type === 'tel' && !/^05\d{8}$/.test(v)) msg = t('invalidPhone');
      else if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = t('invalidEmail');
      else if (v && f.type === 'date' && v < today()) msg = t('pastDate');
      e.textContent = msg; el.classList.toggle('bad', !!msg); el.setAttribute('aria-invalid', !!msg);
      if (msg) { el.setAttribute('aria-describedby', e.id); if (!firstBad) firstBad = el; }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  const today = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
  function bindForm(id, fields, title, onDone) {
    const form = $('#' + id); if (!form) return;
    form.addEventListener('input', e => { const f = fields.find(x => x.name === e.target.name); if (f && e.target.classList.contains('bad')) validate2(form, f); });
    form.addEventListener('submit', e => {
      e.preventDefault(); if (!validate(form, fields)) return;
      saveMe(form); const ref = newRef(); track('lead', { form: id, ref }); const lines = [`*${title}*`, `${t('refNo')}: ${ref}`];
      fields.forEach(f => {
        const el = form.elements[f.name]; if (!el) return; let v = el.value.trim(); if (!v) return;
        if (el.tagName === 'SELECT') v = el.options[el.selectedIndex].text;
        lines.push(`${f.label}: ${v}`);
      });
      if (onDone) lines.push(...onDone(form));
      const url = `https://wa.me/${D.contact.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
      const box = form.parentElement;
      form.outerHTML = `<div class="form-done" role="status">${ic('ok')}<h3>${t('sent')}</h3><p>${t('refNo')}: <b class="ltr">${ref}</b></p><p>${t('sentSub')}</p><div class="row"><a class="btn btn-wa" href="${url}" target="_blank" rel="noopener">${ic('wa')}${t('openWa')}</a><a class="btn btn-line" href="tel:${D.contact.phone}">${ic('phone')}${t('call')}</a></div></div>`;
      box.querySelector('.form-done').scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }
  function validate2(form, f) {
    const el = form.elements[f.name], e = $('#f_' + f.name + '_e', form), v = el.value.trim();
    const ok = f.req && !v ? false : !(v && f.type === 'tel' && !/^05\d{8}$/.test(v)) && !(v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    if (ok) { e.textContent = ''; el.classList.remove('bad'); el.setAttribute('aria-invalid', false); }
  }

  /* ---------- Pages ---------- */
  const Pages = {};
  let sliderTimer = null;

  Pages.home = () => {
    const best = D.bestIds.map(i => carById.get(i)).filter(Boolean);
    const shapes = uniq('shape').map(s => { const list = D.cars.filter(c => c.shapeEn === s.v); return { ...s, n: list.length, img: list[0].thumb }; }).sort((a, b) => b.n - a.n);
    const installs = priced.map(c => estimate(c.vat).monthly), minI = Math.floor(Math.min(...installs) / 100) * 100, maxI = 3000;
    const recent = S.recent.map(i => carById.get(i)).filter(Boolean);
    $('#main').innerHTML = `
      <section class="hero" aria-roledescription="carousel"><div class="slides">${D.banners.map((b, i) => `<div class="slide ${i ? '' : 'on'}"><img src="${i ? 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' : b}" ${i ? `data-src="${b}"` : 'fetchpriority="high"'} alt=""></div>`).join('')}
        <button class="s-arrow s-prev" data-slide="-1" aria-label="${t('prev')}">${ic('chevL', 'flip')}</button><button class="s-arrow s-next" data-slide="1" aria-label="${t('next')}">${ic('chevR', 'flip')}</button>
        <div class="dots">${D.banners.map((_, i) => `<button class="dot ${i ? '' : 'on'}" data-dot="${i}" aria-label="${i + 1}"></button>`).join('')}</div></div></section>
      <div class="wrap search-band"><div class="search-card"><div><h1>${t('heroTitle')}</h1><p>${t('heroSub')}</p></div>
        <div><button class="search-field" data-act="search">${ic('search')}<span>${t('searchPh')}</span><span class="btn btn-brand btn-sm" style="flex:none">${t('search')}</span></button>
        <div class="qf"><select id="qfBrand" aria-label="${t('brand')}"><option value="">${t('allBrands')}</option>${D.brands.filter(b => b.count).sort((a, b) => nm(a).localeCompare(nm(b))).map(b => `<option value="${b.id}">${esc(nm(b))}</option>`).join('')}</select><select id="qfBody" aria-label="${t('body')}"><option value="">${t('allBodies')}</option>${uniq('shape').map(x => `<option value="${esc(x.v)}">${esc(nm(x))}</option>`).join('')}</select><select id="qfMo" aria-label="${t('monthlyBudget')}"><option value="">${t('monthlyBudget')}</option>${[1000, 1500, 2000, 3000].map(v => `<option value="${v}">${t('upTo')} ${num(v)} ${t('sar')}</option>`).join('')}</select><a class="btn btn-brand" id="qfGo"></a></div>
        <div class="quick">${SHORTCUTS().map(([h, l]) => `<a class="chip" href="${h}">${l}</a>`).join('')}<a class="chip" href="#/finder">${ic('spark')}${t('finder')}</a></div></div></div>
        <div class="stats">${[[D.cars.length, 'statCars'], [D.brands.filter(b => b.count).length, 'statBrands'], [D.branches.length, 'statBranches'], [D.banks.length, 'statBanks']].map(([n, k]) => `<div class="stat"><b data-count="${n}">${n}</b><span>${t(k)}</span></div>`).join('')}</div></div>
      <section class="sec wrap reveal"><div class="sec-head"><h2 class="sec-title">${t('bestSelling')}</h2><div class="scroller-nav">${scrollerNav('bestS')}<a class="btn btn-line btn-sm" href="#/cars">${t('viewAll')}</a></div></div><div class="scroller" id="bestS" tabindex="0">${best.map(card).join('')}</div></section>
      <section class="wrap reveal"><div class="budget"><div><h2>${t('budgetTitle')}</h2><p>${t('budgetSub')}</p><small>${t('estNote')}</small></div>
        <div><label for="budget" class="budget-val"><span id="budgetV"></span> <span style="font-size:16px;font-weight:600">${t('sar')} ${t('perMonth')}</span></label><input id="budget" type="range" min="${minI}" max="${maxI}" step="100" value="${Math.min(1500, maxI)}" aria-label="${t('budgetTitle')}"><a class="btn btn-brand" id="budgetGo"></a></div></div></section>
      ${recent.length ? `<section class="sec wrap reveal"><div class="sec-head"><h2 class="sec-title">${t('recentlyViewed')}</h2><button class="btn btn-line btn-sm" data-act="clearRecent">${t('clear')}</button></div><div class="scroller">${recent.map(card).join('')}</div></section>` : ''}
      <section class="sec wrap reveal"><h2 class="sec-title" style="margin-bottom:18px">${t('browseBody')}</h2><div class="bodies">${shapes.map(s => `<a class="body-t" href="#/cars?body=${encodeURIComponent(s.v)}"><img loading="lazy" src="${s.img}" alt=""><div><span>${esc(nm(s))}</span><small>${s.n}</small></div></a>`).join('')}</div></section>
      <section class="sec wrap reveal" style="padding-top:0"><h2 class="sec-title" style="margin-bottom:18px">${t('browseBrands')}</h2><div class="brands">${D.brands.filter(b => b.count).sort((a, b) => b.count - a.count).map(b => `<a class="brand" href="#/cars?brand=${b.id}"><div class="lg">${b.img ? `<img loading="lazy" src="${b.img}" alt="">` : ''}</div>${esc(nm(b))}<small>${t('resultCount', { n: b.count })}</small></a>`).join('')}</div></section>
      <section class="wrap reveal"><div class="tools-row">${[['/finance', 'calc', 'finance'], ['/finder', 'spark', 'finder'], ['/compare', 'cmp', 'compare'], ['/trade-in', 'swap', 'tradeIn'], ['/order', 'car', 'order']].map(([p, i, k]) => `<a class="tool-card" href="#${p}">${ic(i)}${t(k)}</a>`).join('')}</div></section>
      <section class="sec wrap reveal" style="padding-bottom:0"><h2 class="sec-title" style="margin-bottom:18px">${t('howTitle')}</h2><ol class="steps">${[1, 2, 3, 4].map(n => `<li><b>${n}</b><h3>${t('how' + n + 'T')}</h3><p>${t('how' + n)}</p></li>`).join('')}</ol></section>
      <section class="sec wrap reveal"><h2 class="sec-title" style="margin-bottom:6px">${t('whyTitle')}</h2><p style="color:var(--muted);margin-bottom:18px;max-width:800px">${t('aboutShort')}</p><div class="why">${[['cash', 'why1'], ['card', 'why2'], ['shield', 'why3'], ['pin', 'why4']].map(([i, k]) => `<div>${ic(i)}<h3>${t(k + 'T')}</h3><p>${t(k)}</p></div>`).join('')}</div></section>
      <section class="wrap reveal" style="padding-bottom:42px"><h2 class="sec-title" style="margin-bottom:18px">${t('financePartners')}</h2><div class="partners">${D.banks.map(b => `<div class="partner"><img loading="lazy" src="${b.img}" alt="">${esc(nm(b))}</div>`).join('')}</div></section>
      <section class="wrap reveal"><div class="app-band"><div><h2>${t('appTitle')}</h2><p>${t('appSub')}</p></div><div class="stores"><a href="${D.contact.appstore}" target="_blank" rel="noopener"><img src="assets/img/ui/appstore.png" alt="App Store"></a><a href="${D.contact.play}" target="_blank" rel="noopener"><img src="assets/img/ui/googleplay.png" alt="Google Play"></a></div></div></section>`;
    // Quick finder
    const qfUpd = () => { const b = $('#qfBrand').value, k = $('#qfBody').value, m = $('#qfMo').value, n = D.cars.filter(c => (!b || c.brandId == b) && (!k || c.shapeEn === k) && (!m || (c.vat && estimate(c.vat).monthly <= +m))).length, p = new URLSearchParams(); if (b) p.set('brand', b); if (k) p.set('body', k); if (m) p.set('monthly', m); const g = $('#qfGo'); g.textContent = t('showResults', { n }); g.href = '#/cars' + (p.toString() ? '?' + p : ''); };
    ['qfBrand', 'qfBody', 'qfMo'].forEach(i => $('#' + i).onchange = qfUpd); qfUpd();
    // Carousel
    const slides = $$('.slide'), dots = $$('.dot'); let cur = 0;
    const loadSlide = n => { const im = $('img', slides[(n + slides.length) % slides.length]); if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } };
    setTimeout(() => loadSlide(1), 1500);
    const go = n => { cur = (n + slides.length) % slides.length; loadSlide(cur); loadSlide(cur + 1); slides.forEach((s, i) => s.classList.toggle('on', i === cur)); dots.forEach((d, i) => d.classList.toggle('on', i === cur)); };
    const play = () => { clearInterval(sliderTimer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) sliderTimer = setInterval(() => go(cur + 1), 5500); };
    $$('[data-slide]').forEach(b => b.onclick = () => { go(cur + (+b.dataset.slide)); play(); });
    dots.forEach(d => d.onclick = () => { go(+d.dataset.dot); play(); });
    const hero = $('.hero'); hero.addEventListener('mouseenter', () => clearInterval(sliderTimer)); hero.addEventListener('mouseleave', play); play();
    let sx = null; hero.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true }); hero.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 45) { go(cur + ((d < 0 ? 1 : -1) * (S.lang === 'ar' ? -1 : 1))); play(); } });
    // Budget
    const r = $('#budget'), upd = () => { const v = +r.value, n = priced.filter(c => estimate(c.vat).monthly <= v).length; $('#budgetV').textContent = num(v); const g = $('#budgetGo'); g.textContent = t('seeMatches', { n }); g.href = `#/cars?monthly=${v}`; };
    r.oninput = upd; upd();
    // Count up
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) $$('[data-count]').forEach(el => { const n = +el.dataset.count, st = performance.now(); el.textContent = '0'; const f = now => { const k = Math.min((now - st) / 900, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1 && el.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    document.title = t('company');
  };

  Pages.cars = (_, q) => {
    const maxV = Math.max(...priced.map(c => c.vat));
    const F = { q: q.get('q') || '', brand: q.get('brand') || '', model: q.get('model') || '', body: q.get('body') || '', fuel: q.get('fuel') || '', trans: q.get('trans') || '', year: q.get('year') || '', min: q.get('min') || '', max: q.get('max') || '', monthly: q.get('monthly') || '', ids: q.get('ids') || '', priced: q.get('priced') === '1', sort: q.get('sort') || '' };
    let shown = route.back && catMem.shown ? catMem.shown : 12;
    const brandsAvail = D.brands.filter(b => b.count).sort((a, b) => nm(a).localeCompare(nm(b)));
    const years = [...new Set(D.cars.map(c => c.year))].sort((a, b) => b - a);
    $('#main').innerHTML = `<div class="wrap catalog">
      <aside class="filters" id="filters" aria-label="${t('filter')}"><div style="display:flex;justify-content:space-between;align-items:center"><h2 style="flex:1">${t('filter')}</h2><button class="icon-btn filter-x" data-act="filterClose" aria-label="${t('close')}">${ic('x')}</button></div>
        <div class="fgroup"><label for="fQ">${t('q')}</label><input class="input" id="fQ" type="search" value="${esc(F.q)}" placeholder="${t('searchPh')}"></div>
        <div class="fgroup"><label for="fBrand">${t('brand')}</label><select id="fBrand"><option value="">${t('chooseAll')}</option>${brandsAvail.map(b => `<option value="${b.id}" ${b.id == F.brand ? 'selected' : ''}>${esc(nm(b))} (${b.count})</option>`).join('')}</select></div>
        <div class="fgroup"><label for="fModel">${t('model')}</label><select id="fModel"></select></div>
        <div class="fgroup"><div class="flabel">${t('body')}</div><div class="chips" data-chips="body">${uniq('shape').map(s => `<button class="chip" data-v="${esc(s.v)}">${esc(nm(s))}</button>`).join('')}</div></div>
        <div class="fgroup"><div class="flabel">${t('fuel')}</div><div class="chips" data-chips="fuel">${uniq('fuel').map(s => `<button class="chip" data-v="${esc(s.v)}">${esc(nm(s))}</button>`).join('')}</div></div>
        <div class="fgroup"><div class="flabel">${t('transmission')}</div><div class="chips" data-chips="trans">${uniq('trans').map(s => `<button class="chip" data-v="${esc(s.v)}">${esc(nm(s))}</button>`).join('')}</div></div>
        <div class="fgroup"><div class="flabel">${t('year')}</div><div class="chips" data-chips="year">${years.map(y => `<button class="chip" data-v="${y}">${y}</button>`).join('')}</div></div>
        <div class="fgroup"><div class="flabel">${t('price')} (${t('incTax')})</div><div class="range2"><input class="input" id="fMin" type="number" min="0" step="1000" inputmode="numeric" placeholder="${t('from')}" aria-label="${t('price')} ${t('from')}" value="${esc(F.min)}"><input class="input" id="fMax" type="number" min="0" step="1000" inputmode="numeric" placeholder="${t('to')}" aria-label="${t('price')} ${t('to')}" value="${esc(F.max)}"></div><input type="range" id="fMaxR" min="30000" max="${Math.ceil(maxV / 10000) * 10000}" step="5000" value="${F.max || Math.ceil(maxV / 10000) * 10000}" aria-label="${t('price')} ${t('to')}"></div>
        <div class="fgroup"><div class="flabel">${t('monthlyBudget')}</div><div class="chips" data-chips="monthly">${[1000, 1500, 2000, 3000].map(v => `<button class="chip" data-v="${v}">${t('upTo')} ${num(v)}</button>`).join('')}</div></div>
        <label class="check"><input type="checkbox" id="fPriced" ${F.priced ? 'checked' : ''}>${t('pricedOnly')}</label>
        <div class="filter-foot"><button class="btn btn-line" data-act="filterReset">${t('reset')}</button><button class="btn btn-brand" data-act="filterClose" id="fApply"></button></div>
      </aside>
      <div><div class="toolbar"><h1>${t('allCars')} <small id="count"></small></h1><div class="tb-act"><button class="btn btn-line btn-sm filter-open" data-act="filterOpen">${ic('filter')}${t('filter')}</button><label class="hide-m" for="fSort" style="font-size:14px;font-weight:600">${t('sort')}</label><select id="fSort" aria-label="${t('sort')}">${[['', 'sortDefault'], ['low', 'sortLow'], ['high', 'sortHigh'], ['new', 'sortNew'], ['hp', 'sortHp']].map(([v, k]) => `<option value="${v}" ${v === F.sort ? 'selected' : ''}>${t(k)}</option>`).join('')}</select><button class="btn btn-line btn-sm hide-m" data-act="filterReset">${t('reset')}</button></div></div>
        <div class="active-f" id="activeF"></div><div class="grid" id="results" aria-live="polite"></div><div class="center" id="moreBox"></div><p class="note" style="margin-top:14px">≈ ${t('estNote')}</p></div></div>`;
    const drawModels = () => {
      const sel = $('#fModel'), list = F.brand ? D.cars.filter(c => c.brandId == F.brand) : [];
      const m = uniq('model', list);
      sel.disabled = !F.brand;
      sel.innerHTML = `<option value="">${F.brand ? t('chooseAll') : t('selectBrandFirst')}</option>${m.map(x => `<option value="${esc(x.v)}" ${x.v === F.model ? 'selected' : ''}>${esc(nm(x))}</option>`).join('')}`;
    };
    const matches = (over = {}) => {
      const f = { ...F, ...over };
      let r = f.q ? searchCars(f.q) : D.cars.slice();
      if (f.ids) { const set = f.ids.split(',').map(Number); r = r.filter(c => set.includes(c.id)); }
      if (f.brand) r = r.filter(c => c.brandId == f.brand);
      if (f.model) r = r.filter(c => c.modelEn === f.model);
      if (f.body) r = r.filter(c => c.shapeEn === f.body);
      if (f.fuel) r = r.filter(c => c.fuelEn === f.fuel);
      if (f.trans) r = r.filter(c => c.transEn === f.trans);
      if (f.year) r = r.filter(c => c.year == f.year);
      if (f.min) r = r.filter(c => c.vat && c.vat >= +f.min);
      if (f.max) r = r.filter(c => c.vat && c.vat <= +f.max);
      if (f.monthly) r = r.filter(c => c.vat && estimate(c.vat).monthly <= +f.monthly);
      if (f.priced) r = r.filter(c => c.vat);
      const noP = c => c.vat || Infinity;
      if (f.sort === 'low') r.sort((a, b) => noP(a) - noP(b));
      if (f.sort === 'high') r.sort((a, b) => b.vat - a.vat);
      if (f.sort === 'new') r.sort((a, b) => b.year - a.year);
      if (f.sort === 'hp') r.sort((a, b) => b.hp - a.hp);
      return r;
    };
    const syncURL = () => { const p = new URLSearchParams(); Object.entries(F).forEach(([k, v]) => { if (v) p.set(k, v === true ? '1' : v); }); const s = p.toString(); history.replaceState(null, '', '#/cars' + (s ? '?' + s : '')); };
    const draw = (reset = true) => {
      if (reset) shown = 12;
      catMem.shown = shown;
      const r = matches();
      $('#count').textContent = `(${t('resultCount', { n: r.length })})`;
      $('#fApply').textContent = t('showResults', { n: r.length });
      $('#results').innerHTML = r.length ? r.slice(0, shown).map(card).join('') : `<div class="empty" style="grid-column:1/-1">${ic('search')}<h2>${t('noMatch')}</h2><p>${t('noMatchHint')}</p><button class="btn btn-line" data-act="filterReset">${t('reset')}</button> <a class="btn btn-brand" href="#/order">${t('order')}</a></div>`;
      $('#moreBox').innerHTML = r.length > shown ? `<button class="btn btn-brand" id="moreBtn">${t('showMore')} (${r.length - shown})</button>` : '';
      const mb = $('#moreBtn'); if (mb) mb.onclick = () => { shown += 12; draw(false); };
      $$('[data-chips]').forEach(g => $$('.chip', g).forEach(ch => {
        const k = g.dataset.chips, on = F[k] == ch.dataset.v, n = matches({ [k]: ch.dataset.v }).length;
        ch.classList.toggle('on', on); ch.setAttribute('aria-pressed', on); ch.disabled = !n && !on;
        let ct = $('.ct', ch); if (!ct) { ct = document.createElement('small'); ct.className = 'ct'; ch.append(ct); } ct.textContent = n;
      }));
      const a = [];
      const lookup = (k, key) => { const u = uniq(key).find(x => x.v === F[k]); return u ? nm(u) : F[k]; };
      if (F.q) a.push(['q', `"${F.q}"`]);
      if (F.ids) a.push(['ids', t('offers')]);
      if (F.brand) { const b = D.brands.find(x => x.id == F.brand); a.push(['brand', b ? nm(b) : F.brand]); }
      if (F.model) a.push(['model', lookup('model', 'model')]);
      if (F.body) a.push(['body', lookup('body', 'shape')]);
      if (F.fuel) a.push(['fuel', lookup('fuel', 'fuel')]);
      if (F.trans) a.push(['trans', lookup('trans', 'trans')]);
      if (F.year) a.push(['year', F.year]);
      if (F.min) a.push(['min', `${t('from')} ${num(F.min)}`]);
      if (F.max) a.push(['max', `${t('to')} ${num(F.max)}`]);
      if (F.monthly) a.push(['monthly', `≤ ${num(F.monthly)} ${t('sar')} ${t('perMonth')}`]);
      $('#activeF').innerHTML = a.map(([k, l]) => `<button class="chip on" data-clear="${k}" aria-label="${t('remove')}: ${esc(l)}">${esc(l)} ×</button>`).join('');
      $$('[data-clear]').forEach(b => b.onclick = () => { const k = b.dataset.clear; F[k] = ''; if (k === 'brand') F.model = ''; applyInputs(); drawModels(); draw(); syncURL(); });
      syncURL();
    };
    const applyInputs = () => { $('#fQ').value = F.q; $('#fBrand').value = F.brand; $('#fMin').value = F.min; $('#fMax').value = F.max; $('#fPriced').checked = F.priced; $('#fSort').value = F.sort; const R = $('#fMaxR'); R.value = F.max || R.max; };
    let tm; const debounced = () => { clearTimeout(tm); tm = setTimeout(draw, 180); };
    $('#fQ').oninput = e => { F.q = e.target.value; debounced(); };
    $('#fBrand').onchange = e => { F.brand = e.target.value; F.model = ''; drawModels(); draw(); };
    $('#fModel').onchange = e => { F.model = e.target.value; draw(); };
    $('#fMin').oninput = e => { F.min = e.target.value; debounced(); };
    $('#fMax').oninput = e => { F.max = e.target.value; $('#fMaxR').value = F.max || $('#fMaxR').max; debounced(); };
    $('#fMaxR').oninput = e => { F.max = e.target.value === e.target.max ? '' : e.target.value; $('#fMax').value = F.max; debounced(); };
    $('#fPriced').onchange = e => { F.priced = e.target.checked; draw(); };
    $('#fSort').onchange = e => { F.sort = e.target.value; draw(); };
    $$('[data-chips]').forEach(g => g.addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; const k = g.dataset.chips; F[k] = F[k] == b.dataset.v ? '' : b.dataset.v; draw(); }));
    Pages.cars.reset = () => { Object.keys(F).forEach(k => F[k] = k === 'priced' ? false : ''); applyInputs(); drawModels(); draw(); };
    drawModels(); draw(false);
    document.title = `${t('cars')} | ${t('company')}`;
  };

  function calcPanel(price, prefix = 'c', carId = null) {
    return `<div class="calc" data-calc data-car="${carId || ''}">
      <div><div class="field-row"><label for="${prefix}Down">${t('downPayment')}</label><output id="${prefix}DownO"></output></div><input type="range" id="${prefix}Down" min="0" max="50" step="5" value="0"></div>
      <div><div class="field-row"><label for="${prefix}Term">${t('term')}</label><output id="${prefix}TermO"></output></div><input type="range" id="${prefix}Term" min="12" max="60" step="12" value="60"></div>
      <div><div class="field-row"><label for="${prefix}Balloon">${t('balloon')}</label><output id="${prefix}BalloonO"></output></div><input type="range" id="${prefix}Balloon" min="0" max="50" step="5" value="0"></div>
      <div><div class="field-row"><label for="${prefix}Rate">${t('rate')}</label><output id="${prefix}RateO"></output></div><input type="range" id="${prefix}Rate" min="0" max="15" step="0.25" value="${FIN.rate}"></div>
      <div class="calc-res" aria-live="polite">${t('monthly')}<b id="${prefix}M"></b><div class="calc-rows"><div><span>${t('financed')}</span><span id="${prefix}F"></span></div><div><span>${t('profit')}</span><span id="${prefix}P"></span></div><div><span>${t('total')}</span><span id="${prefix}T"></span></div></div></div>
      <p class="note">${t('calcNote')}</p></div>`;
  }
  function bindCalc(getPrice, prefix = 'c') {
    const g = id => $('#' + prefix + id);
    const upd = () => {
      const p = getPrice(), d = +g('Down').value, m = +g('Term').value, b = +g('Balloon').value, r = +g('Rate').value;
      const down = p * d / 100, ball = p * b / 100, e = estimate(p, down, m, r, ball);
      g('DownO').textContent = `${d}% · ${moneyText(down)}`; g('TermO').textContent = `${m} ${t('months')}`; g('BalloonO').textContent = `${b}% · ${moneyText(ball)}`; g('RateO').textContent = `${r}%`;
      g('M').textContent = moneyText(e.monthly); g('F').textContent = moneyText(e.financed); g('P').textContent = moneyText(e.profit); g('T').textContent = moneyText(e.total);
    };
    ['Down', 'Term', 'Balloon', 'Rate'].forEach(k => g(k).oninput = upd); upd(); return upd;
  }

  Pages.car = ([id]) => {
    const c = carById.get(+id); if (!c) return Pages.notFound();
    S.recent = [c.id, ...S.recent.filter(x => x !== c.id)].slice(0, 8); store.set('recent', S.recent);
    const hasExt = c.gallery.some(g => g.x), hasInt = c.gallery.some(g => !g.x);
    const colorsInGal = c.colors.filter(k => c.gallery.some(g => g.c === k.id));
    const G = { view: hasExt ? 'x' : 'i', color: colorsInGal[0] ? colorsInGal[0].id : null, i: 0, list: [] };
    const brand = D.brands.find(b => b.id === c.brandId);
    const related = D.cars.filter(x => x.id !== c.id).map(x => { const ps = c.vat && x.vat ? Math.abs(c.vat - x.vat) / c.vat : 1; return [x, (x.brandId === c.brandId ? 0 : .35) + (x.shapeEn === c.shapeEn ? 0 : .5) + ps]; }).sort((a, b) => a[1] - b[1]).slice(0, 8).map(a => a[0]);
    const qs = [['year', c.year], ['engineSize', `${c.engine} ${t('liter')}`], ['power', `${c.hp} ${t('hp')}`], ['transmission', L(c, 'trans')], ['fuel', L(c, 'fuel')], ['drive', L(c, 'drive')], ['body', L(c, 'shape')], ['trim', L(c, 'trim')]];
    const wa = encodeURIComponent(`${nm(c)}\n${location.href}`);
    const fav = S.fav.includes(c.id), cm = S.cmp.includes(c.id);
    $('#main').innerHTML = `<div class="wrap car-page">
      <nav class="crumbs" aria-label="breadcrumb"><a href="#/cars">${t('cars')}</a><span>/</span><a href="#/cars?brand=${c.brandId}">${esc(brand ? nm(brand) : c.brandEn)}</a><span>/</span><span>${esc(nm(c))}</span></nav>
      <div class="car-top"><div class="panel"><div class="g-wrap"><button class="g-main" id="gMain" aria-label="${t('zoomHint')}"><img id="gImg" src="${c.img}" alt="${esc(nm(c))}"><span class="g-count" id="gCount"></span></button><button class="s-arrow s-prev" id="gPrev" aria-label="${t('prev')}">${ic('chevL', 'flip')}</button><button class="s-arrow s-next" id="gNext" aria-label="${t('next')}">${ic('chevR', 'flip')}</button></div>
          <div class="g-bar">${hasExt && hasInt ? `<div class="seg" role="group"><button data-view="x">${t('exterior')}</button><button data-view="i">${t('interior')}</button></div>` : '<span></span>'}
          <div class="swatches" role="group" aria-label="${t('colors')}">${c.colors.map(k => `<button class="swatch" style="background:${esc(k.code)}" data-color="${k.id}" title="${esc(nm(k))}" aria-label="${esc(nm(k))}"></button>`).join('')}</div></div>
          <div class="thumbs" id="gThumbs"></div></div>
        <div class="panel"><h1 class="car-title">${esc(nm(c))}</h1><p class="car-sub">${esc(brand ? nm(brand) : '')} · ${esc(L(c, 'model'))} · ${esc(L(c, 'trim'))}</p>
          <div class="price-box">${priceHTML(c)}</div>
          ${c.vat ? `<p class="note" style="margin-bottom:8px">${t('monthly')}: <b style="color:var(--text)">${moneyText(estimate(c.vat).monthly)}</b> <a class="link" href="#calc">${t('calcTitle')}</a></p>` : ''}
          <div class="quick-specs">${qs.map(([k, v]) => `<div><span>${t(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
          <div class="cta-grid"><a class="btn btn-brand wide" href="#/buy/${c.id}">${t('startPurchase')}</a><a class="btn btn-dark" href="#/buy/${c.id}?pay=installment">${ic('card')}${t('funding')}</a><a class="btn btn-dark" href="#/buy/${c.id}?pay=cash">${ic('cash')}${t('buyCash')}</a><button class="btn btn-line wide" data-act="testDrive" data-car="${c.id}">${ic('cal')}${t('testDrive')}</button><a class="btn btn-wa" href="https://wa.me/${D.contact.whatsapp}?text=${wa}" target="_blank" rel="noopener">${ic('wa')}${t('whatsapp')}</a><a class="btn btn-accent" href="tel:${D.contact.phone}">${ic('phone')}${t('callSales')}</a></div>
          <div class="mini-act"><button class="btn btn-line btn-sm ${fav ? 'on-red' : ''}" data-fav="${c.id}" aria-pressed="${fav}">${ic('heart')}${t('favorites')}</button><button class="btn btn-line btn-sm ${cm ? 'on-brand' : ''}" data-cmp="${c.id}" aria-pressed="${cm}">${ic('cmp')}${t('compare')}</button><button class="btn btn-line btn-sm" data-act="share">${ic('share')}${t('share')}</button></div></div></div>
      <div class="split"><div class="panel"><h2>${t('fullSpecs')}</h2><input class="input" id="specQ" type="search" placeholder="${t('specSearch')}" aria-label="${t('specSearch')}" style="margin-bottom:6px"><div id="specs"></div></div>
        <div class="panel" id="calc"><h2>${t('calcTitle')}</h2>${c.vat ? calcPanel(c.vat, 'c', c.id) + `<a class="btn btn-brand btn-block" style="margin-top:10px" href="#/buy/${c.id}?pay=installment">${t('applyFinance')}</a>` : `<p style="color:var(--muted);margin-bottom:12px">${esc(L(c, 'priceNote') || t('onRequest'))}</p><a class="btn btn-brand btn-block" href="#/quote?car=${c.id}">${t('requestQuote')}</a>`}</div></div>
      <div class="panel" style="margin-top:24px"><h2>${t('faqs')}</h2>${[1, 2, 3].map(n => `<details class="acc"><summary>${t('carFaq' + n)}</summary><p>${t('carFaq' + n + 'A')}</p></details>`).join('')}</div>
      <section class="sec" style="padding-bottom:0"><div class="sec-head"><h2 class="sec-title">${t('relatedCars')}</h2>${scrollerNav('relS')}</div><div class="scroller" id="relS" tabindex="0">${related.map(card).join('')}</div></section></div>`;
    // Gallery
    const compute = () => {
      let l = c.gallery.filter(g => (hasExt && hasInt ? g.x === (G.view === 'x') : true));
      if (G.color) { const byC = l.filter(g => g.c === G.color); if (byC.length) l = byC; }
      if (!l.length) l = c.gallery.slice();
      G.list = l.map(g => g.u); if (!G.list.length) G.list = [c.img];
      G.i = 0; drawG();
    };
    const drawG = () => {
      $('#gImg').src = G.list[G.i]; $('#gCount').textContent = `${G.i + 1} / ${G.list.length}`;
      $('#gThumbs').innerHTML = G.list.map((u, i) => `<button class="thumb ${i === G.i ? 'on' : ''}" data-i="${i}" aria-label="${i + 1}"><img loading="lazy" src="${u}" alt=""></button>`).join('');
      $$('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === G.view));
      $$('[data-color]').forEach(b => b.classList.toggle('on', +b.dataset.color === G.color));
    };
    $('#gThumbs').onclick = e => { const b = e.target.closest('.thumb'); if (b) { G.i = +b.dataset.i; $('#gImg').src = G.list[G.i]; $('#gCount').textContent = `${G.i + 1} / ${G.list.length}`; $$('.thumb').forEach((x, i) => x.classList.toggle('on', i === G.i)); } };
    $$('[data-view]').forEach(b => b.onclick = () => { G.view = b.dataset.view; compute(); });
    $$('[data-color]').forEach(b => b.onclick = () => { G.color = +b.dataset.color; compute(); });
    $('#gMain').onclick = () => lightbox(G.list, G.i);
    const gStep = d => { G.i = (G.i + d + G.list.length) % G.list.length; drawG(); };
    $('#gPrev').onclick = () => gStep(-1); $('#gNext').onclick = () => gStep(1);
    let gx = null; const gw = $('.g-wrap');
    gw.addEventListener('touchstart', e => { gx = e.touches[0].clientX; }, { passive: true });
    gw.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - gx; if (Math.abs(d) > 45) gStep((d < 0 ? 1 : -1) * (S.lang === 'ar' ? -1 : 1)); });
    compute();
    // Specs
    const drawSpecs = q => {
      const n = normAr(q || ''); let any = false;
      const html = c.specs.map((s, i) => {
        const items = s.items.filter(x => !n || normAr(nm(x)).includes(n)); if (!items.length) return '';
        any = true;
        return `<details class="acc" ${i === 0 || n ? 'open' : ''}><summary><span>${esc(nm(s))} <small>(${items.length})</small></span></summary><ul class="spec-list">${items.map(x => `<li>${esc(nm(x))}</li>`).join('')}</ul></details>`;
      }).join('');
      $('#specs').innerHTML = any ? html : `<p style="color:var(--muted);padding:10px 2px">${t('noResults')}</p>`;
    };
    $('#specQ').oninput = e => drawSpecs(e.target.value); drawSpecs('');
    if (c.vat) bindCalc(() => c.vat);
    const bar = document.createElement('div'); bar.className = 'buybar';
    bar.innerHTML = `<div class="wrap"><div class="bb-info"><img src="${c.thumb}" alt=""><span><b>${esc(nm(c))}</b><small>${c.vat ? `${moneyText(c.vat)} · ${t('incTax')}` : esc(L(c, 'priceNote') || t('onRequest'))}</small></span></div><div class="bb-act"><a class="btn btn-wa btn-sm hide-m" href="https://wa.me/${D.contact.whatsapp}?text=${wa}" target="_blank" rel="noopener">${ic('wa')}${t('whatsapp')}</a><a class="btn btn-brand btn-sm" href="#/buy/${c.id}">${t('startPurchase')}</a></div></div>`;
    $('#main').appendChild(bar);
    new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; bar.classList.toggle('show', on); document.body.classList.toggle('has-buybar', on); }).observe($('.cta-grid'));
    document.title = `${nm(c)} | ${t('company')}`;
    setMeta(`${nm(c)} — ${c.vat ? moneyText(c.vat) + ' ' + t('incTax') : t('onRequest')}. ${t('company')}`, { '@context': 'https://schema.org', '@type': 'Car', name: c.en, brand: { '@type': 'Brand', name: c.brandEn }, modelDate: String(c.year), bodyType: c.shapeEn, fuelType: c.fuelEn, vehicleTransmission: c.transEn, offers: c.vat ? { '@type': 'Offer', price: c.vat, priceCurrency: 'SAR', availability: 'https://schema.org/InStock' } : undefined });
  };

  const docsList = () => `<ul class="spec-list">${['docId', 'docSalary', 'docBank'].map(k => `<li>${t(k)}</li>`).join('')}</ul>`;
  function testDriveModal(carId) {
    const fields = [
      { name: 'car', label: t('car'), type: 'select', options: carOpts(), value: carId, req: true, full: true },
      { name: 'name', label: t('fullName'), req: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true },
      { name: 'branch', label: t('branch'), type: 'select', options: branchOpts(), req: true, full: true },
      { name: 'date', label: t('date'), type: 'date', min: today(), req: true }, { name: 'time', label: t('time'), type: 'time', opt: true }
    ];
    openOverlay(`<div class="backdrop" data-close="1"><div class="modal" role="dialog" aria-modal="true" aria-label="${t('testDrive')}"><div class="modal-head"><h2 style="font-size:21px;font-weight:700">${t('testDrive')}</h2><button class="icon-btn" data-act="close" aria-label="${t('close')}">${ic('x')}</button></div><p class="note" style="margin-bottom:10px">${t('testDriveSub')}</p><div>${formHTML('tdForm', fields)}</div></div></div>`);
    bindForm('tdForm', fields, t('testDrive'));
  }

  Pages.finance = (_, q) => {
    const preset = carById.get(+q.get('car')) || carById.get(D.bestIds[0]);
    const opts = priced.slice().sort((a, b) => nm(a).localeCompare(nm(b)));
    $('#main').innerHTML = pageHead(t('finance'), t('calcNote')) + `<div class="wrap sec"><div class="two">
      <div class="panel"><h2>${t('calcTitle')}</h2><div class="fgroup"><label for="finCar">${t('chooseCar')}</label><select id="finCar">${opts.map(c => `<option value="${c.id}" ${c.id === preset.id ? 'selected' : ''}>${esc(nm(c))} — ${moneyText(c.vat)}</option>`).join('')}<option value="custom">${t('customPrice')}</option></select></div>
        <div class="fgroup" id="custBox" hidden><label for="finPrice">${t('carPrice')}</label><input class="input" id="finPrice" type="number" min="0" step="1000" inputmode="numeric" value="${preset.vat}"></div>
        ${calcPanel(preset.vat, 'c')}<a class="btn btn-brand btn-block" style="margin-top:10px" id="finApply">${t('applyFinance')}</a></div>
      <div class="panel"><h2>${t('affordTitle')}</h2><div class="calc"><div class="field"><label for="afS">${t('salary')} (${t('sar')})</label><input class="input" id="afS" type="number" min="0" step="500" inputmode="numeric" value="8000"></div>
        <div class="field"><label for="afO">${t('obligations')} (${t('sar')})</label><input class="input" id="afO" type="number" min="0" step="100" inputmode="numeric" value="0"></div>
        <div><div class="field-row"><label for="afD">${t('dbr')}</label><output id="afDO"></output></div><input type="range" id="afD" min="15" max="45" step="1" value="${FIN.dbr}"></div>
        <div class="calc-res" aria-live="polite">${t('maxInstallment')}<b id="afM"></b><div id="afN"></div></div><a class="btn btn-dark btn-block" id="afGo">${t('viewCars')}</a><p class="note">${t('estNote')}</p></div>
        <div class="grid" id="afList" style="margin-top:14px;grid-template-columns:minmax(0,1fr)"></div></div></div>
      <div class="panel" style="margin-top:24px"><h2>${t('docsTitle')}</h2>${docsList()}<p class="note" style="margin-top:6px">${t('docsNote')}</p></div>
      <section style="margin-top:28px"><h2 class="sec-title" style="margin-bottom:16px">${t('financePartners')}</h2><div class="partners">${D.banks.map(b => `<div class="partner"><img loading="lazy" src="${b.img}" alt="">${esc(nm(b))}</div>`).join('')}</div></section></div>`;
    let price = preset.vat, sel = preset.id;
    const upd = bindCalc(() => price);
    const applyHref = () => { $('#finApply').href = sel ? `#/buy/${sel}?pay=installment` : '#/quote?pay=installment'; };
    $('#finCar').onchange = e => { const v = e.target.value; $('#custBox').hidden = v !== 'custom'; if (v !== 'custom') { price = carById.get(+v).vat; sel = +v; $('#finPrice').value = price; } else sel = null; applyHref(); upd(); };
    $('#finPrice').oninput = e => { price = Math.max(+e.target.value || 0, 0); upd(); }; applyHref();
    const af = () => {
      const s = Math.max(+$('#afS').value || 0, 0), o = Math.max(+$('#afO').value || 0, 0), d = +$('#afD').value, m = Math.max(s * d / 100 - o, 0);
      $('#afDO').textContent = d + '%'; $('#afM').textContent = moneyText(m);
      const fit = priced.filter(c => estimate(c.vat).monthly <= m).sort((a, b) => b.vat - a.vat);
      $('#afN').textContent = t('fits', { n: fit.length }); $('#afGo').href = `#/cars?monthly=${Math.round(m)}&sort=high`;
      $('#afList').innerHTML = fit.slice(0, 2).map(card).join('');
    };
    ['afS', 'afO', 'afD'].forEach(i => $('#' + i).oninput = af); af();
    document.title = `${t('finance')} | ${t('company')}`;
  };

  Pages.finder = () => {
    const A = {}; let step = 0;
    const STEPS = [
      { k: 'use', q: 'qUse', o: [['city', 'useCity', 'car'], ['family', 'useFamily', 'family'], ['work', 'useWork', 'truck'], ['perf', 'usePerf', 'speed']] },
      { k: 'budget', q: 'qBudget', o: [['1', 'b1', 'cash'], ['2', 'b2', 'cash'], ['3', 'b3', 'cash'], ['4', 'b4', 'cash']] },
      { k: 'fuel', q: 'qFuel', o: [['Petrol', null, 'engine'], ['Diesel', null, 'engine'], ['Hybrid', null, 'spark'], ['', 'any', 'ok']] }
    ];
    const RANGES = { 1: [0, 70000], 2: [70000, 100000], 3: [100000, 150000], 4: [150000, Infinity] };
    const score = c => {
      let s = 0;
      const U = { city: ['Sedan', 'Hatchback', 'Crossover'], family: ['SUV', 'Crossover', 'Van'], work: ['Pickup', 'Van', 'Bus'], perf: ['SUV', 'Sedan', 'Pickup'] }[A.use];
      if (U.includes(c.shapeEn)) s += 4;
      if (A.use === 'perf') s += Math.min(c.hp / 80, 4);
      if (A.use === 'city' && c.engine <= 1.6) s += 1;
      const [lo, hi] = RANGES[A.budget];
      if (c.vat) { if (c.vat >= lo && c.vat <= hi) s += 5; else { const gap = c.vat < lo ? (lo - c.vat) / lo : (c.vat - hi) / hi; s -= gap * 6; } } else s -= 1;
      if (A.fuel && c.fuelEn === A.fuel) s += 3; else if (A.fuel) s -= 3;
      return s;
    };
    const draw = () => {
      const root = $('#finderBox');
      if (step >= STEPS.length) {
        const [lo, hi] = RANGES[A.budget], ranked = D.cars.map(c => [c, score(c)]).sort((a, b) => b[1] - a[1]);
        const exact = ranked.filter(([c]) => c.vat >= lo && c.vat <= hi && (!A.fuel || c.fuelEn === A.fuel));
        const top = (exact.length ? exact : ranked).slice(0, 6).map(a => a[0]);
        root.innerHTML = `<div class="sec-head"><h2 class="sec-title">${t('yourMatches')}</h2><button class="btn btn-line btn-sm" id="fRestart">${t('restart')}</button></div>${exact.length ? '' : `<p style="margin-bottom:12px;color:var(--muted)">${t('noFinder')}</p>`}<div class="grid">${top.map(card).join('')}</div>`;
        $('#fRestart').onclick = () => { step = 0; draw(); };
        root.style.maxWidth = 'none'; return;
      }
      root.style.maxWidth = '';
      const s = STEPS[step], fuelL = v => { const u = uniq('fuel').find(x => x.v === v); return u ? nm(u) : v; };
      root.innerHTML = `<div class="panel"><small style="color:var(--muted)">${t('step', { a: step + 1, b: STEPS.length })}</small><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${STEPS.length}" aria-valuenow="${step + 1}"><i style="width:${(step + 1) / STEPS.length * 100}%"></i></div><h2 style="font-size:22px">${t(s.q)}</h2><div class="opts">${s.o.map(([v, k, i]) => `<button class="opt-c" data-v="${esc(v)}">${ic(i)}${k ? t(k) : esc(fuelL(v))}</button>`).join('')}</div>${step ? `<button class="btn btn-line btn-sm" id="fBack">${t('back')}</button>` : ''}</div>`;
      $$('.opt-c', root).forEach(b => b.onclick = () => { A[s.k] = b.dataset.v; step++; draw(); $('#finderBox').scrollIntoView({ block: 'nearest' }); });
      const bk = $('#fBack'); if (bk) bk.onclick = () => { step--; draw(); };
    };
    $('#main').innerHTML = pageHead(t('finderTitle'), t('finderSub')) + `<div class="wrap sec"><div class="finder" id="finderBox"></div></div>`;
    draw(); document.title = `${t('finder')} | ${t('company')}`;
  };

  Pages.favorites = (_, q) => {
    const sharedIds = q && q.get('ids') ? q.get('ids').split(',').map(Number).filter(i => carById.has(i)) : null;
    const list = (sharedIds || S.fav).map(i => carById.get(i)).filter(Boolean);
    const bar = sharedIds ? `<div class="sec-head"><p style="font-weight:600">${t('sharedList')}</p><button class="btn btn-brand btn-sm" data-act="saveShared" data-ids="${sharedIds.join()}">${t('saveAll')}</button></div>` : list.length ? `<div class="sec-head"><span></span><button class="btn btn-line btn-sm" data-act="shareFav">${ic('share')}${t('shareList')}</button></div>` : '';
    $('#main').innerHTML = pageHead(t('favorites')) + `<div class="wrap sec">${bar}${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">${ic('heart')}<h2>${t('favEmpty')}</h2><p></p><a class="btn btn-brand" href="#/cars">${t('browseCars')}</a></div>`}</div>`;
    document.title = `${t('favorites')} | ${t('company')}`;
  };

  Pages.compare = (_, q) => {
    if (q && q.get('ids')) { S.cmp = q.get('ids').split(',').map(Number).filter(i => carById.has(i)).slice(0, 4); store.set('cmp', S.cmp); history.replaceState(null, '', '#/compare'); syncToggles(); }
    const cars = S.cmp.map(i => carById.get(i)).filter(Boolean);
    const addSel = cars.length < 4 ? `<div class="cmp-picks"><label for="cmpAdd" style="font-weight:600">${t('addCar')}</label><select id="cmpAdd" style="max-width:420px;display:block;margin-top:4px"><option value="">${t('choose')}</option>${[...D.cars].filter(c => !S.cmp.includes(c.id)).sort((a, b) => nm(a).localeCompare(nm(b))).map(c => `<option value="${c.id}">${esc(nm(c))}</option>`).join('')}</select></div>` : '';
    if (!cars.length) {
      $('#main').innerHTML = pageHead(t('compare')) + `<div class="wrap sec"><div class="empty">${ic('cmp')}<h2>${t('cmpEmpty')}</h2><p></p><a class="btn btn-brand" href="#/cars">${t('browseCars')}</a></div>${addSel}</div>`;
    } else {
      const minP = Math.min(...cars.filter(c => c.vat).map(c => c.vat)), maxH = Math.max(...cars.map(c => c.hp));
      const allSpecs = c => new Set(c.specs.flatMap(s => s.items.map(nm)));
      const specNames = [...new Set(cars.flatMap(c => [...allSpecs(c)]))];
      const rows = [
        ['price', c => c.vat ? (c.vat === minP && cars.length > 1 ? `<span class="best">${moneyText(c.vat)}<small>${t('cheapest')}</small></span>` : moneyText(c.vat)) : esc(L(c, 'priceNote') || t('onRequest')), c => c.vat],
        ['monthly', c => c.vat ? moneyText(estimate(c.vat).monthly) : '—', c => c.vat],
        ['year', c => c.year, c => c.year], ['engineSize', c => `${c.engine} ${t('liter')}`, c => c.engine],
        ['power', c => c.hp === maxH && cars.length > 1 ? `<span class="best">${c.hp} ${t('hp')}<small>${t('strongest')}</small></span>` : `${c.hp} ${t('hp')}`, c => c.hp],
        ['transmission', c => esc(L(c, 'trans')), c => c.transEn], ['fuel', c => esc(L(c, 'fuel')), c => c.fuelEn], ['drive', c => esc(L(c, 'drive')), c => c.driveEn], ['body', c => esc(L(c, 'shape')), c => c.shapeEn], ['trim', c => esc(L(c, 'trim')), c => c.trimEn],
        ['colors', c => c.colors.map(k => `<span title="${esc(nm(k))}" style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${esc(k.code)};border:1px solid #aaa;margin:1px"></span>`).join(''), c => c.colors.map(k => k.id).join()]
      ];
      const sets = cars.map(allSpecs);
      $('#main').innerHTML = pageHead(t('compare')) + `<div class="wrap sec"><div class="sec-head"><label class="check"><input type="checkbox" id="onlyDiff">${t('onlyDiff')}</label><div class="tb-act"><button class="btn btn-line btn-sm" data-act="shareCmp">${ic('share')}${t('shareList')}</button><button class="btn btn-line btn-sm" data-act="clearCmp">${t('clear')}</button></div></div>
      <div class="cmp-wrap"><table class="cmp"><thead><tr><th scope="col"></th>${cars.map(c => `<td class="rm-wrap"><button class="tool rm" data-cmp="${c.id}" aria-label="${t('remove')}: ${esc(nm(c))}">${ic('x')}</button><a href="#/car/${c.id}"><img src="${c.thumb}" alt=""><b>${esc(nm(c))}</b></a></td>`).join('')}</tr></thead><tbody>
        ${rows.map(([k, f, raw]) => { const same = new Set(cars.map(raw)).size === 1; return `<tr class="${same ? 'same' : (cars.length > 1 ? 'diff' : '')}"><th scope="row">${t(k)}</th>${cars.map(c => `<td>${f(c)}</td>`).join('')}</tr>`; }).join('')}
        ${specNames.map(n => { const has = sets.map(s => s.has(n)), same = has.every(Boolean) || has.every(x => !x); return `<tr class="${same ? 'same' : 'diff'}"><th scope="row" style="font-weight:600">${esc(n)}</th>${has.map(h => `<td>${h ? '<span style="color:#1f9d55;font-weight:800">✓</span>' : '—'}</td>`).join('')}</tr>`; }).join('')}
        <tr><th scope="row"></th>${cars.map(c => `<td><a class="btn btn-brand btn-sm" href="#/quote?car=${c.id}">${t('requestQuote')}</a></td>`).join('')}</tr>
      </tbody></table></div>${addSel}</div>`;
      $('#onlyDiff').onchange = e => $$('tr.same').forEach(r => r.style.display = e.target.checked ? 'none' : '');
    }
    const sel = $('#cmpAdd'); if (sel) sel.onchange = e => { if (e.target.value) { toggleCmp(+e.target.value); Pages.compare(); } };
    document.title = `${t('compare')} | ${t('company')}`;
  };

  Pages.offers = ([id]) => {
    if (id) {
      const o = D.offers.find(x => x.id == id); if (!o) return Pages.notFound();
      const list = (o.cars || []).map(i => carById.get(i)).filter(Boolean);
      const fields = [{ name: 'name', label: t('name'), req: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true }, { name: 'salary', label: t('monthlySalary'), type: 'number', opt: true }, { name: 'obl', label: t('monthlyObl'), type: 'number', opt: true }, { name: 'pref', label: t('preferredCar'), req: true, full: true }];
      $('#main').innerHTML = pageHead(nm(o)) + `<div class="wrap sec"><img src="${o.img}" alt="${esc(nm(o))}" style="width:100%;border-radius:var(--r);margin-bottom:24px"><div class="sec-head"><h2 class="sec-title">${t('offerCars')}</h2></div><div class="grid">${list.map(card).join('')}</div><div class="panel narrow" style="margin-top:28px"><h2>${t('offerForm')}</h2><div>${formHTML('offerForm', fields)}</div></div></div>`;
      bindForm('offerForm', fields, `${t('offers')}: ${nm(o)}`);
    } else {
      $('#main').innerHTML = pageHead(t('offers')) + `<div class="wrap sec"><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,520px),1fr))">${D.offers.map(o => `<a class="offer-card" href="#/offers/${o.id}"><img src="${o.img}" alt=""><div>${esc(nm(o))}<span class="btn btn-brand btn-sm">${t('viewOffer')}</span></div></a>`).join('')}</div></div>`;
    }
    document.title = `${t('offers')} | ${t('company')}`;
  };

  Pages.branches = () => {
    const mapSrc = b => `https://www.google.com/maps?q=${b.ll[0]},${b.ll[1]}&z=15&output=embed&hl=${S.lang}`;
    const dirs = b => `https://www.google.com/maps/dir/?api=1&destination=${b.ll[0]},${b.ll[1]}`;
    let dist = null, nearest = null, city = '', cur = D.branches[0].id;
    $('#main').innerHTML = pageHead(t('branches')) + `<div class="wrap sec"><div class="sec-head"><div class="chips" id="cityChips"><button class="chip on" data-city="">${t('allCities')}</button>${[...new Map(D.branches.map(b => [b.cityEn, b])).values()].map(b => `<button class="chip" data-city="${esc(b.cityEn)}">${esc(S.lang === 'ar' ? b.cityAr : b.cityEn)}</button>`).join('')}</div><button class="btn btn-brand btn-sm" id="nearBtn">${ic('pin')}${t('nearest')}</button></div><p class="note" id="nearMsg" role="status" style="margin-bottom:10px"></p>
      <div class="branch-layout"><div class="branch-list" id="brList"></div><div class="map-box"><iframe id="brMap" title="${t('mapTitle')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapSrc(D.branches[0])}"></iframe></div></div></div>`;
    const draw = () => {
      let l = D.branches.filter(b => !city || b.cityEn === city);
      if (dist) l = [...l].sort((a, b) => dist[a.id] - dist[b.id]);
      $('#brList').innerHTML = l.map(b => `<article class="branch ${b.id === cur ? 'on' : ''}" data-b="${b.id}"><img loading="lazy" src="${b.img}" alt=""><div class="branch-in"><h3 tabindex="0" role="button">${esc(nm(b))}${nearest === b.id ? `<span class="near-tag">${t('nearestIs')}</span>` : ''}</h3><p>${esc(S.lang === 'ar' ? b.addrAr : b.addrEn)}</p>${b.hours ? `<p>${t('hours')}</p>` : ''}${dist ? `<p><b>${num(dist[b.id])} ${t('km')}</b></p>` : ''}<div class="branch-act"><a class="btn btn-brand btn-sm" href="${dirs(b)}" target="_blank" rel="noopener">${t('directions')}</a><a class="btn btn-line btn-sm" href="tel:${b.phone}">${ic('phone')}${t('call')}</a></div></div></article>`).join('');
    };
    const pick = id => { cur = id; const b = D.branches.find(x => x.id === id); $('#brMap').src = mapSrc(b); draw(); };
    $('#brList').addEventListener('click', e => { if (e.target.closest('a')) return; const a = e.target.closest('[data-b]'); if (a) pick(+a.dataset.b); });
    $('#brList').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('h3')) { e.preventDefault(); const id = +e.target.closest('[data-b]').dataset.b; pick(id); const h = $(`[data-b="${id}"] h3`); if (h) h.focus(); } });
    $('#cityChips').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; city = c.dataset.city; $$('.chip', $('#cityChips')).forEach(x => x.classList.toggle('on', x === c)); draw(); });
    $('#nearBtn').onclick = () => {
      const msg = $('#nearMsg'); if (!navigator.geolocation) { msg.textContent = t('locErr'); return; }
      msg.textContent = t('locating');
      navigator.geolocation.getCurrentPosition(p => {
        const R = 6371, rad = x => x * Math.PI / 180, { latitude: la, longitude: lo } = p.coords; dist = {};
        D.branches.forEach(b => { const dLa = rad(b.ll[0] - la), dLo = rad(b.ll[1] - lo), h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(la)) * Math.cos(rad(b.ll[0])) * Math.sin(dLo / 2) ** 2; dist[b.id] = 2 * R * Math.asin(Math.sqrt(h)); });
        nearest = Object.entries(dist).sort((a, b) => a[1] - b[1])[0][0] * 1; msg.textContent = ''; city = ''; $$('.chip', $('#cityChips')).forEach((x, i) => x.classList.toggle('on', i === 0)); pick(nearest);
      }, () => { msg.textContent = t('locErr'); }, { timeout: 10000 });
    };
    draw(); document.title = `${t('branches')} | ${t('company')}`;
  };

  Pages.jobs = ([, sub]) => {
    const fields = [{ name: 'pos', label: t('position'), type: 'select', options: D.jobs.map(j => ({ v: nm(j), l: nm(j) })), value: nm(D.jobs[0]), req: true, full: true }, { name: 'name', label: t('fullName'), req: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true }, { name: 'email', label: t('email'), type: 'email', req: true, full: true }];
    $('#main').innerHTML = pageHead(t('careers'), t('jobSub')) + `<div class="wrap sec"><div class="narrow" style="display:grid;gap:16px">${D.jobs.map(j => `<div class="panel job"><h2>${esc(nm(j))}</h2><a class="btn btn-brand btn-sm" href="#jobForm">${t('applyNow')}</a></div>`).join('')}<div class="panel" id="jobForm"><h2>${t('applyNow')}</h2><p class="note" style="margin-bottom:10px">${t('jobCv')}</p><div>${formHTML('jForm', fields)}</div></div></div></div>`;
    bindForm('jForm', fields, t('careers')); document.title = `${t('careers')} | ${t('company')}`;
  };

  Pages.faqs = () => {
    $('#main').innerHTML = pageHead(t('faqs')) + `<div class="wrap sec"><div class="narrow"><input class="input" id="faqQ" type="search" placeholder="${t('faqSearch')}" aria-label="${t('faqSearch')}" style="margin-bottom:14px"><div class="panel" id="faqList"></div><div class="empty" style="margin-top:18px;padding:22px"><h3>${t('stillQ')}</h3><p></p><a class="btn btn-brand" href="#/contact">${t('contact')}</a></div></div></div>`;
    const draw = q => {
      const n = normAr(q || ''), l = D.faqs.filter(f => !n || normAr(f.qEn + f.aEn + f.qAr + f.aAr).includes(n));
      $('#faqList').innerHTML = l.length ? l.map((f, i) => `<details class="acc" ${i === 0 && !n ? 'open' : ''}${n ? ' open' : ''}><summary>${esc(L(f, 'q'))}</summary><p>${esc(L(f, 'a'))}</p></details>`).join('') : `<p style="color:var(--muted)">${t('noResults')}</p>`;
    };
    $('#faqQ').oninput = e => draw(e.target.value); draw('');
    document.title = `${t('faqs')} | ${t('company')}`;
  };

  Pages.about = () => {
    $('#main').innerHTML = pageHead(t('about')) + `<div class="wrap sec"><div class="panel prose"><p style="font-size:17px">${t('aboutShort')}</p></div>
      <div class="stats">${[[D.cars.length, 'statCars'], [D.brands.filter(b => b.count).length, 'statBrands'], [D.branches.length, 'statBranches'], [D.banks.length, 'statBanks']].map(([n, k]) => `<div class="stat"><b>${n}</b><span>${t(k)}</span></div>`).join('')}</div>
      <section class="sec" style="padding-bottom:10px"><h2 class="sec-title" style="margin-bottom:16px">${t('whyTitle')}</h2><div class="why">${[['cash', 'why1'], ['card', 'why2'], ['shield', 'why3'], ['pin', 'why4']].map(([i, k]) => `<div>${ic(i)}<h3>${t(k + 'T')}</h3><p>${t(k)}</p></div>`).join('')}</div></section>
      <section class="sec"><h2 class="sec-title" style="margin-bottom:16px">${t('financePartners')}</h2><div class="partners">${D.banks.map(b => `<div class="partner"><img loading="lazy" src="${b.img}" alt="">${esc(nm(b))}</div>`).join('')}</div></section></div>`;
    document.title = `${t('about')} | ${t('company')}`;
  };

  Pages.contact = () => {
    const fields = [{ name: 'name', label: t('name'), req: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true }, { name: 'email', label: t('email'), type: 'email', opt: true }, { name: 'subject', label: t('subject'), req: true }, { name: 'message', label: t('message'), type: 'textarea', req: true, full: true }];
    $('#main').innerHTML = pageHead(t('contact'), t('contactSub')) + `<div class="wrap sec"><div class="two"><div class="panel"><h2>${t('contact')}</h2><div>${formHTML('cForm', fields)}</div></div>
      <div class="panel"><h2>${t('available')}</h2><div class="contact-cards"><a class="contact-card" href="https://wa.me/${D.contact.whatsapp}" target="_blank" rel="noopener">${ic('wa')}<span>${t('whatsapp')}<small class="ltr">${D.contact.whatsappShow}</small></span></a><a class="contact-card" href="tel:${D.contact.phone}">${ic('phone')}<span>${t('call')}<small class="ltr">${D.contact.phone}</small></span></a><a class="contact-card" href="mailto:${D.contact.email}">${ic('mail')}<span>${t('email')}<small>${D.contact.email}</small></span></a><a class="contact-card" href="#/branches">${ic('pin')}<span>${t('branches')}<small>${D.branches.length}</small></span></a></div><h3 style="margin-block:14px 8px">${t('followUs')}</h3>${socials().replace('class="socials"', 'class="socials" style="display:flex"')}</div></div></div>`;
    bindForm('cForm', fields, t('contact')); document.title = `${t('contact')} | ${t('company')}`;
  };

  Pages.order = () => {
    let kind = 'ind';
    const build = () => {
      const fields = [
        ...(kind === 'co' ? [{ name: 'company', label: t('company2'), req: true }, { name: 'qty', label: t('quantity'), type: 'number', min: 1, req: true }] : [{ name: 'name', label: t('fullName'), req: true, full: true }]),
        { name: 'mobile', label: t('mobile'), type: 'tel', req: true }, { name: 'city', label: t('city'), type: 'select', options: cityOpts(), req: true },
        { name: 'brand', label: t('brand'), type: 'select', options: brandOpts(), req: true }, { name: 'model', label: t('model'), type: 'select', options: [], ph: t('selectBrandFirst'), disabled: true },
        { name: 'remarks', label: t('remarks'), type: 'textarea', opt: true, full: true }
      ];
      $('#ordBox').innerHTML = formHTML('oForm', fields);
      const f = $('#oForm');
      f.elements.brand.onchange = e => { const ms = uniq('model', D.cars.filter(c => c.brandId == e.target.value)), m = f.elements.model; m.disabled = !e.target.value; m.innerHTML = `<option value="">${e.target.value ? t('choose') : t('selectBrandFirst')}</option>` + ms.map(x => `<option value="${esc(x.v)}">${esc(nm(x))}</option>`).join(''); };
      bindForm('oForm', fields, `${t('order')} — ${t(kind === 'co' ? 'companies' : 'individuals')}`);
    };
    $('#main').innerHTML = pageHead(t('order'), t('orderSub')) + `<div class="wrap sec"><div class="panel narrow"><div class="seg" role="group" style="margin-bottom:14px"><button class="on" data-kind="ind">${t('individuals')}</button><button data-kind="co">${t('companies')}</button></div><div id="ordBox"></div></div></div>`;
    $$('[data-kind]').forEach(b => b.onclick = () => { kind = b.dataset.kind; $$('[data-kind]').forEach(x => x.classList.toggle('on', x === b)); build(); });
    build(); document.title = `${t('order')} | ${t('company')}`;
  };

  Pages.quote = (_, q) => {
    const c = carById.get(+q.get('car'));
    const fields = [{ name: 'car', label: t('car'), type: 'select', options: carOpts(), value: c ? c.id : '', req: true, full: true }, { name: 'name', label: t('fullName'), req: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true }, { name: 'city', label: t('city'), type: 'select', options: cityOpts(), req: true }, { name: 'pay', label: t('payment'), type: 'select', options: [{ v: 'cash', l: t('cash') }, { v: 'installment', l: t('installment') }], value: q.get('pay') || '', req: true }, { name: 'salary', label: t('monthlySalary'), type: 'number', opt: true }, { name: 'remarks', label: t('remarks'), opt: true }];
    $('#main').innerHTML = pageHead(t('quote'), t('quoteSub')) + `<div class="wrap sec"><div class="panel narrow">${c ? `<div class="sug" style="margin-bottom:10px;background:var(--surface-2)"><img src="${c.thumb}" alt=""><span><b>${esc(nm(c))}</b><small>${c.vat ? moneyText(c.vat) + ' · ' + t('incTax') : esc(L(c, 'priceNote') || t('onRequest'))}</small></span></div>` : ''}<div>${formHTML('qForm', fields)}</div></div></div>`;
    bindForm('qForm', fields, t('quote')); document.title = `${t('quote')} | ${t('company')}`;
  };

  Pages.blog = () => {
    const cats = ['blogAll', 'blogReviews', 'blogCompare', 'blogFinance', 'blogTips'];
    $('#main').innerHTML = pageHead(t('blog'), t('blogSub')) + `<div class="wrap sec"><div class="chips" style="margin-bottom:16px">${cats.map((k, i) => `<span class="chip ${i ? '' : 'on'}">${t(k)}</span>`).join('')}</div><div class="empty">${ic('spark')}<h2>${t('blogEmpty')}</h2><p></p><div class="tools-row" style="max-width:860px;margin:auto">${[['/finance', 'calc', 'finance'], ['/finder', 'spark', 'finder'], ['/compare', 'cmp', 'compare']].map(([p, i, k]) => `<a class="tool-card" style="background:var(--surface-2)" href="#${p}">${ic(i)}${t(k)}</a>`).join('')}</div></div></div>`;
    document.title = `${t('blog')} | ${t('company')}`;
  };

  Pages.privacy = () => {
    $('#main').innerHTML = pageHead(t('privacy'), t('privacyIntro')) + `<div class="wrap sec"><div class="panel narrow prose">${[['privacyCollectT', 'privacyCollect'], ['privacyUseT', 'privacyUse'], ['privacyHereT', 'privacyHere']].map(([a, b]) => `<h2>${t(a)}</h2><p>${t(b)}</p>`).join('')}<button class="btn btn-line" style="margin-top:8px" data-act="forgetMe">${t('forgetMe')}</button> <a class="btn btn-brand" style="margin-top:8px" href="https://rec.sa/${S.lang}/privacy-policy" target="_blank" rel="noopener">${t('privacyFull')}</a></div></div>`;
    document.title = `${t('privacy')} | ${t('company')}`;
  };

  const buyDrafts = {};
  Pages.buy = ([id], q) => {
    const c = carById.get(+id); if (!c) return Pages.notFound();
    const me = store.get('me', {});
    const A = buyDrafts[c.id] = buyDrafts[c.id] || { step: 0, pay: '', down: 0, term: 60, trade: '', tradeCar: '', branch: '', name: me.name || '', mobile: me.mobile || '', city: me.city || '', ref: '' };
    if (q.get('pay') && !A.ref) A.pay = q.get('pay');
    if (A.ref) { A.step = 0; A.ref = ''; }
    const STEPS = ['stepPay', 'stepTrade', 'stepBranch', 'stepDetails'];
    const fin = () => estimate(c.vat, c.vat * A.down / 100, A.term);
    const payL = () => A.pay === 'cash' ? t('cash') : A.pay === 'installment' ? t('installment') : '—';
    const branchObj = () => D.branches.find(b => b.id == A.branch);
    const summary = () => `<aside class="panel buy-sum"><img src="${c.thumb}" alt=""><h2 style="margin-top:10px;font-size:18px">${esc(nm(c))}</h2><div class="price-box">${priceHTML(c)}</div><dl>
        <div><dt>${t('payment')}</dt><dd>${payL()}</dd></div>
        ${A.pay === 'installment' && c.vat ? `<div><dt>${t('monthly')}</dt><dd>${moneyText(fin().monthly)}</dd></div>` : ''}
        <div><dt>${t('tradeIn')}</dt><dd>${A.trade === 'yes' ? esc(A.tradeCar) || t('yes') : A.trade === 'no' ? t('no') : '—'}</dd></div>
        <div><dt>${t('branch')}</dt><dd>${branchObj() ? esc(nm(branchObj())) : '—'}</dd></div></dl>${A.pay === 'installment' && c.vat ? `<p class="note">${t('calcNote')}</p>` : ''}<a class="link" style="font-size:14px" href="#/car/${c.id}">${t('details')}</a></aside>`;
    const stepper = () => `<ol class="stepper">${STEPS.map((k, i) => `<li class="${i < A.step ? 'done' : i === A.step ? 'on' : ''}" ${i === A.step ? 'aria-current="step"' : ''}>${i < A.step ? `<button data-go="${i}"><b>✓</b><span>${t(k)}</span></button>` : `<span class="st"><b>${i + 1}</b><span>${t(k)}</span></span>`}</li>`).join('')}</ol>`;
    const nav = (ok, label) => `<div class="buy-nav">${A.step ? `<button class="btn btn-line" data-back="1">${t('back')}</button>` : '<span></span>'}<button class="btn btn-brand" data-next="1" ${ok ? '' : 'disabled'}>${label || t('next')}</button></div>`;
    const stepHTML = () => {
      if (A.step === 0) return `<h2 tabindex="-1" id="buyH">${t('stepPayQ')}</h2><div class="opts"><button class="opt-c ${A.pay === 'cash' ? 'sel' : ''}" data-pay="cash">${ic('cash')}${t('cash')}</button><button class="opt-c ${A.pay === 'installment' ? 'sel' : ''}" data-pay="installment">${ic('card')}${t('installment')}</button></div>
        ${A.pay === 'installment' ? (c.vat ? `<div class="calc"><div><div class="field-row"><label for="bDown">${t('downPayment')}</label><output id="bDownO"></output></div><input type="range" id="bDown" min="0" max="50" step="5" value="${A.down}"></div><div><div class="field-row"><label for="bTerm">${t('term')}</label><output id="bTermO"></output></div><input type="range" id="bTerm" min="12" max="60" step="12" value="${A.term}"></div><div class="calc-res" aria-live="polite">${t('monthly')}<b id="bM"></b></div></div>` : '') + `<h3 class="buy-sub">${t('docsTitle')}</h3>${docsList()}` : ''}` + nav(!!A.pay);
      if (A.step === 1) return `<h2 tabindex="-1" id="buyH">${t('stepTradeQ')}</h2><div class="opts"><button class="opt-c ${A.trade === 'yes' ? 'sel' : ''}" data-trade="yes">${ic('swap')}${t('yes')}</button><button class="opt-c ${A.trade === 'no' ? 'sel' : ''}" data-trade="no">${ic('car')}${t('no')}</button></div>${A.trade === 'yes' ? `<div class="field"><label for="bTc">${t('tradeCarLabel')}</label><input class="input" id="bTc" value="${esc(A.tradeCar)}" placeholder="${t('tradeCarPh')}"></div><p class="note" style="margin-top:6px">${t('tradeNote')}</p>` : ''}` + nav(!!A.trade);
      if (A.step === 2) return `<h2 tabindex="-1" id="buyH">${t('stepBranchQ')}</h2><div class="buy-branches">${D.branches.map(b => `<button class="buy-branch ${A.branch == b.id ? 'sel' : ''}" data-branch="${b.id}"><img src="${b.img}" alt="" loading="lazy"><span><b>${esc(nm(b))}</b><small>${esc(S.lang === 'ar' ? b.addrAr : b.addrEn)}</small></span></button>`).join('')}</div>` + nav(!!A.branch);
      return `<h2 tabindex="-1" id="buyH">${t('stepDetailsQ')}</h2><form id="buyForm" novalidate><div class="form-grid">${buyFields().map(fieldHTML).join('')}</div><p class="note" style="margin-block:10px">${t('formHint')}</p><div class="buy-nav"><button class="btn btn-line" type="button" data-back="1">${t('back')}</button><button class="btn btn-wa" type="submit">${ic('wa')}${t('sendWa')}</button></div></form>`;
    };
    const buyFields = () => [{ name: 'name', label: t('fullName'), req: true, value: A.name, full: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true, value: A.mobile }, { name: 'city', label: t('city'), type: 'select', options: cityOpts(), req: true, value: A.city }, { name: 'remarks', label: t('remarks'), opt: true, full: true }];
    const done = url => {
      $('#main').innerHTML = pageHead(t('buyDoneT')) + `<div class="wrap sec"><div class="panel narrow form-done">${ic('ok')}<h3>${t('sent')}</h3><p>${t('refNo')}: <b class="ltr">${A.ref}</b></p><p>${t('sentSub')}</p><div class="row"><a class="btn btn-wa" href="${url}" target="_blank" rel="noopener">${ic('wa')}${t('openWa')}</a><a class="btn btn-line" href="tel:${D.contact.phone}">${ic('phone')}${t('call')}</a></div><h3 class="buy-sub" style="text-align:start">${t('whatNext')}</h3><ol class="next-list"><li>${t('next1')}</li><li>${t('next2')}</li><li>${t('next3')}</li></ol>${A.pay === 'installment' ? `<h3 class="buy-sub" style="text-align:start">${t('docsTitle')}</h3>${docsList()}` : ''}<a class="btn btn-brand" style="margin-top:12px" href="#/cars">${t('browseCars')}</a></div></div>`;
      scrollTo({ top: 0, behavior: 'instant' });
    };
    const draw = (focus = true) => {
      $('#buyBox').innerHTML = `<div class="panel">${stepper()}${stepHTML()}</div>${summary()}`;
      const box = $('#buyBox');
      $$('[data-pay]', box).forEach(b => b.onclick = () => { A.pay = b.dataset.pay; draw(false); });
      $$('[data-trade]', box).forEach(b => b.onclick = () => { A.trade = b.dataset.trade; draw(false); if (A.trade === 'yes') $('#bTc').focus(); });
      $$('[data-branch]', box).forEach(b => b.onclick = () => { A.branch = +b.dataset.branch; draw(false); });
      $$('[data-go]', box).forEach(b => b.onclick = () => { A.step = +b.dataset.go; draw(); });
      const nx = $('[data-next]', box); if (nx) nx.onclick = () => { A.step++; draw(); };
      const bk = $('[data-back]', box); if (bk) bk.onclick = () => { A.step--; draw(); };
      const tc = $('#bTc'); if (tc) tc.oninput = e => { A.tradeCar = e.target.value; };
      if ($('#bDown')) {
        const u = () => { A.down = +$('#bDown').value; A.term = +$('#bTerm').value; $('#bDownO').textContent = `${A.down}% · ${moneyText(c.vat * A.down / 100)}`; $('#bTermO').textContent = `${A.term} ${t('months')}`; $('#bM').textContent = moneyText(fin().monthly); const dd = $$('.buy-sum dd')[1]; if (dd) dd.textContent = moneyText(fin().monthly); };
        $('#bDown').oninput = u; $('#bTerm').oninput = u; u();
      }
      const form = $('#buyForm');
      if (form) {
        form.addEventListener('input', e => { if (e.target.name in A) A[e.target.name] = e.target.value; });
        form.addEventListener('submit', e => {
          e.preventDefault(); const fields = buyFields(); if (!validate(form, fields)) return;
          saveMe(form); A.ref = newRef(); track('lead', { form: 'purchase', ref: A.ref, car: c.id, pay: A.pay });
          const lines = [`*${t('startPurchase')}*`, `${t('refNo')}: ${A.ref}`, `${t('car')}: ${nm(c)}`, `${t('price')}: ${c.vat ? moneyText(c.vat) : L(c, 'priceNote') || t('onRequest')}`, `${t('payment')}: ${payL()}`];
          if (A.pay === 'installment' && c.vat) lines.push(`${t('downPayment')}: ${A.down}%`, `${t('term')}: ${A.term} ${t('months')}`, `${t('monthly')}: ${moneyText(fin().monthly)}`);
          lines.push(`${t('tradeIn')}: ${A.trade === 'yes' ? (A.tradeCar || t('yes')) : t('no')}`, `${t('branch')}: ${branchObj() ? nm(branchObj()) : ''}`, `${t('fullName')}: ${form.elements.name.value.trim()}`, `${t('mobile')}: ${form.elements.mobile.value.trim()}`, `${t('city')}: ${form.elements.city.options[form.elements.city.selectedIndex].text}`);
          if (form.elements.remarks.value.trim()) lines.push(`${t('remarks')}: ${form.elements.remarks.value.trim()}`);
          const url = `https://wa.me/${D.contact.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
          window.open(url, '_blank', 'noopener'); done(url);
        });
      }
      if (focus) { const h = $('#buyH'); if (h) h.focus({ preventScroll: true }); scrollTo({ top: 0, behavior: 'instant' }); }
    };
    $('#main').innerHTML = pageHead(t('startPurchase'), nm(c)) + `<div class="wrap sec"><div class="buy" id="buyBox"></div></div>`;
    draw(false);
    document.title = `${t('startPurchase')} | ${nm(c)}`;
  };

  Pages['trade-in'] = () => {
    const year = new Date().getFullYear();
    const fields = [{ name: 'tbrand', label: t('tradeBrand'), req: true }, { name: 'tmodel', label: t('model'), req: true }, { name: 'tyear', label: t('year'), type: 'select', options: Array.from({ length: 21 }, (_, i) => ({ v: year - i, l: year - i })), req: true }, { name: 'km', label: t('mileage'), type: 'number', min: 0, req: true }, { name: 'cond', label: t('condition'), type: 'select', options: ['condA', 'condB', 'condC'].map(k => ({ v: k, l: t(k) })), req: true }, { name: 'want', label: t('wantCar'), type: 'select', options: carOpts(), opt: true }, { name: 'name', label: t('fullName'), req: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true }, { name: 'city', label: t('city'), type: 'select', options: cityOpts(), req: true }];
    $('#main').innerHTML = pageHead(t('tradeIn'), t('tradeSub')) + `<div class="wrap sec"><ol class="steps" style="margin-bottom:24px">${[1, 2, 3].map(n => `<li><b>${n}</b><h3>${t('trade' + n + 'T')}</h3><p>${t('trade' + n)}</p></li>`).join('')}</ol><div class="panel narrow"><h2>${t('tradeForm')}</h2><div>${formHTML('tForm', fields)}</div><p class="note" style="margin-top:8px">${t('tradeNote')}</p></div></div>`;
    bindForm('tForm', fields, t('tradeIn')); document.title = `${t('tradeIn')} | ${t('company')}`;
  };

  function callbackModal() {
    const fields = [{ name: 'name', label: t('fullName'), req: true, full: true }, { name: 'mobile', label: t('mobile'), type: 'tel', req: true }, { name: 'when', label: t('bestTime'), type: 'select', options: ['timeAm', 'timePm', 'timeEve'].map(k => ({ v: k, l: t(k) })), req: true }];
    openOverlay(`<div class="backdrop" data-close="1"><div class="modal" role="dialog" aria-modal="true" aria-label="${t('callback')}"><div class="modal-head"><h2 style="font-size:21px;font-weight:700">${t('callback')}</h2><button class="icon-btn" data-act="close" aria-label="${t('close')}">${ic('x')}</button></div><div>${formHTML('cbForm', fields)}</div></div></div>`);
    bindForm('cbForm', fields, t('callback'));
  }

  Pages.notFound = () => {
    $('#main').innerHTML = `<div class="wrap sec"><div class="empty">${ic('search')}<h1 style="font-size:24px">${t('notFound')}</h1><p></p><a class="btn btn-brand" href="#/">${t('backHome')}</a></div></div>`;
    document.title = `${t('notFound')} | ${t('company')}`;
  };

  /* ---------- Actions ---------- */
  function toggleFav(id) { S.fav = S.fav.includes(id) ? S.fav.filter(x => x !== id) : [...S.fav, id]; store.set('fav', S.fav); syncToggles(); }
  function toggleCmp(id) {
    if (S.cmp.includes(id)) S.cmp = S.cmp.filter(x => x !== id);
    else { if (S.cmp.length >= 4) { toast(t('cmpMax')); return; } S.cmp = [...S.cmp, id]; }
    store.set('cmp', S.cmp); syncToggles();
  }
  async function share(url = location.href) {
    try { if (navigator.share && /^https?:/.test(url)) { await navigator.share({ title: document.title, url }); return; } } catch (e) { if (e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast(t('linkCopied')); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast(t('linkCopied')); }
  }
  document.addEventListener('click', e => {
    const hub = $('#hub'); if (hub && !hub.hidden && !e.target.closest('.hub-wrap')) { hub.hidden = true; $('[data-act=hub]').setAttribute('aria-expanded', false); }
    const qv = e.target.closest('[data-quick]'); if (qv) { e.preventDefault(); quickView(+qv.dataset.quick); return; }
    const fav = e.target.closest('[data-fav]'); if (fav) { e.preventDefault(); toggleFav(+fav.dataset.fav); if (currentRoute === 'favorites') Pages.favorites(); return; }
    const cmp = e.target.closest('[data-cmp]'); if (cmp) { e.preventDefault(); toggleCmp(+cmp.dataset.cmp); if (currentRoute === 'compare') Pages.compare(); return; }
    const sc = e.target.closest('[data-scroll]'); if (sc) { const el = $('#' + sc.dataset.scroll), rtl = S.lang === 'ar' ? -1 : 1; el.scrollBy({ left: +sc.dataset.dir * rtl * (el.clientWidth * .8), behavior: 'smooth' }); return; }
    if (e.target.dataset && e.target.dataset.close) { closeOverlay(); return; }
    const a = e.target.closest('[data-act]');
    if (a) {
      const k = a.dataset.act;
      if (k === 'lang') { S.lang = S.lang === 'ar' ? 'en' : 'ar'; store.set('lang', S.lang); renderChrome(); route(); }
      else if (k === 'theme') { S.theme = S.theme === 'dark' ? 'light' : 'dark'; store.set('theme', S.theme); renderChrome(); }
      else if (k === 'hub') { const h = $('#hub'); h.hidden = !h.hidden; a.setAttribute('aria-expanded', !h.hidden); }
      else if (k === 'callback') { $('#hub').hidden = true; callbackModal(); }
      else if (k === 'shareCmp') share(`${shareBase()}#/compare?ids=${S.cmp.join()}`);
      else if (k === 'shareFav') share(`${shareBase()}#/favorites?ids=${S.fav.join()}`);
      else if (k === 'saveShared') { S.fav = [...new Set([...S.fav, ...a.dataset.ids.split(',').map(Number)])]; store.set('fav', S.fav); updateBadges(); location.hash = '#/favorites'; }
      else if (k === 'forgetMe') { store.set('me', {}); toast(t('forgotten')); }
      else if (k === 'search') openSearch();
      else if (k === 'drawer') openDrawer();
      else if (k === 'close') closeOverlay();
      else if (k === 'top') scrollTo({ top: 0, behavior: 'smooth' });
      else if (k === 'share') share();
      else if (k === 'testDrive') testDriveModal(+a.dataset.car);
      else if (k === 'clearRecent') { S.recent = []; store.set('recent', []); Pages.home(); observe(); }
      else if (k === 'clearCmp') { S.cmp = []; store.set('cmp', []); syncToggles(); Pages.compare(); }
      else if (k === 'filterOpen') { $('#filters').classList.add('open'); document.body.style.overflow = 'hidden'; }
      else if (k === 'filterClose') { $('#filters').classList.remove('open'); document.body.style.overflow = ''; }
      else if (k === 'filterReset') { Pages.cars.reset && Pages.cars.reset(); }
      return;
    }
    const inner = e.target.closest('a[href^="#"]');
    if (inner) {
      const h = inner.getAttribute('href');
      if (!h.startsWith('#/')) { e.preventDefault(); const el = $(h); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      navClick = h !== location.hash;
      if ($('#overlay').innerHTML) closeOverlay();
    }
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
    if (e.key === 'Escape' && $('#hub') && !$('#hub').hidden) { $('#hub').hidden = true; return; }
    if (!$('#overlay').innerHTML) return;
    if (e.key === 'Escape') { closeOverlay(); return; }
    if (openOverlay.key) openOverlay.key(e);
    if (e.key === 'Tab') { const f = $$('a[href],button,input,select,textarea', $('#overlay')).filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });

  /* ---------- Router ---------- */
  let currentRoute = '', io = null, navClick = false; const scrollMem = {};
  try { history.scrollRestoration = 'manual'; } catch (e) { }
  addEventListener('scroll', () => { scrollMem[location.hash] = scrollY; }, { passive: true });
  document.addEventListener('mouseover', e => { const sub = $('.sub'); if (sub && !e.target.closest('.sub')) sub.classList.remove('no-menu'); });
  function observe() {
    if (io) io.disconnect();
    const items = $$('.reveal'); if (!('IntersectionObserver' in window)) { items.forEach(x => x.classList.add('in')); return; }
    io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -40px' });
    items.forEach(x => io.observe(x));
  }
  function route() {
    clearInterval(sliderTimer);
    const raw = location.hash.replace(/^#/, '') || '/';
    if (!raw.startsWith('/')) return;
    const [path, qs] = raw.split('?'), parts = path.split('/').filter(Boolean), name = parts[0] || 'home', q = new URLSearchParams(qs || '');
    const fn = Pages[name] && name !== 'notFound' ? Pages[name] : Pages.notFound;
    currentRoute = name;
    route.back = route.started && !navClick; navClick = false;
    const y = route.back ? scrollMem[location.hash] : 0;
    if ($('#overlay').innerHTML) closeOverlay();
    document.body.style.overflow = ''; document.body.classList.remove('has-buybar');
    setMeta(t('metaDesc'));
    fn(parts.slice(1), q);
    scrollTo({ top: y || 0, behavior: 'instant' }); markNav(); renderTray(); observe();
    const m = $('#main'); m.classList.remove('page-in'); void m.offsetWidth; m.classList.add('page-in');
    const sub = $('.sub'); if (sub && route.started && sub.matches(':hover')) sub.classList.add('no-menu');
    if (route.started) m.focus({ preventScroll: true });
    route.started = true;
  }
  addEventListener('hashchange', route);
  addEventListener('scroll', () => { const u = $('.fab-up'); if (u) u.classList.toggle('show', scrollY > 500); }, { passive: true });
  addEventListener('resize', () => document.documentElement.style.setProperty('--msearch', innerWidth <= 720 ? 'inline-flex' : 'none'));
  renderChrome(); route();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
