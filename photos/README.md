# Photos

Ten photographs of the restaurant, its grill and its food. Drop them in
here with **exactly these filenames** — index.html references them by name.

| Filename | Photo |
| --- | --- |
| `grill.jpg` | The charcoal grill, flames up, skewers along the bars |
| `spit.jpg` | The gyros spit at night, platters of meat in front |
| `wrap.jpg` | Chicken gyros wrap with chips, in Pitta Corner paper |
| `kalamakia.jpg` | Mixed skewers plate — salad, chips, tzatziki, pitta |
| `merida.jpg` | Gyros portion — chips, salad, sauce, pitta |
| `skepasti.jpg` | Skepasti, chips and grated cheese |
| `burger.jpg` | Greek burger with chips, blue branded backdrop |
| `breakfast.jpg` | Eggs Benedict with orange juice |
| `trilece.jpg` | Trilece dessert |
| `shopfront.jpg` | The shopfront and the flower boxes |

## Uploading

Easiest route is github.com: open the repo, **Add file → Upload files**,
drag all ten in, commit. No git needed.

## Size

Phone photos run 2–5 MB each; ten of those is a 30 MB page and a slow one
on mobile. Once they are in the repo they should be resized to about
1600px on the long edge and converted to WebP. That is a one-command job
and can be done in a follow-up.

## hero-loop.mp4 (optional, not yet present)

An ambient motion loop for the hero — flames flickering on the same grill
shot, nothing else. Contract: H.264 MP4, muted, seamless loop, 6–12s,
1280×720 or 1080×1350, under ~2.5MB. Derive it from `grill.jpg` (image-to-
video camera motion), do not generate imaginary food. To activate, add
`data-video="photos/hero-loop.mp4"` to the `.hero-media` div in index.html —
without that attribute nothing is fetched. The photo remains the poster and
the fallback everywhere, and the loop never plays under prefers-reduced-motion,
prefers-reduced-data or Save-Data.
