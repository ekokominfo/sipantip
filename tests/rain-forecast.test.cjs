const {test}=require('node:test'),assert=require('node:assert/strict');
const {rows,summary}=require('../rain-forecast.js'),{validate}=require('../scripts/rain-core.cjs');
const now=new Date('2026-10-24T16:30:00Z');
function data(){return {utc_offset_seconds:25200,hourly:{time:['2026-10-24T23:00','2026-10-25T00:00','2026-10-25T01:00'],visibility:[10000,null,500],precipitation:[0,null,1],precipitation_probability:[0,null,60]}};}
test('forecast crosses WIB midnight and excludes elapsed intervals',()=>{const r=rows(data(),+now);assert.equal(r.length,2);assert.equal(r[0].amount,null);assert.equal(summary(r).peak,60);assert.equal(summary(r).complete,false);assert.equal(summary(r).wet.time,'2026-10-25T01:00');});
test('missing and invalid values do not become dry weather or zero probability',()=>{const d=data();d.hourly.precipitation_probability=[0,null,101];d.hourly.precipitation=[0,null,-1];const s=summary(rows(d,+now));assert.equal(s.peak,null);assert.equal(s.wet,undefined);assert.throws(()=>validate(d,now));});
test('collector preserves future hours and rejects expired forecasts',()=>{assert.equal(validate(data(),now).hourly.time.length,3);assert.throws(()=>validate(data(),new Date('2026-10-26')));assert.equal(rows(data(),Date.parse('2026-10-26')).length,0);});
const {hourlyRows,detectionStamp}=require('../rain-forecast.js');
test('hourly chart aligns WIB midnight and never predicts future hotspot counts',()=>{const r=hourlyRows(data(),[{when:'2026-10-24 23:00 WIB'},{when:'2026-10-24 22:59 WIB'}],{now:+now,loaded:true});assert.equal(r.length,24);const completed=r.find(x=>x.end===Date.parse('2026-10-24T23:00:00+07:00'));assert.equal(completed.hotspots,1);const next=hourlyRows(data(),[],{now:+now,loaded:true,future:true});assert.equal(next.length,24);assert.ok(next.every(x=>x.future&&x.hotspots===null));const pending=next.find(x=>x.end===Date.parse('2026-10-25T00:00:00+07:00'));assert.equal(pending.hotspots,null);assert.equal(pending.amount,null);assert.ok(r.every(x=>!x.future));assert.equal(detectionStamp('2026-10-24 22:59 WIB'),Date.parse('2026-10-24T22:59:00+07:00'));});
test('hourly chart distinguishes observed zero, unavailable feed and uncovered time',()=>{const healthy=hourlyRows(data(),[],{now:+now,loaded:true});assert.equal(healthy.find(x=>x.end===Date.parse('2026-10-24T23:00:00+07:00')).hotspots,0);assert.ok(hourlyRows(data(),[],{now:+now,loaded:false}).every(x=>x.hotspots===null));const old=hourlyRows(data(),[],{now:+now,loaded:true,coverageEnd:+now-4*3600000});assert.equal(old.find(x=>x.end===Date.parse('2026-10-24T23:00:00+07:00')).hotspots,null);});
const {rainBrief}=require('../rain-forecast.js');
test('forecast card excludes elapsed rain and preserves missing totals',()=>{const brief=rainBrief(data(),+now);assert.equal(brief.peak,60);assert.equal(brief.total,null);assert.equal(brief.wet.time,'2026-10-25T01:00');const expired=rainBrief(data(),Date.parse('2026-10-26'));assert.equal(expired.peak,null);assert.equal(expired.complete,false);});
test('future peak retains its time while the past chart remains a separate period',()=>{const clock=Date.parse('2026-10-25T03:30:00Z'),d={hourly:{time:['2026-10-25T10:00','2026-10-25T11:00','2026-10-25T12:00','2026-10-25T18:00'],precipitation_probability:[47,25,100,60],precipitation:[0,0,1,0]}};const brief=rainBrief(d,clock);assert.equal(brief.peak,100);assert.equal(brief.peakAt.time,'2026-10-25T12:00');const past=hourlyRows(d,[],{now:clock,loaded:true});assert.equal(past.at(-1).probability,47);assert.ok(past.every(r=>r.end<=clock));});

