# 광고 실험 로그 (승인제)

원칙: 실험안 사전 보고 → 운영자 승인 → 적용 → 전/후 14일 비교 → 유지/롤백.
공통 안전장치: 광고 컴포넌트 내부 수정 금지 · 새 UI 광고 위 금지 · share/[data]는
AdSense 1개+쿠팡 1개 상한(2026-08-17 쿠팡 1개 운영자 승인 — 종전 "광고 금지"에서 개정) ·
페이지군별 독립 커밋(revert 가능) · 긴급 롤백은 env 제거 재배포.
★같은 슬롯은 경로당 1회 dedup — PageFooterAds(InArticleAd 포함)가 있는 페이지에
InArticleAd를 또 넣으면 "추가"가 아니라 하단 것이 사라지는 "이동"이 된다 (2026-08-17 확인).

---

## 실험 #1 — Display2Ad 확산 (상태: ✅ 승인·적용 2026-08-17)

**가설**: display-2 슬롯(8284703133)이 홈 1곳에만 배치돼 있어 최저활용 상태. 광고 밀도가 낮고(슬롯 ≤4) 본문이 긴 페이지군에 1개씩 추가하면 기존 슬롯 잠식 없이 페이지 RPM이 오른다.

**적용 대상 (1순위 3개 페이지군, 각각 독립 커밋)**:
1. `/monthly/[amount]` (~105 URL) — "상여금 포함 연봉 환산표" 섹션 직후 (기존 광고와 1스크린+ 간격)
2. `/table/2026/{annual,monthly,weekly,hourly}` 4페이지 — 표 본문과 FAQ 사이 (페이지별 삽입 — layout 삽입은 PageFooterAds와 2연속이라 금지)
3. `/salary-db` 인덱스 — CalcResultAd와 InArticleAd 사이 회사 리스트 중간

**보류(과밀 5슬롯+)**: salary-db/[id]·salary/[amount]·calc/[slug]. **제외**: guides/[slug](6슬롯).

**측정**:
- 적용 전 14일: AdSense 보고서(페이지 분류, URL 필터 /monthly/·/table/2026/·/salary-db) — RPM·노출·클릭 스냅샷
- 적용 후 14일: 동일 지표 + "광고 단위별" 보고서에서 display-2 유닛 단독 수익 + GA4 ad_impression(slot_kind)
- **판정**: 페이지군 RPM +5%↑ AND unfilled 급증 없음 AND 기존 result/fluid 클릭 잠식 없음 → 유지·2순위 확대 / 아니면 해당 커밋 revert

**운영자 결정**: 승인 시 "실험 1호 진행해"라고 말씀해 주세요. 1번(monthly)만 먼저도 가능합니다.

| 항목 | 값 |
|---|---|
| 승인일 | 2026-08-17 (수익 감사 후 운영자 선택 승인) |
| 적용일·커밋 | 2026-08-17 — monthly/table/salary-db 3개 독립 커밋 (git log 참조) |
| 전 14일 RPM | (운영자: AdSense 페이지 보고서 스냅샷 대기 — 없으면 적용일 이전 데이터로 소급 확인) |
| 후 14일 RPM | (8/31경 확인) |
| 판정 | (9월 초) |

적용 메모: env `NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2` 미설정 시 전 배치 자동 미렌더 —
CF Pages env 설정 여부를 운영자가 확인해야 실험이 실제 개시됨(홈 display-2가 이미
노출 중이면 설정돼 있는 것). 배치 위치: /monthly 상여금 환산표 직후 · /table 4종
본문과 시즌 링크 사이 · /salary-db 18번째 카드 직후.

---

## 실험 #2 — Display2 확산 2단계 (상태: 설계 완료, 실험 #1 판정 통과 시 진행)

**전제**: 실험 #1 판정(9월 초, 위 표 기입) 통과. 판정 전 적용 금지 — display-2 단독
수익 측정을 오염시킴.

**적용 대상 (군별 독립 커밋·14일 비교)**:
- **#2a**: GuideMid 기사용이라 D1에서 수리 못 한 성과급 12곳(doosan-enerbility·
  gs-caltex·hanwha-aerospace·hyundai-mobis·hyundai-rotem·kepco·lg-display·s-oil·
  samsung·samsung-display·sk-hynix·sk-innovation) + car-loan(469행) — page 중단
  `InArticleAd`→`Display2Ad` 교체. 유닛 순증이 아니라 **dedup으로 죽어 있던
  layout/PageFooterAds 하단 InArticle 부활 + display-2 중단 진입**.
- **#2b**: glossary 인덱스 topAd `HomeTopAd`→`Display2Ad` (footer HomeTop 부활).
- **#2c**: 실험 #1 보류 3군(salary-db/[id]·salary/[amount]·calc/[slug]) — #1
  판정에서 기존 슬롯 잠식 0 확인된 경우에만, 기존 유닛과 1스크린+ 간격 1개씩.
  salary/[amount]는 254행 부근(2026-08-23 죽은 유닛 제거 자리 — 주석 참조).

