const {test}=require('node:test'),assert=require('node:assert/strict');
const {visibilityInfo,updateText}=require('../weather-ui.js');
test('visibility uses meters at 400m and moves category at scale boundaries',()=>{const low=visibilityInfo(400);assert.equal(low.value,400);assert.equal(low.unit,'m');assert.equal(low.label,'Sangat buruk');assert.equal(low.position,8);assert.equal(visibilityInfo(1000).label,'Buruk');assert.equal(visibilityInfo(2000).label,'Terbatas');assert.equal(visibilityInfo(5000).label,'Cukup baik');assert.equal(visibilityInfo(10000).label,'Baik');assert.equal(visibilityInfo(50000).position,100);assert.equal(visibilityInfo(null),null);assert.equal(visibilityInfo(-1),null);});
test('update label uses the supplied source timestamp in WIB and never invents missing time',()=>{assert.equal(updateText('2026-10-23T23:30:00Z'),'Pembaruan terakhir 24 Okt 2026 pukul 06.30 WIB');assert.equal(updateText(null),'Pembaruan terakhir belum tersedia');});

const {visibilityAt}=require('../weather-ui.js');
test('village visibility uses the latest elapsed hour and preserves missing values',()=>{const d={hourly:{time:['2026-10-24T08:00','2026-10-24T09:00','2026-10-24T10:00'],visibility:[400,null,15000]}};assert.equal(visibilityAt(d,Date.parse('2026-10-24T08:30:00+07:00')).meters,400);assert.equal(visibilityAt(d,Date.parse('2026-10-24T09:30:00+07:00')),null);assert.equal(visibilityAt(d,Date.parse('2026-10-24T07:30:00+07:00')),null);});

const {generalUpdateText}=require('../weather-ui.js');
test('general update shows WIB date on its own line and age of the saved data',()=>{const t='2026-10-24T12:21:00Z';assert.equal(generalUpdateText(t,Date.parse(t)+2*3600000),'Pembaruan terakhir :\n24 Okt 2026 pukul 19.21 WIB\n(sekitar 2 jam yang lalu)');assert.equal(generalUpdateText(null),'Pembaruan terakhir :\nBelum tersedia');assert.match(generalUpdateText(t,Date.parse(t)-1000),/kurang dari 1 menit/);});
