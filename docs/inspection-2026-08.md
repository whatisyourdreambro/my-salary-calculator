# 2026-08 대규모 점검 보고서

- 실시일: 2026-08-24
- 브랜치: `claude/large-scale-inspection-plan-j46mj6` (base: main ec5eaca)
- 범위: 빌드 건전성 · 계산 정확성 · 회귀 방지 장치 · SEO/위생
- 결과 요약: **계산 정확성 결함 6건 정정, 린트 에러 39건 전량 해소, 회귀 가드 3종 신설, SEO 주입 경로 41곳 정본 수렴** (커밋 15건)

---

## 1. 요약

| 영역 | 발견 | 조치 | 후속 |
|---|---|---|---|
| 빌드 건전성 | 린트 에러 39건 잔존 | 전량 해소 (에러 0) | react-hooks 경고 18건 |
| 계산 정확성 | 결함 6건 (자녀공제 4중 불일치 등) | 전부 정정 + 정본 수렴 | 인라인 계산기 6곳 수렴 |
| 회귀 방지 | 테스트 0개, 드리프트 감지 수단 없음 | vitest 23건 + 가드 스크립트 2종 | CI 연동 |
| SEO/위생 | 수기 canonical 32곳, 인라인 JSON-LD 16곳 등 | 41곳 수렴, env·deps 정리 | en 헬퍼 신설 등 |

## 2. 계산 정확성 정정 내역 (핵심)

정본은 `src/lib/taxConstants2026.ts`. 이번 점검에서 `childTaxCredit2026()`,
`earnedIncomeTaxCredit2026()`, `INSURANCE_RATES_2025_LEGACY`를 추가하고 미수렴
엔진을 전부 정본으로 붙였다.

| # | 결함 | 구값 → 정정값 | 근거 | 영향 |
|---|---|---|---|---|
| 1 | **자녀세액공제 4중 불일치** — TaxLogic(15/30만)·calculator(15/35만)·yearEndTax(15/35만)·child-deduction 페이지(25/55만)가 서로 다른 값 | 전 엔진 → 첫째 25만·둘째 30만·셋째+ 각 40만 | 소득세법 §59의2 (2025-01-01 시행 개정, 웹 교차 검증) | 자녀 있는 모든 실수령액·연말정산 결과. 연말정산 결정세액 1자녀 -10만, 2자녀 -20만, 3자녀 -30만 (환급 증가) |
| 2 | **월세 세액공제 구법 한도** — quick 계산기가 750만 캡 | 한도 1,000만 (`RENT_CREDIT_2026`) | 조특법 §95의2 현행 | 연 월세 750만 초과 구간 환급 과소 안내 최대 -42.5만원 |
| 3 | **근로소득공제 2,000만 캡 누락** — TaxLogic·calculator | 캡 적용 (정본 함수) | 소득세법 §47 | 연봉 3.625억 초과 구간만 (예: 5억 실수령 월 -10.1만 정정) |
| 4 | **/table/2026 엔진 이원화** — annual·monthly가 구간별 정률(1.5/3.5/6/10%) 간이 추정 | 표 4종 전부 정식 엔진(calculator 코어) | — | 고연봉 과대 안내가 컸음: 연봉 1억 -23.6만/월, 2억 -246.9만/월 정정. 저연봉 소폭 과소(3,000만 +4.0만/월) |
| 5 | **프리랜서(4대보험 알바) 장기요양보험 누락** | 건보료 × 13.14% 추가 | 전 엔진과 동일 기준 | 월 250만 기준 실수령 -1.2만/월 정정 |
| 6 | **calculator.ts 완전 중복 함수 쌍** — calculateNetSalary = calculateNetSalary2026 (값·로직 100% 동일) | 요율 파라미터화 단일 코어로 통합 | — | 동작 불변 (아래 스냅숏 검증) |

부수: `global/taxEngine.ts` KR 블록 요율·세율표·공제 정본 위임,
samsung-bonus `calcBonusNet` → `calcSamsungBonusNet` rename(정본과 이름 충돌 해소).

### 스냅숏 검증 (BEFORE/AFTER)

주요 엔진 출력을 수정 전후 전량 덤프해 비교:

- **SSG 격자 불변**: `/salary/[amount]` 정적 생성 집합 415개, sha256 `e5b7ae06…` —
  수정 전후 **완전 동일** (내부 404·sitemap 정합에 영향 0)
- **자녀 0명 · 연봉 3.625억 이하**: 전 구간 **비트 단위 동일** (의도치 않은 변화 0)
- 모든 값 변화가 위 정정 항목 6건으로 설명됨 (표 4종 중 weekly·hourly는 변화 0 —
  원래 정식 엔진이었음을 재확인)

### 표 페이지 텍스트 동기화

`/table/2026/{annual,monthly}` 메타 description·통계 타일·FAQ의 하드코딩 수치를
정식 엔진 값으로 갱신: 223→220만(연봉 3천), 353→348만(5천), 478→472만(7천),
650→643만(1억), 218→220만(월급 250), 410→411만(월급 500). datasetLd
dateModified 2026-08-24로 갱신.

## 3. 빌드 건전성

| 게이트 | 점검 전 | 점검 후 |
|---|---|---|
| `npx tsc --noEmit` | 통과 | 통과 |
| `npx eslint .` | **에러 39** + 경고 18 | **에러 0** + 경고 18 |
| `npm run build` | 통과 (2,325 페이지) | 통과 |
| `npm test` | (없음) | 23/23 통과 |

