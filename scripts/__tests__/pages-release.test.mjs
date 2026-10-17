import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from 'yaml';
import { assertReleaseContext, assertProductionPackage, assertPagesProject, assertProductionDeployment,
  configurationHash, pagesUploadArgs, publicationEnvironment, publishPages,
  classifyUploadOutput, sanitizeUploadDiagnostics, releaseFailureDetails, pagesPurgeEnvironment } from '../lib/pages-release.mjs';
import { createReleaseApi, assertConfiglessDirectory } from '../pages-release.mjs';

const COMMIT = 'a'.repeat(40), OLD = 'b'.repeat(40);
const ID = '11111111-2222-3333-4444-555555555555', OLD_ID = '99999999-2222-3333-4444-555555555555';
const marker = {mode:'production',adsDisabled:false,buildId:'build-test',sourceHash:'c'.repeat(64),outputHash:'d'.repeat(64),
  workerHash:'e'.repeat(64),workerModuleCount:44,workerBytes:25126231,compatibilityDate:'2025-09-08',
  publicConfig:{path:'.env.production',effectiveHash:'f'.repeat(64)}};
const environment = () => ({GITHUB_ACTIONS:'true',GITHUB_EVENT_NAME:'push',GITHUB_REF:'refs/heads/main',
  GITHUB_REPOSITORY:'whatisyourdreambro/my-salary-calculator',PAGES_AUTO_DEPLOY_ENABLED:'true',GITHUB_RUN_ATTEMPT:'1',GITHUB_SHA:COMMIT});
function deployment(id = ID, commit = COMMIT) {
  return {id,project_name:'my-salary-calculator',environment:'production',is_skipped:false,
    latest_stage:{name:'deploy',status:'success'},deployment_trigger:{metadata:{branch:'main',commit_hash:commit,commit_dirty:false}},
    short_id:id.slice(0,8),url:`https://${id.slice(0,8)}.my-salary-calculator.pages.dev`};
}
function project(id=OLD_ID) {
  const config={compatibility_date:'2025-09-08',compatibility_flags:['nodejs_compat'],d1_databases:{FEEDBACK_DB:{id:'synthetic-db'}},
    env_vars:{FEEDBACK_RATE_LIMIT_SECRET:{type:'secret_text',value:'synthetic-private-config'}}};
  return {name:'my-salary-calculator',production_branch:'main',canonical_deployment:{id},
    source:{type:'github',config:{deployments_enabled:false,production_deployments_enabled:false,preview_deployment_setting:'none'}},
    build_config:{build_command:'frozen'},deployment_configs:{preview:structuredClone(config),production:structuredClone(config)},
    domains:['moneysalary.com','www.moneysalary.com']};
}
function fixture(change={}) {
  let uploaded=false, uploads=0, posts=0, projectReads=0; const states=[], pins=[];
  const deps={readMain:async()=>COMMIT,readProject:async()=>{projectReads++;return project(uploaded?ID:OLD_ID);},
    listDeployments:async()=>uploaded?[deployment(OLD_ID,OLD),deployment()]:[deployment(OLD_ID,OLD)],
    readDeployment:async id=>id===OLD_ID?deployment(OLD_ID,OLD):deployment(id),verifyLocal:async()=>{},
    upload:async()=>{uploads++;uploaded=true;return{code:0};},
    purge:async hooks=>{await hooks.beforePagesPurge();posts++;await hooks.onPagesPurge();return 0;},
    saveState:s=>states.push(structuredClone(s)),savePins:p=>pins.push(structuredClone(p)),...change};
  return{deps,states,pins,counts:()=>({uploads,posts,projectReads}),run:()=>publishPages({commit:COMMIT,marker:structuredClone(marker)},deps)};
}

test('only first main push with explicit enablement and clean exact checkout can publish',()=>{
  assert.equal(assertReleaseContext(environment(),{commit:COMMIT,status:''}),COMMIT);
  for(const change of [{GITHUB_EVENT_NAME:'pull_request'},{GITHUB_REF:'refs/heads/other'},{GITHUB_REPOSITORY:'other/repo'},
    {PAGES_AUTO_DEPLOY_ENABLED:'false'},{GITHUB_RUN_ATTEMPT:'2'},{GITHUB_SHA:OLD},{NEXT_PUBLIC_ADS_DISABLED:'1'},
    {MSY_QA_MODE:'1'},{MSY_QA_PAGES_STAGE:'1'},{GITHUB_ACTIONS:'false'}])
    assert.throws(()=>assertReleaseContext({...environment(),...change},{commit:COMMIT,status:''}));
  assert.throws(()=>assertReleaseContext(environment(),{commit:COMMIT,status:' M file'}));
});

