# Pitta Corner — Website

A static website for **Pitta Corner**, the Greek & Cypriot grill at 43 High Road,
Wood Green, London — built to look and read like the actual shop rather than a
generic "Greek taverna" template.

## Where the design comes from

Everything here is derived from two primary sources: the **shopfront** and the
**in-store menu board**.

### The shopfront

| What's on the building | How it shows up on the site |
| --- | --- |
| Bright turquoise script sign on a dark slate fascia | `--cyan` (#25c6e0) on `--slate-deep` (#20313d) — the primary brand pair, used for the wordmark, buttons, headings and accents |
| Sub-line: *Restaurant · Coffee · Crepe / Breakfast · Lunch · Dinner* | Reproduced verbatim in the hero fascia and the footer; it's also why the site has a Drinks/coffee section and crepes on the specials row |
| Petrol-blue window frames | `--petrol` (#2c4a5a) — the map border and the story-section window |
| Window boxes overflowing with magenta, purple, yellow and orange petunias over trailing ivy | The floral band above the hero sign, generated in `js/script.js` from a seeded PRNG so it scatters organically but identically on every load. This is the shop's most distinctive feature and it drives the hero headline |
| Awnings reading *Souvlaki · Kalamaki · Grill* and *Coffee · Iced Coffee · …* | The two awning strips under the fascia |

The previous version of this site used a terracotta/olive/gold palette. That is a
common Greek-restaurant palette, but it is **not** Pitta Corner's — the real shop
is turquoise, slate and floral. That was the main thing this rework corrected.

### The menu board

The board itself is a design brief: light silver ground, cyan uppercase section
headings, `◇◇◇◇` diamond rules, numbered items with grey descriptions, and four
coloured feature boxes. All of that is reproduced:

- The `.diamonds` rule under every menu heading.
- The numbered `.dish-no` badges — you can order by number at the counter.
- The four `.sig-card` boxes in "The house specials", keeping the board's own
  colours: **black** (Greek Burger), **blue-violet** (Mix Grill Platter),
  **cyan** (Crepe of the Day), **pink** (Dessert).

### How the food is emphasised

The board repeats three phrases relentlessly — *hand cut fries*, *homemade*,
and *served with lemon, oregano, bread & cheese*. Fries go **inside** the wraps,
dips are made in-house, and skewers start at £2.50. Those became the four
pillars in "The Kitchen" section rather than invented marketing copy.

## Menu data

The full menu is transcribed from the in-store board — around 60 items across
salads, souvlaki pita wraps, skepasti, merides (portions), kalamakia (skewers),
steak, fish, sides, dips, drinks, crepes and desserts, with the board's own item
numbers preserved (including the board's jump from 36 to 47 in the fish section,
kept so in-store ordering by number still matches).

Spellings were normalised for a customer-facing page — *Kalamaki* for the board's
"Kalmaki"/"Halamaki", *Tiramisu*, *Sea Bream*, *Moretti*, *fries* for "fryers" —
but no prices, descriptions or item names were changed.

## Public listings (research summary)

- **Address:** 43 High Road, Wood Green, London N22 6BH · **Phone:** 020 8826 9594
- **Hours:** daily, 8:00 – 23:00 (some listings show an earlier 7:00 open)
- **Ratings:** 5.0 on Just Eat (900+ ratings), 4.5 on Uber Eats, 4.2 on
  Restaurant Guru (582 reviews)
- **Food hygiene:** rating 5 (Very Good), Haringey Council, 19 November 2024
- **Ordering:** Just Eat, Deliveroo, Uber Eats
- **Character:** family-run, open grill in view of the counter, generous portions,
  breakfast/coffee through to late dinner

Sources: Just Eat, Uber Eats, Deliveroo, Tripadvisor, Restaurant Guru, TastyFind,
Enjoy Wood Green and Eatible listings for Pitta Corner, Wood Green.

## Structure

```
index.html      Hero/shopfront, story, kitchen pillars, specials, full menu,
                drinks, reviews, ordering, location, Restaurant JSON-LD
css/style.css   Design tokens, layout, responsive rules
js/script.js    Mobile nav, menu category filter, seeded flower-box generator
```

No build step, no dependencies. The only external requests are Google Fonts
(Kaushan Script for the wordmark, Manrope for everything else) and the embedded
Google map.

## Running locally

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Live site: **https://vlxner.github.io/PittaCorner/**

Pages serves the site from the `main` branch, so changes on a feature branch go
live only once they're merged to `main`.

`.github/workflows/deploy-pages.yml` is a leftover Actions-based deploy pinned to
an older branch (`claude/pitts-corner-website-ddxwpr`), because the `github-pages`
environment's deployment branch policy was set to whatever branch was default when
Pages was first enabled. It does not run for other branches. To move deploys onto
Actions from `main`, add `main` under **Settings → Environments → github-pages →
Deployment branches** and change the workflow's `on.push.branches` to `[main]`.

## Note

This is an unofficial, informational website. It is not affiliated with or
endorsed by Pitta Corner. Menu items and prices are transcribed from the in-store
board and public listings and may not reflect current offerings — always confirm
with the restaurant or its delivery platform listings, and ask about allergens
directly.
