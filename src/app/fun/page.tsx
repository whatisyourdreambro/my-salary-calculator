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
 Gift,
 LayoutGrid,
 Zap,
 Swords,
 Receipt,
 DoorOpen,
 Gem,
 ShoppingBag,
 Dices,
 Star,
 TrendingUp,
 BarChart3,
 ScrollText,
 Building2
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
 title: '직장인 심심풀이 라이브러리 | 머니샐러리 FUN',
 description: '부자 DNA, IQ 테스트, 연봉 랭킹, 플래피 샐러리맨 등 직장인을 위한 모든 재미있는 테스트와 게임을 모았습니다.',
 path: '/fun',
 keywords: ['직장인 심리테스트', '직장인 게임', '연봉 테스트', '무료 심심풀이'],
});

const FunCard = ({
 icon: Icon,
 title,
 description,
 href,
 featured = false,
 badge
}: {
 icon: any;
 title: string;
 description: string;
 href: string;
 color?: string;
 featured?: boolean;
 badge?: string;
}) => (
 <Link
 href={href}
 className={`group duotone-card relative overflow-hidden block h-full hover:-translate-y-1 transition-transform duration-200 ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
 >
 {/* 호버 그라데이션 (Electric Blue 통일) */}
 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-electric/5 via-transparent to-transparent pointer-events-none" />

 <div className={`relative z-10 flex flex-col h-full ${featured ? 'p-7 sm:p-9' : 'p-5 sm:p-6'}`}>
 <div className="flex items-start justify-between mb-5">
 <div className={`${featured ? 'w-16 h-16' : 'w-12 h-12'} rounded-[18px] bg-electric-5 border border-electric/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-electric-10 transition-all duration-300`}>
 <Icon className={`${featured ? 'w-8 h-8' : 'w-6 h-6'} text-electric transition-colors duration-300`} />
 </div>
 {badge && (
 <span className="px-3 py-1 rounded-full text-xs font-black bg-electric-10 text-electric border border-electric/20">
 {badge}
 </span>
 )}
 </div>

 <h3 className={`${featured ? 'text-2xl' : 'text-lg'} font-bold text-navy mb-2 tracking-tight group-hover:text-electric transition-colors duration-200`}>
 {title}
 </h3>
 <p className={`text-faint-blue leading-relaxed ${featured ? 'text-base' : 'text-sm'} font-medium`}>
 {description}
 </p>

 <div className="mt-auto pt-5 flex items-center text-sm font-bold text-faint-blue group-hover:text-electric transition-colors duration-200">
 시작하기 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
 </div>
 </div>
 </Link>
);

export default function FunLabPage() {
 return (
 <main className="min-h-screen bg-canvas pt-28 pb-20 px-4">
 <div className="max-w-7xl mx-auto">
 {/* Hero 헤더 */}
 <div className="text-center mb-16">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 border border-electric/20 text-electric font-bold text-sm mb-6">
 <Zap className="w-4 h-4" />
 직장인 심심풀이 라이브러리
 </div>
 <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-navy mb-5 tracking-tight">
 FUN <span className="text-electric">LAB</span>
 </h1>
 <p className="text-faint-blue text-lg md:text-xl max-w-2xl mx-auto font-medium">
 당신의 직장 생활을 더 즐겁게.<br />
 잠시 쉬어가며 부자 DNA를 깨워보세요.
 </p>
 </div>



 {/* 테스트 & 계산 섹션 */}
 <div className="mb-14">
 <h2 className="text-2xl font-black text-navy mb-6 flex items-center gap-2">
 <Brain className="w-6 h-6 text-electric" /> 테스트 & 계산
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
 <FunCard icon={Dna} title="부자 DNA 테스트" description="당신에게 숨겨진 부자의 본능은 몇 점일까요? 7가지 정밀 질문으로 분석합니다." href="/fun/rich-dna-test" color="text-primary" featured={true} badge="POPULAR" />
 <FunCard icon={Brain} title="IQ 테스트" description="상위 1%에 도전하세요. 멘사급 논리력 퀴즈 15문항." href="/fun/iq-test" color="text-primary" badge="NEW" />
 <FunCard icon={Target} title="소비 성향 테스트" description="나는 욜로족일까 짠돌이일까? 소비 습관 정밀 진단." href="/fun/spending-test" color="text-primary" />
 <FunCard icon={Wallet} title="금융 MBTI (F-MBTI)" description="나의 금융 성격 유형은? 16가지 유형으로 분석." href="/fun/financial-mbti" color="text-primary" />
 <FunCard icon={TrendingUp} title="MBTI 연봉 분석" description="MBTI 유형별 인생 연봉 그래프는? 16가지 유형별 분석." href="/mbti-salary" color="text-primary" />
 <FunCard icon={Ghost} title="환생 테스트" description="다음 생에는 재벌 3세? 아니면 노예? AI 환생 시뮬레이션." href="/fun/reincarnation" color="text-primary" />
 <FunCard icon={BarChart3} title="연봉 분포 시뮬레이터" description="내 연봉은 분포 곡선 어디쯤? 간단 버전 백분위 시뮬레이션." href="/fun/rank" color="text-primary" />
 <FunCard icon={Trophy} title="내 연봉 순위 계산기" description="대한민국 연봉 분포에서 내 위치를 확인하고 어워드를 발급받으세요." href="/fun/salary-rank" color="text-primary" />
 <FunCard icon={Receipt} title="가상 급여명세서" description="꿈의 연봉을 입력하면 실제 양식의 급여명세서로 만들어드립니다." href="/fun/salary-slip" color="text-primary" />
 <FunCard icon={DoorOpen} title="노비 탈출 계산기" description="경제적 자유(FIRE)까지 남은 시간은? 회사 탈출 계획 세우기." href="/fun/escape-plan" color="text-primary" />
 <FunCard icon={ShoppingBag} title="플렉스 계산기" description="이 예산으로 뭘 살 수 있을까? 치킨부터 빌딩까지." href="/fun/what-to-buy" color="text-primary" />
 </div>
 </div>

 {/* 게임 섹션 */}
 <div className="mb-14">
 <h2 className="text-2xl font-black text-navy mb-6 flex items-center gap-2">
 <Gamepad2 className="w-6 h-6 text-electric" /> 게임
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
 <FunCard icon={Gamepad2} title="플래피 샐러리맨" description="야근을 피해 퇴근하세요! 극악 난이도의 비행 게임." href="/fun/flappy" color="text-electric" />
 <FunCard icon={LayoutGrid} title="샐러리맨 테트리스" description="업무가 쌓이기 전에 처리하세요. 추억의 테트리스." href="/fun/tetris" color="text-primary" />
 <FunCard icon={Coins} title="밈코인 모의투자" description="도지, 시바... -99%의 공포를 미리 체험해보세요." href="/fun/meme-coin" color="text-primary" />
 <FunCard icon={Gem} title="자산 배분 게임" description="떨어지는 금·다이아를 잡고 폭탄을 피하는 60초 미니게임." href="/fun/asset-allocator" color="text-primary" />
 <FunCard icon={Swords} title="연봉 배틀" description="우리 회사 vs 저 회사, 연봉·복지·워라밸 실전 비교 배틀." href="/fun/salary-battle" color="text-primary" />
 <FunCard icon={Building2} title="기업 이상형 월드컵" description="16강 토너먼트로 찾는 나의 꿈의 직장은 어디?" href="/fun/worldcup" color="text-primary" />
 <FunCard icon={Dices} title="랜덤 추첨 마블 레이스" description="공정하고 스릴 넘치는 3D 구슬 레이스 추첨 게임." href="/fun/random-draw" color="text-primary" />
 <FunCard icon={Gift} title="주말 당직 룰렛" description="공정한 당직 정하기. 쫄깃한 복불복 게임." href="/fun/weekend-duty" color="text-primary" />
 <FunCard icon={Utensils} title="점심 메뉴 룰렛" description="결정 장애 해결! 오늘 점심 뭐 먹지 고민 끝." href="/fun/lunch-roulette" color="text-primary" />
 <FunCard icon={Sparkles} title="로또 시뮬레이터" description="10억 당첨될 때까지 얼마나 걸릴까? 인생역전 도전." href="/lotto" color="text-primary" badge="HOT" />
 </div>
 </div>

 {/* 운세 섹션 */}
 <div>
 <h2 className="text-2xl font-black text-navy mb-6 flex items-center gap-2">
 <Star className="w-6 h-6 text-electric" /> 운세
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
 <FunCard icon={ScrollText} title="2026 신년운세" description="병오년 붉은 말의 해, 생년월일로 보는 나의 한 해 운세." href="/fun/fortune" color="text-primary" />
 <FunCard icon={Star} title="직장인 재물운·연봉운" description="띠와 오행으로 풀어보는 2026년 재물운과 커리어운." href="/fortune-2026" color="text-primary" />
 </div>
 </div>
 </div>
 </main>
 );
}
