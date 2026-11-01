"use client";

// 영문 페이지의 '다음 단계' 링크 — src/app/en/layout.tsx 의 **맨 끝**(EnglishPageExtras 의 PageFooterAds·공유 fallback 뒤)에만.
// 2026-10-19(d1d5ef80c)에 /en/tools/<slug>·/en/help·/en/about 본문(EnglishPageExtras 광고 위)에 들어간 링크 섹션·문장을
// 문구 그대로 옮겼다(B12·P2UX-01, 운영자 승인 2026-11-01 — 2026-08-16 '광고 위 UI 삽입 금지' 규칙).
// - layout 에는 params 가 없어 usePathname 으로 고른다(CalcNewsNote·TopicNextSteps 와 같은 패턴). usePathname 은 서버 렌더에서도
//   동작하므로 프리렌더 HTML 에 링크가 그대로 들어간다. EnglishPageExtras(광고·공유)는 하이드레이션 뒤에만 그려지므로
//   SSR HTML 에서는 본문 바로 뒤, 그 뒤에는 광고·공유 아래에 놓인다 — 광고가 이 상자 위로 올라온다.
// - 화면 문구는 영어만(englishFunContentLinks.test.ts 가 한글 혼입을 막는다). 맵에 없는 경로·없는 도구 slug 는 null.
// - nav 가 아니라 section 이다: 본문 링크로 집계되는 자리(qa-page-quality analyzeHtml)를 옮기기 전과 같게 둔다.
import { usePathname } from "next/navigation";
import Link from "@/components/AppLink";
import EnglishContentLinks from "./EnglishContentLinks";
import { ENGLISH_TOOL_READING } from "@/lib/englishContentLinks";
import type { EnglishToolSlug } from "@/lib/englishTools";

const WRAPPER = "ms-page min-w-0 pb-16 text-foreground";
const CARD = "rounded-2xl border border-border bg-background p-5 sm:p-7";
const LINK = "text-primary underline";

/** /en/tools/<slug> 에서 읽기 목록이 있는 도구 slug 만 돌려준다(없는 slug·하위 경로는 null). */
export function englishToolSlugFromPath(pathname: string): EnglishToolSlug | null {
  const slug = /^\/en\/tools\/([^/]+)$/.exec(pathname)?.[1];
  return slug && Object.prototype.hasOwnProperty.call(ENGLISH_TOOL_READING, slug) ? (slug as EnglishToolSlug) : null;
}

export default function EnglishAfterAdsLinks() {
  const raw = usePathname() ?? "";
  const pathname = raw.length > 1 ? raw.replace(/\/+$/, "") : raw;

  const slug = englishToolSlugFromPath(pathname);
  if (slug) {
    const reading = ENGLISH_TOOL_READING[slug];
    return (
      <div className={WRAPPER}>
        <section aria-labelledby="tool-next-question" className={CARD}>
          <h2 id="tool-next-question" className="text-2xl font-bold">Check the next part of your plan</h2>
          <EnglishContentLinks items={[reading.context, ...reading.tools]} />
          <div className="mt-5">
            <Link href="/en/help" className="inline-flex min-h-11 items-center font-semibold text-primary underline">Methods, sources and help</Link>
          </div>
        </section>
      </div>
    );
  }

  if (pathname === "/en/help") {
    return (
      <div className={WRAPPER}>
        <section aria-label="Related pages" className={CARD}>
          <p>Changing jobs or preparing a settlement? Use the <Link href="/en/season" className={LINK}>pay and tax checklist</Link> to distinguish the income year, payment date and filing step.</p>
          <p className="mt-3">The <Link href="/en/calculators" className={LINK}>calculator overview</Link> separates payroll, tax and general arithmetic. The <Link href="/en/guides" className={LINK}>English guides</Link> explain the documents and assumptions to check before using those results.</p>
          <p className="mt-3">The <Link href="/en/terms" className={LINK}>terms of use</Link> explain the limits of these reference estimates and the conditions for quoting site content.</p>
          <p className="mt-3">Read the <Link href="/en/privacy" className={LINK}>privacy policy</Link> for the data handling described here. <Link href="/en/about" className={LINK}>About Moneysalary</Link> explains who maintains the methods and reviews corrections.</p>
        </section>
      </div>
    );
  }

  if (pathname === "/en/about") {
    return (
      <div className={WRAPPER}>
        <section aria-label="Related pages" className={`${CARD} max-w-3xl`}>
          <p className="text-sm leading-7 text-muted-foreground">Choose the model you need in the <Link href="/en/calculators" className={LINK}>calculator overview</Link>, or read the <Link href="/en/guides" className={LINK}>English guides</Link> for the context behind a calculation.</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">The <Link href="/en/terms" className={LINK}>terms of use</Link> explain the service limits and permitted use of its content.</p>
        </section>
      </div>
    );
  }

  return null;
}
