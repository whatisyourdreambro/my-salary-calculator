import Link from "@/components/AppLink";

export type EnglishTaskLink = { href: string; title: string; description: string };

export default function EnglishTaskLinks({ items, label = "Related tasks", layout = "catalog", trackingModule }: { items: readonly EnglishTaskLink[]; label?: string; layout?: "catalog" | "result"; trackingModule?: `en-result-${string}` }) {
  return <nav aria-label={label} data-msy-module={trackingModule} className={`grid gap-4 ${layout === "catalog" ? "sm:grid-cols-2 lg:grid-cols-3" : items.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
    {items.map(item => <Link key={item.href} href={item.href} className="group min-w-0 rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      <span className="block text-lg font-bold text-foreground group-hover:text-primary">{item.title} <span aria-hidden="true">→</span></span>
      <span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.description}</span>
    </Link>)}
  </nav>;
}
