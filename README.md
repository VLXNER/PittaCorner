# Pitta Corner — Website

A static website for **Pitta Corner**, a Greek & Cypriot grill/takeaway on the High Road
in Wood Green, London, built to reflect the identity of the actual restaurant.

## About the real restaurant (research summary)

- **What it is:** A family-run Greek & Cypriot grill/fast-food restaurant, offering
  dine-in and takeaway, breakfast through late dinner.
- **Address:** 43 High Road, Wood Green, London N22 6BH
- **Phone:** 020 8826 9594
- **Hours:** Daily, 8:00am – 11:00pm
- **Signature items:** Pork/chicken gyros wraps, chicken/pork/lamb souvlaki skewers,
  kebab boxes, mixed grill and seafood platters, halloumi pitta, falafel wraps,
  handmade chips.
- **Known prices** (from public delivery listings): Pork/Chicken Gyros Wrap £6.00,
  Chicken/Pork Souvlaki £6.50, Lamb Souvlaki £7.00, Chicken/Pork Kebab (2 skewers) £9.00,
  Lamb Kebab (2 skewers) £11.00.
- **Identity:** An open kitchen where food is grilled in view of customers, generous
  portions, and a warm, casual, fast-service atmosphere — praised in reviews for
  authenticity and portion size.
- **Ordering:** Listed on Just Eat, Deliveroo, and Uber Eats for delivery/collection.

Sources: Just Eat, Deliveroo, Uber Eats, Enjoy Wood Green, Tripadvisor, TastyFind,
Sluurpy and Google Search listings for Pitta Corner, Wood Green.

## This website

Built to carry the same identity as the restaurant itself: a bold, warm, Greek-taverna
palette (terracotta, olive, gold, cream), an open-kitchen/grill visual motif, and a
menu-first, fast-food-style layout.

Structure:

```
index.html      Markup — hero, story, menu, gallery, reviews, ordering, location
css/style.css   Styling — design tokens, layout, responsive rules
js/script.js    Mobile nav toggle + footer year
```

## Running locally

No build step — open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

The site is published with GitHub Pages served straight from the `main` branch
(**Settings → Pages → Source: Deploy from a branch → `main` → `/` (root)**).
There is no build step and no deploy workflow — the files in the repository root
are the site, so every push to `main` republishes it.

`.nojekyll` is present to tell Pages to serve the files as-is instead of running
them through Jekyll.

Live site: https://vlxner.github.io/PittaCorner/

## Note

This is an unofficial, fan-built informational website created for demonstration
purposes. It is not affiliated with or endorsed by Pitta Corner. Menu items and
prices are drawn from public listings and may not reflect current offerings —
always confirm with the restaurant or its delivery platform listings.
