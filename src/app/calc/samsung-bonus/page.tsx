// src/app/calc/samsung-bonus/page.tsx
//
// 삼성전자 성과급 시뮬레이터.
// 영업이익 기반 부문/사업부 풀 분배 모델.

import type { Metadata } from "next";
import Link from "next/link";
import { buildToolMetadata } from "@/lib/seo";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import { Sparkles, Info, AlertTriangle, ArrowRight } from "lucide-react";
import SamsungBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";

const FAQ_ITEMS = [
  {
    question: "이 계산기는 무엇을 시뮬레이션하나요?",
    answer:
      "삼성전자의 영업이익 기반 성과급 분배 모델입니다. 회사 전체 영업이익에서 일정 비율(재원비율)을 성과급 풀로 떼고, 그 풀을 다시 '부문(전체 인원 균등 분배)'과 '사업부(인원×사업부 비율로 가중 분배)' 두 갈래로 나눠 사업부별 1인당 평균 성과급을 추정합니다. 본인 호봉·고과 등 개인 변수는 반영하지 않은 사업부 평균 수치입니다.",
  },
  {
    question: "부문 분배와 사업부 분배의 차이는 무엇인가요?",
    answer:
      "부문 분배는 회사 전체 인원에 균등하게 나누는 방식으로, 어느 사업부 소속이든 동일한 금액을 받습니다. 사업부 분배는 사업부별로 정해진 '사업부 비율(가중치)'에 따라 차등 지급되며, 비율이 0인 사업부는 사업부 분배분이 0이 됩니다. 두 갈래의 비중을 7:3, 5:5처럼 조절할 수 있어 분배 정책 변화의 영향을 한눈에 비교할 수 있습니다.",
  },
  {
    question: "왜 사업부 비율 0이면 사업부 분배가 0인가요?",
    answer:
      "사업부 1인당 = 사업부 재원 × (본인 사업부 비율) ÷ Σ(인원×비율) 공식이기 때문입니다. 본인 사업부의 비율이 0이면 분자가 0이 되어 사업부 분배분이 0입니다. 영업이익이 적자이거나 사업부 기여도가 낮은 경우 이 비율을 0~0.3 수준으로 두는 게 현실적입니다.",
  },
  {
    question: "영업이익은 어떤 기준으로 입력하나요?",
    answer:
      "회사 연결 기준 연간 영업이익(조원)을 입력합니다. 분기 영업이익이면 4배(연환산)로 환산해 넣으면 됩니다. 삼성전자의 경우 2023년 6.6조, 2024년 32.7조, 2025년 호황 시 50~60조 수준이 거론됩니다. 본 계산기는 10조~500조까지 슬라이더로 시뮬레이션 가능합니다.",
  },
  {
    question: "재원비율 15%는 너무 높은 것 아닌가요?",
    answer:
      "보수적으로 보면 5~10% 정도가 현실적이고, 노조 측 요구안이 반영되면 15~20%까지 올라가는 경우가 있습니다. 본 계산기는 시뮬레이션 도구이므로 다양한 시나리오를 직접 조정해보세요. 슬라이더는 1~30% 범위에서 0.5% 단위로 움직입니다.",
  },
  {
    question: "결과 금액에 세금이 포함되어 있나요?",
    answer:
      "본 계산기는 세전 1인당 평균 성과급을 표시합니다. 실제 통장에 들어오는 금액은 누진세율(6~45%) + 지방소득세 10% + 4대보험이 빠진 약 65~70% 수준입니다. 예를 들어 세전 1억원이면 세후 약 6,500~7,000만원이 입금됩니다. 정확한 세후 계산은 별도 성과급 세금 계산기를 참고하세요.",
  },
  {
    question: "SK하이닉스 비교는 어떻게 산출했나요?",
    answer:
      "참고 박스의 SK하이닉스 7.14억 추정치는 영업이익 250조, 재원비율 10%, 직원 35,000명, 단일 사업부 균등 분배를 가정한 단순 계산입니다(250조 × 10% / 35,000명 = 약 7.14억). 실제 SK하이닉스는 PS(Profit Sharing) 제도를 별도 운영하며 기본급 기준 1,500% 같은 형태로 지급되므로 직접 비교는 어렵습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "삼성전자 성과급 시뮬레이터",
  tagline: "영업이익 × 재원비율 × 부문/사업부 분배 1인당 추정",
  description:
    "삼성전자 영업이익 기반 성과급 1인당 분배 시뮬레이터. 부문(균등) + 사업부(가중치) 분배 비율을 직접 조절하며 메모리·공통·파운드리 사업부별 평균 성과급을 추정합니다. SK하이닉스 비교 참고치 포함.",
  path: "/calc/samsung-bonus",
  keywords: [
    "삼성전자 성과급",
    "삼성전자 성과급 계산기",
    "삼성전자 성과급 시뮬레이터",
    "삼성 성과급 분배",
    "삼성 OPI",
    "사업부 영업이익 분배",
    "삼성 보너스 계산",
    "SK하이닉스 성과급 비교",
  ],
});

export default function SamsungBonusCalculatorPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "삼성전자 성과급 시뮬레이터",
            description:
              "삼성전자 영업이익 기반 부문/사업부 풀 분배로 사업부별 1인당 성과급을 추정합니다.",
            url: "/calc/samsung-bonus",
          }),
          autoBreadcrumbLd("/calc/samsung-bonus", {
            leafName: "삼성전자 성과급 시뮬레이터",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 bg-electric-10 text-electric border border-electric-30">
              <Sparkles size={12} /> Samsung 성과급 시뮬레이터
            </div>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50"
              style={{ letterSpacing: "-0.04em" }}
            >
              삼성전자 성과급 계산기
            </h1>
            <p className="text-base sm:text-lg font-medium text-muted-blue dark:text-canvas-300">
              영업이익 → 부문 + 사업부 분배 →{" "}
              <strong className="text-electric">1인당 평균</strong>
            </p>
            <p className="text-sm text-faint-blue mt-3 max-w-md mx-auto leading-relaxed">
              영업이익·재원비율·부문/사업부 비율을 조절하면 메모리·공통·파운드리
              사업부별 1인당 평균 성과급이 즉시 산출됩니다.
            </p>
          </header>

          <SamsungBonusClient />

          <InArticleAd />

          {/* 분배 모델 설명 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              분배 모델 — 어떻게 계산되나
            </h2>
            <div className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric-10 flex items-center justify-center font-black text-electric text-sm">
                  1
                </div>
                <div>
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                    총 재원 산정
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    영업이익(조원) × 재원비율(%) = 총 성과급 풀. 예) 영업이익
                    350조 × 15% = 52.5조원.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric-10 flex items-center justify-center font-black text-electric text-sm">
                  2
                </div>
                <div>
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                    부문 ↔ 사업부 분할
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    총 재원을 부문비율과 사업부비율로 나눕니다. 예) 7:3이면
                    부문 36.75조 + 사업부 15.75조. 부문은 균등, 사업부는 가중치
                    기반.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric-10 flex items-center justify-center font-black text-electric text-sm">
                  3
                </div>
                <div>
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                    부문 1인당 (균등 분배)
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    부문 재원 ÷ 전체 인원. 어느 사업부 소속이든 동일 금액.
                    예) 36.75조 ÷ 77,300명 ≈ 4,755만원.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric-10 flex items-center justify-center font-black text-electric text-sm">
                  4
                </div>
                <div>
                  <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                    사업부 1인당 (가중치 분배)
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed font-mono">
                    사업부 재원 × (본인 비율) ÷ Σ(인원×비율)
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed mt-1">
                    본인 사업부 비율이 0이면 사업부 분배분도 0. 비율이 1.0이면
                    표준, 0.7이면 70% 가중.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-electric flex items-center justify-center font-black text-white text-sm">
                  =
                </div>
                <div>
                  <p className="font-bold text-electric text-sm mb-1">
                    최종 1인당 = 부문 분배 + 사업부 분배
                  </p>
                  <p className="text-xs text-muted-blue leading-relaxed">
                    세전 평균이며, 실수령은 세금·4대보험 공제 후 약 65~70%
                    수준.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">
              왜 분배 방식이 중요한가
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              같은 회사 영업이익이라도 분배 정책에 따라 사업부별 격차가 크게
              달라집니다. <strong>부문 비중이 높을수록(예: 7:3, 8:2)</strong>{" "}
              사업부 간 격차가 줄어들고, <strong>사업부 비중이 높을수록(예: 3:7, 2:8)</strong>{" "}
              영업이익 기여가 큰 사업부의 보상이 커집니다. 노사 합의에서 이
              비율 자체가 핵심 쟁점이 됩니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              사업부 비율(가중치)의 의미
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              사업부 비율은 사업부의 영업이익 기여도·전략적 중요도를 반영한
              가중치입니다. 표준 사업부가 1.0이면 호황 사업부는 1.2~1.5,
              부진/적자 사업부는 0~0.3 수준으로 책정됩니다. 본 계산기 디폴트는
              메모리 1.0 / 공통 0.7 / 파운드리·시스템LSI 0.0으로 설정되어
              있어, 적자 사업부는 사업부 분배에서 제외되는 보수적 모델을
              보여줍니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-10 mb-4">
              세후 실수령 환산
            </h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 <strong>세전</strong> 1인당 금액을 표시합니다.
              실수령은 다음과 같이 줄어듭니다:
            </p>
            <ul className="space-y-1 text-muted-blue dark:text-canvas-300 leading-relaxed">
              <li>• 소득세 (누진세율 24~45% 구간) — 평균 25~30%</li>
              <li>• 지방소득세 (소득세의 10%)</li>
              <li>• 4대보험 (국민연금 4.5% / 건강 3.545% / 장기요양 / 고용 0.9%)</li>
              <li>• 합산 실효세율 약 30~38%</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              세전 1억원 = 세후 약 6,500~7,000만원. 세전 5천만원 = 세후 약
              3,500~3,800만원으로 환산하시면 됩니다.
            </p>
          </article>

          {/* 경고 */}
          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <AlertTriangle
              size={20}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1"
            />
            <div>
              <p className="font-black text-amber-900 dark:text-amber-200 mb-1">
                참고용 시뮬레이션입니다
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                본 계산기는 공개된 노사 합의 보도와 일반적인 영업이익 기반
                성과급 분배 모델을 기반으로 한 시뮬레이션입니다. 실제 지급은
                회사·사업부의 정책, 본인 호봉·고과, 평가 등급에 따라 달라지며,
                본 계산기 결과와 차이가 있을 수 있습니다. 본인 사내 HR 시스템의
                명세서를 참고하세요.
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            <Link
              href="/samsung-negotiation-2026"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                시즌 가이드
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                삼성전자 2026 임금협상 분석
              </p>
              <p className="text-xs text-muted-blue mb-3">
                5가지 핵심 쟁점, 직급별 예상 인상폭, SK하이닉스 비교
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                자세히 보기{" "}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
            <Link
              href="/company/samsung-electronics"
              className="block p-5 bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 rounded-2xl hover:border-electric transition-colors group"
            >
              <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
                회사 프로필
              </p>
              <p className="font-bold text-navy dark:text-canvas-50 text-sm mb-1">
                삼성전자 평균 연봉·복지
              </p>
              <p className="text-xs text-muted-blue mb-3">
                직급별 성장표, 1.35억 평균 연봉, 복지 비교
              </p>
              <span className="text-xs font-bold text-electric inline-flex items-center gap-1">
                회사 보기{" "}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </section>

          <CoupangBanner
            responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
          />

          {/* FAQ */}
          <section className="mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">
              자주 묻는 질문
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group transition-shadow hover:shadow-md"
                >
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}
                    <span className="text-electric group-open:rotate-180 transition-transform">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info
              size={18}
              className="text-electric flex-shrink-0 mt-1"
            />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 계산기는 2026년 공개 노사 합의 보도와 영업이익 기반 성과급
              분배 모델 추정치이며 참고용입니다. 실제 지급은 사업부 정책, 본인
              호봉·평가에 따라 달라집니다.
            </p>
          </div>

          <div className="mt-8 mb-8">
            <ShareButtons
              title="삼성전자 성과급 시뮬레이터 — 영업이익 기반 1인당 추정"
              description="영업이익·재원비율·부문/사업부 분배를 직접 조절하며 사업부별 평균 성과급을 시뮬레이션."
            />
          </div>

          <RelatedCalculators currentPath="/calc/samsung-bonus" />
        </div>
      </main>
    </>
  );
}
