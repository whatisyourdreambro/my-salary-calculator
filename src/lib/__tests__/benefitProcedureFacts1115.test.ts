// N2-app-pages-08 (2026-11-15 감사 app-pages-b05-M01·F07, b07-F06·F07·M01) — 고용보험 급여 페이지 절차 사실·접근성 회귀 가드.
//
// /parental-leave(ParentalLeaveContent.tsx), /unemployment-benefit(UnemploymentBenefitContent.tsx). 광고 위 문구 정정은
// 커밋마다 따로 되돌릴 수 있게 아래 [표지] 줄 밑에 각자 단언을 둔다 — 표지 줄은 지우지 말 것(되돌리기 충돌 방지).
// 근거(2026-11-15 재확인):
//   - 고용보험법 제70조 제2항: 육아휴직을 시작한 날 이후 1개월부터 육아휴직이 끝난 날 이후 12개월 이내에 신청.
//   - 고용보험법 제49조 제1항: 실업의 신고일부터 계산하기 시작하여 7일간은 대기기간(구직급여 미지급).
//   - 고용노동부 빠른상담 답변: 1차 실업인정 집체교육, 2·3·4차 재취업활동 최소 1회, 5차부터 최소 2회(적극적 구직활동 1회 포함).
//   - 고용노동부 답변·한국고용정보원: 2024-09-23 워크넷·고용보험·HRD-Net 등이 고용24(www.work24.go.kr)로 일원화.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const flat = (s: string) => s.replace(/\s+/g, " ");
const parental = flat(readFileSync(resolve(process.cwd(), "src/app/parental-leave/ParentalLeaveContent.tsx"), "utf8"));
const unemployment = flat(
  readFileSync(resolve(process.cwd(), "src/app/unemployment-benefit/UnemploymentBenefitContent.tsx"), "utf8"),
);

describe("고용보험 급여 페이지 원본", () => {
  it("두 클라이언트 파일을 읽는다", () => {
    expect(parental).toContain("육아휴직 신청 방법");
    expect(unemployment).toContain("실업급여 신청 절차");
  });
});

// [표지 08a] /parental-leave 6+6 토글 상태 — 속성만(클래스·문구 불변). aria-expanded 는 쓰지 않는다
// (benefitFaqIntegrity 가 이 페이지 aria-expanded 개수 5 를 센다).
describe("/parental-leave 6+6 토글 접근성", () => {
  it("두 버튼이 aria-pressed 로 선택 상태를 알리고 그룹이 라벨과 이어진다", () => {
    expect(parental.match(/aria-pressed=/g)?.length).toBe(2);
    expect(parental).toContain('<label id="pl-mode-label" className="block text-sm font-medium text-foreground mb-2">');
    expect(parental).toContain('<div role="group" aria-labelledby="pl-mode-label" className="grid grid-cols-2 gap-3">');
    expect(parental).toContain('type="button" aria-pressed={useParents} onClick={() => setUseParents(true)}');
    expect(parental).toContain('type="button" aria-pressed={!useParents} onClick={() => setUseParents(false)}');
  });
});

// [표지 08b] /parental-leave 육아휴직 급여 신청 기간

// [표지 08c] /unemployment-benefit STEP 3 대기기간 기산일

// [표지 08d] /unemployment-benefit STEP 4 실업인정 재취업활동 횟수

// [표지 08e] /unemployment-benefit 관련 링크 고용24 구직 등록
