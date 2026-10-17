# MoneySalary OG strip data

These build inputs are raster derivatives of the unmodified Noto Sans KR font in
`../og-font/`. Its pinned upstream URL, commit, SHA-256 and OFL-1.1 license are in
`../og-font/provenance.json` and `../og-font/OFL.txt`. Copyright and reserved font
name notices remain in that license. The exported assets include a copy of it.

`manifest.json` pins the compressed and expanded byte lengths and SHA-256 of all
four data files. Normal builds run `scripts/generate-pages-og.ts --out <stage/out>`
with Node 22. The generator verifies those hashes and the font/license hashes.
It does not fetch fonts or run an application server.

The generator writes three binary Data modules plus `config.mjs` and `index.mjs`
under `out/_worker.js/og/`. `index.mjs` exports `pagesOgData` for the Pages wrapper
to inject as `env.OG_STRIPS`. The normal runtime uses only these strips. The raw
bitmap atlas in `../og-atlas/` is an offline intermediate and is **not deployed**.
No runtime font parser, bitmap scan, zlib compressor, React, Next or Satori is used.

To rebuild the reviewed data offline, run these commands from the repository root
with Python 3.13, Pillow 11.3 and fontTools 4.64 installed:

```
python scripts/build-pages-og-atlas.py
python scripts/build-pages-og-strips.py
```

The first command rasterizes the pinned font at weight 700 and 36/64px, including
all 11,172 modern Hangul syllables. The second derives independent byte-aligned
`Z_FULL_FLUSH` DEFLATE segments. The runtime concatenates scanline segments,
combines their Adler-32 values and writes PNG chunks with CRC-32. The resulting
1200×630 indexed PNG has exactly 756,630 decompressed bytes. Static known images
use the same pixels and are recompressed at build time for smaller responses.

The local unit tests independently inflate PNGs and verify dimensions, CRCs,
numeric changes, input limits, cache/fallback behavior and the runtime import
graph. The local synthetic Workerd benchmark is diagnostic only: V8 sampling
time is not Cloudflare billed CPU. Free-plan CPU, deployed startup and concurrent
memory acceptance still require evidence from the exact deployment. The three
Data modules total 51,891,343 bytes; they must not be combined with the old atlas
in the deployed module graph.
