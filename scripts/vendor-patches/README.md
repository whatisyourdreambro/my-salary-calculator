# Next OG selector parser backport

`next-og-selector.json` records an explicit backport of the linear-time membership
changes from [postcss-selector-parser commit 62b1917](https://github.com/postcss/postcss-selector-parser/commit/62b1917),
released in [7.1.6](https://github.com/postcss/postcss-selector-parser/releases/tag/7.1.6)
for [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).

Next 15.5.28 embeds an older parser inside `@vercel/og` 0.7.2. Installing a patched
top-level parser does not replace that embedded copy. Both Node and edge bundles
must receive the backport. The changes use Set membership in index deduplication,
Sass-interpolation filtering, and class/id selection. They preserve first-occurrence
order and all unrelated source bytes. The generated local variable names are
unique to this backport.

Run `node scripts/patch-next-og-selector.cjs` after installation. Run the same
command with `--check` before building or deploying. An unsupported version or
unrecognized file hash fails before either runtime is changed. Repeating the
patch is safe. Original files are backed up under `.artifacts/vendor-patches/`,
outside the traced Next package. No package version, lockfile, audit result or
advisory is hidden or rewritten. A future Next upgrade requires reviewing this
patch and updating its pinned original/output hashes deliberately.

The tests execute the actual embedded parser, isolated before image/WASM
initialization. They compare serialized output, full own-property AST data and
error results on 1,307 selectors in each runtime. Flat class, id and Sass cases
measure actual `Array#indexOf` scanning work instead of relying on timing.
No browser, server, production page, advertisement or external request is used.

This is a backport of the specified advisory fix, not a complete upgrade of every
library embedded by Next. In particular it does not claim to patch Satori's
separate SVG serialization advisory or the parser's separate nesting-depth
advisory. The current OG route accepts bounded text/numbers and fixed element
styles; its independent runtime input-isolation tests cover that application
boundary. Preserve those limits when adding future image features.

The upstream selector parser changes are MIT licensed; the copyright and license
are retained in `LICENSE.postcss-selector-parser`. The surrounding Vercel OG and
Satori bundles retain their existing MPL-2.0 notices. The complete modifications
are distributed as the readable before/after strings in the JSON specification;
do not remove either set of notices when distributing the modified bundles.
