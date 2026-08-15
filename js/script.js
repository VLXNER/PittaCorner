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
      const shown = raw.trim();
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
