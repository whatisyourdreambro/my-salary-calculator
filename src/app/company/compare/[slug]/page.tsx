
if (!companyA || !companyB) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">비교할 기업을 찾을 수 없습니다.</h1>
                <Link href="/company/compare" className="text-primary hover:underline">
                    다시 선택하기
                </Link>
            </div>
        </div>
    );
}

// Normalize data for Radar Chart (0-100 scale)
const maxSalary = Math.max(companyA.averageSalary, companyB.averageSalary, 15000);
const maxEntry = Math.max(companyA.entryLevelSalary, companyB.entryLevelSalary, 6000);
const maxExec = Math.max(companyA.executiveSalary, companyB.executiveSalary, 100000);

const radarData = [
    {
        subject: "평균 연봉",
        A: (companyA.averageSalary / maxSalary) * 100,
        B: (companyB.averageSalary / maxSalary) * 100,
        fullMark: 100,
    },
    {
        subject: "신입 초봉",
        A: (companyA.entryLevelSalary / maxEntry) * 100,
        B: (companyB.entryLevelSalary / maxEntry) * 100,
        fullMark: 100,
    },
    {
        subject: "임원 연봉",
        A: (companyA.executiveSalary / maxExec) * 100,
        B: (companyB.executiveSalary / maxExec) * 100,
        fullMark: 100,
    },
    {
        subject: "직원 수",
        A: Math.min((companyA.employees / 100000) * 100, 100),
        B: Math.min((companyB.employees / 100000) * 100, 100),
        fullMark: 100,
    },
    {
        subject: "성장성", // Mock metric based on salary growth slope
        A: 85,
        B: 90,
        fullMark: 100,
    },
];

const winner = companyA.averageSalary > companyB.averageSalary ? companyA : companyB;

return (
    <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/company/compare" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                다른 기업 비교하기
            </Link>

            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-black mb-2">
                    {companyA.name} <span className="text-muted-foreground text-2xl align-middle mx-2">VS</span> {companyB.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                    세기의 대결, 승자는 누구일까요?
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Company A */}
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center">
                    <div className={`w-24 h-24 mx-auto rounded-2xl ${companyA.logo} flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4`}>
                        {companyA.name[0]}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{companyA.name}</h2>
                    <div className="space-y-4 mt-6">
                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="text-sm text-muted-foreground mb-1">평균 연봉</div>
                            <div className="text-2xl font-bold">{companyA.averageSalary.toLocaleString()}만원</div>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="text-sm text-muted-foreground mb-1">신입 초봉</div>
                            <div className="text-2xl font-bold text-emerald-500">{companyA.entryLevelSalary.toLocaleString()}만원</div>
                        </div>
                    </div>
                </div>

                {/* Center: Radar Chart & Winner */}
                <div className="space-y-8">
                    <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[400px]">
                        <h3 className="text-lg font-bold mb-4 text-muted-foreground">종합 능력치 비교</h3>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name={companyA.name}
                                        dataKey="A"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    />
                                    <Radar
                                        name={companyB.name}
                                        dataKey="B"
                                        stroke="#ef4444"
                                        fill="#ef4444"
                                        fillOpacity={0.3}
                                    />
                                    <Legend />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Winner Badge */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/50 rounded-3xl p-6 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-yellow-500/10 blur-xl" />
                        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                        <h3 className="text-lg font-bold text-yellow-500 mb-1">연봉 킹</h3>
                        <div className="text-2xl font-black">{winner.name}</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            평균 연봉이 더 높습니다.
                        </p>
                    </motion.div>
                </div>

                {/* Right: Company B */}
                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center">
                    <div className={`w-24 h-24 mx-auto rounded-2xl ${companyB.logo} flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4`}>
                        {companyB.name[0]}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{companyB.name}</h2>
                    <div className="space-y-4 mt-6">
                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="text-sm text-muted-foreground mb-1">평균 연봉</div>
                            <div className="text-2xl font-bold">{companyB.averageSalary.toLocaleString()}만원</div>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-xl">
                            <div className="text-sm text-muted-foreground mb-1">신입 초봉</div>
                            <div className="text-2xl font-bold text-emerald-500">{companyB.entryLevelSalary.toLocaleString()}만원</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ad Slot */}
            <div className="mt-12">
                <AdUnit
                    slotId="5566778899"
                    format="auto"
                    responsive={true}
                    label="Comparison Bottom"
                />
            </div>
        </div>
    </div>
);
}
