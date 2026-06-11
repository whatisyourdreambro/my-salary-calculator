// src/app/pro/career-planner/page.tsx
"use client";

import { useState } from "react";
import PageFooterAds from "@/components/PageFooterAds";
import {
 CareerEvent,
 CareerSimulationInput,
 runCareerSimulation,
 SimulationYearOutput,
 CareerEventType,
 PromotionEvent,
 JobChangeEvent,
 EducationEvent,
 SideProjectEvent
} from "@/lib/careerPlanner";
import CurrencyInput from "@/components/CurrencyInput";
import NumberStepper from "@/components/NumberStepper";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelatedGuides from "@/components/RelatedGuides";
import type { RelatedGuideItem } from "@/lib/relatedGuides";
import JsonLd from "@/components/JsonLd";
import { faqLd } from "@/lib/structuredData";
import { Plus, X, BrainCircuit, TrendingUp, Briefcase, GraduationCap } from "lucide-react";
import dynamic from "next/dynamic";

const DynamicCareerVisuals = dynamic(() => import("@/components/CareerVisuals"), {
 loading: () => <div className="text-center p-10 min-h-[600px] flex items-center justify-center"><p>차트 로딩 중...</p></div>,
 ssr: false
});

const eventIcons: { [key in CareerEventType]: React.ElementType } = {
 promotion: TrendingUp,
 job_change: Briefcase,
 education: GraduationCap,
 side_project: BrainCircuit,
};

const eventTypeNames: { [key in CareerEventType]: string } = {
 promotion: '승진',
 job_change: '이직',
 education: '학위/휴직',
 side_project: '사이드 프로젝트',
};

// FAQ — 본문 하단 노출 + faqLd JSON-LD 동시 사용 (thin content 해소)
const PLANNER_FAQ = [
 {
 question: "커리어 패스 시뮬레이터는 어떤 원리로 계산하나요?",
 answer:
 "초기 연봉에 매년 기본 인상률을 복리로 적용하고, 승진·이직·학위(휴직)·사이드 프로젝트 이벤트를 해당 연차에 반영합니다. 소득에서 물가 상승률이 적용된 지출을 뺀 저축액을 투자 수익률로 굴려 연도별 자산 흐름을 예측합니다. 결과는 참고용 추정치입니다.",
 },
 {
 question: "연봉 인상률과 투자 수익률은 얼마로 설정하는 것이 현실적인가요?",
 answer:
 "국내 기업의 평균 연봉 인상률은 통상 연 3~5% 수준이며, 이직 시에는 10~20% 상승이 일반적입니다. 투자 수익률은 장기 주가지수 평균인 연 7~8%를 기본으로 하되, 보수적으로 보려면 4~5%로 낮춰 시뮬레이션해 보세요.",
 },
 {
 question: "승진 이벤트와 이직 이벤트는 무엇이 다른가요?",
 answer:
 "승진은 현재 연봉에 입력한 인상률(%)을 곱해 올리는 방식이고, 이직은 연봉 자체를 새로 입력한 금액으로 교체하는 방식입니다. 큰 폭의 연봉 점프는 이직 이벤트로, 꾸준한 상승은 승진 이벤트로 설계하면 실제 커리어와 비슷한 곡선을 만들 수 있습니다.",
 },
 {
 question: "시뮬레이션의 연봉은 세전인가요, 세후인가요?",
 answer:
 "입력하는 연봉은 세전 기준이며, 저축액 계산 시 내부적으로 간이 세후 소득으로 환산해 사용합니다. 정확한 월 실수령액이 궁금하다면 머니샐러리 홈의 연봉 계산기에서 2026년 세법 기준으로 확인하세요.",
 },
];

