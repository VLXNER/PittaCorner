# Pitta Corner — Website

A static website for **Pitta Corner**, the Greek and Cypriot grill at 43 High
Road, Wood Green, London N22 6BH — built from the restaurant's own printed
menus and its own photographs rather than a generic taverna template.

Live: **https://vlxner.github.io/PittaCorner/**

```
index.html      The whole page: SVG sprite, hero, story, pillars, charcoal
                band, how-it's-made sequence, platters, signature showcase,
                full menu board with search, breakfast, drinks, ticker,
                reviews, order, FAQ, album with lightbox, visit, allergens,
                footer, Restaurant + Menu + FAQPage JSON-LD
css/style.css   Tokens, layout, motion, print sheet, high-contrast sheet
js/script.js    Mobile nav, menu filter + search, lightbox, action bar,
                open-now clock, scroll spy, reveal observer — every
                scroll-driven effect on the page is still CSS
fonts/          Manrope, Playfair Display, Kaushan Script (self-hosted)
photos/         The restaurant's own photographs (+ generated WebP tiers)
logos/          Just Eat, Deliveroo, Uber Eats marks
icons/          PWA icons rendered from the badge
docs/           Full transcription of the 2026 in-store menu
404.html        Self-contained (Pages serves it for any missing path, so
                relative links would break — everything is inline)
```

No build step, no dependencies, no package.json. Run it with
`python3 -m http.server 8000`.

## Capabilities

- **Menu search** — name, ingredient or board number, accent-insensitive,
  with a live match count. Search overrides the category chips; choosing a
  chip clears the search.
- **Album lightbox** — native `<dialog>` (focus trap, Escape and
  focus-restore come free), arrow keys, wraparound, preloaded neighbours.
  The viewer image has no `src` until first opened.
- **Mobile action bar** — Call / Order pinned to the thumb once the hero
  scrolls away, hidden again wherever those CTAs already exist on screen.
- **Live open state** — "Open now · till 11pm" pills computed in
  Europe/London regardless of the visitor's clock, repainted every minute,
  hidden entirely unless JS can confirm the time.
- **FAQ** — six answers drawn only from facts already on the board, with
  matching FAQPage JSON-LD; `beforeprint` opens every entry so the answers
  actually print.
- **Back-to-top** — desktop, scroll-driven reveal with the page's reading
  progress drawn as a conic ring; no scroll listener.
- **WebP delivery** — 26 generated tiers behind `<picture>`/`image-set()`;
  measured at 1440px and 390px, the browser fetches zero JPEGs.