test('QA packages, missing ordinary-ad config and changed module limit are refused',()=>{
  assert.doesNotThrow(()=>assertProductionPackage(marker));
  for(const change of [{mode:'qa'},{adsDisabled:true},{workerModuleCount:6},{workerBytes:26*1024*1024},{publicConfig:{}},{sourceHash:''}])
    assert.throws(()=>assertProductionPackage({...marker,...change}));
});

test('project must preserve frozen Git publisher, current compatibility and feedback bindings',()=>{
  assert.doesNotThrow(()=>assertPagesProject(project(),marker));
  for(const mutate of [p=>p.production_branch='other',p=>p.source.config.deployments_enabled=true,
    p=>p.source.config.production_deployments_enabled=true,p=>p.source.config.preview_deployment_setting='all',
    p=>delete p.deployment_configs.production.d1_databases.FEEDBACK_DB,p=>p.deployment_configs.preview.compatibility_flags=[],
    p=>p.deployment_configs.production.env_vars.FEEDBACK_RATE_LIMIT_SECRET.type='plain_text']){
    const p=project();mutate(p);assert.throws(()=>assertPagesProject(p,marker));
  }
  const a=project(),b=project(ID);assert.equal(configurationHash(a),configurationHash(b));
  b.deployment_configs.production.env_vars.FEEDBACK_RATE_LIMIT_SECRET.value='changed';
  assert.notEqual(configurationHash(a),configurationHash(b));
});

test('deployment validation requires exact successful production commit and immutable project URL',()=>{
  assert.doesNotThrow(()=>assertProductionDeployment(deployment(),COMMIT,ID));
  for(const mutate of [d=>d.environment='preview',d=>d.is_skipped=true,d=>d.latest_stage.status='failure',
    d=>d.deployment_trigger.metadata.commit_hash=COMMIT.slice(0,12),d=>d.deployment_trigger.metadata.commit_dirty=true,
    d=>d.deployment_trigger.metadata.branch='other',d=>d.url='https://www.moneysalary.com']){
    const d=deployment();mutate(d);assert.throws(()=>assertProductionDeployment(d,COMMIT,ID));
  }
});

test('upload arguments are Pages production only and cannot select QA, Workers config or a shell command',()=>{
  const dist=path.resolve('.pages-build/dist'),cli=path.resolve('node_modules/wrangler/bin/wrangler.js');
  assert.deepEqual(pagesUploadArgs(cli,dist,COMMIT),[cli,'pages','deploy',dist,'--project-name','my-salary-calculator','--branch','main',
    '--commit-hash',COMMIT,'--commit-dirty=false','--commit-message','Verified automatic static Pages release','--no-bundle']);
  assert.throws(()=>pagesUploadArgs(cli,path.resolve('.pages-qa/dist'),COMMIT));
});

test('upload environment excludes QA/config injection, GitHub token, unrelated secrets and ambient OAuth home',()=>{
  const cwd=path.resolve('synthetic-owned');
  const result=publicationEnvironment({CF_ACCOUNT_ID:'a'.repeat(32),CF_API_TOKEN:'synthetic'.repeat(8),PATH:'safe-path',
    HOME:'unsafe-home',NODE_OPTIONS:'--require hostile',WRANGLER_CONFIG:'workers.json',GITHUB_TOKEN:'private',NEXT_PUBLIC_ADS_DISABLED:'1'},cwd);
  assert.equal(result.HOME,cwd);assert.equal(result.CLOUDFLARE_API_TOKEN,'synthetic'.repeat(8));
  for(const key of ['GITHUB_TOKEN','NODE_OPTIONS','WRANGLER_CONFIG','NEXT_PUBLIC_ADS_DISABLED'])assert.equal(result[key],undefined);
  assert.equal(result.WRANGLER_SEND_METRICS,'false');
});

