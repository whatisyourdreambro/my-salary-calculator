// src/lib/guides/stock-deepdive-en.ts
//
// English-language guides for the "Stocks & Semiconductors" category.
// Same slugs as the Korean version (stock-deepdive.ts) so that hreflang pairs are 1:1.
// Disclaimer: All content is for informational purposes only — not investment advice.

const DISCLAIMER_HTML = `
<div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 my-8 text-sm">
 <p class="font-bold text-amber-900 dark:text-amber-200 mb-2">⚠️ Investment Disclaimer</p>
 <p class="text-amber-800 dark:text-amber-300 leading-relaxed">
  This article is for informational purposes only and does not constitute investment advice or a solicitation to buy or sell any specific security.
  Stock investing carries the risk of capital loss; all decisions and outcomes are the sole responsibility of the investor.
  Past performance is not indicative of future results.
 </p>
</div>
`;

const samsungStock2026 = `
<p class="lead">
 The memory upcycle that began in late 2025 is set to accelerate through 2026, putting Samsung Electronics back in the spotlight.
 Stabilization of HBM3E mass production and visibility on foundry break-even are the two key swing factors for the next 12 months.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 Three Drivers for Samsung's 2026 Stock Story</h2>

<h3 class="text-xl font-bold mt-8 mb-3">1. HBM3E 12-Hi mass production and NVIDIA supply chain entry</h3>
<p>
 Samsung's biggest weakness in memory has been being a follower in HBM.
 However, after passing NVIDIA's qualification for HBM3E 12-Hi in late 2025, full shipments are expected to ramp from Q1 2026.
 Capturing roughly 30% of the volume currently held by SK Hynix could add over 5 trillion KRW per quarter to memory operating profit.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">2. Foundry 2nm GAA yield normalization</h3>
<p>
 The foundry division has been the largest source of operating losses for two consecutive years.
 As 2nm GAA (Gate-All-Around) enters mass production in 2026, foundry could swing from quarterly losses to profitability if mobile AP and AI accelerator orders increase.
 That said, price competitiveness against TSMC remains a persistent challenge.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">3. Continuity of buyback and cancellation policy</h3>
<p>
 Buybacks and share cancellations in 2024–2025 directly improved EPS.
 Whether a similar capital return program continues in 2026 will heavily influence foreign investor flows.
 Watching for shareholder return announcements at each quarterly results day is a key habit.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 Scenarios: Bear / Base / Bull</h2>
<p>The table below shows market consensus-based scenarios as relative comparison (not absolute targets).</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">Scenario</th>
    <th class="p-3 text-left">Assumption</th>
    <th class="p-3 text-left">Relative Move</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">Bull</td>
    <td class="p-3">HBM3E share &gt; 30% + 2nm break-even</td>
    <td class="p-3">+30% to +45% vs base</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">Base</td>
    <td class="p-3">HBM3E share ~15%, narrowing foundry loss</td>
    <td class="p-3">Current level</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">Bear</td>
    <td class="p-3">HBM entry delayed + memory price re-decline</td>
    <td class="p-3">-15% to -25% vs base</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 Three Things Working Investors Should Watch</h2>
<ul class="space-y-3 mt-4">
 <li><strong>① DCA wins:</strong> Given the volatility, a fixed monthly investment smooths your average cost.</li>
 <li><strong>② Use ISA / pension accounts:</strong> Within Korea's ISA non-taxable cap (KRW 200M), realized gains are tax-free, beating direct purchase materially.</li>
 <li><strong>③ Employee benefits:</strong> If you work at Samsung, ESPP discounts vs market price require separate analysis (see related guide).</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 Related Guides</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/en/guides/samsung-employee-rsu-stock" class="text-primary underline">Samsung Employee Stock Plans: Asset Impact in Different Price Scenarios</a></li>
  <li>· <a href="/en/guides/sk-hynix-stock-2026" class="text-primary underline">SK Hynix Stock Outlook: HBM3E Dominance and 2026 Scenarios</a></li>
  <li>· <a href="/en/guides/semiconductor-cycle-2026" class="text-primary underline">Semiconductor Cycle 2026: Asset Strategy Through Memory Peak</a></li>
 </ul>
</div>
`;

