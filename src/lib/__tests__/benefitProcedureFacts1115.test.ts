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
// 광고 위(CalcResultAd 아래, CoupangBanner·GuideMidAd 위) 단계 설명 — 12px 사이트 글꼴 364.96px -> 349.20px(-15.76px).
describe("/parental-leave 육아휴직 급여 신청 기간(고용보험법 제70조 제2항)", () => {
  it("시작 1개월 뒤부터·종료 후 12개월 이내로 적고 옛 '1개월 이내'가 없다", () => {
    expect(parental).toContain('desc: "시작 1개월 뒤부터 고용24(work24.go.kr)에서 신청. 종료 후 12개월 이내."');
    expect(parental).not.toContain("시작 후 1개월 이내");
  });
});

// [표지 08c] /unemployment-benefit STEP 3 대기기간 기산일
// 광고 위(CalcResultAd 아래, CoupangBanner·GuideMidAd 위). 패키지 원안 '1회 필수 수강(온라인·오프라인). 대기기간 7일은 실업
// 신고일부터.' 은 keep-all 줄 수 모델에서 칸 폭 144~150px(320~326px 화면)에 한 줄 늘어나 쓰지 않았다. 이 문구는 12px 사이트 글꼴
// 323.80px -> 307.44px 이고 칸 폭 144~592px 전 구간에서 줄 수가 늘지 않는다(모델).
describe("/unemployment-benefit STEP 3 대기기간(고용보험법 제49조)", () => {
  it("대기기간 7일은 실업 신고일부터 세고 '수강 후 대기기간'이 없다", () => {
    expect(unemployment).toContain('desc: "1회 필수 수강. 온·오프라인 가능. 대기기간 7일은 실업 신고일부터."');
    expect(unemployment).not.toContain("수강 후 대기기간");
  });
});

// [표지 08d] /unemployment-benefit STEP 4 실업인정 재취업활동 횟수
// 광고 위. 12px 사이트 글꼴 326.45px -> 317.24px(-9.21px), 칸 폭 142~592px 에서 줄 수가 늘지 않는다(모델).
describe("/unemployment-benefit STEP 4 실업인정 횟수", () => {
  it("2~4차 1회, 5차부터 2회로 적고 옛 '4주마다 구직활동 2회'가 없다", () => {
    expect(unemployment).toContain('desc: "4주마다 재취업활동 1회(5차부터 2회) 이상 증명. 인정 후 급여 지급."');
    expect(unemployment).not.toContain("4주마다 구직활동 2회");
  });
});

// [표지 08e] /unemployment-benefit 관련 링크 고용24 구직 등록
