import { CompanyProfile } from "@/types/company";

const wl = { weeklyHours: { contract: 40, real: 45 }, vacation: { days: 18, usageRate: 80 }, remoteWork: { policy: "office" as const, description: "본사 근무" } };
const bf = [{ category: "lifestyle" as const, title: "복지포인트", description: "연간 지급", value: 1_500_000 }];

const mk = (id: string, ko: string, en: string, industry: string, tier: CompanyProfile["tier"], logo: string, description: string, eb: number, jb: number, sb: number, lb: number, exec: number, score: number, kw: string[], pros: string[], cons: string[]): CompanyProfile => ({
 id, name: { ko, en }, industry, tier, logo, description,
 salary: {
 entry: { base: eb, incentive: { target: 20, max: 40, avgAmount: Math.round(eb * 0.2) } },
 junior: { base: jb, incentive: { target: 20, max: 40, avgAmount: Math.round(jb * 0.2) } },
 senior: { base: sb, incentive: { target: 25, max: 50, avgAmount: Math.round(sb * 0.25) } },
 lead: { base: lb, incentive: { target: 30, max: 60, avgAmount: Math.round(lb * 0.3) } },
 executive: { base: exec, incentive: { target: 50, max: 100, avgAmount: Math.round(exec * 0.5) } },
 },
 workLife: wl, culture: { score, keywords: kw, pros, cons }, benefits: bf, lastUpdated: "2026-04-30",
});

