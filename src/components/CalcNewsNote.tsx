"use client";

// 계산기 '마지막 광고 아래' 보도 요약 상자 (2026-10-09, 삼성전자 DS 특별성과급 세부안 10/7 보도 반영).
// ★ 배치 규칙: src/app/calc/layout.tsx 의 **맨 끝**(광고 블록 InArticleAd·쿠팡·HomeTopAd, 공유 fallback, FloatingShareBar 뒤)에만.
//   /calc 페이지는 본문 전부가 calc/layout 하단 광고 위에 있어서 page.tsx 에 두면 어디에 두든 그 광고를 밀어낸다
//   (2026-08-16 '광고 위 UI 삽입 금지' 수익 사고 규칙). 맨 끝이라 기존 형제 요소의 자동광고 CSS 경로(nth-child)도 바뀌지 않는다.
// - layout 에는 params 가 없어 usePathname 으로 경로를 고른다(GuideSupplement 와 같은 패턴). usePathname 은 서버 렌더에서도
//   동작하므로 프리렌더 HTML 에 문구가 들어간다. 맵에 없는 경로는 null — 다른 /calc 페이지의 DOM 은 그대로다.
// - ★공개 출처만(운영자 2026-10-08): 언론 보도 날짜·매체를 적고 사내 공지 표현은 쓰지 않는다. 출처 URL 은
//   src/lib/guides/semiconductor-bonus-news-2026-10.ts 머리 주석과 같은 기사들이다.
// - 노조 가정 추정과 계산기 값(370조원 입력 시)은 src/lib/__tests__/samsungDsNews1009.test.ts 가 모델 산출값과 맞는지 고정한다.
import { usePathname } from "next/navigation";
import Link from "@/components/AppLink";

export interface CalcNewsNoteItem {
  title: string;
  points: readonly string[];
  href: string;
  label: string;
  source: string;
}

/** 계산기 경로(끝 슬래시 없음) → 마지막 광고 아래 보도 요약 */
export const CALC_NEWS_NOTES: Readonly<Record<string, CalcNewsNoteItem>> = {
  "/calc/samsung-bonus": {
    title: "DS부문 특별성과급 세부안 — 2026년 10월 7일 언론 보도 기준",
    points: [
      "지급 시기: 2027년 3월 말~4월 초(3월 정기 주총·이사회 뒤). 기존 OPI는 1월 말에 따로 지급됩니다.",
      "세금: 지급할 때 49.5%(소득세 45% + 지방소득세 4.5%)를 원천징수 → 보험료 등을 뺀 나머지를 지급일 주가로 자사주 지급 → 최종 세금은 연말정산에서 정산됩니다.",
      "매도 제한: 3분의 1은 바로, 3분의 1은 1년, 나머지 3분의 1은 2년 뒤 팔 수 있습니다. 사업부별 최종 지급률은 2027년 2월 공지 예정입니다.",
      "노조 가정 추정(영업이익 370조원·연봉 8천만원대·기존 OPI 포함 세전): 메모리 약 7.5억, 공통 약 5.3억, 시스템LSI·파운드리 약 2.4억원. 이 계산기의 '내 연봉으로 계산'에 연봉 8천만원·영업이익 370조원·OPI 50%를 넣으면 세전 약 7.66억·5.30억·2.67억원입니다(기본 가중치는 사이트 추정값).",
    ],
    href: "/guides/samsung-ds-special-bonus-details-oct-2026",
    label: "DS 특별성과급 세부안 총정리 보기",
    source: "출처: 한국경제·EBN·이투데이·아이뉴스24 2026년 10월 7일 보도. 회사 공식 발표 자료가 아닙니다.",
  },
};

/** 경로(끝 슬래시 무시)에 맞는 항목 — 없으면 null */
export function calcNewsNoteFor(pathname: string | null): CalcNewsNoteItem | null {
  if (!pathname) return null;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return CALC_NEWS_NOTES[path] ?? null;
}

export default function CalcNewsNote() {
  const item = calcNewsNoteFor(usePathname());
  if (!item) return null;

  return (
    <section
      data-msy-module="calc-news-note"
      aria-label={item.title}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10"
    >
      <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-5">
        <p className="text-sm font-bold text-navy dark:text-canvas-50">{item.title}</p>
        <ul className="mt-2 space-y-1 list-disc pl-5 text-sm text-muted-blue dark:text-canvas-300 leading-relaxed">
          {item.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <Link href={item.href} className="mt-3 inline-block text-electric font-bold hover:underline">
          {item.label} →
        </Link>
        <p className="mt-2 text-xs text-faint-blue leading-relaxed">{item.source}</p>
      </div>
    </section>
  );
}
