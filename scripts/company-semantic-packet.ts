// Local read-only audit of public company records and preserved public DART employee responses.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { companyRepository } from '@/lib/salary-data/CompanyRepository';
import { allCompanies } from '@/data/companies';
import { dartDisclosed, DART_DATA_DATE, type DartDisclosedEntry } from '@/data/dart/dartDisclosed';
import { dartInjection, DART_INJECTION_DATE } from '@/data/dart/dartInjection';
import { corpCodeMap } from '@/data/dart/corpCodeMap';
import { listedCohort } from '@/lib/salary-data/dartLite';
import { getComparePairs } from '@/lib/salary-data/companyComparePairs';
import { companies as legacy } from '@/lib/companyData';
import * as builder from '@/lib/companyContentBuilder';
import type { JobLevel } from '@/types/company';

export interface CompanyContentRecord {
 path: string;
 buildId: string;
 bodyText: string;
 unit: { kind: string; companyIds: string[] };
}
type EmployeeRow = Record<string, unknown>;
type ExpectedDisclosure = Pick<DartDisclosedEntry, 'fiscalYear' | 'avgSalaryManwonRaw' | 'employeeCount'> & Partial<Pick<DartDisclosedEntry, 'rceptNo' | 'avgTenureYears' | 'reportedAvgManwonRaw'>>;
interface PreservedCheck {
 status: string;
 source_verified: boolean;
 sourceVerificationScope?: string;
 path?: string;
 sha256?: string;
 checks?: Record<string, boolean>;
 actual?: ReturnType<typeof aggregate>;
}
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
function required<T>(value: T | undefined, label: string): T { if(value===undefined)throw new Error(`Missing audit record: ${label}`);return value; }

