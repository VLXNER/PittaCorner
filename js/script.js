/* ═══════════════════════════════════════════════════════════════
   PITTA CORNER — interaction + motion
   ───────────────────────────────────────────────────────────────
   The ui-ux-pro-max motion presets are written as GSAP snippets, but
   pulling GSAP from a CDN would undo the work of self-hosting the
   fonts: another third party on the critical path, for effects that
   IntersectionObserver and CSS transitions already do. The presets'
   numbers are kept — stagger y 16 / scale .92, ~60ms between items,
   400–700ms with expo.out easing, parallax held to a small delta on
   decorative layers only.

   prefers-reduced-motion is a hard gate, not a softening: when it is
   set, nothing here animates and every element is placed in its final
   state on load.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = () => reduced.matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ─────────── Mobile navigation ─────────── */
  const burger = $('#burger');
  const navLinks = $('#nav-links');

  if (burger && navLinks) {
    const setNav = open => {
      navLinks.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', () =>
      setNav(!navLinks.classList.contains('is-open')));
    navLinks.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        setNav(false);
        burger.focus();
      }
    });
  }

  /* ─────────── Header state on scroll ─────────── */
  const nav = $('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 20);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────── Scroll reveals ───────────
     One observer for the whole page. Children of .stagger inherit an
     index so each lands ~90ms after the one before it. */
  const revealTargets = $$('.reveal, .reveal-scale, .stagger');

  if (prefersReduced()) {
    revealTargets.forEach(el => el.classList.add('is-in'));
  } else if ('IntersectionObserver' in window) {
    revealTargets.forEach(el => {
      if (el.classList.contains('stagger')) {
        [...el.children].forEach((child, i) => child.style.setProperty('--d', i));
      } else if (el.dataset.delay) {
        el.style.setProperty('--d', el.dataset.delay);
      }
    });

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);     // reveal once, then stop watching
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-in'));
  }

  /* ─────────── Hero headline ───────────
     Word-level, not character-level: the skill caps split-text at short
     headlines and warns about DOM size, and whole words stay selectable. */
  const heroWords = $$('.hero-title .word');
  if (heroWords.length && !prefersReduced()) {
    heroWords.forEach((w, i) => { w.style.transitionDelay = `${120 + i * 70}ms`; });
  }
  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  /* ─────────── Parallax on decorative layers only ───────────
     Never text, never controls — the preset is explicit about that. */
  const layers = $$('[data-parallax]');
  if (layers.length && !prefersReduced()) {
    let ticking = false;
    const frame = () => {
      const vh = innerHeight;
      layers.forEach(layer => {
        const rect = layer.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;   // -1 … 1
        const shift = progress * Number(layer.dataset.parallax || 0);
        layer.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }, { passive: true });
    frame();
  }

  /* ─────────── Count-up on the rating figures ─────────── */
  const counters = $$('.count');
  if (counters.length) {
    const render = (el, value) => {
      const dp = Number(el.dataset.decimals || 0);
      el.textContent = (el.dataset.prefix || '') + value.toFixed(dp);
    };
    if (prefersReduced() || !('IntersectionObserver' in window)) {
      counters.forEach(el => render(el, Number(el.dataset.count)));
    } else {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.count);
          const start = performance.now();
          const dur = 1100;
          const step = now => {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);       // expo-ish out
            render(el, target * eased);
            if (t < 1) requestAnimationFrame(step);
            else render(el, target);
          };
          requestAnimationFrame(step);
          obs.unobserve(el);
        });
      }, { threshold: 0.6 });
      counters.forEach(el => cio.observe(el));
    }
  }

  /* ─────────── Pointer tilt on glass cards ───────────
     Small angles only; skipped for coarse pointers and reduced motion. */
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !prefersReduced()) {
    $$('[data-tilt]').forEach(card => {
      let raf = null;
      const move = e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) ` +
            `rotateY(${(px * 5).toFixed(2)}deg) translateY(-4px)`;
          raf = null;
        });
      };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', () => {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.style.transform = '';
      });
    });
  }

  /* ─────────── Menu filter ─────────── */
  const filter = $('#filter');
  const pill = $('#filter-pill');
  const groups = $$('#menu-groups .mgroup');

  if (filter && groups.length) {
    const movePill = chip => {
      if (!pill) return;
      pill.style.width = `${chip.offsetWidth}px`;
      pill.style.transform = `translateX(${chip.offsetLeft - 7}px)`;
    };

    const activeChip = () => filter.querySelector('.chip.is-active') || filter.querySelector('.chip');
    requestAnimationFrame(() => movePill(activeChip()));
    addEventListener('resize', () => movePill(activeChip()));

    filter.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const cat = chip.dataset.cat;

      filter.querySelectorAll('.chip').forEach(other => {
        const on = other === chip;
        other.classList.toggle('is-active', on);
        other.setAttribute('aria-pressed', String(on));
      });
      movePill(chip);
      chip.scrollIntoView({ block: 'nearest', inline: 'center',
                            behavior: prefersReduced() ? 'auto' : 'smooth' });

      groups.forEach(group => {
        group.classList.toggle('is-hidden', cat !== 'all' && group.dataset.cat !== cat);
      });
    });
  }

  /* ─────────── Scroll spy ─────────── */
  const spyLinks = $$('.nav-links a[href^="#"]');
  const sections = spyLinks
    .map(a => ({ link: a, section: $(a.getAttribute('href')) }))
    .filter(x => x.section);

  if (sections.length && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const match = sections.find(s => s.section === entry.target);
        if (!match) return;
        if (entry.isIntersecting) {
          spyLinks.forEach(l => l.classList.remove('is-current'));
          match.link.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => sio.observe(s.section));
  }

  /* ─────────── The window box above the sign ───────────
     Seeded so the arrangement is identical on every load and deploy. */
  const petals = [
    '#ec3f8c', '#ff5fae', '#d81b74',
    '#8b5cf6', '#a78bfa', '#6d28d9',
    '#ffc233', '#ffd85e',
    '#ff7a2f'
  ];
  const greens = ['#3c8330', '#255a1e', '#4f9d3f', '#1c4a17'];

  const plant = (el, leafCount, bloomCount, scale) => {
    if (!el) return;
    let seed = 0x43484f52;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pick = list => list[Math.floor(rand() * list.length)];
    const frag = document.createDocumentFragment();

    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement('span');
      const w = (11 + rand() * 17) * scale;
      leaf.className = 'bloom-leaf';
      leaf.style.cssText =
        `left:${(rand() * 102 - 1).toFixed(2)}%;top:${(rand() * 110 - 5).toFixed(2)}%;` +
        `width:${w.toFixed(1)}px;height:${(w * (0.5 + rand() * 0.3)).toFixed(1)}px;` +
        `background:${pick(greens)};transform:rotate(${(rand() * 180 - 90).toFixed(1)}deg);` +
        `opacity:${(0.65 + rand() * 0.35).toFixed(2)};`;
      frag.appendChild(leaf);
    }
    for (let i = 0; i < bloomCount; i++) {
      const bloom = document.createElement('span');
      const size = (8 + rand() * 9) * scale;
      bloom.className = 'bloom';
      bloom.style.cssText =
        `left:${(rand() * 102 - 1).toFixed(2)}%;top:${(rand() * 94 + 3).toFixed(2)}%;` +
        `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
        `background:radial-gradient(circle at 50% 50%,rgba(255,250,235,.9) 0 14%,${pick(petals)} 32%);` +
        `box-shadow:0 1px 3px rgba(0,0,0,.4);`;
      frag.appendChild(bloom);
    }
    el.appendChild(frag);
  };

  plant($('#bloom-band'), 110, 180, 1);
  plant($('#planter'), 26, 42, 0.8);

  /* ─────────── Footer year ─────────── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
