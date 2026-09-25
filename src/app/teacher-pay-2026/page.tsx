// src/app/teacher-pay-2026/page.tsx
// 2026 교사 호봉표 — "교사 호봉표"·"초등교사 월급" 에버그린 수요 (2026-08-30 승인 배치 ⑤).
// 데이터: src/lib/civilServantPay.ts (공무원보수규정 별표 11 발췌, 3중 교차검증).
// 광고: civil-servant-pay-2026 표준 배치 복제 (운영자 승인 2026-08-30).
// ★ 갱신 체크포인트: 매년 12월 말 국무회의 의결 시 봉급표·수당 갱신.
// 네이버 저CTR 정렬 (2026-09-25, 감사 배치 B20): 네이버 노출 40,005·CTR 1.2%.
//   title·description(=og·twitter)·H1을 '교사 호봉표 2026'·'교원 봉급표' 검색어 형태로 맞추고
//   리드 첫 문장이 9호봉·40호봉 월 봉급을 바로 답하게 제자리 교체(글자 수 이전 이하, 광고 위 블록
//   추가 없음 — payTableSnippets.test.ts 가드). 수치 재확인: 인사혁신처 2026 봉급표(2026-09-25).
//   H1 은 사이트 폰트 실측(뷰포트 300~1400px 1px 단위)으로 이전 H1 보다 어느 폭에서도 줄 수가 늘지
//   않는 '교원 봉급표'로 확정 — '교원 봉급표·월급'은 429~446px(아이폰 Pro Max 430)·676~704px 에서
//   한 줄 늘어 HomeTopAd 를 36~48px 밀어 기각(수정 2026-09-25).
//   시작 호봉은 표의 첫 행이 아니라 TEACHER_START_HOBONG 값으로 찾는다(표를 1~40호봉 전체로
//   늘려도 '신규 교사 통상 시작' 문구가 1호봉을 가리키지 않게).
// 전 호봉 풀표 (2026-09-25 준비, 수익 추천 #2 — 배포는 10/8 자동광고 복구 판정 뒤): 1~40호봉 전체표를
//   페이지 맨 끝(사이드바 광고까지 포함한 모든 광고·공유 버튼 아래, 그리드 밖)에 붙였다. 광고 위 발췌표
//   (TEACHER_PAY_ROWS_2026)·메타·리드는 그대로 — 전체표 데이터는 payTablesFull2026.ts(원문 파싱).

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { GraduationCap, Calendar, Calculator, FileText, ArrowRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, datasetLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, SidebarAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";
import {
  TEACHER_PAY_ROWS_2026,
  TEACHER_ALLOWANCE_2026,
  TEACHER_START_HOBONG,
} from "@/lib/civilServantPay";
import CitationCopyButton from "@/components/CitationCopyButton";
import PayStepTable from "@/components/PayStepTable";
import { TEACHER_PAY_FULL_2026, PAY_FULL_2026_CHECKED } from "@/lib/payTablesFull2026";
import { PAY_2027_CONFIRMED } from "@/lib/payTablesFull2027";
import { PAY_TABLES_RELEASE_DATE } from "@/config/siteDates";

const fmt = (n: number) => n.toLocaleString("ko-KR");

// 전체표 2단(1~20 · 21~40호봉) — 데스크톱은 나란히, 모바일은 위아래
const FULL_FIRST_HALF = TEACHER_PAY_FULL_2026.filter(([h]) => h <= 20);
const FULL_SECOND_HALF = TEACHER_PAY_FULL_2026.filter(([h]) => h > 20);

// 리드·메타 공용 — 신규 교사 통상 시작(9호봉)과 최상위(40호봉) 월 봉급.
// 시작 행은 호봉 값으로 찾는다(표 첫 행 = 시작 호봉이라는 가정 금지), 최상위는 호봉 최댓값 행.
function teacherRow(hobong: number) {
  const row = TEACHER_PAY_ROWS_2026.find(([h]) => h === hobong);
  if (!row) throw new Error(`[teacher-pay-2026] 교원 봉급표에 ${hobong}호봉 행이 없습니다`);
  return row;
}
const FIRST_ROW = teacherRow(TEACHER_START_HOBONG);
const LAST_ROW = TEACHER_PAY_ROWS_2026.reduce((top, row) => (row[0] > top[0] ? row : top));

// 이전(2026-08-30~09-24) title: "2026 교사 호봉표 — 초등·중등 교원 월급, 9호봉 249만원부터"
const PAGE_TITLE = `2026 교사 호봉표·교원 봉급표 — ${FIRST_ROW[0]}호봉 월 ${Math.floor(FIRST_ROW[1] / 10000)}만원부터`;
const PAGE_DESCRIPTION = `2026년 교사 호봉표(유·초·중등 교원 봉급표) 인사혁신처 공표 수치. 신규 교사 통상 ${FIRST_ROW[0]}호봉 월 ${fmt(FIRST_ROW[1])}원, ${LAST_ROW[0]}호봉 ${fmt(LAST_ROW[1])}원과 담임수당 ${TEACHER_ALLOWANCE_2026.homeroom / 10000}만원 등 수당, 실수령 계산 흐름을 정리했습니다.`;
// 수정일 = 봉급표 묶음 배포일(siteDates.ts PAY_TABLES_RELEASE_DATE — 배포 담당이 실제 배포일로 한 번에 갱신)
const MODIFIED = PAY_TABLES_RELEASE_DATE;

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/teacher-pay-2026",
  ogType: "article",
  publishedTime: "2026-08-30",
  modifiedTime: MODIFIED,
  keywords: [
    "교사 호봉표 2026",
    "2026 교사 호봉표",
    "교원 봉급표 2026",
    "교사 봉급표",
    "교사 월급",
    "초등교사 월급",
    "중등교사 월급",
    "교원 봉급표",
    "담임수당",
    "교사 연봉",
  ],
});

