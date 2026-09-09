# Share and navigation checks

Run `npm run qa:share` to inventory each page template and its inherited layouts. The AST check follows static and lazy TSX imports, records reachable shared components or native share calls, and fails on a public template with no share code. Comments and string examples do not count. Output is `.artifacts/share-coverage/source-ledger.json`, also uploaded by CI.

This is source coverage, not proof of visible UI, every generated URL or delivery to a social service. Check representative real pages separately after hydration, including route transitions, late calculation results, private pages and 404 responses. Personal dashboards, local reports, contact workflows and policy documents are classified separately from public promotional sharing.

Before release, verify page links, explicit result previews, stale-result invalidation, clipboard success and failure, manual copy, native cancellation, keyboard focus, 360px layouts, and Korean/English transitions. Browser test doubles validate fallback behavior; they cannot establish a real social post or recipient delivery. Saved images must be opened and visually reviewed.

Navigation uses native modal dialogs for keyboard focus containment, Escape, background inertness and focus return. Verify open/close, Tab and Shift+Tab, route changes, resizing from mobile to desktop, and restoration of body scrolling. English search only offers existing English content and loads its index on demand.

Relevant platform guidance: [Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share), [modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), and [multilingual search](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).
