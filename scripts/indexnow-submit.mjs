// IndexNow 제출(POST) — 엔드포인트별 독립 전송 모듈 (2026-09-26 NAVER-03a).
//
// scripts/indexnow-ping.mjs(postbuild)가 쓰고 scripts/__tests__/indexnow-naver.test.mjs 가 fetch 스텁으로 검증한다.
// import 만으로는 아무 것도 보내지 않는다(부작용 없음).
//
// 왜 네이버에 직접도 보내나: api.indexnow.org 제출은 참여 엔진(빙·네이버 등)에 공유되지만, 공유 경유로는
// 네이버가 받았는지 빌드 로그로 알 수 없다. 10/1 L10' 재빌드(회사 164곳 description)와 가이드 재작성분을
// 네이버가 바로 받도록 같은 payload 를 네이버 IndexNow 엔드포인트에도 한 번 더 보낸다.
//   - 엔드포인트: 네이버 서치어드바이저 IndexNow 가이드(searchadvisor.naver.com/guide/indexnow-request)의
//     POST /indexnow · Host: searchadvisor.naver.com, 그리고 indexnow.org searchengines.json 의 naver meta
//     "api": "https://searchadvisor.naver.com/indexnow" 로 확인(2026-09-26).
//   - 본문 형식은 IndexNow 표준 {host, key, keyLocation, urlList}, 1회 최대 10,000 URL(두 곳 동일).
//   - 응답: 200 성공 · 202 접수(키 확인 중) · 400 형식 오류 · 403 키 무효 · 422 URL-키 불일치 · 429 과다 요청.
//
// 안전 원칙(종전과 같음): 어떤 실패도 빌드를 깨지 않는다 — 엔드포인트마다 따로 try 하고, 한쪽이
// 예외·비 2xx 여도 다른 쪽은 그대로 보낸다. 이 함수는 절대 throw 하지 않는다.
// 바뀐 URL 만 보낸다(빈 목록이면 아무 데도 보내지 않음) — 반복 제출 429 를 피한다.

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const NAVER_INDEXNOW_ENDPOINT = "https://searchadvisor.naver.com/indexnow";

const TIMEOUT_MS = 20000;

/**
 * 같은 payload 를 api.indexnow.org → 네이버 순서로 POST 한다.
 * @param {{host: string, key: string, keyLocation: string, urlList: string[]}} payload
 * @param {{fetchImpl?: typeof fetch, log?: (line: string) => void, userAgent?: string}} [opts]
 * @returns {Promise<{name: string, status: number|null, ok: boolean, error?: string}[]>}
 *   엔드포인트별 결과. 빈 urlList 면 [] (전송 없음).
 */
export async function submitIndexNow(payload, opts = {}) {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const log = opts.log ?? ((line) => console.log(line));
  const urls = Array.isArray(payload?.urlList) ? payload.urlList : [];
  if (urls.length === 0) {
    log("[indexnow] skip (빈 urlList — 제출 없음)");
    return [];
  }

  // 두 엔드포인트에 바이트까지 같은 본문을 보낸다
  const body = JSON.stringify({
    host: payload.host,
    key: payload.key,
    keyLocation: payload.keyLocation,
    urlList: urls,
  });
  const headers = { "content-type": "application/json; charset=utf-8" };
  if (opts.userAgent) headers["user-agent"] = opts.userAgent;

  const post = async (name, url) => {
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      return { name, status: res.status, ok: res.status >= 200 && res.status < 300 };
    } catch (e) {
      return { name, status: null, ok: false, error: String(e?.message ?? e) };
    }
  };

  const results = [];

  // 1) 공유 엔드포인트 — 종전 로그 형식 유지(CF Pages 빌드 로그에서 "[indexnow] submitted" 로 찾는다)
  const shared = await post("indexnow", INDEXNOW_ENDPOINT);
  results.push(shared);
  if (shared.error) {
    log(`[indexnow] error (non-fatal): ${shared.error}`);
  } else {
    // 200/202 = 접수. 4xx여도 빌드는 계속 — 로그로만 남김
    log(`[indexnow] submitted ${urls.length} changed urls → HTTP ${shared.status}`);
  }

  // 2) 네이버 직접 — 공유 쪽 성패와 무관하게 보낸다
  const naver = await post("naver", NAVER_INDEXNOW_ENDPOINT);
  results.push(naver);
  if (naver.error) {
    log(`[indexnow] naver error (non-fatal): ${naver.error}`);
  } else {
    log(`[indexnow] naver ${naver.status}${naver.ok ? "" : " (non-2xx, non-fatal)"}`);
  }

  return results;
}