test('Pages upload and zone purge credentials are separate and missing purge credential fails before publication',()=>{
  const env={CF_ACCOUNT_ID:'a'.repeat(32),CF_ZONE_ID:'b'.repeat(32),CF_API_TOKEN:'pages-token-'.repeat(8),CF_PURGE_API_TOKEN:'purge-token-'.repeat(8)};
  const upload=publicationEnvironment(env,path.resolve('synthetic-owned'));
  const purge=pagesPurgeEnvironment(env,COMMIT);
  assert.equal(upload.CLOUDFLARE_API_TOKEN,env.CF_API_TOKEN);assert.equal(upload.CF_PURGE_API_TOKEN,undefined);
  assert.ok(!Object.values(upload).includes(env.CF_PURGE_API_TOKEN));
  assert.equal(purge.CF_API_TOKEN,env.CF_PURGE_API_TOKEN);assert.ok(!Object.values(purge).includes(env.CF_API_TOKEN));
  assert.equal(purge.CF_PAGES_COMMIT_SHA,COMMIT);assert.equal(purge.CF_DEPLOY_TARGET,'pages');
  for(const token of [undefined,'','short','a token with whitespace'])assert.throws(()=>pagesPurgeEnvironment({...env,CF_PURGE_API_TOKEN:token},COMMIT));
});

test('configless cwd rejects ancestor Wrangler config before upload',()=>{
  const base=mkdtempSync(path.join(os.tmpdir(),'msy-release-test-')),child=path.join(base,'child');mkdirSync(child);
  try{assert.doesNotThrow(()=>assertConfiglessDirectory(child));writeFileSync(path.join(base,'wrangler.jsonc'),'{}');assert.throws(()=>assertConfiglessDirectory(child));}
  finally{assert.equal(path.dirname(realpathSync(base)),realpathSync(os.tmpdir()));rmSync(base,{recursive:true,force:true});}
});

test('successful release uploads once, pins canonical identity, requires actual purge and writes no secret fields',async()=>{
  const f=fixture();const p=await f.run();assert.equal(p.purgeVerified,true);assert.equal(p.deploymentId,ID);
  assert.equal(p.rollbackDeploymentId,OLD_ID);assert.equal(p.policyVersion,1);
  assert.equal(f.counts().uploads,1);assert.equal(f.counts().posts,1);assert.equal(f.pins.length,1);
  assert.equal(f.states.at(-1).phase,'purged-awaiting-http');
  assert.doesNotMatch(JSON.stringify(f.states),/synthetic-private-config|secret_text/);
});

test('superseded main, changed local package or canonical race stops before upload',async()=>{
  for(const mode of ['main','local','canonical','config']){
    const f=fixture();if(mode==='main')f.deps.readMain=async()=>OLD;
    if(mode==='local')f.deps.verifyLocal=async()=>{throw Error('changed');};
    if(mode==='canonical'||mode==='config'){let n=0;f.deps.readProject=async()=>{const p=project(++n>1&&mode==='canonical'?ID:OLD_ID);if(n>1&&mode==='config')p.build_config.build_command='changed';return p;};}
    await assert.rejects(f.run());assert.equal(f.counts().uploads,0);assert.equal(f.pins.length,0);
  }
});

test('existing attempt, ambiguous CLI failure and duplicate candidates cannot re-upload or purge',async()=>{
  for(const mode of ['existing','failure','throw','duplicate']){
    const f=fixture();if(mode==='existing')f.deps.listDeployments=async()=>[deployment()];
    if(mode==='failure'||mode==='throw'){const upload=f.deps.upload;f.deps.upload=async()=>{await upload();if(mode==='throw')throw Error('secret');return{code:1};};}
    if(mode==='duplicate'){const list=f.deps.listDeployments;f.deps.listDeployments=async()=>{const rows=await list();return rows.length>1?[...rows,deployment('22222222-2222-3333-4444-555555555555')]:rows;};}
    await assert.rejects(f.run());assert.ok(f.counts().uploads<=1);assert.equal(f.counts().posts,0);assert.equal(f.pins.length,0);
    if(mode!=='existing')assert.equal(f.states.at(-1).phase,'reconciliation-required');
  }
});

