# 간이 계산기 본문 작성 규칙 (S3-1 · 2026-09-12)

콘텐츠 에이전트용. 대상은 `docs/calc-content-audit-2026-09-12.md` §2 의 후보 50종(우선)과 나머지 152종. 아래 규칙은 `src/lib/__tests__/calcSources.test.ts` 가 게이트로 강제한다 — 게이트가 막는 것은 협상 대상이 아니다.

## 0. 어디를 고치나 (병합 규칙)

- 본문 위치는 실측표 §3 의 '본문 파일' 열. `index.ts` 병합은 모든 필드가 `batch 값 ?? enrichment 값` — batch 파일(`batch1.ts`·`batch2.ts`·`expandedFinance.ts`·`expandedPractical.ts`)에 이미 있는 필드는 enrichment 를 고쳐도 반영되지 않으니 그 파일의 문자열을 고친다. 그 외는 enrichment 파일(`enrichments.ts`·`enrichments-ext-{a,b,c}.ts`)의 해당 슬러그 항목만 수정한다.
- `sources` 도 2026-09-12 부터 같은 규칙으로 병합된다. 출처 0건인 170종 → enrichment 항목에 `sources` 추가. batch sources 가 이미 있는 32종(expandedFinance·expandedPractical) → enrichment 에 넣으면 무음 폐기되므로 테스트가 실패시킨다. 그 32종의 기존 해외 출처는 다시 쓰지 않는다(호스트 규칙 면제분, 면제 집합 확대 금지).
- ★ 화면 위치 사실(기반 보고서에 보고됨): '공식 계산방법 참고' 블록은 `SimpleCalculatorView` 의 마지막 섹션 — 뷰 안 광고 3개(CalcResultAd·GuideMidAd·InArticleAd) 아래, `page.tsx` 의 CoupangBanner·HomeTopAd 위(관련 계산기 섹션과 같은 자리)다. 출처가 없던 계산기에 sources 를 채우면 그 두 유닛이 섹션 하나만큼 내려간다. 리드 결정(2026-09-12): 계획 S3-1 이 '출처 2건' 을 명시하고 문자열 범주(L·낮음)로 승인돼 있으므로 sources 를 채운다 — 이 블록은 관련 계산기 섹션과 같은 자리(뷰 안 광고 3개 아래, 페이지 하단 CoupangBanner·HomeTopAd 위)이며 결과 직하 CalcResultAd 와는 무관하다.
- 필드·compute·컴포넌트·라우트·광고 코드·`src/app/calc/samsung-bonus/*` 무접촉. `<title>`·description(`seoText.ts` 생성분 포함)은 2026-10-09 판정 창까지 동결.

## 1. 필드별 규칙

| 필드 | 규칙 |
|---|---|
| explanation | **수정 금지 — 바이트 동일 유지.** `seoText.calculatorSeoDescription` 이 description 이 60자 미만인 계산기에서 explanation 을 meta description 에 이어 붙인다(10/9 까지 메타 동결). 회귀 게이트: 202종 description 스냅샷 테스트 |
| details | 장문 본문(신설 2026-09-12). 화면에서 explanation 바로 아래 같은 섹션에 이어 렌더되고 메타에는 쓰이지 않는다. 규칙은 종전 explanation 규칙 그대로: 600~1,000자(원문 `.length`, 게이트 상한 1,200). 평문, 문단은 `\n\n` 로 구분, HTML·마크다운·이모지 금지. 4문단 고정: ① 무엇을 누구를 위해 계산하는지(기본값이 어떤 상황인지 한 문장 포함) ② 기본 입력값 예시 계산 — 입력값 전부와 compute() 의 primary·secondary 값을 그대로 인용(§2) ③ 적용 규칙·구간·상한·요율 — 문장 안에 기관명과 연도를 명시(예: 국민연금공단 2026년 기준 상한) ④ 이 계산기를 쓰면 안 되는 경우와 정밀 도구(정밀 쌍 `twins.ts`, /tools, 전용 페이지) 안내 |
| formula | 원칙 무접촉. compute 와 다를 때만 compute 에 맞춰 고치고 로그에 `formula≠compute` 로 남긴다 |
| faqs | 3~5개. 답변 120~300자. 기존 3개는 사실이 맞으면 유지, 4·5번째는 검색 의도형 질문(언제/얼마/차이/포함 여부) |
| caveats | 2~4개, 계산기별 개별 작성. 다른 슬러그와 글자 단위로 같은 문장 금지 — 실측표 B01·B02 문장을 포함해 복붙 금지. 각 항목은 이 모델이 빼놓은 것 1가지(특정 공제·상한·비과세·지역 차이 등)를 구체적으로 |
| sources | 정확히 2건 `{ title, url }`. 호스트는 `src/lib/simpleCalculators/sourcePolicy.ts` 의 `OFFICIAL_SOURCE_HOSTS`(하위 도메인 허용)·https 만. 제목 형식 `기관명 — 자료명(연도)`, 예: `국세청 — 근로소득 간이세액표(2026)` (연도는 `sourceYear()` 가 제목에서 읽는다). 두 URL 모두 실제 GET 200 확인 + 규정 연도 확인 후 §4 로그에 기록. law.go.kr 가독 URL(`/법령/<법령명>/제n조`)은 200 셸이 조문을 iframe 으로 싣는다 — 조문 원문·시행일은 셸 HTML 안의 iframe src(`/LSW/lsSideInfoP.do?lsiSeq=<셸의 번호>&joNo=<조번호 4자리>&joBrNo=00&docCls=jo&urlMode=lsScJoRltInfoR`)를 그대로 GET 해 확인한다(joNo 6자리·파라미터 생략형은 빈 셸만 온다, 2026-09-12 배치 D~F 실측). 목록 밖 호스트가 필요하면 sources 를 비워 두고 보고서에 후보 호스트를 올린다(허용 목록 추가는 별도 커밋) |
| title·description·keywords·fields·compute·relatedSlugs·publishedAt | 무접촉 |

