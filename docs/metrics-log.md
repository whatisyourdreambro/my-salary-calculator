# 지표 로그 — 콘솔 내보내기 집계 1행/회 (2026-09-05 개설)

`scripts/metrics-ingest.mjs log` 가 append 하는 표. 세션표(`docs/operator-console-pack.md`)의 CSV 수령 직후 한 행씩 남긴다.
원본 CSV 는 리포 밖(`C:\Users\ruby1\.moneysalary-secrets\`)에 보관하고, 여기에는 **집계만** 쓴다 — 검색어·페이지·URL 목록 금지(계획 §8-8).

열 정의
- **날짜**: 기록일(YYYY-MM-DD). 같은 날 창이 다르면 행을 나눈다.
- **창**: 각 지표의 집계 기간(예: `9/13 기준 28일`, `8/31~9/4`).
- **GA4 세션·소스 점유**: `ga4-sources` 결과 — 세션 합계와 그룹 점유(네이버=naver organic+m.search.naver.com referral 합산 / direct / 사내망=samsung.net·menlosecurity·teams·office / google / bing·yahoo·ddg / AI=chatgpt·copilot·claude·perplexity·gemini / 커뮤니티=dcinside·fmkorea·everytime·instagram·facebook·threads·blog·cafe 등 / other).
- **GSC 커버리지**: `gsc-coverage` 결과 — 색인/미색인 수·색인률, 사유 상위 3, `/salary-db/listed/` 섹션 색인률(10/19 lite 게이트 입력).
- **AdSense**: `scripts/adsense-report.mjs window/units` 요약을 텍스트로(일 수입·PV·페이지 RPM·노출/PV·Active View·수동 유닛 커버리지). 여기서 재계산하지 않는다.
- **비고**: 판정·경고·재측정 예정일. 기각 레버·추정치 금지.

명령 예(원본 경로는 절대 경로):
```
node scripts/metrics-ingest.mjs gsc-coverage <표.csv> <차트.csv> --not-indexed <발견됨.csv> --not-indexed <크롤링됨.csv> --out <gsc.json>
node scripts/metrics-ingest.mjs ga4-sources <소스매체.csv> --out <ga4.json>
node scripts/metrics-ingest.mjs log --date 2026-09-13 --window "9/13 기준 28일" --ga4 <ga4.json> --gsc <gsc.json> --adsense "…" --note "…"
```

| 날짜 | 창 | GA4 세션·소스 점유 | GSC 커버리지 | AdSense | 비고 |
|---|---|---|---|---|---|
| 2026-09-05 | GA4 2026-01-01~09-05 / AdSense 8/31~9/4 · 유닛 9/2~9/4 | 세션 244,407 — 네이버 67.7%·direct 23.5%·사내망 4.6%·bing 1.4%·커뮤니티 1.4%·google 0.8%·AI 0.6% | — (커버리지 내보내기 9/13 세션 2 이후) | 일 $19.21·PV 4,363·RPM $4.40·노출/PV 5.3·AV 53.5% · 수동유닛 커버리지 87.4%(8월 94.0%) | 기준선(계획 §2 실측). 다음 행 9/13 세션 2 번들 |
