'use client';

import { usePathname } from 'next/navigation';
import Link from '@/components/AppLink';
import { getTopicNextSteps } from '@/lib/topicNextSteps';

export default function TopicNextSteps({ path }: { path?: string }) {
  const pathname = usePathname();
  const items = getTopicNextSteps(path ?? pathname ?? '');
  if (!items.length) return null;
  return <section data-msy-module="topic-next-steps" className="mx-auto my-10 max-w-5xl rounded-2xl border border-border bg-background p-5 sm:p-7" aria-label="주제에 이어서 확인할 내용">
    <h2 className="text-xl font-bold text-foreground">이어서 확인할 내용</h2>
    <ul className="mt-5 grid gap-5 sm:grid-cols-2">
      {items.map(item => <li key={item.href}>
        <h3 className="font-bold"><Link href={item.href} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">{item.title} →</Link></h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
      </li>)}
    </ul>
  </section>;
}
