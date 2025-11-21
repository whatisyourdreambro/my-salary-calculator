"use client";

import { useState } from "react";
import {
  ShieldCheck,
  HeartPulse,
  Briefcase,
  Hospital,
  FileText,
  Wallet,
  BarChartHorizontal,
  BookUser,
  HandCoins,
  LogOut,
  PiggyBank,
  TrendingUp,
  Home,
  Flame,
  Search,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdUnit from "@/components/AdUnit";

interface GlossaryItem {
  title: string;
  icon: any;
  category: string;
  summary: string;
  content: string;
  analogy: string;
  tip: string;
}

const glossaryData: GlossaryItem[] = [
  // 4대 보험 & 세금 기초
  {
    category: "4대 보험 & 세금 기초",
    title: "국민연금",
    icon: ShieldCheck,
    summary:
      "30년 뒤의 나에게 보내는 가장 확실한 월급. 국가가 보증하는 든든한 노후 파트너입니다.",
    content:
      "국가가 운영하는 공적 연금 제도로, 소득이 있을 때 의무적으로 보험료를 납부하여 미래의 위험(노령, 장애, 사망)에 대비합니다. 이를 통해 본인이나 유족에게 연금을 지급하여 기본적인 생활을 보장하는 사회의 약속입니다.",
    analogy:
      "마치 '경제적 타임캡슐' 같아요. 지금의 내가 조금씩 묻어둔 노력이, 수십 년 뒤 미래의 나에게 풍요로운 선물이 되어 돌아옵니다.",
    tip: "연말정산 최고의 효자! 납부액은 전액 소득공제되어, 세금을 돌려받는 가장 확실한 방법 중 하나입니다. 노후 준비와 절세를 동시에 잡으세요.",
  },
  {
    category: "4대 보험 & 세금 기초",
    title: "건강보험",
    icon: HeartPulse,
    summary:
      "병원비 폭탄을 막아주는 전국민 필수 안전장치. 아플 때 기댈 수 있는 가장 든든한 보험입니다.",
    content:
      "질병이나 부상으로 인해 발생하는 고액의 진료비 부담을 막기 위해, 모든 국민이 평소에 보험료를 내고 이를 모아 서로 돕는 사회보험제도입니다.",
    analogy:
      "인생이라는 도로를 달릴 때 의무적으로 장착하는 '에어백'입니다. 언제 터질지 모르는 사고로부터 나를 지켜주죠.",
    tip: "직장가입자의 경우, 회사가 보험료의 50%를 부담해줍니다. 내가 내는 만큼 회사도 내준다는 사실!",
  },
  {
    category: "4대 보험 & 세금 기초",
    title: "고용보험",
    icon: Briefcase,
    summary:
      "갑작스러운 실직의 충격으로부터 나를 보호하고, 재도약을 돕는 든든한 버팀목입니다.",
    content:
      "실직 시 재취업 활동 기간 동안 실업급여를 지급하고, 직업능력개발 훈련을 지원하는 등 근로자의 고용 안정을 돕는 사회보험입니다.",
    analogy:
      "갑작스러운 실직이라는 폭풍우를 만났을 때 잠시 비를 피할 수 있게 해주는 '튼튼한 우산'입니다.",
    tip: "육아휴직 급여와 출산휴가 급여도 고용보험 기금에서 지급됩니다. 일과 가정의 양립을 돕는 중요한 역할을 합니다.",
  },
  {
    category: "4대 보험 & 세금 기초",
    title: "산재보험",
    icon: Hospital,
    summary:
      "일터라는 전쟁터에서 나를 지켜주는 100% 회사 부담의 든든한 갑옷입니다.",
    content:
      "업무상의 사유로 인한 근로자의 부상, 질병, 사망 등에 대비하여 치료비, 휴업급여 등을 보상하는 사회보험입니다. 보험료는 전액 사업주가 부담합니다.",
    analogy:
      "일터라는 전쟁터에서 나를 지켜주는 '방탄조끼'와 같습니다. 모든 비용은 회사가 책임지죠.",
    tip: "근로자라면 아르바이트생이라도 누구나 적용 대상이 됩니다. 내 돈은 한 푼도 나가지 않으니 안심하세요!",
  },
  {
    category: "4대 보험 & 세금 기초",
    title: "소득세 (근로소득세)",
    icon: FileText,
    summary:
      "국가 운영을 위해 내가 번 돈의 일부를 함께 나누는, 국민의 4대 의무 중 하나입니다.",
    content:
      "개인이 얻는 소득에 대해 부과되는 세금입니다. 근로자의 경우 매월 급여에서 간이세액표에 따라 원천징수되며, 연말정산을 통해 최종 납부세액이 결정됩니다.",
    analogy:
      "국가라는 큰 집의 운영을 위해 함께 내는 '월 관리비'라고 생각할 수 있습니다. 덕분에 안전한 치안과 편리한 인프라를 누릴 수 있죠.",
    tip: "소득이 높을수록 높은 세율이 적용되는 '누진세' 구조입니다. 연봉이 오를수록 세금에 더 신경 써야 하는 이유입니다.",
  },

  // 급여 & 임금
  {
    category: "급여 & 임금",
    title: "통상임금",
    icon: Wallet,
    summary:
      "초과근무수당, 연차수당 등을 계산하는 기준이 되는 나의 '기본 몸값'입니다.",
    content:
      "근로자에게 정기적, 일률적으로 지급하기로 정한 금액입니다. 연장, 야간, 휴일근로수당이나 연차수당, 퇴직금 등을 산정하는 중요한 기준이 됩니다.",
    analogy:
      "각종 추가 수당을 계산하기 위한 '기본 공식'의 변수 값과 같습니다. 이 기준값이 높아야 추가 수당도 많아집니다.",
    tip: "기본급, 직무수당, 직책수당 등이 포함되며, 성과급이나 복리후생비는 보통 제외됩니다.",
  },
  {
    category: "급여 & 임금",
    title: "평균임금",
    icon: BarChartHorizontal,
    summary:
      "퇴직금, 실업급여의 액수를 결정하는 '최근 3개월의 평균 가치'입니다.",
    content:
      "퇴직금, 실업급여, 휴업수당 등을 산정하기 위해 퇴사일 이전 3개월 동안 지급된 임금 총액을 그 기간의 총일수로 나눈 금액입니다.",
    analogy:
      "퇴사 직전 나의 '평균적인 가치'를 숫자로 나타낸 것입니다. 보통 통상임금보다 높습니다.",
    tip: "성과급 등 비정기적인 상여금도 포함되기 때문에, 언제 퇴사하느냐에 따라 금액이 달라질 수 있습니다.",
  },
  {
    category: "급여 & 임금",
    title: "비과세 수당",
    icon: BookUser,
    summary:
      "세금을 떼지 않아 실수령액을 마법처럼 늘려주는 '보너스 주머니'입니다.",
    content:
      "세금을 부과하지 않는 소득 항목입니다. 근로자의 생활을 보조하는 성격이 강하며, 식대, 차량유지비, 육아휴직 급여 등이 대표적입니다.",
    analogy:
      "연봉이라는 그릇에 담기지만, 세금이라는 젓가락이 피해 가는 '특별한 반찬'입니다.",
    tip: "2025년 기준 식대는 월 20만원까지 비과세됩니다. 연봉 협상 시 총액만큼이나 중요한 고려 요소입니다.",
  },
  {
    category: "급여 & 임금",
    title: "주휴수당",
    icon: HandCoins,
    summary:
      "일주일 만근 시 하루치 일급을 더! 성실함에 대한 법적인 보상입니다.",
    content:
      "1주일에 15시간 이상 근무하고, 약속한 날에 모두 출근한 근로자에게 주 1회 유급휴일을 보장하는 제도입니다. 이날 일하지 않아도 받을 수 있는 돈이 주휴수당입니다.",
    analogy:
      "일주일 만근 스탬프를 다 모으면 받는 '무료 음료 쿠폰' 같은 개념입니다. 놓치면 나만 손해죠.",
    tip: "월급제 근로자는 보통 월급에 주휴수당이 포함되어 있습니다. 아르바이트생이라면 꼭 챙겨야 할 소중한 권리입니다.",
  },

  // 퇴직 & 이직
  {
    category: "퇴직 & 이직",
    title: "퇴직금",
    icon: LogOut,
    summary:
      "회사를 떠나는 당신에게 회사가 주는 마지막 선물이자, 새로운 시작을 위한 종잣돈입니다.",
    content:
      "1년 이상 계속 근로한 근로자가 퇴직할 경우, 30일분 이상의 평균임금을 지급하는 제도입니다. 근로자의 안정적인 노후 생활을 보장하기 위한 법적 의무입니다.",
    analogy:
      "직장생활이라는 긴 마라톤을 완주한 선수에게 주어지는 '완주 메달'입니다. 그간의 노고에 대한 값진 보상이죠.",
    tip: "정확한 예상 퇴직금은 '1일 평균임금 × 30일 × (총 재직일수 / 365)' 공식으로 계산할 수 있습니다.",
  },
  {
    category: "퇴직 & 이직",
    title: "IRP (개인형 퇴직연금)",
    icon: PiggyBank,
    summary:
      "퇴직금을 안전하게 굴리면서 세금 혜택까지 받는, 당신의 노후를 위한 VIP 계좌입니다.",
    content:
      "근로자가 재직 중에 자율적으로 가입하거나, 퇴직 시 받은 퇴직금을 이전하여 운용할 수 있는 퇴직연금 계좌입니다. 연 900만원까지 강력한 세액공제 혜택을 제공합니다.",
    analogy:
      "내 퇴직금을 위한 'VIP 금고'입니다. 안전하게 보관할 뿐만 아니라, 넣어두기만 해도 세금을 환급해주는 보너스까지 있죠.",
    tip: "성과급을 많이 받은 해에 IRP에 납입하면 연말정산 시 '세금 폭탄'을 막아주는 최고의 방패가 됩니다.",
  },

  // 투자 & 재테크
  {
    category: "투자 & 재테크",
    title: "ETF (상장지수펀드)",
    icon: TrendingUp,
    summary:
      "삼성전자, 애플, 코카콜라... 최고의 주식들을 단돈 1만원으로 한번에 쇼핑하는 방법.",
    content:
      "특정 주가 지수나 자산의 가격 움직임에 따라 수익률이 결정되도록 설계된 펀드입니다. 주식처럼 실시간으로 쉽게 사고팔 수 있다는 장점이 있습니다.",
    analogy:
      "최고의 셰프들이 엄선한 '코스 요리'와 같아요. 어떤 메뉴를 골라야 할지 고민할 필요 없이, 검증된 최고의 조합을 간편하게 즐길 수 있죠.",
    tip: "투자의 신 워렌 버핏도 '내가 죽으면 재산의 90%를 S&P 500 ETF에 투자하라'고 했습니다. 시장 전체의 성장에 투자하는 것이 현명한 선택일 수 있습니다.",
  },
  {
    category: "투자 & 재테크",
    title: "DSR (총부채원리금상환비율)",
    icon: Home,
    summary:
      "내 연봉으로 감당할 수 있는 대출의 총량을 정해주는 '금융 신용카드 한도'입니다.",
    content:
      "연 소득 대비 모든 가계대출의 원리금 상환액 비율을 나타내는 지표입니다. 주택담보대출, 신용대출 등 모든 대출의 원금과 이자를 더해 계산합니다.",
    analogy:
      "내가 감당할 수 있는 '금융 무게'의 한계선입니다. 이 선을 넘으면 은행에서 대출을 해주지 않습니다.",
    tip: "현재 1금융권은 DSR 40% 규제가 적용됩니다. 연봉이 5,000만원이라면 연간 원리금 상환액이 2,000만원을 넘을 수 없습니다.",
  },
  {
    category: "투자 & 재테크",
    title: "FIRE족 (파이어족)",
    icon: Flame,
    summary:
      "경제적 자유를 통해 이른 은퇴를 꿈꾸는, 현대판 '디지털 노마드'의 재테크 버전입니다.",
    content:
      "'경제적 독립, 조기 은퇴(Financial Independence, Retire Early)'의 약자로, 젊을 때 극단적으로 소비를 줄여 돈을 모아 자산을 형성하고, 40대 전후의 이른 나이에 은퇴하는 것을 목표로 하는 사람들을 말합니다.",
    analogy:
      "인생이라는 게임의 '엔딩'을 남들보다 빨리 보고, 이후에는 자유로운 '자유 모드'를 즐기는 플레이어입니다.",
    tip: "FIRE족의 목표 자산은 보통 '연간 생활비의 25배'로 설정합니다. 월 300만원을 쓴다면 약 9억원이 필요합니다.",
  },
];

const categories = [
  "전체",
  "4대 보험 & 세금 기초",
  "급여 & 임금",
  "퇴직 & 이직",
  "투자 & 재테크",
];

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredData = glossaryData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "전체" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="w-full bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-black z-0" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[100px] -z-10 animate-pulse-glow" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>금융 문맹 탈출 프로젝트</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              금융 용어, <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                당신의 돈이 말을 거는 순간
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              더 이상 어렵고 복잡한 용어에 주눅 들지 마세요. <br className="hidden sm:block" />
              당신의 월급봉투와 통장, 그리고 미래를 이해하는 가장 확실한 열쇠를 드립니다.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="mt-10 max-w-xl mx-auto relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="궁금한 용어를 검색해보세요 (예: 국민연금, IRP)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-20">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border"
                }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Ad Unit */}
        <AdUnit slotId="9876543210" format="auto" label="Glossary Top Ad" className="mb-12" />

        {/* Glossary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredData.map((item, index) => (
              <motion.div
                key={item.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative bg-card/50 backdrop-blur-sm dark:bg-card/30 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm font-medium text-muted-foreground mb-4 italic">
                    &quot;{item.summary}&quot;
                  </p>

                  <p className="text-sm text-foreground/80 leading-relaxed mb-6 line-clamp-3 group-hover:line-clamp-none transition-all">
                    {item.content}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-xs text-foreground/90">
                        <span className="font-bold block mb-1">💬 쉽게 말하면:</span>
                        {item.analogy}
                      </p>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg border-l-2 border-blue-500">
                      <p className="text-xs text-foreground/90">
                        <span className="font-bold text-blue-500 block mb-1">💡 Honey Tip:</span>
                        {item.tip}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              검색 결과가 없습니다. 다른 용어로 검색해보세요.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
