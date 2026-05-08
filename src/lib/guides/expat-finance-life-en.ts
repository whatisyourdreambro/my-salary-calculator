// src/lib/guides/expat-finance-life-en.ts
// 6 more English guides — Finance, Life, Career topics for expats in Korea.

export const expatFinanceLifeGuidesEn = [
 {
 slug: "korea-banking-for-foreigners",
 title: "Banking in Korea for Foreigners — Open an Account, Transfer Money",
 description: "Best banks for foreigners · Account opening process · International transfer · Forex remittance.",
 category: "Basics",
 tags: ["Korea Banking", "Bank Account", "Forex"],
 level: "Beginner" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Opening a Korean bank account is essential for working in Korea — your salary, tax refunds, and most online services require it. This guide covers the best banks for foreigners and how to handle international transfers.</p>

<h2>📌 Best Banks for Foreigners</h2>
<ul>
<li><strong>KB Kookmin Bank</strong>: Largest network, English app, easy ATM access</li>
<li><strong>Shinhan Bank</strong>: Foreigner-friendly, English customer service</li>
<li><strong>Hana Bank</strong>: Best for SWIFT transfers, multi-currency accounts</li>
<li><strong>Woori Bank</strong>: Wide branch network, decent English support</li>
<li><strong>Kakao Bank / Toss Bank</strong>: Mobile-only, fast transfers but limited foreigner features</li>
</ul>

<h2>🚀 How to Open an Account</h2>
<ol>
<li>Visit a branch with: <strong>Alien Registration Card (ARC), Passport, Phone number</strong></li>
<li>Fill out account opening form (English forms available)</li>
<li>Receive debit card on the spot (or 5~7 days for premium cards)</li>
<li>Activate online banking with security card or USB OTP token</li>
<li>Set up English mobile app</li>
</ol>

<h2>💸 International Transfers</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>Sending Money Out of Korea</h3>
<ul>
<li><strong>Toss Bank</strong>: 0~0.5% fee, fast (24h)</li>
<li><strong>Wise</strong>: 0.4~1% fee, transparent rates (need foreigner registration)</li>
<li><strong>Bank wire (SWIFT)</strong>: 30,000~40,000 KRW + 1~2% spread, 2~5 days</li>
<li><strong>Limit</strong>: USD 50,000 per year without documentation; over needs proof of source</li>
</ul>

<h3>Receiving from Abroad</h3>
<ul>
<li>Provide your Korean account number + bank SWIFT code</li>
<li>Receiving fee: 5,000~20,000 KRW (waived at some banks for accounts)</li>
<li>Currency exchange: spread typically 1~2% from interbank rate</li>
</ul>
</div>

<h2>🚨 Things to Know</h2>
<ul>
<li><strong>One-time PIN (OTP)</strong> required for most online transactions over 1M KRW</li>
<li><strong>Real-name verification</strong> mandatory by law — passport + ARC required</li>
<li><strong>Tax reporting</strong>: Korean banks report to NTS (tax authority) annually</li>
<li><strong>USD account</strong> available at most major banks for FX management</li>
</ul>

<h2>📝 Conclusion</h2>
<p>Open your account with a major bank like Shinhan or KB during your first week in Korea. For international transfers, use Wise or Toss for cost efficiency. Calculate FX gains: <a href="/en">Currency Calculator</a>.</p>
`.trim(),
 },
 {
 slug: "korea-investing-for-foreigners",
 title: "Investing in Korea: Stocks, ETFs, and Tax for Foreigners",
 description: "How to open a brokerage account · Korean stocks (KOSPI) · US stocks via Korean broker · Tax on gains.",
 category: "Investing",
 tags: ["Korea Investing", "KOSPI", "Foreign Investor"],
 level: "Intermediate" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Foreigners with Alien Registration Card (ARC) can invest in Korean and overseas stocks through Korean brokerages. Korea has favorable tax treatment for foreign retail investors.</p>

<h2>📌 Top Korean Brokerages for Foreigners</h2>
<ul>
<li><strong>Mirae Asset Securities</strong>: Largest, robust English support</li>
<li><strong>Samsung Securities</strong>: Strong in research</li>
<li><strong>NH Investment</strong>: Wide network</li>
<li><strong>Kiwoom Securities</strong>: Most popular online (mobile-first)</li>
<li><strong>KB Securities</strong>: Tied to KB Bank for easy linking</li>
</ul>

<h2>🚀 Account Opening</h2>
<ol>
<li>Visit branch with ARC + Passport + Korean bank account</li>
<li>Sign trading agreement (Korean / English available)</li>
<li>Pass risk-tolerance assessment</li>
<li>Activate trading via Mobile MTS (HTS for desktop)</li>
<li>Transfer KRW from your bank → start trading</li>
</ol>

<h2>💰 Tax on Investment Gains</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>Korean Stocks (KOSPI / KOSDAQ)</h3>
<ul>
<li><strong>Capital gains</strong>: Tax-free for retail (<1% ownership of single stock)</li>
<li><strong>Dividends</strong>: 14% withholding (15.4% total with local tax)</li>
<li><strong>Securities transaction tax</strong>: 0.18% (sale only, automatic)</li>
</ul>

<h3>Overseas Stocks (US, etc.)</h3>
<ul>
<li><strong>Capital gains</strong>: 22% on annual gain over 2.5M KRW (basic deduction)</li>
<li><strong>Filing</strong>: May 31 (Comprehensive Income Tax)</li>
<li><strong>Dividends</strong>: Withholding by source country (US 15%) + Korea (14%)</li>
</ul>
</div>

<h2>🚀 ISA Account — Tax-Free Wrapper</h2>
<p>Individual Savings Account (ISA) — tax-favored:</p>
<ul>
<li>Annual contribution limit: 20M KRW</li>
<li>Tax-free up to 2M KRW (general) / 4M KRW (low-income) on profits</li>
<li>Excess profits taxed at separate 9.9%</li>
<li>5-year holding required</li>
</ul>

<h2>📝 Conclusion</h2>
<p>Korean retail investing is highly tax-friendly for foreigners. Open an account with Mirae Asset or Kiwoom, use ISA for tax shelter, and consider both Korean and US stocks. Calculate stock taxes: <a href="/tools/finance/stock-tax">Stock Tax Calculator</a>.</p>
`.trim(),
 },
 {
 slug: "korea-cost-of-living-2026",
 title: "Cost of Living in Korea 2026 — Seoul vs Other Cities",
 description: "Monthly budget for expats · Rent · Food · Transport · Healthcare · Comparison: Seoul vs Busan vs Daejeon.",
 category: "Basics",
 tags: ["Cost of Living", "Korea Budget", "Seoul"],
 level: "Beginner" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Korea's cost of living varies significantly by city. Seoul is the most expensive, but still cheaper than New York, London, or Tokyo. This guide breaks down typical monthly expenses for expats.</p>

<h2>📊 Monthly Budget Comparison (1-Person Expat)</h2>
<table class="my-4">
<thead><tr><th>Category</th><th>Seoul</th><th>Busan</th><th>Daejeon</th></tr></thead>
<tbody>
<tr><td>Rent (1BR)</td><td>800K~1.2M</td><td>500K~700K</td><td>400K~600K</td></tr>
<tr><td>Food (groceries)</td><td>400K~600K</td><td>350K~500K</td><td>300K~450K</td></tr>
<tr><td>Eating out</td><td>200K~400K</td><td>150K~300K</td><td>120K~250K</td></tr>
<tr><td>Transport</td><td>100K~150K</td><td>80K~120K</td><td>70K~100K</td></tr>
<tr><td>Utilities</td><td>100K~150K</td><td>80K~120K</td><td>80K~120K</td></tr>
<tr><td>Internet/Phone</td><td>50K~80K</td><td>50K~80K</td><td>50K~80K</td></tr>
<tr><td><strong>Total</strong></td><td><strong>1.65M~2.5M</strong></td><td><strong>1.21M~1.82M</strong></td><td><strong>1.02M~1.6M</strong></td></tr>
</tbody>
</table>

<h2>🏠 Housing Deep-Dive</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>Seoul Districts (Officetel/Studio Rent)</h3>
<ul>
<li><strong>Gangnam, Yeoksam, Sinsa</strong>: 1.2M~2M+/month (premium)</li>
<li><strong>Itaewon, Hongdae</strong>: 800K~1.4M (foreigner-friendly)</li>
<li><strong>Jongno, Mapo</strong>: 700K~1.2M</li>
<li><strong>Outside Gangnam (e.g., Sungbuk, Eunpyeong)</strong>: 500K~800K</li>
</ul>

<h3>Foreigner Apartments (Serviced)</h3>
<ul>
<li>Pre-furnished, English-speaking landlords</li>
<li>Usually 30~50% more than local market</li>
<li>Best for first 3~6 months while you learn the system</li>
</ul>
</div>

<h2>🍽️ Food Costs</h2>
<ul>
<li><strong>Korean meal</strong>: 8K~15K (lunch), 15K~30K (dinner)</li>
<li><strong>Western/foreign meal</strong>: 15K~30K (lunch), 25K~50K (dinner)</li>
<li><strong>Coffee</strong>: 4.5K~6K (chain), 6K~10K (specialty)</li>
<li><strong>Grocery (week)</strong>: 80K~150K for 1 person</li>
<li><strong>Beer at bar</strong>: 5K~10K</li>
</ul>

<h2>🚇 Transport</h2>
<ul>
<li><strong>Subway/bus single fare</strong>: 1,400 KRW (free transfer within 30 min)</li>
<li><strong>Monthly transport pass</strong>: 65,000 KRW (Climate Card — Seoul)</li>
<li><strong>Taxi base fare</strong>: 4,800 KRW + 100/130m</li>
<li><strong>Kakao Taxi</strong>: 20~30% premium over street taxi</li>
<li><strong>KTX (Seoul → Busan)</strong>: 60K (KRW one way)</li>
</ul>

<h2>🏥 Healthcare</h2>
<p>Korea's NHIS coverage is excellent. With insurance, doctor visits cost 5~10K, prescriptions 5~15K, even surgery is heavily subsidized.</p>

<h2>📝 Conclusion</h2>
<p>A comfortable expat life in Seoul requires 2~2.5M KRW/month minimum. Other cities offer 30~40% savings. Use the <a href="/region/seoul/cost-of-living">Cost of Living Calculator</a> for detailed breakdown.</p>
`.trim(),
 },
 {
 slug: "korea-career-growth-foreigner",
 title: "Career Growth in Korea: A Foreigner's Playbook",
 description: "Job change strategy · Korean corporate culture · Salary negotiation · Switching from teaching to corporate.",
 category: "Career",
 tags: ["Korea Career", "Job Change", "Career Strategy"],
 level: "Intermediate" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Career growth in Korea as a foreigner has unique challenges and opportunities. This guide covers job changes, salary negotiations, and how to transition from common expat starter jobs (teaching) to higher-paying corporate roles.</p>

<h2>📌 Foreign-Friendly Job Markets in Korea</h2>
<ul>
<li><strong>IT / Tech</strong>: Naver, Kakao, Coupang, Toss actively hire foreigners (engineering, data)</li>
<li><strong>Multinationals</strong>: Google, Microsoft, Amazon, P&G — bilingual roles</li>
<li><strong>Financial Services</strong>: Goldman Sachs, JPMorgan, Citi (Korea offices)</li>
<li><strong>Marketing / Branding</strong>: Korean firms expanding globally need bilingual marketers</li>
<li><strong>Consulting</strong>: McKinsey, Bain, BCG, Deloitte — strong demand</li>
</ul>

<h2>🚀 Salary Progression</h2>
<table class="my-4">
<thead><tr><th>Stage</th><th>Typical Salary</th><th>How to Get There</th></tr></thead>
<tbody>
<tr><td>Entry (English Teacher)</td><td>2.5~3.2M/month</td><td>TEFL + Bachelor's</td></tr>
<tr><td>Junior Corporate</td><td>3.5~5M/month</td><td>Master's + bilingual + 2~3 years exp</td></tr>
<tr><td>Mid-level (5~7 years)</td><td>5~8M/month</td><td>Specialization + Korean + network</td></tr>
<tr><td>Senior (10+ years)</td><td>8~15M/month</td><td>Leadership + bilingual + industry expertise</td></tr>
<tr><td>Director / VP</td><td>15M+/month</td><td>Multinational executive track</td></tr>
</tbody>
</table>

<h2>💼 Job Change Strategy</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>1. From Teaching → Corporate</h3>
<p>Most challenging transition. Strategies:</p>
<ul>
<li>Master's at Korean university (KAIST, SNU, Yonsei) — 2 years</li>
<li>Get certifications (PMP, Google Analytics, AWS) — 6 months</li>
<li>Network via Toastmasters, Internations, LinkedIn meetups</li>
<li>Apply for "Foreigner-only" job postings on LinkedIn, JobKorea (영어 가능)</li>
</ul>

<h3>2. Within Korea Job Hopping</h3>
<ul>
<li>Average raise: 20~30% per move</li>
<li>Optimal frequency: Every 2~3 years (anything faster = red flag)</li>
<li>Use multiple offers to negotiate (most powerful tool)</li>
</ul>

<h3>3. From Korea → Overseas</h3>
<ul>
<li>Korean tech experience valuable for Singapore, Tokyo offices</li>
<li>Target: Same multinational, transfer to overseas branch</li>
<li>Expect 30~50% raise with moving allowance</li>
</ul>
</div>

<h2>🌐 Korean Corporate Culture Tips</h2>
<ul>
<li><strong>Hierarchy</strong>: Always respect seniority; use formal titles (Manager/Director)</li>
<li><strong>Hoesik (회식)</strong>: After-work dinners with team — usually expected, build relationships</li>
<li><strong>"Bbali bbali"</strong>: Fast pace; quick responses valued over perfection</li>
<li><strong>Gift-giving</strong>: Small gifts (cookies, snacks) when returning from trips</li>
<li><strong>Modesty</strong>: Don't openly self-promote; let your work speak</li>
</ul>

<h2>💸 Salary Negotiation</h2>
<ol>
<li>Research market via Blind, JobPlanet, Glassdoor (English data)</li>
<li>Target: 20% above your current salary as opening</li>
<li>Have multiple offers when possible</li>
<li>Negotiate <strong>total package</strong>: signing bonus, RSU, housing, flights</li>
<li>Don't disclose your current salary if asked (illegal in some jurisdictions)</li>
</ol>

<h2>📝 Conclusion</h2>
<p>Korean career growth is achievable for foreigners. Key: bilingual skills + specialization + strategic job hopping. Use <a href="/tools/career/negotiation-simulator">Negotiation Simulator</a> for your next offer.</p>
`.trim(),
 },
 {
 slug: "korea-pension-401k-equivalent",
 title: "Korea's 'IRP' — Your Korean 401(k)",
 description: "What is IRP, how it compares to US 401(k), tax credits, and withdrawal rules for foreigners.",
 category: "Investing",
 tags: ["Korea IRP", "Pension", "401k"],
 level: "Intermediate" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">If you're working in Korea long-term, you should know about IRP (Individual Retirement Pension) — Korea's equivalent of the US 401(k). It offers tax credits, defers taxation, and lets you build a retirement portfolio.</p>

<h2>📌 IRP Basics</h2>
<ul>
<li><strong>Annual contribution limit</strong>: 9M KRW (~$6,500)</li>
<li><strong>Tax credit</strong>: 16.5% if income < 55M, 13.2% if income > 55M</li>
<li><strong>Maximum tax credit</strong>: 1.485M KRW per year</li>
<li><strong>Investment options</strong>: Stocks, ETFs (max 70%), bonds, deposits (min 30% safe)</li>
<li><strong>Withdrawal</strong>: Age 55+ as pension, taxed at 3.3~5.5%</li>
<li><strong>Early withdrawal</strong>: Hit with 16.5% tax + recover all credits taken</li>
</ul>

<h2>💰 vs US 401(k)</h2>
<table class="my-4">
<thead><tr><th>Feature</th><th>Korea IRP</th><th>US 401(k)</th></tr></thead>
<tbody>
<tr><td>Annual limit</td><td>9M KRW (~$6.5K)</td><td>$22.5K + employer match</td></tr>
<tr><td>Tax benefit</td><td>16.5% credit</td><td>Pre-tax deduction</td></tr>
<tr><td>Investment freedom</td><td>Limited (regulated)</td><td>Wide range</td></tr>
<tr><td>Employer match</td><td>None (purely individual)</td><td>Common (3~6%)</td></tr>
<tr><td>Withdrawal age</td><td>55</td><td>59.5</td></tr>
</tbody>
</table>

<h2>🚀 IRP Strategy for Foreigners</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>If you plan to stay 5+ years</h3>
<ul>
<li>Maximize 9M KRW contribution annually</li>
<li>Take 1.485M tax credit at year-end adjustment</li>
<li>Invest 70% in S&P500 ETF (e.g., KODEX 미국 S&P500), 30% in deposits</li>
<li>Compounding over 20 years could grow to $300K+ before withdrawal</li>
</ul>

<h3>If you plan to leave Korea</h3>
<ul>
<li>You CAN withdraw the IRP balance, but with 16.5% penalty</li>
<li>Better: leave it invested and withdraw at age 55 as Korean pension (3.3% tax)</li>
<li>Korean pension counts as worldwide income for tax in most countries — coordinate with home tax advisor</li>
</ul>
</div>

<h2>🚨 Common Mistakes for Foreigners</h2>
<ol>
<li><strong>Not enrolling early</strong> — every year of compound growth matters</li>
<li><strong>Choosing 100% safe assets</strong> — Korea forces 30% safe, but rest should be growth (ETFs)</li>
<li><strong>Withdrawing before 55</strong> — Korean tax penalty plus US tax (if you're an American citizen — Form 8938 reporting needed)</li>
<li><strong>Confusing with corporate pension</strong> — IRP is YOUR account; corporate severance is separate</li>
</ol>

<h2>📝 Conclusion</h2>
<p>For foreigners working in Korea long-term, IRP is the single most powerful tax-saving tool. 1.485M annual tax credit + tax-deferred growth + low pension tax at 55. Calculate your IRP benefit: <a href="/tools/finance/irp">IRP Calculator</a>.</p>
`.trim(),
 },
 {
 slug: "leaving-korea-final-tax",
 title: "Leaving Korea: Tax & Pension Cleanup",
 description: "What to do before departure: National Pension lump sum withdrawal, final tax filing, account closure.",
 category: "Tax",
 tags: ["Leaving Korea", "Pension Withdrawal", "Final Tax"],
 level: "Intermediate" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">When you decide to leave Korea, several financial steps need careful planning to avoid losing money or running into tax issues later. This guide is your departure checklist.</p>

<h2>📋 Pre-Departure Checklist</h2>
<ol>
<li><strong>Final salary year-end adjustment</strong> — request from employer (usually March of next year)</li>
<li><strong>National Pension lump-sum withdrawal</strong> — apply at NPS office</li>
<li><strong>IRP balance decision</strong> — withdraw (16.5% penalty) or keep until 55</li>
<li><strong>Bank account closure or transfer</strong> — close or convert to non-resident account</li>
<li><strong>Tax certificate</strong> — request "Tax Payment Certificate" from NTS</li>
<li><strong>Health Insurance final settlement</strong> — typically July of departure year</li>
<li><strong>Credit card cancellation</strong> — close cards, pay outstanding balances</li>
<li><strong>ARC (Alien Registration Card) return</strong> — at airport when departing permanently</li>
</ol>

<h2>💰 National Pension Lump-Sum Withdrawal</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>Foreigners can withdraw National Pension contributions when leaving Korea permanently. Eligibility:</p>
<ul>
<li>Country with reciprocity agreement (US, Canada, Japan, etc.)</li>
<li>OR no agreement but you've left Korea</li>
<li>Apply within 5 years of departure</li>
<li>Refund: Your contributions + employer's contributions + low interest</li>
<li>Tax: Generally tax-free in Korea, but check home country tax</li>
</ul>
<p>Apply via Korean embassy in your home country, or before departure at NPS branch (for those leaving with a return ticket).</p>
</div>

<h2>🚀 IRP Decision</h2>
<p>You face three options:</p>
<ol>
<li><strong>Withdraw immediately</strong> — 16.5% tax + give back all credits taken</li>
<li><strong>Keep until age 55</strong> — withdraw as Korean pension, 3.3% tax</li>
<li><strong>Transfer to home country pension</strong> — limited options, complex regulations</li>
</ol>
<p>For most foreigners with significant IRP balance, keeping until 55 is most tax-efficient.</p>

<h2>🏠 Real Estate Considerations</h2>
<ul>
<li><strong>If renting (Jeonse)</strong>: Reclaim deposit (60~90 days notice). Bank to bank transfer abroad: easier with Wise/Toss</li>
<li><strong>If owned property</strong>: Sell or rent out. Consider tax timing — capital gains tax rules</li>
<li><strong>Furniture/items</strong>: Sell on KoreaCraigslist or use shipping services</li>
</ul>

<h2>🏦 Banking After Departure</h2>
<p>If you keep Korean bank accounts:</p>
<ul>
<li>Convert to non-resident account (limited functionality)</li>
<li>Continue receiving Korean income (royalties, pensions)</li>
<li>Foreign banks may need address update annually</li>
<li>Consider closing low-balance accounts to avoid fees</li>
</ul>

<h2>🚨 Common Mistakes</h2>
<ol>
<li>Forgetting National Pension lump-sum withdrawal — 5-year deadline</li>
<li>Not requesting tax certificate — may be needed for home country tax</li>
<li>Closing accounts too early before final settlement</li>
<li>Not changing investment account address — required for compliance</li>
<li>Not informing tax authorities of departure (can affect resident vs non-resident status)</li>
</ol>

<h2>📝 Conclusion</h2>
<p>Leaving Korea requires careful planning 2~3 months in advance. The most important: National Pension withdrawal, IRP decision, and tax certificate. Consult a tax advisor for complex cases (multiple income sources, real estate).</p>
`.trim(),
 },
];