const out='C:/dev/moneysalary/my-salary-calculator/docs/revenue-audit-2026-10-03';
const cache='C:/dev/moneysalary/my-salary-calculator/scripts/.dart-cache';
const lines=fs.readFileSync(path.join(out,'all-pages-content.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l) as CompanyContentRecord);
const byPath=new Map(lines.map(r=>[r.path,r]));
const rawById=new Map(allCompanies.map(c=>[c.id,c]));
const dartByCorp=new Map(dartDisclosed.map(c=>[c.corpCode,c]));
const levels: JobLevel[]=['entry','junior','senior','lead','executive'];
const num=(s:unknown)=>{if(s==null)return null;const t=String(s).replace(/,/g,'').trim();if(t===''||t==='-')return null;const n=Number(t);return Number.isFinite(n)?n:null;};
function aggregate(list:EmployeeRow[]){
 const rows=list.map(r=>({head:num(r.sm),pay:num(r.fyer_salary_totamt),avg:num(r.jan_salary_am),tenure:num(r.avrg_cnwk_sdytrn)}));
 type Row = typeof rows[number];
 const payroll=rows.filter((r): r is Row & {pay:number;head:number}=>r.pay!=null&&r.head!=null),reported=rows.filter((r): r is Row & {avg:number;head:number}=>r.avg!=null&&r.head!=null);
 const used=payroll.length?payroll:reported,employees=used.reduce((s,r)=>s+r.head,0);
 if(!employees)return null;
 const salaryRaw=Math.round((payroll.length?payroll.reduce((s,r)=>s+r.pay,0):reported.reduce((s,r)=>s+r.avg*r.head,0))/employees/10000);
 const trows=rows.filter((r): r is Row & {tenure:number;head:number}=>r.tenure!=null&&r.head!=null),thead=trows.reduce((s,r)=>s+r.head,0);
 let reportedRaw=null;
 if(payroll.length&&payroll.every(r=>r.avg!=null&&r.avg>0)){
   const reportedPayroll=payroll as (Row & {pay:number;head:number;avg:number})[];
   const values=reportedPayroll.map(r=>r.avg),max=Math.max(...values),min=Math.min(...values);
   const scale=max<1000?1000000:max<1000000?1000:1;
   if(max/min<=10)reportedRaw=Math.round(reportedPayroll.reduce((s,r)=>s+r.avg*scale*r.head,0)/employees/10000);
 }
 return {salaryRaw,employees,reportedRaw,tenure:thead?Math.round(trows.reduce((s,r)=>s+r.tenure*r.head,0)/thead*10)/10:null,method:payroll.length?'payroll/headcount':'reported-weighted-fallback',rows:list.length};
}
function preserved(corp:string,year:string,expected:ExpectedDisclosure):PreservedCheck{
 const f=path.join(cache,year===String(expected.fiscalYear)?'emp':`emp-hist/${year}`,`${corp}.json`);
 if(!fs.existsSync(f))return {status:'missing-public-cache',source_verified:false};
 const raw=fs.readFileSync(f,'utf8'),data:unknown=JSON.parse(raw);
 if(!isRecord(data)||!Array.isArray(data.list)||!data.list.length)return {status:'empty-public-cache',source_verified:false};
 if(!data.list.every(isRecord))throw new Error(`Invalid employee rows: ${f}`);
 const actual=aggregate(data.list),checks:Record<string,boolean>={year:String(data.year)===year,salary:actual?.salaryRaw===expected.avgSalaryManwonRaw,employees:actual?.employees===expected.employeeCount};
 if(expected.rceptNo)checks.receipt=data.list[0].rcept_no===expected.rceptNo;
 if(expected.avgTenureYears!=null)checks.tenure=actual?.tenure===expected.avgTenureYears;
 if(expected.reportedAvgManwonRaw!=null)checks.reported=actual?.reportedRaw===expected.reportedAvgManwonRaw;
 return {status:Object.values(checks).every(Boolean)?'matched-preserved-public-OpenDART-response':'mismatch-preserved-response',source_verified:Object.values(checks).every(Boolean),sourceVerificationScope:'Preserved public employee API JSON only; no new live request; employee/payroll-derived annual average, employee count, available tenure/reported weighted average/receipt/year. Not job-grade estimates, culture, work policies, or current-year facts.',path:f,sha256:crypto.createHash('sha256').update(raw).digest('hex'),checks,actual};
}
const commonSourceRisk=['five-job-grade-salary-estimates-no-record-level-original-source','incentive-target-max-average-estimates-no-source-period','work-hours-remote-vacation-benefits-estimates-no-record-level-source','culture-score-pros-cons-no-survey-source-period-sample'];
const companies=companyRepository.getAll().map(c=>{
 const raw=rawById.get(c.id),map=corpCodeMap[c.id],d=map&&dartByCorp.get(map.corpCode),inj=dartInjection[c.id];
 const source:PreservedCheck=d?preserved(d.corpCode,d.fiscalYear,d):{status:'no-mapped-public-DART-source',source_verified:false};
 const issues:string[]=[];
 for(const level of levels){const s=c.salary[level];if(!Number.isFinite(s.base)||s.base<0)issues.push(`${level}:invalid-base`);if((s.incentive.avgAmount??0)<0)issues.push(`${level}:negative-average-incentive`);if(s.incentive.target>s.incentive.max)issues.push(`${level}:target-exceeds-max`);if((s.incentive.avgAmount??0)>s.base*s.incentive.max/100+1)issues.push(`${level}:avg-exceeds-annual-base-max-label`);}
 const ben=builder.getBenefitsValue(c),bench=builder.getIndustryBenchmark(c);
 if(c.isGlobal&&ben?.industryAvg!=null)issues.push('global-benefits-benchmark-subtracts-nonmember-from-domestic-pool');
 if(c.culture.score<0||c.culture.score>10)issues.push('culture-score-out-of-10-range');
 if((c.workLife.remoteWork.daysPerWeek??0)>7)issues.push('remote-days-over-week');
 if(c.workLife.vacation.days>=300)issues.push('vacation-unlimited-sentinel-requires-text-render');
 if(c.disclosed&&raw?.disclosed){if(d&&c.disclosed.fiscalYear===d.fiscalYear&&c.disclosed.avgSalaryManwon!==Math.round((d.reportedAvgManwonRaw??d.avgSalaryManwonRaw)/100)*100)issues.push('manual-disclosed-differs-from-rounded-DART-weighted-average-not-auto-error');}
 const totals=Object.fromEntries(levels.map(l=>[l,c.salary[l].base+(c.salary[l].incentive.avgAmount??0)])) as Record<JobLevel,number>;
 return {id:c.id,path:`/salary-db/${c.id}`,record:c,rawDataLastUpdated:raw?.lastUpdated,disclosureKind:raw?.disclosed?'manual':inj?'injected':'none',mappedDart:d,publicSourceCheck:source,derived:{totals,benchmark:bench,overallRank:builder.getOverallRank(c),hourly:builder.getRealHourlyWage(c),benefits:ben,cumulative:builder.getCumulativeIncome(c)},issues,sourceRisks:commonSourceRisk,content:byPath.get(`/salary-db/${c.id}`)};
});
const companyById=new Map(companies.map(c=>[c.id,c]));
const listed=listedCohort.map(c=>({path:`/salary-db/listed/${c.stockCode}`,record:c,publicSourceCheck:preserved(c.corpCode,c.fiscalYear,required(dartByCorp.get(c.corpCode),c.corpCode)),historyChecks:(c.history??[]).map(h=>({year:h.fiscalYear,...preserved(c.corpCode,h.fiscalYear,{...h,fiscalYear:c.fiscalYear})})),content:byPath.get(`/salary-db/listed/${c.stockCode}`)}));
const comparisons=getComparePairs().map(p=>{
 const a=required(companyById.get(p.aId),p.aId),b=required(companyById.get(p.bId),p.bId),at=a.derived.totals,bt=b.derived.totals;
 const diff=Object.fromEntries(levels.map(l=>[l,{a:at[l],b:bt[l],difference:at[l]-bt[l],pctB:Math.round((at[l]-bt[l])/bt[l]*100)}]));
 return {path:`/salary-db/compare/${p.slug}`,pair:p,names:[a.record.name.ko,b.record.name.ko],global:[!!a.record.isGlobal,!!b.record.isGlobal],rawIndustries:[a.record.industry,b.record.industry],industryId:a.record.industryId,diff,entryIncentiveRatios:[a,b].map(r=>Math.round((r.record.salary.entry.incentive.avgAmount??0)/r.record.salary.entry.base*100)),hourly:[a.derived.hourly?.hourly,b.derived.hourly?.hourly],benefits:[a.derived.benefits?.totalAnnualValue,b.derived.benefits?.totalAnnualValue],cum15:[a.derived.cumulative?.at(-1)?.cumulative,b.derived.cumulative?.at(-1)?.cumulative],work:[a.record.workLife,b.record.workLife],culture:[a.record.culture,b.record.culture],content:byPath.get(`/salary-db/compare/${p.slug}`)};
});
const legacyPairs=lines.filter(x=>x.unit.kind==='legacy-company-comparison').map(c=>({path:c.path,pair:c.unit.companyIds,records:c.unit.companyIds.map(id=>required(legacy.find(r=>r.id===id),id)),content:c}));
const packet={at:new Date().toISOString(),productionCommit:'65bba1f64243cbb69f7fa8e64f0f48c269d1d764',contentBuildId:lines[0].buildId,DART_DATA_DATE,DART_INJECTION_DATE,scope:'Public records and preserved public employee responses only. No credential or original environment files read.',companies,listed,comparisons,legacyPairs};
export type CompanyContentPacket = typeof packet;
fs.writeFileSync(path.join(out,'company-content-record-packet.json'),JSON.stringify(packet)+'\n');
for(let i=0;i<companies.length;i+=25){const chunk=companies.slice(i,i+25);fs.writeFileSync(path.join(out,`company-review-packet-${String(i+1).padStart(3,'0')}-${String(i+chunk.length).padStart(3,'0')}.txt`),chunk.map(c=>JSON.stringify({n:companies.indexOf(c)+1,id:c.id,name:c.record.name,industry:c.record.industry,locations:'locations' in c.record?c.record.locations:undefined,tier:c.record.tier,global:!!c.record.isGlobal,dates:[c.rawDataLastUpdated,c.record.lastUpdated],description:c.record.description,salary:levels.map(l=>({l,...c.record.salary[l]})),work:c.record.workLife,benefits:c.record.benefits,culture:c.record.culture,disclosed:c.record.disclosed,disclosureKind:c.disclosureKind,source:c.publicSourceCheck.status,issues:c.issues,careerLevels:c.record.careerLevels})).join('\n')+'\n');}
fs.writeFileSync(path.join(out,'listed-review-packet.txt'),listed.map((c,i)=>JSON.stringify({n:i+1,...c.record,source:c.publicSourceCheck.status,historySources:c.historyChecks.map(h=>[h.year,h.status])})).join('\n')+'\n');
fs.writeFileSync(path.join(out,'company-comparison-review-packet.txt'),comparisons.map((c,i)=>JSON.stringify({n:i+1,path:c.path,names:c.names,global:c.global,industries:c.rawIndustries,gradeTotals:levels.map(l=>[l,c.diff[l].a/10000,c.diff[l].b/10000,c.diff[l].pctB]),incentive:c.entryIncentiveRatios,hourly:c.hourly.map(v=>Math.round(v??0)),benefits:c.benefits?.map(v=>(v??0)/10000),cum15:c.cum15?.map(v=>(v??0)/10000),uniqueConclusions:required(c.content,c.path).bodyText.match(/(?:종합 판정|종합 비교|종합 분석|신입·시니어|초봉은|신입 시점|신입 영끌 연봉은|연봉 격차는|15년 누적)[\s\S]{0,330}/g)?.slice(0,5)})).join('\n')+'\n');
console.log(JSON.stringify({companies:companies.length,listed:listed.length,comparisons:comparisons.length,legacy:legacyPairs.length,publicCacheMatchedCompanies:companies.filter(c=>c.publicSourceCheck.source_verified).length,publicCacheMatchedListed:listed.filter(c=>c.publicSourceCheck.source_verified).length,sourceMismatches:[...companies,...listed].filter(c=>c.publicSourceCheck.status==='mismatch-preserved-response').map(c=>[c.path,c.publicSourceCheck.checks]),issues:companies.filter(c=>c.issues.length).map(c=>[c.id,c.issues]),out},null,2));
