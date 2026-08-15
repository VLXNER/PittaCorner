# Fonts

Self-hosted so the site makes no request to `fonts.googleapis.com` or
`fonts.gstatic.com`. That removes a third-party dependency and two extra
DNS + TLS round-trips from the critical path, and stops visitor IP addresses
being sent to Google on every page load.

| File | Source | Size | Notes |
| --- | --- | --- | --- |
| `manrope-latin-variable.woff2` | [`@fontsource-variable/manrope`](https://www.npmjs.com/package/@fontsource-variable/manrope) | 24 KB | Variable, weight axis 200–800. The site uses 400/500/600/700/800, so one file replaces five static ones (~70 KB). |
| `kaushan-script-latin-400.woff2` | [`@fontsource/kaushan-script`](https://www.npmjs.com/package/@fontsource/kaushan-script) | 16 KB | Subset from the 35 KB latin file. Only used for the wordmark. |

Both are licensed under the SIL Open Font License 1.1 — see
`LICENSE-Manrope.txt` and `LICENSE-Kaushan-Script.txt`. The OFL permits
redistribution and self-hosting; the licence files must travel with the fonts.

`@font-face` declarations live at the top of `../css/style.css`, and
`index.html` preloads both files.

## Regenerating

```bash
npm install @fontsource-variable/manrope @fontsource/kaushan-script
pip install fonttools brotli

cp node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2 \
   fonts/manrope-latin-variable.woff2

pyftsubset node_modules/@fontsource/kaushan-script/files/kaushan-script-latin-400-normal.woff2 \
  --output-file=fonts/kaushan-script-latin-400.woff2 --flavor=woff2 \
  --unicodes="U+0020-007E,U+00A0,U+00A3,U+00B7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026" \
  --layout-features="kern,liga,clig,calt" --no-hinting
```

The Kaushan subset covers printable ASCII plus `£ · – — ' ' " " …`. It is
deliberately wider than the twelve characters of "Pitta Corner" so a future
short brand string cannot silently lose glyphs — but if script type is ever
used for longer or non-English copy, widen `--unicodes` and re-run.

Manrope is **not** subset: it sets the whole page, including the menu, so it
needs the full latin range.
