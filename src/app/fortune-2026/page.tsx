"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RefreshCw, TrendingUp } from "lucide-react";
const FORTUNES = {
 "재물운": [
 "올해 재테크 타이밍: 상반기(1~6월)에 분할 매수로 씨앗을 심고, 하반기부터 결실을 거두는 형국입니다. 주식·ETF보다 안정 자산 비중을 55% 이상 유지하세요.",
 "뜻밖의 수입이 3분기에 들어올 가능성이 높습니다. 단, 한 번에 몰아치는 투자보다 적립식이 긍정적인 결과를 가져옵니다.",
 "올해는 재물이 모이는 해입니다. 이미 보유한 자산을 다각화하고, 새로운 파생 수입원을 만드는 것이 중요합니다.",
 ],
 "커리어운": [
 "직장에서의 승진 또는 이직 기회가 찾아오는 시기입니다. 준비된 자에게 기회가 오듯, 포트폴리오 정비와 네트워킹이 핵심입니다.",
 "현재의 자리를 지키면서 조용히 역량을 쌓는 것이 좋은 시기입니다. 급격한 도전보다는 내실 다지기가 큰 도약으로 이어집니다.",
 "새로운 사람과의 만남이 커리어에 큰 전환점을 만들어 줍니다. 업계 모임이나 세미나 참여를 적극 고려해 보세요.",
 ],
 "연봉운": [
 "올해 연봉 협상은 6월 이전에 적극적으로 나서는 것이 길하다 봅니다. 시장 시세 데이터를 충분히 준비하고 협상 자리에 임하세요.",
 "성과 기반의 보상 구조를 요구하는 것이 유리합니다. 기본급 인상보다 성과급, 주식보상 등의 협상이 더 큰 실익을 가져올 수 있습니다.",
 "이직을 통한 연봉 인상이 재직 인상보다 큰 결과를 만들어 내는 해입니다. 최소 2군데 이상 복수 지원하여 레버리지를 활용하세요.",
 ],
};

const ZODIAC_NAMES = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const ZODIAC_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2019, 2016, 2017, 2018, 2019];
const ELEMENTS = ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"];

export default function FinancialFortunePage() {
 const [birthYear, setBirthYear] = useState(1990);
 const [birthMonth, setBirthMonth] = useState(1);
 const [result, setResult] = useState<any | null>(null);

 const calculate = () => {
 const zodiacIdx = (birthYear - 4) % 12;
 const zodiac = ZODIAC_NAMES[Math.abs(zodiacIdx) % 12];
 const elemIdx = Math.floor(((birthYear - 4) % 10) / 2);
 const element = ELEMENTS[Math.abs(elemIdx) % 5];
 
 const moneyFortune = FORTUNES["재물운"][Math.abs((birthYear * 3 + birthMonth) % 3)];
 const careerFortune = FORTUNES["커리어운"][Math.abs((birthYear + birthMonth * 7) % 3)];
 const salaryFortune = FORTUNES["연봉운"][Math.abs((birthYear * 5 + birthMonth * 3) % 3)];
 const score = 65 + ((birthYear + birthMonth * 17) % 31);
 
 setResult({ zodiac, element, moneyFortune, careerFortune, salaryFortune, score });
 };

 return (
 <main className="w-full min-h-screen bg-white px-4 pt-28 pb-20 font-sans">
 <div className="max-w-2xl mx-auto">
 {/* Hero */}
 <div className="text-center mb-12 pb-10 border-b border-canvas">
 <Star className="w-12 h-12 text-primary mx-auto mb-4" />
 <h1 className="text-3xl font-black text-navy mb-3">2026 직장인 재물운·연봉운 사주</h1>
 <p className="text-faint-blue font-medium">태어난 년도와 월을 입력하면 2026년 재물운과 커리어운을 풀어드립니다.</p>
 </div>

 {/* Input */}
 <div className="bg-white border border-canvas rounded-2xl p-8 my-8 shadow-sm">
 <div className="grid grid-cols-2 gap-4 mb-6">
 <div>
 <label className="block text-xs font-bold text-faint-blue mb-2 uppercase tracking-widest">출생 연도</label>
 <input
 type="number"
 min={1950}
 max={2006}
 value={birthYear}
 onChange={e => setBirthYear(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3 text-navy font-bold text-xl text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-faint-blue mb-2 uppercase tracking-widest">출생 월</label>
 <select
 value={birthMonth}
 onChange={e => setBirthMonth(Number(e.target.value))}
 className="w-full border border-canvas rounded-xl px-4 py-3 text-navy font-bold text-center focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
 >
 {Array.from({ length: 12 }, (_, i) => (
 <option key={i + 1} value={i + 1}>{i + 1}월</option>
 ))}
 </select>
 </div>
 </div>
 <button
 onClick={calculate}
 className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
 >
 <Star size={18} /> 2026년 운세 보기
 </button>
 </div>

 <AnimatePresence>
 {result && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-4"
 >
 {/* 기본 정보 */}
 <div className="bg-primary rounded-2xl p-6 text-white text-center">
 <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-2">{birthYear}년생 · {result.element}</p>
 <p className="text-4xl font-black mb-1">{result.zodiac}띠</p>
 <div className="flex items-center justify-center gap-3 mt-4">
 <span className="text-primary-foreground/70 text-sm">2026 재물 지수</span>
 <div className="bg-white/20 rounded-full px-4 py-1">
 <span className="text-navy font-black">{result.score}점 / 100</span>
 </div>
 </div>
 </div>

 {/* 운세 카드들 */}
 {[
 { label: "💰 재물운", content: result.moneyFortune },
 { label: "📈 커리어운", content: result.careerFortune },
 { label: "💼 연봉운", content: result.salaryFortune },
 ].map((item, i) => (
 <div key={i} className="border border-canvas rounded-2xl p-6">
 <p className="font-black text-navy mb-3">{item.label}</p>
 <p className="text-muted-blue text-sm leading-relaxed">{item.content}</p>
 </div>
 ))}

 <button
 onClick={() => setResult(null)}
 className="w-full py-3 border border-canvas rounded-xl text-muted-blue font-bold hover:bg-canvas transition-colors flex items-center justify-center gap-2"
 >
 <RefreshCw size={16} /> 다시 보기
 </button>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="mt-10">
 </div>

 {/* Disclaimer */}
 <p className="text-center text-xs text-faint-blue mt-8 leading-relaxed">
 본 운세 콘텐츠는 전통 사주 이론에 기반한 재미 목적의 참고 정보이며, 실제 투자·금융 결정에 직접 활용하지 마세요.
 </p>
 </div>
 </main>
 );
}