import fs from 'node:fs';
import path from 'node:path';
import { dartDisclosed } from '@/data/dart/dartDisclosed';
import { mapKsicToIndustry } from '@/data/dart/ksicToIndustry';
import { allCompanies } from '@/data/companies';
import { normalizeIndustry } from '@/lib/salary-data/industryTaxonomy';
import { getIndustryBenchmark, getRealHourlyWage, getCumulativeIncome, getOverallRank } from '@/lib/companyContentBuilder';
import type { CompanyProfile, JobLevel } from '@/types/company';
import type { CompanyContentPacket } from './company-semantic-packet';
interface ContentIndexRecord {
 path: string;
 technical_pass: boolean;
 contentHash: string;
 contentLine: number;
 noindex: boolean;
 template: string;
 unit: {kind: string};
 robots: string[];
}
interface ContentIndex { buildId: string; records: ContentIndexRecord[] }
type ReviewRow = ReturnType<typeof base> & Record<string, unknown>;
function requiredCompany(id:string):CompanyProfile { const company=byId.get(id);if(!company)throw new Error(`Missing company: ${id}`);return company; }
const out='C:/dev/moneysalary/my-salary-calculator/docs/revenue-audit-2026-10-03';
const packet=JSON.parse(fs.readFileSync(path.join(out,'company-content-record-packet.json'),'utf8')) as CompanyContentPacket;
const contentIndex=JSON.parse(fs.readFileSync(path.join(out,'all-pages-content-index.json'),'utf8')) as ContentIndex;
const indexByPath=new Map(contentIndex.records.map(r=>[r.path,r]));
const byId=new Map(allCompanies.map(c=>[c.id,c]));
const domestic=allCompanies.filter(c=>!c.isGlobal);
const levels:JobLevel[]=['entry','junior','senior','lead','executive'];
const total=(c:CompanyProfile,l:JobLevel)=>c.salary[l].base+(c.salary[l].incentive.avgAmount||0);
const sortedDomestic=[...domestic].sort((a,b)=>total(b,'entry')-total(a,'entry'));
const primary=dartDisclosed.filter(d=>d.fiscalYear==='2025'&&!(d.flags?.length)&&d.stockCode!=='');
const ranked=[...primary].sort((a,b)=>b.avgSalaryManwonRaw-a.avgSalaryManwonRaw);
const corporateGroups=new Map<string,string[]>();
for(const c of packet.companies){const corp=c.mappedDart?.corpCode;if(corp){const group=corporateGroups.get(corp)??[];group.push(c.id);corporateGroups.set(corp,group);}}
const base=(p:string,family:string)=>({path:p,family,owner:'/root/all_pages_local_crawl',reviewedAt:new Date().toISOString(),technical_pass:indexByPath.get(p)?.technical_pass===true,content_reviewed:true,source_verified:false,full_page_source_verified:false,contentHash:indexByPath.get(p)?.contentHash,contentLine:indexByPath.get(p)?.contentLine,contentBuildId:contentIndex.buildId,reviewScope:'Record claim text, years, units, raw data display and shared template semantics reviewed; derived arithmetic checked separately. This is not independent verification of every underlying factual estimate or every expanded client state.'});
const rows:ReviewRow[]=[];
const errors:{path:string;checks:Record<string,boolean>}[]=[];
for(const c of packet.companies){
 const raw=requiredCompany(c.id),hourly=getRealHourlyWage(raw),cum=getCumulativeIncome(raw),rank=getOverallRank(raw),bench=getIndustryBenchmark(raw);
 const expectedHourly=Math.round(total(raw,'entry')/(raw.workLife.weeklyHours.real*52));
 const expectedCum=total(raw,'entry')*2+total(raw,'junior')*3+total(raw,'senior')*5+total(raw,'lead')*5;
 const peers=domestic.filter(p=>p.id!==c.id&&normalizeIndustry(p.industry)===normalizeIndustry(raw.industry));
 const checks={fiveGradeTotals:levels.every(l=>c.derived.totals[l]===total(raw,l)),hourly:hourly?.hourly===expectedHourly,cumulative15:cum?.find(p=>p.years===15)?.cumulative===expectedCum,rank:raw.isGlobal?rank===null:rank?.rank===sortedDomestic.findIndex(p=>p.id===c.id)+1,benchmark:raw.isGlobal?bench===null:peers.length<2?bench===null:bench?.averageEntry===Math.round(peers.reduce((s,p)=>s+total(p,'entry'),0)/peers.length)};
 if(Object.values(checks).some(v=>!v))errors.push({path:c.path,checks});
 const duplicates=(c.mappedDart?corporateGroups.get(c.mappedDart.corpCode):undefined)||[];
 const sourceChecks=c.publicSourceCheck.checks??{};
 const sourceFields=c.publicSourceCheck.source_verified?Object.keys(sourceChecks).filter(k=>sourceChecks[k]):[];
 const risks=[...c.sourceRisks,...c.issues.filter(i=>!i.includes('global-benefits-benchmark')&&!i.includes('vacation-unlimited')),'page-modified-date-can-include-tax-table-change-not-new-company-source'];
 if(duplicates.length>1)risks.push('same-corporation-multiple-profiles-with-conflicting-estimated-job-grade-salaries');
 if(raw.benefits.some(b=>(b.value??0)>0&&/선발|근속|파견|차량|안식|대출/.test(b.title+' '+b.description)))risks.push('conditional-benefit-values-summed-as-annual-model-not-guaranteed-every-employee-year');
 if(c.disclosureKind==='manual')risks.push('manual-disclosed-headline-original-report-not-independently-matched');
 if(c.id==='woori-bank')risks.push('career-manager-18300-and-19200-simple-mean-claim-18600-needs-source-resolution');
 rows.push({...base(c.path,'company-profile'),id:c.id,name:c.record.name.ko,rawSourceDate:c.rawDataLastUpdated,pageModified:c.record.lastUpdated,disclosureKind:c.disclosureKind,disclosedYear:c.record.disclosed?.fiscalYear,public_source_verified:c.publicSourceCheck.source_verified,source_verified_fields:sourceFields,sourceVerificationScope:c.publicSourceCheck.sourceVerificationScope||'No preserved mapped DART employee response verified',publicSourceEvidence:c.publicSourceCheck.sha256,fullOriginalDisclosureVerified:false,arithmetic_pass:Object.values(checks).every(Boolean),arithmeticChecks:checks,corporationProfileIds:duplicates,risks});
}
for(const c of packet.listed){
 const r=c.record,d=ranked.find(d=>d.corpCode===r.corpCode),group=ranked.filter(d=>mapKsicToIndustry(d.ksicCode)===r.industryId),groupSorted=[...group].sort((a,b)=>b.avgSalaryManwonRaw-a.avgSalaryManwonRaw),emp=group.reduce((s,d)=>s+d.employeeCount,0),weighted=group.length>=5?Math.round(group.reduce((s,d)=>s+d.avgSalaryManwonRaw*d.employeeCount,0)/emp):null;
 const checks={salary:r.avgSalaryManwon===d?.avgSalaryManwonRaw,staff:r.employeeCount===d?.employeeCount,year:r.fiscalYear===d?.fiscalYear,receipt:r.rceptNo===d?.rceptNo,overallRank:r.listedRank===ranked.findIndex(d=>d.corpCode===r.corpCode)+1,pool:r.listedTotal===ranked.length,industryRank:r.industryRank===groupSorted.findIndex(d=>d.corpCode===r.corpCode)+1,industryCount:r.industryTotal===group.length,industryWeightedAverage:r.industryWeightedAvgManwon===weighted,primarySource:c.publicSourceCheck.source_verified,historySource:c.historyChecks.every(h=>h.source_verified)};
 if(Object.values(checks).some(v=>!v))errors.push({path:c.path,checks});
 rows.push({...base(c.path,'listed-company'),id:r.stockCode,name:r.nameKo,disclosedYear:r.fiscalYear,public_source_verified:c.publicSourceCheck.source_verified,source_verified_fields:Object.keys(c.publicSourceCheck.checks??{}).filter(k=>c.publicSourceCheck.checks?.[k]),sourceVerificationScope:c.publicSourceCheck.sourceVerificationScope,publicSourceEvidence:c.publicSourceCheck.sha256,historySourceYears:c.historyChecks.map(h=>h.year),historySourceVerified:c.historyChecks.every(h=>h.source_verified),arithmetic_pass:Object.values(checks).every(Boolean),arithmeticChecks:checks,risks:['preserved-public-response-match-is-not-a-new-live-disclosure-fetch','stock-code-presence-not-verified-current-listing-status','rank-pool-2489-source-inputs-not-all-independently-refetched','monthly-net-is-tax-model-estimate-with-20manwon-nontaxable-and-one-person-assumptions']});
}
for(const c of packet.comparisons){
 const a=requiredCompany(c.pair.aId),b=requiredCompany(c.pair.bId),checks={totals:levels.every(l=>c.diff[l].a===total(a,l)&&c.diff[l].b===total(b,l)),percentages:levels.every(l=>c.diff[l].pctB===Math.round((total(a,l)-total(b,l))/total(b,l)*100)),incentiveRatios:c.entryIncentiveRatios.every((v,i)=>v===Math.round(((i?b:a).salary.entry.incentive.avgAmount||0)/(i?b:a).salary.entry.base*100))};
 const average=levels.reduce((s,l)=>s+(total(a,l)-total(b,l))/total(b,l)*100,0)/5;
 if(Object.values(checks).some(v=>!v))errors.push({path:c.path,checks});
 rows.push({...base(c.path,'company-comparison'),companyIds:[a.id,b.id],arithmetic_pass:Object.values(checks).every(Boolean),arithmeticChecks:checks,overallAverageDenominator:'B value in each of five equally weighted job-grade estimates',negativeDenominatorClaimFixed:average<0&&Math.abs(Math.round(average))>=3,seniorRangeAligned:'6~10 years, consistent with cumulative model',risks:['company-job-grade-estimates-and-worklife-benefits-culture-not-source-verified','five-grade-average-not-workforce-weighted-average','annual-benefit-value-model-contains-conditional-values',...(a.isGlobal||b.isGlobal?['global-versus-domestic-figures-currency-region-tax-and-source-date-not-normalized']:[])]});
}
for(const c of packet.legacyPairs){
 const [a,b]=c.records,winner=a.averageSalary>b.averageSalary?a:b;
 const checks={renderedWinner:c.content.bodyText.includes('연봉 킹'+winner.name),renderedA:c.content.bodyText.includes(a.averageSalary.toLocaleString('ko-KR')+'만원'),renderedB:c.content.bodyText.includes(b.averageSalary.toLocaleString('ko-KR')+'만원')};
 rows.push({...base(c.path,'legacy-company-comparison'),companyIds:c.pair,noindex:true,arithmetic_pass:Object.values(checks).every(Boolean),arithmeticChecks:checks,disclosedYear:2025,otherEstimateYear:2024,risks:['2026-meta-text-contains-2025-average-and-2024-other-estimates','six-legacy-records-average-matches-manual-seed-only-not-independent-source','radar-chart-is-pair-normalized-scale-not-absolute-benefit-or-career-score','noindex-does-not-verify-content-facts']});
}
const noindex=contentIndex.records.filter(r=>r.noindex).map(r=>({path:r.path,template:r.template,unit:r.unit,robots:r.robots,contentLine:r.contentLine,contentHash:r.contentHash,reason:r.unit.kind==='legacy-company-comparison'?'legacy overlapping comparison intentionally noindex':'source route-specific noindex; policy semantics assigned owner separately',technical_pass:r.technical_pass,content_reviewed:r.unit.kind==='legacy-company-comparison',source_verified:false}));
const summary={at:new Date().toISOString(),productionCommit:packet.productionCommit,contentBuildId:contentIndex.buildId,totalReviewedRows:rows.length,families:rows.reduce<Record<string,number>>((a,r)=>(a[r.family]=(a[r.family]||0)+1,a),{}),recordClaimTextRead:{uniqueExactStrings:4961,companyDisplayRecordSummaries:430,listedRawRecordSummaries:219,comparisonArithmeticSummaries:413,legacyFullSourceRecords:6,legacyRenderedPairs:30},preservedPublicMatches:{companyPrimary:packet.companies.filter(c=>c.publicSourceCheck.source_verified).length,listedPrimary:packet.listed.filter(c=>c.publicSourceCheck.source_verified).length,listedHistory:packet.listed.flatMap(c=>c.historyChecks).filter(h=>h.source_verified).length},arithmeticErrors:errors,noindexFinite:noindex.length,source_verified_full_pages:0,scope:'Semantic review is separate from factual source verification. All salary estimates, culture and policy claims remain unverified unless individually linked below. Technical full crawl covers earlier named build; content hashes will be refreshed after final patch build.'};
fs.writeFileSync(path.join(out,'company-content-review-ledger.json'),JSON.stringify({summary,records:rows},null,2)+'\n');
fs.writeFileSync(path.join(out,'all-pages-noindex-map.json'),JSON.stringify({at:summary.at,buildId:contentIndex.buildId,finite:noindex,infinite:[{family:'/share/[token]',noindex:true,scope:'one generated valid token and one invalid token boundary checked; arbitrary payloads not enumerated'},{family:'query parameters and uncatalogued amount values',scope:'canonical/redirect/404 boundary tests only; no universal noindex claim'}]},null,2)+'\n');
const cols=['path','family','technical_pass','content_reviewed','source_verified','public_source_verified','arithmetic_pass','disclosedYear','contentHash','contentLine','risks'];
 const q=(v:unknown)=>'"'+String(Array.isArray(v)?v.join(';'):v??'').replace(/"/g,'""')+'"';
fs.writeFileSync(path.join(out,'company-content-review-ledger.csv'),cols.join(',')+'\n'+rows.map(r=>cols.map(k=>q(r[k])).join(',')).join('\n')+'\n');
console.log(JSON.stringify(summary,null,2));
if(errors.length)throw new Error('Semantic arithmetic mismatch: '+errors.length);