const FAQ_ITEMS = [
  {
    question: "신규 교사 첫 월급은 얼마인가요?",
    answer:
      "교대·사범대(4년제) 졸업 후 임용되면 통상 9호봉으로 시작합니다(2급 정교사 기산호봉 8호봉 + 사범계 가산 1호봉). 2026년 9호봉 월 봉급은 2,495,600원이며, 여기에 정액급식비(월 16만원)·교직수당·담임수당(맡을 경우 월 20만원) 등이 더해진 뒤 소득세·기여금이 공제됩니다. 군 경력이나 기간제 경력이 있으면 호봉이 가산됩니다.",
  },
  {
    question: "호봉표 금액이 실수령액인가요?",
    answer:
      "아닙니다. 호봉표는 수당을 뺀 기본급(봉급)입니다. 실제 보수는 봉급 + 교직수당·정액급식비·담임수당·보직수당·명절휴가비(설·추석 각 월봉급의 60%)·정근수당 등을 합산한 뒤, 공무원연금 기여금·건강보험·소득세를 공제한 금액입니다. 초임 교사도 수당을 합치면 세전 월 300만원 안팎이 일반적입니다.",
  },
  {
    question: "담임을 맡으면 얼마나 더 받나요?",
    answer:
      "담임수당은 월 200,000원, 보직교사(부장)수당은 월 150,000원입니다(2024년 인상 이후 2026년 유지). 담임과 보직을 겸하면 두 수당을 모두 받습니다.",
  },
  {
    question: "교사 호봉은 어떻게 오르나요?",
    answer:
      "매년 1호봉씩 자동 승급하며(정기승급), 대학원 학위 취득 등으로 가산될 수 있습니다. 2026년 표 기준 9호봉에서 10년 차인 18~19호봉이 되면 월 봉급이 약 324만원, 30호봉(약 21년 차)이면 482만원 수준입니다. 봉급 외 수당과 성과상여금이 별도로 붙습니다.",
  },
  {
    question: "유치원·초등·중등 교사의 봉급표가 서로 다른가요?",
    answer:
      "아닙니다. 유치원·초등학교·중학교·고등학교 교원은 모두 공무원보수규정 별표 11의 동일한 봉급표를 적용받습니다. 차이는 시작 호봉(학력·경력 기산)과 수당에서 생깁니다.",
  },
];