- 참고: `next lint`는 flat config(`eslint.config.mjs`)를 인식하지 못해 대화형
  프롬프트가 뜬다 — 린트는 `npx eslint .`로 실행할 것. Next 14 빌드도 같은
  이유로 빌드 중 린트를 건너뛰므로, **린트 에러는 빌드를 막지 않는다**
  (그래서 CI 연동이 후속 과제).
- 잔여 경고 18건은 전부 `react-hooks/exhaustive-deps` — 동작 변경 위험이 있어
  이번 점검에서는 의도적으로 미수정 (백로그).

## 4. 신설 회귀 가드 사용법

| 명령 | 역할 |
|---|---|
| `npm test` | vitest 23건 — 누진세표 8구간 경계 연속성, 근로소득공제 캡 발동점(3.625억), 자녀세액공제 25/55/95만, 근로소득세액공제 한도, 연금 상한, 월세 17%/15%/0% 경계, 프리랜서 장기요양, 표 격자 177행·golden 값, 표 링크의 SSG 집합 포함(내부 404 방지) |
| `npm run verify:tax` | 요율 리터럴(4.75%·3.595%·13.14%·연금 상한 등)이 정본 밖에 **새로** 하드코딩되면 실패. 허용목록 `scripts/tax-constants-allow.json`(9곳)이 2027 개정 시 갱신 대상 전량 목록을 겸함 |
| `npm run verify:sitemap` | src/app 파일시스템 정적 라우트 vs 실제 sitemap() 출력 전수 대조. 의도적 제외 6곳은 스크립트 내 사유와 함께 명문화 |

**2027 요율 개정 절차**: ① `taxConstants2026.ts` 수정 → ② `npm test`로 경계값
확인(golden 값 갱신) → ③ `npm run verify:tax`가 출력하는 허용목록 9곳의 표시용
텍스트 갱신 → ④ 표 페이지 하드코딩 수치(§2 표 텍스트) 갱신.

## 5. SEO/위생 조치

- **canonical 수기 작성 25곳 → `buildPageMetadata` 수렴** (/calc 성과급 24 +
  salary-raise-2026). 전후 metadata 실제 덤프 deep-diff로 25/25 동일성 검증
  (기존 값 변경·삭제 0건, 헬퍼 자동 필드만 추가).
- **인라인 JSON-LD 16곳 → `JsonLd` 컴포넌트 통일** (fun/* 15 + en/guides/[slug]).
  `AutoBreadcrumb`는 fun/layout.tsx에서 실사용 확인 — 삭제 대신 내부만 정본화.
- **가이드 템플릿 fallback 제거**: 342편 전편이 고유 본문 보유 실측(템플릿 사용
  0건) → 134줄 템플릿 삭제, 본문 없는 가이드는 빌드 타임 실패로 차단
  (thin content 방지 가드).
- **.env.local.example 실사**: MULTIPLEX·DISPLAY_2·ADS_ID·CONVERSION_LABEL·
  DART_API_KEY 5종 문서화.
- **의존성**: `@types/recharts` 제거(recharts 3.x 자체 타입과 중복).
  devDeps 추가: vitest·vite-tsconfig-paths·tsx.

## 6. 후속 백로그 (이번 범위 제외 — 사유 포함)

1. **인라인 계산기 6곳 + 표시용 텍스트의 요율 정본 수렴** — calc 4곳
   (incentive-tax·year-end-bonus·year-end-bonus-tax·holiday-bonus)·
   CompanySalaryTable·tools/finance/bonus. 현재 값은 정확하며 verify:tax
   허용목록으로 감시 중. 수렴은 리스크 대비 효익 낮아 후속.
2. **en/** metadata 헬퍼 신설** — buildPageMetadata가 ko 전용(hreflang·타이틀
   접미사·og:locale)이라 en 5곳은 수기 유지. en 옵션 추가 후 수렴 권장.
3. **react-hooks/exhaustive-deps 경고 18건** — 훅 의존성 수정은 동작 변경
   위험이 있어 케이스별 검토 필요.
4. **CI에 lint/typecheck/test 잡 추가** — 현재 lighthouse.yml 하나뿐이며
   `--collect.url=http://localhost/` 구성이라 사실상 무효. 린트 에러가 빌드를
   막지 않으므로(§3) CI가 유일한 자동 방어선이 됨.
5. **`@next/bundle-analyzer` 15.x vs next 14 메이저 불일치** — 동작엔 문제
   없어 기록만. next 15 업그레이드 시 eslint 9와 함께 일괄 정렬.
6. **bonusTaxCalc.calcBonusNet ↔ calcSamsungBonusNet 병합** — 반환 shape가
   달라 rename만 수행. 삼성 계산기 개편 시 병합 검토.
7. **/company/simulator sitemap 등재 여부** — 2026-06 점검에서 페이지 유지
   판단됐으나 sitemap 미등재 상태. 운영 판단 필요 (verify-sitemap 제외
   목록에 기록).
8. **generateData.ts ↔ generateData2026.ts 동명 함수** — 용도 구분 주석은
   부착(전자는 /api/salary-table 전용). rename은 후속.

## 7. 검증 로그 (최종 게이트, 2026-08-24)

```
npx tsc --noEmit          : 통과 (에러 0)
npx eslint .              : 에러 0 / 경고 18 (기존 react-hooks)
npm test                  : 23/23 통과
npm run verify:tax        : 리터럴 보유 9곳 / 허용 9곳 / 위반 0
npm run verify:sitemap    : 정적 라우트 164 / sitemap 1,810 URL / 미등재 0
SSG 격자                  : 415개, sha256 e5b7ae06… (점검 전후 동일)
npm run build             : 통과 (2,325 페이지 정적 생성)
```
