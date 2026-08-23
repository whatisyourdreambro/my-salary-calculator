// /insights — 머니샐러리 데이터 리포트 인덱스 (서버 컴포넌트).
// 리포트는 분기 1회 개별 제작 — 목록은 reportsRegistry가 단일 소스.
// 메타데이터는 insights/layout.tsx 가 제공.
import Link from "@/components/AppLink";
import { ArrowRight, BarChart3, Quote, Database } from "lucide-react";
import { reportsRegistry } from "@/data/reportsRegistry";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";
import { GuideMidAd } from "@/components/AdPlacement";

export const dynamic = "force-static";

export default function InsightsIndexPage() {
  const companyCount = companyRepository.getAll().length;
  const reports = [...reportsRegistry].sort((a, b) =>
    b.publishedDate.localeCompare(a.publishedDate)
  );

  return (
    <main className="w-full bg-canvas min-h-screen pb-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "데이터 리포트", path: "/insights" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/10 -z-10" />
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
            <Database className="w-4 h-4" />
            <span>머니샐러리 데이터 리포트</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-5 leading-[1.15]">
            데이터로 보는 <span className="text-electric">연봉의 진실</span>
          </h1>
          <p className="text-lg text-faint-blue leading-relaxed font-medium">
            국내 {companyCount}개사 연봉 DB와 공시·정부 통계를 직접 집계해 분기마다
            발행하는 데이터 리포트입니다. 언론·블로그에서{" "}
            <strong className="text-navy">출처 표기 시 자유롭게 인용</strong>할 수
            있습니다.
          </p>
        </div>
      </section>

      <div className="page-width max-w-3xl">
        {/* 리포트 목록 */}
        <section className="mb-12">
          <div className="space-y-4">
            {reports.map((r) => (
              <Link
                key={r.slug}
                href={`/insights/${r.slug}`}
                className="group block p-6 rounded-3xl border border-canvas-200 bg-white hover:border-electric transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-electric mb-2 inline-flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      데이터 리포트 · {r.publishedDate}
                    </p>
                    <h2 className="text-lg sm:text-xl font-black text-navy leading-snug mb-2 group-hover:text-electric transition-colors">
                      {r.title}
                    </h2>
                    <p className="text-[14px] leading-[1.7] text-muted-blue font-medium">
                      {r.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 shrink-0 text-electric mt-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 리포트 목록 직후 중간 광고 — GUIDE_MID 슬롯은 이 페이지·layout(PageFooterAds:
            IN_ARTICLE+HOME_TOP) 미사용이라 무충돌 (운영자 일괄 승인 2026-08-23) */}
        <div className="mb-12">
          <GuideMidAd />
        </div>

        {/* 인용 정책 */}
        <section className="mb-12">
          <h2 className="text-xl font-black text-navy mb-3 inline-flex items-center gap-2">
            <Quote className="w-5 h-5 text-electric" />
            인용 정책
          </h2>
          <div className="rounded-3xl border border-canvas-200 bg-white p-6 text-[14px] leading-[1.8] text-muted-blue font-medium space-y-3">
            <p>
              머니샐러리 데이터 리포트는{" "}
              <strong className="text-navy">
                출처를 &ldquo;머니샐러리&rdquo;로 표기하는 조건
              </strong>
              으로 기사·블로그·영상 등 어디서든 자유롭게 인용하실 수 있습니다.
              온라인 매체는 해당 리포트 페이지 링크를 함께 넣어주시길 권장합니다.
            </p>
            <p>
              각 리포트 본문의 <strong className="text-navy">인용문 복사 버튼</strong>
              을 누르면 출처가 포함된 문장이 그대로 복사됩니다. 집계 방법과 데이터의
              한계(추정치 포함 여부)는 리포트마다 명시합니다.
            </p>
          </div>
        </section>

        {/* 데이터 소개 + 크로스링크 */}
        <section>
          <h2 className="text-xl font-black text-navy mb-3">
            리포트의 기반 데이터
          </h2>
          <p className="text-[14px] leading-[1.8] text-muted-blue font-medium mb-5">
            리포트는 머니샐러리가 운영하는 회사 연봉 DB({companyCount}개사)와
            직업별 정부 공식 임금통계, 금융감독원 공시 자료를 조합해 만듭니다.
            원본 데이터는 아래에서 직접 탐색할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/salary-db"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                회사 연봉 DB
                <span className="block text-xs font-medium text-faint-blue">
                  {companyCount}개사 연봉·복지 검색
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
            <Link
              href="/industry"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                업종별 연봉
                <span className="block text-xs font-medium text-faint-blue">
                  업종별 평균·회사 순위
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
            <Link
              href="/job"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                직업별 연봉
                <span className="block text-xs font-medium text-faint-blue">
                  정부 통계 기반 직업 62종
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
            <Link
              href="/salary-db/ranking"
              className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
            >
              <span className="font-bold text-navy">
                대기업 연봉 순위
                <span className="block text-xs font-medium text-faint-blue">
                  시니어 총보상 TOP 30
                </span>
              </span>
              <ArrowRight className="w-5 h-5 text-electric" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
