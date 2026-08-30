// /embed — "내 블로그에 연봉 계산기 달기" 안내 페이지 (색인 대상).
//
// SERP 전략 기둥 4: 블로거가 스니펫을 붙일 때마다 크레딧 <a> 링크가 생긴다 —
// iframe 자체는 링크 주스가 없으므로 크레딧 앵커가 백링크 본체.
// 위젯 실물(/widget/salary)은 광고 없는 자가완결 HTML — noindex.
import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { ArrowRight, Blocks } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";
import ShareSection from "@/components/ShareSection";
import { HomeTopAd, GuideMidAd } from "@/components/AdPlacement";
import EmbedSnippetClient from "./EmbedSnippetClient";
import EmbedCompanyPicker from "./EmbedCompanyPicker";
import { EMBED_WIDGETS } from "./widgets";

// 화이트라벨 문의 연락처 — 운영자가 공개용 이메일을 정하면 여기에 기입 (예: "biz@…").
// 비어 있으면 /qna 안내로 폴백. (레포에 공개 이메일 부재 — 공개 여부는 운영자 결정)
const EMBED_CONTACT = "";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: `내 블로그에 계산기 위젯 달기 — 무료 임베드 ${EMBED_WIDGETS.length}종`,
  description: `티스토리·워드프레스 블로그에 코드 한 번 붙여넣기로 2026 연봉 실수령액·연말정산 환급·성과급·퇴직금·DSR 계산기와 최저임금·군인 월급·회사 공시연봉 카드까지 위젯 ${EMBED_WIDGETS.length}종을 무료로 달 수 있습니다. 광고 없는 경량 위젯, 크레딧 표기만 유지하면 끝.`,
  path: "/embed",
  keywords: [
    "연봉 계산기 위젯",
    "연말정산 계산기 위젯",
    "블로그 계산기 임베드",
    "티스토리 계산기",
    "연봉 계산기 붙이기",
    "무료 위젯",
  ],
});

const faqs = [
  {
    question: "티스토리에는 어떻게 붙이나요?",
    answer:
      "글쓰기 화면 우측 상단의 모드 선택에서 'HTML' 모드로 전환한 뒤, 복사한 임베드 코드를 원하는 위치에 붙여넣으면 됩니다. 티스토리는 iframe 태그를 지원합니다. 기본(위지윅) 모드에 붙이면 코드가 글자로 노출되니 꼭 HTML 모드를 사용하세요.",
  },
  {
    question: "워드프레스에는 어떻게 붙이나요?",
    answer:
      "블록 편집기에서 '사용자 정의 HTML' 블록을 추가하고 임베드 코드를 붙여넣으면 됩니다. 클래식 편집기는 '텍스트' 탭에서 붙여넣으세요.",
  },
  {
    question: "위젯 크기를 조절할 수 있나요?",
    answer:
      "iframe 태그의 width·height 값을 바꾸면 됩니다. 기본값(width 100%, max-width 480px, 위젯별 height)은 모바일·PC 모두에서 잘 보이도록 맞춘 값이라 그대로 쓰시는 걸 권장합니다.",
  },
  {
    question: "정말 무료인가요? 조건이 있나요?",
    answer:
      "네, 무료입니다. 위젯 아래의 '머니샐러리' 크레딧 링크를 지우지 않고 그대로 두는 것이 유일한 이용 조건입니다. 위젯에는 광고·추적 스크립트가 전혀 없습니다.",
  },
  {
    question: "계산 결과는 어떤 기준인가요?",
    answer:
      "위젯마다 각 섹션에 기준을 명시해 두었습니다. 공통적으로 2026년 세법 기준 추정치이며, 정확한 계산은 각 위젯의 버튼으로 연결되는 머니샐러리 본 사이트에서 할 수 있습니다.",
  },
  {
    question: "위젯 종류가 여러 개인가요?",
    answer:
      `네. 현재 연봉 실수령액·연말정산 환급·성과급 세후·퇴직금·DSR 대출 한도 계산기와 최저임금·군인 월급·회사 공시연봉 카드까지 ${EMBED_WIDGETS.length}종을 제공합니다. 글 주제에 맞는 위젯의 코드를 복사해 쓰면 됩니다 — 연말정산 시즌 글에는 환급 계산기, 알바·급여 글에는 최저임금 카드, 기업 리뷰 글에는 그 회사의 공시연봉 카드가 잘 어울립니다.`,
  },
  {
    question: "회사별 연봉 카드는 어떤 회사를 지원하나요?",
    answer:
      "금융감독원 DART에 사업보고서를 제출하는 기업 중 머니샐러리가 공시 데이터를 검증해 둔 기업(280여 곳)을 지원합니다. 페이지 하단의 회사 선택기에서 회사 이름을 검색하면 그 회사 전용 임베드 코드가 바로 생성됩니다.",
  },
];

