import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import type { ConsoleMessage, Page, Response, Route } from 'playwright-core';
import { analyzeHtml, normalizePath, parseSitemap } from './qa-page-quality.mjs';
import { calculateSalary2026 } from '../src/lib/TaxLogic';
import { encodeSalarySharePayload } from '../src/lib/salarySharePayload';
import { EN_ALL_PAGE_PATHS } from '../src/lib/englishRoutes';

interface HttpRecord {
  path: string; template: string | null; sources: string[]; expectedStatus: number;
  checks: Record<string, string>; issues: string[]; warnings: string[];
  browser375: string; browser1280: string; factualReview: string;
  httpStatus?: number; location?: string | null; responseRobots?: string | null;
  bytes?: number; noindex?: boolean; internalLinkTargets?: string[]; queryKeys?: string[];
  adMarkup?: { sponsoredLabel: boolean; slotAttributes: string[]; policy: string };
  error?: string; status?: string; blocker?: string; brokenInternalLinks?: string[];
}
interface BrowserRecord {
  path: string; template: string | null; width: number; status: string; issues: string[];
  errors: string[]; consoleErrors: string[]; localResourceErrors: { path: string; status: number }[];
  network: string; httpStatus?: number; error?: string;
}
type ParsedHtml = Omit<ReturnType<typeof analyzeHtml>, 'links'> & {links:{href:string}[]};

