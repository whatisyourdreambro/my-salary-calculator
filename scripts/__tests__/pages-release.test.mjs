import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync, symlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateRawSync } from 'node:zlib';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from 'yaml';
import { assertReleaseContext, assertProductionPackage, assertPagesProject, assertProductionDeployment,
  configurationHash, pagesUploadArgs, publicationEnvironment, publishPages,
  classifyUploadOutput, sanitizeUploadDiagnostics, releaseFailureDetails, pagesPurgeEnvironment,
  assertLocalReleaseContext, localReleaseDirectory } from '../lib/pages-release.mjs';
import { createReleaseApi, assertConfiglessDirectory, localWranglerOAuth, createLocalReleaseApi,
  createGithubReleaseClient, githubVerifiedPurge, readPurgeReceiptArchive } from '../pages-release.mjs';

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

test('CI is verification only and never receives a new Pages upload credential',()=>{
  const workflow=parse(readFileSync(new URL('../../.github/workflows/ci.yml',import.meta.url),'utf8'));
  assert.equal(workflow.jobs['deploy-pages'],undefined);
  assert.doesNotMatch(JSON.stringify(workflow),/CF_PAGES_API_TOKEN|pages-release\.mjs --publish/);
  const commands=workflow.jobs.verify.steps.map(s=>s.run).filter(Boolean);
  for(const command of ['npm test','npm run qa:safety','npm run qa:pages:build','npm run qa:pages:verify'])assert.ok(commands.includes(command));
  assert.deepEqual(workflow.permissions,{contents:'read'});
});

test('local context requires exact clean approved commit and rejects Actions, foreign origin and every QA mode',()=>{
  const local={commit:COMMIT,head:COMMIT,status:'',origin:'https://github.com/whatisyourdreambro/my-salary-calculator.git'};
  assert.equal(assertLocalReleaseContext({},local),COMMIT);
  for(const change of [{head:OLD},{status:' M app'},{commit:'../outside'},{origin:'https://example.invalid/repo'}])assert.throws(()=>assertLocalReleaseContext({}, {...local,...change}));
  for(const key of ['GITHUB_ACTIONS','MSY_QA_MODE','NEXT_PUBLIC_ADS_DISABLED','MSY_QA_PAGES_STAGE','MSY_QA_WORKER_STAGE','MSY_PAGES_LOCAL_CHILD','MSY_QA_SERVER'])
    assert.throws(()=>assertLocalReleaseContext({[key]:key==='GITHUB_ACTIONS'?'true':'1'},local));
});

test('local receipts are commit-scoped and reject traversal and symlink ancestors without deleting old receipts',()=>{
  const base=mkdtempSync(path.join(os.tmpdir(),'msy-local-receipts-'));
  try{
    const first=localReleaseDirectory(base,COMMIT);writeFileSync(path.join(first,'prior.json'),'retained');
    const second=localReleaseDirectory(base,OLD);assert.notEqual(first,second);assert.equal(readFileSync(path.join(first,'prior.json'),'utf8'),'retained');
    assert.throws(()=>localReleaseDirectory(base,'../outside'));
    const separate=path.join(base,'linked-root');mkdirSync(separate);
    symlinkSync(path.join(base,'.artifacts'),path.join(separate,'.artifacts'),'junction');
    assert.throws(()=>localReleaseDirectory(separate,COMMIT));
  }finally{assert.equal(path.dirname(realpathSync(base)),realpathSync(os.tmpdir()));rmSync(base,{recursive:true,force:true});}
});

