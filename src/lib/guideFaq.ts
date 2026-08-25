// src/lib/guideFaq.ts
//
// 가이드 본문(HTML)의 "자주 묻는 질문" 섹션에서 FAQPage 구조화데이터용 Q&A 를
// 빌드 타임에 추출한다 (2026-08 구조화데이터 보강).
//
// 데이터 중복 없이 본문이 단일 소스 — 가이드 26개 섹션의 마크업이 전부
//   <h2>…자주 묻는 질문…</h2><ul><li><strong>질문</strong> — 답변</li>…</ul>
// 패턴이라 정규식 추출이 안전하다. 패턴이 깨진 섹션은 조용히 건너뛴다(추정 금지).
import type { FaqItem } from "@/lib/structuredData";

const FAQ_SECTION_RE =
  /<h2>[^<]*자주 묻는 질문[^<]*<\/h2>\s*<ul>([\s\S]*?)<\/ul>/g;
const FAQ_ITEM_RE =
  /<li><strong>([\s\S]*?)<\/strong>\s*(?:—|-|:)?\s*([\s\S]*?)<\/li>/g;

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Q. " / "Q:" 등 질문 접두 표기 제거 — FAQPage name 은 질문 본문만 */
function stripQuestionPrefix(q: string): string {
  return q.replace(/^Q\s*[.):]\s*/i, "").trim();
}

/** 본문 HTML 에서 FAQ Q&A 추출 — 유효 항목 2개 미만이면 빈 배열 (스키마 미방출) */
export function extractGuideFaqs(content: string): FaqItem[] {
  const items: FaqItem[] = [];
  for (const section of content.matchAll(FAQ_SECTION_RE)) {
    for (const li of section[1].matchAll(FAQ_ITEM_RE)) {
      const question = stripQuestionPrefix(stripTags(li[1]));
      const answer = stripTags(li[2]);
      if (question.length >= 5 && answer.length >= 10) {
        items.push({ question, answer });
      }
    }
  }
  return items.length >= 2 ? items : [];
}
