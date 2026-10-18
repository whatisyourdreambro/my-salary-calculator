'use client';

import { usePathname } from 'next/navigation';
import Link from '@/components/AppLink';
import { getFunRelatedPages } from '@/lib/funRelatedPages';

/** The layout places this after all existing ads and sharing, never above a slot. */
export default function FunRelatedPages() {
  const items = getFunRelatedPages(usePathname());
  if (!items.length) return null;
  return <section aria-labelledby="fun-related-title" data-msy-module="fun-related-pages" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
    <h2 id="fun-related-title" className="text-xl font-bold">이 활동과 함께 해볼 만한 것</h2>
    <ul className="mt-5 grid gap-4 sm:grid-cols-2">
      {items.map(item => <li key={item.href} className="rounded-2xl border border-border bg-background p-5">
        <h3 className="font-bold"><Link href={item.href} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">{item.title} →</Link></h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
      </li>)}
    </ul>
  </section>;
}
