# Build page quality ledger

Run `npm run qa:quality` after a complete Next production build. It reads the existing `.next` artifacts without starting a server or requesting public URLs. Output is ignored by Git:

- `.artifacts/page-quality/ledger.json`: one record per unique generated HTML or sitemap page path, with machine findings and classified links.
- `.artifacts/page-quality/summary.md`: coverage counts and limitations.

The command fails for structural issues, unresolved internal links/assets, sitemap query variants or duplicate paths, or missing build artifacts. It does not fail merely because a body is short, a heading is duplicated across pages, or a generated page is absent from the sitemap. These are review candidates whose user purpose must be checked.

`machineStatus=checked` means the existing HTML was parsed and its configured checks passed. `contentReview=not-reviewed` stays separate on every record. A sitemap URL rendered at request time is `inventory-only`; its title, robots, canonical and HTTP status remain unknown until a separate runtime check. A route-pattern match is not proof that an arbitrary slug exists.

The script checks title, description, H1, canonical, robots metadata/artifact headers, JSON-LD syntax and actual anchor links. Serialized hydration scripts are excluded. Download route handlers and real public files resolve separately from pages; nonexistent CSV paths remain unresolved. Query values and fragments are not copied into the ledger, and query variants do not become additional pages.

The ledger describes the **build**, not necessarily current source. It records the build ID and prerender manifest hash but does not attest that the source tree matches the build. It does not verify production CDN headers, CSS visibility, hydration, user input, legal/data accuracy or search indexing. Use runtime route samples and meaningful browser/engine tests alongside it.

Regression tests use a local temporary fixture: `node --test scripts/__tests__/qa-page-quality.test.mjs`.
