document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile navigation ---- */
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ---- Menu category filter ---- */
  const filter = document.getElementById('menu-filter');
  const groups = document.querySelectorAll('#menu-groups .menu-group');

  if (filter && groups.length) {
    filter.addEventListener('click', event => {
      const chip = event.target.closest('.chip');
      if (!chip) return;

      const cat = chip.dataset.cat;

      filter.querySelectorAll('.chip').forEach(other => {
        const active = other === chip;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });

      groups.forEach(group => {
        group.classList.toggle('is-hidden', cat !== 'all' && group.dataset.cat !== cat);
      });
    });
  }

  /* ---- The window box above the sign ----
     The real shopfront is crowned by trailing petunias, so the band gets
     hand-scattered blossoms rather than a tiling pattern. Seeded PRNG keeps
     the arrangement identical on every load (and between deploys). ---- */
  const petals = [
    '#ec3f8c', '#ff5fae', '#d81b74',   // magenta petunias
    '#7a45c8', '#9b5ce0', '#5f34a8',   // violets
    '#ffc233', '#ffd85e',              // marigold
    '#ff7a2f'                          // orange
  ];
  const leafGreens = ['#3c8330', '#2f6b26', '#4f9d3f', '#255a1e'];

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

    // Foliage first, so blossoms sit on top of it.
    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement('span');
      const w = (11 + rand() * 17) * scale;
      leaf.className = 'bloom-leaf';
      leaf.style.cssText =
        `left:${(rand() * 102 - 1).toFixed(2)}%;top:${(rand() * 110 - 5).toFixed(2)}%;` +
        `width:${w.toFixed(1)}px;height:${(w * (0.5 + rand() * 0.3)).toFixed(1)}px;` +
        `background:${pick(leafGreens)};transform:rotate(${(rand() * 180 - 90).toFixed(1)}deg);` +
        `opacity:${(0.65 + rand() * 0.35).toFixed(2)};`;
      frag.appendChild(leaf);
    }

    for (let i = 0; i < bloomCount; i++) {
      const bloom = document.createElement('span');
      const size = (8 + rand() * 9) * scale;
      const colour = pick(petals);
      bloom.className = 'bloom';
      bloom.style.cssText =
        `left:${(rand() * 102 - 1).toFixed(2)}%;top:${(rand() * 94 + 3).toFixed(2)}%;` +
        `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
        `background:radial-gradient(circle at 50% 50%, rgba(255,250,235,.9) 0 14%, ${colour} 32%);` +
        `box-shadow:0 1px 3px rgba(0,0,0,.35);`;
      frag.appendChild(bloom);
    }

    el.appendChild(frag);
  };

  plant(document.getElementById('bloom-band'), 105, 175, 1);
  plant(document.getElementById('planter'), 26, 42, 0.8);

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
