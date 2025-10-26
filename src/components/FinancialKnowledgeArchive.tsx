// src/components/FinancialKnowledgeArchive.tsx
"use client";

import { useState } from "react";
import {
  Globe,
  TrendingUp,
  BarChart2,
  Activity,
  Scaling,
  Layers,
  type LucideIcon,
} from "lucide-react";

interface KnowledgeItem {
  icon: LucideIcon;
  title: string;
  summary: string;
  content: string;
  analogy: string;
  implication: string;
}

const knowledgeData: KnowledgeItem[] = [
  {
    icon: Layers,
    title: "환율 1%의 나비효과: 내 삶을 바꾸는 거대한 힘",
    summary:
      "환율 1% 변화가 수출, 수입, 주식시장, 그리고 마트 물가까지, 우리 삶 곳곳에 미치는 막대한 영향력을 분석합니다.",
    content:
      "뉴스에서 '환율이 1% 올랐다'는 말은 단순히 숫자의 변화가 아닙니다. 이는 대한민국 경제 시스템 전체에 영향을 미치는 거대한 파도의 시작을 의미합니다. 수출 기업의 실적부터 내 점심값까지, 그 연결고리를 이해하는 것은 현대 사회를 살아가는 필수 교양입니다.",
    analogy:
      "환율은 국가 경제의 '혈압'과 같습니다. 혈압이 조금만 변해도 우리 몸 곳곳에서 반응이 나타나듯, 환율의 미세한 변화는 경제 전체의 순환에 영향을 미쳐 개인의 삶에까지 그 결과가 전달됩니다.",
    implication:
      "환율 1% 상승(원화 가치 하락) 시, ▷(수출) 현대차·삼성전자의 가격 경쟁력이 생겨 실적 개선 기대감이 커지고, 이는 성과급과 주가에 긍정적 영향을 줍니다. ▷(수입) 원유, 밀, 커피 원두 등 원자재 수입 가격이 1% 올라가고, 이는 결국 주유비, 대중교통 요금, 마트 물가 인상 압력으로 작용합니다. ▷(투자) 내가 보유한 미국 주식의 원화 환산 가치는 1% 상승하는 효과를 얻습니다.",
  },
  {
    icon: Globe,
    title: "달러 인덱스 (DXY): 통화의 보이지 않는 왕",
    summary:
      "세계 6대 통화 대비 달러의 평균 가치를 나타내는 지표. 100 이상이면 달러 강세, 이하면 약세를 의미합니다.",
    content:
      "달러 인덱스(US Dollar Index, DXY)는 유로, 일본 엔, 영국 파운드, 캐나다 달러, 스웨덴 크로나, 스위스 프랑 6개국 통화에 대한 달러의 가치를 가중평균하여 산출합니다. 특히 유로화의 비중이 약 57.6%로 가장 높아, 유로의 움직임에 큰 영향을 받습니다. DXY 상승은 곧 달러의 강세를 의미하며, 이는 글로벌 자금이 안전자산인 달러로 몰리고 있다는 신호로 해석될 수 있습니다.",
    analogy:
      "DXY는 축구 경기의 '점유율'과 같습니다. 점유율이 높다고 항상 이기는 것은 아니지만, 현재 어느 팀이 경기를 주도하고 있는지 명확히 보여주는 것처럼, DXY는 현재 글로벌 금융 시장의 주도권이 어디에 있는지 보여줍니다.",
    implication:
      "DXY가 오르면 원/달러 환율도 함께 오를(원화 약세) 가능성이 높습니다. 이는 미국 주식 투자자의 원화 환산 수익률을 높여주지만, 수입 물가를 상승시켜 국내 인플레이션을 자극할 수 있습니다.",
  },
  {
    icon: TrendingUp,
    title: "미국 연준 금리: 세계 경제의 지휘자",
    summary:
      "미국 중앙은행(연준, Fed)이 결정하는 기준금리. 전 세계 모든 자산 가격에 가장 큰 영향을 미칩니다.",
    content:
      "연방기금금리(Fed Funds Rate)는 미국 은행들끼리 하루 동안 돈을 빌릴 때 적용되는 금리입니다. 연준은 이 금리를 올리고 내림으로써 시중의 통화량을 조절하고 경기를 안정시킵니다. 금리 인상은 돈의 가치를 높여 인플레이션을 억제하는 효과가 있지만, 기업의 투자와 소비를 위축시킬 수 있습니다. 반대로 금리 인하는 경기를 부양하는 효과가 있습니다.",
    analogy:
      "연준 의장은 세계 경제라는 거대한 오케스트라의 '지휘자'입니다. 그의 금리라는 지휘봉 움직임 하나에 주식, 채권, 부동산, 환율 등 모든 악기들이 일제히 연주 톤을 바꿉니다.",
    implication:
      "미국 금리가 오르면 더 높은 이자를 좇아 자금이 달러로 이동하며 달러 강세(DXY 상승, 원화 약세)가 나타납니다. 이는 한국은행의 금리 결정에도 큰 압박으로 작용하며, 당신의 대출 이자에도 직접적인 영향을 미칩니다.",
  },
  {
    icon: BarChart2,
    title: "장단기 금리 역전: 경기 침체의 전령",
    summary:
      "단기 채권 금리가 장기 채권 금리보다 높아지는 현상. 미래 경제에 대한 불안감을 반영하는 강력한 신호입니다.",
    content:
      "일반적으로 만기가 긴 채권일수록 금리가 높습니다(장기채 > 단기채). 하지만 투자자들이 미래 경기가 나빠질 것으로 예상하면, 안전한 장기채에 대한 수요가 몰리면서 장기채 가격이 오르고 금리는 떨어집니다. 이로 인해 단기채 금리가 장기채 금리보다 높아지는 '금리 역전' 현상이 발생하며, 이는 역사적으로 높은 확률로 경기 침체를 예고하는 지표로 활용되어 왔습니다.",
    analogy:
      "평소에는 얌전하던 '카나리아'가 갑자기 격렬하게 우는 것과 같습니다. 당장은 아무 일 없어 보여도, 광부들은 카나리아의 경고를 듣고 위험(경기 침체)에 대비해야 합니다.",
    implication:
      "장단기 금리 역전은 단순한 지표를 넘어 시장 참여자들의 '불안 심리' 그 자체입니다. 이 현상이 나타나면 안전자산(달러, 금) 선호가 강해지며, 주식과 같은 위험자산의 변동성이 커질 수 있습니다.",
  },
  {
    icon: Activity,
    title: "VIX 지수 (공포 지수): 시장의 심박수",
    summary:
      "S&P 500 지수 옵션의 변동성을 나타내는 지표. 시장의 불안감과 공포심리를 측정하는 데 사용됩니다.",
    content:
      "VIX(Volatility Index)는 향후 30일간 S&P 500 지수가 얼마나 변동할지에 대한 시장의 기대를 나타냅니다. 지수가 20 이하면 시장이 안정적, 30 이상이면 변동성이 커지며 투자자들의 불안감이 높다는 것을 의미합니다. 주가가 급락할 때 VIX는 급등하는 경향이 있어 '공포 지수'라는 별명을 가지고 있습니다.",
    analogy:
      "VIX는 투자자들의 '심박수 측정기'입니다. 평온할 때는 낮게 유지되다가, 시장에 위협(악재)이 나타나면 심박수가 급격히 치솟는 것과 같습니다.",
    implication:
      "VIX가 급등할 때는 주식 비중을 줄이고 현금이나 안전자산을 확보하는 방어적인 전략이 유효할 수 있습니다. 반대로, 역사적으로 VIX가 최고조에 달했을 때가 주식 매수의 기회였던 경우도 많습니다.",
  },
  {
    icon: Scaling,
    title: "양적완화(QE) vs 양적긴축(QT)",
    summary:
      "중앙은행이 시중에 돈을 풀거나(QE) 거둬들이는(QT) 강력한 통화 정책 무기입니다.",
    content:
      "양적완화(Quantitative Easing)는 중앙은행이 직접 채권을 사들여 시중에 막대한 유동성(돈)을 공급하는 정책입니다. 금리를 이미 0% 가까이 내렸는데도 경기가 살아나지 않을 때 사용하는 비전통적 수단입니다. 반대로 양적긴축(Quantitative Tightening)은 중앙은행이 보유한 채권을 매각하거나 만기 연장을 중단하여 시중의 돈을 흡수하는 정책으로, 과도한 인플레이션을 잡기 위해 사용됩니다.",
    analogy:
      "경제라는 거대한 댐의 수위를 조절하는 '수문'과 같습니다. QE는 수문을 활짝 열어 물(돈)을 방류하는 것이고, QT는 수문을 닫아 물을 가두는 것입니다.",
    implication:
      "QE 시기에는 풍부한 유동성으로 주식, 부동산 등 자산 가격이 상승하는 경향이 있습니다. 반면 QT 시기에는 돈의 가치가 올라가고 대출 이자가 상승하며 자산 시장이 위축될 수 있습니다.",
  },
];

export default function FinancialKnowledgeArchive() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        전문가를 위한 금융 지식 아카이브
      </h2>
      <div className="space-y-4">
        {knowledgeData.map((item, index) => (
          <div
            key={index}
            className="border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg bg-card"
          >
            <button
              onClick={() => handleClick(index)}
              className="w-full flex justify-between items-center p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    {item.summary}
                  </p>
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className={`w-6 h-6 text-muted-foreground transition-transform duration-500 flex-shrink-0 ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                activeIndex === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-6 border-t space-y-4">
                  <p className="text-base text-muted-foreground">
                    {item.content}
                  </p>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="!m-0 text-sm">
                      <span className="font-bold">💬 쉽게 풀어보기:</span>{" "}
                      {item.analogy}
                    </p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                    <p className="!m-0 text-sm">
                      <span className="font-bold text-primary">
                        💡 투자자에게 미치는 영향:
                      </span>{" "}
                      {item.implication}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}