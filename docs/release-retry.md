# 게시 재시도 기록

`docs/operator-console-pack.md` '게시 절차와 실패 시 재시도 (2026-11)' 5b 절차용 기록이다.
승격 뒤 실패한 커밋은 다시 게시할 수 없으므로, 아래에 한 줄을 더한 커밋을 main 에 합쳐 새 40자리로 다시 게시한다.

- #23 (run 41282750076, 7e0fbcd8a) 재시도 2026-11-01 — Cloudflare 빌드는 성공(문서 2,610쪽 검증)했으나 승인 확인 단계에서 GitHub API 403(익명 한도 60회 소진, native-build-failed). 같은 커밋에 B19(깃허브 익명 한도 초과 시 범위 안 재시도)를 함께 반영.
- #26 (run 43240261957, d2fcc8720) 재시도 2026-11-13 — 승격은 됐으나 Cloudflare 빌드가 약 5분 만에 실패했고(Cloudflare Pages 검사 failure, 빌드 로그는 확인하지 못함), 게시 작업은 'Verify the native Pages deployment…' 단계에서 native-readiness gate-error 로 끝났다. 운영은 918026445 그대로였다. 코드 변경 없이 이 한 줄만 더해 다시 게시.
- #27 (run 43252743020, 05a87926a) 재시도 2026-11-13 — 'Verify exact approved CI and promote…' 단계가 4초 만에 빨강으로 끝났는데 배포 가지는 이미 05a87926a 로 올라가 있었다(승격 직후 되읽기가 이전 커밋을 돌려준 것으로 추정, phase promotion-requested). 승인 실행이 먼저 끝나 Cloudflare 빌드는 승인 확인에서 곧바로 실패했고 운영은 918026445 그대로였다. 같은 커밋에서 승격 뒤 되읽기를 읽기만 최대 5번(2초 간격) 다시 확인하도록 고쳤다(쓰기는 그대로 한 번, scripts/pages-cloud-publish.mjs).
