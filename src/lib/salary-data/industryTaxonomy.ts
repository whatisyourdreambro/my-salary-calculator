// src/lib/salary-data/industryTaxonomy.ts
//
// 회사 데이터의 industry 원문 문자열은 batch 파일마다 표기가 제각각이다
// (예: "Banking", "Banking / Public", "Banking / Financial Holding", "Internet Banking").
// 정확 문자열 일치로 같은 업종 회사를 묶으면 동종업계 평균·순위가 깨진다.
// 이 파일은 모든 원문 문자열을 표준 업종(canonical industry)으로 정규화한다.
// 동종업계 벤치마크·순위(companyContentBuilder), 업종별 랜딩 페이지가 공유한다.

export interface IndustryMeta {
  /** URL 슬러그 겸 내부 식별자 */
  id: string;
  /** 한글 라벨 — 검색 키워드 친화 ("반도체 연봉" 등) */
  ko: string;
  /** 영문 라벨 */
  en: string;
  /** 데이터상 이 업종을 가리키는 모든 원문 industry 문자열 */
  aliases: string[];
}

/** 표준 업종 분류. 신규 회사가 새 원문 문자열을 들고 오면 해당 업종 aliases에 추가한다. */
export const CANONICAL_INDUSTRIES: IndustryMeta[] = [
  {
    id: "it-software",
    ko: "IT·인터넷",
    en: "IT / Software",
    aliases: [
      "Platform", "IT Services", "Tech / Software", "Software", "IT/Platform",
      "IT/DX", "IT Consulting", "IT / Internet", "IT / Cloud", "IT / Retail",
      "Cloud", "Cloud MSP", "Cloud / AI", "Social Media / VR", "C2C Platform",
      "AdTech", "AI Research / LLM", "AI Research / Consumer Electronics",
      "AI / Robotics / AR", "PropTech", "Interior Platform",
    ],
  },
  {
    id: "game",
    ko: "게임",
    en: "Game",
    aliases: ["Game", "Gaming", "Game / Blockchain"],
  },
  {
    id: "bank",
    ko: "은행",
    en: "Banking",
    aliases: ["Banking", "Banking / Public", "Banking / Financial Holding", "Internet Banking"],
  },
  {
    id: "securities",
    ko: "증권·자산운용",
    en: "Securities",
    aliases: ["Securities", "Securities / Investment Banking", "Asset Management", "Trade / Investment"],
  },
  {
    id: "insurance",
    ko: "보험",
    en: "Insurance",
    aliases: ["Insurance", "Insurance (Non-Life)", "Life Insurance"],
  },
  {
    id: "card-finance",
    ko: "카드·캐피탈",
    en: "Card / Capital Finance",
    aliases: ["Card / Finance", "Finance / Card"],
  },
  {
    id: "finance",
    ko: "금융",
    en: "Finance",
    aliases: [
      "Finance", "Public Finance", "Finance / Public", "Holding",
      "Investment Holding", "Finance Equipment", "Credit Rating / Financial Data",
      "Data / Finance",
    ],
  },
  {
    id: "fintech",
    ko: "핀테크",
    en: "Fintech",
    aliases: ["Fintech"],
  },
  {
    id: "semiconductor",
    ko: "반도체·디스플레이",
    en: "Semiconductor / Display",
    aliases: [
      "Semiconductor", "Semiconductor Equipment", "Semiconductor/IC Design",
      "Semiconductor / Consumer Electronics", "Semiconductor / AI",
      "Display", "Display Equipment",
    ],
  },
  {
    id: "electronics",
    ko: "전자·전기",
    en: "Electronics",
    aliases: ["Consumer Electronics", "Electronic Components", "Home Appliance", "Cable / Wire", "R&D / Electronics"],
  },
  {
    id: "automotive",
    ko: "자동차·부품",
    en: "Automotive",
    aliases: ["Automotive", "Auto Parts", "Automotive / Energy", "Auto Parts / Transmission", "Auto Parts / Machine Tools"],
  },
  {
    id: "battery",
    ko: "2차전지·배터리",
    en: "Battery",
    aliases: ["Battery", "Battery Materials", "EV Battery"],
  },
  {
    id: "pharma-bio",
    ko: "제약·바이오",
    en: "Pharmaceutical / Bio",
    aliases: [
      "Pharmaceutical", "Pharma", "Biopharmaceutical", "Biotech", "Bio",
      "Bio / Pharma", "Bio/Pharma", "Medical Device", "Medical Device / Dental",
      "Diagnostics / Biotech", "Biotech / Medical Aesthetics",
    ],
  },
  {
    id: "healthcare",
    ko: "병원·의료",
    en: "Healthcare",
    aliases: ["Healthcare / University Hospital", "Healthcare / Public", "Healthcare / General Hospital"],
  },
  {
    id: "construction",
    ko: "건설·부동산",
    en: "Construction / Real Estate",
    aliases: ["Construction", "Real Estate / Public", "Real Estate / Housing", "Construction/Environment", "Construction / Trade"],
  },
  {
    id: "heavy-industry",
    ko: "중공업·조선",
    en: "Heavy Industry",
    aliases: ["Heavy Industry", "Shipbuilding", "Heavy Equipment"],
  },
  {
    id: "chemical",
    ko: "화학·소재",
    en: "Chemical / Materials",
    aliases: ["Chemical", "Chemical / Solar", "Construction Materials / Chemical"],
  },
  {
    id: "steel",
    ko: "철강·금속",
    en: "Steel / Metal",
    aliases: ["Steel", "Steel / Materials", "Metal"],
  },
  {
    id: "energy",
    ko: "에너지·전력",
    en: "Energy",
    aliases: [
      "Energy", "Energy / Public", "Utilities / Water", "Solar Energy",
      "Solar / EV Charging", "Energy/Refinery", "Energy/Gas", "Energy / Nuclear",
      "Energy / Manufacturing", "Energy / Hydrogen", "Energy / Chemical",
      "R&D / Nuclear", "Environment",
    ],
  },
  {
    id: "retail-commerce",
    ko: "유통·이커머스",
    en: "Retail / Commerce",
    aliases: [
      "Retail", "E-commerce", "Retail / Luxury", "Retail / Convenience",
      "Luxury Retail", "Home Shopping", "Home Shopping / Commerce",
      "Convenience / Retail", "Commerce", "Platform/Commerce",
      "E-commerce / Food", "E-commerce / Cloud", "Trading", "Trading/Services",
    ],
  },
  {
    id: "food-beverage",
    ko: "식품·음료",
    en: "Food / Beverage",
    aliases: [
      "Food", "Food / Bio", "Beverage", "Beverage / Alcohol", "Food Service",
      "Food Distribution", "Food & Beverage", "Health / Food",
    ],
  },
  {
    id: "logistics",
    ko: "물류·운송",
    en: "Logistics / Transport",
    aliases: [
      "Logistics", "Transportation", "Transportation / Public", "Transport",
      "Transportation / Infrastructure", "Airline", "Postal / Logistics",
    ],
  },
  {
    id: "telecom",
    ko: "통신",
    en: "Telecom",
    aliases: ["Telecom", "Telco / AI", "AI / Telecom Research"],
  },
  {
    id: "media-entertainment",
    ko: "미디어·엔터테인먼트",
    en: "Media / Entertainment",
    aliases: [
      "Entertainment", "Entertainment / K-pop", "Media / Broadcasting",
      "Broadcasting / Media", "Satellite Broadcasting", "News Broadcasting",
      "Media/Cable", "Media", "Media / Entertainment", "Entertainment / Streaming",
      "Advertising / Marketing",
    ],
  },
  {
    id: "consulting",
    ko: "컨설팅·회계",
    en: "Consulting / Accounting",
    aliases: ["Accounting / Consulting", "Management Consulting"],
  },
  {
    id: "legal",
    ko: "법률",
    en: "Legal",
    aliases: ["Legal Services"],
  },
  {
    id: "education",
    ko: "교육",
    en: "Education",
    aliases: ["EdTech", "Education / EduTech", "Education", "Education / Publishing", "Education / Public"],
  },
  {
    id: "fashion-beauty",
    ko: "패션·뷰티",
    en: "Fashion / Beauty",
    aliases: [
      "Fashion Platform", "Fashion", "Fashion / Retail", "Fashion / Materials",
      "Fashion / Commerce", "Cosmetics", "Cosmetics ODM",
      "Cosmetics ODM / Pharmaceutical", "Health / Beauty Retail",
    ],
  },
  {
    id: "consumer-goods",
    ko: "소비재",
    en: "Consumer Goods",
    aliases: ["Consumer Goods", "Tobacco / Bio", "Home Furnishing"],
  },
  {
    id: "mobility",
    ko: "모빌리티",
    en: "Mobility",
    aliases: ["Mobility/Leasing", "Mobility / Platform", "Mobility / Leasing"],
  },
  {
    id: "travel-leisure",
    ko: "여행·레저",
    en: "Travel / Leisure",
    aliases: ["Travel Platform", "Travel / Leisure Platform", "Tourism", "Hospitality"],
  },
  {
    id: "defense-aerospace",
    ko: "방위산업·항공우주",
    en: "Defense / Aerospace",
    aliases: ["Defense", "Defense / IT", "Defense / Auto", "Aerospace", "R&D / Aerospace"],
  },
  {
    id: "manufacturing",
    ko: "제조",
    en: "Manufacturing",
    aliases: ["Manufacturing", "Industrial Systems", "Automation / Equipment", "Agricultural Machinery", "R&D"],
  },
  {
    id: "public",
    ko: "공공기관",
    en: "Public Sector",
    aliases: [
      "Infrastructure / Public", "Security / Public", "Research / Public",
      "Public Health / Insurance", "Development Aid", "Labor / Public",
      "Agriculture / Public",
    ],
  },
  {
    id: "etc",
    ko: "기타",
    en: "Other",
    aliases: [],
  },
];

