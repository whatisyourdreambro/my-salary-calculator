# 공식 수치 감시기 (fact sentinel)

사이트 본문에 남은 **낡은 공식 수치**(기준금리·최저임금·국민연금 상·하한·4대보험 요율·구직급여 상한)를 찾아
보고서로만 알려 주는 로컬 도구입니다. **사이트 파일은 절대 수정하지 않고**, 원격 저장소에 반영하는 동작도 없습니다.
Node 22 내장 기능만 쓰며 의존성을 추가하지 않습니다(16GB 로컬에서 1~2초, 100MB 안팎).

## 무엇을 하나

1. **정본 읽기** (`lib/canonical.mjs`) — 저장소 정본 상수를 정규식으로 읽습니다(TS import 없음).
   `src/config/minimumWage.ts` · `src/lib/taxConstants2026.ts` · `src/lib/taxConstants2027.ts` · `src/config/unemploymentBenefit.ts`.
   정규식이 안 맞으면 파일·필드 이름을 대며 종료 코드 1 로 멈춥니다(조용히 넘어가지 않음).
2. **사실 목록** (`facts.json`) — 저장소에 상수가 없는 공식 수치(한국은행 기준금리: 현재값·변경일·과거값)와,
   저장소 상수를 가리키는 사실(`canonicalRef`)의 과거값(`oldValues`)을 적습니다. 모든 값·날짜는 `verifiedAt` 에
   공식 페이지(bok.or.kr · minimumwage.go.kr · nps.or.kr · mohw.go.kr · moel.go.kr)에서 직접 대조했고 `verification` 에
   근거 문장을 남겼습니다. 1차 출처로 확인되지 않은 값(예: 2025년 장기요양 비율 12.95%)은 넣지 않았습니다.
3. **스캔** (`lib/scan.mjs`) — `src/app` · `src/components` · `src/lib` 의 .ts/.tsx(테스트·`*.generated.ts`·정본 파일 제외)에서
   사실별 앵커(예: '기준금리') 가까이의 수치를 찾습니다. 주석 속 수치는 화면에 안 보이므로 뺍니다.
   파일은 경로로 바꿉니다: `src/app/<경로>/page.tsx` 와 같은 폴더(하위 폴더 포함)의 Client·Content·faq → 그 경로,
   `src/lib/guides/*.ts` → `guides:<slug>`, `src/lib/simpleCalculators/*.ts` → `/calc/<slug>`, 그 밖 → `(공용)`.
   `--owners` 목록으로 담당 힌트(guides-workflow · oct)를 붙입니다.
4. **분류** (`lib/classify.mjs`) — 언급마다 네 가지 중 하나.
   - `ok`(정상): 현재값
   - `historical`(과거 서술): 맥락(±60자, 같은 문단)에 대체된 기간의 날짜·연도, 전환(→, 'N에서'), 과거 표지어(인상 전·당시·이전·추이 …),
     또는 현재값이 함께 나옴
   - `stale`(낡음): 과거값인데 현재 시제(현재·현행·지금·적용 중·최신·'인상 — 예·적금' …)거나 메타(키워드·제목·설명)에 있음
   - `unknown`(확인 필요): 그 밖의 과거값
   - 블록 규칙: 빈 줄로 나뉜 블록에 같은 사실의 stale 이 있고 현재값이 하나도 없으면, 블록의 나머지 과거값도 stale
     (예: `/savings-interest-2026` 의 '기준금리 2.75% 인상' 안내 상자 L117–136).
