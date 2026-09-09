"use client";

import Link from "@/components/AppLink";
import ShareButtons from "@/components/ShareButtons";
import type { Guide } from "@/lib/guidesData";
import { formatGuideDate, getGuideModifiedDate } from "@/lib/guideDates";
import { englishGuideContent } from "@/lib/englishGuideContent";
import { englishGuideNextTask } from "@/lib/englishNavigation";
import { guideSearchHref } from "@/lib/guideDiscovery";
import { GuideMidAd, InArticleAd, MultiplexAd, SidebarAd } from "@/components/AdPlacement";
import EnglishPageShell from "@/components/english/EnglishPageShell";

const categoryLabel: Record<string, string> = { Stocks: "Stocks and employee compensation", Tax: "Tax and insurance", RealEstate: "Housing and borrowing" };

export default function EnglishGuideClient({ guide, relatedGuides }: { guide: Guide; relatedGuides: Guide[] }) {
  const articleContent = englishGuideContent(guide.content);
  const nextTask = englishGuideNextTask(guide.slug);
  const readingTime = Math.max(1, Math.ceil(guide.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 200));
  const contents = <nav aria-label="On this page"><ul className="space-y-2 text-sm">{articleContent.headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`} className="inline-flex min-h-11 items-center rounded-lg text-muted-foreground underline decoration-border underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{heading.text}</a></li>)}</ul></nav>;

  return <EnglishPageShell eyebrow={categoryLabel[guide.category] ?? guide.category} title={guide.title} description={guide.description} breadcrumbs={[{ name: "Guides", href: "/en/guides" }, { name: guide.title, href: `/en/guides/${guide.slug}` }]}>
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
      <span>Published <time dateTime={guide.publishedDate}>{formatGuideDate(guide.publishedDate, "en")}</time></span>
      {getGuideModifiedDate(guide) !== guide.publishedDate && <span>Updated <time dateTime={getGuideModifiedDate(guide)}>{formatGuideDate(getGuideModifiedDate(guide), "en")}</time></span>}
      <span>About {readingTime} min read</span>
    </div>
    <ShareButtons title={guide.title} description={guide.description} locale="en" contentType="guide" variant="compact" register={false} />
    <details className="rounded-2xl border border-border bg-background p-5 lg:hidden"><summary className="cursor-pointer py-2 text-lg font-bold">On this page</summary><div className="mt-3">{contents}</div></details>
    <div className="flex min-w-0 flex-col gap-8 lg:flex-row">
      <article className="min-w-0 flex-1">
        <div className="rounded-3xl border border-border bg-background p-5 sm:p-8">
          <section className="guide-tldr mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5"><h2 className="text-lg font-bold text-primary">Key summary</h2><p className="mt-3 leading-7 text-muted-foreground">{guide.description}</p></section>
          <GuideMidAd />
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-28 prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-border prose-h2:pb-4 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl prose-p:leading-8 prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:underline prose-li:text-muted-foreground prose-table:text-sm" dangerouslySetInnerHTML={{ __html: articleContent.html }} />
          <section className="mt-8 rounded-xl border border-border bg-secondary/30 p-5"><h2 className="font-bold">Sources and method</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Use the dated sources and assumptions stated in this guide. An illustration is not an employer promise, tax assessment or investment forecast. Personal eligibility and the applicable income year need separate checks.</p><Link href="/en/help" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-primary underline">Methods, official resources and help →</Link></section>
          <InArticleAd />
          <section className="mt-8"><h2 className="mb-3 text-xl font-bold">Use this guide</h2><p className="mb-4 text-sm leading-6 text-muted-foreground">{nextTask.description}</p><Link href={nextTask.href} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">{nextTask.name} →</Link></section>
          <nav aria-label="Explore guide topics" className="mt-8 flex flex-wrap gap-2">{guide.tags.map(tag => <Link key={tag} href={guideSearchHref(tag, "en")} rel="nofollow" className="inline-flex min-h-11 items-center rounded-full border border-border px-4 py-2 text-sm text-primary hover:bg-secondary">#{tag}</Link>)}</nav>
          <div className="mt-8 border-t border-border pt-6"><p className="mb-3 font-bold">Share this guide</p><ShareButtons title={guide.title} description={guide.description} locale="en" contentType="guide" /></div>
        </div>
        <section className="mt-10"><h2 className="mb-5 text-2xl font-black">Related reading</h2><div className="grid gap-4 sm:grid-cols-2">{relatedGuides.map(related => <Link key={related.slug} href={`/en/guides/${related.slug}`} className="rounded-2xl border border-border bg-background p-5 hover:border-primary"><h3 className="font-bold">{related.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{related.description}</p></Link>)}</div></section>
        <MultiplexAd />
      </article>
      <aside className="hidden w-64 shrink-0 space-y-6 lg:block">
        <div className="rounded-2xl border border-border bg-background p-5"><h2 className="mb-3 font-bold">On this page</h2>{contents}</div>
        <section className="rounded-2xl border border-border bg-background p-5"><h2 className="font-bold">Next useful step</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{nextTask.description}</p><Link href={nextTask.href} className="mt-3 inline-flex min-h-11 items-center font-bold text-primary underline">{nextTask.name} →</Link></section>
        <div className="sticky top-24"><SidebarAd /></div>
      </aside>
    </div>
  </EnglishPageShell>;
}
