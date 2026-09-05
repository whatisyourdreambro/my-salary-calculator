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
| 전 14일 RPM | **사이트 전체** 페이지 RPM $3.55 (8/3~8/16, 운영자 제공 일별 CSV 2026-09-05 수령 — 페이지군 필터 불가. AdSense '페이지' 보고서는 최근 30일만 남아 페이지군 소급 불가) |
| 후 14일 RPM | **사이트 전체** $3.50 (8/17~8/30). 노출/PV 4.3→4.3 동일, Active View 60.4%→59.1% |
| 판정 | **보류(광고단위 축 대기)** — 사이트 전체로는 변화 없음(±1%, 참고치). 판정 축은 '광고 단위' 보고서(맞춤 기간 가능) display-2(8284703133) 후 창 단독 수입 > 0 AND result(5584143639)·fluid(3302558597) 비잠식. 9/7 세션 CSV 2장 도착 후 기입. 후 창에 대상군 접촉 커밋(948ce7c·021d335·13b7c62·d7f216e·8d585f5)이 섞여 페이지군 RPM 축은 무효. **판정 불가 시 '현상 유지'(revert 아님)** — 2026-09-05 운영자 "계획대로 진행" 승인(10배 계획 §5-4). 판정 불가는 27a692c 병합 게이트만 해제하고 #2a 확장 게이트는 해제하지 않음 |

**★기준선 리셋 2026-09-05**: 27a692c(IN_ARTICLE `<ins>` 폭 0px 수정) main 병합·배포. 이 슬롯(3302558597)은
2026-05-13 이후 전 사이트에서 광고 요청 자체가 없었으므로 실험 #1 전/후 두 창 모두 '결함 상태'로 동일 —
상대 비교는 유효하나, **병합일 이후 구간은 #1 후속(#2a~c)·9/13 홈 결과직하·9/17 전면최적화 판정의 기준선으로
쓸 수 없다**(병합일 경계로 구간 분리). 확정 근거는 광고단위 보고서 3302558597 행의 병합 후 7일 노출.

적용 메모: env `NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2` 미설정 시 전 배치 자동 미렌더 —
CF Pages env 설정 여부를 운영자가 확인해야 실험이 실제 개시됨(홈 display-2가 이미
노출 중이면 설정돼 있는 것). 배치 위치: /monthly 상여금 환산표 직후 · /table 4종
본문과 시즌 링크 사이 · /salary-db 18번째 카드 직후.

---

## 실험 #2 — Display2 확산 2단계 (상태: 설계 완료, 실험 #1 판정 통과 시 진행)

**전제**: 실험 #1 판정(9월 초, 위 표 기입) 통과. 판정 전 적용 금지 — display-2 단독
수익 측정을 오염시킴.

**적용 대상 (군별 독립 커밋·14일 비교)**:
- **#2a**: GuideMid 기사용이라 D1에서 수리 못 한 성과급 19곳(기존 12 —
  doosan-enerbility·gs-caltex·hanwha-aerospace·hyundai-mobis·hyundai-rotem·kepco·
  lg-display·s-oil·samsung·samsung-display·sk-hynix·sk-innovation — +
  holiday-bonus·incentive-tax·january-bonus·severance-vs-pension·vacation-pay·
  year-end-bonus·year-end-bonus-tax) + car-loan(466행) — page 중단
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

- 2026-09-05 **10배 계획 Phase 1 (운영자 "계획대로 순차적으로 진행")** — 정본 docs/revenue-10x-plan-2026-09.md §3·§5.
  ① 27a692c main 병합·배포(수리 ≠ 실험 — 실험 슬롯 미소비, 기준선 리셋일 = 배포일).
  ② AdPlacement.tsx data-ad-status 관찰자에 ad_filled/ad_unfilled 계측(슬롯당 1회) — 광고 컴포넌트 내부 계측 예외,
  요청·렌더·dedup·접힘 로직 무변경, 독립 커밋·즉시 revert 가능. ③ §12-2 ⑪ 하단 고정 UI 앵커 감지 공유 유틸
  (src/lib/bottomAdDetect.ts): InstallPwaBanner 앵커 감지 시 숨김(fail-closed), BottomSheet 하단 여백, FloatingShareBar 동일 로직 이관.
  토스트 8곳(2.8초 노출)은 미적용 — 후속. 검증 게이트: tsc 0·vitest 131/131·eslint 0·ad-audit --diff ERROR 0/WARN 0.
  실험 판정 규칙 개정(§5-4): 광고단위 1축 우선, 창 내 클릭<50 → 28일 연장, 미달 시 '판정 불가·현상 유지'.