const samsungEmployeeRsu = `
<p class="lead">
 For Samsung Electronics employees, the stock price is more than a passing interest — it is a major component of household assets.
 The Employee Stock Ownership (ESOP) plan, employee stock purchase financing, and Restricted Stock Units (RSUs) for executives and selected roles are all directly tied to Samsung's share price.
 This guide simulates how share price scenarios change employee net worth across job levels.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🏢 Samsung's Employee Stock Programs at a Glance</h2>
<div class="grid md:grid-cols-3 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">① ESOP Subscription</h4>
  <p class="text-sm text-muted-foreground">Discounted purchase during new share issuance. 1-year mandatory holding period.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">② ESOP Loan</h4>
  <p class="text-sm text-muted-foreground">Company subsidizes part of the loan interest, allowing employees to scale subscription beyond personal cash.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">③ Executive RSU / Stock Options</h4>
  <p class="text-sm text-muted-foreground">Limited to executives and selected roles. Vesting schedule, taxed as capital gains on exercise.</p>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">📈 Asset Simulation by Job Level</h2>
<p>
 The numbers below are illustrative simulations (actual grants vary widely).
 We assume an employee subscribes ~5% of annual salary to the ESOP each year for 5 years.
</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">Item</th>
    <th class="p-3 text-left">Junior (5 yrs)</th>
    <th class="p-3 text-left">Mid (10 yrs)</th>
    <th class="p-3 text-left">Senior (15 yrs)</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">Salary (assumed)</td>
    <td class="p-3">KRW 75M</td>
    <td class="p-3">KRW 110M</td>
    <td class="p-3">KRW 150M</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Annual ESOP buy</td>
    <td class="p-3">KRW 3.75M</td>
    <td class="p-3">KRW 5.5M</td>
    <td class="p-3">KRW 7.5M</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">5-year cumulative cost</td>
    <td class="p-3">~KRW 18.75M</td>
    <td class="p-3">~KRW 27.5M</td>
    <td class="p-3">~KRW 37.5M</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">Value if +30%</td>
    <td class="p-3 font-bold">KRW 24.4M</td>
    <td class="p-3 font-bold">KRW 35.8M</td>
    <td class="p-3 font-bold">KRW 48.8M</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Value if -20%</td>
    <td class="p-3 text-red-600">KRW 15M</td>
    <td class="p-3 text-red-600">KRW 22M</td>
    <td class="p-3 text-red-600">KRW 30M</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">⚖️ Three Pitfalls of Heavy ESOP Allocation</h2>

<h3 class="text-xl font-bold mt-8 mb-3">Pitfall 1. Asset concentration risk</h3>
<p>
 Your salary <em>and</em> a large portion of your savings ride on the same company.
 If the firm hits trouble, both your income and your assets shake at the same time.
 A common rule of thumb: keep employer stock under <strong>20% of total financial assets</strong>.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">Pitfall 2. Opportunity cost of the lock-up</h3>
<p>
 ESOP shares are typically locked for 1 year.
 If the price falls during that period, you cannot sell or rotate into other assets.
 Always check market conditions before subscribing.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">Pitfall 3. Effective cost of subsidized loans</h3>
<p>
 Many employees use ESOP loans to scale their subscription.
 Even with company subsidy, residual interest remains.
 If the share price gain is below your effective interest rate, your real return is negative.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 Recommended Strategy by Level</h2>
<ul class="space-y-3 mt-4">
 <li><strong>Junior (Staff):</strong> Subscribe ~50% of the cap, allocate the rest to ETFs / pension accounts.</li>
 <li><strong>Mid-level:</strong> Watch concentration. Trim partially when ESOP value exceeds 25% of financial assets.</li>
 <li><strong>Executives / RSU recipients:</strong> Sell 20–30% on vesting for diversification, hold the rest long-term.</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 Useful Tools</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/salary-db" class="text-primary underline">Korean Company Salary DB</a> — Samsung salary by level</li>
  <li>· <a href="/calc" class="text-primary underline">100 Calculators</a> — Capital gains tax on stock sales</li>
  <li>· <a href="/fire-calculator" class="text-primary underline">FIRE Calculator</a> — Retirement simulation including ESOP</li>
 </ul>
</div>
`;

