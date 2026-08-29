// /salary-db/ranking — 대기업 연봉 순위 허브 (서버 컴포넌트).
//
// 목적: "대기업 연봉 순위", "삼성전자 연봉", "연봉 높은 회사" 등 고검색량 쿼리를
// 흡수하는 에디토리얼 허브. 전체 회사(dedupe 후 allCompanies 전수)를 시니어 기준 총보상(base + 평균 인센티브)으로
// 랭킹해 상위 30개사를 표로 보여주고, 각 행을 /salary-db/[id] 회사 페이지로 연결해
// 회사 상세 페이지에 내부 링크 주스를 전달한다.
import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { ArrowRight, Trophy } from "lucide-react";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, itemListLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, GuideMidAd } from "@/components/AdPlacement";

const TOP_N = 30;

export const metadata: Metadata = buildPageMetadata({
  title: "2026 대기업 연봉 순위 TOP 30 — 시니어 기준 총보상 랭킹",
  description:
    "삼성전자, SK하이닉스, 네이버, 카카오 등 국내 주요 기업의 시니어 직급 총보상(기본급+평균 인센티브)을 2026년 기준으로 비교한 연봉 순위표. 회사별 상세 연봉 페이지로 바로 이동하세요.",
  path: "/salary-db/ranking",
  keywords: [
    "대기업 연봉 순위",
    "연봉 높은 회사",
    "회사별 연봉 비교",
    "2026 연봉 순위",
    "기업 연봉 랭킹",
    "삼성전자 연봉",
    "SK하이닉스 연봉",
  ],
});

// 만원 단위 표기 (예: 12,345만원)
function manwon(krw: number): string {
  return `${Math.round(krw / 10000).toLocaleString("ko-KR")}만원`;
}

const tierLabel: Record<string, string> = {
  conglomerate: "대기업",
  unicorn: "유니콘",
  startup: "스타트업",
  foreign: "외국계",
  public: "공기업",
};

