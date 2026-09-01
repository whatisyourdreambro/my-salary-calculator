// src/components/tool/ToolPageContent.tsx
// 도구 페이지 하단 콘텐츠 블록 — toolContent의 path별 데이터를 렌더.
// 데이터가 없으면 아무것도 렌더하지 않아 페이지가 점진적으로 콘텐츠를 채울 수 있다.
// 서버 컴포넌트.

import { getToolContent } from "@/lib/toolContent";
import {
  autoBreadcrumbLd,
  faqLd,
  softwareApplicationLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import ToolContentSection from "./ToolContentSection";
import ToolFaqSection from "./ToolFaqSection";
import ToolDisclaimer from "./ToolDisclaimer";

// 자체 layout.tsx 또는 page.tsx가 이미 SoftwareApplication + BreadcrumbList를 주입하는 경로.
// 여기서 또 주입하면 같은 @type이 2회 노출되므로 반드시 스킵한다.
const LAYOUT_PROVIDES_APP_LD = new Set([
  "/tools/finance/bonus",
  "/tools/finance/severance",
  "/tools/finance/compound",
  "/tools/finance/freelance-tax",
  "/tools/finance/installment",
  "/tools/finance/stock-tax",
  "/tools/real-estate/acquisition-tax",
  "/tools/real-estate/gift-tax",
  "/tools/deposit", // page.tsx가 직접 주입 (2026-09-01)
]);

export default function ToolPageContent({ path }: { path: string }) {
  const content = getToolContent(path);
  if (!content) return null;

  // FAQ + (layout 미커버 경로 한정) SoftwareApplication·Breadcrumb 일괄 주입
  const schemas: object[] = [];
  if (content.faqs.length > 0) {
    schemas.push(
      faqLd(
        content.faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))
      )
    );
  }
  if (
    !LAYOUT_PROVIDES_APP_LD.has(path) &&
    content.name &&
    content.description
  ) {
    schemas.push(
      softwareApplicationLd({
        name: content.name,
        description: content.description,
        url: path,
      }),
      autoBreadcrumbLd(path, { leafName: content.name })
    );
  }

  return (
    <div className="page-width mt-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {schemas.length > 0 && <JsonLd data={schemas} />}
        {content.sections.map((section, i) => (
          <ToolContentSection key={i} section={section} />
        ))}
        <ToolFaqSection faqs={content.faqs} />
        {content.disclaimer && <ToolDisclaimer text={content.disclaimer} />}
      </div>
    </div>
  );
}