// 추천 가이드 — 클라이언트 페이지라 서버 헬퍼(getRelatedGuides) 대신
// 가벼운 메타데이터만 하드코딩 (가이드 본문 번들 유입 방지)
const PLANNER_RELATED_GUIDES: RelatedGuideItem[] = [
 {
 slug: "salary-negotiation-secret",
 title: "연봉협상 필승 전략: '얼마 원하세요?'에 대한 모범 답안 🗣️",
 description:
 "협상 테이블에서 절대 쫄지 않는 법! 내 몸값을 20% 이상 점프시키는 구체적인 대화 스크립트와 타이밍.",
 category: "연봉",
 level: "중급",
 },
 {
 slug: "salary-guide-2026",
 title: "2026년 연봉 실수령액표: 내 월급의 진실 💸",
 description:
 "연봉 1억이면 월 얼마? 2026년 최신 세율과 4대보험 요율을 완벽 반영한 구간별 실수령액 총정리!",
 category: "연봉",
 level: "초급",
 },
 {
 slug: "economic-freedom-fire",
 title: "경제적 자유(FIRE): 4%의 법칙 🔥",
 description: "얼마가 있어야 은퇴할까? 파이어족의 자산 인출 전략.",
 category: "기초",
 level: "고급",
 },
];

const formatYAxis = (tick: any) => {
 if (tick >= 100000000) return `${(tick / 100000000).toFixed(1)}억`;
 if (tick >= 10000) return `${Math.round(tick / 10000)}만`;
 return tick;
};