5. **공식값 확인** (`lib/live.mjs`, `--live` 일 때만) — 실행당 **요청 최대 2회**.
   ① `ECOS_API_KEY` 가 있으면 ECOS Open API(통계 722Y001 · 일별 D · 항목 0101000, 최근 90일)에서 최신값·변경일
   ② 없거나 실패하면 한국은행 누리집 기준금리 추이 표(robots.txt 확인 — `/portal/` 허용 — 후 GET 1회, 표 첫 행)
   ③ 둘 다 안 되면 저장소 정합성만 보고 사유를 보고서에 남깁니다.
   공식값이 `facts.json` 과 다르면 보고서 맨 위에 **'FACTS 갱신 필요'** 줄이 뜹니다 → 운영자 세션에서 공식 페이지를
   다시 대조하고 `facts.json` 의 `current`·`since`·`history`·`verifiedAt`·`verification` 을 함께 고칩니다.
   robots.txt 판정은 7일간 `--out` 폴더에 캐시해, 키 있는 실행에서 ECOS 가 실패해도 남은 1회로 누리집 폴백이 가능합니다.
   HTTP·robots 는 `scripts/trend-radar/lib/http.mjs`·`robots.mjs` 공용 모듈을 쓰고, 그 모듈이 아직 없는 브랜치에서는
   같은 규칙의 최소 내장 구현을 씁니다(보고서 참고란에 표시).
6. **갱신 슬롯** (`refresh-slots.json`) — 매년 돌아오는 수치 갱신 의무(1/1 요율 포인터, 7/1 연금 상한, 8월 최저임금 고시,
   9월 초 공무원 예산안, 12월 삼성 TAI·1월 OPI·잠정실적, 동결기 연말정산 재확인, 시즌 세트 교체 등). 각 슬롯은 근거 문서
   `경로:줄`과 그 줄의 문구를 가지며, 문구가 다른 줄로 옮겨졌으면 보고서가 새 줄을 알려 줍니다. 문서 근거가 없는 슬롯은 넣지 않습니다
   (예: '10월 초 SeasonalLinks 교체'는 문서가 9/26 으로 당겨 두었으므로 9/26 으로 기록).

## 실행

```bash
node scripts/fact-sentinel/run.mjs                 # 오프라인: 저장소 스캔만(네트워크 0회)
node scripts/fact-sentinel/run.mjs --live          # 공식값 확인 포함(요청 최대 2회)
node scripts/fact-sentinel/run.mjs --fixtures      # 픽스처 저장소·픽스처 응답(네트워크 0회)
  옵션: --today YYYY-MM-DD  --out <폴더>  --owners <목록파일>...  --strict
```

- 보고서: `<out>/sentinel-<날짜>.json`(기계용) · `<out>/sentinel-<날짜>.md`(한국어: 낡은 숫자 표와 `파일:줄`·수정 제안,
  확인 필요, 30일 안의 갱신 슬롯, 공식 수치 확인 결과).
- `--out` 기본값은 `scripts/fact-sentinel/.cache`(이 폴더의 `.gitignore` 로 커밋 제외). 매일 작업은 `TREND_HOME/sentinel` 을 씁니다.
- 종료 코드: `0` 보고서 작성 · `1` 설정/정본 파싱 오류 · `3` `--strict` 이고 낡은 숫자가 있음.
- 예산: 30초·200MB(초과하면 보고서 참고란에 기록).

## 환경변수

| 이름 | 필수 | 설명 |
|---|---|---|
| `ECOS_API_KEY` | 아니오 | 한국은행 ECOS Open API 인증키. ecos.bok.or.kr 에서 무료로 발급(운영자 본인). 매일 작업은 `trend.env` 로 넘깁니다. |

- 키는 **환경변수로만** 읽습니다. 저장소 파일·보고서·로그에 쓰지 않습니다. ECOS 는 키가 URL **경로**에 들어가므로
  로그·보고서에서는 `…/StatisticSearch/***/…` 로 가립니다. 영숫자 16~64자가 아니면 요청하지 않습니다.
- 키가 없어도 정상 동작합니다(누리집 표 폴백, 픽스처·오프라인 모드).

## 약관·출처 메모

- ECOS 출처 표기('출처: 한국은행 ECOS')가 이용 조건인지는 **1차 출처에서 확인하지 못했습니다.** 그래서 ECOS 수치는
  이 보고서 안에서 대조용으로만 쓰고, 사이트 페이지 본문에는 옮기지 않습니다.
- 한국은행 누리집은 robots.txt 가 `/portal/` 만 허용합니다(`Disallow: /` + `Allow: /portal/`). 표 페이지 1회만 받습니다.
- 뉴스·검색 결과·트렌드 페이지는 읽지 않습니다. 이 도구의 네트워크 대상은 `ecos.bok.or.kr`·`www.bok.or.kr` 두 곳뿐입니다.

