"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "@/components/AppLink";
import { Search, ArrowRight, X, Sparkles } from "lucide-react";
import { CalcResultAd, Display2Ad, GuideMidAd, HomeTopAd, InArticleAd } from "@/components/AdPlacement";

// 그룹 사이 광고 — 종전에는 3번째 그룹 뒤 GuideMidAd 하나뿐이라 모바일 첫 광고가 12,541px(14.9화면) 아래였고
// 문서 66,000px 에 광고 1개였다. 서로 다른 슬롯 5개를 그룹 경계에 분산한다(2026-09-11 운영자 승인).
// HomeTop·InArticle 은 calc/layout 하단 사본이 dedup 으로 죽어 유닛 수 순증은 Display2·CalcResult 2개뿐.
const GROUP_ADS: Record<number, JSX.Element> = {
  2: <GuideMidAd />,
  5: <InArticleAd />,
  8: <Display2Ad />,
  11: <CalcResultAd />,
};
// 첫 그룹(시즌·전용, 카드 30장)이 길어 그룹 뒤 광고는 6,109px 였다 — 첫 그룹은 6번째 카드 뒤에 삽입 (모바일 약 1.5화면)
const FIRST_GROUP_AD_AFTER = 6;
const FIRST_GROUP_AD = <HomeTopAd />;

type CalcItem = { slug: string; href?: string; title: string; description: string; category: string; publishedAt?: string };
type Grouped = { id: string; label: string; items: CalcItem[] };
type Featured = { href: string; title: string; description: string; season: string };
type DirectoryItem = { href: string; title: string; description: string; detail: string; publishedAt?: string };

export default function CalcIndexClient({ grouped, featured }: { grouped: Grouped[]; featured: Featured[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expandedOnly, setExpandedOnly] = useState(false);
  const groups = useMemo(() => {
    const seen = new Set<string>();
    const unique = (items: DirectoryItem[]) => items.filter(item => {
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
    return [
      { id: "featured", label: "시즌·전용 계산기", items: unique(featured.map(item => ({ ...item, detail: item.season }))) },
      ...grouped.map(group => ({ ...group, items: unique(group.items.map(item => ({ ...item, href: item.href ?? `/calc/${item.slug}`, detail: group.label }))) })),
    ];
  }, [grouped, featured]);
  const allItems = groups.flatMap(group => group.items);
  const expandedCount = allItems.filter(item => item.publishedAt === "2026-09-10").length;
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = groups.filter(group => category === "all" || group.id === category).map(group => ({
    ...group,
    items: group.items.filter(item => (!expandedOnly || item.publishedAt === "2026-09-10") && words.every(word => `${item.title} ${item.description} ${item.detail}`.toLowerCase().includes(word))),
  })).filter(group => group.items.length);
  const count = visible.reduce((total, group) => total + group.items.length, 0);
  // 그룹 광고는 필터 없는 기본 목록(검색 랜딩 상태)에서만 — 검색어 입력·분야 전환마다 그룹 순서가 바뀌면
  // 광고 유닛이 재마운트돼 요청이 반복된다(리뷰 지적 2026-09-11). 필터 상태에서는 하단 Multiplex 만 남는다.
  const showGroupAds = words.length === 0 && category === "all" && !expandedOnly;
  const reset = () => { setQuery(""); setCategory("all"); setExpandedOnly(false); };

  return (
    <div>
      <section aria-label="계산기 찾기" className="sticky top-[calc(var(--header-height)+0.5rem)] z-30 mb-8 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label="계산기 검색" aria-controls="calculator-directory-results"
            placeholder={`계산기 ${allItems.length}개에서 검색 (예: 대환대출, 생활비)`}
            className="ms-field min-h-12 pl-12 pr-12 text-base [&::-webkit-search-cancel-button]:appearance-none" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기" className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary"><X aria-hidden="true" size={18} /></button>}
        </div>
        <div role="group" aria-label="계산기 분야" className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {[{ id: "all", label: "전체", count: allItems.length }, ...groups.map(group => ({ ...group, count: group.items.length }))].map(item => (
            <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} aria-controls="calculator-directory-results"
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors ${category === item.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
              {item.label}<span className="tabular-nums">{item.count}</span>
            </button>
          ))}
        </div>
        {expandedCount > 0 && <button type="button" aria-pressed={expandedOnly} onClick={() => setExpandedOnly(value => !value)} aria-controls="calculator-directory-results"
          className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${expandedOnly ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}>
          <Sparkles size={16} aria-hidden="true" />추가된 계산기 {expandedCount}개만 보기
        </button>}
      </section>

      <p role="status" className="mb-6 text-sm text-muted-foreground">{query.trim() ? `“${query.trim()}” 검색 결과` : "선택한 조건의 계산기"} <strong className="font-semibold text-foreground tabular-nums">{count}개</strong></p>
      <div id="calculator-directory-results" data-msy-module="calculator-directory">
        {count === 0 && <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">조건에 맞는 계산기가 없어요</h2>
          <p className="mt-3 text-base text-muted-foreground">검색어를 짧게 바꾸거나 분야 선택을 해제해 보세요.</p>
          <button type="button" onClick={reset} className="ms-button ms-button-primary mt-5">모든 계산기 보기</button>
        </div>}
        {visible.map((group, index) => <Fragment key={group.id}>
          <section id={`cat-${group.id}`} aria-labelledby={`heading-${group.id}`} className="mb-12 scroll-mt-64">
            <div className="mb-5 flex items-center gap-3">
              <h2 id={`heading-${group.id}`} className="text-2xl font-bold tracking-tight text-foreground">{group.label}</h2>
              <span className="rounded-lg bg-secondary px-2.5 py-1 text-sm font-semibold text-muted-foreground tabular-nums">{group.items.length}</span>
            </div>
            {(index === 0 && group.items.length > FIRST_GROUP_AD_AFTER
              ? [group.items.slice(0, FIRST_GROUP_AD_AFTER), group.items.slice(FIRST_GROUP_AD_AFTER)]
              : [group.items]
            ).map((chunk, chunkIndex) => <Fragment key={chunkIndex}>
              {showGroupAds && chunkIndex === 1 && <div className="my-8 border-y border-border py-6">{FIRST_GROUP_AD}</div>}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {chunk.map(item => <Link key={item.href} href={item.href} className="group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5 text-foreground transition-colors hover:border-primary focus-visible:outline-offset-4">
                <p className="mb-3 text-xs font-semibold text-link">{item.detail}</p>
                <h3 className="text-lg font-semibold leading-snug tracking-tight group-hover:text-link">{item.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-link">계산해 보기<ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
              </Link>)}
              </div>
            </Fragment>)}
          </section>
          {showGroupAds && GROUP_ADS[index] && <div className="my-12 border-y border-border py-8">{GROUP_ADS[index]}</div>}
        </Fragment>)}
      </div>
    </div>
  );
}
