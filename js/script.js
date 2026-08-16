/* ═══════════════════════════════════════════════════════════════
   PITTA CORNER — interaction
   ───────────────────────────────────────────────────────────────
   Deliberately small. The previous build had parallax, tilt, a
   marquee, count-ups and a gradient mesh; a restaurant page wants
   none of that. What is left is a quiet fade-up on scroll, the menu
   filter, the mobile nav and the scroll spy.

   prefers-reduced-motion is a hard gate, not a softening.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ── Mobile navigation ── */
  const burger = $('#burger');
  const links = $('#nav-links');
  if (burger && links) {
    const set = open => {
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () => set(!links.classList.contains('is-open')));
    links.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) { set(false); burger.focus(); }
    });
  }

  /* ── Header shadow once scrolled ── */
  const nav = $('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 8);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Fade-up on scroll ── */
  const targets = $$('.reveal, .stagger');
  if (reduced.matches || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-in'));
  } else {
    targets.forEach(el => {
      if (el.classList.contains('stagger')) {
        [...el.children].forEach((c, i) => c.style.setProperty('--d', i));
      } else if (el.dataset.delay) {
        el.style.setProperty('--d', el.dataset.delay);
      }
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(el => io.observe(el));
  }

  /* ── Menu filter ──
     Wrapped in a view transition where the browser has one, so groups
     cross-fade instead of snapping. Everything else is unchanged, and a
     browser without startViewTransition takes the direct path. */
  const filter = $('#filter');
  const groups = $$('#menu-groups .mgroup');
  if (filter && groups.length) {
    filter.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const cat = chip.dataset.cat;
      filter.querySelectorAll('.chip').forEach(other => {
        const on = other === chip;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-pressed', String(on));
      });
      chip.scrollIntoView({ block: 'nearest', inline: 'center',
        behavior: reduced.matches ? 'auto' : 'smooth' });

      const apply = () => groups.forEach(g =>
        g.classList.toggle('is-hidden', cat !== 'all' && g.dataset.cat !== cat));

      if (document.startViewTransition && !reduced.matches) {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    });
  }

  /* ── Cursor-follow highlight on the primary buttons ──
     Two custom properties per button; the gradient that reads them is in
     the stylesheet, and @property makes them interpolate so the light
     trails the pointer rather than teleporting to it. Bound once per
     button on first hover, and only where there is a real cursor. */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced.matches) {
    $$('.btn-gold, .btn-primary').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.removeProperty('--mx');
        btn.style.removeProperty('--my');
      });
    });
  }

  /* ── Scroll spy ── */
  const spy = $$('.nav-links a[href^="#"]');
  const pairs = spy.map(a => ({ link: a, sec: $(a.getAttribute('href')) })).filter(p => p.sec);
  if (pairs.length && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const hit = pairs.find(p => p.sec === e.target);
        if (!hit) return;
        spy.forEach(l => l.classList.remove('is-current'));
        hit.link.classList.add('is-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    pairs.forEach(p => sio.observe(p.sec));
  }

  /* ── Menu search ──
     Name, ingredient or board number, across the whole board. Search
     overrides the category chips (all groups compete); picking a chip
     clears the search. Matching is case- and accent-insensitive. */
  const sinput = $('#menu-search');
  const sform  = $('#menu-search-form');
  const scount = $('#search-count');
  const sclear = $('#search-clear');
  const board  = $('#menu-groups');
  if (sinput && board) {
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const rows = $$('.dish, .plist > li', board).map(el => ({
      el,
      text: norm(el.textContent),
      no: (el.querySelector('.dno') || {}).textContent?.trim() || '',
    }));
    const allGroups = $$('.mgroup', board);
    const restoreChips = () => {
      const active = filter && filter.querySelector('.chip.is-active');
      const cat = (active && active.dataset.cat) || 'all';
      allGroups.forEach(g => g.classList.toggle('is-hidden', cat !== 'all' && g.dataset.cat !== cat));
    };
    const apply = raw => {
      const q = norm(raw.trim());
      sclear.hidden = !q;
      document.body.classList.toggle('is-searching', !!q);
      if (!q) {
        rows.forEach(r => r.el.classList.remove('is-off'));
        allGroups.forEach(g => g.classList.remove('is-empty'));
        scount.textContent = '';
        restoreChips();
        return;
      }
      allGroups.forEach(g => g.classList.remove('is-hidden'));
      let n = 0;
      rows.forEach(r => {
        const hit = r.text.includes(q) || r.no === q;
        r.el.classList.toggle('is-off', !hit);
        if (hit) n++;
      });
      allGroups.forEach(g =>
        g.classList.toggle('is-empty', !g.querySelector('.dish:not(.is-off), .plist > li:not(.is-off)')));
      // clamp the echo: this line lands in an aria-live region, and a
      // 500-character paste must not be read back in full
      const t = raw.trim();
      const shown = t.length > 40 ? t.slice(0, 40) + '\u2026' : t;
      scount.textContent = n
        ? `${n} ${n === 1 ? 'dish' : 'dishes'} match “${shown}”`
        : `Nothing on the board matches “${shown}” — try a simpler word`;
    };
    sinput.addEventListener('input', () => apply(sinput.value));
    sform.addEventListener('submit', e => e.preventDefault());
    sclear.addEventListener('click', () => { sinput.value = ''; apply(''); sinput.focus(); });
    sinput.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sinput.value) { e.stopPropagation(); sinput.value = ''; apply(''); }
    });
    // a chip press while searching clears the search first; capture phase so
    // this runs before the filter handler applies the chip
    if (filter) filter.addEventListener('click', e => {
      if (e.target.closest('.chip') && sinput.value) { sinput.value = ''; apply(''); }
    }, true);
  }

  /* ── Open now ──
     Computed in the restaurant's own timezone, not the visitor's: a
     reader checking from abroad still gets Wood Green's clock. Exposed
     on window.PC so the pure rule is testable without mocking time. */
  const OPEN_MIN = 8 * 60, CLOSE_MIN = 23 * 60;
  const openState = (h, m) => {
    const t = h * 60 + m;
    const open = t >= OPEN_MIN && t < CLOSE_MIN;
    return { open, label: open ? 'Open now · till 11pm' : 'Closed · opens 8am' };
  };
  window.PC = Object.assign(window.PC || {}, { openState });
  const pills = $$('[data-open-pill]');
  if (pills.length) {
    const paint = () => {
      let s;
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', hour12: false,
        }).formatToParts(new Date());
        const get = t => +parts.find(p => p.type === t).value;
        s = openState(get('hour') % 24, get('minute'));
      } catch { return; } // no tz data: leave the static hours as they are
      pills.forEach(p => {
        p.hidden = false;
        p.classList.toggle('is-open', s.open);
        p.classList.toggle('is-closed', !s.open);
        p.querySelector('b').textContent = s.label;
      });
    };
    paint();
    setInterval(paint, 60000);
  }

  /* ── Album lightbox ──
     Native <dialog>: focus trap, Escape and focus-restore come free. */
  const lb = $('#lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const lbImg = $('.lb-img', lb), lbCap = $('#lb-cap'), lbCount = $('.lb-count', lb);
    const openers = $$('.album .shot-btn');
    const data = openers.map(b => ({
      full: b.dataset.full,
      alt: (b.querySelector('img') || {}).alt || '',
    }));
    let idx = 0;
    const show = i => {
      idx = (i + data.length) % data.length;
      lbImg.src = data[idx].full;
      lbCap.textContent = data[idx].alt;
      lbCount.textContent = `${idx + 1} of ${data.length}`;
      [idx + 1, idx - 1].forEach(j => {
        const im = new Image();
        im.src = data[(j + data.length) % data.length].full;
      });
    };
    openers.forEach((b, i) => b.addEventListener('click', () => { show(i); lb.showModal(); }));
    $('.lb-prev', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-next', lb).addEventListener('click', () => show(idx + 1));
    $('.lb-close', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    // a click on the backdrop (the dialog element itself) closes
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  }

  /* ── Mobile action bar ──
     Call and Order pinned to the bottom edge once the hero has gone,
     hidden again wherever those CTAs already exist on screen. */
  const bar = $('#actionbar');
  if (bar && 'IntersectionObserver' in window) {
    let pastHero = false;
    const vis = new Map();
    const update = () =>
      bar.classList.toggle('is-showing', pastHero && ![...vis.values()].some(Boolean));
    const hero = $('.hero');
    if (hero) new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting; update();
    }).observe(hero);
    const io = new IntersectionObserver(es => {
      es.forEach(e => vis.set(e.target, e.isIntersecting)); update();
    });
    ['#order', '.footer'].forEach(sel => { const el = $(sel); if (el) io.observe(el); });
  }

  /* ── Menu book ──
     Pages are harvested from the board markup, so the menu exists once.
     Desktop: seven physical leaves turning in 3D around the spine.
     Mobile: the same page nodes, one at a time. The board stays the
     record for search, print, no-JS and assistive tech; while the book
     is showing, the board is display:none so nothing is read twice. */
  const bookWrap = $('#book-wrap');
  const bookEl = $('#book');
  if (bookWrap && bookEl && board) {
    try {
      /* harvest */
      const cats = {};
      $$('.mgroup', board).forEach(g => {
        const rows = [];
        $$('.dish', g).forEach(d => {
          const nameEl = d.querySelector('.dname');
          const tag = nameEl && nameEl.querySelector('.tag');
          const price = d.querySelector('.dprice');
          rows.push({
            no: (d.querySelector('.dno') || {}).textContent?.trim() || '',
            name: nameEl ? (tag ? nameEl.textContent.replace(tag.textContent, '') : nameEl.textContent).trim() : '',
            tag: tag ? tag.textContent.trim() : '',
            desc: (d.querySelector('.ddesc') || {}).textContent?.trim() || '',
            price: price ? price.textContent.trim() : '',
            ask: !!(price && price.classList.contains('ask')),
          });
        });
        $$('.plist > li', g).forEach(li => {
          const span = li.querySelector('span');
          const em = span && span.querySelector('em');
          const b = li.querySelector('b');
          rows.push({
            no: '', tag: '',
            name: span ? (em ? span.textContent.replace(em.textContent, '') : span.textContent).trim() : '',
            desc: em ? em.textContent.trim() : '',
            price: b ? b.textContent.trim() : '',
            ask: !!(b && b.classList.contains('ask')),
          });
        });
        cats[g.dataset.cat] = { title: (g.querySelector('.mhead h3') || {}).textContent?.trim() || '', rows };
      });
      const shareRows = [];
      $$('#specials .platter-card').forEach(c => shareRows.push({
        no: '', tag: '', ask: false,
        name: 'Mix Grill Platter — ' + c.querySelector('h3').textContent.trim(),
        price: c.querySelector('.platter-price').textContent.trim(),
        desc: [...c.querySelectorAll('li')].map(x => x.textContent.trim()).join(' · '),
      }));
      $$('#specials .burger-card').forEach(c => shareRows.push({
        no: '', tag: '', ask: false,
        name: c.querySelector('h3').textContent.trim(),
        price: [...c.querySelectorAll('.burger-prices > div')]
          .map(d => d.querySelector('span').textContent.trim() + ' ' + d.querySelector('b').textContent.trim())
          .join(' · '),
        desc: c.querySelector('p').textContent.trim(),
      }));

      /* page building */
      const el = (t, cls, txt) => {
        const n = document.createElement(t);
        if (cls) n.className = cls;
        if (txt !== undefined) n.textContent = txt;
        return n;
      };
      const mkRow = r => {
        const row = el('div', 'pg-row');
        const top = el('div', 'pg-top');
        if (r.no) top.append(el('span', 'pg-no', r.no));
        top.append(el('span', 'pg-name', r.name));
        if (r.tag) top.append(el('span', 'pg-tag', r.tag));
        top.append(el('i', 'pg-dots'));
        top.append(el('span', 'pg-price' + (r.ask ? ' pg-ask' : ''), r.price));
        row.append(top);
        if (r.desc) row.append(el('p', 'pg-desc', r.desc));
        return row;
      };
      const mkSec = (title, rows, cont) => {
        const s = el('div', 'pg-sec');
        s.append(el('h3', 'pg-h', title + (cont ? ' · continued' : '')));
        const ru = el('div', 'pg-rule'); ru.append(el('i'));
        s.append(ru);
        rows.forEach(r => s.append(mkRow(r)));
        return s;
      };
      const mkPage = cls => el('div', 'pg' + (cls ? ' ' + cls : ''));
      const badge = () => {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('class', 'pg-badge');
        s.setAttribute('aria-hidden', 'true');
        const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        u.setAttribute('href', '#i-badge');
        s.append(u);
        return s;
      };

      const cover = mkPage('pg-cover');
      cover.append(badge(), el('span', 'pg-cover-name', 'Pitta Corner'),
        el('span', 'pg-cover-sub', 'Restaurant · Coffee · Crepe'),
        el('span', 'pg-cover-menu', 'MENU'),
        el('span', 'pg-cover-est', 'Wood Green · London'));
      const titlePg = mkPage('pg-title');
      titlePg.append(badge(), el('span', 'pg-title-name', 'Pitta Corner'),
        el('span', 'pg-title-line', 'Charcoal Grill · Souvlaki · Gyros'),
        el('p', 'pg-title-copy', 'A family kitchen on the High Road — souvla and kalamakia over open coals, chips cut by hand, dips made in-house.'),
        el('p', 'pg-title-meta', '43 High Road, Wood Green, London N22 6BH\n020 8826 9594 · every day 8am – 11pm'));
      const infoPg = mkPage('pg-infoP');
      infoPg.append(el('h3', 'pg-h', 'Good to know'));
      const iru = el('div', 'pg-rule'); iru.append(el('i')); infoPg.append(iru);
      infoPg.append(
        el('p', 'pg-info-note', 'Where a price reads "ask in store", the figure on our board was recently updated by hand — we would rather tell you the current price at the counter than print one that has changed.'),
        el('p', 'pg-info-note', 'Allergies or intolerances? Please speak to a member of staff before ordering. Most dishes contain bones; the bread has contact with cooked meat; we cannot guarantee dishes are 100% free from nuts or gluten.'),
        el('p', 'pg-info-note', 'Lamb Souvla (whole lamb on the spit) is pre-order only — call ahead on 020 8826 9594.'),
        el('p', 'pg-info-note', 'Order in: Just Eat · Deliveroo · Uber Eats. Or call and collect it hot.'));
      const endPg = mkPage('pg-end');
      endPg.append(badge(), el('span', 'pg-end-script', 'Καλή όρεξη'),
        el('p', 'pg-title-copy', 'Enjoy your meal — and see you on the High Road.'));

      const faces = [
        { el: cover, label: 'Cover' },
        { el: titlePg, label: 'Welcome' },
      ];
      const P = (label, parts) => { const p = mkPage(); parts.forEach(x => p.append(x)); faces.push({ el: p, label }); };
      P('Specials · i', [mkSec(cats.specials.title, cats.specials.rows.slice(0, 5))]);
      P('Specials · ii', [mkSec(cats.specials.title, cats.specials.rows.slice(5), true)]);
      P('Fish & Salads', [mkSec(cats.fish.title, cats.fish.rows), mkSec(cats.salad.title, cats.salad.rows)]);
      P('Pita Wraps', [mkSec(cats.wraps.title, cats.wraps.rows)]);
      P('Merides', [mkSec(cats.merides.title, cats.merides.rows)]);
      P('Skewers & Skepasti', [mkSec(cats.skewers.title, cats.skewers.rows), mkSec(cats.skepasti.title, cats.skepasti.rows)]);
      P('Sides', [mkSec(cats.sides.title, cats.sides.rows)]);
      P('Dips & Sweet', [mkSec(cats.dips.title, cats.dips.rows), mkSec(cats.sweet.title, cats.sweet.rows)]);
      P('To Share', [mkSec('To Share', shareRows)]);
      faces.push({ el: infoPg, label: 'Good to know' });
      faces.push({ el: endPg, label: 'Kali orexi' });

      /* engine */
      const bkPrev = $('#bk-prev'), bkNext = $('#bk-next'), bkStatus = $('#bk-status');
      const wide = matchMedia('(min-width:760px)');
      let leaves = [], t = 0, f = 0, holder = null, swiped = false;

      const clearModes = () => { bookEl.querySelectorAll('.leaf, .mob-holder').forEach(x => x.remove()); leaves = []; holder = null; };
      const buildDesktop = () => {
        clearModes();
        const n = Math.ceil((faces.length + 1) / 2);
        for (let i = 0; i < n; i++) {
          const leaf = el('div', 'leaf');
          const fr = el('div', 'leaf-face leaf-front');
          const bk = el('div', 'leaf-face leaf-back');
          if (faces[2 * i]) fr.append(faces[2 * i].el); else fr.classList.add('pg-endcover');
          if (faces[2 * i + 1]) bk.append(faces[2 * i + 1].el); else bk.classList.add('pg-endcover');
          leaf.append(fr, bk);
          bookEl.append(leaf);
          leaves.push(leaf);
        }
      };
      const buildMobile = () => {
        clearModes();
        holder = el('div', 'mob-holder');
        holder.append(faces[f].el);
        bookEl.append(holder);
      };
      const update = moving => {
        if (wide.matches) {
          leaves.forEach((lf, i) => {
            lf.classList.toggle('is-turned', i < t);
            lf.style.zIndex = i === moving ? 60 : (i < t ? i + 1 : leaves.length - i);
            /* Only the two facing pages are real content; the rest of
               the stack is paper. Without this, every page in the pile
               is exposed at once — find-in-page matches text the eye
               cannot see and a screen reader wades through thirteen
               pages of occluded menu. The moving leaf keeps both faces
               visible for the duration of its turn. */
            const fr = lf.firstElementChild, bk = lf.lastElementChild;
            fr.style.visibility = (i === t || i === moving) ? '' : 'hidden';
            bk.style.visibility = (i === t - 1 || i === moving) ? '' : 'hidden';
          });
          bookEl.classList.toggle('is-closed', t === 0);
          bookEl.classList.toggle('is-ended', t === leaves.length);
          bkStatus.textContent =
            t === 0 ? 'Front cover — open the menu' :
            t === leaves.length ? 'Back cover' :
            [faces[2 * t - 1], faces[2 * t]].filter(Boolean).map(x => x.label).join(' · ');
          bkPrev.disabled = t === 0;
          bkNext.disabled = t === leaves.length;
        } else {
          bookEl.classList.remove('is-closed', 'is-ended');
          bkStatus.textContent = faces[f].label + ' — page ' + (f + 1) + ' of ' + faces.length;
          bkPrev.disabled = f === 0;
          bkNext.disabled = f === faces.length - 1;
        }
      };
      const mobGo = dir => {
        const nf = Math.min(faces.length - 1, Math.max(0, f + dir));
        if (nf === f) return;
        f = nf;
        if (reduced.matches) { holder.replaceChildren(faces[f].el); update(); return; }
        holder.classList.add('page-out');
        setTimeout(() => {
          holder.classList.remove('page-out');
          holder.replaceChildren(faces[f].el);
          holder.classList.add('page-in');
          setTimeout(() => holder.classList.remove('page-in'), 300);
          update();
        }, 190);
        update();
      };
      const deskGo = dir => {
        const nt = Math.min(leaves.length, Math.max(0, t + dir));
        if (nt === t) return;
        const moving = dir > 0 ? t : t - 1;
        t = nt;
        update(moving);
        const lf = leaves[moving];
        const done = () => { lf.removeEventListener('transitionend', done); update(); };
        lf.addEventListener('transitionend', done);
        setTimeout(done, 1150);
      };
      const go = dir => wide.matches ? deskGo(dir) : mobGo(dir);

      bkPrev.addEventListener('click', () => go(-1));
      bkNext.addEventListener('click', () => go(1));
      bookWrap.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      });
      let px = null;
      bookEl.addEventListener('pointerdown', e => { px = e.clientX; swiped = false; });
      addEventListener('pointerup', e => {
        if (px === null) return;
        const dx = e.clientX - px; px = null;
        if (Math.abs(dx) > 44) { swiped = true; go(dx < 0 ? 1 : -1); }
      });
      bookEl.addEventListener('click', e => {
        if (swiped) { swiped = false; return; }
        const r = bookEl.getBoundingClientRect();
        go(e.clientX > r.left + r.width / 2 ? 1 : -1);
      });

      /* view toggle */
      const viewBook = $('#view-book'), viewBoard = $('#view-board');
      const setView = v => {
        const isBook = v === 'book';
        bookWrap.hidden = !isBook;
        board.classList.toggle('is-booked', isBook);
        [[viewBook, isBook], [viewBoard, !isBook]].forEach(([b, on]) => {
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
      };
      viewBook.addEventListener('click', () => setView('book'));
      viewBoard.addEventListener('click', () => setView('board'));
      /* search and category chips work on the flat board */
      if (sinput) sinput.addEventListener('input', () => {
        if (sinput.value && !bookWrap.hidden) setView('board');
      });
      if (filter) filter.addEventListener('click', e => {
        if (e.target.closest('.chip') && !bookWrap.hidden) setView('board');
      }, true);

      const buildFor = isWide => { isWide ? buildDesktop() : buildMobile(); update(); };
      wide.addEventListener('change', e => {
        if (e.matches) t = Math.min(Math.ceil((faces.length + 1) / 2), Math.round(f / 2));
        else f = Math.min(faces.length - 1, Math.max(0, 2 * t - 1));
        buildFor(e.matches);
      });
      buildFor(wide.matches);
      setView('book');
    } catch (err) {
      /* any failure: the board stays visible, the book stays hidden */
      bookWrap.hidden = true;
      board.classList.remove('is-booked');
    }
  }

  /* ── FAQ prints open ──
     Closed <details> content does not print and CSS cannot open it, so
     the handoff happens here: open everything before printing, restore
     what was closed afterwards. */
  addEventListener('beforeprint', () => {
    $$('details.faq-item:not([open])').forEach(d => { d.dataset.printOpened = '1'; d.open = true; });
  });
  addEventListener('afterprint', () => {
    $$('details.faq-item[data-print-opened]').forEach(d => {
      d.open = false; delete d.dataset.printOpened;
    });
  });

  /* ── Footer year ── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
