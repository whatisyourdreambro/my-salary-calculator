import Link from "@/components/AppLink";
import EnglishPageShell from "@/components/english/EnglishPageShell";

export default function EnglishNotFound() {
  return <div data-page-state="not-found"><EnglishPageShell eyebrow="404 · Page not found" title="This English page could not be found" description="The address may be incomplete or the page may no longer exist. Choose an available English tool or guide below.">
    <nav aria-label="Find an English page" className="flex flex-wrap gap-4"><Link href="/en" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">English home</Link><Link href="/en/calculators" className="inline-flex min-h-11 items-center px-4 font-bold text-primary underline">Calculators</Link><Link href="/en/guides" className="inline-flex min-h-11 items-center px-4 font-bold text-primary underline">Guides</Link></nav>
  </EnglishPageShell></div>;
}
