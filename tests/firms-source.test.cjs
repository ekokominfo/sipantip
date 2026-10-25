const {test}=require('node:test'),assert=require('node:assert/strict'),s=require('../firms-source.js');
const now=new Date('2026-10-25T05:00:00Z');
const square=(a,b,c,d)=>({type:'Polygon',coordinates:[[[a,b],[c,b],[c,d],[a,d],[a,b]]]});
const geo={regencies:Array.from({length:14},(_,i)=>({properties:{name:i?'Other '+i:'Pulang Pisau'},geometry:square(i?120+i:113,-4,i?120.5+i:115,0)})),districts:[{properties:{NAMA_KEC:'Kahayan Hilir'},geometry:square(113,-4,115,0)}],villages:[{properties:{NAMA_KEL:'Test',NAMA_KEC:'Kahayan Hilir'},geometry:square(114,-3,114.5,-2.5)}]};
const header='latitude,longitude,acq_date,acq_time,satellite,confidence\n';
const files=rows=>[...rows,...Array(Math.max(0,4-rows.length)).fill('')].map(csv=>({csv:header+csv,modifiedAt:now.toISOString()}));
test('FIRMS UTC times, sensor confidence thresholds, spatial joins and exact duplicate suppression',()=>{const f=s.normalize(files(['-2.75,114.25,2026-10-25,0030,T,30\n-2.75,114.25,2026-10-25,0030,T,30','-2.75,114.25,2026-10-25,0100,N,high','-2.75,114.25,2026-10-25,0200,N20,low']),geo,now);assert.equal(f.Medium.data.features.length,1);assert.equal(f.High.data.features.length,1);assert.equal(f.Low.data.features.length,1);const p=f.Medium.data.features[0].properties;assert.equal(p.date_hotspot,'2026-10-25 07:30:00');assert.equal(p.desa,'Test');assert.equal(p.kabupaten,'Pulang Pisau');assert.equal(f.Medium.source,'NASA FIRMS');assert.equal(f.Medium.latest_detection,'2026-10-25T00:30:00.000Z');});
test('FIRMS rejects malformed, stale, future or incomplete sources instead of publishing zero',()=>{const good=files(['','','']);assert.throws(()=>s.normalize(good.slice(0,2),geo,now));assert.throws(()=>s.normalize(good.map(f=>({...f,modifiedAt:'2020-01-01'})),geo,now));assert.throws(()=>s.normalize(files(['-2.75,114.25,2026-10-26,0030,T,80','','']),geo,now));assert.throws(()=>s.normalize(files(['-2.75,114.25,2026-10-25,0060,T,80','','']),geo,now));assert.throws(()=>s.normalize(files(['-2.75,114.25,2026-10-25,0030,T,101','','']),geo,now));assert.throws(()=>s.normalize(files(['','-2.75,114.25,2026-10-25,0030,N,bad','']),geo,now));assert.equal(s.normalize(good,geo,now).High.data.features.length,0);});
test('FIRMS retains unassigned villages, excludes outside regions and ignores detections beyond 48 hours',()=>{const f=s.normalize(files(['-3.5,113.5,2026-10-25,0030,T,80\n-8,100,2026-10-25,0030,T,80\n-2.75,114.25,2026-10-22,0030,T,80','','']),geo,now);assert.equal(f.High.data.features.length,1);assert.equal(f.High.data.features[0].properties.desa,'Tidak diketahui');assert.equal(f.High.data.features[0].properties.kecamatan,'Kahayan Hilir');assert.equal(s.recentArchive(f,now)['2026-10-25'].kab['Pulang Pisau'],1);});
test('polygon holes and multi-polygons are respected during coordinate classification',()=>{const g=square(0,0,10,10);g.coordinates.push(square(2,2,4,4).coordinates[0]);assert.equal(s.contains(g,3,3),false);assert.equal(s.contains(g,5,5),true);assert.equal(s.contains({type:'MultiPolygon',coordinates:[square(20,20,21,21).coordinates,g.coordinates]},20.5,20.5),true);});
test('one failed FIRMS dataset preserves every previously valid feed and archive',async()=>{const {collectFIRMS}=require('../scripts/firms-collection.cjs'),failed=[];await collectFIRMS({due:()=>true,fail:(k)=>failed.push(k),put:()=>assert.fail('must not overwrite'),manifest:{resources:{}}},async()=>({ok:false,status:503}),geo,now,false);assert.deepEqual(failed,['hotspot-High','hotspot-Medium','hotspot-Low','archive-index']);});

test('NOAA-21 is included with sensor identity, VIIRS confidence and independent overpasses',()=>{
 const row='-2.75,114.25,2026-10-25,0200,';
 const f=s.normalize(files(['','',row+'N20,high',row+'N21,high\n'+row+'N21,high']),geo,now);
 assert.deepEqual(f.High.data.features.map(f=>f.properties.satelit),['NASA-NOAA20','NASA-NOAA21']);
 assert.equal(f.High.data.features[1].properties.confidence_raw,'high');
 assert.equal(s.recentArchive(f,now)['2026-10-25'].kab['Pulang Pisau'],2);
 for(const [confidence,level]of [['low','Low'],['nominal','Medium'],['high','High']])assert.equal(s.normalize(files(['','','',row+'NOAA-21,'+confidence]),geo,now)[level].data.features.length,1);
 assert.throws(()=>s.normalize(files(['','','',row+'N20,high']),geo,now));
 assert.throws(()=>s.normalize(files(['','','']).slice(0,3),geo,now));
});

test('NOAA-21 fetch failure preserves all feeds instead of silently dropping a satellite',async()=>{
 const {collectFIRMS}=require('../scripts/firms-collection.cjs'),failed=[],requests=[];
 await collectFIRMS({due:()=>true,fail:key=>failed.push(key),put:()=>assert.fail('must retain previous cache'),manifest:{resources:{}}},async url=>{requests.push(url);return url.includes('noaa-21')?{ok:false,status:503}:{ok:true,text:async()=>header,headers:{get:()=>now.toISOString()}};},geo,now,false);
 assert.equal(requests.length,5);assert.equal(failed.length,4);assert.ok(failed.includes('hotspot-High'));
});

test('official primary mirror recovers timeouts without bypassing quotas or validation',async()=>{
 const calls=[];const result=await s.load(async url=>{calls.push(url);if(url.includes('firms2')&&url.includes('noaa-21'))throw new DOMException('timed out','TimeoutError');return {ok:true,text:async()=>header+(url.includes('noaa-21')?'-2.75,114.25,2026-10-25,0200,N21,high':''),headers:{get:()=>now.toISOString()}};},geo,now);
 assert.equal(calls.length,5);assert.ok(calls.some(u=>u.includes('https://firms.modaps')&&u.includes('noaa-21')));assert.equal(result.High.data.features[0].properties.satelit,'NASA-NOAA21');
 const quota=[];await assert.rejects(s.load(async url=>{quota.push(url);return {ok:false,status:429};},geo,now),e=>e.kind==='quota');assert.equal(quota.length,4);
 await assert.rejects(s.load(async()=>({ok:true,text:async()=>header,headers:{get:()=>new Date(+now-7*3600000).toISOString()}}),geo,now),e=>e.kind==='invalid');
});
