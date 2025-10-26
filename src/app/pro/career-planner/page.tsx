// src/app/pro/career-planner/page.tsx
"use client";

import { useState } from "react";
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
import { Plus, X, BrainCircuit, TrendingUp, Briefcase, GraduationCap } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

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
                return <CurrencyInput label="새로운 연봉" value={(event as JobChangeEvent).newSalary.toLocaleString()} onValueChange={(v) => updateEvent(index, 'newSalary', Number(v.replace(/,/g, '')))} quickAmounts={[]} />;
            case 'education':
                return <div className="space-y-2">
                    <NumberStepper label="기간" value={(event as EducationEvent).durationYears} onValueChange={(v) => updateEvent(index, 'durationYears', v)} unit="년" />
                    <CurrencyInput label="기간 중 연소득" value={(event as EducationEvent).incomeDuringEvent.toLocaleString()} onValueChange={(v) => updateEvent(index, 'incomeDuringEvent', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
                    <CurrencyInput label="연간 비용" value={(event as EducationEvent).costPerYear.toLocaleString()} onValueChange={(v) => updateEvent(index, 'costPerYear', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
                </div>;
            case 'side_project':
                return <div className="space-y-2">
                    <CurrencyInput label="초기 연 수입" value={(event as SideProjectEvent).initialAnnualIncome.toLocaleString()} onValueChange={(v) => updateEvent(index, 'initialAnnualIncome', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
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
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
              <CurrencyInput label="초기 연봉" value={inputs.initialSalary.toLocaleString()} onValueChange={(v) => handleInputChange('initialSalary', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
              <CurrencyInput label="초기 자산" value={inputs.initialAssets.toLocaleString()} onValueChange={(v) => handleInputChange('initialAssets', Number(v.replace(/,/g, '')))} quickAmounts={[]} />
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
              
              {results.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-border rounded-xl min-h-[600px] flex items-center justify-center">
                  <p className="text-muted-foreground">입력값을 설정하고 '결과 보기'를 눌러주세요. 📊</p>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in-up">
                  <div>
                    <h3 className="text-lg font-bold mb-2">순자산 성장 추이</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={results}>
                        <defs>
                          <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="age" label={{ value: "나이", position: "insideBottom", offset: -5 }} fontSize={12} />
                        <YAxis tickFormatter={formatYAxis} fontSize={12} />
                        <Tooltip formatter={(value: number) => [value.toLocaleString() + '원', '순자산']} />
                        <Area type="monotone" dataKey="netWorth" strokeWidth={2} stroke="hsl(var(--primary))" fill="url(#colorNetWorth)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2">연봉 및 총 수입 변화</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={results}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="age" label={{ value: "나이", position: "insideBottom", offset: -5 }} fontSize={12} />
                        <YAxis tickFormatter={formatYAxis} fontSize={12} />
                        <Tooltip formatter={(value: number) => value.toLocaleString() + '원'} />
                        <Legend />
                        <Line type="monotone" dataKey="salary" name="연봉" strokeWidth={2} stroke="hsl(var(--primary))" />
                        <Line type="monotone" dataKey="sideIncome" name="부수입" strokeWidth={2} stroke="hsl(var(--accent))" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="totalIncome" name="총 수입" strokeWidth={2} stroke="hsl(var(--secondary-foreground))" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}