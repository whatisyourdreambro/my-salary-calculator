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
import { MultiplexAd } from "@/components/AdPlacement";
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

function TagBadge({ label, type }: { label: string; type: "new" | "hot" }) {
  return (
    <span
      className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
        type === "new"
          ? "bg-electric text-white"
          : "bg-electric-10 text-electric border border-electric/20"
      }`}
      aria-label={type === "new" ? "신규" : "인기"}
    >
      {label}
    </span>
  );
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
    <main className="min-h-screen bg-white pb-24 pt-28 px-4 font-sans">
      <JsonLd
        data={[
          itemListLd({ name: leafName, items: listItems }),
          autoBreadcrumbLd(path, { leafName }),
        ]}
      />
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 pb-12 border-b border-canvas">
          <div className="inline-flex items-center gap-2 bg-electric-10 text-electric border border-electric/20 text-xs font-black px-4 py-2 rounded-md uppercase tracking-widest mb-6">
            <BadgeIcon size={14} aria-hidden="true" /> {badge}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-navy tracking-tight mb-4">
            {headingPrefix} <span className="text-electric">{headingAccent}</span>
            {headingSuffix ? ` ${headingSuffix}` : ""}
          </h1>
          <p className="text-faint-blue font-medium text-lg max-w-2xl mx-auto">{lead}</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-8">
            {stats.map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-electric tabular-nums">{val}</p>
                <p className="text-xs text-faint-blue font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.map((cat, ci) => (
          <div key={cat.title} className="mb-14">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-electric">
              <div
                className="w-8 h-8 bg-electric rounded-md flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white font-black text-sm">{ci + 1}</span>
              </div>
              <h2 className="text-xl font-black text-navy">{cat.title}</h2>
              <span className="text-xs text-faint-blue font-medium">{cat.items.length}개</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-4 p-4 border border-canvas rounded-xl hover:border-primary hover:bg-primary/5 transition-all bg-white shadow-sm hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-lg bg-canvas group-hover:bg-primary flex items-center justify-center transition-colors flex-shrink-0">
                    <item.icon
                      size={18}
                      className="text-faint-blue group-hover:text-navy transition-colors"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-navy text-sm group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      {item.isNew && <TagBadge label="NEW" type="new" />}
                      {item.isHot && <TagBadge label="HOT" type="hot" />}
                    </div>
                    <p className="text-xs text-faint-blue mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-200 group-hover:text-primary transition-colors flex-shrink-0"
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* 다른 허브로 이동 — 3단 구조(인덱스→허브→도구) 내부링크 */}
        {crossLinks.length > 0 && (
          <div className="mb-14 flex flex-wrap gap-3">
            {crossLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-canvas rounded-xl text-sm font-bold text-navy hover:border-primary hover:bg-primary/5 transition-all"
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
        <div className="mt-16 p-8 bg-canvas border border-canvas rounded-2xl">
          <h2 className="text-lg font-black text-navy mb-3">{seoHeading}</h2>
          <p className="text-sm text-muted-blue leading-relaxed">{seoBody}</p>
        </div>
      </div>
    </main>
  );
}
