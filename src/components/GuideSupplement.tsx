"use client";

// 가이드 보강 섹션 (2026-09-12 S3-4). src/lib/guides/supplements.ts 에 슬러그 항목이 있을 때만
// 본문과 같은 prose 스타일로 렌더한다.
// ★ 배치 규칙: guides/layout.tsx 에서 PageFooterAds(레이아웃 푸터 광고 3개: HomeTopAd·InArticleAd·쿠팡) **뒤**에만.
//   page.tsx 에 두면 그 아래 오는 레이아웃 푸터 광고를 밀어낸다(2026-08-16 "광고 위 UI 삽입" 수익 사고 규칙 —
//   2026-09-12 첫 구현이 page.tsx 의 HomeTopAd 아래에 두었다가 로컬 빌드 HTML 순서 검사에서 잡혀 layout 으로 옮김).
// - layout 에는 params 가 없어 usePathname 으로 현재 슬러그를 판별한다(CompanyRelatedJobs 와 같은 패턴).
// - 데이터는 서버(layout)가 넘긴 map 만 받는다 — supplements.ts(봉급표 상수 import)는 여기서 import 금지(클라 번들 오염).
// - SSR 에도 포함(usePathname 은 서버 렌더에서도 동작) → 크롤러가 본문·FAQ 를 본다.
// data-msy-module: layout.tsx 의 [data-msy-module] 클릭 위임 계측(guide_cta_click, position=모듈명)에 잡힌다.
import { usePathname } from "next/navigation";

// GuidePageClient.tsx 의 PROSE_CLASS 와 동일 문자열(복제). 본문 prose 스타일을 바꾸면 두 곳을 같이 갱신할 것.
const PROSE_CLASS = `prose prose-lg max-w-none
 prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-28
 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border
 prose-h3:text-xl prose-h3:mt-8 prose-h3:text-foreground
 prose-p:text-muted-foreground prose-p:leading-8
 prose-strong:text-foreground prose-strong:font-bold
 prose-a:text-link prose-a:underline prose-a:underline-offset-4 prose-a:font-semibold
 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground
 prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-link prose-table:text-sm`;

const MAX_WIDTH_CLASS = { "3xl": "max-w-3xl", "4xl": "max-w-4xl" } as const;

interface GuideSupplementProps {
  /** slug → HTML. 서버 layout 이 supplements.ts 에서 넘긴다. */
  map: Record<string, string>;
  /** 소속 layout 의 PageFooterAds 폭과 맞춘다(guides 는 3xl) */
  maxWidth?: keyof typeof MAX_WIDTH_CLASS;
}

/** /guides/<slug> 에서 slug 를 뽑는다. /guides·/guides/category/* 는 null. */
export function guideSlugFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  const m = /^\/guides\/([^/]+)\/?$/.exec(pathname);
  if (!m || m[1] === "category") return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

export default function GuideSupplement({ map, maxWidth = "3xl" }: GuideSupplementProps) {
  const pathname = usePathname();
  const slug = guideSlugFromPathname(pathname);
  const html = slug ? map[slug] : undefined;
  if (!html) return null;

  return (
    <section
      data-msy-module="guide-supplement"
      aria-label="가이드 보강 섹션"
      className={`${MAX_WIDTH_CLASS[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-12`}
    >
      <div className={PROSE_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
