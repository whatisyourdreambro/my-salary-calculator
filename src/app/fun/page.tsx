import { Metadata } from 'next';
import Link from 'next/link';
import {
    Brain,
    Gamepad2,
    Coins,
    Sparkles,
    Trophy,
    Utensils,
    Ghost,
    Target,
    Dna,
    Wallet,
    ArrowRight,
    Calculator,
    Smile,
    Zap,
    Gift,
    LayoutGrid
} from 'lucide-react';

export const metadata: Metadata = {
    title: '직장인 심심풀이 라이브러리 | 머니샐러리 FUN',
    description: '부자 DNA, IQ 테스트, 연봉 랭킹, 플래피 샐러리맨 등 직장인을 위한 모든 재미있는 테스트와 게임을 모았습니다.',
    openGraph: {
        title: '직장인 심심풀이 라이브러리 | 머니샐러리 FUN',
        description: '오늘의 운세부터 MBTI 연봉 분석까지, 당신의 직장 생활을 즐겁게 만들어줄 모든 것.',
        type: 'website',
    },
};

const FunCard = ({
    icon: Icon,
    title,
    description,
    href,
    color,
    featured = false,
    badge
}: {
    icon: any;
    title: string;
    description: string;
    href: string;
    color: string;
    featured?: boolean;
    badge?: string;
}) => (
    <Link
        href={href}
        className={`group relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/40 backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:-translate-y-1 block h-full ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-${color}-500/10 via-transparent to-transparent`} />
        <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-500" />
        <div className={`absolute -top-20 -right-20 w-64 h-64 bg-${color}-500/5 rounded-full blur-[80px] group-hover:bg-${color}-500/10 transition-colors duration-700`} />

        <div className={`relative z-10 flex flex-col h-full ${featured ? 'p-10' : 'p-6'}`}>
            <div className="flex items-start justify-between mb-6">
                <div className={`
          ${featured ? 'w-16 h-16' : 'w-12 h-12'} 
          rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-center 
          group-hover:scale-110 group-hover:border-${color}-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] 
          transition-all duration-500
        `}>
                    <Icon className={`${featured ? 'w-8 h-8' : 'w-6 h-6'} text-zinc-400 group-hover:text-${color}-400 transition-colors duration-500`} />
                </div>
                {badge && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                        {badge}
                    </span>
                )}
            </div>

            <h3 className={`${featured ? 'text-3xl' : 'text-xl'} font-bold text-zinc-100 mb-3 group-hover:text-white transition-colors duration-300 tracking-tight`}>
                {title}
            </h3>
            <p className={`text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors duration-300 ${featured ? 'text-lg' : 'text-sm'}`}>
                {description}
            </p>

            <div className="mt-auto pt-6 flex items-center text-xs font-medium text-muted-foreground group-hover:text-white transition-colors duration-300">
                플레이하기 <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
        </div>
    </Link>
);

export default function FunLabPage() {
    return (
        <main className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 via-zinc-950/50 to-zinc-950 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                        FUN <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">LAB</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
                        당신의 직장 생활을 더 즐겁게.<br />
                        잠시 쉬어가며 부자 DNA를 깨워보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                    {/* Hero Items */}
                    <FunCard
                        icon={Dna}
                        title="부자 DNA 테스트"
                        description="당신에게 숨겨진 부자의 본능은 몇 점일까요? 7가지 정밀 질문으로 분석합니다."
                        href="/fun/rich-dna-test"
                        color="yellow"
                        featured={true}
                        badge="POPULAR"
                    />
                    <FunCard
                        icon={Brain}
                        title="IQ 테스트"
                        description="상위 1%에 도전하세요. 멘사급 논리력 퀴즈 15문항."
                        href="/fun/iq-test"
                        color="emerald"
                        badge="NEW"
                    />
                    <FunCard
                        icon={Gamepad2}
                        title="플래피 샐러리맨"
                        description="야근을 피해 퇴근하세요! 극악 난이도의 비행 게임."
                        href="/fun/flappy"
                        color="blue"
                    />

                    {/* Games */}
                    <FunCard
                        icon={Coins}
                        title="밈코인 모의투자"
                        description="도지, 시바... -99%의 공포를 미리 체험해보세요."
                        href="/fun/meme-coin"
                        color="orange"
                    />
                    <FunCard
                        icon={LayoutGrid}
                        title="샐러리맨 테트리스"
                        description="업무가 쌓이기 전에 처리하세요. 추억의 벽돌깨기."
                        href="/fun/tetris"
                        color="purple"
                    />

                    {/* Tests & Simulations */}
                    <FunCard
                        icon={Trophy}
                        title="연봉/자산 랭킹"
                        description="내 연봉은 대한민국 상위 몇 %일까요? 실시간 데이터 비교."
                        href="/fun/rank"
                        color="red"
                    />
                    <FunCard
                        icon={Target}
                        title="소비 성향 테스트"
                        description="나는 욜로족일까 짠돌이일까? 소비 습관 정밀 진단."
                        href="/fun/spending-test"
                        color="pink"
                    />
                    <FunCard
                        icon={Ghost}
                        title="환생 테스트"
                        description="다음 생에는 재벌 3세? 아니면... 노예? AI 환생 시뮬레이션."
                        href="/fun/reincarnation"
                        color="indigo"
                    />

                    {/* Utilities */}
                    <FunCard
                        icon={Utensils}
                        title="점심 메뉴 룰렛"
                        description="결정 장애 해결! 오늘 점심 뭐 먹지 고민 끝."
                        href="/fun/lunch-roulette"
                        color="green"
                    />
                    <FunCard
                        icon={Sparkles}
                        title="로또 시뮬레이터"
                        description="10억 당첨될 때까지 얼마나 걸릴까? 인생역전 도전."
                        href="/lotto"
                        color="yellow"
                        badge="HOT"
                    />
                    <FunCard
                        icon={Gift}
                        title="주말 당직 룰렛"
                        description="공정한 당직 정하기. 쫄깃한 복불복 게임."
                        href="/fun/weekend-duty"
                        color="teal"
                    />
                    <FunCard
                        icon={Wallet}
                        title="금융 MBTI (F-MBTI)"
                        description="나의 금융 성격 유형은? 16가지 유형으로 분석."
                        href="/fun/financial-mbti"
                        color="cyan"
                    />
                </div>
            </div>
        </main>
    );
}