// Sub-component for rendering individual event inputs
const EventCard = ({ event, index, updateEvent, removeEvent, simulationYears }: {
 event: CareerEvent;
 index: number;
 updateEvent: (index: number, field: string, value: any) => void;
 removeEvent: (index: number) => void;
 simulationYears: number;
}) => {
 const EventIcon = eventIcons[event.type];
 const inputStyle = "w-full p-2 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary transition text-sm";

 const renderEventInputs = () => {
 switch (event.type) {
 case 'promotion':
 return <NumberStepper label="연봉 인상률" value={(event as PromotionEvent).salaryIncreasePercent} onValueChange={(v) => updateEvent(index, 'salaryIncreasePercent', v)} unit="%" />;
 case 'job_change':
 return <CurrencyInput label="새로운 연봉" value={(event as JobChangeEvent).newSalary.toLocaleString('ko-KR')} onValueChange={(v) => updateEvent(index, 'newSalary', Number(v.replace(/,/g, '')))} quickAmounts={[]} />;
 case 'education':
 return <div className="space-y-2">
 <NumberStepper label="기간" value={(event as EducationEvent).durationYears} onValueChange={(v) => updateEvent(index, 'durationYears', v)} unit="년" />
 <CurrencyInput label="기간 중 연소득" value={(event as EducationEvent).incomeDuringEvent.toLocaleString('ko-KR')} onValueChange={(v) => updateEvent(index, 'incomeDuringEvent', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
 <CurrencyInput label="연간 비용" value={(event as EducationEvent).costPerYear.toLocaleString('ko-KR')} onValueChange={(v) => updateEvent(index, 'costPerYear', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
 </div>;
 case 'side_project':
 return <div className="space-y-2">
 <CurrencyInput label="초기 연 수입" value={(event as SideProjectEvent).initialAnnualIncome.toLocaleString('ko-KR')} onValueChange={(v) => updateEvent(index, 'initialAnnualIncome', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
 <NumberStepper label="연간 성장률" value={(event as SideProjectEvent).growthRatePercent} onValueChange={(v) => updateEvent(index, 'growthRatePercent', v)} unit="%" />
 </div>;
 default:
 return null;
 }
 }

 return (
 <div className="p-4 bg-secondary/50 rounded-lg border border-border space-y-3">
 <div className="flex justify-between items-center">
 <div className="flex items-center gap-2">
 <EventIcon className="w-5 h-5 text-primary" />
 <h3 className="font-bold">이벤트 {index + 1}</h3>
 </div>
 <button onClick={() => removeEvent(index)} className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-destructive/10"><X size={16} /></button>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <select value={event.year} onChange={(e) => updateEvent(index, "year", Number(e.target.value))} className={inputStyle}>
 {Array.from({ length: simulationYears }, (_, i) => <option key={i} value={i}>{i + 1}년차</option>)}
 </select>
 <select value={event.type} onChange={(e) => updateEvent(index, "type", e.target.value)} className={inputStyle}>
 {Object.keys(eventIcons).map(type => <option key={type} value={type}>{eventTypeNames[type as CareerEventType]}</option>)}
 </select>
 </div>
 <div>{renderEventInputs()}</div>
 </div>
 );
}

export default function CareerPlannerPage() {
 const [inputs, setInputs] = useState<CareerSimulationInput>({
 currentAge: 30,
 simulationYears: 15,
 initialSalary: 60000000,
 initialAssets: 50000000,
 baseSalaryIncreasePercent: 5,
 inflationPercent: 3,
 investmentReturnPercent: 8,
 events: [],
 });

 const [results, setResults] = useState<SimulationYearOutput[]>([]);

 const handleInputChange = (field: keyof CareerSimulationInput, value: any) => {
 setInputs((prev) => ({ ...prev, [field]: value }));
 };

 const addEvent = () => {
 const newEvent: PromotionEvent = {
 year: inputs.events.length < inputs.simulationYears ? inputs.events.length : 0,
 type: "promotion",
 description: "승진",
 salaryIncreasePercent: 15,
 };
 if (inputs.events.length >= inputs.simulationYears) {
 alert("더 이상 이벤트를 추가할 수 없습니다.");
 return;
 }
 setInputs(prev => ({ ...prev, events: [...prev.events, newEvent] }));
 };

 const removeEvent = (index: number) => {
 setInputs(prev => ({ ...prev, events: prev.events.filter((_, i) => i !== index) }));
 };

 const updateEvent = (index: number, field: string, value: any) => {
 const newEvents = [...inputs.events];
 let eventToUpdate = { ...newEvents[index] };

 if (field === 'type') {
 const newType = value as CareerEventType;
 const year = eventToUpdate.year;
 
 switch (newType) {
 case 'promotion':
 eventToUpdate = { year, type: 'promotion', description: '승진', salaryIncreasePercent: 15 };
 break;
 case 'job_change':
 eventToUpdate = { year, type: 'job_change', description: '이직', newSalary: Math.round(inputs.initialSalary * 1.2) };
 break;
 case 'education':
 eventToUpdate = { year, type: 'education', description: '학위/휴직', durationYears: 1, incomeDuringEvent: 0, costPerYear: 20000000 };
 break;
 case 'side_project':
 eventToUpdate = { year, type: 'side_project', description: '사이드 프로젝트', initialAnnualIncome: 10000000, growthRatePercent: 20 };
 break;
 }
 } else {
 (eventToUpdate as any)[field] = value;
 }

 newEvents[index] = eventToUpdate;
 setInputs(prev => ({ ...prev, events: newEvents }));
 };

 const handleRunSimulation = () => {
 const simulationResults = runCareerSimulation(inputs);
 setResults(simulationResults);
 };

 return (
 <main className="w-full page-width py-12 sm:py-16">
 <div className="text-center mb-12">
 <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">커리어 패스 시뮬레이터</h1>
 <p className="mt-6 text-lg leading-8 text-muted-foreground">당신의 커리어 여정을 직접 설계하고, 재무 목표 달성 가능성을 확인해보세요.</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <div className="lg:col-span-1 space-y-6">
 <div className="bg-card p-6 rounded-xl border border-border">
 <h2 className="text-xl font-bold mb-4">기본 정보</h2>
 <div className="space-y-4">
 <NumberStepper label="현재 나이" value={inputs.currentAge} onValueChange={(v) => handleInputChange('currentAge', v)} unit="세" min={18} />
 <CurrencyInput label="초기 연봉" value={inputs.initialSalary.toLocaleString('ko-KR')} onValueChange={(v) => handleInputChange('initialSalary', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
 <CurrencyInput label="초기 자산" value={inputs.initialAssets.toLocaleString('ko-KR')} onValueChange={(v) => handleInputChange('initialAssets', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
 <NumberStepper label="시뮬레이션 기간" value={inputs.simulationYears} onValueChange={(v) => handleInputChange('simulationYears', v)} unit="년" min={1} max={40} />
 </div>
 </div>

 <div className="bg-card p-6 rounded-xl border border-border">
 <h2 className="text-xl font-bold mb-4">전역 설정 (%)</h2>
 <div className="space-y-4">
 <NumberStepper label="기본 연봉 인상률" value={inputs.baseSalaryIncreasePercent} onValueChange={(v) => handleInputChange('baseSalaryIncreasePercent', v)} unit="%" />
 <NumberStepper label="연평균 물가 상승률" value={inputs.inflationPercent} onValueChange={(v) => handleInputChange('inflationPercent', v)} unit="%" />
 <NumberStepper label="연평균 투자 수익률" value={inputs.investmentReturnPercent} onValueChange={(v) => handleInputChange('investmentReturnPercent', v)} unit="%" />
 </div>
 </div>

 <div className="bg-card p-6 rounded-xl border border-border">
 <h2 className="text-xl font-bold mb-4">커리어 이벤트</h2>
 <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2">
 {inputs.events.map((event, index) => (
 <EventCard key={index} event={event} index={index} updateEvent={updateEvent} removeEvent={removeEvent} simulationYears={inputs.simulationYears} />
 ))}
 </div>
 <button onClick={addEvent} className="w-full mt-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition flex items-center justify-center gap-2">
 <Plus size={16} /> 이벤트 추가
 </button>
 </div>
 </div>

 <div className="lg:col-span-2">
 <div className="sticky top-24 space-y-6">
 <div className="bg-card p-6 rounded-xl border border-border min-h-[600px]">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-2xl font-bold">시뮬레이션 결과</h2>
 <button onClick={handleRunSimulation} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:brightness-95 transition-all">
 결과 보기
 </button>
 </div>
 
 <DynamicCareerVisuals results={results} />
 </div>
 </div>
 </div>
 </div>

 {/* ── 활용법 + FAQ + cross-link — thin content·막다른 페이지 해소 ── */}
 <JsonLd data={faqLd(PLANNER_FAQ)} />

 <section className="mt-20 max-w-3xl mx-auto">
 <h2 className="text-2xl font-bold mb-4">커리어 시뮬레이션 활용법</h2>
 <div className="space-y-4 text-muted-foreground leading-relaxed">
 <p>
 커리어 패스 시뮬레이터는 단순히 &ldquo;연봉이 얼마나 오를까&rdquo;를 넘어,
 커리어 선택이 장기 자산에 미치는 영향을 숫자로 보여주는 도구입니다. 현재
 나이·연봉·자산과 기본 인상률을 입력한 뒤, 예상되는 승진·이직 시점을
 이벤트로 추가하면 연도별 소득과 순자산 곡선이 그려집니다. 같은 조건에서
 이벤트만 바꿔가며 여러 시나리오를 비교해 보는 것이 핵심 활용법입니다.
 </p>
 <p>
 예를 들어 &ldquo;3년차에 연봉 20% 점프 이직&rdquo;과 &ldquo;매년 5%
 인상 + 7년차 승진&rdquo; 두 시나리오를 각각 돌려보면, 단기 연봉은
 이직이 앞서더라도 투자 수익률과 저축 습관에 따라 10년 뒤 순자산은
 달라질 수 있다는 것을 확인할 수 있습니다. 대학원 진학이나 휴직처럼
 소득이 줄어드는 구간도 학위/휴직 이벤트로 반영해 기회비용을 미리
 가늠해 보세요.
 </p>
 <p>
 시뮬레이션 결과는 입력한 가정에 따라 달라지는 참고용 추정치입니다. 세금·
 4대보험이 정확히 반영된 실수령액은 홈의 연봉 계산기에서, 은퇴 시점
 설계는 FIRE 계산기에서 이어서 확인하면 계획의 정밀도를 높일 수
 있습니다.
 </p>
 </div>
 </section>

 <section className="mt-12 max-w-3xl mx-auto">
 <h2 className="text-2xl font-bold mb-4">자주 묻는 질문</h2>
 <div className="space-y-3">
 {PLANNER_FAQ.map((item) => (
 <details
 key={item.question}
 className="group p-5 bg-card rounded-xl border border-border"
 >
 <summary className="cursor-pointer text-sm font-bold">
 {item.question}
 </summary>
 <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
 {item.answer}
 </p>
 </details>
 ))}
 </div>
 </section>

 <div className="max-w-3xl mx-auto">
 <RelatedCalculators
 currentPath="/pro/career-planner"
 title="시뮬레이션 다음 단계 계산기"
 />
 <RelatedGuides
 items={PLANNER_RELATED_GUIDES}
 title="커리어 설계에 도움 되는 가이드"
 />
 </div>

 <PageFooterAds maxWidth="5xl" />
 </main>
 );
}