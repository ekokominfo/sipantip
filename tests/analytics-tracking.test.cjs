const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),vm=require('node:vm');
test('hidden public counter still records visits and never requests visitor totals',async()=>{
 const calls=[],storage=new Map(),context={Date,Intl,URL,Set,JSON,AbortSignal,crypto:require('node:crypto').webcrypto,window:{SIPANTIP_ANALYTICS:{url:'https://analytics.test',key:'public'}},location:{hostname:'ekokominfo.github.io'},navigator:{userAgent:'Windows Chrome/'},document:{referrer:'',getElementById(){return null;}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},IntersectionObserver:class{observe(){}},fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return {ok:true,status:204};}};
 vm.createContext(context);vm.runInContext(await fs.readFile(require.resolve('../analytics.js'),'utf8'),context);await new Promise(r=>setImmediate(r));
 assert.equal(calls.length,1);assert.match(calls[0].url,/record_visit$/);assert.equal(calls[0].body.p_feature,'pageview');assert.ok(storage.has('sipantip.visitor'));
});
