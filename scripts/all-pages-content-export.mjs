import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright-core';

const root=process.cwd();
const buildDir=process.env.CONTENT_BUILD_DIR??'.next-final';
const base=process.env.CONTENT_BASE_URL??'http://127.0.0.1:3217';
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(base))throw new Error('Only a local audit server is allowed.');
const out='C:/dev/moneysalary/my-salary-calculator/docs/revenue-audit-2026-10-03';
const inventory=JSON.parse(fs.readFileSync(path.join(out,'all-pages-http.json'),'utf8'));
const buildId=fs.readFileSync(path.join(root,buildDir,'BUILD_ID'),'utf8').trim();
function unit(row){
  const p=row.path;let match;
  if((match=p.match(/^\/salary-db\/listed\/(\d+)$/)))return {kind:'listed-company',id:match[1],owner:'/root/all_pages_local_crawl'};
  if((match=p.match(/^\/salary-db\/compare\/(.+)$/)))return {kind:'company-comparison',id:match[1],companyIds:match[1].split('-vs-'),owner:'/root/all_pages_local_crawl'};
  if((match=p.match(/^\/company\/compare\/(.+)$/)))return {kind:'legacy-company-comparison',id:match[1],companyIds:match[1].split('-vs-'),owner:'/root/all_pages_local_crawl'};
  if(row.template==='/salary-db/[id]')return {kind:'company-profile',id:p.split('/').pop(),owner:'/root/all_pages_local_crawl'};
  if((match=p.match(/^\/(salary|monthly)\/(\d+)$/)))return {kind:match[1]+'-amount',id:match[2],amount:Number(match[2]),owner:'/root'};
  if((match=p.match(/^\/(en\/)?guides\/([^/]+)$/)))return {kind:'guide',language:match[1]?'en':'ko',id:match[2],owner:'parent-assigned-guide-review'};
  if(row.template==='/calc/[slug]')return {kind:'registry-calculator',id:p.split('/').pop(),owner:'parent-assigned-registry-review'};
  if(p.startsWith('/calc/')||p.startsWith('/tools/'))return {kind:'fixed-calculator-or-tool',id:p,owner:'/root/web_seo_audit'};
  if((match=p.match(/^\/(glossary|qna|job|industry|region)\/(.+)$/)))return {kind:match[1]+'-record',id:match[2],owner:'parent-assigned-content-review'};
  return {kind:'fixed-page-or-shared-template',id:p,owner:'/root'};
}