## 왜 '금리 비교 페이지' 대신 감시기인가

금융감독원 금융상품통합비교공시시스템(금융상품 한눈에) 오픈 API 로 예·적금·대출 금리 페이지를 만드는 안은 채택하지 않았습니다.

- 오픈 API 이용약관 제9조: 실시간으로 제공되는 정보를 서비스와 연동할 수 있을 뿐, 정보를 복제·저장·전송할 수 없음
  → 빌드 때 값을 고정하는 정적 생성 페이지(CF 무료 플랜 필수 조건)와 맞지 않음
- 같은 약관 제6조: 제공받은 정보에 다른 내용을 삽입·수정해 왜곡하거나 임의로 변조할 수 없음
  → 세후 계산·정렬·순위 같은 가공이 위반 소지
- 금융소비자보호법 제22조(금융상품 등에 관한 광고) 규제와, 상품 비교·추천이 **중개**로 해석될 위험
- '은행별 대출금리 표'는 성장 제안서의 재제안 금지(탈락) 목록에 있음

대신 이미 있는 페이지의 공식 수치가 낡지 않았는지를 지키는 쪽이 같은 검색 수요(기준금리·예금 이자)에 대해
신뢰도(YMYL)를 올리고 법적 위험은 0 입니다.

## 발행기(publisher)가 쓰는 법

- 최신 `sentinel-<날짜>.json` 의 `staleRoutes`(공개 경로: `/savings-interest-2026`, `/guides/<slug>` …)로는
  브리프가 **링크하지 않습니다**(링크 신선도 가드레일). `staleShared` 는 경로를 특정할 수 없는 공용 파일 목록입니다.
- `topLines` 에 'FACTS 갱신 필요'가 있으면 그 사실을 인용하는 브리프는 건너뜁니다(사실 목록이 공식값과 어긋난 상태).
- `refreshDue` 는 30일 안의 갱신 의무입니다. 해당 페이지를 새로 링크하기 전에 갱신 여부를 확인합니다.

## 파일

| 파일 | 역할 |
|---|---|
| `run.mjs` | 명령줄 진입점(옵션·모드·보고서 쓰기·종료 코드) |
| `lib/canonical.mjs` | 정본 상수 읽기 + `facts.json` 검증·해석(오늘 기준 현재값·과거값·예정값) |
| `lib/scan.mjs` | 파일 목록·주석 가림·언급 찾기·경로/담당 매핑 |
| `lib/classify.mjs` | ok/historical/stale/unknown 분류 + 블록 규칙 |
| `lib/live.mjs` | ECOS·누리집 파서, robots 확인, 요청 예산, 키 가림 |
| `lib/report.mjs` | 보고서 JSON·한국어 마크다운, 갱신 슬롯 계산·문서 줄 확인 |
| `facts.json` · `refresh-slots.json` | 사실 목록 · 갱신 슬롯 |
| `fixtures/` | 테스트 픽스처. `repo/**.fixture` 는 가상 저장소(확장자 `.fixture` 로 tsc·eslint 대상에서 제외), 한국은행 표·robots 는 2026-09-26 실제 응답을 잘라낸 것, ECOS JSON 은 실제 응답(공개 체험 키로 받은 것) 잘라낸 것 3개 + 변경일 검증용 합성 1개(`*-synthetic.json`, 값은 한국은행 표 기준) |

## 테스트

```bash
node --test scripts/__tests__/fact-sentinel.test.mjs   # 오프라인, fetch 는 가짜
```

정본 정규식(실제 파일), 분류 골든(`/savings-interest-2026` L37·L117–136 = stale, 가이드식 '2.50%→2.75%→3.00% 추이' = historical),
경로 매핑, ECOS·누리집 파서, ECOS 경로 키 가림, 라이브 폴백 순서, `--strict` 종료 코드 3, 보고서 스키마,
금지 엔드포인트 문자열 검사를 다룹니다.
