// src/components/tool/ToolFaqSection.tsx
// 도구 페이지 FAQ 아코디언. 서버 컴포넌트 (details 태그 — JS 불필요).

import { HelpCircle, ArrowRight } from "lucide-react";
import type { ToolFaqItem } from "@/lib/toolContent";

export default function ToolFaqSection({ faqs }: { faqs: ToolFaqItem[] }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="p-6 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-800">
      <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-electric" />
        자주 묻는 질문
      </h2>
      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.question}
            className="group p-4 bg-canvas-50 dark:bg-canvas-800 rounded-xl border border-canvas-200 dark:border-canvas-700"
          >
            <summary className="flex items-start justify-between gap-3 cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
              <span>{item.question}</span>
              <ArrowRight className="w-4 h-4 text-electric flex-shrink-0 mt-0.5 transition-transform group-open:rotate-90" />
            </summary>
            <p className="faq-answer mt-3 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed whitespace-pre-line">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
