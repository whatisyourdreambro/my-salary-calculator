// src/lib/guides/expat-essential-deepdive-en.ts
// English guides for expats working/living in Korea — 6 in-depth articles.

export const expatEssentialGuidesEn = [
 {
 slug: "working-in-korea-expat",
 title: "Working in Korea: The Complete Expat Guide 2026",
 description: "Visa types · Average salaries · Korean tax system · 4 insurances · Negotiation tips for foreigners.",
 category: "Career",
 tags: ["Expat", "Korea Visa", "Working in Korea"],
 level: "Intermediate" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Working in Korea as a foreigner involves unique tax rules, visa requirements, and salary structures. This complete guide covers everything you need to know — from your first job offer to year-end tax adjustment.</p>

<h2>📌 Common Visa Types</h2>
<table class="my-4">
<thead><tr><th>Visa</th><th>Category</th><th>Typical Salary</th></tr></thead>
<tbody>
<tr><td>E-1</td><td>Professor</td><td>50~80M KRW</td></tr>
<tr><td>E-2</td><td>Foreign Language Teacher</td><td>24~40M KRW</td></tr>
<tr><td>E-7</td><td>Special Skill (IT, Engineer)</td><td>50~120M+ KRW</td></tr>
<tr><td>D-8</td><td>Corporate Investor</td><td>Variable</td></tr>
<tr><td>F-2-7</td><td>Points-based residency</td><td>Any (5+ year track)</td></tr>
<tr><td>F-5</td><td>Permanent Residency</td><td>Any</td></tr>
</tbody>
</table>

<h2>💰 Average Salaries by Industry (2026)</h2>
<ul>
<li><strong>IT / Tech</strong>: 50~120M KRW (Software Engineer, Data Scientist, PM)</li>
<li><strong>English Teacher (Public)</strong>: 24~32M KRW + housing</li>
<li><strong>Hagwon (Private Academy)</strong>: 30~40M KRW</li>
<li><strong>University Lecturer</strong>: 50~80M KRW</li>
<li><strong>Corporate (Multinational)</strong>: 60~150M KRW</li>
<li><strong>Foreign Embassy/Trade</strong>: 50~100M KRW</li>
</ul>

<h2>🚀 Korean Tax: Two Options for Foreigners</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>Option A: Flat Tax 19% (recommended for high earners)</h3>
<p>Available for foreigners working in Korea, valid for the first 5 years.</p>
<ul>
<li>19% flat rate on total salary (no deductions)</li>
<li>Best if salary > 70M KRW and few dependents</li>
<li>Apply via your company's HR at the start of each tax year</li>
</ul>

<h3>Option B: Standard Progressive Rates</h3>
<p>Same as Korean residents — 6% to 45% progressive brackets.</p>
<ul>
<li>Use deductions (dependents, IRP, donations, etc.)</li>
<li>Best if salary < 70M KRW or many dependents</li>
</ul>
</div>

<h2>🏥 4 Insurances (Mandatory)</h2>
<ul>
<li><strong>National Pension</strong>: 4.5% (employee) — exempt under bilateral agreement (US, Canada, Australia, etc.)</li>
<li><strong>Health Insurance</strong>: 3.545%</li>
<li><strong>Long-term Care</strong>: ~0.46% of base</li>
<li><strong>Employment Insurance</strong>: 0.9%</li>
<li><strong>Total employee burden</strong>: about 9.4% of monthly salary</li>
</ul>

<h2>💼 Salary Negotiation Tips for Foreigners</h2>
<ol>
<li><strong>Always negotiate</strong> — Korean companies expect it from foreign hires.</li>
<li><strong>Use market data</strong> from blind.com, jobplanet.co.kr, or moneysalary.com.</li>
<li><strong>Request housing allowance</strong> — common for E-7 and corporate roles.</li>
<li><strong>Ask for relocation package</strong> — flight, first month's rent, deposit support.</li>
<li><strong>Understand the 13th month bonus</strong> — many Korean companies pay year-end bonuses on top of base.</li>
</ol>

<h2>📝 Conclusion</h2>
<p>Working in Korea is rewarding but requires understanding the local tax and insurance system. Use the <a href="/en">English Salary Calculator</a> to estimate your take-home pay, and check <a href="/en/flat-tax">Flat Tax 19%</a> if your salary is high.</p>
`.trim(),
 },
 {
 slug: "korean-tax-system-foreigners",
 title: "Korean Tax System for Foreigners — A Complete Guide",
 description: "Resident vs non-resident · Flat 19% vs progressive · Year-end adjustment · Tax treaty benefits.",
 category: "Tax",
 tags: ["Korea Tax", "Expat Tax", "Flat Tax"],
 level: "Intermediate" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Korea's tax system has special provisions for foreigners. Understanding the difference between resident and non-resident status, plus the flat 19% option, can save you millions of won per year.</p>

<h2>📌 Resident vs Non-Resident</h2>
<ul>
<li><strong>Resident</strong>: 183+ days per year in Korea OR family/property base in Korea. Taxed on worldwide income.</li>
<li><strong>Non-resident</strong>: Less than 183 days. Taxed only on Korea-sourced income at flat 22%.</li>
</ul>

<h2>💰 Resident Tax Options</h2>
<h3>Standard Progressive (6~45%)</h3>
<table class="my-4">
<thead><tr><th>Taxable Income</th><th>Rate</th></tr></thead>
<tbody>
<tr><td>Up to 14M KRW</td><td>6%</td></tr>
<tr><td>14M ~ 50M</td><td>15%</td></tr>
<tr><td>50M ~ 88M</td><td>24%</td></tr>
<tr><td>88M ~ 150M</td><td>35%</td></tr>
<tr><td>150M ~ 300M</td><td>38%</td></tr>
<tr><td>300M ~ 500M</td><td>40%</td></tr>
<tr><td>500M ~ 1B</td><td>42%</td></tr>
<tr><td>Over 1B</td><td>45%</td></tr>
</tbody>
</table>
<p>Plus 10% local income tax on top of the calculated tax.</p>

<h3>Flat Rate 19% (Foreigners only, first 5 years)</h3>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>Available to foreign employees for the first 5 years of working in Korea. Apply via HR at the beginning of each tax year.</p>
<ul>
<li>19% on gross salary (plus 10% local tax = effective ~20.9%)</li>
<li>No deductions (no dependents, no donations, no IRP)</li>
<li>Best for high earners (>80M KRW) with few deductions</li>
</ul>
</div>

<h2>🚀 Year-End Tax Adjustment (Yeonmaljeongsan)</h2>
<p>Each February, your company calculates your final tax for the previous year. You can claim deductions:</p>
<ul>
<li><strong>Personal deduction</strong>: 1.5M KRW per dependent</li>
<li><strong>Credit card spending</strong>: 15~30% of amount over 25% of salary</li>
<li><strong>Medical expenses</strong>: 15% of amount over 3% of salary</li>
<li><strong>Donations</strong>: 15% credit (over 10M, 30%)</li>
<li><strong>IRP / Pension</strong>: up to 9M KRW deduction at 13.2~16.5%</li>
<li><strong>Monthly rent</strong> (if non-homeowner with salary <70M): 17% of up to 7.5M paid</li>
</ul>

<h2>🌐 Tax Treaty Benefits</h2>
<p>Korea has tax treaties with 90+ countries. Key benefits:</p>
<ul>
<li>National Pension exemption (US, Canada, Australia, Germany, etc.)</li>
<li>Avoiding double taxation on overseas income</li>
<li>Reduced withholding rates on dividends/interest from your home country</li>
</ul>

<h2>📝 Conclusion</h2>
<p>Most foreign professionals earning over 70M KRW benefit from the flat 19% rate. For lower earners or those with families, standard progressive rates with deductions are better. Use the <a href="/en/flat-tax">Flat Tax Calculator</a> to compare.</p>
`.trim(),
 },
 {
 slug: "renting-in-korea",
 title: "Renting in Korea: Jeonse vs Monthly Explained",
 description: "Jeonse (key money deposit) vs Wolse (monthly rent) · Deposit safety · Contract tips for foreigners.",
 category: "RealEstate",
 tags: ["Korea Rent", "Jeonse", "Apartment"],
 level: "Beginner" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Korea has two unique rental systems: Jeonse (large deposit, no rent) and Wolse (small deposit + monthly rent). Foreigners often find Jeonse confusing — but understanding it can save you thousands per month.</p>

<h2>📌 Jeonse — The Korean Key Money System</h2>
<p>You pay a large lump sum (typically 60~80% of the property's market value) as a deposit. You pay <strong>no monthly rent</strong>. After the lease (usually 2 years), you receive the full deposit back.</p>
<ul>
<li>Typical deposit: 200M~600M KRW for Seoul apartment</li>
<li>Lease: 2 years (renewable for 2 more years)</li>
<li>You can earn interest on the deposit (5~6% conversion rate)</li>
<li>Risk: landlord default — must verify property registration</li>
</ul>

<h2>💰 Wolse — Monthly Rent</h2>
<p>Smaller deposit (5M~50M KRW) + monthly rent (300K~2M+ KRW).</p>
<ul>
<li>Better for short-term stays (under 2 years)</li>
<li>Less capital required upfront</li>
<li>Monthly cash flow burden</li>
<li>Can be deductible at year-end tax (under 70M income, non-homeowner)</li>
</ul>

<h2>🚀 Jeonse → Wolse Conversion Rate</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>Standard formula: <strong>Monthly rent = Jeonse deposit × Conversion Rate ÷ 12</strong></p>
<ul>
<li>Seoul average: 5~5.5%</li>
<li>Gyeonggi: 5.5~6%</li>
<li>Other provinces: 6~8%</li>
<li>Legal cap: 5.5% (under Housing Lease Act)</li>
</ul>
<p>Example: 300M KRW Jeonse × 5.5% / 12 = 1.375M KRW monthly rent equivalent.</p>
</div>

<h2>🚨 Foreigner-Specific Tips</h2>
<ol>
<li><strong>Always check property registration</strong> (deungki bubon, 등기부등본) — verify owner identity and existing mortgages.</li>
<li><strong>Get Jeonse Insurance</strong> (Jeonse Bohum, 전세보험) — covers your deposit if landlord defaults. ~0.1~0.2% of deposit per year.</li>
<li><strong>Use a licensed real estate agent</strong> — fees typically 0.4% of Jeonse or monthly rent × 1 month.</li>
<li><strong>Sign formal contract</strong> (in Korean + optional English) — register the contract at the local district office (jumindang) for legal protection.</li>
<li><strong>Understand 5% rent cap</strong> — landlord cannot increase rent more than 5% per renewal (Housing Lease Act).</li>
</ol>

<h2>📝 Conclusion</h2>
<p>If you have substantial savings and plan to stay 2+ years, Jeonse offers savings (no rent). For short-term or limited cash, Wolse is more flexible. Always insure Jeonse deposit. See <a href="/en/cost-of-living">Cost of Living Calculator</a> for total budget.</p>
`.trim(),
 },
 {
 slug: "four-insurances-korea",
 title: "Korea's 4 Mandatory Insurances Explained",
 description: "National Pension · Health · Long-term Care · Employment · Workers' Comp. Employee burden 9.4%.",
 category: "Tax",
 tags: ["4 Insurances", "Korea Insurance", "National Pension"],
 level: "Beginner" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">All employees in Korea — Korean citizens and foreigners alike — must enroll in 4 social insurances. Understanding what they cover and the employee burden is essential.</p>

<h2>📌 The 4 Mandatory Insurances (2026)</h2>
<table class="my-4">
<thead><tr><th>Insurance</th><th>Total</th><th>Employee Pays</th><th>Coverage</th></tr></thead>
<tbody>
<tr><td>National Pension</td><td>9%</td><td>4.5%</td><td>Old-age pension (from age 65)</td></tr>
<tr><td>Health Insurance</td><td>7.09%</td><td>3.545%</td><td>Medical care</td></tr>
<tr><td>Long-term Care</td><td>12.95% of HI</td><td>~0.46%</td><td>Elderly care</td></tr>
<tr><td>Employment Insurance</td><td>1.95~2.7%</td><td>0.9%</td><td>Unemployment benefit</td></tr>
<tr><td>Workers' Compensation</td><td>0.7~18.6%</td><td>0% (employer)</td><td>Work injury</td></tr>
</tbody>
</table>
<p><strong>Employee total: ~9.4% of monthly salary</strong></p>

<h2>🌐 Foreigner Exemptions</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>Foreigners from countries with bilateral social security agreements may be exempt from National Pension:</p>
<ul>
<li><strong>USA</strong>: 5-year exemption with Certificate of Coverage from SSA</li>
<li><strong>Canada</strong>: Bilateral agreement — exempt with home pension contributions</li>
<li><strong>Australia, Germany, UK, Japan</strong>: Various exemptions</li>
</ul>
<p>Apply via your home country's social security agency. Saves about 4.5% of salary per year.</p>
</div>

<h2>💰 What Each Insurance Provides</h2>
<h3>1. National Pension (국민연금)</h3>
<p>Monthly retirement income from age 65. Can withdraw lump sum if you leave Korea permanently (some countries only). Average payout: 800K~1.2M KRW/month after 20+ years of contributions.</p>

<h3>2. Health Insurance (건강보험)</h3>
<p>Comprehensive medical care at very low cost. ~10% co-pay for most services. Includes spouse and dependents (free).</p>

<h3>3. Long-term Care Insurance (장기요양보험)</h3>
<p>Calculated as 12.95% of your health insurance amount. Funds elderly care services for those over 65 or with disabilities.</p>

<h3>4. Employment Insurance (고용보험)</h3>
<p>Unemployment benefit if you lose your job involuntarily. Eligibility: 180+ days of contributions + active job search. Pays 60% of average wage for 4~9 months depending on age and tenure.</p>

<h2>🚨 Health Insurance Settlement (July)</h2>
<p>Each July, your previous year's actual income is reconciled with your monthly contributions. If you got a raise or bonus last year, you'll pay extra in July. If your income decreased, you'll get a refund. Learn more: <a href="/health-insurance-2026">2026 Settlement Guide</a></p>

<h2>📝 Conclusion</h2>
<p>The 4 insurances cost ~9.4% of your salary but provide comprehensive social safety net. For foreigners, check bilateral agreements to potentially exempt from National Pension. Calculate exact contributions: <a href="/en">Salary Calculator</a>.</p>
`.trim(),
 },
 {
 slug: "year-end-tax-adjustment",
 title: "Year-End Tax Adjustment for Foreigners",
 description: "Yeonmaljeongsan process · What deductions to claim · Common mistakes for expats.",
 category: "Tax",
 tags: ["Year-End Tax", "Yeonmaljeongsan", "Tax Refund"],
 level: "Intermediate" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Each February, Korean employers calculate the final tax owed for the previous year (Yeonmaljeongsan, 연말정산). For foreigners, this is when you can claim deductions and potentially receive a refund.</p>

<h2>📌 Timeline</h2>
<ol>
<li><strong>January 15</strong>: Employer requests tax documents from employees</li>
<li><strong>February 5~28</strong>: Submit deduction documents via HomeTax (PDF) or to HR</li>
<li><strong>March payroll</strong>: Refund (or additional charge) reflected in salary</li>
</ol>

<h2>💰 Common Deductions for Foreigners</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>1. Personal Deductions</h3>
<ul>
<li><strong>Self</strong>: 1.5M KRW</li>
<li><strong>Spouse</strong>: 1.5M KRW (if income <1M annually)</li>
<li><strong>Children</strong>: 1.5M KRW per child + child tax credit</li>
<li><strong>Parents (if 60+ and supported)</strong>: 1.5M KRW each</li>
</ul>

<h3>2. Credit Card Spending</h3>
<ul>
<li>15% deduction on amount over 25% of salary</li>
<li>30% on debit card / cash receipt</li>
<li>40% on traditional market / public transit</li>
<li>Max 3M KRW/year (if salary < 70M)</li>
</ul>

<h3>3. Insurance / Pension</h3>
<ul>
<li>IRP / Pension Saving: up to 9M KRW × 16.5% = 1.485M tax credit</li>
<li>Personal medical insurance: 100K credit</li>
</ul>

<h3>4. Medical Expenses</h3>
<ul>
<li>15% credit on amount over 3% of salary</li>
<li>Max 7M KRW for non-self spending</li>
<li>Glasses/contacts up to 500K per person</li>
</ul>

<h3>5. Education</h3>
<ul>
<li>Self: unlimited at 15%</li>
<li>Children K-12: up to 3M KRW per child</li>
<li>University: up to 9M KRW per child</li>
</ul>

<h3>6. Donations</h3>
<ul>
<li>15% credit (30% over 10M)</li>
<li>Religious organizations included</li>
<li>Political donations: 100% refund up to 100K</li>
</ul>

<h3>7. Monthly Rent (Wolse)</h3>
<ul>
<li>Salary < 70M + non-homeowner: 17% of up to 7.5M paid (max 1.275M credit)</li>
<li>Need: lease contract + bank transfer records</li>
</ul>
</div>

<h2>🚨 Common Mistakes for Foreigners</h2>
<ol>
<li><strong>Choosing flat 19%</strong>: You can't claim deductions. Must choose at start of year.</li>
<li><strong>Not registering dependents</strong>: Spouse/children abroad still qualify if you support them.</li>
<li><strong>Missing rent deduction</strong>: Need to register your lease at the local district office.</li>
<li><strong>Forgetting prior employer's data</strong>: If you changed jobs, request income certificate from old employer.</li>
<li><strong>No HomeTax password</strong>: Set up PIN/digital certificate before February.</li>
</ol>

<h2>🚀 Maximizing Your Refund</h2>
<ol>
<li>Use credit/debit cards for everyday spending (track via NaverPay or Toss).</li>
<li>Subscribe to IRP/pension product before December 31 to claim 16.5% credit.</li>
<li>Keep all medical receipts (especially for self and family).</li>
<li>Donate to registered charities (Korean tax-deductible organizations).</li>
<li>If you have monthly rent, register lease and keep bank records.</li>
</ol>

<h2>📝 Conclusion</h2>
<p>Year-end tax adjustment can refund 1~3M KRW for diligent foreigners. Standard progressive rates with deductions usually beat flat 19% if you have a family or significant rent/medical expenses. Calculate your refund: <a href="/en">English Calculator</a>.</p>
`.trim(),
 },
 {
 slug: "korean-salary-statistics",
 title: "Korean Salary Statistics 2026 — How Do You Compare?",
 description: "Average · median · top 1% salaries · industry breakdowns · gender pay gap · Seoul vs other cities.",
 category: "Salary",
 tags: ["Korea Salary", "Salary Statistics", "Average Pay"],
 level: "Beginner" as const,
 publishedDate: "2026-04-30",
 views: 0,
 lang: "en" as const,
 content: `
<p class="lead">Korean salary statistics show wide disparity by industry, gender, and region. Understanding where you stand helps with negotiation and career planning.</p>

<h2>📊 Korea Salary Overview (2026)</h2>
<table class="my-4">
<thead><tr><th>Metric</th><th>Annual KRW</th><th>USD Equivalent</th></tr></thead>
<tbody>
<tr><td>Average</td><td>42M</td><td>$30,400</td></tr>
<tr><td>Median (more realistic)</td><td>32M</td><td>$23,200</td></tr>
<tr><td>Top 25%</td><td>50M+</td><td>$36,200+</td></tr>
<tr><td>Top 10%</td><td>75M+</td><td>$54,300+</td></tr>
<tr><td>Top 5%</td><td>100M+</td><td>$72,500+</td></tr>
<tr><td>Top 1%</td><td>160M+</td><td>$116,000+</td></tr>
</tbody>
</table>

<h2>🏭 Industry Comparison (Average Annual)</h2>
<ul>
<li><strong>Finance / Banking</strong>: 68M KRW</li>
<li><strong>IT / Tech (Naver, Kakao, etc.)</strong>: 65M KRW (entry: 50M, senior: 95M+)</li>
<li><strong>Energy / Utility</strong>: 65M KRW</li>
<li><strong>Manufacturing (Samsung, LG, Hyundai)</strong>: 55M KRW (semiconductor higher)</li>
<li><strong>Construction</strong>: 50M KRW</li>
<li><strong>Education</strong>: 45M KRW</li>
<li><strong>Wholesale / Retail</strong>: 38M KRW</li>
<li><strong>Hospitality / Food Service</strong>: 28M KRW</li>
</ul>

<h2>👥 Gender Pay Gap</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>Korea has the largest gender pay gap among OECD countries (about 31% in 2024).</p>
<ul>
<li>Male average: 47.5M KRW (~$34,400)</li>
<li>Female average: 34M KRW (~$24,600)</li>
<li>Gap is partly due to fewer women in senior leadership and STEM</li>
<li>Younger generations show smaller gaps</li>
</ul>
</div>

<h2>🏙️ Regional Variation</h2>
<ul>
<li><strong>Seoul</strong>: Average 47M (15% above national)</li>
<li><strong>Gangnam (Seoul)</strong>: 60M+ (HQ corporates, finance)</li>
<li><strong>Gyeonggi (Pangyo, Suwon)</strong>: 50M+ (IT, Samsung HQ)</li>
<li><strong>Ulsan</strong>: 55M (Hyundai, oil refineries — highest in Korea)</li>
<li><strong>Other provinces</strong>: 35~40M</li>
</ul>

<h2>💼 Foreign Worker Salaries</h2>
<table class="my-4">
<thead><tr><th>Role</th><th>Average</th></tr></thead>
<tbody>
<tr><td>English Teacher (public)</td><td>2.4~3.2M/month + housing</td></tr>
<tr><td>English Teacher (hagwon)</td><td>2.2~3.0M/month</td></tr>
<tr><td>University Lecturer</td><td>3.5~5M/month</td></tr>
<tr><td>IT / Tech (foreign-friendly)</td><td>5.5~12M/month</td></tr>
<tr><td>Multinational Corporate</td><td>5~10M/month + benefits</td></tr>
</tbody>
</table>

<h2>📈 Salary Growth Trends</h2>
<ul>
<li>Annual raise average: 3~5% (general), 5~10% (IT)</li>
<li>Job-changing raise: 20~30% (most effective career move)</li>
<li>Promotion raise: 10~15%</li>
<li>Bonus: 100~300% of monthly salary (varies by company)</li>
</ul>

<h2>📝 Conclusion</h2>
<p>If you earn 50M+ in Korea, you're in the top 25% of earners. Foreign professionals in tech and finance typically earn well above the local average. Calculate your take-home pay: <a href="/en">English Salary Calculator</a>.</p>
`.trim(),
 },
];
