"use client";

import { useEffect, useState } from "react";
import Link from "@/components/AppLink";
import { FAVORITES_EVENT, loadFavorites, saveFavorites, type FavoriteItem } from "@/components/FavoritesButton";
import { ENGLISH_RESULTS_EVENT, ENGLISH_RESULTS_LIMIT, deleteEnglishSalarySnapshot, loadEnglishSalarySnapshots, type EnglishSalarySnapshot } from "@/lib/englishSavedResults";

const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 py-2 font-semibold hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";
const money = (value: number) => `${value.toLocaleString("en-US")} KRW`;
const date = (value: string) => new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export default function EnglishDashboardClient() {
  const [snapshots, setSnapshots] = useState<EnglishSalarySnapshot[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [available, setAvailable] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const refresh = () => {
      const result = loadEnglishSalarySnapshots();
      setSnapshots(result.snapshots);
      setAvailable(result.ok);
      setFavorites(loadFavorites().filter(item => /^\/en(?:\/|$)/.test(item.path)).sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt)));
      setLoaded(true);
    };
    refresh();
    window.addEventListener(ENGLISH_RESULTS_EVENT, refresh);
    window.addEventListener(FAVORITES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(ENGLISH_RESULTS_EVENT, refresh); window.removeEventListener(FAVORITES_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, []);

  if (!loaded) return <p role="status">Checking saved items in this browser…</p>;
  return <div className="space-y-8">
    <p className="rounded-xl border border-border bg-background p-4 text-sm leading-6">Save an estimate with the calculator’s <strong>Save this estimate</strong> button. Up to {ENGLISH_RESULTS_LIMIT} estimates can be kept. Changing an input does not update an earlier snapshot. Clearing browser data removes saved items. Korean calculation data is kept separately.</p>
    {!available && <p role="alert" className="rounded-xl border border-red-300 p-4">Saved estimates could not be read. Storage may be blocked or contain an unsupported record. Nothing has been erased or overwritten. Check browser storage settings; clearing this site’s browser data also removes other locally saved items.</p>}
    <section aria-labelledby="saved-estimates-title">
      <h2 id="saved-estimates-title" className="text-2xl font-bold">Saved salary estimates ({snapshots.length})</h2>
      {!snapshots.length ? <div className="mt-4 rounded-2xl border border-border bg-background p-6"><p>No English salary estimate is available here yet.</p><Link href="/en#calculator" className={`${buttonClass} mt-4`}>Calculate and choose what to save</Link></div> : <ul className="mt-4 grid gap-5 lg:grid-cols-2">{snapshots.map(item => <li key={item.id} className="min-w-0 rounded-2xl border border-border bg-background p-5">
        <h3 className="text-lg font-bold">{item.label}</h3>
        <p className="mt-2 text-sm text-muted-foreground">Saved {date(item.savedAt)}</p>
        <p className="mt-4 break-words text-2xl font-black text-primary">{money(item.netPay)}<span className="ml-2 text-sm font-normal text-foreground">estimated monthly take-home</span></p>
        <dl className="mt-4 space-y-2 text-sm"><div><dt className="font-semibold">Annual gross, including exempt pay</dt><dd>{money(item.annualSalary)}</dd></div><div><dt className="font-semibold">Monthly non-taxable pay</dt><dd>{money(item.nonTaxableMonthly)}</dd></div><div><dt className="font-semibold">Basic-deduction people / eligible children</dt><dd>{item.dependents} / {item.children}</dd></div></dl>
        <details className="mt-4 rounded-xl border border-border p-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">Deductions and model</summary><dl className="mt-3 space-y-2 text-sm">{[
          ["National Pension", item.nationalPension], ["Health Insurance", item.healthInsurance], ["Long-term Care", item.longTermCare], ["Employment Insurance", item.employmentInsurance], ["National income tax", item.incomeTax], ["Local income tax", item.localIncomeTax], ["Total monthly deductions", item.totalDeductions],
        ].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt>{label}</dt><dd>{money(Number(value))}</dd></div>)}</dl><p className="mt-4 text-sm leading-6 text-muted-foreground">2026 simplified Korean regular-employee model; standard insurance coverage assumed. This is a stored estimate, not an actual payslip, entitlement check or recalculation under later rates.</p><Link href="/en/help#salary" className={`${buttonClass} mt-3 text-sm`}>Sources and assumptions</Link></details>
        <button type="button" className={`${buttonClass} mt-4 text-sm`} aria-label={`Delete salary estimate saved ${date(item.savedAt)}`} onClick={() => setMessage(deleteEnglishSalarySnapshot(item.id) ? "Saved estimate deleted from this browser." : "Could not delete this estimate. Nothing was changed.")}>Delete this estimate</button>
      </li>)}</ul>}
    </section>
    <section aria-labelledby="saved-pages-title">
      <h2 id="saved-pages-title" className="text-2xl font-bold">Saved English pages ({favorites.length})</h2>
      {!favorites.length ? <div className="mt-4 rounded-2xl border border-border bg-background p-6"><p>No English page is saved yet. Use a page’s save button to add it here.</p><Link href="/en/calculators" className={`${buttonClass} mt-4`}>Explore calculators</Link></div> : <ul className="mt-4 space-y-3">{favorites.map(item => <li key={item.path} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background p-4"><div className="min-w-0"><Link href={item.path} className="inline-flex min-h-11 items-center break-words font-semibold text-primary underline">{item.title}</Link><p className="text-sm text-muted-foreground">Saved {date(item.addedAt)}</p></div><button type="button" className={buttonClass} aria-label={`Remove ${item.title} from favorites`} onClick={() => setMessage(saveFavorites(loadFavorites().filter(favorite => favorite.path !== item.path)) ? "Saved page removed. Your other saved items are unchanged." : "Could not remove this saved page. Check browser storage.")}>Remove</button></li>)}</ul>}
      <p className="mt-4 text-sm text-muted-foreground">This list shows English pages. Previously saved Korean pages remain in the Korean dashboard.</p>
    </section>
    <p role="status" aria-live="polite" className="text-sm font-semibold">{message}</p>
    <Link href="/en/privacy" className={buttonClass}>How local data is handled</Link>
  </div>;
}
