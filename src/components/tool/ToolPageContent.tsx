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
import { GuideMidAd } from "@/components/AdPlacement";
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
  "/tools/finance/dividend-tax", // layout.tsx가 직접 주입 (2026-09-01)
]);

// page/layout 이 이미 GuideMidAd(GUIDE_MID) 를 직접 배치한 경로 — 같은 슬롯은 경로당 1회만
// 렌더(dedup)되므로 여기서 또 넣으면 한쪽 유닛이 소멸한다. 반드시 스킵 (이중 방어).
// 전면 최적화 (운영자 지시 2026-09-02)
const PAGE_PROVIDES_GUIDE_MID = new Set<string>([
  "/tools/finance/bonus", // page.tsx 가 GuideMidAd 보유 (toolContent 미등재지만 방어 목적)
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
        {/* 본문 섹션 끝 ↔ FAQ 경계 광고 — 전면 최적화 (운영자 지시 2026-09-02).
            콘텐츠 충분 조건(섹션 2개 이상·FAQ 보유)일 때만 렌더. 결과 직하 CalcResultAd 와
            tools/layout 하단 InArticleAd 사이에 본문·FAQ·유의사항이 끼어 연속 광고가 되지 않는다. */}
        {content.sections.length >= 2 &&
          content.faqs.length > 0 &&
          !PAGE_PROVIDES_GUIDE_MID.has(path) && <GuideMidAd />}
        <ToolFaqSection faqs={content.faqs} />
        {content.disclaimer && <ToolDisclaimer text={content.disclaimer} />}
      </div>
    </div>
  );
}