test('OAuth resolver invokes only official auth token in memory and rejects supplied-token or raw failure output',()=>{
  const oauth='offline-oauth-'.repeat(8);let calls=0;
  const execute=(cmd,args,options)=>{
    calls++;assert.equal(cmd,process.execPath);assert.deepEqual(args.slice(-3),['auth','token','--json']);
    for(const key of ['CF_API_TOKEN','CLOUDFLARE_API_TOKEN','CLOUDFLARE_API_KEY','NODE_OPTIONS','GH_TOKEN'])assert.equal(options.env[key],undefined);
    assert.equal(options.env.CI,'true');assert.equal(options.env.WRANGLER_WRITE_LOGS,'false');assert.deepEqual(options.stdio,['ignore','pipe','pipe']);
    return JSON.stringify({type:'oauth',token:oauth});
  };
  assert.equal(localWranglerOAuth({HOME:'existing-oauth-home',CF_API_TOKEN:'PRIVATE',CLOUDFLARE_API_TOKEN:'PRIVATE',NODE_OPTIONS:'PRIVATE',GH_TOKEN:'PRIVATE'},execute),oauth);
  assert.equal(calls,1);
  assert.throws(()=>localWranglerOAuth({GITHUB_ACTIONS:'true'},execute));assert.equal(calls,1);
  for(const output of ['PRIVATE bad json',JSON.stringify({type:'api_token',token:oauth})])
    assert.throws(()=>localWranglerOAuth({},()=>output),error=>!error.message.includes(oauth)&&!error.message.includes('PRIVATE'));
  assert.throws(()=>localWranglerOAuth({},()=>{throw Error('PRIVATE');}),error=>!error.message.includes('PRIVATE'));
});

test('local API keeps Cloudflare OAuth separate from GitHub credential and supports shared read contracts',async()=>{
  const oauth='offline-oauth-'.repeat(8);const calls=[];
  const api=createLocalReleaseApi({GH_TOKEN:'github-only'},async(url,init)=>{
    calls.push(String(url));assert.equal(init.method,'GET');
    const github=String(url).startsWith('https://api.github.com/');
    assert.equal(new Headers(init.headers).get('authorization'),`Bearer ${github?'github-only':oauth}`);
    return Response.json(github?{sha:COMMIT}:{success:true,result:project()});
  },()=>JSON.stringify({type:'oauth',token:oauth}));
  assert.equal(await api.readMain(),COMMIT);assert.equal((await api.readProject()).name,'my-salary-calculator');
  assert.equal(calls.length,2);assert.doesNotMatch(JSON.stringify(calls),/offline-oauth|github-only/);
});

