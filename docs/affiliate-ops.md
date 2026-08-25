# 제휴 오퍼 운영 가이드 (AffiliateSlot / offers.json)

> 2026-08 수익화 인프라. 코드 수정 없이 `src/data/offers.json` 편집만으로 오퍼를 켜고 끈다.
> 관련 지시서: 머니샐러리 수익화·정합성 개선 작업 지시서 §TASK-3.

## 구조 한눈에

```
기존 ~84개 쿠팡 배너 호출부 (<CoupangBanner .../> — 무수정)
  └→ src/components/CoupangBanner.tsx  (re-export 심)
       └→ AffiliateSlot ("use client")
            ├─ offers.json 활성 오퍼 매칭 → 오퍼 카드 (+고지문 자동, GA4 계측)
            └─ 매칭 없음 → CoupangBannerCore 폴백 (현행 쿠팡과 픽셀·subId 동일)
결과 연동 CTA (성과급 결과·연봉 페이지)
  └→ <OfferSlot> — 오퍼 전용(쿠팡 폴백 없음). 승인 전엔 아무것도 렌더 안 함.
```

- 매칭 로직: `src/lib/affiliateOffers.ts` — `active && (pages 포함 ‖ vertical 일치)` → `priority` 오름차순, 페이지당 동일 오퍼 1회.
- 보호 경로(`BLOCKED_PATHS`): 실업급여·근로장려금·육아휴직·기초연금·`/fun/*`·`/calc/unemployment-benefit`·로또·재물운·MBTI — **어떤 오퍼도 절대 노출되지 않는다** (offers.json 에 경로를 넣어도 차단됨).

## 오퍼 활성화 절차 (네트워크 승인 후)

1. 제휴 네트워크(링크프라이스·아이라이크클릭·애드픽·텐핑) 대시보드에서 캠페인 트래킹 URL 발급.
2. `src/data/offers.json` 에서 해당 오퍼의
   - `url`: `"PLACEHOLDER"` → 발급받은 **https** 트래킹 URL
   - `active`: `false` → `true`
3. 검증: `npm run build && npm run start` 후 `npm run qa:crawl`
   - active 오퍼의 url 이 https 가 아니면 빌드 시점에 에러로 잡힌다.
4. 배포. 대상 페이지에서 쿠팡 배너 자리에 오퍼 카드가 뜨는지 확인.

### 새 오퍼 추가

`offers.json` 배열에 항목 추가 (id 는 유니크):

```jsonc
{
  "id": "loan-compare-02",
  "vertical": "loan",             // loan|card|securities|insurance|savings|remittance
  "pages": ["/home-loan"],        // 선택 — 명시 페이지. "/en/*" 처럼 접두사 허용
  "label": "카드에 표시될 제목",
  "description": "부제 (1줄)",
  "url": "https://...",           // 트래킹 URL
  "network": "linkprice",
  "priority": 1,                   // 낮을수록 우선
  "active": true,
  "template": "성과급 {amount}만원 — ...",  // 선택 — 계산 결과 보간 문구
  "disclosure": null               // 선택 — 기본 고지문 오버라이드
}
```

`pages` 를 생략하면 버티컬 매핑(아래)에 해당하는 모든 페이지에 노출된다.

## 버티컬 → 페이지 매핑 (inferVertical 규칙 요약)

| vertical | 대상 (전부 실존 라우트 기준) | 시즌 |
|---|---|---|
| `loan` | /home-loan, /car-loan, /tools/loan, /tools/real-estate/{dsr,ltv}, /tools/finance/installment, /calc/{dsr-quick, ltv-quick, loan-*, mortgage-monthly-quick, jeonse-loan(-cost), housing-subscription 등 대출계 slug} | 연중 |
| `card` | /credit-card-deduction-2026, **/year-end-tax**(연말정산 허브 — 카드 섹션), /year-end-tax-2027, /hub/tax-saving. ⚠️ /year-end-tax-2026 은 종합소득세 페이지 — 매핑 금지 | ~10/31 확정 (11월 시즌) |
| `securities` | /calc/*-bonus 전체(회사별 23종+제네릭), /calc/bonus-calculators, /tools/finance/{irp,stock-tax,severance,bonus,cagr}, /retirement-pension-2026, /fire-calculator, 투자계 [slug], /guides 주식·ISA·IRP 가이드, /hub/{invest,fire} | ~11/30 확정 (12~2월: 셀트리온 1월 선지급→삼성 OPI 1월 말→하이닉스 PS 2월) |
| `insurance` | /calc/{auto-insurance-quick 외 보험 [slug] 8종}, /hub/insurance. ⚠️ /health-insurance-* 는 국민건강보험 — 매핑 금지 | 연중 |
| `savings` | /savings-interest-2026, /tools/deposit, /tools/finance/compound, 예적금 [slug] | **2차** |
| `remittance` | /en/*, /global, 환율 [slug] | **2차** |

**2차 게이트**: `savings`·`remittance` 는 `src/lib/affiliateOffers.ts` 의 `PHASE2_VERTICALS` 에 묶여 있어 active 여도 노출되지 않는다. 개방 시 해당 배열에서 제거(코드 1줄) 후 배포.

## GA4 이벤트 사전

| 이벤트 | 파라미터 | 시점 |
|---|---|---|
| `affiliate_impression` | `offer_id, page, vertical` | 오퍼 카드 뷰포트 50% 진입 1회 (CTR 분모) |
| `affiliate_click` | `offer_id, page, vertical` | 오퍼 링크 클릭 |
| `coupang_click` | `banner_size, category, page_path` | (기존) 쿠팡 폴백 클릭 |

성과 판단: `affiliate_click / affiliate_impression` = CTR, 네트워크 대시보드 전환과 join 키는 `offer_id`(트래킹 URL 의 sub 파라미터에 offer_id 를 넣어두면 편함).

## 고지문

- 오퍼 노출 시 "제휴 링크이며 일정 수수료를 받을 수 있습니다." 자동 표기 (오퍼별 `disclosure` 로 오버라이드 가능).
- 쿠팡 폴백은 기존 쿠팡 파트너스 고지 유지. 이용약관 제7조에 일반 제휴 고지 반영됨.

## 알려진 동작

- **다중 슬롯 페이지의 초기 중복**: 한 페이지에 쿠팡 슬롯이 2~3개인 경우(예: /calc/[slug] — 레이아웃 1 + 본문 2), 오퍼 활성 시 첫 페인트에 같은 오퍼 카드가 각 슬롯 위치에 표시됐다가 하이드레이션 직후 1개만 남고 나머지는 쿠팡 폴백으로 전환된다. (SSR 은 형제 슬롯 순서를 알 수 없어 생기는 제약 — 쿠팡 코어의 기존 dedup 방식과 동일한 마운트 후 보정)
- 오퍼는 SSR HTML 에 포함된다(`data-affiliate-offer` 속성) — qa-crawl 이 이걸 검증한다.

## 하지 말 것

- `src/components/CoupangBanner.tsx`(심)를 CoupangBannerCore 직접 re-export 로 되돌리기 — 오퍼 경로가 통째로 끊긴다.
- `BLOCKED_PATHS` 페이지에 오퍼 노출 시도 — 코드가 차단하지만, 정책상으로도 금지(취약 상황 방문자 보호).
- BANNERS 테이블의 쿠팡 id/traceId 수정 — 쿠팡 정책상 변조 금지.
