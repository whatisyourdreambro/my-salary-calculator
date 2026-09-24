// Let Next.js preserve history scroll and honor fragment links. A page-wide
// client effect would override both and require hydration for this static shell.
//
// Ad-critical: AdSense auto ads store in-page placements as CSS paths that run
// through this wrapper (BODY>DIV.flex.flex-col.min-h-screen>MAIN#main-content>
// DIV.w-full.h-full>…). Renaming "w-full h-full" to "w-full min-w-0" on
// 2026-09-10 (4eda6889) orphaned every stored placement and cut auto in-page
// impressions ~75% site-wide. Only ever add classes here; never remove or rename
// w-full / h-full (guarded by src/lib/__tests__/adCriticalShell.test.ts).
export default function Template({ children }: { children: React.ReactNode }) {
 return <div className="w-full h-full min-w-0">{children}</div>;
}
