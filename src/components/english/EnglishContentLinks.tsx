import Link from '@/components/AppLink';
import type { EnglishContentLink } from '@/lib/englishContentLinks';

export default function EnglishContentLinks({ items }: { items: readonly EnglishContentLink[] }) {
  if (!items.length) return null;
  return <ul className="mt-4 space-y-3 text-sm leading-7">
    {items.map(item => <li key={item.href}><Link href={item.href} className="font-semibold text-primary underline underline-offset-4">{item.title}</Link>{' — '}{item.reason}</li>)}
  </ul>;
}
