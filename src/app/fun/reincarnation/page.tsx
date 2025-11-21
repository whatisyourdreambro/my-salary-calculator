// src/app/fun/reincarnation/page.tsx
"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather, Wheat, Hammer, Shield, Scroll, Gem, Crown, Flame
} from "lucide-react";
import AdUnit from "@/components/AdUnit";

const tiers = [
  { limit: 28000000, title: "길거리의 깃털", icon: Feather, description: "당신은 바람에 흩날리는 깃털처럼 자유로운 영혼입니다. 주머니는 가볍지만, 세상 모든 것을 구경할 수 있는 자유가 있죠. 가끔은 배고플 수 있습니다." },
  { limit: 35000000, title: "성실한 농부", icon: Wheat, description: "당신은 넓은 평야에서 묵묵히 밭을 가는 농부입니다. 매일의 성실함이 당신의 가장 큰 무기이며, 가을의 풍성한 수확을 기다립니다." },
  { limit: 45000000, title: "숙련된 대장장이", icon: Hammer, description: "마을 최고의 대장장이! 당신의 망치질 한 번에 명검이 탄생합니다. 모두가 당신의 손재주를 필요로 하지만, 야근은 숙명입니다." },
  { limit: 60000000, title: "왕국의 기사", icon: Shield, description: "왕국의 방패, 명예로운 기사입니다. 당신은 튼튼한 갑옷과 빛나는 검을 지녔으며, 왕과 백성을 위해 충성을 맹세했습니다. 가끔은 드래곤을 잡으러 가야 합니다." },
  { limit: 80000000, title: "지혜로운 현자", icon: Scroll, description: "왕국의 모든 지식을 꿰뚫고 있는 현자입니다. 왕도 당신에게 조언을 구하며, 당신의 말 한마디에 왕국의 운명이 바뀝니다. 골치 아픈 일이 많습니다." },
  { limit: 120000000, title: "상단의 대부호", icon: Gem, description: "대륙의 모든 부가 당신의 손을 거쳐갑니다. 당신은 보석과 비단으로 치장하고, 당신의 배는 7대양을 누빕니다. 당신의 금고는 언제나 가득 차 있습니다." },
  { limit: 200000000, title: "고귀한 대공", icon: Crown, description: "왕국의 2인자, 막강한 권력의 대공입니다. 당신은 드넓은 영지를 소유하고 있으며, 수많은 기사들이 당신에게 충성을 맹세합니다. 왕좌가 멀지 않았습니다." },
  { limit: Infinity, title: "화염의 드래곤", icon: Flame, description: "당신은 부와 권력을 초월한 존재, 산더미 같은 보물을 깔고 잠자는 고대의 드래곤입니다. 인간들의 아웅다웅하는 모습이 그저 귀여울 뿐입니다." },
];

const getTier = (salary: number) => {
  return tiers.find(tier => salary < tier.limit) || tiers[tiers.length - 1];
};

export default function ReincarnationPage() {
  const [salary, setSalary] = useState("50000000");
  const annualSalary = useMemo(() => Number(salary.replace(/,/g, "")), [salary]);

  const result = getTier(annualSalary);
  const ResultIcon = result.icon;

  return (
    <main className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          내 연봉으로 환생한다면?
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          만약 당신이 지금 연봉을 들고 판타지 세계에서 환생한다면,
          <br />
          어떤 신분이 될지 확인해보세요!
        </p>
      </div>

      {/* Ad Unit: Top */}
      <div className="mb-8">
        <AdUnit slotId="3322110099" format="auto" label="Reincarnation Top Ad" />
      </div>

      <div className="max-w-md mx-auto mb-12">
        <CurrencyInput
          label="나의 현재 연봉"
          value={salary}
          onValueChange={setSalary}
          quickAmounts={[10000000, 5000000]}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={result.title}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="bg-card p-8 rounded-2xl shadow-2xl border border-border flex flex-col items-center text-center"
        >
          <motion.div
            className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner"
            animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            <ResultIcon className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="font-semibold text-muted-foreground">당신의 환생 후 신분은...</p>
          <h2 className="text-4xl font-bold text-primary my-2">{result.title}</h2>
          <p className="mt-4 max-w-md mx-auto text-foreground/80 leading-relaxed">
            {result.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Ad Unit: Bottom */}
      <div className="mt-12">
        <AdUnit slotId="0099887766" format="auto" label="Reincarnation Bottom Ad" />
      </div>
    </main>
  );
}
