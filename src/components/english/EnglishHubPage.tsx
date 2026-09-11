import EnglishPageShell from "./EnglishPageShell";
import EnglishTaskLinks from "./EnglishTaskLinks";
import { ENGLISH_HUBS, type EnglishHub, type EnglishHubId } from "@/lib/englishHubs";

export default function EnglishHubPage({ id }: { id: EnglishHubId }) {
  const hub: EnglishHub = ENGLISH_HUBS[id];
  return <EnglishPageShell eyebrow="Moneysalary · English" title={hub.heading ?? hub.title} description={hub.description} breadcrumbs={[{ name: hub.title, href: hub.path }]}>
    <section><h2 className="mb-5 text-2xl font-black">Choose your next task</h2><EnglishTaskLinks items={hub.tasks} label={`${hub.title} tools`} /></section>
    {hub.sections.map(section => <section key={section.title} className="rounded-2xl border border-border bg-background p-6 sm:p-8">
      <h2 className="text-2xl font-bold">{section.title}</h2><p className="mt-4 max-w-4xl leading-7 text-muted-foreground">{section.text}</p>
      {"points" in section && section.points && <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-muted-foreground">{section.points.map(point => <li key={point}>{point}</li>)}</ul>}
    </section>)}
    <section><h2 className="mb-5 text-2xl font-black">Read the method and context</h2><EnglishTaskLinks items={hub.reading} label={`${hub.title} reading`} /></section>
  </EnglishPageShell>;
}
