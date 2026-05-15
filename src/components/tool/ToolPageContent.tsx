// src/components/tool/ToolPageContent.tsx
// 도구 페이지 하단 콘텐츠 블록 — toolContent의 path별 데이터를 렌더.
// 데이터가 없으면 아무것도 렌더하지 않아 페이지가 점진적으로 콘텐츠를 채울 수 있다.
// 서버 컴포넌트.

import { getToolContent } from "@/lib/toolContent";
import { faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import ToolContentSection from "./ToolContentSection";
import ToolFaqSection from "./ToolFaqSection";
import ToolDisclaimer from "./ToolDisclaimer";

export default function ToolPageContent({ path }: { path: string }) {
  const content = getToolContent(path);
  if (!content) return null;

  return (
    <div className="page-width mt-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {content.faqs.length > 0 && (
          <JsonLd
            data={faqLd(
              content.faqs.map((f) => ({
                question: f.question,
                answer: f.answer,
              }))
            )}
          />
        )}
        {content.sections.map((section, i) => (
          <ToolContentSection key={i} section={section} />
        ))}
        <ToolFaqSection faqs={content.faqs} />
        {content.disclaimer && <ToolDisclaimer text={content.disclaimer} />}
      </div>
    </div>
  );
}
