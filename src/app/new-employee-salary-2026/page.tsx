// src/app/new-employee-salary-2026/page.tsx
// "신입 초봉 2026" 키워드 인덱스 — 회사 데이터 자동 집계

import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Building2, Crown } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { allCompanies } from "@/data/companies";
import { formatSalaryKorean } from "@/lib/companyContentBuilder";
import type { CompanyProfile } from "@/types/company";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
 title: "신입 초봉 2026 — 회사 480곳 영끌 연봉 TOP 50",
 description:
 "2026년 신입 사원 초봉 TOP 50. 대기업·IT·금융·공기업·외국계 회사별 영끌(기본급+성과급) 신입 평균 연봉. 머니샐러리 회사 480곳 데이터 자동 집계.",
 path: "/new-employee-salary-2026",
 ogType: "article",
 publishedTime: "2026-05-22",
 modifiedTime: "2026-05-22",
 keywords: [
 "신입 초봉",
 "신입 초봉 2026",
 "신입 영끌 연봉",
 "대기업 신입 초봉",
 "IT 신입 초봉",
 "신입 사원 연봉",
 "신입 연봉 순위",
 "초봉 TOP 50",
 ],
});

function totalEntry(c: CompanyProfile): number {
 return c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
}

const TIER_LABEL_KO: Record<CompanyProfile["tier"], string> = {
 conglomerate: "대기업",
 unicorn: "유니콘",
 startup: "스타트업",
 foreign: "외국계",
 public: "공기업",
};

const FAQ_ITEMS = [
 {
 question: "신입 초봉에서 '영끌'은 어떤 의미인가요?",
 answer:
 "영끌은 영혼까지 끌어모은 연봉의 줄임말로, 기본급에 인센티브·성과급·사이닝 보너스 등을 모두 합산한 최대치를 의미합니다. 본 페이지의 신입 초봉은 영끌(기본급 + 인센티브 평균) 기준이며, 스톡옵션·우리사주 등 별도 보상은 포함되지 않습니다.",
 },
 {
 question: "초봉이 가장 높은 신입 회사는 어디인가요?",
 answer:
 "한국에서 신입 초봉 TOP 10은 대부분 IT 유니콘(쿠팡·토스), 금융권 톱티어(삼성화재·미래에셋), 외국계(구글·메타·마이크로소프트 한국지사)에 집중됩니다. 영끌 기준 6,500~9,000만원 수준이며, 스톡옵션을 포함하면 외국계가 1억원을 넘는 사례도 있습니다.",
 },
 {
 question: "대기업·중견·스타트업 신입 초봉 격차는?",
 answer:
 "통상 5대 그룹 신입 영끌 6,500~8,500만원, 중견기업 4,500~5,500만원, 시리즈B+ 스타트업 4,800~6,500만원(+스톡옵션), 공기업 4,000~4,800만원 수준입니다. 다만 성과급 비중이 큰 대기업은 다운사이클에 영끌이 30% 이상 감소할 수 있어 기본급 비중도 함께 확인해야 합니다.",
 },
 {
 question: "신입 초봉은 연차에 따라 얼마나 오르나요?",
 answer:
 "회사·업종에 따라 다르지만 통상 신입→주니어(3~5년차) 25~40% 상승, 주니어→시니어(6~10년차) 30~50% 상승합니다. 시니어 시점에 신입 대비 2.0~2.5배 도달이 일반적이며, 성장이 빠른 IT·반도체·2차전지 업종은 3배 이상도 가능합니다.",
 },
 {
 question: "초봉이 협상 가능한가요?",
 answer:
 "공채는 등급 고정이라 어렵고, 수시채용·IT 직군은 일반적으로 ±10% 협상 여지가 있습니다. 특히 외국계와 스타트업은 시장 가격 변동이 커서 적극 협상 권장. 협상 시에는 본 페이지의 회사별 평균 연봉을 시장가 근거로 활용할 수 있습니다.",
 },
];

