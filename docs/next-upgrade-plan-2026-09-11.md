# 다음 업그레이드 계획 — 2026-09-11 이후 (구조 마감 10/31, 동결기 11/1~1/31)

작성 2026-09-11 KST, 적대 검토 2관점(근거·우선순위 / 실행 가능성·게이트) 반영본. 어젯밤 배포(`41ce72d`·`1c1fda2`·`0b0364c`·`27fcffd`)와
광고 배치 변경(`f2379fa`)의 **후속**이다. 근거는 [보고서](revenue-growth-overnight.md)의 발견 중 미구현 항목(검증 완료 항목과
**검증 미완료 항목 — NAV-04/05·CALC-06·SI-05/06 — 을 구분**), 기존 계획의 시점 게이트([10x 계획](revenue-10x-plan-2026-09.md) Phase 3
"구조 마감 10/31"·Phase 4 "11~1월 동결기 = 상수·메타·수치·offers.json·판정만"·§8 불변 규칙, [100x 계획](revenue-100x-plan-2026-09.md) §5·§10,
[마스터플랜](revenue-masterplan-2026-09.md) §12-2), 시즌 일정(추석 9/24~26, 연말정산 11~1월, TAI 12월, OPI 1월)이다.
수익 수치는 전부 **가정**이며 실측 전에는 성과로 세지 않는다.

## 진행 상태 (2026-09-12 갱신 — 실행 기록은 보고서 §9)

