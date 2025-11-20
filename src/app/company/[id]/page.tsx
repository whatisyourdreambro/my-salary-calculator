return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">기업을 찾을 수 없습니다.</h1>
            <Link href="/company" className="text-primary hover:underline">
                목록으로 돌아가기
            </Link>
        </div>
    </div>
);
    }

return (
    <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <Link href="/company" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                기업 목록으로
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Building2 className="w-32 h-32" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-20 h-20 rounded-2xl ${company.logo} flex items-center justify-center text-white font-bold text-3xl shadow-xl`}>
                                    {company.name[0]}
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black mb-2">{company.name}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span className="px-3 py-1 bg-secondary/50 rounded-full text-sm font-medium">
                                            {company.industry}
                                        </span>
                                        <span>•</span>
                                        <span>직원수 {company.employees.toLocaleString()}명</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                {company.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-6">
                                {company.tags.map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Salary Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card/30 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <TrendingUp className="w-4 h-4" />
                                신입 초봉
                            </div>
                            <div className="text-2xl font-bold text-emerald-500">
                                {company.entryLevelSalary.toLocaleString()}만원
                            </div>
                        </div>
                        <div className="bg-card/30 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Users className="w-4 h-4" />
                                평균 연봉
                            </div>
                            <div className="text-2xl font-bold">
                                {company.averageSalary.toLocaleString()}만원
                            </div>
                        </div>
                        <div className="bg-card/30 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <Wallet className="w-4 h-4" />
                                임원 평균
                            </div>
                            <div className="text-2xl font-bold text-purple-500">
                                {company.executiveSalary.toLocaleString()}만원
                            </div>
                        </div>
                    </div>

                    {/* Salary Growth Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6">연차별 예상 연봉 추이</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={company.salaryGrowth}>
                                    <defs>
                                        <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        tickFormatter={(value) => `${value}년차`}
                                        stroke="rgba(255,255,255,0.3)"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `${value / 10000}억`}
                                        stroke="rgba(255,255,255,0.3)"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
                                        formatter={(value: number) => [`${value.toLocaleString()}만원`, '연봉']}
                                        labelFormatter={(label) => `${label}년차`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="salary"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSalary)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                            * 위 데이터는 추정치이며 실제 연봉과 차이가 있을 수 있습니다.
                        </p>
                    </motion.div>

                    {/* Native Ad Slot */}
                    <AdUnit
                        slotId="9876543210"
                        format="fluid"
                        layoutKey="-fb+5w+4e-db+86"
                        label="In-Content Native"
                    />

                    {/* Benefits Section */}
                    <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                        <h2 className="text-2xl font-bold mb-6">주요 복지 혜택</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {company.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3 p-4 bg-secondary/20 rounded-xl border border-white/5">
                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span className="font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar & Ads */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Sticky Sidebar Ad */}
                    <div className="sticky top-24">
                        <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center mb-6">
                            <h3 className="font-bold mb-2">이 기업에 관심 있으신가요?</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                지금 바로 실수령액을 계산해보세요.
                            </p>
                            <Link
                                href="/"
                                className="block w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                실수령액 계산기 이동
                            </Link>
                        </div>

                        <AdUnit
                            slotId="1234567890"
                            format="auto"
                            responsive={true}
                            className="min-h-[600px]"
                            label="Sidebar Sticky"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}