test('hotspot-only chart retains hourly counts and gaps without any rain series, percentages or tooltip values',()=>{const {hotspotSVG}=require('../rain-forecast.js'),list=hourlyRows(data(),[{when:'2026-10-24 22:59 WIB'}],{now:+now,loaded:true,coverageEnd:+now-4*3600000}),svg=hotspotSVG(list,360);assert.match(svg,/Titik panas: 1/);assert.match(svg,/Titik panas: Belum tersedia/);assert.match(svg,/stroke="#c4414d"/);assert.doesNotMatch(svg,/hujan|probability|%|#2563b6/);assert.equal((svg.match(/data-tooltip=/g)||[]).length,24);});

test('restored rain graph matches the future card peak and never plots millimetres',()=>{
 const {rainSVG}=require('../rain-forecast.js'),clock=Date.parse('2026-10-25T03:30:00Z'),d={hourly:{time:['2026-10-25T10:00','2026-10-25T11:00','2026-10-25T12:00','2026-10-25T18:00'],precipitation_probability:[47,25,100,60],precipitation:[0,0,1.5,0]}};
 const list=hourlyRows(d,[],{now:clock,future:true}),svg=rainSVG(list,360);
 assert.equal(Math.max(...list.map(r=>r.probability??-1)),rainBrief(d,clock).peak);
 assert.match(svg,/Peluang hujan: 100%/);assert.match(svg,/Peluang hujan: Belum tersedia/);assert.doesNotMatch(svg,/1\.5|mm|Titik panas|#c4414d/);assert.equal((svg.match(/data-tooltip=/g)||[]).length,24);
 assert.equal(list[0].end,Date.parse('2026-10-25T11:00:00+07:00'));
});
test('rain header validates the kelurahan reference and cannot fall back to another location',()=>{
 const {headerRainForecast}=require('../rain-forecast.js'),point={key:'kahayanhilir|pulangpisau',lat:-2.751345,lon:114.2608442894562,...data()};
 assert.equal(headerRainForecast({points:[point]}),point);assert.equal(headerRainForecast({points:[{...point,lon:114.25}]}),null);assert.equal(headerRainForecast({points:[{...point,key:'other'}]}),null);assert.equal(headerRainForecast(null),null);
});

test('combined chart uses actual hours, separate units and no future hotspot predictions',()=>{
 const {combinedSVG}=require('../rain-forecast.js'),clock=Date.parse('2026-10-25T03:30:00Z'),d={hourly:{time:['2026-10-25T10:00','2026-10-25T11:00','2026-10-25T12:00'],precipitation_probability:[47,25,80],precipitation:[1.5,0,1.5]}};
 const past=hourlyRows(d,[{when:'2026-10-25 09:59 WIB'}],{now:clock,loaded:true}),future=hourlyRows(d,[],{now:clock,future:true}),list=past.concat(future),svg=combinedSVG(list,360,clock);
 assert.equal(list.length,48);assert.ok(list.every((r,i)=>!i||r.end-list[i-1].end===3600000));assert.ok(future.every(r=>r.hotspots===null));
 assert.match(svg,/Peluang hujan model: 47% · Titik panas: 1/);assert.match(svg,/Prakiraan peluang hujan: 80% · Titik panas: Belum tersedia \(waktu mendatang\)/);assert.match(svg,/deteksi\/jam/);assert.match(svg,/100%/);assert.doesNotMatch(svg,/\bmm\b|Prakiraan peluang hujan:[^"<>]*Titik panas: 0/);assert.equal((svg.match(/data-tooltip=/g)||[]).length,48);
 assert.equal(Math.max(...future.map(r=>r.probability??-1)),rainBrief(d,clock).peak);
});