## 2. 예시 계산 절차 (추정 금지)

1. `npx tsx scripts/calc-default-result.ts <slug>` — 기본 입력값과 compute() 결과(primary·secondary·note)를 출력한다. 이 출력 밖의 숫자를 예시 문단에 쓰지 않는다.
2. 표기는 화면 규칙(`SimpleCalculatorView` 의 formatNumber)과 같게: `원` 은 반올림 정수 + 천 단위 콤마, `%` 는 소수 2자리, 그 외 단위는 소수 최대 2자리. 값 자체는 바꾸지 않는다.
3. 결과가 `status: "invalid"` 이거나 note 만 있으면 예시 문단 대신 "기본값에서는 …(note 내용)" 으로 쓰고 로그에 남긴다.
4. compute 가 틀렸다고 판단되면 본문을 거기에 맞추지 말고 보고서에 올린다(compute 수정은 S3-1 범위 밖).

## 3. 금지 목록

- compute() 결과나 출처 페이지에서 추적되지 않는 숫자. 상수 리터럴을 연도·기관 없이 산문에 반복하는 것(최저임금 10,320원 단독 표기) — 2026년 최저임금 시급 10,320원(최저임금위원회 고시)처럼 연도+기관을 붙이거나 compute 결과를 인용한다.
- HTML 태그·마크다운 기호·이모지, 마케팅 문구(최고·완벽·무조건·단 3초 류), 타 사이트 비교·언급.
- 두 슬러그 이상에 같은 문장(보일러플레이트). 유의사항·FAQ 답변도 포함.
- 뉴스·블로그·위키·해외 .gov 를 sources 에 넣는 것. 광고·쿠팡·컴포넌트·라우트·제목·설명 접촉.

## 4. 사실 검증 로그 `docs/calc-content-facts-2026-09-12.md`

표 1행 = 주장 1개. 계산기당 최소 3행(예시 계산 1 + 출처 2), 본문에 쓴 요율·상한·구간은 각각 1행. 아래는 형식이며 값은 자리표시자다.

| slug | claim | source URL | fetched date | status |
|---|---|---|---|---|
| `<slug>` | 기본값 `<입력 A>`·`<입력 B>` → `<primary 라벨>` `<값>` | compute() | YYYY-MM-DD | computed |
| `<slug>` | `<본문에 쓴 규칙 문장 그대로>` | https://www.law.go.kr/... | YYYY-MM-DD | 200·2026 |

- claim: 본문 문장이나 숫자를 그대로. source URL: 출처 페이지, 예시 계산은 `compute()`. fetched date: KST 날짜.
- status: `200·<규정 연도>` / `computed` / `formula≠compute` / `FAIL <사유>`. FAIL 인 주장은 본문에서 뺀다.

## 5. 제출 전 게이트 (전부 exit 0, 파이프 없이 종료코드 직접 확인)

- `npx vitest run src/lib/__tests__/calcSources.test.ts src/lib/__tests__/computeLoader.test.ts` (커밋 전 전체 `npx vitest run` 1회)
- `npx tsc --noEmit -p tsconfig.json` · `npx eslint <수정 파일>` · `node scripts/ad-audit.mjs` (ERROR 0)
- `npx tsx scripts/calc-content-audit.ts --out docs/calc-content-audit-2026-09-12.md` 로 실측표를 갱신해 같은 커밋에 포함(설명자·출처·보일러 열 변화를 diff 로 확인).
- 커밋 메시지: 어떤 슬러그의 어떤 필드를 왜 바꿨는지와 로그 행 수. 본문에 큰따옴표 금지. `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` 로 끝.