export default function CompanyRankingPage() {
  // 시니어 기준 총보상 = base + 평균 인센티브(avgAmount, 없거나 0이면 0 —
  // 전 소비처(CompanySalaryTable·CompanyNarrative 등)와 동일 표준: target% 추정 합산 금지)
  // 국내 기업만 — 글로벌 기업(isGlobal)은 국내 순위 왜곡 방지 위해 제외
  const ranked = companyRepository
    .getAll()
    .filter((c) => !c.isGlobal)
    .map((c) => {
      const senior = c.salary.senior;
      const incentive = senior.incentive.avgAmount || 0;
      return {
        id: c.id,
        nameKo: c.name.ko,
        industry: c.industry,
        tier: c.tier,
        logo: c.logo,
        base: senior.base,
        total: senior.base + incentive,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_N);

  const listLd = itemListLd({
    name: "2026 대기업 연봉 순위 TOP 30",
    items: ranked.map((c, i) => ({
      name: c.nameKo,
      url: `/salary-db/${c.id}`,
      position: i + 1,
    })),
  });

  return (
    <main className="w-full bg-canvas min-h-screen pb-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "회사 연봉 DB", path: "/salary-db" },
            { name: "연봉 순위", path: "/salary-db/ranking" },
          ]),
          listLd,
        ]}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/10 -z-10" />
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
            <Trophy className="w-4 h-4" />
            <span>2026 연봉 랭킹</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-5 leading-[1.15]">
            대기업 연봉 순위 <span className="text-electric">TOP 30</span>
          </h1>
          <p className="text-lg text-faint-blue leading-relaxed font-medium">
            국내 주요 기업의 <strong>시니어 직급 총보상</strong>(기본급 + 평균
            인센티브)을 2026년 기준으로 비교했습니다. 회사명을 누르면 직급별 연봉·복지
            상세 페이지로 이동합니다.
          </p>
        </div>
      </section>

      <div className="page-width max-w-3xl">
        {/* 면책·출처 고지 — 실명 기업 순위이므로 추정/참고용임을 표 이전에 명확히 */}
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-900">
          <strong className="font-bold">⚠️ 안내</strong> · 본 순위는 공개된 정보와 업계
          통념을 바탕으로 한 <strong>추정치</strong>이며, 각 기업의 공식 발표 자료가
          아닙니다. 특정 기업의 실제 연봉·처우를 보장하거나 평가하기 위한 것이 아니며,
          오로지 참고용입니다. 정정이 필요한 정보가 있다면 사이트 문의를 통해 알려주세요.
        </div>

        <div className="mb-8">
          <HomeTopAd />
        </div>

        {/* 설명 본문 — 랭킹 기준 명시 (E-E-A-T) */}
        <article className="mb-10">
          <p className="text-[15px] leading-[1.8] text-muted-blue font-medium">
            아래 순위는 각 기업의 <strong className="text-navy">시니어(과장·차장급)</strong>
            직급 기준 총보상을 비교한 것입니다. 총보상은 계약 기본급에 평균적으로 지급되는
            성과급(인센티브)을 더한 추정치이며, 스톡옵션·RSU·사이닝 보너스 등 일회성 보상은
            포함하지 않았습니다. 실제 연봉은 개인 성과, 입사 연차, 협상 결과에 따라 달라질 수
            있으니 참고용으로 활용하세요.
          </p>
        </article>

        {/* 순위표 */}
        <div className="overflow-hidden rounded-3xl border border-canvas-200 bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-canvas-200 bg-canvas/60 text-xs font-bold text-faint-blue uppercase tracking-wide">
                <th className="py-3.5 px-4 w-12 text-center">순위</th>
                <th className="py-3.5 px-2">회사</th>
                <th className="py-3.5 px-2 text-right hidden sm:table-cell">기본급</th>
                <th className="py-3.5 px-4 text-right">총보상</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c, i) => (
                <tr
                  key={c.id}
                  className="border-b border-canvas-100 last:border-0 hover:bg-canvas/50 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center font-black text-navy tabular-nums">
                    {i < 3 ? (
                      <span className="text-lg">
                        {["🥇", "🥈", "🥉"][i]}
                      </span>
                    ) : (
                      i + 1
                    )}
                  </td>
                  <td className="py-3.5 px-2">
                    <Link
                      href={`/salary-db/${c.id}`}
                      className="group inline-flex items-center gap-2 font-bold text-navy hover:text-electric transition-colors"
                    >
                      <span className="text-xl" aria-hidden="true">
                        {c.logo}
                      </span>
                      <span>
                        {c.nameKo}
                        <span className="block text-[11px] font-medium text-faint-blue">
                          {c.industry} · {tierLabel[c.tier] ?? c.tier}
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-2 text-right text-muted-blue font-medium tabular-nums hidden sm:table-cell">
                    {manwon(c.base)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-electric tabular-nums">
                    {manwon(c.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <InArticleAd />
        </div>

        {/* 성과급·상여금 시즌 크로스셀 — 회사 연봉 순위 방문자를 성과급 클러스터로 라우팅
            (2026-07-16 신설, 2026-08-17 시즌 문구 갱신 — 7월 만료 표기 제거) */}
        <div className="mt-12">
          <h2 className="text-xl font-black text-navy mb-4">
            성과급·상여금 시즌 — 내 성과급 세후 얼마?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/calc/samsung-bonus"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                삼성전자 성과급 계산기
                <span className="block text-xs font-medium text-faint-blue">
                  OPI·TAI 세후 실수령액 시뮬레이션
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
            <Link
              href="/calc/sk-hynix-bonus"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                SK하이닉스 성과급 계산기
                <span className="block text-xs font-medium text-faint-blue">
                  상반기 PI 발표 반영 — 내 세후 실수령 확인
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
            <Link
              href="/tools/finance/bonus"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                성과급 세금 계산기
                <span className="block text-xs font-medium text-faint-blue">
                  회사 무관 일반 성과급 세후 계산
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
            <Link
              href="/tools/finance/irp"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                IRP·연금저축 절세 계산기
                <span className="block text-xs font-medium text-faint-blue">
                  성과급 받은 달, 세액공제 환급 극대화
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
          </div>
        </div>

        {/* 다음 액션 — 연봉 순위 검색 클러스터 상호 순환 (2026-07-06 감사 보강) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/new-employee-salary-2026"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              신입 초봉 TOP 50
              <span className="block text-xs font-medium text-faint-blue">
                2026 신입 영끌 연봉 순위
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/insights/entry-salary-by-industry-2026"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              업종별 신입 초봉 순위
              <span className="block text-xs font-medium text-faint-blue">
                데이터 리포트 — 업종별 평균·중앙값 집계
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/industry/large-conglomerate"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              대기업 연봉 순위
              <span className="block text-xs font-medium text-faint-blue">
                4대 그룹·주요 대기업 비교
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/industry/public-enterprise"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              공기업 연봉 순위
              <span className="block text-xs font-medium text-faint-blue">
                공공기관·공기업 연봉 비교
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/industry/foreign-company"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              외국계 연봉 순위
              <span className="block text-xs font-medium text-faint-blue">
                외국계 기업 연봉 비교
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/salary-db"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              회사 연봉 DB 전체 보기
              <span className="block text-xs font-medium text-faint-blue">
                {companyRepository.getAll().length}개사 검색·비교
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              내 연봉 실수령액 계산
              <span className="block text-xs font-medium text-faint-blue">
                2026 세법 기준 5초 계산
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
        </div>

        {/* 페이지 끝 슬롯 보강 — 다음 액션 탐색 후 이탈 직전 (운영자 승인 2026-07-13) */}
        <div className="mt-10">
          <GuideMidAd />
        </div>
      </div>
    </main>
  );
}
