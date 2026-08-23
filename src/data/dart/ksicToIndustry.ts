// src/data/dart/ksicToIndustry.ts
//
// 한국표준산업분류(KSIC 10차) 코드 → 사이트 표준 업종 35종(industryTaxonomy) 매핑.
// 수작업 큐레이션 파일 (커밋 대상 — AUTO-GENERATED 아님).
// 최장 prefix 우선 매칭: 4자리 → 3자리 → 2자리. 미등록 prefix 는 "etc".
// 근거: dartDisclosed 2,593곳의 KSIC 분포(2026-08-23 실측, 62종) 전수 커버.
// 사용처: DART 라이트 페이지 업종 분기·TOP 100 리포트 업종 집계.

const KSIC_PREFIX_MAP: Record<string, string> = {
  // ── 4자리 (세분류) ──
  "5821": "game", // 게임 소프트웨어 개발·공급

  // ── 3자리 (소분류) ──
  "261": "semiconductor", // 반도체
  "262": "semiconductor", // 전자부품 (디스플레이 포함)
  "271": "pharma-bio", // 의료용 기기
  "282": "battery", // 일차전지·축전지
  "311": "heavy-industry", // 선박·보트 건조 (조선)
  "313": "defense-aerospace", // 항공기·우주선
  "582": "it-software", // 소프트웨어 개발·공급 (게임 제외)
  "581": "media-entertainment", // 서적·잡지 출판
  "641": "bank", // 은행·저축기관
  "661": "securities", // 금융 지원 서비스 (증권 중개 등)
  "662": "insurance", // 보험·연금 지원 서비스
  "701": "pharma-bio", // 자연과학 연구개발 (바이오 벤처 다수)
  "721": "construction", // 건축 기술·엔지니어링

  // ── 2자리 (중분류) ──
  "01": "etc", "02": "etc", "03": "etc", // 농림어업
  "05": "etc", "06": "etc", "07": "etc", "08": "etc", // 광업
  "10": "food-beverage", // 식료품
  "11": "food-beverage", // 음료
  "12": "consumer-goods", // 담배
  "13": "fashion-beauty", // 섬유
  "14": "fashion-beauty", // 의복
  "15": "fashion-beauty", // 가죽·가방·신발
  "16": "manufacturing", // 목재
  "17": "manufacturing", // 펄프·종이
  "18": "manufacturing", // 인쇄
  "19": "energy", // 코크스·석유정제 (정유)
  "20": "chemical", // 화학물질·화학제품
  "21": "pharma-bio", // 의약품
  "22": "manufacturing", // 고무·플라스틱
  "23": "manufacturing", // 비금속 광물 (시멘트·유리)
  "24": "steel", // 1차 금속
  "25": "manufacturing", // 금속 가공
  "26": "electronics", // 전자부품·컴퓨터·통신장비 (3자리 예외 위 참조)
  "27": "manufacturing", // 의료·정밀·광학 (의료기기 271 제외)
  "28": "electronics", // 전기장비 (전지 282 제외)
  "29": "manufacturing", // 기타 기계·장비
  "30": "automotive", // 자동차·트레일러
  "31": "heavy-industry", // 기타 운송장비 (조선 311·항공 313 예외)
  "32": "consumer-goods", // 가구
  "33": "manufacturing", // 기타 제품 제조
  "34": "manufacturing", // 산업용 기계 수리
  "35": "energy", // 전기·가스·증기 (발전)
  "36": "energy", "37": "energy", "38": "energy", "39": "energy", // 수도·환경
  "41": "construction", // 종합 건설
  "42": "construction", // 전문직별 공사
  "45": "retail-commerce", // 자동차 판매
  "46": "retail-commerce", // 도매·상품 중개
  "47": "retail-commerce", // 소매
  "49": "logistics", // 육상 운송
  "50": "logistics", // 수상 운송 (해운)
  "51": "logistics", // 항공 운송
  "52": "logistics", // 창고·운송 지원
  "55": "travel-leisure", // 숙박
  "56": "travel-leisure", // 음식점
  "58": "media-entertainment", // 출판 (SW 582·서적 581 예외)
  "59": "media-entertainment", // 영상·오디오 제작
  "60": "media-entertainment", // 방송
  "61": "telecom", // 통신
  "62": "it-software", // 컴퓨터 프로그래밍·SI
  "63": "it-software", // 정보 서비스 (포털·호스팅)
  "64": "finance", // 금융 (은행 641 예외)
  "65": "insurance", // 보험·연금
  "66": "finance", // 금융·보험 서비스 (661·662 예외)
  "68": "construction", // 부동산
  "70": "pharma-bio", // 연구개발 (자연과학 701 포함 — 바이오 다수)
  "71": "consulting", // 전문 서비스 (법무·회계·광고)
  "72": "consulting", // 건축·엔지니어링·과학기술 (721 예외)
  "73": "consulting", // 기타 전문·과학·기술
  "74": "etc", "75": "etc", "76": "etc", // 사업시설 관리·임대
  "85": "education", // 교육
  "86": "healthcare", // 보건업
  "87": "healthcare", // 사회복지
  "90": "media-entertainment", // 창작·예술
  "91": "travel-leisure", // 스포츠·오락
  "95": "etc", "96": "etc", // 수리·기타 개인 서비스
};

/** KSIC 코드 → 표준 업종 id. 최장 prefix 우선, 미등록은 "etc". */
export function mapKsicToIndustry(ksic: string | undefined): string {
  if (!ksic) return "etc";
  const code = ksic.trim();
  for (const len of [4, 3, 2]) {
    const hit = KSIC_PREFIX_MAP[code.slice(0, len)];
    if (hit) return hit;
  }
  return "etc";
}