test('purge skipped/failed or canonical/config change during purge never produces successful pins',async()=>{
  for(const mode of ['skip','fail','race']){
    const f=fixture();f.deps.purge=async hooks=>{if(mode==='skip')return 0;if(mode==='fail')return 1;
      f.deps.readProject=async()=>project(OLD_ID);await hooks.beforePagesPurge();return 0;};
    await assert.rejects(f.run());assert.equal(f.pins.length,0);
  }
});

test('control API calls are GET-only fixed origins, bounded and not publisher traffic',async()=>{
  const calls=[];const api=createReleaseApi({CF_ACCOUNT_ID:'a'.repeat(32),CF_API_TOKEN:'cf-test',GITHUB_TOKEN:'gh-test'},async(url,init)=>{
    calls.push(url);assert.equal(init.method,'GET');assert.equal(init.redirect,'error');assert.ok(init.signal instanceof AbortSignal);
    assert.ok(['https://api.cloudflare.com','https://api.github.com'].includes(new URL(url).origin));
    return Response.json(url.includes('api.github.com')?{object:{sha:COMMIT}}:{success:true,result:url.includes('deployments?')?[]:project(),result_info:{page:1,total_pages:1}});
  });
  assert.equal(await api.readMain(),COMMIT);await api.readProject();await api.listDeployments();assert.equal(calls.length,3);
  const bad=createReleaseApi({CF_ACCOUNT_ID:'a'.repeat(32),CF_API_TOKEN:'cf-test'},async()=>new Response('SENSITIVE HTML',{status:503}));
  await assert.rejects(bad.readProject(),e=>!e.message.includes('SENSITIVE'));
});

test('CLI diagnostics retain only fixed classifications and numeric statuses/codes, never raw secrets',()=>{
  const raw='Bearer PRIVATE_TOKEN https://private.invalid/secret\n\u001b[31mAuthentication error\u001b[0m [code: 10000] HTTP 403\n'
    +'A request to the Cloudflare API failed. Unknown argument: secret-argument\nENOENT /private/file\n'
    +'Worker exceeds maximum size of 25 MiB. Script startup exceeded CPU time limit. fetch failed ECONNRESET';
  const result=classifyUploadOutput(raw,'none',Buffer.byteLength(raw));
  assert.deepEqual(result.categories,['authentication-permission','arguments','local-configuration','size-limit','startup','network','api-error']);
  assert.deepEqual(result.apiCodes,[10000]);assert.deepEqual(result.httpStatuses,[403]);
  assert.equal(result.outputBytes,Buffer.byteLength(raw));
  assert.doesNotMatch(JSON.stringify(result),/PRIVATE_TOKEN|private\.invalid|secret-argument|private\/file/);
  assert.deepEqual(classifyUploadOutput('unrecognized PRIVATE_TOKEN').categories,[]);
  const poisoned=sanitizeUploadDiagnostics({categories:['PRIVATE_TOKEN','network'],httpStatuses:[200,403,'secret',900],apiCodes:[10000,'private',-1,1e10],termination:'PRIVATE_TOKEN',outputBytes:-1,raw});
  assert.deepEqual(poisoned,{categories:['network'],httpStatuses:[403],apiCodes:[10000],termination:'none',outputBytes:0});
});

test('control-plane 403, malformed JSON and transport failures retain safe phase details before upload',async()=>{
  for(const kind of ['api','json','transport']){
    const api=createReleaseApi({CF_ACCOUNT_ID:'a'.repeat(32),CF_API_TOKEN:'PRIVATE_TOKEN'},async()=>{
      if(kind==='transport')throw Error('PRIVATE_TOKEN https://private.invalid');
      if(kind==='json')return new Response('PRIVATE_TOKEN invalid JSON',{status:502});
      return Response.json({success:false,errors:[{code:10000,message:'PRIVATE_TOKEN'},{code:'PRIVATE_TOKEN'}]},{status:403});
    });
    const f=fixture({readProject:api.readProject});await assert.rejects(f.run());
    const state=f.states.at(-1);assert.equal(state.phase,'preflight-stopped');assert.equal(state.failedDuring,'checking-project');
    assert.deepEqual(state.failure,{phase:'read-project',kind:kind==='api'?'api-response':kind==='json'?'invalid-json':'transport',
      httpStatus:kind==='api'?403:kind==='json'?502:null,apiCodes:kind==='api'?[10000]:[]});
    assert.equal(f.counts().uploads,0);assert.equal(f.pins.length,0);assert.doesNotMatch(JSON.stringify(f.states),/PRIVATE_TOKEN|private\.invalid/);
  }
  assert.deepEqual(releaseFailureDetails(Error('PRIVATE_TOKEN')),{kind:'unclassified'});
});

