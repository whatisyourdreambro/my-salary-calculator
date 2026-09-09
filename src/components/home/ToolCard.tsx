import Link from "@/components/AppLink";
import { ChevronRight } from "lucide-react";

interface ToolCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  iconBg?: string;
  wide?: boolean;
  badge?: string;
}

/** Whole-card target; descriptions wrap so mobile readers can choose before opening. */
export default function ToolCard({ icon: Icon, title, description, href, wide = false, badge }: ToolCardProps) {
  return <Link href={href} className={`ms-surface ms-interactive group flex h-full min-w-0 items-start gap-4 p-5 no-underline ${wide ? "md:col-span-2" : ""}`}>
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-link"><Icon className="h-5 w-5" aria-hidden="true" /></span>
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-2"><span className="font-semibold leading-6 text-foreground">{title}</span>{badge && <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{badge}</span>}</span>
      <span className="mt-1.5 block text-sm leading-6 text-muted-foreground">{description}</span>
    </span>
    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
  </Link>;
}
