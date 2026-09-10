"use client";

import { Calendar, Clock, ChevronLeft, Calculator, ArrowRight, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import Link from "@/components/AppLink";
import { useEffect, useRef, useState } from "react";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";
import type { Guide } from "@/lib/guidesData";
import { hubSlugByCategoryId } from "@/lib/guideCategories";
import { guideSearchHref } from "@/lib/guideDiscovery";
import { formatGuideDate, getGuideModifiedDate } from "@/lib/guideDates";
import { prepareGuideHeadings } from "@/lib/guideHeadings";
import TableOfContents from "@/components/guides/TableOfContents";
import CoupangBanner from "@/components/CoupangBanner";
import { GuideMidAd, InArticleAd, MultiplexAd, SidebarAd } from "@/components/AdPlacement";
import { OfferSlot } from "@/components/affiliate/AffiliateSlot";

// 부활 팩 ④ (운영자 승인 2026-08-31) — 신용·대출 인텐트 가이드에만 CPA 오퍼 슬롯 배치.
// 오퍼가 전부 inactive면 무렌더(외관 불변). 인텐트 비정합 주제(노동법·병사 등) 미배치 원칙.
const OFFER_GUIDE_SLUGS = new Set([
  "credit-score-up-2026",
  "credit-score-management",
  "credit-score-850-strategy-2026",
  "loan-types-comparison-2026",
  "minus-loan-vs-credit-loan-2026",
  "personal-loan-vs-debt-consolidation",
  "first-home-buyer-loan",
  "didimdol-newborn-special-loan-2026",
  "newborn-special-loan-application-2026",
  "newlywed-loan-limit-2x-2026",
  "auto-loan-vs-lease-2026",
  "jeonse-scam-prevention",
  "jeonse-vs-monthly-rent-2026",
]);
import Breadcrumbs from "@/components/Breadcrumbs";

interface GuidePageClientProps {
 guide: Guide;
 relatedGuides: Guide[];
}

// 본문 HTML을 <h2 시작 위치에서만 분할 — 태그 중간이 잘리지 않도록 보장.
// h2가 2개 미만이면 분할하지 않고, 본문 길이에 비례해 2~3조각으로 나눠
// 조각 사이에 광고를 배치한다 (1/3 지점 GuideMidAd, 2/3 지점 InArticleAd).
function splitContentByH2(html: string): string[] {
 const h2Pattern = /<h2[\s>]/gi;
 const indices: number[] = [];
 let match: RegExpExecArray | null;
 while ((match = h2Pattern.exec(html)) !== null) indices.push(match.index);

 // h2 2개 미만 — 분할하지 않음
 if (indices.length < 2) return [html];

 // 본문이 h2로 시작하면 그 위치는 분할점에서 제외 (빈 조각 방지)
 const candidates = indices.filter((i) => i > 0);
 if (candidates.length === 0) return [html];

 const nearest = (target: number, pool: number[]) =>
 pool.reduce((best, cur) =>
 Math.abs(cur - target) < Math.abs(best - target) ? cur : best
 );

 // 짧은 글은 2분할(중간 1곳), 긴 글은 3분할(1/3·2/3 지점)
 if (html.length < 4000 || candidates.length === 1) {
 const p = nearest(html.length / 2, candidates);
 return [html.slice(0, p), html.slice(p)];
 }

 const p1 = nearest(html.length / 3, candidates);
 const after = candidates.filter((i) => i > p1);
 if (after.length === 0) return [html.slice(0, p1), html.slice(p1)];

 const p2 = nearest((html.length * 2) / 3, after);
 return [html.slice(0, p1), html.slice(p1, p2), html.slice(p2)];
}

// 분할된 본문 조각마다 동일하게 적용하는 prose 스타일
const PROSE_CLASS = `prose prose-lg max-w-none
 prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-28
 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-border
 prose-h3:text-xl prose-h3:mt-8 prose-h3:text-foreground
 prose-p:text-muted-foreground prose-p:leading-8
 prose-strong:text-foreground prose-strong:font-bold
 prose-a:text-link prose-a:underline prose-a:underline-offset-4 prose-a:font-semibold
 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-secondary/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-foreground
 prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-link prose-table:text-sm`;

export default function GuidePageClient({ guide, relatedGuides }: GuidePageClientProps) {
 // 읽기 진행 바 — framer-motion(useScroll/useSpring, 청크 40KB br)을 passive scroll + rAF 로 대체 (2026-09-11 번들 감사).
 // 가이드 341쪽이 3px 바 하나 때문에 framer 청크를 첫 로드에 실었다. CSS transition 이 스프링 감쇠를 대신한다.
 const progressRef = useRef<HTMLDivElement | null>(null);

 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 // 진행 바 갱신 — passive scroll + rAF (framer useScroll/useSpring 대체). mounted 뒤에만 DOM 이 있다.
 useEffect(() => {
 if (!mounted) return;
 const el = progressRef.current;
 if (!el) return;
 let raf = 0;
 const update = () => {
 raf = 0;
 const doc = document.documentElement;
 const max = doc.scrollHeight - window.innerHeight;
 const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
 el.style.transform = `scaleX(${p})`;
 };
 const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
 update();
 window.addEventListener("scroll", onScroll, { passive: true });
 window.addEventListener("resize", onScroll);
 return () => {
 window.removeEventListener("scroll", onScroll);
 window.removeEventListener("resize", onScroll);
 if (raf) cancelAnimationFrame(raf);
 };
 }, [mounted]);

 // Calculate reading time
 const readingTime = Math.ceil(guide.content.length / 1000);

 // "/salary"는 인덱스 라우트가 없어 404였음(가이드 29편 CTA) — 홈이 계산기 본체 (2026-07-06 정정)
 const relatedCalculator =
 guide.category === "연봉"
 ? { name: "연봉 계산기", href: "/" }
 : guide.category === "세금"
 ? { name: "연말정산 계산기", href: "/year-end-tax" }
 : guide.category === "커리어"
 ? { name: "커리어 플래너", href: "/pro/career-planner" }
 : { name: "금융 계산기", href: "/" };

 // 본문을 h2 경계로 2~3분할해 사이에 광고 배치 (h2 2개 미만이면 분할 없음)
 const articleContent = prepareGuideHeadings(guide.content, splitContentByH2(guide.content));
 const segments = articleContent.segments;

 return (
 <main className="min-h-screen bg-canvas relative selection:bg-primary/20">
 {/* Reading Progress Bar — 클라이언트 전용(useScroll). mounted 게이트는 이 요소에만 적용,
 본문은 정적 HTML에 즉시 렌더되어 SEO 색인에 포함된다. */}
 {mounted && (
 <div
 ref={progressRef}
 aria-hidden="true"
 className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-[#0145F2] to-primary/80 z-50 origin-left transition-transform duration-150 ease-out"
 style={{ transform: "scaleX(0)" }}
 />
 )}

 {/* Hero Section */}
 <div className="relative border-b border-border bg-card pt-24 pb-10 sm:pb-12 text-center">

 {/* 제목과 본문은 hydration이나 등장 애니메이션을 기다리지 않고 표시한다. */}
 <div
 className="relative max-w-4xl mx-auto px-4 mt-4"
 >
 <Breadcrumbs
 path={`/guides/${guide.slug}`}
 leafName={guide.title}
 align="center"
 className="mb-5"
 />
 {/* 카테고리 배지 → 허브 링크 (G9 메쉬, 2026-08-23): 342편 전부에서
 /guides/category/* 인바운드 생성. 허브 미등재 카테고리는 기존 배지 유지 */}
 {hubSlugByCategoryId[guide.category] ? (
 <Link
 href={`/guides/category/${hubSlugByCategoryId[guide.category]}`}
 className="ms-button ms-button-secondary mb-6 text-sm"
 >
 <span className="w-2 h-2 rounded-full bg-primary/50" />
 {guide.category} 가이드 전체 보기
 </Link>
 ) : (
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
 <span className="w-2 h-2 rounded-full bg-primary/50" />
 {guide.category} 가이드
 </div>
 )}
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight break-keep">
 {guide.title}
 </h1>
 <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
 <div className="flex flex-wrap items-center justify-center gap-2">
 <Calendar className="w-4 h-4" />
 <span>발행 <time dateTime={guide.publishedDate}>{formatGuideDate(guide.publishedDate)}</time></span>
 {getGuideModifiedDate(guide) !== guide.publishedDate && (
 <span>수정 <time dateTime={getGuideModifiedDate(guide)}>{formatGuideDate(getGuideModifiedDate(guide))}</time></span>
 )}
 </div>
 <div className="w-1 h-1 rounded-full bg-slate-300" />
 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4" />
 <span>{readingTime}분 분량</span>
 </div>
 <div className="w-1 h-1 rounded-full bg-slate-300" />
 {/* 상단 컴팩트 공유 — 본문 하단 ShareButtons(대표)와 별개 보조 UI */}
 <ShareButtons
 variant="compact"
 title={guide.title}
 contentType="guide"
 />
 <FavoritesButton
 variant="icon"
 path={`/guides/${guide.slug}`}
 title={guide.title}
 />
 </div>
 </div>
 </div>

 <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-6 relative z-20">
 <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

 {/* Sidebar Left (TOC) - Desktop Only */}
 <aside className="hidden xl:block w-[220px] flex-shrink-0">
 <div className="sticky top-24">
 <div className="ms-panel"><h2 className="mb-3 text-sm font-semibold text-foreground">이 글에서 확인할 내용</h2><TableOfContents headings={articleContent.headings} /></div>
 </div>
 </aside>

 {/* Main Content */}
 <article
 className="flex-1 min-w-0" // prevent overflow
 >
 <div className="ms-surface p-5 sm:p-8 xl:p-10">

 {/* Smart Summary (TL;DR) — guide-tldr/faq-answer: page.tsx speakable 스키마 셀렉터와 일치 */}
 <div className="guide-tldr mb-8 rounded-xl bg-secondary p-5 border border-border">
 <h2 className="flex items-center gap-2 font-semibold text-lg text-foreground mb-3">
 <Lightbulb className="w-5 h-5" />
 핵심 요약
 </h2>
 <p className="faq-answer text-muted-foreground leading-relaxed">
 {guide.description}
 </p>
 </div>

 {articleContent.headings.length > 0 && <details className="mb-8 rounded-xl border border-border bg-card p-4 xl:hidden">
 <summary className="min-h-11 cursor-pointer py-3 font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">이 글의 목차 · {articleContent.headings.length}개 항목</summary>
 <TableOfContents headings={articleContent.headings} />
 </details>}

 {/* 분할되지 않는 짧은 글만 본문 앞에 광고 — 분할 시에는 1/3 지점으로 이동 */}
 {segments.length === 1 && <GuideMidAd />}

 <div
 className={PROSE_CLASS}
 dangerouslySetInnerHTML={{ __html: segments[0] }}
 />

 {segments.length >= 2 && (
 <>
 {/* 본문 1/3 지점 — 같은 슬롯은 페이지당 1회만 노출되므로 여기 단 한 번 */}
 <GuideMidAd />
 <div
 className={PROSE_CLASS}
 dangerouslySetInnerHTML={{ __html: segments[1] }}
 />
 </>
 )}

 {segments.length >= 3 && (
 <>
 {/* 본문 2/3 지점 */}
 <InArticleAd />
 <div
 className={PROSE_CLASS}
 dangerouslySetInnerHTML={{ __html: segments[2] }}
 />
 </>
 )}

 {/* 편집 기준과 글별 출처를 구분한다. */}
 <div className="mt-10 p-5 bg-secondary/30 rounded-2xl border border-border/50">
 <div className="flex items-start gap-3">
 <BookOpen className="h-5 w-5 shrink-0 text-link" aria-hidden="true" />
 <div className="flex-1 text-sm">
 <p className="font-bold text-foreground mb-1">
 이 글의 기준과 출처 확인
 </p>
 <p className="text-muted-foreground leading-relaxed">
 적용 연도·대상과 출처는 본문에 표시된 조건을 확인해 주세요.
 마지막 내용 수정:{" "}
 <strong className="text-foreground">
 <time dateTime={getGuideModifiedDate(guide)}>{formatGuideDate(getGuideModifiedDate(guide))}</time>
 </strong>
 </p>
 <p className="text-xs text-muted-foreground mt-2">
 작성과 수정 과정은{" "}
 <Link href="/about" className="inline-flex min-h-11 items-center text-link font-semibold underline underline-offset-4">
 편집·검토 기준
 </Link>
 에서 확인할 수 있습니다. 개인별 적용 여부는 본문의 공식 자료와 담당 기관에서 확인해 주세요.
 </p>
 </div>
 </div>
 </div>

 {/* 3분할 글은 본문 2/3 지점에서 이미 노출(동일 슬롯 dedup) — 그 외에만 본문 끝 배치 */}
 {segments.length < 3 && <InArticleAd />}

 {/* 모바일은 banner(320×100)로 축소 — portrait(320×480)는 본문 흐름 차단·이탈 유발 */}
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "large-portrait" }}
 />

 {/* 본문 끝 멀티플렉스(관련 콘텐츠형) — 콘솔 유닛 발급 후 env 추가 시 자동 활성화 */}
 <MultiplexAd />

 {/* 부활 팩 ④ (운영자 승인 2026-08-31): 신용·대출 가이드 한정 CPA 오퍼 — 전 광고 아래 */}
 {OFFER_GUIDE_SLUGS.has(guide.slug) && <OfferSlot vertical="loan" />}

 {/* Tags */}
 <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-2">
 {guide.tags.map((tag) => (
 <Link key={tag} href={guideSearchHref(tag)} rel="nofollow" className="ms-button ms-button-secondary text-sm">
 <span>
 #{tag}
 </span>
 </Link>
 ))}
 </div>
 </div>

 {/* Navigation Footer */}
 <div className="mt-8 duotone-card p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
 <Link
 href="/guides"
 className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
 >
 <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
 <ChevronLeft className="w-5 h-5" />
 </div>
 <span className="font-bold">목록으로 돌아가기</span>
 </Link>

 <div className="flex items-center gap-4">
 <span className="text-sm font-medium text-muted-foreground">유익하셨나요? 공유하기</span>
 <ShareButtons
 title={guide.title}
 description={`${guide.category} 가이드 | Moneysalary`}
 className="justify-end"
 />
 </div>
 </div>

 {/* Related Guides Section */}
 <div className="mt-16">
 <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
 <Sparkles className="w-6 h-6 text-primary" />
 함께 읽으면 좋은 글
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {relatedGuides.map((relatedGuide) => (
 <Link
 key={relatedGuide.slug}
 href={`/guides/${relatedGuide.slug}`}
 className="ms-surface ms-interactive group flex flex-col h-full overflow-hidden"
 >
 <div className="p-6 flex flex-col flex-grow">
 <span className="text-xs font-bold text-primary mb-2">{relatedGuide.category}</span>
 <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
 {relatedGuide.title}
 </h4>
 <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
 {relatedGuide.description}
 </p>
 <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mt-auto">
 <span>읽기</span>
 <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </article>

 {/* Sidebar Right (Widgets) */}
 <aside className="w-full lg:w-[320px] space-y-6 flex-shrink-0">
 {/* Related Calculator Card */}
 {/* 스택 전체 sticky 해제 — 카드 2장+300x600 합산 ~1,100px 가 노트북 뷰포트(~950px)를 넘어 광고가 절반 이상 잘려 Active View 50% 미달이던 문제. 광고 래퍼만 sticky(아래) — 전면 최적화 (운영자 지시 2026-09-02) */}
 <div className="space-y-6 lg:h-full">
 <div className="duotone-card p-6 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0" />
 <div className="relative z-10">
 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
 <Calculator className="w-6 h-6" />
 </div>
 <h3 className="text-lg font-bold mb-2">
 내 조건으로 계산하기
 </h3>
 <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
 <strong>{relatedCalculator.name}</strong>에 내 조건을 입력하고 예상 결과와 적용 가정을 확인하세요.
 </p>
 <Link
 href={relatedCalculator.href}
 className="ms-button ms-button-primary w-full"
 >
 계산기 바로가기 <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </div>

 {/* 계산기 CTA */}
 <div className="duotone-card p-6">
 <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
 <BookOpen className="w-5 h-5 text-primary" />
 더 똑똑해지는 법
 </h3>
 <p className="text-muted-foreground text-sm mb-4">
 가이드를 읽었다면, 이제 내 연봉으로 직접 확인해 볼 차례입니다.
 </p>
 <Link
 href="/"
 className="block w-full py-3 bg-secondary text-foreground font-bold rounded-xl text-center hover:bg-foreground hover:text-background transition-colors"
 >
 내 연봉 실수령액 계산하기
 </Link>
 </div>

 {/* 데스크톱 전용 사이드바 광고 - 모바일에선 본문 끝 광고로 충분 */}
 <div className="hidden lg:block lg:sticky lg:top-24">
 <SidebarAd />
 </div>
 </div>
 </aside>
 </div>
 </div>
 </main>
 );
}
