const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(){const els={hotspotDataTime:{textContent:''},hotspotDataWarning:{hidden:true}},ctx={state:{raw:[]},$:id=>els[id],document:{addEventListener(){}},detectionTime:s=>Date.parse(s.replace(' WIB','+07:00').replace(' ','T'))};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../dashboard.js'),'utf8'),ctx);return {ctx,els};}
test('hotspot age uses newest Pulang Pisau detection and warns only after six hours',()=>{const {ctx,els}=setup(),latest=Date.parse('2026-10-24T19:45:00Z');ctx.state.raw=[{when:'2026-10-25 01:00 WIB'},{when:'2026-10-25 02:45 WIB'}];ctx.updateHotspotCard(latest+11*3600000);assert.match(els.hotspotDataTime.textContent,/2026-10-25 02:45 WIB \(sekitar 11 jam lalu\)/);assert.equal(els.hotspotDataWarning.hidden,false);ctx.updateHotspotCard(latest+6*3600000);assert.equal(els.hotspotDataWarning.hidden,true);ctx.updateHotspotCard(latest+6*3600000+1);assert.equal(els.hotspotDataWarning.hidden,false);ctx.state.raw.push({when:'2026-10-25 13:45 WIB'});ctx.updateHotspotCard(latest+11*3600000);assert.equal(els.hotspotDataWarning.hidden,true);assert.match(els.hotspotDataTime.textContent,/kurang dari 1 jam lalu/);});
test('missing or invalid detection time cannot invent age or source warning',()=>{const {ctx,els}=setup();ctx.state.raw=[{when:'invalid'}];ctx.updateHotspotCard();assert.equal(els.hotspotDataTime.textContent,'Waktu deteksi terbaru belum tersedia');assert.equal(els.hotspotDataWarning.hidden,true);});

test('compact mobile time keeps the complete WIB timestamp in its accessible label',()=>{
 const {ctx,els}=setup();els.hotspotDataTimeCompact={setAttribute(k,v){this[k]=v;}};ctx.state.raw=[{when:'2026-10-26 00:13 WIB'}];ctx.updateHotspotCard(Date.parse('2026-10-26T04:20:00+07:00'));
 assert.equal(els.hotspotDataTimeCompact.textContent,'00.13 WIB · 4 jam lalu');assert.equal(els.hotspotDataTimeCompact['aria-label'],els.hotspotDataTime.textContent);
 ctx.state.raw=[];ctx.updateHotspotCard();assert.equal(els.hotspotDataTimeCompact.textContent,'Waktu belum tersedia');
});

test('old detections with successful retrieval never claim a source failure',()=>{
 const {ctx,els}=setup();ctx.CachedData={status:()=>({transportError:false,items:[{error:null}]})};ctx.state.raw=[{when:'2026-10-25 02:45 WIB'}];
 ctx.updateHotspotCard(Date.parse('2026-10-25T12:00:00Z'));
 assert.equal(els.hotspotDataWarning.hidden,false);assert.equal(els.hotspotDataWarning.textContent,'Belum ada deteksi titik panas terbaru dari satelit.');
});
test('actual source failures warn even with recent or missing detections, and recover',()=>{
 const {ctx,els}=setup(),status={items:[{error:'network'}]};ctx.CachedData={status:()=>status};
 ctx.updateHotspotCard();assert.equal(els.hotspotDataWarning.hidden,false);assert.equal(els.hotspotDataWarning.textContent,'Penarikan data dari sumber sedang mengalami masalah.');
 status.items[0].error=null;ctx.updateHotspotCard();assert.equal(els.hotspotDataWarning.hidden,true);
 status.transportError=true;ctx.updateHotspotCard();assert.equal(els.hotspotDataWarning.hidden,false);assert.match(els.hotspotDataWarning.textContent,/Koneksi ke data titik panas terganggu/);
 status.transportError=false;ctx.state.raw=[{when:'2026-10-25 02:45 WIB'}];ctx.updateHotspotCard(Date.parse('2026-10-25T03:00:00+07:00'));assert.equal(els.hotspotDataWarning.hidden,true);
});
