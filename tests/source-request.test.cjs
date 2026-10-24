const {test}=require('node:test'),assert=require('node:assert/strict'),{sourceRequest}=require('../scripts/source-request.cjs');
test('transient network failures retry and recover',async()=>{let n=0;const r=await sourceRequest(async()=>{if(++n<3)throw Object.assign(new Error('fetch failed'),{cause:{code:'ECONNRESET'}});return {status:200};},'https://example.test',{sleep:async()=>{}});assert.equal(n,3);assert.equal(r.status,200);});
test('quota is not retried and permanent network errors retain diagnostics',async()=>{let n=0;await sourceRequest(async()=>{n++;return {status:429};},'https://example.test');assert.equal(n,1);await assert.rejects(sourceRequest(async()=>{throw Object.assign(new Error('failed'),{cause:{code:'ETIMEDOUT'}});},'https://example.test',{sleep:async()=>{}}),e=>e.kind==='network'&&e.detail==='ETIMEDOUT');});
test('hotspot connection timeout uses alternate transport but TLS errors do not',async()=>{
 let fallback=0;
 const options={sleep:async()=>{},fallback:async()=>{fallback++;return {status:200};}};
 const fail=code=>async()=>{throw Object.assign(new Error('failed'),{cause:{code}});};
 assert.equal((await sourceRequest(fail('UND_ERR_CONNECT_TIMEOUT'),'https://appscript.palangkaraya.go.id/hotspot/api/hotspot_high2.json',options)).status,200);
 assert.equal(fallback,1);
 await assert.rejects(sourceRequest(fail('CERT_HAS_EXPIRED'),'https://appscript.palangkaraya.go.id/hotspot/api/hotspot_high2.json',options));
 assert.equal(fallback,1);
});
