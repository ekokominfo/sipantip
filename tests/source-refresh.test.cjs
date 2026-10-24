const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),vm=require('node:vm');
const {validHotspot,validModel}=require('../source-refresh.js'),{trimModel}=require('../scripts/cache-core.cjs');
test('weather accepts seconds at the current minute and rejects future current observations',()=>{
 const now=new Date('2026-10-25T00:00:00Z'),j={current:{time:'2026-10-25T07:00:00',wind_speed_10m:1,wind_direction_10m:180,cloud_cover:50},hourly:{time:['2026-10-25T07:00'],visibility:[1000]}};
 assert.equal(trimModel(j,['visibility'],now,true).current.time,j.current.time);
 assert.throws(()=>trimModel({...j,current:{...j.current,time:'2026-10-25T07:00:01'}},['visibility'],now,true));
});
test('manual source validation rejects malformed hotspots and mismatched model arrays',()=>{
 assert.throws(()=>validHotspot({generated_at:'bad',data:{features:[]}}));
 assert.throws(()=>validHotspot({generated_at:new Date().toISOString(),data:{features:[{properties:{},geometry:{coordinates:[999,0]}}]}}));
 assert.throws(()=>validModel({utc_offset_seconds:25200,hourly:{time:['2020-01-01T00:00'],pm2_5:[]}},['pm2_5']));
});
test('manual refresh really contacts sources, preserves failed data, and stops a quota provider',async()=>{
 const published=[],failed=[],calls=[];
 const context={Date,Intl,URL,Map,Set,AbortSignal,console,SiPongiSource:require('../sipongi-source.js'),CachedData:{publishSource:(...args)=>published.push(args),failSource:(key)=>failed.push(key),get:async key=>key==='archive-index'?{hotspot:['2026-10-01']}:{points:[{key:'v',lat:-2,lon:114}]}},fetch:async url=>{
 calls.push(url);if(url.includes('/indoHotspot'))return {ok:true,json:async()=>({type:'FeatureCollection',features:[]})};
 return {ok:false,status:429};
 }};
 vm.createContext(context);vm.runInContext(await fs.readFile(require.resolve('../source-refresh.js'),'utf8'),context);
 const result=await context.SourceRefresh.run();assert.equal(result.hotspotOK,3);assert.deepEqual(published.filter(p=>p[0].startsWith('hotspot-')).map(p=>p[0]),['hotspot-High','hotspot-Medium','hotspot-Low']);assert.equal(calls.filter(u=>u.includes('/indoHotspot')).length,1);
 assert.equal(calls.filter(u=>u.startsWith('https://api.open-meteo.com')).length,1);
 assert.equal(calls.filter(u=>u.startsWith('https://air-quality-api.open-meteo.com')).length,1);
 await assert.rejects(context.SourceRefresh.run(),/satu menit/);
});