**판정**: #1과 동일 기준(RPM +5%↑ AND unfilled 급증 없음 AND 잠식 없음), 군별
독립 revert. 커밋 전 `node scripts/ad-audit.mjs --diff` 필수.

---

## 승인 배치 기록 (실험 아닌 단발 승인)

- 2026-08-17 **/home-loan 본문 중간 GuideMidAd 1개** — CalcResultAd~PageFooterAds
  사이 ~390줄 무광고 구간 해소. InArticleAd는 dedup 함정으로 회피.
- 2026-08-17 **/share/[data] CoupangBanner 1개** — 카톡 공유 랜딩 쿠팡 인벤토리 0
  해소. 기존 CalcResultAd 아래 배치.
- 2026-08-23 **마스터플랜 일괄 승인 배치** (운영자 계획 승인 = 광고 배치 일괄 승인,
  배치별 독립 커밋): D1 dedup 복원 15곳(InArticle→GuideMid)·D3 glossary 부분 복원·
  죽은 유닛 2곳 제거·C1 홈 3→5유닛·C2 성과급 허브 0→2유닛·C3 fun 게임 6종 결과
  한정 InArticle·C4 insights 인덱스 GuideMid·C5 tools/finance/bonus GuideMid.
  검증 게이트: scripts/ad-audit.mjs (전 커밋 ERROR 0 통과).

---

## 실험 #3 — 무광고 대량 URL 신규 배치 (상태: 적용, 2026-08-24 재점검 계획 일괄 승인)

**승인 근거**: 2026-08-24 전면 재점검 계획을 운영자가 승인 — "운영자 계획 승인 =
광고 배치 일괄 승인" 선례(2026-08-23) 적용. Display2Ad는 실험 #1 판정 전이므로
**전면 미사용** (측정 오염 방지). 배치별 독립 커밋 + `ad-audit.mjs` ERROR/WARN 0.

**적용 대상 (군별 독립 커밋·전/후 14일 비교)**:
- **#3a** `/salary-db/listed/[stockCode]` ≈218 URL — 본문 유닛 0이던 깨끗한 페이지.
  월 실수령 환산 직후 CalcResultAd · 순위 컨텍스트 직후 GuideMidAd · FAQ 직전 쿠팡.
  10월 Phase 2(+300곳) 확대 시 템플릿 자동 적용.
- **#3b** `/guides/category/[slug]` 7 URL — 목록 하단 MultiplexAd (목록 페이지 관행).
- **#3c** 연말정산 시즌 2p(`/year-end-tax-2027`·`/year-end-tax-preview`) — 각 +2유닛
  +쿠팡 1. 11월 구조 동결 전 시한부 항목.
- **#3d** `/salary-db/listed` 인덱스 GuideMid · `/fun/random-draw` InArticle(C3 누락분
  균일화) · `/hub`·`/about` 각 1유닛.

**측정·판정**: 실험 #1과 동일 — 군별 RPM(신규 페이지군은 절대 RPM 발생 자체가 순증)
AND unfilled 급증 없음. 판정일 적용 후 14일(9/7경). 군별 독립 revert.

| 항목 | 값 |
|---|---|
| 승인일 | 2026-08-24 (재점검 계획 일괄 승인) |
| 적용일·커밋 | 2026-08-24 — 군별 독립 커밋 (git log 참조) |
| 후 14일 판정 | (9/7경 기입) |

## 승인 배치 기록 (실험 아닌 단발 수리, 2026-08-24)

- **/salary/[amount] 데스크톱 쿠팡 복구** — 본문 쿠팡 2개가 페이지당 캡(2)을 선점해
  사이드바 skyscraper가 무음 차단, 415개 URL의 데스크톱 쿠팡 인벤토리가 0이던
  문제. FAQ 후 2번째 배너 제거로 본문 1 + 사이드바 1 정리. (2026-08-23 캡 1→2
  완화가 이 페이지에서는 불충분했음 — 본문 2 + 사이드바 1 구성이라 재발)
- **/en 쿠팡 사문 호출부 3곳 제거** — CoupangBanner가 /en을 조기 차단(line 171)해
  렌더 0이던 죽은 코드(EnglishGuideClient 2곳·EnglishGuidesClient 1곳). /en 쿠팡
  활성화(컴포넌트 내부 수정)는 운영자 판단으로 **미실행** 확정(2026-08-24).
- **쿠팡 3회 배치 WARN 3건 allowlist 등재** — calc/[slug]·samsung-bonus·
  salary-db/[id]는 layout 쿠팡이 양보하는 의도 구조임을 사유와 함께 명문화.