const root = process.cwd();
const out = process.env.AUDIT_OUTPUT_DIR ?? 'C:/dev/moneysalary/my-salary-calculator/docs/revenue-audit-2026-10-03';
const rawOut = process.env.AUDIT_RAW_DIR ?? path.join(root, '.artifacts');
const base = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:3216';
const buildDir = process.env.AUDIT_BUILD_DIR ?? '.next';
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(base)) throw new Error('Only a local audit server is allowed.');
const production = 'https://www.moneysalary.com';
const commit = '65bba1f64243cbb69f7fa8e64f0f48c269d1d764';
const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 MoneySalaryLocalQA';
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(rawOut, { recursive: true });
const write = (name: string, data: unknown) => {
  if(name==='all-pages-http.json'){
    const rawPath=path.join(rawOut,name);
    fs.writeFileSync(rawPath,JSON.stringify(data));
    if(typeof data!=='object'||data===null||!('records' in data)||!Array.isArray(data.records))throw new Error('Expected HTTP audit records');
    data={...data,rawEvidence:rawPath,records:data.records.map((r:unknown)=>{
      if(typeof r!=='object'||r===null)throw new Error('Expected an HTTP audit record');
      const {internalLinkTargets,...row}=r as {internalLinkTargets?:unknown};
      return {...row,internalLinkTargetsInventoried:Array.isArray(internalLinkTargets)?internalLinkTargets.length:0};
    })};
  }
  fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2) + '\n');
};
const walk = (dir: string): string[] => fs.readdirSync(dir, {withFileTypes:true}).flatMap(x => x.isDirectory() ? walk(path.join(dir,x.name)) : [path.join(dir,x.name)]);
const sourceFiles = walk(path.join(root,'src/app')).filter(x => x.endsWith('/page.tsx') || x.endsWith('\\page.tsx'));
const templates = sourceFiles.map(file => {
  const source = fs.readFileSync(file,'utf8');
  const route = normalizePath('/' + path.relative(path.join(root,'src/app'),path.dirname(file)).replaceAll('\\','/').replace(/\([^/]+\)\/?/g,''));
  return {route, source:path.relative(root,file).replaceAll('\\','/'), runtime:/runtime\s*=\s*['"]edge/.test(source)?'edge':'node-or-static', generated:/generateStaticParams/.test(source), finite:/dynamicParams\s*=\s*false/.test(source), sourceAdComponents:[...new Set([...source.matchAll(/<(\w*Ad)\b/g)].map(x=>x[1]))]};
});
const templateMatch = (p: string) => templates.filter(t=>new RegExp('^'+t.route.split('/').map((segment:string)=>segment.startsWith('[...')?'.+':segment.startsWith('[')?'[^/]+':segment.replace(/[.*+?^${}()|\[\]\\]/g,'\\$&')).join('/')+'$').test(p)).sort((a,b)=>Number(a.route.includes('[...'))-Number(b.route.includes('[...'))||Number(a.route.includes('['))-Number(b.route.includes('['))||b.route.length-a.route.length)[0]?.route ?? null;
const skipped: {path:string;status:string;reason:string}[] = [];
const paths: string[] = [];
const seen = new Map<string,Set<string>>();
const asset = /\.(?:png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|css|js|map|pdf|xml|txt|json|csv|webmanifest)$/i;
const add = (p:string, reason:string) => {
  p=normalizePath(p);
  if(p==='/en/page-unavailable'&&!templates.some(t=>t.route===p)){if(!skipped.some(r=>r.path===p))skipped.push({path:p,status:'skipped',reason:'Internal generated English catch-all 404 fixture, not a source public page'});return;}
  if(p.includes('[') || p.startsWith('/_') || p.startsWith('/api/') || p.startsWith('/widget/') || asset.test(p)) return;
  if(!seen.has(p)){seen.set(p,new Set());paths.push(p);}
  seen.get(p)!.add(reason);
};
async function localFetch(p:string){
  const u = new URL(p,base);
  if(u.origin!==base) throw new Error('External URL rejected');
  return fetch(u,{headers:{'User-Agent':ua},redirect:'manual',signal:AbortSignal.timeout(30000)});
}
async function main(){
  for(const file of process.env.SKIP_BROWSER==='1'?['all-pages-http.jsonl']:['all-pages-http.jsonl','all-pages-browser.jsonl'])fs.writeFileSync(path.join(out,file),'');
  const sitemapRes = await localFetch('/sitemap.xml');
  const sitemap = parseSitemap(await sitemapRes.text());
  sitemap.forEach(x=>add(x.path,'sitemap'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root,buildDir,'prerender-manifest.json'),'utf8'));
  Object.keys(manifest.routes).forEach(p=>add(p,'prerender-manifest'));
  for(const f of walk(path.join(root,buildDir,'server/app')).filter(f=>f.endsWith('.html'))){
    const rel=path.relative(path.join(root,buildDir,'server/app'),f).replaceAll('\\','/');
    add(rel==='index.html'?'/':'/'+rel.slice(0,-5),'generated-html');
  }
  templates.filter(t=>!t.route.includes('[')).forEach(t=>add(t.route,'static-source-route'));
  EN_ALL_PAGE_PATHS.forEach(p=>add(p,'english-declared-route'));
  const boundaries = [
    {path:'/salary/0',expected:404}, {path:'/salary/9999999999999999999999',expected:404},
    {path:'/salary/abc',expected:404},{path:'/salary/50000001',expected:308},
    {path:'/monthly/0',expected:404},{path:'/monthly/1599999',expected:404},{path:'/monthly/20000001',expected:404},
    {path:'/monthly/3000001',expected:404},{path:'/monthly/abc',expected:404},
    {path:'/en/definitely-not-a-page',expected:404}, {path:'/en/tools/definitely-not-a-tool',expected:404},
    {path:'/en/guides/definitely-not-a-guide',expected:404},
    {path:'/salary-db/definitely-not-a-company',expected:308},
    {path:'/guides/definitely-not-a-guide',expected:308}, {path:'/qna/definitely-not-a-question',expected:404},
    {path:'/glossary/definitely-not-a-term',expected:404}, {path:'/calc/definitely-not-a-tool',expected:308},
    {path:'/share/not-valid',expected:200}
  ];
  const shared = encodeSalarySharePayload({v:1,taxYear:2026,incomeType:'regular',annualSalary:50000000,nonTaxableAmount:200000,dependents:1,children:0});
  boundaries.push({path:'/share/'+shared,expected:200});
  const inventoryStart=paths.length;
  const records:HttpRecord[]=[];
  let cursor=0, completed=0;
  const start=Date.now();
  const inspect = async(p:string,expected?:number)=>{
    const rec:HttpRecord={path:p,template:templateMatch(p),sources:[...(seen.get(p)??[])],expectedStatus:expected??200,checks:{},issues:[],warnings:[],browser375:'pending',browser1280:'not-selected',factualReview:'not-reviewed'};
    try{
      const response=await localFetch(p); rec.httpStatus=response.status;
      rec.location=response.headers.get('location'); rec.responseRobots=response.headers.get('x-robots-tag');
      const raw=await response.text(); rec.bytes=Buffer.byteLength(raw);
      if(response.status>=300&&response.status<400){
        rec.checks.http='redirect';
        if(rec.location){const url=new URL(rec.location,base);if(url.origin===base||url.origin===production) add(url.pathname,'redirect-target');}
        if(expected && response.status!==expected) rec.issues.push('boundary-http-status');
      }else if(response.status!==rec.expectedStatus){rec.issues.push('http-status');rec.checks.http='fail';}
      else rec.checks.http='pass';
      const html:ParsedHtml=analyzeHtml(raw);
      Object.assign(rec,{titles:html.titles,descriptions:html.descriptions,h1:html.h1,canonical:html.canonical,robots:html.robots,jsonLd:html.jsonLd,content:html.content});
      rec.noindex=[...html.robots,rec.responseRobots??''].some(x=>/\bnoindex\b/i.test(x));
      if(response.status===200 && !expected){
        for(const [field,code] of [['titles','title'],['descriptions','description'],['h1','h1'],['canonical','canonical']] as const){
          rec.checks[code]=html[field].length===1&&!!html[field][0]?'pass':'fail';
          if(rec.checks[code]==='fail'&&!rec.noindex)rec.issues.push(code+'-count-or-empty');
        }
        const canonical=html.canonical[0];
        if(!rec.noindex && canonical){const c=new URL(canonical,production);if(c.origin!==production||normalizePath(c.pathname)!==p||c.search)rec.issues.push('canonical-not-self');}
        if(sitemap.some(x=>x.path===p)&&rec.noindex)rec.issues.push('sitemap-noindex');
        if(html.jsonLd.errors)rec.issues.push('jsonld-parse-error');
        if(/NaN|undefined\s*원|null\s*원/.test(raw.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'')))rec.issues.push('invalid-visible-number');
        const salary=p.match(/^\/(salary|monthly)\/(\d+)$/);
        if(salary){const r=calculateSalary2026(Number(salary[2])*(salary[1]==='monthly'?12:1));const expectedValues=[r.netPay,r.nationalPension,r.healthInsurance,r.employmentInsurance,r.incomeTax+r.localIncomeTax].map(n=>n.toLocaleString('ko-KR'));rec.checks.salaryValues=expectedValues.every(v=>raw.includes(v))?'pass':'fail';if(rec.checks.salaryValues==='fail')rec.issues.push('salary-ssr-value-mismatch');}
      }
      const linkTargets=new Set<string>(); const queryKeys=new Set<string>();
      for(const l of html.links){
        try{const u=new URL(l.href,production+p);if(!['http:','https:'].includes(u.protocol)||![production,base].includes(u.origin))continue;const t=normalizePath(u.pathname);if(u.search)u.searchParams.forEach((_,k)=>queryKeys.add(k));if(t!==p){linkTargets.add(t);add(t,'internal-link');}}catch{rec.issues.push('invalid-link-url');}
      }
      rec.internalLinkTargets=[...linkTargets];rec.queryKeys=[...queryKeys];rec.checks.links='targets-inventoried';
      rec.adMarkup={sponsoredLabel:raw.includes('Sponsored'),slotAttributes:[...new Set([...raw.matchAll(/data-ad-slot="([^"]+)"/g)].map(x=>x[1]))],policy:'external-request-blocked; no fill claim; no env files copied'};
    }catch(error){rec.issues.push('fetch-error');rec.error=String(error);}
    const edgeBlocked=rec.httpStatus===500&&templates.find(t=>t.route===rec.template)?.runtime==='edge';
    rec.status=edgeBlocked?'blocked-local-edge-runtime':rec.issues.length?'fail':'pass';
    if(edgeBlocked){rec.blocker='Windows local Next14 Edge runner TypeError default; production status not inferred';rec.browser375='skipped-local-edge-runtime';}
    records.push(rec);
    fs.appendFileSync(path.join(rawOut,'all-pages-http.jsonl'),JSON.stringify(rec)+'\n');
    completed++;if(completed%200===0)console.log(JSON.stringify({phase:'http',completed,queued:paths.length,fail:records.filter(x=>x.issues.length).length,seconds:Math.round((Date.now()-start)/1000)}));
  };
  await Promise.all(Array.from({length:6},async()=>{while(cursor<paths.length){const p=paths[cursor++];await inspect(p);}}));
  const boundaryRecords:HttpRecord[]=[];
  for(const b of boundaries){await inspect(b.path,b.expected);boundaryRecords.push(records.pop()!);}
  const byPath=new Map(records.map(r=>[r.path,r]));
  for(const r of records){
    r.brokenInternalLinks=r.internalLinkTargets?.filter((t:string)=>(byPath.get(t)?.httpStatus??0)>=400&&byPath.get(t)?.status!=='blocked-local-edge-runtime')??[];
    if(r.brokenInternalLinks.length){r.issues.push('broken-internal-page-link');r.status='fail';}
  }
  const boundarySummary={infiniteFamilies:[{route:'/share/[data]',coverage:'one valid generated token and invalid token; the infinite payload space is not enumerated'},{route:'query and fragment variants',coverage:'keys inventoried; arbitrary values are not enumerated'}],finiteFamilies:[{route:'/salary/[amount]',coverage:'all generated allowed amounts; malformed/off-grid boundaries tested'},{route:'/monthly/[amount]',coverage:'all generated grid amounts; malformed/off-grid boundaries tested'}],records:boundaryRecords};
  write('all-pages-boundaries.json',boundarySummary);
  write('all-pages-http.json',{at:new Date().toISOString(),commit,base,inventoryStart,inventoryEnd:paths.length,templates,records,skipped,scope:'Every concrete sitemap, generated and statically declared page plus discovered internal page links. Local HTTP and server HTML; browser results recorded separately; no factual accuracy or search indexing verdict.'});
  console.log(JSON.stringify({phase:'http-complete',total:records.length,fail:records.filter(r=>r.issues.length).length,issues:records.filter(r=>r.issues.length).slice(0,15).map(r=>({path:r.path,issues:r.issues}))}));
  if(process.env.SKIP_BROWSER==='1')return;
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run']});
  let blocked=0;
  const br:BrowserRecord[]=[];
  const browserCheck=async(page:Page,p:string,width:number)=>{
    const errors:string[]=[];const consoleErrors:string[]=[];const localResourceErrors:{path:string;status:number}[]=[];
    const onerror=(e:Error)=>errors.push(String(e));const onconsole=(m:ConsoleMessage)=>{if(m.type()==='error'&&!/ERR_FAILED|ERR_ABORTED|Failed to load resource|blocked|net::|CSP|Content Security Policy/i.test(m.text()))consoleErrors.push(m.text().slice(0,500));};
    const onresponse=(r:Response)=>{if(r.url().startsWith(base)&&r.status()>=400)localResourceErrors.push({path:new URL(r.url()).pathname,status:r.status()});};
    page.on('pageerror',onerror);page.on('console',onconsole);
    page.on('response',onresponse);
    const rec:BrowserRecord={path:p,template:templateMatch(p),width,status:'pass',issues:[],errors,consoleErrors,localResourceErrors,network:'same-origin only; all external requests aborted'};
    try{
      const response=await page.goto(base+p,{waitUntil:'load',timeout:20000});rec.httpStatus=response?.status();
      await page.waitForTimeout(140);
      const dom=await page.evaluate(()=>{
        const visible=(e:Element)=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
        const label=(e:Element)=>{const el=e as HTMLInputElement;return e.getAttribute('aria-label')||e.getAttribute('title')||e.getAttribute('aria-labelledby')||('labels'in el?[...(el.labels??[])].map(l=>l.textContent).join(' '):'')||e.textContent?.trim();};
        const unlabeled=[...document.querySelectorAll('input:not([type=hidden]),select,textarea,button,[role=button]')].filter(e=>visible(e)&&!label(e)).slice(0,20).map(e=>({tag:e.tagName,type:e.getAttribute('type'),id:e.id,html:e.outerHTML.slice(0,180)}));
        const h1=[...document.querySelectorAll('h1')].map(e=>e.textContent?.trim());
        const overflowing=[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return visible(e)&&r.right>innerWidth+3&&r.left>=0&&!e.closest('[class*=overflow-x-auto],[class*=overflow-auto]');}).slice(0,12).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.trim().slice(0,70)}));
        return {title:document.title,h1,canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),robots:[...document.querySelectorAll('meta[name=robots]')].map(e=>e.getAttribute('content')),ready:document.readyState,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,unlabeledControls:unlabeled,overflowing,adContainers:document.querySelectorAll('[data-msy-ad]').length,adsMounted:document.querySelectorAll('ins.adsbygoogle').length};
      });
      Object.assign(rec,dom);
      if(rec.httpStatus!==200)rec.issues.push('browser-http-status');
      if(errors.length)rec.issues.push('runtime-pageerror');
      if(consoleErrors.some(e=>/Minified React error|hydration|hydrating|does not match/i.test(e)))rec.issues.push('hydration-console-error');
      if(localResourceErrors.length)rec.issues.push('local-resource-http-error');
      if(dom.scrollWidth>width+3)rec.issues.push('document-horizontal-overflow');
      if(dom.unlabeledControls.length)rec.issues.push('unlabeled-control-review');
      if(rec.issues.length)rec.status='review';
    }catch(error){rec.status='fail';rec.issues.push('browser-check-error');rec.error=String(error);}
    page.off('pageerror',onerror);page.off('console',onconsole);page.off('response',onresponse);
    br.push(rec);fs.appendFileSync(path.join(out,'all-pages-browser.jsonl'),JSON.stringify(rec)+'\n');
    return rec;
  };
  const browsable=records.filter(r=>r.httpStatus===200).map(r=>r.path);let browserCursor=0;
  await Promise.all(Array.from({length:4},async()=>{
    const ctx=await browser.newContext({viewport:{width:375,height:812},userAgent:ua,serviceWorkers:'block'});
    await ctx.route('**/*',(route:Route)=>{const u=new URL(route.request().url());if(u.origin===base&&route.request().method()==='GET'&&!u.pathname.startsWith('/api/og'))return route.continue();blocked++;return route.abort();});
    const page=await ctx.newPage();
    while(browserCursor<browsable.length){const p=browsable[browserCursor++];const r=await browserCheck(page,p,375);byPath.get(p)!.browser375=r.status;if(br.length%100===0)console.log(JSON.stringify({phase:'browser375',completed:br.length,total:browsable.length,review:br.filter(r=>r.status!=='pass').length,blocked}));}
    await ctx.close();
  }));
  const representative=new Map<string,string>();
  for(const p of browsable){const t=templateMatch(p)??p;if(!representative.has(t))representative.set(t,p);}
  const ctx=await browser.newContext({viewport:{width:1280,height:900},userAgent:ua,serviceWorkers:'block'});
  await ctx.route('**/*',(route:Route)=>{const u=new URL(route.request().url());if(u.origin===base&&route.request().method()==='GET'&&!u.pathname.startsWith('/api/og'))return route.continue();blocked++;return route.abort();});
  const page=await ctx.newPage();
  let desktop=0;
  for(const p of representative.values()){const r=await browserCheck(page,p,1280);byPath.get(p)!.browser1280=r.status;if(++desktop%50===0)console.log(JSON.stringify({phase:'browser1280',completed:desktop,total:representative.size}));}
  await browser.close();
  write('all-pages-browser.json',{at:new Date().toISOString(),commit,base,counts:{mobile375:browsable.length,desktop1280:representative.size,blockedExternalRequests:blocked},scope:'One local fresh navigation per concrete 200 page at 375px, plus one per source template at 1280px; no ads loaded or clicked; DOM controls reviewed mechanically, not full WCAG certification; no exhaustive calculator input interaction.',records:br});
  write('all-pages-http.json',{at:new Date().toISOString(),commit,base,inventoryStart,inventoryEnd:paths.length,templates,records,skipped,scope:'Every concrete sitemap, generated and statically declared page plus discovered internal page links. Browser coverage is explicit per URL. No factual accuracy or search indexing verdict.'});
  const counts={http:records.length,httpFail:records.filter(r=>r.status==='fail').length,httpBlocked:records.filter(r=>r.status==='blocked-local-edge-runtime').length,mobile375:browsable.length,desktop1280:representative.size,browserReview:br.filter(r=>r.status!=='pass').length,boundaries:boundaryRecords.length,blockedExternalRequests:blocked};
  const csvCell=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';
  fs.writeFileSync(path.join(out,'all-pages-status.csv'),[['path','template','http_status','status','browser_375','browser_1280','issues','reason'],...records.map(r=>[r.path,r.template,r.httpStatus,r.status,r.browser375,r.browser1280,r.issues.join(';'),r.blocker??''])].map(row=>row.map(csvCell).join(',')).join('\n')+'\n');
  write('all-pages-summary.json',{at:new Date().toISOString(),commit,patches:['src/components/SalaryRank.tsx','src/app/fun/salary-rank/page.tsx','src/components/AdPlacement.tsx','src/lib/guides/hot-bonus-tax-complete.ts','regenerated guidesMeta.generated.ts','src/lib/simpleCalculators/batch2.ts','src/lib/simpleCalculators/enrichments-ext-b.ts','src/lib/simpleCalculators/enrichments-ext-c.ts'],buildId:fs.readFileSync(path.join(root,buildDir,'BUILD_ID'),'utf8').trim(),snapshot:root,counts,environment:{envFilesCopied:false,syntheticPublicSlotFixture:true,syntheticSlotSource:'scripts/adsense-report.mjs UNIT_NAMES, eight public IDs; production environment not verified',isolatedWindowsEdgeManifestShim:true,postbuildExecuted:false,productionVisited:false,packagesInstalled:false},scopeLimits:['Financial content facts were not all independently researched.','Browser 375px checks cover every concrete 200 page; 1280px checks cover one URL per source template.','Ad fill, delivery, RPM and real traffic are intentionally not measured by synthetic local QA.','Infinite share/query values are boundary checked, not enumerated.']});
  console.log(JSON.stringify({phase:'complete',counts}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