const skHynixStock2026 = `
<p class="lead">
 SK Hynix has enjoyed an early-mover monopoly on HBM3E since 2024, lifting quarterly operating profit above 7 trillion KRW.
 The key question for 2026 is simple: <strong>Can it defend share and margin once Samsung enters at scale?</strong>
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🏆 Three Structural Strengths</h2>

<h3 class="text-xl font-bold mt-8 mb-3">1. One-year lead on the HBM3E / HBM4 roadmap</h3>
<p>
 SK Hynix was first to mass-produce HBM3E 8-Hi and 12-Hi.
 HBM4 is targeted for H2 2026 mass production.
 Deep co-design relationships with NVIDIA and AMD form the first line of defense for share retention.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">2. Margin advantage</h3>
<p>
 HBM commands 5–7x the unit price of commodity DRAM.
 As HBM rose to over 30% of memory revenue, operating margin recovered to 30–40% — historically rare for the industry.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">3. New fabs in Cheongju, Icheon, and Indiana, USA</h3>
<p>
 The M15X (Cheongju), M16 (Icheon), and Indiana advanced packaging facility together roughly double HBM capacity.
 Capacity expansion is a double-edged sword — if demand softens, prices come under pressure.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ Three Risks for 2026</h2>
<div class="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-800 my-6">
 <ul class="space-y-3">
  <li><strong>① Samsung's HBM3E 12-Hi ramp</strong> — share dilution can weaken pricing power.</li>
  <li><strong>② Commodity DRAM / NAND volatility</strong> — 60% of revenue is still commodity memory; cycle peak can hit hard.</li>
  <li><strong>③ FX and US–China trade policy</strong> — high US/China sales exposure makes tariffs and export controls material variables.</li>
 </ul>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 Scenario Map (relative)</h2>
<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">Scenario</th>
    <th class="p-3 text-left">Assumption</th>
    <th class="p-3 text-left">Move vs Base</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">Bull</td>
    <td class="p-3">HBM share &gt; 60% + HBM4 launch on time</td>
    <td class="p-3">+25% to +40%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">Base</td>
    <td class="p-3">HBM share ~50%, stable commodity memory</td>
    <td class="p-3">Current</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">Bear</td>
    <td class="p-3">HBM ASP cut + commodity slowdown</td>
    <td class="p-3">-20% to -30%</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 Buy-Timing Checklist</h2>
<ul class="space-y-3 mt-4">
 <li>✅ DDR5 spot pricing rising for 2 consecutive quarters (demand signal)</li>
 <li>✅ NVIDIA quarterly guidance — data center share &gt; 60%</li>
 <li>✅ Company HBM revenue mix &gt; 35% of memory</li>
 <li>✅ Net foreign buying trend (4-week cumulative positive)</li>
</ul>

${DISCLAIMER_HTML}
`;

