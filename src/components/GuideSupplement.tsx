// src/components/GuideSupplement.tsx
//
// 가이드 보강 섹션 (서버 컴포넌트, 2026-09-12 S3-4). src/lib/guides/supplements.ts 에 슬러그 항목이 있을 때만
// 가이드 상세 페이지의 마지막 광고(HomeTopAd) 아래에 본문과 같은 prose 스타일로 렌더한다.
// ★ 배치 규칙: 광고 위·광고 사이에 두지 말 것 — page.tsx 에서 HomeTopAd 래퍼 바로 다음에만 놓는다
//   (2026-08-16 "광고 위 UI 삽입" 수익 사고 규칙). 광고 컴포넌트는 여기서 import 하지 않는다.
// data-msy-module: layout.tsx 의 [data-msy-module] 클릭 위임 계측(guide_cta_click, position=모듈명)에 잡힌다.
import { guideSupplements } from "@/lib/guides/supplements";

// GuidePageClient.tsx 의 PROSE_CLASS 와 동일 문자열(클라이언트 모듈이라 서버 컴포넌트에서 import 하지 않고 복제).
// 본문 prose 스타일을 바꾸면 두 곳을 같이 갱신할 것.
const PROSE_CLASS = `prose prose-lg max-w-none
 prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-28
 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border
 prose-h3:text-xl prose-h3:mt-8 prose-h3:text-foreground
 prose-p:text-muted-foreground prose-p:leading-8
 prose-strong:text-foreground prose-strong:font-bold
 prose-a:text-link prose-a:underline prose-a:underline-offset-4 prose-a:font-semibold
 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground
 prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-link prose-table:text-sm`;

interface GuideSupplementProps {
  slug: string;
}

export default function GuideSupplement({ slug }: GuideSupplementProps) {
  const html = guideSupplements[slug];
  if (!html) return null;

  return (
    <section
      data-msy-module="guide-supplement"
      aria-label="가이드 보강 섹션"
      className="mt-4 mb-12"
    >
      <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
