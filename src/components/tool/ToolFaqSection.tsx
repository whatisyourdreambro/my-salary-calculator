// src/components/tool/ToolFaqSection.tsx
// 도구 페이지 FAQ 아코디언. 서버 컴포넌트 (details 태그 — JS 불필요).

import { HelpCircle, ArrowRight } from "lucide-react";
import type { ToolFaqItem } from "@/lib/toolContent";

export default function ToolFaqSection({ faqs }: { faqs: ToolFaqItem[] }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="ms-surface ms-panel">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-foreground">
        <HelpCircle className="h-5 w-5 text-link" aria-hidden="true" />
        자주 묻는 질문
      </h2>
      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-border bg-background px-4"
          >
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 py-4 text-base font-semibold text-foreground">
              <span>{item.question}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-link transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden="true" />
            </summary>
            <p className="faq-answer whitespace-pre-line border-t border-border py-4 text-base leading-7 text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