const skHynixEmployeeBonus = `
<p class="lead">
 SK Hynix is famous for its profit-sharing scheme. PS (Profit Sharing) and PI (Productivity Incentive) together can push annual compensation 50%+ above base salary in good cycle years.
 This guide breaks down how PS and PI work, how employees buy company stock, and the ROI math when bonus money flows into ESOP.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 PS and PI at a Glance</h2>

<div class="grid md:grid-cols-2 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">PS (Profit Sharing)</h4>
  <p class="text-sm text-muted-foreground mb-2">Tied to company operating profit. Paid once a year (typically Jan–Feb).</p>
  <ul class="text-xs space-y-1">
   <li>· Boom: 30–50% of annual salary</li>
   <li>· Average: 10–20%</li>
   <li>· Down cycle: 0–5% or skipped</li>
  </ul>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">PI (Productivity Incentive)</h4>
  <p class="text-sm text-muted-foreground mb-2">Half-yearly division KPI evaluation. Paid twice a year.</p>
  <ul class="text-xs space-y-1">
   <li>· Top tier: 100–150% of monthly base</li>
   <li>· Average tier: 50–100%</li>
   <li>· Differs by division</li>
  </ul>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">📈 Bonus Simulation by Level</h2>
<p>Boom-year assumption: PS 50% of salary, PI total 200% of monthly base.</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">Item</th>
    <th class="p-3 text-left">New Hire</th>
    <th class="p-3 text-left">5 yrs</th>
    <th class="p-3 text-left">10 yrs</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">Base salary</td>
    <td class="p-3">KRW 58M</td>
    <td class="p-3">KRW 85M</td>
    <td class="p-3">KRW 120M</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">PS (50% of salary)</td>
    <td class="p-3">KRW 29M</td>
    <td class="p-3">KRW 42.5M</td>
    <td class="p-3">KRW 60M</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">PI (~200% of monthly base)</td>
    <td class="p-3">~KRW 9.7M</td>
    <td class="p-3">~KRW 14.2M</td>
    <td class="p-3">~KRW 20M</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">Total compensation</td>
    <td class="p-3 font-bold">KRW 96.7M</td>
    <td class="p-3 font-bold">KRW 141.7M</td>
    <td class="p-3 font-bold">KRW 200M</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 What to Do the Day After PS Lands</h2>

<h3 class="text-xl font-bold mt-8 mb-3">Option 1. ESOP subscription</h3>
<p>
 SK Hynix's ESOP price typically applies a discount versus market.
 Re-investing PS into ESOP during boom years has historically delivered substantial gains in the next up-cycle for many employees.
 The same concentration risk applies, however.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">Option 2. ISA + S&amp;P 500 / KOSPI diversification</h3>
<p>
 Within ISA's annual KRW 20M / cumulative KRW 100M tax-free cap, you can buy S&amp;P 500 and KOSPI ETFs.
 This bets on industries and countries beyond your employer while keeping gains tax-free.
 Many employees fill the ISA cap right after January's PS payout.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">Option 3. Mortgage / loan paydown</h3>
<p>
 If you have a mortgage or unsecured loan, paying down a portion with PS reduces interest cost.
 Especially important for variable-rate loans in a rising rate environment.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ Don't Bake PS Into Fixed Costs</h2>
<div class="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800 my-6">
 <p class="font-bold text-amber-900 dark:text-amber-200 mb-3">PS is a highly variable bonus.</p>
 <ul class="space-y-2 text-sm text-amber-800 dark:text-amber-300">
  <li>· 2018 boom (PS &gt; 50%) → 2019 PS nearly skipped.</li>
  <li>· Plans assuming 50% PS every year are dangerous.</li>
  <li>· Fixed costs (mortgage payments) should be sized to base salary only.</li>
 </ul>
</div>

${DISCLAIMER_HTML}
`;

const semiconductorCycle2026 = `
<p class="lead">
 The memory semiconductor industry follows roughly 3–4 year cycles.
 After the 2022–2023 downturn, the recovery from 2024 onward is widely expected to peak in 2026.
 This guide outlines a working professional's asset strategy for each phase.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🔄 Four Phases of the Memory Cycle</h2>

<div class="space-y-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-blue-500">
  <h4 class="font-bold mb-2">① Recovery — H1 2024</h4>
  <p class="text-sm">Inventory drains, prices bottom. Stock prices rebound first.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-green-500">
  <h4 class="font-bold mb-2">② Expansion — H2 2024 to 2025</h4>
  <p class="text-sm">Demand recovery + price hikes. Operating profit surges. PS / PI bonanza.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-amber-500">
  <h4 class="font-bold mb-2">③ Peak — 2026 (estimated)</h4>
  <p class="text-sm">Capacity additions take effect, price growth slows. Market consensus peak.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-red-500">
  <h4 class="font-bold mb-2">④ Correction — 2027–2028 (possible)</h4>
  <p class="text-sm">Capacity overhang, prices fall. Stocks historically retrace 30–50% from peak.</p>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 Phase-Specific Asset Rules</h2>

<h3 class="text-xl font-bold mt-8 mb-3">At the peak (current estimate)</h3>
<ul class="space-y-3">
 <li><strong>① Check ESOP weight:</strong> Trim if mark-to-market &gt; 30% of financial assets.</li>
 <li><strong>② Move part of PS into safe assets:</strong> Allocate at least 30% of boom-year PS to bond ETFs / deposits.</li>
 <li><strong>③ Don't grow fixed costs:</strong> Don't size new mortgages on peak-year PS — when PS goes to zero next cycle, the burden becomes severe.</li>
 <li><strong>④ Track lock-up release dates:</strong> Calendar your ESOP holding-period expiries.</li>
</ul>

<h3 class="text-xl font-bold mt-8 mb-3">In a correction (1–2 years out)</h3>
<ul class="space-y-3">
 <li><strong>① Continue DCA:</strong> Falling prices reduce your average cost — assuming the company's fundamentals remain intact.</li>
 <li><strong>② Run household assuming PS = 0:</strong> Make sure base salary covers fixed costs.</li>
 <li><strong>③ Diversify globally:</strong> Owning US big tech / staples ETFs cushions Korean memory exposure.</li>
</ul>

${DISCLAIMER_HTML}
`;

