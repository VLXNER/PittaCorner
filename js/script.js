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

  /* ── Footer year ── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
