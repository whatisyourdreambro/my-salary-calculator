import { notFound } from 'next/navigation';
import Link from '@/components/AppLink';
import EnglishPageShell from '@/components/english/EnglishPageShell';
import EnglishToolCalculator from '@/components/english/EnglishToolCalculator';
import { buildEnglishMetadata } from '@/lib/englishSeo';
import { ENGLISH_TOOLS, getEnglishTool } from '@/lib/englishTools';
import { ENGLISH_TOOL_DETAILS } from '@/lib/englishToolModels';

export function generateStaticParams() { return ENGLISH_TOOLS.map(tool => ({ slug: tool.slug })); }
export function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = getEnglishTool(params.slug);
  if (!tool) return buildEnglishMetadata({ title: 'Calculator not found', description: 'The requested calculator is unavailable.', path: '/en/tools', index: false });
  return buildEnglishMetadata({ title: tool.title, description: tool.description, path: `/en/tools/${tool.slug}` });
}

export default function EnglishToolPage({ params }: { params: { slug: string } }) {
  const tool = getEnglishTool(params.slug);
  if (!tool) notFound();
  const details = ENGLISH_TOOL_DETAILS[tool.slug];
  const related = tool.relatedSlugs.map(getEnglishTool).filter(item => item !== undefined);
  return <EnglishPageShell eyebrow="English calculators · your assumptions" title={tool.title} description={tool.description} breadcrumbs={[{ name: 'Calculators', href: '/en/tools' }, { name: tool.title, href: `/en/tools/${tool.slug}` }]}>
    <EnglishToolCalculator slug={tool.slug} />
    <section aria-labelledby="tool-method" className="rounded-2xl border border-border bg-background p-5 sm:p-7">
      <h2 id="tool-method" className="text-2xl font-bold">How this calculation works</h2>
      <p className="mt-4 break-words rounded-xl bg-canvas p-4 font-mono text-sm leading-7 dark:bg-canvas-900">{details.formula}</p>
      <h3 className="mt-6 text-lg font-bold">Assumptions and limits</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">{details.assumptions.map(text => <li key={text}>{text}</li>)}</ul>
      <h3 className="mt-6 text-lg font-bold">Worked example</h3>
      <p className="mt-3 leading-7 text-muted-foreground">{details.example}</p>
      {tool.slug === 'loan' && <p className="mt-5 text-sm text-muted-foreground">Concept reference: the <a className="underline" href="https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/" target="_blank" rel="noopener noreferrer">CFPB explanation of principal, interest and amortization</a>. This tool uses only fixed-payment arithmetic and does not apply US mortgage rules.</p>}
      {(tool.slug === 'compound-interest' || tool.slug === 'savings-goal') && <p className="mt-5 text-sm text-muted-foreground">Related educational tool: <a className="underline" href={tool.slug === 'compound-interest' ? 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' : 'https://www.investor.gov/financial-tools-calculators/calculators/savings-goal-calculator'} target="_blank" rel="noopener noreferrer">Investor.gov’s {tool.slug === 'compound-interest' ? 'compound interest' : 'savings goal'} calculator</a>. Check contribution timing and compounding frequency when comparing results.</p>}
    </section>
    <section aria-labelledby="tool-faq" className="space-y-4">
      <h2 id="tool-faq" className="text-2xl font-bold">Questions about this tool</h2>
      {details.faq.map(item => <details key={item.question} className="rounded-xl border border-border bg-background p-5"><summary className="min-h-11 cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p></details>)}
    </section>
    <section aria-labelledby="tool-next" className="space-y-4">
      <h2 id="tool-next" className="text-2xl font-bold">Continue with a related tool</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{related.map(item => <Link key={item.slug} href={`/en/tools/${item.slug}`} className="min-w-0 rounded-2xl border border-border bg-background p-5 hover:border-primary"><h3 className="break-words font-bold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.description}</p></Link>)}</div>
      <Link href="/en/help" className="inline-flex min-h-11 items-center font-semibold text-primary underline">Methods, sources and help</Link>
    </section>
  </EnglishPageShell>;
}
