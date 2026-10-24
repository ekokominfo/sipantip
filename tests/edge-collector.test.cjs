const {test}=require('node:test'),assert=require('node:assert/strict');
function bucket(initial={version:1,resources:{},providers:{}}){
 const files=new Map([['manifest.json',JSON.stringify(initial)]]),writes=[];
 return {files,writes,download:async p=>files.has(p)?{data:new Blob([files.get(p)]),error:null}:{data:null,error:{statusCode:404}},upload:async(p,blob,options)=>{writes.push(p);if(files.has(p)&&!options.upsert)return {error:{statusCode:409}};files.set(p,await blob.text());return {error:null};},list:async()=>({data:[...files.keys()].filter(p=>p.startsWith('objects/')).map(p=>({name:p.slice(8)})),error:null}),remove:async paths=>{paths.forEach(p=>files.delete(p));return {error:null};}};
}
test('Edge storage publishes immutable objects before a manifest and retains valid failed data',async()=>{
 const {Store}=await import('../supabase/functions/environment-refresh/storage-store.mjs'),b=bucket(),store=await new Store(b,new Date('2026-10-25T00:00:00Z')).init();
 await store.put('air-main',{value:0},3600,'2026-10-25T07:00:00+07:00');const prior={...store.manifest.resources['air-main']};
 store.fail('air-main',{kind:'quota',status:429},3600);await store.save();
 assert.equal(store.manifest.resources['air-main'].path,prior.path);assert.equal(store.manifest.resources['air-main'].lastSuccess,prior.lastSuccess);assert.deepEqual(await store.old('air-main'),{value:0});assert.equal(b.writes.at(-1),'manifest.json');
});
test('Edge cleanup retains an object for 48 hours after it becomes unreferenced',async()=>{
 const {Store}=await import('../supabase/functions/environment-refresh/storage-store.mjs'),b=bucket(),now=new Date('2026-10-25T00:00:00Z'),store=await new Store(b,now).init(),old='objects/'+'a'.repeat(64)+'.json';b.files.set(old,'{}');
 await store.save();assert.equal(store.manifest.unreferencedSince[old],now.toISOString());assert.ok(b.files.has(old));
 const next=await new Store(b,new Date(+now+49*3600000)).init();await next.save();assert.equal(b.files.has(old),false);
});
test('portable Edge collector handles all resources using storage without a filesystem',async()=>{
 const {refreshData}=await import('../supabase/functions/environment-refresh/collector.mjs'),{wibTime}=await import('../supabase/functions/environment-refresh/validation.mjs'),b=bucket(),now=new Date('2026-10-25T00:00:00Z'),stamp=wibTime(now),future=wibTime(new Date(+now+3600000));
 const model=()=>({utc_offset_seconds:25200,latitude:-2.75,longitude:114.25,current:{time:stamp+':00',wind_speed_10m:3,wind_direction_10m:90,cloud_cover:50},hourly:{time:[stamp,future],pm2_5:[0,1],us_aqi:[0,1],visibility:[1000,2000],precipitation:[0,1],precipitation_probability:[0,50]}});
 const calls=[];
 const m=await refreshData({output:b,now,fetcher:async url=>{calls.push(url);const u=new URL(url);let j;if(u.pathname.endsWith('/index.json'))j={hotspot:['2026-10-25'],diperbarui:now.toISOString()};else if(u.pathname.includes('/ringkasan/'))j={'2026-10-25':{kab:{'Pulang Pisau':0}}};else if(u.hostname.includes('open-meteo')){const n=u.searchParams.get('latitude').split(',').length;j=n===1?model():Array.from({length:n},model);}else j={generated_at:now.toISOString(),data:{features:[]}};return {ok:true,status:200,json:async()=>j};}});
 assert.ok(Object.values(m.resources).every(e=>e.path&&!e.error));assert.equal((await b.download(m.resources['air-villages'].path)).error,null);assert.equal(JSON.parse(b.files.get(m.resources['air-villages'].path)).points.length,99);assert.equal(m.resources['weather-main'].sourceTime,stamp+':00+07:00');assert.ok(calls.some(u=>u.includes('hotspot_high2')));
});
