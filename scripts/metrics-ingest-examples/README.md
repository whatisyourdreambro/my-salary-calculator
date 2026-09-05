# metrics-ingest 자가 점검용 합성 예시 (실데이터 아님)

`node scripts/metrics-ingest.mjs --selftest` 가 읽는 파일. 수치는 전부 임의값이며 실제 콘솔 내보내기가 아니다.
실제 CSV 는 리포 밖(C:\Users\ruby1\.moneysalary-secrets\)에 두고 절대 경로로 넘긴다.

- gsc-coverage-table.csv — 서치콘솔 색인 생성→페이지 zip 의 표.csv 형식(사유·출처·검증·추세·페이지), UTF-8 BOM 포함
- gsc-coverage-chart.csv — 같은 zip 의 차트.csv 형식(날짜·색인 안 됨·색인 생성됨)
- gsc-not-indexed-urls.csv / gsc-indexed-urls.csv — 사유별 상세 내보내기 형식(URL·최종 크롤링)
- ga4-sources-ko.csv — GA4 트래픽 획득 CSV 한글 UI(# 개요 주석 블록·합계 행·두 번째 표 포함)
- ga4-sources-en.csv — 같은 내용 영문 UI
