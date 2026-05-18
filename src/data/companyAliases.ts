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
  "sk-cc": ["SK C&C", "SK씨앤씨", "에스케이씨앤씨"],
  "ls-electric": ["LS일렉트릭", "엘에스일렉트릭", "LS산전"],
  hmm: ["에이치엠엠", "현대상선"],
  "hanwha-ocean": ["대우조선해양", "대우조선"],
  "dl-enc": ["디엘이앤씨", "DL E&C", "대림산업"],
  "posco-holdings": ["포스코", "POSCO"],

  // ── 영문↔한글 표기 차이 ──
  lgensol: ["엘지에너지솔루션", "엘지엔솔", "LG엔솔"],
  "lg-cns": ["엘지씨엔에스", "엘지CNS"],
  "hd-hyundai-heavy": ["현대중공업", "HD중공업"],
  "korean-air": ["코리안에어", "KAL"],

  // ── 줄임말·통칭 ──
  "samsung-biologics": ["삼성바이오", "삼바"],
  "samsung-electronics": ["삼전"],
  cjcheiljedang: ["씨제이제일제당", "제일제당"],
  "hyundai-dept": ["현대백화점그룹"],
  celltrion: ["쎌트리온"],

  // ── 사명 변경 (기존 등록 회사 — 새 사명으로도 검색됨) ──
  "lotte-data-comm": ["롯데이노베이트", "롯데정통"],

  // ── Batch29~32 신규 회사 별칭 ──
  "db-hitek": ["동부하이텍", "디비하이텍"],
  skiet: ["SKIET", "에스케이아이이테크놀로지"],
  "ligachem-bio": ["레고켐바이오", "레고켐"],
  "ecopro-bm": ["에코프로BM", "에코프로비엠"],
  "shinhan-securities": ["신한금융투자", "신한금투"],
  "hana-securities": ["하나금융투자", "하나대투증권"],
  "hyundai-motor-securities": ["HMC투자증권"],
  "kb-insurance": ["LIG손해보험", "케이비손해보험"],
  "shinhan-life": ["신한생명", "오렌지라이프"],
  "kb-kookmin-card": ["국민카드", "KB카드"],
  "bc-card": ["비씨카드"],
  kamco: ["캠코", "KAMCO"],
  khug: ["HUG", "허그"],
  etri: ["ETRI", "전자통신연구원"],
  kbs: ["한국방송공사", "케이비에스"],
  "gm-korea": ["GM코리아", "한국GM", "지엠코리아", "쉐보레"],
  "kepco-kps": ["케이피에스"],
  "kepco-engineering": ["한전기술", "KEPCO E&C"],
  "spc-samlip": ["삼립", "삼립식품"],
  "hyundai-autoever": ["오토에버"],
  "korea-east-west-power": ["동서발전"],
  "korea-south-east-power": ["남동발전"],
  "korea-southern-power": ["남부발전"],
  "korea-western-power": ["서부발전"],
  "korea-midland-power": ["중부발전"],
};