| 항목 | 상태 | 커밋 | 비고 |
|---|---|---|---|
| S1-0 핀 계측 속성 | ✅ 배포 | `1c8a624` | 9/19 D+7 표본 확보 |
| S1-5 SEO 위생 | ✅ | `ec6ebcd`·`4a6ce83` | /community→/qna, /company/:id 규칙(끝슬래시 포함 제외). ★9/25: '삭제는 ⑩ 결정 후' 해소 — 승인 A27 `6f85a2f5`(§9 25번) |
| S1-3 공무원 2027 링크 | ✅ | `7e7e6c8`·`7b16228` | 라벨 "일반 근로자 기준 실수령 참고"(리뷰: /monthly 는 4대보험 기준) |
| S1-2 성과급 22쪽 다음 링크 | ✅ | `add77fd`·`83679d6`·`6c3a260` | CalcResultAd 아래 32px 고정, 삼성 무접촉 |
| S1-1 시즌 키 자동화 | ✅ | `6237a80`·`7a9f8fc` | 9/26·12/1 은 **그날 이후 첫 푸시**에 반영(자동 푸시 워크플로는 운영자가 9/12 되돌림) + CF 퍼지. JAN 수동, 2027-03-11 만료 알람 |
| S1-6 계측 2종 | ✅ | `c72ba14`·`e1f8254` | GA4 맞춤 측정기준 5개 등록은 운영자(§6). ad_height 는 크리에이티브(iframe) 높이 |
| ⑧ /chuseok-bonus-2026 CalcResultAd 이동 | ✖ 폐기(9/12) | — | 순증 아님(마스터플랜 ⑧)·광고가 이미 결과 카드 직상·GA4/GSC 행·ad-depth 기준선 없음·9/26 시즌 종료까지 13일 → 판정 불가 |
| S2-5 /home-loan 스니펫 실험 | ✅ | `f19e71e` | description 만(114자), 판정 10/5 서치어드바이저 |
| S2-1 정확성 3건 | ✅ 9/12 | `d10c7df`·`461b8a7`·`d55685f`·`cdf3176`·`687b9dd` | 4.345주→209h 통일(출력 변경 5라우트, 보고서 §10-1), 상수 정본화, verify:tax 확장. ★리뷰: explanation 은 메타에 붙는다 → 복원 + 202종 스냅샷 게이트 |
| S2-2 회사 표 실수령 hop | ✅ 9/12 | `54febe1`·`c622d07`·`70a89d0` | 1,890셀 링크(null-not-clamp 260셀 평문), verify:site 430쪽 게이트, 모듈 company-salary-net |
| S2-3 중복 링크 | ✅ 9/12 | `9df7b5b`·`854d000` | exclude+백필(항목 수 불변). calc 82→19쪽 잔여 = pins⊂cards·NextActions 겹침(광고 위 높이 감소라 **승인 항목**) |
| S3-5 허브 H1 · 시즌 메뉴 | ✅ 9/12(부분) | `219e74e`·`fffc8dd` | 허브 12곳 H1 키워드화(홈·/calc 는 9/20 후), 헤더 시즌 38→10~12/키 |
| S3-1 기반 · 본문 50종 | ✅ 9/12 (본문 99/202) | 기반 `25595ac`·`adf0c1f`·`d854eec`·`f8795ac` · 1차 49종 `a9d5cc5`~`5eb2ae0` · **2차 50종 `aa45940`(D 16)·`ed12743`(E 26)·`103b138`(F 8)** | `details` 99/202(중앙값 894자)·공식 출처 2건 99/202·보일러 B01 50→42·B02 47→21. 작성→적대 검증→수정→결정론 린터→적용 대조. 사실 로그 A~F. formula≠compute 교체 2건(real-estate-flip-cost·real-estate-capital-gains-quick). 잔여 103종은 동결기에도 문자열만으로 계속(다음 후보 `payment-holiday-cost`부터, 보고서 §11) |
| S3-4 이월 확인 | ✅ 9/12 | `f0b4533`·`0341bce` | 문서 갱신(10x §5-11 해소·L07' 강등 후보·마스터플랜 ⑥⑦·감사 §7-5) + `/guides/nurse-salary` 보강은 **guides/layout.tsx 의 PageFooterAds 아래 전용 슬롯**(`GuideSupplement`, pathname 키)으로 렌더(본문·page 레벨 삽입은 레이아웃 푸터 광고를 밀어 금지 — 빌드 HTML 순서 검사로 확인). M05 는 10x §5-12 승인 대기라 미실행, L07' 강등 확정은 9/13 GA4 기기 비중(운영자) |
| S2-0 삼성 9/21 배치 | ✅ 9/21 | `22eb3bad` | L13b ② 본체(opiData.ts 단일 소스·TAI H2 null 슬롯+TAI_LATEST 라벨 파생·FIXED_OPI1_RATE 파생·annualOp.ts 1/8 트리거) + 공유 상태 URL 해시(d/s/p/y/o1/cr/ins, FloatingShareBar 결과 모드 동기 — CALC-06 흡수, `?v=` 없음) + 순수 model.ts 분리·회귀 테스트 33건(858/579/269%·MX 50%·세후 동결값·잔존 문자열 게이트) + page.tsx '월 기본급 대비' 오기 정정(F11) + SK 문장 9/16 가결 동기화. 광고 무접촉·ad-audit --diff 0. 승인 D(footer, 광고 위)·승인 G(seedCompanies)는 미적용 — 운영자 승인 대기 |
| S3-2 격자 정본화 | ⏳ 10/11~ | — | 스코핑 완료 `docs/salary-grid-canonicalization-scoping-2026-09-12.md`(416/211/205 검증, 생성기 15곳, 게이트 설계). 1단계 GSC 내보내기는 운영자 |

### 2026-09-14 후속 실행 — S3-1 금융 우선군 마감

- 배치 G: `payment-holiday-cost`, `portfolio-rebalance-amount`, `savings-ladder-cashflow`, `systematic-withdrawal-runway` 4종의 details·FAQ·유의사항·공식 출처를 보강했다. 본문은 각 870~931자·4문단, FAQ 4개, 개별 유의사항 3개, 공식 출처 2개다.
- 누적 본문 및 공식 출처 2건 보유는 **103/202종**, 잔여 **99종**이다. 대출·투자 우선군의 미완료 4종을 마쳤으며 다음 실측표 후보는 `auto-insurance-quick`이다. 보험·법인세 등은 현재 계산 가정의 타당성을 먼저 확인하고 본문을 작성한다.
- 제목·description·explanation·입력 필드·계산 로직·광고 코드는 동일하다. 전체 1,717테스트, TypeScript·변경 파일 ESLint, 운영용 빌드, 광고 정적 검사(ERROR/WARN 0), 생성 HTML 4쪽의 본문·FAQ·정본 URL·공식 및 내부 링크 검사를 통과했다. 독립 검토에서도 수정 필요 사항이 없었다.
- 근거: [배치 G 사실 로그](calc-content-facts-2026-09-14-G.md), [갱신 실측표](calc-content-audit-2026-09-12.md). 수익 효과는 아직 측정하지 않았으며 기존 날짜별 실험·판정 조건은 유지한다.

## 0. 원칙

1. **선정 기준**: 근거 강도(실측·검증 완료 > 코드 확인 > 추정) × 도달(세션·노출) × 회귀 위험 × 비용. 추정만 있으면 "실험"으로 분류하고 28일 창과 판정 소스를 붙인다.
2. **재제안 금지(문서화된 결정)**: 헤더 상시 DOM 축소(2027-02), 간이↔전용 계산기 canonical/noindex 통합(9/10), 홈 계산기 ssr:false 해제, 폰트 fallback 지표, 사이드바 스티키 재배치(10/17 승인 슬롯 그대로), **Display2 성과급 확산(실험 #2a 잠금)**, **회사 페이지 title 재변경(2026-07-06 결정·L10' "title 절대 불변")**, /salary 저노출 noindex, 계산기 개수 확대.
3. **광고 규칙**: 새 UI 는 광고 아래(순수 여백도 광고를 밀면 승인 항목). 같은 슬롯 경로당 1회. 슬롯 ID·env·쿠팡 파라미터 불변. 광고 컴포넌트 내부 변경(AdPlacement)은 승인 항목. 위치 변경은 `npm run ad-depth`(CHROMIUM_PATH) 전후 JSON 을 `docs/ad-depth/` 에 남긴다 — 이 측정은 googlesyndication 을 차단해 **자동광고를 제외한 수동 컨테이너 기하**임을 명시한다.
4. **판정 창 분리**: 콘솔 실험(인페이지 간격 9/24·10/8, 앵커 ON 9/21→10/5)과 코드 배포를 섞지 않는다. 광고 위치를 바꾸는 배포는 9/20 이전 또는 10/6 이후에만. 삼성 성과급 4파일(page·shared·Client·taiData)은 9/21 이후 한 번에만 접촉(100x §10-3).
   - ★**2026-09-25 정정(감사 B5)**: 두 콘솔 실험 모두 판정할 것이 없다 — 인페이지 간격 실험은 **9/19 종료·기존 50px 유지**(확률 99%), 앵커는 **9/1 이전부터 이미 ON 이라 처치 없음**(10/5 판정 취소 → 28일 형식 스냅샷). 그래도 **9/21~10/5 광고 위치 동결과 10/10 D+28 전제(9/12~10/9 해당 라우트 광고 접촉 0)는 유지**한다. 새 오버레이 변경은 10/10 조회 이후. 추가로 9/24 자동 인페이지 복구(`4d80ce3e`)의 **P0 확인(7완료일 10/2·14완료일 10/9) 전에는 광고량·위치 변경을 겹치지 않는다**(운영자 9/24 보고서 §7) — 승인 항목의 날짜는 `docs/ad-experiments.md` 2026-09-25 절 4.
5. **동결기**: 11/1 이후 컴포넌트·라우트·광고 위치 변경 금지. 상수·메타·수치·offers.json·판정, 그리고 간이 계산기 본문 문자열(description/faq/sources)만.

## 1. 판정·날짜 캘린더 (새 작업보다 우선)

| 날짜 | 무엇 | 소스 | 기준·주의 |
|---|---|---|---|
| 9/12 전 | **S1-0** 다음 계산기 핀 nav 에 `data-msy-module="calc-next-pins"` 1속성 배포(현재 트래커 없음 → D+7 지표가 0 으로 읽힘) | 코드 | 광고 무접촉·높이 0 |
| 9/17 | 전면최적화(9/3) D+14 | AdSense·GA4 | **절단점 9/11** — 9/3~9/10 만 유효(9/11 두 배포가 창 끝 6일을 오염) |
| 9/19 조회 | 9/11 배포 D+7 (창 9/12~9/18) | GA4 hostname=www: `/calc/` 랜딩 세션당 페이지·이탈률, `calc_success/calc_start`, `guide_cta_click` position=calc-next-pins(S1-0 이후만 표본) | 계측 누락·오류 점검 위주, 판정 아님 |
| 9/20 | M01 GSC 28일 판정(KR 필터, 성과급 필터·삼성 분리 집계) | GSC | 그 전 홈·/calc title/description 변경 금지 |
| 9/21 | 앵커 ON(승인⑥, 운영자 콘솔) → 10/5 판정 | AdSense | 이 창(9/21~10/5) 안에서 광고 위치 변경 배포 금지. ★**9/25 정정: 처치 없음**(앵커·사이드레일·전면 9/1 이전부터 ON) — 판정은 취소, 위치 동결은 10/10 전제 때문에 유지 |
| ~~9/24~~ | ~~콘솔 인페이지 간격 실험 D+14~~ | ~~AdSense 실험~~ | **9/25 삭제**: 실험은 9/19 종료·기존 50px 유지(99%, 대안 −3%) — `docs/ad-experiments.md` 2026-09-25 절 3(a) |
| 9/25~ | **P0 — 9/24 자동 인페이지 복구 확인**(9/25 추가) | AdSense 날짜×광고 형식·광고 단위 | 첫 완료일 9/25. 자동 인페이지 = 인페이지 형식 행 − 수동 단위 노출. 캐시된 /salary/* 는 Purge 뒤부터 |
| **9/26 00:10 KST** | **예약 시즌 재빌드 SEP→OCT**(9/25 추가, B6) — 00:00 KST 이후 빌드여야 `gen-season-key` 가 OCT 를 박는다. 예약 실행이 없으면 CF Pages 'Retry deployment' 또는 아무 main 푸시 | 빌드+콘솔 | 뒤이어 **운영자 Purge**. `cf-purge.yml` 은 main push 때만 돌므로 Retry deployment 로 재빌드했으면 Purge 는 수동 |
| 9/26 | 시즌 세트 푸시 뒤 Purge 재확인(9/25 추가) | 콘솔 | 운영 HTML `data-season-key="OCT"`·헤더 '추석' 0건 |
| **10/1(목) 00:00 KST 이후** | **보유세 납부기간 재빌드 — 9월분 → 비시즌**(9/25 추가, B6 DATE-15) — `/property-holding-tax-2026` 배지·헤더·description·FAQ 기한은 빌드 시점 KST 날짜로 고른다(`src/lib/propertyTaxPeriod.ts`, SEASON_KEY 와 별개) | 빌드+콘솔 | CF Pages 'Retry deployment' 또는 아무 main 푸시 → **운영자 Purge**. 확인: 운영 HTML description·배지에 `9/16~9/30` 0건, `재산세 7·9월 / 종부세 12월 1~15일` 있음 |
| 10/2 조회 | P0 7완료일(9/25~10/1)(9/25 추가) | AdSense | 자동 인페이지/PV — 회복 ≥2.4 · 부분 1.2~2.4 · 미회복 <1.2(기준선 9/1~9/9 2.99, 9/10~9/23 0.72). 회복 시 10/6 부터 광고 수·위치 불변 항목만 |
| **9/26(토)** | **시즌 세트 SEP→OCT 교체** — S1-1 미배포 시 3파일 수동 한 줄(`seasonLinks.ts:185`·`SeasonalLinks.tsx:185`·`HeaderSearch.tsx` KO_CHIP_SETS) + `grep 추석` 0건 게이트 + CF 캐시 퍼지(운영자) | 코드+콘솔 | 8/17 만료 방치 사고 재발 방지 |
| 10/5 | ~~앵커 판정~~ → **처치 없음, 28일 광고 형식 스냅샷**(9/25 정정) | AdSense | 판정 아님. 기록만(앵커·인페이지·전면·사이드레일 행). /home-loan S2-5 는 기존대로 '참고' 판정 |
| ~~10/8~~ | ~~콘솔 간격 실험 D+28~~ | ~~AdSense~~ | **9/25 삭제**: 9/19 종료 |
| 10/9 조회 | P0 14완료일(9/25~10/8)(9/25 추가) | AdSense | 미회복이면 모든 광고 승인 항목 보류·원인 재조사. 회복이면 10/10 부터 404·오류 화면 자동광고 정지(8번)·/salary A36 |
| **10/10 조회** | 9/11 1차 배포 **및** 광고 배치 D+28 — 창은 둘 다 **9/12~10/9**(첫 완전일 동일) | GSC 페이지 필터 `/calc/`(클릭·노출·CTR·순위), GSC 404 수(312 기준), AdSense URL 채널 `/calc`·`/calc/samsung-bonus`·`/salary-db`, 광고단위 CALC_RESULT·HOME_TOP·DISPLAY_2, GA4 `ad_filled/ad_unfilled` | 두 배포는 T0 가 같아 **시간축으로 분리 불가** → 라우트 단면으로 분리: 광고 배치 전용(/table 4종·/salary-db/[id]·/calc 인덱스·성과급 허브) vs 1차 전용(/calc/[slug] 202·/guides·회사 layout). **이날 전에는 calc 제목·설명 재변경 금지.** 전제: 9/12~10/9 사이 해당 라우트 광고 접촉 커밋 0건. ★**9/25 추가 — 창 안의 교란**: 9/10~9/24 자동 인페이지 붕괴 → 9/24 복구(창을 9/12~9/24 · 9/25~10/9 로 분리, 페이지 RPM·URL 채널 RPM 은 판정 축 제외, 수동 광고단위 행만) · `981dde76` 홈 첫 광고 하강(9/19, '/' 분리) · 9/23 1102 장애(제외 또는 PV 당) · 감사 통합 배포(광고 무접촉, /calc/[slug] 일부 본문·계산값 변경) — 상세 `docs/ad-experiments.md` 2026-09-25 절 3(c) |
| 10/6~10/31 | 운영자 9/25 승인 광고 항목 순차 적용(9/25 추가) | 코드 | 10/6~ A14 홈 CalculatorTabs 오류 경계(광고 수·위치 불변) → 10/10~ 404·오류 화면 자동광고 정지(8번)·/salary A36 → 10/11 주 결과창 오클릭(5번)·A15, 연말정산 단일 실험(22번) 시작 가능 → 10/18 주 광고 위 UI 이동(6번)·회사/보너스 A36 → 10/25 주 배치 정리(7번). 한 주에 한 묶음, 10/31 구조 마감. 비광고 10/11 이후 항목은 §9 |
| 10/17 | /calc/hyundai-bonus 9/19 변경분 D+28 | 네이버 서치어드바이저 | 기존(마스터플랜 §0-α). 이 판정 전 hyundai title·description 변경 금지 |
| 10/19 | 세션 5(lite 색인 게이트·인피드) | 기존 계획 | — ★9/25: lite 게이트 판정식 개정(크롤 커버리지 ≥70%·호스트 양호 14일일 때만 품질 판정, 아니면 '판정 불가(크롤 제한)') — 10x L16' |
| **11/25(수) 00:00 KST 이후** | **보유세 납부기간 재빌드 — 비시즌 → 종부세 12/1~12/15**(9/25 추가, B6 DATE-15) | 빌드+콘솔 | CF Pages 'Retry deployment' 또는 아무 main 푸시 → **운영자 Purge**. 확인: 운영 HTML 배지 `종합부동산세 납부기간 12/1~12/15`. 코드 변경 없는 재빌드라 동결기와 무관. 12/16 00:00 KST 이후 첫 배포에서 비시즌 문구로 자동 복귀(같은 절차) |
| 통합 배포 T0+7 | 용어집·QnA 1102 비율 확인(9/25 추가, 승인 A28 조건) | CF 대시보드 | ≥2% 면 한글 슬러그 정적화 프로토타입(로컬 wrangler) → 10/31 전 착수, 미만이면 보류 |
| 통합 배포 T0+28 | 네이버 저CTR 3쪽 제목 판정(9/25 추가, B20) | 네이버 서치어드바이저 페이지별 | `docs/gsc-sniping-log.md` Round 3 |

## 2. 스프린트 1 — 9/12~9/25 (시간 제약·사고 예방·계측 먼저)

| # | 항목 | 근거(등급) | 변경 | 비용·위험 | 승인 |
|---|---|---|---|---|---|
| S1-0 | 핀 계측 속성 | 코드 확인: `SimpleCalculatorView` 핀 nav 에 `data-msy-module`·onClick 없음 → `InternalLinkTracker` 미계측 | `data-msy-module="calc-next-pins"` 1속성 | S · 0 | 불요 |
| S1-1 | **시즌 세트 날짜 게이트** | 코드 확인: 수동 한 줄 교체 3파일, 8/17 만료 방치 사고 기록(`SeasonalLinks.tsx:8`) | `seasonalCalendar.ts` 에 `pickSeasonKey(now): "SEP"\|"OCT"\|"DEC"` 순수 함수(JAN 은 수동 유지 — 1/2 전 사람 확인 2건: 공무원 2027 확정 여부·간소화 오픈일). 3파일이 이 키로 세트를 고른다. **빌드 시점 키만 사용, 클라이언트 교체 없음**(서버 컴포넌트 320쪽 클라화·번들 증가 회피; 배포가 거의 매일이라 다음 푸시에 반영). 게이트: `verify:site` 에 세트 만료 임박/경과 WARN, 주간 헬스체크(`scripts/health-check.mjs`)에 '프로덕션 /table/2026/annual 시즌 heading == 오늘 키' 검사(미교체·캐시 잔존 알림). 경계 테스트(9/26·12/1). | S · 낮음 — SeasonalLinks 는 /salary·/monthly·/table 모두 마지막 광고 아래라 광고 규칙과 무관 | 불요 (9/26·12/1 CF 퍼지는 운영자) |
| S1-5 | SEO 위생(축소판) | 라이브 확인: `/community` 만 삭제 후 무리다이렉트(2025-09). `/company/[id]` 는 Edge permanentRedirect 로 308 중(마스터플랜 §12-2 ⑩ 결정 대기) | `/community` → 적절한 허브 308 1건 + `/company/:id`(compare·simulator 제외) next.config 규칙 = ⑩의 1단계(Edge 페이지는 폴백 유지, 삭제는 ⑩ 결정 후). **nurse-salary 는 살아 있는 가이드(397노출) — 리다이렉트 금지, S3 보강 대상** | S · 낮음 | 불요 |
| S1-6 | 계측 2종 | ADS-05: 슬롯 예약 높이 vs 실제 채움 자료 없음 · PERF-08: 데스크톱 LCP 108 URL 의 요소 미상 | `ad_filled` 에 `ad_height`·뷰포트 폭 버킷(승인②(2026-09-05 계측 예외)의 필드 확장으로 분류 — 요청·렌더·dedup 로직 무변경) · `web-vitals/attribution`(패키지 직접 의존 확인 후) 로 `lcp_element`·`cls_largest_shift_target` 20% 샘플, 기존 `web_vitals` 이벤트 형태 유지 | S · 낮음 | GA4 맞춤 측정기준 2개 등록(콘솔) + 승인② 확장 동의 |
| S1-3 | 공무원 2027 실수령 이동(높이 중립) | 3위 랜딩(1,865세션/28일), 평균 참여 14초. 결과 직하 구간에 실수령 링크 0건(페이지 하단 `/job/civil-servant-9` 링크는 있음). **검증 미완료(NAV-04)** | 선택기 카드 기존 링크 행(`CivilPayForecastSelector.tsx:69-72`, 2개)에서 페이지 내 앵커 "전체 50개 예상액 비교"를 `/monthly/{격자}`(예상 월 기본급 기준, `monthlyStaticParams` 격자 스냅) 링크로 **치환** — 링크 수 2 유지, 높이 0(바로 아래가 HomeTopAd :170). position `civil-forecast-net` | S · 낮음(높이 불변 증명 시) | 카드에 행을 **추가**하는 변형이면 승인 |
| S1-2 | 성과급 22쪽 결과 직하 광고 **아래** 다음 링크 | 코드 확인: 22쪽 모두 page.tsx 가 Client 직후에 CalcResultAd 보유(이미 결과 직하). 첫 광고 깊이(sk-hynix 3,622px·hyundai 2,390px, 9/11 로컬 실측, 자동광고 제외)는 히어로+입력폼 길이 탓 → **광고 이동 이득 ~0**. 부족한 것은 광고 아래 다음 링크(NAV-05, 검증 미완료). 도달: GA4 28일 랜딩 hyundai 519세션(0.7%), 나머지 상위 10 밖 — 소규모 | 광고 무접촉: page.tsx `<CalcResultAd/>` 직하에 서버 컴포넌트 `BonusNextLinks`(회사 DB 1 + 형제 계산기 2, **OfferSlot 미포함 — 제휴 표면 불변**) 1행. 삼성 `shared.tsx` 의 ResultNextLinks 는 **복제**(이동 금지, 삼성 4파일 무접촉). 22개 page.tsx 1행씩 앵커 스크립트, ad-audit --diff 0 | S · 낮음 | 불요 (광고·제휴 무접촉) |

스프린트 1 예상 효과: S1-0·S1-1 은 계측 확보·사고 예방(배수 0). S1-2 는 도달 소규모·효과 미측정(실험). S1-3 은 세션당 페이지(가정). ⑧ `/chuseok-bonus-2026` CalcResultAd 이동은 9/24 이후 무의미 — **9/24 전 결정 없으면 폐기**.

## 3. 스프린트 2 — 9/26~10/10 (정확성·유입 엔진, 삼성 1회 접촉)

| # | 항목 | 근거(등급) | 변경 | 비용·위험 |
|---|---|---|---|---|
| S2-0 | **삼성 성과급 9/21 이후 1회 접촉 배치** | 100x §10-3 규칙, 10x L13b(9/21 이후 첫 슬롯) | L13b 본체(`opiData.ts` 단일 소스·TAI H2 null 슬롯·`FIXED_OPI1_RATE` 치환) + **공유 상태 URL — 10x/100x 가 정의한 해시 규격(d/s/p/y+o1/cr/ins, FloatingShareBar 동기) 그대로**(CALC-06 은 여기 흡수, `?v=` 신설 금지) + 회귀 테스트(791/553/252%·MX 50%) | M · 중간(#1 랜딩) |
| S2-1 | 계산 정확성 3건 | SI-04: 시급↔월급 환산 208.56h vs 정본 209h — 차이 **0.2%(4,541원/2,156,880원)**, 사이트 내 불일치 · SI-07: 표시 공식 ≠ compute(복리·근로소득세 간이·퇴직금) · SI-08: 10,320·68,100 하드코딩 | `4.345` 사용처 전수(grep) → `MONTHLY_HOURS` 파생, 계산기별 기대값 고정 테스트(최저임금 왕복 포함), 설명·FAQ 예시 숫자 동기(본문만 — title/description 무접촉), 공식 문구를 compute 와 일치, 상수를 `minimumWage.ts`·`taxConstants` 참조로(§5 의 1/1 전환이 덮도록), `verify-tax-constants` 패턴 추가 | S · 낮음 · **수익 영향 0(신뢰)** |
| S2-2 | 회사 페이지 → 실수령 hop(높이 0) | NAV-10: 유입 엔진 430+쪽 표 금액 셀 링크 0. 100x 가 기각한 "HomeTop 아래 링크 스트립"과 겹치지 않도록 **행 추가 금지** | `CompanySalaryTable` '실수령' 열 **1개** 셀 텍스트를 링크화(행당 1, 쪽당 ≤5, 행 높이 불변). 스냅은 서버 정본 `isStaticSalaryAmount`/`nearestStaticSalaryAmount`(`ShareableResult` 로컬 복제 2벌은 `src/lib` 로 승격 후 제거). 게이트: `verify:site` 에 회사 430쪽 생성 href ⊂ 정적 집합 전수 검사 + qa:crawl 404 0 | S · **중간**(유입 엔진 링크; dynamicParams=false 라 1원 어긋나면 404) |
| S2-3 | 중복 다음 링크 제거 | NAV-06: 홈(`SalaryCalculator.tsx:487/500/503`)·/salary 416쪽·calc 72쪽에서 NextActions·RelatedCalculators·relatedSlugs 가 같은 대상 반복 | `getRelatedCalculators(path, limit, category, exclude)` 추가(현 시그니처에 exclude 없음), 페이지가 NextActions href 전달, 세 블록 href 중복 0 테스트 | S · 낮음 |
| S2-4 | ~~회사 title·description~~ → **L10'(승인⑧) 실행 시 흡수** | 회사 title 은 2026-07-06 결정·"절대 불변". description 은 승인⑧(공시 평균 후미 삽입, 9/28 이후)이 같은 430쪽 대기 | L10' 커밋에 'description 150자 상한·핵심 숫자 선두' 규칙 동봉. title 무접촉. 판정 28일 KR 필터 | — |
| S2-5 | 네이버 저CTR 스니펫 실험(**가정**) | 네이버 최근30일 /home-loan 98,097노출 0.5%(순위·질의 분해 없음 → 원인 불명). 홈은 M01①(9/20 후 1회)에 흡수, /calc/hyundai-bonus 는 10/9 `/calc/` 창 이후 | `/home-loan` 1쪽만: 질의어("주택담보대출 계산기") 선두 description. 대조군 = 그 외 저CTR 페이지. 판정 소스 **네이버 서치어드바이저 페이지별 CTR 28일**(10/5 세션 내보내기 전후) | S · 낮음(효과 미보장) |
| 이월 | M01 재범위화①(홈 title/H1/description 헤드 계산기 정합, 9/20 판정 후 1회) · InstallPwaBanner PV 카운트 수리(9/18~20) · 정본 회사→lite 이웃 카드(9/21 이후) | 100x §5 | 기존 조건 그대로 | — |

## 4. 스프린트 3 — 10/11~10/31 (구조 마감 전 큰 것)

| # | 항목 | 근거(등급) | 변경 | 비용·위험 |
|---|---|---|---|---|
| S3-1 | **간이 계산기 상위 50종 본문 보강** | SI-05/06(검증 미완료): 설명 짧고 FAQ 3개 고정, 유의사항 동일 블록, 170종 출처 없음(있어도 해외). GSC 미색인 668 은 **사이트 전체** 수치 | **선행**: 202종 설명 길이·FAQ 수·출처 실측표 1장(스크립트) + 9/13 GSC URL-prefix 속성으로 `/calc/` 몫 산출. 세금·급여·대출·부동산·투자 50종부터 본문 600~1,000자(기본값 예시 계산 필수, 보일러플레이트 금지), 출처 2건(국세청·법제처·국민연금공단·고용노동부·금감원), 유의사항 개별화. **`<title>`·description 무접촉**(10/9 판정 창). 주당 15~20종, 사실 검증 로그(출처 URL 200·연도) `docs/` | L · 낮음(문자열) — 동결기에도 문자열만 계속 가능 |
| S3-2 | /salary 격자 밖 205쪽 정본화(3단계) | SEO-12: 정적 416 − 사이트맵 격자 211 = 205, self-canonical·사이트맵 밖. GSC "다른 canonical 선택" 29 | 1단계(10/11 전, 콘솔): GSC 중복 보고서 29건 실제 대상 확인 → 2단계(10/31 전, 구조): 표·회사·직업 링크 생성기를 `salaryStaticAmounts.generated` 사이트맵 격자로만 스냅(단일 헬퍼, 로컬 복제 제거) + `verify:site` '내부 href ⊂ 격자' 게이트; KR 노출이 있는 격자 밖 금액은 **사이트맵에 추가** → 3단계(동결기 가능, 메타): canonical 은 기본 유지, 29건 목록 중 KR 노출 0 인 URL 에 한해 검토(canonical≠redirect — 본문 금액 불일치 시 무시될 수 있음) | M · **높음**(유입 엔진 색인) |
| S3-3 | ~~광고 예약 높이 재조정~~ → **2027-02(Phase 5) 후보** | AdPlacement 내부 = 승인 항목("코드 선행 금지", ad-experiments.md). S1-6 자료 4주는 10/23 에야 차고 10/17 사이드바·10/19 판정과 겹침 | 11~1월 자료 축적만, 2월 승인 상정 | — |
| S3-4 | 기존 계획 이월 확인 | 10x·100x·마스터플랜 | **문서 갱신 먼저**: 10x C6 → ✅ 2026-09-11 `f2379fa`(삼성 1쪽만 해소, 타 22쪽은 OfferSlot 미배치 상태 유지), §5 승인 11 삭제, Phase 4 securities 전제 충족 표기, PageFooterAds 순서(승인 대기 #5) 완료, 마스터플랜 §12-2 ⑥⑦⑧ 상태 · L07' 사이드바: **강등 후보**(9/8 AdSense 기기 분해 데스크톱 수익 16.6%, 자동 사이드레일 ON 과 중복) — 9/13 GA4 기기 비중으로 확정 · M05 리스트 다이어트 · `/guides/nurse-salary` 온페이지 보강(연차·직군 섹션+FAQ, 마지막 광고 아래, guidesContent 수정 시 `gen-guides-meta`) | — |
| S3-5 | 허브 H1 · 헤더/푸터 시즌 메뉴 | SEO-10: /qna·/glossary·/calc 등 H1 이 슬로건 · NAV-11: 시즌 항목 5+33=38(성과급 메뉴 중복 10·비시즌 2) | H1 에 대상 키워드, 슬로건은 부제 · 시즌 메뉴 ≤12: `SEASON_REST` 축소는 DEC/JAN 세트와 푸터 노출까지 같은 커밋(각 키별 header 항목 ≤12 테스트 — S1-1 자동 게이트가 12/1 에 구 구조를 되살리지 않도록) | S · 낮음 |
| S3-6 | `/calc/hyundai-bonus` 스니펫(M01②) | 네이버 99,055노출 0.4% | 10/9 이후 description 1회, 판정 네이버 페이지별 CTR 28일 | S · 낮음(실험) |

## 5. 동결기(11/1~1/31) 준비 체크리스트 — 상수·메타·문자열만

- 시즌 세트: 12/1 OCT→DEC(S1-1 자동, 미배포 시 3파일 수동)·1/2 JAN(수동, 확인 2건 후) + 각 교체 후 CF 캐시 퍼지(운영자).
- 연말정산 클러스터(허브 2027·미리보기·공제 계산기 4종·연말정산 계산기): 2026 귀속 한도·요율 재확인.
- 삼성 TAI 2026 하반기(12월) → `taiData.ts`; OPI(1월 말) → `opiAnnouncement.ts` 4필드 + **`SeasonalBanner.tsx:18` OPI 게이트 한 줄** + 발표 런북(growth-playbook §3). 발표 전 추정 카피 금지.
- 공무원 2027 확정 봉급표(12월 말) → `GENERAL_PAY_ROWS_2027` 교체, 라벨 '예상'→'확정'.
- 2027 최저임금(1/1, 상수는 이미 config 에 있음 — `MINIMUM_WAGE_2027` 10,700원, 고용노동부 2026-08-05 고시) → 최저임금 소비처는 아직 `MINIMUM_WAGE_2026` 을 직접 import(포인터 미연결) — 간이 계산기 기본값·표시 문구는 `verify:tax` 허용목록의 최저임금 항목을 1/1 에 문자열로 갱신(S2-1). 4대보험 요율은 아래 §5-1 포인터.
- **4대보험 1/1 요율 전환 — ✅ 2026-09-25 N3 로 '상수 한 줄' 준비 완료, 전환 자체는 운영자 승인 항목**: 절차는 §5-1 런북. (종전 메모: `taxConstants2026` 2026 블록 제자리 수정 금지 — 그대로 지킨다. 2026 귀속 연말정산 3표면·`/table/2026` 의 2026 명시 고정은 N3 에서 완료.)
- S3-1 잔여분은 동결기에도 계속 가능 — batch 파일의 description/faq/sources 문자열만(필드·컴포넌트·라우트 무접촉, 검증 로그 동반).

### 5-1. 2027-01-01 4대보험 요율 전환 런북 (2026-09-25 N3)

**구조** — `src/config/currentRates.ts` 의 `CURRENT_RATES_YEAR` 한 줄이 '현행 요율'을 고른다. 2027 값은 `src/lib/taxConstants2027.ts`(`INSURANCE_RATES_2027` + 항목별 `INSURANCE_RATES_2027_STATUS`)가 정본, 2026 값은 `taxConstants2026.ts` 그대로.

| 포인터를 따른다 (1/1 에 자동 전환) | 2026 고정 (전환해도 그대로) |
|---|---|
| 엔진 기본값: `TaxLogic.calculateSalary2026` · `calculator.calculateNetSalary` · `bonusTaxCalc.calcBonusNet`(삼성 외 성과급 계산기·`/widget/bonus`) · 프리랜서/알바 · 글로벌 비교 · `/tools/finance/bonus` | `/table/2026/*`·`/api/salary-table`(`generateData.ts`·`generateData2026.ts`·`calculateNetSalary2026`) |
| 문구: `/salary/[amount]`(제목 '(YYYY 세후 월급)'·설명·FAQ·HowTo·배지) · `/monthly/[amount]`(제목·설명·요약·FAQ) · 홈(HomeSeoSection·FAQ·HowTo 본문, 예시 금액 `HOME_EXAMPLE_NET_MANWON`) · 홈 계산기 배지 · 회사 실수령 표 제목 · 상장사 산출 기준 · 급여명세서·상세 분석 라벨 · `/about` 출처 · 성과급 3쪽 FAQ(posco·samsung-display·samsung-sdi) · `/calc/holiday-bonus` 본문 · `/calc/2026-year` 요율 문장 · 공유 결과 라벨 · `/widget/salary` · OG salary 카드 '연봉 리포트' · (리뷰 반영 추가) 회사 상세 FAQ 답변 'YYYY년 세법·4대보험 요율(YYYY-MM 반영)'(`CURRENT_RATES_AS_OF`) · 상장사 lite FAQ · `/widget/bonus`·`/embed` 연봉·성과급 스니펫과 기준 문구 · 성과급 계산기 21쪽 출처 문장('YYYY 세법 반영') · `/calc/bonus-calculators` 요약·카드·FAQ · `/calc/holiday-bonus` 안내 · `/calc/offer-compare` FAQ · 홈 비교 탭(`SalaryComparator`) · 공공기관 비교 · 홈 계산기 로딩 화면 · `/tools/finance/bonus` 배지 · `/salary-db/ranking` 계산기 카드 · `/pro/career-planner` FAQ · 영문 계산기 제목·`/en/help` 방법 문장. 목록 정본 = `src/lib/__tests__/currentRatesSurfaces.ts`(오늘 문구 불변·2027 리허설 두 테스트가 같이 씀) | 2026 귀속 연말정산(`yearEndTaxCalculator.ts`·`YearEndTaxCalculator.tsx`·`widget/year-end-tax`·`calc/dual-income-year-end`) · `/calc/smb-income-tax-break`(2026 귀속 검산 예시) · `/salary-raise-2026` · `/chuseok-bonus-2026` · 간이 근로소득세(`earned-income-tax-quick`, 2026 간이세액표 근사) · `estimateAnnualIncomeTax2026` 기본값 · 연도 표기 페이지(`/social-insurance-rates-2026`·`/national-pension-estimate-2026`·`-2026` 가이드) |

**전환 전 준비 (동결기 전후, 전부 상수·문자열)**

| # | 언제 | 무엇 | 확인 |
|---|---|---|---|
| P-1 | 장기요양위원회 의결 직후(10~11월 예정) | `taxConstants2027.ts` `LONG_TERM_CARE_RATIO` 확정값 + `_STATUS` → `confirmed`. 동결이면 값 그대로 두고 상태만 | `currentRates.test.ts` 홈 예시 금액 실패 시 `homeContent.ts` `HOME_EXAMPLE_NET_MANWON[2027]` 갱신 · `/table/2027`·요율표 '장기요양(2026 준용)' 문구(갱신 슬롯 ②, `healthRate2027Freeze.test.ts` 단언 함께) |
| P-2 | 고용보험료징수법 시행령 개정 공포 시(연내 목표) 또는 12월 말 | `EMPLOYMENT_INSURANCE` 0.01(개정 공포) 또는 0.009 유지(미개정 확인) + `_STATUS` → `confirmed` | `/table/2027`·요율표 고용보험 고지 문구(갱신 슬롯 ⑤) |
| P-3 | 12월 삼성 배치(삼성 파일 접촉 창) | `calc/samsung-bonus/model.ts` 의 `INSURANCE_RATES_2026.` 사용 전부(2026-09-25 기준 6곳 — 소득세 증가분·지방세 비율·연금·건보·장기요양·고용)를 요율 인자(기본 `CURRENT_INSURANCE_RATES`)로 바꾸고, 두 번째 `estimateAnnualIncomeTax2026(salary)` 에도 같은 요율을 넘긴다. `model.test.ts` 동결값은 2026 명시 호출로 옮긴다(`taxRatesParam.test.ts` 와 같은 방식) | 이번 라운드는 삼성 파일 무접촉이라 미연결 — 안 하면 1/1 뒤 삼성 계산기만 2026 요율로 남고 `model.test.ts` '공통 엔진과 원 단위로 일치' 가 실패한다. **순서 강제**: 포인터가 2027 인데 `model.ts` 에 `INSURANCE_RATES_2026.` 이 남아 있으면 `verify:tax` 가 실패한다 |
| P-4 | 12월 또는 전환 당일 | 연도 표기 없는 문자열 표면 갱신 — 대상 목록 정본은 `scripts/tax-constants-allow.json` 의 `switch_scan.manual`(2026-09-25 16곳): `src/data/qnaData.ts`(국민연금 4.75%·'연봉 1억' 월 실수령 범위 — `guideFactCorrections.test.ts` QnA 단언이 전환 뒤 기대값을 알려 준다)·`qna/layout.tsx` 메타 설명 · `src/data/glossaryData.ts`(`stat2026`·`example300` 계산 예시·요율 문장) · `enrichments-ext-b.ts` `employee-cost-quick` FAQ · `samsung-bonus/Client.tsx` 라벨 '국민연금 (4.75% …)'(P-3 와 함께) · `/calc/holiday-bonus` 메타 설명(10/10 동결 해제 뒤 파생 가능) · `/embed` FAQ '공통적으로 2026년 세법'(연말정산 위젯이 2026 귀속이라 파생 불가) · `/region/[slug]` 설명·`/tools/finance` 허브 설명·배지(연도 롤오버와 함께) · 상시 가이드 7파일(`hot-bonus-tax-complete`·`hot-keywords-deepdive`·`hot-keywords-deepdive-en`·`legacy-rewrite-1`·`legacy-rewrite-2`·`lifecycle-deepdive`·`tax-deepdive` — 아래 가이드 규칙). **스캔에 안 걸리는 영문·질의 문구도 함께 결정**: `/en` 레이아웃 제목·`EnLandingClient` h1 'Korea Salary Calculator 2026'·eyebrow '2026 estimate'·`/en` 앱 JSON-LD 이름(연도 롤오버), 회사 상세 FAQ 질문 '… 2026년 최신 기준인가요?'·회사 h1 '연봉 2026'(회사 제목 인접 — 연도 롤오버 결정, 답변은 포인터 파생 완료) | `npm run verify:tax` 의 **전환 표기 스캔** — 주석 아닌 줄의 '2026년 세법·모델·요율'·'4.75%' 를 `switch_scan` 목록과 대조. 포인터 2026: 목록 밖 신규 표기는 WARN, manual 은 개수 안내. 포인터 2027: 목록 밖 표기 또는 manual 파일에 남은 표기 → FAIL. 경로에 2026/2027 이 든 파일(연도 라우트·연도 정본)은 자동 연도 고정. manual 파일을 고친 뒤 연도 명시 문장만 남으면 `fixed` 로 옮긴다. **가이드 규칙**: 슬러그·제목에 연도가 있거나 문장에 연도를 밝힌 글('2026년 요율 기준 …')은 그대로 두고, 연도 없이 현행 요율처럼 쓴 상시 글('국민연금 4.75%')만 고친다. 가이드 본문은 `src/lib/guides/*` 가 정본이라 고친 뒤 `npx tsx scripts/gen-guides-meta.ts` 를 다시 돌려 `guidesMeta.generated.ts`(카드 제목·설명) 차이를 확인한다 |
| P-5 | 전환 전 | **운영자 승인**: 전환은 `/salary` 416쪽·`/monthly` 105쪽 제목의 연도 라벨이 전부 2027 로, 금액은 /salary 361쪽·/monthly 95쪽이 1만원 단위로 바뀐다(2026-09-25 추정 — 장기요양·고용 2026 준용 기준). 회사 430쪽 실수령 열·홈 FAQ 금액도 바뀐다 | 홈 `<title>`(`HOME_META_TITLE`)·회사 `<title>`·`/calc/*` 제목은 포인터와 무관(연도 라벨은 별도 결정, 회사 title 은 불변 원칙) |

**전환 당일 (2027-01-01 00:00 KST 이후 빌드)**

1. 한 줄 변경 — `src/config/currentRates.ts`: `export const CURRENT_RATES_YEAR: RateYear = 2026;` → `export const CURRENT_RATES_YEAR: RateYear = 2027;`
2. 같은 커밋의 날짜 상수(콘텐츠가 실제로 바뀌므로): `src/config/siteDates.ts` `TAX_TABLE_EFFECTIVE_DATE`·`src/app/sitemap.ts` `SALARY_METHOD_REVIEW_DATE`·`'/'`·`'/about'` override → 전환 커밋일, `src/lib/ogUrlVersion.ts` `OG_URL_VERSION` → `"20270101"`(1만원 단위가 그대로인 저연봉 카드도 새 연도 라벨로 다시 그리게).
3. 검증(전부 exit 0 이어야 함):
   - `npm run verify:tax` — `현행 요율 포인터 CURRENT_RATES_YEAR = 2027`, FAIL 0. (2027 인데 1/1 KST 전이면 FAIL, `_STATUS` 에 provisional 이 남으면 FAIL — P-1·P-2 미완료 신호, 삼성 `model.ts` 가 2026 요율 직접 사용이면 FAIL — P-3, `switch_scan.manual` 표기가 남거나 목록 밖 2026 표기가 있으면 FAIL — P-4. 2026-09-25 리허설: 포인터만 2027 로 바꾸면 FAIL 18건 = 미확정 요율 1 + P-3 1 + manual 16)
   - `npx tsc --noEmit`
   - `npx vitest run src/lib/__tests__/currentRates.test.ts src/lib/__tests__/currentRatesDryRun2027.test.ts` — 전환 게이트·2027 문구·2026 고정 표면
   - `npm test` — P-1~P-4 를 마쳤으면 전부 통과. 2026-09-25 리허설(포인터 2027 임시 전환)에서 실패한 것은 정확히 3건: 전환 게이트(P-1·P-2), QnA 단언(P-4), 삼성 `model.test.ts`(P-3)
   - `node scripts/ad-audit.mjs --diff --base <직전 main>` → ERROR 0 / WARN 0 (광고 무접촉)
   - `npm run verify:site` · `npm run verify:sitemap`
4. main 푸시 → CF Pages 빌드 완료 → **운영자 Purge Everything** → 운영 HTML 확인: `/salary/50000000` 제목 '(2027 세후 월급)'·HowTo '국민연금 5.0%' · `/monthly/3000000` '(2027 기준)' · 홈 FAQ '2027년 기준 … 국민연금 5.0%' · `/table/2026/annual` 5,000만 행이 여전히 3,571,546원 · `/widget/salary` '2027 연봉' · `/api/og?type=salary&amount=50000000&net=…&v=20270101` 카드 '2027 연봉 리포트'.
5. 되돌리기: 1번 한 줄을 2026 으로 되돌려 푸시 + Purge (다른 파일 무관).

**포인터 밖 (이 런북으로 바뀌지 않는 것)**: 근로소득 간이세액표(2027 개정 시 `withholdingTaxTable2026` 교체는 별도 작업) · 국민연금 기준소득월액 상·하한(2027-07 재조정 — `PENSION_BASE_2026` 을 쓰는 `toNetSalaryRates`·`TaxLogic` 상한을 그때 별도로, 같은 날 `currentRates.ts` `RATES_AS_OF_BY_YEAR[2027]` 을 "2027-07" 로 — 회사 상세 FAQ '(YYYY-MM 반영)') · 최저임금 소비처(위 불릿) · 연도 라벨이 박힌 제목(홈·회사·/calc·영문 페이지) · `-2026` 가이드·용어집 계산 예시.

**근거(2026-09-25 확인)**: 국민연금 2027 총 10.0%(근로자 5.0%) — 보건복지부 연금개혁 Q&A('26 9.5% → '27 10.0% → … → '33 13.0%, mohw.go.kr) · 국민연금공단 법령정보 국민연금법 개정(법률 제20903호, 2025-04-02 공포, 2026-01-01 시행, nps.or.kr) · 국민연금공단 연금개혁 FAQ(사업장가입자 절반 부담). 건강보험 2027 동결 7.19% — 2026년 제15차 건강보험정책심의위원회(2026-09-08) 의결(보도: 세계일보·메디파나·오마이뉴스 등, 기존 반영 `healthRate2027Freeze.test.ts`). 장기요양 2027 — 보건복지부 제7기 장기요양위원회 출범(2026-08-14), 수가·보험료율 10월 이후 결정(미확정). 고용보험 2027 — 고용노동부 2026-09-01 고용보험위원회 「고용보험 제도개편 방안」 실업급여 요율 각 0.9%→1.0% 안, 연내 법령 개정 목표(미확정). 최저임금 2027 10,700원 — 고용노동부 2026-08-05 확정 고시(moel.go.kr news_seq=19744).

## 6. 승인·콘솔이 필요한 것 (운영자 한 줄)

| 항목 | 이유 |
|---|---|
| S1-6 GA4 맞춤 측정기준 `ad_height`·`lcp_element` 등록 + 승인②(계측 예외) 필드 확장 동의 | 콘솔·광고 컴포넌트 계측 |
| ~~9/21 앵커 ON(승인⑥, 기존)~~ | 콘솔 — ★9/25: 9/1 이전부터 이미 ON 이라 할 일 없음. 오버레이 설정은 현행 유지(운영자 9/25 승인 12번), 화면 캡처만 |
| CF 캐시 퍼지 9/26·12/1·1/2 | 콘솔 1분 |
| GSC 중복 보고서 내보내기(S3-2 1단계) · 네이버 서치어드바이저 페이지별 CTR 내보내기(S2-5·S3-6 판정) · GA4 기기 비중(L07' 강등 확정) | 콘솔 |
| S2-5 네이버 스니펫 실험 `/home-loan` 1쪽(후속 S3-6 hyundai-bonus) | 효과 미보장 실험 |
| S3-5 헤더·푸터 시즌 메뉴 축소 | 헤더 카피 정책 |
| S1-3 을 '행 추가' 변형으로 하려는 경우 | 광고 위 높이 증가 |
| L07' 사이드바 이식 | 강등 후보 — 기기 비중 확인 후 |
| S3-3 AdPlacement 예약 높이(2월 상정) | 광고 컴포넌트 내부 |
| ⑧ `/chuseok-bonus-2026` CalcResultAd 이동 | 9/24 전 결정, 없으면 폐기 |
| A17 계산 방법 문구 — 동결 메타 2건: 홈 `HOME_META_DESCRIPTION`(`src/lib/homeContent.ts`, '연간 세액 추정을 월로 환산') · `/calc/offer-compare` 설명 끝 '2026년 연간 세액 간이 추정.' → 간이세액표 기준 문구로 교체 | 2026-09-25 월 소득세를 근로소득 간이세액표로 전환해 두 설명이 실제 계산과 어긋남. 홈 설명은 운영자 결정, `/calc/*` 설명은 동결(calcDescriptionFreeze) 해제 10/10 이후 |
| 중소기업 청년 감면(홈 고급 설정) 월 표시 = 연 감면·한도(200만)를 12개월 균등 배분한 추정 | 실제 급여는 간이세액 × 10% 를 누적 감면 200만원 도달 때까지 원천징수. A17 뒤 `/calc/smb-income-tax-break` 와 수치 일치는 깨짐(5,000만: 1,596,120 vs 1,654,563 — `smeYouthParity` 테스트에 기록). '연 평균' 한 줄 안내를 결과 아래 둘지 결정(광고 위 높이 규칙 확인 필요) |

## 7. 다음 세션 착수 순서 (실행 지시가 오면)

1. S1-0(9/12 전) → S1-1(+9/26 안전장치) → S1-5(축소판) → S1-6 → S1-3(높이 중립) → S1-2(광고·제휴 무접촉 링크). 각각 독립 커밋, 게이트 = ad-audit·vitest·빌드·qa:crawl·qa:quality(빌드와 동시 실행 금지 — ENOENT 거짓 실패).
2. 9/19 D+7 점검 → 보고서 §6 표 채움. 9/20 M01 판정 → 홈 1회. 9/21 이후 S2-0(삼성 1회 접촉).
3. S2-1~S2-3·S2-5 → 10/10 D+28 조회 → S3(문서 갱신·실측표 선행 → S3-1 배치 → S3-2 단계별).
4. 10/31 이후는 §5 체크리스트만.

## 8. 근거 파일

- 첫 광고 깊이 실측(9/11, 자동광고 제외): `docs/ad-depth/2026-09-11-before.txt`, `2026-09-11-after.txt`(광고 배치 배포 후).
- 보고서: `docs/revenue-growth-overnight.md` §1·§5·§7·§8. 검증 판정 원문은 세션 로컬(저장소 미포함).

## 9. 2026-09-25 승인 원장 — 운영자 "권장하는거 전부 진행" (9/24 제시 30문항 · 비광고분)

운영자 답: 2026-09-25 00:09 KST "권장하는거 전부 진행해줘 완벽하게 대신 아래 내용 참고해서" + 첨부 9/24 보고서(`docs/revenue-audit-2026-09-24/naver-cloudflare-adsense-report.md` — 계획과 충돌하면 보고서 우선). 근거는 9/24~9/25 44에이전트 감사(생존 192건, 승인 A01~A36·콘솔 C01~C21). 광고 문항(5~12·22)은 `docs/ad-experiments.md` 2026-09-25 절 4.
커밋은 통합 브랜치 `claude/audit-integration-20260925` 기준 SHA(main 반영 방식에 따라 바뀔 수 있음). 배포는 운영자 "메인 푸시" 지시 뒤이며, 배포일 = 아래 T0.

| 번호 | 항목 | 감사 ID·배치 | 상태 | 커밋 / 시점 | 메모 |
|---|---|---|---|---|---|
| 1 | 감사 수정 묶음(102건) | B1~B5·B7~B17 + 후속 B19·B20·B23·TAX(B10 합류) | ✅ 구현·게이트 통과 → **배포 대기** | 병합 `e2259058`~`040b4740` + 통합 후속 수정. tsc 0 · lint error 0 · vitest 150파일 2,359건 · verify tax/site/sitemap/companies/bonus 0 · `ad-audit --diff --base 4d80ce3e` ERROR 0/WARN 0 | 광고 컴포넌트·위치·잠긴 제목 무접촉. 승인 A23(Dataset license `61473a24`)도 여기에. B5 = 이 문서 커밋. B7 커밋 2(lastmod 승격)는 보류 브랜치 `claude/audit-b7-20260925-hold-c2`(`20b53a52`) — 규칙 B HIT 확인 뒤 |
| 2 | 9/26 시즌 메뉴 SEP→OCT | B6(GATE-05·DATE-15) | 예정 | **9/26 00:00 KST 이후 첫 푸시** + Purge(운영자) | 운영 HTML `data-season-key="OCT"`·헤더 '추석' 0건 확인(C07). 10/1·11/25 재산세 날짜 분기는 재빌드 + Purge |
| 3 | Next.js 14.2.32 → 14.2.35 보안 패치 | B18(GATE-03·08) | ✅ | `27d654da` | 10/11 이후 일정에서 앞당김 |
| 4 | GA4 추적 버그 3종 | B19 | ✅ | `304471bc`(맞춤 이벤트 `source` 가 세션 소스를 덮던 문제 — 484세션)·`ad6ff6a2`(금액 페이지 광고·제휴 이벤트에 실제 경로)·`eb7a6ae7`(제휴 클릭 위치·가운데 클릭·비콘) + `3a471a15`·`d6d7ce88` | '내부 링크 꼬리표'의 실체는 이벤트 매개변수였다(내부 href 의 utm_* 0건 확인). 배포일을 GA4 주석으로(C12) |
| 13 | 월 실수령 = 간이세액표 기준 | A17(CALC-01) | ✅ | `c95c183e` + `fd381f55`·`950780fd`·`a465c0a5`·`559ca66d`·`208a3f9a` | /salary·/monthly 제목 금액이 바뀜 → T0 부터 GSC KR 28일 재측정. 동결 메타 2건(홈 설명·/calc/offer-compare)은 §6 표 대기 |
| 14 | 성과급 '세액공제 30%' 가정 → 실제 세금 차이 | A18(CALC-02) | ✅ | `78f10ee2` + `53d745f5` | samsung-bonus 공유 해시는 새 키 `ac`, 옛 `cr` 은 하위호환 변환(ac = max(0, cr − 30)) |
| 15 | 상장사 대표 수치 = 공시 1인평균, 괴리 10% 초과 순위 제외 | A19(COMP-01) | ✅ | `57496d72`·`b6c38bfb`·`659e1b43`·`41adeccc`·`a1c60f37`·`99074b2b`·`8aa55940`·`6e9a5948` | TOP100·CSV/JSON 은 인용 자산 — 정정 메모 동반 |
| 16 | FY2024 수기 7곳 → FY2025 공시 | A20(COMP-03) | ✅ | `620ba9ef` | 카드 높이 불변 |
| 17a | 회사 '문화 점수' → 공시 평균 근속연수 | A21(COMP-10) | 예정 | **10/11 이후** | 첫 광고 바로 위 Quick Stat — 같은 높이 증명(ad-depth 전후) |
| 17b | 하위권 전국 순위 → 등급 라벨 | A22(PROD-04) | ✅ | `36832632` | 같은 길이 라벨 |
| 18 | 2027 건강보험료율 7.19% 동결 반영 | A26(EDIT-14) | ✅ | `dd523353`·`e48bcd82`·`992b4f1e` | 금액 불변, 상태 문구만 |
| 19 | 5월 대량 가이드 약 181편 재작성 | A25(EDIT-05) | 단계 진행 | 한 문장 단위 정정은 ✅(B9 `4c3302d8`·`6bd584a6`·`e73b76d1`·`c1aa72f6`·`142921ee` 등) · 구조 재작성은 **10/6~10/31** 주 단위 | 사실 원장 → 재작성 → 2중 검증. H2 이동은 광고 삽입점 이동이라 ad-depth 전후 필수. 11/1 뒤에는 문자열만 |
| 20 | 홈 제목에 '실수령액' 복원 | A30(G2·NV-12) | **보류** | 네이버·GSC 홈 검색어 구성 확인 뒤 재상정 | 운영자 9/24 보고서 §4: 홈 네이버 226,007노출·CTR 0.2% — "넓은 검색어 구성을 먼저 확인. 페이지 전체 제목을 성급히 교체하지 않음". 홈 title·description 은 운영자 결정 항목 |
| 21 | 퇴직금 계산기 통합·링크 모으기 | A31(G4) | 예정 | **10/11 이후** | 포크 엔진 → 정본(severanceCalculator) 먼저. 헤더 href 는 사이트 전체 변경 |
| 22 | 연말정산 입력칸 광고 위 실험 | A32(G5) | 광고 원장 | `docs/ad-experiments.md` 2026-09-25 절 4 | — |
| 23 | SK하이닉스 결과 공유 카드 | A33(NV-9) | 예정 | **10/11~10/31** | 결과 광고 아래. 착수 전 10/5 공유 코호트 판정(콘솔팩 세션 4 ③-②)을 보고, 공유 유입이 미미하면 운영자에게 한 번 더 확인 |
| 24 | 홈 추천 가이드 시즌 연동 | A29(DATE-16) | 예정 | **10/11 이후** | GuideMidAd·Multiplex 위 섹션 — 카드 2개·높이 불변 증명 |
| 25 | /company 옛 페이지 삭제 | A27(STAB-12·RT-11, 결정 ⑩ 2단계) | ✅ | `6f85a2f5`(+ `9093a833` 정확 308 · `4accb126` ad-audit 삭제 허용) | /company/compare·simulator 유지. S1-5 의 '삭제는 ⑩ 결정 후' 해소. /salary-db/compare 정확 308 7개는 그 경로가 Worker 에서 빠지면 CF Redirect Rule 로 먼저 옮길 것 |
| 26 | OG 이미지 전략 | A24(META-01·OG-01) | 순서 확정 | **캐시 규칙 C(C01) 먼저 → 7일 뒤 유형별 실패율 재측정 → 그다음 빌드 타임 정적 PNG 여부 결정** | B16 OG 신뢰성 수정(`637604ae`·`eed99fef`)은 반영 |
| 27 | 용어집·Q&A 한글 주소 정적화 | A28(STAB-08b·SEO-CRAWL-06) | 조건부 | **통합 배포 T0+7** CF 대시보드에서 용어집·QnA 1102 **2% 이상**이면 로컬 wrangler 프로토타입 → 10/31 전 착수. 미만이면 보류 | C01 규칙 B 효과와 함께 본다 |
| 28 | 배포 후 CF 캐시 자동 Purge | A35(CLIENT-02) | ✅ 코드 · 운영자 대기 | `dc441e70` | GitHub 시크릿 3개 등록 전에는 동작 안 함 → 그때까지 수동 Purge(콘솔팩 '배포 후 캐시 자동 Purge 설정') |
| 29 | 인앱 '이미지로 저장' | A16(CLIENT-10) | ✅ | `aee7ddd8`·`5c6186b5` | 네이버·카카오 인앱 UA 는 기존 미리보기(길게 눌러 저장)로. 실기 확인(iOS·Android 네이버 앱·카카오톡)은 운영자 여유 시 |
| 30 | /en 언어 설정 | A34(PROD-10) | **현행 유지(확정)** | — | 루트 레이아웃 분리 안 함. 2027-02 구조 슬롯에서만 재검토 |
| 보고서 P1 | 공무원 2027·교사·소방 제목/설명/H1/첫 답변 | B20 | ✅ | `0fab3201`·`dc8ba375`·`9bdea8a9`·`172e11cc` | T0·판정은 `docs/gsc-sniping-log.md` Round 3 |
| 보고서 P1 | /home-loan 검색어·제목·첫 답변 대조 | S2-5 | 기존 동결 | **10/5 판정 뒤** | description 실험('참고' 강등) 종료 전 변경 금지 |
| 보고서 P1 | /calc/hyundai-bonus | S3-6 대체 | 기존 동결 | **10/17 판정 뒤** | 9/19 변경분 D+28 |
