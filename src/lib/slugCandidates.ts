// src/lib/slugCandidates.ts
//
// /glossary/[slug]·/qna/[slug] 공용 — edge 가 넘긴 params.slug 를 매칭 후보 목록으로 펼친다.
// 종전에는 glossaryData 안에 있어서 qnaData 가 recoverMojibakeUtf8 하나 때문에 glossaryData
// (edge 청크 약 95KB)를 import 했고, /qna/[slug] edge 함수가 용어 사전 전체를 함께 실었다(S24).
// 데이터 모듈을 import 하지 않는 이 작은 모듈로 옮겨 두 라우트가 각자 자기 데이터만 싣게 한다.

/**
 * CF edge(workerd)는 런타임에 따라 params.slug가 원문/1회 인코딩/이중 인코딩으로
 * 도착할 수 있음 — 2026-08-08 실측: 프로덕션에서 실존 한글 슬러그 전량이 미매칭돼
 * 목차로 308되던 원인. 최대 2회 디코드한 모든 형태를 후보로 만든다.
 * (깨진 % 시퀀스는 try/catch로 500 대신 디코드 중단 → 미매칭 처리)
 * 뒤이어 각 형태의 Latin-1 모지바케 복구형을 덧붙인다. 순서는 종전 두 조회 함수와 같다.
 */
export function slugCandidates(slug: string): string[] {
  const candidates: string[] = [slug];
  let cur = slug;
  for (let i = 0; i < 2; i++) {
    try {
      const d = decodeURIComponent(cur);
      if (d === cur) break;
      candidates.push(d);
      cur = d;
    } catch {
      break;
    }
  }
  // Latin-1 모지바케 복구: 구버전 빌드 툴체인이 UTF-8 바이트를 Latin-1 문자로
  // 해석해 넘기는 경우("연봉" → "ì—°ë´‰") 원문 복원 후보를 추가한다.
  for (const c of [...candidates]) {
    const r = recoverMojibakeUtf8(c);
    if (r) candidates.push(r);
  }
  return candidates;
}

/** 문자열 전체가 0x00~0xFF 범위이고 그 바이트열이 유효한 UTF-8이면 재해석 결과를 반환 */
export function recoverMojibakeUtf8(s: string): string | null {
  let hasHighByte = false;
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code > 0xff) return null; // Latin-1 범위 밖 문자 → 모지바케 아님
    if (code >= 0x80) hasHighByte = true;
  }
  if (!hasHighByte) return null; // 순수 ASCII → 복구 불필요
  try {
    const bytes = Uint8Array.from(s, (c) => c.charCodeAt(0));
    const d = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return d !== s ? d : null;
  } catch {
    return null;
  }
}