- 2026-08-17 **/home-loan 본문 중간 GuideMidAd 1개** — CalcResultAd~PageFooterAds
  사이 ~390줄 무광고 구간 해소. InArticleAd는 dedup 함정으로 회피.
- 2026-08-17 **/share/[data] CoupangBanner 1개** — 카톡 공유 랜딩 쿠팡 인벤토리 0
  해소. 기존 CalcResultAd 아래 배치.
- 2026-08-23 **마스터플랜 일괄 승인 배치** (운영자 계획 승인 = 광고 배치 일괄 승인,
  배치별 독립 커밋): D1 dedup 복원 15곳(InArticle→GuideMid)·D3 glossary 부분 복원·
  죽은 유닛 2곳 제거·C1 홈 3→5유닛·C2 성과급 허브 0→2유닛·C3 fun 게임 6종 결과
  한정 InArticle·C4 insights 인덱스 GuideMid·C5 tools/finance/bonus GuideMid.
  검증 게이트: scripts/ad-audit.mjs (전 커밋 ERROR 0 통과).
- 2026-09-02 **전면 최적화 배치 (운영자 지시 "모든 페이지·헤더·광고 수익 최적화 및 초고도화")** —
  190라우트 전수 감사(파인더 11·반박 검증 206·정적 게이트) 후 커버리지 갭에 기존 슬롯만 순증.
  라우트 107곳 고유 AdSense 슬롯 증가(합계 705→821), 감소 0. 핵심: DART 상장사 219p 2→4
  (CalcResult 환산 직하+GuideMid 섹션 경계) · /tools 리프 24종 3→4(ToolPageContent 공용 GuideMid,
  섹션≥2·FAQ 보유 조건) · 신규 /calc 정적 9종 3→4(GuideMid FAQ 경계) · 시즌·세금 단일 페이지 40여 곳
  +1~2(GuideMid/CalcResult/본문 끝 Multiplex) · 목록형 상세(job 62·industry 27·region 19·hub 8·
  qna 59·glossary 58·en/guides 13·salary-db/compare 413·insights 3) 본문 끝 Multiplex 1개 ·
  인덱스 12곳 목록 중간 GuideMid · guides/[slug] 337p·en 가이드 사이드바 300x600 래퍼만 sticky
  (카드 스택 고정 해제 — 뷰포트 초과로 유닛이 잘리던 문제).
  **불변 유지**: 실험 #1 대상(/monthly·/table·/salary-db 인덱스)·홈·Display2 신규 0건, A4 게이트
  (salary-db/[id]·calc/[slug]·salary·monthly·table Multiplex) 0건, 쿠팡 신규 0건, 광고 컴포넌트 내부
  무변경, 기존 광고 이동·삭제 0건. 검증 게이트: ad-audit ERROR 0(INFO 58 기준선 동일, --diff WARN 2건은
  사이드바 래퍼 클래스 변경 오탐)·tsc 0·eslint 0·vitest 124/124. 판정: 배포+14일 섹션별 RPM
  (AdSense 페이지 보고서 — /tools·/salary-db/listed·/calc 신규 9종·시즌 단일 페이지군 비교).
  기각(재제안 금지 사유 기록): HomeTop 직후 Multiplex 연속 배치(minimum-wage-2026/2027·new-employee·
  samsung-negotiation 하단), 레이아웃 쿠팡 위로 UI를 미는 리포트 배선 3건, /company(308 redirect) 광고.
