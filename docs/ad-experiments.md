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

## 승인 배치 기록 (실험 아닌 단발 승인)

- 2026-08-17 **/home-loan 본문 중간 GuideMidAd 1개** — CalcResultAd~PageFooterAds
  사이 ~390줄 무광고 구간 해소. InArticleAd는 dedup 함정으로 회피.
- 2026-08-17 **/share/[data] CoupangBanner 1개** — 카톡 공유 랜딩 쿠팡 인벤토리 0
  해소. 기존 CalcResultAd 아래 배치.
