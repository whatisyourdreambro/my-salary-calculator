# /salary 격자 정본화(S3-2) 스코핑 — 2026-09-12 (읽기 전용 조사, 코드 실행으로 검증)

계획: `next-upgrade-plan-2026-09-11.md` §4 S3-2. **실행 창은 10/11~10/31**(광고 배치 배포의 10/10 D+28 판정 단면인 `/table`·`/salary-db` 를 그 전에 건드리지 않기 위함). 1단계(GSC 중복 보고서 29건 내보내기)는 운영자 콘솔 작업.

## 1. 두 격자 — 숫자 검증 (모듈을 실제로 실행해 계산)

- **사이트맵 격자 211** = `src/app/sitemap.ts:443-476`: 5~19.5M 0.5M 단위 30 + 20~100M 0.5M 단위 161 + 105~200M 5M 단위 20. 거울: `src/lib/salaryStaticParams.ts:47-59` `sitemapGridAmounts()`.
- **정적 집합 416** = `getStaticSalaryAmounts()`(`salaryStaticParams.ts:137-154`) = 격자 211 ∪ 표 행 링크 금액(2026 annual·weekly/hourly 26·27 환산) ∪ 회사 430곳 entry 총액 ∪ 직업 62·지역 19·업종 27 평균×10000 ∪ 고정 링크. 코드젠 거울 `salaryStaticAmounts.generated.ts` 416 일치.
- **416 − 211 = 205** (계산값). 귀속: 표 행 생성기 189 · 회사 entry 20 · 직업/업종 3(220M·250M·300M) · 중복 −7. **생성기 없는 격자 밖 금액 0** — 205 전부가 내부 링크를 1개 이상 받고 있다.
- 205 의 규칙: [5M,100M] 에서 0.5M 배수가 아니거나, [105M,200M] 에서 5M 배수가 아니거나, 200M 초과(207M·218.5M·220M·250M·300M·350M). 예: 101,000,000·103,000,000(연봉표 1M 행), 26,835,600·25,882,560(시급 환산), 117,000,000(bcg-korea), 350,000,000(netflix).
- `/salary/[amount]` 는 `dynamicParams=false`(page.tsx:50), 416 전부 self-canonical(`seo.ts:158-200`), 미들웨어가 격자 밖 요청을 416 최근접으로 308.

## 2. `/salary/{n}` href 생성기 전수

| # | 호출처 | 현재 스냅 | 사이트맵 밖 href | 404 |
|---|---|---|---|---|
| 1 | `SalaryTable.tsx:63-67` `buildHref = round(raw × mult)` — 표 8쪽(2026·2027 × annual/monthly/weekly/hourly) + Interactive 래퍼 | 없음 | **544건 → 189 대상**(모바일 카드+데스크톱 표 이중 DOM 이라 HTML 상 ~1,088회) | 아니오(수집기 2가 416 에 넣음) |
| 2 | `monthly/[amount]/page.tsx:57-65,135,240` 로컬 `snapToSalaryGrid` | `isStaticSalaryAmount` 면 416 통과, 아니면 211 최근접 | **172건 / 78쪽 / 93 대상** — 416 통과 분기가 바로 원인 | 아니오 |
| 3 | `CompanyNarrative.tsx:192,240,303` `/salary/${entryTotal}` 원값 | 없음 | 23사 × 3 = 69 → 20 대상 | 아니오 |
| 4 | `CompanyBonusCalculatorLink.tsx:153-159` 폴백 CTA | 범위 검사만 | +23 (회사 합계 92건/23쪽/20대상) | 아니오 |
| 5 | `job/[slug]/page.tsx:202,218-220,266` ×10000 | 없음 | 5쪽, 220M/250M/300M | 아니오 |
| 6 | `industry/[slug]/page.tsx:145,172` | 없음 | 1쪽(consulting-accounting → 250M) | 아니오 |
| 7 | `region/[slug]`·`region/page.tsx` | 없음 | 0(우연히 전부 격자 위) | — |
| 8 | `salary/[amount]/page.tsx:144,318` 이웃(`getSalaryNeighborAmounts`) | 211 스냅(`snapToGrid`) | **0 — 유일하게 이미 정답** | — |
| 9 | `ShareableResult.tsx:15-21` 순수 수학 클론 | 211 | 0 | — |
| 10 | `salary-db/listed/[stockCode]/page.tsx:48-55` | 211 반올림 후 416 멤버십 가드 | 0 | — |
| 11~12 | 홈 인기 링크·본문 하드코딩(공무원/소방/경찰/교사·glossary·가이드) | 리터럴 | 0 | — |
| 13~14 | NextActions·검색 인덱스·RSS·위젯 | `/salary/{n}` 미생성 | — | — |
| 15 | `salaryRedirect.ts:47-55`(미들웨어) | 416 최근접 | 308 목적지 자체가 205 중 하나일 수 있음 | — |

