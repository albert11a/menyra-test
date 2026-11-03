import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const script=fileURLToPath(new URL('../scripts/vercel-ignore-build.sh',import.meta.url));
const duplicate='prj_1x2Ui9BzMI6DVGLvFagryVOQHjab';
const primary='prj_MiYIDtnemjoIdWW3nOrLTHkIpnr6';
function check(project,cwd){
 return spawnSync('bash',[script],{cwd,encoding:'utf8',env:{...process.env,VERCEL_PROJECT_ID:project,VERCEL_GIT_PREVIOUS_SHA:''}});
}
test('Only the archived duplicate is skipped, even without Git or a previous deploy',()=>{
 const cwd=mkdtempSync(join(tmpdir(),'mnyra-build-guard-'));
 try{
  assert.equal(check(duplicate,cwd).status,0);
  for(const project of [primary,'','prj_other',duplicate+'-different']){
   const result=check(project,cwd);
   assert.equal(result.status,1,project||'missing project ID');
   assert.match(result.stdout,/bauen/);
  }
 }finally{rmSync(cwd,{recursive:true,force:true});}
});