const samsungVsHynix = `
<p class="lead">
 Every semiconductor recruiting season brings the same question: "Samsung or SK Hynix?"
 The base salary numbers don't tell the full story. Bonus structure, employee stock programs, benefits, and where each company sits in the cycle matter just as much.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 Comparison Table (2026 estimates)</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">Item</th>
    <th class="p-3 text-left">Samsung Electronics DS</th>
    <th class="p-3 text-left">SK Hynix</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">New hire base salary</td>
    <td class="p-3">KRW 53–58M</td>
    <td class="p-3">KRW 58–62M</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Signing bonus</td>
    <td class="p-3">None (some role exceptions)</td>
    <td class="p-3">KRW 3–5M</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Main bonuses</td>
    <td class="p-3">OPI (yearly) + TAI (semi-annual)</td>
    <td class="p-3">PS (yearly) + PI (semi-annual)</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Boom-year bonus total</td>
    <td class="p-3">~50% of base / ~50% of salary</td>
    <td class="p-3">50%+ of salary (PS alone)</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Employee stock</td>
    <td class="p-3">ESOP + loan support</td>
    <td class="p-3">ESOP + loan support</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Housing</td>
    <td class="p-3">Dorms, company housing, subsidies</td>
    <td class="p-3">Dorms, company housing, subsidies</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">Healthcare</td>
    <td class="p-3">Samsung Medical Center priority</td>
    <td class="p-3">SK group medical support</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">Boom-year total comp (10 yrs)</td>
    <td class="p-3 font-bold">KRW 150–180M</td>
    <td class="p-3 font-bold">KRW 180–220M</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 Six Decision Criteria</h2>

<h3 class="text-xl font-bold mt-8 mb-3">1. Volatility tolerance</h3>
<p>
 SK Hynix has explosive boom-year bonuses but near-zero in busts.
 Samsung is steadier. Pick based on your tolerance for swing.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">2. Role diversity</h3>
<p>
 Samsung DS spans memory, foundry, and System LSI — wider role mobility.
 SK Hynix is memory-focused; ideal if you want to go deep on memory.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">3. Location</h3>
<p>
 Samsung: Hwaseong, Pyeongtaek, Giheung, Cheonan.
 SK Hynix: Icheon, Cheongju, Indiana (US, partial).
 Match your housing plans first.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">4. Brand and global mobility</h3>
<p>
 Samsung's brand carries enormous global weight — easier for international moves.
 SK Hynix has top-tier recognition in memory circles globally.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">5. Long-term ESOP returns</h3>
<p>
 Both are exposed to the Korean memory cycle.
 Samsung's non-memory revenue (foundry, MX) cushions the cycle a bit; SK Hynix gets more leverage on memory upswings.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">6. Work-life and culture</h3>
<p>
 Both have shift-work line operations.
 For office roles, division-level differences exceed company-level differences. Check team culture before signing.
</p>

${DISCLAIMER_HTML}
`;