잠복 함정: `/table/2027/{annual,monthly}` 는 `generateAnnualSalaryTableData2027()` 를 쓰는데 `tableRowLinkAmounts()` 는 2026 annual 만 수집(`:68`). 오늘은 두 생성기의 177행 preTax 가 동일해 404 0 이지만 선언되지 않은 결합 — 2026-09-06 `/salary/26835600` 사건과 같은 부류.

## 3. 스냅 헬퍼 현황 — 구현 4벌, **211 스냅 공개 함수는 없음**

`nearestStaticSalaryAmount`(416, `salaryRedirect.ts:28`), `getSalaryNeighborAmounts`+private `snapToGrid`(211, `salaryStaticParams.ts:176-202`), `isStaticSalaryAmount`(416 멤버십), monthly 로컬 클론(416 통과→211), ShareableResult 순수 수학 클론(211), listed 로컬 클론(211+가드). 계획 문구의 "`salaryStaticAmounts.generated` 사이트맵 격자"는 부정확 — 생성 모듈은 416 이고 격자 코드젠 쌍둥이는 아직 없다. (9/12 S2-2 가 `salaryReportHref`(416 기준, 범위 밖·괴리 2% 초과는 null) 를 추가 — S3-2 때 이 함수의 기준 집합만 211 로 바꾸면 된다.)

## 4. 제안 — 단일 헬퍼 + 게이트

- 새 리프 모듈 `src/lib/salarySitemapGrid.ts`(데이터 import 0, 클라이언트 안전): `SITEMAP_SALARY_GRID`, `snapToSitemapSalary(amount)`, `isSitemapSalaryAmount`, `salaryHref(amount)`. `salaryStaticParams.ts:47` 과 `sitemap.ts` 가 이것을 소비(격자·사이트맵·헬퍼 단일 소스). 코드젠 쌍둥이 `salarySitemapGrid.generated.ts` + `--check`.
- 마이그레이션(위험 순): SalaryTable(`"use client"` — 리프 모듈 import 로 buildHref 안에서 스냅) → monthly 클론 삭제 → CompanyNarrative 3곳·CompanyBonusCalculatorLink → job·industry·region → ShareableResult·listed 클론 삭제. 수집기 3종은 **레거시 URL 유지 목록**으로 라벨만 바꿔 유지(색인된 416 이 404 되면 안 됨).
- 게이트: (a) **빌드 후 정본 = `scripts/qa-page-quality.mjs`** — `classifyLink` 에 `^/salary/\d+$` 이면서 `sitemapPaths` 밖이면 `salary-offgrid` 분류 → exit 조건에 포함(소스 페이지별 발생 수 보고, 네트워크 불요). (b) 빌드 전 `verify:site` 의 `gen-salary-amounts --check` 확장(생성기 출력 ⊂ 격자, 허용목록) . (c) 단위 테스트 — `tax2026.test.ts:232-242` 패턴의 격자판 + 원시 `` `/salary/${ `` 템플릿 소스 스캔.
- "KR 노출 있는 격자 밖 금액은 사이트맵 추가" = `sitemap.ts:476` 뒤 `SITEMAP_EXTRA_SALARY_AMOUNTS` 상수(격자 함수도 소비). 목록은 GSC 에서만 나온다(콘솔).

## 5. 위험

- **본문 금액 ≠ href 금액**: `CompanyNarrative` 라벨 "연봉 11,700만원 실수령액" 이 115,000,000 으로 스냅되면 목적지 H1 과 어긋남 → 라벨도 스냅하거나 "가장 가까운 연봉 구간" 으로 표현. `/monthly` 환산 연봉 표기·`/table` 행(행 값 10,400,000 → 링크 10,500,000)도 동일 — 표가 가장 눈에 띄는 회귀.
- **순서**: 링크를 먼저 211 로 옮기면 205 쪽이 self-canonical 고아가 됨 → GSC 중복 29건이 악화. **사이트맵 추가(KR 노출분)와 같은 커밋**으로.
- 공유 링크·OG 는 무영향(`/share/{payload}`·`/api/og` 는 `/salary/{n}` 에 의존하지 않음). 416 은 `generateStaticParams` 에 계속 남겨야 함.
- 회사 430쪽은 10/10 판정 단면 — 링크 텍스트만 바뀌므로 광고 승인 항목은 아니지만 별도 커밋·`ad-audit --diff 0`.