test('upload failure diagnostics survive reconciliation without enabling a retry or purge',async()=>{
  const f=fixture({upload:async()=>({code:1,diagnostics:{...classifyUploadOutput('Authentication error [code: 10000] HTTP 403'),raw:'PRIVATE_TOKEN'}})});
  await assert.rejects(f.run());const state=f.states.at(-1);
  assert.equal(state.phase,'reconciliation-required');assert.equal(state.failedDuring,'reconciling');
  assert.equal(state.uploadExitCode,1);assert.deepEqual(state.candidateIds,[]);
  assert.deepEqual(state.uploadDiagnostics.apiCodes,[10000]);assert.deepEqual(state.uploadDiagnostics.httpStatuses,[403]);
  assert.equal(f.counts().posts,0);assert.equal(f.pins.length,0);assert.doesNotMatch(JSON.stringify(f.states),/PRIVATE_TOKEN/);
});

test('deployment history supports observed 34-page shape and refuses inconsistent or excessive pagination',async()=>{
  let calls=0;
  const api=createReleaseApi({CF_ACCOUNT_ID:'a'.repeat(32),CF_API_TOKEN:'cf-test'},async url=>{
    const page=Number(new URL(url).searchParams.get('page'));calls++;
    const count=page===34?6:25;
    return Response.json({success:true,result:Array.from({length:count},()=>deployment()),result_info:{page,per_page:25,count,total_count:831,total_pages:34}});
  });
  assert.equal((await api.listDeployments()).length,831);assert.equal(calls,34);
  for(const info of [{page:1,total_pages:51},{page:2,total_pages:1}]){
    let attempts=0;
    const bad=createReleaseApi({CF_ACCOUNT_ID:'a'.repeat(32),CF_API_TOKEN:'cf-test'},async()=>{attempts++;return Response.json({success:true,result:[],result_info:info});});
    await assert.rejects(bad.listDeployments());assert.equal(attempts,1);
  }
});

test('CI deploy job needs full QA verification and limits credentials to publication steps',()=>{
  const workflow=parse(readFileSync(new URL('../../.github/workflows/ci.yml',import.meta.url),'utf8'));
  const job=workflow.jobs['deploy-pages'];assert.equal(job.needs,'verify');
  assert.equal(job.if,"github.event_name == 'push' && github.ref == 'refs/heads/main' && vars.PAGES_AUTO_DEPLOY_ENABLED == 'true'");
  assert.equal(job.concurrency['cancel-in-progress'],false);assert.equal(job.concurrency.group,'pages-production');
  const commands=job.steps.map(s=>s.run).filter(Boolean);
  assert.deepEqual(commands,['npm ci','npm run pages:build','npm run pages:verify','node scripts/pages-indexnow.mjs --capture',
    'node scripts/pages-release.mjs --publish','node scripts/verify-pages-release-http.mjs --execute-production-http','node scripts/pages-indexnow.mjs --submit']);
  for(const step of job.steps.filter(s=>/^(npm |node scripts\/pages-indexnow.mjs --capture)/.test(s.run||'')))assert.equal(step.env,undefined);
  assert.equal(job.steps[0].with.ref,'${{ github.sha }}');assert.equal(job.steps[0].with['persist-credentials'],false);
  const publish=job.steps.find(s=>s.run==='node scripts/pages-release.mjs --publish');
  assert.equal(publish.env.CF_API_TOKEN,'${{ secrets.CF_PAGES_API_TOKEN }}');assert.equal(publish.env.CF_PURGE_API_TOKEN,'${{ secrets.CF_API_TOKEN }}');
  for(const step of job.steps.filter(s=>['node scripts/verify-pages-release-http.mjs --execute-production-http','node scripts/pages-indexnow.mjs --submit'].includes(s.run))){
    assert.equal(step.env.CF_API_TOKEN,'${{ secrets.CF_PAGES_API_TOKEN }}');assert.equal(step.env.CF_PURGE_API_TOKEN,undefined);
  }
  assert.deepEqual(workflow.permissions,{contents:'read'});
});