async function main(){
  const textFile=path.join(out,'all-pages-content.jsonl');
  fs.writeFileSync(textFile,'');
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run']});
  const context=await browser.newContext({serviceWorkers:'block'});
  // Detached DOM parsing only. No scripts run and no resource can be requested.
  await context.route('**/*',route=>route.abort());
  const page=await context.newPage();
  const index=[];let completed=0;
  for(const row of inventory.records){
    const artifact=path.join(root,buildDir,'server/app',row.path==='/'?'index.html':row.path.slice(1)+'.html');
    let raw,source;
    if(fs.existsSync(artifact)){raw=fs.readFileSync(artifact,'utf8');source='final-build-prerender-html';}
    else{
      const response=await fetch(base+row.path,{headers:{'User-Agent':'Mozilla/5.0 MoneySalaryLocalContentAudit'},redirect:'manual',signal:AbortSignal.timeout(30000)});
      if(response.status!==200)throw new Error(`${row.path}: local final content HTTP ${response.status}`);
      raw=await response.text();source='final-build-local-edge-SSR';
    }
    const content=await page.evaluate(html=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      const normalize=value=>(value??'').replace(/\s+/g,' ').trim();
      doc.querySelectorAll('script,style,noscript,template,svg,[hidden],[aria-hidden="true"]').forEach(e=>e.remove());
      const main=doc.querySelector('#main-content')??doc.querySelector('main')??doc.body;
      const text=normalize(main.textContent);
      const label=e=>e.getAttribute('aria-label')||e.getAttribute('title')||normalize(e.textContent);
      const links=[...main.querySelectorAll('a[href]')].map(e=>({href:e.getAttribute('href'),text:normalize(e.textContent),rel:e.getAttribute('rel')??'',className:e.className}));
      const tables=[...main.querySelectorAll('table')].map((t,i)=>({index:i,caption:normalize(t.querySelector('caption')?.textContent),rows:[...t.querySelectorAll('tr')].map(r=>[...r.querySelectorAll('th,td')].map(c=>normalize(c.textContent)))}));
      const headings=[...main.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>({level:Number(e.tagName.slice(1)),text:normalize(e.textContent),id:e.id}));
      const buttons=[...main.querySelectorAll('button,[role="button"]')].map(e=>({text:normalize(e.textContent),label:label(e),type:e.getAttribute('type'),disabled:e.hasAttribute('disabled')}));
      const formControls=[...main.querySelectorAll('input,select,textarea')].map(e=>({tag:e.tagName.toLowerCase(),type:e.getAttribute('type'),id:e.id,name:e.getAttribute('name'),label:e.getAttribute('aria-label')||normalize([...doc.querySelectorAll('label')].filter(l=>l.getAttribute('for')===e.id).map(l=>l.textContent).join(' ')),value:e.getAttribute('value'),placeholder:e.getAttribute('placeholder'),min:e.getAttribute('min'),max:e.getAttribute('max'),options:e.tagName==='SELECT'?[...e.querySelectorAll('option')].map(o=>({text:normalize(o.textContent),value:o.getAttribute('value')})):undefined}));
      const sources=links.filter(l=>/^https?:\/\//.test(l.href??'')).map(({href,text})=>({url:href,label:text}));
      const ctaLinks=links.filter(l=>/button|bg-primary|font-bold|font-semibold/.test(l.className));
      const numericTokens=[...new Set(text.match(/[-−+]?\d[\d,]*(?:\.\d+)?\s*(?:조원|억원|만원|천원|원|조|억|만|천|%|퍼센트|배|년|월|일|명|시간|개월|세|위|등|종|개)?/g)??[])];
      return {title:doc.title,description:doc.querySelector('meta[name="description"]')?.getAttribute('content'),bodyText:text,headings,tables,links,buttons,formControls,sourceLinks:sources,ctaLinks,numericTokens};
    },raw);
    const record={path:row.path,template:row.template,unit:unit(row),buildId,source,technical_pass:row.status==='pass',content_reviewed:false,source_verified:false,review_status:'pending-semantic-review',source_verification_status:'not-verified-by-export',contentScope:'All server-rendered main-content text after removing scripts, styles, SVG and explicitly hidden nodes; includes headings/tables/labels and source links. Client-only modal/expanded/input states require separate source or interaction review.',...content};
    const contentHash=crypto.createHash('sha256').update(content.bodyText).digest('hex');
    const line=JSON.stringify({...record,contentHash})+'\n';
    fs.appendFileSync(textFile,line);
    index.push({path:row.path,template:row.template,unit:record.unit,technical_pass:record.technical_pass,content_reviewed:false,source_verified:false,bodyCharacters:content.bodyText.length,headings:content.headings.length,tables:content.tables.length,numericTokens:content.numericTokens.length,sourceLinks:content.sourceLinks.length,buttons:content.buttons.length,formControls:content.formControls.length,contentHash,robots:row.robots,noindex:row.noindex,contentLine:completed+1});
    if(++completed%200===0)console.log(JSON.stringify({phase:'content-export',completed,total:inventory.records.length}));
  }
  await browser.close();
  const counts=index.reduce((a,r)=>(a[r.unit.kind]=(a[r.unit.kind]??0)+1,a),{});
  const publicPaths=index.filter(r=>!r.noindex).length;
  fs.writeFileSync(path.join(out,'all-pages-content-index.json'),JSON.stringify({at:new Date().toISOString(),buildId,base,paths:index.length,indexablePaths:publicPaths,noindexPaths:index.length-publicPaths,contentFile:textFile,counts,ownerStatus:'Owners are explicit task assignments or parent-assigned placeholders; none implies completed factual review.',scope:'Full finite server-rendered text packets. Common surrounding shell excluded by #main-content; client-only state text requires separate template review.',records:index},null,2)+'\n');
  console.log(JSON.stringify({phase:'content-export-complete',paths:index.length,counts,bytes:fs.statSync(textFile).size}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