export default function EmbedGuidePage() {
  return (
    <main className="w-full bg-canvas min-h-screen pb-20">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "블로그 임베드 위젯", path: "/embed" },
          ]),
          faqLd(faqs),
        ]}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-primary/10 -z-10" />
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-electric/20 text-electric font-bold text-sm mb-6">
            <Blocks className="w-4 h-4" />
            <span>무료 임베드 위젯</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-navy mb-5 leading-[1.15]">
            내 블로그에 <span className="text-electric">계산기 위젯</span> 달기
          </h1>
          <p className="text-lg text-faint-blue leading-relaxed font-medium">
            재테크·취업 블로그에 코드 한 번 붙여넣기면 끝. 연봉 실수령액·연말정산
            환급·성과급·퇴직금·DSR 계산기부터 최저임금·군인 월급·회사 공시연봉
            카드까지 {EMBED_WIDGETS.length}종 — 방문자가 글을 읽다가 바로 계산할 수
            있어 체류시간이 늘어납니다.{" "}
            <strong className="text-navy">광고·추적 스크립트 없는 경량 위젯</strong>
            입니다.
          </p>
        </div>
      </section>

      <div className="page-width max-w-3xl">
        {/* 위젯 점프 내비 — anchor 필드 활용 (2026-08 5종 확장) */}
        <nav aria-label="위젯 바로가기" className="mb-10 flex flex-wrap gap-2 justify-center">
          {EMBED_WIDGETS.map((w, i) => (
            <a
              key={w.id}
              href={`#${w.anchor}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-electric bg-electric-5 border border-electric-20 rounded-full px-3 py-1.5 hover:bg-electric hover:text-white transition-colors no-underline"
            >
              {i + 1}. {w.title}
            </a>
          ))}
        </nav>

        {/* 위젯별 스택 섹션 — 미리보기 + 스니펫 (다중 위젯, 2026-08-23) */}
        {EMBED_WIDGETS.map((w, i) => (
          <section key={w.id} id={w.anchor} className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-black text-navy mb-1">
              {i + 1}. {w.title}
            </h2>
            <p className="text-[13px] leading-[1.7] text-faint-blue font-medium mb-4">
              {w.basis}
            </p>
            <div className="flex justify-center rounded-3xl border border-canvas-200 bg-white p-4 sm:p-8 mb-4">
              <iframe
                src={w.src}
                width="100%"
                height={w.height}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  maxWidth: 480,
                }}
                title={w.title}
                loading="lazy"
              />
            </div>
            <p className="text-[14px] leading-[1.8] text-muted-blue font-medium mb-3">
              아래 코드를 복사해 블로그 편집기의{" "}
              <strong className="text-navy">HTML 모드</strong>에 붙여넣으세요. 크레딧
              링크(&ldquo;by 머니샐러리&rdquo;)를 그대로 두는 것이 무료 이용 조건입니다.
            </p>
            <EmbedSnippetClient snippet={w.snippet} widgetId={w.id} />
            {i === 0 && (
              <div className="mt-10">
                <HomeTopAd />
              </div>
            )}
          </section>
        ))}

        {/* 이용 조건 안내 */}
        <section className="mb-10">
          <div className="rounded-2xl border border-canvas-200 bg-white p-5 text-[14px] leading-[1.8] text-muted-blue font-medium">
            <p className="font-bold text-navy mb-2">이용 안내</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>개인·상업 블로그 모두 무료로 사용할 수 있습니다.</li>
              <li>
                위젯 하단의 <strong className="text-navy">크레딧 링크 유지</strong>가
                무료 이용 조건입니다.
              </li>
              <li>위젯에는 광고·쿠키·추적 스크립트가 전혀 없습니다.</li>
              <li>세법이 바뀌면 위젯도 자동으로 최신 기준으로 갱신됩니다.</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-navy mb-4">자주 묻는 질문</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl border border-canvas-200 bg-white p-4"
              >
                <summary className="cursor-pointer font-bold text-navy text-[15px] list-none flex items-center justify-between">
                  {f.question}
                  <span className="text-faint-blue group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-[1.8] text-muted-blue font-medium">
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 기업·미디어용 화이트라벨 문의 — 폼 백엔드 없음(살라리DB 제보 폼 제거 선례:
            AdSense "공사중+광고" 정책 리스크). 연락 채널은 운영자가 EMBED_CONTACT 를
            채우면 노출되고, 비어 있으면 Q&A 안내로 폴백한다. */}
        <section id="whitelabel" className="mb-10 scroll-mt-24">
          <div className="rounded-2xl border-2 border-electric/30 bg-electric-5 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-electric mb-2">
              For Business
            </p>
            <h2 className="text-xl font-black text-navy mb-2">
              기업·미디어용 화이트라벨 위젯 (유료)
            </h2>
            <p className="text-[14px] leading-[1.8] text-muted-blue font-medium mb-3">
              사내 인트라넷·언론사 기사·핀테크 서비스에 크레딧 없이 브랜드를 입힌
              계산기 위젯이 필요하신가요? 색상·로고 커스터마이징, 전용 도메인,
              계산 기준 협의를 지원하는 화이트라벨 플랜을 준비하고 있습니다.
            </p>
            <p className="text-[13px] text-faint-blue font-medium">
              {EMBED_CONTACT ? (
                <>
                  문의: <strong className="text-navy">{EMBED_CONTACT}</strong> 로
                  사용처·트래픽 규모와 함께 연락 주세요.
                </>
              ) : (
                <>
                  문의는{" "}
                  <Link href="/qna" className="text-electric font-bold underline underline-offset-2">
                    Q&A 페이지
                  </Link>
                  를 통해 남겨 주세요. 사용처·트래픽 규모를 함께 적어 주시면 빠르게
                  안내드립니다.
                </>
              )}
            </p>
          </div>
        </section>

        {/* 크로스링크 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            href="/"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              연봉 실수령액 계산기 본편
              <span className="block text-xs font-medium text-faint-blue">
                부양가족·비과세까지 정밀 계산
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
          <Link
            href="/insights"
            className="flex items-center justify-between p-5 rounded-2xl border border-canvas-200 bg-white hover:border-electric transition-colors"
          >
            <span className="font-bold text-navy">
              머니샐러리 데이터 리포트
              <span className="block text-xs font-medium text-faint-blue">
                블로그 글감으로 쓰기 좋은 연봉 데이터
              </span>
            </span>
            <ArrowRight className="w-5 h-5 text-electric" />
          </Link>
        </div>

        <div className="mb-10">
          <GuideMidAd />
        </div>

        {/* 회사 공시연봉 카드 — 회사 선택기 (2026-08-31 위젯 B2).
            ★신규 섹션은 기존 광고(GuideMidAd) 아래에만 — 광고 위 삽입 금지 하드 룰. */}
        <section id="company-picker" className="mb-10 scroll-mt-24">
          <h2 className="text-xl font-black text-navy mb-1">
            회사별 공시연봉 카드 만들기
          </h2>
          <p className="text-[13px] leading-[1.7] text-faint-blue font-medium mb-4">
            DART 공시 데이터를 보유한 기업 중에서 회사를 고르면 그 회사 전용
            평균연봉 카드의 미리보기와 임베드 코드가 생성됩니다. 기업 리뷰·이직
            후기 글에 붙이기 좋습니다.
          </p>
          <div className="rounded-3xl border border-canvas-200 bg-white p-5 sm:p-8">
            <EmbedCompanyPicker />
          </div>
        </section>

        {/* 공유 — 광고 아래 (하드 룰) */}
        <ShareSection contentType="tool" />
      </div>
    </main>
  );
}