export default function NewEmployeeSalary2026Page() {
 // 신입 영끌 TOP 50 자동 집계
 const top50 = [...allCompanies]
 .sort((a, b) => totalEntry(b) - totalEntry(a))
 .slice(0, 50);

 // 대기업·유니콘·외국계 카테고리별 TOP 10
 const conglomerateTop = top50.filter((c) => c.tier === "conglomerate").slice(0, 10);
 const unicornTop = [...allCompanies]
 .filter((c) => c.tier === "unicorn")
 .sort((a, b) => totalEntry(b) - totalEntry(a))
 .slice(0, 10);
 const foreignTop = [...allCompanies]
 .filter((c) => c.tier === "foreign")
 .sort((a, b) => totalEntry(b) - totalEntry(a))
 .slice(0, 10);
 const publicTop = [...allCompanies]
 .filter((c) => c.tier === "public")
 .sort((a, b) => totalEntry(b) - totalEntry(a))
 .slice(0, 10);

 return (
 <main className="min-h-screen bg-canvas pb-20 pt-28">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "신입 초봉 2026", path: "/new-employee-salary-2026" },
 ]),
 faqLd(FAQ_ITEMS),
 articleLd({
 title: "신입 초봉 2026 — 회사 480곳 영끌 TOP 50",
 description: "대기업·IT·금융·공기업·외국계 신입 평균 연봉 종합 인덱스",
 slug: "new-employee-salary-2026",
 publishedDate: "2026-05-22",
 modifiedDate: "2026-05-22",
 }),
 ]}
 />

 <div className="page-width">
 <div className="text-center mb-12">
 <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
 <Crown className="w-4 h-4" />
 회사 480곳 자동 집계
 </p>
 <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
 신입 초봉 2026 <span className="text-electric">영끌 TOP 50</span>
 </h1>
 <PublishedMeta publishedDate="2026-05-22" updatedDate="2026-05-22" className="mb-2" />
 <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
 머니샐러리 회사 데이터베이스 480곳의 신입 영끌(기본급 + 인센티브 평균) 연봉을
 자동 집계한 TOP 50 순위입니다. 같은 직군이라도 회사별로 1,500만원 이상 차이가
 날 수 있어, 첫 직장 선택과 연봉 협상에서 시장가 비교가 필수입니다.
 </p>
 </div>

 {/* 본문 — SEO 텍스트 */}
 <section className="mb-12 max-w-3xl mx-auto prose prose-slate">
 <p className="text-sm leading-7 text-muted-blue">
 신입 초봉은 첫 직장 선택의 결정적 변수입니다. 통계청 발표(2025) 기준 국내
 대졸 신입 평균 연봉은 약 4,200만원이지만, 5대 그룹(삼성·SK·현대차·LG·롯데) 신입
 영끌은 6,500~8,500만원, IT 톱티어(네카라쿠배·토스·당근)는 6,500~7,500만원으로
 시장 평균의 1.5~2배 수준입니다. 본 페이지는 회사 480곳의 신입 영끌(기본급 +
 성과급 평균) 데이터를 자동 정렬해 한눈에 볼 수 있는 인덱스를 제공합니다.
 </p>
 <p className="text-sm leading-7 text-muted-blue mt-4">
 신입 초봉 비교 시 주의할 점은 <strong>영끌</strong>(기본급 + 인센티브)과
 <strong>기본급</strong>의 차이입니다. 성과급 비중이 큰 회사(삼성전자·SK하이닉스·미래에셋
 등)는 다운사이클에 영끌이 30% 이상 감소할 수 있어, 기본급 자체가 안정성을 보장합니다.
 반대로 공기업·은행은 기본급 비중이 높아 변동성이 낮고, IT 유니콘은 스톡옵션이
 본 페이지 수치에 포함되지 않아 실제 보상은 더 클 수 있습니다.
 </p>
 <p className="text-sm leading-7 text-muted-blue mt-4">
 또한 사이닝 보너스(입사 보너스), 학자금 상환 지원, 사택·기숙사, 자녀 학자금 등
 비현금성 복지의 가치도 무시할 수 없습니다. 예를 들어 삼성·SK 등 대기업의 자녀
 학자금 지원은 연 1,500~2,000만원 가치, 외국계 사이닝 보너스는 1,000~3,000만원
 수준입니다. 본 페이지의 TOP 50과 함께 각 회사 페이지에서 복지 상세를 함께 확인해
 종합 패키지로 비교하세요.
 </p>
 </section>

 {/* TOP 50 표 */}
 <section className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-electric" />
 신입 영끌 TOP 50 — 전 업종 종합
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {top50.map((c, idx) => (
 <Link
 key={c.id}
 href={`/salary-db/${c.id}`}
 className="flex items-center gap-3 p-3 bg-white rounded-xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="w-8 text-center font-black text-electric text-sm">
 {idx + 1}
 </div>
 <div className="text-xl">{c.logo}</div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-navy text-sm truncate">{c.name.ko}</p>
 <p className="text-[11px] text-faint-blue truncate">
 {TIER_LABEL_KO[c.tier]} · {c.industry}
 </p>
 </div>
 <p className="text-sm font-black text-electric flex-shrink-0">
 {formatSalaryKorean(totalEntry(c))}
 </p>
 </Link>
 ))}
 </div>
 </section>

 <InArticleAd />

 {/* 카테고리별 TOP 10 */}
 {[
 { label: "대기업 신입 초봉 TOP 10", list: conglomerateTop, anchor: "conglomerate" },
 { label: "IT 유니콘 신입 초봉 TOP 10", list: unicornTop, anchor: "unicorn" },
 { label: "외국계 신입 초봉 TOP 10", list: foreignTop, anchor: "foreign" },
 { label: "공기업 신입 초봉 TOP 10", list: publicTop, anchor: "public" },
 ].map((cat) =>
 cat.list.length > 0 ? (
 <section key={cat.anchor} id={cat.anchor} className="mb-12">
 <h2 className="text-xl font-black text-navy mb-6 flex items-center gap-2">
 <Building2 className="w-5 h-5 text-electric" />
 {cat.label}
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {cat.list.map((c, idx) => (
 <Link
 key={c.id}
 href={`/salary-db/${c.id}`}
 className="flex items-center gap-3 p-3 bg-white rounded-xl border border-canvas-200 hover:border-electric transition-colors"
 >
 <div className="w-8 text-center font-black text-electric text-sm">
 {idx + 1}
 </div>
 <div className="text-xl">{c.logo}</div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-navy text-sm truncate">{c.name.ko}</p>
 <p className="text-[11px] text-faint-blue truncate">{c.industry}</p>
 </div>
 <p className="text-sm font-black text-electric flex-shrink-0">
 {formatSalaryKorean(totalEntry(c))}
 </p>
 </Link>
 ))}
 </div>
 </section>
 ) : null
 )}

 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />

 {/* FAQ */}
 <section className="mb-12 max-w-3xl mx-auto">
 <h2 className="text-xl font-black text-navy mb-6">신입 초봉 자주 묻는 질문</h2>
 <div className="space-y-3">
 {FAQ_ITEMS.map((item) => (
 <details
 key={item.question}
 className="group p-5 bg-white rounded-2xl border border-canvas-200"
 >
 <summary className="cursor-pointer text-sm font-bold text-navy">
 {item.question}
 </summary>
 <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 <RelatedCalculators currentPath="/new-employee-salary-2026" />

 <div className="mt-8">
 <HomeTopAd />
 </div>
 </div>
 </main>
 );
}