- **Structured data** — the Restaurant block carries `hasMenu` with all 14
  sections / 107 items (prices only where legible, diet markers from the
  board's own tags), plus FAQPage.
- **Installable** — web manifest + icons; also `404.html`, `robots.txt`,
  `sitemap.xml`, and `prefers-reduced-data` support.

## Where the design comes from

**The printed menus, not the shopfront sign.** The building carries a turquoise
script sign, but the menus the restaurant actually hands you are **royal blue,
gold and cream**, with a circular fork-and-knife badge and the strapline
*Restaurant · Coffee · Crepe*. That is the identity the site uses. An earlier
version of this site was built on the shopfront turquoise; it looked like a
different business.

| Source | On the site |
| --- | --- |
| Royal blue menu card | `--blue-900` `#0f2a5c` — panels, the hours card, the footer |
| Gold foil badge and headings | `--gold-700` … `--gold-100` — rules, prices, numerals, the focus glow |
| Cream menu paper | `--cream-50` … `--cream-300` — the page ground |
| The circular fork-and-knife badge | Redrawn as `#i-badge`, in the header, hero and footer |
| Numbered board items | `.dno` numerals, so you can still order by number at the counter |
| *hand cut · homemade · lemon, oregano, bread* | The four pillars and the five-step sequence — the board's own words, not invented marketing |

Type is **Playfair Display** for headings and prices, **Manrope** for text, and
**Kaushan Script** for the wordmark only. All three are self-hosted — the
variable faces are 24KB and 38KB, the script is subset to the wordmark's own
characters at 16KB. Nothing is fetched from Google.

## Menu data

Transcribed from the 2026 in-store board (`docs/menu-2026.md`), with the board's
own item numbers preserved. Spellings were normalised for a customer-facing page
— *Kalamaki* for the board's "Kalmaki", *Sea Bream*, *Caesar*, *fries* for
"fryers" — but **no price, description or item name was changed**.

About fifteen prices on the board have been overwritten by hand and cannot be
read from the photographs. Those publish as **"Ask in store"** rather than a
guess, with a note in the menu explaining why. `docs/menu-2026.md` marks every
one of them with ⚠️. To fill them in, get clear photographs of the Souvlaki Pita
Wrap column, the Merides column, and the wine list.

## Motion

Every scroll-linked effect is a native CSS scroll-driven animation —
`animation-timeline: view()` or `scroll(root block)`. There is no scroll
listener anywhere in the JavaScript. That matters on a phone: these run on the
compositor and track the finger, where a JS handler would stutter.

- Hero photograph drift, and the headline lifting away as it leaves
- Reading progress on the header's bottom edge
- Section headings unveiling from under a clip, gold rules drawing themselves in
- The five-step **how it's made** panel, pinned while its cards run sideways
- Embers off the charcoal band, salt falling onto the signature plate
- Per-column parallax in the album, drifting photo backdrops, floating dishes
- A ticker of the shop's dish names that advances only when the reader scrolls

`prefers-reduced-motion: reduce` is a hard gate, not a softening — every block
above sits inside `@media (prefers-reduced-motion: no-preference)`, and the
reduced state is a real layout rather than a degraded one. The pinned sequence,
for instance, becomes a plain responsive grid, so there is no horizontal scroll
region a keyboard cannot reach.

### Two things that bite when writing these

**A view timeline measures the element's own visibility.** A 3px salt grain or a
1px gold rule has almost no view range, so on `animation-timeline: view()` it
completes the instant it appears and is never seen. Name a timeline on the
container (`view-timeline-name: --stage`) and have the small parts ride that.

**`animation-delay` is ignored against a scroll timeline.** Stagger by shifting
each element's `animation-range` instead — that is what the `--d` custom
property does on the grains, the embers and the step cards.

## Accessibility

- One `h1`, no heading-level skips, landmarks on every region, working skip link
- **Two-tone focus ring**: near-black outline plus a gold glow. No single colour
  clears 3:1 against both cream paper and navy panels, so there are two — cream
  and gold on the dark sections. Declared last in the stylesheet, and kept out
  of every component's `transition` list, or it fades in over ~170ms and reads
  as absent to anyone tabbing quickly.
- All icons are SVG. No emoji is ever used as an icon.
- Decorative artwork — floaters, embers, glyphs, the ticker — is `aria-hidden`.
- `prefers-contrast: more` darkens the secondary greys, heavies the photo
  scrims, and turns the dotted menu leaders solid.
- Every external link carries a visually-hidden "(opens in a new tab)".

### Measuring contrast

Walking the DOM for background colours gives the wrong answer as soon as a
section is a photograph under a gradient scrim: the ancestor's declared colour
is not what is behind the glyph. The auditor screenshots the page with every
glyph hidden and samples the real pixels underneath — a grid of points across
each run's **text-node rects**, keeping the worst. Text-node rects, not element
boxes: an element box spans its children, so a `<span class="tag">` pill inside
a dish name was being read as that name's backdrop.

Current: **550 text runs, 0 failures**, at 4.5:1 for body text and 3:1 for large.

## Print

People print restaurant menus. `@media print` gives you the board: address,
phone and hours ruled off at the top, every category expanded regardless of
which filter chip was pressed, two columns of dishes, prices intact, no dish
split across a page break, and none of the screen furniture.

It opens with a single colour reset rather than selective overrides, because
component rules kept winning — `.footer-cols p` sets a pale blue that prints as
nothing at all. It also forces `.reveal` / `.stagger` elements visible, since
those sit at `opacity: 0` until an IntersectionObserver fires, and anything the
reader had not scrolled past would otherwise print blank.

## Bugs worth not reintroducing

**`url()` in a custom property resolves against the stylesheet that substitutes
it, not the one that declares it.** Writing `--bg-img: url(photos/grill.jpg)` on
an element in `index.html` and consuming it as `background-image: var(--bg-img)`
in `css/style.css` makes the browser fetch `css/photos/grill.jpg`. All three
photo-backed sections 404'd silently and rendered as flat navy panels for weeks.
File names live in classes in the stylesheet now; only numbers (`--scrim`,
`--bg-bright`) come in as inline vars.

**`:has()` takes the specificity of its argument.** `.mgroup:has(> .dish-photo)`
and `.mgroup.is-hidden` are both `(0,2,0)`, so source order alone decided which
won — and the `:has()` spread came later, which meant the menu category filter
stopped hiding any photo-led group. Selecting *Fish* showed six categories. The
hide rule carries the id now (`#menu-groups .mgroup.is-hidden`).

**Centre-justified flex content in an overflow scroller clips its leading items**
with no way to scroll to them — `scrollLeft` cannot go negative. Once the search
box sat beside the chips, the row always overflowed and the *All* chip became
unclickable. `justify-content:flex-start` on anything that scrolls.

**An author `display` beats the `[hidden]` attribute.** `#search-clear` got
`display:grid` for centring and quietly became always-visible; the CSS restates
`#search-clear[hidden]{display:none}`.

**A registered custom property with `inherits:false` never reaches a pseudo.**
The back-to-top progress ring paints on `::before`, so animating `--p` on the
button did nothing — the animation has to live on the `::before` itself.

**An anchor to a sticky element scrolls nowhere.** The header carried
`id="top"`, and a sticky header is by definition already at the viewport top,
so `href="#top"` had nothing to do. With no element named `top`, the HTML spec
falls back to scrolling to the document start — so the id is gone.

## Design skills (`.claude/skills/`)

The repo vendors the **UI/UX Pro Max** bundle
([nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill),
MIT, v2.13.0) so Claude Code sessions here have design guidance without
reinstalling: `ui-ux-pro-max`, `ui-styling`, `design-system`, `design`, `brand`,
`banner-design`, `slides`. The search tool is plain Python 3, no third-party
dependencies, no network calls:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "restaurant menu" --design-system
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "contrast focus ring" --domain ux
```

Two local adjustments to upstream: `ui-ux-pro-max/SKILL.md` had its
`${CLAUDE_PLUGIN_ROOT}` script paths rewritten to repo-relative paths (upstream
assumes a plugin install; this is a vendored project skill), and the surrounding
note updated to match. To update, re-copy `.claude/skills/` and redo those two
edits — or install upstream properly with
`/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` and drop this copy.

Note that Pages serves the repository root, so these files are publicly fetchable
under the site URL. They are MIT-licensed public data, but they add ~11 MB to
each deploy.

## Deployment

Pages serves the site from the `main` branch root, so work on a feature branch
goes live only once merged.

`.github/workflows/deploy-pages.yml` is a leftover Actions deploy pinned to an
older branch, because the `github-pages` environment's deployment branch policy
was set to whatever branch was default when Pages was first enabled. It does not
run for other branches. To move deploys onto Actions from `main`, add `main`
under **Settings → Environments → github-pages → Deployment branches** and
change the workflow's `on.push.branches` to `[main]`.

### Never commit credentials here

Pages serves the repository root **verbatim**, dotfiles included (`.nojekyll`
disables Jekyll's usual filtering). Anything committed is publicly fetchable
under the site URL — `secret.json` in the root is
`…github.io/PittaCorner/secret.json`.

The realistic way that happens is tooling writing config into the repo. In
particular, `claude mcp add --scope project` writes `.mcp.json` to the repo root
with any `--header` values inline, API keys and all. Use the default `local`
scope or `--scope user` so it lands in `~/.claude.json` instead. `.gitignore`
covers `.mcp.json`, `.claude.json`, `.env*` and `*.pem` as a backstop, but that
only helps for untracked files — it will not un-publish something already
committed. If a key does reach a commit here, treat it as public and rotate it.

## Known gaps

- **~15 prices** still read "Ask in store" — see *Menu data* above.
- **"PITA" or "PITTA"?** The printed logo reads *PITA Corner* with one T; the
  shopfront sign reads *Pitta Corner* with two. The site uses two throughout.
  Worth settling with the printer.
- **The Uber Eats mark** in `logos/` is an icons8 rendition, not the official
  partner asset. Swap it for the real one from Uber's brand resources.
- **No 360° turntable** on the signature plate. It would need roughly thirty
  rotation frames of one dish on a turntable; the current set piece is what a
  single photograph can honestly do.

## Note

This is an unofficial, informational website. It is not affiliated with or
endorsed by Pitta Corner. Menu items and prices are transcribed from the
in-store board and public listings and may not reflect current offerings —
always confirm with the restaurant or its delivery platform listings, and ask
about allergens directly.
