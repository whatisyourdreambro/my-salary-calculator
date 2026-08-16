# 광고 실험 로그 (승인제)

원칙: 실험안 사전 보고 → 운영자 승인 → 적용 → 전/후 14일 비교 → 유지/롤백.
공통 안전장치: 광고 컴포넌트 내부 수정 금지 · 새 UI 광고 위 금지 · share/[data] 광고 금지 · 페이지군별 독립 커밋(revert 가능) · 긴급 롤백은 env 제거 재배포.

---

## 실험 #1 — Display2Ad 확산 (상태: ⏳ 운영자 승인 대기)

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
| 승인일 | |
| 적용일·커밋 | |
| 전 14일 RPM | |
| 후 14일 RPM | |
| 판정 | |