const chipStockTax = `
<p class="lead">
 If you buy and sell Samsung Electronics or SK Hynix shares through a regular Korean brokerage account, capital gains tax may apply depending on your holdings.
 (Korean stock capital gains tax currently applies to "large shareholders"; rules can change in 2026, so this guide focuses on general principles.)
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📚 Korean Stock Capital Gains Tax Basics</h2>
<ul class="space-y-3 mt-4">
 <li><strong>Large shareholder rule:</strong> Once your position in a single ticker exceeds the threshold (by value or ownership ratio), capital gains tax applies on sale.</li>
 <li><strong>Retail investors:</strong> Currently no capital gains tax on Korean stock sales.</li>
 <li><strong>Foreign stocks:</strong> 22% capital gains tax (incl. local tax) after KRW 2.5M annual deduction.</li>
</ul>

<div class="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800 my-6">
 <p class="font-bold text-amber-900 dark:text-amber-200 mb-2">⚠️ Policy Volatility</p>
 <p class="text-sm text-amber-800 dark:text-amber-300">
  Expansion of capital gains taxation on Korean stocks is a recurring topic in annual tax revisions.
  Always verify the latest rules just before selling.
 </p>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 Four Tax-Efficient Strategies for Working Professionals</h2>

<h3 class="text-xl font-bold mt-8 mb-3">Strategy 1. ISA account (top priority)</h3>
<p>
 The ISA (Individual Savings Account) provides annual KRW 20M / cumulative KRW 100M tax-free caps.
 Trading Samsung / SK Hynix inside the ISA makes capital gains tax-free.
 Conditions: 3-year minimum holding and limited withdrawals.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">Strategy 2. Pension fund / IRP ETF trading</h3>
<p>
 Inside a pension savings or IRP account, trading KOSPI 200 ETFs or semiconductor ETFs defers tax on capital gains.
 At distribution, only the much lower pension income tax (3.3–5.5%) applies — beats standard capital gains tax.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">Strategy 3. Loss harvesting (foreign stocks)</h3>
<p>
 Within a calendar year, gains and losses on foreign stocks can be netted.
 Selling some loss positions in December reduces the tax on gain positions.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">Strategy 4. Use the KRW 2.5M annual deduction (foreign stocks)</h3>
<p>
 Splitting realized foreign-stock gains across years to stay under KRW 2.5M each year can effectively zero out the tax.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🧮 Pre-Sale Checklist</h2>
<ul class="space-y-3 mt-4">
 <li>☐ Is ISA capacity remaining?</li>
 <li>☐ Do you meet the large shareholder threshold?</li>
 <li>☐ Are there loss positions in the same year (for netting)?</li>
 <li>☐ Is year-end vs next-year sale better?</li>
 <li>☐ For ESOP shares, has the lock-up expired?</li>
</ul>

${DISCLAIMER_HTML}
`;

const kospiLeaderStrategy = `
<p class="lead">
 Samsung Electronics and SK Hynix vie for the No. 1 and 2 KOSPI market-cap spots.
 Together they account for over 30% of the KOSPI — owning them is essentially betting on the Korean stock market.
 This guide compares DCA versus lump-sum, and provides allocation guidelines by salary band.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚖️ DCA vs Lump-Sum: Backtest Summary</h2>

<p>Simple simulation on the past decade (2015–2025):</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">Strategy</th>
    <th class="p-3 text-left">Method</th>
    <th class="p-3 text-left">Volatility</th>
    <th class="p-3 text-left">Average Return</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">DCA</td>
    <td class="p-3">Fixed monthly amount</td>
    <td class="p-3">Low</td>
    <td class="p-3">Market average ± α</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">Lump-sum</td>
    <td class="p-3">Single deployment</td>
    <td class="p-3">Very high</td>
    <td class="p-3">-50% to +100% depending on entry</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">Hybrid</td>
    <td class="p-3 font-bold">50% upfront + 50% over 6 months</td>
    <td class="p-3 font-bold">Medium</td>
    <td class="p-3 font-bold">Solid in most periods</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 Practical DCA Design</h2>

<h3 class="text-xl font-bold mt-8 mb-3">A. Auto-buy 5–10% of salary every payday</h3>
<p>
 Set the brokerage's auto-buy feature to fire the day after payday.
 Removing emotion keeps your cost basis steady.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">B. Set a portfolio cap</h3>
<p>
 Cap combined Samsung + SK Hynix exposure at 30% of financial assets — pause new buys above the cap.
 Reroute new flows into other assets.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">C. Take partial profits at cycle peak signals</h3>
<p>
 Years where industry PS &gt; 50% likely indicate cycle peak.
 Trimming 20–30% of holdings into bond ETFs at that point cushions cycle drawdowns.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📈 Allocation by Salary Band</h2>
<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">Salary</th>
    <th class="p-3 text-left">Monthly DCA</th>
    <th class="p-3 text-left">Allocation Cap</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">KRW 50M</td>
    <td class="p-3">KRW 0.25–0.5M</td>
    <td class="p-3">20%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">KRW 80M</td>
    <td class="p-3">KRW 0.5–1.0M</td>
    <td class="p-3">25%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">KRW 150M</td>
    <td class="p-3">KRW 1.0–2.0M</td>
    <td class="p-3">30%</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="mt-4 text-sm text-muted-foreground">
 ※ The above is a general guideline. Adjust based on your risk tolerance, dependents, and home-buying plans.
</p>

${DISCLAIMER_HTML}
`;

