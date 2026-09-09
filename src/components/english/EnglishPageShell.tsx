import type { ReactNode } from "react";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";
import FavoritesButton from "@/components/FavoritesButton";

export default function EnglishPageShell({ eyebrow, title, description, breadcrumbs = [], children }: {
  eyebrow?: string; title: string; description: string; children: ReactNode;
  breadcrumbs?: { name: string; href: string }[];
}) {
  const trail = [{ name: "Home", href: "/en" }, ...breadcrumbs.filter(item => item.href !== "/en")];
  return (
    <div lang="en" data-english-page className="bg-background pb-16 pt-24 text-foreground sm:pt-28">
      <div className="ms-page min-w-0">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {trail.map((item, i) => <span key={item.href} className="inline-flex items-center gap-2">{i > 0 && <span aria-hidden="true">/</span>}<Link href={item.href} className="inline-flex min-h-11 items-center rounded-lg hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{item.name}</Link></span>)}
        </nav>
        {trail.length > 1 && <JsonLd data={breadcrumbLd(trail.map(item => ({ name: item.name, path: item.href })))} />}
        <header className="mb-8 max-w-4xl border-b border-border pb-8 sm:mb-10">
          {eyebrow && <p className="ms-eyebrow mb-3">{eyebrow}</p>}
          <h1 className="ms-title break-words">{title}</h1>
          <p className="ms-description mt-4 max-w-3xl">{description}</p>
          <div className="mt-5 min-h-12"><FavoritesButton locale="en" className="min-h-11" /></div>
        </header>
        <div className="min-w-0 space-y-10">{children}</div>
      </div>
    </div>
  );
}