export default function TeacherPay2026Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "교사 호봉표 2026", path: "/teacher-pay-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            slug: "teacher-pay-2026",
            url: "/teacher-pay-2026",
            publishedDate: "2026-08-30",
            modifiedDate: MODIFIED,
          }),
          datasetLd({
            name: "2026년 교육공무원(교원) 호봉표 데이터",
            description:
              "공무원보수규정 별표 11 기준 2026년 유·초·중등 교원 1~40호봉 전체 월 봉급액 데이터셋(인사혁신처 2026 봉급표 원문).",
            url: "/teacher-pay-2026",
            datePublished: "2026-08-30",
            dateModified: MODIFIED,
            keywords: ["교사 호봉표", "교원 봉급표", "초등교사 월급", "교사 월급"],
          }),
          speakableLd({ url: "/teacher-pay-2026", cssSelectors: [".faq-answer"] }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            공무원보수규정 별표 11 · 2026-01-01 시행
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 교사 호봉표 <span className="text-electric">교원 봉급표</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-30" updatedDate={MODIFIED} className="mb-2" />
          {/* 첫 답변(광고 위) — 제자리 교체만, 글자 수는 이전 리드 이하 유지 (B20 2026-09-25) */}
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            2026년 교사 봉급은 신규 교사 통상 시작인 <strong>{FIRST_ROW[0]}호봉 월 {fmt(FIRST_ROW[1])}원</strong>,
            {" "}{LAST_ROW[0]}호봉 {fmt(LAST_ROW[1])}원입니다. 유·초·중등 공통이며 담임수당 등 수당은 별도입니다.
          </p>
          <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            📚 공식 출처:{" "}
            <a
              href="https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              인사혁신처 2026년 공무원 봉급표
            </a>{" "}
            · 법제처 공무원수당규정
          </p>
        </div>

        <HomeTopAd />

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-14">
          <div className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
            {/* 호봉표 */}
            <section className="mt-10 mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200">
              <h2 className="text-xl font-black text-navy mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-electric" />
                2026 교원 호봉표 (주요 호봉 발췌)
              </h2>
              <p className="text-xs text-faint-blue mb-5">
                단위: 원(월 봉급액) · 유치원·초·중·고 교원 공통 · 출처: 공무원보수규정 별표 11
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="border-b-2 border-canvas-200 text-navy">
                      <th className="py-3 px-2 text-left font-black">호봉</th>
                      <th className="py-3 px-2 text-right font-black">월 봉급액</th>
                      <th className="py-3 px-2 text-left font-black pl-6">참고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEACHER_PAY_ROWS_2026.map(([hobong, pay]) => (
                      <tr key={hobong} className="border-b border-canvas-100">
                        <td className="py-2.5 px-2 font-bold text-navy">{hobong}호봉</td>
                        <td className="py-2.5 px-2 text-right text-muted-blue tabular-nums">{fmt(pay)}</td>
                        <td className="py-2.5 px-2 pl-6 text-xs text-faint-blue">
                          {hobong === 9 ? "신규 임용 통상 시작" : hobong === 18 ? "약 10년 차" : hobong === 30 ? "약 21년 차" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-faint-blue mt-4">
                ※ 저연차(9~11호봉) 구간은 저연차 추가 인상 반영으로 호봉 간 격차가 압축돼
                있습니다. 군 경력·기간제 경력은 호봉에 가산됩니다.
              </p>
            </section>

            <CalcResultAd />

            {/* 수당 해설 */}
            <section className="mt-10 mb-12 prose prose-slate">
              <h2 className="text-lg font-black text-navy mb-3">봉급 위에 얹히는 교원 수당</h2>
              <ul className="text-sm leading-7 text-muted-blue list-disc pl-5">
                <li>
                  <strong>담임수당</strong> — 월 {fmt(TEACHER_ALLOWANCE_2026.homeroom)}원
                </li>
                <li>
                  <strong>보직교사수당</strong> — 월 {fmt(TEACHER_ALLOWANCE_2026.headTeacher)}원 (담임과 중복 수령 가능)
                </li>
                <li>
                  <strong>정액급식비</strong> — 월 160,000원 · <strong>명절휴가비</strong> — 설·추석 각 월봉급의 60%
                </li>
                <li>
                  <strong>교직수당·정근수당</strong> 등 — 경력·직무에 따라 추가
                </li>
              </ul>
              <p className="text-sm leading-7 text-muted-blue mt-4">
                9호봉 신규 교사가 담임을 맡으면 봉급 2,495,600원 + 담임수당 20만원 + 정액급식비
                16만원만으로도 세전 285만원을 넘습니다. 세후 실수령이 궁금하다면{" "}
                <Link href="/salary/34000000" className="text-electric font-bold hover:underline">
                  연봉 3,400만원 실수령액 표
                </Link>
                에서 공제 내역을 확인하세요. 초등교사 커리어별 연봉 흐름은{" "}
                <Link href="/job/elementary-teacher" className="text-electric font-bold hover:underline">
                  초등교사 연봉 페이지
                </Link>
                , 중·고교는{" "}
                <Link href="/job/secondary-teacher" className="text-electric font-bold hover:underline">
                  중등교사 연봉 페이지
                </Link>
                에 정리돼 있습니다.
              </p>
            </section>

            <InArticleAd />

            {/* CTA */}
            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/civil-servant-pay-2026"
                className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
              >
                <Calculator className="w-8 h-8 opacity-70 mb-3" />
                <h3 className="text-lg font-black mb-2">공무원 봉급표 2026</h3>
                <p className="text-sm opacity-90">일반직 9~5급 호봉별 월급</p>
              </Link>
              <Link
                href="/job/elementary-teacher"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">초등교사 연봉 정보</h3>
                <p className="text-sm text-muted-blue">임용·커리어별 연봉 흐름</p>
              </Link>
              <Link
                href="/national-pension-estimate-2026"
                className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
              >
                <FileText className="w-8 h-8 text-electric mb-3" />
                <h3 className="text-lg font-black mb-2">연금 예상수령액</h3>
                <p className="text-sm text-muted-blue">노후 설계 계산기</p>
              </Link>
            </section>

            <GuideMidAd />

            {/* FAQ */}
            <section className="mt-10 mb-12">
              <h2 className="text-xl font-black text-navy mb-6">교사 월급 자주 묻는 질문</h2>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item) => (
                  <details
                    key={item.question}
                    className="group p-5 bg-white rounded-2xl border border-canvas-200"
                  >
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
                      {item.question}
                      <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

            <RelatedCalculators currentPath="/teacher-pay-2026" />

            {/* 인용 복사 — R2 B4 (운영자 승인 2026-08-31): 데이터 변수 기반 빌드타임 생성 */}
            <div className="mt-8">
              <CitationCopyButton
                quote={`2026년 교사(유·초·중등 교원) 월 봉급은 ${TEACHER_PAY_ROWS_2026[0][0]}호봉 ${TEACHER_PAY_ROWS_2026[0][1].toLocaleString("ko-KR")}원부터 ${TEACHER_PAY_ROWS_2026[TEACHER_PAY_ROWS_2026.length - 1][0]}호봉 ${TEACHER_PAY_ROWS_2026[TEACHER_PAY_ROWS_2026.length - 1][1].toLocaleString("ko-KR")}원까지이며, 담임수당은 월 ${TEACHER_ALLOWANCE_2026.homeroom.toLocaleString("ko-KR")}원이다 — 공무원보수규정 별표 11 기준.`}
                path="/teacher-pay-2026"
                quoteId="teacher-pay-range"
                sourceLabel="교사 호봉표"
              />
            </div>

            <div className="mt-8">
              <ShareButtons
                title="2026 교사 호봉표 — 유·초·중등 교원 월급"
                description="9호봉 249만원부터 30호봉 482만원까지, 담임·보직수당 구조 총정리"
              />
            </div>
          </div>

          <aside
            className="hidden lg:block lg:sticky lg:top-24 space-y-6 self-start"
            aria-label="추천·광고"
          >
            <SidebarAd />
            <CoupangBanner size="skyscraper" showDisclosure={false} />
          </aside>
        </div>

        {/* 전 호봉 전체표 — 모든 광고·공유 버튼 아래 페이지 맨 끝 (수익 추천 #2, 2026-09-25 준비) */}
        <section
          id="teacher-full-table"
          aria-labelledby="teacher-full-table-title"
          className="scroll-mt-24 mt-12 p-6 sm:p-8 bg-white rounded-3xl border border-canvas-200"
        >
          <h2 id="teacher-full-table-title" className="text-xl font-black text-navy mb-2">
            2026 교원 봉급표 전체 (1~40호봉)
          </h2>
          <p className="text-xs text-faint-blue leading-6 mb-5">
            단위: 원(월 봉급액) · 유치원·초·중·고 교원 공통 · 출처:{" "}
            <a
              href="https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              인사혁신처 2026년 공무원 봉급표
            </a>
            (공무원보수규정 별표 11) · 확인일 {PAY_FULL_2026_CHECKED}
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <PayStepTable
              caption="1~20호봉"
              columns={["월 봉급액"]}
              rows={FULL_FIRST_HALF}
              regionLabel="교원 봉급표 1~20호봉"
            />
            <PayStepTable
              caption="21~40호봉"
              columns={["월 봉급액"]}
              rows={FULL_SECOND_HALF}
              regionLabel="교원 봉급표 21~40호봉"
            />
          </div>
          <p className="text-xs text-faint-blue leading-6 mt-4">
            ※ 봉급표 금액은 수당을 뺀 기본급입니다. 4년제 교대·사범대를 졸업한 신규 교사는 통상{" "}
            {TEACHER_START_HOBONG}호봉에서 시작해 매년 1호봉씩 오르고, 군 경력·기간제 경력은 호봉에
            가산됩니다. {PAY_2027_CONFIRMED ? "2027년 확정액은" : "내년 예상액은"}{" "}
            <Link href="/teacher-pay-2027" className="text-electric font-bold hover:underline">
              {PAY_2027_CONFIRMED ? "2027 교사 봉급표" : "2027 교사 봉급표 예상"}
            </Link>
            , 일반직 전 급수 표는{" "}
            <Link href="/civil-servant-pay-2026#general-full-table" className="text-electric font-bold hover:underline">
              2026 공무원 봉급표
            </Link>
            에서 확인하세요.
          </p>
        </section>
      </div>
    </main>
  );
}