/** 표준화용 문자열 정규화 — 소문자, 공백 단일화. */
function normKey(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

// 원문 문자열 → 표준 id 조회 맵 (모듈 로드 시 1회 생성).
const ALIAS_TO_ID = new Map<string, string>();
const ID_TO_META = new Map<string, IndustryMeta>();
for (const meta of CANONICAL_INDUSTRIES) {
  ID_TO_META.set(meta.id, meta);
  ALIAS_TO_ID.set(normKey(meta.id), meta.id);
  ALIAS_TO_ID.set(normKey(meta.ko), meta.id);
  ALIAS_TO_ID.set(normKey(meta.en), meta.id);
  for (const alias of meta.aliases) {
    ALIAS_TO_ID.set(normKey(alias), meta.id);
  }
}

/**
 * 회사 industry 원문 문자열을 표준 업종 id로 변환.
 * 미등록 문자열은 "etc"로 떨어진다 — 신규 데이터 추가 시 aliases를 보강할 것.
 */
export function normalizeIndustry(raw: string | undefined | null): string {
  if (!raw) return "etc";
  return ALIAS_TO_ID.get(normKey(raw)) ?? "etc";
}

/** 표준 업종 id로 메타 조회. 미등록 id는 etc 메타 반환. */
export function getIndustryMeta(id: string): IndustryMeta {
  return ID_TO_META.get(id) ?? ID_TO_META.get("etc")!;
}

/** industry 원문 문자열 → 한글 라벨. */
export function industryLabelKo(raw: string | undefined | null): string {
  return getIndustryMeta(normalizeIndustry(raw)).ko;
}

/** 색인 가능한(=etc 제외) 표준 업종 메타 목록. */
export function getIndexableIndustries(): IndustryMeta[] {
  return CANONICAL_INDUSTRIES.filter((m) => m.id !== "etc");
}
