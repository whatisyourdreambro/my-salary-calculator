# Next OG selector parser backport

`next-og-selector.json` records an explicit backport of the linear-time membership
changes from [postcss-selector-parser commit 62b1917](https://github.com/postcss/postcss-selector-parser/commit/62b1917),
released in [7.1.6](https://github.com/postcss/postcss-selector-parser/releases/tag/7.1.6)
for [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
It also includes [CVE-2026-9358's parsing/serialization fix](https://github.com/postcss/postcss-selector-parser/pull/316),
the [clone/walk follow-up](https://github.com/postcss/postcss-selector-parser/releases/tag/7.1.3),
and the [non-node serialization compatibility fix](https://github.com/postcss/postcss-selector-parser/releases/tag/6.1.4).
The depth implementation follows the readable source in the upstream `6.1.4`
tag; the flat-selector membership changes follow commit `62b1917`.

Next 15.5.28 embeds an older parser inside `@vercel/og` 0.7.2. Installing a patched
top-level parser does not replace that embedded copy. Both Node and edge bundles
must receive the backport. The changes use Set membership in index deduplication,
Sass-interpolation filtering, and class/id selection. They preserve first-occurrence
order and all unrelated source bytes. The generated local variable names are
unique to this backport.

Parsing and serialization use the upstream default limit of 256 nested pseudo
selectors. Clone and walk have the upstream fixed limit of 256 object/tree
levels. Parsing decrements its depth counter in `finally`; serialization threads
depth through root/container/pseudo nodes rather than resetting it recursively.
Processor sync/async entry points forward the option to parsing and serialization.
The existing permissive `String(child)` fallback is retained for non-node values.
As upstream documents, `maxNestingDepth` is **trusted developer configuration**:
nonnegative safe integers can raise the limit, so never derive this option from
an HTTP parameter or untrusted selector. Invalid options revert to 256.

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
They exercise the 256/257 boundary, malformed option values, processor option
propagation, and programmatically built deep trees that bypass the parser.
Clone/walk behavior, early termination and non-node coercion are also compared.
No browser, server, production page, advertisement or external request is used.

This is a backport of the specified advisory fix, not a complete upgrade of every
library embedded by Next. In particular it does not claim to patch Satori's
separate [SVG serialization advisory](https://github.com/vercel/satori/security/advisories/GHSA-wx4j-mvgx-mqwp).
The current OG route accepts bounded text/numbers and fixed element
styles; its independent runtime input-isolation tests cover that application
boundary. Its SVG brand mark has fixed element/attribute values. No user SVG,
element name, attribute, `style`, `tw` or `className` enters the image renderer.
This is a verified application boundary, not a claim that Satori was upgraded or
all of its internal code was patched. Preserve those limits when adding future
image features and reassess any future dynamic SVG support.

The backport changes no ImageResponse API, WASM import, image/font asset or
bundling configuration. Its VM tests do not substitute for the separate ad-free
OpenNext build, Worker packaging and loopback OG-response checks.

The upstream selector parser changes are MIT licensed; the copyright and license
are retained in `LICENSE.postcss-selector-parser` and in a preserved legal comment
added to both runtime bundles. The surrounding Vercel OG and
Satori bundles retain their existing MPL-2.0 notices. The complete modifications
are distributed as the readable before/after strings in the JSON specification;
do not remove either set of notices when distributing the modified bundles.