export const stockDeepdiveGuidesEn = [
 {
  slug: "samsung-electronics-stock-2026",
  title: "Samsung Electronics 2026 Stock Outlook: HBM and Foundry Inflection 📊",
  description: "HBM3E 12-Hi ramp and 2nm GAA break-even potential. Scenario-based buying strategies for working investors.",
  category: "Stocks",
  tags: ["Samsung Electronics", "stock", "HBM", "semiconductor", "2026"],
  level: "Intermediate" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: samsungStock2026,
 },
 {
  slug: "samsung-employee-rsu-stock",
  title: "Samsung Employee Stock Plans: How Much Does a +30% Move Mean to You? 💼",
  description: "ESOP, ESOP loans, and executive RSUs. Asset simulation by job level under different price scenarios.",
  category: "Stocks",
  tags: ["Samsung Electronics", "ESOP", "RSU", "employee", "wealth"],
  level: "Intermediate" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: samsungEmployeeRsu,
 },
 {
  slug: "sk-hynix-stock-2026",
  title: "SK Hynix Stock Outlook: Will the HBM3E Lead Hold Through 2026? 🚀",
  description: "HBM4 roadmap, Cheongju / Icheon / Indiana capacity expansion, and the impact of Samsung's entry.",
  category: "Stocks",
  tags: ["SK Hynix", "stock", "HBM3E", "HBM4", "memory"],
  level: "Intermediate" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: skHynixStock2026,
 },
 {
  slug: "sk-hynix-employee-bonus-stock",
  title: "SK Hynix PS / PI Bonuses and ESOP ROI 💰",
  description: "Got a 50% PS — now what? ESOP vs ISA vs loan paydown. Bonus simulations by tenure included.",
  category: "Stocks",
  tags: ["SK Hynix", "PS", "PI", "bonus", "ESOP"],
  level: "Intermediate" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: skHynixEmployeeBonus,
 },
 {
  slug: "semiconductor-cycle-2026",
  title: "Semiconductor Cycle 2026: Asset Strategy Through the Memory Peak 🔄",
  description: "Recovery, expansion, peak, correction — phase-specific rules on ESOP weight, PS use, and fixed costs.",
  category: "Stocks",
  tags: ["semiconductor cycle", "memory", "wealth management", "peak", "professionals"],
  level: "Advanced" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: semiconductorCycle2026,
 },
 {
  slug: "samsung-vs-hynix-employee-comparison",
  title: "Samsung vs SK Hynix: Pay, Benefits and Employee Stock Compared ⚖️",
  description: "Base salary, signing bonus, OPI / TAI vs PS / PI, ESOP design, housing — six decision criteria.",
  category: "Stocks",
  tags: ["Samsung Electronics", "SK Hynix", "new hire pay", "comparison", "career"],
  level: "Beginner" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: samsungVsHynix,
 },
 {
  slug: "chip-stock-tax-guide",
  title: "Tax-Efficient Trading of Chip Stocks: ISA, Pension, Loss Harvesting 🧾",
  description: "Four tax strategies for working professionals selling Samsung / SK Hynix shares.",
  category: "Stocks",
  tags: ["stock tax", "capital gains", "ISA", "pension", "tax saving"],
  level: "Intermediate" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: chipStockTax,
 },
 {
  slug: "kospi-leader-stock-strategy",
  title: "KOSPI Leaders (Samsung / SK Hynix) — DCA vs Lump-Sum Strategy 📈",
  description: "Auto-buy 5–10% of salary, set portfolio caps, and trim at cycle peaks. Allocation by salary band.",
  category: "Stocks",
  tags: ["DCA", "lump-sum", "Samsung Electronics", "SK Hynix", "portfolio"],
  level: "Intermediate" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "en" as const,
  content: kospiLeaderStrategy,
 },
];