function receiptZip(receipt,{method=8,name='purge-receipt.json'}={}){
  const data=Buffer.from(JSON.stringify(receipt)),body=method===8?deflateRawSync(data):data,n=Buffer.from(name);
  let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^(crc&1?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(method,8);
  local.writeUInt32LE(crc,14);local.writeUInt32LE(body.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(n.length,26);
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(method,10);
  central.writeUInt32LE(crc,16);central.writeUInt32LE(body.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(n.length,28);
  const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);
  end.writeUInt32LE(central.length+n.length,12);end.writeUInt32LE(local.length+n.length+body.length,16);
  return Buffer.concat([local,n,body,central,n,end]);
}

test('receipt ZIP decoding never extracts paths and rejects corruption, extra files and expansion beyond 64 KiB',()=>{
  for(const method of [0,8])assert.deepEqual(readPurgeReceiptArchive(receiptZip({ok:true},{method})),{ok:true});
  assert.throws(()=>readPurgeReceiptArchive(receiptZip({ok:true},{name:'../purge-receipt.json'})));
  assert.throws(()=>readPurgeReceiptArchive(receiptZip({huge:'x'.repeat(65536)})));
  const bad=receiptZip({ok:true});bad[50]^=1;assert.throws(()=>readPurgeReceiptArchive(bad));
  const two=receiptZip({ok:true});two.writeUInt16LE(2,two.length-12);assert.throws(()=>readPurgeReceiptArchive(two));
});

function purgeFixture(change={}){
  const requestId='33333333-2222-3333-4444-555555555555',runId=1234,release={commit:COMMIT,deploymentId:ID,configurationHash:'c'.repeat(64)};
  const receipt={schemaVersion:1,requestId,...release,purgeVerified:true,purgedAt:new Date(2000).toISOString(),runId,runAttempt:1,...change.receipt};
  const bytes=receiptZip(receipt),states=[];let posts=0,callbacks=0,checks=0;
  const github={get:async resource=>{
    if(resource.endsWith('/actions/workflows/cf-purge.yml'))return{id:42,state:'active',path:'.github/workflows/cf-purge.yml'};
    if(resource.endsWith(`/actions/runs/${runId}`))return{id:runId,workflow_id:42,event:'workflow_dispatch',head_branch:'main',head_sha:COMMIT,run_attempt:1,status:'completed',conclusion:'success',...change.run};
    if(resource.includes('/jobs?'))return{jobs:[{name:'pages-verified-purge',status:'completed',conclusion:change.jobConclusion??'success'}]};
    if(resource.includes('/artifacts?'))return{total_count:1,artifacts:[{id:87,name:`pages-verified-purge-${requestId}`,expired:false,size_in_bytes:bytes.length,
      workflow_run:{id:runId,head_sha:COMMIT},digest:`sha256:${createHash('sha256').update(bytes).digest('hex')}`,...change.artifact}]};
    throw Error('unexpected fixture resource');
  },dispatchPurge:async input=>{posts++;assert.deepEqual(input,{...release,requestId});if(change.dispatchThrows)throw Error('PRIVATE');return{workflow_run_id:runId};},readArtifact:async()=>bytes};
  const hooks={beforePagesPurge:async()=>{checks++;if(change.recheckFails&&checks>1)throw Error('changed canonical');},onPagesPurge:async()=>{callbacks++;}};
  return{states,counts:()=>({posts,callbacks,checks}),run:()=>githubVerifiedPurge(release,hooks,{github,save:s=>states.push(structuredClone(s)),requestId,now:()=>2000,attempts:1})};
}

test('exact GitHub run plus matching artifact and actual purge receipt are required for callback',async()=>{
  const f=purgeFixture();assert.equal(await f.run(),0);assert.deepEqual(f.counts(),{posts:1,callbacks:1,checks:2});assert.equal(f.states.at(-1).phase,'verified');
  for(const change of [{run:{head_sha:OLD}},{run:{run_attempt:2}},{run:{event:'push'}},{run:{conclusion:'failure'}},
    {jobConclusion:'skipped'},{artifact:{digest:'sha256:'+'0'.repeat(64)}},{artifact:{expired:true}},
    {receipt:{requestId:ID}},{receipt:{deploymentId:OLD_ID}},{receipt:{commit:OLD}},{receipt:{configurationHash:'a'.repeat(64)}},
    {receipt:{purgeVerified:false}},{receipt:{runAttempt:2}},{receipt:{purgedAt:new Date(0).toISOString()}},{recheckFails:true},{dispatchThrows:true}]){
    const failed=purgeFixture(change);await assert.rejects(failed.run());assert.equal(failed.counts().posts,1);assert.equal(failed.counts().callbacks,0);
    assert.doesNotMatch(JSON.stringify(failed.states),/PRIVATE/);
  }
});

test('GitHub purge client sends only fixed dispatch inputs and never forwards auth to signed artifact storage',async()=>{
  const calls=[];const github=createGithubReleaseClient({GH_TOKEN:'github-only',CF_API_TOKEN:'oauth-never-send'},async(url,init)=>{
    calls.push({url:String(url),init});
    if(String(url).endsWith('/zip'))return new Response(null,{status:302,headers:{location:'https://productionresultssa1.blob.core.windows.net/container/artifact?sig=private'}});
    if(String(url).includes('.blob.core.windows.net/')){assert.equal(init.headers,undefined);return new Response('zip-fixture');}
    assert.equal(new Headers(init.headers).get('authorization'),'Bearer github-only');assert.equal(init.redirect,'manual');
    return Response.json({workflow_run_id:1234});
  });
  await github.dispatchPurge({commit:COMMIT,deploymentId:ID,configurationHash:'c'.repeat(64),requestId:OLD_ID});
  assert.equal(calls[0].init.method,'POST');assert.equal(JSON.parse(calls[0].init.body).ref,'main');
  assert.equal(JSON.parse(calls[0].init.body).inputs.operation,'pages-verified-purge');
  await github.readArtifact(87);assert.equal(calls.length,3);assert.doesNotMatch(JSON.stringify(calls),/oauth-never-send/);
  await assert.rejects(github.get('/repos/other/repo/actions'));assert.equal(calls.length,3);
});
