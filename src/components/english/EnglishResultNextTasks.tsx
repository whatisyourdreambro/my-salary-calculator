import EnglishTaskLinks from './EnglishTaskLinks';
import type { EnglishResultTaskPlan, EnglishResultTaskSource } from '@/lib/englishResultTasks';

export default function EnglishResultNextTasks({ source, plan }: { source: EnglishResultTaskSource; plan: EnglishResultTaskPlan | null }) {
  if (!plan || plan.items.length === 0) return null;
  const headingId = `en-next-task-${source}`;
  return <aside aria-labelledby={headingId} className="mt-6 space-y-3 border-t border-border pt-5" data-english-result-next={source}>
    <h3 id={headingId} className="text-lg font-bold">Choose your next task</h3>
    <p className="text-sm leading-6 text-muted-foreground" data-next-task-context>{plan.context}</p>
    <EnglishTaskLinks items={plan.items} label="Next tasks for this calculation" layout="result" trackingModule={`en-result-${source}`} />
    <p className="text-xs leading-5 text-muted-foreground">Tools open with example inputs. Choose your currency and enter the figures you want to compare.</p>
  </aside>;
}
