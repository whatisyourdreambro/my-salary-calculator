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
    <div lang="en" data-english-page className="bg-canvas px-4 pb-12 pt-28 text-navy sm:px-6 dark:bg-canvas-950 dark:text-canvas-50">
      <div className="mx-auto w-full max-w-6xl min-w-0">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {trail.map((item, i) => <span key={item.href} className="inline-flex items-center gap-2">{i > 0 && <span aria-hidden="true">/</span>}<Link href={item.href} className="inline-flex min-h-11 items-center rounded-lg hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{item.name}</Link></span>)}
        </nav>
        {trail.length > 1 && <JsonLd data={breadcrumbLd(trail.map(item => ({ name: item.name, path: item.href })))} />}
        <header className="mb-9 max-w-4xl">
          {eyebrow && <p className="mb-3 text-sm font-bold text-electric dark:text-blue-300">{eyebrow}</p>}
          <h1 className="break-words text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
          <div className="mt-5"><FavoritesButton locale="en" /></div>
        </header>
        <div className="min-w-0 space-y-10">{children}</div>
      </div>
    </div>
  );
}
