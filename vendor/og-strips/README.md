# MoneySalary OG strip data

These build inputs are raster derivatives of the unmodified Noto Sans KR font in
`../og-font/`. Its pinned upstream URL, commit, SHA-256 and OFL-1.1 license are in
`../og-font/provenance.json` and `../og-font/OFL.txt`. Copyright and reserved font
name notices remain in that license. The exported assets include a copy of it.

`manifest.json` pins the compressed and expanded byte lengths and SHA-256 of all
four data files. Normal builds run `scripts/generate-pages-og.ts --out <stage/out>`
with Node 22. The generator verifies those hashes and the font/license hashes.
It does not fetch fonts or run an application server.

Since 2026-11-01 (G2/PD-02) these files are build inputs only. The generator
expands them in memory with bounded `node:zlib` decompression and draws every
exported og:image, twitter:image and JSON-LD card plus the ten share-button card
keys (default and four path kinds, Korean and English). It writes those PNGs to
`out/_msy/og/v1/images/`, the generic card to `out/_msy/og/v1/fallback.png`, and
nothing under `out/_worker.js/`. The Worker serves the prebuilt PNGs, or the
fallback with `X-OG-Fallback` for any other parameter set. It imports no strip
data, renderer, font parser, bitmap scan, zlib, React, Next or Satori, and the
Pages build refuses a Worker bundle that contains the renderer or this data. The
raw bitmap atlas in `../og-atlas/` is an offline intermediate and is **not
deployed**.

To rebuild the reviewed data offline, run these commands from the repository root
with Python 3.13, Pillow 11.3 and fontTools 4.64 installed:

```
python scripts/build-pages-og-atlas.py
python scripts/build-pages-og-strips.py
```

The first command rasterizes the pinned font at weight 700 and 36/64px, including
all 11,172 modern Hangul syllables. The second derives independent byte-aligned
`Z_FULL_FLUSH` DEFLATE segments. The build-time renderer
(`cloudflare/pages-og-render.ts` and `cloudflare/pages-og-strips.ts`) concatenates
scanline segments, combines their Adler-32 values and writes PNG chunks with
CRC-32. The resulting 1200×630 indexed PNG has exactly 756,630 decompressed
bytes. The generator recompresses each card for smaller responses without
changing a pixel.

The local unit tests independently inflate PNGs and verify dimensions, CRCs,
numeric changes, input limits, prebuilt/fallback serving and the Worker import
graph. The expanded arrays total 51,891,343 bytes and now exist only in the build
process. Until G2 they shipped as 40 binary Data modules (23,842,071 bytes) and
were restored at every isolate start. The existing Pages API rejected an earlier
raw package with a 25 MiB limit (code 8000101 on 2026-10-17), so package
verification still enforces 25 MiB for the entire Worker, even though generic
Workers documentation lists a larger allowance.
