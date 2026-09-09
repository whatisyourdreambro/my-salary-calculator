// src/components/tool/ToolHubPage.tsx
// /tools/{finance,real-estate,life} 섹션 허브 공용 렌더러.
// /tools/page.tsx(인덱스)의 시각 구조를 그대로 따르되 3중 복제를 피하려고 분리했다.
//
// 광고 배치 (운영자 승인 2026-09-01 — 불변 규칙 1):
//   /tools 인덱스와 동일 조합을 복제한다.
//   - MultiplexAd            : layout 체인 미사용 슬롯이라 순증
//   - CoupangBanner rectangle: tools/layout.tsx 푸터가 leaderboard/mobile-banner 를
//                              쓰므로 사이즈를 차별화해야 코어 dedup 에 죽지 않는다
//                              (2026-08-31 부활 팩 ② 와 동일한 사유).
// 신규 UI 는 전부 광고 위가 아니라 광고 앞 본문에만 둔다 (2026-08-16 수익 급락 사건 규칙).

import Link from "@/components/AppLink";
import { ChevronRight } from "lucide-react";
import CoupangBanner from "@/components/CoupangBanner";
import { GuideMidAd, MultiplexAd } from "@/components/AdPlacement";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, itemListLd } from "@/lib/structuredData";

export type HubItem = {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  isNew?: boolean;
  isHot?: boolean;
};

export type HubCategory = {
  title: string;
  items: HubItem[];
};

export interface ToolHubPageProps {
  /** 라우트 경로 — breadcrumb·ItemList 에 사용 */
  path: string;
  /** breadcrumb 마지막 단계 표기 */
  leafName: string;
  /** Hero 상단 뱃지 문구 */
  badge: string;
  badgeIcon: React.ElementType;
  /** Hero h1 — 강조 부분과 분리 */
  headingPrefix: string;
  headingAccent: string;
  headingSuffix?: string;
  /** Hero 설명문 */
  lead: string;
  /** [값, 라벨] 3쌍 */
  stats: [string, string][];
  categories: HubCategory[];
  /** 하단 SEO 블록 */
  seoHeading: string;
  seoBody: string;
  /** 상위/형제 허브로 되돌아가는 링크 */
  crossLinks?: { label: string; href: string }[];
}

export default function ToolHubPage({
  path,
  leafName,
  badge,
  badgeIcon: BadgeIcon,
  headingPrefix,
  headingAccent,
  headingSuffix,
  lead,
  stats,
  categories,
  seoHeading,
  seoBody,
  crossLinks = [],
}: ToolHubPageProps) {
  const listItems = categories
    .flatMap((c) => c.items)
    .map((item) => ({ name: item.title, url: item.href }));

  return (
    <div className="min-h-screen bg-background pb-16 pt-24 text-foreground sm:pt-28">
      <JsonLd
        data={[
          itemListLd({ name: leafName, items: listItems }),
          autoBreadcrumbLd(path, { leafName }),
        ]}
      />
      <div className="ms-page max-w-5xl">
        {/* Hero */}
        <header className="mb-8 border-b border-border pb-8 sm:mb-10">
          <div className="ms-eyebrow mb-4 inline-flex items-center gap-2">
            <BadgeIcon size={14} aria-hidden="true" /> {badge}
          </div>
          <h1 className="ms-title mb-4">
            {headingPrefix} <span className="text-link">{headingAccent}</span>
            {headingSuffix ? ` ${headingSuffix}` : ""}
          </h1>
          <p className="ms-description max-w-3xl">{lead}</p>
          {stats.length > 0 && <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {stats.map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">{val}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>}
        </header>
        <nav aria-label="계산기 주제 바로가기" className="mb-8 flex flex-wrap gap-2">
          {categories.map((category, index) => <a key={category.title} href={`#tool-category-${index}`} className="ms-button ms-button-secondary text-sm">{category.title}<span className="text-muted-foreground">{category.items.length}</span></a>)}
        </nav>

        {/* Categories */}
        {categories.map((cat, ci) => (
          <section key={cat.title} id={`tool-category-${ci}`} className="mb-10 scroll-mt-24" aria-labelledby={`tool-heading-${ci}`}>
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground"
                aria-hidden="true"
              >
                <span className="text-sm font-semibold">{ci + 1}</span>
              </div>
              <h2 id={`tool-heading-${ci}`} className="text-xl font-bold text-foreground">{cat.title}</h2>
              <span className="text-sm text-muted-foreground">{cat.items.length}개</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ms-surface ms-interactive group flex items-start gap-3 p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-link">
                    <item.icon
                      size={18}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-semibold text-foreground">
                        {item.title}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="mt-1.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
            {/* 2번째 카테고리 뒤 섹션 경계 중간 광고 — GUIDE_MID 는 세 허브·tools/layout(IN_ARTICLE+HOME_TOP) 미사용 슬롯 — 전면 최적화 (운영자 지시 2026-09-02) */}
            {ci === 1 && (
              <div className="mt-10">
                <GuideMidAd />
              </div>
            )}
          </section>
        ))}

        {/* 다른 허브로 이동 — 3단 구조(인덱스→허브→도구) 내부링크 */}
        {crossLinks.length > 0 && (
          <div className="mb-14 flex flex-wrap gap-3">
            {crossLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="ms-button ms-button-secondary text-sm"
              >
                {l.label}
                <ChevronRight size={14} className="text-faint-blue" />
              </Link>
            ))}
          </div>
        )}

        {/* 목록 그리드 하단 멀티플렉스 — env 미설정 시 렌더 안 함 */}
        <div className="mt-16">
          <MultiplexAd />
        </div>

        {/* 쿠팡 — layout 푸터(leaderboard/mobile-banner)와 사이즈 차별화 필수 */}
        <div className="mt-16">
          <CoupangBanner responsive={{ mobile: "rectangle", desktop: "rectangle" }} />
        </div>

        {/* SEO Bottom Content */}
        <div className="ms-surface ms-panel mt-12">
          <h2 className="mb-3 text-lg font-bold text-foreground">{seoHeading}</h2>
          <p className="text-base leading-7 text-muted-foreground">{seoBody}</p>
        </div>
      </div>
    </div>
  );
}