export const krCompanies_Batch8: CompanyProfile[] = [
 // 외국계 추가 (10)
 mk("nvidia-korea", "엔비디아 코리아", "NVIDIA Korea", "IT (Foreign)", "foreign", "🟢", "GPU·AI 칩 글로벌 1위. AI 최대 수혜", 95_000_000, 130_000_000, 180_000_000, 250_000_000, 450_000_000, 9.3, ["AI", "GPU", "최고 대우"], ["RSU 폭증", "글로벌 1위"], ["입사 매우 어려움"]),
 mk("tesla-korea", "테슬라 코리아", "Tesla Korea", "Auto (Foreign)", "foreign", "⚡", "전기차 + 자율주행 + 에너지", 70_000_000, 95_000_000, 135_000_000, 180_000_000, 320_000_000, 8.5, ["전기차", "혁신"], ["미션 명확", "RSU"], ["성과 압박 강함"]),
 mk("ibm-watson-korea", "IBM 왓슨 코리아", "IBM Watson Korea", "IT (Foreign)", "foreign", "🔵", "AI·클라우드 컨설팅", 60_000_000, 85_000_000, 115_000_000, 155_000_000, 270_000_000, 7.7, ["AI", "엔터프라이즈"], ["글로벌 경험"], ["전통적 보수"]),
 mk("intel-korea", "인텔 코리아", "Intel Korea", "Semiconductor (Foreign)", "foreign", "🔷", "CPU + 파운드리", 70_000_000, 95_000_000, 130_000_000, 175_000_000, 310_000_000, 8.0, ["반도체", "글로벌"], ["기술 깊이"], ["TSMC·삼성과 경쟁 압박"]),
 mk("asml-korea", "ASML 코리아", "ASML Korea", "Semiconductor Equipment", "foreign", "💎", "노광장비 글로벌 1위", 80_000_000, 110_000_000, 150_000_000, 200_000_000, 360_000_000, 8.7, ["반도체 장비", "독점"], ["압도적 기술력"], ["네덜란드 본사"]),
 mk("netflix-korea", "넷플릭스 코리아", "Netflix Korea", "Media (Foreign)", "foreign", "🎬", "글로벌 OTT 1위", 80_000_000, 110_000_000, 150_000_000, 210_000_000, 380_000_000, 9.0, ["고연봉", "콘텐츠"], ["업계 최고 대우"], ["성과 못 내면 즉시 해고"]),
 mk("tiktok-korea", "틱톡 코리아", "TikTok Korea", "Social Media (Foreign)", "foreign", "🎵", "ByteDance 한국 지사", 60_000_000, 85_000_000, 120_000_000, 165_000_000, 290_000_000, 8.2, ["성장", "글로벌"], ["고연봉"], ["높은 강도"]),
 mk("airbnb-korea", "에어비앤비 코리아", "Airbnb Korea", "Travel-Tech (Foreign)", "foreign", "🏠", "숙박 공유 글로벌 1위", 70_000_000, 95_000_000, 130_000_000, 175_000_000, 310_000_000, 8.4, ["글로벌", "유연"], ["재택 가능"], ["채용 적음"]),
 mk("nike-korea", "나이키 코리아", "Nike Korea", "Fashion (Foreign)", "foreign", "✓", "스포츠 의류 글로벌 1위", 50_000_000, 70_000_000, 95_000_000, 130_000_000, 230_000_000, 8.0, ["브랜드", "마케팅"], ["글로벌 경험"], ["영업 압박"]),
 mk("starbucks-korea", "스타벅스 코리아", "Starbucks Korea", "F&B (Foreign)", "foreign", "☕", "커피 체인 1위", 35_000_000, 48_000_000, 70_000_000, 100_000_000, 180_000_000, 7.8, ["복지", "안정"], ["바리스타 경력"], ["연봉 평균"]),

 // 게임·미디어 추가 (5)
 mk("zepeto-naver-z", "네이버 Z (제페토)", "Naver Z (ZEPETO)", "Metaverse", "conglomerate", "🌐", "글로벌 메타버스 플랫폼", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 8.0, ["메타버스", "Z세대"], ["글로벌 진출"], ["수익화 초기"]),
 mk("naver-webtoon", "네이버 웹툰", "Naver Webtoon", "Media", "conglomerate", "📖", "글로벌 웹툰 1위", 52_000_000, 70_000_000, 95_000_000, 125_000_000, 230_000_000, 8.4, ["IP", "글로벌"], ["수출 IP"], ["IPO 변동성"]),
 mk("kakao-page", "카카오엔터테인먼트", "Kakao Entertainment", "Media", "conglomerate", "📱", "웹툰·웹소설·음악·드라마", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.8, ["콘텐츠", "글로벌"], ["IP 풀"], ["적자 지속"]),
 mk("pearl-abyss-2", "펄어비스 R&D", "Pearl Abyss R&D", "Game", "conglomerate", "⚔️", "붉은사막 개발", 55_000_000, 75_000_000, 100_000_000, 135_000_000, 240_000_000, 7.6, ["AAA", "엔진"], ["기술력"], ["크런치"]),
 mk("krafton-batt", "크래프톤 배그", "Krafton Battlegrounds", "Game", "conglomerate", "🎯", "PUBG 글로벌 IP", 55_000_000, 75_000_000, 100_000_000, 135_000_000, 240_000_000, 8.2, ["글로벌", "PUBG"], ["글로벌 매출"], ["IP 의존"]),

 // 식품·외식 추가 (5)
 mk("paris-baguette", "파리바게뜨", "Paris Baguette", "F&B", "conglomerate", "🥐", "한국 베이커리 1위 (SPC)", 38_000_000, 50_000_000, 68_000_000, 90_000_000, 165_000_000, 7.0, ["글로벌", "F&B"], ["해외 진출"], ["주말 영업"]),
 mk("hite-jinro", "하이트진로", "Hite Jinro", "Beverage", "conglomerate", "🍻", "참이슬·하이트 1위", 40_000_000, 53_000_000, 72_000_000, 95_000_000, 175_000_000, 7.4, ["주류", "안정"], ["1위 점유"], ["주류 규제"]),
 mk("kgc", "KGC인삼공사 (정관장)", "KGC", "F&B", "conglomerate", "🌿", "정관장 홍삼 1위", 42_000_000, 55_000_000, 75_000_000, 100_000_000, 180_000_000, 7.6, ["건강식품", "한국 전통"], ["한국 IP"], ["보수적"]),
 mk("dongwon-fb", "동원F&B", "Dongwon F&B", "F&B", "conglomerate", "🐟", "참치캔 1위", 40_000_000, 53_000_000, 72_000_000, 95_000_000, 175_000_000, 7.3, ["식품", "안정"], ["1위 IP"], ["보수적"]),
 mk("sajo-haepyo", "사조해표", "Sajo Haepyo", "F&B", "conglomerate", "🐟", "수산식품·튀김유", 38_000_000, 50_000_000, 68_000_000, 90_000_000, 165_000_000, 7.0, ["식품"], ["안정"], ["연봉 평균"]),

 // 의료·바이오 추가 (5)
 mk("samsung-medison", "삼성메디슨", "Samsung Medison", "Medical Device", "conglomerate", "🩺", "초음파 의료기기 글로벌", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.9, ["의료기기", "글로벌"], ["삼성 그룹"], ["변동성"]),
 mk("lg-chem-life", "LG화학 생명과학", "LG Chem Life Sciences", "Bio / Pharma", "conglomerate", "🧪", "백신·바이오의약품", 52_000_000, 70_000_000, 95_000_000, 125_000_000, 230_000_000, 7.8, ["바이오", "LG"], ["LG 그룹"], ["적자 지속"]),
 mk("cellz-bio", "셀바이오", "Selvas Healthcare", "Bio / Pharma", "conglomerate", "💉", "의료 AI·진단 기기", 45_000_000, 60_000_000, 82_000_000, 110_000_000, 200_000_000, 7.5, ["AI 의료"], ["성장"], ["수익화 초기"]),
 mk("samsung-electromechanics", "삼성전기", "Samsung Electro-Mechanics", "Electronics", "conglomerate", "⚙️", "MLCC·카메라모듈", 55_000_000, 75_000_000, 100_000_000, 135_000_000, 240_000_000, 8.2, ["부품", "삼성"], ["기술력"], ["수원 발령"]),
 mk("lg-display", "LG디스플레이", "LG Display", "Electronics", "conglomerate", "📺", "OLED 글로벌 1위", 53_000_000, 72_000_000, 97_000_000, 130_000_000, 235_000_000, 7.7, ["디스플레이", "OLED"], ["LG 그룹"], ["적자 지속"]),

 // 통신·미디어 (5)
 mk("naver-cloud", "네이버 클라우드", "Naver Cloud", "IT Cloud", "conglomerate", "☁️", "한국 클라우드 1위", 60_000_000, 82_000_000, 110_000_000, 145_000_000, 260_000_000, 8.5, ["클라우드", "AI"], ["고연봉"], ["성장 압박"]),
 mk("kakao-cloud", "카카오 엔터프라이즈", "Kakao Enterprise", "IT Cloud", "conglomerate", "☁️", "카카오 B2B 클라우드", 58_000_000, 78_000_000, 105_000_000, 140_000_000, 250_000_000, 8.0, ["B2B", "클라우드"], ["카카오"], ["IPO 무산"]),
 mk("samsung-sds-cloud", "삼성 SDS", "Samsung SDS", "IT Service", "conglomerate", "💻", "삼성그룹 IT 자회사", 55_000_000, 75_000_000, 100_000_000, 135_000_000, 240_000_000, 7.8, ["SI", "삼성"], ["삼성 안정"], ["하청 SI"]),
 mk("lg-cns", "LG CNS", "LG CNS", "IT Service", "conglomerate", "💻", "LG그룹 IT 자회사", 53_000_000, 72_000_000, 97_000_000, 130_000_000, 235_000_000, 7.7, ["SI", "LG"], ["LG 안정"], ["SI 영업"]),
 mk("sk-c-and-c", "SK C&C", "SK C&C", "IT Service", "conglomerate", "💻", "SK그룹 IT 자회사", 53_000_000, 72_000_000, 97_000_000, 130_000_000, 235_000_000, 7.6, ["SI", "SK"], ["SK 안정"], ["변화 느림"]),

 // 패션·뷰티 추가 (5)
 mk("amorepacific-2", "아모레 이니스프리", "Amore Innisfree", "Beauty", "conglomerate", "🌿", "이니스프리·에뛰드", 40_000_000, 53_000_000, 72_000_000, 95_000_000, 175_000_000, 7.4, ["뷰티"], ["글로벌"], ["성장 둔화"]),
 mk("kolmar-korea", "콜마 코리아", "Kolmar Korea", "Beauty B2B", "conglomerate", "🧪", "화장품 ODM·OEM", 42_000_000, 55_000_000, 75_000_000, 100_000_000, 180_000_000, 7.5, ["ODM", "K뷰티"], ["수출"], ["B2B 영업"]),
 mk("clio", "클리오", "CLIO", "Beauty", "conglomerate", "💄", "메이크업 브랜드", 38_000_000, 50_000_000, 68_000_000, 90_000_000, 165_000_000, 7.3, ["뷰티"], ["스타일 트렌드"], ["변동성"]),
 mk("style-share", "에이블리", "ABLY", "Fashion", "unicorn", "👗", "여성 패션 앱 1위", 48_000_000, 65_000_000, 88_000_000, 115_000_000, 210_000_000, 7.8, ["패션 앱", "성장"], ["MZ 패션"], ["IPO 어려움"]),
 mk("zigzag-app", "지그재그", "Zigzag", "Fashion", "unicorn", "⚡", "여성 패션 통합 플랫폼", 48_000_000, 65_000_000, 88_000_000, 115_000_000, 210_000_000, 7.7, ["여성 패션"], ["성장세"], ["수익화 초기"]),

 // 이커머스·플랫폼 (5)
 mk("11st", "11번가", "11Street", "E-commerce", "conglomerate", "1️⃣", "SK텔레콤 자회사 종합 쇼핑몰", 45_000_000, 60_000_000, 82_000_000, 110_000_000, 200_000_000, 7.2, ["이커머스"], ["SKT"], ["3위 경쟁"]),
 mk("gmarket", "G마켓", "Gmarket", "E-commerce", "conglomerate", "G", "신세계 인수 종합 쇼핑몰", 45_000_000, 60_000_000, 82_000_000, 110_000_000, 200_000_000, 7.3, ["오픈마켓"], ["신세계"], ["쿠팡 경쟁"]),
 mk("auction-co", "옥션", "Auction", "E-commerce", "conglomerate", "🔨", "G마켓 자매 사이트", 43_000_000, 58_000_000, 78_000_000, 105_000_000, 190_000_000, 7.0, ["오픈마켓"], ["안정"], ["성장 둔화"]),
 mk("ssg-com", "SSG.COM", "SSG.COM", "E-commerce", "conglomerate", "🛒", "신세계 통합 쇼핑몰", 47_000_000, 62_000_000, 85_000_000, 112_000_000, 205_000_000, 7.4, ["프리미엄"], ["신세계"], ["수익화"]),
 mk("market-kurly-2", "컬리", "Kurly Connect", "E-commerce", "unicorn", "🛍️", "마켓컬리 + 뷰티컬리", 45_000_000, 60_000_000, 82_000_000, 110_000_000, 200_000_000, 7.0, ["프리미엄"], ["새벽배송"], ["적자"]),

 // 건설·신재생 (5)
 mk("hdc-hyundai", "HDC현대산업개발", "HDC HDC", "Construction", "conglomerate", "🏗️", "건설·디벨로퍼", 48_000_000, 65_000_000, 88_000_000, 115_000_000, 210_000_000, 7.5, ["건설"], ["디벨로퍼"], ["광주 사고 영향"]),
 mk("samsung-c-and-t", "삼성물산", "Samsung C&T", "Construction", "conglomerate", "🏢", "삼성그룹 건설+상사", 55_000_000, 75_000_000, 100_000_000, 135_000_000, 240_000_000, 8.4, ["건설", "삼성"], ["삼성 안정", "고연봉"], ["성과 압박"]),
 mk("hyundai-engineering", "현대엔지니어링", "Hyundai Engineering", "Construction", "conglomerate", "🏗️", "현대차그룹 플랜트·건설", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.7, ["플랜트", "현대차"], ["글로벌 EPC"], ["해외 발령"]),
 mk("gs-construction", "GS건설", "GS Engineering", "Construction", "conglomerate", "🏗️", "건설 + 디벨로퍼", 48_000_000, 65_000_000, 88_000_000, 115_000_000, 210_000_000, 7.6, ["건설"], ["GS"], ["검단 사고"]),
 mk("daewoo-construction", "DL이앤씨 (대우건설)", "DL E&C", "Construction", "conglomerate", "🏢", "대우건설 (DL그룹)", 47_000_000, 63_000_000, 85_000_000, 112_000_000, 205_000_000, 7.4, ["건설"], ["DL"], ["변동성"]),

 // 운송·물류 (5)
 mk("hmm-shipping", "HMM (현대상선)", "HMM", "Shipping", "conglomerate", "🚢", "한국 해운 1위", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.7, ["해운"], ["1위"], ["사이클 큼"]),
 mk("hanjin-international", "한진", "Hanjin", "Logistics", "conglomerate", "📦", "한진그룹 물류", 42_000_000, 56_000_000, 76_000_000, 102_000_000, 185_000_000, 7.0, ["택배"], ["한진"], ["야근"]),
 mk("hjs-shipping", "현대글로비스", "Hyundai Glovis", "Logistics", "conglomerate", "🚛", "현대차그룹 물류", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.8, ["물류", "현대차"], ["현대차 그룹"], ["변동성"]),
 mk("naver-delivery", "네이버 배송", "Naver Logistics", "Logistics", "conglomerate", "📦", "네이버 도착보장", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.9, ["물류", "네이버"], ["네이버"], ["수익화 초기"]),
 mk("coupang-logistics", "쿠팡 풀필먼트", "Coupang Logistics", "Logistics", "unicorn", "🚚", "쿠팡 물류 자회사", 45_000_000, 60_000_000, 82_000_000, 110_000_000, 200_000_000, 7.3, ["물류"], ["쿠팡 성장"], ["야근 강도"]),

 // 추가 (5)
 mk("posco-energy", "포스코에너지", "POSCO Energy", "Energy", "conglomerate", "⚡", "포스코그룹 발전", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.8, ["에너지", "포스코"], ["포스코"], ["변동성"]),
 mk("hanwha-systems", "한화시스템", "Hanwha Systems", "Defense", "conglomerate", "🛰️", "방산·위성 시스템", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 8.0, ["방산", "위성"], ["방산 호황"], ["보안 엄격"]),
 mk("kia-motors-2", "기아 자동차 R&D", "Kia R&D Center", "Auto R&D", "conglomerate", "🚗", "기아 R&D 본부", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 8.0, ["자동차", "R&D"], ["기아"], ["성과 압박"]),
 mk("smilegate-2", "스마일게이트", "Smilegate", "Game", "conglomerate", "🎮", "크로스파이어 글로벌", 52_000_000, 70_000_000, 95_000_000, 125_000_000, 230_000_000, 7.5, ["게임"], ["글로벌 IP"], ["크로스파이어 의존"]),
 mk("netmarble", "넷마블", "Netmarble", "Game", "conglomerate", "🎲", "모바일 게임 한국 2위", 50_000_000, 68_000_000, 92_000_000, 122_000_000, 220_000_000, 7.4, ["게임", "모바일"], ["모바일 1세대"], ["적자 지속"]),
];
