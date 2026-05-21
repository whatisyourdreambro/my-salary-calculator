// src/data/companyAliases.ts
//
// 회사별 검색 표기 변형(별칭).
// name.ko / name.en 외에 사용자가 실제 검색창에 입력하는 변형 — 옛 사명,
// 영문↔한글 표기 차이, 줄임말 등. Search Console 키워드 데이터 기반.
// CompanyRepository가 회사 객체에 aliases로 주입하며, 검색 매칭·메타 키워드·
// JSON-LD alternateName·본문 노출에 함께 쓰인다.

/** 회사 id → 검색 별칭 목록 */
export const companyAliases: Record<string, string[]> = {
  // ── 사명 변경: 옛 이름으로도 많이 검색됨 ──
  "sk-cc": ["SK C&C", "SK씨앤씨", "에스케이씨앤씨", "SK AX 연봉계약직"],
  "ls-electric": ["LS일렉트릭", "엘에스일렉트릭", "LS산전"],
  hmm: ["에이치엠엠", "현대상선"],
  "hanwha-ocean": ["대우조선해양", "대우조선"],
  "dl-enc": ["디엘이앤씨", "DL E&C", "대림산업"],
  "posco-holdings": ["포스코", "POSCO"],

  // ── 영문↔한글 표기 차이 ──
  lgensol: ["엘지에너지솔루션", "엘지엔솔", "LG엔솔", "LG에너지"],
  "lg-cns": ["엘지씨엔에스", "엘지CNS"],
  "hd-hyundai-heavy": ["현대중공업", "HD중공업", "에이치디현대중공업"],
  "korean-air": ["코리안에어", "KAL"],
  lgelectronics: ["엘지전자", "LG Electronics", "엘지 전자"],

  // ── 줄임말·통칭 ──
  "samsung-biologics": ["삼성바이오", "삼바"],
  "samsung-electronics": ["삼전"],
  cjcheiljedang: ["씨제이제일제당", "제일제당"],
  "hyundai-dept": ["현대백화점그룹", "현백"],
  celltrion: ["쎌트리온"],

  // ── Search Console 노출 키워드 기반 추가 (2026-05) ──
  // 이미 노출은 발생하지만 게재순위 28~77위로 1페이지 진입 못한 회사들
  cosmax: ["Cosmax", "코스맥스 화장품", "코스맥스 코리아"],
  "wonik-ips": ["원익 IPS", "원익아이피에스", "Wonik IPS", "원익 아이피에스"],
  "kb-securities": ["케이비증권", "KB Securities", "KB 증권"],
  hanmi: ["Hanmi", "Hanmi Pharm", "한미약품그룹", "한미약품 R&D"],
  "kumho-petro": ["금호석화", "금호석유", "Kumho Petrochemical"],
  ohou: ["오늘의 집", "버킷플레이스", "Ohou", "Ohouse", "Bucketplace"],

  // ── 글로벌 회사 한국어 표기 ──
  tesla: ["Tesla", "테슬라코리아", "Tesla Korea"],
  amazon: ["Amazon", "아마존코리아", "아마존웹서비스", "Amazon Korea"],

  // ── 한국 IT 대표 회사 영문 표기 ──
  toss: ["Toss", "비바리퍼블리카", "토스뱅크", "토스증권"],
  coupang: ["Coupang", "쿠팡 풀필먼트", "쿠팡로지스틱스"],
};
